# Code quality audit — 2026-10-07

This is the **historical audit-only baseline**. The owner subsequently approved
implementation; current dispositions and verification are in the
[execution report](CODE_QUALITY_REMEDIATION_2026-10-07.md). The baseline
identity and original evidence below are preserved.

Status: audit and remediation planning complete; **no application, test,
configuration, dependency or deployment changes implemented**. Findings remain
open. This is the current code-quality assessment under CL-014, following the
owner's explicit audit-only instruction. It does not complete STRIDE, the full
release audit or CL-015.

The owner reports that the real journey, including export, works and that the
landing motion is polished. Preserve that behavior as the acceptance baseline.
This report records that statement as owner evidence; it does not substitute an
agent-run paid test or invent a new media/device acceptance matrix.

The [remediation plan](CODE_QUALITY_REMEDIATION_PLAN_2026-10-07.md) specifies
small changes, dependencies, regression checks and stop conditions. The
[input manifest](CODE_QUALITY_AUDIT_2026-10-07_INPUTS.json) records every file
included in the source identity.

## Scope and evidence limits

The review covered dependency direction, responsibility and structure, dead and
obsolete paths, duplication, type safety, state and persistence, asynchronous
work and cleanup, provider dispatch/retry boundaries, preview/render parity,
performance opportunities, tests, scripts, styles and release exclusions.

Methods were tracked-file inventory, TypeScript syntax/import analysis,
reference searches, focused manual tracing of the current workflow and resource
owners, the existing deterministic suites, and three isolated synthetic probes.
Coverage tables below distinguish static inspection from execution. This is not
a claim that every possible runtime path or every line has been independently
proven correct.

`FAKE_MODE=true` with no API keys supports labelled fixture UI and injected
synthetic processing/lifecycle checks. Fixture Download remains disabled. The
1,212 passing tests are fake/injected evidence, not real AI quality evidence.
Real analysis/assembly/export needs provider keys, enabled live capabilities,
the applicable owner approvals and the private renderer/storage setup. Paid-flow
testing remains owner-manual. No local AI model or weights runtime is involved.

No ignored environment/credential files, retained source, original diagnostic
capture or private replay copy were read, copied, modified or deleted. No
provider, credential, cloud, registry-feed or paid operation ran. No application
was started, restarted or stopped. No Git mutation was performed. Generated
contract/composition outputs from type checking are not implementation edits.

## Audited identity

| Item                                     | Evidence                                                           |
| ---------------------------------------- | ------------------------------------------------------------------ |
| HEAD                                     | `452728c127ca123809df1a850ae6114256998537`                         |
| Starting worktree                        | Clean                                                              |
| Source/config/test/build input inventory | 358 tracked files                                                  |
| Input SHA-256                            | `d18a707990144258dbd5b134b347c976e099580992a98907efb6219df2155630` |
| Lockfile SHA-256                         | `cbf16cbaaf453fa97cdd219f9002997fa037753a81c46d1fee21aa4936167a83` |
| Runtime used for this audit              | Node `24.19.0`; pinned pnpm `11.19.0`; TypeScript `6.0.3`          |

The manifest includes tracked apps/packages/test TS, TSX, MJS, CSS, JSON and
YAML inputs, the enumerated root configuration/ignore files, CI workflows and
tracked app environment examples. It excludes documentation, ignored build
outputs, installed packages and private files. Hashing uses sorted relative
paths, UTF-8 path plus NUL, then the raw SHA-256 digest of each file; the
concatenation is SHA-256 hashed. The JSON manifest contains the exact path list
and per-file hashes.

## Coverage ledger

The 345 app/package/root-test files in the inventory contain 70,828 lines,
including tests, styles and configuration. Line counts are descriptive; size
alone is not a defect.

