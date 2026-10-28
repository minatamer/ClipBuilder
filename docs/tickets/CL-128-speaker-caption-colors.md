# CL-128 — speaker caption colors and manual correction

Owner request, 2026-10-28: color captions by the transcript's anonymous speaker
labels and expose manual correction/color control in the caption font controls.
Use execute/validate/fix until no actionable findings and test fake-mode behavior.
Starting worktree is clean at `a95fbd7`; prior resource benchmarking is complete.

## Decisions and scope

Reuse existing per-word speaker IDs; no new AI request or identity inference.
Automatically enable when caption words contain at least two known speakers;
unknown labels use the ordinary caption style. Add a Speakers subtab alongside
Style/Position/Text, with an enable toggle, text/background/highlight colors
and per-word speaker correction, including manual anonymous speaker labels.
Preserve word IDs/timestamps/text corrections. Mixed-speaker caption groups
display only the current speaker's contiguous words. Reuse existing presets,
animations, dirty Apply/Discard footer, reset and saved-edit protocol. Persist
overrides server-side and use the same resolution in preview and native export.
Old saved documents remain valid. Fake captions explicitly simulate two speakers;
new fake clips still default to no captions. Actual diarization quality requires
provider keys/live flags/approvals and owner acceptance; agent tests remain
synthetic, fake/paid-off/network-blocked with zero provider calls.

## File allocation and checks

Contracts: `editor.ts`, `clips.ts`, `edit-overlay.ts`, new `caption-speakers.ts`
and focused tests. Composition: `overlay-frame.ts`, `automatic-overlay.tsx` and
focused speaker rendering tests. Backend: `edit-clip.ts`, caption-generation
owning module/fake fixture and tests. Frontend: `editor-state.ts`, `clip-editor.tsx`,
new speaker controls, narrow CSS and UI tests. Source of truth/index/feature
README own behavior and evidence. An opt-in synthetic browser/native proof may
cover both CL-128/129 sequentially; record this ticket's actual evidence before
starting CL-129. No hook implementation belongs in this ticket.

Verify mixed/null labels, manual word reassignment, three color roles, disable/
reset, text-ID stability, save/restore, stale/unknown-word rejection, preview/
native parity and fake generation. Run focused tests/types/lint; use current
source synthetic native output and desktop/phone browser/keyboard checks. Build
contracts and reload the normal current worker through verified lifecycle.
Preserve all media/configuration and the healthy app. No paid/cloud/deploy/push.

## Acceptance

- [x] Automatic speaker resolution, fallback and manual corrections persist.
- [x] Caption colors/animations agree in shared preview/native composition; actual native colors verified.
- [x] Fake two-speaker example, focused checks and responsive/keyboard proof pass.
- [x] Validate reports no actionable findings; evidence and remaining gates recorded.

Evidence (2026-10-28): 37 focused tests in caption-speakers, clip-batch and
editor-state passed. Current-source synthetic native MP4 proof checks actual
red/blue pixels at speaker turns. Extended local-focus-editor browser proof
passes at 1440×900, 390×844 and 320×568, including speaker manual assignment,
color editing, save, reset, discard and footer/overflow checks. The fixture
records exactly 31 edit requests and zero plan/image/render/provider calls.
Local TypeScript checks passed; focused ESLint passed after moving proof
cleanup validation into its own function. Validation reviewed contracts,
real apply/compile/generation paths, shared raster cache and controls; no
actionable findings remain. Test-driver save/reset waits were corrected to
wait for the inherited disabled fieldset and React updates, not just labels.
Rebuilt contracts/worker and verified backend tree cleanup/restart; API 20328,
worker 13276, existing frontend 14992 healthy at 3000/4000/4200. Normal logs:
OS-temporary clipbuilder-run-20261028-074554ad/backend-cl128.*.log.

Status: implemented and locally validated. Owner visual/live-AI/release acceptance
remains unchecked; fake mechanics do not prove real diarization accuracy.

Final combined validation, 2026-10-29: the explicit fake-caption adapter now
splits fictional labels into two turns even for 1–3 second clips. Ordinary fake
analysis keeps its dialogue labels, new clips still omit captions, hosted still
excludes the fake-caption action, and no provider is called. The final combined
regression set is 89 tests including fake-content; CL-129 records current UI,
native output and worker evidence. No actionable findings remain.
