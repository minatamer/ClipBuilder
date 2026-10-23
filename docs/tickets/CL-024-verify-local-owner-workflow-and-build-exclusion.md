# CL-024 — Verify the local owner workflow and deployment exclusion

Status: implemented and validated in the authorized synthetic/local lane;
owner-only real/provider/YouTube/visual acceptance remains open in CL-025. The
owner authorized fake/synthetic execution and ticket commits on 2026-10-22.
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

Checked items describe synthetic/injected local evidence and inspected public
artifacts. They do not check off actual provider/YouTube/source-rights or owner
acceptance below.

- [x] Public builds/routes contain no owner UI, local host/CLI/worker
      entrypoint, filesystem authority, importer or owner-only manifest parser.
      Safe shared layout primitives may be reused; public v2/v3 behavior stays
      fixed.
- [x] Public requests reject owner ranges, duration overrides, multi-selection
      and mutable manifests. No browser switch/cookie/query enables owner mode.
- [x] Local listener authentication, exact Host/Origin checks and path/junction
      confinement hold. Failed native-tool readiness cannot dispatch cloud work.
- [x] Prove total concurrency limits across clip workers and each renderer's
      internal threads/tabs. Record synthetic wall time, peak memory/disk and
      cancellation latency without real media details; avoid invented
      benchmarks.
- [x] Exact fake call counts cover a full batch, validation rejection, duplicate
      actions, edit/re-export and canceled queued work. No automatic paid
      retries.
- [x] If link import is included, synthetic format choices cover Best available,
      exact offered tiers and missing/changed tiers without silent downgrading.
      The background download/merge/inspect flow reaches ordinary editing with
      no external downloader UI or manual file re-upload.
- [x] If link import is included, a saved source in the configured OS Downloads
      location is reused after app restart with zero download calls. Validate
      missing, damaged, changed-quality and explicitly refreshed availability
      cases. Close/cancel/expiry removes owned partial/scratch files but
      preserves completed saved sources.
- [x] An offline saved-source scenario opens a complete downloaded input through
      Use saved video and a repeated URL before any format-enumeration request,
      with zero network/downloader/provider calls and no credentials/live flags.
- [x] Local prepared-bundle edit/export and headless CLI editing work without
      provider/paid/cloud features. Cloud media dispatch remains impossible even
      when the public application's inherited defaults would enable it.
- [x] Distinguish valid AI min=max from invalid manual start=end, and preserve
      manual ranges through empty AI results, duration changes and source
      limits.
- [x] Source cleanup is workspace-owned; siblings and later edits keep valid
      inputs. Close/crash recovery does not repeat providers or delete owner
      inputs, saved exports, retained masters, captures or existing private
      logs.
- [x] Nothing private appears in Git, fixture media, stdout/stderr, browser
      errors, URLs, screenshots or documentation. Synthetic visual artifacts
      only unless a later explicit local media-review decision changes that
      scope.
- [x] No new listener/timer/request/object URL/subprocess or scratch artifact
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

Current `FAKE_MODE=true` with `PAID_DEMO_ENABLED=false` supports the local
multi-clip/editor workflow without API keys or ADC. Native synthetic checks
really encode media. An already prepared bundle can be edited and re-exported
without AI. The separate real AI handoff is implemented and injected-tested;
activation and paid processing remain owner-only. No offline AI model/weights,
real YouTube access, provider quality or owner visual acceptance is claimed.
The later owner authorization permits synthetic local launches and per-ticket
commits; installation, real retrieval, provider/cloud calls, deployment and push
remain excluded.

## Combined evidence ledger — 2026-10-22

The missing native provider-input preparation/composition was returned to
CL-017–019 and committed as `311fe52` before this packet. The
[handoff record](CL-019-process-multiple-local-clips.md) covers actual bounded
audio/video jobs, identity-checked input reads, existing Gemini adapter reuse,
strict provenance, scoped cleanup and the separately gated provider launcher.
The normal fake launcher and its native worker remain paid-off. A final
isolation finding explicitly resets `OWNER_PROVIDER_APPROVED=false` before
test imports and in native children (`20eabdb`); a deliberately inherited true value was
reproduced as a failing regression, then passes the corrected pre-import check.

