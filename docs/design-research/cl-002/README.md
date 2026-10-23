# CL-002 React visual prototype research

Accessed: 2026-09-29

Purpose: current, content-safe design research and decision evidence for the
ClipBuilder Next.js/React landing-page visual approval prototype.

The earlier dark editorial/acid-lime synthesis was explicitly rejected by the
owner and is not reused here. The captures of public official product pages
are design-research evidence only, never ClipBuilder runtime assets or
permission to copy another product's artwork, copy, layout, or brand language.

On 23 October 2026, at the owner's request, the eight current captures were
moved out of the working tree into the Desktop folder
`ClipBuilder Research Screenshots - 2026-10-23`. That archive also preserves
eight older screenshot versions recovered from branch/tag history, with
original paths and SHA-256 checksums. The `screenshots/` directory is now
ignored to prevent accidental reintroduction. The filenames below identify
archived research evidence; they are not repository assets. The publication cleanup also removes this directory and its images from
branch history. The separate recovery backup remains owner-local and must
not be pushed back into the cleaned history.

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

## Official sources and archived captures

| Product | Official source | Archived desktop capture | Archived mobile capture | Why it is relevant |
| --- | --- | --- | --- | --- |
| OpusClip | <https://www.opus.pro/> | `opusclip-desktop-2026-09-29.jpg` | `opusclip-mobile-2026-09-29.jpg` | Direct clipping promise, concentrated CTA hierarchy, immediate product proof, confident reduction on phone |
| Apple MacBook Air | <https://www.apple.com/macbook-air/> | `apple-macbook-air-desktop-2026-09-29.jpg` | `apple-macbook-air-mobile-2026-09-29.jpg` | Product-dominant storytelling, exceptional whitespace, material restraint, precise responsive scaling |
| Descript | <https://www.descript.com/> | `descript-desktop-2026-09-29.jpg` | `descript-mobile-2026-09-29.jpg` | Aggressive type scale, short measure, one-action hierarchy, product surface entering below the fold |
| Captions | <https://captions.ai/> | `captions-desktop-2026-09-29.jpg` | `captions-mobile-2026-09-29.jpg` | Soft premium material field, compact framed navigation, centered product action, vertical-output proof |

OpusClip's current editor page was reviewed only for product-proof framing:
<https://www.opus.pro/ai-video-editor>. ClipBuilder does not adopt its editor,
chat, publishing, trend, growth, or virality behavior. Its visitor interaction
ends at choosing one candidate and confirming the automatic clip.

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
  CSS view timelines add scroll-linked polish only inside
  `@supports`; the static/observer baseline remains complete.
- Use opaque dark-blue surfaces by default, then enable true translucent glass
  with `backdrop-filter` only when supported. `prefers-reduced-transparency`
  restores opaque surfaces where exposed, and forced colors removes decorative
  compositing.
- Do not override native scrolling. Reduced motion removes ambient, entrance,
  scroll-linked, and active-step transitions while keeping every step visible.

Owner overrides recorded on 2026-09-29 and 2026-09-30 supersede that selected
reduced-motion implementation for this prototype. The hero rotation and
synchronized conversion story now run at full timing in every local
motion-preference state; the later split-hero review removes the hero's
pause/play control completely. This is a documented accessibility exception to
revisit before public release and during CL-013, not a general product
recommendation.

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
  restraint and the eventual workflow's legibility. Blue, rather than violet,
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

The reduced-motion bullets above preserve the original research recommendation.
They are superseded for the CL-002 visual-approval build by the owner override
recorded in this file and the active ticket.

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

### Glass-material rejection — 2026-09-29

The owner rejected the second-pass navbar material even though the stylesheet
contained `backdrop-filter`. In the reviewed pixels it remained a rectangular,
nearly opaque gray/navy strip, with too little background detail crossing the
material and no clear floating bubble silhouette, edge refraction, or specular
depth. A CSS declaration is not evidence of the target. The next pass must
compare current native, SVG-displacement, and React liquid-glass techniques,
select the smallest responsible approach, and capture before/after desktop and
phone evidence including content moving behind the floating navigation.

