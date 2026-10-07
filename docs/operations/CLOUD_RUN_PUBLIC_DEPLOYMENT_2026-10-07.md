# Cloud Run deployment and Cloudflare domain guide — 2026-10-07

CL-015 owns this checkpoint. The owner reports the local paid upload-to-export
walkthrough working and authorizes frontend/backend Cloud Run deployment and
ticket-prefixed commits. The owner manages Cloudflare DNS, Turnstile dashboard
and secret values. Agents do not run paid processing or inspect local secrets.
This guide records a paid-off hosting checkpoint. Public processing remains
gated by exact hosted configuration, traffic review and owner acceptance.

## Current topology and settings

- Public Next.js frontend, private Express backend and existing private renderer
  in the existing approved project, `europe-west1`.
- Browser requests use same-origin `/api/` routes. Frontend runtime identity can
  invoke only the private backend; the existing control identity invokes the
  renderer. Private origins, accounts and image repositories stay out of Git.
- Frontend/backend: one CPU, 512 MiB memory, minimum zero and maximum one instance,
  eight concurrent HTTP requests, 360-second request timeout. Existing renderer
  resource settings and expiry schedule are preserved.
- Backend starts `FAKE_MODE=true`, `PAID_DEMO_ENABLED=false`, all four approvals
  false and `PUBLIC_PAID_PROCESSING_APPROVED=false`. Hosted fixture/sample routes
  remain unavailable. No-key fake checks prove synthetic behavior; a public
  paid-off deployment does not provide a working real export.
- Public paid processing needs real Gemini/Turnstile secrets, cloud/runtime
  access, exact origin/challenge settings, applicable approvals and the final
  owner-run hosted walkthrough. There is no local AI model/weights path.
- Existing spend controls carry forward. One instance and four media operations
  per session are capacity/work bounds, not a global DDoS or cost guarantee.
  Process-local grants fail closed after restart; they do not survive rollout.

Use immutable scanned image digests. Freeze source/context inputs and inspect
the exact Linux artifact and offline runtime proof before rollout. Keep the
previous immutable revision/configuration for rollback. Cloud Run cold starts,
registry storage, secrets and build activity can incur charges even without AI.

## Secret Manager setup

The owner created these four entries manually:

| Secret | Value | Runtime consumer |
| --- | --- | --- |
| `GEMINI_API_KEY` | Existing approved paid-project Gemini API key | Backend only |
| `TURNSTILE_SECRET_KEY` | Turnstile widget's secret key | Backend only |
| `TURNSTILE_SITE_KEY` | Matching widget's public site key | Backend exposes only this public value |
| `PROCESSING_GRANT_KEY` | 32 random bytes encoded as 43-character unpadded base64url | Backend only |

The processing key is a plain key, not JSON, a password or the renderer cleanup
key. A new hosted key may be independent of localhost. In Google Cloud Console,
open Security → Secret Manager, choose each secret and confirm an enabled
version. Never put a secret in source, screenshots, chat, shell arguments or
`NEXT_PUBLIC_*`. Leave the existing renderer cleanup secret intact.

Grant `roles/secretmanager.secretAccessor` on each individual app secret only to
the backend runtime identity, then bind the exact enabled version to the matching
backend environment key under Cloud Run → backend → Edit & deploy new revision
→ Variables & secrets → Reference a secret. Frontend needs no secret access.
Do not grant project-wide secret access or create service-account JSON keys.
Metadata-only verification confirms version state; it does not verify key value,
widget pairing or paid-project correspondence.

## First Cloud Run checkpoint

The owner-authorized deployment reuses the current verified registry and region.
Create the narrow frontend identity, deploy the backend privately, permit only
that frontend identity to invoke it, then deploy the frontend publicly. Set
the two services' exact managed HTTPS origins and the private backend audience
after Cloud Run returns their actual URLs; do not infer an audience from a name.
Use only the frontend managed URL in the browser. Keep backend and renderer
anonymous access denied.

Unpaid acceptance checks: landing, `/start`, safe configuration, favicon and
robots responses; actual sample flags false and no Use sample button; retired
testing/replay URLs absent; production CSP/no-store headers; exact image/Ready/
traffic state, bounded capacity and private IAM. These GET/error checks create
no media session and make no Gemini call. Keep the owner local stack running.

## Attach tryclipbuilder.com

