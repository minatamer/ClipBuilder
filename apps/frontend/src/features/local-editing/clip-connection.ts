import {
  ownerClipListSchema,
  type OwnerClipList,
} from "../../../../../packages/contracts/local/clips.ts";
import {
  ownerWorkspaceSchema,
  type OwnerWorkspace,
} from "../../../../../packages/contracts/local/index.ts";

export type ClipConnection =
  "connected" | "reconnecting" | "unavailable" | "missing";

/** Read-only reconnection never re-submits an analysis, image or render action. */
export async function pollClipConnection(options: {
  workspaceId: string;
  signal: AbortSignal;
  revision: () => number;
  list: (value: OwnerClipList, revision: number) => void;
  state: (value: ClipConnection) => void;
  recovered?: ((workspace: OwnerWorkspace) => void) | undefined;
  request?: typeof fetch;
}) {
  const request = options.request ?? fetch;
  let failedAt: number | undefined;
  while (!options.signal.aborted) {
    let delay = 1000;
    try {
      const remaining =
        failedAt === undefined
          ? 4000
          : Math.min(4000, 30_000 - (performance.now() - failedAt));
      if (remaining <= 0) {
        options.state("unavailable");
        return;
      }
      const signal = AbortSignal.any([
        options.signal,
        AbortSignal.timeout(Math.max(1, Math.ceil(remaining))),
      ]);
      const revision = options.revision();
      const response = await request(
        `/api/local/workspace/${options.workspaceId}/clips`,
        { signal },
      );
      if (response.status === 401 || response.status === 410) {
        if (!options.signal.aborted) options.state("missing");
        return;
      }
      if (response.status === 404) {
        const current = await request("/api/local/workspace", { signal });
        if (!current.ok) throw new Error("connection_unavailable");
        const workspace = ownerWorkspaceSchema
          .nullable()
          .parse(await current.json());
        if (!workspace) {
          if (!options.signal.aborted) options.state("missing");
          return;
        }
        if (workspace.id !== options.workspaceId && options.recovered) {
          if (!options.signal.aborted) options.recovered(workspace);
          return;
        }
        throw new Error("connection_unavailable");
      }
      if (!response.ok) throw new Error("connection_unavailable");
      const list = ownerClipListSchema.parse(await response.json());
      if (options.signal.aborted) return;
      options.list(list, revision);
      options.state("connected");
      failedAt = undefined;
      delay = list.active ? 750 : 1000;
    } catch {
      if (options.signal.aborted) return;
      failedAt ??= performance.now();
      if (performance.now() - failedAt >= 30_000) {
        options.state("unavailable");
        return;
      }
      options.state("reconnecting");
    }
    await new Promise<void>((done) => {
      const finish = () => {
        clearTimeout(timer);
        options.signal.removeEventListener("abort", finish);
        done();
      };
      const timer = setTimeout(finish, delay);
      options.signal.addEventListener("abort", finish, { once: true });
      if (options.signal.aborted) finish();
    });
  }
}