### Liquid-glass implementation review — 2026-09-29

The rejected pixels were caused by composition, not a missing declaration. The
full-width sticky header occupied its own dark block, its supported background
was still `rgba(7 20 47 / 0.7)`, and the hero began below it. Almost no detailed
content crossed the filter, so blur and saturation had nothing visible to bend
or diffuse. The bar also had no capsule silhouette, bright rim, inner edge,
specular pool, or depth shadow. `backdrop-filter` was technically active but the
result correctly read as an opaque strip.

The runtime audit found no CSP or remote runtime asset, no ancestor transform
around the header, and no z-index conflict. The header sat outside the hero's
isolated stacking context. The material failure was therefore not Next.js,
CSS Modules, SSR, or GPU support. The active Chromium review browser exposed
`backdrop-filter`; the same environment also preferred reduced motion but not
reduced transparency or forced colors.

| Candidate | Maintenance, license, and adoption evidence | Browser / React / performance fit | Decision |
| --- | --- | --- | --- |
| Native layered CSS | Web platform; `backdrop-filter` is Baseline 2024 and needs a transparent surface plus visible backdrop detail | No client bundle or hydration risk; blur/saturation works across current engines, but cannot create true edge displacement alone | **Selected for the wide navbar shell** |
| `@samasante/liquid-glass` 0.1.1 | MIT, published three months before review, about 20,360 weekly npm downloads, React/React DOM `>=18`, zero runtime dependencies, two open GitHub issues | Headless component generates an SDF displacement map; Chromium bends the live backdrop and Safari/Firefox retain frost/tint/rim light. Official docs warn against stretching one lens across a dock-sized bar | Previously selected only for compact CTA pills; removed when the owner removed the final in-page pill |
| `liquid-glass-react` 1.1.1 (`rdev`) | MIT, roughly 6.2k stars and 35k weekly downloads, but only 16 commits and 22 open issues at review time | React 19 peer fits this repo, but unresolved reports cover missing Chrome optics and Next/flex layout failure; Safari/Firefox displacement is absent | Rejected despite popularity |
| Liquefy UI | MIT, active multi-package project with a Next.js 16 CI example and accessible Base UI primitives | Real WebGL/SVG refraction, shared context, and spring physics; three packages, client-only components, default-on motion/transparency, and a broad component system are disproportionate for three links | Rejected as overlapping/heavy |
| LeonardSEO static SVG map reference | MIT, one star and two commits at review time | About 5 kB plus a generated map and no per-frame JS; real Chromium `feDisplacementMap`, plain-blur WebKit/Firefox fallback. Useful architecture evidence, but too immature to adopt as a package/source | Rejected as a dependency |
| `simple-liquid-glass` / WebGL snapshot approaches | MIT projects advertise Safari/iOS refraction through WebGL or captured background content | Higher renderer/capture complexity, more GPU/resource ownership, and possible stale DOM snapshots are not justified for landing-page navigation | Rejected |
| React Bits `GlassSurface` and catalog kits | Effect-oriented catalogs with broader Motion/GSAP/Lenis/Three dependency and licensing surfaces | Attractive demos, but they overlap the existing CSS-module system and import far more behavior than the ticket needs | Rejected |

Selected architecture and rationale:

- The header is now a fixed transparent layer; its rounded `headerInner` capsule
  is the material. Page content scrolls beneath it instead of beginning below an
  opaque strip.
- The wide capsule uses native blur, saturation, contrast, a 50% navy tint,
  multi-stop specular pools, a double rim, and shallow/deep shadows. This follows
  the selected library's own advice not to stretch one SDF lens over a dock.
- The hero extends a blue detail field behind the header, so the top state has
  light/color variation to diffuse. Light and dark later sections visibly pass
  behind the fixed capsule during scroll.
