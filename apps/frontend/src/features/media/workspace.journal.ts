import { LocalMediaError } from "./media.errors";
import { parseWorkspaceRecord, type WorkspaceRecord } from "./workspace.schema";

export interface WorkspaceJournal {
  read(): Promise<WorkspaceRecord | null>;
  write(record: WorkspaceRecord): Promise<void>;
  delete(): Promise<void>;
  close(): void;
}

export class IndexedWorkspaceJournal implements WorkspaceJournal {
  private database: IDBDatabase | null = null;
  private opening: Promise<IDBDatabase> | null = null;
  private closed = false;
  constructor(private readonly factory: () => IDBFactory = () => indexedDB) {}

  private open(): Promise<IDBDatabase> {
    if (this.closed) return Promise.reject(new LocalMediaError("canceled"));
    if (this.database) return Promise.resolve(this.database);
    if (this.opening) return this.opening;
    const opening = new Promise<IDBDatabase>((resolve, reject) => {
      const request = this.factory().open("clipbuilder-workspace-v1", 1);
      let failed = false;
      request.onupgradeneeded = () => {
        request.result.createObjectStore("journal");
      };
      request.onblocked = request.onerror = () => {
        failed = true;
        reject(new LocalMediaError("storage"));
      };
      request.onsuccess = () => {
        if (failed || this.closed) {
          request.result.close();
          reject(new LocalMediaError("canceled"));
          return;
        }
        this.database = request.result;
        this.database.onversionchange = () => this.close();
        resolve(this.database);
      };
    }).finally(() => {
      this.opening = null;
    });
    this.opening = opening;
    return opening;
  }

  private async transact(
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore) => IDBRequest,
  ): Promise<unknown> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction("journal", mode);
      let value: unknown;
      transaction.oncomplete = () => resolve(value);
      transaction.onabort = transaction.onerror = () =>
        reject(new LocalMediaError("storage"));
      try {
        const request = run(transaction.objectStore("journal"));
        request.onsuccess = () => {
          value = request.result;
        };
      } catch {
        transaction.abort();
      }
    });
  }

  async read(): Promise<WorkspaceRecord | null> {
    const value = await this.transact("readonly", (store) =>
      store.get("current"),
    );
    if (value === undefined) return null;
    try {
      return parseWorkspaceRecord(value);
    } catch {
      throw new LocalMediaError("corrupt");
    }
  }
  async write(record: WorkspaceRecord): Promise<void> {
    await this.transact("readwrite", (store) =>
      store.put(parseWorkspaceRecord(record), "current"),
    );
  }
  async delete(): Promise<void> {
    await this.transact("readwrite", (store) => store.delete("current"));
  }
  close(): void {
    this.closed = true;
    this.database?.close();
    this.database = null;
  }
}