| Area               | Tracked files / lines | Review and execution                                                                                                                                                                                                          |
| ------------------ | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend            |           89 / 22,607 | Composition/config, admission/receipts, analysis and provider adapters, selected assembly, render, private streaming, diagnostics and synthetic demo paths traced; 546 tests in 26 files pass                                 |
| Frontend           |          159 / 34,806 | Intake and upload, browser workspace/worker/lease/journal, canonical session/reconciliation/persistence, challenges, stage orchestration, candidate/review/output playback, hero and CSS reviewed; 444 tests in 44 files pass |
| Renderer           |            50 / 7,737 | Private routes/caller boundary, storage generations/intents/expiry, operation ownership, processes/scratch, media validation, fixed bundle and packaging reviewed; 109 tests in 16 files pass                                 |
| Contracts          |            31 / 4,449 | Published schemas/policies, manifest versions and validation responsibilities inspected; browser-safe compiler/boundary checks and 73 tests in 5 files pass                                                                   |
| Shared composition |               8 / 547 | Fixed focus/caption/card/picture rendering and browser/render sharing inspected; 5 tests in 1 file pass                                                                                                                       |
| Root tests         |               8 / 682 | Boundary negatives, pre-import isolation, fixture catalogue and release-artifact guards reviewed; 35 tests in 4 files pass                                                                                                    |

| Audit topic               | Result / limit                                                                                                                                                                                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependency direction      | Current imports follow the approved app/contracts/composition directions. Renderer TSX enforcement gap is Q-03                                                                                                                                                                                                                              |
| Cycles                    | No cycles found in resolved relative static import/re-export edges across 325 TS/TSX/MJS modules. Dynamic/framework/package resolution is outside that particular scan                                                                                                                                                                      |
| Type escapes              | AST scan found zero explicit `any` type nodes and zero `as any`/angle-bracket `any` casts in those modules. Non-null assertions and other casts still require their local schema/ownership preconditions                                                                                                                                    |
| Workflow authority        | Reducer owns accepted stages; workspace owns artifacts/reservations; persistence is a projection. No reason found to replace these authorities                                                                                                                                                                                              |
| Routes and ports          | Routes generally validate, invoke the owning use case and map responses. Use cases depend on ports/domain values. Hosted transport remains a release prerequisite                                                                                                                                                                           |
| Calls and retries         | Current source analysis uses Transcribe followed by candidate generation for usable words; selection uses one planning generation and bounded image attempts; export invokes the private renderer. Admission actions are orchestration units, not a one-to-one provider-billing counter. Existing synthetic call-count/no-retry checks pass |
| Resource lifecycle        | Worker, frame/sample, OPFS/IDB, lease, URL, timer, challenge, request/stream, subprocess, scratch and storage cleanup traced. Q-01 is a reproduced exception-path gap; Q-02 concerns deadline classification                                                                                                                                |
| Preview/export parity     | Browser preview and renderer share fixed composition. Integrity, generation, receipt, output lookup and byte-range checks remain necessary; no competing compositor was found                                                                                                                                                               |
| CSS                       | Static CSS-module reference scan found no unreferenced selector candidates in the seven imported modules. This is not a complete cascade/runtime audit. No bulk CSS deletion is proposed                                                                                                                                                    |
| Dependencies              | Pinned runtime dependencies have source or script consumers. Mediabunny is still needed for source inspection after Q-05. No runtime dependency is proven removable as a whole. Registry vulnerability/container/license review remains for security/release work                                                                           |
| Diagnostics               | Content-free diagnostic types, bounded records and request correlation are intentional. Local private-capture/replay exceptions remain governed by their owner decisions; release cleanup is R-03                                                                                                                                           |
| Tests                     | Existing coverage exercises bounds, call budgets, uncertain outcomes, abort/cleanup, recovery, schema/parity and packaging. Q-01/Q-03 need additional failure/negative cases; the current green suite does not cover those probes                                                                                                           |
| Public/runtime acceptance | No fresh real media, paid flow, responsive/accessibility/device matrix, deployed restart/expiry/rollback or billing measurement was performed                                                                                                                                                                                               |

## Findings

Priorities express remediation order: P2 is a concrete robustness/enforcement
gap or material cleanup; P3 is a smaller cleanup or conditional improvement. No
finding below proves the owner-reported happy path is currently broken. All
application changes remain unimplemented.

### Q-01 — Cleanup stops at the first throwing stopper

**P2; reproduced; CL-003/005 lifecycle, corrected through CL-014.**

Evidence: `apps/frontend/src/features/session/session.effects.ts:25` invokes
every stopper before clearing either ownership set, without exception isolation.
`session.provider.tsx:122` passes this method as workspace `releaseConsumers`.
`browser.workspace.ts:316` invokes it before revoking the source URL, and
`browser.workspace.ts:683` calls that release before starting deletion work.

