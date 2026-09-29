# ClipBuilder repository instructions

These instructions apply to the whole repository. The product and architecture
authority is `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`; implementation work
must follow one dependency-ready packet under `docs/tickets/` at a time.

## Authority and documentation ownership

- Follow the latest explicit owner decision, then the source of truth, then the
  active ticket, then an approved ADR, then research/history.
- `README.md` owns the concise public product story, repository map, and safe
  first-time local commands. Do not turn it into an operations manual.
- Application/package READMEs own their commands, configuration boundaries, and
  focused verification.
- This file owns repository operating constraints. Keep product decisions in the
  source of truth and ticket-local decisions/evidence in the active packet.
- Update the narrowest owning document when behavior changes. A ticket cannot
  silently change architecture, privacy, rights, spend, or public claims.

## Scope, privacy, and spend

- ClipBuilder is a disposable portfolio demo: one owned/licensed conversation,
  grounded candidate moments, one selected 10–60 second vertical edit, and one
  final download. Do not add accounts, durable projects, a database, a general
  queue, history, batch workflows, direct publishing, remote-platform downloads,
  arbitrary renderer inputs, or sensitive inference.
- Keep real media, filenames, transcripts, captions, prompts, provider payloads,
  generated assets, output videos, signed capabilities, account identifiers, and
  credentials out of Git, fixtures, logs, errors, URLs, screenshots, and
  documentation.
- Committed/default/test composition is `PROVIDER_MODE=fake`,
  `PAID_DEMO_ENABLED=false`, and every `LIVE_*` flag false. Ordinary tests and
  CI must be unable to contact providers or consume credits.
- Never read an ignored `.env.local` or secret file to answer a configuration
  question. Inspect `.env.example`; tell the owner which matching blank entries
  to populate manually.
- Never create or mutate provider/cloud resources, use credentials, make paid
  calls, deploy, purchase, or launch unless the user explicitly authorizes that
  external action and the active ticket's gate is satisfied.
- Do not stage, commit, push, fetch, pull, switch branches, or rewrite history
  unless the user explicitly authorizes the Git action.

## Repository boundaries

```text
apps/frontend       @clipbuilder/frontend  Next.js browser experience
apps/backend        @clipbuilder/backend   Express control API / later job entry
packages/contracts  @clipbuilder/contracts Browser-safe cross-boundary schemas
```

The only internal dependency direction is
`apps/frontend -> packages/contracts <- apps/backend`. Applications never import
each other. `packages/contracts` cannot import React, Next.js, Express,
Node-only APIs, provider/cloud SDKs, environment readers, fixtures, or
application code.

- Create a directory only when its first real module arrives. Do not scaffold
  later feature trees with placeholders.
- Cross-boundary schemas live once in contracts. Frontend workflow/persistence
  stays in the owning frontend feature; server config and job descriptors stay
  in the backend.
- Routes validate, call one use case, and map one result. Use cases know ports
  and domain values, not Express objects. Provider raw types never escape an
  adapter.
- Avoid catch-all `utils`, `helpers`, `common`, or `services` modules. Name a
  module after the domain responsibility it owns.

## Configuration and secrets

- Parse server configuration once during explicit composition. Importing a
  module must not read media, load a local env file, start a server, open a
  port, or call a provider.
- `apps/backend/src/app.ts` constructs Express without listening;
  `apps/backend/src/server.ts` owns the listening process.
- Credentials and user-owned identifiers stay exactly blank in committed
  examples. No GCP service-account JSON belongs in environment variables or the
  repository.
- Browser code receives only explicitly public configuration. Never expose a
  backend origin, credential, bucket, private service name, or provider setting
  through `NEXT_PUBLIC_*`.

## Deterministic verification

- Tests set `NODE_ENV=test`, `PROVIDER_MODE=fake`, `PAID_DEMO_ENABLED=false`,
  and every live flag false before application modules load.
- The shared Vitest setup installs those values and network interception at
  module top level. A `beforeAll` hook is too late because Vitest imports test
  modules before suite hooks run.
- Tests never load `.env`, `.env.local`, Secret Manager, shell-profile secrets,
  or a shared cloud resource. Unexpected non-loopback network access is a test
  failure.
- Use synthetic/source-controlled data only. Assert exact fake provider/job call
  counts whenever a ticket introduces a metered boundary.
- Run the smallest relevant checks while iterating and the active ticket's
  required final gate after edits settle. Do not invent paid/live E2E coverage.
- Before completion, check dependency direction, duplicate schemas/constants,
  dead/debug code, unsafe casts, stale flags/TODOs, secret/content leakage, and
  cleanup for every listener, timer, request, URL, process, or temporary file
  touched by the ticket.
- Boundary enforcement is executable: contracts compile with no ambient Node
  types, ESLint disables Node globals in contracts and frontend browser source,
  and negative fixtures must prove Node built-ins and relative cross-app imports
  fail while published contract imports remain valid.

## Local commands

Use the pinned package manager from the repository root:

```text
corepack pnpm install --frozen-lockfile
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
```

The frontend uses port `3000`; the backend defaults to `4000`. When asked to
start or restart long-lived local applications, stop stale listeners first,
launch only the required process, capture content-safe logs, and report the
process ID and log path. Never print environment values.

## Ticket completion

Report changed files, exact checks/manual states, deviations, and every
credential/paid/visual/cloud/rights/user-only item still unchecked. Update the
ticket/index only for evidence actually produced. A suggested ticket commit
subject does not authorize a commit.
