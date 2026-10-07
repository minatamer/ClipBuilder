# ClipBuilder security audit — 2026-10-07

**Historical read-only audit snapshot.** The findings and original inventory below
describe the pre-remediation baseline. The later owner instruction authorized
local fixes and accepted one fallback; follow the current dispositions and
[execution/validation report](STRIDE_SECURITY_REMEDIATION_2026-10-07.md).

| Finding | Current disposition after owner approval |
| --- | --- |
| SEC-01 | Later owner-authorized CLI reads verify the app's USD 5 monthly Cloud Run spend cap as configured. Current Gemini key/project correspondence and whole-flow coverage remain open. The original audit missed the October 4 owner-reported USD 5 Gemini cap in `PROVIDER_SETUP.md`; that supersedes the older deferred-amount entry. Resource caps and alert thresholds alone do not prove enforced spend limits. |
| SEC-02 | Fixed locally: verify nonce-bound session-start proof before scarce allocation; bound verification work. Owner Turnstile/CSP check remains. |
| SEC-03 | Fixed locally: shared generous byte/read/metadata allowance, no refill through reopen/aliases, revocation rechecked after fetch and reads. |
| SEC-04 | Local tooling/framework patched and pinned; Windows browser version verified. Exact Linux image scan, native export compatibility and separate private rollout remain open. |
| SEC-05 | Owner explicitly accepts up-to-48-hour provider expiry following process loss; normal explicit cleanup unchanged. |
| SEC-06 | Paused by owner pending dashboard review. No traffic-protection implementation. |

The original findings, probes, dependency results and hashes remain historical
evidence, not claims that the changed application still has every original gap.

Review: [plain-language HTML](STRIDE_SECURITY_REVIEW_2026-10-07.html) ·
[file-level remediation plan](STRIDE_SECURITY_PLAN_2026-10-07.md) ·
[evidence](STRIDE_SECURITY_EVIDENCE_2026-10-07.json) ·
[snapshot inventory](STRIDE_SECURITY_INPUTS_2026-10-07.json).

## Result and meaning

Six material risks are retained for owner review: **one High, five Medium, zero
Low**. Severity reflects this disposable demo and the intended public Cloud Run
deployment, rather than copying package CVSS scores. Minor hardening suggestions
are excluded. Some entries confirm limitations already documented in CL-012;
they are not presented as newly discovered bypasses.

Public paid processing currently fails closed. The High entry is a **conditional
public-release financial risk**, not evidence that the current public site permits
unrestricted paid processing. Two small, isolated proofs confirm admission and
delivery weaknesses; another confirms that the process allowance resets while
old sessions remain securely rejected. The native-browser entry identifies an
outdated security baseline, not a demonstrated renderer exploit. Cloud settings
were not inspected; deployment requirements are identified separately.

No material cross-session access, signed-result forgery, arbitrary server URL,
shell injection, browser HTML injection or secret logging flaw was established
in the reviewed first-party paths. This is an evidence-bounded conclusion, not a
claim that the repository or deployed system is vulnerability-free.

| ID | Severity | Material risk | Evidence/applicability | Original owner decision |
| --- | --- | --- | --- | --- |
| SEC-01 | High | Process limits cannot bound public paid spending across restarts or replicas | Confirmed synthetic reset; known launch gate; vendor controls unverified | Pending |
| SEC-02 | Medium | Three challenge-free grants can block other visitors from starting | Confirmed domain proof; public impact depends on enabling that route | Pending |
| SEC-03 | Medium | One valid session can repeatedly consume media-delivery resources | Confirmed synthetic reads; existing concurrency/expiry controls remain effective | Pending |
| SEC-04 | Medium | The baked renderer browser predates published browser security updates | Version verified; exact-image vulnerability mapping/exploit unverified | Pending |
| SEC-05 | Medium | Hard backend loss forgets outstanding Google Files deletion obligations | Confirmed lifecycle design; provider fallback/disclosure already exists | Pending; acceptance is a valid option |
| SEC-06 | Medium | Unpaid public HTTP work lacks an application-wide admission bound | Source-confirmed boundary gap; public hosting configuration unverified | Pending; size the remedy during deployment |

## Scope, authority and method

Snapshot: `main`, commit `5ef509fd2b027e9f085fb3e78739a7bc245aabd0`, initially
clean. The inventory covers **477 tracked files**: backend 96, frontend 175,
renderer 53, contracts 34, composition 9, repository configuration/tests 31 and
documentation 79. Inventory SHA-256:
`fbfb219eba2d3da3e06f17f555d15fcb6fa75f84f2cfe250ef885a92302f7598`.
Tracked text was indexed and screened; security-relevant entry points, their
transitive trust boundaries and owning tests were then traced manually. File
inventory coverage does not mean every documentation sentence was line-reviewed.
Current migration/owner decisions take priority over superseded ticket history.

