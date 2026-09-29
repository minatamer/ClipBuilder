# CL-002 — Create and approve the visual reference

Status: Awaiting owner visual approval<br>
Milestone: M0 — foundation and visual gate<br>
Last synchronized: 2026-09-29<br>
Depends on: CL-001<br>
Blocks: CL-004 broad styling and CL-010 editor styling<br>
Suggested commit: `CL-002: create the ClipBuilder visual reference`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Create the standalone HTML design-system reference plus one signature desktop
editor concept and one phone adaptation, validate them against the product and
accessibility contract, and record explicit owner approval or requested
changes before broad React styling begins.

## Portfolio value

Turn “Editorial Signal Room” from prose into a reviewable visual system whose
tokens, components, responsive composition, and media/editor states can be
implemented consistently and reproduced by the deterministic renderer.

## Standalone implementation context

- The product should feel like a compact editorial cut room where evidence
  becomes a cut: focused, high-contrast, quietly technical, and decisive.
- The visual language is the video frame, transcript marks, word ranges,
  evidence links, cut marks, visual-beat tracks, and proposal diffs—not generic
  chat bubbles, AI orbs, purple gradients, dashboard charts, or social-platform
  cosplay.
- Proposed palette is near-black working surfaces, warm paper transcript
  surfaces, acid-lime signal accent, independent blue focus ring, and semantic
  warning/danger/success colors. It is not locked until owner approval.
- The reference must represent real product states and the single semantic
  responsive model. It may propose composition but may not invent behavior,
  omit recovery, or override accessibility.
- Broad implementation styling waits at this ticket's approval gate. CL-003's
  nonvisual state/fixture work may proceed in parallel.

## Dependency evidence required

Confirm CL-001 provides the real workspace, formatting/accessibility tooling,
ignore rules, and safe static-document location. Run its smallest relevant
format/lint check; do not recreate or bypass the foundation if it differs.

## Files and areas owned

- `docs/AI_CLIPPING_DESIGN_SYSTEM.html` (or a synchronized ClipBuilder-named
  path if the owner approves renaming the parent blueprint).
- Local, source-controlled design assets used only by the reference.
- A short approval/evidence section in this ticket; no React feature code.
- Parent design tokens/text only if the approved direction materially changes
  them.

## Scope boundaries

### In scope

- Color, type, spacing, radius, border/elevation, icon, focus, and motion tokens.
- Buttons, fields, textarea, checkbox, notices, badges, progress stages,
  candidate/evidence card, transcript treatment, range control, proposal diff,
  dialog/drawer, artifact facts, and media/editor states.
- Signature desktop editor at ≥1440 px and guided phone editor at 320–390 px.
- Representative landing, progress, failure, empty, disabled, hover, focus,
  selected, reduced-motion, and high-contrast considerations.
- Generated-visual/card art direction `editorial-signal-v1`, including caption,
  face, headline, and overlay safe zones.
- Owner feedback record with approval status and exact revisions.

### Out of scope

- Production React components, routing, reducer/state, provider calls, media
  playback, live uploads, generated production images, or backend work.
- A generalized component library, dashboard shell, design variants for future
  SaaS features, marketing-site sprawl, or animation showpiece.
- Product-name changes, domain purchase, visual-provider selection, or any
  public/live approval not specifically about the visual direction.

## Implementation checklist

- [x] Implement the provisional source-of-truth token table in one editable,
  accessible HTML reference without remote fonts, scripts, or assets.
- [x] Use a licensed/source-controlled sans and mono plan with system fallbacks;
  record any intended font files and licenses without adding unapproved binaries.
- [x] Demonstrate all core primitives and their keyboard/focus/error/disabled
  states with meaningful ClipBuilder copy.
- [x] Create a desktop editor concept with transcript/evidence, 9:16 preview,
  assistant proposal/diff, and range/caption/speaker/visual tracks.
- [x] Create a phone concept that preserves playback, word-boundary trim,
  caption correction, visual summary, assistant proposal, render, and clear.
- [x] Show at least one assembly progress state, candidate review state,
  full-frame contextual image state, and deterministic equation-card state.
- [x] Demonstrate safe-zone layering: captions above footage/visuals, bounded
  headline, no unintended face or caption obstruction.
- [x] Verify color contrast, visible focus, target sizes, text scaling, natural
  short-height scrolling, no horizontal overflow, and reduced motion.
- [ ] Record owner feedback as explicit accepted/rejected changes and update the
  parent/ticket if approval alters material tokens or composition.

## Locked behavior the concept must preserve

- Sample is the first primary action; upload limits/rights are visible, not
  hidden in a tooltip.
- Candidate reasoning references exact transcript evidence and time; rank is
  not a virality score.
- Analysis/assembly/render progress uses named stages, no fake percentages.
- The editor is a real manifest-driven workspace, not a chat application.
- Speaker framing is automatic/inspectable, not a manual left/right selector.
- Visuals are sparse grounded cues, not an asset marketplace.
- Proposal diff requires explicit Apply; undo/redo and manual controls remain.
- Clear and privacy/limits stay reachable at every relevant responsive mode.

## Acceptance criteria

- [x] One self-contained HTML reference covers tokens, states, components, the
  signature desktop editor, and the guided phone editor.
