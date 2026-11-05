# CL-222 — Stable complete editor item lists

Status: Complete locally, 2026-11-05. Dependency: CL-221 local gate complete.

The owner rejects editor items appearing/disappearing when playback approaches
their timestamps, including Hook copies of media, text, captions and audio.
All items in the explicitly chosen editing context remain listed independent
of playhead time; choosing an item previews/seeks its timestamp and edits that
occurrence. Playback cannot silently choose another editing context or hide the
lists. Audit every existing timed-item picker from CL-220, preserving independent
Hook/Main edits, source/presentation/Capture clocks, Apply/Discard and one active
inspector. Rendered visibility still obeys cue timing.

Use execute/validate/fix loops with generated fake/paid-off/no-key checks and
actual desktop/phone pointer/keyboard/seek playback states. Preserve saved media
and edits, including owner work. No real inference, saved clip patch, environment,
cloud, deployment or Git action. Allocate editor state/clock/pickers and focused
browser/unit proofs as inspection requires; record actual evidence and remaining
owner acceptance separately. CL-221 gate is complete. Investigation confirms the pickers already enumerate
the selected context; a playback frameupdate listener silently switches context
at the Hook/body boundary, replacing those lists. Pin the explicit editing
context; guard overlay drag/select handles and Capture when playback is in the
other occurrence. Item selection seeks its own occurrence. Audit all picker data
and add visible timing ranges where needed. Verify complete lists before/during/
after playback and arbitrary seeks, plus independent save/restore and phone UI.


## Implementation and inspection

- Removed playback-driven occurrence selection. Hook/Main clip changes only via
  explicit owner action (including adding/removing a Hook); every picker retains
  the chosen occurrence while the preview plays/seeks through other timestamps.
- Picture picker maps all draft.visuals; text maps all layers; caption editor maps
  all groups/words; audio maps all resolved cue timings. None filters on active
  playback time. Focus/Zoom/Motion lists likewise enumerate the scoped data.
  The existing Timing panels show selected item clocks; no new workflow required.
- Selecting picture/text/caption already seeks its occurrence; audio cue selection
  now does too. Shared preview art continues to use cue timing. Interaction
  handles and Capture disable when the preview is in the other occurrence, so
  pinned inspectors cannot accidentally drag/capture the visible other copy.
  Occurrence changes abort pending captures and refresh media readiness listeners.
- Extended the real-editor proof with future-only picture/text/audio cues,
  complete caption lists at both ends, Hook/body playback crossing, picker
  selection/seek, wrong-occurrence drag/Capture protection and no dirty state.
  Existing independent edits, Apply/Discard, save/reopen, focus Reset and actual
  pointer/Enter switching remain in the proof. Desktop/phone checks pass at 1440, 390 and 320 pixels; inspected complete
  picture-list screenshots show future media alongside the current item.
- Adding a timed sound while another occurrence is showing clamps its default
  source interval to the explicitly chosen Hook window and seeks that copy.
  Added/ discarded sound regression protects this boundary at every viewport.
- The older audio integration proof now explicitly checks independent Hook audio
  and copied main visual accents instead of assuming one shared track list.
  Its audition, upload/cancel/retry, fake YouTube import, gain, Hook-only silence,
  loop seek phase, saved reload and real native export checks pass. It uses the
  accepted Hook-local clock and asserts all fake/provider/job call counts.
- Final gate: 99 unit/API cases across the two packets (six files, 11.20 s),
  two real-browser Hook/audio proofs (84.56 s), frontend and test types, scoped
  ESLint/Prettier and whitespace. CL-221's separate generated fresh native and
  actual-browser camera proofs also pass. All inference/provider ports are fake
  or unused and real processing never targets the owner's saved clip.

Settled read-only validation checked every picker data source, explicit context
transitions, preview-vs-inspector safety, Capture abort/readiness, source/presentation
mapping, independent state/save/reopen, audio placement, resource bounds and
listener/browser/request cleanup. **Meets ticket; no actionable findings.**
CL-218/219/220 work is preserved and excluded from this verdict.

Production allocation: frontend clip-editor, use-editor-preview and audio-inspector;
extended generated Hook editor proof and owning docs. No schema, media, inference,
saved-state migration or native renderer change. Existing clips need no generation
for this editor fix; CL-221 still requires owner fresh generation for real Motion
acceptance. Source, edits and exports remain untouched.


No scope deviation. Personal device/creative and hosted-release acceptance remain
owner-only. This editor change works immediately on prepared synthetic/existing
clips without keys, generation or saved-state migration. The normal app retains
its owner provider configuration. No saved clip patch, real inference, external
acquisition, cloud/deployment or Git mutation. Changes are unstaged/uncommitted.
