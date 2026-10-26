# ClipBuilder security audit â€” 2026-10-26

Audit baseline: primary `cc4c7dc`, following `ca10def`. The current source was
reviewed; the earlier isolated CL-065 audit is historical and was not applied
or treated as proof. CL-090 owns this audit and any selected remediation.
Reports precede implementation. The owner's current AFK delegation permits
provisional local finding selection and local commits; personal acceptance is
outstanding. This is a proportionate source/advisory review, not a penetration
test, a complete vulnerability database scan or a production security clearance.

## Trust boundaries and scope

The public Next application accepts uploads and protected editing requests;
its server bridge authenticates to the private Express control API. Hosted
editing requires production/live/paid approvals, Turnstile admission and one
temporary bounded session. Local mode uses loopback/private server capability
discovery. Hosted excludes YouTube, the local source library, agent commands,
shutdown and fake-caption routes. The same bounded editor supports captions,
pictures, focus, filters and independent timed Text. Initial preparation retains
AI/native preview data; only explicit export produces the final edited MP4.

The backend holds provider credentials and owns a private loopback native worker.
The worker receives a fixed credential-free fake/paid-off environment, fixed
jobs/tools and generated paths. It processes real pixels/audio even when AI is
fake. Fixed React composition is shared with preview, not arbitrary HTML/CSS or
renderer code. Provider output is untrusted data; safe usable results survive
quality critiques, with no automatic provider retry. Media storage, capability
binding, resource limits, cancellation and private diagnostics remain relevant.

Reviewed entry points include frontend `server/control-api.ts`,
`server/local-workflow.ts`, `proxy.ts`, Next configuration and release packaging;
backend `src/app.ts`, admission/config/provider adapters and
`local/{server,hosted-runtime,hosted-workflow,hosted-upload,request-body,
workspace-files,local-mode,provider-ai,personal-picture,diagnostics}.ts`;
contracts `local/{policy,hosted-editing,editor,text-layers,text-style}.ts`;
renderer local/server/media/preview/render/overlay paths, media inspection and
owned process runner; closed-context/build/runtime verification scripts,
Dockerfiles and the lockfile. Existing adversarial synthetic tests were reviewed
alongside source. No ignored env, keys, retained media or private captures read.

## Findings ranked by practical priority

### SEC90-01 â€” High: admitted MP4 still reaches a vendor-vulnerable parser