The **375 inputs** recorded by the completed code-quality validation are unchanged,
with aggregate SHA-256
`b6e34464f21d02dd495b464f1c2fea106810d083af1192272f2b77fc7f1c97fd`.
The lockfile SHA-256 remains
`cbf16cbaaf453fa97cdd219f9002997fa037753a81c46d1fee21aa4936167a83`.
Audit documents are outside that application-input baseline.

The review used STRIDE at each trust boundary, plus practical checks for broken
authorization, CSRF, XSS, SSRF, command/path injection, parser/resource exhaustion,
prompt injection, replay/races, paid-service abuse, deletion failure, build-context
leaks and dependency advisories. STRIDE organizes impersonation, modification,
action traceability, disclosure, service denial and privilege escalation.
[Microsoft STRIDE reference](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats).

Verification performed:

- `corepack pnpm test:unit`: **1,223 passed in 104 files**. Root 40/4;
  contracts 79/6; composition 5/1; backend 553/28; renderer 110/16; frontend 436/49.
- Three isolated synthetic probes, using real admission/delivery domain classes
  with fake injected ports. No app composition, native process, credentials,
  media, provider call, cloud operation or server listener was involved.
- Two public advisory feeds queried for **844 locked package/version pairs,
  773 distinct package names**. Only package names and versions were sent;
  there was no install, lockfile update, authentication or credential access.
- Reachability review of each matched advisory, primary framework/browser/vendor
  documentation and the installed packages used by the current call paths.
- Tracked-source scans and manual triage of transport, filesystem/process,
  authorization, deletion and diagnostics paths. Browser dangerous-sink scan,
  tracked private-key marker scan and unfinished TODO/FIXME scan found zero matches
  within their recorded scan scope. These checks do not certify absence of secrets.

**Mode boundary:** `FAKE_MODE=true` without API keys provides labelled fixture UI
and synthetic provider/job/storage tests. It does not prove live AI quality, real
export fidelity or deployment readiness. Real analysis/image generation needs
provider keys, live flags and rights/data/paid approvals. Private rendering needs
separate cloud compute/storage/IAM approval. There is no verified local AI model
or weights path. This audit ran only fake/paid-off checks and public advisory GET/
POST queries. No ignored env file, credential, retained master, real media, replay
cache or diagnostic capture was read. No cloud account or deployed revision was
inspected; no paid flow, deployment, image build, live attack or load test ran.

## Trust boundaries and STRIDE coverage

| Boundary | Spoofing / tampering | Repudiation / disclosure | Denial / privilege escalation | Assessment |
| --- | --- | --- | --- | --- |
| Browser → public Next | Treat browser state and all headers as untrusted; fixed route/action allowlists, JSON/encoding/range bounds; CSRF and origin restrictions downstream | Generic UI errors; console diagnostics classified before private relay; no sensitive response caching | Fresh nonce requires dynamic rendering; no shared pre-work HTTP slots | SEC-06; cloud proxy/host policy is a release gate |
| Next → Express | Current fixed loopback upstream, selected cookies/headers only, redirects disabled; never browser-selected upstream | No public backend origin/provider setting; no raw upstream exceptions | Body/response/deadline bounds and abort cleanup; paid admission downstream | Local boundary reviewed; private authenticated Cloud Run transport remains CL-015 work |
| Session → paid actions | AEAD host cookie, CSRF, boot epoch, random session/action nonce, HMAC signed result digest, action state reserved before await | Content-free private stage/status diagnostics; browser events explicitly untrusted, not proof of identity | Per-process active/dispatch/grant caps; uncertain attempts consumed; Turnstile before protected dispatch | SEC-01 and SEC-02; no established once-per-action replay bypass |
| Model/Commons → application | Raw provider types contained in adapters; strict schemas; source/range/revision/digest checks; fixed outbound hosts and no redirects | No content in ordinary logs; provider policies distinct from application deletion | Fixed attempts, bounds on polls/bytes/pixels/time; no tools, remote fetch instruction or execution from model text | SEC-05 cleanup continuity; no demonstrated prompt-to-command or prompt-to-SSRF path |
| Express → private renderer | Exact Cloud Run origin/audience, ID tokens; renderer checks verified caller email and route purpose | Private diagnostics limited to source-controlled fields; no capabilities in public query strings | Canonical strict/case-sensitive internal routes; no arbitrary composition, arguments or tool downloads | Code controls present; deployed IAM/ingress remains unverified |
| Renderer → GCS | Opaque scoped IDs; immutable generation/precondition binding; CAS state, manifest hash, source fingerprint | Private uniform access policy validation; no versions/holds/retention/soft-delete; capability bounds | Session/object/scratch/work/stream caps; durable per-session operation allowance and expiry intents | Strong local controls; verify actual bucket/scheduler/rollout evidence |
| Media → native parsers/browser | Fixed argv, no shell; MP4/H.264/AAC envelope; probe/transcode checks; bounded normalized JPEGs; no SVG or remote renderer assets | Fixed bundle and private scratch; worker lacks provider configuration | Fixed concurrency/deadline, owned process-tree cancellation; renderer runs non-root | SEC-04; native-image scan not covered by npm feeds |
| Session → preview/download | Receipt and binding ownership, expiry and metadata recheck after await; exact byte-range matching | HttpOnly session required; no-store; generic download filename | Stream/read cancellation and global/per-session concurrency limits | SEC-03; repeated authorized reads remain possible |
| Browser → OPFS/IDB | Strict restored record schemas; Web Locks are authority, BroadcastChannel only advisory; no saved CSRF/upload token authority | Temporary local bytes and validated result data disclosed; Clear best-effort | Size/quota/expiry/error handling, worker/object-URL lifecycle | Same-origin device storage is not an independent attacker privilege boundary; no extra account/encryption platform proposed |
| Repository → build/runtime | Exact lock pins/integrity, package build-script allowlist, executable boundary tests, allowlisted renderer build context | Ignored private assets/env/captures excluded from approved image context | CI fake/off before imports, network interception; production fixed bundle/tools | Dependency triage below; public final artifact/image receipts remain necessary |

