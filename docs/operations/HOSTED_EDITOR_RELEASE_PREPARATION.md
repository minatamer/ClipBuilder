# Shared upload/editor release preparation

## Fresh Linux verification and commit packaging — CL-183, 2026-10-31

Owner authorizes the [whole-file plan](CL180_183_COMMIT_PLAN.md) and multiple
local ticket-prefixed commits covering all CL-180/181/182 work. Fresh closed
Linux/amd64 production images pass actual packaged non-root runtime checks:

- Backend `sha256:f96bf4d78a0fcfc425bb67f50787d646b13b0256ce7d9dadd60cb24ae58d93f7` (61.49s build).
- Frontend `sha256:7a6bc52f7bb3b4f924b2b71fdfcb7e6da975285c9930dd034c6d20cd83370298` (52.06s build).

The current-source packaged browser/native walkthrough passes in 54.37s,
including a 524,288,000-byte chunked synthetic disk upload, source hash binding,
explicit fictional captions/uploaded image, caption and picture positioning/motion,
timed text, decoded monochrome filter and H.264/AAC MP4 export. Cancellation,
retry reuse, quota, exit/expiry cleanup and ENOSPC preservation all pass.
Fake counts are transcription 1, captions 1, AI selection 0, plan 1, generated
images 0, inspection 1, preview 1 and final-native attempts 4 (one canceled).
External attempts 0; OOMKilled false and every memory event counter is zero.

Profile: 2 CPU, 8 GiB/no swap, 5376-MiB scratch, 128-MiB home, 256-MiB shared
memory and read-only root, no network/published ports/credentials/owner media.
Peak sampled RAM 2,493,820,928 bytes (about 2.32 GiB),
logical scratch 1,052,398,352 bytes and reservation 3,074,499,193 bytes.
The source is four seconds at 160x90, exports one second at 52x90; the large
source adds valid padding. This verifies the upload-byte boundary and feature
flow, not maximum-duration 4K, all retained-history combinations or hosted cost.
All 534 closed-context inputs match the current checkout. Three proof containers
were removed, and the normal Windows app/session/Gemini selection is preserved.

The owner's separate real Find visuals action is confirmed from existing safe
logs: three actual Gemini searches, six matched tool call/results, twelve queries,
three retrieved images, none dropped and no generated fallback. This packaging
made no paid/provider call and does not imply owner image/editorial acceptance.

These images supersede the older CL-181/182 packaging gate below. No registry
submission, push, cloud inspection/change or deployment. Real hosted identity/
Turnstile/resource/mount/lifecycle/capacity/cost and owner release acceptance
remain separate. [CL-183](../tickets/CL-183-fresh-linux-and-commit-packaging.md)
records exact evidence and local commit identities.

All current work is packaged by the authorized five-commit, 40-path series;
CL-183 records the first four IDs and this final documentation commit. The final
HEAD and clean-worktree verification are reported in the execution handoff.

## Gemini Search correction — CL-182, 2026-10-31

The owner's real Gemini run generated fallback art; the old missing-query-field
log could not establish whether a search occurred. The discovery adapter now
uses documented stateless Interactions Search with actual call/result and usage
evidence, grounded citation recovery and precise safe originating diagnostics.
Model/key/gates, broad retrieval, optional fallback and one-request/no-retry
budgets remain. 209 focused/local/protocol checks pass using fake transports and
synthetic images, including installed SDK serialization. No paid call or real
image download was made. Live authenticated behavior remains owner acceptance.

CL-181's Linux image below predates this source correction. Fresh packaged
verification of CL-182 is still required before any future release; these local
checks do not update or certify that older image. No cloud or deployment action.

## Gemini parity and current backend — CL-181, 2026-10-31

The owner requests the three CL-180 parity fixes and one local Gemini test.
Gemini manual-only analysis now uses bounded cut audio and source-relative
partial/full transcript reuse; the hosted bounded path retains charging.
Initial Gemini, Codex and Find visuals share the tolerant decoder preserving
alternate image briefs and safe field/rule diagnostics. Both planners share
tight-head and evidence-backed opening-speaker instructions. Codex progress/local
speech and Gemini raster generation remain intentional differences.

859 local fake cases, three current-source browser/native proofs, types/lint/
format and read-only validation pass. Fresh backend image
`sha256:22ef7b15ceb26e6ea032d06be1f10a7ba91d4794b3dfcd9e628fd9f0b7823da3`
passes offline startup and the packaged 500-MiB synthetic upload/editor/native
export/cancel/retry/quota/cleanup proof at 2 CPU/8 GiB/5376-MiB scratch. No external
attempt/OOM event. Four-second low-resolution source and one-second exports
remain limited evidence, not maximum-duration 4K or full retained-history proof.
The unchanged frontend keeps the CL-180 image below.

