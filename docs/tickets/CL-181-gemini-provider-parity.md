# CL-181 — Gemini parity and one-run local handoff

Owner instruction, 2026-10-31: fix the three CL-180 provider parity gaps,
validate in fake mode without paid calls, then switch local AI_PROVIDER to Gemini
for one owner-run test. Do not deploy. Baseline is `fe6dd74` plus the preserved,
unstaged five-file CL-180 Linux compatibility/proof/documentation work.

Status: implemented, fake-validated and switched to local Gemini. Owner real
Gemini acceptance remains open; nothing was deployed or committed.

## Scope and authorization

1. Gemini manual-only analysis uses the existing bounded continuous manual
   window, source-relative words and partial/full transcript cache rules. AI
   discovery still needs the full source; empty manual work dispatches nothing.
   Reuse the existing cut-audio proxy job with a transient private proxy ID;
   preserve binding, native/byte/time bounds, cleanup and hosted provider charging.
2. Share the tolerant visual-plan decoder for Codex, Gemini initial preparation
   and Find visuals. Preserve usable alternate briefs and bounded field/rule
   diagnostics, including legacy Gemini array envelopes. Keep usable results,
   advisory quality rules, search first, provider-specific fallback and no retry.
3. Share the tight-head/opening-speaker camera instructions while retaining
   Codex panel coordinates and Gemini video input. Strong visual-only opening
   evidence remains governed by the existing camera compiler; no inferred audio
   labels or sensitive identity, no extra provider call.
4. After settled fake checks and read-only validation, edit only AI_PROVIDER to
   `gemini` in backend `.env.local` through an exact-line, secret-free operation.
   Do not display/inspect other contents or change flags, keys or approvals.
   Refresh only the verified backend/native worker, preserve the frontend and
   completed owner session/art/audio, and verify non-metered capabilities/GETs.
   The owner performs the actual paid test; agents trigger no inference/search.

No provider spend, real media processing/search/download, configuration changes
beyond the named provider setting, cloud inspection/change, Git mutation, push
or deployment. Intentional Codex-only progress/local speech and Gemini raster
generation remain. Existing CL-180 artifacts predate this parity revision.

## File allocation

- Backend: `provider-ai.ts`, `analysis.ts`, `hosted-workflow.ts` and their focused
  tests; `gemini-critique.ts`; neutral `visual-plan.ts` / `visual-plan.test.ts`
  moved from the Codex-named decoder/test, updating its `codex-ai.ts` and
  `visual-discovery.ts` callers; shared `focus-planning-policy.ts`; Codex tests
  only where needed to prove both prompts retain the same camera behavior.
- Documentation: this ticket, ticket index, source of truth, and the current
  release-preparation handoff. Historical CL-180 findings retain their baseline
  meaning with a link to this follow-up. Generated proofs/logs stay ignored.
- Backend ignored `.env.local`: only exact AI_PROVIDER assignment, after checks.

## Acceptance and verification

- [x] Fake Gemini/manual analysis dispatches one bounded audio/transcription,
      offsets words once, reuses covered cache and expands to full source for AI.
      Empty/invalid/canceled work and cleanup preserve zero extra inference.
- [x] Hosted bounded transcription is charged and fails before dispatch if
      durable charging fails.
- [x] Shared decoder retains alternate briefs, repairs usable malformed fields,
      preserves legacy input and logs exact bounded reasons without source text.
- [x] Both actual outgoing planning requests include shared tight-head and
      evidence-backed opening policy; strong/weak opening results pass the
      existing camera compiler with no extra calls.
- [x] Focused fake/no-network tests, local types, scoped lint/format and relevant
      current-source browser/native proof pass; read-only validation is clean.
- [x] Only the authorized provider setting changes; normal Gemini capabilities
      and preserved idle session verified after a scoped backend/worker restart.

Fake tests require no keys and prove orchestration, not live Gemini search or
editorial quality. The one owner test requires the configured key, enabled live
flags and applicable approvals. No real test is claimed by this ticket.

## Evidence

### Implementation and fake verification

Gemini now supplies `transcribeCut`, using the existing fixed native cut-audio
job with a fresh private proxy ID and its ordinary remote-file/proxy cleanup.
Words move back to the source clock once. The shared analysis/cache logic reuses
covered windows and requests full audio for later AI discovery. Hosted wrapping
charges the bounded path before any provider dispatch, just like the full path.

Moved the Codex decoder/test to neutral `visual-plan.ts` / `visual-plan.test.ts`
and removed the old duplicate Gemini decoder. All three consumers use it;
legacy array envelopes and absent optional fields remain compatible. Gemini
initial search retains normalized same-subject alternatives and detailed safe
decode records. Both planners include one `FOCUS_PLANNING_POLICY`, with only
video versus panel coordinates kept adapter-specific. Neither change adds a
provider call, retries a provider or blocks a clip for missing optional art.

- **134 focused fake cases pass**, covering manual-only cut/duration/proxy binding,
  single offset, cache reuse/full-source expansion, empty/invalid/pre-canceled
  requests, canceled/mismatched proxy receipts before upstream dispatch, exact
  cleanup and call counts, hosted charging/failure, legacy/repair/alternate
  decoding, safe diagnostic fields and strong/weak visual opening evidence.
- **859 local cases pass** in the settled full suite. The initial concurrent
  native/build/full-suite run passed 858 and timed out in one existing autosave
  shutdown test. That recovery suite passes separately (six cases), and the
  unchanged full suite then passes without the concurrent heavy jobs. No test
  timeout/configuration or recovery/product behavior was weakened.
