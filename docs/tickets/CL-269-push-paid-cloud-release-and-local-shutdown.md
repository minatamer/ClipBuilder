# CL-269 — Push, paid Cloud Run release and local shutdown

Status: scoped push, paid Cloud Run deployment and local shutdown completed,
2026-11-08. Non-processing live readiness verified; no extra Gemini run.
Real hosted media/quality/rights/device acceptance remains separate.

The owner explicitly requests pushing the committed application, deploying it
to the existing G Cloud application in paid mode using existing authentication,
then stopping the local app through the kill skill. This supersedes earlier
no-push/no-deployment holds for this bounded release. Preserve existing private
IAM, exact origins, secret references, limits, spend controls, saved media and
diagnostics. No extra Gemini test or automatic provider retry is authorized;
CL-265's one-run authorization remains consumed.

Depends on committed CL-264–268 and current hosted release preparation. Reuse
the existing project/services/registry and normal closed image contexts. Never
read ignored configuration, secret payloads or credential files. Inspect only
necessary cloud metadata; keep private resource identities/artifact records
outside Git. No DNS change, account/key creation, broad IAM expansion or
unrelated cloud modification is part of this request.

Acceptance:

1. Push the reviewed commit history without force or rewriting remote work;
   verify the remote main revision.
2. Build current secret-free frontend/backend Linux images and verify the
   packaged offline runtime/editor/native flow with synthetic fake/paid-off
   inputs. Earlier image digests do not prove this source revision.
3. Preserve rollback targets and confirm existing hosted prerequisites,
   authentication, trusted client-IP configuration, resource/scratch/lifecycle
   contract and paid flags. Deploy immutable images to the existing services;
   validate non-processing health/configuration and serving traffic. Never
   claim fake mechanics prove real hosted AI quality or bypass a failed gate.
4. Stop the repository's frontend/backend/internal worker only after the
   deployment attempt, including verified launchers/watchers/descendants.
   Prove ports 3000/4000/4200 and captured identities absent through a
   stabilization check. Preserve sources, recovery, drafts, exports and logs.
5. Record actual pushed/deployed revision, aggregate checks, deviations and
   open user-only acceptance; report any blocking condition honestly.

Real hosted Gemini requires existing API keys, live/paid approvals, hosted
readiness and explicit user processing. Fake/no-key offline probes do not bill
Gemini or establish voice/image/editorial quality. Cloud build, registry and
service activity can incur the ordinary deployment costs authorized here.

## Confirmed packaged-proof correction

The unchanged Linux proof reached the current editor with the generated 8-MiB
upload, then failed after 129.55 seconds at `explicit_picture`. It still queried
the retired `.picture-choice` selector; the current picture timeline exposes
`.focus-shot[data-picture]`, already used by CL-267's passing hosted proof.
Allocate `scripts/verify-hosted-editing-linux.mjs` here before correction: update
the empty-picture check and post-upload wait to the current selector. Preserve
all upload/native/decoded-pixel/audio/cancel/retry/quota/cleanup assertions.
This is a harness-only correction; production image inputs do not change.

The release bookkeeping/proof group comprises that script, this ticket, the
ticket index and the hosted release guide. Record exact whole-file checks and
commit/push this necessary correction/evidence under the owner's Git request;
never include generated/private records. Ordinary release artifacts stay tied
to the pushed application-source revision and byte-matched closed contexts.

After the selector correction, the proof completed exports and native cancel/
retry but failed its old monochrome pixel sample after 28.53 seconds. The sample
at (20,20) lies inside the newly styled title's rectangle; source video filters
intentionally run before colored overlays. Extend the same script allocation:
sample an unobscured source pixel at (4,45), first proving that the unfiltered
export is blue and then that the final export is nonblack gray. Keep the
existing channel-equality tolerance. This strengthens the decoded-source check
and avoids treating an intentionally colored overlay as a filter regression.

The corrected small fixture passed in 28.40 seconds with zero external attempts,
native H.264/AAC export, decoded filter, cancellation/retry, quota, expiry and
cleanup. The separate `--maximum-upload` gate remains to run; do not represent
the default 8,388,731-byte fixture as the 500-MiB upload-boundary proof.

## Completed preparation

- Normal fast-forward push succeeded; remote main matches application revision
  `1ae79593037603578e6de070a7df07a6760ffa2e`. No force/history rewrite.
