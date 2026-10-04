# CL-015 — Bounded renderer setup and later public deployment

## Current cloud-render packet — approved local execution, 2026-10-02

Status: local release preparation complete; validation has no actionable local findings and all five root gates pass. Strict release verification rejects the current Windows artifact; actual target-platform deployment acceptance remains unchecked. Early private resources/authentication/Linux media/expiry-deletion evidence remains under CL-006. Complete public deployment remains gated and unperformed.

Authority: [Google/Cloud Run migration plan](../architecture/GEMINI_REMOTION_MIGRATION.md); [file inventory](../architecture/MIGRATION_FILE_INVENTORY.md); [later setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md).

This packet has two separate checkpoints. Preserve owner debug-page exclusion
and prior evidence; neither checkpoint is authorized by documentation alone.

### Early private infrastructure for local tests

After documentation approval, prepare the minimum ready image/adapters and
authentication/lifecycle/spend controls required by the first actual
cloud-dependent test. Pause there for explicit provisioning and synthetic-test
budget authorization, potentially during CL-005/006 integration. Use the setup
guide to establish only private renderer/bucket/expiry/registry/identities in the
verified existing project. Private IAM, generation fencing, cancel/scratch
cleanup, independent expiry/deletion verification and bounded spend/logging
controls are prerequisites; bring those relevant CL-012 controls forward.
Completion of all later features, the complete CL-012 packet and the CL-014
public release audit are not prerequisites for this isolated synthetic test
renderer. Verify with fake AI/synthetic input, then resume the owning packet.
Live reference media and Gemini calls require separate later authorization.

### Later complete public deployment

Complete public application hosting/release retains the exact CL-014 revision
audit and separate owner hosting/privacy/rights/live/spend approval. It is
distinct from early private test infrastructure and cannot silently expand it.

After documentation approval, implement one dependency-ready packet at a time
and run focused checks plus the required settled five root gates. Fake/live AI
and local/cloud compute are independent; cloud render can incur cost with fake
AI. Ordinary tests remain synthetic, credential-free, fake/off and zero-network
through injected ports. Early setup authorization/evidence is recorded in CL-006;
its source-specific private media and cleanup tests passed. Public deployment,
new real-source/live-AI transfer and
Git actions retain separate gates. Usage polling and independent review remain stopped.