- **Three existing current-source browser/native proofs pass**: injected Codex
  preparation through controls, optional illustration, retry, captions, export,
  saved/recovery reload and injected Gemini search-hit on the restored clip
  (85.48s); actual full/fractional cut-audio/video encoding (3.13s); synthetic
  sixty-minute audio/five-minute proxy byte bounds and canceled-replacement
  cleanup (27.77s). Fresh overlays/scratch are compiled from current source.
  These are fake/injected inference results with real local media encoding.
- Local TypeScript, scoped ESLint with zero warnings, Prettier, whitespace and
  read-only architecture/privacy/cleanup review pass. No stale decoder imports,
  duplicate decoder/policy or changed cross-boundary schemas remain.

### Current Linux artifact

Closed, secret-free backend/worker image rebuilt locally in **38.82s**:
`sha256:22ef7b15ceb26e6ea032d06be1f10a7ba91d4794b3dfcd9e628fd9f0b7823da3`.
Actual offline entry probe passes (1.17s). The unchanged frontend retains its
CL-180 image and evidence. No registry submission or deployment occurred.

The packaged synthetic upload/editor/native export/cancel/retry/quota/expiry/
exit proof with the current backend passes in **48.53s**, including a
524,288,000-byte disk-selected upload, source hash binding, caption/picture/text/
filter edits and decoded H.264/AAC MP4s. Non-root, read-only, network none,
2 CPU, 8-GiB memory/no-swap and 5376-MiB scratch profile. Fake counts:
transcription 1, caption 1, selection 0, plan 1, generated images 0, inspect 1,
preview 1, final-native attempts 4 (one canceled); external attempts 0.
Peak sampled container RAM 2,502,627,328 bytes, logical scratch 1,052,364,726
bytes, highest reservation 3,074,499,193 bytes. No OOM events. The 32-MiB ENOSPC
probe preserves retained synthetic output. Four-second 160x90 generated source
and one-second 52x90 exports do not certify full-duration 4K or maximum retained
history; the large source byte count uses a valid MP4 free box.

### Provider switch and preservation

After settled verification/review, changed only the existing AI_PROVIDER values
to `gemini`. Initial exact-single-assignment guards made no write because the
file already contained two identical Codex assignments. A guarded update handles
both occurrences while preserving quoting/whitespace/comments and every other
byte. No other setting/key/flag was inspected, displayed or changed. No secret
backup/diff was made. The normal entry point loads owner configuration itself.

Verified the owner clip idle, captured the current supervisor/watcher/worker
tree and PID creation identities, then stopped that tree and checked survivors,
orphans and stable free 4000/4200 ports before restart. The normal command rebuilds
contracts/current worker; frontend PID **4968/3000** is preserved. New supervisor
**25080**, API **6204/4000**, worker **19400/4200** are verified owners. Health,
`/start` and `/api/sample/config` return 200. Normal capabilities are provider-ai
with planning/visual discovery/captions enabled and no Codex provider marker.
Together with the verified named setting and composition this selects Gemini;
upstream authentication/quality was not tested.

Recovered state remains one idle validated-revision clip, **14 assets, two
visuals and two audio cues**. No user clip was processed, reset or canceled.
Completed provider-ai sessions remain usable across the switch. The owner should
refresh and start a fresh run to exercise Gemini transcription and initial
planning; using Find visuals alone exercises only the visual action.

Safe evidence/log locations outside Git:

- `C:/Users/minat/AppData/Local/Temp/clipbuilder-cl181-linux-uSz9oG/`
- `C:/Users/minat/AppData/Local/Temp/clipbuilder-cl181-app-83c8b8f13ef545659ba3be18857a2c2a/backend.runtime.json`
- `C:/Users/minat/AppData/Local/Temp/clipbuilder-cl181-app-83c8b8f13ef545659ba3be18857a2c2a/backend.stdout.log`
- `C:/Users/minat/AppData/Local/Temp/clipbuilder-cl181-app-83c8b8f13ef545659ba3be18857a2c2a/backend.stderr.log`

### Validation and limits

Read-only validate verdict: **Meets ticket locally; no actionable findings.**
Covered the three connected adapter changes, shared callers and legacy input,
realistic cache/source/clock/cancel/receipt failures, one-request camera policy,
nonfatal art/quality semantics, explicit metered counts and hosted charging,
source/proxy cleanup, no extra provider retry, source-level dependency direction,
safe diagnostics, normal provider switch and recovery preservation. CL-180's
existing native compatibility/proof edits are preserved and excluded from the
parity implementation claim. Final proof-container cleanup is verified.

Deviations: the optional hosted bounded port also needed charging to preserve
the existing spend boundary, and the existing duplicate named provider settings
required a guarded two-occurrence update. No unrelated app behavior changed.
All CL-180/181 source/documentation remains unstaged/uncommitted. No paid call,
real search/download, cloud action, push or deployment occurred.

Unverified: the owner's one real Gemini run, actual search/AI/editorial/framing/
physical-device acceptance and real hosted resource/lifecycle/cost/release gates.
Existing key/live approvals enable that owner action; fake success does not
prove those upstream results. Deployment is explicitly deferred.

## Subsequent packaging authorization

CL-183 records the owner's subsequent whole-file plan, authorized local staging/
commits and fresh current-source Linux builds/offline packaged checks. Historical
uncommitted/older-image statements above retain their original handoff meaning.
The latest aggregate artifact evidence is in CL-183 and release preparation;
no new provider call, cloud action, push or deployment is part of packaging.
