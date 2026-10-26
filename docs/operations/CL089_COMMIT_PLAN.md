# CL-089 whole-file commit plan — 2026-10-26

Owner directly authorized separate file-level plans and local audit commits in
AFK execute/validate loops. Baseline ca10def is preserved. Index is empty.

`CL-089: retain hosted cleanup ownership and cache image dependencies`

One cohesive quality commit: Q-01 failure-safe independent hosted cleanup and
safe diagnostics, Q-02 pinned dependency caching before source changes, plus
regressions/report/packet/canonical progress. No dependency/runtime update,
provider call, G Cloud, scanner export, push or deployment. Linux/owner release
checks stay open; the initial invalid registry-attempt probe is documented.

| File | Purpose |
| --- | --- |
| `apps/backend/Dockerfile` | Lock metadata/script-free fetch before source; original install/build/runtime with frozen offline resolution. |
| `apps/backend/local/hosted-cleanup.test.ts` | Synthetic failure, admitted-source and safe diagnostic regressions. |
| `apps/backend/local/hosted-upload.test.ts` | Synthetic failure, admitted-source and safe diagnostic regressions. |
| `apps/backend/local/hosted-upload.ts` | Retain staged directory identity until removal succeeds. |
| `apps/backend/local/hosted-workflow.ts` | Independent cleanup, recovery and preserved per-failure diagnostics. |
| `apps/frontend/Dockerfile` | Lock metadata/script-free fetch before source; original install/build/runtime with frozen offline resolution. |
| `apps/renderer/Dockerfile` | Lock metadata/script-free fetch before source; original install/build/runtime with frozen offline resolution. |
| `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` | Owning quality plan, actual validation/probe limits or canonical AFK progress. |
| `docs/operations/CL089_COMMIT_PLAN.md` | Owning quality plan, actual validation/probe limits or canonical AFK progress. |
| `docs/operations/CODE_QUALITY_AUDIT_2026-10-26.md` | Owning quality plan, actual validation/probe limits or canonical AFK progress. |
| `docs/tickets/CL-089-current-code-quality-audit.md` | Owning quality plan, actual validation/probe limits or canonical AFK progress. |
| `docs/tickets/README.md` | Owning quality plan, actual validation/probe limits or canonical AFK progress. |

Final gate is clean: 8focused/602local, full144root+1728package unit cases,
affected types/lint/format, closed-context checks and guarded offline cache probe.
Read-only pass2 has no actionable findings. Stage exactly these whole files,
check planned/index identity, staged whitespace and absence of secrets/media/
generated artifacts, then commit the subject above. Verify clean Git before
starting CL-090 audit-only security review and actual finding selection.
