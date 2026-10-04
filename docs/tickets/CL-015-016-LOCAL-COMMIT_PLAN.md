# CL-015 / CL-016 local preparation file-level commit plan

On 2026-10-04 the owner authorized resolving restart, then preparing and executing
a whole-file commit plan for all pending work. Baseline:
(
22631c54e159c62363fde83302225c12fdf3a68d
) on main, with an empty index.

This plan covers 100 whole files. Configuration, source streaming and the Gemini prompt review share
composition, schemas and tests; their settled implementation is one atomic group.
The second group records the owning packets and release evidence. No hunks are
split. The generated Next type-entrypoint drift was returned to its baseline.
Ignored app-local configuration, retained masters, media, credentials, logs,
runtime records and build output remain excluded. Personal skill edits are
outside this repository.

## 1. Implementation and owning guides

Message: `CL-016: integrate protected MP4 playback and local processing setup`

Stage exactly 95 paths:

- `.env.example`
- `.gitignore`
- `AGENTS.md`
- `apps/backend/.env.example`
- `apps/backend/README.md`
- `apps/backend/runtime.example.json`
- `apps/backend/src/admission/admission.composition.ts`
- `apps/backend/src/admission/processing.admission.test.ts`
- `apps/backend/src/admission/processing.grant.ts`
- `apps/backend/src/analysis/analysis.composition.ts`
- `apps/backend/src/analysis/analysis.prompt.ts`
- `apps/backend/src/analysis/analysis.provider-shape.ts`
- `apps/backend/src/analysis/analysis.test.ts`
- `apps/backend/src/analysis/analysis.usecase.ts`
- `apps/backend/src/analysis/gemini.adapter.ts`
- `apps/backend/src/assembly/selected-focus.test.ts`
- `apps/backend/src/composition.ts`
- `apps/backend/src/config/env.schema.ts`
- `apps/backend/src/config/loadConfig.test.ts`
- `apps/backend/src/config/loadConfig.ts`
- `apps/backend/src/config/runtime.local.ts`
- `apps/backend/src/config/runtime.schema.ts`
- `apps/backend/src/demo/developmentPreview.test.ts`
- `apps/backend/src/demo/sampleSession.test.ts`
- `apps/backend/src/http/routes/analysis.route.ts`
- `apps/backend/src/media/renderer.cloudrun.test.ts`
- `apps/backend/src/media/retained-sample.gcs.ts`
- `apps/backend/src/media/retained-sample.processing.test.ts`
- `apps/backend/src/media/retained-sample.processing.ts`
- `apps/backend/src/media/retained-sample.test.ts`
- `apps/backend/src/server.ts`
- `apps/backend/test/environment.fixture.ts`
- `apps/backend/vitest.config.ts`
- `apps/frontend/.env.example`
- `apps/frontend/feasibility/browser-media/server.mjs`
- `apps/frontend/package.json`
- `apps/frontend/README.md`
- `apps/frontend/scripts/verify-release-artifact.ts`
- `apps/frontend/src/app/api/analysis/[action]/route.ts`
- `apps/frontend/src/features/media/audio.extraction.ts`
- `apps/frontend/src/features/media/browser.workspace.test.ts`
- `apps/frontend/src/features/media/browser.workspace.ts`
- `apps/frontend/src/features/media/media.errors.ts`
- `apps/frontend/src/features/media/source.worker.test.ts`
- `apps/frontend/src/features/media/source.worker.ts`
- `apps/frontend/src/features/media/workspace.restore.ts`
- `apps/frontend/src/features/media/workspace.schema.ts`
- `apps/frontend/src/features/sample/development.input.ts`
- `apps/frontend/src/features/sample/development.progress.test.tsx`
- `apps/frontend/src/features/sample/development.progress.ts`
- `apps/frontend/src/features/sample/lifecycle-recovery.test.ts`
- `apps/frontend/src/features/sample/portrait-player.tsx`
- `apps/frontend/src/features/sample/retained-sample.input.test.ts`
- `apps/frontend/src/features/sample/retained-sample.input.ts`
- `apps/frontend/src/features/sample/sample.experience.tsx`
- `apps/frontend/src/features/sample/source-preview.test.tsx`
- `apps/frontend/src/features/sample/source-preview.tsx`
- `apps/frontend/src/features/session/session.persistence.test.ts`
- `apps/frontend/src/features/session/session.reducer.ts`
- `apps/frontend/src/features/session/session.types.ts`
- `apps/frontend/src/features/source-analysis/source-analysis.api.ts`
- `apps/frontend/src/features/source-analysis/source-analysis.flow.test.ts`
- `apps/frontend/src/features/source-analysis/source-analysis.flow.ts`
- `apps/frontend/vitest.config.ts`
- `apps/renderer/feasibility/node-media.ts`
- `apps/renderer/feasibility/selected-proxy.ts`
- `apps/renderer/README.md`
- `apps/renderer/src/expiry/media-sessions.test.ts`
- `apps/renderer/src/expiry/media-sessions.ts`
- `apps/renderer/src/expiry/temporary-intent.ts`
- `apps/renderer/src/media/inspection.ts`
- `apps/renderer/src/media/source-inspection.test.ts`
- `apps/renderer/vitest.config.ts`
- `docs/architecture/BROWSER_OWNED_MEDIA.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/CLOUD_RUN_RENDERER_SETUP.md`
- `docs/operations/GROUNDED_ANALYSIS_CHECK.md`
- `docs/operations/LOCAL_RELEASE_PREPARATION.md`
- `docs/operations/PROVIDER_SETUP.md`
- `docs/operations/RETAINED_SAMPLE_SETUP.md`
- `docs/operations/THIRD_PARTY_SOFTWARE.md`
- `packages/composition/vitest.config.ts`
- `packages/contracts/src/api.schema.ts`
- `packages/contracts/src/cloud-media.schema.ts`
- `packages/contracts/src/cloud-media.test.ts`
- `packages/contracts/src/contracts.test.ts`
- `packages/contracts/src/grounded-analysis.schema.ts`
- `packages/contracts/src/media.schema.ts`
- `packages/contracts/vitest.config.ts`
- `test/deterministic.environment.ts`
- `test/no-network.setup.ts`
- `test/pre-import-guard.fixture.ts`
- `test/pre-import-guard.test.ts`
- `test/release-artifact.test.ts`
- `vitest.config.ts`

