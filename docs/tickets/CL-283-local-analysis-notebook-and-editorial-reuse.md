# CL-283 — Local developer transcript and analysis reuse

Status: implemented and locally verified, 2026-11-11. Editorial choices await owner review.
Dependencies: retained speech receipts, normalized OwnerAnalysis and local Downloads storage.

## Owner request and scope

The owner wants Codex to read a locally processed video's transcript and AI moment
results, then suggest alternative manually entered ranges matching a new editorial
prompt (currently stronger motivational speech). Inspect the supplied timestamp
export and retained source-bound material without new inference/transcription.
The screenshot appears to retain two suggestions; treat those as keepers and seek
other passages. Real content and recommendations stay in the conversation and
owner-local output files, never committed docs/fixtures/normal diagnostic logs.

The current matching source has four saved speech sections plus normalized moment
results in rolling recovery. That is readable but expires after two hours. The
owner expressly requests durable local per-video transcript/AI-result files in
Downloads for later Codex collaboration, independent of product UI and intake
method (upload/YouTube). Preserve existing sources, drafts and exports.

Persist acknowledged source-analysis speech and normalized AI moment responses
locally only, with original-source clocks, source identity, completeness and clear
synthetic/provider provenance. Keep usable speech when selection fails/cancels;
retain independent analysis attempts and readable transcript text/JSON. Reuse
existing receipts, schemas, atomic/confined storage and recovery data. Do not
expose raw request headers, credentials, auth/capabilities, ignored configuration,
provider transport dumps or new browser routes. Normal diagnostics remain safe.

Hosted/Gemini deployment remains temporary and gains no durable filesystem
archive. Local Gemini/Codex both use the same optional developer archive without
provider mixing or a second setting. Archive failures must not reject, hide or
retry usable AI work. No new metered call, download, cloud/deployment or UI CTA.

## Acceptance and verification

- Preserve/retrieve current retained transcript and normalized results outside
  Git, verify source fingerprint/clock coverage, read the relevant passages and
  return grounded alternative ranges with concise rationale and ASR-boundary caveat.
- Implement bounded source-bound local persistence at the normal composition;
  cover successful, partial and failed-selection speech reuse and disk reopen.
  Preserve actual archive data independently of rolling expiry/Start over.
- Use synthetic/fake/paid-off/network-blocked regression checks, exact provider
  call counts, no-content diagnostic assertions, failure isolation and hosted
  exclusion. Appropriate scoped types/lint/format and read-only validation.
- No owner clip edits, source processing, provider/API spend, configuration read
  or change, Voyagenda, deployment or Git mutation. No normal backend restart
  while owner work is active; if activation needs a later reload, document it.

Transcript reuse and the archive require no API keys once source analysis exists.
New real processing retains its provider/runtime/live/approval prerequisites.
Fake artifacts are explicitly labeled and do not prove real AI quality.

## Evidence

- Matched the supplied original-clock export to the retained local source using
  its fingerprint. Four speech receipts provide 5,243 words covering the whole
  approximately 25-minute imported source, plus ten normalized suggestions. Read
  the transcript and checked the proposed passage boundaries from actual word
  clocks. Six different motivational ranges and concise editorial notes are
  saved only in the private notebook; no real phrases/source IDs/paths enter Git.
- Backfilled a verified permanent current-source bundle under the requested
  Downloads/ClipBuilder/Research. Transcript TXT/word JSONL and normalized AI
  results match the saved source/analysis; all speech coverage is retained.
  An initial compatibility mismatch correctly yielded AI-only coverage, so that
  export stopped before generating recommendations. Reading the actual receipt
  marker recovered the full transcript; no transcription/provider retry occurred.
- Saved two source-bound, canonical-30fps import files: six alternative ranges,
  and those six plus the screenshot's two keepers. Both pass normal timestamp
  import validation (six/eight rows). They have not been applied to owner clips.
  Editorial recommendations are transcript-based, without judging audio delivery;
  the owner should audition boundaries before exporting.
