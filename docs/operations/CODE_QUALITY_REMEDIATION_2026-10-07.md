# Code quality remediation — 2026-10-07

Status: **local code-quality remediation complete; public/live release
acceptance remains open**. The owner authorized implementation of the
[dated plan](CODE_QUALITY_REMEDIATION_PLAN_2026-10-07.md), prioritizing
preserved functionality, coherent ownership and private backend logging. The
[original audit](CODE_QUALITY_AUDIT_2026-10-07.md) and its manifest remain
historical baseline evidence. This report records the actual changes,
verification, retained decisions and remaining gates under CL-014.

Subsequent owner authorization: stage and commit the audited proposal through
the
[CL-015-prefixed file-level plan](../tickets/CL-015-CODE-QUALITY-COMMIT_PLAN.md).
The candidate table and verification below identify the pre-commit audit
snapshot; the plan records the resulting implementation commits. Source bytes,
test/build evidence and release limitations remain unchanged by Git bookkeeping.

All five local gates pass, including **1,223 synthetic tests in 104 files**
after the owner's requested
[validation walkthrough and worker corrections](CODE_QUALITY_VALIDATION_2026-10-07.md).
That walkthrough found two worker monitoring/interpreter gaps, reproduced and
fixed them, then returned no new actionable local findings. The earlier native
browser checks of presentation and diagnostic routing remain scoped synthetic
evidence. No new paid/provider/cloud test, deployment or Git mutation ran. The
normal owner app stack was not restarted, reconfigured or used for testing.

## Candidate identity

| Item                                     | Evidence                                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Unchanged HEAD                           | `452728c127ca123809df1a850ae6114256998537`                                                         |
| Proposed implementation                  | Uncommitted CL-014 worktree; no stage/commit/push/fetch/pull/branch action                         |
| Baseline inventory                       | 358 files; `d18a707990144258dbd5b134b347c976e099580992a98907efb6219df2155630`                      |
| Final source/config/test/build inventory | 375 files; [exact inputs and changed-source list](CODE_QUALITY_REMEDIATION_2026-10-07_INPUTS.json) |
| Final input SHA-256                      | `b6e34464f21d02dd495b464f1c2fea106810d083af1192272f2b77fc7f1c97fd`                                 |
| Unchanged lockfile SHA-256               | `cbf16cbaaf453fa97cdd219f9002997fa037753a81c46d1fee21aa4936167a83`                                 |
| Verification runtime                     | Node 24.19.0; pinned pnpm 11.19.0; TypeScript 6.0.3; Next 16.3.7                                   |

The final manifest uses the baseline path-plus-NUL/raw-file-SHA algorithm,
includes the new first-party modules and retained offline proof, and excludes
deleted inputs, documentation, ignored outputs, dependencies and private files.
Its 69-path changed-source list includes additions, deletions and both ends of
file moves. Documentation changes are listed separately below. This is an exact
local proposal identity, not an immutable deployment revision.

## Finding dispositions

