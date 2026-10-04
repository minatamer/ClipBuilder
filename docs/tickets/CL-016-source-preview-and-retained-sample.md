# CL-016 — Preview the source before finding moments

Status: local implementation and validation complete; owner-authorized private
cloud upload, impersonated ADC and actual Step 1 playback/seeking verified on
2026-10-04; the owner reported it working. The later streaming follow-up verifies
Clear/reselect/reload and seek playback; detailed perceptual A/V-sync,
real server-copy/AI processing and media-driven quality acceptance remain unchecked. The
owner finished the current UI/UX feedback round for now and authorized the
combined [whole-file commit plan](CL-013-016-UI-COMMIT_PLAN.md) on 2026-10-03.
No public paid enablement or external AI test has occurred.

Dependencies: implemented CL-005 workspace, CL-007 source-analysis flow,
CL-012 protected media transport and the completed local CL-013 redesign.
HEAD before this follow-up: `5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1`.
Earlier CL-013 feedback changes were uncommitted at that baseline. The owner's
2026-10-03 handoff now authorizes their sequential staging and commits together
with this follow-up; preserve all whole-file changes in the documented plan.

## Owner loading indicator follow-up — 2026-10-04

The owner requested a centered spinner in the blank video area while the source
loads. The shared native player now shows a spinner and accessible **Loading
video…** status until a current frame is available, and during buffering/seeking.
Metadata alone does not dismiss it. Media errors stop the indicator; Clear,
source replacement and unmount remove every added listener. Source, candidate
and final native-video surfaces use the same indicator; simulated source
placeholders remain explicitly labelled. Source metadata preload, protected
streaming and explicit **Find moments** initiation retain their existing behavior.
No new provider/media dispatch, dependency, timer or capability is introduced.

Synthetic event checks cover metadata-before-frame, resumed playback, seeking
without a frame, media errors and listener cleanup. Static markup checks cover
initial streamed loading and the key-free simulated placeholder. Actual media
loading/buffering appearance and device behavior remain manual checks. Real
Step 1 playback requires its approved storage access but no Gemini key; paid AI
requires keys/live approvals and remains exclusively owner-tested.

Verification: 33 focused frontend tests passed, followed by all five root gates
(`format:check`, `lint`, `typecheck`, `test:unit`: 734 synthetic tests across 71
files, and `build`). Backend health, `/start` and public sample config returned
200; no real-media or provider request was triggered. The build's generated Next
type references were returned to the existing development paths. The Windows
production inventory still reports 26 external package links; this local UI
check does not close the independent public-release gate.

## Owner handoff — 2026-10-03

