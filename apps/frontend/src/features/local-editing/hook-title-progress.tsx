import { ActivityIndicator } from "../../shared/ui/activity-indicator";
import { Button } from "../../shared/ui/button";

/** One title task stays reachable from Hook or the workspace toolbar. */
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
          <ActivityIndicator size={16} />
          <span>Writing a title…</span>
        </strong>
        <p>Autosave waits for this title. Cancel to keep the current title.</p>
      </div>
      <Button variant="secondary" aria-label="Cancel title" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
