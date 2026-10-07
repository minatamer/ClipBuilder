import type { MediaDescriptor } from "@clipbuilder/contracts";
import type { LocalMediaCode } from "./media.errors";

export const WORKSPACE_FOLDER = "clipbuilder-workspace-v1";
// Recovery still removes scratch left by the retired browser extraction path.
export const LEGACY_AUDIO_SCRATCH_FOLDER = "audio-scratch-v1";
export type SourceCommand = {
  jobId: string;
  action: "inspect" | "copy" | "reopen" | "delete" | "probe" | "clear-audio";
  file?: Blob;
  artifactId?: string;
  mediaId?: string;
  sourceRevision?: string;
};
export type SourceResult = {
  media?: MediaDescriptor;
  fingerprint?: string;
  file?: Blob;
};
export type SourceMessage = { jobId: string } & (
  | { type: "progress"; bytes: number }
  | { type: "result"; result: SourceResult }
  | { type: "failed"; code: LocalMediaCode }
  | { type: "stopped" }
);
