# CL-001 — Initialize the workspace and shared contracts

> **Post-completion scope correction (2026-09-29):** The owner removed every
> visitor-facing editor and assistant feature. CL-001 historically scaffolded
> edit-proposal/operation contracts, but they are no longer product authority
> and must not be consumed by later tickets. The automatic composition manifest
> remains an internal read-only assembly/render artifact; CL-003 owns alignment
> and removal of obsolete proposal state/contracts.
> Historical file lists and commit subjects below describe what CL-001 actually
> produced; they are evidence, not the target contract for future tickets.

Status: Completed<br>
Milestone: M0 — foundation and visual gate<br>
Last synchronized: 2026-09-29<br>
Depends on: None<br>
Blocks: CL-002, CL-003, CL-005<br>
Suggested commits: nine bounded CL-001 commits documented below<br>
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
tsconfig.tests.json
vitest.config.ts
eslint.config.mjs
prettier.config.mjs
.editorconfig
.gitignore
.env.example
.github/workflows/quality.yml
test/{boundaries.test.ts,no-network.setup.ts,pre-import-guard.fixture.ts,pre-import-guard.test.ts}
test/fixtures/contracts-node-globals.negative.ts
apps/frontend/{README.md,package.json,next.config.ts,tsconfig.json,vitest.config.ts}
apps/frontend/src/app/{layout.tsx,page.tsx,page.test.tsx,error.tsx,not-found.tsx,robots.ts}
apps/backend/{README.md,package.json,tsconfig.json,vitest.config.ts}
apps/backend/src/config/{env.schema.ts,loadConfig.ts,loadConfig.test.ts}
apps/backend/src/http/{errorMapper.ts,response.ts}
apps/backend/src/http/routes/health.route.ts
apps/backend/src/{composition.ts,app.ts,app.test.ts,server.ts}
apps/backend/test/environment.fixture.ts
packages/contracts/{README.md,package.json,tsconfig.json,vitest.config.ts}
packages/contracts/src/{boundary-primitives.schema.ts,constants.ts,ids.schema.ts,errors.schema.ts,media.schema.ts,transcript.schema.ts,candidate.schema.ts,editor.schema.ts,assembly.schema.ts,visual-plan.schema.ts,operation.schema.ts,api.schema.ts,index.ts,contracts.test.ts,contract-boundaries.test.ts}
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
  media/transcript/candidate, active-speaker/visual assembly, the automatic
  composition manifest, operation status, and public API envelopes.
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

- [x] Pin Node/pnpm policy and create one strict workspace with the three target
  packages.
- [x] Add root scripts for format check/write, lint, typecheck, unit tests, and
  builds; package scripts remain directly targetable.
- [x] Configure TS project boundaries so forbidden application imports fail.
- [x] Add repository-wide ignore rules for local env files, media, transcripts,
  generated assets, outputs, logs, coverage, build products, Python/model
  caches, cloud credentials, and temp workspaces.
- [x] Add repository operating guidance covering Git authorization, privacy,
  test isolation, paid-call prohibition, dependency direction, cleanup, and
  smallest-relevant verification.

### 2. Safe configuration and minimal applications

- [x] Commit a readable `.env.example` schema with fake/disabled defaults and
  every credential/user-owned identifier blank.
- [x] Reject live mode in tests and reject impossible live/paid/feature
  combinations before accepting traffic.
- [x] Keep browser-visible configuration separate from server-only values; no
  secret/private URL uses `NEXT_PUBLIC_*`.
- [x] Construct Express separately from listening and expose only content-free
  health behavior.
- [x] Render a minimal accessible ClipBuilder frontend shell without pretending
  later features exist.

### 3. Shared contracts and errors

- [x] Encode compiled ceilings and closed enums once, including the independent
  public limits: 15 seconds–20 minutes and at most 500 MiB, plus 10–60 second
  clip range.
- [x] Define content-free IDs, safe error envelope, media descriptor,
  normalized transcript, candidate/evidence, shot/face/focus track, visual
  plan/assets, assembly bundle, manifest, operation status, and HTTP envelopes.
  Historical proposal/operation types produced by this completed ticket are
  superseded and scheduled for removal during CL-003 scope alignment.
- [x] Keep frontend-only persistence and backend-only job descriptors out of the
  shared package.
- [x] Reject unknown keys, invalid unicode controls/bidi overrides, NaN,
  infinity, oversized values, invalid references, and malformed dates/IDs.
- [x] Source public error messages from a closed content-safe allow-list; never
  reflect validation input or provider errors.

### 4. Deterministic quality baseline

- [x] Add contract boundary tests, dependency-direction checks, and
  configuration fail-closed tests.
- [x] Deny unexpected network during tests and prove test composition cannot
  select live providers or paid operations.
- [x] Add CI for install, format, lint, typecheck, unit test, and build only;
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

- [x] A fresh checkout installs reproducibly with the pinned package manager
  and one lockfile.
- [x] Frontend, backend, and contracts each format, lint, typecheck, test, and
  build through real targetable commands.
- [x] Dependency direction is enforced and contracts build in a browser-safe
  environment.
