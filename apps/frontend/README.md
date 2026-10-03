# ClipBuilder frontend

## CL-007 source analysis and recovery

The prepared-source screen offers explicit rights/transfer/paid confirmation when
backend gates are ready. The bounded same-origin bridge carries only grant/CSRF
headers; the runtime upload capability goes directly to private storage and is
never journaled. Ephemeral Turnstile widgets/listeners are removed on completion,
cancel or unmount. Privacy copy discloses both original and AI proxy transfer.

The browser marks pending before remote work and atomically journals validated
source-bound analysis plus integrity receipt before advancing the existing
candidate/transcript/notes UI. Committed refresh makes zero new calls. Pending/
lost/failed work restores as visible failure with no automatic retry. Clear
aborts work and requests cloud/local cleanup; failure stays visible. A journaled
never-admitted grant refusal can clear without a remote session; admitted work
still requires verified remote cleanup. Decoded analysis duration/fps may differ
from browser measurements without invalidating source identity or refresh. Intake now
uses bounded incremental standard SHA-256 to match renderer inspection. Older
chained-digest workspaces fail source revalidation rather than being reused.

Remote cleanup has a separate content-free IndexedDB marker. Deleting the local
media/result journal cannot erase it. Reload restores a cleanup-only state,
blocks source preparation and retries only Clear; a confirmed remote response
is persisted separately from local acknowledgement. If local deletion or marker
acknowledgement fails after remote Clear expires the cookie, reload retries only
local cleanup using that confirmation. Unconfirmed admitted work still requires
remote Clear; a missing session is not proof of deletion. Committed local cleanup
and marker deletion are required before intake. Storage failure stays fenced,
and metadata transactions finish before workspace ownership is released.

With `FAKE_MODE=true` and no keys, the actual fixture browser workflow passed
selection, refresh, read-only review, simulated export and reset on desktop and
a 390×844 result view. MP4 download stays disabled. These results and injected
analysis tests are synthetic. Live calls need keys/flags/approvals in the
[controlled-check plan](../../docs/operations/GROUNDED_ANALYSIS_CHECK.md).
Renderer rollout, real challenge/upload/clock behavior, AI quality and the manual
device/responsive matrix remain unchecked. Automatic assembly/export is later work.

```text
corepack pnpm --filter @clipbuilder/frontend test:unit src/features/source-analysis/source-analysis.flow.test.ts src/features/media/browser.workspace.test.ts src/features/media/source.checksum.test.ts src/features/sample/sample.test.tsx
```

## Current cloud migration — approved local foundation

The [current plan](../../docs/architecture/GEMINI_REMOTION_MIGRATION.md) replaces browser final export and browser-only originals/outputs. Browser selects/uploads to approved private temporary GCS, plays a read-only selected proxy/fixed preview and downloads a validated result. Our authenticated Remotion Node/Docker Cloud Run service prepares proxies/cuts and performs final encoding. Mediabunny is retained only for useful intake/inspection. Existing local source/audio foundations and the interrupted browser-render experiment are preserved but are not the current final-export architecture. The owner approved local corrections; the browser exporter was retired and the fixed layout moved into packages/composition.

Fake/live AI and local/cloud compute are separate: current fake journey supplies fixtures without keys; ordinary tests inject cloud/renderer ports without network. A local app plus remote renderer needs ADC/cloud-spend approval even with fake AI. Live Gemini needs key/flags/rights/data-transfer/paid approval. The isolated private renderer's 2:45 processing/cancellation/deletion proof is recorded in CL-006. CL-007 implements browser/control source analysis locally; its live and device checks remain gated. See the [setup guide](../../docs/operations/CLOUD_RUN_RENDERER_SETUP.md). Exclude every feasibility/debug harness from deployment.


The frontend is the public Next.js experience. It may import
`@clipbuilder/contracts`; it must never import backend implementation or expose
server-only configuration to browser code.

