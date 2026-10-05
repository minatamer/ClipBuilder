# CL-007 — Gemini grounded analysis and candidates

## Owner source-shaped candidate review — 2026-10-05

Status: **implementation and local validation complete; owner real-media UI
acceptance pending**. The owner's manual UI run now returns
three usable candidates: safe logs show envelope input, returned/accepted three,
zero dropped, successful proxy release and final packaging at HTTP 200. This
closes the previous envelope fix's manual candidate-display acceptance.

The owner requests source-shaped candidate frames, a responsive horizontal
carousel/slideshow, decoded initial thumbnails and investigation of disabled
Proceed. This dependency-ready follow-up changes candidate review only. Final
assembly/export remain vertical. Preserve existing unrelated changes and all
backend diagnostics/private output capture. No configuration, cloud, Git,
credential or agent-run paid action is included.

### Plan and acceptance

1. Derive candidate display dimensions from the inspected media descriptor,
   including 90/270-degree rotation. Apply the source ratio to every thumbnail
   and selected player; keep portrait/square sources proportional and final
   edited review/export unchanged. Synthetic placeholders state their shape.
2. Horizontal galleries use a scrollable row on larger screens and one full
   card per swipe on phones/tablets. Horizontal selected review reuses the
   existing Video / Agentic Notes / Transcript swipe-and-dot pattern, with one
   mounted bounded player, reachable other choices and back navigation. Put
   horizontal source playback controls below the picture to keep it readable on
   phones; size both within the available slide. Keep
   keyboard access, note seeking, containment and listener/focus cleanup.
3. Load actual local video data and seek each paused thumbnail to its candidate
   start after metadata is available. Handle cached metadata, completed seeks,
   decode failure and source replacement/exit without stale handlers. Show
   loading/failure states rather than an unexplained blank card. No generated
   cloud thumbnail, provider call or retained frame file is introduced.
4. Diagnose Proceed through content-safe public configuration and composition.
   Current public config is live analysis on, assembly/render off; the button
   correctly requires a composed assembly path. Private runtime validation stage
   derives these capabilities. Report the missing stage; do not enable it or
   bypass its independent prerequisites/approvals in this UI packet.
5. Verify synthetic landscape/portrait/square/rotation, native thumbnail events
   and cleanup, carousel keyboard/focus and final portrait behavior. Run focused
   checks and the five root gates; inspect the settled diff against this packet,
   update owning docs and verify normal local non-metered readiness.

`FAKE_MODE=true` with no keys verifies synthetic layouts, playback lifecycle and
the unchanged fake journey. Real frame appearance and paid assembly require the
owner's manual UI test, existing credentials and the applicable enabled live
stage/approvals. No local AI runtime or weights are introduced.

### Implementation and verification

Candidate gallery/player dimensions now follow source shape and display rotation.
Horizontal sources use a desktop scroll row and one-card phone/tablet swipe;
selected review reuses Video / Agentic Notes / Transcript slides at every width.
Controls sit below the horizontal picture. Short screens scroll the video slide
to keep its picture and controls reachable. Portrait/square candidates retain
their proportions; final edited output remains vertical.

The native thumbnail loader installs listeners before loading, seeks to each
candidate start, waits for decoded frame data and completed seeking, and handles
cached metadata, media-tail clamping, decode failure and idempotent cleanup.
Loading/failure states are explicit. No canvas, provider request or frame file
is introduced. Keyboard choice switching, return focus and note seeking remain.

Changed implementation: `candidate.review.tsx`, `clip-review-layout.tsx`,
`portrait-player.tsx`, `sample.module.css`, new `moment-thumbnail.ts` and its
tests, new `candidate.review.test.tsx`, and source-shaped assertions in
`sample.test.tsx`. The frontend guide/source of truth document source-shaped
review. All prior backend output capture and diagnostics remain intact.

All five root gates pass: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit`, `corepack pnpm build`.
There are **983 synthetic tests in 84 files**, including 365 frontend tests;
the two new files cover fourteen thumbnail/layout regressions. Browser checks
use generated synthetic video only: laptop 1366x768, tablet 820x1180, phone
390x844 and short phone 320x568; landscape/portrait/square frames, decoded
candidate-start thumbnails, bounded playback, native swipes, slide dots, note
seeking, keyboard selection/return focus and short-screen control access pass.
The temporary browser tab/server and owned console child were closed; port 4317
and all fixture processes are gone. Temporary executable/media assets were
removed; only content-free verification/log records remain outside Git.

Read-only validation: **Meets the UI packet locally; no actionable findings**.
Dependency direction, native listener/source cleanup, duplicate styles, final
portrait behavior and privacy were reviewed. Readiness GETs for health, /start
and /api/sample/config return 200. Proceed was correctly disabled because public
assembly/render capabilities were false; the owner's subsequent approval is
handled separately by the CL-009 local-stage packet. Actual owner file thumbnail
appearance/device quality and paid assembly are not established by fake tests.
No Git, paid dispatch, credential or cloud change occurred in this UI packet.

## Owner candidate envelope decoding fix — 2026-10-05

Status: **implementation, local validation, all five gates, saved-response replay,
hot reload/readiness and owner UI candidate-display retest passed**. The owner approved
applying the diagnosed format fix. The latest manual request passed renderer
preparation, Transcribe (1,168 words), Flash generation, cleanup and packaging at
HTTP 200. Flash returned three candidate objects as a top-level JSON array. The
normalizer expected only `{ candidates: [...] }`, silently produced an empty
list and the UI displayed a hardcoded editorial claim. Offline diagnostic replay
using the existing wrapper accepted all three through final packaging with no
provider calls; this establishes a decoding bug, not a quality rejection.

### Implementation and acceptance

1. Decode both an object containing a candidates array and a top-level array.
   Keep the original returned output intact in private capture, existing
   per-item tolerance and resource bounds. Do not reintroduce editorial quality
   rejection gates, response schemas or paid retries.
2. State the exact JSON object envelope and candidate fields in the Flash prompt;
   preserve JSON MIME mode, models, request limits and text-only source input.
3. Add safe request-correlated JSON-decoding and normalization diagnostics:
   input shape, returned/considered/accepted/dropped counts, static drop reasons
   and explicit empty reason. Distinguish legitimate empty arrays, unsupported
   shape, malformed JSON and unusable references. Preserve every existing safe
   diagnostic and complete private Transcribe/Flash/raw/normalized capture.
4. Replace the misleading empty-state editorial assertion with neutral generic
   UI copy. Keep the existing no-candidate state and recovery flow.
5. Prove both formats through mocked two-call provider/final packaging, mixed
   usable/unusable items, empty/malformed/unsupported output, fixed candidate
   bound, exact fake call counts and log/capture privacy. Replay the existing
   saved response privately without using it as a committed fixture.
6. Run focused checks, the five root gates and final coverage/cleanup review;
   verify local watcher hot reload, readiness and armed capture. Update the
   narrow owning guides/index with actual evidence. This backend/frontend-only
   fix needs no private renderer image change.

Existing unrelated changes remain preserved; no Git mutation, configuration/
credential change, provider retry or agent-run paid flow is authorized. Fake-mode
tests require no keys and establish local decoding only; real output/quality
acceptance remains the owner's manual UI retest with their existing live flags,
credentials and approvals. No local AI model or runtime is introduced.

### Implementation and verified handoff

The provider-shape normalizer now accepts both supported envelopes and returns a
bounded safe summary without rewriting raw output. Unsupported shapes are marked
explicitly; malformed JSON retains its private decoding record and emits ordinary
`candidateJson.decoded=false`, rather than inventing an empty model envelope.
Successful normalization logs input shape, returned/considered/accepted/dropped
counts, static reason counts and adjustment count; a real empty array, unsupported
shape and all-dropped result remain distinct. Logging failure cannot change output,
call count or capture. The JSON-only prompt names the full envelope/fields and
includes its structure; no outgoing response schema was restored. Neutral UI
copy removes the false editorial assertion while retaining the recovery flow.

Changed implementation surfaces: `analysis.provider-shape.ts`, `analysis.prompt.ts`,
`gemini.adapter.ts`, `transcribed-analysis.provider.ts`, `analysis.diagnostics.ts`,
`transcribed-analysis.test.ts` and the backend startup marker in `server.ts`;
frontend `sample.experience.tsx` changes only this follow-up's empty-state copy.
Earlier changes in those files are preserved. The service guides, source of truth,
ticket index and controlled-check guide own their matching documentation updates.

All five root commands pass: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit`, `corepack pnpm build`.
There are **969 synthetic tests in 82 files**, including 437 backend tests and ten
new format/diagnostic regressions. Tests cover both three-item response formats,
mixed usable/unusable entries, fixed count bound, true empty output, unsupported
shape, malformed JSON, privacy, private capture and a throwing log sink. Actual
mock request serialization proves the envelope prompt reaches Flash with JSON
MIME mode and no schema/video/retry. Exact fake upload/transcribe/selection/delete
counts are unchanged. The frontend local artifact inventory also passes.

Private offline replay of the unchanged saved response now takes its original
top-level array directly: **returned 3, considered 3, accepted 3, dropped 0**.
All three pass final packaging; one existing hook display-shortening adjustment
remains and does not remove a moment. Summary log lines pass the safe parser.
No real payload was copied into Git/fixtures/docs, no capture was modified and
the replay dispatched zero provider calls.

Final read-only validation: **Meets ticket locally; no actionable findings**.
The six acceptance steps are covered. Dependency/privacy/bounds/cleanup and
scope review finds no new cross-app import, dependency, listener, timer, paid
retry or stale generated declaration. Backend hot reload is verified on existing
supervisor PID 20672 with eight owned processes and listener PID **16976**;
frontend PID **20712** remains on loopback 3000, backend on 4000. All three
readiness GETs return 200. The new decoder marker and armed full private Gemini
capture are loaded. Normal configuration/live flags/credentials were untouched;
no renderer/cloud action or Git mutation occurred. Deviations: none. Actual paid
UI behavior/quality after this fix still requires the owner's manual Start over /
Find moments retest; fake/offline checks do not replace that acceptance.

## Owner session renderer allowance and operational diagnostics — 2026-10-05

Status: **implementation, validation, all five root gates, private image rollout
and local readiness passed; owner live acceptance remains unchecked**. The owner explicitly
authorized planning, implementation, useful backend logging and deployment after
local verification. This dependency-ready CL-007 follow-up supersedes the
renderer instance-lifetime operation cap; existing unrelated work is preserved.

### Implementation plan and acceptance

1. Define a fixed four-operation session allowance in contracts, matching the
   existing prepare/select/preview/render workflow. Record consumption in the
   existing expiring renderer intent; increment atomically with each valid
   generation-checked operation claim before media work. New sessions receive a
   fresh allowance. Failures keep consumption; invalid/replayed claims and
   metadata/read/release/cancel/expiry do not consume media work. Restart and CAS
   conflict cannot renew or duplicate an allowance. Decode old cleanup intents
   conservatively from their existing phase/artifacts without losing deletion.
2. Remove the old process-wide admission counter and retired
   `RENDERER_MAX_OPERATIONS` configuration. Keep aggregate counters for synthetic
   dispatch evidence, one active operation, authentication/bindings, phase and
   replay fences, backend admission/spend, source/size/time/scratch bounds,
   cancellation and cleanup. This is a bounded session allowance, not a dollar
   budget or permission for unlimited public processing.
3. Share the private renderer failure-code schema across its response and backend
   adapter. Capture safe backend diagnostics for every renderer call: operation,
   attempt, authorization/transport/HTTP/read/JSON/schema phase, HTTP status,
   static renderer reason, response bytes/completeness, elapsed time, cancellation/
   timeout and bounded structural decoding issues. Never log authentication,
   URLs/resource/account IDs, input/payload/media or arbitrary exception messages.
   Preserve all existing Gemini diagnostics and full private returned-output
   capture. Map budget/busy/expiry/cleanup/storage failures to their actual safe
   UI error categories; renderer failures must not become model rejections.
4. Prove multiple sessions can prepare on the same instance; four-step bounded
   workflow, restart persistence, failure/replay/CAS behavior and non-metered
   cleanup; exact synthetic media/AI dispatch counts; logging success and every
   boundary failure with no sensitive sentinel leakage. Test logging failure
   cannot alter processing and error mapping remains generic for the UI.
5. Update the source of truth, service/setup/cost guides and ticket index. Run
   focused suites, all five root gates and scoped boundary/cleanup/diff review.
   Verify local hot reload and three readiness GETs with capture preserved.
6. Once local checks pass, use the existing private renderer/image repository,
   build account, staging path and deployment workflow for one matching image
   build/update. Remove only the retired operation environment entry; preserve
   other runtime settings, resources, traffic policy and private IAM. Record
   immutable digest, Linux synthetic image proof, runtime readiness and safe
   non-metered health/invalid-input probes. Remove exact owned build source and
   local context. Existing resources and independent live-feature gates remain.

The owner's approval covers this renderer build/deployment and retirement of the
obsolete cap setting after verification. No Git mutation, new resource, secret
change, public release, live-feature enablement or agent-run paid AI/real-media
test is included. `FAKE_MODE=true` without keys proves synthetic local behavior;
real speech/candidate acceptance still needs the owner's manual UI test with
their existing credentials/live flags and approval. No local AI weights/runtime
are introduced. Verified private rollout evidence appears below; owner live
acceptance remains unchecked.

### Local verification evidence

The renderer intent now persists `mediaOperationsUsed`; the four operation claims
increment it using generation-checked storage, and the old instance admission
counter/configuration is retired. Conservative legacy decoding preserves cleanup
intents. Multiple sessions, the four-step workflow, failed consumption, restart,
CAS/replay and zero-cost reads/cleanup are covered with exact synthetic dispatch
counts. No new service, database or configuration override was introduced.

Canonical renderer response reasons/sub-stages now reach backend request logs
and safe UI error mappings. Diagnostics include authorization, transport, HTTP,
body/JSON/schema failures, bytes/completeness, timing, cancellation and timeout.
Preview/output/download GET requests and session exit are also correlated;
post-header stream failures are recorded. HTTP success/stream handoff, failure
mapping, no retries and log-sink isolation pass synthetic checks. Full private
Gemini capture and existing ordinary diagnostic privacy rules remain intact.

All five root commands pass: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit`, `corepack pnpm build`.
The suite passes **959 synthetic tests in 82 files**, including 21 renderer
boundary diagnostics tests and 85 renderer tests. A concurrent build caused one
existing file-copy test timeout; the complete suite rerun with the build finished
passed. Diff/boundary review found and closed missing stream-route correlation;
no sensitive content is included in diagnostic records. These fake/no-key checks
do not establish real Gemini acceptance or speech/editorial quality.

Read-only validation verdict: **Meets ticket locally; no actionable findings**
after execution removed a duplicate cancellation-test stub and reran all 85
renderer tests plus format/lint. Review scope is this session allowance and
diagnostics follow-up in the unstaged worktree and its two new regression files;
earlier Transcribe/quality-gate/Flash/browser work is preserved and not claimed
again. Consumption/CAS/restart, failure/replay, cleanup/resource/authentication,
adapter composition, safe UI mapping, bounded logs and private-capture preservation
are covered. Cloud/runtime verification and owner real-provider acceptance are
separate gates; the latter remains unverified. No index or Git history mutation
was performed.

### Verified session-allowance deployment and handoff

The approved allowlisted cloud build passed in **124.689 seconds**. Its Linux
proof verifies synthetic source-aligned audio/profile/onset, render/decode,
scratch scanning, process cancellation, unprivileged runtime imports and pinned
binary hashes/versions. Build and registry agree on immutable image
`sha256:87e6f16bd5c3195f52454e0fd2aae3b17b43c1ea342595ffc28f9b0b84868dcd`.
That digest now serves the existing private renderer at Ready/100% latest traffic.
The obsolete operation environment entry is absent. Comparison confirms all
other runtime/resource/volume/identity/traffic settings and private IAM match;
only image, removed entry and generated revision name/nonce changed.

Configured-audience/caller ADC matches; anonymous health returns 403,
authenticated health 200 and empty analysis-audio input 400 before media work.
The exact owned build-source generation was deleted and confirmed at 404; the
allowlisted local context was removed after an absolute-path ownership check.
Private proof/log/capture records remain preserved, and the retained owner source
was untouched. Deployment probes dispatched **zero media jobs and zero Gemini
calls**; they do not establish live processing quality or provider readiness.

Local watcher hot reload is verified on the existing backend supervisor, with
eight owned processes, backend listener PID **21436**, frontend PID **20712** and
their expected loopback ports 4000/3000. Backend health, `/start` and frontend
sample configuration all return 200. Renderer diagnostics and JSON-only Flash
policy are loaded; full private Gemini response capture is armed. Existing
credentials, operating/live flags, capture permit and independent approvals were
not changed. No replacement launcher, unrelated process cleanup or Git mutation
was required. The owner can start over and manually retry Find moments; actual
JSON-only Flash acceptance and resulting candidate quality remain unchecked.

## Manual JSON-only retest blocked by renderer operation cap — 2026-10-05

Read-only follow-up to the owner's manual retest: sample fingerprint, renderer
upload admission and source transfer succeeded. Analysis failed in `media_prepare`
after 579 ms, before audio extraction/transfer, Transcribe or Flash. Source cleanup
succeeded; the request completed at HTTP 500 after 1,717 ms with zero dropped
diagnostic records. Private capture contains only request start/finish, correctly
reflecting zero Gemini dispatches; JSON-only Flash acceptance remains unchecked.

The matching cloud request log shows `/internal/prepare` returned HTTP 409 in
4.275 ms. Read-only inspection of the deployed numeric operation cap returned
`RENDERER_MAX_OPERATIONS=2`. That exact cloud instance has two earlier successful
prepare requests (15:58:05 and 16:23:11 UTC), followed by this refusal at 16:35:58
UTC. `MediaOperations.owned` checks its cumulative instance dispatch counter
against the cap before processing and never decrements that spend counter. This
establishes that the renderer's two-operation instance budget is exhausted; a
local backend restart cannot reset it. No real media, private resource identifier
or credential is recorded here.

The backend renderer adapter discards the renderer HTTP status/error code and
rethrows a generic error; source analysis then maps that generic error to
`MODEL_OUTPUT_REJECTED`. The displayed validation rejection is therefore
misclassified. Follow-up implementation should preserve content-free renderer
status/reason and map budget/availability failures accurately. Continuing real
testing also needs an explicit owner-approved renderer budget/reset cloud action,
independent of local diagnostic changes. No fix, cloud mutation, configuration
change or paid processing request was performed during this audit. Fake/no-key
checks use injected media ports and cannot exercise the deployed instance cap.

## Owner Flash JSON-only request isolation — 2026-10-05

The owner authorized removing `responseJsonSchema` from source candidate Flash
generation after the latest manual test passed Transcribe and local transcript
packaging, then Google returned HTTP 400 `INVALID_ARGUMENT` during candidate
generation. The complete captured error contains only a generic invalid-argument
message; the rejected parameter is not proven. Cleanup succeeded.

Change exactly that outgoing argument: retain JSON MIME mode, model, prompt,
token/deadline/call settings, text-only input, permissive decoding and all safe/
private diagnostics. Mark the request and startup policy `json_only` with no
schema summary. Preserve canonical schema helpers as the historical diagnostic
baseline; selected-video planning keeps its separately owned request schema.
Verify the actual serialized mock SDK body omits both schema fields and preserves
other settings/capture, then run the five root gates and verify local reload.
Fake/no-key checks prove the serialized local request only; acceptance by Google
still requires the owner's manual UI test with existing credentials/live gates.
No paid request, automatic retry, cloud update, secret/configuration mutation or
Git action is authorized by this change.

Status: **implementation, all five root gates and local hot-reload/readiness
verification passed; Google acceptance remains the owner's manual UI test**.

The actual mock SDK request test passes with JSON MIME mode, unchanged policy,
one candidate, fixed token/deadline settings and no schema fields. Safe diagnostics
report `json_only` without a schema summary. Complete private response and decoded
output capture remain covered by the synthetic transport tests. Focused backend
checks pass (29 tests), followed by `corepack pnpm format:check`, `corepack pnpm
lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit` and `corepack pnpm
build`; the full suite passes **922 synthetic tests in 80 files**. The local build
artifact verifier passes; this does not establish public release readiness.

Backend watcher app PID 11436 was created after the changed source and listens on
127.0.0.1:4000 under the existing recorded launcher. Its startup marker confirms
`json_only` and private capture armed. Frontend PID 20712 remains on
127.0.0.1:3000; health, `/start` and `/api/sample/config` all return 200. The existing
capture permit remains unchanged. No paid request, provider dispatch, explicit
restart, cloud action, configuration/credential change or Git mutation occurred.
Start over and manually retry Find moments to establish whether Google accepts
the request; the original 400's specific rejected argument is still unproven.

## Owner removal of Find moments quality rejection gates — 2026-10-05

The owner explicitly requested removal of all the transcript/candidate validators
after the first Transcribe UI attempt. This supersedes the quality-rejection
policy below. Offline replay found 22 equal start/end offsets among 1,168 words;
all originated in the returned annotations. Transcribe succeeded and Flash was
never reached. No real transcript content is recorded here.

Implement within this packet: remove transcript timing/order/overlap/media-tail,
turn consistency, quotation/claim/evidence, candidate duration/overlap and
duplicate quality rejection gates. Remove equivalent shared contract checks so
browser parsing cannot reintroduce them. Preserve supplied timing values,
anonymous labels, stable identifiers, full private capture and safe diagnostics.
Decode usable annotations/items independently; an unusable item must not fail
the whole request. Do not invent missing timings or substitute a fake result.
Empty usable output is an honest no-candidate result. Keep bounded response and
collection sizes, basic primitive decoding, source/session/receipt/authentication,
admission/spend, media inspection, cancellation and deletion controls.

Replace obsolete reject expectations with synthetic regressions for zero-length,
inverted/out-of-order/overlapping/out-of-media words; imperfect selection refs,
duplicates, sparse evidence and out-of-guidance cut lengths; exact model call
counts; capture and cleanup. Replay the saved output offline only. Run the five
root gates and verify local watcher/readiness. Fake/no-key tests prove local
behavior; real quality acceptance still needs the owner's manual UI test with
credentials, enabled live capabilities and existing approvals. No paid call,
cloud update, configuration/credential mutation or Git action is authorized here.

Status: **local implementation, all five root gates, offline saved-response replay
and watcher/readiness verification passed; owner live UI acceptance remains open**.

Removed the source reconciliation quality rules, repeated transcript/candidate
contract refinements and the obsolete fixture-only quality validator. Annotation
and selection decoding now preserves usable items without whole-request quality
rejection. Empty annotations or unusable candidate JSON return no candidates;
there is no fabricated timing, fake fallback or repair request. Private raw,
normalized and adjustment capture and historical diagnostic parsing are retained.
Server-assigned result outcome/identifier/rank envelope consistency remains a
structural boundary, independent of all model quality rules.

Exact final checks passed: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit`, `corepack pnpm build`.
The suite has **922 synthetic tests in 80 files**: root 33/4, contracts 60/5,
composition 3/1, backend 403/21, frontend 351/36 and renderer 72/13. Updated old
rejection expectations and added regressions for unchanged zero/inverted/order/
overlap/out-of-media values, partial annotations, sparse/duplicate evidence,
unavailable range items and absent/malformed Flash JSON. Exact fake dispatch,
capture, file deletion, cancellation, admission and signed-result checks pass.
The local build artifact verifier passed; public release remains separate.

