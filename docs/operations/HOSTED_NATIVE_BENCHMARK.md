# Offline native capacity benchmark — CL-125

CL-130 follow-up, 2026-10-29: the owner now targets **2 CPUs / 8 GiB** with a
bounded 5376-MiB RAM volume and actual retained-byte admission. The 4-GiB
processing recommendation and 12-GiB scratch blocker below describe the
historical benchmark outcome. They are not the current resource contract.
See [current release preparation](HOSTED_EDITOR_RELEASE_PREPARATION.md#current-resource-contract--cl-130-2026-10-29)
and [CL-130](../tickets/CL-130-hosted-eight-gib-scratch-budget.md) for actual
implementation/verification and remaining owner/hosted acceptance gates.

**Recommended processing target: 2 vCPU / 4 GiB for this low-traffic demo.**
Halving RAM preserves the output profile and comparable export speed in the
measured workloads. One CPU makes the full-minute HD case 84.5% slower. Four
CPUs improve the demanding 4K-source case, but need about 43% more allocated CPU
seconds for that speedup; keep them an optional latency tradeoff, not the base
allocation. No measured native working-set need for 8 or 16 GiB was found.

This is a processing recommendation, **not a ready-to-apply deployment change**.
The unchanged 12 GiB scratch ceiling/reservations do not fit a 4 GiB RAM-backed
filesystem. Reconcile hosted scratch admission and bounded storage first,
preserving the three-clip trial, local limits and source/export quality. Nothing
was deployed or changed in cloud resources by this benchmark.

## Method

2026-10-28, rebuilt current packaged backend/worker after the CL-126 crop pixel
aspect correction described below. Overlay, encoding and quality settings stay
unchanged across all comparable profiles. The CL-124 frontend IP extraction fix
does not affect this backend artifact. Local Linux/amd64 Docker engine
29.8.1, WSL2 kernel 6.18.33.2, 12 logical host CPUs and 8,118,738,944 bytes total
VM memory (7.56 GiB). The requested 8 GiB cgroup cap exceeds physical VM RAM;
results below that physical ceiling remain useful, but this does not certify a
full 8 GiB stress load or predict exact Cloud Run latency.

Pinned esbuild bundles `scripts/benchmark-hosted-native.mjs` with packages
external into private scratch, mounted at `/app/dist/benchmark.mjs` in the local
backend image. No source fixtures, probe or configuration ship in an app image.
The harness imports the deterministic environment before application modules,
disables paid/live flags, uses no keys, permits only loopback sockets/fetch and
runs with Docker networking disabled. Only baked `/usr/bin/ffmpeg`, ffprobe and
Chromium plus `/app/media/dist/editing-worker.js` and its fixed overlay are used.
There is no UI test browser or provider adapter in the measured process tree.
The normal Express control API is also outside this native-only measurement;
retain headroom for its process, uploads and session data.

Generate three fixed 61-second moving `testsrc2` H.264/AAC sources with sine
audio, constrained below the public 500 MiB upload limit. Fixture generation
uses four CPUs and is excluded from export timings. Main HD and landscape 4K
cuts start one second into the source and last 60 seconds; portrait, quality
controls and retained-batch cuts last 12 seconds. Cases: 1920x1080 at 30 fps,
3840x2160 at 60 fps, and 2160x3840 at 60 fps. Production exports are 608x1080/30,
1216x2160/60 and 2160x3840/60 respectively. Include 120 fictional caption words
per minute with pop animation, a fixed styled text layer, an animated
synthetic picture, a vivid filter and three focus shots. This is native encoding
with supplied fictional editing data; it does not measure AI/provider waiting
or real-world AI quality. Noise/complexity in actual camera footage can differ.

Each call includes uncached native playback-preview preparation, Chromium
overlay rasterization and final encoding. Fixed production settings remain
libx264, veryfast, CRF 18, yuv420p, two encoding threads, source height/cadence,
AAC 160 kb/s, 48 kHz stereo. No low-quality mode is substituted. The final
encoder uses original source pixels, never the lower-quality playback cache.
Output checks inspect codecs, geometry, rate and decoded frame count/audio,
hash decoded video and PCM streams and verify the source was unmodified.
Verification time is excluded from the export latency.

The runner applies CPU and RAM caps, disables swap, limits processes to 512,
uses a read-only root and network none, 256 MiB shared memory and writable tmpfs
for `/tmp` and home. Source copies, preview, raster and exports reside in tmpfs
and count toward cgroup RAM. Read-only fixture bytes are bound from private
scratch; nothing mounts credentials or owner media. Main single-case profiles
are independent. The retained-batch check uses one workspace/source and three
different 12-second cuts, retaining all preceding previews/exports/assets. An
initial multi-case run also retains earlier outputs across source replacement.
Native batch measurements do not exercise backend quota admission or certify
its scratch guard; the separate existing UI proof covers quota behavior.

Poll cgroup memory and filesystem allocation every 250 ms. tmpfs allocated-block
counters naturally count PNG hardlinks once; no recursive frame scan adds CPU
load. Record monitor/RPC process CPU separately, cgroup CPU usage/throttling,
sampled peak memory/scratch, lifetime memory peak and memory/OOM events. Stage
times are approximate filesystem observations within 250 ms. Docker state is
captured before exact-container cleanup even on failure. Profiles run one at a
time against identical fixtures and native engine, with no provider calls.

An initial pilot was discarded after observing CPU-heavy recursive scratch
scanning. None of its latency/memory figures belong in the results. The final
harness uses constant-cost filesystem counters and records instrumentation CPU.

The original CL-123 worker then exposed a real Linux bug: final encoding froze
at the first zoom, with low memory/idle CPU, and the request failed after five
minutes. A 12-second diagnostic froze at frame 120 / 4.01 seconds. One-thread
complex filtering, init-scale evaluation and removing the color filter failed
to fix it. Inserting `setsar=1` before the existing fixed scale completed all
360 frames in 12.6 seconds with the same command. CL-126 applies that metadata
normalization, retaining post-scale normalization and all pixel/crop/codec
settings. The rebuilt packaged worker completes the full short flow in 31.41
seconds, with expected 608x1080/30, 360 frames, 48 kHz stereo AAC, decoded hashes,
unchanged source and zero external/provider attempts. All capacity comparisons
below use this corrected native engine; original-stall figures are excluded.

The long 4K controls exposed a second defect, confirmed on four CPUs by
`UND_ERR_HEADERS_TIMEOUT` at 300.56 seconds despite only 884.1 MiB sampled peak
RAM. The caller explicitly allowed 11 minutes, but default fetch imposed a
shorter headers cutoff. CL-127 uses bounded loopback HTTP with the existing
explicit deadline, keeps the native 10-minute budget and cancel/reap protocol,
and adds no retry or provider capability. Six focused tests cover delayed
headers, aborted-request socket closure, truncated/oversized responses,
external/invalid/oversized/pre-aborted zero dispatch, no redirects and retaining
the media RPC until explicit cancellation has reaped its work. Backend types,
scoped lint/format and the actual packaged Linux upload/editor/export/cancel/
retry/quota/cleanup proof pass. The image's worker and overlay SHA-256 hashes
are identical across the transport-only change. Earlier completed HD numbers
remain valid; completed long 4K results use the corrected default transport.
Earlier old-client failures at 300.82 / 300.56 seconds are red transport evidence,
not a minimum CPU/RAM verdict. The 387-second completed export is a real
regression check beyond that previous cutoff.

## Reproduction

Use cached pinned dependencies from the repository root. Bundle with:

```text
corepack pnpm exec esbuild scripts/benchmark-hosted-native.mjs --bundle --platform=node --format=esm --packages=external --outfile=<private-scratch>/benchmark.mjs
```

Create an empty private `fixtures` folder. With the existing local backend image,
run the bundle's `generate` command in a non-root, read-only, network-none Docker
container, mounting the bundle at `/app/dist/benchmark.mjs` read-only and fixtures
at `/fixtures` writable. Do not mount the repository or credentials. Allow 4 CPUs,
4 GiB, no swap and bounded temporary scratch; fixture generation is not a profile.
Then use PowerShell `scripts/benchmark-hosted-native.ps1` with explicit
`-DockerHost`, anonymous `-DockerConfig`, `-ScratchDirectory`, local `-Image` and
`-Profile 2cpu8g`. Repeat smaller measured profiles sequentially using the same
immutable inputs. Optional `-Case hd30`, `landscape4k60` or `portrait4k60` narrows
a run. The runner records exact cgroup settings, exit and Docker OOM state and
removes only its unique owned container. Do not run profiles simultaneously.

Use `-DurationSeconds 12 -ClipCount 3 -Case hd30` for the retained three-clip
check. Use `-DurationSeconds 12 -Case landscape4k60 -Archive` at each RAM cap for
the direct quality control. The latter saves only generated synthetic MP4s in
new private folders after export timing, never in Git or application images.
Compare decoded hashes and FFmpeg SSIM/PSNR over all 720 control frames.

## Results and recommendation

| Allocation | Source / output duration | Export time including preview/overlay | Sampled peak RAM | Outcome |
| --- | --- | --- | --- | --- |
| 2 CPU / 8 GiB | HD/30, 60 seconds | 163.96 s | 491.6 MiB | Complete, decoded streams verified |
| 2 CPU / 4 GiB | HD/30, 60 seconds | 158.44 s | 480.0 MiB | Complete, decoded video/audio identical to 8 GiB |
| 1 CPU / 4 GiB | HD/30, 60 seconds | 292.26 s | 470.5 MiB | Complete, decoded video/audio identical to both 2-CPU cases |
| 2 CPU / 8 GiB | Landscape 4K/60, 60 seconds | 387.24 s | 894.4 MiB | Complete, all 3,600 frames/audio verified |
| 2 CPU / 4 GiB | Landscape 4K/60, 60 seconds | 408.59 s | 901.3 MiB | Complete, unchanged profile and all frames/audio verified |
| 4 CPU / 4 GiB | Landscape 4K/60, 60 seconds | 292.37 s | 901.8 MiB | Complete, unchanged profile and all frames/audio verified |
| 4 CPU / 4 GiB | Portrait 4K/60, 12 seconds | 126.53 s | 1,517.4 MiB | Complete at maximum frame dimensions, all 720 frames verified |
| 2 CPU / 4 GiB | Three retained HD/30 cuts, 12 seconds each | 43.36 + 42.11 + 39.67 s | 516.4 MiB | All three outputs retained and verified |

The successful HD case spends 38.80 seconds in preview preparation, 46.62 in
overlay preparation and 78.55 in final encoding. Its 2-CPU cgroup uses 274.20 CPU
seconds; the monitor/RPC process uses 1.13 CPU seconds (0.69% of one CPU over
elapsed time). Peak tmpfs allocation is 132.5 MiB. These figures measure actual
encoding, not a fixture-only or browser-only simulation.

The 4 GiB HD result is within single-run variation of the 8 GiB result: no
observed slowdown and exactly the same 17,547,129-byte export, video frames and
decoded PCM hash. It uses 267.75 CPU seconds, 132.5 MiB tmpfs peak and 1.02
instrumentation CPU seconds. Its lifetime cgroup peak is 480.8 MiB. Both have
zero memory/OOM events. These are single runs, not a statistical latency SLA.

One CPU takes 84.5% longer than two CPUs/4 GiB for this same full-minute HD
workload. Preview / raster / encoding stages take 76.55 / 60.66 / 155.06 seconds;
cgroup CPU consumption is 286.88 seconds. Its nearly five-minute wait is a
latency concern even after the separate client cutoff is fixed. Do not recommend
one CPU based solely on its low RAM footprint. The portrait case peaks at about
1.48 GiB before adding the control API, pending uploads and larger retained
history. Two GiB would leave little headroom and would not resolve the existing
scratch reservation mismatch, so a 2 GiB deployment candidate was not pursued.

After correcting the transport, 2 CPU/8 GiB finishes the same 60-second 4K-source
case in 387.24 seconds. It preserves 1216x2160/60, all 3,600 video frames, exact
duration and stereo 48 kHz AAC. Preview / raster / encoding take 42.08 / 63.38 /
281.78 seconds; cgroup CPU is 707.72 seconds, instrumentation 2.37 seconds and
peak tmpfs 346.6 MiB. All memory/OOM counters remain zero. The apparent earlier
five-minute capacity boundary was a client defect.

At 4 GiB the same 4K case takes 408.59 seconds (5.5% above the 8 GiB run), with
51.31 / 55.89 / 301.40 seconds in preview / raster / encoding, 754.42 CPU seconds
and the same 346.6 MiB peak tmpfs. No memory pressure/OOM counter is raised.
HD is slightly faster at 4 GiB while 4K is slightly slower: single local runs
do not establish a systematic RAM-related slowdown or a Cloud Run latency SLA.

Four CPUs/4 GiB reduce that 4K elapsed time 28.4%, to 292.37 seconds. Its stages
are 44.08 / 47.60 / 200.70 seconds and actual cgroup CPU is 719.37 seconds.
Allocated CPU time is 4 x 292.37 = 1,169.48 vCPU-seconds versus 2 x 408.59 =
817.19 at two CPUs, a 43.1% increase. This is a capacity/cost proxy, not a bill
or a price estimate. It supports choosing two CPUs for the cost-conscious base
profile, with four CPUs available if this heavy-case latency is more important.

All timings include uncached preview preparation. The normal editing flow can
already have that preview cached before Export. Raster plus encoding at two
CPUs/4 GiB totals about 120 seconds for HD and 357 seconds for the 4K-source case;
those sums are not separate cached-path timing measurements. Full 4K remains
expensive; reducing RAM does not make that CPU-heavy work disappear.

The retained batch peaks at 516.4 MiB sampled (523.7 MiB lifetime), with three
playbacks/exports retained from one source. The maximum-dimension portrait test
peaks at 1.48 GiB sampled and 1.49 GiB lifetime, with 306.4 MiB peak tmpfs. It
tests 12 seconds, not a full-minute portrait claim. All successful cases have
zero memory/OOM events and no external/provider attempts.

## Quality evidence

Decoded video and PCM audio from the full-minute HD exports are byte-identical
across 1 CPU/4 GiB, 2 CPU/4 GiB and 2 CPU/8 GiB. The archived 12-second edited 4K
control also produces the exact same MP4 bytes at 2 CPU/8 GiB and 2 CPU/4 GiB:
SHA-256 `fe3f45c22847a56e135f3f9631428efb4a753862538aa96bb47ad47c2e90b83e`.
All 720 decoded control frames have SSIM 1.000000 and PSNR infinity. Audio hashes
match. This verifies no quality downgrade in those direct comparisons.

The independent full-minute 4K runs are not bit-identical. All preserve the
fixed CRF/preset, original height/cadence, 3,600 output frames, exact duration
and matching decoded audio; no adaptive quality setting changes by allocation.
Do not claim full-minute 4K bitwise determinism from the short quality control.
No real-AI/content/editorial quality acceptance is inferred.

## Verification and handoff

Both prerequisite fixes pass their actual Linux regressions. Six focused
backend tests, backend/renderer typechecks, scoped lint/format, JavaScript syntax
and PowerShell parsing pass. The final current-source Linux artifact is rebuilt
from the allowlisted secret-free context; the current native browser/editor/
export/cancellation/retry/quota/cleanup proof passes. Native worker/overlay
hashes remain unchanged across the transport-only artifact refresh. All owned
probe containers are removed; the normal frontend and backend remain healthy
in fake mode, with live flags disabled. No cloud setting, API key, owner media,
real provider request, deployment or push was touched. Scoped local commits
follow the [whole-file allocation](CL125_126_COMMIT_PLAN.md).

## Limits of this evidence

These tests cover the 60-second AI-request ceiling. The shared manual-range
contract still permits 300-second clips, and inputs may run up to 20 minutes;
those worst-case durations and late source cuts are not yet benchmarked. This
packet does not narrow that contract or certify every accepted media file.
The portrait maximum geometry was tested for 12 seconds, not its full-minute
or five-minute duration. Full source-byte, three-full-length-clip and maximum
export-history combinations remain outside this evidence.
The 12 GiB hosted scratch ceiling and 2 GiB overlay reservation remain unchanged.
Less RAM cannot be certified for every permitted scratch state from representative
exports alone. Explicit capacity/headroom and scratch-admission decisions remain
necessary before changing deployment settings. Real AI still needs provider
keys, live flags, approvals and owner-run upload/export acceptance. No API-free
local model/weights are introduced or claimed verified here.

In particular, `ClipBatch.reserve` budgets the source plus 384 MiB for each
retained playback/export slot and 2 GiB for raster frames. With a 500 MiB source,
admitting three fresh clips reserves about 4.74 GiB; the first extra export slot
raises that to about 5.11 GiB, before the separate 256 MiB free-space margin.
Export history increases it further. `hosted-runtime.ts` compares this to its
12 GiB scratch ceiling and filesystem free space, not cgroup RAM. The benchmark's
6 GiB `/tmp` volume intentionally retains that distinction. A 4 GiB memory cap
does not automatically reduce those reservations or create safe exhaustion
behavior. This packet does not silently change hosted/local limits to make a
smaller allocation appear ready. Bound hosted RAM scratch and reconcile its
reservation policy before approving a reduced deployment; preserve local limits.
These containers had steady CPU throughout. The background-processing CPU/
lifecycle requirement remains a separate deployment gate; these local timings
do not test the existing hosted CPU-throttling behavior or predict its bill.
