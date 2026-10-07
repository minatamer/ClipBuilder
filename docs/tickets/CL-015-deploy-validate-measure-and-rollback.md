# CL-015 — Bounded renderer setup and later public deployment

## Owner full hosted functionality correction — 2026-10-07

The owner reports contextual pictures missing in both hosted preview and export
and explicitly requires the complete existing upload-to-export functionality in
production, enabling any remaining disabled product capability. Existing cloud
deployment and CL-015 staging/commit approvals continue. Preserve local behavior,
private diagnostics, exact-origin/caller/challenge/security/cleanup/cost bounds
and the accepted product scope. Agent paid processing remains prohibited.

Confirmed findings and narrow correction plan:

1. `composeGeminiPictureGenerator` still rejects every nonlocal app environment,
   so production cannot use the approved generated-picture fallback after Commons
   cannot supply an acceptable image. Production metadata already has paid mode,
   public processing and image approval enabled. Admit production only with its
   explicit public approval and existing paid/live/image/key/transfer/project
   gates; continue rejecting preview, test, fake and unapproved compositions.
2. The safe configuration hardcodes contextual visuals false and reports active
   speaker framing only for fake local preview. These fields are not consumed
   by the frontend rendering path, but must accurately report available real
   assembly capability. Derive both from composed assembly; keep trend signals
   false because the approved product implements no trend-input feature.

Review all remaining local/preview/production gates across frontend, backend and
renderer for another disabled upload-to-export function. The existing private
capture, retained-source sample, retired replay/testing UI and isolated renderer
worker exclusions retain their documented purposes. Add synthetic production
composition/configuration regressions before the fix and record their failure,
then verify focused image/assembly/caller/config tests and settled root gates.
Build/verify/scan one immutable backend correction and deploy only after those
gates. Preserve its current env/secrets/IAM/caps, update only image/source revision
and check non-processing configuration plus private diagnostics. Commit source
and deployment receipts in exact file-level groups. Owner must start a fresh
assembly after rollout; already completed previews/exports are immutable.
Actual hosted generated-image quality/provider outcome remains owner-only.

The safe private diagnostic counters confirm the owner's failed visual result:
three planned/validated cues, three Commons searches, zero usable pictures and
zero image-generation calls. No content, provider payload or secret was read.
The two new production regressions fail before the correction and pass afterward;
125 focused checks in six files pass. Settled format/lint/typecheck and the
standard full unit recheck pass: 1,250 fake/no-key tests in 110 files. Two unchanged
frontend import tests timed out in the first full run; isolated and standard
full rechecks pass without source/timeout changes, with original logs preserved.

The remaining runtime-gate review finds no other disabled upload-to-export
function: configured upload/storage, protected grants, analysis, selected plan,
framing/cards, Commons/generation, shared preview/export, delivery and Exit are
connected. Production's existing public/paid/image approvals are already true.
The isolated compositor's AI/cloud-disabled environment does not hide pictures;
it consumes validated inline assets from the same manifest as preview. Local
capture/retained sample, preview fixtures and retired testing/replay boundaries
retain their approved exclusions. No trends feature or local AI weights/runtime
is implemented. The settled ten-file read-only review has no actionable finding;
new Linux image/scan/rollout were still pending at that source checkpoint.

The corrected backend is now deployed from source revision
`727d940c76eb19c42f050a1d2fdf137f9a1de8ae` and immutable image
`sha256:51e78a090445048c4822cd8dd4cebe3767ebd359a2daf1dca8734b8034f49f39`.
The actual Linux build and nonroot/network-isolated image probe pass, including
approved production fallback construction and rejection of image/public approval
failure. Its exact scan has zero fixable high/critical entries; complete unfixed
entries remain available. All 97 compiled context inputs match the source.

Ready/latest traffic is 100%. Only backend image and `APP_REVISION` changed;
paid/image approvals, env/secret references, private IAM, origins, capacity,
frontend/renderer/bucket and local setup are preserved. Non-processing hosted
GETs return 200 with upload/analysis/assembly/export/framing/visuals enabled,
while anonymous backend health remains 403. Local GETs confirm live capability
availability and corrected framing/visual metadata. Agent paid calls and media
sessions remain zero. Fresh owner assembly/preview/export quality is still
unchecked; prior completed manifests are immutable and cannot gain pictures.
See the [correction receipts](../operations/HOSTED_VISUALS_CORRECTION_2026-10-07.json).
The general public traffic review and remaining owner acceptance stay open.

## Owner hosted paid walkthrough activation — 2026-10-07

The owner explicitly requests enabling deployed paid mode for one manual
upload-to-export walkthrough. Use the existing managed frontend origin while
custom-domain TLS is pending; do not switch the app away from the URL the owner
is testing. The owner reports the apex and managed frontend hostnames added to
the existing Turnstile widget; keep localhost. No agent paid flow is authorized.

Close the reproduced upload-origin prerequisite first: the backend forwards
its configured frontend origin through the standard Origin header on private
upload calls, never a visitor-supplied value. The authenticated renderer accepts
only its exact existing local origin and one explicitly configured hosted origin
before allocating upload storage. Preserve legacy no-header local calls. Carry
the selected origin into GCS resumable-session initiation without putting it in
media intent metadata. Add focused injected rejection/header/provider regressions,
verify the new backend/renderer images and preserve IAM, caps, cleanup and logs.
Update only disposable-bucket CORS to include those exact local/hosted origins.
Keep ignored local environment files and the retained masters intact.

Only after the configuration, image, private identity, upload-origin and secret
reference gates pass, activate the existing hosted paid approvals for the owner's
manual test and verify non-processing GET capability flags. Real AI, media quality,
cost and cleanup remain owner-only proof. This test authorization does not mark
the previously paused general public traffic/direct-origin review complete or
certify a global spend/DDoS bound. No local AI model/weights path is introduced.

Local compatibility validation passes root format/lint/typecheck and the standard
full unit command: 1,248 fake/no-key tests in 110 files. One unchanged browser
instrumentation import exceeded its five-second timeout on the first full run;
its isolated recheck and the repeated standard full command pass without any
timeout or frontend code change. Both logs remain preserved. Focused backend/
renderer tests also pass. The settled read-only review finds no actionable local
issue; real local/hosted processing remains owner-only and unverified here.

The three corrected immutable Linux images now pass build, offline nonroot
runtime and exact-digest scans with zero fixable high/critical entries. Renderer
synthetic audio/export/cancellation passes with zero AI calls and no owned process
leftovers. The 326 compiled context inputs match source revision
`051e5e9fbc50df1edaeff5a570d04029809756ab`; source and per-image receipts are in the
[input manifest](../operations/HOSTED_PAID_WALKTHROUGH_2026-10-07_INPUTS.json) and
[activation evidence](../operations/HOSTED_PAID_WALKTHROUGH_2026-10-07_EVIDENCE.json).
Full unfixed scan ledgers remain available; this is not an all-libraries-patched claim.

Verified rollout preserves private IAM, secret references, local upload Origin,
one-instance service/revision caps, other runtime settings and bucket policies.
Only image digests, backend source revision, the renderer's optional exact hosted
Origin and bucket CORS changed during preparation. The paid-off public bridge,
landing, workspace, assets, CSP, crawl policy and retired routes pass. Private
renderer health is 403 anonymously and 200 with the configured caller/audience;
an empty prepare descriptor is 400 with zero dispatches.

After those gates, the seven existing backend mode/approval flags were updated
for the authorized owner test. Latest traffic is 100% Ready. Non-processing public
GETs confirm live upload/analysis/assembly/export, public site-key presence and
no sample UI; localhost retains its live capabilities. Paid-off flag/configuration
and immutable rollback targets are recorded privately. Agent paid calls/media
sessions remain zero, ignored local env is untouched and all private logs remain.
The initial approval review incorrectly applied the superseded preparation-only
deployment exclusion; retrying the exact rollout with the later explicit owner
authorization was approved. No rejected command was bypassed.

Both public DNS resolvers return the exact eight apex records. Custom-domain TLS
is still pending at the recorded check; keep the managed frontend as the only
active origin for this test. Owner live quality/key-project/cost/deletion/rights/
device/rollback acceptance and the paused general public traffic review remain
unchecked. This activation does not mark the full ticket or public launch complete.

## Owner domain attachment — 2026-10-07

The owner requests domain attachment and explicitly confirms `tryclipbuilder.com`
as the main website hostname. This corrects the earlier `tryclipbuilding.com`
spelling. Update the single contracts constant, frontend/backend origin tests,
source of truth and current owner guide. Preserve exact host/protocol/port checks
and reject the old spelling; canonical localhost behavior stays unchanged.

Following owner-completed Search Console verification, Google CLI metadata
confirms ownership. The requested mapping to the existing public frontend is
created and returns eight apex A/AAAA records, listed in the deployment guide.
At this domain-mapping checkpoint, DNS/TLS, immutable corrected app images and
the application-origin cutover remained pending. No service configuration,
secret, paid flag or renderer setting changed at that earlier checkpoint.
The seven-file source correction passes contracts build, 16 focused fake/no-key
origin regressions, root format/lint/typecheck and a settled read-only diff review
with no actionable local finding. The full unit suite and Linux image gates from
the previous checkpoint were not rerun for that correction alone. The hosted
paid activation above supersedes that paid-off state. Synthetic checks need no
API keys, while real processing still
needs provider keys, live flags, approvals and owner acceptance. No agent-paid
flow or local AI model/weights path is introduced. Preserve ignored local env,
private identities, secret references and renderer upload configuration.

## Verified paid-off hosted checkpoint — 2026-10-07

- [x] Commit the owner-approved whole-file groups with `CL-015:` subjects.
- [x] Build/verify/scan exact Linux frontend/backend and final private renderer.
- [x] Deploy public frontend/private backend with narrow runtime identities,
  four exact enabled secret references, actual origins, capacity and paid-off gates.
- [x] Repeat the private image-only renderer rollout and non-processing auth/error
  probes, preserving its operational settings, local upload origin and rollback.
- [x] Fix the reproduced container-origin rejection and offline Host probe,
  revalidate configuration/landing/workspace/assets/headers/crawl/retired routes.
- [x] Verify localhost readiness/live capabilities with ignored env files untouched.
- [x] Record source/image/cloud receipts and remove only owned temporary contexts.
- [ ] Owner domain/TLS/redirect and Turnstile pairing/hostname cutover.
- [ ] Renderer upload-origin/bucket CORS cutover preserving the local decision.
- [ ] Previously paused public traffic/direct-origin review.
- [ ] Owner hosted paid quality/key-project/cost/deletion/device/rights acceptance
  and actual kill-switch/rollback exercise before public paid enablement.

Evidence: [deployment guide](../operations/CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07.md),
[402-file source manifest](../operations/CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07_INPUTS.json)
and [structured receipts](../operations/CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07_EVIDENCE.json).
Format/lint/typecheck and 1,244 fake/no-key tests pass; actual Linux builds compile
all workspaces. The isolated Windows root build is blocked by external junctions
and is not claimed passing. Native exposure mitigation and zero fixable entries
do not mean every library is patched. No agent paid/media processing runs; hosted
paid capabilities stay off while normal owner-local live capabilities remain.
No local AI model/weights implementation is introduced. Dated history below keeps
its original scope; the full ticket/public-paid acceptance is not marked complete.

