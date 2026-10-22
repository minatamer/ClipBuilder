# Local owner workflow — research and proposed design

Date: 2026-10-22. Status: recommendations adopted by the owner's later AFK
execution authorization. This research is design evidence; individual tickets
record implementation and synthetic/runtime checks. Sequential fake-tested
execution permits zero paid/provider/cloud/real YouTube calls. This note supports
[CL-017–CL-024](../tickets/README.md#local-owner-workflow-execution--2026-10-22).

## CL-022 recorded decision — 2026-10-22

The [acquisition ADR](../architecture/LOCAL_SOURCE_ACQUISITION.md) is the current
design authority for the linked-source lane. Technical go covers isolated
CL-023 code and synthetic tests; real source/method clearance, binaries and
runtime behavior remain unverified and real acquisition is unavailable.
Rechecked precedents use quality ceilings/fallbacks, so exact formats and
post-download validation are required. Offline source reuse precedes online
metadata. Best available is ranked before compatibility filtering, with an
explicit stop/choice for unsupported codecs/HDR.

The reviewed tools are yt-dlp 2026.10.21 and Deno v2.9.8, with published hashes
and source links in the ADR. Deno replaces the earlier Node-only challenge
recommendation because Node 22/24 lacks child network denial; the app keeps its
existing Node. No tool was installed/executed or real video queried/downloaded.
Earlier proposals below are retained as decision history where superseded.

## Proposed decisions for owner adoption — 2026-10-22

The owner has adopted this complete set for implementation. It supersedes the
earlier session-only draft and public-source-envelope recommendations below.
Capacity targets still need verification; adoption is not evidence of real AI
quality or source/downloader compatibility. Public product limits are unchanged.

### Local capacity targets

| Setting                         | Recommended first-version target                                                                                      | Reason / boundary                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Active source                   | One complete conversation, at most 60 minutes and 10 GiB                                                              | Useful for hour-long material without introducing a multi-source or multi-hour workflow                  |
| Source picture size/rate        | At most 3840×2160 or portrait equivalent, 60fps, supported SDR codecs                                                 | Retain 4K crop detail; codec/HDR acceptance still needs the local media boundary proof                   |
| AI discovery duration           | User-selectable 10–60 seconds, including min=max                                                                      | Preserves the requested exact 30/60-second cases with a bounded initial profile                          |
| Manual ranges                   | At most ten ranges, each 1–300 seconds within the source                                                              | Independent of AI duration/ranking rules; explicit rejection rather than silent clipping                 |
| AI suggestions / selected clips | Up to four additional suggestions; up to ten clips selected per source                                                | Keep manual rows and discovery separate while bounding assembly work                                     |
| Heavy media concurrency         | One active native decode/render job by default; ceiling of two only after a successful local resource proof           | The read-only OS query reports 16 GiB RAM and 12 logical processors; these are not a rendering benchmark |
| Other dispatch                  | One active downloader and one provider request; no automatic provider retry                                           | Bound acquisition and paid work independently of the selected clip count                                 |
| Output                          | 1080×1920, 30fps H.264/AAC; at most 1 GiB per output                                                                  | Keep current portrait delivery while allowing a longer manual clip; verify encoding/cap behavior         |
| Scratch/disk                    | At most 20 GiB owned processing scratch; preserve at least 10 GiB free after reserving the operation's peak disk need | Preflight source staging, stream merge, copies and output together; fail safely before exhausting disk   |
| Saved-source library            | Warn at 50 GiB; no automatic deletion of completed sources                                                            | Storage advice must not silently revoke the owner's save-once/reuse decision                             |

These are proposed limits, not measurements or claims that existing code accepts
them. The current public envelope remains 20 minutes/500 MiB/10–60-second clips.
Even the existing owner-validation profile is not a complete implementation of
this table. Sixty-minute intake, larger files and five-minute manual outputs
need a coherent owner-only contract, audio/proxy bounds and synthetic native
verification in CL-017/018/019. In particular, the existing 24 MiB
analysis-audio bound must be reconciled with the longer fixed audio profile; do
not simply raise a source-duration constant or send oversized provider input. No
chunking, extra provider calls, raised spend approval, codec expansion or cloud
fallback is implicitly approved by these targets. If a target fails its proof,
report that result rather than silently lowering quality or expanding work.

All selected clips still run after one work-list action, and review/editing can
continue while the worker handles another clip. One active heavy job is queued
batch processing, not simultaneous native rendering. Two-worker performance must
be demonstrated before enabling that option. Saved copies are reused before any
download or online-format query, regardless of worker count.

### Reopenable private drafts

Recommend an explicit Save draft action once per workspace, followed by
automatic local saving of acknowledged edits to that draft. Until the first
save, mark the workspace as session-only. This intentionally replaces the
earlier session-only draft recommendation if the owner adopts it: reliable
professional re-editing benefits from reopening validated work without another
AI run.

Use the OS Downloads known folder, with `ClipBuilder/Sources`,
`ClipBuilder/Drafts` and `ClipBuilder/Exports` as distinct local areas. Source
masters and exports are preserved independently of drafts; processing scratch
stays under an owned OS-temporary directory. No directory is created now.

A saved draft contains the source ID/digest, manual ranges and AI duration
settings, validated transcript/candidate data, automatic base composition,
current caption/visual edits, required normalized picture assets and revision
metadata. Store a private versioned JSON document plus owned asset files, not a
database or browser-only persistence. No credentials, provider raw responses,
request authentication, expired capabilities or diagnostic captures belong in
it. This is a new local draft format, not the retired saved-sample replay.

Use one writer, debounced atomic saves and one last-good recovery copy;
acknowledge durability honestly and never add an undo/history product. Save
failure preserves the last good draft and reports unsaved changes. Resume
verifies source/assets and schema before accepting edits; changed/moved files
need relinking/validation, not an automatic download. Reopening a completed
saved edit requires zero AI calls; interrupted paid work is never silently
replayed. A new AI action still needs its own live/rights/transfer/spend gates
and remains owner-only.

Saved drafts have no automatic expiry. Delete draft removes only that draft and
its unshared owned assets after readers drain, never its source master or saved
exports. There is no cloud sync implemented by ClipBuilder. Persistent
transcript, caption and picture retention is the material local privacy decision
that adopting this proposal would authorize; it must be copied into the source
of truth and scoped local operating rules before implementation. The public
product remains disposable and read-only.

### Downloader choice and maintenance

The CL-022 decision above supersedes this subsection's Node-only runtime
recommendation; its thin-adapter, pinned-tool and no-runtime-download direction
remains adopted.

Recommend a thin backend-owned process adapter around the official Windows
`yt-dlp.exe`, explicit maintained FFmpeg/FFprobe paths, and the already present
Node runtime for the supported JavaScript step. This avoids a second downloader
application, Python environment or always-running service. Upstream lists Node
as supported and states that official bundled executables include the EJS
components.
[Runtime/EJS documentation](https://github.com/yt-dlp/yt-dlp/wiki/EJS).

The current inspected stable candidate is
[yt-dlp 2026.10.21](https://github.com/yt-dlp/yt-dlp/releases/tag/2026.10.21).
Review and verify the chosen official release/checksum when implementation is
actually authorized; recheck current fixes then instead of freezing this version
indefinitely. Pin the installed toolset, disable runtime self-updates/component
downloads, and perform future upgrades as deliberate reviewed maintenance. The
release notes include an executable/update security fix, so do not base the
implementation on an old cached binary or auto-update it during a media job.

Use fixed arguments and structured progress; no arbitrary downloader options,
plugins, shell evaluation or browser-cookie extraction. Preserve
selected-quality source streams and merge automatically with FFmpeg. Best
available is the default; an explicit offered numeric tier is exact, with no
silent downgrade. The existing access/method decision still applies: upstream
documents that some formats may be unavailable without additional tokens, so no
universal per-video resolution guarantee is claimed.
[Format support](https://github.com/yt-dlp/yt-dlp#format-selection),
[access limitations](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#youtube).

No code, configuration, credentials, directories, downloaded media or installed
tools were changed for these recommendations. Current `FAKE_MODE=true` remains
key-free and synthetic. Future deterministic local edits/encoding and
saved-draft resume can be API-free; fresh actual AI needs keys, enabled flags
and applicable approvals. No approved local AI weights/runtime are available or
added here.

## Recommendation

Build a small, separately launched local owner workflow around the existing
TypeScript, React, contracts and Remotion code. Reuse deterministic processing
within each owning application. Keep the deployed visitor journey unchanged. Do
not adopt a general video editor or add a second chat UI. An authenticated local
command interface lets the agent in the existing chat make the same validated
changes as the owner UI.

The requested behavior is clear: keep a list of exact manual ranges alongside
independent AI discoveries; apply min/max duration settings only to discoveries;
select several moments and process all of them; review and adjust captions and
visuals; supply personal pictures; and support later agent-directed edits. These
are owner-requested planning requirements. Isolation topology, persistence,
numerical capacity and importer choice below remain proposed decisions. The
owner's later same-day clarifications make automated background YouTube
download, a user-selectable source resolution and retained downloads outside the
repo for reuse explicit requirements for this plan.

## What the repository currently supports

- `packages/contracts/src/constants.ts` defines public 10–60-second clips, zero
  to four candidates and one final render. The owner-validation profile has a
  larger source/render allowance, but still has a 10–60-second clip range. That
  profile is not an editor or multi-clip workflow.
- `apps/backend/src/analysis/analysis.prompt.ts` chooses word-grounded
  candidates from a validated transcript. `transcribed-analysis.provider.ts`
  separates source transcription from text-only selection. Duration preferences
  must reach reconciliation as well as the prompt.
- `packages/contracts/src/edit-plan.schema.ts` owns current fixed v2/v3 render
  contracts, including a selected-range validator tied to public limits.
  `composition-manifest.schema.ts` is the older v1 shape; do not extend only v1.
- `packages/composition/src/clip.composition.tsx` and `fixed-layers.tsx` share
  preview/render geometry. `apps/renderer/src/composition/render-worker.ts` uses
  a fixed bundle, normalized selected media, explicit Chromium and bounded
  rendering concurrency. This is reusable machinery, not a ready owner editor.
- `apps/backend/src/render/final-render.usecase.ts` cleans processing source
  before publishing an output. The current disposable renderer allowance covers
  prepare/select/preview/render, not several clips or repeated exports.
- Current actual-media processing uses the private Cloud Run renderer and
  temporary cloud storage, even when the browser/control API run locally. Local
  UI does not imply local compute or zero cloud cost.

Existing fake mode works without API keys and supplies synthetic workflow data;
the fixture journey does not deliver a real final MP4. Native synthetic
harnesses exist separately. Real automatic transcription, discovery,
speaker/visual plans and generated images need configured providers, enabled
flags and applicable rights/transfer/spend approvals; paid-flow acceptance
remains owner-only. No local AI model, approved weights or automatic offline
transcription pipeline is available or verified. Local deterministic
editing/encoding can be API-free without being an offline AI implementation.

## Minimal implementation shape

Prefer separate local entrypoints/build outputs in the existing owning apps,
outside their deployed source graphs: frontend owner UI, backend owner use cases
and CLI, renderer local worker/storage adapter. Finalize the build proof in
CL-017 before coding features. A hidden Next route or browser flag is
insufficient isolation. A separate workspace app is an alternative only if build
exclusion cannot be proved; it requires an explicit dependency/ownership
decision, never cross-app imports. No new app directory is approved by this
note.

Use one private source workspace with per-clip IDs, revisions, manifests,
assets, exports and an explicitly owned lifecycle. Recommend session-only
processing/draft storage for the first slice; optional reopenable editor drafts
need a scoped retention decision. Completed source downloads instead survive
close/restart under the owner's explicit Downloads/reuse requirement below. Do
not reuse diagnostic captures or restore the retired saved-sample replay.
Revisions support conflict detection and output identity, not an undo system.

Recommended initial sizing to evaluate: one source within the existing public
source envelope, up to ten owner ranges, four AI suggestions, ten selected
clips, and at most two active media jobs subject to a measured CPU/RAM/disk
budget. AI bounds initially span 10–60 seconds; consider a separate manual-range
safety envelope of 1–300 seconds. These numbers are proposals, not owner
requirements or verified capacities. Manual ranges must never inherit the AI
min/max or the public candidate overlap/ranking filter. Larger sources/4K
downloads require their own capacity result rather than silently raising shared
public constants.

## Editor and local rendering evidence

The existing Remotion Player can update composition content through React props.
Its documented mouse interaction supports positioning and resizing. This makes a
caption panel and picture selection/placement controls plausible without
adopting a timeline product. Use normalized geometry, numeric/keyboard
alternatives and a few bundled caption presets. Preview and export must consume
the same validated revision. [Player](https://www.remotion.dev/docs/player),
[interaction example](https://www.remotion.dev/docs/player/drag-and-drop).

Remotion's Node renderer provides MP4 rendering, cancellation and progress. Its
`concurrency` setting governs work within one render, so a two-clip scheduler
must also budget that internal work. Keep the pinned repository version;
documentation is evidence of capability, not compatibility verification or an
upgrade request. Local Chromium/FFmpeg/bundle readiness still needs a synthetic
proof on the owner's OS. [Node API](https://www.remotion.dev/docs/renderer),
[render options](https://www.remotion.dev/docs/renderer/render-media).

Accurate arbitrary cuts require decoding/re-encoding around the desired
boundaries; stream-copy seeks can retain material before the requested start.
Specify one source clock and an explicit 30fps output rounding rule. Test
variable frame rate, leading offsets and fractional seconds rather than
promising sample-exact arbitrary timestamp cuts.
[FFmpeg seeking documentation](https://www.ffmpeg.org/ffmpeg-all.html#Main-options).

Professional use also needs a license check against the pinned Remotion release,
bundled fonts and supplied images. Remotion documents a free tier for
individuals and qualifying small organizations and a company-license boundary;
do not infer the owner's eligibility or purchase anything.
[Remotion license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

## YouTube: what a pasted link can and cannot do

### Owner clarification and existing implementations — 2026-10-22

The owner wants to avoid downloading a file manually. The local app may download
the video/audio in the background as part of its normal flow. The required UX is
paste a YouTube link → inspect offered formats → choose a resolution or keep
Best available → Import → background download/merge/inspection → source-ready
for the same timestamp, AI-discovery and editing workflow. No external
downloader UI, browser Save as, manual merge or re-upload of the downloaded file
is required. This supersedes any interpretation of the first request as
transfer-free editing. Research and ticket updates remain the only authorized
work today.

There is concrete upstream evidence that this interaction is already implemented
elsewhere, not just a hypothetical integration:

| Existing project      | Primary-source evidence                                                                                                       | Relevance to ClipBuilder                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| MeTube                | Its maintained README describes a paste-link web UI, server downloads and per-download quality/format choices.                | A browser UI can delegate the download to the local backend.              |
| Open Video Downloader | Its project documentation describes a yt-dlp desktop UI with resolution, frame-rate and format choices, plus in-app progress. | Users can choose quality without running a downloader command themselves. |

[MeTube](https://github.com/alexta69/metube),
[Open Video Downloader](https://github.com/jely2002/youtube-dl-gui).

MeTube's actual `get_format` implementation maps the UI quality value to a
yt-dlp video selector and selects audio for merging. Its numeric quality acts as
a height ceiling. That is useful implementation evidence, but ClipBuilder's
explicit resolution choice needs stricter semantics than copying a ceiling that
might select a lower resolution. These projects are references, not dependencies
to install, services to deploy or code to copy without license review.
[MeTube format adapter](https://github.com/alexta69/metube/blob/master/app/dl_formats.py).

yt-dlp documents format enumeration and selecting specific offered format IDs,
plus resolution-based sorting and separate video/audio merging with FFmpeg.
Resolution sorting uses the smaller dimension, which also handles portrait
sources. Its preference/cap sorting can fall back, so an exact user choice needs
post-selection validation rather than relying on a preferred-height sort alone.
[Format enumeration/selection](https://github.com/yt-dlp/yt-dlp#format-selection),
[resolution sorting](https://github.com/yt-dlp/yt-dlp#sorting-formats).

The documented dependencies also matter: current YouTube extraction uses a
supported JavaScript runtime and matching EJS components. Plan reviewed/pinned
local prerequisites; do not enable remote component downloads or self-updates at
runtime. Upstream notes that some formats can require additional access tokens.
That limits the accessible list and must produce an unavailable-quality result,
not a promise that every playback quality can always be obtained.
[Runtime/EJS setup](https://github.com/yt-dlp/yt-dlp/wiki/EJS),
[extractor limitations](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#youtube).

Desk-research conclusion: the background-download and selectable-resolution
pattern is technically established. A thin local yt-dlp/FFmpeg adapter is the
recommended candidate. No real download, tool installation, source-specific
availability test or ClipBuilder compatibility proof has been performed.

### Proposed resolution and background-import behavior

- Default to Best available: the highest accessible source resolution, with an
  explicit documented tie-break policy for frame rate, codec and bitrate.
- Populate actual offered choices, for example 720p, 1080p, 1440p or 2160p/4K
  only when offered. Show dimensions/frame rate; do not fabricate missing tiers.
  Unsupported codecs or over-capacity choices show a reason rather than
  vanishing behind a lower default. Portrait tiers use the shorter edge and real
  dimensions.
- A selected numeric tier means that tier, not "up to" it. Bind the import to
  the inspected format selection and recheck actual downloaded video/audio. If
  the tier disappears, is inaccessible or needs unsupported processing, stop
  with a safe reason and let the owner explicitly choose another option. Never
  silently lower resolution, upscale, omit audio or change the selected tier.
- Download media streams automatically, merge without lossy re-encoding when
  compatible, then inspect locally and continue into the existing owner
  workflow. No manual download/upload step intervenes. Keep acquisition, merge
  and inspect progress separate, and cancel/remove partial work with the
  workspace lifecycle.
- Keep the acquired source at the selected quality. Small AI/preview proxies do
  not determine export source quality. Best available refers to YouTube's
  accessible rendition, not a recovered creator original. Final portrait output
  remains the separately specified 1080×1920 profile.

### Saved downloads and reuse — owner clarification 2026-10-22

The owner wants completed downloads kept on the machine so later clips/sessions
do not require downloading the same source again. Default destination is the
OS-resolved Downloads folder with `ClipBuilder/Sources` beneath it, outside the
repository, public assets and temporary processing workspace. Desktop or another
explicit local folder may be chosen instead. This is a future storage contract;
no folder or real source file is created during research.

Save the selected-quality source with neutral source-ID naming and a minimal
private sidecar recording source identity, selected format/resolution, size and
digest. Reusing it needs no saved transcript, provider response, stream URL or
account credential. An intact matching source is reused across clips, workspace
close and application restart with zero media download calls. Canonical URL
aliases map to the same saved source; a stale reference is validated against
actual bytes.

Show the saved local qualities first. A previously saved Best available choice
reflects acquisition-time availability; checking today's online list is an
explicit refresh, not a reason to redownload a matching file. Missing/moved/
damaged files and a newly requested resolution offer locate/validate or a new
explicit acquisition action. Successful sources survive cancel, clear, expiry
and repository cleanup until the owner explicitly deletes that saved source;
owned partial files and derived scratch remain disposable. This does not decide
persistent editor/transcript retention or restore the retired sample cache.

### Alternatives and remaining boundaries

| Approach                                        | Can avoid a manual file download?                                           | Can provide renderable best-quality source?                 | Planning verdict                                    |
| ----------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| Gemini YouTube URL input                        | Yes, for supported public-video analysis                                    | No documented editable source-file output                   | Optional discovery aid; not an importer             |
| YouTube IFrame Player                           | Yes, for playback and seeking                                               | No raw-media export interface                               | Reference playback only                             |
| Owner's original or creator-supplied master     | Usually already a file; an authorized direct-file transfer can be automated | Best available master if provided                           | Preferred quality path                              |
| YouTube Studio / Google Takeout for own uploads | Official export still requires transfer                                     | Studio is limited; Takeout format varies                    | Owner-controlled fallback                           |
| Local downloader such as yt-dlp                 | Can hide manual download/merge steps                                        | Best accessible platform rendition, not guaranteed original | Conditional technical option with access/terms gate |

Google documents direct public YouTube URL inputs for Gemini video
understanding. Its currently documented access limitations exclude private and
unlisted videos; the feature is preview and may change. This interface analyzes
content and does not supply the local renderer with a master. URL-derived timing
also cannot replace the pipeline's validated word clocks without a new grounding
check.
[Gemini video inputs](https://ai.google.dev/gemini-api/docs/video-understanding#youtube).

The IFrame API controls playback, volume and seeking; it is not a documented
source-byte API. Our conclusion that it cannot serve the fixed native render
pipeline follows from comparing that API with our renderer's required decoded
media input.
[YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference).

For own uploads, YouTube Help describes Studio MP4 downloads at 720p or 360p.
Google Takeout can export videos in their original format or H.264/AAC MP4;
archive preparation can take minutes to days. Neither is an immediate,
guaranteed-original-resolution URL-to-edit service.
[Studio download](https://support.google.com/youtube/answer/56100?hl=en),
[Takeout](https://support.google.com/accounts/answer/3024190?hl=en).

yt-dlp documents separate best-video/best-audio selection and FFmpeg merging,
time-section downloads, and slower re-encoding for accurate section boundaries.
That supports investigating automated local ingestion, but does not establish
source access, speed or compatibility here. Stream URL extraction still
transfers media; expiring URLs, separate streams, codec/HDR choices and
seekability make direct remote rendering less reproducible than a validated
local copy. No downloader was installed, invoked or tested.
[yt-dlp formats and sections](https://github.com/yt-dlp/yt-dlp#format-selection).

YouTube's terms restrict downloading and automated access except through the
stated permissions; API policies separately restrict audiovisual downloading and
storage. Owning or licensing a video's copyright does not itself establish that
a specific retrieval method is permitted. Record an authorized acquisition path
before any real retrieval. This is an engineering gate based on the published
terms, not a legal clearance conclusion.
[YouTube terms](https://www.youtube.com/static?template=terms),
[API policies](https://developers.google.com/youtube/terms/developer-policies#e.-handling-youtube-data-and-content).

Recommendation: implement the requested background-import/resolution flow in
CL-023 after the local runtime, acquisition method and capacity gates pass. The
file-based editor can proceed independently. An owner/creator master remains an
optional quality/access fallback; it does not fulfill this link-flow acceptance
by itself. Preserve the acquired master, derive small proxies for AI/preview,
and render from the high-quality selected source. Existing output remains
1080×1920/30fps; a higher-resolution input improves crop headroom but is not a
request for 4K output, upscaling or HDR export.

## Decision and evidence handoff

- CL-017 settles physical build exclusion, local compute and private retention.
- CL-018 owns exact manual ranges and independent AI duration behavior.
- CL-019 owns multi-clip lifecycle, concurrency and multiplied call budgets.
- CL-020 owns caption/picture controls and zero-AI manual revisions.
- CL-021 owns a bounded agent command interface to those same use cases.
- CL-022 records YouTube go/no-go; CL-023 implements only a cleared method.
- CL-024 verifies the combined offline workflow and deployment exclusion.

All eight packets remain planned. No provider/key access, installation, owner
media inspection, download, paid call, cloud change, app launch or Git mutation
was performed. Source review and public documentation establish a plan only.

## Planning coverage review — 2026-10-22

Reviewed all eight packets against the original request and both YouTube
clarifications. This is documentation coverage, not feature/runtime
verification. All implementation acceptance boxes remain open. The review made
local native media compute mandatory, separated saved-source lookup from online
format checks, made prepared-bundle edits independent of provider readiness,
required headless agent access, and prevented file-only acceptance from hiding
the YouTube gap.

| Owner requirement                                             | Owning packets         | Required evidence after implementation                                                                                                                                            |
| ------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Personal controls stay local and out of deployment            | CL-017, CL-024         | Separate entrypoints/build graphs, protected loopback, public artifact/route rejection and no hosted/cloud media fallback                                                         |
| Add several exact ranges before AI search                     | CL-018                 | Owner rows persist alongside independent AI suggestions, including overlaps, empty AI results and silent ranges                                                                   |
| Choose AI minimum/maximum, including exact 30/60 seconds      | CL-018                 | Equal AI bounds are valid; source/frame-clock checks enforce the policy without changing manual cuts                                                                              |
| Edit multiple selected clips from one source                  | CL-019, CL-024         | Three independent outputs, bounded parallel work, one source/transcript, per-clip cancellation and reusable inputs                                                                |
| Small post-edit caption/visual controls and personal pictures | CL-020                 | Caption style/position, picture add/replace/remove/placement, local image normalization and identical preview/export revision                                                     |
| Agent edits through the existing chat without using the UI    | CL-021                 | Same validated edit core from a protected local CLI, browser-closed operation, revision/conflict checks and no added editor model                                                 |
| Paste YouTube link and choose source resolution               | CL-022, CL-023         | Offered formats, Best available default, exact numeric tiers, automatic download/merge/inspection and no silent downgrade                                                         |
| Keep downloads in Downloads outside the repo                  | CL-017, CL-023         | OS known-folder resolution, optional chosen Desktop folder, neutral source files/private sidecars and no bytes in Git/build assets                                                |
| Download once and reuse later                                 | CL-019, CL-023, CL-024 | Complete saved source survives close/restart/expiry and processing failures; saved-source chooser/repeated URL works offline before any metadata request with zero download calls |
| Clear partial processing without losing saved inputs          | CL-017, CL-019, CL-023 | Separate saved-source and scratch ownership; no automatic source deletion, including failed sibling jobs; explicit targeted deletion only                                         |
| Keep AI/privacy/spend gates explicit                          | All packets            | Key-free synthetic tests and native deterministic checks are distinguished from owner-only live provider quality/rights/transfer/spend acceptance                                 |

The initial linked-source slice saves the complete conversation, so future
ranges do not need a second acquisition. Partial/time-section downloading
remains a researched alternative outside that first slice. Saved-media reuse
does not mean persisted AI analysis or editor drafts; that separate retention
choice remains open. A previously saved Best available label records
acquisition-time quality, not a fresh claim about today's online formats.

Remaining design decisions are physical isolation topology, local ports and
capacity/manual safety ceilings, persistent editor drafts, and the final
acquisition/tooling/access decision. Runtime, source rights, human visual/A/V
quality and real provider acceptance remain unverified. No new external research
or media experiment was needed for this consistency pass. A passing file-based
milestone must still list the gated link/resolution/reuse lane as incomplete
unless the owner explicitly changes that requirement later.
