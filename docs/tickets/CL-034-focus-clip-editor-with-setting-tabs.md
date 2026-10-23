# CL-034 — Focus editing on one clip and one settings tab

Status: implemented and verified. Dependency: implemented CL-033 and local design CL-028.
Owner request 2026-10-23: the editing page is too long. Select one clip to edit,
then show one settings category at a time, including captions and filters.

Use a compact clip picker and a single selected clip's preview/actions. Replace
stacked inspector fieldsets with Captions, Filters and Pictures tabs, following
the demo's navy glass materials and accessible existing tab pattern. Collapse
source/moment selection once clips exist, without unmounting its working state.
Keep secondary history, geometry and technical help behind disclosures. Preserve
all controls, acknowledged exports, per-clip cancellation, revision conflicts and
unapplied-edit protection. Switching tabs must preserve edits and make no API
mutation; switching clips must not silently discard unapplied changes.

No processing, schema, provider/configuration, storage or public-flow change.
AI stays fake/paid-off; editing, tab/clip navigation and native export need no API
keys. Real AI still requires Gemini keys, enabled live flags and owner approvals;
no offline model/runtime is supplied. No real downloads or paid/cloud calls are
needed to verify this presentation change. Preserve current saved media and the
running app; no Git mutation or deployment is authorized.

Acceptance: exercise multiple clip selection, exactly one visible settings panel,
keyboard arrows/Home/End/focus, form preservation across tabs, apply/discard guards,
current/older export links, and desktop/phone fit using synthetic browser data.
Inspect synthetic desktop/phone captures; run relevant frontend unit/types/lint/
format checks and read-only validate. Record actual evidence and remaining owner
visual/physical-device/live-AI acceptance separately.

## Implementation and evidence

`clip-batch-panel.tsx` now presents a horizontal clip picker and only the selected
clip's preview/actions. Selection defaults to the first clip and honors restored
draft selection. Queued/failed clips remain selectable for status and cancellation;
existing exports remain accessible. Current download and export are primary
actions, while older exports and attempt/revision counts live under Clip details.
An edited state uses the short label Edited. A recovered poll clears only its
own connection warning; explicit mutation failures remain visible.

`clip-editor.tsx` keeps one shared draft across Captions, Filters and Pictures
panels. Tabs use associated ARIA IDs, one tab stop, arrows/Home/End and visible
focus. Inactive panels are hidden from layout and keyboard access. Choosing a
preview layer opens its matching settings panel. Apply/discard actions stay
beside the inspector; dirty-clip and stale-revision guards remain. The reload
action remains available when an acknowledged preview cannot be compiled.
Help and geometry stay collapsed; success copy is shorter.

`experience.tsx` folds source/moment selection after clips arrive without
unmounting its forms. Choose more moments restores that section and the existing
process action. `style.css` retains the shared navy glass tokens, adds compact
clip/tab controls, keeps a desktop preview/inspector split and uses two caption
field columns on phones. No contract, backend, renderer or processing change.
The feature README and source-of-truth decision reflect this interaction.

Verification actually performed:

- Frontend unit suite: **488 tests across 58 files passed**. The first sandbox
  attempt failed before suite execution because workers could not find their
  virtual temporary transform files; the same pinned fake/paid-off suite passed
  outside that sandbox. No test expectation was weakened.
- The existing synthetic `owner-batch.proof.ts` browser/native integration passed
  after the interaction changes, then after the final phone/disclosure changes
  (**79.02 seconds** for the last pass). It exercises three clips, one visible
  editor/panel, clip switching, source disclosure reopen/state retention, hidden
  process actions, arrows/Home/End/focus, caption/filter preservation across tabs,
  dirty switch/export guards, apply followed by clip switching, discard recovery,
  picture controls and current/earlier download availability.
- The harness verifies that UI editing/navigation adds zero native renders or
  fake AI attempts. Whole-proof totals remain four fake transcriptions/four fake
  selections/three fake plans/three fake pictures. Owned native concurrency peaks
  at one and process survivors are zero; listeners, browser and scratch drain.
- Synthetic browser fit checks passed at **1440, 390 and 320 pixels**, including
  one visible settings panel and tab targets at least 44px high. Desktop and phone
  captures under ignored `.local-build/evidence/cl034-*` were inspected. Phone
  captions were tightened to two columns after the initial visual pass.
- Frontend and root-test TypeScript, focused ESLint, Prettier and
  `git diff --check` passed. The root-test check caught DOM references in the Node
  harness wrapper; moving them into its existing browser driver resolved it.
- The existing normal `/start` was checked through its browser UI: switching to
  Filters removed caption controls, clip two opened its own saved values, and
  switching back restored clip one's acknowledged styling. No real media frame
  was captured. The app was left running on clip one; real source/draft/exports
  and unrelated apps were preserved. AI remains fake with cloud false.

The only follow-up after the last synthetic browser pass was preserving the
reload affordance for an invalid acknowledged preview; that error-path guard was
code-reviewed and included in final frontend types/lint. No root production build
or paid/live/real-download rerun was needed for this frontend presentation change.
Human aesthetic/physical-device acceptance and live AI quality remain unchecked.

## Validate — final read-only pass

Scope: this ticket's picker/inspector/disclosure/style changes, browser-proof
extension and owning evidence, all unstaged. Earlier CL-028–CL-033 acquisition,
picker/startup and other UI work is preserved and excluded from this verdict;
the Git index remains empty.

Verdict: **Meets ticket — No actionable findings**. Covered: one clip and one
settings category, accessible tabs, edit preservation/guards, source-state reuse,
export/cancel availability, existing design, responsive visual checks and cleanup.
The temporary test-environment/type issues above are resolved. No schema or
dependency duplication, unsafe casts, debug paths, secrets, new dispatches or
resource owners were introduced. No additional suite ran during read-only review.
No staging, commit, push, configuration/credential read, provider/cloud action or
deployment occurred.
