# CL-263 — First fully loaded editor tour

Status: implemented, owner-approved and verified, 2026-11-08; temporary refresh
replay removed. Local packaging follows the allocation below. Earlier evidence
is historical where superseded by this acceptance.
Owner explicitly requested implementation,
using Retrosum/Retailor as inspiration, enabled by default for the first fully
loaded clip editor, with design-system rectangles/dialogs and less repetition.

The owner wants an editor tour matching the tour style in their other
repositories, beginning when the first clip editor has fully loaded. Inspect
the relevant existing tour patterns before choosing the implementation; do not
invent an unrelated style or start the tour during loading/buffering/restoration.

Acceptance: reuse the app's shared design and existing
cross-repository pattern, wait for the first usable editor, keep steps anchored
to available controls on desktop/tablet/phone, preserve editing/focus/scrolling,
offer clear skip/close and avoid repeating on every edit or refresh. Define
first-visit/replay behavior in the source of truth before code. Keep errors and
footer geometry stable. Do not add provider calls to tour startup.

## Owner approval and whole-file local commit plan — 2026-11-08

The owner approves the tour, requests removal of temporary refresh replay and
authorizes file-level staging/commits of the pending work. Remove the temporary
source constant entirely, restore persisted once-only completion after refresh,
and keep explicit replay plus successful Start over re-arming. Recheck normal
refresh/clip switching, welcome/steps and reset behavior with generated/no-key
fixtures. Preserve the existing `/start` route, Codex app, ignored configuration,
saved/private media and all prior work. No push or remote action.

The initial index is empty. All 24 pending whole files are allocated exactly
once across three local commits; no hunks or unrelated files are staged.
Shared authority/index files contain both tickets and belong to the final docs
commit so the final tree records both behaviors together.

1. `CL-263: add approved first-editor tour` — 18 files:
   - `apps/frontend/README.md`
   - `apps/frontend/src/features/local-editing/clip-editor.tsx`
   - `apps/frontend/src/features/local-editing/control-tabs.tsx`
   - `apps/frontend/src/features/local-editing/editor-sections.ts`
   - `apps/frontend/src/features/local-editing/editor-tour-anchor.ts`
   - `apps/frontend/src/features/local-editing/editor-tour-layout.test.ts`
   - `apps/frontend/src/features/local-editing/editor-tour-layout.ts`
   - `apps/frontend/src/features/local-editing/editor-tour-preference.test.ts`
   - `apps/frontend/src/features/local-editing/editor-tour-preference.ts`
   - `apps/frontend/src/features/local-editing/editor-tour.module.css`
   - `apps/frontend/src/features/local-editing/editor-tour.tsx`
   - `apps/frontend/src/features/local-editing/experience.tsx`
   - `apps/frontend/src/features/local-editing/style.css`
   - `docs/tickets/CL-263-first-editor-guided-tour.md`
   - `test/local-editor-tour.proof.ts`
   - `test/local-start-over.proof.ts`
   - `test/owner-controls-browser.ts`
   - `test/owner-hook-browser-fixture.ts`
2. `CL-266: disable AI suggestions when adding manual clips` — 4 files:
   - `apps/frontend/src/features/local-editing/selection-panel.tsx`
   - `docs/tickets/CL-266-manual-clips-disable-ai-suggestions.md`
   - `test/local-timestamp-exchange.proof.ts`
   - `test/owner-demo-limits.proof.ts`
