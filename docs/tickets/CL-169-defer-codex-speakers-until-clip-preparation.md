# CL-169 — defer local Codex speaker work until selected clips

Status: complete locally; fake/static/native/browser checks and read-only
validation pass, 2026-10-31. Real AI-route timing/quality remains owner acceptance.
Depends on locally verified CL-168. Its pending changes are preserved; no Git
action is authorized. Use execute/validate with synthetic/fake/paid-off checks.

## Finding and owner intent

The owner asks whether AI moment discovery processes the whole source and can
defer speaker preparation until useful clips are chosen. The current Codex
selection consumes words/IDs/clocks, not speaker labels. Whole-source speech
currently performs both ASR and diarization; only later camera/caption planning
needs anonymous speakers. Keep whole-source words for grounded moment discovery;
skip its diarization and perform that only for explicitly selected clip cuts,
reusing the admitted words rather than rerunning Whisper.

The owner-started CL-168 manual run measured 70.473s moments preparation:
inspection 0.989s, extraction 1.221s, transcription 68.173s and speakers 24.470s.
ASR/speakers overlapped. This proves transcription was the longest stage for that
manual run; it is not a measured AI-route benchmark or proof that skipping
speakers saves its entire duration. No new real processing is authorized.

## Scope and plan

1. Add bounded native ASR-only speech and cut-speaker-only job forms, preserving
   the old speech default. Speaker-only work receives validated clip-relative
   words, changes only anonymous speakerId values, keeps IDs/text/clocks and does
   not run Whisper, Codex or another provider. Existing fingerprint, cut, JSON,
   artifact, time, cancellation, subprocess and scratch limits remain enforced.
2. Local Codex full-source transcription requests ASR only. Manual bounded cuts
   keep CL-168's combined work. Record explicit speaker-readiness on transcripts,
   analyses and moments so cache/save/recovery cannot confuse missing labels
   with completed anonymous/uncertain speaker work. Missing legacy metadata means
   completed, preserving saved work and old behavior. Reuse full-source words on
   selection retry/policy change; partial coverage rules remain unchanged.
3. Add an optional clip-port word preparation step. Only deferred moments request
   selected-cut diarization before temporal sampling/planning. Persist completed
   refined words in the existing partial preparation before the provider call;
   retries/restore must not repeat acknowledged speaker work or transcription.
   Feed those same words into transition samples, Codex grounding, captions,
   pictures and final base. Keep one worker/provider task and no automatic retry.
4. Extend observed Codex stages with selected-clip speaker preparation. Keep
   completed speaker stages visible during frame/planning work; omit speaker
   stages from ASR-only moment discovery. Existing manual UI/footer, models,
   language/quality settings and Gemini behavior stay unchanged. No model
   replacement, GPU/tool download, provider fallback or extra inference.
5. Verify exact fake/native dispatch counts: discovery does ASR once/diarization
   zero, choosing a clip does diarization once/ASR zero, reuse/retry/save/recovery
   repeat neither acknowledged step. Check preserved words/timestamps, transition
   sampling/caption speaker labels, legacy/manual/fake compatibility, malformed
   jobs, bounded progress and cancel/cleanup. Run focused tests, types/lint/format,
   current-source synthetic browser/native export/recovery, then read-only
   validate. Refresh the normal backend/worker only when owner work is idle.

## Whole-file allocation

- Contracts: local codex.ts (closed speech job forms/artifacts), selection.ts
  (speaker readiness), clips.ts (observed phase), relevant local contract tests.
- Native: codex-media.ts/tests and worker timeouts if needed; reuse speaker-turns
  assignment and CL-168 progress/cancellation rather than a second engine.
- Backend: analysis.ts/tests (cache readiness), codex-ai.ts/tests (ASR-only and
  chosen-cut labels), clip-batch.ts/tests (retained enriched words), server.ts
  (restore metadata/optional port), codex-progress.ts (same-clip continuation).
- Frontend: clip-stage.ts/tests and Codex stage view (truthful phase/retained
  completed stages). Preserve the existing flow and footer.
- Proofs/docs: existing synthetic Codex native/browser proof, this packet, index,
  source of truth and local Codex architecture.

## Gates and limitations

All agent tests inject speech/provider results with no API keys, credential reads,
real inference, real YouTube/search, downloads, cloud, configuration changes,
deployment or Git mutations. Keep installed CPU assets/model quality unchanged.
Real Codex still needs installed local tools, saved ChatGPT sign-in/allowance,
enabled local gates and an owner action. Full-source transcription remains the
AI discovery cost; faster models/GPU execution require separate implementation
and owner quality acceptance. Preserve current owner media, recovery and logs.

## Implementation and verification

