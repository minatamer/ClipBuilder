# CL-078 — Empty captions, explicit clip transcription and word correction

Status: implemented and locally validated; owner real API quality/spend and
personal visual acceptance remain manual. Owner request: 2026-10-25.
Dependencies: shared completed-clip editor/export, CL-060 acceptance policy,
CL-070 native quality, CL-071 isolated playback, CL-077 Capture are present in
the current worktree. Preserve all earlier pending work; no Git mutation.

## Owner decisions

- New fake clips have no caption overlay by default. A named hardcoded boolean
  in backend fake-content policy defaults false; no environment flag or edit.
  Fictional analysis words may still support fake moment/focus tests.
- Permanently remove automatic Earth-picture planning/generation from the fake
  adapter. Owner-uploaded pictures and real-mode picture generation remain.
  Preserve already saved media/edits; do not rewrite existing owner projects.
- Empty Captions shows a concise empty state and Generate captions. The explicit
  action transcribes only this clip's audio; no moment search, visual plan, image
  generation or automatic provider retry. Existing completed work is retained.
- This owner-authorized local action is an exception to FAKE_MODE and
  PAID_DEMO_ENABLED for caption transcription only. Existing parsed Gemini key
  is still required. Show paid-credit/audio-transfer meaning before confirmation;
  require action-scoped consent in the protected request. Never mutate global
  flags/configuration. No production/test bypass: hosted keeps normal paid gates,
  authentication/session/spend limits; tests cannot construct a real transport.
- Caption Text joins Style/Position. Edit individual word text with the original
  word IDs and timestamps fixed; no timestamp, add/delete-word or timeline editor.
  Readable phrase grouping, keyboard controls and preview seeking; existing
  Apply/Discard persists corrections and native export uses the same compiled text.
- Follow-up owner revision: add Generate fake captions beside Generate captions
  locally, including without keys. This explicit action inserts the former
  fictional dialogue for editor testing, never calls a provider, and consumes no
  paid attempt budget. Hosted routes/UI must exclude this action. Default stays off.

## Implementation slices (one packet)

1. Fake content policy and adapter: caption default-off boolean, no fake image
   plan; explicit synthetic fixtures supply any captions/pictures tests need.
2. Browser-safe contracts: bounded text-only word overrides and transcription
   request/capability; backwards-compatible documents. Compile corrected group
   text/lines/word highlights without changing clocks, IDs, focus or visuals.
3. Clip transcription use case: protected selected-clip/revision binding,
   serialized/bounded explicit attempts, acknowledged revision/autosave and old
   exports retained. Worker makes a bounded audio-only proxy for the selected cut;
   reuse Gemini transcription/cleanup and transcript normalization. The local
   exception exposes only this port; ordinary analysis and cloud/image gates stay.
4. UI: no invisible caption selection box for empty captions. Empty state and
   in-place paid confirmation, persistent footer owns Generate/Cancel; normal
   export remains available outside confirmation. Busy/failure/retry states keep
   current clip and edits, disable conflicting actions. Text word controls keep
   playback ticks out of the parent Player and preserve fixed timing.
5. Owning source of truth/AGENTS/provider/frontend guides and ticket/index record
   the narrow exception and exact fake/live capability boundaries. No env reads,
   modifications, deployment, provider calls, real media fixtures or commits.

## Verification and handoff

- Unit/contract/provider tests: fake default + optional caption switch, no Earth
  calls, text override ID/length/duplicate/timestamp rejection, unchanged clocks,
  stale/repeated requests, bounded attempts, zero dispatch on invalid/unavailable
  requests, local-only exception and hosted paid budget charging.
- Synthetic browser/native checks: empty/confirm/cancel/busy/failure, keyboard
  word editing and Apply/Discard/reopen, actual exported corrected text, exact
  clip audio duration/no outside-cut samples, responsive desktop/390/320, stable
  playback, listener/process/proxy/remote-media cleanup and exact fake call counts.
- Run focused checks during edits, final affected type/lint/format/boundary checks,
  read-only validate/fix until no actionable findings. Rebuild current contracts,
  worker/overlay and verified reload of the normal backend after worker changes.
  Do not reset the owner's active workspace just to run a test.
- Fake mode/no keys supports empty clips, manual pictures and existing text
  editing. Real caption generation needs the configured Gemini key and explicit
  paid action; owner-only real API quality/credit use and personal visual acceptance
  remain unverified. Automated checks never exercise that paid action live.

## Delivered and verified — 2026-10-25

