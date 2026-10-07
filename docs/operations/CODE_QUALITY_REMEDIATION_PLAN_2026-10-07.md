# Code quality remediation plan — 2026-10-07

Status: **local execution complete; external acceptance remains open**. See the
[execution report](CODE_QUALITY_REMEDIATION_2026-10-07.md) for every
disposition, the five passing gates, synthetic browser evidence and confidence
limits. Q-09/Q-10 were deliberately retained under this plan's conditional
criteria. The owner first requested audit/documentation only, then explicitly
approved this plan's local implementation on 2026-10-07. Existing backend logs
must remain; application and framework browser diagnostics are routed privately
with generic visitor errors. This plan belongs to CL-014 and follows the
[dated audit](CODE_QUALITY_AUDIT_2026-10-07.md). It is not a new feature ticket,
Git authorization, paid-test approval or deployment authorization.

The subsequent owner-requested
[validation walkthrough](CODE_QUALITY_VALIDATION_2026-10-07.md) found and fixed
two worker error-monitoring/interpreter gaps. Revalidation has no new actionable
local findings; all five settled gates pass with 1,223 synthetic tests. No
successful workflow, CSP permission, paid allowance or private log was removed.

## Behavior that every change must preserve

1. The accepted landing, 50-second motion hero, responsive layout and entry
   flow.
2. Supported local source intake, rights/data-transfer acknowledgement, bounded
   upload and confirmed-byte progress; retained sample behavior stays local.
3. Grounded analysis returning zero to four candidates without padding; exactly
   one candidate is selected, with its original word-bound range.
4. Automatic fixed captions, speaker focus and contextual visuals; the same
   accepted manifest drives browser review and final rendering.
5. Review playback, seek, volume, transcript highlights, meaningful notes and
   buffering/error recovery; no additional editor or controls.
6. One confirmed export, actual H.264/AAC output lookup, minimal final result,
   playback and download; restore never creates another paid render.
7. Clear/Exit/expiry/refresh/unmount fencing, bounded deletion, honest pending
   cleanup and protection of the retained owner master/original capture.
8. Current request/receipt/generation/digest validation, provider call counts,
   consumed/uncertain outcomes, zero automatic provider retries and spend
   limits.
9. Environment-only backend configuration, current normal owner defaults and
   paid-master precedence. Test/CI composition stays fake/paid-off before
   imports.
10. Labelled fake/no-key behavior, including disabled fixture Download. Browser,
    backend, renderer, contracts and composition boundaries stay unchanged.

Do not rework product behavior to make a refactor easier. The permitted behavior
differences are narrowly demonstrated defect corrections such as releasing the
remaining resources after a cleanup callback throws, or accurately labelling an
internal timeout. Record those differences explicitly.

## Execution order and gates

Each numbered item is a separate reviewable slice under the existing packet;
finish its focused verification before starting the next. No blanket rewrite or
dependency upgrade is included. Rebase the source identity before implementation
if any code changes after the audited HEAD.

| Order | Slice                                              | Findings  | Dependency / exit condition                                                                                 |
| ----: | -------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
|     0 | Capture regression baseline                        | All       | Exact current revision and affected scenario expectations recorded                                          |
|     1 | Make cleanup exception-resilient                   | Q-01      | Throwing-cleanup regression fails before correction, then passes; normal Clear/Exit unchanged               |
|     2 | Close the renderer TSX guard gap                   | Q-03      | Both prohibited import forms rejected; permitted package imports pass                                       |
|     3 | Isolate backend executable startup                 | Q-04      | Import is side-effect-free; explicit fake startup preserves configuration/HTTP behavior                     |
|     4 | Preserve deadline causes                           | Q-02      | Timeout/client abort/expiry distinguished; counts/fencing/cleanup unchanged                                 |
|     5 | Retire obsolete browser extraction plumbing        | Q-05      | Source/recovery/deletion preserved; legacy scratch still removed; useful synthetic proof retained           |
|     6 | Isolate retired provider-schema test support       | Q-06      | JSON-only production transport and canonical validation unchanged                                           |
|     7 | Reduce invariant review computations               | Q-07      | Measured helper work falls; clock/seek/highlights/notes behavior unchanged                                  |
|     8 | Extract coherent pure stage presentation           | Q-08      | Only if clearer ownership is demonstrated; targeted fake browser comparison passes                          |
|     9 | Evaluate remaining duplication/probe optimizations | Q-09/Q-10 | Implement only if characterization and measurements justify risk; retaining current code is a valid outcome |
|    10 | Final code-quality gate and handoff                | All       | No unresolved material correction; final exact revision/input digest and evidence updated                   |

