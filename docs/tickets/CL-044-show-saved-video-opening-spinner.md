# CL-044 — Show saved-video opening activity

Status: implemented and verified. Dependency: implemented CL-043.

Owner request 2026-10-23: show a spinner after Use video until the next workflow
step loads. Reuse the existing button, rotating spinner and anchored footer.
Show “Opening…” with an accessible busy state while the saved-source open
request is pending. Prevent repeat activation and keep other intake controls
disabled. Keep the indicator until the workspace response opens Choose your
moments; on failure remove it, restore Use video and allow explicit retry.
Preserve card bounds, paired action layout and existing preview/transfer states.
No fake percentage, extra section, backend behavior or automatic retry.

Extend the existing generated-media browser proof with a controlled delayed open,
actual spinner rotation, responsive geometry, failed-open recovery and successful
handoff. Run relevant types/lint/format and a final read-only validation. Keep
fake AI/paid-off, zero provider/cloud calls, existing services and all saved
media intact. No env read, Git mutation or deployment. This UI works without API
keys; real Gemini remains owner-manual with normal keys/live flags/approvals.

## Implementation and evidence

The existing saved-open pending state now renders the shared LoaderCircle and
“Opening…” inside the same footer button, with aria-busy and an accessible
Opening video name. Existing request/busy guards disable all intake actions and
selection while it runs. The indicator stays mounted for the request and hands
off directly to Choose your moments. Failure clears it and restores explicit
Use video retry. No new state machine, processing call, progress estimate or CSS.

- Final generated-media browser proof **passed in 27.66 seconds**. A controlled
  unresolved open proves continuous rotation over four samples, disabled/busy
  state and no transfer bar. Card bounds, paired CTA geometry, 44px targets and
  label fit pass at 1440×900, 390×844 and 320×568. Desktop/phone captures were
  inspected. A failed response restores the action and error; explicit retry
  reaches the next step and removes the spinner. Exactly two opens (failure and
  retry), with earlier metadata/import/cancel counts unchanged.
- Frontend/root-test TypeScript, focused ESLint, Prettier and diff checks pass.
  The initial proof selector excluded disabled controls; it was corrected to
  inspect the busy button and the complete proof then passed. No product failure
  was hidden by the fixture correction.
- Existing preview, upload, resolution/startup, motion, transfer, cancellation
  and offline checks continue to pass in the same proof. Generated media only;
  no real source/provider/cloud/AI request or saved-media mutation. Browser,
  pending reply, listener and scratch cleanup remain owned and drain.
- Owner physical-device/aesthetic acceptance remains unchecked. No full suite,
  production build, real AI, API-key/paid check or deployment is claimed.

## Validate — read-only final pass

TL;DR: Use video now communicates pending work continuously, preserves the
footer and handles failure/retry/handoff. **Meets ticket; no actionable findings.**
Reviewed the CL-044 unstaged button branch, existing request/finally/onOpen path,
proof additions, owning docs and complete packet. CL-028–043 changes are
preserved/excluded; index empty, no commit range selected. Coverage: **Covered**
for busy spinner/normal motion, disabled/repeat guard, responsive stability,
failure/explicit retry, next-step handoff and cleanup; evidence is the focused
checks above. Reuses existing primitives with no duplicated schema/constants,
cross-app import, new configuration, unsafe cast or content leakage. Physical
devices and live/paid processing remain **Unverified**. No Git action ran.
