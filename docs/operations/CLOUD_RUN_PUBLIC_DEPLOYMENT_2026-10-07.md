# Cloud Run deployment and Cloudflare domain guide — 2026-10-07

CL-015 owns this checkpoint. The owner reports the local paid upload-to-export
walkthrough working and authorizes frontend/backend Cloud Run deployment and
ticket-prefixed commits. The owner manages Cloudflare DNS, Turnstile dashboard
and secret values. Agents do not run paid processing or inspect local secrets.
Paid mode is now enabled at the managed frontend for the owner's explicitly
requested manual walkthrough. The initial paid-off checkpoint is retained below.
Custom-domain TLS/cutover, general public traffic review and live owner acceptance
remain separate; this does not mark the full public release complete.

## Current topology and settings

- Public Next.js frontend, private Express backend and existing private renderer
  in the existing approved project, `europe-west1`.
- Browser requests use same-origin `/api/` routes. Frontend runtime identity can
  invoke only the private backend; the existing control identity invokes the
  renderer. Private origins, accounts and image repositories stay out of Git.
- Frontend/backend: one CPU, 512 MiB memory, minimum zero and maximum one instance,
  eight concurrent HTTP requests, 360-second request timeout. Existing renderer
  resource settings and expiry schedule are preserved.
- Backend now uses `FAKE_MODE=false`, `PAID_DEMO_ENABLED=true`, all four existing
  approvals true and `PUBLIC_PAID_PROCESSING_APPROVED=true` for the owner test.
  The non-processing configuration GET confirms live upload, analysis, assembly
  and export. Hosted fixture/sample routes remain unavailable. No-key fake checks
  prove synthetic behavior; real quality and end-to-end success remain owner-only.
- Four exact enabled Gemini/Turnstile/grant secret references, private runtime
  identities, origin/challenge configuration and cloud access are installed.
  Secret payloads were not read; widget pairing/key-project correspondence still
  needs the owner's real test. There is no local AI model/weights path.
- Renderer preserves `FRONTEND_ORIGIN=http://localhost:3000` and accepts the
  exact managed frontend through `HOSTED_FRONTEND_ORIGIN`. Bucket CORS includes
  both exact origins. No wildcard, private IAM or other bucket policy change.
- Existing spend controls carry forward. One instance and four media operations
  per session are capacity/work bounds, not a global DDoS or cost guarantee.
  Process-local grants fail closed after restart; they do not survive rollout.

The owner's first hosted preview/export had no pictures because a stale
local-only factory guard blocked generated-picture fallback after three validated
Commons searches supplied no usable assets. This is corrected in the current
backend. The same bounded fallback now composes in explicitly approved production
and local mode; safe configuration reports real framing/visual availability.
No other disabled upload-to-export function was found in the runtime-gate review.
Private diagnostics and the existing three-image-call bound remain unchanged.

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
mapping to the existing public frontend is created. Google and Cloudflare public
resolvers return all eight exact records. TLS is still pending at the latest
recorded check; the managed frontend remains the active application origin.
The corrected frontend/backend images are now verified and deployed. Do not
switch to the custom origin until certificate/Ready checks pass and the owner
finishes the managed-URL test. Local environment files and the renderer's local
upload origin remain intact.

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

After the planned cutover, use `https://tryclipbuilder.com` as the single application origin. `www` can
redirect to it; do not operate the paid app on both hosts. The application allows
only this exact custom production origin or the configured managed Cloud Run
origin. Private backend origin and token audience remain Cloud Run HTTPS.

Google's current [domain options](https://docs.cloud.google.com/run/docs/mapping-custom-domains)
recommend an external Application Load Balancer. Native Cloud Run domain mapping
is available in `europe-west1` but remains Preview and is not recommended by
Google for production services because of latency limitations. For this small
portfolio demo, the direct mapping path avoids adding a load balancer; choose it
with that documented tradeoff. The mapping and owner-entered DNS are recorded
above; no load balancer or additional paid Cloudflare plan was added.

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

Paid mode currently serves the managed frontend for the owner test. For the
later custom-domain cutover, first disable hosted paid processing and finish or
Exit existing sessions, then apply these settings and start a fresh session:

1. Cloudflare dashboard → Turnstile → widget → Settings → Hostnames: add
   `tryclipbuilder.com`, without protocol/path/port. Keep `localhost` if retaining
   that same widget for development. Add the exact managed frontend hostname only
   if a managed-URL test is needed. This setup keeps `www` as a future redirect
   rather than another processing host. Save. Never select unrestricted hostnames.
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
5. Preserve renderer `FRONTEND_ORIGIN=http://localhost:3000`; replace its optional
   `HOSTED_FRONTEND_ORIGIN` with the exact custom origin and replace the managed
   origin in disposable-bucket CORS while keeping localhost. The verified backend
   forwards only its configured origin, the authenticated renderer rejects all
   other Origin values before storage and GCS binds each resumable capability to
   its admitted origin. Retire the managed origin after sessions are finished;
   do not add a second public processing origin. Retain private IAM, generation
   fencing, cleanup and the existing local env.
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

