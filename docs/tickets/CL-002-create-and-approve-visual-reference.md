# CL-002 — Build and approve the React visual prototype

Status: Owner-approved interim baseline - further visual refinement deferred<br>
Milestone: M0 — foundation and visual gate<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-001<br>
Blocks: CL-004 broad styling and CL-010 automatic-review styling<br>
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

## Owner baseline approval - 2026-10-01

### Immediate podcast-figure correction - 2026-10-01

The owner explicitly reopened only the How it works podcast illustration:
the existing capsule bodies and stick-like limbs are rejected. Redraw both
speakers with natural head/neck proportions, sloping connected shoulders,
clothed torsos, tapered arms, and shaped hands. Preserve the centered speaker
turns, articulated gestures, boom microphones, captions, pi cue, 8-second
conversation loop, and 21.1-second Upload/Read/Cut choreography.

Implementation plan: reuse the existing animation wrappers and replace their
primitive geometry with original inline vector artwork; share the repeated
speaker construction and keep colors local to this illustration. Check both
speaking poses and elbow/shoulder connections at desktop, tablet, and phone
sizes, then run the frontend format/lint/type/unit/build gate. No remote asset,
dependency, provider, or production-workflow change belongs to this correction.
The interim baseline approval remains valid; this redraw needs new owner visual
feedback and does not authorize the larger CL-013 film/polish scope.

- [x] Replace primitive figures and preserve the existing animation contract.
- [x] Verify desktop/tablet/phone rendering and the frontend quality gate.
- [ ] Receive explicit owner visual approval of the redrawn figures.

Subsequent decision on the same date: the owner rejected the in-progress
CL-004 multi-panel/equation core UI and requested one dynamic responsive
workspace plus shared reusable components. CL-002 colors/type remain the
interim foundation; this is not approval of the rejected CL-004 composition.
The immediate redesign is planned in CL-004/source-of-truth section 0.6.

The owner explicitly approved the current desktop and phone design as an
interim baseline for CL-004. Functional implementation may proceed now using
the existing composition/tokens. This is not a claim of final visual polish:
the owner expects substantial further visual feedback and adjustments in a
later ticket, after the functional journey exists. Carry that review into the
whole-flow CL-013 quality pass; baseline responsiveness/accessibility still
belongs to each feature ticket, and public-release motion/accessibility checks
remain required. No media-rights, provider, paid, cloud, or release gate is
approved by this visual decision. Earlier pending-approval entries below are
historical and superseded only by this narrowly scoped baseline approval.

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

## Owner revisions requested after the glass-material review

The owner requested another explicit revision on 2026-09-29. This direction
supersedes the affected composition and interaction details above without
approving CL-002:

1. Remove the hero prototype badge and the “No upload or processing” footnote.
   Keep the limitation inside the privacy disclosure instead of presenting it
   as first-viewport chrome.
2. Keep “Find the moment. Keep the final word.” but render it as one responsive
   line at the top of a hero that fills at least the current device viewport.
   Shorten the supporting promise to one line with no dash construction.
3. Reserve the hero's central media area for a future original motion-graphics
   product film. The eventual film should show an AI-assisted use of the
   platform, but this ticket uses an honest, code-native placeholder only.
   Owner assignment on 2026-10-01: CL-013 produces/integrates that film only
   after final UI approval and sanitized captures; CL-004 does not own it.
4. Replace the separate product-proof section with one “How it works” flow.
   Animate transcript/console bars resolving, energy moving toward a muted
   phone, the phone gaining color, and synthetic video layers moving.
5. Remove Product proof from navigation, rename View prototype to Get Started,
   and present Privacy & limits as a real dialog rather than a full page
   section.
6. Make direct How it works and Back to top navigation smoothly animate in all
   local preference states. This explicit owner choice overrides the previous
   reduced-motion rule only for deliberate anchor navigation; ambient and
   explanatory animation must still resolve immediately under reduced motion.

## Owner revisions requested after the hero composition review

The owner requested another hero revision on 2026-09-29. This direction
supersedes the prior one-line headline requirement without approving CL-002:

1. Set the hero promise as a smaller two-line lockup.
2. Keep “Find the” stable while its final noun rotates through truthful
   one-word outcomes using distinct, premium typographic treatments.
3. Research the established modern rotating-word pattern before implementation.
   Keep the result responsive and accessible rather than treating it as a purely
   decorative type trick.

## Owner revisions requested after the rotating-headline review

The owner requested one more hero-composition revision on 2026-09-29 without
approving CL-002:

1. Remove the supporting sentence beneath the hero placeholder completely.
2. Remove the in-hero Get Started CTA completely; the header CTA remains the
   single first-viewport action.
3. Give the product-motion placeholder the vertical space released by those
   elements so it fills the hero beneath the two-line headline.

