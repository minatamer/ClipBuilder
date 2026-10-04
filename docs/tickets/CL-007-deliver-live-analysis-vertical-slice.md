# CL-007 — Gemini grounded analysis and candidates

## Current cloud-render packet — approved local execution, 2026-10-02

Status: local implementation, all five root gates and the actual fake browser workflow passed, 2026-10-03. The owner explicitly deferred the separate renderer rollout and paid/live AI checkpoint, and authorized continuing dependency-ready local packets one at a time. Live acceptance remains unchecked.

Authority: [Google/Cloud Run migration plan](../architecture/GEMINI_REMOTION_MIGRATION.md); [file inventory](../architecture/MIGRATION_FILE_INVENTORY.md); [later setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md).

Implement bounded Google proxy upload/process/structured analysis/delete, grounded transcript/anonymous turns/candidates, signed provenance, existing UI result commit/recovery and injected exact-call failure tests.

Dependencies follow the numbered migration sequence. After documentation approval, implement one dependency-ready packet at a time and run focused checks plus the required settled five root gates. Fake/live AI and local/cloud compute are independent; cloud render can incur cost with fake AI. Ordinary tests remain synthetic, credential-free, fake/off and zero-network through injected cloud/provider ports. No cloud provisioning, login, credential use, private upload, paid call, Git action, usage polling or new independent review is authorized now.

- [x] Owner explicitly approved documentation and local corrections on 2026-10-02.
- [x] Implement this current packet and verify its locally possible synthetic behavior after approval.
- [x] Record exact tests/manual states, cleanup and all remaining rights/AI/cloud/license/device gates.
- [x] Verify the actual `FAKE_MODE=true`, API-key-free browser workflow and clean up its temporary services.
- [ ] Controlled live analysis checkpoint: explicitly deferred by the owner; do not infer authorization from fake results or earlier CL-006 permission.

## Owner-requested analysis failure and console fix plan — 2026-10-04

Status: **investigated and planned; diagnostic logging implemented in the
priority follow-up below; processing fixes and remaining acceptance stay open**.
The owner requested documenting the fixes before changing application code.
This follow-up stays in CL-007. It does not authorize a new paid attempt, cloud
change, deployment, Git mutation or restart during an owner-run attempt.

### Priority backend diagnostic follow-up — 2026-10-04

The owner prioritized checking existing backend logs and authorized implementation
of meaningful logging **only if the existing logs could not diagnose the failure**.
A fixed-code scan of all 30 saved backend stdout/stderr logs found no analysis
failure code or Google failure rule. The current run's backend stdout/stderr
were only 42/147 bytes before instrumentation. The executable server logged
startup/shutdown; the error handler returned safe diagnostics without emitting
them. The ignored local supervisor also reduced unknown output to generic
redacted categories. The historical provider cause therefore remains unavailable,
not resolved.

Implemented only that conditional diagnostic scope:
`analysis/analysis.diagnostics.ts` owns an injected sink, bounded request context
and safe stage records; explicit `server.ts` composition enables stderr output.
`app.ts` attaches opaque request correlation to the four fixed analysis actions
and records application errors/completion. `composition.ts` and
`analysis.composition.ts` pass the same diagnostic instance to source orchestration
and Gemini. `analysis.usecase.ts` and `gemini.adapter.ts` record source/proxy,
provider and cleanup phases before subsequent failures can overwrite the returned
error. No model/prompt/schema/budget/status mapping, retry, operating flag,
frontend behavior or cleanup response semantics changed.

Records contain fixed action/phase/outcome, bounded timings, opaque request ID,
application HTTP status, separate upstream status when known, allowlisted error
class/network code and source-controlled error code/rules. There are at most 48
records per request. Raw exceptions/messages/stacks, content, inputs/outputs,
private/provider/session identifiers, credentials and capabilities are excluded.
No provider call or durable storage is added. Sink/unsafe diagnostic-property
failure cannot change processing. The original failure survives **in the log**;
the planned change to prevent cleanup masking it in the response remains open.
The same backend-owned strict validator checks both emission and the new ignored
launcher capture. It rejects unknown fields, arbitrary values and oversized lines;
the launcher retains valid diagnostic JSON and continues redacting every other
unrecognized line. No raw-output logging bypass is enabled.

