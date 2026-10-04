import { GoogleAuth } from "google-auth-library";
import type { BackendConfig } from "../config/env.schema.js";
import {
  RetainedSample,
  type RetainedSampleReader,
} from "./retained-sample.js";

export function retainedSampleReader(
  reference: {
    bucket: string;
    object: string;
    generation: string;
    bytes: number;
  },
  authorization: () => Promise<string>,
  transport: typeof fetch = fetch,
): RetainedSampleReader {
  const url = new URL(
    `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(reference.bucket)}/o/${encodeURIComponent(reference.object)}`,
  );
  url.searchParams.set("alt", "media");
  url.searchParams.set("generation", reference.generation);
  return {
    bytes: reference.bytes,
    async read(range, signal) {
      signal.throwIfAborted();
      const token = await authorization();
      signal.throwIfAborted();
      return transport(url, {
        headers: {
          Authorization: token,
          ...(range ? { Range: range } : {}),
          "Accept-Encoding": "identity",
        },
        signal,
        redirect: "error",
        cache: "no-store",
      });
    },
  };
}

export function composeRetainedSample(
  config: BackendConfig,
): RetainedSample | null {
  const reader = composeRetainedSampleReader(config);
  return reader ? new RetainedSample(reader) : null;
}

export function composeRetainedSampleReader(
  config: BackendConfig,
): RetainedSampleReader | null {
  const reference = config.retainedSample;
  if (!reference.enabled) return null;
  if (
    config.nodeEnv === "test" ||
    config.appEnv !== "local" ||
    config.providerMode !== "live" ||
    !config.renderer.spendApproved ||
    !reference.bucket ||
    !reference.object ||
    !reference.generation
  )
    throw new Error("retained_sample_disabled");
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/devstorage.read_only"],
    clientOptions: { transporterOptions: { timeout: 10_000, retry: false } },
  });
  return retainedSampleReader(
    {
      bucket: reference.bucket,
      object: reference.object,
      generation: reference.generation,
      bytes: reference.bytes,
    },
    async () => {
      const token = await auth.getAccessToken();
      if (!token) throw new Error("retained_sample_unavailable");
      return `Bearer ${token}`;
    },
  );
}
