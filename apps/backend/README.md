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
CL-004 adds local fixture routes under `/v1/sample/*` only when `APP_ENV=local`
and provider mode is fake: session start/evidence, immutable analysis, one
idempotent inspection/analysis/build/render scripts and clear. These are
development-only simulated operations, not media/provider implementations.
`SampleSession` bounds its
ephemeral in-memory fixture map to 16 entries and two-hour access, not a durable
store. Its HttpOnly/SameSite fixture cookie is not the future encrypted grant.
Production/real composition does not register these fixture routes; safe
`GET /v1/sample/config` remains available with all unimplemented real features
disabled. There is no fixture download route or valid output capability.

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

The committed schema is [`.env.example`](../../.env.example). `FAKE_MODE=true`
is the authoritative default; internal provider mode is derived. Legacy
`PROVIDER_MODE`, when supplied, must match and cannot override the boolean.
Paid/live flags remain independent admission gates, not alternative mode knobs.
False selects real mode without fallback; currently its adapters are unavailable.
Credentials and owner-owned identifiers remain blank.

An ignored root `.env.local` was created from the safe blank example because
none existed. The owner populates matching entries manually. Never inspect or
overwrite an existing secret file. Only `server.ts` loads it on explicit local,
non-test startup; process-environment values take precedence. Imports, unit
tests and CI never load it. Restart the backend after owner configuration changes.

Tests set their complete environment before composition, reject live/paid flags,
and block non-loopback network access.
