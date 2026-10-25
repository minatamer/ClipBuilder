# Shared upload/editor release preparation

Owner decision, 2026-10-24 (CL-061): one normal app. Upload → manual/AI moments →
clip preparation → caption/picture/filter editor → Apply/Discard → export/download.
Only YouTube URL acquisition is local-only. This is prepared source code; it
does not change the currently deployed revision. Agents must never deploy for
the owner or run credit-consuming tests without new explicit approval.

## Deferred deployment checklist — 2026-10-25

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

## Local Linux verification completed — CL-063

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
