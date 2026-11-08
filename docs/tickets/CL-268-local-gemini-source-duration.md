# CL-268 — Remove local Gemini's source-duration quota

Status: implemented; fake/no-key validation, generated native proof and normal
Gemini backend/worker reload complete, 2026-11-08. CL-265 subsequently records
the separately authorized one-run real acceptance and its listening limitation.
The owner now authorizes the whole-file local staging/commit plan below;
deployment remains unperformed.

The owner wants to use the same two-hour video in local Gemini mode and process
only the manual 1:04–1:45 excerpt. Remove the one-hour source-duration cap for
local Gemini; preserve every deployed limit. CL-265's Gemini selection is
preserved for the owner's manual test. The original implementation scope left
CL-264/265/267 pending work untouched; the later explicit Git request below now
authorizes committing those files in separate whole-file groups.

## Behavior and allocation

- Trusted local Gemini composition admits source duration up to the existing
  safe clock/arithmetic bound, without a replacement product-duration quota.
  Upload, YouTube offers/acquisition, native inspection, provider workspace
  parsing, retained/recovery admission and exposed browser capacity agree.
- Keep hosted/default bounded composition unchanged, including configured source
  duration/bytes, ordinary three-clip/cooldown and global usage limits. Local
  Gemini retains its ten-GiB source, scratch/disk reserve, ten processing clips,
  result and per-operation/provider-input limits. Do not enable Codex-only
  chunked analysis, larger collections, resolution policy or provider fallback.
- Adding the manual range leaves Suggest clips off. Its analysis uses only
  64,000–105,000 ms (source frames 1920–3150 at 30 fps): one bounded transcription,
  no AI moment-selection request. Initial planning/video preparation receives
  only that selected clip. Admission/reload never starts AI work.
- Use an explicit local Gemini capacity profile and trusted host selection;
  never derive wider privileges from browser/job input or a saved record.
  Preserve all media, ignored configuration, logs and pending edits.

Owning files: shared local capacity policy/tests, trusted host/runtime composition,
focused existing native/acquisition/provider/HTTP regressions, source-of-truth,
CL-264 comparison, CL-265 acceptance notes and ticket index. Update narrow service
docs only where needed. No frontend styling or new application route is needed.

## Acceptance and verification

1. Synthetic two-hour, sub-ten-GiB metadata passes local Gemini source parsing,
   native admission and YouTube choices; same input fails hosted/default limits.
   Oversized bytes, malformed codecs/clocks and forged worker policy still fail.
2. Actual authenticated no-key host HTTP accepts a two-hour source and a manual
   41-second clip. Assert exact bounded transcription/native cut, zero whole-source
   transcription/AI selection and no provider calls from capability reads.
3. Cover unchanged hosted composition and local Codex behavior, relevant retained
   admission, scoped types/lint/format and boundary checks. Tests/harnesses force
   fake/paid-off before imports, disable env loading and block provider network.
4. Read-only validate/fix loop. Build changed local contracts and normal native
   artifacts, then verified backend/worker restart with the already authorized
   launch-scoped Gemini choice. Preserve frontend/configuration; verify readiness,
   effective capacity and process/log ownership without inference.

No real download, provider call, saved-clip edit, deployment or Git mutation is
authorized by this change. Synthetic/no-key checks establish mechanics only;
the owner performs fresh real-media/Gemini acceptance with existing keys/live
approvals. Source admission does not remove bounded Gemini request limits or
promise whole-source AI discovery for arbitrarily long recordings.

## Delivered evidence — 2026-11-08

- The explicit local-gemini capacity profile has sourceMs null, while retaining
  ten-GiB source bytes, twenty-GiB scratch, ten processing clips, 360 results and
  disk reserve. Its schema rejects lifted byte/count/scratch bounds or Codex's
  longSources/manyClips flags. Hosted/default profiles remain bounded.
- Trusted normal runtime now supplies the selected provider to the host, so
  native tools, acquisition, source/library/recovery admission and public
  capabilities agree. The default and hosted hosts cannot select the expanded
  profile through browser/job data. Other AI/provider/clip policies are unchanged.
- 237 focused cases pass across capacity, native admission/forged worker input,
  YouTube formats/downloader, Gemini adapter, authenticated host HTTP, source
  library, draft store, analysis and hosted-workflow suites. The HTTP path accepts
  two-hour source metadata and prepares one manual 41-second clip. The actual
  injected Gemini adapter creates only audio/video proxies for frames 1920–3150,
  with one transcription and one video plan, no selection/image request and
  both provider file/proxy cleanups. Oversized whole-source audio still fails
  before Gemini upload/inference; no truncation or request-limit increase.