After fake verification only AI_PROVIDER was changed to Gemini, including both
pre-existing identical assignments. Every other configuration byte is preserved.
Normal backend/current worker refreshed; Gemini planning/visual/caption capability
GETs pass, frontend and the owner's clip/art/audio remain. No upstream Gemini
call was made. The owner refreshes and starts one fresh run for real acceptance.

[CL-181](../tickets/CL-181-gemini-provider-parity.md) owns exact evidence/logs and
supersedes CL-180's three open provider recommendations. These changes and the
preserved CL-180 fix remain unstaged/uncommitted. No push, registry submission,
cloud change or deployment. Actual hosted settings/cost/lifecycle/capacity and
owner live Gemini/visual/release acceptance remain separate; deployment deferred.

## Fresh Linux verification — CL-180, 2026-10-31

The owner authorizes fresh local Linux production builds/offline packaged checks,
with fake AI, no paid calls and no deployment, and now intends one real Gemini
session after a read-only provider comparison. This supersedes the stale-image
gate in the CL-168–179 handoff below for the exact current artifacts/checks here.

Fresh frontend `sha256:82c020f1783c03a5b8216f1e5f3bb7d8e9e02167d3e5e8cda1c15c9540e32e24`
and corrected backend `sha256:800b7992cadcd61282ccdd01a06b54cda948c1e51906e96d4063e4627ab4fbd6`
build from closed secret-free contexts and pass actual non-root offline entry
probes. Packaged upload/editor/native H.264/AAC export, position/motion/text/
filter edits, cancellation/retry reuse, quota and cleanup pass at 2 CPU/8 GiB
with the required 5376-MiB scratch volume. The 500-MiB upload-byte case passes
with peak sampled RAM about 1.83 GiB, zero OOM events and zero external attempts.
The generated video is four seconds at 160x90 and exports one second at 52x90;
this does not certify full-duration 4K or every retained-history maximum.

The first real export exposed a Windows/Linux binary compatibility defect:
packaged FFmpeg 5.1.9 rejects the newer explicit `ts_sync_mode=default` option.
Omitting that default fixes the real Linux export while current-source decoded
visual/audio onset proofs retain parity at 24/25/29.97/30/60fps. The walkthrough's
old Pictures selector was separately updated to Media/Caption Style. Production
provider policy, codecs/quality and resource limits are unchanged. The normal
Windows backend/current worker is refreshed and the owner session preserved.

The provider review confirms shared search-first retrieval, Find visuals,
Pop/title/hook/editor features and local Find all for either provider. Separate
recommendations remain: scoped Gemini manual transcription, preserving its
initial alternate image briefs/richer rejection diagnostics, and matching the
Codex opening-speaker/tight-head framing instructions. None was silently changed.
Codex CPU speech, temporal samples, CLI search and its local progress checklist
remain intentional differences; Gemini retains its raster-generation fallback.

[CL-180](../tickets/CL-180-current-linux-build-and-provider-parity-review.md) owns
exact artifacts, red/green evidence, fixture/capacity limits, logs and validation.
Its five-file compatibility/proof/documentation changes remain unstaged and
uncommitted. No image was pushed or deployed. Remaining: owner real Gemini and
visual acceptance with configured key/live approvals; actual hosted resource/
mount/background-CPU/lifecycle/capacity/cost confirmation; authorized source
packaging/push/rollout and serving/rollback verification. Fake/no-key success
does not establish real Gemini search or editorial quality.

## Current change handoff — CL-168–179, 2026-10-31

The owner reports the local Codex workflow works and has finished the desired
editing changes. CL-168–178 adds scoped/deferred speech preparation, local-only
stage progress and Find all moments, broad image discovery for both providers,
explicit Find visuals, usable-art retention, detailed safe diagnostics, actual
Codex tool-host execution, native HTTP retrieval and visual-start Pop parity.
CL-179 packages verified whole-file local commits and fixes stale test harnesses.
The current owner session/media/configuration remains preserved.

Local Codex is never a hosted provider. Its speech tooling, progress checklist
and Find all control stay local; the hosted Gemini path receives the shared
visual retrieval/CTA/sound fixes with its existing authentication and spend
gates. Fake/no-key checks verify orchestration and bounded native/browser/tool
mechanics; the owner's real Codex image result does not establish Gemini's real
grounded search behavior or this revision's Linux/hosted readiness.

Remaining release work, before any public rollout:

1. Build fresh closed, secret-free frontend/backend Linux images for the final
   commit and rerun the packaged offline upload/editor/native export/recovery/
   cancellation checks. Earlier CL-123/130 Linux evidence predates these edits.
   Preserve the existing running Windows app; a normal Next build over its
   `.next` directory is not a substitute for an isolated release build.
2. Verify the selected 2-CPU/8-GiB backend profile with its 5376-MiB `/tmp` volume,
   background CPU and min-zero/max-one lifecycle against current accepted work
   and capacity. Review actual hosting cost/budget in Console. These are the
   documented target settings, not a claim that live services were inspected or
   changed today. Keep the current frontend allocation and private backend IAM.
