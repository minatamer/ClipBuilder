# CL-007 controlled analysis check

## Current candidate envelope fix and owner retest — 2026-10-05

The latest owner test passed renderer preparation, Transcribe and JSON-only Flash
at HTTP 200. Flash returned three candidate objects in a top-level array, but
object-only normalization published an empty result and displayed a hardcoded
editorial claim. The
[approved envelope fix](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#owner-candidate-envelope-decoding-fix--2026-10-05)
now accepts both formats, states the JSON envelope in the prompt, emits safe
decode/count/drop-reason diagnostics and uses neutral empty UI copy. Every raw/
normalized private capture remains preserved, and quality rejection gates were
not reintroduced.

All five root gates, **969 synthetic tests in 82 files**, final local review and
unchanged saved-response replay pass: returned/accepted 3, dropped 0. Backend
watcher hot reload, three readiness GETs and armed full capture pass. There were
zero new provider calls, cloud actions or configuration changes for this fix.
Start over and manually retry Find moments using the existing owner credentials,
live flags and approvals. Fake/no-key and offline replay prove decoding only;
paid UI behavior and quality after the fix remain owner acceptance. Earlier
sections below describe their respective preceding revisions.

## Current session allowance fix and owner retest — 2026-10-05

The latest manual failure occurred in renderer preparation before Gemini: the
old two-operation process-lifetime cap was exhausted. The
[authorized session allowance packet](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#owner-session-renderer-allowance-and-operational-diagnostics--2026-10-05)
replaces it with four atomically persisted operations per session, preserving
replay, capacity, admission/spend, authentication and cleanup. The backend now
records renderer HTTP status/reason/sub-stage, timing, body/decoding failures,
bytes/completeness and cancellation; media availability/limit failures retain
their actual safe UI category instead of model-output rejection.

Implementation, final read-only validation, all five gates and **959 synthetic
tests in 82 files** pass. The matching immutable private image passed Linux
audio/render/cancellation/runtime checks and is Ready with 100% latest traffic.
The retired cap entry is removed; other runtime settings and private IAM match.
Anonymous/authenticated health returns 403/200; invalid audio input returns 400
before processing. Exact owned staged source and local context were removed.
Backend hot reload, all three local GET checks and armed private Gemini capture
are verified. All agent live media/Gemini dispatches were zero.

Start over in the local UI and manually retry Find moments using the existing
owner credentials/live flags and approvals. Raw/normalized Transcribe and Flash
output capture is preserved; ordinary logs remain safe and request-correlated.
Fake/no-key checks prove local behavior only. Google acceptance of the JSON-only
Flash request, real speech/editorial quality and paid end-to-end cleanup still
need the owner's manual test. Earlier rollout/status sections below are history.

Latest request isolation (2026-10-05): the next owner run passed Transcribe and
local transcript packaging, then Google rejected Flash candidate generation with
generic HTTP 400 `INVALID_ARGUMENT`. No Flash candidate output existed. The
[authorized JSON-only change](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#owner-flash-json-only-request-isolation--2026-10-05)
removes only `responseJsonSchema` from that request, preserving JSON MIME mode,
prompt/model/settings, permissive decoding and complete private capture. All five
root gates, 922 synthetic tests in 80 files and local watcher/readiness checks
pass with capture armed. Fake/no-key checks prove local serialization only; the
owner manually retries Find moments with existing credentials/live gates to
check Google acceptance. The rejected parameter remains unproven; no paid call,
retry, cloud/configuration change or Git mutation was made for this isolation.

Latest owner override (2026-10-05): the first Transcribe UI attempt returned HTTP
200 but 22 equal start/end offsets caused local schema rejection before Flash.
The [current removal packet](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#owner-removal-of-find-moments-quality-rejection-gates--2026-10-05)
removes all Find moments transcript/candidate quality rejection gates, preserves
returned values and full private capture, and decodes usable items independently.
Basic bounds, authentication/admission/source binding and deletion remain.
Earlier rejection/tolerance descriptions below are historical. Local fake/no-key
checks and offline replay pass: all five gates and 922 synthetic tests in 80
files; all 1,168 captured words and 22 equal timestamp pairs are accepted without
changing the saved normalized output. Backend watcher loading and all three
readiness GETs pass with capture armed. No paid call occurred. Live acceptance
remains the owner's manual UI test with existing credentials, capabilities and
approvals.

## Current audio transcription migration — 2026-10-05

The current [CL-007 packet](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#owner-transcribe-and-text-only-selection-migration--2026-10-05)
replaces combined-video source analysis with source-aligned renderer audio,
Gemini 3.5 Transcribe and text-only Gemini 3.8 Flash selection. It preserves full
private capture and safe diagnostic v2 log parsing, extends capture to selected
video planning/assembly and adds bounded timing/cosmetic tolerance. All isolation
CLI execution paths are retired; commands below are historical evidence only.
Existing captures and cleanup obligations remain preserved.

Local implementation, native synthetic extraction and all five root gates pass:
912 fake/no-key unit tests in 80 files. The image verifier also checks audio-only
profile, actual bytes and decoded source/audio onset; its packaged Windows
fixture-only stage passes. Actual Linux image proof and private service update
were separately approved and passed: one 136.453-second build, matching registry
digest, Ready/100% latest traffic, identical runtime spec apart from image and
unchanged private IAM. Anonymous health is 403, configured-audience ADC health
200, and the new audio route rejects empty input at 400 before any media work.
The exact staged source generation and local context were removed. All provider/
real-media test dispatches were zero. Historical statuses below describe earlier revisions.

The owner may now start over and manually run Find moments against the matching
private revision. Analysis is enabled; assembly/render remains disabled at the
existing approved stage. Keep normal owner
credentials/live switches and independent approvals; no extra key is needed.
With an armed six-hour local permit, the owner test records complete accepted raw
HTTP responses (including unknown fields), raw/normalized Transcribe words and
Flash candidates, actual timestamps/adjustments and selected-plan outputs in
private OS-temp JSONL. Normal logs stay content-free. Capture oversize/disconnection
is explicit; preserve evidence on expiry. Fake/no-key tests do not prove speech,
candidate or speaker quality, real provider cleanup, latency or spend.


Status: **Gemini account/key/spend setup reported complete on 2026-10-04;
one existing private renderer image build/revision update and local setup are
complete; local analysis is enabled; the owner's latest 2026-10-05 manual attempt
passed Gemini HTTP 200 and JSON/schema validation, then failed reconciliation.
Grounding acceptance/quality remains unverified**. The owner reserved all paid-flow
testing for their own manual actions, with later explicit exceptions for the
text-only diagnostic investigation recorded below. The identified schema fix is
now applied; the next genuine video retest remains the owner's manual UI action.
Agents may run fake-mode checks; no agent-run paid video analysis is authorized.
The local fake browser workflow passed without keys/external calls; continuing
dependency-ready local tickets is authorized. This checkpoint
authorizes no new resources, public release, assembly, images or
final export. `FAKE_MODE=true` with no keys supplies synthetic fixture and
injected zero-network results; CL-006 separately proved real media processing
with fake AI. Genuine understanding requires Gemini; no local AI model is used.

## Owner-local full Gemini output capture — 2026-10-05

The latest manual run identifies `word_outside_media` at `words[1080].endMs`
(ordinal 1081), with generation HTTP 200 and JSON/schema success. It has 36 safe
records and zero drops; generation took 142,485 ms, the whole run 198,660 ms.
The full response/actual timestamps were not retained. The owner subsequently
authorized the [CL-007 private capture packet](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#owner-local-full-gemini-capture--2026-10-05).

The next manual UI run captures complete bounded Gemini response bodies and
metadata before SDK parsing, normalized transcript/candidates, actual decoded
duration and word overrun values. They are private request-scoped JSONL files
outside Git in OS Temp's `clipbuilder-runtime/private-gemini-capture/`; normal
stdout/stderr remain content-free. A workspace-bound six-hour permit activates
local real/paid analysis only. Fake/test/preview/production composition remains
off. Existing validation/call counts/cleanup and the four-MiB response bound
remain unchanged; oversize captured prefixes are explicitly incomplete.
Synthetic tests use no keys/provider calls or local AI runtime/weights. No
actual timestamp verdict is possible until the owner manual retest. Captures
remain local until removed after diagnosis; activation expiry is not deletion.

All five root gates pass with 916 fake/no-key tests in 80 files; scoped read-only
review found no actionable issue. Backend capture is armed until
2026-10-05 20:06:58 UTC, app PID 9028 is stable on port 4000, frontend PID 20712
is stable on port 3000, and all three non-metered readiness GETs return 200.
No new provider request was triggered; the owner's next manual run supplies
the first real full response and exact overrun evidence.

## Reconciliation rejection diagnosis — 2026-10-05

The owner manual run captured 36 safe records with zero drops: media preparation,
proxy/Google upload, file readiness, generation HTTP 200, local JSON/schema
validation and cleanup succeeded. Reconciliation rejected in 6 ms. The analysis
request took 188,504 ms; generation took 131,930 ms and preparation 30,420 ms.
The safe capture is
`C:/Users/minat/AppData/Local/Temp/clipbuilder-runtime/restart-backend-adc-20261005-125537/ui-validation-req_e7ba54213766453fbea5d0b25623abf0.jsonl`.
The old generic catch does not expose the specific rule, and no raw response was
retained. There is no retrospective verdict on whether rejection was justified.

The owner authorized [CL-007 reconciliation diagnostics](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#reconciliation-rejection-diagnostics--2026-10-05):
static guard/contract reason codes, bounded field/index paths and issue counts,
with no text, timestamps, media/provider IDs, message/input payloads or public
response changes. Acceptance conditions, settings, one-call behavior and cleanup
remain fixed. All five root gates pass with 902 fake/no-key tests in 79 files;
scoped read-only review found no actionable issue. The final compiled parser
accepts the preceding 36-record UI capture without drops. The new reconciliation
marker, stable backend/frontend app PIDs 5424/20712 and all three readiness GETs
(200) are verified; detailed evidence is recorded in the packet. Fake mode with
no keys validates instrumentation and synthetic boundaries; the next
genuine test is owner manual with existing keys/live flags/approvals. No local AI
runtime/weights, new paid request, cloud change or configuration edit is involved.

## Controlled text/schema comparison — 2026-10-05

Current applied state: the owner authorized the
[evidence-array transport fix](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#applied-evidence-array-transport-fix--2026-10-05)
and reserved the next real UI test for themselves. Production now sends the
accepted fingerprint with policy `analysis_local_evidence_cap`, omitting only
the identified evidence maximum in addition to the earlier transcript transport
caps. Canonical/local evidence max eight and all other validation remain strict.
Focused 150 fake/no-key checks and all five final root gates pass, including
870 unit tests in 79 files. Scoped review found no actionable issue; the final
compiled parser accepts all 66 safe records from ten historical logs. The new
schema policy is active in backend app PID 14680; frontend PID 20712 and all three
non-metered readiness GETs pass. The obsolete component commands are retired;
their old safe logs remain parseable. No additional paid
request or owner configuration/cloud/retained-media/Git change is made. Genuine
video/transcript/candidate acceptance and quality await the owner's UI retest.

Historical diagnostic result before the applied fix: the owner explicitly authorized agent-run diagnostics until the
issue was pinpointed. Nine subsequent requests plus the earlier approved control
isolate the evidence array's provider-side `maxItems: 8`: full original schema
400, exactly that key omitted 200, restored original 400. See
[confirmed CL-007 evidence](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#confirmed-evidence-array-schema-rejection--2026-10-05)
for the ten single-generation outcomes, safe proof logs, fingerprints and current
checks. All probes are text-only, use existing keys/live flags/approvals, have no
upload/retry and discard output. At that checkpoint the proposed processing fix
was not applied; the current implementation is recorded above. Real
video/transcript/candidate acceptance and quality remain unverified. Fake/no-key
checks verify the diagnostic tooling; no local AI weights/runtime are used.
All five settled gates pass with 874 tests in 79 files and no actionable
read-only-review findings. Backend/frontend 6880/20712 pass readiness/ownership;
both services remain running. No secret file was inspected or environment,
approval, retained-media, cloud or Git state changed. Exact token usage/cost is
not recorded; the packet explicitly leaves that evidence unchecked.
The notes below preserve the earlier investigation state before this result.

The owner's updated-schema video test still failed: 33 safe run records, zero
drops, expected policy/fingerprint and generic generation HTTP 400 after
4,127 ms. The full run took 61,517 ms. Source/proxy/upload/readiness passed;
cleanup reported success. The two-bound reduction was insufficient, and the
exact cause remains unconfirmed.

The owner authorized preparing two controlled text-only probes. The
[CL-007 isolation follow-up](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#owner-run-text-and-schema-isolation--2026-10-05)
owns scope/gates/evidence; the
[backend guide](../../apps/backend/README.md#owner-run-gemini-request-isolation)
owns exact owner commands and interpretation. First test JSON-only text without
a schema. Only if that returns HTTP 200, test the same text with the exact failed
video schema. One explicit owner command makes at most one generation call;
there is no upload, automatic sequence/fallback/retry or app workflow change.
The later video/schema-component comparison depends on these results.

The initial 139 focused checks passed, with a further verified timeout/cancellation
regression added after review. Fake/no-key dry-run requires no owner
configuration/network. Actual probes still require the owner's keys, real/paid
live configuration and existing approvals, with manual owner invocation. Strict
safe diagnostic logs are separate under temporary `clipbuilder-runtime/schema-isolation/`.
No local AI assets/runtime are used and no retained master is read. All five
settled root gates pass with **860
tests in 79 files**; both executable dry-runs pass with zero requests. Final
read-only review reports no actionable finding after the timeout-classification
correction. Healthy backend/frontend app PIDs are 10524/20712 on 4000/3000;
owned identities were refreshed after stabilization and all readiness GETs pass.
The owner's later explicit instruction authorized the agent to run the displayed
paid text control once as an exception to the earlier manual-only rule. The
normal entry point loaded existing configuration without secret inspection or
setting/approval edits. The result was HTTP 200, SDK completed, six safe records
with zero drops, 27,846 ms total; one generation and no media upload/retry.
Generated content was discarded. This proves baseline text-only request
acceptance for the configured model/settings, not schema/video acceptance or
quality. The schema probe remains unrun and requires owner execution or another
explicit authorization; exact root cause is still unconfirmed. The packet owns
the safe log path and the latest UI generation-400 evidence.

## Isolated schema remedy for the next owner test — 2026-10-05

The owner manually reran with diagnostic v2. Its 33 safe run records had zero
drops: upload/file readiness passed, then one generation returned HTTP 400 in
4,191 ms with generic `INVALID_ARGUMENT` and no recognized specific reason or
parameter. The run took 59,388 ms; cleanup reported success. Failure precedes
output validation/reconciliation. Exact cause and physical deletion remain unknown.

The owner authorized a narrow remedy and hot reload. The
[CL-007 isolated-schema follow-up](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#isolated-generation-schema-remedy--2026-10-05)
records research, scope, checks and verified activation. Only two large outer
`maxItems` hints are omitted from Google's source-analysis request; strict local
caps and other inputs/settings remain. The actual SDK request is checked for
exactly that difference. Five new synthetic checks prove oversized/invalid output
rejection and cleanup without retry. All 124 focused checks pass with
fake/paid-off/no-key and denied external network.

The next run logs `schemaPolicy: "analysis_local_array_caps"`, actual schema
fingerprint and largest remaining array bound 8. There is no automatic live
probe, fallback or extra generation. This hypothesis remains unconfirmed until
the owner repeats Find moments with existing keys, live flags and approvals.
Fake results do not prove real acceptance/quality. No local AI runtime/weights
are used; both retained masters remain protected.

All five settled root gates pass with **844 fake/no-key tests in 78 files**.
Final read-only review found no actionable issue in this remedy. Backend hot
reload is confirmed by its new schema-policy marker and app PID 20572 under
supervisor 18636 on 4000; frontend PID 20712 under supervisor 10900 stays on
3000. Owned runtime records were refreshed after stabilization. Health, `/start`
and `/api/sample/config` return 200, with live analysis enabled and assembly/render
disabled. The compiled outgoing schema fingerprint begins `de4a25b670fd98f7`
and its maximum array bound is 8. Logs remain in the runtime directory below.
No paid request, cloud/environment/approval edit, process launch/kill or Git
mutation was performed; live acceptance remains exclusively the owner's test.

## Owner manual failure and expanded diagnostics — 2026-10-05

The owner's normal local launch reports live analysis enabled, with assembly and
render still unavailable. Their manual retained-sample attempt produced 35 safe
diagnostic records. Preparation/upload/file readiness succeeded; one Gemini
generation was rejected with HTTP 400 after 3,491 ms. The application mapped it
to HTTP 500; all three cleanup phases reported success. The exact Google
rejection reason was discarded and cannot be recovered from the existing logs.
Reported cleanup success is not independent proof of all cloud/provider deletion.

The owner subsequently authorized expanded backend logging only. The
[CL-007 diagnostic-v2 follow-up](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#expanded-rejection-diagnostics--2026-10-05)
owns implementation, verification and activation evidence. The new format
retains bounded fixed rejection classifications and static request/schema
context before error mapping; it stores no raw provider message/body or content.
No processing remedy, configuration/provider resource change or additional live
request is part of this work. Automated checks stay fake/paid-off/no-key and
network-denied. The next real test remains exclusively the owner's action.

At the diagnostic-v2 handoff, all five root gates passed with 839 fake/no-key
tests in 78 files. Its startup marker confirmed diagnostics v2;
backend health, `/start` and `/api/sample/config` return 200. The backend watcher
reloaded the code, with verified app PID 14632 on 4000; frontend PID 20712 stays
healthy on 3000. Tracked process identities were updated. Separate runtime logs
remain under `C:/Users/minat/AppData/Local/Temp/clipbuilder-runtime/run-20261005-120045/`;
safe backend diagnostic JSON goes to `backend.stderr.log`. No paid request,
environment/provider resource change, additional service or Git mutation was
performed. Readiness and fake results do not establish the remedy for HTTP 400.

## Local analysis and console fixes — 2026-10-05

The owner authorized implementing and validating the five planned local fixes.
[CL-007](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#local-implementation-and-validation--2026-10-05)
owns the current implementation, synthetic browser states, exact checks and
remaining gates. Primary-error preservation, immediate/stable wait rotation,
development/production CSP and shared Turnstile loading are implemented.
Preload checks found no owned duplicate and no warning in the checked dev/
production paths; the original trigger remains unconfirmed. A fresh strict scan
of 17 backend stderr files found zero valid analysis diagnostics, so the
historical provider cause remains unknown. Prior 2026-10-04 logging-only and
implementation-deferral statements below describe their historical scope.

Only injected fake/no-key checks and temporary synthetic browser servers ran;
the owner app stack was not restarted. Neither real input path, genuine AI
quality nor provider/cloud deletion is proved. Paid verification remains
owner-only with keys, enabled live capabilities and recorded approvals. No
local AI runtime/weights, cloud change, deployment or Git action occurred.

## Priority backend diagnostics — 2026-10-04

The owner requested existing-log diagnosis first and explicitly allowed logging
implementation if those logs were insufficient. A content-safe scan of all 30
saved backend stdout/stderr files found no `ANALYSIS_PROVIDER_FAILED`, model or
cleanup error code, or fixed Google failure rule. The current run's backend logs
were 42 bytes stdout and 147 bytes stderr before edits. Code inspection confirmed
that startup/shutdown were logged, while analysis errors were only sent in safe
response JSON. The ignored local supervisor also redacted unrecognized output,
so new records would have been discarded without updating the capture path.
The same backend-owned strict validator now permits only structural diagnostic
JSON through that filter; every other unknown line stays redacted. The exact
cause of the owner's historical failed attempt cannot
be recovered from these logs. No speculative provider/configuration diagnosis
or processing fix is claimed.

The condition was satisfied, so only meaningful diagnostics were implemented.
Normal executable startup now enables bounded JSON stderr records for fixed
analysis actions and stages, with opaque request correlation, elapsed time,
safe codes/rules and distinct application/upstream statuses. First failed-phase
records are emitted before cleanup runs, with separate cleanup failures afterward.
There is no raw exception, SDK payload/message/stack, media, prompt, transcript,
private file/session ID, URL, credential or capability in those records. Direct
composition/tests stay silent unless a fake sink is injected. Logger failures
do not change outcomes; processing response semantics and every other planned
fix remain unchanged.

The owning [CL-007 follow-up](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#priority-backend-diagnostic-follow-up--2026-10-04)
lists exact file ownership, implemented scope and the next diagnosis/fix-plan
sequence. Once the owner triggers a new attempt, correlate the response's safe
request ID with the earliest failed phase, classify its status/rule, reproduce
with fake transport data, then document the proven processing remedy before
implementing it. No agent-triggered paid attempt or historical success is implied.

### Diagnostic logging verification and activation

All five settled root checks passed: `corepack pnpm format:check`, `lint`,
`typecheck`, `test:unit` and `build`. The unit suites passed **785 tests in 76
files**, including **276 backend tests**. New coverage checks strict log-record
validation, privacy/bounds, failing sinks, concurrent request isolation, safe HTTP
correlation and a first generation failure followed by cleanup failures, with
exact fake provider counts. Ordinary checks hardcode fake/paid-off before imports,
load no env file and reject external network access. Next's generated type imports
were restored to the dev paths after build; frontend typecheck then passed again.
The local frontend artifact inventory passes with nine routes, but its 26 external
package links still leave strict target-platform release acceptance unverified.

An isolated synthetic emitter exercised the new launcher's exact capture filter
and shared backend validator; only its launch command was replaced for this check.
Four valid records survived, including a synthetic generation HTTP 429 and distinct
application 500. An additional record containing a payload field was rejected,
and its private sentinel did not appear in the captured log. This is **fake
capture evidence, not the owner's failure diagnosis**. It made zero provider calls,
opened no listener and exited with both foreground processes complete. Ignored
evidence is in `artifacts/local-run/qa-analysis-diagnostics/`; it remains excluded
from release inputs and subject to the existing deployment artifacts checkpoint.

The restart skill verified 20 old owned process identities, stopped frontend
before backend, and proved zero survivors and zero listeners on ports 3000/4000
through a three-second stabilization check. Replacement startup used normal
owner configuration outside the sandbox, backend before frontend. Backend
supervisor **23612** / listener **12820** owns port **4000**; frontend supervisor
**14984** / listener **24780** owns port **3000**. Health, `/start` and public
sample configuration returned 200. No processing request was made. Healthy
instances remain running at `http://localhost:3000/start`.

The new validated capture path is
`artifacts/local-run/restart-20261004-analysis-logs/`, outside Git. The first failed
phase in [backend stderr](C:/Users/minat/Work/ClipBuilder/artifacts/local-run/restart-20261004-analysis-logs/backend.stderr.log)
will be the primary diagnosis source for the next owner-triggered attempt.
Other logs: [backend stdout](C:/Users/minat/Work/ClipBuilder/artifacts/local-run/restart-20261004-analysis-logs/backend.stdout.log),
[frontend stdout](C:/Users/minat/Work/ClipBuilder/artifacts/local-run/restart-20261004-analysis-logs/frontend.stdout.log),
[frontend stderr](C:/Users/minat/Work/ClipBuilder/artifacts/local-run/restart-20261004-analysis-logs/frontend.stderr.log).
Lifecycle records preserve supervisor/listener creation identities; old records
were marked stopped after verified shutdown. No environment/runtime configuration,
retained master, cloud resource or Git state was changed.

The exact historical cause and the processing remedy are still pending. Request
or cleanup response semantics, prompt/model/budget, message rotation, CSP and
Turnstile loading are unchanged by this diagnostic implementation. After a new
manual attempt, classify the earliest safe failure record, reproduce it in fake
mode and document a proven processing fix before implementation. No agent-paid
attempt, live-success/quality claim or real-deletion proof was produced.

Fake/no-key analysis and injected diagnostic checks are available; real Gemini
quality and actual cloud/provider deletion remain owner-run checks with keys,
enabled live/paid capabilities, storage/renderer access and recorded approvals.
No local AI model/runtime/weights are used. Preserve both retained masters.

## Latest owner manual attempt and planned corrections — 2026-10-04

After the Exit restart, the owner reported another retained-sample Find moments
attempt: messages began rotating only after roughly two minutes, then analysis
failed with the safe `ANALYSIS_PROVIDER_FAILED` message and HTTP 500 from
`/api/analysis/run`. The reported console also contained blocked inline styles,
duplicate Turnstile SDK loading and an unused CSS preload warning. The exact
provider phase/status has not been recovered; an application 500 does not prove
Google returned 500. Do not treat console style/preload warnings as its cause.

The owner requested **planning and documentation first**. The ordered file-level
plan, confirmed code defects, uncertainties, official references and unchecked
acceptance criteria belong to
[CL-007's analysis failure and console follow-up](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#owner-requested-analysis-failure-and-console-fix-plan--2026-10-04).
The initial documentation-only pass prioritized safe failure diagnosis, rotation from the accepted action,
development/production style policy, shared Turnstile loading and remaining
preload attribution. In that initial pass no application code or local configuration changed and no
restart, provider/cloud request, paid attempt or Git mutation occurred in this
planning pass. Existing logs were filtered for fixed diagnostic codes only;
they supplied no detailed Google failure rule. The owner was asked for the
existing response's safe `code` and `ruleId` only.

The earlier 778-test and five-gate record below remains historical evidence for
the pre-plan code. That planning pass added no application test or live-success evidence;
the priority diagnostic follow-up above adds only logging and synthetic regression coverage.
Fake/no-key verification can cover all proposed regressions with injected
transports; genuine analysis still needs the configured keys, live/paid
capabilities, storage/renderer access and recorded approvals. Both real input
paths and physical cloud/provider deletion remain owner-run checks. No local AI
model/runtime/weights are used. Preserve both retained masters and quiet Exit.

## Owner-reported Gemini setup — 2026-10-04

- [x] Owner created a Gemini API key for the existing project and manually
  populated `GEMINI_API_KEY` in ignored `apps/backend/.env.local`.
- [x] Owner completed a USD 5 Gemini API prepayment.
- [x] Owner reported saving a USD 5 monthly project spending cap after following
  the Spend → Monthly spend cap → Edit spend cap instructions.
- [ ] Independently verify key/model access and paid-project readiness in the
  separately authorized live checkpoint; no credentialed request was made.
- [x] Owner reports manually saving the Turnstile sitekey and secret in the
  backend's ignored `.env.local`.
- [x] Owner confirms the widget dashboard allows `localhost`; the backend's
  ignored runtime metadata now records that expected hostname.
- [ ] Verify genuine Turnstile validation during the owner's manual test.
- [x] Normal local startup validates the configured grant key format, without
  inspecting or printing the secret. `PROCESSING_GRANT_KEY` accepts the key
  directly; `v1` stays in code and the old entry remains readable for migration.
  Random generation and private storage remain owner-managed.
- [x] Owner authorizes one existing renderer image build and private revision
  update, plus local processing setup for their own manual tests.
- [ ] Owner confirms source rights and Google audiovisual transfer in the
  application before manually dispatching analysis.

Automatic reload was disabled in the owner's prepayment view and the setup
instructions keep it off; no final dashboard inspection or account usage polling
was performed. Google documents an approximately ten-minute enforcement delay,
so neither the monthly cap nor the prepaid balance is an exact dollar cutoff.
Gemini credits do not pay storage/build/Cloud Run charges. Funding and a monthly
cap are not a test-spend or media-transfer authorization.

The [current provider guide](PROVIDER_SETUP.md#current-gemini-setup--2026-10-04)
records the key/billing/limit steps and next local Turnstile setup. Private keys
and `.env.local` contents were not read, copied or logged; account identifiers
were not recorded. No
application restart, renderer rollout, provider call or live-quality verification
was performed in this setup/documentation pass. Keep paid processing disabled
while completing prerequisites; existing fake results remain synthetic only.

## Local restart preflight — 2026-10-04

The owner requested a full local restart and reports selecting `FAKE_MODE=false`
and `PAID_DEMO_ENABLED=true`. Those switches select real mode and permit paid
capabilities, but do not supply the approved runtime validation stage. Normal
backend startup reported `configuration_validation_stage_missing` and never
opened port 4000. This is startup evidence, not inspection of a private file.

The old frontend supervisor 12240 and backend supervisor 7904 were verified
against creation times, repository/service commands, descendants and listeners.
Shutdown removed all 10 frontend and nine backend identities and released ports
3000/4000 through stabilization. The replacement backend supervisor 23504 failed
readiness; its nine owned identities were then removed, with zero survivors and
zero listeners through stabilization. The frontend replacement was not launched
because its backend prerequisite failed. Both local apps are stopped.

The ignored supervisor records only a fixed category for this startup error.
Content-safe logs remain under
`artifacts/local-run/protected-sample-20261004/backend.stdout.log` and
`backend.stderr.log`; no raw startup/configuration values were logged. No private
environment/runtime file was read or changed, and no provider request, cloud
update, sample transfer or paid dispatch occurred. The `PROCESSING_GRANT_KEY` secret, expected
Turnstile hostname and genuine provider readiness remain owner/live checks.

The existing Gemini system policy was inspected without changing it. It already
requires source-clock word timing, anonymous turns, quoted evidence and zero to
four complete 10–60-second moments, rejects source instructions and invention,
and forbids tools/search. A first authorized analysis provides the baseline for
any later owner-directed prompt revision. Fake mode remains key-free and
synthetic; real understanding requires the configured Gemini provider, not a
local model.

## Successful local startup follow-up — 2026-10-04

The subsequent local configuration correction supersedes the stopped-app state
in the historical preflight above. Health, `/start` and `/api/sample/config`
return 200 after verified shutdown and normal startup. The fixed requirement
codes report Google transfer approval, paid-project confirmation, Turnstile
hostname and renderer connection as remaining processing prerequisites, with
no missing/invalid grant-key code. Paid routes remain unavailable and dispatches
remain zero. This diagnosis comes from content-safe startup categories, not
reading ignored configuration. No provider, storage or processing request was
made; the apps remain running. All five fake-only root gates pass, including
721 synthetic tests. These checks prove no genuine AI or widget quality.

## Verified private rollout and local handoff — 2026-10-04

The corrected allowlisted image from `4c0f510` passed Cloud Build in 130.972
seconds, including Linux synthetic render, frame/audio decode, scratch/cancel
checks and production import/binary verification. Artifact Registry agreed with
the immutable digest:
`sha256:3f404f3c5daa620f501558bf4103cbe04862e0b061b2d67834a0ff09e4d69377`.
The existing private service was updated by that digest. Ready revision and
serving traffic match; IAM, attached identity, environment, secret mounts,
4 CPU/8 GiB, min zero/max one, concurrency two, timeout and two-operation cap
were preserved. Anonymous health returned 403; ADC-authenticated health returned
200 with the exact content-free response. No processing endpoint was invoked.

The ignored backend runtime now connects that renderer, records `localhost`
and the owner-authorized cloud/Google-transfer/reported paid-project setup, and
keeps `paidValidationStage=analysis`. Secret files and environment switches were
not inspected or changed. The switches still determine fake/paid eligibility.
Verified shutdown removed 21 owned process identities, with no survivors and
no listeners on 3000/4000 through three-second stabilization. Normal startup
then verified backend health, `/start` and `/api/sample/config` at 200.
Public flags report live mode, local media/sample/widget configured and analysis
enabled; assembly/render remain disabled. All three owned temporary build
contexts and synthetic media were removed; retained masters were untouched.

Current local ownership: backend supervisor 14956/listener 18136 on 4000;
frontend supervisor 21820/listener 20804 on 3000. Creation times and listener
ownership were reverified. Content-safe stdout/stderr and ownership records are
under `artifacts/local-run/restart-20261004-renderer-connected/` outside Git.

Owner manual sequence: Use sample → Find moments → inspect results → Clear and
confirm cleanup. Restart the backend after verified Clear before testing the
upload path; the current two admitted-action cap covers one input/analysis flow
per backend process. The private renderer cap covers two analysis proxy jobs.
The owner removed the separate preview notice/checkbox on 2026-10-04;
**Find moments** is the explicit per-flow initiation. Source rights, operator
Google-transfer approval and genuine widget validation remain prerequisites.
Gemini access/quality,
real-media deletion and final assembly/export remain unchecked. Agent Gemini
and real-media processing dispatches were zero; image compute used the approved
cloud resources. Fake mode still needs no keys and supplies synthetic results.

## Owner manual failure and local correction — 2026-10-04

The owner's sample attempt returned `STORAGE_FAILED` before analysis. Existing
private renderer request statuses showed upload admission 200 followed by
successful cancellation. A credential-free loopback check reproduced the
underlying Fetch rejection of Google's HTTP 308 chunk acknowledgement. The
backend now receives those acknowledgements in manual redirect mode, validates
their exact Range and rejects any Location header. It never follows a redirect.
No new sample-copy, proxy or Gemini operation was performed by the agent.

The verification widget now runs in interaction-only mode and opens a centered
dialog for required interaction or failure. Retry repeats only verification;
cancel ends the pending attempt. Synthetic callback/lifecycle tests and an
isolated mock-widget browser check cover this behavior. Actual widget and media
acceptance remain the owner's manual checks. The renderer image, operating
switches, credentials and retained master were not changed.

## Proposed bounded execution

This is an owner-only manual paid-check plan. The agent may prepare and verify
fake-mode code, and separately authorized private renderer build/revision work,
but does not dispatch the media admission, Google upload or Gemini generation.
The prior combined agent-run update/paid-test proposal is withdrawn. On
2026-10-04 the owner authorized the existing private renderer update and rejected
the assistant-added requirement to repeatedly choose a dollar ceiling.
The initial Cloud Build failed its synthetic output proof before publishing or
changing the service. Local native reproduction identified stale validator calls,
the default full-range color format and an unsupported raw-audio muxer. These
were corrected and a synthetic render/decode/cancel proof passed. One corrected
build retry completes the already-authorized update; each build retains its
1,200-second timeout, with one private revision update and the existing resource
and operation caps. No numerical
cloud ceiling is claimed. Gemini funding remains separate from cloud charges;
the agent must not trigger paid media tests.

1. Owner confirms one English, owned/licensed 15-second–20-minute source within
   500 MiB, consent to **Google AI** audiovisual transfer and paid-project data terms
   before their manual analysis dispatch. Earlier private
   renderer rights approval does not authorize this new AI transfer. Keep media,
   filenames, identifiers and keys out of the evidence record.
2. After explicit authorization, use existing CL-006 resources/workflow for
   **one corrected image and one private revision update**. Preserve IAM, storage,
   expiry schedule, resource ceilings and licensing. No resource creation or
   public deployment. The old image lacks the new proxy read/release routes and
   inspection profile; analysis rejects it before Gemini. Record image digest
   and content-free health/authentication checks.
3. Owner fills the blank credential entries from `apps/backend/.env.example`
   in that app's ignored `.env.local`: Gemini key, `PROCESSING_GRANT_KEY` secret and
   Turnstile site/secret. The same ignored `.env.local` supplies
   `PRIVATE_RENDERER_ORIGIN`, `TURNSTILE_EXPECTED_HOSTNAME` and approval flags;
   runtime JSON is removed. Normal real/paid defaults and four approvals are on;
   paid-off overrides them all. Only after authorization select `PAID_VALIDATION_STAGE=analysis`,
   `FAKE_MODE=false` and `PAID_DEMO_ENABLED=true`. Composition fixes the dispatch
   allowance at **2**, with assembly/render/image capabilities disabled. Never
   inspect/print private values. Follow AGENTS.md for verified local startup.
4. One browser confirmation permits **one upload admission**, **one private proxy
   preparation**, **one Google Files upload** (start/finalize each once), at most
   **90** readiness GETs at one-second intervals, and **one `gemini-3.8-flash`
   generateContent call** with at most 65,536 output tokens and a 24-MiB proxy.
   No generation retry/tools/search/raster calls or final render. Two single-use
   Turnstile checks bind hostname/action/session. Browser/control work is bounded
   at 840 seconds; Google work at the configured 180 seconds.
   For the fixed retained sample, the upload admission instead fingerprints the
   generation-pinned master and transfers bounded chunks server-to-storage into
   one disposable processing copy. The browser does not download and reupload
   it; the same inspection, proxy, Google and two-action limits apply. The
   retained master never enters the processing cleanup binding.
5. Compare normalized transcript/anonymous turns/timing with the source; inspect
   complete 10–60s boundaries and honest zero-to-four candidates. Refresh committed
   success and verify **zero new upload/preparation/AI calls**. Review read-only
   playback/transcript/notes at phone/tablet/laptop/short heights, keyboard/zoom/
   reduced motion. No editor or manual range path.
6. Delete the Google file and verify absence by GET 404, or by a complete
   authorized Files list when Google returns 403 for the missing private file;
   a denied/incomplete list or a still-present file cannot confirm deletion.
   Release the exact analysis proxy
   before publication. Clear and verify source-generation absence. Failed Google
   deletion blocks intake and retains a process-local obligation; explicit Clear
   can retry deletion without AI. The owner plans two manual input-path tests:
   retained sample and upload of the same source. Each requires its own browser
   confirmation; neither authorizes agent dispatch or automatic retries.

## Current owner Exit behavior — 2026-10-04

**Exit** resets the browser workflow and app cookies, returns home, and starts
quiet bounded cleanup. The visitor never retries deletion. Its 204 response is
session-reset evidence only. A valid backend session is canceled/revoked before
deleting disposable copies; a stale cookie after restart cannot reconstruct old
bindings, so private expiry and separate Google Files expiry remain fallbacks.
Local upload deletion continues across navigation under the workspace lease;
failed deletion keeps a private clearing tombstone for next-entry retry. Streaming
sample selection never invokes uploaded-file deletion. Both retained masters stay
protected. The old blocking cleanup/retry statements below are superseded by this
owner decision; their historical evidence remains.

Next's [after-response lifecycle](https://nextjs.org/docs/app/api-reference/functions/after)
owns the frontend handoff. Current local routing remains pinned to the control API;
hosted routing and shutdown/expiry acceptance remain CL-015 gates. Fake/no-key tests
exercise failure and pending cleanup without real media or credentials. They do not
prove physical cloud deletion. Real sample/upload checks and paid AI quality remain
owner-only; agent automation never triggers analysis or another paid media operation.

## Evidence and limits

### Owner manual failure and metadata-only diagnosis — 2026-10-04

The owner's later manual attempt passed source upload, proxy preparation and
proxy access (existing private renderer request statuses all 200). Cancellation
also returned 200. Its analysis result was then replaced by the old provider
cleanup error, displayed as feature unavailable. The cleanup screen always
called this a local deletion failure even when only remote deletion failed.

The owner explicitly authorized a metadata-only Google diagnostic. Files list
returned 200 with a complete empty result; a GET for a randomly named nonexistent
file returned 403. The old adapter accepted only GET 404 as proof of deletion,
leaving an already absent file pending. This confirms the cleanup failure;
the original generation outcome was discarded and cannot be reconstructed from
that error. No upload, generation, deletion or retained-master access occurred
during the diagnostic. No Google file remained under the configured key at that
check. Metadata/status alone does not prove transcript or candidate quality.

The corrected adapter checks an authorized complete list after GET 403, within
the existing cleanup deadline and a fixed three-page bound. Denied access,
incomplete pagination or a matching file keeps cleanup pending. Empty DELETE
responses are accepted without SDK JSON parsing. Definite upload-start rejection
does not create a phantom cleanup obligation. Safe phase/status rule codes retain
the original analysis failure alongside cleanup failure; raw provider payloads
and file identifiers are never exposed. Explicit cleanup retries do not rerun AI.

The owner also requires rotating analysis wait messages, local-only sample CTA,
and sample selection cleanup without uploaded-file OPFS deletion. Both retained
masters stay protected; disposable processing copies and genuine uploads retain
normal cleanup. A control restart invalidates old sessions, so a stale browser
cleanup fence must not be bypassed by treating an invalid cookie as deletion.
Live quality and the owner's next sample/upload/Clear trials remain unchecked.

All five root gates passed after the correction: format, lint, typecheck,
761 synthetic tests across 72 files, and build. The Next development references
were restored and frontend typecheck passed again. Local non-metered health,
`/start` and public config returned 200. Backend listener PID 5464 / supervisor
14956 serves 4000; frontend listener PID 20804 / supervisor 21820 serves 3000.
Both supervisor creation times and owned trees were checked; no app was launched
or stopped. Content-free process records and separate stdout/stderr remain in
ignored `artifacts/local-run/restart-20261004-renderer-connected/`. The diagnostic
helper exited with no listener. The owner's Chrome tab is not connected to the
available browser tool, so its current cleanup screen was not directly reset or
verified. No new real upload/analysis, cloud mutation, deployment or Git action.

### Explicit full local restart after cleanup correction — 2026-10-04

The owner requested the restart skill after the correction. Its kill/run sequence
stopped frontend before backend, captured 20 creation-time-bound process identities
and verified zero survivors and zero listeners on 3000/4000 after a three-second
stabilization check. Fresh normal-config launches started backend before frontend.
Backend health, `/start` and `/api/sample/config` returned 200. Final ownership
checks again found zero old survivors. No secrets/configuration were inspected or
changed, and no paid/provider/media action was triggered. Public flags retain
live analysis and protected local sample availability; assembly/render stay off.
Automated fake/key-free evidence above remains separate from owner live testing.

Backend listener PID 8012 / supervisor 25284 serves 4000; frontend listener PID
7308 / supervisor 21096 serves 3000. Content-free runtime identities and separate
`backend.stdout.log`, `backend.stderr.log`, `frontend.stdout.log` and
`frontend.stderr.log` are under ignored
`artifacts/local-run/restart-20261004-cleanup-fix/`. Old runtime records are marked
stopped and their logs retained. The healthy apps remain running at
`http://localhost:3000/start`. Existing browser sessions predate this control epoch;
the owner's disconnected Chrome tab and next live sample/upload/Clear trials
remain manually verified items. No tests were rerun solely for process restart.

Record only model/config revision, image digest, counts, bytes, phase durations,
tokens when available, authorized operation limits, safe rule codes and
verified deletion. No account usage polling or content/capability/key logging.
Alerts are advisory; interrupted calls can incur usage.

The original remains private after analysis for later selected-range work;
Clear/failure/expiry delete it. Results/receipts are journaled only in the browser.
Refresh of in-flight/lost work fails without redispatch. Control restart invalidates
grants/receipts and relies on independent cloud expiry. Google cleanup obligations
are process-local; crash/uncertain upload can need the documented 48-hour Files
expiry fallback. Explicit file deletion does not prove deletion of separate abuse
records. These are remaining release limitations, not outage guarantees.

Unchecked: maximum-envelope stress, live speaking-face quality, CL-008–011
assembly/preview/export, phone support, sample/public rights, complete font/codec/
telemetry notices, distributed paid controls and public deployment.

References: [Files](https://ai.google.dev/gemini-api/docs/files),
[structured output](https://ai.google.dev/gemini-api/docs/structured-output),
[paid-service terms](https://ai.google.dev/gemini-api/terms),
[Turnstile configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/),
[private renderer setup](CLOUD_RUN_RENDERER_SETUP.md).

### Exit follow-up settled local verification — 2026-10-04

All five root gates passed: `corepack pnpm format:check`, `lint` (zero warnings),
`typecheck`, `test:unit` (778 synthetic tests across 75 files), and `build`.
The new Exit route is explicitly included in the nine-route release inventory;
the first inventory attempt rejected the extra route, then passed after that
allowlist and its negative-fixture expectations were updated. Local output still
has the previously deferred 26 external package links; no hosted release is proven.
Development type references were restored after build and root typecheck passed.

An isolated fake UI harness rendered the actual SampleExperience with synthetic
configuration and mocked navigation/cookie transport. Exit reached its landing
view with exactly one cookie-reset request; Get Started then showed empty intake
with the Exit CTA. No real file, OPFS source, ADC, provider or paid request was used.
The test tab was closed and its two creation-time-bound helper identities and
listener were confirmed absent. Screenshot evidence is ignored under
`artifacts/qa/session-exit-20261004/fresh-intake.png`.

The restart skill stopped frontend before backend, captured the owned process trees (20 identities in the initial restart,
21 observed through the final restart),
and verified zero descendants/listeners through three-second stabilization.
Fresh normal-config launches followed backend-before-frontend readiness; no
secrets or runtime settings were read or changed. Final identities and readiness
are recorded below after their explicit checks. The owner's separate Chrome tab
remains outside the browser tool; its prior session and real deletion require
owner observation. No agent paid test, cloud mutation, deployment or Git action.

Final restart verification is recorded after the last instance checks below.
The final route accepts Next's non-null empty POST stream, rejects content and
bounds a stalled body at two seconds while releasing its reader. Cookie-response
bodies are canceled; storage write denial still permits independent workflow
projection removal. Both regressions have synthetic coverage. A startup review
initially did not recognize shutdown evidence; a fresh read-only ownership/port
check confirmed zero survivors and listeners, and the same launch was accepted.

Final healthy stack: backend supervisor **15972**, listener **23472** on **4000**;
frontend supervisor **8864**, listener **6632** on **3000**. Both creation times
and full ten-process trees were verified. Backend health, `/start` and
`/api/sample/config` all returned **200**. Healthy apps remain running at
`http://localhost:3000/start`. Old records are marked stopped; final records and
content-safe logs are in ignored `artifacts/local-run/restart-20261004-exit-final/`.

Logs: [backend stdout](C:/Users/minat/Work/ClipBuilder/artifacts/local-run/restart-20261004-exit-final/backend.stdout.log),
[backend stderr](C:/Users/minat/Work/ClipBuilder/artifacts/local-run/restart-20261004-exit-final/backend.stderr.log),
[frontend stdout](C:/Users/minat/Work/ClipBuilder/artifacts/local-run/restart-20261004-exit-final/frontend.stdout.log),
[frontend stderr](C:/Users/minat/Work/ClipBuilder/artifacts/local-run/restart-20261004-exit-final/frontend.stderr.log).

Changed Exit responsibilities: frontend `session.exit.ts`, workflow/header and
privacy copy, session persistence/provider and workspace lifetime; frontend and
backend session-exit routes; control admission and source cleanup orchestration;
release route inventory; matching synthetic tests and the source of truth,
service guides, CL-007 and CL-015. Previous pending playback/challenge/Gemini
corrections were preserved. No changes were staged or committed.
