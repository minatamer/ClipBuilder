# CL-089 — Current code quality and efficiency audit

Status: implemented and locally validated; separate whole-file commit prepared.
Execute/validate under explicit 2026-10-26 AFK authorization.
Dependency: CL-088 committed as ca10def with a clean index/worktree. Renew the
audit for the current code; earlier isolated audit decisions are historical.

## Scope and authority

Audit structure, ownership, duplication/dead code, state/async cleanup, bounded
work, diagnostics, package boundaries, build efficiency and tests. Preserve
CL-084–088 behavior, CL-060 usable AI acceptance, paid-result reuse, editor/native
parity, private diagnostics, all resource limits and owner media. Use root
AGENTS/source of truth and the build quality phase; no new feature/design round,
provider call, G Cloud access/change, deployment, push or scanner upload.
Fake/no-key/paid-off checks prove mechanics only. Real AI quality, owner visual,
media/rights and actual hosted/resource/Linux release acceptance remain open.

## Findings and implementation plan

Detailed evidence, exclusions and coverage live in
[the quality report](../operations/CODE_QUALITY_AUDIT_2026-10-26.md).

1. **Q-01: retryable, independent hosted cleanup.** A host-close failure skips
   staged-upload cleanup; HostedUpload also forgets its directory before removal
   succeeds, so a transient filesystem error makes retry falsely succeed while
   leaving scratch. Reproduce both with injected failures and zero AI/native
   calls. In `hosted-workflow.ts`, settle host/upload cleanup independently after
   transfers drain; retain recovery until both succeed and preserve the existing
   diagnostic path. In `hosted-upload.ts`, clear the same stage identity only
   after successful removal, including the empty directory after final source
   admission; a cleanup retry must preserve that admitted source. Preserve all upload/admission/CSRF/expiry bounds and
   ownership. Do not delete other sessions, sources, local libraries or logs.
2. **Q-02: reuse Docker dependency work.** All three image builds copy source
   before dependency installation, invalidating installation on source-only
   edits. Fetch pinned dependencies from lock/workspace/root package metadata in
   a prior layer with fetch scripts disabled, then copy source and install
   frozen/offline with the original normal lifecycle behavior. Preserve pinned
   runtime/package versions, lifecycle scripts at install, original build/export
   commands, closed contexts and runtime artifacts. No dependency upgrade here.
   Validate pnpm11.19.0's fetch/offline behavior in an owned secret-free context
   with cached packages and no downloads; inspect all three build stage orders.

## File allocation before implementation

- Backend cleanup: `apps/backend/local/hosted-upload.ts`,
  `hosted-workflow.ts`; meaningful failure regressions in `hosted-upload.test.ts`
  and new `hosted-cleanup.test.ts`.
- Build layers: `apps/frontend/Dockerfile`, `apps/backend/Dockerfile`,
  `apps/renderer/Dockerfile`; existing closed-context tests cover packaging.
- Owning evidence: this packet, quality report, ticket index and canonical main
  progress; narrow hosted/build guidance if behavior needs explanation. The
  exhaustive whole-file commit allocation is written after settled validation.

## Execute/validate and acceptance

First run the two failure regressions against unchanged code and confirm the
actual failures. Apply the smallest fixes, rerun those and existing upload/hosted
workflow tests. Validate exact fake/native counts and cleanup/recovery, including
no lost staged-upload reference and no unrelated deletion. Prove cached fetch
then frozen offline install with the pinned package manager and allowed source
context; no ignored env/tools/media copied into the image context.

Run affected lint/format/local+backend+test types and required full unit/local
gates once after edits settle, with network-blocked fake/paid-off setup. All
application checks remain synthetic; no test invokes the owner paid caption
exception. Build/cache changes do not claim an actual Linux image or cloud
measurement. Required Linux/runtime/vendor/hosted review stays a release gate.
Read-only validate settled changes against Q-01/Q-02, independently confirm/fix
any issue and repeat until no actionable local finding remains. Prepare separate
whole-file plan, inspect staged content and commit under the current human grant.
Only then begin CL-090 security audit. Keep normal app healthy/fake on handoff;
use verified lifecycle ownership if the backend watcher needs rebuilding.

## Evidence and settled read-only validate

All three cleanup regressions failed against unchanged code and pass after the
fix. Eight focused cases pass; the review additionally reproduced lost safe EIO
diagnostics in the first aggregate implementation and confirmed the correction.
Raw synthetic exception text stays redacted. Normal upload/order/replay/bytes,
source retention, expiry, recovery and exact fake/native work counts remain.

Final required gate: exact pnpm test:unit passes (144 root + 1,728 package cases),
plus 602 local cases / 62 files. Affected lint/format, backend/local/test types
and whitespace pass. Existing closed app/renderer context tests pass in those
suites. Pinned cached metadata-only fetch with scripts off then normal frozen
offline install in an allowlisted context passes under inherited env-file and
network guards: zero external attempts/downloads, lock unchanged. The earlier
unguarded fetch-postinstall registry attempt is documented as invalid evidence
in the quality report; no provider/paid/cloud processing occurred.

Read-only validate pass 2: **Meets ticket; no actionable findings.** Q-01 covers
independent cleanup, retained identity/admitted source and original diagnostics;
Q-02 preserves pinned manager/runtime, install lifecycle after source copy,
all build/deploy/runtime commands and closed contexts. No product/API/schema,
provider-output acceptance, retry budget, private diagnostics, retained media or
editor functionality change. No dead/debug tracing, new runtime dependency or
unsafe casts remain. Full native/browser evidence from CL-088 is retained for
unchanged rendering/UI; this cleanup/build-only packet does not repeat it or
claim an actual Linux image/cloud/provider/owner acceptance proof.

Normal watcher-reloaded app remains synthetic-ai/cloud=false, frontend 21124 on
3000; API 23684 on 4000 and worker 28188 on 4200. Supervisor identities 7816/15192
and live descendants/listeners are refreshed in the existing OS-temp runtime
record; logs stay in the CL-088 runtime directory. Keep it running. Personal
visual, real AI/media/rights, actual hosted resources/identity, Linux/native
vendor and release gates remain open. Commit only the separate CL-089 allocation,
then start the security audit; no push/deployment, G Cloud or scanner export.
