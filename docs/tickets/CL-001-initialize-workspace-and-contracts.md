# CL-001 — Initialize the workspace and shared contracts

Status: Planned<br>
Milestone: M0 — foundation and visual gate<br>
Last synchronized: 2026-09-29<br>
Depends on: None<br>
Blocks: CL-002, CL-003, CL-005<br>
Suggested commit: `CL-001: initialize the ClipBuilder workspace`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Create the strict pnpm/TypeScript monorepo, safe configuration boundary,
browser-safe shared contracts, API/error foundation, deterministic quality
commands, and minimal frontend/backend startup needed by every later ticket.

This ticket intentionally combines the former “repository” and “contracts”
draft slices: a workspace without real boundary schemas is a placeholder, while
contracts without targetable applications and tests cannot prove browser
safety or dependency direction.

## Portfolio value

Establish visible engineering discipline before feature work: reproducible
builds, explicit boundaries, runtime validation, safe failures, deterministic
tests, and a fake-only backend health path that cannot spend provider credits.

## Standalone implementation context

- Final dependency direction is
  `apps/frontend -> packages/contracts <- apps/backend`. Applications never
  import each other; contracts import no React, Next.js, Express, Node-only API,
  provider SDK, environment loader, storage, or application module.
- The eventual deployment is a public Next.js service, private Express control
  API, and one backend image/job family. CL-001 creates only working package
  shells and a content-free `GET /v1/health`; it does not pre-create future
  feature folders.
- Cross-boundary input is untrusted. Zod schemas are strict, bounded, reject
  unknown keys, and use explicit discriminated unions and refinements.
- Configuration is parsed once during explicit composition. Importing a module
  must not read media, start a server, open a port, or call a provider.
- `app.ts` constructs Express without listening. `server.ts` owns the port.
- Committed defaults are fake and paid-disabled. Tests explicitly set
  `NODE_ENV=test`, `PROVIDER_MODE=fake`, and every live/paid flag to false before
  importing application composition; tests do not load local environment files
  or make network calls.
- The product is a disposable clipping demo with no database, ORM, durable
  project model, authentication system, queue, or general repository layer.

## Dependency evidence required

There is no prior implementation dependency. Before changing files, confirm the
repository is still documentation-only, inspect existing uncommitted user work,
and preserve the source-of-truth/research documents exactly except for narrow
synchronization required by this ticket.

## Files and areas owned

Create only real files needed by this ticket:

```text
AGENTS.md
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
tsconfig.base.json
eslint.config.mjs
prettier.config.mjs
.editorconfig
.gitignore
.env.example
.github/workflows/quality.yml
apps/frontend/{README.md,package.json,next.config.ts,tsconfig.json,vitest.config.ts}
apps/frontend/src/app/{layout.tsx,page.tsx,error.tsx,not-found.tsx,robots.ts}
apps/backend/{README.md,package.json,tsconfig.json,vitest.config.ts}
apps/backend/src/config/{env.schema.ts,loadConfig.ts}
apps/backend/src/http/{errorMapper.ts,response.ts}
apps/backend/src/http/routes/health.route.ts
apps/backend/src/{composition.ts,app.ts,server.ts}
packages/contracts/{README.md,package.json,tsconfig.json}
packages/contracts/src/{constants.ts,ids.schema.ts,errors.schema.ts,media.schema.ts,transcript.schema.ts,candidate.schema.ts,editor.schema.ts,assembly.schema.ts,visual-plan.schema.ts,operation.schema.ts,api.schema.ts,index.ts}
```

Exact filenames may change only to match actual framework/tool constraints;
responsibilities and boundaries may not. Do not create upload, analysis,
assembly, editor, render, storage, provider, or media modules yet.

## Scope boundaries

### In scope

- Pin supported Node and pnpm versions, one lockfile, workspace filters, strict
  TypeScript, formatting, lint, typecheck, unit-test, build, and aggregate root
  commands.
- Install the minimum current dependencies needed for working Next.js,
  Express 5, Zod, Vitest, linting, formatting, and TypeScript.
- Create minimal accessible frontend shell and backend health response with real
  start/build/test code—not empty package placeholders.
- Parse the complete committed configuration schema with credential values
  blank and all live flags false. Production/live contradictions fail closed.
- Define shared constants and exact schemas for content-free IDs, safe errors,
  media/transcript/candidate, active-speaker/visual assembly, canonical edit
  manifest and proposal, operation status, and public API envelopes.
- Export a narrow public contract surface and add boundary tests.
- Establish CI that performs only deterministic unpaid checks.

### Out of scope

- Canonical frontend workflow reducer or persistence (CL-003).
- Design system or broad UI styling (CL-002/CL-004).
- Storage, encrypted grants, upload, media jobs, providers, actual analysis,
  assembly, editor behavior, rendering, or deployment.
- Credentials, provider dashboard changes, cloud resources, media licensing,
  paid calls, browser automation, or end-to-end suites.

## Implementation checklist

### 1. Workspace and toolchain

- [ ] Pin Node/pnpm policy and create one strict workspace with the three target
  packages.
- [ ] Add root scripts for format check/write, lint, typecheck, unit tests, and
  builds; package scripts remain directly targetable.
- [ ] Configure TS project boundaries so forbidden application imports fail.
- [ ] Add repository-wide ignore rules for local env files, media, transcripts,
  generated assets, outputs, logs, coverage, build products, Python/model
  caches, cloud credentials, and temp workspaces.
- [ ] Add repository operating guidance covering Git authorization, privacy,
  test isolation, paid-call prohibition, dependency direction, cleanup, and
  smallest-relevant verification.

