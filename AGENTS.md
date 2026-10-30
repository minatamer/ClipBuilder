# ClipBuilder repository instructions

These instructions apply to the whole repository. The product and architecture
authority is `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`; implementation work
must follow one dependency-ready packet under `docs/tickets/` at a time.

## Authority and documentation ownership

- Owner recovery revision (2026-10-30, CL-158): automatically preserve the local
  working session through existing safe draft mechanisms in one separate rolling
  recovery store. No per-checkpoint Save opt-in or visible saved project per edit.
  Recover acknowledged clips/applied edits/assets/exports without new AI/render
  calls; interrupted work requires explicit retry. Keep two-hour expiry and
  explicit Start over cleanup, preserving owner-saved drafts/retained sources/
  exports. Hosted remains temporary with no durable recovery library. Tests stay
  synthetic/fake/paid-off; no real processing, configuration, cloud, deployment or
  Git action is authorized by this revision.

- Owner sound revision (2026-10-29, CL-141–142): fix audible cue preview and
  replace the rejected generic sound picker with actual researched recordings.
  Anonymous bounded public-sample downloads for curation are expressly requested;
  no generated approximation or licensing approval question substitutes for them.
  This is separate from fake/paid-off app verification and does not authorize
  inference, actual YouTube pipeline tests, cloud, Git actions or deployment.
  Preserve saved/private media and legacy cue decoding.

- Owner provider/audio follow-up (2026-10-29, CL-137–139): execute/validate the
  documented packets sequentially with synthetic/fake/paid-off checks. The
  owner expressly authorizes a secret-free edit of only AI_PROVIDER=codex in
  apps/backend/.env.local, preserving all other settings without displaying or
  inspecting their contents. Gemini is the default; Codex selection isolates
  every Gemini path, including the earlier fake-mode caption exception. This
  narrow config edit does not authorize changing fake/master/approval switches,
  real inference/download testing, cloud, deployment, push or new Git actions.

- Current owner AFK audit authorization (2026-10-26, CL-088–090): fully verify
  pending CL-084–087 work using fake AI/paid-off checks, document confirmed fixes,
  prepare whole-file plans and make local staging/commits; then renew quality
  and security audits through execute/validate loops with a file allocation for
  each. Preserve functionality, media, diagnostics and the healthy fake-mode app.
  AFK reviews are provisional; personal visual/real-AI/hosted/release acceptance
  remains owner-only. No provider spend, G Cloud access/change, scanner metadata
  export, deployment or push. Earlier audit evidence remains historical.

- Owner caption exception (2026-10-25, CL-078): an explicit confirmed local
  Generate captions action may use the configured Gemini key for the selected
  clip's audio even with FAKE_MODE=true / PAID_DEMO_ENABLED=false. This does not
  enable other paid features or hosted/test bypasses. Agents still use injected
  fake transports only and never trigger this paid action. New fake clips omit
  captions by a hardcoded default-off boolean and never auto-add the Earth image.
  A separate local-only Generate fake captions action may add fictional captions
  on demand without keys, paid consent or a paid attempt; hosted excludes it.
  Caption word corrections preserve IDs/timestamps. CL-078 owns implementation.

- Current owner AFK audit authorization (2026-10-24): finish local verification,
  prepare a whole-file plan and commit all existing pending work before the
  build workflow's quality/efficiency and security audits. Run justified local
  audit fixes through execute/validate and cohesive local commits. Preserve
  functionality, private diagnostics and the running app for owner paid review.
  AFK delegates ordinary decisions, not personal visual/release acceptance.
  Tests remain synthetic/fake/paid-off. No provider spend, cloud changes,
  deployment, push or scanner metadata export is authorized.

- Latest owner release decision (2026-10-24, CL-061): one normal application
  exposes upload, moment selection and the shared caption/picture/filter editor
  locally and when hosted. Only YouTube URL acquisition is local-only; hosted UI
  and server routes must exclude it. Earlier public no-editor restrictions are
  superseded. Hosted sessions retain origin/authentication, isolation, expiry,
  resource/spend bounds and temporary-media cleanup. Never deploy for the owner.
  No test using API credits or paid cloud services is authorized until the owner
  explicitly approves again; all agent checks use synthetic/fake/network-blocked
  composition. Do not reinterpret earlier live-test approval as continuing consent.

- Permanent owner Gemini acceptance decision (2026-10-24, CL-060): local
  validators log critiques of Gemini output; they never reject or hide usable
  returned results for grounding, evidence, timing/order, count/overlap or
  editorial/visual quality. Audit downstream duplicate gates as well as provider
  adapters. Preserve completed paid work for explicit retries. Basic decoding,
  authentication/binding, bounded resources and actual media/executable safety
  remain; safely convert physical render clocks without making quality a paid
  retry prerequisite. Never add an automatic provider retry. The source of truth
  owns this permanent rule; CL-060 owns implementation and verification.