### 0. Characterize the working behavior

Use existing fake/source-controlled data and tests first. Record accepted
reducer events, API shapes, manifest/digest payloads, call counts,
uncertain-outcome reservations and cleanup fences for the affected slice. The
audit already ran all 1,212 tests; repeat the complete suite at the settled
gate, not after each small edit.

Add focused regressions for actual gaps. For cleanup, deadline and guard
changes, show the negative case against the pre-change implementation. For
structural changes, compare outputs/transitions and externally visible behavior,
rather than testing the new file arrangement.

Owner-reported real success is the live baseline. Automated fake/injected checks
use `FAKE_MODE=true`, no keys and paid/live flags off. They cannot prove real
model quality, A/V timing, provider billing or cloud deletion. Real
affected-flow acceptance remains owner-manual with the existing live setup and
approvals; no agent paid run is included. No local AI model assets are required
or introduced.

### 1. Cleanup robustness

Expected files: `session.effects.ts`, its existing persistence/lifecycle tests,
and narrowly `browser.workspace.ts` if needed to keep media release independent
of consumer failures.

- Drain an owned snapshot so callbacks cannot strand resources through mutation
  or re-entry. Keep unregister/revoke/clear idempotent and each stopper owned
  once.
- Attempt later stoppers and URL revocations when an earlier one throws.
- Ensure source references and physical deletion attempts are not skipped by a
  consumer-release exception. Preserve the pre-existing synchronous generation
  fence, remote cleanup journal and lease-drain ordering.
- Keep any surfaced cleanup diagnostic fixed/content-free; do not log callback
  exception text, URLs or media identifiers.

Focused evidence: throwing first stopper, throwing URL revocation, multiple
resources, recursive/repeated clear/unregister, source release and subsequent
workspace cleanup. Recheck success, aborted work, expiry, unmount and Exit while
deletion is in progress.

### 2. Architecture guard completeness

Expected files: `eslint.config.mjs`, `test/boundaries.test.ts`.

Extend renderer import restrictions to TSX. Prove published and relative imports
from either other application fail for TS and TSX. Keep published contracts and
shared composition valid. Check that Node/browser global handling for TSX
matches its actual renderer role without making shared composition Node-aware.

Focused command:

```text
corepack pnpm exec vitest run --config vitest.config.ts test/boundaries.test.ts
```

Run root lint/typecheck after the guard settles. No UI/browser or live test is
needed for a rule-only change.

### 3. Explicit backend startup

Expected files: `apps/backend/src/server.ts` and a focused synthetic startup
test; update the backend guide only if its documented entry-point behavior needs
it.

Separate an explicit startup function from executable detection. The executable
path continues normal app-local environment loading; imports do not load a file,
compose services, create private capture, listen or install process handlers.
Keep environment precedence, localhost binding and the existing startup
messages. Own and dispose signal handlers for the created server.

Tests use spies/injected fake composition and synthetic environment objects.
Never import the existing unguarded entry point in a real configuration as a
test. A separate hosted shutdown/drain design is deferred to CL-015; do not
silently add cloud lifecycle assumptions here.

### 4. Deadline cause propagation

Expected core files: `processing.admission.ts` and its tests; narrowly adjust
route/use-case/flow boundaries only where characterization proves they lose the
same cause.

