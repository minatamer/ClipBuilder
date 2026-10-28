# Shared upload/editor release preparation

## CL-114 usage accounting prerequisite — 2026-10-28

Hosted visitors share three manual/AI slots, three cumulative prepared clips and
one source. A two-hour reservation blocks concurrent/new sessions; first valid
export generation consumes a rolling 24-hour network allowance, independently
of downloads. Same-session retry/edit/export stays usable. Failed/abandoned
reservations expire; actual dispatch charges never refund. Localhost is unchanged.

The backend-only `HOSTED_DEMO_OWNER_IPS` environment value starts blank (CL-115).
Set comma-separated exact public IPv4/IPv6 addresses in ignored backend
`.env.local` for local configuration, or inject the same private environment key
on the hosted backend. Restart after changing it; do not put addresses in source,
frontend environment, build arguments or public configuration. At most 32 exact
addresses are allowed; blank means no exemptions. Mapped IPv4 normalizes; visitor IPv6
accounting groups /64 privacy addresses. Exempt owners keep the existing ten-clip
safety bound and can clear/start another session. Security/global caps remain.

Global UTC-day ceilings: 20 session admissions, 100 provider dispatches and
200 native jobs, including provider-internal media preparation and owner use.
Hosted retains the existing 32-call session/process editor budget rather than
the old seven-call walkthrough allowance. These work bounds are not dollar
limits or protection against all infrastructure DoS; retain billing safeguards.
An IP is not a person: NAT shares allowances; VPN/address changes evade IP
friction. Global accounting still bounds work across IPs/instances/restarts.

Owner release prerequisites — not performed/authorized by local implementation:

- [ ] Provision a dedicated private Cloud Storage bucket with the fixed
      `demo-usage-v1.json` object. Narrow exception to historical no-cloud-object
      policy for metadata only: no media/accounts/durable projects. Pre-create
      once with `{"version":1,"day":0,"sessions":0,"provider":0,"native":0,"leases":[]}`.
      Never reset/delete it during releases or media cleanup. Review object
      version/soft-delete retention; expired active records leave on next write.
- [ ] Grant only backend runtime object read/conditional-overwrite access in that
      bucket. Keep frontend/browser unprivileged; no credential files/browser
      keys. Populate backend `HOSTED_DEMO_LEDGER_BUCKET` manually. The existing
      private `PROCESSING_GRANT_KEY` supplies domain-separated network HMACs;
      preserve it across releases. Rotation must retain prior allowance coverage.
- [ ] Verify the actual frontend ingress suffix is Google's documented
      `[untrusted supplied prefix,] client-ip, load-balancer-ip`, with no direct
      bypass/extra unaccounted proxies. Only then set `HOSTED_DEMO_IP_VERIFIED=true`
      on frontend/backend. Never enable for an unverified Cloud Run/custom-domain
      topology. The bridge replaces browser identity headers and selects only
      the verified suffix over the authenticated private API. Missing IP fails closed.
- [ ] Verify real hosted concurrency, cross-revision accounting, conditional
      conflicts, IAM failure, ingress spoofing, exhausted entry and owner bypass.
      Provider calls retain separate owner approval; local tests cannot certify
      deployment wiring. Re-audit after topology changes.

The adapter reads a bounded pre-existing object pinned to its generation and
writes only with `ifGenerationMatch`. Accounting conflicts retry at most four
times; provider work never retries automatically. Missing/corrupt/offline/busy
accounting fails closed with no memory/filesystem fallback. Only digests, lease
IDs and counters persist; no raw IP/media/filename/credential enters the ledger.
Hosted Privacy discloses separate temporary coded network accounting.

Owner decision, 2026-10-24 (CL-061): one normal app. Upload â†’ manual/AI moments â†’
clip preparation â†’ caption/picture/filter editor â†’ Apply/Discard â†’ export/download.
YouTube acquisition, local library/drafts/sample and the CL-078 fake-caption
action / paid-switch exception are local-only. This is prepared source code; it
does not change the currently deployed revision. Agents must never deploy for
the owner or run credit-consuming tests without new explicit approval.

## Next-build feature visibility â€” source audit, 2026-10-25

