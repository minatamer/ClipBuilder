# CL-163 — exclude the opening ten seconds from AI hooks

Status: implemented and locally validated. Plan filed before implementation.
Depends on CL-162, locally present.
Owner 2026-10-30: never suggest an excerpt starting in the first ten seconds of
the source clip. Such an opening already plays at the start of the normal body.

Whole-file plan: contracts `hook-sounds.ts`, `hook.ts` and hook tests; shared
backend `hook-suggestion-policy.ts`, `fake-clips.ts` and affected provider/batch
tests; existing editor/native proofs for new synthetic suggestion clocks; this
ticket, index and source of truth. Add a shared AI-only earliest start at frame
300. Reject early advice rather than silently moving its timestamp to unrelated
speech. Clip too short or no compelling later excerpt returns no suggestion.
Fake sampling chooses only eligible later frames and retains the sound-length
preference/max. Existing manual ten-second duration and manual start at zero
remain unchanged; old suggestions displayed by the editor pass the same decoder.
No auto hook/audio application, extra inference, provider fallback or saved edit
migration. Keep default risers on explicit valid Use suggestion.

Validate boundary frames 299/300, short clips, decoded advice and fake sampling
using fake/no-key/paid-off/network-blocked tests. Update synthetic browser proof
to use a clip long enough to contain an eligible excerpt, preserving native
audio/restore checks. Scoped static checks/read-only validate; normal verified
backend/worker refresh after the three requested packets settle. No paid calls,
owner video, ignored env/config access, deployment or Git mutations.

## Evidence

- Prompt, shared decoder, fake sampler and explicit suggestion acceptance all
  exclude starts before frame 300; an early excerpt is omitted without relocating
  its words or retrying AI. Manual schema/start/duration and saved edits untouched.
  Old early advice disappears through the existing editor decoder.
- Five focused fake suites / 84 cases pass (hook contracts, new fake sampler,
  provider planning, clip batch and pure hook edits). Boundaries include raw
  299.99 versus 300, short clips, later sound-length sampling, no auto-application
  and exact prior call counts. Hook/batch/provider test requests remain synthetic.
- Current-source audio editor/native/export/save proof passes (55.47 seconds)
  with a fifteen-second synthetic clip and eligible 10–15-second suggestion;
  riser offset 0.3s, 600-frame exported presentation, saved gain/restore, manual
  hooks without music and all audio-intake checks preserved. No real video/AI.
- Contract types/scoped ESLint pass; read-only validation: meets local ticket,
  no actionable findings. Earlier pending work excluded. Normal worker refresh
  follows CL-165; real editorial/device acceptance remains owner review.
  No paid/provider/config/cloud/deployment/Git action.
