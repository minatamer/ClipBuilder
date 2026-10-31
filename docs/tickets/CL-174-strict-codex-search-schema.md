# CL-174 — Strict Codex image-search schema regression

Status: Implemented and validated in fake mode; normal app ready for owner retry. Depends on implemented CL-171 and CL-173.

## Confirmed defect and owner request

The owner's real Find visuals attempt returned two generated fallbacks because
both Codex search calls failed with `invalid_json_schema` / `additionalProperties`.
Offline inspection confirms the actual search wire schema omits
`additionalProperties: false` on the envelope and each candidate object. The
earlier installed-CLI search proof used the focus schema and missed this request.
Owner requests the schema fix, an actual-search-request regression, fake/paid-off
validation and a ready local app for the next owner attempt.

## Acceptance

- Make both existing search-schema objects strict. Preserve required fields,
  URL/array bounds, broad discovery, provider selection, diagnostics and optional
  fallback; no retry, model, configuration or provider-budget changes.
- Share the exact production Codex discovery request builder with the proof so
  it cannot silently substitute another schema/prompt/search setting.
- An installed CLI against an isolated loopback fake provider must reject old
  root and nested missing-strictness schemas independently, then accept the
  actual fixed search request. Enforce object closure at the receiving endpoint,
  verify the actual search events and return a candidate image through injected
  retrieval/decoding. No real search/download/authentication/provider call.
- Keep existing focus/Unicode-wire compatibility checks. Verify ordinary search
  and fallback behavior, contracts/local/backend types, scoped lint/format and
  read-only validate. Refresh the verified backend/internal worker as needed,
  preserving frontend, owner clip/session, configuration and private logs.

## Gates

Tests force synthetic/fake/paid-off/no-key/network-blocked setup before imports,
disable env-file loading and use generated fixtures only. Fake success validates
request shape and control flow, not live search availability or relevance. Real
Codex needs the existing installed CLI/sign-in/local prerequisites; Gemini keeps
its existing key/approval gates. The next real Find visuals attempt belongs to
the owner. No paid, cloud, real download, config, Git or deployment action.

## Evidence

The response envelope and candidate now use `z.strictObject`, emitting
`additionalProperties: false` in the actual Codex wire schema at both levels.
Required fields and the 12-candidate/4,096-character URL bounds are preserved.
Runtime candidate reading derives `.strip()` from that canonical schema, so
extra provider metadata remains ignored instead of dropping a usable Gemini/web
image. The source regression includes both candidate and envelope metadata.

`codexImageDiscovery` owns the exact production prompt/schema/web-search request.
Production composition and the installed-CLI proof both call it. Search tests
no longer substitute the focus schema. The fake receiving endpoint recursively
requires every object to be closed, checks actual prompt/required fields/bounds
and returns a search event plus a candidate URL. Injected retrieval decodes the
generated 16×16 JPEG into a valid web asset without a real download.

Verification (fake/paid-off/no-key/network-blocked before imports; no ignored
environment files, real provider account, real search/download or paid calls):

- **Five installed-CLI proof cases pass**: old focus Unicode rejection, valid
  focus output, old search envelope omission, old nested-candidate omission and
  the fixed production search request. Each missing-strictness case is rejected
  independently by the fake provider with `invalid_json_schema` and
  `additionalProperties`, one rejection and zero downloads. The fixed request
  succeeds with one provider request, actual CLI search-event decoding and one
  injected image read. Preflight is a double; CLI auth is disabled against the
  loopback endpoint and an empty scratch profile. Process, listener and scratch
  cleanup passes. No retry is added.
- **26 source web-picture cases pass**, including retained small rasters with
  extra provider metadata, malformed results, search failures, candidate
  retrieval/decode, public-address/download bounds and Gemini compatibility.
- **82 local Codex execution/AI and Gemini adapter cases pass**, preserving
  diagnostic causes, fetched-before-fallback behavior and optional failures.
- Contracts/local/backend/root-test TypeScript, scoped ESLint and Prettier and
  whitespace checks pass. The settled metadata compatibility rerun passes.

Read-only validate: **Meets ticket; no actionable findings.** Reviewed the actual
production request builder, both schema levels and runtime tolerance, negative
controls at the provider boundary, exact dispatch/download counts, existing
focus compatibility, diagnostic/fallback preservation, privacy and cleanup.
Earlier CL-168–173 pending work is preserved and excluded from this new claim.
Scope deviations: none.

Verified normal backend refresh: the captured nine-process supervisor/watcher/
API/worker tree stopped and its identities/ports were absent before replacement.
Normal startup rebuilt contracts and the internal worker/overlay. Frontend
**4968/3000** is preserved; new supervisor **20648**, API **20248/4000**, worker
**22852/4200** are ownership-verified. Health, `/start`, `/api/sample/config`
return 200. One completed owner clip and its two previous visual attempts
recovered; no active work. No processing/Find visuals endpoint was invoked.

Current app: `http://localhost:3000/start`. Active content-safe records/logs:

- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl174-app-b4cb9a2818794f31a1e0425da6a529d5\backend.runtime.json`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl174-app-b4cb9a2818794f31a1e0425da6a529d5\backend.stderr.log`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl174-app-b4cb9a2818794f31a1e0425da6a529d5\backend.stdout.log`

Changed files: `apps/backend/src/assembly/web-pictures.ts` and its test;
`apps/backend/local/codex-composition.ts`; `test/local-codex-cli.proof.ts`;
this packet and the ticket index. No model, budget, retry, configuration or
frontend change. Live search availability/relevance and actual provider
acceptance remain owner-manual; fake success is not a live-provider claim.
No paid/cloud/configuration/Git/deployment action occurred. Changes remain
unstaged/uncommitted beside the preserved previous work; index is empty.