## Owner revisions requested after the footer review

The owner requested one final footer simplification on 2026-09-29 without
approving CL-002:

1. Remove the supporting footer tagline.
2. Remove the duplicate footer “Back to top” link; the visible final-section
   control remains available directly above the footer.
3. Center the ClipBuilder home link as the footer's only content.

## Owner revisions requested after the synchronized-flow review

The owner requested a synchronized explanatory sequence on 2026-09-29 without
approving CL-002. This direction supersedes the earlier reduced-motion behavior
for this visual prototype:

1. Start the sequence only when the conversion graphic itself enters view.
2. During the first readable hold, write the transcript bars from top to bottom
   while the phone remains visibly muted and grayscale. The adjacent text must
   identify that the conversation is being read.
3. During the second readable hold, move one bounded energy cue across the
   connector while the phone remains muted. The adjacent text must explain that
   the grounded moment is being transferred.
4. During the final state, restore the phone's color and continuously move the
   synthetic sky, light, subject, captions, and timeline so the result reads as
   a living vertical preview. The adjacent text must explain that the cut is
   being brought to life.
5. Slow the story enough to read before each text change. The implementation
   uses stage boundaries at 4.8 seconds and 9 seconds after the graphic enters
   view; the final phone playback remains active.
6. Remove repository CSS or JavaScript that suppresses or shortens this page's
   animations when `prefers-reduced-motion` is active. Keep the explicit hero
   pause/play control. This is an owner-directed CL-002 visual-prototype
   accessibility exception and must be revisited before a public release.

## Owner revision requested after the proposed-edit review

The owner requested one more landing simplification on 2026-09-29 without
approving CL-002:

1. Remove the complete “A first cut you can question” section, including its
   supporting copy, proposed-edit rows, illustrative Dismiss/Apply controls, and
   all reserved layout space.
2. Do not replace it with another editor or control mockup. The synchronized How
   it works story now flows directly into the final call-to-action section,
   matching the locked no-editor and no-proposal product contract.

## Owner revision requested after the final-section review

The owner requested a clipping-market proof section on 2026-09-29 without
approving CL-002. This direction replaces the generic final CTA composition:

1. Present clipping as an active paid campaign medium and give the visitor a
   motivating reason to start, while avoiding revenue, availability, or outcome
   promises.
2. Show at least six researched platforms with current public paid clipping
   campaign offerings in a two-row desktop wordmark wall. Phrase the claim as
   platforms hosting campaigns funded by brands or creators, not as every
   platform directly employing or paying every clipper.
3. Treat the names as nominative market examples, not customers, partners, or
   ClipBuilder integrations. Pair the wall with a visible no-affiliation and
   no-earnings-guarantee qualifier plus a reminder that eligibility, rates,
   availability, and campaign rules vary.
4. Build original text-based wordmark treatments in React/CSS. Do not download,
   hotlink, or recreate proprietary logo artwork, and do not introduce remote
   runtime assets.
5. This is a narrow owner-approved exception to the earlier prohibition on
   unsupported integration logos: the section establishes market context only
   and must not appear in the product shell or imply technical integration.

## Owner revision requested after the address-bar review

The owner requested hash-free in-page navigation on 2026-09-29 without
approving CL-002:

1. How it works, Get Started, the ClipBuilder home links, and Back to top keep
   their deterministic smooth movement.
2. Hydrated in-page navigation must not add `#how-it-works`, `#top`, or another
   section fragment to the visible URL or browser history.
3. Keep real fragment destinations in the server-rendered markup as the
   semantic and JavaScript-free fallback; the client handler prevents default
   navigation only after it has found the target and started the scroll.

## Owner revision requested after the How it works choreography review

The owner replaced the synchronized three-step story on 2026-09-29 without
approving CL-002. This direction supersedes the earlier Source → Transfer → Cut
sequence:

1. Keep exactly three semantic steps, now Upload → Read → Cut. Remove the
   Transfer step, its copy, connector rail, and energy-pulse animation
   completely.
2. Step 1 is **Upload — Upload a conversation with potential**. Explain that
   the visitor brings a long-form video they own and believe contains a
   clip-worthy moment. On the left, a synthetic video tile drops into an upload
   card and a determinate-looking progress track fills; on the right, the Read
   console remains visibly disabled and waiting. This is illustrative motion
   only and must not imply that CL-002 actually accepts a file.
3. Step 2 is **Read — Reading the conversation** with the existing transcript
   explanation and line-writing animation. The completed upload stays on the
   left while the transcript console activates on the right.