- Existing authenticated project/services/registry were uniquely identified.
  Selected metadata confirms production paid/master/transfer/image/project
  approvals, trusted-IP flags and ledger configuration; four referenced secret
  versions are enabled. No secret payload or ignored environment file was read.
  Frontend is public and backend remains private; anonymous health returns 403.
- Existing source deployment has a 200 `/start`, CSP and a 404 shared-editor
  capability endpoint. Actual resources are one CPU/512 MiB with throttled CPU.
  The target preserves frontend settings and applies the already documented
  two-CPU/eight-GiB backend with 5376-MiB `/tmp`, background CPU and min-zero/
  max-one bounds. Do not claim these target settings applied before rollout.
- Started installed Docker Desktop without changing its settings. Built fresh
  closed anonymous-context backend/frontend images and passed both non-root,
  read-only, network-isolated entrypoint/asset/CSP probes. All 636 input files
  byte-match the pushed application source; private owner data/env are excluded.
- Maximum-upload packaged proof subsequently passed in 53.73 seconds with
  524,288,000 synthetic bytes, native H.264/AAC export, source hash binding,
  caption/picture/text/filter edits, cancellation/retry reuse, quotas and exit/
  expiry cleanup. External attempts zero; OOMKilled false and memory-event
  counters zero. Peak sampled RAM 1,989,390,336 bytes and scratch 1,052,391,042
  bytes. This short low-resolution fixture does not certify every maximum
  duration/4K/history combination or hosted AI quality/cost.
- Corrected proof script passes scoped lint/format. No production image input
  changed during the harness corrections. Two initial temporary probe launch
  issues (bundle location and writable non-root home) were corrected without
  changing product guards or container/network isolation.
- Identified the dedicated local frontend/backend launchers and verified their
  UTC creation times, all 18 descendants and the three expected listeners.
  Nothing has been stopped yet. Detailed identity/rollback/artifact/configuration
  records and build/probe logs remain private outside Git.

Image publication and application rollout remain in progress. No additional
Gemini inference, cloud session or real media processing has been triggered.

## Scan follow-up allocation before rollout

Registry digest reads pass, but optional vulnerability metadata returns
SERVICE_DISABLED for Container Analysis. No cloud API was enabled. Downloaded
the official pinned Trivy 0.76.2 image/public database, then scanned local image
archives with networking disabled, no Docker socket/credentials and telemetry
disabled; no image/package inventory was exported to a scanner service.

The scan reports patchable Chromium/OS packages in the cached runtime layer.
Rebuild with the runtime stage cache disabled so the existing apt upgrade/install
steps fetch current maintained packages, retaining the owner's FFmpeg pin and
resource/security boundaries. Re-probe/rescan the actual replacement images.
Existing unfixed native-library findings require explicit reachability/deferral
disposition; do not label the images vulnerability-free.

