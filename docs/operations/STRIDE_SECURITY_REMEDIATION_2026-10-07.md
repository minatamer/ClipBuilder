# Security remediation and validation — 2026-10-07

Active packet: CL-012. Starting revision:
`5ef509fd2b027e9f085fb3e78739a7bc245aabd0`. The owner authorized local fixes,
preserving functionality, structure and all private diagnostics. The subsequent
owner instructions authorize read-only authenticated gcloud inspection after
local validation, and a file-level staging/commit plan after a clean review.
Neither instruction authorizes cloud build/update/deployment or agent-paid flow;
none was performed. The [commit plan](../tickets/CL-015-SECURITY-COMMIT_PLAN.md)
records the source commits and exact file groups. The
[original audit](STRIDE_SECURITY_AUDIT_2026-10-07.md) and its
machine evidence remain historical snapshots. The [approved file-level plan](STRIDE_SECURITY_PLAN_2026-10-07.md)
and [PM review HTML](STRIDE_SECURITY_REVIEW_2026-10-07.html) show current decisions.
Current [machine evidence](STRIDE_SECURITY_REMEDIATION_EVIDENCE_2026-10-07.json)
and [input inventory](STRIDE_SECURITY_REMEDIATION_INPUTS_2026-10-07.json) cover
380 code/configuration inputs, including five new modules/tests; 31 of the prior
375 inputs changed. The machine inventory records the settled aggregate SHA-256.

## Current result and limits

| Finding | Outcome | Remaining evidence |
| --- | --- | --- |
| SEC-01 High, conditional public release | Existing safeguards retained; current Cloud Run USD 5 monthly spend cap verified as configured. No new budget or distributed ledger. | Current Gemini cap/key-project correspondence, whole-flow cost coverage and public release receipts. |
| SEC-02 Medium | Fixed locally: verified session start before allocation; bounded pending verification. | Owner verifies real Turnstile action/binding and production CSP. |
| SEC-03 Medium | Fixed locally: shared generous delivery allowance; repeated opens/aliases cannot replenish it; late revocation fenced. | Owner device/network/playback/download check with genuine output. |
| SEC-04 Medium | Local browser/tooling/framework pins patched; Windows executable version verified. | Full fixture FFmpeg, exact Linux image/native scan and synthetic export, separate private rollout and owner real quality check. |
| SEC-05 Medium | Owner accepts Google's up-to-48-hour Files expiry fallback after hard backend loss. | Normal explicit deletion remains mandatory; acceptance does not promise immediate vendor removal. |
| SEC-06 Medium | Explicitly paused until owner dashboard review. | Public HTTP capacity decision; no new traffic-protection code. |

The final local diff review has no new actionable findings. This does not certify
the deployed system, remove the paused finding or turn external gates into passes.
`FAKE_MODE=true` with no keys verifies labelled fixtures and injected guards,
cleanup and exact dispatch counts. It does not generate a real final MP4 or prove
AI quality. Real processing needs provider keys, enabled live flags, applicable
rights/data/spend approvals and matching private cloud rendering. Paid-flow
testing remains owner-only. No local AI runtime or weights path was added.

## Existing cloud/spending decisions reconciled

The October 4 `PROVIDER_SETUP.md` entry already records the owner's USD 5 Gemini
monthly cap, USD 5 prepayment and auto-reload off. The original security audit
failed to carry that later decision forward from the older deferred-amount entry;
this documentation corrects that omission. Vendor enforcement may be delayed
about ten minutes and does not cover Cloud Run, storage or build charges.

The older `COST_MODEL.md` checkpoints record a USD 10 budget alert and an
unconfirmed USD 5 Cloud Run alert. The later read-only CLI inspection below
supersedes the Cloud Run classification: its USD 5 monthly budget includes
`spendCap.outputState=CONFIGURED`. Notifications alone do not establish that
state. No budget amount is requested again and no vendor setting is changed.

Current `CLOUD_RUN_RENDERER_SETUP.md` and migration records establish:

- Private renderer: 4 CPU, 8 GiB, minimum zero / maximum one instance, HTTP
  concurrency two, one expensive media job, 900-second request and 840-second
  work deadlines, 2 GiB scratch. Rendering frame concurrency two is separate.
