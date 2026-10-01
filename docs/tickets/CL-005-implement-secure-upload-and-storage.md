# CL-005 — Implement secure upload and temporary storage

Status: Planned<br>
Milestone: M2 — private media foundation<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-001, CL-003, and CL-004A's documentation handoff<br>
Blocks: CL-006, CL-011<br>
Suggested commit: `CL-005: implement secure direct upload`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Latest owner clarification (2026-10-01): CL-004 owns the complete development-
only frontend preview and its reusable screens. This packet replaces the fake
adapter with its real implementation and proves integration, media, recovery,
privacy/rights/spend/readiness gates; it does not recreate the workflow UI.
Earlier restrictions on synthetic progress apply to real/public mode, not the
explicitly labelled local preview. Fake completion is not evidence for this
packet's unchecked acceptance. See the parent development-preview clarification.

Owner UI revision (2026-10-01): reuse CL-004's shared single-workspace frame,
buttons and progress for drop/pick, local inspection and direct upload. Replace
the disabled intake with real capability-gated selection here. Animate only
actual transferred-byte progress; preserve formats/limits/rights, safe-area
actions and short-height scrolling. Parent section 0.6 takes precedence over
older layout instructions; rights/privacy/spend/live gates remain. The cloud
ordering decision below supersedes earlier permission to run cloud work here.

Owner setup ordering (2026-10-01): [CL-004A](CL-004A-prepare-third-party-provider-readiness.md)
owns non-GCloud setup guides. Implement storage/upload adapter code and prove
its request/response contracts locally here; no GCloud account, resource,
credential use or live spike is required or performed. Actual GCS CORS/resume/
generation/abort/cleanup evidence transfers to final CL-015 and stays unchecked
until then. A failed deployment spike reopens the mechanism/implementation and
requires focused re-audit before live enablement.

Implement the complete private-media intake boundary: encrypted processing
grant, content-free object naming, temporary-storage port/fake, atomic markers
and leases, browser-local inspection, server-authorized resumable upload,
authoritative completion checks, cancellation, and clear/partial-cleanup
behavior.

This ticket deliberately keeps storage/security and upload together. The
resumable mechanism is not independently useful or safe without its grant,
object, idempotency, metadata, and cleanup rules; splitting them would create a
capability with no trustworthy lifecycle.

## Portfolio value

Demonstrate that large private media can bypass the web/API body while the app
still enforces strict limits, ownership, idempotency, honest retention, and
cleanup—one of the strongest architecture proofs in the portfolio story.

## Standalone implementation context

- Browser JSON uses same-origin `/v1`; large media uploads directly to one
  private temporary Cloud Storage object through a short-lived server-created
  resumable capability.
- Next.js and Express never buffer or proxy media bytes. The browser keeps the
  upload URL in memory only; it never enters reducer state, session storage,
  logs, errors, HTML, analytics, or documentation evidence.
- The `__Host-clipping_session` cookie is HttpOnly, Secure, SameSite=Strict,
  Path=/, authenticated-encrypted, <3,500 bytes, rotated as owned evidence and
  action counters change, and contains no content or signed capability.
- Public source acceptance requires both authoritative duration ≤20 minutes
  and bytes ≤500 MiB (with the lower 15-second bound). Browser inspection is
  advisory; object metadata and CL-006 ffprobe proof are authoritative.
- Storage is not a database. Objects are addressed only through the grant,
  expire together, are explicitly clearable, and are never listed as product
  history.
- Public live upload remains owner-gated. Implement and prove the bounded fake
  path first; actual GCS/CORS mechanism evidence is a final CL-015 gate.

## Dependency evidence required

- CL-001 must provide strict API/error/config contracts, fake-only test
  composition, and verified secret-file ignore rules.
- CL-003 must provide canonical intake/upload/clear transitions and adversarial
  persistence/restore coverage.
- CL-004A must provide the provider/env/budget guides and Turnstile handoff;
  owner account/key readiness is not required for local/fake implementation.

Inspect and reuse those boundaries; a missing contract/state transition reopens
the owning dependency rather than becoming a second implementation here.

## Files and areas owned

- Backend processing-grant, CSRF/source checks, idempotency markers, leases,
  signed capabilities, content-safe logging helpers, object naming, and clear
  use case.
- `TemporaryStorage` port plus bounded in-memory fake and proposed GCS adapter
  code verified with injected fake transport; actual mechanism proof is CL-015.