The owner paused further UI/UX feedback until the next session, planned for
2026-10-04. The [saved checklist](../operations/LOCAL_RELEASE_PREPARATION.md#owner-next-session-checklist--planned-2026-10-04)
orders protected sample setup, actual Step 1 playback, Gemini configuration and a
bounded paid real-flow test. Storage destination/IAM and concrete external actions
still need their checkpoint; no credentials or paid/cloud actions are used for
today's documentation and Git handoff. Fake mode remains keys-free and synthetic,
with no real download; no local AI weights/runtime are available or verified.

## Owner behavior

Owner fake-mode correction: **Use sample** must also work now in fake mode, through
the existing clearly labelled fixture journey without a file selection. This
supersedes the initial disabled-fake-sample UI recorded in the first browser pass
below. Keep Step 1/Find moments and real-mode gates unchanged; never use the real
podcast or cloud sample reader for fake mode, and never fall back from live to fake.

Latest owner navigation correction removes **Try sample video** from the landing.
**Get Started** opens standard intake, which offers **Use sample**. This
supersedes the earlier landing sample CTA requirement and browser evidence below.

- Remove **Use prepared input**. Add secondary **Use sample** next to primary
  **Choose a video**. Landing **Get Started** opens this intake; no landing sample
  CTA remains.
- File preparation and sample selection stay in **Step 1** for full-source
  playback/seek. Analysis starts only on explicit **Find moments** with the
  existing transfer/rights consent and live prerequisites.
- The retained, continuous 7:41 excerpt is input to the ordinary pipeline.
  No source-specific candidate ranges, transcript, framing, visuals or output.
- Keep the authorized local master permanently. The proposed cloud master uses
  a separate private retained-media bucket with no visitor expiry/lifecycle/
  sweeper; final destination and IAM approval remain at the owner checkpoint.
  The later streaming follow-up below removes the full browser sample copy;
  server processing still uses a separate disposable copy.

## Architecture and gates

Use the existing backend Google auth library for ADC-authenticated, generation-
pinned GCS reads; reuse exact byte-range streaming validation. Same-origin media
transport exposes no signed GCS capability or resource identifier to the browser.
The application reader has object-read permission only and no deletion method.
Renderer visitor cleanup never knows the retained bucket/object. This is one
fixed owner-configured input, not arbitrary remote URL ingestion or a download
from a media platform. Actual Google setup is documented in the narrow operation
guide after implementation, with blank owner configuration entries.

Real retained reads require explicit opt-in, local real-media composition,
approved cloud spend, ADC and complete private object/generation/byte settings.
Defaults/tests keep retained reads disabled, fake mode on and all paid/live flags
off. No new provider call or cloud action during ordinary tests. Real local
preview needs no Gemini key or AI runtime; live analysis/assembly/render retain
their independent grants, consent, keys, challenge and spend gates.

## Sequential implementation file plan (historical)

1. Contracts/public availability and server-only retained-source config; blank
   `.env.example` values and fail-closed defaults.
2. Backend fixed-object read adapter/use case/router; reuse media streaming;
   synthetic range/header/cancel/failure tests with injected auth/transport.
3. Frontend bounded same-origin media relay and source download into the existing
   temporary workspace; no master cleanup capability.
4. Intake actions, full-source preview, Step 1 confirmation, explicit fake/live
   analysis action; landing sample entry. Preserve cancellation/restore/consent.
5. Meaningful regression checks, settled root gates, fake browser journey,
   documentation and read-only validate/fix loop.

## Acceptance and evidence

- [x] Local behavior/source-preview and explicit-analysis regressions pass.
- [x] Retained read transport is bounded, generation-pinned, private and cancelable.
- [x] Disabled/default/test composition makes zero cloud/provider calls.
- [x] Visitor Clear/expiry has no code path or reference to either retained master;
      actual cloud retention/IAM verification remains at the owner checkpoint.
- [x] Root format/lint/typecheck/unit/build and diff checks pass.
- [x] Read-only validation has no actionable local findings.
- [x] Owner completes ADC/object setup and approves concrete cloud operation.
- [x] Actual sample preview/playback/seek verified; owner reported it working.
- [x] Real preview Clear/reselect/reload preservation verified for the protected stream.
- [ ] Detailed perceptual A/V sync and normal analysis verified (not fake quality).
- [ ] Final owner UI feedback and live rights/provider/spend gates recorded.

No deployment, public paid enablement, new accounts/history/editor or film work
is included. The later owner handoff authorizes only the documented Git plan;
earlier validation observations of no Git mutation describe those historical
passes. Existing source quality/license/transfer evidence must remain explicit;
no code test certifies media rights.

## Implementation and verification — 2026-10-03

Implemented the five file slices above. The existing reducer, temporary browser
workspace, admission, consent, analysis, assembly and renderer boundaries remain
the pipeline authority. The sample reader exposes only fixed generation-pinned
reads; no master reference enters session cleanup or rendering. The landing link
requests the same sample intake once, after restore, without initiating analysis.
Server-only configuration stays blank/disabled in the committed example.

Meaningful synthetic regressions cover disabled/test/fake gates; fixed read URL
and exact injected call counts; trusted origin/query/range/header rules; concurrent
capacity and cancellation; sanitized failures; bounded exact-length browser copy;
zero pre-abort calls; native source markup versus the labelled fake surface; and
no analysis dispatch before the explicit confirmation. The fake flow test proves
one analysis request at confirmation and retains selection/review/export behavior.
No new dependency, provider call, real media read, ADC use or cloud mutation was
needed for these checks.

Settled root checks passed: `corepack pnpm format:check`, `lint`, `typecheck`,
`test:unit`, `build`; **679 tests in 69 files**. `git diff --check` passed. The
production build inventory is 1,277 files, 26 external package links and
21,956,364 bytes, SHA-256
`f98ab6cefa28800e9df6d4a315802f651563b344eb40ffab25aa3b454a6ed1f9`.
The existing Windows artifact is not self-contained; this does not close the
separate public release gate. Existing renderer `fs.Stats` deprecation remains.

After all builds, the browser fixture journey completed: Choose a video →
Step 1 preview → refresh restores the waiting checkpoint → explicit Find moments
→ candidates → one selection → Proceed → automatic read-only review → Confirm
export → simulated delivery with disabled Download → Start over. Choosing another
video cleared the prior temporary session. The waiting preview stayed put for
over a minute without automatic analysis. Playback/seek uses the full fixture
range, source-labelled controls and no manual trim. Landing Try sample video
reaches `/start?source=sample`; default fake mode displays the disabled sample
action and honest configuration notice, with no canned podcast substitute.

Source confirmation was inspected at all eleven CL-013 viewport anchors. No root
horizontal/height overflow and no interactive target below 44px were measured.
Source controls sit beneath the landscape/native-aspect video; portrait candidate
and result control behavior remains intact. Synthetic captures and geometry are
ignored under `artifacts/qa/cl016-source-preview-20261003/`. These observations
do not certify actual footage playback, physical devices or screen readers.

## Validation disposition

Review scope: current unstaged CL-016 paths and new modules at HEAD
`5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1`; index empty. Earlier illustration,
Privacy/logo and completed CL-013 theme evidence were distinguished from this
functional follow-up. Reviewed the packet, its authority, combined relevant
diff/new files and existing workspace/media transport neighbors. No Git mutation
or cloud/provider action occurred during validation.

First browser pass reproduced two presentation findings: a leftover processing
panel hid the new waiting preview, and floating source controls obscured the
landscape surface on phones. Removing confirmation from the processing branch
and moving source-only controls below its media surface resolved both. Rechecked
the full current local scope and affected eleven-anchor geometry after fixes.

Verdict: **Meets ticket with concerns** — local implementation meets its scope;
the required external sample and owner-only evidence are still unverified.
**No actionable local findings.** Coverage: source checkpoint, explicit analysis,
shared entry, bounded private read, fail-closed fake/test defaults and cleanup
separation are covered; native actual-source/browser performance, cloud retention/
IAM/upload, ADC, source attribution/public rights, paid AI quality, physical device
and owner visual acceptance are unverified. No missing runtime evidence is
presented as a failed code check or as a completed release gate.

Next checkpoint: [retained sample setup and preservation](../operations/RETAINED_SAMPLE_SETUP.md).
The owner must select a dedicated retained destination and complete service-account
ADC login. ADC unlocks preview reads only; no Gemini key or local AI model is used
for preview. Real analysis still needs separately approved transfer/rights/spend,
keys, challenge and live flags. No local AI weights/runtime are available or used.

Owner checkpoint clarification: normal user uploads continue to use the existing
private visitor bucket. Its documented lifecycle/scans target `media/`; a retained
prefix could technically coexist, but the separate bucket is proposed to isolate
the permanent sample from the renderer's bucket-wide delete permission. The owner
has not chosen the final retained destination. No cloud policy was inspected or
changed, and no new resource/upload was performed. MP4 alone is not a security or
retention guarantee; intake at that checkpoint also permitted WebM and validated
actual media. The 2026-10-04 MP4-only follow-up below supersedes that format policy.

## Later owner fake-sample correction — 2026-10-03

Owner requested that Use sample still work in fake mode. Updated
`sample.experience.tsx` to admit the existing fake `sampleEnabled` availability
and dispatch `developmentInput()` without a file, retained-source download or
real-media workspace. Its existing stages still stop at Step 1 confirmation;
the explicit Find moments action starts fixture analysis. Intake labels sample
previews/results as simulated. Landing `source=sample` uses the same action once
after restoration. Real-media mode still requires configured retained sample
availability and a workspace, with no fixture fallback. Live consent is unchanged.

Expanded the existing `development.progress.test.tsx` flow to cover both file
metadata and sample defaults through confirmation, immutable review restore and
simulated result. It asserts zero calls at selection, exactly one call on explicit
analysis, and only `/api/sample/` transport with no media/download request. The
fixed real-sample download regressions remain unchanged. No new dependency or
sample-specific podcast result was introduced. Frontend guide and source-of-truth
owner direction now distinguish the two paths.

Verification: focused 18 tests passed; root format/lint/typecheck/unit/build
passed, **680 tests in 69 files**. Production inventory: 1,277 files, 26 external
package links, 21,954,464 bytes, SHA-256
`53b3adedccc0f9f6ae0a4f417e3cec8bcb68e268d6f2d90f7dd8226b586b10e2`.
The existing Windows self-contained release gap and renderer warning remain.

The initial fake-only consent reset tripped the effect lint rule on the landing
entry; removed that unnecessary reset because fake mode has no live consent UI.
Real input selection still resets live consent. A renderer build-context test
timed out at five seconds during concurrent heavy checks. The full suite passed
unchanged after those checks completed; no renderer fix or timeout weakening was
made. The exact owned leftover test context was path/time checked, removed and
its absence verified; subsequent successful tests left none. This is a recorded
verification timing event, not a claimed media/renderer defect.

Read-only revalidation of the changed availability, fake/real branches, landing
entry, existing state/effect neighbors, transport assertions and docs found no
actionable local issue. The real cloud/sample/AI/owner gates remain unchecked.
Fake mode requires no provider key or AI weights/runtime; it cannot establish real
quality or produce a real downloadable MP4. No ADC, real media, cloud/provider,
deployment or Git action occurred.

After the settled build, browser Use sample was enabled with retained cloud input
and live analysis disabled. Without choosing a file it completed Step 1 preview,
explicit Find moments, candidate selection, Proceed, clip review, Confirm export,
simulated delivery (Download disabled) and Start over. Landing Try sample video
also reached the same waiting Step 1 preview automatically, without analysis.
Ignored synthetic captures are in `artifacts/qa/cl016-fake-sample-20261003/`.
The existing owner tab and running services remain; no actual media was used.

## Later owner intake-guidance revision — 2026-10-03

Replaced the intake rights/temporary-media sentence with: "For the best results,
choose a clear conversation with focused topics, complete ideas, and minimal
background noise." `sample.experience.tsx` retains the real-mode device/storage/
transfer disclosure separately, and processing rights consent and live gates are
unchanged. The source of truth records this presentation decision.

Verification: 22 existing frontend tests in the page/development-flow suites,
root format check and diff whitespace check passed. Browser inspection at the
normal 490 × 618 viewport confirmed the exact recommendation, absence of the
old sentence, visible wrapped copy and no horizontal overflow. Ignored synthetic
capture: `artifacts/qa/cl016-fake-sample-20261003/input-guidance.jpg`.
Read-only review found no actionable issue in this copy change. The full suite
and production build were not repeated for this revision.

Fake mode still works without API keys and shows simulated results. Real sample
reads need the pending ADC/cloud setup; live Gemini processing still requires
keys, live flags, consent and existing approvals. No real media, paid/cloud call,
Git action or local AI weights/runtime were used or verified by this revision.

## Later owner landing-entry simplification — 2026-10-03

Removed the landing Try sample video anchor from `page.tsx` and its unused
`sampleAction` rules from `page.module.css`. Get Started still opens `/start`,
where Use sample remains beside Choose a video. Existing direct-query handling
and all preview/analysis/availability gates are unchanged; the landing no longer
links automatic sample selection. Frontend guide, source of truth and quality
matrix reflect the latest owner direction; earlier sample-link evidence above
is historical.

Verification: 11 existing page tests and the frontend production build passed.
Desktop 1280 × 800 and phone 390 × 844 showed no landing sample CTA, exactly one
workflow entry (Get Started to `/start`) and no horizontal overflow. Clicking
Get Started reached standard intake with Use sample visible and enabled in fake
mode, without selecting a source or starting analysis. Synthetic captures are
ignored in `artifacts/qa/cl016-landing-entry-20261003/`. Viewport override was
reset and the owned intake tab left open. No new test or full root suite was
needed for this narrow markup/style removal.

Read-only review at HEAD `5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1`
found no actionable local finding; earlier unstaged work is preserved and the
index remains empty. Fake mode needs no keys and produces simulated results;
actual retained reads still need ADC/cloud setup, and Gemini still requires
keys, enabled live flags and existing approvals. Media/device/owner/film/release
gates remain open. No cloud/provider, credential, real media, local AI runtime/
weights or Git action occurred.

## Protected sample storage checkpoint — 2026-10-04

The owner explicitly requested protected real-sample setup and Step 1 playback
verification. This authorizes the separate retained-storage setup, read-only
caller access and one create-only upload in the existing approved project/region;
it does not authorize Gemini processing, rendering, deployment or Git mutation.
The owner's service-account impersonated ADC acquired an access token and matched
the existing local caller. No credential contents or tokens were displayed.

Verified one separate private Standard regional bucket, uniform bucket access,
enforced public access prevention, no lifecycle deletion rules and no renderer
bucket grant. Project/ancestor policies contained no direct inherited local-caller,
renderer or public-principal grants. Granted only bucket-scoped Storage Object
Viewer to the existing local caller. Its effective permission probe permits
object read/list and denies object create/update/delete, bucket deletion/update
and IAM changes. Anonymous object access was rejected.

One create-only upload used generation-match zero, MP4 content type and no-store
cache control. Uploaded byte count and MD5 match the preserved local master;
the local SHA-256 is unchanged. A generation-pinned authenticated one-byte media
read returned the exact range, type and length. Actual identifiers, generations
and hashes are kept only in ignored owner runtime/configuration records.
No existing visitor storage or renderer resource was changed.

The owner subsequently authorized secret-free app-local setup under the
[CL-015 configuration follow-up](CL-015-deploy-validate-measure-and-rollback.md#owner-app-local-configuration-follow-up--2026-10-04). The backend now loads
its ignored `.env.local` and private runtime sample reference. Real mode is on,
paid processing is off and no Gemini key is needed. Normal local backend health,
frontend `/start` and safe config GETs returned 200; retained sample availability
is true while analysis/assembly/render availability is false.

Use sample fetched the actual retained object into the disposable browser
workspace and reached Step 1 full-source preview. The video reports duration
461 seconds, decoded dimensions 1280×720, ready state 4 and no media error.
Playback time advanced beyond 11 seconds; a slider seek reached exactly 02:00.
Audio is unmuted, and the owner reported “its working”. No screenshots or media
content were captured; no Find moments request, Gemini call or renderer job ran.
The working preview is left open and local apps remain running. Detailed
perceptual sync checks and an actual Clear/reload preservation cycle remain
unverified; this evidence is not live AI or final output quality acceptance.
Fake-mode fixtures remain keys-free and cannot produce a real downloadable MP4.
The real preview uses authenticated storage, with paid/live AI and rendering off;
it requires no Gemini key or local AI weights/runtime. Full real processing and
quality still require separate keys/live/rights/provider/cloud/spend approvals.

## Owner MP4-only intake follow-up — 2026-10-04

The owner requested limiting the demo to MP4 after seeing the MP4/WebM intake
copy. This supersedes the earlier format policy in completed packets; it changes
video intake, not the independent retained-master boundary or audio transport.

Changed files and behavior:

- Contracts `media.schema.ts`, `api.schema.ts` and `cloud-media.schema.ts` accept
  only MP4 source descriptors and one shared `video/mp4` upload MIME schema.
  Corresponding contract tests reject WebM at both upload boundaries.
- Frontend `sample.experience.tsx`, `development.input.ts`, `session.types.ts`
  and `media.errors.ts` restrict the picker, copy and fake metadata intake.
  `source.worker.ts` and the source side of `audio.extraction.ts` use only the
  MP4 demuxer; `source-analysis.flow.ts` transfers the validated source as MP4.
  Internal Opus/WebM audio output/validation remains supported. Development,
  session persistence and lifecycle fixtures now use MP4 replacement inputs.
- Backend `analysis.usecase.ts` declares MP4 to the private media service.
  `developmentPreview.test.ts` proves a WebM API request returns 400 without
  calling upload authorization, and retains replacement/idempotency coverage.
- Renderer `inspection.ts` removes Matroska/WebM from the native demuxer allowlist,
  rejects detected WebM and QuickTime's `qt  ` brand, and preserves existing
  track, codec, dimension, rotation, rate, size and duration validation.
  New `source-inspection.test.ts` uses synthetic files and injected probe payloads;
  it does not claim native full-file decoding or real quality acceptance.
- Renderer `temporary-intent.ts` keeps legacy WebM metadata readable for cleanup,
  discarding its obsolete source profile. `media-sessions.ts` blocks further
  processing of those records; cleanup tests prove upload cancellation, object
  deletion and eventual intent expiry. Browser worker tests recognize a synthetic
  WebM header before proving that MP4-labelled bytes are rejected. Browser workspace
  tests prove old WebM journals clear without reopening media or losing the
  separate remote cleanup obligation.
- Frontend README, current source-of-truth policy, browser-media architecture,
  retained-sample guide and this ticket/index reflect the owner decision.

Settled verification: `corepack pnpm build:contracts`, `corepack pnpm format:check`,
`corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit` and
`corepack pnpm build` passed. The unit gate contains 692 synthetic tests in 70
files. Focused format, API, worker, persistence, recovery and cleanup checks
passed before the final root gates. `git diff --check` passed and the index stayed
empty. The three non-metered local GETs (backend health, `/start` and safe sample
config) returned 200; existing healthy apps remain running. No fresh visual or
perceptual playback acceptance is claimed for this format-only follow-up.

The local frontend artifact inventory passes with 1277 files, eight app routes
and 26 external package links; the immutable release limitation is unchanged.
Formatting used the installed pinned Prettier CLI directly for the edited files
because the pnpm exec shim could not resolve its executable; normal root gates
ran through the pinned package manager. No dependency or configuration change
was needed for that tooling issue.

Read-only validation of the unstaged MP4 follow-up against HEAD
`22631c54e159c62363fde83302225c12fdf3a68d`: **Meets ticket; no actionable
findings.** Inspected the owner requirement, contracts, real worker/native
inspection path, transfer integration, legacy deletion compatibility, regression
coverage and documentation. Pre-existing app-local environment/runtime changes
are preserved and excluded from this follow-up verdict. No index, Git history,
provider/cloud resource, credential, retained master or paid processing mutation
occurred. Synthetic test resources drain/close and temporary files are removed.

Fake mode remains keys-free and simulated, with no real final download. Real
Step 1 preview needs ADC/storage access but no Gemini key or local AI runtime.
Detailed A/V sync, real Clear/reload preservation, native full-source quality,
device/visual/film acceptance and all unfinished Gemini/rights/provider/cloud/
spend/deployment gates remain unchecked. This format restriction does not complete
or authorize those gates.

## Owner sample streaming follow-up — 2026-10-04

The owner requested removing full-file preparation from **Use sample** after
observing its download/hash/OPFS delay. The authorized local correction opens
protected Step 1 streaming immediately and moves processing-copy preparation
to explicit **Find moments** on the server. The existing retained-storage/ADC
preview authorization covers read-only playback verification; it does not
authorize a new cloud resource, processing upload, Gemini call or deployment.

Implementation:

- Contracts `grounded-analysis.schema.ts` defines strict sample consent/challenge
  input and generation-only output, reusing existing field schemas. Browser
  input cannot choose a bucket, object, URL, generation or source descriptor.
- Backend `retained-sample.processing.ts` fingerprints the fixed generation in
  bounded reads, then transfers 4-MiB chunks through the existing renderer upload
  capability. It validates exact source ranges/length/MIME, resumable
  acknowledgements and bounded final metadata, and cancels/releases response
  readers. This uses two read passes rather than Storage rewrite or broader IAM.
  The generation-pinned read adapter remains read-only; no renderer master grant
  or master cleanup reference is introduced.
- `analysis.usecase.ts` adds single-use sample preparation behind the existing
  transcription admission, consent and challenge. Normal candidate analysis
  verifies the copied fingerprint/bytes and constructs the descriptor from
  authoritative renderer inspection. Existing upload comparison remains for
  chosen files. Failed/interrupted copies use disposable-binding cleanup;
  completed, failed and uncertain actions cannot replay. Analysis composition
  and the `/v1/analysis/sample` route connect this path only under live gates.
- Frontend `browser.workspace.ts`, workspace schema/restore and session
  types/reducer journal only the retained-sample selection. No raw source file,
  artifact, fingerprint or private master identifier is stored for preview.
  Reload derives the same fixed stream endpoint; Clear/expiry remove selection
  and preserve independent processing-cleanup obligations. Source analysis API,
  flow and the Next POST allowlist use server sample preparation at confirmation;
  tests assert zero browser upload/transfer calls for that branch.
- `sample.experience.tsx` selects the stream without waiting for source bytes.
  `source-preview.tsx`/`portrait-player.tsx` show unknown duration and disable
  playback/seek until native metadata arrives, then use the actual duration. Intake
  distinguishes chosen local files from the privately streamed sample. The
  obsolete browser full-download module and its seven tests are removed.
  Source of truth, service guides and retained/analysis operations own the new
  behavior; older dated browser-copy evidence above remains historical.

Synthetic regressions cover selection without source-worker/hash/copy work,
reload, Clear, expiry, a canceled journal commit, invalid local/unreceipted
sample evidence, single-use admitted copy, paid-off/consent/CSRF gates, malformed
source ranges and byte counts, bounded chunk transfer/metadata, stalled response
cancellation, copied-byte mismatch before AI, and Clear during transfer. Fake
mode remains fixture-only and keys-free, with no real final download; tests
inject storage/renderer/provider ports without network, ADC or paid calls.

Real preview verification used the existing approved storage read path:
cleared the old disposable browser source, selected the sample and reached Step
1 in approximately 414 ms (entry timing, not first-frame or throughput SLA).
The video source is the fixed same-origin stream endpoint; native metadata
reports 461 seconds, 1280×720, ready state 4 and no media error. Refresh restores
that stream; playback advances, an exact two-minute seek works and audio is
unmuted. The preview is left paused around 02:05 with Find moments disabled.
A one-byte protected relay read returned 206 and one byte. No screenshots/media
content, master mutation, processing copy, renderer job or AI call occurred.
This verifies Clear/reselect/reload playback preservation, not perceptual sync,
source rights, native maximum-envelope quality or a real server-copy/AI flow.

Final settled verification: `corepack pnpm build:contracts`, `corepack pnpm
format:check`, `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm
test:unit` and `corepack pnpm build` passed, with **714 synthetic tests in 70
files** (root 31, contracts 60, composition 3, backend 243, frontend 316,
renderer 61). The earlier parallel check hit the existing boundary-lint test
timeout; it passed unchanged in the isolated full unit run. The first loading
control assertion assumed HTML attribute order; correcting the assertion left
the implementation unchanged. No timeout weakening or dependency change was
made. `git diff --check` passed; the index remains empty.

The local frontend artifact inventory passes with 1277 files, eight app routes,
26 external package links and 21,969,300 bytes, SHA-256
`7d7b3f022eb78b53ce5e9bb9ccb9057408aa29ee230ebc93e80c5760881f8e7e`.
Its Windows output remains non-self-contained. Existing local health, start and
sample-config GETs returned 200 and the apps remain running. No new app process
or cloud resource was launched. Formatting used the installed pinned Prettier
CLI as in the prior follow-up; final gates used the pinned package manager.

Read-only validation against HEAD
`22631c54e159c62363fde83302225c12fdf3a68d`, current unstaged streaming changes and
the two new backend processing modules: **Meets ticket with concerns; no
remaining actionable local findings.** The first pass found that Play could
start before metadata then reset when duration changed. Execution disabled Play
as well as seek until metadata, and revalidation confirmed the resolved guard,
unknown-duration display and regression assertions. Reviewed contracts,
composition, protected routes/relay, fixed reader and bounded transfer, copied
source binding/inspection, single-use admission and cleanup, workspace/reducer/
restore, normal file intake, fake branch and documentation. Coverage is complete
for the local fix and real preview; server-copy/cloud/AI and perceptual quality
remain unverified. Pre-existing MP4-only and app-local configuration changes are
preserved and excluded from this follow-up verdict. Tests close synthetic
readers, streams, listeners and work; no media scratch or new browser tab was
created. No credential files were inspected, and no Git/index action occurred.

The Windows release artifact's external-package-link limitation and all live
provider/rights/spend/device/film/deployment gates remain open. Real preview
needs ADC/storage access but no Gemini key or local AI weights/runtime.

## Owner preview-note removal — 2026-10-04

Removed the disabled-analysis processing-gates sentence and its paragraph from
local Step 1 in `sample.experience.tsx`, as explicitly requested. Fake-mode
simulation notice and enabled-live transfer/consent copy remain. No processing
availability, authorization, master retention or workflow behavior changed.

Verification: 29 existing frontend tests in the sample, development-flow and
source-preview suites passed, along with focused formatting and diff checks.
Browser text inspection confirms the sentence is absent; refresh restores the
protected source-video preview with Find moments still disabled. No real media
screenshots were taken. Full root gates/build were not repeated for this copy
change; their dated streaming-fix evidence above remains historical. Nothing
was staged or committed. Fake mode still works without keys using fixtures;
real analysis needs its existing keys/live/rights/provider/cloud/spend gates,
and perceptual sync, live processing and release acceptance remain unchecked.
