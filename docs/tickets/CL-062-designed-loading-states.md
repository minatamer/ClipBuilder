# CL-062 — Designed loading states with honest progress

Status: implemented and locally validated. Dependency: shared workflow from CL-061; its
Linux/cloud release gates do not block this frontend change.

Owner request — 2026-10-24: replace bland small text/spinner waits with a larger,
centered animated treatment consistent with the app. Cover queued, preparing,
exporting and other full-content loading states. Use a progress bar only when
actual progress is measurable; retain a spinner otherwise.

Acceptance:

- Reuse one branded loading treatment across clip queue/preparation/export/
  cancellation, preview loading, analysis and workspace connection/file opening.
  Respect shared tokens, current content slots, vertical clip rail, footer action
  ownership and editor readiness; preserve input state and cancellation behavior.
- Do not invent elapsed-time percentages or phase weighting. Queuing, Gemini,
  native export and preview readiness currently have no measured completion
  metric and remain indeterminate. Hosted upload can show acknowledged bytes
  with the shared Progress primitive; inspection after transfer is indeterminate.
- Keep announcements accessible, animations normal under every OS motion
  preference, controls/footers visible and the layout coherent at desktop and
  phone sizes. Do not add implementation/tutorial prose or provider counters.
- Verify actual queued/preparing/exporting/canceling/preview/analysis/opening
  states, truthful upload progress, responsive geometry and transitions to ready/
  failure/canceled. Use synthetic/network-blocked UI checks, appropriate focused
  tests, types/lint/format and a read-only validate pass.
- Preserve related work, saved clips/media, local mode and hosted YouTube denial.
  No paid/API/cloud test, deployment, configuration read/change or Git mutation.

All verification stays fake/paid-off and uses generated/source-controlled media.
Real Gemini needs the owner's keys/live approvals and a deliberate action; no
credit-consuming test is authorized by this visual request.

## Implementation and evidence — 2026-10-24

- `apps/frontend/src/shared/ui/processing-state.tsx` and its CSS module reuse
  BrandMark, glass/navy tokens and Progress. A rotating ring, floating mark and
  soft glow surround a larger centered stage title. No timer, estimated
  percentage, new dependency or motion-preference override was introduced.
- Clip batch and preview loading use the same treatment within the existing
  review slot. Queued/preparing/exporting/canceling clips still hide all editing
  controls and downloads, including when retaining earlier prepared data.
  Analysis/restoration replace the selection content while preserving inputs;
  cancellation stays in the footer. Connection/opening replace intake content.
- `hosted-upload.ts` reports acknowledged chunk bytes to the normal experience;
  only transfer shows a determinate bar. Inspection switches back to a spinner.
  Failed chunks never advance progress. Existing native/local uploads remain
  indeterminate. Inline image/action indicators and the existing local YouTube
  acquisition controls remain in their existing compact contexts.
- The narrow phone rail uses slightly smaller horizontal padding so “Exporting”
  remains readable without breaking inside the word. Footer geometry, normal
  editor controls and local/hosted capability boundaries are preserved.

Actual verification:

- **92 tests in 13 files pass**: frontend local-editing, shared workflow and
  default-start coverage. New checks prove no fabricated percentage for unknown
  work, measured visual/accessibility values, chunk acknowledgement timing and
  rejected-chunk behavior. The initial static restoration test was updated to
  reflect the new loading slot; post-load actions are exercised in the browser.
- Frontend typecheck, test TypeScript check, changed-source ESLint, Prettier and
  `git diff --check` pass. The earlier CL-061 full synthetic run remains recorded
  there; no unrelated broad suite was repeated for these frontend-only edits.
- Extended current-source `test/owner-hosted-editor.proof.ts` passes in **46.23
  seconds**: generated MP4 → hosted-shaped upload → manual moments → shared
  editor → caption edit → Apply → actual native re-export/download. Exactly one
  fake transcription/plan/image and inspect plus two native renders. Keyboard
  Add clips / Your clips navigation and retained time inputs pass.
- Actual mounted loading views captured at **1440×900, 390×844 and 320×568**:
  connection, upload, opening, moment restoration/analysis, queued, preparing,
  exporting, canceling and preview loading. Retained synthetic clip responses
  deliberately override lifecycle states to hold each review view; this proves
  UI/readiness behavior, not live provider progress or backend cancellation.
  Failure/canceled states return to footer Retry, and releasing preview loading
  restores editing. Centering, normal spinner animation, no unknown percentages,
  no horizontal overflow, footer visibility and title visibility are asserted.
  Desktop/phone screenshots were visually inspected; ignored evidence is
  `.local-build/evidence/cl062-*.png`. No real media is pictured.
- All checks use hardcoded fake/paid-off composition, no ignored env reads,
  fake Turnstile, Node network interception and a same-origin browser CSP.
  Browser/native scratch, temporary sessions and listeners close after the
  proof. No synthetic automation browser remains. Normal backend/frontend were
  preserved; non-metered health, `/start` and local capabilities return **200**.
  No worker restart was needed for this frontend-only packet.