- Follow the latest explicit owner decision, then the source of truth, then the
  active ticket, then an approved ADR, then research/history.
- Permanent owner motion decision (2026-10-23, CL-039): never introduce
  app-level reduced-motion suppression in CSS or JavaScript. Animations,
  transitions, smooth navigation and loading spinners retain their normal
  timing under every OS/browser motion preference. Do not alter OS/browser
  settings. Follow the motion decision in the source of truth; historical
  reduced-motion fallback/reconsideration requirements are superseded.
- Permanent owner design guard (2026-10-23, CL-041): local functionality follows
  the demo's design system. Reuse shared Button/Progress primitives and tokens;
  do not ship native/default-looking progress controls or isolated styling.
  Intake cards share stable header/body/footer geometry, with paired actions
  on one anchored bottom row. New states replace their content slot instead
  of appending controls/progress below existing forms. Use a coherent media
  preview with readable title, and inspect startup/loading/ready/transfer/
  failure/cancel states at desktop and phone sizes before claiming design done.
  The source of truth owns these product decisions; tickets own actual evidence.
- Permanent owner interaction rule (2026-10-23, CL-045): proceed and submit
  actions belong in the relevant footer, never scattered in scrolling content.
  The workspace footer owns analysis/processing, apply and export/download;
  intake uses its anchored card footers. Keep one context-relevant primary action,
  concise labels and actionable errors. Do not add tutorial/implementation prose,
  provider-call counters or redundant success messages to control flows. Inspect
  footer visibility and responsive states whenever adding or moving an action.
- Permanent owner view rule (2026-10-23, CL-048): successive form/result stages
  replace the current content slot through mutually exclusive views or tabs;
  never append another complete workflow below the input form and force scrolling.
  Clip selection uses Add clips / Your clips tabs, retaining inputs on navigation.
  CL-085 updates review: fresh/restored results retain all unique clips; owners
  remove unwanted cards instead of toggling selection. Cards show duration and
  Jump to source playback. More than ten retained clips disables processing
  until extras are removed; review never automatically submits processing.
  Keep only the active view's proceed action in the persistent footer, including
  a disabled Process clips when the results selection is empty. Verify tab state,
  keyboard use and responsive geometry whenever changing this flow.
- Owner flow audit (2026-10-23, CL-050–053): editing replaces the selection
  screen entirely, with keyboard clip tabs and one settings/sub-settings panel.
  Never hide a second workflow in a disclosure above/below an editor. Editor
  footer has one primary and Add more clips; dirty mode replaces those with
  Apply / Discard. Session actions use a compact menu, never accumulate in the
  footer. Caption and picture positioning/motion must work in actual scaled
  preview and native exports; verify real pointer gestures and saved state.
  Follow the documented audit before adding controls or prose.
- Editor readiness (CL-054): queued/exporting clips never expose editing
  controls just because retained prepared data exists. Follow the source of
  truth's completed-state/preview gate and vertical left clip rail.
- Local native parity: after changing local contracts/composition or worker
  code, rebuild and reload the normal backend's internal worker using verified
  lifecycle ownership. Preserve the other app/frontend, files and configuration.
  Native proofs compile their own current-source overlay into owned temporary
  scratch; never let an old `.local-build/overlay` silently validate new controls.
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

- Latest owner revision (2026-10-23): CL-027 replaces the separate owner app with
  local functionality in the normal 3000/4000 application and existing backend
  `.env.local` configuration. Retire the 4100 UI/owner launch commands and second
  provider mode; native media work is an automatically managed internal worker.
  Earlier standalone-only instructions below are superseded for this integration.
  Tests remain synthetic/fake/paid-off and never load ignored env files. Do not
  read, print or alter ignored configuration contents. No hosted deployment,
  provider/cloud request, Git action or deletion of retained/saved media is
  authorized. Execute CL-027 and the owner-requested validate pass.

- Owner local-workflow authorization (2026-10-22): implement CL-017–CL-024
  sequentially with execute/validate/fix loops and ticket-prefixed staging and
  commits after clean validation. The adopted local decisions are in the source
  of truth and local-owner ADR. This is a separate local-only composition;
  public workflow restrictions below remain unchanged. All agent checks use
  synthetic media, fake AI, paid-off and zero provider/cloud/real YouTube calls.
  No push, cloud build/deploy or paid processing is authorized. Add CL-025 for
  owner manual acceptance; do not mark its real-media checks passed. Preserve
  all retained masters/captures/private logs. The retained local video was checked
  for readability only; it is not an ordinary automated fixture.
