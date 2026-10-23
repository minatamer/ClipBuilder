# Local editing in ClipBuilder

Use the normal application at `http://localhost:3000/start`. The frontend runs
on 3000 and backend on 4000 using their normal commands and existing app-local
`.env.local` files. There is no separate owner app or startup mode.

For fake AI with actual local video processing and downloads, set
`FAKE_MODE=true` and `PAID_DEMO_ENABLED=false` in `apps/backend/.env.local`.
No API key or gcloud service is needed. The agent never reads that ignored file.
The frontend has no separate AI setting. Next loads its existing configuration.

From the repository root:

```powershell
corepack pnpm build:contracts
corepack pnpm dev:backend
# In another terminal:
corepack pnpm dev:frontend
```

Backend startup builds and manages the private native worker automatically on
loopback 4200; shutdown drains it. It verifies prepared FFmpeg, yt-dlp, Deno and
Chrome before starting. Missing/changed tools or an occupied port fail with a
fixed prerequisite error. Startup never downloads software or calls YouTube/AI.
The pinned tools already prepared on this workstation live in ignored
`.local-build/tools`. A fresh Windows x64 workstation prepares them once with
`scripts/prepare-local-media.ps1` and `corepack pnpm local:prepare:youtube`.
Chrome must already exist at its documented fixed installation path.

Upload an MP4 or enter a supported YouTube video link. Choose an offered quality
or Best available, then Import. Downloading is real even with fake AI. Access,
regional restrictions and upstream challenges can still prevent a download;
there is no account-cookie/DRM bypass. Saved source reuse checks the existing
bytes before offering a new download. Source masters, drafts and exports stay
under OS Downloads/ClipBuilder (or explicitly chosen Desktop/ClipBuilder),
outside Git. Clearing scratch or deleting a draft preserves its source/exports.

Choose exact manual ranges, independent AI duration bounds and suggestion
count, then process several clips. Review captions, pictures, placement, fonts,
animation, size and video looks; save drafts and export. Fake AI generates
fictional words/moments/pictures and does not establish real AI quality. Native
inspection, cutting, overlays and encoding process actual local bytes.

Real AI uses the same normal backend configuration: `FAKE_MODE=false`,
`PAID_DEMO_ENABLED=true`, `GEMINI_API_KEY` and the existing transfer, image,
paid-project and spend approvals. Only Gemini APIs are used by this local AI
workflow; no Cloud Run, GCS, service account or gcloud service is needed for its
native media operations. No offline AI model/weights are provided. Paid testing
is owner-manual. Hosted deployments keep the existing bounded demo and reject
local editing routes; this change does not deploy anything.

The [agent commands](../../apps/backend/local/AGENT_COMMANDS.md) use the same
backend and protected edit/export coordinator. Private per-run discovery retains
process identity/creation-time checks; the browser never receives its token.
Streaming proxies reject cross-site requests and propagate Range/cancellation.
Runtime records and content-safe worker logs stay in an OS-temp
`clipbuilder-local-runtime-*` folder. Logs are preserved on shutdown; private
capabilities and processing scratch are removed.

Verification is synthetic/fake, paid-off and network-blocked. Real YouTube,
Gemini quality, A/V readability and owner usability remain manual acceptance in
[CL-025](../tickets/CL-025-owner-manual-local-workflow-acceptance.md).
