# CL-209 — Benchmark and accelerate local speech transcription

Status: Complete locally, 2026-11-04; owner acceptance remains below. Depends on
CL-135, CL-168/169, CL-189 and CL-196, all implemented. The worktree was clean
before this packet.

## Owner authorization and scope

The owner requests a ticket, local optimized whisper.cpp versus faster-whisper
benchmarks on the existing demonstration sample, a complete timing record, and
implementation of the fastest option whose accuracy and timestamps hold,
followed by execute/validate/fix loops until no actionable findings remain. This
expressly authorizes bounded real local ASR on a separate copy of that sample
and necessary free official runtime/model preparation. No provider/API
inference, credit use, Codex selection, Gemini fallback, cloud, deployment,
configuration-secret reads, saved-media deletion, staging or commits are
included.

## Authority and decisions

- Preserve the local Codex/hosted Gemini split in
  [the source of truth](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#local-codex-subscription-provider--cl-135-2026-10-29).
- Extend
  [CL-196's file-backed speech boundary](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#file-backed-local-speech-and-failed-analysis-status--cl-196-2026-11-02),
  keeping bounded output, cleanup, cancellation and no automatic inference
  retry.
- Preserve
  [deferred speakers](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#deferred-codex-speaker-preparation--cl-169-2026-10-31)
  and
  [local native scheduling](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#local-codex-performance-and-stage-visibility--cl-168-2026-10-31).
  This request supersedes the earlier fixed four-thread/model-backend choice
  only where measured evidence supports this packet's local speech optimization.
- Owner language decision during execution: the demo supports English input
  only, both locally and when deployed. English-specialist local models may
  qualify after the same measured accuracy/word-timestamp checks. Hosted remains
  Gemini. This supersedes the earlier requirement to preserve multilingual
  support; it does not authorize a quality downgrade, cloud/API transcription,
  automatic translation or a different planning model.
- One ASR process at a time. Compare bounded CPU thread/batch choices, stop
  increasing parallelism when it ceases helping, and retain headroom for the
  existing two-thread selected-clip diarizer. No general queue or auto-tuning
  inference during startup/runtime.

## Benchmark and acceptance

Owner steering during execution expands the research comparison: investigate
additional local performance options and recommend a balance of accuracy and
throughput at the end. Deployment remains Gemini and is excluded. Distinguish
measured laptop results from upstream claims, English-only models from broader
language claims, and transcription throughput from streaming latency. Consider
native BLAS, OpenVINO, AMD Vulkan, distilled/smaller/other ASR models and
existing cache/chunk reuse. This does not authorize driver/OS changes, a new
hosted provider, or reducing the accepted English accuracy/timing standard.

1. Reuse the completed owner-run timing as historical evidence, then extract
   fixed representative audio excerpts from the current authorized sample into
   owned OS-temporary scratch. Do not modify or re-download the saved master.
2. Run a short screening matrix for current/optimized whisper.cpp and local
   faster-whisper CPU INT8 (including appropriate batching). Keep duration,
   input bytes, model family, language behavior and word-timestamp requirements
   comparable. Record every attempted run, including failures, cancellation,
   setup/load/processing/total wall times, threads/batch, peak memory and CPU
   observations. Run candidates sequentially; repeat finalists and validate the
   winner on the longer existing analysis window. Do not infer a full two-hour
   benchmark from an extrapolation.
3. Compare normalized words and aligned word clocks against the established
   sample transcript, with an independent local reference for meaningful
   disagreements where practical. Distinguish agreement with a reference ASR
   from human-ground-truth accuracy. Check known-text synthetic speech plus
   long/pause/end coverage, language handling and finite ordered bounded clocks.
   Reject a candidate that drops meaningful speech, materially worsens relative
   word accuracy or shifts caption timing. Keep transcripts/audio/reference
   text/private paths outside Git; commit-ready evidence is aggregate only.
4. Select the fastest repeatable configuration that passes the recorded gates
   without excessive memory, thread oversubscription or sustained throughput
   regression. Report hardware-specific evidence and unresolved human listening
   acceptance candidly; do not claim universal fastest performance.
5. Integrate exactly that configuration into the normal local native speech
   path. Prepare pinned/free assets explicitly; startup/runtime must never
   download. Fail unavailable prerequisites without a provider/engine retry.
   Preserve existing completed transcripts and saved clips; version any changed
   ASR cache compatibility so incompatible new work is never mislabeled reused.
6. Fake/no-key/paid-off tests must cover the actual worker path, timestamps,
   bounded malformed/oversized/incomplete outputs, failure/cancel cleanup,
   independent diarization, prerequisites and zero provider calls. Complete
   scoped contracts/local/backend/renderer/test static checks and native proof.
   Refresh the normal internal worker only after verifying the owner app idle,
   ownership, saved-state preservation and current-source build parity.
7. Perform a separate read-only validate pass against the final diff. Fix and
   revalidate actionable findings. Update the ticket/index and narrow owning
   docs with only measured evidence. Leave all work unstaged/uncommitted.

## File allocation

- This packet and `docs/tickets/README.md`: scope, run ledger and final
  evidence.
- `scripts/local-speech-tools.ts`, explicit speech preparation and any narrowly
  named faster-speech admission/preparation/runner modules: pinned assets and
  offline process boundary. Add a module only when its implementation arrives.
- `apps/renderer/local/codex-media.ts` and focused speech tests: selected
  runner, word normalization, bounded files and cancellation/diarizer
  integration.
- `apps/backend/local/codex-ai.ts`: speech cache compatibility if needed.
- Existing opt-in local proof plus a narrowly named benchmark harness: generated
  data integration checks and content-free measurements, never owner fixtures.
- `apps/renderer/local/entry.ts` and backend native startup wiring only if the
  selected runtime requires it; preserve closed internal descriptors.
- Owning backend/renderer guides, `docs/architecture/LOCAL_CODEX_AI.md`,
  `docs/operations/THIRD_PARTY_SOFTWARE.md` and the source of truth: actual
  local requirements, licenses, behavior and measured limitations.

## Evidence ledger

Historical owner action, before this packet: Find all completed in 621,674 ms;
local whisper.cpp transcription 451,544 ms; Codex selection 157,277 ms. This is
not a new agent benchmark and no selection call will be repeated here.

Machine: Intel i7-10810U, six physical/twelve logical cores, approximately 16
GiB RAM; AMD RX 640 (2 GiB) plus integrated Intel UHD. Current ASR is pinned
whisper.cpp b5454, multilingual small, four CPU threads, GPU disabled. Measured
results and the selected implementation follow below; GPU alternatives remain
unmeasured.

### Selection and implementation

Selected native Parakeet TDT 0.6B v3 Q8 with the official b5454 BLAS bundle,
four threads, serial 60-second cores and two seconds of overlap context. An
unchunked full attempt hit the 6 GiB guard; chunking bounded peak RSS to 1,131
MiB. The two complete 480.436-second runs took 152,307 / 125,909 ms and returned
identical words/clocks. Two/six-thread screens were slower than four. This is
the fastest passing measured configuration, not a global optimum.
[The research comparison](../research/LOCAL_ASR_PERFORMANCE_2026-11-04.md)
compares every measured family and unmeasured hardware options with primary
sources.

Automatic-caption disagreement: retained Whisper 7.628%, BLAS Whisper 7.572%,
faster INT8 continuous 8.693%, faster INT16 8.469%, faster INT8 batched 11.554%,
bounded Parakeet 6.338%. The reference is existing published **automatic**
captions, not human ground truth. Synthetic known-text Parakeet word-start error
median/p95 90/275 ms; original tuned Whisper 140/760 ms. Both Parakeet full runs
have zero invalid clocks; p95 difference from retained Whisper starts is 340 ms.
No transcripts/reference content or signed URLs enter Git.

Implementation pins executable/DLL/model hashes, retains native/OpenBLAS/model
licenses and NVIDIA/Q8 conversion attribution, and uses a new ignored tool
directory. Explicit preparation only; no runtime download, inference retry or
engine/provider fallback. The native worker splits admitted mono PCM into
bounded cores, captures CLI token output through an exclusive byte-limited
private file, validates complete token counts and finite ordered clocks,
converts 10-ms units once and reconciles overlap by midpoint ownership.
Failed/canceled/malformed/oversized work removes partial files. Stable word IDs,
independent selected-clip diarization and provider isolation remain. New
model/chunk-policy compatibility separates future receipts without rewriting
completed analyses, captions, saved clips or exports.

The owner also explicitly limited both local and deployed demos to English. Root
product README, source of truth and frontend/backend/renderer/provider and
licensing guides record that scope. Hosted remains Gemini; unsupported
languages/translation are a documented limitation, not a new paid-result gate.

### Measurement corrections and failed preparation

- All native wall times include startup/load. Python inference-process counters
  replaced initial venv-launcher-only memory/CPU counters: the first four faster
  screens' resource numbers are **unmeasured**, not 4 MiB inference. Failed
  Moonshine Medium resource numbers are also unmeasured launcher values.
- The first three `gold` runs used a 22.05-kHz synthesis clock against 16-kHz
  audio. Their timing measurements are invalid. `gold2` regenerated actual
  16-kHz speech and direct synthesis boundaries; only gold2 clocks qualify.
- Distil's first no-context attempt used unsupported `-nc`; the CLI printed
  usage and exited zero without JSON in 112 ms. It is a failed preflight, not
  fast ASR. Correct `-mc 0` substantially improved output, but still lost too
  many words.
- Parakeet's initial full run exceeded the 6 GiB memory guard at 27,822 ms and
  its owned process tree was stopped. No completed output was accepted. Bounded
  chunks resolve the observed bottleneck; no increasing parallelism after
  plateau.
- Faster model preparation first requested a nonexistent vocabulary filename;
  corrected to `vocabulary.txt`, reusing verified weights. Model transfer
  150,702 ms; correction 3,247 ms. Q5 download 60,387 ms; BLAS preparation 8,203
  ms; Distil model download 164,368 ms. Parakeet's timed-out initial transfer
  was resumed for its final 814,207 bytes and the full digest verified. Some
  download/setup wall times were not captured; they are not invented as ASR.
- Faster sealed runtime preparation 82,075 ms, repeat 10,793 ms. Its unused
  prototype production admission module was removed when that engine lost;
  benchmark preparation/lock/runner remain isolated from application startup.
  The final sealed-runtime synthetic smoke is included in the ledger.
- A sandbox-temp-root preflight rejected before any ASR process; the authorized
  benchmark then used its actual owner-temp root. No extra inference occurred.
- The first local TypeScript pass found an exact-optional-property mismatch;
  fixed explicitly and the rerun passed. No configuration values were inspected.

### Complete run ledger

`screen` and `late` are fixed 90-second excerpts; `full` is 480.436 seconds;
`gold2` is 22.930 seconds. Disagreement is against retained ASR, except
gold/gold2 which use known synthetic text. Start p95 is agreement with that
reference; it is not human alignment error for conversational speech. All rows
retain the original wall measurement, including rejected or failed runs.
Native/GPU flags, model/compute/batch/context settings are encoded by the labels
and harness.

| Run                              | Input  | Wall ms |   Peak MiB |      CPU s | Word difference % | Start p95 ms | Result                           |
| -------------------------------- | ------ | ------: | ---------: | ---------: | ----------------: | -----------: | -------------------------------- |
| `extract-sample`                 | screen |    4065 |       58.5 |       5.45 |                 — |            — | succeeded                        |
| `cpp-t4-screen`                  | screen |   81733 |      879.7 |     320.73 |             4.823 |            — | succeeded                        |
| `cpp-t6-screen`                  | screen |   64920 |      883.0 |     386.03 |             4.823 |            — | succeeded                        |
| `cpp-t8-screen`                  | screen |   65542 |      884.7 |     484.83 |             4.823 |            — | succeeded                        |
| `cpp-q5-t6-screen`               | screen |   76682 |      595.6 |     452.16 |             6.109 |            — | succeeded                        |
| `faster-t4-b1-screen`            | screen |   44822 | unmeasured | unmeasured |             2.251 |            — | succeeded                        |
| `faster-t6-b1-screen`            | screen |   45132 | unmeasured | unmeasured |             2.251 |          570 | succeeded                        |
| `faster-t6-b4-screen`            | screen |   39926 | unmeasured | unmeasured |             3.859 |          640 | succeeded                        |
| `faster-t6-b8-screen`            | screen |   38665 | unmeasured | unmeasured |             3.859 |          640 | succeeded                        |
| `cpp-t3-p2-screen`               | screen |   69593 |     1176.4 |     406.64 |             2.572 |          860 | succeeded                        |
| `faster-t4-b4-screen`            | screen |   35383 |     1003.4 |      133.7 |             3.859 |          640 | succeeded                        |
| `faster-t4-b8-screen`            | screen |   37106 |     1094.0 |     141.61 |             3.859 |          640 | succeeded                        |
| `cpp-t6-gold`                    | gold   |   20611 |      775.7 |     118.88 |             9.259 |  invalid ref | succeeded                        |
| `faster-t4-b4-gold`              | gold   |   14328 |      689.9 |      49.31 |             7.407 |  invalid ref | succeeded                        |
| `faster-t6-b8-gold`              | gold   |   15572 |      690.1 |      70.77 |             7.407 |  invalid ref | succeeded                        |
| `cpp-t6-gold2`                   | gold2  |   16182 |      774.9 |      94.28 |             9.259 |        760.0 | succeeded                        |
| `faster-t4-b4-gold2`             | gold2  |   12360 |      690.1 |      43.11 |             7.407 |        150.0 | succeeded                        |
| `cpp-t4-late`                    | late   |   90180 |      881.2 |     358.19 |             2.647 |          620 | succeeded                        |
| `faster-t4-b4-late`              | late   |   39004 |      997.2 |     145.95 |             5.882 |          380 | succeeded                        |
| `faster-t4-b2-screen`            | screen |   39400 |      713.3 |     147.95 |             3.859 |          640 | succeeded                        |
| `faster-t4-b4-screen-repeat`     | screen |   40920 |     1003.7 |     153.33 |             3.859 |          640 | succeeded                        |
| `faster-t4-b4-full`              | full   |  191768 |     1050.7 |     736.88 |             9.681 |          440 | succeeded                        |
| `faster-t4-b1-late`              | late   |   32847 |      689.9 |      125.8 |             4.706 |          400 | succeeded                        |
| `faster-t4-b1-novad-late`        | late   |   38490 |      689.9 |     148.75 |             3.529 |          400 | succeeded                        |
| `faster-t4-b1-novad-full`        | full   |  263937 |      785.6 |    1012.55 |             6.899 |          450 | succeeded                        |
| `faster-int16-beam5-late`        | late   |   40594 |      984.6 |      157.8 |             4.412 |          400 | succeeded                        |
| `faster-float32-beam5-late`      | late   |   56607 |     2093.5 |      217.5 |             4.412 |          400 | succeeded                        |
| `faster-int8-beam10-late`        | late   |   72057 |      742.2 |     279.58 |             3.529 |          400 | succeeded                        |
| `cpp-blas-t4-screen`             | screen |   38804 |     1028.5 |     180.17 |             4.823 |          860 | succeeded                        |
| `cpp-blas-t6-screen`             | screen |   46905 |     1032.4 |     311.38 |             4.502 |          870 | succeeded                        |
| `faster-int16-full`              | full   |  291570 |     1049.0 |    1142.22 |             5.565 |          430 | succeeded                        |
| `cpp-blas-t4-full`               | full   |  299607 |     1099.4 |    1347.77 |              0.58 |           40 | succeeded                        |
| `distil-blas-t4-screen`          | screen |   17414 |      729.8 |      81.45 |             64.63 |         8380 | succeeded                        |
| `distil-blas-t4-gold2`           | gold2  |    6044 |      513.8 |      27.52 |            16.667 |        650.0 | succeeded                        |
| `distil-blas-t4-late`            | late   |   30031 |      725.1 |     134.62 |            72.059 |         8260 | succeeded                        |
| `distil-nocontext-screen`        | screen |     112 |        5.3 |          0 |                 — |            — | failed: benchmark_failed         |
| `distil-nohistory-screen`        | screen |   23342 |      529.9 |     111.17 |             9.968 |         1390 | succeeded                        |
| `distil-nohistory-late`          | late   |   30934 |      532.1 |     148.03 |            18.824 |          550 | succeeded                        |
| `parakeet-t4-gold2`              | gold2  |    3934 |      826.1 |      19.81 |             7.407 |        275.0 | succeeded                        |
| `parakeet-t4-screen`             | screen |   22989 |     1325.1 |     124.94 |             3.859 |          550 | succeeded                        |
| `parakeet-t4-late`               | late   |   29304 |     1325.0 |      158.3 |             4.412 |          320 | succeeded                        |
| `moonshine-small-gold2`          | gold2  |    8536 |      323.9 |      57.67 |             7.407 |        333.0 | succeeded                        |
| `moonshine-medium-gold2`         | gold2  |   13489 |      525.3 |       80.5 |             7.407 |        387.0 | succeeded                        |
| `moonshine-small-screen`         | screen |   39747 |      422.9 |     235.47 |            11.576 |          866 | succeeded; 4 invalid clocks      |
| `moonshine-medium-screen`        | screen |   60417 | unmeasured | unmeasured |                 — |            — | failed: benchmark_engine_failed  |
| `parakeet-t4-full`               | full   |   27822 |          — |          — |                 — |            — | failed: benchmark_resource_limit |
| `parakeet-t4-chunks-full`        | full   |  152307 |     1131.0 |     811.78 |              7.71 |          340 | succeeded                        |
| `parakeet-t2-screen`             | screen |   31789 |     1323.9 |       77.7 |             3.859 |          550 | succeeded                        |
| `parakeet-t6-screen`             | screen |   26143 |     1325.8 |     178.58 |             3.859 |          550 | succeeded                        |
| `parakeet-t4-chunks-repeat-full` | full   |  125909 |     1130.9 |     674.27 |              7.71 |          340 | succeeded                        |
| `faster-sealed-runtime-gold2`    | gold2  |   20775 |      690.7 |      23.62 |             7.407 |        150.0 | succeeded                        |

Finalist per-core wall times, in source order (ms):

- `parakeet-t4-chunks-full`: 16245, 19622, 19805, 20502, 18885, 18590, 16782,
  19309, 2227.
- `parakeet-t4-chunks-repeat-full`: 8864, 13405, 13712, 14606, 16156, 19818,
  19617, 17990, 1518.

### Recorded stage timings

Native Parakeet timings recovered from the already-completed private CLI dumps
(no extra inference), summed over nine chunks, in milliseconds:

| Run                              | Model load |    Mel |   Encoder | Decoder | Prediction | Native total | Process wall |
| -------------------------------- | ---------: | -----: | --------: | ------: | ---------: | -----------: | -----------: |
| `parakeet-t4-chunks-full`        |    9158.54 | 861.04 | 134926.45 | 1475.56 |    2521.13 |    149704.21 |       152307 |
| `parakeet-t4-chunks-repeat-full` |    7462.83 |  702.9 | 112333.72 | 1058.75 |    1801.18 |    123962.28 |       125909 |

Python import/load/transcribe/total wall components where recorded by each run
(in milliseconds; runner total excludes Python process startup):

| Run                           | Import | Load | Transcribe | Runner total | Process wall |
| ----------------------------- | -----: | ---: | ---------: | -----------: | -----------: |
| `faster-t4-b1-screen`         |    460 | 1737 |      42252 |        44449 |        44822 |
| `faster-t6-b1-screen`         |    428 | 1814 |      42569 |        44811 |        45132 |
| `faster-t6-b4-screen`         |    471 | 2246 |      36770 |        39487 |        39926 |
| `faster-t6-b8-screen`         |    429 | 2037 |      35858 |        38324 |        38665 |
| `faster-t4-b4-screen`         |    431 | 1557 |      32993 |        34981 |        35383 |
| `faster-t4-b8-screen`         |    363 | 1576 |      34852 |        36790 |        37106 |
| `faster-t4-b4-gold`           |    484 | 1860 |      11484 |        13828 |        14328 |
| `faster-t6-b8-gold`           |   1048 | 2725 |      11172 |        14945 |        15572 |
| `faster-t4-b4-gold2`          |    452 | 1773 |       9752 |        11977 |        12360 |
| `faster-t4-b4-late`           |    508 | 1741 |      36344 |        38593 |        39004 |
| `faster-t4-b2-screen`         |    484 | 2224 |      36264 |        38971 |        39400 |
| `faster-t4-b4-screen-repeat`  |    627 | 2139 |      37796 |        40562 |        40920 |
| `faster-t4-b4-full`           |    777 | 2249 |     188165 |       191190 |       191768 |
| `faster-t4-b1-late`           |    388 | 1081 |      30997 |        32466 |        32847 |
| `faster-t4-b1-novad-late`     |    336 | 1470 |      36317 |        38123 |        38490 |
| `faster-t4-b1-novad-full`     |    667 | 2182 |     260674 |       263522 |       263937 |
| `faster-int16-beam5-late`     |    339 | 1543 |      38434 |        40315 |        40594 |
| `faster-float32-beam5-late`   |    382 | 1685 |      54120 |        56187 |        56607 |
| `faster-int8-beam10-late`     |    597 | 1804 |      69317 |        71717 |        72057 |
| `faster-int16-full`           |    532 | 2456 |     288231 |       291219 |       291570 |
| `moonshine-small-gold2`       |    102 | 1224 |       6827 |            — |         8536 |
| `moonshine-medium-gold2`      |    136 | 2188 |      10765 |            — |        13489 |
| `moonshine-small-screen`      |     84 | 1418 |      37847 |            — |        39747 |
| `faster-sealed-runtime-gold2` |  13459 | 1655 |       5377 |        20491 |        20775 |

Whisper BLAS full native load 574.67 ms, encoder 77,347.97 ms, batch decoder
185,292.55 ms, native total 299,402.81 ms; process wall 299,607 ms. Shared audio
extraction was 4,065 ms. Stages not exposed/captured by an older run are
unmeasured; total wall is always retained.

### Verification produced

- Pre-benchmark fake/paid-off/no-network speech gates: 2 files / 12 tests, 2.58
  s.
- Final focused worker/speech/cache/discovery unit checks: 5 files / 45 tests,
  13.69 s. Includes native clock units, token completeness, silence, pause,
  final remainder, midpoint ownership, malformed/oversized/failure/cancel
  cleanup, no retries, stable legacy behavior and independent diarization.
- Shared process-runner checks: 6 tests, 2.94 s; exclusive bounded stderr file,
  noisy stdout, classified failures, overflow termination and cancellation.
- Current-source native/browser Codex workflow proof: 1 proof, 139.35 s, with
  generated native media and injected Codex/Parakeet/diarizer. Covers real
  controls, caption preparation, export, restore, error/retry and zero Gemini
  dispatch. Fake results establish integration mechanics, not real ASR quality.
- Current-source production parser independently matched all 1,729 real native
  benchmark words/clocks across all nine chunks, without repeating inference.
- Selected bundle setup/admission from already checksum-verified official
  assets: 11,656 ms; public `corepack pnpm local:prepare:speech` idempotence
  passed.
- Contracts/local, backend and renderer type checks and scoped ESLint passed.
  Build-context exclusion checks: 2 tests, 2.01 s. Four Python
  benchmark/preparation modules compile without imports, downloads or inference.
- Normal backend's watcher tree was stopped with verified ownership; app startup
  rebuilt the current overlay/native worker. The first restart exposed a
  checksum-valid Deno executable with two hard links. An identical independent
  copy restored its existing single-link gate, preserving the other link. The
  failed launcher's entire owned tree was removed before the successful launch.
- Final normal stack: backend 19056 / supervisor 19264, internal worker 18696,
  unchanged frontend 20392. Backend health, `/start`, `/api/sample/config` all
  200; exposed capabilities `codex`, `ready`, local-speech, planning available.
  All 24 owner-saved files (9 draft, 5 export, 10 source files) retain their
  exact size and UTC modification time. The other 14 pre-refresh files belonged
  to rolling recovery and were removed by the existing two-hour expiry during
  the final restart; no saved-project/source/export files changed. The prior
  temporary workspace did not restore after the long session; no saved library
  files were deleted or changed. Two-hour recovery policy remains. Runtime/log
  identities remain owner-local, outside Git.

### Remaining acceptance and deviations

Human listening, wider English accent/noise/content coverage, a fresh-machine
installation, a complete two-hour end-to-end run, hosted/device/release/rights
acceptance remain unverified. No real Codex/Gemini selection, API credits,
cloud, deployment, ignored configuration read/change, staged file or commit was
used. The expanded research selected Parakeet rather than either original
Whisper backend because it passed the measured quality/timing gates faster; this
follows the owner's explicit broader-options steering. Other deviations: none.

### Execute/validate/fix record

Pass 1 (read-only final-scope review) found two actionable issues: missing
license notices could pass speech-tool admission, and a result-file open error
could retain its native private path. Execution confirmed and fixed both.
Admission now requires ordinary, nonempty, single-link bounded
license/attribution files; result-file errors retain only a closed safe
reason/code. Three generated prerequisite tests passed in 0.375 s; the six
process tests passed again in 3.30 s. Updated local/root-test type checks and
focused ESLint passed.

Pass 2 re-reviewed the complete settled CL-209 source/tests/docs and new
benchmark modules. Verdict: **Meets ticket within the authorized local scope. No
actionable findings.** The two prior findings are resolved by the actual guards
and passing regression checks. Coverage: measured comparisons/timings,
independent word and known-text clock evidence, bounded serial integration,
failure/cancel/cleanup, prerequisites, receipt compatibility, provider isolation
and English-only local/hosted documentation are covered. Human listening,
broader corpus, fresh-machine/two-hour/hosted/device/release/rights acceptance
remain explicitly unverified; no paid checks were inferred from fake results.
Whole-suite or cloud checks were not rerun for this focused revision. No agent
was delegated.

Final native build precedes its new worker process; owned listener/descendant
records and content-safe logs were refreshed outside Git. No benchmark/proof
processes or benchmark lock remain. Raw benchmark copies/results are
intentionally retained in private owned temporary scratch for listening/review,
never used as fixtures. Selected source/JSON and new-report formatting plus Git
diff/index checks passed at handoff; all work remains unstaged and uncommitted.
Legacy Markdown files retain their existing formatting beyond the narrow new
sections.
