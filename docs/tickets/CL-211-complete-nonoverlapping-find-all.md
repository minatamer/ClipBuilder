# CL-211 — Complete, non-overlapping local Find all moments

Status: Complete locally, 2026-11-04; one owner-started real timestamp
comparison recorded. Subjective listening and repeated-run consistency remain
unverified. Depends on implemented CL-209/210.

## Owner request and authority

Fix remaining Find all inconsistencies, shortened/split clips and overlapping
results while retaining Parakeet; execute / validate / fix until no actionable
findings remain. The completed owner-started CL-210 run returned twenty moments,
including overlapping alternatives and split/shortened versions of earlier
passages. All originally omitted passages were represented, but that did not
establish stable complete boundaries or subjective quality.

This latest owner decision supersedes CL-210's retain-distinct-overlaps rule
only for new local Codex Find all analyses. Keep existing acknowledged analyses,
clips, saved projects and exports readable and unchanged. Numeric/manual-only,
Gemini/hosted and Parakeet speech behavior remain unchanged. No new real
provider call, automatic retry, model/configuration change, fallback, Git
mutation, deployment or cloud action is authorized for agent checks.

## Implementation scope

- Retain the finite two-minute regional review plan, bounded context/ASR reuse,
  compact canonical reference mapping and explicit missing-only retry.
- Derive stable complete speech boundaries from canonical source words using
  punctuation and meaningful pauses, with bounded fallback for long or
  unpunctuated speech. Expose those boundaries to Find all selection and expand
  arbitrary mid-sentence proposals when a complete admissible span exists.
  Preserve original word IDs/clocks and the requested window/duration/manual
  exclusions. Do not shorten a usable proposal just to snap a boundary.
- Reconcile competing alternatives deterministically into a chronological,
  non-overlapping set. Prefer a complete wider passage over nested fragments;
  combine overlapping or adjacent fragments only within the requested duration
  and when speech continuity supports it. Avoid chain-merging separate thoughts,
  crossing manual reservations or creating overlong clips. Resolve incompatible
  overlaps deterministically; do not silently truncate a thought to fit another.
- Keep evidence, cues and processing identities consistent with changed cuts.
  Use bounded source words already held by regional work, not a whole-source
  transcript or another inference pass. Resume/cancel/checkpoints must reproduce
  the same reconciled result from acknowledged units, independent of proposal
  ordering. Version changed selection semantics separately from speech receipts.
- Do not force the historical eleven cuts, a clip quota or a result count.
  Timing heuristics cannot prove semantic identity, complete real recall or
  deterministic future model output; document that limit honestly.

## Acceptance and checks

1. Record confirmed structural causes and scope in the source of truth and local
   provider guide. Keep actual owner text, source hashes, exact cuts and paths
   out of Git and fixtures. Existing CL-209/210 unstaged work must be preserved.
2. Generated fixtures cover mid-sentence starts/ends, question/answer
   continuity, long/no punctuation, pauses, standalone adjacent ideas,
   overlapping/nested/ transitive alternatives, duration/window/manual bounds
   and canonical cues. Equivalent generated proposals with jitter/order changes
   produce stable complete, non-overlapping cuts where the same boundaries are
   available.
3. Integration verifies the actual local Codex Find all path, multiple review
   contexts and ASR seams, exact calls, successful-region cache reuse, explicit
   missing-only retry/cancel and unchanged numeric/Gemini/hosted isolation.
4. Run focused fake/paid-off/no-key/network-blocked unit/static gates and the
   current-source generated native/API proof. Use the existing browser/native
   proof when changed contracts/editor integration makes it necessary.
5. A private offline comparison may apply the new deterministic policy to the
   completed owner run using its already retained speech/proposals, with zero
   provider dispatch. Report only aggregates in the ticket and distinguish
   offline normalization from a fresh real model run or listening acceptance.
6. Perform a separate settled read-only validation pass; fix confirmed findings
   and repeat until none remain. Restore the normal backend/worker through
   verified ownership/lifecycle, preserve the frontend and acknowledged owner
   workspace, and verify non-metered readiness without processing requests.