The owner confirmed this exact purchased hostname on 2026-10-07, correcting the
earlier `tryclipbuilding.com` spelling. After the owner's Search Console TXT
verification, Google CLI metadata confirms ownership. The owner-authorized
mapping to the existing public frontend is now created; its TLS/Ready state is
pending DNS. No service configuration, secret or paid flag was changed.
Current deployed images still use the earlier allowlist; rebuild and verify
frontend/backend images before switching their configured application origin.
Local environment files and the renderer's local upload origin remain intact.

Google returned these eight apex records. In Cloudflare DNS → Records, add each
with **Name `@`, TTL Auto, Proxy status DNS only (gray cloud)**. Preserve the
Google verification TXT record. No apex CNAME is needed for this mapping.

| Type | Content |
| --- | --- |
| A | `216.239.32.21` |
| A | `216.239.34.21` |
| A | `216.239.36.21` |
| A | `216.239.38.21` |
| AAAA | `2001:4860:4802:32::15` |
| AAAA | `2001:4860:4802:34::15` |
| AAAA | `2001:4860:4802:36::15` |
| AAAA | `2001:4860:4802:38::15` |

Use `https://tryclipbuilder.com` as the single application origin. `www` can
redirect to it; do not operate the paid app on both hosts. The application allows
only this exact custom production origin or the configured managed Cloud Run
origin. Private backend origin and token audience remain Cloud Run HTTPS.

Google's current [domain options](https://docs.cloud.google.com/run/docs/mapping-custom-domains)
recommend an external Application Load Balancer. Native Cloud Run domain mapping
is available in `europe-west1` but remains Preview and is not recommended by
Google for production services because of latency limitations. For this small
portfolio demo, the direct mapping path avoids adding a load balancer; choose it
with that documented tradeoff. This guide does not create DNS or a mapping.

1. In Google Cloud Console → Cloud Run → frontend → Custom domains / Add custom
   URL, select direct Cloud Run domain mapping for `tryclipbuilder.com`.
2. Verify ownership of the base domain through Google Search Console when
   prompted. Add Google's exact verification TXT record in Cloudflare → domain
   → DNS → Records. Do not invent or copy another site's verification value.
3. Finish the mapping to the frontend service. Add exactly the DNS records Google
   displays, including all apex A/AAAA records if requested. A bare CNAME pointing
   to a `run.app` hostname alone does not configure Cloud Run's custom-host routing.
4. Keep these Cloudflare records **DNS only** during Google's certificate
   provisioning. Google says issuance usually takes about 15 minutes and may take
   24 hours. Confirm the mapping is Ready and HTTPS has a valid certificate.
5. Confirm Cloudflare SSL/TLS mode is **Full (strict)** before enabling its proxy
   if desired. Use HTTPS; do not use Flexible mode. Keep `/api/*` and `/start*`
   out of Cache Everything rules. Preserve Origin, cookies and security headers;
   disable any script transformation that interferes with nonce-protected scripts.
6. If using `www`, configure an HTTPS redirect to the apex that preserves the
   path/query. Complete its DNS/certificate requirements before relying on it.
   Add no second processing origin. Do not cache private media or API responses.