## Current responsibility

**CL-005 local foundation (2026-10-01):** real local composition now retains one
File, inspects actual supported MP4/WebM tracks and bounds in a worker, probes
actual native portrait H.264/AAC encode/decode, and incrementally copies the
source into OPFS. A bounded versioned IndexedDB journal commits only on
transaction completion. An exclusive Web Lock, advisory content-free
BroadcastChannel notifications and runtime generation fencing protect one
workspace. Recovery re-inspects and hashes the actual source before accepting
cached analysis/selection; it never spends or requires a server-owned bundle.
The owner-approved expiry is fixed at two hours from source selection, with
active/next-open orphan cleanup and best-effort deletion. Closing a tab is not
a deletion guarantee; no persistent-storage permission or history is requested.
Missing storage/locking/codec support fails closed; no unproved memory fallback
is enabled. CL-006 adds a callable worker audio pipeline; CL-007 instead sends
the admitted original to private storage and a full-clock audiovisual proxy to
Gemini. Assembly/preview/export remain later packets.
Default fake behavior documented below is unchanged: it reads no File bytes
and cannot download an MP4. Real mode does not use synthetic build/render
fallbacks. Intake-only configuration stops at prepared source; the separately
gated CL-007 path connects source analysis to candidate review.
Backend services cannot open browser storage. CL-005 pins `mediabunny@1.61.0` and supplies a
separate [synthetic media feasibility harness](feasibility/browser-media/README.md)
with measured Windows in-app Chromium codec/storage/range/full-bound evidence
in the ticket. Run `corepack pnpm --filter @clipbuilder/frontend test:media`
only for that manual local spike; it is not part of normal tests or `/start`.
Local intake/recovery and protected-admission foundations are implemented;
the CL-007 provider path remains unverified live, with no final product download
or release claim.

**CL-006 audio slice (2026-10-02):** the admitted browser workspace can extract
bounded mono audio through the same owned worker. Positional OPFS writes,
native downmix/resampling, actual-clock and decoded-result validation, strict
messages, measured progress, stall/deadline cancellation and scratch cleanup
are implemented. Both profiles pad initial offsets and internal audio gaps in
bounded awaited samples. Clear/dispose drain audio work before deleting storage or
releasing ownership. The Opus/WebM profile is provisional; PCM/WAV exists for
local browser comparison only. With `FAKE_MODE=true` and no API keys, this worker
performs real local audio processing; the AI journey still uses fixtures.
The owner replaced local LR-ASD/YuNet and Deepgram/OpenAI with Google Gemini
and private Remotion Node/Docker Cloud Run rendering. See the [current migration contract](../../docs/architecture/GEMINI_REMOTION_MIGRATION.md).
Source/OPFS/clock/cleanup and local audio processing are retained. Model-specific
MFCC/ORT/Python probes are retired. Fake mode without keys still supplies fixture
AI results; real local media/render software does not prove understanding.
Google live analysis needs a server-only key, live flags and approved media
transfer, paid-project terms, rights and spend. Local corrections are owner-approved; no live speed/speaker accuracy or phone support is
claimed. The owner confirmed applicable Node/SSR license coverage for the private
checkpoint; complete notices and operational telemetry retain release verification.
The earlier browser export experiment
and its browser telemetry requirement are superseded.
The existing `/start` prepared-source boundary remains until CL-007 connects
the protected analysis workflow. No new user control or provider call is added.

CL-001 supplies the accessible product shell, framework error/not-found
boundaries, metadata, robots policy, and deterministic build/test foundation.
CL-002 adds the responsive landing prototype at `/`. CL-004 connects its Get
Started action to `/start`; other actions show How it works or Privacy & limits.
The landing remains server-rendered around narrow client
islands for the IntersectionObserver flow, native dialog controls, deterministic
anchor scrolling, and accessible hero-word rotation. The complete flow and
privacy copy remain in server markup. CSS
provides the responsive visual system, code-native synthetic media, and
reduced-transparency fallbacks. Per the latest CL-002 owner direction, the hero
and synchronized conversion story run at full timing in every local motion
preference state; the rotating noun has no pause/play control, and that recorded
prototype-only accessibility exception must be revisited before public release.
Laptop and desktop widths use a split hero with the brand, two-line promise, and
supporting copy beside the product-motion frame; tablet and phone widths stack
the same content. The header retains the only first-viewport CTA.

