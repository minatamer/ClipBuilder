# CL-006 — Google and Node renderer migration foundation

## Current cloud-render packet — approved local execution, 2026-10-02

Status: **Done — local foundation, Linux image and private 2:45 cloud upload/proxy/render/audio/cancellation/deletion proof verified. Later AI/product/release gates remain separate.**

Authority: [Google/Cloud Run migration plan](../architecture/GEMINI_REMOTION_MIGRATION.md); [file inventory](../architecture/MIGRATION_FILE_INVENTORY.md); [later setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md).

Commit preparation: [file-level 10-commit plan](../operations/CL_006_COMMIT_PLAN.md).

Reconcile Google config/contracts and isolated apps/renderer/shared composition boundaries; retire browser web-renderer/model-only paths after reference audit. Prove standard Remotion Node/Docker synthetic render/proxy/cancel/scratch; no alpha cloudrun package or phone encoding requirement.

Dependencies follow the numbered migration sequence. After documentation approval, implement one dependency-ready packet at a time and run focused checks plus the required settled five root gates. Fake/live AI and local/cloud compute are independent; cloud render can incur cost with fake AI. Ordinary tests remain synthetic, credential-free, fake/off and zero-network through injected cloud/provider ports. Owner approved the build/private resources/ADC checkpoints, the rights-confirmed 2:45 private test and necessary rebuild/retest attempts until it passed. The current cloud media foundation is complete; live AI, public sample/release and Git actions retain their separate gates. Usage polling and new independent review remain stopped.

- [x] Owner explicitly approved documentation and local corrections on 2026-10-02.
- [x] Implement and verify the locally possible CL-006 foundation after the CL-005 prerequisite.
- [x] Record exact checks, synthetic output/clock/cancellation evidence and remaining gates below.
- [x] Owner approved and submitted one bounded build-only cloud checkpoint on 2026-10-02.
- [x] First Cloud Build compiled Linux modules/fixed bundle and staged tools; the final runtime import check exposed a packaging defect.
- [x] Correct portable workspace packaging and verify an isolated local production export.
- [x] Owner separately approved one bounded retry using the existing build resources.
- [x] Corrected Linux image runtime checks and immutable image digest.
- [x] Owner approved private resources, a USD 1 allowance and at most two synthetic media operations; confirmed applicable Remotion SSR license coverage.
- [x] Private service/runtime bucket-metadata startup, corrected ADC/ID token, negative authentication/purpose checks and scheduled empty expiry invocation.
- [x] Complete cloud media upload/proxy/render, output profile/audio timing, partial-upload cancellation/replay, Linux scratch/native process cleanup and independent expiry/deletion proof.

CL-006's completed foundation check used a small source: authenticated upload /
proxy preparation, one selected-range vertical render with validated output and
audio timing, and cancellation/expiry deletion with bounded scratch cleanup.
Fake plans exercise real processing without a Gemini key. The proposed 2:45
podcast was subsequently approved for this private test with explicit owner
rights confirmation. Gemini remains disabled; no public sample or Git media
approval is implied.

The 20-minute/500-MiB/60-second maximum-envelope stress proof remains required
before public release claims, but is not a CL-006 foundation-completion gate.
Earlier unchecked maximum-envelope observations do not expand this packet's
scope. Live Gemini grounding/speaking quality belongs to later AI integration.

## Completed private cloud foundation — 2026-10-02

**CL-006 is complete for the current migration foundation packet.** The owner
authorized the rights-confirmed 2:45 source, its derived private test clip, and
necessary image rebuilds/retests until this functional checkpoint passed.
Gemini stayed disabled. No public sample, public release or Git action was
authorized. The earlier failed attempt and every submitted build are retained
below as evidence; they are not silently replaced by a fresh operation counter.

The Linux correction uses lstat scratch accounting, avoids following links,
counts special-entry bytes, tolerates only disappearing-entry ENOENT races and
keeps permission errors fatal. The new build-only smoke generates PNG/PCM input
with Node and the existing packaged tools: Linux's pinned compositor supports
PNG/image2/PCM, but not BMP or rawvideo input. The package tarball's SHA-512 was
matched to the lockfile before reading its embedded compiled features. No new
dependency or production decoder was added.

Closeout code: `apps/renderer/src/media/scratch-usage.ts` and its regression tests,
`media-operations.ts`, `scripts/verify-linux-media.mjs`, the allowlisted
`scripts/build-context.ts` and the renderer Dockerfile. Ticket/index, renderer
guide and the owning setup/cost/rights/software/migration records reflect the
completed checkpoint and its remaining release gates.

The allowlisted image context contained 51 files / 443,305 bytes, with no env,
private media, tests or frontend/backend input. As the unprivileged Linux user,
the image gate passed a 10-second portrait synthetic render, scratch scanning
with a dangling profile link, an aborted native render, zero surviving owned
processes and scratch below 2 GiB. Synthetic input/output/profile files were
removed. The final runtime additionally passed production imports, fixed bundle,
binary hashes and tool versions; only aggregate Linux proof is copied into it.
Cloud Build succeeded in **156.928 seconds**. Build and Artifact Registry
digests matched, and the ready private service uses:

`sha256:2919bae3bdeffc35d6e6f05aeb23becb18cae675ce1c13b39e7a178b765615e8`

The existing europe-west1 service retained 4 CPU/8 GiB, service/revision
min-zero/max-one, request concurrency two, a single media slot, 900-second
request / 840-second work limits, no startup CPU boost, exact-purpose identities
and enforced invoker IAM. This test used two media dispatches on the new image;
the failed old-image attempt used two, for **four cloud media operations total**.
The partial-upload cancellation test needed no media dispatch. AI calls: **zero**.

| Functional proof | Measured result |
| --- | --- |
| Original and upload | 165,001 ms; 6,394,594 bytes; 640×360; authenticated admission/resumable upload and exact localhost CORS passed |
| Proxy | HTTP 200; 5158 ms; 2786606 bytes; downloaded checksum matched |
| Selected-range output | Source 10–20 seconds; HTTP 200; 25855 ms; 10005 ms MP4; 2178260 bytes; 1080×1920 / 30 fps / H.264 / AAC; checksum matched |
| Audio timing | Output offset 0 ms, correlation 0.99987; proxy offset 0 ms, correlation 0.99844; bounded ±100-ms alignment check passed |
| Encoded fixed layout | A decoded frame contained caption/card pixels in their separate fixed layout regions; pixels were inspected in memory and not retained |
| Completion deletion | Only the validated output generation remained; original and proxy generations were deleted |
| Cancellation/replay | Partial resumable chunk returned 308; canceled capability returned 499; zero canceled-session media; repeated cancel remained successful |
| Independent expiry | Generation-fenced test timestamps were advanced to expiry; the existing separately authenticated scheduler swept 3 owned sessions; exact source/output generations and every intent returned 404; zero owned media remained |
| Local cleanup | Original owner source preserved; downloaded proxy/output and all owned temporary build contexts removed; helper processes exited |

The partial-upload test initially treated GCS's resume-incomplete response as a
forbidden redirect. Its private helper was changed to inspect the response
manually without following a redirect. The already-admitted upload was canceled
and verified clean before the check was retried; its terminal journal was also
included in independent expiry. No extra render or proxy dispatch was used.

Expiry was accelerated for these 3 owned test journals. Production TTLs,
bucket lifecycle and schedule were not changed; this is not a two-hour
wall-clock retention test. Cloud completion returns only after its owned scratch
cleanup; the Linux image's cancellation gate separately proves process cleanup.
Fixed synthetic caption/card evidence is not transcript or speaker-quality proof.

All five settled root checks passed: format:check, lint, typecheck, test:unit
(**383 tests**, including 21 renderer tests) and build. The three new scratch
regressions, PNG fixture-only generation/inspection, script syntax/lint and
diff checks also passed. Tests remain synthetic, fake/off and zero-network.
The final documentation pass parsed 11 Markdown documents and verified 48 local
links. Final diff checks passed; the staged index remained empty.

Five builds were submitted overall: initial packaging failure (112 s), portable
packaging success (104.45 s), rawvideo-fixture failure (83.737 s), BMP-fixture
failure (88.978 s), and this PNG/render-verified success (156.928 s).
The last build retained a 1,111-second execution timeout on E2_HIGHCPU_8.
No billed charge was queried or verified. The USD 1 media test allowance,
USD 10 project alert and owner-intended/unconfirmed USD 5 Cloud Run alert are
recorded in the cost model. Budget alerts are advisory. The private service,
storage/registry/build sources, secret and enabled expiry schedule are retained;
ancillary charges can continue until separately authorized resource teardown.

**Next dependency-ready packet: CL-007.** Its Gemini integration, browser/control
flow, genuine caption/grounding/speaker quality and live-call approval remain
separate work. The 20-minute/500-MiB/60-second maximum-envelope stress test remains
a later release gate, not this foundation's completion criterion. Public sample
rights, provider data terms, font/codec/telemetry notices, public paid controls,
phone playback/accessibility and complete public deployment remain unchecked.
No usage polling, independent review, app-stack launch, staging or commit ran.

## Owner-authorized sequential Git checkpoint — 2026-10-02

After the functional checkpoint, the owner explicitly authorized the file-level
plan's ten sequential commits and required the `CL-006:` prefix and a clean
working tree. The owner then requested direct whole-file staging/commits, without
intermediate snapshot reconstruction. Shared files were committed at their first
listed group; unchanged later entries added no diff. The execution record is in
the linked commit plan. The four planned owning-guide status corrections are
included in the final documentation commit. Existing 383-test/five-gate and cloud
proof remain the verification for the settled implementation; committing adds no
provider call, cloud build/deploy or new live evidence. No push was requested.

## Approved local execution checkpoint — 2026-10-02 (pre-cloud evidence)

The owner explicitly approved documentation and all necessary local code/tooling
corrections, stopped independent reviews/usage polling, and switched this chat
from loop-execute to normal execute. No new review agent or usage check ran.
The related CL-005 cleanup prerequisite was implemented first, then CL-006.
No later feature packet, public deployment or Git action was taken.

Delivered surfaces:

- `apps/renderer/src/{config,app,server}.ts`, `auth/caller-verifier.ts`: explicit
  private service composition, exact audience/control/expiry purpose checks,
  safe bounded routes, one media slot, 840-second work/180-second sweep deadlines.
- `apps/renderer/src/expiry/*`: private GCS generation/CAS fences, encrypted
  unfinished-upload journal, independent orphan scan, verified deletion/retry,
  intake closure after unresolved cleanup. SDK/REST effects remain cloud-unproved.
- `apps/renderer/src/media/*`, `src/composition/*`: bounded inspection/proxy,
  physical selected cut, isolated fixed Node SSR worker, output validation,
  monitored 2-GiB scratch and tree-aware cancellation/cleanup.
- `packages/composition/*`, `packages/contracts/src/{cloud-media,edit-plan}.*`:
  browser-safe fixed layout, strict source/revision/generation/hash-bound schemas
  and executable dependency direction. Source/audio foundation work is retained.
- `apps/backend/src/media/renderer.cloudrun.*`, server config/example and tests:
  private typed invocation via ADC with both identity headers, bounded validated
  replies and independent fake-AI/cloud-compute gates. This port is not mounted
  to the public product journey yet.
- Renderer Dockerfile, Cloud Build config, tool/bundle/context scripts and owning
  guides: allowlisted source upload, baked Linux x64 tools, production packaging.
  Browser web-renderer/media dependencies and their old exporter/spike directories
  were removed; Remotion/player remain for the fixed preview path.
- Root manager/lock/test setup/lint/boundary fixtures/AGENTS extension and current
  owning docs were reconciled. Unrelated owner edits and historical evidence remain.

Exact settled root commands passed: `corepack pnpm format:check`,
`corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`,
`corepack pnpm build`. Units total **380**: root 20, contracts 44, composition 2,
backend 87, frontend 209, renderer 18. Import-time guards keep ordinary tests
synthetic/fake/paid/cloud-off and fail unexpected external network. Lifecycle/API/
job tests assert exact fake dispatch/upload/download counts, purpose rejection,
late publish/replay refusal, cleanup retry/restart, cancellation and scratch removal.
Locked install and production package assembly preserve supply-chain policy.
`git diff --check` passes; nothing staged or committed.

Opt-in local synthetic command: renderer `bundle`, `build`, `prepare:browser`,
then `test:media` with the approved full FFmpeg only for fixture/proof generation.
Production processing used matching Remotion FFmpeg/FFprobe 4.0.532 and prepared
Chrome Headless Shell 149.0.7790.0. A generated 15-second 320×180 RGB/tone MP4
with delayed audio produced a validated **1080×1920/30fps H.264/AAC MP4,
10,005 ms, 1,041,838 bytes**; proxy 174,907 bytes. Audio onset was **1,180 ms**
in source and proxy, **180 ms** after the selected 1,000-ms cut. Wall time
**21 seconds** includes fixture generation, proxy, final render, PCM checks,
image extraction and a canceled second render. These are synthetic Windows
measurements, not live whole-flow speed or a cloud/quality guarantee.

