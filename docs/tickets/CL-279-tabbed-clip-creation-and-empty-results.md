# CL-279 — Tabbed clip creation and empty-results navigation

Status: implemented and locally verified, 2026-11-11. Owner visual review pending.
Dependency: CL-274 Moments controls and shared ControlTabs/ControlPanel exist.
CL-278's pending loading changes remain preserved, including shared-file edits.

## Owner request

Manual clips and AI moments should occupy one card with separate tabs to reduce
overwhelm. Add a horizontal separator between Analysis range and that merged
card. Your clips must look and behave disabled when no clips exist. The two
attached images are visual references, not instructions embedded in documents.

## Acceptance and scope

- One creation card below Analysis range, with accessible Manual clips / AI
  moments tabs, one visible settings panel and a clear horizontal separator.
  Reuse the shared tabs and preserve both panels' values while switching.
- Retain every existing manual range, Capture/Jump, add/remove/import/export,
  AI inclusion/count/Find all/durations, combined manual/AI behavior, validation,
  draft restoration, local/hosted limits and card-owned proceed actions. Tab
  navigation organizes controls; it does not start processing or silently change
  processing settings. Hidden-panel validation remains discoverable via its tab.
- Your clips is natively disabled and visibly muted while no retained moments
  exist, even if an old analysis object remains. Pointer and keyboard navigation
  cannot enter that empty view. Fresh/restored results enable it; removing the
  last item returns to Add clips with usable focus and existing inputs preserved.
  Keep empty-result/error information reachable.
- Verify desktop/tablet/phone, keyboard navigation, retained inputs, zero/one/
  removed-last results and representative validation using generated silent media
  and fake/no-key HTTP. Run focused existing checks, types, lint/format and a
  read-only validation. No paid run, real acquisition, owner clip edit, external
  browser/fullscreen, Voyagenda/configuration changes, Git mutation or deployment.

These UI/manual and fake-response checks need no API keys with FAKE_MODE=true.
Real AI analysis still requires its configured provider/runtime, live flags and
applicable approvals. No real provider action is authorized by this packet.

## Implementation and verification

Owner spacing follow-up (2026-11-11), implemented and verified: remove the oversized empty
area below Manual actions and custom-range Capture controls, checking the shared
card/feedback cause. The gap comes from block feedback reservation plus the range
row's bottom margin, rather than excessive shared-card padding. Place contextual
feedback alongside existing action/option rows across Analysis/Manual/AI cards;
retain shared InlineFeedback defaults elsewhere. Preserve readable, associated,
stable valid/error/corrected controls and compact fallback, every handler/guard,
fake-only testing, no narrow screenshots, and all pending work. This supersedes
the prior full-width bottom reservation layout, not the stable-feedback rule.

Spacing evidence: shared card padding remains unchanged. Analysis feedback now
shares the Start Capture action row; Manual/import feedback shares the fixed
CTA row; AI feedback shares the Suggest clips row. These explicitly opt into the
existing shared InlineFeedback inline mode, with fixed control sizing and
responsive message allocation. The range row's redundant bottom margin and AI
option bottom margins are removed. Other shared feedback defaults and manual
row duration/error slots remain untouched.

At the laptop viewport, all three cards now end 17px below their last controls.
Custom-range card height is 217.75px (formerly 267.34375px); empty Manual and
enabled AI cards measure 233.59375px and 231.96875px respectively. Fake UI verifies
range and AI valid/error/corrected control geometry at 1440/768/320 widths, plus
AI at 390. Invalid local JSON import verifies unchanged Manual CTA/card geometry
at 1440/768/390. All messages fit their allocated space; no page overflow,
control squeezing, CTA wrapping on validation or lost error associations.
Both analysis endpoints retain Capture and their shared aria-describedby target.

Frontend typecheck, scoped ESLint and Prettier pass; read-only validate meets
this revision with no actionable findings. Fake counters: zero edits, unexpected
requests or analysis submissions. No provider/paid call, owner-session/media or
Voyagenda change. Laptop-only proof is outside Git; no narrow screenshots were
taken. Fixture/reader/tab/helper/viewport cleanup is complete. No staging,
commit, push or deployment; other pending changes remain preserved.

Owner follow-up (2026-11-11): place the Analysis range heading/icon and dropdown
on one compact row. This layout-only revision is implemented and verified. Keep Choose range
endpoints/Capture and reserved contextual feedback below the header while those
fields are visible; the whole-video row has no unused feedback space. Retain
the existing handlers/validation. Wrap the header only when a narrow container
cannot fit it readably. Verify laptop layout and valid/error/corrected geometry
using fake/no-key UI; compact checks must not create phone/tablet screenshots.
Preserve all pending work and the running app, with no paid or Git action.

