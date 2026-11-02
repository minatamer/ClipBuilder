# CL-184 — Hook-led opening title and presentation timing

Status: Implemented and validated locally, 2026-11-02. AFK local commit is
approved. Depends on implemented CL-145, CL-157, CL-163 and CL-165. Real
generated wording/owner visual acceptance remains unchecked; no real inference
was used.

## Owner request

The title currently appears after the opening Hook. Make it a textual hook:
derive its meaning from the chosen Hook and show it when that Hook begins. This
correction applies to both provider paths and the shared preview/export.

## Current evidence and proposed change

`apps/backend/local/planned-text.ts` creates the opening layer at body frame
zero. `packages/composition/local/overlay-frame.ts` selects text after
converting presentation time to source/body time with `ownerSourceFrame`. A
later excerpt prepended as the Hook therefore does not naturally show that
opening layer. This explains the reported behavior at the code level; no owner
media was run.

- Choose the optional Hook first within the existing planning response, then
  author one accurate, engaging title inspired by that excerpt and supported by
  the clip's actual payoff. Preserve CL-165's language, editable copy, optional
  output and advisory editorial checks. No additional inference or auto-retry.
- Give the generated opening title an explicit presentation-time occurrence
  starting at the first displayed frame, including a prepended Hook. Keep its
  existing readable duration, bounded by the complete presentation. A short Hook
  may transition into the body while the title finishes; do not restart or
  duplicate it automatically when the body begins.
- Without a Hook, show the title at normal clip start. Removing/changing a Hook
  must preserve the title, edits and correct timing without an AI call. New copy
  requires an explicit existing planning action; never silently rewrite saved or
  manually edited text. Preserve legacy draft decoding and manual timed layers.
- Scope this timing behavior to the opening-title role. Captions, ordinary text,
  pictures, sound cues and camera framing retain their intended source clocks.
  Implement one shared clock rule for browser and native exports, including
  native Hook/body overlay branches and non-30fps exports.

## File allocation and verification plan

Contracts: `packages/contracts/local/text-layers.ts`, Hook/visual clocks and
their tests as needed for a backward-compatible opening-title role. Backend:
`apps/backend/local/planned-text.ts`, shared planning instructions, Codex/Gemini
adapters and focused tests. Composition/native: existing overlay-frame/text and
overlay rendering modules. Frontend: existing text editing/persistence only if
needed. Docs: this packet, index and the owning source-of-truth title decision.

Use fake/paid-off/network-blocked tests for same-response Hook/title planning,
exact unchanged provider counts, legacy/manual layers, absent/changed Hook and
save/recovery. Synthetic browser plus current-source native decoded-frame proof
must show text on the first Hook frame, through a short-Hook transition, absent
after its reading duration and without a second body-start occurrence. Inspect
desktop/phone safe areas and editable controls; run relevant types/lint/checks
and validate before the normal verified runtime refresh once implementation is
authorized.

## Capability and authorization boundary

Fake mode needs no keys and can prove timing, persistence and injected planning.
Real Codex needs the prepared local speech/speaker tools, saved ChatGPT login,
available allowance and enabled local gates. Gemini needs its API key and
applicable live approvals. Generated wording/real appearance remain owner
review. Nothing is implemented or tested by this packet. No real processing, app
restart, configuration, model download, cloud, deployment or Git mutation is
authorized.

## Implementation and verification — 2026-11-02

- Both provider paths share the revised Hook-first/title-inspired planning
  instructions in the existing response; no new inference or automatic retry.
  New decoded titles have an optional `opening-title` role, retained through
  edits/drafts/recovery. Legacy/manual layers without it keep source clocks.
- Shared overlay evaluation uses presentation time only for that role. Native
  Hook/body branches carry the measured physical Hook prefix, including
  24/25/29.97/30/60fps rounding. Text starts on the first Hook frame, continues
  through a short Hook and disappears once; ordinary overlays remain unchanged.
