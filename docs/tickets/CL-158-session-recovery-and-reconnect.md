# CL-158 — preserve local work and make reconnection useful

Status: implemented; focused fake/static/native/review passed. Plan filed first.
Owner request, 2026-10-30: reconnect must genuinely recover the session/clips,
using existing save/session machinery where possible, with a bounded timeout
and Try again action. Replace the poorly placed Reconnecting message with a
designed footer state. Avoid forcing a new session when recovery is possible.

## Owner decision and scope

This request authorizes automatic local recovery persistence of the current
working session using existing save mechanisms, superseding the earlier need
to ask on each local recovery checkpoint. Do not turn every edit into a visible
saved project or create unrelated copies of large media. Preserve explicit Save
and all owner-created projects/media. Hosted remains temporary/expiry-bound:
no durable hosted project/library, account/database or provider/cloud action.
No transcript/media/auth content in Git, normal logs or public responses.

Inspect the existing draft store, workspace lifecycle and frontend reconnect
state before choosing the narrow recovery integration. Reuse safe schemas,
asset hashing/binding, private filesystem storage and cleanup. Preserve completed
paid work across a normal local backend restart where the existing assets allow
it; recovery never silently repeats analysis, image generation or rendering.
Interrupted work must be shown honestly and use an explicit retry if needed.

## Execution plan

1. Inspect local host startup/shutdown/expiry, drafts/session save and frontend
   boot/poll reconnect behavior. Refine complete file allocation and retention/
   recovery rules in this packet before implementation.
2. Implement bounded automatic local working-session recovery with the existing
   safe storage/restore mechanisms. Avoid duplicate whole-source copies on each
   update, retain explicit drafts independently, and dispose recovery data only
   at the existing explicit reset/expiry boundary. Preserve hosted policy.
3. Replace indefinite reconnect with bounded automatic retry and a stable
   timeout/error state. Put concise status and Try again in the relevant footer,
   shared design tokens/Button primitives, keyboard-accessible and responsive.
   Distinguish temporary connection loss, expired/missing session and recovery
   failure; offer a fresh start only when recovery cannot succeed.
4. Verify actual local restart/recovery with synthetic media, fake AI and no
   keys. Preserve clips/edits/assets/outputs and call counters; prove zero new
   inference/render calls for recovery and explicit retry for interrupted work.
   Exercise temporary outage, timeout, retry, reset/expiry, failed/corrupt record,
   hosted no-durability, phone/desktop footer visibility, and listener/timer/
   request/storage cleanup. No real sample/provider calls or deployment.
5. Read-only validate the settled scoped change and record actual remaining
   visual/real/hosted/release limits. No Git mutations without a new instruction.

Fake mode needs no keys for reconnection/recovery and editor tests. Actual AI
continues to require existing real/master settings plus Codex saved sign-in/local
models or Gemini keys/live approvals. Recovery itself must not invoke either.

## Evidence

Inspection: the browser polls the original workspace ID forever and renders
Reconnecting as a content notice. On restart the host loses its in-memory maps
and deletes working files. Explicit Save already supports incremental hashed
assets and source/output reuse, plus restore without provider calls. Use one
separate rolling local recovery store under the normal library's `.recovery`
directory, reusing OwnerDraftStore and OwnerWorkspaceDrafts. Do not add recovery
entries to the visible saved-project list. Graceful shutdown flushes it before
working files are removed; restore loads the latest unexpired snapshot and marks
interrupted work canceled, never automatically resuming a paid operation.

Refined whole-file allocation before implementation:

- `apps/backend/local/session-recovery.ts` and `.test.ts`: bounded rolling store,
  expiry/reset cleanup, restored snapshot and existing draft/asset mechanisms.
- `apps/backend/local/workspace-drafts.ts` and `.test.ts`: optional fixed local
  automatic opt-in mode for the separate recovery store; explicit Save unchanged.
- `apps/backend/local/server.ts`, `runtime.ts`, and focused server recovery tests:
  normal local-only composition, source/analysis/batch change hooks, lazy restore,
  clear/expiry and graceful-shutdown flush. Hosted never enables this store.
- `apps/frontend/src/features/local-editing/clip-batch-panel.tsx`,
  `experience.tsx`, `style.css` and focused polling tests: 30-second automatic
  reconnect window, individual bounded requests, recovered workspace rebind,
  footer status/Retry and honest missing-session handling.
- `apps/frontend/src/features/local-editing/clip-connection.ts` and `.test.ts`:
  extracted GET-only bounded polling/rebind state machine, fake-clock coverage.
- `test/local-codex.proof.ts` and/or a dedicated `test/local-recovery.proof.ts`:
  current-source synthetic restart/restore, zero AI calls, desktop/phone footer,
  temporary outage, timeout/retry and cleanup.
- This ticket, index, source-of-truth and local workflow guide: precise ownership,
  local recovery retention/user controls, fake versus real evidence.
- `AGENTS.md`: record the latest automatic-local-recovery authorization so future
  agents do not repeat the superseded per-checkpoint Save approval question.

