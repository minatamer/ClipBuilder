# CL-156 — five-second AI pictures with breathing room

Status: implemented and focused fake/static/native validated; plan filed first.
Depends on the current shared editor
preparation path; preserve pending CL-152–155 work and the owner's two completed
real clips. Owner request, 2026-10-30: both Gemini and Codex should plan pictures
lasting at most five seconds. If an idea remains relevant, choose another
different but related picture after a one-to-two-second break. This is an AI
planning default/limit, not a manual editor maximum.

## Authority and decisions

Use a fixed two-second minimum picture-free gap for newly AI-planned pictures.
Keep the existing maximum three image attempts per clip. A sustained idea may
receive distinct related illustrations within that existing budget; do not
automatically clone a picture, split one model suggestion into extra image calls,
retry the model or invent additional facts. Existing source/export quality,
manual timing, saved/retained edits, Hook copying and privacy remain intact.

All agent verification uses synthetic media, fake/injected providers, no keys,
paid master/live flags off and external network interception. No new real sample
or provider/paid test, download, cloud, configuration edit, Git or deployment.
The old one-real-clip permission is exhausted.

Owner follow-up: explicitly declines a saved draft and wants fresh manual runs
after fixes; applying/reloading may clear this temporary test workspace. Do not
save a draft/checkpoint. Preserve retained/saved media and prior review exports.

At task start the normal host has two review-ready clips and no active batch.
Their completed paid work is in memory. A Save policy question was answered by
the owner declining persistence and accepting fresh tests after reload. Apply
normally without a Save action; no isolated integration patch is needed.

## Implementation plan and whole-file allocation

1. `apps/backend/local/planned-visuals.ts` and `.test.ts`: own one shared prompt
   policy and initial-plan timing normalization. Cap fresh planned cues at 150
   logical frames; enforce 60 clear frames before the next cue. Sort/convert
   physical clocks with existing tolerant conversion. Later cues may start later
   only within their original relevance window; omit an optional cue that cannot
   fit rather than fail the clip or spend on an invisible image. Keep existing
   brief/illustration/evidence data and no more than the admitted plan budget.
2. `apps/backend/local/codex-ai.ts`, `provider-ai.ts` and their `.test.ts` files:
   add the exact shared policy to both existing single planning calls. Prompt for
   a different useful related visual after the gap when a long thought merits it;
   no generic filler, duplicates or extra inference. The hosted shared editor
   uses the same Gemini adapter/batch. Retired legacy assembly remains outside
   the normal shared-editor flow and already has a stricter 4.5-second bound.
3. `apps/backend/local/clip-batch.ts` and `.test.ts`: normalize only a newly
   returned initial AI plan before picture dispatch/storage. Keep retained
   preparation/base reuse, image budgeting, automatic Pop anchors, face-safe
   placement and manual timing/edit/export paths unchanged. Prove oversized and
   overlapping fake plans produce <=5-second cues with >=2-second gaps, no added
   calls; a manually extended picture still saves/renders/restores above five.
4. `test/local-codex.proof.ts`: extend the injected current-source browser/native
   proof if required to verify actual normalized cue windows and a longer manual
   edit/export. Count every fake planning/image/native operation and cleanup.
5. This packet, `docs/tickets/README.md`,
   `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` and
   `docs/architecture/LOCAL_CODEX_AI.md`: owner decision and actual evidence.

If runtime edits await opt-in, save the exact integration patch in ignored
`.local-build/cl156-integration.patch` and test it against isolated copies of the
allocated modules. Do not commit private paths, media or provider output.

## Acceptance and validation

- Fresh fake/Gemini/Codex shared-editor picture cues last at most five seconds
  and have two clear seconds between them; useful related alternatives are
  requested in the same provider call and existing three-picture allowance.
- Manual edits and saved/restored geometry/timing can exceed five seconds.
  Existing paid assets/plans are reused without hidden regeneration/retry.
- Focused no-network tests, relevant types/lint/format and read-only validate
  pass; current-source synthetic preview/native proof where changed. No real
  provider quality/listening/device/hosted/release acceptance is inferred.
- Preserve the current completed workspace until Save/reload authorization is
  explicit. Report any unapplied integration as pending, never complete.

Fake mode needs no API keys for the timing/editor behavior. Actual Codex needs
saved ChatGPT sign-in, installed CPU speech/speaker models and real/master flags;
Gemini keeps its keys/live/approval prerequisites. None are used by these tests.

## Evidence

The shared fresh-plan normalizer caps intervals at 150 frames and keeps 60 clear
frames between cues, within their original physical relevance windows. Impossible
optional windows are omitted before image dispatch; usable clips are not rejected
or retried. Both prompts request distinct relevant alternatives in the existing
three-image budget. Manual edits/retry/restore/export do not run this normalizer.
The automatic Pop/face-safe placement use the final stored cue times. Gemini's
existing resume hook rebinds image admission to that stored normalized plan.

All 80 focused fake/paid-off/no-key cases pass in 9.86 seconds. They include long
and overlapping cue timing, bounds/relevance-window omission, metadata preservation,
both-provider prompt coverage and a manual eight-second image preserved through
failed export, saved in-memory restore and explicit retry with no new plan/image
work. The old image-retry fixture intentionally used two adjacent pictures in a
one-second clip; it now uses valid separated windows in a ten-second synthetic
clip, retaining its exact completed-image reuse assertion. Three provider test
assertions still assumed the pre-CL-155 default four/pool fourteen; they now use
two/twelve. No runtime change was required for those stale expectations.

Local/root-test TypeScript and scoped ESLint pass. The current-source synthetic
Codex/browser/native export/restore proof receives an oversized picture, stores
frames 30–180 (five seconds), checks the portrait output and restores without
new inference. It passes in 39.99 seconds with four injected inference attempts,
two injected speech/two diarization calls and eight native media jobs.
One earlier run completed functional assertions then stalled at host shutdown;
its verified two-process proof tree was stopped with zero survivors. Fixed-phase
test-only instrumentation on the retry showed every cleanup stage completing;
it has been removed. Do not claim the intermittent shutdown stall was diagnosed
or fixed here; CL-158 owns lifecycle/recovery investigation. Synthetic proof
evidence uses `.local-build/evidence/cl156-*`. No real media/provider call.

Read-only validate: Meets ticket for shared initial timing/prompt behavior,
manual freedom, call bounds, reuse/provider binding and local fake/static checks.
No actionable timing implementation findings. Native functional/cleanup retry
passed; the earlier intermittent teardown remains recorded for CL-158. Normal
app source reload is authorized without saving this test workspace. Final owned
refresh will follow the queued text/recovery work; no native worker/composition
code or contracts changed in CL-156. All prior work/media are preserved; no
stage/commit/push, configuration, cloud or deployment action.

Closure: CL-158 subsequently confirmed/fixed the closed-response stream race
behind the shutdown stall. Its final uninstrumented 69.40-second combined proof
passes the picture/title, recovery and complete cleanup checks. The normal app
and current worker are refreshed; final process/log evidence is in CL-158.
