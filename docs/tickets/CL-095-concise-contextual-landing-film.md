# CL-095 — concise landing film with continuous context

Owner request: 2026-10-28. The landing film is too long and includes repeated
page angles without explanatory text. Baseline `b945401`; dependency: CL-094
committed. Execute and read-only validate this packet before CL-096.

## Authority and scope

Follow [the current landing decision](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#owner-landing-refinement-decision--2026-10-28).
Replace the 50-second loop with a 24-second story: identity, upload, find
moments, choose, prepare, edit, download, close. Keep readable context throughout
each shot, with restrained camera movement rather than repeated close-ups that
hide copy. Use existing synthetic captures/original artwork; update obsolete
one-clip/read-only claims. Preserve silent autoplay, offscreen/hidden pause,
loading/error fallback, focus behavior and the existing eight-second motion test.

Own film timeline/copy/camera/composition and their existing focused tests;
update frontend film guidance. Keep the opening frame/poster consistent. No
MP4 export, new dependency, provider request or recapture of private media.

## Acceptance and checks

- One coherent 720-frame, 30fps story; every scene communicates its purpose.
- Titles remain visible after entrance, including screen-detail moments.
- No decorative angle-only sequence; camera keeps the screen below the title.
- Inspect every scene and transitions in the actual local browser preview;
  check autoplay, loop, hidden/offscreen pause and fallback.
- Run affected unit checks, frontend types, affected lint/format and diff check.
- Read-only validate the settled ticket diff; fix confirmed findings and repeat.

All visuals are API-free synthetic illustration, available with FAKE_MODE=true
and no keys. Real analysis/export needs configured providers/live flags/approvals
and owner action. No staging/commit, cloud, deployment or paid action authorized.
Owner personal visual/rights/release acceptance remains separate.

## Status

Implemented and locally validated, 2026-10-28. Timeline/copy, camera and
composition now provide the 720-frame story. Removed title-hiding close-ups and
the redundant sharing scene; kept the original opening frame/poster and motion
test. Frontend README describes the current film. Original synthetic captures
remain illustrative; no private recapture or MP4 render occurred.

Checks: two film units, frontend TypeScript, affected ESLint/Prettier and test
TypeScript passed. `test/local-landing.proof.ts` passed in installed Chrome
(28.95s): all eight beats and wraparound, no controls, offscreen pause/resume,
simulated visibilitychange pause/resume, and blocked-image recovery. Every page
POST was intercepted, including Next development diagnostics; zero processing
requests and zero external requests. Browser closed in finally. Inspected the
eight scene captures and fallback under ignored `.local-build/evidence/cl095-*`.
An initial obsolete Chrome interception method was corrected in the harness;
blocked development diagnostics are counted separately from processing.

Read-only validate pass V95-1 reviewed this ticket, combined film diff, call
sites, timing/placement, poster consistency, fallback/pause cleanup and actual
browser evidence. Verdict: Meets ticket; No actionable findings. Coverage:
short coherent story/context/camera/playback/checks Covered. Physical device,
owner personal visual/rights/release and real provider quality remain Unverified.
No deviations, source/backend/configuration changes outside scope, Git staging,
commit, paid/cloud action or deployment.