Offline replay of the owner's saved response used zero provider calls, accepted
all **1,168 words / ten turns / 22 equal start-end offsets**, and deep comparison
proved the newly normalized output equals the saved normalized output exactly.
No owner content was copied into fixtures, ordinary logs or documentation.
Backend watcher app PID 20452 was created after the changed code and binds
127.0.0.1:4000; the existing frontend PID 20712 binds 127.0.0.1:3000. Health,
`/start` and `/api/sample/config` return 200; private capture remains armed under
the unchanged six-hour permit. No explicit restart, cloud update, paid request,
configuration mutation or Git stage/commit occurred. Existing unrelated changes,
saved captures and retained source are preserved. The owner manually retests
Find moments; live transcript/candidate quality, latency, spend and actual provider
deletion acceptance remain unchecked. Selected assembly/render boundaries are
outside this Find moments override.

## Owner Transcribe and text-only selection migration — 2026-10-05

Status: **local implementation, native proof, all five root gates and the
owner-approved matching private renderer deployment passed;
owner live acceptance remains open**. This is
the current CL-007 execution packet. The owner requested a thorough documented
plan, removal of the old processing pipeline, preservation of every diagnostic,
complete private output capture, and a tolerance review before execution.
This section supersedes older one-source-generation requirements below; those
sections retain historical evidence, not alternative runtime paths.

### Evidence and authority

The latest privately captured owner attempt completed generation and parsed its
JSON, then failed reconciliation. An offline audit of the unchanged capture
found timestamp overshoot, inconsistent/incomplete speaker turns, incorrect
candidate word references and quotations outside their referenced ranges.
Normalization reproduced the original provider references exactly. This supports
separating timing from selection; it does not establish audio transcription
accuracy or guarantee that a different model will pass a real test.

The latest owner decision authorizes local code and documentation changes,
including the two-call source-analysis budget and bounded tolerances below.
The owner subsequently explicitly approved deployment of the matching existing
private renderer after the local gates passed. This authorizes its bounded image
build and revision update, with private access and existing settings preserved.
Credential/configuration mutation, new resources, public release, agent-run paid
requests and Git writes remain outside this packet's execution permission.
CL-006/008/009 contracts, renderer ownership and selected assembly
are implemented dependencies. Preserve the existing worktree and private
evidence. Never use the retained demonstration master as a test fixture.

### Target pipeline and ownership

1. Preserve current admission, rights/transfer acknowledgements, source binding,
   replay fences and original-media inspection. Reserve the existing one-shot
   candidate-analysis action before any work; it now permits exactly one
   Transcribe request followed by at most one Flash candidate request.
2. Renderer extracts **audio only** from the disposable uploaded processing
   copy. Use bundled FFmpeg, fixed mono 16 kHz AAC at 64 kbit/s in M4A, with
   resampling/leading-silence alignment to the source clock. Do not encode a
   full-source video. Inspect the audio profile/duration and enforce the current
   24 MiB artifact cap, deadline, scratch and process cleanup. The maximum
   twenty-minute input produces approximately 9.6 MB of encoded audio; verify
   actual bytes rather than trust that estimate. Report checksum/generation
   plus the fixed audio MIME/profile across contracts; no caller-provided path,
   command or remote URL is introduced.
3. Backend uploads the verified audio through the existing bounded Files
   lifecycle, calls **`gemini-3.5-transcribe`** once through Interactions with
   `store:false`, `background:false`, `stream:false`, English hint, verbatim
   mode, word timestamps and speaker diarization, then verifies file deletion.
   Use the same Gemini key. No custom vocabulary, tools, stateful continuation,
   polling an interaction, alternate model or automatic paid retry.
4. Parse completed model-output word annotations, preserving their full raw
   response first. Convert documented second offsets to milliseconds, assign
   stable word IDs in response order and map anonymous speaker labels by first
   appearance. Missing speaker attribution stays null. Derive contiguous turns
   from those labels rather than ask another model to reproduce them. Reject
   missing timings, invalid/empty/oversized data or unsupported response states.
   Validate the transcript **before** making the candidate request.
5. Send only the validated transcript with fixed IDs/times and the editorial
   rubric to **`gemini-3.8-flash`**. It selects ranges, quotation word references,
   evidence signals and caveat codes; it cannot generate another transcript,
   change timestamps, renumber words or provide authoritative cut durations.
   Backend derives titles/hooks/evidence quotes and fixed explanations from the
   selected references. Keep zero-to-four candidates, 10–60 second duration and
   existing overlap/grounding constraints. Preserve the browser result/receipt
   shape and exactly-one-candidate UI.
6. Preserve the separately admitted selected short-video Flash call for anonymous
   speaker-to-visible-person association and contextual cards. The renderer
   still prepares that short video. Transcript-only selection cannot establish
   visual identity; unknown/ambiguous speakers retain the existing wide fallback.
   Rendering/export retries continue to make zero new AI requests.
7. Release the temporary audio immediately after its consumer, retain verified
   provider cleanup obligations, and preserve cancellation/expiry/late-result
   publication fences and independent sweeper behavior. Old ledger artifact
   fields may remain for deletion compatibility, never for an old processing
   fallback. A mismatched renderer revision must fail closed.

### Reconciliation tolerance policy

The owner explicitly asked for practical tolerance, not flawless output.
Keep raw values in private capture before normalization and record every
adjustment separately. Align the strict backend end check with the existing
**250 ms** shared media tolerance: an end overshoot at most 250 ms can be clamped
to decoded media duration only when the word still has positive duration. Reject
larger overshoot, starts outside the source, backwards/zero-length timing and
same-speaker/uncertain-attribution overlap beyond the existing 250 ms allowance.
Allow real overlap between distinct known anonymous speakers without flattening
their speech; selected framing retains its existing overlap fallback. Never stretch the transcript,
shift all timings, infer missing timestamps or accept multi-second drift.

Punctuation/capitalization/whitespace differences are cosmetic. Natural candidate
boundaries remain selection guidance; absent sentence punctuation alone must
not reject the whole valid result. Keep references, contiguous quotation order,
candidate duration and overlap, source binding, evidence membership and forbidden
claims fail-closed. Stable turns are derived from per-word attribution, so harmless
missing labels do not fabricate identities or create partition mismatches.
Bounded extractive copy can be shortened at a word boundary to fit public limits;
log that normalization and never substitute unrelated text. Invalid references
must still reject rather than silently choose different moments.

### Diagnostics: preserve and extend

- Preserve existing content-free phase/error/timing/schema diagnostics and their
  historical parser compatibility. Add distinct transcription, transcript
  validation, candidate generation/normalization and selected planning phases;
  model/task correlation must identify which returned output failed. Increase
  the bounded safe-record allowance as needed for two source calls, reserving
  failure/terminal records and recording any drops.
- Preserve the owner-local, request-scoped OS-temp JSONL capture and saved
  evidence. Extend it to **every returned HTTP body/header**, all Transcribe
  annotations/text/usage/status/unknown fields, candidate Flash output, selected
  video Flash output, normalized transcript/candidates, adjustments and assembly
  reconciliation input/result. Capture before parsing and rejection. Normal
  logs, public errors and Git remain content-free; never log request auth,
  environment values or credential files.
- Capture 100% of accepted bounded responses, including fields unknown to the
  pinned SDK. An oversized or disconnected response records its available
  prefix, actual observed bytes and `complete:false`; never label it complete.
  Preserve the six-hour explicit local permit and the fixed capture-unavailable
  warning. Expiry stops new captures, not evidence retention. Capture failures
  cannot cause retries, suppress cleanup or change validation decisions.
- The assembly request must receive its own capture context. Keep raw provider
  output and normalized/derived output distinguishable. No diagnostic probe
  should dispatch an extra paid call or resurrect the combined-video pipeline.

### Cleanup inventory and verification

Backend: replace the combined source prompt/wire normalization/default video
generation branch; separate source audio transcription/text selection from the
explicit selected-video task; reuse bounded HTTP and Files cleanup. Retire the
old isolation CLI/script and its obsolete source-schema probes. Preserve error
parsing enums needed to read historical logs. Update composition, contracts,
renderer audio operations, native/fake fixtures and owning guides/budgets.
Remove stale active one-source-call claims; retain historical ticket evidence.
No frontend feature expansion or new dependency/weights/runtime is required.

Required focused checks use synthetic media/injected ports and hardcoded
fake/paid-off/no-network test setup: correct request shape/model/store flags;
word offsets, diarization/null labels and complete derived turns; accepted
250 ms overshoot versus rejected larger drift; cosmetic boundary tolerance;
invalid/out-of-range/reordered quote references; exact one Transcribe plus one
text-only Flash call, zero Flash after transcription rejection; cancellation,
uncertain upload, cleanup failure, checksum/content-type/profile mismatch;
complete raw capture before rejection, all provider tasks, sink/permit failure
and historical safe-log parsing; selected video still uses fixed sampling and
its separate admission. Verify native audio duration, alignment, actual bytes,
no video stream and scratch/process cleanup with synthetic media only.

After edits settle run all required root gates: `format:check`, `lint`,
`typecheck`, `test:unit`, `build`. Review requirement coverage, dependency
direction, duplicate schemas/constants, obsolete exports/scripts/flags, unsafe
casts, content leakage and touched resource cleanup. Record exact evidence.

- [x] Document current owner decision, detailed plan and tolerance review.
- [x] Implement the new source pipeline and remove obsolete execution paths.
- [x] Preserve/extend full private capture and safe diagnostics for every phase.
- [x] Pass focused synthetic/native checks and all five settled root gates.
- [x] Record diff review, actual cleanup evidence and remaining gates.
- [x] Separate approved renderer image build/update and compatibility rollout.
- [ ] Owner-run paid UI test: speech/timestamp accuracy, candidate usefulness,
      speaker association, full capture, real deletion, latency and spend.

### Local implementation and measured evidence — 2026-10-05

Implemented the new candidate-only prompt/reference schema, Transcribe REST task
and annotation normalization, staged source provider, fixed audio profile/route,
renderer audio extraction and selected-only video preparation. Existing public
analysis/receipt/UI contracts remain unchanged. Old combined prompt, compact
source wire/default generation and isolation CLI/script are removed; saved
v2 diagnostic purposes and legacy intent artifact fields remain read/deletion
compatible. No old processing fallback remains. All prior safe/private diagnostic
modules and saved owner evidence are preserved. Capture now includes Transcribe,
text Flash and selected-video Flash, normalized values, timing/copy adjustments
and assembly reconciliation inputs/results. Accepted HTTP bodies preserve unknown
fields; interrupted reads preserve their prefix with `complete:false`.

The synthetic native `test:audio` harness uses the existing fixture FFmpeg only
to create/decode RGB/tone inputs, and the packaged Remotion FFmpeg/FFprobe for the
actual production extraction. It forces test/fake/paid-off before imports, uses
no real media/provider/ADC, and verifies its absolute OS-temp cleanup target.
The packaged binary required explicit `-f mp4`; extension-inferred M4A muxing
failed, and the corrected path passed. Four 15-second AAC/AAC-delay/Opus/Vorbis
inputs produced one mono 16 kHz AAC stream each, no video, matching 0/1180/1780/
600 ms measured onset before/after, and 73,395–79,883 bytes. Extraction took
430–490 ms in the settled run. A **1,199,587 ms** source produced **6,220,603 bytes**
in **37,999 ms**, below the 24 MiB cap; this is a near-twenty-minute synthetic
clock/size proof, not an exact 500 MiB real-file stress or a provider benchmark.
All synthetic scratch was removed. Native inputs deliberately leave an audio
silence tail to verify padding/alignment. No tooling download/build cloud action
or paid request occurred.

The existing image verifier now runs the production extractor before rendering,
checks the fixed audio-only profile/byte cap and decoded source/audio tone onset,
and includes those aggregate values in the image proof. Its local packaged-tool
`--fixture-only` stage passed: 15,000 ms source, 77,585 bytes, 537 ms extraction,
1,200 ms source and extracted onset, zero AI calls. Two verifier startup errors
(declaration order and CommonJS access to an import-only package) were corrected
before that proof; the empty owned directory from the second failed startup was
identified by creation time and removed. Verifier scratch creation now follows
all imports/tool resolution, and recursive cleanup checks its exact temp parent
and prefix. Actual Linux rendering/cancellation/audio proof still requires the
separate approved cloud image build, not this Windows fixture-only run.

Focused fake checks verify separate exact calls and no source-video dispatch,
Transcribe request flags, empty/null anonymous attribution, derived full turns,
1/250 ms tail clamping versus rejected 251 ms drift, distinct-speaker overlap
versus same-voice inconsistency, punctuation tolerance, invalid quotation refs,
confirmed evidence-array schema remedy, incomplete/raw response capture and
selected-model capture before schema rejection. Review also found that selected
proxy/source cleanup could hide the primary provider error; it now preserves
that error, logs cleanup separately, and publishes no preview on failure.
The added selected cleanup regression passes with one plan, one release and one
cancel attempt and zero preview calls. Cleanup failure after a successful plan
reports `CLEANUP_PENDING` rather than falsely label it model validation.