## Whole-file allocation

- New focused local Find all speech-boundary/reconciliation modules and tests.
- `apps/backend/local/analysis.ts`, `long-analysis.ts`, their focused tests:
  local-only integration, bounded context and deterministic result assembly.
- `apps/backend/local/analysis-chunks.ts`: optional internal selected-coverage
  anchors for consistent reconciliation on recovery; legacy receipts stay valid.
- `apps/backend/local/codex-selection-input.ts` and its tests, plus adapter
  tests only as needed: stable boundary advice, compact references and
  versioning.
- `test/local-find-all.proof.ts`: generated native/API integration and
  retention.
- Source of truth, local Codex architecture/backend guides, this ticket and the
  index: owning behavior and actual verification evidence.

## Verification boundary

Fake/no-key checks can establish deterministic normalization, resource bounds,
recovery and provider isolation. Real Parakeet is already installed and
API-free; its weights/runtime stay unchanged. Real selection still needs owner
Codex login, allowance and live gates; hosted Gemini still needs its own
keys/approvals. Agent checks do not initiate either. Subjective listening,
another owner-started real selection and broader repeatability remain
owner-only.

## Evidence

### Investigation and implementation

CL-210 intentionally retained distinct overlapping alternatives. Its model
selected words directly without a stable observed speech-boundary vocabulary;
neighboring contexts could select different parts of the same passage. The
completed owner run contains a bare answer without its nearby question and a
continuation offered separately. These are structural observations, not proof
that every differing cut is an error or that model intent is reconstructable.

Implemented local-only speech units, bounded outward completion and whole-cut
alternatives. A dependent opening may include one immediately preceding
utterance (at most a 750-ms gap, no known speaker change), with a separate
twenty-second nearby-question search bounded by 800-ms pauses. Expansion is
bounded by duration/window/manual reservations; long unpunctuated context edges
are not invented sentence boundaries. Keep the original admissible whole
proposal as an alternative; an already overlong proposal is not silently
truncated. Find all prompts receive compact speech-unit references and ask for
full question/answer, setup/payoff and coherent passages once.

Overlapping canonical speech can form an admissible wider alternative. Interval
scheduling chooses a chronological non-overlapping set, prioritizing coverage of
originally selected speech, then fewer clips and fuller context. It never trims
one candidate to fit another. Internal original-coverage anchors are saved with
successful regional receipts and copied/restored with them. Canonical evidence
endpoints, cue offsets and processing identities follow merged cuts. Speech
receipts and Parakeet compatibility are unchanged. Selection is independently
versioned `regional-complete-v2`; old completed owner results are not migrated.

### Execution findings and corrections

- Initial focused run: 41 passed / 10 failed, 9.09 s. New fixture word IDs did
  not use the existing six-digit/stable identifier schema; corrected the fake
  IDs. One fixture expected the smaller of two admissible outward expansions;
  its maximum is now explicit. CL-210 overlap/context expectations were updated
  to this owner's superseding rule and the bounded longer lookback. The next
  four-file pass had 51 tests, 12.77 s.
- ESLint identified two unnecessary escapes in punctuation character classes;
  corrected them. Static checks also caught no type issues.
- Offline execution review caught over-eager preceding context displacing three
  previously retained passages. Retaining original whole alternatives and
  prioritizing original selected-coverage anchors fixes that regression; added
  context no longer wins simply because it is longer. A generated regression
  covers incompatible expanded alternatives and proposal-order independence.
- Completion is limited to one dependent predecessor rather than a chain. It
  stops at pauses/known unrelated speakers and does not reinterpret a long,
  punctuation-free regional edge as a new complete sentence.
- Merge construction preserves the existing meaning of an omitted
  `speakersPrepared` flag; it does not create unnecessary speaker inference.

### Produced verification

