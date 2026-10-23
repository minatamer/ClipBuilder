# CL-027 — Integrate local editing into the normal application

Status: implemented and validated locally. Owner-only real-media/AI acceptance remains in CL-025. Owner request 2026-10-23 supersedes the separate owner-app
architecture. Dependencies: implemented CL-017–024/026 and CL-023 downloader
follow-up, including their related unstaged changes; preserve that work.

Use the source of truth's same-application decision. The owner explicitly asks
to clean up completely and run the validate skill after the first pass.

## Scope and acceptance

- [x] Existing `/start` contains upload/link intake, manual/AI ranges/count,
  multi-clip controls, captions/pictures/video looks, saved drafts and exports.
  Reuse the main application shell and existing tested domain implementation.
- [x] Standard frontend/backend commands, localhost 3000/4000 and the existing
  backend `.env.local` own configuration. No owner command, separate UI, master
  owner/provider flag or parallel AI-mode setting is necessary. Imports stay inert.
- [x] Local media worker starts and drains under the normal backend lifecycle,
  with private state/logs outside Git, no credentials and verified pinned tools.
  Missing tools fail clearly, never install during startup or fall back to cloud.
- [x] Fake AI/paid-off remains key-free while actual local media/downloads are
  available. Real AI uses the existing key/settings/approvals. No live calls in
  agent verification and no offline AI weights are introduced.
- [x] Same-origin streaming routes preserve request/range/size/cancel limits,
  capability protection for agent edits, exact download format/source reuse and
  saved-media retention. Cross-site, remote and hosted local routes fail closed.
- [x] Retire standalone entry points, duplicate UI bundle and owner startup
  commands/configuration/docs. Preserve compatible saved documents and existing
  agent operations. Update affected build/test guards for integrated local code.
- [x] Run focused regression tests, the five root gates and relevant synthetic
  native/browser checks; record exact evidence, startup/shutdown cleanup and
  unperformed real YouTube/AI/visual acceptance. Do not read ignored env contents.
- [x] After the first pass run validate on the settled diff, fix/revalidate until
  there are no actionable findings. No staging/commit/push is authorized here.

This is an application integration, not a deployment. Hosted runtime checks must
keep local capabilities unavailable. Historical public-bundle exclusion evidence
for a wholly separate app does not establish this new boundary; test the actual
local/hosted route/configuration boundary instead. Privacy, source retention and
provider/cloud spend gates are unchanged.

## Validate pass 1 — 2026-10-23

Scope: combined unstaged CL-027 integration, renamed/untracked local modules and
related downloader follow-up; staged diff empty. No Git mutations or live calls.
Verdict: does not yet meet ticket; first pass found these confirmed issues:

- Medium — `apps/backend/src/analysis/gemini.local-capture.ts:17`: bundling moves
  `import.meta.url`, changing the workspace bound to capture permits. Fixed with
  explicit source/bundle directory resolution and a synthetic path regression.
- Medium — `apps/backend/local/runtime.ts:66`: setup failures before worker spawn
  could leave log handles/state/scratch. Fixed by owning initialization cleanup,
  with the same verified scratch removal used at shutdown.
- Medium — `apps/frontend/src/app/start/page.tsx:13`: unconditional local selection
  discarded the existing landing-page sample link. Fixed by preserving that
  explicit entry in the same app and adding route-selection regressions.

Coverage at this pass: same-app/config/fake and hosted/capability/range behavior
covered; lifecycle cleanup and five-gate final evidence partial pending reruns;
real YouTube/AI and owner visual acceptance unverified. Reviewed actual routes,
composition, build inputs, configuration, discovery, domain dispatch and cleanup;
no new checks or edits during the read-only pass. Fixing resumed afterward.
The native batch/browser proof then passed with zero process survivors; its
fixture's esbuild child is explicitly drained and identity checks stabilize.

## Follow-up verification and final validate — 2026-10-23

The actual browser check exposed parallel Windows process queries from status
polling. Concurrent discovery now shares one in-flight query, clears it on
success/failure and retains no snapshot after settlement. Filesystem, exact
process creation-time, capability and hosted/origin checks remain intact. Seven
synthetic discovery tests cover the original guards plus concurrency/recovery.

