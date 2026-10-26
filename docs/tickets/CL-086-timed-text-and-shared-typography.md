# CL-086 — Timed text layers and shared TikTok typography

Status: implemented and locally validated; owner visual/real-media/hosted
acceptance pending.
Explicitly authorized by owner 2026-10-26.

## Goal and authority

Add independent, editable text overlays to the normal clip editor in a Text tab.
The owner can write text, set clip-relative appearance/disappearance times,
position/resize it and choose typography. Captions receive every new typography
feature too. References illustrate white text with a black outline, black text
on a solid white background, and white text over a translucent dark background.
Implement a named TikTok style preset, not a new downloaded/proprietary font.

Execute this dependency-ready packet, then perform a read-only validate/fix loop.
Preserve pending CL-084 preview-first/export and CL-085 card work, owner media,
private diagnostics and existing environment. No Git mutation, cloud access,
deployment or paid/provider test is authorized. Latest owner instruction: finish
implementation, use the restart skill with normal environment loading, verify
fake mode, and only then run tests/checks. Never read ignored environment files.

Authority: root/frontend AGENTS; source of truth's CL-086 decision, CL-078 caption
corrections, CL-070 output quality, CL-084 preview/export, CL-050–054 shared editor
interaction/readiness and current CL-061 shared hosted/local release scope.
Existing shared edit contracts/compiler, frame-driven raster and Apply/Discard
provide dependencies in code. No new service, provider, font package or API.

## Product decisions

- Text is a distinct top-level setting alongside Captions, Filters, Pictures and
  Focus. Its Content / Style / Timing / Position subpanels replace one inspector
  slot. Add/select/remove multiple text layers, bounded to ten per clip, 500
  plain-text characters each. Support explicit line breaks and wrapping.
- New text starts as editable "Your text", at the current paused preview time
  for up to four seconds (clamped to clip end), in a centered upper safe-area
  box with TikTok styling. Adding/selecting seeks to its visible start; no AI or
  export. Text is visible on [startFrame,endFrame), with exact 30fps logical
  clocks and clip-relative seconds/Capture controls. Enforce nonempty text,
  finite nonnegative ordered clocks within the clip, unique IDs and count bounds.
- Shared typography: existing local fonts, size, color, alignment and presets,
  plus font weight, outline width/color, background color/opacity. TikTok starts
  white/bold with a crisp black outline; Solid background starts black on white;
  Translucent background starts white on semi-transparent dark gray. Presets
  retain position, and all shared controls exist for captions and text.
- Preserve existing caption animations/highlight controls, all word IDs and
  timestamps, old styles, saved documents and exports. Caption generation and
  payment gates are unchanged. Independent text never becomes caption words.
- Drag/resize and keyboard arrows operate in the actual scaled preview; provide
  upper/center/lower presets and numeric geometry. Captions keep their existing
  two-line box constraints; text uses its own bounded safe-area box and wraps/
  fits within it. No arbitrary HTML/CSS/font/URL or executable content.
- Shared composition draws pictures, then independent text, then captions so
  spoken captions retain their established top-layer priority. Overlapping text
  layers use stable document order. No general timeline, reordering UI or new
  text animation editor is introduced. Caption animation remains independent.
- Changes are browser drafts until the persistent footer Apply; Discard restores
  them. Saved local drafts and hosted edit contracts retain text. Preparation,
  typing, navigation and Apply do not export. Explicit export uses the same
  shared typography/layout and original-source quality path.

## File-level implementation plan

1. **Contracts** — `packages/contracts/local/text-style.ts` owns shared safe
   typography and preset defaults; `text-layers.ts` owns bounded text/geometry/
   timing contracts. Extend `editor.ts` with optional text layers and a bounded
   replacement edit operation; extend `clips.ts` overlay with optional text.
   Absent text means an empty legacy list. `edit-overlay.ts` validates text clocks
   against clip frames and compiles edits; preserve immutable base/caption data.
   Keep browser-safe dependencies and existing schema version compatibility.
2. **Edit integration** — backend `edit-clip.ts` applies text changes through the
   same revision/source binding; frontend `editor-state.ts` includes text in dirty
   comparison, operation generation and safe gesture bounds. Draft storage and
   worker job schemas already carry compiled documents; inspect for strip/empty
   gates and change only where required. Preserve resource/request bounds.
3. **Shared composition** — factor conservative text metrics/paint into focused
   composition modules reused by styled captions and timed text. Add wrapped
   static text rendering to `automatic-overlay.tsx`; `overlay-frame.ts` includes
   active text IDs in raster-cache keys, including invisible gaps/start/end.
   Export and Player consume the identical tree. Preserve legacy caption
   appearance when new fields are absent and avoid extra video renders/calls.
