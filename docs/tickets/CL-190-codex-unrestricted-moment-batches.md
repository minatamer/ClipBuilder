# CL-190 — Local Codex Find all through review, preparation and recovery

Status: Implemented and validated, 2026-11-02. Owner AFK authorization lifts the
previous execution hold; use execute/validate/fix loops and local
ticket-prefixed commits without push. Depends on CL-185/186/189 and implemented
CL-085/158/172.

## Owner request and existing behavior

For local Codex, let AI find as many worthwhile moments as the source supports
without a requested count or arbitrary total-clip quota. The owner's final
instruction limits this expansion to local Codex. Existing local Gemini Find all
remains at its current limits; hosted must not gain Find all or Codex capacity.

CL-172 already provides Find all for either local provider, with a 360-result
safety ceiling and a separate ten-retained-clip processing guard. This packet
extends that feature end to end; adding another Find all button is unnecessary.

## Proposed implementation packet

- Preserve numeric/default-two selection and existing Find all UX. For local
  Codex, remove the 360 total-result cap and ten-total-clip processing guard,
  including hidden proposal, serialization, recovery, base/asset and UI limits.
  Allow a finite numeric requested count beyond ten if chosen, without promising
  that many results. Duration preferences/manual exclusions remain meaningful.
- Retain all unique usable discovered moments for review, without count padding
  or silently slicing the array. CL-189 provides bounded complete-window work;
  avoid one infinite response or an automatic “keep asking” loop. The source,
  model output and actual machine capacity determine the achievable result set.
- Keep explicit review/removal and Process clips; discovery never automatically
  prepares or exports clips. Process more than ten retained moments in the same
  session through a bounded serial/concurrent worker window, rather than require
  deleting extras. This is the existing session batch, not a general job queue.
- Keep large review/editor lists usable with bounded mounted UI and stable
  identities. Provide keyboard navigation, accurate counts and source jumps;
  keep the active proceed action visible. Do not duplicate workflow screens or
  accumulate footer actions. Editing remains completed-preview gated.
- Make aggregate persistence/resource handling incremental. Per-message/asset
  validation and active-memory/disk guards remain, but cannot silently cap the
  total at ten/360. Stop with actionable machine-capacity feedback and preserved
  completed work if resources run out. Preserve sources, manual edits, assets,
  exports and separate owner-saved drafts.
- Cancel stops not-yet-started work and reaps active native jobs. Explicit retry
  runs only requested failed/incomplete units; restore/reconnect never
  dispatches AI/render work or regenerates successful results. Preserve two-hour
  recovery expiry/Start over and existing source/retained-export cleanup
  distinctions.
- Enforce the expanded profile on the server, including worker/restore paths.
  Browser flags, imported Codex drafts, provider switches and hosted owner
  exemptions cannot enlarge new Gemini/hosted operations. Completed saved Codex
  clips remain readable when the active provider changes.

## File allocation and verification plan

Contracts: count/profile-aware result, batch/recovery schemas and tests.
Backend: analysis normalization, clip batch scheduling, capacity, save/recovery
and provider composition. Frontend: selection/review/editor rail/persistence and
capacity feedback. Worker changes only where aggregate job/storage bounds need
the explicit profile. Docs: source of truth, relevant guides, packet and index.

Fake/paid-off/no-key regressions cover >360 returned synthetic moments and a

> 10-clip batch; prove no silent truncation and bounded active workers. A
> smaller generated native batch may exercise full export while large-count
> metadata and stubbed jobs test scalability. Verify exact per-clip
> provider/render counts, partial success, cancel, failed-only retry,
> reconnect/restore with zero new calls, old drafts and disk exhaustion. Test
> unchanged Gemini and all hosted gates before dispatch. Inspect desktop/phone
> scrolling, keyboard rail, footer and recovery. Run scoped static
> checks/current-source proofs and validate. Record test scale honestly; fake
> large counts do not prove real two-hour quality or throughput.

## Capability and authorization boundary

Fake mode proves fictional discovery/batch behavior without keys. Real local
Codex needs prepared speech/speaker tools, saved ChatGPT sign-in, allowance and
local gates. It still consumes subscription usage; it is not unlimited offline
AI. Gemini uses API keys/live approvals and retains existing budgets. Real
moment completeness, editorial taste and large-batch device performance remain
owner acceptance. No execution, real AI/download, config/model change, restart,
cloud, deployment or Git mutation is authorized by this planning packet.

## Implemented packet — 2026-11-02

