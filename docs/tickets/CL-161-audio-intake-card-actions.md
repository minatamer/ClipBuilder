# CL-161 — aligned audio acquisition and card-owned YouTube actions

Status: implemented and locally validated. Plan filed before implementation.
Depends on CL-139/160, present in
the worktree. Preserve all pending work; no Git mutations or deployment.

Owner revision, 2026-10-30: align Upload audio / From YouTube with a small gap.
Opening YouTube sound intake must keep the editor footer's normal actions;
Download sound and Back to sounds belong inside that intake card. This specific
decision supersedes the earlier footer-replacement rule for this nested intake.
Cancellation remains available during acquisition, labelled Back to sounds and
aborting the owned request. Preserve dirty edits, upload cancellation, errors,
limits and hosted exclusion of YouTube.

## Whole-file plan

1. `audio-inspector.tsx` / `style.css`: one wrapping aligned CTA row using shared
   Button geometry and spacing; input remains hidden and descriptions below.
2. `youtube-audio-intake.tsx`: card body plus anchored card action row for
   Download sound / Back to sounds, importing/cancel/error states in the same
   content slot. No native controls or implementation prose.
3. `clip-editor.tsx`: connect download/back/cancel to existing request ownership;
   preserve the workspace's normal edit/export actions while YouTube is open,
   without allowing conflicting processing during the download. Retain local
   import errors in the card; upload retains its current flow.
4. Existing `test/local-audio-editor.proof.ts`: synthetic success/failure/back/
   cancellation, clean/dirty footer parity and aligned CTAs at desktop/phone;
   hosted capability checks stay intact. No real downloader/provider calls.
5. This packet, index, source of truth and `MEDIA_AUDIO.md`: updated ownership
   and actual evidence only. Read pinned Next client guide before edits.

## Validation

Fake/no-key/paid-off/network-blocked injected acquisition and synthetic native
media. Scoped types/lint/format, current-source browser proof and read-only
validate. No paid calls, ignored env access, real YouTube pipeline test or Git
action. Manual audio editing/import mechanics work without AI keys; normal real
AI still requires the selected provider's setup/flags/approvals. Real-device
owner acceptance and hosted release remain separate.

## Evidence

- Frontend files above implement aligned wrapping CTA row (0.5rem gap), a
  card-owned download/back row and in-card errors/import progress. Back aborts
  acquisition without editing retained audio. Opening intake does not mark an
  edit dirty. Clean Export/Add more and dirty Apply/Discard remain in the footer;
  conflicting export is disabled while the owned request runs.
- Current-source synthetic audio/browser/native proof passes in 23.24 seconds:
  `node node_modules/vitest/vitest.mjs run --config scripts/local-proof.config.ts
  test/local-audio-editor.proof.ts`. Covers clean/dirty footer equality, invalid
  URL (zero acquisitions), pending/back cancellation (one abort), failure/retry/
  success, native export/save/reopen, hosted rejection and exact fake counts.
  No real YouTube/provider call or owner video. Existing screenshot names are
  retained in ignored evidence; inspected YouTube 1440/320 and CTA row 1440;
  proof checks 1440/834/390/320 geometry and paired button alignment.
- Frontend TypeScript/scoped ESLint pass. Read-only validation against this
  packet: meets ticket; no actionable findings. No changes to limits, provider
  policy or hosted capability. Earlier pending work excluded from this verdict.
  Real-device/listening/AI editorial/hosted acceptance remains owner-only.
  No config, cloud, deployment or Git mutation.
