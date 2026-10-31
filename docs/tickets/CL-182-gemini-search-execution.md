# CL-182 — observable Gemini search execution and retrieval

Owner instruction, 2026-10-31: fix actual Gemini image search rather than only
its prompt; learn from CL-176's protocol/tool verification; distinguish skipped
search from missing metadata; validate offline/fake with zero paid calls and
hand back only after the actual request-to-image path is verified. Do not deploy.
Preserve all current CL-180/181 unstaged work, owner clips, generated/retrieved
assets, audio, attempt history, Gemini selection and other configuration.

## Confirmed baseline and decision

The owner's Gemini run retained both plans but generated two fallback images.
Both search requests were classified `search_not_attempted` solely because
`candidates[0].groundingMetadata.webSearchQueries` was absent. Zero image
downloads occurred. That log cannot prove whether Google executed a search.
The adapter never observed tool-call/result evidence.

Use the current documented stateless Interactions search protocol, already used
elsewhere for transcription, with the configured Gemini model and Google Search
tool. Decode explicit `google_search_call` / `google_search_result` steps,
reported search usage and grounded URL citations. This is a wire/execution and
decoder correction, not a prompt-only revision or a claim that the supported
legacy endpoint itself is broken. Search remains one bounded request per visual;
no automatic retry, additional provider/model, history storage or hidden fallback.

Do not add `tool_choice=any` as an unsupported guarantee: Google's current
function-calling documentation constrains function calls, while a firsthand
3.7/3.8 built-in Search looping/error report is acknowledged by Google. Use the
documented Search request and verify completed execution, never a remembered URL
or the model's claim that it searched. Unknown evidence remains explicitly unknown.

Primary references checked with the installed @google/genai 2.25.0 types:

