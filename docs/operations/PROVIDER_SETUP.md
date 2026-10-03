# Google AI and cloud readiness

Current authority: [cloud migration](../architecture/GEMINI_REMOTION_MIGRATION.md) and [setup guide](CLOUD_RUN_RENDERER_SETUP.md). The owner approved local implementation on 2026-10-02; CL-006 separately records its authorized private resource/test checkpoint. CL-007's renderer revision update and Google AI transfer/paid test need new explicit authorization.

CL-007 implements Gemini 3.8 Flash with pinned `@google/genai@2.25.0`, bounded
REST Files upload, SDK structured generation with retries disabled, normalized
words/anonymous turns/candidates, and explicit file deletion/404 proof. See the
[controlled-check plan](GROUNDED_ANALYSIS_CHECK.md) for actual options, rights/data/
paid-project/spend gates and remaining checks. No live call ran. `FAKE_MODE=true`
needs no keys and uses synthetic injected results. Real word timing, diarization,
model/account access, clock parity and maximum-size quality remain unverified.
No local model or speculative image/ASR fallback is enabled. Keys/identifiers
remain blank in examples; the owner populates ignored configuration manually.

Fake/live describes AI; local/cloud describes compute independently. Fake offline tests use injected storage/renderer/provider ports and zero external calls. A local app can later invoke authenticated remote Cloud Run with fake AI; that still needs cloud credentials and spend approval. Cloud Run runtime identity, gcloud CLI login and local ADC are distinct, detailed in the setup guide. Media renderer has no Gemini key. No AWS or Deepgram/OpenAI setup is currently required.

Confirm Google paid-project data terms/retention, owned media rights/transfer, call/token budget, Remotion SSR licensing/telemetry, exact project ID/region and named identities privately at setup. Do not assume the ClipBuilder display name is the ID. Final render/proxy preparation use our standard Node/Docker Cloud Run service, not phone encoding or the alpha package.

<details><summary>Earlier provider setup, retained as history — do not follow superseded provider instructions</summary>

# Non-GCloud provider setup

## Current Google migration setup — 2026-10-02

The [migration contract](../architecture/GEMINI_REMOTION_MIGRATION.md) supersedes OpenAI/Deepgram setup below. Populate only the blank GEMINI_API_KEY in owner-managed secret storage. Exact model gemini-3.8-flash and time/token/call caps are in .env.example; leave all paid/live/transfer/paid-project gates off until applicable approvals. No image/ASR model is selected. Do not read or copy .env.local for diagnosis. Fake mode needs no keys and proves fixtures only. Live transfer/retention, rights/spend and actual model quality remain unchecked.

Earlier provider/model records below are historical where superseded.


Status: owner guide prepared; account/readiness checks not performed<br>
Official references reviewed: 2026-10-01<br> Initial owner:
[CL-004A](../tickets/CL-004A-prepare-third-party-provider-readiness.md)<br>
Control audit:
[CL-012](../tickets/CL-012-harden-security-privacy-abuse-and-spend.md)<br>
GCloud setup and final live validation:
[CL-015](../tickets/CL-015-deploy-validate-measure-and-rollback.md)

## Read This First

**Browser-owned revision (2026-10-01):** the current technical contract is
[Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md). Original video
and final MP4 remain local; only disclosed bounded audio/text reaches protected
AI routes. No application DB/object store, GCS bucket, cloud media job or durable
provider-result repository. CL-015 remains final hosting setup, not media storage.
Process-local admission cannot promise distributed exactly-once or durable
anonymous quotas; public paid enablement needs explicit justified owner gates.
The committed env schema/example still contain legacy future media settings;
CL-005 migrates them together. Do not populate obsolete bucket/job/native paths.

This is a guide, not evidence that any account, key, billing setting or live
adapter works. Dashboard wording and available controls vary; reopen the linked
official instructions immediately before setup and record the new review date.
If the documented control is absent, stop and record the gap rather than use a
different plan/model or weaker control silently.

The owner must explicitly authorize external setup, funding, verification,
settings changes and credentialed calls. Do not use an agent's access to infer
approval. Never put keys, account/project IDs, payment details, provider request
IDs, dashboard screenshots, private media or raw responses in this document,
Git, chat, logs or command arguments. A private password manager can hold the
account references and credentials. The repo holds only sanitized status.

