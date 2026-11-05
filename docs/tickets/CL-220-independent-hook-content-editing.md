# CL-220 — Independently editable Hook and main content

Status: Complete locally, 2026-11-05. Dependencies: CL-219 complete locally; existing
manual Hook, captions/text/media/audio and camera editors implemented.

The owner requests separately visible/editable repeated Hook content: a repeated
image, authored text, captions, audio and other shared editor settings must be
independent from their main-clip occurrences. This supersedes the earlier rule
that both occurrences necessarily share all edits. The Hook remains a bounded
excerpt followed by the complete main clip; no new provider call or general
timeline is implied.

## Acceptance and implementation investigation

- Reuse the editor's existing panels with a clear Hook / Main clip editing
  context. Show the repeated items in their own context, with independent
  content/style/geometry/timing/removal where the existing editor supports them.
  No duplicated full workflow appended below the current inspector.
- New Hook content initially copies the selected main-clip content, with separate
  edits thereafter. Share immutable media assets instead of copying bytes or
  rerunning AI. Existing saves remain readable; no background inference/render,
  owner-state migration or silent overwriting of existing edits.
- Cover captions/corrections/speaker styling, authored text, pictures and motion,
  original/imported/builtin audio and applicable camera/look settings. Preserve
  source/Hook/body clock mapping, inline Capture, preview/jump, footer ownership,
  Apply/Discard and undoable local editing. Hook-range changes/removal must handle
  independent edits predictably without leaking them into the main clip.
- Persist and validate bounded independent content through normal edit, restore,
  recovery and native output paths. Reuse existing domain schemas and reject
  arbitrary source/assets/paths; keep shared boundaries and existing resource/
  per-clip/provider gates. Independent occurrences do not create extra AI work.
- Exercise meaningful generated unit/integration/browser/native cases: both
  directions of isolation, duplicate item identity, overlapping/trimmed cues,
  Hook boundaries/removal/replacement, text/caption timing, sound placement,
  camera clocks, persistence and actual exported pixels/audio. Inspect desktop
  and phones, pointer/keyboard, no overflow and persistent Apply/Discard.

Allocation after code inspection: shared occurrence/edit/overlay contracts and
pure helpers; owning frontend editor, inspectors and clock adapters; backend edit/
asset/persistence integration as required; shared composition/native Hook/audio
branches; focused existing/new tests/proofs; source of truth and focused guides,
this packet/index. Keep CL-218/219 work intact and separate in validation scope.
Document the concrete bounded data/clock design before implementation.

Use execute/validate/fix loops. Tests remain generated/synthetic/fake/paid-off,
with zero provider calls and no ignored environment reads. Existing source/edit/
export files and the healthy app must survive the necessary verified worker
reload. Real AI feature gates remain; editing copies works without API keys.
No Git mutation, real processing/inference, cloud, deployment or new dependency.

## Evidence

CL-219's scoped gate is clean. Preserve its complete working tree and CL-218 as
the pre-CL-220 baseline. The existing uncaptioned fractional-rate one-frame Hook
native proof fails `invalid_frame_count`; investigate with the Hook render branch
in this packet and retain its original frame-count assertion.

Concrete design before implementation:

- Add one bounded optional independent Hook-content snapshot to the existing
  edit document, reusing the editable content schemas and immutable asset IDs.
  Store only a bounded caption/word source snapshot and occurrence-specific
  settings, not media bytes, another clip/job, provider payload or arbitrary
  renderer inputs. Keep Hook edits on the existing clip-source clock so range
  changes, existing IDs, Capture and native mapping do not drift.
- Compile the normal main overlay plus one validated non-recursive Hook overlay.
  Legacy Hook documents without a snapshot retain their decoded behavior until
  an explicit new/edit action separates them. New Hooks copy current visible/
  audible content with independent settings. Preserve source binding and quotas.
- Reuse the current inspector with Hook / Main clip context, previewing/seeking
  the matching occurrence. Present its own repeated items and route mutations,
  uploads, Apply/Discard and persistence to the chosen content. Filter/clamp
  timing to the Hook window without remapping source offsets twice.
- Shared composition and the native Hook raster/camera/audio branch resolve the
  same scoped overlay. Main pixels, captions, media, look and original volume
  must remain independent; retain actual native cadence and frame-count checks.

## Delivered and verified

