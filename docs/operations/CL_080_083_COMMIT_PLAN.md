# CL-080–083 file-level commit plan — 2026-10-26

Owner explicitly authorized a file-level plan, staging and local commits of all current pending work in this chat. No push or deployment is included.

Baseline: `1da16fe`. Index empty; 20 pending text files. This plan adds one file, giving 21 files across three whole-file commits. Preserve the running owner app, ignored configuration, retained/saved media, generated evidence and private diagnostics.

CL-082 is an independent renderer fix. CL-080 and CL-081 share the selection component and owning product decisions, so keep them together. CL-083 groups the shared UI styling with the owner caption-acceptance note and final index/plan. No partial-file staging is needed.

## Commit 1

`CL-082: bound repeated overlay hardlinks for long clips`

| File | Purpose |
| --- | --- |
| `apps/renderer/local/rasterize-overlay.ts` | Rotate exclusive PNG copies below the per-file hardlink ceiling; account for copied bytes. |
| `test/local-overlay-runtime.proof.ts` | Current-source isolated 1,800-frame regression and full-minute native MP4 proof. |
| `docs/tickets/CL-082-local-worker-render-failure.md` | Reproduction, checks, worker reload and remaining owner gates. |

## Commit 2

`CL-080-081: default fake intake to manual and cap new clips at 60s`

| File | Purpose |
| --- | --- |
| `apps/backend/local/analysis.test.ts` | Exact/manual-over-limit and saved-result compatibility checks; valid request fixture. |
| `apps/backend/local/analysis.ts` | Validate new manual requests before provider dispatch. |
| `apps/backend/local/server.ts` | Apply the same new-request schema at the shared HTTP boundary. |
| `apps/frontend/src/features/local-editing/selection-panel.tsx` | Fake-only initial preference; shared manual limit and actionable errors. |
| `packages/contracts/local/policy.ts` | One shared requested-duration ceiling. |
| `packages/contracts/local/selection.ts` | Narrow new requests while preserving retained analysis and advisory AI results. |
| `test/local-design.proof.ts` | Explicitly opt into suggestions for the existing AI walkthrough. |
| `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` | Owner fake-mode/default and manual-duration decisions. |
| `docs/tickets/CL-080-fake-mode-manual-clips-default.md` | Default change, focused evidence and broad intake-proof limitation. |
| `docs/tickets/CL-081-manual-clip-duration-limit.md` | Confirmed 60-second choice, checks and local worker parity evidence. |

## Commit 3

`CL-083: unify dropdown arrows and record caption acceptance`

| File | Purpose |
| --- | --- |
| `apps/frontend/src/features/local-editing/acquisition-panel.tsx` | Shared select class; retire resolution-only SVG/wrapper. |
| `apps/frontend/src/features/local-editing/clip-editor.tsx` | Shared class on eight caption/picture/filter selects. |
| `apps/frontend/src/features/local-editing/focus-editor.tsx` | Shared class on four focus selects. |
| `apps/frontend/src/features/local-editing/style.css` | Token-colored inset arrows, text clearance, phone and forced-color rules. |
| `docs/tickets/CL-078-caption-generation-and-word-editing.md` | Narrow owner-reported real Gemini caption success while fake mode remained on. |
| `docs/tickets/CL-083-shared-dropdown-arrow-inset.md` | Shared-style scope, current-source visual/native-keyboard evidence and checks. |
| `docs/tickets/README.md` | Current ticket/acceptance index for all included packets. |
| `docs/operations/CL_080_083_COMMIT_PLAN.md` | Owner-authorized file-level plan and Git handoff. |

## Evidence and commit checks

- CL-080: fake/local-provider/hosted-provider current-source default inspection passes. Existing broad design proof stops at intake before selection; this remains documented and is not claimed passed.
- CL-081: 98 focused synthetic tests pass, including 60.000/60.001-second boundaries, zero dispatch on rejection and retained-result compatibility.
- CL-082: failure reproduced at the 1,024th link; full-minute compiled isolated MP4 and focus/native proofs pass (2/2), plus 24 diagnostic/profile/batch checks.
- CL-083: existing editor proof passes; desktop/390/320 current-source screenshots inspected; keyboard, disabled, focus, long text and forced-color checks pass.
- Affected frontend/local/test/no-ambient-Node contract types, lint/format and whitespace checks are recorded in their packets. No new source changes require repeating the previously passing media proofs for this Git-only handoff.
- Before each commit: match exactly the planned staged paths; inspect staged diff/whitespace and scan planned text for forbidden paths or credential-shaped material without printing content.
- After commits: verify ticket-prefixed subjects, expected groups and clean index/worktree. Report hashes in chat. The final commit cannot embed its own hash.

## Boundaries and remaining gates

Agent checks used generated media, fake AI, paid-off and network blocking without reading ignored configuration. Fake local editing and fictional captions need no keys. The owner separately reports successful local real Generate captions while fake mode remained on; that key/credit-using exception does not establish other paid paths, hosted acceptance or measured credit usage.

Owner personal visual/real-media acceptance and remaining Linux/hosted capacity/release gates remain as recorded. This Git action grants no provider retry, cloud change or deployment. Research after these commits is read-only and will not alter rendering behavior.
