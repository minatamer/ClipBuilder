import { expect, it, vi } from "vitest";
vi.mock("node:v8", async (original) => {
  const actual = await original<typeof import("node:v8")>();
  return { ...actual, getHeapStatistics: vi.fn(actual.getHeapStatistics) };
});
import * as v8 from "node:v8";
import { requireLocalMemory } from "./machine-memory.ts";
it("uses measured free memory and heap headroom rather than a total clip count", () => {
  const heap = vi.mocked(v8.getHeapStatistics).mockReturnValue({
    ...v8.getHeapStatistics(),
    used_heap_size: 1000,
    heap_size_limit: 1_000_000,
  });
  const available = vi
    .spyOn(process, "availableMemory")
    .mockReturnValue(1_000_000);
  try {
    expect(() => requireLocalMemory(100_000)).not.toThrow();
    expect(() => requireLocalMemory(900_000)).toThrow("memory_unavailable");
    available.mockReturnValue(100);
    expect(() => requireLocalMemory(1000)).toThrow("memory_unavailable");
    for (const amount of [-1, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1])
      expect(() => requireLocalMemory(amount)).toThrow("memory_unavailable");
  } finally {
    heap.mockRestore();
    available.mockRestore();
  }
});
