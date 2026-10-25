# CL-068 — Automatic portrait framing and manual person focus

Status: implemented; synthetic local verification and final review recorded
below. Owner real-AI/visual acceptance remains manual. No Git mutation, paid
tests, cloud changes or deployment.
Dependencies: CL-027/050/053/054/060/061 implemented; CL-067 pending changes are
preserved and excluded from this feature's completion claim.

## Owner request and observed defect — 2026-10-25

Landscape conversation clips currently sit inside a portrait canvas with large
black margins. Inspection confirms the normal local worker's `ownerPortrait`
uses contain + pad, and local `Review` displays that padded source without the
older hosted speaker-focus compiler. This is an integration omission, not
evidence that a particular Gemini response failed.

Fix automatic framing as well as provide clean manual corrections. Start on a
visible person; hold that crop during pauses/uncertainty, switching by hard cut
only after another person is supported. Never widen merely because speech is
ambiguous. Show every returned visible anonymous person and their presence spans;
allow adding a missed person and editing when/where/zoom the camera focuses.
Preview, Apply, saved drafts and native MP4 export must use the same frame clocks.

## Authority and scope

Follow source of truth: current shared editor/release scope; permanent nonfatal
Gemini quality critiques (CL-060); hard cuts and held same-shot framing; shared
editor settings, single footer Apply/Discard, completed-clip gate, no reduced
motion suppression. The owner authorizes this additional shared editor setting
and bounded camera timeline. This is not an arbitrary media timeline, biometric
identification service, local AI-model installation or new provider stage.

`FAKE_MODE=true` and no API keys support deterministic fictional people/tracks,
manual framing, persistence and real native exports of generated test media.
Actual person/speaker observations require existing Gemini keys/live approvals
and owner-manual processing; fake tests do not certify detection quality. No new
AI call, automatic retry, model/settings change or transcription change.

## Research and implementation decisions

