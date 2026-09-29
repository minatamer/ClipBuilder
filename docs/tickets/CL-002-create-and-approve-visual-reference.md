# CL-002 — Build and approve the React visual prototype

Status: Owner revisions requested — glass-material revision implemented, approval pending<br>
Milestone: M0 — foundation and visual gate<br>
Last synchronized: 2026-09-29<br>
Depends on: CL-001<br>
Blocks: CL-004 broad styling and CL-010 editor styling<br>
Suggested commit: `CL-002: rebuild the visual approval prototype`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Research current premium product and AI-video landing experiences, then build a
real responsive ClipBuilder landing-page visual prototype in the existing
Next.js/React frontend. The running page is the canonical surface for judging
typography, spacing, color, product-media framing, interaction, motion, and
responsive feel before broad application styling begins.

## Owner correction superseding the rejected direction

The owner explicitly rejected the earlier standalone full-page HTML concept,
its dark editorial composition, and its acid-lime/signal treatment. Do not
iterate on or preserve that composition as a competing reference.

The desired direction is closer in quality—not copied composition—to current
OpusClip and Apple landing pages: exceptionally modern, minimal, premium,
confident, spacious, precise, and restrained. Translate current research into
ClipBuilder's own product identity and honest scope.

## Owner revisions requested after the first React review

The first React pass was judged visually decent but not approved. The owner
requested these specific revisions on 2026-09-29:

1. Extend the deep navy-to-blue luminous field already visible behind “A first
   cut you can question” across the hero, section transitions, and other
   structurally appropriate moments. Keep it blue-led and coherent rather than
   a generic purple AI gradient.
2. Establish a real glass material system for the sticky navigation, primary
   and secondary CTAs, and selected surfaces using translucency, blur,
   specular borders/highlights, readable contrast, opaque unsupported-browser
   fallbacks, forced-colors handling, and reduced-transparency consideration.
3. Make the hero immediately more alive through layered, tasteful entrance,
   ambient, and product-explanatory motion.
4. Rework “How it works” into a genuine smooth scroll-driven narrative with
   spatial continuity and step activation while retaining semantic order,
   keyboard access, visible unsupported-browser content, transform/opacity
   performance discipline, and complete reduced-motion behavior.
5. Research current animation, scroll-orchestration, and glass/component
   options before choosing an implementation. Compare maintenance, React 19 /
   Next 16 compatibility, license, bundle/client cost, SSR, accessibility, and
   reduced-motion support; add only the smallest justified dependency set.
6. Re-inventory relevant skills and record exact skill-to-output evidence. The
   current implementation and Git state do not count as approval.
7. The second-pass navbar still reads as an opaque gray strip, not a perceptible
   premium glass bubble. Research native CSS, SVG displacement, React liquid-
   glass components, and mature motion/scroll options; then revise and visually
   prove the navbar, pill CTAs, and selected materials at normal and reduced
   motion. A valid blur declaration or prior commit is not acceptance.

## Standalone implementation context

- ClipBuilder turns one owned/licensed conversation into grounded candidate
  moments and one inspectable 10–60 second vertical edit.
- The product itself is the visual proof: source evidence, transcript cues,
  vertical preview, and reversible edit ranges—not abstract AI decoration.
- The prototype is a visual approval surface only. It does not upload, analyze,
  call providers, persist a session, or render media.
- All content is synthetic and clearly labeled. The page must not imply that a
  visual-only action already performs a later-ticket workflow.
- Broad CL-004 and CL-010 styling waits for explicit owner approval. CL-003's
  nonvisual state/fixture work may proceed independently.

## Dependency evidence required

Confirm CL-001 provides the real Next.js workspace, accessible shell,
format/lint/type/test/build tooling, ignore rules, and fake/paid-disabled
foundation. Reuse it rather than creating a parallel prototype application.

## Files and areas owned

- `apps/frontend/src/app/page.tsx` — canonical landing visual prototype.
- `apps/frontend/src/app/page.module.css` — page-local responsive visual system
  and motion implementation.
- `apps/frontend/src/app/process-narrative.tsx` — narrow client island for
  scroll-driven active-step presentation; all narrative content remains in the
  server-rendered HTML.
- `apps/frontend/src/app/layout.tsx` and focused frontend tests/readme only where
  metadata, global shell, or verification ownership requires it.
- `docs/design-research/cl-002/` — current source log, design synthesis, and
  content-safe desktop/mobile research and local review captures.
- This ticket, the ticket index, and the parent's contradicted visual/reference
  language.
