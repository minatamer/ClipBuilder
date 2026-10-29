# CL-132 — Verify Hook edit fidelity

Status: locally verified, no production defect found. Depends on completed
CL-129; pending CL-131 changes are preserved.

## Owner request and scope

Before owner fake-mode Hook acceptance, verify that the repeated range carries
the same timestamped camera/person, crop/zoom, captions and corrections, text,
pictures/motion, filters and audio as the normal occurrence. Fix a confirmed
defect if found. The existing shared source-time Hook contract remains authority;
do not create a second camera plan or independent frozen edit snapshot.

Allocate the existing synthetic native speaker/Hook proof and shared overlay
frame test, this packet, CL-129 evidence and the ticket index. Inspect preview,
edit compilation and native render integration; production changes are needed
only for a confirmed defect and require extending this allocation first.
No real media, ignored configuration, paid/provider/cloud calls, deployment,
staging or commit is authorized. Preserve the healthy normal app and its session.

## Acceptance and checks

- [x] Source-time preview/export paths use the same current edited camera and
      every supported edit layer; the full normal body remains intact.
- [x] Spatially distinct synthetic targets prove person/crop and zoom inheritance
      in actual native MP4s, including a Hook across a camera change and native
      cadence boundaries. Existing colour-only evidence is insufficient for crop.
- [x] Shared overlay and native checks prove text, pictures/motion, captions/
      speaker colours, filters and audio repeat at the corresponding source times.
- [x] Focused tests, required type/lint/format checks and final validate pass;
      document any defect/fix and remaining owner acceptance gates accurately.

All agent evidence is synthetic with fake AI, paid-off, no keys and network
interception. Manual Hook/editing and local encoding need no AI API key. Fresh
real AI analysis/assets/captions require keys, live flags/approvals and owner
action. Fake evidence does not prove AI face detection or live output quality.
Owner real-media/visual/physical-device/hosted/release acceptance remains open.

## Evidence — 2026-10-29

No application change was needed. Hook preview maps presentation frames through
`ownerSourceFrame` before choosing the current focus shot/crop. The shared
overlay uses that same clock for text, pictures/motion and corrected/styled
speaker captions. `compileOwnerOverlay` supplies current manual edits over the
automatic base to both browser preview and the queued export. The native Hook
decoder applies the complete source-time camera track before trimming the
repeated range, and filters apply to the joined Hook/body. Audio is trimmed
from the matching original range. The Hook remains a reference to the current
edited range; later edits at those timestamps affect both occurrences.

Changed implementation evidence is limited to:

- `test/local-speaker-hook.proof.ts`: replace the inadequate time-changing
  colour source with fixed left/right red/blue targets and white landmarks.
  Actual crop alone must choose the target. Independent landmark width/height/Y
  bounds verify zoom and vertical positioning. Compare repeated/body pixels
  within the CRF-18 encode's small compression tolerance. Add a Hook crossing
  a camera change; preserve 12/24/30/30000÷1001 cadence, one-frame Hook and
  440/880-Hz audio checks. Both native proofs pass, including existing real
  caption/speaker colours and timed picture/text MP4 checks.
- `apps/frontend/src/features/local-editing/overlay-frame.test.tsx`: enrich the
  real shared React test with timed text, picture entry/exit motion, manual
  speaker colours, caption typography, camera changes/zoom and a filter. Check
  corresponding source frames and actual non-caption React geometry/animation.
  Caption text is deliberately excerpted at Hook boundaries, as CL-129 requires.

Four focused Hook/overlay tests pass using the local test config. The two native
proofs use the local proof config and a freshly compiled current-source overlay,
generated media and real local FFmpeg/Chromium only. Frontend and repository-test
TypeScript, scoped ESLint/Prettier and diff whitespace checks pass. No AI/provider
composition or call, ignored env read, real media, or normal app/session mutation
occurred. No runtime source changed, so no worker rebuild/restart was needed.
The exact proof targets are `test/local-speaker-hook.proof.ts`,
`packages/contracts/local/hook.test.ts` and
`apps/frontend/src/features/local-editing/overlay-frame.test.tsx`.

Final validate: **Meets ticket; no actionable findings.** Covered: current edits
in both occurrences, unchanged normal body, spatial camera/zoom evidence, timed
overlays, audio/native cadence and cleanup. Review scope: these two test diffs,
the CL-129/132 evidence and index; inspect the immediate preview/compile/native
clock integration. Prior CL-131 responsive changes are excluded from this verdict.
All temporary proof processes/files are owned and cleaned. No staging/commit,
cloud access or deployment; physical-device/owner/live-AI/release gates remain
unchecked. Scope deviation: stronger verification only, since production already
implements the requested behavior.

The owner subsequently authorized local staging/commits under the
[CL-131/132 whole-file plan](../operations/CL131_132_COMMIT_PLAN.md) on
2026-10-29, before the separate Media/audio work. No remote release is included.
