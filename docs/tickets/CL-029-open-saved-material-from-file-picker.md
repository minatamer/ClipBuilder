# CL-029 — Open saved material through the normal file picker

Status: implemented and verified locally; owner manual acceptance remains open.
Dependency: implemented CL-028. Owner direction 2026-10-23.

The owner removes the permanent Saved drafts/Saved videos sections. The existing
upload action should recognize material from Downloads/ClipBuilder and reopen it
without fresh AI, source acquisition or rendering. Keep the two-choice intake.

## Acceptance

- Remove both permanent library sections. Keep a compact save/status action while
  editing so explicit draft saving and subsequent autosave remain available.
- The existing picker/drop target accepts MP4 and the locally saved draft JSON.
  A draft reference reopens its registered local bundle; arbitrary supplied paths
  or renderer inputs are never followed. Unknown/damaged drafts fail clearly.
- Stream/fingerprint a selected MP4 once. If it matches a stored draft's source,
  raw clip or output, reopen the most recently saved matching draft and matching
  clip. Otherwise use normal video intake. Do not deduplicate by filename.
- Reopening restores saved captions, pictures, edits and existing downloads;
  it dispatches zero AI, acquisition or native render work. Local validation and
  copying/linking of retained bytes remain necessary; do not promise zero I/O.
  A plain MP4 without a matching draft does not contain recoverable edit metadata.
- Preserve single-workspace/busy guards, cancellation, limits, origin/capability
  checks, source/draft/export retention, existing APIs and fake/live provenance.
- Verify synthetic reference/video matching, latest/clip choice, rejection and
  new-video fallback, zero dispatch counts, frontend/boundary/type checks and
  browser intake/reopen behavior. Validate the settled change and record gaps.

Keep AI fake and paid-off. Real downloads remain independently available but are
not agent-tested. No keys/env reads, real YouTube/Gemini/cloud calls, deployment,
Git mutation or removal of existing retained/saved material is authorized.

## Implementation and evidence — 2026-10-23

The permanent draft/video libraries are removed. The existing styled picker and
drop target accept MP4 or `draft.json`. Only a draft's validated ID and source
fingerprint cross the browser boundary; the server resolves its registered bundle.
Video intake hashes the stream and matches source/raw/output digests plus sizes
against saved metadata, choosing the latest matching draft and identifiable clip.
Matching material reopens the existing analysis, captions, pictures, edits and
downloads without fresh AI, acquisition or native render work. Failed matches do
not silently regenerate saved work. Unmatched MP4s retain normal intake.

The editing footer keeps compact saving/status. A validation pass found that an
unapplied editor change could coexist with “Draft saved.” The status now says
“Apply edits first” and disables Save until those form changes are applied. The
browser regression verifies both the restored saved state and dirty state.

Checks actually produced:

- Focused synthetic checks: **35 tests in 5 files** covering stored-byte/latest
  matching, manifest identity/path rejection, new-video fallback, canceled intake,
  damaged-match rejection and client transport/cancellation limits.
- Backend suite: **831 tests in 51 files**. Frontend suite: **485 tests in 57
  files**. Root suite: **130 tests in 15 files**, including boundary and process
  ownership regressions. All use the pinned private runner, forced fake/paid-off
  environment, credential removal and blocked ignored-env loading.
- Contracts/local, frontend and root test TypeScript checks pass. Focused ESLint,
  Prettier and `git diff --check` pass.
- Synthetic browser/native invocation: **2 proofs passed in 83.65 seconds**.
  Intake verifies two columns/phone stacking, no horizontal overflow, 44px action
  targets, 3px focus, secondary demo CTA, absent libraries and zero mutations at
  1440/1024/768/390/320 pixels. The batch proof selects a draft through the actual
  browser file input and opens clip review automatically. Selecting existing
  output bytes returns identical saved output with zero additional native work.
- After the save-status fix, the affected native/browser batch proof passes
  again in **68.83 seconds**. It also checks “Apply edits first” and disabled
  Save, restores the saved discovery count, edits caption/video controls and
  checks editor fit at 1440/390/320 pixels. Exact fake counts remain 4
  transcriptions, 4 selections, 3 plans and 3 pictures. Native peak remains one;
  cancellation is 70ms; **zero process survivors** remain.
- Normal production frontend compilation passes in an isolated closed OS-temp
  source copy using normal Turbopack and existing compiled shared prerequisites.
  Backend server bundling also passes in OS-temp without executing the entry
  point or changing the running native worker bundle. This is compilation
  evidence, not a full root/image/Linux build or deployment claim. The final
  save-status prop change is covered by subsequent types/lint/browser checks.
- Ignored synthetic captures: `.local-build/evidence/cl029-intake-*.png`,
  `cl029-editor-*.png`, `cl029-controls.png` and `cl029-layout.json`. Desktop
  intake and phone dirty-editor captures were inspected. These contain no owner
  media or draft data.
- The existing running app returns 200 for backend health, `/start` and
  `/api/sample/config`. Capabilities confirm synthetic AI, real downloader and
  cloud false. Owned listeners remain frontend 3000, backend 4000 and internal
  worker 4200; the private runtime record was refreshed after watcher reload.
  No unrelated process was stopped, owner configuration read/changed, real
  source retrieved or existing saved material removed.

Owner file-picker/aesthetic acceptance, real-media A/V/readability, actual
YouTube transfer and Gemini quality remain unchecked under CL-025. Fake AI needs
no API keys and these local reuse/native checks are available. Real Gemini still
requires normal keys, enabled flags and applicable owner approvals. No offline
AI runtime/weights were installed or verified. No Git action was performed.

## Validate — final read-only pass

Scope: the settled unstaged/untracked CL-029 implementation, contracts, tests and
owning documentation, against the acceptance criteria above; staged diff empty.
The related CL-028 design work and sampler correction remain in the same worktree
and retain their earlier validation evidence. No unrelated changes were included,
no delegation or Git mutation occurred, and no further suite was run during review.

Verdict: **Meets ticket — No actionable findings**. Both permanent sections are
absent; picker/reference/video matching, latest-draft and clip choice, registered
bundle validation, existing-download reuse, new-video fallback, compact saving
and cancellation/retention boundaries are covered. The earlier Medium save-status
finding is resolved by dirty-state propagation and the passing browser assertion.
The same-origin proxy forwards both new paths through the existing local guarded
host; reopening uses the shared loader and no processing dispatch ports.

Checks reviewed include the focused and package suites, boundary/types/lint,
isolated compilation, actual synthetic picker/output reuse, responsive captures
and zero-survivor native evidence above. The standalone-MP4 metadata limit and
owner-only real-media/provider/manual acceptance remain explicit. Only evidence
documentation and final formatting checks changed after this settled review.
