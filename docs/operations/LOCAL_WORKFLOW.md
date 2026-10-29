# Local editing in ClipBuilder

CL-061 makes upload → moments → editor the shared normal workflow locally and
when hosted. Only YouTube acquisition is local-only. The local commands and
configuration below remain; hosted session/native packaging and owner-only
release checks are in [hosted editor preparation](HOSTED_EDITOR_RELEASE_PREPARATION.md).
The existing deployed revision is unchanged until the owner deploys; agents must
never deploy or run credit-consuming tests without new approval.

Use the normal application at `http://localhost:3000/start`. The frontend runs
on 3000 and backend on 4000 using their normal commands and existing app-local
`.env.local` files. There is no separate owner app or startup mode.

Processing opens a clean editor with clip tabs. Captions/Filters/Media/Focus show
one inspector at a time; caption Style/Position/Text and picture Image/Timing/Motion/
Position keep related controls separate. Add more clips returns to selection;
Back to editor preserves the work. Apply/Discard replace navigation while edits
are pending. Start over is directly visible in the footer, including with dirty
edits; it clears the current workspace and returns to fresh upload/YouTube
intake. Active processing disables reset, and failed cleanup offers retry or
explicit discard. Existing saved drafts/exports and downloaded/retained sources
are preserved. No Save draft or permanent export-history panel is shown.

Caption positions center at the upper quarter, center or lower quarter. Drag,
resize and keyboard placement use the actual scaled preview. Social caption
styles and picture entrance/exit effects share native export rendering. Upload
static PNG/JPEG/WebP pictures to insert them directly; configure each cue's timing
and position. Up to twenty manual cues do not increase the three-image AI budget.
Fake analysis supplies fictional dialogue for moment/focus testing; new clips
start with no captions or automatic pictures. `apps/backend/local/fake-content.ts`
owns `FAKE_CAPTIONS_ENABLED=false`, a hardcoded switch rather than an env entry.
The automatic Earth picture is permanently retired. Existing saved media stays.

Empty Captions offers Generate captions and, locally only, Generate fake captions.
Captions → Speakers has one selector per full caption. A selection applies to
all its words; automatic attribution uses the most frequent known speaker (first
known speaker breaks ties). The whole caption keeps that speaker/color, including
when excerpted into a Hook. Word IDs, text and timing are preserved. These manual
controls work without keys in fake mode; real diarization remains provider-gated.
The fake action restores fictional captions on demand without keys or spend.
The Gemini action confirms sending only this clip's audio and using credits.
CL-078 authorizes this narrow local paid port even with FAKE_MODE=true and
PAID_DEMO_ENABLED=false; an existing configured Gemini key is still required.
It enables no other paid feature and changes no configuration. Hosted retains
normal paid/authentication/spend gates and excludes fake generation. Automated
checks inject fake transports; real API quality/spend remains owner-manual.
Caption Text permits word corrections with timestamps fixed, shared by preview,
Apply/Discard, saved drafts and exports. No caption timestamp controls are added.

When changing shared local contracts/composition or native worker code, refresh
the normal backend so its compiled worker/overlay matches the frontend. Normal
startup performs the build; do not test against a stale `.local-build` bundle.
Synthetic editing proofs compile the overlay into their own temporary scratch.

For fake AI with actual local video processing and downloads, set
`FAKE_MODE=true` and `PAID_DEMO_ENABLED=false` in `apps/backend/.env.local`.
No API key or gcloud service is needed. The agent never reads that ignored file.
The frontend has no separate AI setting. Next loads its existing configuration.

Media contains Pictures and Audio (CL-133). Audio offers six original synthesized
sounds with explicit previews, plus MP3/WAV/M4A uploads up to 12 MiB and two
minutes. Up to eight uploads and twelve cues per clip support source-timed effects,
Hook-only music or continuous whole-video music, volume, offset and looping.
Timed effects repeat the captured Hook range; Hook-only music stops at its end.
Original speech stays at 100% until edited. Apply/Discard, saved drafts, playback
and native exports share these manual edits without an AI call. This works with
fake mode and no keys; fresh real AI still needs configured keys, live flags,
applicable approvals and owner action. See [audio design and bounds](../architecture/MEDIA_AUDIO.md)
and [verification](../tickets/CL-133-media-audio.md). Owner listening/real-media,
physical-device and hosted acceptance remain separate; no deployment occurred.

From the repository root:

```powershell
corepack pnpm build:contracts
corepack pnpm dev:backend
# In another terminal:
corepack pnpm dev:frontend
```

Backend startup builds and manages the private native worker automatically on
loopback 4200; shutdown drains it. It verifies prepared FFmpeg, yt-dlp, Deno and
Chrome before starting. Missing/changed tools or an occupied port fail with a
fixed prerequisite error. Startup never downloads software or calls YouTube/AI.
The pinned tools already prepared on this workstation live in ignored
`.local-build/tools`. A fresh Windows x64 workstation prepares them once with
`scripts/prepare-local-media.ps1` and `corepack pnpm local:prepare:youtube`.
Chrome must already exist at its documented fixed installation path.

