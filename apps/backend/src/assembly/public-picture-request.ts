import { lookup } from "node:dns/promises";
import type { LookupAddress } from "node:dns";
import { get as httpGet } from "node:http";
import { get as httpsGet } from "node:https";
import { BlockList, isIP } from "node:net";
import {
  classifyExecutionFailure,
  ExecutionError,
} from "../diagnostics/execution-failure.js";
import type { ExecutionFailure } from "../../../../packages/contracts/local/execution-diagnostics.ts";
import type { ExecutionTrace } from "../../../../packages/contracts/local/execution-diagnostics.ts";

const excluded = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 3],
] as const)
  excluded.addSubnet(address, prefix, "ipv4");
for (const [address, prefix] of [
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["3fff::", 20],
] as const)
  excluded.addSubnet(address, prefix, "ipv6");

export function publicPictureAddress(address: string) {
  const family = isIP(address);
  return family === 4
    ? !excluded.check(address, "ipv4")
    : family === 6 &&
        /^[23][0-9a-f]{3}:/iu.test(address) &&
        !excluded.check(address, "ipv6");
}
export type PublicPictureRead = (
  url: URL,
  maxBytes: number,
  signal: AbortSignal,
  observed?: (detail: ExecutionTrace) => void,
) => Promise<{ bytes: Buffer; contentType: string; url: URL }>;
export class PictureHttpFailure extends ExecutionError {
  constructor(
    readonly status: number,
    detail?: ExecutionFailure,
  ) {
    super("image_http_failed", {
      category: "http",
      ...detail,
      httpStatus: status,
    });
  }
}

/** Public HTTP(S) only; pin validated DNS to the socket and recheck redirects.
 * No ambient cookies, authentication, proxy, or content/URL logging. */
export const readPublicPicture: PublicPictureRead = async (
  input,
  maxBytes,
  caller,
  observed,
) => {
  const signal = AbortSignal.any([caller, AbortSignal.timeout(10_000)]);
  let url = input;
  for (let hop = 0; hop <= 3; hop++) {
    const started = performance.now();
    let receivedBytes = 0;
    let phase: ExecutionTrace["phase"] = "dns";
    const trace = (
      outcome: ExecutionTrace["outcome"],
      extra: Partial<ExecutionTrace> = {},
    ) => {
      try {
        observed?.({
          boundary: "picture",
          phase,
          outcome,
          elapsedMs: Math.round(performance.now() - started),
          timeoutMs: 10_000,
          ...extra,
        });
      } catch {
        /* Nonfatal sink. */
      }
    };
    try {
      trace("started");
      signal.throwIfAborted();
      if (
        !["https:", "http:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        (url.port && url.port !== (url.protocol === "https:" ? "443" : "80"))
      )
        throw new Error("image_address_blocked");
      const host = url.hostname.replace(/^\[|\]$/gu, "");
      const family = isIP(host);
      const answers = family
        ? [{ address: host, family }]
        : await new Promise<LookupAddress[]>((resolve, reject) => {
            const abort = () => reject(signal.reason);
            signal.addEventListener("abort", abort, { once: true });
            if (signal.aborted) abort();
            void lookup(host, { all: true, verbatim: true })
              .then(resolve, reject)
              .finally(() => signal.removeEventListener("abort", abort));
          });
      signal.throwIfAborted();
      if (
        !answers.length ||
        answers.some((answer) => !publicPictureAddress(answer.address))
      )
        throw new Error("image_address_blocked");
      const address = answers[0]!;
      trace("succeeded", {
        hops: [
          {
            hop,
            phase: "dns",
            elapsedMs: Math.round(performance.now() - started),
            addresses: answers.length,
            family: address.family === 4 ? 4 : 6,
          },
        ],
      });
      phase = "http";
      trace("started");
      const response = await new Promise<import("node:http").IncomingMessage>(
        (resolve, reject) => {
          const request = (url.protocol === "https:" ? httpsGet : httpGet)(
            url,
            {
              signal,
              agent: false,
              headers: {
                Accept: "image/*,text/html;q=0.8",
                "User-Agent": "ClipBuilder/0.0",
              },
              lookup: (_host, options, callback) => {
                // Node's family selection requests all answers. Preserve that
                // callback shape while pinning every candidate to checked DNS.
                if (options.all) callback(null, answers);
                else callback(null, address.address, address.family);
              },
            },
            resolve,
          );
          request.on("error", reject);
        },
      );
      trace("succeeded", {
        httpStatus: response.statusCode,
        ...(Number.isSafeInteger(Number(response.headers["content-length"])) &&
        Number(response.headers["content-length"]) >= 0
          ? {
              declaredBytes: Math.min(
                1_000_000_000,
                Number(response.headers["content-length"]),
              ),
            }
          : {}),
        hops: [
          {
            hop,
            phase: "http",
            elapsedMs: Math.round(performance.now() - started),
            httpStatus: response.statusCode,
          },
        ],
      });
      try {
        if ([301, 302, 303, 307, 308].includes(response.statusCode ?? 0)) {
          if (!response.headers.location || hop === 3)
            throw new Error("image_redirect_failed");
          try {
            url = new URL(response.headers.location, url);
          } catch (error) {
            throw new ExecutionError("image_redirect_failed", {
              ...classifyExecutionFailure(error),
              category: "redirect",
            });
          }
          continue;
        }
        if (
          (response.statusCode ?? 0) < 200 ||
          (response.statusCode ?? 0) >= 300
        )
          throw new PictureHttpFailure(response.statusCode ?? 500);
        if (Number(response.headers["content-length"] ?? 0) > maxBytes)
          throw new Error("image_download_limit");
        const chunks: Buffer[] = [];
        phase = "body";
        trace("started", { limitBytes: maxBytes });
        let size = 0;
        for await (const chunk of response) {
          signal.throwIfAborted();
          const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += bytes.length;
          receivedBytes = size;
          if (size > maxBytes) throw new Error("image_download_limit");
          chunks.push(bytes);
        }
        trace("succeeded", {
          outputBytes: size,
          hops: [
            {
              hop,
              phase: "body",
              elapsedMs: Math.round(performance.now() - started),
              bytes: size,
            },
          ],
        });
        return {
          bytes: Buffer.concat(chunks),
          contentType: response.headers["content-type"] ?? "",
          url,
        };
      } finally {
        response.destroy();
      }
    } catch (error) {
      trace(caller.aborted ? "canceled" : "failed", {
        error: classifyExecutionFailure(error),
        outputBytes: receivedBytes,
        limitBytes: maxBytes,
        ...(signal.aborted
          ? { deadlineSource: caller.aborted ? "caller" : "request" }
          : {}),
      });
      throw error;
    }
  }
  throw new Error("image_redirect_failed");
};
