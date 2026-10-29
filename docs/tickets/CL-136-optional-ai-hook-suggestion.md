# CL-136 — optional AI Hook suggestion

Status: implemented and locally validated with fake/injected AI. Owner editorial,
real-AI and physical-device acceptance remains open. Owner request, 2026-10-29.
Depends on completed CL-129/132 Hook editing/fidelity. CL-135 local Codex
implementation is locally validated and remains uncommitted for owner review;
preserve that work and add support without committing or changing provider choice.

## Decision and file allocation

The existing selected-clip AI planning response may suggest one clip-relative
Hook range of at most ten seconds. Request it together with pictures/focus in
Gemini and with sampled focus in Codex; no additional inference, retry or
generation action. Keep it separate from active edits. Hook shows an AI sparkles
badge, source timestamp range and Use suggestion. Only that explicit choice
changes the draft; Apply/Discard, manual timing, removal/reset, saved drafts and
native preview/export keep the existing behavior and full edit fidelity.
Fake mode chooses a simulated varied range, stable for that clip across retries;
label it as simulated. No keys or provider calls. Missing/invalid suggestions
never reject usable AI plans or trigger another call. Older drafts remain valid.

Allocate before code:

- `packages/contracts/local/hook.ts` / `.test.ts`: safe optional range decoding;
  `clips.ts`: optional preparation/base metadata with source containment;
  `codex.ts`: nullable suggested range in the existing focus output schema.
- Backend `clip-batch.ts` checkpoints optional suggestion through retries/base;
  `server.ts`, `provider-ai.ts`, `codex-ai.ts`, `fake-clips.ts` supply the same
  additive planning getter. Existing provider maps/cleanup own it; no new cache.
  New `apps/backend/local/hook-suggestion-policy.ts` owns the short instruction
  shared by both providers; no copied prompt policy.
  Native parity inspection also found `runtime.ts` explicitly passed global
  fetch, bypassing the existing native RPC header-deadline transport. Remove
  that override so the already documented CPU speech timeout is actually honored;
  recheck existing worker-port/transport tests. No new transport or provider call.
  Focused provider/batch/fake tests exercise no automatic insertion/call counts.
- Frontend `hook-controls.tsx`, `clip-editor.tsx`, `style.css` show the optional
  recommendation and use shared controls/tokens. Extend the existing current-source
  `test/local-focus-editor.proof.ts` for real pointer/keyboard Use/Discard/Apply,
  disabled/readiness states, responsive footer and saved editor state. Extend
  `test/local-codex.proof.ts` only as needed for nullable output/persistence.
- Source of truth, ticket index, local feature/backend guides and this packet
  record behavior/evidence. No API keys, ignored env edits, paid calls, cloud,
  deployment, push or new dependencies. Refresh current normal worker through
  verified backend lifecycle after contract changes; preserve frontend/media.

## Acceptance

- [x] Gemini/Codex request and retain an optional suggested range with no extra call.
- [x] Fake mode supplies a stable simulated range without keys or inference.
- [x] Hook badge/timestamp/explicit Use action works; no automatic Hook or export.
- [x] Legacy/missing/bad optional data preserves usable clips; save/retry/reopen
      retains the suggestion and manual edits independently.
- [x] Focused fake/paid-off unit, browser, types/lint/format and scoped validate
      pass; normal app healthy/current. Owner AI/editorial/real-device/release
      acceptance stays open. No staging/commit/deploy.

## Evidence — 2026-10-29

- Six focused unit files / **93 tests passed**: optional physical Hook decoding,
  Gemini single-call valid/null/malformed advice, fake stable/varied ranges,
  batch inactive metadata, existing manual editor/draft behavior. The batch
  cancellation/restore/retry regression additionally confirms the same advice
  survives with exactly one planning/getter call. A later focused rerun of all
  32 batch tests passed after extending that checkpoint assertion.
- Existing worker transport/progress regressions: **13 tests passed**. Normal
  local runtime now uses the existing native HTTP default rather than explicitly
  overriding it with fetch, preserving bounded long CPU-work header waits.
- `test/local-codex.proof.ts` passed with actual authenticated browser/native
  FFmpeg/export/save-reopen and injected inference/speech. A valid suggested
  range survives in the saved base without an active Hook; malformed advice on
  another clip leaves preparation/captions usable. Exact existing counts remain
  **4 injected Codex calls, 2 fake speech calls, 4 native input jobs**; no extra
  generation, Gemini, paid call or fixture image. No real Codex/Whisper inference.
- `test/local-focus-editor.proof.ts` passed (55.67s final run). Actual Enter-key
  and pointer actions at **1440/390/320 CSS pixels** exercise badge/time display,
  no automatic insertion, Use → Discard and Use → Apply → Remove. Existing manual
  capture/preview, source-clock focus, speakers, gestures, failure/retry and reset
  coverage remains. Six added explicit use/remove edits bring the exact fixture
  edit count from 37 to **43**; plan/image/render counters stay **zero**. All
  three ignored `cl136-hook-suggestion-*.png` screenshots were inspected; touch
  targets, overflow and visible footer checks pass. Browser driver fixes supplied
  the native Enter text and waited for ancestor-fieldset enablement after Apply;
  no production keyboard workaround or timing delay was added.
- Contracts build, contracts/local + local + frontend + proof/root-test types,
  scoped ESLint, Prettier and diff whitespace checks passed. No dependency,
  ignored config, credential, private media or rendering quality change.
- Normal backend-only restart verified **9 old identities removed** and stable
  clean ports before replacement; frontend **15768** preserved. Supervisor
  **14868**, startup backend **25404** / 4000 and worker **17048** / 4200;
  final watcher children **23072** / 4000 and **22448** / 4200 are verified
  descendants of the same supervisor. Health, `/start`,
  `/api/sample/config` return **200**. Content-safe runtime/logs are in
  `C:/Users/minat/AppData/Local/Temp/clipbuilder-hook-suggestion-20261029-cl136/`
  (`backend.runtime.json`, `backend.stdout.log`, `backend.stderr.log`). Owner
  configuration remains untouched. No normal-app processing request ran.

## Scoped validation

TL;DR: optional AI Hook advice is requested in existing calls, retained separately,
and offered through the shared manual controls. Fake recommendations need no keys.
**Verdict: Meets ticket for local implementation/fake validation. No actionable
findings.**

Reviewed current CL-136-owned changes in the worktree at HEAD `04450d6`, including
new Hook policy and Codex integration sections. Earlier CL-135 implementation is
preserved and excluded from a fresh broad audit; this packet adds only the Hook
extensions and the confirmed native-transport composition correction. No staged
diff, new Git action or unrelated file changes. Coverage: provider payload/call
counts, safe optional advice, fake simulation, manual activation/controls,
save/cancel/retry/reopen, responsive keyboard/pointer/footers, documentation and
current worker are covered. No new listener, timer, cache or request is introduced
by choosing a suggestion; existing provider maps own cleanup.

Unverified owner-only gates: real Gemini/Codex editorial usefulness, language/
speech and camera quality, owner-media listening/rights, physical touch devices,
hosted image/runtime, deployment and release acceptance. Gemini needs configured
API keys/live approvals; local Codex needs saved ChatGPT login/allowance, enabled
real/master flags and prepared speech tools. No paid/live/provider/cloud call,
deployment, push, staging or commit was performed. Legacy clips lacking advice
retain manual Hook controls; new processing may supply a recommendation.
