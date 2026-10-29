# CL-145 — clean Hook cut and remove Sator from the library

Status: implemented and locally validated. Plan recorded before implementation,
dependency-ready after CL-144.
Owner request 2026-10-29: remove Sator suspense and investigate/fix the uneven
Hook-to-main-clip transition. Keep a normal hard cut, copied timestamp edits,
original body, quality and limits. Hide the rejected sound from new selection
while preserving legacy saved cue decoding; never erase saved owner media.

Initial code inspection: Review mounts the main Html5Video only at its first
body frame, with pauseWhenBuffering. Reproduce this cold boundary on synthetic
video before choosing the fix. Use the installed Remotion premount mechanism
to prepare the body before the cut if confirmed; no crossfade or transition.
Check capture readiness against active media rather than hidden preload events.

Whole-file allocation: frontend local-editing clip-editor.tsx and, if required,
use-editor-preview.ts own playback/readiness. Extend the existing synthetic
local-focus-editor.proof.ts for preloaded media identity, decoded cut timing,
capture and suggested/manual Hook playback. Contracts local/audio.ts retires
Sator; composition audio-sources.test.ts and audio-synthesis.test.ts distinguish
retirement from recorded/legacy encoding. The existing audio-editor proof uses
a retained catalogue effect for its Hook-only energy check instead of adding
retired Sator. Update source of truth, MEDIA_AUDIO, feature guide and index.
Extend allocation to native Hook proof only if export evidence reveals an issue.

Validate focused audio/Hook checks, synthetic browser Hook/audio proofs and the
existing native Hook export proof, plus scoped types/lint/format. No new provider
boundary; existing fake call counts remain exact. Build contracts and refresh
the normal backend/worker with verified ownership, preserving frontend/config.
Read-only review and cleanup close the packet before claiming completion.

All checks use FAKE_MODE=true, paid-off, synthetic source media and blocked
external network, with no API keys. Real AI recommendations still need the
selected provider's setup/live approvals and are not exercised. No owner-media
tests, ignored env inspection, cloud/download/provider calls, Git or deployment.
Personal listening/real media, physical devices, hosted and release acceptance
remain owner-only. Preserve all prior uncommitted CL-135–144 work.

- [x] Sator absent from new selection; legacy saved audio remains decodable.
- [x] Confirmed boundary issue fixed as a hard cut with active capture safety.
- [x] Synthetic browser/native and scoped gates pass; app refreshed/reviewed.

Reproduction before playback changes: the existing synthetic suggested-Hook
browser action crossed the cut but toggled two Capture controls six times
(seeks=1), exceeding the existing four-change bound. Inspection confirms the
body Html5Video is absent until its Sequence begins. Prepare it one second early
with Remotion's hidden/frozen premount and stable hook/body keys, keeping the
cut at the same frame. Ignore preload/audio readiness events when deciding if
the active source video can be captured. No crossfade or timing alteration.

Native proof allocation: extend the existing second local-speaker-hook proof
with exact adjacent-frame color checks at the cut across its five existing
native-rate cases, including one-frame Hooks. No native renderer change unless
this new evidence fails.

The native boundary check also exposed low audio energy at a snapped cut.
Extend production allocation to renderer local/clip-render.ts: Hook video rounds
to whole native frames, while Hook audio was trimmed at logical 30-fps bounds
and padded to that different duration. Align audio trim to the same native start
frame/duration as video, preserving original pitch and natural source audio.
Do not add a fade, time stretch, silence or change the original body.
Update renderer/local/README.md for that native-clock fix and the local workflow
guide's now-stale active catalogue list; other service configuration is unchanged.

## Evidence — 2026-10-29

Sator is retired in the shared catalogue. Its ID, digest and immutable FLAC are
retained for saved cues; the unit test distinguishes recording encoding from
picker retirement. Current choices are Pop, Discord notification, Bamboo and
Vine Boom. No owner cue/media is silently erased or replaced.

Review uses stable Hook/body keys and one-second hidden/frozen Remotion premount,
keeping the next video paused at its first decoded frame. Explicit video-part
attributes and the player's Hook clock select the active source for readiness
and capture; hidden video/audio events cannot toggle Capture controls. Prefix
and body keep their original cut frames. No fade/transition or playback-tick
input-prop updates were added. Early iterations exposed ambiguous first-video
queries and a wall-clock audio assertion; the settled path identifies active
media and checks sound after the actual decoded body boundary.

Native audio now trims from the same native frame index/duration as Hook video.
The new adjacent-frame/audio check initially failed with boundary RMS 0.0039;
after the fixed trim it passes all five existing cases: two 30-fps ranges,
30000/1001 one-frame, 24-fps partial range and 12-fps one-frame. The last Hook
frame and first two body frames show the expected hard color/camera cut, and
5-ms audio windows before/at/after the physical cut retain energy. Existing
dimensions/cadence, source audio frequency, camera/filter and intact-body checks
also pass. This is the targeted second local-speaker-hook proof; its separate
speaker/color proof was intentionally skipped, not claimed as rerun. Duration:
44.48 seconds. No native codec/quality, body edit, fade or time stretch changed.

Final settled browser run: local-focus-editor and local-audio-editor proofs
passed together in 125.82 seconds. At desktop/390/320, suggested Hook playback
checks that the body is decoded, paused at zero before the cut and is the same
DOM video afterward; Capture toggles remain within the existing bound. Exact
suggested range, playing-prefix/body capture, cancellation, Apply/Discard and
saved reload remain covered, with 43 edits and zero plan/image/render calls.
Audio proof confirms Sator absent, uses a manually Hook-placed Vine Boom for
measured playback and silence after the actual body begins, then verifies
Discord gain persistence, twelve layers, mute/pause/seek, uploads/injected URL
cancel/retry, save/reload and actual synthetic MP4 export. Exact counts remain
one fake plan/image, zero selection, three injected URL calls/four normalizations.

Four focused files / nine unit checks pass for catalogue/retired recording
compatibility, legacy PCM, audio segments and Hook clocks. Frontend/local/proof
types, scoped ESLint, Prettier, contracts build and diff checks pass. Final
frontend types/lint reran after explicit active-video selection. Synthetic
scratch directories for all three proofs are gone. Current 390px library and
Hook screenshots were inspected: Sator absent, correct controls and persistent
footer; desktop/tablet/phone layout assertions also pass. No owner-media
screenshots or real media were captured.

Current-source app parity: nine old backend identities verified stopped while
frontend 15768 / 3000 was preserved. New supervisor 26140, backend 22232 / 4000,
worker 26572 / 4200; health returned 200. Runtime record and separate stdout/
stderr logs are at
`C:/Users/minat/AppData/Local/Temp/clipbuilder-clean-hook-20261029-cl145/`.
Normal configuration was loaded only by the entry point, without agent reading
ignored files or changing switches. Final health, /start and /api/sample/config
checks all returned 200.

Scoped read-only validation at HEAD 04450d6: Meets ticket; no actionable
findings. Reviewed sequence/media identities, active capture/error/cancel
guards, source-frame/audio boundary agreement, retirement/encoding separation,
resource cleanup and documentation. Prior CL-135–144 work is preserved and
excluded from this packet's verdict. Allocation expanded before native fixes
when the new boundary check exposed the padding bug; otherwise deviations none.
No new dependency, lower limit/quality, inference, real download/cloud/provider
call, staging, commit, push or deployment. Personal listening/real-media, physical
devices/Safari, real AI, hosted and release acceptance remain unchecked.