Choose an MP4 or a saved ClipBuilder `draft.json` with the same upload action.
A matching saved source, clip or export reopens its latest saved draft and existing
downloads without new AI, acquisition or rendering; otherwise an MP4 uses normal
intake. Draft references resolve only the registered local bundle. Opening still
validates and links/copies local bytes. A standalone MP4 has no editable draft
metadata when no matching saved draft remains. Save applied edits from the compact
editing-footer action; later acknowledged changes autosave. There are no permanent
saved-library sections.

Focus has Camera and People views. Camera contains Timing and Advanced for the
selected person/position. Each timeline row has its own position number, camera
settings and time span, even when another row has identical framing. Select a
position, scrub the left vertical preview and Capture its
Start or End. End includes the paused frame; clip endpoints stay locked and inner
boundaries move their neighbor too. Scrubbing never silently selects another
position. Add position first asks for a person, defaulted to the highlighted row.
Choose another person if wanted, then Add to insert directly below that row or
Cancel without changing anything. The new range starts within the selected
row's later interval and opens Timing; adjust Start/End or Capture the desired
boundaries. It uses the chosen person's existing framing. Remove
position extends its neighbor and renumbers that person's remaining positions.
During playback the Focus source overview holds the selected camera's editing
frame; pause or seek to update it. The left vertical preview and camera-row
playhead continue normally, and Capture uses the settled left preview frame.
People selects a person/position without appearance timestamp controls. Drag the
centered numbered handle, or use arrow keys, to correct only that position.
Changing the Position selector navigates to its own camera settings and time.
Advanced inside Camera holds Zoom and Horizontal/Vertical percentages. Unused people have an explicit Use here
action. Add a missed person at the current crop; each person has their own Remove
button. Removal preserves their crops as custom framing and leaves other people
unchanged. Original AI observations/timestamps remain retained as protected data.
Apply/Discard use the existing footer. Reset focus restores the automatic plan;
none of these manual controls calls Gemini. Applied focus is saved and used by
the next explicit MP4 export; previous exports retain their original framing.
Final exports stay vertical and use original source pixels, rather than the
reduced preview cut. Native 9:16 portrait dimensions stay unchanged; landscape
output uses source height with even-pixel width rounding (for example a 4K
3840x2160 landscape source produces 1216x2160 portrait output). Native portrait
2160x3840 stays 2160x3840. Source nominal frame rate is retained; VFR is normalized
to that rate. The editor/overlay clock stays 30 fps. Cropping/zoom still limits
available detail; a bigger file cannot recover pixels missing from the source.
Video is encoded once at CRF 18 from the original; previews and AI proxies remain
separate. Existing saved MP4s stay immutable; explicitly Export clip again to
create a revision using the corrected path. Download/save copies do not re-encode.

New clips fill the portrait frame automatically. The existing selected-clip video
request also returns anonymous person observations and camera evidence. The
compiler starts with a visible person (or a provisional side crop), holds
same-shot framing through uncertainty and cuts after a second of supported
speech for another visible person. Real shot cuts reset geometry. Fake mode
supplies fictional people/tracks; it does not detect people in your actual video.
Real observations still require the configured provider/live approvals and the
owner's manual action. Existing saved clips keep their accepted appearance;
use Focus to correct them without redoing paid analysis.

Content-safe backend diagnostics include `focus_plan`, `focus_compile`,
`focus_edit` and `focus_export`. The `focus` summary records returned/accepted
people and decision counts, observation/shot counts, switches, holds, provisional
fallbacks and discarded undecodable items/converted clocks. It never logs boxes,
words, media, raw provider bodies or private paths. The normalized automatic
track is in the protected clip response's `base.overlay.focus`; an applied
override is in `edit.focus`, and preparation checkpoints retain `preparation.focus`.
These stay in the existing workspace/private draft, with no public debug route
or additional provider request. Compare safe log counts and inspect the People/
Camera views to diagnose a hold or missed person. Real AI accuracy and Linux/
hosted release acceptance remain separate from synthetic Windows proofs.

Alternatively, enter a supported YouTube video link and Continue. The card switches
to resolution selection; choose a quality or Best available, then Download video.
Ready saved copies appear in the same picker offline; More resolutions explicitly
requests online qualities. New downloads save automatically to Downloads/ClipBuilder.
Downloading is real even with fake AI. Access,
regional restrictions and upstream challenges can still prevent a download;
there is no account-cookie/DRM bypass. Saved source reuse checks the existing
bytes before offering a new download. Source masters, drafts and exports stay
outside Git. Existing Desktop/ClipBuilder sources remain reusable. Clearing scratch
or deleting a draft preserves its source/exports.

Choose exact manual ranges, independent AI duration bounds and suggestion
count, then process several clips. Review captions, pictures, placement, fonts,
animation, size and video looks; export from the workspace footer. The Save draft
control is retired; existing saved drafts still reopen and autosave. Fake AI generates
fictional moment/focus inputs and does not establish real AI quality. Native
inspection, cutting, overlays and encoding process actual local bytes.

