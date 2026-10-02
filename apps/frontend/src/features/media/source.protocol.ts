import type { MediaDescriptor } from "@clipbuilder/contracts";
import type { LocalMediaCode } from "./media.errors";
import type {
  AudioProfile,
  AudioProgress,
  ExtractedAudio,
} from "./audio.profile";

export const WORKSPACE_FOLDER = "clipbuilder-workspace-v1";
export type SourceCommand = {
  jobId: string;
  action:
    | "inspect"
    | "copy"
    | "reopen"
    | "delete"
    | "probe"
    | "extract-audio"
    | "clear-audio";
  file?: Blob;
  artifactId?: string;
  mediaId?: string;
  sourceRevision?: string;
  sourceDurationMs?: number;
  profile?: AudioProfile;
};
export type SourceResult = {
  media?: MediaDescriptor;
  fingerprint?: string;
  file?: Blob;
  audio?: ExtractedAudio;
};
export type SourceMessage = { jobId: string } & (
  | { type: "progress"; bytes: number }
  | { type: "audio-progress"; progress: AudioProgress }
  | { type: "result"; result: SourceResult }
  | { type: "failed"; code: LocalMediaCode }
  | { type: "stopped" }
);
