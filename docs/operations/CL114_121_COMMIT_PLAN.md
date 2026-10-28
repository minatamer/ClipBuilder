# CL-114–121 — approved whole-file commit plan

Owner authorization: 2026-10-28. Prepare a file-level plan for all pending
feedback, split it into many commits, then stage and commit locally for later
manual review. Baseline: `09fb914` on `main`. Allocate **57 whole files to
16 commits**, in the order below. This includes the hosted usage/private
allowlist follow-ups as well as the visual work queued in the same conversation.

No partial staging, source rewriting, branch changes or history rewriting.
The earlier CL-095–113 visual work is already committed in `09fb914`; do not
recommit it. No push, deployment, provider/cloud request, ignored configuration
or retained-media change is authorized. Preserve the healthy running app.

## Ordered commits

| Commit | Subject | Purpose | Dependencies |
| --- | --- | --- | --- |
| C01 | `CL-114-121: record approved whole-file commit plan` | Record the exact authorized allocation before staging implementation. | Baseline 09fb914 |
| C02 | `CL-114: define hosted demo limits and session status` | Publish browser-safe limits and hosted session allowance status. | C01 |
| C03 | `CL-114-115: configure private hosted usage settings` | Parse server-only ledger, identity-verification and owner allowlist configuration. | C02 |
| C04 | `CL-114-115: add durable hosted quota accounting` | Implement durable reservations, successful-use accounting and global bounds. | C02–C03 |
| C05 | `CL-114: enforce cumulative hosted clip bounds` | Add adjustable batch capacity and route-level shared-input enforcement. | C02 |
| C06 | `CL-114-115: wire durable hosted admission and charges` | Integrate accounting with session lifecycle, provider/native dispatch and export success. | C03–C05 |
| C07 | `CL-114: forward verified hosted client identity` | Keep client identity server-side and accept only the documented verified proxy path. | C06 |
| C08 | `CL-114: add free-demo limit feedback components` | Provide themed visible correction and exhausted-trial states. | C02 |
| C09 | `CL-114: enforce shared manual and AI clip slots` | Correct hosted inputs to the same total enforced by the backend. | C02, C08 |
| C10 | `CL-114: show exhausted trial entry and session reset` | Wire admission feedback into the mutually exclusive workflow views. | C06–C09 |
| C11 | `CL-114-117-119: simplify Privacy disclosures` | Retain concise transfer/storage facts with generic AI wording and no preview note. | C10 |
| C12 | `CL-116: contain the poster below the live film` | Prevent poster descendants painting over the running player. | C01 |
| C13 | `CL-117-120: fit the phone hero and clean retired styles` | Fill the initial phone viewport and remove retired Privacy-note styling. | C11–C12 |
| C14 | `CL-118: clear analysis behind forming moment cards` | Clear old loader content before cards form while preserving scene continuity. | C12 |
| C15 | `CL-121: remove the floating sample card from the film` | Remove the landing-only floating card while retaining portrait and bottom captions. | C14 |
| C16 | `CL-114-121: record implementation and review evidence` | Reconcile the owning guides, source of truth and eight completed local packets. | C02–C15 |

## Exact file allocation

Each path appears once. Stage its complete settled contents in its assigned
commit, including the associated existing tests. Intermediate commits are
ordered by imports and interfaces; the verification below applies to the
combined settled snapshot, not separate test runs at every intermediate commit.

