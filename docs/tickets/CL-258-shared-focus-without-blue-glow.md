# CL-258 — Remove blue focus glow throughout the website

Status: Complete locally, 2026-11-07. Shared styling and broad browser audit
verified; physical-device/assistive-technology/hosted acceptance stays separate.

The owner still sees a thick blue outer ring on the YouTube URL field and asks
to scout the entire website so this glow is absent everywhere. This extends the
earlier rename-only CL-252 scope to shared controls and all application routes.
Preserve all pending CL-247–257 changes and owner sessions/media.

## Scope and acceptance

- Audit shared/global focus tokens and selectors plus landing, intake, moment
  selection, all editor tabs/subtabs, dialogs, player controls and error states.
  Remove standard-theme blue focus outlines/halos and native default rings;
  consolidate control focus in the shared design system rather than per-field
  patches. Keep normal selected-state semantics and editing/crop affordances.
- Use a quiet neutral inset keyboard-focus treatment without outer glow or
  geometry change. Keep actual focus, typing/caret, Tab/Enter/Escape and dialog
  focus return. Never blur controls or suppress focus through JavaScript.
  Preserve OS forced-colors accessibility behavior and existing normal motion.
- Verify the reported URL field using mouse and keyboard, then survey actual
  rendered controls in landing/intake/moments/editor/dialog views at desktop,
  tablet and phone widths. Check focused/blurred styles and stable geometry.
- Use Codex browser and generated fake/no-key media/HTTP fixtures. No owner
  clip edits, real acquisition, model/provider calls, ignored configuration,
  normal service restart, Git mutation or deployment.
- Record audit locations, actual checks and limitations here; update the index
  and narrow shared-focus product rule in the source of truth.

This styling works with FAKE_MODE=true and no API keys. Real AI processing
retains its separate runtime/key/live-flag/approval requirements and is unrelated
to this change. Physical-device/assistive-technology/hosted review stays separate.

## Cause and shared implementation

The URL field inherited the workspace's 3px blue focus-visible outline with a
positive 3px offset. Separate overrides existed in landing navigation/privacy,
film fallback links, selects, editor tabs/panels, Zoom/Camera/Motion targets and
limit notices; title-in-preview editing also set a literal blue inline outline.
The earlier rename-only exception could not cover these other controls.

- Shared tokens now own neutral focus color, width and inset offset. Standard
  controls use a quiet 1px inset line; pointer-only button focus has no outline.
  Inputs that legitimately match focus-visible during mouse typing also use the
  inset cue. No focus-specific shadow, positive outer offset or blue halo.
- Removed the scattered standard focus declarations. Dark workspace/landing
  scopes and primary buttons select a neutral light cue; light recovery views
  use the neutral dark token. The root-error entry explicitly loads shared tokens
  when the normal root layout fails. Text preview editing uses the same neutral
  color; scaled drag/resize targets retain a proportionate inset width.
- Preserved actual focus, the rename exception, selected-state accents, normal
  glass surfaces, active editing/drag affordances and OS forced-color Highlight.
  No JavaScript blur, focus timing change, field geometry change or motion change.
- The source of truth and repository rule record the global decision. CL-252
  notes its later scope supersession so future work does not restore the glow.

## Verification and cleanup

- Final generated browser survey: **2,742 focused-control checks across 111
  rendered states**, at 1440/834/390 widths; zero non-neutral/outward outlines and
  zero focus-induced width/height changes. Includes actual landing and 404 pages,
  intake, every main editor tab and its caption/text/picture/audio/camera
  subtabs, Zoom fields, Motion marking, rename/privacy dialogs, moments and both
  normal/root recovery views. Counters vary slightly with visible player controls;
  the recorded final aggregate is the source for these counts.
- APIs are redirected to generated fake loopback hosts or blocked; no normal
  workspace API/session/media can be reached. Zero external/unexpected requests,
  edit submissions or plan/image/render calls. The no-key intake intentionally
  reports unavailable downloads; no acquisition or model was attempted.
- Codex browser: actual mouse click/typing/caret and keyboard Tab into the URL
  field retain active focus with rgb(244,244,244), 1px solid outline, -2px offset
  and no shadow. Phone/tablet checks retain the same styling without horizontal
  overflow. Public Privacy opens with Enter, keeps its focused scroll region
  inset, closes with Escape and returns neutral focus to Privacy.
- Generated focused-URL screenshot and aggregate evidence remain outside Git.
  Agent tabs closed, viewport reset; fixture helper exited cleanly with zero
  edits/unexpected/provider calls and its owned scratch was removed.
- Frontend/root-test TypeScript, scoped ESLint, Prettier and diff whitespace
  checks passed. No implementation-mirroring unit test or broad suite was added.
  The browser proof exercises computed appearance and interaction/geometry; it
  does not assert stylesheet text.

## Validate and handoff

Read-only final scoped review: **Meets ticket; no actionable findings**. Covered:
shared focus ownership, full source audit, representative rendered states,
keyboard/caret/dialog behavior, stable geometry, no-key isolation and cleanup.
OS forced-color behavior retains its shared system-color rule; physical devices,
assistive technology and hosted acceptance remain unclaimed. Real AI quality
requires its normal setup/approvals and is unnecessary for this styling fix.

Changed owners: shared tokens/workflow styles, workspace/landing/film/local-editor
styles, preview text editing and root-error style loading; generated focus proof;
this ticket, index, CL-252 follow-up, source of truth and repository guard.
Preserved all earlier pending work. No owner clip/media/configuration, native
contract/worker, normal app lifecycle or provider action changed. Nothing staged,
committed, pushed or deployed. Deviations: none.
