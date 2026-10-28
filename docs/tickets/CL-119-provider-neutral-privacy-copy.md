# CL-119 — provider-neutral AI copy in Privacy

Owner request, 2026-10-28: replace Google/Gemini branding in the Privacy dialog
with generic AI-provider language. Preserve the short audio/video transfer and
separate provider retention disclosure, and preserve all mode-specific details.
Actual providers/processing/privacy policy do not change.

Allocate `privacy-dialog.tsx`, existing `page.test.tsx` assertions, current
frontend Privacy guidance and the narrow source-of-truth copy direction. Use
“our AI provider” in the transfer paragraph and “AI” in picture-generation
sentences. Keep the separately described Wikimedia image-search disclosure.
Preserve pending CL-114–118 work over `09fb914`. No Git mutation/deployment.

Verify existing page tests and guarded all-mode Privacy browser checks, scoped
lint/format/whitespace; read-only validate to no actionable findings. No new
tests/full suite/native/backend changes. Fake/no-key checks verify UI only;
real AI still requires provider keys, live flags and applicable approvals.
Owner personal visual/physical/real-AI/hosted/release gates remain separate.

## Status

Implemented. The transfer paragraph now says: “Real AI processing sends a short
audio/video copy to our AI provider. Its retention rules are separate.” Picture
generation/fallback wording uses “AI”; other mode disclosures remain intact.
Current frontend/source guidance records this wording-only owner revision.

Verification: 12 existing page tests passed (1.43s), including transfer/retention
and absence of Google/Gemini names in all four dialog modes. The guarded
desktop/phone all-mode Privacy proof passed (7.06s), retaining geometry and
keyboard behavior. Scoped ESLint, Prettier and whitespace passed. No new test,
full suite/type run, backend/native rebuild or real provider call was required.

V119-final: **Meets ticket; No actionable findings.** Read-only review covers
the provider-wording/assertion/documentation overlay on pending CL-114–118 over
`09fb914`. Covered generic provider copy, preserved transfer/separate retention,
picture details and unchanged processing/settings. Deviation: none. Fake/no-key
UI checks do not establish real AI/hosted/release acceptance; keys/live/approval
gates remain unchanged. Work is unstaged; no Git mutation or deployment.

## Subsequent local commit authorization — 2026-10-28

The owner approved the [exact whole-file plan](../operations/CL114_121_COMMIT_PLAN.md),
16 ordered local commits and exact-path staging of pending CL-114–121 work.
Earlier unstaged/no-commit statements describe this packet's original handoff;
this later approval supersedes them only for the planned local Git action.
Personal visual, real-AI, hosted and release acceptance remain owner-only.
No push, deployment, provider/cloud request or ignored configuration change.
