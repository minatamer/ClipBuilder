import { createContext } from "react";
import type { OwnerHook } from "../../../../../packages/contracts/local/hook.ts";

/** All source-oriented inspectors share the presentation-to-source mapping. */
export const EditorHookClock = createContext<OwnerHook | undefined>(undefined);
