# CL-007 controlled analysis check

Status: **Gemini account/key/spend setup reported complete on 2026-10-04;
one existing private renderer image build/revision update and local setup are
authorized; rollout is in progress and live analysis is unperformed**. The owner reserved all paid-flow
testing for their own manual actions. Agents may run fake-mode automated checks;
they must not trigger the paid analysis described below.
The local fake browser workflow passed without keys/external calls; continuing
dependency-ready local tickets is authorized. This checkpoint
authorizes no new resources, public release, assembly, images or
final export. `FAKE_MODE=true` with no keys supplies synthetic fixture and
injected zero-network results; CL-006 separately proved real media processing
with fake AI. Genuine understanding requires Gemini; no local AI model is used.

## Owner-reported Gemini setup — 2026-10-04

- [x] Owner created a Gemini API key for the existing project and manually
  populated `GEMINI_API_KEY` in ignored `apps/backend/.env.local`.
- [x] Owner completed a USD 5 Gemini API prepayment.
- [x] Owner reported saving a USD 5 monthly project spending cap after following
  the Spend → Monthly spend cap → Edit spend cap instructions.
- [ ] Independently verify key/model access and paid-project readiness in the
  separately authorized live checkpoint; no credentialed request was made.
- [x] Owner reports manually saving the Turnstile sitekey and secret in the
  backend's ignored `.env.local`.
- [x] Owner confirms the widget dashboard allows `localhost`; the backend's
  ignored runtime metadata now records that expected hostname.
- [ ] Verify genuine Turnstile validation during the owner's manual test.
- [x] Normal local startup validates the configured grant key format, without
  inspecting or printing the secret. `PROCESSING_GRANT_KEY` accepts the key
  directly; `v1` stays in code and the old entry remains readable for migration.
  Random generation and private storage remain owner-managed.
- [x] Owner authorizes one existing renderer image build and private revision
  update, plus local processing setup for their own manual tests.
- [ ] Owner confirms source rights and Google audiovisual transfer in the
  application before manually dispatching analysis.

Automatic reload was disabled in the owner's prepayment view and the setup
instructions keep it off; no final dashboard inspection or account usage polling
was performed. Google documents an approximately ten-minute enforcement delay,
so neither the monthly cap nor the prepaid balance is an exact dollar cutoff.
Gemini credits do not pay storage/build/Cloud Run charges. Funding and a monthly
cap are not a test-spend or media-transfer authorization.