**Open vendor/release risk.** Debian Bookworm's pinned
`7:5.1.9-0+deb12u1` FFmpeg and the pinned Windows `9.0.2` are in the affected
range of [CVE-2026-107678](https://security-tracker.debian.org/tracker/CVE-2026-107678).
Crafted MP4 encryption metadata can consume quadratic CPU and exhaust the
parser stack. The native probe runs before the application can finish validating
stream metadata. This is a real input format, so the existing `mov,mp4` allowlist
does not exclude it. No exploit media was created or executed during this audit.

Fixed file/pipe protocols, two streams, codec/byte/duration/disk ceilings,
bounded native work, deadlines, non-root containers and cancellation limit
exposure and recovery; they do not patch the parser. Native children have no
provider keys, but share their container's OS identity/filesystem/network scope.
Do not present a subprocess as a complete security sandbox. Hosted admission is
required for upload; local exploitation requires a malicious source supplied
to the owner. Container compromise is not demonstrated by this crash advisory.

**Plan:** retain as a public-release checkpoint. Track the maintained upstream
fix/backport and distro/vendor artifacts; verify actual fixed binaries, hashes
and all relevant native components, then run synthetic upload/probe/render/
cancel/cleanup parity in Windows and Linux. The
[Debian FFmpeg tracker](https://security-tracker.debian.org/tracker/source-package/ffmpeg)
also lists other open native issues; the shared
[HDR metadata issue](https://security-tracker.debian.org/tracker/CVE-2026-107676)
needs upstream/backport review for the admitted codecs, without assuming every
unrelated decoder is reachable. No currently verified drop-in release closes
the MP4 issue. Do not migrate distros, build an unreviewed parser fork, silently
drop MP4 support or claim a Node upgrade resolves this. Owner risk acceptance,
if chosen, must explicitly acknowledge the remaining risk before public release.

### SEC90-02 â€” High upstream / conditional app exposure: outdated Node images

All three Dockerfiles pin the official Node 22.23.3 image digest `43ac6c60â€¦` in
build/runtime stages. Anonymous official registry manifest/config lookup confirms
that version. [Node's October 21 security release](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)
provides 22.23.4 and 24.22.1, addressing memory-safety and network/TLS problems.
Attacker-controlled compressed data must reach the relevant decoder for the
memory-safety issue; this source review does not demonstrate an exploit through
ClipBuilder's identity-only upload routes. Fixed outbound destinations and
network/input restrictions narrow other preconditions. Updating the maintained
patch release is still justified for the exposed server/runtime foundation.

**Plan:** pin all stages to the verified official Linux/amd64
`node:22.23.4-bookworm-slim@sha256:ea11b74b986d520137cdef9a5346e447a00f275ecc4abc0055b7151226231e09`.
Digest was read from the anonymous `library/node` registry manifest on this
audit date; verify binary version after acquisition. Preserve Bookworm, native
ABI/tools, non-root identity, package-manager removal, build commands and
script-free dependency-fetch/offline-install layers. Build current closed
contexts and probe actual images locally with processing network disabled.
Never operate on G Cloud or call providers. The explicit host executable used
for this verification, `C:/Program Files/nodejs/node.exe`, was independently
checked as 22.23.4; no system runtime was changed. An earlier inferred 24.19.0
global-runtime concern is retracted for this executable. Other installations
were not audited. Linux acceptance and native vendor risk are separate gates.

### SEC90-03 â€” Medium: oversized collections amplify validation work

Contracts and applications pin Zod 4.6.5. Its collection maximum is checked after
element validation, so an authenticated editor can create excessive synchronous
validation/error work within the 1 MiB JSON ceiling. A safe in-process proof using
the actual `ownerTextLayersSchema` with 4,096 synthetic entries visited all 4,096
and produced 20,481 issues despite a maximum 10 layers. This is bounded by request
bytes and finite HTTP concurrency, not an unlimited-body or demonstrated OOM
exploit, but it unnecessarily blocks the single demo process. The same primitive
protects many arrays across contracts. No hostile request was sent to the app.

The [maintainer fix](https://github.com/colinhacks/zod/pull/6652) and
[4.6.6 release](https://github.com/colinhacks/zod/releases/tag/v4.6.6) move bounded
collection checks ahead of element traversal. Unbounded collections still need
their domain caps; upgrading does not make arbitrary schemas safe by default.

**Plan:** exact compatible4.6.6 across contracts/backend/frontend/renderer and
lockfile; no duplicate bespoke schema prechecks. Add a meaningful real-schema
regression asserting oversized Text/operation collections cause zero element
reads and one size issue, while valid payloads still work. Run all contracts,
local/hosted editing/provider-acceptance and UI/native proofs affected by the
shared schema change. No stricter Gemini semantic-quality gate or paid retry.

### SEC90-04 â€” Medium preventive maintenance: Next security baseline behind

Next/eslint-config-next 16.3.8 precede the
[October 14 security update](https://nextjs.org/blog/nextjs-security-update-october-14-2026).
[Server Action DoS](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r)
requires a Server Action; the shipped source has none.
[Cache Component RCE](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr)
requires a qualifying `use cache` function; neither directive nor cacheComponents
is enabled here. [SVG optimization RCE](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw)
is already mitigated by locked Sharp0.35.5. The older `next/og` advisory is fixed
before the current version and no ImageResponse exists. **No current reachable
Next exploit was confirmed.** Vendor guidance still recommends updating even
without the cache pattern, so take the narrow maintained security release
rather than relying on those conditions forever.

**Plan:** exact Next/eslint-config-next 16.4.1 together, current React retained,
frozen lockfile. Consult pinned Next guides; preserve standalone packaging,
Proxy/CSP nonce, origin handling, streamed uploads, route gates and all UI.
Build the current source without env files, inspect the release artifact and
run production bridge/CSP/host checks plus synthetic editor/native/browser
flows. Do not enable Server Actions/cache/SVG features or broadly upgrade tools.

## STRIDE coverage and controls retained

| Threat | Current evidence and residual limit |
| --- | --- |
| Spoofing | Exact origin/fetch-site and trusted frontend identity; hosted random 32-byte session secrets, hashed lookup, duplicate/invalid cookie rejection, __Host Secure/HttpOnly/Strict cookies and CSRF. Local capability stays server-side. Actual deployed IAM/TLS/hostname still owner-only. |
| Tampering | Strict schemas, source digest/baseHash/revision/operation binding, UUID/path/range validation, no arbitrary output paths; realpath/no-follow storage controls. New Text is bounded plain text with fixed fonts/colors/geometry. React escaping; no raw HTML or client command execution. |
| Repudiation | Existing safe private request/operation diagnostics retained, bounded content-free errors and explicit action/retry records. This anonymous disposable demo intentionally has no account/audit database; no invented forensic guarantees. |
| Information disclosure | Generic UI/bridge errors, diagnostic allowlists, isolated native env, no env in browser configuration, CSP/nonces, no-store media/responses; closed image contexts omit secrets/tests/private media. No tracked secret found by local content-safe pattern review. Not a full history/private-file secret scan. |
| Denial of service | Fixed request concurrency, admission/start/session caps, 1 MiB editor JSON, ordered bounded chunks, source/clip/image/workspace/disk/native limits, timeouts/cancellation/read budgets and expiry cleanup. CL089 covers cleanup failure recovery. SEC90-01/03 remain substantive parser/validation exceptions. Infrastructure DDoS/aggregate multi-instance costs unverified. |
| Elevation of privilege | Fixed renderer/overlay/jobs, protocol/container/codec restriction, no shell or arbitrary URL/tool/path input, non-root runtime and stripped installers. Provider outputs cannot execute code. Native subprocess shares OS privilege; vendor patch/isolation assumptions remain SEC90-01. |

Process-local admission/call ceilings are coherent only with the documented
single backend instance. The current source has finite provider/native budgets,
no automatic paid retry, explicit preparation reuse and fake/cloud-off controls.
This is not proof of global spend control across replicas/restarts. Actual Cloud
Run max instances, IAM, ingress, TLS, Turnstile, CPU/RAM/disk/timeouts and maximum
capacity must be verified by the owner before release; G Cloud is off limits.
No infrastructure allocation recommendation is applied or claimed measured.

## Dependency method and honest limits

Reviewed exact root/workspace manifests and lockfile, native pins and package
advisory surfaces. Consulted primary Next/Node/Zod/Sharp/Express/Remotion/Google
SDK and Debian sources. No `pnpm audit`, remote scanner, private repository
upload or inventory submission. Targeted advisory review cannot certify every
transitive package or build/native library. No malware package was inferred
from Zod's reverted repository incident: maintainers say the malicious commits
never reached npm. Installation changes must stay exact, frozen and auditable.
The lock still contains Zod 4.6.5 under the development-only React Hooks ESLint
plugin. It does not validate visitor input in the shipped application; no
blanket transitive override or claim of a fully cleared dependency graph is
made. All four direct application/contracts Zod pins are updated in remediation.

[Sharp's maintained advisories](https://github.com/lovell/sharp/security/advisories)
were checked against 0.35.5. [Express](https://github.com/expressjs/express/security/advisories)
listed older redirect issues, not a newly confirmed 5.2.1 issue here.
[Remotion](https://github.com/remotion-dev/remotion/security/advisories) and
[Gemini SDK](https://github.com/googleapis/js-genai/security/advisories) show no
published advisories on their current pages; that is not a native-library
clearance. Chromium/compositor/distro inventories require current actual image
evidence, separately from the npm graph. No paid/cloud/credential audit was run.

## Preserve these guards in future edits

- Keep public/hosted allowlists and exact server identity/origin/CSRF checks;
  never expose local acquisition/library/agent/fake-caption routes in hosting.
- Bound collections before work, plus total request/media/pixel/work budgets;
  keep deadlines, cancellation, failure-safe cleanup and no automatic paid retry.
- Keep native commands/assets/composition fixed and native env credential-free;
  recheck parser/vendor inputs after any format/tool/runtime change.
- Preserve safe operator diagnostics and generic UI errors. Never log media,
  prompts, provider bodies, capabilities, env values or raw exceptions publicly.
- Keep tests fake/no-key/paid-off and externally network-blocked before imports;
  use generated data. Owner-only real captions remain owner-only.
- Rebuild current internal worker after contract/composition/native changes.
  Verify source preview/export parity and package boundaries before handoff.
- Use exact patched dependencies/immutable runtime pins and closed build inputs;
  repeat appropriate local runtime proofs after upgrades. Do not mark owner,
  vendor, rights, hosted or paid acceptance from synthetic success.

## Selection and execution evidence

Reports were produced and inspected at 1440/390px before provisional AFK
selection of **SEC90-02/03/04**. Those local fixes are implemented and validated;
**SEC90-01 remains open**. No personal owner acceptance is inferred. Current
pins are Zod 4.6.6, Next/eslint-config-next 16.4.1 and the verified official
Node 22.23.4 Linux/amd64 digest above in all three Dockerfiles. Other direct
versions and native tools remain unchanged. Next regenerated only its frontend
AGENTS heading level; its substantive instructions are preserved.

Actual evidence:

- Both new actual-schema regressions failed before the update. Afterward, the
  same 4,096-entry Text input reads zero elements and returns one size issue;
  valid maximum-size Text and ordinary edit batches pass.
- Exact pinned full format/lint/types/unit gates pass: 146 root cases plus 1,728
  package cases, and 604 local cases/63 files. These broad gates followed the
  dependency updates. After the subsequent proof-helper corrections, affected
  lint/format and4 focused schema/closed-context cases pass, with the actual
  helper executions below. No unrelated repeated broad suite is claimed.
- Current closed frontend/backend/renderer images all build. Actual runtime
  probes run as non-root with read-only roots, no external network and no API
  credentials: frontend standalone/CSP/asset/origin/route checks; the actual
  bundled backend entry with paid routes off; renderer imports, fixed native
  tools/hashes and protected routes. No deployment or cloud build occurred.
- Current Windows Text browser and native proofs pass (2 cases): typography,
  timing, pointer gestures, responsive guards, save/discard/reopen and native
  timed rendering. The normal worker was rebuilt/reloaded through verified
  lifecycle ownership after contracts/dependencies changed.
- Current Linux shared editor/packaged worker proof passes: 8,388,731-byte
  chunked upload with source hash binding; initially empty fake content and
  disabled suggestions; one explicitly requested fictional caption through an
  injected fake port, one canvas PNG upload, saved captions/picture motion/Text,
  source-height 52Ã—90 one-second H.264/AAC export and decoded monochrome filter.
  Exact counts: 1 analysis transcription, 1 fake caption request, 0 selection calls,
  1 plan, 0 image-generation calls, 1 source inspection, 1 preview and 4 final native
  attempts including 1 canceled attempt. Retry reuses preparation; exit and expiry
  remove temporary work. Zero external attempts; measured peak container memory
  967,995,392 bytes and scratch 12,585,324 bytes on this small fixture. This is not a
  maximum-load or Cloud Run cost/resource benchmark.
- The legacy renderer's synthetic render/audio/scratch/process-cancellation
  proof also reran against the actual patched image with networking disabled,
  fixed image-owned tools and only owned temporary filesystem layout aliases.
  It passes; its build-time proof receipt is not the sole runtime evidence.
- Local content-safe pattern scan checked 823 tracked text files with no candidate
  private keys/provider tokens. Staged-file inspection additionally excludes
  secrets/media/build artifacts; neither is a full Git-history secret scan.

Verification fixes are explicit: the old runtime probe imported modules no
longer packaged separately; it now starts the actual backend bundle. Existing
source `gemini-pictures.test.ts` retains production factory/approval assertions,
rather than claiming those constructors were imported from the runtime image.
The older Linux walkthrough assumed auto captions/Earth image, an initially
checked suggestions box, 1080Ã—1920 final output and a fixed output revision. It
now makes synthetic content explicit, checks current defaults, derives native
geometry from the shared source-quality profile and uses the actual revision.
Its Export action waits atomically for an enabled, stable footer after Apply.
No product content/preview/export policy was changed to satisfy the proof.

Initial proof setup errors (missing public asset-manifest mount/fixture parent,
and omitted hosted=true) and stale-walkthrough runs are not passing evidence.
They were corrected and the final checks above passed. The Windows package
update used only cached dependencies with zero downloads/blocked external
attempts. Local Linux builds acquired public software packages/browser tools;
final application/native proofs were network-isolated. No provider spend,
ignored-env access, scanner export, G Cloud, deployment or push occurred.

The restored normal app is reachable at localhost:3000/start with API health,
start and configuration GET200, synthetic-ai/cloud=false. Runtime ownership and
content-safe logs remain in the existing OS-temp runtime record. Private source
masters/captures/logs/configuration are preserved. Owner real-AI/media/rights,
visual/security AFK review, actual hosted identity/resources/Turnstile and native
vendor resolution remain unchecked. The separate CL090 whole-file plan owns
the authorized local commit. Local success cannot waive the public-release gate.