- Local editing uses the same normal frontend/backend and app-local environment loading, ports 3000/4000. The backend internally owns the private loopback 4200 worker. No owner app, launcher or second AI setting remains. Normal process ownership, hidden launch and cleanup rules below apply. Sources, drafts and exports remain outside Git under OS Downloads/ClipBuilder; preserve masters, captures and private logs. All agent tests/harnesses force fake/paid-off with no ignored env reads or real downloads.
- Current product scope (CL-061): an owned/licensed uploaded conversation,
  manual/AI moments, bounded clip selection and the shared caption/picture/filter
  editor, explicit retry and MP4 exports. Hosted intake is upload-only; YouTube
  acquisition remains local-only. Hosted media/sessions are temporary, not the
  owner's local filesystem library. Earlier one-clip/read-only/no-editor scope
  is superseded. Do not add a chatbot, arbitrary timeline/renderer inputs,
  accounts, a database, durable hosted projects, a general queue, direct
  publishing, hosted remote-platform downloading or sensitive inference.
- Keep real media, filenames, transcripts, captions, prompts, provider payloads,
  generated assets, output videos, signed capabilities, account identifiers, and
  credentials out of Git, fixtures, logs, errors, URLs, screenshots, and
  documentation.
- Owner diagnostic exception (2026-10-05): for this local Gemini investigation,
  full returned response bodies/headers, normalized output and actual timing
  comparisons may be captured in private OS-temporary files outside Git. A
  workspace-bound permit expires after six hours; capture is unavailable in
  test, fake, preview and production composition. Normal stdout/stderr, browser
  responses, fixtures and committed documentation remain content-free. Do not
  serialize request authentication, environment values or credential files.
  Captures remain owner-local until removed after diagnosis; activation expiry
  does not imply file deletion. This exception changes no validation, dispatch,
  media cleanup, cloud or paid-testing gate. See the CL-007 local capture
  packet.
- Owner sample-replay release checkpoint (2026-10-07): the temporary local
  saved-analysis CTA, transport/cache reader and specifically authorized saved
  copy are retired during CL-015 final local paid-test preparation. Preserve
  original diagnostic captures, all private logs and both retained masters.
  Normal retained-source playback and fresh protected analysis remain. Do not
  restore a cache reader, Git fixture, hosted replay or provider retry. Paid
  testing remains owner-only. Historical exception/retirement evidence is in
  `docs/tickets/CL-007-local-sample-replay-and-thumbnails.md`.
