# Browser media and third-party software readiness

Status: Mediabunny installed; conditional Windows spike recorded; broader proof pending<br>
Last synchronized: 2026-10-01<br>
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
production mode or public support claim. LocalCut/Light-ASD remain research only.

Light-ASD's actual demo uses CUDA/S3FD/native preprocessing. Its model's
2D/3D convolution/pooling, GRU/reversal/GELU and learned classifier need exact
export/opset/kernel proof. Its MFCC/crop/timing/ensemble behavior must be
golden-tested, not guessed. Upstream ~4.18MB checkpoint metadata is not converted
model size or peak memory. Code MIT alone does not settle checkpoint/detector
distribution. Approve download/source/license/hash and browser serving before
assets arrive; never download on import/startup/per request.

Native tools may be approved for offline reference parity only. Their existing
`FFMPEG_PATH/FFPROBE_PATH/PYTHON_PATH/ACTIVE_SPEAKER_*` executable/model example
values were retired in CL-005; not an instruction to install a server media
stack or fill paths now. Browser capability/model configuration is public only
when deliberately safe; keys/backend origin/host identities remain private.

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
