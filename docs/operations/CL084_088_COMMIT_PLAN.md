# CL-084–088 whole-file staging and commit plan — 2026-10-26

The owner explicitly approved local staging and commits after full fake-mode,
paid-off verification and documentation, before renewed quality/security audits.
Baseline: main at c0029df; the index is empty. No branch change, push, cloud
access, deployment, provider call or scanner metadata export is authorized.

## One cohesive current-work commit

`CL-084-088: defer exports and add timed text with verified defaults`

CL-084 preview-first/export-on-demand, CL-085 Jump to/duration/Remove cards,
CL-086 timed Text and shared typography, CL-087 one-request titles/defaults/stages,
and CL-088 final verification/compact-inspector fix share whole contract, batch,
editor, composition and proof files. Keep them atomic so the snapshot includes
its dependency-complete contracts, implementation, regressions and owning docs.
Do not split coupled files by partial hunks or commit incomplete package layers.

Stage each path below exactly once, as a whole file. The plan includes itself.
Ignored env/config, tools, builds, screenshots/media, retained sources, Downloads,
private logs and generated verification scratch are excluded. All listed files
were pending for this owner request; no unrelated changes are intentionally
included. Audit work starts only after this snapshot is validated and committed.

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Current owner interaction/AFK operating authorization. |
| `apps/backend/local/README.md` | Narrow owning product/operation/progress and verification documentation. |
| `apps/backend/local/clip-batch.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/backend/local/clip-batch.ts` | Backend preview/export, checkpoint/title/default/stage/draft integration or current-source proof build. |
| `apps/backend/local/clip-title.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/backend/local/clip-title.ts` | Backend preview/export, checkpoint/title/default/stage/draft integration or current-source proof build. |
| `apps/backend/local/draft-store.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/backend/local/draft-store.ts` | Backend preview/export, checkpoint/title/default/stage/draft integration or current-source proof build. |
| `apps/backend/local/edit-clip.ts` | Backend preview/export, checkpoint/title/default/stage/draft integration or current-source proof build. |
| `apps/backend/local/fake-clips.ts` | Backend preview/export, checkpoint/title/default/stage/draft integration or current-source proof build. |
| `apps/backend/local/hosted-workflow.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/backend/local/provider-ai.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/backend/local/provider-ai.ts` | Backend preview/export, checkpoint/title/default/stage/draft integration or current-source proof build. |
| `apps/backend/local/provider-compatibility.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/backend/local/server.ts` | Backend preview/export, checkpoint/title/default/stage/draft integration or current-source proof build. |
| `apps/backend/local/source-acquisition.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/backend/local/worker-port.ts` | Backend preview/export, checkpoint/title/default/stage/draft integration or current-source proof build. |
| `apps/backend/src/server.ts` | Safe allowlisted startup configuration field diagnostic. |
| `apps/backend/vitest.config.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/frontend/src/features/local-editing/README.md` | Narrow owning product/operation/progress and verification documentation. |
| `apps/frontend/src/features/local-editing/clip-batch-panel.tsx` | Review cards, shared text/caption inspector, defaults/readiness and bounded desktop settings. |
| `apps/frontend/src/features/local-editing/clip-editor.tsx` | Review cards, shared text/caption inspector, defaults/readiness and bounded desktop settings. |
| `apps/frontend/src/features/local-editing/clip-readiness.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/frontend/src/features/local-editing/clip-readiness.ts` | Review cards, shared text/caption inspector, defaults/readiness and bounded desktop settings. |
| `apps/frontend/src/features/local-editing/clip-stage.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/frontend/src/features/local-editing/clip-stage.ts` | Review cards, shared text/caption inspector, defaults/readiness and bounded desktop settings. |
| `apps/frontend/src/features/local-editing/editor-state.ts` | Review cards, shared text/caption inspector, defaults/readiness and bounded desktop settings. |
| `apps/frontend/src/features/local-editing/experience.tsx` | Review cards, shared text/caption inspector, defaults/readiness and bounded desktop settings. |
| `apps/frontend/src/features/local-editing/moment-selection.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/frontend/src/features/local-editing/moment-selection.ts` | Review cards, shared text/caption inspector, defaults/readiness and bounded desktop settings. |
| `apps/frontend/src/features/local-editing/picture-timing.tsx` | Review cards, shared text/caption inspector, defaults/readiness and bounded desktop settings. |
| `apps/frontend/src/features/local-editing/position-fields.tsx` | Review cards, shared text/caption inspector, defaults/readiness and bounded desktop settings. |
| `apps/frontend/src/features/local-editing/runtime-capabilities.test.tsx` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/frontend/src/features/local-editing/selection-panel.tsx` | Review cards, shared text/caption inspector, defaults/readiness and bounded desktop settings. |
| `apps/frontend/src/features/local-editing/style.css` | Review cards, shared text/caption inspector, defaults/readiness and bounded desktop settings. |
| `apps/frontend/src/features/local-editing/styled-caption.test.tsx` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/frontend/src/features/local-editing/text-inspector.tsx` | Review cards, shared text/caption inspector, defaults/readiness and bounded desktop settings. |
| `apps/frontend/src/features/local-editing/text-layers.test.tsx` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `apps/frontend/src/features/local-editing/typography-fields.tsx` | Review cards, shared text/caption inspector, defaults/readiness and bounded desktop settings. |
| `apps/renderer/local/README.md` | Narrow owning product/operation/progress and verification documentation. |
| `apps/renderer/local/clip-preview.ts` | Playback-only native preparation and unchanged explicit final-render integration. |
| `apps/renderer/local/clip-render.ts` | Playback-only native preparation and unchanged explicit final-render integration. |
| `apps/renderer/local/server.ts` | Playback-only native preparation and unchanged explicit final-render integration. |
| `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` | Narrow owning product/operation/progress and verification documentation. |
| `docs/operations/CL084_088_COMMIT_PLAN.md` | Explicit exhaustive whole-file staging/commit allocation. |
| `docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md` | Narrow owning product/operation/progress and verification documentation. |
| `docs/operations/LOCAL_WORKFLOW.md` | Narrow owning product/operation/progress and verification documentation. |
| `docs/tickets/CL-084-preview-first-export-on-demand.md` | CL-084 plan, delivered behavior and actual evidence/limits. |
| `docs/tickets/CL-085-review-moment-cards.md` | CL-085 plan, delivered behavior and actual evidence/limits. |
| `docs/tickets/CL-086-timed-text-and-shared-typography.md` | CL-086 plan, delivered behavior and actual evidence/limits. |
| `docs/tickets/CL-087-ai-titles-defaults-and-preparation-stages.md` | CL-087 plan, delivered behavior and actual evidence/limits. |
| `docs/tickets/CL-088-fake-mode-verification-and-commit.md` | CL-088 plan, delivered behavior and actual evidence/limits. |
| `docs/tickets/README.md` | Narrow owning product/operation/progress and verification documentation. |
| `packages/composition/local/README.md` | Narrow owning product/operation/progress and verification documentation. |
| `packages/composition/local/automatic-overlay.tsx` | Shared caption/text paint, layout, timing and raster identity. |
| `packages/composition/local/overlay-frame.ts` | Shared caption/text paint, layout, timing and raster identity. |
| `packages/composition/local/styled-caption.tsx` | Shared caption/text paint, layout, timing and raster identity. |
| `packages/composition/local/text-layer.tsx` | Shared caption/text paint, layout, timing and raster identity. |
| `packages/composition/local/text-paint.ts` | Shared caption/text paint, layout, timing and raster identity. |
| `packages/contracts/README.md` | Narrow owning product/operation/progress and verification documentation. |
| `packages/contracts/local/clips.ts` | Browser-safe preview/text/typography/editor/stage contracts. |
| `packages/contracts/local/edit-overlay.ts` | Browser-safe preview/text/typography/editor/stage contracts. |
| `packages/contracts/local/editor.ts` | Browser-safe preview/text/typography/editor/stage contracts. |
| `packages/contracts/local/index.ts` | Browser-safe preview/text/typography/editor/stage contracts. |
| `packages/contracts/local/text-layers.ts` | Browser-safe preview/text/typography/editor/stage contracts. |
| `packages/contracts/local/text-style.ts` | Browser-safe preview/text/typography/editor/stage contracts. |
| `scripts/verify-hosted-editing-linux.mjs` | Backend preview/export, checkpoint/title/default/stage/draft integration or current-source proof build. |
| `test/boundaries.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/local-application.proof.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/local-design.proof.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/local-moment-cards.proof.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/local-start-over.proof.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/local-text.proof.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/owner-acquisition-api.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/owner-agent-api.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/owner-batch.proof.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/owner-controls-browser.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/owner-editor.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/owner-handoff.proof.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/owner-hosted-editor.proof.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/owner-ranges.proof.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/owner-text-fixture.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `test/owner-text.test.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |
| `vitest.config.ts` | Synthetic regression/browser/native proof or bounded test setup; no live transport. |

## Stage and commit gates

- Required full/focused evidence and each confirmed fix are recorded in CL-088;
  the final unit command must finish cleanly before staging. Synthetic evidence
  does not approve paid AI, personal visuals, actual hosted settings or release.
- Read-only validate the settled combined CL-084–088 diff against the packets.
  Independently confirm/fix any issue and revalidate before staging.
- Verify pending paths exactly equal this list, with an empty index. Inspect all
  staged paths/diff/whitespace; reject env/private/generated/media artifacts and
  credential-shaped strings. Stage only these explicit paths; do not use add -A.
- Commit the exact ticket-prefixed subject above under the direct human grant.
  Confirm the committed path allocation, hash and clean index/worktree. Then
  execute CL-089 quality and CL-090 security with separate documented whole-file
  plans and commits. Do not absorb earlier isolated audit commits blindly.
