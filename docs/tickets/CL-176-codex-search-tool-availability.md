# CL-176 — Codex search tool availability

Status: Implemented and fake-validated; ready for owner Find visuals acceptance.
Depends on implemented CL-171, CL-173–175.

Owner follow-up: the next real run confirmed six completed search calls and
22 candidate URLs, proving search now executes. All downloads failed at a shared
native lookup callback; [CL-177](CL-177-native-image-download-lookup.md) owns its
separate transport fix and preserves the current clip/session.

## Owner request

Fix actual Codex search-tool availability, rather than only changing prompts.
Validate in fake mode with no paid calls. Demonstrate the ability to search for
an image and retrieve a candidate before asking the owner to use Find visuals.

## Scope and acceptance

- Diagnose the installed CLI's actual outgoing tool catalog. Correct the search
  request/runtime configuration using supported controls. Search-only requests
  must expose a callable broad web-search tool; ordinary media planning retains
  tool isolation. Keep ChatGPT subscription authentication and provider isolation.
- Add an installed-CLI regression that fails on the current missing tool and
  asserts actual advertised tool availability before a fake search result is
  emitted. Exercise tool execution/result handling and synthetic raster retrieval,
  including an arbitrary generic image brief, missing-tool/no-search handling,
  original structured diagnostics and nonfatal fallback.
- Preserve strict output schemas, tolerant candidate decoding, bounded input,
  deadlines, cancellation and owned process/temp cleanup. No shell, arbitrary
  files, browser, apps/MCP, automatic provider retry or Gemini fallback. A narrow
  search runtime change is allowed if required by the installed CLI; document
  the supported tool protocol and preserve isolation.
- All agent verification remains synthetic/fake/paid-off, no API keys or ignored
  environment reads and no real provider/search/image downloads. Use isolated
  CLI profiles and loopback fake endpoints. Do not claim live image quality or
  authenticated account availability from fake results.
- Run focused tests/proof, relevant types/lint/format and a read-only validate
  pass; update the narrow owning architecture/source documentation if changed.
  Refresh the normal backend/worker with verified ownership and health checks,
  preserving the frontend, current clip/assets/attempts and all configuration.
  No Git mutation, configuration edit, cloud or deployment action.

Fake mode requires no keys and must prove actual request/tool mechanics. Real
Codex uses the existing installed CLI and owner ChatGPT sign-in. Only the owner
can perform real inference/search acceptance under the existing live gates.

## Evidence

### Confirmed cause and correction — 2026-10-31

The installed CLI is `0.166.0-alpha.5.1`. Its bundled default model requires
Code Mode. The bridge disabled `code_mode_host`, leaving advertised nested
`tools.web__run` unusable. A real local host invocation against a fake provider
returned **code-mode host is disabled**. CL-175's inspection only listed outer
tool names and missed the nested executable definition. Its conclusion that no
search tool was exposed is superseded: the tool was advertised but its required
host had been disabled. Prompt changes alone could not fix this.

- `apps/backend/local/codex-exec.ts` enables Code Mode and its installed host
  only for explicit search requests. The executor excludes `functions`,
  `image_gen`, `clock` and `collaboration`; agents/plugins and existing shell,
  apps/MCP/browser flags stay disabled. Other planning calls retain host/tool
  isolation. No model override, downloaded runtime, owner configuration/auth
  change or experimental standalone feature is used.
- `codex-composition.ts` names the actual `functions.exec` → `tools.web__run`
  callable path, including broad image/general search. The existing generic-only
  briefs, alternate queries, limits and search-first retrieval remain.
- Search evidence now requires a completed event. A started-only search becomes
  `search_incomplete`, rather than accepting plausible returned URLs as proof
  of a successful search. The shared diagnostic enum/classifier and tests cover
  this fixed reason. Disabled-host warnings become `cli_configuration` with the
  precise longest matching `code_mode_host` option. No raw error text is logged.
- `test/local-codex-search.proof.ts` inspects the real outgoing nested definition,
  sends a Code Mode call to the actual host, receives its real search request at
  the fake service and returns its result to the model loop before candidate
  decoding/raster retrieval. The fake model never injects a web-search event;
  the CLI emits it from actual tool execution. The script verifies excluded
  shell/file/generation tools are physically unavailable, not only undocumented.

