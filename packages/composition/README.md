# Fixed clip composition

Browser-safe shared React/Remotion layout for strict manifest v2: one frozen
range, fixed captions, bounded template cards and deterministic contain/crop.
No Node, environment, provider, renderer SDK or application imports.

`fixed-composition-v1` uses escaped plain-text statement/comparison/steps cards
on a full-frame backing, preserving audio with captions above in a separate
safe area. Fixed warm-white `clean-emphasis` uses one deterministic accent and
bounded line sizes. No raster generation, HTML/SVG or equation interpreter.
Backend compilation owns word grounding/timing; contracts validate the frozen
manifest, and preview/render consume the same React layers.

Synthetic checks work with `FAKE_MODE=true`/no keys. Font metrics, human visual
approval, preview/output sampled parity and devices remain CL-010/011/013 gates.
No local AI model is used.

`corepack pnpm --filter @clipbuilder/composition build` compiles the package;
`corepack pnpm --filter @clipbuilder/composition test:unit` checks wide containment
and source-edge crop clamps. Renderer bundling owns Node encoding; the browser
product's read-only preview integration belongs to its later ticket.
