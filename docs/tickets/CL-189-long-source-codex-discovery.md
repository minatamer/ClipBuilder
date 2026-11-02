# CL-189 — Long-source local Codex transcription and complete discovery

Status: Authorized and queued, 2026-11-02. Owner AFK authorization lifts the
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
