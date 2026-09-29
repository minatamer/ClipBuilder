# CL-013 — Complete the accessibility, responsive, and performance pass

Status: Planned<br>
Milestone: M6 — public-demo hardening and audit<br>
Last synchronized: 2026-09-29<br>
Depends on: CL-012<br>
Blocks: CL-014<br>
Suggested commit: `CL-013: complete the experience quality pass`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Audit and correct the complete implemented flow for responsive composition,
short-height behavior, keyboard and screen-reader access, focus, status/errors,
200% zoom, forced colors, reduced motion, media/editor usability, and measured
frontend/media performance. Record one release-quality manual matrix rather
than leaving these concerns fragmented across feature tickets.

## Portfolio value

Make the full demo feel intentionally built at every practical viewport and
interaction mode. The result should demonstrate the same editing capability on
phone, tablet, laptop, desktop, and large monitor without inaccessible or
performance-heavy fallbacks.

## Standalone implementation context

- Feature tickets own baseline accessibility/responsiveness. CL-013 is the
  consolidated whole-flow pass after every screen exists; it fixes cross-screen
  inconsistencies, interaction gaps, focus loss, layout collisions, and
  measured performance issues.
- One semantic component tree and one reducer/state authority remain. Responsive
  modes change composition/density/affordances, not product capability or logic.
- Target WCAG 2.2 AA. Automated checks are necessary but cannot replace manual
  keyboard, screen-reader, zoom, forced-colors, motion, media, and editor review.
- The required anchors include 320×568, 390×844, 768×1024 portrait/landscape,
  1024×768, 1280×800, 1440×900, 1920×1080, 2560×1440, heights 600–700,
  intermediate drag resizes, and 200% zoom/text spacing.
- Performance work must be evidence-driven. Do not add speculative memoization,
  caching, persistence, duplicate device implementations, or new dependencies
  simply to reduce a metric.

## Dependency evidence required

CL-012 must show that every public route/feature is present behind the final
security/availability controls and that repository-owned security/privacy
findings are resolved. Use the approved CL-002 design direction and the actual
complete CL-004–CL-011 flow; do not audit placeholder or alternate mock screens.

## Files and areas owned

- Cross-flow frontend styles/tokens/motion and targeted component/hook fixes.
- Accessibility/responsive/fake-flow E2E checks and the manual evidence record.
- Measured bundle, loading, media preview, transcript, editor, polling, and
  interaction performance corrections.
- Minimal backend/media corrections only when a measured user-facing timing or
  cancellation problem is traced there.

## Scope boundaries

### In scope

- Landing, upload, analysis, candidate review, assembly, editor, render,
  result, errors, expiry, and clear at every named layout anchor.
- Semantic landmarks/headings/forms/lists/tabs/dialogs/drawers/sliders/media;
  accessible names/descriptions; focus entry/return/order; live regions; error
  summaries; composite transcript/timeline keyboard patterns.
- Safe-area insets, virtual keyboard, orientation, text-spacing overrides,
  short height, intermediate widths, no horizontal page scroll, and no hidden
  primary/Clear/privacy action.
- Reduced motion, high contrast/forced colors, color-independent state,
  non-autoplay media, accessible transcript alternative, and safe announcements.
- Lazy loading and render/update discipline for heavy PDF-none/media/vision-
  unrelated browser code, transcript lists, preview overlays, polls, timers, and
  asset URLs based on measured/structural evidence.

### Out of scope

- Product redesign, new features, new provider calls, desktop-only or mobile-
  only workflow, native mobile app, automated WCAG certification, deployment,
  or rewriting correct modules for stylistic preference.
- Re-running external live/provider/cloud checks unless a specific correction
  requires the smallest relevant owner-authorized observation.

## Implementation checklist

### 1. Responsive and short-height audit

- [ ] Execute every signature/failure/recovery screen across named viewport,
  orientation, height, zoom, and intermediate resize anchors.
- [ ] Preserve preview, evidence, correction, visual summary, proposal, render,
  download, clear, privacy, and errors at every width.
- [ ] Fix overflow, clipped sticky/fixed panels, nested scroll traps, layout
  shifts, safe-area collisions, drawer/tab state resets, and virtual-keyboard
  obstruction using shared composition—not separate product trees.

### 2. Keyboard, focus, semantics, and assistive technology

- [ ] Verify one logical `h1`, landmarks, skip link, field labels/instructions,
  button/link semantics, tabs, dialogs/drawers, notices, and media controls.
- [ ] Test candidate/evidence navigation, transcript composite, range sliders
  and word steps, playback, corrections, visual tracks, proposal diff/apply,
  undo/redo, render confirmation, download, and clear without pointer.