4. **Inspector** — shared Typography controls serve both settings. A focused Text
   inspector uses the existing ControlTabs, shared buttons/tokens and timing/
   Capture patterns. Integrate actual layer handles and selected text in
   `clip-editor.tsx`, keeping playhead changes isolated in child controls and
   pending/loading/dirty/stale guards. Add only necessary shared CSS; inspect
   five-tab wrapping, long text, empty/limit/error states and visible footer.
5. **Tests/docs** — meaningful contract/compiler/reducer/state/cache regressions,
   actual synthetic browser editing/pointer/keyboard/save/discard/reopen proof,
   and current-source native export pixels before/during/after text for all
   three new styles. Update narrow contracts/composition/frontend/backend guides,
   source of truth and ticket index with actual evidence and remaining gates.

## Acceptance and final verification

1. Text tab can add, select, edit and remove distinct layers without captions or
   keys. Timing controls and Capture show/hide at correct clip-relative frames;
   invalid/empty/out-of-range/excessive requests cannot Apply or reach renderer.
2. Both Text and Captions expose identical new typography controls and three
   presets. Changes preserve position and caption identity/timing. Solid and
   translucent backgrounds visibly differ; fill is independently opaque and
   outlined text keeps white interiors with black edges. Long/multiline text
   stays inside the safe box. Legacy saved caption styles remain compatible.
3. Pointer/touch drag/resize, keyboard geometry and position presets affect only
   the selected layer; settings changes preserve draft/playhead. Apply/Discard,
   stale revision failure, saved/reopened text and exported matching revisions
   follow existing workflow with zero new AI or implicit render dispatches.
4. Text-only overlays export even when captions/pictures are empty; transparent
   gaps do not reuse a visible text raster. Native MP4 uses the same text, clocks,
   geometry, outline/background alpha and source quality as preview. Verify
   representative generated before/start/during/end frames and actual pixels.
5. Verify desktop and 390/320px controls, long text, five top tabs, empty/selected/
   pending/invalid states, keyboard navigation, at least 44px targets, persistent
   footer and current preview readiness. Existing caption/picture/filter/focus
   integration retains functionality; no reduced-motion override.
6. **Before any checks**, rebuild current contracts/native worker as required,
   use restart skill for owned normal app stack with unchanged env loading,
   verify content-free capability mode is synthetic-ai and non-metered health/
   start/config readiness. Do not run a paid flow; if mode is real, leave paid
   actions untouched and report the mismatch before tests per owner's request.
7. After that, run focused local units, frontend/local/contracts/test typechecks,
   affected lint/format, required boundary regression and synthetic browser/
   native proofs. Native proofs build current-source overlay in owned scratch.
   Read-only validate final CL-086 diff against this packet, fix confirmed
   findings, rerun affected checks and record exact evidence. No broad unrelated
   audit or claimed paid/hosted E2E.

Fake mode/no API keys supports manual text, style editing, synthetic captions
and actual native export. Provider transcription/moment/image generation still
needs real keys, live approvals and owner action. No new local AI model/runtime
is needed or added. Agent checks use generated media/injected AI, fake/paid-off
network-blocked configuration; no real media/diagnostic content is committed.
Owner personal visual, real-media and actual hosted acceptance stay unchecked.

## Evidence

Implementation is wired through strict shared contracts, the revision-bound
backend reducer, dirty/edit operations, shared frame cache/React paint, Text
inspector, caption typography, real preview handles and saved document schema.
New regressions/proofs are written but have **not been run** pending the owner's
restart requirement. No test/type/lint command was run before the restart gate.
Formatting edits are part of implementation, not a test verdict.

Restart attempt: captured current owned supervisors/descendants, stopped frontend
then backend/internal worker, and verified released 3000/4000/4200 listeners with
two stabilization passes per target. Built public contracts with the launcher's
normal Node/Corepack path; the shell's bundled package-manager path first failed
to resolve/use the pinned manager, without changing dependencies/configuration.
Normal backend startup rebuilt the current native overlay/worker, then rejected
configuration with one Zod validation issue. Its failed tree was fully cleaned,
with zero surviving identities/listeners. No ignored environment contents were
read, printed or changed. The owner was asked to confirm/save the required fake
pair (`FAKE_MODE=true`, `PAID_DEMO_ENABLED=false`); the exact invalid field is not
available in the content-free startup log. Do not infer either configured value.

