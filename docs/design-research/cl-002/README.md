# CL-002 React visual prototype research

Accessed: 2026-09-29

Purpose: current, content-safe design research and decision evidence for the
ClipBuilder Next.js/React landing-page visual approval prototype.

The earlier dark editorial/acid-lime synthesis was explicitly rejected by the
owner and is not reused here. The screenshots in `screenshots/` are fresh
captures of public official product pages at desktop and phone viewports. They
are design-research evidence only, never ClipBuilder runtime assets or
permission to copy another product's artwork, copy, layout, or brand language.

## Skills used

- `execute` — forced the owner correction into the source of truth and active
  ticket before implementation, kept work inside CL-002, preserved the explicit
  approval gate, and prohibited staging/committing without new authorization.
- `computer-use` — enabled direct visual inspection of the current official
  pages at 1440 × 1000 and 390 × 844, rather than inferring visual decisions
  from page text alone. It also drives responsive visual QA of the running local
  React result.

The available Figma design/motion skills require a Figma source or Figma write
task, and the Sites skill explicitly excludes development inside an existing
non-Sites web project. No applicable standalone frontend-design or generic
motion implementation skill was present in the current global catalog.

## Official sources and fresh captures

| Product | Official source | Desktop capture | Mobile capture | Why it is relevant |
| --- | --- | --- | --- | --- |
| OpusClip | <https://www.opus.pro/> | `opusclip-desktop-2026-09-29.jpg` | `opusclip-mobile-2026-09-29.jpg` | Direct clipping promise, concentrated CTA hierarchy, immediate product proof, confident reduction on phone |
| Apple MacBook Air | <https://www.apple.com/macbook-air/> | `apple-macbook-air-desktop-2026-09-29.jpg` | `apple-macbook-air-mobile-2026-09-29.jpg` | Product-dominant storytelling, exceptional whitespace, material restraint, precise responsive scaling |
| Descript | <https://www.descript.com/> | `descript-desktop-2026-09-29.jpg` | `descript-mobile-2026-09-29.jpg` | Aggressive type scale, short measure, one-action hierarchy, product surface entering below the fold |
| Captions | <https://captions.ai/> | `captions-desktop-2026-09-29.jpg` | `captions-mobile-2026-09-29.jpg` | Soft premium material field, compact framed navigation, centered product action, vertical-output proof |

OpusClip's current editor page was also reviewed for the useful product idea of
“AI first pass, human last word”: <https://www.opus.pro/ai-video-editor>. The
ClipBuilder prototype carries the inspectable/reversible principle, not its
chat, publishing, trend, growth, or virality claims.

## Concrete visual findings

### OpusClip

- **Layout rhythm:** compact navigation, unusually generous hero air, then a
  large product-media frame immediately after the CTA.
- **Hierarchy:** one declarative headline, one supporting sentence, one dominant
  pill CTA, and a quieter alternate action.
- **Product framing:** the interface/footage is the proof; the hero does not rely
  on an abstract AI illustration.
- **Mobile:** the same promise/action/product order survives; navigation reduces
  sharply and actions become full-width without shrinking type into density.
- **Carry forward:** immediate comprehension, product proof above the first
  major scroll, controlled CTA hierarchy, and confident negative space.
- **Reject:** black as ClipBuilder's dominant palette, “viral” or growth claims,
  social platform marks, user/customer logos, link ingestion, and batch output.

### Apple

- **Layout rhythm:** a thin global bar gives way to a single product story with
  long pauses between ideas.
- **Typography:** the type is quiet because scale, weight, and measure do the
  work; labels, headline, supporting fact, and action form an obvious ladder.
- **Product framing:** the product image owns the largest area. Background color
  supports the object instead of competing with it.
- **Materials:** pale neutral and cool color fields feel substantial without
  heavy shadows, glass panels, or repeated card outlines.
- **Mobile:** the story order is unchanged. Product scale, whitespace, and action
  placement adapt rather than becoming a separate reduced experience.
