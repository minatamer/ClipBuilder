# CL-150 — local speaker evidence for Codex camera planning

Status: implemented and fake/native/static validated; owner real quality open.
Depends on CL-149. Plan recorded before implementation.

Owner requests Gemini-like anonymous speaker labels/camera behavior through local
Codex. Existing Whisper words are always null speakerId; Codex planning both
instructs null and clears returned labels. Do not fabricate voice identity from
still images. Add local CPU speaker diarization and align its anonymous turns to
Whisper word timing, then let Codex associate audio-backed speaker IDs to visible
people from ordered sampled frames. Improve samples with bounded temporal
panels; keep original export quality and existing source/clip limits unchanged.

The subscription route accepts text/images, not raw audio/video or image
generation (official OpenAI preview-limitations). Local speaker processing is
real AI without API keys, requiring separately prepared verified tools/models;
fake checks inject synthetic turns and never execute owner media or providers.
Prepare fixed free public upstream CPU prerequisites locally, pin hashes and
retain licenses outside Git. Never download at runtime or use a cloud fallback.

Initial allocation: new scripts/local-speaker-tools.ts and explicit preparation
script/command, package.json, scripts/local-speech-tools.ts (optional admitted
speaker tooling), renderer/local/codex-media.ts and tests, renderer/local/entry.ts,
scripts/local-discovery.mjs and test/owner-discovery.test.ts for exact nested
metadata, backend/local/codex-ai.ts and tests for audio-backed speaker mapping,
contracts/local/codex.ts and tests for temporal panel metadata, synthetic
test/local-codex.proof.ts, scripts/prepare-app-image.mjs and test/app-image.test.ts
for inert source only. Documentation: local Codex design, SOT, backend guide,
third-party notice and ticket index. Extend allocation before another owner.

Refined allocation before code: backend/local/runtime.ts requires both prepared
speech and speaker tools for real Codex readiness; add renderer/local/speaker-turns.ts
and tests for bounded anonymous turn parsing/word assignment. Use Sherpa-ONNX
v2.0.1 CPU CLI, pyannote segmentation 3.0 ONNX and NeMo TitaNet-small ONNX from
official Sherpa releases. Runtime uses fixed files with per-file SHA-256 checks.
Upstream release archive digest is verified; older model releases have no
published asset digest, so pin the bytes retrieved from their official HTTPS
release URLs. Preserve their license/attribution notices. Setup is explicit and
never part of startup/test imports. A fake speech process may inject turn output.

Verify anonymous stable labels, overlap/uncertain words remain neutral, no
speaker-ID invention, bounded sampling, sustained camera switch/holds, native
synthetic media/cancel/cleanup and zero provider calls. Real diarization/camera
quality, owner visuals and clean-machine/platform/release acceptance remain open.
No credentials, raw-content logs, checkpoint, Git action, cloud or deploy.

Integration refinement: renderer/local/server.ts adds the typed fake speaker
process injection used by its existing native input job; no route/job expansion.
This narrow wiring file was edited alongside the native helper before explicitly
listing it here (allocation deviation). The full synthetic proof first passed,
then its repeat timed out during API clear/restore with the browser still polling
the old workspace. Stop that test page before API-owned lifecycle work and bound
those requests, so a failed check cannot wait indefinitely. This is harness
sequencing, not a reason to change real provider/media behavior.

Evidence: five focused fake files / sixteen checks pass (speaker timing/overlap,
audio-backed camera switches and invented-label refusal, bounded artifacts,
speech parsing and exact discovery metadata). Two app-image checks pass: hosted
inputs contain only inert admission source, never local binaries/models. Native
synthetic browser/export/restore proof passes in 55.62 seconds after the bounded
API lifecycle sequencing fix. It verifies two speaker labels, two visible people,
a sustained speaker camera switch, captions, native export, manual local captions
and saved reload, with exactly two injected speech/diarization operations and
four fake Codex attempts. No real audio/model processing or paid calls.

Local types and scoped ESLint pass; touched code formatted, whitespace clean.
Read-only review: Meets ticket; no actionable findings. Checked input/schema
boundaries, stable anonymous labels, overlap neutrality, existing focus gates,
fixed executable/model hashes, fake/real separation, data-free diagnostics and
bounded confined scratch. Frame panels use only the selected source interval,
cloning its last frame at the boundary; existing JPEG count/byte bounds remain.
Oversize analysis JPEGs use bounded FFmpeg recompression, with no export change.

Explicit free setup completed: eight admitted files, about 64 MB, per-file hashes
verified. Installed CLI help confirms CPU/model/thread/threshold flags without
inference. Model/license files stay ignored; the curation download scratch was
removed after path/link checks. Runtime validates assets, requiring both speech
and speaker tools for real Codex readiness. Normal worker refresh follows CL-151;
no new configuration, sign-in, checkpoint or Git action. Native model accuracy,
real speaker/face matching and personal visual acceptance remain owner-only.
