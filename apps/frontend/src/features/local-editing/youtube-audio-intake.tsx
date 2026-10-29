import { ProcessingState } from "../../shared/ui/processing-state";
export function YoutubeAudioIntake({
  value,
  pending,
  onChange,
}: {
  value: string;
  pending: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="caption-empty" aria-busy={pending}>
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
    </div>
  );
}
