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
