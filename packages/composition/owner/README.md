# Local owner overlay

This separate pure React composition is consumed only by the owner frontend
and owner renderer. Public composition/package builds exclude this tree. It has
no Node APIs, environment readers, application imports, provider clients or
filesystem access; bounded owner schemas remain in `packages/contracts/owner`.

`OwnerAutomaticOverlay` receives a validated overlay, an admitted asset-ID map
and an explicit 30fps frame. It positions bounded pictures and timed captions
on a 1080×1920 canvas, using system Arial and admitted JPEGs. It contains no
source-video player, network loader, mutable editor state or renderer lifecycle.

CL-020 keeps the automatic base immutable and introduces a versioned owner edit
document. `compileOwnerOverlay` re-exports the pure contract compiler used by
the control API, browser preview and native worker: it resolves registered
asset IDs to validated digests/provenance and applies bounded caption/picture
overrides. It accepts no arbitrary URL, filename, CSS, font upload or executable
composition input. Public manifests and package entrypoints remain separate.

A null caption override uses the existing fixed appearance. Explicit owner
styles offer Clean (64px, white/purple, weight 800), Classic (56px, white/teal,
weight 700) and Bold (80px, yellow/dark, weight 900), all centered initially.
Clean and Classic start in a 920×200 box at portrait position (80,1500); Bold
uses 920×240 at (80,1460). The validated requested size is 24–120px, with text and
highlight colors, left/center/right alignment and a normalized safe-area box.
The box must leave 5% margins, be at least 0.6 canvas widths and fit two lines
at the requested size. The same timed words, line boundaries and 80ms spoken
word onset are retained; styling cannot rewrite captions.

The local font menu is Arial, Verdana, Georgia and Courier New. Highlight
(legacy default), word pop, line fade and static are independent choices.
Animations depend only on supplied clip time; the raster cache includes line
fade progress as well as spoken-word onset. Optional fields preserve older
saved document hashes and their original appearance.

`OwnerStyledCaption` calculates a conservative per-font width estimate and a
bounded line height before rendering. Wide lines and long unbroken words
shrink to fit their box, potentially below the requested 24px control minimum;
the selected size is a maximum. This deterministic fit is shared by preview
and rasterization and needs real-media readability acceptance separately.

`OwnerVideoLookLayer` filters source-video children alone with a fixed sRGB SVG
matrix. Original, Vivid, Warm, Cool and Mono share 0–100% interpolated RGB
coefficients with native FFmpeg. Caption/picture overlays remain outside this
layer. There are no external LUTs/assets or supplied expressions. Pure matrix
values live once in contracts; native graph construction stays in renderer.

Picture boxes retain normalized fractions and convert directly to portrait
pixel coordinates in the shared tree; there is no separate preview rounding
rule. Browser rasterization performs final pixel rounding. Contain keeps the
whole image, cover crops centrally to fill, and corners use a fixed 20px radius.
Cues display from inclusive start to exclusive end frame at 30fps. Later
pictures in the list paint above earlier ones, with captions above all pictures.
The frontend reports caption/picture overlap instead of silently moving layers.

Asset provenance distinguishes a synthetic placeholder, generated illustration
and owner picture. Rendering is the same deterministic path for each; it does
not infer rights or actual provider availability from that metadata.

The owner UI places this tree over the normalized selected video in its local
Remotion Player. The owner renderer paints the same tree in a fixed transparent
Chrome page, then combines its PNG frames with native video/audio. Geometry,
caption timing and visual timing therefore come from the same overlay. Browser
setup, frame storage, asset validation and FFmpeg stay in the
[owner worker](../../../apps/renderer/owner/README.md).

Layer selection handles and scaled pointer/keyboard/numeric controls belong to
the frontend, outside the exported overlay. Dirty local controls preview a
valid compiled draft; Apply acknowledges a revision before explicit export.
In-flight exports keep their frozen revision and asset references while newer
edits remain available. Earlier output revisions are never overwritten.
Saved draft opt-in, autosave of acknowledged changes, reopen validation and
independent source/export retention belong to the
[owner UI](../../../apps/frontend/owner/README.md) and owner host, not this pure
composition package.

`ownerOverlayFrame` computes active captions, spoken-word onset and pictures
for each frame. Its cache key includes every changing state used by the fixed
tree; the renderer reuses frames only while that key is identical. The focused
owner tests compare rendered markup across caption, highlight and picture
boundaries. The synthetic native proof checks the resulting picture/caption
appearance and cut frames. Run the root `owner:test`, `owner:typecheck` and
`owner:build` commands; build before the opt-in `owner:proof` command.

With `FAKE_MODE=true` and `PAID_DEMO_ENABLED=false`, words and pictures are
fictional and need no API keys. Local preview/rasterization/encoding are real
processing. Manual caption/picture edits and rendering of an already prepared
valid bundle need no AI keys or live-provider availability. Real provider AI
remains uncomposed and needs adapter implementation as well as keys, live flags
and applicable approvals; supplying keys alone is insufficient. No offline AI
model or weights are included. Synthetic checks and this guide do not establish
manual UI acceptance, real-media readability/crop/A/V quality or approval for
paid/cloud testing.