| Finding                                         | Disposition and concrete change                                                                                                                                                                                                                                                                                                                | Functional evidence                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q-01: cleanup exception handling                | Fixed. The effect registry relinquishes an owned snapshot before callbacks and attempts every stopper/URL even after a throw. Browser workspace release clears references first and attempts consumer release, URL revocation and physical deletion independently. Content-free failures are reported privately.                               | Throwing/reentrant cleanup probes failed before the fix; registry and workspace regressions pass. Current cleanup, persistence, expiry, Exit and lifecycle suites remain green.                                                                                                                                                              |
| Q-02: admission deadline causes                 | Fixed. Internal deadlines retain `REQUEST_TIMEOUT`; caller cancellation/Clear retains `CLIENT_ABORTED`; expired evidence yields `SESSION_EXPIRED`, and clock rollback yields `SESSION_INVALID`.                                                                                                                                                | The timeout regression failed before the change. The 23 admission tests preserve exact dispatch counts, consumed/uncertain outcomes, no retries and held capacity until transport completion; expiry before dispatch makes zero calls.                                                                                                       |
| Q-03: renderer TSX import guard                 | Fixed. Renderer TSX gets the same Node/global and cross-application import restrictions as TS. Browser source also rejects console writes.                                                                                                                                                                                                     | Negative fixtures reject relative/published cross-app imports in TSX and browser console calls; valid contracts/composition imports pass. Existing no-Node contracts guards remain intact.                                                                                                                                                   |
| Q-04: executable startup ownership              | Fixed. Only the executable path loads local environment and calls explicit `startBackend(environment)`. Imports neither compose nor listen nor register signal handlers. Each server releases its owned signal handlers on close.                                                                                                              | Two fake/injected startup tests preserve the configured address and existing startup/shutdown logging without opening an app port or loading local environment.                                                                                                                                                                              |
| Q-05: retired browser audio path/test UI        | Fixed. Removed product `extractAudio`, extraction protocol/client branches and worker extraction imports. Kept source inspection/copy/reopen/deletion and legacy audio-scratch cleanup. Six useful audio modules/tests moved to `feasibility/browser-audio`. Deleted the historical testing page, worker, server and server test on port 4185. | Current workspace/client/worker/recovery/analysis and retained audio/sync-access tests pass. Unknown retired extraction commands fail before touching storage. `test:media` now runs offline Vitest proof and opens no port. No dependency was removed: Mediabunny still owns source inspection.                                             |
| Q-06: retired generation-schema builder         | Fixed. JSON-only production adapter no longer constructs/exports the retired schema. Historical schema-isolation support lives under `apps/backend/test/candidate-schema.fixture.ts`, outside the production compiler's source tree.                                                                                                           | The 73 focused analysis/Google diagnostic checks pass. A clean backend build contains no retired schema fixture. Prompts, models, request policy, normalization and canonical validation are unchanged.                                                                                                                                      |
| Q-07: invariant review computations             | Fixed. Edit and interest notes memoize against their assembly/analysis/selection inputs. Playback state and events retain their current owner.                                                                                                                                                                                                 | Native synthetic browser comparison: 30 separate frame updates produce 32 calls to each helper without memoization, versus one each after; visible note text matches. Play/pause, five-second note seek, keyboard volume 100→0→1, expiry/retry and cleanup checks pass. This measures helper work, not FPS or native A/V performance.        |
| Q-08: mixed stage presentation                  | Implemented the narrow useful extraction. `ConnectionFailureNotice` and `WorkflowRecovery` own pure recovery markup; async controllers, transitions, reservations and effects remain in the screen.                                                                                                                                            | Same action callbacks, stage-specific text, busy disabling, CSS classes and recovery placement. Unit checks cover every safe error code without supplied technical text; native synthetic browser checks cover all extracted recovery stages, keyboard actions, mobile/desktop fit and existing reduced-motion preference.                   |
| Q-09: hash primitive duplication                | Retained with reason. Small crypto wrappers serve distinct domain payload/order/receipt-exclusion recipes. Another abstraction would add indirection without consolidating a shared business rule.                                                                                                                                             | Existing receipt/hash/manifest tests remain green. No digest bytes, order, schema, signature or ownership changed.                                                                                                                                                                                                                           |
| Q-10: repeated physical probe                   | Retained with evidence. Audio preparation needs raw duration/submillisecond video timing that normalized inspection does not retain. Blind reuse would alter A/V offsets.                                                                                                                                                                      | Added synthetic characterization: three probes total, two of the input and one of the output; duration 15.0004 and video offset 0.033333 remain in preparation arguments. No FFmpeg/provider/cloud run was needed. A richer internal probe port remains conditional on measured benefit.                                                     |
| Q-11: owner-required generic UI/private logging | Added to authorized scope. Generic/actionable recovery and framework fallbacks; strict diagnostic contract, best-effort browser reporter, bounded same-origin bridge and private backend endpoint. Early console/event redirection covers application/framework calls without forwarding raw values.                                           | Contracts, reporter, bridge, fallback, console and backend regressions pass. Oversized/compressed/foreign/content-bearing requests are rejected; fixed 512/minute admission is proven, including next-window reopening. Native synthetic delivery prints six browser records privately with empty browser console and no raw error sentinel. |

No reducer, candidate selection, source-upload chunk/reconciliation policy,
provider retry/model/prompt, manifest/render policy, private renderer runtime,
landing markup/style/video, operating defaults or owner configuration was
changed. The intentional visible differences are safer recovery copy and
accurate timeout/ expiry classification. Cleanup now completes later release
attempts after a callback throws. The removed extraction/testing UI had no
current product caller.

