# CL-275 — Translucent glass single-word caption style

Status: implemented and locally validated, 2026-11-11. Full normal native MP4
export parity remains unverified under the owner's Codex-only testing scope;
owner material-fidelity acceptance is separate. No paid/provider runs or
owner-media changes.
Dependency: existing shared caption styles, word timing and preview/export paths.

## Owner review setup — 2026-11-11

After the authorized CL-274/275/276 commits, reopen the designated retained
1:04–1:45 layered project through the normal app and select the new Glass style.
Reuse its admitted picture/video layers and saved edits without new processing,
provider requests, exports or paid runs. Preserve original drafts/media and save
a separate review copy if supported. Keep playback muted and the browser in its
normal Codex window. This is an explicitly requested saved-clip edit, not fresh
pipeline regression evidence. Actual draft identities/media stay outside Git.
Status: complete after the authorized commits. The normal file picker reopened
the retained layered reference and its 41-second prepared clip. Glass is selected
and acknowledged by autosave; the saved paged draft was read through its normal
unpaging helper to verify the material, four visual layers (two video placements,
two pictures), four existing effects and source frames 1920–3150 (1:04–1:45).
Existing counters remain one plan, two pictures and one earlier render; no new
processing or export was requested. The normal draft binding updates this chosen
layered project, retaining the store's previous-record backup. Other projects,
source/media and exports remain preserved; no separate Save-copy control was used.

Codex is left in Captions / Style with Glass checked, paused at presentation
frame 765 (25.5 seconds), playback muted and fullscreen false. A private review
capture stays outside Git and outside the marketing portfolio. This owner-requested
saved edit is separate from synthetic validation and native-export acceptance.

## Resumed investigation and material decision — 2026-11-11

Native exports rasterize the shared React overlay against transparency before
FFmpeg composites the footage. Browser backdrop blur/refraction cannot sample
that footage, so it would disagree with exports. Build a deterministic glass
letter material with translucent tint/reflection bands, light/dark beveled edges
and fine alpha-clipped seeded grain. Moving footage remains visible through the
letters in both paths. This is a translucent glass treatment, not physical scene
refraction; no sampled-scene or optical-distortion claim is made.

