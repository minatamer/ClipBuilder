# CL-177 — Native image download lookup

Status: Implemented and fake-validated; ready for owner retry on the same clip.
Depends on implemented CL-171, CL-173 and CL-176.

## Owner request and confirmed failure

Fix image downloads after the latest owner Find visuals run. Keep the current
session; starting over cannot repair a transport bug. Preserve search-first
retrieval and nonfatal fallback. Agent checks remain fake/paid-off with no real
search/provider/image download, configuration/cloud/deployment or Git action.

The owner run completed six search calls across three discovery requests,
returned 6/8/8 candidates and attempted all 22 downloads. DNS validation passed
for all 22, but every HTTP attempt failed before headers/body/decoding. All had
the same 29-byte error fingerprint. A network-free Node socket probe using a
synthetic hostname and loopback target reproduced `ERR_INVALID_IP_ADDRESS` /
`Invalid IP address: undefined` with the exact fingerprint. The custom pinned
DNS callback returns a single string even when Node requests `all: true` for
address-family selection. Three generated fallbacks were retained; zero plans
were dropped. The completed session has four visual attempts and twelve retained
generated assets. Do not reset its history or remove its assets.

## Scope and acceptance

- Correct the native lookup callback contract for single/all-address requests.
  Return validated pinned answers, allow Node to select between those answers
  and retain public-only DNS/redirect checks, byte/deadline/abort bounds, no
  cookies/credentials/proxy and safe cleanup. Do not bypass TLS or add unrelated
  download services, shell tooling, domains, provider retries or spend.
- Add a regression exercising Node's real HTTP/socket client against a local
  synthetic image server. Inject synthetic DNS and map the checked public test
  addresses to loopback only within the test transport. Prove the old callback
  fails and the fixed pipeline downloads, decodes and returns a retrieved raster
  without fallback. Cover single/all lookup, mixed/public-private rejection,
  redirects, failed bodies and cancellation/cleanup using focused existing tests.
- Recognize `ERR_INVALID_IP_ADDRESS` in content-free structured diagnostics and
  test the known failure without logging private hostnames/URLs/error text.
- Run the focused backend tests, relevant types/lint/format and read-only
  validation. Rebuild/refresh the normal backend/worker with verified ownership,
  preserve frontend/session/assets/attempts/configuration, and verify readiness.
  Hand back for retry on the same clip only after the native fake download proof.

Fake verification requires no keys and establishes transport/decoder mechanics;
real host availability, remote image relevance and owner visual acceptance remain
unverified until the owner's normal action with existing prerequisites/live gates.

## Evidence

### Fix

- `apps/backend/src/assembly/public-picture-request.ts`: return the validated
  address array when Node requests `all: true`; preserve scalar address/family
  for single-address requests. All peers are checked before this callback. Node
  can perform family selection over those pinned peers without re-resolving DNS.
  No TLS/public-address/redirect/resource restriction was weakened.
- `public-picture-request.test.ts`: native Node HTTP client talks to a real
  loopback fixture server and passes through the production DNS callback shape.
  Only the test transport maps the checked synthetic public peers to loopback;
  production public-DNS validation remains active. WebPictureSource then decodes
  the downloaded PNG and returns a 24×12 retrieved image. A third native case
  aborts during the body and observes the remote connection close before cleanup.
- Shared execution diagnostics admit `ERR_INVALID_IP_ADDRESS`; the classifier
  reports it as a DNS/lookup error, with the recognized code and fingerprint.
  Tests cover the exact error and content-free output. The architecture guide
  documents the callback contract and native verification boundary.

### Regression evidence and fake checks — 2026-10-31

Before the fix, the native client regression **failed for all-address lookup**
and passed for single-address lookup. The separate socket probe produced
`ERR_INVALID_IP_ADDRESS` with the exact fingerprint from all 22 owner failures.
The corrected code passes both modes and mid-body cancellation. This exercises
the Node callback consumer that the previous mocked transport checks missed.

- `corepack pnpm --filter @clipbuilder/backend exec vitest run src/assembly/public-picture-request.test.ts src/assembly/web-pictures.test.ts src/diagnostics/execution-failure.test.ts`:
  **52 passed**. Covers native download/decode/cancel, checked DNS/redirects,
  mixed private/public rejection, body limits/close, small rasters, search/retrieval
  behavior and precise failure classification.
- `corepack pnpm local:test apps/backend/local/codex-exec.test.ts apps/backend/local/diagnostics.test.ts`:
  **38 passed**. Covers current tool isolation/search evidence, child deadlines,
  cleanup and structured diagnostic validation. CL-176's unchanged installed-CLI
  execution proof remains its preceding evidence, not a newly claimed real run.
- `corepack pnpm local:typecheck`,
  `corepack pnpm --filter @clipbuilder/backend typecheck`, scoped ESLint,
  Prettier and `git diff --check`: **passed**.

All checks use synthetic/fake/paid-off setup before imports, `envDir: false` and
external-network interception. The new tests open only loopback fixture sockets;
all provider/discovery data and raster bytes are synthetic. No API keys, owner
media, ignored configuration, provider, real search/image download or cloud were
used. Every fixture server/connection is closed. No new application listener,
timer, retry, dependency or service was introduced by the fix.

### Verified runtime handoff

Normal backend/worker rebuilt and refreshed with unchanged configuration and
verified old-tree shutdown. New supervisor **17980**, API **15972** on **4000**,
worker **10372** on **4200**. Frontend **4968** on **3000** preserved. Health,
`/start` and `/api/sample/config` returned **200** at
`http://localhost:3000/start`.

Recovery retained one inactive `validated-revision` clip, ready preview,
**12 assets** and **four visual attempts**. No history reset, media deletion or
processing request occurred. The owner can use Find visuals on the same clip;
Start over is unnecessary.

Content-safe runtime record and separate `backend.stdout.log` /
`backend.stderr.log`:
`C:/Users/minat/AppData/Local/Temp/clipbuilder-cl177-app-524942feb5074884a003a34ef748d4ac/`.

### Read-only validate pass

TL;DR: the exact owner download failure is reproduced, corrected and verified
through the native client. **Verdict: Meets ticket. No actionable findings.**

- **Covered:** single/all callback contract, pinned checked addresses and family
  selection; actual native download → raster decode → retrieved result; negative
  pre-fix regression; abort/close, redirect/private-address/body limits; diagnostic
  code/privacy; documentation, types/lint/format and healthy session-preserving
  normal refresh. Existing optional fallback remains unchanged and nonfatal.
- **Unverified:** actual remote hosts' availability/HTTP responses, real image
  relevance and personal visual acceptance after the fix. Only the owner's
  explicit real-mode retry tests these with the existing live gates. No fake
  result is claimed as a real image download.
- **Scope:** the five touched source/test/contract files, narrow architecture
  note and ticket/index; earlier CL-168–176 work remains preserved. The index is
  empty. No staging, commit, other Git mutation or deployment occurred.
- **Deviations:** none. A callback repair was sufficient; no alternate downloader,
  extra inference, configuration change or safety bypass was needed.

Fake mode needs no keys and now proves the native retrieval/decoder mechanics.
Real Codex still uses the existing CLI/ChatGPT sign-in; Gemini still requires its
key/live approvals if explicitly selected. No provider was switched or invoked
by the agent. Ready for owner Find visuals retry on the current clip.
