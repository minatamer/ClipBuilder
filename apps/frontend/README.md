# ClipBuilder frontend

The frontend is the public Next.js experience. It may import
`@clipbuilder/contracts`; it must never import backend implementation or expose
server-only configuration to browser code.

## Current responsibility

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
still renders placeholders and simulated playback, not recorded video.

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

## Commands

Run from the repository root:

```text
corepack pnpm dev:frontend
corepack pnpm build:frontend
corepack pnpm --filter @clipbuilder/frontend typecheck
corepack pnpm --filter @clipbuilder/frontend test:unit
```

The local development server binds to `127.0.0.1:3000`. Run
`corepack pnpm dev:backend` in another terminal for the workflow. Open
`http://localhost:3000/start` to match the committed frontend-origin policy.
No provider credential is required or read by this package.

## Focused manual verification

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
