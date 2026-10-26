# CL-080 — Default fake-mode intake to manual clips

Status: implemented; focused local checks pass. Existing broad design browser
proof is blocked before selection; owner personal acceptance remains manual.

Owner request, 2026-10-26: Suggest clips starts unchecked in fake mode and
checked in real/hosted provider mode. This is an initial preference, not a
disabled control: owners may still opt into simulated suggestions. Restored
analysis keeps its saved preference, and tab navigation preserves current input.

Dependency: the shared selection UI and CL-079 baseline are implemented. The
worktree/index were clean before this packet. Follow the source of truth's
CL-080 decision; no backend, schema, environment, provider or native change.

Use the existing parsed runtime capability to initialize manual-only selection.
Keep existing restore/toggle logic, footer actions, manual ranges and real-mode
defaults. Update the existing synthetic design walkthrough to explicitly opt
into suggestions before its AI scenarios; do not add a separate test suite for
this default-only change.

Verify affected formatting/lint, frontend types and the existing synthetic design
browser proof (manual controls, toggles, tabs and responsive footer). Review the
settled diff against the packet and record actual evidence. Preserve the running
owner app/workspace, retained media and configuration. No Git mutation, paid
call, cloud action or deployment is part of this packet.

Fake mode needs no keys and suggestions are simulated. Real/provider suggestions
still require keys, live flags and applicable approvals. No local AI model is
introduced. Owner personal visual and real-provider acceptance remain manual.

## Evidence and final validation — 2026-10-26

`OwnerSelectionPanel` initializes manual-only input from the existing
`synthetic-ai` capability. Provider/unavailable defaults, saved-analysis restore,
manual toggle, navigation and submission bindings remain unchanged. The existing
design walkthrough explicitly enables suggestions before its AI scenarios.

Frontend TypeScript, affected ESLint, Prettier and diff whitespace checks pass.
An in-memory current-source React markup inspection, with the shared hardcoded
fake/paid-off environment and all network blocked, confirms unchecked for fake,
checked for local provider and checked for hosted provider props. No artifact or
new test suite was created for this default-only change.

The existing `test/local-design.proof.ts` first hit sandbox CIM denial, then ran
outside the sandbox and stopped at its initial intake-mounted assertion (line
657), before selection or the changed walkthrough step. This is not passing
browser/responsive evidence for CL-080; no unrelated intake fix was attempted.

Read-only settled-diff validation: meets the requested initial-value change;
no actionable findings in the changed application path. No new lifecycle,
schema, provider, native or configuration work. The running owner workspace was
not reset or used as a fixture. Nothing staged/committed; no paid/live/cloud
checks, provider calls or deployment. No scope deviation; browser/owner visual
acceptance remains unchecked as described above.