- **Carry forward:** product-first proof, restrained blue action color, bounded
  content width, calm material layers, and responsive continuity.
- **Reject:** Apple product photography, vocabulary, exact navigation, hardware
  composition, trade dress, and purchase patterns.

### Descript

- A very large headline and short body measure create confidence before product
  detail. The single saturated CTA is unmistakable.
- The product UI begins below the primary message, providing a clean transition
  from promise to proof.
- The mobile page preserves headline impact instead of replacing it with a dense
  app-like shell.
- ClipBuilder can borrow the clarity and scale, but not Descript's serif identity,
  burgundy/coral palette, copy, or Underlord product composition.

### Captions

- A subtle warm-to-cool field makes a light page feel premium without forcing
  every surface into a card.
- The outlined navigation and large rounded product surface form a clear frame;
  the central action remains legible on phone.
- Vertical result examples make output format tangible immediately.
- ClipBuilder can borrow tonal layering and output legibility, but not the grain
  texture, serif wordmark/headline, Prism imagery, output thumbnails, or exact
  peach/cyan gradient.

## Research-to-design mapping

| Research principle | ClipBuilder translation |
| --- | --- |
| One direct promise | “Find the moment. Keep the final word.” with a bounded supporting sentence |
| Product is the proof | An original synthetic transcript → grounded range → 9:16 cut frame built in React/CSS |
| One dominant action | “Preview the sample experience” scrolls to the visual product proof; it does not claim to process media |
| Quiet secondary action | “Review privacy & limits” jumps to an honest disclosure section |
| Generous whitespace | 1280 px content bound, wide desktop gutters, deliberate 96–128 px section rhythm |
| Restrained materials | Light cloud canvas, white product surfaces, cool gray grouped layer, one deep ink preview stage |
| Singular accent | Cobalt only for primary action, selected evidence, focus-independent cues, and rare proof highlights |
| Same story on phone | Promise → action → product proof → evidence principles → limits; no desktop-only content |
| Product-explanatory motion | Hero/product entrance and transcript/range sequencing explain the product once; no perpetual AI theater |

## Motion, scroll, and material implementation review

Current official sources were checked on 2026-09-29 before the revision. The
comparison is deliberately implementation-specific: this page needs one
three-step narrative and a selective glass recipe, not a general animation or
component platform.

| Option | Current evidence | Fit for React 19 / Next 16, SSR, and accessibility | Decision |
| --- | --- | --- | --- |
| Motion 13.4.4 | MIT package; React 18/19 peers; `LazyMotion` documents a 4.6 kB feature path versus roughly 34 kB for the full component; first-party `useScroll` and `useReducedMotion` APIs | Strong React fit and reduced-motion story; still creates a client/runtime dependency for behavior the platform can supply here | Do not install for this bounded prototype |
| GSAP 3.15 + ScrollTrigger | Actively maintained package; official ScrollTrigger supports pin/scrub/toggle behavior; official React helper provides SSR-safe effect selection and cleanup; GSAP uses its own no-charge standard license rather than MIT | Powerful and robust, but an imperative animation runtime and license surface are disproportionate for three semantic steps | Do not install |
| Lenis 1.3.26 | MIT, React peer `>=17`, React wrapper available, and current releases honor reduced-motion by default | React 19 compatible, but it changes global scrolling/anchor behavior and adds an RAF loop where native scrolling is already sufficient | Do not install |
| React Bits | React 19 package with a wide dependency set including Motion, GSAP, Lenis, and Three; MIT plus Commons Clause restrictions | Broad visual catalog, but licensing/dependency breadth and effect-led components do not fit a bespoke evidence narrative | Do not use |
| Magic UI | MIT source; registry components commonly assume Tailwind/shadcn and Motion | Copy-in model avoids a package runtime, but imports unrelated styling conventions and maintenance ownership into this CSS-module page | Do not use |
| Aceternity UI | Official material describes Next.js 15, Tailwind, and Framer Motion assumptions | No clear advantage for the current Next 16/CSS-module page; component-specific licensing and dependency boundaries were not sufficiently explicit in the official catalog reviewed | Do not use |
| Web platform | `IntersectionObserver` is widely available and asynchronous; `backdrop-filter` is Baseline 2024; CSS scroll timelines are progressive enhancement; `prefers-reduced-transparency` exists but has limited availability | Server-rendered semantic content remains visible without JS. One small client island can activate steps; unsupported CSS retains the complete layout. Media-query and opaque fallbacks cover reduced motion/transparency and forced colors | **Selected: no new dependency** |

