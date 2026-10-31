# CL-168–179 whole-file commit plan

Owner authorization, 2026-10-31: file-level plan, multiple ticket-prefixed local
commits, stage and commit, then report deployment work. No push or deployment.
Preserve the running app, current recovery/session, owner media/configuration,
private diagnostics and ignored tooling. No real inference/download/render,
cloud inspection/change or environment-file access is part of this packaging.

Commit this plan alone first. Allocate every complete file exactly once below;
no hunk splitting. Shared files contain several tickets and stay intact. These
are dependent review commits: only the complete final tree carries combined
verification; intermediate commits are not claimed as independent releases.
Historical tickets saying unstaged/uncommitted describe their original handoff
and are superseded by this explicit owner packaging instruction.

Baseline `3585ce5b352ccf44b03b719e6f5d52b74249c860`, branch `main`, initially empty index. 101 allocated files including this plan.

## 1. `CL-168-179: plan current-work commit packaging`

Exhaustive whole-file allocation, verification rules and remaining release gates.

- `docs/operations/CL168_179_COMMIT_PLAN.md`

## 2. `CL-168-177: define speech progress selection and visual contracts`

Shared browser-safe job, progress, selection, visual and diagnostic schemas with their focused tests.

- `packages/contracts/local/clips.ts`
- `packages/contracts/local/codex-progress.ts`
- `packages/contracts/local/codex.test.ts`
- `packages/contracts/local/codex.ts`
- `packages/contracts/local/diagnostics.ts`
- `packages/contracts/local/execution-diagnostics.ts`
- `packages/contracts/local/hosted-editing.ts`
- `packages/contracts/local/policy.ts`
- `packages/contracts/local/runtime.ts`
- `packages/contracts/local/selection.ts`
- `packages/contracts/local/visual-diagnostics.ts`
- `packages/contracts/src/contextual-picture.schema.ts`

## 3. `CL-168-169: scope speech preparation and report native progress`

Shared-WAV scheduling, scoped speech and deferred speaker jobs with cancellation/progress tests.

- `apps/renderer/local/codex-media.test.ts`
- `apps/renderer/local/codex-media.ts`
- `apps/renderer/local/codex-speech.test.ts`
- `apps/renderer/local/codex-speech.ts`
- `apps/renderer/local/server.ts`

## 4. `CL-168-178: improve preparation and search-first visual discovery`

Interwoven backend analysis, speech reuse, broad provider discovery, exact CLI/tool/download diagnostics, Find visuals and Pop defaults. Keep all shared modules whole.

- `apps/backend/local/analysis.test.ts`
- `apps/backend/local/analysis.ts`
- `apps/backend/local/clip-batch.test.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/backend/local/codex-ai.test.ts`
- `apps/backend/local/codex-ai.ts`
- `apps/backend/local/codex-composition.ts`
- `apps/backend/local/codex-exec.test.ts`
- `apps/backend/local/codex-exec.ts`
- `apps/backend/local/codex-progress.test.ts`
- `apps/backend/local/codex-progress.ts`
- `apps/backend/local/codex-visual-plan.test.ts`
- `apps/backend/local/codex-visual-plan.ts`
- `apps/backend/local/diagnostics.test.ts`
- `apps/backend/local/diagnostics.ts`
- `apps/backend/local/fake-analysis.ts`
- `apps/backend/local/fake-clips.ts`
- `apps/backend/local/hosted-workflow.test.ts`
- `apps/backend/local/hosted-workflow.ts`
- `apps/backend/local/provider-ai.test.ts`
- `apps/backend/local/provider-ai.ts`
- `apps/backend/local/provider-composition.ts`
- `apps/backend/local/selection-policy.ts`
- `apps/backend/local/server.ts`
- `apps/backend/local/session-recovery.test.ts`
- `apps/backend/local/visual-discovery.ts`
- `apps/backend/local/worker-port.ts`
- `apps/backend/src/admission/processing.admission.test.ts`
- `apps/backend/src/admission/processing.admission.ts`
- `apps/backend/src/analysis/analysis.composition.ts`
- `apps/backend/src/analysis/analysis.prompt.ts`
- `apps/backend/src/analysis/analysis.provider-shape.ts`
- `apps/backend/src/assembly/commons-pictures.test.ts`
- `apps/backend/src/assembly/commons-pictures.ts`
- `apps/backend/src/assembly/contextual-pictures.test.ts`
- `apps/backend/src/assembly/contextual-pictures.ts`
- `apps/backend/src/assembly/gemini-image-search.ts`
- `apps/backend/src/assembly/picture-raster.ts`
- `apps/backend/src/assembly/public-picture-request.test.ts`
- `apps/backend/src/assembly/public-picture-request.ts`
- `apps/backend/src/assembly/selected-assembly.usecase.ts`
- `apps/backend/src/assembly/web-pictures.test.ts`
- `apps/backend/src/assembly/web-pictures.ts`
- `apps/backend/src/diagnostics/execution-failure.test.ts`
- `apps/backend/src/diagnostics/execution-failure.ts`

