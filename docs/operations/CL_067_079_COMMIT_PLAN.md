# CL-067-079 file-level commit plan - 2026-10-25

Owner explicitly authorized staging and committing all current pending work in
this chat. Manual real-media/visual testing is planned for tomorrow (2026-10-26).
This is local Git approval only: no push, deployment, cloud changes or paid test.

Baseline: main at 5169ecc. The index was empty. Pending work belongs to
implemented CL-067 through CL-079 plus their owning documentation and proofs.
No ignored environment, retained/private media, generated images, native build
outputs, Downloads files or private diagnostics enter either commit.

Use whole files. CL-075 is independent; the other ticket changes share editor,
contracts, backend, renderer and proof files, so they form one atomic feature
commit. Splitting that shared code by filename into ticket-sized commits would
leave dependency-incomplete snapshots. Prefixes identify every included ticket.

## Commit 1

`CL-075: fix large local video uploads`

Exclude only raw picked-video intake from Next document-Proxy body cloning;
retain route origin/authentication checks and verify actual large-byte streaming.

| File | Scope |
| --- | --- |
| `apps/frontend/src/proxy.ts` | CL-075 implementation, focused regression/proof or ticket evidence. |
| `apps/frontend/src/proxy.test.ts` | CL-075 implementation, focused regression/proof or ticket evidence. |
| `apps/frontend/src/server/local-workflow.test.ts` | CL-075 implementation, focused regression/proof or ticket evidence. |
| `test/local-large-upload.proof.ts` | CL-075 implementation, focused regression/proof or ticket evidence. |
| `docs/tickets/CL-075-large-local-video-upload.md` | CL-075 implementation, focused regression/proof or ticket evidence. |

## Commit 2

`CL-067-079: deliver focus, captions, transparency and editor controls`

Shared intake/editor polish, portrait-focus model and position UX, source-quality
vertical exports, continuous playback, footer reset/status cleanup, picture
Capture, default-empty fake content and explicit fake/paid clip captions,
fixed-clock caption text editing, and alpha-preserving pictures. Include source
of truth, all remaining packets/proofs, release feature matrix and this plan.