CVE-2026-111181 is also reported for body-parser 2.3.0. The only inflation-enabled
Express JSON parser is the local synthetic sample router; production/preview
omit it and hosted intake rejects Content-Encoding independently. Apply the
[maintainer's documented workaround](https://github.com/expressjs/body-parser/security/advisories/GHSA-27r3-jxmh-p828):
disable inflation on that remaining parser and map unsupported encoding to a
safe invalid-request response. Allocate `apps/backend/src/app.ts`,
`apps/backend/src/http/errorMapper.ts` and `apps/backend/src/app.test.ts` before
implementation. Verify real parser HTTP rejection for valid gzip and trailing
data, followed by a healthy response, using fake/no-key composition only.

Whole-file release-fix commit: those three files, the existing Linux proof
script, this packet and the ticket index (six files). Push it before rebuilding
the backend image; the frontend's application inputs stay unchanged. The later
deployment/shutdown evidence commit owns this packet/index and the hosted release
guide (three files). This replaces the earlier four-file bookkeeping grouping;
no hunk staging, dependency-policy bypass, provider call or broad remediation.

Parser regression: the pre-fix gzip request returned 500 rather than a safe
400. With inflation disabled and unsupported encoding mapped to INVALID_REQUEST,
both valid gzip and gzip with trailing bytes return 400 and subsequent health
requests return 200. All eleven application HTTP tests pass; backend TypeScript,
scoped lint/format and the earlier 272 relevant fake/no-key regressions provide
the release-fix gate. No package pin or live/paid policy changed.

## Replacement artifact gate

The six-file whole-file release fix is committed and pushed as `72b6e56`.
Rebuilt both closed contexts with the runtime stage cache disabled; current
Chromium/OS patches replaced the stale cached packages without changing the
FFmpeg pin. Both replacement entrypoint probes pass. The replacement maximum
500-MiB upload/editor/native proof passes in 52.63 seconds, with zero external
attempts/OOM events and complete quota/cancel/retry/exit/expiry checks. All 636
image inputs byte/blob-match that pushed source revision.

Offline Trivy reports no remaining fixable critical finding. Backend totals:
1,561 findings (8 critical / 426 high); frontend: 215 (1 critical / 34 high).
The only remaining fixable high entries are the duplicated body-parser copy
covered by the documented no-inflation workaround and production sample exclusion.
Do not present these reports as zero vulnerabilities or complete security signoff.

Remaining native/vendor criticals are unfixed/deferred upstream library entries.
The application admits only H.264/VP8/VP9 decoding and file/pipe MP4 protocols,
excluding the reported AV1 and TLS functions; it exposes no ZIP creation, SQL,
DBus/XML or arbitrary browser-document execution. The fixed compositor consumes
bounded admitted assets. These are scoped reachability constraints, not library
patches or a claim that every high finding is unreachable. Preserve the owner's
existing SEC90-01/FFmpeg deferral and its recorded limits; no broad native upgrade
or unrecorded risk waiver was applied. Current paid release authorization is
explicit; real hosted quality/rights/device acceptance remains separate.

Initial and replacement image/scan records remain private outside Git. Only
replacement digests may be used for the application rollout. No cloud scan API,
DNS, identity, secret payload or provider inference changed during this gate.

## Deployment and shutdown receipt

- Published the replacement immutable backend/frontend digests, preserving the
  initial artifacts and previous serving revisions for rollback. Created both
  replacement revisions at zero traffic, checked their exact digests/Ready
  state and unchanged IAM, then routed both to 100% on the `cl269-72b6e56`
  revision suffix. Actual service/resource identities and rollback metadata
  remain outside Git. Backend digest starts `31f5b2c9`; frontend `eaacab86`.
- Actual backend settings are two CPUs/eight GiB, 5376-MiB Memory volume mounted
  at `/tmp`, CPU throttling false, min zero/max one, concurrency eight and
  360-second timeout. Frontend remains one CPU/512 MiB with throttling. Existing
  renderer, origin/identity/secret/ledger settings and DNS are preserved.
- Live HTTPS `/start`, `/api/sample/config` and `/api/local/capabilities` return
  200. CSP and no-store remain. Provider-ai planning/captions/Hook titles are
  available; manual Find visuals is false. Paid analysis/assembly/render flags
  are true. Public input remains 524,288,000 bytes / 1,200 seconds. Anonymous
  direct backend health still returns 403; no public backend IAM was granted.
- Verification used only non-processing GETs and metadata. No real source
  upload, media session, new transcription/planning/image/title or paid pipeline
  retry was performed. CL-265's single real-run allowance remains consumed.
- Refreshed the local identity inventory after the parser edit's normal watcher
  reload. Stopped frontend 9432, API 2036 and internal worker 8244, with dedicated
  supervisors 8376/18884 and all eighteen captured process identities. Attempted
  normal interruption, then used identity-checked tree cleanup for survivors.
  Two stabilization snapshots show zero owned survivors and zero listeners on
  3000/4000/4200. No replacement app was launched.
- Archived then removed only the two skill-owned active runtime records after
  cleanup. Source/library/recovery/drafts/exports, ignored configuration and
  private diagnostics/logs were preserved. Removed the three completed owned
  proof containers; scanner containers removed themselves after completion.
- Operational deviations: the first traffic command's formatted response did
  not prove its target, so actual service traffic was read back before proceeding;
  the backend was already correctly promoted and was not submitted again. A
  graceful-console helper detached its own console and could not launch the
  forced fallback; a fresh shell completed the same verified cleanup. No
  ambiguous process, unresolved cleanup or automatic provider retry remains.

Final release evidence uses the planned three whole documentation files: this
packet, ticket index and hosted release guide. Scope checks are format/whitespace,
exact staged/committed whole-file blobs, source-code equality with deployed
`72b6e56`, normal fast-forward push and final clean worktree/index. Detailed
image/input/scan/traffic/health/process records remain private outside Git.
