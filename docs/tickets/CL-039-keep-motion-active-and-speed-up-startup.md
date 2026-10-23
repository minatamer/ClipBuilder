# CL-039 — Keep motion active and shorten local startup

Status: implemented and verified. Dependency: implemented CL-038.

Owner requests 2026-10-23: loading spinners must continuously spin; remove
reduced-motion overrides everywhere in the application and never reintroduce
them. Document the decision. Diagnose the roughly three-second connection wait
and improve unnecessary serial work while preserving complete readiness.

Remove application CSS/JavaScript branches that suppress motion according to
the OS/browser motion preference, including the local spinner/field transition
and preview carousel. Preserve actual inactive/completed-state behavior. Record
the permanent owner decision in the source of truth and repository instructions;
leave OS/browser settings alone. No accessibility-compliance claim is implied.

Measure read-only local initialization. Fetch capability and workspace state
concurrently, publish neither until both validate, abort pending work on failure
or unmount, and preserve the mounted disabled form and existing connection error.
Retain fresh process ownership verification and its existing in-flight sharing;
do not cache settled identities or bypass service checks.

Extend the synthetic intake browser proof to demonstrate concurrent requests,
full readiness, failure cleanup and actual advancing spinner animation under
both motion preferences. Preserve desktop/phone geometry and existing acquisition
checks. Run focused unit/proof/types/lint/format and final read-only validate.
No full root suite, real media/provider/YouTube call or build is required.

Fake AI remains key-free; local media processing remains real. Real AI requires
normal provider keys/live flags and owner approvals. No local AI model is added.
Keep the app and unrelated app running, saved media intact and Git unchanged.

## Initial diagnosis

The local stylesheet disables the spinner under `prefers-reduced-motion` and
the preview carousel independently substitutes instant scrolling. Startup awaits
capabilities and workspace sequentially. Both proxy reads independently verify
the local runtime through a Windows PowerShell/CIM process query; the existing
discovery adapter shares overlapping probes without retaining settled snapshots.

Read-only normal-app measurements before editing: sequential initialization took
1,682 / 1,319 ms; concurrent requests took 738 / 683 ms. Each response was 200;
capabilities reported synthetic AI and workspace was empty. These are warm
local HTTP measurements, not full page-load or YouTube/AI timings.

## Implementation and verification

Removed both remaining preference-based branches from application source: the
local spinner/field reduced-motion CSS block and preview-carousel instant-scroll
fallback. Normal carousel selection is always smooth; layout measurement still
positions slides instantly because that is resize/restoration behavior, not a
motion-preference override. Inactive/completed progress and hidden animation
states remain unchanged. Source-of-truth and repository instructions permanently
prohibit reintroducing app-level suppression; frontend/feature guides agree.

Startup now fetches and validates capabilities/workspace concurrently. It
publishes readiness only after both succeed and aborts the shared controller on
failure or unmount. No discovery/server/process policy changed: overlapping
requests share only the existing pending verification query, with no settled
identity cache or bypass.

Evidence actually produced:

- Synthetic intake browser proof passed in **26.98 seconds**. Both startup
  requests arrive before either response is released; the same input stays
  disabled through partial readiness. Pending/ready card/input/upload bounds
  remain identical at 1440×900, 390×844 and 320×568.
- Actual browser animation clocks advance through more than a complete rotation
  across four consecutive samples for startup and resolution spinners, with
  both `reduce` and `no-preference` emulated. Infinite iterations and running
  state are asserted; a static icon/computed animation name alone cannot pass.
- A failed initialization returns the existing disabled form/error and aborts
  the held sibling workspace request, with no premature source-status reads.
  Existing resolution/error/retry/download/cancel/offline checks still pass.
  Fixture browser/listener/scratch drain; zero owned process survivors.
- Focused runtime-capability/discovery unit tests: **12 passed**, including
  concurrent-probe sharing, fresh subsequent identity verification and failure
  recovery. Frontend/root-test types and focused ESLint passed.
- Existing preview candidate/fixed-review unit files: **19 passed**. Focused
  Prettier and `git diff --check` passed. No full suite/build was run.
- After editing, normal-app concurrent initialization took **815 / 820 / 776 ms**;
  `/start` returned 200 in 119 ms. A separate content-free process identity query
  took **747 ms**, explaining most of the measured remaining request time.
  Each response was 200 with `synthetic-ai` and cloud false. The ignored timing
  artifact contains only paths, status, durations and those mode indicators.
  These warm request timings do not measure an entire cold browser/dev startup.
- The normal in-app browser showed the complete disabled form with loading
  status, then the enabled URL field in place. Ready screenshot inspected under
  ignored `.local-build/evidence/cl039-intake-ready.png`; no real media/URL shown.
- Repository search found no remaining motion-preference API/CSS branches in
  application/package/script source. Test-only preference emulation remains to
  prove the owner policy. OS/browser preferences were not changed.

No real YouTube/provider/cloud request, environment-file read, configuration
change, Git mutation or deployment occurred. Normal services and saved media
remain intact. Physical-device/aesthetic accessibility acceptance and real AI
quality remain owner-only and unverified.

## Validate — final read-only pass

TL;DR:

- Goal: permanent normal app motion and shorter complete local initialization.
- Achieved: both remaining motion overrides removed; measured spinner rotation,
  concurrent startup, full readiness and failure cancellation verified.
- Unverified: cold full-browser timings, physical-device/accessibility acceptance
  and real AI quality. No real acquisition/AI was needed for this ticket.

**Verdict: Meets ticket. No actionable findings.** Reviewed the CL-039 portion
of the unstaged worktree, its complete new packet and test extensions; excluded
the preserved CL-028–CL-038 changes. The index remains empty, with no selected
commit range or Git mutation.

Coverage: **Covered** — app-wide override removal and permanent owning docs;
actual continuous rotation under both preferences; concurrent validated reads
without premature enablement; stable desktop/phone layout; pending-request abort
and existing failure state; fresh process verification without caching; unchanged
fake/cloud gates, real media retention and owned fixture cleanup.

Checks inspected: scoped diffs and neighboring lifecycle code, all source
motion-preference references, proof gates/counters, 31 focused unit results,
browser proof, both TypeScript checks, lint/format/diff and content-free timings.
No new abstraction, unsafe cast, dependency/schema/config change, debug path,
provider call or cleanup leak was introduced. The normal app remained reachable.
