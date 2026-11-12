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

## Owner editorial revision — 2026-11-12

Status: completed and file-validated, 2026-11-12; owner auditions remain open.
This is private transcript-based editorial work, not an
application or provider-prompt change. The owner now rejects six of the previous
eight alternatives and keeps exactly the two ranges in the latest screenshot.
Preserve those endpoints unchanged. Re-read the complete retained transcript,
using the approved passages to guide stronger selections about personal losses,
setbacks, persistence and encouraging the listener through difficulty.

Replace the canonical Downloads timestamp file with the revised selection;
remove the rejected ranges from that file. Prefer complete openings, specific
personal stakes and a clear motivational payoff over generic advice. A proposed
stitch may skip an irrelevant middle only where the surrounding speech remains
honest and coherent. Put its source segments consecutively in the import file
and provide a separate private edit map with order, join words and reasons.
Do not add unrecognized metadata to the strict application import format.

Verify source binding, both unchanged keepers, word-clock boundaries, frame
normalization, import compatibility/order, uniqueness and duration/count limits.
Keep transcript text, editorial notes, source title/identity and real endpoints
outside Git. Preserve the full notebook, source media, current app/session and
exports; no UI mutation, stitching/export, ASR/provider run, configuration change,
Voyagenda operation or Git mutation is authorized by this editorial request.
This reuses real saved ASR output locally without API keys or new inference;
transcript-based continuity does not prove a silent audio/video join.

Verified: read the full retained 5,243-word transcript and inspected the actual
word clocks at the new edges, favoring personal sacrifice, emotional responses
to loss, recovery and encouragement. Matched the source's SHA-256 and saved
original-clock identity. Replaced the canonical timestamp file atomically and
read it back successfully: nine unique source-ordered segments, two unchanged
owner picks, seven new segments and all six rejected exact ranges removed.
Normal schema/import validation preserves every endpoint and row order; export
through the normal 30fps cut conversion returns the same ranges. All segments
are non-overlapping and within the per-segment duration and batch-count bounds.

The companion private guide maps the nine segments into six finished clip ideas,
including three adjacent two-part stitches with explicit omitted intervals,
speech anchors and rationale, plus an optional extended ending. It calls for
body-only exports with consistent style/audio and no repeated Hook/title on the
second part. The approved ranges stay unchanged even when used in a stitch.
The guide distinguishes semantic/ASR-clock checks from unperformed listening,
rendering and final join approval. Both outputs remain only in OS Downloads;
no transcript, source identity or real endpoints enter this packet.

No application source, owner session, retained source/archive, existing export,
ignored configuration or Voyagenda mutation. No browser playback, new ASR or
ClipBuilder provider processing, export/stitch, cloud/deployment or Git action.
Only the owning packet/index and the two requested local editorial outputs change.

### Revised-range session preview handoff

The owner explicitly authorizes replacing the current session's manual ranges
with the revised nine-row timestamp import for source preview. Keep the normal
source/workspace and existing prepared clips/exports; use the Codex browser only.
Import/preview must not submit Use clips, Find moments or Process clips, because
even manual selection submission may start local ASR. No new processing,
provider request, configuration or Voyagenda operation. Verify all eighteen
endpoints and import order, retain both keepers and leave the preview paused.
Verified: the Codex workspace restored the matching current source and old range.
The normal Import JSON action replaced it with all nine revised manual rows;
all eighteen displayed endpoints match the file in order, including both unchanged
owner picks. The old range is absent and prior result selection is cleared by
the normal importer. Source decoding is ready and playback remains paused.
Left Add clips / Manual clips open, with its Jump to actions available. No Use
clips, Find moments, Process clips or playback action was submitted. The normal
Codex panel shows the nine-row badge and revised first range; a private UI proof
stays outside Git. These are unsent manual form ranges, not a claim that form
edits became a durable saved analysis. Existing prepared clips/exports remain.
Owner correction: the import did not update the owner's current view. The
observed nine-row form was only the Codex-opened view, so the earlier current-
session completion claim does not establish a handoff into the owner's view.
The owner now requests file-only delivery and will import the revised JSON
manually. Rechecked the canonical file: all nine ranges match the intended
selection and pass the normal importer, with both approved endpoints unchanged.
No further browser/session action or processing. Status: file delivery verified;
owner import remains owner-operated. Import/manual preview need no API keys;
new AI preparation retains its runtime, live flags and approval prerequisites.

### Final owner-approved selection — 2026-11-12

The owner supplies two screenshots confirming seven final ranges and says they
will process them themselves. Update the canonical private JSON to exactly those
seven unchanged endpoints/order, removing the discarded two-part alternative.
Rewrite the private stitch guide to use the final numbering and source ranges:
join parts 1 then 2, and parts 5 then 6; part 7 remains a standalone or optional
longer ending after 5/6. Parts 3 and 4 stay separate. Explicitly supersede the
earlier nine-row numbering so a later stitch cannot join the wrong exports.
Persist this mapping in the private guide for later recall. No browser/session,
processing, export/stitch, source/configuration or Voyagenda mutation. Status:
completed and read-back verified. The JSON now contains exactly the seven final
ranges in screenshot order, with all fourteen endpoints unchanged. Both outputs
were published atomically and re-read; normal source-bound import, uniqueness,
chronology, per-segment bounds and 30fps round trip pass. The private guide now
supersedes all old numbering and preserves the final stitch plan for later
retrieval. File/schema work uses saved real analysis with no API keys or new
ClipBuilder provider call. Processing is owner-operated under existing gates;
later exported audio/video stitching remains unperformed.
