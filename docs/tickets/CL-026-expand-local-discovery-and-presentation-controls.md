# CL-026 — Requested moment count, caption customization and video looks

Status: implemented and validated locally in fake/synthetic mode. Owner requested
2026-10-22. Owner subsequently authorized staging and a ticket commit after
validation; no push or live activation. Dependencies:
CL-017–021 and CL-024 are locally implemented. CL-025 real/manual acceptance
and CL-023 actual YouTube activation remain open independently.

## Authorized scope

Extend only the isolated owner workflow. Add an explicit requested count of
1–10 additional AI moments, default four, independent of manual ranges and
10–60-second AI duration bounds. Five with 30–60 seconds requests five grounded
suggestions. If fewer qualify, report requested/returned counts honestly;
never invent passages, pad clips, retry automatically or change manual cuts.
Keep the ten-selected-clip limit and existing one-call discovery budget.

Keep existing caption colors, presets, alignment and placement. Make font size
24–120 output pixels explicit, add a fixed local font menu and independent
animation choices: spoken-word highlight, word pop, line fade and static.
Animation is a deterministic function of clip time, shared by preview/export.
Use installed local fonts only, no font downloads or arbitrary CSS. Older
drafts/styles remain valid and keep their existing hashes/default appearance.

Add Original, Vivid, Warm, Cool and Mono video looks with 0–100% strength.
Apply only to source video, before pictures/captions, without modifying source
masters. One fixed RGB matrix policy drives the browser and native FFmpeg;
allow no custom expressions, LUTs or remote assets. UI, agent patches, draft
save/reopen and immutable export revisions use the existing edit coordinator.

Research: [CapCut's filter guide](https://www.capcut.com/resource/capcut-filter)
describes warm/natural, cinematic and mono families. [Descript's guide](https://www.descript.com/blog/article/guide-to-video-filters-how-to-add-filters-to-your-videos)
describes contrast/saturation and restrained correction. [OpusClip](https://www.opus.pro/tools/animated-text-generator)
offers font, color, size and animation customization. These establish common
product patterns, not a measured popularity ranking. Chosen small looks are
recommendations; no claim of ranking or copied vendor preset values.

## Acceptance and verification

- [x] Count flows through UI, strict contracts, fake selection, real provider
      prompt/response bounds, reconciliation, persistence and shortfall status.
      Test 1/5/10, invalid/fractional counts, manual independence and exact calls.
- [x] Caption font, size, colors and animation preview/export use identical
      time-driven layout; test word boundaries/gaps, line fade/cache identity,
      invalid properties, unchanged legacy parsing and safe geometry.
- [x] Video look/strength flows through shared edits, UI and CLI, saved drafts
      and actual native export; source/pictures/captions remain unchanged.
      Test matrix bounds, original/zero strength, mono pixels and revision/reset.
- [x] Native synthetic proof exercises requested count and changed presentation
      through the protected host; verify encoded frames and no repeated AI work.
- [x] Run owner checks/build, relevant native proof, root format/lint/typecheck/
      unit/build gates and public exclusion; validate/fix/revalidate current diff.
- [ ] Owner-only real AI quality, font readability, filter taste and A/V
      acceptance remain in CL-025; fake/injected success cannot close them.

All agent checks force fake/paid-off before imports, remove keys and deny
external network. Native cuts/edits/exports are real local processing. Actual
AI needs owner-supplied keys, explicit provider/live mode and applicable
rights/transfer/spend approvals; paid tests remain owner-only. No offline AI
model, cloud processing, new dependencies or real downloads are authorized by
this packet. The owner's later explicit approval authorizes staging and a
ticket commit of the validated changes; it does not authorize a push.

## Execution and validation — 2026-10-22

- The requested count flows through the real owner adapter, strict response
  ceiling and provider-neutral reconciliation, plus the fake simulator. A
  bounded proposal pool includes space for skipped manual matches; the final
  additional list is capped at the requested count. Default four and absent
  optional fields preserve previous drafts. No public request schema changes.
- Caption fonts/animation are independent from presets, size and colors. Legacy
  appearance is unchanged when fields are absent. The shared raster-cache key
  includes line-fade progress. Per-font conservative fit avoids overflow and
  may reduce effective size; increasing requested size expands the UI box
  within the safe area. Real readability remains owner-only.
- Fixed RGB coefficients live once in contracts. SVG preview and native FFmpeg
  apply them to source video before overlays. UI/agent edits, strict geometry,
  revision conflicts, reset and saved drafts use the existing coordinator.
  Source bytes and older MP4s remain immutable.
- Focused checks cover counts 1/5/10, invalid counts with zero dispatch, an honest
  shortfall, real-adapter count/prompt limits with injected transports, caption
  boundary/cache behavior, local fonts, fixed look validation and edit/reset.
  The full root gate passes **1,627 unit tests / 143 files**.
- Native batch proof returns five suggestions and retains exact manual cuts,
  exports Georgia/90px/pop plus Mono, verifies near-zero saturation in the MP4
  while picture/caption pixels remain present, saves/reopens and inspects the
  choices through the agent. Edits/re-export retain exact AI counts (four
  explicit transcription/selection actions, three plans/pictures), native peak
  one and zero observed owned survivors. The provider-input handoff proof also
  passes with injected transports and actual native exports.
- A separate native/browser proof checks all five looks (Warm at 50% strength)
  against actual Chrome source-video preview. RGB samples agree within 12/255
  per channel, allowing codec/color-conversion rounding; the cyan overlay is
  unchanged. Synthetic source bytes are unchanged; browser/listener/temp
  resources close in finally paths. These are not real-media editorial tests.
- Actual built UI on a temporary protected host restores requested count five;
  changing size to 96px, Verdana, line fade, Warm and strength 60 updates the
  preview with no AI/render dispatch. Synthetic screenshot was visually checked
  at 1440×1200 and remains ignored at `.owner-build/evidence/cl026-controls.png`.
- Validation corrected the bounded proposal target to allow manual-match
  filtering, preserved legacy opacity markup, added the new agent projection,
  and made the browser check wait for asynchronous draft-analysis restoration.
  A synthetic provider response fixture and font-fit assertions were corrected
  without weakening production validation. Lint's React-child finding was fixed.
- Required gates pass: `format:check`, `lint`, full `typecheck`, `test:unit`,
  fake/paid-off `build`, final `owner:typecheck`, `owner:build` and
  `owner:artifacts` (1,490 public files plus Docker/compiler exclusions). Three
  relevant native proofs pass, including the actual built UI. Build checks use
  an OS-temporary preloader to force fake/paid-off and exclude env-file reads;
  that exact temporary directory was removed. No owner config was changed.
  Generated Next declaration noise was restored. Existing Windows standalone
  output retains 26 external package links; no Linux/deployment proof is claimed.

Final read-only review: **Meets ticket for the authorized local/synthetic scope;
no actionable findings.** Checked current contracts, domain/provider paths,
UI/CLI/drafts, frame/cache/filters, native export, compatibility, privacy,
cleanup and public exclusion. Owner real AI quality, font/software/image rights,
readability, actual filter taste, maximum-load performance and A/V acceptance
remain unchecked in CL-025. CL-023's real downloader wiring/tools/source gates
remain a separate known gap; this ticket does not close them. No API key, ADC,
real media, paid/provider/cloud call, real download, installation, deployment,
staging or commit was used during validation. The owner subsequently authorized
staging and committing this validated packet. Deviation: no reliable popularity ranking was found;
the small fixed look set follows documented common product families instead.
