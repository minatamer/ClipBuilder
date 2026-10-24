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

Processing opens a clean editor with clip tabs. Captions/Filters/Pictures show
one inspector at a time; caption Style/Position and picture Image/Timing/Motion/
Position keep related controls separate. Add more clips returns to selection;
Back to editor preserves the work. Apply/Discard replace navigation while edits
are pending. The footer has one primary plus one secondary; Session owns Start
over. No Save draft or permanent export-history panel is shown.

Caption positions center at the upper quarter, center or lower quarter. Drag,
resize and keyboard placement use the actual scaled preview. Social caption
styles and picture entrance/exit effects share native export rendering. Upload
static PNG/JPEG/WebP pictures to insert them directly; configure each cue's timing
and position. Up to twenty manual cues do not increase the three-image AI budget.
Fake analysis is fictional dialogue; its recognizable offline sample image is
credited in the backend's SAMPLE_MEDIA.md. Existing saved media is preserved.

When changing shared local contracts/composition or native worker code, refresh
the normal backend so its compiled worker/overlay matches the frontend. Normal
startup performs the build; do not test against a stale `.local-build` bundle.
Synthetic editing proofs compile the overlay into their own temporary scratch.

For fake AI with actual local video processing and downloads, set
`FAKE_MODE=true` and `PAID_DEMO_ENABLED=false` in `apps/backend/.env.local`.
No API key or gcloud service is needed. The agent never reads that ignored file.
The frontend has no separate AI setting. Next loads its existing configuration.

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
fictional words/moments/pictures and does not establish real AI quality. Native
inspection, cutting, overlays and encoding process actual local bytes.

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

Failed or canceled clips expose Retry clip in the workspace footer, including
failures before preparation finishes. Explicit retry retains completed plans and
images across saved drafts, and a prepared clip repeats only native rendering.
An older failed attempt that never retained a plan needs fresh planning on its
first explicit retry. There is no automatic provider retry or regeneration.
The same serialized worker, revision and duplicate-request guards remain. Fake
mode needs no keys and proves these paths with synthetic data; real Gemini uses
the configured API key/live approvals and the owner's deliberate action.

Verification is synthetic/fake, paid-off and network-blocked. Real YouTube,
Gemini quality, A/V readability and owner usability remain manual acceptance in
[CL-025](../tickets/CL-025-owner-manual-local-workflow-acceptance.md).
