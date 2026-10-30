# CL-167 — script-grounded visuals without semantic search drift

Status: implemented and locally validated after CL-166. Plan filed before code.
Owner reports
the latest visuals became unrelated and requests substantially better prompts
that explain the script at attention-worthy moments.

## Diagnosis and decision

CL-159/164 overemphasized playful metaphors/common physical subjects and explicitly
requested different subjects in fallback briefs. Commons searched only required
terms, discarding the scene-specific search phrase. This favors generic stock
and lets a failed technical query turn into an unrelated robot/bridge/parrot.

Prefer literal/source-faithful depiction of the precise claim, object, action,
relationship or comparison at that timestamp. Diagrams are allowed when useful,
never forced. Attention comes from a clear focal idea, meaningful contrast,
reveals and composition, not unrelated novelty or generic technical props.
Coverage stays one per started thirty seconds within existing budgets, but a
miss must not be filled with random art. The same script concept must survive
all alternative searches; broaden depiction/query detail, never the subject.

## Whole-file plan

1. New backend assembly visual-story policy shared by local `planned-visuals.ts`
   and `src/assembly/gemini-pictures.ts`: explanation-first art direction, small-
   overlay clarity, meaningful attention beats, no invented data/filler/likeness.
2. Existing planner policy and Codex planning prompt: spell out what scene must
   teach about the cited words, anchor timing to the key spoken beat, literal
   first and analogy only when actually supported by the script. Keep no fixed
   white card/palette/diagram and no change to title/hook policies.
3. `planned-visuals.ts` query normalization and Codex image port: primary subject
   requirements stay invariant in fallback briefs. An alternate missing the
   subject broadens to that same subject, never swaps it for another concept.
   Deduplicate actual bounded search phrases; preserve three lookups/eight
   seconds, private-free generic terms, no AI retry/Gemini fallback.
4. Commons source uses its validated full search phrase for precise retrieval;
   existing essential-concept relevance admission, host/rights/byte/deadline
   bounds remain. Gemini generator uses the same meaning-first direction while
   retaining existing generation count and all approval gates.
5. Relevant policy/adapter/Commons/Gemini tests plus current-source synthetic
   native/browser proof: preserve subject through failures, precise query and
   exact lookup/inference counts, non-fatal misses, old plan compatibility,
   source/art timing and save/export. No real search or AI taste claim.
6. This packet, index, source of truth, local Codex and media architecture:
   correct previous fallback guidance and actual evidence. Read-only validate;
   final backend/worker refresh. No keys/env/config, paid calls, cloud, deploy,
   Git actions or owner-media inference. Live relevance/taste remains owner review.

## Evidence

- `visual-story-policy.ts` now owns shared meaning-first direction for Gemini/
  Codex planning and Gemini image generation. Choose the precise cited claim/
  subject/action and an explanatory reveal/example/contrast; literal-first,
  source-supported analogies only, phone-readable focal composition and no
  random props/filler. Time to the key spoken words. Diagrams remain allowed,
  without a forced art style/template. Existing budgets/timing/coverage remain.
- Codex alternatives are scoped to the primary scene/required subjects. A query
  missing any whole essential token broadens to the same subject terms; merge
  bounded exclusions and deduplicate actual queries. Raw returned plans and
  legacy illustrations stay intact. Commons now uses the full validated phrase;
  existing essential-concept ranking and all admission/bounds remain.
- Focused fake local tests: 96 cases across planner/adapter/text/batch, passing
  after updating obsolete prompt-phrase assertions (92 in the combined run,
  then all 36 Gemini adapter cases in the focused rerun). Search tests exercise
  exact three-call outcomes/deadline, primary meaning/terms retained after an
  unrelated fallback, multilingual whole terms, deduplication, length bounds,
  optional misses, cancellation/digest rejection and zero Gemini fallback.
- Backend mocked source/generator/contextual-picture suite: 67 cases pass,
  including precise search phrases, meaning-first Gemini system instruction,
  fixed one-call generation, non-fatal optional art, safety/bounds and all gates.
- Current-source native/browser/recovery proof plus isolated CLI fake-endpoint
  proofs: three cases pass together (100.99s). Exact four injected inference/
  eight worker jobs/two image mocks remain. Primary "local processing" misses;
  the raw unrelated robot fallback becomes the same subject "processing".
  Checks include faces remaining visible, text/pictures, actual MP4 export,
  saved edits, recovery and desktop/tablet/phone states. No actual AI/search.
- Contract/local/backend/frontend/root-test TypeScript and scoped ESLint pass.
  Read-only validation of this packet's worktree changes: meets local ticket;
  no actionable findings. Reviewed actual policy/call wiring, compatibility,
  bounds/cancellation/cleanup, duplicate schema/constants, safe diagnostics and
  dependency direction. Earlier pending CL-152–165 work is preserved/excluded.
- No new quality rejection or automatic AI retry. All tests use fake/no-key/
  paid-off/network-blocked composition and synthetic media. Real visual taste,
  retrieval hit rate, physical-device listening, hosted/release acceptance are
  unverified owner checks. No env/credential inspection/change, paid calls,
  cloud/deployment or Git mutation. Nothing staged/committed.

Deviation: none. See final normal runtime refresh below.

## Final normal app refresh — CL-166/167

Verified supervisor 6960's creation identity, its nine-process current tree,
recorded orphan identities and inactive processing. Stopped the owned backend
tree; stabilization confirmed no survivors/orphans or listeners on 4000/4200
before replacement. Preserved frontend PID 13720 on 3000 and normal owner config,
saved/recovery/media files. Normal hidden `dev:backend` rebuilt contracts and
current worker/overlay. New supervisor 3744, API PID 22840/4000 and internal
worker PID 24068/4200 all verified in its owned tree. Health, `/start` and
`/api/sample/config` return 200; read-only capabilities report Codex ready.
No processing/provider/config/cloud/Git operation. App left running for fresh
owner review; the existing recovery mechanism preserves acknowledged state.

Content-free runtime record and separate logs outside Git:

- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl167-app-3deb764e93ed42059c052d67ba39817e\backend.runtime.json`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl167-app-3deb764e93ed42059c052d67ba39817e\backend.stdout.log`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl167-app-3deb764e93ed42059c052d67ba39817e\backend.stderr.log`