This describes the current source with normal production paid/auth configuration.
It is not a new deployment or a fresh inspection of the deployed revision/cloud
settings. The owner will manually test these changes before choosing deployment.

| Feature | Hosted next build | Local-only distinction |
| --- | --- | --- |
| MP4 upload and responsive drop area; manual/AI moments; clip selection | Visible | Hosted upload uses bounded chunks; the large raw local-file Proxy fix does not add hosted YouTube acquisition. |
| Captions Style / Position / Text, word corrections with fixed timestamps | Visible | No timestamp editing or word insertion/deletion UI was added. |
| Generate captions when a clip has none | Visible with normal paid/provider readiness and explicit consent | Only local mode can use the confirmed caption-only exception while fake mode / paid master are off. No new environment keys. |
| Filters, real AI contextual pictures, manual pictures, timing Capture, motion and positioning | Visible | Uploaded PNG/WebP alpha is preserved in preview, drafts where supported, and native video composition; existing flattened copies require re-upload. |
| Automatic portrait framing and Focus Camera / People editor | Visible | Every position has independent settings/times; person selection, numbering, removal and capture are shared UI. Fake people/tracks are test fixtures only. |
| Vertical MP4 exports using original-source crop/detail and source frame rate | Visible | Hosted capacity must be verified for the larger high-resolution output; no silent quality downgrade is introduced. |
| Start over, Add more clips, Apply/Discard, export/download | Visible | Hosted Start over discards temporary session media; local saved sources/drafts/exports remain outside that cleanup. Removed mode/status badges stay removed. |
| Completed transcription reuse for the same source/revision | Shared within the session | Hosted has no durable or cross-user transcript/library cache. |
| YouTube URL/resolution input and saved-download reuse | Hidden; routes rejected | Local only. Hosted users upload MP4s. |
| Use demo sample, saved draft JSON import and Downloads library/reopen | Hidden; routes rejected | Owner-local filesystem features; hosted sessions expire and do not create durable projects. |
| Generate fake captions and automatic fake-content policy | Fake CTA hidden; no fake runtime | Local CTA is key-free. New fake clips default to no captions; automatic fake Earth art is retired. |
| Local paid-switch bypass, owner agent/capture tooling and retained private media | Hidden/unavailable | The caption exception requires APP_ENV=local; hosted keeps ordinary paid gates, authentication/CSRF, session isolation and budgets. |

Evidence: shared `/start` routing in `apps/frontend/src/app/start/page.tsx`,
hosted UI conditions in `experience.tsx` and `clip-batch-panel.tsx`, hosted path
allowlist/capabilities/provider charging, and `composeLocalCaptionProvider`'s
local/non-test guard. CL-067â€“079 own the feature/proof details. Current checks
include 564 fake/paid-off local unit tests and actual Windows synthetic browser/
native exports; they do not establish live Gemini quality or hosted capacity.

Before any deployment decision, finish owner manual acceptance, rebuild/re-run
the Linux packaged image proofs with these new features (CL-063 predates them),
and verify the deferred allocation/cost/capacity items below. Keep FFmpeg as-is
per owner decision. No push, cloud mutation, deployment or paid test is authorized
by this audit or by the local commit approval.

## Deferred deployment checklist â€” 2026-10-25

CL-084 follow-up, 2026-10-26: the owner explicitly keeps G Cloud inaccessible to
the agent. No live configuration/billing was inspected and no cloud changes are
authorized. Source now separates preview preparation from final export: real AI
preparation remains; finished MP4s are created only on explicit Export. Linux
image/current-feature and owner real-mode acceptance remain release gates.

Resource proposal for owner review only: retain min zero/max one; benchmark a
**4 vCPU / 8 GiB** demo profile before considering any change from the proposed
4 vCPU / 16 GiB profile. This would require a smaller temporary-media allowance
(candidate at most 5 GiB, leaving processing headroom) and explicit capacity
behavior, not a silent RAM-only reduction. Existing 12 GiB scratch cannot fit
inside 8 GiB RAM. Current-quality 4K/60fps, source/batch/export-history maxima and
Chromium/FFmpeg peak RSS must pass a current Linux proof before proposing exact
limits for approval. No such capacity proof or smaller allocation is claimed.
A later 2 vCPU / 8 GiB comparison is optional only if deadlines still pass;
slower rendering may erase CPU savings. Keep output quality unchanged.