## Owner deployment and commit authorization — 2026-10-07

Native decoder follow-up: apply the contracts' supported codecs and their software
decoder aliases, MP4-only input and two-stream bound before native probing and
all source/output decode operations. This closes the unsupported-decoder exposure
without reducing the accepted product profile. Keep full unfixed scan reports,
repeat Linux export/audio/cancel proof, and update the renderer image only.

Hosted verification follow-up: the first paid-off deployment rejected its safe
configuration GET before dispatch because Next standalone uses its container
bind address in `request.url`. The shared frontend transport resolves hosted
origin from the exact configured Host and HTTPS proxy marker, ignoring forwarded
host substitutions. All four API bridges retain declared Origin/CSRF/body and
capacity checks; local URL origins stay fixed. Add focused synthetic regressions
and exercise production proxy headers in the Linux offline proof, then rebuild,
scan and repeat the unpaid deployed probes. No paid processing is authorized.

Execution follow-up: prepare the owner's exact custom production hostname while
keeping private target origins on Cloud Run. Close the native input boundary by
pinning Debian's security-maintained FFmpeg/FFprobe CLI for all original-media
inspection, audio, proxy and selection work. Remotion retains its bundled ABI
libraries and only receives the freshly encoded selected copy; its AAC codec maps
to `libfdk_aac`, not the affected native AAC encoder. Assert the selected-copy job
boundary, reject production overrides to old source tools and verify hashes,
package provenance, Linux synthetic export/audio/cancel/scratch and exact scans.
Do not waive the gate until this evidence passes. This is an existing-renderer
image correction required for the authorized public deployment; preserve its
IAM/origin/resource/expiry settings and the accepted output profile. No public
paid flow, domain/DNS mutation or agent processing is included. The public
guide records the still-required exact upload-origin cutover rather than silently
breaking localhost. See [deployment guide](../operations/CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07.md).

The owner reports the complete local paid upload-to-export flow working and
authorizes a file-level plan, staging and commits with meaningful `CL-015:`
subjects, followed by frontend/backend deployment to Cloud Run. The owner owns
`tryclipbuilding.com` in Cloudflare and requests a domain/Turnstile/post-deployment
guide. This supersedes the preparation-only frontend/backend deployment exclusion.
It does not authorize agent-run paid processing, reading ignored local secrets,
pushes or branch/history changes. Preserve canonical local operation.

Follow the [whole-file commit plan](CL-015-RELEASE-PREPARATION-COMMIT_PLAN.md).
The local paid walkthrough is owner-reported success; hosted operation, custom
domain, challenge, actual spend/cleanup and rollback remain distinct evidence.
Deploy the immutable verified frontend and private backend initially paid-off,
with least-privilege identities and bounded capacity. Close the documented copied
FFmpeg public-processing gate and hosted prerequisites before enabling public
paid processing. Domain/DNS/dashboard steps remain owner-managed unless separately
requested. Fake/no-key automation proves synthetic behavior only; real processing
requires provider/cloud setup, live flags and applicable rights/spend approvals.


## Final local paid-test preparation — owner-authorized 2026-10-07

The owner authorizes completing pre-deployment preparation and updating the
existing private renderer for one final owner-run local paid test. Frontend and
backend deployment are explicitly excluded. This supersedes the earlier
renderer build/update deferral for this checkpoint, not the public launch gate.
Preserve the accepted UI/film, processing functionality, all private content-safe
diagnostics, existing cloud resources/settings and both retained masters.
Agents do not run paid processing or inspect ignored secrets. No new Git action
is requested for this packet; leave the changes reviewable.

Work/checklist, updated only with produced evidence:

- [x] Prepare hosted same-origin/private identity transport and bounded HTTP
  controls, preserving localhost behavior and public paid-off default until
  explicit launch approval. Do not deploy frontend/backend or create their
  hosted resources to manufacture acceptance.
- [x] Prepare strict Linux frontend/backend image contexts and verification;
  preserve the landing film through reviewed delivery assets. Include raster
  favicon and environment-specific crawl policy.
- [x] Remove development saved-analysis replay and its authorized saved copy;
  preserve original captures/logs/media. Inventory and safely clean obsolete
  release artifacts, preserving runtime records while processes are running.
- [x] Complete local focused checks, full root gates and settled read-only
  local code validation; document corrective iterations and the public-native
  concern/remaining owner-only gates without claiming public release acceptance.
- [x] Build/verify the exact updated Linux renderer image using the existing
  bounded cloud-build path, then update only the existing private renderer.
  Preserve IAM, identities, resource/concurrency/capacity, bucket/expiry and
  other runtime settings; keep the prior immutable image for rollback.
- [x] Verify digest/Ready/private IAM, authenticated non-metered health and
  invalid-input rejection without creating a session, reading media or running
  paid AI/media processing. Record content-free cloud receipts.
- [x] Restart the canonical local stack using normal owner-managed configuration,
  verified process-tree cleanup and readiness/configuration GETs. Leave it ready
  for the owner; do not run the paid walkthrough.
- [x] Record final file/input/image identities, configuration/stop/rollback and
  the owner's concise paid-test checklist in the release preparation report.

Evidence: [preparation report](../operations/FINAL_LOCAL_PAID_TEST_PREPARATION_2026-10-07.md),
[source manifest](../operations/FINAL_LOCAL_PAID_TEST_PREPARATION_2026-10-07_INPUTS.json)
and [structured receipts](../operations/FINAL_LOCAL_PAID_TEST_PREPARATION_2026-10-07_EVIDENCE.json).
All five root gates pass, with 1,239 fake/injected tests in 108 files. The idle
media-stream capacity finding is corrected and regression-tested. Strict Linux
frontend inspection proves zero external package links; all three images pass
nonroot/no-network runtime probes and exact-digest scans with zero fixable
high/critical package entries. Only the existing private renderer is deployed;
normal local paid availability is verified after the owner updates their own
environment and requests restart. No paid flow is run by the agent.

- [x] **Native exposure follow-up:** maintained input tools, supported decoder/
  format bounds and normalized compositor inputs mitigate the identified copied
  FFmpeg/source/encoder exposure. Exact Linux audio/export/cancel/scan and private
  rollout pass; see the latest deployment evidence. Vendor binaries are not
  asserted fully patched; complete unfixed scan receipts remain explicit.

User-only or post-public-deployment checks remain distinct: paid quality and
cost, real Turnstile/device behavior, current Gemini key/project correspondence,
public rights/privacy/license acceptance, actual public hostname/headers and
deployed cleanup/kill-switch/rollback. Existing read-only Cloud Run USD 5 spend-cap
and IAM/expiry/bucket receipts carry forward. No new budget amount is requested.
`FAKE_MODE=true` needs no keys and verifies labelled synthetic/injected behavior;
real processing needs provider keys/live setup and the applicable approvals.
There is no local AI model or weights path.

## Security remediation release handoff — 2026-10-07

CL-012 owns the [local security execution](../operations/STRIDE_SECURITY_REMEDIATION_2026-10-07.md).
Release must use matched Remotion 4.0.534/Chrome for Testing 155.0.8059.39 and
Next 16.3.8 inputs. Exact Linux image/native scan and synthetic export proof,
private immutable rollout, owner Turnstile/CSP/device/live-flow checks and strict
target artifact packaging remain separate gates. The owner accepts Google's
48-hour hard-crash fallback. Existing Gemini cap evidence was reconciled. Later
owner-authorized read-only authenticated CLI checks verify the actual app's
Cloud Run USD 5 monthly spend cap as configured, private invoker IAM, enabled
expiry schedule and exact disposable-bucket metadata. Current Gemini key/project
correspondence, whole-flow cost coverage and actual deletion are not certified.
Public traffic protection stays paused pending the owner's dashboard review.
No cloud build/update/deploy or agent-paid test is authorized by this handoff.

The owner separately authorizes a
[security file-level commit plan](CL-015-SECURITY-COMMIT_PLAN.md), staging and
commits after clean local validation, with `CL-015:` on every subject. The plan
records the exact source groups and completed implementation commit identities;
the documentation commit is identified by its exact subject in Git. No push or
branch/history rewrite is authorized. All five local gates and 1,240 fake/no-key
tests pass; code hashes are checked again before the final documentation commit.

## Owner-authorized code-quality commit checkpoint — 2026-10-07

After the CL-014 code-quality audit, implementation and follow-up validation,
the owner authorized a file-level plan followed by staging and commits, with the
deployment ticket prefix on every message. Follow the
[CL-015-prefixed commit plan](CL-015-CODE-QUALITY-COMMIT_PLAN.md). The audit
remains owned by CL-014; the prefix records this explicit owner request. No
push, branch/history change, paid/provider/cloud action, deployment or app
restart is authorized by this checkpoint.

The settled source input SHA is
`b6e34464f21d02dd495b464f1c2fea106810d083af1192272f2b77fc7f1c97fd`. All five
local gates and 1,223 synthetic tests in 104 files pass; follow-up validation
has no new actionable local findings. Stage only the plan's whole files, verify
each exact staged/committed inventory, then confirm an empty index and clean
worktree. The plan records the implementation commit identities; the final
documentation commit is identified by its exact subject in Git.

Fake/no-key checks remain fixture/injected proof with Download disabled. Actual
AI/output requires real provider keys, enabled live flags and the applicable
rights/transfer/spend/private-renderer approvals; paid testing stays owner-only.
No local AI weights/runtime were added. Strict target packaging, STRIDE, current
external scans, owner manual/rights/quality acceptance, hosted operations and
deployment remain open. Earlier dated configuration/export evidence below
retains its original scope.

## Owner fixed final-export capability

The owner requests hardcoded final-render availability and a complete backend
restart after finding Confirm export disabled. This supersedes the earlier
assembly-stage hold below. Real paid mode enables analysis, assembly and final
rendering directly in code once credentials, connection, admission and approval
prerequisites are complete. Remove `PAID_VALIDATION_STAGE` from the schema and
example; ignore any remaining local entry without reading or changing private
configuration. Paid-off precedence, fake/test isolation, public composition
rejection, one final render and existing renderer compatibility checks remain.

The fixed dispatch allowance is seven with image generation approved (four media
operations plus at most three image calls), four without images and zero with
paid off or incomplete setup. No agent paid flow or cloud deployment is
authorized. Fake/no-key checks verify configuration, capability exposure and
existing injected render/download behavior; actual MP4 quality and cloud
compatibility remain owner-only live checks.

Verify the obsolete stage cannot hide export, paid-off disables every
capability, missing setup dispatches nothing, and safe config advertises final
rendering with complete synthetic setup. Run the settled root gates without the
validate workflow, then restart only the backend through verified process-tree
cleanup and normal configuration. Verify health, frontend and safe capability
GETs; preserve logs, captures, retained source and the frontend. Record only
evidence actually produced.