4. At the end of Step 2, keep the Read copy visible during a 1.2-second spatial
   handoff: fade the completed upload away, slide the transcript console from
   right to left, and reveal the Cut preview on the right in a muted, disabled
   state. The visitor must be able to understand that the analyzed conversation
   is becoming the input to the final cut without an abstract transfer step.
5. Step 3 remains **Cut — Bringing the cut to life** with the existing copy.
   Wake the right preview into full color and show two synthetic speaker figures
   with microphone cues. Alternate the active speaker, framing emphasis, and
   caption line so the preview reads as an actual two-person conversation rather
   than one static portrait.
6. Begin only when the graphic enters view. Hold Upload for 5.6 seconds, hold
   Read for 5.2 seconds, perform the 1.2-second handoff, and keep Cut playing.
   Run this owner-directed prototype motion in every local motion-preference
   state while preserving all three steps in server-rendered semantic markup.

## Owner revision requested after the split-hero review

The owner revised the hero composition again on 2026-09-29 without approving
CL-002. This direction supersedes the earlier no-supporting-copy and visible
pause/play-control requirements:

1. Keep the approved two-line rotating headline but remove its pause/play
   button completely. The rotating noun continues automatically as an explicit
   visual-prototype exception that must be reconsidered before public release.
2. On laptop and desktop widths, use a two-column hero: headline plus a concise
   two-sentence functional promise on the left, and the motion-graphics frame
   on the right.
3. Use this exact supporting promise: “You bring the conversation. ClipBuilder
   finds the complete ideas worth clipping and turns your choice into a polished
   vertical cut, grounded in the source from first frame to final word.”
4. Use deliberate responsive modes rather than shrinking the desktop grid:
   spacious large-laptop/desktop spacing, a compact 1024–1279 px split, a
   stacked tablet layout, and a tighter stacked phone layout. Preserve natural
   vertical flow on short screens and prevent horizontal overflow.

## Owner revision requested after the background-transition review

The owner requested one continuous landing-page color field on 2026-09-29
without approving CL-002:

1. Replace hard background changes between the hero, How it works, and clipping
   market with one full-width, page-length navy-to-cobalt-to-deep-navy gradient.
2. Section-specific atmosphere may remain only as transparent radial lighting
   that feathers into the shared field at each boundary.
3. Carry the shared dark field through every side gutter and the footer so no
   neutral canvas strip or corner appears between dark sections.
4. Keep the clipping-market composition visually bounded through a translucent
   inset surface, not a separate opaque gradient that restarts the page color.

## Owner revision requested after the market-layout review

The owner approved the clipping-market content but rejected its loose layout on
2026-09-29 without approving CL-002:

1. Keep every current wordmark and line of copy; do not add replacement content.
2. Remove the oversized empty areas by using a compact editorial grid whose
   height is driven by the actual content.
3. On wide screens, balance the narrative and wordmark wall side by side, let
   the two logo rows use the narrative height, and place the qualifier and Back
   to top action together in one final utility row.
4. Stack the same content naturally at narrower breakpoints without horizontal
   overflow or compressed text.

## Owner revision requested after the conversation-preview review

The owner approved the overall Cut animation direction but requested a more
literal two-person conversation on 2026-09-29 without approving CL-002:

1. Show only the current speaker, centered in the phone frame, instead of
   keeping both people visible together.
2. Give both synthetic speakers visible arms and hands with restrained talking
   gestures during their respective turns.
3. Replace the placeholder captions with one grounded exchange: speaker one
   asks how many digits pi has, and speaker two answers that it has infinitely
   many and never ends or repeats.
4. During speaker two's turn, reveal a compact `π = 3.14159…` visual above the
   speaker, then hide it when the loop returns to speaker one.
5. Use one eight-second loop clock for the speakers, gestures, captions,
   background movement, pi visual, and progress track. The track starts empty,
   reaches the end with the conversation, and resets only when the complete
   preview loop restarts.

## Owner revision requested after the hero-brand review

The owner requested a stronger hero identity on 2026-09-29 without approving
CL-002:

1. Add a larger ClipBuilder wordmark and logo directly above the rotating
   “Find the…” headline.
2. Keep the hero lockup visually distinct from the floating navigation brand,
   scale it responsively, and preserve the established two-column and stacked
   hero compositions without horizontal overflow.

## Owner revision requested after the articulated-speaker review

The owner requested another How it works refinement on 2026-09-29 without
approving CL-002:

1. Replace the rigid single-piece speaker arms with connected shoulders, upper
   arms, elbows, forearms, shaped hands, and restrained pose changes that read
   as intentional conversation gestures rather than pendulum swings.
2. Keep each arm visually joined to its speaker's torso and give the two turns
   distinct choreography: an open/questioning pose for speaker one and a
   π-referencing/explanatory pose for speaker two.
3. Align the complete left conversion card with the active step's top and
   bottom horizontal rules on wide layouts; preserve natural stacked card
   height at tablet and phone widths.

