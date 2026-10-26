# Current code quality and efficiency audit — 2026-10-26

Baseline: main ca10def, clean after CL-084–088's 84-file commit. This is a new
current-source audit under CL-089, not adoption of the older isolated checkout.
Plan and scoped implementation complete; locally validated under CL-089. Owner authorized AFK ordinary
choices, execute/validate loops and local commits; personal acceptance is open.

## Coverage and method

Inventory/reference searches cover the app/package/script sources; the critical
local and hosted upload → analysis → batch → preview → edits → explicit export
and persistence/cleanup paths were traced. Inspect responsibility/import
boundaries, schemas, defaults, provider reuse, work/deadlines/cancellation,
render clocks/cache, error exposure, timers/listeners, build inputs and tests.
The focused current feature/native surfaces contain 317 source/test/script
paths; this count is descriptive, not a claim of line-by-line proof.

The baseline already has 599 local cases, the exact full unit gate (144 root and
1,725 package cases), all 25 synthetic proof cases reconciled, extra compact
Text/Focus browser cases, types/lint/format and isolated production builds.
Reuse that evidence for unchanged behavior; add targeted failure checks for the
two confirmed findings below. Synthetic results do not establish real AI quality
or actual hosted identity/resource settings. No local AI model is introduced.

| Area | Assessment / evidence limit |
| --- | --- |
| Architecture/contracts | Executable dependency boundaries pass; shared browser-safe schemas and composition remain single-owned. Application size alone is not a reason to split orchestration. |
| New editor/text/defaults | Strict bounded text/geometry/timing, revision/source binding, dirty state, native raster identity, legacy paint and defaults are connected. CL-088 fixed compact inspector overflow. |
| Preview/export/native | Separate measured playback and final outputs, explicit exports/retries, retained AI work and current-source native proofs; no extra render/provider request on Apply. |
| Providers | Plan/title share one request; source transcripts/checkpoints reused, no automatic retry. Gemini quality critiques remain advisory. Commons relevance is an intentional search-selection rule, not a paid Gemini retry veto. |
| Diagnostics/privacy | Private allowlisted backend diagnostics retained; browser controls show generic errors. No production browser logging or content/debug trace found on the new feature surface. |
| Cleanup/state | Existing process/stream/timer ownership and finite request/work limits retained. Q-01 identifies a concrete failure-path loss of cleanup ownership. |
| Performance/build | Bounded static text fitting/raster reuse and preview-first path are appropriate. Q-02 avoids repeating dependency installation for source-only builds. No measured Cloud Run saving is claimed for it. |
| Tests/release | Current synthetic/native gates are substantive; source-only Windows production builds pass. Actual current Linux image/native vendor, hosted identity/max-resource and owner paid/visual/rights checks remain outstanding. |

## Q-01 — Medium: staged upload cleanup can be skipped or forgotten

`apps/backend/local/hosted-workflow.ts` discards a session by awaiting host close
before upload discard. A host-close failure skips the independent staged file
cleanup. Recovery retries exist, but `HostedUpload.discard` clears its only stage
reference before awaiting filesystem removal. If removal fails, the next retry
has nothing to remove and can clear recovery with that temporary directory left
behind. The same early invalidation occurs when finalization moves the source
then fails to remove its empty staging directory; cleanup must retain that
directory without deleting the admitted source. This is a bounded-demo reliability/resource defect, not evidence of an
authentication bypass or a reason to delete retained owner media.

Plan: drain admitted transfers as today; independently settle host/upload cleanup
and retain recovery if either fails, with the existing content-free diagnostic.
Only forget a staged directory after removal succeeds, and only if the stage
identity still matches. Inject a host-close failure and a one-shot filesystem
failure to reproduce both on generated empty upload files. Verify first failure,
actual staged file removal/retry, correct session recovery and zero metered work.
Keep original application cleanup/admission/security bounds and no paid retry.

## Q-02 — Low: source-only image changes repeat dependency installation

