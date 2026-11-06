# CL-241 — Keep feedback from reflowing controls

Status: Complete locally, 2026-11-06. Physical-device/AT and hosted acceptance
remain manual. Depends on locally implemented CL-237/238.

Owner screenshots show an invalid manual End squeezing Start/End fields,
wrapping Capture/Jump actions and moving Remove. Fix the shared cause and audit
feedback throughout the app. Keep messages beside the affected field/action;
never restore page-top banners. Preserve input/caret, capture, validation and
submission guards. This is a general UI fix, not an edit to the owner's clip.

## Acceptance and allocation

- Manual duration and invalid-range feedback occupy the same stable full-width
  slot. Start/End, Capture/Jump and Remove keep their geometry when validation
  appears, changes or clears at desktop, tablet and phone widths.
- Shared feedback cannot compete with controls as a flex/grid column. Reserve
  appropriate local message space for interactive validation/action feedback;
  audit conditional/non-shared errors, footers, dialogs and compact field labels.
  Long feedback stays readable and contained without page overflow or overlap.
- Preserve concise contextual placement, accessible associations/announcements,
  inputs/focus, keyboard correction, bounded scrolling and shared design tokens.
  Whole-view/media failure replacements and ordinary progress are distinct from
  field validation; do not add unnecessary empty workflow sections.
- Verify generated valid/error/corrected geometry with actual app components at
  desktop/tablet/phone and focused fake/no-key regression checks, types/lint and
  formatting. Run read-only validate/fix and record exact coverage/limits.

Allocate shared feedback primitive/styles, owning frontend feedback layouts and
minimal render changes, generated browser regression fixture, source of truth,
frontend guide, instructions/ticket/index. Preserve all CL-225–240 work and the
running app. No backend/contracts/native/provider change, real AI/ASR/download,
ignored configuration, owner source/edit/export mutation, Git action, cloud or
deployment. This fix works with FAKE_MODE=true and no API keys; real processing
retains its configured runtime/provider, live flags and applicable approvals.

## Cause and implementation

The successful manual duration was a paragraph with `flex-basis:100%`, but its
error replacement was a span without that flex rule. The old corrective
`grid-column` rule did nothing in this flex row, so the error competed with
Start/End/Remove and wrapped the endpoint actions. Both outcomes now share one
stable `InlineFeedback` host. Shared feedback spans a complete flex/grid row,
reserves two compact lines by default and uses inline-size containment so text
cannot widen its owner's intrinsic size. Empty slots are hidden from assistive
technology and have no live announcement role. Explicit inline placement keeps
title feedback beside its label. Long text remains readable in its own row;
it can expand that message row without squeezing the controls above it.

The app-wide audit/corrections are:

| Surface | Stable behavior |
| --- | --- |
| Manual/analysis/AI and intake fields | Shared full-width feedback; download-range validation retains its host instead of conditionally inserting it. Capture/Jump, endpoint clocks, limits and submission guards are unchanged. |
| Text, typography and caption words | Content/timing/position feedback uses shared slots. Main/sub-tab markers are positioned without changing button width. Typography keeps its general-feedback allocation while suppressing duplicate numeric messages accessibly. Empty text picker summaries keep one line; caption input sizing uses the original word instead of shrinking to an empty draft. |
| Rename | One reserved local name-feedback host keeps dialog/input/Save/Cancel geometry stable. Existing focus return, length validation and metadata transport remain. |
| Hook title status/failure | Loading/unavailable/failure copy shares one feedback slot, preventing a loading-to-error height change. Existing automatic-title calls, cancellation and Apply guards are unchanged. |
| Clip/editor/reset actions | Text-only failures anchor above their relevant footer actions and remain viewport-bounded. Reset options/keyboard behavior is retained. Stale feedback shares the action callout; no blank stale row changes Apply/Discard footer height or preview/inspector dimensions. |
| Audio, filters, Focus/Motion and shared timing | Their existing shared feedback inherits the stable sizing; error copy cannot occupy a control column. No inference, timing, tracking or rendering logic changes. |
| Demo bounds | Existing dismiss/expiry/animation retained in an anchored local callout, outside controls' sizing flow. |
| Framework, media and whole-view failures | Existing failed-content replacements remain in their bounded content slots. They are not field validation and do not regain a page-top banner. |

The source of truth and AGENTS record the permanent rule. The frontend guide
records the shared behavior. Pre-existing CL-225–240 work is preserved; no
backend, contracts, composition or native-worker change belongs to this packet.

## Verification and review

- Final focused fake/no-key gate: 38 cases in contextual feedback (15), Text
  validation (11), text layers (11) and caption speakers (1), all passed. Empty
  feedback has no announcement, supplied text escapes correctly, associations
  remain and direct reset errors cannot expose an unauthorized discard action.
  The added JSX test's React children typing was corrected; its 15-case file and
  frontend typecheck then passed. Scoped ESLint and root local types pass.
- A separate generated form fixture uses actual selection, typography, Text,
  caption, rename, reset and footer components with fake loopback responses.
  Its initial synthetic callbacks were unstable and repeatedly requested the
  fake analysis endpoint; stable callbacks and the normal null analysis response
  corrected the fixture before final acceptance. No provider/server operation
  or owner clip was involved. The settled fixture recorded three analysis GETs.
- Codex-browser geometry checks at 1280×900, 768×1024 and 390×844 show identical
  manual field/action coordinates and row height through valid/error/corrected
  ranges, with no horizontal overflow. Typography, focused title input/tab,
  caption word input and rename error checks retain their controls' geometry.
  Focus/caret and correction remain usable. A 317-character stress message stays
  readable/unclipped and does not squeeze or move its owning inputs/actions.
- The real generated full-editor fixture injects HTTP 503 for export. With its
  preview settled, failure leaves footer buttons and preview bounds identical at
  desktop/tablet/phone sizes. It exposed a narrow callout extending beyond the
  card and a dirty-mode feedback row resizing the preview; both were corrected.
  Final phone callout bounds are inside the viewport. The final current-source
  editor also keeps actual caption-style controls fixed when font size is empty;
  Discard restores normal actions without applying an edit.
- Initial comparisons during preview loading or focus-driven scrolling were
  discarded as unsettled observations. Final comparisons wait for the playable
  editing surface and focus the field/action before measuring; they distinguish
  normal focus scrolling from actual layout reflow.
- Final full-editor fixture: edits 0, unexpected requests 0, one injected export
  failure. Earlier editor fixtures also closed with edits/unexpected requests 0.
  All generated tabs, fixture servers, media/build scratch and temporary helpers
  were closed/cleaned, viewport override reset. The generated screenshot remains
  outside Git as `cl241-stable-manual-error.png`.
- Scoped formatting and `git diff --check` pass. Read-only validation reviewed
  the settled CL-241 frontend/fixture/documentation scope, including sizing,
  hidden/live roles, errors' owners, provider isolation, focus/guard preservation,
  conditional hosts, narrow bounds and cleanup. No actionable findings remain.
  Normal health, `/start` and sample config remain 200 with unchanged frontend,
  backend and worker ownership; no normal restart was needed for this UI change.

This works with FAKE_MODE=true and no API keys, including generated error-path
checks. No regeneration is needed to use the UI fix. Real AI/transcription quality
is unrelated and still requires the configured runtime/provider, live flags and
approvals. Physical screen-reader/touch, unusual fonts/zoom and real hosted
acceptance remain manual; generated checks are separate from live-provider
quality. No owner source/base/edit/export, ignored
configuration, provider spend/retry, Git staging/commit/push, cloud or deployment
was changed. Scope deviations: none.
