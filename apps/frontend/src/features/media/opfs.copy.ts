import { LOCAL_WORKSPACE_LIMITS } from "@clipbuilder/contracts";
import { LocalMediaError } from "./media.errors";
import { openSyncAccess, type SyncFileAccess } from "./opfs.access";

export async function copyLocalSource(
  folder: FileSystemDirectoryHandle,
  artifactId: string,
  file: Blob,
  signal: AbortSignal,
  progress: (bytes: number) => void,
): Promise<void> {
  let access: SyncFileAccess | undefined;
  let complete = false;
  const handle = await folder.getFileHandle(artifactId, { create: true });
  try {
    access = await openSyncAccess(handle);
    access.truncate(0);
    for (
      let offset = 0;
      offset < file.size;
      offset += LOCAL_WORKSPACE_LIMITS.ioChunkBytes
    ) {
      if (signal.aborted) throw new LocalMediaError("canceled");
      const chunk = new Uint8Array(
        await file
          .slice(offset, offset + LOCAL_WORKSPACE_LIMITS.ioChunkBytes)
          .arrayBuffer(),
      );
      let written = 0;
      while (written < chunk.byteLength) {
        if (signal.aborted) throw new LocalMediaError("canceled");
        const count = access.write(chunk.subarray(written), {
          at: offset + written,
        });
        if (
          !Number.isSafeInteger(count) ||
          count <= 0 ||
          count > chunk.byteLength - written
        )
          throw new LocalMediaError("storage");
        written += count;
      }
      progress(offset + written);
    }
    access.flush();
    access.close();
    access = undefined;
    if (signal.aborted) throw new LocalMediaError("canceled");
    if ((await handle.getFile()).size !== file.size)
      throw new LocalMediaError("storage");
    complete = true;
  } finally {
    try {
      access?.close();
    } finally {
      if (!complete) await folder.removeEntry(artifactId);
    }
  }
}
