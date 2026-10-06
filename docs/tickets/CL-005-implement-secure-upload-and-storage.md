# CL-005 — Temporary private media admission and lifecycle

## Current cloud-render packet — approved local execution, 2026-10-02

Status: **Chunked browser upload and confirmed-byte progress are implemented and verified with synthetic checks and two protected actual GCS sample attempts. Completed and partial uploads passed normal Exit cleanup with validated renderer cancellation results. Owner-only live AI continuation and public release remain later gates.**

Authority: [Google/Cloud Run migration plan](../architecture/GEMINI_REMOTION_MIGRATION.md); [file inventory](../architecture/MIGRATION_FILE_INVENTORY.md); [later setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md).

Retain useful local intake/clock/cleanup work and the implemented private generation-bound GCS upload, verification, encrypted expiring cleanup intents and independent expiry ports. The owner subsequently authorized the isolated private setup and rights-confirmed test; new external actions retain their gates.

Dependencies follow the numbered migration sequence. After documentation approval, implement one dependency-ready packet at a time and run focused checks plus the required settled five root gates. Fake/live AI and local/cloud compute are independent; cloud render can incur cost with fake AI. Ordinary tests remain synthetic, credential-free, fake/off and zero-network through injected cloud/provider ports. No cloud provisioning, login, credential use, private upload, paid call, Git action, usage polling or new independent review is authorized now.

- [x] Owner explicitly approved documentation and local corrections on 2026-10-02.
- [x] Implement strict generation-bound admission/prepare/render/cancel schemas and bounded encrypted cleanup journal.
- [x] Verify synthetic cleanup/retry/restart/orphan/late-publication behavior through injected ports.
- [x] Verify real GCS resumable upload/cancellation, IAM, bucket settings and independent accelerated scheduled expiry under CL-006's separately authorized private checkpoint.
- [x] Implement the owner-requested chunked browser-to-GCS upload and confirmed-byte progress; actual GCS acceptance remains separately unchecked below.

