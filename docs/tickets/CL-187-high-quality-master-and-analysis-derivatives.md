# CL-187 — Highest-quality local Codex master with efficient analysis inputs

Status: Authorized and queued, 2026-11-02. Owner AFK authorization lifts the
previous execution hold; use execute/validate/fix loops and local
ticket-prefixed commits without push. Depends on CL-185; coordinate window
clocks with CL-186.

## Owner question and current evidence

Keep the best source for exported clips while avoiding unnecessary large-video
work during transcription and face/camera planning. The current local picker
shows only English 480p–1440p choices. Backend admission reaches SDR 4K for
supported H.264/VP9 formats; other codecs, HDR and frame rates have explicit
restrictions. The source-quality export policy already forbids silent resolution
downgrade.

`apps/renderer/local/codex-media.ts` already extracts audio-only 16 kHz mono
16-bit PCM and samples reduced temporal images for Codex camera planning. This
pipeline does not implement a continuous face tracker over every frame; do not
describe its sampled camera decisions as that capability.

## Proposed implementation packet

Owner clarification: "analysis derivatives" means audio and sufficiently
detailed images derived from the same high-quality master. It never means
downloading a second lower-resolution source, weakening the Codex
model/reasoning, accepting worse framing or rendering exports from low-quality
analysis media.

- For local Codex, offer Highest available quality plus explicit offered tiers,
  including 2160p and higher when the installed safe decode/render path supports
  them. Remove the arbitrary 1440p picker ceiling, not the codec/media-safety
  checks. Preserve explicit audio-language choice and actual format identity.
  Keep Gemini/hosted capacity independent. No hidden lower-tier substitution.
- Audit all available formats and the installed native pipeline before claiming
  unrestricted quality. Record unsupported codecs/HDR/cadence with concrete
  reasons. Add conversion/admission support only with demonstrated native
  parity; retain the original master when a processing derivative is required.
  Do not promise every YouTube representation or silently tone-map/re-encode it.
- Keep the acquired master at the chosen source quality, favoring stream-copy
  acquisition/remux where valid. Native exports read that master, never a
  transcription or preview derivative. Preserve existing export resolution,
  cadence and quality decisions; an edited portrait MP4 is not lossless or a way
  to recover detail absent in the source.
- Decode the selected audio directly into the ASR input; do not download a
  second low-resolution full video merely for transcription. Video pixels do not
  enter the ASR model. Preserve a good source audio track: lower video
  resolution can share the same audio, but degraded audio can reduce transcript
  accuracy.
- Keep bounded visual samples/analysis derivatives separate from export media.
  Compare small/distant/multiple faces and speaker transitions across sample
  sizes; preserve normalized coordinates and exact timestamps. Where reduced
  samples lose relevant detail, use sufficient-resolution crops/master samples
  for the selected clip. Never claim equal face quality without real evidence.
- Measure acquisition, audio extraction, ASR, selected-clip visual sampling and
  export separately. Avoid redundant whole-source transcodes. ASR work depends
  primarily on analyzed audio duration/model/hardware; source size/resolution
  still affects transfer, disk and decode/seek costs. No unsupported speed
  claims.

## File allocation and verification plan

Frontend: `resolution-choices.ts`, acquisition card and tests.
Contracts/backend: format ranking/admission, source profiles and capability
separation. Native: acquisition inspection/remux, `codex-media.ts`, focus
coordinate mapping and export source selection. Docs: source of truth and
affected service/architecture guides. Do not add a new model or continuous
tracker implicitly.

Use fake metadata offers above 1440p, unsupported-format/no-substitution cases,
matching audio identity and zero Gemini fallback. Synthetic current-source
native proof must verify master bytes/stream identity when copied, derivative
clocks, crop coordinates and exported source detail/cadence with a generated
test chart. Fake tests verify call counts and cleanup; actual face accuracy and
two-hour throughput require a separate owner-run comparison. Inspect responsive
quality selection, progress/cancel/retry and footer geometry; run scoped
checks/validate.

## Research and authorization boundary

[whisper.cpp input guidance](https://github.com/ggml-org/whisper.cpp/blob/master/README.md)
documents 16-bit WAV conversion at 16 kHz mono. The master/derivative
architecture is our engineering recommendation, not a claim that downscaling is
harmless to every face. Fake mode needs no keys/models; real Codex needs
prepared CPU speech/ speaker assets and ChatGPT allowance. Bigger ASR models/GPU
acceleration are not implemented or verified here. Gemini needs its key/live
approvals. No assets, weights or real video are downloaded; no
processing/config/restart/cloud/Git work is authorized until execution is
separately requested.