## Logging and visitor errors

| Diagnostic owner                               | Preservation / destination                                                                                                                                                                                                                         |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend startup and shutdown                   | Existing messages remain; startup is explicit and signal labels/handler ownership are corrected.                                                                                                                                                   |
| Provider, Gemini, reconciliation and renderer  | Existing content-free diagnostic events, validation, private sink and owner capture behavior remain. No logging call or capture was deleted.                                                                                                       |
| Browser cloud upload                           | All previous stage, operation, chunk, request, duration/status, query/resend, confirmed/total-byte and bounded reason fields remain. They now enter the existing private backend analysis stream.                                                  |
| Browser preview                                | All existing trace events, summaries, clock counters, bounds and closing record remain; destination moves from console to private backend.                                                                                                         |
| Framework/client console and uncaught failures | Six console methods plus uncaught error/rejection events emit strict metadata: level/source/count, allow-listed error class and optional bounded framework digest. Raw arguments, exception text, stacks, URLs and media never enter the envelope. |
| Cleanup and workflow failures                  | New fixed resource/code/request-correlation records reach the same private stream; the UI does not show those fields.                                                                                                                              |

Cross-boundary record schemas and the framework-digest policy live once in
contracts. The early browser instrumentation preserves Zod's JIT-disabled CSP
initialization **before** diagnostic contracts are imported; the existing
no-code-generation regression caught and prevented an ordering regression. Both
framework fallback views contain generic copy and retry/reload controls.
Workflow UI maps only known codes to source-controlled actionable/generic copy,
rather than displaying a supplied message or technical identifier.

Browser reports POST to `/api/diagnostics`. The local bridge admits only the
canonical same origin, JSON/identity encoding and at most 8 KiB actual streamed
bytes, then forwards only the validated record to the pinned private backend on
port 4000. It forwards no cookies, authentication or arbitrary headers and
returns an empty 204 acknowledgement even when reporting fails. The backend
validates again, limits admission to 512 requests/minute per process, correlates
through the existing diagnostic context and writes through the existing private
sink. Reporting has a five-second timeout, no automatic retry and zero
processing or provider dispatches.

This is best-effort delivery: offline, saturated or shutting-down reporting can
lose records. There is no durable browser log or guaranteed delivery. Browser-
generated network/CSP messages, extensions and developer tooling are outside
application console ownership. Existing security/CSP observability remains;
these limits must not be presented as a promise to erase every browser-native
message. Client records are untrusted structural reports, not authoritative
security or billing evidence. Hosted auth/routing and wider STRIDE acceptance
remain CL-012/015 work.

## Verification ledger

This ledger records the initial implementation at input SHA
`2714a3612f47c9e3152c4a76ff1c1a9c3819ab393bc2b079209acedcfc0dd470`. The
[follow-up validation ledger](CODE_QUALITY_VALIDATION_2026-10-07.md) supersedes
its test/build counts for the current proposal and records both new findings and
their corrected evidence. Prior browser measurements retain their original
scope.

| Check                              | Settled result                                                                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `corepack pnpm format:check`       | Pass                                                                                                                                                                      |
| `corepack pnpm lint`               | Pass, no lint warnings                                                                                                                                                    |
| `corepack pnpm typecheck`          | Pass across root, contracts, composition and all apps                                                                                                                     |
| `corepack pnpm test:unit`          | Pass: 1,219 tests / 104 files                                                                                                                                             |
| `corepack pnpm build`              | Pass on the secret-free projection of final working inputs, using the exact installed dependency tree                                                                     |
| Local frontend artifact inventory  | Pass: 1,302 files, 26 links, 22,099,037 bytes, 10 app routes; SHA-256 `0250aba0987838ede521cca80ee9ec21d959ce8d8665cae5c5ab934a7206da02`                                  |
| Strict frontend release artifact   | Remains failing with `release_artifact_invalid`; 26 external package links, `selfContained=false`. CL-013/015 target packaging remains open.                              |
| Focused browser fixture            | Pass: real changed React/CSS components with synthetic analysis/assembly, injected player/API ports and no real media/provider work; separate loopback origin and storage |
| Native media harness / real AI run | Not run: no renderer/media-processing implementation changed; owner paid/device/A/V acceptance remains open                                                               |
| Diff/status/input and scope review | Final checks recorded below; no Git mutation or private-input access                                                                                                      |

