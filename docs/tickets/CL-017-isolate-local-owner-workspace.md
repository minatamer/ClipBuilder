# CL-017 — Isolate a local owner workspace and media runtime

Status: implemented and locally verified; owner authorized 2026-10-22, fake/synthetic
only, zero-spend, with validation loops and ticket commits. All recommendations
are adopted in the source-of-truth authorization and local-owner ADR. Proposal
language below records superseded planning history. Dependencies: existing
CL-005/007/010/011/012/016 local foundations; inspect their current code, not
historical completion counts. No CL-015 deployment action is a dependency. This
is the first local-owner packet after implementation is requested.

## Objective and value

Provide a separately launched local workspace that can keep one source available
for later manual edits and render locally. Enable personal professional use
without adding owner controls or changing the portfolio-facing visitor story.
The local extension is a scoped product revision, not blanket permission to
relax the public restrictions in AGENTS.md.

## Evidence and proposed decisions

Read the [research](../research/LOCAL_OWNER_WORKFLOW_2026-10-22.md). Current
frontend/control running locally still uses private Cloud Run media processing.
Source cleanup after export and the four-operation allowance prevent simply
adding buttons for multi-clip editing. Native synthetic harnesses exist; a
complete supported owner-local runtime does not.

Before implementation, record the selected design in the source of truth and a
focused ADR. Prefer independent local entrypoints/build outputs within the
existing apps, outside deployed `src`/Next route graphs. Prove exclusion from
public compilation, standalone output and Docker build contexts; flags and
localhost checks alone are insufficient. If a separate workspace app is needed,
settle its dependencies explicitly. Applications never import one another.

Recommend session-only processing/draft storage first. The owner's later
clarification separately requires completed downloads to survive workspace close
and restart, preferably under the OS-resolved Downloads folder outside the repo.
Treat those files as saved owner inputs with minimal private reuse metadata, not
disposable processing copies. Resolve the Downloads known folder rather than
assuming it is an unredirected home-directory path; Desktop is an optional
chosen destination. CL-023 owns acquisition and reuse; this packet owns
confinement and lifecycle rules. No directory is created during planning.

Reopenable editor drafts are a separate proposed retention choice; record the
owner's choice before retaining real transcripts/manifests across sessions.
Saved-download retention does not by itself approve persistent editor data.

## Scope and ownership

- Frontend: independent local UI entrypoint, source chooser and source preview;
  no public navigation, routes, feature flags or browser-visible private config.
- Backend: explicit local composition, workspace operations and private metadata
  ownership; imports do not read env/files, start listeners or call providers.
- Renderer: local filesystem/scratch adapters and fixed native worker
  composition reusing `src/media` and `src/composition`; no ADC, bucket or cloud
  fallback.
- Contracts: separately exported browser-safe owner schemas; keep public schemas
  and limits strict. Reuse shared primitives rather than duplicate them.
- Build configuration: independent output graphs and artifact-exclusion checks.
  Choose and document fixed local ports after checking existing ownership. Keep
  canonical public 3000/4000 startup unchanged; never silently select spare
  ports.

No editor, AI discovery, batch scheduler, YouTube fetch, new model, dependency
upgrade or cloud resource belongs in this foundational packet. Deliver a usable
source-preview/local synthetic-export slice, not placeholder feature trees.

## Contracts, lifecycle, privacy and cost

Define workspace/source IDs, source fingerprint, revision, local asset
references, runtime capability and fixed resource policy. State: closed →
source-ready → closing → closed, with explicit failed cleanup recovery. Paths
are resolved server-side beneath the admitted root; reject traversal and
symlink/junction escapes. Browser DTOs never expose absolute media paths or
credentials.

Bind only to loopback with exact Host/Origin checks and a private per-run
capability, including CLI protection. No remote tunnel/LAN exposure. Capture
content-free process identities and separate logs outside Git, following AGENTS
startup/cleanup rules. Never log real filenames, dialogue, media or capability.

