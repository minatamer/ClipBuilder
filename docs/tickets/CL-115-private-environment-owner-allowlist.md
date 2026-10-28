# CL-115 — private environment owner allowlist

Owner follow-up, 2026-10-28: move the hosted owner IP allowlist from code to
private backend environment configuration so actual addresses stay out of Git.
Depends on the locally implemented CL-114; preserve its unstaged work over
visual commit `09fb914`. No staging, commit, deployment or cloud/provider action.

## Scope and acceptance

- Backend-only `HOSTED_DEMO_OWNER_IPS` accepts a bounded comma-separated list of
  exact IPv4/IPv6 addresses. Blank/missing means no exemptions; invalid values,
  CIDRs, wildcards and empty entries fail configuration parsing. Normalize using
  the existing domain rules. No browser exposure, value logging or global-cap
  bypass. Localhost retains its existing owner limits without hosted quotas.
- Parse once in `src/config/env.schema.ts` and inject through
  `local/hosted-runtime.ts` into `HostedDemoUsage`. Delete the code-owned empty
  allowlist module and use an empty default for explicitly injected/test usage.
- Commit only a blank `.env.example` entry; do not read, edit or populate ignored
  `.env.local`. Document manual local configuration, restart and private hosted
  environment injection. Update current source-of-truth/release guidance and
  mark CL-114's prior code-list instructions superseded.
- Strip inherited allowlist settings in deterministic test setup. Verify blank,
  valid, malformed and excessive lists, configuration-to-domain exemption,
  mapped-IP behavior and public-config non-disclosure with synthetic addresses.
  Run relevant fake/paid-off units, backend/local types and scoped lint/format/
  whitespace; read-only validate/fix to no actionable findings. No visual change.

Fake/no-key tests verify configuration and policy only. Real hosted processing
still requires private ledger/IAM/verified ingress plus provider keys/live flags
and applicable owner approvals. No new live/provider/hosted acceptance is claimed.

## Status

Implemented and locally verified. Backend configuration parses
`HOSTED_DEMO_OWNER_IPS` once (maximum 32 exact addresses / 4096 input characters),
then hosted runtime injects the private list. `HostedDemoUsage` defaults to an
empty injected list; the retired source-list file/import is removed. Blank
example/configuration guidance, deterministic environment cleanup and the
source-of-truth/CL-114 correction are updated. No frontend setting or API field
contains the list. Actual owner addresses were neither requested nor read.

Checks on 2026-10-28:

- Backend configuration: 40 tests passed (2.27s), including blank/whitespace,
  comma-separated IPv4/IPv6, malformed/empty/CIDR/wildcard/scoped/oversized input
  rejection and public-config non-disclosure with synthetic addresses.
- Domain/runtime: nine tests passed (1.85s), including environment-parsed owner
  exemptions, mapped IPv4, non-owner rejection and no code-list default.
- Backend/local typechecks and affected ESLint/Prettier/whitespace passed.
- `git check-ignore` confirms backend `.env.local` stays ignored. Its contents
  were not read, printed or modified. The committed example is exactly blank.
- Normal backend health is 200; frontend config remains fake with live analysis,
  assembly and rendering off. The source watcher reloaded the backend normally;
  no local contracts/native-worker implementation or visual layout changed.

V115-final: **Meets ticket; No actionable findings.** Read-only scope is the
CL-115 configuration/list-removal/injection/documentation overlay on pending
CL-114 over `09fb914`. Covered private sourcing, parser bounds/failure, default
deny, existing canonical matching/global caps, deterministic isolation and public
non-disclosure. Existing CL-114 quota/UI work is preserved and excluded from
this narrow verdict. Deviation: none.

Owner manually populates the ignored backend `.env.local` value and restarts;
hosted deployment must inject the same private environment key independently.
No private value was inserted, Git mutation performed or cloud/provider request
made. Supplying an allowlist alone does not enable hosted processing: CL-114's
ledger/IAM/verified ingress and existing API-key/live/approval/release gates
remain unchecked. Fake checks need no keys and prove no real AI quality.

## Subsequent local commit authorization — 2026-10-28

The owner approved the [exact whole-file plan](../operations/CL114_121_COMMIT_PLAN.md),
16 ordered local commits and exact-path staging of pending CL-114–121 work.
Earlier unstaged/no-commit statements describe this packet's original handoff;
this later approval supersedes them only for the planned local Git action.
Personal visual, real-AI, hosted and release acceptance remain owner-only.
No push, deployment, provider/cloud request or ignored configuration change.
