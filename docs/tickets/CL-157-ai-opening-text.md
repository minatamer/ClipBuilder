# CL-157 — optional AI text belongs at the opening

Status: complete locally; fake/static/native/review passed after CL-156.
Owner request, 2026-10-30: when AI adds text, show it from the start of the clip;
derive display duration from the length of that title. Applies to Gemini/Codex.
Manual text remains editable at arbitrary valid times. This supersedes the
earlier AI instruction to scatter optional timed text across a clip, not the
rule against adding an unsolicited separate title field/provider request.

## Plan and allocation

- Inspect `apps/backend/local/planned-text.ts`, its focused tests, both provider
  adapters/tests and the existing common clip batch text path before edits.
- Keep text optional and grounded in existing source references. Admit at most
  one useful AI opening text layer so multiple titles cannot overlap at zero.
  Start at frame zero and derive a bounded readable duration from its wording,
  clamped to the clip. Use max(words/3, non-whitespace characters/15) seconds plus
  0.75 seconds of reading lead time, bounded to 2–8 seconds and the clip length.
  No extra AI call. This text bound is separate from CL-156's picture cap.
- Preserve legacy/saved/manual text, Apply/Discard, Hook copying, source/export
  quality, current limits and cleanup. Do not add new UI/prose or a separate
  generated title workflow. This ticket will refine exact whole-file allocation
  and reading bounds after inspection and before execution.
- Validate using focused fake/injected tests and extend CL-156's current-source
  synthetic proof to inspect the actual opening timing/duration/manual edits.
  No paid/provider calls, real sample, cloud, Git action or deployment.

The owner has declined saving current temporary test clips and allows reloading
for fresh manual tests. Retained/saved media and previous review exports remain
protected. Fake mode needs no keys; real Codex/Gemini keeps its normal saved-login
or key/live/master prerequisites. Synthetic checks do not establish AI title
editorial quality on real media.

## Evidence

Refined whole-file allocation before execution: `apps/backend/local/planned-text.ts`
and `.test.ts` own prompt/decoding/reading time; `codex-ai.test.ts` and
`provider-ai.test.ts` adjust existing integrated assertions; `clip-batch.test.ts`
proves manual text can still start later/last longer; `test/local-codex.proof.ts`
checks actual new native/preview opening times and restore. This ticket,
`docs/tickets/README.md`, `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` and
`docs/architecture/LOCAL_CODEX_AI.md` own documentation/evidence. The input schema
keeps its old three-item bound for tolerant legacy output; decode only the first
usable candidate into one opening layer. Existing saved/manual layers bypass it.

Implemented the shared prompt/decoder for both providers. The first usable source
excerpt starts at frame zero; reading duration uses max(words/3, non-whitespace
Unicode characters/15) +0.75 seconds, bounded to 2–8 seconds and clip duration.
Malformed/ungrounded optional candidates are skipped, with no new inference.
Manual edits still support later starts and longer durations.

Eighty focused fake/paid-off/no-key checks pass: 43 decoder/provider cases and
37 batch cases. A one-word title lasts two seconds; twelve short words last
143 frames; long unspaced wording is bounded to 240 frames; short clips clamp.
The batch preserves a manual title starting at one second and lasting nine
seconds through restore and export without additional plan/image calls.
Local/root-test TypeScript and scoped lint pass. The current-source synthetic
native/browser proof, with temporary cleanup instrumentation removed, passes
in 64.34 seconds. A provider-proposed late two-word title normalizes to frames
0–63, the oversized picture remains 30–180, source/camera/output checks and
saved restore pass with no additional AI. All finally cleanup completes; the
earlier CL-156 shutdown stall does not reproduce. Evidence is ignored under
`.local-build/evidence/cl157-*`.

Read-only validate: Meets ticket, no actionable findings. Covered — optional
single opening layer, source references, length-based timing/bounds, same-call
Gemini/Codex parity, tolerant legacy input, manual timing and restore/export,
fake/no-spend and scoped static/native checks. Real editorial/voice/visual/
device/rights/hosted/release acceptance remains unverified. Pending CL-158 owns
session persistence/reconnect and final normal-app refresh. No Git, configuration,
cloud, deployment or provider action. Deviations: none.

Closure: CL-158's final 69.40-second combined proof retains this opening title
and manual edit behavior while proving actual restart recovery. The normal app
and current worker are refreshed; final process/log evidence is in CL-158.
