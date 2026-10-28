# CL-122 — provision the private demo usage ledger

Owner instruction, 2026-10-28: retain the existing Google Cloud Storage design
for this low-traffic demo and use the available CLI to set up its private bucket
and required permissions. This supersedes the earlier no-GCloud-access rule
only for this packet. Dependencies CL-114/115 are committed through `4dbef4e`;
the initial worktree/index are clean. No Redis or Firestore migration.

## Scope and authority

- Inspect only the existing ClipBuilder project's relevant service identities
  and storage metadata. Preserve the CLI's selected configuration; pass an
  explicit verified project on every management operation.
- Create or safely reuse one dedicated regional private bucket and the fixed
  `demo-usage-v1.json` object. Initialize only if missing, with a create-only
  generation precondition. Never reset existing usage or touch retained media.
- Enforce uniform bucket-level access and public-access prevention. New bucket
  uses Standard storage, no versioning/retention lock and soft delete disabled
  so frequent replacements do not accumulate historical accounting objects.
- Grant the existing backend runtime only object read/create/delete permissions,
  constrained to this exact ledger object. Delete permission is required by
  Cloud Storage when replacing object content; the application uses conditional
  generation writes and exposes no deletion operation. No frontend/browser grant.
- Use the existing CLI credentials without printing tokens, account/project
  identifiers or private resource names. Keep concrete setup metadata outside
  Git. Do not read ignored configuration or secret payloads.
- Verify bucket/object configuration, the narrow IAM binding and anonymous
  denial. If already permitted, impersonate the backend for bounded read and
  conditional unchanged-content replacement; verify stale writes are rejected.
  Never grant impersonation privileges just to make a proof pass.

This authorization covers the named storage/IAM setup and bounded verification
requests only. It does not authorize application environment changes, Cloud Run
revision changes/deployment, builds, API enablement, provider/AI requests, push
or new paid compute. Keep `HOSTED_DEMO_IP_VERIFIED` disabled until actual ingress
verification; the owner allowlist can remain empty. Record the bucket setting
privately for the later independently authorized release configuration.

## Acceptance and verification

- [x] Private regional bucket and exactly one initialized ledger exist, with no
      existing data reset or unrelated resource change.
- [x] Backend runtime has the exact object-scoped storage grant; no public or
      frontend/browser access is added.
- [x] Config/IAM/anonymous-denial checks pass. Runtime identity read/write and
      stale-write rejection are verified, or their exact permission gap is open.
- [x] Source of truth, release checklist and packet/index record actual evidence
      and preserve every remaining ingress/hosted/provider/release gate.
- [x] Read-only validate reports no actionable findings for this packet.

Existing no-key fake tests use injected storage and do not prove live IAM.
This packet's bounded storage requests exercise real GCloud storage, with no AI
or media. Real AI still needs keys, live flags, approvals and owner acceptance.
The owner's choice retains the known single-object rapid-write constraint;
this setup is not a capacity benchmark or proof against sustained abuse.

## Status

Completed storage provisioning. Metadata-only discovery verified the ClipBuilder
project, matching backend/frontend services in `europe-west1`, separate runtime
identities and no existing ledger bucket candidate. Discovery resolved the
application project explicitly without changing the CLI's selected profile.

Created one Standard bucket in that region with uniform bucket-level access,
enforced public-access prevention, disabled soft delete, no versioning, no
retention/lifecycle rule. Created the fixed object once with `ifGenerationMatch=0`
and the empty v1 ledger; no existing usage was reset. Administrator metadata/list
checks confirm the expected settings and exactly one ledger object.

Created a GA custom runtime role with exactly `storage.objects.get`,
`storage.objects.create` and `storage.objects.delete`. Its bucket binding names
only the existing backend runtime and has an exact object-type/resource-name
condition for `demo-usage-v1.json`. Policy inspection confirms no public member
or frontend binding. An initial inline-condition CLI attempt failed; the same
condition supplied through a private structured JSON file succeeded. No broad
permission fallback or extra impersonation grant was used.

Verified real GCloud storage using the existing permitted backend impersonation
and the actual current `demoUsageGcsStore` source adapter, without composing the
application or loading configuration. Read the pinned current generation,
conditionally replaced it with identical content, confirmed a new generation
and unchanged ledger data, then confirmed the old generation is rejected with
the adapter returning false. Backend bucket listing returned 403. Anonymous
object read was denied. Final role inspection verifies exactly the three
permissions and final object listing verifies exactly one object.

Direct frontend-identity read denial remains unverified: existing CLI permission
could not impersonate that identity. No permission was added to enable the
negative test. The identities are separate, and the inspected bucket policy
contains no frontend/public grant. This does not block the scoped storage setup.

Private context, condition file, verification script/result and later backend
setting handoff live under the owner-local OS-temporary setup directory outside
Git. No tokens were written to disk or printed; no ignored configuration,
secret payload, media, provider endpoint or app processing was accessed.

Remaining release work: inject the bucket setting through a separately
authorized application configuration/release change; verify actual trusted IP
ingress before enabling its flags; preserve the existing HMAC secret; exercise
hosted concurrency/IAM failure and current capacity/production image/owner real
AI acceptance as separately authorized. Real AI requires keys/live flags/owner
approvals. Storage setup alone does not enable or deploy the demo.

V122-final: **Meets ticket; No actionable findings.** Read-only review covers
the four-file documentation overlay over `4dbef4e`, current source adapter,
private setup evidence, exact role/condition/settings, create-only initialization,
data preservation, functional/negative checks and remaining gates. Scoped
whitespace and sensitive-metadata checks pass. No application code changed, so
no fake unit suite, native/browser proof or build rerun was needed. The actual
storage checks above are bounded authorized cloud operations, not fake evidence
or a load test. Deviation: none; frontend impersonation gap remains explicit.
Nothing staged/committed, pushed or deployed. Normal local app is preserved.

## Subsequent local commit authorization — 2026-10-28

The owner now authorizes deployment preparation and staging/committing anything
left. Finish this completed storage packet before the next preflight packet.
The earlier unstaged status describes its original handoff. Whole-file commit:
`CL-122: provision and verify private demo usage storage`.

| File | Allocation |
| --- | --- |
| `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` | Narrow owner cloud authorization and verified storage facts. |
| `docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md` | Completed storage gates and remaining deployment prerequisites. |
| `docs/tickets/README.md` | Storage packet disposition and evidence index. |
| `docs/tickets/CL-122-provision-private-demo-usage-ledger.md` | Full scope/evidence, limitations and this commit allocation. |

No application revision, deployment, provider call or private environment change
is part of this documentation commit. Verify exact staged paths and whitespace.
