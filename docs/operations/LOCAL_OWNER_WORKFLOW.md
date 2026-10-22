# Local owner workflow

The private owner app is separate from the public demo and excluded from its
routes, builds and Docker contexts. Its default fake mode needs no API key or
ADC: analysis, plans and generated pictures are fictional, while local media
inspection, cutting, encoding, picture import and saved drafts are real. No
offline AI model or weights are included. Synthetic checks do not establish
real AI or professional editorial quality.

## Start and stop

Use the pinned package manager from the repository root. Follow the
[host guide](../../apps/backend/owner/README.md) for the already pinned Windows
x64 FFmpeg/FFprobe 9.0.2 and installed Chrome prerequisites. Tool preparation is
a separate deliberate action; startup and jobs never install software.

```powershell
corepack pnpm build:contracts
corepack pnpm owner:build
$env:FAKE_MODE = 'true'
$env:PAID_DEMO_ENABLED = 'false'
corepack pnpm owner:start
```

Open `http://localhost:4100/`; its authenticated native worker binds only to
127.0.0.1:4200. The owner launcher reads no env file. Normal public 3000/4000
services remain independent. Conflicting owner ports, changed/missing tools and
invalid flags stop startup; there is no cloud or alternate-port fallback.
`PAID_DEMO_ENABLED=fake` is invalid: paid-off is exactly `false`.

Stop the supervisor with Ctrl+C. It withdraws discovery, cancels/drains work,
closes host then worker, and removes its owned processing scratch and capability
state. Keep the content-safe logs named by the launcher. A recovery-required
error is not permission to launch over old listeners or terminate unrelated
Node/Chrome processes; root AGENTS governs verified process-tree cleanup.

## Make and revise clips

1. Open an MP4, paste an admitted YouTube link, or choose **Use saved video**.
   The linked-source guide below distinguishes fake import from the dormant
   real downloader. Opening a source alone starts no AI work.
2. Add the exact start/end ranges you already want. Separately choose AI
   minimum/maximum duration and **Find moments**. Equal AI bounds request an
   exact duration; equal manual start/end is invalid. Manual cuts remain exact
   requests through empty AI results and duration changes.
3. Select up to ten manual/AI moments and process them in one action. Native
   work is serial. Each clip has separate progress, cancellation and exports;
   review a prepared/completed clip while its siblings continue.
4. Review captions and pictures, choose a caption preset, move/resize layers
   with pointer/arrow keys or numeric fields, and import an owned JPEG/PNG.
   **Apply changes** acknowledges a revision; **Export again** creates a new
   MP4 of that revision. Older exports remain immutable. An active export keeps
   its admitted snapshot while later edits belong to a later revision.
5. Save a draft once when it should survive closing the workspace. Applied,
   acknowledged changes then autosave; unapplied controls remain local form
   state. Reopen a valid draft to edit/export without repeating AI. A failed
   save preserves the running session and last good saved copy.
6. Download an explicit export. Clear removes processing copies, preserving
   saved source masters, drafts, exports and private logs.

The [editor guide](../../apps/frontend/owner/README.md) documents controls,
revision conflicts and picture bounds. The
[agent command guide](../../apps/backend/owner/AGENT_COMMANDS.md) documents the
stdin-only local CLI. Inspect the exact target, validate a proposed patch,
apply it with the same operation ID/current revision, then explicitly render.
The same coordinator owns UI and CLI edits. The CLI needs no browser and has no
analysis, provider, arbitrary-host, arbitrary-command or remote-asset action.
Private media inspection is separate from permission to edit through the CLI.

## Limits and storage

| Item | Current local limit |
| --- | --- |
| Source | One full SDR MP4, ≤60 minutes/10GiB, ≤4K/60fps in admitted codecs |
| Manual ranges | Up to ten, each 1–300 seconds |
| AI discovery | 10–60 seconds, including min=max; up to four additional suggestions |
| Selected clips | Up to ten; one heavy native job at a time |
| Output | 1080×1920/30fps H.264/AAC, ≤1GiB and the admitted per-clip reservation |
| Scratch / free space | ≤20GiB; preserve ≥10GiB on each touched volume |
| Saved library | Warn at 50GiB; no automatic deletion of completed owner inputs |
| Pictures | JPEG/PNG ≤4MiB and 16M decoded pixels; bounded normalized JPEGs |

The [worker guide](../../apps/renderer/owner/README.md) owns codec/clock/tool
details. Two-worker concurrency, worst-case 4K media and maximum-complexity
300-second edited output are not established by short color/tone proofs.
One browser overlay page captures serial frames; FFmpeg decode/encode/filter
pools use two threads. Chromium has normal engine/utility threads and processes.
CL-024 records sampled resource observations rather than a universal benchmark.

The app resolves the actual Windows Downloads known folder, including a
redirected location. `Downloads/ClipBuilder` separates Sources, Drafts and
Exports, outside Git and public assets. A new linked acquisition may explicitly
use the Desktop library. No fallback writes into the repository. Saved masters
and exports never expire automatically; explicit targeted deletion respects
shared/draft references. Drafts retain validated words/analysis/edits/pictures,
not raw provider payloads or old capabilities. Scratch stays OS-temporary.
Preserve retained demonstration masters, diagnostic captures and private logs.

## Linked sources and real-provider handoff

The [source guide](../../apps/backend/owner/SOURCE_ACQUISITION.md) covers exact
offered tiers, Best available, format changes, Downloads/Desktop placement,
repair and targeted deletion. Fake import generates a complete 16-second
synthetic source at the selected dimensions; it never downloads that YouTube
video. Saved local lookup and URL-free reopening happen before downloader,
metadata or provider gates, including after restart. Reuse validates full local
bytes and never redownloads an intact matching variant. Best saved describes
the acquisition date, not today's online maximum.

The real yt-dlp/Deno adapter is implemented and tested with injected synthetic
process/network ports, but remains uncomposed/unavailable. Actual binaries,
licenses/runtime/EJS/egress compliance and a separately cleared source/method
permit still need owner evidence. UI acknowledgement, flags or an executable
hash alone do not create that permit. Return any needed actual composition to
CL-023 before a real retrieval trial; there has been no real YouTube request.

The [separate provider entry](../../apps/backend/owner/README.md#separate-provider-entry-owner-activation-pending)
does compose local bounded audio/video preparation and existing Gemini adapters.
Its injected tests preserve media identity/timings into native export. It needs
an owner-supplied key, explicit local/provider/paid mode, master approval and
individual transfer/image/project/spend approvals. It is never enabled by fake
mode or an API key alone. Native workers receive no AI keys/ADC credentials;
cloud media dispatch remains absent. Actual paid processing is initiated only
by the owner. Real model quality, deletion confirmation, A/V/readability and
human usability remain unchecked in
[CL-025](../tickets/CL-025-owner-manual-local-workflow-acceptance.md).
