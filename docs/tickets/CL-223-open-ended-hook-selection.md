# CL-223 — Open-ended Hook selection draft

Status: Complete locally, 2026-11-05. Dependency: CL-220/222 editor/occurrence behavior
implemented locally. Preserve all existing pending work; no staging/commits.

The owner requests changing Hook start to a later point (at or beyond the current
end) to replace the old start and clear End to null/blank. The owner then chooses
an end. Preview/use/apply must stay disabled until the new range is valid. This
applies to settled Capture and numeric input, with no arbitrary end automatically
invented or a rejected start capture that leaves the old value.

## Scope and design

Keep incomplete Hook endpoints in a local UI draft, separate from the validated
saved edit/compiled overlay. Persisted Hook/worker schemas still require complete
bounded ranges. Retain the last valid preview clock while selecting new endpoints
so source/presentation mapping occurs once. Completing the range uses existing
independent Hook range-change behavior. Discard/removal clear partial state.
Root dirty/navigation/apply guards must account for the local draft. Capture
readiness/seeking/order/bounds and one-frame end-inclusive capture remain.

Allocate a Hook draft helper/controls, a narrow Hook opt-in in shared timing,
parent editor draft/readiness/apply integration, bounded Hook content range merge, focused units/browser proof and
owning source-of-truth/guide/index. Other media/text/audio timing semantics remain.
No model, provider, configuration, saved owner clip patch, cloud or Git action.
Use execute/validate/fix with generated fake/no-key checks. This UI change works
on existing prepared/synthetic clips without API keys or regeneration.

## Acceptance

- Capturing or typing Start at/past End accepts Start and clears End to null.
  Earlier valid starts retain End; equality also clears a zero-length range.
- Blank End stays blank until explicitly typed/captured. Invalid/busy/unsettled
  captures never overwrite acknowledged endpoints. End Capture is after the
  settled frame; incomplete/invalid ranges cannot preview/use/apply/export.
- Completing a valid in-clip range up to 10 seconds restores normal actions;
  source clocks, independent edits and bounds remain correct. Discard/removal,
  endpoint re-edits, suggestion and dirty/keyboard/responsive states are covered.
- Verify using generated units and the actual editor in desktop/phone; record
  exact produced evidence and remaining owner-only acceptance. Preserve all
  current saved source/base/edits/assets/exports; never patch a saved clip as proof.

## Evidence

Local Hook drafts now hold nullable endpoints independently of the validated
edit/preview. Hook-only capture accepts a valid later/equal start and clears End;
shared picture/text/audio timing keeps its original ordering behavior. Preview,
Use suggestion and Apply disable during the incomplete draft. Dirty/stale and
Discard/removal guards include it, and failed range materialization retains it.
Numeric edits share the same endpoint transition; End edits retain entered digits
while invalid instead of clearing them, allowing normal typing.

Choosing a disjoint excerpt exposed a narrow existing merge defect: a repeated
text/picture ID from the old window blocked copying that same item into the new
window even after its old instance was out of range. The bounded merge now
checks retained intersections, preserving global Hook style and main edits while
allowing newly repeated content. Regression proves the changed excerpt has its
text/picture and retains separate style. No schema/wire or resource-bound change.
This contracts helper change requires the normal worker rebuild/reload.

Final evidence:

- 22 focused unit/control/content cases pass (four files, 1.51 s): endpoint
  clearing/equality, preserved prior values, nullable/invalid input, explicit
  completion, one-frame and 10-second/clip bounds, disabled real control markup,
  existing manual/suggested Hook edits and independent content/range behavior.
- Generated actual-editor browser proof passes (31.93 s). At 1440, 390 and 320:
  seek/capture a later source start, retain it with blank End, disable Preview/
  Apply (Use suggestion additionally verified in real-control markup), navigate
  to a later settled frame and capture the exact exclusive end, restore actions,
  Discard to the original Hook, type an equal/later start and new end, clear End
  again and remove/discard the incomplete Hook. No unintended save/generation.
  Existing stable pickers, independent edits, save/reopen, focus reset and actual
  pointer/Enter controls pass in the same proof.
- Inspected generated desktop/phone screenshots: blank End and neutral prompt,
  disabled preview and persistent Apply/Discard footer, readable controls and no
  horizontal overflow. Shared design primitives remain.
- Local/browser-safe no-Node contracts, frontend and test types, scoped ESLint/
  Prettier and whitespace pass. No new dependency or nullable persisted schema.
- Normal backend/worker rebuilt/reloaded after the narrow shared helper change:
  ten owned processes stopped, ports 4000/4200 released and stabilized before
  hidden startup. Health, /start and config are 200; complete saved source/clip
  state matches the pre-reload snapshot exactly. Frontend preserved. Content-safe
  startup/error logs remain in the private runtime as backend-cl223.*.log.

Settled read-only validation: meets ticket; no actionable findings. Checked the
Hook-only opt-in, numeric/capture transition and source clock, partial draft dirty/
stale/apply/Discard gates, resource failure retention, independent content merge,
unchanged other timing controls, no request with partial values, design and cleanup.
Previous CL-218–222 work is preserved and excluded from this packet's verdict.

Changes: Hook draft helper and controls/tests, shared timing's Hook-only capture
option, parent editor draft/gates, bounded content merge regression and generated
browser proof; frontend guide, timestamp operating exception, source of truth and
packet/index. Narrow necessary addition: preserve repeated media/text IDs when
finishing a different Hook excerpt, discovered by this acceptance check.

Personal creative/device and hosted release acceptance remain owner-only. This
UI feature works on prepared fake/existing media without API keys, inference or
regeneration; real generation keeps its normal provider/model/approval gates.
No owner clip patch, real AI, source acquisition, ignored configuration, cloud,
deployment or Git action. Changes are unstaged/uncommitted.
