# CL-045 — Simplify local controls and anchor workflow actions

Status: implemented and verified. Dependency: implemented CL-044.

Owner request 2026-10-23: remove unnecessary explanations and awkward control UX
from moment selection and every caption/typography/filter/picture tab. Remove
the Save draft option. Follow-up: Process clips belongs in the persistent footer;
proceed/submit CTAs always belong in the relevant footer. Document this permanent
rule in AGENTS.md and the source of truth.

Keep concise labels, actual errors and a compact fake/live identity. Remove
repeated tutorial/provenance/call-count prose, success narration, redundant
headings, empty sections and draft-save UI/polling. Preserve existing saved files,
draft reopening/autosave of already saved work, source retention, exact selection,
explicit analysis/processing/apply/export, cancellation, dirty/stale protection,
keyboard controls and one editor/settings panel at a time. Do not silently turn
on new persistence, AI calls or automatic retries. Keep source/format gates intact.

The persistent workspace footer owns moment analysis/processing and edit/export
submission actions. Content retains selection and field-specific tools. Show
context-relevant actions, preserve disabled/busy states and keep footers reachable
on desktop and phones. Intake actions retain their anchored card footers. Use
shared components/tokens and normal motion; no separate app or mode setting.

Verify the complete selection/editor interactions, footer placement/visibility,
draft-button absence, concise copy and desktop/phone layouts with synthetic media
and fake/paid-off checks. Run focused unit/types/lint/format, the existing native
browser proof as needed and final read-only validate. No real provider/media/cloud
request, env read, saved/retained file deletion, service stop/start, Git mutation
or deployment. Fake AI requires no API keys; real Gemini remains owner-manual
with its normal keys/live flags/approvals. Do not claim live AI quality coverage.

## Implementation and evidence

Selection now uses Manual clips, an optional AI toggle and concise count/duration
fields. Redundant headings, instructions, provenance/frame/call-count explanations,
empty groups and success narration are removed. Manual-only mode hides AI fields,
preserves entered clips and requires one clip before Use clips enables. Shortfall
and actual errors remain concise. Editor tabs use shorter labels; caption-layer
selection follows its tab, image upload uses the shared button and picture timing
uses seconds with frame-aligned internal values. Advanced positioning remains
collapsed. Only relevant validation/stale/availability messages remain.

Save draft and its status/polling component are removed. Existing backend saved
draft reopening/autosave and source/export retention are unchanged; no new durable
project is created. The footer retains a compact Fake AI/Gemini identity and
Start over, with dirty protection and existing explicit unsaved-session handling.

A feature-local WorkflowActions portal retains each form's handlers/state while
mounting analysis, processing, apply/discard and export/download in the persistent
frame footer. Selected clips replace analysis with Process clips. Closed moment
selection and inactive editors do not leak actions. Editing exposes apply/discard
when needed; clean revisions show Export or the current Download, while earlier
exports remain under their disclosure. Cancellation, stale revisions, exact
selection, busy guards and explicit retry remain. Intake uses its existing card
footers. Shared tokens/buttons/motion are reused; the spinner rule now also
reaches footer actions. AGENTS.md and the source of truth own the permanent rule.

- **Nine focused unit tests pass** for runtime gates and editor state. Provider
  unavailable/mismatched gates and local prepared editing remain separate.
- **Final native/browser integration plus responsive intake proof pass**:
  two proofs in **90.14 seconds**. Three generated native MP4s, export retention,
  saved-file reopening, clip/tab/keyboard navigation, dirty/stale safeguards,
  caption/font/animation/filter/picture timing, apply/discard and footer placement
  are exercised. The browser checks Find/Process/Apply/Export live in the frame
  footer and hidden selection cannot expose Process. Save controls are absent.
  UI edits add no native or AI work; prior fake boundary counts remain exact.
- The final manual-only refinement repeats the synthetic responsive proof:
  **32.48 seconds, passed**. Turning AI suggestions off hides its fields and
  disables empty manual submission; adding a manual clip enables footer Use
  clips, and toggling back preserves it. No extra request/dispatch occurs.
- Moment selection at 1440×900, 390×844 and 320×568 keeps the footer visible and
  inside the viewport. Editor/caption layouts at 1440/390/320 widths retain one
  panel, usable targets and no horizontal overflow. Synthetic desktop/phone
  captures of both steps were inspected. All earlier intake loading, preview,
  motion, transfer, failure/cancel and offline checks continue to pass.
- Frontend/root-test TypeScript, focused ESLint, Prettier and diff checks pass.
  Browser/request/listener/native/scratch ownership drains in the proofs. No
  ignored environment read, real media/provider/cloud request, service launch/
  stop, saved/retained-media modification, Git action or deployment occurred.

Owner aesthetic/physical-device/zoom acceptance, full suite/production build and
real Gemini/paid/cloud processing remain unchecked. Fake/generated evidence is
not a claim about real AI quality or readiness.

## Validate — read-only final pass

TL;DR: selection/editor controls now use concise copy and context-specific footer
actions; Save draft is removed. **Meets ticket; no actionable findings.**

Scope: the CL-045 unstaged experience/selection/batch/editor/style changes, new
WorkflowActions module, removed draft-control component, focused test/proof updates
and owning documentation/new packet. CL-028–044 work is preserved and excluded;
index empty, no commit range selected. Reviewed the complete packet and scoped
code plus existing apply/open/clear and backend persistence boundaries.

Coverage: **Covered** — concise controls/errors; draft UI removal with retained
files/autosave compatibility; footer rule and action placement/visibility; manual
toggle/input retention; exact choice and explicit dispatch; caption/picture/filter
editing and frame conversion; disabled/busy/dirty/stale/cancel/retry behavior;
keyboard/one-panel interaction; responsive layout, normal motion and cleanup.
The portal owns no requests or copied form state and follows component lifecycle.
No duplicated contract, cross-app dependency, unsafe cast, secret/content debug
path, new configuration or automatic provider/persistence action introduced.

Checks are the focused units, final generated native/browser proof and manual
guard repeat, types/lint/format and inspected synthetic captures above. Physical
devices and paid/live AI remain **Unverified**, not marked passed.
