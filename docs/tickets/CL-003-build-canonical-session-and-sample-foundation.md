# CL-003 — Build the canonical session and sample foundation

Status: Planned<br>
Milestone: M1 — deterministic sample story<br>
Last synchronized: 2026-09-29<br>
Depends on: CL-001<br>
Blocks: CL-004, CL-005, CL-006<br>
Suggested commit: `CL-003: build the canonical sample session`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Implement the single canonical frontend workflow reducer, allow-listed session
persistence and restore reconciliation, rights-safe deterministic sample data,
and fake operation/provider foundations needed for the no-cost signature path.

This packet keeps state authority and sample fixtures together because the
first real state machine must be exercised by valid production-shaped data,
while fixtures without legal transitions and restore behavior are inert test
data rather than a usable foundation.

## Portfolio value

Make the product's central promise demonstrable with no credentials or paid
calls while showing disciplined state modeling, adversarial restore handling,
grounded evidence, and honest sample provenance.

## Standalone implementation context

- One `ClippingSessionState` reducer is the only browser workflow authority.
  Routes, components, request hooks, and storage never mirror `stage`.
- Top-level stages run from `bootstrapping` and `intake` through upload,
  analysis, candidates, assembly, editor, render, result, clear, expired, and
  fatal states. This ticket implements and tests the complete transition model
  even though later screens/actions arrive later.
- Persistence is a frontend-owned `ClippingSessionProjectionV1` in
  `sessionStorage`, capped at 256 KiB and reconciled against server evidence.
  Runtime handles and content-heavy data never enter it.
- The sample is purpose-recorded/rights-cleared before media enters deployment.
  Git may contain a lightweight poster and normalized synthetic/precomputed JSON
  fixtures; the long sample video belongs in a versioned private bucket later.
- Sample start produces deterministic candidates with no transcription, text
  model, active-speaker, or image call. It must be visibly sample/fake data in
  nonproduction and must not pretend AI ran for that visitor.

## Dependency evidence required

Confirm CL-001's contracts parse/build in both applications, fake/paid-disabled
composition is enforced, tests deny unexpected network, and the declared
frontend/contracts/backend dependency direction passes. Do not duplicate or
silently replace its schemas/configuration.

## Files and areas owned

- Frontend session reducer, events, selectors, provider, persistence schema,
  projection, and reconciliation tests.
- Source-controlled sample manifest/poster README and allowed lightweight
  assets.
- Backend/demo fixture modules, fake clock, fake operation sequences, and
  production-shaped sample analysis/assembly metadata.
- Shared synthetic fixtures under `tests/fixtures` for transcripts, candidates,
  active-speaker tracks, visual plans, assemblies, failures, and injection.
- `docs/operations/MEDIA_RIGHTS_RECORD.md` template/record without private
  contributor information or unapproved media.

## Scope boundaries

### In scope

- Full legal/illegal workflow transition table and nested async states.
- Safe restore for empty, valid, corrupt, oversized, stale, expired,
  unknown-version, and server-conflicting projections.
- Explicit effect ownership for storage, object URLs, polling, and future
  cleanup; runtime effects remain outside reducer/persistence.
- Normalized transcript and three distinct grounded candidate fixtures plus
  no-candidate, invalid-reference, duplicate, invented-claim, prompt-injection,
  timeout, and provider-error variants.
- Purpose-recorded sample manifest fields for version, SHA/generation placeholders,
  provenance, analysis/assembly revisions, and every precomputed asset.
- Fake provider/job/storage call counters and deterministic clock behavior
  needed by later tickets.

### Out of scope

- Production landing/candidate UI (CL-004), live upload/storage (CL-005), real
  job/process code (CL-006), live adapters (CL-007 onward), editor/render UI, or
  cloud upload of the sample.
- Committing a large or unapproved sample video, real transcript, contributor
  identity, signatures, private license copy, provider payload, or generated
  asset without recorded rights.
- A second route state machine, global store abstraction, durable backend
  session store, database, or generic fixture service.

## Implementation checklist

### 1. Canonical state and selectors

- [ ] Implement every top-level state and legal event from the source-of-truth
  table as a strict discriminated union.
- [ ] Reject invalid transitions without coercing forward; emit only a
  content-free development diagnostic code.
- [ ] Derive stage title, available actions, blockers, current progress, and
  clearability through selectors rather than duplicate state.
- [ ] Keep upload/proposal/playback/cleanup transient status in named nested
  discriminated states.

### 2. Safe persistence and restore

- [ ] Persist only the allow-listed projection: content-free IDs/revisions,
  stage hint, selection, bounded manifest/history, proposal diff without free
  transcript, playback time/panel, and bounded caption corrections.
- [ ] Exclude media/transcript/rationale copies, filenames, blobs, URLs,
  cookies/grants, provider/SDK objects, errors/stacks, Turnstile tokens,
  timers/listeners/controllers, and raw tracks/assets.
