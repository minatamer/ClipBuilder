# CL-076 — Choose the person before inserting a camera position

Status: implemented and locally validated; owner personal visual acceptance is
manual. Owner correction: 2026-10-25.

Add position opens a compact person selector before changing the draft. Default
to the highlighted camera row's person, permit any existing person or custom
framing, and require Add or Cancel. Confirm inserts directly below the highlighted
row, not after that person's last use. Keep per-person chronological numbering,
independent settings/timestamps and complete contiguous camera coverage.

The new row uses the later part of the selected row (settled preview time inside
it, otherwise midpoint). Same-person insertion copies that row's camera. A
different person starts from their known framing within this source shot, or
their existing observation-based framing; no new detection/provider request.
Other rows, people and original observations remain unchanged. Opening, choosing
and canceling alone must not dirty the edit. Changing the selected row cancels
the pending insertion; stale drafts cannot receive an old pending insertion.

Files: frontend focus helper/editor, focused unit/browser/native proofs and
owning source-of-truth/workflow/frontend guide/ticket/index evidence. Use shared
controls/tokens and existing panel space. Keep CL-071 playback and the workspace
Apply/Discard footer. No contract, backend, worker, provider, environment or Git
change; preserve all existing pending work/media.

Acceptance: selector default/alternate/cancel, selected-row insertion/numbering,
same/other/custom person framing, invalid IDs/ranges/count bounds, save/Discard/
reopen, desktop/390/320 keyboard/pointer/visible footer and actual synthetic MP4
parity. Run focused checks and read-only validate/fix; owner visual acceptance
remains manual. Fake/no-key/paid-off checks only; real AI still requires owner
keys/live flags/approvals and is unnecessary here. No local model is added.

## Execution and evidence — 2026-10-25

`focus-editor.tsx` replaces the selected position's settings slot with a compact
Person selector and Add/Cancel controls. Opening pauses/captures the preview,
defaults to the highlighted row's person and focuses the selector. No edit is
created before Add. Cancel returns focus to the trigger; confirming focuses the
new selected row and opens Timing. Changing row/person/tab or resetting cancels
pending insertion. A memoized content signature binds the pending selection to
the current focus data, allowing equivalent legacy/default focus values across
parent refreshes while dropping a changed draft's stale insertion.

`focus-positions.ts` now accepts an explicit selected-row index and confirmed
person. It inserts at index + 1, retaining contiguous timing. The new person's
camera comes from a known position in the source shot at the insertion time,
otherwise existing observations; it never copies another source shot's saved
manual framing. Same-person/custom insertion retains the anchor crop. No schema
or backend/worker change. Narrow CSS uses shared tokens and Button controls.

Checks actually run:

- **15 unit tests in 2 files pass**, including explicit anchor/other-person
  framing, unchanged surrounding rows/observations, source-cut fencing at the
  insertion time, custom/unused people, invalid IDs/index/ranges, count limits,
  chronological renumbering and existing editor-state compatibility.
- Current-source `test/local-focus-editor.proof.ts` **passes in 44.07 seconds**
  at 1440x900, 390x844 and 320x568. It verifies default Person 1 and Person 2,
  selector focus, alternate-person choice without dirtying, Cancel/focus return,
  pending-row selection cancellation, insertion immediately below selected row,
  numbering and deletion; then existing pointer/touch/keyboard, saved edits,
  exact Capture, Apply/Discard/reset, failure/retry and reopen checks. Opening
  the chooser does not add an acknowledged edit; the original 25 synthetic
  edits and exact provider counts plan/image/render = 0/0/0 remain.
- `test/local-focus-native.proof.ts` **passes** after creating a Person 2
  position beneath a selected Person 1 row through the new helper, capturing
  boundaries 29/44 and zooming it independently. Decoded before/at/after frames,
  zoom/padding, original/cache integrity, revisions and cancellation/scratch
  cleanup remain verified. It builds its own current-source overlay in scratch.
- The browser proof retains CL-071's zero decoded rewinds during continuous
  playback. Composer captures under ignored `.local-build/evidence/cl076-add-*`
  were inspected at 390/320: person selector, Add/Cancel and persistent footer
  are reachable with 44px targets and no horizontal overflow.
- Frontend/proof TypeScript, affected ESLint, Prettier and
  `git diff --check` pass. Proofs are fake/paid-off/network-blocked with no env
  reads or real owner media. No broad suite or worker/backend restart needed.

Final read-only validation: **Meets ticket; no actionable findings**. Verified
confirmation before mutation, selected-row binding, source-shot framing,
independent time/settings/numbering, legacy refresh safety, keyboard/context
behavior, actual export, cleanup, architecture and privacy/spend. No product
scope deviation. Owning source-of-truth/workflow/frontend docs supersede the
earlier immediate/last-use Add policy. Owner actual-media and visual acceptance
remain manual; app/session/configuration and prior pending work are preserved.
Nothing staged, committed, pushed or deployed.
