# CL-153 — fix real Codex clip processing and inspect camera behavior

Status: fixed, fake/static validated and one approved real clip processed/exported;
camera inspected on that sample. Broader owner/visual/release acceptance remains open.
Depends on CL-150–152. Plan filed before implementation.

## Explicit owner authorization — 2026-10-30

After two clip-preparation failures, the owner explicitly approves fixing and
testing with the existing sample until one clip processes successfully in real
paid Codex mode, including checking speaker/face camera behavior. This is the
latest owner decision and supersedes earlier agent-no-paid/owner-only testing
restrictions for this narrowly bounded local acceptance. Use existing ChatGPT
Codex sign-in and the owner's normal operating settings. No Gemini fallback,
cloud access/change, deployment, push, Git mutation, credential/configuration
inspection or automatic retry is authorized. Preserve existing CL-152 work,
completed analysis where possible, all saved/retained media and private logs.

Source content, transcripts, prompts, model results, frames and output remain
outside Git and normal diagnostics. The approved sample may be processed and
inspected privately for this task; committed evidence contains only aggregate
outcomes and synthetic regressions. Do not create a saved draft/checkpoint
without the owner's separate Save opt-in. Do not replace or delete the master.

## Diagnosis and execution plan

Content-free logs show successful transcription/moment selection and native
frame extraction, followed by codex_process_failed in both clip-planning calls.
The exact cause is not yet confirmed; do not assume the new sampler is at fault.

1. Inspect code, safe process diagnostics and official CLI/structured-output
   requirements. Reproduce the actual image/schema command with synthetic input
   and an installed-CLI loopback fake provider before spending more allowance.
   Never inspect auth files or expose raw child stdout/stderr from real calls.
2. Fix only the confirmed launch/schema/protocol or downstream processing bug.
   Keep tolerant/advisory handling of usable model output, image/clip/byte limits,
   provider isolation, explicit retry and tool refusal. Add meaningful synthetic
   regressions including actual CLI image/schema protocol where applicable.
3. Run focused fake/paid-off/no-key/static checks. Preserve healthy services and
   reload the current backend/worker with verified lifecycle ownership when
   necessary. Use the existing protected normal local app flow.
4. Reuse completed sample analysis if the running host can preserve it; otherwise
   run a fresh bounded sample flow. Process only one selected clip at a time.
   Each necessary real retry is an explicit action under this owner approval,
   never a new app automatic retry policy. Stop inference on successful processing.
5. Inspect source versus portrait preview/native output at supported speaker
   changes, including speaker labels and held/uncertain decisions. Report actual
   mismatches and fix confirmed camera-path defects with fake regressions before
   another necessary real attempt. Do not claim one sample proves general quality.
6. Validate the settled work and document precise fake versus real outcomes,
   process/temporary cleanup, remaining uncertainty and no deployment/Git action.

Initial whole-file allocation (expand before further implementation if needed):

- `apps/backend/local/codex-exec.ts` and `.test.ts` — confirmed CLI/protocol fixes.
- `apps/backend/local/codex-ai.ts` and `.test.ts` — confirmed planning wire fixes.
- `packages/contracts/local/codex.ts` and `.test.ts` — wire schema if required.
- `test/local-codex-cli.proof.ts` — optional installed-CLI synthetic loopback proof.
- `test/local-codex.proof.ts` — synthetic integrated regression when changed.
- This packet, `docs/tickets/README.md`,
  `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`, and
  `docs/architecture/LOCAL_CODEX_AI.md` — authority/evidence and narrow design fix.

Allocation refinement before source edits: add
`apps/backend/local/codex-schema.ts` and `.test.ts` for the CLI wire-schema
compatibility boundary. An actual approved sample planning call failed with
invalid_json_schema: the provider rejects a Unicode-property regex from the
shared picture-brief schema. The installed-CLI synthetic image/stdin proof
already passes, ruling out argument parsing. Remove only unsupported Unicode
property patterns from the wire copy, retaining all ordinary ID patterns,
structure/bounds and the original runtime schemas. Do not change shared product
validation to accommodate a provider wire limitation.

Startup allocation refinement before editing: include
`apps/backend/local/runtime.ts`. Normal source reload again failed its fixed
five-second worker readiness window, leaving the fresh acceptance request at
503 before inference. Give cold native worker startup a bounded thirty-second
window, preserving probe timeouts, failure cleanup and all provider gates.
Verify a full backend-only owned restart, preserving the frontend/configuration.

## Acceptance gates

- Confirm and reproduce the failure; synthetic checks prove the actual fix and
  keep metered call counts, protocol refusal, privacy and cleanup intact.
- One clip reaches completed processing with actual Codex and local models on
  the authorized sample. Inspect actual face/camera behavior and report limits.
- No ignored env/auth read, Gemini call, retained asset deletion, hidden retry,
  quality/limit reduction, cloud operation, deployment or Git mutation.

Fake mode remains API-free with fictional/injected AI and synthetic media; it
does not establish real voice/face quality. This packet separately authorizes
the real local Codex acceptance using installed local models and saved sign-in.
Hosted/Gemini/release/rights/general quality acceptance remains outside this task.

## Evidence

Confirmed failure: an approved real planning diagnostic on a private processing
copy reused the existing completed sample analysis. It made one actual planning
attempt; the provider returned invalid_json_schema for a code-owned picture-brief
Unicode-property regex. This happened before a generated result, after successful
frame extraction. A private bounded stderr/stdout capture remains outside Git;
normal diagnostics/configuration/authentication were not exposed. Initial
standalone diagnostic setup failed workspace/bundle guards before any inference;
the corrected source-preserving runner created its own admitted processing copy.