## Owner revision requested after the podcast-microphone review

The owner approved the improved speaker direction on 2026-09-29 without
approving CL-002 and requested one more conversation-preview refinement:

1. Mold each speaker's arm roots into the torso so the shoulders read as one
   continuous synthetic figure rather than separate circular joints.
2. Replace the small handheld-microphone cues with overhead articulated boom
   arms and suspended podcast microphones positioned near the active speaker.
3. Treat the attached stock photograph only as a pose and equipment reference;
   keep the implementation original, code-native, synthetic, and free of copied
   or remotely loaded image assets.

## Owner revision requested after the stage-loop review

The owner requested a clearer repeating How it works sequence on 2026-09-30
without approving CL-002:

1. Run only the active step's explanatory animation: dim and stop Upload when
   Read activates, then dim and stop Read when Cut activates.
2. Keep the inactive visual present where it preserves spatial continuity, but
   make its disabled state unmistakable through restrained grayscale, opacity,
   and stopped motion rather than removing the context completely.
3. After one complete Cut playback, return to Upload and repeat the complete
   Upload → Read → handoff → Cut sequence continuously.
4. Announce the semantic steps during the first cycle only so the perpetual
   visual loop does not repeatedly interrupt assistive-technology users.

## Owner revision requested after the market-expansion review

The owner requested a denser clipping-market wall on 2026-09-30 without
approving CL-002:

1. Research and add three more genuine platforms whose current first-party
   pages publicly show funded or paid clipping campaigns.
2. Expand the wide wordmark wall to a balanced third row without increasing its
   content height unnecessarily; preserve natural responsive wrapping below
   the wide layout.
3. Update the metric and claim to match the nine source-verified examples while
   retaining the no-affiliation, no-guarantee, eligibility, availability, rate,
   and campaign-rule qualification.
4. Keep every added mark as an original text/CSS treatment; do not download,
   trace, or hotlink proprietary logo artwork.

## Owner correction after the market-metric review

The owner requested one clipping-market polish correction on 2026-09-29
without approving CL-002: render the complete curved base of the large `6+`
metric instead of clipping the numeral with an undersized line box.

## Owner revision after the hero-copy review

The owner replaced the hero promise on 2026-09-29 without approving CL-002:

1. Change the stable first-line construction from “Find the…” to “We find you
   the…” while retaining the existing truthful rotating nouns.
2. Replace “Keep the final word.” with “You get the final cut.” as the stable
   second line.
3. Preserve the two-line responsive lockup, automatic rotation, and one concise
   accessible H1 name.

## Owner correction after the How it works eyebrow review

The owner requested one hierarchy correction on 2026-09-29 without approving
CL-002: make the “How it works” eyebrow materially larger while keeping the
headline as the section's primary display element.

## Owner revision after the privacy-dialog surface review

The owner requested one material-system revision on 2026-09-29 without
approving CL-002:

1. Replace the light privacy-dialog shell with the landing page's blue-led
   navy-to-cobalt gradient language.
2. Reuse the floating navbar's glass treatment behind the dialog's text groups
   and controls wherever it preserves clarity and hierarchy.

## Owner correction after the privacy-dialog layering review

The owner clarified the intended material hierarchy on 2026-09-30 without
approving CL-002:

1. Put the blue-led gradient on the dialog shell itself so it remains the one
   continuous background behind every internal group.
2. Remove the independent colored gradients from the lead and limit cards;
   those surfaces must be neutral translucent glass that reveals the shared
   dialog gradient beneath them.
3. Present the visual-prototype limitation as plain supporting text with no
   glass card, pill, border, or background.

## Standalone implementation context

- ClipBuilder turns one owned/licensed conversation into zero to four grounded
  candidate moments, one visitor choice, and one automatic 10–60 second
  vertical clip.
- The product itself is the visual proof: source evidence, transcript cues,
  candidate choice, automatic vertical preview, and final download—not abstract
  AI decoration or editing chrome.
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
  intersection-triggered timed-stage presentation; all narrative content
  remains in the server-rendered HTML.
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
  short-height flow, keyboard focus, 200% zoom, forced colors, the recorded
  CL-002 motion exception, and no horizontal page overflow.
- First-class motion tokens and implementation for entrance, product cues,
  section continuity, hover/focus feedback, and the synchronized conversion
  story.

### Out of scope

- Session reducer, source selection state, file access, upload, analysis,
  candidates, assembly, clip-review state, provider calls, media playback, render,
  persistence, backend work, or cloud resources.
- A working marketing CMS, analytics, account/billing navigation, pricing,
  testimonials, fake customers, or unsupported integration logos. The
  owner-directed final-section market examples are allowed only under the
  no-affiliation, no-guarantee, and no-integration constraints above.