- `OwnerAnalysisNotebook` is an optional local filesystem adapter. It streams
  validated bounded speech sections through fixed-size chunk files into readable
  original-clock TXT/JSONL, records source/scope/provenance and normalized analysis,
  and publishes immutable captures plus atomic latest/broadest/AI pointers. A
  narrow or failed attempt retains older useful data. Large AI output reuses the
  existing paged-document format. Source keys include original-clock origin.
- Storage rejects repository/symlink traversal, validates source/mode/revision
  binding, retains existing disk capacity checks and uses bounded I/O, private
  modes and owned staging cleanup. Constructors do no I/O; no browser route,
  metadata/control exposure or configuration flag is introduced. Model text stays
  data and no headers/credentials/raw transport dumps are accepted by the port.
- Source ASR completion can await a best-effort archive before selection starts.
  Long source checkpoints and final/interrupted completion capture acknowledged
  work. Archive exceptions are content-free storage diagnostics and cannot veto
  a usable result or start an automatic model retry. A speech-only checkpoint
  preserves the previous acknowledged AI-result pointer. Normal local runtime
  composes the adapter for both providers; hosted dispatch explicitly excludes it.
- 74 focused fake/paid-off/network-blocked checks pass across archive, analysis,
  capacity and long-recovery suites. Tests cover original offsets, widest-history
  retention, overlapping receipts/source exclusion, pre-selection speech on disk,
  partial/failing selection, disk cleanup/retry, hosted zero writes, exact provider
  counts and no-content diagnostics. The final archive suite also proves Start
  over preserves its separate archive. A test-only bodyless DELETE initially
  carried JSON Content-Type; correcting those headers passed without app changes.
- Local integration/backend types, scoped ESLint, Prettier and whitespace checks
  pass. Read-only validate of CL-283 additions and integration: meets ticket, no
  actionable findings. Previous CL-276/278–282 work is preserved and excluded.
- Read-only status confirms the original source remains loaded, no clip batch is
  active and backend health is 200. The existing watcher loaded the code after
  the idle-batch check; no manual stack restart, new real analysis, provider call,
  download or configuration change was initiated. Owned fake hosts/temp data and
  private backfill helper are cleaned; real notebooks/media remain preserved.

Deviations: none. No live-AI quality, hosted deployment or owner clip acceptance
is claimed by fake checks. Nothing staged, committed or pushed; Voyagenda untouched.

## Owner preview handoff follow-up

The owner explicitly requests loading the six editorial alternatives and the two
retained choices into the current or a separate session for source preview. This
authorizes importing the prepared eight-range file into the normal local manual
clip controls. Preserve the original results in the private notebook/export;
do not initiate new transcription, AI selection, clip processing or a paid run.
Verify all eight original-clock endpoints and source-preview readiness, and leave
the normal Codex browser open for the owner. No Voyagenda or Git mutation.

Verified: the normal Codex tab imported all eight ranges into Add clips / Manual
clips. All sixteen endpoints match the prepared file; the two keepers remain in
chronological positions three and eight. Source metadata/frames are ready, and
Jump to for an alternative sought the correct original clock. Playback is paused
and muted for the owner. The tab remains open; these are manual form ranges, not
newly processed clips or a claim of durable form autosave. Use clips was not
triggered: the existing long-source manual route can start bounded ASR per range.
Original provider results remain in the existing private export/notebook. The
temporary desktop viewport needed for the desktop-only importer was reset.

## Owner local commit authorization — 2026-11-11

The owner now authorizes the file-level plan, staging and local ticket-prefixed
commits for the pending work. This supersedes earlier no-Git limits for this
batch only. Whole-file allocation, final checks and receipts are recorded in the
[commit plan](../operations/CL-278-283-FILE-COMMIT-PLAN.md). Final validation is
clean: 184 focused fake/paid-off cases, applicable types, scoped lint/format,
CLI syntax, dependency guards and whitespace checks. Prior visual evidence and
owner-only aesthetic/editorial/real-provider acceptance remain distinct. No
push, provider action, configuration change, Voyagenda work or deployment.
