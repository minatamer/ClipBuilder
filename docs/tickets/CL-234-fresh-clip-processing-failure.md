# CL-234 — Repeated fresh clip processing failure

Status: Local implementation and validation complete; post-fix real acceptance remains owner-only, 2026-11-06.

Current result: durable diagnostics captured the one authorized real retry and
confirmed a Codex strict-schema regression introduced by optional title styling.
The wire adapter and null normalization are corrected and verified without keys.
The normal app is healthy with the same source/failed clip preserved. Historical
holds and pending questions below describe earlier phases; the one retry grant
was subsequently used and is exhausted. No second real attempt was made.

The owner reports repeated failed fresh clip preparation while trying to verify
CL-226 AI title styling. The review screen shows only a generic failure, an
empty editor and Retry clip. Determine the actual failing stage and safe reason
from existing diagnostics/state before proposing a retry or fix. Preserve the
failed clip, source, completed work and current services. Do not start AI, native
processing, downloads or provider retries, read ignored configuration or change
Git/cloud/deployment state. Record all resulting feedback/fixes here.

Initial read-only evidence: the normal frontend/API/worker listeners still
belong to the existing application. The launch record points at empty current
backend log files; older launcher logs predate the owner's current attempt.
The generic failure alone cannot distinguish speech, planning or preview stages.
Read-only status/progress checks subsequently confirmed the stage below.

## Confirmed evidence

- Existing allowlisted local agent status reports one failed provider-ai clip,
  no accepted base/overlay, two planning attempts, zero image calls and zero render
  calls. No request retried or media edited during this investigation.
- The protected, content-free Codex progress GET reports inspect done (2ms),
  frames done (89,668ms) and planning failed (54,657ms). Existing worker records
  also show successful audio/transcription/speaker/frame preparation, without
  a worker failure record. The failure is at the Codex planning adapter boundary,
  before image generation or preview rendering, rather than a preview-layout
  failure. Attempt counters alone do not prove billable provider dispatches.
- Source review confirms this planning progress step wraps `options.infer`.
  Camera/title decoding and the new optional typography normalization happen
  afterward, so the observed failure precedes those decoders. This does not
  rule out a wire-schema/request or CLI/provider failure; no exact category can
  be established without its missing execution trace.
- The current verified backend's stdout/stderr capture files are empty. Its
  native worker log is receiving safe records, but the backend's detailed Codex
  failure trace was not retained there. The ephemeral inference adapter cleans
  its scratch after completion. Do not invent an auth, quota, timeout, schema or
  output-shape diagnosis from the generic error or elapsed time.

## Remaining diagnosis

Restore durable content-safe backend diagnostic capture before a future explicit
owner retry, then correlate the first failed execution trace with this stage.
Do not repeat real inference just to obtain logs. No backend/worker restart,
configuration change, added capture of raw provider content, owner-clip patch or
implementation change was performed. Current services and all failed/completed
work are preserved. No code tests are applicable to this read-only diagnosis;
Markdown/whitespace checks cover the ticket/index changes. Nothing staged or
committed. Root cause and fresh real AI/title-style acceptance remain unverified.

Synthetic/fake/no-key checks can verify a later code fix. Actual fresh AI quality
requires owner provider/runtime setup, live flags and approvals; no such attempt
is authorized for the agent by this diagnosis request.

## Owner follow-up and implementation packet

The owner reports another failure and explicitly requests fixing logging and
finding the cause, with thorough coverage rather than repeated instrumentation
edits. Use execute/validate/fix loops for this packet. Preserve earlier CL-225–233
work. A verified backend-only reload is in scope to load the fix; preserve the
frontend and acknowledged source/failed clip through existing rolling recovery.
No agent real inference retry, ignored configuration change, raw provider/media
logging, cloud/deployment or Git mutation is authorized.

Implement durable local content-safe diagnostic capture independent of launcher
stdout/stderr lifetime, using the existing validators and correlation fields.
Cover startup and request/clip stages, CLI version/auth kind, process exit/signal,
byte/time limits, transport/provider/schema categories, events/output/cleanup,
and terminal failures. Keep the first cause alongside secondary cleanup errors.
Log no prompts, transcript, raw provider response, secret, URL, private path or
arbitrary exception text. Keep local-only ownership, bounded disk/record behavior,
sink failure isolation and clean file-handle lifecycle. Reuse current diagnostic
schemas/serializers; add fields only for concrete missing coverage.

