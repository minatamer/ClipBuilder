# CL-265 — One Gemini test before a deployment decision

Status: one explicitly authorized real Gemini analysis/processing run completed
without retry, 2026-11-08. Codex-browser playback, visual speaker matching,
Hook/editor guards and one local export verified. Independent listening quality,
broader provider comparison and deployment acceptance remain open.

The owner wants one Gemini test run before deciding whether to deploy. Plan the
bounded source/range, expected pipeline actions and evidence after CL-264's
comparison. Review the existing fake/no-key gates and current exposed Gemini
capability first. A reminder is not permission to perform the run automatically,
change ignored configuration or deploy. Confirm the concrete real-test scope
when the owner starts this item; preserve normal local Codex isolation.

Acceptance: record one actual requested Gemini run, outcome, content-free timing/
error/quality findings, differences from Codex and remaining release gates. Never
automatically retry, purchase credits or deploy. Preserve all completed media,
edits/exports and private diagnostics. Real Gemini requires the owner's key,
enabled live flags and applicable approvals; fake results are not live evidence.
Deployment remains an explicit later decision under the release packets.

Linked work: CL-261 reminder and CL-264 provider comparison.

## Owner-started acceptance — 2026-11-08

The owner explicitly requested a full local restart with Gemini selected and
will trigger one test themselves. Use a process-scoped AI_PROVIDER=gemini for
this launch, preserving ignored configuration and its normal Codex selection.
Verify owned shutdown, ports, startup and exposed capabilities without provider
inference. Preserve rolling recovery, saved media/exports and private logs. No
agent-run processing, automatic retry, Git mutation or deployment is requested.

Also provide the actual UI flow and Gemini charge boundaries: source acquisition,
analysis/transcription and optional selection, per-clip planning/pictures,
explicit caption/Hook-title/visual actions, and API-free manual edits/native
exports. Distinguish actual inference from cached reuse and from fake/no-key
checks; actual amounts depend on Google model/token/image/search pricing.
Record only content-free readiness evidence; do not claim the owner's real run
or Gemini quality passed before they report it.

### Startup evidence

- Captured and identity-checked both dedicated launcher trees and their current
  descendants/listeners. Stopped frontend before backend/worker; verified all
  captured identities absent and ports 3000/4000/4200 free through stabilization.
- Launched normal pinned dev commands with hidden, dedicated supervisors and
  CMD-owned stdout/stderr handles. Only the backend launch received the temporary
  Gemini selection; ignored configuration and other switches were untouched.
  The normal backend rebuilt its worker/composition as part of dev startup.
- Backend health, frontend `/start` and `/api/sample/config` each return 200.
  New listener ownership and PID creation times match the replacement trees.
  Public capabilities report provider-ai mode with planning, captions and Hook
  titles available. Gemini composition uses the existing absence of optional
  Codex-only markers; it does not expose an explicit Gemini aiProvider field.
  Local Find visuals is available; CL-267's hosted restriction remains separate.
- The current workspace is empty. No agent-triggered analysis, caption, title,
  image, download/import, render or provider request was used for verification.
  Real Gemini quality/billing and the owner's acceptance run remain unchecked.
- Content-free runtime/readiness records, launch logs and validated backend
  diagnostics live outside Git. Backend diagnostic output was written after its
  launching tool returned; frontend logs grew from zero after later HTTP checks.
  OS-owned redirection survives the PowerShell launcher. Saved/retained media,
  recovery and old diagnostic logs were preserved. No Git mutation/deployment.

### User-visible Gemini charge boundaries

Source upload/acquisition, entering ranges and reviewing results are API-free.
Use clips may transcribe even in manual-only mode. Find moments can transcribe
then make a separate selection request; compatible transcript reuse skips ASR.
Each newly processed clip normally analyzes its video for visuals, titles,
Hook suggestion and camera planning, then each requested picture uses Gemini
Search discovery and may fall back to Gemini image generation. Search can invoke
several grounding queries within that request.

Explicit Generate captions reuses admitted speaker-labeled words when available,
otherwise transcribes clip audio. Generate title is default-off: opt-in plus a
valid Hook starts a debounced title-only call after 900 ms; changing its range
while enabled can start another call. Local Find visuals makes another plan/
picture pass. Initial automatic pictures still run when hosted manual Find
visuals is disabled. Manual edits, built-in Hook audio, playback, Apply and local
native export make no Gemini request themselves; a pending opted-in title may
already have started before Apply. Receipts/reuse can avoid repeats, but a new
explicit retry or fresh analysis can incur new usage. Provider billing follows
actual Google model/token/image/search usage, not the app's operation counters.

Fake/no-key mode exercises synthetic mechanics without Gemini billing; the
current owner test is real provider mode using existing credentials/approvals.

CL-268 follow-up: the owner requested removal of local Gemini's one-hour source
cap to use the same two-hour source/manual 1:04–1:45 clip. That packet owns the
capacity change and verified backend/worker reload, preserving this launch's
Gemini selection, frontend and saved configuration. Deployed limits remain
unchanged; the 41-second manual transcription/planning boundaries above remain.

## Agent-run one-clip acceptance authorization — 2026-11-08

The owner now explicitly authorizes the agent to test the designated public
YouTube source from CL-189 with the established 1:04–1:45 manual clip ONCE,
play it back, assess anonymous speaker/camera/caption matching and exercise
the Hook/editor. This supersedes the owner-only/agent-no-inference hold above
for this one bounded session only. Confirm exposed Gemini composition before
submission. Preserve all existing source/library/clip/edit/export data; create
one fresh clip, reusing the admitted source if available.