First measure allocation/billable lifetime versus native work, AI waiting and
idle editor time. The editor currently polls about once per second even when
stable; reducing hosted idle/background polling is a separate local-code
candidate, not implemented by CL-084. Always-allocated CPU is currently needed
for background work; request-only billing is not a safe settings-only change.
A separate processing service/temporary-media handoff is deferred unless real
measurements justify the added demo complexity. Render-count reductions do not
establish billed CPU/GiB or dollar savings. See CL-084's explicit acceptance gate.

The owner is not deploying now. Revisit these items with the owner before a
future deployment decision; this note authorizes no cloud changes or deployment.

- [ ] Prepare the shared editor backend allocation: **4 CPUs, 16 GiB RAM and
      always-allocated CPU**, retaining **minimum zero / maximum one instance**.
      The read-only inspection found the older backend at one CPU, 512 MiB and
      request-only CPU allocation. The larger profile remains unapplied and its
      maximum workload capacity remains unverified.
- [ ] Review the increased running cost and verify the existing **USD 5 Cloud Run
      cap in Console**. CLI budget inspection was blocked by the disabled Billing
      Budgets API; that does not establish that the cap is missing. Enabling that
      API is not required for the Console check and is not authorized here.
- [ ] Include CL-070 source-quality output in the maximum workload check:
      native portrait can remain 2160x3840 at up to 60 fps, with denser lossless
      overlay capture. Existing byte/disk/duration limits still apply; exports
      fail at capacity instead of silently lowering resolution. Local synthetic
      proofs do not establish the proposed hosted allocation's maximum capacity.

Preserve the inspected frontend settings, IAM, runtime identities, secret
bindings and origins; no configuration change to those is currently needed.
The custom domain has valid TLS, but its cutover is optional: the managed Cloud
Run origin remains the working application origin. The owner also chose to
leave FFmpeg unchanged; no remediation or public-release risk acceptance is
claimed by that choice. The remaining release verification gates below still
apply. Fake/no-key local proofs do not establish hosted capacity or real Gemini
quality; hosted compute tests and real-provider checks retain separate approvals.

## Composition and boundaries

- One Next frontend and Express backend. The same React editor, domain use cases,
  contracts and renderer-owned fixed media composition serve both environments.
  An internal native worker is an implementation detail, not another app.
- Local mode retains the current normal startup, downloads/drafts and YouTube
  tooling. Hosted mode contains only an upload card; direct acquisition, saved
  YouTube, metadata/import, local-library and agent requests are rejected before
  native/provider work. Historical `/api/local` naming is a compatibility URL for
  the shared frontend bridge, not a second UI or a local-only editor gate.
- Hosted requests use `/v1/editing` through verified frontend identity. Exact
  browser Host/TLS/origin checks, SameSite/HttpOnly/Secure session cookies, CSRF
  forwarding and Turnstile session-start proof precede work. Temporary session
  state is confined to that backend boot/instance; no owner capability or library
  is exposed. The old hosted analysis/admission flow is not a parallel bypass.
- The original is uploaded in ordered 8 MiB chunks to a fixed temporary server
  file; no browser filename or path is trusted. Native inspection precedes AI.
  Gemini receives bounded proxies and brief descriptions for generated pictures.
  Media stays on the backend instance's ephemeral scratch, not durable projects
  or a shared public filesystem. Exit/expiry/shutdown clean it up. Restart loses
  the temporary session; downloaded files remain with the visitor.
- One active session per instance, at most three starts per five minutes, two
  pending proof checks, a provider ceiling of 32 per session/backend boot further
  restricted by the existing parsed admission allowance (currently seven, never
  increased by this adapter), 64 native
  calls per session, 1,024 media reads/2 GiB delivery. Existing source limits and
  ten-clip/three-picture-per-clip bounds remain. No automatic paid retry. Completed
  plans/images are reused for explicit retries; quality critiques remain advisory.

## Owner release gates, not executed deployment steps

The backend image now contains Linux FFmpeg, Chromium, the renderer package and
current fixed worker/overlay compiled at build time. The local YouTube downloader/
Python distribution is excluded; no runtime tool download is performed. The frontend/backend
closed context builder excludes ignored configuration, private media and tests.