Allocate backend diagnostic sink/composition and focused failure tests; existing
Codex/clip diagnostics only where confirmed gaps require repair; backend and
operations guides, AGENTS startup/logging ownership, source-of-truth notes and this ticket/index. Verify detached
parent-exit durability, failure/rotation or limit behavior, redaction, correlation,
fake planning failures at real transport/process boundaries, and current normal
startup log readiness. Check restored clip/source fingerprints/counters without
editing it. Only after no-key gates pass, use a future explicit owner retry to
collect the missing real execution failure; do not claim historical records can
be recovered or live AI quality proved by synthetic tests.

## Logging implementation and no-key evidence

The normal local backend now owns synchronous, schema-validated diagnostic file
descriptors in a private OS-temp `clipbuilder-backend-diagnostics-*` directory.
Startup, local/analysis operations and existing detailed execution traces all use
the same sink before stderr. No new flags or raw-payload capture are needed.
Parts are at most 8MiB, bounded to 64MiB per process, with 8MiB reserved for
terminal failures/request completion and explicit limit/drop markers. Parts and
older run logs are never overwritten/deleted by the writer. Terminal records are
synced; shutdown drains existing cleanup and closes once, with exit fallback.
Disk/open/sync/close/fallback errors are isolated from processing and safely
classified on stderr. Hosted/test startup does not create this local log store.

The launcher also now uses CMD-owned stdout/stderr file redirection instead of
a PowerShell parent's asynchronous redirected streams. This fixes the empty
launcher log destination independently of the application-owned sink. Normal
commands, ports and owner-managed configuration are unchanged.

- 64 focused diagnostics/execution tests passed, including a synthetic real
  child process rejecting a schema, nested clip/plan correlation, cleanup,
  private-field rejection and bounded storage. Additional open/sync/close fault
  cases bring coverage to 67 distinct checks; the writer's final eight pass.
  Scoped backend/local types, ESLint and formatting pass.
- After the launcher call exited, real normal-startup records remained on disk.
  A protected non-metered missing-workspace GET produced a durable failed read
  record (404) without AI/native work. Normal health, `/start` and config are 200.
- Verified and stopped only the prior nine-process backend/worker tree and
  released 4000/4200 before startup; frontend PID 3496 was preserved. Existing
  paged rolling recovery was verified before shutdown. Normal restoration
  rebinds the workspace ID; source metadata/fingerprint, clip IDs/state/revision,
  counters, base hashes and outputs were compared and unchanged. No retry was
  initiated. Development reloads are included in final ownership verification.
- Exact historical Codex failure still cannot be reconstructed. A pending
  owner choice requests either one expressly authorized normal retry or an
  owner-clicked retry, after which this chat can inspect the complete trace.
  Do not mark root cause/live title acceptance complete before that evidence.

## Logging-only verification before real retry (historical)

Final normal ownership: backend supervisor 17916, API 21424 on 4000, internal
worker 1872 on 4200; frontend 3496 remains on 3000. The content-free runtime
record contains exact creation times and the current structured/launcher log
paths. The settled writer has 30 records, including startup and the intentional
404 failed read, with zero inference execution records. Old run logs and owner
media were preserved. The restored clip remains failed with its original
single planning-attempt counter and zero image/render calls; no work is active.
This current retry/source is distinct from the earlier two-attempt observation.

Read-only validate pass on the new sink/tests, server wiring/lifecycle and narrow
documentation updates finds no actionable code issue. Coverage includes safe
schemas, request/process correlation, primary and cleanup causes, direct descriptor
durability, bounded segmentation/failure reserve, disk/fallback errors, descriptor
closing and local-only startup. Existing diagnostic tests cover CLI/auth/transport/
schema/output/event limits without providers. Backend/local types, scoped lint/
format and whitespace pass. Earlier CL-225–233 work is excluded from this review
and preserved. No staging/commits, configuration change or real AI dispatch.

The logging repair is locally complete. The full ticket remains open solely for
the actual new Codex failure trace and any resulting fix/acceptance. An async
owner choice is pending: authorize one normal Retry clip, or click it manually.
Do not infer approval from elapsed time or start automatic retries. The earlier
lost errors remain unknown until new evidence exists.

## One authorized real retry — 2026-11-06

