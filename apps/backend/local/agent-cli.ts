import { request } from "node:http";
import { lstat, open, realpath } from "node:fs/promises";
import { resolve, win32 } from "node:path";
import { pathToFileURL } from "node:url";
import { discoverOwnerHost } from "../../../scripts/local-discovery.mjs";
import { OWNER_PICTURE_LIMITS } from "../../../packages/contracts/local/assets.ts";
import { OWNER_LIMITS } from "../../../packages/contracts/local/policy.ts";
import {
  executeOwnerAgentCommand,
  ownerAgentFailureCode,
  ownerAgentPicturePath,
  OWNER_AGENT_INPUT_BYTES,
  type OwnerAgentRequest,
} from "./agent-client.ts";
export { ownerAgentPicturePath } from "./agent-client.ts";

const pictureError = () => new Error("owner_agent_picture_unavailable");

/** Bounded descriptor reads after link/identity checks; never a directory browser. */
export async function readOwnerAgentPicture(
  value: string,
  signal: AbortSignal,
): Promise<Buffer> {
  try {
    signal.throwIfAborted();
    const path = ownerAgentPicturePath(value);
    const checkAncestors = async () => {
      let cursor = win32.parse(path).root;
      const parts = path.slice(cursor.length).split(win32.sep);
      for (const [index, part] of parts.entries()) {
        signal.throwIfAborted();
        cursor = win32.join(cursor, part);
        const info = await lstat(cursor, { bigint: true });
        if (
          info.isSymbolicLink() ||
          (index < parts.length - 1 && !info.isDirectory())
        )
          throw pictureError();
      }
      const actual = ownerAgentPicturePath(await realpath(path));
      if (actual.toLowerCase() !== path.toLowerCase()) throw pictureError();
    };
    await checkAncestors();
    const before = await lstat(path, { bigint: true });
    if (
      !before.isFile() ||
      before.isSymbolicLink() ||
      before.nlink !== 1n ||
      before.size < 1n ||
      before.size > BigInt(OWNER_PICTURE_LIMITS.inputBytes)
    )
      throw pictureError();
    const identity = (info: typeof before) =>
      `${info.dev}:${info.ino}:${info.size}:${info.mtimeNs}:${info.ctimeNs}`;
    const handle = await open(path, "r");
    try {
      if (identity(await handle.stat({ bigint: true })) !== identity(before))
        throw pictureError();
      await checkAncestors();
      const bytes = Buffer.alloc(Number(before.size) + 1);
      let count = 0;
      while (count < bytes.length) {
        signal.throwIfAborted();
        const read = await handle.read(
          bytes,
          count,
          bytes.length - count,
          null,
        );
        signal.throwIfAborted();
        if (!read.bytesRead) break;
        count += read.bytesRead;
      }
      if (
        count !== Number(before.size) ||
        identity(await handle.stat({ bigint: true })) !== identity(before)
      )
        throw pictureError();
      await checkAncestors();
      signal.throwIfAborted();
      return bytes.subarray(0, count);
    } finally {
      await handle.close();
    }
  } catch {
    if (signal.aborted) throw new Error("owner_agent_canceled");
    throw pictureError();
  }
}

/** No URL argument, redirects, DNS fallback or ambient HTTP proxy. */
export function requestOwnerAgent(
  value: OwnerAgentRequest,
  signal: AbortSignal,
): Promise<{ status: number; value: unknown }> {
  return new Promise((done, fail) => {
    const body =
      value.body === undefined
        ? undefined
        : Buffer.isBuffer(value.body)
          ? value.body
          : Buffer.from(JSON.stringify(value.body));
    const req = request(
      {
        hostname: "127.0.0.1",
        port: 4000,
        path: value.path.replace(/^\/api\//, "/v1/local/"),
        method: value.method,
        signal,
        headers: {
          Authorization: `Bearer ${value.token}`,
          ...(body
            ? {
                "Content-Type": value.contentType ?? "application/json",
                "Content-Length": body.length,
              }
            : {}),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        let bytes = 0;
        res.on("data", (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes > OWNER_LIMITS.jsonBytes) {
            res.destroy();
            req.destroy(new Error("owner_agent_operation_failed"));
            return;
          }
          chunks.push(Buffer.from(chunk));
        });
        res.on("error", () => fail(new Error("owner_agent_operation_failed")));
        res.on("end", () => {
          const status = res.statusCode ?? 0;
          if (status < 200 || status >= 300) {
            done({ status, value: null });
            return;
          }
          try {
            done({
              status,
              value: JSON.parse(Buffer.concat(chunks, bytes).toString("utf8")),
            });
          } catch {
            fail(new Error("owner_agent_operation_failed"));
          }
        });
      },
    );
    const timeout = setTimeout(
      () => req.destroy(new Error("owner_agent_unavailable")),
      30_000,
    );
    req.once("close", () => clearTimeout(timeout));
    req.on("error", () => fail(new Error("owner_agent_unavailable")));
    req.end(body);
  });
}

export async function readOwnerAgentCommand(
  input: AsyncIterable<Uint8Array | string>,
): Promise<unknown> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  try {
    for await (const chunk of input) {
      const buffer = Buffer.from(chunk);
      bytes += buffer.length;
      if (bytes > OWNER_AGENT_INPUT_BYTES) throw new Error("invalid");
      chunks.push(buffer);
    }
    return JSON.parse(Buffer.concat(chunks, bytes).toString("utf8"));
  } catch {
    throw new Error("owner_agent_invalid_command");
  }
}

async function main() {
  const controller = new AbortController(),
    cancel = () => {
      controller.abort();
      process.stdin.destroy();
    };
  process.once("SIGINT", cancel);
  process.once("SIGTERM", cancel);
  try {
    // This allowlisted client never composes AI or reads provider configuration.
    // The discovered host owns authentication, current modes and native work.
    if (process.argv.length !== 2 || process.stdin.isTTY)
      throw new Error("owner_agent_invalid_command");
    const result = await executeOwnerAgentCommand(
      await readOwnerAgentCommand(process.stdin),
      {
        discover: discoverOwnerHost,
        picture: readOwnerAgentPicture,
        transport: requestOwnerAgent,
      },
      controller.signal,
    );
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify({ error: controller.signal.aborted ? "owner_agent_canceled" : ownerAgentFailureCode(error) })}\n`,
    );
    process.exitCode = 1;
  } finally {
    process.removeListener("SIGINT", cancel);
    process.removeListener("SIGTERM", cancel);
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  await main();