- Added one bounded Hook-content snapshot and non-recursive compiled overlay.
  New Hooks copy the repeated caption/text/picture/audio settings; immutable
  assets retain their IDs and bytes. Legacy saves stay linked when read and
  separate before the first explicit edit. Both directions of edit/removal are
  isolated. Hook / Main clip reuses the inspector, seeks the correct occurrence
  and retains one Apply/Discard workflow. Caption/visual AI actions remain on
  Main clip; a captionless Hook can copy existing main captions locally.
- Caption source/word references, speaker settings, authored text, picture
  geometry/animation/timing, original/added audio, look, focus and Hook camera
  paths persist separately. Timed copies are bounded to the selected source
  window. Opening titles and whole-occurrence audio restart independently.
  Source-frame to integer-millisecond caption conversion floors the start and
  ceils the end once; source-reference validation permits only those clocks.
- Hook-range changes preserve intersecting settings and removed-item choices,
  retain overlapping caption text, copy newly repeated content and clear the
  changed Hook's camera paths. Main state survives removal. Array bounds remain
  per occurrence; media pools, JSON-byte, provider, output and raster budgets
  remain fixed. Unknown assets/source clocks and recursive overlays are rejected.
- 55 cases pass in eight focused unit/API files: independent content and legacy
  separation, bounds/range/removal/invalid drafts/source clocks, audio projection,
  scoped camera planning, editor deltas, shared overlay and existing Hook behavior.
  Protected API integration verifies both saved drafts and rolling recovery,
  zero additional AI, zero render on restore and one explicit re-export.
- The generated real-editor browser proof passes after save/reopen: separate
  caption words, authored text, picture removal and audio gain; settled Capture
  changes only the selected endpoint on the Hook's source clock; Discard restores
  it. Hook focus changes remain separate, and Reset focus uses the immutable
  automatic baseline. Inspected 1440, 390 and 320 layouts preserve the footer
  and fit the selector.
  Actual CDP pointer and Enter activation switch contexts. No provider calls.
- Current-source native MP4 proof passes with a one-frame fractional-rate Hook:
  red Hook/blue main captions, right Hook/left main shared picture, separate
  look/focus and original audio muted only in Hook. Exported pixels and PCM are
  inspected/asserted. Original speech gains apply before the native join.
  Rounded first/last native frames hold the bounded copy's boundary state.
- The existing two-case speaker/Hook native suite passes, including default
  caption placement and strict frame counts/cut pixels/audio at 30, 30000/1001,
  24 and 12 fps. The prior uncaptioned fractional-rate failure was the art join's
  missing duration for a one-frame branch. Bounded silent segment clocks fix
  the join without weakening the original frame-count assertion.
- Contracts build, browser-safe/no-Node contracts, local/native, frontend and
  test types pass. Scoped ESLint/Prettier and diff whitespace pass. Validation
  fixes included provisional invalid Hook input handling, bounded Capture timing,
  native frame/millisecond boundaries, occurrence-local title clocks and the
  Hook Reset focus baseline. The strengthened native proof asserts different
  camera pixels as well as independent caption/media placement.
- Verified normal backend/worker reload stopped ten owned processes, released
  4000/4200 and stabilized before hidden normal startup. Health, /start and
  /api/sample/config return 200. Source fingerprint and entire saved clip list
  are identical before/after. Frontend 6260 is preserved; backend 4080, worker
  1836, supervisor 22296. Content-safe logs remain private in the existing runtime
  directory as backend-cl220.stdout.log and backend-cl220.stderr.log. A separate
  read-only in-memory check compiles the owner's current saved Hook with the new
  snapshot path; before/after metadata is identical, with zero processing calls
  and no media read/render or fixture creation.

Changed modules: contracts editor/clips/edit-overlay, Hook content and audio
projection, scoped camera plan; backend edit validation; shared overlay frames/
caption rendering; renderer clip/audio joins; frontend editor state, occurrence
clock, caption/text/picture/audio/focus controls and selector style; focused
fixtures/unit/API/browser/native proofs; frontend/backend guides and source of
truth/index. CL-218/219 changes are retained and excluded from the CL-220 verdict.

Settled read-only validation: **Meets ticket; no actionable findings.** Checked
actual UI/save/recovery/render wiring, source/asset binding, independent values,
invalid states, clocks, resource limits, dependency directions and cleanup.

No scope deviation. Personal creative/device acceptance and hosted release are
owner-only and unchecked. These editing features and all produced proofs work
with prepared synthetic media, fake AI, paid-off and no keys. Real generation
retains its approved local model/tooling or provider-key/live gates; no new real
AI, source acquisition, configuration, cloud, deployment or Git action occurred.
Changes are unstaged/uncommitted.