Read-only validate: **Meets ticket — no actionable findings.** Covered: shared
design/integration, truthful progress, responsive/keyboard/input retention,
readiness/Retry/footer behavior, motion, cleanup and spend/privacy boundaries.
Reviewed the settled CL-062 source/test/doc changes, distinguishing related
CL-058–061 work from this packet. No new provider dispatch, schema duplication,
cross-app import, dead loading style or sensitive-content logging was introduced.
No paid/provider quality, real-media or cloud acceptance is claimed.

Deviations: none. Real Gemini quality/owner acceptance and CL-061 Linux image,
hosted resource and remote session/cloud acceptance remain unchecked release
items. New explicit approval is required for any credit-consuming test; deployment
is never authorized. No configuration, retained media or Git index/history was
changed. All related work remains unstaged and uncommitted.

## Owner follow-up — 2026-10-25

Removed the decorative orbit dot from the shared loader at the owner's request.
The ring, logo, glow and normal spinner animation remain unchanged.

- The existing shared workflow suite passes: **6 tests in 1 file**.
- A current-source synthetic connection preview passes at **1440×900, 390×844
  and 320×568**: no dot pseudo-element, normal spinner animation, visible title
  and no horizontal overflow. All three screenshots were visually inspected;
  ignored evidence is `.local-build/evidence/cl062-no-dot-*.png`.
- The preview holds connection locally without application/provider requests;
  fake/paid-off composition, network interception and a same-origin CSP remain
  active. Temporary browser, server and build scratch were cleaned up. The
  normal app remains running; no worker restart is needed for this CSS change.
- Read-only validate: **Meets ticket — no actionable findings** for the dot
  removal. The earlier deferred hosted-configuration document is unrelated and
  preserved. No provider quality, real-media or cloud acceptance is claimed.

This visual change works in fake mode without API keys. Real Gemini processing
still requires owner-managed keys, live flags and explicit owner testing; no
paid/provider call, configuration change, deployment or Git mutation occurred.

## Owner whole-file commit authorization — 2026-11-10

The owner explicitly authorizes staging and committing all fixes after clean
validation. The compact ring correction shares style.css with CL-272; preserve
that complete file in the combined local CL-271/CL-272/CL-062 commit. Its progress
proof and this packet are included in the complete
[50-path allocation](CL-272-shared-video-thumbnail-consistency.md#whole-file-commit-authorization-and-validation--2026-11-10).
Read-only review has no actionable findings; the existing six-size/Codex evidence
remains applicable and the settled shared workflow tests pass. Earlier no-Git
statements describe the preceding scope. No paid/provider run, push, deployment
or Voyagenda action is authorized or performed.

## Owner follow-up — spinner behind logo, 2026-11-10

Status: implemented and locally verified. The owner reports that Preparing moments now shows its
spinner obscured by the brand mark. Restore the established ring around the
logo without redesigning the loader or changing labels, stages, controls,
motion timing or provider behavior. The compact desktop rule currently permits
a 4rem visual around a 3.15rem logo; the SVG's painted circle is smaller than its
box, so its ring crosses the mark at short desktop heights.

Acceptance: the spinning ring clears the floating logo throughout its animation
at regular and short desktop, tablet and phone sizes; title/stages/footer remain
readable without horizontal overflow. Use the real shared component and compact
moment-selector styles in a generated/no-key browser check, inspect it in Codex,
run focused existing checks and record actual verification. Preserve all pending
CL-272 work, owner sessions/media/configuration and Voyagenda. No paid/provider
work, deployment or Git staging/commit is authorized by this visual correction.
The loader works with `FAKE_MODE=true` and no keys; real provider processing
retains its key/live-flag/approval requirements.

The compact desktop minimum now matches the shared loader's 6.5rem minimum
instead of shrinking to 4rem; the existing logo, ring, floating/spinning timing,
title, progress stages and footer actions remain intact. This is one CSS value
in `local-editing/style.css`, alongside preserved unstaged CL-272 changes.

Verification:

- Extended the existing `local-codex-progress.proof.ts` to mount the actual
  compact moment-selector classes/styles. The clearance check failed before
  the correction and passes afterward. It compares the SVG circle's inner
  painted radius against the entire logo diagonal plus its maximum floating
  offset, using untransformed dimensions so spinner rotation cannot skew it.
- Passed at 1440x900, 1342x586, 1024x600, 834x1194, 390x844 and 320x568:
  ring clearance, advancing animation, stage ticks/status, readable title,
  no horizontal overflow and visible footer. Unmount stops progress polling.
- Existing shared workflow tests: 6 passed. Test TypeScript, focused ESLint,
  Prettier and `git diff --check` pass.
- Codex browser inspection of the actual Workspace/WorkflowFrame/shared loader
  with fake progress confirms the ring around the mark at 1342x586 and 390x844.
  Screenshots are retained outside Git in the Codex visualization folder.
  The isolated browser tab, temporary viewport, server and owned scratch were
  closed/reset; the normal app/session and Voyagenda were preserved.
- Read-only validate of this follow-up's CSS/test/doc changes: meets ticket,
  no actionable findings. Existing CL-272 changes were excluded from this
  correction's claim. No dependencies, provider boundaries, backend/worker,
  configuration or saved media changed; no staging or commit occurred.

All proof progress is synthetic with fake/paid-off setup, not real processing.
No API/model key, paid run, provider call, cloud action or deployment occurred.
Owner personal visual acceptance remains manual. Deviations: none.
