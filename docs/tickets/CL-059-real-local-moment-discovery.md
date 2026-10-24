# CL-059 — Verify and repair real local moment discovery

Status: implemented, validated and real discovery retest passed. Dependency:
implemented/validated CL-058 diagnostics.

Owner request — 2026-10-24: explicitly authorizes the agent to test the supplied
YouTube source through the normal real local API, request two moments lasting
45–60 seconds, inspect diagnostics on failure, fix the cause and retest. This
specific live-test authorization supersedes the earlier owner-only testing rule
for this bounded investigation. It does not authorize deployment, cloud resource
changes, unrelated acquisition/processing, Git mutation or reading ignored env.
The supplied source reference and all real media/content remain outside Git.

Acceptance:

- Reuse the matching active/saved source where possible; otherwise use normal
  source acquisition for the one explicitly supplied video. Preserve unrelated
  saved media, drafts, captures and logs.
- Submit the normal real analysis API with no manual ranges, requested count 2,
  minMs 45000 and maxMs 60000. Inspect returned count, canonical frame durations,
  mode and call evidence without printing transcript, titles or payloads.
- Diagnose any failure using safe stage/error/HTTP/rule/schema/native records.
  Implement the smallest evidence-supported fix, with synthetic regressions,
  relevant types/lint/format and a read-only validate pass. No automatic retry
  policy; any investigation retry is an explicit bounded agent action.
- Rebuild/reload the backend's worker after relevant code changes with verified
  lifecycle ownership; preserve the frontend/configuration. Retest the requested
  real operation as needed and report actual evidence and limitations.

Deterministic suites remain fake/paid-off, key-free and network-blocked. They
cannot establish Gemini quality. Only the explicitly authorized normal local
operation may use the existing configured key/approvals; no credentials are
read or copied by the agent. No local AI model/weights are involved.

Evidence so far:

- The supplied source matched the active real workspace and one ready saved
  variant. No new YouTube metadata/download request was needed.
- First explicitly authorized real analysis: **HTTP 400 after 87.034 seconds**.
  Audio preparation and Gemini upload/transcription returned success. Transcribe
  completed in **74.647 seconds**; normalized structural decoding succeeded and
  provider-file cleanup was confirmed. The local `transcript_validate` boundary
  then rejected with **invalid_owner_transcript**, before any candidate call.
  These new logs establish this attempt's cause boundary, without establishing
  which individual timing check failed in the older discarded response.
- Replaced whole-transcript timing rejection at provider admission with usable
  item filtering and stable source-time ordering. Retained word IDs/timings stay
  exact; nonpositive/outside-source intervals are omitted, never stretched or
  invented. Duplicate identity and structural bounds still reject. Downstream
  selection/clip execution retain their existing guards. Added strict aggregate
  timing counters to the shared diagnostic schema, without private content.
- Synthetic regression: **48 files / 487 tests pass** via `corepack pnpm exec
  vitest run --silent --maxWorkers=2 --config scripts/local-test.config.ts`.
  Tests cover zero/reversed/outside timing items, source endpoints, stable
  overlaps, preserved input/IDs/times, empty output, duplicate/schema rejection,
  real-shaped injected provider integration and exact one-transcription/
  one-selection/upload/delete counts. Local/contracts types, scoped lint,
  changed-source formatting and diff whitespace checks pass.
- Read-only validate of the CL-059 delta against the original acceptance:
  **Meets implemented scope; no actionable findings**. Shared CL-058 changes
  remain preserved and excluded from this fix claim. No new dependency, API
  capability, retry policy, invented timing, secret/body capture or Git mutation.
- Verified shutdown of only the backend/worker and refreshed their normal
  current-source build. New supervisor **14576**, backend **19816** on 4000,
  worker **20496** on 4200. Frontend **6684** on 3000 unchanged. Health and
  real provider capabilities pass. Saved-source reopening took **30.401 seconds**
  without a download. Normal saved configuration was not read or changed.
- Explicit live retest: **HTTP 200 in 156.524 seconds**, real **provider-ai**,
  exactly **two suggestions: 47.3 and 50.8 seconds**. Requested count was 2,
  minimum 45 seconds and maximum 60 seconds, with no manual ranges. Reported
  calls are exactly **1 transcription / 1 selection** for the successful run.
  Gemini transcription succeeded in **75.161 seconds** and candidate generation
  in **71.264 seconds**. No clip processing, image generation or export requested.
- Live safe timing counters: **649 returned / 608 accepted words**, **41
  nonpositive intervals omitted**, **0 outside-source intervals**, **100 retained
  word positions reordered**. IDs and retained timings remain unchanged. This
  demonstrates that the new boundary handles actual provider timing anomalies
  without losing the entire usable transcript. Both successful source-processing
  requests confirmed provider-file cleanup before returning from transcription.
- Independent subsequent GET retrieved the same two suggestions, limits,
  durations and exact call evidence from the normal app, with no new provider
  dispatch. Backend health remains **200**, real planning remains available,
  cloud false, and the frontend PID remains unchanged. Results remain in the
  active local workspace for the owner to review.

Investigation totals: **two explicit real transcription attempts and one real
candidate-selection call**, with one failed pre-fix attempt and one successful
post-fix attempt. No automatic retry was added. No new download was needed.
The source URL/identity, media, words, titles, payloads and private paths are not
recorded here. Existing saved assets/logs/configuration and all CL-058 work are
preserved; nothing was staged or committed.

Changed for CL-059: local `transcript-timing` module/tests, provider admission and
its regression test, strict shared timing-counter schema and local logger method,
source-of-truth/local workflow guidance and this ticket/index. Prior CL-058
logging changes remain separate in scope despite the shared uncommitted files.
Read-only validation verdict: **Meets ticket; no actionable findings** after
the synthetic checks and successful live retest. No UI, privacy, spend budget,
mode-setting, deployment or Git-policy deviation. Type errors in the initial
new fixture/array inference were corrected before final checks/retest; no test
deadlines or assertions were weakened.

Remaining limits: discovery API success and requested duration/count are now
verified on this one owner-specified video. General provider quality, semantic
moment selection, other sources, full clip processing/export/playback and broad
owner-media acceptance are not established by this test. Synthetic tests remain
key-free/fake/paid-off; only the explicitly authorized normal local investigation
used real Gemini with the existing key and approvals.
