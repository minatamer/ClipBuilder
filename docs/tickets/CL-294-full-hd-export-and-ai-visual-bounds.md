# CL-294 — Full-HD portrait exports and automatic visual bounds

Status: implemented and locally validated, 2026-11-12. The owner lifts CL-293's planning
hold and requests all listed tasks through execute/validate loops. Existing
CL-275–293 work is preserved; the Git index is empty. No staging or commits.

## Scope and sequence

1. Export new clips at exactly 1080 by 1920 locally and in the shared hosted
   editing renderer. Keep vertical 9:16, original-source crop/fit/zoom, source
   cadence, Hook/body/audio clocks, captions/graphics, matte/media ordering and
   existing CRF/audio settings. Render graphics at full-HD resolution. Changing
   canvas size does not recover missing source detail; no super-resolution or
   AI upscale. Preserve old exports and source files. Validate this slice before
   implementing automatic visual changes.
2. At most one automatic AI visual per clip in both Codex/local and Gemini/
   hosted flows, shared across generated/fetched results and explicit local
   rediscovery. Empty results remain valid. Keep manual uploads/placements and
   existing saved assets/exports. Preserve usable provider response decoding,
   critique-only quality policy, bounded fallback and no automatic retries.
3. Find visuals is local-only: hide its CTA on hosted clients and block the
   endpoint before provider work in every hosted server composition. Keep
   hosted automatic imagery and manual media editing available.
4. Cancelling an export returns to the existing ready editor after the native
   worker has settled, with current edits, preview, history and old outputs
   intact. Do not leave an export-canceled placeholder or auto-retry. Keep a
   genuine canceling state while cleanup is active. Interrupted initial clip
   preparation without a usable preview still needs explicit retry.
5. Preserve the existing single-export-at-a-time UI/worker behavior, which the
   owner explicitly likes. CL-292's twenty-minute local timeout is conditional
   on another deadline failure. The later Clip 6 full-HD acceptance reached the
   ten-minute deadline (600,897 ms), meeting the condition. Extend only local
   clip exports to twenty minutes. A later explicit owner approval raises hosted
   clip exports from ten to fifteen minutes. Match the RPC deadline
   to the worker with the existing one-minute cleanup grace. Use trusted process
   composition, never a client/job/environment override.
6. Owner follow-up: investigate clip-rail thumbnails stuck at Preview unavailable.
   Recover automatically from transient source/frame failures using the shared
   thumbnail path, with bounded backoff and readiness/reconnect signals. Keep
   deliberately designed loading/error states and stable geometry, no request
   storms or AI/render retry. Verify pending, failed, available-after-failure,
   repeated failures, source changes and cleanup. Finish the running Clip 6
   export before making a change that could refresh its backend.

## Verification and limits

Use focused fake/no-key/paid-off tests with exact image/provider call counts,
original hashes, full output dimensions, source cadence/clocks, invalid inputs,
manual coexistence, rediscovery/reopen and hosted UI/server gates. Native pixel/
MP4 proofs use generated silent media, real local FFmpeg and injected browser
capture; interactive checks use Codex's browser only, never fullscreen or an
external/headless browser. Rebuild current worker/overlay and reload only after
checking idle state, rolling recovery and lifecycle ownership. Leave frontend,
owner clips, ignored configuration and Voyagenda intact. No real AI, automatic
owner export retry, source download, cloud/deployment, push or new dependency.

Full real-provider visual quality and actual deployed/browser-device acceptance
remain owner-only. Synthetic proof demonstrates contracts/rendering/transport,
not provider output quality. Record actual results per slice below.

Owner acceptance authorization: after implementation/isolated validation, use
Clip 6 in the current session with its existing acknowledged edits for an app
export test. Preserve and privately compare the edit/source/assets snapshot.
Exercise export cancellation and return to the editor, then let one new final
export finish. This authorizes local rendering, not AI/provider processing,
media replacement, deleting earlier exports or deploying the hosted build.

## Slice 1 — Full-HD export

Implemented and validated: profile tests and native Glass scene/mux checks pass
(seven cases). Real FFmpeg output probes confirm 1080 by 1920 from generated
low-resolution footage at 24, 60 and fractional cadence. Browser capture alone
is injected; no external browser launched. Original-source hashes and independent
Hook/body clocks remain intact. The original downloaded file stays unchanged.

