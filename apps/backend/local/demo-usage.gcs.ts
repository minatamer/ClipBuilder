import { GoogleAuth } from "google-auth-library";
import { z } from "zod";
import type { DemoUsageStore } from "./demo-usage.ts";

const OBJECT = "demo-usage-v1.json";
async function boundedJson(response: Response) {
  if (!response.ok || !response.body) {
    await response.body?.cancel();
    throw new Error("demo_ledger_unavailable");
  }
  const reader = response.body.getReader(),
    chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  try {
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 262_144) throw new Error("demo_ledger_large");
      chunks.push(new Uint8Array(part.value));
    }
    return JSON.parse(await new Blob(chunks).text()) as unknown;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
/** Fixed object only; no bucket creation/list/delete and no ADC until explicit I/O. */
export function demoUsageGcsStore(
  bucket: string,
  authorization: () => Promise<string>,
  transport: typeof fetch = fetch,
): DemoUsageStore {
  if (!/^[a-z0-9][a-z0-9._-]{1,221}[a-z0-9]$/u.test(bucket))
    throw new Error("demo_ledger_bucket_invalid");
  const metadata = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${OBJECT}`;
  const upload = `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o`;
  return {
    async read() {
      const token = await authorization();
      const options = {
        headers: { Authorization: token },
        signal: AbortSignal.timeout(5000),
        redirect: "error",
        cache: "no-store",
      } as const;
      const meta = z
        .object({
          generation: z.string().regex(/^[1-9]\d{0,29}$/u),
          size: z.string().regex(/^\d{1,6}$/u),
        })
        .parse(await boundedJson(await transport(metadata, options)));
      if (Number(meta.size) > 262_144) throw new Error("demo_ledger_large");
      const value = await boundedJson(
        await transport(
          `${metadata}?alt=media&generation=${meta.generation}`,
          options,
        ),
      );
      return { generation: meta.generation, value };
    },
    async write(generation, value) {
      if (!/^[1-9]\d{0,29}$/u.test(generation))
        throw new Error("demo_ledger_generation_invalid");
      const body = JSON.stringify(value);
      if (Buffer.byteLength(body) > 262_144)
        throw new Error("demo_ledger_large");
      const response = await transport(
        `${upload}?uploadType=media&name=${OBJECT}&ifGenerationMatch=${generation}`,
        {
          method: "POST",
          headers: {
            Authorization: await authorization(),
            "Content-Type": "application/json",
          },
          body,
          signal: AbortSignal.timeout(5000),
          redirect: "error",
          cache: "no-store",
        },
      );
      await response.body?.cancel();
      if (response.status === 412) return false;
      if (!response.ok) throw new Error("demo_ledger_unavailable");
      return true;
    },
  };
}
export function composeDemoUsageStore(bucket: string) {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/devstorage.read_write"],
    clientOptions: { transporterOptions: { timeout: 5000, retry: false } },
  });
  return demoUsageGcsStore(bucket, async () => {
    const token = await auth.getAccessToken();
    if (!token) throw new Error("demo_ledger_unavailable");
    return `Bearer ${token}`;
  });
}
