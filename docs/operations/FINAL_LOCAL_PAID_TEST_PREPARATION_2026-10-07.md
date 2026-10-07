# Final local paid-test preparation — 2026-10-07

Later owner evidence: the owner reports the complete local paid upload-to-export
flow working and authorizes CL-015-prefixed staging/commits and frontend/backend
deployment. The earlier scope/status below describes the completed preparation
checkpoint. The native public-processing gate remains open; hosted/domain,
Turnstile, spend/cleanup and rollback evidence are separate. See the latest
CL-015 owner instruction and release-preparation commit plan.


Status: local live-mode walkthrough ready; Linux frontend/backend packaging and
private renderer rollout verified. Public release remains blocked by the native
patch-provenance follow-up and owner/public acceptance below. CL-015 owns this
checkpoint. The owner authorizes all preparation
needed for a final manual local paid walkthrough, including the existing private
renderer update. Frontend/backend deployment and agent-paid processing are
excluded. Changes remain unstaged/uncommitted; this instruction does not repeat
the prior security packet's Git authorization.

## Preserved local behavior

Neither ignored `.env.local` is read, printed, copied or edited by the agent.
Backend/Next entrypoints load normal owner-managed local configuration.
Local origins remain `http://localhost:3000` and `http://127.0.0.1:4000`.
Existing paid defaults, the four approvals, paid-off precedence, fixed call
allowances, one selected candidate, preview, final export, download, restoration,
generic visitor errors and private content-safe diagnostics remain.

Only the temporary saved-analysis shortcut is retired. Ordinary **Use sample**
still previews the fixed retained master and **Find moments** performs fresh
protected analysis of its disposable processing copy. Uploaded sources use the
same normal path. Old replay journals fail schema validation and follow existing
safe workspace cleanup; they cannot become signed current results. Preserve
both retained masters, original provider captures and all existing private logs.

`FAKE_MODE=true` and no keys exercises labelled fixture/injected behavior; fixture
Download is disabled. Every automated test forces fake/paid-off/approval-off
before imports and blocks external provider access. There is no local AI model
or weights path. The final real flow requires the owner's configured provider
keys, Turnstile/live prerequisites and rights/data/spend approvals. Only the
owner runs that paid flow; safe GETs and synthetic image proof do not establish
real Gemini/output quality.

## Implementation and evidence so far

- Hosted bridges now resolve one exact server-only frontend/private API origin
  and audience. Local mode ignores optional hosted settings. Cloud Run metadata
  supplies one cached, bounded identity request; platform IAM and application
  verification receive separate identity headers. No visitor-supplied backend
  URL, identity, redirect or public environment secret is accepted. Backend
  verifies audience, exact caller email and verified email; forwarded protocol
  cannot bypass that verification. Each process admits at most eight active
  control HTTP requests, including authentication in progress after disconnect.
  Existing session/action/admission/delivery limits remain independent.
- Public processing defaults closed through
  `PUBLIC_PAID_PROCESSING_APPROVED=false`. Initial backend image defaults fake
  and paid-off. Enabling the hosted paid configuration requires production,
  revision, exact HTTPS `.run.app` origins/audience, frontend service identity
  and matching Turnstile hostname. This prepares future deployment; it is not
  public launch approval or evidence of deployed topology.
- The development replay CTA, browser API/flow, cache writes, server reader,
  routes and request schema are removed. Normal retained-sample processing and
  current request/call-count/cleanup tests remain. Existing historical
  diagnostic formats and log files remain readable.
- The film references eleven curated delivery assets, copied byte-for-byte
  from the approved synthetic UI captures/poster. Original vector artwork and
  timing/layout are unchanged. Twelve public assets, including a 96×96 raster
  export of the original SVG icon, have an exact hash allowlist. Capture index,
  authoring Studio, feasibility UI, private source and generated authoring
  directory are excluded from cloud build inputs. Production crawl rules open
  the landing while excluding `/start` and `/api/`; local/preview disallow all.
