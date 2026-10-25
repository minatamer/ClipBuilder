# CL-075 — Stream large picked videos past the document proxy

Status: implemented and locally validated; owner retries their actual upload
manually. Report and fix: 2026-10-25.

Diagnosis: the retained owner-selected MP4 passes read-only media-property
inspection; normal app is synthetic-ai/healthy. Content-free frontend logs report
the default Next Proxy 10 MB body limit; backend reports a reset upload stream.
No owner media was processed, modified, uploaded or used as a test fixture.

The pinned Next documentation/source confirms Proxy clones request bodies into
memory and truncates its route-handler copy at 10 MB. Our nonce/security-header
proxy matches the raw picked-video route even though it never reads the body.
The downstream bridge forwards the original Content-Length, so its truncated
stream fails the backend's exact-byte upload admission.

## Minimal correction and acceptance

Exclude only the raw `/api/local/open/video` endpoint from the document Proxy
matcher. Keep the existing route handler's same-origin/site/path checks,
hosted cookies/CSRF/caller authentication, request bounds and streamed forwarding.
Do not raise a global in-memory limit, resize/re-encode sources, change browser
upload contracts, weaken backend admission or change provider/hosted capacity.
Document pages and all adjacent API paths retain current Proxy coverage.

- [x] Production matcher excludes exactly the upload route/trailing slash;
      document, lookalike and adjacent routes still match.
- [x] Actual pinned Next server accepts a generated streamed body above 10 MB
      completely, with exact byte/hash checks and no owner/backend resources.
- [x] Existing bridge security/stream/cancel tests pass, including upload origin
      rejection; frontend types/lint/format and final read-only validation pass.
- [x] Normal frontend serves the settled matcher; backend/worker/session/media
      and configuration stay preserved. No Git mutation, paid/provider/cloud call.
- [ ] Owner manually retries their actual selected file; no automatic owner upload.

Files: `src/proxy.ts`/tests, focused large-upload proof, narrow frontend guide and
source-of-truth/ticket/index evidence. Frontend-only reload if required, through
verified lifecycle ownership. No backend/worker code change.

All automated checks use synthetic/fake/paid-off/no-env/no-network composition
(loopback only). Fake local file intake/native inspection needs no API keys;
real AI still requires owner keys/live flags/approvals. No local model is added.

## Execution and verification — 2026-10-25

`src/proxy.ts` excludes only the exact video-open path and optional trailing
slash from its literal matcher. No global config limit changes. The route's
existing streamed `duplex: half` forwarding and origin/caller/session guards are
unchanged. Request/response capabilities remain private; the bridge still emits
no-store, no-referrer and nosniff. Backend exact-length/media validation remains.

Actual evidence:

- **10 tests in 2 files pass**: `src/proxy.test.ts` and
  `src/server/local-workflow.test.ts`. Pinned Next's exported matcher helper
  confirms document/draft/lookalike/child/chunk paths retain coverage while exact
  video-open paths bypass body cloning. Explicit upload origin/site rejection
  passes before discovery/forwarding. Existing authentication, range/stream and
  cancellation tests pass.
- New `test/local-large-upload.proof.ts` **passes in 8.57 seconds**. An actual
  pinned Next 16.3.8 server serves the production proxy/policy in isolated OS
  scratch. A generated **67,108,901-byte** body (64 MiB + 37) streams in bounded
  chunks through the real API handler; exact bytes and SHA-256 match. A neighboring
  ready route retains document CSP. The synthetic echo handler is test-only;
  it never connects to the owner backend or processes actual media.
- The fixture first reproduced the 10 MB truncation when a transformed export
  prevented Next from statically recognizing matcher config. Its final fixture
  preserves the literal export, and exact matcher/body assertions pass. Pinned
  Next's optional registry freshness lookup is supplied by an in-memory fixture;
  all other non-loopback fetch/socket access stays blocked. Telemetry is disabled.
  No package install/download, keys, ignored env read or external request.
- The proof explicitly closes its HTTP server, Next app and all fixture-owned
  Watchpack instances before deleting its verified scratch/junction. Initial
  custom-server watcher cleanup leftovers were removed from checked exact
  temporary paths; final proof cleanup passes without unhandled errors.
- Frontend/proof TypeScript, affected ESLint, Prettier and
  `git diff --check` pass. No broad suite or native export rerun is needed for
  a request-matcher correction.

Normal app read-only confirmation: `/start` returns 200 with document CSP;
GET on the video-open route returns the expected 404 without document Proxy
headers and retains nosniff. Capabilities remain `synthetic-ai`. This confirms
hot reload installed the matcher; no frontend/backend restart or owner upload/
reset was needed. Original retained media was only probed read-only for diagnosis,
never altered, copied into a fixture or automatically submitted.

Final read-only verdict: **Meets ticket; no actionable findings**. Checked literal
matcher specificity, retained route authentication/headers, no global buffering
increase, real large-body transfer, dependency direction, privacy/spend and owned
test cleanup. Existing pending work is preserved; nothing staged or committed.
Owner actual-file retry and personal acceptance remain unchecked. No Linux/cloud
deployment, provider-quality or production capacity acceptance is claimed.