- October 5 persisted allowance: four media operations per disposable session,
  replacing the earlier two-operation process cap. This means operations,
  not four processes or concurrent jobs. The obsolete environment cap is retired.
- Existing private rollout and independent expiry evidence retain their dated
  scope. The later metadata reads verify selected current settings, without
  authorizing a new security rollout or settling public SSR/HTTP protection.

The repository-wide documentation search covered tickets, source of truth,
provider/cost/privacy/setup/release guides and migration/ADR history. Current
owner decisions supersede older process-local numbers. Local checks read no
credentials, ignored environment file, retained master or original capture.
The later authorized CLI uses the owner's existing authentication, without
reading or printing credential files, tokens or ignored application secrets.

## Post-validation read-only cloud inspection

The owner authorized authenticated gcloud checks after the local packet was
finished. Inspection used existing APIs only; no API was enabled, resource
changed, image built, service invoked, media object listed/read or paid flow run.
Committed receipts exclude account/project/service/bucket names, emails and
private URLs. The current CLI default project differs from the app's renderer
project, so the inspection resolved the actual app project explicitly rather
than treating the default project's settings as app evidence.

- **Cloud Run monetary control:** the app project's Cloud Run-only monthly
  budget is USD 5, with 50/80/100 percent thresholds and spend-cap output state
  `CONFIGURED`. A separate USD 10 service-filtered budget is alerts-only. Neither
  observation verifies the current Gemini key's project or every storage/build
  charge. The documented owner-reported Gemini USD 5 cap remains its own evidence.
- **Private renderer:** europe-west1, 4 CPU, 8 GiB, request concurrency two,
  900-second timeout and revision maximum one instance. Invoker IAM has no
  `allUsers` or `allAuthenticatedUsers`; two explicit invoker principals are
  configured. No actual authenticated service request was performed. An omitted
  minimum-scale field is not claimed as a newly verified service-level setting.
- **Independent expiry:** the matching `/internal/expiry` schedule is enabled
  every 15 minutes, with OIDC and matching origin audience, a 180-second attempt
  deadline and one retry with 900-second backoff. Its last-attempt timestamp was
  present; the status code was omitted. Configuration is verified, actual
  deletion and cleanup during a spending pause are not proved by metadata.
- **Exact disposable bucket:** only the named nonsecret `RENDERER_BUCKET`
  binding was selected, then metadata inspected. Uniform access and public-access
  prevention are enabled; soft delete is zero, versioning is disabled, and no
  retention policy or default hold is configured. A one-day Delete-age lifecycle
  rule is present. Lifecycle age is a fallback threshold, not an exact deletion
  deadline. Other unbound buckets are not treated as visitor storage.

The first budget query omitted `spendCap` and prematurely classified the USD 5
control as alerts-only. A follow-up exact budget description included enforcement
and corrected that conclusion before this documentation commit. Google now
supports [spend-cap budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets-spend-caps):
enforcement is not instantaneous, in-flight work finishes, and ongoing fixed
resource charges can continue. The receipt establishes configured enforcement,
not a zero-overrun invoice guarantee. Public traffic protection stays paused.

## SEC-02: verified starts without changing paid actions

Contracts now own one strict bootstrap proof: a fresh UUID v4 `startNonce` and
the existing bounded Turnstile token. Both grant routes accept it with the
existing consent acknowledgements under a 3 KiB JSON cap. `session-start` is a
challenge purpose; the four paid processing actions remain unchanged.

Admission performs cheap origin/Fetch Metadata/capacity checks, bounds pending
verification to two before the first await, verifies action and nonce binding,
then rechecks allocation atomically. Verification receives the caller abort and
a five-second deadline. An aborted/failed/invalid proof allocates no grant and
does not consume the scarce genuine-start allowance. A pending slot is held
until the verifier settles, including a disconnected caller, so an adapter
ignoring abort cannot create unlimited outstanding work. No provisional grant
map, visitor identity, new provider retry or paid call is introduced.

