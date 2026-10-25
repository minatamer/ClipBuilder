# CL-070 — Export resolution and avoidable quality-loss audit

Status: implemented in the normal shared editor/native export path; synthetic
verification passes. Owner real-media acceptance and hosted/Linux capacity
verification remain manual. The separate retired renderer is unchanged.

Execution authorization — 2026-10-25: the owner requests execute/validate loops
for the editor and explicitly includes this quality correction: preserve video
resolution/detail as far as portrait reframing allows. CL-069 is now complete
locally; execute this packet next. The audit below is baseline evidence, not
the desired final behavior. No Git mutation, paid/cloud test or deployment.

Implementation policy: use a source-quality portrait canvas based on upright
source height, rounding dimensions upward to even codec-compatible pixels.
Already portrait 9:16 sources keep their dimensions; landscape is intentionally
cropped to portrait rather than kept at its original landscape width. Preserve
source frame rate for final exports while retaining the established 30 fps
logical edit/caption clock. Zoom can still enlarge a selected region; no output
policy can create absent source detail. Do not impose a 1080p/30 fps downgrade.
The owner clarified that exports must **always stay vertical** and that vertical
videos can differ in quality. This policy preserves available source detail;
it does not export landscape or infer new spend/release approval.

## Execution plan and acceptance

1. Add a renderer-local export-profile module and focused tests for source-aware
   dimensions/rate, safe physical frame counts and mapping accepted virtual crop
   rectangles to upright original pixels. Keep saved focus schemas/coordinates
   and the automatic compiler unchanged. Account for the actual even-rounded
   scale/pad rectangle of existing cached previews when projecting old framing.
2. Keep the cached 1080x1920/30 fps cut as a preview-only artifact. Edited final
   exports read/verify the original source, normalize its clock, cut and crop it
   directly, scale once to the output canvas, overlay and encode once. Re-export
   never takes a previous output or an AI proxy as its source.
3. Use a single high-quality H.264 encode (CRF 18), without the old fixed 8 Mb/s
   ceiling; preserve byte/duration/disk/cancel limits and fail at capacity instead
   of silently lowering resolution. Encode audio directly from the original,
   retaining existing normalization. Scale lossless overlay PNGs to the final
   canvas; retain the logical 30 fps caption/picture timestamps.
4. Separate preview-cut preparation from portrait-only final export. Both final
   native export routes use the same source-quality profile and validator. Keep
   old focusless framing readable; no change to source acquisition, downloads,
   saved-output copies, provider settings or FFmpeg binaries/security decision.
5. Extend actual native proofs with fine-detail 4K landscape, native portrait
   and 60 fps samples, original/cache integrity and repeated export. Verify
   decoded detail against the old intermediate path and frames at focus cuts;
   distinguish real local rendering from zero paid/provider dispatches. Keep
   the older standalone renderer outside the normal shared editor's correction;
   its separately recorded audit finding must not be marked fixed implicitly.
6. Run focused media/profile/contract checks, native and shared hosted-shaped
   editor proof, types/lint/format and read-only validate/fix until no actionable
   findings remain. Rebuild the current worker and perform verified backend-only
   reload, preserving frontend, saved media, private logs and configuration.

Expected files: `apps/renderer/local/export-profile.ts` + tests, `media.ts`,
`focus-filter.ts`, `clip-render.ts`; current native/detail proofs under `test/`;
only affected media expectations/service guides and source-of-truth/ticket/index
evidence. No new service or user-facing quality settings. Old saved outputs stay
immutable; only a new explicit export uses the corrected quality path.

- [x] Final MP4 is cropped from original pixels and encoded once; preview/AI
      reductions never feed final export.
- [x] Native portrait dimensions and source-height portrait/native-rate output
      are verified; output bounds/rounding and logical/native clock conversions
      work for 24/30/60 fps and fractional frame-rate inputs.
- [x] Accepted focus/zoom/caption/picture/filter timing and source starts retain
      parity, including non-whole-second cuts and legacy focusless drafts.
- [x] Fine-detail synthetic proof demonstrates retained detail, with unchanged
      original/cache bytes, fresh revision output and real cancel/temp cleanup.
- [x] Current-source native/shared hosted-shaped proofs, relevant tests and
      types/lint/format pass with fake/paid-off/no-network/no ignored env reads.
