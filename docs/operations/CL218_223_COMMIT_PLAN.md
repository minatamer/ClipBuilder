# CL-218-223 - File-level commit and push plan

Owner authorization: 2026-11-05, "file level commit, multiple commits with ticket
prefixes, stage commit and push." This authorizes staging, local commits and a
normal fast-forward push of this series to `origin/main`. Earlier packet notes
about no Git action and unstaged work describe their implementation handoffs;
this later instruction supersedes them for this packaging task only.

## Scope and allocation

Baseline: `5de6a7471ee902422fd32c08783757ecdf6d2b35` on local `main`.
The configured remote's `main` was checked and matches that baseline. Allocate
all 70 pending paths plus this plan exactly once: 71 complete files in six
commits. Use explicit path lists and whole-file staging. No partial staging,
temporary source rewrites, broad/forced add, history rewrite or force-push.
One additional status-only path, renderer local/media.ts, has no normalized
content diff; preserve its bytes and refresh its index metadata separately.

Shared files cover several packets. Speaker evidence and verified-follow
retention land first. Caption defaults, independent Hook schemas, composition
and the disjoint-range merge share complete contract files and land together.
Backend persistence and native rendering consume those contracts next. The
shared editor and its browser regressions then connect independent content,
stable item lists and incomplete Hook selection. Fresh Motion transport/retry
integration follows. Shared authority, guides and this record land last.
Prerequisite commits are not separately claimed as complete feature acceptance;
review each ticket's behavior against the final series.

Preserve ignored configuration, saved sources/drafts/exports, private diagnostics,
model binaries, proof artifacts and the running app. Packaging does not restart
services, run owner-media processing, inference, acquisition or deployment. The
push workflow performs quality checks only, with no deployment step. Remote CI
results remain separate from the recorded local gates.

## 1. CL-218: correct opening speaker evidence and retain verified Motion

- `apps/backend/local/codex-ai.ts`
- `apps/backend/local/focus-planning-policy.ts`
- `apps/renderer/local/automatic-camera-follow.ts`
- `apps/renderer/local/codex-media.test.ts`
- `apps/renderer/local/codex-media.ts`
- `packages/contracts/local/camera-follow-plan.ts`
- `packages/contracts/local/codex-sampling.test.ts`
- `packages/contracts/local/codex-sampling.ts`
- `packages/contracts/local/codex.ts`
- `packages/contracts/local/focus.test.ts`
- `packages/contracts/local/focus.ts`
- `test/local-automatic-follow.proof.ts`
- `test/local-codex.proof.ts`
- `docs/tickets/CL-218-correct-speaker-and-source-reframe-motion.md`

## 2. CL-219-220-223: define caption defaults and independent Hook content

- `packages/contracts/local/clips.ts`
- `packages/contracts/local/edit-overlay.ts`
- `packages/contracts/local/editor.ts`
- `packages/contracts/local/hook-content.ts`
- `packages/contracts/local/occurrence-audio.ts`
- `packages/composition/local/automatic-overlay.tsx`
- `packages/composition/local/overlay-frame.ts`

## 3. CL-220: persist and render independent Hook edits and audio

- `apps/backend/local/edit-clip.ts`
- `apps/renderer/local/audio-mix.ts`
- `apps/renderer/local/clip-render.ts`
- `test/local-hook-content.proof.ts`
- `test/owner-editor.test.ts`

## 4. CL-219-220-222-223: expose stable Hook editing and open-ended selection

