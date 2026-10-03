# Local experience quality and pending runtime matrix

CL-013, 2026-10-03. The owner asked to continue building in fake mode and defer
actual media/device testing until CL-014/015. This record distinguishes source /
synthetic checks from runtime observations. No app, browser, real media, cloud,
provider or screen reader was launched for this pass. No captures or film exist.
`FAKE_MODE=true` and no keys support the labelled fixture journey and synthetic
checks; they do not encode a real final MP4 or prove AI quality. Real analysis
requires keys/live/data/rights/paid approvals; rendering needs independent cloud
compute/IAM/storage approval. No local AI runtime or weights are used.

## Verified local corrections

- Final output exposes ordinary mute, readable seek time and a complete text
  transcript. Preview/candidate audio controls use the shared portrait controls;
  these do not expose editing options. Time output has live announcements off.
- First-frame verification has a thirty-second deadline; a profile mismatch,
  stalled frame or later media error disables Download and offers metadata-only
  access retry. Expiry/failure status no longer says verification is continuing.
  Dispose removes both listeners and the deadline. Retry starts zero AI/jobs.
- Nonfinite positions reset to the validated range beginning instead of reaching
  native `currentTime` or the fixture clock as NaN; ordinary seeks stay clamped.
- Final delivery's longer metadata/status/transcript content uses natural rows
  and a bounded portrait area inside the existing scrollable result layout.
  Shared audio controls wrap at narrow widths; phone footer/safe-area and existing
  forced-color focus/control rules remain. This is source evidence, not reflow QA.
- The Remotion review module loads only at the cloud-review stage, following the
  installed Next 16.3.7 lazy-loading guide. Transcript range filtering is memoized
  by its immutable words/range instead of repeated on every Player frame.
- Existing heading focus, skip link, coarse progress status, blocking alerts,
  dialog focus return/Escape, candidate keyboard handling and cleanup were traced.
  No new state authority, device-specific tree, dependency, motion suppression,
  autoplay sound, manual trim or provider call was added.

Focused regression checks: output decode/timeout/error/disposal; nonfinite
native timeline; final transcript/disabled download/zero SSR calls; mute and seek
semantics, existing selection/review/reducer cases. Settled gates recorded in
[CL-013](../tickets/CL-013-complete-accessibility-responsive-and-performance-pass.md).

## Responsive and accessibility observation matrix

Every row below remains **unverified** for this revision. Code and component
markup are inspected; they cannot certify screen-reader, contrast or reflow.
Run the same semantic flow at each anchor, using synthetic content only: landing,
intake/consent/preparation/upload, analysis, zero/four candidates and selection,
automatic assembly, read-only review, explicit export, result/download, connection
failure, cancellation/Clear, uncertain restore, expiry and partial cleanup.

| Anchor or mode | Required observation | Current evidence / next owner test |
| --- | --- | --- |
| 320×568 and 390×844 | Preview, notes/transcript, all actions and privacy reachable; no horizontal page scroll or target collision | Unverified; natural result rows and wrapping controls implemented |
| 768×1024 portrait/landscape and 1024×768 | Same capabilities, orientation preserves state, evidence panels scroll without traps | Unverified |
| 1280×800, 1440×900, 1920×1080, 2560×1440 | Portrait framing, text/action legibility, bounded workspace and no layout overlap | Unverified |
| Heights 600–700 and intermediate resize | Footer, source/portrait frames and dialogs remain reachable | Unverified |
| 200% zoom, text spacing and virtual keyboard | No clipped content, focus obstruction, input zoom trap or lost actions | Unverified |
| Keyboard and Windows screen reader | Heading entry/return, ordinary controls, candidate/evidence, dialogs, status/errors, export/Clear | Markup/source and focused semantics covered; actual observations unverified |
| Forced colors / contrast / focus / targets | Meaning independent of color, visible focus, readable media controls, 44px targets | Existing source rules traced; actual contrast/geometry unverified |
| Motion accessibility | Record the owner's permanent app-motion exception and final visual disposition | No suppression introduced; accessibility/release acceptance remains unverified |
| Slow/offline/hidden/background and two tabs | Bounded waits, honest uncertainty, no redispatch, cleanup/recovery and local lock | Synthetic lifecycle cases covered; browser suspension/eviction unverified |
| Real Player/final MP4 | Matching cut/focus/cards/captions, A/V sync, visible frames, mute, transcript and download | Synthetic only; native actual media and device checks unverified |
| CSP / Turnstile / upload | Dynamic nonce, correct allowed resources, actual challenge/media compatibility | CL-012 local headers/build checks only; runtime unverified |

No installed first-party automated accessibility/E2E command is declared.
A transitive axe package is not a completed audit. No tooling was installed or
new browser test dependency added. Required automated serious/critical findings,
manual matrix and measured quality criteria must be recorded before public release.

## Measured build inventory

Environment: Windows, pinned pnpm 11.19.0, Next 16.3.7, production `next build`.
CL-012 baseline from the `/start/page` client-reference manifest's sample entry:
4 referenced JS chunks, 907,489 raw bytes and 238,176 gzip bytes. All emitted
browser chunks: 17 JS files, 1,970,273 raw and 540,452 gzip bytes. Compression uses
Python gzip with mtime zero; these are build inventories, not network transfer,
LCP/INP, memory, time-to-candidates or cloud/native performance measurements.

Post-correction production inventory: 4 sample-entry referenced JS chunks,
605,480 raw bytes and 147,982 gzip bytes; all emitted browser JS: 18 chunks,
1,977,458 raw and 543,487 gzip bytes. The sample entry references 90,194 fewer
gzip bytes; total emitted code is slightly larger because the review is split.
These are the same manifest/inventory measurements, not browser latency proof. No performance threshold or
cloud SLA is invented. Owner/runtime thresholds and maximum-source (20min / 500MiB)
and final 60s native performance remain to be measured before a go verdict.

## Film readiness

The ticket places production after owner approval of final desktop/phone UI,
then sanitized capture baseline, shot/title/storyboard/duration/weight/audio/
brand rights approval and the designated `gpt-6.1-sol` handoff. These are all
unchecked. No capture package, storyboard, animatic, authoring chat, composition,
media export or landing integration was created ahead of that sequence. The
existing placeholder remains labelled. No fake MP4 is presented as output proof.
The approved source-of-truth permanent motion decision takes precedence over
older reduced-motion instructions; final motion accessibility remains open.
