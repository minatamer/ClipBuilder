# Local linked sources and saved videos

Use the normal application at localhost:3000/start and its existing backend `.env.local`. `FAKE_MODE=true` and `PAID_DEMO_ENABLED=false` keep AI fictional while actual local downloads are available by default. No Gemini/YouTube API key, gcloud, source permit or checkbox is required. The [local workflow guide](../../../docs/operations/LOCAL_WORKFLOW.md) owns normal setup and prepared tools. Synthetic acquisition exists only as an injected test adapter, never as a second user startup command.

## Import and reuse

1. Paste an admitted HTTPS watch, shorts or youtu.be link and choose **Look for
   saved source locally**. Typing does not request platform metadata. Equivalent
   links resolve to the same private source identity; tracking/list/time fields
   do not turn the full conversation into an excerpt.
2. An intact saved variant can open directly, without platform metadata,
   downloader readiness or AI. **Use saved video** also works without a URL.
   The saved state describes local file integrity; opening still performs
   native validation before it creates a usable processing workspace.
3. For a new acquisition, explicitly request offered qualities. Normal
   normal local startup requests actual source
   metadata through the pinned downloader. **Refresh offered qualities explicitly** never imports bytes by
   itself.
4. Select Best available or a concrete offered video/audio variant, then Import.
   The app handles video/audio preparation, merging, full inspection and
   publication; no manual merge, download or re-upload is part of this path.
5. The resulting workspace uses the existing manual ranges, independent AI
   duration settings, multi-clip processing and presentation editor. Source
   reuse does not itself replay or cache an AI analysis. Reopen a saved draft
   separately when validated analysis and completed edits should be restored.

Offers show actual width/height, shorter-edge tier, FPS, codec/dynamic range,
audio identity and known/estimated size or a support reason. Portrait
1080×1920 is 1080p; 3840×1600 is 1600p. Best ranks before compatibility checks:
an unsupported highest rendition remains visibly unavailable until an explicit
alternative is chosen. Exact variants bind metadata revision and video/audio
format IDs; a missing/changed choice fails rather than silently downgrading,
upscaling, dropping audio or changing tracks. Best saved means best among the
local copies on their acquisition dates, not today's online maximum.

Import checks all matching saved formats before tool/network readiness, even
after an explicit metadata refresh. Repeated equivalent imports share the
acknowledged action; an intact matching master is never downloaded again
automatically. A new requested quality can create another immutable variant.
Synthetic and acquired provenance remain distinct; a future provider flow
cannot implicitly reuse a synthetic source as real footage.

The protected local host exposes these source routes. They use the same
loopback Host/Origin/capability checks as the owner workspace API; they accept
bounded contract values, never arbitrary commands or destination paths.

| Route | Action |
| --- | --- |
| `GET /api/sources` / `GET /api/sources/state` | Local catalog/capacity warning and current progress |
| `POST /api/sources/lookup` | Canonical-link local lookup only |
| `POST /api/sources/metadata` | Explicit metadata request, independently of AI |
| `POST /api/sources/import` | Admit an exact offered choice; returns 202 for progress polling |
| `POST /api/sources/open` / `POST /api/sources/cancel` | Open a saved variant or cancel active import |
| `DELETE /api/sources/{destination}/{variantId}` | Delete one selected saved variant |
| `POST /api/sources/{destination}/{variantId}/locate` | Supply a chosen MP4 matching the frozen saved identity |

Destination is the fixed `downloads` or `desktop` enum. Open/Locate/Delete require an
empty processing workspace. A successful import/open enters the same workspace
use cases as an upload, without an automatic analysis request.

## Files, repair and deletion

The launcher resolves the actual Windows Downloads known folder and the Desktop
known folder without creating either library. Downloads is the default;
Desktop is an explicit destination for **new acquisitions**. Existing matching
copies are reused in place rather than moved or redownloaded to satisfy a new
destination choice. Missing known-folder resolution has no repository/path
fallback. All roots must stay outside Git and reject linked ancestors.

Each selected root uses `ClipBuilder/Sources/{fingerprint}.mp4` for an immutable
complete source master, with neutral UUID `.source.json` sidecars. The bounded,
strict version-1 record keeps canonical platform identity privately, selected
format descriptors, acquisition date, synthetic/acquired provenance, actual
media metadata/digest, tool versions and full-source offset zero. It contains no
title, account, extracted stream URL, authentication, transcript or raw tool
payload. Completed sidecars alone are eligible for reuse; partial files are not.
Source/variant IDs stay frozen when another quality is acquired.

Saved drafts and exports use separate `Drafts`/`Exports` areas under the default
Downloads library. A draft can retain its own source master there independently
of an acquired Desktop copy. Closing/clearing a processing workspace removes
only its temporary processing copies; saved source masters, sidecars, drafts,
exports and private logs survive. Later AI/export failure cannot invalidate a
completed source or cause another download.

Local listing verifies size/hash and marks missing, damaged or unsupported
copies safely. Opening validates the copied source again through the native
worker. A missing/moved file can be supplied explicitly through Locate: it must
match the frozen digest and supported media profile. Different bytes are not a
replacement for an existing source identity. A damaged master is never silently
overwritten; repair remains unavailable until the conflicting saved file is
handled through an explicit source-targeted action.

Delete requires an empty processing workspace, preventing a race with current
draft saves. It acts on one confirmed saved variant, after active acquisition/readers
drain. A master shared with another variant is preserved. Draft references,
including their last-good backup, prevent deleting a required master;
unreadable references fail conservatively. Deleting a draft does not delete its
source or exports. There is no automatic source expiry. The combined library
warns at 50 GiB instead of deleting old media. Catalogs admit at most 500
variants per root.

