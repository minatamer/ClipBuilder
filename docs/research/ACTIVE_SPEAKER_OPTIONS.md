# Active-speaker attribution and automatic reframing options

**Superseded research snapshot:** the latest owner decision selects Google
Gemini plus private Remotion Node/Docker Cloud Run rendering with temporary
private GCS. The [current plan](../architecture/GEMINI_REMOTION_MIGRATION.md)
replaces the local-model/provider recommendations below. Documentation/local
corrections are owner-approved; CL-006 records the current Node foundation.
The following research and local measurements are
preserved as history, not current implementation instructions.

<details><summary>Earlier research, provisional selections and measured evidence</summary>

Research date: 2026-10-02. Owner-requested decision research for [CL-006](../tickets/CL-006-build-media-job-and-speaker-feasibility.md). **Research is complete enough to select the next experiment; speaker implementation, production access and acceptance are unproved.** This report proposes choices, not an architecture amendment.

**Subsequent owner selection, 2026-10-02:** LR-ASD default AVA plus YuNet is now
the provisional local choice. The owner authorized pinned assets/runtime,
complete score export, private local reference and browser parity tests, then
removal of superseded Light-ASD artifacts after verification. The
[ticket's new evidence](../tickets/CL-006-build-media-job-and-speaker-feasibility.md#lr-asd-local-export-and-inference-evidence-2026-10-02)
and [source-of-truth decision](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#09-browser-owned-media-architecture-revision-2026-10-01)
supersede the research-time recommendation to retain Light-ASD as a control.
Native score export and actual ORT WASM tensor inference are measured; labelled
speaker/focus accuracy and the full browser video chain remain unproved. The
comparison and cost assumptions below remain the research snapshot, not results
of a provider trial. Independent review remains stopped at the owner's request.

## Recommendation and confidence

Use a dedicated audiovisual active-speaker model, keep Deepgram for source transcription, and make crop planning a separate deterministic stage. **LR-ASD with a licensed small face detector is the preferred next local candidate under the current browser/privacy contract. NVIDIA Maxine ASD is the strongest verified API finalist to compare against it**, conditional on acceptable production access, price and selected-video transfer terms. Retain the approved Light-ASD checkpoint as a control. Do not continue a large Light-ASD/S3FD port simply because its weights were downloaded.

This recommendation balances the actual constraints: a disposable demo, modest traffic, local video, no GPU service today, and an automatic final edit. LR-ASD has released small weights and stronger published results than Light-ASD; NVIDIA packages an LR-ASD discriminator with detection/tracking, reducing integration work but adding unresolved commercial and privacy dependencies. Neither has been measured on ClipBuilder's footage. Confidence is **moderate in this shortlist, low in a shipping-quality winner**. A production NVIDIA quote plus substantially better measured tracking/mobile completion could put the API first. A successful local export and bounded desktop run would favor LR-ASD. Failed attribution would outweigh either option's low nominal price. [LR-ASD paper](https://junhua-liao.github.io/Junhua-Liao/publications/papers/IJCV_2025.pdf), [NVIDIA model card](https://build.nvidia.com/nvidia/active-speaker-detection/modelcard).

The lower recurring-cost path is browser LR-ASD: no incremental ASD provider bill, but development, model delivery and the visitor's compute remain real costs. Gemini video understanding is a cheap API challenger worth a small future ablation; sparse general-purpose video analysis has not established the temporal precision needed to replace ASD. Deepgram plus OpenAI deserves a concrete test, described below, rather than dismissal based on one model's modalities.

## What must actually be solved

Analyze only the immutable selected 10–60-second range, preserving the source's 15-second–20-minute and 500-MiB limits. Decode with a source-presentation-time map, normalize rotation and retain the audio offset. Detect cuts; create anonymous **shot-local** face tracks; align each track's facial sequence with the same audio; estimate speaking evidence; then associate reliable evidence with diarized voice turns. A global voice label does not authorize carrying a face identity across unrelated shots or videos.

For each voiced interval, ask whether a visible track has synchronized evidence, not whether someone has an open mouth, is central, or appears likely to speak. Confirm associations over several unambiguous turns. Reset visual associations at cuts and re-establish them from audiovisual evidence. Multiple positive tracks can mean overlap; no positive track can mean off-screen speech, tracking failure or uncertainty. Do not force a single winner in either case.

The focus compiler must suppress brief false switches, follow a moving valid face, and produce normalized finite boxes and crop centers. Smooth motion within a shot, cut immediately at an actual camera cut, clamp the 9:16 crop to source geometry, preserve facial headroom and fixed caption safe areas, and evaluate at original resolution. A low-resolution wide shot may not contain enough face detail to enlarge well. Preview and export consume the **same immutable focus track**; a provider's annotated video is not that contract. Existing [focus schemas](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#108-speaker-focus-and-visual-plan-contracts) require complete podcast-footage coverage, so unresolved gaps must fail assembly before a manifest is accepted.

### Three, four and five speakers

`MAX_FACE_TRACKS_PER_SHOT=4` is still configured and specified in the source of truth. It bounds shot-local work; it is not a limit of four anonymous voice labels throughout the entire recording. Three or four simultaneous visible people are within the intended comparison, **not already proved**. Five different people over several shots can fit the limit if each shot stays within four tracks. Five simultaneous faces exceed the present contract. Proposed support would change the bound to five, benchmark detection recall, per-face compute and identity swaps, and update admission/support documentation; this report makes no such change. Selecting the four largest faces would risk discarding the actual speaker.

NVIDIA's `NV_AI4M_ASD_MAX_SPEAKERS` range is 1–5 and explicitly describes **audio speaker streams**, not a measured five-face crop guarantee. Count selected-range voice IDs separately from visible tracks; remap only IDs present in that range while preserving source word references. Sieve's published wrapper defaults to five returned faces but trims by size, another distinction from guaranteed five-person attribution. [NVIDIA configuration](https://docs.nvidia.com/nim/maxine/active-speaker-detection/latest/advanced-usage.html), [Sieve wrapper](https://github.com/sieve-community/fast-asd/blob/a6cab6e92baedf70b1976b856ee7caeb417e604e/main.py).

## Fair comparison of the three paths

| Path | Evidence for the actual task | Remaining local work / deployment | Decision |
| --- | --- | --- | --- |
| Deepgram + local LR-ASD / detector | Trained synchronized facial/audio scoring; released weights | Cuts, detector/tracker, export, inference, attribution, smoothing; browser worker or separately approved server | Local finalist; best fit to current privacy and recurring budget |
| Deepgram + OpenAI frames/transcript | Image interpretation and structured reasoning; no native audio in configured `gpt-6-sol` | Still needs accurate local tracks, time sampling and ambiguity validation; transfers frames | Hypothesis for clear turns, supplement or challenger; no demonstrated ASD accuracy |
| Deepgram + OpenAI Realtime audio/images | Audio and image input supported on other models | Clocked event sequence, local geometry, response reconciliation; new model access and privacy gate | Stronger evidence than text alone, but no synchronized ASD benchmark or frame-box guarantee |
| Deepgram + NVIDIA Maxine ASD | Purpose-built frame-level speaking flags, boxes, face/voice IDs; packaged tracking | Protected gRPC relay, clip encoding, clock validation, shots and final crop compiler | API finalist; production quote/terms/access are gating unknowns |
| NVIDIA speech + NVIDIA ASD | ASR timestamps/diarization available in separate speech components | Replaces two adapters; GPU profiles/access and transcription quality must pass | Second-stage consolidation, not an ASD endpoint that automatically transcribes |
| Replicate community TalkNet | Public endpoint listing and useful wrapper JSON | New key, selected-video upload, local voice association/smoothing; version and terms checks | Backup API experiment; older backbone, little score transparency |
| Sieve fast-asd | Inspectable TalkNet/YOLO orchestration and raw speaking scores | Hosted subfunctions, licensing and current endpoint availability | Useful implementation reference; linked function/pricing URLs returned HTTP 404 in this inspection |
| Gemini 3.8 Flash video | Native audiovisual video understanding, configurable sampling | New provider, upload, local tracks and response validation; no ASD guarantee | Cheap general-model challenger; not yet competitive evidence for precise focus |
| Face detector, diarizer, mouth motion, generic saliency alone | Supplies only one part of the task | Missing synchronized audible-face attribution | Reject as the speaker implementation |

The evidence for provider capabilities and exact output is detailed below. No provider was authenticated or called for inference, so public documentation establishes a capability lead, not account access, latency, reliability or service availability for this owner.

## Local models, artifacts and feasibility

AVA mAP measures ranked speaking/non-speaking face predictions. It is **not the percentage of final clips that crop perfectly**. AVA results still differ in training, pretraining, detectors, ensembles and context. Cross-dataset transfer and in-domain training must not be mixed into a leaderboard. The values below are published measurements, not ClipBuilder measurements.

| Model | Published evidence and size | Artifacts / practical consequence |
| --- | --- | --- |
| Light-ASD, CVPR 2023 | 94.1 AVA validation mAP in LR-ASD's comparison; 1.02M parameters, ~0.63G operations | Approved pinned AVA file locally hash verified; 4,175,289 bytes. Small control; browser conversion remains blocked/unmeasured. [Paper](https://openaccess.thecvf.com/content/CVPR2023/papers/Liao_A_Light_Weight_Model_for_Active_Speaker_Detection_CVPR_2023_paper.pdf) |
| LR-ASD, IJCV 2025 | 94.5 AVA validation; repository checkpoint 94.45; 0.84M / 0.51G | Default AVA checkpoint released inside repository, metadata 3,426,337 bytes. New channel gating, still recurrent temporal context. Best local candidate. [Paper](https://junhua-liao.github.io/Junhua-Liao/publications/papers/IJCV_2025.pdf), [repository](https://github.com/Junhua-Liao/LR-ASD) |
| C³ASD, ECCV 2026 | 93.8 versus matched reproduced Light-ASD 93.6; 1.02M / 0.62G. AVA→WASD 86.1 versus 85.3 | Training consistency improves robustness without added inference architecture; inspected tree/README exposed no released checkpoint. No training/dataset download proposed. [Paper](https://arxiv.org/html/2607.03018), [repository](https://github.com/jisoo-o/C3ASD) |
| ASDnB, IJCB 2025 | Repository reports 94.6 AVA; 2.2M; body+face cues. WASD in-domain 95.6 | AVA/WASD Drive checkpoints linked, not downloaded or independently licensed here. Body detection/association adds work and failure modes. [Repository](https://github.com/Tiago-Roxo/ASDnB), [paper](https://arxiv.org/html/2412.08594v1) |
| TalkNet, ACM MM 2021 | 92.3 AVA validation, 90.8 test; ~15.7M / 1.5G | Released checkpoint links and many wrappers; older CUDA/FFmpeg workflow, heavier attention path. TalkSet-finetuned Columbia results are a different protocol. [Repository](https://github.com/TaoRuijie/TalkNet-ASD) |
| LoCoNet, CVPR 2024 | 95.2 AVA validation; ~34.33M / 4.86G | Multi-person long/short context; linked external weights. Full-repository license not established; nested Apache notices do not license everything. [Paper](https://openaccess.thecvf.com/content/CVPR2024/papers/Wang_LoCoNet_Long-Short_Context_Network_for_Active_Speaker_Detection_CVPR_2024_paper.pdf), [repository](https://github.com/SJTUwxz/LoCoNet_ASD) |
| TalkNCE, ICASSP 2024 | Released LoCoNet-based checkpoint reports 95.5 AVA validation; ~34.3M / 4.9G | Contrastive loss is training work, not necessarily extra runtime loss computation. External weights and native multi-GPU tooling; heavier reference. [Repository](https://github.com/kaistmm/TalkNCE) |
| GateFusion, WACV 2026 | 95.0 AVA; AVA→WASD 88.8 versus Light 86.2 in that paper's protocol | AV-HuBERT Large + Whisper large-v3 encoders, richer fusion; code/checkpoint/export licensing not established in this search. Strong robustness reference, poor small-browser lead. [Author paper and supplement](https://arxiv.org/html/2512.15707v1), [CVF listing](https://openaccess.thecvf.com/content/WACV2026/html/Wang_GateFusion_Hierarchical_Gated_Cross-Modal_Fusion_for_Active_Speaker_Detection_WACV_2026_paper.html) |

C³ASD's reproduced Light result differs from the earlier published 94.1; ASDnB's repository pretraining label conflicts with a later comparison table. Preserve those distinctions rather than invent a normalized ranking. GateFusion's supplement reports model-only preprocessed inference on an L40S, including 1.25-GB peak allocation for LR-ASD and 3.35 GB for GateFusion in its test. Neither is browser memory or raw-video throughput. Its CVF body fetch failed; the actual content inspected was the author arXiv version and supplement. [C³ASD comparison](https://arxiv.org/html/2607.03018), [GateFusion supplement](https://arxiv.org/html/2512.15707v1).

### Source pins and license confidence

Public GitHub metadata and relevant source were inspected, without executing upstream code. The dates below are last commits on the inspected branch, not evidence of production support. All listed repositories were non-archived at inspection. Root MIT is a useful code-license lead, **not independent approval of every externally linked weight, training dataset or redistribution arrangement**.

| Repository | Inspected commit | Last commit / root license |
| --- | --- | --- |
| Light-ASD | `ed38c232de5efe0261dbd68627c0ade7cdfe14eb` | Previously pinned control / MIT |
| LR-ASD | `1b6dcd2d8fc2895683de6508ec6294ec47d388ca` | 2025-03-23 / MIT |
| C3ASD | `95fabed8d3481959bfe8a5286b5752d7cd887e3e` | 2026-07-01 / MIT |
| ASDnB | `3ead9627a8a2f86b45ec03e663b21ef879839596` | 2026-06-26 / MIT |
| TalkNet-ASD | `6d6821479af485e251c4991487e40573b42181b4` | 2023-10-23 / MIT |
| LoCoNet_ASD | `68d90c83fde956d60245d0715bbd18e9e5fd3bae` | 2023-05-01 / root license unverified |
| TalkNCE | `429599621c864620dfe4b223b95ecb3d11b4b244` | 2025-04-30 / MIT |

LR-ASD's default checkpoint Git blob is `d724be582f6d34f1b099657235dedafa0668fd82`, **not a content SHA-256**. Its byte count is remotely inspected metadata; no new model asset was downloaded. Pin notices and obtain an actual file hash before a newly authorized comparison. The older Python/Torch guides and unpinned dependencies in these research repositories imply substantial packaging/testing work; they are not maintained browser distributions.

### Detector and execution choices

| Detector | License/artifact evidence | Tradeoff |
| --- | --- | --- |
| S3FD | Upstream-linked external checkpoint terms remain unverified | Keeps the original reference detector, but large native preprocessing and unresolved weight terms; no download approved by inference alone |
| OpenCV YuNet | Model directory expressly MIT; `face_detection_yunet_2023mar.onnx` LFS metadata 232,589 bytes | Preferred small licensed comparison. Needs browser tensor decoding/NMS and tiny/profile/occluded-face recall tests. [Model directory](https://github.com/opencv/opencv_zoo/tree/47534e27c9851bb1128ccc0102f1145e27f23f98/models/face_detection_yunet) |
| MediaPipe Face Detector | Official web packaging/worker guidance; exact downloaded task/weight terms and hashes not inspected | Credible browser detector alternative; full-range/tiny-face recall and total WASM/task download must be measured. [Web guide](https://developers.google.com/edge/mediapipe/solutions/vision/face_detector/web_js) |
| InsightFace SCRFD | Code MIT; supplied pretrained models generally noncommercial research under upstream terms | Do not infer weight permission from code MIT. NVIDIA's packaged SCRFD has its own governing artifact terms. [Upstream notice](https://github.com/deepinsight/insightface) |

YuNet's published LFS content SHA-256 is `8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4`; no local rehash/download occurred. The tree also has a newer model, which requires its own comparison rather than automatic substitution.

LR-ASD source retains 16-kHz/13-MFCC preprocessing, 25-fps gray 112×112 facial input, recurrent time reversal and a learned classifier. Export the actual inference score head and reference ensemble, not just embeddings. Start with exact floating-point ONNX/WASM parity; GRU, Conv3D, pooling, reshape and reversal support must pass for the pinned opset/shapes. WebGPU requires a separate provider-kernel test. Quantization, detector replacement and reduced ensemble can lower cost but can change near-threshold decisions; accept only measured quality parity. [Pinned classifier](https://github.com/Junhua-Liao/LR-ASD/blob/1b6dcd2d8fc2895683de6508ec6294ec47d388ca/model/Classifier.py), [ORT web](https://onnxruntime.ai/docs/get-started/with-javascript/web.html).

A six-second 25-fps Float32 face input alone occupies `150×112×112×4 = 7,526,400` bytes (~7.18 MiB). Three/four/five faces need ~21.5/28.7/35.9 MiB just for those inputs, before activations, models, decoder surfaces and runtime buffers. Processing whole clips at once wastes memory. Use bounded windows and dispose frames. Small checkpoints do not prove total downloads, thermal behavior or acceptable phone performance; WASM availability does not prove a phone codec/inference combination.

Browser execution avoids incremental ASD API fees and video transfer, but phones may be throttled or unsupported. Server CPU is a credible development/comparison alternative with no GPU idle cost, requiring an actual multi-face runtime benchmark. GPU inference simplifies native dependencies but introduces model loading, image size, GPU billing and service maintenance. The current PyTorch `WinError 4551` occurs before export; obtain a permitted conversion runtime without changing Windows security policy. It says nothing about LR-ASD's eventual browser quality.

## Existing Deepgram + OpenAI: concrete hypothesis

Deepgram supplies word times and anonymous speaker IDs. Existing `.env.example` configures Nova-3 English and `diarize=true`; keys are blank and real account access was not inspected. Current docs distinguish legacy diarization v1 from batch v2 through `diarize_model`; pin and evaluate that future adapter choice rather than silently changing it. [Diarization documentation](https://developers.deepgram.com/docs/diarization).

`gpt-6-sol` supports text and image input, not audio/video. A proposed experiment uses a local detector/tracker at 25 fps, a 640-pixel-wide full-frame sequence at 2 fps plus 224-pixel face crops labeled only with local track IDs, cut markers, timestamps and selected-range diarized words. Send one bounded 10-second window per request, at most six baseline requests; a one-second context overlap is an optional measured refinement with additional tokens. Use an 8-fps ablation to test brief turns. Do not infer named identity, gender or expected voice from appearance. [Model modalities](https://developers.openai.com/api/docs/models/gpt-6-sol).

Require bounded response intervals `{startMs,endMs,shotId,voiceId,faceTrackId|null,status,evidenceFrameTimes,confidenceBucket}`. Status distinguishes matched, overlap, off-screen and uncertain. Validate every time, enum and reference; never accept model-created tracks/word times. Associate a voice to a track only after consistent evidence within the shot; contradictory turns invalidate the association. Keep geometry from the local tracker. An easy close-up with one visible speaker may be sufficient; three-to-five-person wide shots, silent lip motion and off-screen audio are a much harder hypothesis. Confidence prose/buckets are not calibrated probabilities: assess held-out precision and permit unknowns.

This can supplement shot interpretation or screen candidate feasibility. It does not yet replace dedicated ASD: 2-fps imagery can miss rapid mouth changes, text omits acoustic synchronization, and precise localization is a documented vision limitation. [Vision limitations](https://developers.openai.com/api/docs/guides/images-vision).

The wider OpenAI API can accept more evidence: `gpt-realtime-2` and `gpt-realtime` support image input alongside audio. A separate trial would feed clocked selected audio chunks and timestamped images, disable conversational turn-triggered early answers, request text decisions after each window, and reconcile them into the same schema. This requires actual event/timing tests; conversational capability does not promise frame-level ASD or precise boxes. Model access may differ even with the same provider key. Neither approach has been run here. [Realtime image input](https://developers.openai.com/api/docs/guides/realtime-conversations), [Realtime-2 modalities/pricing](https://developers.openai.com/api/docs/models/gpt-realtime-2).

Both send previously local visual content to a provider and need a privacy decision. `store=false` is not zero retention: default OpenAI abuse-monitoring retention can include customer content for up to 30 days, with eligibility/exception rules for stronger controls. [Data controls](https://developers.openai.com/api/docs/guides/your-data).

## Hosted APIs and consolidation

### NVIDIA Maxine ASD

The current public client has a gRPC protocol, not merely a rendered-video demo. Supply H.264 MP4 with embedded supported audio or separate PCM WAV/MP3/Opus, plus diarization. The catalog API advertises a 500-MB limit; this is decimal and not permission to upload the 500-MiB original. Only a bounded selected clip would be proposed. Streamable MP4 can begin inference early; transactional mode copies complete files to temporary disk. Diarization must precede first inference. [Basic inference](https://docs.nvidia.com/nim/maxine/active-speaker-detection/latest/basic-inference.html), [catalog API](https://build.nvidia.com/nvidia/active-speaker-detection/api).

The inspected [protocol](https://github.com/NVIDIA-Maxine/nim-clients/blob/d02b7d57541b8598ac4c057947b10b2e42ccb1ee/active-speaker-detection/protos/proto/nvidia/ai4m/activespeakerdetection/v1/activespeakerdetection.proto) returns `frame_id` and per-face box, `face_id`, `diarized_speaker_id`, `is_speaking` and **face-detection** confidence. It exposes no ASD probability/raw score and no presentation timestamp. Validate frame IDs against the exact transmitted CFR/PTS map. A threshold and voice-activity smoothing configuration exist; face confidence must not be relabeled speaking confidence. Strip provider/session identifiers from content logs.

One documentation inconsistency matters: the README suggests audio/diarization can be omitted for a quick preview, but pinned [config code](https://github.com/NVIDIA-Maxine/nim-clients/blob/d02b7d57541b8598ac4c057947b10b2e42ccb1ee/active-speaker-detection/scripts/config.py) requires diarization with custom video; bundled defaults only match bundled samples. The service docs warn missing initial diarization can produce incorrect output. There is no verified automatic transcription promise. Proposed Deepgram integration converts selected word boundaries to clip-relative **integer milliseconds** in protobuf segments, preserving anonymous ID mapping and handling null/overlap labels explicitly. The JSON sample's seconds are parser input, not proto units.

The model card reports an LR-ASD discriminator (0.84M; 94.44 AVA validation), plus SCRFD detection and a much larger AdaFace embedding component. Therefore the full service is not a 3.4-MB model. Verify whether cross-shot embeddings can be limited to disposable permitted tracking; the current contract forbids raw face embeddings/identity labels in results and authorizes no named or cross-session recognition. GPU/Linux/NVDEC/Triton dependencies and concurrency limits remain. Cold model load is excluded from any warm-speed expectation. [Model card](https://build.nvidia.com/nvidia/active-speaker-detection/modelcard), [support matrix](https://docs.nvidia.com/nim/maxine/active-speaker-detection/latest/support-matrix.html), [concurrency configuration](https://docs.nvidia.com/nim/maxine/active-speaker-detection/latest/advanced-usage.html).

Hosted NVCF preview requires a new NGC key and assigned function ID; Deepgram/OpenAI keys cannot authenticate it. No production per-clip price, applicable SLA/rate quota or owner entitlement was verified. Container/runtime terms, model terms and hosted trial terms differ. Newer NIM/Certified Feature Branch offerings can be free under their terms, while Certified Production Branch requires Enterprise; that LLM/VLM documentation does not establish which offer governs Maxine ASD. Obtain the exact offering and quote. The generic $4,500/GPU/year or approximately $1/GPU/hour Enterprise FAQ is **not an ASD hosted price**. [Offering distinctions](https://docs.nvidia.com/nim/large-language-models/latest/day-0/index.html), [Maxine governing terms](https://docs.nvidia.com/nim/maxine/active-speaker-detection/latest/eula.html), [general FAQ](https://docs.api.nvidia.com/nim/docs/product).

The [hosted trial terms](https://assets.ngc.nvidia.com/products/api-catalog/legal/NVIDIA%20API%20Trial%20Terms%20of%20Service.pdf) permit internal evaluation, require separate production arrangements, allow content use to improve AI, and restrict personal/sensitive data absent express permission. Do not upload private reference footage or promise two-hour provider deletion under those terms. A production agreement could differ; it must be reviewed rather than inferred from “Free Endpoint.”

### Can NVIDIA replace Deepgram too?

Yes, NVIDIA speech products have ASR, word timing and diarization capabilities. They are separate from ASD. Current speech NIM profiles include offline Parakeet English + Sortformer; Riva's older offline diarization guide describes non-overlapping speech. Endpoint fields alone do not establish a supported hosted combination or good overlapping-speech results. Evaluate word error, word timing, speaker error and downstream focus before replacing Deepgram. [ASR overview](https://docs.nvidia.com/deeplearning/riva/user-guide/docs/asr/asr-overview.html), [speech API](https://docs.nvidia.com/nim/speech/latest/reference/api-references/asr/realtime-asr.html).

The current profile table lists Parakeet 1.1B CTC English offline/Silero/Sortformer at 12.82-GB GPU and 2.917-GB host memory in its specified batch configuration; its all-mode profile needs 47.22-GB GPU memory, exceeding one 24-GB L4. Profile selection matters. A separate speech deployment/key entitlement and verified production price are still missing. Keep Deepgram first to avoid changing the transcription baseline and visual attribution simultaneously. [Profile matrix](https://docs.nvidia.com/nim/speech/latest/reference/support-matrix/asr.html), [release notes](https://docs.nvidia.com/nim/speech/latest/about/release-notes.html).

### Replicate, Sieve and general video APIs

Replicate's community `zsxkib/talknet-asd` is listed at approximately $0.024/run, typically 109 seconds on T4, varying with input. Linked [wrapper source](https://github.com/zsxkib/TalkNet-ASD/blob/61a6dd3f6e496a2b989c58b766f6808fc097bdab/predict.py) returns optional JSON with frame-indexed face IDs, boxes and speaking booleans, not only video. It uses TalkSet weights and a zero raw-score threshold but does not expose raw scores or diarized voice IDs. Verify the deployed version/schema/timebase rather than assuming linked source equals deployed code. New credentials and transfer approval are required. API prediction input/output/log data is removed after an hour by default, while web-created predictions persist indefinitely; that is not a blanket subprocessor deletion guarantee. [Endpoint](https://replicate.com/zsxkib/talknet-asd), [retention](https://replicate.com/docs/topics/predictions/data-retention).

Sieve's source remains useful, but its README-linked function and pricing URLs returned HTTP 404 through direct public requests on the research date. Its March 2026 founder post describes a shift from video APIs to supplying multimodal datasets. This supports treating the old wrapper as a historical reference; it does not establish a current public ASD service or platform-wide shutdown. [Sieve's current account](https://sieve.ai/blog/reintro).

Gemini 3.8 Flash is a current generic video alternative: static sampling defaults to 1 fps, with configurable rate and agentic navigation. Native audio/video is stronger evidence than a transcript, but neither timestamps nor scene descriptions prove synchronized face attribution; keep local geometry and use the same validation. Files API defaults to 48-hour retention, and paid/free data-use terms differ. [Gemini video](https://ai.google.dev/gemini-api/docs/video-understanding), [files](https://ai.google.dev/gemini-api/docs/files), [pricing/data use](https://ai.google.dev/gemini-api/docs/pricing).

## Lessons from real implementations

| Inspected implementation | Documented architecture and lesson | Maintenance / reuse boundary |
| --- | --- | --- |
| Light-ASD reference demo | Scene cuts → S3FD tracks → aligned MFCC/face windows → learned scores → smoothed boxes. Provides a numerical control, not a final crop product. [Pinned demo](https://github.com/Junhua-Liao/Light-ASD/blob/ed38c232de5efe0261dbd68627c0ade7cdfe14eb/Columbia_test.py) | Research Python/FFmpeg pipeline; keep preprocessing/head parity, review detector terms |
| ClipsAI | Pyannote turns + scene changes → MTCNN → spatial K-means → largest mouth-motion group → segment crop. No motion falls back to the most sampled face; this can choose a listener/off-screen mismatch. [Resizer](https://github.com/ClipsAI/clipsai/blob/8e73c8adc112c745b84ec240f11a91457bfd3141/clipsai/resize/resizer.py) | MIT, last inspected commit 2024-01-17. Useful segment/cut architecture; mouth heuristic and average segment boxes do not meet our motion/attribution proof |
| Sieve fast-asd | Parallel scene/YOLO face stages and TalkNet subfunctions; sparse face detection/interpolation, raw speaking scores, area-limited outputs. Retries can reach ten attempts. [Wrapper](https://github.com/sieve-community/fast-asd/blob/a6cab6e92baedf70b1976b856ee7caeb417e604e/main.py) | MIT wrapper, last commit 2024-05-29; YOLO/model/service terms separate. Reuse bounded-stage ideas, not automatic retries, logging or claimed production readiness |
| Replicate TalkNet wrapper | Detector/tracks + audiovisual TalkNet → frame JSON / annotated media; useful geometry, no voice labels or exposed margin. [Predictor](https://github.com/zsxkib/TalkNet-ASD/blob/61a6dd3f6e496a2b989c58b766f6808fc097bdab/predict.py) | MIT code, last commit 2024-05-01; external checkpoints still need terms; endpoint listing is not maintenance/SLA proof |
| MediaPipe AutoFlip | Shot boundaries + face/object salient regions → fused signals → scene cropping/path solver. Graph contains no audio/ASD attribution. [Graph](https://github.com/google-ai-edge/mediapipe/blob/b453bf83fed4eb220051b3d45bf0b54cadbb7910/mediapipe/examples/desktop/autoflip/autoflip_graph.pbtxt), [path options](https://github.com/google-ai-edge/mediapipe/blob/b453bf83fed4eb220051b3d45bf0b54cadbb7910/mediapipe/examples/desktop/autoflip/calculators/scene_cropping_calculator.proto) | Apache-2.0, parent repo active 2026-10-02; native graph isn't a turnkey browser module. Reuse hold/pan/smoothing concepts after ASD |
| NVIDIA NIM client | Chunked video/audio/diarization gRPC → frame speaker metadata; client overlays boxes. Crop/export remains downstream. [Client](https://github.com/NVIDIA-Maxine/nim-clients/tree/d02b7d57541b8598ac4c057947b10b2e42ccb1ee/active-speaker-detection) | MIT client, last commit 2026-10-01; runtime/models/service terms separate; current schema is useful but compatibility with hosted deployment must pass |

No inspected project supplies a public, matched cost-per-correct-portrait benchmark for this demo. Closed-source clipping products' marketing does not establish their internal models, shot policies or costs; no such internals are inferred here. These implementations show why synchronized scoring, identity stability, switch policy and crop path must be tested independently.

## Costs: published rates and calculated scenarios

All prices below are **USD**, checked 2026-10-02, excluding tax and negotiated discounts. Moment selection, contextual visual planning/generation, admission and browser export are common costs outside this incremental speaking-face comparison. Transcribe the full source once; visually analyze only the selected clip. No retry is authorized by these estimates.

### Full-source transcription

[Deepgram prerecorded Nova-3 monolingual PAYG](https://deepgram.com/pricing) is **$0.0043/source-minute (0.43 cents)**. Prerecorded diarization is included. The $0.0020/min diarization surcharge belongs to streaming, not this batch path.

| Source | One session USD / cents | 10 sessions USD | 100 sessions USD | 1,000 sessions USD |
| --- | --- | --- | --- | --- |
| 3 min | $0.0129 / 1.29¢ | $0.129 | $1.29 | $12.90 |
| 10 min | $0.0430 / 4.30¢ | $0.430 | $4.30 | $43.00 |
| 20 min | $0.0860 / 8.60¢ | $0.860 | $8.60 | $86.00 |

### Incremental visual cost and speaker scaling

OpenAI `gpt-6-sol` Standard lists $2/M input and $10/M output tokens. **Illustration, not an image-token quote:** assume 300 billable input tokens per supplied image/crop, 2 fps, one full frame plus P face crops, 2,000 text input tokens and 500 total billable output tokens per 10-second request. Then `N=2D(1+P)`, `R=ceil(D/10)` and estimated visual cost is `0.0006N + 0.009R`. Actual model/detail image sizing and reasoning output must be checked against usage; the current general vision table does not specify this configured model's exact image-sizing rule. [Model prices](https://developers.openai.com/api/docs/models/gpt-6-sol), [image sizing](https://developers.openai.com/api/docs/guides/images-vision).

| Visible faces P | 10s: images / requests / USD (cents) | 30s: images / requests / USD (cents) | 60s: images / requests / USD (cents) |
| --- | --- | --- | --- |
| 3 | 80 / 1 / $0.057 (5.7¢) | 240 / 3 / $0.171 (17.1¢) | 480 / 6 / $0.342 (34.2¢) |
| 4 | 100 / 1 / $0.069 (6.9¢) | 300 / 3 / $0.207 (20.7¢) | 600 / 6 / $0.414 (41.4¢) |
| 5, proposed only | 120 / 1 / $0.081 (8.1¢) | 360 / 3 / $0.243 (24.3¢) | 720 / 6 / $0.486 (48.6¢) |

At four faces/60 seconds, 100 rather than 300 image tokens gives $0.174; 1,000 gives $1.254. At 8 fps with the 300-token assumption, the same clip is $1.494; re-sent overlap/context costs more. This can be expensive relative to a small trained model without proving better quality. Realtime-2 lists $4/M text input, $24/M text output, $32/M audio input, $64/M audio output and $5/M image input. For any measured usage, calculate those streams separately; avoid generated audio for this task. These are not fixed ASD-per-minute prices. [Realtime pricing](https://developers.openai.com/api/docs/models/gpt-realtime-2).

Gemini 3.8 Flash currently lists $0.75/M input and $3.75/M output through 2026-12-31, doubling from 2027-01-01. An illustrative static high-resolution 1-fps request uses ~300 video tokens/second, plus 2,000 prompt and 1,000 output/thinking tokens: visual totals **$0.0075/$0.0120/$0.01875** for 10/30/60 seconds. Metadata, higher fps, navigation/thinking and retries add cost. Cheap sparse sampling must earn the same attribution thresholds. [Pricing](https://ai.google.dev/gemini-api/docs/pricing), [video token calculation](https://ai.google.dev/gemini-api/docs/video-understanding).

Replicate T4 is $0.000225/GPU-second; its endpoint's 109-second example implies ~$0.024525, consistent with the rounded ~$0.024 listing. **It does not specify a 60-second input or five-person test**, so multiplying a video duration by this example would invent a rate. NVIDIA hosted ASD/ASR production prices and Sieve current prices remain unverified; show them as unknown, not zero. [Replicate hardware pricing](https://replicate.com/pricing), [endpoint example](https://replicate.com/zsxkib/talknet-asd).

For a separately approved Cloud Run L4 service, Iowa instance-based list rates are $0.000018/vCPU-second, $0.000002/GiB-second and $0.0001867/L4-second without zonal redundancy. Minimum L4 resources are 4 vCPU and 16 GiB: **$0.0002907/billed-second**. GPU services require instance-based billing: the **whole instance lifetime** is charged, with a **60-second minimum**. Illustrative one-second-compute-per-video-second plus 20 seconds initialization gives 30/50/80 seconds of work for 10/30/60-second clips. Even assuming immediate termination, billed time is at least 60/60/80 seconds: **$0.017442/$0.017442/$0.023256**. Post-request idle/shutdown lifetime can add cost; warm reuse can amortize initialization/minimums across requests. Neither runtime, lifetime nor NIM-on-Cloud-Run compatibility has been measured. [Rates and billing minimum](https://cloud.google.com/run/pricing), [GPU constraints](https://docs.cloud.google.com/run/docs/configuring/services/gpu?hl=en).

60/180/300 billed seconds instead cost $0.017442/$0.052326/$0.087210. A continuously provisioned minimum instance at that rate costs ~$753.49 over 30 days before software licensing; scale-to-zero trades idle cost for cold starts. Image registry, startup/model download, traffic, storage, license/support minimums and concurrent-face runtime all matter. Add an Enterprise fee only if the exact offering requires it; no generic fee is assumed in the table.

### Nine source/selection combinations

Calculated totals below add Deepgram once to incremental visual analysis. Browser cost excludes model delivery/device energy; OpenAI uses the four-face assumptions above; GPU uses the illustrative minimum-lifetime/initialization/runtime assumptions, **not a NVIDIA service quote or actual autoscaled service bill**. NVIDIA/Replicate totals are `Deepgram + actual measured/quoted ASD charge` until input-specific evidence exists.

| Source / clip | Browser ASD USD (cents), before delivery | OpenAI hypothesis USD (cents) | GPU infrastructure hypothesis USD (cents), before license/network |
| --- | --- | --- | --- |
| 3 min / 10s | $0.0129 (1.29¢) | $0.0819 (8.19¢) | $0.030342 (3.0342¢) |
| 3 min / 30s | $0.0129 (1.29¢) | $0.2199 (21.99¢) | $0.030342 (3.0342¢) |
| 3 min / 60s | $0.0129 (1.29¢) | $0.4269 (42.69¢) | $0.036156 (3.6156¢) |
| 10 min / 10s | $0.0430 (4.30¢) | $0.1120 (11.20¢) | $0.060442 (6.0442¢) |
| 10 min / 30s | $0.0430 (4.30¢) | $0.2500 (25.00¢) | $0.060442 (6.0442¢) |
| 10 min / 60s | $0.0430 (4.30¢) | $0.4570 (45.70¢) | $0.066256 (6.6256¢) |
| 20 min / 10s | $0.0860 (8.60¢) | $0.1550 (15.50¢) | $0.103442 (10.3442¢) |
| 20 min / 30s | $0.0860 (8.60¢) | $0.2930 (29.30¢) | $0.103442 (10.3442¢) |
| 20 min / 60s | $0.0860 (8.60¢) | $0.5000 (50.00¢) | $0.109256 (10.9256¢) |

For the representative 10-minute/30-second session, 10/100/1,000 sessions cost **$0.43/$4.30/$43 browser**, **$2.50/$25/$250 OpenAI hypothesis**, or **$0.60442/$6.0442/$60.442 GPU minimum-lifetime infrastructure hypothesis**. Gemini's illustrative equivalent is $0.055/session, or $0.55/$5.50/$55; low price does not establish quality. Other volumes follow `sessions × (0.0043×sourceMinutes + visualCost)`.

Browser delivery example: a hypothetical 20-MiB complete visual bundle, one cold download/session and no cache hits means ~0.195/1.953/19.531 GiB at 10/100/1,000 sessions; charge the actual host's egress rate. This is not a measured bundle size. Selected-video uploads similarly incur bytes, preparation time and possible relay egress; avoid uploading the whole original. Cost per successful correct clip is `total incurred cost / accepted correctly framed clips`; 80% success increases per-success cost 25%, with failures still billed. One extra paid attempt can roughly double affected visual cost and is not the current zero-retry policy.

## Proposed integration and decisive validation

### Concrete next architecture

Keep existing intake/workspace, timestamped audio extraction, MFCC kernel, protected Deepgram adapter plan and immutable selected range. Add a worker-owned selected-range shot/detector/tracker stage, bounded LR-ASD windows, reference score reconciliation, voice-to-track evidence and a deterministic focus compiler. Detector/ASD assets load only through validated pinned descriptors with byte/hash limits and license notices. Persist only permitted geometry/focus records; discard facial crops, audio working buffers and temporary model inputs. Extend production preview/export through the same manifest in later tickets, not a parallel crop implementation.

If NVIDIA wins, the proposed change is a new protected selected-video request and request-scoped gRPC relay. Browser prepares bounded H.264 media and a CFR/PTS map; backend validates immutable range/provenance, bytes, codec, diarized segments and admission; adapter returns only validated normalized geometry/flags mapped to local shot tracks. Reject missing/duplicate frames, malformed boxes, out-of-range voice IDs and incompatible service versions. Keep crop smoothing/render local. Define deadlines, cooperative cancellation, remote deletion limitations and exact maximum call count; SDK automatic retries remain zero. This requires source-of-truth/privacy/spend updates first. A self-hosted GPU adds a new media-processing service and operational scope; it cannot silently become the existing request-only backend.

A boolean-only API cannot fill `speakingProbability` with face confidence or a fictional calibrated probability. Establish supported score output or propose a reviewed schema change and calibration strategy; otherwise fail the compatibility gate. Do not copy upstream filenames/content logs, retry loops, shell wrappers or cross-shot embeddings into the application.

### Smallest useful experiment, then broader evaluation

First obtain exact LR-ASD/YuNet asset terms and a permitted export runtime, plus NVIDIA production/evaluation terms and quote before any approved upload. Run **the same 12 labeled selected clips** through local LR-ASD and NVIDIA: approved reference, one-face, alternating wide shot, listener motion, cut/motion, three/four-person shots, and overlap/off-screen/occluded/offset failures. Five simultaneous faces are an explicitly proposed stress case, not supported scope. Use the same fixed Deepgram transcript to isolate visual differences; no ASR replacement in this comparison. If provider media approval is absent, complete the local experiment first and keep the hosted side pending.

Expand finalists to at least 30 representative rights-approved 10–60-second clips, separating calibration and held-out evaluation. Include clean speakers, short interruptions, laughter, similar voices, tiny/profile/occluded faces, split screens, background speech, cuts, VFR, rotation and audiovisual offset. Test five different speakers across compliant shots separately. Human labels identify anonymous tracks, audible/visible speech intervals and unknown/overlap; retain media/labels privately and publish aggregates only. Thirty clips screen feasibility, not a statistical guarantee for arbitrary footage.

Compare common preprocessing/detector conditions where possible; separately compare each full packaged pipeline, because NVIDIA's detector/tracker is part of its practical advantage. Measure selected-range decode→focus time, cold/warm load, per-face scaling, request transfer/queue/parse, retries and cleanup; record actual token/byte/billed-time usage. Test the desktop browser and an actual intended phone if obtainable. Responsive viewport checks cannot supply phone inference, battery, thermal or browser codec evidence. Reuse the synthetic 20-minute/near-500-MiB source to verify bounded range extraction without analyzing all its video.

The following are **proposed experiment thresholds for owner agreement**, not changed acceptance requirements or completed tests:

| Area | Proposed measurable threshold |
| --- | --- |
| Attribution / coverage | ≥95% correct eligible visible single-speaker duration, counting unknown as incorrect for this metric; ≥99% precision among selected face intervals; ≥90% clips complete automatically |
| Wrong-person crop | No continuous wrong-face crop >500 ms; no severe >1-second wrong crop in any accepted edit; report all failure-class counts |
| Switch / jitter | Switch delay p95 ≤300 ms, max 500 ms; cut reset within two 25-fps frames; ≤1 spurious focus switch per 60s |
| Off-screen / overlap | ≤1% false visible-speaker selection during off-screen intervals; overlap explicitly unresolved unless valid multi-person framing is separately approved |
| Viewing quality | Correct face fully visible with headroom/safe areas in ≥99% labeled frames; stationary-face crop-center jitter p95 ≤2% of source width; human review of moving crops and final 9:16 edit |
| Numerical/time parity | Proposed model-score max absolute 1e-4 / relative 1e-3 and ≥99.9% decision agreement away from threshold; alignment p95 ≤40 ms / max 80 ms; existing MFCC tolerance remains 0.00002 |
| Browser resources | Proposed new visual assets ≤32 MiB, incremental working memory ≤256 MiB; 60s clip focus p95 ≤30s desktop / ≤60s intended phone; heartbeat p95 ≤100 ms / max 250 ms; cooperative cancel ≤1s |
| Hosted time / cost | 60s focus p95 ≤30s warm / ≤60s cold including transfer/queue; incremental ASD ≤$0.10/selected clip under actual production terms |

Smooth hysteresis and minimum evidence duration must be calibrated to those metrics, not arbitrarily hardcoded from a paper. During brief score instability, holding a still-valid track for a proposed ≤300 ms can prevent flicker; it must not invent a speaking claim. If off-screen speech, ambiguous overlap or a lost face prevents complete valid coverage, fail the existing assembly with the selected moment preserved. Existing retry/sample/clear behavior applies. Generic center cropping, manual crop repair or an automatic remote fallback cannot satisfy this gate.

### What is proven, and what requires authorization

Without keys, existing worker decode/extraction and the standalone MFCC kernel perform real computation; 17 MFCC tests and actual worker comparison of 8,281 synthetic coefficients passed. Approved local reference extraction/cancel/retry/cleanup and all five root gates (362 unit tests) are recorded in CL-006. Fake mode's public AI journey simulates results; it does not prove speaker inference. No new audiovisual inference, phone run or provider experiment was performed for this report.

Local ASD needs licensed approved assets, permitted conversion and measured operator/full-pipeline parity, but no provider keys. New LR-ASD/YuNet downloads are not implied by approval for the pinned Light-ASD control. Real Deepgram/OpenAI need owner keys, live flags and their existing ticket/privacy/spend gates. NVIDIA/Replicate/Gemini additionally need new provider access and a decision authorizing selected video/frames to leave the browser. Rights for local reference testing do not imply upload or redistribution rights. Production retention, terms, price, quota, schema stability and failure behavior remain explicit blockers for hosted selection. Ticket 6 and CL-008 remain unaccepted until the chosen path passes its actual quality and runtime gates.

</details>
