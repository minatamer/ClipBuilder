# CL-125 — local Linux native resource benchmark

Owner request, 2026-10-28: benchmark 2 CPUs / 8 GiB first, then smaller
allocations without reducing clip quality or making exports painfully slow.
Use synthetic media, fake mode and no paid/provider calls. Dependencies CL-123
and CL-124 are committed; starting worktree/index are clean at `48eb321`.

## Scope and authority

Use the current packaged Linux worker, baked FFmpeg/Chromium and fixed overlay.
Keep production export CRF, preset, thread counts, dimensions, cadence and audio
unchanged. Run profiles sequentially with CPU/memory cgroups, network disabled,
anonymous Docker configuration, no credentials/env-file reads and RAM-backed
scratch. Preserve the normal local app and all retained media. No cloud change,
deployment, live AI, provider spend or push is authorized by this request.

The local Docker VM has approximately 7.56 GiB physical memory: an 8 GiB cgroup
limit is not proof of using a full 8 GiB. Record this limitation and host CPU
context. Compare elapsed time, cgroup memory/CPU, physical scratch with hardlink
deduplication, output size/parameters and decoded video/audio checksums. Separate
fixture generation/verification from export timing. Retain a three-clip batch
where possible. Exercise the 60-second AI-request ceiling and 4K cadence,
not only the earlier tiny UI fixture. Capture bounded failures/OOM honestly.

Start 2 CPU/8 GiB; choose smaller profiles using observed headroom. Use at least
2 CPU/4 GiB and 1 CPU/4 GiB when safe; test 2 GiB only when justified. Reuse fixed
fixtures across profiles. No product quality/limit/architecture changes belong
in this packet. A measured insufficient cap is useful evidence, not permission
to relax rendering correctness. Report absolute latency and relative slowdown;
do not invent the owner's tolerance or imply local hardware proves cloud speed.

The corrected 60-second HD baseline passes at 163.96 seconds / 492 MiB sampled
RAM. The 4K/60 stress case is CPU-bound near the default five-minute response
window despite less than 1 GiB RAM. If it misses that deadline, add a measured
4 CPU/4 GiB control to distinguish CPU need from the earlier 16 GiB proposal.
Use the identical workload/quality; do not change deployment configuration.

## Whole-file allocation and verification

- `scripts/benchmark-hosted-native.mjs`: opt-in deterministic native harness.
- This packet and `docs/tickets/README.md`: authorization, actual checks/status.
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`: narrow benchmark authorization.
- `docs/operations/HOSTED_NATIVE_BENCHMARK.md`: reproducible profiles, results,
  recommendation, remaining capacity/real-AI/release gates.
- Optional exact-path runner under `scripts/` if needed for reproducibility.

Confirmed additional allocation: `scripts/benchmark-hosted-native.ps1` owns
sequential cgroup runs, private coded metadata and exact-container cleanup;
the hosted release preparation guide links the measured recommendation and
does not present the old conservative 4-CPU/16-GiB proposal as measured need.

Pinned esbuild bundles the harness into private scratch. Check syntax/format,
inspect actual metrics and output equivalence, run execute/validate until no
actionable findings, verify owned containers/processes cleanup and unchanged
app health. Do not certify untested worst-case media or live AI quality. Fake
mode verifies native encoding with supplied fictional editing data and no keys;
real analysis/caption/image generation requires keys/live flags/approvals and
owner-only acceptance. Any inherited Git approval is limited to scoped local
staging/commits after a whole-file plan; no push.

## Acceptance

- [x] Requested baseline followed by useful smaller allocations measured.
- [x] Actual production export settings and output fidelity compared.
- [x] Cgroup, RAM scratch, timing and failures reported accurately.
- [x] Recommendation distinguishes measured workload from untested bounds.
- [x] Clean validation, docs and app/owned-resource cleanup checks complete.

## Status

Measurements and local validation complete; scoped commit handoff follows the
[fourteen-file plan](../operations/CL125_126_COMMIT_PLAN.md). The detailed
[report](../operations/HOSTED_NATIVE_BENCHMARK.md) owns exact methods, outcomes
and reproducibility. Full-minute HD: 2 CPU/8 GiB 163.96s, 2 CPU/4 GiB 158.44s,
1 CPU/4 GiB 292.26s, with identical decoded video/audio. Full-minute landscape
4K/60: 2 CPU/8 GiB 387.24s, 2 CPU/4 GiB 408.59s, 4 CPU/4 GiB 292.37s. All
complete at native profile/cadence with all 3,600 frames and matching audio.
The maximum-dimension portrait 12-second case completes in 126.53s with 1.48 GiB
peak RAM. Three different retained 12-second HD clips pass at 2 CPU/4 GiB.

The archived 12-second 4K controls at 8/4 GiB have identical entire MP4 bytes,
all 720 decoded frames have SSIM 1.000000 / PSNR infinity, and audio matches.
Independent full-minute 4K outputs are not bit-identical; do not misrepresent
short-control equality as full-minute bitwise determinism. All fixed quality
settings/geometry/cadence remain unchanged. No successful case has memory/OOM
events or external/provider attempts. Initial aborted/timeout controls are
excluded from sizing conclusions; CL-126/127 fix both confirmed prerequisites.

Recommended processing target: 2 CPU/4 GiB; avoid one CPU. Four CPU/4 GiB is an
optional heavy-4K latency tradeoff with about 43% more allocated CPU seconds.
This is not a drop-in deployment approval: reconcile the unchanged 12 GiB
scratch ceiling, slot/overlay reservations and RAM-backed storage first.
Preserve hosted three-clip behavior, local limits and quality. Full-minute
portrait, five-minute manual cuts, late cuts in 20-minute sources and maximum
retained history are unverified. Real AI/rights/visual/release acceptance still
needs keys/live flags/approvals and the owner. No deployed changes or paid calls.

Execution deviation: two confirmed prerequisite defects were fixed in CL-126
and CL-127 before interpreting capacity results. No source/clip quality, quota,
native time budget or operating configuration was reduced to make tests pass.

V125-final: Meets ticket; No actionable findings on the settled fourteen-file
allocation (including the separately validated prerequisites). Reviewed actual
profile/cgroup metadata and success/failure logs, exact engine identity, output
clocks/geometry/hashes, 720-frame SSIM/PSNR, three retained clips, fake/network
composition, source/privacy boundaries and scoped source checks. Backend and
renderer types, six focused units, ESLint/Prettier, JavaScript/PowerShell syntax,
fresh final Linux artifact and actual native browser/editor/cancel/retry/quota
proof pass. Owned containers are absent; local health and /start return 200
with fake/live-disabled configuration and unchanged frontend ownership.
Maximum workload/scratch reconciliation and owner real-AI/rights/visual/release
checks remain unverified as explicitly documented; they are not benchmark
implementation findings or approval to change cloud settings.