- Final focused unit command:
  `corepack pnpm exec vitest run --config scripts/local-test.config.ts apps/backend/local/find-all-passages.test.ts apps/backend/local/long-analysis.test.ts apps/backend/local/codex-selection-input.test.ts apps/backend/local/codex-ai.test.ts apps/backend/local/analysis.test.ts apps/backend/local/provider-ai.test.ts apps/backend/local/server-capacity.test.ts apps/backend/local/session-recovery.test.ts apps/backend/local/server-recovery.test.ts apps/backend/local/workspace-drafts.test.ts`.
  **178 tests / ten files passed, 14.90 s.** Includes sentence completion,
  jitter, question/continuation joins, long/no punctuation, reservations,
  transitive/incompatible overlaps, preserved whole proposals, stable cues/
  identities, copied anchor recovery, empty regions, ASR reuse, explicit missing
  retry/cancel, two-hour bounded serial work and numeric/Gemini/hosted
  isolation. The earlier expanded seven-file pass had 162 tests, 21.54 s.
- `corepack pnpm exec vitest run --config scripts/local-proof.config.ts test/local-find-all.proof.ts`:
  **one generated native/API proof passed, 28.74 s** on settled implementation,
  after an earlier 18.51-s pass before coverage-anchor refinement. Real
  generated media/FFmpeg/native input work, nine injected Parakeet parts, four
  injected Codex reviews returning shifted/nested/overlapping proposals, eight
  complete non-overlapping results and zero new ASR/inference on repeated
  requests.
- `tsc --noEmit` with `packages/contracts/tsconfig.local.json`,
  `tsconfig.local.json`, `tsconfig.tests.json` and `apps/backend/tsconfig.json`:
  passed. Focused ESLint on all nine CL-211 TypeScript files, Prettier and
  `git diff --check`: passed.
- Browser/editor/contracts/composition code is unchanged. The generated native
  API proof covers the changed boundary; no new visual acceptance is claimed.
  CL-210's earlier browser/export/recovery proof remains historical evidence.

### Private offline comparison

Applied the current pure policy to the already retained four regional proposal
receipts and their speech words, using the new bounded regional contexts. This
is not a fresh real model run or an application replay/import path. The
standalone diagnostic installs the shared fake/paid-off environment before
application imports and blocks all sockets/fetch. It writes details only in
owner-local temporary storage and never modifies the actual owner
workspace/results.

The twenty retained proposals normalize to thirteen non-overlapping moments:
three original overlapping pairs become zero. All eleven historical passages
have a single-clip match covering at least 94.5% of their old time interval; the
five formerly omitted passages, including the split passage, each have a
single-clip match. This fixes the observed shortened/split/overlap patterns in
offline normalization without forcing those eleven cuts or a result count. Zero
ASR/provider dispatches. No transcript, source fingerprint, exact owner cut or
private path enters this packet or a test fixture.

The settled offline boundary/reconciliation evaluation took 19.30 ms on this
sample, excluding model work. This single diagnostic timing does not measure a
fresh end-to-end run, model latency or subscription usage.

Fresh real model output, repeated-run semantic consistency and subjective
listening remain owner-only and unverified. The unchanged saved twenty-result
analysis remains available; the new policy applies only to a new explicit Find
all request. No staged/committed files, provider fallback, configuration change,
cloud action or deployment.

### Final read-only validation and local handoff

Read-only validation CL-211-V1 reviewed the settled worktree against this whole
packet, the new source-of-truth section, CL-211 source deltas against the
private starting snapshot, receipt/canonical-clock contracts and focused
verification. Existing CL-209/210 changes are excluded from this ticket's
verdict. The index is empty; no implementation commit or staged change is part
of the review.

Verdict: **Meets ticket; no actionable findings.**

- Covered: local-only complete-boundary advice/expansion, duration/window/manual
  limits, bounded context and preservation of whole original alternatives.
- Covered: selected-coverage-first reconciliation, non-overlapping chronological
  cuts, nested/continuation repair, cue/evidence/identity consistency and stable
  outcomes for equivalent proposal ordering.
