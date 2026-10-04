# ClipBuilder repository instructions

These instructions apply to the whole repository. The product and architecture
authority is `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`; implementation work
must follow one dependency-ready packet under `docs/tickets/` at a time.

## Authority and documentation ownership

- Follow the latest explicit owner decision, then the source of truth, then the
  active ticket, then an approved ADR, then research/history.
- `README.md` owns the concise public, portfolio-facing product story and
  repository map. Link to service guides for setup and verification; do not put
  detailed commands, environment setup, or an operations manual there.
- Application/package READMEs own their commands, configuration boundaries, and
  focused verification.
- This file owns repository operating constraints, including canonical local
  startup, sandbox permissions, process cleanup, and logging. Its lifecycle
  rules apply alongside the commands in the application READMEs. Keep product
  decisions in the source of truth and ticket-local decisions/evidence in the
  active packet.
- Update the narrowest owning document when behavior changes. A ticket cannot
  silently change architecture, privacy, rights, spend, or public claims.

## Scope, privacy, and spend

- ClipBuilder is a disposable portfolio demo: one owned/licensed conversation,
  grounded candidate moments, one selected 10–60 second vertical edit, and one
  final download. The visitor chooses exactly one candidate, then receives an
  automatic clip with fixed captions and contextual visuals. Do not add an
  editor, chatbot/assistant, manual trim/range path, caption or visual controls,
  timeline, proposal flow, undo, or redo. Do not add accounts, durable projects,
  a database, a general queue, history, batch workflows, direct publishing,
  remote-platform downloads, arbitrary renderer inputs, or sensitive
  inference.
- Keep real media, filenames, transcripts, captions, prompts, provider payloads,
  generated assets, output videos, signed capabilities, account identifiers, and
  credentials out of Git, fixtures, logs, errors, URLs, screenshots, and
  documentation.
