# CL-021 — Let the existing chat agent make validated local edits

Status: locally implemented and verified; 146 owner tests, three native proofs,
1,502 root tests in 125 files, all five root gates and 1,490-file public
artifact exclusion pass. Read-only revalidation has no actionable findings.
Owner real-media/live acceptance remains open. The owner authorized fake/synthetic
implementation, validation loops and ticket commits on 2026-10-22.
No paid/provider/cloud/real YouTube calls.
Dependencies: CL-017 protected local composition/lifecycle; CL-019 stable clip
identities; CL-020 shared edit use case and revision-bound export.

## Objective and value

Let the owner say, for example, "move this clip's captions higher and use my
second picture," and let the existing agent apply it without clicking the UI.
The local preview reflects the same edit and can export the chosen revision. No
new chatbot, model-powered editor service or custom hosted MCP server.

## Interface and ownership

Prefer a thin local CLI in backend ownership calling the same protected local
use cases as the UI. The fixed renderer remains in renderer ownership; never
import another app's source. Research and architecture context are in the
[research note](../research/LOCAL_OWNER_WORKFLOW_2026-10-22.md).

The browser UI need not be open. The CLI can use the protected local owner core
in a headless session and perform the same bounded edit/export operations; it
must not depend on a hosted page, computer-use clicking or an extra model
service. The local host still follows CL-017's explicit lifecycle and
authorization rules. Opening the UI later reads the authoritative live revision
within that session.

Specify commands to inspect safe workspace/clip status, list asset IDs, import
an explicitly supplied local picture, validate/apply bounded edits, inspect the
resulting revision, request a deterministic local render, poll status and
cancel. The implemented command surface is `corepack pnpm owner:agent`, built
separately under `.owner-build`; it reads one bounded stdin JSON command. A
structured patch file contains allowed caption/visual operations and an expected
revision. Unknown commands/properties, arbitrary shell commands, compositions,
paths, provider prompts and remote URLs are rejected before side effects.

Keep one authoritative writer/operation coordinator. A CLI must not edit live
JSON files behind the UI's back. Command IDs and expected revisions give
idempotence and stale-write detection; UI/CLI conflicts return safe errors. Use
a private per-run transport capability resolved internally without printing or
placing it on process command lines. Do not turn loopback into anonymous
authority, allow LAN binding or weaken Host/Origin protection for browser
clients.

## Agent workflow, data and authorization

For a later authorized edit: resolve the clip/source revision; read current safe
layout/asset metadata; construct and validate the patch; apply atomically;
inspect the new revision; render only when the owner's requested outcome calls
for it; report revision/output status. Do not require a redundant confirmation
for reversible edits already requested by the owner. Ambiguous target/asset
references require clarification instead of changing the wrong clip.

Default stdout/stderr contains opaque IDs, safe codes, counts, style/geometry
and progress only. Keep private paths, media, transcript/caption text, provider
payloads and capabilities out of logs, URLs, tracked examples and process args.
Use private result files/authorized local media delivery for artifacts, never
dump an edit document or raw provider response into console output. Synthetic
examples only. No reading legacy Gemini captures or the retired sample replay.

Agent access to layout controls does not require exposing dialogue. If visual
inspection of real private frames is later requested, record a scoped local
media-review decision before adding capture/read behavior that conflicts with
the existing screenshot/content rule. Until then, real visual review stays in
the owner's local player; agent frame checks use synthetic media. Do not claim
human visual approval from geometry validation.

The command surface makes no AI/provider call for manual edits or local export.
Future paid discovery/regeneration stays owner-triggered and separately gated;
an agent edit instruction is not permission to run the paid flow. Imported files
are explicit owner inputs under the workspace policy, not a general file
browser. No automation, Git write, cloud update, resource purchase or deployment
command.

## Acceptance and verification

- [x] A synthetic owner instruction can move captions, change a preset and
      replace/reposition a picture using only the CLI; the open UI shows the
      same new revision and export uses it.
- [x] Repeat the edit/export with the browser UI closed and provider/paid/cloud
      features disabled. The local command succeeds, then opening the UI shows
      the same revision. No hosted service or UI automation is required.
- [x] UI and CLI reject the same invalid operations and produce the same edit
      snapshot/hash. Repeated command IDs do not repeat writes or rendering.
- [x] Concurrent UI/CLI changes, stale clip IDs, source replacement and canceled
      renders have deterministic conflict/lifecycle outcomes without data loss.
- [x] Malformed patch/filename, escaped path, unauthorized client and expired
      capability fail before file access, native work or any provider call.
- [x] Tests prove safe output and exact zero AI/cloud calls. Synthetic native
      smoke verifies edited export and cancel/close cleanup; ordinary tests use
      pre-import fake/paid-off setup and external network interception.
- [x] Run focused checks, root five gates and public artifact exclusion check
      after implementation. A CLI file in a public image is a failed boundary.

## Documentation and gates

The [agent command guide](../../apps/backend/owner/AGENT_COMMANDS.md), app guides,
local architecture, source of truth and index describe the implemented
commands and limits. Current `FAKE_MODE=true` with `PAID_DEMO_ENABLED=false` is
key-free with synthetic AI results; deterministic edits/exports are API-free
with an already valid bundle and ready local Chrome/FFmpeg tools. Actual
automatic AI uses the separately gated owner adapter/local provider-input
preparation, real keys, enabled flags and rights/transfer/spend approvals; keys
alone are insufficient. No local AI model/weights are provided; paid tests
remain owner-only. Real frame inspection scope, human visual/A/V acceptance
and rights remain open. The owner authorized synthetic local tests/launches
and per-ticket staging/commits, without push, real YouTube/provider/cloud calls
or deployment.

