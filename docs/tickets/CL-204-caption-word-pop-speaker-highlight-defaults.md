# CL-204 — Word pop and speaker-highlight caption defaults

Status: Locally implemented and verified, 2026-11-03. Final validate: no
actionable findings. Real speaker quality and owner visual/release acceptance
open.

## Owner request and authority

Check Color by speaker with Codex. New captions should use TikTok typography,
Word pop animation and speaker coloring of the animation highlight, with the
same default on Gemini. Execute/validate with fake/no-key/paid-off checks; no
real inference, configuration changes, downloads, cloud, deployment or Git
mutation. Preserve CL-197–203 and existing owner clips, edits and exports.

Depends on the implemented CL-128/134 caption attribution, CL-087 shared
defaults and CL-183 selected-cut local speaker preparation. CL-203 pixel Motion
is independent of speech speaker attribution. Follow the source of truth's
one-speaker-per-caption, shared typography, explicit retry and native parity
sections. Override earlier implicit text/background palette defaults only; saved
explicit style, enabled state, assignments and color overrides remain.

## Findings and scope

TikTok captions explicitly default to animation `none`, hiding their active word
highlight. Automatic coloring also requires two distinct caption speakers, so a
selected clip with one known speaker is uncolored. Implicit palettes tint the
whole caption text/background instead of just its animation highlight. Codex
preparation and explicit caption generation already request local speech speaker
labels; Find all intentionally postpones diarization until selected clips. Do
not add more transcription, provider requests or automatic retries.

## Acceptance and checks

- Fresh prepared/generated captions share TikTok plus `pop` (Word pop) across
  Codex, Gemini and explicit synthetic captions. Independent manual Text
  defaults stay intact; existing saved animation choices are not rewritten.
- With no explicit speaker edits, enable coloring for any known caption speaker.
  Use that speaker's distinct palette accent only for the active animation
  highlight; preserve the selected style's base text and background colors.
  Unknown labels stay neutral; full-caption majority/first-spoken attribution
  and exact word IDs/timing remain. Existing explicit colors, assignments and
  disabled state take precedence.
- Prove Codex selected-clip and caption speech labels survive without Codex
  inference, and prove provider-independent preparation/caption defaults through
  injected providers. No new provider/native job is introduced for styling.
- Exercise shared rendered word-pop/highlight output for multiple and single
  speakers, silent gaps, Hook repetition, unknown/disabled/custom colors and
  saved explicit `none`. Use generated browser/native media for preview/export
  and responsive controls; compile the current overlay in owned scratch.
- Run focused fake tests, relevant synthetic proof, scoped types/lint/format and
  a final read-only validate/fix pass. Rebuild/reload the idle normal worker
  through verified lifecycle ownership; compare content-free owner clip hashes
  before/after. No owner clip edits or processing are part of verification.

## Evidence

Production changes are limited to `packages/contracts/local/editor.ts` and
`caption-speakers.ts`: shared TikTok animation is `pop`, any known caption
speaker enables implicit coloring, and implicit palettes preserve style text/
background while choosing a speaker highlight. No provider adapter, model,
prompt, transcript, camera or job behavior changed. Existing explicit palette,
disabled state and saved animation choices remain; unknown speakers are neutral.

Verification produced:

- 150 distinct fake cases across `caption-speakers.test.ts`, frontend
  `styled-caption.test.tsx`, and backend `clip-batch.test.ts`,
  `codex-ai.test.ts` and `provider-ai.test.ts`. The 26-case caption file passed
  again after its initial Hook assertion was corrected to respect intentional
  caption clipping. Covers single/multiple/unknown speakers, majority/ties, all
  explicit color roles/disabled state, exact clocks/IDs, static overrides, gaps,
  onset and Hook repeat. Both injected Gemini and local Codex caption entry
  points use the same defaults and retain edits/outputs on replay/restore with
  one transcription call, no extra planning/image/render call. The Codex adapter
  preserves injected labeled speech words with zero Codex inference calls.
- The selected current-source native speaker/Hook proof passed in 42.26 seconds,
  generating MP4s from synthetic color/audio only. Three default frame probes
  verify blue/orange speaker highlights with white text through Hook/body,
  alongside existing explicit-color/native Hook assertions. Its unrelated
  cadence/camera test was deliberately not rerun for this styling change.
- The full generated responsive editor proof passed in 48.86 seconds, checking
  actual TikTok/Word pop controls, enabled speaker coloring, white text/orange
  highlight inputs without dirtying edits, navigation/readiness/footers and
  existing apply/rename/remove/dialog flows at 320–1440 px. Generated desktop/
  phone previews under `.local-build/evidence/cl131-*-preview.png` were
  inspected. Adding populated captions exposed two harness assumptions: the
  caption check now restores its initial tab/scroll geometry, and filter edits
  target the visible select rather than hidden caption controls. These were
  proof-only fixes.
- Strict contracts/local/frontend/test types, scoped ESLint/Prettier and
  `git diff --check` passed. Final read-only validate inspected ticket coverage,
  both provider integrations, shared preview/native paint, saved overrides,
  dependency direction and cleanup: no actionable findings. No delegation,
  configuration/credential read, Git mutation or real AI/media call.
- Rebuilt contracts with the existing offline pnpm 11.19 shim (the first build
  picked a mismatched global pnpm and stopped before building). Verified the
  idle backend supervisor/tree and 4000/4200 listeners, stopped all eight owned
  processes, preserved the frontend and restarted normal `dev:backend`, which
  rebuilds the internal worker/overlay. Supervisor 23940 owns backend 16472 on
  4000 and worker 20868 on 4200. Codex setup remains ready; health, `/start`,
  sample config and capabilities return 200. Content-free complete clip hashes
  match before/after for all nine clips, including
  edits/assets/outputs/counters; batch remains idle, five ready/four canceled.
  Records and safe logs are in
  `C:/Users/minat/AppData/Local/Temp/clipbuilder-app-run-b66aacfb063d46f691ce1eb67999dd9b/`:
  `clip-preservation-cl204-{before,after}.json`, `runtime.json`,
  `backend-cl204.stdout.log` and `backend-cl204.stderr.log`.

Owning documentation: this ticket/index, source-of-truth caption-default section
and frontend feature README. Earlier CL-197–203 changes remain unstaged and
intact; nothing was staged or committed. Scope deviations: none.

Fake/manual styling requires no keys. Real Codex speech attribution uses the
installed local speech/speaker tools and weights; real Codex planning requires
login/live approvals. Real Gemini transcription requires keys/live approvals.
This packet does not verify real diarization quality or owner visual,
Linux/hosted/release acceptance and never triggers those provider paths.
