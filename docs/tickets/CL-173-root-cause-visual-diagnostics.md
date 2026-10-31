# CL-173 — Root-cause visual diagnostics

Status: Implemented and validated locally; ready for the owner's next Find visuals attempt. Depends on implemented CL-170–172.

## Owner request

The owner requests the deepest useful local diagnostics before another manual
Find visuals attempt, after two searches failed with only `search_failed`.
Preserve original failure facts at their source and correlate the full route:
CLI preflight/process, JSON events/output, search, candidate retrieval/decoding,
storage and generated fallback. Do not require repeated diagnostic revisions to
identify ordinary CLI/provider/network/schema/download failures. Use the execute
and read-only validate workflow; preserve existing uncommitted changes.

## Acceptance and scope

- Structured diagnostic detail includes exact phase, stable failure category,
  exit/signal/OS code, recognized provider/HTTP/schema/CLI option identifiers,
  byte counts, event/search counts, deadlines and elapsed time, plus an opaque
  error fingerprint for unknown errors. Preserve nested original failure facts
  across catches. Unknown errors remain explicitly unknown, not false no-match.
- Record bounded stderr/error-event classification before discarding buffers.
  Never log credentials, login content, prompts, transcript, full CLI arguments,
  image/page URLs or raw model output. Error text is used only in memory to
  extract fixed diagnostic identifiers and a one-way fingerprint. No raw dump.
- Separate search errors from completed searches with no candidates. Trace each
  candidate by ordinal, kind, DNS/redirect/HTTP/body/decode phase, bytes, raster
  dimensions, timing and limits. Include fallback reason/outcome and final
  retained/dropped counts. Caller cancellation and stage timeouts are distinct.
- Detailed diagnostic records share request correlation with ordinary logs,
  have independent bounded capacity so a normal multi-visual request does not
  suppress its cause, and cannot change processing if the sink throws.
- Instrument the real composed Codex path and shared image retrieval; keep
  Gemini failure distinctions as well. No new inference, search retries, paid
  calls, user flow interruption or media/configuration changes.
- Tests reproduce ordinary failure families, malformed/warning/fatal/absent
  events/output, bounded output, cancellation, search and download failures,
  fallback continuity, correlation, sink failure and private-content exclusion.
  Include actual child processes and installed CLI against local fake transport.

## Verification gates

All agent tests use synthetic data, fake/paid-off flags before imports, ignored
env disabled, no credentials and external network blocked. Run focused tests,
local/backend/contracts types, scoped lint/format and read-only validation.
Rebuild/reload normal worker with verified ownership after contract changes;
preserve the frontend, owner clip/session, logs and configuration. Check only
non-metered local GETs. Then invite the owner to repeat Find visuals.

Fake mode requires no keys and verifies diagnostic mechanics/fallbacks, not
real provider availability. Real Codex uses installed CLI/ChatGPT sign-in and
local prerequisites; Gemini uses its key and existing approvals. Real searches
are owner-manual only. No agent provider/cloud/download/config/Git/deploy action.

## Evidence

Implemented `execution_trace` records beside existing private-free diagnostics.
They share the route's request ID and use per-inference/per-discovery call IDs.
Each record validates against a strict shared contract before writing. A separate
2,048-record request budget reserves 128 terminal records and reports drops;
ordinary 128-record logging cannot consume this trace budget. Sink exceptions
and invalid objects remain nonfatal. Unknown failures retain their phase and a
SHA-256 message/identifier fingerprint rather than a fabricated explanation.

The CLI boundary now classifies its bounded 64-KiB stderr tail and structured
error-event fields before discarding buffers. It records exit/signal, stdout/
stderr counts and limits, OS/DNS/TLS/connection codes, recognized HTTP/provider
codes, CLI option and schema keyword, actual event/search/warning counts, missing
completion/search/output, JSON/shape/link/size failures, cancellation/deadline
origin and cleanup. Strong stderr/provider failures take precedence over incidental
stdin errors. Successful output is not reparsed merely to classify a failure.
Normal composition also probes/cache-reads `codex --version` once per backend,
with no inference, and records numeric version/login kind without login text.

Discovery errors preserve their typed cause through optional callers instead of
returning a false no-match. Both local provider compositions connect the trace.
Gemini preserves HTTP status even when its error body fails, and classifies
recognized provider codes without logging the response. A completed empty search
and malformed candidate envelope have different diagnostics. Retrieval logs each
candidate's kind/ordinal, DNS result counts/address family, redirect HTTP statuses,
header/body byte budgets, actual bytes, phase timings, caller/request/retrieval
deadline, decode failure, accepted dimensions and skipped duplicate/page/download
limits. Image storage, fallback generation and final retained/dropped totals are
recorded; failed optional search/art still permits a usable clip and fallback.

