# CL-252 — Remove the lingering clip rename ring

Status: Complete locally, 2026-11-07. Follows CL-248's compound title/pencil button.
Preserve pending CL-247–251 work.

The owner rejects the extra blue border around the clip-card rename button,
especially after opening/closing rename or leaving a control. Remove that ring
completely from this control, including restored/programmatic and keyboard focus.
Do not change card geometry, title/pencil spacing, truncation or the rename flow.

## Acceptance and scope

- No extra outline/shadow ring on the Rename clip header for click, keyboard or
  restored focus. Keep the native button, 44px hit area and existing focus return,
  Enter/Escape/cancel behavior; do not blur the control as a workaround.
- Inspect generated short/long-name ready/preparing cards and dialog open/close
  at laptop/tablet/phone widths, including computed focused styles and geometry.
- Use the owning component's styles; preserve shared focus rules for other
  controls. Record the result and validate the narrow CSS/docs scope. No new
  implementation-mirroring unit test, owner rename, AI/model/provider action,
  configuration, service restart, Git mutation or deployment.

This is a presentation fix available in fake mode without API keys or regeneration.
Real AI retains its separate runtime/credential/live/approval requirements.
Physical-device/assistive-technology/hosted acceptance remains manual.

## Cause and verification

The workspace's shared `:focus-visible` outline reappeared when the rename dialog
restored focus to its trigger. The compound rename control now suppresses its own
outline and box shadow in both focus states. No JavaScript/focus timing, global
focus selector, card selection, title spacing or rename behavior changed.

- Actual generated ClipNameControls/cards in the Codex browser at 1440×900,
  768×1024, 390×844 and 320×700: mouse open/Cancel and keyboard Enter/Escape
  preserve active trigger focus with outline-style none, no box shadow and
  transparent border. Keyboard `:focus-visible` was explicitly true while the
  extra ring remained absent. Clicking away removes focus without leaving a ring.
- Short/preparing, ready-thumbnail and long-name cards retain their layout and
  44px header height (82px/114px available width at the tested layouts). Full long
  names remain available in the existing dialog; Cancel/Escape close it without
  saving. No horizontal page overflow. Screenshot/aggregate styles remain outside
  Git. No owner rename or provider/model/render action was performed.
- Scoped CSS Prettier and diff whitespace checks passed. Read-only validation
  checked the two local focus selectors against the workspace selector, all
  focus paths, disabled/button/dialog behavior and geometry: **Meets ticket; no
  actionable findings**. CL-247–251 pending changes were preserved and excluded.
  No implementation-mirroring unit test or unrelated rerun was added.
- Fixture closed after one fake analysis GET; its listener/helper are absent.
  Agent tab closed, viewport reset and temporary launcher removed. Normal app,
  saved names/media/configuration and Git index are unchanged. No restart or
  regeneration is required. Nothing staged or committed. Deviations: none.

Owner follow-up: CL-258 (2026-11-07) extends the no-blue-focus-glow decision to
the entire website and supersedes this packet's earlier instruction to leave
other focus rules unchanged. The rename-specific no-ring exception and focus
return remain intact; CL-258 owns the shared rule and broad audit.