- The earlier compact hero CTA used `@samasante/liquid-glass`; its measured
  client chunk was 56,700 bytes minified / 18,019 bytes gzip / 15,906 bytes
  Brotli. The owner later removed that CTA, so the adapter and dependency are
  removed too. The floating header retains the native CSS glass recipe without
  a client-side refraction package.
- Desktop Chromium computed `blur(7px) saturate(1.35) url(#lg-mat-…-v2)` on the
  pills, proving the displacement filter engaged. Narrow layouts deliberately
  override it with `blur(14px) saturate(1.45)` to avoid the documented stretched
  oval artifact while retaining a readable glass material.
- `prefers-reduced-transparency` and forced colors disable the library's inline
  filters with a narrow `!important` override and restore opaque colors. Reduced
  motion already removes ambient/entrance/scroll transitions; the optics have no
  continuous animation. Unsupported `backdrop-filter` receives opaque navy and
  cobalt fallbacks.
- WebKit/Firefox keep the CSS frost, tint, border, specular, and shadow;
  only live-backdrop displacement is absent.

Primary sources:

- Apple material guidance and functional-layer rationale:
  <https://developer.apple.com/design/human-interface-guidelines/materials>,
  <https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass?changes=_3__6>,
  and <https://developer.apple.com/videos/play/wwdc2025/219/>. The implementation
  follows the principles of content beneath navigation, restraint, contrast,
  and avoiding glass-on-glass; it does not copy Apple controls or trade dress.
- Web platform behavior:
  <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter>
  and <https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/filter>.
- Selected package, package metadata, and browser matrix:
  <https://www.npmjs.com/package/@samasante/liquid-glass>,
  <https://github.com/samasante/liquid-glass>, and
  <https://github.com/samasante/liquid-glass/blob/main/BROWSERS.md>.
- Rejected high-adoption package issues:
  <https://github.com/rdev/liquid-glass-react/issues/13> and
  <https://github.com/rdev/liquid-glass-react/issues/16>.
- Rejected WebGL/component and static-map references:
  <https://github.com/liquefy-ui/liquefy-ui>,
  <https://github.com/lucaperullo/simple-liquid-glass>, and
  <https://github.com/LeonardSEO/liquid-glass-react>.

Visual verification used the production build in the in-app Chromium browser:

- 1440 × 900 top, product-proof scroll, light privacy section, and final CTA
  states showed the floating rim and backdrop changing with content.
- 390 × 844 and 320 × 568 showed a compact single bubble, 44 px header links,
  full-width CTA frost, and zero horizontal overflow.
- Keyboard review showed the first-focus skip link and a 3 px cobalt outline on
  the next wordmark target without removing the glass rim.
- A 720 × 450 CSS-pixel run exercised the 1440 × 900 / 200% effective reflow
  with zero horizontal overflow. The action remains reachable by vertical scroll.
- Runtime inspection found the SVG filters in the hydrated DOM, no warning/error
  console entries, one H1, no remote asset request, and no hydration mismatch.
- The browser's active reduced-motion setting was tested directly. Normal-motion
  and forced-colors media emulation were not
  available in this Windows in-app browser; their source branches and documented
  fallback behavior were inspected without claiming native execution.

## Rotating-word headline research and selection

The owner requested the familiar modern hero treatment where one keyword cycles
through several product outcomes with changing type. Current Motion and GSAP
documentation converge on the same practical construction: keep a stable text
scaffold, key or layer the changing words inside a clipped slot, and use
transform/opacity for the entrance and exit. Character-level scramble/typewriter
effects were rejected because they add noise and make the product promise slower
to read. No new library is justified for one six-word sequence.

Primary implementation and accessibility references:

- Motion's `AnimatePresence` documents the keyed enter/exit model used for
  slideshows and other changing content:
  <https://motion.dev/docs/react-animate-presence>.
- Motion's text-animation guidance identifies split text as an established
  animation genre, while its reduced-motion hook recommends replacing or
  disabling spatial movement for the user's preference:
  <https://motion.dev/docs/text-animation> and
  <https://motion.dev/docs/react-use-reduced-motion>.
