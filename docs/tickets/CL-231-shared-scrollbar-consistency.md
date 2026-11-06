# CL-231 — Shared scrollbar consistency

Status: Complete locally, 2026-11-06. Dependency: shared global scrollbar treatment
from CL-004 is implemented. Preserve the separate CL-225–230 changes.

## Owner request and diagnosis

The owner reports that some scrollbars are bypassing the shared styling and
requests consistency everywhere. The existing shared treatment is global in
`apps/frontend/src/styles/tokens.css`, imported by the root layout; it applies
to every route and nested scroll container without per-pane class opt-in.

Three feature-local `scrollbar-width: thin` declarations on the clip rail, editor
pane and Focus inspector override the shared WebKit-path reset to `auto`.
Chromium then paints native thin scrollbars instead of the intended 4px custom
ones, even though pseudo-element styles can still compute to 4px. Remove those
conflicts rather than duplicate scrollbar styling. Keep overflow/gutter geometry,
shared tokens, privacy-dialog token theming, standard-engine fallback and native
forced-color treatment. Existing deliberately hidden horizontal strips retain
their documented no-visible-bar behavior (CL-131 and existing sample carousels).

Allocate the three narrow stylesheet declarations, shared-style ownership note
in the frontend guide/source of truth, this ticket and index. Audit all frontend
scrollbar appearance declarations. Do not add per-component pseudo rules or new
dependencies. No owner media/configuration, provider/native or Git changes.

## Acceptance checks

- Source audit: shared tokens own all visible scrollbar width/color/pseudo
  rendering; feature styles contain only geometry, allowed token theming and
  the documented hidden-strip exceptions.
- Generated actual editor in the Codex browser: inspect overflowing clip rail,
  normal editor pane, Focus camera list and full-width controls. Measure actual
  gutters as well as computed styles and inspect rounded thin bars/no arrows.
  Test keyboard/wheel scrolling, footer/overflow and laptop/phone behavior.
- Scoped format/whitespace and read-only review. No CSS mirror unit tests or
  unrelated full suites. No shared/native behavior or provider calls needed.
- Close generated fixture/tabs/scratch and reset viewport. Keep the normal app
  and owner clip intact. Layout works with fake/no-key prepared media; fresh AI
  generation retains existing provider/runtime/live/approval requirements.
  Physical-device/forced-color/owner visual acceptance remains manual.

## Evidence

- Removed the three local standard-width overrides. A frontend-wide CSS audit
  finds visible width/color/pseudo appearance rules only in shared `tokens.css`;
  the existing hidden horizontal strips remain intentional exceptions. Root
  layout imports the shared stylesheet. No new class or duplicate rules needed.
- Generated editor checks in the Codex browser, with fake/no-key/paid-off
  composition and loopback-only transport: at 1440×500 the overflowing clip rail,
  editor pane, caption timeline and workflow area each have a measured 4px gutter
  (zero horizontal borders), standard width `auto`, 4px pseudo width, rounded
  999px thumbs, shared thumb colors and no scrollbar buttons. Measuring real
  gutters avoids the misleading pseudo-style-only result documented by CL-004.
- At 1440×650, the overflowing Focus Camera list and full-width inspector each
  measure 4px; source preview and workspace footer stay visible. Wheel input
  moves the rail to scrollTop 59, keyboard Tab reveals the normal editor's lower
  controls (scrollTop 373), and End reaches the Focus controls. At 390×844 the
  stacked workflow scrolls with the same measured 4px treatment; the compact
  horizontal rail retains its existing hidden bar and the footer stays visible.
- Scoped stylesheet Prettier and `git diff --check` pass. Read-only review finds
  no remaining visible feature scrollbar override, dependency/schema change,
  debug code, new resource lifecycle or provider boundary. No CSS-mirror tests or
  unrelated full suite were run. Standard-engine fallback and forced colors are
  unchanged source paths, not newly exercised browser/device evidence.
- Browser warning review finds only the existing Remotion license notice and no
  errors. Temporary tabs closed, viewport reset, generated fixture and its two
  owned processes/scratch removed, listener absent after stabilization; fixture
  recorded zero edits and zero unexpected requests. Normal backend health and
  frontend `/start` still return 200; owner media/configuration remain untouched.
- Prepared-media scrollbar mechanics work without API keys. Fresh AI generation
  still requires its existing provider/runtime setup, live flags and approvals;
  no real processing, provider calls, native reload, Git staging/commit or cloud
  action occurred. Owner visual/device/assistive-technology and forced-color
  acceptance remain manual.
