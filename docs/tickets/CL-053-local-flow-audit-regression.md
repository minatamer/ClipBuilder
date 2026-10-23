# CL-053 — Local flow audit regression

Status: implemented and validated. Dependency: validated CL-052.

Authority: [complete owner audit](CL-050-clean-local-flow-and-editor.md).

Acceptance:

- Run generated-media fake/paid-off flow from intake through manual capture/
  normalization, results defaults/tabs, process, clean editor, clip/settings/
  sub-tabs, caption presets/drag, multiple uploaded pictures/timing/motion,
  apply/discard/export/download and saved draft reopen.
- Verify add-more/back editor navigation retains state, pauses hidden source,
  prevents dirty loss; one primary plus one secondary in footer. No stacked
  workflows, redundant notices, uncontrolled height/overflow, native progress
  styling or reduced-motion suppression. Preserve retry/error/cancel behavior.
- Exercise responsive widths 1440, 390, 320; inspect generated screenshots and
  verify keyboard/focus/touch targets. Use synthetic video and bundled sample
  only, never owner media or active sessions as an automated fixture.
- Decode native output, compare caption/visual frame states, export edited
  revisions, reopen saved state and assert exact fake boundary counts plus zero
  unexpected jobs/provider/cloud requests. Drain owned sockets/browser/worker/
  scratch; preserve existing app and other apps.
- Relevant unit suite, types/lint/format, contracts boundary/build and public
  exclusion as affected. Record exact checks and every unverified owner/device/
  real-provider item. Final read-only validate/fix loop for combined packets.
- No Git stage/commit/push, new services/configuration, deployment or paid calls.

Final audit corrections:

- Caption typography preserves spatial center/alignment instead of resetting
  placement. Invalid settings and failed uploads report short actionable errors.
- Clip-state labels are readable. No-op Home/End clears deferred keyboard focus,
  so a following mouse clip switch cannot focus the previously selected tab.
- Selected layers take pointer priority over overlapping layers. Resize controls
  keep a 44px target at actual Player scale, with a smaller visible grip.
- Quarter-position presets fit oversized boxes into their target half before
  centering; resizing a box cannot silently make Upper/Lower half inaccurate.
  This last pure-state correction is covered by the final unit snapshot and
  frontend types/lint; the native browser proof exercises unchanged default-size
  positions. No additional native/export path changed after that proof.
- Four picture sub-tabs fit 320px. Synthetic screenshots cover desktop/390/320;
  only the current inspector appears, with two contextual workflow actions.
- Fresh edited export exposed an obsolete `.local-build/overlay` missing new
  presets/motion. Proof now compiles its own source overlay into owned scratch.
  The normal app's worker has also been rebuilt/reloaded. AGENTS/guide document
  this requirement. No logging/privacy gate was weakened to diagnose the issue.
- Closed build input validation now admits exactly the credited NASA sample;
  all other unlisted raster files remain rejected. Backend build copies it into
  its admitted fake adapter's output directory. Frontend context never admits it.

Evidence produced:

- Root **test:unit: 1,728 tests / 157 files pass**, including contracts/dependency
  boundaries, closed build inputs and hosted local-route rejection. Final
  separate local suite: **464 tests / 44 files pass** (19.57s), including the
  typography-placement and oversized-preset regressions.
- Full root typecheck (contracts/composition builds and all applications/local
  contracts) passes. Final frontend/test types, root lint and format checks pass.
- Backend build and isolated **canonical Turbopack** frontend build pass. The
  frontend build uses a closed source copy and guarded fake/paid-off environment,
  never the running app's `.next` or ignored environment files. A preliminary
  noncanonical Webpack attempt hit the pre-existing global CSS-module selector;
  no unrelated styling was changed to accommodate that alternate bundler.
- Intake/design proof and native RGB/video-look parity proof pass. The final
  settled editing proof including the no-op keyboard correction passes in
  **83.63s**. It covers actual
  mouse/touch drag, exact caption positions, PNG/JPEG/WebP upload and >3 manual
  cues, timing/motion/position, Apply/Discard, dirty/keyboard/retry guards and
  responsive geometry. Existing API/CLI export/draft/source retention survives.
- Added fresh browser walkthrough: generated MP4 upload → two manual ranges →
  default-selected results → explicit Process → clean editor (hidden source
  paused) → caption rounded/bounce and picture slide/pop edits → Apply → explicit
  Export → real MP4 download → whole-file FFmpeg decode → page reload with edits
  and export intact. Exact fake counts **5 transcription / 4 selection / 5 plan /
  5 image**, including all earlier proof operations; no real AI/provider/cloud/
  YouTube call. Old saved-draft UI checks add no native work. One native worker,
  zero surviving owned resources; scratch/browser/servers drained.
