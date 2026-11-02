# CL-184 — Hook-led opening title and presentation timing

Status: In progress, 2026-11-02. Owner AFK authorization lifts the previous
execution hold; use execute/validate/fix loops and local ticket-prefixed commits
without push. Depends on implemented CL-145, CL-157, CL-163 and CL-165.

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
