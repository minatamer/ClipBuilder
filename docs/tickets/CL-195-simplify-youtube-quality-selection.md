# CL-195 — One quality picker with access to other downloadable resolutions

Status: Implemented and locally validated, 2026-11-02. Owner requests removal of the
YouTube audio-track control and an obvious way to download another resolution
when a different quality is already saved. This supersedes CL-187's explicit
track-picker presentation, preserving original/default supported audio and
frozen server choice identity. No real downloads/inference, configuration,
backend/worker restart, Git mutation or deletion of saved media is needed.

## Requirements

- Remove the audio-track UI/state/filtering; resolution ranking automatically
  selects the supported original/default track, retaining exact offered audio
  identity, server validation, source quality and all existing admission limits.
- Saved qualities remain immediately usable offline. The Resolution dropdown
  includes Other resolutions… when online metadata is available; one explicit
  selection fetches metadata, never video or AI. Afterward show saved and all
  admitted downloadable qualities in separate groups. Refresh resolutions…
  permits an explicit refresh after a stale/failed offer. No automatic retry.
- Do not call a cached 144p copy Highest while online qualities are unknown.
  Highest is available only after an offer is loaded and considers admitted
  video tiers/cadence plus complete saved copies. A saved lower quality cannot
  mask a higher downloadable quality. Different supported qualities remain
  independent immutable saved variants; no source overwrite or deletion.
- Keep the anchored Use video / Download video footer, Quality/Range tabs,
  cancellation, error recovery, local-only YouTube and Gemini/hosted limits.
  Failure to load metadata retains saved playback and explicit retry.
- Verify automatic audio ranking, saved-to-new-quality download request identity,
  zero implicit metadata/import calls, retry/offline states, keyboard operation
  and desktop/390/320 layout with synthetic/fake/paid-off/network-blocked tests.
  Real YouTube availability/media/AI quality remains owner acceptance.

## Allocation

Frontend `acquisition-panel.tsx`, `resolution-choices.ts`, its test and `style.css`;
current-source synthetic browser proof `test/local-intake-preview.proof.ts`;
existing backend `source-acquisition.test.ts` for independent retained variants;
this ticket, index, source of truth and local workflow guide. Preserve all
existing CL-194 changes in the card and the unrelated CL-185/194 worktree.
Use one packet with execute/validate/fix until no actionable finding remains.

## Verification and validate result

- Seventeen focused frontend unit cases pass across resolution ranking and
  runtime-capability rendering. Automatic original/default audio keeps the
  server's exact ranked video choice; supported 144p/1080p/2160p admission and
  Gemini English/tier policy remain independent. Removed the unused audio-track
  identity helper and two-column audio/quality styles; no hidden track state.
- The current-source `local-intake-preview.proof.ts` passes with generated local
  MP4 and loopback fake API responses. Cached lookup dispatches zero metadata
  or import calls. Real End-key selection of Other resolutions… issues one
  metadata request; a forced failure leaves Use video and the cached identity
  usable. Explicit retry fetches choices once, then exposes 1080p/2160p while
  retaining the cached 720p entry. Highest is absent before online metadata.
  Choosing 1080p and Download video sends the exact online choice ID with no
  range; the separate Range action retains its exact interval and chosen tier.
  No implicit import occurs on metadata loading or option selection.
- Desktop 1440x900 and phone 390x844 / 320x568 layout/overflow/footer assertions
  pass. Captures are `.local-build/evidence/cl195-quality-{1440,390,320}.png`;
  desktop and 320px images were visually inspected. The one full-width styled
  Resolution control and existing anchored actions fit. Saved preview fallback,
  upload selection/drop, keyboard navigation, error recovery and hosted upload
  intake continue to pass the same proof. No owner media appears in captures.
- One targeted backend regression passes (fourteen unrelated cases skipped):
  two successful fake qualities retain distinct variants; the first manifest
  stays unchanged, and selecting it again uses native inspection with exactly
  two total fake downloads and no third download. Existing production storage
  already binds dimensions/cadence/audio and needs no change or migration.
- Frontend and local `tsc --noEmit`, scoped ESLint, Prettier and
  `git diff --check` pass. Test compositions are synthetic/fake/no-key/paid-off,
  env-file loading disabled and external network blocked. Browser scratch,
  generated video, loopback listeners and owned browser processes are cleaned.

Read-only validate of the settled CL-195 worktree against every requirement:
**Meets ticket; no actionable findings.** CL-194's stall/timeout messages are
preserved in the shared card; all other pending CL-185/194 edits are outside
this verdict. Dependency direction and contracts/hosted/provider gates remain.
No native worker or production backend change/reload was needed. Normal frontend
hot reload serves this UI; existing saved real sources were never altered.

Unchecked: real YouTube availability, language/taste/media quality and owner
manual 1080p/download acceptance; not inferred from fake tests. Downloading uses
local acquisition tools/network, with no AI key required. Future actual AI still
needs the selected provider setup/live gates; this change calls no AI.
Deviations: none. Changes remain unstaged/uncommitted; no push/deployment.

## Local Git authorization — 2026-11-03

The owner now authorizes whole-file planning, staging and ticket-prefixed local
commits under the [file-level commit plan](../operations/CL185_196_COMMIT_PLAN.md).
This supersedes the earlier unstaged handoff; the complete acquisition panel
also retains CL-194's stall/timeout messages. Recorded synthetic verification
is unchanged. No new real download, processing, restart or push is part of this
Git task. Remaining owner media/quality acceptance stays unchecked.
