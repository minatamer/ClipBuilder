import type { OwnerWorkspace } from "../../../packages/contracts/local/index.ts";
import type { OwnerClip } from "../../../packages/contracts/local/clips.ts";
import type { OwnerWord } from "../../../packages/contracts/local/selection.ts";
export type ClipCaptionTranscription = (
  workspace: OwnerWorkspace,
  clip: OwnerClip,
  signal: AbortSignal,
) => Promise<OwnerWord[]>;
