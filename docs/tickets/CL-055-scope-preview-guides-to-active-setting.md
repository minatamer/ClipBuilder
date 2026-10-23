# CL-055 — Scope preview guides to the active setting

Status: implemented and validated. Dependency: validated CL-054, still unstaged.

Owner request — 2026-10-23: leaving Captions hides caption selection borders;
leaving Pictures hides picture selection borders. Authority: source of truth,
**Focused local clip editing — 2026-10-23**.

Scope and acceptance:

- Preview drag targets, selection outlines and resize handles exist only for
  the active settings category: captions in Captions, pictures in Pictures,
  neither in Filters. Inactive targets cannot intercept pointer or keyboard use.
- Keep actual captions/pictures, clip edits, preview media/playhead and initial
  readiness behavior intact. Switching a settings tab never applies, exports,
  calls AI or remounts the video.
- Extend the existing fake browser checks for all three categories and unchanged
  preview identity, retaining the existing drag and dirty-edit checks. Run the
  affected types/lint/format and synthetic batch/browser proof, then validate.
- Preserve the completed uncommitted CL-054 work. No new Git action, restart,
  deployment, paid/provider/cloud or real YouTube request.

These preview controls work with fake AI and no API keys; synthetic captions and
images do not prove live AI quality. Real AI needs its configured provider keys,
enabled live flags and applicable approvals; it remains owner-only/unverified.
No new local AI runtime or weights.

Settled evidence — 2026-10-23:

- `Review` receives the active setting through existing Player input props.
  Only that category's SelectionBox components mount; the shared caption/image
  composition remains unchanged. Filters has no guide buttons or resize handles.
- The existing browser tab helper now checks caption-guide presence only in
  Captions, absence of picture guides elsewhere, no guide/resize buttons in
  Filters, one visible inspector, and identical video element across tab changes.
  Existing caption/picture edits, mouse/touch drag, dirty guards, readiness,
  preview failure/retry, responsive layouts and native exports still pass.
- Through the pinned fake/paid-off guarded runner:
  `exec tsc --noEmit -p apps/frontend/tsconfig.json`, scoped ESLint on
  `clip-editor.tsx`/`owner-controls-browser.ts`, and Prettier on the changed
  sources/documentation pass. `exec vitest run --silent --config
  scripts/local-proof.config.ts test/owner-batch.proof.ts` passes in **132.23s**,
  including actual MP4 export/download/full decode and retained state reopen.
  Exact fake counts remain **5 transcription / 4 selection / 5 plan / 5 image**;
  native peak **1**, owned survivors **0**, completed cleanup. No new job or AI
  dispatch is introduced by switching tabs. No broad unit suite/build was needed.

Read-only validate on this CL-055 addition over the completed CL-054 worktree:
**Meets ticket; no actionable findings**. Covered: active-category guides and
inactive input removal, retained media/edits, video identity, readiness and
drag/navigation regressions, existing boundaries and owned cleanup. Reviewed
the implementation, browser assertions and owning docs against the acceptance
above; no requirements weakened or shared render/export behavior changed.

Changed: local `clip-editor.tsx`, the existing browser proof helper, local README,
source of truth, ticket/index. CL-054's other pending changes are preserved and
excluded from this addition's implementation claim. Owner real-media/physical
device/live-AI acceptance remains unverified in CL-025. No restart, secret/env
read, paid/cloud/real YouTube request or Git mutation. Deviations: none.
