# ClipBuilder frontend

CL-015 hosted checkpoint (2026-10-07): the public Linux standalone frontend is
deployed against the private paid-disabled backend. API routes validate the exact
public Host and HTTPS proxy marker because Next uses its container address in
`request.url`; forwarded-host substitutions do not bypass Origin/CSRF checks.
Local origin behavior is preserved. No hosted sample/testing/replay UI is enabled.
See the [deployment and domain guide](../../docs/operations/CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07.md).
Fake/no-key verification is synthetic. Real hosted export remains gated by
provider/cloud configuration, live/approval settings and owner paid acceptance.

CL-015 final local-test preparation (2026-10-07) preserves the existing ignored
`.env.local`, fixed localhost origins and backend-owned processing mode. The
server-only control adapter adds exact hosted origin/audience and Cloud Run
metadata identity handling, with bounded HTTP work and generic platform failures.
Hosted-only settings are blank in `.env.example`; local mode ignores them.
No frontend/backend deployment or agent-paid test is performed. See the
[current preparation record](../../docs/operations/FINAL_LOCAL_PAID_TEST_PREPARATION_2026-10-07.md).
Fake/no-key checks remain labelled synthetic/injected with Download disabled;
real processing and quality acceptance remain owner-manual with the configured
provider/live/rights/spend setup and private renderer.

## Prepare a Linux image

From the repository root, `node scripts/prepare-app-image.mjs frontend` prints
an allowlisted OS-temp context. With separate cloud-build approval, submit that
context using `apps/frontend/cloudbuild.yaml` and the existing approved `_IMAGE`
destination. Never submit the checkout. The recipe checks the actual Linux
standalone artifact, rejects external source links, and includes only the twelve
hash-approved public assets. Its offline nonroot runtime check verifies landing,
assets, generic API failures and removal of the retired test UI. It does not
deploy a service.

Later hosted setup injects `APP_ENV`, exact `FRONTEND_ORIGIN`,
`PRIVATE_BACKEND_ORIGIN` and matching `BACKEND_AUDIENCE` on the server. The
runtime identity supplies the private API token. These are never browser public
variables. Local mode fixes the existing localhost origins and ignores these
optional hosted entries; preserve the owner-managed `.env.local`.

CL-012 session-start protection (2026-10-07): real source analysis obtains a fresh
`session-start` challenge before asking for
a grant, then obtain the existing fresh session-bound upload/analysis proofs.
Cancellation before grant dispatch creates no remote cleanup obligation. The
fixture journey with `FAKE_MODE=true` and no keys remains API-free; real
processing requires configured Turnstile/provider/live/approval gates. Actual
widget/CSP/device acceptance remains owner-manual. Generic visitor errors and
private diagnostic reporting are preserved. No additional paid action is added.

Selected assembly failures preserve the backend's validated SafeError code,
message, request ID and retry evidence. A provider rejection therefore displays
the generic provider-failure message rather than a temporary-storage message.
Actual local storage errors retain their storage mapping. Fake/no-key regression
checks cover this mapping; real assembly acceptance needs the owner's paid test.
See
[the CL-009 diagnostics follow-up](../../docs/tickets/CL-009-assembly-request-and-diagnostics.md).

The Find moments empty state uses neutral "No moments available" copy: it does
not attribute an editorial judgment to Gemini when decoding yielded no usable
items. The existing state/recovery flow is unchanged. Fake/no-key fixtures prove
local rendering only; actual candidate quality requires the owner's live test.

CL-016 places **Use sample** beside **Choose a video** and keeps prepared
sources in Step 1 for playback before explicit **Find moments**. Fake intake
reads only declared type/size and shows a labelled simulated source preview; the
fixture analysis no longer starts automatically. In fake mode, **Use sample**
starts that existing fixture journey without choosing a file or reading real
media. Real local preview uses native source dimensions/playback in the existing
disposable workspace and needs no Gemini key. Native previews show a centered
loading spinner until a frame is available and while buffering or seeking;
synthetic placeholders stay labelled. The fixed cloud sample streams through the
same-origin video endpoint. Selecting or restoring it journals only the
selection, with no full download, checksum or OPFS source copy. Explicit **Find
moments** prepares its separate temporary processing copy on the server through
the existing protected admission; its CTA appears only when the local backend
enables the configured sample. Preview and production omit it. Clearing a
streamed sample removes its session selection without uploaded-file OPFS
deletion; retained masters stay protected. Disposable processing copies retain
remote cleanup. Live mode never falls back to fixtures. The landing **Get
Started** action opens intake; **Use sample** is offered there beside **Choose a
video**, with no separate sample CTA on the landing. See
[retained sample setup and preservation](../../docs/operations/RETAINED_SAMPLE_SETUP.md)
for ADC/storage configuration and
[CL-016](../../docs/tickets/CL-016-source-preview-and-retained-sample.md) for
checks and outstanding real-media evidence. Existing keys/live/grant/ spend
gates still protect AI; no local AI weights/runtime are used.