Synthetic probe: register a throwing stopper, a second counting stopper and a
synthetic URL; call `clear()`. The observed result was:

```json
{ "thrown": true, "laterStop": 0, "revoked": 0, "remaining": 3 }
```

No real URL, file, browser media or application process was involved. A stopper
failure can therefore prevent unrelated effects and source release/deletion from
being attempted. Existing normal-path tests still pass.

Plan: make ownership draining exception-resilient and idempotent; ensure
workspace release proceeds even if a consumer fails. Retain cleanup fences and
honest failure reporting. Regressions must cover throwing stoppers/revocation,
later callbacks, source release, deletion attempts and repeated Clear/Exit.

### Q-02 — The admission deadline is labelled as a client abort

**P2; reproduced; CL-007/011 diagnostics, corrected through CL-014.**

Evidence: `apps/backend/src/admission/processing.admission.ts:223` constructs a
`CLIENT_ABORTED` rejection for any owned-controller abort; line 231 uses that
same cancellation callback for the policy deadline. The caller need not abort.
`final-render.usecase.ts` already distinguishes `TimeoutError` from client
cancellation, but this admission path does not preserve that cause. Route and
frontend flow timers also need a focused cause-propagation review.

Synthetic probe used a 10-ms injected policy, a synthetic encrypted grant, a
stub abuse verifier and one fake dispatch that stops on abort. No live
composition or provider ran. The result was:

```json
{
  "code": "CLIENT_ABORTED",
  "callerAborted": false,
  "fakeCalls": 1,
  "dispatchAborted": true
}
```

Plan: distinguish internal deadline from caller cancellation with a fixed safe
reason/code. Keep uncertain/consumed action state, one dispatch, zero automatic
retries, concurrency accounting and cleanup ownership unchanged. Test deadline,
caller abort, expiry, simultaneous completion/abort and late dispatch
settlement. Do not shorten deadlines or change the successful flow as an
optimization.

### Q-03 — Renderer TSX files escape the import boundary rule

**P2; reproduced; CL-001/006 executable architecture guard.**

Evidence: `eslint.config.mjs:185` applies renderer cross-application
restrictions to `apps/renderer/**/*.ts`. Renderer composition includes `.tsx`
files. `test/boundaries.test.ts` tests renderer negatives using only `.ts`.

Read-only `ESLint.lintText` probes with the same side-effect import produced one
`no-restricted-imports` error for an in-memory renderer `.ts` path and zero
errors for the corresponding `.tsx` path. No fixture was written. No actual
illegal renderer import was found.

Plan: apply the restriction to TS and TSX; add published and relative cross-app
negative cases for renderer TSX, with allowed contracts/composition positives.
This changes guard coverage without changing product execution.

### Q-04 — Backend entry-point imports perform startup work

**P2; statically confirmed; CL-001 composition/import safety.**

Evidence: `apps/backend/src/server.ts:11` evaluates local environment loading at
module top level, then composes the backend and calls `application.listen` at
line 36. It also installs process signal handlers at module top level. The
renderer entry point instead guards executable startup at
`apps/renderer/src/server.ts:80`.

The backend server module was deliberately not imported to reproduce this: doing
so could load the owner's ignored configuration or start the real app. Its
top-level statements establish the gap. The regular `app.ts`/use-case imports
remain separate and the existing fake suites pass.

Plan: provide explicit backend startup and an executable-entry guard. Keep
normal environment precedence, localhost port, capability defaults, diagnostics
and shutdown behavior intact. Verify import with spies: no environment-file
load, configuration composition, listener or process handler until explicit
startup. Any additional hosted shutdown/drain behavior belongs to the CL-015
lifecycle packet and requires its own evidence.

### Q-05 — Obsolete browser audio extraction remains in the shipped worker

**P2; reference/ownership evidence; CL-006 migration cleanup.**

Evidence: `browser.workspace.ts:598` exposes `extractAudio`; its current callers
are workspace tests. The product source-analysis flow uploads the source and
obtains renderer-generated analysis audio, and does not call this method.
`source.worker.ts:19` still statically imports `audio.extraction.ts` and
supports the `extract-audio` command; the client/protocol retain its
audio-progress, validation and stall machinery. The browser-media feasibility
server also transpiles the old extraction/profile/sample modules for synthetic
experiments.