- Copied competitor assets, copy, layout, screenshots inside the product,
  remote production media, downloaded fonts, or image-model generation.
- Production contextual-visual generation or final automatic-review styling.

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
- [x] Remove the page-level `prefers-reduced-motion` suppression per the latest
  owner direction, remove the hero pause control per the latest owner revision,
  and document this CL-002 accessibility exception for later release review.
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
- Product framing represents an automatic validated composition, not a chat or
  editing application.
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
- [x] Always-on prototype motion, forced colors, material fallbacks, 200% zoom,
  text spacing, short height, and widths from 320–2560 px preserve content and
  actions without page overflow.
- [x] The current rework receives explicit owner visual approval; any further
      requested changes are recorded explicitly.

## Focused verification

- [x] Run frontend format, lint, typecheck, unit tests, and production build.
- [x] Inspect 320 × 568, 390 × 844, 768 × 1024, 1024 × 768, 1280 × 800,
  1440 × 900, 1920 × 1080, 2560 × 1440, and a 600–700 px short height.
- [ ] Check keyboard order, focus visibility, semantics, target sizes, 200% zoom,
  text-spacing overrides, forced colors, and always-on staged motion.
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
- The superseded first-pass review environment actively preferred reduced
  motion. Computed animation durations were `0.001ms`, smooth scrolling was
  disabled, and all content remained present in final state. The later owner
  direction explicitly replaces that CL-002 behavior.
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
  CL-010 automatic-review styling remain blocked until the owner accepts or revises the
  running prototype.

## Revised implementation and verification evidence

- The navy-to-cobalt luminous field now carries the hero, synchronized scroll
  narrative, and final CTA. The palette remains blue-led; there is no purple AI
  gradient or acid-lime remnant.
- Header, CTAs, hero proof, narrative visual, and final CTA use one selective
  glass recipe with specular edges. Opaque defaults precede the
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
- The fourth composition pass removes the hero badge/footnote, keeps the owner
  headline as one responsive line, shortens the promise to “Your conversation
  becomes one grounded cut,” and gives the central hero area an intentional
  product-film slot. The hero measured at least one viewport high at every
  checked size without becoming a fixed-height clipping trap.
- Product proof and How it works are now one semantic flow. Its client island
  begins when the conversion graphic enters view, writes the source bars while
  the phone stays grayscale, changes the adjacent explanation at 4.8 seconds as
  one bounded energy cue crosses the rail, and changes it again at 9 seconds as
  the phone gains color and its synthetic subject, caption, light, sky, and
  timeline layers begin continuous playback. Without JavaScript, the complete
  final visual and all three ordered steps remain present.
- Privacy & limits now uses the native modal dialog contract with visible exact
  media bounds, Escape dismissal, initial Close focus, and focus restoration.
  The navbar no longer names Product proof and the primary action reads Get
  Started without claiming that upload or processing exists.
- Direct anchor navigation uses a small requestAnimationFrame transition so
  browser or OS smooth-scroll suppression cannot turn the two owner-requested
  gestures into jumps. Chromium recorded intermediate positions for both the
  downward and upward journeys. The latest owner revision also removes
  page-level reduced-motion suppression for the hero and conversion story.
- Isolated Chromium review covered the hero, flow, and dialog at desktop and
  phone sizes plus 320 × 568, 390 × 844, 768 × 1024, 1024 × 768, 1280 × 640,
  1440 × 900, 1920 × 1080, and 2560 × 1440. Every viewport kept the one-line
  hero title/copy and header inside the viewport, filled at least one viewport,
  and reported no horizontal overflow. This is implementation evidence, not
  owner approval.
- The Next.js development indicator is disabled at framework configuration
  level so the floating “N” is absent from the live review page. A fresh
  1440 × 900 isolated-Chromium capture confirmed the lower-left corner is clear.
- The fifth hero pass converts the headline to two smaller responsive lines and
  rotates moment, hook, insight, punchline, takeaway, and story through a clipped
  word slot. “Trend” is intentionally absent because this demo does not inspect
  external trend data or promise virality.
- The animated substitutions are hidden from the accessibility tree behind one
  stable H1 name. The 44 × 44 pause/play control freezes the current word;
  JavaScript-free rendering stays on the static “moment,” while JavaScript
  rotation now runs in every local motion-preference state until manually
  paused.
  Exact Chromium checks at 320 × 568, 390 × 844, and 1440 × 900 retained two
  title lines and zero horizontal overflow; a 2.85-second pause check left the
  active word unchanged and updated the control name/state.
