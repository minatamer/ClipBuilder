# CL-240 — Restore speaker-aware caption attribution and visible colors

Status: Complete locally, 2026-11-06. Fresh real-provider clip and broader
speaker accuracy/device acceptance remain owner-only.

Owner reports that all captions look the same and asks why speaker detection is
missing. Inspect fresh preparation, later Generate captions, Hook copies,
caption-speaker compilation and both preview/native rendering. Current palette
keeps normal text identical and changes only highlight; determine whether labels
are also lost or missing before choosing the smallest corrective implementation.

Owner clarification: the affected excerpt has two actual voices. Its retained
base contains only one anonymous label; palette changes alone do not resolve that
detection failure. Fix the root fresh pipeline, never patch the saved clip. The
owner explicitly authorized a bounded API-free local diarization diagnostic on a
separate copy of the designated public sample. This supersedes the no-real-ASR
diagnostic hold below only for that isolated local check; no paid/provider call,
generation retry or saved-clip mutation is authorized.

## Acceptance and allocation

- Establish the confirmed cause(s) using code plus generated multi-speaker data.
  The later explicit authorization permits the bounded separate-copy public
  local diagnostic, retaining aggregate evidence only in repository documents.
- Preserve available anonymous speaker labels across fresh preparation and later
  caption generation, word IDs/clocks and independent Hook/body occurrences.
  Reuse existing local diarization when needed; do not infer voices from arbitrary
  alternating text or claim detection from a fabricated label.
- Known speakers get stable distinguishable caption colors by default, including
  non-highlight styles. Explicit user colors/assignments and disabled speaker
  coloring remain authoritative; unknown/uncertain speech stays unassigned.
- Speakers UI accurately communicates missing labels and allows the existing
  manual correction flow. Verify default/custom/disabled/unknown behavior and
  matching actual preview/current-source native composition through fake HTTP.
- Focused fake/no-key tests, types/lint/format and execute/validate/fix; record
  physical-device and real-model accuracy limits separately. Rebuild/reload normal
  native worker when contracts/composition/worker source changes.

Allocate only attribution/transcription ports that carry affected data, canonical
caption speaker logic/composition, relevant inspector, generated integration and
proofs, source of truth/guides/ticket/index. Preserve previous work and saved
owner media. No ignored configuration changes, real AI/ASR/provider/download
acceptance, Git mutation, cloud or deployment. Fake fixtures prove mechanics;
real detection needs its configured local model assets or provider/live approvals.

## Confirmed causes and correction

The owner's current excerpt has two voices but its prepared words contain one
known label. Read-only aggregate inspection found 131 words, one label and two
unassigned words. The authorized separate-copy baseline reproduced exactly that
label count: Sherpa itself returned one speaker before the parser/word mapper.
The parser was not collapsing two different labels. Full-source Codex discovery
intentionally defers speakers; selected-clip preparation and manual-cut speech
both use the same native speaker task. Omitted `diarize` already defaults on;
this was not a missing `diarize=true` switch.

The fixed native clustering distance 0.5 merged these voices. Select 0.4 from
the bounded comparison below, explicitly keeping `num-clusters=-1` (automatic),
unchanged installed models/two CPU threads and conservative overlap assignment.
No forced two-speaker count, visual inference of voices, model download, ASR,
provider call or generation retry. This change is in the common fresh native
task, not an edit to this clip. Existing saved labels/outputs are preserved.

Separate issues made speaker colors difficult to see: CL-204 defaulted to
identical ordinary text with only a different word highlight, which is invisible
in non-highlight presets. Known speakers now get distinct light/dark-compatible
foregrounds and complementary highlights. Backgrounds, explicit palettes,
assignments and disabled coloring remain authoritative; unknown speech stays
neutral. Speakers controls report absent/single labels, without claiming the
two manual palette slots are detected voices.

Later Generate captions formerly re-transcribed even prepared labeled words.
Reuse canonical known labels without native/provider work; enrich existing
unlabeled words through speakers-only work and check every field except label
is unchanged. Cold caption generation still uses its normal transcription path.
Refresh independent Hook captions after late generation, preserving its title,
unrelated layers and explicit speaker colors/disable/assignments.

