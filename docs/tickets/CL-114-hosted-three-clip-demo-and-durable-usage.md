# CL-114 — hosted three-clip demo and durable usage limits

Owner AFK request, 2026-10-28: recommend and implement hosted abuse controls;
three clips total across manual/AI inputs, clear correction/toast, exhausted
entry screen and an owner IP allowlist. Localhost retains existing owner limits.
Depends on CL-061 and completed visual commit `09fb914`.

## Adopted recommendation and authority

One successful demo per network address per rolling 24 hours, not a lifetime
IP ban. Reserve the address for the existing two-hour session before work;
complete its allowance when the first export is successfully produced, whether
downloaded or not. Failed/abandoned reservations expire with their session;
retries/editing/downloads remain available in that same session. One source
and at most three prepared clips cumulatively per session. Manual rows take
priority; AI count is corrected to the remaining shared slots. Enforce limits
server-side before work. Owner allowlist bypasses visitor frequency/clip limits,
never authentication, safety or global spend/resource caps. No provider retry.

Persistent accounting uses one private, bounded, generation-conditional Cloud
Storage JSON object with keyed network digests and bounded usage records only.
This narrowly supersedes the historical no-durable-quota/no-cloud-object rule;
no accounts, database or durable media/projects. Global UTC-day ceilings:
20 admitted sessions, 100 provider dispatches and 200 native jobs, across all
instances/restarts including allowlisted use. Charge before work; failures keep
charges. Missing/unavailable/corrupt/conflicting storage or unverified IP ingress
fails closed. No actual cloud access/setup is authorized here.

An IP is a network signal, not a person: shared networks share an allowance;
VPNs/mobile address changes evade that signal. Global caps still bound work.
This is not a monetary guarantee or permanent per-person promise.

## Allocation and acceptance

- Shared hosted policy/status schema. Backend hosted-only quota domain/store,
  runtime/config composition, one-source, analysis and cumulative batch limits,
  and export-completion hook. No Node in shared contracts.
- Fixed empty server-only IP allowlist; canonical IPv4/IPv6. Authenticated
  frontend derives the client from the explicitly verified Google LB chain,
  never the browser's claimed client header/leftmost forwarded value.
- Selection controls share three slots and correct excess with an accessible
  themed toast. Exhausted entry replaces upload; active editors/downloads stay.
  Short Privacy disclosure; blank example config and deployment prerequisites.
- Fake/paid-off/no-network tests: mixed manual/AI, direct API bypass, repeated
  source/batch, export before download, retry/expiry, concurrent CAS, restart/
  shared store, unavailable/corrupt storage, spoofing, allowlist/global caps.
  Relevant units/types/lint/format and guarded desktop/phone UI states.
  Execute/validate/fix until no actionable findings.

