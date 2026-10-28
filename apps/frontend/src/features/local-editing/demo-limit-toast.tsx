import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";
import { HOSTED_DEMO_LIMIT_MESSAGE } from "../../../../../packages/contracts/local/hosted-editing.ts";
/** Remount for each correction so repeated attempts are announced and visible. */
export function DemoLimitToast({
  message = HOSTED_DEMO_LIMIT_MESSAGE,
}: {
  message?: string;
}) {
  const [visible, setVisible] = useState(true);
  const target = typeof document === "undefined" ? null : document.body;
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(timer);
  }, []);
  if (!visible || !target) return null;
  return createPortal(
    <div className="demo-limit-toast" role="status" aria-live="polite">
      <Info size={21} aria-hidden="true" />
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss demo limit notice"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>,
    target,
  );
}
