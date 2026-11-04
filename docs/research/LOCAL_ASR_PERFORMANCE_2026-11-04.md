# Local English transcription performance — CL-209

This is a workstation-specific comparison for the API-free speech stage of the
local Codex workflow. The demo supports **English recordings only**, locally and
when deployed. Hosted processing remains Gemini. No provider inference, Codex
selection, API credits, cloud compute or deployment was used for these
benchmarks. Real local AI is API-free; fake-mode integration tests do not
measure its accuracy or speed.

## Method and limits

The machine is an Intel i7-10810U (6 physical/12 logical cores), approximately
16 GiB RAM, AMD RX 640 with 2 GiB VRAM and integrated Intel UHD. There is no
NVIDIA GPU. Candidates run sequentially on identical 16 kHz mono PCM audio: two
90-second excerpts and the existing 480.436-second analysis window. There is no
two-hour end-to-end benchmark. A previous owner-run transcription took 451.544
seconds on that window; its Codex selection time is separate.

Every attempted ASR run is retained in the
[ticket ledger](../tickets/CL-209-local-speech-throughput-benchmark.md). Wall
time includes process startup and model loading. Native CPU seconds and peak
resident memory are measured; initial Python launcher-only counters are
explicitly invalidated. No audio, transcript, private path or signed caption URL
is included in this report or Git.

Word comparisons use the retained Whisper transcript and the source's existing
published **automatic** captions. Neither is human ground truth. A separate
54-word synthetic English recording has known text and synthesis word-start
clocks, allowing independent checks of timestamp units, bounds and alignment.
Number formatting contributes to its word differences. Initial incorrectly
scaled synthesis clocks were replaced before timing acceptance. End clocks
derived from the next synthesis event include pauses; start-clock errors are the
meaningful synthetic timing measurement. Owner listening remains a separate
quality check.

## Measured and researched options

| Option                                          | Evidence on this laptop                                                                                                           | Decision or limitation                                                              |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Existing whisper.cpp small, 4 threads           | Historical full window 451.544 s; fixed 90 s screen 81.733 s                                                                      | Comparison baseline                                                                 |
| Same CPU build, 6 / 8 threads                   | Screen 64.920 / 65.542 s, same words                                                                                              | Six is the plateau; eight consumes more CPU without benefit                         |
| Two native processors, 3 threads each           | Screen 69.593 s; changed words and higher memory                                                                                  | No advantage over one six-thread process                                            |
| Q5_1 small, 6 threads                           | Screen 76.682 s; changed words                                                                                                    | Reduced memory does not imply faster execution on this CPU                          |
| OpenBLAS whisper.cpp small, 4 threads           | Screen 38.804 s with identical words/clocks; full 299.607 s                                                                       | Strong accuracy-preserving Whisper option; six threads was slower                   |
| faster-whisper INT8, batch 4                    | Full 191.768 s; automatic-caption disagreement 11.554% versus baseline 7.628%                                                     | Reject the speed gain with this word loss                                           |
| faster-whisper INT8, continuous, no VAD         | Full 263.937 s; automatic-caption disagreement 8.693%                                                                             | Better coverage than batching, still worse agreement                                |
| faster-whisper INT16 / float32                  | Late excerpt 40.594 / 56.607 s with identical words; INT16 full 291.570 s                                                         | Float32 spends more CPU/RAM for no measured improvement                             |
| faster-whisper beam 10                          | Late excerpt 72.057 s; same words as beam 5                                                                                       | No accuracy return for the extra work                                               |
| Distil-Whisper small.en                         | Context retained: large word loss; context disabled: 23.342 / 30.934 s but 9.968% / 18.824% disagreement with retained transcript | Reject on this sample despite speed                                                 |
| Parakeet TDT 0.6B v3 Q8                         | Known-text 3.934 s, start error p95 275 ms; conversation excerpts 22.989 / 29.304 s, no invalid clocks                            | Bounded full window 152.307 / 125.909 s, 1.1 GiB, zero invalid clocks; selected     |
| Moonshine Small streaming, word timing enabled  | Screen 39.747 s, 4 out-of-order clocks and 11.576% reference word disagreement                                                    | Reject current configuration                                                        |
| Moonshine Medium streaming, word timing enabled | Known-text 13.489 s; screen failed clock validation after 60.417 s                                                                | Reject current configuration; failed-process memory unmeasured                      |
| OpenVINO encoder on Intel CPU/iGPU              | Not benchmarked: needs a compatible build and converted IR assets                                                                 | Plausible follow-up, no claim of a measured gain                                    |
| Vulkan on AMD GPU                               | Not benchmarked: pinned Windows release has no Vulkan asset; build toolchain absent and VRAM limited                              | No driver/SDK/OS changes made                                                       |
| CUDA, CoreML, MLX                               | Hardware/platform mismatch                                                                                                        | Not applicable to this Windows AMD/Intel machine                                    |
| Tiny/base, turbo, larger distilled models       | Not benchmarked                                                                                                                   | Size or published GPU speed is insufficient to establish laptop accuracy/throughput |

