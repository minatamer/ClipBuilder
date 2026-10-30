# CL-155 — default to two AI clips

Status: complete locally; fake/static/review and worker refresh passed.
Plan filed before implementation.
Depends on the existing selection flow; preserve pending CL-152–154 work.
Owner request: default to 2 rather than 4 so
the initial form does not encourage excess generation. No Git/deploy action.

## Plan and allocation

- `packages/contracts/local/policy.ts`: change the single shared default count
  from four to two; keep all maximums and explicit requested counts intact.
- `apps/frontend/src/features/local-editing/selection-panel.tsx`: initialize at
  the shared default capped by the applicable hosted limit; do not default to
  the hosted maximum. Restored explicit choices remain authoritative.
- `apps/backend/local/analysis.test.ts`: adjust existing implicit-default
  expectations to two, keeping explicit-count and manual-cut checks unchanged.
- This ticket, `docs/tickets/README.md` and the owning default-count paragraph
  of `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`: behavior/evidence only.

Run existing focused fake/paid-off analysis and hosted-limit checks, scoped
types/lint/format and read-only validate. Build/reload native artifacts using
verified lifecycle ownership per repository parity rules, only once the normal
host is idle. No ignored configuration reads/edits, provider/paid processing or
real media test. Fake mode applies the same default without keys; real Gemini
or Codex keeps the existing provider setup, live/master settings and explicit
owner processing action. Real AI quality is unrelated and not tested here.

## Acceptance

Fresh local and hosted selection start at two. Missing API count uses two.
Existing manually selected/restored counts and all clip limits remain. Existing
focused checks pass with zero provider calls; no new test suite is needed for
this small reversible default change. Record any required worker refresh.

## Evidence

The canonical default is now 2. Fresh selection uses that default capped by its
existing local/hosted clip limit, rather than initializing hosted sessions at
their maximum. Explicit inputs and restored counts use their existing paths.
No maximum, manual range, duration, provider or paid/hosted gate changed.

All 60 existing focused analysis and hosted usage/limit tests pass in fake mode,
paid-off, no-key, network-blocked composition (5.91 seconds). Updated existing
implicit-count assertions expect two suggestions and preserve two manual cuts;
explicit 1/5/10 count cases and hosted three-slot enforcement continue to pass.
Contract/local TypeScript, scoped ESLint, code formatting and whitespace pass.
No paid/provider calls or real media testing occurred. Static inspection confirms
the same default feeds browser, fake, Gemini, Codex and missing-count API paths.

Read-only validate: Meets ticket; no actionable findings. Covered — shared
default, hosted initializer, preserved explicit/restored counts and limits,
existing regression checks, dependency direction, privacy and no new resources.
The pre-existing CL-152–154 worktree is preserved and excluded from this small
default-change verdict. No new UI geometry or processing protocol is introduced;
another native/browser rendering proof is unnecessary. Real AI quality, hosted
deployment and owner visual/release acceptance are untested, unchanged gates.
No staging, commit, push or deployment. Deviations: none.

Normal-host refresh: checked no active clip/native processing before shutdown;
nine old backend identities stopped with zero survivors/orphans. Rebuilt
contracts and current worker/overlay through normal dev startup. Backend 14444 /
4000 and internal worker 17972 / 4200 belong to supervisor 19752; frontend 13720 /
3000 is preserved. Health, /start and /api/sample/config each return 200. No
ignored configuration was inspected or changed and no processing action issued.

Content-free record/logs:

- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl155-app-2f00b54e1f414376aba00e9552fb040b/backend.runtime.json
- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl155-app-2f00b54e1f414376aba00e9552fb040b/backend.stdout.log
- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl155-app-2f00b54e1f414376aba00e9552fb040b/backend.stderr.log