Closing drains requests/workers, then removes owned temporary copies. Never
delete owner originals, completed saved downloads/reuse metadata, saved exports,
existing retained masters, captures or private logs. Completed downloads survive
workspace expiry and repository cleanup; deletion is a separate explicit action
targeting that saved source. If persistence is chosen, explicitly saved private
draft data survives close and has a separate delete action; scratch does not. No
automatic deletion outside the exact workspace root. No real data in test
fixtures.

Local media compute is required for this owner track, with no cloud fallback.
Verify approved FFmpeg/FFprobe/Chromium/bundle versions before use; no runtime
downloads. Missing tools return a safe readiness code, never a cloud dispatch or
silent fake result. Set and document initial byte/duration/disk ceilings from
synthetic evidence.

Local-only means separate owner entrypoints, loopback access, local source/asset
storage and local native editing/rendering. Do not compose the public/hosted
API, Cloud Run renderer, GCS upload, retained cloud sample or remote processing
grant into this workflow. The existing explicitly approved AI adapters may still
send their disclosed bounded inputs to providers; that is a separate gated
capability, not permission to move owner media processing/storage to cloud
services.

Opening a saved source, previewing it, changing an already prepared edit and
deterministic local export must not require Gemini credentials, Turnstile, paid
enablement or cloud approval. Retain local caller/source validation. Isolate
these capabilities from public-mode defaults; do not change the owner's existing
env files or relax public gates. Without AI prerequisites, disable actual
automatic analysis/planning with an explicit reason; never substitute fake
results as real processing. No offline transcription model is introduced.

## Acceptance and verification

- [x] Resolve isolation topology, editor-draft retention, fixed ports and
      capacity as explicit local decisions; update the narrow operating
      documents.
- [x] Document and enforce completed-download preservation in the configured OS
      Downloads location, independently from disposable processing/draft data.
- [x] Local synthetic source opens, previews, produces a validated MP4 using a
      fixed composition, and closes with no orphan process/listener/scratch.
- [x] Foreign web origins and unauthenticated local requests cannot read or
      mutate the workspace; escaped paths/junctions fail before file access.
- [x] A public build contains no owner route, CLI, local filesystem host or
      owner-only renderer entrypoint. Ordinary routes reject owner payloads.
- [x] Public workflow, source expiry and four-operation budget stay unchanged.
- [x] Local saved-source playback and deterministic edits/export of a prepared
      bundle work with provider/paid/cloud flags off, using local tools and
      exactly zero external calls. Missing tools cannot fall back to hosted
      work.
- [x] The local owner composition cannot reach public/hosted processing, cloud
      storage or the remote renderer. Approved AI egress stays a distinct port;
      tests reject cloud media calls even if inherited public defaults are
      enabled.
- [x] Focused schemas/security/lifecycle tests plus an opt-in synthetic native
      proof run fake/paid-off before imports, deny external network, and use
      zero provider/cloud calls. Record actual OS/tool readiness separately.
- [x] Run settled format/lint/typecheck/unit/build gates and the new artifact
      exclusion check after implementation. Do not infer real-media quality.

## Handoff and open gates

Owner-requested real-mode compatibility revisit after CL-019: native processing,
source identities and cleanup are provider-independent. Workspace metadata now
supports explicit unavailable/provider provenance without enabling execution;
entrypoints remain strictly fake/paid-off. See the CL-019 follow-up for confirmed
gaps/fixes, injected adapter evidence and the still-uncomposed live adapter gate.

Update owning app READMEs, source of truth, scoped AGENTS operating constraints,
ADR and index with actual evidence only. Current `FAKE_MODE=true` needs no API
keys and shows synthetic results; the future local native proof can make a
synthetic MP4 without AI keys. Real AI still needs provider keys, flags and
rights/transfer/ spend approval and remains owner-tested. No offline AI
weights/runtime are added. Draft retention is adopted; native FFmpeg readiness
is verified for this Windows x64 synthetic slice. Maximum-source capacity,
owner media/visual quality and any later external tests remain unchecked in
CL-025. Local tooling, fake/synthetic tests and ticket commits are authorized
by the later owner instruction. Paid/provider/cloud flows, deployment, real
YouTube retrieval and push remain excluded.

