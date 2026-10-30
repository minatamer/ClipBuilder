# CL-154 — opening camera evidence and face-safe planned pictures

Status: complete locally; fake/static/native validation and read-only review pass.
Real opening/editorial acceptance remains open. Depends on CL-150–153, whose local
implementation and validation evidence exists; their pending work is preserved.

## Owner request and authority — 2026-10-30

Fix the uncertain opening speaker/camera behavior and the illustration covering
the face observed in CL-153. File this plan first, execute, then validate only
with synthetic media, FAKE_MODE=true, paid master/live flags off and no keys.
The earlier one-real-clip approval is exhausted. No more real sample processing,
Codex/Gemini inference, model download, configuration edit, cloud, deployment or
Git mutation is authorized. Preserve the completed owner review export and all
retained/saved/private media. Do not rewrite existing owner edits or projects.

## Diagnosis and implementation plan

The current planner asks for null speaker/person plus empty evidence when audio
association is uncertain. The decoder clears evidence for all null speaker IDs,
and the camera compiler requires a known audio speaker even at the opening.
This loses otherwise supported visual evidence of who is talking. Unknown audio
labels must remain unknown; do not fill them from adjacency or invent identity.

Planned pictures currently use one fixed normalized box regardless of the face
observations or the portrait camera crop, so a lower face can be obscured.

1. Allow a high-confidence visual-only opening decision with a visible anonymous
   person, null audio speaker and sustained evidence from unassigned words.
   Restrict it to the opening of a shot, check intersecting timed evidence and
   conflicting speech, retain the normal sustained gate for later switches and
   keep low-confidence/unsupported openings held. Update the existing single-call
   prompt and retain evidence only for admitted null or known speaker IDs. Ask
   for tight face/head bounds including the chin/hair and excluding torso so
   picture placement protects the face without treating the whole body as a face.
2. Add deterministic initial picture placement using the compiled portrait crop
   and every relevant visible-person observation over the cue interval. Protect
   the supplied face/upper-body rectangles conservatively with a margin. Prefer
   a readable lower slot, then alternative positions/sizes. Keep one placement
   throughout a cue, no layout jitter. If a useful face-clear slot is impossible,
   retain a bounded editable placement rather than reject usable paid output.
   No extra AI call, schema budget, source/export quality or clip-limit change.
3. Connect placement only when creating a new planned picture. Existing retained
   partial preparation, saved/manual boxes, Hook copies and preview/export use
   their existing stored coordinates without automatic repositioning.
4. Add synthetic opening/conflict/shot-reset tests and picture projection,
   interval/camera-switch, bounds and fallback tests. Extend the existing injected
   Codex/browser/native proof to exercise an unassigned opening, a right-hand
   opening person and actual face-clear picture coordinates in preview/export.
   Count mocked calls and verify restore/cancel/cleanup without new inference.
5. Run focused fake tests, contract/local/test types, scoped lint/format, native
   synthetic proof and a separate read-only validate pass. Rebuild/reload current
   native artifacts using verified lifecycle ownership if worker/contracts change;
   preserve the healthy frontend and owner configuration. Record limitations.

## Whole-file allocation

- `apps/backend/local/codex-ai.ts` and `.test.ts`: prompt, evidence retention and
  integrated opening camera behavior through the existing one-call adapter.
- `packages/contracts/local/focus.ts` and `.test.ts`: supported visual-only shot
  opening without fabricated audio labels; ordinary later switches unchanged.
- `packages/contracts/local/visual-placement.ts` and `.test.ts`: pure bounded
  normalized face/crop projection and deterministic initial picture placement.
- `apps/backend/local/clip-batch.ts` and `.test.ts`: new-picture placement only,
  preserving retained/manual boxes and all metered reuse behavior.
- `test/local-codex.proof.ts`: synthetic browser/native evidence, current-source
  overlay, exports, restore and exact injected call counts.
- This ticket, `docs/tickets/README.md`,
  `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` and
  `docs/architecture/LOCAL_CODEX_AI.md`: narrow behavior authority and evidence.

## Acceptance criteria

- A strongly evidenced visible opening person can be framed from shot start
  even when those opening words have null audio speaker labels. Labels, IDs and
  clocks are preserved. Weak, conflicting, missing or fabricated evidence cannot
  force a crop. Later visual-only guesses cannot trigger speaker switches.
- New planned pictures avoid observed people when a readable safe slot exists
  across their full interval, including camera changes. Geometry stays bounded;
  fallback is deterministic and non-fatal. Existing/manual edits are preserved.
- Same image/call budgets, explicit retries, provider isolation, source/export
  quality, limits, schema safety, private diagnostics and cleanup remain intact.
- Fake/injected tests prove the mechanics only. Actual opening voice/face and
  editorial placement quality on unseen media remains unverified and owner-only;
  real Codex needs saved ChatGPT sign-in, installed local speech/speaker models
  and enabled real/master settings. Default Gemini retains its own keys/gates.

## Evidence

The camera compiler admits a visual-only decision only at a shot opening with
confidence >=0.95, at least one second of intersecting unassigned-word speech,
evidence starting within 0.5 seconds of the opening, visibility continuously
through confirmation and no competing known-speaker speech. Contradictory
opening people keep the provisional crop. Mid-shot visual-only decisions cannot
switch the camera. The Codex adapter preserves evidence for genuine null IDs
while clearing invented audio IDs; transcript labels/IDs/timestamps are unchanged.
The existing one-call prompt now requests opening evidence and tight full-head
bounds. This does not claim unknown audio labels were recovered.

