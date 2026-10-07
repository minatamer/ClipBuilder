# ClipBuilder backend

Security controls (CL-012, 2026-10-07): both grant routes require a separate
`session-start` Turnstile proof bound to a fresh browser nonce before consuming
the existing three-grants/five-minute window. Pending verification is bounded
at two requests with a five-second deadline; later proofs remain session/action
bound. Paid actions and provider/media dispatch counts are unchanged.

Preview, final-result restore, output playback and download share one fixed
per-session delivery allowance: 2 GiB of reserved content, 1,024 content requests
and 64 metadata lookups. Exact Range bytes are claimed before private I/O;
failed/uncertain attempts remain consumed and reopening never refills allowance.
Records expire with the grant and are bounded at 64. Seeking, refresh and repeat
downloads remain supported; session/expiry checks run again before headers and
chunks. Existing retained-master read controls and one-time processing-copy
ownership are unchanged. All private diagnostics remain; visitors receive only
generic source-controlled errors. Fake/no-key checks use injected ports; actual
Turnstile/playback/native/paid acceptance stays owner-manual. Public HTTP traffic
protection and dashboard verification remain paused/separately gated.

CL-009 selected assembly now uses the same JSON-only generation transport as
candidate selection. Its canonical schema is prompt guidance, rather than a
GenerateContent response-schema parameter; local plan compilation still owns
acceptance. This targets the owner's HTTP 400 after successful video upload.
Google did not name the rejected field, so live acceptance requires the owner's
next manual paid test. See [the request/diagnostics follow-up](../../docs/tickets/CL-009-assembly-request-and-diagnostics.md).

Candidate decoding (CL-007, 2026-10-05): Flash JSON-only selection explicitly
requests `{ "candidates": [...] }`; decoding accepts both that object and a
top-level array. Existing per-item tolerance and candidate bounds remain. Normal
request logs distinguish JSON decoding failure, unsupported shape, model-empty
output and all-dropped output, with returned/considered/accepted/dropped counts,
static drop reasons and adjustment count. Full raw/normalized private capture
remains intact. Fake/no-key tests verify both formats without provider calls;
real output quality remains the owner's manual live UI test.

Renderer diagnostics (CL-007, 2026-10-05): every private media call emits a
request-correlated `renderer_request` record with operation, one attempt, elapsed
time, upstream HTTP status, safe renderer code/sub-stage, response byte count and
completeness. Authorization, transport, body/size, JSON, schema, cancellation and
timeout failures remain distinct; schema issues retain bounded known field paths.
The same details accompany the failed owning phase. Raw bodies, auth headers,
URLs/resource/account IDs and exception messages never enter normal logs.
Budget, busy, expiry, cleanup and availability map to their actual generic UI
categories instead of model rejection. Full private Gemini capture is unchanged.
Request correlation also covers preview/output/download streams and session exit;
post-header stream failures are logged before the connection is closed. Stream
handoff records mark headers received with `responseComplete=false`; they do not
claim the full browser transfer completed. Local hot reload/readiness is verified.
Fake/no-key injected tests exercise these failures without cloud calls. Real
provider quality remains an owner-run test with keys/live flags and approvals.

**Session Exit (CL-007 owner decision, 2026-10-04):** same-origin
`POST /v1/session/exit` expires application cookies and returns 204 independently
of cleanup. It is composed even when paid analysis is disabled. A valid session
cancels actions and revokes the grant before bounded provider/renderer deletion
settles; stale/missing cookies still exit, with independent expiry for old copies.
The browser never receives a deletion-failure recovery requirement. This response
is access reset, not deletion evidence. Default fake/no-key tests use only injected
ports; real deletion remains an owner-run check requiring configured storage/provider
access and recorded approvals.

