# CL-082 — Diagnose and fix normal-worker clip rendering failure

Status: implemented and locally validated; owner real-media/visual and Gemini
acceptance remain manual.

The fresh owner fake-mode clip passes preparation, then native rendering fails
after about 31 seconds. Backend reports `media_unavailable`; worker reports an
unclassified Error. This is separate from the earlier restart/reconnect state.
Existing current-source focus/native proof passes both normally and under the
isolated native environment, so neither a paid retry nor a guessed limit change
is justified. Preserve CL-080/081's pending changes and all owner files/logs.

Reproduce the compiled normal-worker and strict overlay document boundaries with
generated input and current-source scratch bundles. Identify the actual failing
stage before changing behavior. Add focused regression coverage for the confirmed
fault, preserve resource/deadline/cancel/privacy/quality gates, and improve only
fixed content-free native reason codes where needed. Never print arbitrary owner
errors, state/capabilities, media metadata, provider output or configuration.

Use execute/read-only validate/fix locally. Run focused unit/native checks and
affected types/lint/format; rebuild/reload current worker through verified backend
lifecycle ownership, preserving frontend. Do not touch the owner's failed clip or
trigger its Retry/Generate captions. Owner real-media/visual and Gemini acceptance
remain manual; fake/native verification needs no API keys and no local AI model.
No provider/cloud calls, deployment, Git mutation, or ignored environment reads.

## Confirmed cause and scoped fix

The isolated compiled-overlay proof passes for one empty frame but fails for a
full minute at `001024.png`: Windows returns UNKNOWN from `link`. Repeated blank
frames all referenced one inode; new fake-mode default-empty captions/art exposes
the per-file hardlink ceiling. Short prior synthetic exports stayed below it.
No Gemini call, real source decode or provider-quality rejection is involved in
this reproduction.

Rotate each cached PNG to a fresh exclusive copy after 512 links, then resume
hardlink reuse from that copy. Count copied PNG bytes against the same overlay
storage budget. Preserve pixels, frame clocks, output quality, cancel checks and
owned scratch cleanup. Do not raise deadlines or limits, retry work or alter AI.
Verify 1,800 files, identical first/last pixels, bounded link counts, actual
full-minute MP4 composition, existing native focus output and private diagnostics.

## Verification and handoff — 2026-10-26

Changed application file: `apps/renderer/local/rasterize-overlay.ts`. Added
`test/local-overlay-runtime.proof.ts`; this packet and ticket index own the
evidence. CL-080/081 changes remain pending and preserved. No product/quality,
provider, environment or contract policy was changed by CL-082.

- Before fix, current-source one-frame overlay and short native proofs pass,
  including under the exact isolated worker environment. The same compiled
  strict-page proof with 1,800 empty frames fails at the 1,024th hardlink.
- After fix, the compiled isolated proof creates all 1,800 PNG paths with
  identical first/last bytes and per-file link counts below the failure bound.
  It then renders and inspects a real synthetic 60-second MP4 through the normal
  native clip compositor, retaining 320x568, 30 fps and exactly 60,000ms. Native
  intermediate overlay/partial output cleanup passes.
- New full-minute and existing focus/native proofs: **2/2 pass**, 88.22s total.
  Current source overlays and isolated child are compiled in owned OS-temp
  scratch; the proof never uses an old `.local-build/overlay` to establish parity.
- Diagnostics/output-profile/clip-batch regressions: **24/24 pass**. Local and
  test TypeScript, affected ESLint/Prettier and whitespace checks pass. The new
  proof's cleanup path check was moved into its named cleanup function to meet
  lint; ownership guards and cleanup behavior are unchanged.
- All checks force fake/paid-off/no-key composition and synthetic media. No
  owner media, paid action, real provider transport or ignored env file was used.
  The separate isolated-environment diagnostic scratch was removed after exit;
  normal private app diagnostics remain preserved.

Read-only final validation: **Meets ticket; no actionable findings**. Confirmed
byte-for-byte frame reuse, fresh exclusive cache anchors, accounting for copied
PNG storage, existing abort/cleanup and media-quality behavior, no duplicate
schemas/dead branches/debug output and no broadened paths/inputs or paid retry.
The failure was reproduced before the fix, rather than inferred from a successful
short render. No duration/resource/timeouts were increased in application code.

Normal backend shutdown captured 10 owned identities, sent the graceful signal,
and verified released 4000/4200 plus no survivors over two stabilization checks.
Normal startup rebuilt the current worker/overlay. Replacement API PID **23492**,
worker **5780**, supervisor **22944**; frontend **17564** / supervisor **10400**
preserved. Backend health, `/start` and `/api/sample/config` all return 200;
capabilities report `synthetic-ai` and caption generation available. Runtime
record and separate logs are outside Git under
`C:/Users/minat/AppData/Local/Temp/clipbuilder-run-20261026/`; backend stderr is
`backend-20261026-111651.stderr.log`.

Owner should refresh/reopen the video after the backend reload before manually
retrying. Agent did not trigger Retry/Generate captions or validate real Gemini
quality. Real-media/visual and Linux/hosted release acceptance remain unchecked.
No staging, commit, push, deployment or cloud action. No scope deviation.
