# CL-067 — Restore saved thumbnails and polish responsive intake

Status: implemented and locally validated, including the explicitly authorized
owner-file diagnosis. Dependencies: implemented CL-041/043/061 intake and preview.

Owner requests — 2026-10-25: fix the saved-video thumbnail that looked blank,
remove unnecessary internal scrollbars, and fill the upload card's empty body
with a responsive dashed upload area.

Authority: source-of-truth shared upload/editor and permanent intake design/
footer rules; preserve CL-043's offline saved-master still-frame behavior.

Acceptance:

- Saved previews sample past the opening intro and decode a silent local frame
  reliably, including bounded-range
  large MP4s, release media on unmount/change and show a stable fallback on
  unavailable/stalled media. No new download, provider/native processing,
  workspace creation, retained-media modification or hosted YouTube route.
- Fitting intake content has no scrollbar; genuine overflow remains reachable.
  Preserve stable paired cards and anchored action rows at desktop/phone sizes.
- Add a dashed, design-system upload area that fills the available body, adapts
  to device size, uses the existing file/drop flow and preserves disabled/error/
  loading behavior. Keep the relevant Choose a video/sample actions in the footer.
- Use current-source synthetic/fake/paid-off/network-blocked browser checks for
  actual frame decode, loading/failure, file selection/drop, keyboard/focus,
  responsive geometry and needed scrolling; run focused tests, types/lint/format
  and read-only validate. Preserve normal apps, configuration and saved media.

No API keys are needed for synthetic checks or offline saved previews. Real AI
still needs configured keys/live flags/approvals and owner-manual actions. No
provider/YouTube/cloud request, deployment or new Git mutation is authorized.

Owner follow-up — 2026-10-25: explicitly inspect the named saved source after
the preview still appeared blank. This authorizes bounded, read-only local file/
decoder and app-preview diagnosis for that file, without copying or modifying
the master, saving real frames, external requests, fresh processing or spend.

## Implementation and evidence — 2026-10-25

- `youtube-preview.tsx` samples at `min(10 seconds, duration / 4)` instead of the
  first second, avoiding the blank/logo intro that looked like a missing image.
  It reveals actual frame readiness from loaded-data/can-play/seek events while
  retaining metadata-only preload. A 15-second deadline replaces a stalled
  preview with the existing icon; stable error callback identity avoids restarting
  the media effect on title/layout updates. Timers/listeners and the media source
  are released on unmount. The player remains muted and paused with no autoplay.
- The baseline browser measurement reproduced actual unnecessary card overflow:
  237px of content in a 180px body at desktop width. `style.css` provides enough
  stable card height and removes excess preview/button spacing and the reserved
  internal scrollbar gutter. Normal resolution content now fits at 1440, 390 and
  320px. Real overflow retains `overflow-y: auto`; a deliberately long synthetic
  error remains scrollable. Paired cards/footers and minimum targets are preserved.
- `experience.tsx` fills the upload body with a flexible dashed drop area, icon,
  concise idle/drag labels and a disabled appearance. It uses the existing card
  drop handler and footer file-picker action; no duplicate submit action or new
  upload transport was added. The same area appears in hosted upload-only mode.
- New current-source `test/local-intake-preview.proof.ts` passes: generated
  1280×720 MP4 larger than one 512-KiB range, end-positioned metadata, actual
  browser frame decode past a generated 1.5-second blank intro at two seconds
  for an eight-second clip, deliberately suppressed `seeked`, paused/
  muted behavior, desktop/phone fit, real overflow scrolling, focused native
  picker routing, dropped-file error/recovery, stalled-media fallback and released
  response, and hosted upload-only rendering. No metadata/download/AI endpoint
  is called; only the expected fake local lookup and one fake file-open action
  occur before the stalled-preview follow-up. Browser/server/scratch close.
- **20 existing focused frontend tests in 5 files pass**: runtime capabilities,
  file opening, hosted upload, start routing and shared workflow controls. Frontend
  and Node-only proof/test TypeScript, changed-file ESLint, Prettier and whitespace
  checks pass. Normal backend health, `/start` and sample configuration return 200;
  frontend hot reload applies these changes without a worker rebuild/restart.
- Visually inspected synthetic desktop/phone captures. Ignored evidence is
  `.local-build/evidence/cl067-intake-*.png` plus `cl067-upload-*.png` and
  `cl067-youtube-*.png`; phone footer captures also prove the existing outer
  content scroll can reveal each complete action row. No real media is pictured.

Read-only validate: **Meets ticket — no actionable findings** for the settled
frontend changes, focused proof and documentation. Reviewed actual component
integration, decoder event/deadline cleanup, callback stability, footer/disabled
behavior, scrolling, shared tokens/motion and local/hosted/privacy boundaries.
No new schema, dependency, backend route, provider dispatch or retained cache.

Verification limits: the older `local-design.proof.ts` already fails before
intake at its superseded startup-card expectation; no full legacy proof pass is
claimed. The new focused proof exercises the current connection/intake contract.
The missing-event and stalled-network paths are synthetic regressions. Physical
devices and fresh real AI remain unverified; native keyboard button semantics
are unchanged and focus/picker routing is checked. No ignored configuration,
saved media or Git state was changed. No credits, cloud changes or deployment.

## Read-only owner-file diagnosis and corrected sampling — 2026-10-25

The owner's enlarged image was the video's blue opening frame and intro logo,
not the component's circular loading indicator. The initial loading diagnosis
did not identify this cause. The explicitly named saved master matches its
recorded byte size, native decoding succeeds, and the protected frontend preview
returns correct HTTP 206 ranges. Fresh Chrome and the in-app browser both decode
the actual saved file through the normal app, with real video dimensions and no
media error. The original Chrome tab could not be inspected because computer-use
access was not approved; no attempt was made to bypass that restriction.

Read-only frame comparison in memory found the first-second background matching
the owner's attached image, while later samples differ. The final implementation
therefore changes the sample clock rather than replacing/re-downloading the
video. Normal-app verification of the same saved source confirms ready state 4,
current time 10 seconds and no spinner. Metadata-only preload is preserved; the
intermediate eager-preload change was removed. The generated blank-intro proof
passes in 30.46 seconds and waits for actual readiness instead of a fixed delay.

The named master was read only under the owner's explicit follow-up permission,
never copied into fixtures, modified, transcoded or used for paid processing.
No real frame, filename, video identity, transcript or screenshot is retained in
this packet. Automated tests remain generated/fake/paid-off/network-blocked.
Read-only final validation finds no actionable issue in the later sampling,
readiness/timeout cleanup or preserved local/hosted boundaries.