Final required checks passed: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit`, `corepack pnpm build`.
The settled unit suite has **912 synthetic tests in 80 files**: root 33/4,
contracts 60/5, composition 3/1, backend 393/21, frontend 351/36 and renderer
72/13. Tests force fake/paid-off before imports and intercept external network.
The production build's local frontend artifact verifier also passed; this is
not a Linux image or a public-release result. Next's generated declaration file
was returned to its pre-build development references for the running local app.

Scoped final review covers audio/selected artifact separation, fixed MIME/profile
and checksum contracts, exact call ordering and zero selection after transcript
rejection, all raw capture paths including incomplete reads, bounded timing/copy
changes, caller/admission/replay/binding controls, cancellation/provider cleanup,
temporary scratch/listener/timer ownership and legacy deletion compatibility.
Published contracts remain browser-safe; no cross-application imports, new
dependency, model weights, runtime download, obsolete combined-source execution
or isolation CLI remains. Historical diagnostic enums are retained deliberately.
`git diff --check` passes and the index is empty. Related pre-existing workflow
changes are preserved; no Git stage/commit or unrelated frontend feature edit is
part of this migration. Owned synthetic scratch and native tool processes are
absent after checks. Existing app readiness and watcher loading are recorded
below as non-metered checks only.

Final local handoff: owned launcher creation identities remain unchanged;
backend app PID 21596 was created after the final backend source write and binds
127.0.0.1:4000; frontend app PID 20712 binds 127.0.0.1:3000. Backend health,
frontend `/start` and `/api/sample/config` GETs all return 200. Current safe
startup markers identify `candidate_local_evidence_cap`, diagnostic v2,
reconciliation diagnostics and armed private response capture. This was watcher
hot reload, not a new restart or a paid request. The existing capture permit
still expires at 2026-10-05 20:06:58 UTC; it was not changed or extended.
Verified zero owned synthetic FFmpeg/FFprobe leftovers and zero synthetic audio/
Linux-proof scratch directories. Existing healthy services remain running.

The owner explicitly approved deployment after this local handoff: one bounded
image build and matching revision update of the existing private renderer, following its current setup
guide and 20-minute build timeout. The image's synthetic audio/render/cancellation
proof must pass before updating; then verify digest, unchanged access/settings
and non-metered authenticated health. No new cloud resource, public deployment,
provider test, credential/mode mutation or additional paid attempt is bundled.
After that compatibility handoff, the owner performs the paid UI test manually.
That test remains required for live speech/timestamp/candidate/visual quality,
actual cleanup, complete request capture, latency and spend.

### Approved private deployment and final handoff — 2026-10-05

The owner explicitly authorized deployment after local verification. One
allowlisted Linux image build used the existing verified build identity,
staging bucket and repository, with a 1,200-second timeout. It passed in
**136.453 seconds**. Exact build log markers confirm the synthetic source-audio
extraction/alignment/profile, portrait render, scratch/process cancellation
proof and final production imports/bundle/binary hashes/versions. Artifact
Registry matched the build's immutable digest:
`sha256:2aafa7b300878103130f3011ebdbda66eeb6e3e1a40652e27de277a126312121`.
One image-only update of the existing private renderer passed Ready and
100% traffic to the latest revision. The complete runtime spec with only image
removed hashes identically before/after: attached identity, environment, secret
mounts, resources, concurrency and deadlines are preserved. Service/revision
scaling and CPU policy are unchanged; IAM bindings are identical with zero
public bindings. No resource, API, CLI configuration or credential was created
or changed. One actual cloud build and one service update occurred; earlier
local CLI argument corrections dispatched no builds.

Anonymous health returns 403. Existing ADC with the configured application
audience/caller returns health 200 and the exact content-free body. An empty
POST to the new `/internal/analysis-audio` returns 400 `invalid` before media
work, proving route compatibility with **zero media and zero Gemini dispatches**.
The configured audience differs from the platform's canonical status URL;
the initial internal probe using that canonical audience returned 403. Matching
the existing application audience fixed the probe without changing application
authentication, backend configuration or credentials.

The exact newly staged build-source generation was deleted with a generation
precondition and its not-found result verified. The absolute allowlisted local
context was removed after temp-parent/prefix/link checks. Deployed resources,
visitor media, retained master and earlier private captures were preserved.
Private deployment metadata/proofs remain outside Git in the OS-temp runtime
directory; no account/resource identifier, credential or environment value is
copied into public evidence.

Final local health, `/start` and `/api/sample/config` are all 200. Public
capabilities report analysis enabled, assembly/render disabled at the existing
approved stage. The backend watcher loaded the current pipeline and capture
remains armed under the unchanged six-hour permit. The owner can start over in
the UI and manually run Find moments. No agent paid AI test or real-source
processing was performed. Live Transcribe speech/timing, Flash usefulness,
actual audio/GCS/Google deletion, full response capture for the next real run,
latency/spend and later assembly/export/device/rights/license gates remain
unchecked. Fake/no-key and synthetic Linux proofs do not establish those results.

No source media, transcript, filename, prompt/provider content, signed capability,
credential or account identifier was added to Git/docs/ordinary logs. Real media
and all existing private captures were untouched. Broad release, actual cloud
real-media deletion, billing, speech/candidate/visual quality and owner device/
rights/license checks remain unverified. The matching image/endpoint deployment
is verified above; actual protected real-media audio transfer and provider
quality remain the owner's manual checkpoint.

With `FAKE_MODE=true` and no API keys, deterministic fixtures exercise contracts,
orchestration, tolerance, diagnostics and failures. Real Transcribe/Flash output
requires credentials, enabled live flags, existing transfer/spend approvals and
the matching deployed renderer. Fake results do not prove live AI quality.

References: [Transcribe](https://ai.google.dev/gemini-api/docs/transcribe),
[Interactions storage/background flags](https://ai.google.dev/api/interactions-api),
[migration authority](../architecture/GEMINI_REMOTION_MIGRATION.md).

## Current cloud-render packet — approved local execution, 2026-10-02

Status: local implementation, all five root gates and the actual fake browser workflow passed, 2026-10-03. The owner explicitly deferred the separate renderer rollout and paid/live AI checkpoint, and authorized continuing dependency-ready local packets one at a time. Live acceptance remains unchecked.

Authority: [Google/Cloud Run migration plan](../architecture/GEMINI_REMOTION_MIGRATION.md); [file inventory](../architecture/MIGRATION_FILE_INVENTORY.md); [later setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md).

Implement bounded Google proxy upload/process/structured analysis/delete, grounded transcript/anonymous turns/candidates, signed provenance, existing UI result commit/recovery and injected exact-call failure tests.

Dependencies follow the numbered migration sequence. After documentation approval, implement one dependency-ready packet at a time and run focused checks plus the required settled five root gates. Fake/live AI and local/cloud compute are independent; cloud render can incur cost with fake AI. Ordinary tests remain synthetic, credential-free, fake/off and zero-network through injected cloud/provider ports. No cloud provisioning, login, credential use, private upload, paid call, Git action, usage polling or new independent review is authorized now.

- [x] Owner explicitly approved documentation and local corrections on 2026-10-02.
- [x] Implement this current packet and verify its locally possible synthetic behavior after approval.
- [x] Record exact tests/manual states, cleanup and all remaining rights/AI/cloud/license/device gates.
- [x] Verify the actual `FAKE_MODE=true`, API-key-free browser workflow and clean up its temporary services.
- [ ] Controlled live analysis checkpoint: explicitly deferred by the owner; do not infer authorization from fake results or earlier CL-006 permission.

## Owner-requested analysis failure and console fix plan — 2026-10-04

Status: **local fixes implemented and synthetically verified, 2026-10-05;
historical provider cause and owner-only live acceptance remain open**. The
owner first requested this plan, then explicitly authorized fixing all five
items and validating the settled result. The evidence below supersedes the
implementation deferral in the 2026-10-04 handoff.
This follow-up stays in CL-007. It does not authorize a new paid attempt, cloud
change, deployment, Git mutation or restart during an owner-run attempt.

### Owner-local full Gemini capture — 2026-10-05

The owner explicitly authorized recording all returned Gemini output and actual
timestamp values to judge `word_outside_media`. This supersedes the prior
content-free-only diagnostic scope for these private local files. The latest
owner-run attempt has 36 safe records, zero drops, generation HTTP 200 and
JSON/schema success, then rejects `words[1080].endMs` (word ordinal 1081).
Generation took 142,485 ms; the full request took 198,660 ms. Exact timestamp
values were not retained, so the prior result cannot prove the overrun's size.
Reconciliation currently allows no overshoot; the shared transcript contract
allows 250 ms. Neither condition is changed by this logging packet.

Capture all bounded Google HTTP response bodies/headers before SDK parsing,
including success, errors and otherwise suppressed successful file polling/list
responses. Generation body preserves every returned field, including all parts,
candidates, finish/safety/usage metadata and unknown provider fields. Also capture
SDK-derived text/completion, complete normalized output before reconciliation,
decoded media duration, every out-of-media word's index/ordinal/start/end/overrun
in milliseconds, the rejecting rule and request completion. No request headers,
API keys, ADC files, environment values or configured prompts are serialized.
The existing four-MiB provider response bound remains; a response exceeding it
still fails and its available bounded prefix is explicitly `complete: false`
with observed byte count. Capture failure cannot change processing or cleanup.

Files are request-scoped JSONL in OS Temp's
`clipbuilder-runtime/private-gemini-capture/`, outside Git. Default activation is
off; a versioned workspace-bound `permit.json` permits local live/paid-analysis
composition for at most six hours. Test/fake/preview/production modes reject
capture before reading the permit. Captured files remain local until removed
after diagnosis; permit expiry only stops new captures. No files are exposed by
HTTP, copied into fixtures/docs or mixed into content-free stdout/stderr. No
paid call, config-secret edit, Git action, cloud or retained-master access is
included. Root formatter exclusions now cover private runtime configuration and
the private tree; the initial backend formatting command scanned
`runtime.local.json` unchanged and printed no values.

Acceptance:

- [x] Capture complete returned response data before SDK parsing, without changing
  the response-size gate, transport schema, retries, admission or provider calls.
- [x] Capture actual normalized timestamps and decoded duration/overruns before
  reconciliation, even when reconciliation fails; preserve all rejection rules.
- [x] Keep request-scoped private files outside Git; default off with local-only,
  workspace-bound expiring activation and unchanged public/content-free logs.
- [x] Synthetic tests cover success/rejection/malformed/oversized responses,
  exact injected call counts, permit/mode rejection, privacy, budgets, sink
  failures, filesystem failures, evidence preservation and exact timing deltas.
- [x] Five final root gates, read-only review and active backend capture marker.
- [ ] Owner manual test produces the first real full capture; inspect actual
  overrun values and grounding before proposing a processing fix.

Settled evidence: all five root gates (`format:check`, `lint`, `typecheck`,
`test:unit`, `build`) pass. The isolated fake/no-key suite passes **916 tests in
80 files**, including **397 backend tests in 21 files**. Thirteen new capture
checks plus one additional use-case integration case cover this follow-up.
The earlier focused run passed 137 tests in three files; the final added
integration case is included in the settled full suite. Generated frontend type
references were restored to their unchanged development form and frontend type
checking passed again. No secret values were inspected or printed.

Scoped read-only review: **Meets the owner-local capture packet; no actionable
findings**. Full pre-SDK response capture, failure/normalization/timing wiring,
request correlation, no-overwrite filesystem behavior, expiring local-only
activation, unchanged validation/public errors and cleanup/call counts are
covered. Earlier provider/schema/reconciliation/frontend fixes are outside this
follow-up's verdict. The review used current source and synthetic execution
evidence; it did not rerun a suite or contact a provider. Genuine timing accuracy
and actual Gemini capture remain owner-unverified.

Activation: a private workspace permit expires at **2026-10-05 20:06:58 UTC**.
The watcher reloaded backend supervisor/app **20672/9028** on `127.0.0.1:4000`
after all capture-source changes and printed
`ClipBuilder private Gemini response capture armed`. Frontend supervisor/app
**10900/20712** stays on `127.0.0.1:3000`. Both owned eight-process trees have
stable listeners; backend health, `/start` and `/api/sample/config` return 200
with normal owner configuration. Runtime records were refreshed. Private output
will be in `C:/Users/minat/AppData/Local/Temp/clipbuilder-runtime/private-gemini-capture/`;
content-free backend stdout/stderr remain in the prior restart directory.
No paid request, cloud/Git action, environment/credential edit or retained-media
access was performed. The earlier response cannot be reconstructed from its
content-free logs; the owner's next manual UI run supplies the first full output.

### Reconciliation rejection diagnostics — 2026-10-05

The owner authorized precise, privacy-safe diagnostics to determine whether the
new reconciliation rejection reflects a legitimate constraint or an overly
strict/incorrect check. This is a diagnostic-only CL-007 follow-up. Preserve all
accept/reject conditions, ordering, limits, public responses, schema fingerprint,
dispatch counts and cleanup. No new paid request, credential/configuration edit,
cloud change, deployment, Git staging/commit or raw provider-content capture is
authorized by this implementation.

The preceding owner manual live run has 36 safe records and zero drops. Media
preparation/upload, generation HTTP 200, Gemini JSON/schema validation and cleanup
succeeded; reconciliation alone rejected with `MODEL_OUTPUT_REJECTED` in 6 ms.
The analysis request took 188,504 ms, including generation 131,930 ms and media
preparation 30,420 ms. Its safe capture is
`C:/Users/minat/AppData/Local/Temp/clipbuilder-runtime/restart-backend-adc-20261005-125537/ui-validation-req_e7ba54213766453fbea5d0b25623abf0.jsonl`.
The old generic catch discarded the rule; that run cannot retrospectively prove
which condition failed. Real transport acceptance is now observed, while
grounding acceptance/quality and the correctness of the rejecting check remain
unverified.

Acceptance for this diagnostic follow-up:

- [x] Identify every explicit reconciliation guard without altering its condition.
- [x] Classify contract-schema issues using bounded static codes and field/index
  paths; omit messages, values, text, timestamps, real IDs and provider payloads.
- [x] Retain metadata through reconciliation/result/request failure and cleanup;
  keep the browser error unchanged and saved diagnostic-v2 records readable.
- [x] Verify unchanged acceptance boundaries, rejection/cleanup call counts,
  strict metadata limits/privacy, and resilience to a broken logging sink.
- [x] Run the five settled root gates and scoped read-only review; verify backend
  watcher activation and non-metered readiness with normal owner configuration.
- [ ] Owner manual live retest identifies the actual rejecting rule; evaluate
  strictness only after that evidence, without weakening validation preemptively.

Completed verification:

- All five root gates pass: `corepack pnpm format:check`, `corepack pnpm lint`,
  `corepack pnpm typecheck`, `corepack pnpm test:unit`, and `corepack pnpm build`.
  The isolated fake/no-key unit suite passes **902 tests in 79 files**, including
  **383 backend tests in 20 files**. The 32 added checks cover 20 guard reasons,
  five bundle constraints, one use-case cleanup/call-count integration and six
  diagnostic privacy, size, budget and logging-sink cases. The earlier focused
  run passed 123 tests in two files; the final additional size check is covered
  by the settled full suite. Generated frontend type references were restored;
  `apps/frontend/next-env.d.ts` has no diff.
- The compiled strict parser still accepts the preceding 36-record manual UI
  capture with zero drops. Historical text-isolation captures remain readable
  (66 records across ten logs). The transport fingerprint and canonical evidence
  maximum eight remain unchanged. Static credential/account-pattern scanning
  passes across all ten follow-up paths; no provider response content is stored.
- Backend watcher activation is verified by the latest
  `ClipBuilder reconciliation diagnostics ready` marker and a listener created
  after the diagnostic source changes. Backend supervisor/app PIDs are
  **20672/5424**, listening on `127.0.0.1:4000`; frontend supervisor/app PIDs are
  **10900/20712**, listening on `127.0.0.1:3000`. Both owned trees have eight
  processes and stable listeners. Backend health, `/start` and
  `/api/sample/config` return 200 with normal owner configuration. Content-free
  runtime records were refreshed; the healthy services remain running. Backend
  stdout/stderr stay in
  `C:/Users/minat/AppData/Local/Temp/clipbuilder-runtime/restart-backend-adc-20261005-125537/`.

Scoped read-only validation verdict: **Meets ticket for the diagnostic-only
implementation; no actionable findings**. Reviewed the current unstaged
reconciliation follow-up, its new module, diagnostic integration, regression
tests, server marker and owning documents against this section. Compared the
guard diff with its pre-follow-up behavior and inspected the actual use-case
and public error mapping. Coverage: guard identification, bounded schema
classification, private failure propagation, unchanged public errors/cleanup,
privacy/budgets and fake-mode verification are covered; actual live rejection
and strictness judgment remain owner-unverified. Earlier transport/provider and
frontend work is outside this follow-up's review verdict. The full gates were
run during implementation, not repeated by the read-only review. No Git staging
or commit, secret-file inspection, configuration change, paid request, cloud
action or retained-media access occurred in this follow-up.

Fake/no-key checks can verify logging, guard behavior and injected call counts;
they cannot prove genuine Gemini grounding quality. The next real video test is
the owner's manual UI action with existing keys/live flags and approvals. No
local AI model or weights/runtime are used.

### Applied evidence-array transport fix — 2026-10-05

The owner explicitly authorized applying the full identified fix and reserved
the next real retest for their manual UI action. This follow-up sends no paid
diagnostic/video request, uses no credentials directly and changes no private
configuration, cloud resources, retained media, provider settings or Git state.
It remains in CL-007; the existing canonical schemas, adapter and isolated test
setup are the dependency-ready implementation surface.

Change only the provider-bound schema by additionally omitting
`properties.candidates.items.properties.evidence.maxItems`. Preserve local
eight-evidence validation, evidence minimum/word-ID bounds, canonical contract,
transcript/tuple/candidate limits and one-call/cleanup behavior. Activate policy
`analysis_local_evidence_cap`; the resulting fingerprint must match the
previously accepted `e48e4e70308c0f0b3fd9f8384d7166e234a6e8f933f7923719dcee004f6b860e`.
The text-schema probe follows the current production schema. Retire obsolete
component-probe dispatch branches while retaining strict parsing of their old
safe records and policies. No arbitrary diagnostic input is introduced.

Acceptance for this applied fix:

- [x] Actual pinned-SDK video generation sends exactly the accepted schema;
  only the three known transport caps differ from canonical JSON Schema.
- [x] Eight evidence entries normalize successfully; nine are rejected by
  the local array cap with one generation, one deletion and no retry.
- [x] Current dry-run/SDK schema comparison and historical log compatibility
  remain safe; retired CLI cases reject before configuration/network access.
- [x] All five settled root gates, scoped read-only review, leak/link/diff checks.
- [x] Verify watcher reload, new policy marker and non-metered readiness.
- [ ] Owner manual UI video retest and genuine transcript/candidate quality.

Focused evidence: **150 checks in four files** and backend typecheck pass.
The actual SDK-body regression compares canonical JSON Schema with precisely
the three removed hints and checks the full accepted SHA-256. Eight distinct
evidence signals normalize; nine produce the specific local `too_big` issue
with maximum eight and reject without retry. Generation/deletion each occurs
once in both cases. Historical purpose/policy parsing and all seven retired
argument rejections are covered; dry-run retains zero configuration reads/calls.

Final verification: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit` and `corepack pnpm build`
all pass. The unit gate runs **870 tests in 79 files** with hardcoded fake mode,
paid disabled, live flags off and no provider keys/network. Backend accounts
for 351 tests in 20 files; the final isolation suite has 24 checks. The build's
generated frontend type references were restored to their existing development
paths; that file has no residual diff. These checks prove implementation and
synthetic/injected behavior, not real AI quality. No local AI weights/runtime
are used.

The scoped read-only review found no actionable issue in the ten fix paths:
six backend source/test files and the backend guide, this packet, ticket index
and controlled-check record. The canonical contract, dependencies, public routes,
settings, error/cleanup behavior and request counts are unchanged. Strict parsing
with the final built code accepts all **66 saved safe records across ten historical
probe logs**, with one generation HTTP record per log and zero drops. The compiled
production fingerprint matches the accepted value above. Credential-pattern scan,
129 local document-link targets and `git diff --check` pass; the staged diff is
empty. Earlier related worktree changes remain outside this follow-up's verdict.

Watcher activation is verified: backend supervisor/app **18636/14680** on
`127.0.0.1:4000`, frontend supervisor/app **10900/20712** on `127.0.0.1:3000`.
The latest backend startup reports
`ClipBuilder Gemini analysis schema policy analysis_local_evidence_cap ready`;
the owned listener started after the source changes and remains stable. Backend
health, `/start` and `/api/sample/config` return 200. Public configuration reports
live analysis enabled, assembly/render disabled. These non-metered GETs make no
processing request. Both services remain running; content-free process identities
and separate stdout/stderr logs remain under
`C:/Users/minat/AppData/Local/Temp/clipbuilder-runtime/run-20261005-120045/`.
The next genuine video acceptance/transcript/candidate-quality test remains the
owner's manual Find moments action at `http://localhost:3000/start`, using their
existing keys, live flags and approvals. No new paid request accompanies this fix.

### Confirmed evidence-array schema rejection — 2026-10-05

The owner authorized agent-run paid diagnostics until the issue was pinpointed.
Nine subsequent single-generation requests, plus the earlier explicitly approved
text control, isolate a reproducible schema trigger. There were no media uploads,
automatic retries/fallbacks, cloud/configuration changes, persisted generated
outputs or Git mutations. Existing real/key/live/paid/transfer/project gates
remained enabled through normal entry-point configuration loading; secret files
were not inspected or printed. Ordinary fake/no-key tests remain isolated.

| Fixed diagnostic case | Generation HTTP | Provider elapsed ms |
| --- | --- | --- |
| Text, JSON only, no schema (earlier control) | 200 | 27,767 |
| Full original analysis schema | 400 | 1,727 |
| Full schema, both tuple `items: false` omitted | 400 | 1,840 |
| Words subtree unchanged | 200 | 73,913 |
| Candidates subtree unchanged | 400 | 1,350 |
| Full schema, evidence word-ID `maxItems` omitted | 400 | 957 |
| Candidates with evidence field only | 400 | 1,502 |
| Candidates with evidence field removed | 200 | 10,727 |
| Full schema, only evidence array `maxItems: 8` omitted | 200 | 67,348 |
| Full original schema restored after that success | 400 | 3,150 |

Each completed log has exactly one `generate_content` HTTP record and zero
dropped diagnostics. Successful probes have six safe records; failures have
seven. The two decisive full schemas differ only at
`properties.candidates.items.properties.evidence.maxItems`; actual SDK-body
regressions prove that exact difference and unchanged production schema.
Original fingerprint: `de4a25b670fd98f7a4443a29dc6a4e6c0649311b911128ec6048fe9b63cb6f5d`.
Accepted fingerprint: `e48e4e70308c0f0b3fd9f8384d7166e234a6e8f933f7923719dcee004f6b860e`.
Safe proof logs:
`C:/Users/minat/AppData/Local/Temp/clipbuilder-runtime/schema-isolation/text_schema_no_evidence_cap-req_293b1a3dc330427f975be8589529719a.jsonl`
and
`C:/Users/minat/AppData/Local/Temp/clipbuilder-runtime/schema-isolation/text_analysis_schema-req_be54ffbf01ed42cba6dd078ab8e65360.jsonl`.