- [ ] Enforce serialized size before parse, strict schema/version/expiry after
  parse, and server-evidence reconciliation before restore.
- [ ] Clear projection and every locally owned effect on clear/expiry/fatal
  reconciliation.

### 3. Sample and adversarial fixtures

- [ ] Define a valid normalized transcript with stable word IDs and immutable
  timing evidence.
- [ ] Provide exactly three materially distinct candidate ranges with evidence,
  caveats, and no numeric virality score or invented quote.
- [ ] Include one purpose-recorded story that can later demonstrate one-face,
  wide two-person, camera-cut, Earth/Moon, and exact-equation behavior without
  hard-coding those subjects into generic logic.
- [ ] Provide valid precomputed shot/focus/visual/assembly shapes for sample
  mode and invalid variants for reconciliation tests.
- [ ] Record sample media and every visual asset as pending until rights and
  redistribution approval exist; do not add unapproved binaries.

### 4. Deterministic fakes

- [ ] Implement fake clock/IDs and production-shaped fake interfaces without
  network or credentials.
- [ ] Count calls and reject unknown fixture keys instead of silently returning
  success.
- [ ] Support abort, deterministic latency, monotonic operation stages,
  terminal immutability, and explicit failure fixtures.

## Contracts and state transitions

- `SAMPLE_SELECTED` enters a proven sample candidate/preparation state without
  paid work.
- Manual/live file selection remains in memory and does not enter persistence.
- Illegal examples—rendering without a manifest, applying a stale proposal,
  analyzing before inspection, or restoring a missing output—remain rejected.
- Future manifest history is capped at 20 committed revisions; a new edit after
  undo clears redo.
- Sample fixture objects parse through the same public schemas later used by
  backend responses and provider reconciliation.

## Privacy, rights, provider, and cost constraints

- Use only synthetic or explicitly approved purpose-recorded content. Never
  substitute arbitrary internet/media assets.
- The rights record may reference where private consent is held but must not
  commit signatures, addresses, account data, or other private evidence.
- No live adapter, credentials, remote storage, media upload, cloud job, or
  paid call belongs in this ticket.
- Fake sample state must be labeled honestly and cannot fall back from a live
  failure in production.

## Acceptance criteria

- [ ] Every legal transition and representative illegal transition has focused
  reducer coverage.
- [ ] Restore safely handles empty, valid, corrupt, oversized, stale,
  unknown-version, expired, and server-conflicting projections.
- [ ] No forbidden runtime/content/capability value can serialize into session
  storage.
- [ ] Three valid candidates and a no-candidate fixture pass production schemas
  and deterministic grounding/reconciliation checks.
- [ ] Invalid references, overlap/duplicates, invented claims, virality promise,
  and injection fixtures fail with safe rule evidence.
- [ ] Fakes run with no network/credentials, honor abort/time, count calls, and
  never mask an unknown fixture.
- [ ] Sample provenance/rights state is explicit; no unapproved large media or
  visual asset enters Git.

## Focused verification

- [ ] Run contracts plus frontend reducer/persistence/reconciliation tests.
- [ ] Run fixture validation and fake call-count/abort/clock tests.
- [ ] Inspect serialized projections for the forbidden-field sentinel matrix
  and enforce the 256 KiB limit.
- [ ] Run affected lint/typecheck/build commands.
- [ ] Scan tracked changes for real media/content, credentials, signed URLs,
  filenames, and provider payloads.
- [ ] Run `git diff --check` and inspect status without staging or committing.

## Documentation updates

- Add the media-rights record with honest pending/approved fields.
- Document fixture revisions and how later packets may update them without
  replacing the sample in place.
- Update parent and affected tickets if sample rights, recovery privacy, or
  state behavior changes materially.

## Owner gates and external blockers

The deterministic structure may complete without sample-media approval. Actual
sample video/poster/visual binaries and deployment remain blocked on the rights
gate. Mark that evidence unchecked rather than treating synthetic fixture data
as redistribution permission.

## Commit boundary

Keep CL-003 limited to canonical workflow state, safe persistence, fixtures,
and fakes in `CL-003: build the canonical sample session`. Do not absorb
production screens, upload, providers, media processing, or cloud work. No Git
action is authorized by this packet.

## Precision references

- [Canonical workflow and state transitions](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#5-canonical-workflow-and-state-transitions)
- [Shared transcript/candidate/assembly contracts](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#10-shared-contract-vocabulary-and-exact-limits)
- [Versioned sample asset and retention](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#143-versioned-sample-asset)
- [Rights and content rules](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#153-rights-and-content-rules)
- [Reducer and persistence verification](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#203-reducer-and-persistence-tests)
- [Synthetic/licensed fixture matrix](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#206-syntheticlicensed-media-fixture-matrix)

## Completion handoff

Report state/event coverage, persistence allow/deny fields, restore cases,
fixture revisions, fake behavior and call counts, sample-rights status, changed
files, exact checks, and every blocked external artifact. Do not call the sample
rights-cleared unless the owner approved recorded evidence.
