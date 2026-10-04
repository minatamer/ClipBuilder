# ClipBuilder backend

**Session Exit (CL-007 owner decision, 2026-10-04):** same-origin
`POST /v1/session/exit` expires application cookies and returns 204 independently
of cleanup. It is composed even when paid analysis is disabled. A valid session
cancels actions and revokes the grant before bounded provider/renderer deletion
settles; stale/missing cookies still exit, with independent expiry for old copies.
The browser never receives a deletion-failure recovery requirement. This response
is access reset, not deletion evidence. Default fake/no-key tests use only injected
ports; real deletion remains an owner-run check requiring configured storage/provider
access and recorded approvals.


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
and final rendering require keys and the approved render validation stage,
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

`src/assembly/selected-assembly.usecase.ts` consumes a verified CL-007 source result
and one immutable candidate. It reserves `visual-plan` once, requests a physical
selected proxy, obtains one combined speaker/card plan and signs the frozen
word-grounded manifest/source generation/hash. `POST /v1/analysis/assemble`
uses the protected session/CSRF path and bounded signed analysis context.
The Google adapter reuses the source adapter's Files lifecycle with explicit
5fps sampling. Source AI, repair, image and search calls are zero. Uncertain or
replayed actions never dispatch again. Release failure prevents publication.
CL-009 extends that same call for extractive statement/comparison/steps cards
and fixed captions, with zero raster calls. The browser stores a complete
hash-checked result or uncertainty. CL-010 connects Proceed/Player/read-only
review; CL-011 owns MP4 delivery.

Fake/injected plans verify anonymous word association, confidence, wide fallback,
cuts and bounded interpolation without keys/network. Real speaker quality needs
keys/live flags, rights/data/paid approval and the separately deferred renderer
rollout. No local AI model is used. Live assembly requires protected source
analysis and at least three admitted actions; this is a process count, not a
provider/cloud billing cap. See [CL-009 evidence](../../docs/tickets/CL-009-build-contextual-visual-assembly.md).

The 1000ms switch hold counts the union of voiced transcript time in each
unambiguous speaker turn. Word pauses add no hold time and always use wide
framing; overlap/unknown speech ends the turn. Provider observation subdivision
does not shorten a sustained turn. Motion resets after wide gaps and shot cuts,
and transcript-driven segmentation retains the fixed public geometry limit.

```text
corepack pnpm --filter @clipbuilder/backend test:unit src/assembly
```

## CL-007 protected source analysis — local implementation

`/v1/analysis/{grant,session,upload,run,clear}` connects protected local admission,
private upload and one Gemini source analysis. Live execution remains gated by
the [controlled-check plan](../../docs/operations/GROUNDED_ANALYSIS_CHECK.md).
Public/hosted paid composition remains rejected. `FAKE_MODE=true` with no keys
keeps the fixture journey and injected zero-network tests; it proves no AI quality.
Real processing needs keys/live flags, rights/transfer/paid-project approval,
Turnstile, grant signing, ADC and separate cloud/AI spend permission.

Two atomic actions are reserved: the legacy `transcription` nonce now owns upload
admission; `candidate-analysis` owns proxy preparation and one source call. There
is no separate transcription/candidate retry under the migration's one-call
budget. Origin/CSRF/epoch/expiry/rate/capacity precede dispatch. The dedicated
bridge is fixed at localhost:3000 to loopback:4000. HTTP is accepted only on that
loopback local origin; cookies retain Secure/HttpOnly/host-only attributes. No
proxy-header trust. Turnstile checks exact hostname/action/session cdata once.

Files uses bounded REST start/finalize because pinned `@google/genai@2.25.0` has
independent uploader retries and incomplete upload abort propagation. Its SDK
handles generateContent/get/delete with one attempt, deadlines and response-byte
interception. Fixed schema/policy, one response, zero tools/search and no
interaction/history storage. Compact word/turn tuples become ordinal IDs and
unknown confidence. Titles/hooks/evidence are extractive; reconciliation checks
references/order, sentence/turn starts, sentence endings, 10–60s duration,
distinct evidence/overlap/claims/quotes. Word overlap tolerance is **250ms**.

Proxy bytes/checksum and source codec/rotation/dimension identity must match
before AI. Decoded duration/fps are authoritative; browser estimates may differ. Missing
new image inspection fields fail closed. Success deletes/verifies the Google
file and releases the analysis proxy, then signs session/epoch/source revision/
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
belongs in the demo API. The ignored backend runtime configuration owns the private renderer origin
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

