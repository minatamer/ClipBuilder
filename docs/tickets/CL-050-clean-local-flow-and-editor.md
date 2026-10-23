# CL-050 — Clean local flow and editor

Status: implemented and validated. Dependencies: implemented CL-048 and CL-049.

## Owner audit and complete implementation plan — 2026-10-23

The owner requests an end-to-end audit, then sequential execute/validate/fix
loops across CL-050–053. This plan is recorded before implementation. Existing
CL-028–049 work is retained; no staging, commit, push, deployment or paid call.

| Audited area / observed issue | Required behavior | Packet |
| --- | --- | --- |
| Intake | Preserve stable upload/YouTube cards, anchored actions, shared progress, honest spinners and saved preview; no new permanent sections | CL-053 regression |
| Selection | Preserve Add clips / Your clips, default selection, h:m:s overflow and preview capture; never append editor under selection | CL-050 |
| Editor | Replace selection with a clean full editor view; one clip and one settings tab at a time; proper keyboard clip tabs | CL-050 |
| Footer | Independent portals currently pile up Start over, processing/cancel, export and apply. One primary plus one secondary for the active task; editor Add more clips secondary when clean, Discard changes when dirty; restart belongs in a small session menu | CL-050 |
| Copy/history | Remove restored-session success stripe, redundant headings and permanent export-history disclosure. Keep errors and useful concise state only | CL-050 |
| Dragging | Verify real mouse/touch coordinates and Player interaction overlay; pause before manipulation; retain and export geometry | CL-051 |
| Caption position | Center horizontally and vertically at 25%, 50% or 75% of frame; text centered in its box; preserve safe area and size | CL-051 |
| Caption styling | Research first-party references; offer restrained social typography and independent highlight/pop/bounce/reveal/word-by-word/fade/static motion; no downloaded proprietary fonts | CL-051 |
| Fake content | Replace repeated Synthetic words/orange rectangle with fictional multi-speaker conversation and bundled real sample photograph with source credit; no runtime fetch or AI | CL-052 |
| Pictures | Add/upload multiple independent cues, select one via compact visual picker, start/end, entry/exit animation, position/resize; upload should immediately add selected image | CL-052 |
| Compatibility/rendering | Optional compatible schema additions, shared preview/native composition and frame-cache invalidation; retain old drafts, clipping/asset/spend boundaries | CL-051/052 |
| Integration | Fresh source → ranges/results → process → clean editor → caption/picture edit → apply → export/download → reopen; add-more return, dirty/error/empty states and desktop/phone sizes | CL-053 |

This is the local extension in the same normal app. No public editor, timeline,
accounts, publishing, new dependencies or separate app. Retain saved sources,
drafts, exports, ignored captures/configuration, other apps and current services.
Fake-mode checks use source-controlled fictional/sample data and generated media,
no API keys, paid processing, provider/cloud calls or real YouTube retrieval.
Real transcription/planning/image generation retain keys/flags/owner-only gates.

## CL-050 acceptance and checks

- Selection and editor are mutually exclusive visible views with state retained.
  Successful explicit processing opens editor, restored clips open editor;
  Add more clips returns to selection and Back to editor returns without work.
- Clip navigation is a keyboard-operable tablist. Only one clip editor visible.
  Dirty edits block changing clips or leaving editor until applied/discarded.
- Footer follows the audit table; at most two visible workflow actions for a
  task, one primary. Batch cancel replaces export while processing. Session menu
  closes on outside click/Escape; no invisible running media in hidden selection.
- Preserve bounded preview-error recovery and polling/request cleanup.
- Focused types/lint/format and synthetic browser/native checks; inspect 1440,
  390 and 320 widths. Read-only validate after implementation, fix findings.

Implementation: selection remains mounted to retain inputs but is hidden and its
video paused in the editor; only the active editor mounts. Explicit processing
and restored clips enter the editor. Proper clip tabs retain keyboard focus after
Player mounts. Session menu closes outside/on Escape. Context footer hides batch
actions during dirty editing and hides return navigation during analysis.

Evidence: six runtime units, frontend/test TypeScript and scoped ESLint pass.
Synthetic native/browser proof passes (75.58 seconds), including selection/editor
return, keyboard tabs, dirty guards, Apply/Discard, footer count, preview error and
retry, three responsive widths and unchanged fake 4/4/3/3/native call counts.
Owned resource cleanup passed. Screenshots reviewed at 1440/390; 320 captured and
geometry checked. Final CSS correction restores moment-card padding/borders and
removes the redundant editor wrapper; combined responsive proof repeats in CL-053.

Read-only validate: **Meets ticket.** Reviewed this packet's frontend/test/doc
changes against the plan; pre-existing CL-028–049 excluded, index empty. Found and
fixed keyboard focus taken by newly mounted Player, a shared selector affecting
selection-card styling, and return-navigation crowding during analysis. No
remaining actionable finding. Physical-device/owner review and live AI remain
unverified; no paid calls, environment reads, app process or Git changes.
