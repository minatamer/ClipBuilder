# CL-175 — Explicit provider image search

Status: Prompt revision implemented and fake-validated. Owner real-search
acceptance remains open. Depends on implemented CL-171, CL-173 and CL-174.

Follow-up: [CL-176](CL-176-codex-search-tool-availability.md) supersedes the
tool-exposure limit below. The earlier inspection missed the search declaration
nested inside Code Mode. Its advertised function failed because the bridge
disabled the required host; CL-176 fixes and proves actual local host dispatch
through a fake search service before owner retry.

## Owner request

After the schema fix, three real Codex requests completed without a web-search
event and used optional illustrations. The owner requests another revision that
explicitly tells both Codex and Gemini to use search. Strengthen provider-specific
instructions and verify the real outgoing tool configuration, not only fabricated
response events. Preserve search-first retrieval, strict wire schema, tolerant
candidate decoding, original diagnostics and nonfatal fallback.

## Scope and checks

- Require a real provider search tool invocation before returning candidate JSON;
  no remembered/invented URLs or claimed search without tool use. Use the main
  generic query and a distinct same-subject alternative within existing bounds.
  Empty search results are valid only after an actual search. An unavailable
  tool must be distinguished from a completed empty search where feasible.
- Keep Codex's no-shell/no-app/no-MCP isolation and Gemini's Google Search tool.
  Inspect advertised tools using the installed CLI against a loopback fake
  provider, and fix a confirmed request-configuration issue within this scope.
  Do not invent unsupported tool-choice options or migrate provider APIs/models.
- Validate both exact outgoing prompts/tools and search-evidence guards. A model
  that skips search must not produce retrieved assets. Preserve optional fallback
  and exact dispatch counts; no automatic inference/provider retry or extra call.
- All tests use fake/paid-off/no-key/network-blocked setup before imports and
  `envDir: false`, synthetic media and isolated CLI profiles only. No real
  provider/search/download/configuration/cloud/Git/deployment action.
- Run focused unit/installed-CLI checks, scoped types/lint/format, read-only
  validation and a verified normal backend/worker refresh preserving the frontend,
  clip, prior images and attempt history. Then hand back for owner retry.

Fake tests establish request/tool mechanics, not live availability or editorial
quality. Real Codex needs the existing CLI/ChatGPT sign-in/local prerequisites;
Gemini needs its key and existing approvals. Only the owner runs real searches.
Document any provider control that cannot guarantee a tool invocation rather
than claiming that prompt wording forces one at the API level.

## Evidence

### Implementation

- `apps/backend/src/assembly/web-pictures.ts` now explicitly requires invoking
  search before candidate JSON, including a distinct alternate query. Prior
  knowledge, invented URLs and descriptions of a search do not satisfy the task.
  An unavailable tool must not be described as a completed empty search.
- `apps/backend/local/codex-composition.ts` adds an explicit Codex search command
  to the production request builder. `gemini-image-search.ts` names Google's
  `google_search` tool in both system and user instructions and continues to
  advertise it in `tools`. No provider/model/configuration change was made.
- Existing search-evidence checks remain: a skipped search is logged as
  `image_search_not_attempted`, even if candidate URLs were supplied. This is
  optional visual discovery; it never aborts the clip flow. Existing fallback,
  assets, attempt limits and zero automatic provider retry remain intact.

### Fake verification — 2026-10-31

All commands used the pinned package manager, synthetic data, fake/paid-off
setup before imports, no ignored environment-file reads and blocked external
network. The installed CLI used an isolated profile and loopback fake endpoint
without authentication; raster retrieval used an injected synthetic image.

- `corepack pnpm --filter @clipbuilder/backend exec vitest run src/assembly/web-pictures.test.ts`:
  **26 passed**. Exact Gemini request assertions cover the explicit system/user
  instructions and Google tool advertisement. Returned URLs without grounding
  metadata still fail discovery with exactly one request per invocation.
- `corepack pnpm local:test apps/backend/local/codex-exec.test.ts apps/backend/local/codex-ai.test.ts apps/backend/local/provider-ai.test.ts`:
  **82 passed**, including skipped-search diagnostics, nonfatal visual fallback,
  provider isolation, fixed dispatch counts and cleanup.
- `corepack pnpm local:proof test/local-codex-cli.proof.ts`: **5 passed**.
  The actual production search request reaching the fake endpoint contains the
  new explicit instruction and closed schema. A synthetic search event exercises
  decoding/retrieval; it does **not** establish that a real tool was exposed or
  called. Both old object-closure defects still fail independently.
- `corepack pnpm local:typecheck`, ESLint and Prettier for the five touched
  source/test files passed. Ticket/index formatting passed.

### Tool-exposure limit

Additional ignored, loopback-only CLI probes inspected the actual request rather
than only returned events. In this authentication-disabled composition, tools
were advertised through an `additional_tools` input item containing generic
runtime namespaces; no native `web_search` entry was present. Supported search
and provider-capability variations did not establish native tool exposure.
These probes cannot establish the tool catalog of an authenticated owner run.
An additional built-in-provider probe timed out and is not passing evidence.
All probe children/listeners were cleaned up; speculative flags were not shipped.

The [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
documents enabling live search, while
[Gemini Google Search documentation](https://ai.google.dev/gemini-api/docs/google-search)
describes provider-managed search. No supported forced tool-choice control was
established for the current CLI and Gemini request shapes. This revision makes
the instructions explicit and verifies skipped-search handling; wording alone
cannot guarantee tool invocation or repair an unavailable tool. Authenticated
Codex search availability and real Gemini grounding remain unverified.

### Runtime and read-only validation

The normal backend/worker was rebuilt and refreshed with unchanged configuration;
frontend PID **4968** was preserved. Graceful Windows shutdown reported an exit
error; identity-checked cleanup removed the old tree and verified stable empty
backend ports before replacement. New supervisor **6660**, API **3160** on
**4000**, worker **20892** on **4200**. Health, `/start` and `/api/sample/config`
returned **200** at `http://localhost:3000/start`. Recovery retained one inactive
`validated-revision` clip, ready preview, nine assets and three prior visual
attempts. No real processing action was triggered.

Content-safe runtime record and stdout/stderr logs are under
`C:/Users/minat/AppData/Local/Temp/clipbuilder-cl175-app-44c03707a409430e90f13d7b48fb4c0b/`.

Read-only validate pass: **Meets ticket with concerns**. No actionable code
findings in the prompt/test revision. Covered: both production paths, exact
outgoing instructions, Gemini tool advertisement, search evidence, nonfatal
fallback, isolation and cleanup. Partial: CLI tool-exposure diagnosis; no
supported correction was demonstrated in the offline profile. Unverified:
authenticated search availability, real image relevance and owner visual
acceptance. Reviewed the relevant unstaged/untracked files and empty index;
unrelated pre-existing CL-168–174 changes were excluded from this verdict.

Fake mode needs no keys and proves synthetic request/decoder behavior only.
Real Codex requires its existing CLI/ChatGPT sign-in and local prerequisites;
real Gemini requires its API key, live gates and applicable owner approvals.
No agent-run real search, download, provider spend, configuration, cloud, Git or
deployment action occurred. The owner may test the revised prompts; a successful
real search must be confirmed by the existing invocation/retrieval logs.
