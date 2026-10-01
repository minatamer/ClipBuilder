# Browser-owned media architecture

Status: researched implementation proposal; browser ownership is owner-directed,
runtime and release gates are not yet passed<br>
Decision/research date: 2026-10-01<br>
Authority: source of truth section 0.9; migration owner: CL-005<br>
Scope of this pass: inspection, primary-source research and documentation only

## Decision and non-goals

Keep the original recording and final MP4 on the visitor's device. Do not use an
application database, cloud object store, remote media job, result bucket or
object-backed coordination system. A backend may protect AI credentials and
process explicitly disclosed bounded audio/text in request scope; it cannot
read browser OPFS/IndexedDB. Browser ownership does not mean fully offline AI.

Preserve the modern single changing card, up to four grounded candidates,
exactly one selection, a contiguous 10-60 second automatic vertical clip, fixed
captions, bounded contextual visuals, read-only timestamped Agentic Notes, one
Confirm export action and one final download. No editor, timeline, manual trim,
chatbot, history, account, batch flow or social publishing. The near-minute
editorial preference and later ordered internal-cut revision are unchanged.

Public source limits remain 15 seconds through 20 minutes AND at most 500 MiB;
the existing owner-validation ceiling is not permission to increase public
bounds. MP4/WebM acceptance still needs supported codec/profile evidence.
1080x1920 H.264/AAC is the target, not a promise already proved for all devices.
Unsupported-device handling is explicit, not a silent lower-quality product or
remote upload fallback. Any narrower release support claim needs owner approval.

## Recommended pipeline

```text
Browser runtime and disposable workspace
  File -> local inspection / capability probes -> OPFS source copy
       -> worker audio extraction -> bounded protected transcription request
       <- normalized transcript + integrity receipt -> IndexedDB
       -> bounded protected candidate-analysis request
       <- grounded candidates + integrity receipt -> IndexedDB
       -> local range playback -> exactly one selected candidate
       -> local selected-range scene/face/active-speaker processing
       -> protected visual-plan / optional generated-image requests
       <- bounded assets -> OPFS; immutable manifest -> IndexedDB
       -> shared browser compositor -> read-only preview
       -> Confirm export -> WebCodecs encode + Mediabunny mux -> OPFS output
       -> local validation -> local Blob/File preview and MP4 download

Backend, request scoped
  authentication / CSRF / abuse / atomic process-local admission
  bounded audio or normalized text -> approved provider
  validate bounded result -> response; dispose request buffers
  no original video, final MP4, durable content, object store or media job
```

