import { basename, dirname, resolve, win32 } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ownerAgentCommandSchema,
  ownerAgentClipSchema,
  ownerAgentClipListSchema,
  ownerAgentResultSchema,
  ownerAgentStatusSchema,
  ownerAgentValidationSchema,
  type OwnerAgentResult,
  type OwnerAgentCommand,
} from "../../../packages/contracts/local/agent.ts";
import {
  ownerDraftListSchema,
  ownerDraftStatusSchema,
} from "../../../packages/contracts/local/drafts.ts";
import { ownerWorkspaceSchema } from "../../../packages/contracts/local/index.ts";
import { OWNER_PICTURE_LIMITS } from "../../../packages/contracts/local/assets.ts";

export const OWNER_AGENT_INPUT_BYTES = 32 * 1024;
const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot =
  basename(moduleDirectory) === ".local-build"
    ? dirname(moduleDirectory)
    : resolve(moduleDirectory, "../../..");
/** Pure path admission precedes discovery, HTTP and all filesystem access. */
export function ownerAgentPicturePath(
  value: string,
  repository = repositoryRoot,
): string {
  const invalid = () => new Error("owner_agent_picture_unavailable");
  if (
    !/^[a-z]:[\\/]/iu.test(value) ||
    value.startsWith("\\\\") ||
    Array.from(value).some((character) => character.charCodeAt(0) < 32)
  )
    throw invalid();
  const parts = value.slice(3).split(/[\\/]/u);
  if (
    !parts.length ||
    parts.some(
      (part) =>
        !part ||
        part === "." ||
        part === ".." ||
        /[<>:"|?*]/u.test(part) ||
        /[. ]$/u.test(part) ||
        /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9]|CONIN\$|CONOUT\$|CLOCK\$)(?:[. ]|$)/iu.test(
          part,
        ),
    )
  )
    throw invalid();
  const path = win32.normalize(value),
    extension = win32.extname(path).toLowerCase();
  if (![".jpeg", ".jpg", ".png"].includes(extension)) throw invalid();
  const relative = win32.relative(
    win32.normalize(repository).toLowerCase(),
    path.toLowerCase(),
  );
  if (
    !relative ||
    (!relative.startsWith(`..${win32.sep}`) &&
      relative !== ".." &&
      !win32.isAbsolute(relative))
  )
    throw invalid();
  return path;
}
const failureCodes = new Set([
  "owner_agent_invalid_command",
  "owner_agent_unavailable",
  "owner_agent_conflict",
  "owner_agent_target_unavailable",
  "owner_agent_picture_unavailable",
  "owner_agent_operation_failed",
  "owner_agent_canceled",
]);
export function ownerAgentFailureCode(error: unknown): string {
  return error instanceof Error && failureCodes.has(error.message)
    ? error.message
    : "owner_agent_operation_failed";
}
export type OwnerAgentRequest = {
  method: "GET" | "POST";
  path: string;
  token: string;
  body?: unknown;
  contentType?: "application/json" | "image/jpeg" | "image/png";
};
export type OwnerAgentPorts = {
  discover(): Promise<{ token: string }>;
  picture(path: string, signal: AbortSignal): Promise<Buffer>;
  transport(
    request: OwnerAgentRequest,
    signal: AbortSignal,
  ): Promise<{ status: number; value: unknown }>;
};

