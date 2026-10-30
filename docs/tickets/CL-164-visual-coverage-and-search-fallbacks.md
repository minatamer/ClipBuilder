# CL-164 — visual coverage and resilient public-image lookup

Status: implemented and locally validated after CL-163. Plan filed before code.
Owner requests
at least one visual per thirty seconds, including manually selected clips.
Current retained 60-second clip has one planning call, one image attempt and
zero visuals. Counter-only inspection cannot distinguish no match from lookup
failure; existing Codex returns null for either. No transcript/media was read
and no new processing was performed. Titles/hook work are separate packets.

## Plan and bounds

- Shared visual policy requests `ceil(seconds / 30)` distinct relevant windows,
  at least one in each thirty-second portion. Normal intake already admits at
  most sixty seconds, so the minimum is one/two within the existing three-image
  ceiling. Do not raise clip/image budgets or retroactively change saved plans.
  Retained legacy longer clips keep existing resource limits; log any shortfall.
- Give each Codex image up to two additional generic concrete subject/metaphor
  briefs in the existing planning call. Avoid over-specific abstract AND-term
  queries. Try primary then alternatives only when no usable asset is returned,
  at most three bounded public lookups within one eight-second overall deadline;
  one normalized image stored, no hidden Gemini/image-generation request.
  Existing per-lookup host/redirect/byte/rights bounds still apply. Cancellation
  propagates; no-match/failure remains non-fatal to usable clips.
- Request the minimum through provider structured-schema guidance and prompt;
  do not turn editorial coverage into paid-result rejection or automatic model
  retry. Failed external retrieval cannot guarantee an image: record exact
  content-free planning shortfall/no-match/lookup-failure/coverage-shortfall
  reasons, preserving the clip and all completed work. Never fill with the
  rejected forced diagrams, unrelated fixture art or unapproved provider calls.
- Preserve five-second max/two-second gaps, face-safe placement, None → Fade,
  source quality and manual editing freedom. Fake default-off images remain;
  injected fake plans/lookups prove mechanics without keys.

## Whole-file allocation and validation

Contracts `clips.ts`, `codex.ts` only as needed for alternate briefs; diagnostic
reason schema; backend `planned-visuals.ts`, `gemini-critique.ts`, `provider-ai.ts`,
`codex-ai.ts`, `clip-batch.ts` and directly relevant tests; relevant current-source
synthetic browser/native proof; this packet, index, source of truth and local
Codex architecture. No UI counters/tutorial prose or added provider setting.
Check zero/one/two plans, duration boundaries, missing/invalid/failed/canceled
lookups, bounded alternate counts/deadline, saved compatibility, fake dispatch
counts and provider isolation. Static checks/read-only validate; no live search,
real AI/media/config, paid call, cloud, deployment or Git mutation.

## Evidence

- Both planning transports receive per-thirty-second windows and a structured
  minimum (one/two for normal <=60s clips). Shared timing checks count coverage
  after normalization and after actual asset creation, preserving five-second
  displays/gaps. Saved plans and original three-image budget remain unchanged.
  Legacy longer material logs unmet coverage within its existing budget.
- New Codex wire cues request alternate generic briefs; saved old cues remain
  valid. Lookup tries at most primary + two distinct subjects with one overall
  eight-second deadline, never another AI/Gemini call. Late results discarded,
  duplicate queries skipped, cancellation propagated. Fixed private-free reasons
  distinguish plan shortfall, no match, lookup failure and final coverage gap.
- Six focused fake suites total 98 cases pass: planned visuals, Codex schema/
  adapter, Gemini adapter, batch and diagnostics. Updated an existing schema
  assertion from one legacy image to the requested minimum; the actual one-image
  returned fixture remains usable, demonstrating no local quality rejection.
  Local/root-test types and scoped ESLint pass; no actionable read-only findings.
- Isolated installed-CLI fake protocol (two cases) plus current-source synthetic
  native/browser/export/save/restart proof pass together (79.10s). Native proof
  first gets a null lookup, then a successful alternate; exactly two public-port
  mocks, one stored image, four fake inference calls/eight media jobs unchanged.
  Actual image-at-start, face clearance, saved/recovered asset and no new work on
  restore remain covered. Windows briefly locked an evidence-name rewrite;
  original ignored `cl160-*` artifact names remain, functional edits verified.
- No real search/AI/provider call, media/config access, deployment or Git change.
  External unavailability or noncompliant AI can still leave missing imagery;
  this is recorded and never turns a usable paid clip into a retry requirement.
  Real retrieval hit rate/editorial taste remain owner review. Final normal
  native/backend refresh follows CL-165.