Cloudflare [DNS-only mode](https://developers.cloudflare.com/dns/proxy-status/)
and [Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)
explain the two controls. Cloudflare's optional proxy is not automatically a
complete traffic/spend safeguard: the managed `run.app` address can remain a
direct entry point. Reconcile the previously paused traffic decision before
anonymous paid launch. No extra paid Cloudflare plan is required by this guide.

## Domain, Turnstile and upload cutover

Do these with hosted paid processing disabled, then start a fresh browser session:

1. Cloudflare dashboard → Turnstile → widget → Settings → Hostnames: add
   `tryclipbuilder.com`, without protocol/path/port. Keep `localhost` if retaining
   that same widget for development. Add the exact managed frontend hostname only
   if a managed-URL test is needed. Add `www` only if it will actually run the
   widget rather than redirect. Save. Never select unrestricted hostnames.
2. Keep the four backend Secret Manager references paired with that widget/key.
   Backend `TURNSTILE_EXPECTED_HOSTNAME` must be the one active frontend hostname,
   first managed host for that test, then `tryclipbuilder.com` at custom cutover.
   Dashboard permission alone does not change the backend's hostname check.
3. Frontend: `APP_ENV=production`, `FRONTEND_ORIGIN=https://tryclipbuilder.com`.
   Keep `PRIVATE_BACKEND_ORIGIN` and `BACKEND_AUDIENCE` at the actual private
   backend Cloud Run URL.
4. Backend: `APP_ENV=production`, exact same `FRONTEND_ORIGIN`, own Cloud Run
   `BACKEND_ORIGIN`/`BACKEND_AUDIENCE`, frontend runtime caller email and recorded
   `APP_REVISION`. Origin/CSRF and caller checks stay enforced.
5. Before a hosted upload, reconcile the renderer's exact `FRONTEND_ORIGIN` and
   disposable bucket CORS with that active public origin. The current renderer
   creates resumable upload capabilities for one configured origin; it is currently
   the local origin. Do not silently change it and break local paid upload. A
   reviewed cutover or a verified implementation supporting both exact approved
   origins is required before claiming local and hosted paid upload coexist.
   Retain private IAM, generation fencing, cleanup and the existing local env.
6. Confirm the recorded native input-boundary correction's final image, Linux
   audio/export/cancel proof and private rollout. Original media uses maintained
   FFmpeg with the existing codec/container allowlists enforced before decoder
   opening; Remotion consumes only the normalized selected copy. This mitigates
   the identified input/encoder exposure without claiming every bundled library
   is patched. Review any newly reachable unfixed scan entry before enabling uploads.
7. Set backend `PRIVATE_RENDERER_ORIGIN` to the renderer's existing canonical
   configured audience/origin, with the existing control identity. Do not infer
   it from an alternate service URL or expose it to browser configuration. Public
   retained-sample/replay stays unavailable; do not copy local sample references.
8. After all preceding gates, set backend `FAKE_MODE=false`, paid master true,
   `PUBLIC_PAID_PROCESSING_APPROVED=true` and the four approval values only for the
   existing approved cloud/Gemini transfer/images/paid-project decisions. Never
   bypass a failed prerequisite or substitute fixture results. This step needs
   a new hosted revision and owner-run acceptance, not an agent-paid request.

Cloudflare's [hostname-management documentation](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/)
defines the widget allowlist; [server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
remains mandatory. Preserve the real challenge, exact hostname/action checks
and single-use processing grants. Local paid success does not prove this cutover.

## Owner post-deployment checklist

- [ ] Confirm the custom-host landing and stable 96×96 `/favicon.png` load over
  HTTPS; robots allows the landing and excludes workflow/API paths. Verify emitted
  raster icon markup and no preview noindex header on the public landing.
- [ ] Confirm `www`/alternate-host redirect policy and the single active app origin.
- [ ] Confirm no sample/replay/feasibility UI or assets are publicly served.
- [ ] On the active paid hostname, personally test real Turnstile → upload →
  analysis → candidate choice → automatic review → Confirm export → one 1080×1920
  MP4 download → Exit. Do not let an agent dispatch this test.
- [ ] Check paid-project/key correspondence, actual call/cost totals, caps and
  optional data-sharing settings in the provider dashboard. Confirm release
  privacy/rights/license notices and real desktop/mobile behavior.
- [ ] Verify temporary upload/proxy/output deletion and signed playback revocation
  after Exit/expiry. Preserve both retained local masters, captures and logs.
- [ ] In the private backend logs, verify actionable content-free diagnostics;
  UI/browser errors remain generic. Avoid bodies, tokens and provider payloads.
- [ ] Reconcile public traffic protection and direct managed-URL access before
  enabling anonymous paid traffic; verify configured service caps and alerts.
- [ ] Preserve the full scan receipts and review their unfixed OS/native entries
  for newly reachable paths; zero fixable entries is not a zero-vulnerability claim.
- [ ] Verify Search Console ownership and request canonical homepage indexing.
  Favicon/search appearance can take time and is not guaranteed.

## Stop, rollback and local operation

Incident stop: disable backend `PAID_DEMO_ENABLED` and
`PUBLIC_PAID_PROCESSING_APPROVED`, deploy the paid-off revision, then verify safe
config shows analysis/assembly/render unavailable. This prevents new paid work;
already-dispatched work can still finish/bill. Keep diagnostics and private media
cleanup available. Never rely only on hiding a frontend button.

Rollback: keep paid off, route traffic to the recorded previous verified revision
or deploy its exact image digest/configuration. Verify Ready, health/config,
private IAM, origins and capacity before any re-enable. Do not rebuild an old
branch or delete retained owner media. In-flight process-bound sessions may be
invalidated; require a fresh user action and never auto-replay paid processing.

Local `.env.local` files, fixed localhost origins and existing logs remain intact.
Before extending shared contracts, rebuild contracts before importing the new
export into a running app. Do not run a root Next production build over the live
development output. Hosted image builds use isolated allowlisted contexts and
no env/private media. Keep the requested local apps running after handoff.

## Execution receipts

The [402-file final input manifest](CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07_INPUTS.json)
and [structured receipts](CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07_EVIDENCE.json)
record the frozen source, target build contexts, exact immutable images and
verification. Private service/project/account identities and raw cloud logs remain
in the owner-local temporary deployment record, outside Git.

| Target | Image digest | Accepted proof |
| --- | --- | --- |
| Frontend | `sha256:cdc3e07701c73c655820c7333f70ae38154479820875219164c9c7c824d18ef1` | Linux compile; 1,320 artifact files, 10 app routes, zero external package links; offline production-proxy proof |
| Backend | `sha256:1ddec9cd863098cdb24ec13b91799fc90f1e4258f481cda1ab03e8e3d8e1745b` | Linux compile/imports and nonroot, network-isolated safe config/health proof |
| Renderer | `sha256:abe968869aa35ceff3555565663aa3ece5ab848d31e38d3ac928f97818daf7f4` | Linux synthetic audio/export/cancel/scratch and nonroot offline runtime proof; private image-only rollout |

All three exact-digest scans have zero **fixable** high/critical entries. Their
full reports retain 222 backend, 222 frontend and 968 renderer package entries,
including unfixed entries; do not interpret this as all components patched.
The targeted source policy prevents opening unsupported decoders, blocks remote
protocols and non-MP4 demuxers, and retains fixed export/filter choices. Examples
of excluded attack paths are [MagicYUV](https://security-tracker.debian.org/tracker/CVE-2026-8461),
[ADX](https://security-tracker.debian.org/tracker/CVE-2026-64835),
[CineForm](https://security-tracker.debian.org/tracker/CVE-2026-70632),
[VobSub](https://security-tracker.debian.org/tracker/CVE-2026-64830),
[DASH](https://security-tracker.debian.org/tracker/CVE-2026-75146) and
[RIST](https://security-tracker.debian.org/tracker/CVE-2026-75143).
This is an inference from the advisory conditions and fixed execution paths,
not a binary-patch or exploit-test claim. Debian also identifies the reported
[zlib MiniZip entry](https://security-tracker.debian.org/tracker/CVE-2023-45853)
as excluded from the Bookworm zlib binaries. Keep unfixed entries visible when
reviewing future changes; no scanner suppression or exploit payload is added.

Final format/lint/typecheck pass, with 1,244 fake/no-key tests in 109 files. The
last proof-only correction additionally passes lint and 15 packaging tests.
Actual Linux image builds compile all five workspaces. The isolated Windows root
build was blocked by Turbopack's external dependency junctions and is not claimed
passing. All runtime source files match the final manifest; backend/renderer use
their earlier verification script because the later change affects only the
frontend probe. Exact per-target source commits/context hashes are recorded.

Both app services are Ready with 100% latest-revision traffic, exact runtime
identities/origins, one-instance service/revision caps and the planned HTTP bounds.
Backend remains private; the frontend's real metadata identity/configuration
bridge returns 200 with sample/local-media/analysis/assembly/render all false.
Four exact enabled secret version references are verified. The private renderer
retains its IAM and operational settings; anonymous health is 403, configured
caller health 200 and an empty descriptor 400 with zero dispatches.

Public landing, `/start`, configuration, favicon and robots are 200; CSP/no-store
and production crawl policy pass. Retired motion/feasibility/module URLs are 404;
retired replay POST is 404 and its unsupported GET is a generic 503. No sample
button is present in server markup and hosted config disables it. Local landing,
workspace/config and backend health stay 200 with normal live paid capabilities;
these are readiness probes, not a repeated owner paid walkthrough.

Corrections: rebuilt contracts after the local missing-export overlay; reproduced
and fixed Next's container-origin rejection; reproduced Node fetch normalizing
the offline probe Host and used native HTTP; retried scanner cache contention
sequentially; checked retired replay using its actual POST method. No failed image
was deployed. Final relevant source review has no new actionable finding within
this paid-off checkpoint. The complete public-paid release remains unchecked.

Six owned build contexts and the isolated Windows copy were removed after
detaching its six verified dependency junctions. Masters, captures, private logs,
receipts and requested local app processes remain. Previous renderer digests and
the current verified paid-off app configuration remain available for rollback;
an actual rollback/kill-switch exercise and real cleanup/cost/quality acceptance
are still owner-only. Secret metadata is not widget/key/project validation.
DNS/domain/Turnstile dashboard actions remain owner-managed. Agent AI calls and
media sessions are zero.
