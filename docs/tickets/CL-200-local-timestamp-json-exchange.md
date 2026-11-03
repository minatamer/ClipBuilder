# CL-200 — Export and import reusable clip timestamps on local desktop

Status: Locally implemented and verified, 2026-11-03. Owner visual acceptance
open.

The owner canceled the real batch and authorizes sequential execute/validate/fix
loops for CL-198–200. No real AI, download, configuration, Git or cloud action.
Preserve the existing five prepared and four canceled clips, source and
recovery.

## Scope and acceptance

- Local desktop only, excluding Android and phone layouts. Hosted capability
  must exclude both controls. Export Timestamps sits opposite Suggestions in its
  section heading; Import JSON sits beside Add clip under Manual clips. These
  are file-transfer controls, not processing/proceed actions.
- Export every retained suggestion/manual moment currently listed, respecting
  removals and all review pages. Use a versioned, bounded JSON document with
  source fingerprint/duration and original-time ranges. Include no video,
  transcript, cue text, provider payload, title, source URL, private path or
  executable/renderer input. Use a constant download filename.
- Import into manual rows for the currently open matching source. Validate file
  byte/count bounds, version, strict shape, source binding, finite integer
  clocks, source/available-window bounds and supported clip durations before
  changing any rows. Reject mismatches/malformed/oversized data with a concise
  actionable error and preserve current inputs/results. Deduplicate exact ranges
  and avoid silent truncation; source-origin offsets round-trip exactly.
- Populate editable manual rows without submitting analysis, changing provider,
  starting downloads or processing clips. Preserve the existing explicit manual
  workflow and any transcript-dependent preparation behavior; do not promise
  importing timestamps eliminates all later ASR/planning costs.
- Reuse contracts and existing clock/manual primitives. No new backend/provider
  route is needed for the browser-owned file transfer. Clean up file inputs,
  object URLs, listeners and asynchronous reads on navigation/unmount.
- Verify synthetic/no-key round trips, fractional/original clocks, wrong-source,
  schema/size/count errors, repeated imports and no automatic provider/native
  calls. Check desktop placement, Android/phone/hosted absence and keyboard
  access using isolated browser proof. Owner real/visual acceptance stays open.

Initial owners: a browser-safe timestamp contract, frontend exchange module and
selection panel, focused unit/browser evidence and owning documentation. Keep
each ticket's completion evidence separate. No owner media is a fixture.

JSON exchange itself works without keys in fake or real local mode. Subsequent
new clip processing retains normal local speech/Codex sign-in/allowance or the
separately selected provider's live approvals. The normal local app remains
Codex; nothing switches providers or automatically retries paid work.

## Implementation and execute/validate evidence

Export Timestamps downloads one versioned JSON file containing only source
fingerprint/duration/origin and retained original-time ranges. It includes all
review pages, respects removals and uses a constant filename. Import JSON sits
beside Add clip and validates the whole document before replacing editable
manual rows. Success disables AI suggestions and returns to Add clips; neither
file action submits analysis or clip processing. File readers, object URLs and
busy state are cleaned up on completion/navigation. Desktop pointer/viewport,
local capability and Android/iOS exclusion keep both controls off hosted and
mobile surfaces.

The file limit is 1 MiB and export preserves up to 10,000 retained ranges.
Import deduplicates identical ranges and retains the existing ten-manual-clip
limit; larger imports fail explicitly without changing current rows or
truncating data. The current nine-clip use case fits. Strict
version/shape/source checks reject wrong-source, malformed, oversized,
out-of-window or unsupported-duration data. Fractional source frames and
original source offsets round-trip through existing manual-clock primitives. No
backend/provider endpoint was added. A shared pure UTF-8 byte counter also
serves filename and collection bounds without adding DOM or Node dependencies to
contracts.

Verification completed with fake/no-key/paid-off/network-blocked composition:

- 114 combined contract, batch/API, recovery, readiness, reconnect, manual-time
  and selection cases passed; nine focused filename/timestamp/collection cases
  also passed after the shared byte-counter extraction.
- Both isolated generated-media browser proofs passed. The editor proof covers
  desktop/phone/tablet geometry, bounded portrait players, entry motion,
  readiness/dirty guards and naming keyboard/download behavior. The timestamp
  proof exports 25 ranges across pages, imports nine rows, preserves inputs on
  malformed/over-limit files and verifies phone, Android and hosted absence,
  with zero processing POSTs. The final shared-theme timestamp proof also
  passed; desktop placement screenshots were inspected using synthetic content
  only.
- Strict contracts, local, test and frontend type checks, scoped ESLint,
  formatting and whitespace checks passed. Execute/validate fixes included React
  ref ownership, malformed Unicode filenames, header-height accounting,
  asynchronous read cleanup and contracts-only UTF-8 counting. Final review has
  no actionable findings.

After confirming the real batch idle, the normal backend rebuilt its current
worker/overlay and restarted with verified ownership while preserving the
frontend. Health, start, configuration and capabilities GETs returned 200, with
Codex ready. All nine owner clips recovered as five review-ready and four
canceled. A content-free before/after digest confirmed identical clip
identities, states, asset digests, revisions and output records. No canceled
work was retried. Recovery remains the existing two-hour rolling store, not
indefinite retention.

Changed owners: timestamp contract/tests, shared UTF-8 bounds, browser file
exchange hook, selection controls/styles, generated browser proof and owning
documentation. No owner media was used as a fixture and no real AI, acquisition,
render, configuration, Git, cloud or deployment action was performed. Real AI
quality and personal visual acceptance remain owner-only; importing timestamps
avoids Find AI Clips but does not waive later speech/planning prerequisites.
