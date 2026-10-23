# CL-033 — Fix real YouTube transfer and verify the fake-AI flow

Status: implemented and verified. Dependency: implemented CL-032. Owner request
2026-10-23. Real download/manual-edit/export trial passed with AI fake; owner
editorial acceptance and real Gemini testing remain separate.

Diagnose the real transfer failure recorded in CL-025, fix the narrow cause and
verify an actual YouTube download through manual timestamps, clip processing,
manual editing and final MP4 delivery. Keep the normal app on 3000/4000 with its
internal worker, fake AI, paid-off and cloud false. The owner explicitly authorizes
real public YouTube requests and native media processing for this test. This
supersedes historical agent-only-synthetic limits for this bounded trial; Gemini,
paid/cloud calls, credential/env reads, deployment and Git mutation remain excluded.

Keep diagnostics content-free: fixed error codes, stage/byte counts and structural
types only. No raw extractor payload, source URL/title, account/capability/env data,
media frame, real caption or source filename in Git/logs/screenshots. Preserve all
existing saved sources/drafts/exports/retained assets and unrelated app processes.

Acceptance:

- Establish the actual failure mechanism, add a meaningful synthetic regression
  and preserve exact format binding, transfer limits, cancellation, safe local
  egress and cleanup. Avoid an automatic quality fallback or provider retry.
- Verify a fresh real source downloads and opens in the UI with synthetic-AI
  provenance. Add exact manual ranges, process selected clips, apply a visible
  local edit and export the acknowledged revision without real AI calls.
- Verify final MP4 bytes and supported media metadata; separate real cutting/
  encoding evidence from fictional captions/pictures. Retain a usable result for
  the owner outside Git, then verify no owned transient native processes remain.
- Run focused regression checks, relevant package/types/lint/format and native
  integration as warranted. Validate the settled diff; record actual evidence and
  any platform, playback/editorial or owner-only checks still unverified.

No API keys or gcloud services are required for this fake-AI/native flow. Real AI
still needs normal Gemini keys, live flags and owner approvals; no offline model
or weights are supplied. No staging, commit, push or branch change is authorized.

## Cause and fix

The first video stream downloaded, then yt-dlp printed `NA` for
`--print after_move:CB_DONE`. A bare identifier is interpreted as a metadata-field
name. The strict progress parser correctly rejected that unexpected record with
`acquisition_progress_invalid`, stopping the session before audio and preparation.

The transfer now uses `after_move:%(id&CB_DONE|CB_DONE)s`: an explicit template
whose replacement and default both emit the constant `CB_DONE`. This is the only
production-code change. It emits no source metadata and preserves the strict
parser, exact selected formats, limits, egress boundary, zero retries and cleanup.
An injected-port regression checks both video/audio transfers. An offline proof
uses the actual pinned downloader and generated template with synthetic local
metadata: the old shorthand emits `NA`, the fixed template emits `CB_DONE`, and
the rejecting local proxy observes zero requests.

## Actual end-to-end evidence — 2026-10-23

The existing normal app performed a fresh real lookup and 240p download, acquired
video and audio, prepared the source and advanced to manual selection. The source
was approximately 19 seconds at 320×240. No source identity, URL, filename, real
caption or media frame is included in this evidence.

- Added exact ranges 00:00:02.000–00:00:08.000 and
  00:00:10.000–00:00:16.000. Manual-only selection returned both cuts, with one
  fake transcription call and zero fake selection calls.
- Processed both selected cuts: two fake plans, two fake pictures and two actual
  native renders. Each cut contains 180 frames at 30 fps.
- Changed clip one's captions to Georgia, 84px and line fade, and its video look
  to mono at strength 60. The acknowledged edit revision became one. Re-export
  produced the current revision with one additional native render and no new AI
  calls. The UI saved the draft and exposed the final download link.
- Requested the actual output route: `Range: bytes=0-31` returned 206 and an MP4
  header; the complete response was `video/mp4` with the expected length. Its
  SHA-256 matched the saved export bytes. Pinned ffprobe decoded/count-checked
  H.264 video at 1080×1920, 30 fps, 180 frames and six seconds, with AAC audio.
- Preserved the source, saved draft and all three outputs under the existing OS
  Downloads/ClipBuilder storage. The edited MP4 remains available to the owner.
  Private content-free diagnostics and downloaded verification copies remain in
  OS temporary storage outside Git; transfer/proof scratch was cleaned.

This proves real acquisition, cutting, local style edits, encoding, saving and
delivery. Captions and pictures are fictional fake-AI output. No real AI quality,
human visual/A/V-sync acceptance, saved-draft reopen/offline behavior, every
resolution or arbitrary YouTube access/challenge compatibility is claimed.

Final readiness checks returned 200 for backend health, `/start` and
`/api/sample/config`. Capabilities remained synthetic AI with cloud false, and
the completed real source was persisted. Verified owned listeners were on
3000/4000/4200; zero transient downloader/Deno/FFmpeg/ffprobe/browser children
remained. The normal app was left running and unrelated apps were preserved.

## Checks and final validation

Executed through the existing pinned package-manager runner where applicable:

- Focused `yt-dlp-acquisition.test.ts` and `acquisition-process.test.ts`:
  26 tests across two files passed.
- Backend `test:unit`: 832 tests across 51 files passed. The focused tests above
  overlap with this suite and are not additional unique tests.
- `local:proof test/local-youtube-template.proof.ts`: one actual pinned-binary,
  synthetic/offline regression passed with zero external requests.
- `local:proof test/owner-acquisition.proof.ts`: two synthetic native integration
  tests passed, including acquisition preparation and cancellation cleanup.
- `tsc --noEmit -p tsconfig.local.json` and
  `tsc --noEmit -p tsconfig.tests.json` passed. Focused ESLint and Prettier checks
  passed for the changed TypeScript; final ticket/index formatting and
  `git diff --check` passed.

Final read-only validate scope: this ticket's unstaged one-line adapter fix,
regression, new proof and evidence documents. Earlier CL-028–CL-032 UI/picker
changes were preserved and excluded from this verdict. **Meets ticket; no
actionable findings.** Acceptance coverage includes the diagnosed real failure,
connected production fix, strict/private output framing, synthetic regression,
actual manual-range/edit/export flow, artifact verification and process cleanup.
No dependencies, schemas, configuration, provider gates, public behavior or
architecture changed. No full-root build/suite was rerun for this argument-only
backend fix; relevant package, types, native and actual-flow evidence is above.

CL-025 owner walkthrough checkboxes remain unchecked. No Gemini/provider/cloud
call, paid processing, credential/env read, deployment or Git mutation occurred.
