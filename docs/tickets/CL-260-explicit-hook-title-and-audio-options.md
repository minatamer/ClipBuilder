# CL-260 — Explicit Hook title and audio checkboxes

Status: implemented and locally verified, 2026-11-07. Recorded before code.

The owner confirms a manual Hook adding no audio is desirable, and requests two
checkboxes in Hook: one to generate a title and one to add Hook audio. Preserve
CL-259's 100% new gain, short/long recording durations and synchronized cut.
This revision supersedes implicit title generation and suggestion-added audio.

## Intended behavior and acceptance

- Show two shared-design checkboxes in Hook: Generate title / Add Hook audio.
  New manual Hooks default to neither option. Choosing suggested or manual
  timing follows these explicit choices, with no hidden AI/music addition.
- Title generation is an editor-session opt-in, initially off; mounting/reload
  never starts inference. Checking it for a complete Hook requests the normal
  matching, emphasized title and enables future range updates while selected.
  Uncheck or Cancel aborts pending work, ignores late replies and keeps existing
  title content. Preserve request bounds, caching, explicit Retry, stale/typing
  guards, contextual failure feedback and Apply guards. Unavailable title
  generation is explained locally; provider/runtime prerequisites stay enforced.
- Audio reflects the managed Hook cue. Check to add one at 100%, choosing a
  covering short/long recording and its bounded default length; uncheck removes
  only that managed cue, keeping the Hook window and independent audio. Existing
  saved managed cues appear checked without changing saved data or dispatching
  work. Media recording choice/removal and Hook checkbox remain consistent.
- Choices can be made before adding/using a Hook. Incomplete ranges retain exact
  typed/captured endpoints, no requests or incomplete persistence. Unchecking
  audio restores the existing ten-second manual range limit. Apply/Discard and
  reload preserve actual title/audio content; the title opt-in itself is not a
  persisted render/media setting. Discard resets that session opt-in.
- Compact, wrapping layout at laptop/tablet/phone widths, stable local feedback,
  accessible labels/focus and no page-top errors or footer/layout jumps.
- Generated no-key HTTP/browser tests cover both independent choices, default
  manual/suggested behavior, real fake request counts, abort/late response,
  recording clocks/gain, preservation, Apply/Discard/reload and responsive UI.

## Whole-file plan and gates

Extend frontend HookControls/ClipEditor, reuse Hook edit/title request helpers,
shared controls/feedback and existing recording catalogue. Add narrow regression
coverage and update affected generated Hook/title/audio proofs for explicit opt-in.
Update the source of truth, ticket and index. Dependencies CL-249/259 are present;
preserve unrelated pending CL-247–258 work. No contracts, backend/provider or
native composition changes are planned. No subagents or Git mutation.

FAKE_MODE=true/no-key fixtures verify option mechanics with simulated titles.
Existing recordings are API-free and need no AI model. Actual title generation
requires prepared words and the configured Codex account/runtime or provider
key, live flags and approvals; live editorial quality is owner acceptance.
Do not run real AI, owner clip edits, downloads, configuration changes, cloud or
deployment. Preserve normal services and all source/base/edits/exports.

## Verification

- HookControls uses the shared `check` class, wrapping inline labels and reserved
  local availability feedback. Title and audio controls remain independent,
  including while a title request is pending. Incomplete ranges cannot start
  work; unchecking audio can complete an otherwise valid longer manual draft.
- ClipEditor starts title opt-in off, follows explicit choices on manual and
  suggested creation, preserves saved managed-cue state, and reuses the existing
  request cancellation/cache/typing guards. Cancel/Discard clears title opt-in;
  Media recording choice remains synchronized with the audio checkbox.
- 27 focused fake/no-key cases pass across Hook edit, range, controls and title
  planner/HTTP request integration. Managed-cue removal retains range, original
  gain and independent audio, without mutating the prior document.
- Generated `test/local-hook-options.proof.ts` exercises two preferences before
  Hook creation, unselected suggested/manual behavior, four actual fake HTTP
  title requests (three aborted, one controlled successful title), five Apply
  acknowledgements, cancellation, independent 100% audio, edited 47% saved gain,
  Remove/Discard/reload, and provisional ranges. Its generated later excerpt was
  given matching generated words/captions after the first fixture correctly
  rejected title planning for an empty transcript window; production gating was
  preserved. Final proof passes in 15.9s: checkbox input/text centers align on
  one row, targets remain at least 44px, wrapping contains both choices and the
  footer stays inside the viewport at 1440/834/390/320px. Unchecking audio during
  a pending title leaves the independent title task running.
- Updated `test/local-hook-audio.proof.ts` explicitly opts into sound before
  exercising CL-259 clocks/gain/source bounds and passes. The existing full fake
  audio/native export and independent Hook editor proofs also pass together
  (85.3s); assertions remain intact, only audio opt-in was added to the driver.
- Codex browser review confirms both checkboxes start unchecked for a manual
  Hook, with inline labels, the existing timestamps/Capture and local actions.
  The initial render exposed a generic form-grid selector stacking labels; using
  the existing shared checkbox class corrected it. Final screenshot retained
  outside Git. Generated fixture/helper and browser tab closed, owner app and
  saved media preserved.
- Frontend and root-test TypeScript plus scoped ESLint pass. Shared contracts,
  backend/provider and native composition/worker code are unchanged; no normal
  service reload is needed. Formatting and diff whitespace checks pass. Final
  read-only CL-260 validate review finds no actionable issue: event-only dispatch,
  cancellation/late-result guards, independent content/cue ownership, capacity,
  local draft bounds, feedback/focus and request/fixture cleanup are covered.
  Prior CL-247–259 work is preserved and excluded from this feature verdict.
  Nothing staged or committed. No real model/provider calls, owner clip edits, ignored
  configuration, downloads, Git mutation, cloud or deployment occurred.

Remaining acceptance: real title editorial quality needs the normal configured
runtime/account or provider key, enabled live flags and approvals. Physical
devices, screen readers and hosted release are owner-only. Fake/generated proofs
establish mechanics, not real AI output quality. Scope deviation: none.
