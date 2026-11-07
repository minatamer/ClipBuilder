# CL-251 — Keep Motion footer actions visible

Status: Complete locally, 2026-11-07. Depends on CL-247 shared footer feedback and the
existing Focus/Motion editor. Preserve pending CL-247–250 work.

The owner reports Track head/Cancel clipped beyond the footer's right edge while
marking a head. Fix the actual action/feedback sizing cause, preserving the shared
design, action ownership and normal content-sized footer; do not hide the overflow
or hardcode footer dimensions.

Owner follow-up: apply the correction generically to all footer actions, not
only Motion. Shared feedback behavior must work at any nesting depth inside
WorkflowActions, including groups unrelated to Motion.

## Acceptance and scope

- Track head and Cancel remain fully visible and usable together in the Motion
  footer at laptop, tablet and 320/390px phone widths. Normal editor actions stay
  replaced while Motion owns its footer; cancellation restores normal actions.
- Empty, present and cleared footer feedback cannot consume the action row,
  move/resize buttons or increase footer height/padding. Use the existing shared
  contextual feedback anchor, retain live accessible errors and tracking guards.
- Reproduce with generated fake/no-key state, inspect actual Codex-browser button
  rectangles and footer/error geometry, then validate the narrow diff. Verify
  focus/keyboard and cleanup. Do not start actual tracking/inference, patch the
  owner's clip, restart services, change configuration, mutate Git or deploy.

Allocation: shared footer feedback rules, Motion markup only if necessary,
existing generated fixture/proof if needed, this packet and index. No new tests
that merely mirror markup. Synthetic checks establish layout and interaction
only; real AI remains gated by runtime/credentials, live flags and approvals.

## Cause and shared correction

The actual generated Motion editor reproduced the screenshot: at 1440×900 the
frame ended at x=1357, Track head extended to x=1403 and Cancel to x=1498. Both
buttons stretched to 59.16px and the footer to 92.16px. Its empty InlineFeedback
was nested inside an action span, retaining a full-row flex basis and reserved
height. CL-247's direct-child-only footer selectors did not reach it.

The three shared footer feedback selectors now cover descendants at any nesting
depth. Empty feedback leaves layout; visible feedback uses the same existing
contextual anchor outside action sizing. Motion markup, button styles, footer
padding/height and field-level reserved feedback are unchanged. No overflow
hiding, per-Motion selector, width workaround or new dependency was added.

## Produced verification

- Actual generated Motion UI in the Codex browser at 1440×900, 1024×768,
  768×1024, 390×844 and 320×700: Track head/Cancel stay inside the footer with
  44px heights. Normal editor actions are replaced while marking; keyboard
  cancellation restores them. Keyboard marking enables Track head without
  starting tracking. A real local capture-validation error leaves every button
  rectangle and footer rectangle identical. No page overflow.
- Independent fixture regression: feedback nested two levels deep in ordinary
  spans, without Motion classes, now exercises the same shared rules. At all five
  sizes, brief/long/cleared errors retain identical buttons/footer geometry;
  callouts wrap within the frame and remain visible. Observed footer heights are
  77px desktop/tablet and 69px phone, from content and existing padding.
- Existing contextual-feedback suite: **15 tests passed** with fake/no-key,
  paid-off composition. Scoped fixture ESLint, Prettier, test TypeScript and
  whitespace checks passed. No implementation-mirroring unit test was added.
- Read-only validation of this packet's three selector revisions, independent
  nested fixture, authority update and ticket/index: **Meets ticket, no actionable
  findings**. Reviewed selector scope/specificity, accessible empty/error states,
  contextual positioning, responsive geometry, shared ownership and cleanup.
  Pre-existing CL-247–250 work was preserved and excluded from the verdict.
- Both generated Motion instances and the generic feedback fixture are closed;
  all three known listeners and the helper are absent. Motion fixture recorded
  zero edits, unexpected requests and plan/image/render calls. Agent tabs closed,
  viewport reset; screenshot/aggregate geometry are outside Git. Normal frontend,
  backend and worker processes remain unchanged; health and `/start` return 200.

This layout works with fake mode and no keys and requires no regeneration or
service restart. Real tracking/AI quality still requires its runtime or provider
credentials, enabled flags and applicable approvals; no such work was run.
Physical-device/owner taste, screen-reader and hosted acceptance remain unclaimed.
No owner media, saved edit, configuration or Git state was mutated. Nothing staged
or committed. Scope deviations: none.
