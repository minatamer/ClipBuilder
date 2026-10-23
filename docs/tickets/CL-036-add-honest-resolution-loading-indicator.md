# CL-036 — Show an honest spinner during YouTube resolution lookup

Status: implemented and verified. Dependency: implemented CL-035 and CL-032 acquisition card.
Owner request 2026-10-23: add loading feedback, with real estimated progress only
when measurable; otherwise use a spinner.

Resolution lookup is a single metadata request with no total work or incremental
completion data. Add the existing demo's loader icon during link checking and
resolution loading, with short accessible status text and reduced-motion support.
Do not invent a percentage, countdown or timer-based progress. Preserve existing
download byte progress, request lifecycle, errors/retry, offline reuse and gates.

Verify pending-to-failure/retry/success transitions and disabled controls with
the existing synthetic intake browser proof. Inspect desktop/phone pending-state
captures, test reduced motion, and run focused frontend types/lint/format plus
read-only validate. No new standalone test or broad suite is needed for this UI
change. Fake AI remains key-free; real downloads/native editing/export stay
independent. Gemini keys/live flags/owner approval are needed only for real AI;
no offline AI model/runtime is supplied. No real acquisition, provider/cloud call,
configuration read/change, Git mutation or deployment is authorized.

## Implementation and verification

`acquisition-panel.tsx` uses the existing Lucide LoaderCircle during Checking and
Loading resolutions. The resolution status retains its accessible status role;
the decorative icon is hidden from assistive technology. `style.css` applies the
demo's 0.9-second spinner treatment and stops animation for reduced motion.
There is no new request, JavaScript timer, progress estimate or configuration.
The existing transfer byte bar is unchanged. The feature README documents the
distinction between unmeasured metadata work and reported download bytes.

The existing `local-design.proof.ts` now explicitly holds synthetic lookup and
metadata responses, verifies pending icons/disabled controls/no percentage or
progress bar, then releases the requests through failure, explicit retry and
successful resolution selection. It verifies the spinner disappears, normal and
reduced-motion styles, six intake viewports, desktop/phone pending captures,
three resolution layouts, exact import/cancel and saved/offline reuse. Final pass:
**one browser proof, 12.80 seconds**. Exact mocked mutation counts remain two
lookups, two metadata requests, one import, one cancel and one saved open.
Browser, listener, pending responses and OS-temp scratch drain; the existing
resource check verifies zero owned survivors. Synthetic pending captures at 1440
and 390 pixels under ignored `.local-build/evidence/cl036-*` were inspected.

Frontend and root-test TypeScript, focused ESLint/Prettier and
`git diff --check` pass. Initial verification exposed inherited reduced motion
and test-library typing limits: the proof now controls motion explicitly, uses
ordinary promises compatible with the repository's target, and documents one
test-only `@ts-expect-error` for Remotion's narrow CDP media-feature declaration.
Actual CDP motion behavior is verified by both style assertions. Production code
has no type suppression or cast. No broad suite/build or real download was run.

Final read-only validate scope: this ticket's two loading icons, scoped CSS,
existing browser-proof extension and owning docs. Earlier CL-028–CL-035 work is
preserved and excluded; the index is empty. **Meets ticket; no actionable
findings.** Covered: honest loading feedback, existing design, accessible status,
reduced motion, failure/retry/completion, responsive fit and cleanup. No provider,
schema, dependency, storage or request-lifecycle change. Real provider quality
and physical-device/owner aesthetic acceptance remain unchecked. The normal app
and saved media were left alone; AI remains fake and no Git action occurred.
