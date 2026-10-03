# Gemini and Cloud Run Remotion migration

Status: **Local code through CL-014 is audited and validated with no actionable local findings. The release ledger separates implemented code from unverified manual/media/device/film/provider/cloud/rights/spend gates. All five settled root gates and 624 synthetic tests in 64 files pass. CL-015 local release preparation is next; no deployment or public paid enablement is authorized. The owner authorized sequential execute/validate/fix/document loops and ticket-prefixed commits through CL-014 and locally buildable CL-015. Missing keys/live/cloud evidence does not block this local sequence. Provider/paid/cloud/deployment, native full-fixture, pixel/audio/human quality, font/license/rights and real device/public-release gates remain deferred.**<br>
Owner revision: 2026-10-02; supersedes the earlier same-day browser-render plan<br>
Authority: latest explicit owner decision, then this current source-of-truth revision<br>
Inventory: [file-level migration map](MIGRATION_FILE_INVENTORY.md)<br>
Later setup: [Cloud Run local-test guide](../operations/CLOUD_RUN_RENDERER_SETUP.md)

The owner chose Google Gemini for AI and our Google Cloud Run compute for final
editing/rendering/encoding. The owner required documentation approval before correction, then explicitly
granted it and authorized necessary local implementation on 2026-10-02. Its display name is ClipBuilder; its
project identity/billing and europe-west1 build/private setup were verified
privately. The owner resumed testing with a rights-confirmed 2:45 source and
authorized necessary image retries until it passed. CL-006 now records Linux
render/native cleanup and private cloud upload/proxy/output/audio/cancellation/
independent deletion proof, five builds and four media dispatches with zero AI.
Full maximum-envelope stress and live Gemini quality remain later gates.
No AWS, dedicated alpha Remotion Cloud Run package or browser final-export
requirement survives this revision. Preserve unrelated owner changes during implementation.
Usage polling remains stopped. The owner authorized local execute/validate/fix
loops and ticket-prefixed file-level commits through CL-014 and locally buildable
CL-015 work on 2026-10-03. Keys/paid/cloud/deployment remain deferred.

## Product and compute responsibilities

Preserve one owned/licensed 15-second–20-minute / at-most-500-MiB source, zero to
four grounded candidates (target three), exactly one selected contiguous
10–60-second candidate, automatic fixed captions and up to three contextual
visuals, read-only preview, Confirm export and one validated 1080×1920/30fps
H.264/AAC MP4 download capped at 200 MiB. No editor, timeline, prompt/chat UI,
manual trim/caption/visual/focus controls, accounts, durable projects/history,
database, general queue, arbitrary jobs, batch workflow or direct publishing.

| Component | Responsibility | Excluded responsibility |
| --- | --- | --- |
| Next.js browser | Source selection, rights/transfer disclosure, bounded direct upload, candidate/source preview, fixed read-only clip preview, confirmation/download/cancel | Final encoding, phone model inference, credentials or arbitrary renderer requests |
| Lightweight Express control API | Admission/call budgets, immutable session/source/object-generation bindings, Google orchestration, result/manifest validation, private renderer invocation and range-aware output delivery | Chromium/FFmpeg rendering, durable transcript store or a jobs queue |
| Gemini `gemini-3.8-flash` | Grounded words/anonymous speaker turns, candidate selection; selected-range audible-speaker/visible-person association and bounded visual/edit plan | Physical video cutting/encoding, executable JSX/code/URLs or identity/sensitive inference |
| Private Remotion Node/Docker media service on Cloud Run | Validate original media; create analysis/selected preview proxies; physically cut the chosen range, apply fixed crop/caption/template animation, encode and validate final MP4 | AI key/provider calls, public editor or client-chosen command/composition/URL |
| Private temporary Cloud Storage | Immutable admitted source, bounded proxy/preview/assets and validated output during one expiring session | Public bucket, database, permanent library or history |
| Mediabunny | Retain useful browser intake/inspection and existing offset/codec/storage correctness tests where justified | Required final export stack; do not move WebCodecs/web-renderer unchanged to the server |