Research: [Express proxy trust](https://expressjs.com/en/guide/behind-proxies/),
[Google LB addresses](https://docs.cloud.google.com/load-balancing/docs/https#x-forwarded-for_header),
[Storage preconditions](https://docs.cloud.google.com/storage/docs/request-preconditions),
[Cloud Run state](https://docs.cloud.google.com/run/docs/container-contract#file_system),
[OWASP limits](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html).

Checks need no keys. Real AI requires keys/live flags/owner approvals. Hosted
enforcement additionally needs owner-provisioned private ledger/IAM and verified
ingress. No deployment/cloud access or Git mutation for this new ticket; prior
commit authorization was visual-only. Physical/visual/live/hosted acceptance open.

## Status

Owner follow-up CL-115 supersedes this packet's original code-owned allowlist:
addresses now come from backend-only `HOSTED_DEMO_OWNER_IPS` in private
environment configuration. The retired `demo-allowlist.ts` module and instructions
to put owner addresses in source no longer apply. All CL-114 usage/security
limits and prior verification evidence otherwise remain unchanged.

Implemented and locally verified. Not deployed. The preceding visual work is
committed as `09fb914`; CL-114 remains unstaged for owner review.

### Files and delivered behavior

- Shared `packages/contracts/local/hosted-editing.ts` owns policy, status and
  shared input correction; `runtime.ts` exposes the hosted clip limit/exemption.
- Backend `local/demo-usage.ts`, `demo-usage.gcs.ts`, `demo-allowlist.ts`, hosted
  workflow/runtime and `src/config/env.schema.ts` own durable atomic accounting,
  IP normalization/digests, readiness and owner exemptions. Internal provider
  media uses the same charged native port; no raw native bypass is composed.
- Backend `local/server.ts` and `clip-batch.ts` enforce shared inputs, cumulative
  clips and completion after physical export validation, before publication.
  Retired portrait POST is excluded from the shared hosted transport allowlist.
  One-source admission survives workspace deletion; no download is needed to
  consume the successful trial. Local constructor defaults remain ten clips.
- Frontend server `demo-client-ip.ts` and `local-workflow.ts` replace client
  identity headers over the authenticated bridge. Selection, batch and experience
  components, `demo-limit-toast.tsx`, `demo-limit-screen.tsx` and `style.css` own
  correction, truthful batch-limit feedback, exhausted intake and session reset.
  The body portal prevents toast clipping by the workflow surface; dismiss target
  is 44px and its six-second timer cleans up. `privacy-dialog.tsx` discloses coded
  network accounting in hosted mode.
- Owning backend/frontend/feature READMEs, blank `.env.example` entries, source
  of truth, release preparation and index document setup and limitations.
  Existing hosted tests/native proof, new domain/store/proxy tests, synthetic
  `test/demo-usage-fixture.ts`, `owner-demo-limits.proof.ts` and deterministic
  environment setup own the regression evidence. No dependencies were added.

### Verification actually produced — 2026-10-28

- Combined local affected units: 52 passed (4.66s), including clip-batch and
  runtime-capability regressions. Three later race/failure cases were added;
  the final narrowed hosted/quota pass is 19 tests in five files (3.54s).
- Backend configuration: 27 passed (1.91s). Frontend proxy/IP/landing:
  18 passed (1.35s). Provider/native call counts and failed durable-charge
  zero-dispatch behavior passed with injected fake ports only.
- Local contracts/backend/frontend/test typechecks, affected ESLint, Prettier
  and whitespace checks passed. Contracts were rebuilt for normal startup.
  Full root suites/build and real provider/cloud checks were not run for this
  scoped packet; no live readiness is inferred.
- Current-source hosted-shaped synthetic native workflow passed (28.37s):
  upload, shared editor, failure/retry, caption/edit and native re-export without
  YouTube, API keys or paid calls. Its current overlay is built in owned scratch.
- New guarded browser proof passed (4.78s final): at 1366px/390px, excess count
  corrects to three, adding manual rows consumes AI slots, a fourth row is
  refused with a visible/dismissible toast, exhausted entry contains no file
  picker, and layout stays within viewport. Local mode still accepts four rows
  and exposes ten suggestions. No processing mutation/external request ran.
  Desktop/phone captures were inspected under ignored
  `.local-build/evidence/cl114-{toast,exhausted}-{1366,390}.png`.
- Domain/store tests cover shared-store concurrent reservations and charges,
  restart-shaped reuse, rolling completion/failed expiry, global day/cap bounds,
  exact allowlist/mapped IPv4/IPv6 /64, corrupt/offline/contended accounting and
  pinned-generation reads/conditional writes. The object is never implicitly
  recreated. Real GCS consistency/IAM/topology are still owner-only checks.

### Execute/validate dispositions

V114-R1 found the asynchronous reservation capacity race: two distinct verified
IPs could both pass the single-session gate while awaiting storage. A regression
independently reproduced `[201, 201]` instead of `[201, 429]`. Execution added a
post-reservation capacity/closing check; the regression and shutdown-during-wait
case now pass. Earlier implementation checks also corrected phone toast clipping,
preserved the 32-call editor budget and routed provider-internal native work
through durable charging. Charges/reservations remain conservatively consumed
when a later capacity check loses; this never grants extra work.

V114-final: **Meets ticket; No actionable findings** in the settled CL-114
worktree over `09fb914`. Read-only coverage includes mixed inputs, cumulative
batch/source enforcement, completion-before-download, retry/expiry, trusted
identity/owner exceptions, durable/global failure behavior, publication and
cleanup boundaries, UI integration and documented deployment gates. No unrelated
visual change is included in this verdict; no account/database/media persistence
or unapproved cloud action was added. AFK visual review is provisional.

### Normal runtime and remaining gates

Verified shutdown of the prior backend launcher `14972` and all ten captured
processes, with ports 4000/4200 released through stabilization. Rebuilt contracts
and normal `dev:backend` rebuilt media, then relaunched hidden with the normal
owner environment loader. Current supervisor `9940`, backend `18660` on 4000 and
internal worker `15724` on 4200. Frontend `14992`/3000 and Studio were preserved.
Health, `/start` and `/api/sample/config` return 200; fake/synthetic mode and
cloud/live analysis/assembly/render off were verified without reading private env.
Runtime ownership is recorded outside Git under
`C:/Users/minat/AppData/Local/Temp/clipbuilder-run-20261028-074554ad/runtime.json`;
logs are `backend-cl114.stdout.log` / `backend-cl114.stderr.log` in that directory.

Deviation: none from the adopted recommendation. Real deployment requires the
owner's private pre-created usage object/IAM, preserved HMAC key and verified
Google LB client-IP chain as documented in release preparation. Provisioning,
actual cross-instance/cloud/ingress proof, provider keys/live flags/paid consent,
physical devices, personal visual/rights and release acceptance remain unchecked.
These fake checks use no API keys and prove no real AI quality. No cloud access,
private configuration edit, retained-media deletion, push or deployment occurred.

## Subsequent local commit authorization — 2026-10-28

The owner approved the [exact whole-file plan](../operations/CL114_121_COMMIT_PLAN.md),
16 ordered local commits and exact-path staging of pending CL-114–121 work.
Earlier unstaged/no-commit statements describe this packet's original handoff;
this later approval supersedes them only for the planned local Git action.
Personal visual, real-AI, hosted and release acceptance remain owner-only.
No push, deployment, provider/cloud request or ignored configuration change.