Each app Dockerfile currently uses COPY source before pnpm install. A changed
component or backend module invalidates that layer even when dependencies are
unchanged. This wastes build work; it is separate from deployed processing cost.

Plan: COPY root manager metadata/lock/workspace, fetch dependencies, COPY source,
then install frozen/offline before the original build commands. Fetch must use
`--ignore-scripts`; normal lifecycle behavior stays at the post-source install.
Reuse pinned
pnpm11.19.0; verify its local help and cached manifest-only fetch plus offline
installation. [pnpm's fetch documentation](https://pnpm.io/cli/fetch) describes
this lockfile-based Docker pattern; this audit does not adopt its newer manager
version. Keep closed frontend/backend/renderer image contexts, scripts, runtime
versions and artifacts. New dependency patches belong to the security audit.

## Deliberate non-findings and future edit guidance

- Do not refactor large orchestrators merely to reduce line counts, remove
  supported saved formats, hide usable AI results or add automatic provider work.
- Keep shared Text/Captions typography and composition contracts authoritative;
  add no provider/env/Node import to browser-safe packages. Preserve finite
  clocks/bytes/work, cancellation, exact dispatch counts and retry checkpoints.
- Maintain diagnostics and generic UI errors. Do not move raw provider/schema
  errors, transcripts, private paths or credentials into browser logs or docs.
- Maintain footer and preview readiness, actual gestures/keyboard/mobile states,
  normal motion, original-source quality and current-source native verification.
- Image cache changes must preserve reproducibility and the secret-free closed
  context. Do not use a checkout containing ignored env/media as cloud input.

## Execution evidence

- Three meaningful regressions reproduced the unchanged-code failures: host
  close skipped upload discard; failed discard forgot its directory; failed
  final-directory removal forgot ownership despite an admitted source. All
  eight focused upload/cleanup/hosted-workflow cases now pass, including actual
  file absence, retained admitted bytes, host recovery and zero metered work in
  the failure probe. The async assertion waits for removal, not just invocation.
- pnpm11.19.0 local help confirms lockfile-based fetch. The first cache probe was
  invalid: fetch ran a dependency postinstall despite offline resolution, and
  that script attempted a public npm registry download. This was not a provider,
  paid-processing or cloud operation, but it does not count as network-isolated
  evidence. No ignored env file was involved. Corrected all Docker fetch steps
  to ignore scripts before source exists.
- A fresh guarded probe imports the deterministic fake/paid-off setup, blocks
  env-file reads and external sockets/fetch in inherited Node processes, then
  performs script-free cached fetch followed by a real frozen/offline install
  with lifecycle scripts enabled after the allowlisted frontend source context
  is copied. It passes with zero external attempts, zero downloaded packages and
  unchanged lockfile. It proves the pinned resolution/layer pattern on Windows;
  it is not an actual Linux image build or a measured Cloud Run cost reduction.

Final gates pass: 144 root and 1,728 package cases through the exact full unit
command; 602 local cases / 62 files; affected lint/format/backend/local/test types
and whitespace. Q-01/Q-02 are fixed locally. Actual current Linux image and
hosted/native-vendor release verification remains open. No audit scanner,
provider/cloud request, ignored config read/change, deployment or push occurred.

Read-only validate pass 1 identified one implementation concern: wrapping both
cleanup failures in AggregateError hid the original allowlisted system code from
the existing diagnostic encoder. An injected EIO regression independently
confirmed it. Log each underlying bounded cleanup failure through the same
content-free diagnostic path while retaining aggregate rejection/recovery. Keep
raw exception text out of logs/UI; the regression checks both properties. This is
part of Q-01's requirement to preserve diagnostics, not an added public feature.

Read-only validate pass 2: **Meets CL-089; no actionable findings.** Independently
verified the EIO diagnostic correction and redaction, all resource ownership and
recovery regressions, original package/runtime/build behavior and guarded cached
resolution. The normal watcher-reloaded app is healthy/fake/cloud-off; runtime
ownership records are current. Final whole-file allocation and local commit
follow in CL089_COMMIT_PLAN.md, before the separate security audit.
