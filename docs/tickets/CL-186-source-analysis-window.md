# CL-186 — Choose the source window before transcription and discovery

Status: Authorized and queued, 2026-11-02. Owner AFK authorization lifts the
previous execution hold; use execute/validate/fix loops and local
ticket-prefixed commits without push. Depends on CL-185 and implemented
CL-168/169/181. CL-188 adds actual partial YouTube acquisition; CL-189 handles
long Codex windows.

## Owner request and proposed UX

For an upload or YouTube source, choose a start and end so AI transcribes and
finds moments only in that part. Example: analyze 00:30:00–00:50:00 of a
two-hour source. This is an analysis scope, separate from the short output-clip
ranges.

- Offer Entire video or a single contiguous Start/End window with hour-aware
  timestamps. Default to the whole available source and retain inputs when
  navigating. Multiple disjoint analysis windows are outside this first packet;
  separate requests may analyze separate parts without concatenating clocks.
- Support uploaded/saved local sources and local YouTube intake. The normal
  hosted upload UI may use a window only within its unchanged source, duration,
  transcription/spend and session limits. YouTube remains absent when hosted.
- Put fields inside the existing active intake/selection slot, use shared
  controls, and retain one relevant footer action. Do not append another
  workflow or overload manual clip ranges to represent a twenty-minute analysis
  window.
- Validate `0 <= start < end <= available source end` against measured metadata
  at every trust boundary. Apply local Gemini or hosted existing limits before
  any dispatch. A small window never bypasses uploaded-file admission limits.

## Clocks, coverage and completed work

Use a distinct source-window contract rather than `ownerCutSchema`, whose
short-clip bound is currently five minutes. Define original-source time,
imported section time and output-clip time explicitly. Preserve an
original-source offset for section downloads; display useful original timestamps
and translate exactly once for playback, captions, Hook, camera, exports and
Jump to source.

Extract/transcribe only the requested window. AI discovery receives that
window's words/context and cannot choose outside it. A verified wider transcript
may be reused by slicing; partial coverage may never masquerade as full
coverage. Bind coverage/cache identities to source fingerprint, provider/runtime
compatibility, window and relevant revisions. Persist them through drafts and
rolling recovery. Changing the window retains usable acknowledged work and
requires an explicit analysis action for uncovered parts; no auto-dispatch or
retranscription on a UI edit. Full-source selection remains explicit.

## File allocation and verification plan

Contracts: dedicated source-window/coverage shape, analysis/source metadata and
tests. Backend: analysis/cache/provider ports and source-clock conversion;
renderer: scoped audio extraction; frontend: existing intake/selection fields,
playback and persistence. Docs: source of truth, affected service guides,
packet.

Fake/no-key/paid-off tests cover a two-hour metadata source with a twenty-minute
window, exact requested extraction and provider counts, invalid/empty/reversed
windows, stale source revisions, source-end rounding, partial/wider cache reuse,
restore, exclusions and provider/hosted guards. Synthetic browser/native proof
must include nonzero original offsets and correct captions, Hook, face framing,
Jump to source and exported media. Inspect desktop/phone fields, keyboard,
footer/loading/cancel/error states. Run scoped static checks and validate.

## Capability and authorization boundary

Fake mode proves routing/clocks with fictional words, no keys or real ASR. Real
local Codex needs prepared local ASR/speaker tooling, ChatGPT login/allowance
and local gates; Gemini needs its key and live approvals. Real transcription
accuracy and long-window speed remain owner acceptance. Uploading a selected
window still transfers the uploaded file unless a future client-side trim is
implemented; partial network acquisition belongs specifically to CL-188. This is
documentation only: no implementation, provider/download test, config, restart,
model installation, cloud, deployment or Git mutation.
