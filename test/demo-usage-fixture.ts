import {
  HostedDemoUsage,
  type DemoLedger,
  type DemoUsageStore,
} from "../apps/backend/local/demo-usage.ts";
/** Synthetic store only. Production composition has no in-memory fallback. */
export function demoUsageFixture(
  now: () => number = Date.now,
  allowlist: readonly string[] = [],
) {
  let generation = 1;
  let value: DemoLedger = {
    version: 1,
    day: Math.floor(now() / 86_400_000),
    sessions: 0,
    provider: 0,
    native: 0,
    leases: [],
  };
  const store: DemoUsageStore = {
    async read() {
      return { generation: String(generation), value: structuredClone(value) };
    },
    async write(expected, next) {
      if (expected !== String(generation)) return false;
      value = structuredClone(next);
      generation++;
      return true;
    },
  };
  return {
    store,
    usage: new HostedDemoUsage(
      store,
      "synthetic-demo-key".repeat(4),
      now,
      allowlist,
    ),
  };
}
