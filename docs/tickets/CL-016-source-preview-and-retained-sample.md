# CL-016 — Preview the source before finding moments

Status: local implementation and validation complete; private cloud upload/ADC,
actual sample playback and media-driven owner acceptance remain unchecked. The
owner finished the current UI/UX feedback round for now and authorized the
combined [whole-file commit plan](CL-013-016-UI-COMMIT_PLAN.md) on 2026-10-03.
No public paid enablement or external sample/AI test has occurred.

Dependencies: implemented CL-005 workspace, CL-007 source-analysis flow,
CL-012 protected media transport and the completed local CL-013 redesign.
HEAD before this follow-up: `5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1`.
Earlier CL-013 feedback changes were uncommitted at that baseline. The owner's
2026-10-03 handoff now authorizes their sequential staging and commits together
with this follow-up; preserve all whole-file changes in the documented plan.

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
  Browser preparation and subsequent cloud upload use disposable copies only.

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
- [ ] Owner completes ADC/object setup and approves concrete cloud operation.
- [ ] Actual sample preview/seek and normal analysis verified (not fake quality).
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
retention guarantee; current intake also permits WebM and validates actual media.

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
