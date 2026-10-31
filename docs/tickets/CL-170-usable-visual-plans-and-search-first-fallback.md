# CL-170 — usable visual plans, precise diagnostics and search-first fallback

Status: complete locally; fake/source/native/CLI checks and read-only validation
pass, 2026-10-31. Fresh real output/search/fallback taste remains owner acceptance.
Depends on CL-164/167/168/169. Preserve their current unstaged implementation.
No Git action, real inference/search/download, configuration or deployment.

## Owner revision and findings

Log investigation of the owner's run found two Codex visual entries rejected by
the local decoder, zero search attempts and plan/coverage shortfalls. Historical
logs do not include the invalid fields; do not claim to know their exact values.
New diagnostics must identify field/rule failures without recording any returned
text, transcript, queries, prompts, URLs, source clocks or provider payload.

Owner requires usable visuals to survive repair, optional visual failure never
to block clip preparation, and public-image search before generated fallback.
Remove image-license exclusion for local Codex search. Preserve accurate source
metadata without claiming permission that was not checked. This supersedes the
local Codex no-new-illustration fallback rule and restrictive image-license gate,
not original-media authorization or network/media/executable safety boundaries.

## Implementation plan and acceptance

1. Introduce a focused Codex visual-plan decoder. Diagnose the original schema
   issues by entry index, bounded known field path, fixed issue/rule and numeric
   limits. Repair ordinary search punctuation/whitespace, bounded long fields,
   optional evidence/alternates and physically representable clocks. Preserve
   usable search briefs and independently usable illustration fallbacks; drop
   only irrecoverable pieces. Report received/repaired/retained/dropped totals.
   Keep coverage/quality advisory with no whole-flow rejection or paid retry.
2. In the existing single Codex planning call request both a generic searchable
   brief and a relevant fallback illustration plan per visual. App code owns
   actual retrieval. Always search first, including legacy plans carrying an
   illustration. Use the fallback only on search miss/failure/deadline, retaining
   the existing deterministic local illustration renderer (not a new image-model
   API or hidden Gemini call). Preserve the script's meaning and editable timing.
3. Improve bounded local lookup: up to three distinct same-subject queries,
   twenty metadata candidates and up to three eligible raster candidates per
   lookup, within one twenty-second per-visual search deadline. Try another
   candidate after an unusable image; no duplicate query or automatic AI retry.
   Keep existing allowlisted HTTPS hosts, redirect denial, private-free generic
   queries, omitted credentials, byte/pixel/digest/raster and cancellation guards.
   No unlimited search or new external account/service.
4. Remove license filtering for the local Codex source; keep truthful bounded
   source-reported/unknown license metadata and old saved schema compatibility.
   Default Gemini/hosted retrieval policy remains unchanged. Remove restrictive
   license wording from local planning direction. Emit bounded search/fallback
   outcomes and counts; source failures or invalid optional assets continue to
   local fallback/omission rather than failing the completed clip. Parent abort
   still cancels promptly. No unrelated filler or fabricated art on total failure.
5. Fake regressions cover common malformed-but-usable fields, precise redacted
   reasons, independently preserved pieces, search-before-render ordering,
   multiple candidate/query attempts, non-public-domain local admission, default
   policy compatibility, fallback/complete failure, zero extra inference and
   cancellation/cleanup. Run scoped types/lint/format, relevant backend/local
   suites and current-source synthetic browser/native export/save/recovery, then
   a read-only validate pass. Refresh normal worker/backend only when idle.

## Whole-file allocation

- Contracts: local visual-diagnostics schema and owner diagnostic record,
  contextual image metadata compatibility, Codex planning/search policy/schema.
- Backend: new local visual-plan decoder/tests; LocalDiagnostics; Codex adapter/
  composition/tests; Commons source/tests; only shared clip behavior necessary
  to preserve optional-picture nonfatality. No new workflow controls.
- Existing local illustration renderer remains the generated fallback; tests
  verify its escaped closed vocabulary. No model-authored markup/commands/URLs.
- Proofs/docs: existing Codex fake CLI/browser/native proof, source of truth,
  local Codex guide, this ticket and index. Capture only synthetic screenshots.

## Gates

FAKE_MODE=true/paid-off/network-blocked tests inject search/model results with no
keys. Real Codex still needs installed CPU tools, saved ChatGPT sign-in/allowance,
enabled local gates and explicit owner action. Real image hit rate/relevance,
new diagnostic reasons on fresh model output and generated fallback taste remain
owner checks. The current Codex bridge renders AI-planned illustrations locally;
it does not provide a raster image-generation model. No new API key, provider
call, model/tool download, cloud, environment change, push or deployment. Preserve
current owner clips, drafts/recovery, retained/private media and existing logs.

## Implementation and evidence

- Added `codex-visual-plan.ts` and the closed `visual-diagnostics.ts` contract.
  Original Zod issues become bounded entry/field/rule/limit records, followed by
  repaired/retained/dropped totals. Unknown keys and returned values never enter
  diagnostics. Repair handles query punctuation, long/controlled text, invalid
  optional terms/evidence/alternates, generic brief reconstruction from an
  independently usable fallback, and bounded physical clocks. An irrecoverable
  entry is omitted without rejecting other entries or the clip. Diagnostic sink
  failure cannot discard a usable result. No transcript-derived outbound query.
