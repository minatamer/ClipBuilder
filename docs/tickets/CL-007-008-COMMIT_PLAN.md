# CL-007 / CL-008 file-level commit plan

Status: execution authorized by the owner on 2026-10-03; implementation steps
1–5 committed. Documentation checkpoints 6–7 finish the sequence, with the final
execution record in [CL-008](CL-008-productionize-active-speaker-assembly.md#commit-execution-record).
Prepared: 2026-10-03.
Baseline: `db58981` — `CL-006: record completion and the next ticket handoff`.
Scope: 71 pending non-ignored files (45 modified, 26 new), plus this plan:
**72 distinct files in seven commits**. Paths are relative to the repository root.

Packets: [CL-007](CL-007-deliver-live-analysis-vertical-slice.md) and
[CL-008](CL-008-productionize-active-speaker-assembly.md).

Run the commands from the repository root in the order below. Stage the listed
whole files and commit each group before moving to the next. The index was empty
when execution began. Each file is staged
whole once.
Literal pathspecs keep the frontend `[action]` route paths exact.

Shared contract, renderer, adapter, configuration and guide files already contain
both CL-007 and CL-008 changes. Their full current contents land once in the
earliest listed group; CL-008's dedicated focus modules and evidence follow.
These are sequential file-group checkpoints. Intermediate runnable snapshots
or separate test passes are not claimed; the settled combined implementation
passed the five root gates and 483 synthetic tests, with CL-007's latest local
revalidation reporting no actionable findings. This plan changes documentation only.

With `FAKE_MODE=true` and no API keys, the recorded fixture browser workflow
supports candidates, selection, refresh, read-only review, simulated export and
reset; it produces no validated downloadable MP4. Injected source/focus/cleanup
tests are synthetic and prove no live AI quality. No local AI model or weights
are used. Real provider processing needs keys, live flags and the applicable
rights/data/spend approvals. Renderer rollout and paid/live checks remain
owner-deferred; native selected-proxy fixture proof still needs the approved full
fixture FFmpeg tool. Documenting or committing these files does not pass those gates.

| Order | Commit message | Files |
| --- | --- | ---: |
| 1 | `CL-007: define grounded analysis and focus contracts` | 8 |
| 2 | `CL-007: extend private analysis and selected proxy operations` | 8 |
| 3 | `CL-007: implement protected grounded source analysis` | 15 |
| 4 | `CL-007: integrate browser analysis and recoverable cleanup` | 18 |
| 5 | `CL-008: implement validated selected-range speaker focus` | 9 |
| 6 | `CL-007: document source analysis and local verification` | 13 |
| 7 | `CL-008: record selected-focus verification and remaining gates` | 1 |

Execution recorded before the two final documentation commits:

| Order | Commit | Subject |
| --- | --- | --- |
| 1 | `86505c5` | `CL-007: define grounded analysis and focus contracts` |
| 2 | `542bd36` | `CL-007: extend private analysis and selected proxy operations` |
| 3 | `e15ba9d` | `CL-007: implement protected grounded source analysis` |
| 4 | `b02c2e3` | `CL-007: integrate browser analysis and recoverable cleanup` |
| 5 | `80e585d` | `CL-008: implement validated selected-range speaker focus` |

Each exact file group was staged whole and committed sequentially. No source
behavior changed during committing and no intermediate tests were rerun. The
settled 483-test/five-gate evidence and all external limitations remain unchanged.

## 1. CL-007: define grounded analysis and focus contracts

Stage these whole files, then commit:

```powershell
git --literal-pathspecs add -- "packages/contracts/src/api.schema.ts"
git --literal-pathspecs add -- "packages/contracts/src/cloud-media.schema.ts"
git --literal-pathspecs add -- "packages/contracts/src/constants.ts"
git --literal-pathspecs add -- "packages/contracts/src/edit-plan.schema.ts"
git --literal-pathspecs add -- "packages/contracts/src/grounded-analysis.schema.ts"
git --literal-pathspecs add -- "packages/contracts/src/index.ts"
git --literal-pathspecs add -- "packages/contracts/src/media.schema.ts"
git --literal-pathspecs add -- "packages/contracts/src/selected-focus.schema.ts"
git commit -m "CL-007: define grounded analysis and focus contracts"
```

## 2. CL-007: extend private analysis and selected proxy operations

Stage these whole files, then commit:

```powershell
git --literal-pathspecs add -- "apps/renderer/src/app.ts"
git --literal-pathspecs add -- "apps/renderer/src/expiry/media-sessions.ts"
git --literal-pathspecs add -- "apps/renderer/src/expiry/temporary-intent.ts"
git --literal-pathspecs add -- "apps/renderer/src/media/inspection.ts"
git --literal-pathspecs add -- "apps/renderer/src/media/media-operations.test.ts"
git --literal-pathspecs add -- "apps/renderer/src/media/media-operations.ts"
git --literal-pathspecs add -- "apps/renderer/src/media/node-pipeline.ts"
git --literal-pathspecs add -- "apps/renderer/test/media-fixture.ts"
git commit -m "CL-007: extend private analysis and selected proxy operations"
```

## 3. CL-007: implement protected grounded source analysis

Stage these whole files, then commit:

```powershell
git --literal-pathspecs add -- "apps/backend/src/admission/admission.composition.ts"
git --literal-pathspecs add -- "apps/backend/src/admission/processing.admission.ts"
git --literal-pathspecs add -- "apps/backend/src/admission/turnstile.verifier.test.ts"
git --literal-pathspecs add -- "apps/backend/src/admission/turnstile.verifier.ts"
git --literal-pathspecs add -- "apps/backend/src/analysis/analysis.composition.ts"
git --literal-pathspecs add -- "apps/backend/src/analysis/analysis.provider-shape.ts"
git --literal-pathspecs add -- "apps/backend/src/analysis/analysis.reconciliation.ts"
git --literal-pathspecs add -- "apps/backend/src/analysis/analysis.test.ts"
git --literal-pathspecs add -- "apps/backend/src/analysis/analysis.usecase.ts"
git --literal-pathspecs add -- "apps/backend/src/analysis/gemini.adapter.ts"
git --literal-pathspecs add -- "apps/backend/src/app.ts"
git --literal-pathspecs add -- "apps/backend/src/config/env.schema.ts"
git --literal-pathspecs add -- "apps/backend/src/config/loadConfig.test.ts"
git --literal-pathspecs add -- "apps/backend/src/http/routes/analysis.route.ts"
git --literal-pathspecs add -- "apps/backend/src/media/renderer.cloudrun.ts"
git commit -m "CL-007: implement protected grounded source analysis"
```

## 4. CL-007: integrate browser analysis and recoverable cleanup

Stage these whole files, then commit:

```powershell
git --literal-pathspecs add -- "apps/frontend/src/app/api/analysis/[action]/route.test.ts"
git --literal-pathspecs add -- "apps/frontend/src/app/api/analysis/[action]/route.ts"
git --literal-pathspecs add -- "apps/frontend/src/app/privacy-dialog.tsx"
git --literal-pathspecs add -- "apps/frontend/src/features/media/browser.workspace.test.ts"
git --literal-pathspecs add -- "apps/frontend/src/features/media/browser.workspace.ts"
git --literal-pathspecs add -- "apps/frontend/src/features/media/source.checksum.test.ts"
git --literal-pathspecs add -- "apps/frontend/src/features/media/source.checksum.ts"
git --literal-pathspecs add -- "apps/frontend/src/features/media/source.worker.ts"
git --literal-pathspecs add -- "apps/frontend/src/features/media/workspace.journal.test.ts"
git --literal-pathspecs add -- "apps/frontend/src/features/media/workspace.journal.ts"
git --literal-pathspecs add -- "apps/frontend/src/features/media/workspace.restore.ts"
git --literal-pathspecs add -- "apps/frontend/src/features/media/workspace.schema.ts"
git --literal-pathspecs add -- "apps/frontend/src/features/sample/sample.experience.tsx"
git --literal-pathspecs add -- "apps/frontend/src/features/session/session.provider.tsx"
git --literal-pathspecs add -- "apps/frontend/src/features/source-analysis/analysis-challenge.tsx"
git --literal-pathspecs add -- "apps/frontend/src/features/source-analysis/source-analysis.api.ts"
git --literal-pathspecs add -- "apps/frontend/src/features/source-analysis/source-analysis.flow.test.ts"
git --literal-pathspecs add -- "apps/frontend/src/features/source-analysis/source-analysis.flow.ts"
git commit -m "CL-007: integrate browser analysis and recoverable cleanup"
```

## 5. CL-008: implement validated selected-range speaker focus

Stage these whole files, then commit:

```powershell
git --literal-pathspecs add -- "apps/backend/src/assembly/gemini-speaker-focus.ts"
git --literal-pathspecs add -- "apps/backend/src/assembly/selected-focus.test.ts"
git --literal-pathspecs add -- "apps/backend/src/assembly/selected-focus.usecase.ts"
git --literal-pathspecs add -- "apps/backend/src/assembly/speaker-focus.test.ts"
git --literal-pathspecs add -- "apps/backend/src/assembly/speaker-focus.ts"
git --literal-pathspecs add -- "apps/renderer/feasibility/selected-proxy.ts"
git --literal-pathspecs add -- "packages/composition/src/clip.composition.tsx"
git --literal-pathspecs add -- "packages/composition/src/focus-layout.test.ts"
git --literal-pathspecs add -- "packages/composition/src/focus-layout.ts"
git commit -m "CL-008: implement validated selected-range speaker focus"
```

## 6. CL-007: document source analysis and local verification

Stage these whole files, then commit:

```powershell
git --literal-pathspecs add -- "apps/backend/README.md"
git --literal-pathspecs add -- "apps/frontend/README.md"
git --literal-pathspecs add -- "apps/renderer/README.md"
git --literal-pathspecs add -- "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md"
git --literal-pathspecs add -- "docs/architecture/GEMINI_REMOTION_MIGRATION.md"
git --literal-pathspecs add -- "docs/architecture/MIGRATION_FILE_INVENTORY.md"
git --literal-pathspecs add -- "docs/operations/COST_MODEL.md"
git --literal-pathspecs add -- "docs/operations/GROUNDED_ANALYSIS_CHECK.md"
git --literal-pathspecs add -- "docs/operations/PROVIDER_SETUP.md"
git --literal-pathspecs add -- "docs/tickets/CL-007-008-COMMIT_PLAN.md"
git --literal-pathspecs add -- "docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md"
git --literal-pathspecs add -- "docs/tickets/README.md"
git --literal-pathspecs add -- "eslint.config.mjs"
git commit -m "CL-007: document source analysis and local verification"
```

## 7. CL-008: record selected-focus verification and remaining gates

Stage these whole files, then commit:

```powershell
git --literal-pathspecs add -- "docs/tickets/CL-008-productionize-active-speaker-assembly.md"
git commit -m "CL-008: record selected-focus verification and remaining gates"
```

## Completion check

After the seventh commit, inspect `git status --short` and confirm the planned
files are committed. The sequence covers only the listed non-ignored files.
