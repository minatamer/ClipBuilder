# CL-106 — content-led film transitions and a text-only loop

Owner playback feedback, 2026-10-28: reject CL-102's center-opening full-scene
reveal as PowerPoint-like. Build a custom connection for each scene. Closing
and opening share the same conversation artwork: hold that stage steady and
transition only its typography. Research relevant motion design techniques.

## Authority and scope

CL-095–105 are locally implemented/validated and remain unstaged. Preserve all
pending work, approved outer geometry, 24-second walkthrough/eight-second study,
mouse-follow improvements and removed frame-progress overlay. This supersedes
CL-102's scene-transition choice only. Follow current source-of-truth landing
direction and permanent motion policy. Execute then read-only validate to no
actionable findings; owner personal visual acceptance remains open.

## Research and chosen direction — 2026-10-28

- [School of Motion: match cuts](https://schoolofmotion.com/blog/match-cuts)
  describes carrying framing, subjects and momentum across a cut to direct the
  eye. Apply this to the selected clip, rather than moving the whole canvas.
- [Google: choreography and continuity](https://m1.material.io/motion/choreography.html)
  anchors complex transitions to a shared focal element. This historical design
  guidance is a visual principle, not a current implementation API or a request
  to add stock Material transitions.
- [Ordinary Folk's product-film work](https://www.ordinaryfolk.co/work) provides
  primary studio references for product/brand storytelling. Our direction is an
  original scene-specific interpretation, not copied assets or an assertion of
  measured attention/conversion improvement.

## Transition map and file allocation

Replace the generic old/new full-canvas composition with a persistent stage of
conversation, workspace and portrait objects. No full-scene clipPath, horizontal
strips, split-image wipes or stock slide/zoom effects.

1. Conversation → intake: the conversation frame settles into the upload's
   media preview; application chrome appears around the same subject.
2. Intake → analysis: that media tile contracts into the analysis focus while
   the same workspace/window stays anchored.
3. Analysis → moments: three moment cards form out of the analysis focal point;
   retain their positions as the real synthetic candidate capture takes over.
4. Moments → build: the selected preview separates into source and portrait,
   making the wide-to-vertical transformation the transition.
5. Build → editor: the same portrait lands inside the editor preview while the
   source gives way to surrounding settings/notes.
6. Editor → result: lift that portrait out of the editor into the final view.
7. Result → close: reframe the portrait into the shared conversation surface.
8. Close → opening: identical conversation geometry/art pose and stable brand;
   only the two headline lines change with a small staggered type wave.

- New pure `film-choreography.ts` and focused tests: explicit per-boundary
  geometry/opacity, shared camera projection, deterministic frame seeking and
  media continuity. Retain `film-camera.ts`'s bounded mouse path; do not re-add
  restless focus pulls. Keep controls visible when their pointer is shown.
- `product-film.tsx`: render shared objects and scene-specific card/portrait
  handoffs from the model. Narrative type lives outside media clipping. No
  outgoing whole-page layer and no scene reveal mask. Stop replacing the review
  with an empty render/loading page immediately before the result handoff.
- `film-identity.tsx`: expose pure shared brand/headline/conversation primitives
  for the live stage and existing responsive poster. Hold the same artwork pose
  through close/open and animate only words there; preserve complete glyphs.
- `illustrated-conversation.tsx`: interpolate portrait framing on the same SVG;
  allow film panels to omit its embedded label so reframing cannot cut words.
  `product-film-poster.tsx` consumes the shared fixed opening pose.
- Frame review refinement: make the selected media opaque before it splits,
  retract the source panel before editor chrome enters, and wait until the final
  portrait clears the headline region before introducing closing type.
- Existing isolated `test/local-film.proof.ts`: seek every handoff and loop at
  phone/tall/landscape sizes; inspect actual geometry, no global masks, whole
  type, no duplicate visible headlines, exact close/open artwork continuity,
  selected-portrait handoffs, pointer clearance and the responsive poster.
  Capture start/middle/end states. Reuse actual landing proof for playback/
  loop, pause/recovery, keyboard and responsive integration.
- Narrow source-of-truth/film README and this packet/index own decisions and
  actual evidence. No screenshot recapture, new external asset, dependency,
  processing flow, configuration or native/backend contract changes.

## Checks and gates

Focused choreography/camera/page tests, frontend/test types, affected lint/format
and whitespace. Guarded fake/paid-off browser proofs with external/mutation
requests blocked; inspect representative transition triplets, not just settled
shots. Fix confirmed issues then validate the settled scope read-only. Close
test browsers/listeners in finally and preserve normal app/Studio services.

These are API-free synthetic visuals and work with FAKE_MODE=true/no keys.
Real AI needs provider keys/live flags/approvals and owner action. No provider/
cloud request, export, private media/config access, Git mutation or deployment.
Personal visual/physical-device/rights/real-AI/hosted/release acceptance remains
owner-only; research does not prove conversion or real processing quality.

## Status

Implemented and locally verified, 2026-10-28. Owner AFK follow-up delegates routine
art-direction choices; personal visual/release acceptance remains pending.

### Implementation and revisions

- Replaced the old full-scene reveal with explicit shared-object geometry on a
  persistent stage. Short capture blends are confined to the anchored workspace;
  media viewport cropping remains, without a full-scene reveal mask.
- The selected conversation is present before its opaque source/portrait split.
  The source retracts before editor chrome enters; the same portrait enters the
  editor, leaves for the result, then widens back into the conversation SVG.
- Closing type waits for the moving portrait to clear it. Close/open preserve
  identical DOM artwork, pose, rectangle and brand through the loop; a staggered
  character wave changes the headline alone.
- Frame inspection found and fixed transient image ghosting, early closing type,
  a wide-canvas media escape into the header, and cropped clip labels. Build
  media stays inside its window; caption/card details fit the visible portrait
  intersection independently of the camera's underlying image crop. Embedded
  artwork labels are omitted in film panels so reframing cannot cut their words.
  Default illustration callers retain their existing behavior.
- Test-only corrections: return a primitive after saving a DOM reference through
  CDP; observe the timeline's completed first iteration as well as its final fill
  frame. A 45ms-plus-CDP sampling loop could miss the 48ms interval above 99% in
  the existing 4.8-second repeating How it works animation. No product timing was
  changed to make that check pass.

### Actual checks and visual states

- `pnpm --filter @clipbuilder/frontend exec vitest run
  src/features/product-film/film-choreography.test.ts
  src/features/product-film/film-camera.test.ts src/app/page.test.tsx`:
  **20 passed**, final 1.39s. Geometry/cursor/details bounds cover every frame of
  both timelines at canvas heights 1080, 1440 and 1536; exact shared-object seams
  and analysis-card continuity are covered.
- Frontend `typecheck`, root `tsc --noEmit -p tsconfig.tests.json`, affected
  ESLint and Prettier checks pass. No dependency, backend/worker, contract or
  environment change; no native rebuild required.
- Guarded `test/local-film.proof.ts` + `test/local-landing.proof.ts`: both passed
  together in **133.28s**, including actual landing playback/loop, offscreen and
  hidden pause, recovery/poster, keyboard, navbar/process and responsive states.
  After the final media-crop refinement, the current-source isolated film proof
  passed again in **50.40s**; unrelated landing behaviors were not rerun.
- The final film proof uses 686×549, 304×228 and 960×540 surfaces. It checks
  settled scenes, dense boundary samples and start/middle/end captures; complete
  narrative type, contained clip details, one visible headline, no global mask
  or added frame track, cursor clearance, responsive poster and exact artwork/
  brand continuity across 719→0/6/12/24. Representative phone/tall/landscape
  frames and handoff triplets were visually inspected. Synthetic evidence stays
  ignored under `.local-build/evidence/cl106-*.png`.
- Browser proofs block external requests and processing mutations; expected
  diagnostics attempts are blocked. Browsers and the isolated listener close in
  `finally`. Normal app/Studio services remain available.

### V106-final — read-only validation

TL;DR: custom object handoffs and the text-only conversation loop are implemented;
confirmed visual/crop and test-harness issues above are resolved. No actionable
findings remain on the settled ticket-owned worktree over `b945401`.

**Verdict: Meets ticket.** Coverage: **Covered** research/direction, eight
content-specific handoffs, stable repeated artwork, smoother retained cursor
tracking, whole narrative/caption text, no added frame track/global reveal,
responsive poster/player integration, cleanup and owning documentation.
**Unverified:** owner personal visual acceptance, physical devices, rights,
real-AI quality, hosted/cloud behavior and release acceptance. Broader pending
CL-095–105 implementations are preserved and excluded from this review's verdict.

Checks: inspected the packet, allocated code/tests, nearby player/poster execution
path and documentation; used the focused/unit/type/lint/format and browser
evidence above. No full suite/build, paid flow or cloud/release check was run.
Deviations: none; the test-only sampling correction is documented above.
All work remains unstaged/uncommitted; no Git mutation or deployment.
