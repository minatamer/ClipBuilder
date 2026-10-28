# CL-124 — verify hosted client IP and enable verified settings

Owner authorization, 2026-10-28: run the actual IP forwarding probe, verify that
visitor-supplied headers cannot spoof the selected network identity, then enable
the verified settings only after success and stage/commit scoped changes.
The owner separately asks about CPU settings; resource changes are not approved.
Dependencies CL-114–123 are committed through `45cccc3`; worktree/index are clean.

## Narrow cloud authorization and safety

This supersedes the older no-deployment instruction only for a short-lived
authenticated diagnostic revision using the existing frontend image/config,
temporary routing needed to reach the real custom-domain entry point, cleanup
and the final named settings update. Preserve normal application behavior,
images, identities, secret references, resource/CPU settings, origins, IAM and
other traffic tags. No source release, registry push, cloud build, paid AI/media
processing, secret/env-file read, API enablement or DNS change is included.

- Snapshot only relevant service/image/command/traffic metadata privately.
  Use explicit project/region. Preserve an exact traffic/config rollback.
- Compile the actual `hostedDemoClientIp` helper into a temporary startup wrapper
  ahead of the unchanged Next server. Intercept one dedicated diagnostic path;
  require a random bearer token, persist only its verifier, enforce a short
  expiry, return no raw addresses/headers/secrets and send no-store responses.
  All other requests use the original server. No permanent app route is added.
- Validate the wrapper locally against the current production image before
  Cloud Run use. Start the diagnostic revision at zero traffic, verify its tag,
  temporarily route the existing domain for the bounded tests, then remove
  diagnostic routing and restore the normal entry command, including on failure.
- Probe the managed URL and actual custom domain: baseline, forged XFF prefixes,
  malformed prefixes, duplicate/case variants and forged client-IP/Forwarded/
  X-Real-IP/CF-Connecting-IP headers. Compare coded selected identities across
  requests/entry points. Also verify unauthenticated access is denied and normal
  application pages still work. Do not record raw IPs or bearer tokens.
- If the existing suffix assumption fails, keep flags disabled. Reproduce/fix
  only confirmed extraction/bridge defects, add focused realistic regressions
  and repeat actual probes before enabling anything. Do not guess a proxy chain.
- After all required checks pass, enable backend/frontend
  `HOSTED_DEMO_IP_VERIFIED=true`, include the already provisioned backend ledger
  setting, preserve all other config and verify the resulting revision metadata
  and non-processing health. If any check fails, leave verification disabled.

## File allocation and checks

This packet, ticket index, source of truth and hosted release guide own scope,
actual evidence, cleanup and remaining gates. Ephemeral probe bootstrap,
management scripts, coded results and concrete cloud metadata stay outside Git.
If a product fix is required, allocate only frontend `demo-client-ip.ts`, its
existing unit test and relevant `local-workflow.test.ts` assertions first; read
the frontend instructions and pinned Next docs. Keep local bypass unchanged.
No backend resource change or renderer/worker change belongs here.

Confirmed allocation: update the three frontend server extraction/bridge files
above for the observed single appended Cloud Run address, plus the frontend
README and both committed `.env.example` comments so they no longer describe an
external load-balancer two-address contract. Example values remain blank/false;
no ignored environment changes. Add an exact commit-plan document after evidence
settles. Rebuild the current source frontend Linux artifact after this source fix;
the unchanged backend image evidence remains valid.

Use execute/validate to no actionable findings, focused fake/no-key units for
source changes, the real bounded header probe, exact config/traffic cleanup and
whole-file allocation/whitespace/privacy checks before authorized local commits.
Preserve the normal local fake app. Real AI still needs keys/live/approvals and
the owner's manual action; header verification proves no AI quality/capacity.

## Acceptance

- [x] Protected expiring probe works locally without leaking raw headers/IPs.
- [x] Actual managed/custom-domain spoofing probes pass for the source helper.
- [x] Diagnostic startup/routing is removed and normal app behavior is restored.
- [x] Named settings enabled only after success; unchanged images/resources/
      identities/IAM and no provider calls verified.
- [x] Scoped review, evidence/docs and exact authorized local commits complete.

## Status

Completed verification/configuration; scoped commits follow the exact plan.
Resources remain unchanged. Fresh read-only CPU comparison requested
by the owner found the other five projects use one vCPU per Cloud Run service;
ClipBuilder's separate existing renderer has four CPUs/8 GiB, while its current
frontend/backend each have one CPU/512 MiB. These observations do not validate
the shared backend's maximum capacity or authorize allocation changes.

## Actual red/green evidence