- [ ] Move focus deliberately after stage/error transitions, restore it from
  dialogs/drawers, avoid traps, and keep disabled prerequisites explained in
  visible adjacent text.
- [ ] Use polite coarse stage/progress announcements, assertive blocking errors,
  and copyable content-free request/rule references without chatty polling.

### 3. Visual/motion/media accessibility

- [ ] Prove WCAG AA contrast, visible independent focus ring, ≥44×44 targets,
  color-independent meaning, 16 px phone form text, and forced-color resilience.
- [ ] Remove translation/inertia/animated crop/repeated activity under reduced
  motion; keep state understandable with static or sub-100 ms opacity feedback.
- [ ] Ensure video never autoplays with sound, controls remain accessible, and
  transcript provides the text alternative even though export has burned-in
  captions.
- [ ] Verify captions, headline, faces, visual cards, controls, and focus do not
  overlap at zoom/text-spacing/light/dark fixture extremes.

### 4. Measured performance and lifecycle

- [ ] Measure production bundle/routes, initial sample-to-candidate timing,
  editor interaction, transcript rendering, asset/media loading, polling, and
  preview behavior with a documented environment.
- [ ] Lazy-load heavy feature code only at its stage; avoid repeated full-array
  scans/serialization on high-frequency playback/poll events where structurally
  evident.
- [ ] Verify object URLs, media/listeners/timers/animation frames, observers,
  fetch/poll controllers, drawers, and playback state clean up on every stage/
  clear/unmount path.
- [ ] Add focused regressions for every material issue corrected.

## Acceptance criteria

- [ ] The complete signature and recovery flow works at every named viewport,
  short height, intermediate resize, 200% zoom, and text-spacing override with
  no horizontal page scroll or lost action/content.
- [ ] Keyboard-only and Windows screen-reader coverage completes the signature
  flow, including range edit, transcript/evidence, proposal, dialogs, media,
  render, result, and clear with correct focus/announcements.
- [ ] Automated accessibility checks report no critical/serious issue; every
  remaining lower-severity finding has a disposition.
- [ ] Reduced motion and forced colors preserve meaning and usability; no flash,
  autoplay-with-sound, or color-only status remains.
- [ ] Sample reaches candidates within the product goal in the recorded
  production-like test, and bundle/editor/media performance has no unresolved
  measured release blocker.
- [ ] Every correction has focused regression coverage and no duplicate device
  implementation/state authority is introduced.

## Focused verification

- [ ] Run automated accessibility/component/flow/fake E2E checks in a production
  build with network/providers disabled.
- [ ] Complete and record the full responsive/accessibility matrix, including
  intermediate resize, 200% zoom, text spacing, keyboard, screen reader,
  reduced motion, forced colors, slow network/offline, and visibility changes.
- [ ] Record sample timing, bundle/route output, editor interaction evidence,
  and any before/after material performance correction.
- [ ] Re-run only live/manual states strictly needed by a fix and only with
  explicit authorization.
- [ ] Run repository format/lint/typecheck/unit/build/fake E2E,
  `git diff --check`, and final status review.

## Documentation updates

- Add one sanitized manual quality matrix with viewport/state/finding/fix/
  verification/remaining-blocker rows.
- Update approved design tokens/components only when corrections reveal an
  actual system-level issue; synchronize CL-002/parent if material.
- Record performance environment/metrics and keep user/provider content out of
  screenshots and traces.

## Owner gates and external blockers

Final visual/editorial feel and hardware-dependent screen-reader/browser/media
observations may require owner review. Record engineering evidence separately
and never convert missing human/device evidence into a pass. This ticket does
not authorize a live provider call.

## Privacy, provider, and cost constraints

Use fake mode and synthetic/rights-approved assets. Performance/a11y tools,
screenshots, traces, and browser logs must contain no private media, transcript,
credential, signed URL, object name, provider content, or account identifier.

## Commit boundary

Keep the consolidated experience-quality audit and its direct corrections in
`CL-013: complete the experience quality pass`. Do not introduce unrelated
redesign/features or absorb the release audit/deployment. No Git or external
action is authorized by this packet alone.

## Precision references

- [Responsive screen behavior](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#6-screen-by-screen-experience)
- [Visual responsive and motion rules](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#188-motion)
- [Accessibility requirements](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#19-accessibility)
- [Frontend and E2E verification](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2012-frontend-component-and-flow-tests)
- [Manual matrix](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2014-manual-responsiveaccessibility-matrix)

## Completion handoff

Report the matrix/evidence path, each material finding and fix, exact automated
and manual results, focus/screen-reader/motion/forced-color status, measured
performance and environment, changed files, checks, and every owner/device/live
observation still unchecked.
