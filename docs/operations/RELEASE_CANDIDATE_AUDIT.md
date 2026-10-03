# Local release candidate audit

CL-014, 2026-10-03. **Repository code is ready for further local release
preparation; public/paid release is not approved.** The owner authorized
sequential fake-mode execute/validate/fix/document/commit work through CL-015,
with actual media/device, paid/cloud and deployment evidence deferred.
No ignored local environment, secrets, actual media, account, provider, cloud,
registry feed or paid resource was inspected or used in this audit.

`FAKE_MODE=true` with no keys supports labelled fixture UI and injected synthetic
processing/lifecycle tests; fixture Download stays disabled. Real analysis needs
provider keys/live/data/rights/paid approval, and private render/storage has an
independent compute/IAM/spend gate. No local AI weights/runtime are used. Real
quality and the complete public journey cannot be inferred from code checks.

## Candidate identity

Implementation parent: `4bdf5d50bcb53b5a28e7f275048cee7207d501ac`
(`CL-013: complete the experience quality pass`). CL-014 adds the documented
network-guard/CI and public-documentation corrections below. Its commit is the
single commit with subject `CL-014: audit the ClipBuilder release candidate`
immediately after that parent; resolve its exact SHA from Git before any build.
No image was built, pushed or deployed. CL-015 material build/config corrections
require focused re-audit and updated evidence before external use.

Audited source/test/config/build inventory: **262 files**, SHA-256
`97c429933451e753b653494e0430dd1b7e3f641dca667ec87bf2cf93d7847940`.
Inventory includes tracked apps/packages/test TS/TSX/MJS/CSS/JSON/YAML and root
package/lock/workspace/TS/lint/Vitest/example/ignore plus CI configuration.
Algorithm: sorted relative path UTF-8, NUL, then raw SHA-256 digest of each file,
concatenated and SHA-256 hashed. Docs/ignored build outputs are excluded.
Lockfile SHA-256: `48931c9bc43ce8dbeef056c8ff2c0579255eca046fdaf99cc50929635a886713`.
Pinned pnpm 11.19.0, Next 16.3.7, React 19.3.0, TypeScript 6.0.3,
Remotion 4.0.532, Google SDK 2.25.0, storage 8.2.0, auth 11.1.0.

## Packet ledger

All packet implementations/history were reconciled with current code ownership,
Git subjects and packet-local evidence. Earlier mechanics inside collapsed
history are intentionally superseded by the current Google/Remotion migration;
unchanged product/privacy/quality requirements remain. A commit is not proof of
unperformed acceptance. Counts below are historical packet evidence, not reruns.

| Packet | Local classification and evidence | Remaining acceptance / destination |
| --- | --- | --- |
| CL-001 | Complete local workspace/contracts/config/health/CI and boundary negatives; commits include `8920bd7`, `d2105b9`, `a51b2f7` | Current boundaries rechecked here; no external claim |
| CL-002 | Owner-approved interim design; `441c717` and packet research/review | Final visual/UI and film/motion acceptance in CL-013; interim approval is not final |
| CL-003 | Local canonical reducer/persistence/fake session and recovery fixes; `0e14f23` | Browser-only mechanics superseded where cloud migration changes them; no live output proof |
| CL-004 | Local single-card fixture journey; `c4f226b`, `2efee17` | Actual UI/device/accessibility and owner approval in CL-013; fake download disabled |
| CL-004A | Local Google/cloud readiness guides and blank configuration | Keys/project/model/data/privacy/provider/spend/license settings remain owner gates; old provider instructions collapsed |
| CL-005 | Browser workspace/temporary upload foundation; current physical storage proof recorded under CL-006 | Actual current CORS/capabilities/max-envelope/public intake needs separate CL-015 proof |
| CL-006 | Local/private foundation complete; `db58981`; five earlier authorized builds/four media operations, zero AI recorded in packet | Earlier private image/media attestation does not approve current release, AI transfer/public sample, licenses or maximum bounds |
| CL-007 | Local grounded source analysis; `e15ba9d`, `b02c2e3`, `a0eaaf3`; earlier fake browser workflow recorded | Current rollout/live model/word timing/diarization/data/cost and maximum source evidence deferred |
| CL-008 | Local selected speaker-focus implementation and short-turn correction; `5a45cd9`; validate pass 2 clean | Native full fixture and human-labelled speaking-face/scene quality deferred |
| CL-009 | Local immutable extractive assembly; `06ab834`, 528 tests/54 files | Real card/caption/font/quality approval deferred; no image API or extra AI call |
| CL-010 | Local signed selected preview; `4749dcc`, 558/57; three reproduced fixes | Actual clocks/Player/native parity/audio and device proof deferred |
| CL-011 | Local final render/output/download; `2e6af07`, 592/60; Clear metadata race fixed | Actual native MP4 pixels/sync/codec/playback/cloud/output deletion/device proof deferred |
| CL-012 | Local security/privacy ledger; `3127c77`, 616/63; purpose aliases/retention bounds fixed | Saved IAM/bucket/scheduler/provider/TLS/CSP/hard monetary controls/rights remain external |
| CL-013 | Local quality corrections; `4bdf5d5`, 623/64; matrix and build-byte measurements | All current manual/device/media/performance/visual/film approval observations explicitly unverified |

## Findings and dispositions