| Commit | File | Whole-file change |
| --- | --- | --- |
| 1 | `docs/operations/CL114_121_COMMIT_PLAN.md` | Owner authorization, ordered commit subjects, exact allocation and verification limits. |
| 2 | `packages/contracts/local/hosted-editing.ts` | Shared hosted demo caps and bounded input contract. |
| 2 | `packages/contracts/local/runtime.ts` | Session usage status and runtime capabilities for hosted limits. |
| 3 | `apps/backend/src/config/env.schema.ts` | Bounded private hosted settings and exact-address owner allowlist parsing. |
| 3 | `apps/backend/src/config/loadConfig.test.ts` | Fake-only configuration validation, blank defaults and invalid-list coverage. |
| 3 | `apps/backend/.env.example` | Blank private ledger/owner entries and disabled verified-identity example. |
| 3 | `test/deterministic.environment.ts` | Strip inherited hosted settings from deterministic fake/paid-off tests. |
| 4 | `apps/backend/local/demo-usage.ts` | Keyed network identity, visitor reservations, owner exemptions and global budgets. |
| 4 | `apps/backend/local/demo-usage.test.ts` | Injected-ledger allowance, reservation, expiry, canonicalization and budget tests. |
| 4 | `apps/backend/local/demo-usage.gcs.ts` | Bounded generation-conditional private object adapter with fail-closed behavior. |
| 4 | `apps/backend/local/demo-usage.gcs.test.ts` | Injected-storage compare-and-swap, read bounds and failure coverage. |
| 4 | `test/demo-usage-fixture.ts` | Shared synthetic in-memory usage fixture for guarded tests and proofs. |
| 5 | `apps/backend/local/server.ts` | Bound manual/AI requests, wire clip/export hooks and map hosted overflow at routes. |
| 5 | `apps/backend/local/clip-batch.ts` | Bound manual and AI requests to their shared available clip slots. |
| 6 | `apps/backend/local/hosted-workflow.ts` | Session reservation, cumulative source/clip control, dispatch charges and first-export completion. |
| 6 | `apps/backend/local/hosted-workflow.test.ts` | Admission races, failure/expiry, scoped work and successful-use accounting regressions. |
| 6 | `apps/backend/local/hosted-cleanup.test.ts` | Usage-aware session cleanup and shutdown checks. |
| 6 | `apps/backend/local/hosted-runtime.ts` | Inject parsed private settings and the durable ledger into hosted composition. |
| 6 | `apps/backend/local/hosted-runtime.test.ts` | Hosted runtime readiness and private usage configuration checks. |
| 6 | `test/owner-hosted-editor.proof.ts` | Inject the mandatory synthetic usage port into the existing hosted editor proof. |
| 7 | `apps/frontend/src/server/demo-client-ip.ts` | Bounded verified proxy identity extraction without browser trust. |
| 7 | `apps/frontend/src/server/demo-client-ip.test.ts` | Proxy identity acceptance, malformed input and unverified-path coverage. |
| 7 | `apps/frontend/src/server/local-workflow.ts` | Forward verified identity to hosted session admission through the server bridge. |
| 7 | `apps/frontend/src/server/local-workflow.test.ts` | Forwarding and fail-closed bridge tests. |
| 7 | `apps/frontend/.env.example` | Server-only verified-identity example remains disabled. |
| 8 | `apps/frontend/src/features/local-editing/demo-limit-toast.tsx` | Accessible bounded-clip feedback toast. |
| 8 | `apps/frontend/src/features/local-editing/demo-limit-screen.tsx` | Trial-exhausted entry content with the shared action primitives. |
| 8 | `apps/frontend/src/features/local-editing/style.css` | Theme-consistent toast and exhausted-screen geometry. |
| 9 | `apps/frontend/src/features/local-editing/selection-panel.tsx` | Shared hosted manual/AI slot correction and visible limit feedback. |
| 9 | `apps/frontend/src/features/local-editing/clip-batch-panel.tsx` | Cumulative retained-clip capacity and bounded manual/AI additions. |
| 10 | `apps/frontend/src/features/local-editing/experience.tsx` | Use admission status and the exhausted entry view while preserving local capabilities. |
| 10 | `test/owner-demo-limits.proof.ts` | Guarded synthetic UI proof for shared three-clip inputs and exhausted admission. |
| 11 | `apps/frontend/src/app/privacy-dialog.tsx` | Combined network-accounting disclosure, preview-note removal and provider-neutral AI copy. |
| 11 | `apps/frontend/src/app/page.test.tsx` | Final Privacy wording, mode coverage and removal assertions in the shared page suite. |
| 12 | `apps/frontend/src/features/product-film/product-film-hero.tsx` | Explicit live player layer within the existing hero surface. |
| 12 | `apps/frontend/src/features/product-film/product-film-hero.module.css` | Isolate poster/surface stacking and place the live player above the poster. |
| 13 | `apps/frontend/src/app/page.module.css` | Combined phone wordmark/full-height responsive hero and unused Privacy-note style cleanup. |
| 13 | `test/local-film-initial.proof.ts` | Combined full-hero paint-order, first-paint and phone viewport regression proof. |
| 14 | `apps/frontend/src/features/product-film/film-choreography.ts` | Analysis exit timing and clean analysis-to-moments handoff. |
| 14 | `apps/frontend/src/features/product-film/film-choreography.test.ts` | Exact handoff/timing regression assertions. |
| 14 | `apps/frontend/src/features/product-film/product-film.tsx` | Clean transition background, prior-image exclusion and matching candidate handoff. |
| 15 | `apps/frontend/src/features/product-film/illustrated-conversation.tsx` | Remove landing ContextualCard invocation, fixture and unused import. |
| 15 | `test/local-film.proof.ts` | Combined dense CL-118 transition checks and CL-121 card-absence/caption-retention checks. |
| 16 | `apps/backend/README.md` | Hosted quota/configuration boundary and focused verification guide. |
| 16 | `apps/frontend/README.md` | Current Privacy, hero and film behavior with verification commands. |
| 16 | `apps/frontend/src/features/local-editing/README.md` | Hosted shared clip slots, exhausted entry and unchanged local capability guidance. |
| 16 | `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` | Authoritative hosted-limit/private-list and visual follow-up decisions. |
| 16 | `docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md` | Owner-only ledger/proxy/IAM setup and release verification gates. |
| 16 | `docs/tickets/README.md` | Completed packet index and latest local commit authorization/plan link. |
| 16 | `docs/tickets/CL-114-hosted-three-clip-demo-and-durable-usage.md` | Implementation, fake verification, release limitations and subsequent Git authorization. |
| 16 | `docs/tickets/CL-115-private-environment-owner-allowlist.md` | Private-list follow-up evidence and subsequent Git authorization. |
| 16 | `docs/tickets/CL-116-prevent-poster-title-over-live-film.md` | Reproduced stacking defect, local proof evidence and subsequent Git authorization. |
| 16 | `docs/tickets/CL-117-remove-privacy-preview-note.md` | Narrow Privacy removal evidence and subsequent Git authorization. |
| 16 | `docs/tickets/CL-118-clean-analysis-to-moments-background.md` | Transition fix, reproduced regression evidence and subsequent Git authorization. |
| 16 | `docs/tickets/CL-119-provider-neutral-privacy-copy.md` | All-mode generic AI wording evidence and subsequent Git authorization. |
| 16 | `docs/tickets/CL-120-full-screen-phone-hero.md` | Responsive phone viewport evidence and subsequent Git authorization. |
| 16 | `docs/tickets/CL-121-remove-floating-film-card.md` | Landing-only removal/retained-caption evidence and subsequent Git authorization. |

