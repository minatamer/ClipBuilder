# CL-123 — approved whole-file preflight commit plan

Owner authorization, 2026-10-28: prepare deployment, report actual readiness and
stage/commit remaining work. Baseline `7d7fe71` includes the completed four-file
CL-122 storage setup record. Allocate six whole files to two local commits.
No push, application deployment, cloud build, paid AI or private configuration.

| Commit | Subject | File | Whole-file change |
| --- | --- | --- | --- |
| 1 | `CL-123: refresh Linux hosted proof for demo usage` | `scripts/verify-hosted-editing-linux.mjs` | Inject shared fake usage and synthetic identities, preserve native/editor checks, verify completed-trial denial and current expiry envelope. |
| 2 | `CL-123: record production preflight and release gates` | `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` | Latest preparation authority, current verified evidence and still-open release gates. |
| 2 | `CL-123: record production preflight and release gates` | `docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md` | Current build/native/resource facts, exact gaps and owner real-AI checklist. |
| 2 | `CL-123: record production preflight and release gates` | `docs/tickets/README.md` | Current packet evidence/disposition. |
| 2 | `CL-123: record production preflight and release gates` | `docs/tickets/CL-123-hosted-deployment-preflight.md` | Scope, six-file allocation, red/green evidence, capacity/ingress limitations and local commit approval. |
| 2 | `CL-123: record production preflight and release gates` | `docs/operations/CL123_COMMIT_PLAN.md` | Exact complete-file allocation and commit ordering. |

Verification applies to the settled combined snapshot. Both latest local Linux
production images build and both offline runtime probes pass. The original
hosted proof reproduced its stale-wiring failure; the corrected native/browser
proof passes with fake AI, no keys/paid work and no external network. Affected
Prettier/ESLint pass. Read-only actual hosting metadata exposes capacity gaps;
private settings/logs stay outside Git. Actual ingress, maximum capacity and
owner real-AI/visual/rights/release acceptance remain open.

Before each commit verify exact names/content, an expected index and staged
whitespace. Afterward verify both commits, all six allocated paths accounted
for once, a clean worktree/index and no owned proof containers remaining.