- The sixth hero pass removes the supporting sentence and in-hero Get Started
  CTA, reduces the hero grid to headline plus media, and lets the placeholder
  occupy all remaining first-viewport height. The header retains the one visible
  Get Started action. Removing the last compact refraction CTA also removes the
  now-unused `glass-action.tsx` client adapter, its CSS, and
  `@samasante/liquid-glass` dependency rather than carrying dead bundle code.
  Isolated Chromium measured a 604.875 px media slot at 1440 × 900, 663.25 px at
  390 × 844, and 402.109375 px at 320 × 568; each hero was exactly one viewport
  high, contained no supporting-copy text or in-hero CTA, and had no horizontal
  overflow.
- The footer revision removes its duplicate supporting tagline and Back to top
  link, then centers the ClipBuilder home link as the footer's only content. The
  final-section Back to top control remains immediately above it. Isolated
  Chromium placed the link center exactly on the usable viewport center at
  1440 × 900 (712.5 px) and 390 × 844 (187.5 px), with no horizontal overflow.
- The superseded synchronized-flow revision starts from the conversion graphic
  rather than the earlier section heading. In the live review browser, which
  actively reported `prefers-reduced-motion: reduce`, the 0.25-second state
  showed the Source explanation, four `consoleWrite` animations with
  0.45/1.25/2.05/2.85
  second delays, and a grayscale phone at approximately 46% opacity. The
  5.3-second state showed the Transfer explanation, the 1.8-second
  `energyTransfer` animation, and the still-muted phone. The 9.6-second state
  showed the Cut explanation, the phone restoring color, and infinite sky,
  light, subject, caption, and timeline animations. Transform samples 1.15
  seconds apart changed for all five internal layers, confirming visible
  playback rather than static animation declarations.
- The proposed-edit revision removes the complete control mockup and every
  dedicated responsive/material/motion/forced-colors style. The live page now
  exposes exactly three direct `main` sections—hero, How it works, and final
  CTA—with a zero-pixel DOM boundary gap between the latter two. The removed
  heading, proposal copy, and Apply control are absent from visible text and the
  accessibility tree; the checked 619 × 618 viewport retained zero horizontal
  overflow.
- The final-section revision replaces the generic CTA with six source-verified
  market examples: Whop Content Rewards, CLIPPING, Picsart Clipping, Insy,
  Clipped, and AmplifyClips. Original React/CSS wordmark tiles render in exactly
  two rows at 1440 × 900 and three two-column rows at both 390 × 844 and
  320 × 568. All three runs reported zero horizontal overflow; the page loaded
  no remote image/video asset and emitted no browser warning or error. The
  visible copy identifies brands and creators as campaign funders and retains
  the no-affiliation, no-earnings-guarantee, availability, eligibility, rate,
  and rules disclaimer.
- The address-bar revision removes the client history write from the shared
  in-page scroll helper. Live Chromium pointer activation of Get Started reached
  the How it works target exactly (`scrollY` 618 and target top 0), and keyboard
  activation of Back to top returned to `scrollY` 0; after both transitions
  `location.hash` stayed empty and the visible URL remained
  `http://127.0.0.1:3000/`. A focused unit test also guards the absence of
  `history.replaceState` while proving the animation still reaches its
  destination.
- The three-stage choreography revision replaces Source → Transfer → Cut with
  Upload → Read → Cut and removes the connector/energy cue completely. One
  deterministic live-browser trace captured Upload at 0.8 seconds with a
  filling progress track and muted Read console; Read at 5.8 seconds with the
  completed upload retained and four `consoleWrite` animations delayed by
  0.45/1.25/2.05/2.85 seconds; the 10.9-second handoff with Read copy retained,
  the console moving right-to-left, and the grayscale phone appearing; and Cut
  after 12 seconds with the console settled left and the phone awake right.
  Samples 3.2 seconds apart inverted both speaker emphasis and caption opacity,
  proving the two-person conversation alternates visibly. Desktop and 390 × 844
  checks reported no horizontal overflow, and the browser emitted no warnings
  or errors. This remains implementation evidence rather than owner approval.
- The split-hero revision removes the rotating-headline pause/play control and
  restores supporting copy as an exact two-sentence functional promise. Live
  browser review confirmed split composition at 2560 × 1440, 1440 × 900,
  1280 × 800, and 1024 × 768, then stacked composition at 768 × 1024,
  390 × 844, and 320 × 568. The compact 1024 px treatment keeps all three
  motion-frame cues inside their border, the 390 px and 320 px heroes fit the
  complete first-viewport composition, and every checked width reported no
  horizontal overflow. A 2.6-second sample changed the active noun while the
  accessibility tree and DOM exposed zero rotating-headline controls. Chromium
  emitted no warnings or errors. This remains implementation evidence rather
  than owner approval.
