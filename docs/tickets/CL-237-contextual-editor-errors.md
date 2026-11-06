# CL-237 — Show errors beside their owning controls

Status: Implemented and validated locally, 2026-11-06. Personal/device/assistive-technology acceptance remains manual.

The owner rejects the page-top validation banner when clearing title text.
Show a very brief message beside/inside the Text field or beside its Text icon.
Permanent rule: errors belong at the relevant field, section or action, never
at the top of a page/editor. Record this in the source of truth and AGENTS.

Dependencies CL-226/236 are implemented. Preserve earlier CL-225–236 work,
owner clips/source/edits/exports and the healthy normal app. Use execute/validate
with generated/fake/no-key checks; no AI/provider retry, ignored configuration,
worker reload, Git mutation or deployment.

## Scope and acceptance

- Remove the editor's top validation/error banners. Title content errors appear
  beside its Text label, are brief, associated with the textarea and clear after
  correction. Preserve caret/focus, draft input, native editing and Apply guards.
- Make invalid content discoverable through a compact indication beside the
  affected settings/sub-tab, including a non-selected layer/occurrence. Existing
  word-styling failures belong in their corresponding inspector controls.
- Route remaining editor validation to its owning section; stale/apply/action
  feedback belongs beside the relevant actions. Do not hide errors or relax
  validation to remove a banner. Preserve the footer's primary action and layout.
- Keep the permanent placement rule broader than this editor fix. Existing
  messages inside their own acquisition/selection workflow are distinct from
  this page-top editor validator; do not claim a whole-site message audit.
- Verify generated empty/malformed/too-many-lines text, correction, word styling,
  hidden section discoverability and desktop/phone geometry in the Codex browser.
  No owner media or real processing is required.

Allocate the frontend text validation/presentation, shared ControlTabs issue
indicator, clip-editor routing and narrow CSS, meaningful focused tests, existing
generated fixture when needed, frontend guide, AGENTS, source of truth and this
packet/index. Contracts, backend and native composition remain unchanged.

Personal/physical device and assistive-technology acceptance remain manual.
This UI behavior works with `FAKE_MODE=true` and no API keys; real AI output
quality retains separate configured provider/runtime/live approvals.

## Implementation and evidence

Added a frontend-only text-validation presenter over existing contracts. Empty,
overlong, excessive-line and non-plain text produce short messages beside the
Text label. Textarea errors have stable IDs, `aria-invalid` and descriptions;
correction clears them without rewriting input. Timing feedback stays in Timing,
and word/style feedback stays with its inspector controls. Shared ControlTabs
supports an optional compact issue icon/description without changing its tab
name, keyboard behavior or selection semantics.

The editor no longer renders top validation/stale/operation banners. Existing
contract issue paths route non-text validation into their owning section.
Invalid text in either occurrence marks Text, and selecting that tab reveals
the affected layer and Content/Timing/Style controls. Apply validation remains
unchanged; action feedback is in the footer and stale feedback is beside Reload.
No additional proceed action or provider call is introduced. This is the current
editor correction, not a claim to have audited every older workflow message.

- 22 focused cases pass: 11 new contextual-validation/markup cases and 11
  existing text-render/style cases. Coverage includes empty/whitespace/control
  characters, bounds/lines/Unicode, timing and style routing, unchanged data,
  textarea associations/correction, tab names/descriptions and no-layer state.
  Type checking caught a nullable-feedback guard during implementation; it was
  corrected and the empty-layer regression verifies that branch.
- Frontend type check, scoped ESLint, formatting and whitespace pass. Final
  read-only validation finds no actionable issue in the ticket-owned changes;
  earlier CL-225–236 work is preserved and excluded. No contract/backend/native
  composition change or normal worker restart is required.
- Codex browser used the actual editor with generated fixtures, fake/paid-off
  setup and loopback transport. At 1366x900, clearing Text shows “Enter text.”
  inside the field label, no banner padding and zero editor-top banners. Apply
  remains disabled; correcting text removes the error and re-enables Apply.
- Eleven-line input shows only “Max 10 lines.” Navigating away retains the Text
  warning, and clicking Text reveals the original unmodified 11-line draft.
  A bad End shows “Set a valid start and end.” inside Timing, with no top banner.
  Removing the last Hook text remains usable. Preview → Content entry still
  types ABC in order, caret 3, with textarea focus (CL-236 regression).
- Phone 390x844 keeps the message inside the Text label, approximately 5px above
  the textarea, with no horizontal overflow, no top banner and retained focus.
  A generated-only screenshot records the compact desktop result outside Git.
  Footer actions remain in their original slot. Other action/stale failure states
  were reviewed in code rather than triggered through owner processing.
- Generated fixture listeners/scratch and temporary viewport override were
  closed/reset. Final fixture counters: edits 0 / unexpected requests 0. Normal
  owners remain frontend 3496, API 20560 and worker 20400 on 3000/4000/4200;
  health, `/start` and config return 200. Owner media/drafts remain untouched.

The requested preference is permanently recorded in AGENTS and the source of
truth. No staging/commits, ignored configuration changes, real AI retries,
downloads or deployment occurred. Fake/no-key checks establish UI mechanics,
not real AI quality or physical assistive-technology behavior. No scope deviation.
