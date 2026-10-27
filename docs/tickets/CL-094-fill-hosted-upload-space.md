# CL-094 — use available space for hosted upload

Owner request (2026-10-27): when the YouTube card is absent, widen the upload
card dynamically and reduce unused surrounding space. Capture a new screenshot
and show it directly because the prior browser/image preview was unavailable.

Depends on CL-061 hosted intake and the current CL-091 removal. Preserve pending
CL-091/092/093 changes. No deployment, paid/provider/cloud request, configuration
change, saved-media deletion or staging/commit is authorized.

## Plan

In `apps/frontend/src/features/local-editing/style.css`, scope fluid width and
remaining-space growth to the existing `source-options-upload` layout. Replace
the 42rem cap and vertical centering with a full-width, flexible single-card
grid. Keep a useful minimum card height and existing overflow behavior on short
screens. Reuse all shared card/drop-area/footer geometry, buttons and tokens;
do not change the local paired cards, upload behavior or processing states.

Reuse the existing `test/owner-hosted-editor.proof.ts` with additional capture
sizes (desktop, short laptop, tablet, phone) rather than creating a new test.
Inspect screenshots for width, spacing, readable content, reachable footer and
overflow. The existing proof keeps initial/loading/upload/editor/cancel/error
and synthetic native checks under its fake/paid-off network/env-file guards.
Run affected format/lint/types, read-only validate and only fix actual findings.
No worker rebuild/restart is needed for frontend-only CSS. Show the fresh
desktop image in the Codex file preview and provide the phone image as well.

Update this ticket/index and the narrow source-of-truth layout decision. The
layout is API-free and available with fake/no-key local hosted-shaped preview;
actual provider analysis still requires keys/live flags/approvals and owner
action. Screenshots do not claim deployment or paid acceptance.

## Status

Implemented and locally validated, 2026-10-27. The existing upload-only class
now uses width 100%, a flexible remaining-space grid and a 22rem readable minimum.
Only intake containing that class aligns at the top; local paired-card rules
and shared upload/footer interactions are unchanged. No JavaScript viewport
measurement, fixed desktop width or extra mode/configuration was introduced.

The existing guarded hosted-shaped browser/native proof passed (one full flow,
37.21s), including connecting/loading, upload, selection, editing, explicit
export, failures/cancel/recovery and cleanup. Fresh initial captures at
1440×1000, 1366×600, 1024×768, 768×1024, 390×844 and 320×568 all retain one upload
card, no YouTube/demo CTA and no horizontal page overflow. Inspected all six
PNGs: card uses content width/remaining space, starts below the heading, retains
readable content and a visible Choose a video footer; small-phone copy fits.
No new unit/regression test was added for this CSS-only revision; the existing
capture loop simply includes the required responsive sizes.

Affected Prettier, proof ESLint and test TypeScript checks passed, along with
`git diff --check`. The initial capture-loop type inference needed `as const`
for definite numeric tuples; corrected and TypeScript rerun successfully. This
type-only correction does not change the successfully captured runtime.

Read-only validate reviewed this ticket and the CL-094 CSS/capture-loop diff,
scope selectors, short-screen overflow, shared footer/tokens, loading slot
replacement, and existing proof cleanup. Verdict: meets locally testable scope;
no actionable findings. CL-091's pre-existing CTA CSS removal and CL-093's title
assertion remain intact and outside this revision. No worker or configuration
change/restart was needed; existing app processes were preserved.

Fresh ignored artifacts (unique names avoid reusing the prior preview URL):

- `.local-build/evidence/cl094-upload-desktop.png`
- `.local-build/evidence/cl094-upload-laptop.png`
- `.local-build/evidence/cl094-upload-phone.png`
- `.local-build/evidence/cl094-upload-small-phone.png`

Desktop screenshot requested through `open_in_codex` in the right file preview;
app returned queued, to appear when this chat is shown. Final response also
embeds the fresh image and links the phone view. Fake/no-key/paid-off hosted-shaped
captures are local only, not a deployment. Real AI/hosted/personal visual
acceptance remains unclaimed. No deviations, provider/cloud/media/configuration
or Git mutation; all pending work remains unstaged/uncommitted.

## Subsequent local commit approval — 2026-10-27

The owner approved a file-level plan and local staging/commit of the pending
CL-091–094 follow-ups. [Whole-file allocation](../operations/CL091_094_COMMIT_PLAN.md)
owns the 36-file combined commit. Prior unstaged/no-commit notes above describe
the original implementation handoff and are superseded only for this approved
local Git action. Verification and all remaining owner-only gates are unchanged;
no push, deployment, provider/cloud or configuration action is authorized.