3. On a separately authorized protected candidate, have the owner check Gemini
   upload → moments → processing → image search/fallback → edits/sounds → MP4
   export, plus actual hosted quota/session/expiry behavior. Use existing keys,
   live/transfer/master approvals and owner acceptance; agents make no paid call.
4. Push the reviewed commit series and build/roll out the approved image digests
   through the existing deployment process only with explicit authorization.
   Verify non-processing health/configuration and approved serving traffic; keep
   a rollback target. This handoff performs no push, cloud inspection/mutation,
   image submission, deployment or DNS change.

No new product feature is proposed as a release prerequisite. Current local
commit/check evidence is in [the packaging ticket](../tickets/CL-179-current-work-verification-and-commits.md)
and [file-level plan](CL168_179_COMMIT_PLAN.md). Historical sections below retain
their original evidence; this handoff does not promote them to current proof.

## Current resource contract — CL-130, 2026-10-29

The owner selects **2 CPUs / 8 GiB** for the next release candidate. The older
16-GiB proposal and CL-125's provisional 4-GiB target below are historical, not
current deployment instructions. No resource or deployment change is performed.

The backend now requires a dedicated **5376 MiB in-memory volume mounted at
`/tmp`**, with an 8-GiB-or-larger cgroup memory limit. This is 5 GiB admitted
media plus the existing 256 MiB filesystem reserve, leaving 2.75 GiB outside the
volume at the target allocation. Normal unbounded root scratch and incompatible
mounts/cgroups fail before the hosted worker/provider composition. Both cgroup
v2 and v1 readings are supported; unavailable/unbounded readings fail closed.
Actual Cloud Run mount behavior remains a release check; fake-mode health does
not activate or certify production hosted composition.

Admission counts existing preview/export/asset bytes, reserves every queued
export at its existing maximum and shares one unchanged 2-GiB overlay allowance.
The runtime measures filesystem allocation with hardlink deduplication, counts
browser/private-state overhead against the same ceiling, and checks only the
additional filesystem/RAM demand. A full volume or low memory rejects work
without pruning completed exports or retrying providers. The hard volume limit
protects process memory if a write runs out of space after admission.

The existing public 500-MiB / 20-minute source bounds, three trial clips,
manual/AI duration bounds, twenty export revision IDs, native height/cadence,
CRF 18/veryfast/AAC settings and all local owner limits remain. The finite
aggregate storage ceiling still applies: twenty revisions do not guarantee
twenty maximum-sized files for every clip simultaneously. This work does not
silently discard history to fit the budget. Keep existing min-zero/max-one and
the separate background-CPU/lifecycle release gate; do not switch billing or
deploy from this document. [CL-130](../tickets/CL-130-hosted-eight-gib-scratch-budget.md)
owns current checks and limitations.

Local verification is complete: 50 focused regressions plus types/lint/format,
the current packaged Linux upload/editor/export/cancel/retry/expiry proof with
a 500-MiB disk-selected synthetic upload, and a small ENOSPC volume test that
preserves retained output. Sampled container RAM peaks near 1.85 GiB with no OOM
or external/provider attempts. The export fixture is short/low-resolution;
neither full-duration 4K nor every maximum retained-history combination is
certified. All actual hosted settings remain unapplied.

## Measured native sizing — CL-125–127, 2026-10-28

[Offline benchmark and limits](HOSTED_NATIVE_BENCHMARK.md) supersedes treating
the older 4-CPU/16-GiB proposal below as measured need. Current measurements use
the rebuilt actual Linux worker after CL-126's metadata-only zoom fix and
CL-127's bounded native RPC transport, preserving the existing 10/11-minute
budgets. Recommended processing target is **2 CPU/4 GiB**: full-minute HD takes
158s versus 164s at 8 GiB with identical decoded video/audio. One CPU takes 292s.
Full-minute landscape 4K/60 takes 409s at 2 CPU/4 GiB or 292s at 4 CPU/4 GiB;
the latter costs 43% more allocated CPU seconds. Short archived 4K controls are
byte-identical at both RAM caps (SSIM 1.000000), and maximum-frame-size portrait
testing peaks at 1.48 GiB. Full-minute 4K runs are not claimed bit-identical.

At CL-125 completion, the unchanged 12-GiB scratch ceiling blocked a RAM-only
reduction. CL-130 now supplies the bounded 8-GiB contract above. No deployed
allocation changed. Steady CPU for background work, lifecycle and maximum
accepted workload gates remain; these local caps do not model Cloud Run
throttling or prove every permitted source/history combination. Owner real-AI,
rights, visual and release acceptance remain separate. Older larger-resource
language below records the conservative historical storage proposal.

## Actual ingress verification — CL-124, 2026-10-28

The owner explicitly authorized the protected temporary ingress probe, required
source fix, named settings updates after success and scoped local commits.
Both current native Cloud Run entry points append **one final observed client
address**. The earlier external-load-balancer two-address assumption below is
superseded for this verified topology. Reverify after DNS/proxy/ingress changes.

