# CL-087 — AI title, TikTok defaults and accurate preparation stages

Owner revision 2026-10-27: CL-093 supersedes this packet's automatic-title
prompt/accessor/layer behavior in every mode. Keep the evidence below historical;
stages, caption defaults and picture fades remain. New Text is manual-only.

Status: implemented and locally validated; owner visual/real-provider/hosted
acceptance pending. Explicitly owner-authorized 2026-10-26. CL-086's owner-only
acceptance remains open.

## Owner request and constraints

Real-mode clip preparation already performs selected-clip AI visual/focus
planning, picture generation, caption compilation and native playback preview.
The owner requests truthful changing loading labels, a small editable title at
the top, TikTok style by default for captions/text, and fade by default for
pictures. These are new-clip defaults; preserve existing edited/saved content,
explicit export, source quality, provider-output acceptance and retry reuse.

Follow root/frontend AGENTS and source-of-truth CL-087, CL-086 text,
CL-078 caption generation/fake defaults, CL-060 usable output acceptance,
CL-062 measured loading, CL-070 quality and CL-084 preview-first export. No paid
agent test, cloud access, deployment, env inspection/change or Git mutation.
Owner requires successful normal restart and confirmed fake mode before tests;
CL-086 owns that pending prerequisite. Fake/no-key tests use generated media and
injected planning; they do not prove real AI title/editorial quality.

## Decisions and file-level plan

1. **Truthful phases:** extend `packages/contracts/local/clips.ts` with an optional
   closed preparation-stage field. `apps/backend/local/clip-batch.ts` updates it
   only at actual work boundaries: planning edits, adding pictures, compiling
   captions and preparing preview. Clear it on terminal states; old clips without
   a stage keep a generic fallback. No timer-based message carousel, percentages,
   added sleeps or claim to see internal Gemini progress. The rail and shared
   loading treatment in `clip-batch-panel.tsx` use these concise labels. Single AI
   planning covers focus/title/picture planning together; labels may skip very
   fast synchronous work between polls, rather than stall processing for display.
2. **One existing AI request:** extend the current JSON-only selected-clip video
   plan prompt/schema in `apps/backend/local/provider-ai.ts` to request one short
   grounded plain-text title alongside existing pictures/focus. Retain title in
   the same clip-bound plan metadata and expose it through an optional synchronous
   `OwnerClipPorts.title` accessor, following the existing focus accessor. No
   extra transcription/planning call, new model/provider, automatic retry or
   call-budget change. A malformed/missing optional title cannot reject usable
   pictures/focus. Prefer the usable returned title, then the existing AI moment
   title; where needed use a short transcript excerpt as a bounded fallback.
   Never invent external claims or send editable text to another provider.
3. **Checkpoint and native parity:** store the chosen title in preparation so
   retries/saved partial work reuse it. New base overlays get one CL-086 text
   layer, centered near the top, TikTok style, font size 56, visible for the first
   min(4s, clip duration). Stable layer IDs/timing survive edit/save/export.
   The owner can change/remove it through Text. No retrofit of accepted bases or
   saved owner edits. Fake adapter returns a clearly fictional sample title for
   key-free UI use; no Earth picture or automatic fake captions are reintroduced.
4. **Defaults:** new automatic captions and explicit caption generation receive
   TikTok style through the existing caption-style field. Caption inspectors show
   that actual style; new manual text already defaults to TikTok in CL-086.
   Preserve old explicit/implicit caption rendering and all word IDs/times.
   New generated pictures explicitly use fade entrance/exit, matching the normal
   manual-picture defaults; retain old saved motion and explicit alternatives.
5. **Evidence/docs:** update narrow contract/backend/frontend guides and index.
   Add injected-adapter tests for title extraction/fallback/no extra calls and
   preparation checkpoint/default/stage regressions. Cover UI labels/fallbacks
   and actual text rendering/export through the CL-086 tree. No unrequested
   architecture, deployment, cloud allocation or generic timeline work.

