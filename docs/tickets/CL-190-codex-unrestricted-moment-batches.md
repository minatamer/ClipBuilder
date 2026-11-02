# CL-190 — Local Codex Find all through review, preparation and recovery

Status: Authorized and queued, 2026-11-02. Owner AFK authorization lifts the
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
