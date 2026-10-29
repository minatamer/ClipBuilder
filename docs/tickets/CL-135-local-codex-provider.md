# CL-135 — local Codex subscription provider

Status: planned. Depends on CL-133/134 committed through `472479e` (clean tree).
Owner AFK authorizes recommendations and local execute/validate after a separately
committed plan and staging/committing all preceding work. The earlier 48 files
and their packaging plan are committed; no prior task is dropped.

Authority: [local Codex design](../architecture/LOCAL_CODEX_AI.md), including
supported subscription inference, local Whisper prerequisites and explicit
limitations for diarization, sampled focus and image generation. No claim of
full Gemini multimodal equivalence. No cloud/deploy/push or agent paid/live calls.

## Ordered file allocation

Commit this ticket, design, source-of-truth decision and index first, before code.
Then execute one packet, extending this allocation before any additional file.

1. Shared browser-safe local Codex policy/job/result shapes under new
   `packages/contracts/local/codex.ts`; extend `index.ts`, `runtime.ts` and
   `diagnostics.ts` only for closed worker jobs/capabilities/errors. Focused tests.
2. Pinned local speech tool admission under `scripts/local-speech-tools.ts`,
   explicit `scripts/prepare-local-speech.mjs`, `package.json` preparation command
   and `THIRD_PARTY_NOTICES.md` license reference if that is the existing owner.
   No dependencies/media/models in Git. Free official tool/model preparation is
   authorized; runtime never downloads. Existing native helpers stay unchanged
   unless their exact integration needs a documented extension.
3. Private worker `apps/renderer/local/codex-media.ts` handles fixed speech/frame
   preparation and Whisper execution; extend `media.ts`, `server.ts` and the
   current worker executable entry for admitted optional speech tooling. Current
   root `scripts/local-media-build.mjs` changes only if explicit bundle wiring
   requires it. Add synthetic native proof.
4. New backend `apps/backend/local/codex-exec.ts`, `codex-ai.ts` and
   `codex-composition.ts` own fixed CLI calls, AI ports and local composition.
   `runtime.ts` supplies normal local real provider and admitted tools; preserve
   `hosted-runtime.ts` Gemini composition. Extend `server.ts` and `workspace-files.ts`
   only for capabilities and owned paths. Reuse transcript/focus/selection
   compilers without changing paid acceptance semantics. Add focused fake tests.
5. Existing frontend `selection-panel.tsx`, `clip-batch-panel.tsx`, `clip-editor.tsx`
   and `experience.tsx` display local provider/setup and accurate caption/transfer
   wording in normal controls. Local capabilities expose no paths/account data;
   hosted excludes local provider fields. Shared inspector/footer patterns stay.
6. Focused contract/backend/frontend tests and new `test/local-codex.proof.ts`
   use only injected inference and synthetic media. App READMEs, local workflow
   guide, design, source of truth/index/ticket record actual behavior/evidence.

## Acceptance

- [ ] All prior tasks packaged; this plan committed before implementation.
- [ ] Normal local real mode routes transcript/moments/selected-frame focus and
      explicit captions through local speech/Codex; hosted Gemini unchanged.
- [ ] Subscription-only auth, no API/Gemini fallback, content-free diagnostics,
      bounded media/processes, cancellation and cleanup verified.
- [ ] Real browser workflow and native exports verified using synthetic media,
      fake Codex/speech results, exact counts and zero paid/provider calls.
- [ ] Setup assets/version/hash/license status accurately recorded; fake mode
      stays fictional/key-free, while real inference needs installed tools and
      ChatGPT login/allowance plus explicit owner action.
- [ ] Scoped validation clean; required types/lint/format pass; normal app healthy
      with current worker. Owner real-AI/ASR/visual/device/rights/hosted/release
      acceptance remains open. No deployment or push.

New Codex implementation remains local for owner review; this request authorizes
committing prior work and this plan, not a later implementation commit.