This is unreachable from the current product orchestration, not an entirely
unreachable module graph: the normal worker imports it, and the harness uses it.
No production bundle-size reduction was measured.

Plan: remove the obsolete product extraction command, workspace method and its
exclusive client/protocol machinery after proving current upload/intake/recovery
callers. Keep browser source inspection/copy/reopen/delete, fingerprints, OPFS
ownership and Mediabunny decoders. Keep or migrate useful synthetic timestamp,
offset/bounds and cleanup proof outside the product worker. In particular,
`clear-audio` is still used during workspace restoration to delete legacy
scratch; preserve that cleanup or an equivalent migration. Coordinate the old
harness retirement described under R-03.

### Q-06 — Retired candidate generation schema construction is test-only

**P3; reference evidence; CL-007 adapter cleanup.**

Evidence: `analysis.provider-shape.ts:13` exports `candidateSelectionSchema` and
line 72 exports `candidateGenerationJsonSchema`. The latter is consumed by
`transcribed-analysis.test.ts`; the schema also supports a diagnostic test.
Production selection uses `CANDIDATE_GENERATION_SCHEMA_POLICY = "json_only"` and
`normalizeCandidateSelection` with its tolerant proposal decoder.

Plan: relocate the retired transport-schema reproduction to a clearly named test
fixture if it still carries useful historical regression evidence, or remove
only evidence that is truly obsolete. Keep JSON-only transport, local
normalization/canonical validation, array/envelope acceptance and diagnostics.
Do not restore the provider response-schema setting that previously failed.

### Q-07 — Review notes are regenerated on every playback frame

**P3; static performance opportunity; CL-010.**

Evidence: `cloud-clip.review.tsx:159` subscribes to `frameupdate` and updates
component frame state. Lines 209/219 call `fixedReviewNotes(result)` and
`reviewInterestNotes(analysis, selected)` during each render. Those helpers map
focus/evidence/visual data and serialize views even when assembly and analysis
are unchanged.

`ReviewTranscript` already memoizes selected words; its clock-dependent
highlight must continue updating. No current playback-speed regression or
measured frame drop is claimed.

Plan: memoize only assembly/analysis-derived notes with stable dependencies;
measure helper invocations and render work using synthetic data. Preserve frame
rate, seek rounding, note clicks, transcript highlights, buffering and retry
behavior. Shared caption layout recalculation is bounded and remains unchanged
unless separate measurements justify work.

### Q-08 — Stage UI and orchestration share one large experience component

**P3; maintainability opportunity; CL-004/010.**

Evidence: `sample.experience.tsx` has 1,308 lines covering fake/live entry,
challenges, pending controllers, upload progress, analysis, selection, export,
recovery/exit and stage presentation. `session.reducer.ts` has 994 lines but
owns intentional state transitions rather than an unrelated collection of
utilities.

Plan: first extract pure stage presentation with explicit typed props, keeping
the current controller/effect and reducer owners. Extract a cohesive
orchestration responsibility only if that second step reduces coupling without
duplicating state. A large line count does not justify rewriting the reducer,
replacing the state machine, new global contexts or a new framework.

### Q-09 — JSON payload hash primitives are repeated across backend owners

**P3; duplication identified; retain by default until benefit is established.**

Evidence: `analysis.usecase.ts`'s `resultDigest`, selected assembly's local
`digest`, final render's local `digest` and `fixed-assembly.ts`'s
`manifestDigest` repeat SHA-256 over serialized payloads. Their inputs and
receipt-exclusion rules are intentionally different. Browser integrity checking
uses browser crypto.

Plan: consider one narrowly named backend payload-digest primitive only after
synthetic byte/order/receipt-exclusion characterization proves compatibility.
Domain wrappers should keep their different payload responsibilities. Do not
move Node crypto into contracts/composition, change canonical serialization,
replace exact binding checks with broad equality, or introduce a shared
catch-all utility. Retaining these small wrappers is acceptable if abstraction
adds risk without reducing meaningful duplication.

### Q-10 — Renderer stages probe the same input twice within one operation

