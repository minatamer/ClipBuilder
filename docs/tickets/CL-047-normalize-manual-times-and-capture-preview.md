# CL-047 — Normalize manual times and capture the preview position

Status: implemented and verified. Dependency: implemented CL-046.

Owner request 2026-10-23: carry overflowing seconds/minutes in manual Start/End
clocks (60 and 90 included), and provide a current-preview-time capture action
for each endpoint of every manual clip. Keep HH:MM:SS with no milliseconds.

Normalize complete nonnegative whole-number HH:MM:SS input on blur and before
submission, without interrupting partial typing. Examples: 00:00:90 becomes
00:01:30; 00:90:00 becomes 01:30:00. Invalid, reversed, oversized and out-of-source
ranges still fail existing validation; never silently clamp typed clocks.
Preserve existing precise restored endpoints until individually edited/captured.

Read the actual source preview playhead on explicit capture, floor it to whole
seconds and bound it to the loaded source. Disable capture while unavailable,
seeking, failed or busy; a stale/unavailable preview must not overwrite a field.
Reuse shared buttons, keep field tools inline and primary workflow actions in
the persistent footer. Inspect desktop and narrow phone layouts with multiple
manual clips and retain selection invalidation on edits.

Required evidence: focused arithmetic/invalid/bounds units; generated-media
browser checks for normalization, per-row Start/End capture after seeking,
unavailable/seeking/busy guards, footer/layout and no capture-triggered dispatch;
frontend/test types, focused lint/format/diff checks and read-only validate.
Fake AI and these local controls need no API keys. Real AI quality/paid/cloud,
real media, physical devices and owner acceptance remain outside automated proof.
No ignored env reads, retained-media mutation, app process changes, deployment
or Git mutation are authorized by this packet.

Implementation: `manual-time.ts` owns frontend clock carrying and guarded preview
capture, using the existing canonical contract parser/formatter. Selection keeps
visible whole clocks separate from untouched restored precision; edits/captures
replace only the chosen endpoint, invalidate stale selections and normalize on
blur and submission. Experience connects the actual keyed source-video ref and
metadata/seek/error lifecycle; unavailable/busy capture cannot write. Capture uses
the shared quiet Button with a clock icon and concise label. Existing source,
range, frame alignment, processing, AI settings and footer behavior are unchanged.

Changed scope: new `manual-time.ts` and its units; selection panel, experience,
local CSS, runtime-capabilities test and generated-media design proof; feature
README, source of truth, ticket and index. Pre-existing CL-028–046 work is excluded.

Evidence:

- Focused fake/paid-off units: **27 passed** (22 arithmetic/capture cases and five
  runtime checks), using `scripts/local-test.config.ts`. Negative/partial/fractional
  and oversized clocks, source/clip bounds, finite clocks, loading/seeking/decode
  failures, whole-second capture and both source-duration bounds are covered.
- Final generated-video browser proof: **one passed in 32.98 seconds**, using
  `scripts/local-proof.config.ts` and `test/local-design.proof.ts`. Tested all four
  60/90 overflow examples, partial typing, actual paused preview seeking and
  independent Start/End captures in two rows, unchanged playhead, unavailable/
  seeking/error/busy guards, out-of-source rejection, and canonical submission
  without blur. Capture/typing produces zero mutations; one explicit analysis
  request hits only the controlled synthetic HTTP fixture and returns 503 to
  exercise busy/recovery, with zero provider/AI dispatches.
- Desktop 1440×900 and phones 390×844 / 320×568 pass field/button containment,
  44px target and persistent-footer checks. Inspected generated-only screenshots
  `.local-build/evidence/cl047-manual-times-{1440,390,320}.png`; shortened the visible
  Capture label to keep the paired phone controls compact. Browser/listener/
  native-generator/scratch cleanup passes with zero resource survivors.
- Frontend and test TypeScript checks, focused ESLint and format/diff checks pass.
  Initial sandbox Vitest cache access failed; approved unsandboxed rerun passed.
  A sandbox loopback GET was blocked; approved read-only `/start` check returns
  200 on the existing normal app. No app process was started/stopped or reconfigured.

No provider/cloud/live AI, real media or ignored configuration was used. Retained
sources, drafts, exports and private logs are untouched. Full suite/build,
physical-device/owner acceptance and real/paid AI remain unverified; this local
frontend change does not waive those gates. No Git mutation; index remains empty.

Read-only validate report:

- Requested: normalize overflowing manual clocks and capture each preview endpoint.
- Achieved: complete clocks carry on blur/submission; every endpoint has a guarded
  Capture action using the actual playhead, with concise responsive controls.
- Uncertain: physical-device/owner acceptance and live AI are not automated proof.

Verdict: **Meets ticket. No actionable findings.** Scope is this packet's unstaged
and new files, excluding pre-existing CL-028–046 changes; no implementation commit
is selected and the index is empty. Reviewed the complete packet, new arithmetic/
capture module and units, row precision/edit/normalization/selection lifecycle,
actual keyed video-ref integration, busy/unavailable guards, shared-button CSS,
browser proof and owning documentation. No edits or new tests during the review.

Coverage: **Covered** — carrying 60/90, partial/invalid input, source/range bounds,
submission without blur, endpoint/row isolation, stale-selection invalidation,
restored-precision preservation, playhead capture/readiness, footer/responsive
design, fake/paid-off isolation and owned resource cleanup. Restored precision
is verified by code inspection; browser capture uses new synthetic rows.
**Unverified** — full suite/build, physical devices, real media and paid/live AI.
Checks: the 27 focused units, final 32.98-second browser proof, frontend/test
types, focused lint/format, diff check and read-only local `/start` 200 above.
No additional suite was run during this lightweight review; no gate was waived.
