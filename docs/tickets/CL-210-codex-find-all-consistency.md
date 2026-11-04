# CL-210 — Consistent regional Find all with Parakeet

Status: Complete locally, 2026-11-04; one owner-run timestamp comparison
recorded. Subjective quality and broader repeatability acceptance remain
unverified. Depends on implemented CL-189/190/196/209. CL-209's unstaged
implementation remains present and must be preserved.

## Owner request and evidence

Investigate five moments omitted from a fresh local Codex Find all run after the
Parakeet change, improve consistency while retaining Parakeet, and execute /
validate / fix until no actionable findings remain. The owner-provided timestamp
exports bind to the same source and clock: eleven older versus six newer cuts.
All six newer moments match older passages within 267 ms at their endpoints.
Five omitted passages total about 108 seconds. Their speech exists in both
retained transcripts; two have identical normalized word sequences. Both runs'
normalization accepted all returned candidates (11/11 and 6/6, zero drops). The
newer request was Find all, 10–60 seconds, no manual exclusions, complete
coverage of the same approximately eight-minute analysis window.

These facts locate the count difference at Codex generation, not application
filtering or whole missing ASR regions. They do not reveal the model's internal
reason or isolate transcript sensitivity from run-to-run selection variation. Do
not claim the five passages have been recovered without real owner evidence.
Real media, transcript text, source fingerprints, exact owner cuts, private
paths and provider output stay outside Git/fixtures/normal logs.

## Scope and decisions

- Keep CL-209 native Parakeet, its CPU/thread/chunk policy, timestamps and saved
  results. Keep the local Codex / hosted Gemini split and English-only demo
  scope.
- Find all currently asks one global shortlist per eight-minute speech core.
  Decouple discovery from ASR: source-aligned two-minute review cores, bounded
  preceding context and enough following context for a maximum-length moment. A
  run has a fixed finite serial plan before inference; an eight-minute window
  has four planned reviews, not repeated attempts until a quota is filled.
- Reuse existing eight-minute acknowledged Parakeet speech receipts with their
  unchanged compatibility. Bounded buffering must not re-transcribe overlapping
  review regions or accumulate a whole long source in memory.
- Make each local Find all prompt request chronological, independent review of
  its core, with neighboring context and no target count. Use compact
  per-request word references with a reversible map to canonical transcript
  identities; preserve original source clocks, words, evidence and title/hook
  grounding.
- Retain every unique usable returned passage; reconcile identical source cuts
  or canonical start/end word spans once, preserving distinct overlaps. Do not
  add an overlap/quality rejection, a six/eleven-clip target, automatic provider
  retry, model/reasoning switch, fallback or a keep-asking loop. Empty regions
  are valid results.
- Version selection receipts for changed review semantics and input encoding;
  preserve completed analyses/drafts/clips/exports and compatible ASR receipts.
  Partial failure/cancel retains completed regions. Explicit retry resumes only
  missing units; restore/polling dispatch no AI.
- Numeric/default-count, manual-only, local Gemini and hosted behavior remain
  unchanged. Existing progress reports completed/planned review regions.

## Acceptance and verification

1. Record the confirmed investigation and unknown causal/quality questions using
   aggregates only. Assess input representation and selection/normalization/
   reconciliation boundaries; no owner transcript becomes a test fixture.
2. Implement the finite regional plan in the actual local Codex Find all path,
   including short sources/subsecond remainders/nonzero windows and source
   bounds. Preserve seam-spanning ideas, canonical word IDs and manual
   exclusions.
3. A generated synthetic regression demonstrates whole-window shortlist omission
   and regional exposure/retention of early, middle and late opportunities, even
   when word clocks/punctuation vary. This proves orchestration, not live AI
   recall.
4. Fake/paid-off/no-key/network-blocked tests assert exact ASR/selection counts,
   input/reference mapping, invalid references, duplicate cuts, silent regions,
   serial bounded work, partial/canceled explicit retry and receipt recovery.
   Cover preserved numeric/manual/Gemini/hosted behavior and provider isolation.