Current implementation: `packages/contracts/src/cloud-media.schema.ts` and
`apps/renderer/src/expiry/{temporary-intent,upload-capability,media-sessions,gcs-media-store}.ts`.
Admission persists an intent before capability allocation; plaintext capability
is runtime-only. Exact source/generation/CAS fences protect terminal cleanup.
Completion retains only the ten-minute validated output; failures/expiry/cancel
delete and verify all generations, track retries and block intake when unresolved.
Expired orphan/late-upload objects are scanned independently. Journal intent
objects are preserved by the configured lifecycle prefix rule until cancellation/
deletion is verified. Store SDK/REST effects passed the isolated private checkpoint
recorded in [CL-006](CL-006-build-media-job-and-speaker-feasibility.md#completed-private-cloud-foundation--2026-10-02).

Seven focused lifecycle tests passed in the initial prerequisite snapshot.
The settled CL-006 gate passed all five root checks and 383 units; its ticket
records the owner-approved private upload/proxy/render, partial-upload cancel,
generation deletion and separately authenticated scheduler proof. Production
package/schema boundaries and fake operation counts are executable. No Gemini
calls occurred; ordinary tests remain credential-free and zero-network.
Browser/control source transfer is now connected under CL-007. Its current
chunking and cloud-progress gap is recorded below; connection alone does not
establish real browser/cloud acceptance.

## Owner-requested chunked cloud upload and truthful progress — 2026-10-05

The owner wants **chunk uploading so that the progress bar resembles the true
progress of upload to Google Cloud Storage**. Status: **locally implemented and
synthetically verified; actual protected GCS upload/cleanup acceptance remains
pending**. The owner subsequently requested implementation of this upload packet
alone, with validation and testing. The execution record below distinguishes
local evidence from the remaining private-cloud gate.

Pre-change investigation evidence:

- The renderer creates a GCS resumable upload capability in
  [`gcs-media-store.ts`](../../apps/renderer/src/expiry/gcs-media-store.ts).
  [`source-analysis.api.ts`](../../apps/frontend/src/features/source-analysis/source-analysis.api.ts)
  previously sent the entire browser source Blob in one PUT, with no chunk
  loop or upload-progress callback. The flow awaited transfer before analysis
  and exposed labels, not acknowledged byte counts.
- The separate retained-sample backend path in
  [`retained-sample.processing.ts`](../../apps/backend/src/media/retained-sample.processing.ts)
  already copies 4-MiB chunks and checks GCS acknowledgements, but does not expose
  per-chunk progress to the browser. This does not prove uploaded-file chunking.
- [`processing-status.tsx`](../../apps/frontend/src/features/sample/processing-status.tsx)
  previously used an elapsed-time activity animation throughout unfinished real
  processing. Fixture upload percentages are simulated. Local OPFS
  copy/checksum progress measures device work, not cloud transfer.

### Investigation and execution plan — 2026-10-06

The owner prioritizes this packet before
[CL-009's edit-quality corrections](CL-009-build-contextual-visual-assembly.md#investigation-and-execution-plan--2026-10-06).
Investigate and settle the transfer/progress/cleanup plan before changing code;
execute one packet at a time. The initial worktree was clean. This planning pass
read the original 2026-10-05 chat, current code and primary protocol references;
it changed documentation only. It did not upload media or make cloud/AI calls.

**Chosen design:** keep the existing private admitted GCS resumable session and
replace the single browser PUT with sequential bounded Blob slices. Start with
fixed **4-MiB chunks**, a multiple of Google's required 256-KiB unit, and a short
final chunk. This gives finer acknowledgement steps and matches the existing
server sample-copy size. Google recommends at least 8 MiB for throughput; the
smaller initial size is an intentional progress/throughput tradeoff, to measure
in the bounded sample check. There is one capability allocation, one chunk in
flight and no whole-source ArrayBuffer, multipart concatenation or second copy
of the complete source in memory. A file smaller than a chunk honestly has only
one completion step; use a multi-chunk source for the chunking acceptance proof.
See [Google's resumable protocol](https://docs.cloud.google.com/storage/docs/performing-resumable-uploads).

**Resolve the browser transport first.** Copying the backend's
`redirect: "manual"` transfer is unsafe as an implementation assumption: browser
Fetch filters a manual redirect-status response to `opaqueredirect`, hiding
status and headers. The browser proof below corrected the initial assumption
about error mode: Chrome exposes a 308 without Location in that mode, while an
actual redirect is rejected. The selected transport still rejects raw 308 and
opaque responses. Google's own API client
uses `X-GUploader-No-308: yes` to obtain HTTP 200 with
`X-HTTP-Status-Code-Override: 308`. Prove this shape and readable `Range` and
override headers in a browser before relying on it. Use `redirect: "error"`
with this shape so an unexpected real redirect cannot forward media. Do not
silently use following redirects or accept opaque responses. Primary references:
[Fetch HTTP redirect handling](https://fetch.spec.whatwg.org/#http-fetch),
[Google's resumable client](https://github.com/googleapis/google-api-go-client/blob/main/internal/gensupport/resumable.go).

The current session is initiated through the **JSON API** with a bound Origin;
Google documents that JSON and XML CORS behavior differ. Do not assume changing
bucket CORS would expose these JSON response headers. First test a loopback
synthetic browser server, then the existing admitted cloud session in the
separately bounded storage-only check. If required acknowledgement headers are
not browser-readable, stop the direct-header implementation and use a narrow,
session-bound server status port: the browser still sends bytes directly to GCS,
and the renderer queries only the stored session capability to return confirmed
bytes/completion/generation. This fallback must have shared strict contracts,
CSRF/session/expiry fences, bounded call counts and a separately reviewed private
renderer rollout; no client URL or media relay through the backend. Record the
observed transport decision before continuing. See
[Google CORS behavior](https://docs.cloud.google.com/storage/docs/cross-origin).

Execution sequence:

1. **Protocol and upload ownership.** Add a named browser transfer module under
   `features/source-analysis/` and reuse the API's injected transport. Validate
   admitted URL/expiry, source size/type, sequential Content-Range, response
   bounds and cancellation. Let the browser set Content-Length and Origin.
   Keep capability values runtime-only and outside errors/telemetry. Handle
   the tested intermediate acknowledgement shape separately from final object
   metadata; HTTP 200 by itself is not upload completion.
2. **Confirmed offset and bounded recovery.** Derive the next offset from the
   server's inclusive `Range` end plus one. Accept only a prefix starting at
   zero, within the source and bytes actually submitted; reject regressions,
   impossible offsets, malformed ranges and premature completion. A partial
   acknowledgement advances only to its confirmed offset. An ambiguous network
   response permits one empty-body status query on the same session and at most
   one resend of unconfirmed bytes for that chunk, within fixed per-request and
   existing overall deadlines. A status response with no Range means zero
   persisted bytes only where the protocol allows it. Stop after bounded
   no-progress/failure; never allocate again or redispatch processing. Final
   success requires validated generation metadata and full-source completion;
   reject an incomplete override response at the final boundary.
3. **Real progress UI.** Emit `{ confirmedBytes, totalBytes }` after validated
   acknowledgements, including initial zero and final validated completion.
   Wire a runtime-owned, operation-fenced upload phase through
   `source-analysis.flow.ts` and `sample.experience.tsx` into
   `processing-status.tsx`. The bar is `confirmedBytes / totalBytes`, with a
   visible percentage and confirmed/total size. It stays still while a chunk is
   in flight and never increases from a timer, local copy, socket bytes or a
   retry. Show 100% only after final generation validation. Keep inspection and
   Finding moments as distinct phases with unknown completion; switch back to
   their existing activity treatment. Progress must accept measured real-mode
   fractions without relabelling them as fake data. Provide meaningful
   accessibility values without announcing every byte.
4. **Cancel, Exit and cleanup.** Abort the current request/body reader, suppress
   late callbacks, release every listener/timer and stop subsequent chunks.
   Preserve the existing remote-cleanup journal and generation-bound Clear/Exit
   obligations. Browser abort alone is not cloud deletion. Confirm incomplete
   capability invalidation and deletion of a completed uploaded generation;
   pending deletion remains visibly pending with its existing retry obligation.
   Verify terminal/final-ack races and a fresh upload after cleanup. Preserve
   both retained masters and every original private capture.
5. **Safe diagnostics.** Record fixed transfer stage/reason, chunk ordinal,
   confirmed/total byte counts, request duration, response classification,
   status-query/resend counts and terminal outcome. Do not record URLs,
   capability IDs, object names, filenames, media, authentication or raw
   exceptions. Correlate with safe request/operation diagnostics; no debug route
   or persistent browser media log. Sink failure cannot alter the upload.

Primary file ownership:

| Surface | Planned responsibility |
| --- | --- |
| `apps/frontend/src/features/source-analysis/source-analysis.api.ts` and a named adjacent cloud-upload module | Bounded chunk transport, acknowledgements, final generation and injected protocol tests |
| `source-analysis.flow.ts` and `apps/frontend/src/features/sample/sample.experience.tsx` | Upload phase, confirmed progress, operation fencing and exact zero premature AI dispatches |
| `apps/frontend/src/features/sample/processing-status.tsx`, existing shared `Progress` | Measured real upload UI and separate unknown processing phases |
| Existing workspace/session Exit and Clear owners | Reuse cleanup obligations; correct only a reproduced integration gap |
| Contracts/backend/renderer status owners | Conditional only if the browser transport proof requires the session-bound status port |
| Frontend service guide, this section and CL-015 | Commands/evidence, observed transport choice and remaining gates |

Verification and closure:

- [x] Protocol decision has synthetic **browser** proof; Node mock responses
  alone do not prove Fetch filtering or CORS exposure.
- [x] Synthetic tests cover multiple chunks, exact chunk boundary, small file,
  final short chunk, partial/no-progress/malformed acknowledgements, lost final
  response/status reconciliation, one bounded resend, timeout, redirect,
  cancellation, expiry, body bounds and stale callbacks. Assert exact storage
  and status call counts and **zero analysis dispatches before completion**.
- [x] UI tests show correct percentages from confirmed bytes, no timer-based
  growth, no early 100%, clear phase changes and accessible determinate values.
- [x] Regressions cover cancel during a chunk, Exit after upload, a late final
  response and deletion-pending/recovery states. No retained master is deleted.
- [x] Run focused frontend protocol/flow/progress/Exit checks, then settled
  `corepack pnpm format:check`, `lint`, `typecheck`, `test:unit`, `build` and
  `git diff --check`; inspect dependency direction and content/resource safety.
- [x] **Actual storage acceptance:** through the browser-upload branch, upload
  a separately admitted copy of the owner-authorized sample, observe at least
  two chunk requests and exact acknowledgement-driven percentage changes, then
  verify final object size/generation and successful handoff to the next phase.
  Use one completed attempt and one partial attempt for bounded Exit/cancel
  proof; no new resources, broad bucket deletion or AI calls. A server-side
  Use sample copy alone cannot pass browser-progress acceptance.
- [x] Inspect only the owned processing session's cleanup evidence: confirmed
  absent generation and invalidated partial capability, or documented pending
  deletion plus eventual confirmation. Record content-free evidence only.
- [ ] Owner manually runs the normal Find moments continuation if live AI is
  needed. Currently the CTA precedes cloud upload: clicking it starts upload
  **and then automatically invokes analysis**. Merely seeing the CTA does not
  prove cloud completion. The agent's authorized storage-only check must stop
  before analysis; do not bypass that gate or substitute fake results in the
  real flow. Actual normal-flow acceptance remains separately unchecked until
  the owner completes it.

The 2026-10-06 request explicitly permits a bounded sample upload/cleanup check;
it does not permit an agent-run Gemini paid flow. Verify existing admission,
rights, credentials, independent cloud allowance and challenge prerequisites
without reading environment secrets. No paid/cloud test occurred in this
planning pass. Storage proof needs cloud authentication and an admitted session,
but no Gemini key; automatic subsequent AI needs provider keys/live flags and
the owner's manual test. Fake tests stay synthetic, hardcoded paid/live-off,
credential-free and network-isolated. No local AI weights/runtime are required.

Documentation verification for this plan: five Markdown documents parsed with
the installed Prettier Markdown parser; 166 local file/heading links resolved;
`git diff --check` and `node node_modules/prettier/bin/prettier.cjs --check .`
passed. Markdown is excluded from the repository format glob, so parsing/link
checks are its separate evidence. The canonical Corepack/pnpm format launcher
was unavailable in the restricted runtime; no dependency installation completed.
No unit/build/media/cloud check was run for this documentation-only pass.

### Upload implementation and verification — 2026-10-06

The owner authorized **CL-005 alone**. Adjacent
[`cloud-upload.ts`](../../apps/frontend/src/features/source-analysis/cloud-upload.ts)
replaces the single PUT through the existing admitted capability. Sequential
4-MiB Blob slices have one request in flight. Inclusive Range acknowledgements
must start at zero, remain monotonic and stay inside the submitted range.
Final HTTP 200/201 requires the canonical valid generation and exact decimal
source size before completion. An uncertain transport/5xx result gets at most
one empty status PUT per chunk and one resend of its unconfirmed remainder;
malformed replies, regressions and repeated stalls stop the action. Each
request/body read has a fixed 60-second bound, capability expiry and the existing
14-minute flow deadline. Cancellation releases timers/readers/listeners, discards
late responses and suppresses later chunks and analysis dispatch.

The API/flow and sample screen carry runtime-only confirmed/total bytes into the
existing progress component. Percentage and visible byte/MiB counts are measured;
accessibility exposes exact byte counts. Elapsed time cannot advance upload.
Analysis and server sample copy retain unknown-completion activity. Final
generation validation precedes 100%; the phase fence rejects late progress.
A post-challenge abort check prevents a late token from starting analysis after
Exit. Content-free browser records correlate the canonical opaque operation ID
and include ordinal, bytes, duration, status,
queries/resends and fixed outcome reasons; sink failure cannot alter transfer.
No capabilities, media, filenames or raw errors are recorded.

Focused command:

```text
corepack pnpm --filter @clipbuilder/frontend test:unit -- src/features/source-analysis src/features/sample/review-revision.test.tsx src/features/session/session.exit.test.ts
```

**98 tests in six files passed.** Protocol regressions cover exact/small/short
chunks, partial/no-progress/malformed acknowledgements, status-zero and bounded
resend, lost final response/body, timeout/expiry, bounded metadata, redirects,
cancellation and late-body disposal. Integrated flow tests assert zero analysis
dispatches on invalid completion, canceled upload and late verification. Exit
tests cover partial and complete transfer boundaries, pending deletion and
successful retry. Injected Clear acknowledgements do not prove cloud deletion.

**11 native Chrome browser checks passed** against a temporary loopback-only
synthetic storage server using the production transfer module and installed
contracts/Zod. An 8,388,625-byte generated Blob used three data PUTs and reported
`0 → 4,194,304 → 8,388,608 → 8,388,625` confirmed bytes
(`0 → 49 → 99 → 100%`). Exposed Range and 200/308-override drove the steps;
hidden headers failed at zero. An explicitly injected lost final response used
one empty status PUT without resending data. Cancellation after the first ack
made one data PUT. A real redirect sent zero requests to its target. These are
synthetic browser observations, not GCS success or a full app E2E. The in-app
browser tool timed out; installed Chrome ran headlessly in an isolated temporary
profile. Chrome's transparent HTTP retry initially masked socket-loss injection;
the final reconciliation check explicitly discarded the received response.

A separate credential-free Google OPTIONS request accepted PUT and all three
upload request headers. A GET for an invalid synthetic session returned 404;
neither proves exposed Range/override headers on a successful admitted upload.
No credentials, owned media, actual upload session, cloud object, renderer
rollout or Gemini call were used. No normal app service was running, and the
unavailable interactive browser did not obtain the protected challenge/session
needed for the authorized sample proof. That proof remains open. Do not mark
the conditional server-status fallback unnecessary until actual admitted
response exposure is verified.

With `FAKE_MODE=true` and no keys, these checks verify local behavior with no
provider calls or credits. The normal fixture journey still simulates media.
Actual storage acceptance needs existing storage/IAM/cloud allowance and a
protected rights-confirmed session/challenge. Subsequent Gemini analysis needs
keys/live flags and the owner's manual paid test. No local AI runtime/weights
are required. CL-009 editing implementation was not started.

Settled verification: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit`, `corepack pnpm build` and
`git diff --check` passed. The full fake/off suite passed **1,084 tests in 89
files** (33 root, 60 contracts, 3 composition, 460 backend, 429 frontend,
99 renderer). Boundary/negative-import and release-artifact checks passed.
The local frontend inventory contains nine application routes, 1,287 files and
26 external package links; this remains a non-self-contained Windows build,
not an approved deployment artifact. The build-generated route-type imports
were restored to their pre-existing development paths; no unrelated generated
file change is retained. Six changed Markdown documents parsed successfully;
215 local links and 102 heading links resolved.

Read-only scoped validation of the settled unstaged/new upload implementation
and owning documents: **Meets ticket with concerns; no actionable findings
remain in the local implementation.** The operation-correlation gap found in
the first pass was independently confirmed and fixed using the existing opaque
ID schema, with malformed diagnostic IDs omitted and synthetic coverage.
Chunk transport, measured UI, bounded recovery, safe diagnostics, abort fences
and synthetic Exit/deletion-recovery coverage are covered. Actual admitted GCS
response exposure, sample handoff and physical deletion are **unverified**;
normal live AI acceptance remains owner-only. Those gates prevent whole-packet
cloud acceptance. CL-009's earlier planning changes are excluded from this
implementation verdict. No subagent or separate chat review was used.

Owned test processes and listeners on 4186/4187 were verified absent through
two stabilization checks. The exact temporary server/logs/process records and
isolated Chrome profile were removed after path/identity checks. Both retained
masters and original private captures remain untouched. Nothing was staged or
committed. Deviation: headless Chrome replaced the unavailable in-app browser;
the protected actual-storage checkpoint remains open as documented above.

### Actual browser/storage acceptance — 2026-10-06

The owner explicitly requested browser confirmation, then staging/committing
the upload changes before CL-009 implementation. Normal configured backend and
frontend services passed health, `/start` and `/api/sample/config` GET checks.
Public flags reported live analysis enabled; no environment/credential file
was read or changed. The in-app browser again timed out. Installed Chrome used
an isolated temporary profile; its headless attempt stopped at normal human
verification with one grant, no admission, no chunks and no AI requests. Exit
revoked that session. A visible isolated Chrome window completed verification
normally; no challenge was bypassed or solved by the agent.

Two separately admitted processing copies of the authorized retained source
used the actual uploaded-file branch and production transfer/UI code. A
temporary browser-only wrapper recorded content-free bytes/status and blocked
all paid analysis/assembly/render requests; it clicked normal Exit after final
completion or the first partial acknowledgement. It was never added to the app.

- **Complete upload:** one admission, **14 sequential data PUTs** (13 × 4 MiB
  plus 3,742,498 bytes), no status queries/resends. Actual GCS intermediate
  responses were 200 with browser-readable 308 override and `Range`. Exact
  confirmed bytes advanced the visible bar through
  `0, 7, 14, 21, 28, 35, 43, 50, 57, 64, 71, 79, 86, 93%`.
  The final 200 metadata matched all 58,268,450 bytes and a valid generation,
  then the upload phase ended. The immediate phase change need not paint a
  separate 100% frame. No server status fallback is needed for the observed
  admitted GCS responses.
- **Partial Exit:** one admission, one acknowledged 4-MiB chunk (7%) and one
  in-flight next PUT canceled by Exit. No final object completion, later data
  request or AI request occurred. The UI returned to the landing page.
- **Cleanup:** both normal Exit requests returned 204. Their existing private
  renderer `cancel` calls subsequently returned 200, completed response/schema
  validation and success (1,076 ms and 690 ms). The cancel contract accepts
  only `{deleted: true}` after capability cancellation, generation-fenced
  deletion/absence checks and a session-scoped remaining-artifact check. This
  confirms deletion through the existing cleanup API; no independent bucket
  inventory was fetched. One empty browser status query after partial cleanup
  was not browser-readable and supplies no additional revocation evidence.
- **Boundaries:** **zero AI dispatches and zero blocked AI attempts** in both
  browser traces; no provider retry, new resource, cloud rollout or arbitrary
  bucket operation. Both retained masters and original private captures were
  preserved. Paid normal Find moments continuation stays unchecked above.

The earlier synthetic/validation records describe the preceding implementation
pass; their open actual-storage items are superseded by this evidence. No code
changed for this acceptance run, so the settled five root gates and 1,084 tests
remain the implementation evidence. Fake/no-key tests still prove synthetic
behavior only. Actual storage used the existing independently approved cloud
connection; real AI quality still requires the owner's keys/live flags and
manual test. No local AI runtime or weights are involved.

The test browser's nine owned process identities and port 9228 were verified
absent, including a stabilization check. Its profile, wrapper/helpers and
browser logs were removed using checked absolute paths. Content-free acceptance
counters and normal app lifecycle records remain in OS-temp. Healthy normal
frontend/backend services remain running for the subsequent editing work.

Required implementation and acceptance:

- [x] Send browser uploads through the existing admitted resumable capability in
      bounded, protocol-compatible chunks. Retain private origin restrictions,
      byte/type limits, session/generation binding, expiry and cancellation;
      avoid full-source buffering and duplicate upload allocation.
- [x] Track acknowledged bytes against the exact source size. Advance the
      determinate upload bar from GCS-confirmed offsets, not a timer or bytes
      merely queued by the browser. Keep it monotonic and do not double-count
      retransmitted bytes. Show completion only after final storage success and
      a valid generation response; keep subsequent verification/analysis clearly
      separate from upload progress.
- [x] Wire measured progress into the live flow and shared progress UI, including
      accessible percentage/state announcements. Preserve an indeterminate
      indicator for phases whose completion cannot be measured. If the local
      retained-sample copy displays upload percentages, provide server-confirmed
      copy counts; otherwise keep that phase explicitly indeterminate.
- [x] Verify browser-visible GCS acknowledgement/status and CORS behavior,
      including intermediate 308 responses and exposed acknowledgement headers;
      do not assume the server transfer adapter can be copied into browser code.
      Handle partial or ambiguous acceptance using the existing bounded policy,
      without following unexpected redirects, blindly resending data or creating
      another processing attempt.
- [x] Preserve approved diagnostics and add useful content-free transfer records:
      chunk index, acknowledged/total bytes, duration, status and safe failure
      codes. Keep upload capabilities, credentials, filenames and media outside
      ordinary logs, UI errors and tracked evidence.
- [x] Add synthetic regressions for multiple chunks, final short chunk, correct
      acknowledgement/progress, failure/stall, ambiguous or malformed responses,
      cancellation and late callbacks. Prove progress stops on failure/cancel,
      partial media follows existing cleanup, and no AI provider is dispatched
      before successful upload completion. Run focused checks and settled root
      gates after implementation; record actual browser/cloud evidence separately.

Fake-mode verification can use synthetic files and injected storage responses
without keys, network or credits; it does not establish real GCS browser behavior.
Actual cloud verification requires configured storage credentials/IAM/CORS and
the applicable cloud approval. Storage transfer itself does not require a Gemini
key; later live transcription/analysis does. The latest owner request authorizes
the upload implementation and bounded storage check, not automated paid AI or
renderer deployment. Public release remains gated.

## Cross-ticket audit correction — 2026-10-03

The owner authorized correction of the full-history audit findings. The retained
browser probe still required portrait H.264/AAC encoding even though the current
cloud migration assigns final encoding to the private renderer. New worker
regressions reproduced that rejection before the correction.

The production probe now verifies secure OPFS access and cancellation. Actual
source inspection still validates supported tracks, decoding, dimensions, clocks
and public bounds before readiness; workspace locking, quota and journal checks
remain required. No browser output encoder or canvas is required by intake or
restore. The opt-in historical encoding/audio harness is unchanged.

Changed: frontend source worker, its new regression file, frontend guide and this
packet. Focused worker/workspace/client/audio verification passed **47 tests in
four files**. Six worker regressions cover absent/unsupported encoders, insecure
or missing storage, denied access and cancellation during pending access.
The combined settled gate passed all five root commands and **665 tests in 66
files**; final read-only revalidation found no actionable findings in the three
corrections. Exact commands, test counts and limits are recorded in
[CL-010](CL-010-deliver-automatic-clip-review.md#settled-cross-ticket-verification-and-revalidation--2026-10-03).
Synthetic fake/off tests use no keys or network; real decoder/device behavior,
Gemini quality and cloud rollout remain unverified. No retained owner media,
environment or provider/cloud resources were mutated. Nothing was staged or
committed.

<details>
<summary>Earlier packet and evidence, retained as history where superseded</summary>


Status: Local foundation validation passed; owner confirms CL-006 dependency handoff, external release gates open<br>
Milestone: M2 - browser-owned media foundation<br>
Last synchronized: 2026-10-02<br>
Depends on: CL-001, CL-003, CL-004 and CL-004A's documentation handoff<br>
Blocks: CL-006, CL-007, CL-011<br>
Suggested commit: `CL-005: establish and validate browser-owned media`<br>
Parent plan: [source of truth](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#09-browser-owned-media-architecture-revision-2026-10-01)<br>
Current technical contract: [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md)<br>
Ticket index: [README.md](README.md)

## Objective and owner decision

Original video, transcript/candidates, assembly assets and final output belong
to one disposable browser workspace. No application database or cloud object
storage service: this is not the former GCS-backed database-free design.
The old secure resumable upload/storage packet is withdrawn, not completed or
deferred to deployment. Keep the filename stable for existing references;
the new title/scope govern execution.

Implement real local intake, browser storage/lifecycle and actual immutable
candidate-range playback using CL-004's existing single-card UI. Establish
protected request-admission foundations and migrate the legacy contracts,
state/recovery and configuration that would otherwise force a server-media job.
Do not implement transcription, full active-speaker processing, contextual
assembly or final production export early. First prove that the recommended
browser pipeline can meet its essential media/storage/transport boundaries.

This planning revision authorizes no code, package/model installation, media
inspection, paid call, cloud mutation, Git action or deployment by itself.
Execution requires the owner's separate request for this packet. Fake/off
foundations may proceed independently; external proof stays gated.

## Product and architecture invariants

- One owned/licensed MP4 or WebM, 15 seconds through 20 minutes AND <=500 MiB
  publicly; one chosen contiguous 10-60s clip. Do not lower those ceilings or
  add internal filler cuts without an explicit source-of-truth revision.
- Preserve one changing responsive card, design-system primitives, smooth
  selection/layout motion, portrait video priority and glass inline controls.
  No re-created screens/editor; no app-level animation suppression restored.
- Original video and final output never reach the application backend.
  Backend AI receives only disclosed bounded audio/text in later tickets.
- OPFS owns large binaries, IndexedDB bounded normalized records; File/Blob,
  handles, controllers, workers and URLs are runtime-owned. No video/base64 in
  sessionStorage/localStorage, no durable history and no duplicated IDB source.
- The backend cannot open browser storage. No Python Light-ASD, native ffprobe
  or server FFmpeg path is presumed retained. Browser active-speaker quality is
  a CL-006 gate, not solved by face landmarks.
- Keep `FAKE_MODE=true`, derived `PROVIDER_MODE=fake`,
  `PAID_DEMO_ENABLED=false`, and all live flags false in defaults/tests.
  Real composition never falls back to synthetic success.
- 1080x1920 H.264/AAC is the existing output target; code presence is not proof
  of actual encode/mux/playback or universal browser/device support.

## Dependency evidence

Read the current source of truth section 0.9 and linked architecture contract,
then inspect actual code. CL-004's development preview is locally verified at
`c4f226b`, with documentation at `2efee17`; the pre-change root gate passed
249 tests. This is historical fake-baseline evidence, not browser-media proof.

Reuse the canonical reducer, session effect ownership, immutable review
bundles, range reconciliation and design system. The fake session's bounded Map
and fixture cookie are not production admission or distributed coordination.
CL-004A supplies provider/cost/software guides, not actual account approvals.

### Documentation-pass evidence (2026-10-01)

This pass changed only 25 Markdown files: source of truth, browser research/
architecture contract, CL-003/004 migration handoffs, CL-004A/005-015 packets and
index, documentation index, provider/cost/software guides, and root/frontend/
backend/demo READMEs. Application source, environment example, dependencies and
lockfile were not changed. Nothing was staged/committed and no provider/paid/
cloud action, media/model download or benchmark was performed. Public upstream
source/docs were read for research; no ignored secret file was inspected.

Read-only verification: repository-installed Prettier Markdown AST parsing of
all 25 changed/new documents; 188 relative file targets and 100 heading anchors
resolved, with no missing links or unmatched historical details fences.
`corepack pnpm format:check` and `git diff --check` passed. The repository
intentionally ignores Markdown in Prettier, so the format gate is not a Markdown
formatting claim. No application tests were rerun for this docs-only pass;
the earlier 249-test baseline above is not new media verification.
All implementation/spike/owner acceptance boxes remained unchecked in that
documentation pass. The execution evidence below is separate.

### Phase-1 execution evidence (2026-10-01)

The owner separately requested execution and approved the proposed exact
Mediabunny installation and synthetic full-bound local benchmark with "go for
it." Approved benchmark targets: full audio extraction <=5 minutes, 60-second
portrait encode <=2 minutes, additional memory <=512 MiB and A/V drift <=80 ms.
This did not authorize real visitor media, providers, paid/cloud actions,
deployment, Git mutation, local retention or universal device claims.

Installed frontend-only `mediabunny@1.61.0`; Node `v22.23.2`, pnpm `11.19.0`.
MPL-2.0 inspected against upstream
`0f91fe768e7ee42703f15e2b8845551b0f1028b3` and the installed manifest/license.
Its type dependencies `@types/dom-webcodecs@0.1.13` and
`@types/dom-mediacapture-transform@0.1.12` declare MIT. No native stack, AAC
WASM, model/weights or private media was installed/read. Preserve required
notices/source availability before distribution; fallback codec licensing is
still conditional. No third-party code was modified.

Reproducible synthetic-only harness:
`apps/frontend/feasibility/browser-media/`; command and measurement procedure
in its [README](../../apps/frontend/feasibility/browser-media/README.md).
It is not mounted in `/start`. A GET-only loopback server delivers the pinned
bundle, worker and page with harness-only COOP/COEP/CSP. There is no upload,
provider, production intake, IDB journal or final download endpoint. Tests
cover fixed routes, bundle resolution, traversal/non-allowlisted rejection and
no POST. Seven harness tests passed; the exact command
`corepack pnpm --filter @clipbuilder/frontend test:unit -- feasibility/browser-media/server.test.mjs`
ran all 13 frontend files / 139 tests in this pnpm invocation, not only that
file. `corepack pnpm --filter @clipbuilder/contracts test:unit` passed 38 tests,
including independent exact 500-MiB/20-minute acceptance and +1-byte/+1-ms
rejections. Those are schema boundaries, not additional giant media fixtures.

Measured platform: Windows laptop, Intel Core i7-10810U @1.10GHz, 12 logical
processors, 16,760,946,688 bytes physical RAM; Codex in-app Chromium runtime UA
`Chrome/154.0.0.0`. The UA is reduced; no exact patch or independent Chrome
browser claim is inferred. Secure context, OPFS, worker WebCodecs, Web Locks
and the exact native H.264/AAC encoder configurations were supported. Probed
portrait AVC `avc1.420028`, 1080x1920, 30fps, 4Mbps and AAC `mp4a.40.2`,
48kHz mono, 128kbps; actual encoding/mux/worker decode/native playback followed.
The full generated source encoded as AVC `avc1.64001f`, 1280x720, 30fps,
3.3Mbps CBR with 48kHz mono AAC. No claim is made for other profiles/devices.

| Actual local observation | Result |
| --- | --- |
| Small portrait, then fresh repository-harness smoke run | 2-second H.264/AAC; 116,213 bytes; encode 1,100.545 ms initially / 873.935 ms smoke; native playback and refresh/reopen verified |
| Generated full source | 1,200 seconds; 514,629,785 bytes (490.789 MiB); 36,000 frames; generation 137,381.12 ms; 491 writes, maximum 1 MiB |
| Full-source audio extraction | 7,512.04 ms; 10,244,799-byte mono Opus/WebM under the spike's 16-MiB cap; 21 writes, maximum 1 MiB |
| Audio reopen/decode | Container duration 1,200 s; 57,600,856 decoded frames at Opus' 48-kHz clock, 1,200.017833 s including trailing codec padding |
| Selected [600,660] portrait transcode | 16,858.465 ms initially / 20,984.895 ms repeat; 1080x1920, 30fps, H.264/AAC; 33 writes, maximum 1 MiB |
| Exact presentation-duration remux | 162.625 ms initially / 154.595 ms repeat; 33,144,580 bytes; worker/container and native HTML duration exactly 60 s; actual playback verified |
| Decoded flash/tone sync | 0.208333 ms drift at 1, 30 and 59 seconds |
| Whole-source incremental copy/reopen/delete | 903.835 ms; matching 514,629,785 bytes / 1,200 s; maximum File-stream read chunk 2 MiB |
| Actual source range playback | Started near 600.250345 s, paused exactly at 660 s after end-seek; range was not manually changed |
| Two-tab exclusive mutation | Second copy waited 5,548.93 ms while the first held the Web Lock; copied only after release, then deleted its copy |
| Injected quota-style mid-write failure | 4,194,304 committed bytes before failure; reader/handle closed and partial copy deleted |
| Conversion cancellation | Partial portrait deleted, input/handle closed, valid source retained; no completed file published |
| Explicit deletion and missing-artifact reopen | Owned OPFS folder absent after player release; reopen failed rather than creating playback; empty retry folder removed again |

AAC padding initially produced a 60.010667-second MP4. The spike remux uses the
library's encoded packet API to bound final packet **presentation durations**,
preserving the full source selection, priming packet and encoded bytes, not
shortening the chosen conversation or hand-editing MP4 boxes. Decoded trailing
AAC samples may still contain codec padding; do not conflate them with the
bounded container presentation. CL-011 must preserve and regression-test this
timing behavior before product download. A decoded sample chunk timestamp
difference of 9.333 ms is not sync evidence; the actual flash/tone comparisons
above are the sync measurement. Synthetic tones do not prove speech/STT quality.

Browser memory sampling: 5,376,682-byte baseline, 52,041,813-byte sampled maximum
during the full run. Independent 250-ms process sampling over 180.25 seconds /
685 samples observed aggregate Chrome/Codex private-memory delta 191,381,504
bytes and working-set delta 210,972,672 bytes. This includes unrelated process
activity and is not an isolated GPU/native peak measurement. Observations are
below 512 MiB; a universal/strict isolated-peak pass is **not** claimed. A 50-ms
main-thread heartbeat had maximum foreground gaps around 79 ms and no long
tasks on the primary run; the second-tab run recorded one 64-ms long task.
Background visibility entries at reload do not prove OS suspension recovery.

Working-set preflight proposal, derived from existing public/assembly caps:
source + bounded compressed audio (16 MiB provisional) + at most 3x15-MiB assets
+ final output (200 MiB) + scratch (one 200-MiB remux output + 8-MiB I/O)
+ reserve max(64 MiB, 10% subtotal). At the public source ceiling this is
1,117,677,159 bytes (about 1.04 GiB); the spike's 1.3-GB estimated-free check
is conservative for this proposal. Estimates are not reservations; actual
write denial still needs cleanup. The runtime reported 10-GiB origin quota.
The portrait spike uses a smaller 64-MiB cap, not a changed public output cap.
Production scratch/image/audio profiles may require revisiting this formula.

**Verdict:** conditional go for the native worker/Mediabunny media route on the
measured Windows Chromium laptop; no-go for declaring the entire feasibility
gate, production persistence, universal device support or public paid release
complete. Committed/default/test fake/off composition and product UI are
unchanged in that spike slice. Phase 2/3 were not implemented at that checkpoint;
the subsequent execution record below supersedes that implementation status.

Remaining proof at this checkpoint: private-mode storage, real quota
denial/automatic eviction, OS/browser freeze, isolated resource-pressure
performance, journal/epoch/recovery/expiry
and admission. Local compressed audio is promising, but speech quality,
actual received-body/duration validation and deployed transport remain
CL-006/007/015 gates; no transcription call occurred.

Owner decision approved on 2026-10-01, explicitly relayed from the side chat
with the owner's response "i approve it, send validation notes too": one
non-renewing workspace with two-hour logical
expiry from source admission, best-effort storage, Clear/replacement cleanup,
active/next-open deletion and explicit disk-survival disclosure. This does not
limit processing to two hours or promise deletion on close. Partial cleanup
intent survives. No durable-storage permission/history is approved.
Supported release claims and anonymous paid
deployment safeguards also remain unapproved. Rights/visual/accessibility/
provider/privacy/spend/cloud evidence is not supplied by this synthetic spike.
Both temporary servers and all test tabs were stopped/closed; OPFS media and
measurement records were explicitly removed. No Git action was performed.

Final gate for this partial feasibility slice: `corepack pnpm format:check`,
`corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`
(256 tests: 11 root, 38 contracts, 68 backend, 139 frontend) and
`corepack pnpm build` all passed. `git diff --check` passed. Boundary-negative
fixtures and deterministic no-network setup remain passing. Markdown is ignored
by the format command; it is not Markdown formatting evidence. This gate does
not complete CL-005 or any unperformed storage/provider/owner check.
Separate Markdown AST parsing passed for the five changed/new owning documents.

### Phase-2/3 execution and independent recheck (2026-10-01)

The owner requested a thorough independent recheck of every side-chat finding,
fixes for confirmed issues, documentation and another validation handoff.
No Git mutation, provider, cloud, paid call, deployment or real visitor media was
authorized or performed. The first 256-test gate above was a spike checkpoint,
not evidence that the later local foundation was complete.

| Reported finding | Independent result, repair and evidence |
| --- | --- |
| Journal opening Promise/type mismatch and missing sync-access-handle type | Confirmed after rebuilding contracts and running fresh frontend TypeScript. Opening is now explicitly `Promise<IDBDatabase>`; worker-only sync access uses a structural capability guard. IDB tests prove request-success is not commit, transaction abort fails, late/blocked/version-changed opens close, and unknown/corrupt records are rejected. OPFS tests cover failed open/truncate/write/flush/validation, bounded partial writes and cancellation. |
| Additional source-nullability/export errors | Not reproduced after rebuilding published contract declarations. No cast or nullable-source workaround was added to suppress stale-build diagnostics. Contracts are rebuilt in the final typecheck/build chain. |
| Media/persistence code existed without canonical UI integration | Confirmed. Local mode now creates one runtime artifact owner in the existing provider; the same reducer models local preparation/actual copied bytes, then source-ready. The existing card, glass player, selection motion and candidate details are reused. Recovery bypasses fake server evidence and revalidates actual OPFS bytes/descriptor; no automatic provider call occurs. |
| Protected admission and legacy config migration missing | Confirmed. Added bounded process-local boot-bound grants/action reservations/receipts with injected fake transport tests. Removed GCS/native executable/model/job/upload/render config and signed media capability response assumptions; migrated shared source revision/public capability schemas, fixtures, tests and pre-import guards together. |

Additional correctness repairs found during that recheck:

- Cleanup fences worker results synchronously before I/O; pending/ready metadata
  is not presented as atomic with OPFS. Consumer release precedes URL revocation.
  All copy-handle acquisition/write/finalization paths close/delete partial work.
  Analogous feasibility-harness output/handle setup paths now have outer ownership
  guards, including failure before codec/output construction completes.
- A denied sessionStorage marker write cannot skip worker stop or media deletion;
  IDB's clearing record is an independent fence. IDB denial retains the legacy
  marker. If both stores refuse writes and physical deletion also fails, durable
  cleanup intent cannot be guaranteed: the UI requires staying open/retrying, not
  a claim of confirmed deletion. No unrelated origin stores are cleared.
- A lease completing after disposal is explicitly released. Another tab cannot
  clear the active owner's workspace. Content-free BroadcastChannel release
  notifications only request re-acquisition through Web Locks; they are not
  authority. Missing notifications do not permit mutation without a lock.
- Ready-source recovery compares the full normalized descriptor and a bounded
  `sha256-chain-v1` identity: 1-MiB chunks hashed separately, then chained from
  an all-zero 32-byte seed. It is not a plain whole-file SHA-256. No filename,
  original binary, Blob URL, controller or worker enters the journal/reducer.
  The version-1 journal implicitly fixes this algorithm; an algorithm change
  requires migration/versioning. Source mismatch, future admission time, expired
  record and corrupt version fail closed; stale cached analysis cannot inherit
  a changed descriptor. Assembly fields, when present, bind the selected exact
  word endpoints and analysis revision; no real assembly is produced/restored
  to a synthetic final review in this ticket.
- Native playback follows the actual HTML video clock, clamps seeks and pauses
  at the immutable source end. Exact end events no longer re-seek indefinitely.
  Native frame callbacks/listeners/thumbnail consumers close before URL release;
  fake-only timers never drive actual media. Pending source preview reads its
  actual metadata duration instead of displaying the public ceiling as duration.
- Cached local selection/closing is journaled without delaying selection motion.
  Local analysis/build/render never dispatch to the synthetic adapter. No final
  download or simulated real success is exposed. Real privacy copy discloses
  fixed expiry, eviction and disk survival, instead of claiming no File reads.
- Grant keyrings are canonical 32-byte base64url keys, bounded to four, with the
  active key validated during explicit composition. Retired true upload/render
  flags and public protected/paid composition are rejected. JSON consent errors
  map to safe 400 responses. Clock rollback during abuse verification is checked
  again before spend. Tests force new grant/budget gates off at module load.

Implemented ownership and limits:

- `apps/frontend/src/features/media` owns runtime File/URL, worker protocol,
  actual capability/track inspection, 1-MiB OPFS source writes, quota formula,
  versioned <=8-MiB IDB journal and one fixed two-hour workspace. At most eight
  opaque artifact references are allowed. Actual fingerprint/codec buffers are
  bounded; there is no whole-source ArrayBuffer/base64 or IDB video duplicate.
  Source admission enforces inclusive 15s..20min AND <=500 MiB before paid work.
- Native portrait H.264/AAC configuration plus actual small encode/mux/decode
  are probed before local readiness. OPFS, IDB, reliable Web Locks or codec
  denial blocks readiness. A memory fallback is deliberately not enabled
  because the complete fallback output path is not proved; this follows the
  ticket's fail-before-paid-work branch rather than narrowing public limits.
- `apps/backend/src/admission` reserves four one-use action slots per grant,
  exact-origin/CSRF authentication, bounded rate/capacity/process-dispatch budget,
  and nonce/request-digest terminal/uncertain tombstones through expiry. Capacity
  never evicts live replay protection. Underlying transport retains its active
  slot until it settles even after abort. Adapter contract is exactly one call
  and zero automatic retries; lost content is not stored/replayed/refunded.
- Default grant flag and dispatch budget are off/zero. Even explicitly enabled
  local foundation composition uses a rejecting abuse port and no paid provider
  adapter. Secure host-only grant routes do not trust forwarded protocol headers.
  Actual same-origin audio/provider transport belongs to CL-007/015. Receipt
  integrity is not authorization, durable coordination or proof of unseen source.

Fresh local synthetic browser evidence, separate from the full-bound spike:

- On the measured Windows in-app Chromium runtime, generated a 20-second
  H.264/AAC fixture and selected it through the actual drop handler. Existing
  local owner performed probe/inspection/fingerprint/copy/journal publication;
  the canonical card showed actual native 1280x720 playback, 20.010667s duration,
  and a truthful unavailable-analysis state. No original reached the backend.
- Refresh reopened/decoded the committed source and returned paused source
  preview with no synthetic analysis or download. A second tab was refused
  without deleting the source; after the first closed, Reconnect acquired the
  lock and recovered the same file. Clear followed by refresh returned empty
  intake. Fixed TTL/corrupt/clock/quota/partial-state cases additionally have
  deterministic injected tests; these are not actual eviction/private-mode proof.
- The actual shared player ran immutable [5s,18s] from the generated source:
  observed 5.278157s while playing, then paused at exactly 18s. This validates
  playback binding, not real candidate AI or a completed cut/compositor.
- Desktop/default, 1024x600 short laptop, 768x1024 tablet and 390x844 phone
  viewport checks preserved the bounded central portrait/glass controls and no
  horizontal overflow (effective DOM widths 1020/764/386 include scrollbar width).
  These are responsive viewport checks under the owner's demo verification scope.
  Real-mode privacy dialog was checked. Visual owner approval, screen reader,
  full 200% zoom/forced-colors and motion accessibility remain unchecked.
- Product-path proof used a temporary synthetic-only config-injected route
  with the real `SampleExperience`, not an alternate workflow or deployed
  backend/provider E2E. That route was removed before the final build. The
  pre-existing port-4000 process served stale public config, so normal `/start`
  readiness on that process is not claimed. Owner app listeners were preserved;
  no origin/config/port workaround is shipped. The opt-in 4185 spike server was
  stopped, agent test tabs closed, viewport reset, and synthetic OPFS/measurement
  artifacts explicitly cleaned. Proof screenshots outside Git contain only
  generated test media.

Final root verification after code settled: `corepack pnpm format:check`,
`corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`
(311 tests: 11 root, 38 contracts, 85 backend, 177 frontend) and
`corepack pnpm build` all passed. Contract/browser negative boundaries and
pre-import network interception passed. Production routes contain no temporary
proof route. `git diff --check` passed. Markdown is excluded by the format gate;
repository-installed Markdown AST parsing passed for all 21 changed/new
documents after the owner-directed verification-policy cleanup.

Owner verification decision (2026-10-01): automated checks, measured
desktop-browser behavior and responsive viewport emulation are the demo gate.
No hardware certification or cross-engine matrix is required. Keep capability
probes, explicit unsupported states and truthful limits on public claims.

Remaining unchecked observations are private-mode/actual eviction/freeze/resource
pressure, owner
release/support/visual/accessibility decisions, MPL distribution notices,
rights/provider-transfer/privacy/spend approval and deployed transport/restart/
rollout guarantees. No universal support, public paid enablement or CL-006 work
is inferred. Concurrent owner-authored startup/README/AGENTS edits were preserved
and are not claimed as this implementation's changes. Nothing staged/committed.
Revalidation was requested in the same human-authorized side chat after this
settled handoff; no independent verdict is inferred from sending the request.

### R3 cross-tab disposal correction (2026-10-01)

The side chat's newly reported early Web Lock release was independently
confirmed. `BrowserWorkspace.dispose()` aborts its lifetime before draining the
worker, queued writes and an already-started clear. The lock adapter had kept
an acquisition abort listener that released the granted lease at that first
abort. Generation fencing prevented publication, but did not serialize already
started storage work against another tab.

`workspace.lock.ts` now detaches acquisition cancellation as soon as a lease
is granted. The owner explicitly releases that idempotent lease only after its
existing worker-stop/write/clear waits and journal closure. Pending or refused
acquisition still aborts and closes its advisory channel; a late callback after
cancellation returns without retaining a lock. Release notifications cannot
precede draining merely because the lifetime signal was aborted.

Five focused regressions were added in `workspace.lock.test.ts` and
`browser.workspace.test.ts`. They exercise the actual lock adapter with delayed
worker stop, an in-flight journal write and an already-started clear transaction;
another acquisition remains refused until disposal drains and closes the journal.
They also cover abort after grant, abort before/during acquisition, late callback
cleanup and idempotent release/notification. Temporarily restoring the old abort
path caused three new regressions to fail; restoring the repair passed all
18 tests across these two files. No app restart, real media, provider, paid,
cloud or Git action was needed.

The settled correction passed all five root gates: `corepack pnpm format:check`,
`corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`
(316 tests: 11 root, 38 contracts, 85 backend, 182 frontend) and
`corepack pnpm build`. `git diff --check` and ticket Markdown AST parsing passed.
This supersedes the earlier 311-test gate for the current implementation.
The R3 finding is independently resolved by the R4 pass below. This correction
does not grant release approval or close the remaining feasibility observations.

### R4 independent revalidation (2026-10-01)

The same human-authorized side chat reviewed the settled unstaged/untracked
implementation and owning documentation. Its combined changed-file fingerprint
`E2B9E598B04B502CE993A0A7D980CB777ECDF9BCC0C2C52099C4ECA6C2D50BC1`
was stable at review start/end; the staged index was empty. Unrelated
owner-authored startup/AGENTS/root README work was excluded from its verdict.

Verdict: **Meets ticket with concerns** for the implemented local foundation;
**No actionable findings**. The reviewer independently resolved R3 after
inspecting acquisition cancellation, explicit idempotent release, disposal
draining and journal closure. Previous typing, integration, admission/config and
resource-closure dispositions remained resolved; stale-contract diagnostics
remained retracted rather than suppressed.

The reviewer independently ran
`corepack pnpm --filter @clipbuilder/frontend exec node ../../node_modules/vitest/vitest.mjs run src/features/media/workspace.lock.test.ts src/features/media/browser.workspace.test.ts`:
2 files / 18 tests passed. The 316-test root gate, synthetic-browser observations
and old-path mutation check remain main-chat execution evidence, not new side-chat
full-suite/browser reruns. No file, index, configuration, app-process, provider,
paid, cloud or later-ticket mutation occurred in that review.

The implementation-validation loop is clean on that snapshot. Local foundation
verification is not whole-packet completion: actual storage/lifecycle/resource-
pressure observations, final audio/deployed transport and owner/license/rights/
visual/accessibility/privacy/spend/release decisions remain open as recorded.
No staging, commit, CL-006 execution or public paid approval is inferred.

## Phase 1: feasibility before committing the implementation choice

### Owner handoff clarification (2026-10-02)

The owner clarified through the side conversation that CL-005's validation
passed completely on 2026-10-01 and instructed the execution chat to correct
the documentation and continue CL-006. The existing R4 record above independently
reports no actionable findings; the 316-test/five-root-gate and measured
full-bound desktop-browser evidence are already recorded in their owning passes.
This clarification supplies the local dependency handoff to CL-006. Stale
unchecked aggregate boxes below must not be used to block that authorized work.

It supplies no new observation or blanket release approval. Private-mode,
actual eviction/freeze/resource-pressure observations remain unperformed as
previously disclosed; audio quality/profile/model proof belongs to CL-006,
and deployed transport/provider/privacy/paid/support/license/rights/visual/
accessibility acceptance remains separately gated. Preserve the historical
conditional spike verdict and exact evidence rather than checking an aggregate
box for observations that were not made.

During CL-006's new full-bound audio check, the existing harness passed
`generate` directly as a Web Lock callback after its duration parameter had
been added for the 20-second fixture. The native callback supplies a Lock
object, so the numeric generation loop emitted no frames: the fresh observation
was a 176-byte, zero-duration file. The scoped prerequisite repair wraps the
callback to call `generate()` with its numeric default and rejects invalid
synthetic durations before opening/truncating an artifact. This is a harness
repair, not an application/media architecture change. New full-bound regression
evidence and required local checks are recorded with the CL-006 pass; no fresh
independent validation is inferred from the earlier R4 verdict. The corrected
generator produced 1,200 seconds / 514,629,785 bytes in 146,327.38 ms, with
1-MiB maximum writes. The repeated selected-range export/remux produced an exact
60-second 1080x1920 H.264/AAC artifact; decoded flash/tone differences were
0.2083 ms at 1/30/59 seconds, and native playback reached its end. These are
fresh synthetic regression observations, not new private-mode/eviction/freeze
or release acceptance. The [CL-006 audio evidence](CL-006-build-media-job-and-speaker-feasibility.md#audio-execution-evidence-2026-10-02)
owns the new pipeline checks and cleanup record.

- [x] Pin proposed Mediabunny/runtime versions, inspect MPL-2.0 and any AAC WASM/
      FFmpeg build licenses, and obtain installation/download approval first.
- [x] With approved synthetic local media, prove range preview, worker decode,
      incremental OPFS write/read/delete and a small portrait H.264/AAC
      encode/mux/reopen/playback validation. This is a spike, not CL-011.
- [ ] Before a feasibility go, exercise a generated 20-minute source near the
      500-MiB ceiling outside Git and exact independent limit boundaries;
      extract full audio and export a 60-second 1080x1920 H.264/AAC range with
      bounded queues/memory. Include cancellation, reload, background suspension
      and output validation. Agree measurable time/memory/responsiveness/sync
      thresholds first; unperformed storage/lifecycle observations remain open.
- [x] Probe exact source/target codec configurations, not just API presence.
      Record unsupported platforms honestly; native AAC fallback is conditional.
- [x] Demonstrate bounded queues/backpressure/resource closure; no whole-source
      ArrayBuffer/base64, full-source frame cache or hidden IDB video duplicate.
- [ ] Establish quota working-set formula from source + bounded audio/assets/
      output/scratch/reserve; exercise denial, eviction and mid-write failure.
- [ ] Compare a full-bound audio transport profile: 20min 16kHz mono 16-bit WAV
      is 38,400,000 bytes plus headers and exceeds HTTP/1 Cloud Run's 32-MiB cap.
      Prove end-to-end HTTP/2 or a quality-preserving compressed profile with
      actual duration/body validation; never silently add transcription calls.
- [x] Record measured desktop-browser environment, procedure, licenses and
      explicit conditional go/no-go. Small synthetic tests alone cannot prove
      full-duration performance, transcription quality or active-speaker quality.
- [ ] Obtain owner decisions for local disk-retention disclosure, supported
      release claims and no-shared-store paid deployment guarantees
      before those real/privacy/public paths are enabled.

No-go blocks downstream assumptions. A remote original-video upload, server
render fallback, silent WebM export or generic-crop substitute is not authorized.
Audio profile/hosting conclusions may remain conditional until CL-006/015 proof,
but the implementation must expose the unavailable state and name the gate.

## Phase 2: local workspace and intake

- [x] Retain selected File in one runtime artifact owner; inspect container,
      actual supported tracks/duration/dimensions/rotation and byte limits.
      Filenames are neither persisted nor transmitted.
- [x] Immediately preview via owned Blob URL, then stream one copy into OPFS
      when storage is supported and enough estimated working space exists.
- [x] Implement bounded versioned IndexedDB journal; transaction completion,
      not individual request success, commits metadata. OPFS/IDB publication
      uses pending/ready status and orphan reconciliation, not pretend atomicity.
- [x] Use opaque artifact IDs/epochs, one exclusive cross-tab mutation owner,
      stale-result fencing and content-safe errors. BroadcastChannel does not
      replace a lock. Fail closed for persisted mutation without reliable locking.
- [x] Implement owner-approved two-hour logical expiry and active/next-open cleanup.
      Tab close cannot promise immediate physical deletion.
- [x] Memory-only fallback proceeds only when the entire bounded source/output
      path is viable. Refresh asks re-selection plus validated source identity;
      wrong-source cached results are rejected. Otherwise fail before paid work.
- [x] Clear/replacement/cancel fence new results, stop requests/workers, close
      codecs/frame/audio/file handles and URLs, delete all known artifacts and
      keep bounded content-free cleanup intent for partial deletion.
- [x] Preserve the legacy cleanup-marker compatibility until safe migration is
      proved. Never clear unrelated origin storage or erase an existing user's
      dirty work.

Measured copy progress is local preparation, not a fictional network upload.
Provider-wait progress remains elapsed/indeterminate; fake mode alone can show
its simulated percentages. No valid download is implemented by this ticket.

## Phase 3: protected-admission foundation without a store

- [x] Use short-lived authenticated HttpOnly/Secure/SameSite grants bound to an
      issuing process boot epoch; validate expiry/version/key/size/origin/CSRF.
- [x] Atomically reserve an action in a bounded process-local ledger before any
      asynchronous paid dispatch. Include action kind, nonce, request digest,
      expiry and terminal/uncertain tombstone; never content in logs/URLs.
- [x] Keep reservations through grant expiry. Refuse capacity overflow rather
      than evicting replay protection. Restart invalidates old grants.
- [x] Validate current grant/action, actual bounded input, rate/capacity/budget
      and action-bound Turnstile before spend; cheapest-first rejection.
- [x] Set exact adapter call budgets and automatic retry=0. Lost/disconnected/
      timed-out paid results consume the action; do not refund/resubmit blindly.
- [x] Prepare integrity-receipt/provenance contracts for normalized later
      provider results; a receipt is not an atomic ledger or trust in browser
      source metadata. No provider integration or live verification here.
- [x] Prove concurrency, conflicting replay, stale cookie, restart, timeout,
      cancel and partial-clear outcomes with injected fake clocks/transports.
- [x] State process-lifetime-only guarantees. No cross-replica exactly-once,
      durable monthly/per-person counters or lost-content recovery is claimed.
      Public paid mode stays off until owner-approved safeguards are evidenced.

No DB/Redis/object-store exception is inferred. A single configured instance or
encrypted cookie cannot be presented as distributed atomic coordination.

## File-level migration and fix plan

Inspection identified real mismatches to repair **during CL-005**, not this
documentation pass. Add modules only when their first implementation arrives;
paths for new modules below are proposed owning areas, not scaffolding.

| Existing files / new owning area | CL-005 change and verification |
| --- | --- |
| `packages/contracts/src/media.schema.ts` and `contracts.test.ts` | Replace GCS-only `objectGeneration` with validated local source identity/revision semantics; preserve exact bounds/rotation/codec checks. Never import File/OPFS/Node/application types into contracts. |
| `packages/contracts/src/api.schema.ts`, `operation.schema.ts`, `assembly.schema.ts`, `index.ts`, contract boundary tests | Separate local artifact availability from backend admission/provenance; retire future signed upload/playback/download and server-job assumptions. Define only foundation contracts now, provider endpoints when their ticket arrives. Migrate synthetic fixtures atomically where necessary. |
| `apps/frontend/src/features/session/session.types.ts`, `session.reducer.ts`, `session.selectors.ts` and reducer/regression tests | Model local intake/preparation and local artifact references in the existing machine. No second workflow; distinguish local work from protected remote actions. Keep one selection and direct Confirm export; migrate upload/render stage hints deliberately. |
| `session.persistence.ts`, `session.reconciliation.ts`, `session.provider.tsx`, `session.effects.ts` and persistence/lifecycle tests | Keep content-free legacy sessionStorage projection/cleanup bridge; add validated IDB/OPFS artifact hydration. Browser artifacts become review/recovery authority, not mandatory backend-owned bundles. Old fake projections remain safely recoverable or explicitly cleared; no auto-spend on restore. |
| Proposed frontend media feature: local artifact owner, workspace journal, OPFS adapter, capability probes and worker protocol | Narrow named responsibilities, one cleanup owner; versioning/quota/epoch/partial-write tests and browser integration proof. No general utils/services bucket or empty future render tree. |
| `apps/frontend/src/features/sample/development.input.ts`, `sample.experience.tsx`, `sample.api.ts`, `development.progress.ts` and tests | Introduce real local media adapter alongside explicitly fake behavior; current fake path discards selected File and reads none. Do not silently make fake mode transmit media. Derive config/capability gates without duplicate constants. |
| `portrait-player.tsx`, `use-range-playback.ts`, `candidate.review.tsx`, `candidate.evidence.ts` and review tests | Supply locally owned source playback and immutable range clamp/end/reset; retain glass controls and layout motion. Fake placeholder playback remains clearly synthetic. No real final-review/download claim until later pipeline. |
| `apps/frontend/src/app/api/sample/[...path]/route.ts` and tests | Keep the fixture-only 8-KiB JSON/5-second route scoped to fake development. Never turn it into an unbounded audio/file proxy. Design a separate bounded same-origin transport foundation if required; actual audio endpoint is CL-007. |
| `apps/backend/src/config/env.schema.ts`, `loadConfig.ts`, `loadConfig.test.ts`, root `.env.example` | Remove media-feature dependency on `GCP_PROJECT_ID/GCP_REGION/TEMP_MEDIA_BUCKET/MEDIA_JOB_NAME`; migrate server FFmpeg/Python/weights/storage/job config and legacy upload/render feature meaning. Keep later hosting config private and independent. Examples, schemas, tests and public capability semantics change together; no ignored env file read. |
| `apps/backend/src/app.ts`, HTTP composition and proposed admission/grant modules | Compose fake/protected boundaries explicitly, no listen/provider effect on import. Fixture Map/cookie remain fake-only, not production grant. Introduce no GCS adapter, cloud media job or persistent result store. |
| `apps/backend/src/demo/sampleSession.ts`, `sampleAnalysis.ts`, `sampleManifest.ts`, frontend `session.test-fixtures.ts`, fake operations and associated tests | Preserve deterministic baseline/call counts; migrate actual generation/capability/state fields together with shared schemas and reducer identity comparison, not unrelated fixture prose. |
| Frontend/backend package READMEs, root README, source of truth, ops guides | Document implemented local capability/persistence/admission guarantees and unchecked downstream gates; update exact new commands/versions only when they exist. |
| Package manifests and `pnpm-lock.yaml` | Add only approved proven dependencies at their owning workspace; no native stack retained merely because old planned schema named it. Re-run dependency direction and license inventory. |

Current state is not a bug in the fake demo: it deliberately simulates media.
The mismatch is a migration requirement for real mode, not permission to rewrite
all prior modules or claim the new architecture already runs.

## Downstream ownership

- CL-006: production incremental audio extraction and browser audio/visual
  active-speaker feasibility; no native backend media job.
- CL-007: protected bounded transcription/grounded selection requests, receipts,
  browser-cached results and real candidate integration, subject to paid consent.
- CL-008: production selected-range speaker/focus worker using CL-006 go proof.
- CL-009: protected visual planning/images; locally owned cards/assets/manifest.
- CL-010: shared-compositor read-only preview parity with transcript/edit notes.
- CL-011: complete local H.264/AAC MP4 encoding/mux/validation/download.
- CL-012/013/014: controls/privacy audit, responsive/visual/accessibility/film
  quality and exact repository release audit.
- CL-015: actual hosting/proxy/audio transport, restart/rollout/rate/capacity/
  cost guarantees and authorized deployment/provider validation. No GCS CORS,
  bucket lifecycle, Cloud Run media jobs or server render gate survives.

## Acceptance and focused verification

- [x] Original video remains local, candidate playback uses actual immutable
      ranges and no transcript is shown before preview selection.
- [x] All declared source bounds and unsupported-format/capability failures
      happen before a paid request; no limit or output-format drift.
- [ ] Incremental OPFS/IDB publication, refresh, quota/eviction/private mode,
      two tabs, wrong-source selection and expired/corrupt versions are covered.
- [x] Fake upload/build/render still complete without File reads or external
      calls; real mode has no fake fallback or premature download.
- [x] Cleanup ownership covers every request/worker/listener/timer/handle/
      frame/audio/URL/temporary artifact; partial intent survives restore within
      the documented storage-availability limits.
- [x] Admission replay/races/stale grants/restart and uncertainty are fail-closed
      within precisely documented process-local guarantees.
- [x] Rejected intake/admission assert transcription/text/image counts exactly
      zero; no cloud/job adapter is called or created.
- [x] Shared schemas/config/session fixtures migrate together; contracts remain
      browser-safe and cross-app/Node negative boundary tests still pass.
- [ ] Named feasibility results, license/rights/owner decisions and
      unresolved audio/provider/hosting gates are recorded, not inferred.

Run focused contracts/config/session/media/admission/flow tests while iterating.
Final gate after changes settle:

```text
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
```

Add real-browser synthetic storage/range/codec tests and responsive desktop/tablet/
phone/short-height viewport states appropriate to the implemented foundation.
Use the measured desktop runtime for full-bound codec/performance proof.
Check secret/content leakage, dead/debug code, duplicate
schemas/flags, dependency direction, cleanup and `git diff --check`.

## Completion and commit boundary

Report changed files, exact commands/manual states, dependency versions/licenses,
measured feasibility results, truthful storage/admission/recovery guarantees,
deviations and every remaining owner/rights/visual/runtime/provider/paid/hosting
item. Update evidence only for checks actually performed. This packet is not
complete because the old fake gate passed or because the plan is documented.

Keep local-media foundation and its necessary contracts/state/config/admission
migration together; do not absorb full downstream pipelines. Suggested subject:
`CL-005: establish and validate browser-owned media`. Separate authorization
is required for staging/commit/push and every external or paid action.

</details>
