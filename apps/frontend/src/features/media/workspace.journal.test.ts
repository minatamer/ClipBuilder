import { describe, expect, it, vi } from "vitest";
import { IndexedWorkspaceJournal } from "./workspace.journal";

function fixture() {
  const request = {
    result: undefined as unknown,
    onsuccess: null as (() => void) | null,
  };
  const store = {
    get: vi.fn(() => request),
    put: vi.fn(() => request),
    delete: vi.fn(() => request),
  };
  const transaction = {
    oncomplete: null as (() => void) | null,
    onerror: null as (() => void) | null,
    onabort: null as (() => void) | null,
    objectStore: () => store,
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
  return { journal, opening, request, transaction, database, store };
}
describe("IndexedDB journal commit ownership", () => {
  it("commits a separate content-free cleanup obligation and current-record deletion cannot erase it", async () => {
    const f = fixture(),
      obligation = {
        version: 1 as const,
        allowMissingSession: false,
        status: "pending" as const,
      };
    let committed = false;
    const write = f.journal.writeRemoteCleanup(obligation).then(() => {
      committed = true;
    });
    f.opening.onsuccess?.();
    await vi.waitFor(() =>
      expect(f.store.put).toHaveBeenCalledWith(obligation, "remote-cleanup"),
    );
    f.request.onsuccess?.();
    await Promise.resolve();
    expect(committed).toBe(false);
    f.transaction.oncomplete?.();
    await write;
    const removal = f.journal.delete();
    await vi.waitFor(() =>
      expect(f.store.delete).toHaveBeenCalledExactlyOnceWith("current"),
    );
    f.transaction.oncomplete?.();
    await removal;
    const acknowledgement = f.journal.deleteRemoteCleanup();
    await vi.waitFor(() =>
      expect(f.store.delete).toHaveBeenLastCalledWith("remote-cleanup"),
    );
    f.transaction.oncomplete?.();
    await acknowledgement;
    f.journal.close();
  });
  it.each([
    [{ version: 1, allowMissingSession: false }, "pending"],
    [
      { version: 1, allowMissingSession: false, status: "confirmed" },
      "confirmed",
    ],
  ])(
    "restores legacy pending and confirmed cleanup separately",
    async (value, status) => {
      const f = fixture();
      f.request.result = value;
      const read = f.journal.readRemoteCleanup();
      f.opening.onsuccess?.();
      await vi.waitFor(() =>
        expect(f.store.get).toHaveBeenCalledExactlyOnceWith("remote-cleanup"),
      );
      f.request.onsuccess?.();
      f.transaction.oncomplete?.();
      expect(await read).toEqual({
        version: 1,
        allowMissingSession: false,
        status,
      });
      f.journal.close();
    },
  );
  it.each([
    { version: 2, allowMissingSession: false },
    { version: 1, allowMissingSession: false, receipt: "synthetic" },
    { version: 1, allowMissingSession: false, status: "unknown" },
  ])(
    "fails closed on corrupt or content-bearing remote cleanup evidence",
    async (value) => {
      const f = fixture();
      f.request.result = value;
      const read = f.journal.readRemoteCleanup(),
        rejected = expect(read).rejects.toMatchObject({ code: "corrupt" });
      f.opening.onsuccess?.();
      await vi.waitFor(() =>
        expect(f.store.get).toHaveBeenCalledExactlyOnceWith("remote-cleanup"),
      );
      f.request.onsuccess?.();
      f.transaction.oncomplete?.();
      await rejected;
      f.journal.close();
    },
  );
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
