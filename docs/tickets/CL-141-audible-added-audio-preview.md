# CL-141 — audible added audio preview

Status: implemented and locally validated before CL-142 execution.
Owner report 2026-10-29. Preserve CL-135–140 pending work.

Investigate added-sound silence with synthetic audio and actual browser playback,
especially Hook-only audio when the playhead is already after the Hook. Fix any
confirmed dispatch/mute/volume/playback issue. Add a shared-design Preview in clip
action for the selected cue that starts at its actual presentation window; adding
a sound pauses and selects an audible starting point without automatic playback.
Keep independent gains, twelve overlapping cues, source timing, explicit Apply/
Discard, native parity and normal player mute/seek/pause. No new provider call.

Allocate frontend audio-inspector/preview and small styles if needed; contracts
audio.ts/audio.test.ts only for the canonical preview window helper if required;
the existing local audio browser/native proofs and feature guide, this packet,
index. Use an actual browser audio-energy check rather than only asserting
HTMLMediaElement.currentTime. Diagnose source spectrum/gain separately from
playback failures. Any shared/native change requires current contracts build and
verified backend worker refresh. All tests are synthetic/fake/paid-off with no
keys or external access. No owner-media processing, ignored env edit, Git or deploy.

- [x] Establish and fix the silent-playback cause; selected cue preview has rendered audio.
- [x] Hook preview starts at zero and stops its audio at the Hook boundary.
- [x] Volume/layer/mute/pause/seek/save/export and responsive checks pass.
- [x] Types/lint/format/scoped validate and proof cleanup recorded; normal app
      health is rechecked after CL-142's required worker refresh.

Manual/fake audio editing works with FAKE_MODE=true and no API keys. Fresh AI
suggestions still require the selected provider setup/live gates and owner action.
This packet does not evaluate real AI or personal speaker/listening acceptance.

Confirmed behavior: a Hook-only cue correctly has no segment after the prefix,
but selecting/adding it previously left the playhead wherever it was. The owner
screenshot was at about three seconds with Hook-only placement. Add now pauses
and seeks to the earliest canonical ownerAudioSegments window. The explicit
Preview in clip action also seeks there and plays the mix; it never submits an
edit/export. Legacy Hook tension is mostly low-frequency synthesis; CL-142 owns
replacement with recognizable recordings, not a claim of matching a trend.

Expanded authenticated browser/worker proof passed (31.95s): cue preview starts
from a body playhead at the Hook, renders measured nonzero audio energy >0.003,
and its captured output falls below 0.001 after the Hook ends. Browser audio is
captured from the actual playing HTMLMediaElement into an analyser; no microphone
or system recording is used. The context, capture stream/tracks and nodes close
in finally. The fixture now uses the normal frontend CSP and a fixed synthetic
script nonce, so Player shared-audio warmup follows real application policy.
Earlier direct host UI CSP rejected the silent warmup URI; normal Next already
permits it and required no security-policy change. Post-Apply navigation waits
for ancestor fieldset enablement. Existing twelve layers, upload/URL cancel/
failure/retry, independent gains, seek/mute/pause, export and saved reload pass.
Exact existing provider/normalization counts remain unchanged. No external call.

Frontend/proof types, scoped lint/format and read-only validation pass. Verdict:
Meets ticket for synthetic/local verification; no actionable findings. Canonical
segment projection is reused directly, without duplicate clock logic or schema.
No product timer/listener/request is added by preview. Existing audio state and
the running app are preserved. This frontend-only packet needs no worker change;
CL-142 follows with current native parity. No paid call, deploy or Git action.
Personal hearing/device/real-media acceptance stays open.
CL-142 completed the shared worker refresh and confirmed normal health/start/
config 200 with fake/Codex unchanged; all current audio proof scratch cleaned.
