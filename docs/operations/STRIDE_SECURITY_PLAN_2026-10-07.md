# Security remediation plan — approved local execution

Date: 2026-10-07. Baseline:
`5ef509fd2b027e9f085fb3e78739a7bc245aabd0`.
Authority: the owner's later 2026-10-07 instruction approves local implementation
under the current CL-012 packet. Cloud/credential/paid/Git actions retain their
separate gates. The original proposed steps below remain review history where
superseded by these decisions.
Read the [detailed audit](STRIDE_SECURITY_AUDIT_2026-10-07.md) and
[plain-language review](STRIDE_SECURITY_REVIEW_2026-10-07.html) before selecting
items. Risk acceptance/deferment is a legitimate recorded outcome; do not treat
all six findings as an automatically authorized backlog.

## Current owner decisions and execution order

| Finding | Decision and work |
| --- | --- |
| SEC-01 | Carry forward the documented October 4 owner-reported USD 5 Gemini monthly cap and auto-reload off. Later owner-authorized CLI reads verify the actual app's Cloud Run USD 5 monthly spend cap as configured. Current Gemini key/project correspondence and whole-flow coverage remain open. No new ledger or budget selection. |
| SEC-02 | Implement a distinct `session-start` challenge bound to a browser nonce, before scarce grant allocation. Keep later session-bound proofs fresh and unchanged. Bound pending verification and clean up on abort/timeout. |
| SEC-03 | Implement one shared session delivery policy. Preserve seeking, refresh, retries and repeated downloads with generous fixed headroom; reopening or switching aliases cannot replenish it. |
| SEC-04 | Prepare compatible patched browser tooling and framework maintenance, verify deterministic behavior and pin exact build inputs. Deployed-image acceptance needs the separate renderer build/update gate. |
| SEC-05 | Owner accepts Google's up-to-48-hour Files expiry fallback following process loss. Preserve normal explicit deletion and deletion-before-next-phase checks; no orphan sweep/database. |
| SEC-06 | Explicitly paused until the owner returns home and reviews the dashboard. Document existing controls; do not implement frontend/HTTP traffic protection now. |

Execute SEC-02, SEC-03 and SEC-04 locally, then review the combined diff and fix
confirmed actionable findings until the local validation is clean. Run the
settled five root gates. Update the review with **fixed locally**, **accepted**,
**external evidence pending** and **paused** separately. This replaces the earlier
requirement to select every policy before coding; routine compatible choices are
within approval. Keep original evidence snapshots intact.

## Cloud decision reconciliation

| Document/checkpoint | Actual scope |
| --- | --- |
| `PROVIDER_SETUP.md`, October 4 | Owner-reported USD 5 Gemini monthly spend cap, USD 5 prepayment, auto-reload off; delayed enforcement, not an exact cutoff. |
| `COST_MODEL.md`, October 2–3 | USD 10 project budget alert verified at its checkpoint; intended USD 5 Cloud Run alert unconfirmed. These are notifications. The October 3 deferred Gemini amount is superseded by October 4. |
| `CLOUD_RUN_RENDERER_SETUP.md`, October 2–5 | Existing private renderer: 4 CPU/8 GiB, min zero/max one, HTTP concurrency two, one expensive job, 900-second request/840-second work deadline, 2 GiB scratch. Later four-operation persisted per-session allowance supersedes the two-operation process cap. |
| `GEMINI_REMOTION_MIGRATION.md` | Fixed private topology, no queue/database, fail-closed volatile control state; renderer frame concurrency two is another distinct limit. Public rollout remains separately gated. |