- Two offline native proofs pass. A generated two-hour, 12-fps MP4 with audio
  passes current-source inspection and returns exactly 41,000 ms of prepared
  audio and video through authenticated real worker HTTP. The existing small
  portrait encode/decode proof also passes. These FFmpeg-only paths do not load
  an overlay; all scratch/listeners are drained. No owner media or API key is
  used by the proofs.
- Contracts, local/test/frontend TypeScript, scoped ESLint/Prettier and Git
  whitespace checks pass. Read-only validation of the CL-268 worktree scope
  meets the ticket with no actionable findings: duration-only admission,
  hosted isolation, manual clip dispatch, persistence, trusted composition and
  cleanup are covered. Prior CL-264/265/267 changes are excluded except the
  narrowly updated capability/acceptance notes.
- Captured the existing backend supervisor/worker identities, confirmed no
  active owner processing, stopped that owned tree and verified both ports free
  through stabilization. The frontend instance remains unchanged. Built contracts
  and launched the normal backend command, which rebuilt the current native
  worker/overlay; Gemini remains a process-scoped override with ignored settings
  preserved. New backend/worker identities and durable logs are recorded outside
  Git; logs continued writing after the launcher tool returned.
- Health, `/start` and the bridge return 200. The running real-provider app
  advertises local-gemini, null sourceMs, ten-GiB source bytes and ten clips, with
  planning/captions/Hook titles available. No processing or provider action was
  triggered for this readiness check. Real acquisition, Gemini quality/latency
  and billing remain the owner's fresh test; no deployment or Git action.

Changed production files: local capacity contract and backend host/runtime.
Verification changes are confined to the eight focused existing test/proof
files. Narrow owning docs record the decision and evidence. Deviations: none.

## Owner-authorized whole-file commit plan — 2026-11-08

The owner explicitly requested a file-level commit plan, staging and local
commits of the current work. Allocate all 23 pending files exactly once; do not
split files into hunks, amend prior history or push. Preserve the running app,
ignored configuration, private diagnostics and completed real clip/export.
The one-run Gemini authorization in CL-265 remains consumed.

1. `CL-267: Enable metered hosted Hook titles and disable Find visuals`
   - `apps/backend/local/hosted-runtime.ts`
   - `apps/backend/local/hosted-workflow.ts`
   - `apps/backend/local/hosted-workflow.test.ts`
   - `test/owner-hosted-editor.proof.ts`
   - `docs/tickets/CL-267-hosted-hook-titles-without-find-visuals.md`
2. `CL-268: Remove local Gemini source-duration quota`
   - `apps/backend/README.md`
   - `apps/backend/local/draft-store.test.ts`
   - `apps/backend/local/provider-ai.test.ts`
   - `apps/backend/local/runtime.ts`
   - `apps/backend/local/server.ts`
   - `apps/backend/local/source-library.test.ts`
   - `apps/backend/local/youtube-formats.test.ts`
   - `apps/renderer/local/media-capacity.test.ts`
   - `packages/contracts/local/capacity.ts`
   - `packages/contracts/local/capacity.test.ts`
   - `test/owner-native.proof.ts`
   - `test/owner-provider-host.test.ts`
   - `docs/operations/LOCAL_CODEX_CAPACITY.md`
   - `docs/tickets/CL-268-local-gemini-source-duration.md`
3. `CL-264-265: Document provider limits and one-run Gemini acceptance`
   - `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
   - `docs/tickets/CL-264-gemini-codex-behavior-comparison.md`
   - `docs/tickets/CL-265-gemini-before-deployment-decision.md`
   - `docs/tickets/README.md`

Shared authority/index files belong to the third group because they cover both
features and the comparison/acceptance evidence. Before each commit, verify the
exact staged path set and normalized whole-file blob equality. Check committed
paths/blobs against that same allocation, then verify a clean final index and
worktree. Refresh relevant fake/no-key regression checks and scoped static/
format checks; reuse the already recorded browser/native proofs and real-run
evidence because production/test source is unchanged. No further inference or
real media processing is part of this Git request.

Commit gate passed: 272 cases in twelve focused fake/no-key suites; scoped
Prettier, ESLint, contracts/local/test TypeScript and Git whitespace checks.
The sandboxed Vitest attempt failed before tests on temporary module-cache
access; the explicitly escalated run passed. No production/test code changed
during commit preparation; existing native/browser proofs and CL-265's bounded
real-run evidence were reused. No API keys or ignored env files were loaded by
the refreshed checks.

Execution evidence: the first five-file group was committed as `617a415`
(`CL-267: Enable metered hosted Hook titles and disable Find visuals`). Its
staged and committed path sets exactly matched the allocation; every normalized
blob matched the reviewed whole file, and the index was empty afterward. The
remaining fourteen-file feature group and final four-file docs group retain the
same exact-path/blob guards. Final commit hashes and cleanup evidence belong in
the shared ticket index, avoiding a follow-up amendment to feature commits.
