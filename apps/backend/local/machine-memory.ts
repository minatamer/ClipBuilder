import { getHeapStatistics } from "node:v8";
/** Actual process/machine capacity, not a total source/clip quota. */
export function requireLocalMemory(additionalBytes: number) {
  if (!Number.isSafeInteger(additionalBytes) || additionalBytes < 0)
    throw Error("memory_unavailable");
  const heap = getHeapStatistics();
  if (
    heap.used_heap_size + additionalBytes > heap.heap_size_limit * 0.8 ||
    process.availableMemory() < additionalBytes
  )
    throw Error("memory_unavailable");
}
