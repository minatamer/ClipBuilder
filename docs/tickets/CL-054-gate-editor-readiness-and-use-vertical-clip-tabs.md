# CL-054 — Gate editor readiness and use vertical clip tabs

Status: implemented and validated. Dependency: validated CL-053 (`94c899e`).

Owner request — 2026-10-23: never show a clip's editing card while queued or
exporting, including fake mode. Move clip switching into a left-hand column.
Authority: source of truth, **Focused local clip editing — 2026-10-23**.
Initial worktree/index clean. This is one local frontend follow-up packet;
no new Git action, app restart, provider/cloud call or real download is needed.

Acceptance and implementation:

- Gate editor mounting and ready-only footer actions on completed clip state
  (`ready` or `validated-revision`), prepared base and a completed output. A
  retained base/output never makes queued/preparing/exporting/canceling clips
  editable. Selected/review-ready/failed/canceled states expose no settings.
- Busy clips show only a concise state and continuously rotating spinner in the
  existing content slot. Preserve cancellation, concise failures and explicit
  retry of a prepared failed/canceled clip through the footer.
- Initially preload the source preview before exposing settings or layer handles.
  Show a spinner while loading and explicit retry on initial failure. A later
  playback failure preserves already-visible dirty settings and retry behavior.
- Keep the clip picker in a vertical left rail at desktop and phone widths, with
  ARIA vertical orientation, Up/Down/Home/End navigation, selected/focus state,
  dirty switching guards and no horizontal overflow. One selected clip remains
  visible; retain the existing inspector tabs and contextual footer.
- Add lifecycle regression coverage (including retained data during re-export)
  and extend the generated-media browser/native proof to inspect busy/queued,
  initial preview loading/retry, ready, re-export and left-rail responsive states.
  Use fake AI/paid-off only, no keys, ignored environment reads or owner media.
- Run focused local tests, affected frontend types/lint/format and the existing
  synthetic batch proof; review actual screenshots at 1440/390/320 widths. Run
  the read-only validate pass after the settled implementation and fixes.

Fake mode supports these UI states and actual native media processing with no
API keys. Its captions/plans/images remain synthetic. Real provider AI needs
keys, enabled live flags and applicable approvals; live AI, real YouTube and
physical-device acceptance remain owner-only and unverified in this packet.

Settled evidence — 2026-10-23:

- `exec vitest run --silent --config scripts/local-test.config.ts` with
  `clip-readiness.test.ts`, `runtime-capabilities.test.tsx` and
  `editor-state.test.ts`: **16 tests / 3 files pass**. The gate covers all ten
  lifecycle states in both AI modes, including retained media during re-export
  and ready state without a base/output. The initial restricted-sandbox run
  could not import Windows temporary modules; the guarded outside-sandbox run
  passes with unchanged fake/paid-off and environment/network protections.
- `exec tsc --noEmit -p apps/frontend/tsconfig.json` and
  `exec tsc --noEmit -p tsconfig.tests.json` pass. Scoped ESLint on the four
  changed implementation/unit modules and two proof files passes. Prettier
  checks pass on the changed sources and owning documentation.
- `exec vitest run --silent --config scripts/local-proof.config.ts
  test/owner-batch.proof.ts`: **pass, 108.20s**. These commands use the existing
  pinned guarded runner; no ignored environment files or credentials are read.
  Browser coverage proves retained-base exporting/queued states mount no editor,
  spinner animation remains active, failed/canceled states offer footer retry,
  initial decoded-media gating/retry hides settings/handles, and ready controls
  appear after the actual loaded-data event. Later playback failure retains
  dirty edits and the playhead. Vertical Up/Down/Home/End, wrapping, no-op focus,
  dirty guards, add-more/back navigation and contextual footer checks pass.
- The existing retained canceled fixture now explicitly clicks Retry clip before
  editing: exactly one extra native job and zero extra AI calls. The proof waits
  for initial preview readiness when returning to editing and checks End against
  the actual final clip. No previous requirement or assertion was removed.
  Fresh generated upload → two clips → processing → edits → apply → native
  export/download/full decode → reload/reopen still passes. Exact fake counts:
  **5 transcription / 4 selection / 5 plan / 5 image**; native peak **1** and
  surviving owned resources **0**, with completed proof/scratch cleanup.
- Generated screenshots at **1440, 390 and 320px** were visually inspected and
  fit checks pass: left vertical rail, one editor/inspector and anchored footer,
  no horizontal page overflow. Images stay ignored under `.local-build/evidence/`.
- Existing normal app GET checks: `/start` **200**, backend health **200**, safe
  capabilities **synthetic-ai / cloud:false**. The sandbox blocks these sockets;
  read-only checks outside it succeed. No processing request was made against
  the owner's session. No app was restarted and the other app was untouched.

Read-only validate pass on the combined CL-054 worktree (index empty; no new
implementation commit): **Meets ticket; no actionable findings**. Covered:
readiness/retained-data gating, loading/failure/retry, vertical/keyboard/dirty
navigation, responsive screenshots, native output and cleanup. Reviewed source,
focused tests, proof additions and owning documentation against the unchanged
acceptance above. No schema/dependency/provider boundary or new resource owner.

Changed files: local batch/editor/readiness modules, CSS and readiness unit;
the browser/native proof pair; local README, AGENTS, source of truth and this
ticket/index. Only documentation recording changed after settled checks. No
full root suite/build was rerun for this frontend-only gate/layout correction.
Physical hardware, owner acceptance, real YouTube and real-provider AI remain
unverified in CL-025. Nothing staged, committed or pushed. Deviations: none.