- **A14-01 / Medium, deterministic isolation:** the socket guard inspected direct
  options but missed Node's normalized `[options, callback]` array from
  `net.connect/createConnection`, interpreting a remote host as default local.
  Extracting the existing parser unchanged allowed an independent no-socket
  regression: normalized remote destination returned undefined before the fix.
  The installed Node normalizer confirmed that argument shape without a network
  connection. Unwrap the one normalized array before applying the same host rule;
  regression now passes, existing loopback/default/direct forms retained.
  Pre-import fixtures now assert FAKE_MODE/cloud/render disabled as well; CI
  explicitly sets the current fake/paid/cloud/grant flags and removes retired
  upload/editor flags. The earlier guard missed an internal overload shape.
- **A14-02 / Low, public claims:** root README promised stills/cutaways/equations
  beyond fixed extractive cards and described connected intake/export as future.
  Compare against current composition/assembly/render code and packet evidence;
  corrected bounded-card/fallback framing and code-ready versus actual-live
  status. Docs index and cloud guide's "CL-007 next" were stale; reconciled them.
  No source/architecture or acceptance requirement was weakened.

No subjective broad refactor was added. Legacy contract/fixture state remains
where it serves the labelled fixture UI or validated version compatibility;
shared current schemas stay in contracts and current layout in composition.
No evidence justified deleting those live callers or inventing caching/modules.

## Local inspection and deterministic checks

Inspected 343 tracked files by ownership/inventory, 241 first-party source/test/
script/style files by import/log/retry/flag/cast/lifecycle scans plus relevant
entrypoint/config/route/provider/persistence/stream/render/cleanup implementations.
Boundary-negative TypeScript and ESLint tests enforce no ambient Node in
contracts, no cross-app imports, no backend composition import and no server SDK
in browser-safe composition/contracts. Apps only compose their own ports;
server entrypoints own listen/environment loading, use cases have no Express.
One reducer and frozen range/manifest/hash/receipt bind selected work; persisted
projection excludes CSRF/transient capabilities. Private immutable generations,
terminal fences/tombstones and independent cleanup retry are retained.

AI envelope is one source call plus one combined selected speaker/card call;
no image/repair/tool/search/replay. Three proxy preparations plus one confirmed
render use the four-operation ceiling. Metadata/playback/download retries do not
redispatch. Unknown actions remain consumed; records/epochs/counters are bounded
and process-local, not a distributed or monthly guarantee. Google/Cloud SDK
retries are disabled; cleanup retries are separate from paid dispatch.

Top-level no-network setup is present in all six Vitest configs, with fake/off
values before imports. Fetch/socket interception and injected loopback services
support local tests. Network regression opens no socket. Renderer context
allowlist and packaging tests reject secret/env/fixture/feasibility/app inputs;
fixed bundle/tools are build-time assets, never runtime downloads.

Tracked video/audio/transcript/model binaries: **0**. Private-key marker files:
**0**. Known ignored secret/media/artifact/log paths pass `git check-ignore`.
No ignored secret contents were read. Content/error sentinel tests and source
logging review found no new payload/capability/raw-error logger. These scoped
checks are not a complete forensic history or external secret certification.
No dependency/lock/model/font was added; imports and pinned manifests inspected.
Registry vulnerability feeds, image CVEs/complete codec/font/license/rights
reviews remain **unverified**; no offline claim is substituted for them.

`corepack pnpm install --frozen-lockfile --offline --ignore-scripts` passed,
already up to date in 556ms, no registry or install script. Focused installed
Vitest pre-import check passes 3 tests in 1 file; the package-manager `exec vitest`
shortcut is unavailable here, so the same pinned local entrypoint was used.
Settled root results: `corepack pnpm format:check`, `lint`, `typecheck`,
`test:unit`, and `build` all pass. `git diff --check` passes. Unit total:
**624 tests in 64 files** (root 21/3, contracts 58/5, composition 3/1,
backend 195/14, renderer 56/11, frontend 291/30). Units ran separately from
CPU-heavy checks; no timeout or threshold changes. Validation pass 1 inspected
the combined current work, full ticket and nearby dependencies: **Meets ticket
with concerns**, **no actionable findings** in local scope. Exact input digest
was recomputed and matches. External/manual quality/rights/release concerns are
unverified gates above, not defects silently marked passed. No app/listener/model/media run was started.
Synthetic test streams/timers/scratch/controllers are cleaned by owning tests.
No standalone accessibility/E2E command is declared; browser/media/manual QA is
separately deferred by the owner and remains unchecked in the quality matrix.

## Release decision and CL-015 handoff

Continue local packaging/release preparation with fake/paid-off/all-live-off.
Actual public routing and private service authentication, anonymous safeguards /
revision overlap, full native envelope/quality and device/owner acceptance are
not proved. Backend protected/paid nonlocal configuration deliberately fails
closed; browser bridges currently pin loopback origins. CL-015 owns permitted
local artifact preparation and later specifically authorized hosting/transport
proof, not implied paid enablement. No existing private test checkpoint is a
public release approval or proof of this newer image.

Keep unchecked: exact immutable image/build/runtime provenance and scans;
actual service/IAM/TLS/cookie/CSP/CORS/bucket/disposable policy/expiry scheduler;
current provider/model/data/project/retention/paid settings; numerical hard caps
versus alerts and process/restart/revision multiplication; real word timings /
speaker quality/cards/captions/font metrics/native A/V/codec/parity/max limits /
playback/download/devices; sample/contributor/music/font/codec/code rights;
final UI/capture/storyboard/film and motion acceptance; deployed unpaid probes,
kill-switch/rollback/cleanup operational proof and public launch approval.
Update/re-audit affected inputs if later implementation or cloud proof changes.
