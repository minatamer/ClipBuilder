# Provider cost model and budget controls

Status: planning worksheet; numerical spending approval pending<br> Official
pricing/control references reviewed: 2026-10-01<br> Setup owner:
[CL-004A](../tickets/CL-004A-prepare-third-party-provider-readiness.md)<br>
Implementation audit: CL-012; GCloud pricing/provisioning and live release
evidence: CL-015

## What This Document Does Not Approve

No amount below authorizes funding, a purchase, a paid call or public
enablement. Dashboard setup is not runtime verification. No credentials or
private account identifiers belong here. Do not run a provider request to obtain
an estimate without explicit call/fixture/budget approval. Fake preview and
ordinary CI consume zero provider calls.

Use [PROVIDER_SETUP.md](PROVIDER_SETUP.md) for dashboard navigation and key/data
setup; use the source of truth's
[paid-operation policy](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#17-paid-operations-timeouts-retries-concurrency-and-spend)
for runtime authority. This document calculates and records costs; it does not
add an unimplemented dollar counter, database, queue or new env variable.

## Exact Action Budgets

**Current architecture (2026-10-01):** [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md)
replaces cloud media compute/storage with local import/audio/vision/encode.
The provider call ceilings below remain; local rendering has zero AI calls.
Refresh reuses committed browser results only. A lost/in-flight paid payload or
backend restart is uncertain/fail-closed, not guaranteed free result recovery.
Process-local action records do not enforce global monthly/per-person limits
across fresh sessions, replicas or restarts. Public paid traffic remains off
until explicit owner safeguards/hard-cap evidence; alerts are insufficient.

| Action                                         |                Deepgram |                                 OpenAI text | OpenAI images | Local/cloud work                              |
| ---------------------------------------------- | ----------------------: | ------------------------------------------: | ------------: | --------------------------------------------- |
| Fake development journey                       |                       0 |                                           0 |             0 | Local simulation only                         |
| Rejected intake/admission                      |                       0 |                                           0 |             0 | No metered provider start                     |
| One source analysis                            | At most 1 transcription |                    At most 1 candidate call |             0 | Local audio extraction; protected requests     |
| Candidate retry with valid retained transcript |                       0 | At most 1 separately allowed candidate call |             0 | Never retranscribe implicitly                 |
| One selected-range assembly                    |                       0 |                  At most 1 visual-plan call |           0-3 | One speaker pass; deterministic cards locally |
| Preview/refresh of committed local success     |                   0 new |                                       0 new |         0 new | Reuses validated local artifacts; lost paid response is not recoverable automatically |
| One confirmed final render                     |                       0 |                                           0 |             0 | Local encode/mux; one final artifact, explicit same-manifest failure retry policy |
| Download/clear                                 |                       0 |                                           0 |             0 | Delivery/delete operations; no new AI work    |

Automatic paid SDK retries are zero. User-authorized retry is a new explicit
allowance, not free recovery. Cancellation after provider dispatch may still be
billable; a timeout/uncertain acknowledgement never permits blind resubmission.
Do not consume the maximum image count if deterministic cards/no visual suffice.

Public bounds remain 20 minutes AND 500 MiB source, one 10-60 second clip, at
most 3 visual cues/images and one final render. Per-action caps are not a global
monthly money limit. Content-free local counters/capacity markers are not a
durable per-person or cross-instance monthly accounting service.

## Dated Price Inputs

Reopen official pricing before every owner budget approval and before CL-015.
Record endpoint, billing plan, model/snapshot, currency, geography,
quality/size, context tier and any tax/FX assumptions. Ignore promotions/free
credits when estimating sustainable exposure; they may expire or not apply to
this account.

| Input                       | Public planning baseline reviewed 2026-10-01                                                  | Source / caveat                                                                                                                    |
| --------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| GPT-6 Sol text              | Standard short-context: USD 2 / million input tokens and USD 10 / million output tokens       | [OpenAI pricing](https://developers.openai.com/api/docs/pricing); verify context/tier/region rates, billable reasoning and caching |
| GPT Image 2.5 Flare         | Text input USD 5 / million tokens; image input USD 8 / million; image output USD 30 / million | [Model pricing](https://developers.openai.com/api/docs/models/gpt-image-2.5-flare); output token count depends on size/quality     |
| Deepgram Nova-3 monolingual | Prerecorded Pay As You Go: USD 0.0043 / minute                                                | [Deepgram pricing](https://deepgram.com/pricing); recheck actual plan and add-ons; not streaming pricing                           |
| Turnstile                   | Free-plan planning baseline                                                                   | [Cloudflare plans](https://developers.cloudflare.com/turnstile/plans/); no paid upgrade approved                                   |
| Media/vision/cards          | No provider call for local processing                                                         | Binary/model/font licenses and hardware costs still matter                                                                         |
| Hosting                     | Not priced/approved in this readiness packet                                                  | CL-015 records API/static/model delivery, registry/secrets/network/build costs; no media bucket or render job |

No cached-input discount is assumed. Direct Images API cache behavior differs
from Responses-tool behavior. Use the
[image cost guide](https://developers.openai.com/api/docs/guides/image-generation)
to obtain a size/quality output-token estimate, add prompt/input costs, then
measure the authorized result's aggregate usage. Do not treat a flat guessed
price per image as a ceiling or invoke a reasoning-model image tool that changes
the approved call/cost boundary silently.

## Calculation Method

Let `A` be source minutes, `D` the approved transcription rate per minute,
`Tc_in/Tc_out` candidate billable tokens, `Tv_in/Tv_out` visual-plan billable
tokens, `Pt_in/Pt_out` the applicable text rates per million, and `I` the
conservative cost of one approved generated image including all input/output.

```text
transcription = A * D + approved_add_on_cost
candidate = (Tc_in * Pt_in + Tc_out * Pt_out) / 1_000_000
visual_plan = (Tv_in * Pt_in + Tv_out * Pt_out) / 1_000_000
assembly_provider_cost = visual_plan + image_count * I
one_flow_provider_cost = transcription + candidate + assembly_provider_cost
validation_provider_budget = approved_flow_count * one_flow_provider_cost
                           + explicitly_allowed_extra_calls
                           + owner_approved_uncertainty_reserve
```

`Tc_in` includes the entire submitted context, schema/instructions and
transcript, not just audio duration. `Tv_in` includes the selected grounded
context. Count billable reasoning/output per the model's rules; do not assume
all billed output is visible text. Candidate/visual output config ceilings are
currently 3,000/ 1,800 tokens, but adapters must prove the effective limits.
Missing input-token or image-size/quality bounds mean there is no defensible
maximum yet.

Illustrative arithmetic only: a 10-minute monolingual source costs USD 0.043 at
the dated transcription baseline. With 10,000/3,000 candidate input/output
tokens and 5,000/1,800 visual-plan tokens at the text baseline, those calls cost
USD 0.050 and USD 0.028. Total before images is USD 0.121; with three approved
images it is `0.121 + 3 * I`. This excludes cloud, taxes, FX, different context/
region tiers and unexpected usage; it is not a tested clip price or budget cap.

Prepare both typical and worst-allowed profiles: the public 20-minute source,
largest schema-bounded transcript/context, output limits and three largest
approved images. Do not use a 60-minute source or repeated rendering to test the
bound. Budget for two owner-controlled validations only if the owner explicitly
approves both; a second run is never implied by this worksheet.

## Numerical Owner Worksheet

Replace `Pending` only with an approved nonsecret number/decision and date.
Store private account references elsewhere. Currency and billing-cycle timezone
must be explicit. All rows must be resolved before the corresponding live work.

| Decision                                                                     | Approved value     | Evidence / owner date                         |
| ---------------------------------------------------------------------------- | ------------------ | --------------------------------------------- |
| Currency, cycle/reset timezone and pricing review date                       | Pending            | Pending                                       |
| OpenAI project monthly enforced limit (text + images combined)               | Pending            | Pending                                       |
| OpenAI organization control and impact on unrelated projects                 | Pending            | Pending                                       |
| OpenAI early alert / stop-review alert amounts                               | Pending            | Pending                                       |
| Deepgram monthly control amount, enforcement class and scope                 | Pending            | Pending                                       |
| Deepgram alerts, funding ceiling, balance expiry, auto-reload decision       | Pending            | Pending                                       |
| Combined non-GCloud monthly ceiling and contingency reserve                  | Pending            | Pending                                       |
| Candidate/visual input/output bounds and maximum billed tokens               | Pending            | Pending                                       |
| Image dimensions/quality/output-token estimate and per-image bound           | Pending            | Pending                                       |
| Exact validation fixture duration and authorized call/flow counts            | Pending            | Pending                                       |
| Maximum incremental validation cost and variance stop threshold              | Pending            | Pending                                       |
| Provider throughput limits and app concurrent analyze/assemble/render limits | Pending            | Pending                                       |
| Usage-review frequency, alert recipient confirmation and shutdown owner      | Pending            | Pending                                       |
| CL-015 cloud costs, numeric alert budget and deployment resource caps        | Deferred to CL-015 | Not a prerequisite for local/fake development |

Choose the lowest enforceable amounts that cover only the explicitly authorized
short validation plan plus reserve. An early/stop-review alert at 50%/80% of the
approved cap is a proposal, not an approval or enforced stop. Confirm vendor
minimums, actual saved controls, propagation/overshoot risk and how the owner
will respond before selecting values. Do not auto-fund to satisfy a suggested
cap.

## Enforcement Versus Notification

| Control                                                 | Classification                                          | Required evidence                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| OpenAI project/organization hard spend switch           | Vendor enforcement, with possible propagation overshoot | Actual saved account control, scope and dated [official behavior](https://developers.openai.com/api/docs/guides/spend-limits) |
| Provider budget alert/email                             | Notification only                                       | Threshold, recipient confirmation and response owner                                                                          |
| Deepgram account monetary control                       | Unverified until owner confirms                         | Current plan/control behavior; balance alone is not a verified cap                                                            |
| Rate/concurrency limit                                  | Throughput bound, not USD cap                           | Provider project setting and matching application test                                                                        |
| Process-local reservations/idempotency, zero retries   | Process-lifetime action enforcement, not global quota   | Rejection/replay/uncertain-ack/restart tests; tombstones retained through grant expiry |
| Paid master/per-feature flags                           | Blocks new dispatch when actually implemented           | CL-012 tests and CL-015 operational proof; not cancellation of already billed work                                            |
| Cloud budget alerts                                     | Advisory notification                                   | Final CL-015 numeric budget/recipients, not an automatic cap                                                                  |
| Hosting instance/time/resource caps                     | Exposure bounds, not global atomicity across rollouts    | Final CL-015 saved config and actual restart/overlap/client/transport checks |

If a vendor offers only alerts, do not label them hard limits. Keep its live
feature disabled until a reliable enforced control or an explicitly approved
alternative is documented in the source of truth. Do not introduce a durable
spend ledger/database here to paper over missing vendor enforcement.

## Authorized Validation Record

Before one live check, obtain a specific human instruction approving provider,
model/endpoint, rights-approved synthetic/purpose-recorded fixture, allowed
calls, maximum added cost, timeout and stop conditions. A local provider-only
check may be authorized in CL-007/009 after adapter gates; it proves no cloud
behavior. The complete deployed local-source-to-download flow belongs only to final
CL-015.

- [ ] Current pricing, account access, privacy/retention and rights are
      approved.
- [ ] Numeric worksheet and actual account caps/alerts are confirmed.
- [ ] Required adapters and failure/call-count tests exist; SDK retries are
      zero.
- [ ] The owner explicitly authorizes the exact bounded check, not general live
      use.
- [ ] Safe baseline usage/cost and remaining headroom are recorded privately.
- [ ] Run once; stop on unexpected call, uncertain acknowledgement, retention
      mismatch, limit denial or variance. Do not rerun or increase caps
      automatically.
- [ ] Record aggregate counts/duration/billable usage, estimated versus billed
      cost and delayed-reporting uncertainty; reconcile later without another
      call.
- [ ] Complete local artifact/request cleanup under the owning ticket and restore live/off
      state unless a separate instruction authorizes otherwise.

## Budget Incident and Retirement

On unexpected spend: stop new paid dispatch, cancel known work where supported,
notify the owner with aggregate evidence, inspect saved limits/usage privately,
and obtain approval for revocation or account changes. Do not log provider raw
errors/IDs/content, auto-recharge, retry, switch projects or rotate into a new
unlimited key. Revocation is containment, not a refund or deletion guarantee.

When retiring the demo, disable live gates, reconcile delayed charges, revoke
unused keys, turn off approved recurring funding and remove unused external
resources only with authorization. Hosting services/registry/secrets and
their residual cost/lifecycle remain final CL-015 operations ownership.
