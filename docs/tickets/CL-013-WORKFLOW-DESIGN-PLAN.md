# CL-013 — Workflow design-system redesign plan

Status: implemented locally after owner authorization on 2026-10-03; final owner
visual approval and the wider device/live/film/release gates remain open.

Owner direction: carry the landing's navy/blue background, glass materials,
colors, CTA treatment and typography through the entire `/start` experience.
This plan belongs to the existing [CL-013 packet](CL-013-complete-accessibility-responsive-and-performance-pass.md).
The [current source of truth](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#owner-workflow-visual-direction--2026-10-03)
records the new direction. Existing speaker, Privacy and logo corrections stay.

## What the inspection found

The workflow already uses shared `Button`, `WorkflowFrame`, `Progress` and brand
primitives. Their default semantic colors are light: `--cb-canvas: #f6f7fb`,
white surfaces, dark text and pale separators. Landing glass materials exist in
`styles/tokens.css`, but its background, navbar and CTA apply much of the final
material treatment locally in `app/page.module.css`. Workspace cards, tabs,
errors and the action footer still use the light defaults. Some feature styles
also hardcode light fills, such as the intake border and error background.

The implementation must make the shared workflow components visibly carry the
brand across every state, including loading, recovery and disabled controls.
A background-only change would leave incompatible text, buttons and nested panes.

## Visual direction

| Element | Planned treatment |
| --- | --- |
| Page | The landing's continuous deep-navy/cobalt/deep-navy gradient, extracted to one shared background token. Same blue atmosphere through the workspace gutters and bottom edge. |
| Header | Translucent navy glass, pale specular border, inset highlight and restrained blue sheen. Shared ClipBuilder mark, light wordmark, glass Privacy/Clear actions. |
| Main workflow card | A substantial rounded glass surface with a readable navy body, subtle edge/shadow and a slightly stronger action-footer surface. Keep the single changing workspace. |
| Inner cards | Blue-tinted glass for intake, candidates and compact summaries. Text-heavy transcript/notes panes use a stronger navy fill for stable reading contrast. |
| Primary CTA | The landing Get Started material: luminous blue fill, white label, thin bright edge and inset highlight. Clear hover/press/focus states; no decorative animation loop. |
| Secondary/quiet actions | Navy glass with light text and visible boundaries; quiet actions retain a simpler transparent treatment. Disabled actions remain visibly unavailable. |
| Typography | Existing local sans stack, stronger slightly tightened headings, white primary text, pale blue secondary copy and mono timecodes. Keep the accessible `Step N of 3: …` heading. |
| Selection/status | Brand-blue selection surface plus existing explicit selected semantics. Success, warning, failure and focus each retain a distinct readable treatment and textual meaning. |
| Media | Preserve portrait size/aspect, fixed composition, captions and actual playback. Apply glass to surrounding chrome and controls, keeping the video unobstructed. |

Use shared material roles rather than copying long landing rules into every
screen. The existing glass recipe is the baseline: translucent navy fill,
`--cb-glass-border`, `--cb-glass-edge-shadow`, `--cb-glass-sheen` and
`--cb-glass-backdrop` (18px blur). The primary CTA baseline is the existing
landing blue fill/hover recipe. Additional role tokens are justified only by
actual use; no unused theme library or new styling dependency.

Expose the common background, CTA fill/hover/edge and material levels in
`styles/tokens.css`. Scope workflow semantic surface/text/border/status values
at `.workspace` so shared buttons, frames, progress and feature panes inherit
the intended dark palette. Do not globally invert all root tokens: the landing,
Privacy dialog, framework boundaries and video composition need deliberate checks.
Update the landing to consume the extracted common background/CTA recipe while
preserving its current appearance and existing hero/navigation sizing.

Target a 24px main-card radius, 16px compact-card radius and landing-style rounded
CTAs, expressed as used tokens. Keep 44px interactive targets. Workflow headings
can use the existing 22–32px range; important body/instructions use 14–16px with
comfortable leading. Forms stay at least 16px on phones. Metadata can remain
compact, with mono limited to timecodes and numeric evidence. No remote/new font.

## Coverage by state

| State family | Required redesign coverage |
| --- | --- |
| Initial availability and intake | Branded shell/header, glass upload area, readable format/rights/limits, primary Choose a video and secondary prepared-input action. |
| Local preparation, upload and consent | Source summary, consent/challenge presentation and all enabled/disabled actions use the same materials. Preserve consent and current limits. |
| Analysis, build and render progress | Glass status panel, branded progress track/fill, light labels and readable elapsed time. Preserve measured/fake/indeterminate distinctions. |
| Candidate gallery | Dark glass portrait cards, clearer selected state, range/duration labels and existing one-choice behavior. Cover zero, one and four candidates as well as the ordinary fixture. |
| Expanded candidate | Existing portrait, candidate rail and Transcript/Agentic Notes pane share the palette; glass tabs and readable evidence/seek controls. Preserve keyboard and back-to-gallery behavior. |
| Automatic clip review | Consistent notes/transcript panes, fixed video composition and prominent Confirm export. No additional confirmation hop or editing controls. |
| Result/download | Same glass shell, readable final transcript, prominent available Download, clear disabled fake Download notice, secondary Start over and disabled Soon destinations. |
| Failures and recovery | Invalid media, no candidates, offline/fatal restore, analysis/build/render failures, expired access, clearing and partial cleanup all receive deliberate dark-theme treatment. Error text stays readable and content-safe. |

The new Privacy wording, shared logo, rights/limits, Clear, disabled prerequisites
and honest fake placeholders remain. This styling work must not change product
copy, allowed actions, reducer stages, candidate ordering, consent, call counts,
range/seek behavior, output access, persistence, expiry or cleanup.

## File-level implementation order

Implement these slices sequentially under CL-013. This is an implementation plan,
not a staging/commit plan; no Git mutation is authorized by it.

1. **Shared palette and materials.**
   - `apps/frontend/src/styles/tokens.css`: used background, material, CTA,
     radius and accessible dark-role tokens.
   - `apps/frontend/src/app/page.module.css`: consume shared background/CTA
     recipes, preserve landing presentation and all existing feedback corrections.
2. **Workflow shell and navigation.**
   - `apps/frontend/src/features/sample/sample.module.css`: scoped workflow
     palette, branded background, glass header, text/focus and header actions.
   - `apps/frontend/src/shared/ui/workflow.module.css`: glass frame, stronger
     heading hierarchy, content surface and coherent action footer.
   - `apps/frontend/src/features/sample/sample.experience.tsx` and
     `apps/frontend/src/shared/ui/workflow-frame.tsx`: only if existing markup
     needs a theme/material class or visual grouping; preserve handlers/semantics.
3. **Shared actions and progress.**
   - `apps/frontend/src/shared/ui/workflow.module.css`: primary/secondary/quiet/
     disabled/hover/pressed/focus button variants and progress palette.
   - `apps/frontend/src/shared/ui/button.tsx` and `progress.tsx`: inspect shared
     integration; change markup only if required for the approved material.
4. **Intake, preparation, status and recovery.**
   - `apps/frontend/src/features/sample/sample.module.css`: dropzone, limits,
     rights, source summary, processing, empty/error and elapsed-time surfaces.
   - `sample.experience.tsx`, `source-preview.tsx`, `processing-status.tsx`:
     only necessary presentation wrappers; preserve all side effects and gates.
5. **Candidate and read-only review.**
   - `apps/frontend/src/features/sample/sample.module.css`: gallery cards,
     candidate rail, selection, tabs, transcript/notes, timestamps and player chrome.
   - `candidate.review.tsx`, `portrait-player.tsx`, `agentic-notes.tsx`,
     `review-transcript.tsx`, `clip.review.tsx`, `cloud-clip.review.tsx`:
     audit both fake/live presentations; minimal markup changes only if needed.
6. **Delivery and consistency pass.**
   - `apps/frontend/src/features/sample/sample.module.css`: output/download,
     final transcript, secondary restart and disabled social destinations.
   - `result-preview.tsx` and `cloud-result.tsx`: retain delivery/decode/expiry
     behavior and unavailable-action explanations.
   - `apps/frontend/src/app/privacy-dialog.tsx` and
     `apps/frontend/src/shared/ui/brand-mark.*`: verify inheritance and contrast;
     no logo/privacy rewrite is planned.
7. **Evidence and documentation.**
   - Existing frontend page/workflow/sample/review/restore/playback tests:
     run relevant regressions; change tests only for a meaningful semantic change.
   - `apps/frontend/README.md`, the CL-013 packet and
     `docs/operations/EXPERIENCE_QUALITY_MATRIX.md`: record actual implementation,
     screenshots, checked states, regressions and remaining owner/manual gates.

Files listed for conditional markup review are not mandatory edits. Do not touch
`packages/composition`, contracts, backend/renderer/provider implementations,
session reducers, media/persistence modules or playback logic for a theme change.

## Verification and review checkpoints

1. Implement the shared materials and shell/intake first. Capture phone and
   desktop fake previews so the material, text hierarchy and CTA direction can
   be reviewed before applying the remaining screen treatments. If owner
   feedback arrives, carry it into the same shared recipe.
2. Apply the accepted working direction through all state families above.
   Walk the synthetic no-key journey and reproduce any functional regression
   before fixing it. Run focused existing checks while iterating.
3. Check all relevant layout anchors: 320×568, 390×844, 768×1024, 1024×768,
   1280×800, 1440×900, 1920×1080, 2560×1440, 900×600, 1100×700 and 640×640.
   Check zoom/short-height behavior, 44px targets, header/footer reachability,
   portrait framing and scrolling inside transcript/notes. Do not hide recovery
   or consent actions to make the layout fit.
4. Measure text contrast against the composited glass/background, including
   secondary, disabled, error, selected and focused states. Normal text needs
   4.5:1; large text and required UI boundaries need 3:1. Selection also needs
   semantic/textual identification.
5. Preserve opaque navy fallbacks without blur and for reduced transparency;
   use system colors/borders for forced colors. Verify keyboard focus, modal
   entry/Escape/return, tabs and seek controls. Keep the owner's existing app
   motion decision; no new ambient loops or motion-preference change.
6. Keep blur to a small number of surfaces, use tinted fills for nested reading
   panes and avoid full-page blur. Compare build inventory and observe scrolling
   and playback controls; CSS alone does not prove device performance.
7. After changes settle, run the required root format/lint/typecheck/unit/build
   gates and `git diff --check`. Validate the final scope against this plan and
   CL-013, investigate real findings, correct/document them and validate again.
   Leave the redesign available for owner visual feedback. Do not claim a final
   UI/film/release approval from automated checks.

## Fake/live and completion boundaries

All shell/material and synthetic journey work can be implemented and reviewed
with `FAKE_MODE=true`, no API keys and live/paid flags off. Fake portraits/results
remain fixtures and Download remains unavailable; they prove UI behavior, not
AI quality, real footage/caption contrast, native A/V correctness or live timing.
There is no available/verified local AI model or approved runtime/weights here.
Real Gemini testing still requires keys, live flags and rights/data/spend approval;
actual cloud media/rendering has its separate IAM/compute/storage approval.
Planning or styling does not authorize those actions, deployment or film work.

Completion for this redesign means coherent branded treatment through all
listed states, verified existing workflow behavior, documented responsive/
accessibility observations and no actionable local validation findings. Human
visual sign-off, physical-device/screen-reader and any unavailable live-media/
cloud/film/release evidence remain separate and explicitly unchecked.

Planning evidence: inspected current shared tokens/primitives, landing material
rules and workspace intake/progress/candidate/review/delivery/error source paths.
No application code, dependency, runtime configuration, provider/cloud resource
or Git index/history was changed during this planning task. Existing UI feedback
changes remain uncommitted and are not reimplemented by this plan.
Planning check: `git diff --check` passed. Application tests were not repeated
for this documentation-only task; previous implementation checks remain
revision-specific evidence, not proof of the planned redesign.

## Implementation evidence — 2026-10-03

Completed the sequential CSS/material slices before changing source-selection
behavior. Shared background/CTA recipes are consumed by the landing and workflow;
the workflow scopes dark semantic roles. Header/frame/buttons/intake/candidates,
tabs/notes/transcripts/progress/error/delivery use the new materials. Two blur
layers cover header/frame, alongside the existing small media overlays; nested
reading surfaces are opaque. No new dependency, font, motion loop, reducer,
provider call, handler or composition change was needed.

Phone margin/frame sizing was corrected after geometry checks reproduced four
pixels of root overflow. The primary hover was adjusted after calculated contrast
fell below 4.5:1. Final primary/hover text contrasts are approximately 4.90/4.61:1
with the strongest white sheen; secondary text is at least 5.94:1 against the
conservative composited navy bound used for this pass. Error, success and active
tab pairs calculate to 9.91, 8.60 and 7.12:1. Real footage contrast and physical
display behavior remain unchecked.

Ignored synthetic captures/geometry records:
`artifacts/qa/cl013-workflow-redesign-20261003/`. Intake and read-only review fit
all eleven planned viewport anchors with no horizontal/root-height overflow;
review controls measured at least 44px. Candidate detail/notes and footer were
checked across the same anchors. Phone notes/transcript panes scroll; fixed
portrait framing and existing playback remain. Privacy keyboard entry, isolated
dialog and Escape return, tabs, selection and the automatic review journey were
checked. A contracts rebuild restarted the volatile development backend and
invalidated one synthetic session; the existing safe error/Clear path recovered.
This was recorded as a runtime restart consequence, not a CSS defect.

The packet and quality matrix own settled checks/validation and the remaining
runtime limits. Zero/one/four candidates and unavailable live/cloud states are
covered by shared styling and existing deterministic tests/source inspection;
they are not claimed as new real-media browser evidence. The sample/source
preview request is a subsequent functional packet, not part of this theme pass.

## Later owner background refinement — 2026-10-03

The owner requested a lighter background in the workflow. The landing hero has
additional blue glows; its long-page gradient alone compressed into the shorter
workflow made the lower edge much darker. `sample.module.css` now places two
static blue radial glows over a brighter single-screen navy/cobalt gradient.
This supersedes the exact shared-background recipe for the workflow only. Glass
opacity, reading/CTA/fallback surfaces, layout and all handlers remain unchanged;
no new blur, animation, dependency or global landing style was added. Evidence
and remaining owner/runtime gates belong to the CL-013 packet.

## Later owner shared container width — 2026-10-03

Align the landing navbar, workflow navbar and main workflow card through the
same 80rem content maximum and responsive page-gutter tokens. Preserve the
landing's existing 1.5rem/1rem/0.75rem gutters at its existing breakpoints. A
stable root scrollbar gutter keeps the long landing and bounded workflow aligned
when navigating between them. This replaces the smaller 74rem workflow shell;
internal media, reading panes and the recent phone header/readability rules stay.
The packet and quality matrix own the measured geometry and remaining gates.
