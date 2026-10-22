# Local owner overlay

This separate pure React composition is consumed only by the owner frontend
and owner renderer. Public composition/package builds exclude this tree. It has
no Node APIs, environment readers, application imports, provider clients or
filesystem access; bounded owner schemas remain in `packages/contracts/owner`.

`OwnerAutomaticOverlay` receives a validated overlay, an admitted asset-ID map
and an explicit 30fps frame. It shares the existing fixed caption appearance
and word-onset animation, then positions bounded pictures on a 1080×1920 canvas
with their normalized boxes and contain/cover fit. It uses the system Arial
font and directly renders admitted JPEGs. It contains no source-video player,
network loader, mutable editor state or renderer lifecycle.

The owner UI places this tree over the normalized selected video in its local
Remotion Player. The owner renderer paints the same tree in a fixed transparent
Chrome page, then combines its PNG frames with native video/audio. Geometry,
caption timing and visual timing therefore come from the same overlay. Browser
setup, frame storage, asset validation and FFmpeg stay in the
[owner worker](../../../apps/renderer/owner/README.md).

`ownerOverlayFrame` computes active captions, spoken-word onset and pictures
for each frame. Its cache key includes every changing state used by the fixed
tree; the renderer reuses frames only while that key is identical. The focused
owner tests compare rendered markup across caption, highlight and picture
boundaries. The synthetic native proof checks the resulting picture/caption
appearance and cut frames. Run the root `owner:test`, `owner:typecheck` and
`owner:build` commands; build before the opt-in `owner:proof` command.

With `FAKE_MODE=true` and `PAID_DEMO_ENABLED=false`, words and pictures are
fictional and need no API keys. Local preview/rasterization/encoding are real
processing. CL-019 keeps an immutable automatic base at edit revision zero;
caption/visual controls and personal-picture editing arrive in CL-020. Real
provider AI requires a future owner adapter, keys, live flags and applicable
approvals; no offline AI model or weights are included. Synthetic checks do not
prove real-media quality or approve paid/cloud testing.
