# CL-189 — Long-source local Codex transcription and complete discovery

Status: Implemented; final verification/validation recorded below, 2026-11-02.
Owner AFK authorization lifts the

previous execution hold; use execute/validate/fix loops and local

ticket-prefixed commits without push. Depends on CL-185–187; verify CL-188's

imported section path when available. CL-190 owns preparation/review beyond ten

clips.

## Problem and owner outcome

Analyze a whole two-hour source or its selected window without truncating audio,

dropping late moments or forcing the complete transcript into one oversized

request. Longer sources should scale by bounded work, without a fixed product

duration ceiling. Keep the current Codex model/reasoning choice; video quality

does not determine model quality, and the owner did not request a model switch.

The existing WAV extraction has a 120-MiB `-fs` bound. Two hours of 16 kHz mono

16-bit PCM is about 220 MiB before its small header, so simply lifting source

admission would leave a truncation hazard. Speech artifacts, transcript-word and

prompt/response byte limits, inference deadlines, count schemas and recovery

envelopes must also be audited. No real long video has been tested in planning.

## Owner-designated future test source and spend boundary — 2026-11-02

The owner explicitly requests retaining this public URL in the ticket as the

future long-video acceptance source:

[owner-provided YouTube video](https://www.youtube.com/watch?v=5pk8HLcAAT0). The

owner describes it as about two hours; exact duration, offered formats and

availability have not been fetched or verified. This is a narrow exception for

the supplied public test reference, not permission to commit its downloaded

media, filename/title, transcript, provider output or private identifiers.

The owner permits future testing with this source but asks to avoid spending

credits until the tickets are complete. CL-184–190 implementation remains on

hold pending an execution instruction. Complete their applicable synthetic/

fake/paid-off gates first. Do not spend provider allowance debugging incomplete

code, run repeated real prompt experiments or activate Gemini. If a real final

acceptance attempt is needed after implementation, use only local Codex, the

existing model/reasoning, prepared local speech tools and the designated source.

Start with the smallest useful window, reuse admitted downloaded/transcribed

work, then run a full-source check only where needed to establish CL-189

coverage. Keep it to a necessary acceptance run with no automatic real retry,

provider fallback or credit purchase. Report actual attempts and known usage

honestly; no monetary/allowance estimate has been established. Final subjective

quality and release acceptance remain the owner's decision.

The owner reports selecting Codex in local configuration. Do not read ignored

configuration to verify that statement or overwrite other settings. Any future

normal run must confirm the exposed provider capability is Codex before a real

processing action; if not, stop the action rather than use Gemini. No real URL

lookup/download, ASR, Codex or Gemini request was made during ticket creation.

## Proposed implementation packet

- Extract/transcribe bounded audio chunks within CL-186's effective source

  window; verify each chunk's decoded duration and complete final coverage. Use

  a small deliberate context overlap, stable source-relative word identities and

  deterministic seam reconciliation. Never silently accept file-size truncation,

  mark uncovered audio complete or duplicate seam words/captions.

- Reuse acknowledged completed transcript chunks keyed to source/window/runtime

  compatibility. A smaller analysis window can reuse wider coverage; an

  uncovered extension cannot. Keep ASR-only discovery and defer anonymous

  speakers/camera work to selected short clips, preserving CL-169's performance

  decision.

- Partition discovery by bounded transcript context with enough overlap for

  seam-crossing moments. Each explicit run has a deterministic finite set of

  planned requests covering the requested window, not repeated identical prompts

  until a quota is met. Reconcile overlap using stable evidence/source ranges;

  retain unique useful candidates, full-source timestamps and manual exclusions.

- Revise CL-172's one-selection-call invariant explicitly for local Codex long

  inputs. A run may make one request per planned window and a specifically

  justified bounded reconciliation request; document exact budgets after design.

  These are planned work units, not automatic retries. Gemini/hosted budgets and

  calls stay unchanged. Provider rate limits stop/pause visibly, with completed

  work retained and explicit user retry; no Gemini/API-key fallback.

- Distinguish full completion, partial usable results, canceled work and

  provider output truncation. Do not silently present a truncated

  request/response as exhaustive. Keep editorial judgments advisory and never

  promise the AI will identify every objectively possible moment. No automatic

  provider retry.

- Persist acknowledged chunks/results without one ever-growing JSON envelope or

  hidden total cap. Preserve current local recovery privacy, Start over and

  two-hour expiry; audit expiry during active long jobs and document its exact

  handling before implementation. Do not silently extend retention or delete

  active/owner-saved media. Interrupted unfinished work requires explicit retry.

- Show measured stage/chunk progress and concise partial/failure states within

  the existing slot/footer. Bound native/provider concurrency and per-operation

  timeouts with abortable work units, rather than killing a healthy overall run

  merely because the source is long. Avoid a new general background queue.

## File allocation and verification plan

Contracts: speech coverage/receipts, planned-work counts, analysis artifacts and

compatibility. Backend: analysis cache, Codex discovery/decoding, safe progress,

storage and recovery. Native: chunked speech extraction/inspection and cleanup.

Frontend: existing analysis progress, partial results and explicit retry. Docs:

LOCAL_CODEX_AI, source of truth, service guides and this packet.

Use synthetic metadata, deterministic transcripts and stub ASR/inference. Cover

two hours and longer, last-chunk coverage, beyond-old-byte/word/prompt

boundaries, seam-crossing speech/moments, exclusions, partial cache/recovery,

canceled/failed middle chunks, output truncation, exact planned calls and zero

new calls on restore. Short current-source generated media must verify real

audio chunk/offset and exported clocks without running a speech model. Test

expiry/cancel/process/ scratch cleanup and unchanged Gemini/hosted requests. Run

relevant static/unit/ browser/native checks and validate before enabling

long-source capabilities.

## Capability and authorization boundary

Fake mode proves orchestration and timing with fictional words, no keys/model

inference. Real local CPU speech assets exist in the prior documented setup;

large-model/GPU acceleration and two-hour throughput/ASR quality are unverified.

Real Codex still uses ChatGPT sign-in/allowance and model context/output

capacity, not unlimited offline inference. Gemini requires its API key/live

approvals. Owner real-source quality/performance remains an unchecked acceptance

item. No implementation, real processing/download, new model/config, restart,

cloud, deployment or Git mutation is authorized by this planning request.

## Implemented packet — 2026-11-02

Local Codex now admits structurally safe source durations/byte sizes without the

old one-hour/10-GiB product quotas. Gemini and hosted admission stays bounded.

Every path uses server composition: upload, format offer/selection, component

transfer, native inspection/remux, source library, drafts and rolling recovery.

Actual free disk space and the 10-GiB reserve remain. Transfers check space as

they grow; Codex long transfers use bounded records and an idle deadline rather

than an overall duration/output-volume quota. Codec/SDR/geometry/cadence limits

are unchanged. No configuration, model or reasoning change was made.

Sources/windows over eight minutes take a finite serial pass. Eight-minute

source-aligned speech cores have two seconds of decode context on either side;

subsecond final cores merge into their neighbor. Each 16-kHz mono PCM extraction

is well below the 120-MiB operation bound. Decoded WAV duration must match
within

80 ms before a speech engine runs; an unpartitioned oversized job fails before

extraction. Speech has the existing per-operation deadline. Native inspection

probes the final minute's packet clocks, and caches verified unchanged source

identity within its bounded worker map instead of hashing a large master per

chunk. The master remains unchanged for exports.

ASR-only discovery assigns source-relative hashed word IDs, midpoint core

ownership and matching/overlapping seam-word reconciliation. Speaker/camera work

remains deferred to chosen short clips. Each planned selection window includes

up to sixty seconds from the following core, covering maximum-length seam

moments. All manual exclusions are supplied as advice. Exact duplicate source

cuts reconcile across windows; editorial output remains advisory. Numeric mode

spreads the retained window-ranked candidates over the whole analyzed source,

without another provider request or a claim of a global editorial ranking.

There is one selection attempt per planned nonempty window, no reconciliation

inference, retry loop or provider fallback. A two-hour synthetic run plans

fifteen speech and fifteen selection units. Calls record attempted work; chunk

coverage records acknowledged work. CL-190 removes the aggregate 360-result and

ten-processing-clip guards; an interim overflow is partial, never exhaustive.

Each acknowledged speech/selection receipt is a separately bounded private file

(maximum four MiB). Compatibility includes source fingerprint, coverage and

pinned speech runtime/model revision; selection additionally binds its policy,

all exclusions and transcript content. Wider speech coverage can serve a

narrower request. Saved projects and the existing single rolling recovery store

copy missing receipts before acknowledging their document; there is no new

visible project/cache library. Restore is read-only and explicit retry reads

compatible receipts without ASR/inference. Partial/canceled coverage and fixed

failure hints remain visible; unfinished units require explicit retry. Recovery

write failure stops the run. CL-190 owns incremental aggregate result/clip

persistence beyond the existing envelope.

Expiry semantics are explicit: active analysis/batch jobs cannot expire.

Acknowledged state changes refresh the existing two-hour inactivity deadline;

GET playback/status/progress polling does not. A completed long run therefore

has two hours after its latest acknowledged state, rather than expiring

immediately on leaving busy state. Restart recovery uses the last acknowledged

saved time and the same two-hour interval. Start over removes only owned rolling

recovery/workspace data; retained sources, saved projects and exports remain.

Chunk counts occupy the existing preparation slot. The trusted local Codex

capability removes the frontend proxy's overall analysis deadline; each native/

provider unit remains abortable and bounded. Gemini/hosted deadlines remain.

Partial results identify login, allowance or disk failures with explicit retry.

No analysis starts from polling, reconnect, restore or discovery completion.

## Execute/validate dispositions and evidence

The loop corrected canonical receipt hashing after schema normalization, aligned

narrow-window chunks, subsecond tails, seam duplicates, global-exclusion cache

identity, actual-attempt counts, stale foundation assertions, the frontend's

hidden overall deadline and explicit recovery-write failure handling. Installed

pinned tools were used directly because Corepack could not bootstrap the pinned

package manager; no package install/upgrade was substituted.

Verified with fake/paid-off/no-key transports: two hours and two hours plus a

late tail; six-hour plans; more than 30,000 aggregate words; exact serial
planned

calls; last-source moments; overlapping seams and repetitions; failed middle

chunks; explicit canceled retry; smaller-window reuse; copied receipt reuse;

server close/reopen/retry with zero new media/ASR/selection calls; structural

arithmetic; unchanged Gemini/hosted limits; WAV truncation and oversized direct

job rejection before model dispatch; owned scratch cleanup. Final counts/static

checks are recorded at the final validation gate below.

Current-source native/browser checks: the complete injected Codex workflow and

two section-clock/media cases passed (three cases, 98 seconds total); real

FFmpeg/FFprobe/Chromium, generated media and injected speech/inference only.

The responsive progress case passed with chunk counts, spinners, readable text

and visible footer; phone screenshot inspected. These do not prove long real

ASR throughput, YouTube availability, real moment quality or subjective taste.

All real-source/paid/owner acceptance remains unchecked. No keys/env contents,

provider requests, real downloads, new weights/GPU, normal app launch, cloud,

deployment or push were used.

### Final gate and validate pass

Final settled local regression gate: 909 fake cases across 107 files passed.
After the empty-summary cache finding, 67 focused analysis/recovery cases in
four files passed, including a restored two-hour analysis followed by a
one-minute request with zero additional speech calls and usable moments. The
frontend proxy/transport gate passed thirteen cases. Current-source native/
browser proofs passed four cases across three files; phone/desktop progress
screenshots were inspected. Contracts/local/frontend/test TypeScript checks,
contracts build, scoped lint/format/whitespace and current normal worker build
passed. No normal service was listening on 3000/4000/4200, so no stale worker
was left running or restarted.

Read-only validate final pass: **Meets ticket; no actionable findings** after
resolving the empty-summary cache reuse defect. Covered: server-only admission,
finite bounded work, late/seam coverage, receipt compatibility/recovery,
explicit retry/cancel, disk/expiry semantics and provider isolation. CL-190's
separate aggregate-count/persistence work remains the next packet. Real media,
ASR/Codex quality/throughput, owner visual taste and release acceptance remain
unverified; fake/native evidence is not live AI evidence.

Whole-file staging allocation for this packet (all files are owned by CL-189):

- `apps/backend/README.md`
- `apps/backend/local/acquisition-process.ts`
- `apps/backend/local/analysis-chunks.ts`
- `apps/backend/local/analysis.ts`
- `apps/backend/local/codex-ai.ts`
- `apps/backend/local/draft-store.ts`
- `apps/backend/local/long-analysis.test.ts`
- `apps/backend/local/long-analysis.ts`
- `apps/backend/local/provider-ai.ts`
- `apps/backend/local/runtime.ts`
- `apps/backend/local/server-capacity.test.ts`
- `apps/backend/local/server-long-analysis.test.ts`
- `apps/backend/local/server.ts`
- `apps/backend/local/session-recovery.ts`
- `apps/backend/local/source-acquisition.ts`
- `apps/backend/local/source-library.ts`
- `apps/backend/local/youtube-formats.ts`
- `apps/backend/local/yt-dlp-acquisition.ts`
- `apps/frontend/src/features/local-editing/codex-preparation-steps.tsx`
- `apps/frontend/src/features/local-editing/manual-time.test.ts`
- `apps/frontend/src/features/local-editing/manual-time.ts`
- `apps/frontend/src/features/local-editing/open-local-file.test.ts`
- `apps/frontend/src/features/local-editing/selection-panel.tsx`
- `apps/frontend/src/server/local-workflow.test.ts`
- `apps/frontend/src/server/local-workflow.ts`
- `apps/renderer/local/acquisition-media.ts`
- `apps/renderer/local/codex-media.test.ts`
- `apps/renderer/local/codex-media.ts`
- `apps/renderer/local/media.ts`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/architecture/LOCAL_CODEX_AI.md`
- `docs/operations/CL184_193_EXECUTION.md`
- `docs/operations/LOCAL_CODEX_CAPACITY.md`
- `docs/tickets/CL-189-long-source-codex-discovery.md`
- `docs/tickets/README.md`
- `packages/contracts/local/acquisition-profile.ts`
- `packages/contracts/local/acquisition.ts`
- `packages/contracts/local/capacity.test.ts`
- `packages/contracts/local/capacity.ts`
- `packages/contracts/local/codex-progress.ts`
- `packages/contracts/local/index.ts`
- `packages/contracts/local/policy.ts`
- `packages/contracts/local/selection.ts`
- `packages/contracts/src/ids.schema.ts`
- `test/local-codex-progress.proof.ts`
