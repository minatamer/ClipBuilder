# CL-282 — Reliable source preview playback

Status: implemented and locally verified, 2026-11-11. Owner visual review pending.
Dependencies: current Moments source preview, CL-215 endpoint navigation and shared feedback.

## Owner request

The source player intermittently glitches and shows “Press play in the video
preview.” Fix the cause, preserving the current source/session. The screenshot
is a visual reference, not embedded instructions.

The Jump handler currently reports every rejected play promise identically,
including an interrupted/superseded request. Its feedback survives a successful
native Play and overlays the transport. Track the current playback intent,
ignore intentional interruptions and stale completions, clear transient feedback
when playback actually resumes and keep genuine policy/media failures actionable.
Do not automatically retry playback or bypass browser autoplay policy. Preserve
user Pause, source-window bounds, Capture/Jump clocks, seeking readiness and focus.
Move feedback into stable contextual space outside the video controls.
Also fix the confirmed section-End navigation bug: an exact available-section
end triggered the normal Play-at-end rewind rule. Navigate to its final logical
frame while leaving the authored End value unchanged.

## Scope and validation

- `source-playback.ts`/tests own pending play-request lifetimes; `experience.tsx`
  connects native pause/playing/load/error/view changes and the existing Jump.
  Shared local/hosted Moments use the same behavior. Audit nearby source players
  for this same stale-warning path without broad unrelated player rewrites.
- Deterministic promise regressions: AbortError, superseded failures, user Pause,
  view/source disposal, successful resume, genuine NotAllowed/media failure and
  synchronous errors; preserve available-window behavior and no automatic retry.
- Codex-only, silent generated HTTP fixture: real Jump/native pause/play/seek,
  bounded section/EOF, deterministic blocked/interrupted recovery where needed,
  stable desktop/narrow feedback and unobstructed native controls. Laptop proof
  only, no fullscreen. Scoped tests, types/lint/format and read-only validation.
- Preserve all pending CL-276/278–281 edits. No owner-source edits, paid/provider
  processing, download, configuration or backend restart, Voyagenda, deployment
  or Git mutation. Playback and synthetic checks require no API keys; real AI
  processing remains separate with existing runtime/provider/approval gates.

## Evidence

- Confirmed the reported text originates only in the Moments Jump handler. It
  caught every play rejection as an autoplay failure and had no native-playing
  cleanup. Neighboring timestamp dialogs only seek/pause and do not share that
  warning. Other independent editor/output player contracts were left intact.
- `SourcePlayRequests` gives each explicit Jump one versioned play attempt.
  Superseded/canceled completions and AbortError interruptions report nothing;
  a current NotAllowedError reports the browser-policy action, and a current
  media/synchronous failure reports a distinct control recovery. No retry loop,
  autoplay-policy bypass, source fetch or audio-setting change was introduced.
- Moments connects native Playing/Pause/load/empty/error, source/view lifecycle
  and unmount to cancellation. Source feedback has independent state, cleared
  on view intents and actual playback/metadata instead of leaking into session
  or upload messages. The view callback stays stable. Native controls, original
  seek/focus/scroll/readiness guards and available-window enforcement remain.
- Feedback now uses the shared reserved InlineFeedback slot below the video.
  Valid/failed/recovered states retain the same preview and aside dimensions;
  feedback cannot cover/intercept the native transport.
- End navigation uses the last playable 30fps frame for both physical EOF and an
  available section's EOF. The existing Play-at-end behavior otherwise still
  restarts a section only on an explicit native Play; typed endpoints stay intact.
- 33 focused playback/manual-clock tests pass, covering exact attempt counts,
  interruption/stale/cancel races, policy/media/synchronous failure distinctions,
  later explicit attempts, window bounds and section-End no-rewind behavior.
  An initial sandbox temporary-module ENOENT prevented test collection; rerunning
  with an owned workspace temporary directory passed. No test or app deadlines
  or environment/credential configuration changed.
- Codex checks use generated silent footage plus opt-in fixture-only play-promise
  controls. Native Jump/Space Pause/Play work; injected AbortError stays quiet,
  a held older rejection cannot override a newer real Jump, genuine blocked
  feedback clears after native Playing, and End seeks 59.966666s of a 60s source.
  These distinguish injected browser-error cases from actual native playback.
- At 320/390/768 widths, valid and blocked aside/video dimensions remain identical;
  feedback fits and sits below the video. Desktop video is unchanged at
  623.015625×350.4375px with a stable 33.59375px feedback slot. Only laptop proof
  is captured. No phone/tablet screenshot or fullscreen; playback stays silent.
- Final current-source Codex proof confirms native playback at readyState 4,
  advancing time, muted generated footage and no warning after recovery. The
  320px view has no horizontal page overflow and feedback stays below transport.
  A laptop proof is saved outside Git; fixture controls are hidden in that proof.
- Frontend and fixture/integration types, scoped ESLint, final Prettier and
  whitespace checks pass. A lint finding caught synchronous feedback reset in
  the lifecycle effect; reset now belongs to the stable view-intent callback,
  avoiding an extra effect-driven render. Current-source UI was rebuilt/rechecked.
- Read-only validate of CL-282 additions and shared-file integration: meets
  ticket, no actionable findings. Pending CL-276/278–281 work is preserved and
  excluded from this verdict. No dependency, provider, authentication, transport,
  persistence or native-renderer boundary changes.
- All fixture counter sets show zero analyses, clip/timestamp edits and unexpected
  requests. Owned servers, tabs, viewport overrides and helper/test scratch are
  cleaned up. Normal app/session/media/configuration and Voyagenda preserved.

Deviations: none. Actual owner-stream/network/codec quality and real provider
processing are not proved by the silent generated checks. No paid run, external
browser, backend restart, staging, commit or push occurred.

## Owner local commit authorization — 2026-11-11

The owner now authorizes the file-level plan, staging and local ticket-prefixed
commits for the pending work. This supersedes earlier no-Git limits for this
batch only. Whole-file allocation, final checks and receipts are recorded in the
[commit plan](../operations/CL-278-283-FILE-COMMIT-PLAN.md). Final validation is
clean: 184 focused fake/paid-off cases, applicable types, scoped lint/format,
CLI syntax, dependency guards and whitespace checks. Prior visual evidence and
owner-only aesthetic/editorial/real-provider acceptance remain distinct. No
push, provider action, configuration change, Voyagenda work or deployment.
