# CL-085 — Review moment cards with Jump to, duration and Remove

Status: implemented and locally validated; owner visual/real-media/hosted
acceptance pending. Owner-authorized 2026-10-26.

## Scope and authority

Owner requests a Jump to CTA on every manual/AI result card, explicit duration,
clean card geometry and removal instead of Select/Deselect. Use execute/validate
on this one packet. Preserve all pending locally validated CL-084 work; no Git,
provider, G Cloud, configuration or backend/native changes are authorized.

Follow `AGENTS.md`, frontend instructions and the source of truth's CL-085
decision, CL-045 footer actions, CL-048 mutually exclusive Add clips / Your clips
views, CL-060 usable-provider-output acceptance and CL-084 explicit export.
This owner revision supersedes the CL-048 toggle interaction, retaining the
existing ten-clip processing bound and explicit Process action.

## Implementation plan

- `moment-selection.ts`: retain all unique returned IDs in manual-first order;
  do not silently hide usable extra AI results. Frame-derived duration uses the
  existing 30fps cut clock, including fractional seconds and legacy longer cuts.
- `selection-panel.tsx`: render only currently retained cards, with title,
  readable start/end range, duration and one aligned Jump to / Remove action row.
  Remove changes only the current processing list, preserving the raw analysis,
  input ranges, IDs/clocks and remaining order. Tabs preserve removals. Fresh or
  restored analysis initializes the full result list; no new persisted schema.
  Maintain keyboard focus after deleting a card, including the last card.
- `experience.tsx`: Jump to seeks and plays the existing source video at the
  cut's exact start, then brings the preview into view. Guard unloaded/failed/
  busy video; handle blocked playback without unhandled promises. No AI/native
  call, export, new source or selection mutation occurs. Manual and AI cards use
  the same callback. Existing source timing Capture remains unchanged.
- `clip-batch-panel.tsx`: Process remains the sole proceed action in the footer,
  disabled for zero or more than ten retained cards; concise overflow guidance
  asks the owner to remove extras. Do not truncate results or increase limits.
- Shared feature `style.css`: consistent glass cards, title/meta spacing,
  tabular timestamp numbers and clear duration, matched 44px action targets,
  long-title wrapping and narrow-card layout without horizontal overflow.
- Update affected unit/browser proofs and narrow guides/index/source of truth.
  No renderer restart or dependency install is necessary for frontend edits.

## Acceptance and verification

1. Every retained manual and AI card shows exact frame-derived duration, start/
   end timestamps, Jump to and Remove; no Select/Deselect or pressed toggle.
2. Jump uses the source cut start without changing clips, dirty state, AI call
   counts or processing. Verify actual generated video seeking/playback, loaded/
   unavailable/busy states and keyboard activation.
3. Remove deletes the card from Your clips and parent processing IDs immediately;
   no auto-submission, backend deletion or provider call. Removing all shows No
   clips yet and a disabled Process clips. Tabs retain input/removal state;
   changed inputs still invalidate stale analysis. Keyboard focus stays useful.
4. All returned results, including more than ten, are visible until explicit
   removal. Overflow disables processing and guides removal; processing enables
   once 1–10 remain, with the same backend identity/order/bound contracts.
5. Inspect current-source desktop/390/320 cards, long titles, mixed manual/AI,
   loading/disabled, empty and over-limit states. Footer remains visible and
   actions remain reachable with keyboard and touch. Preserve motion policies.
6. Focused selection/duration units, affected frontend types/lint/format and an
   actual synthetic browser proof covering the full result interaction. Update
   older Select/Deselect assertions where touched; do not repair unrelated
   intake/acquisition workflows just to make a broad historical proof pass.
7. Read-only validate settled CL-085 changes, fix actionable findings and repeat
   affected checks. Leave the normal app/config/real-mode owner session intact.

Agent checks use synthetic generated video, injected analysis and fake/paid-off/
network-blocked setup, no ignored env reads or real source/transcript data.
Controls work without API keys with fake results; real AI suggestions still
need normal keys/live approvals and owner-manual acceptance. Jump/Remove are
API-free UI interactions, not a new local AI implementation. Owner personal
visual/real-media and hosted acceptance remain unchecked. No paid action,
configuration/cloud change, staging or commit.

