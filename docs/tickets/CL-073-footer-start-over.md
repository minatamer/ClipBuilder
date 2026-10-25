# CL-073 — Start over directly from the workspace footer

Status: implemented and locally validated; owner personal visual acceptance is
manual. CL-067–072 pending work remains
in place; this packet changes the current session reset UI only.

## Scope and plan

Move Start over from Session into the visible persistent footer beside mode
identity. Reuse the existing protected workspace DELETE/reset flow. The owner
explicitly requests discarding the current video/session, including unapplied
browser edits; do not disable this action merely because edits are dirty.
Processing/acquisition/pending guards remain. Preserve saved drafts/exports,
downloaded sources, the retained demo master and configuration. Reset is not
deletion of the owner's saved library.

Remove the empty Session menu, its document listeners and unused styles. Preserve
the existing cleanup/save-error Retry and explicit Discard session fallback in
the footer. Return to fresh upload/YouTube intake locally (upload-only hosted),
clearing selections, clips, edit state and preview state only after server
acknowledgment. Failure must retain the workspace and offer retry. Focus the new
step heading after reset. Use existing shared Button/tokens and one existing
primary workflow action; do not introduce a confirmation dialog or another flow.

Files: `experience.tsx`, narrow footer CSS, existing proof driver that opened
Session, a focused synthetic browser proof, and owning source-of-truth/workflow/
frontend guide/ticket/index evidence. No backend/contract/worker change or restart.

## Acceptance

- [x] Start over is visibly in the footer at desktop/390/320, keyboard reachable
      and styled with shared controls; ordinary editor/dirty actions still fit.
- [x] It works from completed editing and from moment selection, including dirty
      local edits; one reset returns to fresh intake and clears session state.
- [x] Pending/active work disables reset. Failed reset retains the current UI;
      Retry and explicit discard fallback remain usable and content-safe.
- [x] Saved/retained media handling uses unchanged backend semantics. Local and
      hosted intake boundaries remain; no processing/provider call is needed.
- [x] Relevant browser/types/lint/format checks and read-only validation pass;
      cleanup closes owned browsers/listeners/synthetic scratch. Actual owner
      session/media/configuration remain untouched by verification.
- [ ] Owner personal visual acceptance remains manual.

Fake mode needs no API keys for reset or synthetic browser checks. Real provider
processing still requires owner keys/live flags/approvals; resetting a session
does not authorize any new processing. No local AI model or paid/cloud action.

## Execution and validation — 2026-10-25

`experience.tsx` now renders Start over directly beside the footer mode identity,
using the existing clear function. Unapplied browser edits do not disable this
explicit reset; acquisition, pending requests and active clip work still do.
Acknowledged reset clears workspace, selection/results, initial clip, dirty
state and preview/drag state; unmounting clears editor forms, playback and
child-owned requests/polls. Heading focus follows workspace changes as well as
view changes, so reset from moments also focuses the fresh intake heading.

Removed the empty Session menu/ref, two document event listeners and its styles.
Footer session controls wrap using existing tokens/buttons, retaining one primary
workflow action. Existing failed-save conflict becomes Retry reset plus explicit
Discard session; ordinary cleanup failure keeps Start over available for retry.
The shared browser walkthrough now clicks the visible action directly.

Verification:

- New `test/local-start-over.proof.ts` passes with current-source real React/
  Chromium UI and generated silent MP4; backend replies/DELETE are isolated
  synthetic fixtures. Desktop 1440x900 and phones 390x844/320x844 cover normal
  and dirty footer layout, 44px targets, focusability and acknowledged reset.
  320x568 covers conflict/discard and hosted reset; moment-selection reset,
  pending-disable, active-work guard and ordinary failure/retry also pass.
- Nine exact synthetic DELETE requests are asserted, with discard enabled only
  for the explicit fallback. Zero unexpected mutations and exact provider counts
  plan/image/render = 0/0/0. No reset/processing request was sent to the owner's
  running app, and its actual workspace/media/configuration are untouched.
- After reset, clip/editor/selection DOM is gone, intake is fresh and the heading
  focused; local URL is empty and hosted intake excludes YouTube/sample bypass.
  The final fixture's browser/server and verified owned scratch are closed.
- Frontend and proof TypeScript, affected-file ESLint, Prettier and
  `git diff --check` pass. No broad unit/native export suite: backend deletion,
  contracts and media composition are unchanged. No backend rebuild/restart.
- Dirty desktop/320 screenshots in ignored `.local-build/evidence/cl073-*`
  were inspected. Start over and Apply/Discard stay readable and in the footer;
  phone wrapping preserves viewport reachability without horizontal overflow.

Backend semantics were inspected, not replaced: DELETE flushes accepted local
draft state before cleanup, protects a failed save unless discard is explicit,
closes session streams/jobs, forgets session state and removes only its disposable
processing workspace. Saved source/draft/export libraries and retained originals
are outside that deletion path. No new library purge or provider processing.

Final read-only validation: **Meets ticket; no actionable findings**. Reviewed
footer states, exact reset binding, dirty/failure handling, cleanup, selection/
preview reset, hosted boundary, dependency direction and privacy. The synthetic
proof's cleanup path was extracted to retain guarded-path deletion without an
unsafe throw in finally. No product-scope deviation; owner personal visual and
real-media acceptance remain manual. Existing pending work is preserved; nothing
staged, committed, pushed or deployed.
