# CL-208 — Default Motion End to the current camera position

Status: Locally implemented and verified, 2026-11-03. Final validate: no
actionable findings. Owner visual/device and hosted release acceptance open.

## Owner request and scope

New manual Motion currently ends five seconds after Add at playhead. Default End
to the current camera position's end instead. Preserve the captured start, head
seed, Capture/manual endpoint editing and existing saved paths. Body and Hook
clocks must map the camera's source-frame boundary exactly once. The existing
thirty-second per-pass resource bound and minimum six-frame interval remain; do
not extend into another camera position or beyond the occurrence. This corrects
the default only, not a migration of existing drafts or paths.

Dependencies: CL-203 manual Motion, CL-206 numbered camera context, CL-207
endpoint Capture. These are locally verified in the current unstaged worktree.
Preserve that work and normal app configuration/media. No real AI, providers,
downloads, cloud, deployment or Git mutation. Frontend only; no worker reload.

## Acceptance and allocation

- In `head-motion-editor.tsx`, replace the five-second default with the active
  camera shot's End mapped into the selected occurrence. Clamp to the Hook/body
  end and existing thirty-second pass bound. Start remains the captured frame.
- Do not merge adjacent camera positions even when they have the same person. A
  start inside an interval uses that interval's end; a start exactly at a cut
  uses the next interval. Preserve the existing minimum duration rejection.
- Update the owning product and feature documentation. Retain shared Capture,
  explicit Track head/Cancel, Apply/Discard and footer behavior.
- Extend the existing synthetic editor proof to assert default body/camera-cut
  and Hook endpoints, including occurrence clamping. Exercise desktop and phone
  controls with no new provider/tracking/render calls. Run scoped types, lint,
  formatting and read-only validation until no actionable findings.

## Evidence and remaining gates

- `head-motion-editor.tsx` now derives End from `ownerFocusAt`'s current camera
  shot instead of adding five seconds. Hook source offset is removed once, and
  the existing occurrence/thirty-second bounds and six-frame minimum remain. No
  schema, native worker, backend, processing or saved-path changes.
- `test/local-camera-motion-editor.proof.ts` passed (60.12 seconds), using real
  encoded synthetic media and actual editor controls. Six boundary scenarios at
  each of 1440×900, 390×844 and 320×568 check interior/cut starts, distinct
  same-person positions, final body boundary, source-offset Hook boundary and
  Hook occurrence clamping. A five-frame remainder rejects instead of extending
  into the next camera/occurrence. Start is unchanged, End Capture remains
  available and Track head stays disabled without a marked seed.
- Existing Zoom/Motion Capture, invalid order/overlap/clock, keyboard, pointer,
  Apply/Discard/reopen and footer/overflow assertions remain passing. Exactly
  six fake edit saves, with no added saves, tracking, plan/image/render calls
  from the default checks.
- Frontend/test TypeScript and scoped ESLint passed. Scoped code/new-packet
  Prettier and `git diff --check` passed. Shared Markdown retains its existing
  manually wrapped format; no unrelated broad formatting changes.
- Final read-only validation: meets ticket, no actionable findings. Reviewed the
  default expression, existing End guards/editor integration, browser assertions
  and owning documentation against this packet. CL-197–207 pre-existing work is
  preserved and excluded from the claim. No deviation; nothing staged or
  committed.

New Motion defaults are corrected; an already open or manually edited draft is
preserved. This default and local pixel Motion work with prepared fake/synthetic
media and no API keys or AI model. New real clip preparation keeps existing
provider/runtime/live approvals. Owner real-media visual/device and hosted
release acceptance remain separate; no owner-media processing or live inference
was run. The normal app/worker and saved media were not restarted or mutated.
