# CL-042 — Diagnose and fix the remaining real download failure

Status: implemented and verified. Dependency: implemented CL-041.

Owner follow-up 2026-10-23: after correcting the card design, determine why the
actual YouTube download still fails, fix the cause and verify it with AI fake.
The same previously supplied URL is authorized for bounded real metadata/media
requests and local processing. No source permit, API key, paid AI/cloud action,
configuration/secret read, deployment, Git action or unrelated process operation.

Initial content-free status: failed/failed after reporting 23,291,586 downloaded
bytes with the same known total. Do not assume a successful complete transfer:
trace completion validation, preparation and publication separately. Preserve
exact source/format binding, size/time limits, cancellation and every saved or
retained master/draft/export. Use bounded fixed diagnostic codes only, never raw
provider stderr/payload, source title/URL, filenames, tokens, credentials or media
frames in Git/logs/screenshots. Do not use real media as an automated fixture.

Fix the smallest confirmed cause, add a meaningful synthetic regression, run
relevant tests/types/lint/format/native proof as warranted and final validate.
Use the normal running app to verify the actual path without live AI. Report
precisely what completed and what remains manual/unverified; no fake result may
be presented as real transfer proof. Keep legitimate downloaded media for owner
testing and clean only owned transient resources. Fake AI needs no keys; real
Gemini remains owner-manual with normal keys/live flags/approvals.

## Cause and implementation

The original transfer reached native preparation. Metadata offered 30 fps and
209000ms; the downloaded streams measured 30000/1001 fps, 208.809s video and
208.821s audio. Existing validation required near-exact nominal frame rate and
frame-sized duration agreement with the rounded hint, incorrectly rejecting this
valid source. Saved-source admission independently rejected measured 29.97 fps
against the offered 30 fps label.

The shared pure frame-rate comparison accepts exact rates or the matching NTSC
rate for nominal 24/30/60 labels, rejecting other families and nonfinite values.
Whole-second hints allow strictly less than one second of quantization;
fractional hints retain tight frame tolerance. Audio/video clocks are compared
directly within the existing 100ms/frame allowance. Source and saved descriptors
retain measured clocks. Exact format IDs, codecs, dimensions, byte/time limits,
lossless remux, cancellation, retention and no-fallback behavior remain intact.

A bounded failure-code contract now carries recognized native/parser failures
through the worker and coordinator. Unknown errors map to a fixed generic code;
no provider output or raw error is returned. Focused regressions prove this
sanitization. The normal worker is prebuilt at backend startup: hot reload alone
does not rebuild it. The final normal-app check used a rebuilt worker after a
verified backend-only restart with fake AI/paid-off. Frontend and unrelated apps
were preserved. The narrow backend guide and source of truth record the policy.

## Evidence

- **36 focused unit tests in five files passed**, covering frame-rate families,
  nonfinite/unrelated clocks, saved-source reopening and failure-code privacy.
- **Two native proofs passed** (one unrelated case skipped by the filter).
  Generated NTSC media is admitted against nominal/whole-second hints and stores
  measured clocks; wrong 25 fps and larger duration changes reject and clean
  scratch. Existing VP9/Opus and combined H264/AAC lossless packet/browser-decode
  checks pass. These tests use generated media, fake AI and no provider network.
- Frontend, local-contract, local implementation and root-test TypeScript checks,
  focused ESLint, Prettier, contracts build and diff checks pass. No full suite or
  public production build was run for this local timing correction.
- Private native diagnosis reproduces the mismatch; an offline preparation of
  the already downloaded components succeeds after the fix. No retained master
  was changed or used as an automated fixture. Owned native resources drain.
- **Final normal-app real transfer passed** through queued/video/audio/inspection
  to ready, including lossless preparation and source publication. The workspace
  is synthetic-ai, 1280×720, 208808ms, 21,369,069 bytes. Browser-served source
  returns HTTP 206, video/mp4 and a valid MP4 header; headless Chrome decodes and
  seeks to one second (1280×720, container duration 208.814s). No frame/title/URL
  was captured or committed. This is real download/playback evidence, not an AI
  quality claim. Media remains available for the owner.
- After the contracts build reloaded the backend, the actual saved source also
  reopens offline through the normal app and passes the same MP4/Chrome seek
  checks. No new metadata/download or AI request was needed. Leave this restored
  workspace available for owner testing.
- `/start`, `/api/sample/config` and backend health return 200; capabilities
  confirm synthetic-ai and cloud false. Only the verified backend tree was
  restarted. An unsuccessful engine-mismatched launcher was drained before the
  healthy launch. Earlier trials interrupted by hot reload or using the stale
  worker are excluded from final success evidence. Private diagnostic captures
  and safe runtime logs are preserved outside Git. Final ownership/listener audit
  shows no active downloader/FFmpeg children; requested app services remain up.

Owner aesthetic/physical-device acceptance, other URLs/qualities, real Gemini
analysis/editing and paid/cloud processing remain unverified. No credentials,
ignored environment contents, deployment, Git mutation or unrelated process
change was used. The adjacent CL-041 packet owns the completed visual proof.

## Validate — read-only final pass

TL;DR: the packet aimed to diagnose the real failure, fix its confirmed cause and
verify the normal app with fake AI. Nominal/rounded clocks now admit the exact
download, preserve measured metadata and remain reusable offline.

**Verdict: Meets ticket. No actionable findings.** Reviewed the settled CL-042
unstaged implementation, its new pure-contract test and native proof, owning
documentation and the content-free real-transfer/playback evidence. The index
is empty; no commit range is selected. Preserved CL-028–040 changes and the
separately verified CL-041 presentation correction are excluded from this verdict.

Coverage: **Covered** — root-cause reproduction; narrowly bounded timing fix;
shared saved-source admission; exact codec/format/dimension/limit preservation;
measured metadata; fixed-code privacy; explicit failure/cancel cleanup; synthetic
regressions and generated-media lossless/native proof; real normal-app transfer,
publication and browser decode/seek; fake/cloud guard and retained-media safety.
Reviewed process/RPC/coordinator catch paths, worker-body bounds/drain and source
library admission. No duplicate timing policy, cross-app import, unsafe cast,
raw-content debug path, env read or paid dispatch introduced.

Checks: inspected the scoped diff/new files and the evidence above; smallest
relevant suites/types/native proof and formatting/build already pass. Full suite,
production build, other real sources/qualities, Gemini/cloud and owner visual
acceptance are **Unverified**, not claimed passed.