- [x] Health can start in fake mode without credentials; importing app modules
  does not listen or make network calls.
- [x] Production/live misconfiguration fails closed with a content-safe error.
- [x] Contract tests cover exact limits, unknown keys, bounded text/arrays,
  invalid references, operation terminal rules, and non-reflecting errors.
- [x] No placeholder feature tree, secret, media asset, transcript, generated
  output, provider configuration, or unauthorized Git action is introduced.

## Focused verification

- [x] Run the pinned install with lockfile immutability.
- [x] Run root format check, lint, all package typechecks, unit tests, and builds.
- [x] Run dependency-direction/browser-safety and secret/ignore checks.
- [x] Start the backend in fake mode, request `/v1/health`, then stop it without
  leaving a stale listener.
- [x] Prove tests reject live/paid configuration and make zero network calls.
- [x] Inspect `git diff --check` and final status without staging or committing.

## Documentation updates

- Update the root README only for actual local-start and repository-map facts.
- Add app/package READMEs for owned commands, configuration shape, boundaries,
  and targeted verification.
- Keep product behavior in the parent source of truth; do not duplicate its
  full specification into `AGENTS.md`.
- Mark this packet and the ticket index with honest implementation evidence only
  after the checks are performed.

## Completion evidence

Implemented and locally verified on 2026-09-29.

- Toolchain policy: Node `^22.13.0 || ^24.0.0`, pnpm `11.19.0`, TypeScript
  `6.0.3`, Next.js `16.3.7`, React `19.3.0`, Express `5.2.1`, Zod `4.6.5`, and
  Vitest `5.0.2` with one generated lockfile and no peer dependency issues.
- `corepack pnpm install --frozen-lockfile --offline`, root format check, lint,
  typecheck, unit tests, and production builds passed. Package-scoped format and
  lint commands also passed for all three workspaces.
- Unit evidence: 67 tests passed: 9 root boundary/pre-import tests, 35 contract
  tests, 21 backend tests, and 2 frontend tests. The shared setup installs
  fake/paid-disabled values and network interception at module evaluation,
  before test imports; an import-time fixture proves fetch is blocked.
- Test/typecheck ownership evidence: root test files and `vitest.config.ts` are
  covered by `tsconfig.tests.json`; the root typecheck builds contracts exactly
  once for application type resolution, then checks root tests and both apps.
  Package Vitest aliases resolve contract source directly, and the complete
  67-test command passed with `packages/contracts/dist` temporarily absent.
- Browser/application boundary evidence: negative fixtures prove contracts
  reject `process`, `Buffer`, bare Node built-ins, and Node ambient types;
  frontend browser source rejects Node globals; relative frontend/backend
  imports fail while both applications may import published contracts.
- Configuration evidence: deterministic tests reject every live/paid path, and
  live analysis fails closed unless OpenAI, Deepgram, grant, Turnstile, GCP
  project/region/bucket, and media-job configuration are all present. The
  runtime allow-list is derived from the Zod object shape; an executable parity
  test proves `.env.example` has every one of the 97 keys exactly once and keeps
  credential/user-owned fields blank.
- Contract evidence covers source-limit combinations, exact/max-plus-one
  bounded text and arrays, transcript ordering/word caps, strict sample/upload
  session branches, range-local candidate evidence, inclusive 10–60 second
  duration, exact 35% pair overlap, and representative visual/speaker
  cross-reference failures.
- Health evidence: the built backend started with fake, paid-disabled defaults;
  `GET /v1/health` returned `200`, `Cache-Control: no-store`, an opaque request
  ID, and `{"status":"ok","service":"clipping-api","version":"local"}`. The
  process was stopped and no listener remained on `127.0.0.1:4000`.
- Boundary and safety evidence: lint plus focused import scans found no forbidden
  application direction or Node/framework dependency in runtime contracts; no
  provider/cloud SDK was installed; all 97 allow-listed environment variables
  are documented; credential fields remain blank; secret-shaped value and
  ignore audits passed.
- `git diff --check` passed. No file was staged or committed.

Scoped deferral: the source of truth has no approved numeric tolerance for raw
provider word overlap. CL-001 therefore enforces nondecreasing transcript starts,
word/media end tolerance, speaker IDs, and word caps without inventing that
number. CL-007's provider-normalization checklist explicitly owns defining and
testing the source-controlled overlap tolerance before live transcripts can be
accepted. Candidate-pair overlap is not deferred and is enforced here.

## Owner gates and external blockers

None are required for deterministic CL-001 work. Dependency/version downloads
may require network authorization, but that is execution access—not approval to
add a materially different package or architecture.

## Commit boundary

Keep CL-001 within the nine reviewable commits below. Together they form one
foundation ticket; none may absorb session behavior, design work, providers,
storage, media processing, deployment, or later features. The plan supersedes
the earlier one-commit suggestion.

## File-level commit plan

Each CL-001 file appears exactly once. A focused check follows every proposed
boundary, and the full gate runs after the ninth. These subjects and boundaries
document future Git work only; they do not authorize staging or committing.