Conclusion: the evidence array's maximum of eight is a reproducible rejection
trigger in this full schema/configuration, independently of video. The provider
returns only generic `INVALID_ARGUMENT`; its internal decoder/parser reason is
not exposed. Schema-constraint complexity is an inference, consistent with the
[official JSON Schema support/limitations](https://ai.google.dev/gemini-api/docs/structured-output#limitations),
not a claim that all bounds of eight, tuples or video inputs are unsupported.

Concrete proposed fix: omit only that evidence `maxItems` hint in
`analysisGenerationJsonSchema()`, retaining the canonical/local eight-evidence
limit, evidence requirement/minimum, word-ID cap and other schema/input/settings.
The successful full-schema text request verifies acceptance of this proposed
transport change; it does not prove video transcription/grounding/quality or
full-flow acceptance. The UI processing schema has **not** been changed by this
investigation. Paid diagnosis stops at this confirmed trigger. Applying the fix
and a subsequent real video acceptance check are separate work.

Local diagnostic changes expand the fixed CLI allowlist only. Exact transport
diffs, dry-run no-secret/no-network behavior, safe metadata and one-call guards
are covered by injected tests. Unneeded turns-only and minimum-removal probes
were not sent and their branches were removed. All nine retained fixed cases
were exercised in this investigation; no arbitrary schema/media/model/prompt
arguments or diagnostic app routes were added.

Final checks for this settled diagnostic extension:

- [x] Five required root gates and final read-only review.
- [x] Verify service health/ownership after the diagnostic watcher reload.
- [x] Nine paid requests under the latest approval, plus the prior one-command
  control; exactly ten observed generations, zero file uploads/retries.
- [x] Safe logs establish full-schema 400 → single-key omission 200 → restoration 400.
- [x] Owner subsequently authorized the applied transport fix recorded above.
- [ ] Genuine video/transcript/candidate quality and full-flow acceptance.
- [ ] Exact token usage/cost; not captured by these acceptance-only diagnostics
  and not inferred from timings/status. No billing/account API was queried.

Settled verification: `format:check`, `lint`, `test:unit`, `build` and
`typecheck` all pass, with **874 fake/no-key tests in 79 files** (backend 355;
the isolation suite has 30 cases). The build-rewritten Next generated references
were restored to their pre-build development paths before the final root
typecheck; there is no residual change in that generated file. The Windows
artifact's existing 26 external links remain the separate Linux/public-release
limitation, not a diagnostic result. Seven follow-up paths have zero
high-confidence credential-pattern matches; all 135 local Markdown file targets
resolve, and `git diff --check` passes. Nothing is staged or committed.

Final read-only review: **Meets ticket** for this diagnostic scope, with
**no actionable findings**. Reviewed exact fixed-case SDK diffs, original-schema
invariance, privacy/strict metadata, shared local/live/paid/key/approval gates,
single-use/no-retry/abort/body-limit behavior, CLI import/argument boundaries,
unused-case removal and documentation/evidence consistency. Prior frontend and
processing fixes are excluded from this current verdict. No paid call or full
suite was run during read-only review. The generic provider message still does
not prove an internal complexity algorithm or output quality; the tested
constraint trigger and concrete transport-change acceptance are established.

Backend watcher reload and runtime stabilization are verified: backend root/app
18636/6880 on 127.0.0.1:4000, frontend 10900/20712 on 127.0.0.1:3000. Creation
identities/owned descendants and health, `/start`, `/api/sample/config` pass;
records were refreshed. Live analysis remains enabled, assembly/render disabled.
Both services are left running. Original service logs remain at
`C:/Users/minat/AppData/Local/Temp/clipbuilder-runtime/run-20261005-120045/`;
the separate schema-isolation directory holds the safe diagnostic records.
No new service was launched or killed. Deviation from the earlier manual-only
rule: the ten observed diagnostic generations were agent-run under the owner's
explicit one-command and subsequent ongoing-investigation approvals. No
processing fix, video retry, cloud/resource/configuration/Git change was bundled.

### Owner-run text and schema isolation — 2026-10-05

Latest owner approval (2026-10-05): after the successful paid text control,
the owner explicitly authorized agent-run paid diagnostics until the issue is
pinpointed. This supersedes the earlier one-command execution exception for
this investigation, while ordinary tests/CI remain fake/paid-off/no-key. It
does not authorize processing fixes, environment/approval edits, media/cloud
changes, deployment or Git actions. Existing runtime gates remain mandatory.
The next original-schema text comparison returned generation HTTP 400 in
1,727 ms, total 1,803 ms, seven safe records and zero drops. This reproduces
the rejection without video; the schema is a sufficient trigger.

The next bounded diagnostic wave permits at most three single-request commands:
omit both transcript tuples' `items: false`, then retain it on words only and
turns only. All other schema keys, policy, model and generation settings remain
identical. Each fixed case discards output, has no upload/retry/automatic
sequence, and remains guarded/single-use. Normal UI generation is unchanged.
Fake SDK checks verify the exact serialized changes before paid execution.

Adaptive diagnostic decision: omitting both tuple `items: false` entries still
returned HTTP 400 in 1,840 ms (total 1,923 ms, seven safe records, zero drops).
The two restoration probes were therefore not run and were removed. The next
wave uses at most three fixed section cases (words only, turns only, candidates
only), retaining each selected subtree unchanged and requiring only that
property. Exact injected SDK-body changes, production invariance and one-call
behavior pass fake/no-network checks; the expanded isolation suite has 24
passing cases and backend typecheck passes before live execution.

Section results: words alone returned HTTP 200 after 73,913 ms (74,007 ms
total), retaining its tuple, `items: false`, patterns and large integer bounds.
Candidates alone returned HTTP 400 after 1,350 ms (1,424 ms total). Both logs
have zero drops; generated output is discarded. The turns-only paid case was
not needed to establish a sufficient candidate-section trigger and remains unrun.
Next bounded wave: one full-schema request omitting only
`candidates.items.evidence.items.wordIds.maxItems`. The original local cap and
UI request remain unchanged. An injected SDK test proves exactly that one
schema path changes; 26 isolation checks and backend typecheck pass.

The single evidence word-ID cap omission also returned HTTP 400. The next
bounded wave allows two fixed candidates-only requests: all candidate fields
except evidence, and evidence only. The selected property schemas are retained
unchanged and required names match the selected properties. These isolate a
candidate subtree without affecting the normal API or local output validation.
Exact SDK schema differences and safe records are checked with injected transport
before live execution. The live generation count and final logs are recorded
after the wave; usage/cost are not inferred from HTTP acceptance.

Candidate-field results: evidence alone returned HTTP 400 after 1,502 ms
(1,577 ms total), while candidates without evidence completed with HTTP 200.
The evidence subtree is a sufficient rejection trigger. Next bounded wave:
at most two full-schema calls, each omitting only the evidence array's
`maxItems` or `minItems`. The original word-ID cap stays present. The diagnostic
test verifies the exact single deleted path; 34 isolation checks and backend
typecheck pass. No full video request or processing behavior is changed.

The full schema with only evidence `maxItems` omitted completed successfully.
The minimum-removal probe is therefore unnecessary and will not be run. One
final single-request reversal check is authorized within the owner's ongoing
diagnostic approval: restore the exact original schema using the existing
`text_analysis_schema` case after the successful omission. This confirms the
isolated constraint trigger before concluding the investigation.

The owner completed the updated-schema video test and then authorized controlled
schema-versus-video isolation. That attempt had 33 safe run records, zero drops
and the expected `analysis_local_array_caps` policy/fingerprint. Preparation,
upload and ACTIVE readiness passed; generation still returned generic HTTP 400
`INVALID_ARGUMENT` after 4,127 ms (phase 4,145 ms). The run took 61,517 ms and
cleanup reported success. Removing the two large bounds was insufficient;
remaining schema complexity, media and their interaction are not yet separated.

The next dependency is an owner-run comparison of `text_control` (JSON MIME,
no response schema) and `text_analysis_schema` (the exact failed video schema).
The code is prepared locally; all paid execution remains manual by the owner.
Each explicitly confirmed CLI invocation is one generation request, with no
upload, retry, fallback, second automatic call or generated-output persistence.
This comparison allows up to two explicit owner diagnostic requests; it does
not alter public admission or the normal analysis/assembly budgets. If control
fails, stop before the second paid command. A later video-control or schema
component comparison depends on these results and is not dispatched/pre-enabled.

Latest owner decision (2026-10-05, this follow-up): the owner explicitly asked
the agent to run the displayed `--confirm-paid text_control` command, monitor
its safe diagnostics and report the result. This authorizes one agent-executed
paid text-only control request as a narrow exception to the earlier manual-only
execution rule. It does not authorize the schema probe, another video run,
retries, configuration/approval edits, cloud changes or renderer work. Existing
local/live/key/transfer/paid-project runtime gates must still pass. Execution
and its result will be recorded below; the ordinary fake/no-key test policy
remains unchanged.

The adapter owns a shared bounded Google client and generation-settings builder,
so production analysis, selected plans and probes retain the pinned SDK and
existing flags/keys/approvals, body/timeout limits and one-attempt policy. The
isolation port is local-only, accepts two fixed cases, discards model output,
and allows one invocation per instance. Its structured schema is derived from
the same canonical source as production. Probes retain the analysis policy and
request text, removing the file part; they assess HTTP acceptance rather than
transcript/quality validity. No private media or retained master is read.

`gemini.isolation.entry.ts` is an import-inert executable. Without the exact
two arguments (`--dry-run` or `--confirm-paid`, plus a known case) it reads no
configuration and calls no provider. Dry-run uses hardcoded fake/paid-off/test
configuration and no keys/local file/SDK client/network. Only explicit owner
confirmation in non-test local execution loads normal backend local configuration.
The same live analysis/key/transfer/paid-project gates still apply. No setting,
approval, model, numerical limit or secret is edited. Fake/test/public composition
cannot run the paid probe. No local AI weights/runtime are used.

Strict v2 telemetry adds action `probe`, two fixed purposes and schema policy
`json_only`. A missing schema is explicit (no fabricated fingerprint). CLI
request completion omits application HTTP status; transport status is still
captured before SDK mapping. Safe logs have separate unique paths in the OS
temporary `clipbuilder-runtime/schema-isolation/` directory. The final result
contains only case, SDK completion, opaque request ID and log path. No provider
body/message/output, prompt, credential, URI or private value survives. Existing
48-record/2,048-character bounds and failure reserves remain. SIGINT/SIGTERM abort
the request and listeners are removed; response readers retain bounded cleanup.

Acceptance for this isolation preparation:

- [x] Owner-run CLI with explicit confirmation, strict argument allowlist,
  import inertia and zero-call/no-local-config dry-run mode.
- [x] Fixed two-case port, local/live/key/approval gates, single-use guard and
  exact injected call counts. Rejection, pre-abort and timeout classification
  remain safe, with no retry. Timeout is distinct from user cancellation.
- [x] Actual serialized SDK bodies differ only by `responseJsonSchema` between
  probes, with no file part/transfer and the production policy/settings. Real
  analysis's existing request/cleanup checks continue to pass.
- [x] Safe HTTP/SDK/phase records and result handling, no invented application
  HTTP status, no returned/generated text or arbitrary values in diagnostics.
- [x] Initial **139 focused checks in four files** passed; final review added a
  timeout-classification regression, and all 16 new isolation checks pass.
  Required setup and commands are owned by
  the [backend guide](../../apps/backend/README.md#owner-run-gemini-request-isolation).
- [x] Settled five root gates, executable dry-run verification and final review.
- [x] Verify both local services still healthy and refresh watcher identities.
- [x] One agent-executed control under the latest explicit owner exception:
  HTTP 200, SDK completed, six safe records and zero drops, 27,846 ms total.
- [x] The owner subsequently authorized agent execution of the schema case and
  adaptive diagnostics; the confirmed constraint result is recorded above.

Changed files for this follow-up: backend `gemini.adapter.ts`,
`gemini.diagnostics.ts`, `gemini.diagnostics.test.ts`, `analysis.diagnostics.ts`,
new `gemini.isolation.entry.ts`/`gemini.isolation.test.ts`, backend package script
and README, this packet, its index and controlled-check record. Earlier changes
are preserved; no dependency, public endpoint, Git, cloud or environment mutation.

Final evidence: all five root gates pass (`format:check`, `lint`, `typecheck`,
`test:unit`, `build`), with **860 fake/no-key tests in 79 files** (backend 341).
The final isolation suite has 16 passing cases. Both actual package-script
dry-runs succeed with zero provider requests and no owner configuration reads;
tsx's initial Windows sandbox `os.userInfo` restriction was resolved by approved
dry-run execution outside the sandbox, without changing code or operating flags.
The control has no schema; the schema plan matches fingerprint `de4a25b670fd98f7`
and maximum array bound 8. Next development references were restored after build,
and the final root typecheck passes. The Windows artifact's existing 26 external
package links remain a separate Linux/public release gate.

Final read-only review: **Meets ticket** for local isolation preparation, with
**no actionable findings** after resolving the timeout/cancellation mismatch.
Reviewed the shared production transport/settings, actual serialized one-field
comparison, exact request counts, CLI import/confirmation/setup guards, strict
safe diagnostics, body/abort handling, signal-listener cleanup, dependency
direction, dead/debug code, casts and owning docs. Eleven follow-up paths have
zero high-confidence credential-pattern matches; 132 local document targets
resolve and `git diff --check` passes. Earlier frontend changes remain outside
this verdict. No full suite or paid request was run during read-only review.

Both services remain healthy after watcher reload: backend supervisor/app PIDs
18636/10524 on 127.0.0.1:4000; frontend 10900/20712 on 127.0.0.1:3000. Creation
identities and listeners passed stabilization, runtime records were refreshed,
and health, `/start`, `/api/sample/config` returned 200. Public config still
reports live analysis enabled, assembly/render disabled. Existing service logs
remain under `C:/Users/minat/AppData/Local/Temp/clipbuilder-runtime/run-20261005-120045/`;
future owner probe logs use the separate schema-isolation directory. No new
service was launched or killed. No secret file was inspected or printed, no
retained master was read, and nothing is staged/committed. Preparation itself
made no paid requests; the subsequent explicitly authorized control is recorded
below. Schema/video acceptance, output quality and root cause remain unverified.

Paid control evidence (2026-10-05): the displayed package command was executed
once under the latest owner exception, with normal entry-point configuration
loading and unchanged runtime gates. The request used `text_control`/`json_only`,
no schema/file part/upload, the production model/settings and one SDK attempt.
Its only `generate_content` HTTP record returned 200 after 27,767 ms; generation
and SDK completion succeeded, total 27,846 ms, six safe records and zero drops.
The CLI exited 0. Model output was discarded and not validated for quality.
Safe log:
`C:/Users/minat/AppData/Local/Temp/clipbuilder-runtime/schema-isolation/text_control-req_d1a47703d8ad4ef18d3708b1a1c3482f.jsonl`.
This establishes baseline text-only acceptance for the configured API/model and
settings; it does not separate schema from video yet. The owner's latest UI run
also produced 33 safe records/zero drops: upload/readiness passed, generation
returned HTTP 400 `INVALID_ARGUMENT` after 4,122 ms, total 59,947 ms, cleanup
reported success. No schema probe, video retry, cloud/configuration change or
processing fix accompanied this paid control. Deviation: one live text control
was agent-executed under the explicit owner exception; future paid calls still
require owner execution or another explicit authorization.

### Isolated generation-schema remedy — 2026-10-05

The owner explicitly authorized processing fixes and isolation of the generation
rejection, then backend hot reload for their next manual Find moments test.
This supersedes the diagnostic-only scope for this follow-up. The owner-only
paid-test rule and independent cloud/rights/spend gates remain; agents send no
live probes, fallbacks, retries or paid analysis.

The owner's diagnostic-v2 attempt produced 33 safe run records with zero drops.
Media preparation, proxy checks, Google upload and ACTIVE file readiness passed.
The one generation exchange returned HTTP 400 after 4,191 ms; the run took
59,388 ms. Retained classification was generic `INVALID_ARGUMENT`, with no
recognized specific reason, parameter or schema keyword. Generation failed
before output validation/reconciliation. All three cleanup phases reported
success, which is not independent deletion proof. The exact cause remains unknown.

Research identifies a candidate cause: large `maxItems` constraints can make
constrained generation reject even a small serialized schema. The
[official structured-output guide](https://ai.google.dev/gemini-api/docs/generate-content/structured-output?hl=en)
documents array/tuple support and rejection of complex schemas. A
[first-hand responseJsonSchema probe](https://brightwrapper.com/gemini-schema-lab)
reports a generic 400 disappearing when a large array bound alone was removed.
[Google SDK issue 2170](https://github.com/googleapis/python-genai/issues/2170)
corroborates cumulative array complexity in a different function-calling
request/model. Neither proves our cause or gives a universal threshold.
The pinned local SDK forwards `responseJsonSchema` unchanged. Our failed schema
had outer word/turn bounds of 12,000/10,000; tuple support itself is documented.

The remedy changes one factor: omit only `words.maxItems` and `turns.maxItems`
from a fresh source-analysis transport schema. `geminiWireSchema`, normalization
and reconciliation remain canonical with the original local caps. Tuple lengths,
candidate/evidence/string/time bounds, strict objects, minimum word count,
body/output/media caps, model, prompt, video input, timeout, token budget, tools
and one-attempt policy remain intact. Selected-plan generation retains its
canonical schema. There is no alternate request or new configuration switch.

The optional `gemini_request.generationRequest.schemaPolicy` labels source
analysis as `analysis_local_array_caps` and selected plans as `canonical`.
Fingerprint/summary describe the actual outgoing schema; older v2 records remain
parseable. Startup prints the content-free marker
`ClipBuilder Gemini analysis schema policy analysis_local_array_caps ready`.
The largest remaining outgoing array bound is 8; large counts remain enforced
locally after generation rather than by Google's constrained decoder.

Acceptance and evidence:

- [x] Isolate the actual pinned-SDK schema against the canonical validator:
  deep equality after removing exactly the two named bounds, unchanged
  prompt/video/settings and exactly one generation request.
- [x] Synthetic checks accept each local count cap and reject cap plus one.
  Provider validation rejects oversized words/turns, malformed word/turn tuples
  and five candidates, deletes once and performs no retry.
- [x] Injected HTTP-400 integration retains safe classification, new policy,
  maximum bound 8 and exact call counts. All **124 focused checks** pass with
  fake/paid-off/no-key and denied external network.
- [x] Settled five root gates and final read-only validation.
- [x] Verify watcher activation, owned process identities and non-metered GET
  readiness, leaving both healthy services running.
- [x] Owner manually repeated Find moments; the updated schema still received
  HTTP 400, as recorded in the next isolation follow-up above. Real acceptance,
  grounded quality, physical deletion and the exact cause remain unverified.

Local isolation proves the request change and retained validation. Injected
responses do not reproduce Google's decoder or constitute a live A/B experiment.
`FAKE_MODE=true` supports synthetic checks/fixtures without keys. Real
understanding requires provider keys, enabled live flags and existing approvals,
with the owner triggering the paid action. No local AI runtime/weights are used.
Both retained masters remain untouched. No dependency, environment/approval edit,
cloud action, service launch or Git mutation is part of this remedy.

Changed files: backend `analysis.provider-shape.ts`, `gemini.adapter.ts`,
`gemini.diagnostics.ts`, `analysis.test.ts`, `analysis.diagnostics.test.ts`,
`gemini.diagnostics.test.ts`, `server.ts`, backend README, this ticket, its index
and the controlled-check record. Related earlier worktree changes are preserved.

Settled verification: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit` and `corepack pnpm build`
all pass. The unit gate passes **844 tests in 78 files** (backend 325; other
package counts unchanged). The build's Windows artifact still has 26 external
package links; Linux/public release self-containment remains a separate gate.
Generated Next references were restored to the existing development paths and
the post-build root typecheck passes. All 127 owning-document local link targets
resolve; `git diff --check` passes. Eleven follow-up files have zero
high-confidence credential-pattern matches. Nothing is staged or committed.

Offline compiled summaries confirm the canonical fingerprint still matches the
owner's failed request:
`084902270895667741d6692de63a04754346c9e6a83de3f04916a2b7bf2bc531`
(3,186 bytes; maximum array bound 12,000). The outgoing fingerprint is
`de4a25b670fd98f7a4443a29dc6a4e6c0649311b911128ec6048fe9b63cb6f5d`
(3,152 bytes; maximum array bound 8). Both retain 33 schema nodes, depth 6,
two tuples, two boolean-items constraints and zero references. These hashes
describe code-owned schemas, not private input or provider content.

Hot reload is verified: the current backend app PID **20572**, under supervisor
**18636**, was created after the source changes and listens on 127.0.0.1:4000.
Its latest startup contains the new policy marker. Frontend supervisor/app PIDs
**10900/20712** remain on 127.0.0.1:3000. Identities/listeners passed a stabilization
check and content-free runtime records were refreshed. Backend health, `/start`
and `/api/sample/config` returned 200; public config reports live analysis enabled
and assembly/render disabled. Separate stdout/stderr logs remain under
`C:/Users/minat/AppData/Local/Temp/clipbuilder-runtime/run-20261005-120045/`.
Only readiness GETs were sent. No process was launched/killed or owner setting
changed by this remedy; both requested services remain healthy and running.

Final read-only validation: **Meets ticket** for this isolated local remedy,
with **no actionable findings**. Reviewed the real adapter call path, canonical
local validation, exact request-difference/injected-count tests, optional strict
diagnostic field, startup activation, failure/cleanup behavior, dependency
direction, privacy, duplicate/dead/debug code, casts, touched-resource ownership
and owning docs. Earlier unrelated frontend fixes were preserved, outside this
remedy verdict. No full suite or live dispatch was run during the review.
Real provider acceptance, root cause, AI quality and independent deletion remain
**Unverified** for the owner's next manual attempt. Deviation: none.

### Expanded rejection diagnostics — 2026-10-05

The owner authorized a diagnostic-only implementation after the read-only audit
of their latest manual attempt. The saved run contained 35 valid safe records:
sample preparation/transfer succeeded in 113,810 ms; media preparation, proxy
validation, Gemini upload and file readiness succeeded; generation returned
upstream HTTP 400 after 3,491 ms. Gemini/proxy/source cleanup reported success.
The backend/frontend returned application HTTP 500 with
`ANALYSIS_PROVIDER_FAILED` / `google_generation_http_400`. Several propagated
failure records describe one generation call. They do not imply retries.
The SDK's detailed rejection was not retained, so its exact cause is still
unknown. Model, schema format, prompt, budgets, operating flags, status mapping,
retry, cleanup and browser behavior remain unchanged by this follow-up.

`analysis/gemini.diagnostics.ts` owns bounded classification and code-owned
request-schema summaries. Diagnostic v2 retains recognized gRPC/ErrorInfo codes,
fixed categories, known parameter names/schema tokens, detail types, count/drop/
truncation indicators and classification sources. It labels generic, absent,
malformed and oversized details rather than inventing a cause. Only static enums
and bounded numeric values survive; raw messages, provider bodies/metadata,
field descriptions, resource/account/file identifiers, URLs, headers, prompts,
transcripts and credentials are excluded. Unknown parameter names become
`unrecognized`; structured fields take priority over message matches. Message
classifications are clues, never permission for speculative processing changes.

The real `composeAnalysis` passes the same diagnostic sink to the transport.
HTTP responses are inspected in memory before SDK/manual error mapping, so
generation, Files upload/finalize/get/delete/list rejections remain observable.
HTTP completion is separate from lifecycle success; expected deletion-confirmation
403/404 cannot alone establish a failed cleanup. Successful polls are summarized
by the enclosing phase instead of flooding logs. The pre-generation record
contains fixed model/API/settings and static schema fingerprint/size/depth/node/
tuple/boolean-items/array-bound/reference/keyword summaries, without schema text
or source-media fingerprints. Stage and request clocks are distinguished.
All records remain strictly validated and limited to 2,048 characters/48 per
request. Seven slots are reserved for failures after 40 ordinary records and one
for terminal status plus dropped-record count. Startup advertises v2 readiness.

Acceptance for this diagnostic-only follow-up:

- [x] Original Google status/reason/known-field classifications are captured
  before error mapping; the primary error and cleanup semantics are preserved.
- [x] Injected pinned-SDK and manual Files error paths prove exact request counts,
  capture ordering, sensitive-value exclusion and sink-failure independence.
- [x] Classifier cases cover schema/parameter/media/file/model/key/billing/quota/
  region/safety categories, generic/unknown statuses, malformed/oversized bodies,
  bounded scanning and strict output validation.
- [x] Existing phase/request correlation remains; reserved critical/terminal
  slots retain late errors and explicit drop counts under saturation.
- [x] Settled five root gates and final read-only validation.
- [x] Confirm the running backend's v2 readiness marker and non-metered local
  GETs; update its owned runtime identities after watcher reload.
- [x] Owner alone reran the paid analysis; the diagnostic-v2 failure is recorded
  in the isolated-remedy follow-up above. Provider acceptance, AI quality,
  independent deletion and the proposed remedy remain unverified.

No agent-run paid flow, cloud change, environment/approval edit, deployment or
Git mutation is authorized. Existing related CL-007 worktree changes are
preserved. Both retained masters stay untouched. This diagnostic expansion
cannot recover the previous discarded rejection or guarantee that Google will
provide a specific cause on the next attempt.

Verification evidence for this follow-up:

- All five settled root commands pass: `corepack pnpm format:check`,
  `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit` and
  `corepack pnpm build`. The fake/no-key/network-denied unit gate passed **839
  tests in 78 files**: root 33, contracts 60, composition 3, backend 320,
  frontend 351 and renderer 72. Backend coverage adds 37 checks across the new
  classifier suite and existing diagnostic integration suite. The Linux/public
  release gate remains open: the local Windows artifact has 26 external package
  links, as already documented. Generated Next references were restored to the
  existing development paths after build.
- The existing backend watcher reloaded the change; its latest startup marker is
  `ClipBuilder analysis diagnostics v2 ready`. Verified backend supervisor/app
  PIDs are 18636/14632 on 4000; frontend supervisor/app PIDs are 10900/20712 on
  3000. Owned runtime identities were refreshed after reload. Backend health,
  `http://localhost:3000/start` and `/api/sample/config` returned 200. Public
  configuration reports live analysis available and assembly/render unavailable;
  no operating setting was edited. Readiness GETs made no processing dispatch.
- Existing separate stdout/stderr files remain under the content-free runtime
  directory `C:/Users/minat/AppData/Local/Temp/clipbuilder-runtime/run-20261005-120045/`.
  Backend diagnostic records go to `backend.stderr.log`; stdout remains separate.
  Both healthy requested services remain running. No service was launched or
  killed by this diagnostic follow-up, and both retained masters remain untouched.

Changed files for the expanded logging: backend `gemini.diagnostics.ts` and its
new tests, `analysis.diagnostics.ts` and its existing tests,
`gemini.adapter.ts`, `analysis.composition.ts`, `server.ts`, backend README,
this ticket, its index and the controlled-check record. Related earlier local
fixes are preserved. Nothing is staged or committed; no dependency was added.

Final read-only validation: **Meets ticket** for the diagnostic-only follow-up,
with **no actionable findings**. Capture before SDK/manual error mapping,
production sink wiring, fixed metadata/parameter/schema classification,
clock/correlation/budget behavior, privacy, exact injected call counts and
log-failure independence are covered. Inspecting the adapter confirms unchanged
generation inputs, one-attempt policy, abort/body bounds and stream cleanup.
Backend dependency direction, strict centralized diagnostic schemas, duplicate/
dead/debug code, casts, secret patterns and touched-resource ownership were
reviewed; `git diff --check` passes. The review included the relevant unstaged
backend changes, both new diagnostic files and packet/documentation diffs;
earlier frontend fixes were preserved and are outside this logging verdict.
The post-build root typecheck passes with restored development references.
Actual Google rejection specificity, paid acceptance, AI quality and independent
provider/cloud deletion remain **Unverified**, exclusively for owner-run checks.
Deviation: none. No full suite or live service dispatch was run during the
read-only review; the required five gates above ran before it.

### Priority backend diagnostic follow-up — 2026-10-04

The owner prioritized checking existing backend logs and authorized implementation
of meaningful logging **only if the existing logs could not diagnose the failure**.
A fixed-code scan of all 30 saved backend stdout/stderr logs found no analysis
failure code or Google failure rule. The current run's backend stdout/stderr
were only 42/147 bytes before instrumentation. The executable server logged
startup/shutdown; the error handler returned safe diagnostics without emitting
them. The ignored local supervisor also reduced unknown output to generic
redacted categories. The historical provider cause therefore remains unavailable,
not resolved.

Implemented only that conditional diagnostic scope:
`analysis/analysis.diagnostics.ts` owns an injected sink, bounded request context
and safe stage records; explicit `server.ts` composition enables stderr output.
`app.ts` attaches opaque request correlation to the four fixed analysis actions
and records application errors/completion. `composition.ts` and
`analysis.composition.ts` pass the same diagnostic instance to source orchestration
and Gemini. `analysis.usecase.ts` and `gemini.adapter.ts` record source/proxy,
provider and cleanup phases before subsequent failures can overwrite the returned
error. No model/prompt/schema/budget/status mapping, retry, operating flag,
frontend behavior or cleanup response semantics changed.

Records contain fixed action/phase/outcome, bounded timings, opaque request ID,
application HTTP status, separate upstream status when known, allowlisted error
class/network code and source-controlled error code/rules. There are at most 48
records per request. Raw exceptions/messages/stacks, content, inputs/outputs,
private/provider/session identifiers, credentials and capabilities are excluded.
No provider call or durable storage is added. Sink/unsafe diagnostic-property
failure cannot change processing. The original failure survives **in the log**;
the planned change to prevent cleanup masking it in the response remains open.
The same backend-owned strict validator checks both emission and the new ignored
launcher capture. It rejects unknown fields, arbitrary values and oversized lines;
the launcher retains valid diagnostic JSON and continues redacting every other
unrecognized line. No raw-output logging bypass is enabled.

Synthetic verification covers strict shared record validation, concurrent request isolation, privacy, record
limits, failing sinks, exact one-generation-call behavior and original generation
failure followed by provider/proxy/source cleanup failures. The diagnostics and
additional regression tests run under the hardcoded fake/paid-off/no-key network
guard. Final root checks and local activation are recorded in the
[priority backend diagnostics record](../operations/GROUNDED_ANALYSIS_CHECK.md#priority-backend-diagnostics--2026-10-04).
All five root gates pass with 785 synthetic tests in 76 files. The isolated
launcher-capture check retains safe records and rejects a payload-bearing record.
Verified restart leaves healthy backend/frontend instances with the new capture
path; genuine provider success and the historical failure cause remain unproved.

Remaining diagnosis: use the next **owner-triggered** attempt's request ID to
find the earliest failed phase, its safe rule/upstream status and elapsed time.
Reproduce that exact failure with an injected transport, document its cause and
file-level remedy. If the saved failed response becomes available sooner, use
its safe rule without a new attempt. The owner authorized the local fixes on
2026-10-05; response-error preservation and console/rotation implementation are
recorded below. No agent-paid test is permitted.

### Local implementation and validation — 2026-10-05

The accepted Find moments click starts one wait clock before the first journal
write. Six planned messages rotate every five seconds across journal, grant,
verification, sample-copy/upload and analysis. A stable status instance retains
elapsed time across the operation transition; success, failure, cancellation
and Exit stop the timer. Technical phase labels no longer gate rotation.

Backend source/proxy/provider cleanup records its own diagnostics and preserves
the primary safe application error. Successful generation with failed cleanup
still fails closed as `CLEANUP_PENDING`; provider deletion obligations and
consumed-action fences remain. No automatic generation retry was added.
A fresh strict-record scan of 17 saved backend stderr logs found zero valid
analysis diagnostics. The historical upstream phase/status therefore remains
unknown; the local application 500 cannot establish an upstream 500. No model,
request schema, timeout or budget change is justified by that missing evidence.

The document-wide Turnstile loader shares loading/readiness, carries the current
document nonce and retains the SDK through widget unmounts. Widgets remove only
their own instance/subscription. Failed SDK loading can be retried once per new
mount; stale load/error/token callbacks are ignored. Existing verification-only
retry does not redispatch processing.

Development style elements permit `unsafe-inline` without a conflicting style
nonce. Production preserves nonce-restricted styles and strict script policy.
Synthetic browser attribution identified Remotion's fixed Player stylesheet and
inline silent-audio pool. The pinned Player has no CSP nonce parameter, so an
exact stylesheet hash is allowed and checked against its installed producer;
`media-src` permits the fixed `data:` audio alongside existing self/blob media.
No remote media origin was added. Zod's constructor-time eval probe also violated
production CSP. `instrumentation-client.ts` synchronously enables its interpreter
before application schema construction; a regression denies `Function` and
proves valid/invalid contracts still validate without a compilation probe.
The only remaining production inline-style report in the checked browser is its
inspection overlay (`.hover-box`), excluded from application acceptance.

The token CSS preload is generated by Next.js 16.3.7: development emits an
`as=style` Link header whose URL is also consumed by a stylesheet link. Owned
source contains no duplicate preload. Direct load, client navigation and a
temporary/restored stylesheet touch under the development HMR connection produced
no application CSP or unused-preload warning in this check. Production emits no
CSS preload header in the checked documents and consumes its CSS as stylesheets;
no warning was observed. The original warning was not reproduced, so its exact
historical trigger remains unconfirmed. No warning suppression, arbitrary
dependency upgrade or speculative preload change was made.

Verification evidence:

- Backend focused checks: 82 tests in 2 files, including 400/403/429/500/503 with
  simultaneous proxy/source cleanup failure, failed upload admission, successful
  generation with failed cleanup, and existing abort/deadline/output/call-count
  coverage. The original safe error/rule survives; exact counts prove no retry.
- Frontend clock/loader/flow/policy checks cover six-message wraparound, terminal
  labels, the click clock before and after operation creation, deferred grant
  and upload transfer, concurrent/Strict Mode/sequential SDK lifetimes, existing
  script reuse, correct nonce, failure/retry and late callbacks.
- Actual SampleExperience in an isolated synthetic browser: the message appears
  at elapsed `00:00` with zero grant/analysis calls while journaling is deferred.
  Rotation wraps before preparation finishes; the operation starts at elapsed
  `00:30`, without resetting the clock. Both verification phases and deferred
  sample preparation retain the loop. Synthetic success/failure stop the owned
  interval; cancellation/Exit return home while preparation is pending. A
  failure run makes exactly one grant, one sample call and one analysis call.
- The production bundle passes direct entry and landing-to-intake navigation
  without application CSP violations. Development uses isolated ignored output;
  fake public configuration is injected, processing routes are blocked,
  environment-file loading is disabled and server external sockets are denied.
  No real media, Turnstile endpoint, provider key or paid processing is used.
- Settled root gates: `corepack pnpm format:check`, `corepack pnpm lint`,
  `corepack pnpm typecheck`, `corepack pnpm test:unit` and `corepack pnpm build`.
  All pass. Unit coverage is **802 tests in 77 files**: root 33, contracts 60,
  composition 3, backend 283, frontend 351 and renderer 72. Generated Next type
  references were restored to the existing dev paths; the final root typecheck
  passes after restoration. `git diff --check` passes.
- Temporary browser-server roots 3896/20916/16888 and their owned children are
  gone; ports 49745/60463/57473 have zero listeners, including the stabilization
  recheck. Earlier trial servers were also stopped and checked before replacement.
  Only ignored synthetic harness/screenshot evidence remains under
  `artifacts/qa/analysis-fixes-20261005/`; retained masters are untouched.

Changed files: backend `analysis.usecase.ts`, `gemini.adapter.ts`,
`analysis.test.ts`, `analysis.diagnostics.test.ts` and its README; frontend
`sample.experience.tsx`, `processing-status.tsx`, `review-revision.test.tsx`,
`processing-challenge.ts`, `processing-challenge.test.tsx`,
`source-analysis.flow.test.ts`, `proxy.ts`, `proxy.test.ts`,
`browser-security-policy.ts`, `instrumentation-client.ts`,
`instrumentation-client.test.ts` and its README; this packet, the ticket index,
source of truth and controlled-check record. All changes are unstaged; no Git
mutation was performed.

Final read-only validation of the complete relevant worktree (including new
policy/startup files and ticket changes) found **no actionable local findings**.
Verdict: **Meets ticket with concerns**. Immediate/stable rotation, primary-error
preservation, production/dev CSP, SDK lifetime and preload attribution are
covered. Historical provider diagnosis and the original preload trigger remain
unverified; normal restart and every owner-only paid/real-quality/deletion/release
gate remain unchecked. Required synthetic checks are complete; their success
does not waive those gates. Dependency direction, shared schemas/constants,
dead/debug code, casts, content safety and touched-resource cleanup were reviewed.

Deviation from the original style remedy: use the pinned Player's exact CSS
hash because it exposes no nonce option. The Zod startup configuration and
Player silent-audio permission follow actual production CSP attribution.
The preload investigation found no owned defect to change. Normal owner app
services were not restarted; only fake temporary browser harnesses were launched.
The local Windows artifact inventory still contains 26 external package links
and is not target-platform public-release proof.

`FAKE_MODE=true` and no API keys support these fixture/injected checks, not real
AI quality. Genuine analysis still requires the provider key, enabled live/paid
capabilities, renderer/storage access and recorded approvals; both paid input-path
tests remain owner-only. Actual provider/cloud deletion, rights, visual/audio
quality, device checks and public deployment remain unchecked. No local AI
runtime/weights, provider/cloud mutation, deployment or Git action occurred.

### Evidence and uncertainty

The latest owner-run sample attempt started rotating its wait messages only
after roughly two minutes, then showed **The analysis service could not finish
the request**. The owner reported `/api/analysis/run` returning HTTP 500,
blocked inline styles, a duplicate Turnstile SDK warning and an unused CSS
preload warning. Do not commit the screenshot or full console output.

| Observation | Code evidence | Conclusion |
| --- | --- | --- |
| Rotation starts late | `sample.experience.tsx` enables `findingMoments` only when `analysisLabel` equals `Reading your video and finding moments`; `source-analysis.flow.ts` sets that label after grant, first verification, sample copy/upload and second verification. | Confirmed UI gating bug. Start the loop with the accepted Find moments action and keep it through preparation. |
| Analysis HTTP 500 | The displayed message belongs to `ANALYSIS_PROVIDER_FAILED`. `gemini.adapter.ts` uses that code for upload/generation failures, while `errorMapper.ts` defaults it to 500. The frontend bridge preserves upstream status and safe error JSON. | This is an application error status, not proof Google returned 500. Its exact phase/status remains unknown until the safe `error.ruleId` is recovered. |
| Inline style CSP errors | `proxy.ts` always requires a nonce for style elements, including development. The installed Next.js package contains the reported dev-overlay `font-styles` module; the installed style-loader injects style elements. | Confirmed development policy incompatibility. The individual blocked React style element still needs attribution; do not assume it belongs to Remotion. |
| Turnstile already loaded | `processing-challenge.ts` inserts its own script whenever `window.turnstile` is absent and removes it on unmount. There is no shared in-flight load. Next.js Strict Mode is enabled. | Confirmed loader race vulnerability; Strict Mode/remounts are a plausible trigger, not runtime proof of this warning's exact trigger. |
| Unused token CSS preload | The console names a Next.js-generated CSS chunk. | Performance warning with an unconfirmed cause. Check after fixing style loading; it is not evidence of the server analysis failure. |

The initial planning pass found that the existing safe error envelope includes `code`, `requestId` and an
optional `ruleId`. A filtered inspection of the current ignored runtime logs
found no detailed Google failure rule. At that point the backend error handler
did not emit one; the priority follow-up above now adds structural logging.
No secret, real media, provider payload or live response was read, and no
provider request was issued during this planning pass. The owner was asked for
only `error.code` and `error.ruleId` from the existing failed response; the plan
does not depend on another paid attempt.

### Ordered implementation plan and file ownership

1. **Identify and fix the analysis failure.** First recover the existing safe
   response rule if available. Otherwise add a bounded, content-free diagnostic
   at the existing error boundary: allowlisted phase, error code, integer HTTP
   status, elapsed duration and opaque request correlation only. Do not log raw
   exceptions, SDK messages/stacks, bodies, prompts, transcripts, file names,
   provider IDs, session/grant IDs, URLs, headers or credentials. Inspect the
   exact pinned SDK request and reproduce the identified path with injected
   transports. Separate upload-start/finalize, file processing, generation,
   output validation and cleanup failures. Check model/API/request-schema
   compatibility only when the diagnostic points there; change no model,
   timeout, prompt, token budget or operating flags merely to hide a failure.
   Keep the primary failure when proxy release or source cancellation also
   fails: current `finally`/`catch` cleanup awaits can overwrite it. Record
   cleanup separately and preserve quiet Exit. Map safe statuses deliberately;
   a local 500 must never be presented as a confirmed upstream status.
   Preserve the one-generation-call policy, consumed-action fence, aborts and
   deadlines. Never add automatic generation retry or repair calls.
   Primary files: backend `analysis/gemini.adapter.ts`,
   `analysis/analysis.usecase.ts`, `http/errorMapper.ts`, `app.ts` and their
   tests. Add a named analysis diagnostic module only if it has a real caller.
   Frontend `source-analysis.api.ts` and `api/analysis/[action]/route.ts` change
   only if evidence shows safe details are lost at that boundary. Shared
   `errors.schema.ts` changes only for a necessary cross-boundary contract.

2. **Rotate from the beginning.** Give the accepted Find moments action one
   stable wait lifetime. Show the first friendly message immediately, advance
   every five seconds, wrap and continue during grant/verification, sample copy
   or upload, proxy preparation and AI analysis. Remove the label-string gate;
   internal phase labels must not select whether the loop runs. Preserve elapsed
   time across phase changes and stop the timer on success, failure, cancellation
   or Exit. Friendly copy describes the task, not measured completion or an ETA.
   Planned copy: “Finding your standout moments…”, “Looking for hooks that grab
   attention…”, “Searching for stories worth sharing…”, “Looking for clear ideas
   and memorable reactions…”, “Finding moments that work as standalone clips…”
   and “Looking for a strong setup and payoff…”. Primary files:
   `sample/sample.experience.tsx`, `sample/processing-status.tsx`,
   `source-analysis/source-analysis.flow.ts` if needed for the start boundary,
   and focused frontend tests. Keep replay/persistence and double-click fences.

3. **Correct style loading and verify production security.** Follow Next.js's
   documented development policy: allow inline style elements only in
   development; keep nonce-restricted style elements in production. Do not
   combine a development style nonce with `unsafe-inline` and assume both work.
   Keep the existing script nonce/strict-dynamic policy and the intentional
   style-attribute allowance for fixed React/Remotion geometry. Trace each
   remaining blocked style element in a synthetic browser run. If an owned
   production injector exists, pass the request nonce at its supported boundary
   or use owned external CSS; do not globally weaken production CSP or monkey
   patch DOM insertion. Never confuse Remotion's internal numeric render nonce
   with a CSP nonce. Primary files: `src/proxy.ts`, `src/proxy.test.ts`,
   `src/app/layout.tsx` and the actually identified style owner only if needed.

4. **Load Turnstile once per document.** Separate document-wide SDK loading
   from per-widget lifetime. Share one in-flight load/readiness outcome, reuse
   an already loaded or loading script, and pass the current document CSP nonce.
   Unmount removes only the owned widget and its callbacks, not a successfully
   loaded shared SDK. Failed loading can be retried without duplicate scripts;
   handle Strict Mode setup/cleanup/setup, simultaneous consumers, HMR and late
   callbacks. Retain interaction-only appearance, centered verification dialog,
   one token per action, cancel/timeout handling and verification-only retry.
   An SDK/UI retry must never redispatch upload or generation. Primary files:
   `source-analysis/processing-challenge.ts`, `analysis-challenge.tsx` and
   `processing-challenge.test.tsx`; create a focused script-loader module only
   if separating that responsibility improves ownership.

5. **Resolve any remaining preload warning.** Inspect generated document/link
   headers in both development and a synthetic production build: destination
   `as=style`, CSS URL reuse, actual stylesheet application, CSP, navigation and
   HMR behavior. Fix an owned duplicate/incorrect preload if reproduced. If the
   warning is limited to the pinned Next.js dev runtime, document exact evidence
   and verify production absence rather than suppress console warnings or add
   arbitrary package/config changes. Primary files: `src/app/layout.tsx`,
   `next.config.ts` or stylesheet imports only if attribution requires them.

### Acceptance and test evidence

- [x] Classify the current failure from its safe rule, or explicitly record
      that the historical cause was unavailable. Prove a reproduced application
      defect and its fix with synthetic transport data before calling it resolved.
- [x] Adapter/use-case tests cover the reproduced cleanup-masking failure, 400/403/429/5xx,
      abort/deadline, processing failure, invalid/truncated output and concurrent
      cleanup failure. Exact fake upload/generation/delete call counts prove no
      retry or extra paid boundary; cleanup cannot erase the primary diagnosis.
- [x] Deferred journal/grant, sample-copy and upload checks show the first
      friendly message immediately, multiple rotations before preparation ends,
      wraparound, stable elapsed time and no timer after every terminal state.
- [x] Shared-loader tests cover repeated/sequential/concurrent mounts, loading
      unmount, Strict Mode remount, loaded reuse, failure/retry, correct nonce,
      widget removal, late callbacks and zero workflow redispatches.
- [x] Synthetic browser checks cover direct load and client navigation, dev HMR
      and production rendering, correct styles, clean relevant console output,
      interaction-only verification and modal fallback. No real media or live
      Turnstile/provider endpoint is used in automated verification.
- [x] Run the active packet's settled five root gates after implementation:
      `corepack pnpm format:check`, `lint`, `typecheck`, `test:unit`, `build`;
      then inspect boundaries/content safety, `git diff --check` and resource
      cleanup. Unit/synthetic entry points hardcode fake/paid-off before imports,
      disable env-file loading and reject unexpected external network access.
- [ ] Normal local restart: not performed in this follow-up; isolated synthetic
      servers verified the changed code. Owner services and ongoing attempts
      remain untouched. Readiness GETs do not prove live provider readiness.
- [ ] Owner alone verifies the retained-sample paid path and separately the
      uploaded-copy paid path. Record real outcome/timing and independent cleanup
      evidence without content. Keep both retained masters protected, samples
      local-only and Exit immediate even if deletion fails. Genuine AI quality,
      cloud deletion and deployment remain unproved by fake checks.

### Research supporting the plan — checked 2026-10-04

- [Next.js CSP guidance](https://nextjs.org/docs/app/guides/content-security-policy#development-vs-production-considerations)
  distinguishes development inline styles from production nonces. This is the
  documented basis for the development-policy fix, not permission to relax
  production policy.
- [Cloudflare explicit rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#explicit-rendering)
  covers SPA widget lifetime; [Cloudflare CSP guidance](https://developers.cloudflare.com/turnstile/reference/content-security-policy/)
  documents script nonces and strict-dynamic compatibility. Shared in-flight
  loading is our implementation remedy for the confirmed local loader race.
- [Google troubleshooting](https://ai.google.dev/gemini-api/docs/troubleshooting)
  distinguishes SDK/service failures and request/model compatibility;
  [structured output limitations](https://ai.google.dev/gemini-api/docs/structured-output#limitations)
  describe unsupported schema features/complexity. These are diagnostic branches,
  not evidence that the owner's failure was caused by schema or model selection.
  Google's general retry guidance does not override this demo's no-generation-retry
  policy.
- [MDN preload guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload)
  explains resource destination and later consumption. It does not identify the
  cause of this specific Next.js warning.

The original planning pass changed documentation only; the 2026-10-05 follow-up
implements the local remedies above. Fake mode and no API keys support the
synthetic workflow and injected failure checks; they do not prove
live Gemini quality. Genuine analysis requires the configured provider key,
enabled live/paid capabilities, storage/renderer access and recorded approvals,
with paid testing owner-only. No local AI model/runtime/weights are used.

## Owner Exit follow-up — 2026-10-04

The latest owner decision replaces Clear media and blocking cleanup recovery with
**Exit**: return to the landing page, forget workflow state, expire app cookies,
and quietly attempt local/provider/renderer deletion. Failures never require a
visitor retry. This changes cleanup UX and access reset, not retained-master
protection, physical deletion evidence or paid-operation limits.

Implemented under this packet: unconditional same-origin cookie-expiry route,
after-response bounded backend handoff, valid-grant cancellation/revocation,
stale-cookie exit, local cleanup across unmount under the exclusive lease,
private clearing-tombstone retry without source restore, migration of the old
cleanup screen and updated privacy copy. No durable queue or cloud change.

Synthetic tests cover pending/failed cleanup with successful exit, offline backend
cookie expiry, bad origins/bodies, paid-disabled composition, immediate grant
revocation, storage denial, lease draining and sample preservation. All run with
fake/paid-off settings and no keys/network. Full settled gates and restart evidence
are recorded after verification in the controlled-check record.
Real deletion, genuine analysis quality and the owner's two paid input-path tests
remain unchecked. No agent-paid test, deployment or Git action is part of this work.

## Authorized private renderer update follow-up — 2026-10-04

The owner authorized updating the existing private renderer and local connection
for two owner-run manual input-path tests (retained sample and upload of the same
source). They rejected the assistant-added recurring numerical build-budget
prompt. Proceed with one allowlisted image build, its existing 1,200-second
timeout and one private revision update; preserve IAM, attached identity,
storage, expiry schedule and resource/operation caps. No new resources or public
release are authorized. Paid media dispatch remains exclusively the owner's.

The widget dashboard's `localhost` allowance is owner-confirmed; the backend's
ignored runtime metadata now records the matching expected hostname. Genuine
widget/provider quality and media deletion remain unchecked. Image proof now
preloads the same hardcoded fake/paid-off/credential-clearing environment guard
as the ordinary synthetic tests. Local normal startup keeps owner configuration.
The previously approved local validation stage remains `analysis`; later
assembly/render activation is outside this update. See the
[controlled-check record](../operations/GROUNDED_ANALYSIS_CHECK.md).

Before cloud submission, all five root gates passed again: `format:check`,
`lint`, `typecheck`, `test:unit` (721 synthetic tests across 70 files) and `build`.
The context boundary check accepts the shared environment guard while still
rejecting environment files, frontend/backend code, private media and test
suites. No provider or paid media dispatch occurred. The owner authorized
committing the pending work; cloud rollout evidence is recorded separately
only after successful verification.

## Corrected native image preparation — 2026-10-04

The first authorized build failed at its synthetic render check before image
publication or private service update. Local reproduction found the default
JPEG/full-range output was `yuvj420p`; the approved validator correctly rejected
it. The worker now fixes BT.709 limited-range output through Remotion's supported
option. Packaged FFmpeg lacks the raw `s16le` muxer, so bounded audio validation
uses PCM WAV with exact RIFF/chunk, mono/16 kHz/16-bit and sample-duration checks.
Malformed header/chunk/duration tests cover this parser. Native proof callers
also now pass the validator's required FFmpeg argument.

A fake, credential-free Windows adaptation of the Linux proof passed using only
generated PNG/tone media and already installed tools: 10,005 ms output, 242,761
bytes, 17,555,095-byte peak scratch, decoded frames/audio, cancellation, zero
owned processes and zero AI calls. Synthetic files were removed in `finally`.
No retained owner media was used. The local opt-in harness also type-checks with
the pinned TypeScript compiler. One corrected build retry is necessary to finish
the existing private-update request; preserve the 1,200-second build timeout and
one revision update. No automatic paid-media retry is authorized.

The final fake-only unit gate passed 732 tests across 71 files, including 11
malformed/valid decoded-WAV cases. Format, lint, typecheck and build also passed.
The isolated native worker receives hardcoded fake AI and disabled paid/live/cloud
settings, with `NODE_ENV=test` during synthetic proof. Its minimal environment
contains no parent credentials. Genuine AI/source quality remains owner-only.

## Verified private rollout and local handoff — 2026-10-04

The corrected image from `4c0f510` passed Linux Cloud Build in 130.972 seconds,
including synthetic output/decode/cancellation and runtime import/tool checks.
Verified immutable digest:
`sha256:3f404f3c5daa620f501558bf4103cbe04862e0b061b2d67834a0ff09e4d69377`.
One private revision update preserved service IAM, attached identity, environment,
secret mounts and all resource/operation caps. Serving traffic targets the Ready
revision; anonymous health returned 403 and ADC-authenticated health 200.
No renderer media endpoint or Gemini call was dispatched by the agent.

Local connection/approval metadata was configured without reading or editing
secret files; `FAKE_MODE`/`PAID_DEMO_ENABLED` retain their priority. The approved
stage stays `analysis`. Verified full restart removed 21 old identities with
zero survivors/listeners, then healthy replacements returned 200 for backend
health, `/start` and public config. Live analysis is enabled; assembly/render
remain off. Three owned temporary build contexts and synthetic media were
cleaned up. Retained local/cloud masters were untouched. The
[handoff record](../operations/GROUNDED_ANALYSIS_CHECK.md#verified-private-rollout-and-local-handoff--2026-10-04)
owns PIDs, log location and the owner-only sample/upload/Clear sequence.

Remaining: genuine widget/model access, source rights/Google-transfer confirmation
per browser flow, transcript/candidate quality and measured real-source/provider
cleanup; later assembly/export/full-envelope/device/public release gates. This
limited private rollout does not satisfy the unchecked live acceptance above.
Deviation: the first build failed before publishing; one corrected build retry
was required. One service update completed; no new resources, public deployment,
account usage polling or agent-run paid media test occurred.

## Owner preview notice removal — 2026-10-04

The owner explicitly removed the Step 1 technical transfer notice and separate
rights/paid-analysis checkbox. **Find moments** is now the sole browser action
initiating analysis, with no consent state disabling it. The existing privacy
panel, backend rights/transfer request validation, operator approvals, live flags,
Turnstile and admission bounds remain. The source of truth records this owner
decision; earlier references to a separate browser confirmation control are
superseded. No provider call or real-media test is authorized by this UI change.
Fake mode remains key-free and synthetic; genuine analysis stays owner-tested.

Verification: all five root gates passed (`format:check`, `lint`, `typecheck`,
`test:unit`: 732 synthetic tests across 71 files, and `build`). The running local
backend health, `/start` and public sample config returned 200. Existing flow
checks preserve preview-before-analysis and exact injected transport calls;
no provider/media processing was dispatched. Live visual confirmation and
Gemini quality/cleanup remain owner-only. The build's generated Next type
references were returned to the existing development paths.

## Owner sample-copy and verification follow-up — 2026-10-04

The owner's manual **Find moments** attempt failed while copying the retained
sample, before Gemini analysis. Content-free existing renderer request logs show
upload admission returned 200 and subsequent cancellation returned 200; no new
media request was dispatched by the agent. An isolated fake/loopback reproduction
confirmed Node Fetch rejects an HTTP 308 response with `redirect: error`, even
without a Location header. Google uses 308 for incomplete chunk acknowledgement.
The backend now uses `redirect: manual`, validates the exact acknowledged Range,
and rejects every Location header. It never follows an alternate destination.
Synthetic regressions cover chunk completion, malformed acknowledgement and
redirect rejection. The retained master and existing temporary cleanup remain.
See [Google's resumable protocol](https://docs.cloud.google.com/storage/docs/performing-resumable-uploads).

Turnstile uses its supported `interaction-only` appearance. The existing iframe
stays mounted as a native modal opens only for required interaction or a failure.
Errors offer explicit verification-only retry or cancellation; neither repeats
upload/AI work. Late callbacks and duplicate tokens cannot resolve another flow.
SDK widgets, owned script listeners and modal state are removed on completion,
cancel/unmount. Action/session/hostname and server verification remain unchanged.
See [Cloudflare configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/).

The isolated mock-widget browser check verified a centered modal, background
appearance, keyboard cancellation, manual retry and one-token completion, without
real Turnstile or media/provider requests. Source/backend and browser tests are
hardcoded fake, paid-off and credential-free. Genuine sample-copy/AI quality and
widget behavior remain exclusively owner-tested; these local corrections need
no private renderer image change.

Final verification passed `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit` (744 tests across 72 files),
and `corepack pnpm build`. The build's generated Next references were returned
to the existing development paths. The mock dialog also fit a 320-by-640 viewport
without overflow. Its helper process and listener were removed and checked again
after stabilization. The normal local backend reloaded the correction; backend
health, `/start` and `/api/sample/config` each returned 200. No paid processing
was initiated by these checks; real sample-copy, Turnstile and Gemini acceptance
remain the owner's manual checks.

## Owner analysis wait and cleanup correction — 2026-10-04

The later owner-run attempt reached source upload, preparation and proxy access;
existing renderer request statuses were 200, including cancellation. The owner
authorized a metadata-only Google Files diagnostic with the configured key.
A complete Files list returned 200 and zero files; a randomly named nonexistent
file returned 403. Zero uploads, generation calls, deletes or retained-master
access occurred in the diagnostic. The old cleanup confirmation accepted only
404 and replaced any prior analysis outcome with feature unavailable. Its UI
also falsely described a remote failure as local deletion failure. The original
generation result was discarded, so successful AI analysis is not claimed.

Cleanup now accepts empty DELETE responses and independently verifies absence:
GET 404, or a successful complete authorized list after GET 403. The same deadline
and fixed three-page limit apply; denied/incomplete lists and present files fail.
Definite upload-start rejection removes its never-created obligation. Safe
phase/status codes preserve analysis and cleanup reasons without file IDs,
provider messages or content. Cleanup retries make zero additional AI calls.
The shared contracts own provider-failed and cleanup-pending error codes once.
The frontend parses those errors on Clear and distinguishes local completion
from pending remote cleanup.

Finding moments rotates five brief messages every five seconds, wraps during
the wait and stops at terminal state, retaining elapsed time and cancellation.
The owner requires **Use sample** only locally; preview/production flags and
sample endpoints stay disabled. Streamed sample Clear removes selection/journal
without uploaded-file OPFS deletion. Both retained masters stay outside cleanup;
disposable processing/provider copies retain their deletion rules. Uploaded
workspace physical deletion and cleanup fences remain covered by synthetic tests.
See the [diagnostic record](../operations/GROUNDED_ANALYSIS_CHECK.md#owner-manual-failure-and-metadata-only-diagnosis--2026-10-04)
and [deployment exclusion checkpoint](CL-015-deploy-validate-measure-and-rollback.md#owner-requested-local-sample-exclusion--2026-10-04).

The owner retains the next live sample/upload analysis and Clear trials. Ordinary
tests remain hardcoded fake, paid-off, credential-free and network-blocked; they
prove neither real Gemini quality nor deployed capability exclusion. No private
renderer update, public deployment or Git action is needed by these corrections.

Verification: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit` (761 synthetic tests across
72 files) and `corepack pnpm build` all passed. Frontend typecheck passed again
after returning generated Next references to their development paths.
`git diff --check` passed. Local health, `/start` and `/api/sample/config` returned
200; existing supervisor creation times and both listener trees were verified
without stopping/starting apps. The normal backend watcher loaded the correction.
An ignored diagnostic helper's empty catch initially failed lint; a content-safe
comment resolved it and lint passed. No automated live media/provider test ran.

Changed ownership: backend Gemini transport/use case and regressions; shared
safe error contracts; frontend analysis transport/clear result, workspace cleanup
boundary/schema and regressions, sample CTA/wait messages and rendering tests;
frontend guide, source of truth, this packet, controlled-check record and the
CL-015 sample exclusion checkpoint. Earlier spinner/Turnstile/chunk-upload changes
remain in the same unstaged work. Actual deployed exclusion, genuine widget/AI
quality and the next owner sample/upload/Clear trials remain unchecked. The
owner's Chrome tab is not connected to the browser tool; its current cleanup
screen was not independently recovered. An old session after watcher reload
cannot itself prove deletion or bypass the normal cleanup fence.

## Owner Gemini setup follow-up — 2026-10-04
The owner reports creating the Gemini key and manually saving it in ignored
`apps/backend/.env.local`, completing a USD 5 API prepayment and saving a USD 5
monthly project spend cap. Automatic reload was disabled in the prepayment view
and remains instructed off; no final dashboard state or credentialed readiness
probe was independently checked. No key or provider payload was read, and no
account identifier was recorded. These account controls can exceed their target during
Google's enforcement delay and do not authorize a paid source test.

The [controlled-check record](../operations/GROUNDED_ANALYSIS_CHECK.md#owner-reported-gemini-setup--2026-10-04)
owns sanitized setup evidence; the [current provider guide](../operations/PROVIDER_SETUP.md#local-turnstile-setup--next-prerequisite)
owns the next genuine local Turnstile steps. Grant keys, the new private renderer
revision, rights/Google audiovisual-transfer approval and a numerical incremental
AI/cloud/build test allowance remain open. The renderer/live checkpoint above
stays unchecked. No live Gemini/Turnstile request, cloud change, restart or Git
mutation was performed. Fake mode still needs no keys and proves synthetic
results only; no local AI model is used.

Turnstile setup clarification: use one widget named `ClipBuilder`, initially
allowing `localhost`. At the separately authorized deployment checkpoint, add
the real frontend hostname, configure its exact backend hostname check, verify
the deployed challenge/validation, then remove `localhost`. The same keys can be
used through this transition. This replaces the guide's earlier separate-widget
recommendation; it authorizes no deployment, paid call or weaker validation.

The owner subsequently reports copying the Turnstile sitekey and secret into
the backend's ignored `.env.local`. The private file was not inspected; expected
hostname and genuine validation remain unchecked. The provider guide now
explains the existing processing-grant AES-256-GCM key map, matching active label
and private 32-byte base64url generation command. Grant-key creation/storage is
not yet confirmed. No secret was generated, provider contacted or app restarted.

This setup follow-up changed documentation only; it added no application test
or live-quality evidence and did not extend earlier root-gate results. Both
commands below returned exit 0. Subsequent CL-015 inspection confirmed Markdown
is excluded by `.prettierignore`, so the first command did not validate Markdown
style; `git diff --check` did verify whitespace. The normal `pnpm exec prettier`
shim was unavailable in that pass, so its existing pinned entry point was used
through pnpm; no dependency installation or version change was made. The later
code-fixed grant-label implementation and code checks belong to CL-015.

```text
corepack pnpm exec node node_modules/prettier/bin/prettier.cjs --check docs/operations/PROVIDER_SETUP.md docs/operations/GROUNDED_ANALYSIS_CHECK.md docs/operations/LOCAL_RELEASE_PREPARATION.md docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md docs/tickets/README.md
git diff --check
```

## Owner-requested Gemini prompt review — 2026-10-04

The owner requested a thorough researched revision before their manual paid
check. This follow-up owns the source-analysis / Find moments prompt under
CL-007. The separate selected-clip speaker/card policy was inspected to verify
the responsibility boundary; it was not merged into source analysis or rewritten.

Reviewed the current migration, source-of-truth shareability rubric, compact
provider schema, transcript/candidate contracts, reconciliation and actual SDK
request. The old prompt stated the broad task but omitted substantial required
semantics. Its global prohibition on names/instructions also needed clarification
so faithful transcription would not be confused with identity inference or obeying
source instructions.

| Area | Revision |
| --- | --- |
| Source fidelity | Full-source audible English speech, including unselected passages, fillers, repetitions, negation and spoken names; no polishing, translation, subtitles substituted for audio or invented inaudible words |
| Timing and references | Full-source millisecond clock including leading silence, actual audible word boundaries, ordinal IDs, chronological order and the existing 250ms overlap limit; no fabricated timing to pass validation |
| Speakers | Stable anonymous audible-voice labels, explicit null uncertainty, complete inclusive turn partition, and the all-null/empty-turn fallback |
| Editorial selection | Eight existing rubric signals defined, strongest first, distinct ideas across the source, natural complete boundaries, preserved qualifications/context, actual 10–60s ranges, 35% overlap bound and no count/duration padding |
| Public grounding | Field meanings and lengths, distinct ordered evidence references, exact contiguous candidate quotations, fixed editorial notes and bounded truthful caveats; instruction/performance claims excluded from public copy |
| Trust/output | Spoken instructions remain source speech; never obey them. JSON only, no tools/search/extra fields or source-analysis framing/card plan |

The reviewable policy and final user task now live in
[`analysis.prompt.ts`](../../apps/backend/src/analysis/analysis.prompt.ts).
The adapter imports them and places the specific anchored task after the video.
Descriptions on the existing wire schema explain the positional word/turn tuples
and candidate semantics without defining new cross-boundary schemas. The schema
and application rejection rules remain authoritative; prose is not a security
boundary or proof of model obedience.

Official Google guidance checked on 2026-10-04:

- [Current Gemini 3.x guidance](https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5#prompting-best-practices): direct instructions and an anchored task after long source context. The earlier Gemini 3 guide now directs readers to this page. No forced chain-of-thought or additional model call was added.
- [Sampling parameter guidance](https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5#sampling-parameters-no-longer-recommended): remove temperature/top-p/top-k overrides for Gemini 3.x. Removed the existing `temperature: 0` from the shared transport, so both source and selected-plan generation use model defaults. Model, thinking configuration, maximum output, call/retry limits and gates were not changed.
- [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output#best-practices): descriptive fields, strong types and application semantic validation. The documented subset explicitly supports `prefixItems`; compact tuples need no speculative format replacement.
- [Video understanding](https://ai.google.dev/gemini-api/docs/video-understanding#extract-detailed-insights-from-video): default visual sampling can miss fast details. This documentation and a millisecond output type do not establish word-alignment or speaking-face accuracy. No video sampling change was made in this packet.

The injected SDK regression first failed because it still sent the old policy
and generic task. It now verifies the actual system instruction, video-before-task
ordering, descriptive positional JSON schema, absent sampling overrides and
unchanged one-generation/deletion call counts. Focused source-analysis verification
passes **55 synthetic tests in one file**. The initial filtered script invocation
forwarded an extra `--` and ran all 243 backend tests instead; it had the same
single expected regression failure. The corrected focused command is
`corepack pnpm --filter @clipbuilder/backend test:unit src/analysis/analysis.test.ts`.
The executable Prettier shim was unavailable, so the existing pinned Node entry
point formatted the four changed code files; no dependency install occurred.

Settled verification after code edits (all exit 0):

```text
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
git diff --check
```

The full suite passed **716 synthetic tests in 70 files**: root 33/4,
contracts 60/5, composition 3/1, backend 243/16, frontend 316/32 and renderer
61/12. Test configuration remains hardcoded fake/paid-off, credential-free and
guarded against external networking. Root formatting checks code; Markdown is
excluded by `.prettierignore`. The local frontend build inventory passes with
1,277 files, 26 external package links and `selfContained: false`; it provides
no new immutable release/deployment acceptance. All tool processes finished;
no application listener, new cleanup obligation or temporary provider file was
created. Diff review found no new cross-app dependencies, duplicate boundary
schemas, unsafe casts, secret/media content, logging, environment readers,
listeners or timers in the prompt/schema changes.

Remaining quality limits: quotes are checked against the model's own transcript,
not independently against audio. A plausible but wrong transcript/timestamp or
weak editorial recommendation can therefore require human rejection. Silent or
unusable speech cannot produce the required nonempty valid transcript; never
invent speech to fill it. Real overlapping dialogue may exceed the existing
250ms reconciliation limit and fail. The 12,000-word schema limit does not prove
every allowed 20-minute source fits the existing 65,536-token response allowance.
Incomplete/refused/unusable output still fails without an automatic repair call.
No alternate ASR/aligner or local AI model/weights were introduced or verified.

With `FAKE_MODE=true` and no keys, deterministic fixtures, request-shape and
rejection/cleanup checks work; they generate no real Gemini output and prove no
live transcription, ranking or timing quality. Live analysis still requires the
owner's key, enabled live/paid gates, renderer readiness, rights/provider-transfer
and applicable spend approvals, and is reserved for their manual action. No
ignored environment/private configuration, real media or credentials were read.
No provider request, cloud mutation, deployment, app launch or Git mutation was
performed. Live acceptance above remains unchecked.

## Owner-requested live preflight — 2026-10-04

The owner requested restarting the local stack to try a paid flow and review
the Gemini prompt. The owner reports choosing real/paid switches. Verified
shutdown cleared both existing supervisors, all captured descendants and ports
3000/4000. Normal backend replacement failed before listening with the fixed
`configuration_validation_stage_missing` category. Its entire nine-process tree
was removed and both ports remained clear through stabilization. The frontend
replacement was not started because backend readiness failed; both apps are
stopped. Content-safe logs and exact identities are in the
[controlled-check preflight](../operations/GROUNDED_ANALYSIS_CHECK.md#local-restart-preflight--2026-10-04).

No secret/private runtime file was inspected or modified. The ignored runtime
supervisor received one fixed startup-error category, without raw diagnostic
output. The current grounded Gemini policy was inspected and left unchanged.
No application implementation or provider/cloud action occurred; no new root
gate or live-quality evidence is claimed. The owner requested paid testing,
but the numerical AI/cloud/build allowance, Google audiovisual transfer consent
and renderer revision update still require the documented checkpoint before
dispatch. Fake mode remains credential-free and synthetic. Live Turnstile,
model/account access, actual transcript/candidates, cleanup and full export stay
unchecked. This evidence does not satisfy live acceptance or authorize Git.

## Local execution evidence — 2026-10-03

Dependencies: clean worktree at `db58981`; CL-006 committed local/Linux/private
foundation and CL-004 reusable candidate UI were present. Current migration
authority supersedes the collapsed Deepgram/browser-audio/server-job mechanics.
No adjacent assembly/preview/export packet was implemented.

Implemented protected grant/restore/upload/run/clear routes; bounded same-origin
bridge and direct runtime-only private upload; atomic action reservations and
Turnstile hostname/action/session checks; checksum/generation/profile validation;
one Gemini source call; strict normalization/reconciliation; signed source/result
integrity receipt; explicit Google deletion/404 verification and proxy release;
browser confirmation, truthful transfer copy, pending/uncertain recovery and atomic
result commit into the existing read-only candidate UI.

Source analysis uses compact word/turn tuples, server ordinal IDs, anonymous
labels and null confidence. Public title/hook/evidence copy is extractive;
rationale/caveats are contiguous source quotations or fixed editorial statements. Candidate
word references/order/evidence/ranks/sentence boundaries/10–60s/overlap/claims/
quotes are deterministic. Exact word overlap tolerance: 250ms accepted, 251ms
rejected for fake and Google labels. No model repair, trend evidence or padding.

Two metered action nonces are consumed: legacy `transcription` now means upload
admission, and `candidate-analysis` means prepare/one source AI call. The migration
does not permit a second candidate-only call. SDK 2.25.0's file uploader revealed
independent retry/abort defects, so its documented REST Files start/finalize is
bounded directly; generation/get/delete keep the pinned SDK with one attempt and
bounded responses. Browser intake's former chained digest was incompatible with
renderer SHA-256; it now uses bounded incremental standard SHA-256. Older local
records fail source revalidation safely. These are ticket-local implementation
choices, with no product/privacy/architecture gate changes.

One verification deviation: root ESLint included six pre-existing errors in
Git-ignored CL-006 private helper scripts. `eslint.config.mjs` now excludes
`private/**`, matching the existing privacy/Git boundary. Those files were not
opened or modified. No dependency installation or version change was required.

Focused evidence covers: valid and no-candidate API results, exact upload/prepare/
generation/release counts, duplicate race, tampered receipt/source/generation,
CSRF/disabled spend/expiry, malformed/malicious/quote/claim/reference/turn/range/
timing responses, refusal, cancellation, 90-poll cap, SDK wire/no-retry/deletion
proof, failed deletion obligation, bounded ingress, journal failure, committed
refresh with no calls, uncertain recovery, clear fencing and SHA-256 padding/
chunk boundaries. Private proxy read verifies bytes/hash and removes owned scratch;
failed release fences the session until its existing scheduled cleanup retry.
Google cleanup is scoped to the owning session. Failed reservation-journal
writes dispatch zero actions and remain visible; cloud-cleanup failure still
deletes local media, reports partial cleanup and permits cleanup-only retry.

Owner-directed review findings were reproduced before correction: valid browser
and renderer duration/fps differences caused rejection; reordered source words
could invent rationale/caveat assertions; Clear could delete before a late Google
upload finished; and grant refusal left an uncleared workspace without a session.
Regression checks now pass. Decoded duration/fps are authoritative for analysis,
while the original intake descriptor remains available for source reinspection.
Google cleanup waits for upload settlement and shares verified deletion with
analysis finalization. The browser journals whether remote cleanup is required;
only a never-admitted record accepts a missing session as already clean.

Settled root evidence (all exit 0):

```text
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
git diff --check
```

Unit totals: root 20, contracts 44, composition 2, backend 117, renderer 23,
frontend 231: **437 tests across 50 files**. The build completed all five packages
and generated `/start` plus `/api/analysis/[action]`. Synthetic state checks
verified valid/no-candidate success, failure/uncertainty, source/result mismatch,
refresh without redispatch, abort/clear fencing, local deletion despite remote
failure and exact failed-release retry.

Actual fake browser evidence: temporary documented build/start services on
127.0.0.1:4000 and localhost:3000 passed health, `/start` and sample config GETs.
An isolated environment used fake/off flags, no credentials and a loopback-only
network guard. Prepared synthetic input produced three candidates; selecting
the second, keyboard selection, transcript/notes, refresh restoration, Proceed,
fixed read-only review and simulated export all worked. MP4 download remained
disabled because no validated video exists. Desktop and 390×844 result views
were inspected; the phone view had no horizontal overflow. Start over, refresh
after reset and preview cancellation returned to intake. This is fixture UI
evidence, not real media, challenge or AI-quality proof.

An initial dev-server attempt was disrupted by rebuilding watched packages and
Next HMR failure; its guard blocked one non-loopback attempt. It was cleaned up
and replaced with settled build/start services. The successful run recorded zero
external attempts. All 16 owned stable-run processes were stopped by verified
PID/creation-time identity; repeated checks found zero owned survivors and zero
listeners on 3000/4000. Content-free logs/runtime records are Git-ignored under
`private/cl007-fake-check/`; no app remains running.

Boundary fixtures and fake/off pre-import network guards passed. Final diff checks
found no cross-app imports, Node/provider dependencies in contracts/browser code,
duplicate cross-boundary schemas, unsafe casts, debug logging or stale TODOs in
the new modules. Tests verified bounded response readers, deadline/listener
cleanup, checksum chunk memory, renderer scratch removal and cleanup fencing.
All verification commands returned; temporary app services were cleaned up.

`FAKE_MODE=true` and no keys still provide synthetic development results. All new
tests use synthetic injected transports, fake/off process environment and zero
external calls. They prove engineering behavior and the fixture UI, not AI quality or real upload/
challenge/clock/device readiness. No local AI model is required or claimed.

Remaining unchecked: new renderer image build/rollout; Gemini key/model access,
paid-project terms, new AI audiovisual-transfer rights/approval and numerical
AI/cloud/build budget; real transcript/anonymous-turn/candidate quality; actual
clock/codec/proxy parity, full maximum-envelope stress, responsive/keyboard/zoom/
reduced-motion challenge/upload/device matrix, live deletion and interruption
behavior; public sample/release rights, complete license/font/codec/telemetry
notices and public paid/deployment controls. Provider cleanup obligations are
process-local; crash/uncertain upload can rely on Google's separate 48h Files
expiry, not an unconditional deletion guarantee. Later CL-008–011 work remains.

Reviewable next checkpoint: [controlled analysis check](../operations/GROUNDED_ANALYSIS_CHECK.md).
The owner deferred this checkpoint. It proposes one build/private revision update and one source analysis, with no
automatic retry or resource creation; budget/rights/data/external authorization
are still owner-only. No secrets/real media were read and no ADC/provider/cloud
action, usage polling, new independent review agent, staging or commit was performed.
CL-008 local engineering is dependency-ready under the owner's latest direction;
its live speaker-quality evidence retains a separate gate.

### Changed files

Pass-2 owner revalidation found one additional local defect: a failed remote
Clear followed by successful local deletion erased the only journal evidence,
and reload lost the React ref that tracked cleanup. It was independently
reproduced as a failing injected workspace test before correction. A separate
strict `remote-cleanup` IndexedDB key contains only version, allow-missing and
cleanup status, survives media/result deletion, and restores a cleanup-only state.
New source preparation is blocked while it exists; only confirmed remote Clear
plus committed acknowledgement removes it. Admitted work never weakens the
missing-session rule. Failed obligation persistence still attempts physical
media deletion and preserves the existing source evidence/recovery fence;
metadata transactions drain before releasing workspace ownership. React-only
cleanup refs were removed. No identity, content, receipt or capability is stored
in the independent marker.

Focused recovery/journal/session checks passed **103 tests across six files**,
including repeated remote failure across reload, zero analysis calls, successful
cleanup-only acknowledgement, denied journal writes, acknowledgement failure,
transaction commit ordering and corrupt/content-bearing marker rejection.
This is injected fake/off recovery evidence; the actual live Clear/challenge/
browser sequence has not been rerun and remains at the deferred checkpoint.
The combined CL-007/008 final suite now contains 478 tests across 52 files.
All five root checks and `git diff --check` were rerun after this correction.
The first root unit attempt hit the existing 10-second ESLint boundary-test
timeout; an unchanged serial rerun passed that gate in 4.76 seconds, followed
by all package tests and the five-package build. No timeout was increased.

Pass-3 owner revalidation found a second cleanup edge: successful remote Clear
expired the cookie, then a failed local acknowledgement left a marker that
retried remote Clear after reload and could never recover from `SESSION_MISSING`.
The real browser API with synthetic session/204/401 responses independently
reproduced the failure before correction. Remote confirmation now commits as a
separate marker status before local acknowledgement; confirmed markers retry
only local deletion/acknowledgement, including after reload. Local deletion
failure retains this confirmation. Legacy markers default to pending, and a
missing session still cannot acknowledge unconfirmed admitted work. Confirmation
and deletion transactions share the owned write queue. No new analysis request
is dispatched. If confirmation itself cannot commit before reload, cleanup
remains conservatively pending rather than claiming unproved deletion.

Focused recovery/journal/session checks passed **108 tests across six files**.
The new recovery test uses the real client API, explicitly observes the expired
session response and then completes reload recovery without another remote call.
Additional regressions cover unconfirmed missing-session fencing, local deletion
failure after remote success, legacy/confirmed restoration and invalid status.
The settled combined CL-007/008 suite contains **483 tests across 52 files**;
all five required root gates and `git diff --check` pass. This evidence uses
synthetic responses with fake/off configuration and no keys. The actual live
Clear/challenge/browser sequence remains at the owner-deferred checkpoint.

Owner-directed validation pass 4 reported no actionable findings on the settled
CL-007 snapshot over `db58981`. All pass-1/pass-2/pass-3 findings remain resolved.
The reviewer reran `corepack pnpm --filter @clipbuilder/frontend test:unit
src/features/media/browser.workspace.test.ts`: **23 tests in one file passed**;
`git diff --check` also passed. This was a read-only local review with synthetic
fake/off tests, no credentials, provider/cloud calls, launches or Git mutations.
The reviewer did not rerun the full root gates or the earlier browser session;
their evidence remains recorded above. The verdict covers CL-007's authorized
local scope only, excludes CL-008-specific additions and retains every deferred
live, durability, rights, device and release limitation. In particular, failed
confirmation persistence before reload remains conservatively pending.

- Backend: `apps/backend/README.md`; `src/app.ts`;
  `src/admission/{admission.composition,processing.admission,turnstile.verifier,turnstile.verifier.test}.ts`;
  `src/config/{env.schema,loadConfig.test}.ts`; `src/media/renderer.cloudrun.ts`;
  `src/http/routes/analysis.route.ts`;
  `src/analysis/{analysis.composition,analysis.provider-shape,analysis.reconciliation,analysis.test,analysis.usecase,gemini.adapter}.ts`.
- Frontend: `apps/frontend/README.md`; `src/app/privacy-dialog.tsx`;
  `src/app/api/analysis/[action]/{route,route.test}.ts`;
  `src/features/media/{browser.workspace,browser.workspace.test,source.worker,source.checksum,source.checksum.test,workspace.restore,workspace.schema,workspace.journal,workspace.journal.test}.ts`;
  `src/features/session/session.provider.tsx`;
  `src/features/sample/sample.experience.tsx`;
  `src/features/source-analysis/analysis-challenge.tsx` and
  `{source-analysis.api,source-analysis.flow,source-analysis.flow.test}.ts`.
- Renderer: `apps/renderer/README.md`; `src/app.ts`;
  `src/expiry/media-sessions.ts`;
  `src/media/{inspection,media-operations,media-operations.test}.ts`;
  `test/media-fixture.ts`.
- Contracts: `packages/contracts/src/{api.schema,cloud-media.schema,grounded-analysis.schema,media.schema,index}.ts`.
- Documentation/configuration: `eslint.config.mjs`;
  `docs/operations/{COST_MODEL,PROVIDER_SETUP,GROUNDED_ANALYSIS_CHECK}.md`;
  this packet and `docs/tickets/README.md`;
  status updates in `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` and
  `docs/architecture/{GEMINI_REMOTION_MIGRATION,MIGRATION_FILE_INVENTORY}.md`.

Initial CL-007 Git state: 53 ticket-related modified/new files. After CL-008 and
the pass-2/pass-3 local corrections, the combined worktree has 71 modified/new files;
index empty, no commit.

## Cross-ticket audit correction — 2026-10-03

The owner authorized fixing the full-history grounding finding. Sixteen new
regression cases failed against the original substring check: partial prefixes,
partial suffixes, punctuation-only copy and an empty quote inside otherwise
grounded text were accepted as source evidence.

Reconciliation now requires a nonempty contiguous sequence of complete normalized
tokens for public title/hook/evidence, non-editorial rationale/caveats and quoted
spans. NFKC/case/whitespace/punctuation normalization and approved fixed editorial
explanations remain supported. Noncontiguous/reordered text is still rejected.
The same checks apply to fake and Google provider labels without another model
call, response repair or provider/config/schema change.

Changed: backend analysis reconciliation, its existing test file and this packet.
Twenty regressions cover the rejected cases plus accepted normalization and fixed
editorial explanations. Focused analysis/fixed-assembly verification passed
**70 tests in two files**. The combined settled gate passed all five root commands
and **665 tests in 66 files**; final read-only revalidation found no actionable
findings in the three corrections. Exact commands, test counts and limits are in
[CL-010](CL-010-deliver-automatic-clip-review.md#settled-cross-ticket-verification-and-revalidation--2026-10-03).
Tests use synthetic data, fake/off configuration and no keys/network; real
transcript/candidate/quality, provider data/rights/spend, device and cloud release
gates remain unchecked. No retained media, secret or provider/cloud resource was
changed. Nothing was staged or committed.

## File-level commit plan

The [seven-step CL-007/CL-008 commit plan](CL-007-008-COMMIT_PLAN.md) lists exact
whole-file staging commands and ticket-prefixed commit messages for the current
combined worktree. It covers 72 distinct files including the plan itself.
The owner authorized sequential execution on 2026-10-03. Implementation groups
1–5 were staged whole and committed in order; this ticket is the step-6
documentation checkpoint. Final completion is recorded in
[CL-008](CL-008-productionize-active-speaker-assembly.md#commit-execution-record).
The earlier unstaged worktree counts describe the pre-commit verification snapshot.

<details>
<summary>Earlier packet and evidence, retained as history where superseded</summary>


Status: Planned; browser-owned execution revision, external gates pending<br>
Milestone: M3 - protected analysis<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-004, CL-004A, CL-005 admission foundation and CL-006 audio proof<br>
Suggested commit: `CL-007: validate protected browser-owned analysis`<br>
Parent: [source of truth section 0.9](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#09-browser-owned-media-architecture-revision-2026-10-01)<br>
Technical contract: [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md)<br>
Index: [README.md](README.md)

**Execution authority:** this current packet and the linked browser contract
supersede the server-media mechanics retained below as history. No GCS,
generation/capability/lease, native media job or cloud-render acceptance item
survives by being left unchecked in that history. Preserve unchanged product,
grounding/quality, rights, secret handling, fake/off test and dependency rules.
No Git, provider, paid, install or cloud action is authorized by this document.

## Objective and boundaries

Use local extracted audio and bounded protected requests to obtain a normalized
timestamped transcript and zero-to-four grounded candidates. Target three/four
strong moments near one minute without padding; the visitor chooses exactly
one contiguous 10-60s word range. Reuse CL-004's gallery, local source preview,
smooth selection layout, transcript and read-only notes.

No original-video upload, server media job, GCS analysis bundle or durable
provider-result store. Backend cannot read OPFS/IndexedDB. Public paid traffic
stays gated on the current process-local admission limitations; no cookie-only
quota/idempotency claim. Provider data/cost approval is separate from code.

## Current implementation checklist

- [ ] Implement a dedicated bounded same-origin binary-audio route/use case,
      separate from the fixture-only 8-KiB JSON proxy. Enforce actual received
      bytes/profile/duration, capacity/body deadlines and safe abort cleanup
      before transcription. Hosting transport proof remains CL-015.
- [ ] Submit one approved Deepgram pre-recorded binary audio request, never a
      user URL/callback/file-store workaround. Exact call budget <=1; SDK retry=0.
      Project opt-out/retention settings and rights/data consent stay explicit.
- [ ] Validate provider response, normalize word IDs/speaker labels/timestamps/
      finite bounds and discard raw data. Diarization labels are not real
      identity or active-speaker visual inference.
- [ ] Return normalized transcript and authenticated provenance receipt bound
      to session/revision/hash/expiry. Cache success in bounded browser journal;
      backend holds no durable transcript or payload-recovery repository.
- [ ] Candidate request validates receipt/bounded submitted transcript and
      approved token/schema limits; one foreground Structured Outputs call,
      store:false, no background polling or automatic paid retry.
- [ ] Reconcile all word references/order/ranges/reasons against real normalized
      transcript. Handle zero candidates honestly; do not synthesize success,
      fake trend evidence or pad count/duration.
- [ ] Integrate process-local atomic action reservation and boot-epoch grants.
      Conflicting replay/stale cookie/restart/capacity/uncertain result fail
      closed; no paid re-dispatch from refresh/remount/network retry.
- [ ] Candidate retry is a separately allowed explicit action with transcript
      reuse and zero additional transcription, not implicit recovery.
- [ ] Commit validated browser results before advancing UI. Unknown/lost remote
      payload is a visible failure/uncertain result, not seamless resumability.
- [ ] Resolve actual immutable ranges against local source identity; clamp
      player seek/end/reset and reject mismatched cached source/revisions.

## Verification and acceptance

Own backend transcription/candidate adapters, ports/use cases/routes and receipt
validation; frontend result hydration, analysis status and candidate integration;
shared schema additions only at cross-boundary ownership. No application import
reads env/media, listens, contacts providers or obtains credentials.

- [ ] Fake/injected tests assert exact zero calls on every rejected case and
      exact allowed transcription/candidate counts, including duplicate races.
- [ ] Corrupt receipts, malicious transcript text, oversized payload/token limits,
      provider timeout/disconnect, stale epoch and result-loss paths covered.
- [ ] Refresh of committed local success makes zero new calls; in-flight/lost
      work does not automatically retry. Clear fences late response publication.
- [ ] Existing UI/notes remain timestamp-grounded, responsive and read-only;
      source remains on device, no provider/raw content enters logs/errors/URLs.
- [ ] Run focused adapters/contracts/session/component/browser checks and all
      five root gates; document every rights/provider/privacy/spend/runtime gate
      still unchecked. Live checks require specific owner call/budget permission.

Update provider/retention/cost guides with actual adapter options and results.
Paid model availability, language quality and audio-profile transcription parity
are not proven by fake contracts. No speaker assembly/visuals/render here.

## Historical packet

<details>
<summary>Superseded server-media plan, retained only for decision history</summary>

The following text is not an execution checklist, setup instruction or evidence
of completion under the browser-owned architecture. It must not be used to
reintroduce cloud content storage, jobs or unsupported guarantees.

# CL-007 — Deliver the live-analysis vertical slice

Status: Planned<br>
Milestone: M3 — live analysis<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-004, CL-004A, and CL-006<br>
Blocks: CL-008, CL-009, CL-012<br>
Suggested commit: `CL-007: deliver grounded live analysis`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Owner setup ordering (2026-10-01): [CL-004A](CL-004A-prepare-third-party-provider-readiness.md)
and [provider setup](../operations/PROVIDER_SETUP.md) own the dashboard/key/data/
budget walkthrough. Inspect its documentation handoff before implementation;
actual account readiness is needed only for separately authorized local provider
checks. Build/test adapters with fake ports/transports here, with no GCloud
setup or credentialed cloud execution. Full cloud flow proof stays final CL-015.
Update the exact Deepgram endpoint and model-improvement opt-out request policy
with fake request proof; do not invent an env flag or infer privacy from a key.

Latest owner clarification (2026-10-01): CL-004 owns the complete development-
only frontend preview and its reusable screens. This packet replaces the fake
adapter with its real implementation and proves integration, media, recovery,
privacy/rights/spend/readiness gates; it does not recreate the workflow UI.
Earlier restrictions on synthetic progress apply to real/public mode, not the
explicitly labelled local preview. Fake completion is not evidence for this
packet's unchecked acceptance. See the parent development-preview clarification.

Owner UI/content revision (2026-10-01): reuse CL-004's one changing workspace
and shared Progress. Show one known analysis-stage message, never invented
percentages or timed fake work. Prefer complete interesting moments near 60
seconds when earned, targeting three to four strong choices without padding;
zero-to-four/no-candidate validity remains. Internal pause/filler cuts are
deferred pending a separate ordered-segment contract revision, not authorized
in this contiguous-range ticket. Parent section 0.6 governs this revision.

Deliver one coherent upload-to-candidate-review analysis feature: audio
extraction integration, transcription port/fake/live adapter, candidate
selection port/fake/live adapter, deterministic reconciliation, analyze job and
API routes, progress/poll/cancel/refresh/retry behavior, candidate/no-candidate
UI, evaluations, and bounded live evidence when authorized.

This is intentionally one vertical-slice ticket. Splitting transcription,
candidate selection, orchestration, and UI would leave intermediate tickets
that cannot deliver or verify the feature and would repeat the same recovery,
idempotency, privacy, and call-count context.

## Portfolio value

Show the core AI judgment end-to-end: convert an owned conversation into
timestamp-grounded, explainable editorial choices while preserving provider
boundaries, one-call budgets, refresh recovery, and honest failure behavior.

## Standalone implementation context

- Analysis starts only after authoritative media inspection and explicit user
  confirmation. It produces zero to four grounded candidates, targeting three
  strong alternatives without padding; otherwise it returns an honest
  no-candidate state without a manual range path.
- Deepgram receives bounded extracted audio, not a user URL or video.
  Transcription normalizes words, times, punctuation, and optional diarization
  into stable IDs, then discards the raw response.
- OpenAI receives only the bounded normalized transcript/rubric/context. The
  Responses request uses strict Structured Outputs, `store: false`, no
  conversation state, no SDK retry, and at most one call.
- Transcript/user context is delimited untrusted data. Model output references
  word IDs; deterministic code derives time/duration, rejects invalid evidence,
  overlap, invented claims/quotes, virality promises, and injection.
- A manual candidate retry may reuse a valid stored normalized transcript and
  must not repeat transcription. No automatic provider repair/retry occurs.
- Fake/sample behavior remains deterministic and available without credentials.

## Dependency evidence required

- CL-004 must provide the reusable candidate/evidence/no-candidate experience
  and prove sample selection makes zero provider calls.
- CL-006 must provide passing inspection/extraction/job lifecycle, abort/
  timeout/cleanup, and authoritative media-limit evidence.

Use the existing schemas and progress model. A missing inspection or candidate
UI foundation blocks this ticket rather than being reimplemented inside it.

## Files and areas owned

- Transcription and candidate provider ports, fakes, live adapters,
  normalization, prompts/schemas, and provider contract tests.
- Analysis domain/reconciliation/use case, analyze job stages/result, routes for
  start/status/cancel/result, and operation recovery.
- Frontend analysis confirmation/progress/polling/failure/retry/no-candidate and
  live-result candidate integration.
- Candidate evaluation fixtures/graders and optional owner-controlled live
  analysis evidence.
- Provider setup/cost/privacy documentation for analysis.

## Scope boundaries

### In scope

- `POST /v1/analyses`, operation poll/cancel, `GET /v1/analyses/:analysisId`,
  and `GET /v1/session` evidence required for restore.
- Ordered named job stages from descriptor/audio extraction through transcript,
  selection, reconciliation, result, and complete.
- English v1 transcription with diarization requested but provider-declared
  unavailability tolerated; stable word/utterance/speaker labels.
- Candidate prompt boundary, strict provider-shape schema, deterministic
  reconciliation, one-to-four candidate bounds, the target-three outcome, and
  the no-candidate outcome.
- Bounded category/audience/target-platform context; trend signals remain
  disabled unless separately approved.
- Refresh, hidden-page polling pause/resume, cancellation, timeout, provider
  failure, missing result, retry with transcript reuse, expiry, and clear.

### Out of scope

- Assembly/active-speaker work (CL-008), contextual visuals (CL-009), automatic
  clip review/confirmation (CL-010), render (CL-011), public hardening/deployment, trend
  research, numeric virality scoring, provider fallback, or multilingual claim.
- Persisting raw provider responses/prompts, automatic repair calls, re-running
  transcription during candidate-only retry, or exposing provider names/errors
  in public UI.

## Implementation checklist

### 1. Transcription boundary

- [ ] Implement a port accepting only job-local audio, duration, `en`,
  diarization flag, request/deadline/signal context.
- [ ] Make fake and live shapes pass the same strict normalization; generate
  ordinal word/utterance IDs and enforce count/character/time bounds. Before
  accepting live output, define and record the numeric source-controlled word
  overlap tolerance, then test the exact tolerance and one millisecond beyond
  it against both fake and live-normalized shapes.
- [ ] Record only content-free minutes/model-config/call outcome; discard raw
  alternatives, tokens, provider IDs, and payload after normalization.
- [ ] Disable provider/SDK retries and propagate timeout/abort through extraction
  and adapter.

### 2. Candidate selection and reconciliation

- [ ] Build source-controlled role/policy/rubric/schema/delimited-input prompt
  and strict Structured Outputs request with `store: false`.
- [ ] Validate and resolve every word/evidence ID, derive boundaries/duration,
  enforce 10–60 seconds, check clean boundary/evidence/overlap/distribution, and
  assign server IDs/ranks.
- [ ] Reject invented quotes/facts, guaranteed performance, sensitive inference,
  duplicates, reversed/missing IDs, unsupported signals, and transcript/user
  instructions that attempt to change policy.
- [ ] Permit only whitespace/list dedupe repair; never invent/move/rewrite or
  make a second call.

### 3. Job/API/recovery

- [ ] Enforce inspection proof, feature/paid switches, bounds/source,
  allowance/capacity/budget, Turnstile, marker/lease, and job start in documented
  cheapest-first order.
- [ ] One analyze action makes at most one transcription and one candidate call;
  replay returns existing operation.
- [ ] Persist only normalized transcript/candidates/revisions when the privacy
  gate is approved; otherwise update recovery behavior/public copy explicitly.
- [ ] Encode failure evidence so manual candidate retry reuses transcript when
  valid and full retry never occurs invisibly.

### 4. Frontend experience

- [ ] Add explicit confirmation before paid analysis and explain limits/privacy.
- [ ] Show named ordered stages, elapsed time, source duration, restrained
  reduced-motion state, and no fake percentage.
- [ ] Poll at server interval with capped backoff; pause after hidden timeout;
  reconcile immediately on visibility/refresh without duplicate operations.
- [ ] Preserve source/transcript evidence accurately across failure; provide
  only the evidence-allowed retry, clear, or sample recovery.
- [ ] Feed the same CL-004 candidate/evidence UI with validated live results.

## Contracts and state transitions

- `analysis-confirmation -> analyzing -> candidates | no-candidates |
  analysis-failed`; cancellation stays requested until proven terminal.
- Operation success is insufficient until the analysis bundle is fetched and
  validated. Missing/invalid result becomes recoverable failure.
- `RETRY_ANALYSIS` is evidence-driven. Valid transcript reuse makes zero new
  transcription calls; a consumed provider action stays consumed when cost was
  incurred even if output was unusable.
- Candidate rank and duration are deterministic server outputs; model IDs/times
  are not trusted.

## Privacy, provider, and cost constraints

- No video, filename, object path, signed URL, grant/cookie, IP, identity, or raw
  provider payload enters either model request.
- Logs/result status contain counts, language, safe config ID, usage, and rule
  codes only—no transcript/prompt/rationale/title.
- Live calls require provider/privacy/spend approval, blank examples filled by
  the owner in ignored secret storage, current model/data-policy review, and an
  exact synthetic/purpose-recorded call budget.
- Default/local/CI remain fake, paid-disabled, network-denied, and assert call
  counts. Production never falls back from live to fake on failure.

## Acceptance criteria

- [ ] Valid fixture analysis produces one to four grounded distinct candidates
  through the exact API/UI path; no-candidate offers no editing fallback.
- [ ] Every reference resolves to existing words; range/evidence/overlap/rank
  and forbidden-claim rules pass deterministic evaluation.
- [ ] Injection, invented quote/fact, virality promise, duplicate, malformed,
  refusal, timeout, abort, rate/budget, and provider-error cases fail safely.
- [ ] One action produces at most one transcription and one candidate call;
  manual candidate retry with valid transcript increments only candidate count.
- [ ] Refresh/replay/cancel/expiry/clear create no duplicate job/provider call
  and preserve only evidence allowed by the recovery policy.
- [ ] Public errors/logs/storage contain no prohibited content or capability.
- [ ] Any controlled live check records exact call count, usage, cost, cleanup,
  config revision, and blockers without exposing content/account identifiers.

## Focused verification

- [ ] Run adapter shape/normalization/timeout/abort/error/call-count tests.
- [ ] Run candidate reconciliation and full deterministic evaluation matrix.
- [ ] Run API tests for start/replay/poll/cancel/success/no-candidate/failure/
  transcript-reuse/missing-result/expiry/clear.
- [ ] Run frontend progress/recovery/visibility/refresh/candidate integration and
  cleanup tests.
- [ ] Run fake-mode E2E upload-shaped analysis and refresh without network.
- [ ] Run a live short approved fixture only after explicit owner authorization;
  otherwise leave live checks unchecked.
- [ ] Run affected format/lint/typecheck/build, secret/content scans,
  `git diff --check`, and final status inspection.

## Documentation updates

- Update provider setup with current Deepgram/OpenAI project/data/retention,
  exact model/config, credentials-as-blank, and controlled live steps.
- Record candidate prompt/rubric/config revisions and content-free cost evidence.
- Update data-retention/recovery docs if normalized transcript storage is
  approved or rejected.
- Update parent/affected tickets before implementing any model, language,
  provider, retry, or retention change.

## Owner gates and external blockers

- Provider/privacy approval for Deepgram/OpenAI projects, current policies,
  region, normalized transcript retention, and public copy.
- Spend approval for exact hard limits, call count, and controlled live fixture.
- Explicit permission before any credentialed or paid call. Deterministic
  fake-mode implementation/evaluations may complete without it; live evidence
  remains unchecked.

## Commit boundary

Keep transcription, candidate selection, orchestration/recovery, and analysis UI
together as `CL-007: deliver grounded live analysis`. Do not split the same
feature into provider/UI follow-ups or absorb assembly/review/render. No Git,
credential, provider, or cloud mutation is authorized by this packet.

## Precision references

- [Analyze API and result contract](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#119-post-v1analyses)
- [Transcription and candidate providers](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#122-transcription-port)
- [Analysis pipeline stages](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#134-analysis-job-stages)
- [Paid-operation budgets and admission](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#17-paid-operations-timeouts-retries-concurrency-and-spend)
- [Candidate evaluations and API tests](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#207-candidate-selection-evaluations)

## Completion handoff

Report adapters/config revisions, prompt/reconciliation rules, route/job/stage
behavior, recovery/call-count evidence, UI states, changed files, exact checks,
live usage/cost/cleanup if authorized, and every provider/privacy/spend blocker.

</details>

</details>
