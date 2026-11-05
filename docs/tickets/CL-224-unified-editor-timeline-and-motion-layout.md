# CL-224 — Unified editor timeline and reliable Motion controls

Status: Complete locally, 2026-11-05. Dependencies: CL-219–223 committed and pushed
through b5463b5. Initial worktree/index clean. The owner cancels deployment and
requests execution/validation/fix loops, then AFK execution using recommended
decisions without questions. No cloud service was changed during the cancelled
read-only deployment investigation.

## Owner request and authority

Remove the confusing Hook/Main clip tab switch. Each existing editor collection
shows both occurrences together in presentation order, with visible [Hook]
labels and their actual final-video times. Selecting an item selects its own
independent settings and previews its occurrence. Never synchronize independent
copies or hide items according to the playhead. This supersedes CL-220/222's
explicit occurrence-switch interface while preserving their isolation/storage.
Follow the source of truth's independent-content, clock, timestamp-Capture,
single-inspector, footer, design and normal-motion rules.

Investigate the reported React maximum-update-depth error and fix the actual
render/effect feedback path. Camera positions must read as an ordered timeline,
including Hook positions, and remain selectable inside Motion without visiting
Camera first. Fix Motion's Add at playhead/marking layout and audit all editor
panels, subpanels and empty/selected/dirty/busy/error states at desktop and phone.
Pictures offer Add audio directly into the sound library; the chosen cue is
linked to that picture with automatically aligned timing and independent
Hook/main ownership. Reuse the existing visual-linked audio contract.

## Acceptance and allocation

- Reproduce/diagnose the update loop using generated real editor/browser state;
  add a meaningful regression that fails on the old feedback path and verify
  editing, playback, repeated selection, draft Motion and cleanup without errors.
- Flat chronological collections include all Hook/main pictures, text, caption
  groups, audio, look and camera positions. Hook rows include [Hook]; clocks
  describe presentation time, with source/occurrence conversion exactly once.
  One inspector edits the selected copy; Apply/Discard/reopen remain isolated.
- Camera timeline is available in Camera, Zoom and Motion. Select its position
  directly, then add/configure Motion. Keep correct person/position and bounded
  source clock. Preserve unfinished Motion safety and confirmation/footer rules.
- Add audio from a picture opens the existing sound library with picture context.
  Selected audio uses the existing visualId linkage, auto-aligns and follows
  picture timing changes. Removing/replacing/detaching and duplicate ownership
  retain existing contracts/bounds. No extra AI call or audio generation.
- Audit actual visible panels/subpanels at 1440, 390 and 320 pixels; inspect
  Motion idle/marking/expanded/progress/success/failure/cancel, long lists/labels,
  capture controls, keyboard/pointer operation, overflow and persistent footer.
  Fix concrete layout defects found and retain readable shared design primitives.
- Run focused fake/no-key units and current-source browser/native checks as
  required by changed surfaces, local/frontend/test types and scoped lint/format.
  Validate settled diff against this packet, fix confirmed findings and repeat
  until no actionable findings remain. Record exact evidence and honest gaps.

Initial file allocation: owning frontend clip editor and occurrence/timeline
selection, existing media/text/caption/audio/focus/Motion inspectors and clocks,
shared editor CSS, focused generated unit/browser proofs, frontend guide,
source of truth and ticket/index. Extend only for a confirmed integration defect.
Preserve saved source/base/edits/assets/exports and ignored configuration. These
UI capabilities work with prepared synthetic/existing clips without API keys or
regeneration. Real AI retains normal Codex/Gemini/runtime/live/approval gates.
No real AI, owner saved-clip patch, acquisition, cloud/deployment, configuration
or new Git mutation is authorized. AFK review does not claim owner creative,
physical-device, real-provider or release acceptance.

## Investigation and evidence

The development log confirms the reported maximum-update-depth warning, without
an originating application stack. The old ClipEditor dirty/pending/busy effects
and Motion activity effects depend on callback identity and issue reset notices
in cleanup. A consumer callback that updates parent state can therefore feed
another notification back into rendering. A frozen committed ClipEditor in the
generated browser fixture reproduces repeated notifications; the fixture stops
the old loop after sixty callbacks. Current source uses effect events and
state-driven notifications with separate unmount cleanup. It reports once and
stays at one through repeated unrelated host renders, with no new runtime error.
The original exact user gesture/hidden stack was not captured; this is a
reproduced feedback defect and a checked correction, not a guessed clip patch.

The editor now builds one chronological collection per content type across both
occurrences. Rows keep separate keys even when asset/cue IDs repeat; [Hook] labels,
recording names, image thumbnails and final-video timestamps identify the copy.
Collections stay within their owning panels; Media's Pictures/Audio navigation
precedes the matching list. No playhead filtering or global occurrence switch
remains. Selecting a row selects its own existing inspector, pauses/seeks that
copy and preserves independent storage and Apply/Discard. Long labels clamp
visually while full editable content remains available. Existing wire schemas,
composition, worker and media contracts did not change.

Timing fields use the final-video clock through one frontend display offset,
reversing it once on input. Settled Capture retains source-bound values. Hook
range selection remains on the source clock; its nullable End draft and action
gates are unchanged. Opening-title local clocks, caption preview clocks and
picture-linked audio labels follow the appropriate occurrence.