The editing view now uses the existing shell and prioritizes moment controls;
source/draft sections collapse during editing. Browser readiness checks use
native `:enabled` semantics, including disabled fieldsets. The normal app's
browser screenshot was inspected with a synthetic source. Hidden test processes
always drain even when a preceding diagnostic fails. Test-only raw HTTP uses
owned sockets; resource sampling tolerates render subdirectories disappearing
mid-walk and checks stable process identities without relaxing zero survivors.

Final validate scope: combined unstaged worktree and relevant untracked modules,
including these fixes; staged diff empty. No delegation, Git mutations or live
calls. Verdict: **Meets ticket — No actionable findings**. All three pass-1
findings resolved by inspecting the implementations and their regressions.
The browser fieldset assertion and concurrent polling issue were also fixed and
rechecked. Coverage: all eight implementation/evidence criteria covered;
real YouTube/AI/owner visual acceptance unverified and intentionally left to
CL-025. This was a read-only final pass; only this evidence record was updated
after the verdict.

### Checks actually produced

- The five root gates pass: format:check, lint, typecheck, test:unit and build.
  Final unit gate: **1,639 tests in 147 files**, Node 24 on Windows. The pinned
  pnpm 11.19.0 private runner hardcodes fake/paid-off/credential-free settings,
  blocks ignored environment-file reads for builds and retains network guards.
- Local build artifact verification: 1,344 frontend files, 11 routes; integrated
  privacy guard checks 1,791 built files. This is Windows local-build evidence,
  not a Linux image/deployment claim. Hosted local-route rejection is covered by
  actual route/configuration regressions with zero upstream/provider dispatches.
- Ten distinct native/browser proofs have passing coverage. Earlier full-suite
  runs exposed test-sampler/socket issues and process-query fan-out; eight
  unaffected native checks passed there. After fixes, the affected batch and
  normal-app browser/lifecycle proofs passed together (50.83 seconds). The
  stricter normal-app `:enabled` browser check then passed again (18.04 seconds).
  Do not misreport those earlier failed full invocations as clean full runs.
- Native batch evidence: three clip edits/exports, retained source/output checks,
  exact fake-call assertions, peak one native operation and **zero survivors**.
  Final measured batch cancellation: 64 ms. Presentation/caption/picture and
  RGB parity checks use generated synthetic media.
- Normal app proof verifies `/start`, `/api/sample/config` and backend health,
  synthetic-AI/real-acquisition capabilities, real synthetic MP4 upload through
  the streaming proxy, exact ranged playback, clearing and cross-origin denial.
  Headless Chrome loads the actual built app and verifies enabled moment
  controls. Its source/draft libraries are isolated OS-temp fixtures, never
  user-owned libraries.
- Final fixed-port inspection: no listeners on 3000/4000/4100/4200. Most recent
  runtime capability files and processing scratch are absent; private logs and
  process ledgers are retained outside Git. Native proof identity checks find
  no owned survivors. `git diff --check` passes; staged diff remains empty.

Changed areas: normal frontend route/shell and local editing feature; normal
backend composition/lifecycle and local use cases; private renderer modules;
browser-safe local contracts/composition; build/tool/discovery/verification
scripts; focused regressions and current guides. Legacy owner startup/UI entry
points and duplicate UI build outputs are retired. Compatible saved schemas,
source masters, drafts, exports, diagnostic captures and private logs are preserved.

No ignored environment contents were inspected or changed. No actual YouTube
metadata/download, Gemini/paid call, offline-model installation, cloud resource,
deployment, staging, commit or push was performed. Real transfers/challenges,
real AI output/deletion, real-media A/V/crop/readability, human/device usability
and any release/cloud acceptance remain unchecked in CL-025.

## Subsequent Git authorization — 2026-10-23

After validation, the owner authorized file-level staging and committing of this
completed cleanup, with no push. The validation evidence above describes the
worktree before that authorization. Build-only Next.js declaration changes are
excluded from the commit; ignored environment files and local artifacts remain
outside Git.
