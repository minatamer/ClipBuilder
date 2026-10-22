# Local owner worker

This private worker accepts only fixed typed media jobs for admitted workspace
IDs over authenticated loopback HTTP. It cannot accept arbitrary commands,
filesystem paths, remote assets or renderer input. It imports only contracts
and its own renderer primitives; no backend app, cloud media client or provider
adapter is composed. Imports are inert; `entry.ts` alone reads explicit runtime
state and listens on 127.0.0.1:4200.

CL-017 uses checksum-admitted Windows x64 FFmpeg/FFprobe 9.0.2 for a fixed
contain/pad portrait. It does not use Chromium or a Remotion browser bundle in
this slice. Later caption/visual composition must establish its own readiness
before use. One native job runs at a time. Cancellation drains the native child
before the host removes scratch. Partial outputs are removed; only validated
MP4s replace a previous output. Full output decoding and metadata/timing checks
precede successful export. Missing tools return unavailable; there is no remote
fallback or automatic tool download.

See [host setup/checks](../../backend/owner/README.md). Fake AI and real synthetic
encoding need no API keys or ADC. No real AI model/runtime is included, and fake
tests do not establish real-media or visual quality.