Synthetic verification covers strict shared record validation, concurrent request isolation, privacy, record
limits, failing sinks, exact one-generation-call behavior and original generation
failure followed by provider/proxy/source cleanup failures. The diagnostics and
additional regression tests run under the hardcoded fake/paid-off/no-key network
guard. Final root checks and local activation are recorded in the
[priority backend diagnostics record](../operations/GROUNDED_ANALYSIS_CHECK.md#priority-backend-diagnostics--2026-10-04).
All five root gates pass with 785 synthetic tests in 76 files. The isolated
launcher-capture check retains safe records and rejects a payload-bearing record.
Verified restart leaves healthy backend/frontend instances with the new capture
path; genuine provider success and the historical failure cause remain unproved.

Next diagnosis/fix plan: use the next **owner-triggered** attempt's request ID to
find the earliest failed phase, its safe rule/upstream status and elapsed time.
Reproduce that exact failure with an injected transport, document its cause and
file-level remedy, and leave that processing remedy unimplemented until the
owner asks for it. If the saved failed response becomes available sooner, use
its safe rule without a new attempt. Keep response-error preservation and each
console/rotation fix separate and pending. No agent-paid test is permitted.

### Evidence and uncertainty

The latest owner-run sample attempt started rotating its wait messages only
after roughly two minutes, then showed **The analysis service could not finish
the request**. The owner reported `/api/analysis/run` returning HTTP 500,
blocked inline styles, a duplicate Turnstile SDK warning and an unused CSS
preload warning. Do not commit the screenshot or full console output.

| Observation | Code evidence | Conclusion |
| --- | --- | --- |
| Rotation starts late | `sample.experience.tsx` enables `findingMoments` only when `analysisLabel` equals `Reading your video and finding moments`; `source-analysis.flow.ts` sets that label after grant, first verification, sample copy/upload and second verification. | Confirmed UI gating bug. Start the loop with the accepted Find moments action and keep it through preparation. |
| Analysis HTTP 500 | The displayed message belongs to `ANALYSIS_PROVIDER_FAILED`. `gemini.adapter.ts` uses that code for upload/generation failures, while `errorMapper.ts` defaults it to 500. The frontend bridge preserves upstream status and safe error JSON. | This is an application error status, not proof Google returned 500. Its exact phase/status remains unknown until the safe `error.ruleId` is recovered. |
| Inline style CSP errors | `proxy.ts` always requires a nonce for style elements, including development. The installed Next.js package contains the reported dev-overlay `font-styles` module; the installed style-loader injects style elements. | Confirmed development policy incompatibility. The individual blocked React style element still needs attribution; do not assume it belongs to Remotion. |
| Turnstile already loaded | `processing-challenge.ts` inserts its own script whenever `window.turnstile` is absent and removes it on unmount. There is no shared in-flight load. Next.js Strict Mode is enabled. | Confirmed loader race vulnerability; Strict Mode/remounts are a plausible trigger, not runtime proof of this warning's exact trigger. |
| Unused token CSS preload | The console names a Next.js-generated CSS chunk. | Performance warning with an unconfirmed cause. Check after fixing style loading; it is not evidence of the server analysis failure. |

The initial planning pass found that the existing safe error envelope includes `code`, `requestId` and an
optional `ruleId`. A filtered inspection of the current ignored runtime logs
found no detailed Google failure rule. At that point the backend error handler
did not emit one; the priority follow-up above now adds structural logging.
No secret, real media, provider payload or live response was read, and no
provider request was issued during this planning pass. The owner was asked for
only `error.code` and `error.ruleId` from the existing failed response; the plan
does not depend on another paid attempt.

### Ordered implementation plan and file ownership

1. **Identify and fix the analysis failure.** First recover the existing safe
   response rule if available. Otherwise add a bounded, content-free diagnostic
   at the existing error boundary: allowlisted phase, error code, integer HTTP
   status, elapsed duration and opaque request correlation only. Do not log raw
   exceptions, SDK messages/stacks, bodies, prompts, transcripts, file names,
   provider IDs, session/grant IDs, URLs, headers or credentials. Inspect the
   exact pinned SDK request and reproduce the identified path with injected
   transports. Separate upload-start/finalize, file processing, generation,
   output validation and cleanup failures. Check model/API/request-schema
   compatibility only when the diagnostic points there; change no model,
   timeout, prompt, token budget or operating flags merely to hide a failure.
   Keep the primary failure when proxy release or source cancellation also
   fails: current `finally`/`catch` cleanup awaits can overwrite it. Record
   cleanup separately and preserve quiet Exit. Map safe statuses deliberately;
   a local 500 must never be presented as a confirmed upstream status.
   Preserve the one-generation-call policy, consumed-action fence, aborts and
   deadlines. Never add automatic generation retry or repair calls.
   Primary files: backend `analysis/gemini.adapter.ts`,
   `analysis/analysis.usecase.ts`, `http/errorMapper.ts`, `app.ts` and their
   tests. Add a named analysis diagnostic module only if it has a real caller.
   Frontend `source-analysis.api.ts` and `api/analysis/[action]/route.ts` change
   only if evidence shows safe details are lost at that boundary. Shared
   `errors.schema.ts` changes only for a necessary cross-boundary contract.

2. **Rotate from the beginning.** Give the accepted Find moments action one
   stable wait lifetime. Show the first friendly message immediately, advance
   every five seconds, wrap and continue during grant/verification, sample copy
   or upload, proxy preparation and AI analysis. Remove the label-string gate;
   internal phase labels must not select whether the loop runs. Preserve elapsed
   time across phase changes and stop the timer on success, failure, cancellation
   or Exit. Friendly copy describes the task, not measured completion or an ETA.
   Planned copy: “Finding your standout moments…”, “Looking for hooks that grab
   attention…”, “Searching for stories worth sharing…”, “Looking for clear ideas
   and memorable reactions…”, “Finding moments that work as standalone clips…”
   and “Looking for a strong setup and payoff…”. Primary files:
   `sample/sample.experience.tsx`, `sample/processing-status.tsx`,
   `source-analysis/source-analysis.flow.ts` if needed for the start boundary,
   and focused frontend tests. Keep replay/persistence and double-click fences.

3. **Correct style loading and verify production security.** Follow Next.js's
   documented development policy: allow inline style elements only in
   development; keep nonce-restricted style elements in production. Do not
   combine a development style nonce with `unsafe-inline` and assume both work.
   Keep the existing script nonce/strict-dynamic policy and the intentional
   style-attribute allowance for fixed React/Remotion geometry. Trace each
   remaining blocked style element in a synthetic browser run. If an owned
   production injector exists, pass the request nonce at its supported boundary
   or use owned external CSS; do not globally weaken production CSP or monkey
   patch DOM insertion. Never confuse Remotion's internal numeric render nonce
   with a CSP nonce. Primary files: `src/proxy.ts`, `src/proxy.test.ts`,
   `src/app/layout.tsx` and the actually identified style owner only if needed.

4. **Load Turnstile once per document.** Separate document-wide SDK loading
   from per-widget lifetime. Share one in-flight load/readiness outcome, reuse
   an already loaded or loading script, and pass the current document CSP nonce.
   Unmount removes only the owned widget and its callbacks, not a successfully
   loaded shared SDK. Failed loading can be retried without duplicate scripts;
   handle Strict Mode setup/cleanup/setup, simultaneous consumers, HMR and late
   callbacks. Retain interaction-only appearance, centered verification dialog,
   one token per action, cancel/timeout handling and verification-only retry.
   An SDK/UI retry must never redispatch upload or generation. Primary files:
   `source-analysis/processing-challenge.ts`, `analysis-challenge.tsx` and
   `processing-challenge.test.tsx`; create a focused script-loader module only
   if separating that responsibility improves ownership.

5. **Resolve any remaining preload warning.** Inspect generated document/link
   headers in both development and a synthetic production build: destination
   `as=style`, CSS URL reuse, actual stylesheet application, CSP, navigation and
   HMR behavior. Fix an owned duplicate/incorrect preload if reproduced. If the
   warning is limited to the pinned Next.js dev runtime, document exact evidence
   and verify production absence rather than suppress console warnings or add
   arbitrary package/config changes. Primary files: `src/app/layout.tsx`,
   `next.config.ts` or stylesheet imports only if attribution requires them.

### Acceptance and test plan — not yet executed

- [ ] Classify the current failure from its safe rule, or explicitly record
      that the historical cause was unavailable. Prove a reproduced application
      defect and its fix with synthetic transport data before calling it resolved.
- [ ] Adapter/use-case tests cover the identified failure, 400/403/429/5xx,
      abort/deadline, processing failure, invalid/truncated output and concurrent
      cleanup failure. Exact fake upload/generation/delete call counts prove no
      retry or extra paid boundary; cleanup cannot erase the primary diagnosis.
- [ ] Deferred journal/grant, sample-copy and upload tests show the first
      friendly message immediately, multiple rotations before preparation ends,
      wraparound, stable elapsed time and no timer after every terminal state.
- [ ] Shared-loader tests cover repeated/sequential/concurrent mounts, loading
      unmount, Strict Mode remount, loaded reuse, failure/retry, correct nonce,
      widget removal, late callbacks and zero workflow redispatches.
- [ ] Synthetic browser checks cover direct load and client navigation, dev HMR
      and production rendering, correct styles, clean relevant console output,
      interaction-only verification and modal fallback. No real media or live
      Turnstile/provider endpoint is used in automated verification.
- [ ] Run the active packet's settled five root gates after implementation:
      `corepack pnpm format:check`, `lint`, `typecheck`, `test:unit`, `build`;
      then inspect boundaries/content safety, `git diff --check` and resource
      cleanup. Every automated check hardcodes fake/paid-off before imports,
      disables env-file loading and rejects unexpected external network access.
- [ ] After settled code, perform the previously authorized verified local
      restart outside the sandbox, with owned-tree shutdown and no stales.
      Readiness GETs do not dispatch analysis or prove live provider readiness.
- [ ] Owner alone verifies the retained-sample paid path and separately the
      uploaded-copy paid path. Record real outcome/timing and independent cleanup
      evidence without content. Keep both retained masters protected, samples
      local-only and Exit immediate even if deletion fails. Genuine AI quality,
      cloud deletion and deployment remain unproved by fake checks.

### Research supporting the plan — checked 2026-10-04

- [Next.js CSP guidance](https://nextjs.org/docs/app/guides/content-security-policy#development-vs-production-considerations)
  distinguishes development inline styles from production nonces. This is the
  documented basis for the development-policy fix, not permission to relax
  production policy.
- [Cloudflare explicit rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#explicit-rendering)
  covers SPA widget lifetime; [Cloudflare CSP guidance](https://developers.cloudflare.com/turnstile/reference/content-security-policy/)
  documents script nonces and strict-dynamic compatibility. Shared in-flight
  loading is our implementation remedy for the confirmed local loader race.
- [Google troubleshooting](https://ai.google.dev/gemini-api/docs/troubleshooting)
  distinguishes SDK/service failures and request/model compatibility;
  [structured output limitations](https://ai.google.dev/gemini-api/docs/structured-output#limitations)
  describe unsupported schema features/complexity. These are diagnostic branches,
  not evidence that the owner's failure was caused by schema or model selection.
  Google's general retry guidance does not override this demo's no-generation-retry
  policy.
- [MDN preload guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload)
  explains resource destination and later consumption. It does not identify the
  cause of this specific Next.js warning.

This planning pass changes documentation only. Fake mode and no API keys already
support the synthetic workflow and injected failure checks; they do not prove
live Gemini quality. Genuine analysis requires the configured provider key,
enabled live/paid capabilities, storage/renderer access and recorded approvals,
with paid testing owner-only. No local AI model/runtime/weights are used.

## Owner Exit follow-up — 2026-10-04

The latest owner decision replaces Clear media and blocking cleanup recovery with
**Exit**: return to the landing page, forget workflow state, expire app cookies,
and quietly attempt local/provider/renderer deletion. Failures never require a
visitor retry. This changes cleanup UX and access reset, not retained-master
protection, physical deletion evidence or paid-operation limits.

Implemented under this packet: unconditional same-origin cookie-expiry route,
after-response bounded backend handoff, valid-grant cancellation/revocation,
stale-cookie exit, local cleanup across unmount under the exclusive lease,
private clearing-tombstone retry without source restore, migration of the old
cleanup screen and updated privacy copy. No durable queue or cloud change.

Synthetic tests cover pending/failed cleanup with successful exit, offline backend
cookie expiry, bad origins/bodies, paid-disabled composition, immediate grant
revocation, storage denial, lease draining and sample preservation. All run with
fake/paid-off settings and no keys/network. Full settled gates and restart evidence
are recorded after verification in the controlled-check record.
Real deletion, genuine analysis quality and the owner's two paid input-path tests
remain unchecked. No agent-paid test, deployment or Git action is part of this work.

## Authorized private renderer update follow-up — 2026-10-04

The owner authorized updating the existing private renderer and local connection
for two owner-run manual input-path tests (retained sample and upload of the same
source). They rejected the assistant-added recurring numerical build-budget
prompt. Proceed with one allowlisted image build, its existing 1,200-second
timeout and one private revision update; preserve IAM, attached identity,
storage, expiry schedule and resource/operation caps. No new resources or public
release are authorized. Paid media dispatch remains exclusively the owner's.

The widget dashboard's `localhost` allowance is owner-confirmed; the backend's
ignored runtime metadata now records the matching expected hostname. Genuine
widget/provider quality and media deletion remain unchecked. Image proof now
preloads the same hardcoded fake/paid-off/credential-clearing environment guard
as the ordinary synthetic tests. Local normal startup keeps owner configuration.
The previously approved local validation stage remains `analysis`; later
assembly/render activation is outside this update. See the
[controlled-check record](../operations/GROUNDED_ANALYSIS_CHECK.md).

Before cloud submission, all five root gates passed again: `format:check`,
`lint`, `typecheck`, `test:unit` (721 synthetic tests across 70 files) and `build`.
The context boundary check accepts the shared environment guard while still
rejecting environment files, frontend/backend code, private media and test
suites. No provider or paid media dispatch occurred. The owner authorized
committing the pending work; cloud rollout evidence is recorded separately
only after successful verification.

## Corrected native image preparation — 2026-10-04

The first authorized build failed at its synthetic render check before image
publication or private service update. Local reproduction found the default
JPEG/full-range output was `yuvj420p`; the approved validator correctly rejected
it. The worker now fixes BT.709 limited-range output through Remotion's supported
option. Packaged FFmpeg lacks the raw `s16le` muxer, so bounded audio validation
uses PCM WAV with exact RIFF/chunk, mono/16 kHz/16-bit and sample-duration checks.
Malformed header/chunk/duration tests cover this parser. Native proof callers
also now pass the validator's required FFmpeg argument.

A fake, credential-free Windows adaptation of the Linux proof passed using only
generated PNG/tone media and already installed tools: 10,005 ms output, 242,761
bytes, 17,555,095-byte peak scratch, decoded frames/audio, cancellation, zero
owned processes and zero AI calls. Synthetic files were removed in `finally`.
No retained owner media was used. The local opt-in harness also type-checks with
the pinned TypeScript compiler. One corrected build retry is necessary to finish
the existing private-update request; preserve the 1,200-second build timeout and
one revision update. No automatic paid-media retry is authorized.

The final fake-only unit gate passed 732 tests across 71 files, including 11
malformed/valid decoded-WAV cases. Format, lint, typecheck and build also passed.
The isolated native worker receives hardcoded fake AI and disabled paid/live/cloud
settings, with `NODE_ENV=test` during synthetic proof. Its minimal environment
contains no parent credentials. Genuine AI/source quality remains owner-only.

## Verified private rollout and local handoff — 2026-10-04

The corrected image from `4c0f510` passed Linux Cloud Build in 130.972 seconds,
including synthetic output/decode/cancellation and runtime import/tool checks.
Verified immutable digest:
`sha256:3f404f3c5daa620f501558bf4103cbe04862e0b061b2d67834a0ff09e4d69377`.
One private revision update preserved service IAM, attached identity, environment,
secret mounts and all resource/operation caps. Serving traffic targets the Ready
revision; anonymous health returned 403 and ADC-authenticated health 200.
No renderer media endpoint or Gemini call was dispatched by the agent.

Local connection/approval metadata was configured without reading or editing
secret files; `FAKE_MODE`/`PAID_DEMO_ENABLED` retain their priority. The approved
stage stays `analysis`. Verified full restart removed 21 old identities with
zero survivors/listeners, then healthy replacements returned 200 for backend
health, `/start` and public config. Live analysis is enabled; assembly/render
remain off. Three owned temporary build contexts and synthetic media were
cleaned up. Retained local/cloud masters were untouched. The
[handoff record](../operations/GROUNDED_ANALYSIS_CHECK.md#verified-private-rollout-and-local-handoff--2026-10-04)
owns PIDs, log location and the owner-only sample/upload/Clear sequence.

Remaining: genuine widget/model access, source rights/Google-transfer confirmation
per browser flow, transcript/candidate quality and measured real-source/provider
cleanup; later assembly/export/full-envelope/device/public release gates. This
limited private rollout does not satisfy the unchecked live acceptance above.
Deviation: the first build failed before publishing; one corrected build retry
was required. One service update completed; no new resources, public deployment,
account usage polling or agent-run paid media test occurred.

## Owner preview notice removal — 2026-10-04

The owner explicitly removed the Step 1 technical transfer notice and separate
rights/paid-analysis checkbox. **Find moments** is now the sole browser action
initiating analysis, with no consent state disabling it. The existing privacy
panel, backend rights/transfer request validation, operator approvals, live flags,
Turnstile and admission bounds remain. The source of truth records this owner
decision; earlier references to a separate browser confirmation control are
superseded. No provider call or real-media test is authorized by this UI change.
Fake mode remains key-free and synthetic; genuine analysis stays owner-tested.

Verification: all five root gates passed (`format:check`, `lint`, `typecheck`,
`test:unit`: 732 synthetic tests across 71 files, and `build`). The running local
backend health, `/start` and public sample config returned 200. Existing flow
checks preserve preview-before-analysis and exact injected transport calls;
no provider/media processing was dispatched. Live visual confirmation and
Gemini quality/cleanup remain owner-only. The build's generated Next type
references were returned to the existing development paths.

## Owner sample-copy and verification follow-up — 2026-10-04

The owner's manual **Find moments** attempt failed while copying the retained
sample, before Gemini analysis. Content-free existing renderer request logs show
upload admission returned 200 and subsequent cancellation returned 200; no new
media request was dispatched by the agent. An isolated fake/loopback reproduction
confirmed Node Fetch rejects an HTTP 308 response with `redirect: error`, even
without a Location header. Google uses 308 for incomplete chunk acknowledgement.
The backend now uses `redirect: manual`, validates the exact acknowledged Range,
and rejects every Location header. It never follows an alternate destination.
Synthetic regressions cover chunk completion, malformed acknowledgement and
redirect rejection. The retained master and existing temporary cleanup remain.
See [Google's resumable protocol](https://docs.cloud.google.com/storage/docs/performing-resumable-uploads).

Turnstile uses its supported `interaction-only` appearance. The existing iframe
stays mounted as a native modal opens only for required interaction or a failure.
Errors offer explicit verification-only retry or cancellation; neither repeats
upload/AI work. Late callbacks and duplicate tokens cannot resolve another flow.
SDK widgets, owned script listeners and modal state are removed on completion,
cancel/unmount. Action/session/hostname and server verification remain unchanged.
See [Cloudflare configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/).

The isolated mock-widget browser check verified a centered modal, background
appearance, keyboard cancellation, manual retry and one-token completion, without
real Turnstile or media/provider requests. Source/backend and browser tests are
hardcoded fake, paid-off and credential-free. Genuine sample-copy/AI quality and
widget behavior remain exclusively owner-tested; these local corrections need
no private renderer image change.

Final verification passed `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit` (744 tests across 72 files),
and `corepack pnpm build`. The build's generated Next references were returned
to the existing development paths. The mock dialog also fit a 320-by-640 viewport
without overflow. Its helper process and listener were removed and checked again
after stabilization. The normal local backend reloaded the correction; backend
health, `/start` and `/api/sample/config` each returned 200. No paid processing
was initiated by these checks; real sample-copy, Turnstile and Gemini acceptance
remain the owner's manual checks.

## Owner analysis wait and cleanup correction — 2026-10-04

The later owner-run attempt reached source upload, preparation and proxy access;
existing renderer request statuses were 200, including cancellation. The owner
authorized a metadata-only Google Files diagnostic with the configured key.
A complete Files list returned 200 and zero files; a randomly named nonexistent
file returned 403. Zero uploads, generation calls, deletes or retained-master
access occurred in the diagnostic. The old cleanup confirmation accepted only
404 and replaced any prior analysis outcome with feature unavailable. Its UI
also falsely described a remote failure as local deletion failure. The original
generation result was discarded, so successful AI analysis is not claimed.

Cleanup now accepts empty DELETE responses and independently verifies absence:
GET 404, or a successful complete authorized list after GET 403. The same deadline
and fixed three-page limit apply; denied/incomplete lists and present files fail.
Definite upload-start rejection removes its never-created obligation. Safe
phase/status codes preserve analysis and cleanup reasons without file IDs,
provider messages or content. Cleanup retries make zero additional AI calls.
The shared contracts own provider-failed and cleanup-pending error codes once.
The frontend parses those errors on Clear and distinguishes local completion
from pending remote cleanup.

Finding moments rotates five brief messages every five seconds, wraps during
the wait and stops at terminal state, retaining elapsed time and cancellation.
The owner requires **Use sample** only locally; preview/production flags and
sample endpoints stay disabled. Streamed sample Clear removes selection/journal
without uploaded-file OPFS deletion. Both retained masters stay outside cleanup;
disposable processing/provider copies retain their deletion rules. Uploaded
workspace physical deletion and cleanup fences remain covered by synthetic tests.
See the [diagnostic record](../operations/GROUNDED_ANALYSIS_CHECK.md#owner-manual-failure-and-metadata-only-diagnosis--2026-10-04)
and [deployment exclusion checkpoint](CL-015-deploy-validate-measure-and-rollback.md#owner-requested-local-sample-exclusion--2026-10-04).

The owner retains the next live sample/upload analysis and Clear trials. Ordinary
tests remain hardcoded fake, paid-off, credential-free and network-blocked; they
prove neither real Gemini quality nor deployed capability exclusion. No private
renderer update, public deployment or Git action is needed by these corrections.

Verification: `corepack pnpm format:check`, `corepack pnpm lint`,
`corepack pnpm typecheck`, `corepack pnpm test:unit` (761 synthetic tests across
72 files) and `corepack pnpm build` all passed. Frontend typecheck passed again
after returning generated Next references to their development paths.
`git diff --check` passed. Local health, `/start` and `/api/sample/config` returned
200; existing supervisor creation times and both listener trees were verified
without stopping/starting apps. The normal backend watcher loaded the correction.
An ignored diagnostic helper's empty catch initially failed lint; a content-safe
comment resolved it and lint passed. No automated live media/provider test ran.

Changed ownership: backend Gemini transport/use case and regressions; shared
safe error contracts; frontend analysis transport/clear result, workspace cleanup
boundary/schema and regressions, sample CTA/wait messages and rendering tests;
frontend guide, source of truth, this packet, controlled-check record and the
CL-015 sample exclusion checkpoint. Earlier spinner/Turnstile/chunk-upload changes
remain in the same unstaged work. Actual deployed exclusion, genuine widget/AI
quality and the next owner sample/upload/Clear trials remain unchecked. The
owner's Chrome tab is not connected to the browser tool; its current cleanup
screen was not independently recovered. An old session after watcher reload
cannot itself prove deletion or bypass the normal cleanup fence.

## Owner Gemini setup follow-up — 2026-10-04
The owner reports creating the Gemini key and manually saving it in ignored
`apps/backend/.env.local`, completing a USD 5 API prepayment and saving a USD 5
monthly project spend cap. Automatic reload was disabled in the prepayment view
and remains instructed off; no final dashboard state or credentialed readiness
probe was independently checked. No key or provider payload was read, and no
account identifier was recorded. These account controls can exceed their target during
Google's enforcement delay and do not authorize a paid source test.

The [controlled-check record](../operations/GROUNDED_ANALYSIS_CHECK.md#owner-reported-gemini-setup--2026-10-04)
owns sanitized setup evidence; the [current provider guide](../operations/PROVIDER_SETUP.md#local-turnstile-setup--next-prerequisite)
owns the next genuine local Turnstile steps. Grant keys, the new private renderer
revision, rights/Google audiovisual-transfer approval and a numerical incremental
AI/cloud/build test allowance remain open. The renderer/live checkpoint above
stays unchecked. No live Gemini/Turnstile request, cloud change, restart or Git
mutation was performed. Fake mode still needs no keys and proves synthetic
results only; no local AI model is used.

Turnstile setup clarification: use one widget named `ClipBuilder`, initially
allowing `localhost`. At the separately authorized deployment checkpoint, add
the real frontend hostname, configure its exact backend hostname check, verify
the deployed challenge/validation, then remove `localhost`. The same keys can be
used through this transition. This replaces the guide's earlier separate-widget
recommendation; it authorizes no deployment, paid call or weaker validation.

The owner subsequently reports copying the Turnstile sitekey and secret into
the backend's ignored `.env.local`. The private file was not inspected; expected
hostname and genuine validation remain unchecked. The provider guide now
explains the existing processing-grant AES-256-GCM key map, matching active label
and private 32-byte base64url generation command. Grant-key creation/storage is
not yet confirmed. No secret was generated, provider contacted or app restarted.

This setup follow-up changed documentation only; it added no application test
or live-quality evidence and did not extend earlier root-gate results. Both
commands below returned exit 0. Subsequent CL-015 inspection confirmed Markdown
is excluded by `.prettierignore`, so the first command did not validate Markdown
style; `git diff --check` did verify whitespace. The normal `pnpm exec prettier`
shim was unavailable in that pass, so its existing pinned entry point was used
through pnpm; no dependency installation or version change was made. The later
code-fixed grant-label implementation and code checks belong to CL-015.

```text
corepack pnpm exec node node_modules/prettier/bin/prettier.cjs --check docs/operations/PROVIDER_SETUP.md docs/operations/GROUNDED_ANALYSIS_CHECK.md docs/operations/LOCAL_RELEASE_PREPARATION.md docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md docs/tickets/README.md
git diff --check
```

## Owner-requested Gemini prompt review — 2026-10-04

The owner requested a thorough researched revision before their manual paid
check. This follow-up owns the source-analysis / Find moments prompt under
CL-007. The separate selected-clip speaker/card policy was inspected to verify
the responsibility boundary; it was not merged into source analysis or rewritten.

Reviewed the current migration, source-of-truth shareability rubric, compact
provider schema, transcript/candidate contracts, reconciliation and actual SDK
request. The old prompt stated the broad task but omitted substantial required
semantics. Its global prohibition on names/instructions also needed clarification
so faithful transcription would not be confused with identity inference or obeying
source instructions.

| Area | Revision |
| --- | --- |
| Source fidelity | Full-source audible English speech, including unselected passages, fillers, repetitions, negation and spoken names; no polishing, translation, subtitles substituted for audio or invented inaudible words |
| Timing and references | Full-source millisecond clock including leading silence, actual audible word boundaries, ordinal IDs, chronological order and the existing 250ms overlap limit; no fabricated timing to pass validation |
| Speakers | Stable anonymous audible-voice labels, explicit null uncertainty, complete inclusive turn partition, and the all-null/empty-turn fallback |
| Editorial selection | Eight existing rubric signals defined, strongest first, distinct ideas across the source, natural complete boundaries, preserved qualifications/context, actual 10–60s ranges, 35% overlap bound and no count/duration padding |
| Public grounding | Field meanings and lengths, distinct ordered evidence references, exact contiguous candidate quotations, fixed editorial notes and bounded truthful caveats; instruction/performance claims excluded from public copy |
| Trust/output | Spoken instructions remain source speech; never obey them. JSON only, no tools/search/extra fields or source-analysis framing/card plan |

The reviewable policy and final user task now live in
[`analysis.prompt.ts`](../../apps/backend/src/analysis/analysis.prompt.ts).
The adapter imports them and places the specific anchored task after the video.
Descriptions on the existing wire schema explain the positional word/turn tuples
and candidate semantics without defining new cross-boundary schemas. The schema
and application rejection rules remain authoritative; prose is not a security
boundary or proof of model obedience.

Official Google guidance checked on 2026-10-04:

- [Current Gemini 3.x guidance](https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5#prompting-best-practices): direct instructions and an anchored task after long source context. The earlier Gemini 3 guide now directs readers to this page. No forced chain-of-thought or additional model call was added.
- [Sampling parameter guidance](https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5#sampling-parameters-no-longer-recommended): remove temperature/top-p/top-k overrides for Gemini 3.x. Removed the existing `temperature: 0` from the shared transport, so both source and selected-plan generation use model defaults. Model, thinking configuration, maximum output, call/retry limits and gates were not changed.
- [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output#best-practices): descriptive fields, strong types and application semantic validation. The documented subset explicitly supports `prefixItems`; compact tuples need no speculative format replacement.
- [Video understanding](https://ai.google.dev/gemini-api/docs/video-understanding#extract-detailed-insights-from-video): default visual sampling can miss fast details. This documentation and a millisecond output type do not establish word-alignment or speaking-face accuracy. No video sampling change was made in this packet.

The injected SDK regression first failed because it still sent the old policy
and generic task. It now verifies the actual system instruction, video-before-task
ordering, descriptive positional JSON schema, absent sampling overrides and
unchanged one-generation/deletion call counts. Focused source-analysis verification
passes **55 synthetic tests in one file**. The initial filtered script invocation
forwarded an extra `--` and ran all 243 backend tests instead; it had the same
single expected regression failure. The corrected focused command is
`corepack pnpm --filter @clipbuilder/backend test:unit src/analysis/analysis.test.ts`.
The executable Prettier shim was unavailable, so the existing pinned Node entry
point formatted the four changed code files; no dependency install occurred.

Settled verification after code edits (all exit 0):

```text
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
git diff --check
```

The full suite passed **716 synthetic tests in 70 files**: root 33/4,
contracts 60/5, composition 3/1, backend 243/16, frontend 316/32 and renderer
61/12. Test configuration remains hardcoded fake/paid-off, credential-free and
guarded against external networking. Root formatting checks code; Markdown is
excluded by `.prettierignore`. The local frontend build inventory passes with
1,277 files, 26 external package links and `selfContained: false`; it provides
no new immutable release/deployment acceptance. All tool processes finished;
no application listener, new cleanup obligation or temporary provider file was
created. Diff review found no new cross-app dependencies, duplicate boundary
schemas, unsafe casts, secret/media content, logging, environment readers,
listeners or timers in the prompt/schema changes.

Remaining quality limits: quotes are checked against the model's own transcript,
not independently against audio. A plausible but wrong transcript/timestamp or
weak editorial recommendation can therefore require human rejection. Silent or
unusable speech cannot produce the required nonempty valid transcript; never
invent speech to fill it. Real overlapping dialogue may exceed the existing
250ms reconciliation limit and fail. The 12,000-word schema limit does not prove
every allowed 20-minute source fits the existing 65,536-token response allowance.
Incomplete/refused/unusable output still fails without an automatic repair call.
No alternate ASR/aligner or local AI model/weights were introduced or verified.

With `FAKE_MODE=true` and no keys, deterministic fixtures, request-shape and
rejection/cleanup checks work; they generate no real Gemini output and prove no
live transcription, ranking or timing quality. Live analysis still requires the
owner's key, enabled live/paid gates, renderer readiness, rights/provider-transfer
and applicable spend approvals, and is reserved for their manual action. No
ignored environment/private configuration, real media or credentials were read.
No provider request, cloud mutation, deployment, app launch or Git mutation was
performed. Live acceptance above remains unchecked.

## Owner-requested live preflight — 2026-10-04

The owner requested restarting the local stack to try a paid flow and review
the Gemini prompt. The owner reports choosing real/paid switches. Verified
shutdown cleared both existing supervisors, all captured descendants and ports
3000/4000. Normal backend replacement failed before listening with the fixed
`configuration_validation_stage_missing` category. Its entire nine-process tree
was removed and both ports remained clear through stabilization. The frontend
replacement was not started because backend readiness failed; both apps are
stopped. Content-safe logs and exact identities are in the
[controlled-check preflight](../operations/GROUNDED_ANALYSIS_CHECK.md#local-restart-preflight--2026-10-04).

No secret/private runtime file was inspected or modified. The ignored runtime
supervisor received one fixed startup-error category, without raw diagnostic
output. The current grounded Gemini policy was inspected and left unchanged.
No application implementation or provider/cloud action occurred; no new root
gate or live-quality evidence is claimed. The owner requested paid testing,
but the numerical AI/cloud/build allowance, Google audiovisual transfer consent
and renderer revision update still require the documented checkpoint before
dispatch. Fake mode remains credential-free and synthetic. Live Turnstile,
model/account access, actual transcript/candidates, cleanup and full export stay
unchecked. This evidence does not satisfy live acceptance or authorize Git.

## Local execution evidence — 2026-10-03

Dependencies: clean worktree at `db58981`; CL-006 committed local/Linux/private
foundation and CL-004 reusable candidate UI were present. Current migration
authority supersedes the collapsed Deepgram/browser-audio/server-job mechanics.
No adjacent assembly/preview/export packet was implemented.

Implemented protected grant/restore/upload/run/clear routes; bounded same-origin
bridge and direct runtime-only private upload; atomic action reservations and
Turnstile hostname/action/session checks; checksum/generation/profile validation;
one Gemini source call; strict normalization/reconciliation; signed source/result
integrity receipt; explicit Google deletion/404 verification and proxy release;
browser confirmation, truthful transfer copy, pending/uncertain recovery and atomic
result commit into the existing read-only candidate UI.

Source analysis uses compact word/turn tuples, server ordinal IDs, anonymous
labels and null confidence. Public title/hook/evidence copy is extractive;
rationale/caveats are contiguous source quotations or fixed editorial statements. Candidate
word references/order/evidence/ranks/sentence boundaries/10–60s/overlap/claims/
quotes are deterministic. Exact word overlap tolerance: 250ms accepted, 251ms
rejected for fake and Google labels. No model repair, trend evidence or padding.

Two metered action nonces are consumed: legacy `transcription` now means upload
admission, and `candidate-analysis` means prepare/one source AI call. The migration
does not permit a second candidate-only call. SDK 2.25.0's file uploader revealed
independent retry/abort defects, so its documented REST Files start/finalize is
bounded directly; generation/get/delete keep the pinned SDK with one attempt and
bounded responses. Browser intake's former chained digest was incompatible with
renderer SHA-256; it now uses bounded incremental standard SHA-256. Older local
records fail source revalidation safely. These are ticket-local implementation
choices, with no product/privacy/architecture gate changes.

One verification deviation: root ESLint included six pre-existing errors in
Git-ignored CL-006 private helper scripts. `eslint.config.mjs` now excludes
`private/**`, matching the existing privacy/Git boundary. Those files were not
opened or modified. No dependency installation or version change was required.

Focused evidence covers: valid and no-candidate API results, exact upload/prepare/
generation/release counts, duplicate race, tampered receipt/source/generation,
CSRF/disabled spend/expiry, malformed/malicious/quote/claim/reference/turn/range/
timing responses, refusal, cancellation, 90-poll cap, SDK wire/no-retry/deletion
proof, failed deletion obligation, bounded ingress, journal failure, committed
refresh with no calls, uncertain recovery, clear fencing and SHA-256 padding/
chunk boundaries. Private proxy read verifies bytes/hash and removes owned scratch;
failed release fences the session until its existing scheduled cleanup retry.
Google cleanup is scoped to the owning session. Failed reservation-journal
writes dispatch zero actions and remain visible; cloud-cleanup failure still
deletes local media, reports partial cleanup and permits cleanup-only retry.

Owner-directed review findings were reproduced before correction: valid browser
and renderer duration/fps differences caused rejection; reordered source words
could invent rationale/caveat assertions; Clear could delete before a late Google
upload finished; and grant refusal left an uncleared workspace without a session.
Regression checks now pass. Decoded duration/fps are authoritative for analysis,
while the original intake descriptor remains available for source reinspection.
Google cleanup waits for upload settlement and shares verified deletion with
analysis finalization. The browser journals whether remote cleanup is required;
only a never-admitted record accepts a missing session as already clean.

Settled root evidence (all exit 0):

```text
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
git diff --check
```

Unit totals: root 20, contracts 44, composition 2, backend 117, renderer 23,
frontend 231: **437 tests across 50 files**. The build completed all five packages
and generated `/start` plus `/api/analysis/[action]`. Synthetic state checks
verified valid/no-candidate success, failure/uncertainty, source/result mismatch,
refresh without redispatch, abort/clear fencing, local deletion despite remote
failure and exact failed-release retry.

Actual fake browser evidence: temporary documented build/start services on
127.0.0.1:4000 and localhost:3000 passed health, `/start` and sample config GETs.
An isolated environment used fake/off flags, no credentials and a loopback-only
network guard. Prepared synthetic input produced three candidates; selecting
the second, keyboard selection, transcript/notes, refresh restoration, Proceed,
fixed read-only review and simulated export all worked. MP4 download remained
disabled because no validated video exists. Desktop and 390×844 result views
were inspected; the phone view had no horizontal overflow. Start over, refresh
after reset and preview cancellation returned to intake. This is fixture UI
evidence, not real media, challenge or AI-quality proof.

An initial dev-server attempt was disrupted by rebuilding watched packages and
Next HMR failure; its guard blocked one non-loopback attempt. It was cleaned up
and replaced with settled build/start services. The successful run recorded zero
external attempts. All 16 owned stable-run processes were stopped by verified
PID/creation-time identity; repeated checks found zero owned survivors and zero
listeners on 3000/4000. Content-free logs/runtime records are Git-ignored under
`private/cl007-fake-check/`; no app remains running.

Boundary fixtures and fake/off pre-import network guards passed. Final diff checks
found no cross-app imports, Node/provider dependencies in contracts/browser code,
duplicate cross-boundary schemas, unsafe casts, debug logging or stale TODOs in
the new modules. Tests verified bounded response readers, deadline/listener
cleanup, checksum chunk memory, renderer scratch removal and cleanup fencing.
All verification commands returned; temporary app services were cleaned up.

`FAKE_MODE=true` and no keys still provide synthetic development results. All new
tests use synthetic injected transports, fake/off process environment and zero
external calls. They prove engineering behavior and the fixture UI, not AI quality or real upload/
challenge/clock/device readiness. No local AI model is required or claimed.

Remaining unchecked: new renderer image build/rollout; Gemini key/model access,
paid-project terms, new AI audiovisual-transfer rights/approval and numerical
AI/cloud/build budget; real transcript/anonymous-turn/candidate quality; actual
clock/codec/proxy parity, full maximum-envelope stress, responsive/keyboard/zoom/
reduced-motion challenge/upload/device matrix, live deletion and interruption
behavior; public sample/release rights, complete license/font/codec/telemetry
notices and public paid/deployment controls. Provider cleanup obligations are
process-local; crash/uncertain upload can rely on Google's separate 48h Files
expiry, not an unconditional deletion guarantee. Later CL-008–011 work remains.

Reviewable next checkpoint: [controlled analysis check](../operations/GROUNDED_ANALYSIS_CHECK.md).
The owner deferred this checkpoint. It proposes one build/private revision update and one source analysis, with no
automatic retry or resource creation; budget/rights/data/external authorization
are still owner-only. No secrets/real media were read and no ADC/provider/cloud
action, usage polling, new independent review agent, staging or commit was performed.
CL-008 local engineering is dependency-ready under the owner's latest direction;
its live speaker-quality evidence retains a separate gate.

### Changed files

Pass-2 owner revalidation found one additional local defect: a failed remote
Clear followed by successful local deletion erased the only journal evidence,
and reload lost the React ref that tracked cleanup. It was independently
reproduced as a failing injected workspace test before correction. A separate
strict `remote-cleanup` IndexedDB key contains only version, allow-missing and
cleanup status, survives media/result deletion, and restores a cleanup-only state.
New source preparation is blocked while it exists; only confirmed remote Clear
plus committed acknowledgement removes it. Admitted work never weakens the
missing-session rule. Failed obligation persistence still attempts physical
media deletion and preserves the existing source evidence/recovery fence;
metadata transactions drain before releasing workspace ownership. React-only
cleanup refs were removed. No identity, content, receipt or capability is stored
in the independent marker.

Focused recovery/journal/session checks passed **103 tests across six files**,
including repeated remote failure across reload, zero analysis calls, successful
cleanup-only acknowledgement, denied journal writes, acknowledgement failure,
transaction commit ordering and corrupt/content-bearing marker rejection.
This is injected fake/off recovery evidence; the actual live Clear/challenge/
browser sequence has not been rerun and remains at the deferred checkpoint.
The combined CL-007/008 final suite now contains 478 tests across 52 files.
All five root checks and `git diff --check` were rerun after this correction.
The first root unit attempt hit the existing 10-second ESLint boundary-test
timeout; an unchanged serial rerun passed that gate in 4.76 seconds, followed
by all package tests and the five-package build. No timeout was increased.

Pass-3 owner revalidation found a second cleanup edge: successful remote Clear
expired the cookie, then a failed local acknowledgement left a marker that
retried remote Clear after reload and could never recover from `SESSION_MISSING`.
The real browser API with synthetic session/204/401 responses independently
reproduced the failure before correction. Remote confirmation now commits as a
separate marker status before local acknowledgement; confirmed markers retry
only local deletion/acknowledgement, including after reload. Local deletion
failure retains this confirmation. Legacy markers default to pending, and a
missing session still cannot acknowledge unconfirmed admitted work. Confirmation
and deletion transactions share the owned write queue. No new analysis request
is dispatched. If confirmation itself cannot commit before reload, cleanup
remains conservatively pending rather than claiming unproved deletion.

Focused recovery/journal/session checks passed **108 tests across six files**.
The new recovery test uses the real client API, explicitly observes the expired
session response and then completes reload recovery without another remote call.
Additional regressions cover unconfirmed missing-session fencing, local deletion
failure after remote success, legacy/confirmed restoration and invalid status.
The settled combined CL-007/008 suite contains **483 tests across 52 files**;
all five required root gates and `git diff --check` pass. This evidence uses
synthetic responses with fake/off configuration and no keys. The actual live
Clear/challenge/browser sequence remains at the owner-deferred checkpoint.

Owner-directed validation pass 4 reported no actionable findings on the settled
CL-007 snapshot over `db58981`. All pass-1/pass-2/pass-3 findings remain resolved.
The reviewer reran `corepack pnpm --filter @clipbuilder/frontend test:unit
src/features/media/browser.workspace.test.ts`: **23 tests in one file passed**;
`git diff --check` also passed. This was a read-only local review with synthetic
fake/off tests, no credentials, provider/cloud calls, launches or Git mutations.
The reviewer did not rerun the full root gates or the earlier browser session;
their evidence remains recorded above. The verdict covers CL-007's authorized
local scope only, excludes CL-008-specific additions and retains every deferred
live, durability, rights, device and release limitation. In particular, failed
confirmation persistence before reload remains conservatively pending.

- Backend: `apps/backend/README.md`; `src/app.ts`;
  `src/admission/{admission.composition,processing.admission,turnstile.verifier,turnstile.verifier.test}.ts`;
  `src/config/{env.schema,loadConfig.test}.ts`; `src/media/renderer.cloudrun.ts`;
  `src/http/routes/analysis.route.ts`;
  `src/analysis/{analysis.composition,analysis.provider-shape,analysis.reconciliation,analysis.test,analysis.usecase,gemini.adapter}.ts`.
- Frontend: `apps/frontend/README.md`; `src/app/privacy-dialog.tsx`;
  `src/app/api/analysis/[action]/{route,route.test}.ts`;
  `src/features/media/{browser.workspace,browser.workspace.test,source.worker,source.checksum,source.checksum.test,workspace.restore,workspace.schema,workspace.journal,workspace.journal.test}.ts`;
  `src/features/session/session.provider.tsx`;
  `src/features/sample/sample.experience.tsx`;
  `src/features/source-analysis/analysis-challenge.tsx` and
  `{source-analysis.api,source-analysis.flow,source-analysis.flow.test}.ts`.
- Renderer: `apps/renderer/README.md`; `src/app.ts`;
  `src/expiry/media-sessions.ts`;
  `src/media/{inspection,media-operations,media-operations.test}.ts`;
  `test/media-fixture.ts`.
- Contracts: `packages/contracts/src/{api.schema,cloud-media.schema,grounded-analysis.schema,media.schema,index}.ts`.
- Documentation/configuration: `eslint.config.mjs`;
  `docs/operations/{COST_MODEL,PROVIDER_SETUP,GROUNDED_ANALYSIS_CHECK}.md`;
  this packet and `docs/tickets/README.md`;
  status updates in `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` and
  `docs/architecture/{GEMINI_REMOTION_MIGRATION,MIGRATION_FILE_INVENTORY}.md`.

Initial CL-007 Git state: 53 ticket-related modified/new files. After CL-008 and
the pass-2/pass-3 local corrections, the combined worktree has 71 modified/new files;
index empty, no commit.

## Cross-ticket audit correction — 2026-10-03

The owner authorized fixing the full-history grounding finding. Sixteen new
regression cases failed against the original substring check: partial prefixes,
partial suffixes, punctuation-only copy and an empty quote inside otherwise
grounded text were accepted as source evidence.

Reconciliation now requires a nonempty contiguous sequence of complete normalized
tokens for public title/hook/evidence, non-editorial rationale/caveats and quoted
spans. NFKC/case/whitespace/punctuation normalization and approved fixed editorial
explanations remain supported. Noncontiguous/reordered text is still rejected.
The same checks apply to fake and Google provider labels without another model
call, response repair or provider/config/schema change.

Changed: backend analysis reconciliation, its existing test file and this packet.
Twenty regressions cover the rejected cases plus accepted normalization and fixed
editorial explanations. Focused analysis/fixed-assembly verification passed
**70 tests in two files**. The combined settled gate passed all five root commands
and **665 tests in 66 files**; final read-only revalidation found no actionable
findings in the three corrections. Exact commands, test counts and limits are in
[CL-010](CL-010-deliver-automatic-clip-review.md#settled-cross-ticket-verification-and-revalidation--2026-10-03).
Tests use synthetic data, fake/off configuration and no keys/network; real
transcript/candidate/quality, provider data/rights/spend, device and cloud release
gates remain unchecked. No retained media, secret or provider/cloud resource was
changed. Nothing was staged or committed.

## File-level commit plan

The [seven-step CL-007/CL-008 commit plan](CL-007-008-COMMIT_PLAN.md) lists exact
whole-file staging commands and ticket-prefixed commit messages for the current
combined worktree. It covers 72 distinct files including the plan itself.
The owner authorized sequential execution on 2026-10-03. Implementation groups
1–5 were staged whole and committed in order; this ticket is the step-6
documentation checkpoint. Final completion is recorded in
[CL-008](CL-008-productionize-active-speaker-assembly.md#commit-execution-record).
The earlier unstaged worktree counts describe the pre-commit verification snapshot.

<details>
<summary>Earlier packet and evidence, retained as history where superseded</summary>


Status: Planned; browser-owned execution revision, external gates pending<br>
Milestone: M3 - protected analysis<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-004, CL-004A, CL-005 admission foundation and CL-006 audio proof<br>
Suggested commit: `CL-007: validate protected browser-owned analysis`<br>
Parent: [source of truth section 0.9](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#09-browser-owned-media-architecture-revision-2026-10-01)<br>
Technical contract: [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md)<br>
Index: [README.md](README.md)

**Execution authority:** this current packet and the linked browser contract
supersede the server-media mechanics retained below as history. No GCS,
generation/capability/lease, native media job or cloud-render acceptance item
survives by being left unchecked in that history. Preserve unchanged product,
grounding/quality, rights, secret handling, fake/off test and dependency rules.
No Git, provider, paid, install or cloud action is authorized by this document.

## Objective and boundaries

Use local extracted audio and bounded protected requests to obtain a normalized
timestamped transcript and zero-to-four grounded candidates. Target three/four
strong moments near one minute without padding; the visitor chooses exactly
one contiguous 10-60s word range. Reuse CL-004's gallery, local source preview,
smooth selection layout, transcript and read-only notes.

No original-video upload, server media job, GCS analysis bundle or durable
provider-result store. Backend cannot read OPFS/IndexedDB. Public paid traffic
stays gated on the current process-local admission limitations; no cookie-only
quota/idempotency claim. Provider data/cost approval is separate from code.

## Current implementation checklist

- [ ] Implement a dedicated bounded same-origin binary-audio route/use case,
      separate from the fixture-only 8-KiB JSON proxy. Enforce actual received
      bytes/profile/duration, capacity/body deadlines and safe abort cleanup
      before transcription. Hosting transport proof remains CL-015.
- [ ] Submit one approved Deepgram pre-recorded binary audio request, never a
      user URL/callback/file-store workaround. Exact call budget <=1; SDK retry=0.
      Project opt-out/retention settings and rights/data consent stay explicit.
- [ ] Validate provider response, normalize word IDs/speaker labels/timestamps/
      finite bounds and discard raw data. Diarization labels are not real
      identity or active-speaker visual inference.
- [ ] Return normalized transcript and authenticated provenance receipt bound
      to session/revision/hash/expiry. Cache success in bounded browser journal;
      backend holds no durable transcript or payload-recovery repository.
- [ ] Candidate request validates receipt/bounded submitted transcript and
      approved token/schema limits; one foreground Structured Outputs call,
      store:false, no background polling or automatic paid retry.
- [ ] Reconcile all word references/order/ranges/reasons against real normalized
      transcript. Handle zero candidates honestly; do not synthesize success,
      fake trend evidence or pad count/duration.
- [ ] Integrate process-local atomic action reservation and boot-epoch grants.
      Conflicting replay/stale cookie/restart/capacity/uncertain result fail
      closed; no paid re-dispatch from refresh/remount/network retry.
- [ ] Candidate retry is a separately allowed explicit action with transcript
      reuse and zero additional transcription, not implicit recovery.
- [ ] Commit validated browser results before advancing UI. Unknown/lost remote
      payload is a visible failure/uncertain result, not seamless resumability.
- [ ] Resolve actual immutable ranges against local source identity; clamp
      player seek/end/reset and reject mismatched cached source/revisions.

## Verification and acceptance

Own backend transcription/candidate adapters, ports/use cases/routes and receipt
validation; frontend result hydration, analysis status and candidate integration;
shared schema additions only at cross-boundary ownership. No application import
reads env/media, listens, contacts providers or obtains credentials.

- [ ] Fake/injected tests assert exact zero calls on every rejected case and
      exact allowed transcription/candidate counts, including duplicate races.
- [ ] Corrupt receipts, malicious transcript text, oversized payload/token limits,
      provider timeout/disconnect, stale epoch and result-loss paths covered.
- [ ] Refresh of committed local success makes zero new calls; in-flight/lost
      work does not automatically retry. Clear fences late response publication.
- [ ] Existing UI/notes remain timestamp-grounded, responsive and read-only;
      source remains on device, no provider/raw content enters logs/errors/URLs.
- [ ] Run focused adapters/contracts/session/component/browser checks and all
      five root gates; document every rights/provider/privacy/spend/runtime gate
      still unchecked. Live checks require specific owner call/budget permission.

Update provider/retention/cost guides with actual adapter options and results.
Paid model availability, language quality and audio-profile transcription parity
are not proven by fake contracts. No speaker assembly/visuals/render here.

## Historical packet

<details>
<summary>Superseded server-media plan, retained only for decision history</summary>

The following text is not an execution checklist, setup instruction or evidence
of completion under the browser-owned architecture. It must not be used to
reintroduce cloud content storage, jobs or unsupported guarantees.

# CL-007 — Deliver the live-analysis vertical slice

Status: Planned<br>
Milestone: M3 — live analysis<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-004, CL-004A, and CL-006<br>
Blocks: CL-008, CL-009, CL-012<br>
Suggested commit: `CL-007: deliver grounded live analysis`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Owner setup ordering (2026-10-01): [CL-004A](CL-004A-prepare-third-party-provider-readiness.md)
and [provider setup](../operations/PROVIDER_SETUP.md) own the dashboard/key/data/
budget walkthrough. Inspect its documentation handoff before implementation;
actual account readiness is needed only for separately authorized local provider
checks. Build/test adapters with fake ports/transports here, with no GCloud
setup or credentialed cloud execution. Full cloud flow proof stays final CL-015.
Update the exact Deepgram endpoint and model-improvement opt-out request policy
with fake request proof; do not invent an env flag or infer privacy from a key.

Latest owner clarification (2026-10-01): CL-004 owns the complete development-
only frontend preview and its reusable screens. This packet replaces the fake
adapter with its real implementation and proves integration, media, recovery,
privacy/rights/spend/readiness gates; it does not recreate the workflow UI.
Earlier restrictions on synthetic progress apply to real/public mode, not the
explicitly labelled local preview. Fake completion is not evidence for this
packet's unchecked acceptance. See the parent development-preview clarification.

Owner UI/content revision (2026-10-01): reuse CL-004's one changing workspace
and shared Progress. Show one known analysis-stage message, never invented
percentages or timed fake work. Prefer complete interesting moments near 60
seconds when earned, targeting three to four strong choices without padding;
zero-to-four/no-candidate validity remains. Internal pause/filler cuts are
deferred pending a separate ordered-segment contract revision, not authorized
in this contiguous-range ticket. Parent section 0.6 governs this revision.

Deliver one coherent upload-to-candidate-review analysis feature: audio
extraction integration, transcription port/fake/live adapter, candidate
selection port/fake/live adapter, deterministic reconciliation, analyze job and
API routes, progress/poll/cancel/refresh/retry behavior, candidate/no-candidate
UI, evaluations, and bounded live evidence when authorized.

This is intentionally one vertical-slice ticket. Splitting transcription,
candidate selection, orchestration, and UI would leave intermediate tickets
that cannot deliver or verify the feature and would repeat the same recovery,
idempotency, privacy, and call-count context.

## Portfolio value

Show the core AI judgment end-to-end: convert an owned conversation into
timestamp-grounded, explainable editorial choices while preserving provider
boundaries, one-call budgets, refresh recovery, and honest failure behavior.

## Standalone implementation context

- Analysis starts only after authoritative media inspection and explicit user
  confirmation. It produces zero to four grounded candidates, targeting three
  strong alternatives without padding; otherwise it returns an honest
  no-candidate state without a manual range path.
- Deepgram receives bounded extracted audio, not a user URL or video.
  Transcription normalizes words, times, punctuation, and optional diarization
  into stable IDs, then discards the raw response.
- OpenAI receives only the bounded normalized transcript/rubric/context. The
  Responses request uses strict Structured Outputs, `store: false`, no
  conversation state, no SDK retry, and at most one call.
- Transcript/user context is delimited untrusted data. Model output references
  word IDs; deterministic code derives time/duration, rejects invalid evidence,
  overlap, invented claims/quotes, virality promises, and injection.
- A manual candidate retry may reuse a valid stored normalized transcript and
  must not repeat transcription. No automatic provider repair/retry occurs.
- Fake/sample behavior remains deterministic and available without credentials.

## Dependency evidence required

- CL-004 must provide the reusable candidate/evidence/no-candidate experience
  and prove sample selection makes zero provider calls.
- CL-006 must provide passing inspection/extraction/job lifecycle, abort/
  timeout/cleanup, and authoritative media-limit evidence.

Use the existing schemas and progress model. A missing inspection or candidate
UI foundation blocks this ticket rather than being reimplemented inside it.

## Files and areas owned

- Transcription and candidate provider ports, fakes, live adapters,
  normalization, prompts/schemas, and provider contract tests.
- Analysis domain/reconciliation/use case, analyze job stages/result, routes for
  start/status/cancel/result, and operation recovery.
- Frontend analysis confirmation/progress/polling/failure/retry/no-candidate and
  live-result candidate integration.
- Candidate evaluation fixtures/graders and optional owner-controlled live
  analysis evidence.
- Provider setup/cost/privacy documentation for analysis.

## Scope boundaries

### In scope

- `POST /v1/analyses`, operation poll/cancel, `GET /v1/analyses/:analysisId`,
  and `GET /v1/session` evidence required for restore.
- Ordered named job stages from descriptor/audio extraction through transcript,
  selection, reconciliation, result, and complete.
- English v1 transcription with diarization requested but provider-declared
  unavailability tolerated; stable word/utterance/speaker labels.
- Candidate prompt boundary, strict provider-shape schema, deterministic
  reconciliation, one-to-four candidate bounds, the target-three outcome, and
  the no-candidate outcome.
- Bounded category/audience/target-platform context; trend signals remain
  disabled unless separately approved.
- Refresh, hidden-page polling pause/resume, cancellation, timeout, provider
  failure, missing result, retry with transcript reuse, expiry, and clear.

### Out of scope

- Assembly/active-speaker work (CL-008), contextual visuals (CL-009), automatic
  clip review/confirmation (CL-010), render (CL-011), public hardening/deployment, trend
  research, numeric virality scoring, provider fallback, or multilingual claim.
- Persisting raw provider responses/prompts, automatic repair calls, re-running
  transcription during candidate-only retry, or exposing provider names/errors
  in public UI.

## Implementation checklist

### 1. Transcription boundary

- [ ] Implement a port accepting only job-local audio, duration, `en`,
  diarization flag, request/deadline/signal context.
- [ ] Make fake and live shapes pass the same strict normalization; generate
  ordinal word/utterance IDs and enforce count/character/time bounds. Before
  accepting live output, define and record the numeric source-controlled word
  overlap tolerance, then test the exact tolerance and one millisecond beyond
  it against both fake and live-normalized shapes.
- [ ] Record only content-free minutes/model-config/call outcome; discard raw
  alternatives, tokens, provider IDs, and payload after normalization.
- [ ] Disable provider/SDK retries and propagate timeout/abort through extraction
  and adapter.

### 2. Candidate selection and reconciliation

- [ ] Build source-controlled role/policy/rubric/schema/delimited-input prompt
  and strict Structured Outputs request with `store: false`.
- [ ] Validate and resolve every word/evidence ID, derive boundaries/duration,
  enforce 10–60 seconds, check clean boundary/evidence/overlap/distribution, and
  assign server IDs/ranks.
- [ ] Reject invented quotes/facts, guaranteed performance, sensitive inference,
  duplicates, reversed/missing IDs, unsupported signals, and transcript/user
  instructions that attempt to change policy.
- [ ] Permit only whitespace/list dedupe repair; never invent/move/rewrite or
  make a second call.

### 3. Job/API/recovery

- [ ] Enforce inspection proof, feature/paid switches, bounds/source,
  allowance/capacity/budget, Turnstile, marker/lease, and job start in documented
  cheapest-first order.
- [ ] One analyze action makes at most one transcription and one candidate call;
  replay returns existing operation.
- [ ] Persist only normalized transcript/candidates/revisions when the privacy
  gate is approved; otherwise update recovery behavior/public copy explicitly.
- [ ] Encode failure evidence so manual candidate retry reuses transcript when
  valid and full retry never occurs invisibly.

### 4. Frontend experience

- [ ] Add explicit confirmation before paid analysis and explain limits/privacy.
- [ ] Show named ordered stages, elapsed time, source duration, restrained
  reduced-motion state, and no fake percentage.
- [ ] Poll at server interval with capped backoff; pause after hidden timeout;
  reconcile immediately on visibility/refresh without duplicate operations.
- [ ] Preserve source/transcript evidence accurately across failure; provide
  only the evidence-allowed retry, clear, or sample recovery.
- [ ] Feed the same CL-004 candidate/evidence UI with validated live results.

## Contracts and state transitions

- `analysis-confirmation -> analyzing -> candidates | no-candidates |
  analysis-failed`; cancellation stays requested until proven terminal.
- Operation success is insufficient until the analysis bundle is fetched and
  validated. Missing/invalid result becomes recoverable failure.
- `RETRY_ANALYSIS` is evidence-driven. Valid transcript reuse makes zero new
  transcription calls; a consumed provider action stays consumed when cost was
  incurred even if output was unusable.
- Candidate rank and duration are deterministic server outputs; model IDs/times
  are not trusted.

## Privacy, provider, and cost constraints

- No video, filename, object path, signed URL, grant/cookie, IP, identity, or raw
  provider payload enters either model request.
- Logs/result status contain counts, language, safe config ID, usage, and rule
  codes only—no transcript/prompt/rationale/title.
- Live calls require provider/privacy/spend approval, blank examples filled by
  the owner in ignored secret storage, current model/data-policy review, and an
  exact synthetic/purpose-recorded call budget.
- Default/local/CI remain fake, paid-disabled, network-denied, and assert call
  counts. Production never falls back from live to fake on failure.

## Acceptance criteria

- [ ] Valid fixture analysis produces one to four grounded distinct candidates
  through the exact API/UI path; no-candidate offers no editing fallback.
- [ ] Every reference resolves to existing words; range/evidence/overlap/rank
  and forbidden-claim rules pass deterministic evaluation.
- [ ] Injection, invented quote/fact, virality promise, duplicate, malformed,
  refusal, timeout, abort, rate/budget, and provider-error cases fail safely.
- [ ] One action produces at most one transcription and one candidate call;
  manual candidate retry with valid transcript increments only candidate count.
- [ ] Refresh/replay/cancel/expiry/clear create no duplicate job/provider call
  and preserve only evidence allowed by the recovery policy.
- [ ] Public errors/logs/storage contain no prohibited content or capability.
- [ ] Any controlled live check records exact call count, usage, cost, cleanup,
  config revision, and blockers without exposing content/account identifiers.

## Focused verification

- [ ] Run adapter shape/normalization/timeout/abort/error/call-count tests.
- [ ] Run candidate reconciliation and full deterministic evaluation matrix.
- [ ] Run API tests for start/replay/poll/cancel/success/no-candidate/failure/
  transcript-reuse/missing-result/expiry/clear.
- [ ] Run frontend progress/recovery/visibility/refresh/candidate integration and
  cleanup tests.
- [ ] Run fake-mode E2E upload-shaped analysis and refresh without network.
- [ ] Run a live short approved fixture only after explicit owner authorization;
  otherwise leave live checks unchecked.
- [ ] Run affected format/lint/typecheck/build, secret/content scans,
  `git diff --check`, and final status inspection.

## Documentation updates

- Update provider setup with current Deepgram/OpenAI project/data/retention,
  exact model/config, credentials-as-blank, and controlled live steps.
- Record candidate prompt/rubric/config revisions and content-free cost evidence.
- Update data-retention/recovery docs if normalized transcript storage is
  approved or rejected.
- Update parent/affected tickets before implementing any model, language,
  provider, retry, or retention change.

## Owner gates and external blockers

- Provider/privacy approval for Deepgram/OpenAI projects, current policies,
  region, normalized transcript retention, and public copy.
- Spend approval for exact hard limits, call count, and controlled live fixture.
- Explicit permission before any credentialed or paid call. Deterministic
  fake-mode implementation/evaluations may complete without it; live evidence
  remains unchecked.

## Commit boundary

Keep transcription, candidate selection, orchestration/recovery, and analysis UI
together as `CL-007: deliver grounded live analysis`. Do not split the same
feature into provider/UI follow-ups or absorb assembly/review/render. No Git,
credential, provider, or cloud mutation is authorized by this packet.

## Precision references

- [Analyze API and result contract](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#119-post-v1analyses)
- [Transcription and candidate providers](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#122-transcription-port)
- [Analysis pipeline stages](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#134-analysis-job-stages)
- [Paid-operation budgets and admission](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#17-paid-operations-timeouts-retries-concurrency-and-spend)
- [Candidate evaluations and API tests](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#207-candidate-selection-evaluations)

## Completion handoff

Report adapters/config revisions, prompt/reconciliation rules, route/job/stage
behavior, recovery/call-count evidence, UI states, changed files, exact checks,
live usage/cost/cleanup if authorized, and every provider/privacy/spend blocker.

</details>

</details>
