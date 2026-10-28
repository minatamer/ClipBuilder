# CL-117 — remove the Privacy preview-mode note

Owner request, 2026-10-28: remove the highlighted “Preview mode: selected files
aren’t read or uploaded” line. Preserve the two-point dialog, its remaining
disclosures, mode behavior and pending CL-114–116 changes over `09fb914`.

Allocate `privacy-dialog.tsx`, its unused `dialogMode` CSS/forced-color selectors,
existing page assertions and the current frontend Privacy guidance. Remove only
that note; no processing/privacy behavior changes. Run focused page tests and
the existing guarded dialog browser proof, scoped lint/format/whitespace, then
read-only validate. No new tests/full suite/native rebuild/Git mutation/deploy.

Fake/no-key checks verify the UI; real AI retains keys/live/approval requirements.
Personal visual/real-AI/hosted/release acceptance remains owner-only.

## Status

Implemented. Removed the preview-only paragraph from `privacy-dialog.tsx`, its
unused CSS block and two forced-color selector entries. Existing page assertions
now require that wording to be absent; frontend guidance/source-of-truth record
the owner copy revision without changing actual privacy/processing behavior.

Verification: 12 page tests passed (1.39s); guarded all-mode desktop/phone Privacy
browser proof passed (7.02s), retaining dialog geometry/keyboard behavior.
Affected ESLint/Prettier and whitespace passed. No new test, full suite, backend/
native change or rebuild was needed. All checks use fake/no-key/paid-off inputs.

V117-final: **Meets ticket; No actionable findings.** Read-only review of the
allocated copy/style/assertion/doc changes over `09fb914` confirms only the
requested note and dead styling are removed. Other disclosures and pending
CL-114–116 work are preserved. Deviation: none. Owner personal visual, physical,
real-AI/hosted/release gates remain open; real AI requires keys/live/approvals.
No private env/media access, provider/cloud action, staging/commit or deployment.

## Subsequent local commit authorization — 2026-10-28

The owner approved the [exact whole-file plan](../operations/CL114_121_COMMIT_PLAN.md),
16 ordered local commits and exact-path staging of pending CL-114–121 work.
Earlier unstaged/no-commit statements describe this packet's original handoff;
this later approval supersedes them only for the planned local Git action.
Personal visual, real-AI, hosted and release acceptance remain owner-only.
No push, deployment, provider/cloud request or ignored configuration change.
