import { z } from "zod";
export const OWNER_YOUTUBE_AUDIO_TIMEOUT_MS = 180_000;
export const ownerYoutubeAudioImportSchema = z
  .object({ url: z.string().trim().min(1).max(2048) })
  .strict();
