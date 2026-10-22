# Local owner worker

This private worker accepts only fixed typed media jobs for admitted workspace
IDs over authenticated loopback HTTP. It cannot accept arbitrary commands,
filesystem paths, remote assets or arbitrary composition input. It uses owner
contracts, shared pure composition and its own renderer primitives; no backend
app, cloud media client or provider adapter is composed. Imports are inert;
`entry.ts` alone reads explicit runtime state and listens on 127.0.0.1:4200.

CL-017–020 use checksum-admitted Windows x64 FFmpeg/FFprobe 9.0.2 for an accurate
30fps range cut with a fixed contain/pad portrait. The source fingerprint and
frame endpoints are checked before encoding. Packet presentation ends define
the video clock, since MP4 stream duration may include a trailing allowance
with no decoded frames. VFR/video offsets normalize before frame selection;
audio offsets stay on that video clock, preserving silence inside the source.
Exact output frame counts and full decode are checked before publication. No
speech stretching, frozen extension or out-of-source padding meets AI bounds.

Fixed provider-preparation jobs create a full-source mono 16kHz/32kbps AAC
input and an upright, physically selected H.264/AAC video proxy at at most
640 pixels per edge and 12fps. Both are limited to 16MiB; video retains arbitrary
30fps cut endpoints through its final MP4 packet duration. Results expose only
operation, bytes, duration and digest. Fingerprint/bounds checks, full decode,
metadata stripping, atomic replacement and cancellation cleanup happen locally.
These jobs never upload media or invoke AI. Synthetic proofs cover the full
60-minute audio/300-second video envelopes and rotated/fractional selections.

Heavy media jobs remain serial. Owner FFmpeg decode/encode and filter pools are
explicitly set to two threads; overlay rendering owns one browser page and
captures frames serially before FFmpeg muxing starts. Chromium still owns its
normal engine/utility threads; one page is not a claim that the whole browser is
single-threaded. CL-024 records observed resource measurements separately from
these configured work bounds.

The linked-source path adds fixed synthetic generation, component preparation
and acquisition inspection jobs. Fake acquisition generates the selected
720p/1080p/2160p dimensions for a complete 16-second source at 30fps. The private
merge accepts only admitted WebM/MP4 video/audio components, then losslessly
muxes H.264/VP9 plus AAC/Opus into a complete SDR MP4. Native inspection checks
the selected dimensions, FPS, duration and audio descriptor, hashes the result
and fully decodes it before publication. This narrow path does not broaden
normal upload or public renderer inputs. Final portrait clips keep their fixed
1080×1920/30fps output profile.

The control host owns the persistent source library and its private sidecars;
this worker reads only admitted workspace copies. Opening a saved source runs
native validation without downloading or calling AI. Missing/damaged copies
cannot enter processing. See the
[source acquisition guide](../../backend/owner/SOURCE_ACQUISITION.md) for the
offline chooser, Downloads/Desktop destinations, phase-specific disk admission
and real-tool gates. The real downloader remains uncomposed and unverified;
native synthetic acquisition is local and needs no API keys or ADC.

The multi-clip path retains a normalized portrait cut per clip, bound to the
source fingerprint, selected range and actual cut-file digest. Re-export reuses
that cut and a complete validated overlay compiled from the immutable automatic
base and separately versioned presentation edits. The host freezes the edit
revision, geometry, cue clocks, asset IDs and digests before admission; a later
edit cannot mutate that render. A fresh output revision never overwrites an
earlier export. The source, cuts, assets and completed outputs remain
workspace-owned until clear/expiry/shutdown; failure in one clip removes
only its attempted output and transient overlay frames.