- Owner retention decision (2026-10-03): `private/retained-demo-source/` holds
  the ignored, owner-managed local demonstration master and its private metadata.
  Preserve it during session cleanup, expiry, cancellation, repository housekeeping,
  release preparation and `git clean`. Never use it as scratch, an ordinary test
  fixture or a public/build asset. Replacement or deletion requires an explicit
  owner instruction naming this retained asset. Processing uses a separate
  uploaded copy whose original/proxies/output retain the normal deletion rules.
  See [local source preparation](docs/operations/LOCAL_RELEASE_PREPARATION.md#retained-owner-demonstration-source).
- Committed/default/test composition is `FAKE_MODE=true` (derived provider mode
  is `fake`; a legacy `PROVIDER_MODE=fake` assertion cannot override it),
  `PAID_DEMO_ENABLED=false`, and every `LIVE_*` flag false. Ordinary tests and
  CI must be unable to contact providers or consume credits.
- Owner decision (2026-10-04): paid-flow testing is performed manually by the
  owner only. Agents may run automated fake-mode checks, never trigger a live
  paid flow. A private renderer update retains its separate cloud/build approval
  and cannot be bundled with permission for an agent-run paid test.
- Never read an ignored `.env.local` or secret file to answer a configuration
  question. Inspect the owning app's `.env.example`; tell the owner which matching blank entries
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
apps/renderer       @clipbuilder/renderer  Private Node/Docker media service
packages/contracts  @clipbuilder/contracts Browser-safe cross-boundary schemas
packages/composition @clipbuilder/composition Fixed shared React preview/render layout
```

The approved internal directions are
`apps/frontend -> packages/contracts <- apps/backend`,
`apps/renderer -> packages/contracts`,
`apps/frontend -> packages/composition <- apps/renderer`, and
`packages/composition -> packages/contracts`. Applications never import each
other; backend cannot import composition. Shared composition has no Node,
environment, provider/cloud SDK or application dependency. `packages/contracts` cannot import React, Next.js, Express,
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
- The renderer's explicit server composition owns listening on injected PORT,
  private caller verification and storage credentials; it has no Gemini key.
  Build its fixed bundle/binaries into the image. No runtime tool download or
  arbitrary composition, command, path or remote asset input is permitted.
  Cloud compute/spend gates are independent of fake/live AI. Renderer tests use
  injected ports without ADC or network. Private test infrastructure has its own
  approval checkpoint at the first cloud-dependent test, not after release audit.

## Explain fake-mode and live capabilities

- Whenever explaining a feature, proposing a test, requesting owner input, or
  reporting ticket status, explicitly state what currently works with
  `FAKE_MODE=true` and no API keys, and what requires real provider API keys,
  enabled live flags, and the applicable approvals. Identify fixture/mock
  results separately from real processing; fake results do not prove live AI
  quality or readiness.
- Distinguish API-free processing from AI-free processing. A real local AI
  model may need approved weights and runtime tooling without needing provider
  API keys. State whether those assets and the implementation are available,
  verified, or still missing.
- Before asking for media, credentials, or another prerequisite, explain which
  test or capability it unlocks and what else remains necessary. Separate
  implemented and verified behavior from planned or blocked behavior; do not
  imply that supplying one input completes an unfinished pipeline.

## Deterministic verification

- Tests set `NODE_ENV=test`, `FAKE_MODE=true`, `PROVIDER_MODE=fake`, `PAID_DEMO_ENABLED=false`,
  and every live flag false before application modules load.
- The shared Vitest setup installs those values and network interception at
  module top level. A `beforeAll` hook is too late because Vitest imports test
  modules before suite hooks run.
- All six Vitest configurations disable environment-file loading with
  `envDir: false`. The shared test environment replaces inherited operating
  flags, removes provider/credential-file variables and stays fake/paid-off
  through worker teardown. Socket interception survives test mock restoration.
- All opt-in synthetic media harnesses install the same hardcoded fake/paid-off
  environment before their other modules load. These local harness commands are
  separate from the default unit suite; they cannot authorize cloud/live tests.
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

## Canonical local app startup

- An unqualified `run`, `run all`, `restart`, or `restart all` targets both the
  frontend and backend. A named target operates only on that service. `kill`
  or `kill all` stops this repository's app stack, not other repositories or
  every Node process. Contracts are a build prerequisite, not another server;
  the media feasibility harness is opt-in and is not part of the default stack.
- Follow the [backend guide](apps/backend/README.md#run-locally) and
  [frontend guide](apps/frontend/README.md#run-locally). Use the pinned package
  manager from the repository root. Build contracts before first startup and
  after contract changes with `corepack pnpm build:contracts`. Normal local
  launches use `corepack pnpm dev:backend` and `corepack pnpm dev:frontend`;
  use the guides' build/start commands only for a requested production-like run.
- For a full-stack start, launch the backend first and wait for content-free
  `GET http://127.0.0.1:4000/v1/health` to return `200`, then start the frontend.
  The frontend binds to `127.0.0.1:3000`; open `http://localhost:3000/start`
  to match the origin policy. Check `/start` and `/api/sample/config` return
  `200` before reporting the workflow reachable. These GET checks do not prove
  provider readiness or authorize a processing request.
- The backend defaults to `127.0.0.1:4000`, and the current frontend fixture
  bridge pins that upstream port. Do not silently choose different ports,
  rewrite origins, or change the owner's environment to resolve a conflict.
  If an intentional backend port override makes the bridge incompatible,
  report the mismatch rather than claim the full stack works.
- Launch long-lived local app processes outside the restricted sandbox through
  the tool's explicit escalation/approval mechanism. Do not change sandbox
  policy or bypass a denied operation. Deterministic tests and CI retain their
  isolated fake/paid-disabled setup; a local run is not approval for providers,
  paid calls, cloud changes, or deployment.
- Use normal owner-managed configuration. On explicit non-test local startup,
  `apps/backend/src/server.ts` loads ignored `apps/backend/.env.local` and
  `apps/backend/runtime.local.json` if present; Next.js owns
  `apps/frontend/.env.local`. There is no root environment file;
  existing process-environment values take precedence. Let the entry point
  load it, without reading, printing, copying, or overwriting its contents.
  Do not force fake/test flags for a requested normal run, create a second
  frontend mode setting, or bypass feature gates. Missing setup is described
  using the blank entries in the owning app's `.env.example`; never inspect
  secrets to diagnose it. Local environment files contain credentials and only
  the backend `FAKE_MODE`/`PAID_DEMO_ENABLED` switches. Private connection
  metadata and recorded approvals belong in ignored runtime configuration.
  Numerical limits, timeouts, model selection and retry policy are fixed in code,
  not environment overrides. Secret-free setup/migration is allowed when the
  owner explicitly authorizes it; do not print values.
- In normal local real mode, incomplete optional paid-feature prerequisites
  leave paid routes unavailable with zero dispatches while the app can start.
  Preserve the operating switches and independent retained-playback approval;
  never enable paid routes, substitute fixture results or record approvals to
  make a restart pass. Structural errors, conflicting modes and public/test paid
  composition still reject. Fixed startup requirement codes contain no values.
- Before launching, inspect the intended ports and establish process ownership.
  Reuse a healthy matching instance for `run`. Stop a verified stale matching
  instance first, including its watcher and children. Never kill an unrelated
  or unidentified port owner; report the conflict without a port fallback.
- For `kill` and `restart`, capture the owned launcher/watcher tree and orphan
  identities before shutdown. Stop the supervisor so it cannot respawn workers,
  use graceful shutdown followed by bounded tree-aware forced cleanup when
  needed, and verify PID creation times before terminating survivors. Stopping
  only the pnpm/tsx wrapper or freeing one port is insufficient. Recheck owned
  descendants and listeners through a stabilization check. Do not claim success
  or launch replacements while owned leftovers remain. Full-stack restart stops
  the frontend before the backend, then starts the backend before the frontend.
- On Windows, keep agent-managed background launches detached and hidden with
  `Start-Process -WindowStyle Hidden` unless a visible app was requested. Track
  the actual app and supervisor identities plus descendants in a content-free
  runtime record outside Git. Capture stdout/stderr in separate content-safe
  logs outside Git and report absolute log paths, owning PIDs, verified ports,
  and app URLs. Never print environment values or sensitive startup output.
- A returned launcher PID is not readiness. Verify actual listeners and the
  non-metered GET checks above. If a new instance fails, stop its entire newly
  created tree and verify cleanup; preserve unrelated healthy services. Restart
  means verified shutdown followed by verified startup, not another launch over
  an existing process. Leave healthy requested apps running after the handoff.

## Ticket completion

Report changed files, exact checks/manual states, deviations, and every
credential/paid/visual/cloud/rights/user-only item still unchecked. Update the
ticket/index only for evidence actually produced. A suggested ticket commit
subject does not authorize a commit.
