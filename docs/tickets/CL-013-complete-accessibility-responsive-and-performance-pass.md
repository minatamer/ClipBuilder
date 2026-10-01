# CL-013 — Finalize experience quality and the landing product film

Status: Planned<br>
Milestone: M6 — public-demo hardening and audit<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-012<br>
Blocks: CL-014<br>
Suggested commit: `CL-013: complete the experience quality pass`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Audit and correct the complete implemented flow for responsive composition,
short-height behavior, keyboard and screen-reader access, focus, status/errors,
200% zoom, forced colors, reduced motion, media/review usability, and measured
frontend/media performance. Record one release-quality manual matrix rather
than leaving these concerns fragmented across feature tickets.

After the actual UI is finalized and owner-approved, produce and integrate the
original landing motion-graphics product film described below. This film is
owned here, not in CL-004. Its approval is separate from the quality matrix.

## Portfolio value

Make the full demo feel intentionally built at every practical viewport and
interaction mode. The result should demonstrate the same choose/build/review/
download capability on
phone, tablet, laptop, desktop, and large monitor without inaccessible or
performance-heavy fallbacks.

The landing film should make the finished journey tangible: a deliberate
cursor-led walkthrough of the real UI, cinematic screen angles, readable titles,
and a convincing reveal of the selected vertical result. It is an authored
promotional asset, not a second interactive product or a new publishing feature.

## Owner addition: finalized-UI motion-graphics film (2026-10-01)

The owner explicitly assigns the landing product film to CL-013 and excludes
it from CL-004. Production must wait for the final UI so approved screenshots
can be handed to a `gpt-6.1-sol` authoring agent. That agent is expected to create
an editable motion-graphics composition from those references, not invent a
different interface or assume access to a native video-generation service.
This packet records a future handoff; it does not dispatch another agent now.

### Sequence and readiness gate

1. Complete the whole-flow responsive/accessibility/performance corrections.
   Finish the owner's visual-feedback round on the actual implemented screens.
2. Obtain owner approval of the UI capture baseline at desktop and phone sizes.
   Record its content-safe version/revision and the screens being approved.
   Do not produce the film from CL-004's interim UI, old mockups, or placeholders.
3. Prepare the sanitized capture package and a shot-by-shot production brief.
   Approve the storyboard, title copy, target duration, social-platform ending,
   format/weight budget, and optional audio before final composition/export.
4. Hand the approved package to the owner-designated `gpt-6.1-sol` agent for
   local authoring. Create a separate authoring chat only when the owner
   explicitly requests it; do not replace the requested model silently.
5. Review an animatic, then a polished preview. After owner approval, render the
   delivery variants, integrate the landing film, and rerun affected quality
   checks. If the UI materially changes, recapture affected shots and reapprove.

The existing CL-012 dependency still applies. Final UI approval, reusable media
rights, and a truthful result asset are additional film readiness evidence, not
facts inferred from passing code checks. No fresh paid clipping/provider run
is required or authorized solely to collect film footage. Reuse approved
existing results or clearly identified illustrative material.

### Screenshot and authoring handoff

- Capture the actual finalized UI: intake/drop target, upload progress, analysis
  stages, candidate choices, exactly-one selection, automatic build, read-only
  review, render confirmation/progress, result and download. Include desktop
  framing and phone reference where composition changes.
- Use deterministic synthetic data or explicitly rights-approved assets. Never
  include real private media/transcripts, filenames, account names, credentials,
  browser profile chrome, local paths, provider settings, signed URLs or tokens.
  Do not hide development disclosures or present fake export states as real
  edited-video output. Illustrative footage remains labelled until its claims
  and actual result are proven and approved.
- Supply stable capture dimensions, screen/state labels, intended cursor target
  coordinates, interaction order, selected-candidate continuity, and a reference
  index so the agent does not guess controls, labels, content or screen geometry.
- Include approved design tokens, typography, palette, wordmark treatment,
  spacing, cursor/click treatment, title copy and motion references. Preserve
  ClipBuilder's identity rather than applying a generic video-template style.
- Provide the selected clip's approved preview/result and permission record
  separately from UI screenshots. If it is unavailable, storyboard the reveal
  but leave final production gated; never generate a fictitious result as proof.
- Require an editable, deterministic scene/timeline project with documented
  local preview/render commands and replaceable screenshot references. Choose
  a proven composition/rendering workflow at execution time; assess its license,
  dependencies and local runtime before introducing it. Use Three.js if actual
  3D screen/camera work is needed. Do not build a bespoke video engine.
- Keep capture files, filled production prompts, generated media and final
  exports outside Git in ignored/local artifact storage. Commit only safe
  project code and content-free production/verification metadata. Create no
  speculative film directories until their first real module is needed.