The first real probe reproduced a security defect: ordinary requests had one
forwarded address and were rejected, while adding a supplied prefix made the
old second-to-last extraction select the supplied address. Corrected the actual
source helper to use the final native Cloud Run address; retained the explicit
verification gate, IP/length validation and authenticated backend bridge. Added
the observed one-hop/forged-prefix regressions and a disabled-gate zero-dispatch
check. Both affected suites reproduced failures first and now pass: eight tests,
with frontend types and scoped ESLint/Prettier clean.

The corrected source helper passed actual managed-URL and custom-domain probes:
baseline, single/multiple/malformed/duplicate/mixed-case forwarded prefixes,
forged client-IP/X-Real-IP/CF-Connecting-IP/Forwarded fields, oversized input and
unauthenticated diagnostic access. Accepted requests selected the same coded
network identity across entries; hostile inputs were ignored or rejected.
Direct unauthenticated backend requests with forged identity headers were denied.
Only coded header shapes/results were returned to the authenticated operator;
no raw IP or bearer token was logged or written to the result record.

The probe used a short-lived bearer-gated startup wrapper before the existing
unchanged frontend server, first locally and at zero traffic, then through the
actual entry points. Normal app pages kept working. The wrapper had a fixed
expiry/no-store responses. Normal startup/routing was restored, all diagnostic
revisions/tags and local probe containers were removed. Cloud Run's serving
`latestReady` pointer initially still named the probe after creation of an
unrouted normal revision; cleanup was corrected to route `latestCreated` and
verify actual entry commands/readiness before deletion. No permanent route ships.

After the passing corrected probe and cleanup, enabled
`HOSTED_DEMO_IP_VERIFIED=true` on backend and frontend and injected the private
backend ledger setting. Only these named non-secret values were projected for
verification; secret payloads/ignored env files were not read. Both config
revisions serve normally and the non-processing config bridge returns 200.
Images, identities, ingress/IAM and CPU/memory/concurrency/timeouts/scaling are
unchanged. The fixed-source frontend Linux image also builds (30.42s) and its
offline non-root asset/CSP/route probe passes (2.34s).

These are prepared live ingress settings and a committed source correction,
not a rollout of the new application images: the existing deployed images were
preserved and their new editor capability route remains 404. The new hosted
quota/editor workflow is not claimed released. Maximum native workload/resource
and cost acceptance, owner real-AI upload/export, visual/rights/security and
public release gates remain open. CPU comparison requested by the owner was
read-only; the backend stays one CPU/512 MiB with throttled CPU. Four CPUs/16 GiB
with always-allocated CPU remains a proposal, not an applied setting.

## Current production preflight — CL-123, 2026-10-28

The owner authorizes deployment preparation and local staging/commits. This
section supersedes older pending-Linux statements only for the evidence below;
it is not public-release acceptance or permission to run paid AI. CL-122 storage
setup is committed as `7d7fe71`. No application revision/configuration changed.

- Current secret-free frontend/backend Linux/amd64 production images build
  locally (34.84s / 39.99s), with anonymous Docker configuration and public build
  dependencies only. Both non-root, read-only, network-isolated runtime probes
  pass (1.59s / 1.12s), covering frontend assets/CSP/route exclusion and the real
  backend bundled entry/health/paid-off guards. These are local images, not
  registry-pushed or deployed revisions.
- The original hosted Linux proof reproduced 503 capability/workspace failures
  and timed out (124.20s) because its synthetic host predated mandatory usage
  injection/verified client identity. Update the existing proof with the shared
  fake usage fixture, controlled synthetic identities and current session status
  envelope. All original editor/native checks remain. The current proof passes
  (28.61s), additionally denying a second session after successful export.
  It covers generated chunked upload/hash binding, explicit fake captions,
  uploaded picture, timed Text, saved settings/filter, native export, cancellation,
  retry reuse and exit/expiry cleanup with no keys or external network.
- The small fixture is **52x90, 30 fps, one-second output**. Measured peak
  container memory is **961,482,752 bytes**, scratch **12,221,838 bytes** and
  declared reservation **3,766,485,353 bytes**. This is not a 4K/60fps or maximum
  source/three-clip capacity proof. Docker has 8,118,738,944 bytes total, and the
  proof is capped at four CPUs / 4 GiB; it cannot certify the proposed 16 GiB
  maximum-workload profile.
- Fresh read-only Cloud Run metadata confirms frontend and backend each remain
  at **one CPU / 512 MiB**, concurrency eight, max one, timeout 360 seconds and
  CPU throttling enabled. The backend has no public invocation binding. This
  existing allocation remains unsuitable for the shared native editor; no
  resource/billing setting was changed. Candidate backend settings remain four
  CPUs / 16 GiB, always-allocated CPU, min zero/max one, pending maximum capacity
  and cost acceptance. Keep frontend settings unchanged.
