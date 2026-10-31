# CL-171 — Broad image discovery and explicit Find visuals

Status: Implemented; deterministic checks pass. Owner real-provider acceptance remains open. Depends on implemented CL-158, CL-167 and CL-170.

## Owner decision and scope

The 2026-10-31 owner requests broad web discovery for both Codex and Gemini,
then retrieval/decoding of candidate images, with generation only after search
cannot produce usable art. Commons is no longer the mandatory search source.
Do not reject otherwise decodable images for small dimensions, license metadata,
or brittle keyword quality gates. Keep proportional private-network, download,
decode and resource protection, cancellation and content-free reason logs.

Add an AI-logo Find visuals action in the current clip's Media/Pictures tab.
It explicitly requests fresh visual discovery for that clip with the currently
configured provider, including a restored session after a provider switch.
Preserve acknowledged clips, captions, focus, text, manual pictures, applied
edits, exports and recovery. No automatic retry or whole-clip failure on missing
art. Existing prepared words should avoid retranscription/frame work where
possible; changing provider must not invalidate the completed session.

## Implementation checklist

- Provider-specific broad search ports: Codex hosted web search in an isolated
  search request, and Gemini Google Search grounding. Decode bounded candidate
  image/page URLs; resolve actual image candidates rather than treating web
  citations as image bytes. Search-first applies to normal fresh preparation
  and explicit editor discovery, then existing provider-specific generation.
- Shared bounded public-image retrieval with redirects checked per hop,
  DNS/private-address checks, no cookies/auth forwarding, image decoding and
  existing raster size budgets. Small images are accepted. Report fixed reasons
  and candidate/attempt totals for every exit, never queries/URLs/private text.
- Version/revision-bound, deduplicated explicit visual action; bounded attempts,
  duplicate clicks dispatch once, no auto-resume/provider retry. Existing art is
  retained on misses/failure. Use current provider on restored completed clips.
- Shared design action and busy/error states, keyboard and desktop/phone layout.
  Existing dirty edit/apply and session recovery semantics stay coherent.
- Update the source of truth and narrow provider documentation for these
  superseding decisions; preserve historical ticket evidence.

## Verification and gates

Agent tests force synthetic/fake/paid-off before imports, without ignored env or
credentials and with external networking blocked. Test exact search/generation
dispatches for both providers, search hits/misses, malformed/corrupt/small art,
page image extraction, redirects/private hosts, cancellation and safe logs.
Test explicit action deduplication, stale revision, no-results preservation,
provider switch/restore, edit/export/recovery and responsive/busy states using
the current-source native/browser proof. Run scoped types/lint/format/contracts
build and a read-only validate pass, then refresh the normal backend/native
worker with verified ownership, leaving the frontend and owner session intact.

Fake mode works without keys using injected search/generation results; it does
not establish real hit rate or relevance. Real Codex requires the installed CLI,
ChatGPT sign-in and enabled local prerequisites; real Gemini requires its key
and existing live/transfer/image/paid approvals. Owner tests Codex first, then
requests the Gemini configuration switch. No agent real inference/search/media
download, config switch, deployment, cloud or Git mutation is authorized.

## Evidence

CL-179 consolidated verification updates the two root host capability expectations
to include the exact `visualDiscovery` true/false values; their protected/no-
dispatch assertions remain. The final 2,209-unit/849-local fake gates pass. Owner
real Codex search and retrieval succeeded after CL-176/177; real Gemini remains
owner-only acceptance. Local commit packaging supersedes historical unstaged notes.

- Broad Codex and Gemini discovery is composed on fresh preparation and the
  explicit editor action. Generic-brief search is isolated from transcript/video
  planning. Both admit actual downloaded rasters before fallback; no mandatory
  Commons source, minimum dimensions, license or keyword quality exclusion.
  Existing Commons assets/adapter stay compatible and inert in production
  composition. Gemini grounding is a separate request with its current configured
  model/key; generation keeps its existing model and approvals.
- `WebPictureSource` resolves direct image or page candidates, extracts page art,
  advances after bad candidates, and bounds 12 URLs/downloads/four pages. Search
  asks for 2–3 queries within one request (90s); retrieval has 25s total and 10s per
  request with up to three revalidated redirects. DNS answers are checked and
  pinned to sockets. No cookies or app credentials go to image hosts. Small
  rasters and supported animation frame one are accepted. Existing byte/pixel/
  raster limits remain. Search query counts are provider-managed, not a per-query
  billing guarantee. Hosted usage conservatively reserves the search/generation
  pair; the signed legacy path separately bounds three searches and three
  generation attempts within its global dispatch ceiling.
- Diagnostics distinguish no candidates, malformed candidates, no actual search,
  search failure, public-address refusal, HTTP failure/status, download limits,
  unsupported format, decode/raster limits, deadline and generation outcomes.
  Counts and fixed reasons contain no URLs, queries, transcripts, prompts,
  credentials or raw responses. `requests` counts app discovery requests rather
  than claiming the number of billable search queries. Log-sink failure remains
  nonfatal. The batch now also contains a thrown optional image/storage/decoder
  failure, keeping the rest of the clip reviewable without retrying AI.
- Media/Pictures has the shared Button/Sparkles Find visuals action, spinner,
  cancel, disabled dirty/busy/capacity states and recoverable miss/error copy.
  The revision-bound operation uses existing words only. Fresh AI art replaces
  the previous AI set after success, reusing visual slot IDs for linked sound
  cues. Uploaded pictures and their edits, other settings, base, old assets and
  exports remain. A miss/failure changes no art. Five bounded operation receipts
  survive restore, so an older request cannot redispatch after later misses.
  Interrupted pending search is marked failed on restore and never auto-resumed.