- Frontend/backend Docker recipes use the pinned Linux Node base and frozen
  workspace install. Frontend checks the actual self-contained Next standalone,
  static assets and curated public files; external source links are rejected.
  Backend deploys production dependencies and listens on injected PORT for
  nonlocal composition. Image contexts are allowlisted temporary copies, never
  the checkout. No frontend/backend Cloud Run service is deployed.
- Focused local tests pass for bridges, private caller/configuration, retired
  replay, workspace, crawl policy, image contexts and exact delivery hashes.
  All five root gates pass: format, lint, typecheck, unit tests and build.
  There are 1,239 passing synthetic tests in 108 files. The final idle-stream
  correction is included. Automated checks have zero provider calls. Linux
  frontend packaging and the final settled review remain distinct below.

## Linux build and scan iteration

The first renderer Linux build passes the synthetic fixed composition/media,
scratch scan and cancellation proof, including zero AI calls and zero owned
processes left. The first backend image builds. The first frontend image fails
on an exact optional-header type mismatch; local correction and focused checks
pass. Its cancellation request finds an already-failed build; no deployment or
duplicate build is inferred from an ambiguous CLI response. A renderer build
receipt mixed CLI progress with JSON and was recovered by read-only build
listing, without resubmitting.

The exact first renderer image is scanned with checksum-verified Trivy 0.75.0
from its immutable upstream release. No Artifact Analysis API is enabled. The
scan reports 414 installed-package advisories, including eighteen fixable
high-severity entries. Eight are inherited Debian PCRE2/Perl package entries;
ten are unused base-image npm tooling entries. All three runtime images now
apply available Debian updates and remove unused global npm/Corepack/install
commands. Build stages retain their pinned package manager. Rebuild/rescan and
the native proof are required before rollout; the first image is not released.

The corrected renderer scan reports 378 installed-package advisories and **zero
fixable high/critical findings**. The corrected backend reports 222 and zero
fixable high/critical findings. Reports are retained without suppression. The
renderer is updated only after the exact corrected image's synthetic and offline
runtime checks pass. The frontend build passes strict artifact inspection but
its isolated runtime probe initially uses the wrong loopback origin: the app
correctly returns 400 instead of reaching the absent API and returning 503.
The probe is corrected to canonical `localhost:3000`; application origin checks
are preserved. Formatting, lint and both context tests pass for that correction.
Its final rebuild and runtime proof pass. The exact frontend image reports 222
package advisories and zero fixable high/critical findings. The strict Linux
artifact contains 1,320 files, 29 internal links, **zero external package links**,
ten application routes and 45,111,787 bytes; inventory SHA-256 is
`21dfbf95eecfac17cf3206b433a0161119a117d12e8bf34e436ccfc9dd29ca81`.
The probe verifies all twelve asset hashes, landing/CSP/icon, robots, twelve
retired/harness paths returning 404 and generic API failure with the API absent.
Every runtime probe runs nonroot with external network disabled and no media
session or AI call. The earlier Windows build's 26 external links are not waived;
the accepted deployment artifact is the independently inspected Linux image.

Scanner severity is assessed against the exact shipped package and reachable
input; it is not silently suppressed. Initial critical labels include:

- [GLib CVE-2026-58016](https://security-tracker.debian.org/tracker/CVE-2026-58016):
  malformed D-Bus introspection XML causes an out-of-bounds read/DoS. Debian
  postpones it as a minor issue on Bookworm. No visitor D-Bus/introspection XML
  interface exists in this fixed authenticated media service. This is a
  reachability assessment, not a patched-package claim.
- [SQLite CVE-2025-7458](https://security-tracker.debian.org/tracker/CVE-2025-7458):
  requires arbitrary SQL with a crafted large ORDER BY expression list. The
  application has no SQL/database input; renderer paths cannot choose a database
  or execute queries. Debian classifies Bookworm as no-DSA/minor. No patched
  Bookworm package is claimed.
- [zlib CVE-2023-45853](https://security-tracker.debian.org/tracker/CVE-2023-45853):
  concerns contributed MiniZip code. Debian documents that affected MiniZip code
  is not built into Bookworm's zlib binary package. No source-only scanner label
  is treated as runtime exploitation evidence.

Current raw scan/native/cloud receipts are private OS-temp files. Committed
evidence will contain only image/input hashes, aggregate metrics and relevant
advisory dispositions, never registry/project/service/account identifiers,
credentials, media, capabilities or provider payloads. No scan can prove absence
of unknown vulnerabilities. Public/device/cloud deletion and owner quality/cost
acceptance remain separate.

## Bundled native tool follow-up: public launch blocked

The native receipt separately identifies vendor FFmpeg and FFprobe as `n7.1`.
Trivy's OS/npm inventory does not certify these copied compositor libraries.
The [vendor build recipe](https://github.com/remotion-dev/rust-ffmpeg-splitter/blob/main/compile-ffmpeg.mjs)
selects `n7.1` and compatibility patches; this is insufficient evidence of all
later security backports. [FFmpeg's security record](https://ffmpeg.org/security.html)
lists fixes in 7.1.1/7.1.2. In particular,
[CVE-2025-1594](https://security-tracker.debian.org/tracker/CVE-2025-1594)
affects AAC encoding, which this service uses. This is a real patch-provenance
gap, separate from scanner labels for disabled JPEG2000/OpenEXR decoders.
Exploitability of the exact constrained binary/arguments is not established by
a version string, and no exploit or owner media was run to imply it was.

Treat this as a **high-priority public release blocker**, not a solved risk or
a reason to rewrite rendering during the owner's final local walkthrough.
The current private renderer remains restricted to the existing configured
control/expiry identities; the owner test uses trusted owned/licensed source.
Public frontend/backend are undeployed and the hosted paid gate remains closed.
Do not enable public processing based on the package scan alone.

The correction plan is to establish the exact native library source/patch
provenance, then select a maintained compatible FFmpeg build with applicable
fixes while preserving Remotion's compositor ABI and required compatibility
patches. Do not blindly replace its shared libraries with a different major
version or add runtime downloads. Pin build inputs/checksums and retain the
existing codec, bitrate, timing, framing, caption and output contracts. Repeat
Linux source/audio preparation, selection/preview, both inline-picture
provenances, synthetic export/decode, cancellation/scratch cleanup and the
exact image scan before another immutable private rollout. Reconcile that
evidence in CL-012/CL-015 before public launch. This follow-up remains open.

Remaining OS labels are assessed by input/reachability. CUPS has no print
daemon/queue; X11 has no remote X server; util-linux/ACL/systemd-homed labels
require absent privileged operations; SQLite has no SQL input; gzip/Perl archive
utilities are not application media handlers; GLib D-Bus/config parsing is not
a visitor interface. The OpenSSL label concerns DTLS, while this service uses
HTTPS and fixed file/pipe media protocols. HarfBuzz shaping remains bounded by
validated caption/text sizes and rendering deadlines; Debian classifies
[CVE-2023-25193](https://security-tracker.debian.org/tracker/CVE-2023-25193)
as minor on Bookworm. These are scoped dispositions, not patched-package claims.

## Verified private rollout and normal local startup

The accepted renderer image is
`sha256:493c61edc98b4e9e209b8b0ef6f54ac4bc0e96a8c2a3f8b8ecfb324f733b6a06`.
The preserved previous immutable rollback digest is
`sha256:0e86d772841a3b9634fccf48cd1e99891ef0c594d44fca100123af0d25ed067c`.
Ready/latest traffic 100%, exact image and unchanged private IAM pass. A strict
first fingerprint check flags metadata drift and stops its verification claim;
a field-by-field revision comparison confirms the only nonimage changes are
Cloud Run's automatic single-container name and CLI-version annotation.
Environment/secret references, runtime identity, volumes, limits, resources,
timeout, concurrency and other operational specification fields are identical.
The prior revision remains available. No frontend/backend deployment occurred.

Use the **existing configured canonical audience**, which is a valid service
URL alias and differs from the CLI's returned service URL. No audience/origin is
rewritten. Authenticated health returns 200 with `{status:"ok"}`, anonymous
health 403, and `{}` at prepare returns safe 400 `invalid` before any operation.
The token remains in memory. Probes create no session, read no media and make
zero AI calls. Existing expiry/bucket/spend metadata receipts carry forward;
this image-only update does not prove actual deletion or spend enforcement.

The first normal start reads the owner's configuration and truthfully reports
fake mode. The owner then manually enables paid mode in `.env.local` and asks
for restart. Verified shutdown captures ten frontend and eleven backend
identities, with zero survivors/listeners through stabilization. The replacement
starts backend first, then frontend, with new private log files. Existing logs
and both `.env.local` files are preserved. Health, `/start` and safe sample config
all return 200. Safe configuration reports live mode and retained sample, local
media, analysis, assembly and final rendering enabled. No processing request is
sent to manufacture that result.

Current frontend supervisor/listener: **13664 / 12656** on 3000; backend:
**18284 / 19072** on 4000. Owned replacement trees contain ten identities each.
The owner URL is `http://localhost:3000/start`. Content-safe stdout/stderr,
process records and stop receipts are under
`C:/Users/minat/AppData/Local/Temp/clipbuilder-prepaid-20261007/runtime-paid-restart/`.
The prior run's files remain under its separate `runtime/` directory. For
shutdown, use that current directory's `stop-local.ps1 frontend`, then
`stop-local.ps1 backend`; it verifies captured PID creation times and stable
absence. Use normal repository startup after verified cleanup. Recheck records
if the owner restarts independently; these PIDs are dated evidence.

The authorized saved replay copy is absent. Its exact leaf path was checked
inside the private OS-temp replay directory before deletion; no recursive
cleanup ran. Four stale compiled replay outputs were removed only from the
verified backend dist directory. Original captures, retained local/cloud master,
media authoring assets, private diagnostics and logs are preserved.

## Owner's final local paid walkthrough

1. Open `/start` at localhost, use the trusted retained sample or owned/licensed
   upload, and confirm source playback and the normal challenge work.
2. Find moments, choose exactly one candidate and proceed through assembly.
   Confirm caption timing, selected framing and contextual visual quality.
3. Review, confirm one export, play the result and download the MP4. Check audio,
   visual/caption timing and the portrait output.
4. Check refresh/restore and seeking without duplicate processing. Exit/clear
   and confirm cleanup/revocation; record any pending provider lifecycle cleanup
   accurately. Keep findings and actual usage/cost in private owner evidence.

Agents performed only fake/injected/synthetic checks and the authorized native
build/nonprocessing health probes. Actual provider/image quality, billed cost,
real-source export/download/deletion and rights acceptance are still owner-only.

## Settled validation, file scope and identities

Reviewed the combined unstaged/untracked CL-015 change against base HEAD
`444bf242ee697e5ec0aa2d671891a6a5b3fb7f34`, with an empty index. Review is read-only;
no agent delegation, Git action or paid processing runs. The local application
has no new actionable code finding after correction. **Verdict: meets the local
preparation checkpoint with the explicit public-native concern above.** This
does not claim a clean public security/release verdict.

The earlier validation finds a real media-stream cleanup defect: eight idle
unconsumed response streams can retain the newly introduced control capacity
after timeout. The corrected abort path closes/cancels/unlocks the reader and
releases capacity without waiting for another browser pull. Its regression
proves eight cancellations and admission of a subsequent normal request.
Twenty-one bridge tests pass, followed by all five root gates. The separate
Linux probe-origin correction is test infrastructure only; its focused format,
lint, context checks and native image walkthrough pass. No repeated root build
runs over the owner's active frontend.

Coverage includes normal localhost configuration, hosted fail-closed
configuration/signed identity/origin/CSRF, bounded authentication and streams,
generic errors/private logs, removal of replay and old journals, preserved
normal retained/upload processing, exact delivery assets/film/icon/crawl policy,
closed build contexts, nonroot offline proofs, immutable private rollout and
normal process-tree restart. Existing provider call-count, admission, delivery,
refresh/clear/cancel/expiry and dependency-direction checks remain in the root
suite. No new dependency, unsupported cast, duplicate schema, debug listener or
public secret/configuration exposure is introduced. Diff check passes.

The [399-file source manifest](FINAL_LOCAL_PAID_TEST_PREPARATION_2026-10-07_INPUTS.json)
has SHA-256 `ac9a613f85adf91f198cab4de978a48775d9aeb0a0dfc0d8e4ad1ac104430726`.
The [structured evidence](FINAL_LOCAL_PAID_TEST_PREPARATION_2026-10-07_EVIDENCE.json)
records each exact image/context input inventory, native/strict artifact proof,
scan counts, private rollout, replay cleanup and safe local capability state.
Original cloud/raw scan/log receipts remain private in OS-temp. Renderer/backend
contexts predate only the frontend-only branch of the external mounted probe
origin correction; that script is absent from final runtime images. Their
runtime code/image inputs and their successful probes are unchanged.

Accepted immutable images:

- Renderer: `sha256:493c61edc98b4e9e209b8b0ef6f54ac4bc0e96a8c2a3f8b8ecfb324f733b6a06`
  — deployed privately; 65 closed input files.
- Backend: `sha256:ee577b0f55b1b0a97cc56a3f72a68a51ba62ae03a257888a1582cf4604bb4c56`
  — built/verified/scanned, undeployed; 96 input files.
- Frontend: `sha256:0840352b7ff0c0eb4a6e06880f6f11d8f352f01a431a2a3c5200216a49ca4391`
  — built/verified/scanned, undeployed; 161 input files.

The native renderer proof uses only synthetic RGB/tone/source/caption/assets.
It verifies manifest v3, two inline pictures plus generated provenance, word
cues and focus cuts, 15-second aligned source/audio, a 10.005-second output,
bounded scratch (7,527,476 bytes), successful cancellation and zero remaining
owned processes/AI calls. Matched Remotion 4.0.534 and Chrome 155.0.8059.39 are
verified by version/hash. This proves native compatibility for the fixed
synthetic journey, not real-source output/AI quality or FFmpeg patch coverage.

Changed file groups are frontend control routes/adapter and tests; backend
private caller/configuration and tests; replay removal across owning frontend,
backend and contracts; reviewed film assets/icon/crawl metadata; Linux image
recipes/context/runtime-proof scripts and tests; focused application guides and
owning release/source-of-truth/ticket records. Twelve synthetic public delivery
files are intentional release inputs. Build-generated Next type references
return to normal development paths on startup. All changes remain unstaged and
uncommitted. Full file identities are in the source/context manifests.

## Later public deployment gate

Do not deploy frontend/backend in this task. Reuse these exact accepted image
digests later, after explicit public deployment approval. Use the approved
public frontend/private API topology and Cloud Run runtime identities, no
service-account JSON. Grant only the frontend identity invoker access to the
private API, with signed application verification and exact backend audience.
Keep the API instance ceiling at one, frontend at two, min instances zero,
bounded concurrency/timeouts and paid off for initial hosted checks. Inject
private API/provider configuration at runtime; never use `NEXT_PUBLIC_*` for
private origins, audience, identities or credentials. Set the renderer's allowed
frontend origin only at the separately approved hosted checkpoint; local test
keeps its current localhost origin.

Actual public same-origin/platform IAM/hostname/headers/Turnstile tests,
old/new-revision overlap, traffic/dashboard review, Gemini key/project and spend
coverage, license/rights/privacy, actual deletion, paid kill switch and immutable
rollback remain unchecked. Eight HTTP requests or four media operations are not
a global process count or a spending guarantee. The existing USD 5 Cloud Run
configured spend-cap and private IAM/expiry/bucket receipts carry forward; no
new budget amount is requested. Hard-crash Files expiry remains the owner's
accepted up-to-48-hour fallback; ordinary explicit cleanup stays enforced.
