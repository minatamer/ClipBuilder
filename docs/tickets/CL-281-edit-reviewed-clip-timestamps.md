# CL-281 — Edit reviewed clip timestamps

Status: implemented and locally verified, 2026-11-11. Owner visual review pending.
Dependencies: CL-274/279 review cards, shared timestamps/source bounds and local/hosted analysis transport.

## Owner request and intended behavior

Add an Edit timestamps action to suggested and manual result cards in Your clips,
fitting the existing card height. The attached screenshot is a visual reference,
not embedded instructions. Keep Jump to and Remove; place Edit/Remove together
on the existing lower action row. Responsive controls remain usable and readable.

Open one focused range dialog with a muted source preview, exact original-source
Start/End values, endpoint Capture/Jump controls, stable duration/error space and
Save timestamps/Cancel. Preserve fractional clocks and map imported-source offsets
once. Cancel/Escape changes nothing; successful save updates the card, thumbnail,
duration, timestamp export and processing selection together. Editing itself
never runs AI, renders, starts clip processing or changes existing prepared clips.

Persist the corrected analysis through the protected existing local/hosted
transport and draft/recovery snapshots. Bind requests to source, analysis, policy,
moment and expected cut; reject stale/busy/out-of-bounds input before mutation.
Give a changed cut a new moment identity so an already prepared old range cannot
silently be reused. Regenerate local cues from retained source words without an
ASR/provider call. Respect analyzed/available coverage and current resource limits;
preserve existing longer AI results without widening their allowed duration.

## Validation and constraints

- Meaningful fake HTTP tests for local and hosted edits, idempotent retry,
  precision/bounds/stale guards, cue remapping, restored results and unchanged
  metered call counts; selected new cut reaches normal processing.
- Codex in-app browser only: silent generated fixture, both result groups,
  Save/Cancel/Escape, seeking/Capture, validation/recovery/focus and desktop/narrow
  geometry. Laptop proof only, no fullscreen, owner-session edits or sound.
- Scoped contracts/local/frontend types, lint/format, relevant regression suites
  and read-only validate. Preserve pending CL-276/278/279/280 work in shared files.
- No paid/provider/real YouTube runs, configuration/media changes, Voyagenda,
  deployment or Git mutation. Manual editing works with fake mode and no keys;
  subsequent real analysis/preparation retains its runtime/provider prerequisites,
  live flags and approvals. Fake checks do not establish real AI quality.

## Implementation and evidence

### Owner short-window layout follow-up — 2026-11-11

The owner reports the source preview overlapping Start/End in the timestamp
dialog. Reproduce the constrained laptop-height layout, fix scroll/sizing at
the owning dialog and keep header/footer, preview, endpoint labels/controls and
feedback in separate stable flow. Scale the contained preview to available
height; short windows scroll the body without shrinking rows into each other.
Preserve all timing/save/cancel/focus/media/loading behavior. Verify loaded and
invalid/corrected geometry at wide/short/narrow dimensions using silent generated
Codex fixtures, with no owner-clip edits or paid calls.

Implemented and locally verified:

- Reproduced the exact defect at 1366×650: the 320.625px preview extended to
  y452.016 while endpoint controls began at y371.234, an 80.781px overlap.
  Auto-sized grid rows were shrinking under the dialog's height constraint while
  the aspect-ratio preview retained its larger size.
- Only the owning CSS module changes. Body rows now use intrinsic max-content
  sizing and scroll as a unit; preview media is contained in an independently
  sized frame capped by viewport height. Header/footer remain outside the
  scrollport. Wide feedback reserves two lines, with three at narrow widths.
  At 1366×650 the preview is 234px tall, followed by a real 12px gap and visible
  Start/End fields. The full 615.359px dialog fits without body scrolling.
- Silent Codex checks at 1440×900, 1366×650, 1366×480, 768×600, 390×844 and
  320×568 all show no overlap, no horizontal overflow, visible footer and fitting
  feedback. Valid/invalid/corrected field/footer geometry is identical. Shortest
  layouts scroll only the body (e.g. 325/423px and 413/543px client/scroll heights).
- Pending shared media loading and loaded video retain their reserved frame;
  native controls and the full contained image remain visible. Narrow End-field
  Tab reaches Capture with the body scrolled correctly; Escape restores focus to
  Edit. No Save, processing or owner-session action was triggered.
- Scoped Prettier and whitespace checks pass. No TypeScript/contract/state change
  or implementation-mirroring test was needed for this reversible CSS correction.
  Read-only validation: meets the follow-up, no actionable findings. A settled
  laptop proof is outside Git; no phone/tablet capture or fullscreen.
