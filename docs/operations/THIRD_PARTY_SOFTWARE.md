# Google and Node media software readiness

Current [cloud migration](../architecture/GEMINI_REMOTION_MIGRATION.md) replaces browser final export/LR-ASD/ORT and Deepgram/OpenAI requirements. Owner-approved implementation uses standard Remotion renderer/bundler/remotion/player **4.0.532**. @remotion/cloudrun is not selected. Windows Node synthetic SSR/proxy/cancellation is proved in CL-006. Chrome Headless Shell **149.0.7790.0** was prepared explicitly at tooling time; no runtime download is allowed. Media processing uses matching compositor FFmpeg/FFprobe; an already approved full FFmpeg creates synthetic proof fixtures only.

The approved correction removed @remotion/media/web-renderer and the abandoned browser export directories, moved the fixed layout to packages/composition and retained useful Mediabunny intake/audio foundations. Server @google/genai is **2.25.0**: 2.26.0 failed the unchanged minimum-release-age policy. Storage **8.2.0** and google-auth-library **11.1.0** remain server-only. Supply-chain verification and locked installation passed; Google/protobuf install scripts stay disabled.

The Dockerfile pins official node:22-bookworm-slim manifest
`sha256:43ac6c60b8f89723f746e8a92ce91abd5017e627ce1ddfe4238355d3a30b772c`.
Its verified Linux x64 image bakes tools and records binary hashes/resolved
Debian packages inside the image. Font/codec notices and redistribution
eligibility retain their release gate.
The first approved Linux build compiled/bundled/staged tools but failed its final
production import check. Portable workspace packaging was corrected and verified
locally. The separately authorized retry passed production imports, bundle,
binary hashes and executable versions as the unprivileged user in 104.45 seconds;
Artifact Registry's immutable digest matched the build result. Exact evidence is
in [CL-006](../tickets/CL-006-build-media-job-and-speaker-feasibility.md#separately-authorized-corrected-image-retry--2026-10-02).
Release eligibility and complete notices remain unchecked.
The production-only local package assembly/import proof passed without starting
a service or using credentials. Docker is unavailable on the current Windows
host; use the separately authorized Cloud Build path, not an alpha renderer SDK.

Owner confirmed applicable Remotion Node/SSR license coverage for the private
checkpoint on 2026-10-02. Operational telemetry and complete font/codec/
redistribution notices retain release verification; do not carry the abandoned
mandatory browser telemetry claim into the Node product. Tests intercept
telemetry and have no network/credentials. Fake AI and cloud compute are separate:
the corrected Linux image passed actual synthetic render/scratch/native process
cancellation plus runtime imports/tool checks. The rights-confirmed 2:45 private
source passed cloud upload/proxy/render/audio/layout/cancel/independent deletion
under CL-006. The build fixture uses Node PNG/PCM with the pinned minimal Linux
compositor; no new decoder/dependency was installed. Live AI quality, public
sample rights and public deployment remain unproved.

<details><summary>Earlier software/tool/model evidence — historical where superseded</summary>

# Browser media and third-party software readiness

## Current owner stack — 2026-10-02

Google SDK @google/genai 2.26.0 stays server-only. remotion/@remotion/player/@remotion/media/@remotion/web-renderer are pinned together at 4.0.532. Installed Remotion media/renderer use Mediabunny 1.56.1 internally; application source admission retains 1.61.0. These versions coexist and require actual codec/cross-path verification. Model-specific LR-ASD/YuNet/ORT/MFCC/Python product tools are retired; their below evidence is history. No paid/image call is implied. New dependency scripts are explicitly denied; original release-age policy is preserved. Remotion licensing and mandatory operational telemetry are documented in the [migration contract](../architecture/GEMINI_REMOTION_MIGRATION.md); ordinary tests intercept telemetry.

Earlier provider/model records below are historical where superseded.


Status: Mediabunny installed; conditional Windows spike recorded; broader proof pending<br>
Last synchronized: 2026-10-02<br>
Setup owner: CL-004A; foundation owner: CL-005; pipelines: CL-006/008/009/010/011<br>
Actual hosting/setup/model delivery proof: final CL-015

## Current scope and safety

[Source of truth section 0.9](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#09-browser-owned-media-architecture-revision-2026-10-01)
and [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md) supersede the
former native-server media inventory. Original video/final MP4 stay browser
owned; no media bucket, cloud job or server FFmpeg/Python request pipeline.

This guide authorizes no installation, model download, license acceptance,
private media read, provider call, cloud setup, registry push or process restart.
Read only committed examples, never ignored secrets. Keep source/video/audio/
assets/output/weights outside Git; research source inspection is not execution
or redistribution approval. Fake tests remain offline and zero-spend.

## Inventory and ownership

| Dependency | Current purpose | Owner and required proof |
| --- | --- | --- |
| Node.js/Corepack/pnpm, Next/React/Express/Zod | Existing workspace and protected API | CL-001; root engine/manager pins and dependency direction |
| WebCodecs | Browser decode/encode | CL-005 actual codec/config/output spike; CL-006/011 production proof |
| Mediabunny | Proven container/media I/O and mux/demux | CL-005 chooses/pins after spike; MPL-2.0, not MIT |
| OPFS/IndexedDB/Web Locks/workers | Binary artifacts, journal, exclusive ownership and processing | CL-005 quota/eviction/transactions/orphans/multi-tab/cleanup proof |
| Canvas2D/OffscreenCanvas; conditional WebGL | Shared immutable compositor | CL-009/010 parity; CL-011 output pixels/timing |
| Conditional Mediabunny AAC WASM extension | Missing native AAC encode | CL-005/011 exact package/core/build notices, support/time/memory; not blanket fallback |
| ONNX Runtime Web / candidate browser face and audiovisual model | Selected-range active-speaker inference | CL-006 operator/preprocessing/weights/license/quality go; CL-008 production |
| MathJax/card rasterization and licensed fonts | Exact deterministic cards/fixed captions | CL-009/010/011 strict subset/sanitization/layout/output parity |
| OpenAI/Deepgram SDK or narrow transport | Protected request-scoped AI, backend only | CL-007/009 exact limits/retention/options/zero retry; no durable payload store |
| ffmpeg.wasm | Conditional narrow alternative only | Explicit benchmark/license/isolation decision; not default mobile/full-source pipeline |
| Native FFmpeg/ffprobe/Python/PyTorch | Optional approved offline model/reference comparison | CL-006 only when justified/authorized; not deployed browser media execution |
| Hosting CLI/registry/secrets/identities | Frontend/private protected API delivery | Final CL-015; no content bucket/media job or service-account JSON |

Models, fonts, WASM and codec builds have their own terms; a package license is
not a conclusion that every bundled artifact can be redistributed. No paid
vision API, generative video, stock subscription or hosted render service is
needed. CL-013 may select a separately approved local film-authoring dependency;
do not add it to the visitor processing path.

## Existing toolchain checks

Current root engines are `^22.13.0 || ^24.0.0`, manager `pnpm@11.19.0`.
Read the actual package manifest before any change. Read-only checks:

```powershell
node --version
corepack --version
corepack pnpm --version
```

Corepack/install may download code and requires the appropriate permission.
An authorized first-time install uses `corepack pnpm install --frozen-lockfile`;
do not run it during documentation review. No new media dependency was installed
or lockfile changed by this architecture planning pass.

## Browser runtime selection procedure

1. CL-005 inspects exact upstream versions/APIs/licenses/build inputs and obtains
   permission for packages/codec/model downloads before adding dependencies.
2. Start with WebCodecs/Mediabunny/worker pipeline; probe actual input decode and
   portrait H.264/AAC encode/mux/reopen playback. Do not confuse supported
   containers with runtime encoders. Use incremental OPFS output and backpressure.
3. Before a go verdict, exercise synthetic 20min/near-500MiB source import/audio
   and a 60s 1080x1920 export with bounded resources; agree time/memory/sync/
   responsiveness thresholds first. Record the measured desktop-browser runtime.
4. Select the bounded protected audio format with quality/duration/body proof.
   16kHz mono16 PCM20min is 38.4MB plus header, beyond Cloud Run HTTP/1's 32MiB:
   prove HTTP/2 or a compressed route; never silently add paid transcription calls.
5. If native AAC is unavailable, assess the narrow AAC extension and exact WASM
   build/dependency notices. Do not load broad ffmpeg.wasm without measured
   necessity, resource bounds and an approved license/isolation decision.
6. CL-006 separately proves active-speaker model conversion/operator support,
   reference-equivalent MFCC/face preprocessing and quality. ONNX support or
   face landmarks alone is not a go verdict. CL-008 uses only that proved path.
7. CL-009/010/011 prove exact fonts/cards/shared compositor and validated MP4;
   no arbitrary executable model output or external remote-font dependency.
8. CL-013/015 verify actual device/browser and deployed worker/model/header
   delivery; no server CPU benchmark stands in for browser performance.

Unsupported capability fails before paid work. Memory-only fallback needs full
bounded output viability; no silent remote media/upload/render fallback.

## Models, source and licensing evidence

The detailed research document records inspected source revisions:
Mediabunny `0f91fe768e7ee42703f15e2b8845551b0f1028b3`,
LocalCut `24f3d9489ae8aff24187f03b0b6dbe039b35515b`,
Light-ASD `ed38c232de5efe0261dbd68627c0ade7cdfe14eb`.
These were research snapshots. CL-005 subsequently approved and installed
`mediabunny@1.61.0` (MPL-2.0, matching the recorded upstream manifest), with
MIT type dependencies `@types/dom-webcodecs@0.1.13` and
`@types/dom-mediacapture-transform@0.1.12`. No third-party source was modified.
Native AAC was available on the measured Windows in-app Chromium laptop; no
AAC WASM, FFmpeg or model was installed. The
[synthetic harness](../../apps/frontend/feasibility/browser-media/README.md) and
[CL-005 record](../tickets/CL-005-implement-secure-upload-and-storage.md#phase-1-execution-evidence-2026-10-01)
own exact commands, licenses, full-bound timings/memory scopes/AAC presentation
fix and remaining storage/transport gates. Two-hour disposable retention
is owner-approved and the local intake/journal foundation is implemented. This changes no
production mode or public support claim. At that CL-005 snapshot, LocalCut and
Light-ASD were research only; later approved CL-006 work is recorded below.

Light-ASD's actual demo uses CUDA/S3FD/native preprocessing. Its model's
2D/3D convolution/pooling, GRU/reversal/GELU and learned classifier need exact
export/opset/kernel proof. Its MFCC/crop/timing/ensemble behavior must be
golden-tested, not guessed. Upstream ~4.18MB checkpoint metadata is not converted
model size or peak memory. Code MIT alone does not settle checkpoint/detector
distribution. Approve download/source/license/hash and browser serving before
assets arrive; never download on import/startup/per request.

The [CL-006 preflight](../tickets/CL-006-build-media-job-and-speaker-feasibility.md#execution-preflight-2026-10-02)
rechecked the pinned source only. The final learned score head is `lossAV.FC`
in `loss.py`, outside `ASD_Model`; the demo-reference inference uses its class-1
logit. Any approved export must include that head and verify complete inference
checkpoint keys/shapes. The owner confirmed CL-005's local validation/handoff
on 2026-10-02 and authorized continued CL-006 audio implementation.
The owner subsequently supplied real reference media and approved private local
testing; its decode/extraction evidence is in CL-006. Detector/checkpoint terms,
redistribution rights, conversion and model browser parity remain unchecked.
The later specific owner approval covers licensed local checkpoint/toolchain
work, with the actual result below; there is no measured speaker go/no-go.

### Approved CL-006 local tooling and MFCC proof

**Historical Light-ASD phase.** The LR-ASD section below supersedes its asset,
tooling-policy and inference status. Original measurements/hashes remain
evidence; the superseded local Light-ASD tree is now removed.

The default AVA checkpoint at the pinned Light-ASD revision is now privately
present: 4,175,289 bytes, SHA-256
`d44bc3ea7baa8e0946fa3921311714a630ed8b90a1928fab0dbe30d918909317`.
The pinned Git blob matched. Its root MIT notice was retained for the approved
private comparison; public checkpoint/detector redistribution remains a gate.
The linked detector sources/external checkpoint did not supply verified terms
in this pass, so no detector, alternate weights or dataset was downloaded.

An isolated Python 3.12.14 temporary environment outside Git installed
`torch==2.14.1+cpu`, `numpy==2.5.3`, `scipy==1.18.1`,
`python_speech_features==0.6`, `onnx==1.23.1`, `onnxruntime==1.30.0` and
`opencv-python-headless==5.0.0.93`. Primary package-license metadata was inspected;
installed notices remain local and bundled-artifact distribution stays unverified.
These are offline tools, not application dependencies. The conversion-dependency
install report retains exact download hashes and resolved dependencies.
PyTorch native import fails with WinError 4551: Windows Application Control
blocks `torch_global_deps.dll`, including the tool's escalated run. No security
policy was changed. No checkpoint keys, converted graph, model size/operator
parity or ORT WASM inference result is claimed. A permitted conversion runtime
would unlock export, while detector terms, crop/model parity and quality remain.
ORT Web 1.30.0 registry/MIT metadata was read; its browser package is not installed.

The retired speaker reference guide recorded explicit offline generation and
versions; its evidence is preserved in [CL-006](../tickets/CL-006-build-media-job-and-speaker-feasibility.md).
James Lyons's
[python_speech_features 0.6](https://pypi.org/project/python_speech_features/0.6/)
is MIT; its source-distribution SHA-256 is
`a0aebf746464bc929dc3162cb369d7ff967c398c5120ddf5fb40a65f01b92b11`.
No third-party source is vendored. The new bounded browser MFCC kernel matched
all 8,281 independently generated synthetic coefficients in the actual worker;
its 600-frame window took 32.38 ms with 31,200 output bytes. Unit tests consume
committed synthetic goldens without Python, weights or network. This is exact
numerical preprocessing proof, not speech/focus/model quality approval.
With fake mode/no API keys local audio/MFCC processing is real; the AI workflow
is fixtures. Full local speaker AI still needs verified detector/conversion/
browser inference. Real providers need keys/live flags and their approvals.

CL-006 now uses the already-pinned Mediabunny/native browser codecs for
incremental production audio extraction and decoded-result validation. Its
provisional WebM/Opus profile is mono 16-kHz input at 64 kbps with the shared
16-MiB cap; the local PCM/WAV comparison is 16-kHz signed 16-bit mono. Opus may
decode at 48 kHz. The [synthetic harness guide](../../apps/frontend/feasibility/browser-media/README.md#production-audio-checks-cl-006)
documents actual-module comparison, partial quota failure and cancellation.
Synthetic pulse checks and the real-reference numerical alignment diagnostic do
not approve perceptual speech quality, provider transfer/retention or hosting.
With `FAKE_MODE=true` and no API keys, native worker audio is real local processing,
while the AI journey is fixtures. The approved AVA checkpoint is privately hash
verified and CPU tooling is installed; PyTorch import is policy-blocked. Detector
terms, model conversion and browser inference remain unverified. Local speaker
AI would need no provider key. Real provider analysis needs keys, enabled live
flags and its approvals. The earlier audio-only pass installed no package/tool
or model; the subsequent approved offline tooling is recorded above. No AAC WASM
fallback or production model runtime was installed.

Native tools may be approved for offline reference parity only. Their existing
`FFMPEG_PATH/FFPROBE_PATH/PYTHON_PATH/ACTIVE_SPEAKER_*` executable/model example
values were retired in CL-005; not an instruction to install a server media
stack or fill paths now. Browser capability/model configuration is public only
when deliberately safe; keys/backend origin/host identities remain private.

### LR-ASD provisional local probe (2026-10-02)

The owner selected LR-ASD default AVA + small MIT YuNet provisionally and
approved pinned local assets, score conversion, private local reference/browser
checks and verified obsolete-model cleanup. The owner manually changed host
policy; PyTorch now imports. The agent made no security change. Earlier
Light-ASD/policy-block records above are history, not current blockers.

| Artifact | Exact provenance and bytes | SHA-256 / notices |
| --- | --- | --- |
| LR-ASD released default AVA | [Revision `1b6dcd2d8fc2895683de6508ec6294ec47d388ca`](https://github.com/Junhua-Liao/LR-ASD/tree/1b6dcd2d8fc2895683de6508ec6294ec47d388ca); 3,426,337 | `85e6c77fc981595234790d1e128ebb60352d37726b2445e0ef8891e2512fe9e3`; upstream MIT states code/weights, retained privately. |
| Complete score ONNX | OpSet 17, 3,369,760 | `176b05e5d43c1673007e0a4a06345994bdb0d6cc468926aeb9ea5adcaa6cafc5`; strict 168-key load including score head; raw logit. |
| YuNet released 2023mar | [OpenCV Zoo `47534e27c9851bb1128ccc0102f1145e27f23f98`](https://github.com/opencv/opencv_zoo/tree/47534e27c9851bb1128ccc0102f1145e27f23f98/models/face_detection_yunet); 232,589 | `8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4`; published LFS hash/MIT model-directory notice retained. |
| ORT Web tarball | 1.30.0 registry package, 33,106,585 | `d2228df7e4616bc3348bf504ee888f3bec43789a273f0a63f3e68d203ce3bf71`; registry SHA-512 also matched. |
| ORT WASM bundle JS | 73,054 | `11e64bd8ffe11bd1a2a2f0d6275fdfbbba7262f0b76b99b53d228a8a22ef3d90` |
| ORT WASM glue JS | 24,381 | `e13f7f94fc51b4ca72b12faeb1ee95f4ace6dfbc8939bc718aabdc0a27c4299b` |
| ORT WASM binary | 14,239,897 | `3398c10d07d229bd91b364548e130e0e51a8e5704b88c7c083ebbeb78842dee2` |
| Offline imageio-ffmpeg | 0.6.0 Windows x64 wheel, 31,246,824 | `02fa47c83703c37df6bfe4896aab339013f62bf02c5ebf2dce6da56af04ffc0a`; BSD-2-Clause wrapper. |
| Offline FFmpeg executable | 7.1 essentials build | `2ce797a0f88d7f067180338fb227f7b1928ea727bd9a4d7a1d022f7c52af71a3`; exact binary reports GPL-3.0-or-later; retained license output, not a browser dependency. |

Private browser-delivered model/runtime bytes total 17,939,681. No model/runtime
is committed or an application dependency yet. Microsoft's pinned
[MIT license](https://github.com/microsoft/onnxruntime/blob/v1.30.0/LICENSE)
and [component notices](https://github.com/microsoft/onnxruntime/blob/v1.30.0/ThirdPartyNotices.txt)
are retained; public delivery must retain applicable notices/source obligations.
The isolated shared CPU reference versions above remain; only the offline
imageio-ffmpeg decoder was added. No S3FD weights were obtained. Verified
replacement cleanup removed the obsolete private Light-ASD checkpoint/source/
detector/model metadata, preserving its license/provenance/history and shared
audio/MFCC/PyTorch/numeric tooling.

Native original/ONNX and actual one-thread ORT WASM scores passed on synthetic
dynamic lengths and a private processed window; all 150 rounded ensemble
scores matched across 16 distinct-duration calls. YuNet's twelve outputs and
Float32 box/integer-NMS decode also matched. These establish kernel parity.
YuNet/HSV/raw crops differ from upstream S3FD/PySceneDetect/JPEG/XVID, and full
browser video/crop/track/PTS parity, labelled focus quality, multi-face browser
completion and peak memory/resource acceptance remain open. The 60-second
native probe and browser aggregate/cancel/retry timings are in the
[CL-006 packet](../tickets/CL-006-build-media-job-and-speaker-feasibility.md#lr-asd-local-export-and-inference-evidence-2026-10-02).
No provider call, upload, cloud change, public runtime delivery or deployment
was performed. Deepgram/OpenAI and fake/off gates remain unchanged. The private
probe uses fixed loopback GET assets, no-store/COOP/COEP/local CSP; its processes,
tab and media derivatives were cleaned. Independent review remains stopped.

## Runtime configuration and headers

Keep fake/off defaults and feature-specific fail-closed gates. CL-005 migrates
schema/example/tests/public capability meanings together. The initial planning
pass made no code changes; the subsequent local foundation now implements that
migration. Read `.env.example` only;
the owner populates valid matching blanks manually after implementation.

Worker URLs/WASM/model assets/fonts must have exact origin/cache/integrity/CSP
ownership. SharedArrayBuffer/multi-thread WASM may require COOP/COEP; do not
enable them indiscriminately or break Turnstile/third-party assets. A single
threaded bounded path is preferable when sufficient. Actual headers/hosting
transport are CL-015 evidence, not inferred from library examples.

## Readiness record

- [ ] Installation/download route authorized; exact runtime versions recorded.
- [ ] Code/package/WASM/core/model/weights/font rights and notices reviewed.
- [ ] Real source decode and target H.264/AAC output probe performed.
- [ ] Full-bound source/audio/60s export time/memory/sync/cleanup gates met.
- [ ] OPFS quota/denial/eviction/private mode/multi-tab/journal failures tested.
- [ ] Browser active-speaker conversion/preprocessing/quality go documented.
- [ ] Cards/fonts/preview-export parity and validated output proven.
- [ ] Actual desktop/phone/tablet results and unsupported states recorded.
- [ ] Deployed model/worker/codec/header/audio transport proof completed in CL-015.

A missing binary is not a reason to install the old server stack. An unsupported
codec/model/kernel, resource failure or quality no-go reopens the owning
architecture choice; do not rent a GPU, call a remote renderer or reduce limits
silently. Exact executable verification commands arrive with the owning real
module. No placeholder folders/scripts are required by this inventory.

## Primary references

- [WebCodecs](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API).
- [Mediabunny codecs](https://mediabunny.dev/guide/supported-formats-and-codecs),
  [output streaming](https://mediabunny.dev/guide/writing-media-files),
  [AAC extension](https://mediabunny.dev/guide/extensions/aac-encoder).
- [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system).
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/).
- [Light-ASD](https://github.com/Junhua-Liao/Light-ASD).
- [ffmpeg.wasm caveats](https://ffmpegwasm.netlify.app/docs/faq/).
- [Backend configuration](../../apps/backend/README.md) and
  [frontend configuration](../../apps/frontend/README.md).

</details>