The actual encoded frame was inspected: bounded speaker crop, fixed caption
and context card appeared. Cancellation of the actual worker/Chromium tree
passed; transient Windows profile locks required bounded removal retries.
All synthetic source/output/PCM/scratch and owned processes were verified absent;
the ignored synthetic proof PNG was removed after inspection. No app stack was
started. Existing diagnostic 4186/4187 cleanup remains prior evidence.

Deviations: @google/genai is **2.25.0**, because the interrupted 2.26.0 pin failed
the unchanged minimum-release-age policy. Full-source 20-minute/500-MiB, Linux
container/memory/CPU and deployed storage/auth/expiry tests remain unchecked;
Docker is unavailable and gcloud is not on PATH here. The first external test
is an authorized Cloud Build, followed by bounded private synthetic integration.
This is the planned early infrastructure checkpoint, not public app deployment.

Still unchecked: project ID/region/billing/IAM and exact build/test budget;
Remotion SSR/license/redistribution/telemetry and Linux binary/font notices;
real Google key/data transfer/paid terms/sample rights and live speaker accuracy;
browser upload/proxy/preview/download integration, phone playback/accessibility,
full-bound resource proof and measured cloud cleanup. No credentials, private
media, provider payloads, signed capability values or real content entered Git
or evidence. No Google inference, credential use, cloud resource or paid call ran.

Next: follow the concrete [gcloud/Cloud Build setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md)
after separate bounded external authorization; repair any Linux/image issue
before deploying/admitting media, then resume CL-006. Later feature tickets
remain dependency-gated.

## Confirmed pre-cloud corrections — 2026-10-02

The three reported findings were checked against current code and primary
Google permissions, then corrected within the approved local scope. No new
independent review or usage polling was started.

1. Bucket metadata GET at startup/sweep needs storage.buckets.get, absent from
   roles/storage.objectUser. The setup guide now creates a project custom role
   containing only storage.buckets.get and binds it on the dedicated bucket to
   the renderer runtime, alongside Object User. Both CLI and dashboard paths are
   corrected. No admin permission or bucket-IAM read is needed; actual credentialed
   startup/IAM proof remains unchecked.
2. Failed local scratch removal retains the exact owned directory obligation.
   Upload admission and processing return cleanup_pending until independent
   expiry or shutdown retries succeed. Cleanup failure also fences/deletes remote
   artifacts. Injected persistent filesystem failure tests prove the retained
   directory, no second dispatch/allocation, safe 503, unresolved expiry, later
   successful deletion and reopened intake. The paths/errors never enter replies.
3. Renderer inspection now uses the canonical contracts' video/audio codec
   schemas, including Vorbis. The installed Remotion 4.0.532 decoder reports
   Vorbis support, and a generated VP9/Vorbis WebM passed real inspection and
   proxy transcode with that bundled decoder. Source/proxy audio onsets were
   both 1,180 ms. Full synthetic render/cancellation proof reran successfully
   in 22 seconds including this added fixture; source/proxy/output/PCM and owned
   scratch/processes were cleaned. Linux decoder/image proof remains unchecked.

The current settled gate is 380 units and all five root commands. The earlier
378/16-renderer-test report was the initial foundation snapshot. These fixes
address its confirmed defects without treating any cloud/live gate as passed.

## Authorized Linux image checkpoint — 2026-10-02

The owner completed CLI login and budget setup, then explicitly approved the
build-only plan: europe-west1, one private Docker image repository, one private
source staging bucket, one dedicated build identity and one E2_HIGHCPU_8 build
with a 1,200-second timeout. The project/number/billing account and resource
identifiers are held only in private runtime configuration, outside Git.

Preflight verified active billing and a project-only USD 10 monthly all-services
alert with actual thresholds 50%, 90%, 100%. The CLI did not show a separate
ClipBuilder Cloud Run USD 5 alert; it was not created or changed by this run.
Budget alerts do not enforce a dollar cap. The approved compute estimate is
about USD 0.31 for twenty build minutes, plus ancillary storage/log/network.

Enabled only missing build APIs (Cloud Build, IAM, Artifact Registry). Verified
the dedicated bucket's uniform access, enforced public access prevention,
soft-delete duration zero, versioning disabled, no retention policy and age-one
deletion backstop. Build identity has repository Writer, staging Object Viewer
and project Log Writer; the CLI submitter has actAs on only this named identity.
No media bucket, renderer runtime identity, cleanup secret/schedule or service
deployment was created.

The allowlisted context has 49 files / 433,800 bytes and zero env, media, tests,
frontend/backend, private or node_modules entries. The Dockerfile additionally
checks Linux x64 production imports, fixed bundle, recorded SHA-256 binary hashes
and executable versions as its unprivileged runtime user. The check is part of
this one build; it does not run AI, render media, listen or use application ADC.
Local verification JavaScript syntax and diff checks passed. The Windows sandbox
blocked the pinned tsx user-identity lookup; explicit permitted escalation ran
the same pinned context tool successfully, without another install.

The first build ended FAILURE after 112 seconds of execution. Linux compilation,
fixed bundle generation and tool/hash staging succeeded. Its final unprivileged
runtime import check failed with ERR_MODULE_NOT_FOUND for @clipbuilder/contracts.
At that checkpoint, Artifact Registry contained zero published images; no service was deployed.
A local reproduction confirmed legacy deployment's contracts/composition links
pointed back to the original workspace, which is absent from the final image.
The earlier local import-only proof did not establish portability.

Corrected pnpm-workspace.yaml with injectWorkspacePackages and synchronization
after build, updated only workspace lock metadata, and switched the Dockerfile
to the pinned manager's normal production deploy. Canonical comparison proved
all 811 registry package/version/integrity records unchanged. Frozen offline
installation and offline export passed with zero package downloads; supply-chain
and script settings remain intact. The isolated export verified 417 dependency
links contained inside the package and four production imports, without starting
a listener or contacting a provider. Normal development dependency state was
restored after export.

All five root gates passed after the correction: format:check, lint, typecheck,
test:unit (380 units) and build. The initial format check required normalization
of generated YAML; the initial lint encountered the agent's generated proof
bundle in private/, resolved by moving that temporary proof outside the repo
before the passing source check. No source rule was weakened.

Owned local context and packaging proofs were removed with checked absolute
targets and junction unlinking. Private runtime state preserves resource/build
identities and the submission guard. The source archive remains in its private
build-only bucket under the verified age-one deletion backstop; resource
teardown has not been authorized. Repository/build identity/bucket are retained
for the next checkpoint. At that failed-build checkpoint, no second cloud build,
app deployment, media processing, AI call, local app startup, staging or commit
had occurred. The separately authorized retry is recorded below.

### Separately authorized corrected image retry — 2026-10-02

The owner explicitly approved exactly one additional 1,200-second Cloud Build
using the existing resources. The corrected allowlisted context contained
49 files / 433,975 bytes with zero prohibited files. No new API, resource or IAM
change was needed. The same europe-west1 E2_HIGHCPU_8 configuration and dedicated
build identity were used, for two submitted builds total.

The retry ended **SUCCESS after 104.45 seconds of execution**. The final image's
unprivileged Node check proved Linux x64, four production imports
(`./dist/app.js`, contracts, composition and Remotion renderer), the fixed bundle,
matching recorded SHA-256 hashes for Chromium/FFmpeg/FFprobe and executable
versions, including Chrome Headless Shell 149.0.7790.0. The exact runtime success
marker was observed independently of the Dockerfile command text. One image was
published, and Artifact Registry's digest matched the successful build result:

`sha256:16dc60f02092334a1c73b3201c74e2a0a8987cd2efeae83dbc35a2cce76284c3`.

The fully qualified immutable image reference and both build receipts remain in
ignored private runtime state. The corrected local context was removed with a
checked absolute target and verified absent. Both build-only source archives
retain the verified age-one lifecycle backstop; build resources are retained.
No third build, Cloud Run deployment, local ADC setup, media processing/transfer,
AI call, local app startup or Git mutation occurred. No review or usage poll ran.

The existing settled five root gates and 380 fake units apply to this exact code
correction; the retry added cloud image evidence, without a further code change.
Documentation parsing/local-link checks and `git diff --check` are verified after
recording the result. The image check does not establish Linux rendering,
full-bound memory/scratch/cancellation, deployed expiry or browser integration.

The private checkpoint was subsequently authorized; setup evidence follows.
Cloud media processing/deletion, real rights/key/live AI, visual/phone/accessibility
and release telemetry/font/codec notices retain their later gates.

## Private renderer setup and deferred media validation — 2026-10-02

Owner approved one private renderer, temporary media bucket, runtime/local-caller/
expiry identities, cleanup secret and scheduler, using the existing immutable
image. Allowance: USD 1 and at most two synthetic media operations, AI disabled;
retained storage/schedule charges continue until resource cleanup. Owner confirmed
applicable free or paid Remotion Node/SSR license coverage. This attestation does
not establish complete redistribution notices or telemetry/release acceptance.

Enabled only missing Run, Secret Manager and Scheduler APIs; IAM Credentials
was already enabled. Added Token Creator on only the named caller and actAs on
the named runtime/expiry identities to the human. Caller/expiry have Invoker on
the private service. Runtime has Object User plus a single-permission
storage.buckets.get custom role on the dedicated bucket, and Secret Accessor
on its cleanup secret. No JSON key or AI key was created or installed.

The new europe-west1 bucket has uniform access, enforced public access prevention,
soft delete zero, versioning false, no retention policy/default hold and exact
http://localhost:3000 CORS. Age-one lifecycle deletes only media/, preserving
encrypted intents/ for verified cleanup. The 32-byte cleanup key was generated
in memory, sent through stdin to regional Secret Manager, cleared locally and
mounted as a file. Its value was never printed or written into the repo/env.

A disabled bootstrap revision exposed the assigned URL through the server's
run.googleapis.com/urls annotation; status.url was absent on that failed revision.
The enabled revision reached Ready=True. Configuration verified: immutable image,
4 CPU/8 GiB, service/revision min-zero/max-one, concurrency two, timeout 900 seconds,
request-based CPU throttling, CPU startup boost disabled and application dispatch
cap two. These settings do not prove measured media memory/time or global spend.

After an initial ADC command targeted a human email, the owner repeated login
with the created caller account and scoped grant. The installed SDK loaded that
impersonated caller and verified its Google-signed ID token/email/exact audience.
Probes passed: unauthenticated health 403, authenticated health 200, control caller
denied expiry 403, malformed upload descriptor 400. Startup read disposable bucket
metadata successfully through the attached runtime identity.

The OIDC expiry schedule is enabled every 15 minutes, with a 180-second deadline,
one retry and 900-second min/max backoff. Its already-triggered empty invocation
returned 200. An earlier 403 was the intentional control-caller purpose rejection.
This proves scheduled authentication/invocation, not expired-artifact deletion.
Setup corrections grouped rejected lifecycle/CORS CLI path arguments and retried
the verified custom-role binding after IAM propagation. No new image build ran.

Owner then deferred tests: **zero media uploads/prepare/render operations and
zero AI calls**. No cloud-test helper remains running. Resources and the enabled
cleanup schedule are retained. IDs, receipts and configuration stay in ignored
private runtime state. The browser/control product still uses fixtures; this
private service is not yet mounted into that journey. Nothing staged or committed.

Resume bounded cloud processing/output, generation fencing, cancellation, scratch/
resource and actual expiry/deletion validation. The proposed 2:45 podcast is a
later real-source case after rights/cloud-transfer approval; the current allowance
is synthetic only. It does not establish the 20-minute/500-MiB/60-second envelope.
Fake plans test real cloud processing without an AI key. Live Gemini additionally
requires an owner-managed key, paid/transfer/live gates and separate call approval.
Existing five root gates/380 fake units cover unchanged code; only configuration
and authentication evidence was added in this checkpoint.

## Resumed real-source test and prepared Linux correction — 2026-10-02

Historical attempt snapshot; superseded by the completed private cloud proof above.

The owner resumed CL-006, explicitly approved the 2:45 source for the private
cloud test, and confirmed rights to use it and create a derived clip. AI remained
disabled, with a fixed fake caption/focus/template plan. This approval does not
cover Gemini transfer, a public sample, public deployment or Git media.

Authenticated resumable upload and exact localhost CORS passed for a 165,001-ms,
6,394,594-byte, 640×360 source. One proxy preparation returned 200 in 4.851758
seconds; its 2,786,312-byte proxy checksum was verified after download. A local
download-helper path quoting error was corrected; the persisted prepared result
was recovered without another dispatch. The subsequent render returned canceled
409 after 5.533402 seconds. The terminal session had no pending cleanup and zero
remaining source/proxy generations. No validated final output exists from this
attempt. Exactly two media operations and zero AI calls were submitted.