5. Run focused unit/static checks and the applicable current-source
   native/browser proof. Preserve the owner app's acknowledged
   workspace/source/analysis; verify idle and process ownership before worker
   refresh, then verify readiness with no processing dispatch. No real provider
   call is authorized by these agent checks. New real quality/consistency and
   allowance measurements are owner-only.
6. Perform separate read-only validate passes on the CL-210 delta until no
   actionable findings remain. Record actual checks, limits and remaining owner
   acceptance. No staging, commit, push, cloud or deployment.

## Whole-file allocation

- `apps/backend/local/long-analysis.ts` and tests: separate finite review plan,
  bounded speech reuse/buffering, context, checkpoints and selection receipt
  keys.
- `apps/backend/local/analysis.ts`: narrowly scoped internal review metadata if
  required; no browser/provider-global schema or numeric behavior expansion.
- `apps/backend/local/codex-ai.ts`, its tests and a dedicated selection-input
  module only when implemented: compact reversible references and regional
  prompt.
- `apps/backend/local/server.ts`: local Find all routing only if required.
- `test/local-find-all.proof.ts` plus the existing native/browser proof: real
  composition with generated media and injected inference, exact calls and
  unchanged editing/export/recovery behavior.
- Source of truth, provider/backend guide, this packet and ticket index: actual
  behavior, finite call/allowance tradeoff, evidence and unchecked acceptance.
- CL-209 files outside this allocation are preserved and excluded from CL-210's
  change/validation claim; no unrelated cleanup or source/configuration changes.

## Evidence and validation

Fake mode verifies orchestration without API keys; it cannot establish model
completeness or editorial quality. Real native Parakeet is API-free and already
prepared. Codex selection requires owner CLI login/allowance and normal live
gates; hosted Gemini still needs its own keys/approvals. No new real selection,
ASR, download or provider retry is needed for agent checks here.

### Investigation and implementation evidence

The two retained transcript windows have 1,725 / 1,727 words within the
requested core; all five omitted passages remain represented. Two omitted
passages have identical normalized word sequences. Original selection
diagnostics returned / accepted 11/11; newer returned/accepted 6/6 with zero
drops. No filtering/count ceiling explains the change. The former review input
exposed the whole eight-minute transcript to one global selection request; the
exact model choice cannot be reconstructed from these artifacts. No new real
inference was made.

The new plan uses two-minute source-aligned cores, fifteen-second lookback and
up to the requested maximum duration of lookahead. It reuses eight-minute speech
receipts without changing Parakeet or its ASR compatibility. New regional
selection keys bind core/context/policy. Compact aliases exist only inside a
request; output normalization restores canonical start/end/evidence IDs and
extractive title/hook text before returning to the domain.

Offline payload inspection of the retained transcript (no provider invocation):
old word JSON 257,829 bytes; four new regional word JSON payloads 38,212 /
46,799 / 48,670 / 32,021 bytes, 165,702 total. Each carries 602 / 726 / 757 /
496 words including context. These measurements omit repeated prompts/schema and
do not measure model tokens, allowance, latency or real clip recall.

Focused generated-transcript/reference tests initially passed 33 tests in 9.69
s. Expanded coverage passed 149 tests across six files in 20.57 s, including
scripted whole-window shortlist versus regional retention, jittered clocks /
punctuation, seam-crossing opportunities, duplicates, silent regions, serial
long-source work, nonzero windows, manual exclusions, partial failure/cancel /
explicit retry, compatible speech reuse and unchanged numeric/Gemini/hosted
behavior. Synthetic eleven-opportunity recovery is not evidence that the owner's
five real missing passages have been recovered.

### Gate failures and corrections

