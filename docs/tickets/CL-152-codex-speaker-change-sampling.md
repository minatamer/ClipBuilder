# CL-152 — Codex samples around speaker changes

Status: implemented and fake/native/static validated; real quality remains open.
Depends on implemented CL-150/151. Plan filed before source edits.

## Owner request and authority

2026-10-30: add sampling around detected speaker changes as well as uniform
coverage, keeping the same image budget. File this plan first, then execute and
validate with fake/paid-off checks and no paid calls. Follow the current
[Codex speaker revision](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#codex-speaker-and-editor-parity-revision--cl-149151-2026-10-29)
and existing [local provider design](../architecture/LOCAL_CODEX_AI.md).
CL-150/151 implementation and synthetic speaker/camera/export evidence are
committed through 89e5b6b. The worktree/index are clean before filing this packet.

## Implementation plan and allocation

1. Add a pure shared numeric sampling policy. Derive clip-relative changes from
   ordered, non-overlapping, known speaker-labelled words; do not infer through
   null/overlapping labels or add speaker/model calls. Bound hints to the current
   60-image ceiling, spreading excess transitions across the clip.
2. Extend the private Codex media job with optional bounded numeric change frames.
   Accept them only for frame jobs inside the selected cut, sorted and unique;
   legacy jobs without hints remain valid. No transcript text enters this job.
3. Use at most half the existing image slots for transition bursts, anchored
   0.2 seconds before each selected change so the three panels straddle it.
   Keep at least half for uniform coverage, including the opening, deduplicate
   anchors and refill collisions within the original per-duration count. Sort
   chronologically. Short clips and end clipping remain valid.
4. Wire the backend's selected moment cues through the existing media port and
   apply the schedule in native extraction. Keep 60 JPEGs / 180 panels maximum,
   existing per-image/artifact/input bytes, timeouts, compression, cut boundaries,
   inference count, camera confidence/hold rules and original exports unchanged.
5. Verify regressions, actual synthetic native extraction, cancelled/scratch
   cleanup and backend wiring; review the settled diff against this packet.
   Rebuild and refresh only the normal backend/worker with verified ownership,
   preserving frontend, owner configuration, private/saved/retained media/logs.

Whole-file allocation:

- `packages/contracts/local/codex-sampling.ts` and `.test.ts` (new pure policy).
- `packages/contracts/local/codex.ts` and `codex.test.ts` (private job admission).
- `apps/backend/local/codex-ai.ts` and `.test.ts` (existing planner/media port).
- `apps/renderer/local/codex-media.ts` and `.test.ts` (native extraction).
- `test/local-codex.proof.ts` (synthetic native/browser integration evidence).
- This packet, `docs/tickets/README.md`,
  `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`, and
  `docs/architecture/LOCAL_CODEX_AI.md` (current policy/evidence).

## Acceptance and verification

- Existing no-hint schedule/count preserved; target bursts cover changes that
  uniform sampling misses. Keep uniform coverage/opening under dense changes.
- Duplicate hints/collisions, missing/null/single speakers, overlaps, unsorted
  words, sub-second/short clips and changes near cut boundaries remain bounded,
  deterministic and chronological. Excess changes spread across the duration.
- Validate malformed/oversize/out-of-cut hints at the private contract boundary.
  Assert exact media/inference fake counts; no additional speech/diarization or
  Gemini/Codex calls. Use synthetic/source-controlled content only.
- Run focused shared/renderer/backend fake unit checks, local types/scoped lint/
  format/whitespace, then the existing opt-in synthetic native/browser proof.
  Harnesses force FAKE_MODE=true, PROVIDER_MODE=fake, paid-off and every live
  flag false before imports, without env/credential reads or external network.
- Read-only validate: compare all changed files with this packet, dependency
  direction, bounds, actual integration, cleanup, privacy and no automatic retry.
- Refresh the current normal backend/worker and verify content-free health,
  frontend page/bridge and capability GETs; these are not inference tests.

No new dependency, UI/control, provider retry, paid/real-media test, environment
change, cloud access, deployment or Git mutation is included. Normal fake mode
uses fictional data without keys; the fake tests inject turns/images/inference.
Real Codex uses installed local speech/speaker models and saved ChatGPT sign-in
with the normal real/master settings. Real voice/face/editorial/listening/device
quality and hosted/release acceptance remain owner-only and are not proven by
these synthetic checks. Gemini remains the default provider and is unaffected.

## Evidence

The shared policy sends only sorted numeric speaker-change frames through the
existing private media job. It conservatively breaks continuity at unknown or
overlapping words (including nested overlap), spreads excess hints across the
clip, keeps at least half the original slots for uniform coverage, and refills
opening/transition collisions. A three-panel burst straddles selected changes at
-0.2/0/+0.2 seconds, clipped/cloned at clip edges. Legacy no-hint jobs remain
uniform; sub-two-second clips retain their original single opening image.

Focused fake gate: four files / 30 tests pass, covering unchanged per-duration
counts through the five-minute limit, sparse/dense changes, legacy/no-speaker
input, unordered words, uncertainty/nested overlap, edge collisions and malformed
hints. The renderer cancellation regression aborts during extraction, verifies
the one injected process call and proves partial images/scratch are removed with
no published artifact. Backend tests assert one media and one inference call.

Exact unit command: `node node_modules/vitest/vitest.mjs run --config
scripts/local-test.config.ts --no-file-parallelism
packages/contracts/local/codex-sampling.test.ts
packages/contracts/local/codex.test.ts apps/backend/local/codex-ai.test.ts
apps/renderer/local/codex-media.test.ts`. Two restricted-sandbox attempts hit
missing Vitest temporary transform files before suite imports; serial execution
outside the sandbox with the same fake/paid-off/no-network setup passes. An
initial cancellation-test assertion matched the whole FFmpeg filter argument
instead of its substring; corrected before the final passing gate.

`node node_modules/vitest/vitest.mjs run --config scripts/local-proof.config.ts
test/local-codex.proof.ts` passes in 60.24 seconds. This uses current-source
overlay/browser/native FFmpeg with injected speech, diarization and Codex. It
asserts the unchanged image count and panels 144/150/156 around the synthetic
5-second change; numeric job hints reach the real extraction path. Native export,
caption speakers/camera switches, editable content, saved reload and cleanup
still pass. Counts remain four injected inference attempts (one intentional
failure plus explicit retry), two speech, two diarization and eight media jobs.
No provider/key/owner-media processing occurs. Private synthetic progress is
`.local-build/evidence/cl152-progress.json`: complete, verified=true.

Shared no-Node/local type checks (`tsc --noEmit -p
packages/contracts/tsconfig.local.json`, `tsc --noEmit -p tsconfig.local.json`),
scoped ESLint, changed-code Prettier and whitespace pass. Contracts prerequisite
build passes using the already cached pinned pnpm 11.19.0. No dependency or
operating-flag changes were needed.

Read-only validate of the settled CL-152 unstaged worktree:

- TL;DR: transition evidence is added within the same image/byte/call bounds;
  the real extraction path and cancellation cleanup are exercised; actual face
  matching accuracy remains unverified.
- Verdict: Meets ticket for implementation and synthetic validation.
  No actionable findings.
- Coverage: Covered — plan-first allocation, bounded numeric admission, speaker
  hints, chronology/coverage, legacy/short/edge/overlap cases, actual backend/native
  integration, cancellation/artifact cleanup, call counts and documentation.
  Covered — shared dependency direction, no raw-content/config/secret exposure,
  no retries/new providers, source/export quality and existing limits unchanged.
  Unverified — real ASR/diarization/face/editorial/listening/device quality and
  hosted/release acceptance; these remain owner-only.
- Checks: reviewed all thirteen allocated files and their neighboring job/camera
  paths, the focused 30-test gate, 60.24-second native/browser proof and scoped
  static gates. No broad suite, real provider or owner-media test was run.

Normal backend refresh: captured and removed nine owned backend identities,
verified ports 4000/4200 and worker-orphan absence through stabilization,
preserving frontend PID 13720 / port 3000. The normal dev command rebuilt the
current worker/overlay; replacement backend 19616 / 4000, worker 2664 / 4200,
supervisor 4060 are verified descendants. Health, /start and sample-config GETs
return 200; capabilities report provider-ai / codex / ready. Owner settings and
saved/retained/private media/logs are preserved. No inference was triggered.

Content-free runtime record and separate startup logs:

- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl152-20261030-df1c440d/backend.runtime.json
- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl152-20261030-df1c440d/backend.stdout.log
- C:/Users/minat/AppData/Local/Temp/clipbuilder-cl152-20261030-df1c440d/backend.stderr.log

Deviations: none in scope or implementation. Changes remain unstaged/uncommitted;
no Git mutation, ignored configuration/credential read, paid/provider/cloud call,
download, deployment or push. A fresh owner analysis/preparation is needed to
observe the new real camera plan; saved clips are not silently reprocessed.
