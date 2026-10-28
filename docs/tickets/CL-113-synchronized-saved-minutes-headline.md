# CL-113 — synchronized saved-minutes headline

Owner follow-up, 2026-10-28: animate the headline's saved minutes up to 50,
synchronized with the comparison. Keep spacing around “with”/“minutes” stable.
Use smooth slow-start/fast-middle/slow-end timing. Preserve CL-095–112.

## Scope and allocation

- `time-savings.tsx`: extend the existing section-scoped frame loop to headline
  and card saved-minute readouts (0→50). Keep the 75%-visible metric trigger,
  hidden-start deferral, once-only behavior, same 2.2-second duration and cleanup.
  All counters, ring, hand and timeline use one eased progress. Replace the old
  ease-out curve with a bounded monotonic smootherstep with zero end velocity.
  Use two-digit 00→50 display for the saved-minute counts; accessible/no-JS
  content retains complete final wording. Preserve example/Target qualifications
  and existing arithmetic; no new performance claim or measured benchmark.
- `time-savings.module.css`: a fixed two-digit tabular slot prevents width/gap/
  wrapping changes while digits change. Keep the existing responsive typography,
  blue emphasis and no overlap/clipping.
- Existing `page.test.tsx` and guarded `test/local-market.proof.ts`: verify both
  saved-minute displays, static accessibility/final values, frame-by-frame sync
  with the countdown/bar, monotonic slow–fast–slow progress, stable before/after
  word positions and responsive no-overflow. Retain prior entry/no-replay,
  market-shine and clock checks. Inspect current desktop/phone captures.
- Narrow source-of-truth time direction and this packet/index own evidence.

Run focused units, frontend/test types, affected lint/format/whitespace and the
guarded fake/no-key browser proof. Execute then read-only validate/fix to no
findings. No dependency/asset, backend/worker/configuration, provider/cloud, Git
mutation or deployment; preserve the running normal app.

These visuals are API-free with FAKE_MODE=true/no keys. Real AI still needs
provider keys/live flags/approvals and owner action. Personal visual, physical-
device, rights, real-AI, hosted/cloud and release acceptance remain open.

## Status

Implemented and locally verified. The headline and card saved-minute readouts
share the existing 2.2-second animation frame loop with the countdown, timeline
and clock. Two-digit tabular slots display 00→50 without changing word gaps;
quintic smootherstep provides slow start, fast middle and gentle finish. Static
accessible/no-JS content retains the final 50-minute wording.

Verification on 2026-10-28:

- Focused `src/app/page.test.tsx`: 12 tests passed (1.79s).
- Frontend typecheck, root test typecheck, affected ESLint, Prettier and
  `git diff --check` passed. A final proof-file formatting finding was corrected
  and formatting rechecked successfully; no semantic change followed the proof.
- Guarded fake/paid-off `test/local-market.proof.ts`: passed (31.14s). Every
  sampled frame matched both saved-minute readouts to rounded shared progress;
  countdown agreement remained within one minute at rounding boundaries.
  Before/after word and number-slot geometry stayed within 0.1px throughout
  desktop and phone counting. Measured middle progress was over 1.8 times the
  early/late rate. Intermediate counts, monotonic progress, final values,
  no-JS values, visible-only entrance, hidden-start deferral and no replay passed.
  Existing market shine, responsive layout and clock checks remained passing.
- Inspected desktop intermediate/final and phone intermediate captures under
  ignored `.local-build/evidence/cl113-time-*`; the frame trace is
  `.local-build/evidence/cl113-count-trace.json`. No provider request or real
  media was used.

V113-final: **Meets ticket; No actionable findings.** Read-only review covers
the allocated CL-113 changes over baseline `b945401`, with CL-095–112 pending
changes treated as preserved context. Checked shared progress/rounding,
responsive slot geometry, accessible final wording, observer/frame/listener
cleanup, existing trigger behavior and scope boundaries. No dependency or
application boundary changed.

No staging, commit, push or deployment. Normal local services remain running.
These visuals work with FAKE_MODE=true and no API keys; real provider processing
still requires keys, enabled live flags, applicable approvals and owner action.
Personal visual, physical-device, rights, real-AI, hosted/cloud and release
acceptance remain unchecked owner gates.
