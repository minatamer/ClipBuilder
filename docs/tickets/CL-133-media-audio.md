# CL-133 — Media tab, sound effects and music

Status: executing. Depends on CL-129, CL-130 and CL-131/132 committed at
`54d208b`. Owner explicitly requests plan/document, execute and validate,
with current work committed first. Follow [the complete design and research](../architecture/MEDIA_AUDIO.md).

Sequencing record: CL-131/132 was committed before this packet. This plan was
written before implementation, but its separate commit was missed at that point
and is being corrected during execution. Do not rewrite history or claim the
plan commit preceded coding. Implementation changes remain separate.

## Ordered execution and file allocation

1. Browser-safe audio catalogue/metadata/cues and projection under
   `packages/contracts/local/audio.ts`; extend `editor.ts`, `clips.ts`,
   `edit-overlay.ts`, `index.ts` and `diagnostics.ts`. Preserve optional legacy
   fields and all current clip/source/quality bounds. Add focused audio tests.
   `hosted-editing.ts` also owns the shared transport allowlist for audio routes.
2. Pure original waveform/WAV generation under
   `packages/composition/local/audio-synthesis.ts`; Player audio layer under
   `apps/frontend/src/features/local-editing/audio-preview.tsx`. Native normalize/
   mix under `apps/renderer/local/audio-media.ts` and `audio-mix.ts`, integrated
   through `media.ts`, `server.ts` and `clip-render.ts`. Fixed paths and tools.
3. Private admission/upload/playback via `apps/backend/local/clip-batch.ts`,
   `server.ts`, `workspace-files.ts`, `worker-port.ts`, `edit-clip.ts`,
   `draft-store.ts`, `agent-view.ts` and immediate owning draft/diagnostic helpers
   where the audio field must be bound. Update the existing authenticated bridge
   `apps/frontend/src/server/local-workflow.ts` for the narrowly admitted routes.
   `apps/frontend/src/proxy.ts` excludes the bounded streamed audio upload from
   document-body cloning, matching the existing picked-video carveout.
4. `clip-editor.tsx`, `editor-state.ts`, new `audio-inspector.tsx` and local
   `style.css`: Media/Pictures/Audio UI, uploads, catalogue previews, placements,
   timing/capture, gain/loop, dirty/save/export and inactive gesture isolation.
5. Focused existing/new contract/backend/draft/unit tests, synthetic
   `test/local-audio.proof.ts`, browser proof and affected old Pictures-label
   harnesses. Update owning READMEs, source of truth/index and this packet only
   for actual results. Use execute/validate until no actionable findings.

Before changing an additional implementation file, inspect its exact owning
integration and extend this allocation with the reason. No unrelated redesign.
No provider/cloud access or spend, deployment, push, retained media or ignored
configuration read/change. Do not mutate the owner's current clip while testing.
Normal worker rebuild/reload is authorized as necessary for local parity; preserve
frontend and saved media/configuration, and verify lifecycle ownership.

## Acceptance

- [ ] Research/licensing and recommended original catalogue documented.
- [ ] Media retains all picture behavior and adds manual effects/music/upload.
- [ ] Preview/export timing, hook inheritance and hook-only stop agree; original
      video/audio quality and retained edits/outputs remain.
- [ ] Bounds, ownership, cancellation, resources, cleanup and draft restore pass.
- [ ] Synthetic/fake/no-key unit/browser/native proofs, types/lint/format and
      validate pass. Healthy normal app uses current contracts/worker.

Fake mode needs no keys for these manual features or local encoding; new live
AI generation requires provider keys, live flags/approvals and owner action.
Physical-device/listening/visual/real-media/rights/hosted/release acceptance stays
unchecked. New implementation remains uncommitted pending separate authorization.