- Covered: persisted/copied anchors, ASR compatibility, bounded serial work,
  explicit missing-only retry/cancel and numeric/Gemini/hosted isolation.
- Covered: generated native/API proof, focused unit/static gates, owning docs,
  privacy and zero-inference offline comparison. No UI/contracts/composition
  changes; no new visual acceptance claim.
- Covered: verified idle backend shutdown, owned tree/listener cleanup, normal
  hidden startup, current-source native worker rebuild and non-metered health,
  `/start` and `/api/sample/config` responses all 200. Exposed capabilities show
  Codex ready, local-speech captions, planning available and cloud false.
- Covered: exact restored analysis ID, all twenty suggestions, inputs and clips
  match the pre-edit private snapshot; the source and compatible ASR receipt are
  preserved. No processing dispatch occurred during handoff. The existing
  frontend remains running. Runtime identities/log paths are recorded privately
  outside Git.
- Unverified, owner-only: a new real selection under this policy, repeated model
  recall/boundary consistency and subjective listening. Offline interval
  coverage does not prove these outcomes.

Deviations: none. `analysis.ts` and browser/native editor proof were allocated
only if needed; they required no CL-211 changes. ASR code/tools/configuration,
transport/model/reasoning and provider split are unchanged. Nothing staged,
committed, pushed or deployed. The app remains ready for owner acceptance.

### Owner-started real run after CL-211, 2026-11-04

The owner explicitly started another Find all and requested error/usage/timing
monitoring and comparison of shortened/split passages and overlaps. Agent
actions were read-only progress/result/diagnostic/usage requests; no inference
or retry was initiated by the agent. The source, requested approximately
eight-minute window and substantive selection settings match the previous
twenty-result run. Only the UI bookkeeping policy revision differs; it is not
selection prompt content. This fresh workspace had no acknowledged speech
receipt, so Parakeet ran again. The ASR implementation/settings were unchanged.

- Whole run: **354,975 ms (5m55s)** versus 421,697 ms (7m02s), **66,722 ms
  faster (15.8%)**. Native Parakeet: **156,894 ms (2m37s)** versus 184,087 ms.
  Four serial Codex reviews: 39,193 / 44,123 / 61,924 / 38,549 ms, totaling
  **183,789 ms (3m04s)** versus 223,408 ms. These are single-run observations,
  not a claim that unchanged ASR code became intrinsically faster.
- **Eleven final suggestions; zero overlapping pairs**, versus twenty
  suggestions and three overlapping pairs before. Four completed review units,
  one ASR dispatch and four selection dispatches. Sixteen raw proposals (4 / 5 /
  5 / 2) were accepted by decoding/normalization with zero drops or adjustments;
  local completion/reconciliation yields the final eleven.
- Both previously shortened passages now have a single-clip match covering
  **98.4% / 99.7%** of their historical intervals. The previously split late
  passage is now one clip with **99.3%** interval coverage. All eleven
  historical passages have a single-clip match with **98.1–100%** coverage,
  including the five formerly omitted ones. Some old passages are combined into
  longer new clips; the eleven new suggestions are not an identical one-to-one
  recreation of the original eleven cuts. Timestamp coverage does not establish
  semantic equivalence or listening acceptance.
- No processing/CLI failures, canceled operations or automatic application
  retries. Four nonblocking `cli_configuration` warnings for `code_mode_host`,
  one per successful Codex review, matching the previous known warning.
- Codex weekly usage reads **31% used before selection and 31% afterward**; the
  credit balance is unchanged. Rounded account-wide readings cannot expose exact
  per-run tokens/allowance and do not establish zero subscription usage.

Detailed timestamp matching and run diagnostics remain in owner-local private
temporary storage outside Git. This adds one fresh real owner-run timestamp
check to the synthetic/native and offline evidence. Broader repeatability and
subjective listening remain unverified. No source/configuration change, provider
fallback, staging/commit, cloud action or deployment occurred during monitoring;
the normal app remains running.
