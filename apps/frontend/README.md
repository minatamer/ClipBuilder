# ClipBuilder frontend

The frontend is the public Next.js experience. It may import
`@clipbuilder/contracts`; it must never import backend implementation or expose
server-only configuration to browser code.

## Current responsibility

CL-001 supplies the accessible product shell, framework error/not-found
boundaries, metadata, robots policy, and deterministic build/test foundation.
CL-002 adds the responsive landing-page visual approval prototype at `/` using
the real Next.js/React framework. Its links reveal local visual-review sections
only; no upload, analysis, media, provider, session, or render behavior exists.
The page remains server-rendered except for one narrow `IntersectionObserver`
client island that changes the active presentation cue in the semantic
“How it works” list. The complete list is present without JavaScript. No motion,
scroll, glass, font, or component dependency was added; CSS provides the visual
system, progressive enhancement, and reduced-motion/transparency fallbacks.

Session, intake, upload, analysis, candidate, assembly, editor, render, and
cleanup behavior belongs to later tickets and must not be pre-created here.
Broad application styling remains gated on explicit owner approval of the
CL-002 prototype.

## Commands

Run from the repository root:

```text
corepack pnpm dev:frontend
corepack pnpm build:frontend
corepack pnpm --filter @clipbuilder/frontend typecheck
corepack pnpm --filter @clipbuilder/frontend test:unit
```

The local development server binds to `127.0.0.1:3000`. No provider credential
is required or read by this package.

## Configuration boundary

Browser code will eventually receive only the schema-validated public response
from `GET /v1/config`. `BACKEND_ORIGIN`, `BACKEND_AUDIENCE`, bucket names,
provider configuration, credentials, grants, and signed capabilities are
server-only and must never use `NEXT_PUBLIC_*`.

Tests use the shared deterministic setup, force fake/paid-disabled flags, and
reject non-loopback network access.
