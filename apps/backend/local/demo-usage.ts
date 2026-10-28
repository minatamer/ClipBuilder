import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { z } from "zod";
import { HOSTED_DEMO_POLICY } from "../../../packages/contracts/local/hosted-editing.ts";

const count = z.number().int().nonnegative().max(1_000_000);
const instant = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const demoLedgerSchema = z
  .object({
    version: z.literal(1),
    day: count,
    sessions: count,
    provider: count,
    native: count,
    leases: z
      .array(
        z
          .object({
            id: z.uuid(),
            network: z.string().regex(/^[a-f0-9]{64}$/u),
            expires: instant,
            usedUntil: instant.nullable(),
            exempt: z.boolean(),
          })
          .strict(),
      )
      .max(100),
  })
  .strict();
export type DemoLedger = z.infer<typeof demoLedgerSchema>;
export interface DemoUsageStore {
  read(): Promise<{ generation: string; value: unknown }>;
  write(generation: string, value: DemoLedger): Promise<boolean>;
}
export class DemoLimit extends Error {
  constructor(readonly retryAt: number) {
    super("demo_limit_reached");
  }
}
export function canonicalDemoIp(value: string): string {
  if (!isIP(value)) throw new Error("demo_identity_unavailable");
  const canonical =
    isIP(value) === 6
      ? new URL(`http://[${value}]/`).hostname.slice(1, -1)
      : value;
  const mapped = /^::ffff:([a-f0-9]{1,4}):([a-f0-9]{1,4})$/u.exec(canonical);
  if (mapped) {
    const a = parseInt(mapped[1]!, 16),
      b = parseInt(mapped[2]!, 16);
    return `${a >> 8}.${a & 255}.${b >> 8}.${b & 255}`;
  }
  return canonical;
}
function networkIp(ip: string) {
  if (isIP(ip) !== 6) return ip;
  const [left, right = ""] = ip.split("::");
  const a = left ? left.split(":") : [],
    b = right ? right.split(":") : [];
  const groups = ip.includes("::")
    ? [...a, ...Array<string>(8 - a.length - b.length).fill("0"), ...b]
    : a;
  return (
    groups
      .slice(0, 4)
      .map((group) => parseInt(group, 16).toString(16).padStart(4, "0"))
      .join(":") + "::/64"
  );
}
/** All state changes compare generations; no process-local fallback exists. */
export class HostedDemoUsage {
  constructor(
    private readonly store: DemoUsageStore,
    private readonly secret: string,
    private readonly now = Date.now,
    private readonly allowlist: readonly string[] = [],
  ) {
    if (secret.length < 32) throw new Error("demo_identity_key_unavailable");
    for (const ip of allowlist) canonicalDemoIp(ip);
  }
  identity(value: string) {
    const ip = canonicalDemoIp(value);
    return {
      network: createHmac("sha256", this.secret)
        .update("demo-network-v1:" + networkIp(ip))
        .digest("hex"),
      exempt: this.allowlist.some((item) => canonicalDemoIp(item) === ip),
    };
  }
  private parse(value: unknown) {
    const state = demoLedgerSchema.parse(value);
    if (
      new Set(state.leases.map((lease) => lease.id)).size !==
      state.leases.length
    )
      throw new Error("demo_ledger_invalid");
    return state;
  }
  async status(network: string, exempt: boolean) {
    const state = this.parse((await this.store.read()).value);
    const day = Math.floor(this.now() / 86_400_000);
    if (state.day > day) throw new Error("demo_clock_invalid");
    const personal = exempt
      ? 0
      : Math.max(
          0,
          ...state.leases
            .filter((lease) => lease.network === network)
            .map((lease) => Math.max(lease.expires, lease.usedUntil ?? 0)),
        );
    const global =
      state.day === day &&
      (state.sessions >= HOSTED_DEMO_POLICY.dailySessions ||
        state.provider >= HOSTED_DEMO_POLICY.dailyProviderCalls ||
        state.native >= HOSTED_DEMO_POLICY.dailyNativeCalls)
        ? (day + 1) * 86_400_000
        : 0;
    const retryAt = Math.max(personal, global);
    return {
      limited: retryAt > this.now(),
      retryAt: retryAt > this.now() ? retryAt : null,
    };
  }
  private async change(update: (state: DemoLedger) => void) {
    for (let attempt = 0; attempt < 4; attempt++) {
      const current = await this.store.read(),
        state = this.parse(current.value);
      const day = Math.floor(this.now() / 86_400_000);
      if (state.day > day) throw new Error("demo_clock_invalid");
      if (state.day !== day)
        Object.assign(state, { day, sessions: 0, provider: 0, native: 0 });
      state.leases = state.leases.filter(
        (lease) => Math.max(lease.expires, lease.usedUntil ?? 0) > this.now(),
      );
      update(state);
      if (
        await this.store.write(
          current.generation,
          demoLedgerSchema.parse(state),
        )
      )
        return;
    }
    throw new Error("demo_ledger_busy");
  }
  async reserve(
    identity: ReturnType<HostedDemoUsage["identity"]>,
    id: string,
    ttlMs: number,
  ) {
    await this.change((state) => {
      const existing = state.leases.find(
        (lease) => lease.network === identity.network,
      );
      if (existing && !identity.exempt)
        throw new DemoLimit(
          Math.max(existing.expires, existing.usedUntil ?? 0),
        );
      if (
        state.sessions >= HOSTED_DEMO_POLICY.dailySessions ||
        state.provider >= HOSTED_DEMO_POLICY.dailyProviderCalls ||
        state.native >= HOSTED_DEMO_POLICY.dailyNativeCalls
      )
        throw new DemoLimit((state.day + 1) * 86_400_000);
      if (ttlMs <= 0 || ttlMs > 7_200_000)
        throw new Error("demo_lease_invalid");
      state.sessions++;
      state.leases.push({
        id,
        ...identity,
        expires: this.now() + ttlMs,
        usedUntil: null,
      });
    });
  }
  async charge(id: string, kind: "provider" | "native") {
    await this.change((state) => {
      const lease = state.leases.find((item) => item.id === id);
      if (!lease || lease.expires <= this.now())
        throw new Error("demo_session_expired");
      const ceiling =
        kind === "provider"
          ? HOSTED_DEMO_POLICY.dailyProviderCalls
          : HOSTED_DEMO_POLICY.dailyNativeCalls;
      if (state[kind] >= ceiling)
        throw new DemoLimit((state.day + 1) * 86_400_000);
      state[kind]++;
    });
  }
  async complete(id: string) {
    await this.change((state) => {
      const lease = state.leases.find((item) => item.id === id);
      if (!lease || lease.expires <= this.now())
        throw new Error("demo_session_expired");
      lease.usedUntil ??= this.now() + HOSTED_DEMO_POLICY.cooldownMs;
    });
  }
}