- The rejected `docs/AI_CLIPPING_DESIGN_SYSTEM.html` must be removed. A narrow
  token/type specimen may be introduced later only if it adds non-competing
  value.

## Scope boundaries

### In scope

- Current official research into OpusClip and Apple at desktop and mobile sizes,
  plus a small number of directly relevant AI-video competitors.
- Concrete analysis of layout rhythm, whitespace, type scale, product-media
  framing, CTA hierarchy, navigation, section transitions, proof presentation,
  subtle materials, and motion.
- Brief exploration of multiple credible palette/type directions, one selected
  direction, and written rationale.
- A production-framework landing prototype with an accessible header, hero,
  trust/status disclosure, synthetic product-media proof, evidence sequence,
  focused explanatory sections, privacy/limits content, and honest CTA behavior.
- Responsive typography/composition from 320 px through large monitors,
  short-height flow, keyboard focus, 200% zoom, forced colors, reduced motion,
  and no horizontal page overflow.
- First-class motion tokens and implementation for entrance, product cues,
  section continuity, hover/focus feedback, and complete reduced-motion behavior.

### Out of scope

- Session reducer, source selection state, file access, upload, analysis,
  candidates, assembly, editor state, provider calls, media playback, render,
  persistence, backend work, or cloud resources.
- A working marketing CMS, analytics, account/billing navigation, pricing,
  testimonials, fake customers, or unsupported integration logos.
- Copied competitor assets, copy, layout, screenshots inside the product,
  remote production media, downloaded fonts, or image-model generation.
- Production contextual-visual generation or final editor component styling.

## Implementation checklist

- [x] Record fresh official-source research with access dates and desktop/mobile
  visual evidence for OpusClip, Apple, and selected relevant competitors.
- [x] Extract reusable principles and explicit anti-copy boundaries.
- [x] Explore at least three credible palette/type directions and document the
  selected direction with rationale.
- [x] Replace the foundation homepage with the real responsive React visual
  prototype; do not create a parallel application or standalone full-page HTML.
- [x] Implement a high-quality type hierarchy, font fallback/loading plan,
  spacious grid, restrained palette, product-media framing, and CTA hierarchy.
- [x] Implement the revised layered hero, product-cue, scroll-narrative,
  section, hover, press, and focus motion
  with explicit durations/easing and transform/opacity performance constraints.
- [x] Implement complete `prefers-reduced-motion` behavior that renders all
  content immediately without spatial or repeated animation.
- [x] Keep synthetic/fake status, privacy/limits, rights, and visual-prototype
  limitations honest and visible.
- [x] Update focused tests and frontend documentation for the changed visual-only
  responsibility.
- [x] Capture and inspect the revised running result at representative desktop and phone
  widths before requesting owner approval.
- [x] Record owner feedback as explicit accepted/rejected changes; never infer
  approval from implementation, silence, or Git authorization.

## Locked behavior the prototype must preserve

- The sample experience is visually primary; upload limits/rights remain visible
  and are never hidden behind a tooltip.
- No action claims to upload, analyze, generate, or render in this ticket.
- Candidate ordering is editorial and transcript-grounded, never a virality
  score or growth guarantee.
- Named stages and inspectable evidence replace fake percentages and AI theater.
- Product framing represents a manifest-driven edit, not a chat application.
- Clear/privacy/limits remain part of the future responsive contract even when
  the landing prototype has no active source to clear.

## Acceptance criteria

- [x] The existing Next.js application renders one canonical visual prototype at
  `/`; no rejected competing full-page HTML concept remains.
- [x] The result is recognizably ClipBuilder and materially reflects the
  documented current research without copying another company's protected
  assets, copy, or distinctive composition.
- [x] The revised direction is modern, minimal, premium, confident, spacious, precise,
  and restrained; the rejected dark/acid-lime direction is absent.
- [x] Typography, whitespace, hierarchy, glass material, product-media framing, CTA priority,
  and motion read as deliberate at both desktop and phone widths.
- [x] Every interactive element has a clear name, visible focus, sufficient
  target size/contrast, and honest visual-prototype behavior.
- [x] The page uses no remote runtime dependency, unlicensed asset, secret, real
  user content, provider output, or paid/live path.
- [x] Reduced motion, forced colors, material fallbacks, 200% zoom, text spacing, short height, and
  widths from 320–2560 px preserve content and actions without page overflow.
- [ ] The current rework receives explicit owner visual approval; any further
      requested changes are recorded explicitly.

## Focused verification

