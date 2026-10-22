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
preserving manual cuts. Fictional words do not describe source audio.

Choose up to ten manual/AI moments, then use **Process selected clips** once to
create separate automatic edit bundles and MP4s. The page shows the selected
count and upper bound of one simulated plan plus three simulated picture
attempts per clip. Actual AI calls remain zero. One heavy worker processes the
ordered list serially. Each clip displays its own state, simulated call counts,
native attempts, cancel action and download links. One failure does not discard
successful siblings. **Cancel all pending clips** also cancels the current job;
its state remains `canceling` until owned native work drains. A queued clip that
never started can be included in a new explicit processing action without
reprocessing completed siblings.

Review a completed clip while other selected clips continue. The Remotion Player
combines that clip's normalized local video with the
[shared fixed overlay](../../../packages/composition/owner/README.md) used for
native export. Captions and pictures are synthetic placeholders. **Export clip
again** runs local compute from the existing bundle with no AI calls and keeps
every earlier export link. This slice has an automatic base at edit revision
zero; caption/picture controls, personal image uploads and saved drafts arrive
in CL-020.

Changing analysis inputs invalidates the current selection without erasing
existing clip results. Refreshing restores completed analysis and acknowledged
clip work in this running session; it does not submit another processing
action. If an action is not acknowledged, refresh status before an explicit
retry. App restart does not restore ephemeral workspaces. Failure/cancellation
preserves input rows, sibling exports and the workspace source. Clear becomes
available after active work drains and removes the processing copy; browser
downloads remain outside that cleanup.

Busy controls are disabled and errors/statuses are announced. Fake AI and
paid-off labels remain visible. Encoding uses real local FFmpeg without API
keys; real AI and owner-media quality remain unverified. Real provider AI is not
composed here and would require keys, live flags and applicable approvals. No
offline model or weights are provided.

Build and focused checks use the root `owner:*` commands documented in the host
guide. Public frontend commands/configuration remain in the parent README.