“Video extraction” has two distinct operations: Gemini chooses a grounded
moment by word IDs/timestamps; the media service physically decodes/cuts that
validated range. Only deterministic code controls the physical cut and render.
Flash returns text/structured plans, not raster images. Useful fixed cards and
diagrams are the initial contextual visuals with **zero image calls**. If later
evidence requires rasters, CL-009 must pin a Google Nano Banana model under the
same provider/key with explicit call/asset/cost limits. A dedicated Google ASR
model is conditional on failed caption/diarization evidence, not a default.

## AI mode and compute environment are independent

| Scenario | AI behavior | Render compute | Credentials/network |
| --- | --- | --- | --- |
| Ordinary unit/CI tests | Injected synthetic plans, exact zero external calls | Fake renderer port and synthetic artifact metadata | No keys, ADC, env files, external sockets or telemetry |
| Optional offline integration after code approval | Synthetic AI data | Local Node/Docker renderer using synthetic media | No cloud/AI credentials; bundled assets, no automatic downloads; telemetry intercepted as a test |
| Authorized local app against cloud | Fake AI or separately approved live Gemini | Private remote Cloud Run renderer | Local server ADC/ID token and cloud spend approval; browser has no cloud credential |
| Future controlled hosted app | Separately approved live Gemini | Same private Cloud Run renderer | Runtime identities, private bucket, rights/privacy/cost/release approval |

`FAKE_MODE=true`, paid disabled and every LIVE flag false stay committed/test
defaults. Fake does not mean browser rendering and live does not mean hosted
frontend. Cloud rendering can cost money with fake AI. Add separate server-side
render environment/enablement and cloud-spend gates after approval; do not
overload FAKE_MODE or expose private origins/identifiers through NEXT_PUBLIC.

## Minimum topology and request lifetime

For local-to-cloud tests, keep frontend and control API local; establish **one
private Cloud Run media service**, one private temporary bucket, one Artifact
Registry repository and one authenticated Cloud Scheduler expiry trigger in the
owner's verified project/region. The trigger invokes the service's restricted
cleanup endpoint; it is an expiry backstop, not a media jobs queue. This is not a
deployment of the full public app. Later hosted frontend/control API are a
separate CL-015 decision.

Isolate the media service from the API: Chromium/FFmpeg have larger CPU/RAM,
scratch, startup, cancellation and attack surfaces. The API can hold a small
bounded operation descriptor while a single authenticated request is active.
No job continues after a request's work deadline; no detached background work
or queue is introduced. Control state is volatile, capped and expiring; restart
or an uncertain dispatch is an explicit failure, never automatic paid replay.