- [x] The direction is recognizably “Editorial Signal Room” and avoids every
  documented visual anti-goal.
- [x] All demonstrated controls have names, visible focus, sufficient target
  size, contrast, and a reduced-motion/high-contrast strategy.
- [x] Desktop and phone concepts preserve identical product capabilities with
  different composition rather than separate implementations.
- [x] The reference uses no remote runtime dependency, unlicensed asset, fake
  provider output, secret, or real user content.
- [ ] Owner approval or requested changes are recorded explicitly; no later
  ticket interprets silence as approval.

## Focused verification

- [x] Open the reference at phone, tablet, compact laptop, desktop, and
  large-monitor widths plus a 600–700 px short height.
- [x] Check keyboard order, focus visibility, native semantics, 200% zoom,
  text-spacing overrides, forced-colors behavior, and reduced motion.
- [x] Run automated HTML/accessibility checks available in the repository, then
  perform visual review because automation cannot approve art direction.
- [x] Confirm no remote request, horizontal page scroll, clipped primary action,
  or hidden Clear/privacy affordance.
- [x] Capture only content-safe evidence; do not add secret-bearing browser or
  provider screenshots.

## Review evidence — 2026-09-29

- Standalone reference: [`../AI_CLIPPING_DESIGN_SYSTEM.html`](../AI_CLIPPING_DESIGN_SYSTEM.html).
- Research synthesis and official-source log:
  [`../design-research/cl-002/README.md`](../design-research/cl-002/README.md).
- Original local review captures:
  `clipbuilder-reference-overview.png`, `clipbuilder-editor-desktop.png`, and
  `clipbuilder-editor-phone.png` under `docs/design-research/cl-002/screenshots/`.
- Retained research captures are public official product pages only. An Adobe
  HelpX automated-access denial was discarded instead of being kept as false
  visual evidence.
- `corepack pnpm format:check` and `corepack pnpm lint` passed.
- Browser DOM audit found 40 named interactive controls, no duplicate IDs, one
  header/nav/main/footer landmark set, no console warnings or errors from the
  local page, and no remote `link`, `script`, `img`, or `iframe` dependency.
- Responsive checks passed at 320 × 700, 390 × 844, 768 × 1024, 1180 × 650,
  1440 × 1000, and 1920 × 1080. Each reported page scroll width equal to
  client width; Clear, privacy, and render remained reachable.
- Keyboard inspection covered the first 14 focus stops: skip link, wordmark,
  guide links, hero actions, then component controls. Every stop was visible
  and carried a solid focus outline.
- A 720 CSS-pixel viewport at device scale 2 exercised the 200%-zoom reflow
  equivalent with no horizontal overflow. The same run applied enhanced line,
  letter, and word spacing; primary render action remained visible.
- Browser media emulation confirmed `prefers-reduced-motion: reduce` and
  `forced-colors: active` both match. Animation and transition durations
  collapse to `0.001ms` in reduced motion.
- Calculated contrast ratios: primary text/canvas 18.05:1,
  secondary text/surface 10.78:1, muted text/surface 6.30:1,
  ink/signal 11.18:1, focus/surface 9.95:1, danger/surface 10.35:1, and
  ink/paper 15.36:1.

### Owner visual decision

Status: **awaiting explicit owner review**. No approval is inferred from silence
or from authorization to commit the review package.

The owner still needs to accept or revise:

1. the Night Edit / Signal Amber palette as the alternative to the parent's
   provisional acid-lime signal;
2. the editorial serif, practical sans, and mono pairing plus the proposed
   source-controlled font bundle;
3. the three-pane desktop composition and guided phone section order; and
4. the separate production-UI and rendered-video motion contracts.

The parent source of truth is intentionally unchanged until that decision is
explicit. Broad CL-004 and CL-010 styling remains blocked by this gate.

## Documentation updates

- Update the parent's design section if the owner changes tokens, composition,
  font choice, or art direction.
- Record approval date/status and concise decision rationale in this packet.
- Update affected later packets in the same change if approval changes their
  implementation contract.

## Owner gates and external blockers

This ticket ends at an explicit owner visual gate. The HTML/concepts may be
completed without that approval, but CL-004 broad styling and production editor
styling remain blocked until the owner accepts or revises the direction.

## Privacy, provider, and cost constraints

Use synthetic/placeholding media and text only. Do not call an image model,
load remote production media, purchase fonts/assets, change provider settings,
or create cloud resources.

## Commit boundary

Keep CL-002 documentation/design-only and reviewable as
`CL-002: create the ClipBuilder visual reference`. Do not absorb production UI
implementation. Do not stage, commit, push, purchase, deploy, or mutate external
systems without separate authorization.

## Precision references

- [Screen-by-screen experience](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#6-screen-by-screen-experience)
- [Editor workspace and responsive behavior](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#67-editor-workspace)
- [Visual design system](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#18-visual-design-system)
- [Accessibility](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#19-accessibility)
- [Manual responsive/accessibility matrix](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2014-manual-responsiveaccessibility-matrix)

## Completion handoff

Report the reference path, tokens/components/states represented, viewport and
accessibility checks, local asset/license status, exact owner feedback or
approval state, resulting parent/ticket updates, and every unresolved visual
decision. Never claim owner approval that was not explicitly given.