### Public and internal route inventory

- Frontend `/` and `/start`: dynamic nonce-bearing documents; product media is
  fixed/static. `/api/analysis/[action]`: allowlisted POST grant/session/upload/
  sample/run/clear/assemble/preview/render/render-result/output plus development
  replay actions; GET preview/output/download/sample-source uses bounded Range.
  Replay POSTs reject outside development. `/api/sample/[...path]` is an allowlisted
  fixture bridge. `/api/diagnostics` accepts only classified bounded events.
  `/api/session/exit` revokes and schedules best-effort cleanup.
- Backend `/v1/analysis/*`: grant, signed-session restore, protected upload/sample,
  analysis/assembly/render/results, preview/output/download and Clear. Both
  upload and retained-sample preparation go through `admission.run` and bot
  verification: **SEC-02 is not an unchallenged media-upload exploit**.
  `/v1/admission/grant` has the same scarce-grant concern. Retained source reads
  already have **two concurrent streams and 60 requests/minute**. Diagnostics has
  a global rate bound; health returns content-free status; session Exit is bounded.
- Renderer health and fixed internal upload/prepare/select/analysis-proxy/audio/
  release-proxy/preview/info/content/render/output/info/content/cancel operations
  remain private. Expiry has a separate authorized purpose. No user-directed URL,
  filesystem path, composition, binary, command or job queue endpoint is present.
- Feasibility/browser audio/media/playback tooling and product-film Studio are
  development tools, not public workflow routes. Their presence in source is not
  itself an exposed port. The current frontend build includes a release-artifact
  verifier; deployment must use its production artifact and leave optional tools
  unlaunched. No owner app/process was started or stopped during this audit.

## SEC-01 — High: spending allowance restarts with the backend

**STRIDE:** Denial of service; economic abuse. **Confidence:** high for code
behavior, unknown for actual vendor limits. **Origin:** existing CL-012/COST_MODEL
limitation independently reproduced. **Activation:** a future public paid service
with usable credentials/approvals; the public-paid gate currently prevents it.

`ProcessingAdmission` owns `dispatches`, `active`, `grantTimes` and grant records
in memory (`apps/backend/src/admission/processing.admission.ts`, approximately
lines 69–95, 210–269, 295–313). Composition creates fresh instances. New process/
replica/revision means a fresh allowance. The codec's boot epoch correctly rejects
old sessions after restart; that is a security success, but a new session obtains
the fresh allowance. The renderer's durable four-operation per-session allowance
does not impose an aggregate provider/project monetary ceiling.

Synthetic proof: configure one permitted dispatch; process A allows one fake
dispatch and rejects the next for exhausted budget. Construct process B with
the same policy: it rejects A's old grant and permits one new fake dispatch.
**Two isolated process objects → two allowed fake dispatches**. This is a model of
process composition, not an actual Cloud Run restart or paid call. Current code
reserves actions and image attempts; an action is not a billing unit—the source
analysis path itself contains separate provider interactions. No prices or exact
monthly bill are inferred from the action count.