| Suite                                    | Tests | Files |
| ---------------------------------------- | ----: | ----: |
| Root boundaries/guards/artifacts/catalog |    40 |     4 |
| Contracts                                |    78 |     6 |
| Composition                              |     5 |     1 |
| Backend                                  |   552 |    28 |
| Frontend, including offline proof        |   434 |    49 |
| Renderer                                 |   110 |    16 |
| Total                                    | 1,219 |   104 |

The baseline was 1,212 tests / 96 files. Retired extraction-client/workspace and
testing-server coverage was removed with those dead paths; useful audio proof
was moved and still runs. New cleanup, guard, startup, worker, diagnostic,
recovery and precision regressions replace those obsolete assertions. Counts are
evidence, not a claim that more tests alone improve quality.

Tests retain the shared pre-import fake/paid-off environment, credential
removal, six `envDir:false` configurations and non-loopback network rejection.
The focused 514-request HTTP admission stress test has a bounded 20-second test
timeout to tolerate concurrent build load; its production limits and exact
512/429/next-minute assertions were not relaxed. The existing dependency
`fs.Stats` deprecation warning during renderer tests remains visible in private
tool output; it is not a browser message or a test failure.

The production build used an OS-temporary projection without ignored environment
files, private source, capture, replay or authoring media. Its preload installs
fake/paid-off/approvals-off settings and removes known credential variables,
then sets production compilation and disables telemetry. No new package version
or lockfile was installed. The offline cache lacked one tarball, so the exact
already installed dependency tree was copied and its internal junctions remapped
into the projection; pnpm auto-reinstall was disabled for that projection only.
No network download occurred. The normal repository dependencies/configuration
were preserved. These checks do not prove a reproducible frozen target-platform
install, a current registry/container scan or deployable Linux packaging.

The synthetic browser fixture used only injected port 4199, not the normal app
ports or owner storage. At 390×844 and 1280×900, changed recovery/player regions
fit and keyboard actions work; the browser's reduced-motion preference was
enabled. The first run measured helper calls, recovery stages, seeking and
volume. The delivery run produced 18 private lines: six accepted browser records
(two console and four preview records) plus request lifecycle records, with zero
stderr bytes, raw error sentinel occurrences or browser console logs. Unmount
left zero owned player listeners. Fixture tabs closed, viewport override reset,
and the exact owned Node/conhost identities and listener were cleaned up. This
does not repeat the full device/accessibility/performance matrix or prove native
Remotion playback, speech, A/V synchronization or final Download.

## Changed owners and retained scope

The manifest enumerates every changed source/config/test path. The changes group
into backend admission/startup/diagnostics and test support; frontend workspace/
worker/client cleanup, pure recovery/review, private diagnostics and framework
instrumentation; browser-safe diagnostic contracts; architecture/artifact
fixtures; one renderer precision test; and retired/moved offline proof.

Documentation owners updated: root `AGENTS.md`; frontend README; offline
browser-media/audio READMEs; the dated audit/plan/execution report and input
manifests; CL-014; ticket index; release-candidate ledger; local release guide.
Historical ticket evidence remains dated and is not rewritten into current live
proof. Root public README and product source of truth need no behavior change.
The remediation makes no architectural, rights, spend or product claim.

The authoring studio/capture scripts on port 3002 remain intentional local
motion-production tools, excluded from public release. This pass did not launch
them. The local replay CTA/transport/private saved copy remains until its
explicit deployment checkpoint; preserve the original diagnostic capture and
retained owner master. None of those ignored files was read, copied or deleted.

## Initial read-only validation — historical

The owner's subsequent walkthrough supersedes this verdict for the current
proposal; see [pass 1 and pass 2](CODE_QUALITY_VALIDATION_2026-10-07.md). This
earlier review concerned input SHA
`2714a3612f47c9e3152c4a76ff1c1a9c3819ab393bc2b079209acedcfc0dd470`.

TL;DR:

- The approved local corrections preserve workflow/manifest/provider ownership,
  keep existing backend logging and move browser diagnostics privately.
- The five local gates, targeted synthetic browser checks and final 375-file
  identity pass; all ten original findings have explicit dispositions.
