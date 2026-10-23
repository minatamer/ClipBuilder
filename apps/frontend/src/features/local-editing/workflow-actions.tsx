import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/** Keep action ownership with its form while mounting submissions in the frame footer. */
export function WorkflowActions({
  target,
  label,
  children,
}: {
  target?: HTMLElement | null | undefined;
  label: string;
  children: ReactNode;
}) {
  const actions = (
    <nav className="workflow-actions" aria-label={label}>
      {children}
    </nav>
  );
  // Isolated component previews own a footer; the running workflow supplies its frame slot.
  if (target === undefined) return <footer>{actions}</footer>;
  return target ? createPortal(actions, target) : null;
}
