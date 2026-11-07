# CL-247 — Content-sized workflow footer

Status: Complete locally, 2026-11-07. Follows CL-241/243 and the owner's screenshot.
Physical-device, assistive-technology and unusual zoom/font acceptance remain manual.

The owner reports unnecessary blank space below footer actions during analysis
and explicitly requires a dynamic shared correction, not a temporary or
screenshot-specific height/padding override. Trace the actual cause and let the
footer fit its controls across workflow states and responsive sizes.

## Acceptance and scope

- Correct the shared footer/action-feedback layout, including empty, present,
  long and cleared feedback. Preserve normal design spacing and button targets.
- Footer feedback stays beside its action outside control sizing; message changes
  cannot resize buttons, footer or preview. Keep accessible live feedback and
  contextual placement. Field-level reserved validation space remains intact.
- Verify normal actions, analysis/cancel, editor actions and feedback at laptop,
  tablet and phone widths, including narrow wrapping. Use generated no-key/fake
  state; preserve the owner's active analysis, clips and normal services.
- Run focused existing feedback checks, scoped lint/format/types as appropriate,
  and a read-only validate pass. Record actual browser geometry and cleanup.

Authority: source-of-truth “Stable contextual feedback — CL-241”, shared footer
action ownership and AGENTS stable-feedback/contextual-error rules. No fixed
footer height, per-state negative spacing, error hiding, provider call or new
dependency. No saved-clip/configuration edit, app restart, Git mutation, cloud or
deployment is authorized by this fix. Fake/no-key checks establish layout only;
real AI quality and its runtime/live/approval prerequisites are unrelated.

## Findings and correction

Actual generated-browser measurement reproduced a 122.59px footer with a 44px
button. Its empty InlineFeedback retained the shared field validation minimum of
2.8em (33.59px), plus a 12px flex gap, as a second action row. Normal footer
padding was 16px; reducing that padding would conceal the cause.

Shared action groups now anchor their direct feedback outside normal sizing flow
using the existing contextual callout design and viewport bounds. Empty footer
feedback is absent from layout; present feedback sizes to its actual text. The
shared field feedback component and its reserved slots are unchanged. Removing
the feedback-only wrapping override restores ordinary responsive action wrapping.
No fixed footer height, loading-state exception or screenshot-specific spacing.
Existing separate editor/reset/demo callouts keep their established anchoring.

The owner additionally requires that no error increase footer height/padding.
That applies to empty, brief, long, corrected and reset/action feedback through
the same shared rules, while button targets and actual control wrapping remain
authoritative. This is recorded in the existing source-of-truth feedback rule.

## Verification

- Existing contextual-feedback suite: 15 synthetic/no-key/paid-off cases pass.
  Frontend typecheck, scoped fixture ESLint, CSS/fixture Prettier and final
  whitespace checks pass. No new implementation-mirroring unit test was added.
- Current-source generated Codex-browser checks use the actual WorkflowFrame,
  WorkflowActions, InlineFeedback, SessionControls and selection components. The
  existing fixture now includes analysis/cancel, compact editor context and long
  footer error controls for repeatable inspection.
- At 1280×720, 1024×768 and 768×1024, the settled footer is 77px; at 390×844 and
  320×700 it is 69px. These are measured results of content plus existing padding,
  not hardcoded dimensions. All action buttons retain 44px targets.
- Brief action error, a 281-character action message, direct reset failure and
  cleared feedback leave every measured button rectangle, footer height and
  workflow content rectangle identical at all five sizes. Alerts remain readable,
  within the frame and unclipped, with no horizontal page overflow.
- Manual/analysis/cancel checks also retain the compact footer at laptop, tablet
  and both phone sizes. Cancellation uses fixture state only; no normal analysis
  was submitted or canceled. Field-level reserved validation styling is unchanged.
- Settled read-only validate reviewed the combined six-file ticket scope,
  selector specificity, actual action/error owners, field-vs-footer reservation,
  message visibility/live roles, responsive rules and resource cleanup. Verdict:
  meets ticket, no actionable findings. No contract, provider, native worker or
  dependency change. No ignored configuration or private provider/source content
  was inspected; generated acceptance used only synthetic state.

## Cleanup and limits

An initial restricted-sandbox fixture was unreachable by the browser; it was
stopped and replaced by the same no-key harness outside that network restriction.
All four fixture instances, including the baseline, are closed with their eight
listeners and helper processes absent. Final fixture recorded six fake analysis
GETs; no real model/provider action. Temporary helper removed, verification tab
closed and viewport reset. The browser's initial unreachable temporary tab could
not be rebound under its URL policy and is left to automatic turn-end cleanup.
Generated screenshot and aggregate geometry remain outside Git.

Normal frontend/backend/worker retain PIDs 18068/6556/3916; health and /start
return 200. No app restart or owner-source/clip/edit/export/configuration mutation
occurred. This UI fix works with FAKE_MODE=true and no API keys and needs no
regeneration. Real AI quality remains separate and needs the configured local
runtime or provider keys, enabled live flags and applicable approvals. Physical
devices, screen readers, unusual zoom/fonts and hosted release were not verified.
Nothing staged or committed. Scope deviations: none.
