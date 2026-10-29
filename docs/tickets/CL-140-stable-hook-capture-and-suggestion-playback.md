# CL-140 — stable Hook capture and suggested-range playback

Status: implemented and locally validated. Owner bug report, 2026-10-29. Depends on locally validated
CL-129/132/136. Preserve all current uncommitted CL-135–139 work and app/media.

Investigate the start/end Capture button stutter when playback leaves the Hook
prefix. Reproduce using synthetic media and an injected AI suggestion. Fix the
confirmed readiness/clock or playback issue without weakening capture safety,
changing source timing or introducing playback-tick updates to Player props.
Use suggestion must copy the exact proposed range into the draft, with explicit
Apply/Discard, correct prefix/body playback and no provider request. Keep all
timestamped edits and the complete original clip; no quality/limit changes.

File allocation before code: frontend `use-editor-preview.ts`,
`hook-controls.tsx` and `picture-timing.tsx` only as confirmed fixes require;
`clip-editor.tsx` only if the preview clock/sequence path is implicated. Extend
the existing synthetic `test/local-focus-editor.proof.ts` to observe capture
readiness across the Hook/body boundary, verify exact suggested timing,
preview/capture in each occurrence, Apply/Discard and responsive layout. Add a
small focused frontend clock regression only if needed. Update the feature
README, this packet and ticket index with actual evidence. Any shared/native
change requires extending allocation, relevant native checks and verified worker
refresh first. No ignored env reads/edits, owner-media tests, provider/download/
cloud requests, new dependencies, Git actions or deployment.

- [x] Confirm cause and prevent capture button stutter across prefix/body playback.
- [x] Capture remains guarded while unavailable/seeking/error and records source time.
- [x] AI Use copies the exact range; Apply/Discard and normal playback remain correct.
- [x] Synthetic browser regression, relevant types/lint/format and scoped validate pass.
- [x] Preserve healthy normal app; owner real-media/listening/device acceptance open.

Hook editing, simulated recommendations and synthetic playback checks work with
FAKE_MODE=true and no API keys. Fresh Gemini suggestions require selected Gemini,
keys/live approvals; local Codex requires its CLI login, speech tools and enabled
real/master flags. No real inference is part of this fix or its verification.

Confirmed reproduction: two buttons changed disabled state six times without
seeking during a short suggested prefix/body playback. A playing-prefix capture
also rejected genuine clock drift: player frame 6 mapped to source 0.70s while
decoded video was at 0.811s, readyState 4 and not seeking. Availability now
follows decoded-media readiness instead of per-tick clock equality; source-frame
alignment remains mandatory at capture. Hook changes pause first, including Use.

Extended allocation before implementation to `focus-editor.tsx` and
`focus-preview-controls.tsx` for the shared async capture callback. Capture pauses
and aligns the video once to the chosen source frame, verifies alignment, and
times out after one second. Changing the target, Hook, preview attempt or manual
seek aborts pending capture; all temporary listeners/timer are removed. Existing
unavailable/seeking/error guards remain. Extend the hosted picture proof's
readiness/acknowledgment waits for this bounded asynchronous path. The new proof
also needed decoded-state waits after pause/replay; a guarded early click during
a native seek is not treated as a product defect. No export/composition/worker
contract changed, so a normal backend restart is not required.

## Evidence and validation — 2026-10-29

Three focused Hook contract checks pass. Final combined browser proof run:
two files/two tests passed in 113.24s. All media/AI inputs are synthetic;
FAKE_MODE=true, paid-off and external-network interception remain enforced.

- Extended `local-focus-editor.proof.ts` exercises actual keyboard and pointer
  Use suggestion, including while playing; exact [15,75) source frames remain
  draft-only until Apply. At 1440/390/320 it plays through the entire prefix/body
  boundary, permits only one genuine media readiness cycle (at most four
  disabled attribute changes across two buttons), verifies playback changes no
  Hook values, and captures correct source time in both body and playing prefix.
  Capture edits Discard back to the original suggestion. A held alignment is
  canceled by Remove hook; a late seek event cannot restore it. Manual Hook,
  camera captures/gestures, unavailable/error guards, save/retry and restored
  editor checks continue to pass. Exact server edit count stays 43; plan/image/
  render counters stay zero. Current Hook/AI screenshots at desktop/390/320 stay
  ignored under `.local-build/evidence`; the phone Hook/footer image was inspected.
- Existing `owner-hosted-editor.proof.ts` verifies the same controls with a
  hosted-shaped local fake session: exact first/final/one-frame and [6,24)
  picture captures, rejected reversed bounds, seeking/buffering/error/retry and
  busy guards, independent pictures, responsive footer and native frame-decoded
  MP4 export. Readiness/field acknowledgment waits now support async capture;
  no provider or actual hosted/cloud service is used.
- Frontend/proof TypeScript, scoped ESLint, Prettier and whitespace checks pass.
  Final read-only validation of CL-140 at HEAD 04450d6: Meets ticket for local/
  synthetic verification; no actionable findings. Covered clock mapping,
  suggestion activation, timing bounds, stale-target cancellation, timer/listener
  cleanup, resource/privacy boundaries and existing control integration. Prior
  CL-135–139 work is preserved and excluded from a new broad audit.
- Proof servers/workers/browsers and current scratch completed cleanup. An older
  synthetic hosted-proof folder from 2026-10-24 was identified and left untouched.
  Normal health, /start and /api/sample/config GETs return 200. Safe capabilities
  remain synthetic-ai, aiProvider=codex, captionGeneration=false. Frontend changes
  load through the existing dev service; backend/worker/config/media are preserved.

No dependencies, source/export quality or limits changed. Allocation was expanded
for the confirmed shared capture drift fix; no product-scope deviation. Nothing
staged, committed, pushed or deployed. Owner real-media/listening, actual AI/ASR
quality, physical-device/Safari, hosted and release acceptance remain unchecked.