## Current hosted visual correction receipts

The [source/image/configuration correction receipts](HOSTED_VISUALS_CORRECTION_2026-10-07.json)
freeze 97 backend inputs at `727d940c76eb19c42f050a1d2fdf137f9a1de8ae` and the current
backend image `sha256:51e78a090445048c4822cd8dd4cebe3767ebd359a2daf1dca8734b8034f49f39`.
The previous frontend and renderer images remain unchanged; their evidence is
retained in the initial hosted paid receipts below.

Both new production regressions fail before the fix and pass afterward; 125
focused tests and all 1,250 fake/no-key tests in 110 files pass. Format/lint/
typecheck pass. Two unchanged frontend import timeouts from the first full run
are preserved; isolated and standard full rechecks pass without source/timeout
changes. The actual Linux backend build and offline nonroot probe pass, including
approved production fallback construction and image/public approval rejection.
The exact scan has zero fixable high/critical entries with its full unfixed
ledger retained privately.

Rollout is Ready with 100% latest traffic. Only the backend image and source
revision changed; enabled paid/image flags, IAM/secrets, resource/ingress limits,
origins, frontend/renderer/bucket and local env are preserved. Non-processing
configuration GETs confirm upload/analysis/assembly/export, active-speaker framing
and contextual visuals enabled, sample UI absent and localhost still live.
Anonymous backend health stays 403. Agent AI calls/media sessions remain zero.

Refresh the managed frontend and choose **Start over** for the owner-only fresh
walkthrough. An already completed preview/export retains its original manifest;
the update does not regenerate pictures or replay paid work automatically.
Actual generated-image provider/quality/cost/deletion and broader owner release
acceptance remain unchecked. The paused general public traffic review is separate.

## Initial hosted paid walkthrough receipts

Open [the managed frontend workspace](https://clipbuilder-frontend-obh7yniraa-ew.a.run.app/start)
in a fresh tab/session. The owner reports the managed/apex hostnames added to
the existing Turnstile widget with localhost retained. Do not use the backend
hostname in the widget. The actual challenge and paid flow are owner-only proof.

The [326-entry compiled-input manifest](HOSTED_PAID_WALKTHROUGH_2026-10-07_INPUTS.json)
and [structured activation receipts](HOSTED_PAID_WALKTHROUGH_2026-10-07_EVIDENCE.json)
record source revision `051e5e9fbc50df1edaeff5a570d04029809756ab`, exact images,
preserved configuration and the non-processing live-capability checks. Each
target's compiled files match the manifest even though the frontend build was
submitted before the backend/renderer-only compatibility change.

| Target | Initial paid-test image digest | Accepted proof |
| --- | --- | --- |
| Frontend | `sha256:59e5f0d16d9e29c70b9d3cc4c0ab4f1716a093f19acea38d2f33c704a8573ab7` | Linux standalone build, 1,320 artifact files/10 routes/zero external package links; offline runtime and deployed bridge |
| Backend | `sha256:02f18bf9d4c1de1c78d3f79cae64ccae37acf5a1e8ed40c14f64114c5b1f5fb6` | Linux compile/imports/offline runtime; exact hosted Origin forwarding; private rollout and live capability GET |
| Renderer | `sha256:89b88106adae8ce481a76d3fa915d298b0338551cb8a5358243a4b03cc022316` | Linux synthetic audio/export/cancel/scratch, no process leftovers/AI calls; private rollout and exact local/hosted upload origins |

All three scans have zero fixable high/critical entries; the full unfixed ledgers
are preserved privately. The standard format/lint/typecheck gates and 1,248
fake/no-key tests in 110 files pass. An unchanged frontend instrumentation import
timed out in the first full run; the isolated and repeated standard full checks
pass without source/timeout changes. Both original and passing logs are retained.
Actual Linux builds compile all workspaces. No Windows build was run over the
owner's active Next development output.

The image rollouts and subsequent seven-flag backend activation are Ready with
100% latest traffic. Private IAM/secrets, service/revision caps, local env, other
renderer settings and non-CORS bucket policies are preserved. Before activation,
the unpaid bridge/assets/CSP/crawl/retired-route checks pass. After activation,
landing, workspace and safe configuration return 200 with all four real
capabilities enabled and sample UI absent; localhost retains its live flags.
No agent upload, grant, Gemini call, rendering session or paid flow was run.
Paid-off flags/configuration, prior images and content-safe private logs remain
available. Only owned temporary image contexts are removed after source checks.

Owner live acceptance and actual rollback/kill-switch exercise remain unchecked,
as does the earlier paused general public traffic/direct-origin review. The
custom-domain certificate is pending; do not infer full release readiness from
safe GETs or synthetic export proof.

## Initial paid-off execution receipts

The remainder of this section preserves the earlier paid-off checkpoint. Its
images and disabled flags are historical; the current activation is recorded above.

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
