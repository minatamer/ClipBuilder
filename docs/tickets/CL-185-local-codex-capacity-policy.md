# CL-185 — Separate local Codex capacity from demo limits

Status: Authorized and queued, 2026-11-02. Owner AFK authorization lifts the
previous execution hold; use execute/validate/fix loops and local
ticket-prefixed commits without push. Depends on implemented CL-135, CL-137 and
CL-172. This is the foundation for CL-186–190; it must not advertise unfinished
long-source support.

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
[Codex usage and plan limits](https://learn.chatgpt.com/docs/pricing). No
implementation, real inference/download, config/model change, restart, cloud,
deployment or Git mutation is authorized by this planning request.