- [x] Final read-only validation has no actionable findings; current worker is
      rebuilt/reloaded and normal app readiness verified without paid processing.
- [ ] Owner real-media visual acceptance and actual hosted/Linux capacity remain
      manual/unverified; no deploy, provider spend or Git mutation.

## Execution and validation — 2026-10-25

Changed renderer files: `export-profile.ts` and its tests own the bounded
source-height canvas, physical/native frame conversion and original-pixel crop
projection; `media.ts` separates preview cuts from final portrait exports;
`focus-filter.ts` maps accepted framing directly to original pixels;
`clip-render.ts` verifies and renders the original source rather than the cache;
`rasterize-overlay.ts` captures lossless overlays at native output density.
Final video uses one H.264 CRF 18 encode without the old fixed bitrate ceiling;
audio is encoded directly from the original. Existing bounds, revisions,
source binding, cancellation and cleanup remain. No FFmpeg binary change.

`test/local-export-quality.proof.ts` builds its own current-source overlay and
performs actual native exports from generated media, with zero provider calls:

| Generated source | Verified final vertical output |
| --- | --- |
| 3840x2160, 30 fps | 1216x2160, 30 fps / 30 frames |
| 2160x3840, 24 fps | 2160x3840, 24 fps / 24 frames |
| 1920x1080, 60 fps | 608x1080, 60 fps / 60 frames |
| 720x1280, 30000/1001 fps | 720x1280, 30000/1001 fps / 30 frames |

The 60 fps case has a nonzero 2.5-second source timestamp and a later fractional
cut starting at logical frame 89. Decoded alternating source frames retain
60 fps motion. Native portrait also passes the separate portrait-only route.
Original bytes remain unchanged; repeat export preserves cached preview bytes.
Cancellation and verified temporary-directory cleanup pass. The final quality
proof passes in **58.31 seconds**; aggregate synthetic evidence is ignored at
`.local-build/evidence/cl070-export-quality.json`.

The 4K pattern retains fine two-pixel stripes: decoded grayscale contrast
standard deviation is about 105.77 versus 0.60 through the old reduced-preview
path. This is a synthetic detail regression check, not a perceptual quality
percentage or a promise of lossless footage. Its original crop uses 1152x2046
pixels rather than 324x576 preview pixels.

Verification and review:

- **25 focused unit tests in 3 files pass** (export profile, batch and editor
  contracts); the final profile's 3 tests also pass after the last clock/bounds
  changes. Tiny/even portrait dimensions and low-rate short cuts are covered.
- `local-focus-native`, `owner-hosted-editor`, `owner-native` and
  `local-export-quality` proofs pass against the corrected source path. They
  cover actual crop/zoom/capture boundaries, caption/picture/filter output,
  original/cache integrity, revisions, cancellation and cleanup. The hosted
  proof uses local synthetic hosted-shaped composition, not cloud deployment.
- Frontend, local worker and proof TypeScript, affected-file ESLint, Prettier
  and `git diff --check` pass. No broad suite, paid flow or ignored env reads.
- Initial validation caught overlay EOF dropping a high-rate final frame and
  the actual even-rounded preview picture rectangle differing from logical
  geometry. Fixed overlay hold and original-pixel projection; native checks
  pass. A later input-seek optimization failed the nonzero-start/later-cut
  regression and was removed completely. The verified source-clock path stays.
- Final read-only validation: **Meets ticket; no actionable findings** in the
  normal shared editor/native export scope. Source binding, both final routes,
  integer/native clocks, resource limits, cleanup, dependency direction and
  privacy were inspected. Unrelated CL-067/068 pending work is preserved.

The settled worker/overlay was rebuilt, then only the ownership-verified backend
tree was reloaded. Frontend supervisor 25148/listener 24236 remains running;
backend supervisor 23728/API 26408 and worker 21816 own ports 4000/4200.
Health, `/start` and `/api/sample/config` return 200; capabilities report
`synthetic-ai`. No workspace was active before reload; no processing POST ran.
Content-free runtime record and separate logs remain outside Git under
`C:/Users/minat/AppData/Local/Temp/clipbuilder-cl068-runtime/` (backend log prefix
`backend-20261025-193641`; frontend `frontend.stdout.log`/`frontend.stderr.log`).

