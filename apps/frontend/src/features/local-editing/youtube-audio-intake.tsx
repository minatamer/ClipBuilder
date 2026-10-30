import { ProcessingState } from "../../shared/ui/processing-state";
import { Button } from "../../shared/ui/button";
export function YoutubeAudioIntake({
  value,
  pending,
  onChange,
  onDownload,
  onBack,
  message,
}: {
  value: string;
  pending: boolean;
  onChange: (value: string) => void;
  onDownload: () => void;
  onBack: () => void;
  message: string;
}) {
  return (
    <div className="caption-empty youtube-audio-card" aria-busy={pending}>
      <h4>Sound from YouTube</h4>
      {pending ? (
        <ProcessingState label="Importing audio" />
      ) : (
        <>
          <label>
            YouTube URL
            <input
              autoFocus
              type="url"
              aria-label="YouTube audio URL"
              maxLength={2048}
              value={value}
              onChange={(event) => onChange(event.currentTarget.value)}
            />
          </label>
          <p className="source-hint">Audio up to 2 minutes · 12 MB</p>
        </>
      )}
      {message && (
        <p className="local-error" role="alert">
          {message}
        </p>
      )}
      <div className="audio-intake-actions youtube-audio-card-actions">
        <Button
          variant="primary"
          disabled={pending || !value.trim()}
          onClick={onDownload}
        >
          Download sound
        </Button>
        <Button variant="quiet" onClick={onBack}>
          Back to sounds
        </Button>
      </div>
    </div>
  );
}
