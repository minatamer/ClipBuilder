# CL-127 — honor the native worker's intended response deadline

Necessary prerequisite discovered during CL-125's authorized fake/no-key native
benchmark, after CL-126. The 4 CPU/4 GiB full-minute 4K control fails at 300.56
seconds with `UND_ERR_HEADERS_TIMEOUT`, no OOM and 884 MiB sampled peak RAM.
The existing worker caller explicitly allows 11 minutes and the native worker
10 minutes, but default fetch imposes an earlier five-minute headers deadline.
This prevents measuring completion and causes premature production failures.

Pause CL-125 comparisons for this narrow transport correction. Preserve the
actual 10/11-minute worker/caller limits, cancellation/reaping, explicit retry,
quality, provider settings and every local/hosted quota. No longer native job
budget, automatic retry, dependency install, cloud change or paid call belongs
here. Both observed five-minute failures remain historical red evidence, not
proof that more memory/CPU is required.

## Whole-file allocation / checks

- `apps/backend/local/worker-transport.ts`: bounded loopback HTTP transport with
  the caller's explicit abort deadline; no implicit five-minute headers cutoff.
- `apps/backend/local/worker-port.ts`: default to this transport, retaining
  injected fake transports and all result/cancel/progress behavior.
- `apps/backend/local/worker-transport.test.ts`: actual loopback success,
  delayed headers, byte bounds, cancellation and no external dispatch/redirect.
- This packet, canonical index, source of truth and hosted benchmark report:
  actual scope/evidence; shared docs remain in the final benchmark allocation.

Import no provider/config reader and start no socket on import. Accept only
the fixed HTTP loopback worker routes, bounded JSON request/response bodies and
GET/POST. Never log authorization, payloads or URLs. Close request sockets on
failure/abort without leaking listeners or timers. Keep a media RPC open until
the existing cancel/reap path returns; do not replace the caller's external
cancellation protocol. Reuse the same response-byte constant in the port parser.

Run the focused deterministic unit suite, backend typecheck and scoped
lint/format. Confirm normal tsx reload and owned worker replacement with app
health/fake flags preserved. Rebuild the secret-free current Linux image; resume
CL-125 on that artifact and verify an actual >300-second export finishes (or
reports the true native limit) with identical quality settings. Use execute /
validate until no actionable findings; no owner/provider/release acceptance is
implied by this local prerequisite.

## Acceptance / status

- [x] Actual premature deadline is confirmed by the native transport error code.
- [x] Bounded transport and focused safety/cancellation tests pass.
- [x] Current Linux long export and normal app reload pass.
- [x] Final source artifact and clean validation complete.

Six focused tests pass (2.68s), including actual socket closure on abort and
truncated-body rejection; backend types and scoped lint/format pass. The first
oversized-body test caught a response-end race in the initial helper; immediate
rejection before destroying the request resolves it. The existing actual Linux
upload/editor/caption/picture/filter/export/cancel/retry/quota/expiry/exit proof
passes with the new default transport and zero external attempts. Fake provider
counts remain exactly transcribe 1, caption 1, select 0, plan 1, image 0; native
inspect 1, preview 1, clip 4 including cancellation.

The corrected long Linux 4K/60 export completes after 387.24 seconds, beyond
the old cutoff, with 3,600 frames at 1216x2160, stereo 48 kHz AAC, decoded hashes
and unchanged source verified. Peak RAM is 894.4 MiB, with no OOM/provider calls.
Worker and overlay binary hashes are identical before/after the transport-only
image change. Normal tsx reload reaped the prior API/worker; frontend PID 14992,
fake mode, live-disabled flags and health remain preserved. Final artifact
refresh includes the harmless valid-port edge correction (canonical port 80
is accepted as well as explicit ports) and the added truncated-response test.

All media is generated synthetic data and all AI/provider paths remain fake/
paid-off; actual AI quality and release acceptance stay owner-only.

V127-final: Meets ticket; No actionable findings on the combined worktree
transport, result bound reuse and six focused tests. The final current-source
secret-free Linux artifact rebuild and fresh native browser/editor/export/
cancellation/retry/quota/cleanup proof pass with unchanged exact fake/native
call counts. Its worker/overlay hashes match the measured engine. Scoping,
dependency direction, byte/deadline bounds, cancellation/socket cleanup,
default-transport wiring and zero provider configuration were reviewed.
All owned containers are gone; normal backend/frontend readiness is 200,
frontend PID 14992 is preserved, and fake/live-disabled configuration is intact.
No live/provider/cloud/release gate is waived. Local commits follow the plan.