Updated source of truth, local workflow, frontend/renderer/source-acquisition
guides and deferred hosted-capacity checklist. All changes remain unstaged and
uncommitted. Existing outputs stay immutable; a new explicit export uses this
path. Downloads and saved-export copies still preserve bytes.

Unverified: owner real-media/visual quality and real AI, a new Linux image with
these changes, and maximum hosted resource/capacity acceptance. Fake mode needs
no API keys and performs real local media rendering with synthetic observations.
Real observations require owner keys/live flags/approvals and owner processing;
no local AI model is added. The retired separate `apps/renderer/src/` composition
finding below remains unchanged and is not part of the normal app's export path.

## Historical audit baseline — before the correction

The following findings, line references and fixed-size outputs describe the
pre-fix snapshot. They are retained as audit evidence; the implementation and
verification above supersede them for the normal shared editor.

Owner request — 2026-10-25: audit all exports for resolution changes and
unnecessary quality loss before changing the pipeline. Preserve planned CL-069
editor work, existing CL-067/068 changes, running app, configuration and media.

Scope: source acquisition/upload and retention, provider-only proxies,
portrait-only export, shared local/hosted edited clip export, saved output and
download, and the separate legacy renderer. No provider/cloud request, paid
test, real media fixture, deployment or Git mutation is authorized.

Audit plan: trace source paths, dimensions and encoding settings; reproduce
the current native clip path with generated landscape and portrait sources in
fake/paid-off/network-blocked composition; record source/intermediate/output
dimensions, crop geometry and source/cache integrity. Check download/save paths
for further encoding. Report concrete findings and a minimal recommendation;
do not silently choose a new output size or modify the renderer.

The synthetic native renderer/export is API-free in fake mode. Real AI
observations require configured provider keys, live flags, approvals and owner
processing; they are unnecessary for this audit. No local AI model is needed.

## Findings — 2026-10-25

### High — focus exports crop an already reduced intermediate

`apps/renderer/local/clip-render.ts:87` creates/reuses the cached clip source
through `ownerPortrait`. `apps/renderer/local/media.ts:267` first scales the
original to fit inside 1080x1920 and pads it. A landscape image is reduced to
approximately 1080x608 picture content surrounded by black padding.

Only afterwards does `apps/renderer/local/focus-filter.ts:17` crop the selected
person from that smaller cached image and scale it to 1080x1920. The shared
integer crop for the tested 16:9 inputs at zoom 1 is **324x576**; higher zoom
uses fewer pixels. A 4K source cannot retain its available detail through this
unnecessary downscale-then-enlarge sequence. Output metadata saying 1080x1920
does not establish native 1080p subject detail.

This is a CL-068 integration defect: preview/native framing parity was verified,
but that proof did not establish source-detail retention. Correct framing and
output dimensions did not catch the lower-resolution intermediate.

### Medium — fixed output size does not preserve source resolution or cadence

Portrait-only and shared edited exports are fixed to 1080x1920 at 30 fps;
`validateOwnerOutput` rejects another dimension/rate. This is the existing
documented export policy, not an adaptive source-quality mode. The generated
2160x3840 portrait source was reduced to 1080x1920 even without a spatial focus
crop. Source 60 fps is also normalized to 30 in code; that frame-rate example
was inspected, not separately generated here. Hosted editing uses the same
`createOwnerHost` and native worker, so deployment retains these transformations.
No cloud run occurred.

The owner's new quality expectation is not already satisfied. Original
landscape width/height cannot simultaneously remain identical and become a
portrait frame. Final output-size/cadence policy needs an explicit decision;
do not silently substitute a 4K preset or call enlarged crops additional detail.

### Medium — avoidable extra lossy encoding generation

Cached portrait cuts and edited final outputs both use H.264, veryfast, CRF 22,
8 Mb/s maxrate and yuv420p (`media.ts:305` and `clip-render.ts:169`). The first
stage encodes AAC 160 kb/s/48 kHz/stereo; edited output copies that audio. The
extra video encode is avoidable in the edited export path. The bitrate ceiling
can constrain complex content; no perceptual threshold or quality percentage
was measured here.

Re-exports start from the same cached cut, not the previous finished MP4. They
do not form an accumulating final-output encode chain, but still inherit that
lower-quality cached input.

### Separate legacy renderer — also fixed-size and recompressed