CL-003 adds the complete canonical session reducer, derived selectors,
allow-listed `sessionStorage` projection, server-evidence reconciliation,
effect registry, and provider foundation under `src/features/session`. The
projection stores only content-free selection, operation, assembly, automatic
manifest ID/hash, and playback references; it never stores the manifest body,
transcript, media, capability, proposal, or edit history. No CL-003 module is
mounted into the landing prototype. CL-004 now mounts it into the locally
single-workspace development preview. The owner approved brand foundations as
an interim baseline, then directed this core-flow redesign; final visual review
is not claimed.

CL-004 owns `/start`: one changing card with intake/limits, three prepared
58-second conversation choices, single selection, vertical placeholder gallery,
and a focused range-bounded player with transcript revealed only after Play.
The selected portrait moves into the center, other choices scroll in a left
rail, and a narrower detail pane switches between Transcript and Agentic Notes.
Timestamp notes use exact evidence and seek/pause the bounded player. Inline
controls and a back-to-gallery action leave the portrait unobstructed by external
metadata. Proceed builds the one selected moment. Native shared-element View
Transitions and a cancelable FLIP fallback animate entry, return and switching;
the owner's explicit motion decision removes app-level reduced-motion gates
permanently without changing OS/browser preferences. Motion accessibility and
final visual approval remain pending. The flow also includes simulated upload/
analysis/build/render, read-only review with manifest-grounded edit notes left
and transcript right, Confirm export directly on review, and restore/clear/error/
expiry handling. File intake reads
only type/size metadata, discards the File and never reads bytes, displays names
or uploads media. Duration and candidate data are prepared. Recorded source
playback remains rights-gated; portraits are explicit placeholders with a
caption/quote specification, not recorded video/audio. Result restores matching
immutable bundles for a portrait/download panel and disabled Soon destinations
(Facebook, Instagram, TikTok, X). These are inert owner-requested teasers, not
publishing/OAuth integrations or a release promise. Download is disabled until
there is validated output. The owner removed the header mode badge; Privacy &
limits retains the no-file-read/upload statement and rights/scope/size rows;
the owner removed its bottom development-summary paragraph. These
are the intended product screens with a development adapter, not a separate
public sample product. Confirmation sends the immutable manifest-bound request
once; there is no intermediate export screen or Back hop. Entering/restoring
review never renders automatically. Legacy confirmation projections restore to
review; confirmation waits for validated bundles and server allowance.

Refresh before upload completion cannot restore the runtime input metadata.
Reconciliation enters the existing clearing state and confirms server cleanup
before returning to intake, so a same or replacement input gets a fresh session
and upload authorization. Cleanup failures retain the existing retry path.
Pending or failed cleanup retains only a separate literal cleanup-required
marker after the ordinary projection is removed. Bootstrap checks it first and
re-enters clearing before allowing input; confirmed cleanup removes the marker.
It contains no session identity, media, capability or error, and a layout effect
saves intent before child cleanup requests can start. Reload never bypasses an
unconfirmed cleanup, including when the cookie-scoped session is already gone.
Completed uploads and later operations still resume from validated server
evidence. Same-input authorization/completion retries stay idempotent; obsolete
session/upload IDs cannot complete a replacement run. Delivery sizes the portrait
inside its own grid slot, keeping Download and social actions in separate rows
when the bounded phone layout scrolls.