Selected architecture:

- Keep the page itself a Server Component and isolate step observation in
  `process-narrative.tsx`.
- Render the complete ordered list in the initial HTML. `IntersectionObserver`
  adds only an active presentation cue; it never gates content, navigation, or
  reading order.
- Use a sticky visual rail and transform/opacity transitions for continuity.
  CSS view timelines add reversible scroll-linked polish only inside
  `@supports`; the static/observer baseline remains complete.
- Use opaque dark-blue surfaces by default, then enable true translucent glass
  with `backdrop-filter` only when supported. `prefers-reduced-transparency`
  restores opaque surfaces where exposed, and forced colors removes decorative
  compositing.
- Do not override native scrolling. Reduced motion removes ambient, entrance,
  scroll-linked, and active-step transitions while keeping every step visible.

Official implementation sources:

- Motion package and docs: <https://github.com/motiondivision/motion/blob/main/packages/motion/package.json>,
  <https://motion.dev/docs/react-lazy-motion>,
  <https://motion.dev/docs/react-use-scroll>, and
  <https://motion.dev/docs/react-use-reduced-motion>
- GSAP and React helper: <https://github.com/greensock/GSAP/blob/master/package.json>,
  <https://gsap.com/docs/v3/Plugins/ScrollTrigger/>, and
  <https://github.com/greensock/react>
- Lenis package and React wrapper: <https://github.com/darkroomengineering/lenis/blob/main/package.json>
  and <https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md>
- React Bits package/license: <https://github.com/DavidHDev/react-bits/blob/main/package.json>
  and <https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md>
- Magic UI source/registry: <https://github.com/magicuidesign/magicui> and
  <https://github.com/magicuidesign/magicui/blob/main/registry.json>
- Aceternity implementation assumptions: <https://ui.aceternity.com/brand-facts>
- Web platform references: <https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API>,
  <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter>,
  <https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations>,
  and <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-transparency>

## Palette and type exploration

### A — Luminous Navy / Cloud / Cobalt — selected, revised

- Structural field `#07142F` → `#0B2D78` → `#1B63F0`, canvas `#F6F7FB`,
  surface `#FFFFFF`, grouped layer `#EDF0F6`, ink `#0B1020`, secondary
  `#596174`, border `#DCE1EA`, cobalt `#3157D5`.
- Single neo-grotesk system sans for display/body/UI plus local system mono for
  timecode and word ranges.
- **Why selected:** the owner asked to promote the first pass's strongest navy
  proof field into the structural identity. The luminous field now carries the
  hero and major transitions while cloud product surfaces preserve Apple's
  restraint and the eventual editor's legibility. Blue, rather than violet,
  remains the singular chromatic idea.

### B — Porcelain / Carbon / Persimmon — not selected

- Warm off-white, dark charcoal, and a restrained orange-red signal.
- Humanist sans body with an editorial serif display role.
- **Why not:** expressive and premium, but too close to the warm editorial
  personality already used by Captions/Descript and less precise for product UI.

### C — Graphite / Frost / Violet — not selected

- Near-black product field, cold white type, and violet-blue accent.
- Wide geometric display sans with neutral body sans.
- **Why not:** visually forceful but too close to the rejected dark direction
  and the generic AI-product palette the source of truth explicitly avoids.

## Typography and font-loading plan

- Prototype: `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`,
  sans-serif; `"SFMono-Regular"`, `Cascadia Code`, `Consolas`, monospace for
  compact evidence metadata. This keeps local review and CI network-free.
