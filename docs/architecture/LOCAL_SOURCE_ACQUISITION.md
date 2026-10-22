# Local linked-source acquisition decision

Date: 2026-10-22. CL-022 decision: **go for the isolated CL-023 implementation
and synthetic validation; real acquisition remains unavailable until its
source/method, tooling and owner-only runtime checkpoints are satisfied.**
No source-specific retrieval permission has been established. No downloader,
runtime, video metadata request or media transfer ran during this decision.

## Chosen method and evidence

Use a thin backend-owned adapter around the official Windows x64 yt-dlp
executable, a pinned restricted challenge runtime, and existing pinned native
FFmpeg/FFprobe. Preserve one complete source locally, then use the existing
source/range/edit pipeline. No second downloader app, account automation,
hosted service or persistent daemon.

MeTube and Open Video Downloader establish the integrated paste-link/quality/
progress interaction. Their inspected selectors use ceilings and fallbacks,
which do not meet ClipBuilder's exact-resolution requirement. Bind explicit
format identities instead. [MeTube adapter](https://github.com/alexta69/metube/blob/master/app/dl_formats.py),
[Open Video Downloader adapter](https://github.com/jely2002/youtube-dl-gui/blob/main/src-tauri/src/runners/ytdlp_args/format_args.rs).

| Compared method | Decision |
| --- | --- |
| yt-dlp + local merge | Chosen technical implementation; per-source accessibility/permission and actual compatibility remain unverified |
| IFrame playback or Gemini URL understanding | Their documented interfaces do not provide an editable source master; this is an engineering inference from the APIs, not a tested byte-export path |
| Studio/Takeout or creator-supplied original | Useful owner-file fallback; Studio documents 720p/360p, while Takeout may retain original format but has asynchronous archive preparation |
| Render remote expiring streams directly | Rejected: repeated ranges/restarts depend on network access and URL lifetime, contrary to durable offline reuse |

[IFrame API](https://developers.google.com/youtube/iframe_api_reference),
[Gemini video input](https://ai.google.dev/gemini-api/docs/video-understanding#youtube),
[Studio download](https://support.google.com/youtube/answer/56100?hl=en),
[Takeout](https://support.google.com/accounts/answer/3024190?hl=en).

Content rights and permission to acquire through a particular method are separate
inputs. YouTube's published terms restrict downloading and automated access
unless their stated conditions apply. Ownership/licensing, a public URL, local
use or a working extractor does not establish those conditions. The actual
source/method basis is **not provided or cleared here**. CL-023 can implement
and test synthetic ports without that clearance; real requests remain a later
explicit owner action for a cleared source/method. No cookies, credentials,
PO-token plugins, DRM/access bypass or restriction-evading retries are added.
[YouTube terms](https://www.youtube.com/static?template=terms),
[extractor access limits](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#youtube).

## Toolset and maintenance

Pin yt-dlp **2026.10.21**, official `yt-dlp.exe`. Its published SHA256 is
`33121d192d706e62f684a06f80918e3f3a8ba52ac3a65213b6951c39c7d9f555`.
This is a reviewed published digest, not a locally verified binary. Verify the
downloaded executable against it before activation, preserve required bundled
license notices, and deliberately review future upgrades. The current release
also records a security reason to avoid older/self-updating executables.
[Release](https://github.com/yt-dlp/yt-dlp/releases/tag/2026.10.21),
[published asset digest](https://github.com/yt-dlp/yt-dlp/releases/expanded_assets/2026.10.21).

Official executables bundle EJS; the reviewed release pins EJS 0.8.0. Do not
fetch npm/GitHub components during a job. Existing Node remains the app runtime,
but Node 22/24's challenge permission model does not provide network denial.
The revised challenge-runtime recommendation is Deno, whose reviewed yt-dlp
runner uses `run` without network/filesystem grants, disables remote/config
loading, and uses bundled/cached scripts. Pin Deno **v2.9.8**, Windows x64
`deno-x86_64-pc-windows-msvc.zip`, published archive SHA256
`cba84b26e0df5ae7f74fc66b86a95b866872a86292ebd84fa1e959927edd93bf`.
The archive/executable have not been downloaded or locally verified.
[Deno release](https://github.com/denoland/deno/releases/tag/v2.9.8),
[archive digest](https://github.com/denoland/deno/releases/expanded_assets/v2.9.8),
[MIT license](https://raw.githubusercontent.com/denoland/deno/v2.9.8/LICENSE.md).
This replaces the earlier Node-only
recommendation on new security evidence, without upgrading the app's Node or
claiming an OS sandbox around the whole downloader.
[EJS setup](https://github.com/yt-dlp/yt-dlp/wiki/EJS),
[pinned EJS dependency](https://raw.githubusercontent.com/yt-dlp/yt-dlp/2026.10.21/pyproject.toml),
[Node runner](https://raw.githubusercontent.com/yt-dlp/yt-dlp/2026.10.21/yt_dlp/extractor/youtube/jsc/_builtin/node.py),
[Node network permission history](https://nodejs.org/api/cli.html#--allow-net),
[Deno runner](https://raw.githubusercontent.com/yt-dlp/yt-dlp/2026.10.21/yt_dlp/extractor/youtube/jsc/_builtin/deno.py).

Preparation is a separate deliberate step, never startup/media-job installation.
Fake tests need neither downloader nor challenge runtime. Native synthetic
tests use the already verified FFmpeg 9.0.2 and installed Chrome. Binary/runtime
checks, EJS compatibility, licenses and real acquisition remain owner checkpoints.

## Exact source quality

Offer actual dimensions, shorter-edge tier, frame rate, codec, dynamic range,
audio identity/language, support reason and known/estimated bytes. Portrait
1080×1920 is 1080p; 3840×1600 is 1600p. Do not round to familiar tiers.

Best available ranks offered video by shorter edge, pixel count, frame rate,
dynamic range, upstream quality/preference, documented codec preference and
bitrate, then stable format ID. Resolution/bitrate do not prove visual fidelity
or creator-original quality. Rank before compatibility filtering: if the top
rendition is unsupported, stop visibly and offer an explicit alternative.
Never silently redefine Best as Best compatible. Exact numeric tiers require
equality, with concrete variant rows where FPS/HDR/audio differ.

CL-023's deterministic codec tie order is AV1, VP9, HEVC, H.264, then VP8.
This is only a tie-break after the preceding quality dimensions; it is not a
compatibility filter or a fidelity claim. Original/default audio roles map
only reviewed upstream markers; unknown or ambiguous tracks require a concrete
owner selection. A format choice is rechecked immediately before real transfer.

Bind selection to canonical source identity, metadata revision, exact video/
audio IDs and descriptors. Select the original/default audio deliberately;
unknown/multiple ambiguous tracks need an explicit choice. No silent dubbing,
audio dropping or multichannel downmix. Invoke only exact format IDs without
fallback operators or ceiling/preference selectors. If availability or the
downloaded descriptors change, reject the stale choice and require another
explicit selection. [Format selection](https://github.com/yt-dlp/yt-dlp#format-selection).

The existing upload boundary is full-source SDR MP4, one video and one audio stream,
H.264/VP8/VP9 with AAC/Opus/Vorbis, admitted 8-bit pixel formats, mono/stereo
≤48kHz, 12–60fps, ≤60 minutes/10GiB, ≤3840 per dimension and ≤3840×2160 pixels.
AV1/HEVC, HDR, live/upcoming/incomplete live archives and account/DRM-gated
sources stop safely. CL-023 adds explicit owner codec membership checks after probing.
The new acquisition profile is deliberately narrower: H.264/VP9 plus AAC/Opus.
VP8/Vorbis stay visible as unsupported acquisition choices; ordinary upload and
public decoder boundaries do not widen.

Acquired supported WebM components may enter a narrowly typed, local-file-only
lossless MP4 remux; normal upload/public demuxer boundaries do not widen.
Validate selected codec/dimensions/FPS/audio, duration, hash and full decode
before publication. MP4 VP9/Opus and browser playback need synthetic native
proof; unsupported combinations stop without MKV fallback, transcoding,
tone mapping, upscaling or selecting lower quality. Preserve selected encoded
streams, without claiming original upload bytes. Final output remains
1080×1920/30fps SDR, independently of source quality.

## Local reuse and publication

Canonicalize the admitted HTTPS watch/shorts/youtu.be aliases to one private
identity. Strip tracking/list/time fields only after validating a single video;
reject credentials, ports, IP/other hosts, bare searches, channels and playlist-
only inputs. Always acquire the full conversation: offset zero, no time-section
download. Later analysis/ranges bind to inspected local fingerprint/video clock,
never approximate URL-understanding timestamps.

Look up saved variants **before** downloader readiness, online metadata or any
provider gate. An intact selected variant opens after local size/hash/native
validation with zero external calls, including after restart. “Best saved” is
best among local copies, acquired on its stated date; it is not today's online
maximum. Explicit refresh enumerates availability only and never reacquires
intact bytes. “Use saved video” works without a URL or internet.

Use OS-resolved Downloads/ClipBuilder/Sources by default; an explicit Desktop
choice uses that known folder. Keep hash-named immutable MP4 masters consistent
with saved drafts. Adjacent bounded versioned sidecars retain source/variant
IDs, canonical platform identity, selected descriptors, acquisition time,
selection kind, actual metadata/digest/tool versions and full-source offset.
No titles, account details, extracted URLs, authentication, dialogue or raw tool
payload. Completed records alone are reusable; no arbitrary sidecar paths.

Missing/damaged/moved files never auto-download. Offer explicit locate-and-
validate matching the frozen digest, or explicit reacquisition/new variant.
Never overwrite a damaged master or silently relink existing clips to different
content. Duplicate actions share one acquisition. Variant failure leaves all
completed sources intact. Source-targeted deletion drains readers and preserves
masters still shared by another variant/draft; deleting a draft does not delete
its source. No automatic expiry or cleanup of completed masters.

Download selected components into one new owned temporary workspace; merge and
validate there, drain/remove only component files, then stream-copy the master
through a same-directory publication temporary file plus atomic rename/sidecar.
The existing workspace remains the processing copy, avoiding another copy.
Approximate peak is `max(component bytes + merged bytes, 2 × merged bytes)`
plus overhead. Reserve each touched volume independently, preserving 10GiB free
and the 20GiB aggregate scratch ceiling. Exact 10GiB media may exceed the scratch
ceiling with overhead: reject capacity rather than lower quality or omit space.
Warn at 50GiB saved storage; never auto-delete completed sources.

## Network/process boundary and verification

Reconstruct only canonical YouTube input internally. Use fixed arguments,
native HTTPS downloading, no ambient/user configs or plugins, no cookies,
remote components, self-update, exec hooks or retries; one fragment/downloader
at a time. Keep URLs/proxy capabilities out of argv through private generated
stdin/configuration, never user-provided options. In the reviewed parser,
argv is `--ignore-config --config-locations - --`; generated stdin contains
properly quoted fixed options and the canonical HTTPS positional URL, with no
`--` token or `--no-config-locations` inside stdin. Config arguments precede
argv; putting the terminator inside stdin would corrupt that boundary. This
source-derived framing requires synthetic process tests before activation.
Raw child output stays bounded
in memory and is discarded after strict metadata/progress projection.
[Reviewed options](https://raw.githubusercontent.com/yt-dlp/yt-dlp/2026.10.21/yt_dlp/options.py).

Extractor filters are not an SSRF sandbox. Route approved downloader HTTPS
through a job-owned authenticated loopback CONNECT broker: allow only required
YouTube API/player and googlevideo CDN hosts, port443, validate every connection's
DNS results, reject reserved/private addresses and pin the chosen socket IP.
Plain HTTP/other protocols, host changes outside that set and certificate bypass
are unavailable. Every redirect requiring another tunnel receives the same
checks. FFmpeg gets only admitted local files. Deno receives no network grants;
pin its cache/temp environment to owned scratch. Pinned tools remain trusted
executables; this is not an OS-enforced sandbox around every process. Broker/
runtime compliance still needs actual owner verification before live readiness.
[Proxy implementation](https://raw.githubusercontent.com/yt-dlp/yt-dlp/2026.10.21/yt_dlp/utils/networking.py),
[redirect handling](https://raw.githubusercontent.com/yt-dlp/yt-dlp/2026.10.21/yt_dlp/networking/_urllib.py).

Separate stages are video/audio transfer, merge, inspection and publication;
known bytes show progress, unknown totals stay indeterminate. Fixed metadata,
line, byte, deadline, connection and rate budgets bound the action; CL-023
records their concrete values. Completion requires successful exit and media
validation, not a 100% event. Closing/canceling drains the entire owned tool/
runtime/FFmpeg tree and broker sockets before removing only partial/new scratch.
Published sources survive later AI, edit, render, clear and restart failures.

CL-023 must test the adapter with injected synthetic process/network ports,
malicious URL/config/redirect/DNS cases, exact format changes and offline reuse;
native synthetic remux/inspection reaches the same clip workflow. Real source
quality, latency, maximum capacity, binary/runtime compatibility and method
clearance remain unperformed. Fake mode needs no API keys/ADC; real downloading
can be AI-key-free but requires network/tools/permission. Real AI continuation
still requires its own implemented adapters, keys, flags and owner-only approvals.

Deno's runtime grants do not prohibit all module-cache activity. Supply only
the fixed minimal child environment, put `DENO_DIR` in owned scratch, disable
update checks/prompts, and remove inherited `DENO_*` permission/broker settings.
In particular, never inherit `DENO_PERMISSION_BROKER_PATH`. Preserve normal
certificate validation and bundled non-npm EJS; no remote imports/components.
[Deno security model](https://docs.deno.com/runtime/fundamentals/security/).