Privacy & limits uses the shared 28px heading (22px on phones), 14px intro/row
text and 12px numbering. One framed lower panel holds three numbered rows with
thin separators; number/title/notes columns remain on larger screens, while
phone notes sit under their title. Both dialog triggers use this same layout.

Workspace Privacy & limits and Clear media actions reuse the shared secondary
Button. Clear is a two-word text command, not an icon-only action. Below 480px,
the actions occupy one equal-width row below the brand; the workspace height
accounts for this taller header. The landing's navigation trigger is unchanged.

`src/styles/tokens.css` owns shared foundations. `src/shared/ui` supplies buttons,
workflow frame and measurable/indeterminate progress. Each workflow title uses
`Step N of 3: <stage title>` instead of a separate step tracker. Used tokens also
feed the landing's foundation aliases. Feature components own sample content;
they do not own a second workflow machine.
Scrollbars use one global transparent-track treatment with shared thumb tokens:
4px rounded thumbs without arrow buttons in WebKit-compatible engines, standard
thin styling elsewhere and native scrollbars in forced colors. The WebKit path
resets standard width/color to auto so they cannot override custom rendering.
The dark privacy dialog overrides only thumb colors.
Candidate thumbnail play circles are 28px decorative cues inside the
whole-card button; actual player controls retain their 44px targets.
The shared portrait player uses floating controls inside the frame. Pointer
entry/movement and tap reveal them; playback inactivity fades them after 2.2
seconds or on mouse exit. Paused/busy states, keyboard focus and focused seek
interaction keep them visible. A full-frame named button reveals controls
without changing playback; faded actions remain keyboard reachable. The idle
timeout is owned and cancelled on state changes and unmount.
Back and playback overlays share the landing navbar's token-backed blue glass,
blur, border and inset highlights, with a stronger 72% media tint for legibility
over bright footage. No-blur/reduced-transparency states use an opaque fallback;
forced colors use native system colors. These controls are the intended shared
shell when gated real-media playback is connected; the current implementation
uses actual locally owned video and immutable source ranges in real local mode;
the fake adapter retains placeholders and simulated playback.

Fake operation screens show simulated percentages derived from the canonical
reported stage order, with a shared animated fill. Progress stops when reported
stages stop; 100% requires success evidence. Upload retains its simulated byte
fraction. These are development presentation values, not provider completeness
or ETAs. Elapsed time follows operation timestamps. Proven success gets an
abortable 500ms settle before the next reducer-owned screen. A reusable real-mode
presentation eases an indeterminate activity fill toward a bound without showing
a cosmetic percentage; it is not connected to live adapters yet. Unknown progress
otherwise stays indeterminate until measurable totals exist.

The allowlisted `/api/sample/*` server route pins the loopback backend on 4000,
caps JSON at 8 KiB, forwards only the fixture cookie and cleans up its 5-second
timeout/abort listener. It is a local fixture bridge, not the future production
`/v1` proxy or upload/grant implementation.

The intended product journey is owned-conversation intake → analysis → zero to four
grounded candidates → choose exactly one → automatic clip preparation →
read-only preview and render confirmation → result/download. The frontend will
not expose an editor, chatbot, manual trim, caption or visual controls, an
editable timeline, proposals, or undo/redo.

## Run locally