Full-source discovery explicitly requests `diarize=false`; its observed native
stages omit speakers. Bounded manual cuts keep combined speech work. Cached
ASR-only source words can serve manual windows while retaining deferred labels.
The new closed `speakers` job accepts only a bounded source cut and validated
relative words; it invokes the existing diarizer without ASR/Codex. The backend
canonicalizes and verifies every word field except speakerId is unchanged.
Empty cues skip native speaker work. Temporal sampling, planning, pictures,
captions and the retained base all use the same enriched moment.

Explicit readiness survives canonical analysis/cache and both draft/recovery
restore paths. Completed selected labels are checkpointed in existing partial
preparation before planning. A restored failed-plan retry reuses them. Same-clip
progress retains completed speaker ticks during frames/planning. Gemini, models,
language/quality settings, concurrency, bounds and automatic-retry policy remain.

Checks using cached pinned pnpm 11.19.0:

- `pnpm exec vitest run --config scripts/local-test.config.ts` with backend
  `analysis.test.ts`, `codex-ai.test.ts`, `clip-batch.test.ts`,
  `session-recovery.test.ts`, `codex-progress.test.ts`; renderer
  `codex-media.test.ts`, `codex-speech.test.ts`; contracts `codex.test.ts`;
  frontend `clip-stage.test.ts`; `test/owner-worker-progress.test.ts`:
  **133 tests / ten files pass**. Covers closed admission, exact ASR-only/
  speaker-only dispatches, preserved IDs/text/clocks, deferred cache restore,
  retained labels after failed-plan restore/retry, legacy/manual/fake behavior,
  progress and native cancellation/cleanup.
- `pnpm exec vitest run --config scripts/local-proof.config.ts
  test/local-codex.proof.ts test/local-codex-progress.proof.ts`: **two cases pass
  in 84.68s**. Current-source native worker/overlay and actual browser controls
  prove one full-source ASR-only job, one selected speaker-only job, unchanged
  injected inference/caption counts, expected speaker-change temporal hints,
  captions, preview/export, saved restore/recovery and desktop/phone states.
  Empty-word manual preparation adds no diarizer. Scratch, listeners and browsers
  are removed. Injected delays are observation aids, not performance benchmarks.
- `pnpm local:typecheck`, frontend package `typecheck`, root-test
  `tsc --noEmit -p tsconfig.tests.json`, scoped ESLint/Prettier,
  `pnpm build:contracts` and `git diff --check` pass. Fake tests/proofs run outside
  the Windows sandbox because of CL-168's temporary transform-cache issue,
  retaining credential removal/fake/paid-off/network blocking.

Read-only validate: **Meets ticket locally; no actionable findings**. Reviewed
the incremental CL-169 behavior on preserved CL-168 work, all port consumers,
both restore paths, job discriminants/timeouts, identity/timing preservation,
retry checkpoints and dependency direction. A unit failure exposed object-key
ordering in injected data; comparison now uses the canonical word schema.
No provider retry, model downgrade, motion suppression, private-data diagnostic,
config/cloud change or real agent processing was introduced.

First-time AI discovery still requires full-source ASR. Deferral removes
unselected speaker work/CPU contention; no real elapsed-time claim is inferred
from fake evidence. In-session selection retries reuse ASR, and completed saved
analyses retain their provenance on recovery. No new durable checkpoint for an
unacknowledged interrupted analysis is added. Real AI-route timing, selection
taste with unassigned speakers, ASR/camera quality, accelerated/smaller-model
alternatives and physical-device acceptance remain owner/separate work.

## Normal runtime refresh

Verified idle owner work and captured/stopped all nine owned backend/watcher/
worker identities. Stabilization found no survivors/orphans or 4000/4200 listeners.
Frontend PID 4968/3000, current owner source/results, automatic recovery, saved
drafts and private logs were preserved. Normal startup rebuilt current contracts,
worker/overlay with unchanged owner configuration. Supervisor 2428, API PID
3244/4000 and worker PID 4388/4200 belong to the verified replacement tree. Health,
`/start` and `/api/sample/config` return 200; safe capabilities report Codex ready.
No processing request was triggered. App remains available.

Content-free runtime/log paths outside Git:

- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl169-app-5bfef6da61d7425b836b124770896bcb\backend.runtime.json`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl169-app-5bfef6da61d7425b836b124770896bcb\backend.stdout.log`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl169-app-5bfef6da61d7425b836b124770896bcb\backend.stderr.log`
- Native timings: `C:\Users\minat\AppData\Local\Temp\clipbuilder-local-runtime-EPM8W8\worker.stderr.log`

Deviation: none in product scope; real performance/quality is untested. CL-168 is
preserved; all pending work remains unstaged/uncommitted. No push or deployment.
