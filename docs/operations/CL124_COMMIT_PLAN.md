# CL-124 — approved whole-file ingress verification commit plan

Owner authorization, 2026-10-28: run the protected real IP forwarding probe,
prevent supplied-header spoofing, enable settings only after success and stage/
commit anything needed. Baseline `45cccc3`. Eleven whole files, three commits.
Actual cloud diagnostic/config revisions are authorized narrowly in CL-124;
source-image release, resource changes, paid AI and push remain separate.

| Commit | Subject | File | Whole-file allocation |
| --- | --- | --- | --- |
| 1 | `CL-124: trust the verified native Cloud Run client suffix` | `apps/frontend/src/server/demo-client-ip.ts` | Select the actually observed final platform address behind the verified gate. |
| 1 | `CL-124: trust the verified native Cloud Run client suffix` | `apps/frontend/src/server/demo-client-ip.test.ts` | Observed one-hop, forged-prefix/alternate-header, IPv6 and malformed/bounded input regressions. |
| 1 | `CL-124: trust the verified native Cloud Run client suffix` | `apps/frontend/src/server/local-workflow.test.ts` | Current ingress-shaped forwarding regression and disabled-gate zero dispatch. |
| 2 | `CL-124: align ingress setup examples with Cloud Run` | `apps/backend/.env.example` | Correct native-ingress comment; actual values stay blank/false. |
| 2 | `CL-124: align ingress setup examples with Cloud Run` | `apps/frontend/.env.example` | Correct single trusted suffix comment; local gate remains false. |
| 2 | `CL-124: align ingress setup examples with Cloud Run` | `apps/frontend/README.md` | Explain the actually verified native topology and revalidation boundary. |
| 3 | `CL-124: record live spoofing checks and verified settings` | `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` | Latest narrow cloud authorization, verified correction/settings and remaining release gates. |
| 3 | `CL-124: record live spoofing checks and verified settings` | `docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md` | Actual red/green evidence, storage/IP completed gates, cleanup and release qualifications. |
| 3 | `CL-124: record live spoofing checks and verified settings` | `docs/tickets/README.md` | Current packet status/evidence. |
| 3 | `CL-124: record live spoofing checks and verified settings` | `docs/tickets/CL-124-verify-hosted-client-ip-and-enable-settings.md` | Scope, defects, exact checks/configuration/cleanup and honest limitations. |
| 3 | `CL-124: record live spoofing checks and verified settings` | `docs/operations/CL124_COMMIT_PLAN.md` | Exact complete-file allocation and staging rules. |

Verification applies to the settled combined snapshot: both regressions
reproduced red, eight focused fake tests pass, frontend types/lint/format pass,
corrected actual spoofing probes pass across both entries, direct unauthenticated
backend identity spoofing is denied, fixed frontend Linux build/runtime passes,
and named settings plus diagnostic cleanup are verified. No real AI quality or
maximum workload claim. Concrete cloud resources, tokens, raw IPs, private
settings and generated artifacts stay out of Git.

Before staging reconcile all eleven paths, require an empty index, freeze
contents privately and check exact names/whitespace per group. Afterwards verify
three commits with every allocated file once and a clean worktree/index.