Earlier one-row evidence (before the spacing follow-up): existing DOM/handlers
remain intact, with a two-column
CSS header and full-width endpoints. Whole-video card height is 79.375px at the
1440×900 laptop viewport; heading/select centers align exactly. Choose range
retains both Capture actions and reserved feedback. Card height and all
card-relative control geometry match in valid/error/corrected states (267.34375px).
The 320px container fallback has a readable 246px dropdown and no horizontal
overflow; no narrow screenshot was taken. Frontend typecheck, scoped ESLint,
Prettier and whitespace checks pass. Fake HTTP counts are zero analysis/edit/
unexpected requests. Laptop proof is outside Git. Read-only validate: meets this
revision, no actionable findings. Fixture/helper/tab/viewport cleanup is complete;
owner session/media, Voyagenda and all unrelated changes remain preserved.

- The existing shared ControlTabs/ControlPanel now contain the original manual
  and AI fieldsets in one card, retaining mounted inputs and all handlers. The
  separator follows Analysis range. The count lives in the Manual clips tab;
  duplicate card headings and their obsolete styles were removed.
- Initial/restored creation-tab selection follows the existing AI inclusion
  state. Navigation itself never changes that setting, invalidates analysis or
  submits work. Hidden manual/import and AI errors mark their corresponding tab.
- Your clips uses retained-result count for its native disabled state, muted
  styling and keyboard guard. Empty analysis stays in Add clips with readable
  feedback and coverage. Removing the final result returns selection and focus
  to Add clips; existing controls and values remain available.
- An existing fake HTTP browser fixture gained an explicit zero-suggestion
  outcome for this regression. No production transport/schema/provider change.
- **43 passing focused tests:** frontend moment-selection, manual-time and
  runtime-capabilities suites. Final frontend typecheck, scoped ESLint for the
  component/fixture, scoped Prettier and repository whitespace checks passed.
- Codex in-app browser, generated silent media, fake/paid-off HTTP: checked
  initial disabled Your clips and keyboard exclusion; nested Left/Right/Home/End;
  retained manual endpoints and AI count/durations/inclusion; hidden manual/AI
  validation and correction; combined manual + AI results; restored single
  result; removal focus to the next card and then Add clips; empty analysis and
  failed analysis with contextual retry feedback. Jump and single-endpoint
  Capture still read the source preview without changing the other endpoint.
- Inspected 1440×900, 768×1024, 390×844 and 320×740. Found and fixed nested-tab
  overflow at 320px: equal flexible buttons and decorative-icon suppression only
  in narrow containers keep both labels visible, with 44px targets. Final 320px
  tab client/scroll widths both 244px; no page horizontal overflow. Desktop proof
  is retained as a synthetic task screenshot outside Git.
- Across three owned fixture lifetimes: three explicit fake analysis submissions
  (combined success, empty success, controlled failure), all three responses
  closed; zero unexpected requests and zero saved edits. Navigation-only final
  fixture recorded zero submissions. Fixtures, generated scratch media, helper,
  temporary test cache, browser tabs and viewport overrides were cleaned up.
- Read-only validate of the CL-279 component/styles/fixture/docs: **meets ticket,
  no actionable findings**. Existing import/export handlers, limits, resource and
  capability guards remain intact. Pending CL-278 loading work was excluded from
  this verdict and preserved. No architecture/security/spend boundary changed.

Deviations: none. No paid/provider/live acquisition/native export/hosted deployment
was exercised or required for this UI change. Owner visual acceptance remains
manual. Normal app, owner session/media, configuration and Voyagenda were
preserved. All changes remain unstaged and uncommitted; nothing was pushed.

## Owner local commit authorization — 2026-11-11

The owner now authorizes the file-level plan, staging and local ticket-prefixed
commits for the pending work. This supersedes earlier no-Git limits for this
batch only. Whole-file allocation, final checks and receipts are recorded in the
[commit plan](../operations/CL-278-283-FILE-COMMIT-PLAN.md). Final validation is
clean: 184 focused fake/paid-off cases, applicable types, scoped lint/format,
CLI syntax, dependency guards and whitespace checks. Prior visual evidence and
owner-only aesthetic/editorial/real-provider acceptance remain distinct. No
push, provider action, configuration change, Voyagenda work or deployment.
