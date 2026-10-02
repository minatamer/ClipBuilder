# Fixed clip composition

Browser-safe shared React/Remotion layout for strict manifest v2: one frozen
range, fixed captions, bounded template cards and deterministic contain/crop.
No Node, environment, provider, renderer SDK or application imports.

`corepack pnpm --filter @clipbuilder/composition build` compiles the package;
`corepack pnpm --filter @clipbuilder/composition test:unit` checks wide containment
and source-edge crop clamps. Renderer bundling owns Node encoding; the browser
product's read-only preview integration belongs to its later ticket.
