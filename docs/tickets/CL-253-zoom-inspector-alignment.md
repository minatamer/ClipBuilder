# CL-253 — Align the Zoom inspector

Status: Complete locally, 2026-11-07. Dependency-ready after CL-250; preserve pending
CL-247–252 work. Owner explicitly requests fixing the misaligned Zoom controls
shown in the screenshot: the effect selector, Add at playhead and distant Reset
focus must form a coherent responsive inspector.

## Scope and acceptance

- Align the dropdown and adjacent Add button by their control edges, independent
  of the label height. On narrow columns, stack predictably without squeezing,
  clipping or awkward wrapping; retain design-system targets and tokens.
- Remove accumulated empty-feedback spacing before Reset focus. Keep local
  feedback accessible and readable, with a stable shared reservation rather than
  repeated blank slots. Error states must not resize fields, move controls or
  enlarge the workspace footer. Preserve input/focus, validation and actions.
- Verify empty/populated Zoom, local error/correction, the nearby Camera/People/
  Motion layouts and footer visibility at laptop/tablet/phone widths using the
  actual editor and generated fake/no-key fixtures. Preserve separate columns,
  shared scrollbars, preview geometry and all CL-250 zoom behavior.
- Narrow frontend layout/feedback changes only. No provider, normal app restart,
  owner clip patch, ignored configuration, Git mutation or deployment. Generated
  checks work with fake mode and no API keys; real AI retains its separate
  runtime/credential/live/approval requirements and is unnecessary here.

## Verification

- Root causes confirmed in the generated normal editor: the generic collection
  row centered its button against the full label/select block (12.5px vertical
  mismatch), and separate empty feedback reservations accumulated before Reset.
  Generic form columns also overrode Zoom's numeric grid at constrained widths.
- The Zoom selector/action row now aligns control edges in a two-column grid.
  A named inline-size container stacks both controls at full width when its own
  column is too narrow. Numeric rows adapt to usable width and align by their
  controls; Start/Capture retain a complete shared row. No screenshot-specific
  offsets, new dependency or change to Zoom timing/capture/preview math.
- Nested Zoom fieldsets share the inspector's inset at every size. Reset is a
  44px design-system text action on that same left edge. Focus combines current
  error/status text in one accessible reserved slot after Reset; the Zoom-local
  message slot remains. Empty parent reservations no longer push Reset down.
  Existing validation, tab issues, typed drafts and focus are preserved.
- Actual Codex-browser generated editor checked at 1440×900, 1280×720,
  768×1024 and 390×844. Desktop dropdown/Add top and bottom edges are identical;
  tablet/phone stack at equal width. All measured controls retain 44px height.
  Duration/magnification and X/Y pairs align exactly where columns fit. Reset
  and controls share the same left edge; its laptop gap is reduced by 67.2px.
- Empty and populated states passed. Duplicate-add feedback on laptop and blank
  duration/error/correction on tablet/phone left field/action/Reset positions,
  preview dimensions and footer geometry unchanged. Apply disabled for invalid
  input and re-enabled after correction; local focus remained in the input.
  Footer remained 77px at laptop/tablet and 69px at phone. No page overflow.
- Camera, People and Motion were inspected at desktop/tablet/phone: no horizontal
  inspector/page overflow and footer fully visible. Independent wide-screen
  columns, existing scrollbars and tab positioning remain unchanged.
- Frontend TypeScript, scoped ESLint/Prettier and diff whitespace passed.
  Existing fake/no-key contextual-feedback regression gate: **15 tests passed**.
  This reversible layout change adds no mirroring unit test or native rebuild;
  actual responsive geometry supplies its acceptance evidence. Earlier CL-250
  timing proofs are unchanged and were not rerun. No real AI acceptance claimed.
- Validation: **Meets ticket; no actionable findings**. Reviewed the narrow
  class/CSS changes, combined local feedback, actual form/Reset integration and
  responsive evidence against every requirement. Prior CL-247–252 work is
  excluded from this verdict and preserved. No schema/architecture change,
  unmount/caret reset, debug logging or new provider path.
- Browser tabs closed and viewport reset. The fixture launchers had closed stdin,
  so cleanup verified their exact process identities, stopped four owned fixture
  trees, confirmed listener/descendant absence and removed only the four uniquely
  matched generated temporary directories. Normal frontend/backend identities
  stayed unchanged. Aggregate measurements/screenshots remain outside Git.
  No owner clip Apply, media/configuration change, provider call, app restart,
  staging, commit or deployment. Owner physical-device/taste/hosted acceptance
  remains unclaimed; deviations from scope: none.
