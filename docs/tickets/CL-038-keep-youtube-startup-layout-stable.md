# CL-038 — Keep the YouTube card stable during startup

Status: implemented and verified. Dependency: implemented CL-037 and loading treatment CL-036.
Owner request 2026-10-23: preserve the full YouTube card while the app connects,
disable URL entry until fully loaded and show a spinner without swapping layouts.

Mount the real acquisition form from the beginning with unknown capabilities;
do not invent a fake runtime capability. Keep its icon/title/description/URL/
Continue geometry stable, place a compact startup spinner in the URL field and
enable input only after capability and workspace restoration both finish. Failed
startup keeps the form disabled and uses the existing error. Delay source-status
polling until initialization succeeds. Preserve link/resolution states, actual
download progress, offline saved reuse, errors, cancellation and all mode gates.

Extend the existing synthetic intake proof to compare pending/ready desktop and
phone bounds, preserve input-node identity, check partial initialization/failure
and zero premature status requests. Inspect synthetic captures; run focused unit,
frontend/root-test types, lint/format and final read-only validate. No full root
suite/build or real YouTube test is needed for this presentation/lifecycle edit.
Keep the normal app running and saved media/unrelated apps intact. Fake AI stays
key-free; actual local acquisition/editing/export remain independent. Real AI
still requires normal Gemini keys/live flags/owner approvals; no offline AI model
is supplied. No provider/cloud request, credential/config read, Git mutation or
deployment is authorized.

## Implementation and evidence

`experience.tsx` always renders the same acquisition panel during intake and
publishes capabilities only after both initialization reads succeed. The panel
accepts unknown capabilities, stays disabled, shows a screen-reader status plus
the existing spinner inside its URL field, and begins status polling only when
ready. It uses actual runtime capabilities without a synthetic fallback. A failed
read keeps capabilities unknown, stops the spinner and retains the existing
connection error. No API route or provider setting changed.

The URL field reserves spinner space in both states and fades its disabled
opacity using the existing motion token; reduced motion disables that transition
and spinner animation. Icon, title, description, field and Continue remain mounted.
The source-of-truth decision and feature README document this startup behavior.

Verification actually performed:

- Focused runtime-capability/form unit file: **five tests passed**, including
  unknown-capability disabled form and absence of invented source provenance.
- Existing synthetic intake browser proof: **one passed in 24.60 seconds**.
  Held capability and workspace responses independently; the input and spinner
  remained disabled/visible through partial initialization, with zero premature
  status requests or mutations. The original input DOM node survived readiness.
- Before/after card, input and sibling upload bounds were **identical** at
  1440×900, 390×844 and 320×568. Desktop/phone pending captures under ignored
  `.local-build/evidence/cl038-*` were inspected. Existing six ready-intake
  viewport, resolution-loading/reduced-motion, error/retry, exact download/cancel
  and saved/offline reuse checks remain covered by the same proof.
- Explicit startup failure leaves the complete URL form disabled, removes the
  spinner and displays the existing error. Browser/listener/response gates and
  scratch drain; the existing process check reports zero owned survivors.
- Frontend and root-test TypeScript, focused ESLint, Prettier and
  `git diff --check` passed. No full root suite/build or real acquisition ran.

## Validate — final read-only pass

Scope: this ticket's stable panel mount, startup readiness/polling guard, field
spinner CSS, focused unit/browser extensions and owning docs, all unstaged.
Earlier CL-028–CL-037 work is preserved and excluded; the Git index is empty.
**Meets ticket; no actionable findings.** Covered: stable initial layout, disabled
entry through full initialization, inline/accessibility/reduced-motion feedback,
failure state, readiness without remount, existing acquisition behavior and
resource cleanup. No duplicate schema/mode, provider call, unsafe cast, dependency
change or production debug path was introduced. The normal app and saved media
were left running/intact. Fake AI is unchanged; owner aesthetic/physical-device
acceptance and real AI quality remain unchecked. No Git mutation or deployment.
