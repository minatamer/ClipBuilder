# Local owner host

This independent owner runtime is excluded from public `src`, package outputs,
Next routes and Docker contexts. CL-017–019 deliver one source preview,
manual ranges alongside duration-controlled fake discovery, a bounded list of
automatic clip edits, private loopback access and temporary workspace cleanup.
AI is simulated; native video processing is real. Saved drafts, caption/picture
editing, CLI access and downloaded-source reuse arrive in later tickets.

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

Automatic captions/pictures also require existing Chrome at
`C:/Program Files/Google/Chrome/Application/chrome.exe`. The worker opens a fresh
headless profile to rasterize the fixed local overlay. Startup checks that the
executable and built overlay exist; it never installs or downloads a browser.
See the [worker guide](../../renderer/owner/README.md) for that boundary.

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
one source and one heavy operation are admitted. Up to ten selected clips share
that source and analysis. Native work runs serially; selecting several clips
does not start simultaneous encodes. Whole-action scratch admission reserves
384 MiB per normalized clip/output and 2 GiB for overlay frames within a 20 GiB
ceiling, preserving another 10 GiB free. Batch exports are H.264/AAC,
1080×1920/30fps, capped at their 384 MiB reservation and the general 1 GiB output
limit. Native validation rejects HDR/high-bit-depth inputs and
malformed/oversized sources. The workspace expires after two hours; active work
defers expiry. Clear and shutdown drain owned work and streams before removing
only owned OS-temp copies. Saved source
masters, retained demo assets, diagnostic captures, private logs, drafts and
exports are never scratch cleanup targets. Persistent source/draft/export
management is introduced by later tickets; this slice creates no Downloads
library. Browser downloads are explicit and remain outside workspace cleanup.

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
or durable replay. The original single-cut `POST /api/workspace/{id}/portrait`
remains available for focused range checks. The worker receives a bounded frame
range plus source fingerprint, never arbitrary paths. Exact 30/60-second cuts
contain 900/1,800 frames. Public payloads and default 10–60-second candidate
reconciliation are unchanged.

`POST /api/workspace/{id}/clips` accepts `operationId`, `analysisId`,
`sourceRevision`, `policyRevision` and one to ten distinct `momentIds` from the
completed analysis. Each stable clip ID owns its immutable automatic base,
validated words/cut, asset references, edit revision and separate output
revisions. The current edit revision is zero; mutable editor documents arrive
in CL-020. Admission checks the entire selection and disk upper bound before
starting any work. At most one simulated plan and three simulated picture
attempts are allowed per distinct clip; source transcription/discovery are
reused. The current fake planner creates one colored placeholder when cues
exist, with no real AI calls. There are no automatic retries.

`GET /api/workspace/{id}/clips` reads progress and completed bundles without
dispatch. Matching operation IDs/payloads are idempotent; conflicting payloads
or stale revisions are rejected. A new explicit selection action may resume a
canceled clip that never started preparation, without repeating completed
siblings. A started failure is not silently retried. The in-memory work list
admits at most 200 explicit operations and 20 output revisions per clip.

Use `POST /api/workspace/{id}/clips/{clipId}/cancel` for one clip or
`POST /api/workspace/{id}/clips/cancel` for all pending clips. Queued cancellation
dispatches nothing. Running cancellation remains `canceling` until the worker
drains. A failed/canceled attempt leaves the source, sibling bundles and earlier
validated outputs usable. Workspace clear is unavailable during active work;
shutdown cancels and drains it.

`POST /api/workspace/{id}/clips/{clipId}/render` accepts a fresh `operationId`
and the current `expectedRevision` for an explicit local re-export. It reuses
the immutable base and normalized selected material with zero AI calls. Output
files have distinct revisions; earlier exports are not overwritten.
`GET /api/workspace/{id}/clips/{clipId}/output/{revision}` downloads a published
revision. The clip's `/source` route and workspace `/assets/{assetId}` route
serve only admitted material for review. Completed clips remain reviewable
while the next clip runs. Reloading restores the running session without
submitting another processing action; restarting the app does not restore
these ephemeral bundles.

Focused offline checks, with shared pre-import fake/paid-off environment and
external-network interception:

```text
corepack pnpm owner:test
corepack pnpm owner:typecheck
corepack pnpm owner:build
corepack pnpm owner:proof
corepack pnpm build
corepack pnpm owner:artifacts
```

`owner:proof` is opt-in and uses generated color/tone/silence video, never retained
or owner media. Build first: the multi-clip proof needs the fixed overlay bundle,
existing Chrome and pinned native tools. It checks exact frames,
fractional/source endpoints, VFR and nonzero video/audio offsets, pixel
transitions, silent audio, three isolated clip bundles and deterministic
re-export. It really encodes, probes and decodes local MP4s, then drains owned
children/listeners and deletes its temporary files. The required general gates are in
root AGENTS. Human real-media/visual quality and later external compatibility
remain in CL-025; no agent-paid or real YouTube test is authorized.
