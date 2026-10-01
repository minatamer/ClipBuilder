import { LocalMediaError } from "./media.errors";

// TypeScript's DOM library does not yet describe this worker-only OPFS API.
export interface SyncFileAccess {
  truncate(size: number): void;
  write(data: Uint8Array, options: { at: number }): number;
  flush(): void;
  close(): void;
}

function supportsSyncAccess(
  handle: FileSystemFileHandle,
): handle is FileSystemFileHandle & {
  createSyncAccessHandle(): Promise<SyncFileAccess>;
} {
  return typeof Reflect.get(handle, "createSyncAccessHandle") === "function";
}

export async function openSyncAccess(
  handle: FileSystemFileHandle,
): Promise<SyncFileAccess> {
  if (!supportsSyncAccess(handle)) throw new LocalMediaError("unavailable");
  return handle.createSyncAccessHandle();
}