### Storyboard and claim boundaries

The proposed pacing is a concise approximately 40-60 second master, adjusted
after animatic review. This is the promotional film's duration, not a change
to the product's 10-60 second selected-clip bounds. The journey must remain
legible without sound; do not compress every action into a rapid montage.

| Beat | Visual treatment and action | Truthfulness boundary |
| --- | --- | --- |
| 1. Identity | Open with ClipBuilder, a restrained title and a clean front-facing view of the finalized workspace. | Use approved product copy, not virality, speed, or integration claims. |
| 2. Bring a conversation | An animated cursor drags a synthetic/approved video tile into the real drop target; briefly show formats/limits and upload progress. | No private file-picker/account details. Progress is illustrative film editing, not measured product latency. |
| 3. Find moments | Push into the same workspace as analysis moves through actual stage labels; use restrained title transitions and useful close-ups. | No invented controls, fabricated percentage promises, or suggestion of a chatbot/editor. |
| 4. Choose one | Reveal the grounded choices, move the cursor deliberately, select exactly one and show the real selected-state response. | Never suggest batch rendering, manual trimming, or multiple selected clips. |
| 5. Automatic build | Transition through speaker-aware framing, fixed captions and contextual visuals, then reveal the completed vertical composition. | Use approved output that actually demonstrates those layers; no editable timeline or styling controls. |
| 6. Review and render | Hold on the read-only preview; the cursor confirms one render and moves through the real progress/result states. | Preserve the actual confirmation sequence and one-final-render contract. |
| 7. Final product | Give the finished vertical clip a clear, readable hero reveal, then show the real Download action. | Preview and result must represent the same selected clip; no fake download success. |
| 8. Share externally | Move the downloaded clip into a distinct external-sharing vignette, with owner-approved social destinations and schematic manual upload actions. | Sharing happens outside ClipBuilder after download. No in-app Publish button, OAuth, automatic posting or claim of universal platform support. |
| 9. Close | Return to the product identity and an approved invitation to try the experience. | Preserve landing navigation and safe product claims; do not add unsupported offers. |

The owner's multi-platform ending can show destinations such as TikTok,
Instagram Reels and YouTube Shorts, subject to storyboard and brand-asset
approval. Treat them as representative manual publishing destinations, not
"all platforms" compatibility certification. Do not post anything, connect
accounts, capture real social profiles or display publishing credentials.
Choose generic/clearly illustrative external upload visuals if approved platform
assets or clean capture rights are unavailable. A direct-publishing product
change would need a separate explicit source-of-truth decision and ticket.

### Art direction and motion

- Combine front-facing reading holds with deliberate angled screen planes,
  perspective camera moves, close-ups, depth/parallax, and cohesive transitions.
  Perspective must never make the essential UI or result unreadable.
- The cursor must follow plausible paths, land on the actual target, and click
  or drop in the correct sequence. Avoid random pointer travel, impossible
  drags, invented hover states and clicks that do not match the displayed UI.
- Use titles and kinetic typography to name the current story beat. Keep words
  concise, aligned to approved brand typography, high-contrast, within safe
  margins, and visible long enough to read on a phone.
- Animate selection and the final clip reveal with more emphasis than passive
  status updates. Keep the same selected moment and result continuous between
  shots; no unexplained jump to a different conversation or output.
- Optional music/sound effects require recorded usage rights. Audio is an
  enhancement only; titles/captions must carry the story without sound. Never
  autoplay sound or use unapproved voices, music, platform logos or footage.
- Avoid flashing, illegible whip transitions, excessive camera spin and purely
  decorative effects that obscure the workflow. Match motion to each action
  rather than using a collection of unrelated presets.

### Deliverables and landing integration

- Approved storyboard and animatic; editable source project and reference index;
  one polished landscape master suitable for the reserved landing hero area;
  browser-compatible web rendition and an approved static poster/fallback.
- Record dimensions, duration, frame rate, codecs, file sizes and the measured
  landing download/decode/render impact. Agree the numerical delivery budget
  before final export; do not ship an unbounded high-resolution master to phones.
- Portrait/square promotional cutdowns are optional, require owner approval,
  and must be reframed rather than cropping away essential UI/title information.
- Replace the CL-002 placeholder only after asset/editorial approval. Keep the
  existing landing layout, primary action and product identity coherent; do
  not make CL-004 own film production or redesign the functional application.
- Provide usable playback/pause/replay behavior and a poster/error fallback.
  No autoplay with sound. Resolve the CL-002 prototype's always-on-motion
  exception for public release; offer an appropriate reduced-motion/static
  experience, while deliberate Play may show the film at normal timing.