Hard limits: one manual analysis submission and one initial Process clips
submission for one clip, no retry/resubmission/regeneration or second clip.
Record intent before each spend boundary so uncertain UI outcomes cannot cause
a duplicate attempt. Normal initial Gemini planning/search/image fallbacks are
part of that one pipeline. Do not trigger Find visuals, another transcription
or extra AI title requests while exploring. Generate captions only if the
existing admitted words already have speaker labels and the current adapter
will reuse them without inference. Hook timing, built-in audio, manual text,
Apply/Discard, playback and local export can reuse the completed clip.

Use the Codex browser on the existing `/start` route. Verify the observed result,
actual media playback and speaker changes; distinguish real observations from
previous fake/no-key proofs. Real media/transcripts/frames remain private and
outside Git; retain only aggregate counts, stage timings and quality/error
findings here. No ignored settings edit, provider fallback, restart during the
run, deployment, Git action, purchase or automatic provider retry is authorized.
If a stage fails, preserve completed work and report it without another run.

### Actual one-run evidence — 2026-11-08

- Confirmed exposed provider-ai planning/caption/title capabilities and the
  local-gemini capacity profile before submission. Reused the designated saved
  1080p source (about 133 minutes); no second download. Submitted manual
  1:04–1:45 once with AI moment suggestions off, then Process clips once.
  Private intent markers were written before each submission. Both succeeded;
  no processing retry, regeneration, fallback, second clip or restart.
- The fresh result contains one 41-second clip, 126 words, 33 caption groups,
  two non-null anonymous speaker IDs, three observed people and four camera
  decisions. Initial calls were one plan, two picture operations and zero final
  renders. Captions were already present; no Generate captions action was used.
- Local analysis completed in 12.98 seconds. Initial clip preparation/preview
  completed in 127.92 seconds, including a 39.995-second preview stage.
  Provider transcription generation took 2.548 seconds; video generation took
  29.741 seconds. These are nested stage measurements, not additive billing
  units or a latency comparison against Codex. Quality critiques were retained
  without blocking returned work or triggering another provider attempt.
- Used the Codex browser on the existing `/start` route. Actual preview video
  progressed with readyState 4 and no media error. At the opening handoff,
  the camera switches at about 2.93 seconds and caption attribution changes at
  3 seconds to the person visibly taking over. The two speaker highlight colors
  remain distinct. The unassigned-person camera interval at 20.13–26.13 seconds
  corresponds to source B-roll; the talking-head shot then returns to the same
  speaker. No visual speaker swap was observed at these inspected transitions.
- Listening limitation: this agent session cannot consume audio input. An
  attempted private listening sample was explicitly unsupported. Playback,
  decoded clocks, caption assignments and visible mouth/camera changes were
  inspected; voice identity, subjective sound balance and word accuracy are
  not claimed as passed. Real-media quality acceptance remains partial.
- Used the existing Hook suggestion with Generate title off throughout. Adding
  Hook audio at the source boundary changed 37–40.9 to 37–41 seconds, preserving
  Start and trimming the built-in 5.3-second Riser to four seconds with a
  1.3-second recording offset. Applied this local edit successfully. Its audio
  inspector showed new added audio at 85% and original audio at 100%.
- Exercised draft-only long and short Hooks on that same prepared clip. A
  10–17 second range selected the full 7.4-second Rising tension recording and
  adjusted End to 17.4; its actual audio clock reached 6.70 seconds while still
  playing without an error. A 10–15 second range selected the 5.3-second Riser
  and adjusted End to 15.3. Both previews returned to the body with the Hook
  audio element removed. No extra inference was used for these edits/previews.
- Setting Start to 18 while End was 17.4 cleared End and disabled Preview/Apply
  with local corrective feedback. Discard restored the saved 37–41 second Hook.
  No incomplete Hook was saved and no body/camera correction was applied to
  manufacture matching evidence.
- Exported once through the local native renderer in 166.92 seconds. Output
  revision 0 references edit revision 1 and declares 1,350 presentation frames.
  Read-only probing found a 45.012-second H.264 608×1080 MP4 with stereo AAC
  48 kHz audio, 10,489,462 bytes. Final state is ready, active false, error null;
  final counters remain plan 1 / image 2 / render 1. Extra caption, Hook-title
  and Find visuals attempt counters remain zero. Export success and audio
  presence do not establish subjective listening quality.
- A transient read-only editor reconnect error appeared after the completed
  preparation while the backend remained healthy. The existing result reopened
  through Try again once; this did not submit processing again. No root cause
  or generic fix is claimed. An attempted media-download inspection timed out
  and was not retried.
- Left the completed clip and Download clip action open in Codex, with the
  saved Hook enabled and title generation off. Reset the temporary viewport.
  Real media, intent markers and detailed diagnostics remain outside Git;
  shareable screenshot evidence contains only Hook controls. Configuration,
  existing retained/saved media and unrelated work were preserved. No Git
  mutation, cloud/deployment action, credit purchase or further AI operation.

This is real Gemini acceptance evidence using the existing key/live approvals.
Fake/no-key mode still verifies synthetic mechanics without provider billing;
its earlier proofs do not establish real speaker, transcription or visual
quality. This one-run authorization is consumed and does not authorize another
analysis, Process clips submission, paid retry or additional AI action.

## Subsequent documentation commit authorization — 2026-11-08

The owner now explicitly requests a file-level staging/commit plan for all
pending work. [CL-268's allocation](CL-268-local-gemini-source-duration.md#owner-authorized-whole-file-commit-plan--2026-11-08)
places this aggregate acceptance record with CL-264 and the shared authority/
index in the final four-file documentation commit. Real media, output files,
private diagnostics and configuration remain excluded; no further processing,
provider request, restart, push or deployment is part of this request.
