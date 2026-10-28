import { expect, it, vi } from "vitest";
import { demoUsageGcsStore } from "./demo-usage.gcs.ts";
const value = {
  version: 1 as const,
  day: 0,
  sessions: 0,
  provider: 0,
  native: 0,
  leases: [],
};
it("pins generation for reads and conditional writes; conflicts never overwrite newer usage", async () => {
  const transport = vi.fn<typeof fetch>();
  transport
    .mockResolvedValueOnce(Response.json({ generation: "17", size: "80" }))
    .mockResolvedValueOnce(Response.json(value))
    .mockResolvedValueOnce(new Response(null, { status: 412 }));
  const store = demoUsageGcsStore(
    "synthetic-ledger",
    async () => "Bearer synthetic",
    transport,
  );
  expect(await store.read()).toEqual({ generation: "17", value });
  expect(await store.write("17", value)).toBe(false);
  expect(String(transport.mock.calls[1]![0])).toContain(
    "alt=media&generation=17",
  );
  expect(String(transport.mock.calls[2]![0])).toContain("ifGenerationMatch=17");
  expect(
    transport.mock.calls.every(([, options]) => options?.redirect === "error"),
  ).toBe(true);
});
it("requires a pre-existing bounded private object and does not silently recreate missing accounting", async () => {
  for (const response of [
    new Response(null, { status: 404 }),
    Response.json({ generation: "1", size: "999999" }),
    Response.json({ generation: "bad", size: "4" }),
  ]) {
    const transport = vi.fn<typeof fetch>().mockResolvedValue(response);
    await expect(
      demoUsageGcsStore(
        "synthetic-ledger",
        async () => "Bearer synthetic",
        transport,
      ).read(),
    ).rejects.toThrow();
    expect(transport).toHaveBeenCalledTimes(1);
  }
});
