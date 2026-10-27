# CL-091 — retire the demo sample entry

Owner request (2026-10-26): remove the **Use demo sample** CTA completely because
it opens outdated routes/pages. Depends on the current shared upload/editor
flow through CL-090; baseline30880fc is clean. No Git staging/commit, provider,
cloud, deployment or configuration change is part of this request.

## Scope and allocation

- `apps/frontend/src/features/local-editing/experience.tsx`: remove the sample
  anchor and its sole Film/shared anchor-style imports. Keep Choose a video,
  upload/drop, draft picking and local YouTube controls in their existing slots.
- `apps/frontend/src/features/local-editing/style.css`: remove only the now-unused
  source-actions anchor rule; preserve shared button/footer geometry.
- `apps/frontend/src/app/start/page.tsx`: retire the local source=sample branch
  and unused query handling. All /start URLs render the current shared workflow
  with the normal local/hosted capability boundary.
- `apps/frontend/src/features/sample/sample.experience.tsx`: remove the obsolete
  screen wrapper. Repository reference search confirms its only production
  consumer is the retired start-page branch and it has one public export.
  Keep shared sample/media/session helpers, protected API routes, historical
  evidence and all retained/saved media; they are not exclusively this CTA.
- `apps/frontend/src/app/start/page.test.tsx`: update existing entry coverage for
  the shared local/hosted workflow and remove the retired component mock/import.
- `test/local-design.proof.ts`: replace the old CTA requirement with absence of
  the retired entry and the single upload action while keeping responsive,
  keyboard/focus, remaining actions and lifecycle geometry assertions.
- This ticket, the ticket index and narrow source-of-truth decision/evidence.

## Acceptance and verification

The CTA is absent in fake/real local and hosted UI, without an empty replacement
control. Legacy sample query URLs no longer switch to the obsolete screen.
Current upload/YouTube/editor/draft behavior and footer anchoring stay intact.
No saved media, backend routes, schemas, diagnostics, resource gates or provider
semantics change. The frontend watcher should pick up current source normally;
no backend/native rebuild is needed for this browser-only edit.

Use the existing env-file-disabled/network-blocked Vitest configurations with
hardcoded fake/no-key/paid-off setup. Run focused start-page cases, affected
lint/format/frontend and test types, and the existing synthetic designed-intake
proof at desktop/phone sizes, inspecting its screenshots. Verify the old query
using a non-metered normal /start GET; never process owner media or call paid
providers. No new implementation-mirroring test or broad unrelated suite is
needed for this removal. Read-only validate the settled diff and reference
search; fix actual findings and document only evidence produced.

Fake UI/fixture verification needs no API keys. Real AI continues to require
keys, live flags and owner approvals; its quality is not tested here. Leave the
normal fake app available for owner Text/style testing, with changes unstaged.

## Status

Locally complete; changes remain unstaged/uncommitted. Removed the CTA, its
exclusive icon/style imports and CSS rule, the sample query switch and the
1,174-line obsolete screen wrapper. Repository production-reference search has
no remaining SampleExperience/import/CTA/query-link entry. Remaining sample URL
strings in browser proofs assert its absence, and historical audit inventories
remain unchanged. Shared media/session/sample helpers and protected APIs are
preserved; retained/saved assets and configuration were not touched.

Actual verification:

- Two existing start-page cases pass with shared local/hosted entry boundaries,
  using the network-blocked, no-env-file fake/paid-off setup.
- Affected Prettier/ESLint, frontend types and test types pass. Whitespace is
  clean. No unrelated full suite, native rebuild or provider test was run.
- Existing synthetic designed-intake proof passes (one case,70.35seconds),
  retaining its responsive/lifecycle/focus/footer assertions and replacing the
  retired CTA expectation with absence plus one remaining upload action.
  Screenshots at1440×900,390×844 and1440×600 were inspected: button absent,
  readable upload action and anchored controls; the proof also checks its
  tablet/narrow-phone sizes. These are generated fixtures, not owner media.
- Normal read-only GETs to /start and /start?source=sample return200 with the
  current local-intake markup and no retired CTA. The existing frontend watcher
  reflects current source. Normal runtime reports synthetic-ai/cloud=false.

Read-only validate pass1 against baseline30880fc plus this packet's complete
worktree: **Meets ticket; no actionable findings.** CTA/entry/exclusive wrapper
are retired, modern local/hosted behavior remains, no dangling production import
or CTA-only style remains, and real processing/gates are unchanged. Public paid
quality/hosted deployment and personal owner visual acceptance are not inferred
from fixture checks. No deviation from the scoped packet; no staging/commit.

## Subsequent local commit approval — 2026-10-27

The owner approved a file-level plan and local staging/commit of the pending
CL-091–094 follow-ups. [Whole-file allocation](../operations/CL091_094_COMMIT_PLAN.md)
owns the 36-file combined commit. Prior unstaged/no-commit notes above describe
the original implementation handoff and are superseded only for this approved
local Git action. Verification and all remaining owner-only gates are unchanged;
no push, deployment, provider/cloud or configuration action is authorized.