- [x] Run frontend format, lint, typecheck, unit tests, and production build.
- [x] Inspect 320 × 568, 390 × 844, 768 × 1024, 1024 × 768, 1280 × 800,
  1440 × 900, 1920 × 1080, 2560 × 1440, and a 600–700 px short height.
- [ ] Check keyboard order, focus visibility, semantics, target sizes, 200% zoom,
  text-spacing overrides, forced colors, and reduced motion.
- [x] Confirm no remote runtime request, console error, horizontal page scroll,
  clipped primary action, misleading active control, or hidden privacy/limits.
- [x] Capture content-safe desktop and phone review evidence from the running
  Next.js application.

## Superseded first-pass review evidence

- Canonical route: `/` in the existing `@clipbuilder/frontend` Next.js app.
- The page stays a static Server Component and uses one colocated CSS Module;
  there is no client state, remote font, third-party visual package, or runtime
  media dependency.
- Current official research and eight dated desktop/phone captures are recorded
  in `docs/design-research/cl-002/`.
- Responsive browser inspection covered 320 × 568, 390 × 844, 768 × 1024,
  1024 × 768, 1280 × 800, 1440 × 900, 1920 × 1080, 2560 × 1440, and
  1280 × 640. Every size preserved a single H1, product proof, privacy content,
  and zero horizontal document overflow.
- The 320 px and 390 px runs exposed one 42 px header target; it was corrected
  to 44 px and rechecked. All visible links now meet the 44 × 44 px target rule.
- Keyboard review confirmed the skip link is first, becomes visible on focus,
  and is followed by a logical header → hero → footer sequence. Focus rings are
  3 px `#006BFF` with a 4 px offset.
- A 720 × 450 CSS-pixel run exercised the 1440 × 900 / 200% equivalent layout;
  the H1 and primary action remained available with no horizontal overflow.
- Text-spacing resilience was checked structurally: text containers are not
  fixed-height, long copy is not nowrap, and the page clips only horizontal
  decorative overflow. Forced-colors rules retain borders, controls, selection
  cues, and focus outlines.
- The review environment actively preferred reduced motion. Computed animation
  durations were `0.001ms`, smooth scrolling was disabled, and all content
  remained present in final state.
- Core contrast ratios are 17.68:1 ink/canvas, 5.79:1 secondary/canvas,
  6.08:1 white/brand, and 4.62:1 focus/white.
- Runtime inspection found no remote asset element and no localhost console
  warning/error. The visual actions are in-page links only; there are no buttons
  or controls that imply an implemented upload, analysis, generation, or render.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, and
  `pnpm build` pass. The frontend production build prerenders `/`,
  `/_not-found`, and `/robots.txt`.
- The production build was inspected at desktop and phone sizes without the
  Next.js development badge. The owner requested the navy/glass/motion revisions
  above; this evidence no longer closes the current QA checklist.

## Documentation and owner gate

- Research evidence and the palette/type exploration live in
  `docs/design-research/cl-002/README.md`.
- The parent source of truth owns the provisional visual tokens, React prototype
  authority, and updated visual gate.
- This ticket ends at explicit owner visual approval. CL-004 broad styling and
  CL-010 editor styling remain blocked until the owner accepts or revises the
  running prototype.

## Revised implementation and verification evidence

- The navy-to-cobalt luminous field now carries the hero, product-proof handoff,
  scroll narrative, bounded proposal proof, and final CTA. The palette remains
  blue-led; there is no purple AI gradient or acid-lime remnant.
- Header, badges, CTAs, hero proof, narrative visual, and proposal proof use one
  selective glass recipe with specular edges. Opaque defaults precede the
  `backdrop-filter` enhancement; explicit reduced-transparency and forced-colors
  rules remove compositing where needed.
- The hero layers a transform-only ambient field, bounded entrance sequence,
  transcript cue, evidence handoff, and 9:16 result cue. The review machine's
  active reduced-motion preference produced `0s` ambient animation,
  one iteration, `0.000001s` transitions, and `scroll-behavior: auto` while all
  content remained visible.
- `process-narrative.tsx` and the narrow `glass-action.tsx` CTA adapter are the
  only new client boundaries. The narrative's asynchronous
  `IntersectionObserver` changed the live readout through Source → Evidence →
  Control during real scrolling. The initial HTML retained all three ordered
  steps and one H1; absent JavaScript or CSS timeline support only removes the
  active presentation cue.