| File | Scope |
| --- | --- |
| `AGENTS.md` | Owning decisions, operation boundaries or feature/release evidence. |
| `apps/backend/local/README.md` | Owning decisions, operation boundaries or feature/release evidence. |
| `apps/backend/local/SOURCE_ACQUISITION.md` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/caption-provider-composition.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `apps/backend/local/caption-provider-composition.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/clip-batch.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `apps/backend/local/clip-batch.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/clip-caption-port.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/diagnostics.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `apps/backend/local/diagnostics.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/draft-store.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `apps/backend/local/draft-store.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/edit-clip.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/fake-clips.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/fake-content.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `apps/backend/local/fake-content.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/hosted-workflow.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `apps/backend/local/hosted-workflow.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/personal-picture.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `apps/backend/local/personal-picture.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/provider-ai.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `apps/backend/local/provider-ai.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/provider-input.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `apps/backend/local/runtime.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/server.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/backend/local/workspace-files.ts` | Local/shared backend use cases, provider composition, storage or diagnostics. |
| `apps/frontend/README.md` | Owning decisions, operation boundaries or feature/release evidence. |
| `apps/frontend/src/features/local-editing/README.md` | Owning decisions, operation boundaries or feature/release evidence. |
| `apps/frontend/src/features/local-editing/caption-text-editor.tsx` | Shared intake/editor UI, state, capture and local/hosted gates. |
| `apps/frontend/src/features/local-editing/clip-batch-panel.tsx` | Shared intake/editor UI, state, capture and local/hosted gates. |
| `apps/frontend/src/features/local-editing/clip-editor.tsx` | Shared intake/editor UI, state, capture and local/hosted gates. |
| `apps/frontend/src/features/local-editing/editor-state.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `apps/frontend/src/features/local-editing/editor-state.ts` | Shared intake/editor UI, state, capture and local/hosted gates. |
| `apps/frontend/src/features/local-editing/experience.tsx` | Shared intake/editor UI, state, capture and local/hosted gates. |
| `apps/frontend/src/features/local-editing/focus-editor.tsx` | Shared intake/editor UI, state, capture and local/hosted gates. |
| `apps/frontend/src/features/local-editing/focus-positions.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `apps/frontend/src/features/local-editing/focus-positions.ts` | Shared intake/editor UI, state, capture and local/hosted gates. |
| `apps/frontend/src/features/local-editing/focus-preview-controls.tsx` | Shared intake/editor UI, state, capture and local/hosted gates. |
| `apps/frontend/src/features/local-editing/picture-timing.tsx` | Shared intake/editor UI, state, capture and local/hosted gates. |
| `apps/frontend/src/features/local-editing/style.css` | Shared intake/editor UI, state, capture and local/hosted gates. |
| `apps/frontend/src/features/local-editing/use-editor-preview.ts` | Shared intake/editor UI, state, capture and local/hosted gates. |
| `apps/frontend/src/features/local-editing/youtube-preview.tsx` | Shared intake/editor UI, state, capture and local/hosted gates. |
| `apps/renderer/local/README.md` | Owning decisions, operation boundaries or feature/release evidence. |
| `apps/renderer/local/clip-render.ts` | Original-source quality, focus, alpha and provider-audio native work. |
| `apps/renderer/local/export-profile.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `apps/renderer/local/export-profile.ts` | Original-source quality, focus, alpha and provider-audio native work. |
| `apps/renderer/local/focus-filter.ts` | Original-source quality, focus, alpha and provider-audio native work. |
| `apps/renderer/local/media.ts` | Original-source quality, focus, alpha and provider-audio native work. |
| `apps/renderer/local/provider-media.ts` | Original-source quality, focus, alpha and provider-audio native work. |
| `apps/renderer/local/rasterize-overlay.ts` | Original-source quality, focus, alpha and provider-audio native work. |
| `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` | Owning decisions, operation boundaries or feature/release evidence. |
| `docs/operations/CL_067_079_COMMIT_PLAN.md` | Owner-approved whole-file plan and commit handoff. |
| `docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md` | Owning decisions, operation boundaries or feature/release evidence. |
| `docs/operations/LOCAL_WORKFLOW.md` | Owning decisions, operation boundaries or feature/release evidence. |
| `docs/tickets/CL-067-intake-preview-and-upload-area.md` | CL-067 packet and recorded verification. |
| `docs/tickets/CL-068-automatic-and-manual-person-focus.md` | CL-068 packet and recorded verification. |
| `docs/tickets/CL-069-focus-editor-positions-and-capture.md` | CL-069 packet and recorded verification. |
| `docs/tickets/CL-070-export-resolution-and-quality-audit.md` | CL-070 packet and recorded verification. |
| `docs/tickets/CL-071-focus-preview-continuous-playback.md` | CL-071 packet and recorded verification. |
| `docs/tickets/CL-072-independent-camera-positions.md` | CL-072 packet and recorded verification. |
| `docs/tickets/CL-073-footer-start-over.md` | CL-073 packet and recorded verification. |
| `docs/tickets/CL-074-remove-footer-mode-status.md` | CL-074 packet and recorded verification. |
| `docs/tickets/CL-076-confirm-position-person.md` | CL-076 packet and recorded verification. |
| `docs/tickets/CL-077-picture-timing-capture.md` | CL-077 packet and recorded verification. |
| `docs/tickets/CL-078-caption-generation-and-word-editing.md` | CL-078 packet and recorded verification. |
| `docs/tickets/CL-079-transparent-picture-overlays.md` | CL-079 packet and recorded verification. |
| `docs/tickets/README.md` | Owning decisions, operation boundaries or feature/release evidence. |
| `packages/composition/local/automatic-overlay.tsx` | Shared preview/native overlay. |
| `packages/contracts/local/assets.ts` | Shared focus/caption/asset contracts and pure compilation. |
| `packages/contracts/local/caption-generation.ts` | Shared focus/caption/asset contracts and pure compilation. |
| `packages/contracts/local/caption-text.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `packages/contracts/local/caption-text.ts` | Shared focus/caption/asset contracts and pure compilation. |
| `packages/contracts/local/clips.ts` | Shared focus/caption/asset contracts and pure compilation. |
| `packages/contracts/local/diagnostics.ts` | Shared focus/caption/asset contracts and pure compilation. |
| `packages/contracts/local/edit-overlay.ts` | Shared focus/caption/asset contracts and pure compilation. |
| `packages/contracts/local/editor.ts` | Shared focus/caption/asset contracts and pure compilation. |
| `packages/contracts/local/focus.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `packages/contracts/local/focus.ts` | Shared focus/caption/asset contracts and pure compilation. |
| `packages/contracts/local/hosted-editing.ts` | Shared focus/caption/asset contracts and pure compilation. |
| `packages/contracts/local/index.ts` | Shared focus/caption/asset contracts and pure compilation. |
| `packages/contracts/local/runtime.ts` | Shared focus/caption/asset contracts and pure compilation. |
| `test/local-export-quality.proof.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/local-focus-editor.proof.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/local-focus-native.proof.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/local-intake-preview.proof.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/local-start-over.proof.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/owner-acquisition-api.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/owner-agent-api.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/owner-batch.proof.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/owner-content-fixture.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/owner-controls-browser.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/owner-editor.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/owner-handoff.proof.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/owner-hosted-editor.proof.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/owner-local.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/owner-provider-host.test.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |
| `test/owner-provider.proof.ts` | Synthetic regression, current-source browser/native proof or explicit fixture. |

## Checks and gates

- Existing current-source evidence: 564 local fake/paid-off unit tests; focused
  type/lint/format and no-Node contract checks; browser/native focus, caption,
  picture alpha/timing and source-quality proofs. These are not live acceptance.
- Before each commit: inspect exactly the listed staged paths, diff/whitespace,
  forbidden/sensitive-file inventory and dependency-complete grouping. Do not
  stage ignored files or unplanned changes. Preserve actual newline semantics.
- After commits: verify both ticket-prefixed subjects and a clean index/worktree.
  Report hashes and link the deployment feature matrix. Keep app running in its
  owner-managed fake mode. Git does not imply owner visual or release acceptance.
- Hosted release still needs tomorrow's owner review, current-feature Linux image
  verification and the deferred allocation/budget/max-workload checks in
  HOSTED_EDITOR_RELEASE_PREPARATION.md. No cloud operation was run for this audit.

## Execution record

Commit 1 completed as `458518c` with exactly the five planned files. Its focused
proxy/origin checks passed (two files / ten tests); staged whitespace checks passed.
Commit 2 contains the remaining 97 planned files, including this plan and the
hosted feature matrix. Its exact hash is reported in the chat/Git log because a
commit cannot embed its own final hash. Current source has 564 passing local
fake/paid-off tests and the packet-recorded browser/native/type/lint evidence;
manual acceptance and deployment remain pending. No live cloud query was needed
to determine source visibility, and no push/deployment is part of this handoff.
