# CL-133 — Media tab, sound effects and music

Status: implemented and locally validated; owner acceptance remains open.
Depends on CL-129, CL-130 and CL-131/132 committed at
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
   `test/local-audio.proof.ts`, `test/local-audio-editor.proof.ts` and affected old Pictures-label
   harnesses. Update owning READMEs, source of truth/index and this packet only
   for actual results. Use execute/validate until no actionable findings.

Before changing an additional implementation file, inspect its exact owning
integration and extend this allocation with the reason. No unrelated redesign.
No provider/cloud access or spend, deployment, push, retained media or ignored
configuration read/change. Do not mutate the owner's current clip while testing.
Normal worker rebuild/reload is authorized as necessary for local parity; preserve
frontend and saved media/configuration, and verify lifecycle ownership.

## Acceptance

- [x] Research/licensing and recommended original catalogue documented.
- [x] Media retains all picture behavior and adds manual effects/music/upload.
- [x] Preview/export timing, hook inheritance and hook-only stop agree; original
      video/audio quality and retained edits/outputs remain.
- [x] Bounds, ownership, cancellation, resources, cleanup and draft restore pass.
- [x] Synthetic/fake/no-key unit/browser/native proofs, types/lint/format and
      validate pass. Healthy normal app uses current contracts/worker.

## Evidence and validate disposition — 2026-10-29

Previous work is committed in `a597d41`, `085641b` and `54d208b`. The separate
four-file CL-133 plan commit is `c8729c9`; its sequencing deviation is recorded
above. The subsequent AFK instruction authorizes packaging all prior work before
Codex integration. Its whole-file plan was committed first as `85563c8`; audio
contracts/native/backend are `a4c50a1`, Media UI is `99bca8d`, and caption-level
follow-up is `91dc094`. This final documentation group closes the 48-file plan.

- Focused `scripts/local-test.config.ts` checks: six files, 65 tests passed:
  contract audio, original synthesis, draft store, clip batch, hosted workflow
  and frontend editor state. Frontend proxy regression: five tests passed.
- `test/local-audio.proof.ts`: one current-source native proof passed, using
  synthetic MP3/WAV/M4A normalization and a real MP4. Frequency measurements
  confirm speech and whole-video music, Hook-only stop, repeated timed Ding,
  bounded peaks and unchanged source-height/30-fps video; missing assets and
  video masquerading as audio fail without a final output.
- `test/local-audio-editor.proof.ts`: final browser proof passed (41.68 s run),
  real authenticated host/native-worker API, no provider/network mocks in place
  of the audio execution path. Checks explicit audition without dirtying, twelve
  simultaneous identical cues and Discard, cancellation, malformed upload then
  retry, Apply, pause/mute/unmute, source seek with continuous music loop phase,
  MP4 export and reload. Exactly three normalization attempts (cancel/bad/good),
  zero image-generation and moment-selection calls. A 23-frame Hook produces the
  expected 113-frame presentation. The existing focus-editor browser proof also
  passed alongside the earlier audio proof.
- Synthetic screenshots inspected for Sound library / Your audio at 1440, 834,
  390 and 320 px; responsive footer and no horizontal overflow checked. Evidence
  stays under ignored `.local-build/evidence/cl133-*`; no owner media captured.
- Contracts without ambient Node types, local code, frontend and repository-test
  TypeScript checks passed. Scoped ESLint, Prettier and `git diff --check` passed.
  No broad production build, live processing or hosted acceptance was run.
- Validation found/fixed insufficient Player audio tags, pooled identical cues
  and source-URL churn while adding cues. Final browser recheck includes twelve
  concurrent instances, stable resources and actual pause/mute/seek. An initial
  mute assertion also counted inactive silent Player tags; corrected to inspect
  the admitted/generated tracks. Final scoped read-only validate: **Meets ticket;
  no actionable findings** across current diff and new files. Legacy optional
  contracts, admitted bindings, resource/route boundaries and cleanup inspected.
- Built current contracts and native worker/overlay. Verified shutdown of all
  ten old backend-tree identities and release of 4000/4200 before restarting
  normally. New backend/worker own 4000/4200; frontend listener remained intact.
  Health, `/start` and `/api/sample/config` returned 200. Content-free identities
  and separate stdout/stderr logs remain in private OS-temp runtime records.

No changes were needed in the generic worker transport or frontend workflow
bridge: both consume the extended shared contracts/allowlist. Owning app READMEs
and `docs/operations/LOCAL_WORKFLOW.md` document the new controls. The standalone
synthetic fixture emits pre-existing restrictive-CSP warnings for Player dummy
audio/inline styles; actual frontend policy already permits its media sources.
Those warnings did not substitute for the successful real playback assertions.

Fake mode needs no keys for these manual features or local encoding; new live
AI generation requires provider keys, live flags/approvals and owner action.
Physical-device/listening/visual/real-media/rights/hosted/release acceptance stays
unchecked. Local implementation commits are authorized by the later AFK request;
no push or deployment is included.