The owner explicitly chose “Authorize you to run Retry clip once” in the pending
question. This authorizes one normal retry of the restored failed clip through
the existing configured local Codex pipeline, including its usual picture/preview
steps if planning succeeds. Observe through a terminal result and retain safe
failure evidence. Do not submit another retry, change provider/configuration,
patch the saved edit, push or deploy. The authorization lifts only the earlier
agent real-retry hold for this single attempt.

The one retry was accepted (202), then failed at planning after 23.8s. Native
inspection/frame preparation succeeded, CLI 0.167.0/version and ChatGPT login
preflight succeeded. The process exited 1 with `schema_rejected`, provider code
`invalid_json_schema` and keyword `required`; inference cleanup succeeded.
Exactly one retry was submitted; its authorization is exhausted. No image or
render calls occurred. This supplies the formerly missing root-cause evidence.

Correct the Codex wire schema's optional-field representation, including nested
title-emphasis styles, and normalize only added null placeholders back to absent
optional properties before normal decoders. Preserve required/intentional nulls,
runtime schemas, saved edits, typography values, bounds and existing wire pattern
compatibility. Allocate `codex-schema.ts`, `codex-exec.ts`, focused schema/process
tests and the owning docs to this same packet. No additional real retry.

Primary authority: [OpenAI Docs: Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
requires every declared object property in `required`, with null unions for
optional values and `additionalProperties: false`. The existing adapter only
relaxed Unicode regex patterns; it did not adapt the newly optional typography
fields to this strict wire format. Verify the complete planning and search
schemas offline, optional/null round trips and styled title preparation.

## Confirmed schema regression and correction

Offline inspection of the exact planning schema reproduced two strict-object
violations: `texts.items` omitted `treatment`/`emphasis` from required, and the
nested emphasis style omitted its seven optional typography fields. These were
introduced with CL-226; this was an application wire-contract regression.

The Codex-only adapter now projects all object properties to required fields
with nullable optional values and `additionalProperties: false`, preserving
source schemas, bounds/IDs and the prior Unicode-pattern compatibility. Output
normalization uses the original schema to remove only the newly introduced null
placeholders. Required/explicitly nullable nulls, real overrides and unrelated
data are preserved; refs, arrays and distinguishable unions retain their normal
shape. Existing decoders, saved edits, native composition and Gemini are unchanged.

66 focused schema/CLI/planning/title cases pass, including all three production
Codex response schemas, actual styled-title decoding, optional/intentional-null
round trips and a fake CLI crossing the real schema/result-file boundary.
Backend/local types, scoped lint/format and whitespace pass. No additional live
attempt was made after fixing the request. The single authorized attempt is
retained as evidence, with total counters now plan 2 / image 0 / render 0.
Fresh live success and creative title quality remain manual acceptance.

## Final normal reload and validation

Stopped the verified ten-process prior backend tree before launching the normal
backend command with unchanged owner-managed environment. Settled ownership is
supervisor 1268, API 20560 on 4000 and internal worker 20400 on 4200; frontend
3496 remains on 3000. Health, `/start` and `/api/sample/config` all return 200.
The private runtime record retains exact creation times and current launcher/
structured-log paths. The new application-owned JSONL log contains 29 safe
startup/restore records after launcher exit, with zero inference records.

Normal rolling restore rebound only the workspace ID. Source metadata and
fingerprint, clip IDs/state/revision, base hashes, outputs and counters compare
unchanged against the pre-reload checkpoint. The clip remains failed at plan 2 /
image 0 / render 0, with no active processing. Prior logs and saved media remain.

Final read-only validation of this packet's sink, server wiring/lifecycle,
Codex schema/response adaptation and regression coverage found no actionable
issue. Complete production-schema strictness, optional/null transport round
trips, real styled-title decoding, failure privacy, correlation, bounded storage,
descriptor failures and shutdown are covered. The 66 schema/planning cases and
67 diagnostic cases are separate focused runs with overlapping CLI coverage,
not an additive unique test total. Backend/local type checks, scoped lint,
formatting and whitespace checks pass. Earlier CL-225–233 changes are preserved
and excluded from this validation. No configuration/Git/cloud change occurred.

The local fix is complete. A fresh successful real clip and creative title
quality remain unverified after the correction: the owner can now use normal
Retry clip manually with the configured local Codex runtime and existing live
approvals. Fake/no-key tests verify mechanics and transport, not live AI quality.
