# CL-159 — immediate visuals and varied imagery

Status: implemented and locally validated, real editorial acceptance open.
Plan filed before implementation. Depends on CL-151/154/156; their local
implementation is present. Preserve all pending CL-152–158 changes and local
recovery/saved media. Owner request, 2026-10-30: new manual and AI pictures use
Entrance None / Exit Fade. Visuals should be lively/contextual, not locked to
the repeated white flowchart/icon-card design.

## Diagnosis and decision

Codex currently must return a concept/process/comparison diagram with one of nine
fixed icons. The local renderer gives every result the same white rounded card,
palette and typography. This is an implementation limitation, not just a choice
prompted by technical conversation. Gemini's separate image generator can create
general scenes already. The subscription CLI does not generate bitmap art itself.

Replace new Codex diagram plans with contextual image briefs and real public
image retrieval through the existing bounded Commons source. No Gemini fallback
or new provider API key. Retain old illustration rendering only for partial/saved
legacy plans, preserving those assets. Never substitute a forced diagram when
lookup fails; a missing optional image cannot fail the usable clip or retry AI.
New prompts encourage different relevant subjects, scenes and playful visual
metaphors without a mandatory technical design/template. Existing image budgets,
five-second timing/two-second gaps, face-safe placement and export quality remain.

Public lookup happens only in normal real Codex processing after existing
master/provider gates. Only a bounded generic image brief reaches the existing
allowlisted source; no video/audio/transcript/account/auth data or arbitrary
model URLs. Agent validation uses injected lookup/AI and synthetic media only,
fake/paid-off/network-blocked with no keys. No real download/inference test,
configuration, cloud, deployment or Git action.

## Whole-file allocation and execution

1. `packages/contracts/local/assets.ts`: one shared initial visual-motion
   constant (none/fade/nine frames) and truthful retrieved-asset provenance.
   `apps/frontend/src/features/local-editing/clip-editor.tsx` and backend
   `clip-batch.ts` use it for new manual/AI assets; old/manual motion stays intact.
2. `packages/contracts/local/codex.ts` and `.test.ts`: new Codex wire pictures
   request only contextual briefs, not the mandatory fixed illustration grammar.
   Keep the legacy illustration schema/partial-plan decoder for old saved work.
3. `apps/backend/local/codex-ai.ts`, `codex-composition.ts` and their tests:
   inject/reuse Commons lookup, normalize/verify admitted bounded image bytes,
   mark retrieved provenance and preserve Gemini isolation, cancellation and
   zero retry. Legacy illustration cue rendering stays available only on resume.
4. `apps/backend/local/planned-visuals.ts`, `provider-ai.test.ts` and
   `codex-ai.test.ts`: one shared varied-art direction for both planners; no
   mandatory diagrams, fixed palette/layout or filler. Gemini retains normal
   generation and existing prerequisites/cost bounds.
5. `clip-batch.test.ts`, existing `codex-visual.test.ts`, relevant contract and
   Commons-source tests, and `test/local-codex.proof.ts`: new provenance/default
   motion, mocked real-image lookup, missing/invalid/canceled lookup, old saved
   compatibility, native/preview/export/restore and exact call counts. No real
   provider/search calls. Reuse current-source synthetic overlay/artifact setup.
   `test/owner-content-fixture.ts` supplies a clearly synthetic retrieved-image
   fixture shared by adapter/native tests; it is never imported by runtime code.
6. This packet, index, source of truth and `docs/architecture/LOCAL_CODEX_AI.md`:
   accurate explanation of real-image retrieval versus model image generation,
   new defaults, fake checks and outstanding real editorial quality.

Read the pinned Next client guide before frontend edits. Validate focused fake
checks, relevant types/lint/format and read-only review; refresh current native
artifacts/backend through verified ownership when local contracts change. Local
automatic recovery (CL-158) is already authorized; do not ask to save again.

## Acceptance

- Fresh manual and AI visuals enter immediately and fade out. Existing saved
  motion and user choices remain authoritative.
- New Codex pictures can be actual photos/illustrations found from contextual
  briefs, with no mandatory generated diagram or hidden Gemini request. No match
  leaves optional art absent, without failing/retrying a clip. Legacy saved
  diagrams still render during explicit retry without new model work.
- Both planners request varied relevant visual ideas; no new image/API budget,
  quality/limit reduction, arbitrary URL/executable input or private-content leak.
- Fake/no-key synthetic tests prove mechanics and isolation. Actual search hit
  rate, visual/editorial taste, owner device/listening/rights and hosted release
  remain unverified; Gemini needs its existing keys/live approvals, real Codex
  needs saved ChatGPT login/local speech assets and normal master settings.

## Evidence

- Six focused fake suites: 85 cases pass; mocked Commons admission/source
  checks: 23 pass; isolated installed-CLI protocol/wire proof: two pass with no
  saved credentials or provider request. Missing/failing lookup, digest mismatch,
  cancellation, legacy plans, retrieved provenance and exact image calls covered.
- Current-source synthetic browser/native/export/save/restart-recovery proof
  passes (79.73 seconds), including the image at its first frame, manual motion
  controls, face clearance and no extra inference on restore. Exact fake counts:
  four inference calls (including deliberate login failure), two speech/two
  diarization calls, eight media jobs, one injected picture lookup. An initial
  added UI assertion read before React rendered Motion; fixed the test wait.
- Local/root-test TypeScript and scoped ESLint pass. Inspected synthetic desktop
  1440 and phone 320 screenshots; proof also checks 390 and all footer geometry.
  Artifacts are ignored `.local-build/evidence/cl159-*` and contain synthetic
  data only. No real search, download, inference, media or keys used.
- Read-only validate of this ticket's changed execution path: meets local
  acceptance, no actionable findings. Legacy plans/assets and provider isolation
  preserved. Earlier pending CL-152–158 work is outside this verdict.
- Current backend/native-artifact refresh is recorded with CL-160 after the UI
  follow-up. Owner search hit rate/taste, real voice/face/AI quality, devices,
  rights and hosted release remain unchecked. Fake tests do not prove these.
  Nothing staged or committed; no deployment or configuration edits.