## 2. Ticket and verification evidence

Message: `CL-015: record local readiness and pre-deployment gates`

Stage exactly 5 paths:

- `docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md`
- `docs/tickets/CL-015-016-LOCAL-COMMIT_PLAN.md`
- `docs/tickets/CL-015-deploy-validate-measure-and-rollback.md`
- `docs/tickets/CL-016-source-preview-and-retained-sample.md`
- `docs/tickets/README.md`

## Validation and execution

All five root checks passed: `corepack pnpm format:check`, `lint`, `typecheck`,
`test:unit`, and `build`. The settled unit run passes 721 synthetic tests in
70 files. Test entry points hardcode fake/paid-off configuration, remove both
plain and legacy grant secrets, skip environment files and block provider calls.
The focused configuration/admission/preview run passes 54 tests. A read-only
validation pass finds no actionable local issue.

Verified shutdown captured 23 owned identities, with zero survivors/listeners
through three seconds of stabilization. Normal backend/frontend replacement
startup returns 200 for health, `/start`, and `/api/sample/config`. Content-safe
runtime records/logs are in ignored `artifacts/local-run/restart-20261004-plain-key/`.
The local app is in real mode; intake and approved retained playback are available.
Paid analysis/assembly/render are unavailable. Startup reports remaining Google
transfer approval, paid-project confirmation, Turnstile hostname and renderer
connection prerequisites, with no missing/invalid grant-key code. No private file
was inspected, and no storage/provider/processing request was performed.

The local frontend build still contains 26 external package links and is not an
acceptable immutable release artifact. Native full-fixture, physical device,
perceptual audio/film, real AI/widget/output/cleanup, rights/provider transfer,
numerical AI/cloud/build allowance, private renderer revision and public deployment
checks remain open. Fake results do not establish live quality; no local AI model
is used. The favicon/crawlability and artifacts-cleanup deployment checkpoints
remain required and unchecked.

Before each commit, compare the index to the exact group, check whitespace,
and inspect the staged secret-free examples/content. Commit the authorized group
without pushing. Afterward verify both inventories, an empty index and no
unplanned worktree changes. Keep the requested healthy apps running.

Implementation executed: `4e72847610ce69e87d88e09fe12a51d1e3e31f67` contains
exactly the 95 listed paths, verified against the plan after committing.
The index is empty before staging the five-path evidence group. The explicit
synthetic inherited-secret pre-import check also passes five tests: both grant
variables are removed before imports and fake/paid-off settings remain enforced.
The evidence group is committed with the listed subject, then verified from Git;
its own identifier is reported at handoff to avoid a self-referential record.
