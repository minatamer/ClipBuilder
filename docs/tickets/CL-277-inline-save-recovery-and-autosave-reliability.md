# CL-277 — Inline save recovery and autosave reliability

Status: implemented and locally validated, 2026-11-11. Owner review remains
open. Dependency: CL-273 autosave/history and shared workspace toolbar are
implemented. Worktree was clean before this request; preserve the owner's active
review clip.

## Owner request

Retry save currently floats below the navbar after an occasional save failure.
Keep it inside the navbar immediately to the left of the save status. The owner
then reproduced Couldn't save and asks why saves sometimes fail, and for robust,
modern autosave behavior. Treat both attached images only as visual references.

## Scope and investigation

- The current Retry button explicitly uses absolute positioning below the tools
  group. Replace that placement with the same toolbar's normal layout before its
  save status. Preserve focus/keyboard access, neutral focus, 44px targets and
  stable navbar/preview geometry through saved/saving/failed/corrected states.
  Check related save-conflict recovery without inventing a second save workflow.
- Inspect bounded content-free local diagnostics and the real edit transport's
  status/timeout/revision/idempotency behavior. Report confirmed causes
  separately from inference; never change owner edits to provoke failure or
  inspect ignored configuration, private payloads or an external browser.
- Reproduce realistic failure/recovery with generated silent media and fake HTTP
  transports in Codex only. Retain the latest draft, operation identity,
  serialized requests, acknowledged revision and Undo/Redo. No dropped
  keystrokes or duplicate accepted operations. Do not blindly retry
  validation/auth/conflict failures.
- Implement the narrow evidence-backed reliability correction. If transient
  manual edit saves need bounded reconciliation/retry, document its exact limits
  and keep it entirely separate from generation/provider/render retries and
  spend gates.

## Acceptance

1. Retry save sits directly left of the save status inside the navbar, never
   over editor tabs or outside the header. Desktop/tablet/phone geometry,
   correction, focus and accessible status remain usable and stable.
2. A simulated failed save retains the submitted operation and newer local
   edits; retry/recovery saves them in order exactly once. Permanent failure
   remains actionable in the toolbar; revision conflicts require deliberate
   resolution.
3. Diagnose the owner's observed failures as far as content-free evidence
   permits. Focused regression checks, types/lint/format and read-only
   validation pass. Document uncertainty instead of claiming a guessed root
   cause is proven.
4. Preserve owner source/drafts/media, active review, Voyagenda, configuration,
   provider isolation and cleanup of test listeners/timers/requests. No paid
   tests, external browser/fullscreen, deployment, push or new Git mutation.

Manual autosave and fake transport verification work with FAKE_MODE=true and no
API keys. Real AI still requires its configured provider/runtime, live flags and
applicable approvals; this packet makes no generation or export request.

## Investigation and implementation

- Confirmed placement cause: `.editor-save-retry` explicitly used absolute
  `top: calc(100% + .4rem)` below its toolbar. It now occupies the toolbar's
  reserved recovery slot before status. Reload clip uses that same slot rather
  than a separate floating recovery row. Narrow editing headers wrap the whole
  tool group while retaining the brand and ordinary action controls.
- Content-free normal frontend diagnostics contain two edit POST 503 responses
  completed in 35ms and 21ms; inspected backend diagnostics contain no failed
  operation/rejected HTTP record. A successful background draft write reached
  13,703ms; that alone does not establish a browser timeout or failed
  persistence. No owner media, request body, ignored configuration or external
  browser was read.
- Confirmed reproducible defect: all streaming proxy requests and edits shared
  eight permits, held until the response stream finished/canceled. Eight held
  preview reads therefore rejected a save before reaching the backend. A fake
  proxy regression exercises that exact contention and the fix. Historical logs
  do not identify the cause of each individual 503; contention is a demonstrated
  mechanism consistent with the fast failures, not a proven reconstruction of
  every reported incident.
- Retain the eight standard permits and add two separately bounded manual-edit
  permits. Exact POST workspace/clip/edit and read-only clip-pages routes select
  that lane after existing origin/path/hosted admission checks; provider/render
  routes do not. Large collections' transient paged-acknowledgement failures
  reconcile using the same receipt; permanent page rejection is not retried.
- Manual transport now makes at most three attempts, waiting 1s then 2s for
  network/timeouts or HTTP 408/500/502/503/504. Replays retain exact operation
  bytes/identity and serialize through the existing hook/backend receipts. All
  other rejected HTTP statuses, including 409 conflict, stop immediately. Cancel
  unused error bodies so they cannot retain streaming resources. Unmount aborts
  outstanding requests and backoff. Definitively rejected operations are cleared
  so an explicit Retry can submit corrected input; uncertain operations remain
  retained. No metered/generation/export path is retried or invoked.