## Slices 2–3 — Automatic visual cap and local discovery

Implemented: a shared fresh-acquisition limit of one leaves legacy schemas at
three for saved-plan compatibility. Prompts/scouting/normalization and initial/
rediscovery/partial-resume acquisition share the limit. The hosted picture
compiler stops after its first retrieved or generated success. Rediscovery
shares the new AI asset with its clipped Hook occurrence, preserving manual
media and independent Hook settings. It retains old assets and exports.

The local core now advertises discovery only outside hosted mode, rejects
hosted discovery requests before planner work, and the inspector hides the CTA
when unavailable. Existing hosted facade denial remains. Focused injected tests
passed: 184 cases across provider/batch/planning/hosted/core HTTP behavior, plus
32 shared picture compiler cases, including generated and retrieved alternatives.

## Slice 4 — Export cancellation

Implemented: a completed preview/output returns to ready/review-ready/validated
editing after canceled native work drains. Fresh unfinished preparation remains
canceled. Restore handles older prepared canceled exports without extra work.
86 focused cases pass across batch cancellation, protected HTTP/recovery and
frontend readiness. Current edits, assets and old outputs survive; cancellation
does not dispatch more image/planning calls.

## Integration and actual owner export acceptance

Local/frontend/backend and browser-safe contract types, scoped ESLint/Prettier
and diff whitespace checks pass. Both local and hosted editing worker/overlay
artifacts build without a cloud action. The generated black-bar/camera native
pixel proof also passes after the output-profile change. The read-only validation
found no actionable scope issue; unrelated earlier work is retained.

Codex's silent hosted fixture confirms Find visuals is hidden at laptop and
390px widths while manual upload/picture/video tabs remain available. Document
widths are 1276/1280 and 386/390 respectively; no horizontal overflow. The fixture
recorded zero edits/unexpected commands and was closed. Its one-off launcher was
removed. A synthetic screenshot stays outside Git; no portfolio files changed.

Confirmed idle normal session and rolling recovery before refreshing only the
owned backend/worker through the existing watcher. Frontend PID/creation identity
stayed unchanged, seven clips reopened, and the new worker postdates the rebuilt
bundle. Clip 6's prior canceled export reopened in its editor without processing.

Via the normal Codex app UI, started and canceled one Clip 6 export. After native
cleanup the actual editor returned, Export was enabled, and no Canceled placeholder
remained. Private exact comparisons show all seven bases/edits/assets/old outputs
and the source unchanged; only Clip 6's render counter increased once. No image
or planning calls changed. Then started the authorized final Clip 6 export;
the first full-HD attempt reached its original deadline as recorded below.

### Conditional local deadline revision

The full-HD Clip 6 attempt reached the existing ten-minute limit after 600,897 ms
while native frames had continued advancing. Applied the owner's conditional
extension: local clip-export worker budget twenty minutes and RPC twenty-one,
hosted budgets ten and eleven. A private boolean is injected only by local/
hosted process composition; no request field, environment override or provider
switch was added. Default/legacy worker composition stays at the hosted budget.
Other media/Codex/acquisition deadlines remain unchanged.

Fifteen focused worker/transport cases pass, including actual loopback worker
execution with local/hosted/default flags and rejection of a forged job flag.
Normal activation exposed strict runtime discovery's unknown-field rejection;
the validator now admits only the optional private boolean while retaining its
path/process/token/unknown-field checks and omitting the flag from discovery.
The discovery/transport regression group passes 25 cases, with legacy records,
invalid types and no flag disclosure covered. Local types and scoped lint/format
pass; local and hosted bundles were rebuilt. The frontend stayed in place and
the healthy normal app reopened all seven saved clips.

Explicitly retried only Clip 6 using its existing base/preview/edit revision.
Its final twenty-minute-budget export completed. The downloaded native MP4
probes as H.264 1080 by 1920, square pixels, yuv420p, 906 video frames with source
fractional cadence, AAC 48 kHz stereo, 37.787743 seconds and 20,703,325 bytes.
Downloaded bytes match the acknowledged artifact. Private exact comparisons
across all seven clips confirm the source, bases, edits and picture/video/audio
assets unchanged, all previous outputs retained, and planning/image counters
unchanged. Clip 6 alone used three native render attempts (canceled, deadline,
completed). No other clip was rendered during this acceptance.

