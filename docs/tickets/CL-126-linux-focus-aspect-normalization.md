# CL-126 — normalize dynamic crop aspect before Linux scaling

Necessary prerequisite discovered during the owner's CL-125 offline resource
benchmark. Pause CL-125 measurements while fixing the confirmed Linux export
stall; no resource increase can fix a sleeping encoder. Scope is one pixel
aspect metadata normalization in the existing native focus filter, current
Linux build/regression checks and normal local worker reload. No encoding
quality, resolution, cadence, crop coordinates, motion, provider, privacy,
deployment or configuration change is included. CL-123/124 are committed.

## Confirmed red / isolated green

The current packaged Debian FFmpeg 5.1.9 worker stalls at the first change of
crop dimensions: a 60-second HD cut fails at the transport's five-minute header
timeout despite a 480 MiB memory peak and no OOM. A 12-second control freezes
at frame 120 / 4.01 seconds, exactly its first zoom. Native CPU falls idle.
One-thread complex filtering, init evaluation and removing the color filter
do not fix it. The identical command with `setsar=1` between crop and scale
completes all 360 frames in 12.6 seconds. The existing post-scale normalization
stays. This changes metadata before scaling, not source pixels, crop rectangles
or fixed output geometry. Synthetic debug artifacts remain outside Git.

## Whole-file allocation / checks

- `apps/renderer/local/focus-filter.ts`: normalize pixel aspect before scaling.
- This packet, canonical index and source of truth: necessary prerequisite,
  evidence, local-only authorization and remaining gates.
- CL-125 harness/report: actual red/green regression and rebuilt image identity;
  those whole files remain in CL-125's later allocation.

Verify actual packaged Linux 12-second dynamic zoom output, then full-minute
HD/4K benchmarks with unchanged settings. Confirm expected geometry, cadence,
decoded frame count/audio and no provider calls; test smaller profiles on this
same corrected image and compare decoded checksums. Run focused format/lint and
renderer typecheck. Rebuild/reload the normal backend's worker with verified
process ownership; preserve frontend, media and owner-managed configuration.
Use execute/validate to no actionable findings. No static implementation-mirror
test is necessary: the actual native regression is the functional proof.

## Acceptance / status

- [x] Original stall and isolated metadata-only correction reproduced.
- [x] Corrected source and current Linux artifact pass native regression.
- [x] Focused checks, normal worker reload and clean validation complete.

Completed prerequisite. Actual rebuilt packaged worker exports all 360 frames
at 608x1080/30 with stereo 48 kHz AAC in 31.41 seconds including preview and
overlay (12.20 seconds final encoding); decoded streams and unchanged source
verified. No external attempts/provider calls/OOM. Peak RAM 496 MiB sampled,
501 MiB cgroup lifetime. Focused ESLint/Prettier and renderer typecheck pass.

Normal backend tree (10 processes, ports 4000/4200) was identified and stopped;
hidden launcher has no graceful window. Forced tree cleanup plus creation-time
and two-port stabilization checks passed. The documented normal startup rebuilt
the worker; new launcher 13120, API 3708, internal worker 23396 are owned/healthy.
Frontend PID 14992 stayed unchanged; /start and backend health return 200, fake
mode and live-disabled public config verified. Logs remain in the existing
private runtime folder as `backend-cl126.stdout.log` and `.stderr.log`.

V126: Meets ticket; No actionable findings on the one-line metadata correction,
its isolated failed controls, actual packaged green regression, scoped checks
and owned reload. All fixed encoding/crop coordinates are unchanged. Full-minute
profiles resume under CL-125; they are not prerequisite completion evidence.
Provider/real-media/cloud/release acceptance remains owner-only. Local build
used the standard cached dependency layers after a network-none build could not
reuse its fetch layer; no credentials or provider request were involved.
