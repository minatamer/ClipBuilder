# CL-048 — Switch between clip inputs and results

Status: implemented and verified. Dependency: implemented CL-047.

Owner request 2026-10-23: results must replace clip inputs through Add clips /
Your clips tabs, never append another workflow below the form. Completed clips
start selected; the owner can deselect instead of repeating selection. Record
this permanent design rule in AGENTS.md and the source of truth.

Acceptance:

- One visible selection panel at a time, using existing tab materials, keyboard
  navigation and responsive targets. Successful analysis opens Your clips, with
  results in the same slot. Inputs and choices survive tab switches without a
  request; edited inputs still invalidate stale choices. Failure/cancel preserves
  the form and requires explicit retry. Restored analysis follows the same tabs.
- Select unique result IDs automatically, manual-first, within the existing ten
  clip limit. Excess choices remain available after deselection; show the limit
  concisely when relevant. Do not auto-process or change backend/provider behavior.
- Add clips owns Find moments / Use clips in the workspace footer. Your clips
  owns Process clips there, disabled when none are selected. Closed selection and
  inactive views cannot leak actions; preserve editing/dirty/processing guards.
- Generated-media browser evidence covers fresh and restored selection, tab
  isolation, deselection/reselection, keyboard use, retained input, stale changes,
  empty/failure states and desktop/phone layout. Check bounded default selection
  with focused units, existing native editing integration, relevant types/lint/
  format/diff and read-only validate after the implementation settles.

Fake AI and these controls require no keys. All agent checks use synthetic data,
fake/paid-off configuration, no ignored env files and zero external calls. Real
media, physical-device/owner acceptance and paid/live AI remain outside proof.
No app process changes, retained-file deletion, cloud/deployment or Git mutation.

Implementation: local selection owns Add clips / Your clips tab state, unique
ARIA IDs, roving keyboard focus and one visible panel using the existing settings
tab materials. Success opens the result slot and brings its tabs into view;
restoration opens the same view. Tab switches retain fields/selections without
requests. A frontend selector chooses unique IDs manual-first within the existing
ten-clip bound. Cards show Deselect / Select and whole-clock times; selected count
and a relevant maximum keep capacity visible. Processing remains explicit.

Experience passes active result-view state separately from selected IDs so the
batch footer shows Process clips even when all clips are deselected (disabled),
while Add clips owns Find moments / Use clips. Closed panels retain the existing
editor/footer guards. Existing cancellation, validation, persistence, contracts,
provider settings and processing are unchanged. The durable view rule is recorded
in AGENTS.md and the source of truth.

Changed scope: selection panel; new `moment-selection.ts` and its tests;
experience and batch footer integration; local tab CSS; runtime capability tests;
generated-media design proof and restored editing-browser helper; feature README,
AGENTS.md, source of truth, this packet and index. Pre-existing CL-028–047 work is
excluded. No backend/API or processing-limit change was needed.

Evidence:

- **32 focused unit checks passed**, using the guarded package manager with
  `vitest run --config scripts/local-test.config.ts` for `moment-selection.test.ts`,
  `runtime-capabilities.test.tsx` and `manual-time.test.ts`: all-result defaults,
  manual-first overflow/cap, deduplication, empty results, identity propagation,
  inactive/empty footer behavior, runtime gates and prior clock/capture behavior.
- **Both synthetic browser/native proofs passed in 101.38 seconds combined**,
  using `vitest run --silent --config scripts/local-proof.config.ts` with
  `test/local-design.proof.ts` and `test/owner-batch.proof.ts`. Fresh results start
  selected and replace the form, deselection/reselection survives tabs, all-off
  disables Process, keyboard navigation has one active panel/tab stop, inputs
  survive navigation and edits invalidate stale results. Empty results, explicit
  retry after failure and manual timestamp capture/submission remain covered.
  Unchanged abort handling was inspected for cancel/form retention.
- Desktop 1440×900 and phones 390×844 / 320×568 pass containment, tab targets,
  active footer and single-panel checks. Inspected generated-only evidence at
  `.local-build/evidence/cl048-clip-tabs-{1440,390,320}.png`. Results open with tabs
  visible; the form is hidden rather than extending the result list.
- The native proof reopens a synthetic saved draft, confirms restored automatic
  selection, exercises tabs/deselection/closed footers, and completes existing
  captions/filter/picture/dirty-state editing checks. Fake transcription/selection/
  plan/image counts remain exactly **4/4/3/3** and native-call count is unchanged
  by the browser controls. Owned browser/worker/listener/scratch cleanup passes
  with zero resource survivors. Retained owner media is never used as a fixture.
- Frontend/test TypeScript, focused ESLint, Prettier and diff checks pass. The first
  proof run exposed two outdated test assumptions: footer state was read before
  the parent update, and editor-only tab counting included the new selection tabs.
  Corrected those scopes/waits without weakening assertions; final proofs pass.

Fake AI is key-free; all generated results above are synthetic and prove no live
AI quality. Real media, physical-device/owner acceptance, full suite/build and
provider/paid/cloud checks remain unverified. No ignored config read, retained-file
mutation, app process operation or Git mutation; the index is empty.

Read-only validate report:

- Requested: replace appended results with tabs and select clips automatically.
- Achieved: one active input/result view, preserved input/selection state, bounded
  automatic selection and view-specific footer actions; permanent rules recorded.
- Unverified: owner/physical-device acceptance, real media and live/paid AI.

Verdict: **Meets ticket. No actionable findings.** Reviewed this packet's unstaged
and new frontend/test/documentation changes; no commit is selected, the index is
empty, and unrelated CL-028–047 changes are excluded. Inspected the whole packet,
default selection helper and capacity/identity tests, restored/fresh/abort lifecycle,
tab keyboard/hidden state, active-view propagation and footer/dirty guards, CSS,
both browser helpers and owning docs. No new tests or implementation edits during
the review. Dependency directions and contract ownership remain intact; no new
provider dispatch, configuration, persistence or process ownership is introduced.

Coverage: **Covered** — one view, fresh/restored automatic selection, existing
capacity/deduplication, deselection/reselection, input preservation and stale
invalidation, empty/failure handling, footer/closed-editor guards, keyboard use,
three responsive sizes and permanent documentation. Cancellation retention is
covered by inspecting the unchanged abort path. **Unverified** — full suite/build,
physical devices, owner real-media acceptance and provider/paid/cloud tests.
Checks: 32 focused units, two final browser/native proofs in 101.38 seconds,
frontend/test types, focused lint/format/diff and owned-resource cleanup above.
No additional suite was run during validation; no existing gate was waived.
