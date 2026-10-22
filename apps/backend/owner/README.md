# Local owner host

This independent owner runtime is excluded from public `src`, package outputs,
Next routes and Docker contexts. CL-017–018 deliver one source preview,
manual ranges alongside duration-controlled fake discovery, exact selected-cut
portrait exports, private loopback access and temporary workspace cleanup.
AI is simulated. Later tickets add several clips,
saved drafts, editing, CLI access and downloaded-source reuse.

From the repository root, prepare the free Windows x64 FFmpeg 9.0.2 portable
tools once, then build:

```powershell
./scripts/owner-prepare-tools.ps1
corepack pnpm build:contracts
corepack pnpm owner:build
$env:FAKE_MODE = 'true'
$env:PAID_DEMO_ENABLED = 'false'
corepack pnpm owner:start
```

`PAID_DEMO_ENABLED=fake` is invalid; paid-off is exactly `false`. This entrypoint
does not read any env file. It rejects missing/conflicting operating settings,
missing or changed native tools, and occupied ports. Tool preparation is a
separate explicit download; startup and rendering never download executables.
The prepare script verifies the pinned archive checksum; startup verifies both
executable checksums. The portable tools remain ignored under `.owner-build`.
There is no global install or PATH change. Builds are
[published by Gyan](https://www.gyan.dev/ffmpeg/builds/), a Windows distributor
[linked by FFmpeg](https://ffmpeg.org/download.html), under GPLv3.

Use `http://localhost:4100/`. The private worker binds only to
`127.0.0.1:4200`. Canonical visitor 3000/4000 services are independent. No ADC,
gcloud, API keys, cloud access, model weights or provider SDK composition is
needed here. Real provider AI is unavailable in this owner composition; fake
results do not establish AI quality. Actual native encoding is local and API-free.

The supervisor writes a private capability state and content-free process
identities/logs beneath an OS temporary runtime directory. It prints only the
URL and log directory. Never print or copy `state.json`; it contains private
per-run capabilities. Follow root AGENTS lifecycle rules for hidden background
launch, readiness and cleanup. Stop the supervisor gracefully with Ctrl+C; it
drains host/worker operations before removing owned processing copies. A failed
cleanup reports recovery required instead of authorizing a new launch.

Sources are limited to supported SDR MP4 codecs, 60 minutes, 10 GiB, 4K/60fps;
one source and one heavy operation are admitted. Scratch reservations retain
10 GiB free, with a 20 GiB scratch ceiling. Export is H.264/AAC,
1080×1920/30fps, at most 1 GiB. Native validation rejects HDR/high-bit-depth
inputs and malformed/oversized sources. The workspace expires after two hours;
clear, expiry and shutdown remove only owned OS-temp copies. Saved source
masters, retained demo assets, diagnostic captures, private logs, drafts and
exports are never scratch cleanup targets. Saved-source/draft/export features
are introduced by later tickets; no Downloads directory is created by CL-017.

The authenticated local API accepts `POST /api/workspace/{id}/analysis` with
source/policy revisions, at most ten `{id,startMs,endMs}` rows, an independent
`aiDuration:{minMs,maxMs}` and explicit `manualOnly`. Endpoints are integer
milliseconds and `[start,end)`. Manual ranges last 1–300 seconds; AI limits are
10–60 seconds, including equal bounds containing a 30fps duration. Invalid,
out-of-source or stale revisions dispatch no AI/native work. An explicit run
transcribes once, then selects at most once (skipped for manual-only, no words,
or insufficient source duration). Matching AI/manual cuts link evidence without
consuming one of four additional suggestion slots. No automatic retries.

`GET /api/workspace/{id}/analysis` restores the last completed in-memory result
without AI work. This is running-session state, not a diagnostic capture reader
or durable replay. `POST /api/workspace/{id}/portrait` requires the returned
`analysisId`, `momentId` and `policyRevision`; stale selections fail before native
dispatch. The worker receives a bounded frame range plus source fingerprint,
never arbitrary paths. Exact 30/60-second cuts contain 900/1,800 frames. Public
payloads and default 10–60-second candidate reconciliation are unchanged.

Focused offline checks, with shared pre-import fake/paid-off environment and
external-network interception:

```text
corepack pnpm owner:test
corepack pnpm owner:typecheck
corepack pnpm owner:proof
corepack pnpm owner:build
corepack pnpm build
corepack pnpm owner:artifacts
```

`owner:proof` is opt-in and uses generated color/tone/silence video, never retained
or owner media. It verifies exact frames, fractional/source endpoints, VFR and
nonzero video/audio offsets, pixel transitions and silent audio. It really
encodes, probes and decodes the local MP4, then closes
listeners and deletes its temporary files. The required general gates are in
root AGENTS. Human real-media/visual quality and later external compatibility
remain in CL-025; no agent-paid or real YouTube test is authorized.