- One native Cloud Run domain mapping exists. Compute forwarding-rule metadata
  cannot be queried because its API is disabled; no API was enabled. Neither
  service metadata nor a native mapping proves the received two-address header
  suffix assumed by `hostedDemoClientIp`. Actual controlled header probes through
  the custom domain and native service entry point, including forged supplied
  prefixes/direct bypass, are still required. **Do not enable verified-IP flags.**

Private concrete image/context/log records and the candidate ledger/resource
settings are retained outside Git. No ignored env/secret values were inspected.
Source/proof and deployment settings are ready for review, but public deployment
is not ready: actual trusted ingress, maximum capacity/resource/cost acceptance
and the owner's real-AI/visual/rights/release gates remain open.

Owner real-AI checklist for a separately approved protected release candidate:

1. Confirm real provider/Turnstile keys, live flags and paid/transfer approvals;
   preserve the existing HMAC key and inject the new bucket setting. Verify
   trusted ingress first; keep normal localhost free of hosted quotas.
2. Upload an owned short conversation, request a mix of manual/AI clips totaling
   three, try excess inputs and inspect correction/toast, then process explicitly.
3. Inspect actual returned moments, preview and captions/pictures/filter edits;
   Apply and Export deliberately. Verify MP4 audio, framing, text and playback.
4. Exit and retry from the same network: exhausted entry must appear after a
   successful export whether downloaded or not. Existing-session editing/export
   must still work. Never reset/delete the ledger to repeat acceptance.
5. Inspect the current production allocation/cost/capacity and final visual,
   physical-device, rights and release acceptance before public cutover.

## CL-114 usage accounting prerequisite — 2026-10-28

Hosted visitors share three manual/AI slots, three cumulative prepared clips and
one source. A two-hour reservation blocks concurrent/new sessions; first valid
export generation consumes a rolling 24-hour network allowance, independently
of downloads. Same-session retry/edit/export stays usable. Failed/abandoned
reservations expire; actual dispatch charges never refund. Localhost is unchanged.

The backend-only `HOSTED_DEMO_OWNER_IPS` environment value starts blank (CL-115).
Set comma-separated exact public IPv4/IPv6 addresses in ignored backend
`.env.local` for local configuration, or inject the same private environment key
on the hosted backend. Restart after changing it; do not put addresses in source,
frontend environment, build arguments or public configuration. At most 32 exact
addresses are allowed; blank means no exemptions. Mapped IPv4 normalizes; visitor IPv6
accounting groups /64 privacy addresses. Exempt owners keep the existing ten-clip
safety bound and can clear/start another session. Security/global caps remain.

Global UTC-day ceilings: 20 session admissions, 100 provider dispatches and
200 native jobs, including provider-internal media preparation and owner use.
Hosted retains the existing 32-call session/process editor budget rather than
the old seven-call walkthrough allowance. These work bounds are not dollar
limits or protection against all infrastructure DoS; retain billing safeguards.
An IP is not a person: NAT shares allowances; VPN/address changes evade IP
friction. Global accounting still bounds work across IPs/instances/restarts.

CL-122 owner follow-up, 2026-10-28: retain the Cloud Storage design and authorize
the private bucket/object, narrow backend IAM and bounded storage verification.
Storage setup below is complete. This does not deploy an application revision
or enable/change its environment. Concrete resource names and the later backend
setting are in a private OS-temporary handoff, outside Git; no secrets were read.

Owner release prerequisites and verified storage setup:

- [x] Provision a dedicated private Cloud Storage bucket with the fixed
      `demo-usage-v1.json` object. Narrow exception to historical no-cloud-object
      policy for metadata only: no media/accounts/durable projects. Pre-create
      once with `{"version":1,"day":0,"sessions":0,"provider":0,"native":0,"leases":[]}`.
      Never reset/delete it during releases or media cleanup. Review object
      version/soft-delete retention; expired active records leave on next write.
      CL-122: Standard storage in `europe-west1`, uniform bucket-level access,
      enforced public-access prevention, no versioning/retention/lifecycle rule,
      and soft delete disabled. Exactly one ledger object was verified.
- [x] Grant the existing backend runtime a custom role with only
      `storage.objects.get/create/delete`, bound on the dedicated bucket with a
      condition restricting it to the exact ledger object. Delete permission is
      required for overwrite; application writes use generation preconditions.
      No frontend/public binding was added. Actual backend adapter read and
      unchanged-content conditional update passed; a stale generation returned
      false, backend listing was denied and anonymous object read was denied.
      Direct frontend-identity denial was not exercised because existing CLI
      impersonation permission for that identity was unavailable; no extra
      impersonation grant was made. The bucket policy was inspected instead.
- [x] Inject backend `HOSTED_DEMO_LEDGER_BUCKET` during the CL-124 authorized
      configuration change and verify only this named setting. The private `PROCESSING_GRANT_KEY`
      supplies domain-separated network HMACs; preserve it across releases.
      Rotation must retain prior allowance coverage. CL-122 changed no app env,
      revision, secret, origin, paid switch or local configuration; CL-124 later
      adds only the named settings through config revisions.