Upstream implementation facts:
[whisper.cpp](https://github.com/ggml-org/whisper.cpp) documents quantization,
BLAS encoder acceleration, OpenVINO and Vulkan;
[faster-whisper](https://github.com/SYSTRAN/faster-whisper) supports CPU INT8
and batching, while its GPU path needs NVIDIA libraries. Publisher benchmark
hardware differs from this laptop, so those numbers are not substituted for
measurements.

[Distil-small.en](https://huggingface.co/distil-whisper/distil-small.en) is an
English-specialist model.
[Whisper's model table](https://github.com/openai/whisper#available-models-and-languages)
reports relative speed on an A100; it is not a CPU prediction. Model size alone
does not settle this choice.

[Parakeet's original model card](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
identifies the CC BY 4.0 model license. The
[official GGUF conversion](https://huggingface.co/ggml-org/parakeet-GGUF) and
[native CLI](https://github.com/ggml-org/whisper.cpp/blob/master/examples/parakeet-cli/README.md)
provide the local path tested here. Converted weights retain original model
attribution requirements; the conversion repository's code license does not
replace them.

[Moonshine's model inventory](https://github.com/moonshine-ai/moonshine/blob/main/docs/models/available-models.md)
and
[word-timing guide](https://github.com/moonshine-ai/moonshine/blob/main/docs/word-level-timestamps.md)
describe English streaming models and the attention-enabled decoder needed for
word clocks. Timing was enabled in every measured Moonshine run. Its
[execution-provider guide](https://github.com/moonshine-ai/moonshine/blob/main/docs/execution-providers.md)
describes CPU execution. Native thread count was engine-controlled in this
package; environment settings are not claimed to constrain it to four threads.

## Tooling and reproduction boundaries

The explicit benchmark entry point is `scripts/benchmark-local-speech.py`; it is
never imported by app startup or default tests. Use an owned direct child of OS
TEMP named `clipbuilder-asr-benchmark-*`. Its private `private-input.json`
contains the separately copied source path, bounded `window` in milliseconds and
`referenceWords` with text/startMs/endMs. None belongs in Git. `--prepare`
extracts the full window plus screen/late excerpts. Every ASR run needs a unique
`--label`; the scratch lock prevents concurrent runs. Example, after approved
private inputs/tool preparation:

```text
python scripts/benchmark-local-speech.py --scratch <owned-temp-directory> --prepare --label extract-sample
python scripts/benchmark-local-speech.py --scratch <owned-temp-directory> --engine parakeet --parakeet-chunks --threads 4 --sample full --label parakeet-final-full
```

This run used official whisper.cpp b5454 CPU and BLAS release assets. Legacy CPU
archive SHA-256:
`6ba69e3482d7826214f90a6a9c84ca07782aec1e1d0c6a7c30c994fd5d816ccb`; BLAS
archive: `b1158bd10edf92c9799149a6fc5d3e58da3f495241d6fb3423088130e88ffbf3`.
Whisper small model:
`1be3a9b2063867b937e64e2ec7483364a79917e157fa98c5d94b5c1fffea987b`; Q5_1:
`ae85e4a935d7a567bd102fe55afc16bb595bdb618e11b2fc7591bc08120411bb`;
Distil-small.en:
`7691eb11167ab7aaf6b3e05d8266f2fd9ad89c550e433f86ac266ebdee6c970a`. The selected
Parakeet/per-DLL pins are in `scripts/local-speech-tools.ts`.

Experimental faster-whisper 1.2.1 / CTranslate2 4.8.5 use Python 3.11.9 and the
24 official wheel/model hashes in `scripts/faster-speech-lock.json`.
`python -I scripts/prepare-faster-speech.py` explicitly prepares its isolated
benchmark runtime; the normal app never calls it. Early measurements used the
original venv with the same pinned packages. The final sealed-runtime gold2
smoke preserved words/timing and took 20.775 seconds, including a cold 13.459-
second import. This does not replace the recorded earlier measurements.

Moonshine Voice 0.1.5 used the official Windows wheel, SHA-256
`7fc9a84e827360ddb85c2735f44a1502c5575c27dcb476a2555646cd20a70e9d`, and official
English Small/Medium streaming `quantized_26_08_21` assets with attention
decoders. Its downloaded per-file manifest remains in ignored tooling. It is
exploratory benchmark setup, not a production dependency/installation lock. Real
benchmark copies and raw output remain private in owned temporary scratch for
owner listening/review; application per-job chunk/result scratch is removed.

## Other ways to reduce waiting

- Reuse completed, acknowledged chunk receipts. Existing recovery already does
  this without inference; adding another durable transcript cache would change
  privacy/retention semantics and is unnecessary here.
- Keep one bounded ASR job and reserve CPU headroom. More logical threads,
  processors or simultaneous chunks can compete for cache/memory bandwidth and
  lose context. The measured plateau takes precedence over maximum core count.
- Preserve word timestamps. Disabling alignment would benchmark a different,
  insufficient captioning task. VAD/batching must retain quiet speech and long
  pauses; the observed quality loss outweighs their best speed result.
- Keep 16 kHz mono extraction. This already matches the ASR input. Extraction
  took 4.065 seconds; reducing video resolution will not remove the speech
  decoder bottleneck after audio has been extracted.
- Model warming can remove loading, but BLAS Whisper loaded in roughly 0.575
  seconds on the full run. A persistent model service adds lifecycle and memory
  cost for little gain relative to minutes of inference.
- Explicit English language selection is appropriate for the supported demo
  scope, but skipping language detection alone is not a minutes-scale speedup.
- BLAS Whisper profiling attributes about 185 s to batch decoding and 77 s to
  encoding on the full run. Encoder-only acceleration cannot eliminate the
  larger decoder cost; changing the local ASR architecture is worth measuring.

## Recommendation

Use **native Parakeet TDT 0.6B v3 Q8, four threads, serial 60-second cores with
two seconds of context** for the local English workflow. The whole-window
Parakeet attempt exceeded the 6 GiB benchmark limit and was stopped after 27.822
seconds; bounded chunks removed that bottleneck. The two full-window runs took
**152.307 and 125.909 seconds**, with identical words/clocks and peak RSS
**1131.0 / 1130.9 MiB**. This is about **3.0–3.6 times faster** than the
451.544-second historical speech stage on the same analysis window. Do not
substitute the best run for the range or include Codex selection in that gain.
The repeated chunk times vary, consistent with workstation/cache/thermal/load
variation; no OS power or driver settings were changed.

Full-window automatic-caption disagreement was **6.338%** for bounded Parakeet,
**7.572%** for BLAS Whisper and **7.628%** for the retained Whisper result.
Parakeet also passed the independent known-text timing check: median start error
90 ms, p95 275 ms, versus Whisper's 140 / 760 ms. Its full-window p95 start
clock difference against retained Whisper was 340 ms, not an absolute human
error measurement. No invalid/out-of-order clocks occurred in either full run. A
current-source production parser independently reproduced all 1,729 words and
clocks from the real native output exactly. The synthetic native/browser proof
exercised the new engine path, captions, export, restore, injected inference and
provider isolation without real API calls.

BLAS Whisper is the strongest measured Whisper alternative, but slower than
bounded Parakeet. It is a comparison result, not a runtime fallback. Batched
faster-whisper, Distil and current Moonshine configurations failed the measured
quality/timing balance. OpenVINO/Vulkan remain unmeasured follow-ups; no
evidence justifies installing drivers/toolchains or replacing this passing
implementation for them now.

This is the fastest passing **measured** configuration here, not a universal
optimum. The corpus is one conversational window plus synthetic speech; human
listening, wider English accents/noise/content, a fresh-machine setup and a
complete two-hour end-to-end run remain unverified. The selected native
implementation needs no Python or provider key, downloads nothing at runtime,
keeps existing saved outputs and introduces no automatic engine/provider retry.
