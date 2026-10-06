# CL-013 motion hero file-level commit plan

Owner authorization — 2026-10-06: create this plan, then stage and commit the
completed motion-hero work. The index was empty; all pending files belong to
this CL-013 authoring/layout/research round. Use two whole-file commits in the
order below on the current `main` branch. No hunk splitting, branch change,
history rewrite or push is part of this authorization.

## 1. Editable film, local authoring and release guards

Commit subject: `CL-013: add cinematic film authoring and release guards`

| Whole file | Responsibility |
| --- | --- |
| `apps/frontend/package.json` | Pinned authoring-only Remotion tools and capture/poster/Studio commands. |
| `pnpm-lock.yaml` | Matching pinned authoring dependencies. |
| `apps/frontend/scripts/capture-product-film.mjs` | Fake-only full-flow UI captures, disabled Download and isolated-session cleanup. |
| `apps/frontend/scripts/render-product-film-poster.mjs` | One optimized opening still using shared constants and a provided existing browser. |
| `apps/frontend/scripts/verify-release-artifact.ts` | Keep local film captures outside strict release acceptance. |
| `test/release-artifact.test.ts` | Regressions for local captures and rejection of the removed draft route. |
| `apps/frontend/src/features/product-film/film-camera.test.ts` | Continuous held-angle analysis and readable candidate click framing. |
| `apps/frontend/src/features/product-film/film-camera.ts` | Frame-driven cinematic camera paths. |
| `apps/frontend/src/features/product-film/film-timeline.ts` | Composition format, pacing, synthetic capture references and shared poster constants. |
| `apps/frontend/src/features/product-film/illustrated-conversation.tsx` | Original animated speakers and shared fixed caption/card layers. |
| `apps/frontend/src/features/product-film/product-film-fallback.tsx` | Shared readable load/runtime failure state. |
| `apps/frontend/src/features/product-film/product-film-hero.module.css` | Rounded video clipping, matching poster and fallback presentation. |
| `apps/frontend/src/features/product-film/product-film-hero.tsx` | Dynamic loading, bounded asset validation, visibility and revisit lifecycle. |
| `apps/frontend/src/features/product-film/product-film-player.tsx` | Silent control-free autoplay, loop and offscreen pause/resume. |
| `apps/frontend/src/features/product-film/product-film-poster.tsx` | Eager loading image matching the actual opening frame. |
| `apps/frontend/src/features/product-film/product-film.tsx` | Editable 50-second walkthrough and cinematic scene composition. |
| `apps/frontend/src/features/product-film/studio.tsx` | Walkthrough and eight-second motion-test registration. |

These 17 files form the authoring feature and its release boundary. Landing
integration follows in commit 2; no temporary preview route is introduced.
Execution evidence: `0d8d3e6` was created and its committed 17-file inventory
matches this table exactly. The second commit below completes this authorized
sequence; its identifier is recorded in Git history and the final handoff.

## 2. Responsive landing, flow and owner evidence

Commit subject: `CL-013: integrate responsive motion hero and record owner acceptance`

| Whole file | Responsibility |
| --- | --- |
| `apps/frontend/src/app/page.tsx` | Replace the old placeholder with the film and add the five-step flow. |
| `apps/frontend/src/app/page.module.css` | Remove dead placeholder styles; natural phone height, compact laptops and wider-screen scaling. |
| `apps/frontend/src/app/hero-flow.tsx` | Semantic flow with decorative icons and visibility-owned animation. |
| `apps/frontend/src/app/hero-flow.module.css` | Sequential glow/connectors, phone sequence and short-height density. |
| `apps/frontend/README.md` | Local authoring commands, accepted layout, fake/live split and release limitations. |
| `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` | Latest owner decisions for landing placement, layout, playback and cleanup. |
| `docs/tickets/CL-013-complete-accessibility-responsive-and-performance-pass.md` | Research, owner iterations, verified evidence, cleanup and remaining gates. |
| `docs/tickets/README.md` | Current CL-013 checkpoint and this plan link. |
| `docs/tickets/CL-013-MOTION-HERO-COMMIT_PLAN.md` | This complete whole-file staging inventory. |

These nine files integrate the accepted design and document the evidence.
Historical statements that nothing was committed refer to the earlier cleanup
checkpoint; this authorization supersedes that Git boundary.

## Verification and exclusions

The settled implementation passed formatting, lint, root typecheck, build and
1,203 synthetic tests in 96 files. The passing unit run scheduled packages
serially after three five-second infrastructure timeouts in the default parallel
run; existing timeouts and fake/paid-off safety configuration were preserved.
Browser evidence covers responsive framing, seamless entry/back navigation,
control-free autoplay, offscreen pause/resume and missing-asset fallback.
The generated development type file has no pending change.

Before each commit, compare the exact staged names with its table and run
`git diff --cached --check`. After each commit, verify its actual file inventory;
after both, verify an empty index and clean working tree. Only this plan and
ticket/index bookkeeping changed after those checks; no implementation retest
is needed for that documentation.

Do not stage `public/generated/product-film/`, screenshot/poster pixels,
capture-index JSON, ignored local configuration, retained/private source,
OS-temporary QA/render bundles, process records/logs, build output or Desktop
portfolio copies. The local images remain available and reproducible through
the authoring commands. No provider calls, live paid tests, cloud changes,
MP4 export or deployment were performed or authorized by these commits.

With `FAKE_MODE=true` and no API keys, the synthetic flow and original-artwork
film work locally. Actual AI/output needs real keys, enabled live flags and the
applicable rights/data/spend/cloud approvals; paid testing remains owner-only.
No local AI runtime/weights were added. Final media/editorial/rights/license,
physical-device/accessibility/performance and public-release acceptance remain
unchecked. The Windows build still has 26 external package junctions, and strict
release verification rejects the local film capture package. Current design
acceptance and Git commits do not close those independent gates.
