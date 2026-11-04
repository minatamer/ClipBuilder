# CL-215 — Jump to manual clip timestamp endpoints

Status: Complete locally, 2026-11-04. Dependencies: CL-207/214 implemented.

The owner wants Jump to beside the manual Start/End fields to revisit earlier
typed or imported clips before Use clips. Add a navigation action for both
endpoints using the existing shared Button and source-preview onJumpTo callback.
Pair it with Capture, preserving timestamp values, exact imported milliseconds,
original-source offsets, source bounds, provider isolation and explicit work.
It seeks/plays through existing preview behavior and starts no AI/native task.

Invalid, unavailable-preview and busy actions cannot seek or change rows.
Map original time to local preview time exactly once. End at physical EOF uses
the final playable logical frame instead of an out-of-bounds seek. Other valid
endpoints navigate to their exact times. Do not require the other endpoint to
be valid merely to inspect a valid timestamp. Keep Capture unchanged and all
proceed actions in the persistent footer. Support desktop, phone and hosted
manual inputs; JSON transfer stays local-only and hosted quotas stay unchanged.

Frontend-only allocation: manual-time helper/tests, selection-panel wiring,
scoped action-row styles, existing timestamp browser proof, frontend guide,
source of truth and ticket/index. Preserve earlier CL-209–214 unstaged work.
No backend/contracts/native worker change, restart, owner media/edits mutation,
configuration, provider/cloud call, staging/commit/push or deployment.

Verify generated/synthetic fake/no-key checks for imported and typed fractional
times, original offsets, Start/End, invalid/outside/EOF times, busy/readiness,
unchanged inputs, keyboard action and responsive target/footer/overflow states.
Import/navigation makes zero processing requests. Run focused types/lint/format
and a separate settled read-only validation pass; fix actionable findings.
Real owner-device visual acceptance remains separate. Preview navigation works
with fake mode/no keys and existing media; later real ASR/Codex/Gemini work
keeps its installed-tool/login/key/live/approval requirements.

Implementation and evidence, 2026-11-04:

- `selection-panel.tsx` pairs a shared quiet Play/Jump to button with each
  existing Capture button. It uses `fieldMilliseconds` for the single original
  offset mapping, then `manualPreviewJumpSeconds` for source/window/EOF guards.
  The existing experience callback seeks, scrolls/focuses the source preview
  and requests playback. No row setter, processing request or provider call is
  introduced by navigation. Capture and the main footer action keep their
  existing handlers. CSS adds one scoped, wrapping action group.
- `manual-time.test.ts`: 24 tests pass, including precise endpoint clocks,
  physical EOF and available-window bounds. The two new cases supplement the
  existing normalization/capture regression tests.
- `corepack pnpm exec vitest run --config scripts/local-test.config.ts
  apps/frontend/src/features/local-editing/manual-time.test.ts`: pass (2.02 s).
- `corepack pnpm exec vitest run --config scripts/local-proof.config.ts
  test/local-timestamp-exchange.proof.ts`: pass (final run 10.14 s). The real
  selection component runs inside the shared WorkflowFrame, source/selection
  columns and footer portal with synthetic data and a navigation spy. Checks
  cover all 25 imported rows retained, imported .033/2.033-second endpoints,
  original-offset typed 10.633/17.333-second endpoints, invalid/outside/EOF
  values, busy/unready guards, unchanged inputs and Enter activation. Navigation
  and import send zero processing POSTs; the separate explicit Use clips action
  sends exactly one fake POST retaining all 25 rows. Existing Capture checks
  pass. Local desktop 1440x900, phone 390x900, Android and hosted layouts retain
  paired 44px targets, no horizontal page overflow and a visible footer action.
  JSON transfer remains absent on phone/Android/hosted.
- Inspected generated desktop/phone screenshots in both disabled and enabled
  states. Final ignored synthetic captures are
  `.local-build/evidence/cl215-jump-{1440,390,android,hosted}.png`.
- Frontend and test TypeScript projects pass (`corepack pnpm exec tsc --noEmit
  -p apps/frontend/tsconfig.json` and `-p tsconfig.tests.json`). Focused ESLint
  passes on the three changed TS/TSX modules and browser proof; Prettier check
  passes on those four files plus the scoped CSS. `git diff --check` passes.
- Separate settled read-only validation compared the four implementation/test
  modules and browser proof against the private pre-CL-215 snapshot, reviewed
  real callback/contract wiring, guards, accessibility, cleanup and owning docs.
  Verdict: Meets ticket; no actionable findings. Earlier CL-209–214 changes
  remain outside this review; no staging/commit was performed.
- Existing backend health, `/start` and `/api/sample/config` all return 200.
  No restart, configuration change, owner-state mutation or real processing was
  needed. The browser proof closes its browser/listener and removes only its
  checked scratch directory.

Changed files: `manual-time.ts`, `manual-time.test.ts`, `selection-panel.tsx`,
`style.css`, `test/local-timestamp-exchange.proof.ts`, frontend README, source
of truth, this ticket and the canonical ticket index. No backend, contracts or
native-worker change belongs to CL-215.

Remaining gates: personal owner-device/media visual acceptance is unverified.
The browser callback spy proves navigation dispatch, not new real decoder or AI
quality; the existing source-preview handler was unchanged and reviewed. No
real ASR/Codex/Gemini, API-key/live/paid, export, cloud, deployment or rights
acceptance was run or claimed. The proof fixture was upgraded to the actual
workflow frame for footer evidence; no product-scope deviation.
