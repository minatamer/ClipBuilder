import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

export const FocusPreviewTarget = createContext<HTMLElement | null>(null);

/** One stable visual column; standalone editors retain their inline preview. */
export function FocusPreviewSlot({ children }: { children: ReactNode }) {
  const target = useContext(FocusPreviewTarget);
  return target ? createPortal(children, target) : children;
}
