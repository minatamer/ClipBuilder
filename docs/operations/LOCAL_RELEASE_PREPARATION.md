# Local release preparation

CL-015, 2026-10-03. Local packaging preparation only. No public deployment,
provider call, resource change, credential use or device/media test is authorized
by this document. The owner approved fake-mode implementation and sequential
commits through CL-015, and deferred actual testing and deployment.

The audited CL-014 parent is `6ccd9d4aa487e15db27ea1b0f978f6a5b396897b`.
[Release audit](RELEASE_CANDIDATE_AUDIT.md) retains its exact inputs and deferred
acceptance. CL-015 changes only the frontend build's artifact inspection, its
synthetic regressions and the owning documentation; the focused re-audit in
the release ledger must accompany any later immutable build. That local packaging
pass did not invent a hosting topology, public API identity adapter, container
family or provider configuration. The owner subsequently selected the public
Cloud Run frontend/private API topology, runtime-identity trust chain, initial
managed URL/manual releases and conditional public paid operating model in the
[CL-015 decision record](../tickets/CL-015-deploy-validate-measure-and-rollback.md#owner-release-decisions--2026-10-03).
Those choices are documented; their implementation and deployed proof are pending.

`FAKE_MODE=true` with no keys supports labelled fixtures and injected tests;
fixture Download remains disabled and these checks do not produce a real MP4.
Real Gemini analysis requires keys, enabled live flags and rights/data/paid
approval. Private storage/render compute requires independent IAM/cloud/spend
approval even with fake AI. No local AI model, weights or runtime are used.
End-to-end real processing, device and quality evidence remains missing.

## Retained owner demonstration source

On 2026-10-03 the owner authorized preparing the agreed continuous 7:41 excerpt
from the locally downloaded conversation and retaining it for local use. The
master belongs in the ignored `private/retained-demo-source/` directory. Its
generic local entry is `input.mp4`; `PRESERVE.md` and `manifest.json` are also
ignored. Original download names, source content and private checksum metadata
stay outside committed documentation. The original download remains untouched.

Choose local storage for this master. The current private GCS bucket is for
disposable session media; its expiry/sweeper/lifecycle policy must remain intact.
No cloud upload, resource change, provider call or application configuration
change is part of this preparation. Any later retained cloud sample needs a
separate owner-reviewed storage/delivery design outside disposable session
storage; this local decision does not establish that design or authorize it.

Preserve the entire retained-source directory during Clear/reset, cancellation,
expiry, scratch cleanup, release work and repository housekeeping. Do not run
`git clean -fdx` over it or treat `private/` as a temporary directory. Only an
explicit owner request naming this retained asset permits replacement/deletion.
The renderer's current scratch cleanup owns generated `clipbuilder-media-*`
directories under the operating-system temporary directory; it does not own
this master. Build delivery uses allowlisted renderer inputs and inspected
frontend artifacts, not a copied repository root containing private media.

For an approved real-source check, manually select this file through normal
browser file intake. Processing admits a separate upload and deletes that copy,
proxies, previews and outputs on the existing terminal/expiry rules. The retained
master has no session identity, cleanup intent or provider file handle. Do not
wire it into automatic startup, fixture routes, CI, build/public assets or a
sample-specific extraction shortcut. The system must analyze its actual content
and the visitor chooses one generated candidate through the ordinary flow.

Prepared-master verification: MP4, 461.000 seconds (7:41), 1280×720 at 25fps,
AVC video and stereo AAC audio, 58,268,450 bytes (55.57 MiB). Both tracks start
at zero and have 461-second durations. Strict native FFprobe frame decoding
(`-v error -err_detect explode -count_frames`) passed with 11,525 video frames
and 19,854 decoded audio frames; container/frame/profile and recommended
10-minute/250-MiB intake checks passed. Source/master SHA-256 and provenance are
kept only in the ignored manifest. The bundled FFmpeg lacks the default
`wrapped_avframe` encoder for a null-output decode command, so FFprobe performed
the complete decode check. Subjective picture/audio quality and sync were not
human-reviewed. No captions, overlays or source-specific candidate ranges were
prepared; this is the continuous input only.

Local FFmpeg preparation is API-free and AI-free, with no keys, weights or live
flags. `FAKE_MODE=true` still produces synthetic application results; preparing
this real input does not make fake analysis real. Gemini processing still needs
keys/live flags, transfer/rights and a bounded paid-call approval; remote rendering
retains its independent cloud/compute approval. Public/promotional rights,
subjective source/AI/output quality and real-device playback remain separate
unchecked gates.

## Existing build inspection

The frontend guide owns the commands. Normal frontend/root builds now run the
local artifact check after Next's standalone build. It inspects existing owned
output; it does not listen, copy files, read environment/secret inputs, call a
provider or follow source dependency links. Installed Next 16.3.7 output docs
were checked: standalone requires separately delivered `.next/static` and
optional `public`, so all three input trees are inspected.

The checker requires the eight current app entries, only framework Pages
entries, no rewrites and only Next's internal trailing-slash redirect. It
requires the traced server entry and hashes bounded regular files in standalone,
static and optional public. It rejects feasibility/test/private/media/model/
credential paths, the ten known harness script names even in nested first-party
assets, unresolved/special inputs and links outside their delivery tree.
Dependencies remain traced packages; this is a path/route/build inventory,
not a content scanner or a complete license/vulnerability assessment.

The inspection records file/link/byte counts and SHA-256 over sorted labelled
file digests and normalized link identities. It has a 20,000-file/link and 1GiB
inspection bound. This digest identifies inspected build inputs, not a signed
image or an attestation that a later host copied or routed them correctly.
Importing the checker starts no work. Errors emit only `release_artifact_invalid`.

Strict release verification is the default. Explicit `--local-build` permits
only known Windows package junctions into this repository's dependency store
when the corresponding copied standalone package is present; it records their
count and reports `selfContained:false`. It does not traverse those links.
The current Windows output has 26 such links. Strict verification rejects it:
**this host build cannot be accepted as an immutable deployment artifact**.
The later approved target-platform build must pass strict verification inside
its build workspace before any image is accepted. Do not ship source-store
junctions, blindly dereference them or interpret a local build pass as release
approval. Target-platform builds and immutable image scans remain unperformed.

Synthetic fixtures test stable/change-sensitive digests, ordinary accepted
output, forbidden harness/test/env paths, added routes, fallback rewrites,
unresolved public inputs and source-store junction rejection. The public-input
regression failed before narrowing the optional-directory exception: an ENOENT
inside an existing public tree was incorrectly treated as an absent directory.
The presence check now tolerates only an absent public root; nested failures
reject. The first real-build check also exposed an overbroad traversal check
that rejected the legitimate `[...path]` route; only a complete `..` segment is
now rejected and the synthetic fixture includes that actual catch-all shape.

Final build/check identity and focused re-audit are recorded in the ticket and
release ledger after the settled gates. Neither synthetic fixtures nor an old
private renderer image proves the current public release.

## Later release checkpoints

These are pending acceptance steps, not instructions to perform external work
now. Use the current migration authority and dated setup guide, recheck official
provider/platform docs and obtain the applicable owner approval first.

1. Implement/prove the owner-selected hosting/routing/runtime-identity topology
   and conditional paid operating model from the CL-015 decision record. Obtain
   approval for the concrete external actions before executing them. Browser
   bridges currently pin loopback; protected/paid nonlocal backend composition
   fails closed. Public transport/authentication and actual revision overlap
   safeguards still need implementation/proof. Keys alone cannot complete that
   work. Public sample/film rights remain unresolved. Paid-project policy intent
   is accepted, but actual provider settings/privacy copy and transfer evidence
   remain unverified. USD 10 project/USD 5 Cloud Run alert targets are confirmed;
   the latter still needs verification. Gemini's numerical monthly limit and a
   fresh bounded test allowance are deferred to paid testing: estimate and agree
   the allowance before dispatch, then measure actual cost. Resolve enforceable
   monetary controls, remaining license/rights notices, saved bucket/IAM/expiry
   policy and current source/device/quality/visual/film evidence before acceptance.
2. Build target-platform artifacts from the exact audited source and unchanged
   frozen lockfile. Record content-free source SHA, build configuration/toolchain,
   inspected input digest and immutable image digests. Run the strict frontend
   artifact check, current renderer context/packaging checks and authorized
   image/dependency/codec/font/license scans. Any correction gets focused re-audit
   and the required local gates before use. Earlier CL-006 Linux/private media
   evidence is dated, source-specific evidence, not this new image's acceptance.
3. Begin any approved hosted checkpoint fake, paid-disabled and all live flags
   off. Keep the renderer private and separate cloud-compute approval. Verify
   actual entrypoints/routing/caller-purpose/TLS/cookie/CSP/CORS/storage/cleanup,
   no-content platform logging and the exact current caps. No harness server or
   port 4185 may be in a public entrypoint, proxy or image. Verify the intended
   landing page at `/` and perform unpaid deployed negative GET probes below.
4. Only after the separate rights/data/live/spend approval, perform the approved
   bounded real-source flow: one source AI action, one selected combined plan,
   at most three proxy preparations and one confirmed render. Record actual call
   counts, aggregate bounds/cost, native pixels/audio/sync/parity, device download
   and original/proxy/output deletion. Lost/uncertain work never auto-replays.
   Do not claim timing, AI quality, maximum-source readiness or saved Download
   from synthetic metadata. Stop on duplicate dispatch, content leakage, budget,
   cleanup or quality failure without widening limits.
5. Demonstrate incident stop and rollback under approval. Disable the paid
   master and all live flags, close processing admission and prevent new cloud
   dispatch before revision/topology changes. Retain separately authorized
   expiry/deletion paths to drain owned work and retry failures. Restore exact
   prior audited image/configuration identities with paid processing off; inspect
   old/new revision overlap because process-local counters/epochs are not global
   monetary or exactly-once guarantees. Unknown actions stay consumed and are
   never reconstructed as a fresh paid retry. Incompatible journal/manifest
   versions require validated migration or cleanup. Check actual in-flight
   cancellation, source/proxy/output deletion, cleanup after outages, residual
   charges and no-content logs. A saved visitor download remains visitor-owned.

Required deployed 404 probes (all still **unverified**): `/main.mjs`,
`/worker.mjs`, `/sync-access.mjs`, `/mediabunny.mjs`, `/audio-extraction.mjs`,
`/audio-samples.mjs`, `/audio-profile.mjs`, `/opfs-access.mjs`,
`/media-errors.mjs`, `/audio-contracts.mjs`, and
`/feasibility/browser-media/index.html`. Inventory/probe any later proof paths.
A redirect, fallback landing page, hidden navigation or local loopback-only
harness is not an acceptable deployed 404 result. No harness HTML, controls or
code may be returned. Any exposure blocks public acceptance and requires a
build/routing fix and affected-input re-audit.

## Current decision

Local release preparation can be committed after clean validation and the five
root gates. Complete CL-015 deployment/live/measurement/rollback acceptance stays
unchecked. No app was launched, cloud resource inspected, immutable image built,
negative deployed probe run, paid request made or release enabled in this pass.
The local artifact check's `selfContained:false` is an explicit platform gate,
not a skipped code defect or a declaration of deploy readiness.
