# CL-028 — Apply the demo design to local controls

Status: implemented and verified locally; owner visual acceptance remains open.
Dependency: implemented CL-027. Owner instruction 2026-10-23.

The owner rejects the utilitarian local interface and asks for the existing demo
design principles throughout the local flow. Intake must offer two clear choices:
upload or YouTube link, side by side on desktop and stacked on phones. Upload
includes a local-only **Use demo sample** secondary CTA that fits the design.

## Acceptance

- Reuse the existing workflow shell, navy glass materials, shared Button,
  typography, focus treatment and responsive spacing. Distinguish primary,
  secondary and destructive actions; remove competing all-primary styling.
- Present upload/YouTube as the two main intake choices. Hide the native file
  chooser behind the designed upload action; preserve keyboard and drag/drop use.
  Keep saved sources/drafts secondary and collapsed, and reveal quality/import
  choices progressively without altering source reuse or deliberate requests.
- Carry the same controls, reading surfaces, action hierarchy and source-preview
  layout through manual/AI moment settings, clip review and caption/picture/video
  controls. Keep existing capabilities, validations, state and all functionality.
- Verify desktop/phone intake and synthetic editing states, keyboard/reachable
  actions, no horizontal overflow and readable disabled/error/selected states.
  Run frontend/unit/type/boundary checks and production compilation, then a
  read-only validate pass. Record actual evidence and remaining manual gates.

This is presentation work in the same app. Fake AI remains fictional and key-free;
real local downloading/native processing remain independent. Real Gemini still
needs existing keys, enabled flags and owner approvals. No offline AI weights,
real YouTube/provider/cloud calls, environment-file reads/edits or deployment are
authorized. Preserve the running apps, other repositories and all saved media.
No Git action is requested for this ticket.

## Implementation and evidence — 2026-10-23

Intake now uses two equal glass cards: upload with the shared primary Choose a
video button and secondary Use demo sample link, and YouTube with a labeled URL
field and progressive quality/download actions. Cards stack on phones. The native
file chooser is visually hidden behind the upload action; drag/drop uses the same
guarded upload path. Saved videos and drafts are collapsed secondary disclosures.

All local panels use the existing shared Button and workflow materials. Source
preview and moment settings share a responsive layout; numerical layer geometry
is under Position and size. Fresh moment selection stays at Step 2; an existing
clip collection advances to Step 3, including reopened drafts. Primary actions,
secondary actions, destructive labels, selected layers, notices, fields and focus
treatment use the established palette. No provider/media/storage use case changed.

Checks actually produced:

- Frontend suite: **482 tests in 56 files**, using the pinned private test runner
  with fake/paid-off settings, no credentials and blocked ignored-env reads.
- Boundary suite: **27 tests**. Process-ownership regressions: **2 tests**.
- Frontend typecheck and root test typecheck pass. Focused ESLint, Prettier and
  `git diff --check` pass. Root backend/renderer suites were not rerun for this UI
  correction; relevant native integration is covered below.
- Final browser/native invocation: **2 proofs passed in 98.37 seconds**. Intake
  verifies 1440×900, 1024×768, 768×1024, 390×844 and 320×568: expected column/stack
  behavior, no root/content horizontal overflow, 44px action targets, 3px focus,
  secondary sample CTA, hidden native picker, disabled empty-link continuation,
  visible fake-AI label and collapsed libraries. No mutating/API-processing call
  occurs during that empty-intake proof.
- The existing synthetic native batch proof still produces three independent
  clips, re-exports and cancels through the same coordinator with exact fake call
  counts. Its actual browser changes caption size/font/animation and video look,
  verifies Step 3, and checks editor fit at 1440/390/320 pixels. Final process
  checks retain **zero survivors**.
- One intermediate native invocation completed the functional assertions but
  failed cleanup accounting: reused parent PIDs caused the sampler to classify
  older Windows processes as test descendants. Those processes were inspected
  and left untouched. The sampler now requires a child creation time at or after
  its parent's, with regressions for older unrelated trees and valid same-clock
  descendants. The final proof above passes without relaxing zero survivors.
- Production compilation passes in a closed OS-temp copy using normal Turbopack,
  existing dependency links and compiled shared packages. Next TypeScript,
  optimization and all eleven app routes compile. Two earlier isolated-copy
  attempts failed because its package links/compiled prerequisites were missing;
  they are not passing build evidence. Standalone packaging was omitted only in
  the private copy so the running dev build remained untouched. No image/cloud
  build, deployment, full root build or Linux artifact acceptance is claimed.
- Ignored synthetic captures are in `.local-build/evidence/cl028-intake-*.png`
  and `cl028-editor-*.png`, with intake geometry in `cl028-layout.json`. Desktop
  and phone intake/editor captures were inspected. These contain synthetic data.
- The running normal app returns 200 for `/start`, backend health and local
  capabilities. Capabilities retain synthetic AI, real source acquisition and
  cloud false. The other app, saved media and environment files are untouched.

## Validate — final read-only pass

Scope: combined unstaged CL-028 frontend changes, verification helpers, new proof
and regression, and owning documentation; staged diff empty. No unrelated changes,
delegation, Git action or live calls. Acceptance was checked against the unchanged
owner-directed criteria above and CL-013's existing material/interaction direction.

Verdict: **Meets ticket — No actionable findings**. Intake/CTA hierarchy, shared
materials through editing, capability/validation preservation, responsive fit,
keyboard targets/focus and synthetic integration are covered. The PID-ownership
correction and final passing cleanup were inspected. Only documentation evidence
was updated after this settled review.

Owner aesthetic acceptance, physical-device/screen-reader and real-media
readability/A/V acceptance remain unverified. No actual YouTube download, Gemini
request, paid flow or offline-model installation was run. Real AI still requires
the normal provider keys/flags/approvals; CL-025 retains manual acceptance.