## Implementation and evidence — 2026-10-26

The real selection path now renders retained manual/AI cards with a title,
source range, frame-derived duration and shared Jump to / Remove buttons. Jump
seeks and plays the existing source preview, handling unavailable media and a
rejected playback promise. Remove updates the parent processing IDs immediately,
preserves the remaining order across tabs, and moves focus to the next/previous
Remove button or empty results panel. No request occurs for either interaction.
All returned IDs initialize retained; Process clips is guarded in both its
disabled state and click handler for an empty or over-limit list.

Whole-file scope (all unstaged; preserve overlapping CL-084 work):

- `apps/frontend/src/features/local-editing/moment-selection.ts` and
  `moment-selection.test.ts`: unique initial IDs and duration formatting.
- `apps/frontend/src/features/local-editing/selection-panel.tsx`,
  `experience.tsx`, `clip-batch-panel.tsx`, `style.css`: cards, actual playback,
  removal/focus, capacity and responsive geometry.
- `apps/frontend/src/features/local-editing/runtime-capabilities.test.tsx`:
  callback integration and 0/10/11 retained-clip footer checks.
- `test/local-moment-cards.proof.ts`: current-source browser proof with generated
  media and injected analysis. `test/owner-controls-browser.ts` and
  `test/local-design.proof.ts`: update existing toggle assertions for removal.
- `AGENTS.md`, source of truth, frontend feature README, this packet and ticket
  index: record the owner interaction revision and its actual evidence.

Checks already passed:

- Focused local units: **18/18** in `moment-selection.test.ts` and
  `runtime-capabilities.test.tsx`, using `scripts/local-test.config.ts`.
- Actual synthetic browser proof: **1/1** with
  `scripts/local-proof.config.ts test/local-moment-cards.proof.ts`. Decoded video
  seeks/plays from manual 1s and AI 4.5s starts, including native Enter activation.
  Busy/unloaded/failed video disables actions; blocked playback gives an
  actionable message without an unhandled rejection. Jump/Remove make zero
  mutation requests; explicit Process sends exactly the remaining ordered IDs.
  Removal survives tabs; 12 results remain visible with Process disabled,
  removing to ten enables it, and removing all disables it and focuses the empty
  results panel. No Select/Deselect or pressed-toggle controls remain.
- Browser geometry at **1440, 390 and 320px**: no horizontal overflow, visible
  persistent footer and at least 44px targets contained in every card. Inspected
  synthetic screenshots at all three widths, including long titles. Evidence
  remains ignored at `.local-build/evidence/cl085-cards-{width}.png`.
- Frontend TypeScript and `tsconfig.tests.json` checks pass.
- ESLint passes for the nine affected source/test/proof TypeScript files;
  Prettier passes for all fifteen CL-085 files and `git diff --check` passes.

Final read-only validate pass: **Meets ticket; no actionable findings** on the
settled unstaged CL-085 scope above. Reviewed the complete ticket, relevant
tracked/untracked diffs, playback readiness/callback integration, parent
processing payload, focus/empty/overflow behavior, shared styling, network and
cleanup boundaries. Existing CL-084 backend/contracts/renderer work was excluded
from this verdict and preserved. Requirements 1–7 have local synthetic evidence;
personal visual/real-provider/hosted acceptance remains unverified. No new
dependencies, duplicate contract schemas, app import violations or debug/content
logging were introduced. Proof-owned browser/server/process/scratch are cleaned;
normal app services were not restarted.

The initial keyboard proof sent an incomplete CDP Enter event; adding its text
payload made native activation run. No application keyboard workaround was
needed. Windows Vite atomic temporary-file operations require the documented
outside-sandbox proof/test launch; the same fake/paid-off/network guards remain.
No product-scope deviation. The older broad design proof remains outside this
gate because of its previously observed unrelated intake failure; its touched
assertions were updated and typechecked, not reported as executed successfully.

Remaining owner-only acceptance: personal visual review, real-media/real-AI
manual use and hosted acceptance. Fake/no-key controls and native seeking are
verified with synthetic content; fixture provider-mode metadata does not prove
live AI quality. Real suggestions still need configured keys/live approvals.
No new local AI model/assets, backend/worker/configuration change, cloud access,
paid request, Git mutation or deployment. The normal real-mode app stays running.
