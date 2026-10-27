# CL-092 — solid text blocks and sliding caption highlights

Owner request (2026-10-26): add a text background like the screenshot's top
title: one continuous rounded rectangle behind all lines, rather than separate
line/word highlights. Add a caption animation similar to Word pop whose colored
background slides sideways between words. The supplied TikTok URL could not
load through the link reader; implementation follows the supplied screenshot
and explicit motion description, not a claim to have watched the video.

Depends on locally validated CL-086/087 typography/Text and current CL-091 UI.
CL-091's nine pending files are related previous work and stay intact and
unstaged. No source merge, staging/commit, provider/cloud/paid action, ignored
configuration read, deployment or real owner-media test is authorized here.

## Product and compatibility

Add an explicit **Solid block** preset, white background/black text by default,
using the shared color/opacity/font/outline/alignment controls. One panel wraps
the complete multiline content and respects its existing positioned safe box;
it should hug the text rather than fill unrelated empty canvas space. Keep
existing Solid background, translucent and saved legacy appearances unchanged.
Expose the new treatment to both independent Text and captions through the
same typography contract, not a second style system. TikTok remains default.

Add explicit **Sliding highlight** caption animation. Keep words readable and
move one colored rectangle between the active word bounds, interpolating its
horizontal position/width from the preceding word on the same line. Use the
existing logical clock/onset policy; reset at line changes/long gaps, hide in
silence/outside cue bounds, and handle first/short/overlapping cues deterministically.
Do not change caption IDs/text/timestamps, introduce quality rejection, or add
CSS/wall-clock transitions, animation suppression or AI work. Existing modes,
including Word pop and Static, retain their behavior.

Preview and native export must use the same fixed React tree. Sliding targets
must use actual local DOM word metrics in logical coordinates so scaled player
and high-density native rasterization agree; no remote font or new runtime
dependency. Read layout only when its inputs change, clean up refs/effects, and
ensure identical raster keys imply identical painted state throughout motion.

## File allocation

- `packages/contracts/local/text-style.ts`, `editor.ts`: one bounded preset and
  animation option with shared defaults/labels; no incompatible required field.
- `packages/composition/local/text-paint.ts`, `text-layer.tsx`,
  `styled-caption.tsx`: continuous panel geometry and selected animation branch,
  preserving old markup/paint where applicable.
- New focused `sliding-highlight.ts` and `sliding-caption-line.tsx` under that
  composition directory: pure deterministic motion state plus bounded browser
  measurement/rendering. Reuse existing onset/bounds rather than a general engine.
- `apps/frontend/src/features/local-editing/clip-editor.tsx`: animation label;
  shared style options/preset application should reuse existing maps. Adjust
  owning editor preset selection only if its current generic path needs it.
- Meaningful focused geometry/compatibility cases in composition/frontend local
  tests; extend existing Text browser/native proof with the new selection,
  persistence and actual pixel/motion coverage. No static implementation mirrors.
- This packet, narrow source-of-truth decision and ticket index. CL-091's prior
  docs/source changes remain separately identifiable; no unrelated cleanup.

## Execute/validate checks

Check focused schema/preset compatibility and pure motion timing: beginning,
midpoint, end, silence, line reset, short/overlapping cues and repeated raster
keys. Check panel color/opacity and fit for unequal lines/alignment, long text,
minimum boxes and existing styles. Exercise selecting styles/animation in the
actual synthetic editor, Apply/Discard/save/reopen and laptop/phone scrolling.

Use current-source synthetic native video: verify opaque/alpha solid panel
pixels outside a short line's highlight area, plus moving highlight bounds at
word onset/midpoint/settled frames and no silent-gap rectangle. Inspect PNGs.
Keep exact logical boundaries and source-quality export. Close all owned
browser/server/native work and remove only owned generated scratch.

Run focused checks during changes, then settled local unit suite, appropriate
contracts/composition/frontend/test types and affected lint/format. All tests
install hardcoded fake/no-key/paid-off/live-false and env-file/external-network
guards before imports. Preserve private diagnostics, resource ceilings,
cancellation, retry/preparation reuse and every permanent owner decision.
Perform read-only validate, independently confirm/fix findings and repeat to no
actionable local issue. Do not claim live AI or personal visual acceptance.

After contracts/composition changes, build contracts and restart only the normal
backend/internal worker using verified ownership and normal configuration;
preserve the healthy frontend, files and configuration. Verify current readiness
and fake/cloud-off capabilities with non-metered GETs. Fake UI/synthetic caption
and native processing need no API keys. Real caption generation/planning/images
still need actual keys/live approvals and owner testing, which agents do not run.

## Implementation and verification — 2026-10-26

Implemented locally. Shared contracts/maps expose `solid-block` / Solid block
and `slide` / Sliding highlight without adding a required saved-document field.
Text/captions paint one rounded panel around their full multiline content;
existing per-line backgrounds remain unchanged. Panel fit accounts for padding
once over the complete block. Color, opacity, alignment, font, outline, timing,
position/resize and Apply/Discard remain the existing shared controls.