The scratch scan used stat/file-only enumeration, rejecting links and sockets
and cancelling on disappearing cache entries. Remotion places its Chromium
profile under the operation's TMPDIR. Linux browser profiles can contain
[links and sockets](https://chromium.googlesource.com/chromium/src.git/+/master/chrome/browser/process_singleton_posix.cc).
The cancellation is consistent with that scanner defect; no detailed private
worker error was exposed. The correction uses lstat, counts entry bytes without
following links, tolerates only ENOENT races and keeps other errors fatal. Three
regressions cover nested accounting, special entries, disappearing files and
permission failure. The settled five root gates passed with **383 units**, of
which 21 are renderer tests. Boundaries, fake/off network isolation and the
2-GiB scratch ceiling are preserved.

Owner approved one rebuilt image. Its new unprivileged Linux synthetic check
failed during fixture generation, before publication, after 83.737 seconds:
Remotion's stripped FFmpeg lacks the rawvideo demuxer. The generator now uses a
Node-created BMP plus PCM input that passed Windows fixture checks, but the
subsequent Linux build failed because its stripped decoder lacks BMP. The later
PNG fixture and actual Linux render proof are recorded in the completion above.
Local fixture generation/inspection, script syntax, lint/format and diff checks
passed. The next allowlisted context has 51 files / 442,648 bytes and no env,
media, tests, frontend/backend or private inputs. No new dependency was installed.
The planned image gate includes a synthetic render, scratch accounting with an
owned dangling profile link, native cancellation and zero surviving owned
processes. The currently deployed image was not changed by the failed rebuild.

The failed session's terminal intent was generation-fenced to an already-expired
test timestamp. Production TTL settings were unchanged. The independently
authenticated scheduler returned 200 and deleted it; metadata/list checks proved
zero owned media and no remaining intent. This is accelerated expiry proof,
not a two-hour wall-clock retention test.

At this historical checkpoint three builds had been submitted and further
build/redeploy/retest approval was pending. The owner subsequently approved a
fourth build, then all necessary build retries until the private test passed.
The completion record above owns the final five-build/four-media-operation counts.
The maximum-envelope test and live Gemini quality remain later release/integration
evidence. No usage polling, independent review, app-stack launch or Git mutation
ran.

<details>
<summary>Earlier packet and evidence, retained as history where superseded</summary>


Status: In progress; audio/MFCC and LR-ASD native/WASM score parity proved; full browser chain/quality pending<br>
Milestone: M2 - browser media feasibility<br>
Last synchronized: 2026-10-02<br>
Depends on: CL-003 and CL-005 feasibility/foundation handoff<br>
Suggested commit: `CL-006: validate browser audio and speaker feasibility`<br>
Parent: [source of truth section 0.9](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#09-browser-owned-media-architecture-revision-2026-10-01)<br>
Technical contract: [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md)<br>
Index: [README.md](README.md)

**Execution authority:** this current packet and the linked browser contract
supersede the server-media mechanics retained below as history. No GCS,
generation/capability/lease, native media job or cloud-render acceptance item
survives by being left unchecked in that history. Preserve unchanged product,
grounding/quality, rights, secret handling, fake/off test and dependency rules.
No Git, provider, paid, install or cloud action is authorized by this document.

## Objective and boundaries

Productionize incremental browser audio extraction and prove a concrete
browser-executable audiovisual active-speaker pipeline. No backend media job,
cloud bucket, native ffprobe/FFmpeg request pipeline or Python subprocess.
CL-005 must have proved basic and full-bound local media/storage/export
feasibility; this packet proves production audio and speaker quality, not AI
transcription or full assembly.

Original video stays local. Keep the exact public 15s-20min/500-MiB bounds,
selected 10-60s range, fake/off isolation and rights/privacy/license gates.
A face detector or center crop is not an active-speaker implementation.

## Execution preflight (2026-10-02)

The owner invoked `loop-execute` for ticket 6. The initial worktree and index
were clean at `129d8a7`; no application change, dependency installation, model
or dataset download, benchmark, provider call or Git mutation was performed.
This initial preflight was a blocked handoff, not an execute/validate completion.
The owner's subsequent clarification below supersedes its dependency-blocked
interpretation; it does not supply model or external acceptance evidence.

### Owner clarification and resumed scope (2026-10-02)

The owner stated in the side conversation that CL-005 validation passed
completely on 2026-10-01 and requested documentation reconciliation and continued
CL-006 execution. The [CL-005 clarification](CL-005-implement-secure-upload-and-storage.md#owner-handoff-clarification-2026-10-02)
records that local handoff alongside the existing R4/five-gate/full-bound proof.
Production audio work may proceed. The initial dependency interpretation below
is historical and is not a current blocker; no remaining observation is
fabricated, and model/reference/download/install/privacy/release gates remain.

### Dependency result

CL-003's canonical session/contracts and CL-005's local source worker,
OPFS/IndexedDB journal, exclusive workspace lease, cleanup and protected
admission exist in code. CL-005's implementation commit is `8d51a23`; its
packet records independent R4 revalidation with no actionable findings.
Those foundations do not establish the remaining feasibility acceptance.

The [CL-005 full-bound record](CL-005-implement-secure-upload-and-storage.md#phase-1-execution-evidence-2026-10-01)
measured a 1,200-second / 514,629,785-byte synthetic source, complete audio
extraction and exact 60-second portrait export on the desktop Chromium runtime.
It expressly gives a conditional media-route go and withholds the whole
feasibility go. The [current phase-1 checklist](CL-005-implement-secure-upload-and-storage.md#phase-1-feasibility-before-committing-the-implementation-choice)
still leaves the full-bound acceptance unchecked: background suspension and
resource-pressure observations, agreed measurable thresholds, and outstanding
storage denial/eviction/private-mode observations are not supplied by the
successful foreground spike. The later owner decision removes hardware
certification/cross-engine requirements; it does not record these observations
as passed. This packet requires the basic/full-bound feasibility handoff before
production audio implementation under the initial preflight interpretation.
That interpretation was superseded by the owner clarification above.
At that initial preflight, no CL-005 requirement was repaired or waived.
The resumed pass subsequently repaired the synthetic harness callback below.

### Pinned model source inspection

Read-only upstream inspection retained revision
`ed38c232de5efe0261dbd68627c0ade7cdfe14eb`; no newer model was substituted.

- [Model.py](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/model/Model.py)
  returns audiovisual/visual embeddings, not final speaking scores. Visual
  normalization uses `(pixel / 255 - 0.4161) / 0.1688`.
- [loss.py](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/loss.py)
  owns the learned `lossAV.FC` 128-to-2 classifier. Its unlabelled inference
  returns the class-1 logit; it does not apply softmax. An export of only
  `ASD_Model` would omit the score head. Preserve this path for demo-reference
  parity and explicitly distinguish the labelled evaluation's softmax scores.
- [Classifier.py](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/model/Classifier.py)
  applies two sequential unidirectional GRUs, GELU and time reversal.
  [Encoder.py](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/model/Encoder.py)
  adds 2D/3D convolution, batch normalization, ReLU, pooling, mean reduction
  and reshape/transpose. Source inspection establishes the export surface,
  not an ONNX opset, dynamic-shape or ORT kernel pass.
- [Columbia_test.py](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/Columbia_test.py)
  uses 25fps tracks, 16kHz mono/13-MFCC at 25ms/10ms, padded/smoothed crops
  resized to 224x224, grayscale and a central 112x112 crop. It averages scores
  over the distinct 1-6-second windows in a Python set. Do not interpret the
  repeated set literals as extra weighted passes. Golden tests must pin MFCC
  defaults, crop interpolation, normalization and timestamp alignment.
- [ASD.py](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/ASD.py)
  instantiates CUDA modules and permits missing/mismatched checkpoint keys to
  be skipped. A future approved comparison/export must verify every inference
  key and shape, including `lossAV.FC`; a partial load is not parity evidence.
- The root [LICENSE](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/LICENSE)
  is MIT. Separate checkpoint/detector redistribution terms and exact dependency
  versions remain unverified. Detector/requirements metadata fetches were
  unavailable during this pass; that is not proof those notices do not exist.
- A later read-only [README check](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/README.md)
  distinguishes the default AVA-trained weights from the optional TalkSet
  fine-tuned weights. Neither was downloaded or silently chosen as approved.
  Requirements/detector metadata remained unavailable on recheck; exact
  dependency versions and checkpoint/detector distribution terms stay open.

This initial source-only inspection supplied no checkpoint hash, converted size,
runtime version, tensor parity, browser performance or measured quality. The
later approved execution below supersedes its asset/tooling status. Speaker
status remains **unverified**, not a measured no-go. CL-008 cannot proceed without
the required go.

### Assumption ledger and remaining gates

| Question | Chosen answer and evidence | Effect / confirmation needed |
| --- | --- | --- |
| Does CL-005's committed foundation imply its full-bound acceptance passed? | Initially treated as incomplete from the conditional record; superseded by the owner's explicit local handoff above. | Production audio may proceed; unperformed external observations remain disclosed. |
| Can ordinary source inspection proceed without model-download approval? | Yes: this packet requires inspecting the already-pinned model; public source reading obtains no weights/dataset or execution toolchain. | Record findings only; download/install/media/reference execution still need explicit authorization. |
| Should blocked inference be called a browser no-go? | No: no browser model was converted or measured. | Keep the verdict unverified; do not reopen architecture on an invented failed benchmark. |
| Is WebM/Opus already an approved protected-upload profile? | No: mono 16-kHz encoder input, 64 kbps and the shared 16-MiB cap are provisional; actual native decoding used 48 kHz. | Local timing/body size is measured; speech quality, received-body parsing, hosting and transfer/retention approval remain required. |
| Does the PCM comparison prove model-reference parity? | No: it is a local native-browser 16-kHz signed 16-bit mono WAV comparison over synthetic tones. | No approved offline MFCC/crop/model reference or speech-quality verdict is inferred. |
| Can operational failure bounds be implemented before quality thresholds are agreed? | Yes: a 20-second advancing-progress stall limit, five-minute deadline and 120-ms codec-padding tolerance fail closed without changing public product limits. | These are implementation bounds, not owner-approved performance, accuracy or sync guarantees. |
| Should audio be connected to the public workflow here? | No: CL-007 owns protected analysis integration. | A callable workspace method and actual-module harness are provided; the existing prepared-source UI boundary remains. |
| Does a synthetic freeze event prove OS suspension recovery? | No: focused tests prove cancellation/listener/timer behavior, and wall-clock guards reject delayed events. | Actual freeze, eviction/private mode and resource pressure remain unmeasured. |
| Which approved checkpoint is the baseline? | Pinned default AVA, preserving the demo score head and ensemble. | Privately hash verified below; no TalkSet, quantization or detector substitution. Distribution acceptance remains open. |
| Does conditional approval permit the external detector download now? | No verified detector-weight terms were obtained from the linked sources. | Defer that asset only; continue independent MFCC work. No detector or dataset downloaded. |
| Does a blocked native import prove browser inference no-go? | No: Application Control rejects PyTorch before checkpoint loading/export. | Do not change security policy or fabricate key/operator/parity evidence. A permitted conversion runtime is needed. |
| Can MFCC be proved before the detector/model chain? | Yes: independent synthetic library goldens exercise the browser numerical kernel without weights/media. | Callable preprocessing and actual worker proof only; no focus, crop or score claim. |
| Which MFCC defaults and units apply? | Pin python_speech_features 0.6 defaults and signed 16-bit PCM, matching upstream WAV; preserve global pre-emphasis. | Bound 600 hop positions plus overlapping context. No resampler, crop or model approximation is accepted. |
| Does numerical tolerance approve product quality? | No: 0.00002 absolute checks implementation parity against independent Float32 goldens. | Agreed focus/audio/runtime/memory quality thresholds remain required. |
| Does research authorize a new model or hosted-video path? | No: owner requested comparison before choosing; public source inspection and documentation only. | Current browser architecture remains; new assets, transfer, terms, paid calls and resources need applicable approval. |
| Should Light-ASD remain the settled model? | No: preserve it as the approved control; released LR-ASD is the preferred next local candidate and NVIDIA ASD the API finalist. | Source-based shortlist only; no measured winner or model substitution. |
| Can existing keys solve attribution without another provider? | Deepgram + OpenAI frame/transcript or Realtime audio/image approaches are concrete hypotheses. | Modalities/access differ by model; local tracks and held-out validation remain; keys were not inspected or used. |
| Should NVIDIA replace Deepgram now? | No: separate speech products can provide ASR/diarization, but supported hosted profile, word/speaker quality and price are unproved. | Hold source transcription fixed in the first visual comparison. |
| Are preview endpoints or calculated GPU costs production prices? | No: preview access/terms, exact NIM offering and a production quote are distinct; scenario runtime/token assumptions are explicit. | No free-production claim, purchased resource or approved budget. |
| Does five-speaker research lift the four-face bound or approve thresholds? | No: five voices across shots differs from five simultaneous tracks; NVIDIA's five setting is audio streams. | MAX_FACE_TRACKS_PER_SHOT stays 4; numerical/viewing/resource/cost targets are proposals pending agreement. |

The updated explicitly invoked loop skill automatically arranged the dedicated
read-only collaboration reviewer `/root/cl006_review`. Manual review-chat setup
is no longer a blocker. R1 found one Opus gap-allocation defect, independently
confirmed and repaired below. R2 confirmed the code repair and found one harness
capability-documentation omission, now repaired. R3 reported `No actionable
findings` in the local scope; all five subsequent root gates passed. R3 still
found the whole ticket incomplete because model/quality/transport gates remain.

The owner supplied real conversation media and authorized private local testing
and Git-local exclusion. Its location and local-test permission are satisfied.
This supplied neither redistribution rights nor model/download/install/offline-
toolchain approval at that stage; the later specific approval now covers licensed
local asset/toolchain work. No content, filename, source digest, frame, transcript or
audio artifact appears in committed evidence.

With `FAKE_MODE=true` and no API keys, the worker performs real API-free local
decoding/extraction; the existing AI journey remains fixtures. Local speaker AI
would also need no provider key. The AVA weights are now privately present and
tooling approved; Windows policy blocks conversion, and detector terms/browser
inference/quality are missing. Real provider analysis needs API keys, enabled live
flags and its privacy/spend/ticket gates.

Next: obtain a permitted conversion runtime and verified detector terms; complete
crop/tensor/model/browser parity and agree audio/model quality/resource thresholds.
The approved checkpoint hash and exact installed reference versions are recorded
below; download/install/offline-harness permission is no longer missing. Production
speech-quality/profile acceptance, actual received-body validation and speaker
export/ORT WASM parity remain CL-006 work. Provider transfer/retention,
paid enablement, public visual/support/accessibility/license/rights acceptance
and deployed transport/model delivery remain unperformed owner/later-ticket
gates. During the initial preflight no process or artifact was created; the
resumed synthetic-only local benchmark and verified cleanup are recorded below.

## Audio execution evidence (2026-10-02)

The initial resumed pass delivered local audio and synthetic full-bound evidence.
A second resumed pass used the owner-supplied real reference and independent R1
review. CL-005 R4 applies to its recorded snapshot; R1 explicitly included the
new scoped generator repair.

### Implemented behavior and scoped repairs

- The admitted workspace uses its owned source worker for incremental demux,
  actual sample decode, mono downmix/resampling, profile encode and positional
  OPFS scratch writes. Original video is never materialized as a full-duration
  ArrayBuffer or sent off device. Only bounded extracted audio is copied into
  the returned Blob; no audio/media enters the recovery journal.
- Reopen and fully decode the actual encoded artifact before returning it.
  Check public source limits, one video/one audio track, actual duration,
  codec, byte cap, finite/nonzero digital samples, first/last clocks and decoded
  rate/frame bounds. Digital nonzero checks do not detect usable speech.
- Strict UUID/request/result/progress schemas reject extra URL fields and
  inconsistent evidence. Progress uses actual processed timestamps and written
  bytes. Duplicate progress cannot keep a stalled worker alive; phase/clock
  regressions, duplicate results and late events fail closed.
- Abort, freeze/page exit, advancing-progress stall and overall deadline drain
  the worker, then force termination after the one-second cooperative window
  if necessary. Listeners/timers are removed, and progress after rejection is
  fenced. Clear/dispose wait for audio drain before deleting storage or
  releasing the workspace lease. Initialize/next attempt removes stale audio
  scratch after an interrupted worker.
- The native quota test exposed an errored-stream close overriding the safe
  storage failure. Installed Mediabunny's `Output.cancel` releases encoders
  before target close. Preserve the safe primary failure when that close
  rejects, attempt every input/handle release and file deletion, and reject
  after cleanup if cleanup itself failed. Focused regression tests cover both
  close rejection and a throwing input disposer; the native fault was rerun.
- The separate CL-005 prerequisite detour corrected the Web Lock callback and
  numeric-duration validation in the synthetic generator. Its original fresh
  result was a 176-byte, zero-duration file. The repaired generator produced
  the real full-bound source below. No public limit, architecture, dependency
  or historical acceptance box was weakened.

- R1 identified that the Opus path delegated an internal timestamp gap to
  Mediabunny, whose gap-sized allocation precedes the encoded-sample guard.
  Installed source inspection independently confirmed this. Both profiles now
  fill initial offsets and internal gaps with at most 1,024 source frames per
  awaited owned silence sample, with disposal and cancellation between samples.
  Decoded results begin at zero; metadata retains the actual source onset.
  Installed encoder/resampler regressions at 16/48 kHz and unsigned-PCM cancel
  coverage passed without mocking the encoding path.

### Actual browser observations

Runtime: Windows 11 Pro 10.0.26200, Intel Core i7-10810U, 12 logical processors,
16,760,946,688 bytes visible RAM; Codex in-app Chromium UA 154.0.0.0,
`mediabunny@1.61.0`, native WebCodecs and worker sync OPFS. No new package,
model, dataset, WASM fallback or native comparison tool was installed. This
is the measured desktop runtime, not hardware or cross-engine certification.

The corrected generator produced a 1,200-second, 514,629,785-byte synthetic
1280x720/30fps H.264/AAC source in 146,327.38 ms, with 491 writes and a measured
maximum write chunk of 1,048,576 bytes. The source is moving synthetic noise,
timestamps and tones, not conversational speech.

| Actual-module profile, final rerun | Bytes | Pipeline elapsed ms | Presentation duration ms | Decoded last sample ms / rate |
| --- | --- | --- | --- | --- |
| Provisional Opus/WebM | 10,244,799 | 13,185.205 | 1,200,000 | 1,200,017.833 / 48,000 Hz |
| Browser PCM/WAV comparison | 38,400,044 | 8,057.225 | 1,200,000 | 1,200,000.000 / 16,000 Hz |

Both reported source first/last clocks of 0/1,200,000 ms. Scratch absence was
checked through the actual OPFS directory before the harness accepted the
result. Returned Blob size matched the encoded artifact. Opus fits the
provisional local 16-MiB cap; PCM fits its local duration-derived cap, not the
protected-upload profile. No received HTTP body, hosting transport or speech
quality was tested.

Actual decoded tone onsets at expected 1, 600 and 1,199 seconds were
1,004.521/600,004.542/1,199,004.521 ms for Opus and
1,000.250/600,000.250/1,199,000.250 ms for PCM: approximately 4.27-4.29 ms
relative difference. This checks synthetic alignment, not speech quality or
model preprocessing parity. Earlier 20-second quick checks also passed;
their 171,333-byte Opus and 640,386-byte PCM results do not replace this
full-bound evidence.

Actual cancellation deleted scratch and retained the same source. The native
quota injection committed 4,096 bytes before denial; the final rerun reported
safe storage failure, partial deletion and source retention. A subsequent full
Opus extraction succeeded, proving the retained source and handles remained
usable. The harness has no provider adapter and permits only its fixed local
GET assets; transcription/text/image call counts stayed zero. No protected
processing request was made.

Before the portrait regression, the shared origin memory API sampled a maximum
63,063,099 bytes and the foreground 50-ms heartbeat reached an 84.575-ms gap;
no Long Task entry was recorded. These are shared browsing-context samples,
not isolated worker/native/GPU peak memory, and no approved threshold verdict
is inferred. Actual OS freeze/resource pressure, private-mode denial and
eviction remain unperformed. The new code has no product layout change; no
fresh phone/tablet or product responsive acceptance is claimed here.

The existing selected 600-660-second portrait regression completed in
16,991.265 ms. AAC presentation remux took 142.965 ms and produced a
33,144,580-byte, exact 60-second 1080x1920 H.264/AAC artifact. Decoded flash/tone
differences at 1/30/59 seconds were 0.2083 ms. Native playback started and reached
the 60-second end, paused with readyState 4. This is the CL-005 synthetic range
regression, not CL-011's final product export.

Cleanup confirmed the synthetic OPFS folder absent and removed its bounded
measurement record; the agent-created tab was closed. The hidden loopback
benchmark launcher was PID 12552 and server listener PID 4760 on 127.0.0.1:4185.
An initial cleanup check safely matched no processes because PowerShell parsed
JSON timestamps as dates; string-preserved timestamps resolved the mismatch.
With creation times verified, the owned tree (12552/13984/1892/6128/4760) was
stopped and three stabilization checks found no owned survivor or 4185 listener.
No graceful window/control channel was available, so bounded forced process
cleanup was required. Content-free runtime/stdout/stderr records remain outside
Git. No unrelated service was stopped.

### Owner-approved real reference and native gap checks

A private Git-excluded QA page bundled the current production `SourceClient`
and `SourceWorker` with the already-installed esbuild. Its loopback server served
only fixed code assets; local selection supplied a nameless Blob directly to
browser workers. No media/body endpoint, provider, transcription, persistent
crop, public asset or deployment was used. The committed synthetic harness was
not widened. No package or model was downloaded or installed.

The production inspector accepted 165,001 ms / 6,394,594 bytes, MP4/H.264/AAC,
640x360, approximately 29.97003 fps, zero rotation. Both profiles fully decoded
and passed the production client schemas. Source first/last samples were
0 / 165,000.998 ms.

| Real local profile | Bytes | Extraction and scratch-clear elapsed ms | Presentation ms | Decoded last ms / rate |
| --- | --- | --- | --- | --- |
| Provisional Opus/WebM | 1,408,632 | 2,391.375 | 165,000 | 165,017.833 / 48,000 Hz |
| Browser PCM/WAV comparison | 5,280,076 | 1,611.900 | 165,001 | 165,001.000 / 16,000 Hz |

Cancellation after advancing progress returned `canceled`; awaited stop and
scratch clear left the audio folder absent. Both subsequent extractions
succeeded, retained the source size, and left no audio scratch. Final cleanup
confirmed the newly owned workspace folder absent.

Three one-second native-decoded windows at 10 / 82.5005 / 155.001 seconds used
box-average 48-to-16-kHz reduction and normalized correlation over a +/-10-ms
lag search. All best lags were 4.3125 ms; correlations were approximately
0.996964 / 0.998716 / 0.994632, aligned raw SNR 21.932 / 25.757 / 19.667 dB.
This limited numerical diagnostic is not a perceptual intelligibility judgment,
approved resampler/MFCC reference, quality threshold pass or model parity proof.
Three corresponding native video samples decoded and were closed at
9.976633 / 82.482400 / 154.988167 seconds. Decode availability does not establish
face tracks, audiovisual scores, speaker labels or focus correctness.

An additional synthetic native Opus check called the repaired production gap
helper with onsets at 2 and 27 seconds, at both 16/48-kHz input. Both outputs were
23,744 bytes, presented 27,020 ms and decoded 0 through 27,037.833 ms at 48 kHz.
The encoder's largest observed batch was 80,000 frames (320,000-byte float plane),
below the 1-MiB guard; application gap input remained at most 1,024 frames.
The private fixture's initially missing compressed-codec quality option was
corrected to the production 64-kbps setting before these successful observations.
An initial private inspection descriptor used wrong ID shapes and was rejected
before extraction; canonical opaque IDs were used for the accepted run.

The tab was closed. Creation times were verified for launcher/server tree
15436/7644/16704/18308 on 127.0.0.1:4185; no graceful window was available, so
bounded forced cleanup stopped it. Three stabilization checks found no owned
survivor or listener. Content-free runtime/stdout/stderr records remain outside
Git; owner media and private QA code remain locally excluded. No unrelated
service was stopped. No real-media screenshot, content log or Git mutation occurred.

### Verification and remaining acceptance

After the R1 repair, the focused command passed six files / 55 tests:

```text
corepack pnpm --filter @clipbuilder/frontend exec node ../../node_modules/vitest/vitest.mjs run src/features/media/audio.extraction.test.ts src/features/media/audio.samples.test.ts src/features/media/source.client.test.ts src/features/media/browser.workspace.test.ts src/features/media/workspace.lock.test.ts feasibility/browser-media/server.test.mjs
```

Coverage includes the real demuxer's malformed-input rejection before scratch,
digital silence/nonfinite samples, exact positional short writes/caps, safe
errored-output cleanup, strict evidence, result immutability, advancing-progress
stall/deadline, unresponsive abort, freeze listener cleanup and workspace lease
drain. Deterministic tests retain top-level fake/paid-disabled network isolation.
All five required root commands passed after R3's clean local-scope review:

```text
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
```

The final unit gate passed 343 tests in 34 files: root 11, contracts 38, backend 85,
frontend 209. Lint passed without warnings. Formatting, typecheck and the
contracts/backend/Next.js production builds passed. All six edited Markdown
documents parsed successfully with the installed Prettier Markdown parser;
eight tables had consistent cell counts. `git diff --check` passed. The final
scope review found no cross-app import, new Node/browser boundary violation,
duplicated cross-boundary schema, debug/logging/provider path, production unsafe
cast, stale flag or ticket-created resource left active. DOM interface casts
remain confined to explicit test doubles. No dependency or lockfile changed.

R1 reviewed HEAD `129d8a7a09ed09cab427e3dcbb00a53b9a5cb278`,
17 source/test/harness code files in the order listed below; SHA-256 of their
newline-joined `relative-path lowercase-file-sha256` records:
`7fbdbe88728c72921c232aba755fa071816c4191ae6b49919f21b9d2a53604f4`.
Documentation is excluded from that code fingerprint. R1's verdict was
`Does not yet meet ticket`, with one medium gap-allocation finding and no other
actionable finding. The execution agent confirmed and repaired it; the new
17-code-file fingerprint is
`80cf8f15313b7ee86d84e4846ea125bd80a5f297e3eb457c64232a81a6ec828d`.
R2 independently matched that code fingerprint, ran the installed-library sample
regression (one file / nine tests), and resolved R1. It reported no actionable
code finding and one low documentation finding: explicitly explain fake/API-free/
local-model/provider capabilities in the harness guide. That paragraph is now
added; the execution agent checked it against the new AGENTS requirement.
R3 resolved R2 and reported `No actionable findings` on the unchanged code
fingerprint and repaired owning documentation. Its overall verdict remained
`Does not yet meet ticket`, explicitly separating external/model acceptance
from the clean local scope. R3 repeated no tests for the prose-only repair;
R2's nine tests remain applicable. There have been two resumed execution passes
and three independent CL-006 reviews through the same collaboration reviewer.
The five final root checks above ran after R3. Subsequent edits only record
those actual results and review dispositions; no implementation changed.
Whole-ticket acceptance remains incomplete; CL-008 cannot proceed.

The owner-requested independent side-conversation validation S1 subsequently
reported `No actionable findings` in the same 23-file local scope and
`Does not yet meet ticket` overall. It independently traced extraction, bounded
padding/writes, byte reopening/decoding, schemas/progress, cancel/stall/deadline,
workspace fencing/cleanup, the CL-005 callback repair and owning documentation.
Its one focused check was the installed encoder/resampler sample suite: one
file / nine tests passed; scoped whitespace verification passed. Browser and
five-gate observations were reviewed as recorded evidence, not replayed by S1.

S1 reviewed unchanged HEAD `129d8a7a09ed09cab427e3dcbb00a53b9a5cb278` and no
staged files. Its 23-file snapshot, including owning documentation, used
newline-joined sorted `relative-path lowercase-file-sha256` records with SHA-256
`6b257baa001b53a8712192b75481b94059f2b2f6492500a500b78c3b486490de`.
The execution agent independently matched that fingerprint before recording
S1 here. This differs from the 17-code-file fingerprint by scope and ordering;
it is the reviewed snapshot, not a claim that subsequent evidence bookkeeping
leaves document hashes unchanged. There are now four independent reviews:
collaboration R1/R2/R3 and side-conversation S1. No further implementation repair
or repeat of unchanged root gates was required. S1 excluded unrelated AGENTS/
CL-015 edits and ignored media/QA, made no changes or external calls, and supplied
no download/install, model, Git, paid/cloud or whole-ticket approval. The existing
precise model/toolchain approval request was subsequently approved below.

### Owner approval for local model work (2026-10-02)

The owner replied `you have approval, contunue` to the precise request to
download the pinned Light-ASD AVA checkpoint and detector assets and install
local CPU conversion/ONNX tooling after verifying licenses. This authorizes the
affected local asset/toolchain steps and API-free speaker testing on the supplied
reference. Select the pinned upstream default AVA checkpoint as the conservative
baseline; do not substitute TalkSet, quantize, reduce the ensemble or change the
detector without measured parity. Record exact artifacts, notices, hashes and
versions before inference; no dataset download is authorized or needed.

The approval does not supply a browser inference result, quality thresholds,
redistribution/release acceptance, provider credentials/live flags, paid calls,
cloud/deployment or Git permission. Existing audio review/check evidence remains
applicable to its snapshot; any new model implementation needs its own focused
checks and independent review. The subsequent installs, artifact verification,
native policy failure and independent MFCC proof are recorded below.

The active-speaker gate remains **unverified**, with CL-008 blocked. Missing
items: verified detector/distribution terms, redistribution rights, a permitted
conversion runtime, agreed focus/audio/runtime/memory thresholds, actual model
conversion, crop/tensor/model goldens, ORT WASM operators/parity and measured
speaker quality. Checkpoint hash and MFCC kernel goldens are established below.
No synthetic face tracks were substituted for speaker quality.
Speech-quality/profile acceptance and exact protected received-body validation
remain CL-006 work after the profile is agreed; protected workflow integration
is CL-007, and deployed transport/model delivery is CL-015. Provider retention/
transfer, credentials, paid/cloud execution, public support/visual/accessibility/
license/rights acceptance remain separately unchecked. Explicit owner approval,
not elapsed time, authorized the local model/reference steps.

### Approved model tooling and MFCC evidence (2026-10-02)

The pinned source/root MIT notice were privately retained. Default
`weight/pretrain_AVA_CVPR.model` from revision
`ed38c232de5efe0261dbd68627c0ade7cdfe14eb` has exactly 4,175,289 bytes, Git blob
`dbc9703e3a5132a54278c784117076ca612e1e66` and SHA-256
`d44bc3ea7baa8e0946fa3921311714a630ed8b90a1928fab0dbe30d918909317`.
Expected Git object verification passed. The root MIT notice supports this
owner-approved private comparison; public checkpoint/detector redistribution
acceptance remains separate. Weights/source stayed ignored, with no model route
in the committed harness. No dataset was downloaded.

Detector source was inspected without importing its initializer, which would
invoke `gdown` when weights are missing. The linked
[adaptation](https://github.com/cs-giung/face-detection-pytorch) and
[S3FD implementation](https://github.com/yxlijun/S3FD.pytorch) did not supply
verified external detector-weight terms in this pass. No detector or substitute
was downloaded. Conditional license-verification approval still gates that asset.

Approved tooling was installed in an isolated temporary venv outside Git:

| Package | Exact version | Inspected notices / actual result |
| --- | --- | --- |
| Python | 3.12.14 | Existing bundled runtime; isolated venv |
| torch | 2.14.1+cpu | Official CPU wheel; Apache/BSD/MIT and bundled notices; native import blocked |
| numpy | 2.5.3 | BSD and bundled component notices; reference execution passed |
| scipy | 1.18.1 | BSD and bundled runtime notices; reference execution passed |
| python_speech_features | 0.6 | James Lyons, MIT; synthetic reference generation passed |
| onnx | 1.23.1 | Apache-2.0; import passed, no model checked/exported |
| onnxruntime | 1.30.0 | MIT; Python import passed, no model inference performed |
| opencv-python-headless | 5.0.0.93 | Apache-2.0; import passed, no crop parity claim |

Primary package-license metadata was inspected; installed notices are retained
locally, with bundled/public distribution acceptance still unverified. The
conversion-dependency install report retains downloaded hashes/resolved
dependencies. The official CPU index publishes the installed Windows/cp312 Torch
wheel SHA-256 `c52adc3bd526ff7fc5bdcc58fc4a76e6214d09951b646ffe5256ebd7ba60cef1`;
this is registry provenance, not an independent retained-wheel rehash.
Speech-feature source-distribution SHA-256:
`a0aebf746464bc929dc3162cb369d7ff967c398c5120ddf5fb40a65f01b92b11`.
No application manifest or lockfile changed. ONNX Runtime Web 1.30.0 official
registry metadata/MIT notice was inspected; that browser package was not installed.

The CPU export probe failed at import before checkpoint loading/key validation.
Windows Application Control reports WinError 4551 for `torch_global_deps.dll`;
the tool's explicit escalated run failed identically. No security policy,
endpoint protection or DLL location was changed to bypass it. Therefore no
converted model, ONNX size/hash, CPU score parity, ORT WASM load or model inference
measurement exists. This is a conversion-prerequisite blocker, not a measured
speaker no-go or an automatic-approval rejection. A permitted conversion runtime
is needed to unlock export; detector/crop/model/quality gates would still remain.

The independent safe slice added `audio.mfcc.ts` and an offline synthetic
reference generator (both subsequently retired; this is historical evidence).
It pins 16-kHz/13-MFCC, 25-ms/10-ms and all reference defaults: rectangular window,
512 FFT, 26 mel filters, 0.97 pre-emphasis, orthonormal DCT-II, lifter 22 and log
energy. Signed 16-bit units match the upstream WAV path. Continuation supplies
the preceding track sample; end padding follows pre-emphasis. Maximum input is
96,240 samples including overlap; maximum output is 600 frames / 31,200 bytes.
Reusable numeric scratch is 10,456 bytes plus fixed tables. These explicit array
bounds are not a whole-browser/native peak-memory measurement.

The 190,749-byte committed fixture is wholly synthetic. SHA-256:
`023aab1470002c1b9d91f47bbbbe065aaad10097f57b2f24809bd6c52c9cedd6`.
The generator actually ran the installed independent library. Seventeen focused
tests compare every coefficient and exact shape, padded boundaries and global
pre-emphasis, reject empty/oversized/wrong-type input and invalid preceding
samples, and verify input preservation. Focused lint/frontend typecheck passed.
The expanded fixed-route server plus MFCC suite passed 32 tests in two files.
Ordinary tests use committed goldens and top-level fake/off network isolation;
they need no Python or weights and make zero provider calls.

The current production kernel ran in the Windows in-app Chromium 154 worker:

| Case | Samples / frames | Output bytes | Elapsed ms | Maximum absolute coefficient error |
| --- | --- | --- | --- | --- |
| Silence | 1 / 1 | 52 | 1.415 | 1.2932e-12 |
| Noise at frame/hop boundaries | 399-561 / 1-3 | 52-156 | 0.330-0.970 | 0 |
| Impulse and padded tail | 401 / 2 | 104 | 0.460 | 0 |
| Six-second hop window with overlap | 96,240 / 600 | 31,200 | 32.380 | 0 |
| Global pre-emphasis continuation | 4,240 / 25 | 1,300 | 1.570 | 0 |

All 8,281 coefficients passed the numerical absolute tolerance 0.00002. The
observed foreground heartbeat maximum was 65.485 ms at comparison completion;
no Long Task entry was recorded. Background tab/cleanup observations do not
prove OS suspension/resource pressure. This is synthetic MFCC parity only; no
face/crop/score/focus/intelligibility or agreed product-quality pass is inferred.
With fake mode/no keys this executes real API-free arithmetic; the public AI
journey remains fixtures, and real local mode still stops at prepared source.
Local speaker AI requires approved detector/converted model and verified browser
runtime. Real providers require keys/live flags and existing privacy/spend gates.

The server now exposes thirteen fixed GET assets with no media/model/body route.
Cleanup is idempotent for a numerical-only run with no OPFS spike folder; the UI
confirmed folder absence, and reload showed an empty numeric record. The agent
tab closed. Hidden launcher 17000 and owned tree 8864/19796/12556/4764 (listener
127.0.0.1:4185) were matched by creation time and stopped; three stabilization
checks found no survivor/listener. No graceful window was available; bounded
forced cleanup followed. External content-safe stdout/stderr were 42/44 bytes.
No app service or model probe remains active. Private approved checkpoint/tooling
is retained for a later permitted conversion.

R4 independently matched the initial 28-file snapshot
`7748167dc4219d860affaa1096a9d8308bdfcee49f16239654611b0952acfdae`
and 21-code/data fingerprint
`2959e1c110688b1509012912b3b473f537c6cb8670d9feb168c93b45f7c34610`.
It ran the 17-test MFCC suite successfully and found no actionable code issue.
One low documentation finding was confirmed: the software guide retained an
audio-pass statement that no model/tooling was installed. That paragraph now
records private verified AVA, installed tooling, policy-blocked PyTorch and
unverified detector/conversion/browser inference; older research-only wording
is explicitly historical. Provenance wording was also narrowed to inspected
primary metadata/retained notices, dependency-install hashes and the registry-
published Torch hash without claiming a retained-wheel rehash.

R5 resolved R4 and reported `No actionable findings` in the local scope, while
the whole-ticket verdict remained `Does not yet meet ticket`. It independently
matched reviewed 28-file snapshot
`8e53fcf123a50fbde5ab6abe4b07617f1aeadece4d8268cdca8afd0dee82c4a0`
and the unchanged 21-code/data fingerprint above. Scoped whitespace passed;
no unchanged tests were repeated for that prose-only repair. R4/R5 reviewed
browser/install evidence as recorded, without reading private assets/tooling.
There are now five collaboration rounds (R1-R5) plus owner-requested S1.

After clean R5, all five required root commands passed on the new code:
`corepack pnpm format:check`, `corepack pnpm lint`, `corepack pnpm typecheck`,
`corepack pnpm test:unit`, and `corepack pnpm build`. The unit gate passed
362 tests in 35 files: root 11, contracts 38, backend 85, frontend 228 in 23 files.
Lint had no warnings. Contracts/backend and Next.js 16.3.7 production builds
passed. Python reference syntax parsed, seven owning Markdown documents parsed,
and ten tables had consistent cells. Final evidence bookkeeping changes only
documents; the reviewed code/data fingerprint remains the one above. Earlier
343-test/R3/S1 records remain historical audio-snapshot evidence.

### Exact file scope

```text
apps/frontend/src/features/media/audio.extraction.ts
apps/frontend/src/features/media/audio.extraction.test.ts
apps/frontend/src/features/media/audio.profile.ts
apps/frontend/src/features/media/audio.protocol.ts
apps/frontend/src/features/media/audio.samples.ts
apps/frontend/src/features/media/audio.samples.test.ts
apps/frontend/src/features/media/audio.mfcc.ts
apps/frontend/src/features/media/audio.mfcc.test.ts
apps/frontend/src/features/media/audio.mfcc.reference.json
apps/frontend/src/features/media/browser.workspace.ts
apps/frontend/src/features/media/browser.workspace.test.ts
apps/frontend/src/features/media/source.client.ts
apps/frontend/src/features/media/source.client.test.ts
apps/frontend/src/features/media/source.protocol.ts
apps/frontend/src/features/media/source.worker.ts
apps/frontend/feasibility/browser-media/README.md
apps/frontend/feasibility/browser-media/index.html
apps/frontend/feasibility/browser-media/main.mjs
apps/frontend/feasibility/browser-media/server.mjs
apps/frontend/feasibility/browser-media/server.test.mjs
apps/frontend/feasibility/browser-media/worker.mjs
apps/frontend/feasibility/browser-speaker/README.md
apps/frontend/feasibility/browser-speaker/generate-mfcc-reference.py
apps/frontend/README.md
docs/operations/THIRD_PARTY_SOFTWARE.md
docs/research/ACTIVE_SPEAKER_OPTIONS.md
docs/tickets/CL-005-implement-secure-upload-and-storage.md
docs/tickets/CL-006-build-media-job-and-speaker-feasibility.md
docs/tickets/README.md
```

The concurrently modified AGENTS.md and CL-015 packet were preserved outside
this edit scope. The new capability-explanation instructions were followed.
All changes remain unstaged/uncommitted;
no fetch, pull, branch switch, history rewrite or push was performed. Starting
usage was 43% used / 57% remaining, resumed usage 44% / 56%; snapshots stayed
below the skill's halt threshold (latest evidence pass: 49% / 51%). Reset:
2026-10-08 08:09:39 UTC / 11:09:39 Africa/Cairo. The real-reference/review resume
started at 51% used / 49% remaining. Usage after R3 and all five final gates was
54% used / 46% remaining; the final handoff supplies its last snapshot.
The model/tooling resume began at 55% used / 45% remaining; the MFCC/browser
evidence pass reached 58% / 42%. After R5 and final gates it was 59% / 41%.
Approval covered local assets/tooling, not Git.

### Owner-requested speaker decision research (2026-10-02)

The consolidated owner brief requests a current substantial comparison before
committing to a speaker path, covering local models, existing Deepgram/OpenAI,
dedicated hosted APIs, three-to-five speakers, existing implementations and
costs. It authorizes research/documentation, not new uploads, paid calls,
cloud/Git actions or a Windows policy change. The completed
[speaker options report](../research/ACTIVE_SPEAKER_OPTIONS.md) records primary
papers, pinned source/artifact metadata, six implementation examples, detailed
cost scenarios and the proposed smallest decisive experiment. Public source
reads obtained no additional weights/datasets and ran no provider inference.

LR-ASD plus a licensed small detector is the preferred next local candidate
under the existing contract; NVIDIA Maxine ASD is the API finalist if production
access/terms/cost and selected-video transfer are approved. Light-ASD stays the
control. Deepgram remains the first transcription baseline. Generic OpenAI and
Gemini approaches are concrete challengers, not proven substitutes. Supporting
five simultaneous faces would require an explicit change to the current four-
track limit and evidence; five voices across compliant shots is different.
No browser/server/API winner, model go/no-go or whole-ticket acceptance follows
from finishing research. Proposed thresholds are not owner-approved gates.

Independent R6 reviewed final evidence bookkeeping after R5 and matched the
28-file snapshot `4fef91e62b3557429069d9cecf9a0d61ec94f6cc8fa5fae9eea5a64f9c19ab11`
with unchanged 21-code/data fingerprint above: no actionable findings in the
local scope, whole ticket still incomplete. Research adds one document and
updates this packet/index; the exact scope is now 29 files. The owner explicitly
stopped independent review during R7 and instructed that it not be run again.
R7 was interrupted and supplied no final verdict; no further review pass will
be dispatched without a new owner instruction. Before stopping, R7 independently
confirmed the primary agent's Cloud Run billing correction: GPU instance billing
covers the whole lifetime with a one-minute minimum. The report's short-clip
matrix and volume examples now apply that minimum and label remaining
idle/lifetime uncertainty. No clean R7 verdict is claimed.

Required code gates remain the previously passed five commands/362 tests because
this pass changes documentation only. The research documentation passed root
format checking, Markdown/table/file-link checks and scenario recalculation;
the handoff records final checks. Research started at 60% usage; the final
handoff supplies the latest usage snapshot. Whole-ticket model, audio/profile,
transport, rights/privacy and quality/resource gates remain open.

## LR-ASD local export and inference evidence (2026-10-02)

The owner provisionally selected local LR-ASD, authorized pinned default AVA
weights, compatible small MIT YuNet/runtime, complete score export, private
reference/browser tests and scoped obsolete-model cleanup after verification.
No provider/cloud/deployment/Git action or further security change was authorized.
Independent review remains stopped; no new validation agent or verdict exists.
The owner manually disabled Smart App Control; PyTorch 2.14.1+cpu now imports.
The previous WinError 4551 is historical, not a current conversion blocker.

### Pinned artifacts and strict conversion

| Artifact | Revision/version, bytes and SHA-256 | Evidence |
| --- | --- | --- |
| LR-ASD default AVA checkpoint | `1b6dcd2d8fc2895683de6508ec6294ec47d388ca`; 3,426,337 bytes; `85e6c77fc981595234790d1e128ebb60352d37726b2445e0ef8891e2512fe9e3` | Pinned upstream release; root MIT expressly covers code/weights; private notice retained; every one of 168 keys strictly loaded, including both loss heads. |
| Complete score ONNX | OpSet 17; 3,369,760 bytes; `176b05e5d43c1673007e0a4a06345994bdb0d6cc468926aeb9ea5adcaa6cafc5` | Raw class-1 learned logit, not softmax/probability; fixed batch 1 and dynamic time; native ORT + browser WASM parity. |
| YuNet 2023mar ONNX | OpenCV Zoo `47534e27c9851bb1128ccc0102f1145e27f23f98`; 232,589 bytes; `8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4` | Published LFS hash verified; model directory declares MIT, retained privately; actual graph fixed 640×640 raw BGR CHW. |
| ORT Web | 1.30.0 tarball 33,106,585 bytes; `d2228df7e4616bc3348bf504ee888f3bec43789a273f0a63f3e68d203ce3bf71` | Registry SHA-512 also verified; private three-file WASM-only runtime 14,337,332 bytes; root MIT and component notices retained. No application dependency added. |
| Offline decoder | imageio-ffmpeg 0.6.0 wheel `02fa47c83703c37df6bfe4896aab339013f62bf02c5ebf2dce6da56af04ffc0a`; FFmpeg 7.1 essentials binary `2ce797a0f88d7f067180338fb227f7b1928ea727bd9a4d7a1d022f7c52af71a3` | BSD-2-Clause wrapper; exact binary reports GPL-3.0-or-later, license output retained privately. Offline comparison only, never deployed. |

Sources: [LR-ASD source/weights](https://github.com/Junhua-Liao/LR-ASD/tree/1b6dcd2d8fc2895683de6508ec6294ec47d388ca),
[YuNet model/license](https://github.com/opencv/opencv_zoo/tree/47534e27c9851bb1128ccc0102f1145e27f23f98/models/face_detection_yunet),
[ORT MIT](https://github.com/microsoft/onnxruntime/blob/v1.30.0/LICENSE),
[ORT component notices](https://github.com/microsoft/onnxruntime/blob/v1.30.0/ThirdPartyNotices.txt),
[decoder registry](https://pypi.org/project/imageio-ffmpeg/0.6.0/).

The complete LR-ASD graph uses Concat/Constant/ConstantOfShape/Conv/Div/GRU/
Gather/Gemm/GlobalMaxPool/MaxPool/Mul/ReduceMean/Relu/Reshape/Shape/Sigmoid/
Slice/Squeeze/Sub/Transpose/Unsqueeze. Internal `(pixel/255 - .4161)/.1688`
normalization is preserved. Audio is `[1,4T,13]`, visual `[1,T,112,112]`, output
`[T]`. Export's first attempted native load exposed malformed MaxPool dilation:
upstream audio MaxPool3d is applied to 4-D unbatched input. Replacing its
unit leading kernel/stride by equivalent MaxPool2d fixes export; original and
rewritten final scores are exactly equal on all six synthetic lengths. No
approximation, weight quantization, ensemble reduction or model-shape rewriting
was accepted. Native original/ONNX maximum error over 1/5/25/50/75/150 frames
was 0.00000429; largest native call 361.81 ms. The generic GRU exporter warning
concerns changing batch size; this contract fixes batch 1.

### Actual native and browser measurements

The private selected 60-second reference was decoded at 25fps, with bounded
single-frame video reads, letterboxed YuNet detection, provisional HSV cuts,
IoU tracking/gap interpolation, four simultaneous tracks, median-13 crop
geometry, raw 224×224/gray/central 112×112 tensors and track-global MFCC. Crops
were private disk memmaps; inference windows were at most 150 frames. This is
an offline comparison implementation, not a backend/native production job.
No raw source, filename, source hash, content or face coordinates is recorded.

| Measurement | Actual result | Limit of conclusion |
| --- | --- | --- |
| Native selected range | 60 seconds, 1,500 decoded frames; face detections on 1,500 frames; 2 retained tracks; 0 overflow frames; 0 provisional content cuts | Execution counts, not labelled recall/cut correctness. |
| Native scores | 294 calls; 2,998 track frames after MFCC alignment; 1,250 track-frame logits at/above zero | No diarized association or accuracy/complete focus coverage is inferred. |
| Native phase timings | Detection/decode 33,968.02 ms; score phase 50,382.48 ms | Not total run/peak memory or a browser two-face completion result. |
| Real processed tensor parity | 150-frame native original/ONNX max error 0.00000167 | Same processed tensors, not upstream video/detector pipeline equivalence. |
| Browser runtime | ORT Web 1.30.0, WASM, one thread, COOP/COEP isolated, actual worker | No WebGPU or universal-device result. |
| Browser model loading | First run 318.645 ms; retry 106.880 ms | Observed model/runtime initialization; not a guaranteed cold network load. |
| Browser synthetic lengths | 1/5/25/50/75/150; maximum raw error 0.00000382 | All finite scores; tolerance 0.0001 absolute + 0.001 relative. |
| Browser real tensor call | 150 frames, 1,934.89 ms; raw max error 0.00000215 | One private face window. |
| Distinct-duration ensemble | Original/native 16 calls, raw max error 0.00000179; browser 16 calls/11,751.285 ms; all 150 rounded scores exactly matched | Six unique durations, equal Float32 weights and NumPy ties-to-even; not a reduced ensemble. |
| YuNet browser parity | All 12 outputs; synthetic max error 0.00000477, reference 0.00000763; reference 3 boxes max error 0.00001526 | Native Float32 decode/integer NMS parity on same input, not detector recall. |
| Browser retry/foreground | Total 18,200.605 ms; max 50-ms heartbeat gap 63.745 ms; cancel then fresh worker passed | No peak memory, OS freeze, pressure or mobile guarantee. |

Largest model inputs are 7,526,400 visual + 31,200 audio bytes; intermediate
ORT/WASM/native heap and multi-face peak memory are **unmeasured**. No original
video is served/uploaded; the separate loopback server permits fixed GET-only
model/runtime/tensor paths, no arbitrary URL/path/query, checkpoint, secret or
write route. Sessions/tensors are disposed before successful result delivery;
cancel/exit/freeze terminate workers and clear page timers. Wall-clock guards
bound progress stalls to 20 seconds and the run to five minutes. Unit tests
cover duration coverage, Float32 rounding, detector/NMS malformed tensors and
private server route/header/error boundaries without loading any model or
contacting a provider.

### Deviations, cleanup and decision ledger

| Question | Chosen answer/evidence | Remaining confirmation |
| --- | --- | --- |
| Which baseline now owns local work? | Owner-selected LR-ASD default AVA + MIT YuNet supersedes Light-ASD; exact pinned assets above. | Shipping quality/rights/notices/model delivery remain separate. |
| Does the host still block conversion? | No: owner manually changed policy; CPU import/export/native inference passed. | No agent security change; older block stays historical. |
| May export change pooling syntax? | Only a mathematically equivalent 4-D operation, with original/rewrite score arrays exactly equal. | No approximate pooling or missing head accepted. |
| Should YuNet be forced to the suggested 320 shape? | No: released graph is fixed 640; measured actual input preserved. | Browser memory/performance acceptance remains. |
| Does new detection/raw crop equal the upstream preparation? | No: YuNet/HSV/raw crops differ from S3FD/PySceneDetect/JPEG/XVID. Same-tensor score parity is the proved boundary. | Browser video/crop parity and labelled detector/focus quality remain. |
| Can native multi-track or browser tensors be called full browser feasibility? | No: native 60-second two-track execution plus actual browser score/detector/ensemble tensors only. | Full browser video/MFCC/crop/tracks and agreed metrics required. |
| Can positive logits establish accuracy? | No: no labelled truth, voice association or reviewed focus result was supplied. | Owner reference labels/perceptual validation and agreed quality targets. |
| What obsolete files/dependencies can be removed? | After replacement native/WASM parity, hash-matched old Light checkpoint/source/detector/model metadata removed. Old notice/provenance retained privately; research/synthetic MFCC and shared PyTorch/numeric tools preserved. No S3FD weights ever fetched. | No shared model-independent dependency was removed. |
| Does the owner request another review? | Explicitly no: review stopped; only authorized implementation/checks continue. | No new independent verdict or restart of the review agent. |

The browser tab closed. First server PID 19440/conhost 19312 and updated server
PID 8812/conhost 10692 were captured by creation time and fully stopped; three
stabilization checks confirmed no owned process/listener on 4186. Detached
Windows console shutdown used bounded forced cleanup after testing; no normal
app instance or unrelated process was stopped. Twenty private derivative files,
50,643,780 bytes, were deleted and absence verified. Approved new model/runtime,
shared isolated tools, required notices and aggregate logs remain outside Git.
No real media, filenames, signed capability, secret, transcript or provider
payload was added to Git/logs/screenshots. The original owner reference was
preserved. Deepgram/OpenAI/default/test composition and all paid/live flags
were untouched; no Git mutation, provider call, cloud action or deployment.

This pass's focused checks passed 50 tests in four files plus frontend typecheck
and scoped lint. Required fresh final root gates and exact changed-file scope
are recorded below after execution. **Whole CL-006 remains incomplete**, without
model go/no-go: full browser video/crop/track/PTS parity, labelled one/two/multi-
face/overlap/listener/cut/miss/off-screen evaluation, agreed focus/time/memory
thresholds, speech/profile quality and exact protected received-body/hosting
validation remain open. Public privacy/retention, sample redistribution/rights,
visual/accessibility/support claims and deployed notices/delivery remain owner
or later-ticket proof. CL-008 is not unlocked by these kernel measurements.

### Final local checks and exact scope (2026-10-02)

The final Float32-threshold code was rechecked in the actual browser after
regenerating only a private selected 10-second native reference. That repeat
decoded 250 frames, retained two tracks, made 52 calls over 498 track frames
and again had zero face overflow. Its original/ONNX 150-frame error remained
0.00000167. Final browser checks passed every synthetic length, the private
face window, all twelve detector outputs/native boxes and sixteen ensemble
calls. All 150 rounded scores matched exactly; raw reference error 0.00000215
and box error 0.00001526. Total 18,318.845 ms, initialization 278.315 ms,
private 150-frame call 1,885.615 ms, ensemble 11,634.155 ms and maximum
heartbeat gap 64.920 ms. The original 60-second/18.20-second records above
remain their measured earlier passes.

Final probe PID 4996/conhost 16816 and its tab were stopped/closed. Three
stabilization checks and a final owned-native-process check found zero
processes/listeners on 4186. Another 20 private derivatives (19,283,780 bytes)
were deleted. Combined cleanup across both passes is 40 files / 69,927,560
bytes; no reference tensor remains. Approved new model/runtime and shared
tools/notices/aggregate logs remain private. No normal app or unrelated
process was stopped.

Final measured host: Windows 11 Pro 10.0.26200, Intel Core i7-10810U,
6 physical cores/12 logical processors; actual in-app Chromium worker.
The final numerical correction preserves native Float32 score/NMS thresholds,
including the single-face equality versus multi-face strict NMS distinction.
Independent native cv2.dnn.NMSBoxes retained only index 1 for the threshold
fixture; 19 focused tests passed. Temporary test-directory recursive deletion
now verifies the resolved parent and owned name prefix before removal.

All five settled-code root gates passed:

- `corepack pnpm format:check`: all matched source files formatted; Markdown is
  deliberately ignored by the root formatter and checked separately.
- `corepack pnpm lint`: passed without findings.
- `corepack pnpm typecheck`: contracts, boundary fixtures, backend and frontend passed.
- `corepack pnpm test:unit`: 381 tests in 37 files: root 11/3, contracts 38/2,
  backend 85/7, frontend 247/25; top-level fake/off setup and network isolation.
- `corepack pnpm build`: contracts/backend compile and Next.js 16.3.7 production
  build passed; all six static pages generated. No app/provider/deployment launched.

Python AST checks passed for all four explicit offline scripts. Current Markdown
file links (76 across nine scoped documents) and scoped whitespace checks passed.
Boundary tests preserve application-neutral/browser-safe contracts and reject
cross-app/Node misuse. No stale Light-specific callable name, unused profile
constant, debug console, TODO or newly committed media/model binary remains in
this speaker slice. Secrets/provider flags/defaults and unrelated owner edits
were preserved. HEAD remains `129d8a7a09ed09cab427e3dcbb00a53b9a5cb278`, index empty.
No staging, commit, fetch, push, branch/history change, paid/provider/cloud action
or independent review occurred. Suggested subject only:
`CL-006: add bounded audio processing and LR-ASD browser parity`.

The exact ticket scope is 41 paths below, excluding the owner's unchanged
`AGENTS.md` and CL-015 edits. There are 32 code/data and nine Markdown paths.
Code/data fingerprint (sorted path + NUL + file SHA-256, joined by LF) is
`13198b0347a1530e87ad0ec45c35f465605c0c287ddd404022c9cfa229490d05`.
Earlier R1-R6/S1 verdicts/hashes apply to their snapshots; this final pass has
no new independent verdict at the owner's request. The complete earlier and
current decision ledgers remain above; none is an unrecorded approval.

```text
apps/frontend/README.md
apps/frontend/feasibility/browser-media/README.md
apps/frontend/feasibility/browser-media/index.html
apps/frontend/feasibility/browser-media/main.mjs
apps/frontend/feasibility/browser-media/server.mjs
apps/frontend/feasibility/browser-media/server.test.mjs
apps/frontend/feasibility/browser-media/worker.mjs
apps/frontend/feasibility/browser-speaker/README.md
apps/frontend/feasibility/browser-speaker/ensemble-reference.py
apps/frontend/feasibility/browser-speaker/export_lrasd.py
apps/frontend/feasibility/browser-speaker/generate-mfcc-reference.py
apps/frontend/feasibility/browser-speaker/index.html
apps/frontend/feasibility/browser-speaker/main.mjs
apps/frontend/feasibility/browser-speaker/reference-lrasd.py
apps/frontend/feasibility/browser-speaker/server.mjs
apps/frontend/feasibility/browser-speaker/server.test.mjs
apps/frontend/feasibility/browser-speaker/speaker.numerics.test.ts
apps/frontend/feasibility/browser-speaker/speaker.numerics.ts
apps/frontend/feasibility/browser-speaker/worker.mjs
apps/frontend/src/features/media/audio.extraction.test.ts
apps/frontend/src/features/media/audio.extraction.ts
apps/frontend/src/features/media/audio.mfcc.reference.json
apps/frontend/src/features/media/audio.mfcc.test.ts
apps/frontend/src/features/media/audio.mfcc.ts
apps/frontend/src/features/media/audio.profile.ts
apps/frontend/src/features/media/audio.protocol.ts
apps/frontend/src/features/media/audio.samples.test.ts
apps/frontend/src/features/media/audio.samples.ts
apps/frontend/src/features/media/browser.workspace.test.ts
apps/frontend/src/features/media/browser.workspace.ts
apps/frontend/src/features/media/source.client.test.ts
apps/frontend/src/features/media/source.client.ts
apps/frontend/src/features/media/source.protocol.ts
apps/frontend/src/features/media/source.worker.ts
docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
docs/operations/THIRD_PARTY_SOFTWARE.md
docs/research/ACTIVE_SPEAKER_OPTIONS.md
docs/tickets/CL-005-implement-secure-upload-and-storage.md
docs/tickets/CL-006-build-media-job-and-speaker-feasibility.md
docs/tickets/README.md
eslint.config.mjs
```

## Current implementation checklist

- [ ] Worker-owned demux/audio decode/downmix/resample/profile encode with
      bounded queues and scratch; actual timestamps, frame/audio disposal,
      abort/stall/timeout and background-suspension behavior.
- [ ] Prove the selected full-bound audio profile fits protected route/hosting
      size limits, with no extra transcription calls. Compare quality and timing
      to reference PCM; validate exact received format/duration before spend.
      Record conditional HTTP/2/compressed-profile conclusions, not guessed caps.
- [x] Inspect the owner-selected pinned LR-ASD inference model plus final classifier,
      preprocessing and code/checkpoint/detector licenses. Obtain explicit
      model/download/media approval; no dataset/weights download by default.
- [ ] Candidate: worker shot/face tracks, reference-equivalent 25fps face
      sampling, 112x112 grayscale tensor preprocessing and 16kHz mono/13-MFCC
      features (25ms windows/10ms hops), then ONNX audiovisual inference.
      Preserve source timestamp/rotation/VFR mapping and shot-boundary resets.
- [x] Export/probe exact 2D/3D convolution/pooling, reshape/transpose, GRU,
      temporal reversal, Sigmoid fusion and classifier operations/opset/time shapes.
      Begin with ORT WASM parity; WebGPU requires its own operator/runtime proof.
      A PyTorch checkpoint or server CPU run is not a browser execution result.
- [ ] Golden-test preprocessing/tensors and model scores against an approved
      offline reference; no approximation of MFCC/crop/normalization.
      Native tooling is permitted only as an explicitly approved offline
      comparison harness, never the deployed media path.
- [x] Independently golden-test the bounded standalone MFCC kernel: 17 unit
      tests and actual worker comparison of all 8,281 synthetic coefficients.
      This partial preprocessing evidence does not complete crop/tensor/model
      parity or the audiovisual go gate above.
- [ ] Measure actual converted model/download size, load time, tensor working
      set and multi-face/multi-duration inference cost. Upstream checkpoint
      metadata (3.43MB) is not peak browser memory; measured ONNX is 3.37MB.
- [ ] Face detector substitution, weight quantization, reduced ensemble or
      sampling changes require explicit measured quality parity, not an assumed
      speed improvement.
- [ ] Agree measurable focus correctness/switch delay/jitter/off-screen behavior,
      audio timing, time/memory/responsiveness thresholds before verdict.
      Evaluate one face, alternating wide two-speaker, listener motion, overlap,
      cuts, missed faces and off-screen speech using approved media.
- [ ] Publish a browser-model go/no-go with versions/hashes/measured runtime.
      No-go blocks CL-008 and reopens architecture; no generic-crop downgrade
      or remote frames/video fallback without a new owner decision.

## Ownership and tests

Own frontend media workers/audio pipeline, strict worker messages, browser-safe
descriptor/provenance changes necessary for this slice, model-conversion/
reference tooling only when approved, deterministic fake audio/vision ports and
focused unit/browser tests. No cross-app import, arbitrary URL, shell string,
provider request, application content log or model fetch on module import.

Test exact limits/malformed/truncated/unsupported/silent tracks, VFR/rotation/
offset mapping, bounded buffering, queue backpressure, model/operator failures,
cancel/reload/background pressure and every resource cleanup. Assert zero
Deepgram/text/image calls. Exercise a synthetic 20min/near-500MiB path and
60s selected range on the measured desktop-browser runtime, plus responsive
viewport checks under the demo verification policy.
Run focused checks and all five root gates before completion.

## Acceptance, gates and handoff

- [ ] Production audio profile has exact local/transport bounds and quality/
      timing/cancel evidence, not a unit mock.
- [ ] Active-speaker browser feasibility is explicitly go, or honestly no-go
      with downstream blocked. Synthetic face tracks cannot approve it.
- [ ] Real reference media, converted weights, legal distribution, actual
      devices and measured performance are separately recorded.
- [ ] No original-video/backend transfer, cloud/native job or paid call occurs.
- [ ] Update software/runtime guide and narrow source-of-truth decisions;
      changed files, exact tests/manual states and all unchecked owner gates
      appear in the completion handoff.

CL-008 depends on this browser go proof. CL-015 validates deployed model delivery/
headers/caching and client behavior, not a Cloud Run speaker job. Preserve the
single-card UI; do not implement editor, clip assembly or final export here.

## Historical packet

<details>
<summary>Superseded server-media plan, retained only for decision history</summary>

The following text is not an execution checklist, setup instruction or evidence
of completion under the browser-owned architecture. It must not be used to
reintroduce cloud content storage, jobs or unsupported guarantees.

# CL-006 — Build the media job and prove speaker feasibility

Status: Planned<br>
Milestone: M2 — private media foundation<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-003 and CL-005<br>
Blocks: CL-007 and CL-008<br>
Suggested commit: `CL-006: build the media job foundation`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Build the single safe media-job entry point, descriptor/progress/result
lifecycle, process and temporary-workspace foundation, authoritative ffprobe
inspection, audio extraction boundary, fake job runner, and a time-boxed
Light-ASD active-speaker feasibility spike on the exact intended sample and
deployment-like local CPU profile. Actual Cloud Run performance proof remains
unchecked until final CL-015.

Owner setup ordering (2026-10-01): use the
[local software guide](../operations/THIRD_PARTY_SOFTWARE.md). No GCloud setup,
credentials or cloud execution occurs here. Rights-approved local/container
speaker feasibility is the CL-008 go/no-go dependency; CL-015 repeats the approved
benchmark on the actual deployed profile before launch. If the local benchmark
cannot run, the feasibility gate remains blocked; fake results do not replace it.

The feasibility spike stays in this packet because it depends directly on the
same pinned container, process runner, media fixtures, cleanup, and resource
measurement. It is a real go/no-go gate, not a production feature split.

## Portfolio value

Prove the risky media/vision foundation before building live AI or automatic
clip-review work:
safe subprocesses, authoritative media limits, bounded asynchronous execution,
and evidence that the signature speaker-following claim is plausible on the
actual demo source and intended CPU.

## Standalone implementation context

- One backend/job image exposes one `media-job.ts` entry with only three
  source-controlled modes: `analyze`, `assemble`, or `render`. This ticket builds
  the common runtime and real inspection path; later tickets add remaining
  mode stages.
- A job receives only an opaque descriptor ID, reads one strict private
  descriptor, and never receives transcript, prompt, path, URL, secret, or user
  data through arguments/environment overrides.
- ffprobe/FFmpeg/Python use executable plus argument arrays, never shell
  strings. All paths are job-created inside one temp workspace.
- Progress is content-free, ordinal, monotonic, generation-guarded, and terminal
  writes are immutable. Cloud Run task retry remains zero.
- Active-speaker detection uses shot-local visible face geometry and
  audio-visual speaking evidence, never identity or diarization-to-face mapping.
- Light-ASD is the first spike target. Compare TalkNet only if Light-ASD misses
  the recorded focus/runtime target; do not replace the feature with public
  manual crop controls.

## Dependency evidence required

- CL-003 must provide schema-valid rights-statused media/transcript/focus
  fixtures and deterministic fake job timing.
- CL-005 must provide a validated private object reference/generation,
  operation ownership, cancel/clear, storage preconditions, and no-capability-
  leakage tests.

The exact sample benchmark additionally requires recorded rights approval; a
synthetic-only run cannot be relabeled as the release feasibility decision.

## Files and areas owned

- Backend `media-job.ts`, descriptor schema, progress writer, cancellation,
  cleanup, fake job runner and source-controlled Cloud Run adapter code tested
  with fake transport, not credentialed cloud execution.
- Process runner, temp workspace, ffprobe parser, media inspection, and bounded
  audio extraction foundation.
- Pinned backend/job container definition and media binary/version record.
- Python vision spike entry/schema, pinned requirements, model/weights/license
  notices, benchmark script/report, and synthetic/purpose-recorded fixtures.
- Media/job integration tests and operations benchmark evidence.

## Scope boundaries

### In scope

- Strict descriptor modes/version/object references/generation/deadline/cancel
  marker/limit profile and rejection of unknown fields.
- Safe subprocess deadline, abort, signal, bounded stderr, output-size,
  network-protocol, and cleanup behavior.
- Authoritative media validation for supported MP4/WebM, H.264/VP8/VP9,
  AAC/Opus/Vorbis, one video and one usable audio stream, dimensions/pixels/fps,
  finite duration, rotation, DRM/external reference, and exact profile bounds.
- Media inspection operation and normalized `MediaDescriptor` result.
- Bounded mono speech extraction interface/fixture validation for CL-007.
- Fake job stages/status/cancel/expiry and API reconciliation of execution versus
  terminal evidence.
- Light-ASD/PySceneDetect/face tracking spike over one-face, wide two-person,
  and edited-camera sequences; runtime/memory/image-size/quality evidence.

### Out of scope

- Live transcription/candidate provider work (CL-007), production speaker-focus
  compiler (CL-008), visual planning/assets (CL-009), render compiler (CL-011),
  or cloud deployment/provisioning (CL-015).
- Public user fallback controls, identity recognition, face embeddings,
  protected/sensitive inference, persistent frame crops, multi-camera source
  selection, arbitrary Python/model execution, or platform retry.

## Implementation checklist

### 1. Job and process foundation

- [ ] Validate mode and descriptor before reading user objects or spawning work;
  never list the bucket to discover inputs.
- [ ] Implement direct-spawn process ownership with deadlines, abort/kill
  escalation, bounded pipes/stderr, safe error mapping, and `finally` cleanup.
- [ ] Disable unnecessary FFmpeg network protocols and reject model/user text in
  commands, paths, filter graphs, or environment overrides.
- [ ] Write monotonic progress and create-only/expected-generation terminal
  evidence; reconcile conflicting/missing platform evidence fail-closed.
- [ ] Check cancellation before/after each stage and clean subprocess/temp
  artifacts for success, failure, abort, timeout, and signal.

### 2. Authoritative inspection

- [ ] Parse ffprobe JSON through a bounded backend-only schema and normalize
  duration, codecs, streams, frame rate, rotation, dimensions, pixels, bytes,
  and orientation.
- [ ] Enforce 15 seconds–20 minutes AND ≤500 MiB public rules independently
  before any later provider call; owner profile remains separately gated.
- [ ] Reject missing audio, corruption, unsupported codec/container, multiple
  streams, DRM/external refs, nonfinite values, oversized geometry/fps, and
  wrong object generation.
- [ ] Delete rejected source/partial inspection artifacts best-effort and return
  only content-safe errors/evidence.

### 3. Fake job lifecycle and extraction boundary

- [ ] Implement deterministic stage sequences, injected clock, idempotent
  status/cancel, terminal immutability, expiry, and missing-result cases.
- [ ] Define extraction to one bounded job-local mono speech file; check output
  size, no-usable-audio behavior, abort, and cleanup without provider use.
- [ ] Keep raw ffprobe/process/provider output out of browser responses,
  persistent result objects, and logs.

### 4. Active-speaker feasibility gate

- [ ] Pin exact PySceneDetect, detector/tracker, Light-ASD code/weights hash,
  Python/PyTorch dependencies, licenses, and reproducible container inputs.
- [ ] Reset tracking at shot boundaries; bound four faces/shot; exchange strict
  JSON; store no embeddings or names; delete frame crops/intermediates.
- [ ] Measure one-face, wide alternating-speaker, listener nod/mouth motion,
  short overlap, and edited-camera transitions from the exact proposed sample.
- [ ] Record focus correctness, visible flicker/switch behavior, runtime, peak
  memory, container size, CPU profile, failures, and manual review method.
- [ ] Issue explicit Light-ASD go/no-go. Compare TalkNet only if the first result
  fails the target and owner approves the bounded comparison.

## Contracts and operation behavior

- `POST /v1/uploads/complete` owns one `media-inspection` operation that becomes
  accepted only after object metadata and authoritative ffprobe proof both pass.
- Content-free operation status may be queued/running/cancel-requested/
  succeeded/failed/cancelled/expired; stage never regresses and terminal status
  cannot be overwritten.
- Completed execution without a terminal result is `RESULT_NOT_FOUND`; a valid
  terminal result wins; conflicting evidence blocks paid retry.
- The spike may emit owner-only evaluation artifacts, but production contracts
  eventually retain only bounded shot/face/focus geometry—not identities or
  raw crops.

## Privacy, provider, and cost constraints

- Run the feasibility work only on synthetic or explicitly rights-approved
  purpose-recorded media. Do not copy private media into Git or logs.
- Do not make Deepgram, OpenAI, image-model, or Turnstile calls.
- Weights and code licenses/hashes are release evidence; do not download or
  accept unknown model artifacts without recording source and terms.
- Benchmark a controlled local/container CPU profile here. Actual Cloud Run
  CPU/memory/runtime evidence belongs to CL-015; local numbers cannot be
  relabeled as deployment evidence.

## Acceptance criteria

- [ ] Supported/corrupt/missing-audio/unsupported/bounds/generation cases produce
  correct `MediaDescriptor` or safe failure before provider calls.
- [ ] Process abort, timeout, signal, output cap, and every failure path leave no
  child process, temp workspace, audio, frame crop, or partial output.
- [ ] Progress is monotonic/immutable and execution/result reconciliation is
  deterministic.
- [ ] The exact model revision, dependency lock, weights hash, license notices,
  container/runtime inputs, and benchmark methodology are recorded.
- [ ] One-face, wide two-person, listener-motion, overlap, and camera-cut sample
  sections receive an explicit usable/not-usable result with runtime/memory.
- [ ] A go decision states why CL-008 may productionize Light-ASD; a no-go stops
  CL-008 and names the owner-approved comparison or architecture change needed.

## Focused verification

- [ ] Run descriptor/progress/cancellation/job-reconciliation tests.
- [ ] Run process runner and temp-workspace success/failure/abort/timeout/signal
  tests and assert exact cleanup.
- [ ] Run ffprobe/inspection/extraction fixture matrix with provider call counts
  at zero.
- [ ] Build the pinned job/container image and record binary/model versions and
  scan results when tooling is available.
- [ ] Run the local speaker benchmark only with approved media/model/download
  access; otherwise leave that gate unchecked and do not start CL-008.
- [ ] Hand off the pinned benchmark/method/profile to CL-015 for actual Cloud Run
  proof; perform no cloud benchmark here.
- [ ] Run affected lint/typecheck/build, Python/schema checks, `git diff --check`,
  and final status inspection.

## Documentation updates

- Add/update local media-job development, render/media binary profile,
  active-speaker model notices, and benchmark report.
- Record sample/media rights references without embedding private consent or
  content.
- Promote a no-go, alternative model, resource change, or job-architecture
  change into the parent and downstream packets before further implementation.

## Owner gates and external blockers

- Rights gate for the exact purpose-recorded sample.
- Model/license/download and network authorization for Light-ASD assets.
- Owner approval for local intended-profile benchmarking or TalkNet comparison;
  actual cloud-profile approval/execution stays in final CL-015.
- The packet can complete job/inspection/fake foundations without live cloud;
  CL-008 remains blocked until the feasibility go decision exists.

## Commit boundary

Keep the job/process/inspection foundation and its directly dependent
feasibility gate together as `CL-006: build the media job foundation`. Do not
absorb transcription, production assembly, contextual visuals, render, or
deployment. No Git/cloud/provider action is implied.

## Precision references

- [Job descriptor and dependency rules](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#87-job-descriptor)
- [Active-speaker processor](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#128-active-speaker-processor)
- [Process safety, inspection, and extraction](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#13-media-analysis-assembly-and-render-pipeline)
- [Cloud Run job lifecycle](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#146-cloud-run-job-configuration)
- [Media fixture/evaluation strategy](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#206-syntheticlicensed-media-fixture-matrix)

## Completion handoff

Report the job/descriptor/process architecture, media acceptance matrix,
cleanup evidence, fake lifecycle, pinned binaries/model/weights/licenses,
benchmark inputs and results, go/no-go decision, changed files, exact commands,
and every rights/network/cloud blocker.

</details>

</details>