- [x] Verify the actual native Cloud Run suffix on managed/custom-domain ingress:
      `[untrusted supplied prefix,] client-ip`. CL-124 corrects the old two-hop
      assumption, proves supplied headers cannot replace that final address,
      verifies private backend denial and enables the verified flags afterward.
      The bridge replaces browser identity headers over the authenticated API.
      Missing/malformed trusted suffix or a disabled gate fails closed. Re-audit
      before using another load balancer, CDN or changed ingress topology.
- [ ] Verify real hosted concurrency, cross-revision accounting, conditional
      conflicts, IAM failure, ingress spoofing, exhausted entry and owner bypass.
      Provider calls retain separate owner approval; local tests cannot certify
      deployment wiring. Re-audit after topology changes.

The adapter reads a bounded pre-existing object pinned to its generation and
writes only with `ifGenerationMatch`. Accounting conflicts retry at most four
times; provider work never retries automatically. Missing/corrupt/offline/busy
accounting fails closed with no memory/filesystem fallback. Only digests, lease
IDs and counters persist; no raw IP/media/filename/credential enters the ledger.
Hosted Privacy discloses separate temporary coded network accounting.

Owner decision, 2026-10-24 (CL-061): one normal app. Upload â†’ manual/AI moments â†’
clip preparation â†’ caption/picture/filter editor â†’ Apply/Discard â†’ export/download.
YouTube acquisition, local library/drafts/sample and the CL-078 fake-caption
action / paid-switch exception are local-only. This is prepared source code; it
does not change the currently deployed revision. Agents must never deploy for
the owner or run credit-consuming tests without new explicit approval.

## Next-build feature visibility â€” source audit, 2026-10-25

This describes the current source with normal production paid/auth configuration.
It is not a new deployment or a fresh inspection of the deployed revision/cloud
settings. The owner will manually test these changes before choosing deployment.

| Feature | Hosted next build | Local-only distinction |
| --- | --- | --- |
| MP4 upload and responsive drop area; manual/AI moments; clip selection | Visible | Hosted upload uses bounded chunks; the large raw local-file Proxy fix does not add hosted YouTube acquisition. |
| Captions Style / Position / Text, word corrections with fixed timestamps | Visible | No timestamp editing or word insertion/deletion UI was added. |
| Generate captions when a clip has none | Visible with normal paid/provider readiness and explicit consent | Only local mode can use the confirmed caption-only exception while fake mode / paid master are off. No new environment keys. |
| Filters, real AI contextual pictures, manual pictures, timing Capture, motion and positioning | Visible | Uploaded PNG/WebP alpha is preserved in preview, drafts where supported, and native video composition; existing flattened copies require re-upload. |
| Automatic portrait framing and Focus Camera / People editor | Visible | Every position has independent settings/times; person selection, numbering, removal and capture are shared UI. Fake people/tracks are test fixtures only. |
| Vertical MP4 exports using original-source crop/detail and source frame rate | Visible | Hosted capacity must be verified for the larger high-resolution output; no silent quality downgrade is introduced. |
| Start over, Add more clips, Apply/Discard, export/download | Visible | Hosted Start over discards temporary session media; local saved sources/drafts/exports remain outside that cleanup. Removed mode/status badges stay removed. |
| Completed transcription reuse for the same source/revision | Shared within the session | Hosted has no durable or cross-user transcript/library cache. |
| YouTube URL/resolution input and saved-download reuse | Hidden; routes rejected | Local only. Hosted users upload MP4s. |
| Use demo sample, saved draft JSON import and Downloads library/reopen | Hidden; routes rejected | Owner-local filesystem features; hosted sessions expire and do not create durable projects. |
| Generate fake captions and automatic fake-content policy | Fake CTA hidden; no fake runtime | Local CTA is key-free. New fake clips default to no captions; automatic fake Earth art is retired. |
| Local paid-switch bypass, owner agent/capture tooling and retained private media | Hidden/unavailable | The caption exception requires APP_ENV=local; hosted keeps ordinary paid gates, authentication/CSRF, session isolation and budgets. |

Evidence: shared `/start` routing in `apps/frontend/src/app/start/page.tsx`,
hosted UI conditions in `experience.tsx` and `clip-batch-panel.tsx`, hosted path
allowlist/capabilities/provider charging, and `composeLocalCaptionProvider`'s
local/non-test guard. CL-067â€“079 own the feature/proof details. Current checks
include 564 fake/paid-off local unit tests and actual Windows synthetic browser/
native exports; they do not establish live Gemini quality or hosted capacity.

Before any deployment decision, finish owner manual acceptance, rebuild/re-run
the Linux packaged image proofs with these new features (CL-063 predates them),
and verify the deferred allocation/cost/capacity items below. Keep FFmpeg as-is
per owner decision. No push, cloud mutation, deployment or paid test is authorized
by this audit or by the local commit approval.