Proposed first test shape: Linux x86_64 Node 22 Debian image pinned by digest,
matching Remotion 4.0.532 `remotion/@remotion/renderer/@remotion/bundler` and CLI
only where needed to provision binaries at image build. Use standard
[Node SSR](https://www.remotion.dev/docs/ssr) and
[Docker packaging](https://www.remotion.dev/docs/docker) with pinned Chromium,
FFmpeg/ffprobe and notices baked into the image. Do not download tools at runtime.
The [dedicated Cloud Run package](https://www.remotion.dev/docs/cloudrun) is alpha
and not actively developed; it is not selected.

Start provisionally at 4 vCPU/8 GiB, minimum 0/maximum 1 instance,
request-based billing, 900-second Cloud Run timeout and a shorter 840-second
application work deadline; Remotion frame concurrency 2. Cloud Run request
concurrency 2 permits one media request plus authenticated cancel/health.
An application semaphore accepts **one** expensive media operation; additional
work fails busy rather than queues. Concurrency 1 would prevent cancellation
from reaching a busy instance. Instance caps do not prove global atomicity across
revisions/restarts. Public paid use stays disabled until CL-012/015 prove epoch,
reservation, rollout/drain and duplicate-dispatch behavior.

Cloud Run's writable filesystem consumes RAM; downloaded inputs, rendered
frames, FFmpeg and Chromium count against the service memory budget. Initial
scratch ceiling 2 GiB includes source/proxies/output/intermediate frames. Use
bounded JPEG frame preparation, fixed render dimensions and streamed storage
writes, enforce actual scratch usage and kill the owned process tree on timeout.
These are proposed ceilings, not full-bound performance evidence. Fail closed
if the image/runtime cannot meet the exact source/output contract.

## Transport comparison and selected bounded design

| Transport | Fit with 500-MiB source / 200-MiB output | Decision |
| --- | --- | --- |
| One HTTP/1 Cloud Run body | Exceeds documented 32-MiB request limit | Reject |
| HTTP/2 or application chunk upload | Platform permits larger streams, but introduces proxy/body deadlines, per-instance scratch and restart/recovery burdens | Not the first integration; needs explicit end-to-end proof |
| Original copied to temporary private GCS, then small authenticated descriptors | Supports resumable bounded upload and range reads without large API body or persistent app store | Owner-approved private transport/settings implemented and verified with the CL-006 small-source test; browser integration remains later work |
| Browser full-range final render | Relies on phone codec/resource support; explicitly replaced by owner | Retired |

Cloud Run [request limits](https://docs.cloud.google.com/run/quotas) distinguish
HTTP/1 from HTTP/2; a browser fetch stream alone does not establish the latter.
Google [resumable uploads](https://docs.cloud.google.com/storage/docs/resumable-uploads)
use a bearer session URI. The API initiates an opaque one-object upload with
expected bytes/MIME and create-only generation precondition, binds it to the
session/revision, and returns only that capability to the browser. Keep it out
of browser persistence, logs, errors and screenshots; HTTPS transport is an intentional
capability-URL exception. Its authorization is session-bound; cancellation must
invalidate the provider upload session, not merely hide it in the UI. Never
accept a client-supplied bucket/object URI as renderer authority.

Before any AI or render dispatch, verify actual object bytes/checksum/generation,
media streams, decoded duration/rotation/display dimensions and public limits.
Reject malformed/truncated/multi-stream/oversized inputs and delete them.
Bucket CORS permits only approved local/hosted origins and needed upload headers;
no wildcard/public object access. A cloud object name never embeds the filename.

The media service reads only the admitted exact generation through its runtime
identity. It creates a 24-MiB-maximum, at-most-640×640 analysis AVC/AAC proxy,
preserving the full source audio clock; a 20-minute quality/size pass is required.
Google Files transport receives that proxy through the server-only SDK. One
source analysis obtains grounded words/turns/candidates. After selection, use
one bounded selected-range proxy for a second, more detailed audiovisual plan
with explicit sampling. No repeated whole-source analysis is allowed.

Create a lower-resolution selected-range preview proxy on the media service.
The browser's fixed Remotion Player performs ordinary playback/layout only,
using the same normalized geometry/word/card data as the Node composition;
it does not encode. On Confirm export, render the high-resolution original
range once, validate output, and store it create-only under the frozen manifest
hash. Stream private preview/output through authenticated same-origin endpoints
with byte ranges and Content-Disposition; never buffer the entire output in
the API/browser JavaScript. Do not claim shared React proves pixel/sync parity.

## Retention, cancellation, privacy and spend

The owner explicitly approved private temporary GCS media storage on 2026-10-02.
This is architecture approval, not provisioning, credential use or paid-test
permission. The prior browser-only original/output policy is deliberately replaced. The
uploaded original, proxy, preview and output exist temporarily in our private
GCS bucket; Gemini receives a bounded audiovisual proxy. Disclose both transfers
and separate their retention. Retain no durable transcript/prompts/provider
payloads in our cloud: validated results/manifest stay in the temporary browser
journal, server only holds bounded active descriptors and checks signed receipts.

Raw-source logical expiry is fixed at two hours after admission. Delete each
analysis proxy after its Google call and each extracted intermediate after its
consumer finishes. **Successful processing completion** is publication of a
validated, checksum/generation-bound final MP4 for the frozen manifest. At that
event delete raw source, selected proxies, preview intermediates and temporary
assets immediately; final output replaces the preview. Keep only that final
output until the earlier of ten minutes after publication or session expiry.
A reliably acknowledged saved download can shorten this window, but initiating
a download or finishing an HTTP stream does not prove the user's file was saved.
Ordinary anchor downloads therefore rely on the fixed expiry, not a fabricated
completion acknowledgement. No raw archive/project/history is kept.

Cancel, failure, clear/reset, replacement and abandonment notification immediately
fence publication and trigger generation-bound terminal deletion. The independent
authenticated **15-minute expiry sweeper** also covers closed/disconnected
browsers and crashed/restarted services. Store only small expiring GCS cleanup
intents with immutable artifact generations, deadlines and states, never
transcript/prompts. If a provider resumable-upload capability must survive restart
for cancellation, persist it encrypted in that private intent under a dedicated
server-only secret; never store or log plaintext capabilities. The sweeper can
cancel unfinished sessions, then delete completed objects and verify absence.
Bound intents to 16 sessions/256 objects; page at most 256 objects per run and
report a bounded content-free backlog. Each sweep has a three-minute deadline.
Failed deletion blocks new intake and records a retry for the next 15-minute
sweep; a second failure is overdue and alerts the owner. Continue bounded
incident cleanup at 30-minute intervals, without reopening intake until absence
is verified. No general queue or background rendering is introduced.

Operational retention targets under a healthy service are: raw source at most
2h33m (2h expiry + up to 15m to a sweep + one 15m retry + 3m sweep execution),
final output at most 43m from publication (10m window + the same cleanup budget),
and immediate best-effort terminal
deletion. These are **not unconditional physical deletion guarantees**: IAM,
storage or scheduler outages can extend retention until repaired. The plan
cannot honestly give a finite guaranteed provider-outage bound. Record overdue
age and verified cleanup, stop intake and treat breach as an incident. A GCS
age-one-day Delete lifecycle is a second, eventual safety net, not the expiry
sweeper or a two-hour SLA; [lifecycle is asynchronous](https://docs.cloud.google.com/storage/docs/lifecycle).
Review this explicit residual risk rather than claim instant permanent deletion.

The new disposable bucket must have soft-delete retention **0**, versioning off,
no retention policy/lock, no object holds and no replication/backup configuration
that retains deleted customer-accessible versions. Do not modify unrelated
buckets. Verify these settings at setup and before live admission; verify exact
generation deletion with not-found checks and authorized synthetic expiry tests.
Default [soft delete](https://docs.cloud.google.com/storage/docs/soft-delete)
would otherwise preserve bytes. Provider internal retention is separate from
absence in our bucket. Google Files are explicitly deleted at terminal states;
their documented 48h expiry is a separate fallback after failed provider cleanup,
not a promise that all provider abuse logs are deleted.

Cancel first fences the session/source/manifest revision, aborts Gemini and
renderer requests, sends authenticated cancel when possible, kills only owned
Chromium/FFmpeg trees, removes scratch and generation-bound objects, and rejects
late publication. A failed delete is a recorded cleanup obligation, not success.
Provider uploads may require bounded deletion retry after an uncertain response.
On loss/restart, verify the create-only output plus frozen receipt before reuse;
never automatically re-render or re-call AI to conceal uncertainty.

Google [Files API](https://ai.google.dev/gemini-api/docs/files) auto-expires files
after 48 hours; explicit terminal deletion is still required. Its
[paid-service data terms](https://ai.google.dev/gemini-api/terms) exclude training
but include limited abuse-processing retention. Paid-project status, rights,
region/data policy, media transfer and exact call budget must be approved before
private reference upload. No unpaid-quota privacy-equivalence assumption.

Initial AI budget: one source analysis and one selected-range plan, zero raster
calls, no tools/search, no background interaction storage, no automatic paid
retry. One final render, one bounded proxy-preparation action per required phase,
one active expensive operation. Export retry reuses the same manifest/assets and
makes zero AI calls; an uncertain final render requires explicit reconciliation,
not a second dispatch. The exact allowed final retry budget remains unchanged.
GCS operations/storage/egress, Cloud Run CPU/RAM/request/cold start, image build/
registry, secrets and license are separate costs. Project budget alerts are
advisory, not hard caps. The application must reserve counts before dispatch,
set deadlines, actual-byte/scratch limits and an owner kill switch.

Remotion [license eligibility](https://www.remotion.dev/docs/license/pricing)
must be confirmed before release; do not presume a free license. Under
[server telemetry rules](https://www.remotion.dev/docs/telemetry), SSR sends
events when a license key is set; applicable licensing may require it. Mandatory
browser-web-renderer telemetry from the abandoned design is no longer the
product plan. Product privacy must match the selected SSR license/configuration;
ordinary tests intercept telemetry and never contact it. Native binaries/fonts/
codecs retain their own exact notices and distribution obligations.

## Approved renderer/shared composition boundary extension

Keep `apps/frontend -> packages/contracts <- apps/backend`. An isolated
`apps/renderer` also imports contracts, never either app. Put the fixed React
composition in a new owning `packages/composition` rather than importing
frontend code into the media service. Proposed additional directions are
`frontend -> composition <- renderer` and `composition -> contracts`.
Contracts remain browser-safe, framework/Node/SDK-free. Amend the root operating
boundary rule; the approved extension is now in AGENTS.md and executable lint fixtures.
The media service has no Gemini secret. Control alone owns Google SDK/key and
authenticated invocation. Browser receives no bucket/private service/key setting.

AI output is strict versioned domain data. Validate word IDs/order/durations,
candidate grounding, selected range, anonymous speakers, normalized boxes,
rotation/cut/source bounds, confidence, card coverage and complete focus ranges.
No arbitrary URL, path, script, JSX, command or asset fetch is accepted. Fixed
application policies smooth switches and choose wide framing for overlap,
offscreen/absent/ambiguous people. No invented confident match or generic crop
claim is allowed. Runtime source/object generation, manifest hash, operation
nonce/epoch and receipt bind every derivative and publication.

## Approval and packet sequence

**Private test infrastructure is an interleaved checkpoint, not the last
feature milestone.** After documentation approval, locally prepare the minimum
image/adapters and authentication/lifecycle/spend controls needed by the target
test. At the first genuine cloud-dependent test, pause for bounded CL-015 setup
authorization and use the prepared guide. This may occur during CL-005/006
integration; do not wait automatically for CL-007–014 or a public release audit.
Private access, synthetic media, cancellation, independent expiry and deletion
verification, logging safety and explicit resource/call limits are prerequisites.
Implement those relevant CL-012 safeguards early; the complete CL-012 packet and
CL-014 release audit are not prerequisites for an isolated private synthetic
renderer test. Once authorized, establish only the minimum private infrastructure,
prove it with synthetic input/fake AI, then resume the owning feature packet.
Actual live/reference-media tests require separate rights/transfer/call approval
when their relevant code is ready. Full public deployment remains a later gate.

1. **Now:** reconcile documentation/inventory/setup guide; report ready for
   review and wait for explicit owner documentation approval. No migration code,
   dependency install, cloud mutation/authentication, paid call or private upload.
2. **After approval — CL-005:** adapt source admission to bounded private cloud
   upload interfaces; preserve useful local clock/storage/cleanup tests. Implement
   fake storage ports first; preserve unrelated owner edits.
3. **CL-006:** reconcile Google config/contracts, retire browser final-export
   and model-only dependencies, create the isolated Node renderer/shared fixed
   composition; local synthetic container/profile/cancel/scratch proof.
4. **CL-007:** bounded Google upload/process/structured analysis/delete port,
   grounded words/candidates/receipt and existing UI recovery; injected exact
   counts, malicious-response/timeout/uncertain-result tests.
5. **CL-008:** selected-range audiovisual association, deterministic focus,
   rotation/cuts/offscreen/overlap validation. Local fake engineering can proceed;
   live human-labelled quality remains a separate gate.
6. **CL-009:** source-bound frozen composition, fixed captions and contextual
   templates; grounding/coverage/assets/hash tests and zero image calls initially.
7. **CL-010:** existing read-only single-card preview over selected proxy and
   shared composition, revision fencing and layout/sync validation.
8. **CL-011:** authenticated render port, private output range delivery and
   one final download; codecs/size/duration/sampled sync, retries without AI,
   exact call budgets and cancel/cleanup.
9. **CL-012/013/014:** safeguards, privacy/rights/cost, accessible responsive
   preview/download/device checks, whole migration audit and required gates.
10. **CL-015 later public deployment:** after the release audit and separate
    hosting/release approval, consider complete public deployment. This does
    not delay the early private local-test infrastructure checkpoint above.

After each relevant feature is ready and its specific tests are authorized,
measure actual speaking-face/MP4/phase/whole-flow outcomes through the local app
and private renderer. Synthetic cloud tests and live owned-reference tests are
distinct approvals; neither automatically authorizes public deployment.

Each approved code packet gets focused checks and the five settled root gates.
A packet boundary controls sequencing. Documentation and necessary local-code
approval were explicitly granted; the remaining required stop is bounded external
cloud setup/test authorization. A fake test does not grant that authorization.

## Current evidence and unresolved owner decisions

Before this correction, local-model browser work took 374,955.935 ms for 60
source seconds; no audible-labelled accuracy existed. It is retired, not passed.
The earlier browser Remotion synthetic experiment produced 10.0053 seconds of
1080×1920 AVC/AAC output, 4,318,815 bytes, in 4,527.64 ms; cancellation and
temporary output cleanup were observed, telemetry intercepted, Google calls
zero. That proves only the abandoned browser spike, not cloud timing, Node
SSR compatibility or speaking quality. Its required 240-MiB media cache is a
browser-path observation, not a proposed cloud-render requirement.

The approved CL-005 prerequisite and CL-006 local foundation now include strict
generation-bound schemas, encrypted cleanup intents and expiry, private identity
verification, a typed remote client, fixed shared composition and Node media
pipeline. The [current CL-006 evidence](../tickets/CL-006-build-media-job-and-speaker-feasibility.md)
records 383 unit tests, all five root gates, synthetic Windows/Linux SSR/proxy/
audio/cancellation proof and the rights-confirmed 2:45 private cloud upload,
proxy, output/audio/layout, cancellation and independent deletion checkpoint.
Five builds and four cloud media dispatches were explicitly authorized; AI calls
were zero. Full live browser integration remains unproved. CL-006 was subsequently
committed; CL-007 changes remain unstaged/uncommitted. Owned diagnostic ports 4186/4187 and their recorded process
trees were stopped and checked absent; no app-stack launch occurred during closeout.

Temporary private GCS storage is already approved and must not be requested again.
Transport/cleanup, service/shared-composition boundaries, operational retention
targets/outage limitations, disposable bucket policy and provisional resource
limits are approved. Region/project ID, billing/IAM, build/private-test approval,
Remotion SSR coverage and source-specific private rights were subsequently
confirmed for the completed checkpoint. Identifiers stay in private runtime state.
Live Gemini/provider data terms, public sample/release and complete software/
telemetry notices retain their gates. CL-006 is complete; CL-007's local implementation
and fake browser workflow are verified; the owner explicitly deferred its
controlled live checkpoint and authorized continuing dependency-ready local packets.

Evidence still required: full-bound upload/inspection/proxy size/audio quality,
maximum-envelope container memory/scratch/OOM and whole-flow browser/control
integration; preview/export caption/layout/A/V parity; supported phone playback/
upload/download; independently human-labelled speaking faces across one/multiple
speakers, brief turns, listener motion, overlap/cuts/absent/offscreen cases;
actual whole-flow timings and meaningful memory/scratch/bytes/tokens/cost.
Default sparse video sampling or boxes alone prove none of those. Cloud is not
assumed faster and the earlier 60–120-second aspiration is not an SLA.