Execution evidence: stage selection is removed from production configuration and
the example. Existing legacy stage entries, including assembly/disabled, cannot
disable final rendering. Paid-off and incomplete setup retain zero dispatches;
image-off retains final rendering with four bounded actions. Focused synthetic
configuration/image/renderer-boundary checks pass (63 tests in four files). All
five settled root gates pass: format, lint, typecheck, 1,205 unit tests in 96
files and build. No validate workflow or live paid request was run.

The full backend restart verified ten captured old process identities absent and
port 4000 clear through stabilization. The replacement's owned listener and
stable health return 200; frontend `/start` and safe configuration return 200,
with analysis, assembly and final-render availability true. The original
frontend process remains running; prior logs, private captures and retained
media are preserved. Private configuration was not read or edited. The
build-generated frontend type references were restored to their original
development paths.

This proves local export availability, not a successful real MP4. Matching
private renderer deployment, actual export/download/cleanup and owner
quality/rights acceptance remain unchecked. The Windows frontend build still
reports 26 external package links; immutable public deployment acceptance
remains separate. Changes are unstaged and uncommitted.

## Owner environment-only configuration — 2026-10-06

The owner requires removal of backend runtime JSON and its loading/API, with
normal defaults `FAKE_MODE=false`, `PAID_DEMO_ENABLED=true` and all four
approval flags true. The paid master has priority: false must force cloud spend,
Gemini transfer, image generation and paid-project confirmation false, with no
paid capability/grant/dispatch. This supersedes the earlier
local-runtime/default-fake configuration decision. Tests and synthetic harnesses
remain explicitly fake, paid-off and intercepted before application imports.

Implement environment-only private connections and processing stage, tracked
schema/defaults/example, and removal of runtime
reader/schema/template/composition arguments. Migrate existing private
connection/sample/stage values into the ignored backend environment without
printing/copying credentials or private values; delete the obsolete local JSON
afterward. Preserve stage=assembly until the independently approved renderer
rollout; no cloud deployment or paid flow is authorized. Missing optional local
prerequisites still disable paid routes with content-free reason codes and zero
provider dispatches.

Verify defaults, explicit paid-off precedence over every approval/live setting,
mode conflicts, optional missing setup, environment-only composition, retained
sample isolation and test pre-import protections. Run focused tests and settled
five root gates, then perform a complete backend restart with verified process
ownership, watcher/child/orphan cleanup, released port, normal configuration and
non-metered health/frontend/config GETs. Preserve the frontend, retained master,
captures and unrelated editing changes. No Git action is authorized.

Local implementation evidence: runtime reader/schema/template and composition
arguments are removed; source and compiled backend contain no runtime JSON
configuration usage. Private connection/sample/stage settings were migrated into
the ignored backend environment without displaying values or changing
credentials and operating switches. Four approvals default true; paid-off
dominates them and disables cloud/sample reads, live capabilities, grants and
dispatch allowance. Optional local setup and code-fixed limits remain protected.
Configuration callers, examples, test setup and owning operational guidance are
updated.

Settled `corepack pnpm format:check`, `lint`, `typecheck`, `test:unit` and
`build` pass: 1,190 synthetic tests in 95 files. An additional five-test
pre-import check passes with inherited synthetic real/paid/approval settings,
proving replacement before imports. No provider, cloud or agent-paid flow ran.
The local Windows frontend inventory still has 26 external package links and is
not strict immutable deployment acceptance. No Git action was performed.

