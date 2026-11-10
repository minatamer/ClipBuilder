import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/** Forms own their actions; an explicit target may be a card footer or editor toolbar. */
export function WorkflowActions({
  target,
  label,
  children,
  feedback = false,
}: {
  target?: HTMLElement | null | undefined;
  label: string;
  children: ReactNode;
  feedback?: boolean;
}) {
  const actions = (
    <nav
      className={`workflow-actions${feedback ? " workflow-action-feedback" : ""}`}
      aria-label={label}
    >
      {children}
    </nav>
  );
  // Standalone fixtures retain action ownership without requiring workspace chrome.
  if (target === undefined)
    return <div className="workflow-action-slot">{actions}</div>;
  return target ? createPortal(actions, target) : null;
}