## Acceptance and checks

- New real-shaped planning returns title/focus/pictures through one existing
  request; titles are editable text layers with top geometry and bounded timing.
  Missing/malformed title preserves usable output; explicit retries reuse all
  completed AI work. Existing saved/edited documents are unchanged.
- New caption/default text style is TikTok; new generated/manual pictures fade.
  Automatic fake captions remain off and fake pictures remain disabled. Fake
  titles are fictional; real titles still require configured provider keys,
  live approvals and the owner's explicit processing action.
- Loading labels reflect actual active tasks and fall back safely for old clips.
  Preserve responsive geometry, spinners, cancel, failure/retry and ready gates;
  never invent progress or delay fast stages to show a message.
- After the required restart/fake gate: focused plan/batch/caption tests with exact
  injected call counts; affected types/lint/format and contracts boundaries;
  current-source browser stage/default/text and synthetic native export checks.
  Use execute/read-only validate/fix until no actionable local findings remain.
  Rebuild/reload the normal internal worker after shared contract changes.
- Record actual evidence, untouched prior work and unverified owner visual,
  real-provider/real-media and hosted acceptance. No staging/commit without a
  new explicit Git instruction.

## Evidence

CL-086's restart gate is satisfied: normal app reported synthetic-ai/cloud-off
before tests. This packet now extends that implementation with a single planned
title and real preparation-stage metadata, TikTok defaults on newly compiled
captions and new explicit caption generation, and explicit picture fades.
Existing caption styles and legacy implicit caption rendering are preserved.
The caption inspector now resolves the actual automatic base style when no
override exists, including after Reset. The existing title/words fallback makes
optional/malformed headline output independent of usable pictures/focus.

Additional owning files identified during implementation:
`apps/backend/local/clip-title.ts` normalizes only plain text/whitespace and the
80-character physical bound without splitting surrogate pairs; a neutral Clip
highlights fallback covers no usable supplied/moment/transcript text. The shared
title bound/schema lives in `contracts/local/text-layers.ts`, not a duplicate
backend schema. `local/server.ts` carries the optional non-dispatch title port
through normal/hosted adapters. `clip-stage.ts` owns one label mapping for rail
and shared loading view. New focused tests and existing browser/native proof
extensions are written; verified results remain pending below.

Backend-only verified stop/rebuild/reload is underway after contract changes;
the healthy frontend and owner fake/paid-off settings are preserved. No paid,
provider/cloud/configuration/Git action is authorized or performed.

Final read-only review found two concrete integration edges to resolve before
completion: restored interrupted clips retained stale preparation-stage metadata,
and the CL-086 text fitter could over-shrink long text or clip excessive explicit
line breaks because of fixed row padding. The restore path now clears only the
transient stage, preserving title/picture checkpoints. Text fitting now searches
for the largest fitting size, measures proportional background/row padding and
uses linear character advances. A ten-explicit-line bound and actionable error
replace silent clipping; 500 characters, ten layers and soft wrapping remain.
This narrow dependent rendering correction requires current-source native proof
and a rebuilt/reloaded normal worker before final checks. Caption word clocks,
legacy caption paint and paid gates remain unchanged.

The same review found the old Rounded highlight caption background bypassed the
new color/opacity controls. Default legacy word-box paint remains unchanged;
explicit background overrides now replace it through shared paint, and free text
uses the matching rounded background default. A focused legacy/transparent/gray
regression covers this shared-control parity correction.

### Final execute/validate evidence — 2026-10-26

- `node node_modules/vitest/vitest.mjs run --config scripts/local-test.config.ts
  --maxWorkers=1`: **599/599 tests, 61/61 files passed**, final settled source.
  This includes injected one-request title extraction (also malformed/missing/
  overlong output and JSON-schema serialization), exact call counts, retained
  title/pictures on preview retry, all actual preparation boundaries and restored
  interruption cleanup, fake caption default-off, TikTok generation default,
  legacy/explicit caption compatibility, draft persistence and frozen exports.