No raw stderr, arguments, provider text, prompts, transcripts, filenames, queries,
URLs, credentials or authentication payloads are serialized. Error strings and
nested causes are inspected in memory only. All output fields are fixed enums,
bounded numeric values, UUIDs, version digits or one-way fingerprints.

Checks (synthetic/fake/paid-off/no-key/network-blocked before imports, `envDir:
false`; no owner media, ignored env, real search/download or paid calls):

- **135 local cases pass** across CLI execution, Codex/Gemini adapters,
  diagnostics, clip batch and composition. Actual Node child failures exercise
  stderr/exit classification, provider/schema/rate/network categories, stdout
  overflow and owned cancellation. A composed fake CLI → web discovery → Codex
  image path preserves the original flag/exit failure under one request ID and
  successfully renders its local PNG fallback with exactly one search dispatch.
  Fatal/warning/malformed/unsafe/missing events and absent/linked/malformed output
  retain distinct diagnostics. Budget, reserved failure, sink exception and
  private-content exclusion assertions pass. Existing batch fallback/retry and
  provider isolation checks remain passing.
- **47 source cases pass** across failure classification, web pictures and
  public picture transport. Covers nested causes, unknown fingerprints, safe
  provider/schema/CLI identifiers, DNS-origin failure, redirect/status/body
  records, malformed versus empty discovery, candidate 403 followed by usable
  small raster, decode reasons, bounds/cancellation and URL/private-text exclusion.
  Both readable and broken Gemini error bodies preserve their HTTP status.
- **Three installed-CLI cases pass** against a local fake provider with a
  scratch profile, authentication disabled and exact request counts. The actual
  CLI's schema rejection retains `schema_rejected`/`invalid_json_schema` and its
  exit code; successful inference and actual web-search events retain counts.
  No owner sign-in or provider credits are used. These do not establish the
  real account's search availability.
- Contract/local/backend/root-test TypeScript, scoped ESLint, scoped Prettier,
  contracts/worker build and whitespace checks pass. One `no-unsafe-finally`
  finding was corrected by using a traced cleanup function; cleanup semantics
  and rejection are preserved. Final source/CLI reruns pass after nested-cause,
  successful-path efficiency and HTTP-error preservation refinements.

Read-only validate: **Meets ticket locally; no actionable findings.** Reviewed
the settled changes through the production composition, original process/error
boundaries, typed propagation, optional fallback/storage, bounded trace sink,
privacy, exact dispatches, resource/deadline/cleanup behavior and tests. Earlier
CL-168–172 changes remain preserved and excluded from this new claim. No UI or
provider model/retry setting changed. Unknown future vendor failures are
explicitly unknown with fingerprints; fake checks cannot certify live search.
Scope deviations: none.

Normal runtime was refreshed using verified ownership. The old nine-process
backend/watcher/worker tree and ports were checked absent before replacement.
Normal startup rebuilt contracts and the worker/overlay without configuration
changes. Frontend **4968/3000** remains; new supervisor **640**, API **7432/4000**,
worker **17216/4200** are verified. Health, `/start` and `/api/sample/config`
return 200. The owner's one completed clip recovered with no active work.
No processing or Find visuals action was invoked by the agent.

Active content-safe log and ownership paths (outside Git):

- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl173-app-af04aa6cd5c14c21892930220f7ebe9d\backend.stderr.log`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl173-app-af04aa6cd5c14c21892930220f7ebe9d\backend.stdout.log`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl173-app-af04aa6cd5c14c21892930220f7ebe9d\backend.runtime.json`

Changed files: shared `local/execution-diagnostics.ts`; backend
`src/diagnostics/execution-failure.ts` and its test; local `codex-exec`,
`codex-composition`, `codex-ai`, `provider-ai`, `provider-composition`, `clip-batch`
and `diagnostics`; source `web-pictures`, `public-picture-request` and
`gemini-image-search`; focused execution/diagnostics/web/transport tests and
`test/local-codex-cli.proof.ts`; this ticket, index and source-of-truth decision.

Owner real-provider run and diagnosis of its actual failure remain unchecked.
No real provider/download/cloud/configuration/deployment/Git action occurred.
All changes remain unstaged/uncommitted alongside prior work; index is empty.