## 5. `CL-168-172: add Codex progress and visual discovery controls`

Scoped progress checklist, Find visuals CTA/bridge and local-only unbounded moment discovery controls.

- `apps/frontend/src/features/local-editing/clip-batch-panel.tsx`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/clip-stage.test.ts`
- `apps/frontend/src/features/local-editing/clip-stage.ts`
- `apps/frontend/src/features/local-editing/codex-preparation-steps.module.css`
- `apps/frontend/src/features/local-editing/codex-preparation-steps.tsx`
- `apps/frontend/src/features/local-editing/selection-panel.tsx`
- `apps/frontend/src/server/local-ai-request.test.ts`
- `apps/frontend/src/server/local-ai-request.ts`
- `apps/frontend/src/shared/ui/processing-state.tsx`

## 6. `CL-168-176: verify native browser and Codex search workflows`

Current-source synthetic browser/native/CLI proofs for progress, selection, editing, search and recovery.

- `test/local-codex-cli.proof.ts`
- `test/local-codex-progress.proof.ts`
- `test/local-codex-search.proof.ts`
- `test/local-codex.proof.ts`
- `test/local-moment-cards.proof.ts`

## 7. `CL-171-179: align capability fixtures and verification checks`

Test-only consolidation fixes: exact visual-discovery capabilities, later Hook eligibility, nonfatal rejected art, browser-safe fixture and efficient full-buffer sound hashing.

- `test/owner-local.test.ts`
- `test/owner-provider-host.test.ts`
- `apps/backend/local/fake-content.test.ts`
- `apps/backend/local/provider-compatibility.test.ts`
- `packages/composition/local/audio-sources.test.ts`
- `packages/composition/local/sliding-highlight.test.ts`

## 8. `CL-168-179: record decisions validation and release handoff`

Owning guides, product decisions, ticket evidence, final commit IDs and actual remaining deployment gates.

- `apps/backend/README.md`
- `docs/architecture/LOCAL_CODEX_AI.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md`
- `docs/tickets/CL-168-local-codex-performance-and-progress.md`
- `docs/tickets/CL-169-defer-codex-speakers-until-clip-preparation.md`
- `docs/tickets/CL-170-usable-visual-plans-and-search-first-fallback.md`
- `docs/tickets/CL-171-broad-image-discovery-and-find-visuals.md`
- `docs/tickets/CL-172-local-find-all-moments.md`
- `docs/tickets/CL-173-root-cause-visual-diagnostics.md`
- `docs/tickets/CL-174-strict-codex-search-schema.md`
- `docs/tickets/CL-175-explicit-provider-image-search.md`
- `docs/tickets/CL-176-codex-search-tool-availability.md`
- `docs/tickets/CL-177-native-image-download-lookup.md`
- `docs/tickets/CL-178-find-visuals-start-sounds.md`
- `docs/tickets/CL-179-current-work-verification-and-commits.md`
- `docs/tickets/README.md`

## Gates before staging

Settled combined tree: root format/lint/typecheck pass; root plus package unit
suites pass **2,209 tests**, and the complete local suite passes **849 tests**.
These suites overlap; the counts are not a claim of distinct combined coverage.
The initial stale-test and nested pnpm PATH failures are resolved in CL-179.
No feature behavior was changed during packaging.

- Root format, lint, typecheck, unit and complete local tests use pinned pnpm
  11.19.0, fake/paid-off setup before imports, envDir false and blocked external
  network. Existing focused native/browser/CLI ticket proofs remain historical
  evidence; no real test is authorized or implied. CL-179 records exact outcomes.
- Review current source against CL-168–178 and the narrow test-only CL-179
  dispositions. Inspect original privacy/resource/provider/hosted boundaries.
- Require an empty index before each group; stage only that exact explicit list.
  Compare staged names and content with the manifest/worktree; run whitespace
  and credential-shaped added-text checks without printing any secret matches.
- Never stage ignored env/media/transcripts/captures/logs/builds/binaries or owner
  assets. Do not use add -A. No dependencies/configuration/provider flags change.
- Record the actual first seven commit IDs in the closing documentation commit;
  that final commit is self-identifying in history. Reconcile baseline-to-HEAD
  names with this exhaustive list and verify an empty index/worktree afterward.

## Deployment handoff

The owner reports local Codex editing complete and real image discovery working.
Local-only tools/progress/Find all remain local; hosted stays Gemini. Current
Linux production image/runtime/native proofs, protected real-Gemini acceptance,
2-CPU/8-GiB/5376-MiB-tmp/background-CPU lifecycle/capacity and cost confirmation,
then authorized push/build/rollout remain. No new product feature is proposed.
See HOSTED_EDITOR_RELEASE_PREPARATION.md for the exact boundary and historical
prerequisites; no live cloud configuration was inspected during this packaging.
