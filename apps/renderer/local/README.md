# Internal local media worker

CL-145 trims Hook audio at the same rounded native start frame and duration as
Hook video. It cuts directly into the intact body without padding a logical
30-fps audio selection to a longer native video frame, preserving pitch/cadence.
Synthetic proofs check adjacent cut frames and continuous audio at five native
rates/ranges, including one-frame Hooks. Sator is retired from new selection;
its fixed FLAC remains decodable for saved cues.

CL-142 mixes the same fixed recorded FLAC samples used by browser playback.
Catalogue files allow only FLAC demux/codec; normalized uploads and retired
original sounds keep WAV/PCM. Inputs remain fixed private paths with file/pipe
protocols, one decoder thread and owned scratch cleanup. All recordings are
48-kHz stereo and padded to logical frames for matching loop clocks. No runtime
download, provider credential or video-encoding quality change is introduced.

The normal backend starts and drains this loopback-only worker automatically.
There is no separate user-facing application or startup command. Fixed jobs,
private authentication, pinned tools and cancellation boundaries are preserved.
The native child receives fake/paid-off flags and no provider credentials even
when the backend uses real AI. It never dispatches cloud processing.

CL-135 adds fixed local Codex input preparation. In normal local real mode the
backend may admit hash-pinned Windows x64 CPU Whisper tools/model. A speech job
extracts bounded 16-kHz mono audio and normalizes word clocks without invented
speaker labels/confidence; a frame job extracts up to sixty bounded JPEGs. No
Codex/Gemini authentication, provider call or runtime download occurs here.
Private JSON artifacts are bounded, receipt-bound and removed by the caller;
scratch and child processes drain on failure/cancel. Hosted gets no speech model.
Synthetic proofs inject speech output and use actual FFmpeg; real ASR accuracy
is unverified and requires owner review.

See the [local workflow guide](../../../docs/operations/LOCAL_WORKFLOW.md).
Synthetic native proofs use generated media, not retained source masters.

CL-084 adds fixed `clip-preview` jobs using the existing 1080x1920/30fps playback
profile, source/cut binding, measured validation and hash-checked cache. They do
not start Chromium, rasterize art or encode a final export. Explicit `clip` jobs
reuse/ensure that preview for compatibility, then use the unchanged final-render
path below. The worker has no AI key and no new runtime setting.

Final edited/portrait exports use original source pixels and a source-height
portrait canvas (even-pixel codec rounding), preserving native portrait sizes
and the source's nominal frame rate. Variable-rate sources are normalized to
that rate; edit/overlay timestamps retain their logical 30 fps clock. Preview
cuts stay 1080x1920/30 fps and never feed final encoding. The original is cut,
cropped, overlaid and H.264-encoded once at CRF 18; no fixed 8 Mb/s ceiling or
silent resolution downgrade is used to fit capacity. High-resolution overlays
are rasterized at the corresponding pixel density. Source/duration/byte/disk,
decode and cleanup guards remain. See CL-070 for synthetic detail/native-rate
evidence and the separate legacy-path limitation. Real-media visual acceptance
and hosted maximum workload capacity remain owner/release checks.
