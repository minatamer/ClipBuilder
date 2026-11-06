# CL-236 — Keep the title textarea caret stable while typing

Status: Fixed and validated locally, 2026-11-06. Physical IME/touch/assistive-technology acceptance remains manual.

The owner reports that typing in Text → Content changes the insertion position
and produces unexpected text. Reproduce the actual editor behavior with generated
text, identify the focus/selection/value update that moves the caret, and correct
it without losing selected-word styling from CL-226.

CL-226 is implemented and dependency-ready. Preserve unrelated CL-225–235 work,
the normal running app, owner clips/source/edits and exports. No AI/provider
retry, ignored configuration change, Git mutation, worker reload or deployment.
Use execute/validate/fix with fake/no-key generated browser checks.

## Acceptance and allocation

- Typing several characters at the beginning/middle/end, replacing a selection,
  spaces/newlines, deletion and native undo/redo retain the intended insertion
  point and focus. Clearing/retyping remains possible.
- Switching between preview editing and Content must not steal focus, reset the
  caret, or corrupt text. Keep range color/font styling, whole-text mode and
  independent Hook/body behavior; composition must not rewrite partial input.
- Check the real component in the Codex browser and add a meaningful targeted
  regression where needed, with generated data and zero provider calls. Existing
  saved documents and runtime contracts remain compatible.
- Allocate the text inspector/selection session and editor wiring only where
  reproduced evidence requires changes; focused frontend regression evidence,
  frontend guide, this packet/index, and source-of-truth note if behavior changes.

Owner physical IME/touch/assistive-technology acceptance remains manual; generated
checks verify input mechanics without API keys, not live AI output quality.

## Confirmed reproduction and fix

In the generated real editor: plain Content typing retains its caret. After
`Edit text in preview` → Content, selecting all and typing A, B, C in separate
real input actions produced `BCA`; focus moved from `Text content` to `Edit title
in preview`. The textarea's text change temporarily invalidated the old preview
selection, unmounting its editor. Its subsequent selection event preserved
`editing: true`, remounted the preview editor and triggered its initial autofocus.

The shared frontend selection session now accepts an explicit editing-mode
handoff. Textarea focus and native selection events request `editing: false`;
preview selection still preserves its active editing mode. This ends preview
contentEditable ownership before a textarea edit, retaining the native caret
and selected-word range without changing persisted schemas, text or spans.

## Verification and final validation

Used `startHookEditorFixture()` from `test/owner-hook-browser-fixture.ts` with
the actual editor, generated video/text, fake/paid-off environment and loopback
transport. The pre-fix native-keyboard sequence reproduced `ABC` → `BCA` with
focus stolen by the preview. The same post-fix sequence produces `ABC`, caret 3,
focus in the textarea and no active preview editor. No owner clip was opened or
edited; the fixture's final counts are edits 0 / unexpected requests 0.

Further actual Codex-browser keyboard checks passed:

- Beginning/middle/end insertion, multi-character replacement, spaces/newlines,
  Backspace/Delete, clear/retype and native undo/redo retain the correct focus
  and caret. A deletion check's initial expected offset was off by one; observed
  text/caret 18 were correct and subsequent undo/redo round trips confirmed it.
- Selecting “buyers” in Content and changing only its font to Georgia and color
  to red remains reflected in preview styles. Formatting controls retain the
  selection; whole-text mode remains available. Existing typing-style boundary
  policy and text/span transformation code were not changed.
- Hook and body retain separate text. Body starts as “Original” after Hook
  editing; editing it to “Original body” does not alter Hook copy. Returning to
  preview editing still accepts input, then Content resumes typing at its caret
  with another immediate preview → Content handoff.
- Desktop 1366x900 and phone 390x844 accept the handoff. On phone, inserting
  `ABC ` at the start produces `ABC The cursor stays where I type`, caret 4,
  textarea focus and no horizontal page overflow. No layout or footer action
  was added/moved. A generated-only screenshot records the result outside Git.

The 16 existing text-range/render unit cases pass under deterministic no-network,
fake/no-key configuration. These protect existing styling contracts; the cursor
regression itself was checked with native browser input rather than a static
markup or mocked-focus assertion. Frontend type check, scoped ESLint, formatting
and whitespace pass. No composition-event/value handler or schema changed;
physical IME, touch handles and assistive technology remain manual/unverified.

Final read-only validate pass: no actionable finding in the three focus-handoff
hunks. The textarea explicitly ends preview editing before its first change;
later selections cannot reactivate it. Preview-origin selections still preserve
their mode, selected-word styling remains usable and no persisted contract,
provider/native boundary, listener or timer was added. Earlier CL-225–235 work
is preserved and excluded. Generated fixtures and browser viewport override were
closed/reset; normal frontend/API/worker owners remain 3496/20560/20400 on
3000/4000/4200. Nothing staged or committed, no ignored config or owner media
changes, no provider calls or restart. No scope deviation. This frontend fix
works with `FAKE_MODE=true` and no keys; live AI quality is unrelated and retains
its separate configured runtime/provider/live approvals.
