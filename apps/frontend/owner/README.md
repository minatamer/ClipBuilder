# Local owner UI

The separate React/esbuild UI is served by the
[owner host](../../backend/owner/README.md) on `http://localhost:4100/`. It is not
a Next route and has no public navigation or hosted feature flag. Browser code
receives bounded IDs/metadata and relative local media URLs, never filesystem
paths, credentials or worker capabilities. The session capability is HttpOnly
and SameSite; mutations also require the exact local Origin.

The source panel accepts an upload, a YouTube link or a saved local source.
**Look for saved source locally** checks canonical link aliases without a
metadata request; **Use saved video** opens an intact saved variant without a
URL, downloader or AI call. New metadata and Import actions are explicit. The
current fake entry offers 720p, 1080p and 2160p at 30fps, generating a complete
16-second synthetic source at the chosen dimensions. It does not retrieve the
linked video. Import then performs real local merging, inspection and saving.

Downloads uses the actual OS known folder; Desktop is an explicit choice for
new acquisitions. A matching saved source is reused where it already lives.
The source catalog shows provenance and integrity, warns at 50 GiB and supports
explicit deletion or locating an exact missing copy. Clearing a workspace or
deleting a draft preserves saved source masters. See the
[source acquisition guide](../../backend/owner/SOURCE_ACQUISITION.md) for exact
quality selection, capacity limits, repair rules and the dormant real downloader.

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
native export. In the current fake runtime its automatic captions and pictures
are synthetic placeholders. CL-020 adds a small local presentation editor over
each immutable automatic base; changing one clip does not change its siblings.

Caption controls offer Clean, Classic and Bold presets, requested size from
32–80 portrait pixels, text/highlight colors, alignment and a normalized box.
Captions keep their existing words and timing. The caption box needs 5% portrait
margins, width at least 0.6 and height for two lines at the requested size.
Exceptionally long words or wide lines shrink deterministically to fit; the
requested size is a maximum, not a guaranteed rendered minimum. **Reset
captions to automatic** restores the original fixed appearance.

Picture controls select an existing cue, replace its registered asset, remove
it, or add a cue up to the three-picture limit. Set clip-relative start and
exclusive end frames at 30fps, position/size and centered contain/crop fit. The
list determines picture stacking; captions stay above pictures. An overlap
notice preserves the chosen placement. JPEG/PNG import accepts at most 4 MiB
and 16 million decoded pixels; the local host inspects actual bytes, normalizes
orientation, strips metadata and registers a bounded JPEG before preview. A
personal picture retains owner-supplied provenance. Uploading registers an
asset without changing a cue automatically, and the clip retains at most 20
registered assets. **Reset pictures to automatic** restores the base cues.

The portrait preview supports play/pause/scrub and layer selection. Drag the
layer or its corner to move/resize; arrow keys perform the corresponding
operation and Alt increases the step. Numeric box fields provide the same
controls. Pointer movement uses the displayed portrait dimensions to preserve
1080×1920 geometry at smaller preview sizes. Gestures clamp to contract bounds;
invalid numeric input is reported and leaves the acknowledged preview visible.

Controls first create unapplied local changes. **Apply changes to clip** submits
an allowlisted patch with the expected revision and base hash. Acknowledged
changes update preview without starting AI or an export. The same protected
host accepts the [local agent commands](../../backend/owner/AGENT_COMMANDS.md)
with the browser closed. An open browser polls every second when idle and
every 750 ms during native work, so agent edits/exports appear in this review.
Polling preserves a
dirty form; a conflicting revision requires an explicit reload, which discards
unapplied controls. Apply or discard before switching review or exporting that
clip. Edits acknowledged during an existing render create a newer revision
while the running export keeps its frozen snapshot. **Export clip again**
explicitly renders the current acknowledged revision with no AI calls. Each
output is immutable, earlier links remain available and older edit revisions
are labelled.

Analysis and edits are session-only until **Save draft locally** succeeds.
An imported source is already retained independently in the source library.
First draft save is
available after active native work finishes; it retains the source master, validated
analysis/candidates, clip bases, applied edits, normalized assets/cuts and
completed exports under separate Downloads/ClipBuilder source/draft/export
areas. Acknowledged changes then autosave to the same draft. Unapplied browser
controls are not saved. The panel distinguishes session-only, saving, saved and
unsaved, shows the last completed save and offers **Save draft now**. A failed
save leaves the running workspace and any last good saved copy available.

Clear the processing workspace before opening a saved draft. Reopen validates
the saved schema and source/asset/output bytes, restores completed work and
starts no processing; interrupted jobs remain canceled until an explicit
action. Saved drafts survive an app restart without another AI run. Deleting
the specifically confirmed draft removes its owned draft files, preserving its
source master and independently saved exports. Sources and exports have no
automatic draft-deletion cleanup.

Changing analysis inputs invalidates the current selection without erasing
existing clip results. Refreshing restores completed analysis and acknowledged
clip work in this running session; it does not submit another processing
action. If an action is not acknowledged, refresh status before an explicit
retry. App restart does not restore an unsaved ephemeral workspace.
Failure/cancellation preserves input rows, sibling exports and the workspace source. Clear becomes
available after active work drains and removes the processing copy; browser
downloads remain outside that cleanup.

Busy controls are disabled and errors/statuses are announced. With
`FAKE_MODE=true` and `PAID_DEMO_ENABLED=false`, simulated AI requires no API keys.
Editing a valid prepared bundle, previewing and native FFmpeg export need no AI
keys, even when its original provider is unavailable. Real provider adapters
remain uncomposed; keys alone cannot enable real automatic analysis. That work
also needs an implemented adapter, live flags and applicable owner approvals.
No offline model or weights are provided. This guide describes implemented
controls, not a passed manual UI or real-media quality review; ticket evidence
and owner acceptance track those separately.

Build and focused checks use the root `owner:*` commands documented in the host
guide. Public frontend commands/configuration remain in the parent README.