Use one fixed deadline reason or explicit abort classification. Preserve caller
cancellation, expiry/fencing, one dispatch, no automatic retry, active-slot
release after actual settlement and uncertain operation consumption. Keep the
successful timeout duration and operation budget fixed.

Regression matrix: pre-aborted caller, caller abort during verifier/dispatch,
internal deadline with an untouched caller, simultaneous deadline/completion,
late settlement after abort, Clear/Exit during work, failed cleanup, and an
action that must not be dispatched a second time. Verify safe HTTP/UI mapping
separately from private diagnostic detail.

### 5. Browser audio retirement and old UI disposition

Expected product files: `browser.workspace.ts`, `source.client.ts`,
`source.worker.ts`, `source.protocol.ts`, extraction-exclusive profile/protocol
code and their owning tests. Determine the final removal list from actual
references before editing.

Remove only the old local audio extraction product path. Keep source inspection,
decoder validation, rotation/duration/profile bounds, fingerprints, OPFS
copy/reopen/delete, abort/generation protection and worker shutdown. Keep legacy
audio scratch deletion on restore/clear, with a stable cleanup-only owner.

The browser-media harness serves those modules today. Preserve useful synthetic
clock/offset/gap/bounds/storage cleanup tests by moving their pure proof out of
the product graph. Retire its obsolete port-4185 UI/launcher once equivalent
proof is runnable without that page. Update its README/scripts/asset-exclusion
test allowlists consistently. Removing the old page must not remove
source-intake coverage or replace the real flow with fixtures.

Remotion Studio on port 3002 remains a useful film authoring tool; its entry
point is excluded from deployed inputs. `/motion-preview` is already removed.
Check canonical 3000/4000 startup documentation stays intact. Any process
cleanup must use verified repository ownership; this slice does not authorize
starting or stopping normal apps.

Evidence: intake/copy/reopen/clear/expiry/worker failure tests, legacy scratch
recovery, source-analysis call counts, harness proof and import/build exclusion.
Compare product-worker imports and bundle inputs; report a size gain only if
measured on equivalent builds.

### 6. Retired provider schema support

Expected files: `analysis.provider-shape.ts`, `transcribed-analysis.test.ts`,
`gemini.diagnostics.test.ts`, and a narrowly named test fixture if useful.

Move the unused generation schema builder out of the production adapter module.
Keep JSON-only requests, normalized array/envelope acceptance,
transcript-grounded references, canonical bounds and rejection diagnostics
byte-for-byte where applicable. Preserve useful schema-isolation history as
test-only evidence. Do not alter provider prompts/models or introduce a response
schema/retry.

### 7. Playback computation

Expected files: `cloud-clip.review.tsx` and focused review tests.

Memoize invariant notes using assembly/analysis/selection identity. Keep the
changing playback clock, transcript active-word update and player events intact.
Only stabilize callbacks or split memoized presentation if measurements show
that extra work is useful. Record synthetic helper invocation counts or profiler
evidence; do not claim a user-visible speed improvement from code inspection.

Evidence: note content unchanged, exact source-to-frame seek boundaries,
highlight click/clear, volume/play/pause/ended, buffering and retry access.
Preview retry still performs access reads and starts zero new processing
operations.

### 8. Coherent experience components

Expected files: `sample.experience.tsx` and existing sample-feature components/
tests. This is optional after the concrete findings settle.

Begin with pure stage rendering that receives typed state/action props. Keep
async controllers, challenge resolution, generation checks and reducer dispatch
with their current owners. Extract further only where a complete responsibility
has a clear input/output boundary. Avoid moving effects while also changing
event sequencing, and keep fake/live labels/capability gates visible.

Evidence: equivalent fake entry, upload progress, zero/one/multiple candidates,
one selection, review, export confirmation, result/recovery/failure and
Clear/Exit states. Use focused browser checks for changed presentation, keyboard
focus, responsive fit and reduced-motion behavior. Preserve CSS order and the
accepted landing; no large styling pass is necessary for this refactor.

