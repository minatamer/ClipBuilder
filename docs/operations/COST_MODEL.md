# Google AI and private media-compute cost plan

## CL-010 preview compute envelope — 2026-10-03

Selected assembly now prepares a separate bounded preview after verified deletion
of its Google proxy. This adds **one** private compute operation and temporary
proxy, with zero additional AI plans/images. The complete intended journey uses
three proxy preparations and one later confirmed final render: four media
operations maximum. Metadata reopening, streaming/playback, seek and refresh
use zero processing dispatches; storage reads/egress can still cost money.
Cancellation/expiry removes the owned preview with the original. Default
`RENDERER_MAX_OPERATIONS=0` and fake/off composition remain unchanged.

Synthetic/injected tests work with no keys and no external calls. Real provider
and cloud execution retain independent rights/data/spend approvals and a numeric
owner budget. No costs/usage/prices were queried, and no cloud/image deployment
was performed. Native parity/device gates remain deferred in CL-010.

## CL-009 selected assembly envelope — 2026-10-03

CL-008's selected action now returns focus and extractive cards together: one
proxy preparation, one Google upload/generation/verified delete, zero raster/
image/source-analysis reruns and zero automatic repair/retry. Captions/cards
use local computation with existing packages, without generated-asset storage.
Replay/lost responses stay consumed; known invalid captions fail before media
or AI dispatch. Existing token/deadline limits remain. Source/selected calls
share Files cleanup. Cloud proxy work has a separate spend gate even with fake
AI. No real usage, price or billed cost was queried here.

`FAKE_MODE=true`/no keys uses injected synthetic ports and zero external calls.
Real Gemini requires keys/live flags, rights/data/paid-project approval and a
numeric owner budget; cloud execution requires its own authorization. Review/
export adds zero AI plans. See [CL-009](../tickets/CL-009-build-contextual-visual-assembly.md).

## CL-007 call envelope — 2026-10-03

The local implementation reserves one upload admission and one analysis action
before dispatch. Analysis permits one proxy preparation and one Google generation
with at most 65,536 output tokens; file start/finalize are once each, readiness is
at most 90 GETs, and deletion/404 verification precede success. Explicit cleanup
retry makes zero generation calls. No images/assembly/final render or paid retry
is included. Browser/control deadline is 840 seconds; Google work is 180 seconds
by default. Budgets/counts are process-local and fail on epoch loss/replay.

`FAKE_MODE=true` with no keys uses injected synthetic ports and no charges. No
CL-007 AI/cloud/build cost was incurred or queried. Real keys/live flags and
separate paid-project/data/rights/cloud approvals are required. A numerical
incremental build/cloud/AI allowance is still owner-only; existing CL-006 spend
permission does not authorize a new Gemini call. See the
[reviewable check plan](GROUNDED_ANALYSIS_CHECK.md). Pricing/actual token usage,
interrupted-call charges and maximum-envelope costs remain live checks; advisory
alerts are not hard caps.

Current [cloud migration](../architecture/GEMINI_REMOTION_MIGRATION.md) and [setup guide](CLOUD_RUN_RENDERER_SETUP.md) supersede old provider/browser-only costs. Documentation approval precedes code correction; cloud/test expenditure is separately authorized. Private cloud phase timings are measured in CL-006; no billed cloud charge or live AI cost was verified.

Proposed AI allowance is one full-source analysis plus one selected-range plan, zero image calls and zero automatic paid retries; export uses frozen results and zero AI calls. Cloud proxy preparation and one final Node render incur independent compute cost, even with fake AI. Count actual CPU/RAM active duration/cold start, storage bytes/operations/egress, build/registry/secrets/expiry schedule, Gemini input/output tokens and Remotion license. No accounts/history/general queue is introduced.

