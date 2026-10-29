# Media and manual audio design — CL-133

## Current recorded catalogue — CL-141–145

The owner's 2026-10-29 correction supersedes the original-synthesis-only choices
below. Snap/Whoosh/Ding, Background pulse and Sator suspense are retired from new
selection; saved IDs still decode and play. Current choices are recorded Pop SFX,
Bamboo Hit, Vine Boom and the classic Discord message notification. The owner
rejected Sator and requested its removal; its recording is retained solely for
saved-cue compatibility. No substitute suspense track is selected automatically.
New automatic visual accents use recorded Pop, at the visual start only. All
existing layers/volumes, Hook timing, private assets and video quality stay intact.

The selected cue's Preview in clip seeks to its earliest canonical audio window
and plays the mix. Adding a catalogue cue pauses/seeks without auto-play, so a
Hook-only sound added from the body is ready at frame zero. Browser verification
measures rendered element audio energy and its stop at the actual Hook boundary.

Research uses specific community evidence, not a generic category guide:

- [Editors' go-to accents](https://www.reddit.com/r/VideoEditing/comments/1dpvq6h/)
  name Bubble Pop, Bamboo Hit and Camera Cut. Camera Cut was not uniquely traced,
  so no unrelated file is labeled as it.
- [NewTubers' specific effects](https://www.reddit.com/r/NewTubers/comments/1fw86au/)
  mention a pop for graphics and Vine Boom.
- [Shorts sound identification](https://www.reddit.com/r/VideoEditing/comments/1oexrl9/)
  identifies the creepy-tension excerpt as Ludwig Göransson's Sator at 2:01.
- [A recent Shorts-library usage report](https://www.reddit.com/r/SideProject/comments/1x1mibi/)
  reports reactions, mouse clicks and notification sounds among downloads.
  This is a small self-reported site sample, not a platform-wide trend ranking.

Actual public recordings fetched anonymously on 2026-10-29:

| Catalogue | Public source | Frames / seconds | Normalized SHA-256 |
| --- | --- | --- | --- |
| Pop SFX | [Gfox / Myinstants](https://www.myinstants.com/en/instant/pop-sfx-75405/) | 9 / 0.30 | `d46fb1fd3d2718b99b133c1a13b17f3d1a4b7886eee8b849739a1f440a43f0dd` |
| Discord notification | [Myinstants classic message sound](https://www.myinstants.com/en/instant/discord-notification-38119/) | 15 / 0.50 | `8a0183278548b8b507bf741a5b633c5fadb316b9f0063fbe0abe360cbd7312d3` |
| Bamboo hit | [Myinstants](https://www.myinstants.com/en/instant/bamboo-hit-18672/) | 19 / 0.6333 | `f2c49b6a01d2bc405947dc4c0f2e1bff41052cc204129dafee1cf704a9395c0b` |
| Vine boom | [Myinstants](https://www.myinstants.com/en/instant/vine-boom-sound-70972/) | 38 / 1.2667 | `e6bdddf69536e45d0c97181b9c4f108d40572b115e5990e5fc2078d49f87b73e` |
| Sator suspense (retired) | [Myinstants excerpt](https://www.myinstants.com/en/instant/sator-80391/) | 123 / 4.10 | `af916117498f9621d58f88ef324b42af2319c66c3a7bcb61ff8b292dd3f64385` |

CL-142 original MP3 SHA-256 in Pop/Bamboo/Boom/Sator order:
`6d0369350e1e0d5c5c1bb5e487df5d10b36d9d2d142b68b3fa9572f7acccb0ec`,
`e372e7dd9f7537615d12a94c2905836ec037d9988dad38405128c536a389fc7e`,
`c4dadbc0b9cd21b1313ec11845a00d9401bc208ae0f59f54a0282b8cb89d56c2`,
`91209463b8e3dc8da9463b9ce55bfc8b13b0baf7debe48798dbda79e36a179aa`.

CL-143 follows the page's explicit Download MP3 link to
`https://www.myinstants.com/media/sounds/discord-notification.mp3`. Its 8,301-byte
original SHA-256 is
`8f4d3150992cf86049b5a7beca5d0e9343b78e8dd9243f6dbe4d03a310ffaee1`.
The 0.476021-second MP3 decodes at 48-kHz stereo; fixed gain 0.9311011449 targets
-1.5 dBFS peak and only tail padding makes 15 frames / 0.5 seconds. Its lossless
FLAC is 28,151 bytes. No content is synthesized or fetched during playback.

Pinned FFmpeg decodes each bounded MP3 locally to 48-kHz stereo PCM. Fixed gains
target -1.5 dBFS peak (Pop 1.4994744, Bamboo 0.9404064, Boom 0.8833409, Sator
1.1482107). Pop removes 40 ms of quiet lead-in; otherwise content is retained,
then tail silence pads to whole 30-fps frames. The four CL-142 lossless FLACs total 461,734 bytes;
fixed base64 source data adds no decoder SDK or runtime download. Shared catalogue
hashes own preview identity. Native admits only WAV/PCM uploads/legacy samples
or fixed FLAC/FLAC recordings, still with file/pipe protocols and owned scratch.
These are actual identified samples; the owner's exact intended version and
personal listening acceptance are unconfirmed. No licensed/cleared-release claim.

## Historical synthesized catalogue

CL-138 originally added one built-in Snap (about 133 ms, initial volume 35%) at the start
of each automatically planned visual, with no end cue and no additional AI
request. The editable cue is anchored to the visual's stable ID. Shared
compilation follows its changed start and omits it when the image is removed;
the editor drops orphaned cues so they cannot consume layer capacity. Volume,
mute/removal and ordinary Apply/Discard remain available. Edit timing detaches
the anchor; enabling looping also makes it a manual cue. Existing independent
original/cue volumes and up to twelve concurrent sounds/music layers remain;
overlap is allowed. Fake mode normally emits no images, so synthetic injected
picture plans prove this behavior without API keys. Owner listening remains open.

CL-139 adds local-only Media → Audio → From YouTube. A canonical YouTube URL
selects a clear audio-only AAC/M4A stream without a speech-language requirement.
The whole source must fit two minutes and 12 MiB; normalization keeps the same
24-MiB asset, eight-asset and twelve-cue limits. A new cue opens in its controls
with an independent volume and can overlap existing layers. Download/Cancel
replaces the active footer; cancellation stops acquisition/normalization. The
existing pinned, isolated downloader and CONNECT broker own bounded metadata,
transfer, deadline, zero retries and scratch cleanup. Hosted capabilities,
browser proxy and server reject URL import before acquisition; uploads remain.
Synthetic transports/native media verify this path, without an actual YouTube
request. The older no-remote-URLs text below describes the original CL-133 scope.

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