## Implementation and validation evidence — 2026-10-22

- Separate `owner/` React UI, host, contracts and fixed worker; ignored esbuild
  outputs, explicit entrypoints, exact loopback Host/Origin authentication,
  inert library imports and allowlisted child environment. Public 3000/4000,
  schemas, one-clip flow and operation budget are unchanged.
- Source upload/playback, running-session recovery after refresh, two-hour
  expiry, fixed portrait export/re-export, keyboard clear and protected graceful
  shutdown. Source originals outside the owned OS-temp workspace are preserved;
  acquisition/OS-known Downloads resolution and persistent drafts remain their
  later packets. Missing/changed tools fail closed with no hosted fallback.
- Adopted limits are enforced admission ceilings, not a maximum-load benchmark.
  The machine has 16 GiB RAM/12 logical processors. Proofs used a generated
  two-second source and a generated 12-second source with a ten-second export.
  Output really encoded/decoded as 1080×1920/30fps H.264/AAC; no real media used.
- Cached Remotion FFmpeg n7.1 lacked required filters. Prepared the official-
  linked Gyan Windows x64 GPLv3 9.0.2 portable build locally with archive and
  executable SHA-256 admission. No global install, runtime download, Chromium
  use, dependency upgrade, cloud build or provider call. Root esbuild is the
  existing 0.28.2 version made explicit for owner builds.
- Review pass 1 found cancellation/drain, expiry/render races and cleanup gaps;
  pass 2 found refresh recovery and detached shutdown gaps. Implemented those
  fixes and regression checks. Latest read-only scoped review: **Meets ticket;
  no actionable findings.** Scope is CL-017 plus adopted planning baseline,
  not later-ticket implementation or a deep/public release audit.
- Focused owner tests: 10 pass; opt-in native proof: 1 pass, including real
  encoding, repeated export, full decode, scratch and listener cleanup. Shared
  setup forces fake/paid-off before imports and denies external network. Exact
  fake native-port counts are asserted; external/provider/cloud calls are zero.
- Browser synthetic source preview, portrait preview, disabled busy controls,
  announced statuses and keyboard clear verified. Source/player metadata showed
  12 seconds; exported player showed 10 seconds. Responsive/real-media editorial
  acceptance remains CL-025.
- Hidden runtime proof: host/worker/UI 200; protected shutdown 204; zero recorded
  owned processes/listeners after stabilization; scratch and capability state
  removed. Content-safe logs remain outside Git under the OS-temp
  `clipbuilder-owner-runtime-CuXhGq` and launcher `clipbuilder-owner-launch-074c0b635322415abcc851ac61ee291f`.
  Earlier synthetic UI screenshot/logs are preserved outside Git. Retained
  masters, captures and private logs were not read for content or changed.
- Public build and owner artifact exclusion pass: 1,490 built files checked,
  Docker context excludes owner trees/tools/CLI, and public compiler roots are
  src-only. Negative lint fixtures reject public-to-owner imports; owner
  contracts compile without Node ambient types. Existing Windows standalone
  output reports 26 external package links; no Linux image/deployment proof is
  claimed by this local check.
- Required gates passed: `corepack pnpm format:check`, `lint`, `typecheck`,
  `test:unit` (1,266 tests), `build`, `owner:build`, `owner:artifacts`;
  `owner:test` (10), `owner:proof` (1) and focused lint were repeated after final
  local-only fixes. A session-only pinned-pnpm shim ensured nested scripts used
  11.19.0 instead of the host fallback 11.25.0; no owner config was changed.
  `git diff --check` passed. No real AI, paid/credential/cloud/YouTube compatibility,
  retained-source processing or owner visual-quality acceptance is claimed.

Deviation: fixed foundation encoding uses admitted local FFmpeg directly and
does not need Chromium/Remotion yet. Later caption/visual composition must prove
its own native readiness. The initial planning docs and CL-025 accompany this
first implementation commit so the adopted sequence is reviewable in Git.