The server-owned local Codex capacity now enables `manyClips`: aggregate clip
and moment quotas are null. Numeric requests accept finite safe integers above
ten, and Find all has no total-result quota. The Codex response schema,
normalizer, domain reconciliation and prompt no longer contain the old
360/370-candidate ceiling. Individual inference responses still have the
existing four-MiB byte budget and deadline. Discovery is the finite planned
CL-189 pass, never a loop asking for more until a count is filled. Exact source
cuts deduplicate for Codex; overlap and other editorial judgments stay advisory.
Numeric selection can return fewer than requested. Existing default-two and
legacy numeric records remain readable. Gemini keeps ten numeric suggestions,
360 Find-all results and ten total processing clips; hosted has no Find all or
privileged capacity, including owner exemptions. Forged client/draft flags do
not select capacity. Completed saved Codex collections remain readable after a
provider switch; new Gemini operations still pass bounded admission.

The existing batch remains serial with one active worker. Larger explicit
Process clips actions submit bounded groups of fifty identities, retaining
review/removal first and never auto-processing from discovery. The first group
can enter the editor while the remaining explicit groups are admitted; Cancel
aborts further submission and cancels queued/native work. Identical operation
replays/cuts do not consume another preparation. The old 200-operation session
quota is removed only from the server-selected Codex batch. Per-clip asset,
output-revision and executable/renderer limits remain. Scratch reservation is
for the active unit rather than every queued clip. Each unit checks actual free
space and measured process/heap headroom. Capacity failure retains completed
clips, marks the affected unit with a fixed actionable reason and stops queued
work until explicit retry; it never deletes saved media or changes providers.

Large analysis/clip responses use local, authenticated read-only pages of at
most fifty items with a two-MiB target byte envelope (one larger independently
bounded item may occupy its own page). Cursor/identity/total checks prevent a
partial or changed collection from being accepted as complete. Reads never
repeat discovery/preparation. Status/reconnect reads use per-page deadlines, not
one timeout for the entire healthy collection. Hot page reads validate only the
returned page and avoid cloning all clip bases. Hosted page routes are excluded.
Review mounts fifty cards, the editor rail twenty tabs, and one editor remains
active. Source jumps, accurate total counts, removal, keyboard arrows/ Home/End
across pages and the persistent proceed footer remain. Dirty edits block clip
navigation, and unfinished clips expose no editor.

Codex saves/recovery use immutable bounded state pages with digest verification,
fixed-size roots and bounded-fanout trees. Arrays are grouped at stable item
boundaries so one edited item does not shift every later page. Existing pages
are verified/reused, not rewritten. Aggregate state can exceed the old 32-MiB
single-document envelope while individual items/pages remain bounded. The atomic
current/backup roots, source binding, media hashes, no-link paths and existing
cleanup remain. Old plain documents and CL-189 plain receipts still load; copied
compatible receipts are recognized without repeated deep decoding. Selection
receipts also page derived moments/cues, preserving usable larger responses.
Restore makes zero AI/native calls; incomplete work remains explicit retry.
Existing two-hour inactivity/active-job semantics and the single rolling
recovery store are unchanged. Saved sources/exports/projects remain separate.

The application still holds its finite active collection in memory. Admission
and decoding use measured machine/heap limits and stop with feedback when
capacity is unavailable; no total clip count replaces those checks. There is no
new general queue, database, hosted library, provider fallback or model/
reasoning/configuration change.

## Execute/validate loop and actual evidence

The loop fixed shifting byte-packed page boundaries, a hidden prompt ceiling,
legacy schema assertions, a restore fixture with an invalid processing hash,
copy compatibility between plain/paged receipts, whole-collection work on every
page, an overall collection-read deadline, and missing explicit memory feedback.
The twenty-four-clip rail crosses a page by real keyboard events and preserves
the preview/edit readiness gate. Browser fixtures distinguish selected-state
navigation from completed native previews; they do not claim AI quality.

- Final broad local gate: 919 fake cases across 110 files passed. A separate
  measured-memory/page gate passed three cases after adding the memory fixture.
- Fake server: all 720 unique moments from two-hour metadata retained and read
  through pages; 24 explicit clips prepared with a measured maximum of one
  worker; zero automatic preparation before Process clips; reopen under Gemini
  recovered all clips with zero new speech/selection/media calls; forged
  expansion rejected. No real media/model/provider request was used.
- Batch checks: 24 clips, one failed unit, failed-only retry, no calls on
  restore, 205 idempotent submissions with only one preparation, and disk
  exhaustion preserving completed work while canceling queued work. Existing
  cancel, caption/asset/export/hosted checks pass.