The authenticated expiring probe was validated locally against the current
production frontend image: normal app GET, unauthorized denial, method bound
and coded-only response passed. Bootstrap includes the actual bundled source
helper. Tokens stay only in operator memory and request headers; only the
one-way verifier and coded result shapes are retained privately. The wrapper
precedes the unchanged server, requires a dedicated path/token, expires after
20 minutes and uses no-store responses. It is not copied to production images.

The first real managed/custom-domain run exposed one platform-appended address
on each entry. Baselines failed; a single supplied prefix produced two addresses
and the old helper selected index zero, while multiple/duplicate prefixes made
it select the last supplied prefix. This is a confirmed extraction bug, not a
capacity concern. Verification flags were not enabled during the failed run.

Focused regressions reproduced two failures (1.29s): one-hop baseline throws
and the authenticated bridge forwards a spoofed prefix. The fix changes only
the selected suffix to the final native Cloud Run address, retaining explicit
verification and IP/length bounds. Tests cover IPv4/IPv6, arbitrary supplied
prefixes/alternative headers, missing/malformed/port-bearing/oversized suffixes
and disabled-gate zero dispatch. Eight tests now pass (814ms); frontend typecheck
and scoped ESLint/Prettier pass. Local mode/discovery/cookie/CSRF behavior remains.

The second real probe passed on both actual entry points. Each suite covers
baseline, single/multiple/malformed/duplicate/mixed-case XFF prefixes, alternative
client-IP headers, oversized input, unauthenticated access and normal app health.
Accepted requests select the same coded identity across origins and forged
headers; invalid requests are rejected. Direct backend GET with forged client
identity and no authentication is denied before application processing.

Cloud cleanup initially selected the still-serving `latestReady` pointer after
creating a normal zero-traffic revision. Actual v2 command/readiness metadata
identified it; route the created normal revision instead, then remove the probe.
Both runs are fully cleaned up: original image/default startup restored, no
diagnostic tag/revision remains and no owned local probe container remains.
Private coded red/green records retain the exact failure/fix and cleanup facts.

Only after the passing corrected source probe and cleanup, enabled
`HOSTED_DEMO_IP_VERIFIED=true` on both services and configured the prepared
backend ledger bucket. Named-setting projections verified only the new values;
no service environment dump or secret/ignored configuration read. Config
revisions were explicitly routed by created revision ID. A post-update assertion
initially expected full-path traffic revision names; the v2 API returns short
names. Normalized the metadata comparison, verified the already successful
backend update and completed frontend. Both settings are verified, the normal
config bridge is 200 and images/resources/identities/ingress are unchanged.

Rebuilt the fixed-source frontend Linux image (30.42s), then passed the existing
non-root read-only offline asset/CSP/route runtime probe (2.34s). This local image
is not pushed/deployed. The unchanged backend needs no image rebuild for comment
edits. No AI/media processing, worker/composition change or full-suite rerun.

Existing deployed app images remain in place; their new editor capability route
is still 404. These settings and the source fix prepare the forthcoming release;
they do not claim the new quota/editor workflow is publicly active. Owner
real-AI, capacity/cost, visual/physical/rights/security and release gates remain.
Known IP/VPN/shared-network and single-ledger rapid-write limits are unchanged.

## Exact whole-file commits

[CL-124 allocation](../operations/CL124_COMMIT_PLAN.md) assigns eleven whole files
to three ordered local commits. Private probe/bootstrap/config/artifact records
stay outside Git. Do not stage screenshots, logs, generated contexts, tokens,
addresses or concrete cloud identities/settings. No push is authorized.

## Final read-only validation

V124-final: **Meets ticket; No actionable findings.** Reviewed the eleven-file
settled overlay over `45cccc3`, the private coded red/green probe records,
actual named-settings/profile/cleanup evidence and current fixed-source Linux
artifact/runtime results. Covered the confirmed single-suffix extraction defect,
IPv4/IPv6/malformed/oversized input, spoofed prefixes/alternate headers, unchanged
local behavior, disabled-gate zero dispatch, authenticated bridge handling,
real ingress/private-backend negatives, no sensitive metadata in source/docs,
exact cleanup and preservation of images/resources/identities/config boundaries.

Focused units, frontend types, lint/format and actual fixed production build/
offline runtime pass. Source changes need no backend/native reload or unrelated
full suite. Normal local app remains fake/no-key and paid-off; real AI still
requires keys/live approvals and owner action. Bounded actual GCloud probe/config
requests above are real verification, not fake AI evidence or a capacity test.
The approved three whole-file local commits record this settled result; final
allocation/hash/staged-whitespace/clean-worktree checks accompany that sequence.
No push or product-image release; capacity and owner real-AI/release gates stay
open. Deviation: none. Probe cleanup and metadata-shape corrections are recorded
above rather than being hidden as first-pass successes.
