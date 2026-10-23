# CL-037 — Diagnose the owner's failing YouTube resolution lookup

Status: implemented and verified. Dependency: implemented CL-033 and CL-036.
Owner request 2026-10-23: explain and address repeated resolution lookup failure.
The owner supplied a failing link in chat and authorized reproducing its lookup
with fake AI. Keep the source URL/identity and any returned media metadata outside
Git. Do not fetch a different video, perform a full download or invoke real AI.

Inspect service health/ownership, reproduce the exact lookup through the normal
app and isolate a fixed failure reason. Use an isolated diagnostic harness only
if required, preserving the production network boundary and minimal environment.
Do not store or print raw extractor errors/payloads, account/capability data or
credentials. Any diagnostics may contain fixed categories, structural types and
counts only. A generic UI message is not evidence of a YouTube block.

Fix a confirmed implementation defect within this scope, with a meaningful
synthetic regression and relevant types/lint/browser/native checks, then verify
the same lookup if possible. Preserve exact variant selection, no hidden retries,
local-only access, request cleanup and existing saved media/unrelated app services.
Validate the settled diff and report the confirmed cause versus any uncertainty.
No real AI/provider/cloud call, configuration/credential read, deployment or Git
mutation. Fake AI/native editing needs no provider keys; real AI still requires
normal Gemini keys/live flags/owner approvals. No offline AI model is supplied.

Confirmed cause: production metadata succeeds and validates its raw fields, but
offer construction applies the 1,000 raw-format limit to expanded video/audio
pairs as well. This source's 186 raw rows include 38 video and 105 audio entries,
with matching identity and no duplicate video/audio IDs; expansion exceeds 1,000.
Separate a bounded 10,000-choice limit from the unchanged 1,000-format input
limit. Preserve all exact variants, sorting/support decisions and selected IDs;
do not silently truncate tracks or substitute lower quality.

## Diagnosis and repair

The normal app returned 400 for the owner-supplied metadata request in about
13.4 seconds. Health/capability checks passed and there was no active workspace,
so this was not a busy-workspace rejection. The production downloader then
returned both projected metadata records successfully. Private diagnostics
confirmed matching identity, valid raw/normalized schemas and no duplicate IDs.
The failure was in `buildOwnerYoutubeOffer`, whose expansion guard shared the
raw-format cap; both paths used the same generic metadata error code.

The shared acquisition profile now defines `maxChoices: 10_000` independently
of `maxFormats: 1000`. Offer construction and its cross-boundary schema use the
new cap. Raw parsing, stream compatibility, ranking/preferred audio, exact-choice
hashing, duration/size limits, network controls, cancellation and zero retries
are unchanged. The source-of-truth local boundary records the bounded correction.
No source variants are discarded to fit the response and no quality is replaced.

Diagnostics used the real production port and one temporary schema-only bundle
to distinguish parsing from expansion. Only fixed errors, known field/type paths
and counts were written outside Git. Raw returned records and extractor stderr
were never persisted or printed; the private input script and content-free
results remain OS-temp. Every diagnostic transfer scratch directory was removed.
One shell quoting attempt failed before running and was corrected without an
additional network request. No normal secret/configuration file was inspected.

## Actual verification — 2026-10-23

- **834 backend tests across 51 files passed**. The focused format/downloader/
  source-acquisition run passed **62 tests across three files**, overlapping the
  package suite. New synthetic regressions cover 38×105 = 3,990 choices with exact
  track/quality retention, admission at 10,000 choices and rejection beyond that
  independent cap. Existing malformed/duplicate/raw-format-limit checks still pass.
- Contracts build, Node-free local-contract TypeScript, combined local TypeScript,
  root-test TypeScript and frontend TypeScript passed. Focused ESLint, Prettier
  and `git diff --check` passed. No full root production build or unrelated suite
  was rerun for this bounded local policy correction.
- The backend watcher reloaded the fix normally. A brief unavailable response
  during reload settled to 200 with synthetic AI and cloud false; no separate
  launcher, port fallback or manual restart was introduced.
- Through the normal `/start` UI, the exact supplied link now loads the resolution
  picker. Selecting **1080p, 30 fps, English** enables **Download video**. A
  screenshot under ignored `.local-build/evidence/cl037-resolution-ready.png`
  shows only the closed picker and enabled action, with no source URL/title or
  media frame. The app was left at this selection. No download was initiated.
- Verified original app supervisors, listener ownership on 3000/4000/4200 and zero
  transient downloader/Deno/FFmpeg/ffprobe/browser children. The content-free
  runtime record was refreshed after reload. Saved sources/drafts/exports/private
  captures and unrelated app processes were preserved.

This fixes and verifies this link's metadata path. Actual acquisition of this
particular source, every YouTube/platform variant, human editorial acceptance
and real Gemini processing remain untested. CL-033's earlier real download/export
evidence is separate. AI remains fake/key-free; no provider/cloud/paid call ran.

## Validate — final read-only pass

Scope: shared choice-bound constant/schema, offer-construction guard, two new
synthetic regressions and owning decision/evidence documents, all unstaged.
Earlier CL-028–CL-036 changes are preserved and excluded; the index is empty.
**Meets ticket; no actionable findings.** Covered: confirmed exact-link cause,
bounded fix, raw-input safeguards, exact selection, regression/limit checks,
normal UI success, privacy, mode separation and cleanup. No duplicate bound,
cross-app dependency, new schema copy, unsafe cast or debug production path was
introduced. No Git mutation or deployment occurred.