## Authorized local diagnostic

Verified the designated public file's fingerprint matched the source, then
extracted a separate 41-second 16 kHz mono WAV into owned private OS-temporary
scratch. All six inference invocations were local CPU diarization only. No
environment files, sign-in, provider key, API, network download or application
processing endpoint was used. Source/base/edit/export files were not changed.

| Automatic threshold | Audio seconds | Wall ms | Raw speakers | Assigned speakers |
| --- | ---: | ---: | ---: | ---: |
| 0.50 baseline | 41 | 7252 | 1 | 1 |
| 0.45 | 41 | 6720 | 1 | 1 |
| **0.40 selected** | 41 | 6895 | 2 | 2 |
| 0.35 | 41 | 7136 | 3 | 3 |
| 0.40 isolated-turn control A | 8 | 298 | 1 | — |
| 0.40 isolated-turn control B | 8 | 473 | 1 | — |

At 0.4, the unchanged 131 words have 40/88 known assignments and three neutral
words; the baseline has two neutral words. Controls are interior excerpts of
the two returned turns, not an independently annotated broader corpus. These
checks establish the reproduced count failure and bounded correction, not
complete diarization accuracy or reliable speaker-to-face association.
[Official Sherpa documentation](https://k2-fsa.github.io/sherpa/onnx/speaker-diarization/models.html)
and the installed pinned executable's help confirm lower thresholds produce more
clusters and automatic counting differs from a known forced count. The chosen
0.4 is measured local evidence, not an upstream universal recommendation.

## Verification and limits

- Focused fake/paid-off/no-key gate: eight files, 104 tests passed. After the
  threshold correction, the three affected renderer/caption files pass 14 cases,
  including both speech forms, exact engine calls, two-label transport and
  unchanged words/clocks. Codex/Gemini caption reuse and both title ports retain
  their separate injected call-count checks.
- Real host HTTP integration carries fresh words, Hook/title request, Apply,
  later caption generation and both caption occurrences. Red title spans and
  two distinct caption colors survive without extra visual/render planning.
- Current-source native proofs: two speaker/Hook MP4 cases and one styled-title
  case pass; the complete injected Codex HTTP/browser/native workflow passes
  through preparation, local captions, actual MP4 export and saved reload.
  Two initial complete-proof failures were stale CL-233 test assumptions
  (clip name as tab text, all navigation tabs simultaneously visible); selectors
  now use accessible clip labels and the bounded scrolling strip. No product
  layout was changed to satisfy those assertions.
- Generated Codex-browser desktop/phone checks verify body/Hook colors,
  explicit disable/enable and visible palette controls without page overflow.
  Final fixture requests: edits 0, unexpected 0, title requests 0. Fixture tabs,
  listeners and scratch are closed/cleaned; screenshots are outside Git.
- Contracts build, local/frontend types, scoped ESLint and selected formatting
  pass. Read-only validation covers dependencies, authoritative schemas,
  canonical label preservation, body/Hook independence, provider isolation,
  ambiguity, explicit settings, bounded processes and cleanup. No actionable
  findings remain within this packet.
- Normal backend/native worker rebuilt and reloaded through verified ownership;
  old launcher/descendants and 4000/4200 listeners were removed before startup.
  Frontend PID 3496 was preserved. Health, `/start` and sample config return 200.
  Recovery was current; hash comparison confirms source metadata, clip identity,
  base/edit/assets/state/revision/calls unchanged. Only the standard transient
  recovery workspace ID rebound. Original saved/export files were never written.

No real title/provider quality check, fresh end-to-end owner generation, broad
speaker corpus, physical device/AT or hosted acceptance was claimed. API-free
local speaker inference used installed verified assets; normal fresh AI titles
still require the configured provider/runtime, live flags and approvals. No
ignored configuration, saved-clip patch, Git staging/commit/push, cloud or
deployment occurred. Owner should create a fresh clip for real acceptance.