3. `CL-263-266: record approved tour and manual clip behavior` — 2 shared files:
   - `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
   - `docs/tickets/README.md`

Before each stage/commit, verify exact path allocation, unchanged verified source
bytes, staged blob equality and whitespace. Afterward verify each committed path
set and the final clean worktree/index. Report the three hashes in the final
reply. The owner approval completes CL-263's tour aesthetic gate only; it does
not assert real AI/media quality or approve deployment.

Final regression preparation also guards delayed native close events from
finishing a newly replayed open dialog. The rapid-close test waits for both
native closure and React teardown before replaying, rather than assuming the
native open attribute alone proves the prior view is gone.

Final normal-policy gate: all 12 layout/preference cases pass; the tour HTTP/
browser proof passes on the final source (89.69s), including persisted welcome
completion across refresh, explicit replay, reset re-arming, readiness and full
motion/keyboard/scroll/viewport coverage. The related reset, hosted/manual-slot
and timestamp-exchange proofs pass in the preceding 107.31s run; only the tour's
rapid-close timing check needed the documented correction and rerun. Zero
edit/unexpected/provider/render/title requests and unchanged fixture documents
remain verified. Frontend/root-test TypeScript, scoped lint of all pending code,
formatting of all 24 files and whitespace checks pass. Final read-only review
meets CL-263/CL-266 with no actionable findings; no temporary replay flag remains
in application code. The owner's tour aesthetic approval is recorded, while
real AI/media quality and deployment remain outside this local packaging.

## Adopted behavior and implementation scope

Latest owner revision: the initial guide is a centered Welcome to the editor
dialog with Start tour and Skip footer actions. It opens only after the first
editor is ready and has no control spotlight, step counter or Back/Next controls.
Start tour begins the existing preview-first walkthrough; Skip/Close/Escape
dismiss without navigation or work. Explicit replay also begins with this
welcome. Preserve the same mounted card and smooth fades into/out of the guide,
focus/scroll restoration, narrow/short viewport fit and the normal once-only
refresh behavior. Use the existing `/start` route and shared design system. Verify
centering, Start/Skip, no navigation before Start and unchanged work counts using
the existing generated/no-key proof at desktop/tablet/phone/short-phone sizes.

Welcome revision evidence: one shared card renderer now starts with a welcome
target, centered using its actual rendered size. It has no spotlight, progress
or Back/Next until Start tour; the existing fade transition then enters preview
step 1 of 11 without remounting the dialog/card. Replay uses the same welcome.
Skip before Start is verified to dismiss without changing the selected Captions
tab, editing or dispatching work. All four viewport centers (1440x900, 834x900,
390x844, 320x430), Start/Skip/replay, full step/motion/resize/keyboard/scroll and
refresh/reset gates pass in the existing browser proof (94.24s). Clip documents
remain unchanged and edit/unexpected/provider/render/title counts stay zero.
Frontend/root-test TypeScript pass. Codex-browser inspection on the existing
`/start` page confirms the welcome title, Skip / Start tour footer, no spotlight
and exactly zero horizontal/vertical center offset; inspection returned only
tour UI values and captured no real-media screenshot. Read-only review finds no
actionable issue. No new route, configuration change, processing, staging or
commit occurred during that verification. Temporary refresh replay was still
enabled then; the owner's later approval/removal above supersedes that hold.

### Historical refresh-review override — now removed

Temporary owner override, 2026-11-08: while the owner reviewed the tour,
show it automatically after every full refresh when the first editor is ready,
even if the stored seen flag exists. Keep dismissal effective for the rest of
that page load, including clip switching and editor remounts. Preserve the seen
flag and put the temporary policy behind one named source constant so normal
first-visit behavior can be restored later. Keep the existing `/start` route,
readiness/typing/dirty guards, replay, Start over reset and smooth motion. Verify
refresh -> automatic guide and no repeat in the same page with generated/no-key
checks; do not refresh or alter the owner's current clip for verification.

The temporary implementation used EDITOR_TOUR_REPLAY_ON_REFRESH set to true.
Page memory began unseen while persisted completion was retained. That constant
is now removed and the stored once-only policy is restored. Unrelated
browser fixtures explicitly mark the page seen rather than relying on storage
alone; dedicated tour checks exercise the actual temporary default.

Verification: four preference cases and both existing tour/reset browser proofs
pass (102.48s), including automatic reopening on two full reloads, no repetition
when switching/remounting within the page, held-preview readiness, reset and
motion/keyboard/scroll guards. Edit/unexpected/provider/render/title request
counts remain zero. Frontend/root-test TypeScript, scoped ESLint, Prettier and
whitespace checks pass. Read-only review: meets this temporary revision with no
actionable findings. Existing `/start` and owner clips/configuration are intact;
no new route, manual fixture address, processing, staging or commit occurred
during that historical verification. Normal policy restoration is now requested
and implemented under the approval above.

Retrosum's `features/retro/guidance.tsx`, `tour-anchor.ts`, `tour-layout.ts` and
first-ready trigger establish the settled rectangular spotlight/anchored-card
pattern. Retailor's `features/assistants/tour.tsx`, layout and target catalogue
establish declarative steps, progress, Back/Next/Skip, responsive positioning
and focus restoration. Reuse those interaction ideas with ClipBuilder's own
Button/IconButton, typography, glass surfaces, tokens and neutral inset focus.

- Start automatically after the first eligible editor's actual preview is ready
  and settled; never start over queued/preparing/exporting, failed, hidden,
  restoring, dirty, busy or focused typing states. Opening the tour pauses
  playback. Do not select a Hook, generate content, Apply or export for the tour.
- Show it once per browser origin/version, recording only a seen preference in
  browser storage when the first guide is shown. Skip/close/Escape/completion
  all dismiss it; editing, clip switching and reload do not restart it. A
  successful explicit Start over clears the preference and re-arms the guide
  for the next first fully ready editor. Failed/cancelled resets leave it seen.
  Storage failure uses a page-lifetime fallback and never blocks editing. A compact
  replay control is available when the editor is usable and clean.
- Guide preview, clip switching (where present), settings, captions, text,
  filters, pictures, audio, camera, Hook and explicit Apply/export. Navigate
  existing tabs without changing draft content or dispatching work. Restore
  prior controls, scroll and focus on dismissal. Keep tour actions in its card
  footer, independent of the application footer's geometry.
- Follow target movement/scroll/resize, including visual viewport changes.
  Rectangles match visible target geometry; cards fit desktop/tablet/phone and
  short viewports with readable scrollable copy. Missing optional targets skip;
  unavailable targets never trap the user. Native modal semantics keep keyboard
  focus in the guide while permitting Escape/Skip/Close throughout.
- Use one data catalogue and card renderer. Consolidate repeated editor section
  metadata and tab-panel wrappers while retaining existing IDs, visibility,
  control mounts, validation and editing guards. Keep cleanup bounded and avoid
  polling/state updates when the tour is inactive.

## File plan and acceptance checks

Frontend editor section metadata, tour layout/component/styles and existing
ControlTabs/ClipEditor own the change. Test fixtures explicitly seed a seen
preference for unrelated existing checks; dedicated generated cases exercise
the default-on experience. No contracts, backend, composition or worker change.
Update this packet, index, source of truth and focused frontend guidance.

Verify readiness/once-only/storage failure and viewport geometry with focused
tests; generated HTTP/browser checks must cover all steps, keyboard/Escape,
Skip/Done/replay, resize/scroll, missing targets and cleanup. Verify unchanged
clip documents and zero fake provider/edit/render requests. Inspect at desktop,
tablet, phone and short phone sizes in the Codex browser. Run frontend/root-test
TypeScript, scoped lint/format and affected existing editor regressions; finish
with a read-only validate/fix loop and record only actual evidence.

Tour mechanics work with generated FAKE_MODE=true/no-key fixtures; real AI is
unnecessary. Real clip preparation still needs configured provider/runtime,
local speech assets or API keys, live flags and applicable approvals. Preserve
normal running services, ignored configuration and all saved/private media.
No new provider inference, download, deployment, staging or commit is requested.

## Owner follow-up — Start over re-arms the tour, 2026-11-08

The owner reports that the tour did not start after Start over. The browser-wide
seen flag and its page-lifetime fallback currently survive that action. Change
successful session reset to clear only this tour preference and re-arm memory.
Do not clear it on an attempted, cancelled, blocked or failed reset, or on
ordinary reload/clip switches. Wait for the next editor's existing readiness
gate; do not start at intake or during media loading. Preserve first-use
replay, storage-failure fallback, smooth motion, media and processing guards.

Verify seen -> successful reset -> unseen at the actual HTTP/UI reset boundary,
failed/cancelled reset retaining seen, and the next generated ready editor
automatically opening its tour exactly once. Cover same-page and reload behavior
and blocked storage with no API keys/provider work. Extend the existing reset
and tour checks; run scoped types/lint/format and read-only review. Keep the
normal Codex app and pending CL-266 edits intact. No new Git action.

Owner follow-up: keep the existing `/start` route and existing reset/open flow;
do not introduce another application route or testing address for their use.
The isolated fixture used for the agent's generated-media check is closed.
Production changes remain in the current experience/preference components;
fixture handlers mirror existing API endpoints only.

### Start over implementation and verification

- The existing experience clears the tour's stored flag and in-page state only
  after accepted reset (including already-gone 404), or explicit Start new
  session from missing-session recovery. HTTP failure/conflict, pending or
  blocked work does not re-arm it. Initial first-use, ordinary reload and clip
  switching retain the once-only gate. A blocked storage removal still re-arms
  the current page without touching any other preference.
- Four preference tests pass. The existing reset/tour HTTP-browser proofs both
  pass on final source (115.52s): local/hosted reset acknowledgment and preserved
  failure/conflict/active states; same-page fresh upload and a reset followed by
  reload; actual generated preview bytes held behind HTTP keep the tour closed
  until readiness. Each next first editor opens the guide automatically; its
  subsequent reload does not repeat. Two explicit resets/two mock video opens,
  unchanged clip documents, zero edit/unexpected/provider/render/title requests.
- The frame regression exposed a paint/timer race under load. Fade clocks now
  begin after the state commit/paint frames, so target relocation waits for the
  actual opacity transition. The same full animation/resize/interruption checks
  pass. Reset-fixture maintenance follows current contextual feedback, recovery
  menu geometry and existing hosted/session/diagnostic/source-state endpoints;
  it adds no application routes or new behavior to those endpoints.
- Codex-browser inspection verifies dismiss -> Start over -> intake -> open
  generated media -> automatic first-editor tour. The generated screenshot is
  outside Git. The isolated tab, fixture process tree, scratch and helper were
  closed/removed; the normal existing `/start` and health remain 200. No owner
  media, configuration, provider setup or service lifecycle changed.
- Frontend/root-test TypeScript and scoped ESLint pass. Final read-only review
  of CL-263 reset, storage, cleanup and ready gating: **Meets ticket; no
  actionable findings**. CL-266 pending work is preserved and excluded from this
  verdict. No staging/commits. Real preparation/AI quality and owner aesthetic
  acceptance remain outside these generated/no-key checks.

## Owner follow-up — smooth transitions and selected tabs, 2026-11-08

The owner reports stutter at startup, between every step and on dismissal.
Their screenshot also requests that each section's rectangle include its
selected main tab and, for Media, the selected Pictures/Audio tab. The prior
settled-geometry checks do not establish smooth motion.

Keep the modal/card mounted through transitions, fade the old guide before
changing its target, and reveal the next guide only at its settled position.
Use the existing motion tokens; avoid a centered startup flash, a full-backdrop
flash between steps or an immediate exit before restoring the prior view.
Measure the visible selected navigation together with its control panel.
Verify actual transition frames, repeated forward/back/close actions, responsive
tab inclusion, resize/scroll, focus restoration and zero work requests with
generated/no-key fixtures. Preserve the running normal app and owner media.

### Follow-up implementation and evidence

- Keep the native dialog, presentation and card mounted. Fade the card/border
  out while filling the existing spotlight with the same scrim; relocate only
  under the uniform backdrop, then reveal the settled destination. The backdrop
  remains steady between steps. Initial entry waits for its real anchor, and
  dismissal restores the original controls/scroll before fading out the modal.
  Shared motion/easing tokens govern opacity; no blur/layout animation or
  per-step remount remains. Duplicate navigation/dismissal is bounded, including
  Escape or Close during an entry/step fade. Timers and frames are cancelled.
- Section geometry unions its clipped controls, selected main tab and immediate
  sub-tab. Audio targets the full active Media panel. Horizontal tab scrolling
  centers the selection and participates in settlement. Phone card placement
  prioritizes selected navigation; clipping ancestry refreshes across breakpoints.
- Frame sampling passes for every step across 1440x900, 834x900, 390x844 and
  320x430: persistent card identity, no visible card/mask jumps, no backdrop
  flashes, and intermediate entry/step/exit opacity frames. Selected main and
  immediate sub-tabs fit each settled spotlight. The expanded proof also passes
  active viewport changes, double Next, repeated Close while moving/entering,
  existing keyboard/focus/scroll, missing-target and once-only guards. The final
  tour/readiness pair passes (88.19s); unchanged edit documents and zero
  edit/provider/render/title requests remain verified.
- Ten layout/preference tests pass, including phone navigation priority.
  Frontend and root-test TypeScript pass. Codex-browser inspection confirms
  Media/Pictures and Media/Audio on desktop, the expanded rectangle after an
  active resize to phone, and restored Captions/focus after Close/replay.
  Generated desktop/phone screenshots remain outside Git. The temporary tab,
  viewport override, verified fixture process tree, scratch and helper files
  are cleaned up. Normal health/start/config remain 200; exposed provider is
  Codex and setup ready. No configuration, owner media or Git state was changed
  by the follow-up beyond the authorized source/documentation work.

Final follow-up gate: the tour proof passes again on the settled source (73.71s),
including a guard against geometry changing before the first reveal frame.
Scoped ESLint, frontend/root-test TypeScript, Prettier and whitespace checks pass.
Read-only validate of the current unstaged CL-263 component, geometry, styles,
fixture proof and owning docs: **Meets ticket; no actionable findings**. Entry,
navigation, exit, selected-tab bounds, interruption, cleanup and no-work guards
are covered. Owner aesthetic acceptance remains open; live media/AI quality is
outside this generated/no-key UI check.

Linked work: CL-261 reminder and CL-262 owner acceptance.

## Implementation and verification — 2026-11-08

- `editor-sections.ts` now owns navigation labels/icons and the eleven tour
  steps. ClipEditor uses that catalogue and six shared ControlPanel wrappers
  instead of separate value/label/icon tables and repeated panel attributes.
  IDs, focusability, lazy controls and validation behavior are retained. Tour
  copy reads the existing shared Hook-volume default rather than duplicating it.
- EditorTour uses one card renderer, native modal semantics and an explicit Tab
  boundary, shared Button/IconButton controls, existing glass/colour/spacing/
  motion tokens and the neutral inset focus rule. Close/Skip remain available
  while targets settle. The copy region is keyboard-focusable and scrollable.
- Automatic start waits for editable lifecycle state, real preview readiness,
  visible/clean/idle controls and no active typing. Only browser seen state is
  stored; reload/clip switching do not repeat it. Explicit replay works, and
  closing before an anchor settles also respects dismissal. Existing local
  Codex provider selection and every processing gate are unchanged.
- Anchors follow settled geometry and intersect actual overflow-clipping
  ancestors. Four backdrop panels leave one sharp rectangle; large targets may
  use their visible portion. Cards choose available space on either side of a
  short viewport and can compact around a small control without cropping it.
  Cached clipping ancestry and equality checks avoid per-frame React updates;
  listeners/timers/animation-frame work end with the tour. The seen preference
  writes at most once per page, avoiding a storage write for every step.
- Fourteen focused tests pass across layout, preference and existing readiness
  suites. Cases cover visual viewport offsets, mask area/non-overlap, tall,
  missing/offscreen and short-screen targets, default-on/seen persistence and
  blocked-storage page-lifetime fallback.
- `local-editor-tour.proof.ts` passes on the final interaction/scroll behavior
  (44.18s). It holds actual generated video bytes behind the HTTP boundary and
  verifies no tour while queued or media-loading; focused typing delays startup.
  All eleven steps pass at 1440x900, 834x900, 390x844 and 320x430, including Back,
  Done, Skip/replay, native Tab/Escape, focus return, same-origin reload and a
  second ready clip. Dirty drafts disable replay; an injected missing anchor
  remains dismissible. Rendering/unmount/remount does not restart the tour.
  A nonzero caption-inspector scroll position survives the full guide exactly.
- Both fixture clip edit documents remain byte-for-byte structurally equal;
  edit/unexpected request counts are zero, as are fake plan/image/render and
  title requests. Diagnostic transport remains separate from processing.
  Unrelated fixture checks explicitly seed the seen preference; the dedicated
  tour proof tests the actual default-on path.
- Existing editor readiness and Hook-options proofs pass together with the tour
  (70.77s). Independent Hook editing and full authenticated audio/native-export
  regressions pass together (80.15s). Frontend/root-test TypeScript, scoped
  ESLint, Prettier and diff-whitespace checks pass. No contract/composition/
  worker implementation changed, so no normal worker rebuild/reload is needed.
- Codex-browser inspection confirms all desktop steps, tablet placement, phone
  layout and a full 54px highlight around a 44px target on the short phone.
  Forward/reverse Tab wrap, keyboard-scrolled copy, Escape/focus restoration
  and no automatic repeat after reload are verified. Content-safe generated
  screenshots are retained outside Git. The temporary tab and viewport override
  are closed/reset; the fixture listener/tree and generated scratch/helpers are
  removed after verified PID/creation-time ownership checks. The first cleanup
  identity comparison exposed PowerShell's automatic date parsing; matching UTC
  instants resolved it before any termination. Normal app health/start remain
  200 and exposed provider remains Codex ready.

Confirmed issues fixed during implementation: short-screen side selection,
clipping behind frame headers, explicit keyboard wrap/focus return, and scroll
restoration after the previous panel is visible. Final generated checks pass;
no remaining actionable finding in the CL-263 read-only review. Aesthetic owner
acceptance, real physical devices and assistive-technology testing remain
unchecked. Real AI/media quality, provider/cloud/deployment and unrelated
CL-262/CL-255 acceptance were not part of this request. No new inference,
configuration changes, saved-media edits, staging or commits occurred.
