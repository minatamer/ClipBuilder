# ClipBuilder frontend

The frontend is the public Next.js experience. It may import
`@clipbuilder/contracts`; it must never import backend implementation or expose
server-only configuration to browser code.

## Current responsibility

CL-001 supplies the accessible product shell, framework error/not-found
boundaries, metadata, robots policy, and deterministic build/test foundation.
CL-002 adds the responsive landing-page visual approval prototype at `/` using
the real Next.js/React framework. Its actions reveal the local How it works flow
or the Privacy & limits dialog only; no upload, analysis, provider, session, or
render behavior exists. The page remains server-rendered around narrow client
islands for the IntersectionObserver flow, native dialog controls, deterministic
anchor scrolling, and accessible hero-word rotation. The complete flow and
privacy copy remain in server markup. CSS
provides the responsive visual system, code-native synthetic media, and
reduced-transparency fallbacks. Per the latest CL-002 owner direction, the hero
and synchronized conversion story run at full timing in every local motion
preference state; the rotating noun has no pause/play control, and that recorded
prototype-only accessibility exception must be revisited before public release.
Laptop and desktop widths use a split hero with the brand, two-line promise, and
supporting copy beside the product-motion frame; tablet and phone widths stack
the same content. The header retains the only first-viewport CTA.

CL-003 adds the complete canonical session reducer, derived selectors,
allow-listed `sessionStorage` projection, server-evidence reconciliation,
effect registry, and provider foundation under `src/features/session`. The
projection stores only content-free selection, operation, assembly, automatic
manifest ID/hash, and playback references; it never stores the manifest body,
transcript, media, capability, proposal, or edit history. No CL-003 module is
mounted into the visual prototype, so production workflow screens remain owned
by later tickets. Broad application styling remains gated on explicit owner
approval of the CL-002 prototype.

The locked production journey is sample/upload → analysis → zero to four
grounded candidates → choose exactly one → automatic clip preparation →
read-only preview and render confirmation → result/download. The frontend will
not expose an editor, chatbot, manual trim, caption or visual controls, an
editable timeline, proposals, or undo/redo.

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