An attacker who can complete the bot check can use new sessions and replicated/
restarted capacity; attacker-caused restarts are not required. Normal platform
replacement or a deployment is sufficient. Application limits reduce immediate
work; they cannot guarantee a project-wide spend ceiling. Cloud Run instance
limits also have temporary overshoot and rollout considerations.
[Cloud Run maximum instances](https://docs.cloud.google.com/run/docs/configuring/max-instances).

**Proposed remedy:** retain the current efficient process caps and paid-off kill
switch, and complete the existing vendor/deployment gate. Choose owner-approved
budgets, model quotas and service instance/concurrency settings, accounting for
revision overlap. Current Google documentation supports monthly **spend cap
budgets for Gemini API and Cloud Run**, scoped per project/service. Enforcement
is delayed, in-flight work can finish and overages remain billable; ordinary
alerts-only budgets do not stop spend. Cloud Storage is not on that eligible list.
[Spend cap budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets-spend-caps),
[alerts-only budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets).

Do not add a database/distributed billing ledger to this demo or claim that
`max-instances=1` makes counters durable. Verify deletion still has a viable path
when Cloud Run is paused: the expiry endpoint can be paused too, while stored
objects remain. Record the lifecycle fallback and recovery responsibility rather
than claiming the ten-minute output TTL guarantees deletion in an outage.
The [SEC-01 plan](STRIDE_SECURITY_PLAN_2026-10-07.md#sec-01--vendor-and-rollout-spend-gate)
sets the cloud approval, cleanup and normal-flow safeguards.

**Owner decision:** resolve vendor evidence before public paid launch, or retain
paid-off operation. No application source change is required merely to relabel
the existing counters accurately.

## SEC-02 — Medium: unverified session starts consume the shared allowance

**STRIDE:** Denial of service. **Confidence:** high. **Origin:** newly demonstrated
finding. **Activation:** an accessible enabled grant route; public hosting is still
fail-closed, and the local service is loopback-bound.

`issue()` checks origin, sweeps bounded state, checks global capacity/window and
inserts a grant **without calling the abuse verifier**. The analysis route issues
the cookie on `/grant`; the frontend obtains a session before asking Turnstile
for the session-bound processing challenge. The configured allowance is three
grants per five-minute global window; up to 256 action records/four actions means
64 held grants, subject to the two-hour TTL.

Proof: three calls to the real `issue()` consume the synthetic policy's shared
window; a fourth visitor receives `RATE_LIMITED`, with **zero verifier calls**.
A non-browser HTTP client can send the expected Origin/Fetch Metadata strings and
omit previous cookies. Those headers protect browser cross-site requests; they
are not proof that a client is human. Repeating three starts each window can deny
new visitors without buying any provider work. It does not forge an existing
session or bypass Turnstile for upload, analysis or render.

Existing protections: scarce bounded records, expiry, origin/metadata checks,
duplicate-cookie rejection and later action-bound challenge verification. They
contain memory and paid abuse but allow a cheap visitor-starvation attack.

**Proposed remedy:** verify a bot-resistant **session-start proof before consuming
the scarce grant allowance**. Give that proof a separate purpose from subsequent
session-bound action proofs. Bound the proof verification concurrency/time/body
before any await; invalid starts must not consume genuine visitor slots. Preserve
the existing per-action token, hostname/action/cData verification and single-use
semantics. Do not recycle an already redeemed Turnstile token. Implement in the
existing admission feature; avoid a separate accounts/IP-tracking platform.

This sequencing may require adapting the existing widget bootstrap because its
current cData is the session ID obtained from grant. Do not just insert the same
challenge earlier or inflate/remove the global limit. Keep normal consent,
source selection, analysis, candidate choice, preview and export behavior.
[SEC-02 plan](STRIDE_SECURITY_PLAN_2026-10-07.md#sec-02--protect-scarce-session-starts).

**Owner decision:** approve the narrowly scoped admission change or explicitly
accept limited public demo availability. Rate limiting alone cannot distinguish
three malicious starts from three legitimate visitors.

## SEC-03 — Medium: repeated authorized media delivery is not cumulatively bounded

**STRIDE:** Denial of service; economic abuse. **Confidence:** high for the missing
application bound, not for an actual bill. **Origin:** read-cost exposure was
previously noted; repetition is now independently demonstrated.

`OutputDelivery.stream()` and `PreviewPlayback.stream()` authenticate ownership,
check the stored descriptor/expiry and call `streamArtifact()` on each request.
There is no shared cumulative byte/read allowance for that session/artifact.
The renderer bounds concurrent streams (four per session, 64 globally) and
deadlines (at most 60 seconds or descriptor expiry); this protects simultaneous
load, not successive reads. Existing artifact caps are 200 MiB for public final
output and 24 MiB for preview; final access expires after ten minutes, session
access after two hours.

Proof: open one synthetic, verified four-byte output and request it 30 times
sequentially through the real delivery class. **30 accepted fake reads, 120 bytes,
zero additional processing dispatches**. Verification/transport ports are injected;
this proves delivery-policy behavior, not an authorization bypass or real video
cost. A legitimately admitted visitor can repeatedly download their own output
or request ranges and metadata. No other visitor's media becomes accessible.

Existing protections: signed result/session/source/manifest/generation binding,
post-await ownership rechecks, expiration, exact Range/Content-Length validation,
private storage and cancellation. Retained-sample delivery already has its own
request/concurrency controls; do not remove or duplicate those.

**Proposed remedy:** one bounded, session-owned delivery policy at the existing
delivery boundary, covering preview/output/download aliases and metadata opens.
Reserve before renderer/storage I/O, account for actual requested ranges and
aggregate reads/bytes, and expire state with access. Size the allowance from normal
playback, seeking, refresh, weak-network retries and repeat download, with generous
headroom. A one-request/one-download rule would break normal browsers and is not
proposed. Avoid CAPTCHA for each seek or exposing/cache-sharing private media.
[SEC-03 plan](STRIDE_SECURITY_PLAN_2026-10-07.md#sec-03--bound-authorized-delivery-without-breaking-playback).

**Owner decision:** choose tolerable read cost versus generous repeat-download
behavior. Numeric thresholds remain undecided until synthetic normal-journey
measurements; no arbitrary restrictive constant is approved by this report.

## SEC-04 — Medium: renderer browser security baseline is outdated

**STRIDE:** Potential tampering/disclosure/privilege escalation through a native
dependency. **Confidence:** high for version drift, limited for exploitability.
**Origin:** newly documented dependency baseline finding. **Activation:** real
native rendering using this pinned image, independent of fake/live AI mode.

Remotion 4.0.532's installed browser-download code selects
`149.0.7790.0`. First-party `apps/renderer/scripts/stage-tools.ts` records that
version, and the Docker build stages the fixed binary and checks its hash/version.
The Chrome team's June 2 release is already on `149.0.7827.53` and includes
security fixes. The code's selected browser is before that published stable
security baseline. This is not covered by npm package advisory matching.
[Chrome security release](https://chromereleases.googleblog.com/2026/06/stable-channel-update-for-desktop.html).

The renderer processes a fixed trusted React bundle with local transcoded media
and bounded normalized JPEGs. It accepts neither arbitrary HTML/JavaScript nor
arbitrary remote assets. It runs as a non-root container user; render workers do
not receive Gemini keys. Those controls lower attack reachability. Remotion's
browser launch includes `--no-sandbox`; changing this blindly could break the
approved Cloud Run runtime and is not the proposed patch.

No exact current Linux-image SBOM/CVE scan or malformed-input native exploit was
performed. Browser version numbers alone do **not** prove that every later Chrome
CVE affects Headless Shell, the selected branch or this composition. Do not label
this a demonstrated RCE or upgrade its severity from Chrome's unrelated full
browser CVSS scores. The exposure is running a media-handling native dependency
without a current verified patched baseline.

**Proposed remedy:** select the smallest compatible patched Headless Shell/
Remotion combination with verified provenance and Linux image evidence. Keep
build-time pinning, hashes, fixed binary paths and zero runtime downloads. If a
Remotion upgrade is required, align renderer/player/composition/CLI pins and
revalidate the Player style hash/CSP. Scan the exact resulting image, including
Node/Debian libraries, FFmpeg/ffprobe, Sharp/libvips and Chromium; npm feeds cannot
substitute for this. Preserve visual timing, captions, audio, seeking and export
quality. This entails a separately authorized image build/deployment.
[SEC-04 plan](STRIDE_SECURITY_PLAN_2026-10-07.md#sec-04--refresh-the-native-renderer-baseline).

**Owner decision:** approve a compatible patch-and-image validation packet, or
defer native rendering release until its exact security baseline is established.

## SEC-05 — Medium: process loss leaves Google Files cleanup to provider expiry

**STRIDE:** Information-retention/disclosure exposure, availability of cleanup.
**Confidence:** high for loss of local deletion state. **Origin:** known provider
fallback limitation, now traced across server/restart boundaries. This is not a
publicly readable Google File or a claim of a false privacy disclosure.

`GeminiAnalysisProvider` creates a bounded `pendingFiles` map and assigns opaque
`files/cb-<uuid>` names before upload, so uncertain responses can still be deleted.
Its `finally` cleanup targets the known file and verifies deletion. Failed
obligations remain in that map and fence subsequent processing. `cleanup()` only
iterates current map entries. A hard kill/replacement loses the map; a new provider
object has no orphan inventory. `server.ts` closes its HTTP listener on signals;
it does not implement independent cross-restart Google Files discovery. The
renderer/GCS expiry sweep cannot delete a separate Gemini Files API object.

Failure scenario: an audio/video proxy finishes uploading, then the backend
disappears before verified deletion. Application-managed deletion does not resume
in its replacement process. Google documents automatic Files deletion after
**48 hours**. That fallback is distinct from GCS object/session/output TTL and
from any provider-internal data/abuse-log policy.
[Gemini Files retention](https://ai.google.dev/gemini-api/docs/files).

The privacy dialog already distinguishes delayed background removal and Google
retention. Normal deletion/uncertain-upload handling is implemented; this report
does not replace it or promise stronger vendor deletion than documented. The
material owner choice is whether extended provider-file retention after a normal
Cloud Run failure is acceptable for an owned/licensed demo conversation.

**Proportionate options:** (A) accept and document the provider fallback, retain
current explicit deletion and content-free incident diagnostics; **no new code**.
(B) if a shorter bound is required, add a bounded recovery sweep in the existing
Google adapter using an exclusive verified application project/key boundary,
opaque application-owned prefix and age threshold beyond all in-flight work.
Verify list completeness and deletion, leave unknown/active files untouched and
fail unavailable while recovery is unresolved. Prefix alone in a shared project
is insufficient proof of ownership. A broad “delete all provider files” or a new
database is not acceptable. Graceful-shutdown best effort helps but cannot solve
hard kills or establish an independent guarantee.
[SEC-05 plan](STRIDE_SECURITY_PLAN_2026-10-07.md#sec-05--choose-provider-retention-or-bounded-recovery).

**Owner decision:** explicitly accept fallback or approve narrowly scoped recovery.
Do not implement recovery before ownership and cross-revision safety are resolved.

## SEC-06 — Medium: unpaid HTTP work can saturate the public web service

**STRIDE:** Denial of service. **Confidence:** high for current code boundaries;
actual public exposure/capacity unknown. **Origin:** deployment design gap, not a
claim that Cloud Run lacks network-layer protection.

The public nonce-bearing documents require dynamic rendering. The analysis bridge
can collect up to 4 MiB for larger JSON actions before downstream backend
session rejection, and create long-lived upstream requests. Body/response caps,
five-second body deadline, abort cleanup and backend action admission all exist.
There is no shared frontend application-work admission bound before those awaits.
Many individually legal-size concurrent requests can consume aggregate memory,
connection and CPU capacity without reaching an AI dispatch. Diagnostic and
fixture routes have focused bounds, but are not a site-wide request gate.

The current bridge rejects non-localhost origins and uses a fixed loopback
backend. The intended public transport and Cloud Run request/concurrency/instance
settings are still CL-015 work and were not inspected. A future hosting change
that only replaces the local URL/gates would expose these work paths unless it
also supplies a bounded admission policy. No flood was sent to owner services,
and no exact requests-per-second/cost/OOM claim is made.

Existing platform request limits may substantially mitigate this; their actual
configuration must determine whether code work is necessary. Origin/Fetch Metadata
headers do not stop scripted clients. Financial controls (SEC-01) protect spend;
grant proof (SEC-02) protects visitor slots; media policy (SEC-03) protects delivery.
None substitutes for bounded unpaid HTTP workload.

**Proposed remedy:** first size and verify Cloud Run concurrency/instance/timeouts
against the actual container envelope. For the remaining gap, use a small shared
server-only request-admission responsibility at the earliest relevant frontend
handler boundary, with bounded state, no unbounded queue, short generic overload
response and guaranteed release on abort/error. Keep health and Exit cleanup
viable and size slots to normal JSON+media operation. Do not require an external
load balancer/WAF, permanent visitor identifiers, distributed limiter or new
account system by default. A proxy-only guard that does not cover the actual
render/body work must not be described as an aggregate memory limit.
[SEC-06 plan](STRIDE_SECURITY_PLAN_2026-10-07.md#sec-06--size-and-bound-public-http-work).

**Owner decision:** carry this into the public hosting packet; approve additional
code only if the verified platform envelope leaves a material gap.

## Dependency and supply-chain review

Both npm bulk and OSV batch feeds returned HTTP 200 on 2026-10-07, starting
11:22:13 UTC. The evidence records exact pins, feed times/statuses and matching
advisories. The feeds matched **two advisories**. A dependency-name match is not
proof that attacker-controlled input reaches the affected API.

| Package / advisory | Installed path and exploit prerequisite | Disposition and safe follow-up |
| --- | --- | --- |
| `braces@3.0.3`, GHSA-vfj7-8cjw-p6xm / CVE-2026-93687, upstream High | Root **development** `eslint-config-next@16.3.7` → `@next/eslint-plugin-next` → `fast-glob@3.3.1` → `micromatch@4.0.8` → braces. Vulnerability requires a deeply nested attacker-selected brace pattern. Not a production first-party request dependency; configured lint patterns are repository-controlled. | **Not ranked as a public-runtime finding.** No patch is listed by the advisory at audit time. Review parent tooling updates when available; do not fabricate a fixed override or remove lint. [Advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). |
| `uuid@9.0.1`, GHSA-w5hq-g745-h8pq / CVE-2026-41907, npm Moderate | Renderer production storage/auth chain includes `gaxios@6.7.1` → uuid. Advisory concerns v3/v5/v6 with caller-supplied output buffer/offset. Installed gaxios uses **`uuid.v4()`**; no first-party vulnerable API call was found. This is JavaScript buffer validation, not proof of native memory corruption/RCE. | **No reachable vulnerable API established.** Upstream fixes include 11.1.1; v4 path is outside the described flaw. Prefer a compatible parent update with storage/auth regression checks; do not force a transitive major upgrade just to suppress a scanner. [Advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq). |

Manual primary-source cross-checks matter because feeds can lag or encode incomplete
ranges. Next is pinned to **16.3.7** (and matching ESLint config); the September 30
official security release recommends **16.3.8**. This repository has no remote
image patterns, Pages Router, root catch-all page, metadata-image dynamic route,
Cache Components or Draft Mode. Therefore the listed production attack conditions
were not established here. The low development-only MCP issue is excluded from
ranked findings under the owner's “no minor stuff” scope. Include the compatible
framework patch in the release dependency-maintenance gate, then recheck exact
ranges/call paths. Do not infer safety from an empty Next feed result.
[Next security release](https://nextjs.org/blog/september-2026-security-release).

The installed 16.3.7 pin is also beyond the 16.3.6 fix for the earlier next/og
ImageResponse advisory, and first-party source does not use ImageResponse.
[ImageResponse advisory](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j).

Reviewed direct production families include Next/React/ReactDOM, Remotion/player/
renderer, MediaBunny, Express, Zod, Google GenAI/auth/storage, Sharp and Lucide;
their resolved transitive npm versions are included in the 844-pair query. No
additional matches were returned **by these feeds at that time**. Native Chromium,
FFmpeg, libvips, Debian packages, image provenance and a compromised-but-unreported
package are outside that negative result.

Supply-chain controls retained: exact manifest pins and lock integrity; pinned
package manager; restricted package build scripts; fake/off/network-isolated CI;
read-only CI repository permissions without deploy credentials; renderer build
context constructed from an explicit allowlist, rejecting symlinks and unexpected
inputs; production dependency deployment and non-root fixed runtime bundle/tools.
The approved context excludes ignored media, private env, captures and replay.
`COPY . .` without a root Docker exclusion file was investigated and **not retained
as a leak finding**, because the documented build uses that isolated allowlist.
Building directly from the whole checkout would violate the approved procedure.

## General threats checked without a new ranked finding

| Threat | Concrete controls/evidence | Remaining limit |
| --- | --- | --- |
| Session theft/forgery, CSRF and cross-session IDOR | Secure HttpOnly host cookie; SameSite Strict; canonical encrypted grant; constant-time checks; CSRF/origin/metadata gates; random IDs; session/source/result digests | Actual hosted cookie/TLS/proxy settings must be verified; a same-origin browser compromise can act as that visitor |
| Replay/double dispatch and race conditions | Synchronous action reservation before challenge await; consumed uncertain attempts; HMAC receipts; renderer CAS and source generation/preconditions; post-await access recheck | Per-process fencing is not a distributed global allowance or cross-restart result recovery |
| XSS and response/data leaks | React text rendering; no tracked dangerous HTML/eval sink; nonce CSP in production; safe error schemas/copy; private logs classify/allowlist fields | Actual Player/Turnstile/CSP compatibility and hosting logs remain deployment evidence |
| SSRF, credential forwarding and open proxy | Fixed Google/Commons/GCS/private renderer hosts; redirects disabled; no caller URL/remote renderer input; canonical provider upload capability checks | Do not loosen allowlists or add image remote patterns in deployment without a new review |
| Command/path injection and archive traversal | Fixed subprocess argv with no shell; opaque filenames/generated scratch; no archive extraction endpoint or arbitrary job descriptor input | Native parser vulnerabilities require exact-image scanning; see SEC-04 |
| Malicious uploads/decompression/resource exhaustion | MP4/codec/pixel/duration/byte constraints; declared upload size then actual inspection/hash; fixed transcodes; bounded JPEG decoding; stream/scratch/process deadlines | Individually bounded requests do not establish aggregate public capacity; see SEC-06 |
| Prompt injection/AI output escalation | No tool execution/search/arbitrary URLs; structured results validated against grounded source and selected range; deterministic compiler/fixed render layout; no generated image critique | Model quality/grounding and rights need owner evidence; no “prompt firewall” platform proposed |
| Logs, browser console and fake telemetry | Content-free private stage/status rules, browser technical output classified and relayed privately; raw payload/error suppression; browser telemetry labelled untrusted; diagnostic request/rate caps | Browser logs cannot prove a human identity; cloud/platform log retention/permissions need verification |
| Expiry, cancellation and resurrection | Terminal intents, all-generation deletion verification, retries/tombstones, late-upload orphan sweep, stream-reader cancellation and owned child cleanup | Actual scheduler and outages/revisions must be checked; Google Files process-loss is SEC-05 |
| Secrets/build artifacts/debug surfaces | No tracked private-key marker found; `.env.example` boundaries; browser dependency enforcement; production replay rejection; release-artifact verifier; approved isolated build context | Private ignored files were deliberately not scanned; owner must remove only the authorized replay copy at release checkpoint |
| SQL/NoSQL injection, account takeover, admin RBAC | No database, accounts, admin console, durable projects or direct publishing in approved product | Do not add these systems to solve demo-scale risks |

## Deployment/security evidence still required

These are **release gates, not alleged live misconfigurations**. Historical approved
private Linux image/cloud proof is recorded in the renderer guide; it does not
certify the exact current source/image or final public services.

| Gate | Evidence required before release | Owning work |
| --- | --- | --- |
| G-01 Public/private service boundary | Public frontend; authenticated private backend/renderer with purpose-scoped identities; fixed HTTPS service origins/audiences; no accidental unauthenticated private route; platform TLS/headers/cookie/host policy; ports bind injected PORT as required | CL-015 public transport/composition; retain current fail-closed paid policy until other gates pass |
| G-02 Abuse/spend/capacity | Owner budgets/quotas, service caps and revision overlap, overload behavior, spend-cap cleanup recovery; intentional response when paid work is disabled | SEC-01/02/03/06 decisions; deployment packet |
| G-03 Actual deletion | Bucket private/uniform/PAP and no versions/holds/retention/soft-delete, minimal CORS; independent 15-minute expiry with retries; terminal/late uploads; outages/signals/revision replacement; distinguish logical TTL from confirmed removal | Existing renderer/operations packet; SEC-05 acceptance/recovery |
| G-04 Current artifacts/dependencies | Exact Linux image digest/SBOM/native advisory triage, approved context/imports/binaries/licenses; compatible framework patch/recheck; final artifact excludes feasibility/debug code; production server rather than dev/Studio | SEC-04 and release-artifact gate |
| G-05 Provider and owner-only quality | Actual model/API restrictions and approved data/rights/retention terms; least-privilege identity/secret delivery; actual captions/pixels/audio/download/CSP/Turnstile/device checks | Owner-only paid/manual quality; separately approved cloud build/deploy |
| G-06 Local replay checkpoint | Remove development replay CTA/transport/cache loading and its explicitly authorized private saved copy; preserve original capture and retained owner master | Existing CL-007/CL-015 release checkpoint, not permission to delete private assets during this audit |

Cloud Run has specific ingress and service-to-service authentication controls;
application origin headers alone cannot replace them.
[Cloud Run ingress](https://docs.cloud.google.com/run/docs/securing/ingress),
[service identity tokens](https://docs.cloud.google.com/run/docs/authenticating/service-to-service).

## Validation of the audit itself

The final reasoning pass challenged each candidate against the actual current
call path and existing controls. It removed the suspected whole-checkout Docker
leak, vulnerable uuid API assertion, braces public-runtime DoS assertion,
unchallenged upload assertion, absent retained-sample rate-limit assertion,
production replay assertion and “all budgets are alerts-only” assumption. It
kept reset-safe session rejection distinct from resettable spend allowance,
concurrent stream limits distinct from cumulative delivery and vendor fallback
distinct from verified application deletion. It did not manufacture a Low list.

Each retained finding has an explicit prerequisite, source/proof basis, current
mitigation, narrower consequence, owner choice and functionality-preserving plan.
No finding is marked fixed. Native/image and live cloud gaps remain visible rather
than being converted into passed checkboxes. The associated evidence inventory and
report validation record establish what was actually checked. Findings are ready
for owner review; this audit does not authorize implementation or public launch.

Report verification passed: HTML/JSON syntax and scoped formatting, all 15 local
HTML document/heading links, unique IDs/accessibility label references, offline
resource constraints and simulated decision/filter/plain-text-note/export/restore/
storage-unavailable behavior. The report loads no external assets and sends no
data. Browser visual preview was blocked by the tool's local-file URL policy;
no alternate browser/server workaround was used. Codex's native file-panel open
was requested and returned queued. Visual rendering is therefore not recorded as
verified. Final source-input hashes remain identical; eight documentation files
were added/updated, the Git index is empty and HEAD is unchanged.
