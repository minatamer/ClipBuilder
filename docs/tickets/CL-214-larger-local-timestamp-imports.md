# CL-214 — Remove the ten-row local timestamp import cap

Status: Complete locally, 2026-11-04. Dependencies: CL-200/190 implemented.
Owner real-file/device acceptance remains open.

The owner requests removing the local-only Import JSON error that rejects more
than ten timestamp rows. Accept the whole valid file, deduplicate without
truncating, and allow normal local Codex manual review/submission afterward.
Removing only the parser error must not leave the next action blocked by the
same shared ten-row schema. Retain the existing 1 MiB/10,000-record structural
file safeguards, source binding, clock/duration/window validation and atomic
failure behavior. Preserve hosted/mobile exclusion and explicit processing;
import itself makes zero provider/native requests. Gemini/hosted submission and
clip processing quotas remain unchanged. No automatic reprocessing or owner
state migration, ignored configuration change, cloud or Git mutation.

Allocation: timestamp parser/tests, shared manual retained/request schemas and
capacity-based submission selection, selection panel, local/long analysis and
server admission, existing timestamp browser proof, focused backend tests,
source of truth/frontend guide and ticket/index. Preserve CL-209–213 work.

Verify >10 and 25-row round trips and editable rows, duplicate/malformed/source/
size guards, explicit local manual submission and retained decode, bounded
provider rejection before calls, desktop controls/hosted-phone absence and zero
automatic work. Use only synthetic/fake/paid-off/no-key checks. Run relevant
types/lint/format, separate settled read-only validation and fixes until no
actionable findings. Reload current native worker if contracts/backend change,
using verified lifecycle with owner media/results intact. No real AI run.

Fake/no-key mode proves file transfer, schema admission and injected manual
review. New real preparation still requires installed local speech tools and
Codex login/allowance/live gates, or the selected provider's keys/approvals.

## Implementation and evidence

Removed the import parser's ten-row rejection and obsolete UI error. The
existing 10,000-file-record ceiling is shared with retained manual rows/range
IDs; byte/source/time safeguards and deduplication are unchanged. Retained
analysis can decode larger sets. Submission selects the expanded schema only
from the server's composed local Codex capacity; frontend parsing/Add clip and
both short/long-source coordinators use the same decision. Default/hosted/Gemini
request admission remains ten manual rows before existing narrower processing/
demo limits. No request field/header can enable expansion. This removes the
next-action bottleneck instead of merely allowing the file read to succeed.

Checks, all synthetic/fake/paid-off/no-key/network-blocked:

- Timestamp/short/long analysis gate: 82 cases, first command 33.95 s with 81
  passing and one new fixture failure. That fixture intentionally disabled
  manyClips in earlier tests; the new expanded manual case now supplies the
  actual local Codex profile. Targeted long/manual and HTTP cases pass: four
  cases in 3.43 s. The long case retains/checkpoints all 25 manual results with
  exactly 25 injected cut transcriptions and zero selection calls; the short
  case has one fake transcription and zero selection calls. Neither is a real
  ASR/provider run. Bounded profiles reject before any transcription/selection.
- Server-capacity, collection and recovery gate: 16 cases in 3.06 s, including
  25-row HTTP submission, forged-capacity rejection and preserved state shapes.
- Existing deployed API test for mixed manual/AI and three cumulative clips
  passes in 4.72 s (one selected case; eleven unrelated cases skipped).
  Across focused runs, **99 distinct relevant unit cases pass**.
- Updated real-browser timestamp proof passes in **5.06 s**. Export/import all
  25 rows, repeat import, editable clocks, malformed-file atomic preservation,
  enabled local Add clip, explicit Use clips submission retaining all 25 rows,
  Capture guards/original offsets, desktop action placement and Android/phone/
  hosted absence pass. Import causes exactly zero processing POSTs; explicit
  submission produces exactly one injected POST. No application AI/native run.
- Earlier browser checks exposed two fixture issues: the new submission mock
  referenced module-private sample data (11.40-s failed command); after exposing
  synthetic seed data only in that test, its fresh reload needed to finish
  restoration before Capture checks (9.27-s failed command). The settled wait
  fixes the race without weakening import, submission or Capture assertions.
- Local/frontend/test/browser-safe contracts TypeScript, focused ESLint and
  Prettier pass. Contracts build passes with the existing pinned pnpm shim.
  Whitespace/index checks pass; no staging/commit or Git mutation.

## Runtime and settled validation

Normal source edits briefly reloaded the development backend during an initial
read-only snapshot attempt; it returned local_workflow_unavailable while
starting. The settled snapshot succeeded. Verified backend-only shutdown then
removed the owned supervisor, watcher, children and listeners through a
stabilization check. Normal startup rebuilt the current native worker; frontend
was preserved. Owner configuration was loaded normally and never inspected.

Read-only post-reload checks confirm exact source metadata and clip state. The
owner's new-from-start session had no prepared clips and no active batch; it
remains so. Backend health, `/start` and sample config return 200; exposed
capabilities remain Codex ready/manyClips true/cloud false. Worker bundle is
newer than the changed contract. Logs/runtime identities remain outside Git.
No import, analysis, AI, download, clip preparation or export was triggered on
the owner's real session by the agent. Current media and saved data are retained.

Verdict: **Meets ticket; no actionable findings.** A separate settled read-only
review covered parser/UI wiring, capacity-derived HTTP/domain/long-source
admission, retained/recovery schemas, default bounded behavior, all ticket
criteria, dependency direction, duplicate constants/schemas, stale errors and
cleanup. No new listener/timer/provider boundary was added; existing FileReader,
object-URL, listener and proof scratch cleanup remain. Existing CL-209–213 work
is excluded from this delta. No source edit was made during this pass.

No deviation from owner scope. The normal deployed demo still has a server-side
maximum of three clips per session; JSON import/export remains local desktop
only. No configuration/model/provider, cloud/deployment or Git action. Real
owner-file/device and fresh AI quality checks remain unperformed; the app is
left healthy for the owner to retry Import JSON.
