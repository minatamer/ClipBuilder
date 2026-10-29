# CL-135 — local Codex subscription provider

Status: implemented and locally validated; owner real-AI/ASR acceptance open.
Plan committed as `04450d6` before implementation.
Depends on CL-133/134 committed through `472479e` (clean tree).
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

Exact integration refinements before coding: the worker executable entry is
`apps/renderer/local/entry.ts`; notices belong in `docs/operations/THIRD_PARTY_SOFTWARE.md`.
The existing native RPC has an 8-KiB response bound: keep it. New worker jobs
return a hash/byte receipt; the backend reads/removes a confined bounded JSON
artifact under workspace ownership. `worker-port.ts` receives only the new
speech job's longer local deadline (no global response-size increase). The
renderer owns temporary audio/frames; `workspace-files.ts` binds receipt reads.
Whisper release v1.9.5 has no Windows assets: use its official current b5454 CPU
build with a pinned release SHA-256 rather than an old binary. Pin model hash
from the upstream model repository. No caller-supplied executable/model paths.
`apps/frontend/src/features/local-editing/codex-errors.ts` maps only closed safe
failure codes to login/allowance/setup/retry text. The local host may include
that fixed reason in an error; hosted responses and raw CLI output stay unchanged.
`packages/contracts/local/caption-generation.ts` and backend `clip-batch.ts`
reuse the same revision/operation shape for local transcription without a paid
consent field. The server selects that path from its composed provider, never
from a visitor-controlled provider name. Existing paid/fake routes retain their
checks. Normal real Codex inference still respects the paid-master off switch;
the local capability adds a disabled setup state rather than enabling it.
`scripts/prepare-app-image.mjs` must include the inert speech-tool admission
source referenced by local runtime in the backend build context; no binaries,
weights or credentials are copied. This preserves hosted buildability without
changing hosted composition or performing a build/deployment in the cloud.
The real Next bridge also needs the local speech deadline: extend
`apps/frontend/src/server/local-workflow.ts` and its tests, and add
`local-ai-request.ts` / `.test.ts`. Only authenticated local POST analysis/caption
JSON uses fixed-loopback native HTTP, avoiding fetch's shorter implicit header
deadline; cap request/response bytes and preserve abort. Hosted transport and all
media/upload routes remain unchanged. This is required for long CPU transcription.
`test/app-image.test.ts` updates its stale frontend asset count (the three
already committed platform SVGs) and proves that backend build inputs include
only inert speech admission source, never speech weights or CLI executables.

## Acceptance

- [x] All prior tasks packaged; this plan committed before implementation.
- [x] Normal local real mode routes transcript/moments/selected-frame focus and
      explicit captions through local speech/Codex; hosted Gemini unchanged.
- [x] Subscription-only auth, no API/Gemini fallback, content-free diagnostics,
      bounded media/processes, cancellation and cleanup verified.
- [x] Real browser workflow and native exports verified using synthetic media,
      fake Codex/speech results, exact counts and zero paid/provider calls.
- [x] Setup assets/version/hash/license status accurately recorded; fake mode
      stays fictional/key-free, while real inference needs installed tools and
      ChatGPT login/allowance plus explicit owner action.
- [x] Scoped validation clean; required types/lint/format pass; normal app healthy
      with current worker. Owner real-AI/ASR/visual/device/rights/hosted/release
      acceptance remains open. No deployment or push.

New Codex implementation remains local for owner review; this request authorizes
committing prior work and this plan, not a later implementation commit.

## Produced evidence — 2026-10-29

- The whole-file packaging plan was committed first (`85563c8`); native Media
  work `a4c50a1`, UI `99bca8d`, caption-level speakers `91dc094`, final evidence
  `472479e`. Clean tree preceded CL-135 plan `04450d6` and its implementation.
  Earlier scratch/phone-tablet/Hook tasks remain completed in CL-130/131/132;
  nothing from the queued requests was discarded or folded into a live test.