Fake preview requires no provider account. Keep `FAKE_MODE=true`,
`PAID_DEMO_ENABLED=false` and every `LIVE_*` flag false throughout setup. Keys
alone do not enable real processing; CL-005/007/009 own the adapters and
fail-closed gates. At the preparation date these integrations are planned, not
validated live. No `.env.local` was inspected or modified to write this guide.

## Service Inventory

| Dependency                                 | Purpose                                                                     | Dashboard needed                                           | Integration owner              |
| ------------------------------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------ |
| OpenAI API                                 | Candidate analysis, selected-range visual planning, 0-3 generated stills    | Yes; one isolated demo project can cover all three         | CL-007, CL-009                 |
| Deepgram                                   | Prerecorded audio transcription with word timing/diarization                | Yes; isolated demo project                                 | CL-007                         |
| Cloudflare Turnstile                       | Live action abuse verification                                              | Yes for real widget; no paid upgrade required by this plan | CL-005, CL-012                 |
| Media/vision/card tools and licensed fonts | Local inspection, speaker framing, cards and MP4 rendering                  | No; see [software guide](THIRD_PARTY_SOFTWARE.md)          | CL-006, CL-008, CL-009, CL-011 |
| Google Cloud                               | Proposed hosting, runtime identity, registry and secrets; no content storage/media jobs | Deferred entirely to final CL-015                          | CL-015                         |

No YouTube/TikTok/Instagram/other social API, publishing OAuth, stock service,
generative-video API, voice agent, database, queue or analytics account is
required. The result is a download, not an in-app publisher.

## Setup Sequence and Stop Points

1. Read the inventory, cost worksheet and privacy requirements before creating
   or funding anything. Decide account ownership and use account security/MFA
   where offered; do not share a dashboard password with the app.
2. Recheck exact models, prices, data controls and account access from official
   docs. Record unavailable controls and obtain owner decisions.
3. After separate approval, create/select isolated provider projects; configure
   spending controls before keys can be used. Do not purchase a subscription or
   enable automatic replenishment as an incidental setup step.
4. Create minimal runtime credentials, privately retain them, and manually fill
   matching blank local entries. Keep the example blank and fake/off defaults.
5. Complete owner evidence and the numerical cost worksheet. Dashboard setup
   does not authorize a Playground experiment or a paid smoke test.
6. Integration tickets verify fake request contracts and implemented gates.
   CL-012 audits those controls; CL-014 records repository readiness.
7. CL-015 alone provisions approved hosting and verifies transport/admission/client behavior, then
   runs unpaid probes and the explicitly budgeted live end-to-end flow.

## OpenAI Walkthrough

### Account, Project and Model Access