**P3; static efficiency opportunity; measurement required; CL-006.**

Evidence: `media-operations.ts:76`, 378 and 456 inspect the downloaded input;
`inspectSource` invokes ffprobe. `node-pipeline.ts:43` and 111 independently
probe that same input when producing audio or a selected/preview proxy. Separate
output probes validate newly encoded artifacts and must remain.

Plan: measure local synthetic probe counts/cost first. If worthwhile, carry a
call-scoped validated inspection plus exact timing/probe metadata into encoding.
Keep generation/fingerprint/range/codec validation, raw timestamp precision,
rotation and output probes. Reusing rounded `durationMs` alone can change audio
duration/PTS, so that shortcut is unsuitable. Do not cache private inputs across
operations/sessions or redesign storage to save this small amount of work.

## Release carryovers, outside this code remediation pass

### R-01 — Hosted browser/API transport is still unimplemented

The frontend API bridges require localhost origin and pin the backend loopback
port. Backend config rejects protected/paid nonlocal composition. These
deliberate guards protect the current local flow; supplying production
credentials does not make them hosted-ready. CL-015 still needs server-only
hosted routing/private authentication, configuration, image packaging and
deployed lifecycle evidence. Do not relax these guards as a code-quality
cleanup.

### R-02 — The current frontend artifact is not a strict release artifact

The existing generated artifact passes local inventory: 1,305 files, nine app
routes, 26 external package links, `selfContained=false`, 26,377,060 inventoried
bytes, digest
`f6bc6a22b7c7d1cd24e15018581245d73996747dde1bd26997e26a974163f4ae`. Strict
verification returns `release_artifact_invalid`.

The local motion hero uses ignored capture/poster assets under
`public/generated/product-film`; strict release verification also excludes that
authoring input. CL-013/015 must package reviewed, rights-cleared public
delivery assets while preserving the accepted hero and provide a self-contained
target artifact. These inspections read existing output; no fresh production
build or Linux image was made by this audit.

The matching private renderer rollout is already recorded as verified on
2026-10-07 in CL-011. This report does not reopen that completed rollout. Any
future material renderer code change requires a new matching immutable image and
separately authorized rollout before owner live acceptance.

### R-03 — Old test UIs, authoring surfaces and replay need explicit disposition

- Port 4185 belongs to the opt-in browser-media feasibility UI. Its source still
  exists. Retain useful synthetic proof while retiring obsolete experiments;
  remove the old UI launcher/routes if that proof can run without the page.
- Port 3002 belongs to Remotion Studio authoring for the accepted landing film.
  It is not part of the product stack. Keep useful authoring source locally and
  exclude authoring/test entry points from release images/routes.
- `/motion-preview` is already absent from the product routes; the current
  generated app-route inventory contains nine approved routes.
- The local sample-replay CTA/transport/cache/private saved copy remain
  intentionally authorized until explicit pre-deployment cleanup. Remove them at
  that checkpoint, preserving the original capture and retained owner source.

The earlier read-only port inspection found no listener on 4185 or 3002. This
audit did not launch either UI. Before release, recheck process ownership and
listeners; absence of a listener does not prove source/build exclusion.
Canonical product frontend/backend ports remain 3000/4000.

## Retained code and rejected cleanup suggestions

| Candidate                                    | Decision and reason                                                                                                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Entire browser media worker / Mediabunny     | Keep: actual source inspection, decode support, fingerprinting, copying, reopening and deletion still depend on it                                                                   |
| `clear-audio` recovery cleanup               | Keep/equivalently migrate: old scratch can survive prior sessions even after extraction is removed                                                                                   |
| Fake/demo flow                               | Keep: labelled API-free fixture behavior and deterministic tests are supported product/development capabilities; fake Download stays disabled                                        |
| Manifest V1/V2 schemas and synthetic samples | Keep current consumers: fake flow, restoration and V3 construction still reference them; version suffix alone is not proof of dead code                                              |
| Grant-key legacy parsing                     | Keep for now: `loadConfig.ts` actively accepts the legacy key environment representation. Removing it requires a documented owner configuration migration without inspecting secrets |
| Disabled/retired flags in tests              | Keep where they prove refusal/ignored compatibility. `PAID_VALIDATION_STAGE` is already ignored in normal configuration; old test values do not prove a stale production switch      |
| Large CSS files                              | Preserve accepted cascade/responsive behavior. Every statically scanned module selector had a reference; split only with a clear ownership benefit and focused visual evidence       |
| Safe diagnostics and local capture           | Keep current bounded diagnostics. Release removal of the replay exception is separately scheduled; bulk deletion would discard useful failure evidence                               |
| Integrity checks / output validation         | Keep: repeated checks at different trust/lifecycle boundaries are intentional. Only same-input, same-operation probe duplication is a conditional optimization                       |
| Separate backend media downloads across jobs | Keep: independent generation/binding validation and disposable scratch ownership are intentional. No general cache, queue or durable project is proposed                             |