- Focused local unit gate: **10 files / 52 tests passed**, including bounded
  contracts, ChatGPT-only preflight/API-login refusal, no-tool flags, env key
  removal, actual synthetic child output/cancellation cleanup, receipt digest/
  size/kind/workspace/hardlink checks, disabled/missing prerequisite composition,
  safe UI errors and existing Gemini/hosted/caption/batch behavior.
- Frontend server gate: **2 files / 11 tests passed**. Local long CPU writes use
  fixed loopback native HTTP with JSON caps/abort; hosted authentication/CSRF,
  origin checks, range/media streaming and capability privacy remain intact.
  Closed build-context gate: **2 tests passed**; no CLI binary/model/secret enters
  hosted inputs. Corrected its pre-existing 12-versus-15 asset assertion for the
  already committed platform icons, without changing delivered assets.
- `test/local-codex.proof.ts`: **1 integrated proof passed** (final run 35.13s),
  real authenticated browser controls, internal native RPC and current-source
  overlay, real FFmpeg on a synthetic 15-second video/tone; Codex and speech
  inference are injected. Upload → login failure → explicit retry reuses completed
  transcript → moments → focus/captions → native export/download. A separate
  captionless cut confirms local audio wording/footer action and generates
  captions without Gemini consent. Exactly **4 injected Codex calls**, **2 fake
  speech calls**, **4 native input jobs**. No generated pictures or real provider
  calls. All input artifacts reaped. Explicit save/clear/reopen preserves camera,
  captions, edits and outputs with zero extra AI/native calls; browser reload fits.
- Checked 1440/390/320 CSS-pixel geometry, visible footer and overflow; inspected
  all three ignored synthetic screenshots under `.local-build/evidence/cl135-*`.
  These are fixture controls, not owner-media or physical-device acceptance.
- Contracts build; contracts/local, local, proof/root-test, backend, renderer and
  frontend TypeScript checks; scoped ESLint, Prettier and `git diff --check`
  passed. No dependency/lockfile changes, ambient Node in contracts, application
  cross-imports, hidden retry/fallback, raw error/log output or retained-media
  changes found. No production frontend build over the healthy dev server.
- Installed speech binary/DLL/model hashes, idempotent preparation, MIT license
  files and actual CLI help verified; no ASR inference. The free official model
  download initially timed out, then succeeded through the bounded fresh upstream
  URL. No automatic provider retry or paid request was used. Runtime never
  downloads; a clean-machine installation remains unverified.
- Rebuilt contracts and performed verified backend-only lifecycle refresh:
  **9 old owned identities removed**, watcher stopped, descendants/listeners
  absent after stabilization; frontend **15768** preserved. New supervisor
  **25052**, backend **4908** on 4000, worker **25484** on 4200. Health, `/start`,
  `/api/sample/config` all **200**; safe local capability still `synthetic-ai`.
  Owner configuration was neither read nor changed. Content-safe runtime record
  and separate stdout/stderr logs are in OS temp
  `clipbuilder-codex-20261029-cl135`; no processing action ran on the normal app.

## Scoped validation

TL;DR: local Codex/speech is connected to the normal real-mode use cases;
fake mode and hosted Gemini stay separate. The current uncommitted worktree
implements the committed plan. **Verdict: Meets ticket for local implementation
and fake validation. No actionable findings.**

Coverage: prior packaging/plan order, local provider selection, authentication/
privacy/bounds, manual captions, synthetic browser/native export, saved reopen,
failure/retry/cancel/cleanup, setup documentation and current-worker parity are
covered. Closed error mapping and the frontend's long header wait were fixed
and rechecked. The final review inspected tracked and untracked changes against
`04450d6`; staged diff is empty. No unrelated work was included.

Unverified/owner-only: actual CLI ChatGPT authentication, subscription limits and
inference/schema compatibility on a live run; Whisper speech accuracy/languages/
CPU latency; audible-speaker matching (not provided here); camera/editorial and
caption quality; physical devices, real-media listening/rights, clean-machine
setup, Linux/hosted image/runtime acceptance and release. Subscription mode does
not generate pictures; manual images work. Fake/injected results establish
integration, not AI quality. No Gemini/API credits, cloud access/change, push or
deployment occurred. New implementation stays uncommitted for owner review.
