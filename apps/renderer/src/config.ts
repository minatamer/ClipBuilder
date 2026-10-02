import { z } from "zod";
import { isAbsolute } from "node:path";
const blankString = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().max(4096).optional(),
);
const toggle = z
  .enum(["true", "false"])
  .default("false")
  .transform((v) => v === "true");
export function parseRendererConfig(environment: NodeJS.ProcessEnv) {
  const schema = z.object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    RENDERER_ENABLED: toggle,
    CLOUD_SPEND_APPROVED: toggle,
    RENDERER_MAX_OPERATIONS: z.coerce.number().int().min(0).max(4).default(0),
    PORT: z.coerce.number().int().min(1).max(65535).default(8080),
    RENDERER_BUCKET: blankString,
    RENDERER_AUDIENCE: blankString,
    RENDERER_CALLER_EMAIL: blankString,
    RENDERER_EXPIRY_CALLER_EMAIL: blankString,
    RENDERER_CLEANUP_KEY_FILE: blankString,
    REMOTION_LICENSE_CONFIRMED: toggle,
    CHROMIUM_PATH: blankString,
    FFMPEG_PATH: blankString,
    FFPROBE_PATH: blankString,
    REMOTION_BUNDLE_PATH: blankString,
    FRONTEND_ORIGIN: z.url().default("http://localhost:3000"),
  });
  const result = schema.parse(environment);
  if (
    result.NODE_ENV === "test" &&
    (result.RENDERER_ENABLED ||
      result.CLOUD_SPEND_APPROVED ||
      result.RENDERER_MAX_OPERATIONS !== 0 ||
      result.RENDERER_CLEANUP_KEY_FILE)
  )
    throw new Error("Test cloud composition is prohibited.");
  if (result.RENDERER_ENABLED) {
    if (
      !result.CLOUD_SPEND_APPROVED ||
      !result.REMOTION_LICENSE_CONFIRMED ||
      result.RENDERER_MAX_OPERATIONS < 1 ||
      !result.RENDERER_BUCKET ||
      !result.RENDERER_AUDIENCE ||
      !result.RENDERER_CALLER_EMAIL ||
      !result.RENDERER_EXPIRY_CALLER_EMAIL ||
      result.RENDERER_CALLER_EMAIL === result.RENDERER_EXPIRY_CALLER_EMAIL ||
      !result.RENDERER_CLEANUP_KEY_FILE ||
      !result.CHROMIUM_PATH ||
      !result.FFMPEG_PATH ||
      !result.FFPROBE_PATH ||
      !result.REMOTION_BUNDLE_PATH
    )
      throw new Error("Private renderer composition gates are incomplete.");
    const origin = new URL(result.RENDERER_AUDIENCE);
    if (
      origin.protocol !== "https:" ||
      !origin.hostname.endsWith(".run.app") ||
      origin.origin !== result.RENDERER_AUDIENCE ||
      !/^[-a-z0-9.]{3,222}$/.test(result.RENDERER_BUCKET)
    )
      throw new Error("Private renderer identity is invalid.");
    for (const path of [
      result.RENDERER_CLEANUP_KEY_FILE,
      result.CHROMIUM_PATH,
      result.FFMPEG_PATH,
      result.FFPROBE_PATH,
      result.REMOTION_BUNDLE_PATH,
    ])
      if (!isAbsolute(path)) throw new Error("Runtime paths must be absolute.");
    if (new URL(result.FRONTEND_ORIGIN).origin !== result.FRONTEND_ORIGIN)
      throw new Error("Upload origin must be exact.");
  }
  return result;
}