Analysis failures preserve the primary safe code/rule even when provider,
proxy or source cleanup also fails. Cleanup has separate bounded diagnostics;
successful generation with failed cleanup still rejects publication as
`CLEANUP_PENDING`. Deletion obligations and consumed-action fences remain.
The safe application HTTP status does not establish the upstream status.
See [CL-007's local fix evidence](../../docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md#local-implementation-and-validation--2026-10-05).
Fake/no-key regressions prove these response and call-count boundaries; actual
provider diagnosis, AI quality and deletion remain owner-run checks with live
credentials, enabled capabilities and approvals.


CL-016 adds a fixed, generation-pinned retained-sample read using server ADC.
`GET /v1/retained-sample/video` exists only after explicit retained-read enablement,
local real-media composition and approved cloud spend; it requires the fixed
frontend origin, same-origin transport and a valid byte range. It reuses exact
MIME/length/range streaming checks and has bounded work/rate/deadline limits.
Its read-only port has no master-delete capability and is separate from renderer
visitor cleanup. Public config exposes availability only. Defaults/tests disable
it and cannot obtain ADC or call storage. Preview needs no Gemini key; analysis
and rendering retain their separate approvals and feature gates.
`POST /v1/analysis/sample` accepts only rights/transfer acknowledgements and the
challenge token. After the existing processing grant, it fingerprints the fixed
master and copies bounded server chunks through the renderer's existing temporary
upload capability, returning only the disposable object's generation. Renderer
inspection/proxy preparation and Gemini run in the normal analysis action.
This path needs all analysis gates; preview selection cannot allocate that copy.
See [retained sample setup](../../docs/operations/RETAINED_SAMPLE_SETUP.md) for
blank owner configuration, the required private bucket policy and actual ADC/
upload checkpoint. Local synthetic checks do not prove that cloud setup.

CL-012 adds locally tested privacy headers, strict request/stream bounds and
canonical private caller-purpose routes. Browser documents use fresh CSP nonces;
Trusted Types remains report-only pending real compatibility checks. Storage
policy and cleanup controls are code-tested, not proof of saved cloud settings.
See [current safeguard evidence](../../docs/operations/SECURITY_PRIVACY_CONTROLS.md).

CL-011 connects explicit final export, receipt-checked output Range playback and
attachment download. It deletes server source/proxies before publication success;
output expires after ten minutes or at session expiry. Clear drains owned work and
streams. Completed-output restore and download retries dispatch zero new jobs/AI.
See [fixed output profile](../../docs/operations/RENDER_PROFILE.md).
With `FAKE_MODE=true` and no keys, fixture UI cannot download; injected synthetic
ports prove lifecycle and rejection behavior, not a real MP4. Real source/assembly
and final rendering require keys and enabled real paid processing,
paid/data/rights gates and independent private cloud/compute approval. Actual
native pixels/audio/performance, devices, rights/licenses and rollout remain
unchecked; no local AI model or weights are used.


## CL-010 selected preview access

Assembly success includes a separate physically trimmed 20fps preview proxy
after the Google proxy is deleted. Preparation binds its source generation,
selected range and frozen manifest hash. `POST /v1/analysis/preview` verifies the
signed assembly and reopens existing metadata; `GET` streams a validated byte
range under the protected session cookie. No media, provider or final-render
dispatch occurs on refresh/playback. Only bounded expiring references live in
control memory. Browser refresh reopens existing media; a lost control epoch
fails closed, with independent renderer expiry retaining cleanup responsibility.
Clear removes access and stops streams.

The public assembly flag derives from this composed path. Default fake/off
composition exposes the synthetic journey and cannot contact cloud/AI or
produce a real MP4. Injected tests verify access, exact call counts, bounded
streaming and cleanup without keys. Actual clocks, playback, audio and
preview/final parity need deferred rights, cloud, AI and device gates. No local
AI model or new provider dependency is used.

## CL-009 fixed selected assembly — local implementation

The 2026-10-06 owner correction makes AI-output critiques nonfatal. Original
words/clocks remain intact, including instantaneous words whose highlight cue
has no duration. Unrepresentable caption display groups are omitted with a safe
warning; literal long words use existing font fitting. Planner cards and speaker
evidence are reconciled independently; keep usable sections, skip unusable cards,
and use safe framing when needed. A missing picture
logs a warning and permits preview. Malformed/unfinished selected JSON produces
the same bounded local fallback after provider-file cleanup, with no retry.
Content-free diagnostics include `qualityWarnings`, `captionOmittedWords` and
`captionZeroDurationCues`. Existing source/receipt/hash authentication, media
resource limits, transport/cancellation and cleanup remain enforced. Fake/no-key
tests exercise these paths; real AI/media quality remains the owner's manual test.

Temporary owner-local sample replay (updated 2026-10-06): explicit development/local/live
composition with enabled assembly may load one workspace/source-bound validated
analysis from OS-temp `clipbuilder-runtime/private-sample-replay/sample.json`.
There is no replay activation deadline; keep it until explicit cleanup before
deployment. Corrupt metadata/source changes disable it. Fake/test/preview/
production cannot read the cache. Saved options cause zero media/AI dispatches;
manual Proceed uses normal protected grant/sample upload/challenges, physical
inspection, cleanup and current-epoch signing with zero Transcribe/selection
calls. Normal assembly receipt verification and selected-video AI remain.
Replayed analysis has full private capture and safe count/zero-call diagnostics;
retained playback errors now log request-correlated HTTP/code details. Existing
raw Gemini logs/captures remain. See the
[temporary packet](../../docs/tickets/CL-007-local-sample-replay-and-thumbnails.md).
Fake/no-key tests use synthetic injected data; real assembly is owner-run.

Earlier owner local enablement (2026-10-05) exposed Proceed and selected preview
while holding final rendering at the assembly stage. The later fixed-export
instruction supersedes that hold; see Configuration and secrets below.
During the earlier enablement, only the stage changed; existing operating switches,
credentials, metadata and approvals were preserved. Verified backend restart
changes its session epoch: start over and run fresh Find moments before Proceed.
Readiness/config and armed full-output capture are verified without a processing
request. Real assembly success/quality remains the owner's manual UI test; the
fake/no-key suite proves bounded local orchestration, not provider acceptance.

`src/assembly/selected-assembly.usecase.ts` consumes a verified CL-007 source result
and one immutable candidate. It reserves `visual-plan` once, requests a physical
selected proxy, obtains one combined speaker/picture plan and signs the frozen
word-grounded manifest/source generation/hash. `POST /v1/analysis/assemble`
uses the protected session/CSRF path and bounded signed analysis context.
The Google adapter reuses the source adapter's Files lifecycle with explicit
5fps sampling. Source AI reruns, repair and paid search calls are zero. Uncertain or
replayed actions never dispatch again. Release failure prevents publication.
CL-009 extends that same call for grounded picture subjects and fixed captions.
Up to three backend-only Commons lookups each make at most one metadata search
and one raster download, without credentials or retries. Only public-domain/CC0
JPEG/PNG/WebP results from fixed Commons hosts qualify; bounded Sharp decoding
normalizes them to at most 96 KiB JPEGs. Signed inline bytes and provenance follow
the existing session lifecycle. Missing images warn without aborting. Automatic
text-excerpt fallback is removed; retained legacy cards are compact overlays.
The owner-approved Commons-first fallback searches essential concepts and ranks
with the full contextual brief. A completed empty Commons response is a normal
miss. When retrieval has no usable distinct image, a separately enabled
`gemini-3.1-flash-image` adapter generates one generic illustrative scene, without
search tools or reference media. One attempt per validated visual, maximum three
per assembly, no retry. Each attempt reserves the running assembly's image and
process allowance before dispatch; failures remain consumed. Fixed 1K/16:9
output, 4,096 output-token cap, 60-second per-call deadline, 6 MiB response and
4 MiB decoded raster bounds precede the existing pixel/JPEG normalization.
Generated assets have explicit model/policy provenance, never a Commons page ID
or CC0 claim. All pictures use the same overlay/timing/signature path; image
failures warn and preserve the edit. Safe logs distinguish searches, generated
attempts, retained sources, HTTP status and bytes. Generated bytes/prompts are
excluded from private output captures as well as ordinary logs.

Generation approval defaults on under the 2026-10-06 owner configuration decision.
`GEMINI_IMAGE_GENERATION_APPROVED=false` disables it independently;
`PAID_DEMO_ENABLED=false` forces all four approvals and live capabilities off.
Real generation requires live assembly, the existing paid/transfer/project
prerequisites and backend `GEMINI_API_KEY`; no extra key is required. The derived live-image flag
cannot be enabled with an environment override. Fake/test/preview/production
composition remains unable to dispatch. Enabling images reserves a process
allowance of seven, rather than four with images disabled.
These are bounded action/image attempts, not a monthly dollar ledger. Successful
final export requires a private renderer with the matching generated provenance
schema. No cloud rollout is included. Fake/no-key tests prove local orchestration; actual generation quality,
access, cost and latency remain owner-manual.

The later owner revision asks Gemini for a contextual scene brief, descriptive
query and required/excluded concepts, then ranks up to eight candidates using
title/description/category metadata. Logos/title screens, undersized images and
missing required concepts are rejected; license checks still apply. The latest
instruction uses general editorial rules without topic/age examples: interpret
the whole conversation, find distinct visual opportunities, and choose creative
generic scenes with broad searches. Exact depicted entities/ages are unnecessary;
generic people can illustrate supported activities/relationships without
inferring source identity or traits. Plan two to three distinct pictures, each
held for 2–4.5 seconds according to the relevant thought. Word-anchored pictures
use supporting phrases of at most 24 supplied words. The compiler moves a later
anchor to the phrase's first word and caps its display at 4.5 seconds. The full
phrase supplies context; only a contiguous prefix of complete supporting words
inside the display is signed. Clip-end clamping must preserve that excerpt and
the two-second minimum. Gemini is
told that viewers see one picture at a time and to space anchors by the full hold,
combining close ideas or choosing a later beat. Impossible windows warn without
aborting usable editing or repeating the paid plan. Pictures
can be adjacent without group IDs or a blank gap, within the existing three-cue/
45-percent coverage cap and no overlaps. A next anchor can trim a hold only when
readability and a complete grounded excerpt remain. Repeated images cannot count twice.
Diagnostics separate proposed/validated/retimed/retained counts, searches and candidate,
relevance/size and rights rejections. Fewer than two retained pictures warns and
preserves the edit, with no automatic paid retry. Metadata ranking
is not a guarantee of human-approved pixel relevance or image availability.
The full supporting phrase need not remain entirely onscreen; the signed
manifest retains a contiguous in-window excerpt within its seven-word bound.
This preserves the picture wire format and avoids a new renderer rollout
requirement for timing normalization. Actual final rendering remains owner-tested.
The signed assembly control result also retains one bounded scene description
per accepted picture for review notes. Descriptions follow actual retained
anchors; unavailable pictures get no note. This optional metadata remains outside
the renderer manifest and safe logs, uses the existing planning response and
does not add a model call. Earlier results without it remain valid.
The browser stores a complete
hash-checked result or uncertainty. CL-010 connects Proceed/Player/read-only
review; CL-011 owns MP4 delivery.

Fake/injected plans verify anonymous word association, confidence, provisional
framing, hard cuts, generic pictures, holds and count warnings without keys/network.
Real speaker and creative picture quality need
keys/live flags, rights/data/paid approval and the separately deferred renderer
rollout. No local AI model is used. Live assembly requires protected source
analysis and at least three admitted actions; this is a process count, not a
provider/cloud billing cap. See [CL-009 evidence](../../docs/tickets/CL-009-build-contextual-visual-assembly.md).

The 1000ms switch hold counts the union of voiced transcript time in each
unambiguous speaker turn. A bad word reference is filtered from its observation
with a safe warning rather than discarding valid tracking. Within a shot,
pauses/uncertainty retain the most recent confirmed face crop without an expiry;
real cuts and confirmed absence reset it. Tight face boxes determine portrait
zoom. Provider subdivision does not shorten a sustained turn, and the fixed
public geometry limit remains. Synthetic injected lookups prove integration
without network; actual picture availability and real face quality are separate
from fake/no-key tests.
Each shot starts provisionally on a first-frame visible face, or an explicit
default portrait region if no such observation exists; it claims no speaking
identity. Confirmed changes cut immediately, with no crop tween. An offscreen
speaker while another person remains visible holds the existing crop; only
confident zero-person absence resets it. Saved legacy motion fields never make
the shared composition pan. Real Gemini quality still requires the owner-run
live flow and its keys, flags and approvals.

```text
corepack pnpm --filter @clipbuilder/backend test:unit src/assembly
```

## Current Transcribe migration — local implementation

The new backend requires the matching renderer audio profile/endpoint; the old
private renderer revision cannot serve it. The matching owner-approved image is
now deployed, with Linux/audio/runtime proof, unchanged private settings/IAM and
the new audio route verified without media dispatch. The owner paid UI quality
test remains open; see the [current handoff](../../docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md#approved-private-deployment-and-final-handoff--2026-10-05).
Fake/no-key checks use synthetic providers and verify code only.
Complete accepted provider responses, actual timestamps, normalized results and
adjustments are captured in the existing owner-local OS-temp JSONL when its
six-hour permit is armed. Capture includes Transcribe, Flash selection and the
separate `/v1/analysis/assemble` selected-video task. The 4 MiB response limit is
unchanged; incomplete/oversized responses explicitly record `complete:false`.
Existing evidence is preserved; credentials/request auth never enter capture.

## CL-007 protected source analysis — local implementation

`/v1/analysis/{grant,session,upload,run,clear}` connects protected local admission,
private upload, one Gemini 3.5 Transcribe audio call and one Gemini 3.8 Flash
text-only candidate call. Live execution remains gated by
the [controlled-check plan](../../docs/operations/GROUNDED_ANALYSIS_CHECK.md).
Public/hosted paid composition remains rejected. `FAKE_MODE=true` with no keys
keeps the fixture journey and injected zero-network tests; it proves no AI quality.
Real processing needs keys/live flags, rights/transfer/paid-project approval,
Turnstile, grant signing, ADC and separate cloud/AI spend permission.

Two atomic actions are reserved: the legacy `transcription` nonce now owns upload
admission; `candidate-analysis` owns audio preparation and the sequential transcription/
selection calls. No decodable words or unresolved file cleanup prevents the
selection call. There is no automatic paid retry. Origin/CSRF/epoch/expiry/rate/capacity precede dispatch. The dedicated
bridge is fixed at localhost:3000 to loopback:4000. HTTP is accepted only on that
loopback local origin; cookies retain Secure/HttpOnly/host-only attributes. No
proxy-header trust. Turnstile checks exact hostname/action/session cdata once.

Files uses bounded REST start/finalize and verified delete/absence because the
pinned SDK uploader has independent retries and incomplete abort propagation.
Transcribe uses bounded Interactions REST with `store:false`, `background:false`,
`stream:false`, English hint, verbatim mode, word timestamps and diarization.
The same key serves both models. Flash candidate input contains only decoded
word IDs/times/text and turns. The backend derives anonymous labels/complete turns,
cut times and extractive quotations. The separate selected-video planning call
remains for visual speaker association and cards.
Source candidate Flash currently uses JSON MIME mode with no `responseJsonSchema`
or `responseSchema` argument. This owner-authorized one-argument isolation keeps
the prompt/model/token/deadline settings and all capture unchanged; Google request
acceptance remains an owner-run live check. Safe request/startup policy is `json_only`.

The owner removed all Find moments transcript/candidate quality rejection gates
on 2026-10-05. Returned zero-length, inverted, out-of-order, overlapping and
out-of-media timings remain unchanged; quotation, evidence, duplicate, duration
and overlap quality checks cannot reject the request. Shared browser contracts
apply the same policy. Usable items are decoded independently, unavailable ranges
are omitted and unavailable quote references are skipped, with private adjustment
records. Empty usable output produces no candidates. Bounded data, primitive
decoding, source/session/receipt/authentication, spend and cleanup controls remain.
No missing-time inference, fake substitution or additional repair call is used.
All full raw and normalized private capture remains available under its permit.

Audio profile/bytes/checksum and source codec/rotation/dimension identity must match
before AI. Decoded duration/fps are authoritative; browser estimates may differ. Missing
new image inspection fields fail closed. Success deletes/verifies the Google
file and releases the analysis audio, then signs session/epoch/source revision/
request/result digests and expiry. The backend retains no transcript. Conflicting
replay, uncertainty, abort and refresh never redispatch. Failed Google deletion
waits for upload settlement, shares deletion with analysis finalization, and
retains an explicit process-local cleanup obligation independently of visitor Exit; crash/
provider expiry and actual media-clock parity remain live/release checks.

```text
corepack pnpm --filter @clipbuilder/backend test:unit src/analysis/analysis.test.ts src/admission/turnstile.verifier.test.ts src/admission/processing.admission.test.ts src/config/loadConfig.test.ts
```

## Current cloud migration — approved local foundation

[Current authority](../../docs/architecture/GEMINI_REMOTION_MIGRATION.md) and [cloud setup](../../docs/operations/CLOUD_RUN_RENDERER_SETUP.md) govern private temporary artifacts and generation-bound cleanup. The owner approved local corrections. CL-007 connects the protected local analysis path; the default fake journey uses fixtures. New cloud/credential/paid actions retain separate gates.

Fake/live selects AI; local/cloud selects renderer environment. A local API will obtain an audience-bound private renderer ID token via server ADC; Cloud Run has its own runtime identity, the browser no credentials. Fake cloud rendering still costs compute; fully offline tests inject all remote ports and telemetry. No service/project ID is populated in Git and no source/provider content is logged.


The backend is the private Express control API and future protected AI request
boundary. It may import `@clipbuilder/contracts`; it must never import frontend
implementation. The current approved architecture uses private temporary GCS
media and a separate authenticated Node/Docker Cloud Run renderer. The control
API owns admission/Google orchestration and private streaming, not heavy rendering.

## Current responsibility

CL-001 supplies strict configuration parsing, explicit application composition,
a content-free `GET /v1/health`, safe error mapping, and deterministic tests.
CL-003 adds a contract-validated synthetic analysis/assembly story plus
deterministic fake clock, provider, and operation foundations under `src/demo`.
The fixtures cover zero, one, three, and four candidate outcomes and one
immutable automatic composition manifest with fixed captions. They run with no
credentials or network and are not a live-provider fallback.
CL-004 adds local fixture routes under `/v1/sample/*` only when `APP_ENV=local`
and provider mode is fake: session start/evidence, immutable analysis, one
idempotent inspection/analysis/build/render scripts and clear. These are
development-only simulated operations, not media/provider implementations.
`SampleSession` bounds its
ephemeral in-memory fixture map to 16 entries and two-hour access, not a durable
store. Its HttpOnly/SameSite fixture cookie is not the future encrypted grant.
Production/real composition does not register these fixture routes; safe
`GET /v1/sample/config` remains available and advertises protected local analysis
only when composed behind its gates. Assembly/export remain disabled. There is
no fixture download route or valid output capability.

The earlier CL-005 code removed cloud/native-media configuration and established
process-local protected admission. The migration now adds a typed server-only
renderer client with ADC audience identity and both identity headers. Gemini
orchestration and protected local source upload/analysis are implemented in CL-007;
preview/download integration remains later packet work. Final export belongs to cloud compute. No editor or assistant endpoint
belongs in the demo API. The backend environment owns the private renderer origin
and recorded cloud-spend approval; these require separate cloud authorization
even with fake AI. Renderer service
config belongs to `apps/renderer/.env.example`; no browser config exposes it.
Retired server upload/render feature flags cannot be enabled. In local real
mode, the public config permits browser intake without credentials; remote
analysis requires the CL-007 gates, and assembly/export remain unavailable.
See the [current migration plan](../../docs/architecture/GEMINI_REMOTION_MIGRATION.md)
for cloud ownership, restart/uncertain-result failures and paid gates. The
[earlier browser contract](../../docs/architecture/BROWSER_OWNED_MEDIA.md)
preserves process-local admission evidence; the fake Map/cookie are not its implementation.

`src/admission` owns AES-256-GCM HttpOnly/Secure/SameSite grants with an issuing
boot epoch, fixed expiry, exact origin/CSRF and bounded canonical keyring.
Its ledger reserves four one-use action slots per grant and keeps replay/
uncertain/canceled tombstones until expiry. Overflow is refused, not evicted.
Grant issuance is globally rate-bounded, actions are once per grant/kind, active
transport capacity is held until settlement, and dispatch budget is process-life
only. Timed-out/disconnected actions cannot be automatically retried/refunded.
Normalized-result receipt contracts bind a completed action and request/result
digests; they do not prove browser metadata or unseen video content.

Explicit paid-off composition exposes no grant/clear route.
The explicit local foundation composition requires validated owner-populated
blank grant key entries. It refuses paid dispatch unless CL-007 live analysis,
paid and cloud-spend gates are enabled. `/v1/admission/grant` and `/clear` require actual secure
transport; untrusted forwarded-protocol headers do not make HTTP secure. There
is no generic body relay or audio endpoint. Public protected/paid composition
is refused pending CL-015 safeguards. No cross-replica exactly-once, durable
counter, stored provider content or lost-response recovery is promised.

`src/app.ts` constructs Express without listening. `src/server.ts` is the only
module that reads `process.env` and opens the local port.

## Configuration and secrets

`src/config/env.schema.ts` tracks the backend configuration schema and defaults.
`src/config/loadConfig.ts` parses the supplied environment during explicit
composition. There is no runtime JSON reader, template or composition argument.
Local startup loads only ignored `apps/backend/.env.local`; deployment injects
the same keys into its environment. See [the blank example](.env.example).

Normal defaults are `FAKE_MODE=false`, `PAID_DEMO_ENABLED=true` and four approvals
true: `CLOUD_SPEND_APPROVED`, `GEMINI_TRANSFER_APPROVED`,
`GEMINI_IMAGE_GENERATION_APPROVED` and `GEMINI_PAID_PROJECT_CONFIRMED`.
An explicit `PAID_DEMO_ENABLED=false` forces all four false and disables
cloud/sample reads, live processing, grants and dispatch allowance. Individual
approval flags can also disable their capability while paid remains on.

Private connections and retained-sample references use the matching environment
entries in the example. Real paid mode enables analysis, assembly and final
rendering in code once their prerequisites are complete. The obsolete
`PAID_VALIDATION_STAGE` setting is ignored, including existing local entries.
The fixed allowance covers four media operations and at most three image calls;
image approval off leaves four, and paid off leaves zero. Limits, models,
deadlines and retries stay fixed in code. The deployed renderer must support
the current composition and image contract before a successful live export.
Credentials and private identifiers remain blank in Git and browser responses.
Tests and synthetic harnesses force fake/paid-off/approval-off before imports,
remove inherited private setup and intercept network access. With fake mode and
no keys, only labelled fixtures and injected synthetic checks work; real AI
requires provider credentials and enabled live prerequisites. No local AI
weights/runtime are used or introduced.

## Run locally

Use Node.js `^22.13.0` or `^24.0.0` and the pinned pnpm `11.19.0`.
From the repository root, install dependencies and compile the shared contracts:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm build:contracts
```

Start the backend in its own terminal, from the repository root:

```powershell
corepack pnpm dev:backend
```

This runs `tsx watch src/server.ts`: it launches the API and reloads it after
source changes, rather than only compiling TypeScript. On explicit non-test
local startup, the server loads ignored `apps/backend/.env.local` if present.
Existing process-environment values take precedence. No environment flags need
to be copied into the command. Defaults without local overrides are real mode
and paid-enabled; normal startup respects the owner's explicit environment settings.
See [Configuration and secrets](#configuration-and-secrets).

The API binds to `127.0.0.1:4000` by default. Before starting or testing the
frontend workflow, confirm the content-free GET returns `200`:

```text
http://127.0.0.1:4000/v1/health
```

This endpoint does not call a provider, cloud service, or user object and does
not prove that a paid feature is ready. The current frontend fixture bridge
pins upstream port `4000`; an intentional backend `PORT` override must not be
mistaken for a working default full stack. Do not change ports or origins to
hide a conflict.

Local app availability is independent of unfinished paid-feature setup. With
real mode selected, missing Gemini/Turnstile/grant/renderer prerequisites or
required approvals leave paid routes unavailable and dispatches at zero; health
and local intake can still start. Retained-sample playback requires the paid
master on and complete local sample/ADC prerequisites. Startup prints fixed requirement codes without private values.
The operating switches remain authoritative, and completing setup still needs
the applicable owner approvals. Conflicting modes, malformed structural settings
and public/test paid composition continue to reject. No fake results substitute
for an unavailable real operation.

For a requested production-like local run, stop the backend instance first,
then run from the repository root:

```powershell
corepack pnpm build:backend
corepack pnpm start:backend
```

The explicit executable entry point loads the same app-local configuration
when eligible; imports and tests do not. Rebuild contracts after changes to
`packages/contracts`. After owner-managed environment changes, restart the
whole backend watcher/launcher to load fresh settings; a source reload alone
is not an environment-reload guarantee.

For a manual stop, use Ctrl+C in the owning terminal and confirm both the tsx
watcher/children and backend listener are gone. Restart means verified stop
first, then the selected launch command and health check. Agent-managed runs
follow the outside-sandbox, hidden-launch, process-tree, logging, and cleanup
rules in [AGENTS.md](../../AGENTS.md#canonical-local-app-startup).
`run all` includes the backend and frontend; `run backend` targets this API only.
Missing credentials do not require fake overrides or a cloud setup: leave
gated features unavailable and report the owner-only setup that remains.

## Analysis diagnostics

The executable server writes bounded JSON lines to stderr for the fixed
analysis upload/sample/run/clear routes. Each line has
`event: "analysis_diagnostic"`, an opaque `requestId`, action, phase, outcome and
elapsed milliseconds. Phase records distinguish source transfer, proxy
preparation/fetch/check, Gemini upload/file processing/generation/validation,
reconciliation and cleanup. Request completion includes the application HTTP
status; a numeric upstream status, when available, is a separate field.
Source-controlled error codes/rules, allowlisted error classes and structural
network codes help classify failures. Original failed-phase records are emitted
before later cleanup, so cleanup cannot erase them from the logs.

Diagnostic format **v2** adds `requestElapsedMs` and `timingScope`, so a stage
duration is distinguishable from the total request duration. Startup prints the
content-free marker `ClipBuilder analysis diagnostics v2 ready`. Candidate-selection
schema activation also prints
`ClipBuilder Gemini analysis schema policy candidate_local_evidence_cap ready`.
Reconciliation diagnostics activation prints
`ClipBuilder reconciliation diagnostics ready`.
`gemini_request` records the fixed model/API version, candidate-selection or selected-
plan purpose, output-token limit, timeout, one SDK attempt, one candidate and zero
tools. Both current Flash purposes use `schemaPolicy: json_only`. Selected plans
retain their static schema summary with `schemaLocation: prompt`; transport
schema parameters are absent. Historical policies/records remain parseable.
Its code-owned response-schema summary contains a SHA-256 fingerprint,
byte/node/depth counts, tuple/boolean-items/reference counts, largest array bound
and recognized schema keywords. It never contains schema descriptions or input
content; the fingerprint is of the static output schema, not the source media.

### Temporary owner-local full Gemini capture

Every current phase also emits a fixed descriptive `message`, phase duration,
request duration and request ID. Assembly has separate markers for request and
signed evidence checks, range/context and captions, admission, selected window,
source verification, proxy transfer/integrity, generation, plan parsing, cards,
speaker focus, manifest, preview creation/binding, result parsing/signing and
cleanup. `assembly` facts include bounded word/caption/card/focus counts, duration,
context/proxy bytes and integrity booleans. `validation` records fixed rejection
reasons and at most six structural schema issue locations/codes; unknown field
names are redacted. The original failure survives secondary cleanup failures.
Existing Google/renderer/reconciliation diagnostics remain. Full selected word
and caption context, decoded/parsed plan, compiled cards/focus and final compiled
result join the existing full provider response capture below; no signed receipt
or playback authorization is added to the private stage outputs.

The owner explicitly authorized full returned-response logging for the current
local timestamp investigation. Normal stdout/stderr remain content-free. The
separate private capture records all returned HTTP bodies/headers before SDK
parsing, complete generation content and provider metadata, SDK-derived text,
normalized output, actual decoded duration and every out-of-media word's
start/end/overrun in milliseconds. Response-size, validation, dispatch and
cleanup behavior are unchanged. Responses above the existing four-MiB bound
still fail; any captured bounded prefix is marked `complete: false`.

This defaults off and requires local live/paid-analysis composition plus a
versioned workspace-bound permit in OS Temp's
`clipbuilder-runtime/private-gemini-capture/permit.json`, expiring within six
hours. Fake/test/preview/production composition cannot enable it. Each UI run
writes a separate opaque-request-ID `.jsonl` file in that private directory.
`ClipBuilder private Gemini response capture armed` confirms activation at
startup; a fixed unavailable warning reports filesystem failure without values.
The files can contain complete private transcript/provider data. Keep them
outside Git/fixtures/screenshots and remove after diagnosis. Activation expiry
stops new captures; it does not delete evidence. Requests/authentication,
environment values, ADC files and configured prompts are not serialized.
The implementation and exact checks are owned by the
[CL-007 capture packet](../../docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md#owner-local-full-gemini-capture--2026-10-05).
Synthetic fake/no-key tests verify this instrumentation; real content requires
the owner's manual UI test with existing keys/live flags/approvals. No local AI
runtime/weights or agent-run paid test are used.

Reconciliation failures carry private `reconciliation` metadata through the
failed phase/result/request records. `rule` identifies the first failed explicit
guard: transcript length/timing/IDs, turn partition/speaker consistency, candidate
boundaries, evidence ordering, source quotation or prohibited/unsupported copy.
`provider_schema` and `analysis_bundle_schema` include up to four structural
`issues`, each with an allowlisted issue `code`, static contract `constraint`
and field/index `path`. `issueCount` and `truncated` flag omitted issues; unknown
contract messages classify as `unclassified`. Unknown path segments become
`unrecognized`; paths are bounded and numeric locations are zero-based indexes.
They contain no actual word IDs, text, timestamp values, source duration or raw
Zod messages/inputs. Unexpected non-schema exceptions use `unexpected_error`.
Public error code/message, all acceptance conditions/limits and dispatch/cleanup
remain unchanged. These reasons identify a check; they do not certify that the
check is correct or that a rejected response was poor quality. See
[CL-007 reconciliation diagnostics](../../docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md#reconciliation-rejection-diagnostics--2026-10-05).

Source-analysis requests omit the outer `words.maxItems`, `turns.maxItems` and
candidate `evidence.maxItems` transport hints. Controlled requests isolated the
evidence maximum: original full schema 400, only that hint omitted 200, original
restored 400. The production schema now matches the accepted fingerprint
`e48e4e70308c0f0b3fd9f8384d7166e234a6e8f933f7923719dcee004f6b860e`.
Canonical backend validators still reject more than 12,000 words, 10,000 turns
or eight evidence entries per candidate. Evidence minimum two, its word-ID cap,
all other array/tuple bounds and response/media caps remain intact. The outgoing
schema's largest array bound is still 8. Fake/no-key injected SDK checks prove
the precise transport change and local rejection/cleanup. The subsequent owner
video run returned generation HTTP 200 and passed JSON/schema validation, then
failed reconciliation. Genuine grounding acceptance/quality still requires the
owner's manual UI retest with the reason diagnostics under their
existing live setup and approvals. See
[the CL-007 remedy record](../../docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md#isolated-generation-schema-remedy--2026-10-05).

`google_http` records a fixed operation name, HTTP status and transport duration
for uploads/generation/deletion and non-2xx polling/listing. Successful polls are
covered by the enclosing lifecycle timing. A completed HTTP exchange is not
proof of successful processing: deletion confirmation can intentionally receive
403/404; use the enclosing cleanup outcome. URLs/headers/bodies are not retained.
Error responses are classified before the pinned SDK or manual Files adapter
maps the error. `google` records recognized gRPC status and ErrorInfo reason
codes, fixed rejection categories, known parameter names, recognized schema
tokens, detail types and bounded violation/unknown-detail counts. Structured
field names take priority over message-derived parameter matches. Sources are
explicit (`status`, `error_info`, `field_violation`, `message`); message-derived
categories are diagnostic clues, not verified root causes. Unknown field names
become `unrecognized`. Generic, absent, malformed and oversized responses remain
explicit; truncation is flagged. Unknown text/reason codes are never printed.

No request/response body, SDK message or stack, URL, filename, source/provider
identifier, transcript, prompt, cookie, key or account value is logged. Records
are capped at 256 per request, with no database, queue, extra provider request or
retry. Ordinary records stop at 239, reserving sixteen slots for errors/non-2xx
responses and one for completion with `droppedRecords`. Lines remain capped at
2,048 characters. Logging failures cannot change the work's result. `createApplication` and
`composeBackend` default to a silent injected sink; only explicit server startup
enables stderr output. Ordinary tests use injected sinks and fake transports
with no keys or external network. They do not prove a successful Gemini response
or physical cloud deletion; those remain owner-run checks with the enabled live
setup and approvals. No local AI runtime/weights are used.

Agent-managed startup captures stderr in its ignored runtime log. Its supervisor
uses the same strict diagnostic validator; unknown fields, arbitrary values and
oversized lines stay redacted. Inspect only
these structural records when diagnosing analysis, correlating the safe response's
`requestId` with the first failed phase and later cleanup/request completion.
An application 500 alone does not identify Google's status. Do not enable raw SDK
debug output or retry a paid request merely to collect logs. See the
[current diagnosis record](../../docs/operations/GROUNDED_ANALYSIS_CHECK.md#priority-backend-diagnostics--2026-10-04).

## Retired Gemini isolation command

The combined-video source schema and its isolation CLI were removed in the
2026-10-05 Transcribe migration. Existing saved diagnostic v2 purposes/policies
remain parseable. No retired probe is executable and no fallback uses the old
source pipeline. Use the normal owner UI flow and private output capture after
an approved matching renderer rollout; see the current CL-007 packet.
