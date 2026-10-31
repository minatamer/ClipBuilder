# CL-180–183 whole-file commit plan

Owner authorization, 2026-10-31: file a file-level plan, stage and commit all
current changes in multiple ticket-prefixed local commits, and run fresh Linux
production builds plus packaged fake/paid-off checks. No push or deployment.
Preserve the running app/session, local Gemini selection, ignored configuration,
retained/private media, exports and diagnostic logs. No paid/provider calls.

Baseline `fe6dd745fec017d358b1a765a467fd4f1ceebc82`, branch `main`, initially empty index. 40 allocated paths including deletions, this plan and CL-183.

Every complete file appears exactly once. Shared files stay intact; no hunk
splitting. These are dependent review commits; combined verification applies to
the final tree, not independent intermediate releases. Earlier ticket statements
about uncommitted work describe their historical handoffs and are superseded by
this explicit owner authorization.

## 1. `CL-183: plan file-level commit packaging`

Commit the whole-file allocation and gates first.

- `docs/operations/CL180_183_COMMIT_PLAN.md`

## 2. `CL-180: fix packaged FFmpeg overlay compatibility`

Keep the reproduced Linux overlay compatibility fix and repaired synthetic selectors together.

- `apps/renderer/local/clip-render.ts`
- `docs/tickets/CL-180-current-linux-build-and-provider-parity-review.md`
- `scripts/verify-hosted-editing-linux.mjs`

## 3. `CL-181: align Gemini transcription visual plans and focus policy`

Shared decoder rename/deletions, bounded transcription/charging, common focus instructions and their tests stay whole.

- `apps/backend/local/analysis.ts`
- `apps/backend/local/codex-ai.test.ts`
- `apps/backend/local/codex-ai.ts`
- `apps/backend/local/codex-visual-plan.test.ts`
- `apps/backend/local/codex-visual-plan.ts`
- `apps/backend/local/focus-planning-policy.ts`
- `apps/backend/local/gemini-critique.ts`
- `apps/backend/local/hosted-workflow.test.ts`
- `apps/backend/local/hosted-workflow.ts`
- `apps/backend/local/provider-ai.test.ts`
- `apps/backend/local/provider-ai.ts`
- `apps/backend/local/visual-discovery.ts`
- `apps/backend/local/visual-plan.test.ts`
- `apps/backend/local/visual-plan.ts`
- `docs/tickets/CL-181-gemini-provider-parity.md`

## 4. `CL-182: verify Gemini search execution and image retrieval`

Safe diagnostic contracts, actual stateless Search transport/decoder, production wiring and synthetic protocol/raster regressions.

- `apps/backend/local/provider-composition.ts`
- `apps/backend/src/analysis/analysis.composition.ts`
- `apps/backend/src/analysis/analysis.diagnostics.test.ts`
- `apps/backend/src/analysis/analysis.diagnostics.ts`
- `apps/backend/src/assembly/gemini-image-search.test.ts`
- `apps/backend/src/assembly/gemini-image-search.ts`
- `apps/backend/src/assembly/gemini-search-response.ts`
- `apps/backend/src/assembly/picture-raster.ts`
- `apps/backend/src/assembly/web-pictures.test.ts`
- `apps/backend/src/assembly/web-pictures.ts`
- `apps/backend/src/diagnostics/execution-failure.test.ts`
- `apps/backend/src/diagnostics/execution-failure.ts`
- `docs/tickets/CL-182-gemini-search-execution.md`
- `packages/contracts/local/execution-diagnostics.ts`
- `packages/contracts/local/visual-diagnostics.ts`
- `test/local-gemini-search.proof.ts`

## 5. `CL-180-183: record fresh Linux checks and release handoff`

Owning guides, decisions, aggregate validation/artifact evidence, owner-run search observation, commit identities and remaining release gates.

- `apps/backend/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md`
- `docs/tickets/CL-183-fresh-linux-and-commit-packaging.md`
- `docs/tickets/README.md`

## Verification and exclusions

Before source commits: build fresh frontend/backend Linux/amd64 images from
`scripts/prepare-app-image.mjs` closed contexts with anonymous Docker configuration.
Run actual packaged non-root frontend/backend runtime probes and the shared
synthetic upload/editor/native export/cancel/retry/quota/cleanup proof, including
the 500-MiB upload-byte boundary, at 2 CPU/8 GiB/5376-MiB scratch. Runtime containers
have no network or published ports and mount no owner media/configuration. Reuse
the completed CL-180–182 source checks; run relevant final fake/type/format gates
when required by current evidence. Record immutable image IDs, exact limitations
and cleanup. Build dependency downloads do not authorize provider or cloud calls.

The final evidence commit records the preceding commit IDs. Verify all allocated
paths are committed exactly once, index/worktree clean, HEAD/branch expected and
no proof containers remain. Do not add ignored files, environment files, private
captures, generated media, build contexts/bundles or test output. Do not amend,
rewrite history, push, submit a registry image or deploy.

Owner live search execution has been observed in existing logs; this packaging
triggers no real provider request. Image/editorial quality, actual hosted identity/
challenge/resources/lifecycle/capacity/cost and release acceptance remain owner
gates. Synthetic low-resolution/short exports do not certify maximum-duration 4K.