The overlay uses the same pure React caption/picture tree as local review. A
fixed esbuild page runs in existing Windows Chrome at
`C:/Program Files/Google/Chrome/Application/chrome.exe`, opened headlessly through
the pinned Remotion browser API with a fresh profile. It rasterizes transparent
1080×1920 frames; Chrome never decodes the source video. The worker uses its own
temporary authenticated HTTP listener bound to `127.0.0.1`, serving only the
built HTML/JavaScript. Validated props and admitted JPEG bytes enter through the
browser protocol, not media URLs. The page permits no external connections or
remote assets. It does not start Remotion's render server/media proxy or use a
Remotion-supplied FFmpeg binary. Identical fixed overlay states share frame
files within owned scratch. The 2 GiB PNG ceiling counts unique written PNG
bytes; repeated frame names are hardlinks to those same bytes and consume no
additional PNG payload budget. The separate 9,000-frame maximum still bounds
the sequence to 300 seconds at 30fps. Scratch admission reserves the PNG ceiling
plus clip/output copies and preserves at least 10 GiB free.

The admitted Gyan FFmpeg muxes those frames with the normalized cut and audio.
Each cut/output is bounded to a 384 MiB reservation; video uses a fixed 8 Mbit/s
maximum rate, 16 Mbit buffer and AAC audio. Metadata, exact frame counts and a
full decode are checked before atomic output publication. Only fixed typed
overlay geometry/cues and admitted JPEG assets are accepted. The control host
decodes JPEG/PNG personal pictures before registering a canonical, oriented,
metadata-free JPEG (4 MiB/16 million input pixels; at most 1920px per side and
3 MiB after normalization). The worker independently checks admitted JPEG
bytes/digests before rasterization; it never accepts a local picture filename
or an external image URL.

Preview and export share the pure React caption/picture tree and version-1
owner overlay schema. Caption edits allow clean/classic/bold Arial presets,
requested 32–80px size, fixed hex colors, alignment and a safe normalized box.
The same line-fit rule can reduce the effective size in both paths without
rewriting words or changing clocks. At most three picture cues use fixed
contain/cover fit and in-canvas geometry; pictures draw in cue order below
captions. Synthetic, generated and owner-supplied asset provenance remains
distinct. Resetting a panel uses the immutable base. Public v2/v3 manifests and
their fixed composition stay separate and compatible; this worker's owner
overlay format does not broaden public renderer inputs.

Saved drafts belong to the [local control host](../../backend/owner/README.md#private-saved-drafts),
which stores source masters, drafts and immutable exports separately under the
OS Downloads known folder after explicit opt-in. The worker never reads that
library or a saved JSON document directly. Reopen validates hashes and copies
admitted material into new workspace scratch, retaining stable clip/edit
identities; interrupted work is canceled and never replayed. Completed exports
remain downloadable. An explicit new export may rebuild a normalized cut when
the worker's in-memory cut cache is empty; that native work makes no AI calls.
Workspace cleanup removes only processing copies and preserves all saved
masters, drafts and exports.

One native job runs globally at a time, including its browser and FFmpeg
children. This is a serial multi-clip work list; two concurrent encodes are not
enabled. Cancellation uses a unique job identity so a delayed old cancellation
cannot abort the next sibling. The host waits for worker completion before
reporting cancellation or deleting scratch. Browser/listener/frame cleanup and
partial-output removal also run on failures; normalized cuts and previous
outputs survive failed re-export. Missing tools, Chrome or overlay artifacts
return unavailable; startup/rendering never download tools or fall back to a
remote service.

See [host setup/checks](../../backend/owner/README.md). Fake AI and real synthetic
encoding need no API keys or ADC. No real AI model/runtime is included, and fake
tests do not establish real-media or visual quality. Build the owner artifacts
before `corepack pnpm owner:proof`; its generated-media multi-clip test requires
the fixed overlay bundle and installed Chrome. The separate provider host entry
uses bounded native audio/video preparation before its own API transfers; this
worker still receives no AI key and composes no provider SDK. That host's real
adapters have injected-transport coverage only; paid activation and real-media
review remain owner-only. Existing prepared bundles remain editable and locally
exportable when those provider capabilities are unavailable. No offline AI
model/weights are included. Synthetic checks do not close owner acceptance of
real caption readability, picture placement/crop or final A/V quality. No paid,
cloud or real YouTube test is covered by these checks.