- Persistence: a generated state above 32 MiB round-trips through bounded pages;
  one changed item adds fewer than eight files and leaves old timestamps intact;
  damaged pages, canceled writes and disk failure do not replace the prior root.
- Codex adapter: 600 returned proposals retained in one injected selection
  request; numeric 100 is admitted only for composed local Codex. Gemini and
  hosted reject that request before transcription/selection.
- Browser: 720 results with only fifty mounted cards; keyboard paging/removal;
  719 retained identities submitted in fifteen explicit bounded groups. A
  24-clip rail mounts twenty tabs and native keyboard Arrow/End events cross to
  clips 21/24. Desktop 1440 and phones 390/320 show readable controls, no page
  overflow and visible footer. Screenshots inspected. No new AI calls on view/
  tab/page navigation.
- Current-source full Codex native/browser workflow passed (98 seconds), with
  generated short media, injected ASR/inference, actual FFmpeg/FFprobe/Chromium,
  preview/export/retry/caption and paged save/reopen. This smaller native batch
  complements large fake metadata checks; 720 real renders were not run.
- Public/Gemini analysis regressions: 112 cases in the focused public analysis
  file passed. All transports remain fake/paid-off/no-key/network-blocked.
- Contracts/local/frontend/test TypeScript checks, scoped lint/format/whitespace
  and current worker/overlay build passed. Installed pinned tools were invoked
  directly after the documented Corepack bootstrap issue; no package upgrade.

Final read-only validate: **Meets ticket; no actionable findings** on the
settled packet after the listed fixes. Real Codex allowance/availability, actual
long ASR throughput, worthwhile-moment quality, large native-batch device
performance and owner visual/release acceptance remain unverified. Fake results
prove orchestration, not live AI quality. Real Codex uses installed CPU speech
assets and ChatGPT sign-in/allowance; Gemini requires its API key/live approvals
and was not used. No real download/ASR/inference, normal app start, ignored
configuration read/change, cloud action, deployment or push occurred.

Whole-file staging allocation for CL-190 (all pending paths belong to this
packet):

- `apps/backend/local/analysis-chunks.ts`
- `apps/backend/local/analysis.test.ts`
- `apps/backend/local/analysis.ts`
- `apps/backend/local/clip-batch.test.ts`
- `apps/backend/local/clip-batch.ts`
- `apps/backend/local/codex-ai.test.ts`
- `apps/backend/local/codex-ai.ts`
- `apps/backend/local/draft-store.ts`
- `apps/backend/local/long-analysis.test.ts`
- `apps/backend/local/long-analysis.ts`
- `apps/backend/local/machine-memory.test.ts`
- `apps/backend/local/machine-memory.ts`
- `apps/backend/local/paged-document.test.ts`
- `apps/backend/local/paged-document.ts`
- `apps/backend/local/provider-ai.test.ts`
- `apps/backend/local/selection-policy.ts`
- `apps/backend/local/server-capacity.test.ts`
- `apps/backend/local/server-long-analysis.test.ts`
- `apps/backend/local/server-many-clips.test.ts`
- `apps/backend/local/server.ts`
- `apps/backend/local/session-recovery.ts`
- `apps/backend/src/analysis/analysis.prompt.ts`
- `apps/backend/src/analysis/analysis.provider-shape.ts`
- `apps/frontend/src/features/local-editing/clip-batch-panel.tsx`
- `apps/frontend/src/features/local-editing/clip-connection.ts`
- `apps/frontend/src/features/local-editing/clip-editor.tsx`
- `apps/frontend/src/features/local-editing/clip-stage.ts`
- `apps/frontend/src/features/local-editing/collection-pages.test.ts`
- `apps/frontend/src/features/local-editing/collection-pages.ts`
- `apps/frontend/src/features/local-editing/selection-panel.tsx`
- `apps/frontend/src/features/local-editing/style.css`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/architecture/LOCAL_CODEX_AI.md`
- `docs/operations/CL184_193_EXECUTION.md`
- `docs/operations/LOCAL_CODEX_CAPACITY.md`
- `docs/tickets/CL-190-codex-unrestricted-moment-batches.md`
- `docs/tickets/README.md`
- `packages/contracts/local/agent.ts`
- `packages/contracts/local/capacity.ts`
- `packages/contracts/local/clips.ts`
- `packages/contracts/local/codex.ts`
- `packages/contracts/local/collection-pages.ts`
- `packages/contracts/local/drafts.ts`
- `packages/contracts/local/policy.ts`
- `packages/contracts/local/selection.ts`
- `test/local-moment-cards.proof.ts`
