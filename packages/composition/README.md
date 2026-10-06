# Fixed clip composition

Browser-safe shared React/Remotion layout for strict manifests v2/v3: one frozen
range, fixed captions, bounded contextual overlays and deterministic contain/crop.
No Node, environment, provider, renderer SDK or application imports.

The v3 layout uses large white captions with a purple spoken-word background.
Grounded pictures use signed inline JPEGs in a compact lower-video overlay;
captions render above them. Legacy plain-text cards also use compact geometry,
with no opaque full-frame backing. Face geometry sets a bounded portrait zoom
and held same-shot crops stay consistent with preview/export. Camera views cut
directly to target geometry, including manifests carrying older tween metadata;
there is no intermediate view between faces. Pictures use 2–4.5-second holds
and can run adjacently from their frozen word clocks without group IDs. Older
sequence metadata has no effect on picture spacing. No raster
generation, external image fetch, HTML/SVG or equation interpreter lives here.
Backend compilation owns word grounding/timing; contracts validate the frozen
manifest, and preview/render consume the same React layers.

Synthetic checks work with `FAKE_MODE=true`/no keys. Font metrics, human visual
approval, preview/output sampled parity and devices remain CL-010/011/013 gates.
No local AI model is used.

`corepack pnpm --filter @clipbuilder/composition build` compiles the package;
`corepack pnpm --filter @clipbuilder/composition test:unit` checks wide containment
and source-edge crop clamps. Renderer bundling owns Node encoding; the browser
and renderer consume the same fixed layers and prepared clip-zero video.