Use Node.js `^22.13.0` or `^24.0.0` and the pinned pnpm `11.19.0`.
From the repository root, install dependencies and compile the shared contracts:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm build:contracts
```

The landing at `/` can run on its own. The `/start` workflow also needs the
[backend](../backend/README.md#run-locally) on `127.0.0.1:4000`; start it first
and wait for its content-free health check to return `200`.

Start the frontend in its own terminal, from the repository root:

```powershell
corepack pnpm dev:frontend
```

The server binds to `127.0.0.1:3000`. Open
[http://localhost:3000/start](http://localhost:3000/start) to match the committed
frontend-origin policy. Check `/start` and `/api/sample/config` return `200`;
the second GET verifies the backend bridge without starting a paid operation.
The fixture bridge pins upstream port `4000`, so a different backend port is
not a working full-stack setup. Do not accept a silent frontend port fallback.

For a requested production-like local run, stop the frontend instance first,
then run from the repository root:

```powershell
corepack pnpm build:frontend
corepack pnpm start:frontend
```

Rebuild contracts after changes to `packages/contracts` before restarting
either app. Normal startup keeps the owner's backend configuration: its entry
point loads the root `.env.local` as described in the backend guide. This
frontend has no provider credential or separate mode setting to populate; do
not create a frontend `.env.local` to override backend mode or expose secrets.

For a manual stop, use Ctrl+C in the owning terminal and confirm no frontend
watcher/child or listener remains on `3000`. Restart means stop and verify
cleanup first, then run the selected launch command and verify readiness again.
Agent-managed runs use the outside-sandbox, hidden-launch, process-tree,
logging, and cleanup rules in
[AGENTS.md](../../AGENTS.md#canonical-local-app-startup). `run all` includes
both apps; `run frontend` targets this server only. The media spike is a separate
opt-in command, not another default app service.

## Verification commands

Run from the repository root:

```powershell
corepack pnpm --filter @clipbuilder/frontend typecheck
corepack pnpm --filter @clipbuilder/frontend test:unit
```

For the complete deterministic workspace baseline:

```powershell
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
```

Automated tests use their isolated safe configuration, not owner-managed local
environment files. These checks are separate from running the normal app.

## Focused manual verification

For real local mode, the owner-managed backend configuration selects
`FAKE_MODE=false`, `APP_ENV=local`; no credentials or paid flags are needed for
intake. Keep every paid/live/grant gate disabled. Choose one owned or synthetic
supported video; inspect local byte progress, actual playback, refresh recovery,
fixed expiry, second-tab refusal/reconnect and Clear followed by refresh. The
source remains local. Analysis/build/export remain unavailable, not simulated.
Private-mode denial and actual eviction/freezing remain unchecked as recorded
in CL-005. Automated and responsive viewport checks are the demo verification
scope; runtime probes reject unsupported capabilities. No temporary proof route is
part of the application.

Use prepared input or choose/drop a metadata-only video, watch simulated upload/
analysis, check initial portraits without transcript/Proceed, play one choice,
switch using portraits or arrow/Home/End keys, return to the gallery, play/pause,
switch detail tabs with arrows/Home/End, seek note timestamps and inspect exact
transcript highlights,
refresh and confirm paused selection restoration, Proceed once,
refresh during build/review, use Confirm export directly (including a rapid
double-click without accidental cancellation), inspect the disabled
download/four inert social destinations and Start over. Inspect elapsed time,
advancing fake percent and 100% settle. Cancel during upload/build/render; check safe recovery
if the local service is unavailable or its fixture session is gone. Test
320x568, 390x844, 768x1024, 1024x768, 1440x900, 1280x650 and intermediate widths;
check overflow, action bounds, keyboard arrows/Home/End, stage focus and dialog
Escape/focus return and animation interruption/cleanup. Full 200% zoom, forced
colors and screen-reader checks remain required; implemented CSS alone is not a
pass. App animations intentionally remain enabled under OS reduced-motion
preferences per the owner; this exception is not an accessibility-compliance claim.

## Configuration boundary

Browser code receives schema-validated safe mode/availability via the local
`/api/sample/config` bridge. Backend `FAKE_MODE` is the only mode authority;
real/unavailable mode never falls back to the development adapter. Do not create
a frontend `.env.local` or expose a second mode variable. `BACKEND_ORIGIN`,
`BACKEND_AUDIENCE`, bucket names,
provider configuration, credentials, grants, and signed capabilities are
server-only and must never use `NEXT_PUBLIC_*`.

Tests use the shared deterministic setup, force fake/paid-disabled flags, and
reject non-loopback network access.
