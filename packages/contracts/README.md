# `@clipbuilder/contracts`

Browser-safe product contracts shared by the frontend and backend. The package
contains strict Zod schemas, closed enums, compiled ceilings, safe public error
messages, and inferred TypeScript types. It contains no framework, environment,
provider, storage, or Node-only dependency.

The contracts compiler uses an explicit browser-neutral library set with no
ambient Node types. Repository lint rules also reject Node built-ins/globals and
application imports; executable negative fixtures guard those boundaries.

## Commands

- `pnpm --filter @clipbuilder/contracts typecheck`
- `pnpm --filter @clipbuilder/contracts test:unit`
- `pnpm --filter @clipbuilder/contracts build`

Import only from `@clipbuilder/contracts`. Consumers must parse every value at
its trust boundary; inferred types do not replace runtime validation.

## Implemented cloud contracts

The [current migration](../../docs/architecture/GEMINI_REMOTION_MIGRATION.md) uses
the implemented strict v2 edit/focus/caption/card schemas and source/object-
generation/upload/prepare/render/output/cleanup descriptors. Google provenance
labels are normalized contract values. Framework/Node/provider raw types and
credentials remain forbidden here. Fixed React composition is implemented in
the separate `@clipbuilder/composition` package. CL-006 records local/Linux/private
cloud foundation evidence; live Gemini quality and browser integration remain
later work. Ordinary tests use synthetic values, fake AI and no credentials/network.
