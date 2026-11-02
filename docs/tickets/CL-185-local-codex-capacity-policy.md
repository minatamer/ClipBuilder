# CL-185 — Separate local Codex capacity from demo limits

Status: Foundation implemented and validated locally, 2026-11-02. Local commit
approved. Depends on CL-135/137/172. Actual long-source/count admission remains
gated for CL-189/190; this packet does not claim two-hour processing support.

## Owner request and interpretation

Local Codex should accept long/large sources, including two-hour YouTube videos,
without ClipBuilder imposing a demo source-size, duration or clip-count quota.
Hosted retains its limits. The owner's final scope for uncapped clips is local
Codex only; do not enlarge local Gemini allowances.

Remove arbitrary product quotas rather than replace one hour with two hours or
ten clips with another fixed total. This cannot promise unlimited hardware,
provider allowance/context/output, accessible YouTube formats or codec support.
Keep actual executable/media safety, finite validated values, authentication,
path/URL isolation, cancellation and controlled concurrency.

## Current evidence

`packages/contracts/local/policy.ts` fixes source admission at one hour/10 GiB,
ten processing clips, 20 GiB scratch and a 10 GiB reserve. Find all has a
360-moment ceiling derived from that hour. Other contracts, upload/download
admission, storage, native inspection, ASR artifacts and recovery repeat or
inherit limits. Enlarging only the UI or `OWNER_LIMITS` would affect Gemini and
still leave downstream failures.

## Proposed implementation packet

- Inventory every source/count/aggregate-byte rejection from frontend transport
  through contracts, backend, worker, analysis, review, persistence and export.
  Distinguish product quotas from per-operation protocol/decoder safeguards.
- Introduce a single explicit server-resolved capacity profile based on actual
  local composition and selected provider. Browser-supplied flags, saved data
  and hosted owner exemptions cannot select the local Codex profile. Preserve
  existing public and local Gemini budgets and provider isolation.
- For local Codex, validate source size/duration as finite supported measured
  values, with safe integer clock arithmetic; stream/chunk rather than buffer
  whole files. Per-message bounds remain, but may not become hidden total-source
  or total-moment caps. Route/upload configuration must agree with the profile.
- Replace fixed aggregate local Codex scratch/library/output restrictions that
  would merely reintroduce demo quotas with measured disk headroom, bounded
  working sets and actionable capacity failures. Keep an actual free-disk
  reserve and bounded native jobs; never consume all RAM/disk or launch all
  clips at once. Do not silently delete retained sources, owner drafts or
  exports to make room.
- Preserve provider binding on existing work and safe behavior when switching
  providers: completed Codex work stays readable, but a new Gemini request
  cannot inherit Codex permissions. No changed environment switches or automatic
  fallback.
- Keep unsupported long-source execution unavailable until CL-189 passes its
  end-to-end gate. Document transitional admission explicitly; this foundation
  alone cannot be reported as completed two-hour support.

## File allocation and verification plan

Contracts: local policy, acquisition/workspace/selection/clip schemas and tests;
public schemas only to preserve independent existing bounds. Backend: explicit
composition/capabilities, intake/admission, storage and worker request
validation. Frontend: consume admitted capabilities rather than duplicate
constants. Native: source inspection and resource admission. Docs: narrow
service guides, source of truth and this series. Allocate exact whole files
after the implementation audit.

Fake/paid-off/no-key checks must admit synthetic metadata beyond one hour/10 GiB
and reject forged profiles/unsafe values before dispatch. Cover normal Gemini,
hosted and hosted exemptions unchanged; provider changes; measured low disk;
streaming/cancel/cleanup and old draft decoding. Use sparse files/metadata and
short generated media, never giant allocations or retained owner media. Relevant
types/lint/boundary tests and validate are required. CL-189/190 own actual
composed long-source/many-clip proofs, so do not mark those passed here.

## Capability and authorization boundary