- Lazy-load appropriately, avoid layout shift, stop/pause unnecessary playback
  when hidden/offscreen, and clean up media listeners, observers, animation
  frames and local URLs. Verify stable framing and no title/control overlap
  across desktop, phone and short-height landing layouts.
- Supply a meaningful text description and captions if narration is used;
  keyboard controls and focus must remain usable. Failed/blocked media must not
  hide the page's actual product offer, privacy link or navigation.

### Film acceptance and evidence

- [ ] Owner approves the finalized UI capture baseline before screenshots/handoff.
- [ ] Sanitized screenshots and approved media are complete, indexed and kept
  outside Git; the designated `gpt-6.1-sol` brief/model choice is recorded.
- [ ] Storyboard/animatic and title/social/audio/format decisions receive owner
  approval before final production; required rights are recorded without PII.
- [ ] The film demonstrates the actual drop -> analysis -> choose one -> build
  -> review -> render -> download sequence and a clearly external sharing ending.
- [ ] Screen angles, cursor actions, selected-clip continuity, titles and result
  are polished, readable and consistent with the approved UI/design system.
- [ ] No invented feature, universal platform claim, false real-processing
  proof, private content, credential or publishing action enters the film.
- [ ] Editable source, approved master/web rendition and static fallback exist;
  measured file/decode/landing performance stays within the agreed budget.
- [ ] Desktop/phone/short-height, keyboard, reduced-motion, mute/audio, autoplay
  restrictions, media-error and cleanup checks have actual recorded evidence.
- [ ] Owner signs off the final film and landing placement; every unfinished
  capture, rights, render, accessibility or integration gate remains unchecked.

## Standalone implementation context

- The later 2026-10-01 owner revision requires CL-004's single dynamic
  workspace/design-system correction now, not here. Validate/refine that
  implemented flow in this whole-product pass; do not restore the rejected
  multi-panel/equation UI.

- Owner decision on 2026-10-01: CL-002 is approved only as an interim baseline
  so functional work can proceed. Include the owner's later visual-feedback
  round and substantial refinements here once the complete flow exists. This
  deferral does not waive baseline accessibility/responsiveness in feature
  tickets or public-release checks.

- Feature tickets own baseline accessibility/responsiveness. CL-013 is the
  consolidated whole-flow pass after every screen exists; it fixes cross-screen
  inconsistencies, interaction gaps, focus loss, layout collisions, and
  measured performance issues.
- One semantic component tree and one reducer/state authority remain. Responsive
  modes change composition/density/affordances, not product capability or logic.
- Target WCAG 2.2 AA. Automated checks are necessary but cannot replace manual
  keyboard, screen-reader, zoom, forced-colors, motion, media, and automatic-review behavior.
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
Complete quality corrections and obtain final visual approval before the film
capture gate above; CL-002's interim approval is not that final capture approval.

## Files and areas owned

- Cross-flow frontend styles/tokens/motion and targeted component/hook fixes.
- Accessibility/responsive/fake-flow E2E checks and the manual evidence record.
- Measured bundle, loading, media preview, transcript, clip review, polling, and
  interaction performance corrections.
- Minimal backend/media corrections only when a measured user-facing timing or
  cancellation problem is traced there.
- Landing product-film capture/brief, editable composition project, sanitized
  local artifacts, player/poster integration and film verification evidence.

## Scope boundaries

### In scope

- Landing, upload, analysis, candidate review, assembly, automatic clip review, render,
  result, errors, expiry, and clear at every named layout anchor.
- Semantic landmarks/headings/forms/lists/tabs/dialogs/drawers/media;
  accessible names/descriptions; focus entry/return/order; live regions; error
  summaries; candidate/evidence and playback keyboard patterns.
- Safe-area insets, virtual keyboard, orientation, text-spacing overrides,
  short height, intermediate widths, no horizontal page scroll, and no hidden
  primary/Clear/privacy action.
- Reduced motion, high contrast/forced colors, color-independent state,
  non-autoplay media, accessible transcript alternative, and safe announcements.
- Lazy loading and render/update discipline for heavy PDF-none/media/vision-
  unrelated browser code, transcript lists, preview overlays, polls, timers, and
  asset URLs based on measured/structural evidence.
- The explicitly owner-requested landing product film after UI finalization,
  under the production, privacy, rights and playback gates above.

### Out of scope

- Product redesign, new features, new provider calls, desktop-only or mobile-
  only workflow, native mobile app, automated WCAG certification, deployment,
  or rewriting correct modules for stylistic preference.
- Re-running external live/provider/cloud checks unless a specific correction
  requires the smallest relevant owner-authorized observation.