The older renderer under `apps/renderer/src/` uses a fixed 1080x1920/30 fps
composition. `node-pipeline.ts` prepares a selected clip at CRF 18;
`composition/render-worker.ts` encodes again at CRF 20 and requests JPEG frames
at quality 80. JPEG applies when that capture path is active; shared-memory
capture can bypass it. This separate legacy path was reviewed in code, not
exercised/deployed. The current shared editor's transparent overlay captures
PNG, and Chromium does not decode its source video; do not attribute a legacy
JPEG stage to the current editor.

## Paths that preserve bytes / do not feed reduced AI media into export

- Acquisition validates selected dimensions and uses `-c copy` for the admitted
  remux (`apps/renderer/local/acquisition-media.ts:278`). Upload/source retention
  copies bytes. Inspection does not resize media. No real download/owner source
  was used in this audit.
- AI-only proxies have edge 640 and low bitrate (`provider-media.ts` /
  `OWNER_PROVIDER_MEDIA`). They do not feed edited final rendering, which uses
  the separate cached portrait cut. They are not the focus defect's cause.
- Downloads stream existing output bytes (`apps/backend/local/server.ts:410`
  and frontend bridges). Download clip does not transcode.
- Saved exports use hash/byte-verified `copyImmutable` into Exports
  (`apps/backend/local/draft-store.ts:188`), not another encode. Saving/restoring
  finished MP4s adds no encoding generation. Original bytes remain unchanged.

## Native evidence

An ignored audit-only proof imports current-source `renderOwnerClip`, builds its
current transparent overlay into owned scratch, generates one-second MP4 test
patterns with audio and runs actual native exports. No real media or stale
overlay validates this evidence.

| Generated source | Cached intermediate | Effective focus crop | Final MP4 |
| --- | --- | --- | --- |
| 1920x1080, 30 fps | 1080x1920 | 324x576 | 1080x1920, 30 fps |
| 3840x2160, 30 fps | 1080x1920 | 324x576 | 1080x1920, 30 fps |
| 2160x3840, 30 fps | 1080x1920 | 1080x1920 | 1080x1920, 30 fps |

`node node_modules/vitest/vitest.mjs run --config
.local-build/cl070-audit.config.mts`: **1 proof passes**, 24.15 seconds.
The shared setup forces fake/paid-off before imports, disables env loading and
blocks non-loopback networking. Provider calls are zero. Native media/duration/
frame validation passes for each export. A repeated 1080p export preserves
source and cached-cut digests; all samples preserve their source. Browsers and
listeners close; generated OS-temp scratch is removed by verified-path cleanup.

The first sandboxed attempt hit Windows EPERM at an OS-temp rename; its finally
cleanup completed. The same proof passed using explicit unsandboxed execution.
No app workaround or permission-policy change was introduced. Aggregate
synthetic dimensions/booleans remain ignored in
`.local-build/evidence/cl070-quality-audit.json`. No owner path, video, screenshot,
transcript, prompt, credential or source hash was committed/logged.

This proves the geometry/encode path and byte integrity, not a real-footage
perceptual score, PSNR/SSIM result, live AI quality or cloud capacity. No broad
suite or normal-app processing request was needed.

## Minimal recommendation and remaining decision

1. Decode/cut/crop from the **original full-resolution source**, then do the
   necessary final scaling, overlay and video encode once. Keep the padded cut
   only for preview if needed. Map accepted shared crop geometry into upright
   original-source pixels, preserving source clocks and framing without more AI.
2. Verify detail retention with generated fine-detail sources/decoded frames
   alongside existing position/zoom/boundary parity. Review CRF/bitrate for that
   single encode, rather than raise bitrate on an already reduced intermediate.
3. Set an explicit source-aware portrait output-size/cadence policy with the
   owner. A fixed 1080x1920 deliverable, unchanged original dimensions and a
   native-size portrait crop are different promises. This audit chooses none
   of them and does not promise mathematically lossless edited H.264.

Filter ordering/resize semantics were checked against the primary
[FFmpeg filter reference](https://ffmpeg.org/ffmpeg-filters.html#scale).
Lossy encode and JPEG/shared-memory behavior were checked against the primary
[Remotion quality guide](https://www.remotion.dev/docs/quality).

At that audit-only checkpoint, no application code, FFmpeg binary, encoder
setting, source, saved draft/output, service, environment or cloud resource had
changed. The later authorized correction and actual verification are recorded
above, separately from CL-069's editor work.