1. `CL-001: establish workspace guardrails`
   - Files: `.editorconfig`, `.gitignore`, `.prettierignore`, `AGENTS.md`,
     `eslint.config.mjs`, `package.json`, `pnpm-lock.yaml`,
     `pnpm-workspace.yaml`, `prettier.config.mjs`, `tsconfig.base.json`.
   - Focused check: `corepack pnpm install --frozen-lockfile --offline` and
     `corepack pnpm format:check`.
2. `CL-001: define core shared contracts`
   - Files: `packages/contracts/README.md`, `packages/contracts/package.json`,
     `packages/contracts/tsconfig.json`,
     `packages/contracts/src/boundary-primitives.schema.ts`,
     `packages/contracts/src/constants.ts`,
     `packages/contracts/src/ids.schema.ts`,
     `packages/contracts/src/text.schema.ts`,
     `packages/contracts/src/errors.schema.ts`,
     `packages/contracts/src/media.schema.ts`,
     `packages/contracts/src/transcript.schema.ts`,
     `packages/contracts/src/candidate.schema.ts`, and
     `packages/contracts/src/operation.schema.ts`.
   - Focused check: `corepack pnpm --filter @clipbuilder/contracts build`.
3. `CL-001: complete API and editing contracts`
   - Files: `packages/contracts/src/assembly.schema.ts`,
     `packages/contracts/src/visual-plan.schema.ts`,
     `packages/contracts/src/editor.schema.ts`,
     `packages/contracts/src/api.schema.ts`, and
     `packages/contracts/src/index.ts`.
   - Focused check: `corepack pnpm --filter @clipbuilder/contracts typecheck`
     and `corepack pnpm --filter @clipbuilder/contracts build`.
4. `CL-001: enforce deterministic contract boundaries`
   - Files: `vitest.config.ts`, `tsconfig.tests.json`,
     `test/boundaries.test.ts`,
     `test/fixtures/contracts-node-globals.negative.ts`,
     `test/no-network.setup.ts`, `test/pre-import-guard.fixture.ts`,
     `test/pre-import-guard.test.ts`, `packages/contracts/vitest.config.ts`,
     `packages/contracts/src/contracts.test.ts`, and
     `packages/contracts/src/contract-boundaries.test.ts`.
   - Focused check: `corepack pnpm --filter @clipbuilder/contracts test:unit`,
     `& .\node_modules\.bin\tsc.CMD --noEmit -p tsconfig.tests.json`, and the
     root Vitest suite.
5. `CL-001: add fail-closed backend configuration`
   - Files: `.env.example`, `apps/backend/package.json`,
     `apps/backend/tsconfig.json`, `apps/backend/vitest.config.ts`,
     `apps/backend/src/config/env.schema.ts`,
     `apps/backend/src/config/loadConfig.ts`,
     `apps/backend/src/config/loadConfig.test.ts`, and
     `apps/backend/test/environment.fixture.ts`.
   - Focused check: the backend configuration suite and
     `corepack pnpm --filter @clipbuilder/backend typecheck`.
6. `CL-001: expose the content-free backend health path`
   - Files: `apps/backend/README.md`, `apps/backend/src/app.test.ts`,
     `apps/backend/src/app.ts`, `apps/backend/src/composition.ts`,
     `apps/backend/src/http/errorMapper.ts`,
     `apps/backend/src/http/response.ts`,
     `apps/backend/src/http/routes/health.route.ts`, and
     `apps/backend/src/server.ts`.
   - Focused check: `corepack pnpm --filter @clipbuilder/backend test:unit`,
     its build, and the fake-mode `/v1/health` start/stop probe.
7. `CL-001: add the accessible frontend shell`
   - Files: `apps/frontend/README.md`, `apps/frontend/next-env.d.ts`,
     `apps/frontend/next.config.ts`, `apps/frontend/package.json`,
     `apps/frontend/tsconfig.json`, `apps/frontend/vitest.config.ts`,
     `apps/frontend/src/app/error.tsx`,
     `apps/frontend/src/app/layout.tsx`,
     `apps/frontend/src/app/not-found.tsx`,
     `apps/frontend/src/app/page.test.tsx`,
     `apps/frontend/src/app/page.tsx`, and
     `apps/frontend/src/app/robots.ts`.
   - Focused check: `corepack pnpm --filter @clipbuilder/frontend test:unit`,
     its typecheck, and its production build.
8. `CL-001: run deterministic CI quality gates`
   - File: `.github/workflows/quality.yml`.
   - Focused check: inspect workflow commands against the pinned root scripts
     and run `git diff --check`.
9. `CL-001: document the verified foundation`
   - Files: `README.md`, `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`,
     `docs/tickets/CL-001-initialize-workspace-and-contracts.md`,
     `docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md`, and
     `docs/tickets/README.md`.
   - Focused check: `corepack pnpm format:check`, documentation-link review,
     and an exact changed-file inventory against this plan.

After the series, run `corepack pnpm install --frozen-lockfile --offline`,
`corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit`,
`corepack pnpm build`, the fake-mode health probe, safety scans,
`git diff --check`, and final status inspection. Do not stage, commit, push, or
rewrite history without a later explicit Git authorization.

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
