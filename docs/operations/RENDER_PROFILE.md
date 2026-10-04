# Fixed final MP4 profile

CL-011 implements one explicit Confirm export against the signed, frozen
selected assembly. Rendering and delivery make zero AI calls. This is a
locally verified code profile, not measured native or deployed output evidence.

- One contiguous 10–60 second cut; fixed composition shared with browser Player.
- 1080 × 1920, 30 fps, H.264, yuv420p with BT.709 limited range, square pixels, AAC 48 kHz, 160 kbps,
  CRF 20, JPEG composition frames at quality 80, concurrency 2.
- Pinned image bundle, browser and binaries; no runtime downloads, arbitrary
  commands, paths, composition IDs or remote assets accepted from the browser.
- At most 200 MiB output; 2 GiB owned scratch; one renderer job at a time;
  session/deadline bounded work; explicit process-tree and scratch cleanup.
- Validate stream types/codecs, geometry/fps/pixel aspect, near-zero start,
  expected video/audio/container duration within 100 ms, and 48 kHz mono/stereo.
  Decode first/middle/final representative frames and bounded whole audio before
  upload/publication; failure deletes owned samples and prevents delivery.
- Publish exactly one opaque private generation, delete source and proxies before
  success, then expose receipt-checked single Range playback/download streams.
  Output expires at the earlier of ten minutes and session expiry. Independent
  cleanup runs every fifteen minutes; Clear cancels/drains owned work/streams.
- Browser checks one decoded 1080 × 1920 frame and duration before enabling
  Download MP4. A download request is not proof of saving; retries use existing
  output and never dispatch another render or AI request. Downloaded copies are
  outside application deletion control.

`FAKE_MODE=true` with no keys runs fixture UI (download disabled) and synthetic
injected admission/job/storage/stream tests. Those artifacts are mock bytes,
not valid MP4 evidence. Real rendering requires the implemented source/assembly
flow, provider keys and live flags, `LIVE_RENDER_ENABLED=true`, paid/transfer
and independent cloud spend approvals, private caller/storage setup, and the
applicable rights/license approvals. All committed/test defaults remain off.
No local AI model or weights are used.

The 2026-10-04 rollout check found that JPEG composition frames with Remotion's
default color space produced `yuvj420p`, which the approved `yuv420p` profile
correctly rejected. The fixed worker now selects `colorSpace: "bt709"`; the
pinned renderer maps this to limited-range conversion and metadata. This uses
the supported [renderMedia color-space option](https://www.remotion.dev/docs/renderer/render-media#colorspace),
with no arbitrary FFmpeg override or weaker output validation. Synthetic native
and Linux-image results are recorded in CL-007 after their checks pass.

The packaged FFmpeg has no raw `s16le` output muxer. Whole-audio validation
therefore writes a temporary PCM WAV, verifies its bounded RIFF/chunk structure,
mono 16 kHz/16-bit format and decoded sample duration, then deletes it in
`finally`. Final delivery remains MP4/AAC. The stale native-proof calls now pass
the required FFmpeg argument to the same production validator.

Still unchecked: native full-fixture decoding/rendering, representative pixel
and caption parity, VFR/rotation/audio-offset cases, audible A/V sync and quality,
maximum 20-minute/500-MiB source and 60-second output performance/memory, browser
and device download behavior, licensed fonts/assets, numerical spend evidence,
actual image/deployed runtime and cleanup. Supplying keys alone does not satisfy
these gates. CL-013/014/015 retain their measured quality/release checkpoints.
