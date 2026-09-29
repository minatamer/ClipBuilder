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