- `scripts/local-proof.config.ts test/local-text.proof.ts
  test/owner-hosted-editor.proof.ts --maxWorkers=1`: **3/3 current-source
  browser/native cases passed**. Real mouse/keyboard/touch gestures, text
  timing/Capture, count/line/empty/invalid limits, saved/reloaded edits, stale
  writes, desktop/390/320 layout and four phase labels are covered. The injected
  hosted-shaped upload/editor flow verifies the automatic top title, TikTok
  captions, explicit export and download, loading/failed/canceled/retry states
  and cleanup. It does not prove actual hosted identity or live provider quality.
- Native generated 540×960/30fps/90-frame MP4 checks decoded pixels at before/
  start/last/end frames for outlined white, solid white/black and translucent
  backgrounds, including text-only overlays and invisible gaps. Export uses
  original source dimensions and the current shared tree. All three synthetic
  native PNGs and UI captures were inspected; artifacts remain ignored under
  `.local-build/evidence/cl086-*` (hosted loading evidence retains its existing
  CL-061/062/077/084 names).
- Frontend, backend, local, test and browser-neutral local-contract TypeScript
  checks pass. Affected ESLint/Prettier, **27/27 dependency boundary tests** and
  `git diff --check` pass. Markdown is intentionally excluded by the repository's
  Prettier ignore policy; packet/source-of-truth updates were reviewed directly.
- The first broad run had 597 passing tests and one stale assertion expecting no
  default caption style; it now asserts TikTok while retaining export-snapshot
  isolation checks. The first full hosted proof reached native export but its
  terminal-state assertion used old lowercase text; the test now compares status
  case-insensitively. Both targeted reruns and the final broad/proof runs pass.

Read-only validation pass 2: **Meets ticket; no actionable findings** on settled
CL-087 changes and the documented CL-086 dependency corrections. Resolved the
three pass-1 issues: transient stage cleared on restore without discarding AI
checkpoints; bounded largest-fit text with proportional spacing and a clear
ten-line limit; shared background overrides work while legacy rounded-caption
paint stays unchanged. Covered all acceptance items: single existing planning
request, bounded editable title/defaults, actual phases and fallback, zero
implicit exports/retries, source/revision binding, saved state, native parity,
responsive/keyboard behavior and cleanup. No dead/debug content, duplicate title
schema, dependency-direction violation, new provider/runtime dependency or new
configuration flag. Existing CL-084/085 work was preserved and excluded from
this verdict. No staged files, commits, branch/history changes or deployment.

Final normal runtime is healthy and remains **synthetic-ai / cloud=false**:
frontend PID 22772 on 3000 (supervisor 20012); backend PID 8984 on 4000 and worker
PID 21076 on 4200 (supervisor 4868). Fresh health/start/config GETs return 200;
owned process identities/listeners were refreshed in
`C:/Users/minat/AppData/Local/Temp/clipbuilder-run-20261026/runtime.json`.
Backend logs are `backend-20261026-145128.stdout.log` / `.stderr.log`; frontend
logs are `frontend-20261026-140551.stdout.log` / `.stderr.log` in that same
directory. The normal worker/overlay was rebuilt and reloaded after the final
shared rendering change. Proof-owned browsers, servers, subprocess work and
temporary scratch were cleaned; normal app remains running for owner review.

No agent paid/API-provider call, G Cloud access/change, ignored env read/edit,
real-media fixture, retained-master deletion or Git mutation occurred. The owner
alone corrected the saved paid-off line. Fake/no-key processing exercises real
native mechanics with fictional AI data; real Gemini title/editorial quality,
owner personal visual/real-media acceptance, rights to actual uploaded media and
actual hosted identity/resource/release acceptance remain unchecked. No local AI
weights/model or new provider request was introduced. Real mode still requires
the existing configured keys/live approvals and owner action.