- Text selection, drag handles, timing capture and seeks use the corresponding
  clock. Removing/shortening a Hook bounds only opening-title timing to the new
  presentation; copy/style and other layers are preserved. A forged Hook-only
  backend edit follows the same rule. No AI call is required.

Whole-file implementation allocation (20 paths):

- Contracts: `text-layers.ts`, `visual-clock.ts`, `clips.ts` under
  `packages/contracts/local`.
- Composition: `overlay-frame.ts`, `visual-clock.test.ts`, new
  `opening-title.test.ts` under `packages/composition/local`.
- Backend: `planned-text.ts`, `planned-text.test.ts`, `codex-ai.ts`,
  `codex-ai.test.ts`, `provider-ai.test.ts`, `edit-clip.ts` under
  `apps/backend/local`.
- Frontend: `clip-editor.tsx`, `text-inspector.tsx`, `picture-timing.tsx`,
  `use-editor-preview.ts` under the existing local-editing feature.
- Renderer: `apps/renderer/local/clip-render.ts`.
- Proofs: `test/local-text.proof.ts`, `test/local-visual-sync.proof.ts`,
  `test/owner-text.test.ts`.

Documentation: this ticket, index, source of truth and execution ledger.

Checks actually run:

- Focused local Vitest command with planned-text/Codex/Gemini adapters, clip
  batch, draft store, session recovery, frontend text layers, composition visual
  clocks and opening titles: 156 cases pass after updating an obsolete prompt
  assertion. The final Codex-only rerun passes all 15 cases.
- Follow-up owner-text/opening-title/frontend-text regressions: 20 cases pass
  (overlap with the earlier suite); includes newly added Hook-removal behavior.
- `scripts/local-proof.config.ts` with local-text, local-visual-sync and
  local-codex proofs: five cases initially pass; the extended editor case passes
  its final targeted rerun in 13.75s. Existing text-only native exports, decoded
  image/audio plus new opening-title pixels at five cadences, injected Codex
  preparation/export/save/recovery and real pointer/keyboard text controls are
  covered. The editor fixture needed its existing six-tab count and Reload clip
  action updated, plus a real final edit instead of trying to save a clean form.
- Synthetic screenshot inspection: `cl184-title-1440.png` and
  `cl184-title-320.png` under ignored `.local-build/evidence`; the proof also
  checks 390px, phone/desktop footer bounds and timing capture. No owner media.
- Contracts build; contracts-local, local, frontend and root-test TypeScript;
  scoped ESLint, scoped Prettier and `git diff --check` pass.

Environment deviation: Corepack attempted unavailable registry bootstrap before
checks. No package/config change was made; checks used already installed,
lockfile-pinned tool binaries directly. Windows sandbox Vitest transform-cache
access failed before tests, so tests/proofs used explicit tool escalation with
unchanged top-level
fake/paid-off/credential-clearing/envDir-false/network-blocked setup. No
provider/model was invoked. This is not evidence of real AI quality.

## Validate loop and remaining gates

Read-only review of this ticket's settled worktree: **Meets ticket locally; no
actionable findings**. One realistic timing issue was found and fixed:
shortening/removing a Hook after extending a title now bounds only its timing.
New backend and browser regressions pass. Reviewed contracts/dependency
direction, legacy behavior, optional output, exact unchanged provider counts,
interpolation clocks, source/private-data exclusion and timer/request/native
scratch cleanup.

Normal app was not running at the start; no existing worker required reload.
Current-source native/browser proofs compiled their own overlay in owned
scratch. The normal runtime build/start is deferred to the final series handoff,
when subsequent capacity/long-source packets have settled. No
secrets/configuration, retained media, real provider/download, cloud, deployment
or push was touched. Real title/Hook relevance, owner device/appearance and
release acceptance remain unchecked. These do not change the recorded synthetic
verification verdict.