The accepted **Find moments** click starts the wait before journaling, grant,
verification or source preparation. It loops six task messages every five
seconds across preparation and analysis, while retaining elapsed time and
cancellation. The messages do not report measured stages or a percentage.
**Exit** returns home, forgets the workflow and expires app cookies. Temporary
media deletion runs quietly and never asks visitors to retry. The cookie-expiry
route responds even if the backend is unavailable, then schedules one bounded
handoff through Next's `after` lifecycle. If cookie reset itself is unreachable,
Exit still navigates and preserves a content-free intent; next entry resets
cookies before intake. Uploaded local cleanup drains under the exclusive lease
across navigation; a failed deletion tombstone is retried on next entry.
Retained sample selection never invokes uploaded-file deletion.

CL-015 adds production-output inventory checks to the normal build. See
[local release preparation and deferred deployment gates](../../docs/operations/LOCAL_RELEASE_PREPARATION.md).
Fake/no-key checks inspect owned build output and synthetic fixtures. Actual
media, provider keys/live approvals and independent cloud/hosting acceptance
remain separate.

CL-013 supplies shared mute/readable seeks and a final transcript, a bounded
first-frame wait with metadata-only retry, natural result rows and stage-loaded
Remotion review. See
[quality evidence and pending runtime matrix](../../docs/operations/EXPERIENCE_QUALITY_MATRIX.md).
Fake/no-key checks are synthetic; actual media/device/UI/film approvals remain
open.

