# CL-271 — Layered picture/video B-roll, zoom and full-frame visuals

Status: implemented; generated/local checks and the authorized real functional
acceptance passed, 2026-11-09. One provider processing run produced the clip;
three independent review drafts and one layered MP4 are saved in Downloads.
Reopening the layered draft retained its media, edits and export without new
processing. The normal app remains running in Codex; Voyagenda was preserved.
Personal visual/release acceptance remains owner-only.

## Owner whole-file commit authorization — 2026-11-10

The owner explicitly requests staging and committing all fixes after clean
validation. Combined CL-271/CL-272/CL-062 validation has no actionable findings;
39 focused frontend tests and all changed-file formatting/lint checks pass,
alongside the recorded backend/types/native/generated/Codex checks below.
The complete 50-path allocation is recorded in
[CL-272](CL-272-shared-video-thumbnail-consistency.md#whole-file-commit-authorization-and-validation--2026-11-10).
One local commit preserves whole shared files. Earlier unstaged/no-Git statements
are historical and superseded by this request. No paid/provider run, push,
deployment, owner-media change or Voyagenda action is included.

## Owner local-only framing choice — 2026-11-10

Status: implemented and fake/paid-off verified. The owner restricts the pre-processing tracking/no-tracking
choice to the local app. Local processing defaults to tracked vertical framing
and can explicitly choose No tracking · Fit original. Hosted processing exposes
no framing selector and always uses the tracked path, including requests sent by
older clients with `framing: "fit"`. Normalize valid hosted requests at the
trusted API boundary; preserve request validation, admission/idempotency and
the shared hosted picture/video/Camera editor. This supersedes the earlier
hosted framing-choice wording and fit acceptance only.

Acceptance: verify local selector/default and hosted omission, fresh hosted
processing with omitted/explicit-fit payloads using tracked planning, retained
hosted layered editing, and unchanged local fit behavior. Use generated/injected
fake/paid-off checks without keys or another paid run. Preserve the owner's
session/media, configuration, other pending work and Voyagenda. Real processing
still requires its existing runtime/provider setup, live flags and approvals.
No deployment or new Git mutation is included.

The shared frontend gates the selector with the existing local-media capability
and forces hosted submission to tracked. The hosted API parses the existing
shared request schema before normalizing its framing, so invalid input retains
normal rejection and valid older fit requests reach tracked planning. No schema,
saved-edit, provider adapter or manual Camera behavior changes.

Evidence: 91 focused checks pass across local fresh batches, hosted HTTP workflow
and frontend capabilities. Hosted omitted/explicit-fit submissions produce tracked
clips; the explicit-fit case invokes the injected planner exactly once and
retains generated visuals/audio through layered picture/video edits and export
without more planning. Existing local fit regressions remain passing.
Local/test/frontend TypeScript, scoped ESLint, Prettier and diff checks pass.

Codex checks use a separate generated loopback panel. Actual submitted payloads
are tracked by default, fit when chosen locally, and tracked after switching the
same fit-selected component to hosted capabilities. The hosted selector/help is
absent, local default is tracked, and desktop/390px phone layouts retain a visible
footer without horizontal overflow. Screenshots remain outside Git. The fixture
tab/server/scratch and temporary viewport were cleaned; the normal owner session,
configuration, media and Voyagenda were untouched. No paid/provider run or Gemini
acceptance is claimed. Read-only validation: meets this follow-up; no actionable
findings. Changes remain unstaged/uncommitted; deviations: none.

## Owner fit-original titles and placement — 2026-11-10

Status: implemented and generated/local verification passed. The owner reports missing generated titles in no-vertical
framing and requests default title placement above the fitted source and picture
placement below it. Explicitly request an authored opening title with the existing
single transcript-only fit plan and prove nonempty returned copy reaches fresh
base/edit state for both providers. Do not invent a title or add a paid retry if
the provider returns no usable copy. The earlier Hook fix requested title advice
but its fit regressions supplied empty texts; extend that verification.

Use the actual even-pixel contain/pad source rectangle to place fresh titles and
pictures in available upper/lower bands. Cover initial/Hook-generated titles,
Find visuals and newly added pictures; retain manual/saved coordinates, timing,
emphasis, retry/drafts and preview/export parity. Full-height sources without
usable bands retain bounded editable fallback positions rather than shrinking
or recropping the owner's source. Vertical-framing defaults remain unchanged.
Verify generated/injected transport, fresh batch, placement and saved-state
behavior plus a Codex visual check, with no keys, new paid run or Voyagenda work.
Real provider quality still needs its normal keys/live flags/approvals.

The fit-only editorial schema/prompt now explicitly asks for one authored title
in the same planning request. Both injected provider tests return nonempty title
copy and verify it reaches the opening-title cache at frame zero. Usable empty/
malformed provider output remains advisory, without a retry or fabricated title.

`placeOwnerFitOriginalVisual` uses the existing exact even-pixel contain/pad
rectangle. New fit titles (including separately requested Hook titles and added
text) default into the upper safe band; generated/Find visuals/newly added
pictures default into the lower band. Tracked and added-video defaults retain
their preceding behavior. No saved schema, source crop or renderer policy changes;
positions are ordinary persisted editable boxes, shared by preview/export.
Sources without sufficient band space keep bounded editable fallback geometry.

Evidence: 149 checks pass across provider adapters, fresh batch and placement
tests. The new connected Codex-shaped fresh fit batch retains actual authored
copy and a generated picture through the real decode/cache/base/edit path, with
one planning call and no native camera work. It proves above/below coordinates,
manual text position persistence on restore and a subsequent Find visuals request
that remains picture-only, preserves the manual title and places pictures below.
Landscape, wide, square and full-height fallback geometry is covered.

The current-source native text export proof passes, including typography and
exact frame boundaries. Frontend/local/test/contracts TypeScript, scoped ESLint,
Prettier and diff checks pass. The contracts build passed via direct pinned
`corepack pnpm --filter @clipbuilder/contracts build`; the root wrapper had picked
up a different global pnpm internally, so no install/configuration change was made.

Codex inspection of an isolated generated fit editor confirms authored title above,
fitted source centered and picture below at desktop/phone widths without overflow.
Adding a picture placed it at y=0.678229, below the source's bottom; the temporary
edit was discarded. Screenshots are outside Git. These are synthetic content and
layout mechanics, not a claim about real provider title quality or owner acceptance.

The documented native worker/overlay rebuild completed. After confirming idle
processing and a current rolling recovery, the verified ClipBuilder watcher
reloaded its API/internal worker; old processes exited, health returned 200 and
the frontend PID stayed unchanged. The normal workspace restored its one clip;
/start and /api/sample/config return 200. Saved media/configuration and Voyagenda
were preserved. The isolated fixture/tab/scratch/temporary viewport were cleaned.

Final read-only validation of this follow-up: meets ticket, no actionable findings.
No paid/provider inference, owner-clip reprocessing, deployment, staging or commit.
Earlier unstaged work is preserved. Personal visual/live-provider acceptance stays
manual. Deviations: none.

## Owner fit-original Hook follow-up — 2026-11-10

Status: implemented and fake/paid-off verified. The owner reports no suggested Hook after choosing No
tracking / Fit original. That path bypasses the camera planner and invokes the
transcript-only picture planner, whose schema/prompt omit Hook and title advice.
Retain optional valid Hook/title advice from the same transcript-only planning
response, for both Codex and Gemini. Do not restore camera/speaker/frame work,
add another inference call, auto-apply a Hook, fabricate a suggestion when null,
or reprocess/change the owner's existing clip. Preserve save/retry/restore behavior.
Manual Find visuals stays picture-only. Cover fresh fit processing and provider
transport boundaries with injected fake calls, exact counts and retained advice.
No more paid runs or Voyagenda changes. Real inference retains credentials,
live flags and approvals; all agent verification is fake/paid-off with no keys.

The fit-original batch marks its existing transcript-only request as including
editorial advice. The shared planner conditionally adds the existing Hook/title
schema and policies to that one request, retaining decoded advice in each
provider adapter's existing clip cache. Camera focus remains absent. Explicit
Find visuals requests omit this flag and remain picture-only. Hook advice is
copied into the ordinary preparation/base checkpoint before image work, retaining
the established retry/draft/restore behavior; a null/invalid/early suggestion stays
absent and a usable suggestion is never automatically applied.

134 checks pass across clip-batch, Codex adapter and Gemini adapter tests. New
injected transport cases prove one text-only call, retained Hook advice, zero
media/speaker/frame/upload/transcription work, and cleared advice on close. The
fit batch check proves the request flag, no automatic Hook/follow, and retained
suggestion through restore/export with no replanning. Local TypeScript, scoped
ESLint and formatting pass. Read-only validation: no actionable findings.
No owner clip was reprocessed or changed. This repairs fresh processing; the
owner's prior result is preserved rather than retroactively claiming it fixed.

## Owner framing wording revision — 2026-11-10

Status: implemented and locally verified. The owner requests more intuitive pre-processing labels:
replace Face tracking / Portrait with **Vertical framing (9:16)**, retain
**No tracking · Fit original**, and mention that 9:16 is the vertical format
used for TikTok, YouTube Shorts and Instagram Reels. Use a concise, accessible
description beside the existing Framing control instead of a long option that
clips on phones. The same shared control applies locally and when hosted.

This is copy only: preserve tracked/fit values, defaults, behavior, saved edits,
retry and Process clips gates. Verify both labels and the linked description,
desktop/phone wrapping, select interaction and footer visibility without
processing or touching the owner's current session, paid providers or Voyagenda.
Existing no-key/fake-mode UI checks are sufficient; live provider processing
still requires keys, enabled flags and applicable approvals. No Git mutation,
configuration, backend/worker or deployment is part of this follow-up.

Implemented in the shared OwnerClipBatchPanel: the tracked option is now
Vertical framing (9:16), the fit option is unchanged, and a permanently reserved
description below the select names TikTok, YouTube Shorts and Instagram Reels.
The select references this description with aria-describedby, using its existing
unique ID. No hook, value/default, contract, processing behavior or saved format
changed. The same code renders the deployed workflow without provider-specific
branching.

Verification: the existing runtime-capabilities suite passes all 10 tests,
including hosted framing availability and processing guards. Frontend TypeScript,
scoped ESLint, Prettier and diff checks pass. Codex inspection uses a separate
fake/paid-off hosted-shaped batch panel at 1342x586 and 390x844: both options
switch correctly, the description is linked, the phone note wraps within the
control width, there is no horizontal overflow and Process clips stays visible
and disabled for the empty synthetic selection. No processing was submitted.
Desktop/phone screenshots remain outside Git in the Codex visualization folder.
The fixture tab/server/scratch and temporary viewport were closed/reset; the
owner session, media/configuration, prior CL-062/272 work and Voyagenda remain.

Read-only validation: meets this copy-only follow-up, no actionable findings.
No new tests, provider/API/model calls, worker restart, deployment, staging or
commit. Real-provider quality and owner personal visual acceptance are not
claimed. Deviations: none.

## Owner timeline-thumbnail investigation — 2026-11-10

The owner now requests fixing the omission, then seeing the existing pre-process
face-tracking choice and receiving the retained public YouTube URL. Implement
bounded, serial, source-trim-aware thumbnails using existing admitted video bytes;
deduplicate repeated source/frame requests, retain picture thumbnails and stable
row geometry, and release readers/decoders/canvases/object URLs on cleanup.
Verify actual pixels, trimmed/repeated/Hook placements, reload, failure and
unmount in generated fake/paid-off checks. Preserve the normal review session and
Voyagenda; no further paid/provider runs. Show Framing (currently a selector,
not a checkbox) in an isolated generated processing view without submitting it.
Current follow-up status: fixed and verified; personal review remains owner-only.

Implementation: VideoTimelineThumbnail now extracts a 160x120 still from the
first visible raw source frame, using the existing pinned Mediabunny reader.
The shared occurrence clock accounts for independent source trim and Hook/body
clipping once. Mounted rows share source/frame results; a serial queue owns one
silent decoder, a 4 MiB range cache and a ten-second timeout, without retries.
Leaving the timeline releases its inputs, canvases and blob URLs. Pending/failed
stills use a video icon in the same fixed tile, preserving row size and actions.
Pictures keep their existing image backgrounds. No backend/worker, contract,
saved-edit shape, provider, dependency or configuration change is required.

Verification: the generated StrictMode browser proof passes at 1440 and 390
pixels, including six Hook/body placements sharing four unique stills at raw
frames 0, 15, 30 and 45. Decoded grayscale pixels establish the chosen frame;
reload retains source trims, repeat placements share URLs, the maximum live
VideoDecoder count is one and the settled count is zero. Panel unmount revokes
all still URLs; remount paints again without changing tile geometry or creating
Apply edits. Both picture rows remain. Four injected missing-frame reads produce
four failures total, no retry, and stable icon fallbacks. All requests remain
loopback and fixture Apply count is zero. Frontend/test TypeScript, scoped ESLint,
formatting and diff checks pass. The earlier color-palette test was replaced by
unambiguous grayscale levels to avoid treating video color-matrix differences as
frame-selection errors; the strict pixel threshold was retained.

Codex read-only verification of the normal restored layered draft confirms both
real video rows have ready blob-backed thumbnails at raw frames 0 and 90. During
verification its previous working session reported unavailable; reopening the
preserved review reference restored it without processing or applying edits. The
normal editor remains open at Video 1 / 18s. Saved media, edits and exports and
Voyagenda are preserved. A separate generated processing view shows the existing
Framing selector, including No tracking · Fit original, without pressing Process
clips. Screenshots remain owner-local outside Git. No new paid/API/Gemini run.

Final validation: **Meets this follow-up; no actionable findings.** The initial
omission is resolved. Thumbnail decoding works with fake AI and no API keys;
fresh provider work still needs its normal credentials/live flags/approvals.

Whole-file follow-up allocation under the owner's existing local-commit
authorization, with no push:

- apps/frontend/src/features/local-editing/clip-editor.tsx
- apps/frontend/src/features/local-editing/video-timeline-thumbnail.tsx
- apps/frontend/src/features/local-editing/style.css
- apps/frontend/README.md
- test/owner-broll-browser-fixture.ts
- test/local-video-thumbnails.proof.ts
- docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
- docs/tickets/CL-271-muted-video-b-roll-with-continuous-captions.md
- docs/tickets/README.md

Initial investigation (superseded by the fix above):

The owner reports blank thumbnail tiles on the Video 1 / Video 4 timeline rows
and asks why. Expected behavior is a recognizable thumbnail for each visual
row, including uploaded videos, while retaining row selection, clocks and layout.

The initial cause was confirmed: video timeline thumbnails were unimplemented. In
clip-editor.tsx, the picture-kind timeline preview always creates picture-thumb,
but explicitly sets backgroundImage to undefined when the cue has video. No
video, canvas, poster image or thumbnail source replaces it. The shared visual
timeline therefore displays an empty styled tile for every video placement.

Read-only inspection of the running restored project confirms both video rows
have a thumbnail element with no background or media children, while both picture
rows have image backgrounds. Both admitted video elements are at readyState 4,
with a usable source/duration and no media error. The media and draft restoration
are intact; the omission is in timeline rendering. No application code, owner
edits, media, configuration, provider processing or Voyagenda process was changed.
No paid/API/Gemini call, test pipeline, staging or commit was performed.

A future fix should derive a bounded still from each placement's admitted video
source and source trim, handle repeated assets and Hook occurrences, preserve
selection/row geometry, and release any decoder/canvas/object URL on cleanup.
This manual-media thumbnail path needs no API key or provider/model call; fresh
provider processing retains its existing live flags and approval requirements.
Generated fake/paid-off browser verification should check actual thumbnail pixels,
trim clock, restore, failure/cleanup and the existing picture rows before claiming
the omission fixed. This investigation establishes the cause only.

## Owner added-video preview/export/draft acceptance — 2026-11-09

The owner requests a connected acceptance test of Pan and Face tracking on an
added video: the large animated preview must match the native export and edits
must survive saving/reopening a draft. No more paid runs and no Voyagenda work.
Use freshly generated media, the real browser tracker/editor, actual edit/upload
transport, current-source native rendering and the normal draft store. Compare
matching playback frames (after leaving temporary crop inspection), including a
nonzero display start and source trim. Check both effect/path persistence and
reopened paint; preserve owner media, configuration and the running normal app.
Record aggregate pixel/geometry evidence and retain review artifacts outside Git.
No provider keys, model download, paid/provider/Gemini run or deployment is
needed or authorized. Status: implemented and verified; owner visual review is
pending. The owner's latest instruction separately authorizes whole-file staging
and a local ticket-prefixed commit once the ticket is done, without pushing.

Connected acceptance found and fixed two mechanical frame mismatches:

- Paused preview seeks at an exact CFR boundary could display its predecessor.
  Shared preview, inspector, tracker and native sampling now seek one quarter
  frame inside the intended frame, without changing saved trims or timestamps.
  Native capture also waits for the exact decoded-frame callback and committed
  compositor paint, rather than treating seek completion as presented pixels.
- Chromium drops alpha from opaque full-frame screenshots. Switching RGB/RGBA
  mid-sequence reset FFmpeg's filter graph and shifted the export. The capture
  writer now normalizes RGB screenshots to RGBA with the repository's existing
  pinned Sharp version, declared directly by the renderer. Already-RGBA frames
  and transparent pixels are preserved; the normal mux graph stays unchanged.

The opt-in generated acceptance helper uses the real StrictMode editor, seeded
browser pixel tracker, upload/edit HTTP boundaries, current-source native worker
and normal Downloads draft store. A six-second added video starts at presentation
1s with a 0.5s raw-source trim, 1.25x Zoom, manual Pan and a complete 91-sample
face path. The saved path moves 0.329 of the source width. This is a generated
tracking/mechanics proof, not a claim about arbitrary real-face tracking quality.

At presentation frames 30, 116 and 186, the large playback preview and decoded
MP4 have mean RGB error 2.36, 2.10 and 1.92 out of 255, respectively; global RGB
SSIM exceeds 0.999 at all three. The tracked face bounds differ by at most one
pixel at 360x640 preview size. Comparison excludes player controls and selection
decoration; these intentionally never appear in the MP4. Saving and reopening
retained identical edit, compiled-overlay and MP4 hashes, with zero new native
calls. The reopened browser retains Pan 1–7s, the selected target at 1s / raw
0.508333s, and the completed tracking controls. Review reference, MP4, frame
comparisons and aggregate measurements are saved outside Git under
Downloads/ClipBuilder/CL-271-review in the new generated Pan-face-tracking folder.

Final follow-up checks: 18 focused camera/inspection/clock regressions; native
B-roll HTTP/audio/draft proof; and the new exact-frame/240-frame RGB-to-RGBA cue
boundary proof all pass. Local/test/renderer TypeScript and scoped ESLint pass.
The normal contracts/worker were rebuilt. The isolated fixture and intermediates
were cleaned up, retaining review artifacts. No additional provider, paid or
Gemini calls, ignored configuration changes, owner-media changes or Voyagenda
operations were made. Earlier shape/native-render checks alone did not establish
this stronger pixel parity; these measurements supersede that limitation.

Final local lifecycle: rebuilt contracts and the normal worker, verified and
stopped only the owned backend launcher/descendants, checked both private ports
released, then started supervisor 7332. The current worker was created after its
build; health, /start and /api/sample/config return 200. Frontend PID 9420 was
preserved. The normal browser recovered the existing 41-second editor without
processing. The content-safe runtime/log record remains in the existing
owner-local temporary ClipBuilder directory; stderr continued writing after the
launch tool returned. The generated acceptance host/listeners and scratch are
gone. The normal app remains running for owner review.

## Owner Pan and face-tracking clarification — 2026-11-09

The owner clarified that Motion means following a marked face/head, as in the
original clip. Preserve the useful manual movement between two framings, name
it **Pan** (rather than Translation), and make it available for the original
video as well as added pictures/videos. Camera owns Zoom, Pan and Face tracking;
Media continues to own assets, placement, fit, layers, timing and volume.

Implement separate, consistent Camera tabs and source-frame pickers. Existing
manual media paths remain Pan without migration or lost edits. Original-video
Pan preserves magnification while changing framing. Video face tracking reuses
the existing bounded, manually seeded browser pixel tracker on the raw uploaded
source, with explicit start/cancel/retry and saved paths used by preview/export.
Pictures retain Zoom/Pan; a static picture has no temporal face-tracking action.
Preserve source trims, occurrence clocks, large-preview inspection, layer order,
saved compatibility, progress/footer/error conventions and shared hosted code.

Acceptance: synthetic path validation and clock/geometry/save/Hook regressions;
generated browser Pan on all three target types and actual raw-video tracking;
current-source native parity for tracked/zoomed video; cancellation and repeated
opening must not start work. Rebuild/reload only the owned ClipBuilder worker
when shared contracts/composition change. All checks use fake/paid-off/no keys;
the one authorized paid run has already been used. No Gemini run, deployment,
ignored configuration, Git mutation or Voyagenda action. Status: implemented and
verified; personal visual/release acceptance remains owner-only.

Implementation and verification:

- Media Camera now names its manual movement Pan, retaining the same Zoom/Pan
  source picker, Start/End framing, target selection, exact large-preview crop
  inspection and saved effect shape. Pictures expose Zoom/Pan/Transitions;
  videos additionally expose Face tracking. Original Camera has a Pan tab and
  explicitly names its existing head-follow tab Face tracking. Original Pan
  reuses the timed camera editor with an optional persisted kind; the shared
  sampler retains the preceding camera magnification through the pan and hold.
  Legacy untagged Zoom and original tracking documents remain compatible.
- Uploaded-video tracking reuses the browser pixel tracker with an explicit raw
  source mode, plus the shared inline/expanded head-selection view. Start/End
  Capture, local feedback, measured progress and footer Track face / Cancel use
  existing primitives. Opening/reopening never tracks automatically. Aborting
  drops pending work and late replies; usable loss prefixes can be retained.
  Shared head-box/path fields and coverage validation are factored once, with
  original-camera behavior preserved. Tracking requires neither API keys nor
  downloaded AI weights and performs no biometric identification.
- Saved visual tracks bind to immutable asset identity and the raw trim clock,
  with bounded 0.2–30 s sample coverage. Source overflow, gaps, mismatched seeds,
  picture tracks and stale asset/trim bindings are rejected. Hook copies retain
  the original path and adjust only visible/source cue clocks. Shared paint adds
  tracked displacement to Zoom/Pan and includes it in native raster-cache identity;
  manual crop inspection temporarily excludes tracking without saving that state.
- Final validation caught an admission limit that conflated the two-minute raw
  video clock with its placement in a longer clip. Presentation clocks now use
  the established clip bound; source coverage remains bounded by its asset.
  Regression checks include a placement after 200 s, changed trim and substituted
  asset identity. No unrelated architecture/provider changes were introduced.
- **53 focused fake/paid-off/no-key regressions passed** across shared camera,
  pixel tracking, selection, media crop/inspection, edit transport and Hook data.
  The final six-test visual suite also passed after the clock/binding correction.
  Frontend/test TypeScript, browser-safe local contracts, native/local TypeScript,
  scoped ESLint and diff checks pass. The unrelated pre-existing whole-repository
  lint finding remains outside this revision; no full-suite green claim is made.
  The current-source synthetic native B-roll proof passed with a tracked, zoomed
  inset video, layered pictures, original/audio mixes and hashed draft reopening;
  it starts no provider/image/planning calls. This does not establish real-face
  tracking quality or Gemini provider quality on arbitrary footage.
- Generated Codex-browser checks used real gestures for original-video Pan,
  video Pan and picture Pan. A detailed moving synthetic region was followed for
  the complete two-second interval: 31 samples and about 0.088 normalized horizontal
  displacement. HTTP Apply/reload retained tracking, original Pan and media paths;
  switching/adjusting/canceling did not start new tracking. Cancel during a running
  attempt returned to clean controls without creating an edit. Final-code tracking
  completed and applied once in a second fixture with the asset-bound contract.
  Video Pan crop inspection matched the source rectangle within about 0.000001
  normalized units; the picture difference was browser subpixel rounding.
- Tracking timing fields initially became cramped in the two-column inspector.
  Reused the existing full-width boundary layout. Settled valid/error/corrected
  states at 1440, 768 and 390 widths retained identical source, preview, endpoint
  field and footer rectangles, with no horizontal overflow and working Capture.
  Normal owner media was only reloaded/selected, never edited or tracked: Video 1
  reopened at 18.000 s with enabled Pan picker and a clean Export footer.
- Contracts/native worker rebuilt and the owned backend was reloaded after
  verifying current rolling recovery. One hidden-console graceful signal could
  not attach; scoped creation-time-verified cleanup released both owned backend
  ports before replacement. A watcher/build ordering race was detected and the
  backend was refreshed to load the current bundle. The original frontend stayed
  running. Both generated fixture roots/listeners and their temporary runner were
  cleaned; owner sources, edits, exports, configuration and Voyagenda were preserved.

Lightweight validation: **Meets ticket; no actionable findings** for this revision
after the binding/clock/layout corrections. Shared local/hosted code is available
for the next hosted build; no deployment, Gemini test, new paid call or Git mutation.

## Owner exact crop inspection in the large preview — 2026-11-09

The owner requires the large composition preview to show the exact crop being
chosen when moving the picture/video Zoom or Motion frame, beyond sharing its
timestamp. While editing a target, temporarily paint that target's framing and
magnification on the selected media at the current source moment. Motion Start
and End must each show their own chosen crop; selected-media transitions must
not hide the crop during inspection. Keep its viewport, fit, layer order, other
media and captions intact, and preserve the Camera layout and shared picker.

This is editor-only inspection, separate from persisted animation data. Preview
and normal Play restore the real animated composition. Clear inspection on
target/occurrence/tab changes, Apply/Discard and preview recovery. Invalid edits
retain the last valid crop and existing guards. Preserve saved effect windows,
source trim, Hook/body mapping, native export behavior and owner saved edits.

Acceptance: pure inspection/immutability/occurrence regressions; generated real
pointer/keyboard and numeric adjustment of picture/video zoom and Motion Start /
End, with crop math compared between the source picker and large preview.
Verify replay restores animation, selection/navigation/reset behavior, invalid /
corrected input and responsive geometry. Use fake/paid-off/no-key checks only.
Shared Codex/hosted Gemini code; no paid/provider test, deployment, configuration,
worker restart, Git mutation or Voyagenda action. Status: implemented and verified;
owner visual acceptance remains personal.

Implementation and verification:

- `media-camera-inspection.ts` derives a temporary paint overlay for the selected
  cue and occurrence. It holds the chosen endpoint's position/magnification and
  suppresses that cue's entrance/exit only while inspected. It clones the selected
  paint data, retaining cue timing, source trim, fit, viewport, order, other media
  and captions. Nothing enters the edit document, backend or native composition.
  Parent state binds inspection to the selected cue, occurrence and acknowledged
  edit. Only cue/occurrence/endpoint are passed into the preview.
- Pointer, arrow-key and numeric Zoom/Motion changes update that inspection.
  Start and End selection show their own crops, including at a faded boundary.
  Preview and the main Play control both restore normal animated paint. Target /
  occurrence / editor-section changes, Transitions, effect removal, Apply/Discard
  and existing preview recovery clear or invalidate inspection. Zoom/Motion tab
  changes select their corresponding new target. The recovery reset is wired
  into the existing retry; a new failure/retry UI case was not forced.
- Generated Codex-browser checks exercised real video pointer dragging, keyboard
  nudges and numeric changes, picture/video Motion Start/End, inset and full-frame
  pictures, covered layers, source trims and independent Hook/body occurrences.
  Measured the actual large layer's fit, object position, scale and viewport
  against the source picker's rectangle. Integer viewports matched within about
  0.000001 normalized source units; fractional inset picture geometry differed
  only by browser subpixel rounding (under 0.004 source pixels).
- A generated 1.8× crop at presentation 0.5 s stayed at that same source moment
  while the large frame matched the target. Motion Start showed 1× and its own
  position; End showed 1.8× and stayed visible at the otherwise faded final frame.
  Preview and main Play restored the real 1× start and subsequent animation.
  Hook and body inspection remained independent.
- A review reproduced an existing saved Motion losing its picker when its
  endpoints became identical. Entering existing Motion now retains its local
  authoring state. A current-source generated check set both endpoints to the
  same position and then moved End with the keyboard: the picker remained active
  and its crop still matched the large preview.
- Generated HTTP Apply retained a picture's 2.25× saved effect but immediately
  restored the real 1× animation start. A later 2.3× edit and Discard restored
  2.25× data and normal paint. Page reload and body selection retained that effect
  without temporary inspection state. One fixture Apply was used; no owner media
  was edited. Valid/invalid/corrected inspection at 1440, 768 and 390 widths held
  matching crops, clocks and preview/source/field/footer geometry with no page
  overflow. Invalid zoom kept Preview disabled and the last valid crop visible.
- **20 focused tests passed**, including six new crop/immutability/occurrence
  regressions. Sandbox temporary transform-cache misses required isolated reruns
  of the affected suites; those passed without source/test changes. Frontend/test
  TypeScript, scoped ESLint, formatting and diff checks passed. The frontend
  client-component guide was checked; no server/client or dependency boundary
  changed. Lightweight validation: **Meets ticket; no actionable findings** after
  fixing the equal-endpoint gesture. Native/provider suites were not repeated for
  this editor-only paint state; existing export contracts/composition are unchanged.
- The normal retained Video 1 was inspected using only target/tab selection,
  with no Apply, Discard or field edits. Its large preview now shows the same
  1.4× crop as the source rectangle at 18.000 s (normalized crop difference below
  0.000001), while the clip remains clean. No new generation/export was requested.
  Generated scratch/listeners/runner were cleaned up; the normal app and
  Voyagenda remain running, with retained media/exports/configuration preserved.

All regression processing used FAKE_MODE=true, paid-off and no API keys. Manual
crop inspection works on prepared media without keys and is shared by local
Codex and hosted Gemini code. Fresh real Gemini processing retains its key/live
flags/approvals; no Gemini/paid/provider run or deployment was performed. Nothing
was staged or committed. Personal visual/release judgment remains owner-only.

## Owner Camera target and preview synchronization — 2026-11-09

The owner clarifies that the previous Preview-button correction did not fix
selecting/editing a Camera media target. The small source picker and the main
composition must show the same selected media moment. Selecting Video 1 with an
18 s start must default to 18 s, not jump near its 28 s end. The target stays
identified by its named selection frame and keeps its actual full-frame/inset
layout and layer order. Do not change saved media to make selection work.

Root paths to correct: Camera currently uses Media's entrance-offset selection,
while the source picker independently pins itself to effect end. Pointer/keyboard
crop selection then seeks the main preview to that end, which can also be the
media's fully faded final frame. Use the main preview clock for the small source
video, with the source trim mapped once. Camera selection/entry seeks the exact
media start. Crop adjustments pause at the current moment instead of jumping to
the end. Explicit Motion Start/End frame choices may seek their matching endpoint.
Show the selected target name and current presentation timestamp in the existing
source context row; preserve separate Zoom/Motion tabs and the existing layout.

Acceptance: generated full-frame and inset pictures/videos with nonzero starts,
later effects, trimmed sources and fade exits; actual Camera target changes,
entering Camera from Media, numeric and pointer/keyboard crop editing, main/source
clock comparison while paused and playing, explicit Motion endpoints, repeat
Preview, Hook/body mapping, invalid/corrected controls, and responsive geometry.
Use shared local/hosted code with fake/paid-off/no-key verification; preserve
normal owner drafts, exports, configuration and Voyagenda. No new provider test,
worker reload, deployment or Git mutation. Status: implemented and verified;
owner visual acceptance remains personal.

Verification and final behavior:

- Camera target selection and entry from selected Media now seek the cue's
  exact display start through the existing Hook/body mapper. Media retains its
  entrance-offset inspection. The small source uses the main Player clock and
  admitted video trim, rather than pinning itself independently to effect end.
  Its existing context row shows the selected name and current presentation
  time. Numeric edits pause playback; pointer/keyboard edits keep the current
  moment. Motion defaults to Start frame; explicit Start/End choices seek the
  matching endpoint. Preview actions still replay from media start.
- A generated fading full-frame background with a nonzero start reproduced why
  endpoint selection could show the interview: its final frame has zero opacity.
  Selecting it now shows the start with full opacity. Covered/inset video and
  picture targets retain their own named selection frames and layout/order.
  Media selection at source 1.3 s reset to exactly 1.0 s on Camera entry; its
  independently trimmed source and selected video both read 0.5 s.
- Source synchronization now begins at loaded metadata, before the first decoded
  picture. This fixed a source inspector that reported a seeked clock while still
  displaying frame zero. Paused main/source video clocks matched, and generated
  embedded frame counters matched during playback. Original Camera's shared
  inspector still loaded and sought correctly, without media errors.
- Exact untrimmed starts exposed a second decoded-frame issue in the main
  Remotion video: it could retain a blank poster at physical time zero. A
  preview-only one-millisecond positive seek inside frame zero now presents that
  same logical frame. Nonzero source trims stay exact; contracts, saved edits,
  audio and native composition are unchanged. An initial loaded-data-only nudge
  did not resolve the issue and was removed. Fresh generated untrimmed Hook
  playback now visibly shows frame counter zero in both source and full-frame
  video. The opt-in fixture retains a fading untrimmed background plus a trimmed
  inset video, later picture/video effects and independent Hook/body occurrences.
- Hook selection mapped source 1.0 s to presentation 0.5 s; body selection mapped
  it to 3.5 s. Explicit Motion End moved both raw videos to 2.4667 s, including
  the intentional fade, and Start restored both to 0.5 s in the trimmed case.
  Cropping did not jump to End. Valid/invalid/corrected zoom at widths 1440, 768
  and 390 retained identical preview/source/field/footer geometry and unchanged
  clocks, with no horizontal overflow. Invalid input still disabled Preview.
- **14 focused tests passed** across target geometry, camera clocks, retained
  last-valid preview and source playback. The first run hit a transient Vitest
  temporary transform-cache miss in the two-test camera-clock suite; only that
  suite was repeated and passed. Frontend/test TypeScript, scoped ESLint,
  formatting and diff checks pass. Lightweight validation: **Meets ticket;
  no actionable findings** for this correction. Native export/provider suites
  were not repeated for the frontend-only playback change.
- The normal clean session was reloaded without processing. Selecting Video 1
  visibly showed its large full-frame office footage at **18.000 s**, with the
  same source moment and named border, retained 1.4 zoom and clean Export state.
  No Apply/Discard, generation, export or saved-media correction was used as
  proof. Generated fixture Apply counts stayed zero. Their listeners/media and
  temporary runner were cleaned up; normal ClipBuilder and Voyagenda remain
  running. Saved media/exports and ignored configuration are preserved.

Verification used generated media with FAKE_MODE=true, paid-off and no API keys,
plus read-only retained-media selection/playback. The code is shared with hosted
Gemini; no Gemini/provider/paid run or deployment occurred. Fresh real processing
still requires its provider/runtime setup, live flags and applicable approvals.
No source format migration, worker reload or Git mutation was needed.

## Owner media effect preview start correction — 2026-11-09

The owner reports that preview after changing media Zoom/Motion does not start
at that media's Start timestamp. Preview zoom and Preview motion must replay the
selected media from its display start, including the lead-in before a later
effect. Do not start at the current playhead, the effect's later start, or the
uploaded video's source trim. Map the selected Hook/body occurrence once and
retain endpoint-frame inspection, effect timing, source trim and saved edits.
Use the shared provider-independent editor for local Codex and hosted Gemini.

Acceptance: reproduce with generated picture/video cues whose media start is
nonzero and whose effect starts later; change effects, move the playhead, and
verify both Preview actions restart at media start. Include a trimmed video,
repeat playback and Hook/body clock mapping. Keep invalid/busy guards, main
selection frame and current UI layout. Tests use fake/paid-off settings and no
API keys. Preserve the normal running app, owner saved edits and Voyagenda;
no paid/Gemini run, worker reload, deployment, configuration or Git mutation.
Status: fixed and verified. The common Preview handler now seeks to the cue's
display start through the existing occurrence-aware preview clock, then plays.
Effect endpoint inspection remains paused at the chosen endpoint; saved timing,
trim and effect values are not rewritten by Preview. No layout, contracts,
renderer or provider-specific path changed.

Generated Codex-browser verification reproduced the previous behavior with a
media start of 1.0 s and effect start of 1.5 s. It began from the latter. The
fixture now has opt-in delayed pictures/videos, a 0.5 s video trim and an
independent Hook, so this case is retained for future checks. After the fix:

- Zoom and Motion replay for pictures and videos began at the media start,
  including after magnification, target position and effect-start edits and
  repeated Preview actions from a different playhead position.
- With a 2.5 s Hook repeating source 0.5–3.0 s, that media start maps to
  presentation 0.5 s in Hook and 3.5 s in body. Both occurrences selected the
  correct main video. Observed source clocks during advancing playback were
  1.02–1.28 s, before the later effect; the trimmed B-roll advanced from its
  independent 0.5 s offset. Changing the body's effect start to presentation
  4.1 s still replayed the media at presentation 3.5 s.
- Invalid zoom kept Preview and Apply disabled; correcting it restored Preview.
  The main selection frame, separate controls and one-second effect duration
  remained present. Fixture playback used zero Apply calls. The normal editor
  remained clean with its retained effects and available Export action.

Thirteen focused geometry/clock/preview-form tests passed, plus frontend/test
TypeScript, scoped ESLint, formatting and diff checks. Lightweight validation of
this correction: **Meets ticket; no actionable findings**. Native export and
provider suites were not repeated for this frontend playback-start change.
Generated fixture listeners, media and runner were cleaned up. Normal ClipBuilder,
saved edits/exports and Voyagenda remain untouched; nothing was staged/committed.
Checks used fake/paid-off media without API keys. This shared change also applies
to hosted Gemini code, without deployment or Gemini testing; fresh real processing
retains its provider setup, live flags and applicable approvals.

## Owner consistent media Camera controls — 2026-11-09

The owner rejects the combined Add zoom / motion form. Media Camera targets
must use the established Camera inspector layout with separate Zoom and Motion
tabs, plus visual target-frame selection rather than numeric coordinates alone.
Reuse Camera's pointer/keyboard crop-selection surface and focus preview/inspector
styles. Zoom picks its target frame; Motion picks start/end framing visually.
Keep entrance/exit controls in a separate Transitions sub-tab. Preserve Media's
asset/layout/audio responsibilities and the named selection frame in the main
preview. This supersedes the prior combined media motion form and the earlier
picture-only fixed focal-point restriction: explicit picture Motion now uses the
same bounded manual path as video Motion, without generated/interpolated media.

Retain the existing per-cue saved effect and its shared Start/End window; separate
tabs edit magnification and framing of that path without resetting each other.
Adding/removing zoom must preserve an authored pan, and adding/removing pan must
preserve zoom. Pure legacy picture zoom stays fixed; old combined video effects
remain editable. No saved effect-format migration is needed; contract validation
must now admit the explicitly requested picture pan. The
visual crop must match source aspect, inset/full-frame fit and zoom; video target
frames must account for the cue's source trim once. Preserve Capture readiness,
Hook/body clock offsets, contextual stable feedback and Apply/Discard guards.

Acceptance: geometry/clock/independent-axis regressions, generated browser pointer
and keyboard target selection on picture/video, tab/target navigation, invalid /
corrected controls and desktop/tablet/phone layout, actual Apply/read-back, and
read-only inspection of retained normal-app effects. No new paid processing,
configuration change, retained saved-media mutation or Voyagenda action. Reload
only the owned backend/worker when the shared/native parity rule requires it.
Status: implemented and verified; owner visual acceptance remains personal.

### Hosted Gemini parity clarification

The owner explicitly requires this workflow in the deployed Gemini application
as well as local Codex. The controls and manual media processing must be provider
independent. Supersede this ticket's earlier local-only video/hosted exclusion
where needed for matching uploaded media, layering, fit, volume, zoom and motion.
Keep YouTube acquisition local-only. Preserve hosted authentication, isolation,
expiry and resource/spend gates; no durable hosted library is added. Implement
and validate hosted transport/render wiring using generated/fake/no-key checks.
The owner expressly excludes Gemini acceptance testing for this revision. No
deployment, cloud-resource action, key inspection or paid/provider test is granted.
Status: implemented and verified with protected fake transports; not deployed,
and real Gemini acceptance was deliberately not run.

### Consistency and hosted-parity verification

- Camera now reuses the original crop-picker component, neutral focus styling,
  focus preview/inspector layout and separate Zoom / Motion tabs. Zoom keeps
  Start, Capture, Reach target in, Target zoom and target coordinates; duration
  derives the saved end frame. Motion has Start/End with Capture and visual
  Start frame / End frame selection. Transitions retains entrance/exit/duration.
  The legacy combined form and local-only video UI flag are removed. Tabs edit
  the existing shared effect window; independent zoom/pan removal preserves the
  other effect. The contract now accepts picture pan with the same bounds.
- Generated Codex-browser checks exercised real picture/video pointer dragging,
  arrow-key selection and original Camera's reused picker. Magnification retains
  the chosen source center. Dragging through matching motion endpoints keeps the
  authoring surface available. Picture effects and trimmed-video effects were
  applied through HTTP and survived page reload. Remove zoom preserved Motion;
  Discard restored the acknowledged combined effect.
- A generated video trimmed to start at 0.5 s showed source frames 0.8 s and
  1.8 s for effect endpoints 0.3 s and 1.3 s. Capturing Zoom start at 1.3 s
  retained its one-second duration and showed source target 2.8 s, confirming
  one trim offset and a settled silent source. Original Camera retained pointer/
  keyboard operation. Last-valid crop/frame state remains stable during invalid
  input; valid/invalid/corrected states at 1440, 768 and 390 widths had identical
  preview, source, field and footer geometry without horizontal overflow.
- Hosted video POST and asset range GET now use the existing authenticated,
  session-bound allowlist and normal native job path. Upload streaming skips the
  Next proxy's bounded body clone for the exact video route while keeping route
  authentication/origin checks. Video/picture layering, zoom/pan, sound and fit
  use the same editor/compiler/render contracts for either provider. YouTube,
  local libraries and agent endpoints remain excluded from hosted sessions.
- **72 focused tests passed:** 45 geometry/clock/effect/visual-media/hosted workflow
  regressions and 27 frontend proxy/bridge/runtime-capability regressions. Hosted
  checks cover two videos plus picture zoom/pan, ordering, volume, unchanged
  captions and no extra AI calls, with CSRF/MIME/session/expiry protections.
  The generated native B-roll proof passed with picture pan plus zoom, current
  source compilation, audio, source orientations and saved-draft reopen.
- Frontend/local/test TypeScript, scoped ESLint, formatting and diff checks pass.
  Whole-repository lint retains the pre-existing forbidden import in unchanged
  `packages/contracts/local/text-ranges.test.ts:2`; this revision does not claim
  a clean whole-repository lint run. Lightweight read-only validation of the
  ticket-owned worktree: **Meets ticket; no actionable findings**. Hosted real
  Gemini quality, deployed capacity and owner visual/release approval are not
  established by these generated tests.
- Contracts and the normal native worker were rebuilt. The backend was reloaded
  only after verifying its process identities and descendants; the existing
  frontend stayed running. Health, `/start` and sample configuration returned
  200; the rolling session recovered its clip and retained effects. Normal-app
  inspection only selected existing targets, without Apply or regeneration.
  Generated listeners/scratch were cleaned up. Voyagenda, ignored configuration,
  real saved media and exports remain preserved. No new provider/paid/Gemini
  run, cloud, deployment or Git action was used. Manual media operations on
  prepared/generated clips need no keys; fresh real Gemini/Codex work retains
  its existing provider/runtime setup, live flags and applicable approvals.

## Owner Camera target preview selection — 2026-11-09

The owner requests a visible selected frame in the composition preview when a
picture/video is chosen as Camera target, so the affected layer is unambiguous.
Show the existing selection border plus the target's name for only that media
layer, including full-frame and covered layers. Keep the existing seek into its
display interval and independent Hook/body behavior. Clear that media frame for
Original video or when the selected cue is absent from the current frame.
The Camera indicator identifies the target; move/resize remains in Media.
Selection must not change geometry, order, effects or saved edits, and must never
appear in exports. Check picture/video/full-frame switching, covered selection,
Original video, responsive visibility and absence of edit operations using
generated/no-key browser checks. No paid run or app/backend restart is needed.
Status: implemented and verified. Camera reuses the existing visual selection
geometry as a read-only named border above the preview composition. Only the
selected active cue is marked. It has no move/resize handlers or pointer target;
switching inspector modes gives gesture state a separate component lifetime.
The existing occurrence visibility and cue-window checks apply to the marker.

Generated/no-key Codex browser checks verified Picture 3, inset Video 2 and the
full-frame Video 1 background beneath other media. Each produced exactly one
correctly named frame matching the selected media viewport bounds, with no
resize button or dirty edit. Original video produced no media frame. At 1440,
768 and 390 widths, marker and media bounds matched exactly. Media retained its
normal resize control and did not show the Camera-only marker. A generated cue
temporarily shortened to one second lost its Camera frame when playback passed
its end; that draft was discarded. The fixture closed with zero Apply calls.
The normal app also shows Picture 2's named border with bounds matching its
viewport, retaining its 1.25 zoom and clean edit state.

Frontend TypeScript, scoped ESLint, formatting and diff checks passed. Lightweight
validation: **Meets ticket; no actionable findings** for this selection-affordance
revision. Native export and unit suites were not repeated for the frontend-only
marker; renderer/shared composition and edit contracts are unchanged, and the
marker exists only in the editor interaction layer. Fixtures/listeners/generated
scratch and the temporary runner were cleaned up. The app stays open on Camera /
Picture 2, with saved media/edits and Voyagenda preserved. Checks used generated
media with fake/paid-off settings and no API keys; the normal UI inspection only
changed selection/playback. No provider, export, configuration, Git or service
lifecycle action was used. Real generation retains its existing setup, flags and
approvals; owner creative/release judgment remains personal.

## Owner Camera/Media organization revision — 2026-11-09

The owner finds zoom/motion inside Media confusing. Camera must own picture and
video zoom/motion along with original-video camera settings. Media retains
upload/add/remove, shared layer choice/order, display timing, source trim,
position/resize, fit/full-frame presentation and video volume. This supersedes
earlier references to motion controls within the Media inspector.

Add a clear Camera target choice for Original video and each placed picture or
video. Opening Camera from a selected media layer shows that layer's independent
effects; switching targets only changes selection, never saved effects, layer
order or other edits. Keep entrance/exit transitions with the moved motion
controls. Preserve original-camera controls, independent Hook/body clocks,
Capture, preview, Apply/Discard and existing saved edit compatibility without a
contract or rendering change. Route effect errors to Camera and the correct
target/occurrence; keep media layout/trim/audio errors in Media.

Acceptance: generated/no-key browser checks for picture zoom, video pan/zoom,
target switching, original-camera navigation, Apply/reopen, invalid/corrected
effect geometry, keyboard access and desktop/tablet/phone footer visibility.
No additional paid test, provider call, configuration or service restart is
needed. Status: implemented and verified. The editor now moves the existing
motion/transition controls into Camera and shares its current visual selection
with the Camera target selector; there is no second effect state or save format.
Media's picture/video sub-tabs are Image/Video, Timing and Position. Unknown
retained inspector sub-tab choices safely show Image/Video after the relocation.

Generated/no-key Codex browser verification:

- Selecting Picture 3 in Media then opening Camera retains that target. Authored
  picture zoom 1.4 and Video 2 zoom 1.6 with pan X 20→80 survive target changes.
  Video 1 remains without an effect. Home/End/arrow keys navigate targets, and
  Original video still exposes its existing Camera/People/Zoom/Motion controls.
- Capture effect start reads the settled 0.3-second clock, changing Start only;
  End stays 3 seconds. Actual Apply uses the fixture HTTP/edit compiler. A later
  change and Discard retrieve the acknowledged zoom/pan settings and retain the
  picture effect independently. The existing normal saved project also displays
  its retained 1.3 picture zoom in Camera without an edit/Apply or regeneration.
  Physical library reopen, Hook/native output and provider acceptance were not
  repeated for this frontend organization change; their prior evidence above
  and the unchanged edit/clock/render contracts remain applicable.
- Media exposes no visible Motion tab or zoom controls. Invalid zoom marks
  Camera and its target, disables Apply/Preview, and returns to the affected
  layer when Camera is selected. Invalid effect clocks associate feedback with
  the timestamps; transition-duration failures belong beside those controls.
  A review caught duplicate interval feedback and a generic transition message;
  both were corrected. Hidden targets show a marked choice and contextual hint.
- At widths 1440, 768 and 390, settled valid/invalid/corrected zoom states keep
  preview dimensions, field geometry and footer action geometry identical,
  with no horizontal page overflow. The normal app remains on Camera with its
  selected picture, preserved media/edits and available Export action.

Focused gate: **22 tests in three files passed** (visual-media contracts/edit
operations, editor state and timeline). Frontend TypeScript, scoped ESLint,
Prettier and diff checks pass. Lightweight validation of the ticket-owned
unstaged/untracked controls and documentation: **Meets ticket; no actionable
findings**. No contracts, composition, native worker, provider or saved-document
structure changed in this revision. Generated checks establish behavior with
FAKE_MODE=true, paid-off and no API keys, not live AI quality. Normal generation
retains its existing real-provider setup/flags/approval requirements. Temporary
fixture listeners/media/runners were cleaned up; normal ClipBuilder and
Voyagenda were preserved. Nothing was staged or committed. Personal visual and
release judgment remains owner-only.

## Owner source-preview sizing follow-up — 2026-11-09

The owner reports that the B-roll source player looks horizontally stretched.
Its element currently fills the inspector width while its height is capped,
leaving excessive black space beside landscape footage. Keep the admitted
video's aspect ratio in a compact centered player, bounded to 320×180 and the
available panel width for landscape, portrait and square media. Preserve source
playback, endpoint Capture, current edits and the separate composition preview.
Verify settled source-player geometry at desktop, tablet and phone widths with
API-free checks; this frontend correction requires no provider action.
Status: fixed and verified. The Codex browser measured the existing admitted
1280×720 public source at 320×180 in a 1440-wide viewport, about 249.53×140.36
at 768 wide, and about 297.16×167.14 at 390 wide. Each retained its natural
16:9 ratio, fit its panel and remained decoded/ready; the desktop and phone
views show compact source controls without the former wide black strip.
Sizing uses admitted dimensions before decode and bounds portrait/square media
by the same 320×180 limit; those orientations were not newly browser-tested for
this style-only revision. Frontend TypeScript, scoped ESLint, Prettier and diff
checks passed. The original picture selection/settings view was restored, edits
were preserved, and no processing, export, provider call or service restart was
needed. This preview sizing works with fake mode and no API keys; live provider
generation still requires the existing enabled flags, setup and approvals.

## Current execution authorization and additional framing requirement

Owner continuation, 2026-11-09: fix `invalid_video_clock` and resume the normal
1:04–1:45 acceptance, keeping the total to one paid run. Exercise both picture
and video B-roll with zoom, video motion and mixed layering, then save several
review drafts in Downloads. Preserve Voyagenda. The prior native-inspection
failure reached no inference; no paid run has yet been consumed. Resolve the
clock failure with generated/no-key regression checks before resuming the
authorized real flow, preserving its source and unrelated saved work.

The 2026-11-09 execution request supersedes this packet's historical planning-only
holds. Complete generated/fake/no-key gates before at most one real/paid
acceptance run using the previously designated public YouTube source, 1:04–1:45.
Use the normal local Codex provider, never Gemini/fallback. Do not automatically
retry providers. No configuration changes, Git mutation, cloud action or deployment.
The owner also authorizes bounded public media acquisition and new review drafts
and exports under Downloads/ClipBuilder/CL-271-review, preserving existing work.
Use safe admitted raster/video files; do not add an arbitrary downloader or weaken
the existing authenticated transport, URL/DNS checks or executable restrictions.

Add a processing choice to turn off face/camera tracking and show the complete
horizontal source centered inside the vertical canvas, with black letterboxing.
The screenshot illustrates the footage geometry only, not its other guidelines.
This choice must bypass the automatic face/speaker-camera planning and tracking
work rather than merely hiding its result. Keep original audio and captions;
caption transcription remains necessary. Persist the choice across batch,
explicit retry, draft/recovery and Hook/body preview/export. Legacy/default clips
keep tracked portrait framing. No fixed time/credit saving is claimed.

Additional acceptance: trace the choice over the actual frontend/backend/worker
boundaries, assert zero face/camera planning/tracking calls in fit mode, and compare
generated landscape-fit preview/native output with untouched tracked defaults.
After all safe gates pass, exercise relevant picture and video B-roll, motion/zoom,
full-frame/layered layouts and saved drafts on the single authorized fresh clip.
Personal visual/release acceptance remains owner-only.

Depends on the implemented Media/Pictures workflow (CL-020/CL-079), independent
audio layers (CL-133) and Hook/main content and clock handling (CL-220/CL-224).

## Owner request

Add video B-roll as another media type alongside pictures and audio in the
ClipBuilder editor. During a chosen interval, show the added video with its
own audio muted by default while the main interview audio continues. The owner
explicitly clarifies that the existing captions must keep playing above the B-roll too.
The discussion requests a local workflow. The current execution grant above
supersedes the initial documentation-only authorization.

Owner extension, 2026-11-09: videos also need editable motion and zoom effects;
pictures need zoom effects. Both pictures and videos need an explicit full-frame
option that fills the vertical output with the visual while captions continue
above it. Extend this packet because the effects and presentation choices belong
to the same Media workflow. Implementation was subsequently requested above.

Owner layering extension, 2026-11-09: allow multiple pictures, multiple videos
or a mixture of both at the same timestamp. The owner must be able to choose
which visual appears above another and move each independently. Overlapping
video is therefore a required capability, not a policy choice to prohibit later.

Owner video-audio revision, 2026-11-09: each added video must have an independent
volume control. It starts muted to favor the original clip, but the owner can
enable its sound and mix it with the interview and existing sound effects/music,
using the same audio-layer behavior as normal uploaded audio. This supersedes
the earlier always-muted requirement; muted is the default, not a restriction.

Owner scope clarification, 2026-11-09: custom motion graphics, joining/merging
clips and arbitrary splitting/cutting/rearranging of the main footage belong
outside ClipBuilder. The owner may request those as separate local editing
tasks handled by Codex, but does not want those authoring features added to the
application. Keep the Media controls below bounded to the selected clip.

## Intended behavior

- Media exposes Pictures, Audio and Videos through the existing inspector
  pattern. Start with manually uploaded, bounded video assets, without an AI
  discovery, generation or automatic acquisition requirement.
- A video cue covers the underlying interview picture for its selected display
  interval. The interview timeline continues underneath; this is a visual
  overlay, not an inserted segment or a reordered interview. When the cue ends,
  reveal the remaining lower visual layers, or the interview at its then-current
  clock when none cover it, without replaying skipped visuals.
- New B-roll starts silent in both preview and export, including files with an
  audio track. Each video cue has independent volume/mute controls; the owner
  may explicitly mix its sound with the interview and existing audio/music.
  Never replace, pause, duck or restart interview audio merely because a B-roll
  cue starts or its volume changes. Preserve deliberately authored original-audio
  gain and all unrelated audio edits.
- Existing captions remain above the B-roll, following the main clip's words,
  timing, corrections, speaker styling, animation and positioning. Do not
  transcribe the B-roll, switch caption tracks or regenerate interview captions.
  Keep captions and existing title text above the visual-media stack. Logo
  pictures participate in that stack with explicit owner-controlled ordering;
  preserve their intended foreground placement when adding/enlarging other media.
  Never implicitly reorder existing visuals when another is added or selected.
- Let the owner choose a source excerpt within the uploaded B-roll, its display
  Start/End, and fit/placement using the existing bounded editor conventions.
  Keep normal-speed playback initially. Do not silently loop, freeze, stretch
  or extend a short asset to cover an invalid requested interval. Overlapping
  video cues are supported with explicit stacking and bounded decoder resources.
- Preview playback, pause, seek and replay resolve the same B-roll frame and
  caption clock as native export. Do not restart B-roll on unrelated inspector
  changes or show stale frames outside its interval. Hook and main occurrences
  retain their independent content and existing clock mappings.
- Apply/Discard, removal, save/reopen and rolling recovery preserve the cue,
  admitted asset and trim/placement/effect/volume edits without new AI or
  acquisition work.
  Removing a visual reveals the next visible layer or original interview and
  preserves other edits.

## Simultaneous visuals and layer control

- Render several active pictures, several active videos, or mixed picture/video
  cues in the same frame. They may share identical or partially overlapping
  display intervals. Do not restrict the workflow to one active video or replace
  an existing visual just because another is added at the same timestamp.
- Provide one visual layer order across Pictures and Videos, rather than an
  implicit rule that all pictures sit above all videos. Expose clear Bring to
  front / Send to back and Move forward / Move backward actions, or equivalent
  reorder controls with keyboard access and unambiguous front/back labels.
- Persist stable per-cue layer identity/order in the edit document. Rendering
  order cannot depend on upload completion, asset type, selected inspector,
  playback/seek state or asynchronous decoder readiness. Changing selection
  must never bring a visual forward implicitly. Preserve legacy picture order
  when reading old saves.
- Select any visual through the layer list even when another visual completely
  covers it. Move and resize the selected visual in the scaled preview, retaining
  the existing precise geometry controls. Each cue independently owns placement,
  size, fit/full-frame choice, display timing, video trim and supported effects.
  Editing one layer cannot move, retime, transform or reset the others.
- A full-frame visual can be the background for smaller pictures/videos and
  logo overlays. New full-frame media starts below existing visual layers so it
  cannot accidentally hide them; the owner can deliberately reorder it later.
  Preserve transparent picture regions, media viewport clipping and frame bounds.
  Only active cues participate at a given time; an ended/removed layer reveals
  the correct layers underneath without flattening or deleting them.
- All active B-roll videos advance on the shared presentation clock with their
  own source trims and independent volume settings, initially muted. Multiple
  videos, layer reordering and media effects must not restart interview audio,
  shift captions or reset other video playback. Hook and main occurrences keep
  independent layer edits, audio choices and order.
- Bound simultaneous decoder/pixel/memory work, but support at least two videos
  playing together and mixed picture/video layers. Reject an excessive requested
  combination contextually before Apply/dispatch, retaining the draft and prior
  valid output; never silently drop an accepted layer, substitute a still, or
  flatten away its editability to fit a single-video implementation.

## Video volume and audio mixing

- Each newly added video cue starts at volume zero/muted, without changing the
  original clip's volume. Use the existing Audio control conventions and gain
  bounds for independent video volume and mute/unmute, with one persisted source
  of truth. Raising volume above zero explicitly enables that cue's sound.
  Muting preserves the chosen nonzero gain for a later explicit unmute.
- Enabled video sound joins the existing mix with interview audio, sound effects,
  music and other enabled video sounds. Several videos may be audible together,
  each at its own gain. Changing one does not alter any other layer's settings
  or enable automatic ducking/normalization beyond existing mixing behavior.
- Volume belongs to the placed video cue, not the uploaded asset globally. Two
  uses of the same asset can have different gain/mute settings; Hook and main
  copies remain independent. Apply/Discard, removal, save/reopen and recovery
  preserve these choices, including an explicitly muted cue.
- Video audio follows that cue's source trim and display interval on the shared
  presentation clock, staying synchronized through pause, seek, replay and native
  export. It stops at the cue's end or removal. Picture placement, full-frame
  mode, zoom, visual stacking and being covered by another visual do not retime
  or implicitly mute explicitly enabled audio.
- Use the shared audio mixing path and avoid double playback through both the
  video element and a second audio track. Preview/export apply the same gain,
  mute state and existing mix/cut-boundary policy. Videos without audio remain
  usable visuals, with unavailable sound controls clearly indicated.
- Captions continue to represent the original clip's existing words/timing even
  when video sound is enabled. Volume edits and audio mixing require no new
  transcription, provider inference or generated audio.

## Media zoom, video motion and full-frame presentation

- Pictures support an optional animated zoom, including a gradual zoom-in toward
  an owner-chosen point of interest. Keep that point fixed for picture zoom;
  independent picture pan/motion is not requested. This transforms existing
  pixels and does not generate motion or additional image detail.
- Videos support optional animated zoom and manual movement/reframing, such as
  a pan from one chosen position to another while the video continues playing.
  Video motion and zoom can run together; the video's original frame motion also
  continues normally. These effects belong to the added asset, not the underlying
  interview camera, and do not imply AI tracking or generated/interpolated video.
- Use bounded controls for effect Start/End, zoom amount/focal point and, for
  video movement, start/end positions. Provide a smooth deterministic transition
  within that window and hold the resulting transform for the remainder of the
  cue; removing the effect restores the cue's authored baseline. Keep cue
  display timing, video source trim and effect timing distinct. New media starts
  without an automatic zoom or movement effect; add effects only by owner choice.
- Add an explicit Full frame presentation choice for pictures and videos. It
  fills the existing 9:16 output canvas, rather than entering browser fullscreen
  or changing export aspect ratio. Preserve source aspect ratio and crop overflow
  to fill, with an adjustable focal position so the owner controls what is kept.
  Retain the existing contained/inset placement choices and their manual geometry.
- Full-frame media reaches all four output edges without rounded-corner gaps.
  Zoom and video movement remain clipped to that frame without exposing the
  interview at an edge. Captions and titles remain above the media, and logo
  pictures retain their owner-chosen layer order, including during movement/zoom.
  Other layers' size and position do not scale with the selected visual.
  Original interview audio continues unchanged.
- Zoom and video movement also work in inset presentation, clipped to the cue's
  media viewport. Switching between inset and full frame preserves the owner's
  previous inset geometry. Seek directly to any effect time to obtain the same
  transform as continuous playback, without elapsed-wall-time animation state.
- Keep existing picture Entrance/Exit effects and saved appearances compatible.
  Continuous zoom/movement is independent of those transitions; reuse the
  current effect/placement controls where appropriate rather than adding a
  second editor. Preserve normal animation timing under all OS/browser motion
  preferences, following the permanent owner motion decision.

## Implementation boundaries

Implement one bounded Media extension through the existing upload, admission,
contracts, edit compilation, preview and native export paths. Share frame-driven
effect and fit/crop math between picture/video preview and export; reuse existing
geometry, transforms and clocks rather than creating a parallel animation engine.
Keep cross-boundary schemas in contracts; applications must not import each other.
Use one shared explicit picture/video stacking model through edit compilation,
browser composition and native rendering; avoid separate conflicting z-order
rules in each path. Do not turn this bounded layer list into an arbitrary timeline
or allow user-supplied executable/rendering instructions.
Reuse the existing audio-cue/mixing infrastructure for optional video sound,
binding it to the admitted video asset, cue identity, trim and shared clock.
Do not create conflicting independent audio state in preview and export or
automatically duplicate a video's audio into an additional audible cue.
Reuse authenticated file transport, explicit asset identities, safe native
decoding, scratch accounting and lifecycle cleanup. Establish appropriate byte,
duration, dimension, cue-count and active-decoder bounds before admitting video;
do not reuse picture limits blindly or accept arbitrary paths/remote URLs.

Keep actions in the relevant footer, with shared controls and neutral inset
focus. Upload/error/progress states replace their local slot and preserve stable
geometry. Editable Start/End fields with a usable nearby preview need Capture
from the correct settled video clock; seek/failure/incomplete-range guards retain
the draft. Never add a page-top error banner or bypass Apply validation.

## Explicit product scope boundary

ClipBuilder retains selected-clip editing: picture/video overlays, visual layer
ordering, placement, full-frame presentation, the bounded zoom/video movement
effects in this packet, and independent audio mixing. Existing source excerpt
selection, optional Hook prefix and B-roll source trims are preserved.

Do not add a general split/cut/splice timeline, merging separate clips into one
sequence, multi-source montage assembly or a custom motion-graphics authoring
system. The requested media zoom/movement effects are not permission to grow
into arbitrary animated graphics, scene design or video-editing project formats.

One-off cuts, joins, montages and custom graphics can instead be handled outside
the app by Codex with local editing/rendering tools against separately authorized
source copies or exports, producing a separate output without changing the app
or overwriting saved work. The exact edit, inputs and desired result belong to
that later task; this scope discussion does not start media processing or grant
new provider, asset acquisition or external-action permissions.

Automatic stock-video search, provider-generated video and publishing also remain
outside this packet. Hosted exposure/release is not implied. At implementation,
record this narrow product boundary in the source of truth and reconcile
historical video-B-roll exclusions without broadening unrelated acquisition or
provider permissions.

## Acceptance and verification plan

- With generated interview and B-roll fixtures, prove the interview audio clock
  stays continuous before, during and after the cue. A distinct B-roll audio
  signal must be absent by default in preview and export, then present at the
  chosen gain after explicit enablement. Existing intentional sound/music layers
  remain unchanged. Include B-roll with and without audio.
- Verify exact cue start/end, source trim, return to the current interview frame,
  pause, seek into/out of the cue, replay and asset-end guards. Cover independent
  Hook/main appearances and source/presentation/native-frame clock mapping.
- Check captions remain visible and synchronized above moving B-roll across
  several word/caption boundaries. Preserve text, styling and timed titles/logo
  overlays. Compare settled browser frames with current-source native output.
- Show two overlapping pictures, two simultaneously playing videos, and a mixed
  stack containing multiple pictures/videos at identical and partially overlapping
  timestamps. Exercise all front/back reorder operations, direct movement/resize
  and selection of a fully covered layer. Confirm independent timings, trims,
  effects and geometry, plus a full-frame background with inset media and a logo.
- Verify overlap pixels and transparent regions at representative frames in the
  browser and native export. Order remains stable during seeking, effects,
  selection, asynchronous loads, Apply/Discard, save/reopen and recovery; Hook
  order edits do not change main order. Legacy pictures keep their previous order.
  Cue endings/removal reveal the right underlying visual or interview frame.
- Prove each concurrent video advances from its own source trim while default
  muted audio stays absent and the interview audio/captions remain continuous.
  Then enable multiple video sounds at different gains, mix with an existing
  sound effect and verify synchronized source trims and cue boundaries without
  duplicated playback or changes to unrelated gain. Cover mute/unmute, a covered
  visual, reuse of the same asset, independent Hook/main audio, save/reopen and
  removal. Compare preview and exported mix against the intended generated signals.
- Test the documented active-resource limit and a request beyond it with retained
  draft, contextual stable feedback and zero partial dispatch/silent layer omission.
- Verify gradual picture zoom and video zoom/movement individually and together,
  at effect start, midpoint, end and the held remainder. Test disabled/removed
  effects, invalid windows/targets, direct seeks and replay. Transforms must not
  retime video, caption words or audio, change the interview camera, or invoke AI.
- Exercise landscape, portrait and square assets in inset and full-frame modes.
  Verify aspect-preserving crop, adjustable focal position, all-edge coverage,
  frame clipping during effects and restored inset geometry. Captions and
  foreground title/logo overlays stay visible and unscaled in both modes.
- Compare browser and current-source native output for moving video frames and
  zoomed pictures at boundaries and representative intermediate times, including
  independent Hook/main effects and differing source/output frame cadences.
  Reopen/recovery must retain cue/effect/presentation settings, while legacy
  picture edits retain their existing look without implicitly adding effects.
- Cover upload/probe/decode failures, invalid trims, resource exhaustion,
  cancellation, cue removal, Apply/Discard, save/reopen and recovery. Preserve
  other clips/assets/exports and clean owned temporary files, decoders, requests,
  object URLs and listeners. Restore/edit/export must make zero provider calls.
- Inspect generated no-key states in the Codex browser at desktop, tablet and
  phone widths, including footer visibility, keyboard operation, Capture and
  stable valid/error/corrected geometry. Use relevant unit/HTTP/native checks,
  scoped types/lint/format and the execute/validate/fix loop when implemented.
  Rebuild/reload the normal internal worker after native/contract/composition
  changes using verified ownership; never validate against an old overlay.

## Fake/live capability and authorization

Implemented local Media now supports manually uploaded MP4/MOV videos alongside
pictures and audio, shared visual ordering, full-frame/inset presentation,
picture zoom, video pan/zoom and independent default-muted video sound. These
manual controls, Apply, native rendering and draft restore work with
FAKE_MODE=true and no API keys using prepared/generated clips. Fictional fixture
captions and plans do not prove real transcription or creative quality.
Video admission permits eight assets, each at most 64 MiB and two minutes;
normalization produces at most a 1280-pixel edge at 30 fps. At most two active
video cues are accepted, together with picture layers, with contextual rejection
before Apply for excessive overlap. Short source ranges are rejected rather
than looped or frozen. Hosted routes exclude this local video extension.

Processing offers tracked portrait or original-fit framing. Original fit keeps
the complete horizontal source centered in the vertical canvas and skips speaker
preparation, camera planning and tracking. Caption transcription and text-based
visual planning remain separate work. Legacy/default framing remains tracked.

Real local English transcription is a separate AI capability using prepared
Parakeet tools/weights without a provider key. New Codex discovery/planning needs
the existing owner login/allowance, network and live/master gates; Gemini needs
its own key, enabled flags and approvals when selected. Adding video media must
not invoke, enable or change any of these paths. Native rendering still needs
the existing local tools and bounded resources. No inference, provider/cloud
spend, ignored configuration changes, saved-media edits, Git action or deployment
is implied by the manual controls. The specific current grant permits only the
single bounded real acceptance described above, after no-key gates. Owner visual
and real-media acceptance remain outstanding until recorded below.

## Evidence

2026-11-09 execute/validate/fix loop:

- Shared contracts and edit compilation bind normalized video, its separate WAV
  asset and per-cue audio settings. Shared frame-driven transforms preserve
  picture focal points, video motion and independent partial Hook effects.
  Browser playback uses the presentation clock; native composition seeks the
  same admitted video frame through an authenticated private range server.
- Actual host/worker HTTP integration in `test/local-broll.proof.ts` generates
  interview/video/picture media, uploads and normalizes video with and without
  sound, rejects malformed upload and excess overlap, renders mixed visual
  layers and captions, measures moving pixels and default-muted/explicit mixed
  audio signals, and saves/reopens hashed drafts without new provider work.
  Original audio remains continuous; generated prepared-preview audio is checked.
- The new proof exposed delayed-audio truncation and slow-visual/AAC clock
  problems. Mixing now prepares a bounded sample-clock WAV before final mux;
  sample-count trims preserve cue delays. Packet-clock parsing excludes
  ancillary side-data while retaining strict numeric checks. Existing audio and
  Hook-audio proofs passed against these changes.
- Final relevant regression gate: ten files, 117 tests passed. Covers visual
  admission/trim/effect/order contracts, actual edit operations, no-tracking call
  counts and persistence, existing batch/draft/recovery/transport, editor
  operations, shared visual clocks and native export/resource calculations.
  Final current-source native gate: B-roll, audio and Hook-audio proofs all passed
  (three proofs, generated-only, fake/paid-off, no external network or keys).
- Codex browser generated fixture exercised mixed layers, covered selection,
  keyboard front/back ordering, actual scaled pointer dragging/resizing,
  full-frame/inset switching, independent source endpoint Capture, video sound,
  picture zoom, video motion and actual Apply compilation. At 1440, 768 and
  390-pixel widths, valid/error/corrected controls retained preview/field geometry
  without horizontal overflow; errors stayed contextual and footer Apply guarded.
- Local and frontend TypeScript checks, contracts' Node-free local check and
  test TypeScript check passed. Changed-source ESLint passed. Full repository
  lint has an existing unrelated boundary violation in the unchanged
  `packages/contracts/local/text-ranges.test.ts` fixture import; it is not a
  passing whole-repository gate. Formatting and final diff checks are recorded
  after final documentation settles.
- The normal app uses Codex and local speech, confirmed through exposed
  capabilities only. Rebuilt contracts and normal internal worker/overlay, stopped
  the verified inactive backend process tree, confirmed ports 4000/4200 released,
  and launched a fresh backend. Frontend ownership on 3000 was preserved; health,
  `/start` and `/api/sample/config` returned 200. Voyagenda was not touched.

### Real acceptance attempt and remaining gates

The normal protected YouTube path resolved the designated source, exposed its
saved local copy and admitted the selected 1:04–1:45 section. With Suggest clips
off, one manual 41-second range was submitted through Use clips. Native
`codex_inspect` failed with the fixed `invalid_video_clock` reason before audio
extraction, transcription or Codex inference. The UI showed its generic setup
message; the diagnostic does not establish a sign-in or missing-model problem.
A later read-only current-source inspection with the normal long-source capacity
passed. The cause is not reproduced or resolved, and no provider/processing
retry was made. No paid/provider inference was reached.

Per the owner's AFK media-issue fallback, real acceptance is left for their return.
No real layered B-roll review draft/export was produced under
Downloads/ClipBuilder/CL-271-review. Do not present generated proofs as relevant
real-media creative acceptance. The prepared source/range and existing saved
media remain preserved. Personal visual/release approval, a successful fresh
real clip and its review variants remain outstanding. Portrait/square real-asset
visual acceptance and exhaustive live preview/export comparisons are unverified;
generated landscape/mixed-layer checks establish mechanics only.

The generated processing fixture also checked the actual Framing selector at
desktop/tablet/phone widths, selecting No tracking · Fit original while preserving
the footer Process clips action and avoiding horizontal overflow. Temporary
fixture processes/listeners and generated scratch were closed and verified gone;
only the requested normal stack remains. Backend supervisor 7728 owns the new
instance, with health/listeners verified on 4000/4200 and the original frontend
listener preserved on 3000. Content-safe launcher/ownership records and logs are
under the owner-local temporary directory
`C:\Users\minat\AppData\Local\Temp\clipbuilder-cl271-0ed3f201394c4f0d8d3256dc64853b77`.

### Final validation disposition

The disposition below records the first execution pass. The continuation evidence
after it supersedes the deferred acceptance and unresolved-clock status.

Reviewed the combined unstaged and ticket-owned untracked implementation, not a
commit; nothing is staged. Verdict: **Meets ticket with concerns**. No actionable
implementation finding remains in this lightweight pass. Covered: local video
admission, shared layers/motion/presentation/clocks, independent sound,
draft/recovery wiring, no-tracking propagation and skip counts, local resource
guards and hosted exclusion. Partial: real-media acceptance, blocked as above.
Unverified: owner visual/release judgment and exhaustive real-media matrix.
Earlier findings (unnecessary reorder operations, source-end/Capture guards,
contextual Hook validation paths, hidden source-preview playback and hosted
transport guards) were checked against the final code and resolved. The separate
intermittent real source-inspection failure remains an acceptance concern.

Scoped ESLint, TypeScript, formatting and diff checks pass; the unrelated existing
full-repository lint failure remains as documented above. No ignored environment
contents were inspected, no Git mutation/deployment occurred, and existing owner
media/exports remain preserved. Manual media features are verified with fake AI,
paid-off and no API keys; no real AI quality or completed paid acceptance is claimed.

### Owner-resumed clock fix and acceptance, 2026-11-09

Generated native audio rendering reproduced an empty packet set from a seek,
establishing a mechanical source-clock failure without paid inference. Packet
inspection now reads named JSON fields instead of positional CSV, skips needless
seeks on sources at most 60 seconds, and allows one bounded earlier metadata
window when a long source's tail seek returns zero packets. The earlier window
is at most 120 seconds before the end, retains the existing byte/time bounds and
performs no pixel decoding or provider work. Empty results after that window,
malformed JSON, missing/non-finite clocks and nonpositive duration still reject.
No stream-duration guess replaces measured packet presentation ends.

Twelve focused clock/capacity cases passed, including short-source no-seek,
ancillary sections, empty-tail recovery, exactly two empty windows and malformed
clocks. Generated native audio passed; B-roll HTTP/native proof passed twice
consecutively. An earlier generated mixed export reported `invalid_output`; its
temporary numeric-only diagnostic was removed after the passing rechecks. The
strict output/frame/audio guards remain intact. Final relevant gate: ten files,
127 tests passed. Local and frontend types and scoped lint passed.

Reloaded only the verified ClipBuilder backend tree and rebuilt its current
worker/overlay; the frontend on 3000 and Voyagenda were preserved. The recovered
designated real source passed inspection and local English transcription. The
manual 1:04–1:45 clip was processed once with No tracking · Fit original. It
completed with one planning invocation, two initial picture-port invocations and
no speaker/camera stage. Later Media edits and draft operations reused that work;
no second provider processing run or provider retry was requested.

Actual local video upload exposed a React development StrictMode lifecycle bug:
source-preview cleanup removed `src`, while the second effect setup failed to
restore it. Setup now rebinds and loads the stable admitted source URL; cleanup
still pauses/unloads it, and unrelated edits do not alter that URL. Both a fresh
normal app mount and the generated fixture under StrictMode reached loaded
media readiness with the source retained. The fixture now enables StrictMode for
future checks.

The normal editor admitted bounded public business B-roll, applied video pan/zoom,
picture zoom and full-frame choices, and kept captions in the foreground. Two
independent saved draft copies now retain full-frame and inset layouts. A third
mixed layout uses two simultaneous independently trimmed video cues, a full-frame
video background and zooming inset pictures; its local export passed the normal
native output guards. These are actual owner-authorized real-clip edits, distinct from the
generated fixture proofs. Actual media, source credits and draft identities stay
outside Git in the owner's Downloads library and review index.

Final continuation evidence:

- Three independent editable review copies are saved: full-frame, inset and
  layered layouts. The layered version also has a completed MP4 under
  Downloads/ClipBuilder/CL-271-review. Code-owned `Open-*.json` references in that
  folder open the complete projects in the normal Downloads ClipBuilder library;
  its private review index records their actual paths. No draft IDs, media or
  transcripts were added to Git.
- The normal source picker reopened the layered reference after its working
  session was closed with all versions saved. It returned Ready with the same
  four visual cues, one admitted video reused twice, two pictures, zoom/motion,
  shared order, fit framing and completed export. Processing counters remained
  one plan, two initial pictures and one native export. Browser playback/seek
  continued on the restored clock; B-roll remained muted and cue endings revealed
  the current interview frame. No regeneration/render was needed to reopen.
- Inspected real exported frames for original landscape-fit letterboxing,
  full-frame moving B-roll with simultaneous inset video/picture, and the return
  to interview plus a zooming picture. Settled browser layers matched this
  arrangement with foreground captions. The 608×1080 H.264/AAC export preserves
  source cadence, containing 1,229 native frames and about 41.008 seconds from
  1,230 logical composition frames; the existing physical-clock guards passed.
- Compared decoded original-preview and final-export audio throughout the clip,
  including every B-roll interval. Envelope correlation was 0.995; waveform
  correlation after a measured fixed 5 ms alignment was 0.989, with each tested
  interval above 0.975. This is local mechanical continuity evidence, not an ASR
  quality score. Aggregate results and frame/editor evidence are owner-local.
- Extended the generated native B-roll proof to admitted landscape, portrait and
  square videos, including actual portrait inset motion and square full-frame
  edge coverage. It passed with the existing audio/admission/save/reopen checks.
  Its caption-pixel assertion now uses an explicit readable fixture style so it
  measures caption ink independently of background texture.
- The final lightweight validation pass covers the combined unstaged and new
  ticket-owned files. **Verdict: Meets ticket for the requested functional
  acceptance; no actionable implementation findings remain.** Generated/fake
  checks, real local media editing and the one authorized provider run are
  distinguished above. Owner creative/visual/release judgment and exhaustive
  real codec/orientation combinations remain unverified; hosted video exposure
  and deployment remain excluded. The unrelated full-repository lint baseline
  failure remains unchanged. Nothing was staged or committed.

Final handoff: scoped types/lint/format/diff gates passed after the continuation.
Backend supervisor 22712 owns healthy 4000/4200 listeners; the original frontend
listener 9420 remains on 3000. Startup/health/config checks returned 200, and no
native-render or fixture child remained. Temporary comparison/fixture runners
were removed while saved drafts, public source copies, exports and private logs
were preserved. The reopened layered draft is left in the Codex browser; its
review folder contains opening references, the MP4, credits and private visual/
aggregate evidence. No additional provider processing was used for this handoff.

## Whole-file local commit allocation — owner-authorized 2026-11-09

The latest owner instruction authorizes staging and committing the completed
ticket as whole files; personal review follows later. One cohesive CL-271 local
commit includes exactly the files below, covering shared contracts/composition,
local and hosted transport, editor controls, native rendering, dependency/build
wiring, focused proofs and owning documentation. No partial hunks, unrelated
baseline fix, ignored configuration, media, Downloads artifact, private log,
build output, deployment or push is included.

Final validate disposition: **Meets ticket; no actionable findings.** The
remaining owner-only gates are personal visual/creative review and any future
hosted/Linux release acceptance. Generated checks do not establish real-provider
quality; the earlier one authorized paid run is the only one used.

- `apps/backend/local/agent-view.ts`
- `apps/backend/local/clip-batch.test.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/backend/local/draft-store.ts`
- `apps/backend/local/edit-clip.ts`
- `apps/backend/local/hosted-workflow.test.ts`
- `apps/backend/local/server.ts`
- `apps/backend/local/workspace-files.ts`
- `apps/backend/README.md`
- `apps/frontend/README.md`
- `apps/frontend/src/features/local-editing/broll-video.tsx`
- `apps/frontend/src/features/local-editing/camera-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/camera-target-surface.tsx`
- `apps/frontend/src/features/local-editing/clip-batch-panel.tsx`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/clip-rail-preview.tsx`
- `apps/frontend/src/features/local-editing/editor-preview-form.ts`
- `apps/frontend/src/features/local-editing/editor-state.ts`
- `apps/frontend/src/features/local-editing/editor-timeline.ts`
- `apps/frontend/src/features/local-editing/focus-editor.tsx`
- `apps/frontend/src/features/local-editing/focus-preview-controls.tsx`
- `apps/frontend/src/features/local-editing/head-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/head-selection-view.tsx`
- `apps/frontend/src/features/local-editing/media-camera-controls.tsx`
- `apps/frontend/src/features/local-editing/media-camera-inspection.test.ts`
- `apps/frontend/src/features/local-editing/media-camera-inspection.ts`
- `apps/frontend/src/features/local-editing/media-face-tracking.tsx`
- `apps/frontend/src/features/local-editing/picture-timing.tsx`
- `apps/frontend/src/features/local-editing/preview-images.tsx`
- `apps/frontend/src/features/local-editing/runtime-capabilities.test.tsx`
- `apps/frontend/src/features/local-editing/track-head-video.ts`
- `apps/frontend/src/features/local-editing/use-inspector-playback.ts`
- `apps/frontend/src/features/local-editing/visual-camera-target.test.ts`
- `apps/frontend/src/features/local-editing/visual-camera-target.ts`
- `apps/frontend/src/features/local-editing/visual-media-controls.tsx`
- `apps/frontend/src/proxy.test.ts`
- `apps/frontend/src/proxy.ts`
- `apps/frontend/src/server/local-workflow.test.ts`
- `apps/renderer/local/audio-mix.ts`
- `apps/renderer/local/clip-render.ts`
- `apps/renderer/local/export-profile.test.ts`
- `apps/renderer/local/export-profile.ts`
- `apps/renderer/local/media-capacity.test.ts`
- `apps/renderer/local/media.ts`
- `apps/renderer/local/overlay-page.tsx`
- `apps/renderer/local/overlay-protocol.ts`
- `apps/renderer/local/rasterize-overlay.ts`
- `apps/renderer/local/server.ts`
- `apps/renderer/local/video-frames.ts`
- `apps/renderer/local/video-media.ts`
- `apps/renderer/package.json`
- `apps/renderer/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/tickets/CL-271-muted-video-b-roll-with-continuous-captions.md`
- `docs/tickets/README.md`
- `packages/composition/local/automatic-overlay.tsx`
- `packages/composition/local/overlay-frame.ts`
- `packages/composition/local/README.md`
- `packages/contracts/local/assets.ts`
- `packages/contracts/local/camera-follow.ts`
- `packages/contracts/local/camera-motion.test.ts`
- `packages/contracts/local/camera-motion.ts`
- `packages/contracts/local/clips.ts`
- `packages/contracts/local/edit-overlay.ts`
- `packages/contracts/local/editor.ts`
- `packages/contracts/local/head-path.ts`
- `packages/contracts/local/hook-content.ts`
- `packages/contracts/local/hosted-editing.ts`
- `packages/contracts/local/index.ts`
- `packages/contracts/local/video-assets.ts`
- `packages/contracts/local/visual-effects.ts`
- `packages/contracts/local/visual-tracking.ts`
- `pnpm-lock.yaml`
- `scripts/local-media-build.mjs`
- `test/local-broll.proof.ts`
- `test/local-video-frame-presentation.proof.ts`
- `test/owner-broll-browser-fixture.ts`
- `test/owner-media-camera-acceptance.ts`
- `test/owner-visual-media.test.ts`
