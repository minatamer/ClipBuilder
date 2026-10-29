# CL-143 — classic Discord notification sound

Status: implemented and locally validated. Plan recorded
before implementation, dependency-ready after CL-142.
Owner request 2026-10-29: leave music identification for now and add the Discord
notification sound effect. Use the classic message notification recording as a
manual library option; retain the Pop visual accent and all existing edits.
The earlier Sator selection was rejected by the owner; identifying its intended
replacement is deferred and is not accepted by this packet.

Fetch the explicit anonymous public MP3 linked by the Myinstants classic
Discord Notification page, bounded to 12 MiB with a timeout. Normalize through
the existing pinned native tools to 48-kHz stereo, peak-bounded, padded to whole
30-fps frames and lossless FLAC. Record source, hashes and clocks. No runtime
download, generated imitation, AI call, real YouTube pipeline, private-media
upload, cloud access, deployment, ignored configuration or Git action.

Whole-file allocation: contracts `local/audio.ts` owns the new finite ID and
metadata; composition `local/sound-recordings.ts` owns immutable encoded bytes;
`audio-sources.test.ts` verifies hash/format/clock and picker presence. Extend
`test/local-audio-editor.proof.ts` for actual catalogue audition, cue editing,
saved reload/export and `test/local-audio.proof.ts` for isolated Discord energy
in a native MP4. Existing generic picker/preview/mixer code should need no new
path. Update MEDIA_AUDIO, source of truth, feature guide and ticket index with
the exact implemented behavior. Preserve prior uncommitted work and media.

Validate focused catalogue/contracts checks, synthetic browser/native audio
proofs, scoped types/lint/format and closed app-context packaging. Build
contracts and refresh the current backend/internal worker with verified process
ownership, preserving the healthy frontend and owner-managed configuration.
Read-only scoped review closes implementation findings before recording evidence.

Playback, layering, gains and export work with FAKE_MODE=true and no API keys;
proofs use synthetic source media, fake AI, paid-off and blocked network. Real
AI selection still needs the chosen provider's setup/live gates and owner-only
approval; it is not exercised. Exact personal listening, physical devices,
hosted/real-media and release acceptance remain owner-only.

- [x] Real bounded classic recording added with provenance and exact clocks.
- [x] Manual picker/audition, independent cue, saved reload and export verified.
- [x] Focused fake/paid-off gates and review pass; normal app/worker refreshed.

## Evidence — 2026-10-29

The explicit Myinstants Download MP3 link returned an 8,301-byte classic Discord
notification recording. Source URL, original/normalized SHA-256 and exact clocks
are in MEDIA_AUDIO. Pinned hash-verified FFmpeg normalized it to 28,151 bytes of
lossless 48-kHz stereo FLAC, 15 logical frames / 0.5 seconds. Immutable bytes and
the digest-backed catalogue ID feed the existing generic picker, preview/cache
and native mixer. No production route, dependency or alternate renderer added.
Pop remains the automatic visual accent; existing cues and limits are preserved.

Focused catalogue/contracts checks: two files / five tests passed, including
exact deterministic bytes, recording hashes, FLAC rate/channels/sample count and
the new picker ID. Local/proof/frontend/contracts-without-Node typechecks,
scoped lint, Prettier, contracts build and diff checks passed. Two closed
app-context packaging checks passed with private media/secrets still excluded.

The final settled browser/native audio proofs passed together (70.64 seconds).
Browser pointer audition decodes the actual half-second Discord sample. Adding
it defaults to a nonlooping clip effect at 35%; changing its own gain to 42%,
Apply, export and saved reload preserve that exact cue and gain. Existing
Hook-energy/stop, twelve simultaneous layers, independent gains, upload/URL
cancel/retry, mute/pause/seek and synthetic MP4 export checks remain covered.
Final state has four audio cues/two uploads and 113 output frames. Exact counts
remain one fake plan/image, zero selection, three injected URL calls and four
normalizations; adding the builtin creates no paid/provider boundary.

Native proof isolates both Pop and Discord in actual MP4 output with original
audio muted, asserting sound energy inside each canonical window and silence
before/after. Initial sampling at 60 ms fell within Discord's natural quiet
lead-in; the corrected assertion scans the whole effect window. An initial
browser export run timed out during concurrent checks; an isolated diagnostic
rerun and final combined run pass. Temporary diagnostic markers were removed;
the inactive failed-run synthetic scratch was path-checked and removed after
confirming zero matching processes/listeners. No private media was touched.

Current-source app parity: contracts rebuilt; nine old backend identities were
verified stopped, preserving frontend 15768 / 3000. New supervisor 24708,
backend 26400 / 4000 and worker 24884 / 4200. Health, /start and
/api/sample/config returned 200; final listener/health recheck passed. Normal
owner configuration was loaded by the entry point without agent inspection.
Runtime record and separate backend.stdout.log/backend.stderr.log remain at
`C:/Users/minat/AppData/Local/Temp/clipbuilder-discord-sound-20261029-cl143/`.
Public source/normalized recordings remain at
`C:/Users/minat/AppData/Local/Temp/clipbuilder-discord-sound-20261029/`.

Scoped read-only validation of CL-143 at HEAD 04450d6: Meets ticket; no actionable
findings. Reviewed enum/metadata/data/hash agreement, generic picker/cache and
native codec connection, cue defaults/layers/persistence, cleanup and boundaries.
Prior CL-135–142 changes are excluded from this new sound's verdict and retained.
Desktop/834/390/320 geometry checks pass; the actual 390px library image was
inspected with Discord visible and the persistent footer on screen. No quality
or limit reduction, new dependency, staging, commit, push, deployment, inference,
real YouTube pipeline or cloud call. Deviations: none. Personal listening/exact
sound acceptance, real AI/media, physical devices, hosted and release checks
remain owner-only and unchecked. Music identification remains deferred.
