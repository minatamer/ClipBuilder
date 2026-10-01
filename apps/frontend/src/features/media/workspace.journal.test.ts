import { describe, expect, it, vi } from "vitest";
import { IndexedWorkspaceJournal } from "./workspace.journal";

function fixture() {
  const request = {
    result: undefined as unknown,
    onsuccess: null as (() => void) | null,
  };
  const transaction = {
    oncomplete: null as (() => void) | null,
    onerror: null as (() => void) | null,
    onabort: null as (() => void) | null,
    objectStore: () => ({ get: () => request, delete: () => request }),
    abort: () => transaction.onabort?.(),
  };
  const database = {
    close: vi.fn(),
    transaction: () => transaction,
    onversionchange: null as (() => void) | null,
  };
  const opening = {
    result: database,
    onsuccess: null as (() => void) | null,
    onerror: null as (() => void) | null,
    onblocked: null as (() => void) | null,
  };
  // Minimal event-driven IDB fixture; no application cast or alternate storage path.
  const factory = { open: () => opening } as unknown as IDBFactory;
  const journal = new IndexedWorkspaceJournal(() => factory);
  return { journal, opening, request, transaction, database };
}
describe("IndexedDB journal commit ownership", () => {
  it.each([{ version: 2 }, { version: 1, source: "synthetic-corrupt" }])(
    "rejects unknown or corrupt journal evidence",
    async (value) => {
      const f = fixture();
      f.request.result = value;
      const result = f.journal.read();
      const rejected = expect(result).rejects.toMatchObject({
        code: "corrupt",
      });
      f.opening.onsuccess?.();
      await vi.waitFor(() => expect(f.transaction.oncomplete).not.toBeNull());
      f.request.onsuccess?.();
      f.transaction.oncomplete?.();
      await rejected;
      f.journal.close();
    },
  );
  it("does not publish individual request success before transaction completion", async () => {
    const f = fixture();
    let completed = false;
    const result = f.journal.read().then((value) => {
      completed = true;
      return value;
    });
    f.opening.onsuccess?.();
    await vi.waitFor(() => expect(f.transaction.oncomplete).not.toBeNull());
    f.request.onsuccess?.();
    await Promise.resolve();
    expect(completed).toBe(false);
    f.transaction.oncomplete?.();
    expect(await result).toBeNull();
    f.journal.close();
  });
  it("rejects an abort after request success and never claims a commit", async () => {
    const f = fixture();
    const result = f.journal.delete();
    const rejected = expect(result).rejects.toMatchObject({ code: "storage" });
    f.opening.onsuccess?.();
    await vi.waitFor(() => expect(f.transaction.oncomplete).not.toBeNull());
    f.request.onsuccess?.();
    f.transaction.onabort?.();
    await rejected;
    f.journal.close();
  });
  it("closes a late open result after disposal or blocked opening", async () => {
    for (const blocked of [false, true]) {
      const f = fixture();
      const result = f.journal.read();
      const rejected = expect(result).rejects.toThrow();
      if (blocked) f.opening.onblocked?.();
      else f.journal.close();
      f.opening.onsuccess?.();
      await rejected;
      expect(f.database.close).toHaveBeenCalledOnce();
      f.journal.close();
    }
  });
  it("closes on database version change and refuses later operations", async () => {
    const f = fixture();
    const first = f.journal.read();
    f.opening.onsuccess?.();
    await vi.waitFor(() => expect(f.transaction.oncomplete).not.toBeNull());
    f.transaction.oncomplete?.();
    await first;
    f.database.onversionchange?.();
    expect(f.database.close).toHaveBeenCalledOnce();
    await expect(f.journal.read()).rejects.toMatchObject({ code: "canceled" });
  });
});
