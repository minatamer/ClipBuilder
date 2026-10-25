# CL-077 — Capture picture timing from the preview

Status: implemented and locally validated; owner personal visual acceptance is
manual. Owner request: 2026-10-25.

Dependency: existing shared picture editor and CL-069/071 settled-frame capture
and isolated playback controls are implemented in the current worktree.

Add a shared-design Capture button beside each picture Start/End seconds field.
Read and pause the current settled preview frame without seeking it. Start uses
that frame; exclusive End uses the following frame, including the displayed
frame. Change only the selected picture's endpoint. Preserve typed editing,
Apply/Discard, persistence and the existing native export path.

Reject a reversed/empty interval with a concise actionable error and preserve
the previous endpoint. Loading, seeking, failed and busy previews cannot capture.
Reuse the camera's media-readiness rules; playback ticks stay in a child so they
cannot repeatedly rebuild the main Player input props (CL-071).

Scope: frontend picture controls/shared preview capture, focused browser/native
proof updates, feature guide, source-of-truth clarification and this ticket/index.
No schema, renderer, AI, environment, service lifecycle or Git mutation. No paid
calls or owner media. Fake mode/no keys supports these controls and local exports;
live AI quality and owner personal visual acceptance remain manual.

Verify exact captured values, exclusive end/clip boundary, invalid order,
unavailable preview, selected-picture isolation, saved/exported timing, responsive
44px controls/footer at desktop/390/320, and listener/process cleanup using the
existing synthetic controls/native proof. Run affected type/lint/format checks
and a read-only validation pass. Record only actual evidence below.

## Evidence — 2026-10-25

- `picture-timing.tsx` owns the two fields/buttons and invalid-order feedback;
  `clip-editor.tsx` supplies the selected cue and existing save path. Extracted
  the existing camera preview clock/readiness into `use-editor-preview.ts`, used
  by both picture timing and `focus-preview-controls.tsx`. No per-frame state
  updates were added to the parent Player. Shared Button/Clock3 and existing
  range-time styling match Camera; `style.css` stacks them on narrow screens.
- `test/owner-hosted-editor.proof.ts` passes (40.37s): actual preview scrubber
  pointer events, exact capture at 0/final frame, one-frame interval, [6,24)
  capture, reversed boundaries preserving values, two-picture isolation,
  seeking/buffering disablement, failed preview/retry preserving timing and
  busy save guards. Saved edit acknowledges frames 6/24; native MP4 decoded at
  frames 5/6/23/24 proves the picture appears at 6 and disappears at 24.
- Responsive 1440×900, 390×844 and 320×568 screenshots were inspected under
  ignored `.local-build/evidence/cl077-timing-*`: 44px targets, no horizontal
  overflow and reachable persistent Apply/Discard footer. Existing hosted
  loading/readiness states still pass. Fake transcription/plan/image remain
  exactly 1/1/1; native operations remain inspect/clip/clip. No provider spend.
- `test/local-focus-editor.proof.ts` passes with the shared hook, including
  exact camera Capture, gestures, save/retry/reopen and zero decoded playback
  rewinds at desktop/390/320. The initial combined run passed this proof; its
  picture-proof failure was test seek synchronization. The picture proof now
  drives the actual preview scrubber. No production workaround was introduced.
- Frontend/proof TypeScript, affected ESLint, Prettier and `git diff --check`
  pass. All proofs force fake/paid-off and block external network; owned browser,
  worker, server and scratch are cleaned. Owner media/config/session untouched.

Final read-only validation: **Meets ticket; no actionable findings**. Covered
endpoint semantics, current-selection binding, invalid/unavailable guards,
Apply/Discard/export integration, responsiveness, playback isolation, listener
cleanup, dependency direction and privacy/spend. No product-scope deviation.
No service restart was needed. Live AI quality/provider readiness and owner
personal visual/real-media acceptance remain unverified; Capture itself needs
no API keys. Nothing staged, committed, pushed or deployed.
