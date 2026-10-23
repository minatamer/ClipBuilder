# CL-057 — Reserve manual clips before AI discovery

Status: implemented and validated. Dependency: completed CL-026 discovery/count path and
validated CL-054–056 worktree, which remains unstaged and preserved.

Owner request — 2026-10-23: AI recommendations must cover the rest of the video
without spending a suggestion on an already manually chosen passage. Authority:
source of truth, **Additional owner controls — 2026-10-22**, and this latest
explicit decision.

Acceptance and implementation:

- Keep all manual cuts authoritative, including overlapping/duplicate inputs.
  Reserve their canonical 30fps half-open intervals before AI discovery. AI cuts
  may touch their endpoints but must share zero frames with any manual cut.
- Pass structured exclusions alongside the complete transcript to the fixed
  local provider prompt; retain grounding/context and prompt validation. Fake
  discovery must use the same remaining windows. No public prompt/schema change.
- Fit minimum-duration padding inside one remaining contiguous window; reject
  evidence crossing a manual cut. Reject invalid/overlapping proposals before
  counting accepted AI suggestions. Fill the requested count from the bounded
  pool when possible; report the existing honest shortfall otherwise.
- Preserve one transcription and at most one selection call, with no retry or
  invented content. Skip selection when no remaining window fits the minimum.
  Manual-only operation and the combined manual-first selection list stay intact.
- Verify overlap/containment, adjacent endpoints, padding, fragmented remaining
  space, noncompliant provider results, counts, cancellation and exact calls with
  synthetic tests. Extend existing injected-provider and native fake flow proof.
  Run affected local unit suite, types, lint, format and fake native/browser proof,
  then a read-only validate pass. Update the narrow owning docs/evidence.

Fake AI needs no API keys and can verify this reconciliation with actual native
media processing; its words/suggestions remain fictional. Real AI requires keys,
enabled live flags and applicable approvals; live quality stays owner-only and
unverified. No real YouTube/provider/cloud call, ignored env read, new service,
dependency, Git action or paid test is authorized by this ticket.

Settled evidence — 2026-10-24:

- `analysis.ts` reserves deduplicated manual cuts before selection. The new
  `selection-windows.ts` computes their complement, merging overlap regardless
  of input order without changing manual cuts/range links. Minimum-duration
  fitting stays within one free window; crossing/contained/one-frame-overlapping
  evidence is rejected. Endpoint adjacency is valid. Only accepted proposals
  count, and a fragmented source with no minimum-sized gap skips selection.
- `provider-ai.ts` validates the bounded exclusion list using the existing cut
  schema and sends `{ manualExclusions: { fps, cuts } }` alongside all words.
  The fixed local policy explains reservations and padding; caller-supplied
  instructions still must exactly match the server-derived policy. No public
  prompt/contracts change. Fake selection now proposes inside the same free
  windows. Domain reconciliation independently rejects a noncompliant adapter,
  and adapter mutation cannot reopen authoritative reserved time.
- Regression tests cover requested counts 1/5/10; actual fake proposals and final
  suggestions both exclude manual cuts. Additional checks cover partial overlap,
  containment, bridging, one-frame overlap, adjacent endpoints, shifted padding,
  duplicates, unsorted overlapping inputs, shortfalls, cancellation and exact
  call counts. Existing injected-provider compatibility fixtures now supply a
  genuinely separate third passage instead of an AI/manual overlap. The short
  12-second host fixture correctly makes zero selection calls when only 9.8
  continuous seconds remain. Manual-first frontend selection was inspected and
  needs no change.
- Existing pinned/guarded runner, with fake AI/paid-off and secret reads blocked:
  focused analysis/provider/compatibility **67 tests pass**; entire
  `exec vitest run --silent --config scripts/local-test.config.ts` **45 files /
  472 tests pass**. After strengthening fake proposal/unsorted-range assertions,
  the affected analysis suite passes again (**35 tests**). Local/test TypeScript,
  scoped ESLint and changed-file Prettier pass; `git diff --check` is clean.
- `exec vitest run --silent --config scripts/local-proof.config.ts
  test/owner-batch.proof.ts`: **pass, 104.01s**, including generated media,
  combined manual/AI clips, readiness/tab/geometry browser checks, native editing,
  download/full decode and restore. A 61-second source with reserved manual
  ranges cannot fit a 60-second additional clip: it now returns no suggestions
  and zero selection calls. Five independent 10-second suggestions still fit.
  Final exact synthetic counts: **5 transcription / 3 selection / 5 plan /
  5 image**, native peak **1**, survivors **0**, completed cleanup. The previous
  four-selection expectation is reduced by the correctly skipped impossible run.
- Proof adjustments: the newly excluded initial passage changes the AI clip's
  background from blue to green. Its old picture probe had almost matching luma;
  moving it to the same photograph's dark corner preserves the contrast and
  disappearance assertions without lowering thresholds. A subsequent run timed
  out after writing the fresh export; the export independently decoded in full.
  A content-free traced rerun completed successfully above. No reproducible
  application fault was identified; this is not evidence of timing reliability.
  Temporary tracing was removed. The failed run's exact generated scratch was
  verified unused and removed; unrelated scratch/masters/logs were preserved.
- Normal backend hot reload picked up the source change. Content-free health
  GET is **200**, capabilities remain **synthetic-ai / cloud false**, frontend
  PID **8544** unchanged, current backend **27712**, internal worker **34360**.
  No explicit restart, environment edit, real media processing or other app
  interference. No new dependency, listener, timer or persistent state format.

Read-only validate on the settled CL-057 addition: **Meets ticket; no actionable
findings**. Covered: pre-discovery structured exclusions/full context, canonical
frame enforcement including padding, additional-count reconciliation, honest
shortfall/call bounds, fake/provider parity, combined list and synthetic native
integration. Reviewed the source, regression assertions and changed acceptance
against the original plan; no requirements weakened. The unrelated completed
CL-054–056 UI work remains preserved and excluded from this implementation claim.

Changed: backend local analysis, selection-window helper, fake/provider adapter
and policy, three analysis/provider test files, host/native proof, local README,
source of truth and ticket/index. Physical/owner-media acceptance and live AI
quality remain unverified; real AI still requires keys, live flags and applicable
approvals, with manual paid testing by the owner. Fake content is fictional;
native processing is real and API-free. Deviations: only the proof probe and
existing fixture expectations described above. All additions remain unstaged
and uncommitted; no push, cloud/provider or real YouTube calls.