- Codex's same planning schema/prompt now requests both brief and illustration.
  Search always runs first; successful retrieved art wins. Misses, malformed
  optional assets, invalid digests/rasters, unavailable lookup and search deadline
  can use the existing escaped local illustration renderer. Total visual failure
  returns null with fixed diagnostics, not a clip failure or automatic AI retry.
  Explicit caller cancellation is still honored. No extra inference/Gemini call.
- Local composition selects no license filter and deeper bounded lookup. Source
  metadata remains truthful/unknown; missing/unusable license metadata cannot
  become a local exclusion. Default Gemini/hosted filtering is unchanged. The
  Commons adapter tries another ranked eligible candidate after an unusable
  download/raster, preserving host/redirect/credential/byte/pixel/digest guards.
- Existing retained art/plans remain readable. The new behavior applies to fresh
  preparation and applicable explicit retries, not silent regeneration of the
  owner's completed clips. Fallback generation is a Codex-planned local diagram/
  illustration, not a newly connected raster image-generation model.

Checks (installed cached pinned pnpm 11.19.0):

- `pnpm exec vitest run --config scripts/local-test.config.ts` with local
  `codex-visual-plan.test.ts`, `codex-ai.test.ts`, `codex-visual.test.ts`,
  `clip-batch.test.ts`, `codex-composition.test.ts`, `diagnostics.test.ts` and
  contracts `codex.test.ts`: **68 cases across seven files pass**. Includes exact
  field/limit diagnostics, no private strings/unknown-key leakage, malformed
  usable plans, independent piece retention, search-first ordering, miss→PNG,
  corrupt optional assets, cancellation and unchanged inference counts. The final
  punctuation/short-term boundary rerun passes all sixteen decoder/adapter cases.
- Backend `pnpm exec vitest run src/assembly/commons-pictures.test.ts
  src/assembly/gemini-pictures.test.ts src/assembly/contextual-pictures.test.ts`:
  **68 cases across three files pass**, including non-public-domain local
  admission, a bad first raster followed by a valid second raster, observer
  failure, twenty-candidate bounds, source safety and default-policy compatibility.
  The source-only final review rerun passes all 24 cases.
- Current-source `test/local-codex.proof.ts` passes in **67.76s**. The injected
  model returns a punctuation-invalid query, all bounded public lookups miss,
  local generated art is admitted and remains present through actual Player,
  native export, edits, saved restore and automatic recovery at desktop/phone
  sizes. Query/subject, exact inference/media counts and process/listener/scratch
  cleanup pass. Synthetic fallback thumbnails and footer geometry were inspected.
- Installed CLI `test/local-codex-cli.proof.ts`: both isolated loopback fake-
  endpoint schema cases pass with the expanded fallback schema. An initial
  combined run reached the native proof's final assertion but expected the old
  query string; the expectation now verifies repaired punctuation and the full
  rerun passes. No production failure was hidden or real inference repeated.
- Contract/local/backend/frontend/root-test types, scoped ESLint/Prettier,
  `pnpm build:contracts` and `git diff --check` pass. Tests use top-level hardcoded
  fake/paid-off/credential-clearing/network-blocked setup, outside the Windows
  sandbox only for its previously recorded temporary transform-cache issue.

Read-only validate: **Meets ticket locally; no actionable findings**. Reviewed
the incremental CL-170 work atop preserved CL-168/169 changes: real decoder and
source call sites, bounded metadata/asset policy, exact diagnostics privacy,
one-inference search/generation order, optional failure/cancel behavior, saved
compatibility and all touched timer/request/body/Sharp/browser/process cleanup.
Dependency directions remain intact. Scope deviations: none.

Historical invalid field values are unavailable from old logs; no specific old
field is guessed. New precise reasons, real search hit rate, relevance and local
fallback taste require the owner's fresh run. External failure still cannot
guarantee minimum art, but produces explicit nonfatal diagnostics. No actual
search/download, provider spend, ignored configuration access/change, cloud,
staging, commit, push or deployment was performed.

## Normal runtime refresh

Verified idle owner processing and all nine owned backend/watcher/worker creation
identities, stopped only that tree and verified stabilization without survivors,
orphans or 4000/4200 listeners. Frontend PID 4968/3000, acknowledged clips/results,
saved/recovery/retained media and private logs were preserved. Normal startup
rebuilt current contracts/worker/overlay with unchanged owner configuration.
Supervisor 22008, API PID 3600/4000 and worker PID 23140/4200 belong to the verified
replacement tree. Health, `/start` and `/api/sample/config` return 200; safe
capabilities report Codex ready. No processing request was triggered.

Content-free runtime/log paths outside Git:

- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl170-app-133e1bcaffcd4992a84c33edb25e23d1\backend.runtime.json`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl170-app-133e1bcaffcd4992a84c33edb25e23d1\backend.stdout.log`
- Visual decode/search/fallback records: `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl170-app-133e1bcaffcd4992a84c33edb25e23d1\backend.stderr.log`
- Native timings: `C:\Users\minat\AppData\Local\Temp\clipbuilder-local-runtime-EPWS8C\worker.stderr.log`

App remains running. All implementation/doc changes remain unstaged/uncommitted.