## Local execution and validation — 2026-10-22

- A strict 32 KiB stdin JSON command union owns status, inspect, validate,
  apply, picture, render, cancel, drafts/open-draft and explicit Save. No host,
  runtime, capability or media-path process arguments are accepted. Safe
  output omits dialogue, paths, full edit documents and raw errors. Fixed
  node:http transport uses 127.0.0.1:4100 without redirects/proxy/remote URL
  inputs; Host/Origin authentication remains unchanged.
- Pure command/path admission rejects unknown fields/commands, malformed IDs,
  oversized input and escaped/device/UNC/repository picture paths before
  discovery or file access. Authentication/clip lookup precedes actual picture
  opening. Ancestor junction/symlink, hardlink, changed-identity, byte-size and
  actual raster checks keep the existing picture boundary.
- The launcher publishes a fixed private discovery pointer containing an
  opaque runtime basename and supervisor identity after both fixed services
  are ready. Strict bounded pointer/ledger/state records, six-hour maximum
  age, confined non-link paths and fresh supervisor/child creation identities
  precede capability access. No environment-file/runtime-path override.
  Missing/expired/closed discovery fails before picture access or work.
  Shutdown withdraws the matching pointer before draining capabilities/scratch.
- Backend safe projections call the same serialized edit use case and native
  export methods as the UI. Dry-run overlay hashes equal applied hashes;
  identical command IDs do not repeat revision writes or render dispatch.
  Stale UI/CLI writes conflict without overwriting either draft. Idle browser
  polling observes external changes while retaining dirty form controls and
  requiring explicit reload.
- Four HTTP cases verify safe metadata projection, dry-run/apply/UI parity,
  idempotence, concurrent stale writes, cancel/drain retention and auth/route
  fencing. Thirty-nine client/entry/path cases cover command routing, safe
  outputs/errors, bounded stdin, explicit file identity/caps and rejection
  before side effects. Five discovery cases cover publication, ownership,
  replacement, expiry, malformed/linked state and cleanup, all synthetic.
- The native batch proof now drives the real worker through the agent client:
  validate/apply/repeat/export/repeat/poll/cancel use existing local paths,
  preserve old MP4 bytes, sample changed picture pixels, retain source/siblings
  and leave no owned native scratch/listener. Exact plan/image counts remain
  one each for the edited clip; no provider/cloud call occurs.
- Actual bundled CLI smoke runs with no browser open: import a synthetic
  picture, move captions/change preset, reposition the picture, validate/apply,
  repeat idempotently and export. Opening the UI shows the same revision. A
  later CLI edit is observed in an open dirty editor as a conflict, retaining
  its unapplied value; explicit reload shows the new preset/geometry. Two
  native children were observed before headless cancellation; canceling →
  canceled preserves prior outputs, and explicit re-export reaches ready with
  three outputs and unchanged one-plan/one-image counts. CLI Save/list also
  pass on isolated synthetic storage.
- Protected shutdown returned 204. Initial and stabilization checks found
  zero owned survivors/descendants or 4100/4200 listeners; capability,
  discovery and scratch were removed. The closed-runtime CLI returns only
  `owner_agent_unavailable`. Synthetic source/picture/library files were
  removed; private proof/logs remain outside Git. No retained owner master or
  actual Downloads library was used.
- A source-entry Node import-resolution failure was reproduced during real
  CLI smoke and fixed by adding the CLI to the existing separate owner build;
  the actual built entry was retested. Formatting and a control-character lint
  rule were corrected without changing admitted path behavior.
- Final checks: `owner:test` 146/15 files; `owner:build`; `owner:proof` three
  native proofs; root `format:check`, `lint`, `typecheck`, `test:unit`
  1,502/125 files and deterministic fake/paid-off `build`; `owner:artifacts`
  1,490 built files plus Docker context/compiler roots; `git diff --check`.
  An unchanged boundary test hit its five-second cold ESLint-import deadline
  on one parallel rerun; the final complete gate passes with one worker,
  without changing the timeout/assertion or public test configuration.
- Final read-only review covers the combined CL-021 worktree: contracts,
  safe projections/routes/use cases, CLI/path/transport, discovery/launcher,
  idle UI polling, synthetic tests/native proof and owning documentation.
  No actionable findings remain. Real private-frame review, human quality,
  rights, provider/input implementation readiness and owner-only paid
  acceptance are not inferred from these checks.

Remaining: human/rights/real-media quality and separately authorized real
provider/input preparation and owner-only paid acceptance. No additional model
service, hosted control surface, paid call, real download or cloud action was
introduced. No product-scope deviation.

## Provider-host compatibility correction during CL-024 handoff

The CLI's main function formerly required fake/paid-off process flags even
though its allowlisted protocol only performs local inspection, presentation
edits, picture import, draft operations and native export/cancel. That guard is
removed so already prepared provider bundles can use the same API-free client.
Discovery, current process/capability identity, exact loopback transport, route
allowlist, bounded stdin and revision checks remain unchanged. The CLI does not
read AI configuration or gain analysis/planning/provider routes. Existing agent
client/API checks pass 43/43 with synthetic ports; no real host or paid flow was
run. The implementation/gates belong to the reopened CL-019 handoff record.