New planned pictures project all intersecting observations through the existing
integer source-content/camera crop, protecting the complete supplied rectangle
with a 2.5% portrait margin. Try four bounded sizes and lower/top/side/middle slots,
keeping the first readable clear placement. If all tested slots overlap people,
minimize proportional overlap without hiding the picture or triggering a retry.
Placement occurs only for a newly created asset, after retained partial-picture
reuse. Stored/manual edits remain authoritative on restore/render/Hook copying.

Focused validation: 71 tests across focus, placement, Codex adapter and clip batch
pass (the original 70-case run plus the new manual-box preservation case). These
cover unknown/weak/invented/conflicting/late opening evidence, true shot resets,
ordinary sustained switches, portrait/padding/zoom/aspect-ratio projection,
offscreen/expired observations, interval camera changes, occupied-frame fallback,
no geometry mutation and manual-box restore/native job preservation. Contract,
local and root test TypeScript, scoped ESLint and changed-code formatting pass.
The sandbox's first Vitest run hit its known missing temporary transform path;
rerunning outside that sandbox under the same fake/network/paid-off setup passes.

The current-source synthetic Codex/browser/native proof passes in 40.30 seconds.
It uses navy source media with lime/yellow head stand-ins, injected speech and
diarization (two opening seconds unassigned), and injected Codex plans. Native
frames at 0.5/2 seconds show the correct right/yellow opening, including an active
face-clear illustration at second 2; frame 7 shows the expected left/lime crop
after the ordinary sustained audio switch. Pixel-region assertions and visual
inspection agree. Three editor screenshots at 1440, 390 and 320 px show the
face-clear placement and visible footer; the smallest screen scrolls its video.
Synthetic captions overlap part of the picture, an existing separate text/layout
limitation outside the requested face protection. No real content was used.

The proof has four exact injected inference attempts (one deliberate selection
failure, explicit successful selection, and two clip plans), two injected speech
and two diarization calls, eight native media jobs and no new call on saved
reload. Ordinary preview/export, a manual clip's explicit local caption action,
saved focus/picture geometry and cleanup pass. Its first native run exposed a
test-helper defect: Sharp stats measured the original full frame unless the
extracted region was materialized. Correcting that helper passes the unchanged
rendered color/crop checks; thresholds were not weakened. Synthetic evidence is
ignored under `.local-build/evidence/cl154-*`; proof-owned media/listeners/browser
and scratch are removed in existing finally paths. The normal app is not used
for inference. Real speech/face/placement, listening/device/rights/hosted/release
acceptance remain unverified. No staging or commits authorized.

The contracts build and normal backend dev startup rebuilt current worker and
overlay artifacts. Verified shutdown removed nine old owned identities and
released 4000/4200; repeated inspection found no survivors/orphans. The first
shutdown inspection accidentally included its own PowerShell command as an
orphan candidate, and the first startup inspection compared JSON-parsed dates
without normalizing them. Narrowing to actual Node/cmd descendants and comparing
normalized creation timestamps resolved those inspection errors; no duplicate
launch or unrelated process termination occurred. Final backend is PID 15900 /
4000, worker 8076 / 4200, supervisor 17068. Frontend 13720 / 3000 was preserved.
Health, /start and /api/sample/config return 200. No processing POST was issued
to the normal app. The previous real review export remains present and untouched.

Content-free lifecycle record and startup logs:

- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl154-app-5f29f53689e74de9aa70ba91313fbd79/backend.runtime.json
- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl154-app-5f29f53689e74de9aa70ba91313fbd79/backend.stdout.log
- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl154-app-5f29f53689e74de9aa70ba91313fbd79/backend.stderr.log

Read-only validate of settled CL-154 worktree (no implementation commit):

- TL;DR: supported visual-only openings now reach the camera compiler; planned
  pictures use projected face protection instead of a fixed box; synthetic
  preview/native/export/restore checks pass without provider calls.
- Verdict: Meets ticket. No actionable findings within the allocated changes.
- Coverage: Covered — filed plan, grounded/conflict-checked opening crop without
  fabricated audio labels, unchanged sustained later switches, bounded stable
  placement/fallback, retained/manual geometry, call/image/quality/limit guards,
  privacy/dependency direction, no new listeners/timers in pure contract logic,
  synthetic current-source parity, static checks and verified worker refresh.
- Reviewed: Codex prompt/evidence adapter and tests; focus compiler/tests; new
  visual-placement module/tests; new-picture batch integration/manual-box test;
  synthetic Codex proof; allocated authority/evidence docs. CL-152 sampling and
  CL-153 schema/readiness changes remain pending and preserved, outside this
  verdict except where their existing integration is exercised.
- Unverified: actual opening diarization/mouth association and image placement
  on real/new media, subjective visual/editorial/listening/device/rights and
  hosted/release acceptance. Occupied-frame fallback can overlap a person when
  the tested readable slots cannot be clear; it remains editable and non-fatal.
- Deviations: no product-scope deviation; sandbox cache and proof pixel-helper
  issues were corrected and recorded above. No configuration, credential, real
  sample, provider/cloud, deployment, stage/commit/push action occurred.
