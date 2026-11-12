# CL-292 — Export latency and progress diagnosis

Status: current-export monitoring complete, 2026-11-12. The existing second
attempt succeeded. No timeout implementation or export retry by the agent.
Depends on the shared local export pipeline and CL-286 Glass scene.

## Owner request

Check a long-running export and establish whether it is progressing. Preserve
the current run, saved edits, media, other clips and Voyagenda. Do not restart,
cancel, resubmit, change configuration, stage, commit or push.

Owner follow-up: keep the deployed export deadline at ten minutes. Monitor the
already-running attempt; only if it fails again at the deadline, double the
local export budget to twenty minutes, keeping worker and transport deadlines
consistent. Do not change the current attempt or automatically retry it.

## Observed evidence

The existing export for the fourth clip failed after 600,640 ms. Durable backend
diagnostics report `media_unavailable`; the worker applies a fixed ten-minute
deadline to clip operations. A second request was already running during the
inspection; the agent did not trigger either request.

The current 32.3-second clip uses Glass captions and a native cadence of roughly
23.976 fps, producing 774 body frames. Its prepared scene was approximately
76.39 MiB. Scratch metadata showed body frames increasing from 158 to 220 to
405, with fresh timestamps; the render is advancing rather than idle. At the
last observation (18:32:49 UTC), state remained rendering, with two recorded
render attempts, zero completed outputs and no current error. Frame count is
only the raster stage, not an end-to-end progress percentage or ETA.

The Glass path prepares a source scene, rasterizes scene-backed frames, then
encodes and validates the output. The first attempt's exact inner-stage failure
is not exposed by the current diagnostics. Its elapsed time matches the fixed
deadline, but this does not establish whether the earlier attempt was making
progress at that deadline. The observed second attempt is not proof that the
first attempt was healthy.

### Completed second attempt

The worker reported success after 417,502 ms (6m 57.5s); the batch completed
after 417,505 ms. A final status read confirmed ready, one completed output,
two total render attempts, no current error and no active work. Scratch overlay
directories were cleaned by the normal renderer. The owner-authorized condition
for increasing the local timeout did not occur, so both timeout policies remain
unchanged. No renderer/backend restart, resubmission or provider request.

## Follow-up acceptance scope

Later owner authorization (CL-294): the full-HD Clip 6 Glass export reached its
native deadline after 600,897 ms while frames continued advancing. This meets
the condition to double only local clip-export time to twenty minutes. CL-294
owns the trusted process flag, matched RPC grace, fake transport checks and
explicit Clip 6 retry. Deployed initially remained ten minutes; the owner's
later CL-294 approval sets its clip-export budget to fifteen minutes, with
one-minute RPC cleanup grace. Other operation budgets remain intact.

- Reproduce slow scene/frame behavior with bounded generated silent media and
  fake/paid-off composition, without an owner clip or provider call.
- Measure stage timings and identify the cause before changing budgets. Retain
  bounded resource/cancellation/cleanup behavior and explicit retry semantics.
- Surface genuine export stage/progress through shared loading components;
  distinguish rendering, encoding, validation, failure and completion. Never
  invent progress or an ETA, or add automatic retries.
- Preserve preview/export clocks, native cadence, Glass optics, saved state,
  visual ordering, and all existing security boundaries.

These performance/progress follow-ups are recorded for later direction and were
not implemented as part of monitoring. No fixes are claimed by this packet.
Inspection used read-only local
status/logs, process metadata and scratch frame counts. It required no API keys,
AI requests, new exports, external browser interaction or test execution.