## Slice 6 — Shared thumbnail recovery

Root causes: the clip rail latched both its media failure and Player error
boundary until remount; its key omitted workspace identity. The shared still
cache also retained unavailable results for the subscription lifetime, and a
stalled decoder could hold its serial queue. Presented image failures were
locally latched rather than invalidating the shared still.

Implemented one reusable recovery controller for rail and still paths, with
deduplication, 1/2/4/8/16/30-second capped backoff, offline/hidden suspension and
reconnect/focus/visibility wakeup. Rail retries remount only its silent Player,
retain the shared still fallback and guard stale attempt callbacks. Shared
still attempts time out after thirty seconds and release the queue even if a
decoder fails to settle; invalid/capacity inputs stay distinct. Image-element
failures invalidate only their current URL. Last-subscriber/source cleanup
cancels work/timers/listeners and releases URLs. One shared indicator avoids
duplicate spinners; old dead placeholder styling was removed.

Eight focused fake/no-key cases pass for transient recovery across subscribers,
continuous capped backoff, hidden/offline suspension, ready/disposal cleanup,
stalled decoding, stale-image errors, replacement sources and late results.
Frontend typecheck and scoped lint/format pass. The read-only revision checked
StrictMode teardown, queue release, source keys, stale callbacks and retained
media/security boundaries; no actionable finding remains in this slice.

Codex's silent generated browser fixture held source reads at HTTP 503, showed
one designed recovery indicator, then recovered the composed rail automatically
when reads resumed, without click, hover or reload. The recovered video had
readyState 4 and stayed paused/muted. The main editor's separate manual Retry
preview was used only after rail recovery. Laptop and 390px phone widths were
1276/1280 and 386/390, with no overflow. The fixture recorded zero edits and
unexpected commands, was closed, and its temporary launcher/listeners removed.
A synthetic recovery screenshot is retained outside Git. No API keys, AI or
render calls are involved in thumbnail recovery; live AI quality is unchanged.

## Requested follow-up acceptance — Clip 4

The owner asks for the existing Clip 4 at the new output resolution. An old
artifact download remains at its encoded resolution, so an explicit fresh
export is required. After thumbnail validation, captured the current session
privately and submitted one normal protected render request for Clip 4's saved
revision, with no edit or provider operation. Export completed in 895,880 ms
(14m 55.9s). The downloaded MP4 probes as 1080 by 1920 H.264, square pixels,
yuv420p, 774 frames at native fractional cadence, AAC 48 kHz stereo, 32.282244
seconds and 16,192,247 bytes. Bytes match the acknowledged output. All seven
clips' edits, bases and picture/video/audio assets match the private baseline;
the previous output remains retained. No AI rerun occurred.

The owner subsequently approved fifteen minutes for hosted exports. Applied
after Clip 4 finished, retaining twenty local and one minute RPC cleanup grace.
Worker/RPC loopback tests now assert the literal fifteen/twenty-minute budgets
and cleanup grace, including default hosted composition and forged-client
rejection. The 25-case worker/discovery group, local typecheck and scoped lint/
format pass. Local and hosted worker artifacts were rebuilt; the normal owned
backend/worker refreshed only after confirming idle state and retained output.
Frontend stayed on its existing process. Seven clips and both Clip 4 exports
reopened, with the new download ready for owner review. No ignored configuration,
cloud or deployment was changed. Actual platform budgets must still allow
the complete request/cleanup when a future deployment is separately authorized.
Local timing is not a hosted benchmark. Cloud Run supports longer request
budgets, but its HTTP timeout alone does not stop container work, so application
abort/reaping must remain. See the [official request-timeout guide](https://docs.cloud.google.com/run/docs/configuring/request-timeout).

Final scope review found no remaining actionable implementation issue in this
packet. Thumbnail checks are generated/fake/no-key; Clip 6/4 acceptance is actual
owner-authorized native rendering of existing saved edits, with no provider
inference or visual regeneration. Hosted release/real-provider creative quality
and personal visual acceptance remain owner-only. Git index stays empty; no
staging, commit, push, deployment or Voyagenda change was performed.
