# CL-018 — Combine exact owner ranges with duration-controlled AI discovery

Status: queued; owner authorized fake/synthetic implementation, validation loops
and ticket commits on 2026-10-22. No paid/provider/cloud/real YouTube calls.
Dependencies: CL-017 isolation/workspace decisions and implementation; current
CL-007 validated transcript and text-only candidate selection.

## Objective and owner requirements

Before Find moments, let the owner add, edit and remove several start/end ranges
while retaining the normal independent AI search. Let the owner choose minimum
and maximum AI-discovered clip durations, including min=max for exact-length
requests. AI duration preferences never trim, remove or replace manual ranges.
This improves personal editorial control without changing public candidate
rules.

## Research, limits and scope

See the [research](../research/LOCAL_OWNER_WORKFLOW_2026-10-22.md). Existing
selection is word-grounded and reconciles 10–60-second ranges. Merely changing
the prompt will not implement exact duration or manual timestamp cuts.

Use source-relative `HH:MM:SS.mmm` inputs, canonical integer milliseconds and
`[start,end)` semantics. Add/remove rows and optional source-player Set start /
Set end are sufficient; no timeline. Keep owner ranges visible separately from
ranked AI suggestions. Default AI duration remains 10–60 seconds. The initial
per-workspace counts and separate manual safety envelope are proposals settled
in CL-017/this packet; do not silently apply the public 10-second floor or
60-second ceiling to custom ranges. Reject unsupported ranges with a precise
safe reason instead of clamping them. No unlimited resource claim.

Validate the AI duration policy separately: positive finite values, minimum no
greater than maximum, and both within the settled local AI safety envelope.
Minimum equal to maximum is valid. Manual start equal to end is invalid; these
are different rules. If the source cannot supply an AI window within the
selected bounds, report no qualifying AI suggestion while preserving valid
manual ranges.

Manual ranges are explicit extraction requests, not hints the AI can discard.
The normal run also performs independent discovery; an optional manual-only run
must be an explicit owner choice and must not imply free automatic captions.
Exact duplicate manual ranges reuse one processing identity while keeping their
visible origin. Overlapping/distinct manual ranges remain valid. AI overlap
filters apply to AI suggestions; a match to an owner range links provenance and
must not consume the slot for an independent suggestion. Never pad weak AI
picks.

## Contracts, state and owning areas

Frontend local input/review state; backend local analysis request/use case and
deterministic reconciliation; separately exported owner contracts. Reuse current
`analysis.prompt.ts`, `analysis.reconciliation.ts` and transcription adapter by
explicit policy parameters or local wrappers within backend ownership. Public
requests must reject owner-only fields; do not widen shared public validators.

Store source revision, owner range ID, exact requested times, provenance and AI
duration policy revision. AI candidates retain word evidence plus validated
physical cut times; manual ranges need not start/end on transcript words. Word
cues intersecting a manual cut are clipped to its local clock without invented
speech. Silent ranges are renderable or explicitly reported unsupported for an
AI stage; absence of speech must not discard the owner's extraction request.

State: source-ready → inputs-ready → analyzing → reviewable, or canceled/failed.
Freeze inputs on dispatch. Later changes cannot mutate an in-flight result;
require a new explicit action and retain manual rows through
failure/cancellation. Invalid/stale inputs dispatch zero work. Provider-origin
strings remain untrusted.

Define 30fps conversion once. Exact 30/60 seconds means 900/1,800 output frames.
For AI selections, fit a source-backed window within the chosen bounds and
preserve evidence/context; return no qualifying suggestion if impossible. Never
stretch speech, freeze frames or synthesize padding just to meet duration. For
manual ranges, show frame-rounded cut times before processing, with at most
one-frame endpoint rounding; never snap silently to words/keyframes. Preserve
source offsets through normalized proxies and re-encode accurate cuts.

## Privacy, provider and cost constraints

One explicit analysis action uses at most one source transcription and one
candidate-selection call. Reuse that transcript for manual ranges. Adding rows,
changing inputs and scrubbing make zero provider calls; no automatic retry or
reanalysis on every keystroke. If duration-only reselection is later offered,
make it explicit, reuse validated words and budget at most one selection call.
No retained-sample cache or diagnostic-response reader. Private workspace data
follows CL-017; logs contain counts/status only, not ranges tied to real
content.

## Acceptance and verification

- [ ] Multiple manual ranges survive independent discovery, ranking, overlap,
      empty AI results and changes to AI duration settings.
- [ ] 30–30, 60–60 and 20–45-second AI policies work; manual ranges outside each
      policy remain unchanged within the separately documented local safety
      envelope.
- [ ] Reject NaN, infinity, invalid/reversed/equal endpoints, out-of-source
      times, excessive rows and stale source revisions before any dispatch.
- [ ] Equal manual start/end is rejected, equal AI minimum/maximum is accepted,
      and reversed/nonfinite/out-of-policy AI bounds are rejected. A source
      shorter than the AI minimum produces no AI suggestion without discarding
      owner ranges.
- [ ] Test fractional times, a source endpoint, VFR/nonzero offsets, silence,
      duplicate/overlapping ranges, absent transcript words and exact-frame
      output.
- [ ] Prompt, request, deterministic candidate reconciliation and actual cut
      validation enforce the same local policy. Public results stay 10–60
      seconds.
- [ ] Focused unit/component tests assert exact fake transcription/selection
      counts, cancellation and zero dispatch on validation errors. Synthetic
      native cut checks need no keys; real timing/editorial quality stays
      owner-manual.
- [ ] After implementation run the focused tests, root five gates and public
      artifact exclusion check. Record visual/keyboard review separately.

## Documentation and gates

Update local UI/API guides, source-of-truth local addendum and index. Existing
`FAKE_MODE=true` needs no keys and returns synthetic analysis; this new behavior
is only planned. Actual AI needs real provider keys, live flags and rights/data/
spend approval; the agent never runs the paid acceptance flow. API-free native
cuts are deterministic, not a local AI transcription feature; no weights/runtime
are supplied. Manual duration ceiling/capacity and owner exact-boundary review
remain open. No Git, deployment, cloud or external action is authorized.