- GSAP SplitText documents word/line masks, responsive splitting, and the need
  for one accessible parent label with visual fragments hidden from assistive
  technology: <https://gsap.com/docs/v3/Plugins/SplitText/>.
- W3C WAI recommends suppressing non-essential motion under
  `prefers-reduced-motion` and providing pause/stop behavior for automatically
  moving or updating content:
  <https://www.w3.org/WAI/WCAG22/Techniques/css/C39> and
  <https://www.w3.org/WAI/tutorials/carousels/animations/>.

Selected ClipBuilder treatment:

- `moment`, `hook`, `insight`, `punchline`, `takeaway`, and `story` are all
  plausible one-conversation editorial outcomes. `trend` is excluded because
  the bounded demo has no external-trend input and must not imply a virality
  score or growth prediction.
- The stable “We find you the” scaffold and “You get the final cut.” second line
  remain in the local system display face. The rotating noun alone varies among
  solid, italic, outline, source-local serif, condensed, and gradient
  treatments.
- The visual words are `aria-hidden`; the H1 retains the stable accessible name
  “We find you the moment. You get the final cut.” JavaScript-free rendering
  remains static on `moment`; the hydrated sequence rotates automatically with
  no pause/play control under the recorded owner-directed exception.
- The superseded first rotation pass used a 44 × 44 pause/play control. After
  its removal, live Chromium review confirmed split composition at 2560 × 1440,
  1440 × 900, 1280 × 800, and 1024 × 768, then stacked composition at
  768 × 1024, 390 × 844, and 320 × 568. A 2.6-second sample changed the
  active noun while the DOM and accessibility tree exposed zero rotating-
  headline controls; every checked width retained two title lines and zero
  horizontal overflow.

## Paid clipping campaign market references

Accessed 2026-09-30. These first-party pages support the narrow landing claim
that **9+ platforms publicly host paid clipping campaigns**:

| Platform | First-party evidence used for the claim |
| --- | --- |
| Whop / Content Rewards | [Creator page](https://contentrewards.com/creators) describes choosing campaigns, creating campaign content, and receiving rewards tied to qualifying views. |
| CLIPPING | [Platform homepage](https://clipping.net/) describes brand-funded campaigns in which clippers publish clips and receive payment for verified views. |
| Picsart Clipping | [Clipping page](https://picsart.com/earn/clipping/) describes joining approved campaigns, creating clips, and receiving rewards under campaign rules. |
| Insy | [Clipper documentation](https://docs.insy.io/clipping/for-clippers/) describes clipping creator content, publishing it, and receiving view-based campaign payments. |
| Clipped | [Platform homepage](https://clipped-app.com/) describes creating brand clips and earning per result. |
| AmplifyClips | [Platform homepage](https://www.amplifyclips.com/) describes creator-led clipping campaigns and performance-based rewards. |
| Clipster | [Campaign discovery](https://www.clipster.gg/discover) lists current clipping campaigns with campaign budgets, payout progress, and view-based rates. |
| ClipReward | [Platform homepage](https://www.clipreward.com/) describes funded Clipping Rewards in which clippers submit published clips and qualifying work earns against campaign rules. |
| ClipCo | [Platform homepage](https://clipco.app/) describes creator-funded clipping campaigns, verified submissions, view tracking, and payouts per 10,000 views. |

The prototype uses the conservative wording “platforms host paid clipping
campaigns.” It does not claim that ClipBuilder is affiliated with these
platforms, that the platform itself funds every campaign, or that a visitor will
earn money. Eligibility, geography, campaign availability, payout terms, and
rules can change and must be checked on the platform before participation.

The wordmark wall uses original text/CSS treatments rather than downloaded,
hotlinked, or traced brand logo assets. The names provide nominative market
context only; they are not integration, customer, or partner badges.

## Second-pass local prototype review evidence (superseded)

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