### 2. Safe configuration and minimal applications

- [ ] Commit a readable `.env.example` schema with fake/disabled defaults and
  every credential/user-owned identifier blank.
- [ ] Reject live mode in tests and reject impossible live/paid/feature
  combinations before accepting traffic.
- [ ] Keep browser-visible configuration separate from server-only values; no
  secret/private URL uses `NEXT_PUBLIC_*`.
- [ ] Construct Express separately from listening and expose only content-free
  health behavior.
- [ ] Render a minimal accessible ClipBuilder frontend shell without pretending
  later features exist.

### 3. Shared contracts and errors

- [ ] Encode compiled ceilings and closed enums once, including the independent
  public limits: 15 seconds–20 minutes and at most 500 MiB, plus 10–60 second
  clip range.
- [ ] Define content-free IDs, safe error envelope, media descriptor,
  normalized transcript, candidate/evidence, shot/face/focus track, visual
  plan/assets, assembly bundle, edit manifest/proposal/operations, operation
  status, and HTTP request/response schemas.
- [ ] Keep frontend-only persistence and backend-only job descriptors out of the
  shared package.
- [ ] Reject unknown keys, invalid unicode controls/bidi overrides, NaN,
  infinity, oversized values, invalid references, and malformed dates/IDs.
- [ ] Source public error messages from a closed content-safe allow-list; never
  reflect validation input or provider errors.

### 4. Deterministic quality baseline

- [ ] Add contract boundary tests, dependency-direction checks, and
  configuration fail-closed tests.
- [ ] Deny unexpected network during tests and prove test composition cannot
  select live providers or paid operations.
- [ ] Add CI for install, format, lint, typecheck, unit test, and build only;
  exclude live/provider/cloud/browser/media-heavy checks.

## Contracts and invariants

- Public source acceptance requires duration and bytes to pass independently;
  neither compensates for the other. Runtime configuration may lower, never
  raise, compiled public ceilings.
- IDs contain no filename, title, email, IP, timestamp, provider ID, or object
  key. Word and speaker IDs are ordinals/opaque turn labels, not identities.
- Provider raw types never cross adapters later. Shared schemas describe product
  contracts, not an SDK.
- `SafeError.message` is source-controlled. Logs and error envelopes never
  include content or validation values.
- No code path in this ticket may compose a real provider, storage account, job
  runner, or paid operation.

## Privacy, provider, and cost constraints

- Do not read or create `.env.local`; verify it and equivalent secret files are
  ignored before documenting owner setup.
- Do not populate `OPENAI_API_KEY`, `DEEPGRAM_API_KEY`, Turnstile secrets,
  processing-grant keys, GCP identifiers, bucket names, or service accounts.
- Do not install provider/cloud SDKs speculatively. Add them only in the ticket
  that owns a real adapter.
- CI and tests must have no credential or network requirement and no path to
  provider spend.

## Acceptance criteria

- [ ] A fresh checkout installs reproducibly with the pinned package manager
  and one lockfile.
- [ ] Frontend, backend, and contracts each format, lint, typecheck, test, and
  build through real targetable commands.
- [ ] Dependency direction is enforced and contracts build in a browser-safe
  environment.
- [ ] Health can start in fake mode without credentials; importing app modules
  does not listen or make network calls.
- [ ] Production/live misconfiguration fails closed with a content-safe error.
- [ ] Contract tests cover exact limits, unknown keys, bounded text/arrays,
  invalid references, operation terminal rules, and non-reflecting errors.
- [ ] No placeholder feature tree, secret, media asset, transcript, generated
  output, provider configuration, or unauthorized Git action is introduced.

## Focused verification

- [ ] Run the pinned install with lockfile immutability.
- [ ] Run root format check, lint, all package typechecks, unit tests, and builds.
- [ ] Run dependency-direction/browser-safety and secret/ignore checks.
- [ ] Start the backend in fake mode, request `/v1/health`, then stop it without
  leaving a stale listener.
- [ ] Prove tests reject live/paid configuration and make zero network calls.
- [ ] Inspect `git diff --check` and final status without staging or committing.

## Documentation updates

- Update the root README only for actual local-start and repository-map facts.
- Add app/package READMEs for owned commands, configuration shape, boundaries,
  and targeted verification.
- Keep product behavior in the parent source of truth; do not duplicate its
  full specification into `AGENTS.md`.
- Mark this packet and the ticket index with honest implementation evidence only
  after the checks are performed.

## Owner gates and external blockers

None are required for deterministic CL-001 work. Dependency/version downloads
may require network authorization, but that is execution access—not approval to
add a materially different package or architecture.

## Commit boundary

Keep CL-001 as one foundation commit represented by
`CL-001: initialize the ClipBuilder workspace`. Do not absorb session behavior,
design work, providers, storage, media processing, deployment, or later
features. Do not stage, commit, push, or rewrite history without explicit user
authorization.

## Precision references

- [Authority, gates, and demo-first principle](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#0-purpose-authority-and-decision-language)
- [Architecture and dependency rules](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#8-system-architecture)
- [Repository blueprint](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#9-repository-and-decision-ownership)
- [Shared contracts and exact limits](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#10-shared-contract-vocabulary-and-exact-limits)
- [HTTP conventions and safe errors](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#11-http-api)
- [Configuration schema](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#16-configuration-and-environment-schema)
- [Verification strategy](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#20-verification-strategy)

## Completion handoff

Report the actual workspace/package tree, pinned tool versions, changed files,
configuration invariants, contract surface, exact verification commands and
results, health evidence, dependency/secret/ignore checks, and any unresolved
toolchain or network issue. List every unperformed check explicitly.
