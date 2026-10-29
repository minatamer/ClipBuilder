# Media and manual audio design — CL-133

Owner request, 2026-10-29: rename Pictures to Media, retain image editing and add
music/sound effects. Research and document the approach, then execute/validate.
Current work was committed first under `CL131_132_COMMIT_PLAN.md` through
`54d208b`; subsequent AFK authorization packages implementation under the
[CL-133/134 whole-file plan](../operations/CL133_134_COMMIT_PLAN.md), `85563c8`.
No deployment or paid calls.

## Research and sound choice

Likely names for the requested reveal accent are **text pop**, **click/snap**,
**bubble pop** and **short whoosh**. A short-form editing lesson specifically
demonstrates clicks for pop-up text, shutters for transitions and whooshes for
zooming: [LinkedIn Learning lesson](https://www.linkedin.com/learning/editing-mastery-for-short-form-content-using-capcut/adding-sound-effects-sfx).
ByteDance's Pippit guidance also identifies pop/swipe/whoosh as utility accents:
[official guide](https://www.pippit.ai/resource/how-to-add-music-to-capcut).
The hook description suggests a **tension riser**, **suspense pulse** or
**cinematic suspense bed**. These are search terms/inferences, not identification
of an exact track. No actual owner Short/TikTok was supplied or heard.

Community discussions help with names but do not establish rights; for example
[this Shorts SFX discussion](https://www.reddit.com/r/SideProject/comments/1wfzbz7/finding_good_sfx_for_my_shorts_was_harder_than/)
describes difficulty identifying sounds and finding short previewable cues.
Do not copy a famous track or extract audio from a third-party Short.

[Mixkit's own SFX license](https://mixkit.co/license/modal/sfxFree/) permits use
inside larger creative works but excludes standalone redistribution in tools,
templates or source files. It is unsuitable for the bundled app library.
[Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds) offers a
CC0 alternative for future curation. [YouTube's Audio Library guidance](https://support.google.com/youtube/answer/3376882)
explains its catalogue and attribution choices; it does not grant a general
right to rebundle every track into this editor.

Ship a small **original, deterministic** synthesized catalogue: Pop, Snap,
Whoosh, Ding, Hook tension and Background pulse. Code generates tones/noise;
there are no samples, copied melodies, AI generation, provider requests, runtime
downloads or committed generated media. These approximate useful sound families;
owner listening acceptance remains open. Uploaded audio remains owner media.

## User flow

The existing top-level Pictures tab becomes **Media**, with Pictures / Audio
subviews in the same settings panel. Existing picture controls and gestures
remain. Audio has catalogue previews, add/remove, volume and placement. Provide
bounded MP3/WAV/M4A upload for music/effects, with generic private asset labels.
Previewing a library sound is an explicit, isolated playback action, not an edit.

Placements are **Timed clip**, **Hook only**, and **Whole video**. Timed sounds
use source-relative clip timestamps/capture and inherit the Hook's repeated
range, including a range beginning partway through a sound. Whole-video music
plays continuously over Hook and body. Hook-only music ends at the actual Hook
boundary, with a short in-range fade to prevent clicks; it never leaks into the
normal body. Removing/shortening a Hook safely silences/truncates its music.
Looping supports music longer than its source file; original speech stays on by
default with a separate volume control. No automatic effects per caption/word.

Use normal dirty Apply/Discard, saved drafts, explicit export, readiness guards,
shared primitives and compact footer. Keep one active panel. No timeline, AI
audio generation, remote URLs, streaming integrations or publishing.

## Contracts, storage and safety

One browser-safe contract owns a finite catalogue, audio metadata, cue clocks,
gain/loop/source offset and segment projection. Extend optional edit/overlay
fields and an audio edit operation; old drafts retain silent/default behavior.
Keep image schemas separate. Compiled exports bind uploads to admitted IDs,
digests, bytes and duration; a browser never supplies a path or executable input.

Upload bounds: 12 MiB input, 120 seconds, eight retained audio assets per clip,
twelve cues; normalized stereo 48-kHz PCM WAV is at most 24 MiB per asset.
Inspect/decode only through the internal native worker with fixed paths, closed
protocols, bounded output/time and cancellation. Reject video containers,
unsupported codecs, malformed/nonfinite metadata, oversized/long files, unsafe
paths and unbound assets. Return content-free errors. Preserve existing clip,
source, picture, revision and quality limits. Resource admission accounts for
pending normalization and retained audio; no cloud configuration change.
Normalized uploads pad only their tail to the next logical 30-fps frame (less
than 34 ms), retaining sample content and an exact frame duration so browser and
native looping use the same period.

Private same-origin upload/range-playback follows existing workspace ownership,
origin/auth/session checks. Local drafts copy/hash audio with other assets;
restore validates relations. Hosted expiry and normal cleanup remove temporary
audio. Cue removal retains admitted media needed by drafts/history, like pictures.
No filenames, waveforms, audio content, keys or signed URLs go into logs/Git.

## Playback and rendering

Generate the same catalogue PCM in browser and renderer from pure shared code.
Project source-timed cues into Hook/body occurrences, preserving offset and loop
phase. Whole-video and Hook-only cues use presentation windows. Preview follows
the Player clock and pause/seek/mute state. Native five-millisecond boundary
fades remain inside each window; synthesized sources also contain their own edge
envelopes. Preview controls use the logical frame clock rather than promising
sample-exact browser gain ramps. Match native segment clocks to physical prefix/body lengths
at fractional/low cadence; keep native output resolution/cadence/encode settings.
Mix original audio and admitted/generated tracks with bounded headroom/limiting
and a fixed final AAC encode. The worker raster page must not play audio.

## Verification gate

Fake/paid-off/network-blocked unit checks cover schemas, limits, unknown assets,
edits, Hook intersections, offsets/loops, silence without Hook, gain/fades and
old-draft compatibility. Synthetic native MP4s prove actual added frequencies,
speech retention, hook-only stop, timed repetition and preserved video. Browser
checks exercise catalogue preview, upload, seek/pause/mute, Apply/Discard,
restore, error/cancel and phone/tablet/desktop geometry. Validate scoped changes,
types/lint/format and rebuild/reload the normal worker with verified ownership.
Do not trigger owner processing or read ignored env/media. New functionality
works API-free in fake mode; fresh real AI still needs keys/live approvals and
owner action. Personal listening/visual, physical iOS/Safari, real media/rights,
hosted and release acceptance remain owner-only. The owner authorized a separate
plan commit, then later AFK packaging of all Media/audio and caption changes
before Codex integration. No push or release is included.
