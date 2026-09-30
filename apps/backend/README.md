# ClipBuilder backend

The backend is the private Express control API and later owns the single media
job entry point. It may import `@clipbuilder/contracts`; it must never import
frontend implementation.

## Current responsibility

CL-001 supplies strict configuration parsing, explicit application composition,
a content-free `GET /v1/health`, safe error mapping, and deterministic tests.
CL-003 adds a contract-validated synthetic analysis/assembly story plus
deterministic fake clock, provider, and operation foundations under `src/demo`.
The fixtures cover zero, one, three, and four candidate outcomes and one
immutable automatic composition manifest with fixed captions. They run with no
credentials or network and are not a live-provider fallback.
Storage, grants, upload, media jobs, live providers, automatic composition,
render, and cleanup arrive only in their owning tickets. No editor or assistant
endpoint belongs in the demo API.

`src/app.ts` constructs Express without listening. `src/server.ts` is the only
module that reads `process.env` and opens the local port.

## Commands

Run from the repository root:

```text
corepack pnpm dev:backend
corepack pnpm build:backend
corepack pnpm --filter @clipbuilder/backend typecheck
corepack pnpm --filter @clipbuilder/backend test:unit
```

After a build, `corepack pnpm start:backend` binds to `127.0.0.1:4000` by
default. `GET http://127.0.0.1:4000/v1/health` is content-free and does not call
a provider, cloud service, or user object.

## Configuration and secrets

The committed schema is [`.env.example`](../../.env.example). Defaults are fake
and paid-disabled. Credentials and owner-owned identifiers remain blank.

Do not read or commit `.env.local`. If the owner later creates one, it is
ignored and may be loaded only by an explicit local start command owned by the
relevant ticket. Importing backend modules never loads environment files.

Tests set their complete environment before composition, reject live/paid flags,
and block non-loopback network access.