- The background-continuity revision moves the structural navy-to-cobalt color
  field to the full page, leaves the hero and How it works atmospherics as
  transparent overlays, feathers the process lighting at both edges, and keeps
  the clipping-market card translucent over that shared field. Live Chromium
  review at 1440 × 900 and 390 × 844 showed uninterrupted color through both
  section boundaries and every side gutter. The phone viewport reported zero
  horizontal overflow, and neither viewport emitted a warning or error. This
  remains implementation evidence rather than owner approval.
- The market-layout revision preserves every existing word and wordmark while
  replacing the loose three-row composition with a compact editorial grid. At
  1440 × 900, the narrative and two-row wordmark wall each measured 562 px high,
  the qualifier and Back to top action shared one utility row, and the overall
  market card fell from 1042 px to 803 px. At 390 × 844, the same content
  stacked in order, retained its two-column wordmark wall, and reported no
  horizontal overflow. Neither run emitted a browser warning or error. This
  remains implementation evidence rather than owner approval.
- The market-expansion revision adds three current first-party-verified
  examples—Clipster, ClipReward, and ClipCo—using original text/CSS treatments
  only, and revises the qualified market count from `6+` to `9+`. At 1440 ×
  900, the nine marks formed a balanced three-by-three wall with consistent card
  heights and zero horizontal overflow. At 390 × 844, they wrapped into five
  two-column rows with all nine marks visible and zero horizontal overflow. The
  responsive run emitted no browser warning or error. This remains
  implementation evidence rather than owner approval.
- The conversation-preview revision replaces the two-person group shot with
  alternating centered speakers, four visible gesturing arms/hands, the pi
  question-and-answer captions, and a speaker-two `π = 3.14159…` card. Live
  Chromium review at 1440 × 900 captured each speaker alone in frame and the pi
  card only with the answer; 390 × 844 retained the complete phone treatment
  without horizontal overflow. Computed styles recorded the speakers, all four
  arm gestures, both captions, pi card, background cues, and progress track on
  the same 8-second duration and 1.1-second delay. A near-complete progress
  sample reset to the beginning with speaker one visible, speaker two hidden,
  and the pi card hidden. Neither run emitted a warning or error. This remains
  implementation evidence rather than owner approval.
- The hero-brand revision adds a second, larger code-native ClipBuilder lockup
  directly above the rotating headline while retaining the compact brand in the
  floating navigation. Live Chromium review at 1280 × 720 confirmed that the
  lockup precedes the H1, remains aligned with the hero copy, and produces zero
  horizontal overflow. The phone breakpoint keeps the complete wordmark
  visible and scales both the mark and spacing down independently of the
  navigation treatment. This remains implementation evidence rather than owner
  approval.
- The articulated-speaker revision replaces each rigid limb with an overlapping
  shoulder joint, upper arm, elbow joint, forearm, shaped palm, and thumb. Live
  Chromium review captured speaker one's held open-question pose and speaker
  two's cross-body-plus-open-hand explanation pose. All four forearms reported
  the same 8-second duration and 1.1-second delay as the conversation loop. The
  wide-layout conversion card and active step each measured 496 px with
  identical top and bottom coordinates; the document reported zero horizontal
  overflow and no browser warning or error. This remains implementation
  evidence rather than owner approval.
- The podcast-microphone revision overlays gradient shoulder molds across both
  arm roots and replaces the handheld cues with two original inline-SVG boom
  rigs, mirrored for the two speaker turns. The boom, suspended microphone,
  speakers, captions, and gestures remain synchronized to the same 8-second
  loop and 1.1-second delay. Live Chromium review showed both alternating turns
  at 1280 px and the complete Cut state at 390 × 844, with both rigs contained
  inside the phone preview, zero horizontal overflow, and no copied or remote
  image asset. This remains implementation evidence rather than owner approval.
- The stage-loop revision centralizes one 21.1-second cycle: Upload runs for
  5.6 seconds, Read runs until the 10.8-second handoff, Cut starts at 12 seconds,
  and a complete 9.1-second Cut hold returns to Upload. A live Chromium trace
  confirmed that each inactive surface reported `animation-name: none` while
  the active surface moved, and that the preceding card used the intended
  grayscale/opacity disabled treatment. The trace captured the handoff, Cut,
  and second-cycle Upload states; the repeated cycle changes its live region to
  `aria-live="off"`. Desktop and 390 × 844 phone checks both reported zero
  horizontal overflow, and a fresh page emitted no browser warning or error.
  This remains implementation evidence rather than owner approval.
- The market-metric correction replaces the compressed `0.8` line height with
  a complete line box plus a small optical bottom allowance. Live Chromium
  review showed the full curved base of the `6`, a 102.4 px computed line
  height, 6.1 px bottom allowance, zero horizontal overflow, and no browser
  warning or error. This remains implementation evidence rather than owner
  approval.