The [official configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
documents the Code Mode executor exclusions and feature configuration. The
[official search guide](https://learn.chatgpt.com/docs/web-search) documents live
search and the CLI search events. Local installed-binary evidence establishes
the specific default-model/host behavior; no unsupported API tool-choice control
or speculative model-catalog patch was shipped.

### Fake-mode verification

All tests installed fake/paid-off settings before imports with `envDir: false`,
synthetic data and blocked external network. The search proof uses an isolated
synthetic ChatGPT-format sign-in file, bundled public model metadata without a
refresh, loopback inference/search services and an outbound-denying loopback
proxy. It never reads the owner's credentials. Image bytes are injected, with no
actual public image download. Exactly one discovery agent turn makes two expected
fake model-loop requests around one fake search request; these are tool handling,
not automatic inference retries.

- `corepack pnpm local:proof test/local-codex-search.proof.ts test/local-codex-cli.proof.ts`:
  **11 passed**. Six new cases cover successful broad image searches for two
  distinct arbitrary briefs, the old disabled host, unavailable search function,
  failed search and cancellation. Successful cases emit one started/completed
  search pair and retrieve one 16×16 raster. Negative cases retrieve zero images;
  the disabled host reports its actual failure. Five prior schema regressions
  still pass. Owned call directories and listeners close after every case.
- `corepack pnpm local:test apps/backend/local/codex-exec.test.ts apps/backend/local/codex-ai.test.ts apps/backend/local/provider-ai.test.ts apps/backend/local/diagnostics.test.ts`:
  **92 passed**, covering nonfatal fallback, request counts, provider isolation,
  diagnostics, actual child failure/timeout and cleanup.
- `corepack pnpm --filter @clipbuilder/backend exec vitest run src/assembly/web-pictures.test.ts src/diagnostics/execution-failure.test.ts`:
  **44 passed**, including exact Gemini tool configuration, usable small images,
  retrieval/decoding, precise disabled-host classification and incomplete search.
- `corepack pnpm local:typecheck`, scoped ESLint, Prettier and `git diff --check`
  passed. No UI geometry changed; no unrelated frontend/build audit was claimed.

### Runtime handoff

Normal backend/worker rebuilt and refreshed with existing configuration;
frontend **4968** on **3000** preserved. The Windows PowerShell wrapper treated
normal build stderr as an error after verified shutdown; the build/launch was
completed using normal PowerShell native-command handling, with no configuration
change. New supervisor **18616**, API **11552** on **4000**, worker **10136** on
**4200**. Health, `/start` and `/api/sample/config` returned **200**.

`http://localhost:3000/start` retained one inactive `validated-revision` clip,
ready preview, nine assets and **three** visual attempts. No attempt/history
reset or real processing request occurred. The next owner attempt remains an
explicit normal Find visuals action.

Content-safe runtime record and separate `backend.stdout.log` /
`backend.stderr.log`:
`C:/Users/minat/AppData/Local/Temp/clipbuilder-cl176-app-cb9f1b9924fb42ff86c1f2cca61d81e8/`.

### Read-only validate pass

TL;DR: actual search execution is restored and fake-proven; real service results
remain the owner's test. **Verdict: Meets ticket. No actionable findings.**

- **Covered:** actual production flags and nested callable exposure/execution,
  old-host negative regression, two generic image briefs, retrieval, schema and
  completion-evidence checks, nonfatal fallback, exact fake calls, isolation,
  deadline/cancellation/cleanup, source/architecture records and healthy runtime
  preserving the clip/assets/attempt history.
- **Unverified:** real owner-account service access, actual image relevance and
  personal visual acceptance. These require the existing ChatGPT sign-in/live
  gates and an owner action; fake results establish mechanics, not live quality.
- **Scope:** relevant unstaged/untracked CL-176 changes and neighboring production
  wiring. The index is empty; earlier CL-168–175 work is preserved and excluded
  from this verdict. No staging, commit or other Git mutation occurred.
- **Deviations:** none. The root cause was an unusable advertised tool rather
  than a missing definition. No app-server migration or model-catalog override
  was needed. Exploratory alternatives were not shipped.

Fake mode needs no API keys. Real Codex continues to use the owner's existing
CLI/ChatGPT sign-in and local prerequisites; Gemini continues to require its
existing key/live approvals and was not switched or invoked. No agent-run real
search, download, provider spend, credential/configuration change, cloud action
or deployment occurred. Ready for owner Find visuals retry.
