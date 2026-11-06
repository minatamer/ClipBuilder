# CL-235 — Fill intake thumbnails without black bars

Status: Implemented and validated locally, 2026-11-06. Owner-media/device visual acceptance remains manual.

The owner asks whether the black bars in the Saved video intake thumbnail are
part of the thumbnail or controlled by the app, and requests a preview without
them. Saved intake samples an existing silent video frame (CL-067), while fresh
YouTube offers use the protected JPEG endpoint (CL-032). Both are presented by
`YoutubePreview`; neither requires AI to display.

## Scope and acceptance

- Keep a compact, filled thumbnail with a normal landscape aspect ratio. Crop
  only the thumbnail presentation, preserving source media and editor/export
  framing, saved state, the normal ten-second/quarter-duration sampling clock,
  protected URLs, silent playback and explicit proceed actions.
- Account for black bands embedded in sampled pixels, not just empty CSS space.
  Use bounded, memory-only, conservative edge inspection of the already decoded
  frame/image. Uniform dark frames or ambiguous/asymmetric edges retain normal
  cover display. Failure to inspect must not fail a usable preview.
- Handle saved-video/JPEG load, failure, source changes and unmount cleanup.
  Keep the loading/fallback icon and responsive title/footer layout intact.
- Verify generated bar/no-bar/dark/asymmetric inputs and inspect the real
  component in the Codex browser at desktop/phone/tablet sizes without keys.
  No real downloads, AI/provider calls, saved-owner edits, environment changes,
  backend/worker restart, Git mutation or deployment.

Dependencies CL-032/067 are implemented; this packet is ready. Existing
CL-225–234 work is unrelated and must be preserved. Allocate the intake preview,
its bounded crop calculation/tests, the narrow shared thumbnail CSS rules, a
generated browser fixture when necessary, frontend guide, source-of-truth note
and this ticket/index. No contracts, native workers or backend code changes.

## Implementation and actual evidence

The existing thumbnail already used `object-fit: cover`, so CSS cover alone
cannot remove black pixels embedded in a sampled frame. The owner's screenshot
is a saved-video frame, not the remote YouTube JPEG path; the exact original
pixel content was not read or copied into a test fixture. Both paths now use
a filled 16:9 viewport with clipped, absolute media geometry. A 128x72 temporary
canvas detects conservative paired near-black bands and computes the additional
center zoom after accounting for cover cropping already supplied by the source
aspect ratio. Pixels are released immediately; no poster/data URL or media log
is retained. Source media, editor/export geometry and protected endpoints remain.

Uniform dark frames, small bright objects on black, transparent/asymmetric or
excessive edges retain ordinary framing. Blocked/unsupported pixel inspection
returns neutral framing. Each source identity remounts the preview so a previous
crop/failure cannot affect another source. Saved-frame readiness now waits for
the settled intended sample before its single pixel read; listeners, decoder
source and the existing failure deadline are cleaned up on unmount.

- Ten focused no-key cases pass: paired horizontal/vertical bands, unchanged
  pixels, source-aspect cover behavior, unbanded/dark/asymmetric/excessive edges,
  transparency, malformed input, bounded canvas reads and failure fallback.
- Frontend type check, scoped ESLint, formatting and whitespace pass.
- Codex browser inspected the actual component/CSS with generated JPEGs and an
  independently generated four-second MP4 over loopback HTTP byte ranges.
  A solid-red first half-second and later banded colored frame prove the saved
  thumbnail seeks to one second (quarter duration), stays paused and crops the
  intended frame. Both bar cases zoom 1.38462; the unbanded case remains 1.
- Desktop 1366x768, tablet 768x1024 and phone 390x844 have filled thumbnails and
  no horizontal document overflow. Loading, missing-image fallback, failed-to-
  usable source recovery and replacing a pending source were inspected. Long
  titles retain the existing marquee/accessible title. Preview dimensions stay
  stable. Proceed/footer actions were not moved or invoked.
- The scratch fixture installed fake/paid-off settings before app imports,
  served only generated assets over loopback, and used no provider, remote
  download, saved-owner data or normal app mutation. The incomplete first
  fixture lacked media byte-range responses; it was corrected before claiming
  saved-frame seeking. Test listeners, scratch assets and browser viewport
  override were removed/reset. Normal ports 3000/4000/4200 and health/start/config
  remain healthy with their existing owners.

Final read-only validate pass finds no actionable issue in the CL-235 diff.
Earlier CL-225–234 work is preserved and excluded. No staging/commits, ignored
configuration change, backend/worker reload, AI retry or deployment. The feature
works with `FAKE_MODE=true` and no API keys; real AI clip processing keeps its
separate provider/runtime/live approvals. Generated proofs establish thumbnail
mechanics, not real AI quality. Owner-media, physical-device and personal crop
preference acceptance remain manual. No scope deviation.
