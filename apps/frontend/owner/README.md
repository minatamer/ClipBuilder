# Local owner UI

The separate React/esbuild UI is served by the
[owner host](../../backend/owner/README.md) on `http://localhost:4100/`. It is not
a Next route and has no public navigation or hosted feature flag. Browser code
receives bounded IDs/metadata and relative local media URLs, never filesystem
paths, credentials or worker capabilities. The session capability is HttpOnly
and SameSite; mutations also require the exact local Origin.

CL-018 adds up to ten exact source-relative ranges (`HH:MM:SS.mmm`, 1–300
seconds) alongside independent simulated discovery. Set AI minimum/maximum
between 10 and 60 seconds; equal bounds request an exact duration. These settings
never alter manual requests. Each manual row shows its actual 30fps cut before
processing. Duplicate cuts share one processing identity and retain their row
origins. Distinct overlapping manual requests remain available.

Find moments is explicit: one fake transcription and at most one fake selection;
editing inputs makes no AI calls. Manual-only still transcribes once for cues.
No words or a source shorter than the AI minimum yields no AI suggestion while
preserving manual cuts. Fictional words do not describe source audio. Choose one
result, export locally, play/download the MP4, or clear the processing copy.
Several selected clips arrive in CL-019. Changing inputs invalidates the current
export selection. A refresh restores only completed analysis in this running
session; saved drafts arrive later. Failure/cancellation preserves input rows.

Busy controls are disabled and errors/statuses are announced. Fake AI and
paid-off labels remain visible. Encoding uses real local FFmpeg without API
keys; real AI and owner-media quality remain unverified. Real provider AI is not
composed here and would require keys, live flags and applicable approvals. No
offline model or weights are provided.

Build and focused checks use the root `owner:*` commands documented in the host
guide. Public frontend commands/configuration remain in the parent README.
