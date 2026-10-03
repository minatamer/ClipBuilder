# Local release preparation

CL-015, 2026-10-03. Local packaging preparation only. No public deployment,
provider call, resource change, credential use or device/media test is authorized
by this document. The owner approved fake-mode implementation and sequential
commits through CL-015, and deferred actual testing and deployment.

The audited CL-014 parent is `6ccd9d4aa487e15db27ea1b0f978f6a5b396897b`.
[Release audit](RELEASE_CANDIDATE_AUDIT.md) retains its exact inputs and deferred
acceptance. CL-015 changes only the frontend build's artifact inspection, its
synthetic regressions and the owning documentation; the focused re-audit in
the release ledger must accompany any later immutable build. No hosting topology, public API
identity adapter, container family or provider configuration was invented.

`FAKE_MODE=true` with no keys supports labelled fixtures and injected tests;
fixture Download remains disabled and these checks do not produce a real MP4.
Real Gemini analysis requires keys, enabled live flags and rights/data/paid
approval. Private storage/render compute requires independent IAM/cloud/spend
approval even with fake AI. No local AI model, weights or runtime are used.
Real media/device/quality evidence remains missing.

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

1. Approve hosting/routing/private caller identities and the paid operating
   model. Browser bridges currently pin loopback; protected/paid nonlocal backend
   composition fails closed. Public transport/authentication and actual revision
   overlap safeguards still need implementation/proof after those decisions.
   Keys alone cannot complete that work. Resolve rights, licenses, sample,
   provider data/retention, numerical hard monetary controls, saved bucket/IAM/
   expiry policy and current source/device/quality/visual/film evidence.
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
