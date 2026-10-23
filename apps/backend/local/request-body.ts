import type { IncomingMessage } from "node:http";
import { OWNER_LIMITS } from "../../../packages/contracts/local/index.ts";

export async function readOwnerJson(
  request: IncomingMessage,
): Promise<unknown> {
  if (request.headers["content-type"] !== "application/json")
    throw new Error("json_required");
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > OWNER_LIMITS.jsonBytes) throw new Error("json_too_large");
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
