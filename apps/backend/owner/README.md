# Local owner host

This independent owner runtime is excluded from public `src`, package outputs,
Next routes and Docker contexts. CL-017–020 deliver one source preview,
manual ranges alongside duration-controlled fake discovery, a bounded list of
automatic clip edits, caption/picture adjustments, opt-in saved drafts, private
loopback access and temporary workspace cleanup. CL-021 adds a protected local
agent CLI using the same edit/export coordinator. CL-023 adds synthetic linked
source import and durable offline source reuse. Default AI/acquisition are
simulated; native video processing is real. A separate provider entry is wired
for later owner activation, with injected-transport verification only. See the [source guide](SOURCE_ACQUISITION.md)
for exact quality choices, Downloads/Desktop storage and dormant real-tool gates.
The [local workflow guide](../../../docs/operations/LOCAL_OWNER_WORKFLOW.md)
connects source selection, manual/AI ranges, review, drafts and safe CLI edits;
CL-024 records combined evidence and measured limitations.

From the repository root, prepare the free Windows x64 FFmpeg 9.0.2 portable
tools once, then build:

```powershell
./scripts/owner-prepare-tools.ps1
corepack pnpm build:contracts
corepack pnpm owner:build
$env:FAKE_MODE = 'true'
$env:PAID_DEMO_ENABLED = 'false'
corepack pnpm owner:start
```

