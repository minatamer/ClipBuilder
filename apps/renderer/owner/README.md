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
the fixed overlay bundle and installed Chrome. Real provider AI is not composed
here and would need implemented/composed provider adapters and input
preparation, keys, enabled live flags and applicable owner approvals. Keys/flags
alone are insufficient. Existing prepared bundles remain editable and locally
exportable when those provider capabilities are unavailable. No offline AI
model/weights are included. Synthetic checks do not close owner acceptance of
real caption readability, picture placement/crop or final A/V quality. No paid,
cloud or real YouTube test is covered by these checks.
