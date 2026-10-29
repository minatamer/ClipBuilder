# CL-139 — local-only YouTube sound import

Status: implemented and locally validated after CL-138. Owner request 2026-10-29.

Media → Audio may import a sound from a canonical YouTube URL locally. Hosted
keeps upload/catalogue only and rejects the route before any acquisition call.
Keep the existing audio limits: source up to two minutes and 12 MiB, normalized
audio up to 24 MiB, eight assets/twelve layered cues. Accept audio-only M4A/AAC
without requiring English speech or video resolution (music may have no language).
Longer videos fail before download; users can loop an admitted music cue.

Reuse the prepared yt-dlp/Deno tools, isolated config-on-stdin runner and bounded
YouTube/Googlevideo CONNECT broker, zero retries, fixed private output paths,
metadata/transfer bounds and owned cancellation/cleanup. No arbitrary network
URL, shell, provider, cookies, auth bypass or runtime download. Normalize through
the existing internal audio job and normal asset/draft/spend accounting. Do not
run actual YouTube downloads in agent verification; inject transports/media.

Allocate local acquisition port/yt-dlp adapter and focused tests; a dedicated
audio metadata parser/use case if needed; closed browser-safe request schema;
server authenticated route and runtime/capability composition; shared hosted
allowlist negative tests; frontend `youtube-audio-intake.tsx`, audio inspector,
clip editor/clip batch props and minimal styles. URL intake replaces the active
audio content; Download/Cancel owns the persistent relevant footer, with bounded
loading/errors and abort. Existing upload remains available in every mode.
Synthetic browser/server/native tests prove import/mixing/save, isolation,
oversize/long/DRM/private/invalid URL rejection and cleanup. Update guides/design,
SOT/index/ticket. No provider spend, actual agent download, cloud/deploy or Git.

Implementation names: `packages/contracts/local/youtube-audio.ts` owns the
request/deadline; `apps/backend/local/youtube-audio.ts` owns selection from the
existing normalized projection. Extend `acquisition-port.ts`, `yt-dlp-acquisition.ts`
and its tests; runtime capability `runtime.ts` (contracts) and server route;
`youtube-audio-intake.tsx`, audio inspector, clip editor and batch props.
`control-tabs.tsx` gains an optional disabled prop so the import view cannot be
hidden while its persistent footer owns Download/Cancel; existing callers default enabled.
Extend existing audio browser proof, hosted allowlist/server tests and frontend
proxy rejection tests. The route reuses batch.audio, its accounting and native
normalization. No second storage/library format or service.

- [x] Local URL import reaches normal audio assets; limits and cleanup hold.
- [x] Hosted UI/route absent; exact zero acquisition calls on rejected requests.
- [x] Footer/navigation/responsive/error/cancel and persistence checks pass with fakes.
- [x] Types/lint/format/scoped validate and current-worker readiness pass;
      owner actual-download/listening/rights/device/hosted/release gates open.

Evidence: 37 focused injected downloader/hosted server/contract checks and seven
frontend proxy checks pass. Metadata rejects long/private/DRM/muxed/oversize
sources before transfer. Audio-only music without language/video metadata works;
two fake process calls (metadata/transfer), one broker close, and no output or
acquisition scratch remain. Abort drains the held child and partial output.
Existing video downloader regressions remain covered. No actual YouTube contact.

Expanded authenticated browser/native proof passed, final run 27.28s: automatic
visual accent edits, twelve simultaneous layers, upload cancel/bad/retry, invalid
URL with zero acquisition calls, held import, concurrent import 409 with no
second dispatch, cancel, failure/explicit retry, immediate new-cue controls,
Apply, overlapping playback/mute/pause/seek, native export and saved reload.
Unauthenticated URL import is 403 before acquisition. Exactly three fake URL
calls (cancel/fail/success), four expected native normalization attempts, one
fake image/plan call and zero selection calls. No keys or provider inference.
Intake and library/control geometry pass at 1440/834/390/320; tablet and narrow
phone screenshots were visually inspected. Evidence stays ignored under
`.local-build/evidence/cl139-youtube-audio-*.png` and existing audio proof images.
Physical touch/iOS/Safari acceptance remains owner-only.

One expanded proof run timed out; diagnostic rerun passed in 35.07s, then the
final clean run passed in 27.28s. No reproducible product failure was found.
The timed-out run's exact synthetic temporary directory was verified and removed;
no matching proof process remained. Successful proofs clean their own media.

Local/frontend/proof types, scoped lint/format, contracts build and diff check
pass. Verified backend-only refresh removed nine old owned identities and kept
frontend 15768/3000. New supervisor 24772, backend 26068/4000, worker 21720/4200;
health, /start and /api/sample/config return 200. Safe local capabilities confirm
synthetic-ai, aiProvider=codex, youtubeAudio=true, captionGeneration=false and
captionProvider=local-speech. Runtime and separate stdout/stderr logs:
`C:/Users/minat/AppData/Local/Temp/clipbuilder-youtube-audio-20261029-cl139/`.
No normal-app processing request, ignored configuration read or media deletion.

Scoped read-only validation: Meets ticket for local/synthetic verification;
no actionable findings. Reviewed the current CL-139 worktree at HEAD 04450d6,
including request/asset/hosted boundaries, cancellation, budgets, concurrent
admission, proxy and editor wiring. Prior CL-135/136/137/138 changes remain
preserved. No new dependency, staging, commit, push, cloud change or deployment.
Actual online access, real provider/ASR quality, personal listening, media rights,
physical-device, hosted and release acceptance remain unchecked. Deviation: none.
