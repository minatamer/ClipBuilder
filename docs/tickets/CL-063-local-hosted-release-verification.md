# CL-063 — Local Linux and hosted release verification

Status: local checks implemented and validated; remote/maximum-allocation gates
remain external. Dependencies: implemented CL-061 and CL-062.

Owner instruction — 2026-10-24: explain the remaining Linux/cloud checks and
finish all feasible local checks without credits. Never deploy.

Acceptance:

- Build the closed secret-free frontend/backend image inputs on the verified
  local Linux Docker engine. Public dependency downloads are local build inputs;
  no credentials, private registry, cloud builder, push, deployment or provider
  request. Do not read ignored environment files or use retained media.
- Verify packaged worker, current shared overlay, native tools and dependencies
  as the non-root image user, then exercise upload/moments/editor/export parity
  with generated media and fake AI in a network-isolated container. Detect and
  fix packaging/runtime failures. Preserve production feature gates.
- Check local session isolation, upload ordering/limits, resource budgets,
  cancellation, exit/expiry and process/scratch cleanup. Cover missing cases
  with focused fake-only checks. Distinguish simulated admission/resource bounds
  from actual measured native usage and maximum hosting capacity.
- Preserve running owner apps, saved media, credentials/configuration and all
  related work. Remove owned proof containers/scratch after checks; retain only
  content-free evidence and local images needed for review. No Git mutation.
- Record exact checks, fixes, measured limits, read-only validation and what
  remains impossible to prove locally: actual hosted identity/TLS/origin/
  Turnstile/routing and remote allocation/always-allocated CPU, plus live Gemini
  quality and owner acceptance. Never mark those passed from fake evidence.

`FAKE_MODE=true` and paid-off tests need no API keys. Fake providers permit
local pipeline and Linux native export verification, not real AI quality. Real
Gemini/Turnstile and cloud checks need actual configuration and separate explicit
approval; no credit-consuming test is authorized by this packet.

## Actual local evidence — 2026-10-24

- Built both exact secret-free frontend/backend Docker contexts using the local
  `desktop-linux` named pipe engine, Linux x86_64. Public Node/Debian/package
  downloads only, isolated anonymous Docker client configuration, no credentials,
  cloud builder, registry push or deployment. Current worker and shared overlay
  compile/package successfully with image-owned FFmpeg/Chromium.
- Frontend production image runs as non-root with external networking disabled:
  expected delivery assets/hash checks, CSP, origin handling and exclusion of
  authoring/test routes pass. Actual bundled backend starts, health is 200 and
  paid editing routes stay unavailable under fake/paid-off configuration.
- `scripts/verify-hosted-editing-linux.mjs` is an opt-in synthetic probe, bundled
  into owned scratch and mounted outside the production image. It installs the
  shared deterministic environment before application imports and blocks
  non-loopback Node connections; Docker additionally uses `--network none`.
  Current-source synthetic UI and actual packaged worker run as non-root under
  a read-only root, 4 GiB memory, four CPUs, 512 process slots, 3 GiB temporary
  scratch and bounded writable Chromium home. No host ports, private media or
  configuration mounted.
- Generated MP4 with a valid free atom passes two ordered chunks (**8,388,731
  bytes**), exact source hash binding, native inspection, shared manual moments,
  actual editor controls, 72px caption edit, Apply and native MP4 download.
  Additional saved caption/picture position and motion changes survive edits;
  decoded pixels prove the monochrome filter reached the native output. H.264
  1080×1920, AAC and one-second output decode successfully.
- Real native cancellation and explicit Retry pass with no repeated fake AI:
  exactly one transcription, zero AI selection calls for manual moments, one
  plan, one image, one inspection and four render attempts (one canceled).
  Session exit and expiry remove temporary upload/workspace data. All owned
  proof containers stop; no deployment or running owner-app replacement.
- Measured sample: about **25 MiB scratch**, **930 MiB peak container memory**,
  and **3.51 GiB declared reservation**. These are a small synthetic sample,
  not a maximum source/ten-clip/60-second capacity claim. Docker has only about
  7.6 GiB available; the documented 16 GiB hosted allocation remains untested.
- Twenty-two focused fake tests across hosted workflow/upload/runtime, clip
  lifecycle and worker diagnostics pass. Full baseline gates and the read-only
  review are recorded with the subsequent Git handoff evidence.
- Full settled synthetic suite: **1,770 tests in 165 files pass**. A full lint
  attempt exposed generated `editing-overlay/app.js` entering the source lint
  and formatter scan; the generated-only exclusion now matches `.gitignore`
  and the existing renderer bundle convention. Application lint rules remain.

Harness corrections: a read-only home initially prevented Chromium crashpad
startup; a bounded temporary home resolves it. The first two-browser proof with
256 process slots/two CPUs timed out during export. The bounded 512-slot/four-CPU
profile passes. These probe configurations do not establish a separate minimum
CPU requirement or change the app's production gates. Benign fixed-overlay
favicon 404 messages contain no user media/provider details.

Remaining: authentic remote frontend identity/TLS/origin and Secure-cookie/
Turnstile behavior, actual single-instance routing and always-allocated CPU,
maximum hosted memory/scratch/duration capacity, live Gemini quality and owner
manual acceptance. Local synthetic results do not satisfy those gates. No keys,
ignored configuration, real YouTube, retained media, paid service or cloud
resource was used. The new audit request authorizes local staging/commits only;
earlier implementation-time no-Git statements remain historical evidence.

Settled read-only validate: **Meets the local ticket; no actionable findings.**
Reviewed the probe's deterministic imports, network/resource bounds, actual
image-owned worker/tools/overlay, shared UI path, cancellation/retry counters,
hash/decoded-output checks and finally cleanup. All local release checks above
are covered; maximum capacity and actual remote/provider acceptance are
unverified external items, not inferred passes. Full lint, full repository
typecheck, Prettier and whitespace checks pass. Generated-output exclusions
apply only to the existing build-owned overlay directory. The owner-authorized
file-level Git handoff is recorded in `CL058_063_COMMIT_PLAN.md`.