Old clips already lost before recovery was installed cannot be recovered from
nothing. Preserve user-created drafts/retained source/previous exports. Clear only
the dedicated recovery store on explicit Start over or the existing two-hour
session expiry; one rolling snapshot and content-hash reuse avoid per-edit media
copies. No accounts/database, new provider request, hidden retry or hosted
durability. Exact fake/static/visual/restart evidence is recorded below.

### Implemented and validated

Normal local runtime enables one rolling recovery draft, separate from explicit
saved projects. It uses the existing draft store, debounce/hash/immutable media
copy machinery and source/output validation. Changed source, analysis, clip and
applied edit state is coalesced; graceful close flushes recovery before working
files are removed. Restore loads the newest snapshot inside the existing two-hour
window, updates workspace mode/binding and marks interrupted jobs canceled. No
provider/render operation is dispatched by restore. Start over/expiry delete only
the dedicated `.recovery` tree after checked confinement/drain, not owner media.
Hosted ignores the recovery option entirely. Initial recovery I/O has a two-minute
abort bound independent of short disconnected browser requests.

GET-only polling now has bounded requests and a thirty-second automatic window.
It discovers the recovered workspace instead of polling the obsolete ID forever.
Reconnecting/timeout/Try again live in the persistent footer; missing/expired
sessions offer Start new session. Connection loss preserves editor display/state
while hiding submit actions and disabling the stale session reset until a known
state returns. Initial connection has a ten-second bound and footer Retry.
The owner-authorized automatic recovery rule is recorded in AGENTS/source-of-truth.

An actual shutdown race was found while proving this: a media response could
close during file stat, before its close listener was attached, leaving the
read stream and shutdown promise open. Stream close now destroys the input
directly, already-destroyed responses do not pipe, and shutdown stops listening
before draining resources. A deterministic aborted-response regression completes
within its five-second bound; the previously stalled native cleanup now finishes.

Fifty focused fake/no-key/paid-off cases pass across session recovery, server
recovery, existing workspace drafts/draft store, hosted workflow and owner APIs
in 29.69 seconds. Coverage includes automatic debounce before a clean shutdown,
interrupted-job cancellation/counters, hash/source reuse, explicit project
independence, reset, expiry, linked-path refusal, existing backup/corruption
checks, hosted no-durability, temporary outage, timeout/retry, recovered ID rebind,
expired auth, and shutdown/file/listener cleanup. Final server review also found
that a direct upload before the first GET could bypass pending recovery; POST
now restores/adopts the older session before admitting mutations. Three focused
server cases pass after that fix. No private media/provider payloads enter Git.

The final uninstrumented current-source synthetic browser/native proof passes in
69.40 seconds. It verifies five-second pictures and length-based opening text,
actual camera/export/source frames, saves/restores the independent explicit draft,
then simulates outage for thirty seconds. Footer reconnect/timeout/missing states
fit 1440/390/320 widths. Try again reconnects after replacing the actual host
instance and restores clips, applied edits, assets, outputs and counters exactly.
Reset clears recovery while preserving the explicit saved draft. Four injected
inference attempts, two injected speech/two diarization calls and eight native
jobs remain unchanged during recovery; no new inference/native job is dispatched.
All browser/host/worker finally cleanup completes. Inspected screenshots and
fixed-phase evidence are ignored under `.local-build/evidence/cl158-*`.

Local/root-test TypeScript, scoped ESLint, code formatting and whitespace pass.
React hook declaration/order and retry-handler state placement were corrected
during lint validation; no rule suppression was introduced. Temporary proof-only
shutdown probes were removed. Read-only validate: Meets ticket; no actionable
findings remain after the direct-upload/stale-reset fixes. Earlier CL-152–155
work is preserved and excluded from this new recovery verdict.

Actual new-media AI/editorial/voice/face, listening/device/rights and hosted/release
acceptance remains owner-only. Recovery can retain only successfully written
acknowledged snapshots; unapplied browser edits and pre-installation lost work
are not claimed recovered. Two-hour expiry and explicit reset deliberately end
recovery. No real sample, provider/paid call, configuration/credential inspection,
cloud operation, deployment, stage/commit/push occurred. No scope deviation.

Final normal-app lifecycle: nine old backend identities stopped with zero
survivors/orphans; frontend PID 13720 / port 3000 preserved. Rebuilt contracts,
current internal worker and overlay through the normal pinned dev command.
Final backend PID 21112 / port 4000 and worker 24020 / port 4200 belong to
supervisor 19072. Health, /start and /api/sample/config return 200; the safe
capability GET reports Codex ready. Normal config/real-master settings were
preserved; only non-metered GETs were used. Two exact synthetic scratch trees
from the stopped pre-fix proofs were confinement/process-checked and removed;
saved/retained/private owner media and the CL-153 review export are untouched.

Content-free runtime record and logs:

- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl158-app-8d9eb3ff04bd40e280b639003940c0f1/backend.runtime.json
- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl158-app-8d9eb3ff04bd40e280b639003940c0f1/backend.stdout.log
- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl158-app-8d9eb3ff04bd40e280b639003940c0f1/backend.stderr.log

Final source/whitespace/path review contains no private media or ignored config
paths and no staged files. Current-source tests/types/lint/format and the settled
read-only review have no remaining actionable finding. The final reset guard
keeps stale session reset disabled while disconnected; the full proof verifies
it along with all footer states. All CL-156–158 requested work is implemented.