## Native and resource boundary

The acquisition profile accepts a complete SDR MP4 with one video and one audio
stream, H.264/VP9 plus AAC/Opus, admitted 8-bit pixels, mono/stereo up to 48kHz,
12–60fps, at most 60 minutes/10 GiB, at most 3840px per dimension and
3840×2160 pixels. This linked-source profile is narrower than some existing
local upload decoder choices. HDR, AV1/HEVC, unsupported audio/container
combinations, live/upcoming/incomplete archives and restricted access stop
safely. Final clips remain 1080×1920/30fps SDR regardless of source quality.

Only the private acquisition merge can read admitted WebM/MP4 components. It
losslessly muxes selected encoded streams into MP4, checks dimensions/FPS/audio
and full-source duration, computes the digest and fully decodes before source
publication. It does not transcode, tone-map or broaden normal public/upload
demuxer inputs. Metadata and a 100% progress event alone do not complete import.

One acquisition and one heavy native operation are admitted. Progress separates
video, audio, merging, inspecting and publishing; unknown totals remain
indeterminate. Cancellation stays pending until the owned processes/sockets
drain, then removes only that action's partial/new scratch. Native work and
storage checks also run before reopening a saved source.

Components and their merged source first occupy one temporary workspace. After
validation, component files drain/remove before the source is copied through a
same-directory publication temporary file into the saved library. Atomic
exclusive publication cannot replace an existing master. The existing workspace
is the processing copy. Approximate peak payload is
`max(components + merged, 2 × merged)` plus overhead, with a 20 GiB aggregate
scratch ceiling and at least 10 GiB free on every touched volume. Unknown sizes
reserve conservatively; near-limit input can fail capacity admission rather
than lower quality or omit copy/merge overhead. No maximum-capacity performance
claim follows from short synthetic tests.

## Real local downloader

The explicit `--youtube` option composes yt-dlp **2026.10.21**, bundled EJS and
Deno **2.9.8**, alongside existing FFmpeg/FFprobe **9.0.2**. It can accompany
fake AI/paid-off or the normal backend's configured Gemini providers. The owner removed
per-source permits and the rights checkbox on 2026-10-23; the historical
[acquisition decision](../../../docs/architecture/LOCAL_SOURCE_ACQUISITION.md)
records the original research. Source URL validation, exact offered choices,
local capability/Host/Origin checks and process/network/resource limits remain.

`local:prepare:youtube` separately downloads official pinned assets and license
notices. It verifies the yt-dlp executable, Deno archive and upstream executable
checksum document, verifies the extracted executable against that document and
checks offline versions. Startup verifies the same tool identities and notices
again. Startup/jobs never install, self-update or fetch components. Actual
YouTube availability/challenge/broker compatibility still needs a real trial.

The adapter uses fixed process arguments and generated private stdin;
canonical URLs, proxy capabilities and paths do not become shell arguments or
logs. It disables ambient configs/plugins, cookies, remote components,
self-updates, exec hooks and automatic retries. A minimal child environment
contains no inherited credentials or Deno permission-broker settings; Deno's
cache/temp stays in owned scratch and its challenge runner receives no network
grants.

Its job-owned authenticated CONNECT broker allows only the selected YouTube
API/player and googlevideo hosts on port 443. Every connection validates all DNS
answers, refuses reserved/private addresses and pins the checked socket IP.
Redirects needing another tunnel receive the same check. TLS certificate
validation remains enabled. This is a bounded network policy for trusted tools,
not an OS sandbox; actual tool/broker compliance remains unverified by real
acquisition.

| Budget | Fixed limit |
| --- | --- |
| Metadata / transfer lifetime | 90 seconds / 2 hours |
| Process/socket idle | 30 seconds |
| Structured line / process stdout | 1 MiB / 4 MiB; raw stderr discarded with a 256 KiB ceiling |
| Offered formats / concurrent tunnels | 1,000 / 4 |
| Broker rate / downloader requested rate | 50 MiB/s, failing on overspeed / 48 MiB/s |
| Automatic retries | Zero |

The broker rate check drops an excessive action; it is not a smooth throttle or
permission to pick a lower rendition. Child output stays bounded in memory and
is projected into safe metadata/progress rather than printed or retained raw.

## Local checks and owner acceptance

With fake/paid-off startup, a local trial can choose each synthetic tier, import,
create manual-range clips, clear/restart and reopen through a pasted alias or
Use saved video. Check saved provenance, exact dimensions, cancellation and
source retention in the local player. These are trial steps, not a claim that
owner manual acceptance has passed. Automated coordinator/HTTP checks use tiny
synthetic bytes and counted native/AI ports; separate native proofs generate,
mux, inspect and decode actual synthetic video.

Fake acquisition/AI needs no API keys. Native merge, inspection, deterministic
editing and export are API-free and do real local processing. Real downloading
is AI-key-free with normal local startup and verified tools.
It uses network independently of the fake AI composition. Real automatic analysis/planning has a
separate [normal local workflow](../../../docs/operations/LOCAL_WORKFLOW.md),
implemented with injected-transport verification but no paid activation. It
requires a manually supplied API key and all explicit owner gates; it composes
the downloader as part of normal provider startup. No offline AI model or weights are supplied.
Real acquisition quality/latency, actual challenge/runtime/network
compatibility, full-capacity behavior and human A/V/readability review remain
owner-only acceptance items.