## Shared-file decisions

- Privacy component/tests contain CL-114, CL-117 and CL-119 together. Commit C11
  preserves that final combined behavior.
- The page stylesheet contains CL-117 cleanup and CL-120 responsive layout.
  Commit C13 follows the Privacy implementation and poster stacking fix.
- The initial-film proof covers CL-116 and CL-120; the main film proof covers
  CL-118 and CL-121. Hold each complete proof until its implementations exist.
- The existing hosted editor proof moves with hosted workflow wiring because
  its new mandatory usage dependency must be injected at the same time.
- Owning READMEs, source of truth, release guide and packet/index evidence
  summarize multiple changes and finish together in C16. Earlier unstaged or
  no-commit statements describe original handoffs; the latest authorization
  supersedes them only for this exact local Git action.

## Verification and handoff

Fresh combined fake/no-key/paid-off unit verification: **13 files, 125 tests
passed**. Local usage/workflow/capability checks: 7 files/56 tests (4.62s).
Backend configuration: 1 file/40 tests (1.92s). Frontend page, camera,
choreography and identity/bridge checks: 5 files/29 tests (1.54s).
Scoped Prettier passed for 40 changed source files; ESLint passed for 37 changed
TypeScript/TSX files. Markdown follows repository prose conventions and is
excluded by the existing Prettier configuration.
Packet-local evidence records the completed type, lint, format, guarded browser
and synthetic native proofs and their limits. Refresh scoped formatting/lint
and check whitespace plus exact staged allocation before committing.

Before staging, reconcile this allocation with the complete changed/untracked
path set and require an empty index. Freeze the planned file contents outside
Git, verify each group against that snapshot, and abort on unexpected changes.
Stage exact paths, check staged whitespace and names, then commit in order.
Afterward verify 16 commits from the baseline, all 57 allocated files accounted
for once and a clean worktree/index. Report the resulting commit range in chat.

Only source, committed blank configuration examples and documentation belong
in these commits. Private environment values, actual owner IP addresses, media, screenshots,
traces, runtime records and logs stay outside Git. Ignored configuration is
never read or edited. Tests use injected synthetic/fake transports; no real
provider, cloud or external platform request is part of verification.

Fake/no-key mode verifies local presentation and simulated workflow behavior.
Real AI processing needs provider credentials, live flags and applicable owner
approvals. Hosted quota persistence and trusted network identity additionally
need the release guide's owner-managed private storage/IAM and proxy setup.
Personal visual, physical-device, real-AI, hosted, rights and release acceptance
remain owner-only and open. No test result here grants release acceptance.