| Requirement | Current authoritative evidence |
| --- | --- |
| Combined file-based flow | Extended `test/owner-batch.proof.ts`: one 61-second color/tone source, two exact manual ranges preserved through 30–30, 60–60 and variable AI policies, then three manual/AI exports of 30/60/300 frames. Review while siblings progress, own picture import, caption/picture geometry, immutable re-export, draft close/reopen, CLI validate/apply/repeat/export/cancel and unchanged source bytes. |
| Provider handoff without live calls | `test/owner-handoff.proof.ts`: actual local worker prepares full audio and physically selected video; the host verifies each Blob digest against its native receipt, passes invented transcription/plan/image results through the real owner adapters, then natively exports, edits and re-exports. Exactly two upload/delete doubles, one transcription, one plan and one image double; no selection for manual-only and no provider repeat on re-export. Test-process flags remain fake/paid-off and no API key exists. |
| Failure/cancel/rejection counts | Clip-batch and provider compatibility suites cover a failed sibling, queued cancellation with zero dispatched calls, successful siblings, duplicates, stale revisions, edits, cleanup failures and explicit recovery. Native provider proof cancels an observed in-flight encoder after its partial appears, preserving previous admitted output/source. |
| Linked-source lane | CL-023 native/manual evidence and current acquisition/API/library suites cover exact Best/tier binding, automatic synthetic component merge/inspection into ordinary editing, duplicate imports, missing/damaged/changed variants, preservation after processing failure and restart/offline reuse before all downloader/metadata/provider gates. These are synthetic sources/injected process/network ports; no actual YouTube source has been acquired. |
| Public boundary | New `public-boundary.test.ts` checks valid public analysis/selection/render requests reject owner ranges, duration overrides, multiple candidates and mutable manifests. Six public route probes reject owner header/cookie/query attempts. Artifact markers now also cover provider activation and local input jobs. |
| Ownership/privacy/resources | Auth/Host/Origin, path/junction, immutable hashes, draft recovery, source sharing, source deletion and worker concurrency tests remain included. The opt-in resource sampler records only process identities/counts/working sets/threads and file sizes; no command lines, environment, media bytes or dialogue. |

The local [workflow guide](../operations/LOCAL_WORKFLOW.md), owning app
guides and agent command guide cover exact startup/stop behavior, tools, limits,
storage/deletion, safe CLI actions, fake/provider distinctions and open gates.

### Browser and actual built CLI

An isolated hidden fake stack used temporary synthetic libraries, leaving the
owner's actual Downloads/Desktop libraries untouched. Health/capabilities
reported simulated AI/source, planning available, local media and cloud off.
The browser accepted two manual ranges plus one AI clip; keyboard Space and
pointer selection worked. One completed clip opened for review while another
rendered. Caption arrow movement, Bold preset, numeric position, Apply and a
second export worked with unchanged one-plan/one-picture counts.

With the browser closed, the actual built CLI discovered the protected host,
validated/applied a further caption position and exported revision 2. Reopening
the browser showed three exports. Save, clear and reopen restored that revision,
position and outputs with no repeated analysis. These agent UI checks do not
complete the separate owner's CL-025 usability/visual acceptance.

Protected shutdown returned 204. Four recorded process identities had zero
survivors after stabilization; 4100/4200 listeners, workspace scratch, capability
state and discovery were gone. Temporary synthetic input/libraries and the
test-only launcher were removed. Content-safe logs/screenshots remain at
`C:/Users/minat/AppData/Local/Temp/clipbuilder-cl024-browser-cfe7b1b7164940cea1d78e9629e21355`
and runtime logs at `C:/Users/minat/AppData/Local/Temp/clipbuilder-owner-runtime-WKmRFC`.
Retained masters, captures and earlier private logs were preserved.

### Resource observations and limits