Implementation follows the five slices above. New modules are backend
`fake-content.ts`, `clip-caption-port.ts`, `caption-provider-composition.ts`,
contracts `caption-generation.ts` / `caption-text.ts`, and frontend
`caption-text-editor.tsx`. Existing batch/server/provider/runtime, fixed audio
worker input, shared edit compiler, editor state/UI and owning guides integrate
them. Existing documents remain valid through optional fields; existing saved
captions/pictures/exports are preserved. Explicit legacy content for older
regression tests lives in `test/owner-content-fixture.ts`, never app composition.

- Full synthetic local suite: **57 files / 562 tests pass**. A final targeted
  batch run (**19 tests**) verifies the completed active-state correction and
  serialized reopen with corrected text. Tests cover off/on fake policy through
  explicit fixture opt-in, no automatic image call, consent, stale/duplicate IDs,
  failure receipt replay, three explicit paid attempts, fake generation with no
  paid-attempt charge, unknown/duplicate words, empty/oversized text and rejection
  of timestamp fields. Injected composition proves no global configuration
  mutation or other provider port; test/hosted/missing-key guards remain.
- `test/owner-provider.proof.ts`: **both native proofs pass**, including selected
  audio-only cut 61–92 at the editor's 30fps clock (1033ms), exact bounded digest
  receipt, only the selected 1000Hz tone rather than earlier 500Hz source audio,
  no video stream, original-source integrity and partial/cancellation cleanup.
  Existing full-audio/video proxy checks remain. Provider adapter tests verify
  exactly one upload/transcription/delete and local proxy cleanup, with zero
  plan/candidate/image dispatches for caption generation.
- `test/owner-hosted-editor.proof.ts`: final **54.82s pass** against current-source
  overlay/worker and generated media. New clips start without caption selection
  guides or pictures. Paid explanation/confirm/Cancel, an injected first failure
  and explicit retry, Text correction/Discard/Apply, selected-picture isolation,
  saved timing and actual MP4 export all pass. Final native overlay contains the
  corrected word and exactly the accepted pre-correction clocks. Picture boundary
  decoding at 5/6/23/24 still passes with motion explicitly off. Counts remain
  analysis/plan/image/caption = **1/1/0/2**, native inspect/clip/clip; no extra
  provider work for editing or export. Hosted exposes no fake-caption action.
- `test/local-focus-editor.proof.ts`: **45.28s pass**, including both local empty
  actions at desktop/390/320, fake action without a key/paid confirmation,
  independent camera controls/gestures/save/reopen and zero decoded playback
  rewinds. All original 25 edit acknowledgements and plan/image/render = 0/0/0
  remain. Text editing adds no playback listener: no per-frame word input updates.
- Inspected ignored `.local-build/evidence/cl078-{empty,confirm,text}-*` and
  `cl078-fake-empty-*` screenshots at desktop/390/320: wrapping controls, 44px
  targets, no horizontal overflow, visible footer and focused confirmation.
  Source preview and word fields use the existing design system.
- Contracts/browser-without-Node, local/backend/frontend/proof TypeScript,
  affected ESLint (no remaining warnings), Prettier and `git diff --check` pass.
  New listeners/timers/processes/private proxies and synthetic scratch are
  cleaned by existing owned teardown. No real owner media or env contents read.
- Pinned Node/Corepack contract build and current worker/overlay build pass.
  Verified backend-only stop/restart preserves frontend PID 24236 on 3000;
  backend supervisor 7496 owns API 1768 on 4000 and worker 22620 on 4200. Health,
  `/start` and sample config return 200; content-free capability says synthetic-ai,
  local media and caption generation available. No normal-app processing POST.
  Content-safe logs are outside Git:
  `C:/Users/minat/AppData/Local/Temp/clipbuilder-cl068-runtime/backend-20261025-223811.stdout.log`
  and matching `.stderr.log`; runtime identity record is adjacent `runtime.json`.

Final read-only validation: **Meets ticket; no actionable findings**. Checked
local-only fake routing, normal hosted budgets/authentication, action-scoped paid
consent, fixed-ID/clock text compilation, stale/save/export/reopen behavior,
private cleanup and dependency boundaries. Earlier CL-067–077 pending work is
preserved and excluded from this verdict. No scope deviation; transient harness
encoding/seek/export-wait assumptions were corrected rather than changing app
behavior. No deployment, cloud mutation, configuration edit or live API call.
Nothing staged, committed or pushed. Owner real Gemini quality/credit usage and
personal real-media/visual acceptance remain unchecked by policy.
