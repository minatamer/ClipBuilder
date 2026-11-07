# CL-259 — Keep Hook audio aligned with its cut

Follow-up: CL-260 adds explicit Hook title/audio checkboxes. Use suggestion adds
a riser only when Add Hook audio is checked; recording clocks and 100% gain below
remain authoritative. Verification here predates that opt-in revision.

Status: implemented and verified locally, 2026-11-07. Packet recorded before code.

The owner reports a Riser ending at 4.167s while its Hook continues to 6.1s.
Hook audio must continue through the cut; the chosen short/long recording sets
the default Hook length. New Hook audio starts at 100% volume. This supersedes
CL-162's 35% default and shorter-excerpt default, preserving edited gains.

## Intended behavior and acceptance

- Selecting Riser or Rising tension, including Use suggestion, atomically sets
  the independent Hook window and one managed Hook-only cue. Defaults are the
  catalogue's full 159 / 222 frames (5.3 / 7.4 seconds), bounded by remaining
  source. Preserve Start; near source end trim the recording's lead-in so its
  ending still meets the cut. No looping, stretching or spill into the body.
- Manual Start/End input and Capture preserve the exact selected endpoint.
  Realign managed audio whenever the Hook changes; upgrade short to long when
  needed. Managed recording coverage is at most 7.4s; an incomplete/longer draft
  remains local with concise contextual validation and Apply disabled. Manual
  Hooks without managed audio retain the existing 10s limit and add no music.
- New managed or explicitly added Hook recordings default to 100%. Preserve
  owner-edited gain, original-audio gain, unrelated cues, cue identity, resource
  limits, independent Hook/body storage and normal Apply/Discard/reload. Explicit
  offset/placement/loop customization still detaches automatic management.
- Choosing Hook audio from either occurrence routes to the Hook edits, avoiding
  an inaudible Hook-only cue stored in the body. Do not modify owner saved clips
  to prove the fix; verify fresh generated edits over the normal HTTP boundary.
- Test stale-offset repair, short/long switching, source bounds, repeated use,
  gain preservation, exact captured endpoints and native audible-cut isolation.
  Inspect generated editor interactions and responsive local validation.

## Whole-file plan

Frontend Hook edit helper/tests own pure sound/window synchronization. Hook
controls/range draft and ClipEditor coordinate timing and independent content;
AudioInspector routes recording choice to that action and uses 100% defaults.
Generated HTTP/browser/native proofs verify preview metadata, persistence and
cut boundaries. Update this packet, index and the narrow source-of-truth rule.
Existing fixed recordings/contracts/sampler remain authoritative.

All checks use generated media, FAKE_MODE=true, fake transports and paid-off
composition with no API keys. Existing catalogue audio is available locally;
no model inference, real YouTube acquisition or provider spend is required.
Real AI quality remains separate and requires its runtime/key/live approvals.
Preserve pending work, owner media/configuration and running services. No Git,
cloud or deployment action is included.

## Root cause

Manual Hook range changes retained a previously trimmed managed cue's source
and offset. The sampler correctly stops when that recording runs out, so stale
trim metadata produced an early ending. The library also added Hook recordings
without coordinating the independent Hook window; selection from the main
occurrence was disabled. Recording choice now routes explicitly to the Hook.

## Verification

- Pure Hook edit/range suites: 18 cases pass. Cover both full recording defaults,
  100% new gain, source-end lead-in trim, stale-offset repair for a 6.1s range,
  exact endpoints, gain/ID/original-audio preservation, twelve-track replacement,
  detached customization, removal and the manual no-music ten-second limit.
- `test/local-hook-audio.proof.ts`: fresh generated 30s video, normal independent
  Hook edits and four HTTP Apply acknowledgements. Short/long/short choice sets
  159/222/159 frames; a manual 183-frame range upgrades to the long recording
  with 39-frame trim. The cue keeps its ID and edited 63% gain, body audio stays
  unchanged, and reload retains the exact data. Capture edits only End using
  the settled source clock; Discard restores it. Valid/error/corrected input,
  local CTAs and footer geometry remain stable at 1440/834/390px. Hook recording
  auditions also use 100%; other sound defaults remain unchanged.
- `test/local-audio.proof.ts` passes using a newly compiled current-source native
  overlay, both actual catalogue FLACs and generated MP4s: audible Hook/cut
  isolation, no body spill, retained speech/music and output clocks. Contracts,
  composition and worker implementation are unchanged, so no normal-worker
  rebuild/restart is needed for this frontend fix.
- Full `test/local-audio-editor.proof.ts` passes (45.1s): authenticated fake API /
  native worker, new 100% Hook default, edited 27% gain, audition, uploads,
  cancellation/retry, Apply/Discard, saved reload, twelve-track preview identity
  and native 600-frame export. Its 15s source bounds a Hook starting at 10s to
  5s, correctly retaining a 9-frame lead-in trim; initial test expectations were
  corrected to respect that source bound instead of inventing extra frames.
- Final Hook audio and existing independent-Hook editor proofs both pass (38.5s).
  The older editor harness needed two corrections: wait for React's asynchronous
  Motion navigation lock, and scope the caption Text click to Caption controls
  instead of selecting the identically named main Text tab. Assertions still
  verify the actual lock and independent caption/text/image/audio persistence.
- Codex browser inspection on a separate generated fixture confirms Riser and
  original Hook audio both end at 5.300s; the selected Riser shows 100%, zero
  offset and no loop. Screenshot retained outside Git. The fixture was closed;
  owner clips and normal running services were preserved.
- Frontend/root-test TypeScript, scoped ESLint, formatting and diff whitespace
  checks pass. Read-only CL-259 review covers the active path, independent
  content, capacity/failure feedback, local draft guards and cleanup; prior
  CL-247–258 changes are preserved and excluded from this feature verdict.
- All media and HTTP checks are generated/fake/no-key/paid-off. Zero real
  provider/model/acquisition calls; no configuration, saved-clip, cloud,
  deployment, staging or commit changes. Real AI editorial/listening quality and
  physical-device acceptance remain owner-only; fake results do not prove them.
