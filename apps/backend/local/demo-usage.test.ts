import { expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import {
  DemoLimit,
  HostedDemoUsage,
  canonicalDemoIp,
  demoLedgerSchema,
  type DemoUsageStore,
} from "./demo-usage.ts";
import { demoUsageFixture } from "../../../test/demo-usage-fixture.ts";
import {
  HOSTED_DEMO_POLICY,
  limitHostedDemoInputs,
} from "../../../packages/contracts/local/hosted-editing.ts";

it("shares three slots, preserving manual priority without mutating requests", () => {
  for (let manual = 0; manual <= 10; manual++)
    for (let ai = 1; ai <= 10; ai++) {
      const inputs = {
        sourceRevision: 0,
        policyRevision: 0,
        manualOnly: false,
        aiCount: ai,
        aiDuration: { minMs: 10000, maxMs: 60000 },
        ranges: Array.from({ length: manual }, (_, i) => ({
          id: randomUUID(),
          startMs: i * 1000,
          endMs: (i + 1) * 1000,
        })),
      };
      const result = limitHostedDemoInputs(inputs);
      expect(
        result.ranges.length + (result.manualOnly ? 0 : result.aiCount!),
      ).toBeLessThanOrEqual(3);
      expect(result.ranges).toEqual(inputs.ranges.slice(0, 3));
      expect(inputs.ranges).toHaveLength(manual);
      expect(inputs.aiCount).toBe(ai);
    }
});
it("atomically reserves one network across concurrent instances and restart, then consumes on export", async () => {
  let now = 1000;
  const { store, usage } = demoUsageFixture(() => now),
    identity = usage.identity("192.0.2.1");
  const other = new HostedDemoUsage(
    store,
    "synthetic-demo-key".repeat(4),
    () => now,
  );
  const a = randomUUID(),
    b = randomUUID();
  const results = await Promise.allSettled([
    usage.reserve(identity, a, 5000),
    other.reserve(identity, b, 5000),
  ]);
  expect(
    results.filter((result) => result.status === "fulfilled"),
  ).toHaveLength(1);
  expect(results.find((result) => result.status === "rejected")).toMatchObject({
    reason: expect.any(DemoLimit),
  });
  const id = demoLedgerSchema.parse((await store.read()).value).leases[0]!.id;
  await usage.charge(id, "provider");
  await usage.charge(id, "native");
  await usage.complete(id);
  const completed = await store.read();
  expect(JSON.stringify(completed.value)).not.toContain("192.0.2.1");
  now = 7000;
  expect(await other.status(identity.network, false)).toEqual({
    limited: true,
    retryAt: 1000 + HOSTED_DEMO_POLICY.cooldownMs,
  });
  await expect(other.charge(id, "native")).rejects.toThrow(
    "demo_session_expired",
  );
  now = 1000 + HOSTED_DEMO_POLICY.cooldownMs + 1;
  expect((await other.status(identity.network, false)).limited).toBe(false);
  await other.reserve(identity, randomUUID(), 5000);
});
it("releases failed/abandoned reservations only after expiry and never refunds dispatches", async () => {
  let now = 1000;
  const { usage, store } = demoUsageFixture(() => now);
  const identity = usage.identity("192.0.2.8"),
    id = randomUUID();
  await usage.reserve(identity, id, 5000);
  await usage.charge(id, "provider");
  now = 5999;
  await expect(
    usage.reserve(identity, randomUUID(), 5000),
  ).rejects.toBeInstanceOf(DemoLimit);
  now = 6000;
  await usage.reserve(identity, randomUUID(), 5000);
  expect((await store.read()).value).toMatchObject({
    provider: 1,
    sessions: 2,
  });
});
it("canonicalizes mapped IPv4/IPv6 and shares IPv6 privacy addresses within a /64", () => {
  const { usage } = demoUsageFixture();
  expect(canonicalDemoIp("::ffff:192.0.2.1")).toBe("192.0.2.1");
  expect(usage.identity("::ffff:c000:201")).toEqual(
    usage.identity("192.0.2.1"),
  );
  expect(usage.identity("2001:db8:1:2::1")).toEqual(
    usage.identity("2001:0db8:0001:0002::abcd"),
  );
  expect(usage.identity("2001:db8:1:3::1")).not.toEqual(
    usage.identity("2001:db8:1:2::1"),
  );
  for (const ip of ["", "unknown", "192.0.2.1:4000", "192.0.2.1, 192.0.2.2"])
    expect(() => usage.identity(ip)).toThrow();
});
it("allowlists exact canonical IPs but retains durable global caps including concurrent charges", async () => {
  const { usage, store } = demoUsageFixture(() => 1000, ["::ffff:192.0.2.1"]),
    identity = usage.identity("192.0.2.1");
  expect(identity.exempt).toBe(true);
  expect(usage.identity("192.0.2.2").exempt).toBe(false);
  const a = randomUUID(),
    b = randomUUID();
  await usage.reserve(identity, a, 5000);
  await usage.complete(a);
  expect((await usage.status(identity.network, true)).limited).toBe(false);
  await usage.reserve(identity, b, 5000);
  const current = await store.read(),
    state = demoLedgerSchema.parse(current.value);
  state.provider = 99;
  await store.write(current.generation, state);
  const results = await Promise.allSettled([
    usage.charge(a, "provider"),
    usage.charge(b, "provider"),
  ]);
  expect(
    results.filter((result) => result.status === "fulfilled"),
  ).toHaveLength(1);
  expect((await store.read()).value).toMatchObject({ provider: 100 });
  await expect(
    usage.reserve(identity, randomUUID(), 5000),
  ).rejects.toBeInstanceOf(DemoLimit);
});
it("bounds native dispatches/session starts independently and resets global counters at UTC day change", async () => {
  let now = 1000;
  const { usage, store } = demoUsageFixture(() => now),
    identity = usage.identity("192.0.2.3"),
    id = randomUUID();
  await usage.reserve(identity, id, 7_200_000);
  let current = await store.read(),
    state = demoLedgerSchema.parse(current.value);
  state.native = 200;
  await store.write(current.generation, state);
  await expect(usage.charge(id, "native")).rejects.toBeInstanceOf(DemoLimit);
  current = await store.read();
  state = demoLedgerSchema.parse(current.value);
  state.native = 0;
  state.sessions = 20;
  await store.write(current.generation, state);
  await expect(
    usage.reserve(usage.identity("192.0.2.4"), randomUUID(), 5000),
  ).rejects.toBeInstanceOf(DemoLimit);
  now = 86_400_000;
  await usage.reserve(identity, randomUUID(), 5000);
  expect((await store.read()).value).toMatchObject({
    day: 1,
    sessions: 1,
    native: 0,
    provider: 0,
  });
});
it("fails closed on missing/corrupt/contended storage with no ephemeral fallback", async () => {
  const { store } = demoUsageFixture(() => 1000);
  for (const broken of [
    {
      read: async () => {
        throw new Error("offline");
      },
      write: store.write,
    },
    { read: async () => ({ generation: "1", value: {} }), write: store.write },
    { read: store.read, write: async () => false },
  ] satisfies DemoUsageStore[]) {
    const usage = new HostedDemoUsage(
      broken,
      "synthetic-key".repeat(4),
      () => 1000,
    );
    await expect(
      usage.reserve(usage.identity("192.0.2.1"), randomUUID(), 5000),
    ).rejects.toThrow();
  }
});

it("uses only the injected backend environment owner list, with no source-code fallback", async () => {
  const { loadConfig } = await import("../src/config/loadConfig.js");
  const config = loadConfig({
    NODE_ENV: "test",
    FAKE_MODE: "true",
    PAID_DEMO_ENABLED: "false",
    HOSTED_DEMO_OWNER_IPS: "192.0.2.10,2001:db8::a",
  });
  const { usage, store } = demoUsageFixture(
    () => 1000,
    config.admission.demoOwnerIps,
  );
  expect(usage.identity("::ffff:192.0.2.10").exempt).toBe(true);
  expect(usage.identity("2001:0db8:0000::a").exempt).toBe(true);
  expect(usage.identity("2001:db8::b").exempt).toBe(false);
  expect(usage.identity("192.0.2.11").exempt).toBe(false);
  const empty = new HostedDemoUsage(
    store,
    "synthetic-demo-key".repeat(4),
    () => 1000,
  );
  expect(empty.identity("192.0.2.10").exempt).toBe(false);
});