## Verification record

Only the final successful checks below establish the current deterministic
baseline. Earlier sandbox invocations hit restricted pnpm/junction access; the
corresponding checks were rerun through the approved outside-sandbox mechanism.
Corepack used the already-installed pinned cache with process-only
`COREPACK_HOME` and `COREPACK_ENABLE_NETWORK=0`; no dependency installation or
package download ran.

| Exact check                                                                                      | Result                                                                                                                      |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `corepack pnpm format:check`                                                                     | Pass on the original source revision                                                                                        |
| `corepack pnpm lint`                                                                             | Pass                                                                                                                        |
| `corepack pnpm typecheck`                                                                        | Pass: contracts/composition builds, root test types and all app typechecks                                                  |
| `corepack pnpm --workspace-concurrency=1 test:unit`                                              | Pass: 1,212 tests / 96 files; existing nested scripts retain their own scheduling                                           |
| In-memory effect-registry probe                                                                  | Reproduces Q-01; no real resource                                                                                           |
| In-memory admission deadline probe                                                               | Reproduces Q-02; one fake dispatch, caller not aborted                                                                      |
| `ESLint.lintText` TS/TSX negative probes                                                         | Reproduces Q-03 without writing fixtures                                                                                    |
| Tracked source AST/reference/CSS inspection                                                      | Results and limits recorded above                                                                                           |
| `node --experimental-strip-types apps/frontend/scripts/verify-release-artifact.ts --local-build` | Existing artifact passes local inventory outside sandbox                                                                    |
| `node --experimental-strip-types apps/frontend/scripts/verify-release-artifact.ts`               | Existing artifact fails strict release verification outside sandbox                                                         |
| Fresh `corepack pnpm build` / frozen install                                                     | Not run in this audit. Prior exact-HEAD five-gate evidence is in CL-011; it is historical evidence, not a fresh result here |

Final documentation checks: repository formatting passes; the three new audit
documents were explicitly formatted because the root formatter excludes
Markdown. Twelve links in the new documents/added handoff sections resolve.
`git diff --check` passes. All 358 input hashes still match the audited
manifest, and final Git status lists only the six documentation files below.

- `docs/operations/CODE_QUALITY_AUDIT_2026-10-07.md`
- `docs/operations/CODE_QUALITY_REMEDIATION_PLAN_2026-10-07.md`
- `docs/operations/CODE_QUALITY_AUDIT_2026-10-07_INPUTS.json`
- `docs/operations/RELEASE_CANDIDATE_AUDIT.md`
- `docs/tickets/CL-014-audit-release-candidate.md`
- `docs/tickets/README.md`

Not performed: registry vulnerability/dependency feed, container scan, full
historical secret/license/rights scan, STRIDE threat-model/fix pass, synthetic
native-media opt-in harnesses, new browser visual/performance checks, owner paid
flow, deployment, public end-to-end acceptance or rollback. These are named
remaining gates, not inferred passes. No known runtime dependency upgrade is
recommended from unverified package-age assumptions.

## Disposition

The code-quality audit is documented and reproducible at the stated input
identity. Q-01 through Q-10 are open proposals with their evidence strength
shown. R-01 through R-03 stay with release work. The latest instruction
authorizes documentation only; it does not authorize remediation, commits or
deployment.

Execute any later approved correction as one dependency-ready CL-014 slice,
update the affected earlier owner packet only for real evidence, then rerun its
focused regressions and settled final gates. Larger refactors and optimizations
are conditional; preservation of the working journey outranks reducing lines.