- Motion/scroll review covered Motion 13.4.4, GSAP 3.15/ScrollTrigger,
  Lenis 1.3.26, React Bits, Magic UI, Aceternity UI, and web-platform APIs; native
  scrolling remains selected. The later material review compared native CSS,
  SVG displacement, `@samasante/liquid-glass`, `liquid-glass-react`, Liquefy UI,
  static-map, and WebGL/capture approaches. One MIT, zero-runtime-dependency
  package was added only for compact CTA refraction; the wide navbar remains CSS.
- Browser QA covered 320 × 568, 390 × 844, 768 × 1024, 1024 × 768,
  1280 × 800, 1440 × 900, 1920 × 1080, 2560 × 1440, 1280 × 640, and
  720 × 450 as a 1440 × 900 / 200% equivalent. Every run had one H1, three
  narrative steps, visible privacy content, 44 px minimum visible link height,
  and zero horizontal overflow.
- Keyboard review placed the revealed skip link before header navigation and
  hero actions. Focused links showed the defined 3 px solid cobalt outline;
  the accessibility tree preserved headings, landmarks, list semantics, and
  honest link names.
- The live browser reported support for both `backdrop-filter` and CSS view
  timelines. Stylesheet inspection confirmed the unsupported-material,
  reduced-transparency, and forced-colors branches. Text containers remain
  content-sized; the short-height/200% runs retained actions without clipping.
- Runtime inspection found no warning/error console entries, external resource
  URL, remote media/font, provider path, or paid/live action. Root
  `format:check`, lint, typecheck, 69 unit tests, and the production build pass;
  Next prerenders `/`, `/_not-found`, and `/robots.txt`.
- `execute` kept the work inside CL-002, synchronized owner feedback and gates,
  and enforced the one-commit boundary. `computer-use` supplied the current
  desktop/phone captures, actual scroll activation, responsive matrix, focus
  inspection, media-preference evidence, and console/runtime checks. Figma,
  Sites, image generation, and visualization skills were not applicable to an
  existing code-native React prototype without a Figma source or separate
  artifact request.
- The second pass was committed, but the owner rejected its navbar material as
  visually insufficient. CL-002 is reopened; explicit owner visual approval
  remains open, and neither the existing commit nor its Git authorization
  unblocks CL-004/CL-010 broad styling.
- The third material pass replaces the opaque strip with a fixed floating
  capsule. The luminous hero and later sections now travel beneath a 50% navy
  tint, 18 px blur, saturation/contrast lift, double rim, directional specular
  pools, and depth shadows. Compact CTAs use live SDF displacement in Chromium;
  phone-width pills and WebKit/Firefox retain frost/tint/rim fallbacks.
- Production browser evidence covered top, dark-scroll, light-scroll, hover,
  keyboard focus, final CTA, 390 × 844, and 320 × 568 views. The complete
  320–2560 px matrix plus 1280 × 640 and 720 × 450 retained one H1, three process
  steps, privacy content, 44 px minimum visible links, and zero overflow.
- The browser computed active CTA filters as
  `blur(7px) saturate(1.35) url(#lg-mat-…-v2)`. The package chunk measured
  56,700 bytes minified / 18,019 bytes gzip / 15,906 bytes Brotli. Runtime logs
  contained no warning, error, hydration mismatch, or remote runtime asset.
- The Windows in-app browser directly exercised its active reduced-motion mode.
  It could not supply Safari or normal-motion/forced-colors media emulation, so
  those are recorded as source/fallback review rather than falsely marked as
  native browser execution. The remaining focused-verification checkbox stays
  open for that reason, and owner approval is still required.

## Privacy, provider, and cost constraints

Use synthetic/source-controlled text and CSS shapes only. Do not call an image
model, load remote production media, download fonts/assets, change provider
settings, create cloud resources, or enable any paid/live behavior.

## Commit boundary

Keep CL-002 visual-prototype and documentation work reviewable as
`CL-002: rebuild the visual approval prototype`. Do not absorb production
workflow implementation. Do not stage, commit, push, purchase, deploy, or
mutate external systems without separate authorization.

## Precision references

- [Screen-by-screen experience](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#6-screen-by-screen-experience)
- [Landing and source intake](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#62-landing-and-source-intake)
- [Visual design system](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#18-visual-design-system)
- [Accessibility](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#19-accessibility)
- [Manual responsive/accessibility matrix](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2014-manual-responsiveaccessibility-matrix)

## Completion handoff

Report the running React route, changed files, exact skills used and how each
influenced the work, research sources and screenshots, research-to-design
mapping, palette/type alternatives and selected rationale, motion contract,
viewport/accessibility checks, local asset/license status, exact owner feedback
or approval state, and every unresolved visual decision. Never claim owner
approval that was not explicitly given.
