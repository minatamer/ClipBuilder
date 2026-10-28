# CL-123 — current hosted deployment preflight

Owner instruction, 2026-10-28: do the necessary preparation for deployment,
report when ready and stage/commit remaining work. The owner then explicitly
asks whether trusted client-IP forwarding and current production/Linux,
capacity and owner-run real-AI acceptance have actually passed. They have not;
CL-122 completed only the private storage setup. Baseline `7d7fe71` is clean.

## Authority and boundaries

Depends on committed CL-114–122 and follows the current release checklist in
[hosted release preparation](../operations/HOSTED_EDITOR_RELEASE_PREPARATION.md).
Keep the accepted Cloud Storage ledger and owner-deferred FFmpeg decision.
This packet authorizes source/proof/documentation fixes necessary for current
preflight, secret-free local production/Linux builds and synthetic offline
runtime/native proofs, read-only relevant GCloud service/network/resource
metadata and non-processing checks. Prepare exact release settings and a
reviewable handoff; stage/commit cohesive whole-file groups under the owner's
new Git approval. Do not claim historical Linux proofs cover these new changes.

No ignored environment/secret payload reads, provider/AI processing, public
release, application deployment, cloud builds, paid compute benchmark, API
enablement, project-wide IAM expansion, DNS mutation or push. The owner-run
real-AI upload/export remains an owner-only gate requiring keys/live flags and
separate deliberate action. Changing an existing Cloud Run service creates a
revision: prepare those settings here rather than deploying prematurely.

## Work and file allocation

1. Inspect actual frontend ingress and public entry points, backend isolation,
   current CPU/memory/concurrency/max-instance/CPU-idle settings and local Linux
   engine capacity. Capture only selected metadata outside Git; never dump a
   service environment. Verify the actual trusted header suffix or document the
   exact missing proof. Never set verified-IP flags based on an assumption.
2. Build current frontend/backend production images through the existing closed
   `scripts/prepare-app-image.mjs` contexts, using anonymous Docker configuration
   and public dependency downloads only. No private owner files or credentials
   enter a build context. Leave the normal running local app untouched.
3. Run the existing network-isolated non-root image probes and current-source
   hosted native/browser proof. `scripts/verify-hosted-editing-linux.mjs` predates
   the mandatory CL-114 usage port and status envelope; reproduce its failure,
   then update only the stale synthetic wiring/assertions through the existing
   `test/demo-usage-fixture.ts`. Preserve native/export/editor/cleanup assertions.
   Add source changes only for confirmed preflight defects and allocate them
   explicitly here before editing.
4. Compare measured small-fixture memory/scratch and actual hosting settings
   with documented maximum bounds. The local Linux engine currently has about
   7.6 GiB total, so a small sample cannot certify a 16 GiB maximum-workload
   profile. Prepare exact capacity/settings requirements with honest gaps.
5. Update this packet, ticket index, source of truth and release guide with real
   evidence. Read-only validate the settled scope. Document exact whole-file
   commit groups before staging; commit all scoped work locally. Keep owner
   real-AI/visual/rights/hosted topology/capacity/release gates explicitly open.

## Acceptance

- [x] Actual ingress/resource metadata inspected without secret/env disclosure;
      client-IP verification is passed with evidence or its blocker is explicit.
- [x] Latest frontend/backend production images build; offline image probes pass.
- [x] Current packaged native/browser hosted proof passes with fake AI, explicit
      paid-off settings, no credentials/external network and owned cleanup.
- [x] Capacity evidence distinguishes measured fixture, local engine bounds and
      actual hosted allocation; no unmeasured maximum is claimed.
- [x] Exact deployment configuration/handoff and owner real-AI checklist prepared.
- [x] Scoped execute/validate is clean; exact whole-file plan and local commits
      completed. Public-release readiness remains conditional on unchecked gates.

## Status

Local preflight completed; public-release gates remain open. Storage packet is
committed as `7d7fe71`. No verification flags, service settings or deployed
application revisions have been changed. No provider request or cloud build ran.

## Evidence

Current Docker is Linux/amd64, 12 CPUs, 8,118,738,944 bytes total memory.
Both closed frontend/backend contexts exclude ignored config/media and compile
current source. Anonymous Docker configuration references the existing BuildKit
plugin without copying login settings. An initial legacy-builder invocation
rejected `--progress`; selecting the already installed plugin resolved the CLI
issue with no tool installation or Docker setting change.

Current production images built locally:

| Target | Local image ID | Build | Offline runtime |
| --- | --- | --- | --- |
| Frontend | `sha256:66468c5e5de5b5aac7e3bd234fc1f2e0b7173cec3e4a2c4f032c42d011396c98` | 34.84s | Pass, 1.59s |
| Backend | `sha256:8f5fe332fe75483bbd2c83487a317932a8259e8ed19ca755a021719d689ea6f7` | 39.99s | Pass, 1.12s |

