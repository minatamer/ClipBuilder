# CL-024 — Verify the local owner workflow and deployment exclusion

Status: queued; owner authorized fake/synthetic execution and ticket commits
2026-10-22. This packet's combined feature verification is not yet produced.
Dependencies: CL-017–021 implemented with
their focused gates. CL-022 decision must be explicit; include CL-023 only if
its go/access/implementation gates pass. A no-go importer does not block a
useful file-based local editor.

Report file-based acceptance and YouTube-source acceptance separately. YouTube
import/reuse remains an owner-requested outcome gated on CL-022/023, not an
optional requirement that can disappear from the completion report. Passing the
file-based lane alone does not complete everything discussed; full owner-track
acceptance needs the link/resolution/saved-reuse lane, or an explicit later
owner decision to defer it with that gap recorded. No such deferral is recorded
today.

## Objective and value

Demonstrate the owner's complete local workflow with deterministic evidence,
preserving the deployed public product boundary and honest live-quality limits.
This is a local acceptance packet, not another public release or deployment.

## Scope and owning areas

Own the combined synthetic scenario, exclusion/packaging assertions, local
operations/agent guide and evidence ledger. Inspect current frontend/backend/
renderer build inputs, standalone output, Docker contexts and public route
inventory. Feature defects return to the narrow owning CL-017–023 packet; do not
use this ticket to hide missing functionality or change rights/spend policy. The
[research](../research/LOCAL_OWNER_WORKFLOW_2026-10-22.md) records assumptions
that must not be relabelled as measurements.

## Combined acceptance scenario

Owner clarification after CL-019: inspect the real-mode handoff as well as the
fake path. Test provider-shaped adapters with injected transports/data through
the same contracts, media identities and edit/export use cases. Record actual
owner live adapter composition/local provider-input preparation and activation
readiness; return missing implementation to its narrow owning packet before
claiming real-mode readiness. Fake-only entrypoints plus flags/keys do not make
an unimplemented live adapter available. These are safe local checks; no agent
credential access, real AI invocation or paid-flow test is authorized.

Use synthetic media and invented timed words/pictures only. Open one source;
enter several exact ranges; run independent fake discovery with 30–30, 60–60 and
a variable min/max policy; select a mix of three manual/AI clips; process the
work list; review one completed clip while another runs; cancel/fail a sibling;
change captions and supply/reposition an image; apply a further CLI edit;
export, edit again, re-export and download distinct validated MP4s. Close the
workspace and verify complete owned scratch/process cleanup. If CL-023 is
included, always verify completed source downloads survive close/restart outside
the repo and are reused without downloading again. Test reopening editor drafts
separately only if persistent private drafts were explicitly chosen under
CL-017.

Snapshot identity includes source fingerprint, cut range, clip ID, edit
revision, asset digests and output revision. Verify duration/frame count,
1080×1920 output, audio availability/A/V offset and preview/export geometry at
sampled frames. Native tests prove deterministic media behavior; they do not
prove AI editorial quality, source rights or professional visual acceptance.

## Boundary, resource and privacy acceptance

- [ ] Public builds/routes contain no owner UI, local host/CLI/worker
      entrypoint, filesystem authority, importer or owner-only manifest parser.
      Safe shared layout primitives may be reused; public v2/v3 behavior stays
      fixed.
- [ ] Public requests reject owner ranges, duration overrides, multi-selection
      and mutable manifests. No browser switch/cookie/query enables owner mode.
- [ ] Local listener authentication, exact Host/Origin checks and path/junction
      confinement hold. Failed native-tool readiness cannot dispatch cloud work.
- [ ] Prove total concurrency limits across clip workers and each renderer's
      internal threads/tabs. Record synthetic wall time, peak memory/disk and
      cancellation latency without real media details; avoid invented
      benchmarks.
- [ ] Exact fake call counts cover a full batch, validation rejection, duplicate
      actions, edit/re-export and canceled queued work. No automatic paid
      retries.
- [ ] If link import is included, synthetic format choices cover Best available,
      exact offered tiers and missing/changed tiers without silent downgrading.
      The background download/merge/inspect flow reaches ordinary editing with
      no external downloader UI or manual file re-upload.
- [ ] If link import is included, a saved source in the configured OS Downloads
      location is reused after app restart with zero download calls. Validate
      missing, damaged, changed-quality and explicitly refreshed availability
      cases. Close/cancel/expiry removes owned partial/scratch files but
      preserves completed saved sources.
- [ ] An offline saved-source scenario opens a complete downloaded input through
      Use saved video and a repeated URL before any format-enumeration request,
      with zero network/downloader/provider calls and no credentials/live flags.
- [ ] Local prepared-bundle edit/export and headless CLI editing work without
      provider/paid/cloud features. Cloud media dispatch remains impossible even
      when the public application's inherited defaults would enable it.
- [ ] Distinguish valid AI min=max from invalid manual start=end, and preserve
      manual ranges through empty AI results, duration changes and source
      limits.
- [ ] Source cleanup is workspace-owned; siblings and later edits keep valid
      inputs. Close/crash recovery does not repeat providers or delete owner
      inputs, saved exports, retained masters, captures or existing private
      logs.
- [ ] Nothing private appears in Git, fixture media, stdout/stderr, browser
      errors, URLs, screenshots or documentation. Synthetic visual artifacts
      only unless a later explicit local media-review decision changes that
      scope.
- [ ] No new listener/timer/request/object URL/subprocess or scratch artifact
      remains after cancel/close; healthy unrelated apps remain untouched.

## Verification and evidence

After implementation, run focused contract/state/CLI/security tests, the
credential-free offline native scenario, public artifact exclusion check, then
`corepack pnpm format:check`, `lint`, `typecheck`, `test:unit` and `build` after
changes settle. Tests install fake/paid-off flags, remove provider variables and
deny external sockets before application imports. Never load ignored env files.
An acquired real source, live provider result or current cloud configuration is
not an automated test fixture.

Owner manual checks: local controls/keyboard usability, real captions/pictures,
professional readability, speech-cut accuracy, A/V sync, resource
responsiveness, real edited output and retained/saved draft behavior if chosen.
Real paid analysis/assembly remains exclusively owner-run with keys, flags,
rights/transfer/ spend approvals. If importer is included, acquisition needs its
separate cleared method/source authorization; record no-go/unperformed checks
explicitly.

## Documentation and completion rule

Produce a narrow local workflow guide covering start/stop, supported tools,
source/clip limits, private storage/deletion, safe agent commands and known
limitations. Update owning app READMEs, source of truth and ticket index; do not
market these controls in the public README or alter deployment settings. Mark
only demonstrated acceptance items complete and list external/owner items still
unchecked. No local success closes CL-015 public release gates.

Current `FAKE_MODE=true` works without API keys and demonstrates synthetic
single-clip behavior. The planned native checks can later prove real encoding
with synthetic inputs and no AI keys; they do not add an offline AI model or
weights. Actual AI processing needs providers/live approvals, while local manual
editing of already prepared material can be API-free. All new features, local
native readiness, owner visual acceptance and gated YouTube access remain
unchecked today. No install, app launch, Git mutation, paid processing, cloud
build/update or deployment is authorized by this packet.