The [current provider guide](PROVIDER_SETUP.md#current-gemini-setup--2026-10-04)
records the key/billing/limit steps and next local Turnstile setup. Private keys
and `.env.local` contents were not read, copied or logged; account identifiers
were not recorded. No
application restart, renderer rollout, provider call or live-quality verification
was performed in this setup/documentation pass. Keep paid processing disabled
while completing prerequisites; existing fake results remain synthetic only.

## Local restart preflight — 2026-10-04

The owner requested a full local restart and reports selecting `FAKE_MODE=false`
and `PAID_DEMO_ENABLED=true`. Those switches select real mode and permit paid
capabilities, but do not supply the approved runtime validation stage. Normal
backend startup reported `configuration_validation_stage_missing` and never
opened port 4000. This is startup evidence, not inspection of a private file.

The old frontend supervisor 12240 and backend supervisor 7904 were verified
against creation times, repository/service commands, descendants and listeners.
Shutdown removed all 10 frontend and nine backend identities and released ports
3000/4000 through stabilization. The replacement backend supervisor 23504 failed
readiness; its nine owned identities were then removed, with zero survivors and
zero listeners through stabilization. The frontend replacement was not launched
because its backend prerequisite failed. Both local apps are stopped.

The ignored supervisor records only a fixed category for this startup error.
Content-safe logs remain under
`artifacts/local-run/protected-sample-20261004/backend.stdout.log` and
`backend.stderr.log`; no raw startup/configuration values were logged. No private
environment/runtime file was read or changed, and no provider request, cloud
update, sample transfer or paid dispatch occurred. The `PROCESSING_GRANT_KEY` secret, expected
Turnstile hostname and genuine provider readiness remain owner/live checks.

The existing Gemini system policy was inspected without changing it. It already
requires source-clock word timing, anonymous turns, quoted evidence and zero to
four complete 10–60-second moments, rejects source instructions and invention,
and forbids tools/search. A first authorized analysis provides the baseline for
any later owner-directed prompt revision. Fake mode remains key-free and
synthetic; real understanding requires the configured Gemini provider, not a
local model.

## Successful local startup follow-up — 2026-10-04

The subsequent local configuration correction supersedes the stopped-app state
in the historical preflight above. Health, `/start` and `/api/sample/config`
return 200 after verified shutdown and normal startup. The fixed requirement
codes report Google transfer approval, paid-project confirmation, Turnstile
hostname and renderer connection as remaining processing prerequisites, with
no missing/invalid grant-key code. Paid routes remain unavailable and dispatches
remain zero. This diagnosis comes from content-safe startup categories, not
reading ignored configuration. No provider, storage or processing request was
made; the apps remain running. All five fake-only root gates pass, including
721 synthetic tests. These checks prove no genuine AI or widget quality.

## Proposed bounded execution

This is an owner-only manual paid-check plan. The agent may prepare and verify
fake-mode code, and separately authorized private renderer build/revision work,
but does not dispatch the media admission, Google upload or Gemini generation.
The prior combined agent-run update/paid-test proposal is withdrawn. On
2026-10-04 the owner authorized the existing private renderer update and rejected
the assistant-added requirement to repeatedly choose a dollar ceiling.
The initial Cloud Build failed its synthetic output proof before publishing or
changing the service. Local native reproduction identified stale validator calls,
the default full-range color format and an unsupported raw-audio muxer. These
were corrected and a synthetic render/decode/cancel proof passed. One corrected
build retry completes the already-authorized update; each build retains its
1,200-second timeout, with one private revision update and the existing resource
and operation caps. No numerical
cloud ceiling is claimed. Gemini funding remains separate from cloud charges;
the agent must not trigger paid media tests.

1. Owner confirms one English, owned/licensed 15-second–20-minute source within
   500 MiB, consent to **Google AI** audiovisual transfer and paid-project data terms
   before their manual analysis dispatch. Earlier private
   renderer rights approval does not authorize this new AI transfer. Keep media,
   filenames, identifiers and keys out of the evidence record.
2. After explicit authorization, use existing CL-006 resources/workflow for
   **one corrected image and one private revision update**. Preserve IAM, storage,
   expiry schedule, resource ceilings and licensing. No resource creation or
   public deployment. The old image lacks the new proxy read/release routes and
   inspection profile; analysis rejects it before Gemini. Record image digest
   and content-free health/authentication checks.
3. Owner fills the blank credential entries from `apps/backend/.env.example`
   in that app's ignored `.env.local`: Gemini key, `PROCESSING_GRANT_KEY` secret and
   Turnstile site/secret. Ignored `runtime.local.json` supplies the private renderer
   origin, Turnstile hostname and independent cloud/transfer/paid-project approval
   records. Only after authorization, select `paidValidationStage=analysis`,
   `FAKE_MODE=false` and `PAID_DEMO_ENABLED=true`. Composition fixes the dispatch
   allowance at **2**, with assembly/render/image capabilities disabled. Never
   inspect/print private values. Follow AGENTS.md for verified local startup.
4. One browser confirmation permits **one upload admission**, **one private proxy
   preparation**, **one Google Files upload** (start/finalize each once), at most
   **90** readiness GETs at one-second intervals, and **one `gemini-3.8-flash`
   generateContent call** with at most 65,536 output tokens and a 24-MiB proxy.
   No generation retry/tools/search/raster calls or final render. Two single-use
   Turnstile checks bind hostname/action/session. Browser/control work is bounded
   at 840 seconds; Google work at the configured 180 seconds.
   For the fixed retained sample, the upload admission instead fingerprints the
   generation-pinned master and transfers bounded chunks server-to-storage into
   one disposable processing copy. The browser does not download and reupload
   it; the same inspection, proxy, Google and two-action limits apply. The
   retained master never enters the processing cleanup binding.
5. Compare normalized transcript/anonymous turns/timing with the source; inspect
   complete 10–60s boundaries and honest zero-to-four candidates. Refresh committed
   success and verify **zero new upload/preparation/AI calls**. Review read-only
   playback/transcript/notes at phone/tablet/laptop/short heights, keyboard/zoom/
   reduced motion. No editor or manual range path.
6. Delete the Google file and verify GET 404; release the exact analysis proxy
   before publication. Clear and verify source-generation absence. Failed Google
   deletion blocks intake and retains a process-local obligation; explicit Clear
   can retry deletion without AI. The owner plans two manual input-path tests:
   retained sample and upload of the same source. Each requires its own browser
   confirmation; neither authorizes agent dispatch or automatic retries.

## Evidence and limits

Record only model/config revision, image digest, counts, bytes, phase durations,
tokens when available, authorized operation limits, safe rule codes and
verified deletion. No account usage polling or content/capability/key logging.
Alerts are advisory; interrupted calls can incur usage.

The original remains private after analysis for later selected-range work;
Clear/failure/expiry delete it. Results/receipts are journaled only in the browser.
Refresh of in-flight/lost work fails without redispatch. Control restart invalidates
grants/receipts and relies on independent cloud expiry. Google cleanup obligations
are process-local; crash/uncertain upload can need the documented 48-hour Files
expiry fallback. Explicit file deletion does not prove deletion of separate abuse
records. These are remaining release limitations, not outage guarantees.

Unchecked: maximum-envelope stress, live speaking-face quality, CL-008–011
assembly/preview/export, phone support, sample/public rights, complete font/codec/
telemetry notices, distributed paid controls and public deployment.

References: [Files](https://ai.google.dev/gemini-api/docs/files),
[structured output](https://ai.google.dev/gemini-api/docs/structured-output),
[paid-service terms](https://ai.google.dev/gemini-api/terms),
[Turnstile configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/),
[private renderer setup](CLOUD_RUN_RENDERER_SETUP.md).