- Wider security, immutable target packaging and owner real/manual acceptance
  remain open and are not inferred from synthetic proof.

Verdict: **Meets ticket with concerns in the authorized local remediation
scope**. **No actionable local code findings** remain in the settled proposal;
the concerns are the explicit wider release/owner gates below. The review covers
combined unstaged/untracked implementation against CL-014 and its approved plan,
over unchanged HEAD `452728c127ca123809df1a850ae6114256998537` and the final
initial input SHA recorded in this section. The index is empty. No unrelated
owner source changes were present at the audit baseline.

| Requirement                                                                        | Coverage                                                                             |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Concrete cleanup/deadline/boundary/startup defects                                 | Covered, including negative-before/positive-after evidence                           |
| Dead product/test-UI paths and production fixture ownership                        | Covered; useful offline proof and legacy cleanup retained                            |
| Coherent recovery and invariant review work                                        | Covered with focused unit/native synthetic browser evidence                          |
| Private backend logs / generic UI / no application console writes                  | Covered within the delivery and browser-native limits above                          |
| Hash/probe consolidation                                                           | Covered by explicit conditional retained dispositions and precision characterization |
| Final fake/no-key guards, all five gates, input and diff identity                  | Covered                                                                              |
| Owner actual media/AI/render/download and full device matrix                       | Unverified after this proposal; owner-only                                           |
| Full STRIDE, current external scans, strict target artifact, hosted ops/deployment | Unverified/open in owning packets                                                    |

The read-only pass inspected the settled source/test/config/contract changes,
new untracked modules, relevant controller/resource owners, ticket/docs diff,
private envelope and route limits, CSP initialization order, no-console/import
guards, preserved diagnostic fields/calls, fixture/build exclusion, unchanged
lockfile and final status. Dependency directions remain acyclic in the changed
runtime graph. No new unsafe cast, arbitrary diagnostic string, provider retry,
side-effectful application import or browser-facing technical error was found.
`git diff --check` and final input-byte verification pass. Tests and builds in
the ledger were completed during implementation; the review created no tests and
did not rerun a full suite, use external services or delegate.

The temporary build directory was removed after exact process-creation checks
and listener/descendant cleanup. Synthetic recipes and all private test logs are
preserved outside Git at
`C:\Users\minat\AppData\Local\Temp\clipbuilder-quality-evidence-20261007-ThYpEp`,
including `stdout-delivery.log` and the zero-byte `stderr-delivery.log`. The
normal backend logs, local environment, original capture, retained master and
private replay were not read, removed or altered. No fixture listener remains.

## Remaining release work and confidence limits

- CL-012: complete STRIDE data-flow/trust-boundary audit and fixes,
  supply-chain, secret/container/license review, privacy/retention and
  enforceable spend evidence.
- CL-013/015: reviewed rights-cleared public film assets, strict self-contained
  target artifact and full outstanding device/accessibility/performance/SEO
  checks.
- CL-015: production routing/private caller authentication, server-only injected
  configuration, deployable frontend/backend images, immutable build identity,
  external deployment approval, operational health/expiry/deletion/restart,
  telemetry/cost/rollback proof and removal of all testing/replay release
  inputs.
- CL-007/015: remove the temporary local replay CTA/transport/cache loading and
  its explicitly authorized saved replay copy at the release checkpoint; protect
  the original capture and retained master.
- Owner: manually repeat the affected real journey/export on the accepted live
  setup, including source intake, selection, review/seek/volume, export lookup,
  playback/download and Clear/Exit. Existing live keys/flags and applicable
  rights/transfer/paid/cloud approvals remain necessary. No new permission or
  test prerequisites were silently recorded.

`FAKE_MODE=true` with no keys still supplies labelled fixture results and
injected checks, with fixture Download disabled. No local AI weights/runtime
were added or verified. Real analysis/assembly/render requires the owner-managed
provider, private storage/renderer and enabled live/approval setup; agent paid
tests remain forbidden. Backend logs are preserved; raw user content is excluded
as required by repository privacy rules.

The local code-quality pass is complete with the documented findings resolved or
retained with reasons. Green checks and synthetic browser evidence provide
bounded confidence; they do not justify an absolute 100% guarantee, a numerical
10/10 quality certification, real AI-quality proof or public release approval.