These IDs identify local images, not a pushed registry digest. Public dependency
downloads occurred only during local builds. Runtime/native proof containers
use `--network none`, a read-only root, non-root user, four CPUs/4 GiB, bounded
temporary scratch/home and explicit fake/paid-off/live-disabled settings. No
host ports, credentials, private configuration or owner media are mounted.

The frozen original Linux proof failed with 503 capability/workspace responses
and a shared-browser-editor timeout (124.20s). It lacked the new mandatory usage
port and injected client identity; its later cleanup assumed the old session
envelope and no completed-trial restriction. Updated only this existing proof:
reuse `demoUsageFixture`, inject controlled synthetic client identities, assert
a post-export new session is denied, then use another synthetic identity for
the existing expiry case and assert the full current status envelope. Original
native/editor assertions remain; no product gate was relaxed.

Current-source hosted proof passes (28.61s): 8,388,731-byte chunked upload,
hash binding, explicit fake captions/uploaded picture, timed Text, caption and
picture position/motion state, decoded monochrome filter, native export,
cancellation/retry reuse, exit/expiry cleanup and post-export quota denial.
Counts: transcription 1, caption 1, AI selection 0, plan 1, generated image 0,
inspection 1, preview 1 and final-native attempts 4 (one canceled). Non-loopback
Node attempts: zero; container external networking disabled. Output is 52x90,
30 fps, one second, 24,730 bytes. Peak memory 961,482,752 bytes; scratch
12,221,838 bytes; declared reservation 3,766,485,353 bytes. This small fixture
does not prove maximum source/clip/4K/60fps capacity or real AI quality.

Fresh read-only Cloud Run metadata: both frontend/backend remain one CPU,
512 MiB, concurrency eight, max one, 360-second timeout and CPU throttling true.
Backend policy has no public invocation binding. A single native Cloud Run
domain mapping exists. The stable CLI mapping subcommand was unavailable; the
installed beta read command succeeded. Compute forwarding-rule metadata is
unavailable because the API is disabled; it was not enabled. This metadata
does not prove the two-address received header suffix assumed by the parser.

Exact private ledger/resource settings, service/domain/resource identities and
image/context/log paths are stored outside Git. Candidate backend allocation:
four CPUs/16 GiB, CPU always allocated, min zero/max one, concurrency eight,
timeout 360 seconds; existing frontend/identity/secret/origin settings preserved.
The checklist in the release guide owns owner-run real-AI and final acceptance.
Only the existing synthetic proof changed; no provider, worker/composition,
frontend application or hosted quota implementation was modified.

## Remaining release gates

- Actual controlled header probe through the native and custom-domain entry
  points, including supplied-prefix spoofing/direct bypass; flags stay disabled.
  Existing service metadata does not reveal application-received headers. A
  protected probe/release-candidate revision requires a separately authorized
  deployment; no permanent public debug/echo route was added here.
- Maximum source/three-clip/native export capacity and resource/cost acceptance.
  The current 512-MiB backend is unsuitable, while the local engine cannot
  certify the 16-GiB target. No Docker allocation or cloud resources were changed.
- Bucket/verified-IP setting injection when actual ingress is proven, plus
  hosted concurrency/IAM-failure checks and owner real-AI upload/export using
  configured keys/live flags/approvals. Agents do not run paid AI acceptance.
- Owner visual/physical-device/rights/security/release signoff. The previously
  owner-deferred FFmpeg risk remains unresolved; this packet does not reopen it.

## Whole-file commit plan

The owner's latest approval covers local staging/commits of all scoped work.
[Exact allocation](../operations/CL123_COMMIT_PLAN.md) assigns six whole files
to two commits, ordered after the completed CL-122 commit. No partial staging
or source rewriting; private artifacts and settings stay outside Git.

## Final read-only validation

V123-final: **Meets the scoped preflight ticket; No actionable findings.**
Reviewed the six-file settled overlay over `7d7fe71`, actual red/green/image
records, safe selected cloud metadata and private handoff. Verified fixture
reuse, clock/identity separation, exact denied/status assertions, preserved
native/editor functionality, secret-free build/runtime isolation, owned cleanup,
no application bypass and honest release gaps. The original failure and current
passing native/browser proof are recorded above; affected Prettier/ESLint and
whitespace checks pass. No full unit suite was required for this proof-only
change; actual current production builds/runtime/native checks answer the gate.

Both image probes and corrected hosted proof containers are removed. The normal
local app remains healthy (200), fake/synthetic with live analysis/assembly/
render off. Concrete private cloud/resource values are absent from the scoped
documents. The approved two local commits record this proof fix and evidence;
final exact-path, staged-whitespace, committed-allocation and clean-worktree
checks accompany the commit sequence. No push or deployment. Actual ingress,
maximum hosted capacity and owner real-AI/visual/rights/release acceptance are
unverified, so this verdict does not establish public deployment readiness.