Choose WebCodecs with Mediabunny for container parsing/muxing and media I/O;
workers own sustained decode/encode/vision work. Prefer a small deterministic
Canvas2D compositor, with WebGL only where measured complexity/performance
justifies it. WebGPU is a possible vision acceleration path, not a requirement
invented for the UI. Use backpressure, bounded queues and explicit frame/audio
resource disposal. Native API presence is insufficient: test actual source
decode and target audio/video encode/mux/playback configurations.
[WebCodecs](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API),
[Mediabunny formats and codec probes](https://mediabunny.dev/guide/supported-formats-and-codecs).

## Evidence and alternatives

These are implementation references, not proof of ClipBuilder's quality, phone
support or measured performance. No dependency/model was installed, benchmark
run, real media read or provider called during this planning pass.

### Maintained local-media pattern

LocalCut is a browser-native reference, explicitly desktop-first and capability
tiered rather than claiming universal codec support. Inspected source revision
`24f3d9489ae8aff24187f03b0b6dbe039b35515b`: its export implementation probes exact
encoder configurations, awaits sample writes, closes decoded resources and
streams muxed output to a file handle; its persistence code uses IndexedDB
transactions. Adapt resource-ownership/probing patterns, not its editor,
publishing, projects or timeline surface. This is source inspection, not an
independent end-to-end validation of that application.
[Project support boundary](https://github.com/shenghaoc/localcut),
[export source](https://github.com/shenghaoc/localcut/blob/24f3d9489ae8aff24187f03b0b6dbe039b35515b/src/engine/export.ts),
[persistence source](https://github.com/shenghaoc/localcut/blob/24f3d9489ae8aff24187f03b0b6dbe039b35515b/src/engine/persistence.ts).

OpenCut's classic IndexedDB adapter was inspected at
`cf5e79e919144200294fb9fed22a222592a0aeea`. It is now archived: useful historical
storage code, not a maintained drop-in dependency or proof of a wholly
database-free application. Its broader app includes backend infrastructure.
Do not copy its schema, permissive casts or request-success-as-commit behavior;
our journal must await transaction completion and reconcile OPFS separately.
[Classic source](https://github.com/OpenCut-app/opencut-classic/blob/cf5e79e919144200294fb9fed22a222592a0aeea/apps/web/src/services/storage/indexeddb-adapter.ts),
[current upstream](https://github.com/OpenCut-app/OpenCut).

### Library choice

Mediabunny supplies the demux/mux domain logic; do not hand-roll MP4/WebM
parsing. Its StreamTarget supports backpressure and offset-addressed chunks:
an MP4 output cannot be built by blindly concatenating chunks that may rewrite
earlier byte regions. Write supplied positions correctly or use a proven
append-only format configuration. Large outputs should not accumulate in a
BufferTarget.
[Output targets](https://mediabunny.dev/guide/writing-media-files).

The inspected Mediabunny source revision is
`0f91fe768e7ee42703f15e2b8845551b0f1028b3`; it is MPL-2.0, not MIT. Native AAC
encoding can be absent. Its AAC extension uses an FFmpeg-derived WASM encoder;
the package manifest declares MPL-2.0, but exact bundled/native build notices
and redistribution obligations still need review. This targeted fallback is
distinct from loading the complete ffmpeg.wasm media pipeline.
[Mediabunny license](https://github.com/Vanilagy/mediabunny/blob/0f91fe768e7ee42703f15e2b8845551b0f1028b3/LICENSE),
[AAC package](https://github.com/Vanilagy/mediabunny/blob/0f91fe768e7ee42703f15e2b8845551b0f1028b3/packages/aac-encoder/package.json),
[AAC extension design](https://mediabunny.dev/guide/extensions/aac-encoder).

ffmpeg.wasm remains a conditional, measured alternative for a narrow missing
capability, not the default 500-MiB/mobile implementation. Its maintainers
describe substantial native-performance differences, greater multi-threaded
resource consumption and a 2-GB input limit. The wrapper's MIT license is not
the license of its FFmpeg core and linked codec libraries. Full file copies,
WASM memory growth and isolation headers require their own proof.
[Official FAQ](https://ffmpegwasm.netlify.app/docs/faq/).

### ScreenPilot reference

Read-only repository inspection: ScreenPilot's frontend
`src/features/session/session-storage.ts` and source-of-truth persistence
section use bounded versioned JSON, validated restore, expiry and owned-key
cleanup for one disposable session. They exclude PDF/media blobs, audio and
credentials, and deliberately do not persist candidate content in IndexedDB.
Reuse lifecycle discipline and single-workspace UI thinking, not its small-text
sessionStorage policy for a 500-MiB recording. This new owner decision permits
browser-local media storage; ScreenPilot is not evidence for video encoding.

## Storage contract

### Ownership and copies

| Data | Owner and lifetime | Recovery / security boundary |
| --- | --- | --- |
| Selected original `File` | Runtime owner; immediate local Blob URL | No explicit full RAM copy; pointer is not refresh persistence |
| Source copy | One OPFS artifact, if preflight/write succeeds | Browser best-effort cache; no IDB/base64 duplicate |
| Workspace journal | Small versioned IndexedDB record | Opaque artifact IDs, epoch, sizes, status, expiry and revisions |
| Transcript / candidates / manifest | Bounded validated IndexedDB JSON | Content stays browser-local except admitted provider requests |
| Extracted audio | Stream or bounded temporary OPFS artifact | Delete after successful transcription unless required by approved local speaker pipeline |
| Generated stills / deterministic cards | Bounded OPFS artifacts | Returned bytes validated; no arbitrary remote URL resolver |
| Final MP4 | OPFS, or separately bounded in-memory Blob fallback | Publish only after encode, flush, mux and validation complete |
| Provider credentials / grant | Backend config / HttpOnly cookie | Never media journal, browser code, localStorage or sessionStorage |
| Cleanup intent | Content-free journal tombstone / legacy bridge | Survives partial cleanup; cannot resurrect content |

No filename is persisted or sent; opaque local names stay in the artifact owner.
The generic downloaded name contains no original title/name. Artifact hashes
may bind local identity/provenance but must not appear in logs/URLs/evidence.
Raw File objects, handles, AbortControllers, workers and Blob URLs stay outside
serialized reducer/contracts. Contracts expose browser-safe values only.

### Quota and memory

Before persistence, calculate `source bytes + audio ceiling + asset ceilings +
output ceiling + bounded scratch + safety reserve`, subtract already-owned
artifacts that can actually be removed, and compare with an origin estimate.
Set those ceilings from the proved media profiles, not a guessed constant or
unbounded bitrate. Do not decode an entire 20-minute source to PCM/video frames
at once. The source-copy and audio pipelines must be incremental; decode video
primarily for selected-range framing/export, not full-source thumbnails.

Best-effort OPFS and IndexedDB share origin quota. Estimates do not reserve
space; handle quota exceptions during each write, storage denial, eviction and
private-browsing behavior. Do not request persistent-storage permission by
default for a disposable demo. Do not promise recovery when origin data was
removed. Site-data clearing can remove all local artifacts.
[Quota and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

OPFS is origin-private, not a cryptographic privacy boundary against same-origin
scripts or someone using the same browser profile. Worker sync handles can
support efficient writes but must close before deletion. No permission prompt
for OPFS is equivalent to approval for AI data transfer.
[OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system).

Fallback: keep one runtime File and a separately bounded output Blob only if
the entire pipeline passes codec/memory preflight. Otherwise block before paid
calls. If source persistence is unavailable, refreshing requires re-selection
and a validated identity match before reusing results; do not match on filename
or let a different source inherit a transcript. No original-video network
fallback and no silent final WebM labeled as MP4.

### Commit journal and cross-tab ownership

IndexedDB transaction completion is the metadata commit point. OPFS writes and
IndexedDB cannot commit atomically together: create an opaque pending artifact,
stream/write/close/validate it, then commit its ready reference. On failure or
crash, journal reconciliation removes incomplete references/files. Do not depend
on universal filesystem rename support for atomic publication.

Use one exclusive Web Lock per workspace where available, plus a monotonic
workspace epoch and BroadcastChannel notification. Notifications do not replace
a lock. Reject stale worker results and other-tab writes after clear/replacement.
If reliable locking is unavailable, fail closed for persisted multi-tab writes;
session-only mode must not corrupt a shared workspace. A browser lock is not a
backend paid-operation lock.
[Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API).

### Lifecycle and physical deletion

Propose two-hour logical expiry without durable history. Sweep on bootstrap,
before operations and while active; time/clock anomalies fail closed. Expiry
does not guarantee disk deletion while the browser is closed. Tab close is not
a reliable asynchronous cleanup event. A later opening reconciles expired and
orphaned owned artifacts. User-cleared site data may make recovery impossible.

Clear/replacement/cancel sequence: commit a cleanup fence, abort requests, stop
new worker output, cooperatively cancel then terminate unresponsive workers,
close codecs/frames/audio/OPFS handles, revoke URLs after consumers release them,
delete every known owned artifact, and retain a bounded content-free tombstone
when deletion is partial. Retry cleanup on next open; never clear unrelated
origin stores. Replacement cleans the prior workspace before publishing a new
one. Canceling one stage must explicitly distinguish discarded temporary work
from a retained valid source; the UI cannot imply complete deletion otherwise.
Downloads already saved by the visitor cannot be revoked by Clear.

## Local media correctness

Candidate playback uses the locally owned source and exact immutable word-based
`startMs/endMs`; player time is range-relative. Seek clamps to that interval,
resets on candidate changes and stops at the end. Decode accurate boundaries
with keyframe pre-roll when needed; a keyframe-only copy is not an exact trim.
Preserve source/output timestamp mappings, rotation, variable frame rate,
audio/video offsets and codec delay. Measure seek tolerance; do not claim sample-
accurate native HTML video seeking before testing it.

Probe actual decoded source audio/video and a small synthetic portrait output
before admitting paid requests, then re-probe if runtime/context changes.
Handle silent/missing audio, corrupted files, unsupported codec/profile/bitdepth,
huge dimensions, decode stalls, GPU/context loss and device pressure. MIME and
extensions alone do not prove supported contents. Validation is locally
authoritative for cooperative UI, not server proof of unseen original bytes.

The compositor consumes only a strict immutable manifest and validated assets.
No model-generated executable JS, HTML, shaders, FFmpeg strings or URLs. Fixed
caption/font layout, focus crop, safe areas, source timing and visual beats are
one shared sampling/render contract. Preview and export cannot independently
implement semantics. Local export closes/flushes codecs and muxer before final
probe/playback validation: dimensions, H.264/AAC, audio presence, finite duration
10-60s, A/V sync, expected sampled pixels/captions and no unapproved extra frames.
Only validated bytes enable Download MP4.

## Active-speaker feasibility, not a hidden downgrade

MediaPipe Face Landmarker detects geometric landmarks. Its video inference is
synchronous and can block the UI; worker integration is necessary. Landmarks
must not be used for sensitive emotion/identity inference. They do not alone
identify which face matches the audible speaker.
[Official web guide](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js).

ONNX Runtime Web provides execution options, but model operators, conversion,
browser provider support and resources need exact proof. An existing Python
Light-ASD script/weights file is not automatically a browser model. CL-006 owns
exportability, licenses, approved weights download, version/hash, synchronized
audio/frame preprocessing and accuracy/runtime comparison. No weights were
downloaded in this pass.
[ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/),
[Light-ASD upstream](https://github.com/Junhua-Liao/Light-ASD).

Actual Light-ASD source was inspected at
`ed38c232de5efe0261dbd68627c0ade7cdfe14eb`. The demo assumes CUDA, S3FD face
detection, scene detection and disk/native-FFmpeg preprocessing, not browser
execution. It normalizes to 25fps face tracks, 16-kHz mono audio and 13 MFCC
coefficients at 25-ms windows/10-ms hops; the model consumes center-cropped
112x112 grayscale faces. Its multi-duration ensemble repeats inference over
1-6 second windows. None of that preprocessing is supplied by WebCodecs.
[Preprocessing source](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/Columbia_test.py).

Concrete unproven candidate: worker-decoded timestamped frames -> bounded
shot/face tracks -> reference-equivalent 25fps face tensors and MFCC audio ->
ONNX inference using the learned audiovisual classifier -> smoothed focus
track. Inspect/export the actual classifier, not only its feature encoders.
The graph has 2D/3D convolution/pooling, reshape/transpose, GRUs, temporal
reversal and GELU; exact export/opset/dynamic-time shapes and runtime kernels
must be tested. Begin with ORT WASM for parity, then consider WebGPU only with
operator and device proof. No operator support or conversion success is assumed.
[Model](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/model/Model.py),
[encoders](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/model/Encoder.py),
[recurrent classifier](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/model/Classifier.py).

Upstream weight metadata lists 4,175,289-byte PyTorch checkpoints; that is not
ONNX download size, tensor working memory or browser runtime cost. Code is MIT;
separate checkpoint/detector terms and redistribution still need verification.
Port MFCC/cropping/alignment with a proven DSP implementation and golden-tensor
tests, not approximate new preprocessing. Replacing S3FD with a browser detector,
quantizing weights, changing sampling or reducing the ensemble requires quality
comparison. Bundle/load an approved immutable model explicitly, never silently
download on import. No weights or dataset were downloaded during this review.
[Code license](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/LICENSE).

Use rights-approved one-person, wide two-speaker alternation, listener motion,
overlap, off-screen audio and hard-cut footage. Evaluate focus correctness,
switch latency, jitter, face loss, memory, thermal behavior and total local
time. If the browser model cannot satisfy the locked requirement, record a
no-go; do not replace it with generic center cropping and call the ticket done.
Remote selected-range video/low-resolution-frame compute is only an explicit
future owner alternative with a new data-transfer contract, not this plan.

## Protected AI without server object storage

### Transport and trust

Use one allowlisted same-origin audio endpoint, bounded binary body and explicit
provider-transfer consent; never use the existing 8-KiB JSON sample proxy for
audio. Send normalized transcript/candidate context through separate bounded
JSON endpoints. Provider endpoints, models and request options are server-owned.
No user remote URL, arbitrary provider option, callback, file upload API or
provider background-job persistence is part of the recommendation.

Deepgram accepts a binary pre-recorded audio request; there is no need for a
public media URL or result bucket. That API transport fact is not a retention
promise. Zero automatic SDK retries and exact call counts still apply.
[Pre-recorded binary transport](https://developers.deepgram.com/docs/pre-recorded-audio).

Audio profile is a **CL-005/006 feasibility gate**, not settled configuration.
16-kHz mono signed-16 PCM for 20 minutes is 38,400,000 bytes plus WAV headers.
That exceeds Cloud Run's documented HTTP/1 32-MiB request ceiling. Streaming
alone does not remove an HTTP/1 request limit. Either prove an end-to-end HTTP/2
route or a compressed profile; never silently split into extra transcription
calls or reduce source duration. Proposed compressed comparison: mono Opus in
WebM/Ogg at a bounded speech bitrate (e.g. 48-64 kbps), a hard received-body cap
below the hosting limit and transcription-quality/timestamp tests. Worst-case
encoded size is enforced, not inferred from nominal bitrate. Exact duration/
packet validation before spend needs a proven parser/decoder and adversarial
tests. The selected format, ceilings and hosting path must be recorded before
CL-007. Supported-format listings alone do not prove this application route.
[Deepgram formats](https://developers.deepgram.com/docs/supported-audio-formats),
[Cloud Run request limits](https://docs.cloud.google.com/run/quotas).

Backend admission cannot trust browser duration, file metadata, transcript IDs
or claimed allowance. Validate received audio bytes, codec/profile, actual
duration and size before dispatch, within bounded memory/CPU. Original video
limits are enforced locally; audio/text limits are independently server-enforced.
Completed backend results can carry an authenticated receipt binding normalized
bundle hash/revision/session/expiry to prevent forged provider provenance on
later requests. Verify the submitted bounded bundle against it; it is not an
atomic spend ledger. Receipt digests remain out of logs and public URLs.

Request-scoped buffering is allowed only with fixed ceilings, capacity
reservation and terminal cleanup; no disk persistence is the initial plan.
Reject unsupported/oversized/truncated bodies without a provider call. Set
ingress/route/provider deadlines from measurements, bounded transfer, request
abort and safe errors. Browser/proxy retries never automatically redispatch
paid work. Returning generated images requires bounded bytes, format/pixel
validation and a browser artifact receipt; no arbitrary image fetch capability.

OpenAI text requests remain foreground with Structured Outputs and `store:
false`. This avoids optional stored response state, not all abuse-monitoring
retention. Do not use background mode/polling as a hidden state store. Deepgram
MIP opt-out and each provider's actual project/data policy need separate proof
and owner disclosure. No "zero retention" or "no data leaves this device" claim.
[OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data),
[Deepgram MIP policy](https://developers.deepgram.com/docs/the-deepgram-model-improvement-partnership-program).

### Coordination recommendation and limits

Use bounded **process-local** admission records, not cookie-only counters:
opaque action nonce + session + action type + normalized request digest +
boot epoch + expiry + reserved/running/completed/uncertain tombstone. Claim
synchronously before any awaited provider dispatch. Reserve capacity before
reading a costly body, validate it, then reserve the paid action exactly once.
Retain terminal records through grant expiry; refuse new grants at capacity
instead of evicting live replay protection. Cookies are authenticated, short-
lived HttpOnly/Secure/SameSite grants, never mutable authoritative counters.
Bind grants to their issuing boot epoch so restart invalidates outstanding work.

Origin/Fetch Metadata/CSRF validation, rights/data consent, session/action
allowance, bounded input, capacity/rate/budget gates and action-bound Turnstile
must all precede spend. Perform cheap rejection first; Turnstile is not an
idempotency store. Counter/rate settings remain backend-only. Bind provenance
receipts to grant identity without storing content. Do not infer per-person
identity or permissions from an anonymous cookie.

After provider dispatch, disconnect/cancel/timeout may remain billable. Mark
uncertain outcomes consumed; do not refund or resubmit automatically. Completed
normalized results should be committed locally before progressing the UI.
If the browser missed a terminal payload, a content-free status cannot recreate
it. A bounded transient response replay buffer would itself hold content and
needs a new explicit retention decision; it is not silently included here.
New user retry requires an explicit allowed action and budget; retries default
off. No failover to fake success in real composition.

**Achievable:** one dispatch per action while its issuing process and retained
record live, bounded per-request inputs/calls, zero automatic retries,
fail-closed restart, cached local success reuse and content-safe diagnostics.
**Not achievable by these controls alone:** global atomicity across replicas,
exactly-once across crashes, durable monthly/per-person accounting, paid-result
recovery after restart, or prevention of fresh anonymous sessions. One configured
Cloud Run instance is not proof that old/new revisions cannot overlap.

Recommendation: implement/test the process-local boundary for controlled
owner-authorized validations. Keep public anonymous paid traffic off until the
owner explicitly accepts a bounded deployment/abuse model backed by verified
provider hard caps, or approves a different coordination architecture. Soft
alerts are not hard caps; if required limits cannot be enforced, do not launch.
No DB/Redis/GCS exception is inferred. CL-012 audits guarantees; CL-015 tests the
actual hosting topology/restart/rollout behavior, not just config text.

## Recovery matrix

| Interruption | Truthful action | Extra paid work |
| --- | --- | --- |
| Refresh after committed local source/results | Reopen journal, validate artifacts/expiry, restore same stage | None |
| Refresh during source copy | Remove/reconcile partial artifact; reselect if no ready source | None |
| Eviction/private storage denial | Explain unavailable recovery; reselect or restart before new consent | Never automatic |
| Refresh during provider request | Treat pending action as uncertain; do not create a new action | None automatically |
| Provider succeeded but payload was lost | Report lost/uncertain result; no fabricated cached success | Explicit owner-approved retry only |
| Backend restart | Existing epoch grants fail closed; local evidence survives if present | Never replay automatically |
| Tab close/background suspension during local encode | Resume validated source/manifest, discard partial MP4; explicit encode retry policy | Zero AI calls |
| Download after validated result | Reuse the same local output | Zero AI calls |
| Clear interrupted / locked file | Cleanup tombstone survives; retry deletion on next active open | Zero AI calls |
| Different source selected / stale worker completes | Increment epoch, fence stale result and clean old artifacts | Never inherit a paid result |

One logical final output does not imply hostile-browser enforcement of download
counts. A failed local encode may retry the same immutable manifest under the
approved local policy; it cannot rerun AI or change the selected range silently.

## Truthful UI and progress

Keep CL-004's shared card, typography/colors, small controls, thin scrollbars,
smooth gallery/preview transitions and glass inline playback controls. No new
multi-screen editor or extra export-confirmation hop. Initial moments remain
portrait previews; transcript/notes appear on preview selection. Actual ranges
play locally; final review keeps video central, notes left, transcript right.
Social teasers stay disabled Soon with no posting/OAuth path.

Local copy percentage is committed bytes / total source bytes, labeled local
preparation rather than upload. Audio transfer progress may be actual sent/
acknowledged bytes only when transport measures that fact; do not claim provider
ingestion from fetch progress. Worker processed samples/frames can supply
measured phase progress; mux/final validation are distinct final phases.
Remote AI waits show elapsed time and an indeterminate activity animation,
not a timer-based measured percentage or invented ETA. Only actual success
finishes to 100%. Fake mode may simulate percentage/stages, remains disclosed
in Privacy & limits and cannot enable download. Do not restore app-level motion
suppression; the existing owner decision and open accessibility gate remain.

## Feasibility gates and owner decisions

| Gate | Owner | Required evidence; currently unchecked |
| --- | --- | --- |
| Foundation media feasibility | CL-005 | Synthetic range playback, incremental storage, exact portrait encode/mux/validate spike; API failure paths |
| Audio transport profile | CL-005/006, deployed proof CL-015 | Full-bound audio extraction/body size/format/duration; hosting limits, no added paid calls |
| Production audio pipeline | CL-006 | Worker throughput, streaming/downmix/resample quality, timestamps, cancellation and memory |
| Active speaker | CL-006 -> CL-008 | Browser model/license/weights/operator feasibility and actual quality go/no-go |
| Composition and MP4 | CL-009/010/011 | Shared parity, fonts/assets, synced H.264/AAC 1080x1920 output, validation and cleanup |
| Local retention/privacy | Owner before real persistence/provider use | Two-hour logical expiry, possible disk survival until next open, off-device audio/text/provider retention |
| Anonymous paid guarantees | Owner + CL-012/015 | Accept bounded process-local limitations or approve new coordination; hard-cap evidence |
| Device/public claims | Owner + CL-013/015 | Measured desktop/mobile/tablet codec, memory, time and thermal results; no silent scope reduction |

CL-005 starts with independently testable synthetic/offline work. Freeze library,
audio profile and local persistence choices only after its spikes. CL-006
cannot claim speaker readiness from a mock. Any core no-go reopens architecture
before later integration, rather than deferring an impossible pipeline to
deployment.

The early media spike is not only a tiny sample: generate an approved synthetic
20-minute source near the 500-MiB ceiling outside Git, separately exercise exact
byte/duration boundaries, extract its complete bounded audio, and export a
60-second 1080x1920 H.264/AAC range with bounded queues/scratch. Include cancel,
reload, background suspension, quota failure and output reopen/playback. Agree
measurable time/memory/responsiveness/A-V-sync/quality thresholds before a go
verdict; record supported physical-device results or leave them pending.
CL-005 proves the essential media route early; CL-011 later productionizes it,
not discovers whether the core local export is possible for the first time.

Record browser/OS/device class, exact dependency/model versions and hashes,
codec configs, fixture class, source bytes/duration/resolution, copy/extract/
encode time, memory observations, responsiveness, output bytes/sync and cleanup.
Include Chromium Windows/laptop, Safari macOS/iOS, Android Chromium and a tablet;
private browsing, denied quota, tab suspension, refresh, two tabs and resource
pressure are separate cases. Automation/emulation is not physical-device proof.
Performance targets must be agreed before benchmark interpretation; no
unmeasured universal speed, RAM or battery claim is authorized here.

## Execution ownership

CL-005's file-level migration is the implementation checklist, not this planning
pass. Later tickets own their existing domain outcomes using the revised
browser execution locations. No implementation, installation, cloud setup,
credential use, paid call, benchmark or Git mutation was performed to produce
this document. Preserve historical CL-004 verification separately from every
new pipeline gate.