None of those means four processes per session or protection of every public HTTP
request. The initial audit used no credentials or dashboard. After local validation,
the owner authorized authenticated read-only CLI checks; the
[execution report](STRIDE_SECURITY_REMEDIATION_2026-10-07.md#post-validation-read-only-cloud-inspection)
records the verified Cloud Run spend cap, selected IAM/expiry/bucket metadata and
their limits. No cloud setting changed. The separate later owner approval allows
the [file-level staging/commits](../tickets/CL-015-SECURITY-COMMIT_PLAN.md) after a
clean local review; it does not authorize cloud build/update or paid testing.

## Implemented file-level packet and validation

The [execution report](STRIDE_SECURITY_REMEDIATION_2026-10-07.md) owns current
results and external gaps. These concrete choices supersede unresolved choices
in the original proposed steps below:

| Files | Final responsibility |
| --- | --- |
| `packages/contracts/src/admission.schema.ts` | One strict bootstrap proof schema, UUID nonce, existing bounded token and 3 KiB request cap; distinct challenge purpose without a fifth paid processing action. |
| Backend `admission/processing.admission.ts`, both grant routes | Verify before allocation; two pending starts and five-second verifier deadline; final atomic allocation recheck; scoped disconnect listener cleanup. |
| Frontend `source-analysis/session-start.ts`, API, normal/replay flows, challenge and sample components | One bootstrap orchestration shared by normal and labelled development replay; later session-bound action proofs stay fresh. |
| Backend `media/delivery-allowance.ts`, preview/output use cases, final-result restore, analysis composition | One shared 2 GiB/1,024-content-read/64-metadata allowance; at most 64 scalar session records until original grant expiry. Clear revokes access but retains consumed allowance until expiry, preventing reopen refill. Failed/uncertain reservations stay consumed. |
| Backend `media/artifact-stream.ts` | Reserve exact validated Range bytes before private I/O; reauthorize after fetch and each read before releasing bytes. Retained-source paths retain their existing separate authorization and limits. |
| Renderer `scripts/browser-tooling.ts`, prepare/stage scripts, build-context allowlist and tests | Pin Chrome for Testing 155.0.8059.39, inspect actual executable version, fail closed on mismatched cache; staging records truthful versions/hashes and the upload includes exactly the required helper. No runtime downloader or sandbox-flag changes. |
| Frontend/renderer/composition/root manifests, lockfile and workspace policy | Matched Remotion 4.0.534 and Next/eslint-config-next 16.3.8; retire obsolete 16.3.7 release-age exceptions. Retain existing Zod 4.6.5 and React pins. |
| Owning regression tests and service READMEs | Invalid/cancelled/racing starts, shared delivery allowance and aliases, late Exit, normal seek/repeat-download headroom, exact dispatch counts, tooling pins and native prerequisites. |

Rollback must keep coherent bootstrap schema/frontend/backend versions together,
and coherent Remotion/browser/source/image versions together. Keep public paid
activation deferred until matching artifact and owner checks pass; never bypass
proofs, change sandbox flags or replay uncertain paid work to restore availability.

## Rules that apply to every selected item

1. Implement one dependency-ready packet at a time. Reconcile the chosen finding
   with CL-012 and CL-015; record exact owner decisions and numerical limits in
   their owning policy/operations document. Public transport is a separate packet,
   not an excuse to remove the fail-closed paid gate early.
2. Preserve the existing flow: consent → source → grounded candidates → one
   selection → automatic assembly → preview → one final export/download → Exit.
   No editor, account system, database, durable queue, persistent project or new
   paid/provider retry. Keep API schemas in contracts, routes thin, use cases on
   ports and provider types inside adapters. Create a module only for its first
   real, narrowly named responsibility.
3. Keep **all existing private diagnostics and log event coverage**. Add only
   content-free bounded reason/status/count events when necessary. No raw provider
   exceptions, input/media/filename/capability/credential or stack reach UI/browser
   console. Rejection copy is generic, useful and source-controlled.
4. Start with an independent failing synthetic test for the selected material gap,
   then the smallest change. Use fake/paid-off process setup before imports, exact
   permitted/rejected provider/job counts and zero external network. Never change
   operating flags/secrets to make tests pass or run a paid flow as an agent.
5. Check normal behavior as well as abuse: refresh/restore, cancel/Exit, expiry,
   rejected requests, slow/disconnected clients, seeking/range playback, double
   clicks, stale revisions and maximum permitted envelopes. Retain all receipts,
   boot epochs, generation/hash binding, deletion and uncertainty fences.
6. After edits settle, run required repository gates: format, lint, typecheck,
   full deterministic unit suite and build, plus the owning artifact/boundary
   checks. Native Linux proof needs separately authorized build tooling; genuine
   paid/CSP/device/export checks remain owner-only. Fake outputs cannot certify
   live AI/native quality. No local AI model/weights path is available.
7. Review the resulting diff for redundant schemas/limits, dependency-direction
   violations, dead/debug code, unsafe casts, content/secret leakage and listener/
   timer/request/reader/process/scratch ownership. Document results and remaining
   external checks; do not weaken guards to force a green result.
8. Roll back a failing packet to the known validated source/artifact while keeping
   public paid processing disabled. Do not automatically replay uncertain paid
   operations or delete retained owner media/captures. Git actions and deployment
   need their own explicit authorization.

## Original proposed sequence — superseded where noted above

| Order | Work | Dependency / approval |
| --- | --- | --- |
| 1 | Decide budgets and provider-retention choice; establish exact artifact/hosting evidence | SEC-01, SEC-04, SEC-05/G-01–06; read-only evidence first, cloud/credential actions separately approved |
| 2 | Compatible framework/native patch packet if selected | Exact advisory/version compatibility; retain non-metered synthetic baseline; private image rollout separately approved |
| 3 | Protect scarce session starts if selected | SEC-02 challenge protocol decision; no hosting activation required for fake tests |
| 4 | Bound session-owned delivery if selected | SEC-03 normal read/seek measurements and owner-approved headroom |
| 5 | Public hosting/HTTP capacity packet | SEC-06 measured container envelope + G-01 fixed authenticated transport; coordinate selected admission/delivery policies |
| 6 | Verify deployment gates and owner paid/manual flow | Selected packets green, explicit deployment approval, separate owner paid test; no blanket public-paid enablement |

Do not build a distributed limiter/ledger, accounts or WAF platform for this demo.
Use existing vendor controls and small bounded application policies where evidence
shows they are needed. Process-local policies retain their stated process scope.

## SEC-01 — Vendor and rollout spend gate

**Preferred change:** operations/vendor configuration evidence first; preserve
application counters. **Potential application diff:** none unless a selected
deployment packet needs startup attestation/fail-closed prerequisite handling.

| File/boundary | Proposed responsibility |
| --- | --- |
| `docs/operations/COST_MODEL.md` | Record owner-approved Gemini/Cloud Run budgets, quotas, headroom, non-instant enforcement, GCS/cleanup coverage, kill-switch/recovery responsibilities; replace outdated claims only where currently authoritative |
| `docs/operations/CLOUD_RUN_RENDERER_SETUP.md` | Record verified instance/concurrency/revision settings and expiry survival/recovery; attach content-free evidence rather than account identifiers |
| `docs/tickets/CL-015-deploy-validate-measure-and-rollback.md` | Make spend/capacity/rollout receipts explicit public-release gates; do not mark vendor settings complete from source tests |
| `apps/backend/src/config/env.schema.ts`, `loadConfig.ts`, `admission/admission.composition.ts` | Only if justified by the approved hosting packet: preserve paid-master precedence and current process caps; separate missing optional local setup from invalid public composition |
| Existing config/admission/renderer allowance tests | Keep old-epoch rejection, current exact call counts and consumed uncertainty; assert replicas/restarts are not described as a durable budget |

Steps:

1. Carry forward the already selected vendor controls and their documented
   enforcement delay; no new budget selection is requested.
2. With separate authorization, verify applicable vendor spend-cap budgets
   and quotas. Capture only secret-free setting names/statuses. Do not inspect a
   private env file or install a billing-disabling automation during this audit.
3. Pin service/revision instance caps, concurrency and fixed work deadlines to the
   known container envelope. Consider transient replacement/rollout overlap even
   at one instance; never promise exactly one global executor from that setting.
4. Define a cap-triggered response: reject new processing with generic copy,
   preserve private diagnostics and deletion responsibility. Cloud Run pausing
   can pause expiry; verify independent fallback/recovery and acknowledge delayed
   object deletion. Do not stop cleanup by disabling billing for the entire project.
5. Verify configuration/guard behavior with injected fake ports. A genuine vendor
   cap trip is not required of an agent and is not implied by fake checks.

Acceptance: normal one-session processing remains unchanged below configured
limits; exhausted allowance never dispatches; public activation requires saved
vendor evidence and owner acceptance of residual reporting delay. Rollback: keep
public paid-off, retain cleanup access/responsibility; do not automatically lift a
vendor cap to restore the demo.

## SEC-02 — Protect scarce session starts

**Preferred change:** existing admission feature, with one separate bootstrap
proof purpose and no identity/account service. **Resolved:** `session-start` uses
a fresh browser UUID nonce as the challenge binding; subsequent proofs bind to
the issued session. The shared normal/replay orchestration preserves sequencing.

| File/boundary | Proposed responsibility |
| --- | --- |
| `packages/contracts/src/admission.schema.ts` | One browser-safe bootstrap request schema/action label, bounded token/nonce if required; do not duplicate existing action/result schemas |
| `apps/backend/src/admission/processing.admission.ts` | Keep synchronous protected `issue` state mutation; ensure exposed issue use case verifies bootstrap before scarce grant insertion, with capacity reserved before verification await |
| `apps/backend/src/admission/turnstile.verifier.ts`, `admission.composition.ts` | Distinct session-start verification purpose, exact hostname/action/nonce, fixed host, token single use, bounded deadline; retain subsequent session cData checks |
| `apps/backend/src/http/routes/analysis.route.ts`, `admission.route.ts` | Both exposed grant paths follow the same protected use case; JSON/secure/origin restrictions and generic response mapping remain thin |
| `apps/frontend/src/features/source-analysis/processing-challenge.ts`, `source-analysis.flow.ts`, `source-analysis.api.ts`, `sample-replay.flow.ts` | Adapt existing widget/API sequence to obtain start proof before grant; acquire fresh tokens for later session-bound actions; clean up on abort/refresh; preserve current development-only replay restriction |
| Owning admission/Turnstile/route/frontend tests | Independent shared-window starvation regression, invalid proof zero slots, fresh valid starts, exact fake verifier/dispatch counts, cancellation and parallel races |

Validate exact filenames with the source inventory before editing; the plan names
responsibilities, not permission to scaffold an alternate feature tree.

Steps:

1. Add an injected-verifier failing test: invalid/unverified starts cannot consume
   the global genuine visitor allowance; three invalid starts must leave a valid
   visitor eligible. Assert zero provider and renderer calls throughout.
2. Bound pending bootstrap verification before the first await, with no unbounded
   provisional grant map. Do not let an attacker replace grant starvation with
   unlimited outbound verification work.
3. Introduce the smallest bootstrap challenge protocol in contracts/owning feature.
   Keep subsequent token replay/hostname/action/session checks unchanged. Never
   redeem a token twice or allow a generic proof to authorize every later action.
4. Exercise cancelled starts, stale tokens, valid proof then allocation race,
   duplicate cookies, full capacity, expiry, forged headers and a resumed session.
5. Validate consent/retained-source/upload paths and the normal candidate-to-export
   UI with synthetic ports; preserve existing field/error/log boundaries. Owner
   verifies actual Turnstile/CSP behavior before public release.

Acceptance: malicious unverified starts cannot monopolize genuine grant slots;
normal authenticated sessions retain exactly their prior protected workflow and
call counts. Rollback: public paid-off while reverting the whole schema/widget/
admission packet together; do not disable challenge verification as a workaround.

## SEC-03 — Bound authorized delivery without breaking playback

**Preferred change:** a single narrow delivery policy injected into existing media
use cases, rather than separately copied preview/output/download limiters.

| File/boundary | Proposed responsibility |
| --- | --- |
| `apps/backend/src/media/preview-playback.ts`, `output-delivery.ts` | Reserve session/artifact delivery allowance before metadata/content I/O; cover both output/download aliases and repeated opens; retain access rechecks after awaits |
| `apps/backend/src/media/artifact-stream.ts` | Reuse canonical Range/length calculation and cancellation ownership; optionally expose bounded actual-byte accounting callback without altering stream semantics |
| A first real backend media delivery-policy module, if needed | Own fixed byte/request/concurrency accounting, reservation/release and TTL/record cap once; no catch-all utilities and no per-request unbounded state |
| `apps/backend/src/composition.ts`, existing policy owner | Inject the same policy into both use cases; fixed numerical limits in code, not new arbitrary env overrides; do not count metadata as full-video bytes |
| Owning media/route tests plus frontend playback tests | Normal seek/range/refresh/download headroom, refused alias/refill attempt, interleaved requests, abort/expiry/Clear, exact zero extra jobs/provider calls |

Steps:

1. Measure synthetic normal journeys: initial preview, seeking, repeated play,
   restore/refresh, export-player inspection, two user download attempts and slow
   network retries. Record counts/byte overhead without real media/content.
2. Use the approved generous headroom recorded above. Synthetic maximum-size
   envelopes pass; genuine device/network usage remains owner-manual evidence.
3. Define reservation/refund semantics explicitly. Reserve validated requested
   range bytes before I/O; cancellations cannot yield unlimited successful reads
   by refunding all work. Charge no full artifact for a tiny range; metadata gets
   a bounded request allowance. Access is revoked on Clear; consumed scalar state
   remains until the original grant expires so reopening cannot refill it.
4. Keep accounting atomic before awaits and recheck expiry/ownership on return.
   Denied requests start zero storage streams/jobs/provider calls and return
   generic availability feedback, with private aggregate reason/count diagnostics.
5. Ensure final output and preview share the intended aggregate/individual budgets
   and aliases cannot reset them by reopening a descriptor. Preserve existing
   renderer concurrency cap as the lower-level safety layer.

Acceptance: an abusive admitted session reaches a bounded delivery refusal;
normal seeking/download/restore remains within headroom and privacy fences hold.
Scope remains process-local unless an approved deployment changes that premise;
restart/replica aggregate cost is still governed by SEC-01. Rollback: revert only
the delivery packet while paid-off; keep receipt/range/expiry checks intact.

## SEC-04 — Refresh the native renderer baseline

**Preferred change:** compatible patched fixed build artifact, with exact-image
native scan and quality proof. **Separate permission:** native/cloud image build,
registry push and private renderer rollout each follow their current gates.

| File/boundary | Proposed responsibility |
| --- | --- |
| `apps/renderer/scripts/stage-tools.ts`, `prepare-browser.ts` | Choose/verify compatible patched Headless Shell source at build time; truthful version/hash/provenance inventory; no runtime download or caller-supplied executable |
| Renderer/frontend/composition manifests and `pnpm-lock.yaml` | Change Remotion pins together only if necessary; patch compatible parent dependencies; do not force unrelated major updates |
| `apps/renderer/Dockerfile`, cloud build/build-context scripts | Preserve approved allowlist, non-root runtime and binary/import/bundle proof; update base/native packages only with exact-image advisories and compatibility evidence |
| `apps/renderer/src/composition/render-worker.ts`, config/pipeline | Prefer no behavioral change; preserve fixed paths/props, loopback media origin, output envelope, owned process/browser/scratch cleanup |
| `apps/frontend/src/proxy.ts`, composition/Player integration | If package-generated style changes: regenerate only the exact approved style hash and verify nonce/CSP; do not broaden script/style policy |
| Renderer Linux verification, output/audio/stream tests, release-artifact verifier | Assert native probe/transcode/render pixels/audio/timing/hash/cancel/scratch; frontend playback/caption/visual/CSP behavior stays intact |
| Renderer README/setup and license/runtime evidence | Record current image digest/native versions/scan disposition and notices without secrets or owner media |

Steps:

1. Map the actual selected Linux binaries to primary security advisories. Mark
   not-applicable/headless/unreachable items explicitly; version drift alone must
   not become a made-up CVE exploit. Include FFmpeg/libvips/Debian, not just Chrome.
2. Try the least disruptive compatible patch; keep all package pins exact. If
   Remotion compatibility requires a larger update, propose that concrete diff
   before doing it. Do not change its sandbox flags speculatively.
3. Build from the allowlisted context and verify fixed binary hashes/versions,
   production imports/bundle and native synthetic maximum-envelope processing.
   Treat any missing native tooling/approval as a blocked external check, not a pass.
4. Validate composition dimensions, frame timing/captions/pictures/audio sync,
   browser Player/CSP, seeking/ranges, output quality checks and cancellation.
   Genuine paid visual/export quality remains an owner manual test.
5. Roll out only the verified digest after separate approval; preserve the prior
   immutable digest for rollback. Confirm private identity/expiry remain unchanged.

Acceptance: actual image inventory has no unexplained material native advisory;
compatible export/playback behavior is evidenced. Rollback: prior verified image
and matching source/package pins; keep public activation deferred if its baseline
is not safe. No runtime self-updates or hidden provider calls.

## SEC-05 — Choose provider retention or bounded recovery

**Selected: Option A.** The owner's explicit acceptance supersedes the unselected
Option B design below; do not implement listing/recovery or request this choice
again. Normal explicit cleanup remains required.

**Option A, recommended proportionate default if owner accepts:** retain explicit
normal cleanup and document the 48-hour provider fallback after process loss.
No code modification. Record the acceptance narrowly in CL-012 and privacy/
operations evidence; never imply immediate vendor deletion or alter working copy
to claim a stronger guarantee.

**Option B, only if owner requires a shorter provider-file bound:** first establish
an exclusive app ownership/project/key boundary and cross-revision safety.

| File/boundary | Proposed responsibility for Option B only |
| --- | --- |
| `apps/backend/src/analysis/gemini.adapter.ts` | Bounded, fixed-host listing/recovery and verified deletion of proven app-owned, sufficiently old files; keep existing uncertain upload/name and pending cleanup fences |
| `apps/backend/src/composition.ts`, `server.ts` | Explicit recovery-before-intake composition; bounded graceful shutdown as a supplement; no import-time calls and no HTTP objects in provider use case |
| Config/policy owning modules | Verify recovery is unavailable in fake/test/preview/public-unapproved modes; keep all numeric limits fixed in code and no raw file names/keys in logs |
| Existing Gemini cleanup/analysis/server tests | Simulate replacement with orphan files, active/foreign files, incomplete pages, deletion uncertainty, abort/timeout and zero model generation |
| CL-012 and provider privacy/operations owner docs | Record exact achievable retention and failure behavior, ownership prerequisites and remaining vendor-internal retention |

Steps:

1. Obtain owner choice A/B. For B, verify dedicated ownership before specifying
   a listing/delete policy; prefix alone on a shared account is not sufficient.
2. Define old-enough using the maximum current operation/cleanup lifetime plus
   rollout overlap. Never delete another live revision's proxy because the local
   process has no matching map entry. If ownership/age cannot be proved, fail
   unavailable or keep the fallback; do not guess.
3. Keep list pages/files/bytes/deadline bounded; preserve unresolved obligations
   on incomplete listing or uncertain delete. No unbounded automatic retry.
   Listings/deletions must not start AI generation or leak names/content to logs.
4. Verify injected fake ports demonstrate new-process cleanup of old app files,
   foreign/active preservation and restored intake only after proof. A genuine
   provider deletion test needs separate owner authorization and remains owner-only.
5. If scheduling is needed to provide a guarantee during zero backend instances,
   propose it separately; a startup sweep or graceful shutdown cannot claim an
   always-on retention guarantee. Do not silently add a durable queue/database.

Acceptance A: owner explicitly accepts fallback, current disclosure and normal
cleanup preserved. Acceptance B: tested ownership-safe bounded recovery plus
external scheduling/evidence for any promised bound. Rollback: retain normal
explicit deletion and documented fallback, restrict new intake if recovery state
is uncertain. Never mass-delete vendor files or the retained owner master.

## SEC-06 — Size and bound public HTTP work

**Paused by owner.** The design below is review history until dashboard review;
it is outside this local execution packet.

**Preferred change:** verified platform envelope first; small application admission
only if required. Coordinate the existing CL-015 public transport instead of
creating a second deployment architecture.

| File/boundary | Proposed responsibility |
| --- | --- |
| CL-015 packet and public service build/setup ownership | Record service memory/concurrency/instance/request-deadline envelope; bind injected PORT; fixed private HTTPS upstream and caller audience; overload/cleanup behavior |
| Frontend server-only request-policy/composition owner, if needed | One bounded shared pre-work slot/reservation responsibility; no queue or persistent visitor store; release on all completion/abort/timeout paths |
| `apps/frontend/src/app/api/analysis/[action]/route.ts`, sample/diagnostics/exit routes | Early cheap method/header/length/session-shape rejection; apply selected work admission before buffering/upstream await; fixed header allowlists and generic errors |
| Actual document/server rendering entry point | If SSR needs an aggregate gate, ensure it owns the full work lifetime; do not claim a short-lived proxy hook bounds later rendering |
| Existing bridge/privacy/headers tests and narrowly scoped concurrency checks | Concurrent legal-size requests/refusal, aborted uploads/reads, pending upstreams, Exit health reserve, normal analysis/preview/download and nonce behavior |
| `docs/operations/COST_MODEL.md`, release evidence | Honest availability/cost boundaries and measured envelope; no claim of complete DDoS immunity |

Steps:

1. Enumerate unpaid work costs: dynamic documents, JSON buffering, static product
   media, diagnostics, metadata and media bridges. Define what Cloud Run's selected
   concurrency already bounds; avoid redundant per-route limiter copies.
2. Use tiny synthetic concurrent requests against injected handlers to test
   admission/accounting, never flood the owner's app or a cloud service. Derive
   memory headroom from request caps and the actual container configuration.
3. Prefer fixed bounded slots and generic overload responses with retry hints;
   reject before large allocation or long outbound awaits. Do not log visitor IPs,
   payloads or untrusted request headers; preserve existing classified diagnostics.
4. Preserve cancellation/Exit/deletion and health access; long render/stream work
   must not hold all slots needed to clean it up. Verify both full completion and
   disconnected clients release ownership. Preserve output range semantics.
5. Validate the final production artifact and public/private identity boundary.
   Any authenticated load/device/cloud check needs its existing approval; no
   blanket WAF/proxy purchase or architecture expansion is implied.

Acceptance: public request capacity is justified by saved configuration and bounded
work behavior, with ordinary flow and cleanup preserved. A measured platform
envelope may justify accepting the remaining risk without extra code. Rollback:
prior artifact/configuration and public paid-off; do not raise limits/remove
timeouts to disguise overload failures.

## Owner review handoff

The HTML records the latest owner defaults and provides Verify existing controls /
Pending / Fix / Accept risk / Defer selections and optional notes.
They remain on that device and can be exported as a content-free decision record.
These selections organize review; they do not automatically execute a change,
authorize external actions or silently approve unresolved thresholds. Before any
further external action, follow the narrow owning ticket and its separate gate.
The October 7 instruction already authorized the local packet above.