The sampler runs only in the opt-in synthetic harness, at a 500ms scheduling
interval plus query/scan time. Values are sampled observations, not continuous
maxima or capacity guarantees. Aggregate process working sets may count shared
pages more than once. Disk observations count logical file payload and unique
file identities; they do not measure filesystem allocation/metadata overhead.
Browser engine/utility processes and threads are included; one overlay page is
not a claim of a single-threaded Chrome process. Sampler PowerShell/console
query helpers are excluded from workload counts. Different peaks need not
occur at the same instant.

Settled synthetic run (8 native tests / 6 files, 160.66 seconds):

| Observation | Measured value |
| --- | --- |
| Combined batch window / samples | 36,158ms / 26 |
| Concurrent media jobs / observed FFmpeg processes | 1 / 1 |
| Peak aggregate working sets | 985,780,224 bytes (about 940MiB) |
| Peak workload processes / Chrome processes / aggregate threads | 9 / 8 / 200 |
| Peak logical file payload / unique-identity payload | 15,126,500 / 3,902,771 bytes |
| Tracked workload child identities / survivors | 49 / 0 |
| CLI export-request cancellation settlement | 72ms; the job may still be starting |
| Observed in-flight native audio cancellation/drain | 403ms after its encoding partial appeared |
| Full 60-minute audio / 300-second video proxy bytes | 14,660,131 / 1,337,232; both below 16MiB |
| Explicit discovery / selected-clip AI doubles | Four transcription + four selection actions, then three plans + three pictures; unchanged by edit/re-export/cancel |

The private repeatable JSON observations are ignored under
`.local-build/evidence/cl024-batch.json` and `cl024-native-cancel.json`. These
numbers describe this small synthetic workload and fixed proxy envelopes, not
maximum-complexity source/edit performance or live provider latency.

## Validation and dispositions

The first extended harness used a stale policy revision, correctly receiving
409, while an unconditional sampler assertion obscured that failure. The
scenario now increases revisions, preserves primary workflow failures and
always removes its owned root even if sampling fails. The final native matrix
passes without relaxing existing timeouts or assertions.

Read-only validation found the missing explicit owner-master reset in shared
test setup. The inherited-true regression reproduced it before application
imports; shared setup/native children now force false. Existing fake/paid-off/
test-mode gates prevented live composition throughout. The five pre-import and
seventeen readiness/local checks pass; the correction is recorded under CL-019.

Final read-only revalidation of the combined tracked/untracked packet:
**Meets the authorized synthetic/local acceptance scope; no actionable
findings.** Covered: combined source/range/batch/editor/draft/agent behavior,
native provider-input handoff with injected transports, public request/route/
artifact boundaries, resource/cancellation measurements, path/auth/privacy and
cleanup. Real source/provider/rights/human gates remain unverified below. No
external processing, credential-file access, paid call, installation, cloud
change, deployment or push was performed. No product-scope deviation was needed;
the mandatory handoff/test-isolation corrections returned to CL-019 before
acceptance. The one-worker fallback remains in force.

Final settled gates pass: `format:check`, `lint`, `typecheck`, `test:unit`
**1,607 tests / 142 files**, deterministic fake/paid-off `build`, `owner:build`,
`owner:proof` **8 tests / 6 files**, and the expanded `owner:artifacts`
**1,490 built files plus Docker/compiler roots**. Relative documentation links
and `git diff --check` pass. Root units used `VITEST_MAX_WORKERS=1`; no test
timeout or assertion was relaxed. Windows standalone still has 26 external
package links (`selfContained:false`), so this is not a target Linux image or
deployment proof. Generated Next declaration noise was restored. CL-025 stays
unchecked for owner evidence; no CL-015 release gate is closed.

Remaining owner-only gates: actual real-provider activation/model quality,
network/Files deletion behavior and latency, source/software/font/image rights,
real downloader/Deno/EJS/egress readiness and source/method clearance, actual
YouTube quality/access, maximum-complexity 4K/300-second responsiveness and human
visual/A/V acceptance. Two-worker concurrency is disabled and unverified. No
local result closes CL-015 public release or deployment gates.