The low-level allocation primitive remains for injected fixtures; HTTP routes
use the verified start method. Frontend normal source analysis and labelled
local replay share one narrowly named bootstrap helper. Later upload/analysis/
assembly/render proofs remain fresh and session-bound. Cancellation before or
after challenge resolution does not call grant. Consent, source choice,
candidates, one selection, preview, export, download and Start over remain.

Regression evidence: invalid starts leave genuine slots available; both HTTP
aliases reject invalid proof without cookies; malformed nonce/origin rejects
before verification; two pending starts bound work; allocation races recheck
capacity; cancellation prevents allocation; action/binding verification rejects
the old purpose. Exact fake provider/job counts remain unchanged or zero.

## SEC-03: one shared bounded delivery policy

One `MediaDeliveryAllowance` is injected into preview, final-result restore and
output delivery in backend analysis composition. Fixed code limits are 2 GiB
requested bytes, 1,024 content requests and 64 metadata requests per original
session, with at most 64 retained scalar records. Metadata does not charge full
video bytes. Preview and output, playback and attachment aliases share it.

Range validation precedes reservation; exact requested length is claimed
synchronously before private fetch. Failed/uncertain reservations remain consumed
because refunding work could enable repeated unpaid delivery. Reopening does not
reset counts or extend original grant expiry. Clear/Exit removes access; scalar
consumption remains until expiry to prevent refill. A request sweeps expired
records, with no new timer/database/content retention. A rejected reservation
starts no private stream or extra processing job. Existing ownership, receipt,
Range, concurrency, expiry and content-type/length validation remain enforced.

Synthetic envelope proof permits 16 full 24 MiB preview reads and eight 200 MiB
downloads below 2 GiB, then refuses another maximum download. Direct policy tests
exercise all 1,024 tiny reads and 64 metadata opens. Integration tests reserve
the earlier policy usage directly and run the final two real stream aliases;
subsequent attachment/playback and reopen requests reject before private content
I/O. This avoids 1,024 pipelines in one five-second suite test without weakening
the actual boundary assertion. Shared restore/open metadata rejects the 65th
lookup before private I/O. Another session is independent; record capacity,
expiry, abort and non-extension are checked.

Retained demonstration playback and the protected processing copy retain their
existing separate limits/authorization. The optional stream reservation hook
does not force a new session policy onto those paths or change the paused SEC-06
scope. Retained owner media is preserved.

## Validation finding: revocation while content is arriving

An independent synthetic regression delayed private output fetch, called Exit,
then released content. Before the fix, output headers were still published
despite revocation. The validation finding was accepted and fixed rather than
deferred. The test checks the header boundary directly; paid processing counts
remain exactly one existing plan/render.

Session-owned streams now reauthorize after fetch, before headers, and after
every reader await before yielding another chunk. Clear/Exit, expired descriptors
or invalidated grants reject; the private body is cancelled and its reader
released. The reproduction passes: no headers after Exit, one cancellation,
no repeat job. Existing metadata-race, valid range/playback, mismatch, abort,
slow/disconnected-client and expiry regressions remain green.

## SEC-04: compatible fixed browser and framework maintenance

All Remotion pins move together from 4.0.532 to **4.0.534**. Next and its ESLint
config move from 16.3.7 to **16.3.8**, following the official September 30 security
maintenance recommendation. React, existing Zod 4.6.5 and unrelated package
versions remain. Semantic lock review still finds 844 package/version pairs;
the patch's own dependency changes are recorded. Exact new Remotion release-age
exceptions are scoped to those versions; obsolete Next 16.3.7 exceptions retire.
No install scripts, unrelated forced major upgrades or global skill edits ran.

The new explicit tooling helper pins **Chrome for Testing 155.0.8059.39**, inspects
the prepared executable with `--version`, and rejects missing or mismatched
caches. Remotion 4.0.534 supports this custom-version preparation correctly;
its default newer browser is not implicitly selected. Prepare/stage commands
share the pin, and the existing stage manifest records actual binary hashes.
The module does not download at import and is absent from runtime composition.
No browser sandbox flags, caller props/paths, runtime downloader or fixed media
input boundary changed. Tooling tests reject the old 149 browser and unexpected
157 cache, accept the exact prepared version, and reject no executable.