Default paid-off composition exposes no grant/clear route.
The explicit local foundation composition requires validated owner-populated
blank grant key entries. It refuses paid dispatch unless CL-007 live analysis,
paid and cloud-spend gates are enabled. `/v1/admission/grant` and `/clear` require actual secure
transport; untrusted forwarded-protocol headers do not make HTTP secure. There
is no generic body relay or audio endpoint. Public protected/paid composition
is refused pending CL-015 safeguards. No cross-replica exactly-once, durable
counter, stored provider content or lost-response recovery is promised.

`src/app.ts` constructs Express without listening. `src/server.ts` is the only
module that reads `process.env` and opens the local port.

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
local startup, the server loads ignored `apps/backend/.env.local` and
`apps/backend/runtime.local.json` if present.
Existing process-environment values take precedence. No environment flags need
to be copied into the command. Defaults without local overrides are fake and
paid-disabled; normal startup does not force a mode over the owner's settings.
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
real mode selected, missing Gemini/Turnstile/grant/renderer prerequisites or an
unapproved stage leave paid routes unavailable and dispatches at zero; health
and local intake can still start. Independently approved retained-sample playback
stays available. Startup prints fixed requirement codes without private values.
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

No request/response body, SDK message or stack, URL, filename, source/provider
identifier, transcript, prompt, cookie, key or account value is logged. Records
are capped at 48 per request, with no database, queue, extra provider request or
retry. Logging failures cannot change the work's result. `createApplication` and
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

## Verification commands

Run from the repository root:

```powershell
corepack pnpm --filter @clipbuilder/backend typecheck
corepack pnpm --filter @clipbuilder/backend test:unit
```

For the complete deterministic workspace baseline:

```powershell
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
```

Tests own their fake/paid-disabled environment and never load `.env.local`.
These checks are separate from the normal local app launch.

## Configuration and secrets

The app's [`.env.example`](.env.example) contains only `FAKE_MODE`,
`PAID_DEMO_ENABLED` and blank credential entries. Copy it to `.env.local` in
this directory for initial setup. The frontend has its own empty example;
there is no root environment file. Backend `FAKE_MODE` is the sole mode authority.
Legacy `PROVIDER_MODE`, when supplied, must match the derived mode.

Private connections and recorded approvals belong in ignored
`apps/backend/runtime.local.json`, shaped by [runtime.example.json](runtime.example.json).
This file is server-only and must never enter a build image, Git or browser config.
Only the executable entry point reads it during explicit local startup; imports,
unit tests and CI never load either local file. Existing process environment
wins for credentials/switches; platform `NODE_ENV`, `PORT`, `APP_ENV` and
`APP_REVISION` remain injectable. Restart the full backend watcher after changes.

Numerical policy is fixed in code: shared public/assembly limits come from
`@clipbuilder/contracts`; server rate, capacity, timeout and retry defaults live
in `src/config/env.schema.ts`. Old `MAX_*`, `RATE_*`, timeout and live-feature
environment overrides reject at startup. They are not tuning knobs.
The processing-grant active label is also code policy: `v1`, defined in
`src/admission/processing.grant.ts`. Paste the 43-character base64url secret
directly into `PROCESSING_GRANT_KEY`; no JSON or label is needed. The former
`PROCESSING_GRANT_KEYS_JSON` entry is accepted during migration only when the
new entry is absent. Reuse its existing `v1` key when renaming the entry.
An explicit new entry takes precedence, including a blank value. The obsolete
`PROCESSING_GRANT_ACTIVE_KEY_ID` selector is ignored. The active label cannot be
selected through environment configuration.
`paidValidationStage` selects only the separately authorized analysis, assembly
or render checkpoint; composition derives live features, protected admission
and its fixed two/three/four dispatch allowance. Raster generation stays disabled.
Turning `PAID_DEMO_ENABLED=false` disables all paid features and admission,
even if a validation stage was previously recorded. The stage and approval
record are prerequisites, never authorization by themselves.

`FAKE_MODE=true` with no keys supports the synthetic journey without providers.
`FAKE_MODE=false` with paid processing off supports local video intake/playback.
A complete `retainedSample` reference plus recorded storage-spend approval
adds generation-pinned private sample reads through ADC; it needs no Gemini key
or AI model. Keep its bucket/object/generation/byte metadata private. Paid AI
requires the credential entries, Turnstile hostname, renderer origin, separate
cloud/transfer/paid-project approvals and an approved validation stage. Public
paid processing and hosted authenticated routing remain gated under CL-015.

Tests set their complete environment before composition, reject live/paid flags,
and block non-loopback network access. Never read local configuration to answer
setup questions or expose secrets/private connection settings through `NEXT_PUBLIC_*`.
Vitest also disables environment-file loading and removes inherited provider
credentials. Test mock cleanup cannot remove the worker's socket guard or
restore paid settings. Synthetic live-shaped configuration inputs exercise
validation and injected ports only; they do not change the test process mode.
Paid-flow checks are performed manually by the owner.