`PAID_DEMO_ENABLED=fake` is invalid; paid-off is exactly `false`. This entrypoint
does not read any env file. It rejects missing/conflicting operating settings,
missing or changed native tools, and occupied ports. Tool preparation is a
separate explicit download; startup and rendering never download executables.
The prepare script verifies the pinned archive checksum; startup verifies both
executable checksums. The portable tools remain ignored under `.owner-build`.
There is no global install or PATH change. Builds are
[published by Gyan](https://www.gyan.dev/ffmpeg/builds/), a Windows distributor
[linked by FFmpeg](https://ffmpeg.org/download.html), under GPLv3.

Automatic captions/pictures also require existing Chrome at
`C:/Program Files/Google/Chrome/Application/chrome.exe`. The worker opens a fresh
headless profile to rasterize the fixed local overlay. Startup checks that the
executable and built overlay exist; it never installs or downloads a browser.
See the [worker guide](../../renderer/owner/README.md) for that boundary.

Use `http://localhost:4100/`. The private worker binds only to
`127.0.0.1:4200`. Canonical visitor 3000/4000 services are independent. No ADC,
gcloud, API keys, cloud access, model weights or provider SDK composition is
needed for the default fake entry. Fake results do not establish AI quality.
Actual native encoding is local and API-free. The separate provider entry below
is not enabled by the fake command or an API key alone.

## Separate provider entry: owner activation pending

`corepack pnpm owner:start:provider` is a separate explicit launcher command.
No agent run, paid request or real-media acceptance is authorized by its
implementation. It requires process environment supplied manually by the owner:

- `FAKE_MODE=false`, `PAID_DEMO_ENABLED=true`, `APP_ENV=local` and
  `NODE_ENV=development`.
- `OWNER_PROVIDER_APPROVED=true`; absent/false remains closed. Test, preview and
  production modes cannot select this launcher.
- A manually supplied `GEMINI_API_KEY` and explicit `true` for
  `CLOUD_SPEND_APPROVED`, `GEMINI_TRANSFER_APPROVED`,
  `GEMINI_IMAGE_GENERATION_APPROVED` and `GEMINI_PAID_PROJECT_CONFIRMED`.

This command also reads no env file. It parses the selected provider inputs once
and uses the existing fixed Gemini model, timeout and zero-retry policy; model,
endpoint and timeout environment overrides are ignored. Invalid/conflicting mode
settings reject startup. With valid local provider mode but an incomplete key or
individual approval, the host exposes unavailable AI/planning capabilities and
dispatches nothing; it does not substitute synthetic results. Existing prepared
bundles can still be opened, edited and exported through native media work.

The provider host composes bounded local audio/video preparation, Gemini Files
transfer/transcription, independent selection, selected-clip planning and at most
three generated-picture attempts per clip. These adapters are exercised with
injected transports and synthetic inputs only. Real latency, model output,
deletion confirmation and human A/V quality remain owner acceptance items. No
offline AI model or weights are included.

The launcher passes only the explicit Gemini key/approval allowlist to this
host. Its native worker remains fake/paid-off and receives no provider key, ADC,
Google/Vertex endpoint settings, inherited proxy or Node options. The host does
not compose the public application, cloud renderer, sample reads, grants or a
YouTube downloader. Downloaded source reuse remains available; new YouTube
acquisition is unavailable in the provider entry until its independent tool and
source/method gates are completed. The protected capabilities response drives
the browser's current labels and fresh-action controls. Saved clip provenance
does not change when the current provider becomes unavailable.

## Runtime lifecycle and local media

The supervisor writes a private capability state and content-free process
identities/logs beneath an OS temporary runtime directory. It prints only the
URL and log directory. Never print or copy `state.json`; it contains private
per-run capabilities. Follow root AGENTS lifecycle rules for hidden background
launch, readiness and cleanup. Stop the supervisor gracefully with Ctrl+C; it
drains host/worker operations before removing owned processing copies. A failed
cleanup reports recovery required instead of authorizing a new launch.
Provider-host shutdown allows a fixed 75-second graceful drain for bounded
request/remote-file cleanup; fake hosts and native workers retain 15 seconds.
If grace expires, the supervisor awaits verified forced cleanup of the owned
process tree before removing scratch or capabilities. This bound has not been
exercised with an active paid request.

Sources are limited to supported SDR MP4 codecs, 60 minutes, 10 GiB, 4K/60fps;
one source and one heavy operation are admitted. Up to ten selected clips share
that source and analysis. Native work runs serially; selecting several clips
does not start simultaneous encodes. Whole-action scratch admission reserves
384 MiB per normalized clip/output and 2 GiB for overlay frames within a 20 GiB
ceiling, preserving another 10 GiB free. Batch exports are H.264/AAC,
1080×1920/30fps, capped at their 384 MiB reservation and the general 1 GiB output
limit. Native validation rejects HDR/high-bit-depth inputs and
malformed/oversized sources. The workspace expires after two hours; active work
defers expiry. Clear and shutdown drain owned work and streams before removing
only owned OS-temp copies. Saved source masters, retained demo assets,
diagnostic captures, private logs, drafts and exports are never scratch cleanup
targets. Explicit source Import publishes a reusable master/sidecar; a first
Save draft retains its own source, draft and exports as described below.
Ordinary upload and session-only editing create no persistent library.
Browser downloads are explicit and remain outside workspace cleanup.

The authenticated local API accepts `POST /api/workspace/{id}/analysis` with
source/policy revisions, at most ten `{id,startMs,endMs}` rows, an independent
`aiDuration:{minMs,maxMs}` and explicit `manualOnly`. Endpoints are integer
milliseconds and `[start,end)`. Manual ranges last 1–300 seconds; AI limits are
10–60 seconds, including equal bounds containing a 30fps duration. Invalid,
out-of-source or stale revisions dispatch no AI/native work. An explicit run
transcribes once, then selects at most once (skipped for manual-only, no words,
or insufficient source duration). Matching AI/manual cuts link evidence without
consuming one of four additional suggestion slots. No automatic retries.

`GET /api/workspace/{id}/analysis` restores the last completed in-memory result
without AI work. This is running-session state, not a diagnostic capture reader
or durable replay. The original single-cut `POST /api/workspace/{id}/portrait`
remains available for focused range checks. The worker receives a bounded frame
range plus source fingerprint, never arbitrary paths. Exact 30/60-second cuts
contain 900/1,800 frames. Public payloads and default 10–60-second candidate
reconciliation are unchanged.

`POST /api/workspace/{id}/clips` accepts `operationId`, `analysisId`,
`sourceRevision`, `policyRevision` and one to ten distinct `momentIds` from the
completed analysis. Each stable clip ID owns its immutable automatic base,
validated words/cut, asset references, edit revision and separate output
revisions. A separate version-1 edit document records applied presentation
changes over the immutable base. Admission checks the entire selection and
disk upper bound before starting any work. At most one simulated plan and three simulated picture
attempts are allowed per distinct clip; source transcription/discovery are
reused. The current fake planner creates one colored placeholder when cues
exist, with no real AI calls. There are no automatic retries.

The shared domain is provider-neutral: explicit `mode` metadata distinguishes
synthetic/provider results and unavailable analysis, while `calls` records
bounded attempts. Planner inputs include the admitted workspace/source, clip
ID and actual timed moment; picture inputs contain a bounded contextual brief,
evidence word IDs and the clip's words. Invalid/out-of-window evidence and mode
or provenance mismatches fail before downstream work. Returned raster bytes
are independently decoded, oriented, metadata-stripped and normalized with the
existing bounded picture primitive; metadata claims do not set saved geometry.
Synthetic/generated/owner-supplied provenance stays distinct. Provider-shaped
test doubles verify these paths without egress; they do not enable providers.
Actual owner provider adapters/local provider-input preparation still need
composition before real-mode activation. Flags/keys alone are insufficient.

`GET /api/workspace/{id}/clips` reads progress and completed bundles without
dispatch. Matching operation IDs/payloads are idempotent; conflicting payloads
or stale revisions are rejected. A new explicit selection action may resume a
canceled clip that never started preparation, without repeating completed
siblings. A started failure is not silently retried. The in-memory work list
admits at most 200 explicit operations and 20 output revisions per clip.

Use `POST /api/workspace/{id}/clips/{clipId}/cancel` for one clip or
`POST /api/workspace/{id}/clips/cancel` for all pending clips. Queued cancellation
dispatches nothing. Running cancellation remains `canceling` until the worker
drains. A failed/canceled attempt leaves the source, sibling bundles and earlier
validated outputs usable. Workspace clear is unavailable during active work;
shutdown cancels and drains it.

`POST /api/workspace/{id}/clips/{clipId}/render` accepts a fresh `operationId`
and the current `expectedRevision` for an explicit local re-export. It freezes
the compiled overlay and edit revision at admission and reuses the immutable
base and normalized selected material with zero AI calls. Later edits can be
acknowledged while that snapshot renders. Output files have distinct revisions
and record the edit revision they contain; earlier exports are not overwritten
and remain visibly older when the draft changes.
`GET /api/workspace/{id}/clips/{clipId}/output/{revision}` downloads a published
revision. The clip's `/source` route and workspace `/assets/{assetId}` route
serve only admitted material for review. Completed clips remain reviewable
while the next clip runs. Reloading restores the running session without
submitting another processing action. Unsaved session bundles do not survive
an app restart; explicitly saved drafts can be reopened.

## Caption and picture edits

`POST /api/workspace/{id}/clips/{clipId}/edit` accepts `operationId`,
`expectedRevision`, `baseHash` and one to ten allowlisted operations:
`caption`, `visual-upsert`, `visual-remove` or `reset` for a caption/picture
panel. Writes serialize with other clip mutations; a stale edit revision
returns 409. Matching operation IDs are idempotent. A valid edit advances only
that clip's revision, validates the complete overlay, and starts no AI or
render. The public v2/v3 manifest formats and fixed public composition remain
unchanged; owner edit/overlay documents cannot enter the public renderer.

Caption settings use three bundled Arial presets, requested size 32–80px,
six-digit text/highlight colors, left/center/right alignment and a normalized
box. The box stays inside a 5% safe inset, occupies at least 60% of portrait
width, and must fit two requested-size lines vertically. The shared caption
tree may reduce the actual font size to fit the existing fixed caption lines;
it retains timed words, line breaks and highlight clocks. Pictures use at most
three timed cues per clip, normalized in-canvas geometry and contain/cover fit.
Pictures draw in cue order below captions. No caption rewriting, arbitrary
fonts/CSS, keyframes, B-roll or audio editing is accepted.

`POST /api/workspace/{id}/clips/{clipId}/picture` receives JPEG/PNG bytes with
an exact content length, at most 4 MiB and 16 million decoded pixels. Byte
signatures, PNG framing and a single raster page are checked independently of
the MIME declaration. Animated, malformed and unsupported inputs are rejected.
The decoder applies orientation, removes metadata, flattens transparency onto
the dark canvas and emits a canonical JPEG no larger than 1920px per side and
3 MiB. Each clip admits at most 20 immutable assets, deduplicating identical
owner-supplied pictures. Upload registers an asset; an explicit edit operation
chooses its cue. Asset IDs and hashes are the only renderer references.
Owner-supplied provenance replaces any generated/synthetic claim, and the owner
must have permission to use the picture. Superseded assets remain available to
the immutable base, in-flight snapshots and saved recovery copy.

The local preview provides numeric controls, layer selection, drag/resize and
keyboard equivalents. Apply acknowledges a revision; typing or dragging an
unapplied form is not durable. Reset affects only the chosen panel. Preview,
seeking, picture import, applied edits and explicit native re-export of a valid
prepared bundle require no provider keys or live AI capabilities.

## Private saved drafts

The launcher resolves the Windows Downloads known folder from its specific
User Shell Folders registry value; it does not read ignored env files. A
redirected Downloads folder is respected. Failure leaves draft routes
unavailable instead of choosing a fallback directory. Resolution/listing makes
no library directories. The first explicit Save, allowed while native work is
idle, creates separate local areas:

| Area | Ownership and retention |
| --- | --- |
| `Downloads/ClipBuilder/Sources` | One hash-named source master, verified and reused by later saves/drafts. |
| `Downloads/ClipBuilder/Drafts/{id}` | Versioned private document, one last-good backup, canonical pictures and available normalized cuts. |
| `Downloads/ClipBuilder/Exports` | Immutable completed exports, independent of the draft directory. |

The storage root must stay outside the repository and cannot traverse a
symlink/junction. Fixed UUID/hash filenames are derived internally; neither the
API nor saved document admits arbitrary paths or URLs. A version-1 snapshot
contains admitted source metadata, validated transcript/candidates/ranges and
duration settings when analysis exists, clip bases, applied edits, asset
metadata, output revisions and bounded call counts. The private record adds a
fixed inventory of byte counts/hashes, capped at 32 MiB. It contains no raw
provider response, authentication, capabilities, credentials or environment
values. Up to 200 drafts are listed; none expires automatically.

| Authenticated route | Behavior |
| --- | --- |
| `GET /api/workspace/{id}/draft` | Read `session-only`, `saving`, `saved` or `unsaved`, plus the last completed save time. |
| `POST /api/workspace/{id}/draft` | Explicit first Save or retry/save-now for the same bound draft. |
| `GET /api/drafts` | List validated document summaries without reading all source media. |
| `POST /api/drafts/{draftId}/open` | Require an empty processing workspace; verify stored bytes and restore into new owned scratch. |
| `DELETE /api/drafts/{draftId}` | Drain its readers/writer and remove only that draft's directory; preserve source masters and saved exports. |

After opt-in, acknowledged analysis/clip/edit changes debounce for 500ms into a
single writer. A newer change during an earlier save remains `unsaved` until
its own snapshot commits. Media is stream-hashed/copied; unchanged immutable
files reuse their verified file identity during this process, so a caption
change does not reread a 10 GiB source. Opening/restarting validates hashes
afresh. Disk admission reserves bounded new writes and preserves 10 GiB free.
Existing damaged masters or immutable exports are rejected, never overwritten.

JSON writes sync a private temporary file before atomic replacement. A failed
save keeps the last good document, ID and timestamp and reports `unsaved`;
explicit retry remains available. Opening tries the current record and then
the fully validated last-good backup. Recovery references retain their picture
and cut files. Missing/changed required source, picture or published output
blocks reopening, without downloading or rerunning AI. An absent unpublished
normalized cut is allowed: a later explicit native export can rebuild it from
the retained source. Load failure removes only the new processing workspace.

Opening retains stable clip/base/edit/output identities, remaps the workspace
ID, and marks interrupted queued/preparing/rendering work canceled. It never
replays provider or native jobs. If automatic provider ports are unavailable,
the restored workspace reports that limitation while valid prepared bundles
remain editable and explicitly exportable with zero AI calls.

Clear flushes opted-in changes first. If durability fails, clear returns 409;
the owner can retry Save or explicitly request `discardUnsaved:true` to discard
only the unsaved session. Expiry defers removal after a failed save. Shutdown
cancels/drains large outstanding storage operations, flushes an existing bound
draft's latest acknowledged state, and clears timers/owned scratch; it does not
retry an unsuccessful first bulk save. These paths preserve every previously
saved master/export/draft and private log. This is local file retention with no
app cloud sync, not the retired diagnostic replay feature.

## Local agent access

The [agent command guide](AGENT_COMMANDS.md) documents `corepack pnpm owner:agent`,
which reads one strict JSON command from stdin. It works with the private host
running and the browser closed. Commands inspect safe status, validate/apply an
edit, import one explicitly chosen local picture, render/cancel or save/reopen
a draft. No command starts AI moment discovery, transcription, image generation
or cloud processing. Real private frame inspection remains outside this interface.

`GET /api/agent/status` returns workspace/clip identities, revisions, safe
layout/asset metadata, counts and output status. A singular
`GET /api/agent/workspace/{id}/clips/{clipId}` inspects that clip. The same
singular path accepts `POST` suffixes `/validate`, `/edit`, `/picture`,
`/render` and `/cancel`. These are allowlisted protected routes, with the same
Host/Origin and per-run capability checks as the browser. They return safe
projections, never dialogue, caption words, source filenames/paths,
capabilities, provider payloads or full edit documents. Agent routes cannot
serve media or run the normal analysis/batch APIs.

Validation compiles a proposed overlay hash and safe layout without changing
the revision, saving or rendering. Apply and export use the browser's existing
contracts and serialized clip use cases. Expected revisions reject stale
UI/CLI writes; matching acknowledged operation IDs do not repeat writes or
rendering. The host owns all mutations; the CLI never rewrites live JSON.
An applied CLI revision becomes visible through the browser's normal polling;
unapplied local controls require an explicit reload after a revision conflict.

Discovery reads a fixed private `clipbuilder-owner-active.json` under the OS
temporary directory. Its bounded metadata contains only a runtime basename,
supervisor identity and publication time. The CLI internally checks the
confined non-link runtime/state files, exact current supervisor/child identities
and a maximum six-hour age before using the capability for fixed localhost
port 4100. There is no capability/runtime-path argument, environment-file
override or arbitrary host. The launcher publishes discovery after both
listeners are ready and their stable process ledger exists, then withdraws only
its matching record before draining shutdown. Closed, expired or replaced
identities fail safely before picture access or native work.

CLI execution needs no API keys or ADC and can edit prepared bundles in any
host capability mode. Its allowlisted commands expose no fresh AI action.
Manual editing and native export remain API-free even when the original AI
provider is unavailable. The separate provider host composition
requires its complete explicit activation inputs and applicable owner approvals;
it has not been activated or tested with real requests. No offline AI
model/weights are included. These interface descriptions do not establish
manual UI acceptance or real-media quality.

## Verification

Focused offline checks, with shared pre-import fake/paid-off environment and
external-network interception:

```text
corepack pnpm owner:test
corepack pnpm owner:typecheck
corepack pnpm owner:build
corepack pnpm owner:proof
corepack pnpm build
corepack pnpm owner:artifacts
```

`owner:proof` is opt-in and uses generated color/tone/silence video, never retained
or owner media. Build first: the multi-clip proof needs the fixed overlay bundle,
existing Chrome and pinned native tools. It checks exact frames,
fractional/source endpoints, VFR and nonzero video/audio offsets, pixel
transitions, silent audio, three isolated clip bundles and deterministic
re-export. Focused owner checks also cover applied revisions, image safety,
atomic draft recovery, immutable retention and cancellation without external
calls. The native proof really encodes, probes and decodes local MP4s, then
drains owned children/listeners and deletes its temporary files. The required
general gates are in root AGENTS. Human real-media/visual quality and later external compatibility
remain in CL-025; these checks do not establish real caption readability,
picture crop or A/V acceptance. No agent-paid or real YouTube test is
authorized. Fake mode needs no API keys. Provider composition and local input
preparation are implemented and checked with injected transports; real
automatic analysis/planning still requires explicit owner activation, its key
and every applicable approval. No offline AI model/weights are included.