The next validation pass found a packaging integration gap: `stage-tools.ts`
imports the new helper, but the strict renderer upload context originally omitted
it. An independent assertion on the prepared context failed before correction.
The allowlist now includes exactly `scripts/browser-tooling.ts`; existing checks
still exclude tests, ignored env/secrets, private media, frontend/backend,
fixtures, feasibility tools and installed dependencies. Its regression passes.
No cloud build was necessary to reproduce or repair this source packaging gap.

The Windows prepare command downloaded the public patched browser and verified
its actual executable version. Renderer bundle and full production build pass.
The optional API-free synthetic native harness stopped before rendering: the
bundled minimal FFmpeg lacks the rawvideo input demuxer needed to create its
fixture. An independent no-media `NUL` probe confirms that limitation; the renderer
guide already requires an approved full `FIXTURE_FFMPEG_PATH`. Docker's Linux
daemon is unavailable. No native MP4/pixel/audio proof, Linux image scan or cloud
rollout is claimed. The harness cleans its owned temporary fixture directory.
The existing Linux image verifier has its own generated PNG/WAV fixture path;
the Windows rawvideo fixture prerequisite does not replace that separately gated
Linux build proof.

The Remotion version checker confirms all 25 installed Remotion entries match
4.0.534, but exits nonzero because it recommends Zod 4.5.4 while this repository
already uses 4.6.5. Existing schemas are retained to avoid an unrelated downgrade;
the full schema/application tests, typecheck and build pass. This auxiliary
recommendation check is not reported as green and is not an established security
finding. Exact native compatibility remains the release gate described above.