- Initial native/API proof used a generated 2-fps sample below the existing
  12-fps source minimum and returned 400 (11.513 s). The fixture now uses 12
  fps; no production admission rule was weakened. Its new host needed the
  required `port: 0` field for static checking. Supported-cadence proof passed
  in 17.80 s.
- The browser proof advanced after reconnect before the editor's Media tab had
  rebound, causing an undefined-click failure (91.048 s). It now waits for
  actual editor readiness; the standalone rerun passed in 85.18 s. Existing
  assertions remain. The initial two-proof command took 118.30 s with both
  failures recorded.
- ESLint identified a direct guard throw inside the new proof's finally block.
  Cleanup moved into a guarded helper; nested cleanup still attempts host,
  worker and owned scratch removal, including setup failure paths.
- Execution review found that context-only speech could trigger an unnecessary
  review of a silent core. Eligibility now checks for a word starting in the
  core before dispatch and still acknowledges the empty unit. Metadata is passed
  explicitly through the analysis port, with no mutable active-review variable.
  The expanded 150-test regression pass took 14.38 s.
- Identical canonical passages can have different physical minimum-duration
  padding in adjacent contexts. Regional reconciliation now deduplicates the
  exact canonical reference pair as well as exact cuts, while preserving
  genuinely different overlapping ranges. Its first synthetic assertion used the
  fixture's 30-second maximum where a 60-second lookahead was intended (150
  passed / 1 failed, 12.54 s); the fixture now states that policy explicitly.
- Final generated-media regional proof passed in 18.04 s: one ASR job, nine
  injected Parakeet native parts, four injected Codex reviews, eight generated
  candidates, and zero new ASR/inference on repeated acknowledged requests/GETs.
  No real model or provider inference was used.

### Final checks and read-only validation

The settled CL-210 source passed these focused gates:

- `corepack pnpm exec vitest run --config scripts/local-test.config.ts apps/backend/local/long-analysis.test.ts apps/backend/local/analysis.test.ts apps/backend/local/codex-ai.test.ts apps/backend/local/codex-selection-input.test.ts apps/backend/local/provider-ai.test.ts apps/backend/local/server-capacity.test.ts`:
  151 tests / six files, 13.46 s. This is the final pass after the silent-core
  eligibility and canonical-span reconciliation fixes.
- `corepack pnpm exec vitest run --config scripts/local-proof.config.ts test/local-find-all.proof.ts`:
  one generated-media native/API proof, 18.04 s, including acknowledged repeat
  requests with zero additional inference or ASR.
- `corepack pnpm exec vitest run --config scripts/local-proof.config.ts test/local-codex.proof.ts`:
  one current-source browser/native editing, export and recovery proof, 85.18 s.
  Its numeric selection path is unaffected by the later regional-only fixes.
- `tsc --noEmit` with `packages/contracts/tsconfig.local.json`,
  `tsconfig.local.json`, `tsconfig.tests.json` and `apps/backend/tsconfig.json`:
  passed. Focused ESLint on the nine changed TypeScript files passed. Focused
  Prettier and `git diff --check` passed.
- `corepack pnpm exec vitest run test/app-image.test.ts`: two packaging tests,
  1.30 s; local weights, ignored configuration and private assets remain
  excluded.

Read-only validation pass CL-210-V1 reviewed the settled local worktree against
this packet, the source of truth, the actual server routing and its neighboring
provider/receipt contracts. Existing CL-209 changes were excluded from this
ticket's verdict. No staged changes or implementation commits are part of this
review. Verdict: **Meets ticket; no actionable findings.**

Coverage:

- Covered: same-source investigation distinguishes generation from application
  drops and preserves uncertainty about the model's internal choice.
- Covered: finite regional scheduling, bounded neighboring ASR buffers,
  canonical reference restoration, manual exclusions, silent/seam/offset/tail
  handling and unique overlapping results.
- Covered: successful-region receipts, explicit missing-only retry,
  cancellation, compatible speech reuse and zero-dispatch restore/repeated
  requests.
