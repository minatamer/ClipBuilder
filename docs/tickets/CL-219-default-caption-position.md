# CL-219 — Default caption positioning above visuals

Status: Complete locally, 2026-11-05. Dependency: CL-218 implemented and locally
verified. Its existing unstaged work belongs to that packet and is preserved.

The owner requests a new caption position matching the supplied preview: between
Center and Lower half, above the normal visual slot. Call it **Default positioning**
in Captions → Position, choose it for newly created captions and keep other
position choices/manual placement. Preserve existing saved caption boxes/styles.

Reference: read-only inspection of the owner's applied box establishes a center
at approximately 53.77% of portrait height. Use a canonical 53.75% center (1032
on the logical 1920px canvas), retaining the existing centered width and safe
two-line height. This matches the demonstrated placement within one logical
pixel, without a media-specific layout or changes to visual positioning.

## Acceptance and allocation

- Shared caption presets/new-caption defaults use this vertical center, including
  taller presets, while existing explicit saved styles remain authoritative.
- Captions → Position exposes Default positioning alongside existing positions;
  it is pressed for new default captions and restores that position when chosen.
  Applying typography retains the owner's current box/alignment as before.
- Text layers keep their current defaults/options. Preserve drag/resize, Reset,
  Apply/Discard, restore, footer placement and scaled preview/native parity.
- Check actual controls at desktop and phone widths with generated media; inspect
  caption/visual separation and selected state. Run focused geometry/default units,
  relevant browser/native proof, contracts/frontend/local types and scoped lint.
- Owning surfaces: shared caption defaults, existing position fields/editor state
  and caption wiring, focused tests/proofs, narrow frontend/composition guides,
  source of truth and this packet/index. No new provider or media work.

Use execute/validate/fix until no actionable findings. All tests remain synthetic,
fake/no-key/paid-off. Real caption AI still requires its existing provider/login/
key/live approvals; placement itself needs none. Preserve owner media, exports,
drafts and configuration. Rebuild/reload only the owned backend/worker after
shared contracts/composition changes; preserve the frontend. No Git mutation,
real inference, cloud or deployment. CL-220 follows only after this gate.

## Evidence

Implemented shared defaults and an optional caption-only Default positioning
choice in the existing position controls. All caption presets center at 1032px;
the taller Bold preset keeps its required text height. Typography changes still
retain spatial placement and alignment. Explicit saved boxes are not migrated,
and authored Text does not expose the new caption-specific option.

Produced checks:

- 49 focused cases in position-fields, editor-state, styled-caption and owner
  editor API tests pass (17.19s). Coverage includes selected Default state,
  other positions/manual controls, preserved legacy bottom alignment, saved
  geometry, safe preset sizes, style changes and shared composition.
- The real responsive editor proof passes in 50.64s at 320/390/430/768/834/1024/
  1366/1440px, including short screens and touch layouts. Default is initially
  pressed; Lower half and Default update actual preview geometry; the control
  is scrolled into view for screenshot review, with footer and overflow checks.
  Returning to the separate navigation cases restores their initial scroll.
- The current-source native caption/speaker/Hook rendering case passes, including
  the actual new default style in a native MP4. Accent pixels lie in the new
  vertical band; color/white text, Hook repetition and body behavior are retained.
  No old `.local-build/overlay` is used for this proof.
- Contracts build, local/native and no-Node contracts, frontend and test types,
  scoped ESLint/Prettier and whitespace checks pass. An optional-prop test type
  and an obsolete implicit bottom-alignment assertion were corrected.
- Desktop and phone generated screenshots inspected under ignored evidence.
  Placement needs no API keys, model or inference. All checks use generated
  media with fake/paid-off/network interception.
- Backend-only verified reload: nine owned processes stopped, no survivors,
  4000/4200 released/stabilized before hidden normal startup. Worker/overlay
  rebuilt; health 200. Current source fingerprint and entire saved clip list,
  including the owner's caption box and Hook, are identical. Frontend preserved.

Read-only settled validation checked the new defaults, actual caption wiring,
shared primitive, safe geometry/preset handling, saved styles, preview/native
placement and cleanup. **Meets ticket; no actionable findings.** CL-218 changes
are preserved and excluded from this verdict.

The wider existing native Hook suite exposed an unrelated uncaptioned one-frame
fractional-rate export `invalid_frame_count`. The caption-render case passes;
the failing case has no captions. CL-220 owns reproducing/fixing that Hook clock
defect before its final gate. No native-frame assertion was weakened.

Changed: `packages/contracts/local/editor.ts`; frontend editor-state, position
fields, caption wiring and focused tests; existing responsive/native speaker-Hook
proofs; frontend guide, source of truth, packet/index. No owner-state edits, real
processing, configuration, Git, cloud or deployment. Personal visual/device and
hosted release acceptance remain separate. Changes are unstaged/uncommitted.