Primary references: [Next security patch](https://nextjs.org/blog/upcoming-nextjs-security-release-september-2026),
[Remotion custom browser preparation](https://www.remotion.dev/docs/renderer/ensure-browser),
[Chrome stable release feed](https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json)
and [October browser security releases](https://chromereleases.googleblog.com/2026/10/).

## Changed-file ownership

| Responsibility | Files |
| --- | --- |
| Bootstrap contract/admission | `packages/contracts/src/admission.schema.ts`; backend `admission/processing.admission.ts`, its test, `turnstile.verifier.test.ts`; `http/routes/analysis.route.ts`, `admission.route.ts`; `analysis/analysis.test.ts` |
| Browser bootstrap | Frontend `source-analysis/session-start.ts`, `source-analysis.api.ts`, `source-analysis.flow.ts`/test, `sample-replay.flow.ts`/test, `analysis-challenge.tsx`; `sample/sample.experience.tsx` |
| Shared delivery/revocation | Backend `media/delivery-allowance.ts`/test, `artifact-stream.ts`/test, `output-delivery.ts`, `preview-playback.ts`, `render/final-render.usecase.ts`, `analysis/analysis.composition.ts`, `assembly/selected-focus.test.ts` |
| Fixed tooling/packages | Renderer `scripts/browser-tooling.ts`/test, `prepare-browser.ts`, `stage-tools.ts`, `build-context.ts`/test; root/frontend/renderer/composition `package.json`; `pnpm-lock.yaml`, `pnpm-workspace.yaml` |
| Owning documentation | Three service READMEs; source of truth; `COST_MODEL.md`, `SECURITY_PRIVACY_CONTROLS.md`; CL-012, CL-015, ticket index; original audit/current plan/HTML and this report with current machine evidence/input inventory |

No application log event is removed. Backend diagnostic sinks and route error
mapping remain content-safe; frontend contains no console logging. Generic
availability/refusal messages use existing source-controlled error mapping.
No UI exposes provider stack, backend origin, credential, capability or media
content. Dependency directions remain executable; no duplicate contract schema,
catch-all utility, unbounded retained map or import-time composition side effect
is added. Scoped response-close listeners are removed in `finally`; stream readers
cancel/unlock on completion/error/abort; no app service was launched.

## Settled verification and follow-up review

Required local checks: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit`, `corepack pnpm build`.
The saved machine evidence gives exact completion times and exit codes.
The renderer tooling scripts also pass an explicit strict NodeNext TypeScript
check, since those preparation scripts are outside the application tsconfig.
The full unit suite passes **1,240 tests in 106 files**:

| Workspace | Tests | Files |
| --- | ---: | ---: |
| Root/boundaries | 40 | 4 |
| Contracts | 79 | 6 |
| Composition | 5 | 1 |
| Backend | 565 | 29 |
| Frontend | 438 | 49 |
| Renderer/tooling | 113 | 17 |

The initial parallel full gates caused a cold ESLint boundary test timeout.
Sequential execution passes without changing its deadline. Repository lint
initially scanned temporary audit probes/third-party source under ignored `tmp`;
only verified audit tooling/log directories moved to a private OS-temp archive.
Lint rules were not weakened. The 1,024-pipeline integration test also exceeded
its deadline under suite load; it now checks two real aliases at the seeded
boundary while the policy test exercises the complete allowance. Both findings
and corrections are retained, not represented as an initially clean run.
The existing build-context filesystem test also exceeded its default five-second
deadline under full-suite worker load, while focused copies completed in under
0.3 seconds. It now has a bounded 15-second test-only deadline; every allowlist,
secret/media/cross-app exclusion assertion remains. No application timeout,
security limit or global test setting changed to make it pass.

The final walkthrough traces the changed entry points, new files and their
existing dependencies for bypasses, race/abort/expiry behavior, shared policy
composition, package direction, redundant schema/constants, dead/debug code,
unsafe casts, stale operating flags, log/content leakage and resource ownership.
No further actionable local finding remains after the late-Exit fix. Existing
test environment enforcement, zero unexpected external network and exact fake
dispatch assertions remain intact. Public feed recheck queries 844 pairs/773
names against npm and OSV: the same two matches remain (dev glob `braces` and
unused affected `uuid` APIs), with no established vulnerable runtime path.

Validation disposition: **Meets the approved local packet; external acceptance
unverified.** Pass 1 identified the late-Exit stream race; independent reproduction
confirmed it. Pass 2 found the missing browser helper in the image-upload context;
an independent red context assertion confirmed it and now passes. Pass 3 reviewed
the complete settled code diff/new modules and both resolved regressions with no
new actionable local finding. The separate execution
phase ran the required full gates; the read-only review did not substitute a new
full audit or invent additional requirements. Coverage is complete locally for
bootstrap proof, delivery policy, generic errors/log preservation, shared
composition and compatible pinned package/tool preparation; exact Linux/native,
cloud/vendor/owner evidence is partial or unverified as listed below. SEC-05 is
accepted and SEC-06 intentionally paused, not missing implementation presented
as completion.

The offline HTML's structure, links, owner defaults, filtering, text-only notes,
storage restore/failure, decision export/object-URL cleanup and print controls
are simulated independently. It has no network/resource loaders. Visual rendering
is not claimed: browser policy rejected the original local-file preview, and no
alternate browser/server bypass was used. Earlier v1 local review state is
preserved by a new v2 storage key.

## External and owner-only checklist

- [x] Owner-authorized current Cloud Run spend-cap, private invoker policy,
  scheduler and exact disposable-bucket metadata inspection; no cloud mutation.
- [ ] Current Gemini cap/key-project correspondence and whole-flow cost coverage;
  paused public traffic capacity remains for owner dashboard review.
- [ ] Optional Windows harness: full fixture FFmpeg. Separately, authorized exact
  Linux image build, native/version/OS/library scan and API-free generated-fixture
  export/cancel/scratch proof using the existing image verifier.
- [ ] Separately approved private renderer digest rollout with prior matching
  source/image retained for rollback; verify private IAM and independent expiry.
- [ ] Owner real Turnstile/CSP, candidate/preview/caption/picture/audio/export,
  seek/download/refresh/Exit and device/network checks. No agent-paid E2E.
- [ ] Strict target-platform immutable frontend packaging: local inventory passes;
  existing Windows external package links remain unacceptable for release.
- [ ] Existing CL-015 public identity/headers/bucket/expiry/rights/license/quality
  acceptance. Remove only the authorized replay transport/cache/saved copy at
  the explicit deployment checkpoint; preserve retained master/original capture.

The approved local fixes are complete and reviewable. External checks and SEC-06
remain open; acceptance of SEC-05 is an owner decision, not a repaired crash
deletion mechanism. No all-risks-solved or absolute security/functionality claim
is supported until the remaining evidence is produced.