The [official Cloud Run pricing table](https://cloud.google.com/run/pricing) currently lists Tier-1 request-based active CPU at USD 0.000024/vCPU-second and memory at USD 0.0000025/GiB-second. The proposed 4-vCPU/8-GiB active shape therefore costs about USD 0.000116 per active second (USD 0.0348 for a hypothetical 300-second interval), excluding requests, cold start, proxy work, Storage/egress/builds/secrets/Scheduler, Google AI and license. This is an illustrative calculation, not measured latency or a quote for an unchosen region. Recheck regional rates and current Gemini pricing at authorization.

Each setup checkpoint needs a concrete small test budget and exact permitted calls/bytes/actions. The dated build-only approval below does not authorize later media or AI tests. Alerts are advisory, not hard spend caps; fail-closed reservations, timeouts/scratch/body limits, single expensive slot and intake kill switch are required. Maximum instances alone is not an atomic quota across rollout/restart. Public paid use stays disabled. Cleanup reduces retention/storage but also needs bounded retry cost.

## Recorded GCloud budgets and build limits — 2026-10-02

The owner reported completing two alerts. The build preflight independently
verified the following configuration; private project/billing/account identifiers
remain outside Git.

| Control | Recorded value | Evidence and scope |
| --- | --- | --- |
| ClipBuilder monthly project budget | USD 10; only the selected project; all services | CLI verified actual-spend alert thresholds at 50%, 90%, 100% |
| Separate ClipBuilder Cloud Run alert | USD 5 intended | Not found in the CLI preflight; remains unconfirmed and was not created or changed by this execution |
| Build region and machine | europe-west1; E2_HIGHCPU_8 | All five submitted Docker builds used this configuration |
| Per-build execution timeout | 1,200 seconds / 20 minutes | First four builds; final corrected build used a reduced 1,111-second submission timeout |
| Approved per-build compute estimate | Approximately USD 0.31 for twenty minutes | Dated authorization estimate; excludes storage, logs and network; no billed charge verified |
| Submitted build count | Five, under explicit owner approvals including necessary retries until the private test passed | Initial failure 112 s; packaging success 104.45 s; rawvideo fixture failure 83.737 s; BMP fixture failure 88.978 s; PNG/render-verified success 156.928 s |

The ScreenPilot comparison used europe-west1 and project-scoped USD 10 / Cloud
Run-specific USD 5 alerts. Its services had minimum zero and maximum one instance;
that comparison is not evidence of a deployed ClipBuilder runtime limit.

Budget alerts send notifications and do not stop spend. The build timeout bounds
execution duration; it is not a global monthly dollar cap. Submitted source archives
use a private build-only staging bucket with an age-one deletion lifecycle;
repository storage can continue until separately authorized cleanup. No media
bucket, Cloud Run renderer, live AI or media-processing allowance was established
by this build checkpoint.

The owner subsequently approved the private renderer/bucket/identities/cleanup
secret/schedule and a **USD 1 test allowance for at most two synthetic media
operations**, with AI disabled. Setup/authentication is verified. The owner later
approved the rights-confirmed 2:45 source for this private test. Operations used
are **four total**: the earlier prepare/cancelled-render pair plus the separately
authorized successful prepare/render pair on the corrected image; zero AI calls.
The owner authorized necessary build retries until the functional test passed.
Previous counts were preserved; each test process retained its two-operation cap.
Partial-upload cancel/replay and expiry checks added no media dispatch. Measured
retest phases were 5158 ms preparation and 25855 ms rendering;
these are small private-source observations, not billed charges or an SLA.
The original USD 1 media allowance remained the test ceiling. Runtime configuration
is 4 CPU/8 GiB, service/revision min-zero/max-one, request concurrency two,
900-second request timeout, 840-second work deadline and two-operation process
cap. Startup CPU boost is disabled. These controls are not a global dollar cap.
The enabled 15-minute cleanup scheduler and retained storage/secret/image
resources can continue charging until cleanup. No billed charge was verified.
Live Gemini and public deployment remain outside these private test approvals.

Exact build evidence is in [CL-006](../tickets/CL-006-build-media-job-and-speaker-feasibility.md#completed-private-cloud-foundation--2026-10-02).
The [setup guide](CLOUD_RUN_RENDERER_SETUP.md) owns private-service configuration
and the completed isolated test checkpoint; later external actions remain gated.

<details><summary>Earlier provider cost models and evidence — historical where superseded</summary>

# Provider cost model and budget controls

## Current Google call budget — 2026-10-02

The [migration contract](../architecture/GEMINI_REMOTION_MIGRATION.md) supersedes old provider costs below: one source analysis plus one selected-range plan, zero image calls and zero automatic paid retries. Track actual Google input/output tokens and phase wall time. Pricing must be checked at live authorization; no observed live cost or latency exists. Export reuses a frozen manifest and makes zero AI calls. Remotion license/operational telemetry is separate from AI cost.

Earlier provider/model records below are historical where superseded.


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

</details>
