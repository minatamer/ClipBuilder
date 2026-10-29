# CL-134 — one speaker per caption

Owner request, 2026-10-29: replace word-by-word speaker correction with one
speaker selector for each complete caption. Execute before packaging all pending
work for the subsequent local Codex integration. CL-133 is locally validated;
preserve its unstaged implementation and do not mix in Codex changes yet.

Use the most frequent known anonymous speaker within a caption; ties keep the
first known speaker in word order and wholly unknown captions stay unassigned.
The full caption keeps that speaker throughout. One manual selection assigns all
its words, preserving word IDs, text, timings, colors, saved edits and Hook use.
Legacy per-word edits remain readable and resolve by the same caption rule.
Keep existing word-based storage; no new provider call or wire format.

Allocation: `packages/contracts/local/caption-speakers.ts` and its focused test
own shared resolution; `apps/frontend/src/features/local-editing/caption-speakers.tsx`
and `style.css` own the single-select control; `test/local-focus-editor.proof.ts`
updates the existing real browser save/reset/discard and phone/desktop checks.
Source of truth, this ticket, index and local workflow guide own behavior/evidence.
Current-source native speaker/Hook proof must still pass; rebuild/reload normal
worker after shared logic changes through verified lifecycle ownership.
`packages/composition/local/overlay-frame.ts` resolves the original full caption
before Hook trimming so both occurrences retain its speaker. Its frontend
`overlay-frame.test.tsx` and `test/local-speaker-hook.proof.ts` assert that rule.

Acceptance: full caption speaker remains stable across every word; mixed/tied/
unknown/legacy labels and manual assignment preserve clocks; one selector per
caption; Apply/Discard/reset/save and responsive footer verified. Run focused
unit/browser/native checks, local/frontend/test types, scoped lint/format and
read-only validate. Tests are synthetic/fake/paid-off, no keys, provider/cloud
calls or owner media. Real diarization needs keys/live approvals and owner review.
No deployment/push. User authorized a file commit plan and local commits of all
prior work before Codex implementation; write that packaging plan first.

Status: implemented and locally validated; owner visual/real-diarization,
physical-device and hosted/release acceptance remain open.

Evidence, 2026-10-29: 62 focused tests passed across shared speaker resolution,
React overlay/styled captions and clip-batch handling. Existing current-source
native speaker/Hook proof passed both tests, now checking the same red speaker
through both words and its Hook excerpt. The real-controls browser proof passed
at desktop, 390 px and 320 px: one selector per caption, all words acknowledged
with the selected ID, keyboard selection, color, Apply, reset/discard/restored
state and footer/overflow guards. Synthetic screenshots inspected; owner media
and real AI were not used. The fixture's former implicit mixed-word color enable
assumption was updated to toggle explicitly for its single-speaker caption.

Contracts without Node ambient types, local/frontend/repository-test TypeScript,
scoped ESLint, Prettier and whitespace checks passed. Read-only scoped validate:
**Meets ticket; no actionable findings**. Full-caption resolution happens before
Hook clipping, preserving the source caption's speaker. Legacy assignments remain
readable; IDs/text/timing and saved edit schema are unchanged. No paid calls,
Gemini/other provider access, cloud changes, deployment or push.

Built current contracts, verified all eight old backend tree members stopped
and ports 4000/4200 free, then restarted normally with current worker/overlay.
API/worker own 4000/4200; original frontend preserved on 3000. Health, `/start`
and `/api/sample/config` returned 200. Safe logs/runtime identities remain in
OS-temp `clipbuilder-caption-20261029-cl134`. Packaging follows the separately
committed [whole-file plan](../operations/CL133_134_COMMIT_PLAN.md), `85563c8`.
