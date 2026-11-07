import { LoaderCircle } from "lucide-react";
import { Button } from "../../shared/ui/button";

/** The same task and cancellation remain reachable from Hook or its Apply action. */
export function HookTitleProgress({
  id,
  onCancel,
}: {
  id: string;
  onCancel: () => void;
}) {
  return (
    <div
      className="hook-title-progress"
      id={id}
      role="status"
      aria-live="polite"
    >
      <div className="hook-title-progress-copy">
        <strong>
          <LoaderCircle
            size={16}
            className="acquisition-spinner"
            aria-hidden="true"
          />
          <span>Writing a title…</span>
        </strong>
        <p>Apply is paused. Cancel to keep your current title.</p>
      </div>
      <Button variant="secondary" aria-label="Cancel title" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