## Deferred deployment checklist â€” 2026-10-25

CL-084 follow-up, 2026-10-26: the owner explicitly keeps G Cloud inaccessible to
the agent. No live configuration/billing was inspected and no cloud changes are
authorized. Source now separates preview preparation from final export: real AI
preparation remains; finished MP4s are created only on explicit Export. Linux
image/current-feature and owner real-mode acceptance remain release gates.

Historical CL-084 proposal, superseded by CL-125/130: retain min zero/max one; benchmark a
**4 vCPU / 8 GiB** demo profile before considering any change from the proposed
4 vCPU / 16 GiB profile. This would require a smaller temporary-media allowance
(candidate at most 5 GiB, leaving processing headroom) and explicit capacity
behavior, not a silent RAM-only reduction. Existing 12 GiB scratch cannot fit
inside 8 GiB RAM. Current-quality 4K/60fps, source/batch/export-history maxima and
Chromium/FFmpeg peak RSS must pass a current Linux proof before proposing exact
limits for approval. No such capacity proof or smaller allocation is claimed.
A later 2 vCPU / 8 GiB comparison is optional only if deadlines still pass;
slower rendering may erase CPU savings. Keep output quality unchanged.

First measure allocation/billable lifetime versus native work, AI waiting and
idle editor time. The editor currently polls about once per second even when
stable; reducing hosted idle/background polling is a separate local-code
candidate, not implemented by CL-084. Always-allocated CPU is currently needed
for background work; request-only billing is not a safe settings-only change.
A separate processing service/temporary-media handoff is deferred unless real
measurements justify the added demo complexity. Render-count reductions do not
establish billed CPU/GiB or dollar savings. See CL-084's explicit acceptance gate.

The owner is not deploying now. Revisit these items with the owner before a
future deployment decision; this note authorizes no cloud changes or deployment.

- [ ] Prepare the shared editor backend allocation: **2 CPUs, 8 GiB RAM**, a
      **5376-MiB `/tmp` in-memory volume**, and background CPU allocation,
      retaining **minimum zero / maximum one instance**.
      The read-only inspection found the older backend at one CPU, 512 MiB and
      request-only CPU allocation. The larger profile remains unapplied and its
      maximum workload capacity remains unverified.
- [ ] Review the increased running cost and verify the existing **USD 5 Cloud Run
      cap in Console**. CLI budget inspection was blocked by the disabled Billing
      Budgets API; that does not establish that the cap is missing. Enabling that
      API is not required for the Console check and is not authorized here.
- [ ] Include CL-070 source-quality output in the maximum workload check:
      native portrait can remain 2160x3840 at up to 60 fps, with denser lossless
      overlay capture. Existing byte/disk/duration limits still apply; exports
      fail at capacity instead of silently lowering resolution. Local synthetic
      proofs do not establish the proposed hosted allocation's maximum capacity.

Preserve the inspected frontend settings, IAM, runtime identities, secret
bindings and origins; no configuration change to those is currently needed.
The custom domain has valid TLS, but its cutover is optional: the managed Cloud
Run origin remains the working application origin. The owner also chose to
leave FFmpeg unchanged; no remediation or public-release risk acceptance is
claimed by that choice. The remaining release verification gates below still
apply. Fake/no-key local proofs do not establish hosted capacity or real Gemini
quality; hosted compute tests and real-provider checks retain separate approvals.

## Composition and boundaries

- One Next frontend and Express backend. The same React editor, domain use cases,
  contracts and renderer-owned fixed media composition serve both environments.
  An internal native worker is an implementation detail, not another app.
- Local mode retains the current normal startup, downloads/drafts and YouTube
  tooling. Hosted mode contains only an upload card; direct acquisition, saved
  YouTube, metadata/import, local-library and agent requests are rejected before
  native/provider work. Historical `/api/local` naming is a compatibility URL for
  the shared frontend bridge, not a second UI or a local-only editor gate.
- Hosted requests use `/v1/editing` through verified frontend identity. Exact
  browser Host/TLS/origin checks, SameSite/HttpOnly/Secure session cookies, CSRF
  forwarding and Turnstile session-start proof precede work. Temporary session
  state is confined to that backend boot/instance; no owner capability or library
  is exposed. The old hosted analysis/admission flow is not a parallel bypass.
- The original is uploaded in ordered 8 MiB chunks to a fixed temporary server
  file; no browser filename or path is trusted. Native inspection precedes AI.
  Gemini receives bounded proxies and brief descriptions for generated pictures.
  Media stays on the backend instance's ephemeral scratch, not durable projects
  or a shared public filesystem. Exit/expiry/shutdown clean it up. Restart loses
  the temporary session; downloaded files remain with the visitor.
- One active session per instance, at most three starts per five minutes, two
  pending proof checks, a provider ceiling of 32 per session/backend boot further
  restricted by the existing parsed admission allowance (currently seven, never
  increased by this adapter), 64 native
  calls per session, 1,024 media reads/2 GiB delivery. Existing source limits and
  ten-clip/three-picture-per-clip bounds remain. No automatic paid retry. Completed
  plans/images are reused for explicit retries; quality critiques remain advisory.

