# CL-018 — Combine exact owner ranges with duration-controlled AI discovery

Status: implemented and locally verified in fake/paid-off mode. Owner authorized fake/synthetic implementation, validation loops
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

- [x] Multiple manual ranges survive independent discovery, ranking, overlap,
      empty AI results and changes to AI duration settings.
- [x] 30–30, 60–60 and 20–45-second AI policies work; manual ranges outside each
      policy remain unchanged within the separately documented local safety
      envelope.
- [x] Reject NaN, infinity, invalid/reversed/equal endpoints, out-of-source
      times, excessive rows and stale source revisions before any dispatch.
- [x] Equal manual start/end is rejected, equal AI minimum/maximum is accepted,
      and reversed/nonfinite/out-of-policy AI bounds are rejected. A source
      shorter than the AI minimum produces no AI suggestion without discarding
      owner ranges.
- [x] Test fractional times, a source endpoint, VFR/nonzero offsets, silence,
      duplicate/overlapping ranges, absent transcript words and exact-frame
      output.
- [x] Prompt, request, deterministic candidate reconciliation and actual cut
      validation enforce the same local policy. Public results stay 10–60
      seconds.
- [x] Focused unit/component tests assert exact fake transcription/selection
      counts, cancellation and zero dispatch on validation errors. Synthetic
      native cut checks need no keys; real timing/editorial quality stays
      owner-manual.
- [x] After implementation run the focused tests, root five gates and public
      artifact exclusion check. Record visual/keyboard review separately.

## Documentation and gates

Owner-requested compatibility revisit after CL-019: reconciliation was checked
with arbitrary supplied words, fractional timings, speakers and duration bounds,
independently of the fake recipe. Analysis provenance now comes from its typed
adapter and counters are generic `calls`; mismatched/unavailable mode rejects
before dispatch. See CL-019 follow-up for evidence and remaining live wiring.

Local UI/API/worker guides and the source-of-truth addendum describe the new
behavior. `FAKE_MODE=true` with `PAID_DEMO_ENABLED=false` needs no keys and
returns fictional analysis. Actual AI remains unavailable in this owner
composition: a real adapter, provider keys, live flags and rights/data/spend
approval would be necessary; paid acceptance stays owner-only. API-free native
cuts are deterministic, not local AI transcription; no model/weights/runtime
are supplied. The adopted manual ceiling is 300 seconds; maximum-capacity and
owner real exact-boundary/editorial review remain in CL-025. The owner has
authorized ticket commits, not push, deployment, cloud or external processing.

## Execution and validation evidence — 2026-10-22

- Owner contracts define one 30fps policy, source/policy revisions, exact range
  provenance, independent AI bounds and strict selection identities. Public
  request validators remain unchanged. The backend reuses its existing prompt
  and normalized word/evidence primitives; no live adapter is composed.
- One explicit Find action calls fake transcription once and selection at most
  once. Manual-only, no words and short sources skip selection. Duplicate cuts
  retain row aliases, matching AI evidence does not consume additional slots,
  and manual cues clip to the cut clock without invented words.
- Focused owner suite: **34 passed**. HTTP coverage includes invalid/stale input
  with zero calls, busy isolation, restored results without reanalysis, stale
  exports and cancellation/drain. Root suites: **1,290 passed** in 112 files.
  All five root gates passed: `format:check`, `lint`, `typecheck`, `test:unit`,
  `build`. `owner:build` passed. `owner:artifacts` checked 1,490 built files plus
  Docker exclusions/compiler roots. The existing Windows standalone result has
  26 external package links (`selfContained:false`); no Linux image or cloud
  build is claimed. Generated Next declaration changes were excluded.
- Opt-in native proof: **2 passed**, synthetic-only. Actual H.264/AAC outputs
  fully decode, exact 30/60-second outputs contain 900/1,800 frames, VFR/nonzero
  video/audio offsets preserve pixel transitions and silence, and fractional/
  source-end cuts contain the expected frames. Packet presentation endpoints
  corrected an observed MP4 duration overstatement that otherwise requested
  nonexistent final frames. Source fingerprints prevent stale native cuts.
- Browser review: two manual rows survived 30–30 and 60–60 AI policies; equal
  manual endpoints were rejected; manual-only reported 1/0 fake calls; refresh
  restored completed results; keyboard selection/export/clear worked. Busy
  controls disabled. Synthetic screenshot is outside Git in
  `C:/Users/minat/AppData/Local/Temp/clipbuilder-owner-launch-fefcc95ac84f4da2a79554e9ed8c48a8/cl018-controls.png`.
- Runtime readiness: host/worker/UI GET checks returned 200 on 4100/4200; owned
  supervisor 27444 and listeners 25868/27972 shut down through protected POST
  (204). Stabilization found zero owned survivors/listeners; scratch and private
  capability removed. Logs preserved at
  `C:/Users/minat/AppData/Local/Temp/clipbuilder-owner-runtime-LAoD9B` and the
  launch directory above. Generated synthetic inputs were removed; retained
  masters, captures and all private logs were untouched.
- Read-only validation rechecked current paths/contracts, public boundaries,
  exact-call and cancellation tests, native clock findings and UI state. The
  endpoint and stale-selection findings were fixed and revalidated. No
  actionable findings remain in the settled implementation. Deviation: none;
  optional source-player Set start/end controls are unnecessary for this slice.

Validation pass 2 (settled worktree): **Meets ticket** for the authorized fake/
synthetic track, **no actionable findings**. Coverage: manual provenance,
independent duration/grounding, strict revisions, one-call budgets, native
source clock, output frames, cancellation/cleanup and public isolation covered.
Real provider composition/quality, owner media/visual acceptance and maximum
resource capacity remain unverified in CL-025. No live, credential, cloud,
rights-dependent or paid check was run. This clean review does not close those
owner-only gates.