Fake mode proves policy separation with injected values, not real two-hour
performance. Existing local CPU speech assets are documented as prepared;
accelerated/larger-model paths are not verified. Real Codex uses saved ChatGPT
login and plan allowance rather than a Gemini key; local does not mean unlimited
or wholly offline. Gemini requires keys/live approvals. Official guidance:
[Codex usage and plan limits](https://learn.chatgpt.com/docs/pricing). The later
AFK instruction authorizes this implementation and local commit. No real
inference/download, config/model change, app start, cloud, deployment or push
was performed here.

## Current execution allocation — 2026-11-02

Capacity ownership and the remaining downstream gates are inventoried in
[local Codex capacity](../operations/LOCAL_CODEX_CAPACITY.md). This packet owns
composition, structural source admission, common disk checks and their safe
transport to the existing worker/picker. CL-186/188/189/190 still own their
window/download/chunk/count implementations; long-source/count readiness stays
false until those paths pass their final gates. Do not report the foundation
alone as two-hour or unrestricted-batch support.

## Implementation evidence and whole-file allocation

The single profile resolver takes trusted composition, not request/draft state.
Source and disk policy use finite integers and preserve actual codec/geometry
checks. Local Codex scratch is quota-free with measured headroom and the
existing reserve. Native startup passes the same profile in the private tools
descriptor; forged job fields are rejected before execution. Intake and picker
share the current effective source-byte limit. Saved-source/component secondary
scratch checks no longer reintroduce Gemini's quota for Codex. Local low disk is
a fixed HTTP 507 and actionable free-space message, with zero native/AI
dispatch.

21 code/test paths:

- Contracts local: new `capacity.ts`/`capacity.test.ts`, `index.ts`,
  `runtime.ts`.
- Backend local: `server.ts`, new `server-capacity.test.ts`, `runtime.ts`,
  `workspace-files.ts`, `draft-store.ts`, `session-recovery.ts`,
  `source-library.ts`, `source-acquisition.ts`/`source-acquisition.test.ts`.
- Renderer local: `entry.ts`, `media.ts`, new `media-capacity.test.ts`.
- Frontend local-editing: `experience.tsx`, `open-local-file.ts` and its test.
- Root tests: `owner-local.test.ts`, `owner-provider-host.test.ts`.

Seven owning documentation paths: this packet, index, source of truth, execution
ledger, capacity inventory, LOCAL_CODEX_AI architecture and backend local guide.
No public limits, provider/model setting, ignored configuration or media
changed.

## Checks and validate loop

- Final scoped `scripts/local-test.config.ts` gate: **110 cases / 17 files
  pass**. Covers safe/unsafe metadata beyond one hour/10 GiB,
  Gemini/hosted/exemption policy, pending readiness, native mocked two-hour
  probing with unchanged codec rejection, authenticated host/worker forgery with
  zero AI, 40-GiB synthetic disk headroom, near-10-GiB progress without giant
  files, cancel/cleanup, saved-source/draft/recovery compatibility, picker
  streaming/draft bounds and low-disk errors before processing. Fake
  speech/provider paths only.
- `test/local-codex.proof.ts` under the fake/offline proof config: **one case
  passes in 80.00s**, compiling the current-source overlay in owned scratch and
  exercising browser/native preparation, manual edits, export and recovery. This
  verifies composition on generated media, not two-hour ASR performance.
- Current normal media worker/overlay build passes with
  `node scripts/local-media-build.mjs`; no server is started. Contracts build,
  contracts-local/local/frontend/root-test TypeScript, scoped ESLint/Prettier
  and whitespace checks pass. No new controls/layout need a new screenshot;
  existing responsive proof and source picker remain intact.

Read-only validate of the settled CL-185 worktree: **Meets the gated foundation;
no actionable findings**. Fixed two findings before the final pass: duplicate
saved-source scratch/component cutoffs and an unhelpful generic low-disk intake
error. Rechecked source/provider boundaries, compatibility, no automatic
retries, content-free diagnostics and file/listener/request/native scratch
cleanup. Exact-optional-property TypeScript mismatches were corrected, without
casts.

Environment deviation: used installed lockfile-pinned tool binaries after the
Corepack registry bootstrap problem recorded in CL-184. Test/proof escalation
only resolves Windows transform-cache access; setup still clears credentials,
forces fake/paid-off, disables env-file loading and blocks external connections.
Normal app was not running; final normal stack start remains after the series.
Real source duration/availability, long ASR/face/editorial quality and owner
personal/release acceptance are unverified. Later packet gates remain explicit
in the capacity inventory; no partially wired long-source feature is exposed.

## Normal startup follow-up — 2026-11-02

The owner's requested normal Codex run exposed a missing discovery integration:
`runtime.ts` supplies the trusted capacity profile as `state.tools.capacity`,
but `scripts/local-discovery.mjs` still admitted only `ffmpeg`/`ffprobe` keys.
The worker became ready, then discovery publication failed and startup cleaned
up. Earlier fake hosts did not exercise this normal private descriptor through
the strict discovery reader. The failed launcher/watchers were
identity-verified, stopped and checked absent before relaunch; no
media/inference was attempted.

Narrow follow-up allocation: `scripts/local-discovery.mjs`,
`test/owner-discovery.test.ts`, this packet
(`docs/tickets/CL-185-local-codex-capacity-policy.md`) and
`docs/operations/CL184_193_EXECUTION.md`. Admit the existing optional capacity
metadata only; native startup remains its validator and browser capacity still
comes from the authenticated server composition. Discovery returns no profile or
media-tool details. Test bounded/Codex descriptors, opaque public pointer and
continued rejection of unrelated tool fields, then scoped lint/types/validate
and the requested non-metered normal-stack readiness check. No environment,
model/provider, media, staging, commit, push or deployment change belongs here.

Follow-up validation: 14 fake/no-key/paid-off discovery/capacity cases pass in
1.43s, including the actual bounded and local-Codex descriptor profiles and
unknown tool-field rejection. Scoped ESLint, root-test TypeScript and whitespace
checks pass. Read-only validate finds no actionable issue: the optional metadata
is ignored by discovery, is never copied into the public pointer/return value,
and does not choose server/native permissions. The existing worker remains its
schema validator. No provider/media call or configuration change was made. The
requested normal launch's read-only readiness evidence is recorded in the
execution ledger; startup does not establish two-hour ASR/editorial quality.
Changes remain unstaged/uncommitted for this run request.

Requested normal launch verified after the fix: backend `/v1/health`, frontend
`/start`, `/api/sample/config` and exposed `/api/local/capabilities` all
return 200. The owner's requested provider is selected for this backend process
only; ignored files and all other operating settings remain unchanged.
Capabilities confirm Codex `provider-ai`, setup ready, local-speech captions,
long sources and many clips with null total quotas; cloud is false. Listener
ownership is verified on 3000/4000/4200 and recorded outside Git with creation
identities and separate logs. The frontend and backend/worker are left running
for the owner's manual two-hour acceptance. No download, inference or real-media
test was run.

## Local Git authorization — 2026-11-03

The owner now authorizes whole-file planning, staging and multiple ticket-prefixed
local commits. The startup follow-up's earlier unstaged handoff is superseded by
the [file-level commit plan](../operations/CL185_196_COMMIT_PLAN.md). Existing
verification is unchanged; no processing, configuration, restart or push is
part of this Git task. Real long-source AI acceptance remains owner-only.