- [Gemini video understanding](https://ai.google.dev/gemini-api/docs/video-understanding)
  supports time-addressed video analysis; sampling can miss fast motion. Keep the
  existing bounded selected-clip proxy, request and 5 fps sampling. Extend that
  one visual-planning response with anonymous person observations and focus
  evidence. Do not add a detector call or promise exhaustive detection.
- [Gemini object detection](https://ai.google.dev/gemini-api/docs/image-understanding#object-detection)
  documents bounding boxes. Our explicit output uses normalized upright-display
  x/y/width/height and clip-relative integer frames, not names or inferred traits.
  Returned geometry is data, never executable expressions or paths.
- [Remotion Player](https://www.remotion.dev/docs/player/player) provides seek and
  playback events. Reuse the existing player and control tabs; track playback
  with cleaned-up listeners, seek timeline selections, pause before gestures.
- [FFmpeg filters](https://ffmpeg.org/ffmpeg-filters.html) documents crop, scale
  and time-addressed filter commands. Compile only bounded validated numbers
  into the fixed native graph; verify actual installed binaries with generated
  two-person media, including exact switch boundaries and no margins. If dynamic
  crop dimensions prove incompatible, use bounded hard-cut segments; never
  accept arbitrary filter strings from browser/provider input.
- Reuse the current bounded portrait source cut and its known contained source
  rectangle so existing cut caching, audio normalization, resource admission,
  protected playback and cancellation stay intact. Compute an even-pixel 9:16
  crop inside source content, then scale to 1080x1920. Browser and native export
  share this pure geometry. This does not invent detail lost in the existing
  proxy cut, remove bars already burned into the source, or alter originals.

## Data and automatic policy

1. Add a browser-safe shared focus contract: bounded anonymous IDs, upright
   source dimensions, people with bounded presence/box observations, and an
   ordered complete camera track on [0, clip.frames). Half-open intervals;
   exact end belongs to next shot. Maximum eight people and sixty camera shots;
   zoom 1–3 relative to portrait fill; finite normalized center coordinates.
2. Retain decoded AI observations separately from the compiled camera track in
   preparation/base so corrections build on actual accepted output. Old saved
   documents without focus remain readable and keep their accepted appearance;
   opening Focus can initialize an editable fill track using workspace geometry.
3. At each real shot boundary choose the first available visible person (stable
   order), otherwise a deterministic provisional side crop. Never claim that
   provisional geometry identifies a speaker. Within a shot hold the previous
   crop during gaps, overlap or uncertainty. Another visible speaker with high
   confidence and at least one second of supported speech may switch it. Reset
   across real shot cuts; never carry a person's crop blindly across shots.
4. Decode person/camera items independently. Clamp/sort physical render clocks,
   merge stable runs, bound complexity, discard only undecodable/unsafe geometry;
   log critiques and keep usable pictures/framing/captions. Missing framing in
   old or partial responses uses local fallback without another paid request.
5. Existing source/revision/base-hash/edit-operation validation remains. Manual
   camera requests must have exact contiguous coverage, valid person references
   and positive bounded intervals. Invalid drafts stay visible but cannot Apply.
   Render jobs snapshot a compiled revision; edits cannot alter an in-flight MP4.

## UX

- Add **Focus** alongside Captions / Filters / Pictures in the existing settings
  panel, maintaining keyboard navigation and responsive wrapping. No second
  editor underneath; one selected clip and its existing persistent footer.
- Show an uncluttered source view with anonymous person boxes and the active
  portrait crop. Selecting a person seeks to a presence span; clicking/dragging
  in the source view corrects center. Use percent X/Y and zoom controls as
  keyboard alternatives. A missed person can be added at the current position.
- Show compact presence lanes (observed appearances) and camera timeline blocks
  with time labels. Clearly distinguish presence from the camera's held focus:
  uncertain association does not manufacture a presence observation.
- Select a camera block to seek/edit its person, start/end, center and zoom.
  Split at playhead inserts a camera change without gaps; removing a block
  extends its neighbour. Boundary edits update adjacent intervals atomically.
  Disable impossible split/remove states and enforce the shot limit.
- Changes preview immediately, mark the existing clip dirty and use footer
  Apply / Discard. Reset focus restores the automatic plan without provider
  calls. No submit/proceed buttons within scrolling settings.
- Inspect desktop, 390px and 320px phone layouts, touch targets, visible footer,
  keyboard use, empty/missing observations, invalid input, pending/error states.

## Diagnostics and privacy

Add allowlisted focus-plan/compile/edit/export operations and aggregate numeric
summaries: returned/usable people and observations, automatic switches/held runs,
fallback use, manual shot count. No media, transcript, prompt, boxes, identities,
raw provider output, tokens/capabilities or paths in ordinary logs. Retain the
normalized plan through protected clip state and existing private draft storage
for owner inspection/correction; do not create public debug routes or a new raw
capture bypass. Keep original AI plan when manual overrides are applied/reset.

## File-level implementation order

1. `packages/contracts/local/focus.ts` (new): schemas, fill/crop geometry,
   automatic compiler and timeline operations; focused synthetic unit tests.
   Extend editor/clips/edit-overlay contracts and browser editor state.
2. Backend provider adapter: combined visual/focus prompt + tolerant decoding;
   preparation checkpoints/resume; fake deterministic people; safe diagnostics;
   edit operation and immutable render compilation. Keep old plan-array ports
   compatible where necessary, preserving completed paid work.
3. Frontend `focus-editor.tsx` (new) + existing clip editor/styles: Focus tab,
   source-view positioning, observed lanes, editable camera timeline; preview
   source transform from the shared pixel crop. Preserve CL-067 changes.
4. Renderer numeric crop compiler + fixed clip graph; cancellation/temp cleanup
   and cache binding preserved. Rebuild the current internal worker and reload
   verified owned backend when final code is ready, preserving frontend.
5. Focused synthetic browser/native proofs, contracts/provider/edit/persistence
   regressions, required types/lint/format/boundary checks, read-only validate.
   Update narrow service guides, this evidence and the index; no commits.

## Acceptance and verification

- [x] Automatic new landscape clips fill portrait at opening; uncertainty holds
      the last same-shot crop and a supported speaker change cuts correctly.
- [x] Anonymous observed people/presence spans and camera decisions survive
      provider decoding, cancellation checkpoints and saved-draft restore.
- [x] Missing/partial/bad focus never discards usable paid picture/transcript
      results; exact fake provider call counts prove no extra calls/retries.
- [x] Add person, select/seek, split/remove/boundary change, zoom/position,
      Apply/Discard/reset, stale edits and immutable export revisions work.
- [x] Preview and decoded native output match before/at/after camera cuts;
      zoom/position eliminate introduced padding at landscape/portrait edges.
- [x] Existing old drafts and hosted upload-only controls remain compatible.
- [x] Real pointer and keyboard proof at desktop/390/320; no horizontal overflow
      or hidden proceed footer. No app-level reduced-motion suppression.
- [x] Logs explain fallback/hold/switch/manual/export without leaking content.
- [x] Temporary artifacts/listeners/processes cleaned; rebuilt normal worker and
      frontend/backend readiness verified; owner files/config remain unchanged.
- [x] Focused tests, types, lint, format and read-only validate pass.
- [ ] Owner real Gemini quality, actual missed-person correction and visual
      acceptance remain explicitly manual; no provider spend/deploy/push.

## Execution record

Plan and source-of-truth revision preceded the full verified local restart.
Old owned trees/listeners were released before replacements. The first frontend
compile exceeded the initial short GET deadline; a longer readiness check
verified the same replacement instance and its ownership was recorded. Normal
owner configuration reports `synthetic-ai`; no ignored env file was inspected.

Implementation follows the file-level plan. `focus.ts` owns bounded contracts,
automatic evidence/hold compilation, source-content geometry and camera edits.
The provider adds anonymous observations to its existing video request; old
picture-only replies remain usable. Preparation retains focus synchronously
alongside the paid plan, including cancel/restore/retry without re-planning.
Optional focus fields preserve old base hashes and saved formats.

Focus uses Camera/People sub-tabs, the actual Workspace/WorkflowFrame shell and
shared controls. Camera edits preview immediately with precise time input,
split/remove and adjacent-boundary updates; People supports added/missed people
and appearance intervals. Drag and arrow keys position the crop; numeric fields
are keyboard alternatives. Apply/Discard/reset and the ready-state gate remain
shared. The four main tabs wrap into two columns on narrow phones after visual
inspection found overlapping labels. No motion suppression was introduced.

Native export uses numeric `sendcmd` crop changes plus scale in the existing
fixed FFmpeg graph. The original source, normalized cached cut, audio clock and
previous outputs are preserved. The browser uses the identical integer crop;
render requests retain their existing immutable snapshot. No FFmpeg binary or
dependency was changed.

Verification evidence:

- Synthetic unit regressions cover opening-speaker choice, late arrivals,
  uncertainty/pauses/cross-talk, missing/malformed observations, source-edge
  clamps, supported speech clocks, real shot resets, limits and half-open cuts.
  Review found and corrected early/out-of-order confirmations and a target
  leaving before confirmation. Disconnected evidence cannot force a switch.
- Provider-shaped doubles prove one video request, independent picture/focus
  decoding, retained observations and clone isolation. Actual AI was not called.
- Batch tests prove stale/source guards, cancel/checkpoint restore/retry with
  detected people and no second plan call, reset, persistence and immutable
  export revisions. Legacy editor contracts remain compatible.
- `test/local-focus-editor.proof.ts` uses the actual current-source shell and
  ClipEditor at 1440x900, 390x844 and 320x568. Real CDP pointer placement and
  keyboard edits are asserted; playback/seek clocks, split/remove, boundary
  changes, added people/appearances, invalid/pending edits, Apply/Discard/reset,
  failed-save explicit retry and restored state pass. CSS-derived preview crops
  match native shared geometry. Footer stays visible; no horizontal overflow.
- `test/local-focus-native.proof.ts` compiles the current overlay into owned
  scratch, exports generated media through the actual worker function, and
  decodes frames before/at/after non-whole-second cuts (frames 29 and 44), with
  changing zoom and source-edge colour checks. Cached source/original bytes and
  canceled/temp cleanup are verified. Non-whole-second boundaries passed without
  a speculative timing workaround.
- Existing `test/owner-hosted-editor.proof.ts` passes the shared hosted-shaped
  upload/editor/caption/picture/filter/native export flow with fake AI.
- Aggregate log tests verify fixed safe fields and reject content-bearing
  extras. `base.overlay.focus`, `edit.focus` and `preparation.focus` retain the
  normalized data under existing protected state/private-draft storage.
- Synthetic desktop/phone Camera and People captures are ignored under
  `.local-build/evidence/cl068-*`; inspected directly. No owner-media screenshot
  or real provider payload was created. Proof listeners, browsers and scratch
  are closed/removed; existing owner sources/drafts/exports/logs are preserved.

Final checks on settled code:

- `vitest run --config scripts/local-test.config.ts --maxWorkers=2`: **545 tests,
  53 files pass**. All synthetic/fake/paid-off/network-blocked.
- The new editor/native proofs and existing hosted-editor proof pass; native
  proof was additionally rerun at non-whole-second boundaries. Preview crop
  geometry and actual pointer placement are asserted in the final editor proof.
- Canonical `corepack pnpm typecheck` passes with the documented Corepack shim
  path (pnpm 11.19.0). Final local/root-proof TypeScript checks also pass after
  review fixes. No tool/dependency installation or configuration change.
- Repository ESLint passes (existing workspace React/Next detection warnings);
  final changed-file lint, whole-repository Prettier and `git diff --check` pass.
- `test/boundaries.test.ts`: **27 checks pass**, including browser-safe local
  contracts and application dependency boundaries.
- `scripts/local-media-build.mjs` rebuilt the settled worker/overlay. Verified
  backend-only shutdown/reload preserves the frontend, prior logs and owner
  files. New owned listeners on 4000/4200, existing owned frontend on 3000, health,
  `/start` and `/api/sample/config` return 200; safe runtime capability remains
  `synthetic-ai`. Content-free ownership/log records stay outside Git in the
  owned OS-temp runtime folder.

Read-only validation: **Meets the ticket's local fake-mode requirements; no
actionable findings remain.** Coverage includes automatic fill/holds, supported
switches, data retention, manual controls/persistence, preview/native parity,
responsive/keyboard use, privacy/resource bounds and cleanup. Earlier CL-067
intake work is excluded from this verdict and remains intact. Review-found
confirmation ordering/visibility/overlap cases and narrow-phone labels were
fixed and rechecked. Real Gemini accuracy, owner visual acceptance and Linux/
container release verification remain explicitly unverified. No additional
service, local AI weights, model setting, automatic provider retry, cloud change
or deployment was introduced. All changes remain unstaged/uncommitted.

Deviations: the native integration proof lives under `test/` so it shares the
existing current-source overlay fixture without widening the local source-only
TypeScript project. Precise playhead input supplements the existing player
seekbar. No product-scope deviation. Linux/container export and real Gemini
accuracy/owner visual acceptance remain unchecked before any eventual release.

## Owner follow-up — explicit person removal, 2026-10-25

The owner requests a Remove CTA beside each person because the shared appearance
removal could act on a different inspector selection than the person chosen in
the preview. This is a focused CL-068 correction: preserve other pending work.
The separate first-frame investigation is canceled by the owner; no playback or
source-media change belongs to this follow-up.

Plan: bind each inline Remove to its row's stable anonymous ID; preserve framing
as a custom crop when its person is removed; keep the People inspector selection
in sync with preview/Camera person choices. A last appearance cannot implicitly
delete a person. Keep Apply/Discard/reset and existing source/export behavior.
Verify Person 3 versus Person 2 deletion, multiple appearances, keyboard and
desktop/phone fit with the existing synthetic browser proof, then focused
types/lint/format and read-only validation. No provider calls or backend changes.

Completed: each People row now has its own shared Remove button, bound directly
to that person's ID. Preview/Camera person choices also select the matching
People inspector. Removing a person preserves their shot positions, zoom and
timing as custom framing; other people remain unchanged. Remove appearance
only deletes an interval and is disabled for the final appearance. Apply,
Discard and reset retain their existing behavior.

Follow-up evidence:

- The current-source synthetic editor proof passes at 1440x900, 390x844 and
  320x568. It removes Person 2 while Person 3 is selected, discards/restores,
  verifies source-box selection synchronization, removes one of Person 3's
  appearances, then removes Person 3 explicitly. Persisted assertions preserve
  Person 2, the automatic plan and the removed person's custom crop/zoom.
- Final-appearance protection, Apply/Discard/reset, pending controls, save
  retry and reopening still pass. Row Remove targets are at least 44x44,
  remain reachable above the persistent footer, and introduce no horizontal
  overflow. Desktop and both phone People captures were inspected directly.
- `vitest run --config scripts/local-proof.config.ts
  test/local-focus-editor.proof.ts`: **1 test passes**. Exact synthetic provider
  counts remain plan/image/render = 0/0/0. The pointer proof now waits for the
  actual position update between CDP move/release events instead of racing it.
- Frontend and proof TypeScript, focused ESLint/Prettier and `git diff --check`
  pass. Read-only validation: **Meets ticket; no actionable findings** for this
  follow-up. Existing CL-067 work is excluded and preserved.

No source change was made for the canceled opening-frame task. This correction
is frontend-only; no worker rebuild, backend restart, provider call, saved-media
change or Git mutation was needed. Fake mode works without API keys; real AI
detection quality still requires the owner's approved live review and is not
proved by these simulated people. Changes remain unstaged/uncommitted.
