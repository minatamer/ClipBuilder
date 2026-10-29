# CL-138 — visual start snaps and independent audio layers

Status: implemented and locally validated after CL-137. Owner request 2026-10-29.

Each automatically planned visual gets one original built-in Snap at its start,
never at its end. No extra AI/image/audio generation call. Retain an optional
visual anchor on the editable audio cue so moving/removing the image moves/
silences its accent. Volume/mute/removal remain ordinary manual audio edits;
explicit timing editing detaches the anchor. Preserve overlapping music/effects
and independent original/cue volumes, offsets, looping and Hook projection.
Keep existing finite audio/clip/export limits and source-quality rendering.
Fake AI normally emits no images; injected synthetic image plans prove behavior.

Allocate contracts `audio.ts` / tests, `edit-overlay.ts` / focused tests, backend
`clip-batch.ts` / tests; frontend `audio-inspector.tsx`, `clip-editor.tsx` and
minimal shared styling if needed. Existing browser/native audio proof and
fixtures cover anchored start-only sounds, overlapping cue volume changes,
mute/remove, Apply/Discard/save/reopen and desktop/phone footer geometry.
Update audio design/local feature/backend guides, SOT/index/ticket. No new
dependency, provider call, key/env change, cloud, deployment or Git operation.
Refresh normal worker after shared contract changes using verified lifecycle.
`apps/backend/local/edit-clip.ts` also normalizes anchors before acknowledgment,
so API-driven visual removal frees the same layer slot as browser removal.

- [x] One editable Snap per AI visual start, no end cue or extra AI call.
- [x] Independent volume and concurrent layers preserved in preview/export.
- [x] Anchors, manual overrides and persistence verified with synthetic media.
- [x] Focused checks/review clean; owner listening/real-AI/device acceptance open.

Evidence: 59 focused unit tests passed across audio, batch, editor state and
drafts; final batch rerun 33/33 verifies API removal also frees orphaned accent
slots. Tests prove one Snap per visual, no end cue, clipping/re-expansion at clip
edges, moved/deleted anchors, twelve overlapping independent gains and unchanged
AI/image/native preparation counts. Shared compilation, browser draft updates
and server acknowledgment use the same anchor resolver.

Native audio proof passed actual synthetic MP4 speech/music/effect overlap,
Hook-only stop/repeated timing, native height/cadence and clipping protection.
An added silent-source render measures Snap energy at 1.005s and silence before,
after and at the visual's end (2s), with original volume zero. Expanded real
authenticated browser/worker proof passed (30.44s final run): injected synthetic
image creates one accent, volume 35→12→Discard, Edit timing→Discard, remove/apply,
twelve simultaneous layers, upload cancel/failure/retry, independent music and
Hook sound, seek/mute/pause, export and saved reload. Exactly one fake plan/image
call, zero selection calls and three expected native normalization attempts.
Desktop/834/390/320 geometry/footers pass; anchor screenshots at 1440/390 and
library/tracks screenshots remain ignored under .local-build/evidence.

Local/frontend/proof types, scoped lint/format, contracts build and diff check
passed. Backend-only refresh removed eight owned identities, preserving frontend
15768. Startup supervisor 22228, backend 18408/4000 and worker 11804/4200; all
readiness GETs 200. Runtime/logs: OS temp clipbuilder-visual-sounds-20261029-cl138.
Normal configuration stays fake with the selected Codex provider. No owner media,
provider/cloud calls, credentials, new dependency, deployment or Git operation.

Scoped validation: Meets ticket for synthetic/local validation; no actionable
findings. Existing CL-135/136/137 work preserved, review limited to audio changes
in the current worktree at HEAD 04450d6. Real AI planning, personal listening,
physical-device/rights/hosted/release acceptance remain owner-only. No claim of
sound identification or owner approval of the synthesized Snap. CL-138 closes
before CL-139 code begins.