- Covered: numeric/manual/Gemini/hosted isolation, generated native integration,
  browser editing/export/recovery and narrow owning documentation updates.
- Unverified, owner-only: real recovery of the five omitted passages, repeated
  model consistency, subjective quality, new Codex allowance and elapsed time.
  Scripted recall and JSON byte counts do not establish these outcomes.

### Normal local handoff

The idle backend was stopped with its verified supervisor/descendants; ports
4000/4200 were free before replacement and the healthy frontend was preserved.
Normal backend startup rebuilt the internal native worker from current source
without changing configuration or forcing test flags. Verified health, `/start`
and `/api/sample/config` returned 200; exposed capabilities report Codex ready,
local-speech captions and planning available, with cloud false.

Recovery preserved the acknowledged source fingerprint, analysis ID, all six
suggestions, exact inputs and zero prepared clips. One compatible speech receipt
and its existing selection receipt are present in the restored workspace.
Restore used GETs only: no new ASR, Codex/Gemini inference or processing
request. Content-free process identities and absolute log paths remain in the
external runtime record; no owner media, transcript or private path is committed
here.

No staging, commit, push, provider fallback, paid/cloud action or deployment.
The normal app remains running for owner acceptance. A completed old analysis
remains readable; this change does not automatically replace its six results.

### Owner-started real run, 2026-11-04

The owner explicitly started another Find all and requested monitoring, usage,
timing and comparison with the five previously omitted passages. The agent made
read-only progress/result/usage requests; it did not initiate or retry
inference. The source fingerprint and requested approximately eight-minute
window match the two supplied exports. This was a fresh workspace with no
acknowledged speech receipt, so native Parakeet ran again rather than reusing
the prior workspace.

- Whole analysis: 421,697 ms (7m02s), versus 302,589 ms for the earlier
  six-result Parakeet run and 621,674 ms for the eleven-result Whisper run.
  Regional review adds 119,108 ms versus the earlier Parakeet run; it remains
  199,977 ms faster than the earlier Whisper run. These are single-run timings.
- Parakeet: 184,087 ms, versus 183,611 ms before. Four serial Codex reviews:
  65,579 / 67,249 / 50,659 / 39,921 ms, totaling 223,408 ms. Native input
  preparation including inspect/audio/ASR took 196,914 ms.
- Twenty suggestions from four completed regions. Returned/accepted counts are
  5/5, 5/5, 7/7 and 3/3, with zero normalization drops or adjustments. One ASR
  dispatch and four selection dispatches; no processing/CLI failure or retry.
- Four nonblocking `cli_configuration` warnings identify `code_mode_host`, one
  per successful selection call. No configuration was read or changed.
- Codex weekly allowance reads 30% used before selection and 30% afterward; the
  credit balance is unchanged. This rounded account-wide observation is not
  proof of zero subscription usage and does not expose exact per-run tokens.
- Timestamp comparison represents all five previously missing passages again:
  four have close single-clip matches (roughly 94.5–99.3% of each former time
  interval). The fifth is split across two clips with 98.8% combined interval
  coverage and a 200-ms internal gap. Boundaries differ; one single match ends
  about 6.4 seconds later. This establishes timestamp coverage, not listening or
  word-for-word quality acceptance.
- The twenty-result set contains overlapping alternatives and is not identical
  to the eleven old cuts. One previously retained early passage has only 60.9%
  interval coverage, and another is split with about a 6.8-second internal gap
  (83.1% combined coverage). More suggestions do not establish perfect boundary
  consistency. Repeated real runs and subjective review remain unverified.

Detailed source-bound cuts and matching calculations remain in a private
timestamp-only comparison outside Git. The aggregate measurements above add real
owner-run evidence to the earlier synthetic gates; no new test fixture, provider
fallback, configuration/source-code change, commit or deployment.
