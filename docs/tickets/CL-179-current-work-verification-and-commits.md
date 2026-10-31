# CL-179 — Current-work verification and local commits

Status: Verified; implementation/test commits created locally. This closing
documentation commit completes the packaging record. Depends on CL-168–178.

## Owner authorization — 2026-10-31

Prepare an exhaustive file-level plan, stage and commit the pending work in
multiple ticket-prefixed local commits, then explain remaining deployment work.
No push, cloud inspection/change, deployment, provider spend, real processing or
ignored configuration access. Preserve the running app, owner session/media and
all prior work. Use the established whole-file dependent commit-plan pattern.

## Scope and acceptance

- Inventory all pending source/tests/docs; allocate complete files exactly once
  to explicit ticket-prefixed commits, with the plan alone committed first.
  Review staged path/content/privacy/whitespace and verify final clean status.
- Consolidate deterministic fake/paid-off verification. Correct only confirmed
  test-harness blockers found by these checks; no new application behavior.
- Root capability tests omit CL-171's new `visualDiscovery` field. Preserve exact
  response/no-dispatch assertions with the correct true/false values.
- The composition sliding-highlight test imports a root owner fixture against
  the package boundary rule. Use the minimal package-local overlay value that
  the test needs, retaining its frame/key/paint assertions.
- The recorded-audio determinism test times out during a full typed-array deep
  comparison. Compare full-buffer SHA-256 digests, retaining actual catalogue
  digests/headers/sample-clock/size checks; do not raise its timeout or weaken
  recording verification. Confirm the affected focused check, then full gates.
- Full local coverage also contains older Hook/optional-image assertions. Align
  the Hook fixture with CL-163's minimum later-start range (short clips omit it),
  and keep invalid-provenance/corrupt/oversized images rejected while asserting
  CL-170's nonfatal reviewable clip, zero image assets and preview-only work.
  Do not weaken actual media/provenance validation or alter application code.
- Nested commands must use pinned pnpm 11.19.0 through a process-local PATH;
  no dependency installation, configuration or package-manager file changes.
- Document exact checks, commits and remaining current-image/Linux, hosted Gemini,
  resource/cost and owner release gates. Historical deployment records are not
  a fresh cloud-state inspection. Do not claim hosted deployment readiness from
  local Codex acceptance or synthetic results.

Fake checks use no API keys, ignored env reads or real provider/media calls.
Owner real hosted acceptance needs existing Gemini/live gates and separate
deployment/cloud authorization. This ticket authorizes local commits only.

## Evidence

### Whole-file packaging

[The exhaustive plan](../operations/CL168_179_COMMIT_PLAN.md) allocates **101
files** to **eight** ticket-prefixed dependent commits. Baseline:
`3585ce5b352ccf44b03b719e6f5d52b74249c860`, branch `main`, initially empty index.
The plan was committed alone before implementation staging. Every staged group
was checked against the exact manifest, current worktree content, whitespace
and credential-shaped added text without exposing any matches. Only reviewed
TypeScript/TSX/CSS/Markdown paths are included; no ignored config/media/logs,
generated artifacts or binaries were staged. Shared files remain whole.

| Group | Commit | Files |
| --- | --- | ---: |
| Plan | `c58ddb2` | 1 |
| Contracts | `6d375aa` | 12 |
| Native speech/progress | `07c6f6d` | 5 |
| Backend preparation/discovery/sounds | `3061906` | 45 |
| Frontend controls | `8b61d0e` | 10 |
| Integration proofs | `c51c1db` | 5 |
| Test-only verification fixes | `94b183a` | 6 |
| Closing documentation | Self-identifying final commit in history | 17 |

The final hash/path reconciliation and clean index/worktree check are performed
after this self-identifying documentation commit and reported in the execution
handoff. Earlier tickets' unstaged/uncommitted notes are historical implementation
records superseded by this explicit owner-authorized series.

### Consolidated verification — 2026-10-31

- `corepack pnpm format:check`: **passed** for the repository.
- `corepack pnpm lint`: **passed**. Existing React-detection/Next pages-directory
  configuration notices are non-blocking; no lint errors remain.
- `corepack pnpm typecheck`: **passed** for contracts/composition builds,
  root-test/backend/renderer/frontend/local TypeScript and boundary probes.
- `corepack pnpm test:unit`: **2,209 passed / 215 files**. Root 148, contracts
  152, composition 17, backend 1,147, renderer 137, frontend 608. No failures.
- `corepack pnpm local:test`: **849 passed**, zero failures or pending cases.
  Unit/local suites overlap; these are separate suite counts, not unique totals.
- Focused test-harness regression check: **14 passed**; composition-specific
  checks also pass. Root capability failures were reproduced before aligning
  exact CL-171 response expectations. The other confirmed stale expectations
  and fixture/import/deep-comparison failures were reproduced before correction.
- `git diff --check` and staged path/content/credential-shaped-text checks pass.
  The manifest covers all 101 pending paths exactly once; the index started empty.

Initial nested scripts resolved a global pnpm 11.25.0 despite the pinned outer
command. A process-local PATH to the existing pnpm 11.19.0 shim fixed it. No tool
installation, dependency, lockfile, configuration or owner environment change.

The six verification files change tests only: exact new capability booleans;
source-contained later Hook eligibility including short-clip omission; rejected
invalid art with no admitted asset while preserving preview-only usable work;
package-local browser-safe overlay fixture; and full-buffer hash determinism
while retaining exact recording/sample-clock/header/size checks. No application
behavior or test timeout was changed during packaging.

All test entry points retain synthetic/fake/paid-off/no-key setup before imports,
`envDir: false`, external-network interception and owned cleanup. No ignored env,
owner media, real ASR/model/provider/search/download or paid/cloud work was used.
Prior CL-168–178 native/browser/installed-CLI proofs and actual owner-run Codex
acceptance remain their recorded evidence; they were not silently reclassified
as current Linux or real Gemini verification.

No normal production Next build was run over the active frontend's `.next`
directory. Fresh isolated Linux production images and packaged native/runtime
proofs remain release work, as recorded below. This preserves the running app
rather than claiming a build gate that was not performed.

### Release handoff and read-only validate

**Verdict: Meets ticket locally. No actionable findings.** Coverage includes
exhaustive allocation, exact staged identities/content, coherent dependent
grouping, test-only dispositions, privacy/boundaries, root/local gates and
preservation of prior work. The original feature packets supply detailed
provider/resource/cancellation/recovery acceptance; no unrelated audit was added.

The owner reports the desired local edits complete and real image discovery
working. No new product feature is proposed as a deployment prerequisite.
[Current release preparation](../operations/HOSTED_EDITOR_RELEASE_PREPARATION.md#current-change-handoff--cl-168179-2026-10-31)
records the remaining work: current secret-free Linux app images and packaged
offline native/runtime/capacity verification; the selected 2-CPU/8-GiB backend
with 5376-MiB `/tmp` and background-CPU/cost/lifecycle confirmation; protected
owner Gemini upload/visual/edit/export and quota/expiry acceptance; then separately
authorized push/build/rollout and smoke/rollback checks. Old cloud metadata was
not refreshed and is not presented as current configuration.

Fake mode needs no API keys and proves the tested mechanics. Real local Codex
still uses installed CLI/CPU tooling and saved ChatGPT sign-in; hosted stays
Gemini with its existing keys/live approvals. No provider switch, real processing,
cloud access/change, push or deployment occurred. The normal local app and
owner recovery/media/configuration remain preserved. Deviation: only the
documented, confirmed test-only corrections necessary for clean combined gates.