Completed transcription is reused for the same source/revision and AI mode in
the current workspace, including new ranges/settings and an explicit retry after
moment selection fails. AI discovery still makes a fresh selection request.
Existing saved drafts with analysis also reuse their verified transcript; new
transcription checkpoints are session-only and disappear on clear/expiry/shutdown.
There is no new persistent cache or automatic provider retry. Fake/no-key mode
uses fictional words; real processing retains the keys/live approvals below.

To verify reuse, keep the same source/session open, submit moments once, then
change a clip range and submit again. In browser developer tools, inspect the
new analysis **POST response**: `calls.transcription` is `0` on reuse (`1` for
fresh transcription). AI discovery can still report `calls.selection: 1`; using
manual-only ranges with retained words reports both calls as zero. Reading the
response or logs does not dispatch AI; submitting real AI discovery can spend
credits under the normal owner-controlled settings.

The backend stderr log also emits an `analysis_diagnostic` record with
`phase: "transcription_reuse"`, `outcome: "succeeded"` and the fixed message
`Source transcription reused; no transcription request: succeeded`. Its
`requestId` matches that request's `find_moments` diagnostics. Fresh real-mode
transcription instead has `operation: "transcribe"` start/success records.
Search the normal backend log recorded by the local launcher; no transcript,
fingerprint, workspace ID or filename is included in the reuse marker. Clear,
expiry and backend restart end session-only reuse; existing saved draft analysis
can seed reuse again after reopening.

Real AI uses the same normal backend configuration: `FAKE_MODE=false`,
`PAID_DEMO_ENABLED=true`, `GEMINI_API_KEY` and the existing transfer, image,
paid-project and spend approvals. Only Gemini APIs are used by this local AI
workflow; no Cloud Run, GCS, service account or gcloud service is needed for its
native media operations. No offline AI model/weights are provided. Paid testing
is owner-manual. Hosted deployments keep the existing bounded demo and reject
local editing routes; this change does not deploy anything.

The [agent commands](../../apps/backend/local/AGENT_COMMANDS.md) use the same
backend and protected edit/export coordinator. Private per-run discovery retains
process identity/creation-time checks; the browser never receives its token.
Streaming proxies reject cross-site requests and propagate Range/cancellation.
Runtime records and content-safe worker logs stay in an OS-temp
`clipbuilder-local-runtime-*` folder. Logs are preserved on shutdown; private
capabilities and processing scratch are removed.

CL-058 connects structured `local_diagnostic` records in the normal backend and
worker logs. Find moments, transcription/selection, input preparation, visual
planning/images, background clip/render work, draft saving, streaming, cleanup
and startup report operation names, timings and safe failure classifications.
Backend request IDs correlate Gemini phase/HTTP/rule/schema diagnostics; native
job IDs connect backend RPC records to worker failures. Successful read/progress
polls stay quiet. Backend local records are capped at 128 per root operation
(sixteen slots reserved for failures), alongside the existing 256-record provider
cap. Each native job emits at most start and terminal records. Log sink failure
does not alter processing or add a retry.

Exception messages, stacks, media, filenames, local paths, credentials and raw
provider responses are excluded. Native stderr has only a bounded in-memory
classification tail; logs retain a fixed reason and exit/system code. Unknown
errors retain their operation/class and safe structural details. Private Gemini
body capture remains separate and is never enabled by local workflow diagnostics.
An original failed attempt cannot be diagnosed retroactively if its old logger
discarded the error. Fake/no-key tests verify logging with synthetic failures;
actual Gemini failure evidence requires the owner's deliberate real-mode retry.

Permanent Gemini acceptance (CL-060) supersedes CL-059's timing filtering:
decoded words retain their provider order and timestamps. Timing, evidence,
grounding, duration, overlap and visual-quality critiques are logged without
rejecting usable results. Physical source/render bounds are converted safely.
Usable pictures survive unfinished metadata, extra parts and low resolution;
unreadable optional art leaves the video/captions available. Structural decoding,
source/asset binding, cancellation and resource limits still apply.

CL-084 prepares a playable preview and AI editing data first, with zero finished
MP4 exports. Review/edit normally, Apply/Discard, then use Export clip to create
the first final MP4. Download reuses a matching output. Captions, pictures,
framing, filters and final original-source quality are unchanged. Preview-only
drafts reopen locally without processing. Agent checks use synthetic media and
injected AI; owner real-mode acceptance still requires normal keys/approvals.

Failed or canceled clips expose Retry clip in the workspace footer, including
failures before preparation finishes. Explicit retry retains completed plans and
images across saved drafts. Missing preview preparation retries playback only;
an actual failed export retries final rendering without repeating AI.
An older failed attempt that never retained a plan needs fresh planning on its
first explicit retry. There is no automatic provider retry or regeneration.
The same serialized worker, revision and duplicate-request guards remain. Fake
mode needs no keys and proves these paths with synthetic data; real Gemini uses
the configured API key/live approvals and the owner's deliberate action.

Verification is synthetic/fake, paid-off and network-blocked. Real YouTube,
Gemini quality, A/V readability and owner usability remain manual acceptance in
[CL-025](../tickets/CL-025-owner-manual-local-workflow-acceptance.md).