- [x] Owner explicitly approved documentation and local corrections on 2026-10-02.
- [x] Owner separately approved early private setup and bounded synthetic allowance; resource/authentication evidence is in [CL-006](CL-006-build-media-job-and-speaker-feasibility.md#private-renderer-setup-and-deferred-media-validation--2026-10-02).
- [x] Early private cloud media/expiry-deletion validation: rights-confirmed 2:45 private test passed under CL-006; fake AI, verified Linux image, cancellation and accelerated independent deletion.
- [x] Implement locally buildable production-output exclusion and release/rollback preparation; external phases remain unchecked.
- [x] Complete local validation, five root gates and exact build/input evidence; this is not complete deployment acceptance.
- [ ] Complete the owner-requested `artifacts/` cleanup checkpoint below before freezing the deployment build.
- [ ] Complete the owner-requested Google Search favicon/crawlability checkpoint below before freezing the public deployment build; retain its post-release indexing follow-up.
- [ ] Build acceptable immutable target-platform images; verify actual deployment, negative URL probes, bounded live quality/cost, kill switch/rollback and remaining rights/AI/cloud/license/device gates after approval.

### Owner-requested Google Search favicon checkpoint — 2026-10-04

The owner requested checking the ScreenPilot search-icon issue and recording
its prevention as required pre-deployment work. Read the referenced chat
“Find why Google icon is missing”: it reported an SVG-only homepage declaration,
then a stable 96×96 PNG fix and an owner Search Console recrawl request. That
other application's deployed result was not independently retested here.

ClipBuilder has the same SVG-only readiness gap: `src/app/icon.svg` is a square
32×32 icon, with no committed PNG/ICO favicon or explicit raster icon metadata
in `src/app/layout.tsx`. The proxy's `favicon.ico` matcher exception does not
create an asset. In addition, `src/app/robots.ts` currently disallows `/` for all
crawlers, including the homepage and icon. This is the current unreleased-site
policy; release must deliberately allow the public landing page and favicon.
No claim is made about an existing ClipBuilder Google result or live HTTP status.

[Google's current favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search)
lists PNG/ICO and other raster formats, requires a square representative icon,
stable URL and crawlable homepage/icon, and recommends a size above 48×48.
SVG is not in its current listed formats, so SVG alone is not the release plan.
Meeting eligibility does not guarantee display; recrawling can take days to weeks.

Required before the public deployment build is frozen:

- [ ] Export the existing approved brand icon as a square **96×96 PNG**, served
      at a stable `/favicon.png` URL. Preserve the approved visual identity.
- [ ] Explicitly declare that raster icon in the homepage's generated `<head>`
      with the correct type/size. Verify actual emitted markup, including Next's
      file-based icon metadata, rather than assuming a metadata edit wins.
- [ ] Change the release crawl policy so Googlebot can fetch the public `/`
      homepage and Googlebot-Image can fetch the favicon. Preserve local/preview
      crawl restrictions and keep workspace, API and private-media boundaries
      protected; robots rules are not an access-control mechanism.
- [ ] Keep proxy asset matching, image packaging, release route/asset inventory
      and focused tests consistent with the chosen icon implementation. Verify
      the asset is included in the exact immutable frontend image.
- [ ] Check unauthenticated homepage/icon responses, raster dimensions, MIME
      type, stable icon link, redirects and absence of blocking robots/header
      directives for the chosen public hostname. Record build/synthetic checks
      separately from later deployed HTTP evidence.

Post-release follow-up, after the separately approved deployment:

- [ ] Verify the same homepage/icon checks on the actual public hostname and any
      approved alternate hostname; confirm redirects and canonical host policy.
- [ ] Complete owner Search Console verification and request inspection/indexing
      of the canonical homepage. Record the request and later observed favicon
      state separately; do not promise immediate display or wait for Google's
      appearance update as a pre-deployment acceptance condition.

This follow-up changes documentation only. Static checks and public-icon tests
need no Gemini key and work with `FAKE_MODE=true`; they prove no live AI quality.
Real processing still needs provider keys, live gates and applicable approvals.
No icon asset, runtime/robots configuration, app process, cloud resource, provider
request, deployment or Git state was changed. The prior testing/startup blocker
remains unchanged. `git diff --check` is the documentation whitespace check;
no application test suite is claimed as rerun.

### Owner app-local configuration follow-up — 2026-10-04

The owner authorized moving frontend/backend `.env.local` files and examples
inside their apps, creating the secret-free local files, and fixing numerical
policy in code. This is a local configuration follow-up, not hosted transport
or public release authorization.

Backend examples contain only `FAKE_MODE`, `PAID_DEMO_ENABLED` and blank
credentials. The frontend example is comments only: no secrets are needed yet
and backend mode is authoritative. Ignored backend `runtime.local.json` holds
private connections, generation-pinned sample metadata and recorded independent
approvals; its committed example has blank/null private references and false
approvals. The executable entry point loads app-local files only during explicit
non-test local startup. The obsolete root environment file/example are removed.

Composition derives analysis/assembly/render capabilities and the fixed 2/3/4
dispatch allowance from the approved validation stage. Paid-off disables every
paid capability and grant. Old limits/rates/timeouts/live-feature environment
overrides reject; shared product ceilings and server policy remain in code.
No dependency or lockfile changes. The release inventory rejects private runtime
files alongside environment files. Current owner configuration enables only
the separately approved real sample preview with paid processing disabled.

- [x] Owner authorized secret-free app-local setup and the fixed-policy change.
- [x] Both local environment files and backend private runtime metadata are ignored.
- [x] Focused configuration/admission/media/provider tests: 119 synthetic tests in 6 files; no real credentials, network or provider calls.
- [x] Settled `corepack pnpm format:check`, `lint`, `typecheck`, `test:unit` and `build` pass; 683 synthetic tests in 69 files. `git diff --check` passes.
- [x] Read-only validation of the final configuration/test/build-exclusion changes has no actionable local findings for this follow-up. Complete public deployment acceptance remains open.
- [x] Normal app-local startup: backend health, frontend `/start` and safe config return 200. Real sample playback advances and seeks to 02:00; owner reported it working. No AI or render dispatch.
- [ ] Detailed perceptual sync and real Clear/reload preservation; live Gemini quality, public authenticated routing, target-platform release artifact, deployment, device/rights/spend and rollback evidence remain separate gates.

Validation covered app-local loading in source/compiled entrypoints, default/test
isolation, strict private-runtime shape, code-fixed numerical policy, the paid
kill switch, unchanged cloud/provider approval gates, dependency directions,
blank/ignored examples, release exclusion and synthetic regression coverage.
The prior CL-016 protected-storage documentation was preserved and updated only
with actual runtime evidence. No dependency/lockfile change or Git mutation.
No media/credential content was captured. The direct optional Markdown formatter
reported style warnings in repository-ignored Markdown; broad formatting was
not applied. Both code formatting and diff checks pass. A test fixture retained
old disabled flags in its synthetic production case and was corrected; lint
also found a console statement in the earlier ignored storage probe, corrected
to the allowed content-safe warning output. Final gates pass after both fixes.

The local frontend artifact has 1,277 files, eight app routes and 26 external
package links: `selfContained=false`, SHA-256
`615735c359e5fb563b43d8fe1b7b587e680cecd57d8a94978cd5eea18fd1ba86`.
This passes local inventory, not strict target-platform release acceptance.

Apps are left healthy for the owner: backend listener PID 5356 / supervisor
7904 on 4000; frontend listener PID 18080 / supervisor 12240 on 3000. The working
URL is `http://localhost:3000/start`. Creation-time-bound process-tree records
and separate redacted stdout/stderr logs are ignored under
`artifacts/local-run/protected-sample-20261004/`; keep them while apps run.
Source master paths/configuration and both retained masters were preserved.

### Owner local restart follow-up — 2026-10-04

The owner requested resolving the repeated restart failure before preparing
and executing a file-level commit plan. The standard kill/run sequence was
verified; the normal backend command failed before listening because optional
paid-feature prerequisites were treated as fatal application configuration.
This local correction separates app startup from paid-feature availability.

For local real mode only, recognized incomplete Gemini, grant/Turnstile,
renderer, retained-read or validation-stage prerequisites disable the affected
optional capability. All paid capabilities/grants and dispatch allowance are
disabled together when processing setup is incomplete. Health and local intake
remain available; independently approved retained playback is preserved.
The owner's operating switches, secret entries, private connection metadata
and approval records are not changed. Fixed requirement codes are logged,
without values, and are not added to the public configuration response.
Malformed structural settings, conflicting modes, public/test paid composition
and retired overrides remain fatal. Completed approved stages retain the fixed
2/3/4 dispatch budgets and existing rights/admission/provider controls.

The new synthetic HTTP regression first reproduced the same startup rejection.
After correction it verifies health/config 200, real mode without fixture
fallback, absent paid routes, zero dispatches and exactly zero Google transport,
renderer identity and Turnstile verifier compositions. Focused configuration,
admission and development-preview checks pass 54 tests in three files after
the plain-key migration follow-up.
Additional regressions cover each missing secret/approval, unapproved stage,
invalid grant ring, malformed/contradictory settings, nonlocal rejection and
independent retained-playback availability. Tests keep the hardcoded fake/off
process environment, synthetic inputs and network guard; no private files,
credentials or actual provider/cloud calls are used.

All five root gates pass with 721 synthetic tests in 70 files (root 33/4,
contracts 60/5, composition 3/1, backend 248/16, frontend 316/32, renderer 61/12).
The stopped stack's 23 captured identities are absent and both ports are free
through a three-second stabilization check. Normal backend/frontend startup
then passes health, `/start` and `/api/sample/config` GET checks with 200.
The content-safe record/logs are in ignored
`artifacts/local-run/restart-20261004-plain-key/`; requested apps remain running.
Startup reports no missing/invalid grant key. The remaining fixed codes identify
Google transfer approval, paid-project confirmation, Turnstile hostname and
renderer connection; no private file was inspected to obtain that diagnosis.
No sample read, processing request, provider request or cloud update was made.
The [whole-file commit plan](CL-015-016-LOCAL-COMMIT_PLAN.md) records the
owner-authorized integration and evidence groups. This correction
does not update the private renderer, authorize paid testing or complete public
deployment. Fake mode remains key-free and synthetic; real processing still
requires the complete keys, approved stage and applicable approvals.

### Owner code-fixed grant label follow-up — 2026-10-04

The subsequent plain grant key follow-up below supersedes this entry's JSON
setup; the code-fixed `v1` label remains current.

The owner reaffirmed that `.env.local` should contain secrets and the two
operating switches, and requested keeping the nonsecret grant key label in code.
`ACTIVE_PROCESSING_GRANT_KEY_ID` is now `v1` in the owning grant module. Backend
composition derives its selected encryption key from this constant; the active
label is removed from environment parsing, examples and synthetic composition.
Only `PROCESSING_GRANT_KEYS_JSON` is required, and it must contain a valid `v1`
entry. Additional ring entries retain their existing rotation/decryption role.
An obsolete `PROCESSING_GRANT_ACTIVE_KEY_ID` environment value is ignored,
allowing manual removal without changing the existing secret or breaking setup.

The regression first failed because an environment selector changed the issued
key label. It now passes and issues a grant with the code-selected `v1` label,
even when a legacy selector and legacy ring entry are supplied. Missing `v1`,
malformed/empty keys, fake/test isolation, paid-off, rights/transfer/cloud gates
and actual admission behavior retain their existing checks. Focused configuration
and admission verification passes 38 tests in two files, using synthetic keys
and zero external requests.

The backend guide, provider setup/generator, controlled-check prerequisites and
current owner configuration authority reflect this removal. No dependency,
lockfile or cross-boundary schema change, ignored local file read/write, app
launch/restart, provider/cloud action or Git mutation is included.
Fake mode continues to work without keys and supplies synthetic results. Genuine
Turnstile/Gemini, updated private renderer, real media/quality/cleanup, approved
AI/cloud/build allowance and deployment/release remain unchecked.

### Owner plain grant key follow-up — 2026-10-04

The owner requested pasting the generated key directly into environment
configuration. `PROCESSING_GRANT_KEY` now holds one canonical 32-byte base64url
secret; the `v1` label and internal codec map remain in backend code.
Examples stay blank, and the private CMD generator prints only the key.
Normal composition validates the plain value before mounting admission.
The former JSON entry (or a plain key saved under its old name) remains readable
only when the new entry is absent. An explicit new entry, including blank,
takes precedence. No ignored file or credential is read, rewritten or generated.

Synthetic regressions cover actual grant issuance with the fixed label,
legacy migration, new-entry precedence, missing/malformed/noncanonical keys,
disabled paid routes and pre-import removal of both old and new secret variables.
Fake mode remains credential-free. Real processing still needs the complete
provider/Turnstile setup, renderer revision, approved stage and applicable
rights/transfer/spend approvals; this change authorizes no paid call or rollout.
The focused run passes 54 tests in three files, and settled full verification
passes all five root gates and 721 tests in 70 files. The read-only local
validation pass finds no actionable issue in this follow-up; real provider,
widget, renderer, media-quality, cleanup and deployment evidence remains open.
An additional five-test pre-import run starts with synthetic plain/legacy grant
entries and paid/live-shaped inherited switches; setup removes both secrets
and forces fake/paid-off configuration before test modules load.

Final local gates passed: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit` (714 tests in 70 files),
`corepack pnpm build`, and `git diff --check`. The root format check covers source;
Markdown is excluded by `.prettierignore`, and its whitespace was checked by
`git diff --check`. The local frontend artifact inventory still reports 26
external package links and `selfContained=false`; a successful local build does
not satisfy the strict release-artifact gate or authorize deployment.

### Owner fake-only automated verification follow-up — 2026-10-04

The owner reserves paid-flow testing for their own manual actions and permits
agents to run only fake-mode automated checks. All automated verification must
be hardcoded fake/paid-off before any renderer revision update. This follow-up
prepares and verifies that boundary locally; it performs no deployment, provider
call, credentialed probe, media transfer or manual paid flow. Private renderer
build/compute approval remains separate from owner-only paid processing.

All six Vitest configurations now use `envDir: false`, preventing local
environment-file loading. One shared test-only initializer overwrites operating
flags with `NODE_ENV=test`, `FAKE_MODE=true`, derived mode `fake`, paid/cloud/live
capabilities off and zero dispatches. It removes inherited Gemini, Turnstile,
plain/legacy grant secrets and explicit ADC/Cloud SDK credential variables before test imports.
Both frontend/renderer media commands and the selected-proxy native proof import
this initializer before their other modules. The frontend harness uses explicit
Node TypeScript stripping; its allowlisted delivery remains local-only.

The worker-lifetime socket guard is independent of Vitest mocks, so
`vi.restoreAllMocks()` cannot remove it. Test cleanup leaves network interception
and fake/paid-off settings installed; it no longer restores inherited live flags.
Unexpected external fetch/socket attempts fail checks; deliberate guard probes
are blocked and asserted. Configuration tests may supply synthetic live-shaped
objects to exercise rejection/composition and injected adapters, without changing
the real test process or enabling actual provider/cloud work.

Two regressions first failed under synthetic inherited paid settings/credential
variables: credentials were visible during test imports, and mock restoration
removed the socket guard. After correction, the focused pre-import run passes
five tests and proves a guarded socket cannot connect after mock restoration.
The frontend bridge/harness run passes 19 tests in three files. A direct Node
TypeScript-strip import of the frontend harness confirms fake/paid-off/test mode
without launching its server. No agent inspected private local files or
credential content, and test environment-file loading is disabled. No dependency,
lockfile, application policy,
shared contract or retained-master change is included.

Final local gates passed: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit` and `corepack pnpm build`.
The full unit run passed 716 tests in 70 files: root 33/4, contracts 60/5,
composition 3/1, backend 243/16, frontend 316/32 and renderer 61/12. All suites
used the shared hardcoded fake/paid-off environment and network guard. The root
format gate covers source; Markdown is excluded by `.prettierignore`, and
`git diff --check` verifies whitespace. The local frontend artifact still has
26 external package links and `selfContained=false`, so its local build does
not satisfy strict immutable release-artifact acceptance. The full native media
proofs are opt-in and are not claimed as rerun by unit checks.
Genuine Gemini/Turnstile, renderer revision, real output quality/cleanup, rights,
cloud/build allowance, devices and deployment acceptance remain unchecked.

### Owner-requested artifacts cleanup — 2026-10-04

The owner requested a reminder to clean `artifacts/` during this deployment
ticket. Perform this checkpoint during release preparation; this reminder does
not authorize immediate deletion or deployment.

- [ ] Inventory old QA captures, temporary setup scripts and logs. Preserve useful
      release evidence in concise, content-free documentation before removing
      obsolete files; keep evidence references truthful.
- [ ] Move genuinely reusable operational tooling into its owning maintained
      module, with private values supplied through configuration.
- [ ] Preserve process ownership records and needed logs while their apps are
      running. Verify shutdown before removing obsolete runtime records; retain
      sample-reference metadata until its permanent configuration is verified.
- [ ] Verify every resolved deletion target is inside this repository's
      `artifacts/` directory. Preserve `.env.local`, credentials and both retained
      sample masters, including `private/retained-demo-source/`.
- [ ] Verify ignored artifacts, private media and credentials are excluded from
      deployment inputs/images, then record the cleanup scope and result here.

## Local execution - 2026-10-03

Owner authorized continued fake-mode local work and sequential ticket-prefixed
commits through CL-015; deployment and real media/device tests are deferred.
CL-014 is `6ccd9d4aa487e15db27ea1b0f978f6a5b396897b`; initial worktree was clean.
[Local release preparation](../operations/LOCAL_RELEASE_PREPARATION.md) owns the
existing-build inspection, later artifact/routing/negative-probe/rollback
checkpoints and every remaining gate. Frontend README owns exact commands.
At this packaging checkpoint, the public hosting/paid operating-model decision
was still outstanding and no adapter/container topology was invented. The later
[owner release decisions](#owner-release-decisions--2026-10-03) select the approach;
implementation/proof remains pending. Existing nonlocal protected/paid
composition remains fail-closed; missing keys are not a local implementation
blocker or evidence of a complete public pipeline.

`apps/frontend/scripts/verify-release-artifact.ts` inspects standalone, separate
static and optional public inputs. The normal frontend build uses explicit local
mode; a separate default-strict release command rejects external links. Eight
current app entries, no rewrites, known framework routes/redirect and bounded
path/file/hash inventory prevent the local harness becoming published input.
No environment/secret read, copying, listener, provider or cloud work on import.
No dependency or lockfile change. Synthetic fixtures are cleaned in finally.

Initial real-build validation rejected the legitimate `[...path]` route because
an overbroad `..` substring check treated catch-all syntax as traversal. Complete
path segments are now checked; the regression fixture contains that route.
A separate unresolved-public-input regression failed before the fix: ENOENT
inside an existing public tree was silently treated as an absent directory.
Narrowed the exception to root presence only; the existing tree's failures reject.
Known Windows Next package junctions are not hidden: local mode inventories them
without following them and reports `selfContained:false`; strict release rejects.
The current 26 external package links require a later approved target-platform
build and strict check. Local passing inventory cannot replace final image
inspection or actual deployed 404 probes.

Focused installed Vitest artifact tests: 8 passed in 1 file. Typecheck passed.
Validation pass 1: **Meets ticket with concerns** for the owner-authorized local
scope, **no actionable findings**. Read-only review inspected tracked and new
files, the full current/historical ticket, installed Next output guidance,
route/asset inventory, frontend build/entrypoint, renderer packaging boundaries
and backend nonlocal fail-closed composition. No suite, edit, staging or external
action ran in that review. Covered: local harness exclusion, exact current app
routes, bounded hashing/link handling, synthetic rejection regressions, narrow
command/document ownership and release/rollback handoff. Partial/unverified:
actual self-contained target-platform image, deployed entrypoints/404 probes,
public authenticated transport/paid model, live/media/device/rights/provider/
cloud/operational evidence. The strict Windows rejection is intentional and
recorded, not misreported as a deploy pass. Deferred items were not completed
because the owner explicitly limited this sequence to local/fake work and
postponed actual testing/deployment; the unresolved hosting/operating-model
decision also precedes those implementation choices. They remain unchecked.
Settled root results: `corepack pnpm format:check`, `lint`, `typecheck`,
`test:unit` and `build` all pass; `git diff --check` passes. **632 synthetic tests
in 65 files**: root 29/4, contracts 58/5, composition 3/1, backend 195/14,
renderer 56/11, frontend 291/30. Units ran separately from CPU-heavy checks;
no thresholds/timeouts changed. The final normal build's local inventory passes:
1,276 files, 26 links, 22,017,979 bytes, eight app entries, SHA-256
`56fe9dcedaa3844ee5058a4af1eb05e4e01bc6c924ccb714ac9a071c24a28062`.
`externalPackageLinks:26`, `selfContained:false`. The strict command against
that final output returns exit 1 / `release_artifact_invalid`, the expected
external-junction rejection; it is not counted as a passed release gate.
Focused three-file source/config/test input digest is
`4ead811a10da6a8d8c010d6b29b89f0f810f814bbff8aa90b5d05fba5fc31777`;
unchanged lockfile identity and re-audit scope are in the release ledger.
Synthetic scratch is removed, no artifact-test temporary directories remain,
and no app/listener/cloud/provider/manual/device/media action was started.
[Whole-file commit plan](CL-015-COMMIT_PLAN.md) covers one immediately authorized
sequential commit: `CL-015: prepare gated release verification`.

Fake/no-key
results prove synthetic/path/lifecycle boundaries, not a real MP4 or AI quality.
Real Gemini needs keys/live/rights/data/paid approvals; private render/storage
has an independent IAM/cloud/compute approval. No local AI weights/runtime.
Actual native media/full bounds/device/accessibility/CSP/font/visual/film,
provider privacy/current settings, licenses/rights/scans, monetary hard controls,
public topology/auth/rollout, immutable images, deployed probes and operational
kill-switch/rollback/deletion/cost observations remain unverified. Earlier
CL-006 private Linux/media evidence is preserved and does not attest this release.

## Owner release decisions — 2026-10-03

After reviewing ScreenPilot's SP-026 deployment, SP-028 private-backend trust
boundary and recorded cost controls, the owner confirmed the proposed answers
except the public-media rights question, which needs clarification, and Gemini's
numerical spending amounts, which will be decided at paid testing. This section
records decisions, not completed implementation or external execution.

| Question | Owner-confirmed choice / remaining item |
| --- | --- |
| 1. Public hosting | Cloud Run frontend and control API alongside the existing private renderer, using the already-approved ClipBuilder project and europe-west1 region. |
| 2. Public access and identities | Only the frontend is public. Browser API calls remain same-origin; limited runtime identities authenticate frontend-to-control and control-to-renderer. The expiry caller remains separately scoped. |
| 3. First URL and release method | Managed frontend run.app URL, manual deployment of exact audited images; a custom domain is later and GitHub Actions remains quality-only. |
| 4. Paid operating model | Hosted verification begins fake/paid-disabled/live-off. After controlled live verification and enforceable spend safeguards, separately approve anonymous public processing protected by Turnstile and existing limits. |
| 5. Provider/privacy approach | ClipBuilder-scoped paid Gemini project, disclosed proxy transfer, no optional data sharing, limited provider safety retention and an adult audience in supported regions. This accepts the approach; actual account/settings and public privacy-copy verification remain pending. The hosting region is not a guarantee of provider processing residency. |
| 6. Public sample/example/film | The owner selected the researched open-licensed conversation as the preferred source. The recommended 7:41 excerpt is input preparation only; actual source quality and remaining public/promotional/provider-transfer rights evidence are unverified. The earlier 2:45 source permission remains private-test-only. |
| 7. Monthly spend | USD 10 project and USD 5 Cloud Run alert targets confirmed. Earlier USD 10 evidence remains valid for that checkpoint; the intended USD 5 alert is still unconfirmed. Gemini's numerical monthly limit is deferred until paid testing establishes per-flow cost. Alerts are not hard caps. |
| 8. First complete live validation | Plan one complete flow, at most two AI calls and four media operations, with no automatic paid retries. Prepare a current-price estimate and obtain a fresh numerical test allowance before dispatch. No new dollar allowance or paid run is authorized now. |

The public-media question concerns content supplied by the project: a prepared
real sample, downloadable demonstration clip or real conversation shown in the
landing film. Permission to process it privately does not itself record consent
to those public uses. An owned/licensed source needs rights covering its speakers,
audio, edits/redistribution and provider transfer, plus any included third-party
assets. The preferred source selection records the owner's choice; remaining
third-party permissions are not established by that choice alone.
Keeping this pending does not block local fake code/documentation. Visitors'
own uploads have a separate rights/transfer confirmation; they are not automatically
public project samples. Public media remains outside Git and this decision record.

The owner clarified that the recommended 7:41 input must exercise the normal
system analysis and extraction flow. Its duration and preparation boundaries
are not predetermined output ranges or an expected-answer fixture. Do not
hardcode candidates, captions, contextual cards or speaker framing for this
sample, or bypass analysis based on its filename, hash, episode or participants.
The [current product rule](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#current-owner-revision--gemini-and-private-cloud-run-rendering-2026-10-02)
owns this constraint. Live grounding, framing and output quality still need
authorized real-source verification; no new implementation or live-quality
evidence is claimed by this documentation.

Project/region/private storage/cleanup and private-test Remotion coverage were
already approved under CL-006 and are carried forward without another choice.
Complete release license/telemetry/notices and actual saved cloud settings still
need evidence. The [cost plan](../operations/COST_MODEL.md#owner-budget-decisions--2026-10-03)
owns alert versus hard-limit status and the deferred Gemini/test amounts.

No application/configuration/secret/cloud resource was changed, paid call made,
deployment performed or public switch enabled by this documentation pass. Public
transport/identity/container implementation, acceptable immutable artifacts,
current-revision audit, hosted checks, real quality/cost/deletion/rollback and final
UI/film/release acceptance remain outstanding. Fake/no-key fixtures still work
with disabled Download and zero provider calls; no local AI model is implemented
or verified. Real Gemini needs keys/live/rights and budgeted call approval; actual
cloud rendering has independent IAM/compute/spend approval.

Documentation-only verification: `corepack pnpm format:check` and
`git diff --check` pass. That owner-release-choice pass changed five owning
Markdown documents; application
code/configuration and the lockfile are unchanged. No code test suite was rerun.

## Retained local demonstration input — 2026-10-03

The owner authorized local extraction of the agreed continuous 7:41 source and
explicitly authorized retaining it. Local storage was selected, outside the
disposable cloud bucket and every application session/scratch cleanup path.
The ignored master, preservation notice and private manifest are under
`private/retained-demo-source/`; original download content remains untouched.
The operating constraint is recorded in `AGENTS.md`, the current source of
truth and migration retention section. The [preparation record](../operations/LOCAL_RELEASE_PREPARATION.md#retained-owner-demonstration-source)
owns exact use/preservation rules and aggregate media evidence. Replacement or
deletion requires the owner's explicit instruction naming this retained asset.
Separate uploaded copies and derived artifacts retain ordinary deletion.

Verified: 461-second 1280×720/25fps AVC/AAC stereo MP4, 55.57 MiB; native full
video/audio frame decoding, zero-based track clocks, intake bounds, private
checksum manifest and Git exclusion. Renderer scratch ownership and allowlisted
image context exclude the retained master. The minimal bundled FFmpeg lacks
the null-output default encoder; strict FFprobe frame decoding provided the
native validation instead. No subjective quality, live analysis, complete
render or real-device acceptance is claimed. The source is input only, with no
preselected candidate outputs or automatic upload/processing integration.

Local preparation uses no AI, API keys or cloud resources. Fake-mode application
results remain synthetic. Real Gemini and remote render keep their separate
keys/live/rights/data/paid and cloud/compute gates; public/promotional rights and
live-output quality remain unchecked. No credentials, provider call, cloud
change, app startup, staging or commit was used. Documentation formatting and
diff checks pass; application code/configuration and the lockfile are unchanged,
so no code test suite was rerun for this preparation.


<details>
<summary>Earlier packet and evidence, retained as history where superseded</summary>


Status: Planned; final hosting/provider/launch gates pending<br>
Milestone: M7 - deployment and controlled live evidence<br>
Last synchronized: 2026-10-02<br>
Depends on: CL-014 exact repository audit, CL-004A provider readiness,
browser/device feasibility and explicit owner authorization<br>
Suggested commit: `CL-015: deploy and validate browser-owned ClipBuilder`<br>
Parent: [source of truth section 0.9](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#09-browser-owned-media-architecture-revision-2026-10-01)<br>
Contract: [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md)<br>
Index: [README.md](README.md)

## Objective and supersession

Host the audited frontend and protected request-scoped AI API, prove actual
routing/admission/provider/client-media behavior, measure authorized cost and
demonstrate rollback. GCloud setup remains final, if that host is approved.
No temporary media bucket, GCS CORS/lifecycle, Cloud Run media job, server
speaker/render benchmark, signed playback/download or remote result store.
Those prior deferrals are withdrawn, not this packet's remaining acceptance.

The frontend owns source/normalized results/assets/final MP4 locally.
Protected backend handles only admitted bounded audio/text and returns bounded
results/assets. A server cannot read OPFS/IndexedDB. The existing two-service
Cloud Run topology is a proposal until the actual binary transport, same-origin
routing and process-local admission limitations are proved; do not deploy from
old server-media diagrams or pretend instance caps provide global atomicity.

## Owner gates before external action

- [ ] Exact CL-014 revision/build inputs and all repository-owned findings closed.
- [ ] Measured desktop-browser codec/performance/model quality evidence;
      source/output bounds and public claims approved without silent downgrade.
- [ ] Local disk-retention, two-hour logical expiry/next-open cleanup, provider
      audio/text transfer and provider data/retention copy approved.
- [ ] Provider projects/model/keys/settings, numerical hard limits, alerts,
      exact fixture/call budget and kill switch explicitly authorized.
- [ ] Hosting region/topology/account/API/billing/IAM/registry/secrets and action
      permissions approved. No credential/account identifier in Git/evidence.
- [ ] Controlled paid operating model approved. Anonymous public paid traffic
      remains off unless bounded abuse/cost safeguards and process-lifetime
      limitations are justified and accepted; no DB/object-store exception.

Documentation/preparation is not provisioning, key use, funding or launch.

## Final owner-facing setup guide

Prepare current official instructions before running anything: account/MFA,
billing/advisory budget, chosen region, minimum hosting APIs, least-privilege
frontend/API/deployer identities, registry/image storage, Secret Manager,
service ingress/routing, timeouts/body caps, instance/concurrency/rate policy,
no-content logging, static/model/font delivery, unpaid probes, bounded live
approval, kill switch, rollback and authorized teardown/residual charges.
No service-account JSON or blank env identifier filled by an agent without
explicit owner permission. App config and hosted secret mechanism are separate.

Provision only approved hosting/control resources; never a content bucket or
media job. Deploy immutable images/assets from exact audited inputs. Changes
after the audit require the smallest relevant re-audit. Begin fake/paid-off/
all-live-off. A project budget alert is not a provider hard spending cap.

## Local feasibility tools must be absent from deployment

Owner decision (2026-10-02): the synthetic browser-media test page shown during
CL-005/006 work is local-only and must not be exposed by the deployed app.
Its owner is `apps/frontend/feasibility/browser-media/`; the opt-in `test:media`
command serves it on `127.0.0.1:4185`. This requirement applies independently
of `FAKE_MODE`, paid enablement and live flags, including the initial deployed
fake/paid-off checkpoint.

- [ ] Exclude the feasibility harness directory, its HTML, test controls,
      standalone server and harness scripts from the published frontend output,
      static assets and final runtime image. Inspect the exact immutable build
      artifact and route/static-file inventory; do not copy the harness into
      `public`, mount it as an app route or expose it through a proxy.
      Production media workers and codec/model assets used by the real app
      retain their deliberate allowlisted delivery paths.
- [ ] Verify production startup/entrypoints and ingress expose only the audited
      app services. Do not launch `test:media` or expose its port 4185 through
      the deployment, reverse proxy or another public hosting origin.
- [ ] Before paid enablement or public launch, run content-free unpaid negative
      GET probes against the deployed app for the harness URLs: `/main.mjs`,
      `/worker.mjs`, `/sync-access.mjs`, `/mediabunny.mjs`,
      `/audio-extraction.mjs`, `/audio-samples.mjs`, `/audio-profile.mjs`,
      `/opfs-access.mjs`, `/media-errors.mjs`, `/audio-contracts.mjs`, and
      `/feasibility/browser-media/index.html`. Each must return 404 without
      serving harness code or controls. Inventory any new harness/proof paths
      added by later local work and include them in the same exclusion/probes.
      The deployed `/` must serve the intended landing page; the harness's
      local `/` must never replace it.
- [ ] Record the audited artifact identity, excluded paths and actual negative
      probe statuses in sanitized release evidence. Any reachable harness page,
      test endpoint or harness asset blocks deployment acceptance/public
      launch. Correct the owning build/routing configuration and re-audit
      affected CL-014 inputs before redeploying; do not mark this gate passed
      from local loopback binding, hidden navigation or a unit mock alone.

## Transport, topology and security proof

- [ ] Same-origin protected browser route authenticates to private API without
      exposing backend origins/credentials in NEXT_PUBLIC config.
- [ ] Binary audio is handled only by its narrow allowlisted bounded route;
      sample JSON proxy stays fixture-only, 8KiB/5s, not a media proxy.
- [ ] Exercise full-bound selected audio profile and actual end-to-end ingress/
      proxy/server/provider time/body/response limits. 20min 16kHz mono16 PCM
      exceeds Cloud Run HTTP/1's 32MiB cap: prove HTTP/2 or the approved compressed
      route. Streaming alone does not remove that request ceiling.
- [ ] Bounded received-byte/codec/duration validation precedes spend; proxy and
      platform retries cannot redispatch paid work. No original video/output
      upload, durable audio/transcript/payload or arbitrary user URL.
- [ ] Grant boot epoch, record capacity, atomic process-local reservations,
      replay/tombstones, uncertainty, restart and shutdown behavior are exercised.
      Actual old/new revision overlap and scale-out invalidate any unproved
      global exactly-once claim; fail closed or keep paid exposure disabled.
- [ ] Provider hard-limit enforcement and kill switches actually work within the
      approved test budget; alert-only or missing controls stay a launch blocker.
- [ ] CSP/worker/model/codec assets and CORS are limited; COOP/COEP/SAB headers
      are enabled only when needed/proved and compatible with Turnstile/assets.
      No model or media fetch on module import and no hidden external fonts.
- [ ] Logging/metrics/error/APM/proxy/platform capture never records bodies,
      filenames/transcripts/prompts/receipts/capabilities/provider raw payloads.
      Provider/platform retention is independently documented, not promised away.

## Unpaid probes, bounded live validation and rollback

Run unpaid fake/off health/config/error/restore/clear probes first, verify static
worker/model delivery and local storage/codec/compositor output with approved
synthetic media, and inspect only content-safe aggregate diagnostics. No
production fixture routes or fake real-mode success.

Then only the explicitly approved live flow: bounded local source/audio consent,
one transcription/candidate action, one selected-range local speaker pass,
bounded visual-plan/images, read-only preview, one local export/download and
clear. Record exact provider calls, audio/text/asset bytes, normalized result
availability, codec/sync/sample-frame quality, measured client time/memory,
cost and local cleanup. No private media/transcript/provider IDs/output in docs.
Cloud hosting success cannot replace measured browser-media/speaker quality evidence.

Timeout/cancel after dispatch may bill; lost payload/restart is a visible
uncertain outcome, never an automatic paid replay. Stop on duplicate dispatch,
unexpected capture/retention, privacy/codec/quality failure or budget variance.
Do not widen limits or public support to make a failed proof look successful.

Demonstrate kill switch and rollback to exact prior audited assets/config with
paid traffic disabled before topology/revision changes. Explain effects on
in-flight grants/local workspaces; incompatible artifact schema requires
safe migration/cleanup, not automatic new paid work. Authorized teardown must
leave no needless hosting/registry/secret costs and cannot delete visitor-saved
downloads or promise provider content erasure.

## Completion

- [ ] Dated guide and exact immutable revision/assets/topology recorded.
- [ ] Local feasibility/test tools are excluded from the deployed artifact and
      direct page/asset probes prove they are not exposed by the deployed app.
- [ ] All actual transport, restart/overlap, logging, hard-cap and client-media
      proofs performed, or remaining blockers left explicitly unchecked.
- [ ] Only authorized external resources/actions and paid calls occurred.
- [ ] Actual device/provider/rights/privacy/visual/public claims approved.
- [ ] Local cleanup, incident stop and rollback evidence recorded honestly.
- [ ] Changed files, commands/manual states, costs/call counts, deviations and
      remaining owner-only items reported; no deployment or Git inferred here.

Run focused release probes and the required root gate for any source changes;
no unapproved paid E2E or cloud mutation. Public paid release cannot be marked
complete while the no-shared-store guarantee/cap decision is unresolved.

## Historical packet

<details>
<summary>Superseded cloud-media deployment plan, not setup instructions</summary>

The prior resource inventory and acceptance matrix below are decision history.
No bucket, media job, server rendering or object-backed coordination item is
still required or implicitly authorized.

# CL-015 — Deploy, validate, measure, and prove rollback

Status: Planned<br>
Milestone: M7 — deployment and controlled live evidence<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-014 repository audit, CL-004A provider readiness, and explicit owner authorization<br>
Blocks: Public release completion<br>
Suggested commit: `CL-015: deploy and validate ClipBuilder`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Owner setup ordering (2026-10-01): this is the final ticket, after every local
implementation/quality/audit packet. It exclusively owns all GCloud account,
billing, project/API, IAM, bucket, registry, secrets, service/job setup, external
cloud verification and deployment. CL-004A owns non-GCloud setup guides; CL-012
audits them and CL-014 carries a named deferred-cloud checklist. Cloud evidence
is produced inside this packet, never a circular prerequisite for entering it.

Before any external step, author/review the complete dated owner-facing GCloud
walkthrough using current official docs: prerequisites and account security,
console navigation and equivalent content-safe CLI where needed, billing and
numeric advisory budget, chosen region, required APIs, least-privilege identities,
registry/image costs, private bucket settings, Secret Manager access, service/job
caps/retries/timeouts, unpaid verification, bounded live approval, troubleshooting,
kill switch, rollback and authorized teardown/residual charges. Keep identifiers
and secrets blank; do not output credentials or service-account JSON.

Deploy the exact audited ClipBuilder revision as immutable frontend and
backend/job images; prove private service/storage/IAM/lifecycle configuration;
run unpaid deployed probes first; execute only the owner-authorized bounded live
flow; reconcile behavior, provider/job call counts, cost, cleanup, public claims,
and settings; and demonstrate the recorded rollback/kill-switch path.

## Portfolio value

Convert the audited repository into a credible live portfolio artifact with
traceable revision/digests, bounded spend, honest external evidence, recoverable
operations, and no gap between the code story and the deployed system.

## Standalone implementation context

- Target architecture is one public Next.js Cloud Run service, one private
  Express Cloud Run service invoked by frontend identity, one private Cloud Run
  Job definition for `analyze|assemble|render`, one private temporary GCS bucket,
  Artifact Registry images deployed by digest, and Secret Manager values scoped
  to runtime identities.
- CL-015 may deploy only the exact CL-014-audited revision/build inputs. Any
  material source/config/image change requires the smallest relevant re-audit.
- Deployment begins fake and paid-disabled. Unpaid health/config/sample/clear
  probes and log inspection happen before any live flag is enabled.
- Live validation is rare evidence: one previously unused rights-approved short
  fixture, exactly the approved upload/analysis/assembly/render path,
  followed by usage/cost/output/cleanup reconciliation. Stop on duplicate call,
  unexpected retention/log content, setting drift, or material cost variance.
- A custom domain is not required for the first stable checkpoint; use managed
  `run.app` HTTPS first unless owner decisions explicitly say otherwise.

## Dependency evidence required

CL-014 must identify the exact auditable revision/build inputs, record a green
deterministic gate, and list no unresolved repository-owned release blocker.
Visual, rights, non-GCloud provider/privacy/retention and numerical spend/call
approval must have current evidence before their corresponding external phase.
An approved region/cloud setup action is needed before provisioning; bucket/IAM,
mechanism/runtime, unpaid probes and launch evidence are produced in the phases
below, not demanded before entry. A commit subject or template is insufficient.

## Files and areas owned

- Deployment/rollback/provider/storage/cost/release operations documents and
  sanitized release evidence.
- Container/build/deploy configuration corrections strictly required for the
  audited architecture, followed by re-audit as needed.
- No new product feature or speculative infrastructure.

## Scope boundaries

### In scope

- Re-checking current official provider model/pricing/data docs and owner
  dashboard settings before live use.
- Building/pushing two immutable image families (frontend; backend/job), recording
  exact digests/SHA, and deploying services/job with least-privilege identities.
- Verifying region, bucket public-access prevention/uniform access/CORS/lifecycle/
  soft-delete/versioning/IAM, Secret Manager scopes, Cloud Run min/max/
  concurrency/timeouts/task retries, and network/service authentication.
- Unpaid production health/config/sample/clear probes and content-safe log review.
- Explicitly bounded live flow, output inspection, call/usage/cost/cleanup
  evidence, kill-switch test, and digest-based rollback.

### Out of scope

- Kubernetes, Terraform, load balancer, external queue, deployment OIDC/CI-CD,
  multi-region failover, custom controller, production database, customer
  accounts, broad public beta, arbitrary stress testing, or unapproved custom
  domain purchase/configuration.
- Additional live retries/fixtures, 60-minute ceiling run, or public live upload
  unless separately authorized after the short flow evidence.

## Locked sequence and checkpoints

### Phase 0 - owner guide and cloud setup authorization

- [ ] Confirm CL-004A/CL-012 provider evidence and CL-014 repository audit;
  enumerate every deferred cloud gate and its original owning ticket.
- [ ] Prepare/update the full deployment/storage/secrets/budget/rollback guide
  with dated official links, exact console steps and safe CLI equivalents,
  expected outcome, permission/billing prerequisites and stop conditions.
- [ ] Obtain explicit approval for cloud account/billing/project creation or
  selection, region, API enablement, resource caps, advisory budget/recipients,
  funding and each external provisioning/deploy action. Never infer approval.
- [ ] Configure owner-approved numeric cloud alerts and resource ceilings before
  metered workloads; distinguish advisory alerts from enforced caps.

### Phase 1 — freeze and build the audited candidate

- [ ] Confirm CL-014 ledger, exact clean/auditable revision, current phase's owner
  gates and deferred-cloud checklist, and no material source/config drift.
- [ ] Re-run the release commands/scans required by the ledger and build the two
  immutable images with exact SHA labels and reproducible inputs.
- [ ] Scan images/dependencies/secrets/licenses, record digests and runtime binary/
  model/font revisions, and never bake secrets/local env/media into layers.

### Phase 2 — verify minimum cloud foundation

- [ ] Following the owner guide, create/configure only the authorized minimum
  project/APIs, regional registry, secrets, identities and private bucket. Verify
  least privilege, cost/resource ceilings and no service-account JSON keys.

- [ ] Verify approved project/region, Artifact Registry, Secret Manager, service
  identities and planned private API/job IAM without recording project/account
  IDs in public evidence. Verify deployed service/job bindings after Phase 3.
- [ ] Verify the private bucket's PAP, uniform access, Standard class, versioning,
  soft-delete decision, one-day lifecycle for temporary prefixes, explicit
  sample exclusion, exact-origin CORS, and no public/list permission.
- [ ] Upload/reference the rights-approved versioned sample by exact generation
  and SHA; never replace it in place.
- [ ] Complete CL-005's transferred GCS browser mechanism spike on approved
  synthetic/rights-safe media: exact-origin CORS, headers/start expiry, resumable
  chunks/restart, size/type/generation/range, cancel/partial deletion and no
  capability in logs/errors/persistence/screenshots. Failure blocks enablement.
- [ ] Return any mechanism/runtime/code correction to its owner and re-audit
  affected source/config/image inputs under CL-014 before continuing deployment.

### Phase 3 — deploy fake and paid-disabled

- [ ] Deploy private API and one job definition with `analyze|assemble|render`
  allow-list, zero task retries, bounded resources/timeouts/instances, and only
  required secret access.
- [ ] Deploy public frontend with server-only private API origin/audience and
  same-origin `/v1`; keep every live flag false and master paid switch false.
- [ ] Record Cloud Run revisions/digests/nonsecret config and verify the API is
  not public while frontend invocation works.

### Phase 4 — unpaid deployed checkpoint

- [ ] With the private job now provisioned, repeat CL-006/008's pinned speaker
  benchmark on actual Cloud Run CPU/RAM/time/storage settings using approved
  media; record deployment quality/runtime/memory go/no-go, not local inference.
- [ ] Prove CL-011's transferred job/output integrity, private preview/range/
  download, revocation and cleanup without AI calls. This checkpoint means zero
  paid provider calls, not free cloud compute/storage; obtain a bounded cloud
  execution approval. Re-audit any material correction before progressing.

- [ ] Run health/readiness/config, complete sample flow, refresh/recovery, clear,
  expiry, and kill-switch probes without provider calls.
- [ ] Verify headers/CSP/cookies/no-store/proxy, responsive critical path, sample
  asset integrity, content-safe logs/metrics, scale/capacity, and cleanup.
- [ ] Stop if revision/config/log/storage/IAM evidence diverges; correct and
  re-audit before live enablement.

### Phase 5 — bounded live validation and measurement

- [ ] Re-check current provider project/model/data/retention settings, Turnstile,
  hard rate/spend limits, cloud alerts, rights, and authorized call count.
- [ ] Enable only the exact approved flags, use one previously unused short
  synthetic/purpose-recorded fixture, and run one upload → inspect → analysis →
  assembly → read-only review/confirmation → one render → download → clear flow.
- [ ] Verify active speaker, contextual visual grounding/rhythm, caption/sync/
  output, exact provider/image/job counts, no hidden retry, logs, usage/cost,
  object deletion/revocation, and lifecycle backstop.
- [ ] Disable live flags immediately on duplicate/unexpected retention/content
  leak/claim/cost/cleanup deviation and preserve sanitized incident evidence.

### Phase 6 — rollback and release closure

- [ ] Prove master/per-feature kill switches stop new paid work while sample
  remains isolated.
- [ ] Roll back by recorded previous image digests/config snapshot—not rebuilding
  an old branch—and verify health/sample/session compatibility.
- [ ] Restore the approved release state only if authorized; otherwise leave
  live flags off after validation.
- [ ] Complete the release record with public URL, timestamp, SHA/digests/
  revisions, settings review dates, tests, probes, live count, cost, output,
  cleanup, known issues, approvals, and rollback target.

## Privacy, provider, and cost constraints

- Never place secrets in commands, logs, docs, screenshots, image layers, or
  environment examples. Use Secret Manager and runtime identities.
- Release evidence omits account/project IDs, object names, signed URLs,
  transcripts/prompts/media/outputs, provider request IDs, tokens, and secret-
  bearing screenshots.
- Run only the exact authorized live operations. No automatic retries, provider
  fallbacks, stress/load generation, second render, or 60-minute validation.
- Public claims must match measured active-speaker, visual, retention, language,
  upload, and render state. If live upload remains unapproved, deploy sample-only.

## Acceptance criteria

### Technical deployment checkpoint

- [ ] Complete owner GCloud setup guide exists and all actual account/billing/
  API/IAM/resource/budget actions are explicitly authorized and evidenced.
- [ ] Transferred CL-005 mechanism, CL-006/008 target-runtime and CL-011 cloud
  render/storage/delivery/cleanup gates pass; none are inferred from local tests.

- [ ] Exact audited SHA maps to recorded immutable frontend/backend-job digests
  and deployed revisions with no material drift.
- [ ] API/job/bucket stay private; frontend service identity and least-privilege
  runtime identities are proven.
- [ ] Bucket PAP/IAM/CORS/lifecycle/soft-delete/versioning/sample generation and
  Cloud Run caps/retries/timeouts match operations records.
- [ ] Paid/live-disabled health/config/sample/clear probes pass and logs/metrics
  contain no forbidden content or capability.

### Release acceptance after controlled live evidence

- [ ] Exactly authorized provider/image/job operations ran with expected usage,
  cost, latency, output validation, and zero hidden retry/duplication.
- [ ] Speaker framing, visual beats/cards, fixed captions, preview/export
  parity, result/download, and clear meet the source-of-truth release checklist.
- [ ] Source/transcript/assets/output/control objects are deleted/revoked or
  truthfully recorded as pending lifecycle cleanup; no public access exists.
- [ ] Hard provider limits, app kill switches, capacity caps, and advisory cloud
  alerts are distinguished and evidenced.
- [ ] Kill switch and digest rollback are proven; the release record names the
  current and prior targets and all remaining issues/unchecked items.

## Focused verification

- [ ] Re-run exact CL-014 release gate on the frozen candidate before build.
- [ ] Inspect image provenance/layers/digests, deployed nonsecret config,
  service/IAM/bucket/job settings, and production headers/logs.
- [ ] Run unpaid probes first and record provider call counts at zero.
- [ ] Run only the explicitly authorized live flow and reconcile provider/cloud
  usage and billed/estimated cost with the plan.
- [ ] Validate output media and complete cleanup/revocation checks.
- [ ] Exercise kill switch and rollback, then record final state.
- [ ] Inspect local Git status/diff; do not imply deployment changes were
  committed unless the user separately authorized the commit.

## Documentation updates

- Complete deployment, rollback, provider setup, data retention, cost model,
  media rights, render profile, incident, and release-evidence records.
- Update public README with the live URL and only measured public claims after
  the owner approves release.
- Update parent and affected tickets for any externally discovered behavior or
  configuration change, and re-audit the affected scope.

## Owner gates and external blockers

All external work requires explicit authorization and owner-provided access:
cloud project/region/IAM/bucket, provider/Turnstile/Secret Manager settings,
sample rights, spend caps/alerts, live call count, public upload/render/language/
retention decisions, launch approval, and any custom domain. Missing evidence
blocks the corresponding phase; it is never inferred or bypassed.

## Commit boundary

Keep deployment configuration/evidence and only strictly required re-audited
corrections together as `CL-015: deploy and validate ClipBuilder`. Do not add
new product features or speculative infrastructure. This packet does not itself
authorize staging, committing, pushing, purchases, provider mutations, cloud
changes, deployment, public launch, or paid calls; each requires the user's
explicit instruction at execution time.

## Precision references

- [Owner-controlled live validation](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2015-owner-controlled-live-validation)
- [Deployment and operations](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#21-deployment-and-operations)
- [Release acceptance checklist](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#23-release-acceptance-checklist)
- [Owner decisions still required](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#24-owner-decisions-still-required)
- [Definition of done](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#appendix-e--definition-of-done)

## Completion handoff

Report the exact audited SHA/image digests/deployed revisions, cloud/storage/
IAM/job settings, unpaid probes, authorized live operation counts and measured
usage/cost, output/cleanup evidence, public URL/state, kill-switch and rollback
proof, documentation paths, local changed files/Git state, and every remaining
owner/external blocker. Never include a secret or content-bearing identifier.

</details>

</details>
