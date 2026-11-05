import { createContext } from "react";
import {
  ownerHookFrames,
  type OwnerHook,
} from "../../../../../packages/contracts/local/hook.ts";

export const EditorPresentationClock = createContext(false);
export function editorClockOffset(
  hook: OwnerHook | undefined,
  occurrence: "hook" | "body" | undefined,
  local = false,
) {
  if (!hook || !occurrence) return 0;
  return occurrence === "body"
    ? ownerHookFrames({ hook })
    : local
      ? 0
      : -hook.startFrame;
}

/** All source-oriented inspectors share the presentation-to-source mapping. */
export const EditorHookClock = createContext<OwnerHook | undefined>(undefined);

export const EditorOccurrence = createContext<"body" | "hook" | undefined>(
  undefined,
);
