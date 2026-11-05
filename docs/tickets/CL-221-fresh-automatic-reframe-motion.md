# CL-221 — Automatic Motion on fresh source reframes

Status: Complete locally; owner fresh regeneration pending, 2026-11-05. Dependencies: CL-216/218 implemented; owner
reports fresh regeneration still fails required Motion. Their reported camera
interval begins around 0:26 and the same speaker shifts around 0:33; these times
are reproduction guidance only, never production/test special cases.

## Owner revision and scope

Fix the normal fresh-preparation path. Never repair or overwrite the owner's
saved clip to demonstrate success. Leave its source/base/edits/exports intact;
finish generated fake/no-key mechanics and native/browser checks, then ask the
owner to regenerate for real fresh-pipeline acceptance. No provider calls,
source acquisition, model/configuration changes, cloud, deployment or Git action.
Read-only investigation can reuse a separate private copy of already prepared
source pixels and current plan metadata; do not write findings with media,
transcript, names or source IDs into Git or normal logs.

Use execute/validate/fix loops. Preserve pending CL-218/219/220 changes. Follow
source-of-truth automatic Motion semantics: track the selected speaker over the
camera interval when their head would leave fixed framing, preserve composition
and steady follow, and respect identity ambiguity, genuine cuts/loss, source
clocks, resource bounds, cancellation and no automatic AI retry. Do not mask a
failure with a particular saved edit, canned path, timestamp, URL or expected
path count. Reopen/restore/export remain reuse-only; fresh clips get the fix.

## Investigation and allocation

Read-only regenerated-clip metadata confirms zero paths despite admissible
selected/seeded camera intervals. Inspect actual initial seed/tracker/escape/
retention/attachment to identify the generic failure; private diagnosis only.
Allocate automatic follow and pixel matching/planning contracts as evidence
requires, existing backend fresh attach/native preview path, regression tests
and native proofs, source of truth/guides/packet/index. Avoid changing speaker
selection unless evidence proves an integration defect.

## Acceptance

- Reproduce a real generic cause of missing Motion on fresh preparation.
- Automatic Motion follows a verified same speaker through late layout shifts
  without jumping to another visible person or tracking static background.
  Stationary/in-frame movement stays fixed; independent camera cuts remain cuts.
- Generated regressions cover the confirmed failure and contrasting ambiguity/
  occlusion/cut, late shift, binding, cache, fresh attach and cleanup cases.
  Current-source native and browser crops agree and show the person stays framed.
- Build/reload normal backend worker with verified lifecycle ownership, preserving
  frontend and owner state; no saved clip patch or real pipeline execution.
- Record exact produced checks and limits. Real end-to-end acceptance remains
  pending owner regeneration after handoff.

## Evidence

Confirmed failure: both native HTTP readers capped replies at 8 KiB, appropriate
for receipts but too small for bounded numeric Motion paths. Normal logs show
the initial preview failed, then an explicit retry completed in milliseconds.
Retry had a compiled base and therefore omitted followFocus, converting the
failed initial handoff into a successful preview with no Motion. Earlier direct
tracker tests bypassed this HTTP boundary and could not catch the defect.

General corrections: only clip-preview replies may use the existing 1 MiB JSON
budget, consistently in both streaming readers; every other receipt/progress/
cancel reply retains its old small bound. Initial preparation and explicit retry
of an unfinished revision-zero preview both request follow. Completed previews,
exports, reopen/restore and owner-edited clips do not start a new automatic pass.
No tracking algorithm, provider prompt, source-specific coordinate or timing fix.

Evidence produced so far: 65 focused transport/batch unit/API cases pass,
including oversized/default/progress/cancel bounds and explicit retry without
new plan/image calls. A generated fresh OwnerClipBatch flows through the actual
native worker HTTP server/transport, receives an 11,120-byte Motion response,
saves the paths and explicitly exports them with no new AI. The decoded late
frame contains the moving target in the portrait, while fixed framing loses it.
The existing actual-browser camera clock proof passes (38.89 s). A separate
private read-only prepared-pixel trace/crop sheet confirms the reported late
reframe has a usable path; no result is applied to the saved clip.

Normal backend/worker rebuilt and reloaded: ten owned processes stopped,
4000/4200 released/stabilized, new supervisor 10368, backend 16552 and worker
14468. Frontend 6260 preserved. Health, /start and sample config return 200;
source fingerprint and complete saved clip list exactly match the pre-reload
snapshot. Logs remain in the existing private runtime as backend-cl221.*.log.
Final gate passes: 65 focused cases (7.31 s), fresh real-worker/native proof
(17.80 s), actual-browser camera proof, local/no-Node contracts and test types,
scoped ESLint/Prettier and whitespace. Settled read-only validation checked both
RPC bounds, retry eligibility, source binding, unchanged ready/export reuse,
exact injected fake call counts and listener/scratch cleanup: no actionable
findings. Changed production files are worker-transport.ts, worker-port.ts and
clip-batch.ts; focused tests plus a new generated fresh native proof and owning
documentation. Other pending CL-218/219/220 work is preserved and excluded.

No deviation. The defect is fixed in normal fresh creation and explicit retry,
but owner regeneration is still required for actual fresh-provider acceptance.
No saved clip patch, real provider request, external acquisition, configuration,
Git, cloud or deployment action occurred. Existing source, base, edits, outputs
and frontend were preserved exactly; do not treat private diagnostic crops as
fresh end-to-end acceptance.