- Session, upload-authorize, upload-complete, and clear routes/use cases and
  their shared contracts.
- Frontend local inspection, rights disclosure, upload progress/lifecycle,
  resumable client, cancel/clear, and focused tests.
- Storage/upload/retention operations documentation required by this scope.

## Scope boundaries

### In scope

- Local file selection and object URL; advisory type/bytes/duration/orientation
  checks; exact recommended/hard-limit and rights copy.
- `POST /v1/session` upload mode, `GET /v1/session` reconciliation evidence,
  `POST /v1/uploads/authorize`, `POST /v1/uploads/complete`, and
  `DELETE /v1/session` through fake storage/job boundaries.
- UUID idempotency keys, create-only markers, generation preconditions,
  single-source leases, grant rotation/expiry/key-version support, and
  content-free metadata.
- Upload progress, abort/resume only when the validated protocol actually
  supports it, visibility/network recovery, partial-object deletion, and
  bounded cleanup retry.
- Local storage-adapter request/response tests for the proposed GCS mechanism;
  hand off the exact CORS/header/expiry/size/generation/range/abort/cleanup matrix
  to CL-015 before the live mechanism can be accepted.

### Out of scope

- ffprobe/process execution (CL-006), transcription/candidate analysis
  (CL-007), playback-delivery architecture beyond evidence needed by the spike,
  assembly, automatic clip review, render, production provisioning, or public enablement.
- Multipart media requests, public bucket/object ACLs, bucket listing, filenames
  in object keys, database-backed sessions, durable per-user quota, or a general
  storage repository abstraction.
- Reading user local secret files, creating credentials/service-account JSON,
  or any GCloud setup/mutation/credential use/live spike (final CL-015 only).

## Implementation checklist

### 1. Grant, session, and object model

- [ ] Implement authenticated-encrypted grant encode/decode/rotation with
  active plus bounded previous decrypt-only key and strict size/version/expiry.
- [ ] Keep only opaque session/source/operation IDs, allowed mode, revisions,
  counters/nonces, key version, and expiry in the grant.
- [ ] Generate content-free object paths under known class prefixes; never use
  filename, title, speaker, IP, or provider/account identifier.
- [ ] Implement trusted Origin/Fetch Metadata checks and content-free request
  context/error/logging.

### 2. Storage, markers, and cleanup

- [ ] Define narrow storage methods for known-object read/write/delete,
  metadata, generation preconditions, atomic marker creation, resumable
  authorization, and signed capability issuance.
- [ ] Make the fake simulate generations, conflicts, expiry, partial deletion,
  and capability leakage sentinels.
- [ ] Implement idempotent clear that attempts all known cancels/deletes even
  after one failure, clears the cookie in all outcomes, and reports class-level
  cleared/pending status without object names.
- [ ] Ensure invalid, partial, superseded, and expired objects are deleted
  immediately where possible and lifecycle remains a backstop.

### 3. Browser intake and upload

- [ ] Keep raw filename browser-memory-only and revoke the local object URL on
  replacement, stage exit, clear, and unmount.
- [ ] Reject obvious local-limit/type failures before requesting upload
  authorization and keep the sample available.
- [ ] Preserve the resumable URL/headers in one runtime upload owner only; never
  dispatch or serialize them.
- [ ] Report monotonic committed-byte progress; support cancel and truthful
  recovery/resume based on the proven protocol behavior.
- [ ] On completion, send only opaque upload ID and observed bytes; server
  verifies authoritative metadata/generation/type/size and starts the one fake
  inspection operation idempotently.

### 4. Local mechanism contract and final-cloud handoff

- [ ] Verify proposed server-created session/header and storage precondition
  requests using local fake transport, including failure and leakage sentinels.
- [ ] Prepare the exact live matrix for CORS, start expiry, chunk/restart,
  cancel, size/type/generation/range, partial cleanup and no-capability leakage.
- [ ] Assign that matrix to CL-015; keep every actual cloud result unchecked.
- [ ] Document that local transport tests cannot prove browser/GCS behavior;
  stop live enablement if final CL-015 evidence fails, with no public proxy fallback.

## Contracts and state transitions

- `intake -> local-inspection -> upload-authorizing -> uploading ->
  media-inspecting`; authorization failure returns to local inspection.
- `CANCEL` during upload enters clearing and aborts transfer before deletion.
- `POST /v1/uploads/authorize` rejects session/feature/source/bounds/admission
  before Turnstile and object creation; exact route order remains cheapest-first.