### 9. Conditional small optimizations

For Q-09, preserve synthetic payload hashes, property order, receipt exclusion
and manifest identity before considering a backend-only primitive. Keep domain
wrappers and browser crypto separate. Do not change digest recipes or public
schemas for tidiness. If the shared primitive adds more indirection than useful
reuse, document the retained disposition.

For Q-10, measure same-operation ffprobe executions with synthetic media first.
Reuse exact validated probe/timing metadata only within the owned scratch
operation. Preserve audio start offsets, raw duration precision, rotation,
selected-range checks, source fingerprint/generation and all output checks. The
existing decoded-audio, source inspection, preview and output tests remain the
acceptance basis. No cross-session cache or provider/cloud call is needed.

### 10. Settled verification and handoff

Run the repository's five root gates on the final proposed code, using the
documented isolated fake environment for tests:

```text
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
```

Run focused synthetic native-media harnesses only if a media implementation was
changed. Existing harnesses install hardcoded fake/paid-off flags before
imports. A production build must follow the owning guides and secret-free
release input rules; a local build does not certify target packaging.

Recheck import directions/cycles, duplicate schema/policy ownership, dead paths,
casts, stale flags/comments, content-free diagnostics, exact fake call counts,
all touched cleanup owners, artifact exclusions, `git diff --check` and final
status. Record the final source digest and changed files. Explain any reduction
in test count as retired obsolete coverage with retained current-path proof.

The code-quality pass completes only when concrete material findings are fixed
or have a reasoned retained disposition, all relevant regressions/final gates
pass, and limitations remain explicit. Green tests alone do not close owner
visual, paid, rights, cloud or deployment acceptance. Any material renderer
change needs a later separately approved matching image rollout; owner real flow
checks then target the exact affected path.

## Subsequent work already in the release plan

These are sequenced after code remediation; none runs as part of this proposal.

| Work                                        | Owning packet / remaining evidence                                                                                                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| STRIDE audit and fixes                      | CL-012: current assets/trust boundaries/data flows; spoofing, tampering, repudiation, disclosure, denial of service and privilege escalation; evidence-backed fixes and re-audit |
| Supply chain / rights / privacy / spend     | CL-012/014/015: current dependency/container vulnerabilities and licenses, allowed public assets/provider terms, retention/expiry proof and enforceable spend safeguards         |
| Hosted transport and deployable images      | CL-015: production routing/private caller auth, server-only configuration, frontend/backend packaging, self-contained Linux artifact and approved input digests                  |
| Preserve accepted motion in public delivery | CL-013/015: reviewed rights-cleared film assets, playback/fallback/performance and strict artifact acceptance; private authoring captures stay outside release inputs            |
| Explicit replay cleanup                     | CL-007/015: remove local CTA/transport/cache loading and the authorized temporary saved replay copy at the release checkpoint; preserve original capture and retained master     |
| Remaining quality / SEO                     | CL-013/015: focused/full outstanding device/accessibility/performance and production metadata/canonical/robots/social verification                                               |
| Deployment and operations                   | CL-015: explicit external approval, immutable deployment, health/auth/upload/stream/expiry/restart behavior, owner paid acceptance, costs/telemetry and rollback evidence        |

## Stop and rollback conditions

Stop the affected slice if call counts, consumed reservations, receipt/digest
bytes, cleanup fences, accepted manifest/render output, stage transitions or
visible behavior change without a reproduced defect authorizing it. Narrow or
discard that proposed change and preserve unrelated accepted work. Do not weaken
validation, deadlines, origin/auth policy or tests to finish the plan.

Keep slices small enough to review/revert independently. Git actions still need
explicit owner authorization. Do not use history resets or repository-wide
cleanup to revert a slice, and never include ignored configuration, private
captures, replay files or the retained owner master in a code rollback.