- Reviewed screenshots `.local-build/evidence/cl034-editor-{1440,390,320}.png`
  and `cl053-pictures-{1440,390,320}.png`, plus portrait failure states. Screenshots
  contain generated test content only, never owner source material. Physical
  touch devices and real footage/readability remain owner-only CL-025.

Actual app refresh (separate from synthetic tests): old backend's eight verified
processes stopped with zero survivors; 4000/4200 released, frontend PID 8544 on
3000 preserved. One initial background launch selected global pnpm 11.25.0;
that failed tree exited with no listeners/orphans. Relaunch uses pinned pnpm
11.19.0 and supported Node, normal backend command and normal env loading; no
operating flags/configuration were changed. New launcher **34036**, backend
**28872:4000**, worker **31396:4200**. Health, `/start` and `/api/sample/config`
return 200; safe capability GET confirms **synthetic-ai / cloud:false**. No
processing request was made against the owner's app. Other app untouched.

Private runtime record/logs (preserved, outside Git):
`C:/Users/minat/AppData/Local/Temp/clipbuilder-cl053-runtime-9f72034d26de4b85b609549d5ee90cda/ownership.json`,
`backend.pinned.stdout.log`, `backend.pinned.stderr.log` in that same directory.

Remaining unchecked: owner review, physical hardware, real-source editorial/
codec usability, real YouTube retrieval, live Gemini quality/paid processing and
Linux/cloud deployment. No real AI model/weights added. All retained masters,
saved sources/drafts/exports, captures, private logs and ignored configuration
preserved. No stage/commit/push; pre-existing CL-028–049 excluded from this claim.

Read-only validate, final settled pass:

- Requested: audit the full flow, replace stacked editing with clean clip/settings
  tabs and contextual footer, make caption placement and visual editing usable,
  improve fictional test content and add researched social caption styles.
- Achieved: all implementation requirements, shared export wiring and fake-mode
  browser/native checks above. The normal app is ready in fake/cloud-off mode.
- Limits: owner/physical-device/live-service items remain explicitly unchecked;
  synthetic fixtures do not establish real AI quality or source transcription.

Verdict: **Meets ticket; no actionable findings on the settled snapshot.**

Coverage: **Covered** — clean exclusive views/clip and inspector tabs; contextual
footer/copy; drag/presets/touch targets; caption styles/timing/cache; multi-picture
upload/timing/motion/position; fictional sample content and provenance; native
export/download/reopen; responsive/retry/dirty/cancel/error states; boundaries,
configuration/privacy/process cleanup. **Unverified** — owner acceptance,
physical devices, real media/YouTube/live AI and Linux/cloud/deployment.

Reviewed the complete CL-050–053 packets, relevant staged/unstaged/new files,
shared schemas/render/cache, UI actions and async lifecycle, sample admission/
build closure, source/draft retention, and final evidence. Index is empty and no
implementation commit selected; pre-existing CL-028–049 work is excluded. All
findings (Player focus, no-op keyboard request, small-screen tabs, scaled grips,
stale overlay fixture/build, position resets, non-actionable errors and sample
build admission) are resolved with matching code/check evidence. No requirements
were weakened; checks above are actual results. Full root build was deliberately
split into affected package builds and an isolated canonical frontend build to
preserve the running dev output; no Linux image or deployment was attempted.

Changed scope: local frontend experience/batch/editor/state/CSS and ControlTabs;
shared local caption/visual contracts/composition/cache; backend fake content,
personal raster admission/asset receipt; sample JPEG/provenance; backend build/
closed input guard; synthetic browser/native/unit checks; owning guides, AGENTS,
source of truth and CL-050–053/CL-025 records. No deviation in feature scope.

Owner Git handoff — 2026-10-23:

The owner subsequently authorized staging and committing all pending changes in
file-level commits, with no push. This supersedes the earlier no-Git boundary
for this handoff only. Follow the [whole-file inventory](CL-053-COMMIT_PLAN.md),
including earlier CL-028–049 work and this audit, without hunk splitting.
Implementation is unchanged since the settled checks above; only the handoff
plan and ticket/index authorization notes were added. No additional live/provider,
YouTube, paid, cloud, deployment or owner-acceptance evidence is claimed.