- `POST /v1/uploads/complete` returns one existing/new inspection operation on
  idempotent replay. It does not assert a valid `MediaDescriptor`; CL-006 does.
- Clear is available from every active stage and never promises synchronous
  lifecycle deletion when infrastructure reports partial cleanup.

## Privacy, provider, and cost constraints

- The GCS bucket stays private with public access prevention, uniform access,
  exact-origin CORS, no browser listing, bounded object metadata, and lifecycle
  policy documented honestly.
- No transcript/model/image provider is called. Turnstile fake is deterministic;
  live verification is action/hostname-bound and only after approval.
- No media body crosses Next.js/Express. No URL/cookie/token/object path appears
  in log fields or error payloads.
- Rate/capacity/idempotency controls are best-effort anonymous controls, not a
  durable per-person quota claim.

## Acceptance criteria

- [ ] Browser-local failures prevent authorization; exact hard boundaries and
  the independent duration/byte rule are covered.
- [ ] Grant tamper, expiry, unsupported version, wrong key, rotation, and size
  checks fail closed.
- [ ] One authorize/complete action creates at most one capability/object and
  one inspection operation; conflicting replay fails safely.
- [ ] Upload capability is memory-only and absent from state, storage, logs,
  HTML, errors, tests, and docs evidence.
- [ ] Wrong/missing/oversized/type-mismatched/partial objects are rejected and
  scheduled/deleted without provider calls.
- [ ] Cancel, clear, expiry, partial cleanup, and object URL/request cleanup are
  truthful and tested.
- [ ] Local storage adapter contract tests pass and the live CORS/resume/
  generation/abort/cleanup acceptance matrix is explicitly transferred to CL-015;
  cloud readiness is not claimed here.

## Focused verification

- [ ] Run grant/CSRF/idempotency/lease/storage/log-redaction unit tests.
- [ ] Run API integration tests for session, authorize, complete, replay,
  cancel/clear, expiry, and partial deletion using fake ports only.
- [ ] Run frontend local-limit/upload-progress/cancel/object-URL tests.
- [ ] Assert Deepgram/OpenAI/image/job-start call counts remain zero on every
  rejected intake case.
- [ ] Leave actual GCS checks unchecked for final CL-015; no GCloud setup or
  credentialed cloud execution occurs in this packet.
- [ ] Run affected lint/typecheck/build, secret/ignore scans, `git diff --check`,
  and final status inspection.

## Documentation updates

- Document local intake/upload behavior, committed environment schema, and
  ignored local secret rules in app READMEs.
- Add/update local storage/data-retention and adapter-contract docs; reuse
  [provider setup](../operations/PROVIDER_SETUP.md) for Turnstile. Prepare cloud
  settings/mechanism requirements for CL-015, not an early cloud setup run.
- Promote any mechanism/CORS/preview architecture change into the parent and
  affected tickets before completion.

## Owner gates and external blockers

- Product gate: approve public anonymous upload; otherwise deployment stays
  sample-only.
- Provider/privacy gate: approve temporary storage/recovery and public copy.
- Turnstile setup/settings or a bounded local verification require separate
  provider authorization; CL-004A owns its owner guide.
- Bucket/IAM/CORS/lifecycle setup and the live GCS spike belong to final CL-015
  and require explicit cloud authorization there.
- Missing approval does not block fake ports, contracts, UI, or tests; it blocks
  actual provider/cloud evidence and public enablement, not local adapter code.

## Commit boundary

Keep secure grants/storage and the complete resumable-upload lifecycle together
as `CL-005: implement secure direct upload`. Do not absorb ffprobe,
transcription, assembly, render, or deployment. No Git, provider, or cloud
mutation is authorized by this packet alone.

## Precision references

- [Upload journey and local inspection](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#43-stage-2--inspect-and-authorize-upload)
- [Encrypted grant, objects, idempotency, and leases](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#84-control-objects-not-a-database)
- [Upload/session/clear API](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#115-post-v1session)
- [Temporary storage and job lifecycle](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#14-temporary-storage-and-job-lifecycle)
- [Security/admission tests](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#204-securityadmission-tests)

## Completion handoff

Report the grant/object/session design, exact route order, upload mechanism and
spike status, cleanup outcomes, changed files, zero-provider-call evidence,
targeted commands, documentation updates, and every owner/cloud/privacy gate
that remains unchecked.