/** Only fixed protected local endpoints. No source analysis, URLs or generic RPC. */
export async function executeOwnerAgentCommand(
  value: unknown,
  ports: OwnerAgentPorts,
  signal: AbortSignal = new AbortController().signal,
): Promise<OwnerAgentResult> {
  try {
    let command: OwnerAgentCommand;
    try {
      if (Buffer.byteLength(JSON.stringify(value)) > OWNER_AGENT_INPUT_BYTES)
        throw new Error("invalid");
      command = ownerAgentCommandSchema.parse(value);
    } catch {
      throw new Error("owner_agent_invalid_command");
    }
    signal.throwIfAborted();
    if (command.command === "picture") ownerAgentPicturePath(command.path);
    let token: string;
    try {
      ({ token } = await ports.discover());
      if (!/^[a-f0-9]{64}$/u.test(token)) throw new Error("invalid");
    } catch {
      throw new Error("owner_agent_unavailable");
    }
    signal.throwIfAborted();
    const request = async (
      path: string,
      method: "GET" | "POST" = "GET",
      body?: unknown,
      contentType: NonNullable<
        OwnerAgentRequest["contentType"]
      > = "application/json",
    ) => {
      signal.throwIfAborted();
      const result = await ports.transport(
        {
          path,
          method,
          token,
          ...(body === undefined ? {} : { body, contentType }),
        },
        signal,
      );
      signal.throwIfAborted();
      if (result.status === 409) throw new Error("owner_agent_conflict");
      if (result.status === 404)
        throw new Error("owner_agent_target_unavailable");
      if ([401, 403, 503].includes(result.status))
        throw new Error("owner_agent_unavailable");
      if (result.status < 200 || result.status >= 300)
        throw new Error("owner_agent_operation_failed");
      return result.value;
    };
    if (command.command === "status")
      return ownerAgentResultSchema.parse({
        kind: "status",
        status: ownerAgentStatusSchema.parse(
          await request("/api/agent/status"),
        ),
      });
    if (command.command === "drafts")
      return ownerAgentResultSchema.parse({
        kind: "drafts",
        drafts: ownerDraftListSchema.parse(await request("/api/drafts")),
      });
    if (command.command === "open-draft")
      return ownerAgentResultSchema.parse({
        kind: "opened",
        workspace: ownerWorkspaceSchema.parse(
          await request(`/api/drafts/${command.draftId}/open`, "POST"),
        ),
      });
    if (command.command === "save")
      return ownerAgentResultSchema.parse({
        kind: "draft",
        draft: ownerDraftStatusSchema.parse(
          await request(`/api/workspace/${command.workspaceId}/draft`, "POST"),
        ),
      });
    const prefix = `/api/agent/workspace/${command.workspaceId}/clips/${command.clipId}`;
    const inspect = async () => {
      const clip = ownerAgentClipSchema.parse(await request(prefix));
      if (clip.id !== command.clipId)
        throw new Error("owner_agent_target_unavailable");
      return clip;
    };
    if (command.command === "inspect")
      return ownerAgentResultSchema.parse({
        kind: "clip",
        clip: await inspect(),
      });
    if (command.command === "validate") {
      const validation = ownerAgentValidationSchema.parse(
        await request(`${prefix}/validate`, "POST", command.request),
      );
      if (
        validation.clipId !== command.clipId ||
        validation.baseHash !== command.request.baseHash ||
        validation.expectedRevision !== command.request.expectedRevision
      )
        throw new Error("owner_agent_target_unavailable");
      return ownerAgentResultSchema.parse({ kind: "validation", validation });
    }
    let result: unknown;
    if (command.command === "picture") {
      // Authorize the exact workspace/clip before touching even an explicit file.
      await inspect();
      const bytes = await ports.picture(command.path, signal);
      signal.throwIfAborted();
      if (
        !Buffer.isBuffer(bytes) ||
        !bytes.length ||
        bytes.length > OWNER_PICTURE_LIMITS.inputBytes
      )
        throw new Error("owner_agent_picture_unavailable");
      result = await request(
        `${prefix}/picture`,
        "POST",
        bytes,
        /\.png$/iu.test(command.path) ? "image/png" : "image/jpeg",
      );
    } else if (command.command === "apply") {
      result = await request(`${prefix}/edit`, "POST", command.request);
    } else if (command.command === "render") {
      result = await request(`${prefix}/render`, "POST", command.request);
    } else {
      result = await request(`${prefix}/cancel`, "POST");
    }
    const clip = ownerAgentClipListSchema
      .parse(result)
      .clips.find((item) => item.id === command.clipId);
    if (!clip) throw new Error("owner_agent_target_unavailable");
    return ownerAgentResultSchema.parse({ kind: "clip", clip });
  } catch (error) {
    if (signal.aborted) throw new Error("owner_agent_canceled");
    throw new Error(ownerAgentFailureCode(error));
  }
}