- `apps/frontend/src/features/local-editing/audio-inspector.tsx`
- `apps/frontend/src/features/local-editing/audio-preview.tsx`
- `apps/frontend/src/features/local-editing/bulk-head-motion-editor.tsx`
- `apps/frontend/src/features/local-editing/bulk-head-motion.test.ts`
- `apps/frontend/src/features/local-editing/caption-text-editor.tsx`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/editor-clock.ts`
- `apps/frontend/src/features/local-editing/editor-state.test.ts`
- `apps/frontend/src/features/local-editing/editor-state.ts`
- `apps/frontend/src/features/local-editing/hook-controls.test.tsx`
- `apps/frontend/src/features/local-editing/hook-controls.tsx`
- `apps/frontend/src/features/local-editing/hook-range-draft.test.ts`
- `apps/frontend/src/features/local-editing/hook-range-draft.ts`
- `apps/frontend/src/features/local-editing/picture-timing.tsx`
- `apps/frontend/src/features/local-editing/position-fields.test.tsx`
- `apps/frontend/src/features/local-editing/position-fields.tsx`
- `apps/frontend/src/features/local-editing/style.css`
- `apps/frontend/src/features/local-editing/styled-caption.test.tsx`
- `apps/frontend/src/features/local-editing/text-inspector.tsx`
- `apps/frontend/src/features/local-editing/use-editor-preview.ts`
- `test/local-audio-editor.proof.ts`
- `test/local-hook-editor.proof.ts`
- `test/local-responsive-editor.proof.ts`
- `test/local-speaker-hook.proof.ts`
- `test/owner-hook-content.test.ts`
- `test/owner-hook-fixture.ts`
- `docs/tickets/CL-219-default-caption-position.md`
- `docs/tickets/CL-220-independent-hook-content-editing.md`
- `docs/tickets/CL-222-stable-complete-editor-item-lists.md`
- `docs/tickets/CL-223-open-ended-hook-selection.md`

## 5. CL-221: carry automatic Motion through fresh worker transport and retry

- `apps/backend/local/clip-batch.test.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/backend/local/worker-port.ts`
- `apps/backend/local/worker-transport.test.ts`
- `apps/backend/local/worker-transport.ts`
- `test/local-fresh-motion.proof.ts`
- `docs/tickets/CL-221-fresh-automatic-reframe-motion.md`

## 6. CL-218-223: record verification and file-level commit plan

- `AGENTS.md`
- `apps/backend/README.md`
- `apps/frontend/README.md`
- `apps/renderer/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/architecture/LOCAL_CODEX_AI.md`
- `docs/tickets/README.md`
- `docs/operations/CL218_223_COMMIT_PLAN.md`

## Verification and remaining acceptance

The ticket packets retain exact evidence from their settled implementations:

- CL-218: 148 generated units, four browser/native proofs, types and scoped
  lint/format, plus the earlier specifically authorized local reproduction.
  That saved-clip correction is historical; CL-221 supersedes that verification
  method for generic fixes.
- CL-219: 49 units, responsive controls and native caption-position pixels.
- CL-220: 55 units plus generated browser/native isolation and persistence,
  including fractional-rate one-frame Hook pixels and independent speech gain.
- CL-221/222: 99 unit/API cases, real worker HTTP/native fresh-follow proof,
  camera timing proof and Hook/audio browser proofs. The generated fresh-follow
  reply exceeds the old 8 KiB boundary; no real provider is called.
- CL-223: 22 focused cases and the real editor at 1440/390/320, including
  settled Start Capture, blank End, disabled actions, completion and Discard.
- Relevant contracts/local/frontend/test types, scoped ESLint/Prettier and
  whitespace checks pass. Normal backend/worker reloads preserved saved state.

These checks use generated data, fake providers, paid-off flags and no API keys
unless the historical CL-218 packet explicitly states its bounded local test.
Fake mechanics do not prove live AI quality. Motion real-pipeline acceptance
still requires the owner to regenerate a fresh clip under the normal local
provider/model/login and feature gates. Do not patch the saved clip as proof.
Personal creative/device and hosted/release acceptance remain owner-only.

For this packaging pass, verify exact path coverage, text-only content,
credential/private-content scan, formatting, staged whitespace and unchanged
implementation bytes. Record commit subjects and remote equality after push;
remote CI success is not claimed from a successful push.

## Packaging checks

The exact allocation and text/credential scan pass. The only path flags in the
initial privacy scan are unchanged baseline examples/references; no new private
media reference or credential was added. One existing test formatting issue in
local-speaker-hook.proof.ts was normalized without changing test behavior.
An extra terminal blank line in the CL-221 packet was removed after staged
whitespace inspection.
Implementation file bytes are otherwise preserved. Ignored app configuration,
private artifacts, source media and saved clips remain outside the allocation.
