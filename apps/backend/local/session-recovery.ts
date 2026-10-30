import { lstat, readdir, realpath, rm } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import type { OwnerDraftSnapshot } from "../../../packages/contracts/local/drafts.ts";
import { OWNER_LIMITS } from "../../../packages/contracts/local/policy.ts";
import { OwnerDraftStore } from "./draft-store.ts";
import { OwnerWorkspaceDrafts } from "./workspace-drafts.ts";
import { confinedPath, type WorkspaceFiles } from "./workspace-files.ts";
import { rejectRepositoryStorage } from "./owner-storage.ts";
import { LocalDiagnostics } from "./diagnostics.ts";

/** One private rolling local session, separate from explicitly saved projects. */
export class OwnerSessionRecovery {
  private readonly store: OwnerDraftStore;
  private readonly drafts: OwnerWorkspaceDrafts;
  private workspaceId: string | undefined;
  constructor(
    storageRoot: string,
    private readonly files: WorkspaceFiles,
    snapshot: (id: string) => OwnerDraftSnapshot,
    diagnostics = new LocalDiagnostics(),
  ) {
    this.store = new OwnerDraftStore(join(storageRoot, ".recovery"));
    this.drafts = new OwnerWorkspaceDrafts(
      this.store,
      files,
      snapshot,
      diagnostics,
      true,
    );
  }
  changed(id: string) {
    this.workspaceId = id;
    this.drafts.changed(id);
  }
  async restore(signal: AbortSignal): Promise<OwnerDraftSnapshot | null> {
    const latest = (await this.store.list()).sort((a, b) =>
      b.savedAt.localeCompare(a.savedAt),
    )[0];
    if (!latest) return null;
    if (Date.now() - Date.parse(latest.savedAt) >= OWNER_LIMITS.workspaceMs) {
      await this.clear();
      return null;
    }
    const snapshot = await this.store.load(latest.id, this.files, signal);
    this.workspaceId = snapshot.workspace.id;
    this.drafts.bind(snapshot.workspace.id, latest.id, latest.savedAt);
    return snapshot;
  }
  async clear() {
    if (this.workspaceId) await this.drafts.forget(this.workspaceId);
    this.workspaceId = undefined;
    await this.store.cancelPending();
    const root = this.store.root;
    await rejectRepositoryStorage(root);
    try {
      if (
        (await lstat(root)).isSymbolicLink() ||
        (await realpath(root)) !== resolve(root)
      )
        throw new Error("invalid_path");
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ENOENT"
      )
        return;
      throw error;
    }
    const inspect = async (path: string): Promise<void> => {
      for (const entry of await readdir(path, { withFileTypes: true })) {
        if (entry.isSymbolicLink()) throw new Error("invalid_path");
        const child = await confinedPath(
          root,
          relative(root, join(path, entry.name)),
        );
        if (entry.isDirectory()) await inspect(child);
      }
    };
    await inspect(root);
    await rm(root, { recursive: true, force: true });
  }
  async close() {
    await this.drafts.close();
    await this.store.cancelPending();
  }
}