- Social account connections, direct publishing, real social uploads, or paid
  video-generation/media services. External-sharing visuals add no app feature.

## Implementation checklist

### 1. Responsive and short-height audit

- [ ] Execute every signature/failure/recovery screen across named viewport,
  orientation, height, zoom, and intermediate resize anchors.
- [ ] Preserve preview, evidence, automatic composition summary, render,
  download, clear, privacy, and errors at every width.
- [ ] Fix overflow, clipped sticky/fixed panels, nested scroll traps, layout
  shifts, safe-area collisions, drawer/tab state resets, and virtual-keyboard
  obstruction using shared composition—not separate product trees.

### 2. Keyboard, focus, semantics, and assistive technology

- [ ] Verify one logical `h1`, landmarks, skip link, field labels/instructions,
  button/link semantics, tabs, dialogs/drawers, notices, and media controls.
- [ ] Test candidate/evidence navigation, playback, automatic clip facts, render
  confirmation, download, and clear without pointer; verify excluded editor and
  assistant controls are absent.
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
- [ ] Verify captions, faces, visual cards, controls, and focus do not
  overlap at zoom/text-spacing/light/dark fixture extremes.

### 4. Measured performance and lifecycle

- [ ] Measure production bundle/routes, initial sample-to-candidate timing,
  automatic-review playback, transcript rendering, asset/media loading, polling, and
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
  flow, including candidate/transcript evidence, dialogs, media review,
  render, result, and clear with correct focus/announcements.
- [ ] Automated accessibility checks report no critical/serious issue; every
  remaining lower-severity finding has a disposition.
- [ ] Reduced motion and forced colors preserve meaning and usability; no flash,
  autoplay-with-sound, or color-only status remains.
- [ ] Sample reaches candidates within the product goal in the recorded
  production-like test, and bundle/review/media performance has no unresolved
  measured release blocker.
- [ ] Every correction has focused regression coverage and no duplicate device
  implementation/state authority is introduced.
- [ ] The landing film passes every film acceptance item above after final UI
  approval; a placeholder, storyboard or model handoff alone is not completion.

## Focused verification

- [ ] Run automated accessibility/component/flow/fake E2E checks in a production
  build with network/providers disabled.
- [ ] Complete and record the full responsive/accessibility matrix, including
  intermediate resize, 200% zoom, text spacing, keyboard, screen reader,
  reduced motion, forced colors, slow network/offline, and visibility changes.
- [ ] Record sample timing, bundle/route output, automatic-review interaction evidence,
  and any before/after material performance correction.
- [ ] Re-run only live/manual states strictly needed by a fix and only with
  explicit authorization.
- [ ] Review exported film frames at each storyboard beat, cursor/click timing,
  title readability and selected-output continuity; record owner disposition.
- [ ] Check the integrated film's responsive framing, keyboard/media controls,
  poster/failure/reduced-motion fallback, silent loading and measured performance.
- [ ] Run repository format/lint/typecheck/unit/build/fake E2E,
  `git diff --check`, and final status review.

## Documentation updates

- Add one sanitized manual quality matrix with viewport/state/finding/fix/
  verification/remaining-blocker rows.
- Update approved design tokens/components only when corrections reveal an
  actual system-level issue; synchronize CL-002/parent if material.
- Record performance environment/metrics and keep user/provider content out of
  screenshots and traces.
- Record capture baseline, approved storyboard/title copy, composition/render
  workflow, asset rights, deliverable metadata and owner film/integration review.

## Owner gates and external blockers

Final visual/editorial feel and hardware-dependent screen-reader/browser/media
observations may require owner review. Record engineering evidence separately
and never convert missing human/device evidence into a pass. This ticket does
not authorize a live provider call.
UI capture approval, screenshot/media/music/brand rights, authoring handoff,
animatic approval and final film sign-off are separate gates. Local code/media
production may proceed only within its approved rights/budget; external services,
uploads, account access, publication and deployment require separate approval.

## Privacy, provider, and cost constraints

Use fake mode and synthetic/rights-approved assets. Performance/a11y tools,
screenshots, traces, and browser logs must contain no private media, transcript,
credential, signed URL, object name, provider content, or account identifier.

## Commit boundary

Keep the consolidated experience-quality audit and its direct corrections in
`CL-013: complete the experience quality pass`, including the explicitly scoped
landing product film. Do not introduce unrelated
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
Also report capture baseline, authoring/model handoff, storyboard/animatic/final
film approval, local artifact locations, web/master/poster metadata, measured
landing impact, and every rights/editorial/audio/platform/integration item still
unchecked. No film or public-release approval is inferred from code checks.
