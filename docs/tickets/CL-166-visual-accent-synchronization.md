# CL-166 — automatic sound follows the displayed visual

Status: implemented and locally validated; normal backend refreshed with CL-167.
Depends on CL-138/145/162/165,
present in the worktree. Preserve all prior pending work and private media.
Owner 2026-10-30: an AI visual's sound must never drift from the visual.

## Confirmed causes and design

- Anchors currently follow source start only. A Hook starting inside an image
  can display it at presentation zero with no accent, or a partially trimmed
  accent. Each displayed occurrence needs its own fresh start, not a sliced
  copy of the original short sound.
- Preview uses an ordinary conditional img, with no Player loading gate; audio
  can start while that image is still loading. Use pinned Remotion buffering
  for images and propagate failures through existing preview recovery.
- Native audio uses the rounded native Hook length, but art currently uses one
  logical-30fps prefix/body sequence. Split art into independent Hook/body
  raster sequences and quantize each to the actual native cadence before joining
  at the same native-frame boundary. Preserve the existing 30fps raster sampling,
  caching/byte bounds and native source/output quality. Avoid full raw-stream
  split buffering or raising resource limits.

One browser-safe visual clock/visibility definition owns first actually visible
frame (including fade/exit boundaries), source sampling and per-occurrence
windows. Preview and native mixing derive linked cue timing from those windows,
never model-authored sound timestamps. Native uses sample-based delay from the
same displayed native frame. Full cue starts at offset zero for each Hook/body
appearance and stops within that image's occurrence. Moving/removing images
updates/removes linked sounds. Volume/mute/removal remain editable; deliberately
changing placement/offset/loop detaches the cue into manual audio. Ordinary
manual tracks and Hook risers retain their behavior and layering.

## Whole-file allocation

1. New contracts visual-clock module, `audio.ts` and relevant tests: shared
   motion/visibility and occurrence projection, physical clock options, linked
   cue normalization and ordinary-track compatibility. No Node/React/env imports.
2. Composition `visual-motion.ts`, `overlay-frame.ts`, `automatic-overlay.tsx`:
   reuse clock/motion, optional owned source-clock rendering and injectable
   buffered preview image while native keeps admitted raster decoding.
3. Frontend `clip-editor.tsx`, `audio-preview.tsx`, `audio-inspector.tsx`:
   buffered images, actual visual data supplied to sound projection, intentional
   detach semantics. No new workflow/prose/style or reduced-motion rules.
4. Renderer `clip-render.ts`, `rasterize-overlay.ts`, `overlay-page.tsx`,
   `audio-mix.ts` and protocol only as needed: bounded source clock, separate
   art input branches, exact native-frame joining and PCM sample delay.
5. Focused contracts/composition/editor tests and synthetic native/browser
   proofs: Hook begins before/on/inside/after the image, short/fading/moved/
   removed/multiple visuals, saved restore, delayed/missing image loading and
   24/25/29.97/30/60fps output. Compare decoded image onset and audio energy,
   not just stored cue values. Preserve zero provider calls and exact fake work.
6. This packet, index, source of truth and MEDIA_AUDIO architecture: actual
   findings/evidence and remaining owner real-device acceptance. No content leaks.

## Gates

Read pinned Next client guidance before frontend edits and applicable Remotion
guidance. Normal app remains available; after both packets settle rebuild/reload
the backend/worker through verified ownership. All checks use synthetic video,
fixed catalogue sounds, fake/no-key/paid-off/network-blocked composition. No real
AI/owner-video/download/config/cloud/deployment/Git action. Deterministic binding
is the goal; hardware/browser/codec listening is separately owner acceptance.

## Evidence

- Shared browser-safe visual clock/motion and per-occurrence projection wired
  through actual preview, inspector and native mix. Each linked accent starts
  fresh on its first visible frame; manual tracks/risers keep existing behavior.
  Deliberate offset/placement/loop changes detach; gains/removal remain anchored.
- Preview uses pinned Img pauseWhenLoading/maxRetries=0 and existing failure
  recovery. Native Hook/body raster branches share the existing 2GiB budget,
  30fps sampling, actual native cadence/boundary and sample-based audio delays.
- Focused fake tests: 49 cases across visual-clock/audio/batch, plus eight
  frontend motion/overlay cases. Cross-product covers five native frame rates,
  all four entrances, both exits, 1/2/3/46-frame images and seven Hook positions.
- Current-source native MP4 proof (62.18s) compares decoded image pixels and
  decoded synthetic accent onsets at 24/25/29.97/30/60fps: same frame for every
  occurrence, including Hook starting inside an image and a fading body image.
- Isolated actual Player/audio/image proof (14.04s): held image response stops
  clock/audio; decode releases them; 404 unmounts playback with one request and
  no retry. Synthetic audio normalization/mix/catalogue/editor proofs pass
  together (126.88s): Pop/Discord/Riser audibility/cutoff, twelve layers, manual
  audio, offset detachment/Discard, upload cancellation, save/restore/export and
  desktop/phone states. No AI/provider/real YouTube calls.
- Contract/local/frontend/root-test TypeScript and scoped ESLint passed after
  test-only type/cleanup fixes. Read-only diff review covers actual
  call sites, raster/audio input ordering, byte/decoder bounds, listener/URL/
  timer/browser/scratch cleanup and dependency direction. Prior CL-152–165 work
  preserved and excluded from the verdict. No actionable implementation findings.
- Fake/synthetic evidence verifies mechanics, not real AI relevance or physical
  device/audio-driver latency. Those remain owner review. No config/credentials,
  provider spend, cloud/deployment or Git mutation. Nothing staged/committed.

Deviation: none. Final normal worker/overlay refresh completed with CL-167;
its packet records verified process identities/readiness and absolute log paths.