The new caption line measures logical `offset*` bounds only when word/font layout
changes, grouping adjacent tokens belonging to the same cue. Its owned rectangle
is updated in a layout effect from the media clock; refs avoid a second React
render on measurement. One 80 ms bounded smooth interpolation moves/resizes the
highlight, resets between lines/after gaps over 150 ms, and hides in silence.
Short cues shorten the transition; latest-start active cues handle overlap and
unordered timing without rejecting data. The existing onset raster key is
sufficient, confirmed by repeated-key and actual exported-motion checks.

Review correction: metric cache identity uses the effective painted font/weight,
including legacy preset defaults, rather than only optional stored font fields.
The initial browser proof also needed awaited tab navigation; that harness error
was corrected before the final successful run. No user-facing workaround or
extra control was introduced.

Actual checks:

- Focused caption/typography/motion cases: 34 passed, repeated after the final
  effective-font correction. Tests include cue onset/midpoint/end, silent gaps,
  line reset, short/overlapping/unordered cues, raster reuse and shared defaults.
- Settled local suite: 64 files / 609 cases passed. The final font-cache
  correction subsequently passed the affected 34 cases and all three proofs.
- Full repository `pnpm typecheck` passed: contracts/composition builds,
  frontend/backend/renderer, test and local types. Local/test types were repeated
  after the effect implementation; local types passed after the final correction.
- Affected ESLint and Prettier checks passed; final caption correction was
  checked again. `git diff --check` passed.
- `test/local-text.proof.ts`: all three cases passed after the final correction.
  Actual synthetic editor selects/saves/reopens Solid block for Text and captions
  plus Sliding highlight, preserves word IDs/timing and verifies invalid input,
  discard, pointer/keyboard/touch movement, stale-save protection and controls.
  Responsive checks at 1440×1000, 1366×682, 1280×600, 390×844 and 320×844 retain
  visible footer, accessible target sizes, no horizontal overflow and reachable
  lower inspector fields. Laptop/phone screenshots inspected.
- Current-source Windows native MP4 proofs retain 540×960 / 30 fps / 90 frames,
  legacy TikTok/solid/alpha appearances and exact Text frame boundaries. The new
  unequal-line panel has white pixels beside the short second line and correct
  50% opacity over blue. At frames 14/15/16/18, measured magenta bounds prove
  onset continuity, an intermediate sideways position and a settled new word;
  frame 60 has no highlight. Actual PNGs inspected under ignored
  `.local-build/evidence/cl092-native-{14,15,16,18,60}.png`. Synthetic browser
  and native scratch/server/browser/process cleanup completed.

All tests use the existing hardcoded fake/paid-off guards before imports, with
no ignored env reads, keys, provider requests or external-network composition.
The Windows sandbox could not read Vite transform files; the same guarded tests
passed outside it. Pinned package-manager typechecks used its existing cache
with Corepack downloads disabled. No dependency/runtime upgrade was needed.

Read-only validate covered the CL-092 tracked diff and three new composition
files, integration through shared maps, compatibility, clock/raster identity,
logical scaled geometry, dependency direction, bounded work and cleanup. CL-091
removal remains separately identified. Final verdict: meets the locally
testable ticket; no actionable findings after the font-cache correction.
Personal visual acceptance, actual AI quality and hosted acceptance remain
owner-only and unclaimed. Editing these styles and synthetic native processing
work with fake/no-key/paid-off; actual Gemini planning/captions/images still
require configured keys/live approvals and an owner action.

Normal worker refresh/readiness evidence follows below. No functionality/scope
deviation. Nothing staged or committed; CL-091 and CL-092 remain reviewable
working-tree changes. No configuration/media/cloud/deployment change.

Worker refresh: built contracts through the normal typecheck prerequisite,
captured ten owned backend identities, stopped the supervisor/descendants and
verified ports 4000/4200 released across two stabilization checks. Restarted
with normal `pnpm dev:backend`, which rebuilds the current overlay/worker;
repeated once after the final font-cache correction. The frontend was preserved.
Final backend PID 19832 (4000), internal worker 27584 (4200), supervisor 23684;
existing frontend PID 18408 remains on 3000. GET health, /start, sample config
and local capabilities all return 200; public capability fields report
`synthetic-ai`, cloud false and all three live features false. No processing
request or ignored configuration inspection was used for readiness.

App: `http://localhost:3000/start`. Content-free ownership record:
`C:\Users\minat\AppData\Local\Temp\clipbuilder-run-20261026\runtime.json`.
Backend logs are
`C:\Users\minat\AppData\Local\Temp\clipbuilder-run-20261026\backend-20261026-190029.stdout.log`
and
`C:\Users\minat\AppData\Local\Temp\clipbuilder-run-20261026\backend-20261026-190029.stderr.log`.

## Subsequent local commit approval — 2026-10-27

The owner approved a file-level plan and local staging/commit of the pending
CL-091–094 follow-ups. [Whole-file allocation](../operations/CL091_094_COMMIT_PLAN.md)
owns the 36-file combined commit. Prior unstaged/no-commit notes above describe
the original implementation handoff and are superseded only for this approved
local Git action. Verification and all remaining owner-only gates are unchanged;
no push, deployment, provider/cloud or configuration action is authorized.