## Owner release gates, not executed deployment steps

The backend image now contains Linux FFmpeg, Chromium, the renderer package and
current fixed worker/overlay compiled at build time. The local YouTube downloader/
Python distribution is excluded; no runtime tool download is performed. The frontend/backend
closed context builder excludes ignored configuration, private media and tests.

The old lightweight backend allocation is insufficient for native encoding.
The current candidate is the 2-CPU/8-GiB bounded-volume contract above. Before
release, verify that exact mount, memory, request duration and background CPU
lifecycle on the actual hosted platform. Preserve a single API instance (no
cross-instance routing or durable session recovery is implemented). Frontend
request concurrency remains bounded at eight. These are release requirements,
not claimed resource changes; no resource/cloud setting was changed here.

Keep normal injected Gemini/Turnstile/approval configuration. No new AI mode or
second environment file is introduced. Paid-off/fake/test/preview or missing
approval/prerequisites cannot activate the hosted provider runtime. Local fake
mode needs no keys; synthetic hosted-shaped tests inject fake ports and generated
media with network blocking. Actual hosted Gemini processing requires real keys,
live approvals and deliberate visitor actions.

Before the owner deploys: verify the Linux image offline, source/caption/picture/
filter parity, scratch/resource ceilings, large chunked uploads, cancellation,
expiry/exit, single-instance routing and authentic frontend/Turnstile behavior.
Cloud builds and real-provider/paid acceptance require new explicit approval;
agents must never deploy. A Windows synthetic native/browser proof is not Linux
image or cloud acceptance. See CL-061 for checks actually run and unchecked gates.

## Local Linux verification completed â€” CL-063

The current secret-free frontend/backend images build and run on the owner's
local Linux Docker engine. An offline generated-media probe exercises the actual
packaged worker and shared upload/editor, chunk/hash binding, caption changes,
picture position/motion state, decoded filter output, native MP4 download,
cancellation, explicit retry reuse, expiry and exit cleanup. The frontend image
also passes fixed-asset, CSP and route checks; fake/paid-off backend startup keeps
paid routes unavailable. See the [CL-063 evidence](../tickets/CL-063-local-hosted-release-verification.md).

The proof uses no API keys: fake AI, hardcoded paid-off environment, loopback-only
transport and a network-isolated non-root container. The probe script is bundled
with pinned esbuild into owned temporary scratch and mounted at
`/app/dist/verify-hosted-editing-linux.mjs`; its synthetic UI is mounted at
`/proof/ui`. Neither is shipped in the application image. It runs the packaged
`/app/media/dist/editing-worker.js` and image-owned native tools, rather than a
Windows binary or stale overlay. Use a read-only root with writable temporary
scratch/home, at least 512 process slots for the proof's two Chromium instances,
two CPUs and 8 GiB memory/no swap. Mount `/tmp` as a 5376-MiB tmpfs, home as
128 MiB and shared memory as 256 MiB. The CL-130 probe also requires a separate
32-MiB `/capacity-proof` tmpfs, writable by UID/GID 1000, to test ENOSPC safely.
Pass `--maximum-upload` for the 500-MiB disk-selected synthetic fixture. Do not
mount configuration, owner media or cloud credentials. CL-063's earlier 930-MiB
sample and its historical allocation rationale are not current capacity proof.

Still unchecked before release:

| Check | Why local fake checks cannot finish it |
| --- | --- |
| Real frontend identity, HTTPS/origin forwarding and Secure cookies | Requires the actual hosted frontend/backend and identity configuration. |
| Turnstile and genuine provider responses | Needs real keys and a separately approved live test. |
| Single-instance routing and always-allocated CPU | Actual hosting settings and behavior have not been changed or exercised. |
| Maximum memory/scratch/source/batch capacity | CL-130 tests the 500-MiB source-byte ceiling with a short synthetic clip. Full-duration 4K/manual-cut/history combinations remain untested; Docker has only 7.56 GiB physical RAM despite the 8-GiB cgroup cap. |
| Owner media/quality acceptance | Deliberate owner-only manual paid review remains separate from synthetic processing. |

Do not deploy or infer approval for credit-consuming tests from this local proof.

## Current security checkpoint — 2026-10-26

CL-090 (2026-10-26): review the [current security audit](STRIDE_SECURITY_AUDIT_2026-10-26.md)
before public release. All three image stages now pin the verified official
Node 22.23.4 Bookworm security image; application Zod is 4.6.6 and Next/eslint
are 16.4.1. This does not close SEC90-01's MP4 parser vendor risk or replace actual
hosted identity, single-instance routing, resource/CPU, Turnstile, owner rights
and paid/visual acceptance. No G Cloud changes, deployment or provider test is
authorized by local verification. Follow CL-090 for current evidence and limits.
