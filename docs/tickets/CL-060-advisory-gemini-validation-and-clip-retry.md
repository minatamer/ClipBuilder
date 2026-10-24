# CL-060 — Advisory Gemini critique and explicit failed-clip retry

Status: implemented and locally validated. Owner real-mode retry remains manual.
Dependency: CL-058/059 implementation and diagnostics.

Permanent owner decision — 2026-10-24: local validators must never reject usable
Gemini output for quality, grounding, evidence, timing, ordering, count, overlap
or editorial judgments. Record content-safe critiques only. The result must
remain available without requiring another paid request to satisfy a critic.
This latest decision supersedes historical semantic acceptance gates. Basic
decoding, authentication/binding, executable/media safety and bounded resources
remain; convert render clocks safely without rejecting the paid result. No
automatic provider retry. The owner also requests Retry for failed clips.

Acceptance:

- Audit actual local transcript/candidate/visual/image response paths and their
  downstream duplicate validators. Replace quality throws/filtering with safe
  critique records. Decode optional data tolerantly and preserve usable results.
  Rejecting optional art must not hide the otherwise usable video/captions.
- Retain completed plans/assets/preparation for explicit retry; preserve the
  successful sibling clip, source, saved drafts/exports and private logs. Retry
  failed/canceled preparation or rendering through the existing serialized
  coordinator, revision/idempotency/cancellation and operating-mode gates.
  No automatic retry; user action may repeat only work without reusable output.
- Show a concise Retry clip action for a failed clip even without a prepared
  base. Use shared Button in the persistent footer, one relevant primary,
  pending guards and accessible failure state. Preserve readiness, dirty state,
  keyboard clip tabs and desktop/phone geometry.
- Add synthetic regressions for advisory quality checks, tolerant usable
  decoding, downstream render continuation, retry stages, duplicate requests,
  preserved outputs/edits/siblings and exact provider/native calls. Run relevant
  local/shared suites, types/lint/format, and synthetic browser/native proof;
  perform read-only validate and record actual evidence.
- Rebuild/reload the normal backend's current worker with verified lifecycle
  ownership, preserve frontend/configuration and restore saved paid work.
  No fresh paid processing is authorized by this code-change request.

All automated checks remain synthetic/fake, paid-off and network-blocked with no
keys or ignored env reads. Real AI still uses the owner's configured key and
approvals, with deliberate user actions. No Git mutation or cloud/deployment work.

## Implementation and evidence — 2026-10-24

- Transcript/provider/domain duplicate timing and order gates are advisory;
  decoded words remain unchanged. Candidate copy/evidence/order/overlap/duration
  critiques do not discard usable returned ranges. Duplicate visible passages
  share one processing identity rather than buy duplicate preparation.
- Visual plan decoding retains usable cues with advisory grounding/clock checks
  and safe physical frame conversion. Optional art tolerates extra metadata,
  unfinished generation and small valid rasters; unreadable art does not fail
  the video. Authentication, provenance/digest, bounded decoding/resources and
  native safety retain their guards. Fixed critique reasons contain no content.
- Clip contracts retain optional preparation checkpoints for old-draft
  compatibility. Retry resumes completed plans/images, supports failed initial
  preparation, and uses only native rendering for an existing prepared base.
  Revision, operation receipts, serialization/cancel guards and saved binding
  checks apply. Existing older failures recover their moment from saved analysis;
  their lost plan cannot be recovered and needs one explicit fresh attempt.
- Shared Button footer Retry is visible before a base exists and while a sibling
  runs. Pending/readiness/dirty and keyboard navigation behavior remain. The
  synthetic browser proof exercised the actual retry endpoint and native export,
  saved restore, editor changes, clip/category keyboard controls and downloads.
  Retry footer inspected at 1440, 390 and 320 pixels; screenshots remain ignored
  under `.local-build/evidence/cl060-retry-*.png`.

Checks actually run:

- Full fake/paid-off/network-blocked local suite: **491/491** at the main pass.
  Subsequent focused admission/checkpoint tests: **85/85**; final clip retry and
  legacy-draft compatibility suite: **14/14**. These later changes add binding
  and compatibility coverage rather than weaken the permanent rule.
- Shared transcribed-analysis/Gemini-picture suites: **53/53**. Backend,
  frontend, renderer and local/contracts TypeScript checks pass. Changed-file
  ESLint passes (three unused-import warnings removed and rechecked), Prettier
  and whitespace checks pass.
- Current-source synthetic browser/native proof: **pass**, 207.89 seconds.
  One native job at a time, 90ms measured cancellation, zero surviving owned
  children, five synthetic plans/images, no real provider requests. Two earlier
  proof attempts hit the old ten-second editor wait while retry was still
  exporting; the native-retry wait now allows sixty seconds. No app timeout,
  retry policy or provider count was changed to pass this harness.
- Read-only validate reviewed relevant tracked/untracked changes, actual
  route/footer integration, checkpoints/legacy restore, quality versus structural
  boundaries, call counts, dependency directions, privacy and cleanup. Verdict:
  **Meets ticket; no actionable findings**. Related CL-058/059 changes remain
  unstaged alongside this packet; no Git mutation was performed.
- Verified backend supervisor/watcher/worker shutdown (ten owned identities,
  zero survivors, ports 4000/4200 released), then normal hidden startup and
  worker rebuild. New listeners: backend PID 11420 on 4000, internal worker PID
  25764 on 4200; supervisor PID 15432. Frontend PID 6684 on 3000 preserved.
  Health, `/start`, sample configuration and local capabilities return 200:
  live / provider-ai / planning available / cloud false. Saved session restored
  with failed first clip and ready second clip, one existing export, and unchanged
  provider/native counters. Runtime records and separate logs stay outside Git.

Deviations: none. No fresh paid retry was triggered. Real Gemini quality and
owner acceptance remain unchecked; configured keys/live approvals are required
for the owner's deliberate retry. Retained media, drafts, exports, captures,
private logs and ignored configuration were preserved.