- The hero-copy revision changes the promise to “We find you the…” plus the
  existing rotating nouns and “You get the final cut.” It keeps one concise
  accessible H1 name and gives the longer first line a narrower type scale so
  every word remains inside the copy column. Live Chromium review at 1280 ×
  720, 768 × 1024, and 390 × 844 showed the complete two-line lockup, equal
  line scroll/client widths, zero horizontal page overflow, and no browser
  warning or error. This remains implementation evidence rather than owner
  approval.
- The How it works hierarchy correction increases only that section's eyebrow
  from the shared 11.52 px label size to a responsive 16–18.4 px range and
  adds a slightly larger headline gap; the clipping-market eyebrow remains
  unchanged. Live Chromium computed 16.64 px at 1280 × 720 and 16 px at 390 ×
  844, with zero horizontal page overflow and no browser warning or error.
  This remains implementation evidence rather than owner approval.
- The privacy-dialog material revision replaces the light shell with an opaque
  navy-to-cobalt gradient and applies the navbar's translucent navy fill,
  specular rim, inset highlights, 18 px blur, 175% saturation, and 108%
  contrast to the lead block, three limit rows, prototype note, and close
  control. At 1280 × 720 the 752 × 622 px dialog fit without internal scroll;
  at 390 × 844 it used a 337 × 760 px internal scrollport with a themed thin
  scrollbar and a 44 × 44 px focused close control. Escape restored focus to
  the trigger, both viewports retained zero horizontal page overflow, and the
  browser emitted no warning or error. This remains implementation evidence
  rather than owner approval.
- The privacy-dialog layering correction moves every opaque and colored
  gradient onto the dialog shell, leaves the content surface transparent, and
  reduces the lead and three limit rows to neutral 5.5%-white glass with no
  independent background image. The visual-prototype limitation is now plain
  text with computed transparent background, zero border, zero shadow, and no
  backdrop filter. Live Chromium at 1280 × 720 and 390 × 844 showed the
  shared gradient continuously through every glass surface; the phone dialog
  retained its 337 × 760 px internal scrollport with zero page overflow.
  Initial focus reached Close, Escape restored focus to Privacy & limits, and
  neither run emitted a browser warning or error. This remains implementation
  evidence rather than owner approval.

### Podcast-figure correction evidence - 2026-10-01

- Changed only the speaker artwork in `process-narrative.tsx`, its geometry and
  paint in `page.module.css`, and this ticket. `PodcastSpeaker` and `SpeakerArm`
  share the repeated vector construction; React IDs keep each speaker's paint
  references stable and distinct. Removed the superseded capsule/head/limb CSS.
- Both speakers now have shaped faces, hair, necks, sloping shirt shoulders,
  collars, subtle fabric folds, tapered articulated limbs, and connected hands.
  The slightly lower microphone position and shorter arm framing keep the
  mouth and open-hand pose inside the portrait composition. No gesture
  keyframe, stage phase, caption, cue, timer, or observer was changed.
- Live review covered 1280 x 800, 768 x 1024, 390 x 844, and 320 x 568.
  Desktop captured the answer speaker's cross-body/open-hand pose; tablet
  showed the question speaker's open gesture; phone/compact phone retained
  the complete portrait, captions, and timeline. Every checked size had zero
  horizontal overflow. All illustration SVGs remain decorative/nonfocusable;
  the browser reported no warning or error.
- Active speaker and all four forearm styles retained the shared `8s` duration
  and `1.1s` delay. The deterministic stage test still proves the unchanged
  21.1-second Upload/Read/Cut cycle. Upload, Read, Cut, and the return
  to Upload were observed during the review.
- Passed `corepack pnpm --filter @clipbuilder/frontend format`, `lint`,
  `typecheck`, `test:unit` (89 tests), and `build`. The focused landing/timing
  run passed all nine tests before the full frontend gate.
- Content-safe desktop/phone review captures are outside Git in the Codex
  visualization workspace: `cl002-speakers-desktop.png` and
  `cl002-speakers-phone.png`. Artwork is original inline geometry, with no
  downloaded/generated image, font, package, remote request, provider, cost,
  cloud, or media-rights action. Existing CL-004 and owner-authored CL-013
  changes were preserved; nothing was staged or committed.
- The `execute` skill kept this explicitly owner-requested correction local
  to CL-002; `computer-use` supplied responsive and live-pose verification.
  New owner visual approval remains unchecked. The previously recorded
  public-release accessibility/browser gates and landing motion exception
  remain unchanged; no broader polish or release approval is claimed.

## Privacy, provider, and cost constraints

Use synthetic/source-controlled text and original code-native CSS/SVG shapes only. Do not call an image
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
