# CL-007 / CL-016 current workflow file-level commit plan

On 2026-10-04 the owner explicitly authorized preparing and immediately executing
a file-level commit plan for all current work. Further implementation of the
documented analysis/console fixes is deferred to another day.

Baseline: `7a56a9bd575a26e73c703bd17ca1c7461502aa52` on `main`, with an empty index.
The inventory contains 58 existing modified/new files and this new plan: 59 whole
files across two commits. Shared application wiring, workflow code and regression
tests remain together; no hunks are split.

Owner-managed environment/runtime files, retained masters, real media, local
launchers/logs, QA evidence and build output remain ignored and outside both
commits. This authorizes local commits only; no push, deployment or paid test.

## 1. Workflow implementation, diagnostics and service guides

Message: `CL-007: improve workflow exit and analysis diagnostics`

This group preserves the implemented loading spinner, preview notice removal,
interaction-only verification dialog, existing late-start message rotation,
local-only sample availability, retained-sample transfer correction, provider
cleanup/error classification, and Exit with quiet background cleanup and cookie
reset. It also includes bounded safe analysis diagnostics, their composition and
regression tests. The service guides explain the implemented behavior and limits.

The new request diagnostics and ignored launcher capture were implemented only
after historical logs proved insufficient. The launcher is ignored runtime
evidence, not a committed application module. The original failure is preserved
in diagnostic records; full response-error preservation remains pending.

Stage exactly these 52 paths:

- `apps/backend/README.md`
- `apps/backend/src/admission/processing.admission.ts`
- `apps/backend/src/analysis/analysis.composition.ts`
- `apps/backend/src/analysis/analysis.diagnostics.test.ts`
- `apps/backend/src/analysis/analysis.diagnostics.ts`
- `apps/backend/src/analysis/analysis.test.ts`
- `apps/backend/src/analysis/analysis.usecase.ts`
- `apps/backend/src/analysis/gemini.adapter.ts`
- `apps/backend/src/app.test.ts`
- `apps/backend/src/app.ts`
- `apps/backend/src/composition.ts`
- `apps/backend/src/http/routes/analysis.route.ts`
- `apps/backend/src/http/routes/session-exit.route.test.ts`
- `apps/backend/src/http/routes/session-exit.route.ts`
- `apps/backend/src/media/retained-sample.processing.test.ts`
- `apps/backend/src/media/retained-sample.processing.ts`
- `apps/backend/src/server.ts`
- `apps/frontend/README.md`
- `apps/frontend/scripts/verify-release-artifact.ts`
- `apps/frontend/src/app/api/session/exit/route.test.ts`
- `apps/frontend/src/app/api/session/exit/route.ts`
- `apps/frontend/src/app/page.test.tsx`
- `apps/frontend/src/app/privacy-dialog.tsx`
- `apps/frontend/src/features/media/browser.workspace.test.ts`
- `apps/frontend/src/features/media/browser.workspace.ts`
- `apps/frontend/src/features/media/workspace.schema.ts`
- `apps/frontend/src/features/sample/candidate.review.tsx`
- `apps/frontend/src/features/sample/cloud-result.tsx`
- `apps/frontend/src/features/sample/native-range-playback.test.ts`
- `apps/frontend/src/features/sample/native-range-playback.ts`
- `apps/frontend/src/features/sample/portrait-player.tsx`
- `apps/frontend/src/features/sample/processing-status.tsx`
- `apps/frontend/src/features/sample/review-revision.test.tsx`
- `apps/frontend/src/features/sample/sample.experience.tsx`
- `apps/frontend/src/features/sample/sample.module.css`
- `apps/frontend/src/features/sample/source-preview.test.tsx`
- `apps/frontend/src/features/sample/use-range-playback.ts`
- `apps/frontend/src/features/session/session.exit.test.ts`
- `apps/frontend/src/features/session/session.exit.ts`
- `apps/frontend/src/features/session/session.persistence.ts`
- `apps/frontend/src/features/session/session.provider.tsx`
- `apps/frontend/src/features/session/session.reducer.ts`
- `apps/frontend/src/features/session/session.selectors.ts`
- `apps/frontend/src/features/source-analysis/analysis-challenge.module.css`
- `apps/frontend/src/features/source-analysis/analysis-challenge.tsx`
- `apps/frontend/src/features/source-analysis/processing-challenge.test.tsx`
- `apps/frontend/src/features/source-analysis/processing-challenge.ts`
- `apps/frontend/src/features/source-analysis/source-analysis.api.ts`
- `apps/frontend/src/features/source-analysis/source-analysis.flow.test.ts`
- `apps/frontend/src/features/source-analysis/source-analysis.flow.ts`
- `packages/contracts/src/errors.schema.ts`
- `test/release-artifact.test.ts`

## 2. Owner decisions, verification evidence and deferred fix plan

Message: `CL-007: record analysis follow-up and deployment checkpoints`

This group records the owner decisions, completed synthetic checks and local
restart evidence. It preserves the detailed five-area plan: diagnose/remedy the
analysis failure, rotate from the beginning, correct CSP/style loading, share
Turnstile SDK loading and attribute the CSS preload warning. Only the diagnostic
logging portion is implemented. The historical cause and remaining remedies stay
open, together with public deployment and real processing acceptance.

Stage exactly these seven paths:

- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/GROUNDED_ANALYSIS_CHECK.md`
- `docs/tickets/CL-007-016-WORKFLOW-COMMIT_PLAN.md`
- `docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md`
- `docs/tickets/CL-015-deploy-validate-measure-and-rollback.md`
- `docs/tickets/CL-016-source-preview-and-retained-sample.md`
- `docs/tickets/README.md`

## Verification and execution

The settled application state already passed all five root gates:
`corepack pnpm format:check`, `corepack pnpm lint`, `corepack pnpm typecheck`,
`corepack pnpm test:unit` and `corepack pnpm build`. The final unit result is 785
synthetic tests in 76 files, including 276 backend tests. Tests enforce fake mode,
paid-off flags, no environment-file loading and blocked external network access.
The isolated synthetic launcher check captured four valid diagnostic records,
rejected a payload-bearing record and made zero provider calls.

Verified normal restart left the requested backend/frontend healthy. Readiness
GETs returned 200; no processing request was triggered. Real Step 1 playback
requires approved storage access but no Gemini key. Real analysis requires the
owner's configured key, live capabilities and recorded approvals; paid tests
remain owner-only. No local AI runtime or weights are used. Historical failure
diagnosis, live quality and actual provider/cloud deletion remain unverified.
The Windows frontend build still contains 26 external package links, so acceptable
target-platform release evidence remains pending.

Before staging, compare this exact inventory to Git and scan only the planned
content for prohibited secrets/private assets. After the documentation edits,
check formatting, local documentation targets and whitespace. For each group,
stage only its listed paths, compare the index to the group and check its staged
diff before committing. Verify both commit inventories, an empty index and a
clean worktree afterward. Preserve the healthy local app processes.

Implementation executed: `32f246303272df4e227ace2c8499318a3a1bc0db` contains
exactly the 52 listed paths, verified against Git after committing. Its parent
matches the baseline. Only the seven documentation paths remain, with an empty
index before staging that group.

The final documentation formatting, local link targets, planned inventory,
credential-pattern scan and staged whitespace checks pass. The documentation
group is committed with its listed subject and verified against the seven-path
inventory. Both commits contain all 59 planned files; no additional remedy is
implemented. The second identifier and final clean-worktree result are reported
at handoff to avoid a self-referential commit record.