Camera positions are available inside Camera, Zoom and Motion. Selection remains
aligned after adding/removing a position and returning to Focus. Motion uses
that camera's person and partial path, including a path beginning later in the
same position; selecting another Motion interval selects/seeks its camera. The
redundant person chooser is replaced with the selected target in this unified
view. An out-of-position Add reports a bounded actionable message. Unfinished
marking disables unrelated navigation until Track/Cancel; the footer stays live.
Marking has aligned End/Capture and adaptive head-region fields. Expanded Done
now confirms the displayed region, matching the existing Enter action.

Picture Add audio opens the existing sound library with that picture's context.
Catalogue and uploaded cues use the existing visualId link and start alignment;
moving the picture moves its sound, removing it removes its linked accent, and
Edit timing detaches through the existing behavior. Hook/main sound ownership,
immutable assets, quotas and normal live-provider gates remain separate.

## Verification produced

- 57 focused fake/no-key cases pass in ten files (1.90 s): unified collections,
  duplicate IDs, future items, labels/clocks, opening titles, rendered timing
  fields, nullable Hook endpoints/controls, independent content, edit operations,
  camera positions, bulk Motion and catalogue/uploaded picture audio. A shared
  pure linking rule preserves volume/asset identity, clips to the selected window
  and keeps the original occurrence unchanged. A camera-path regression checks
  repeated-person positions, late partial paths, preferred intervals and bounds.
- Codex browser: frozen-baseline red/current-source green activity-loop fixture;
  repeated host renders retain one report and zero new errors. All browser
  inspection after the owner's preference uses the Codex in-app browser.
- Generated actual editor: 60 panel/subpanel geometry checks at 1440, 390 and
  320 pixels, plus all six final top-level panels at each width (18 final states).
  No horizontal overflow or out-of-bounds visible fields. A 495-character
  unbroken text label stays within its two-line row at 320 pixels; its full text
  remains editable and Discard restores it. Inspected Media,
  Motion marking/expanded/progress and persistent footer screenshots. Generated
  screenshots remain outside Git as cl224-unified-media.jpg and
  cl224-motion-phone.jpg.
- Real local pixel tracking on the flat generated source gives the expected
  clear-region failure and retains the draft/retry/Cancel controls. A separately
  injected synthetic tracker verifies visible progress, completion, Adjust and
  cancellation layouts; it is explicitly not real tracking-quality evidence.
  Done enables Track, and cancelling a replacement retains the existing path.
- Selecting a camera inside Motion, camera add/remove selection, Hook/main text
  isolation, picture audio, linked timing movement, Apply/reopen and Discard were
  exercised through actual controls. The save/reopen scenario produced two fake
  edit acknowledgments: different Hook/main text remained separate; one linked
  Hook cue remained absent from main audio and moved with its picture.
- Final-source later-start Capture displays source start 3.5 with blank End,
  disables Preview/Apply, then accepts exclusive end 3.833 without changing
  Start; Discard restores the prior range. On the combined clock, body input
  5.5 maps to source 3.5 exactly once. No incomplete request was submitted.
- Final-source playback crosses Hook into main while all three picture rows
  remain listed, Hook selection stays pinned and wrong-occurrence drag handles
  hide. No new browser runtime error. Normal health, /start and config return 200.
- Local/no-Node contracts, frontend/test types, scoped ESLint/Prettier and
  whitespace pass. Existing
  browser proof definitions were updated to the new selectors/clocks and shared
  generated fixture; their headless runner was not launched in this pass.
  Native render/composition/worker code is unchanged, so no native rebuild or
  claim of newly repeated native/export acceptance is made.

## Settled validation and handoff

Read-only execute/validate/fix review checked every acceptance item, actual
timeline/inspector wiring, source/display offsets, independent updates, default
and changed camera selection, callback cleanup, pending/cancel guards, picture
linkage, layout ownership, bounds, dependency direction and content/privacy.
Review corrected the additional selected-camera/path mismatch, stale source
labels, initial/changed position selection and expanded Done confirmation.
Verdict: **Meets ticket locally; no actionable findings.**

Normal local services and provider configuration were preserved. No owner saved
clip edit, AI/provider call, source acquisition, cloud service change, deployment
or Git mutation. Generated fixture servers, browsers and scratch are cleaned;
the earlier abandoned fixture was removed only after matching its synthetic
source hash and exact owned contents. Final inventory confirms zero fixture
processes/listeners/scratch directories; normal health/start/config remain 200. These editor changes need no regeneration
or API keys on prepared media. Real AI/head quality, physical devices, owner
creative acceptance and hosted/release acceptance remain unchecked. No scope
deviation; added fixes are confirmed editor integration/layout defects. Changes
remain unstaged/uncommitted.


## Later local commit authorization — 2026-11-05

The owner requests whole-file staging and local commits, with personal review
pending for 2026-11-06. [The file-level allocation](../operations/CL224_COMMIT_PLAN.md)
assigns all 34 files to three CL-224 commits. This supersedes earlier no-Git and
unstaged/uncommitted implementation notes for this local packaging task only.
No push is requested. Existing verification and owner-only acceptance gaps stay
as recorded; packaging does not restart the app, process media or deploy.
