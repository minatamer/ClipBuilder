# Local owner worker

This private worker accepts only fixed typed media jobs for admitted workspace
IDs over authenticated loopback HTTP. It cannot accept arbitrary commands,
filesystem paths, remote assets or arbitrary composition input. It uses owner
contracts, shared pure composition and its own renderer primitives; no backend
app, cloud media client or provider adapter is composed. Imports are inert;
`entry.ts` alone reads explicit runtime state and listens on 127.0.0.1:4200.

CL-017–019 use checksum-admitted Windows x64 FFmpeg/FFprobe 9.0.2 for an accurate
30fps range cut with a fixed contain/pad portrait. The source fingerprint and
frame endpoints are checked before encoding. Packet presentation ends define
the video clock, since MP4 stream duration may include a trailing allowance
with no decoded frames. VFR/video offsets normalize before frame selection;
audio offsets stay on that video clock, preserving silence inside the source.
Exact output frame counts and full decode are checked before publication. No
speech stretching, frozen extension or out-of-source padding meets AI bounds.

The multi-clip path retains a normalized portrait cut per clip, bound to the
source fingerprint, selected range and actual cut-file digest. Re-export reuses
that cut and the immutable automatic overlay. A fresh output revision never
overwrites an earlier export. The source, cuts, assets and completed outputs
remain workspace-owned until clear/expiry/shutdown; failure in one clip removes
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
files within owned scratch, with a conservative 2 GiB logical byte ceiling.

The admitted Gyan FFmpeg muxes those frames with the normalized cut and audio.
Each cut/output is bounded to a 384 MiB reservation; video uses a fixed 8 Mbit/s
maximum rate, 16 Mbit buffer and AAC audio. Metadata, exact frame counts and a
full decode are checked before atomic output publication. Only fixed typed
overlay geometry/cues and admitted JPEG assets are accepted; personal-image
normalization and editor controls are deferred to CL-020.

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
here and would need implementation, keys, enabled live flags and applicable
owner approvals. No paid, cloud or real YouTube test is covered by these checks.