- Owner retention decision (2026-10-03): `private/retained-demo-source/` holds
  the ignored, owner-managed local demonstration master and its private
  metadata. Preserve it during session cleanup, expiry, cancellation, repository
  housekeeping, release preparation and `git clean`. Never use it as scratch, an
  ordinary test fixture or a public/build asset. Replacement or deletion
  requires an explicit owner instruction naming this retained asset. Processing
  uses a separate uploaded copy whose original/proxies/output retain the normal
  deletion rules. See
  [local source preparation](docs/operations/LOCAL_RELEASE_PREPARATION.md#retained-owner-demonstration-source).
- Owner configuration decision (2026-10-06): normal backend defaults are
  `FAKE_MODE=false`, `PAID_DEMO_ENABLED=true` and all four approval flags true.
  Backend configuration comes from environment only. `PAID_DEMO_ENABLED=false`
  overrides cloud spend, Gemini transfer, image generation and paid-project
  approvals to false and disables cloud/sample reads, live routes, grants and
  dispatch allowance. Missing optional local prerequisites keep routes
  unavailable. Owner export follow-up: real paid mode enables analysis, assembly
  and final rendering directly in code; the obsolete `PAID_VALIDATION_STAGE`
  setting is ignored. This permits local export availability, not an agent-run
  paid flow or a private renderer deployment. Tests/CI/harnesses explicitly
  force fake mode, paid-off and every live/approval flag false before imports,
  with no credentials or external provider access.
- Owner decision (2026-10-04): paid-flow testing is performed manually by the
  owner only. Agents may run automated fake-mode checks, never trigger a live
  paid flow. A private renderer update retains its separate cloud/build approval
  and cannot be bundled with permission for an agent-run paid test.
- Never read an ignored `.env.local` or secret file to answer a configuration
  question. Inspect the owning app's `.env.example`; tell the owner which
  matching blank entries to populate manually.
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
environment, provider/cloud SDK or application dependency. `packages/contracts`
cannot import React, Next.js, Express, Node-only APIs, provider/cloud SDKs,
environment readers, fixtures, or application code.

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
  arbitrary composition, command, path or remote asset input is permitted. Cloud
  compute/spend gates are independent of fake/live AI. Renderer tests use
  injected ports without ADC or network. Private test infrastructure has its own
  approval checkpoint at the first cloud-dependent test, not after release
  audit.

## Explain fake-mode and live capabilities

- Whenever explaining a feature, proposing a test, requesting owner input, or
  reporting ticket status, explicitly state what currently works with
  `FAKE_MODE=true` and no API keys, and what requires real provider API keys,
  enabled live flags, and the applicable approvals. Identify fixture/mock
  results separately from real processing; fake results do not prove live AI
  quality or readiness.
- Distinguish API-free processing from AI-free processing. A real local AI model
  may need approved weights and runtime tooling without needing provider API
  keys. State whether those assets and the implementation are available,
  verified, or still missing.
- Before asking for media, credentials, or another prerequisite, explain which
  test or capability it unlocks and what else remains necessary. Separate
  implemented and verified behavior from planned or blocked behavior; do not
  imply that supplying one input completes an unfinished pipeline.

## Deterministic verification

- Tests set `NODE_ENV=test`, `FAKE_MODE=true`, `PROVIDER_MODE=fake`,
  `PAID_DEMO_ENABLED=false`, and every live flag false before application
  modules load.
- The shared Vitest setup installs those values and network interception at
  module top level. A `beforeAll` hook is too late because Vitest imports test
  modules before suite hooks run.
- Every Vitest configuration, including owner and native-proof configs,
  disables environment-file loading with
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
  frontend and backend. A named target operates only on that service. `kill` or
  `kill all` stops this repository's app stack, not other repositories or every
  Node process. Contracts are a build prerequisite, not another server; the
  retained media feasibility proof runs offline tests and opens no service; its
  former port 4185 testing UI is retired and is not part of the default stack.
- Follow the [backend guide](apps/backend/README.md#run-locally) and
  [frontend guide](apps/frontend/README.md#run-locally). Use the pinned package
  manager from the repository root. Build contracts before first startup and
  after contract changes with `corepack pnpm build:contracts`. Normal local
  launches use `corepack pnpm dev:backend` and `corepack pnpm dev:frontend`; use
  the guides' build/start commands only for a requested production-like run.
- For a full-stack start, launch the backend first and wait for content-free
  `GET http://127.0.0.1:4000/v1/health` to return `200`, then start the
  frontend. The frontend binds to `127.0.0.1:3000`; open
  `http://localhost:3000/start` to match the origin policy. Check `/start` and
  `/api/sample/config` return `200` before reporting the workflow reachable.
  These GET checks do not prove provider readiness or authorize a processing
  request.
- The backend defaults to `127.0.0.1:4000`, and the current frontend fixture
  bridge pins that upstream port. Do not silently choose different ports,
  rewrite origins, or change the owner's environment to resolve a conflict. If
  an intentional backend port override makes the bridge incompatible, report the
  mismatch rather than claim the full stack works.
- Launch long-lived local app processes outside the restricted sandbox through
  the tool's explicit escalation/approval mechanism. Do not change sandbox
  policy or bypass a denied operation. Deterministic tests and CI retain their
  isolated fake/paid-disabled setup; a local run is not approval for providers,
  paid calls, cloud changes, or deployment.
- Use normal owner-managed configuration. On explicit non-test local startup,
  `apps/backend/src/server.ts` loads ignored `apps/backend/.env.local` if
  present; Next.js owns `apps/frontend/.env.local`. There is no root environment
  file; existing process-environment values take precedence. Let the entry point
  load it, without reading, printing, copying, or overwriting its contents. Do
  not force fake/test flags for a requested normal run, create a second frontend
  mode setting, or bypass feature gates. Missing setup is described using the
  blank entries in the owning app's `.env.example`; never inspect secrets to
  diagnose it. The backend environment contains credentials, operating switches,
  private connection/sample references and four approval flags. No runtime JSON
  is loaded or required. Deployment injects the same environment keys without
  relying on a local file. Numerical limits, timeouts, model selection and retry
  policy are fixed in code, not environment overrides. Secret-free
  setup/migration is allowed when the owner explicitly authorizes it; do not
  print values.
- In normal local real mode, incomplete optional paid-feature prerequisites
  leave paid routes unavailable with zero dispatches while the app can start.
  Preserve the operating switches and paid-master precedence for retained
  playback; never enable paid routes, substitute fixture results or record
  approvals to make a restart pass. Structural errors, conflicting modes and
  public/test paid composition still reject. Fixed startup requirement codes
  contain no values.
- Before launching, inspect the intended ports and establish process ownership.
  Reuse a healthy matching instance for `run`. Stop a verified stale matching
  instance first, including its watcher and children. Never kill an unrelated or
  unidentified port owner; report the conflict without a port fallback.
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
