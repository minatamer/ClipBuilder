# CL-006 follow-up: cleanup-aware upload admission

Status: implementation, local validation and private renderer rollout complete; owner paid UI retest pending.

## Authority and readiness

The owner requested the diagnosed cleanup fix on 2026-10-05, continuing the
approved private renderer/assembly investigation and existing deployment
authorization. This packet reopens only CL-006 admission/cleanup, whose encrypted
journal, generation-fenced deletion, private caller verification and independent
expiry endpoint already exist. It does not reimplement CL-009 assembly.
Follow [cleanup authority](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#current-owner-revision--gemini-and-private-cloud-run-rendering-2026-10-02)
and the repository's privacy, fake-test, retained-source and cloud gates.
Deployment updates the existing private service only after local checks and the
allowlisted Linux image proof pass. No agent-run paid AI/media test is authorized.

## Confirmed failure

The owner's sample preparation verified the retained-source fingerprint, then
renderer upload admission returned HTTP 503 / cleanup_pending. Cancellation of
that new binding returned 200; no Gemini or editing stage ran. Read-only cloud
logs and bounded cleanup control records established that an older terminal
session expired between a successful scheduled sweep and the new upload.
Admission rejects any expired journal entry instead of attempting its cleanup;
the independent schedule runs every 15 minutes. No identifiers, capabilities,
source contents or private provider payloads belong in this packet.

## Implementation plan and acceptance

1. On admission, inventory bounded intents and classify overdue/pending cleanup.
   If cleanup is needed or the process retains a cleanup block, run the existing
   sweep once before allocating anything, re-read the journal, and admit only
   when cleanup is confirmed. Preserve retry deferrals, capacity, generations,
   TTLs, rights, authentication, media operation limits and retained masters.
2. Keep an actual storage/deletion failure blocked with zero new upload
   allocations. A later admission may recover after the existing retry deadline;
   no AI/provider retry or new media processing is introduced.
3. Make upload admission and scheduled sweep mutually exclusive in the renderer
   route owner. Tie admission storage calls to client cancellation and the
   existing bounded sweep deadline; release guards and listeners in finally.
4. Add injected, structured, content-free renderer diagnostics for inventory,
   trigger counts, cleanup stages, retry deferral, storage HTTP/fixed failure
   codes, fences, allocations and outcomes. Correlate each operation with a
   fresh diagnostic ID. No raw exception text, journal contents, credentials,
   capabilities, filenames, object/session/account IDs or media are logged.
   Preserve all existing backend messages and private Gemini captures.
5. Add synthetic regressions for the between-sweeps expiry case, failed deletion
   and deferred recovery, untouched active sessions/output, late expiry after
   recovery, bounded journal errors, concurrent admission/sweep, disconnect
   cancellation and diagnostic privacy/failure isolation. Assert allocation and
   AI/media dispatch counts.
6. Update the renderer guide, narrow cleanup authority and ticket/index. Run
   focused renderer tests, then format, lint, typecheck, unit and build gates.
   Perform a scoped validate review. Build only the allowlisted context; deploy
   one verified immutable image to the existing private renderer under standing
   owner approval. Verify service readiness without submitting media/AI work.

## Verification and limits

- [x] Focused synthetic regressions pass.
- [x] Settled root format/lint/typecheck/unit/build gates pass.
- [x] Scoped review has no actionable local findings.
- [x] Allowlisted Linux image proof and private immutable rollout verified.
- [ ] Owner UI sample replay/Proceed retest verifies live admission and assembly.

FAKE_MODE=true and no API keys verify local cleanup/error handling using injected
storage, clock and transport. This does not establish real cloud deletion or AI
quality. Actual sample/assembly testing remains manual, needs enabled paid/live
gates, current ADC/provider credentials and the applicable rights/approvals.
No new resources, scheduler policy, retention policy, flags, keys, model changes,
Git mutation, public deployment or final-render gate is included.

## Local implementation and verification — 2026-10-05

Renderer admission now performs the existing sweep once when the bounded
journal contains overdue/pending cleanup, re-reads the journal, and allocates
only after confirmed recovery. Storage failures/backoff and a new expiry during
recovery still refuse allocation. Upload and scheduled sweep guards are mutual;
disconnect/deadline signals cover storage work, while failed allocation cleanup
uses an independent bounded signal. Normal cancellation/expiry generation
fences, session/output lifetimes, active sessions and retained masters remain.

New injected cleanup diagnostics cover inventory counts, reasons, retry delay,
policy verification, upload reservation/capability commit, cancellation,
artifact deletion/verification, journal fences/deletion, orphan cleanup and
lifecycle outcomes. Production composition emits them to stderr. Only fixed
messages, bounded counts and safe error/status facts are emitted; logger failure
cannot change processing. Existing backend/private provider logs are preserved.

Changed implementation: renderer `expiry/media-sessions.ts`, new
`expiry/cleanup-diagnostics.ts`, `app.ts`, `server.ts`; synthetic tests in the
owning test files; renderer guide, this packet, index and narrow cleanup
source-of-truth paragraph. No contract, backend or frontend behavior changes.

Focused tests: **29 tests in three files**. All five settled root commands pass:
format:check, lint, typecheck, test:unit (**1,039 tests / 88 files**) and build.
Renderer suite passes **99 tests / 15 files**, including 14 new regressions.
No credentials/network/provider calls were used by these tests. The build's
generated Next declarations were restored to the existing local dev form.

Scoped validate verdict: **Meets ticket locally; no actionable findings**.
Covered: between-sweeps recovery, real failure/backoff, no allocation on failed
inventory, active-source/output preservation, expired output, post-sweep expiry,
orphan recovery, mutual concurrency guards, disconnect/compensation cleanup,
privacy, safe status classification and logger failure isolation. Review scope
is this packet's unstaged/untracked change; preexisting transcription,
selection, preview, session allowance and assembly work is excluded. Private
image proof/rollout and owner paid acceptance are still unverified at this point.
Nothing was staged or committed. Local tool shims required invoking the pinned
formatter/test CLI through Node; build-context generation uses Node's supported
type stripping after tsx's restricted userInfo lookup failed. No dependency or
source workaround was introduced.

## Private rollout and handoff — 2026-10-05

Standing owner deployment approval was used for one build of a verified
allowlisted context (60 files / 510,870 bytes). The build completed successfully
in 157.711 seconds of execution; Linux synthetic render/scratch/cancellation
and runtime imports/bundle/binary-hash/version proof markers were verified.
The image digest was independently matched to the registry and deployed to the
existing private renderer. Latest ready revision receives 100% of traffic.
Service URL, other runtime spec and private IAM were verified unchanged.
Authenticated health is 200; anonymous health is 403. No media/AI processing
request or additional build was submitted. The known configured token audience
was verified against the preserved renderer configuration; it is distinct from
Cloud Run's reported service URL. Initial verification invocation/URL-comparison
mistakes were corrected before readiness was claimed. Mixed timestamp parsing
was corrected in the private build-duration record.

Only this build's exact staging-object generation was deleted and confirmed
not found; the local allowlisted context was removed after absolute-path and
link checks. Retained masters and visitor media were not touched. Private
metadata and content-free proofs remain outside Git at
`%TEMP%/clipbuilder-runtime/cleanup-admission-renderer-deploy-20261005/`.
Local backend health, `/start` and sample config returned 200. No app restart
was needed: the private renderer's URL remains the same. No source/config/model
change occurred after the settled checks, apart from ticket/index evidence.

Owner handoff: Exit/refresh, use **Simulate find moments for sample**, select a
saved candidate and Proceed. This checks new upload admission and the prior
CL-009 selected assembly request correction without repeating transcription or
moment selection. Actual cloud admission/deletion, provider acceptance,
framing/captions/cards/preview quality and later final export remain unchecked
until their owner-run tests. Fake/no-key checks prove the local behavior, not
live quality. Rights, paid flags/provider credentials and public/final-render
gates remain separate. No deviations in implementation scope; nothing staged
or committed.