Open the [API dashboard](https://platform.openai.com/), sign in or follow its
owner-account registration/verification flow, then open Settings. Select the
intended organization, then create/select a dedicated demo project rather than
reusing an unrelated application's project. Keep its identifiers private. Have
the owner review billing separately before adding funds or a payment method.

The committed model selections are `gpt-6-sol` for candidate and visual
planning, and `gpt-image-2.5-flare` for stills. They are proposed product
selections, not proof of this account's access. Check
[GPT-6 Sol](https://developers.openai.com/api/docs/models/gpt-6-sol) and
[GPT Image Flare](https://developers.openai.com/api/docs/models/gpt-image-2.5-flare)
against the selected project and required endpoints. Image access may require
organization verification; follow the
[image guide](https://developers.openai.com/api/docs/guides/image-generation)
only with owner authorization. Do not switch models to bypass denied access.

CL-007 needs the Responses API and schema-constrained candidate output; CL-009
needs schema-constrained visual plans and the approved Image API settings.
Record exact model/snapshot, supported schema/reasoning/quality/size options,
endpoint and config revision before a live check. Only source-supported values
may be used: the current config accepts image quality `low|medium|high`, even
when a provider offers additional choices.

### Limits and Usage

In Settings, select the project, open **Limits**, then **Spend**, and edit the
monthly amount approved in [the worksheet](COST_MODEL.md). Enable **Enforce a
hard limit**, then save; verify the saved state, not just the typed amount.
Review organization limits too, since an organization cap can constrain the
project. Set advance alerts and confirm their recipients privately. Rate limits
are a separate control; use the minimum throughput needed for the bounded demo.

Current official guidance distinguishes alerts from enforced organization/
project hard limits. Hard limits reject affected traffic, but enforcement can
lag and spend can exceed the amount slightly. Account availability must be
confirmed; an alert-only setting is not a cap. Do not test enforcement by
deliberately exhausting credits. See
[spend limits](https://developers.openai.com/api/docs/guides/spend-limits) and
[rate limits](https://developers.openai.com/api/docs/guides/rate-limits).

Open [Usage](https://platform.openai.com/usage), select the intended project and
billing interval, and privately note the baseline. After an authorized check,
compare billed token/image usage and cost with the allowed counts. Save only
aggregate numbers, dates and a sanitized verdict in repository evidence.

### Scoped Key and Data Settings

In project Settings, open API Keys or the applicable service-account key page.
Create a runtime key with only the implemented Responses/image permissions;
exclude organization administration, billing, file upload/storage and other
unused APIs. User/service-account roles must also permit those actions. Review
the [permissions guide](https://developers.openai.com/api/docs/guides/rbac) when
labels or endpoint permissions differ. Never put an admin key in the runtime.
Set expiry where supported and keep the secret in a private store; populate only
the blank `OPENAI_API_KEY` local entry. The runtime does not need admin/usage
keys. See
[key lifecycle guidance](https://developers.openai.com/api/docs/guides/production-best-practices).

Review Settings -> Organization -> Data controls and any project overrides. Do
not opt this demo into content sharing/model improvement. Record the actual
policy for Responses, image generation, caches and any regional endpoint used.
Keep `OPENAI_STORE=false`; disabling response storage does not disable all abuse
monitoring or other endpoint-specific retention. Modified Abuse Monitoring and
Zero Data Retention require eligibility/approval and must not be assumed. If
required controls are unavailable, record the blocker and obtain a privacy
decision before sending content. See
[API data controls](https://developers.openai.com/api/docs/guides/your-data).

## Deepgram Walkthrough

### Project and Credentials

Open the [Deepgram Console](https://console.deepgram.com/), sign in or register
the approved owner account, then use the project selector, and create/select the
isolated demo project. Review its members, billing and security settings with
the owner. No Voice Agent, TTS or Audio Intelligence setup is needed.

Select the project -> **Settings** -> **API Keys** -> **Create a New API Key**.
Choose the narrowest transcription-capable role, a recognizable non-content
label and bounded expiry. Do not grant key/billing/project administration merely
to transcribe. Store the one-time secret privately and enter it only in the
blank `DEEPGRAM_API_KEY` local setting. See
[key creation](https://developers.deepgram.com/docs/create-additional-api-keys).

### Billing, Model and Data

Open the project's Billing area and inspect the actual plan, available credits,
expiry, paid balance, any auto-reload/recharge and spending controls. Keep
automatic reload disabled unless specifically approved. Record whether a real
enforced spend cap is available, what it covers and when it takes effect; this
guide has not verified that capability for the owner's account. Credit balance
or project concurrency is not evidence of an exact monthly monetary ceiling. If
enforcement is uncertain, keep live disabled pending an approved reliable
control. See
[project/billing management](https://developers.deepgram.com/guides/deep-dives/managing-projects)
and [pricing](https://deepgram.com/pricing).

Confirm prerecorded `nova-3`, English, word timing and diarization access and
the approved endpoint/version. Do not use streaming pricing for this workload,
enable extra intelligence/add-ons, or infer speaker identity from diarization.
Review [model options](https://developers.deepgram.com/docs/model) and current
[project rate limits](https://developers.deepgram.com/reference/api-rate-limits).

Review the
[data policy](https://developers.deepgram.com/trust-security/your-data). Model
improvement is enabled by default according to that guidance; opted-out requests
use `mip_opt_out=true`. Region selection and improvement opt-out are separate
requirements. CL-007 must prove its exact request includes the approved opt-out
and uses the approved endpoint; an env key cannot prove either. The current root
example has no opt-out or endpoint variable: do not invent an unknown local
setting. CL-007 owns any needed config/schema/example/test change. Do not
describe all metadata/usage retention as zero, even for opted-out content.

### Usage Review

In Console -> **Usage** -> **Overview**, filter the intended project and time
interval. Under **Logs**, privately confirm the approved request's opt-out
setting and billing features. Retain no raw audio/transcript or request IDs in
repo evidence. Reconcile aggregate duration, requests, cost and zero automatic
retries against [the cost model](COST_MODEL.md). See
[logs and usage](https://developers.deepgram.com/docs/using-logs-usage) and
[opt-out verification](https://developers.deepgram.com/docs/the-deepgram-model-improvement-partnership-program).

## Cloudflare Turnstile Walkthrough

Open the [Cloudflare dashboard](https://dash.cloudflare.com/) -> **Turnstile**
-> **Add widget**, only after setup approval. Give it a content-free label,
approved hostnames and the product-approved widget mode. Create it; privately
retain the site key and secret. Map them to `TURNSTILE_SITE_KEY` and
`TURNSTILE_SECRET_KEY`; map the approved hostname to
`TURNSTILE_EXPECTED_HOSTNAME`. Do not expose the secret or an account API token.
See
[widget creation](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/).

The documented Free plan is sufficient as the planning baseline; Turnstile can
be used independently of Cloudflare hosting/DNS. No domain transfer, paid WAF,
Workers deployment or subscription is part of this setup. Recheck
[plan limits](https://developers.cloudflare.com/turnstile/plans/).

Use separate development and production widgets when real development validation
is approved. Do not permit localhost on the production widget. Final deployed
hostname setup/update belongs to CL-015 when the actual host is known. CL-005
must bind each token to the expected hostname and source-controlled action;
reject missing, invalid, expired, duplicate and mismatched tokens before metered
work. Successful widget rendering alone is not server verification. See
[server verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

Cloudflare publishes dummy key pairs for predictable integration scenarios. They
still use external endpoints; ordinary ClipBuilder unit tests/CI must use the
local fake verifier, not contact Cloudflare. Never treat dummy success as
production readiness or allow dummy credentials in production. See
[testing](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).

## Local Environment Mapping

Use the repository-root `.env.example` as the public variable-name authority;
never overwrite an existing ignored root `.env.local`. The backend entry point
owns local loading; application imports/tests must not load it. Normal shell
overrides can take precedence, so troubleshoot by variable names and safe mode
status, not by dumping env values. See
[backend commands/configuration](../../apps/backend/README.md).

| Setting/group                                                               | Where the owner obtains it                         | Rule                                                       |
| --------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| `OPENAI_API_KEY`                                                            | Selected OpenAI project's scoped runtime key       | Private local store; blank example                         |
| `OPENAI_CLIP_MODEL`, `OPENAI_VISUAL_MODEL`, `OPENAI_IMAGE_MODEL`            | Approved exact model/config record                 | Defaults are proposals, not access evidence                |
| `OPENAI_IMAGE_QUALITY`, `OPENAI_REASONING_EFFORT`, token/time/call bounds   | Source-supported, approved profile                 | Never increase merely to make a check pass                 |
| `OPENAI_STORE`, `OPENAI_SDK_MAX_RETRIES`                                    | Locked policy                                      | `false`, `0`                                               |
| `DEEPGRAM_API_KEY`                                                          | Selected Deepgram project's scoped key             | Private local store; blank example                         |
| `DEEPGRAM_MODEL`, `DEEPGRAM_LANGUAGE`, `DEEPGRAM_DIARIZE`                   | Approved prerecorded profile                       | No automatic model/language substitution                   |
| `DEEPGRAM_TIMEOUT_MS`, `DEEPGRAM_SDK_MAX_RETRIES`                           | Source-supported bound                             | Retry count `0`                                            |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_EXPECTED_HOSTNAME` | Approved widget and host                           | Only site key is explicitly browser-public through config  |
| `PROCESSING_GRANT_ACTIVE_KEY_ID`, `PROCESSING_GRANT_KEYS_JSON`              | CL-005's local cryptographic setup, not a provider | Never reuse an API secret; private store, bounded rotation |
| `FAKE_MODE`, paid master, all live flags                                    | Safe composition                                   | `true`, `false`, all `false` during setup                  |
| `MAX_*`, `RATE_*`, timeouts                                                 | Source/contract ceilings                           | Capacity/call bounds, not a monthly USD ledger             |
| Legacy bucket/sample/job/native-media entries                             | Withdrawn planned schema; CL-005 migration          | Do not populate; no content bucket or media job            |
| Approved hosting/service audience/identity                               | Final CL-015 only                                  | Private hosting configuration; not browser/media storage   |

All credentials, private origins and provider/cloud configuration remain
backend-only. Do not add `NEXT_PUBLIC_*` copies. Never paste secrets into
curl snippets, process arguments, test fixtures or support messages.

## Key Rotation, Revocation and Teardown

1. Disable paid/live work and drain/cancel known operations through their owner;
   do not kill an unrelated process or silently repeat an uncertain call.
2. Create a replacement scoped key with explicit settings-change approval.
   Privately update the ignored local entry; CL-015 owns deployed Secret Manager
   versions/runtime rollout. Preserve every other local env entry.
3. Validate locally with fake contracts first. A credentialed acceptance call
   requires a separate single-call budget/fixture approval; never loop until
   green.
4. Revoke the old key in OpenAI project API Keys, Deepgram Settings -> API Keys,
   or Turnstile widget secret rotation as applicable. Confirm the saved
   dashboard state without making an extra call just to prove revocation.
5. Record only dates, scope and verdict. On suspected exposure, disable live
   work and revoke promptly with owner authorization; do not inspect/log the
   secret to diagnose it. Removing a local value does not revoke a vendor key.
6. On retirement, stop authorization, reconcile pending usage, revoke unused
   provider keys/widgets and disable auto-funding. Account/project deletion is a
   separate explicit action; cloud teardown remains CL-015.

## Verification Ladder

| Level                                 | What is proven                                                                                                   | What is not proven                                              |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Documentation ready                   | Guide, public config mapping, source review and worksheet exist                                                  | Account/settings/keys or adapter access                         |
| Owner account ready                   | Owner confirms project, model access, billing, privacy, scoped key and caps                                      | Runtime credential use or media processing                      |
| Adapter ready                         | Integration ticket passes fake/off request, schema, timeout, retry, cancellation, redaction and call-count tests | Vendor behavior or cloud compatibility                          |
| Explicit bounded local provider check | Only the separately authorized provider request/usage result                                                     | Hosting/client output/public paid readiness                     |
| CL-015 release evidence               | Actual hosting/transport/control/client proof, unpaid checkpoint and authorized live flow reconciled             | Unlimited spend, zero retention or general production readiness |

Do not run an unimplemented diagnostic command, send a test request from a
Playground, or toggle real mode as a substitute for an owning ticket. When a
bounded check is authorized, name fixture rights, exact endpoints/models/calls,
maximum incremental cost, deadline and stop condition in advance. Report only
safe outcome, counts, duration and aggregate usage. Restore paid/live-off state
afterward unless the owner separately authorizes leaving it enabled.

## Troubleshooting Without Leaking Data

| Symptom                          | Safe check                                                                         | Stop condition                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Real preview unavailable         | Owning adapters and gates implemented?                                             | Do not enable paid/live or substitute fake success                   |
| Authentication denied            | Correct private project, active key and expiry?                                    | Never paste secret/raw headers; no repeated paid probe               |
| Permission/model access denied   | Runtime key permissions, user role, model verification/access?                     | Obtain owner decision; do not broaden to admin/switch model silently |
| 429 / quota / balance failure    | Distinguish throughput, hard spend, credits and organization controls in dashboard | No auto-retry, auto-top-up or cap increase                           |
| Deepgram privacy/region mismatch | Exact endpoint and `mip_opt_out` in adapter's fake request proof                   | No content until policy resolved                                     |
| Turnstile rejected               | Expected hostname/action, key environment, token age/duplication?                  | Never log token or bypass verification                               |
| Unexpected cost/call count       | Stop paid/live work; reconcile aggregates with action budget                       | No rerun to hide an uncertain acknowledgement                        |
| Dashboard labels/control missing | Reopen official docs; owner confirms account capability                            | Keep unchecked; record unavailable control                           |

## Owner Readiness Record

All items below are deliberately unchecked. Repeat for each provider; retain
private account references outside the repo. A guide or blank example is not
proof of a real setting.

- [ ] Account/project ownership and security reviewed; exact setup action
      approved.
- [ ] Exact model/endpoint/features and access confirmed; dated config revision
      recorded.
- [ ] Billing/funding decision approved; auto-reload policy confirmed.
- [ ] Numerical cap/alerts/rate limits, enforcement scope/lag and recipients
      confirmed.
- [ ] Privacy, model-improvement, retention, cache and region rules approved.
- [ ] Scoped key/expiry privately stored; committed secret entries remain blank.
- [ ] Local env mapping complete without printing secrets; fake/off defaults
      preserved.
- [ ] Integration ticket's fake-contract, failure and zero-retry evidence
      recorded.
- [ ] Any live check separately authorized and reconciled; paid/live flags
      returned off.
- [ ] Rotation/revocation/shutdown owner and procedure reviewed.
- [ ] CL-012 audit current; cloud/deployed host/live flow still assigned to
      CL-015.

Sanitized record fields: service role, guide review date, owner confirmation
date, model/config revision, numerical controls, enforcement class, test
ticket/verdict, remaining blocker and next owning ticket. Never include keys,
IDs or real content.

</details>
