# CL-186 — Choose the source window before transcription and discovery

Status: Implemented and locally validated, 2026-11-02. Owner AFK authorization
lifts the previous execution hold; use execute/validate/fix loops and local
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
documentation history is superseded by the owner's AFK implementation and local
commit authorization. No real provider/download test, config change, model
installation, cloud action, deployment or push occurred.

## Implementation and evidence

- New contracts `source-window.ts` and tests; local source/workspace, analysis
  and Codex job schemas carry scope/origin/coverage without extending short
  cuts.
- Backend analysis, fake/Codex/Gemini adapters and server restore seed preserve
  canonical source-relative words and acknowledged coverage. Scoped native audio
  extraction lives in `codex-media.ts` / `provider-media.ts`.
- Existing frontend selection panel owns Entire video/section and Start/End;
  shared controls/footer remain. Original labels translate once; manual capture,
  Jump to, captions, camera, Hook and exports continue using local media clocks.
  Manual Add clip starts inside the selected range; invalid fields stay
  editable.
- 154 focused fake cases across seven files pass (range contracts/orchestrator,
  both injected provider adapters, native speech jobs, analysis/manual-time
  regressions). Two-hour metadata with twenty-minute scope does not enable
  production long-source admission. Exact ASR/selection counts are asserted.
- Current-source `local-moment-cards` and `owner-ranges` proofs pass; responsive
  1440/390/320 range screenshots inspected. Offset labels, imported-media jumps,
  retained inputs, restore, anchored footer, cancel and failure checked.
  `owner-provider` adds exact fractional-window audio/frequency verification on
  synthetic VFR/nonzero-stream-clock media, with private metadata stripping.
- Scope allocation: changed contract, backend, renderer and frontend paths
  above, their focused tests, two existing proof files and the owning source of
  truth, index, execution ledger and this packet. No unrelated files.

Final gate: 163 fake cases across nine files pass, plus four browser/native
proof cases across the three proof files (some overlapping runs).
Contracts/local, frontend and root-test TypeScript, scoped ESLint/Prettier and
whitespace checks pass. Current worker/overlay build passes; no normal app was
running to reload. The same unavailable Corepack-pinned bootstrap as CL-185
required using installed lockfile-pinned binaries directly; no dependency
changed.

Validate pass 1 found manual timestamp normalization retained an old two-digit
hour ceiling and Add clip initially defaulted outside a selected range. Both are
fixed; invalid windows return editable feedback before adding a row. Final
settled read-only validate: Meets ticket, no actionable findings. Covered:
scope/offset contracts, per-provider extraction, discovery limits, exact call
counts, wider/partial reuse, persisted coverage, responsive footer and cleanup.
Live accuracy/visual taste/actual download remain unverified and do not waive
the later CL-188/189 gates. No scope reduction or provider-spend deviation.

Real ASR accuracy, face/editorial quality, actual YouTube acquisition and
long-video performance remain unverified. CL-188 supplies section acquisition;
CL-189 supplies long-window chunking. No extra real provider calls or automatic
retry.
