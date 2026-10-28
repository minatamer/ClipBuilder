# CL-121 — remove the floating card from the motion graphic

Owner screenshot, 2026-10-28: remove the small “One useful conversation / A small
first step” card over the illustrated speaker. Keep the portrait, bottom captions,
camera/timing and actual product/editor features unchanged. Preserve pending
CL-114–120 work over landing baseline `09fb914`.

Allocate `illustrated-conversation.tsx`: remove that landing-only ContextualCard
invocation, its dead fixture and import. Existing `test/local-film.proof.ts`
checks absence of the floating copy across scenes while retaining bottom caption
content in the result. Update current film guidance and this packet/index.
Run relevant existing units, guarded responsive film proof and scoped lint/types/
format/whitespace; read-only validate to no actionable findings. No new test,
shared composition/backend/native/asset/configuration change or Git/deployment.

Fake/no-key/paid-off checks verify these synthetic visuals only. Real AI still
requires provider keys/live/approvals. Personal visual/physical/real/hosted/release
acceptance remains owner-only; preserve normal app/Studio and proof cleanup.

## Status

Implemented. Removed the landing-only ContextualCard render, its two-line sample
fixture and unused import from `illustrated-conversation.tsx`. The shared card
component and actual editor/processing features are untouched. Original portrait,
bottom FixedCaption, illustration label, timing and camera remain unchanged.

Verification: 23 existing page/camera/choreography tests passed (1.54s).
The guarded responsive film proof passed (58.91s), including absence of both
removed callout strings across representative scenes at three sizes, retained
bottom-caption wording in the result and existing transition/loop/whole-type/
cursor/portrait bounds. Inspected the new result capture under ignored
`.local-build/evidence/cl107-686-result-590.png`. The test browser/listener closes
in `finally`; processing/external requests are blocked.

Frontend/test types, affected ESLint/Prettier and whitespace passed. No new test,
full suite, backend/native rebuild, raster edit or export was required.

V121-final: **Meets ticket; No actionable findings.** Read-only review covers
the illustration removal, narrow existing-proof assertions and owning README/
packet/index overlay over `09fb914`, preserving/excluding earlier CL-114–120
work. Covered exact card removal, dead-code cleanup, retained captions/artwork,
shared-feature isolation, responsive rendering and cleanup. Deviation: none.
Fake/no-key checks prove presentation only; real AI/hosted/physical/rights/owner
visual/release gates remain unchanged. Nothing staged/committed or deployed;
no private env/media or provider/cloud action. Normal app/Studio preserved.

## Subsequent local commit authorization — 2026-10-28

The owner approved the [exact whole-file plan](../operations/CL114_121_COMMIT_PLAN.md),
16 ordered local commits and exact-path staging of pending CL-114–121 work.
Earlier unstaged/no-commit statements describe this packet's original handoff;
this later approval supersedes them only for the planned local Git action.
Personal visual, real-AI, hosted and release acceptance remain owner-only.
No push, deployment, provider/cloud request or ignored configuration change.