The owner temporarily withheld backend restart and asked that visual logs be
preserved. The later CL-009 timing and CL-010 meaningful-notes corrections
completed before restart. Ten old backend process identities were verified
absent, port 4000 stabilized free, and a new normal-config backend reached
health 200. Frontend `/start` and sample configuration return 200 with its
original process preserved; live analysis/assembly are available and final
render remains off. No live paid flow was run. See the
[CL-010 completion record](CL-010-deliver-automatic-clip-review.md#owner-meaningful-edit-notes--2026-10-06).
All 28 private diagnostic captures and four current/previous backend logs retain
their originals plus a hash-verified private OS-temp snapshot. The owner
requires no validate workflow unless explicitly requested. Real imagery/quality,
generated-image failure diagnosis, matching private renderer rollout and public
provider/cloud/rights/deployment acceptance remain open.

## Current cloud-render packet — approved local execution, 2026-10-02

Status: local release preparation complete; validation has no actionable local
findings and all five root gates pass. Strict release verification rejects the
current Windows artifact; actual target-platform deployment acceptance remains
unchecked. Early private resources/authentication/Linux media/expiry-deletion
evidence remains under CL-006. Complete public deployment remains gated and
unperformed.

Authority:
[Google/Cloud Run migration plan](../architecture/GEMINI_REMOTION_MIGRATION.md);
[file inventory](../architecture/MIGRATION_FILE_INVENTORY.md);
[later setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md).

This packet has two separate checkpoints. Preserve owner debug-page exclusion
and prior evidence; neither checkpoint is authorized by documentation alone.

### Early private infrastructure for local tests

After documentation approval, prepare the minimum ready image/adapters and
authentication/lifecycle/spend controls required by the first actual
cloud-dependent test. Pause there for explicit provisioning and synthetic-test
budget authorization, potentially during CL-005/006 integration. Use the setup
guide to establish only private renderer/bucket/expiry/registry/identities in
the verified existing project. Private IAM, generation fencing, cancel/scratch
cleanup, independent expiry/deletion verification and bounded spend/logging
controls are prerequisites; bring those relevant CL-012 controls forward.
Completion of all later features, the complete CL-012 packet and the CL-014
public release audit are not prerequisites for this isolated synthetic test
renderer. Verify with fake AI/synthetic input, then resume the owning packet.
Live reference media and Gemini calls require separate later authorization.

### Later complete public deployment

Complete public application hosting/release retains the exact CL-014 revision
audit and separate owner hosting/privacy/rights/live/spend approval. It is
distinct from early private test infrastructure and cannot silently expand it.

After documentation approval, implement one dependency-ready packet at a time
and run focused checks plus the required settled five root gates. Fake/live AI
and local/cloud compute are independent; cloud render can incur cost with fake
AI. Ordinary tests remain synthetic, credential-free, fake/off and zero-network
through injected ports. Early setup authorization/evidence is recorded in
CL-006; its source-specific private media and cleanup tests passed. Public
deployment, new real-source/live-AI transfer and Git actions retain separate
gates. Usage polling and independent review remain stopped.

- [x] Owner explicitly approved documentation and local corrections on
      2026-10-02.
- [x] Owner separately approved early private setup and bounded synthetic
      allowance; resource/authentication evidence is in
      [CL-006](CL-006-build-media-job-and-speaker-feasibility.md#private-renderer-setup-and-deferred-media-validation--2026-10-02).
- [x] Early private cloud media/expiry-deletion validation: rights-confirmed
      2:45 private test passed under CL-006; fake AI, verified Linux image,
      cancellation and accelerated independent deletion.
- [x] Implement locally buildable production-output exclusion and
      release/rollback preparation; external phases remain unchecked.
- [x] Complete local validation, five root gates and exact build/input evidence;
      this is not complete deployment acceptance.
- [ ] Complete the owner-requested `artifacts/` cleanup checkpoint below before
      freezing the deployment build.
- [ ] Remove CL-007's owner-local saved-sample replay CTA, replay
      transport/cache loading and private saved copy before deployment. The
      2026-10-06 owner decision keeps the localhost button available without a
      deadline until this explicit cleanup; preserve the original diagnostic
      capture. See the
      [owning replay packet](CL-007-local-sample-replay-and-thumbnails.md).
- [ ] Complete the owner-requested Google Search favicon/crawlability checkpoint
      below before freezing the public deployment build; retain its post-release
      indexing follow-up.
- [ ] Complete the owner-requested whole-codebase audit, STRIDE security
      analysis and final-revision validation checkpoint below before public
      deployment.
- [x] Close
      [CL-005's chunked cloud-upload and truthful progress checkpoint](CL-005-implement-secure-upload-and-storage.md#owner-requested-chunked-cloud-upload-and-truthful-progress--2026-10-05);
      synthetic checks and two protected actual browser/GCS sample attempts
      verify chunk progress, completion and Exit cleanup via validated renderer
      cancellation. Owner-only paid continuation and broader deployment
      acceptance remain separate.
- [ ] Close
      [CL-009's owner editing-quality and diagnostic checkpoint](CL-009-build-contextual-visual-assembly.md#local-execution-and-verification--2026-10-06):
      local v3 implementation, synthetic browser buffering correction and actual
      synthetic MP4 caption/graphic inclusion are verified. The owner's exact
      repeated interval, real face/caption/visual/A/V quality, matching private
      renderer rollout and owner paid acceptance remain unchecked.
- [ ] Build acceptable immutable target-platform images; verify actual
      deployment, negative URL probes, bounded live quality/cost, kill
      switch/rollback and remaining rights/AI/cloud/license/device gates after
      approval.

### Owner-required comprehensive pre-deployment audit — 2026-10-05

The owner requires a thorough audit of **code efficiency, code quality and code
structure**, a **STRIDE security analysis**, and **code validation and
verification before public deployment**. This is a mandatory release checkpoint,
not a claim that earlier audit evidence covers the current pipeline. CL-014 owns
the audit and findings; CL-012 owns security controls and their corrections;
CL-015 must verify their current evidence before releasing the exact candidate.
The detailed requirements below apply to the current cloud-render pipeline,
regardless of the older checklists retained as history in those packets.

Status: **documented and pending; no new audit or implementation performed**.

- [ ] Audit the complete first-party codebase: frontend, backend, renderer,
      contracts, shared composition, tests, configuration and build/release
      scripts. Reconcile earlier ticket acceptance and owner feedback with the
      actual implementation; identify incomplete or obsolete pipeline code.
- [ ] Review code quality and structure: dependency direction, responsibility
      boundaries, contract ownership, duplicate schemas/constants/logic,
      readability, oversized modules, unsafe casts, error handling, stale flags,
      dead code and unused dependencies. Record concrete findings and evidence.
- [ ] Review efficiency: repeated provider requests and retries, repeated media
      downloads/uploads/decodes/renders, transcript parsing, browser bundle
      size, unnecessary UI work, memory/resource use, concurrency and cleanup
      across success, failure, cancellation, timeout and expiry. Measure
      relevant hot paths where feasible; preserve accepted behavior and avoid
      speculative optimizations.
- [ ] Produce an explicit STRIDE threat model covering **Spoofing, Tampering,
      Repudiation, Information disclosure, Denial of service and Elevation of
      privilege**. Map assets, data flows and trust boundaries across browser,
      frontend, control API, private renderer, temporary storage and providers.
      For each applicable threat, record the attack scenario, existing control,
      code/configuration evidence, verification, residual risk and disposition;
      justify any category marked not applicable. Include authentication and
      authorization, capability replay, request/render input integrity, origin
      restrictions, storage access/deletion, log privacy and bounded compute/AI
      spend.
- [ ] Preserve and review approved backend diagnostics and private
      provider-output capture. Verify useful stage-specific failures and
      lifecycle evidence without leaking credentials, capabilities or private
      content into public responses, tracked files or ordinary logs. Generic
      messages belong in the UI; backend diagnostics must remain actionable.
- [ ] Correct reproduced findings in the owning dependency-ready packet, add
      meaningful focused regressions and verify the correction. Every material
      unresolved finding remains an explicit deployment blocker. Record finding
      ID, severity, affected files/ticket, evidence, correction and disposition
      in the [release audit ledger](../operations/RELEASE_CANDIDATE_AUDIT.md).
- [ ] Validate the final settled revision with all five root gates: formatting,
      lint, typecheck, unit tests and production build. Run applicable existing
      integration/fake-E2E checks and review dependency vulnerabilities,
      architecture, duplicate/dead code, secrets/content, licenses, container
      and release-artifact inputs. Record actual commands, results and
      limitations; do not claim checks or coverage that were not run.
- [ ] Record the exact audited Git revision and immutable release-image/build
      inputs. Material changes after the audit require the relevant re-audit and
      verification before deployment. Carry forward all unresolved manual,
      visual, rights, provider, cloud and spend gates explicitly.

Automated local checks work with `FAKE_MODE=true`, no API keys, paid/live flags
off, synthetic inputs and injected ports. They do not prove real transcript,
edit quality or deployed security. Real provider verification needs API keys,
enabled live flags and the applicable approval; cloud/IAM/storage verification
has its independent credentials and approval gate. This documentation request
authorizes no audit execution, paid flow, cloud change or deployment.

### Analysis and browser-console release checkpoint — 2026-10-04

The owner's latest manual sample attempt failed. Remediation is planned under
[CL-007](CL-007-deliver-live-analysis-vertical-slice.md#owner-requested-analysis-failure-and-console-fix-plan--2026-10-04);
this release packet links to that owning plan instead of duplicating
implementation. Earlier successful fake gates do not establish live analysis
acceptance.

- [ ] Close CL-007's safe failure diagnosis and fake regression checks; rotation
      must begin with the accepted Find moments action, including preparation.
- [ ] On the acceptable target-platform production artifact, verify CSP/style
      behavior through direct load and client navigation, one shared Turnstile
      SDK load, intended challenge dialog behavior and no unresolved blocking
      browser-console errors. Preserve production nonce/script restrictions.
- [ ] Attribute remaining CSS preload warnings and correct owned causes or
      document reproduced development-only behavior with production evidence.
- [ ] Record the owner's real sample and uploaded-copy outcomes/cleanup before
      claiming live readiness. Samples remain local-only, retained masters are
      protected and deletion failure never blocks Exit.

These checks are pending. Fake/no-key checks use synthetic data and injected
transports; real provider/Turnstile quality and physical deletion require the
owner's enabled live setup and approvals. This adds no deployment authorization,
agent-paid test, credentials requirement for ordinary tests or local AI runtime.

### Owner-requested local sample exclusion — 2026-10-04

The owner requires **Use sample** only locally. The frontend omits the CTA when
the public backend configuration disables samples. Synthetic preview/production
configuration checks prove both sample flags false and both fixture-start and
retained-video routes return 404. This is local fake-mode evidence, not an
actual deployment check or live AI result. Both retained masters remain private
and outside cleanup/build inputs; temporary processing copies retain normal
cleanup.

- [x] Local fake-mode negative checks for preview and production sample
      capability/routes.
- [ ] Before public deployment acceptance, verify the actual intake has no
      sample CTA, sample flags are false, and fixture/retained sample endpoints
      return 404.

### Owner-requested Google Search favicon checkpoint — 2026-10-04

The owner requested checking the ScreenPilot search-icon issue and recording its
prevention as required pre-deployment work. Read the referenced chat “Find why
Google icon is missing”: it reported an SVG-only homepage declaration, then a
stable 96×96 PNG fix and an owner Search Console recrawl request. That other
application's deployed result was not independently retested here.

ClipBuilder has the same SVG-only readiness gap: `src/app/icon.svg` is a square
32×32 icon, with no committed PNG/ICO favicon or explicit raster icon metadata
in `src/app/layout.tsx`. The proxy's `favicon.ico` matcher exception does not
create an asset. In addition, `src/app/robots.ts` currently disallows `/` for
all crawlers, including the homepage and icon. This is the current
unreleased-site policy; release must deliberately allow the public landing page
and favicon. No claim is made about an existing ClipBuilder Google result or
live HTTP status.

[Google's current favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search)
lists PNG/ICO and other raster formats, requires a square representative icon,
stable URL and crawlable homepage/icon, and recommends a size above 48×48. SVG
is not in its current listed formats, so SVG alone is not the release plan.
Meeting eligibility does not guarantee display; recrawling can take days to
weeks.

Required before the public deployment build is frozen:

- [ ] Export the existing approved brand icon as a square **96×96 PNG**, served
      at a stable `/favicon.png` URL. Preserve the approved visual identity.
- [ ] Explicitly declare that raster icon in the homepage's generated `<head>`
      with the correct type/size. Verify actual emitted markup, including Next's
      file-based icon metadata, rather than assuming a metadata edit wins.
- [ ] Change the release crawl policy so Googlebot can fetch the public `/`
      homepage and Googlebot-Image can fetch the favicon. Preserve local/preview
      crawl restrictions and keep workspace, API and private-media boundaries
      protected; robots rules are not an access-control mechanism.
- [ ] Keep proxy asset matching, image packaging, release route/asset inventory
      and focused tests consistent with the chosen icon implementation. Verify
      the asset is included in the exact immutable frontend image.
- [ ] Check unauthenticated homepage/icon responses, raster dimensions, MIME
      type, stable icon link, redirects and absence of blocking robots/header
      directives for the chosen public hostname. Record build/synthetic checks
      separately from later deployed HTTP evidence.

Post-release follow-up, after the separately approved deployment:

- [ ] Verify the same homepage/icon checks on the actual public hostname and any
      approved alternate hostname; confirm redirects and canonical host policy.
- [ ] Complete owner Search Console verification and request inspection/indexing
      of the canonical homepage. Record the request and later observed favicon
      state separately; do not promise immediate display or wait for Google's
      appearance update as a pre-deployment acceptance condition.

This follow-up changes documentation only. Static checks and public-icon tests
need no Gemini key and work with `FAKE_MODE=true`; they prove no live AI
quality. Real processing still needs provider keys, live gates and applicable
approvals. No icon asset, runtime/robots configuration, app process, cloud
resource, provider request, deployment or Git state was changed. The prior
testing/startup blocker remains unchanged. `git diff --check` is the
documentation whitespace check; no application test suite is claimed as rerun.

### Owner app-local configuration follow-up — 2026-10-04

The owner authorized moving frontend/backend `.env.local` files and examples
inside their apps, creating the secret-free local files, and fixing numerical
policy in code. This is a local configuration follow-up, not hosted transport or
public release authorization.

Backend examples contain only `FAKE_MODE`, `PAID_DEMO_ENABLED` and blank
credentials. The frontend example is comments only: no secrets are needed yet
and backend mode is authoritative. Ignored backend `runtime.local.json` holds
private connections, generation-pinned sample metadata and recorded independent
approvals; its committed example has blank/null private references and false
approvals. The executable entry point loads app-local files only during explicit
non-test local startup. The obsolete root environment file/example are removed.

Composition derives analysis/assembly/render capabilities and the fixed 2/3/4
dispatch allowance from the approved validation stage. Paid-off disables every
paid capability and grant. Old limits/rates/timeouts/live-feature environment
overrides reject; shared product ceilings and server policy remain in code. No
dependency or lockfile changes. The release inventory rejects private runtime
files alongside environment files. Current owner configuration enables only the
separately approved real sample preview with paid processing disabled.

- [x] Owner authorized secret-free app-local setup and the fixed-policy change.
- [x] Both local environment files and backend private runtime metadata are
      ignored.
- [x] Focused configuration/admission/media/provider tests: 119 synthetic tests
      in 6 files; no real credentials, network or provider calls.
- [x] Settled `corepack pnpm format:check`, `lint`, `typecheck`, `test:unit` and
      `build` pass; 683 synthetic tests in 69 files. `git diff --check` passes.
- [x] Read-only validation of the final configuration/test/build-exclusion
      changes has no actionable local findings for this follow-up. Complete
      public deployment acceptance remains open.
- [x] Normal app-local startup: backend health, frontend `/start` and safe
      config return 200. Real sample playback advances and seeks to 02:00; owner
      reported it working. No AI or render dispatch.
- [ ] Detailed perceptual sync and real Clear/reload preservation; live Gemini
      quality, public authenticated routing, target-platform release artifact,
      deployment, device/rights/spend and rollback evidence remain separate
      gates.

Validation covered app-local loading in source/compiled entrypoints,
default/test isolation, strict private-runtime shape, code-fixed numerical
policy, the paid kill switch, unchanged cloud/provider approval gates,
dependency directions, blank/ignored examples, release exclusion and synthetic
regression coverage. The prior CL-016 protected-storage documentation was
preserved and updated only with actual runtime evidence. No dependency/lockfile
change or Git mutation. No media/credential content was captured. The direct
optional Markdown formatter reported style warnings in repository-ignored
Markdown; broad formatting was not applied. Both code formatting and diff checks
pass. A test fixture retained old disabled flags in its synthetic production
case and was corrected; lint also found a console statement in the earlier
ignored storage probe, corrected to the allowed content-safe warning output.
Final gates pass after both fixes.

The local frontend artifact has 1,277 files, eight app routes and 26 external
package links: `selfContained=false`, SHA-256
`615735c359e5fb563b43d8fe1b7b587e680cecd57d8a94978cd5eea18fd1ba86`. This passes
local inventory, not strict target-platform release acceptance.

Apps are left healthy for the owner: backend listener PID 5356 / supervisor 7904
on 4000; frontend listener PID 18080 / supervisor 12240 on 3000. The working URL
is `http://localhost:3000/start`. Creation-time-bound process-tree records and
separate redacted stdout/stderr logs are ignored under
`artifacts/local-run/protected-sample-20261004/`; keep them while apps run.
Source master paths/configuration and both retained masters were preserved.

### Owner local restart follow-up — 2026-10-04

The owner requested resolving the repeated restart failure before preparing and
executing a file-level commit plan. The standard kill/run sequence was verified;
the normal backend command failed before listening because optional paid-feature
prerequisites were treated as fatal application configuration. This local
correction separates app startup from paid-feature availability.

For local real mode only, recognized incomplete Gemini, grant/Turnstile,
renderer, retained-read or validation-stage prerequisites disable the affected
optional capability. All paid capabilities/grants and dispatch allowance are
disabled together when processing setup is incomplete. Health and local intake
remain available; independently approved retained playback is preserved. The
owner's operating switches, secret entries, private connection metadata and
approval records are not changed. Fixed requirement codes are logged, without
values, and are not added to the public configuration response. Malformed
structural settings, conflicting modes, public/test paid composition and retired
overrides remain fatal. Completed approved stages retain the fixed 2/3/4
dispatch budgets and existing rights/admission/provider controls.

The new synthetic HTTP regression first reproduced the same startup rejection.
After correction it verifies health/config 200, real mode without fixture
fallback, absent paid routes, zero dispatches and exactly zero Google transport,
renderer identity and Turnstile verifier compositions. Focused configuration,
admission and development-preview checks pass 54 tests in three files after the
plain-key migration follow-up. Additional regressions cover each missing
secret/approval, unapproved stage, invalid grant ring, malformed/contradictory
settings, nonlocal rejection and independent retained-playback availability.
Tests keep the hardcoded fake/off process environment, synthetic inputs and
network guard; no private files, credentials or actual provider/cloud calls are
used.

All five root gates pass with 721 synthetic tests in 70 files (root 33/4,
contracts 60/5, composition 3/1, backend 248/16, frontend 316/32, renderer
61/12). The stopped stack's 23 captured identities are absent and both ports are
free through a three-second stabilization check. Normal backend/frontend startup
then passes health, `/start` and `/api/sample/config` GET checks with 200. The
content-safe record/logs are in ignored
`artifacts/local-run/restart-20261004-plain-key/`; requested apps remain
running. Startup reports no missing/invalid grant key. The remaining fixed codes
identify Google transfer approval, paid-project confirmation, Turnstile hostname
and renderer connection; no private file was inspected to obtain that diagnosis.
No sample read, processing request, provider request or cloud update was made.
The [whole-file commit plan](CL-015-016-LOCAL-COMMIT_PLAN.md) records the
owner-authorized integration and evidence groups. This correction does not
update the private renderer, authorize paid testing or complete public
deployment. Fake mode remains key-free and synthetic; real processing still
requires the complete keys, approved stage and applicable approvals.

### Owner code-fixed grant label follow-up — 2026-10-04

The subsequent plain grant key follow-up below supersedes this entry's JSON
setup; the code-fixed `v1` label remains current.

The owner reaffirmed that `.env.local` should contain secrets and the two
operating switches, and requested keeping the nonsecret grant key label in code.
`ACTIVE_PROCESSING_GRANT_KEY_ID` is now `v1` in the owning grant module. Backend
composition derives its selected encryption key from this constant; the active
label is removed from environment parsing, examples and synthetic composition.
Only `PROCESSING_GRANT_KEYS_JSON` is required, and it must contain a valid `v1`
entry. Additional ring entries retain their existing rotation/decryption role.
An obsolete `PROCESSING_GRANT_ACTIVE_KEY_ID` environment value is ignored,
allowing manual removal without changing the existing secret or breaking setup.

The regression first failed because an environment selector changed the issued
key label. It now passes and issues a grant with the code-selected `v1` label,
even when a legacy selector and legacy ring entry are supplied. Missing `v1`,
malformed/empty keys, fake/test isolation, paid-off, rights/transfer/cloud gates
and actual admission behavior retain their existing checks. Focused
configuration and admission verification passes 38 tests in two files, using
synthetic keys and zero external requests.

The backend guide, provider setup/generator, controlled-check prerequisites and
current owner configuration authority reflect this removal. No dependency,
lockfile or cross-boundary schema change, ignored local file read/write, app
launch/restart, provider/cloud action or Git mutation is included. Fake mode
continues to work without keys and supplies synthetic results. Genuine
Turnstile/Gemini, updated private renderer, real media/quality/cleanup, approved
AI/cloud/build allowance and deployment/release remain unchecked.

### Owner plain grant key follow-up — 2026-10-04

The owner requested pasting the generated key directly into environment
configuration. `PROCESSING_GRANT_KEY` now holds one canonical 32-byte base64url
secret; the `v1` label and internal codec map remain in backend code. Examples
stay blank, and the private CMD generator prints only the key. Normal
composition validates the plain value before mounting admission. The former JSON
entry (or a plain key saved under its old name) remains readable only when the
new entry is absent. An explicit new entry, including blank, takes precedence.
No ignored file or credential is read, rewritten or generated.

Synthetic regressions cover actual grant issuance with the fixed label, legacy
migration, new-entry precedence, missing/malformed/noncanonical keys, disabled
paid routes and pre-import removal of both old and new secret variables. Fake
mode remains credential-free. Real processing still needs the complete
provider/Turnstile setup, renderer revision, approved stage and applicable
rights/transfer/spend approvals; this change authorizes no paid call or rollout.
The focused run passes 54 tests in three files, and settled full verification
passes all five root gates and 721 tests in 70 files. The read-only local
validation pass finds no actionable issue in this follow-up; real provider,
widget, renderer, media-quality, cleanup and deployment evidence remains open.
An additional five-test pre-import run starts with synthetic plain/legacy grant
entries and paid/live-shaped inherited switches; setup removes both secrets and
forces fake/paid-off configuration before test modules load.

Final local gates passed: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit` (714 tests in 70 files),
`corepack pnpm build`, and `git diff --check`. The root format check covers
source; Markdown is excluded by `.prettierignore`, and its whitespace was
checked by `git diff --check`. The local frontend artifact inventory still
reports 26 external package links and `selfContained=false`; a successful local
build does not satisfy the strict release-artifact gate or authorize deployment.

### Owner fake-only automated verification follow-up — 2026-10-04

The owner reserves paid-flow testing for their own manual actions and permits
agents to run only fake-mode automated checks. All automated verification must
be hardcoded fake/paid-off before any renderer revision update. This follow-up
prepares and verifies that boundary locally; it performs no deployment, provider
call, credentialed probe, media transfer or manual paid flow. Private renderer
build/compute approval remains separate from owner-only paid processing.

All six Vitest configurations now use `envDir: false`, preventing local
environment-file loading. One shared test-only initializer overwrites operating
flags with `NODE_ENV=test`, `FAKE_MODE=true`, derived mode `fake`,
paid/cloud/live capabilities off and zero dispatches. It removes inherited
Gemini, Turnstile, plain/legacy grant secrets and explicit ADC/Cloud SDK
credential variables before test imports. Both frontend/renderer media commands
and the selected-proxy native proof import this initializer before their other
modules. The frontend harness uses explicit Node TypeScript stripping; its
allowlisted delivery remains local-only.

The worker-lifetime socket guard is independent of Vitest mocks, so
`vi.restoreAllMocks()` cannot remove it. Test cleanup leaves network
interception and fake/paid-off settings installed; it no longer restores
inherited live flags. Unexpected external fetch/socket attempts fail checks;
deliberate guard probes are blocked and asserted. Configuration tests may supply
synthetic live-shaped objects to exercise rejection/composition and injected
adapters, without changing the real test process or enabling actual
provider/cloud work.

Two regressions first failed under synthetic inherited paid settings/credential
variables: credentials were visible during test imports, and mock restoration
removed the socket guard. After correction, the focused pre-import run passes
five tests and proves a guarded socket cannot connect after mock restoration.
The frontend bridge/harness run passes 19 tests in three files. A direct Node
TypeScript-strip import of the frontend harness confirms fake/paid-off/test mode
without launching its server. No agent inspected private local files or
credential content, and test environment-file loading is disabled. No
dependency, lockfile, application policy, shared contract or retained-master
change is included.

Final local gates passed: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit` and `corepack pnpm build`.
The full unit run passed 716 tests in 70 files: root 33/4, contracts 60/5,
composition 3/1, backend 243/16, frontend 316/32 and renderer 61/12. All suites
used the shared hardcoded fake/paid-off environment and network guard. The root
format gate covers source; Markdown is excluded by `.prettierignore`, and
`git diff --check` verifies whitespace. The local frontend artifact still has 26
external package links and `selfContained=false`, so its local build does not
satisfy strict immutable release-artifact acceptance. The full native media
proofs are opt-in and are not claimed as rerun by unit checks. Genuine
Gemini/Turnstile, renderer revision, real output quality/cleanup, rights,
cloud/build allowance, devices and deployment acceptance remain unchecked.

### Owner-requested artifacts cleanup — 2026-10-04

The owner requested a reminder to clean `artifacts/` during this deployment
ticket. Perform this checkpoint during release preparation; this reminder does
not authorize immediate deletion or deployment.

- [ ] Inventory old QA captures, temporary setup scripts and logs. Preserve
      useful release evidence in concise, content-free documentation before
      removing obsolete files; keep evidence references truthful.
- [ ] Move genuinely reusable operational tooling into its owning maintained
      module, with private values supplied through configuration.
- [ ] Preserve process ownership records and needed logs while their apps are
      running. Verify shutdown before removing obsolete runtime records; retain
      sample-reference metadata until its permanent configuration is verified.
- [ ] Verify every resolved deletion target is inside this repository's
      `artifacts/` directory. Preserve `.env.local`, credentials and both
      retained sample masters, including `private/retained-demo-source/`.
- [ ] Verify ignored artifacts, private media and credentials are excluded from
      deployment inputs/images, then record the cleanup scope and result here.

## Local execution - 2026-10-03

Owner authorized continued fake-mode local work and sequential ticket-prefixed
commits through CL-015; deployment and real media/device tests are deferred.
CL-014 is `6ccd9d4aa487e15db27ea1b0f978f6a5b396897b`; initial worktree was
clean. [Local release preparation](../operations/LOCAL_RELEASE_PREPARATION.md)
owns the existing-build inspection, later
artifact/routing/negative-probe/rollback checkpoints and every remaining gate.
Frontend README owns exact commands. At this packaging checkpoint, the public
hosting/paid operating-model decision was still outstanding and no
adapter/container topology was invented. The later
[owner release decisions](#owner-release-decisions--2026-10-03) select the
approach; implementation/proof remains pending. Existing nonlocal protected/paid
composition remains fail-closed; missing keys are not a local implementation
blocker or evidence of a complete public pipeline.

`apps/frontend/scripts/verify-release-artifact.ts` inspects standalone, separate
static and optional public inputs. The normal frontend build uses explicit local
mode; a separate default-strict release command rejects external links. Eight
current app entries, no rewrites, known framework routes/redirect and bounded
path/file/hash inventory prevent the local harness becoming published input. No
environment/secret read, copying, listener, provider or cloud work on import. No
dependency or lockfile change. Synthetic fixtures are cleaned in finally.

Initial real-build validation rejected the legitimate `[...path]` route because
an overbroad `..` substring check treated catch-all syntax as traversal.
Complete path segments are now checked; the regression fixture contains that
route. A separate unresolved-public-input regression failed before the fix:
ENOENT inside an existing public tree was silently treated as an absent
directory. Narrowed the exception to root presence only; the existing tree's
failures reject. Known Windows Next package junctions are not hidden: local mode
inventories them without following them and reports `selfContained:false`;
strict release rejects. The current 26 external package links require a later
approved target-platform build and strict check. Local passing inventory cannot
replace final image inspection or actual deployed 404 probes.

Focused installed Vitest artifact tests: 8 passed in 1 file. Typecheck passed.
Validation pass 1: **Meets ticket with concerns** for the owner-authorized local
scope, **no actionable findings**. Read-only review inspected tracked and new
files, the full current/historical ticket, installed Next output guidance,
route/asset inventory, frontend build/entrypoint, renderer packaging boundaries
and backend nonlocal fail-closed composition. No suite, edit, staging or
external action ran in that review. Covered: local harness exclusion, exact
current app routes, bounded hashing/link handling, synthetic rejection
regressions, narrow command/document ownership and release/rollback handoff.
Partial/unverified: actual self-contained target-platform image, deployed
entrypoints/404 probes, public authenticated transport/paid model,
live/media/device/rights/provider/ cloud/operational evidence. The strict
Windows rejection is intentional and recorded, not misreported as a deploy pass.
Deferred items were not completed because the owner explicitly limited this
sequence to local/fake work and postponed actual testing/deployment; the
unresolved hosting/operating-model decision also precedes those implementation
choices. They remain unchecked. Settled root results:
`corepack pnpm format:check`, `lint`, `typecheck`, `test:unit` and `build` all
pass; `git diff --check` passes. **632 synthetic tests in 65 files**: root 29/4,
contracts 58/5, composition 3/1, backend 195/14, renderer 56/11, frontend
291/30. Units ran separately from CPU-heavy checks; no thresholds/timeouts
changed. The final normal build's local inventory passes: 1,276 files, 26 links,
22,017,979 bytes, eight app entries, SHA-256
`56fe9dcedaa3844ee5058a4af1eb05e4e01bc6c924ccb714ac9a071c24a28062`.
`externalPackageLinks:26`, `selfContained:false`. The strict command against
that final output returns exit 1 / `release_artifact_invalid`, the expected
external-junction rejection; it is not counted as a passed release gate. Focused
three-file source/config/test input digest is
`4ead811a10da6a8d8c010d6b29b89f0f810f814bbff8aa90b5d05fba5fc31777`; unchanged
lockfile identity and re-audit scope are in the release ledger. Synthetic
scratch is removed, no artifact-test temporary directories remain, and no
app/listener/cloud/provider/manual/device/media action was started.
[Whole-file commit plan](CL-015-COMMIT_PLAN.md) covers one immediately
authorized sequential commit: `CL-015: prepare gated release verification`.

Fake/no-key results prove synthetic/path/lifecycle boundaries, not a real MP4 or
AI quality. Real Gemini needs keys/live/rights/data/paid approvals; private
render/storage has an independent IAM/cloud/compute approval. No local AI
weights/runtime. Actual native media/full
bounds/device/accessibility/CSP/font/visual/film, provider privacy/current
settings, licenses/rights/scans, monetary hard controls, public
topology/auth/rollout, immutable images, deployed probes and operational
kill-switch/rollback/deletion/cost observations remain unverified. Earlier
CL-006 private Linux/media evidence is preserved and does not attest this
release.

## Owner release decisions — 2026-10-03

After reviewing ScreenPilot's SP-026 deployment, SP-028 private-backend trust
boundary and recorded cost controls, the owner confirmed the proposed answers
except the public-media rights question, which needs clarification, and Gemini's
numerical spending amounts, which will be decided at paid testing. This section
records decisions, not completed implementation or external execution.

| Question                          | Owner-confirmed choice / remaining item                                                                                                                                                                                                                                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Public hosting                 | Cloud Run frontend and control API alongside the existing private renderer, using the already-approved ClipBuilder project and europe-west1 region.                                                                                                                                                                                                       |
| 2. Public access and identities   | Only the frontend is public. Browser API calls remain same-origin; limited runtime identities authenticate frontend-to-control and control-to-renderer. The expiry caller remains separately scoped.                                                                                                                                                      |
| 3. First URL and release method   | Managed frontend run.app URL, manual deployment of exact audited images; a custom domain is later and GitHub Actions remains quality-only.                                                                                                                                                                                                                |
| 4. Paid operating model           | Hosted verification begins fake/paid-disabled/live-off. After controlled live verification and enforceable spend safeguards, separately approve anonymous public processing protected by Turnstile and existing limits.                                                                                                                                   |
| 5. Provider/privacy approach      | ClipBuilder-scoped paid Gemini project, disclosed proxy transfer, no optional data sharing, limited provider safety retention and an adult audience in supported regions. This accepts the approach; actual account/settings and public privacy-copy verification remain pending. The hosting region is not a guarantee of provider processing residency. |
| 6. Public sample/example/film     | The owner selected the researched open-licensed conversation as the preferred source. The recommended 7:41 excerpt is input preparation only; actual source quality and remaining public/promotional/provider-transfer rights evidence are unverified. The earlier 2:45 source permission remains private-test-only.                                      |
| 7. Monthly spend                  | USD 10 project and USD 5 Cloud Run alert targets confirmed. Earlier USD 10 evidence remains valid for that checkpoint; the intended USD 5 alert is still unconfirmed. Gemini's numerical monthly limit is deferred until paid testing establishes per-flow cost. Alerts are not hard caps.                                                                |
| 8. First complete live validation | Plan one complete flow, at most two AI calls and four media operations, with no automatic paid retries. Prepare a current-price estimate and obtain a fresh numerical test allowance before dispatch. No new dollar allowance or paid run is authorized now.                                                                                              |

The public-media question concerns content supplied by the project: a prepared
real sample, downloadable demonstration clip or real conversation shown in the
landing film. Permission to process it privately does not itself record consent
to those public uses. An owned/licensed source needs rights covering its
speakers, audio, edits/redistribution and provider transfer, plus any included
third-party assets. The preferred source selection records the owner's choice;
remaining third-party permissions are not established by that choice alone.
Keeping this pending does not block local fake code/documentation. Visitors' own
uploads have a separate rights/transfer confirmation; they are not automatically
public project samples. Public media remains outside Git and this decision
record.

The owner clarified that the recommended 7:41 input must exercise the normal
system analysis and extraction flow. Its duration and preparation boundaries are
not predetermined output ranges or an expected-answer fixture. Do not hardcode
candidates, captions, contextual cards or speaker framing for this sample, or
bypass analysis based on its filename, hash, episode or participants. The
[current product rule](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#current-owner-revision--gemini-and-private-cloud-run-rendering-2026-10-02)
owns this constraint. Live grounding, framing and output quality still need
authorized real-source verification; no new implementation or live-quality
evidence is claimed by this documentation.

Project/region/private storage/cleanup and private-test Remotion coverage were
already approved under CL-006 and are carried forward without another choice.
Complete release license/telemetry/notices and actual saved cloud settings still
need evidence. The
[cost plan](../operations/COST_MODEL.md#owner-budget-decisions--2026-10-03) owns
alert versus hard-limit status and the deferred Gemini/test amounts.

No application/configuration/secret/cloud resource was changed, paid call made,
deployment performed or public switch enabled by this documentation pass. Public
transport/identity/container implementation, acceptable immutable artifacts,
current-revision audit, hosted checks, real quality/cost/deletion/rollback and
final UI/film/release acceptance remain outstanding. Fake/no-key fixtures still
work with disabled Download and zero provider calls; no local AI model is
implemented or verified. Real Gemini needs keys/live/rights and budgeted call
approval; actual cloud rendering has independent IAM/compute/spend approval.

Documentation-only verification: `corepack pnpm format:check` and
`git diff --check` pass. That owner-release-choice pass changed five owning
Markdown documents; application code/configuration and the lockfile are
unchanged. No code test suite was rerun.

## Retained local demonstration input — 2026-10-03

The owner authorized local extraction of the agreed continuous 7:41 source and
explicitly authorized retaining it. Local storage was selected, outside the
disposable cloud bucket and every application session/scratch cleanup path. The
ignored master, preservation notice and private manifest are under
`private/retained-demo-source/`; original download content remains untouched.
The operating constraint is recorded in `AGENTS.md`, the current source of truth
and migration retention section. The
[preparation record](../operations/LOCAL_RELEASE_PREPARATION.md#retained-owner-demonstration-source)
owns exact use/preservation rules and aggregate media evidence. Replacement or
deletion requires the owner's explicit instruction naming this retained asset.
Separate uploaded copies and derived artifacts retain ordinary deletion.

Verified: 461-second 1280×720/25fps AVC/AAC stereo MP4, 55.57 MiB; native full
video/audio frame decoding, zero-based track clocks, intake bounds, private
checksum manifest and Git exclusion. Renderer scratch ownership and allowlisted
image context exclude the retained master. The minimal bundled FFmpeg lacks the
null-output default encoder; strict FFprobe frame decoding provided the native
validation instead. No subjective quality, live analysis, complete render or
real-device acceptance is claimed. The source is input only, with no preselected
candidate outputs or automatic upload/processing integration.

Local preparation uses no AI, API keys or cloud resources. Fake-mode application
results remain synthetic. Real Gemini and remote render keep their separate
keys/live/rights/data/paid and cloud/compute gates; public/promotional rights
and live-output quality remain unchecked. No credentials, provider call, cloud
change, app startup, staging or commit was used. Documentation formatting and
diff checks pass; application code/configuration and the lockfile are unchanged,
so no code test suite was rerun for this preparation.

<details>
<summary>Earlier packet and evidence, retained as history where superseded</summary>

Status: Planned; final hosting/provider/launch gates pending<br> Milestone: M7 -
deployment and controlled live evidence<br> Last synchronized: 2026-10-02<br>
Depends on: CL-014 exact repository audit, CL-004A provider readiness,
browser/device feasibility and explicit owner authorization<br> Suggested
commit: `CL-015: deploy and validate browser-owned ClipBuilder`<br> Parent:
[source of truth section 0.9](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#09-browser-owned-media-architecture-revision-2026-10-01)<br>
Contract: [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md)<br>
Index: [README.md](README.md)

## Objective and supersession

Host the audited frontend and protected request-scoped AI API, prove actual
routing/admission/provider/client-media behavior, measure authorized cost and
demonstrate rollback. GCloud setup remains final, if that host is approved. No
temporary media bucket, GCS CORS/lifecycle, Cloud Run media job, server
speaker/render benchmark, signed playback/download or remote result store. Those
prior deferrals are withdrawn, not this packet's remaining acceptance.

The frontend owns source/normalized results/assets/final MP4 locally. Protected
backend handles only admitted bounded audio/text and returns bounded
results/assets. A server cannot read OPFS/IndexedDB. The existing two-service
Cloud Run topology is a proposal until the actual binary transport, same-origin
routing and process-local admission limitations are proved; do not deploy from
old server-media diagrams or pretend instance caps provide global atomicity.

## Owner gates before external action

- [ ] Exact CL-014 revision/build inputs and all repository-owned findings
      closed.
- [ ] Measured desktop-browser codec/performance/model quality evidence;
      source/output bounds and public claims approved without silent downgrade.
- [ ] Local disk-retention, two-hour logical expiry/next-open cleanup, provider
      audio/text transfer and provider data/retention copy approved.
- [ ] Provider projects/model/keys/settings, numerical hard limits, alerts,
      exact fixture/call budget and kill switch explicitly authorized.
- [ ] Hosting region/topology/account/API/billing/IAM/registry/secrets and
      action permissions approved. No credential/account identifier in
      Git/evidence.
- [ ] Controlled paid operating model approved. Anonymous public paid traffic
      remains off unless bounded abuse/cost safeguards and process-lifetime
      limitations are justified and accepted; no DB/object-store exception.

Documentation/preparation is not provisioning, key use, funding or launch.

## Final owner-facing setup guide

Prepare current official instructions before running anything: account/MFA,
billing/advisory budget, chosen region, minimum hosting APIs, least-privilege
frontend/API/deployer identities, registry/image storage, Secret Manager,
service ingress/routing, timeouts/body caps, instance/concurrency/rate policy,
no-content logging, static/model/font delivery, unpaid probes, bounded live
approval, kill switch, rollback and authorized teardown/residual charges. No
service-account JSON or blank env identifier filled by an agent without explicit
owner permission. App config and hosted secret mechanism are separate.

Provision only approved hosting/control resources; never a content bucket or
media job. Deploy immutable images/assets from exact audited inputs. Changes
after the audit require the smallest relevant re-audit. Begin fake/paid-off/
all-live-off. A project budget alert is not a provider hard spending cap.

## Local feasibility tools must be absent from deployment

Owner decision (2026-10-02): the synthetic browser-media test page shown during
CL-005/006 work is local-only and must not be exposed by the deployed app. Its
owner is `apps/frontend/feasibility/browser-media/`; the opt-in `test:media`
command serves it on `127.0.0.1:4185`. This requirement applies independently of
`FAKE_MODE`, paid enablement and live flags, including the initial deployed
fake/paid-off checkpoint.

- [ ] Exclude the feasibility harness directory, its HTML, test controls,
      standalone server and harness scripts from the published frontend output,
      static assets and final runtime image. Inspect the exact immutable build
      artifact and route/static-file inventory; do not copy the harness into
      `public`, mount it as an app route or expose it through a proxy.
      Production media workers and codec/model assets used by the real app
      retain their deliberate allowlisted delivery paths.
- [ ] Verify production startup/entrypoints and ingress expose only the audited
      app services. Do not launch `test:media` or expose its port 4185 through
      the deployment, reverse proxy or another public hosting origin.
- [ ] Before paid enablement or public launch, run content-free unpaid negative
      GET probes against the deployed app for the harness URLs: `/main.mjs`,
      `/worker.mjs`, `/sync-access.mjs`, `/mediabunny.mjs`,
      `/audio-extraction.mjs`, `/audio-samples.mjs`, `/audio-profile.mjs`,
      `/opfs-access.mjs`, `/media-errors.mjs`, `/audio-contracts.mjs`, and
      `/feasibility/browser-media/index.html`. Each must return 404 without
      serving harness code or controls. Inventory any new harness/proof paths
      added by later local work and include them in the same exclusion/probes.
      The deployed `/` must serve the intended landing page; the harness's local
      `/` must never replace it.
- [ ] Record the audited artifact identity, excluded paths and actual negative
      probe statuses in sanitized release evidence. Any reachable harness page,
      test endpoint or harness asset blocks deployment acceptance/public launch.
      Correct the owning build/routing configuration and re-audit affected
      CL-014 inputs before redeploying; do not mark this gate passed from local
      loopback binding, hidden navigation or a unit mock alone.

## Transport, topology and security proof

- [ ] Same-origin protected browser route authenticates to private API without
      exposing backend origins/credentials in NEXT_PUBLIC config.
- [ ] Binary audio is handled only by its narrow allowlisted bounded route;
      sample JSON proxy stays fixture-only, 8KiB/5s, not a media proxy.
- [ ] Exercise full-bound selected audio profile and actual end-to-end ingress/
      proxy/server/provider time/body/response limits. 20min 16kHz mono16 PCM
      exceeds Cloud Run HTTP/1's 32MiB cap: prove HTTP/2 or the approved
      compressed route. Streaming alone does not remove that request ceiling.
- [ ] Bounded received-byte/codec/duration validation precedes spend; proxy and
      platform retries cannot redispatch paid work. No original video/output
      upload, durable audio/transcript/payload or arbitrary user URL.
- [ ] Grant boot epoch, record capacity, atomic process-local reservations,
      replay/tombstones, uncertainty, restart and shutdown behavior are
      exercised. Actual old/new revision overlap and scale-out invalidate any
      unproved global exactly-once claim; fail closed or keep paid exposure
      disabled.
- [ ] Provider hard-limit enforcement and kill switches actually work within the
      approved test budget; alert-only or missing controls stay a launch
      blocker.
- [ ] CSP/worker/model/codec assets and CORS are limited; COOP/COEP/SAB headers
      are enabled only when needed/proved and compatible with Turnstile/assets.
      No model or media fetch on module import and no hidden external fonts.
- [ ] Logging/metrics/error/APM/proxy/platform capture never records bodies,
      filenames/transcripts/prompts/receipts/capabilities/provider raw payloads.
      Provider/platform retention is independently documented, not promised
      away.

## Unpaid probes, bounded live validation and rollback

Run unpaid fake/off health/config/error/restore/clear probes first, verify
static worker/model delivery and local storage/codec/compositor output with
approved synthetic media, and inspect only content-safe aggregate diagnostics.
No production fixture routes or fake real-mode success.

Then only the explicitly approved live flow: bounded local source/audio consent,
one transcription/candidate action, one selected-range local speaker pass,
bounded visual-plan/images, read-only preview, one local export/download and
clear. Record exact provider calls, audio/text/asset bytes, normalized result
availability, codec/sync/sample-frame quality, measured client time/memory, cost
and local cleanup. No private media/transcript/provider IDs/output in docs.
Cloud hosting success cannot replace measured browser-media/speaker quality
evidence.

Timeout/cancel after dispatch may bill; lost payload/restart is a visible
uncertain outcome, never an automatic paid replay. Stop on duplicate dispatch,
unexpected capture/retention, privacy/codec/quality failure or budget variance.
Do not widen limits or public support to make a failed proof look successful.

Demonstrate kill switch and rollback to exact prior audited assets/config with
paid traffic disabled before topology/revision changes. Explain effects on
in-flight grants/local workspaces; incompatible artifact schema requires safe
migration/cleanup, not automatic new paid work. Authorized teardown must leave
no needless hosting/registry/secret costs and cannot delete visitor-saved
downloads or promise provider content erasure.

## Completion

- [ ] Dated guide and exact immutable revision/assets/topology recorded.
- [ ] Local feasibility/test tools are excluded from the deployed artifact and
      direct page/asset probes prove they are not exposed by the deployed app.
- [ ] All actual transport, restart/overlap, logging, hard-cap and client-media
      proofs performed, or remaining blockers left explicitly unchecked.
- [ ] Only authorized external resources/actions and paid calls occurred.
- [ ] Actual device/provider/rights/privacy/visual/public claims approved.
- [ ] Local cleanup, incident stop and rollback evidence recorded honestly.
- [ ] Changed files, commands/manual states, costs/call counts, deviations and
      remaining owner-only items reported; no deployment or Git inferred here.

Run focused release probes and the required root gate for any source changes; no
unapproved paid E2E or cloud mutation. Public paid release cannot be marked
complete while the no-shared-store guarantee/cap decision is unresolved.

## Historical packet

<details>
<summary>Superseded cloud-media deployment plan, not setup instructions</summary>

The prior resource inventory and acceptance matrix below are decision history.
No bucket, media job, server rendering or object-backed coordination item is
still required or implicitly authorized.

# CL-015 — Deploy, validate, measure, and prove rollback

Status: Planned<br> Milestone: M7 — deployment and controlled live evidence<br>
Last synchronized: 2026-10-01<br> Depends on: CL-014 repository audit, CL-004A
provider readiness, and explicit owner authorization<br> Blocks: Public release
completion<br> Suggested commit: `CL-015: deploy and validate ClipBuilder`<br>
Parent plan:
[`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Owner setup ordering (2026-10-01): this is the final ticket, after every local
implementation/quality/audit packet. It exclusively owns all GCloud account,
billing, project/API, IAM, bucket, registry, secrets, service/job setup,
external cloud verification and deployment. CL-004A owns non-GCloud setup
guides; CL-012 audits them and CL-014 carries a named deferred-cloud checklist.
Cloud evidence is produced inside this packet, never a circular prerequisite for
entering it.

Before any external step, author/review the complete dated owner-facing GCloud
walkthrough using current official docs: prerequisites and account security,
console navigation and equivalent content-safe CLI where needed, billing and
numeric advisory budget, chosen region, required APIs, least-privilege
identities, registry/image costs, private bucket settings, Secret Manager
access, service/job caps/retries/timeouts, unpaid verification, bounded live
approval, troubleshooting, kill switch, rollback and authorized
teardown/residual charges. Keep identifiers and secrets blank; do not output
credentials or service-account JSON.

Deploy the exact audited ClipBuilder revision as immutable frontend and
backend/job images; prove private service/storage/IAM/lifecycle configuration;
run unpaid deployed probes first; execute only the owner-authorized bounded live
flow; reconcile behavior, provider/job call counts, cost, cleanup, public
claims, and settings; and demonstrate the recorded rollback/kill-switch path.

## Portfolio value

Convert the audited repository into a credible live portfolio artifact with
traceable revision/digests, bounded spend, honest external evidence, recoverable
operations, and no gap between the code story and the deployed system.

## Standalone implementation context

- Target architecture is one public Next.js Cloud Run service, one private
  Express Cloud Run service invoked by frontend identity, one private Cloud Run
  Job definition for `analyze|assemble|render`, one private temporary GCS
  bucket, Artifact Registry images deployed by digest, and Secret Manager values
  scoped to runtime identities.
- CL-015 may deploy only the exact CL-014-audited revision/build inputs. Any
  material source/config/image change requires the smallest relevant re-audit.
- Deployment begins fake and paid-disabled. Unpaid health/config/sample/clear
  probes and log inspection happen before any live flag is enabled.
- Live validation is rare evidence: one previously unused rights-approved short
  fixture, exactly the approved upload/analysis/assembly/render path, followed
  by usage/cost/output/cleanup reconciliation. Stop on duplicate call,
  unexpected retention/log content, setting drift, or material cost variance.
- A custom domain is not required for the first stable checkpoint; use managed
  `run.app` HTTPS first unless owner decisions explicitly say otherwise.

## Dependency evidence required

CL-014 must identify the exact auditable revision/build inputs, record a green
deterministic gate, and list no unresolved repository-owned release blocker.
Visual, rights, non-GCloud provider/privacy/retention and numerical spend/call
approval must have current evidence before their corresponding external phase.
An approved region/cloud setup action is needed before provisioning; bucket/IAM,
mechanism/runtime, unpaid probes and launch evidence are produced in the phases
below, not demanded before entry. A commit subject or template is insufficient.

## Files and areas owned

- Deployment/rollback/provider/storage/cost/release operations documents and
  sanitized release evidence.
- Container/build/deploy configuration corrections strictly required for the
  audited architecture, followed by re-audit as needed.
- No new product feature or speculative infrastructure.

## Scope boundaries

### In scope

- Re-checking current official provider model/pricing/data docs and owner
  dashboard settings before live use.
- Building/pushing two immutable image families (frontend; backend/job),
  recording exact digests/SHA, and deploying services/job with least-privilege
  identities.
- Verifying region, bucket public-access prevention/uniform
  access/CORS/lifecycle/ soft-delete/versioning/IAM, Secret Manager scopes,
  Cloud Run min/max/ concurrency/timeouts/task retries, and network/service
  authentication.
- Unpaid production health/config/sample/clear probes and content-safe log
  review.
- Explicitly bounded live flow, output inspection, call/usage/cost/cleanup
  evidence, kill-switch test, and digest-based rollback.

### Out of scope

- Kubernetes, Terraform, load balancer, external queue, deployment OIDC/CI-CD,
  multi-region failover, custom controller, production database, customer
  accounts, broad public beta, arbitrary stress testing, or unapproved custom
  domain purchase/configuration.
- Additional live retries/fixtures, 60-minute ceiling run, or public live upload
  unless separately authorized after the short flow evidence.

## Locked sequence and checkpoints

### Phase 0 - owner guide and cloud setup authorization

- [ ] Confirm CL-004A/CL-012 provider evidence and CL-014 repository audit;
      enumerate every deferred cloud gate and its original owning ticket.
- [ ] Prepare/update the full deployment/storage/secrets/budget/rollback guide
      with dated official links, exact console steps and safe CLI equivalents,
      expected outcome, permission/billing prerequisites and stop conditions.
- [ ] Obtain explicit approval for cloud account/billing/project creation or
      selection, region, API enablement, resource caps, advisory
      budget/recipients, funding and each external provisioning/deploy action.
      Never infer approval.
- [ ] Configure owner-approved numeric cloud alerts and resource ceilings before
      metered workloads; distinguish advisory alerts from enforced caps.

### Phase 1 — freeze and build the audited candidate

- [ ] Confirm CL-014 ledger, exact clean/auditable revision, current phase's
      owner gates and deferred-cloud checklist, and no material source/config
      drift.
- [ ] Re-run the release commands/scans required by the ledger and build the two
      immutable images with exact SHA labels and reproducible inputs.
- [ ] Scan images/dependencies/secrets/licenses, record digests and runtime
      binary/ model/font revisions, and never bake secrets/local env/media into
      layers.

### Phase 2 — verify minimum cloud foundation

- [ ] Following the owner guide, create/configure only the authorized minimum
      project/APIs, regional registry, secrets, identities and private bucket.
      Verify least privilege, cost/resource ceilings and no service-account JSON
      keys.

- [ ] Verify approved project/region, Artifact Registry, Secret Manager, service
      identities and planned private API/job IAM without recording
      project/account IDs in public evidence. Verify deployed service/job
      bindings after Phase 3.
- [ ] Verify the private bucket's PAP, uniform access, Standard class,
      versioning, soft-delete decision, one-day lifecycle for temporary
      prefixes, explicit sample exclusion, exact-origin CORS, and no public/list
      permission.
- [ ] Upload/reference the rights-approved versioned sample by exact generation
      and SHA; never replace it in place.
- [ ] Complete CL-005's transferred GCS browser mechanism spike on approved
      synthetic/rights-safe media: exact-origin CORS, headers/start expiry,
      resumable chunks/restart, size/type/generation/range, cancel/partial
      deletion and no capability in logs/errors/persistence/screenshots. Failure
      blocks enablement.
- [ ] Return any mechanism/runtime/code correction to its owner and re-audit
      affected source/config/image inputs under CL-014 before continuing
      deployment.

### Phase 3 — deploy fake and paid-disabled

- [ ] Deploy private API and one job definition with `analyze|assemble|render`
      allow-list, zero task retries, bounded resources/timeouts/instances, and
      only required secret access.
- [ ] Deploy public frontend with server-only private API origin/audience and
      same-origin `/v1`; keep every live flag false and master paid switch
      false.
- [ ] Record Cloud Run revisions/digests/nonsecret config and verify the API is
      not public while frontend invocation works.

### Phase 4 — unpaid deployed checkpoint

- [ ] With the private job now provisioned, repeat CL-006/008's pinned speaker
      benchmark on actual Cloud Run CPU/RAM/time/storage settings using approved
      media; record deployment quality/runtime/memory go/no-go, not local
      inference.
- [ ] Prove CL-011's transferred job/output integrity, private preview/range/
      download, revocation and cleanup without AI calls. This checkpoint means
      zero paid provider calls, not free cloud compute/storage; obtain a bounded
      cloud execution approval. Re-audit any material correction before
      progressing.

- [ ] Run health/readiness/config, complete sample flow, refresh/recovery,
      clear, expiry, and kill-switch probes without provider calls.
- [ ] Verify headers/CSP/cookies/no-store/proxy, responsive critical path,
      sample asset integrity, content-safe logs/metrics, scale/capacity, and
      cleanup.
- [ ] Stop if revision/config/log/storage/IAM evidence diverges; correct and
      re-audit before live enablement.

### Phase 5 — bounded live validation and measurement

- [ ] Re-check current provider project/model/data/retention settings,
      Turnstile, hard rate/spend limits, cloud alerts, rights, and authorized
      call count.
- [ ] Enable only the exact approved flags, use one previously unused short
      synthetic/purpose-recorded fixture, and run one upload → inspect →
      analysis → assembly → read-only review/confirmation → one render →
      download → clear flow.
- [ ] Verify active speaker, contextual visual grounding/rhythm, caption/sync/
      output, exact provider/image/job counts, no hidden retry, logs,
      usage/cost, object deletion/revocation, and lifecycle backstop.
- [ ] Disable live flags immediately on duplicate/unexpected retention/content
      leak/claim/cost/cleanup deviation and preserve sanitized incident
      evidence.

### Phase 6 — rollback and release closure

- [ ] Prove master/per-feature kill switches stop new paid work while sample
      remains isolated.
- [ ] Roll back by recorded previous image digests/config snapshot—not
      rebuilding an old branch—and verify health/sample/session compatibility.
- [ ] Restore the approved release state only if authorized; otherwise leave
      live flags off after validation.
- [ ] Complete the release record with public URL, timestamp, SHA/digests/
      revisions, settings review dates, tests, probes, live count, cost, output,
      cleanup, known issues, approvals, and rollback target.

## Privacy, provider, and cost constraints

- Never place secrets in commands, logs, docs, screenshots, image layers, or
  environment examples. Use Secret Manager and runtime identities.
- Release evidence omits account/project IDs, object names, signed URLs,
  transcripts/prompts/media/outputs, provider request IDs, tokens, and secret-
  bearing screenshots.
- Run only the exact authorized live operations. No automatic retries, provider
  fallbacks, stress/load generation, second render, or 60-minute validation.
- Public claims must match measured active-speaker, visual, retention, language,
  upload, and render state. If live upload remains unapproved, deploy
  sample-only.

## Acceptance criteria

### Technical deployment checkpoint

- [ ] Complete owner GCloud setup guide exists and all actual account/billing/
      API/IAM/resource/budget actions are explicitly authorized and evidenced.
- [ ] Transferred CL-005 mechanism, CL-006/008 target-runtime and CL-011 cloud
      render/storage/delivery/cleanup gates pass; none are inferred from local
      tests.

- [ ] Exact audited SHA maps to recorded immutable frontend/backend-job digests
      and deployed revisions with no material drift.
- [ ] API/job/bucket stay private; frontend service identity and least-privilege
      runtime identities are proven.
- [ ] Bucket PAP/IAM/CORS/lifecycle/soft-delete/versioning/sample generation and
      Cloud Run caps/retries/timeouts match operations records.
- [ ] Paid/live-disabled health/config/sample/clear probes pass and logs/metrics
      contain no forbidden content or capability.

### Release acceptance after controlled live evidence

- [ ] Exactly authorized provider/image/job operations ran with expected usage,
      cost, latency, output validation, and zero hidden retry/duplication.
- [ ] Speaker framing, visual beats/cards, fixed captions, preview/export
      parity, result/download, and clear meet the source-of-truth release
      checklist.
- [ ] Source/transcript/assets/output/control objects are deleted/revoked or
      truthfully recorded as pending lifecycle cleanup; no public access exists.
- [ ] Hard provider limits, app kill switches, capacity caps, and advisory cloud
      alerts are distinguished and evidenced.
- [ ] Kill switch and digest rollback are proven; the release record names the
      current and prior targets and all remaining issues/unchecked items.

## Focused verification

- [ ] Re-run exact CL-014 release gate on the frozen candidate before build.
- [ ] Inspect image provenance/layers/digests, deployed nonsecret config,
      service/IAM/bucket/job settings, and production headers/logs.
- [ ] Run unpaid probes first and record provider call counts at zero.
- [ ] Run only the explicitly authorized live flow and reconcile provider/cloud
      usage and billed/estimated cost with the plan.
- [ ] Validate output media and complete cleanup/revocation checks.
- [ ] Exercise kill switch and rollback, then record final state.
- [ ] Inspect local Git status/diff; do not imply deployment changes were
      committed unless the user separately authorized the commit.

## Documentation updates

- Complete deployment, rollback, provider setup, data retention, cost model,
  media rights, render profile, incident, and release-evidence records.
- Update public README with the live URL and only measured public claims after
  the owner approves release.
- Update parent and affected tickets for any externally discovered behavior or
  configuration change, and re-audit the affected scope.

## Owner gates and external blockers

All external work requires explicit authorization and owner-provided access:
cloud project/region/IAM/bucket, provider/Turnstile/Secret Manager settings,
sample rights, spend caps/alerts, live call count, public
upload/render/language/ retention decisions, launch approval, and any custom
domain. Missing evidence blocks the corresponding phase; it is never inferred or
bypassed.

## Commit boundary

Keep deployment configuration/evidence and only strictly required re-audited
corrections together as `CL-015: deploy and validate ClipBuilder`. Do not add
new product features or speculative infrastructure. This packet does not itself
authorize staging, committing, pushing, purchases, provider mutations, cloud
changes, deployment, public launch, or paid calls; each requires the user's
explicit instruction at execution time.

## Precision references

- [Owner-controlled live validation](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2015-owner-controlled-live-validation)
- [Deployment and operations](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#21-deployment-and-operations)
- [Release acceptance checklist](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#23-release-acceptance-checklist)
- [Owner decisions still required](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#24-owner-decisions-still-required)
- [Definition of done](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#appendix-e--definition-of-done)

## Completion handoff

Report the exact audited SHA/image digests/deployed revisions, cloud/storage/
IAM/job settings, unpaid probes, authorized live operation counts and measured
usage/cost, output/cleanup evidence, public URL/state, kill-switch and rollback
proof, documentation paths, local changed files/Git state, and every remaining
owner/external blocker. Never include a secret or content-bearing identifier.

</details>

</details>

## Exit release acceptance follow-up — 2026-10-04

CL-007's owner-approved Exit endpoint is in the production route inventory.
Before public deployment, verify same-origin cookie expiry and the Next `after`
handoff on the target host, connect its server-only control origin, and confirm
private expiry/shutdown behavior. Cleanup failure must never block navigation or
require a visitor retry. The current Windows artifact still has 26 external
package links, so target-platform immutable release acceptance remains
unchecked. Preserve retained masters and exclude QA/process artifacts.
Fake/no-key failure tests and a synthetic browser check pass locally; genuine
cloud/provider deletion and the owner's paid input-path tests remain unverified.