CL-012 adds locally tested privacy headers, strict request/stream bounds and
canonical private caller-purpose routes. Browser documents use fresh CSP nonces.
Development permits inline style elements without a conflicting style nonce;
production permits the document nonce and only the pinned Player's exact
stylesheet hash. A regression checks that hash against Remotion's producer on
upgrades. Player's fixed silent-audio pool also needs `data:` media permission.
The browser startup hook and source-worker entry each enable Zod's interpreter
before schemas are constructed, avoiding runtime code-generation probes under
the strict production script policy. Owned source-worker errors use fixed
private diagnostics and generic recovery, with the existing shutdown behavior
retained. The Turnstile SDK belongs to the document; widgets share its
nonce-bearing load and remove only their own instance/subscription. Failed loads
support explicit verification retry without redispatching processing. See
[local CSP and preload evidence](../../docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md#local-implementation-and-validation--2026-10-05).

Trusted Types remains report-only pending real compatibility checks. Storage
policy and cleanup controls are code-tested, not proof of saved cloud settings.
See
[current safeguard evidence](../../docs/operations/SECURITY_PRIVACY_CONTROLS.md).

CL-011 connects explicit final export, receipt-checked output Range playback and
attachment download. It deletes server source/proxies before publication
success; output expires after ten minutes or at session expiry. Clear drains
owned work and streams. Completed-output restore and download retries dispatch
zero new jobs/AI. See
[fixed output profile](../../docs/operations/RENDER_PROFILE.md). With
`FAKE_MODE=true` and no keys, fixture UI cannot download; injected synthetic
ports prove lifecycle and rejection behavior, not a real MP4. Real
source/assembly and final rendering require keys/live flags (including
`LIVE_RENDER_ENABLED`), paid/data/rights gates and independent private
cloud/compute approval. Actual native pixels/audio/performance, devices,
rights/licenses and rollout remain unchecked; no local AI model or weights are
used.

## CL-010 read-only selected review

Proceed reserves the selected assembly once, journals its frozen result and
opens the existing notes/portrait/transcript layout. A separate cloud review
state cannot become a legacy fixture assembly. Refresh hydrates a complete
result; pending/uncertain work restores as failure without another AI/job call.
Remotion Player uses `@clipbuilder/composition`, the prepared selected proxy,
the manifest's 30fps clock and source start zero. Playback, volume and bounded
timestamp seeks are ordinary read-only controls. Notes describe the actual
conversation cut, caption/audio treatment and camera cuts counted from rendered
views, rather than repeating every tracking-state change. Each retained picture
gets its bounded scene brief, fetched/generated source, display duration and
grounded transcript connection. Rejected pictures are absent. Existing model
highlight explanations are preserved; a quote-only note becomes an explanation
of that beat's editorial role with its evidence quoted once. Older signed
results without scene metadata remain readable. Notes and seeking start no
provider call. Confirm export is connected by CL-011 to one admitted render.
Signed final metadata is restored without redispatch; a decoded portrait frame
and duration gate Download MP4. Retry access/download makes zero AI calls and
uses existing output only. Download requested does not mean saved. See the
[fixed render profile](../../docs/operations/RENDER_PROFILE.md).

The finished result shows the portrait clip beside the social-sharing Soon
panel, stacked on phones, with Download MP4 and Start over in the footer.
Transcript and editorial notes belong to the preceding review. The delivery
screen omits expiry/storage copy, media specifications and visible playback
success text; download announcements remain available to screen readers.
Playback verification, expiry enforcement and failure/retry messages still
apply.

Every workflow player shares a speaker button that opens a 0–100% playback
volume slider: source, selected moment, edited preview and final output. Zero is
silent; Escape or clicking outside closes the slider. This changes browser
listening only, without changing exported audio or starting processing. Fake
players expose the same controls with synthetic placeholders and no real audio.
See the
[owner follow-up](../../docs/tickets/CL-010-playback-volume-controls.md).

Playback media uses the fixed same-origin `/api/analysis/preview` URL, protected
cookie and validated byte streaming. No playback capabilities enter the journal
or URLs; validated transcript/manifest content remains in the browser journal.
Access failure offers metadata-only retry. Unmount/Clear removes Player
listeners and streams, and expiry removes playback access.

With `FAKE_MODE=true` and no keys the existing synthetic UI remains labelled and
download-disabled; injected tests exercise new review, restore, stream and
call-count boundaries. Real Player/native-output pixel and audio parity, font
metrics and device accessibility remain unverified. Real provider keys/live
flags and rights/data/spend approval plus separately approved cloud processing
are necessary for actual media. No local AI runtime/weights are used.

## CL-009 selected assembly preparation

`features/assembly/selected-assembly.flow.ts` uses one protected same-origin
selected plan, restores CSRF only in memory and atomically stores a validated
source/generation/range/hash-bound result. Pending/uncertain/complete markers
block re-dispatch; Clear and cancellation fence late publication. No raster
assets, public mutation controls or final encoder are introduced. CL-010 owns
Proceed/Remotion Player/read-only review, now connected by CL-010; CL-011 owns
MP4 delivery.

Injected synthetic checks work with `FAKE_MODE=true`/no keys; real Gemini needs
keys/live flags/provider rights/data/spend approval, and private proxy work
needs separate cloud authorization. Human font/visual/device/parity checks
remain unverified. No local AI model is used.

```text
corepack pnpm --filter @clipbuilder/frontend test:unit src/features/assembly src/features/media/browser.workspace.test.ts
```

## CL-007 source analysis and recovery

The prepared-source screen starts analysis on explicit **Find moments** when
backend gates are ready. The bounded same-origin bridge carries only grant/CSRF
headers; the runtime upload capability goes directly to private storage and is
never journaled. Ephemeral Turnstile widgets/listeners are removed on
completion, cancel or unmount. Privacy copy discloses both original and AI proxy
transfer. Verification normally runs in the background. Required interaction or
a failure opens a centered dialog with cancellation and explicit
verification-only retry.

Browser cloud transfer uses sequential 4-MiB Blob slices through that one
capability. The bar advances from validated storage acknowledgements, shows
percentage and confirmed/total size, and reaches 100% only after exact size and
generation validation. Unknown analysis/sample-copy phases retain activity
indicators. Ambiguous replies get one status query and at most one resend per
chunk, within 60-second request and existing flow/expiry bounds. Cancel/Exit
abort transfer and discard late progress; remote deletion remains the existing
independent cleanup obligation. Content-free `cloud-upload` records now reach
the private backend diagnostic stream through the bounded same-origin bridge;
they are not printed in the browser console. They correlate the validated opaque
operation ID and include byte counts, ordinal, duration, status and bounded
query/resend counts.

The
[CL-005 execution record](../../docs/tickets/CL-005-implement-secure-upload-and-storage.md#upload-implementation-and-verification--2026-10-06)
contains 98 focused synthetic checks and 11 native browser protocol checks. They
require no keys and do not prove actual GCS acknowledgements/deletion. The
normal fake journey remains simulated. Private storage acceptance needs the
existing storage setup, cloud allowance and protected challenge/session; normal
subsequent Gemini analysis remains an owner-run paid check with keys/live flags.

```text
corepack pnpm --filter @clipbuilder/frontend test:unit -- src/features/source-analysis src/features/sample/review-revision.test.tsx src/features/session/session.exit.test.ts
```

The browser marks pending before remote work and atomically journals validated
source-bound analysis plus integrity receipt before advancing the existing
candidate/transcript/notes UI. Committed refresh makes zero new calls. Pending/
lost/failed work restores as visible failure with no automatic retry. Exit
aborts owned work, resets access and requests best-effort cloud/local cleanup
without requiring deletion confirmation from the visitor. Decoded analysis
duration/fps may differ from browser measurements without invalidating source
identity or refresh. Intake now uses bounded incremental standard SHA-256 to
match renderer inspection. Older chained-digest workspaces fail source
revalidation rather than being reused.

Internal deletion confirmation remains separate from session reset. The previous
cleanup marker is migrated by leaving that abandoned session, with no cleanup
retry control. Exit hands cloud responsibility to the control API and
independent expiry; a missing/invalid cookie never counts as physical deletion.
Unmount does not abort the local deletion worker; its lease is released only
after work drains. Local deletion failure retains a clearing journal with no
restorable source and is retried best-effort on next entry. No background task
can delete a newer upload. Control restart loses volatile cleanup bindings, so
old cloud copies can require the existing private/provider expiry fallback.
These are remaining live limitations.

With `FAKE_MODE=true` and no keys, the actual fixture browser workflow passed
selection, refresh, read-only review, simulated export and reset on desktop and
a 390×844 result view. MP4 download stays disabled. These results and injected
analysis tests are synthetic. Live calls need keys/flags/approvals in the
[controlled-check plan](../../docs/operations/GROUNDED_ANALYSIS_CHECK.md).
Renderer rollout, real challenge/upload/clock behavior, AI quality and the
manual device/responsive matrix remain unchecked. Automatic assembly/export is
later work.

```text
corepack pnpm --filter @clipbuilder/frontend test:unit src/features/source-analysis/source-analysis.flow.test.ts src/features/media/browser.workspace.test.ts src/features/media/source.checksum.test.ts src/features/sample/sample.test.tsx
```

## Current cloud migration — approved local foundation

The [current plan](../../docs/architecture/GEMINI_REMOTION_MIGRATION.md)
replaces browser final export and browser-only originals/outputs. Browser
selects/uploads to approved private temporary GCS, plays a read-only selected
proxy/fixed preview and downloads a validated result. Our authenticated Remotion
Node/Docker Cloud Run service prepares proxies/cuts and performs final encoding.
Mediabunny is retained only for useful intake/inspection. Existing local
source/audio foundations and the interrupted browser-render experiment are
preserved but are not the current final-export architecture. The owner approved
local corrections; the browser exporter was retired and the fixed layout moved
into packages/composition.

Fake/live AI and local/cloud compute are separate: current fake journey supplies
fixtures without keys; ordinary tests inject cloud/renderer ports without
network. A local app plus remote renderer needs ADC/cloud-spend approval even
with fake AI. Live Gemini needs key/flags/rights/data-transfer/paid approval.
The isolated private renderer's 2:45 processing/cancellation/deletion proof is
recorded in CL-006. CL-007 implements browser/control source analysis locally;
its live and device checks remain gated. See the
[setup guide](../../docs/operations/CLOUD_RUN_RENDERER_SETUP.md). Exclude every
feasibility/debug harness from deployment.

The frontend is the public Next.js experience. It may import
`@clipbuilder/contracts`; it must never import backend implementation or expose
server-only configuration to browser code.

## Current responsibility

**CL-005 local foundation (2026-10-01):** real local composition now retains one
File, checks secure OPFS access, inspects actual supported MP4 tracks and bounds
in a worker, and incrementally copies the source into OPFS. A bounded versioned
IndexedDB journal commits only on transaction completion. An exclusive Web Lock,
advisory content-free BroadcastChannel notifications and runtime generation
fencing protect one workspace. Recovery re-inspects and hashes the actual source
before accepting cached analysis/selection; it never spends or requires a
server-owned bundle. The owner-approved expiry is fixed at two hours from source
selection, with active/next-open orphan cleanup and best-effort deletion.
Closing a tab is not a deletion guarantee; no persistent-storage permission or
history is requested. Missing storage/locking/source-decoder support fails
closed; no unproved memory fallback is enabled. The former CL-006 browser audio
pipeline is retained only as offline synthetic proof; CL-007 sends the admitted
original to private storage and a full-clock audiovisual proxy to Gemini.
Selected assembly, browser review and final export are now connected; their
owner-only live acceptance remains separate from synthetic checks. Default fake
behavior documented below is unchanged: it reads no File bytes and cannot
download an MP4. Real mode does not use synthetic build/render fallbacks.
Intake-only configuration stops at prepared source; the separately gated CL-007
path connects source analysis to candidate review. Backend services cannot open
browser storage. CL-005 pins `mediabunny@1.61.0` and supplies a separate
[offline media feasibility proof](feasibility/browser-media/README.md) with
measured Windows in-app Chromium codec/storage/range/full-bound evidence in the
ticket. Run `corepack pnpm --filter @clipbuilder/frontend test:media` for
retained synthetic tests. The testing UI/server on port 4185 was removed; this
command opens no port. These tests also run in the ordinary unit suite. Local
intake/recovery and protected admission remain implemented. Owner-reported live
flow/export success is recorded in the tickets; no agent paid verification or
public-release acceptance is implied.

**Historical CL-006 audio slice (2026-10-02):** the browser workspace could
extract bounded mono audio through the same owned worker. Positional OPFS
writes, native downmix/resampling, actual-clock and decoded-result validation,
strict messages, measured progress, stall/deadline cancellation and scratch
cleanup are implemented. Both profiles pad initial offsets and internal audio
gaps in bounded awaited samples. Clear/dispose drain audio work before deleting
storage or releasing ownership. The Opus/WebM profile is provisional; PCM/WAV
exists for local browser comparison only. With `FAKE_MODE=true` and no API keys,
this worker performs real local audio processing; the AI journey still uses
fixtures. The owner replaced local LR-ASD/YuNet and Deepgram/OpenAI with Google
Gemini and private Remotion Node/Docker Cloud Run rendering. See the
[current migration contract](../../docs/architecture/GEMINI_REMOTION_MIGRATION.md).
Source/OPFS/clock/cleanup and local audio processing are retained.
Model-specific MFCC/ORT/Python probes are retired. Fake mode without keys still
supplies fixture AI results; real local media/render software does not prove
understanding. Google live analysis needs a server-only key, live flags and
approved media transfer, paid-project terms, rights and spend. Local corrections
are owner-approved; no live speed/speaker accuracy or phone support is claimed.
The owner confirmed applicable Node/SSR license coverage for the private
checkpoint; complete notices and operational telemetry retain release
verification. The earlier browser export experiment and its browser telemetry
requirement are superseded. That product extraction path and its manual test UI
were retired on 2026-10-07. The
[offline audio proof](feasibility/browser-audio/README.md) retains useful
synthetic checks. Source inspection/copy/recovery and legacy scratch deletion
stay in the product worker; protected original upload and private AAC/proxy
processing own the current analysis path. The historical offsets/profiles and
browser measurements above describe the retired implementation.

## Visitor errors and private diagnostics

Visitor recovery and framework error boundaries use source-controlled,
generic/actionable copy. Technical exception text, stacks, codes and request
identifiers are not displayed. Application upload/preview diagnostics retain
their existing bounded fields and events, routed to the existing private backend
analysis-diagnostic stream. Next's early client instrumentation also redirects
application/framework console calls and uncaught events to strict, content-free
metadata; browser validation retains its CSP-safe JIT-disabled initialization
before contract imports.

The local `/api/diagnostics` bridge forwards only the validated JSON record to
`127.0.0.1:4000/v1/diagnostics`; it forwards no cookies, authentication or
arbitrary headers and always returns an empty response. The fixed envelope is at
most 8 KiB, the backend admits at most 512 records per minute, and requests have
a five-second deadline. Reporting is best effort with no retries, durable client
log or processing dispatch. Offline/rate-limited reporting can lose diagnostic
delivery without blocking the workflow. Existing backend/provider/renderer
logging remains intact. Native browser network/CSP/extension messages are
outside application console ownership; security reporting headers remain intact.
Hosted routing/authentication/privacy acceptance still belongs to CL-012/015.

CL-001 supplies the accessible product shell, framework error/not-found
boundaries, metadata, robots policy, and deterministic build/test foundation.
CL-002 adds the responsive landing prototype at `/`. CL-004 connects its Get
Started action to `/start`; other actions show How it works or Privacy. The
landing remains server-rendered around narrow client islands for the
IntersectionObserver flow, native dialog controls, deterministic anchor
scrolling, and accessible hero-word rotation. The complete flow and privacy copy
remain in server markup. CSS provides the responsive visual system, code-native
synthetic media, and reduced-transparency fallbacks. Per the latest CL-002 owner
direction, the hero and synchronized conversion story run at full timing in
every local motion preference state; the rotating noun has no pause/play
control, and that recorded prototype-only accessibility exception must be
revisited before public release. Laptop and desktop widths use a split hero with
the brand, two-line promise, and supporting copy beside the product-motion
frame; tablet and phone widths stack the same content. The header retains the
only first-viewport CTA.

CL-003 adds the complete canonical session reducer, derived selectors,
allow-listed `sessionStorage` projection, server-evidence reconciliation, effect
registry, and provider foundation under `src/features/session`. The projection
stores only content-free selection, operation, assembly, automatic manifest
ID/hash, and playback references; it never stores the manifest body, transcript,
media, capability, proposal, or edit history. No CL-003 module is mounted into
the landing prototype. CL-004 now mounts it into the locally single-workspace
development preview. The owner approved brand foundations as an interim
baseline, then directed this core-flow redesign; final visual review is not
claimed.

CL-007's owner source-preview correction (2026-10-05) applies before editing:
candidate thumbnails and the selected player use inspected source dimensions
with rotation. Landscape galleries scroll horizontally and snap to one card on
phones/tablets; landscape selected review reuses the Video / Agentic Notes /
Transcript swipeable slides and keyboard-accessible dots at all sizes. Other
moments remain reachable in a side rail or compact horizontal rail. Portrait and
square candidate previews keep their source proportions. The edited clip
review/export remains vertical. Paused thumbnails preload frame data, seek to
candidate start and report loading/decode failure. One decoder handles the
choices serially, copies bounded frames to in-memory canvases and releases each
native source before the next load. Gallery/side-rail switching reuses those
frames; exit releases listeners, pending decoding and canvas memory. No frame
file, server thumbnail job or provider call is added. Fake/no-key checks verify
synthetic layout/lifecycle, while real frame quality and paid editing require
the owner's manual UI test with credentials and enabled live stages. Proceed
requires public `liveAssemblyEnabled` and the processing challenge; successful
analysis alone does not enable editing/rendering.

Temporary local sample replay (updated 2026-10-06): **Simulate find moments for
sample** appears beside Use sample when the development backend's owner-local
saved analysis is valid. It immediately opens three saved real choices and their
transcript, with an explicit saved-analysis notice. It calls neither AI analysis
stage nor cloud preparation. Manual Proceed creates a fresh protected
session/disposable sample copy and signs inspected saved analysis before the
normal paid assembly/preview. Source uploads cannot use replay. Saved content is
outside Git/build/public assets. Replay has no activation deadline and stays
until explicit cleanup before deployment; normal browser workspace expiry/Clear
applies. Development guards and production composition exclude the
CTA/transport. Fake/no-key injected checks prove local wiring only; actual
provider/framing/preview success remains owner-tested with live assembly,
credentials and existing rights/transfer/cloud/spend approvals.

CL-004 owns `/start`: one changing card with intake/limits, three prepared
58-second conversation choices, single selection, vertical placeholder gallery,
and a focused range-bounded player with transcript revealed only after Play. The
selected portrait moves into the center, other choices scroll in a left rail,
and a narrower detail pane switches between Transcript and Agentic Notes.
Timestamp notes use exact evidence and seek/pause the bounded player. Inline
controls and a back-to-gallery action leave the portrait unobstructed by
external metadata. Proceed builds the one selected moment. Native shared-element
View Transitions and a cancelable FLIP fallback animate entry, return and
switching; the owner's explicit motion decision removes app-level reduced-motion
gates permanently without changing OS/browser preferences. Motion accessibility
and final visual approval remain pending. The flow also includes simulated
upload/ analysis/build/render, read-only review with manifest-grounded edit
notes left and transcript right, Confirm export directly on review, and
restore/clear/error/ expiry handling. File intake reads only type/size metadata,
discards the File and never reads bytes, displays names or uploads media.
Duration and candidate data are prepared. Recorded source playback remains
rights-gated; portraits are explicit placeholders with a caption/quote
specification, not recorded video/audio. Result restores matching immutable
bundles for a portrait/download panel and disabled Soon destinations (Facebook,
Instagram, TikTok, X). These are inert owner-requested teasers, not
publishing/OAuth integrations or a release promise. Download is disabled until
there is validated output. The owner removed the header mode badge; Privacy &
limits retains the no-file-read/upload statement and rights/scope/size rows; the
owner removed its bottom development-summary paragraph. These are the intended
product screens with a development adapter, not a separate public sample
product. Confirmation sends the immutable manifest-bound request once; there is
no intermediate export screen or Back hop. Entering/restoring review never
renders automatically. Legacy confirmation projections restore to review;
confirmation waits for validated bundles and server allowance.

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
session/upload IDs cannot complete a replacement run. Delivery sizes the
portrait inside its own grid slot, keeping Download and social actions in
separate rows when the bounded phone layout scrolls.

Privacy uses the shared 28px heading (22px on phones), 14px intro/row text and
12px numbering. One framed lower panel holds four numbered rows with thin
separators; number/title/notes columns remain on larger screens, while phone
notes sit under their title. Both dialog triggers use this same layout. The rows
explain no reuse/publishing, mode-specific temporary storage, Gemini transfer
and clearing. Upload rights/limits remain in intake. Copy distinguishes the
no-file-read fake preview from real device/private-cloud processing and
separates app cleanup from provider retention and downloaded copies.

Workspace Privacy and Clear media actions reuse the shared secondary Button.
Clear is a two-word text command, not an icon-only action. Below 480px, the
actions occupy one equal-width row below the brand; the workspace height
accounts for this taller header. The landing's navigation trigger is unchanged.
Landing/header/hero/footer and workspace reuse `shared/ui/brand-mark.tsx` for
the blue two-bar ClipBuilder mark; the workspace does not use a clapperboard as
the product logo. Landing-specific hero sizing stays in its page stylesheet.

`src/styles/tokens.css` owns shared foundations. `src/shared/ui` supplies
buttons, workflow frame and measurable/indeterminate progress. Each workflow
title uses `Step N of 3: <stage title>` instead of a separate step tracker. Used
tokens also feed the landing's foundation aliases. Feature components own sample
content; they do not own a second workflow machine. The landing and workspace
share `--cb-page-background` and CTA material tokens. The workspace scopes its
light text, blue actions, dark status colors and navy surfaces without changing
the global light defaults. Its header and 24px frame use glass;
intake/candidates use blue tints and 16px cards, while transcript and notes
panes have an opaque navy reading surface. Primary/secondary buttons share
rounded edges and inset highlights. Opaque no-blur/reduced-transparency and
native forced-color fallbacks remain. This is UI chrome; composition and
playback logic are unchanged. Fake-mode fixtures support the complete visual
journey with no keys; actual footage, AI quality, cloud delivery and final owner
approval remain separate checks documented in the CL-013 packet. Scrollbars use
one global transparent-track treatment with shared thumb tokens: 4px rounded
thumbs without arrow buttons in WebKit-compatible engines, standard thin styling
elsewhere and native scrollbars in forced colors. The WebKit path resets
standard width/color to auto so they cannot override custom rendering. The dark
privacy dialog overrides only thumb colors. Candidate thumbnail play circles are
28px decorative cues inside the whole-card button; actual player controls retain
their 44px targets. Every shared workflow player, including source video, uses
floating controls inside the frame. Desktop mouse hover shows them; leaving
hides them even when paused. Touch/pen taps reveal controls and playing idles
them after 2.2 seconds; paused touch controls remain visible. Busy states,
keyboard focus and volume/seek interaction pin controls. A full-frame named
button reveals controls without changing playback; faded actions remain keyboard
reachable. The idle timeout is owned and cancelled on state changes and unmount.
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
abortable 500ms settle before the next reducer-owned screen. A reusable
real-mode presentation eases an indeterminate activity fill toward a bound
without showing a cosmetic percentage; it is not connected to live adapters yet.
Unknown progress otherwise stays indeterminate until measurable totals exist.

The allowlisted `/api/sample/*` server route pins the loopback backend on 4000,
caps JSON at 8 KiB, forwards only the fixture cookie and cleans up its 5-second
timeout/abort listener. It is a local fixture bridge, not the future production
`/v1` proxy or upload/grant implementation.

The intended product journey is owned-conversation intake → analysis → zero to
four grounded candidates → choose exactly one → automatic clip preparation →
read-only preview and render confirmation → result/download. The frontend will
not expose an editor, chatbot, manual trim, caption or visual controls, an
editable timeline, proposals, or undo/redo.

## Product film authoring (CL-013)

The editable cinematic walkthrough lives in `src/features/product-film/`. Open
`http://localhost:3000/` to review it directly in the landing hero. It plays the
50-second, 1920×1080, 30fps composition silently, with no player controls or
click-to-pause interaction. It pauses offscreen and when the document is hidden.
The eight-second motion test remains available in Studio. The owner requested
the clean 52-second presentation with stronger angles and close-ups; the preview
has no duration picker, slide markers or production notes underneath. The owner
then removed the outer frame and its header/footer; the video itself has
rounded, clipped corners matching the site, with no extra border. During seconds
8–12 the analysis shot uses one continuous camera push with a moving light
reflection, keeping the angle steady after its entrance without a static hold or
extra cuts. The owner shortened this beat by two seconds from the original
52-second cut. The owner restored the original laptop two-column layout:
ClipBuilder, headline and description on the left, film on the right. Original
responsive type, spacing and compact-screen breakpoints are restored. At 1536px
and wider, laptops expand the hero and its column gap; the headline scales
against both viewport and column width, so it stays inside the copy column as
the video grows. Phones keep their compact copy-above-video layout with
content-sized rows and a natural hero height, eliminating the former stretched
empty area around the player. The following process section uses tighter
responsive phone spacing. The film retains its rounded edges and pacing. A
compact animated five-step flow beneath the columns summarizes upload, grounded
moments, one choice, automatic captions and visuals, and a share-ready cut.
Allocating this row brings the main hero closer to the navbar; phones use a
compact vertical sequence with natural height. The flow pauses its decorative
animation offscreen and when the document is hidden. At laptop heights of 640px
or less, its compact row keeps the sequence within the hero.

The loading image is the exact opening frame, so it keeps the same artwork and
layout as playback. The Player starts loading alongside capture validation and
autoplays silently on visits, refreshes and restored back/forward visits. The
owner removed all controls, so the film acts as an uninterrupted hero animation
and autoplay does not steal keyboard focus. Playback resumes when it returns
onscreen.

From the repository root:

```text
corepack pnpm --filter @clipbuilder/frontend film:capture <absolute-existing-chromium-executable>
corepack pnpm --filter @clipbuilder/frontend film:poster --browser-executable=<absolute-existing-chromium-executable>
corepack pnpm --filter @clipbuilder/frontend film:studio
```

The capture command first verifies the local frontend exposes fake mode with
live capabilities off. It uses an isolated browser, chooses the synthetic sample
and Moment 1, preserves the disabled download, and exits that disposable
session. It does not read environment files, real media or credentials, change
operating flags, call providers, download Chromium, or trigger a paid flow. The
existing cached headless-shell executable can be used. The normal frontend and
backend must already be running; follow the startup guides below.

Ten 1440×1000 PNG captures and a cursor/state index are written to the ignored
`public/generated/product-film/` directory. The poster command renders only a
local 960×540 JPEG at the Player's shared opening frame, into that same ignored
directory; regenerate it after changing the opening. Its command requires an
existing browser and cannot download one. It does not export an MP4. Studio runs
at `http://localhost:3002` without opening an external browser. Select
`ClipBuilderWalkthrough` or `ClipBuilderMotionTest`; both use the same scene
source. All motion follows the Remotion frame clock. Camera paths live in
`film-camera.ts`, pacing/capture references in `film-timeline.ts`, and original
vector speakers in `illustrated-conversation.tsx`. The portrait illustration
reuses the actual shared fixed caption/card components. No local AI model or
provider video-generation implementation is involved.

This is a local animatic using synthetic UI and original artwork. With
`FAKE_MODE=true` and no keys it can be authored and reviewed; it is not an
actual processed or downloadable ClipBuilder result. Authoring playback itself
does not contact the backend and can reuse this capture package in other modes.
Actual AI/output acceptance still requires provider keys, live flags, applicable
rights/data/spend/cloud approvals and the owner's manual paid test. The retained
sample and private renderer pipeline are not used by this authoring project.

The owner approved replacing the landing placeholder with this film and removing
the temporary `/motion-preview` route. The shared preview-page wrapper and old
placeholder styles were removed. Strict release verification still rejects the
local capture folder; only the local-build gate permits it. Replace those local
authoring assets with approved delivery assets at the film release checkpoint.
The current CL-015 checkpoint promotes ten approved synthetic PNGs and the
existing opening poster into hash-allowlisted `public/product-film/` delivery.
The accepted motion/layout remains unchanged; the capture index and authoring
folder stay excluded from strict cloud contexts. Future recaptures/posters need
deliberate review and an updated delivery hash manifest before release. No MP4
or audio export is added. Remotion 4.0.534 is pinned; its installed license permits
individual use/evaluation. Studio currently warns that the repository's Zod
4.6.5 differs from its optional Zod integration's 4.5.4 expectation. This film
has no Zod schema integration; existing app contracts remain pinned and
unchanged.

## Run locally

Use Node.js `^22.13.0` or `^24.0.0` and the pinned pnpm `11.19.0`. From the
repository root, install dependencies and compile the shared contracts:

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
[http://localhost:3000/start](http://localhost:3000/start) to match the
committed frontend-origin policy. Check `/start` and `/api/sample/config` return
`200`; the second GET verifies the backend bridge without starting a paid
operation. The fixture bridge pins upstream port `4000`, so a different backend
port is not a working full-stack setup. Do not accept a silent frontend port
fallback.

For a requested production-like local run, stop the frontend instance first,
then run from the repository root:

```powershell
corepack pnpm build:frontend
corepack pnpm start:frontend
```

Rebuild contracts after changes to `packages/contracts` before restarting either
app. Normal startup keeps the owner's backend configuration: its entry point
loads its app-local files as described in the backend guide. Copy
[`.env.example`](.env.example) to `apps/frontend/.env.local` for initial setup;
Next.js loads that file automatically. It currently contains comments only,
because this frontend needs no secrets. Mode comes from the backend.

For a manual stop, use Ctrl+C in the owning terminal and confirm no frontend
watcher/child or listener remains on `3000`. Restart means stop and verify
cleanup first, then run the selected launch command and verify readiness again.
Agent-managed runs use the outside-sandbox, hidden-launch, process-tree,
logging, and cleanup rules in
[AGENTS.md](../../AGENTS.md#canonical-local-app-startup). `run all` includes
both apps; `run frontend` targets this server only. The media spike is a
separate opt-in command, not another default app service.

## Release artifact inspection

`corepack pnpm build:frontend` (or the root build) runs Next standalone output
and then the explicit local artifact check. It inspects standalone, separate
static assets and optional public inputs without starting a server. Known
Windows dependency-store junctions are counted as `selfContained:false`; this
local pass is not acceptance of an immutable deployment artifact.

After an approved target-platform build, strict verification must pass:

```text
corepack pnpm --filter @clipbuilder/frontend verify:release-artifact
```

Strict verification rejects the current Windows output's 26 external package
junctions. It also rejects unexpected app routes/rewrites, feasibility harness
assets, test/private/media/env inputs, unresolved links and other external
inputs. No source-store junction may enter the final image. This command uses
only existing build files; no credential, provider, server or cloud action.
Deployed negative URL probes, final image inventory/scans and actual hosting
proof remain required and unverified. See the linked release preparation guide.

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
Private-mode denial and actual eviction/freezing remain unchecked as recorded in
CL-005. Automated and responsive viewport checks are the demo verification
scope; runtime probes reject unsupported capabilities. No temporary proof route
is part of the application.

Use prepared input or choose/drop a metadata-only video, watch simulated upload/
analysis, check initial portraits without transcript/Proceed, play one choice,
switch using portraits or arrow/Home/End keys, return to the gallery,
play/pause, switch detail tabs with arrows/Home/End, seek note timestamps and
inspect exact transcript highlights, refresh and confirm paused selection
restoration, Proceed once, refresh during build/review, use Confirm export
directly (including a rapid double-click without accidental cancellation),
inspect the disabled download/four inert social destinations and Start over.
Inspect elapsed time, advancing fake percent and 100% settle. Cancel during
upload/build/render; check safe recovery if the local service is unavailable or
its fixture session is gone. Test 320x568, 390x844, 768x1024, 1024x768,
1440x900, 1280x650 and intermediate widths; check overflow, action bounds,
keyboard arrows/Home/End, stage focus and dialog Escape/focus return and
animation interruption/cleanup. Full 200% zoom, forced colors and screen-reader
checks remain required; implemented CSS alone is not a pass. App animations
intentionally remain enabled under OS reduced-motion preferences per the owner;
this exception is not an accessibility-compliance claim.

## Configuration boundary

The opt-in CL-009 playback proof runs with
`corepack pnpm --filter @clipbuilder/frontend exec node --experimental-strip-types feasibility/edit-playback/run.mjs --assert-buffer-fix`
after shared package builds. It uses already installed Windows Chrome (or an
explicit existing `CHROMIUM_PATH`), WebCodecs/Mediabunny synthetic numbered
frames and tones, and an isolated loopback server. It compares old buffering
behavior with the production composition, checking natural completion, media
identity, spoken-word/silence cues and an inserted graphic. It forces
fake/paid-off before imports, blocks non-loopback browser requests and removes
its profile/server/media scratch. It installs nothing and makes zero AI/cloud
calls. Optional `--proof-directory=<existing directory>` saves synthetic
screenshots; `--synthetic-media=<new synthetic-edit-input.mp4 path>` saves only
the generated fixture for the renderer proof. Remove that fixture after the
paired proof.

The selected edit now uses manifest v3 and a fixed spoken-word caption preset.
Its browser trace lasts at most two minutes and emits bounded counts,
buffering/seeking summaries, drift buckets and observed visual count. It
contains no transcript, source URL or exact media clock. Real Gemini planning
requires the owner's key/live/paid approvals and manual UI action; synthetic
checks prove no real AI quality. Unsupported saved manifests require normal
recovery and a fresh owner action, never an automatic paid retry.

Browser code receives schema-validated safe mode/availability via the local
`/api/sample/config` bridge. Backend `FAKE_MODE` is the only mode authority;
real/unavailable mode never falls back to the development adapter. The frontend
`.env.local` is ignored and needs no hosted entries for local use; do not add a
second processing-mode variable. Server-only hosted routing and service identity
are prepared under CL-015, with actual deployed proof still pending. Local mode
keeps the fixed port-4000 bridge. Set `APP_ENV=preview` or `production` and the
matching blank exact-origin/audience entries only for an explicitly authorized
hosted deployment; they do not replace local owner configuration.
`BACKEND_ORIGIN`, `BACKEND_AUDIENCE`, bucket names, provider configuration,
credentials, grants, and signed capabilities are server-only and must never use
`NEXT_PUBLIC_*`.

Tests use the shared deterministic setup, force fake/paid-disabled flags, and
reject non-loopback network access. Vitest disables environment-file loading,
and inherited credentials are removed before test imports. The focused
`test:media` command uses the same Vitest setup for offline audio and
sync-access proof; it opens no testing UI/server. Neither command uses the app's
local environment file or authorizes a live flow. The owner runs paid checks
manually.