- [Google Search protocol and response steps](https://ai.google.dev/gemini-api/docs/google-search)
- [Interactions REST reference](https://ai.google.dev/api/interactions-api)
- [Stateless storage control](https://ai.google.dev/gemini-api/docs/interactions-overview)
- [Function calling controls](https://ai.google.dev/gemini-api/docs/function-calling)
- [Acknowledged built-in Search/forced-tool issue](https://discuss.ai.google.dev/t/interactions-api-http-400-model-generated-too-many-tool-calls-with-built-in-google-search-and-tool-choice-any-on-gemini-3-7-3-8-flash/187486)

## Acceptance and file allocation

- [x] Production Gemini discovery uses the supported Search wire shape, same
      model/key/gates, `store=false`, no streaming/background work or retries.
- [x] Verify completed matching search calls/results or affirmative provider
      search usage before admitting candidates. Distinguish complete no-results,
      skipped, started-only, failed tool, missing/inconsistent telemetry and
      malformed/HTTP/timeout/canceled responses. Do not label unknown as skipped.
- [x] Preserve grounded candidates/citations when optional query-summary metadata
      is absent; actual public byte/download/decode admission remains unchanged.
- [x] Originating logs include safe protocol/settings/status flags, bounded
      visible call/result/query/usage/citation/output counts and exact evidence
      classification, correlated with the existing retrieval/fallback logs.
      No queries, URLs, prompts, raw errors, response bodies, thought text or
      provider IDs in ordinary logs or committed artifacts.
- [x] A production-request regression rejects the old wire/protocol for the new endpoint before
      emitting fake search results. An offline protocol endpoint validates the
      actual request and exercises search steps through retrieved raster output,
      failure/no-search/missing-metadata/cancel paths and exact dispatch counts.
- [x] Focused fake/no-network suites, relevant types/lint/format and read-only
      validation pass. Refresh only the verified idle backend/native worker;
      preserve frontend/session/media and leave Gemini ready for an explicit retry.

Owned source files: `apps/backend/src/assembly/gemini-image-search.ts` and its
focused tests; shared `web-pictures.ts` / tests for precise failure reasons;
safe diagnostics schemas/classifier/tests; `apps/backend/local/provider-composition.ts`
and legacy composition only as needed to connect originating diagnostics.
New bounded search decoder/proof modules only if required by the implementation.
Concrete additions: `apps/backend/src/assembly/gemini-search-response.ts`,
`gemini-image-search.test.ts`, and `test/local-gemini-search.proof.ts` for the
typed production request, step/usage decoder and validated loopback protocol.
Legacy originating traces use the existing bounded AnalysisDiagnostics envelope
through its shared validated execution-trace schema, with a focused regression.
`picture-raster.ts` owns the bounded-body error code: preserve a precise size-limit
failure instead of collapsing it into an unavailable-image code.
Documentation: this packet, index, source of truth, narrow backend guide and
release handoff. Allocate additions here before editing them.

All agent tests force fake/paid-off before imports and use synthetic fixtures,
injected/loopback transports, no ignored environment reads or API keys and
blocked external application networking. Public official documentation reads
are separate from app/provider testing. Real authenticated Google Search behavior
and image relevance remain owner acceptance; do not invent live certainty from
fake responses. No configuration/Git/cloud/deployment action is authorized.

## Evidence

Implementation and fake validation complete; owner live acceptance remains open.
The previous supported generateContent endpoint is not declared broken. The new
endpoint's protocol is separately typed against installed @google/genai 2.25.0,
compared with its real serializer, and validated before synthetic tool execution.

Checks run with pinned Node 24.22.1 / pnpm 11.19.0:

- Backend Vitest with `apps/backend/vitest.config.ts`: 84/84 focused cases in
  `gemini-image-search.test.ts`, `web-pictures.test.ts`,
  `execution-failure.test.ts`, `analysis.diagnostics.test.ts`.
- Local Vitest with `scripts/local-test.config.ts`: 118/118 provider-composition,
  provider-ai, Codex-ai, clip-batch and diagnostics cases. Search precedes
  generation, optional lookup/bad-raster failures preserve the clip, existing
  visuals/audio survive misses/cancellation and no automatic retry occurs.
- `scripts/local-proof.config.ts test/local-gemini-search.proof.ts`: 7/7.
  Two arbitrary synthetic subjects pass actual request validation, fake search
  execution and HTTP raster retrieval/conversion. Old protocol is rejected
  before fake execution; skipped, metadata-missing, incomplete and failed tool
  responses prevent downloads; in-flight cancellation dispatches once and drains.
  Search/image call counts are exact. No generated fallback in successful proof.
- Backend typecheck, `tsconfig.local.json`, `tsconfig.tests.json` and contracts
  `tsconfig.local.json` pass. Scoped ESLint and Prettier plus `git diff --check`
  pass. Reports remain ignored under `.local-build/cl182-{focused,local,protocol}.json`.

First focused run exposed two assertions (the existing log parser returns a
validated string, and the bounded-body helper hid the size-limit code) plus an
optional return-type error. Corrected and rechecked the affected suites/types.
Test fixtures and wire rejection never contact Google or download a real image.

Read-only validate: **Meets ticket; no actionable findings.** Reviewed the
unstaged CL-182 source, new modules/proof, safe contracts, production composition,
failure/fallback path and documentation. Existing CL-180/181 changes are preserved
and excluded from this verdict. Covered request/evidence/citation preservation,
precise private-safe logs, resource limits, no retry, cancellation/cleanup and
fake gates. Authenticated Google execution/relevance remains unverified, as
required by the no-paid-calls constraint. No configuration/Git/deployment change.

Normal backend/internal worker were refreshed through verified process-tree
shutdown, port release/stabilization and canonical `dev:backend` startup. Previous
supervisor 25080 and eight owned descendants are absent. New supervisor 12920,
API 9260 on 4000 and worker 2560 on 4200 are owned and healthy. Frontend 4968 on
3000 remains. Health, `/start` and `/api/sample/config` return 200. Both idle clips
remain in their original states; a SHA-256 comparison of the entire clip-list
response matches before/after. No owner processing action was triggered.

Content-safe stdout/stderr and runtime ownership:
`C:/Users/minat/AppData/Local/Temp/clipbuilder-cl182-app-24f35a7b2239488baef704ce1191df4c/`
(`backend.stdout.log`, `backend.stderr.log`, `backend.runtime.json`).

- [x] Owner explicitly retried Find visuals; read-only inspection of the existing
      run confirms actual Search execution and retrieved image storage. No Start
      over or attempt-counter reset was performed.
- [ ] Owner acceptance of image relevance/editorial quality remains separate.
- [x] CL-183 fresh current-source Linux frontend/backend builds, packaged offline
      entrypoints and 500-MiB synthetic editor/export/cleanup walkthrough pass.
      No paid/provider call or deployment; real hosted acceptance remains open.

Deviation: none. Source/docs remain unstaged/uncommitted; preserved prior work is
untouched. No paid/provider/cloud call, ignored configuration read/edit or real
image download was made by this execution.

## Subsequent owner-run observation

The owner explicitly ran Find visuals again. Read-only content-free logs verify
three completed Search requests, six matched Google Search call/result pairs
and twelve reported queries, zero failed tool results or missing metadata. The
requests returned 8, 8 and 9 candidates. The first download in each succeeded
with HTTP 200, decoded and stored as `retrieved`; all three plans were retained,
none dropped and no fallback event occurred. Existing workspace state contains
three newly retrieved assets alongside the two retained earlier generated assets.
The 104.4-second action included 52.0 seconds planning and approximately 52.4
seconds search/retrieval/storage. This is observed live execution, not a new
agent-triggered request or a broad image-quality/release acceptance claim. Raw
queries, URLs, provider IDs, output and owner media remain outside Git.

The owner subsequently authorizes staging/local commits and fresh fake Linux
packaging under CL-183 and its whole-file plan. Earlier unstaged handoff statements
remain historical; no push or deployment is authorized.