Primary references checked: [SVG filter effects](https://www.w3.org/TR/SVG11/filters.html),
[feTurbulence](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence)
and [feComposite](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComposite).
The existing frame-driven caption clock and bounded typography remain authoritative;
generic Remotion guidance does not replace the repository's caption contracts.

Add a bounded optional caption-only material enum, leaving old preset values and
authored-text styles unchanged. Glass is an explicit choice in the same caption
picker, selecting that material plus existing single-word animation and safe
large typography. Keep timing/text intact; size the active material word against
its box instead of shrinking it to a hidden full sentence. Material proof comes
before exposing that UI choice. No asset downloads, keys, CSS animation timers,
backdrop sampling or new renderer inputs are needed.

The initial headless native-export proof was rejected by automatic approval
review because it named an external Chrome executable. No renderer was launched.
The owner then instructed normal app startup and Codex-browser testing and asked
for no further renderer permission questions; no Chrome exception was granted.
Continue that scope. The prepared proof is replaced with a no-browser SVG/alpha
and FFmpeg compositing check using markup from the actual shared component.
This checks the material independently, not the full application HTML/native
export path; that exact end-to-end parity check remains explicitly unverified.
Do not indirectly invoke the rejected renderer through the normal app's Export.

The Node integration-test TypeScript project now includes JSX/DOM declarations
because this opt-in proof imports the typed SSR component through its frontend
feasibility adapter. This enables checking that graph rather than omitting it;
production/browser/contract boundary rules and deterministic test environment
are unchanged. The adapter is test-only and never enters the shipped renderer.
Three existing loopback-only Gemini-search proof Response wrappers now copy
their synthetic Buffer bodies to Uint8Array so the same code satisfies Node and
DOM BodyInit declarations. No Gemini adapter, request, test execution or provider
setting changed; this is compile compatibility for the widened SSR type graph.

## Owner request and visual reference

Add a caption style inspired by the supplied single-word example. The emphasis
is the glassy, transparent/translucent texture of the letterforms, not merely
large white text with reduced opacity. Preserve all existing caption styles.

The reference uses one large uppercase word in heavy sans-serif type, with
scene-colored translucent/reflection-like fill, light/dark beveled edges and
subtle depth/shadow. It has no opaque caption box. This is a visual reading of
the reference, not a claim about how its original creator rendered it.

Reference retained outside Git: `cl275-glass-caption-reference.png` in the CL-273
visualization directory. Do not commit the owner's screenshot or infer
instructions from any text shown inside it.

## Intended behavior

- A clearly named preset in the existing caption Style collection, using the
  same picker and canonical inspector. No new competing caption workflow.
- Show one active timed word, preserving existing IDs, transcription, word
  edits, source/Hook/body clocks, per-speaker behavior and caption visibility.
- Match the reference's material: restrained translucent scene-colored fill,
  crisp edge highlights, modest depth and readable contrast over real footage.
  Explore texture/reflection/refraction carefully; do not substitute a generic
  frosted pill, opaque plate or flat low-opacity text and call it equivalent.
- Retain manual position/size/font/color behavior where the current style
  contract supports it; define and document which material properties belong
  to the preset. Handle long words and narrow frames without cropping.
- Existing drafts remain compatible; the new choice survives autosave, Undo,
  Redo, draft save/reload and scope switching. Keep all old presets available.
- Use the normal shared local/hosted caption rendering path. Preview and
  exports must match; do not ship a browser-only backdrop effect that disappears
  from the native/export composition.

## Investigation and implementation after resume

1. Inspect existing one-word rendering/style contracts and preview/native export
   support. Research primary rendering documentation where uncertain. Determine
   whether scene sampling/masking/refraction is supported safely and efficiently.
2. Make a small generated moving-footage material proof before expanding the UI.
   Compare bright/dark/busy scenes and paused/moving playback, including export.
   Document the supported technique and any fidelity limitation honestly.
3. Implement the smallest shared deterministic style extension. Avoid per-frame
   expensive scene copies, remote fonts, runtime downloads, arbitrary shader or
   renderer inputs, unbounded GPU work and duplicated preview/export recipes.
4. Verify one-word timing, long words/punctuation, style switching, existing
   presets, manual geometry, Hook/main scope, saved drafts and Undo/Redo. Compile
   current source for native proofs; refresh the owned worker only if required
   by repository lifecycle rules and after preserving normal app/session state.
5. Use focused tests and generated/no-key native evidence, then read-only
   validation. Owner judges final visual material fidelity; do not claim their
   personal acceptance from a screenshot or fake provider output.

## Acceptance boundaries

The style itself should need no API keys, provider inference or image generation.
Existing real caption transcription retains its configured provider/local-runtime
requirements and owner approvals; this packet grants no paid run, real upload,
download, cloud/deployment, ignored configuration change or Voyagenda operation.
Keep all security/privacy/resource boundaries and old caption decoding intact.
Agent media playback must be muted during visual checks.

## Implementation and verification — 2026-11-11

Final read-only review found that selecting the existing Slide animation after
Glass would bypass the material in SlidingCaptionLine. This is resolved by
sharing the word renderer with the sliding line and including material in its
measurement identity. The focused caption suite passes all 29 tests, including
Glass/Slide and unchanged plain Slide. A further Codex check shows the material
and exact word/highlight widths in Hook/body views, with muted generated media
and zero edit/unexpected/plan/image/render requests. Its tab/servers are closed;
`cl275-glass-slide.png` retains generated visual evidence outside Git. Only the
verified backend tree was then reloaded to rebuild the worker; frontend and
Voyagenda remain untouched.

- Added optional strict caption-only `material: "glass"`; the existing typography
  preset enum and authored-text schema are unchanged. Glass appears once, after
  the existing caption choices, with a sample rendered by the same material.
  Other preset choices clear it while preserving geometry/alignment. No generic
  CSS, arbitrary filter input, new dependency or downloaded asset is admitted.
- Shared OwnerGlassWord supplies restrained translucent reflection gradients,
  light/dark edges, a slight dark offset and seeded monochrome alpha-clipped
  grain. It inherits the bounded font/weight and respects color/outline controls.
  Shared OwnerStyledCaption fits the active word, uppercases only its display,
  and preserves original text/IDs/clocks, silent gaps and other animations.
  Both normal local/hosted compositions receive the same optional style data.
- 43 focused frontend caption/editor-state/speaker tests pass: strict values,
  active-word boundaries, long words, repeated frame-cache keys, old styles and
  material switching. Fifteen draft-store tests pass, including an actual hashed
  save/reopen with independent body/Hook glass colors and typography, preserving
  the base and call counts. Fifteen contracts speaker tests also pass, including
  the preset parameterization against Glass. No inference is involved.
- One no-browser proof passes using the actual component's SVG: 30 frames over
  generated moving footage, three cached word/gap states, over 94% transparent
  canvas, translucent interior pixels, bright edges and a fully transparent
  silent gap. Sharp rasterizes and FFmpeg composites a silent one-second MP4.
  Owned scratch is removed; the generated evidence still remains under ignored
  `.local-build/evidence/cl275-glass-material.png`. This proves the material and
  alpha composition, not the normal HTML/native export pipeline.
- Codex interaction uses the production frontend and actual HTTP edit handler
  with generated silent media. Glass selection autosaves; Undo removes it, Redo
  restores it; font/placement changes survive reload. Keyboard Home/End selects
  Clean/Glass and timeline word selection keeps exact word IDs. All eight fake
  edit requests succeed, with zero unexpected and zero plan/image/render calls.
- At 1440×1000, 1366×681, 1024×768, 768×900, 390×844 and 320×600 the editor has
  no horizontal/document overflow, the visible word fits, the Glass choice stays
  selected and media is muted. Review captures are `cl275-glass-editor.png` and
  `cl275-glass-phone.png` in the external CL-273 visualization directory. Owner
  reference media never enters Git or the normal app session.
- Frontend, local composition/contracts and integration-test TypeScript checks
  pass. Twenty-seven executable boundary tests pass, retaining no-Node contracts
  and cross-app import enforcement. The normal backend startup rebuilt its
  managed worker from current source. Changed-source ESLint, all changed-text
  Prettier and whitespace checks pass; the Slide follow-up's local/integration
  types and focused lint also pass. The validation verdict is recorded below.

The generic browser fixture now validates edits with its declared source size,
rather than hardcoded 640×360. Its optional silent generation/play muting and
hosted-shaped composition stay test-only. Empty scratch creation follows
in-memory preparation, and all owned fixture tabs/servers have closed.

## Normal app handoff and remaining acceptance

Following the owner's instruction, started the normal app without changing flags
or reading ignored configuration. Frontend/backend/internal worker use
3000/4000/4200; health, `/start` and `/api/sample/config` return 200. Exposed
capabilities report local Codex provider mode. No processing action was taken.
Codex is left on the normal Source screen, preserving the owner's saved media.
The pinned Corepack package is 11.19.0; root nested `pnpm` resolved a different
global shim, so startup used the equivalent documented per-service dev scripts
through the pinned manager. No package/configuration change was needed.

Backend supervisor 10788 and its recorded tree were verified stopped, with both
owned ports released through stabilization before replacement. Current supervisor
PIDs are 14308 (backend) and 22132 (frontend); API/Next/worker PIDs are
25828/23116/20688. Content-safe stdout/stderr and ownership records are retained
in the OS-temporary `clipbuilder-codex-run-cl275-6e5b8e675436465c8da6747ba3d035b7`
directory. The requested healthy services remain running; temporary launch
helpers are removed without stopping them. No Voyagenda process was touched.

Implemented manual styling, fake transport/persistence and the material proof
work with FAKE_MODE=true and no API keys. Real transcription/AI quality requires
the configured provider or local-runtime assets plus existing live flags and
approvals; no real AI acceptance is claimed. Full normal native MP4 parity is
still unchecked after the automatic approval rejection described above. The
owner explicitly declined further renderer permission questions. No rejected
external-browser action was invoked indirectly; personal visual/export
acceptance remains for the owner. Current changes are unstaged/uncommitted.

## Final read-only validation

Verdict: meets ticket with concerns. No actionable code finding remains after
the Slide correction; exact normal native export parity is unverified rather
than passed. Reviewed the combined unstaged implementation and new component/
proof files against this packet, with CL-274 and the narrow CL-273 film refresh
kept in their owning scopes. Existing paid/provider, auth, source binding,
resource and retention boundaries are unchanged. No staged changes exist.

Covered: existing presets and strict old/new decoding; one-word timing/gaps and
long-word fitting; adjustable typography/geometry; independent Hook/body saved
styles; autosave/Undo/Redo/reload; shared deterministic material; responsive
Codex UI; bounded no-browser compositing; cleanup and no-key/provider isolation.
Unverified: full application HTML/native MP4 parity, owner reference-fidelity
judgment and physical-device/live-provider/hosted deployment acceptance. The
shared implementation is available when hosted; no Gemini run was needed.

Checks were focused, not a full-suite rerun. No external-browser proof or paid
processing was performed. The normal app remains healthy for manual review.