- Production candidate after approval: source-controlled Geist Sans variable and
  Geist Mono, or an owner-approved equivalent, with license files committed next
  to the binaries. No remote font CDN and no font binary before approval.
- Display uses the same sans at 620–680 weight, `clamp()` sizing, -0.05em to
  -0.025em tracking, and 0.94–1.02 line-height.
- Body stays 16–20 px with 1.55–1.65 leading and a 64–72 character measure.
- Mono never carries long-form text; it labels time, word range, and visual
  prototype status only.

## Motion contract

| Token | Duration | Use |
| --- | ---: | --- |
| `--motion-press` | 120 ms | Press, focus-adjacent state, active control |
| `--motion-hover` | 180 ms | Hover border/fill and small product cue changes |
| `--motion-panel` | 360 ms | Product-frame, active-step, and proof-panel continuity |
| `--motion-entrance` | 640 ms | One-time hero copy and product-media entrance |
| `--motion-ambient` | 12–18 s | Transform-only hero light drift; decorative and nonessential |

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` for settle; `cubic-bezier(0.2, 0, 0, 1)`
  for direct control feedback.
- Hero copy enters first; CTA and product frame follow with a short, bounded
  delay. The synthetic transcript highlight, range, and 9:16 preview cues
  sequence once to explain source → evidence → cut.
- “How it works” uses a sticky server-rendered narrative with a tiny
  `IntersectionObserver` client island for active-step presentation. CSS
  view-timeline motion is progressive enhancement. The default state is
  visible, so unsupported browsers or disabled JavaScript never hide content.
- Motion is transform/opacity-only where possible. No filters in motion, layout
  animation, autoplaying media, infinite marquee, pulse, or faux progress.
- `prefers-reduced-motion: reduce` disables smooth scroll, all translation,
  sequencing, and repeated motion; content appears immediately in final state.

## Owner gate

This synthesis and the resulting React prototype remain provisional until the
owner explicitly approves or requests revisions. Implementation or Git activity
does not count as visual approval.

### Revision request — 2026-09-29

The owner did not approve the first React pass. The next pass must carry the
existing deep navy/cobalt “A first cut you can question” material much farther
through the hero and section transitions, introduce a consistent glass system,
make the hero feel immediately alive, and turn “How it works” into a true
scroll-driven narrative. Generic purple AI gradients, indiscriminate blur,
particle noise, hidden unsupported-browser content, and a large client bundle
remain out of bounds. Current library research and a dependency decision must
be added here before the revised implementation is considered complete.

## Local prototype review evidence

- Running review surface: `http://127.0.0.1:3000/` from the production build.
- Revised desktop and phone hero/product compositions were captured and
  visually inspected in the in-app browser; the production pass contains no
  Next.js development badge.
- The responsive matrix covered 320 × 568 through 2560 × 1440 plus a 1280 × 640
  short-height case and a 720 × 450 200%-zoom equivalent. No horizontal page
  overflow or clipped primary action remained.
- The browser's active reduced-motion preference produced `0s` ambient
  animation, one iteration, `0.000001s` transitions, and disabled smooth
  scrolling while preserving all content.
- Keyboard order, first-focus skip link, visible focus treatment, semantics,
  44 px target sizing, core color contrast, forced-colors CSS, text-spacing
  resilience, localhost-only assets, and localhost console output were checked.
- One QA correction was made: the phone header action increased from 42 px to
  the 44 px minimum, then passed at both 320 px and 390 px widths.
- The page remains synthetic and non-operational. One narrow client island
  changes only the active narrative cue while scrolling; product cues explain
  source → evidence → cut, but no upload, analysis, provider, media, or render
  path is present.
- The current production browser exposed working `backdrop-filter` and CSS view
  timelines, no external resource URL, and no warning/error console entry.
  Opaque unsupported-browser, reduced-transparency, forced-colors, and
  JavaScript-free content baselines are explicit in source.