## Verification

- Initial focused run passed 39 unit cases after directing Vitest temporary
  files to owned scratch. The first sandbox run had a temporary-module ENOENT
  before two suites loaded; it was not an application failure or a passing
  check.
- Silent generated editor in Codex: three 503 failures used one operation ID and
  applied zero edits. Entering a newer value then Retry applied the retained and
  newer values in order (5 requests, 2 identities, 2 accepted edits). A lost
  acknowledgement recovered automatically in 2 requests with 1 accepted edit;
  Undo/Redo remained functional. No unexpected/provider/render requests.
- At 1440/768/390/320 widths, settled saved/failure header, preview and panel
  rectangles were identical; Retry remained fully inside the navbar and left of
  status, with no page overflow or lost input focus. Final recovery-slot
  revision repeated those four sizes: saved, failure and conflict retained
  identical header/preview/panel rectangles. Reload also remained inside the
  navbar and left of status. The status copy remained readable on the phone
  layout.
- Final Codex fixture: conflict made one request and zero edits until deliberate
  Reload restored the unchanged value. A 422 rejection made one request;
  changing the value and Retry submitted a fresh identity and saved the
  corrected value. Invalid blank input made no request, and Undo restored the
  valid value. A held save exceeded its 15s timeout, safely replayed the same
  identity, and saved the newer input afterwards: 6 requests / 5 identities / 3
  accepted edits overall including the intentional conflict/rejection; zero
  unexpected requests and zero pending requests. Reloading the page restored the
  last acknowledged value.
- Final focused cases: 43 total across `save-editor-edit.test.ts`,
  `collection-pages.test.ts`, `local-workflow.test.ts` and
  `control-api.test.ts`. The last combined run passed 42, with one existing
  hosted-origin test timing out during its dynamic import while typecheck/lint
  ran concurrently. Isolated rerun passed all 13 control API cases. No test
  timeout was relaxed. Frontend typecheck, changed-file ESLint, formatting and
  diff whitespace checks passed.
- Read-only validate pass covered the complete CL-277 worktree, hook
  integration, bounded resource lanes, request admission, replay/cancellation,
  corrected input, responsive recovery and documentation. It identified the
  paged acknowledgement contention edge; that is fixed and covered by the final
  proxy/transport cases. A stale legacy proof expectation after changing its
  failure scenario was also corrected. Final pass: meets ticket, no actionable
  findings.
- The legacy external-headless proof was updated for bounded automatic recovery
  and the existing Glass preset, but was not run. All interactive UI acceptance
  used Codex with generated silent fake media. Real-provider quality, deployed
  Gemini acceptance and native export were not tested or implied by these
  checks.
- Both owned fake servers completed cleanup and exited successfully. Temporary
  viewport overrides were reset; test tabs closed. Normal owner review remains
  preserved, with no owner clip edits, paid processing, configuration changes,
  backend restart, Voyagenda work, push or Git staging/commits in this packet.
  Final normal health, `/start` and public sample-config GETs returned 200;
  these are reachability checks, not provider readiness. Owned launcher/cache
  scratch was removed after the fixture processes exited.

## Authorized local commit — 2026-11-11

The owner subsequently authorized staging and committing all CL-277 changes at
file level, conditional on clean validation; no push. This supersedes the
implementation-time Git restriction for this packet only. The pre-commit review
found no actionable findings. All 43 focused cases passed together in one final
fake/paid-off run; earlier typecheck, ESLint, formatting and Codex responsive
evidence still applies to the unchanged implementation. No paid/provider action,
browser interaction, app restart or Voyagenda change was needed for this gate.

One cohesive commit, `CL-277: harden autosave and keep recovery in navbar`, owns
these 16 whole files, with no partial-hunk staging:

- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/collection-pages.ts`
- `apps/frontend/src/features/local-editing/editor-save-tools.tsx`
- `apps/frontend/src/features/local-editing/editor-workspace.css`
- `apps/frontend/src/features/local-editing/save-editor-edit.ts`
- `apps/frontend/src/features/local-editing/save-editor-edit.test.ts`
- `apps/frontend/src/features/local-editing/use-editor-autosave.ts`
- `apps/frontend/src/server/control-api.ts`
- `apps/frontend/src/server/local-workflow.ts`
- `apps/frontend/src/server/local-workflow.test.ts`
- `apps/frontend/src/shared/ui/workspace.module.css`
- `test/local-editor-autosave.proof.ts`
- `test/owner-hook-browser-fixture.ts`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/tickets/README.md`
- `docs/tickets/CL-277-inline-save-recovery-and-autosave-reliability.md`