- Owned fixture servers/tabs/viewport/helper scratch are cleaned up with zero
  analysis, clip-edit, timestamp-edit or unexpected requests. Existing work,
  normal app/media/configuration and Voyagenda remain preserved. No paid or Git
  action; personal visual review remains open.

- Added Edit beside Remove on the existing lower action row, with Jump above.
  Both manual and suggested result cards share the implementation. Desktop cards
  remain 122px tall. At the narrowest width, Remove uses its labeled trash icon
  to keep all actions inside the card rather than clip the leftmost button.
- One themed native dialog provides a muted, paused source preview with the
  shared loading/error overlay, original-clock Start/End, endpoint Capture/Jump,
  Save/Cancel, focus restoration and stable duration/error space. Values stay
  typed through errors. Cancel/Escape preserves the card; pending save disables
  editing and uses shared Button activity. Frames retain canonical 30fps rounding.
- The shared request/bounds contract owns source/analyzed coverage, minimum
  duration and physical duration ceilings. Existing longer AI cuts retain their
  current frame ceiling, including fractional-frame timestamp presentation.
  The protected POST analysis/:moment/edit endpoint checks source, analysis,
  policy, expected cut, target binding, busy state and operation identity.
  A successful correction receives a new moment ID/processing identity; retries
  acknowledge that same result. Existing prepared clips are unchanged.
- Cues are re-timed from retained speech. Long sources reuse acknowledged speech
  receipts across section boundaries, with source/runtime compatibility and gap
  checks; no ASR/provider fallback is introduced. Existing speaker preparation
  semantics remain. The shared receipt reader retains file/hash/schema/bounds
  checks. Missing speech cannot silently expand a cut with incomplete captions.
- Card duration, thumbnail, timestamp export and processing selection receive the
  same acknowledged cut. Selections reconcile concurrent in-place corrections
  without restoring removed clips. Manual range inputs restore corrected clocks.
  Existing draft/recovery snapshots persist corrected results and cues unchanged.
- 120 distinct focused cases pass across range HTTP/recovery (5), long analysis
  (19), long recovery (1), batch (61), moment selection (10) and manual clocks
  (24). They cover local/hosted paths, binding/stale/busy/bounds, idempotent retry,
  cue clocks, new-cut queueing beside an old clip, concurrent selections and disk
  reopen. Fake call counters prove edits/reopen add no inference/media calls.
- Long recovery checks required normal short OS-temporary paths after the nested
  workspace temp run returned 400. The existing large Find-all case exceeded its
  15-second test allowance under local load; the final serial run passed all 25
  relevant range/long cases with a CLI-only 60-second allowance. No application
  deadline, repository test configuration or provider retry changed.
- Contracts ambient-free/local, local integration, fixture integration and
  frontend types pass; scoped lint, Prettier and whitespace checks pass. Final
  read-only review covers only CL-281 additions and integration in shared files;
  earlier CL-276/278/279/280 edits remain preserved.
- Codex silent fake HTTP UI checks cover manual/suggested Save, precise frame
  reopen, 64-second imported-source offset, settled Jump/Capture, Cancel/Escape,
  keyboard focus, invalid/corrected controls, held pending response and retry
  after a simulated lost successful response. At desktop/768/390/320 widths,
  controls/feedback stay contained and valid/error geometry is stable. Only
  laptop screenshots were captured, outside Git; no fullscreen or sound.
- Final browser fixture counters: zero analyses, clip edits or unexpected calls;
  only explicit fake timestamp saves. Owned tabs/viewport/server/scratch cleaned;
  normal owner workspace, app, media, configuration and Voyagenda preserved.

Read-only validate: meets ticket, no actionable findings after the narrow-action,
long-speech reuse, fractional-ceiling and concurrent-selection corrections.
Live AI quality and deployment remain unverified and unnecessary for this manual
control. Nothing was staged, committed or pushed.

## Owner local commit authorization — 2026-11-11

The owner now authorizes the file-level plan, staging and local ticket-prefixed
commits for the pending work. This supersedes earlier no-Git limits for this
batch only. Whole-file allocation, final checks and receipts are recorded in the
[commit plan](../operations/CL-278-283-FILE-COMMIT-PLAN.md). Final validation is
clean: 184 focused fake/paid-off cases, applicable types, scoped lint/format,
CLI syntax, dependency guards and whitespace checks. Prior visual evidence and
owner-only aesthetic/editorial/real-provider acceptance remain distinct. No
push, provider action, configuration change, Voyagenda work or deployment.