Pending: successful normal restart, capability verification of synthetic-ai,
tests/types/lint/format, actual browser/native checks and final read-only validate.
No paid/provider call, cloud action or Git mutation. Personal visual/real-media/
hosted acceptance remains owner-only.

Restart diagnosis follow-up: the owner confirmed saving both required mode
switches, but normal startup still rejected one Zod issue. The launcher has none
of FAKE_MODE/PAID_DEMO_ENABLED/NODE_ENV inherited before normal env loading.
Narrow justified deviation: executable backend startup now lists only matching
source-controlled configuration key names on Zod failure, never messages,
inputs, values or unknown paths. This preserves rejection and generic UI errors,
and makes the actual failing field diagnosable without reading ignored contents.
No test has run before the successful restart/fake gate.

### Completed local verification

The owner re-saved the exact paid-off line after the diagnostic identified
PAID_DEMO_ENABLED. Normal startup then succeeded without an agent env read/edit:
backend supervisor 19580, API 27292 on 4000, internal worker 11188 on 4200;
frontend supervisor 20012, app 22772 on 3000. `/v1/health`, `/start`, and
`/api/sample/config` returned 200; `/api/local/capabilities` reported synthetic-ai
and cloud=false **before the first test/type/lint command**. Runtime record and
content-safe logs are under OS temp `clipbuilder-run-20261026`; backend log stem
`backend-20261026-140523`, frontend `frontend-20261026-140551`.

- Focused units: 38 existing editor/state/styled-caption/cache tests plus 7 new
  text contract/reducer/render tests passed. The real local saved-draft API test
  saves/reopens translucent text with AI unavailable and verifies its native-job
  snapshot; text edits trigger no extra native/AI job.
- `test/local-text.proof.ts`: both current-source synthetic browser and native
  export cases passed. Browser covers empty/count limit, multiline edits,
  invalid content/timing, exact Capture, upper position preset, real mouse drag,
  native ArrowLeft movement, touch resize, independent removal, shared caption
  controls, pending/stale guards, Apply/Discard and reload. It asserts zero
  mutations until Apply and only two explicit edit requests, including a rejected
  stale request. The final browser-only rerun strengthened keyboard/preset and
  nonempty shared-label comparisons; it passed.
- Native: 540×960/30fps/90-frame generated output retains source dimensions,
  uses text-only overlays and actual decoded RGB checks before/start/last/end
  frames for TikTok outline, solid white and translucent dark backgrounds. All
  three native PNGs and desktop/390/320 UI captures were visually inspected;
  no horizontal overflow, visible footer and 44px inspector targets. Artifacts
  stay ignored under `.local-build/evidence/cl086-*`.
- Frontend, backend, local, test and browser-neutral local-contract TypeScript
  checks passed. Affected ESLint/Prettier and `git diff --check` passed. All 27
  existing dependency boundary checks passed. Initial concurrent ESLint setup
  exceeded its 30s hook deadline; isolated retry with a 60s setup deadline passed
  in 13.6s, with no assertion change. Early harness-only React resolution,
  injected-newline and low-resolution sample issues were corrected; they were
  not counted as passing evidence.

Read-only validate pass 1: **Meets ticket; no actionable findings** on settled
CL-086 tracked/untracked changes. Covered requirements 1–7: contracts/compiler,
actual editor path, dirty/source/revision binding, stored text, raster identity,
typography/legacy compatibility, pointer/keyboard/phone layout and cleanup.
Proof-owned browser/server/native work/scratch are cleaned; normal app remains
running in fake mode. Excluded existing CL-084/085 changes and planned CL-087.
No new dependencies, cross-app imports, remote fonts, unsafe text execution or
content logging. The startup diagnostic is the sole justified scope deviation;
its output is an allowlisted key name only. Nothing staged/committed.

Personal visual, real-media/real-provider and actual hosted acceptance remain
unchecked. Fake tests prove local mechanics/native rendering with synthetic
content, not live AI quality. CL-087 is now dependency-ready for the owner's
new title/default/stage request.

CL-087 final dependency review subsequently improved largest-fit text layout,
bounded explicit lines to ten with an actionable error, and made explicit
background overrides respect the legacy rounded-caption preset. The final
combined gate is 599 local units, 27 boundary tests and three current-source
browser/native proof cases passed, with types/lint/format and no actionable
read-only findings. See CL-087 for the exact final runtime and remaining
owner-only acceptance; this earlier evidence remains historical, not a second
independent live-provider or hosted acceptance claim.