- Codex and Gemini share provider-ai session mode; a provider switch therefore
  uses new ports against the completed source/clip without rebuilding its session.
  Fake/real mode isolation remains. Recovery retains its existing two-hour window.

Verification (cached pinned pnpm 11.19.0, synthetic/fake/paid-off before imports,
no ignored environment reads, credential use or external requests):

- Local scoped suite: **123 cases** across provider/CLI/batch/composition/hosted/
  recovery modules pass; the **43-case batch rerun** passes after receipt and
  interrupted-state fixes. Covers exact search/fallback calls, malformed results,
  thrown/corrupt optional images without clip failure, uploaded-picture retention,
  stale revision, old/repeated operation IDs, cancellation and preserved exports.
- Backend search/generator/compiler/admission suite: **98 cases** pass, including
  an actual 24×12 synthetic raster, page-image extraction, bad-first-candidate
  advancement, HTTP 403 vs unsupported vector diagnostics, public DNS pinning,
  redirect-to-private refusal, download limits, missing search metadata and
  metered search-before-generation. Legacy source compatibility rerun is recorded
  below. Frontend long-running local bridge: **four cases** pass.
- Installed CLI: **three isolated fake-endpoint cases** pass, including completed
  web-search events and unchanged schema handling. No owner auth is used. The
  fake endpoint deliberately disables OpenAI authentication and therefore cannot
  establish search availability on the owner's signed-in account. An initial
  harness assertion about that fake tool catalog left a response unanswered;
  corrected the harness, removed temporary instrumentation, and proved cleanup.
  The experimental standalone runtime remains disabled; live hosted-search
  configuration is restricted to the explicit search request.
- Current-source browser/native proof: **94.04s, pass**. Actual Media CTA and busy
  state, synthetic Codex miss→illustration, native export of new art, saved restore,
  automatic recovery, then mocked Gemini search-hit (24×12) on the same recovered
  clip all pass with exact call counts. No repeated ASR, speaker pass, video
  transfer, preview build or inference occurs on restore. Desktop 1440px and
  phone 390/320px controls/footer captures inspected. First proof failure was an
  obsolete injected-model assertion requiring frames on transcript-only requests;
  corrected it and reran. Later HTTP-reason-only changes use the focused mock suite.
- Contract/local/backend/frontend/root-test TypeScript, scoped ESLint/Prettier,
  contracts build and whitespace checks pass. A precise new raster error required
  updating one legacy test's expected code; its rejection behavior is unchanged.
  The final **24-case legacy-source rerun passes**. The final Codex/batch
  **57-case rerun** also checks that transcript-only Codex planning is timed,
  owned by the provider lifecycle, aborted/joined on close and unavailable after
  close; earlier 123-case coverage remains intact.

Read-only validation: Meets ticket locally; no actionable findings after fixes.
Coverage reviewed against this whole packet: connected provider composition and
route/proxy/hosted admission, source/revision binding, bounded calls and media,
optional failure, old and interrupted receipts, uploaded pictures/audio linkage,
preview/export/save/recovery, privacy, dependency direction and listener/process/
request/Sharp/temp cleanup. The retry-state and Codex planning-lifecycle findings were independently
confirmed, fixed and checked with the 43/57-case focused suites. No unrelated audit or
approval was inferred. Scope deviations: none.

Real Codex search availability/hit rate, Gemini grounded search, provider taste,
media/rights suitability and owner visual/hosted/release acceptance remain
unchecked. Real Codex requires installed CLI, ChatGPT sign-in/search access and
local prerequisites; Gemini requires its key/live/transfer/image/paid approvals.
Fake results prove mechanics only. No real agent search/download/AI processing,
config switch, cloud, stage/commit/push or deployment was performed.


## Normal runtime handoff

Verified owner idle before shutdown; stopped each captured nine-process backend
supervisor/watcher/API/worker tree and checked identity/stabilization/ports before
replacement. Preserved all earlier logs, frontend PID 4968/3000, owner media and
saved/recovery state. Normal startup rebuilt contracts and the internal worker/
overlay using unchanged owner-managed configuration. Final watch reload is
verified: supervisor 15412, API 20696/4000 and worker 24528/4200 belong to the
recorded tree. Health, `/start` and `/api/sample/config` return 200. Codex is ready,
visual discovery is enabled, and the owner's one completed clip recovered with
no active work or processing request. Frontend remains at
`http://localhost:3000/start`. No AI-provider switch was made.

Content-free final records/logs outside Git:

- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl171-app-b9f962f092b34e8abdf765a119b4c48f\backend.runtime.json`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl171-app-b9f962f092b34e8abdf765a119b4c48f\backend.stdout.log`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl171-app-b9f962f092b34e8abdf765a119b4c48f\backend.stderr.log`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-local-runtime-kg8wOc\worker.stderr.log`

Earlier refresh records/logs remain preserved. Abandoned synthetic CLI-proof
scratch was removed only after verifying its exact OS-temp target and absence
of any process referencing it. Current synthetic native/CLI proofs clean their
owned processes, listeners and scratch. All implementation/documentation changes
remain unstaged/uncommitted alongside preserved CL-168–170 work; index is empty.
