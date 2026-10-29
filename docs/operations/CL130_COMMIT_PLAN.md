# CL-130 whole-file commit plan

Owner authorization, 2026-10-29: prepare a file-level plan, stage and commit the
current scratch-budget work locally, then fully restart the normal app for
owner manual Hook review. Start on `main` at
`19ede715b366a72a229072faaca7e83c7a849702`, with an empty index and the sixteen
validated CL-130 files. This plan is the seventeenth file. No branch switch,
push, deployment, cloud/provider action, configuration change or media cleanup
is included. Normal configuration and retained sources/logs remain private.

The three commits are one dependent review sequence. Only the combined result
has the recorded complete validation; intermediate groups are not release
checkpoints. Keep each file whole and stage only the exact allocation below.

## Exact allocation, in order

### 1. `CL-130: bound hosted scratch and account for retained media`

- `packages/contracts/local/hosted-editing.ts`
- `apps/backend/local/hosted-capacity.ts`
- `apps/backend/local/hosted-capacity.test.ts`
- `apps/backend/local/hosted-runtime.ts`
- `apps/backend/local/hosted-upload.ts`
- `apps/backend/local/hosted-upload.test.ts`
- `apps/backend/local/hosted-workflow.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/backend/local/clip-batch.test.ts`

Own the five-GiB media budget, bounded 5376-MiB tmpfs/eight-GiB cgroup contract,
actual retained allocation/pending exports, overhead/pressure checks, early
upload admission, completed-file retention and their focused regressions.
Keep source/clip/revision/quality settings and local owner limits unchanged.

### 2. `CL-130: prove bounded storage with maximum synthetic uploads`

- `scripts/verify-hosted-editing-linux.mjs`

Own the actual capacity adapter in the offline packaged Linux proof,
disk-selected 500-MiB generated input, bounded ENOSPC/retention check and
resource/event evidence. No keys, owner media or external/provider access.

### 3. `CL-130: document eight-GiB resource contract and validation`

- `apps/backend/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md`
- `docs/operations/HOSTED_NATIVE_BENCHMARK.md`
- `docs/tickets/README.md`
- `docs/tickets/CL-130-hosted-eight-gib-scratch-budget.md`
- `docs/operations/CL130_COMMIT_PLAN.md`

Own the selected resource contract, superseded sizing proposals, produced
evidence, this packaging authorization and still-unchecked release gates.

## Validation preserved for this sequence

- CL-130 final read-only validate: meets ticket, no actionable findings across
  the original sixteen-file combined scope; this plan changes no application
  behavior. Fifty focused tests across six suites, local/contract types,
  scoped lint with zero warnings, formatting and Git whitespace checks pass.
- Current secret-free local Linux image and non-root/network-none proof pass
  at two CPUs/eight GiB with a 5376-MiB `/tmp` volume, a real generated 500-MiB
  upload and native editor/export/cancel/retry/expiry/cleanup. Sampled memory
  peaks near 1.85 GiB; zero OOM and real-provider/external attempts. The separate
  small ENOSPC test preserves retained bytes. The ticket owns exact counts,
  artifact identity, initial failed harness attempts and workload limitations.
- No new behavior tests are needed merely to package this unchanged code.
  Before each commit, inspect exact staged names, full staged content,
  whitespace and potential credential/generated/private content. After all
  commits, reconcile seventeen unique paths, clean index/worktree, commit
  subjects/range and no push.

## Restart and owner handoff

After committing, stop the verified frontend before the backend supervisor and
its internal worker. Capture PID creation times/descendants/listeners, verify
all selected identities and ports stay clear, then build contracts and start
backend before frontend with normal owner configuration. Use hidden launches,
content-safe OS-temp logs and readiness GETs only. Leave the healthy full stack
running and record fresh identities privately. Do not trigger the owner's test.

Hook remains the manual CL-129 feature already committed before this sequence:
the owner chooses a segment of up to ten seconds, repeats it before the intact
body, and uses normal Apply/Discard and preview/export. There is no AI Hook
selection/generation in either mode. Fake mode needs no keys for this feature;
real AI captions/moment discovery still require configured keys/live flags/
applicable approvals and owner action. Personal Hook/media/visual acceptance,
actual hosted configuration/maxima and release approval remain unchecked.

## Packaging record

All seventeen planned files are allocated above. The inspected source/proof
groups are saved locally:

| Group | Commit | Files |
| --- | --- | ---: |
| Runtime/admission and regressions | `4af3143` | 9 |
| Packaged Linux capacity proof | `f4e09d1` | 1 |
| Resource documentation and this plan | Final documentation commit containing this file | 7 |

The final group records this allocation and preserves the existing validation
evidence. The full restart follows packaging; its process identities and safe
logs are recorded outside Git. No remote action is part of this sequence.