The fix clones the CLI output schema and omits only Unicode-property patterns
requiring a JavaScript regex flag. It preserves ASCII IDs, required fields,
closed objects, limits and original runtime schemas. Two focused schema tests
plus fourteen existing CLI/process tests pass (16 checks). The installed CLI
before/after proof uses two synthetic images, isolated empty authentication
home and a no-auth loopback fake provider: old schema receives one rejection,
adapted schema receives one success, with no automatic retry. Both cases pass
in 5.46 seconds. Shared/local types, root test types, scoped ESLint and changed
code formatting pass. CL-152's prior native proof remains separate evidence.

Normal source reload also reproduced the worker readiness failure. A verified
backend-only shutdown removed eight owned identities with no survivors/orphans,
preserving frontend 13720 / 3000. The worker now has a monotonic thirty-second
readiness deadline with individually bounded probes and unchanged cleanup/gates.
Normal dev startup rebuilds the current worker and returns healthy endpoints.
Final verified identities: backend 6352 / port 4000, worker 19128 / port 4200,
supervisor 21500; frontend remains 13720 / port 3000. Health, /start and sample
config return 200. Capabilities remain provider-ai / codex / ready. The live host
is idle with exactly one ready clip; zero Codex call/input scratch artifacts and
zero remaining owned private-test/CLI proof runners were observed.

Content-free lifecycle record and startup logs:

- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl153-app-20261030-20860752/backend.runtime.json
- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl153-app-20261030-20860752/backend.stdout.log
- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl153-app-20261030-20860752/backend.stderr.log

Fresh real acceptance is running through normal protected frontend/app routes,
using the actual openPickedFile adapter and a separate full-sample processing
copy. It selects one 30-second manual range around the detected anonymous
speaker change while requesting fresh transcription and one AI suggestion.
An initial private client used the retired raw-source proxy path; switching to
the current file adapter fixed that harness issue without a product change.
Its first full analysis was canceled by the Node test client's five-minute
headers timeout before selection. The corrected bounded Node HTTP client
resumes the already uploaded live workspace and checks for completed analysis
before explicitly resubmitting the canceled request. No saved draft/checkpoint
or cached-result replay was added, and no additional provider attempt occurred
in the canceled CPU pass.

### Authorized real result

The resumed normal frontend/API run completes fresh local transcription and real
Codex selection in 439 seconds, producing 1,103 timed words and two anonymous
speakers. One selected 30-second manual range is then planned, prepared and made
review-ready at 504 seconds; final native export completes at 564 seconds. The
clip finishes ready with one plan call, one local illustration call and one
native render call. One AI suggestion/selection call was used. No Gemini/image
generation API call or automatic provider retry occurs. Total agent real Codex
attempts for this investigation: one rejected schema diagnostic, one fresh
selection and one successful clip plan; the earlier canceled CPU pass never
reached Codex selection.

Native MP4 inspection confirms 30.000 seconds, video and audio streams, 406x720
portrait at the source's 25 fps under the existing Original export profile.
No export/profile/source-quality setting was changed. The downloaded review copy
has identical bytes to the real app export and is preserved under the owner's
Downloads/ClipBuilder exports directory; the exact private file link is handed
to the owner outside repository documentation. No project/draft was saved.

Private source versus output contact sheets were inspected at six points each,
including immediately around the camera change. The opening/first speaker is
framed on the left; the second speaker on the right. The real plan maps spk_0 to
person_1 at confidence 0.91 and spk_1 to person_2 at 0.97. The compiled cut is at
frame 270 / 9 seconds, after the second speaker decision begins at frame 240 /
8 seconds and satisfies the existing one-second sustained-speech gate. Rendered
frames at 8.8 and 9.2 seconds confirm the intended left-to-right cut and stable
portrait framing. This confirms this sample's speaker association/camera switch,
not continuous lip tracking or general camera accuracy.

Observed limitations: the opening 3.9 seconds have low-confidence/unknown speaker
association and retain the opening crop. Base words contain ten unassigned, ten
spk_0 and fifty-five spk_1 assignments. Two editable text layers and one local
illustration render; the illustration overlaps part of the lower face at one
review point. Automatic face-aware illustration placement was not part of this
fix, and final visual/editorial/listening/device acceptance remains owner-only.
Do not claim perfect diarization, timing or layout from this one run.

Read-only validate of the settled CL-153 change, preserving CL-152:

- TL;DR: the actual schema rejection is fixed at the CLI wire boundary; fake
  regressions reproduce old failure/new success; one normal real sample clip
  processes and exports with a supported speaker camera switch.
- Verdict: Meets ticket for the confirmed fix, bounded real processing and
  sample camera inspection. No actionable implementation findings.
- Coverage: Covered — plan/allocation, real-failure diagnosis, unchanged runtime
  validation/bounds/provider isolation, CLI regression, explicit real test,
  native export, source/output comparison and temporary process/artifact cleanup.
  Covered — fake tests, shared/local/root test types, scoped lint/format and
  whitespace. Unverified — broader media, continuous tracking, subjective visual/
  editorial/listening/device quality, hosted/Gemini/release acceptance.
- Scope: new codex-schema module/tests, CLI serialization, startup readiness,
  installed-CLI proof and the allocated authority/evidence docs. The existing
  thirteen-file CL-152 worktree remains preserved; nothing staged or committed.

The successful clip reaches the approval's stop condition. No further agent
inference is part of this authorization. Private diagnostic/review captures are
retained outside Git; the obsolete generated probe bundle is removed. App-owned
Codex input/call scratch is reaped by its existing finally paths. The normal app
and processed live workspace remain running for the owner. No deployment,
cloud operation, credential/configuration inspection, retained-media deletion,
saved checkpoint, push or other Git mutation occurred.