The old lightweight backend allocation is insufficient for native encoding and
in-memory ephemeral scratch. This profile reserves up to 12 GiB scratch plus
256 MiB free space, with up to 2 GiB overlay scratch included in the existing
reservation accounting. Before release, the owner must choose/approve a backend
allocation with at least 16 GiB memory and appropriate CPU, request duration and
always-allocated CPU for background preparation/expiry. Preserve a single API
instance (no cross-instance routing or durable session recovery is implemented).
Frontend request concurrency remains bounded at eight. These are release
requirements, not claimed resource changes. No resource or cloud setting was
changed by the agent.

Keep normal injected Gemini/Turnstile/approval configuration. No new AI mode or
second environment file is introduced. Paid-off/fake/test/preview or missing
approval/prerequisites cannot activate the hosted provider runtime. Local fake
mode needs no keys; synthetic hosted-shaped tests inject fake ports and generated
media with network blocking. Actual hosted Gemini processing requires real keys,
live approvals and deliberate visitor actions.

Before the owner deploys: verify the Linux image offline, source/caption/picture/
filter parity, scratch/resource ceilings, large chunked uploads, cancellation,
expiry/exit, single-instance routing and authentic frontend/Turnstile behavior.
Cloud builds and real-provider/paid acceptance require new explicit approval;
agents must never deploy. A Windows synthetic native/browser proof is not Linux
image or cloud acceptance. See CL-061 for checks actually run and unchecked gates.

## Local Linux verification completed â€” CL-063

The current secret-free frontend/backend images build and run on the owner's
local Linux Docker engine. An offline generated-media probe exercises the actual
packaged worker and shared upload/editor, chunk/hash binding, caption changes,
picture position/motion state, decoded filter output, native MP4 download,
cancellation, explicit retry reuse, expiry and exit cleanup. The frontend image
also passes fixed-asset, CSP and route checks; fake/paid-off backend startup keeps
paid routes unavailable. See the [CL-063 evidence](../tickets/CL-063-local-hosted-release-verification.md).

The proof uses no API keys: fake AI, hardcoded paid-off environment, loopback-only
transport and a network-isolated non-root container. The probe script is bundled
with pinned esbuild into owned temporary scratch and mounted at
`/app/dist/verify-hosted-editing-linux.mjs`; its synthetic UI is mounted at
`/proof/ui`. Neither is shipped in the application image. It runs the packaged
`/app/media/dist/editing-worker.js` and image-owned native tools, rather than a
Windows binary or stale overlay. Use a read-only root with writable temporary
scratch/home, at least 512 process slots for the proof's two Chromium instances,
four CPUs and 4 GiB memory. Do not mount configuration, owner media or cloud
credentials. The tested sample uses about 930 MiB memory and 25 MiB scratch;
the 16 GiB hosted requirement is unchanged.

Still unchecked before release:

| Check | Why local fake checks cannot finish it |
| --- | --- |
| Real frontend identity, HTTPS/origin forwarding and Secure cookies | Requires the actual hosted frontend/backend and identity configuration. |
| Turnstile and genuine provider responses | Needs real keys and a separately approved live test. |
| Single-instance routing and always-allocated CPU | Actual hosting settings and behavior have not been changed or exercised. |
| Maximum memory/scratch/source/batch capacity | The local Docker allocation is below the documented 16 GiB target; the small sample is not a worst-case load test. |
| Owner media/quality acceptance | Deliberate owner-only manual paid review remains separate from synthetic processing. |

Do not deploy or infer approval for credit-consuming tests from this local proof.

## Current security checkpoint — 2026-10-26

CL-090 (2026-10-26): review the [current security audit](STRIDE_SECURITY_AUDIT_2026-10-26.md)
before public release. All three image stages now pin the verified official
Node 22.23.4 Bookworm security image; application Zod is 4.6.6 and Next/eslint
are 16.4.1. This does not close SEC90-01's MP4 parser vendor risk or replace actual
hosted identity, single-instance routing, resource/CPU, Turnstile, owner rights
and paid/visual acceptance. No G Cloud changes, deployment or provider test is
authorized by local verification. Follow CL-090 for current evidence and limits.
