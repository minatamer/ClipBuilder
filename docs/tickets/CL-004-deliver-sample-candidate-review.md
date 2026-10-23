# CL-004 — Deliver the sample-to-candidate-review experience

Status: Full local development preview verified; independent/local/real-media/manual gates pending<br>
Milestone: M1 — deterministic sample story<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-002 owner-approved visual direction and CL-003<br>
Blocks: CL-007 and the automatic clip-review composition in CL-010<br>
Suggested commit: `CL-004: deliver and validate the full single-card development flow`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Owner revision and execution plan (2026-10-01)

### Browser-owned-media handoff (2026-10-01)

The current fake implementation/evidence is unchanged. CL-005 now follows
source-of-truth section 0.9 and [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md),
not the older future GCS upload/server-render handoffs retained in this packet.
It owns local File/OPFS/IndexedDB/range playback, capability/admission and shared
schema/state/config migration. Later tickets own protected AI/local composition/
export. Preserve the approved card, motion and existing fake cleanup fence;
fake verification is not proof of new storage, codecs, device or model behavior.

### Latest interrupted-cleanup persistence revision

The owner-authorized validation follow-up identifies a possible lost recovery
signal after failed/pending cleanup plus refresh. Current provider removes its
projection on clearing, and clearing/cleanup-partial have no identity to save.
Verify this with a temporary synthetic-only mounted-provider browser harness,
without altering the approved direct-export UI or backend authorization guards.

1. Reproduce interrupted upload -> refresh -> failed cleanup -> refresh ->
   replacement metadata using the actual provider and loopback fixture backend.
   The temporary harness controls only clear failure/pending behavior and is
   removed before final verification; it is not a product route/capability.
2. Retain a separate content-free cleanup-required marker while dropping the
   ordinary projection and owned effects. Marker takes precedence on bootstrap
   and restores the existing clearing state; retry the same idempotent clear
   before enabling intake. Remove it only after confirmed success. Store no
   media, names, identity, cookie, token, capability, transcript or error body.
3. Test the provider's actual persistence policy, pending/failed refresh,
   retry/success, missing/expired sessions and replacement after confirmed clear.
   Verify mounted browser failure/pending/reload paths, remove all temporary
   artifacts, run required root gates, record actual results and notify the same
   side chat. Existing manual/visual/external gates stay open; no Git action.

#### Interrupted-cleanup persistence evidence

- Reproduced before the production fix using a temporary mounted SampleExperience
  harness. It wraps only clear failure/pending and upload completion delay; start/
  authorization and server evidence use the actual loopback fixture API. Pending
  upload -> refresh -> forced clear failure reaches cleanup-partial. A second
  refresh incorrectly showed intake. A metadata-only replacement WebM then got
  upload/authorize HTTP 409 and the stale-evidence UI error. The server had not
  cleared its original upload authorization. This is new mounted/browser evidence,
  not inferred from the earlier domain tests or the older Clear/restart report.
- session.persistence.ts now owns the actual persistence policy and a separate
  clipbuilder.cleanup.v1 marker with literal value required. Clearing/cleanup-
  partial save only that marker and remove the ordinary projection. No identity,
  source metadata, content, error, cookie, token or capability remains. Unknown
  marker values fail closed. Provider bootstrap checks the marker before ordinary
  projections, returning to existing clearing; confirmed success enters intake
  and removes it. A layout effect persists intent before child passive effects
  start clear, closing the initial-request ordering gap. No new stage, schema,
  listener, timer, transport, credential or backend production change.
- After the fix, forced failure followed by repeated reloads keeps Retry cleanup
  visible with no intake/input action. Allow cleanup -> Retry cleanup -> intake
  accepts replacement WebM metadata and reaches Moments without stale revision.
  Pending clear followed by repeated reloads stays Clearing, not intake. Removing
  the fixture server session while clear is pending, then allowing cleanup and
  refreshing, reaches intake through the idempotent clear. Further forced failure/
  reload -> normal /start confirms cleanup and a replacement reaches Moments,
  review -> Confirm export directly -> progress -> delivery. Start over succeeds;
  the test browser tab is closed and original intake restored. No captured browser
  warnings/errors; no real file content was read or uploaded by the app.
- Three new frontend tests exercise the provider's extracted persistence policy
  across pending/failure/retry/success and replacement readiness, assert exactly
  one content-free marker/no projection, and cover unknown marker/expiry behavior.
  Mounted provider ordering/reload behavior was verified in the browser harness,
  not claimed as a mounted React unit test. Two backend model tests cover expired/
  missing session cleanup, repeated clear and fresh changed size/type admission;
  exact provider/inspection/analysis/assembly/render counts remain zero. Focused
  frontend persistence/regressions/lifecycle run passes 60 tests; backend preview
  run passes 10 tests. Existing strict authorization/idempotency guards remain.
- Removed the temporary cleanup-validation route/directory and synthetic metadata
  stub before final checks. Build includes only normal routes. No temporary
  listener remains; harness pending listeners abort on reload/unmount, fixture
  data was cleared, and its tab-only control values disappeared when the temporary
  tab closed. Saved/inspected outside-Git synthetic captures:
  cl004-cleanup-failure-reload.png and cl004-cleanup-replacement-recovered.png.
  No viewport override, visual/motion change or unrelated revision.
- All five final gates pass after temporary harness removal:
  corepack pnpm format:check, corepack pnpm lint, corepack pnpm typecheck,
  corepack pnpm test:unit, corepack pnpm build. **249 tests pass** (root 11,
  contracts 38, backend 68, frontend 132). Changed session.provider.tsx,
  session.persistence.ts and its test, backend developmentPreview.test.ts,
  frontend README, parent development-preview clarification and this packet.
  Inspected cleanup/request ownership, retained values, dependency direction,
  obsolete imports and approved export behavior. No scope deviation or external
  action; unrelated work preserved and nothing staged/committed. Independent/
  owner/native AT/zoom and existing real-media/rights/privacy/provider/
  credentials/paid/spend/cloud/release gates remain open. Revalidation request
  delivered to the same authorized chat; no verdict or whole-ticket approval
  is inferred.

### Latest single-confirmation export revision

The owner approves Confirm export directly on final review. Remove Continue to
export, the separate confirmation screen and its Back action, not the deliberate
confirmation or one-render safeguards. Keep the existing review/player/notes,
processing animation and result layout unchanged.

1. Collapse the frontend review/confirmation stages into clip-review. Its
   confirm-render action requires hydrated immutable analysis/assembly evidence
   and remaining allowance; the explicit button sends the existing manifest-bound
   render request. Preserve synchronous duplicate-request ownership, aborts,
   error retry, server idempotency and exhausted-allowance behavior.
2. Remove obsolete navigation events/actions/UI. Keep only the old persisted
   render-confirmation hint as a compatibility input, restoring it to clip-review
   after the same server identity/revision/manifest checks. Never render on
   review mount, restore, playback, or notes activation.
3. Update focused flow/reducer/restore regressions, frontend README and parent
   screen decision. Check direct pointer/keyboard export, review reload,
   cancel/restart and responsive CTA/player bounds using synthetic data. Run
   focused checks and the five root gates, record actual evidence, and ask the
   same authorized side chat to revalidate. No external/Git action or new gate
   approval; unrelated changes and permanent motion decision remain intact.

Browser rapid-click finding: after Confirm export starts, the second click in a
double-click can hit Cancel preview in the same footer position. The local log
shows one render start followed by clear, not duplicate rendering. Ignore only
repeated pointer click detail on the processing Cancel action; normal first
clicks and keyboard activation remain available. No delay/debounce timer or
suppression of ordinary cancellation. Recheck direct double-click and ordinary
cancel/restart before recording success.

#### Single-confirmation export evidence

- Final review now has one Confirm export button, dispatching the existing
  manifest-bound request directly. Removed the active render-confirmation stage,
  RENDER_REVIEW/BACK_TO_REVIEW events, navigation actions, stage title/progress
  entry and duplicate UI. Only the persisted legacy hint remains for compatible
  restore; it reconciles to review through the existing server checks. Hydrated
  analysis/assembly and remaining allowance gate confirmation. Busy ownership,
  abort handling, backend idempotency, one-render accounting and result semantics
  are unchanged. No auto-render on review entry/reload or new workflow authority.
- Focused five-file frontend run passes **76 tests**. Updated complete-flow and
  reducer/restore regressions for direct confirmation; added duplicate-event,
  missing-bundle, wrong-operation and exhausted-allowance coverage plus two
  legacy-hint restore cases (allowances 0/1, manifest conflict, no automatic
  render and new projections using clip-review). An initial new assertion used
  the wrong conflict label; corrected to existing server-conflict before passes.
- Browser verified review reload preserving Moment 2 and an enabled direct CTA,
  pointer double-click entering Exporting without the second click cancelling,
  normal pointer cancellation, keyboard render cancellation, immediate prepared
  restart without reload, and keyboard Confirm export -> progress -> delivery.
  Progress advanced from 0 to 75%, with elapsed 00:00 -> 00:01; final delivery
  retains the same selected portrait and disabled Download/social buttons. Local
  request evidence shows exactly one render start per direct activation run;
  no duplicate-render request was produced by the rapid click. The prior failed
  rapid-click run had one render then clear, as documented above. The cancellation
  guard ignores click detail >1 only, preserving keyboard detail 0 and first
  pointer detail 1; no new timeout/listener or blocked ordinary cancellation.
- At 320x568, 390x844, 768x1024, 1024x768, 1440x900, 1280x650 and 619x618,
  there is exactly one fitting 44px Confirm export button, no obsolete actions,
  no horizontal page overflow, an in-viewport footer and a 9:16 portrait above
  the CTA. Saved/inspected synthetic-only default-viewport proof outside Git:
  cl004-direct-export-confirmation.png. Viewport reset; paused delivery retained.
  No captured browser warnings/errors. No real media or content was used.
- After the final cancellation guard, all five root gates pass:
  corepack pnpm format:check, corepack pnpm lint, corepack pnpm typecheck,
  corepack pnpm test:unit, corepack pnpm build. **244 tests pass** (root 11,
  contracts 38, backend 66, frontend 129). No backend/contracts/configuration,
  dependency, provider, media capability, motion or styling change. Checked dead
  navigation references, boundary ownership, projection privacy and request/
  effect cleanup; only deliberate legacy-hint references remain.
- Changed sample.experience.tsx, development.progress.test.tsx, session types/
  selectors/reducer/reconciliation/persistence and their three existing test
  files, frontend README, parent sections 0.6/6.7/6.8 and this packet. Unrelated
  work is preserved; nothing staged or committed. No scope deviation or external
  action. Independent/owner visual approval, native AT/zoom checks,
  real-media/rights/privacy/provider/credentials/paid/spend/cloud/release gates
  remain open. Revalidation request delivered to the same authorized side chat;
  no verdict is inferred and the whole ticket is not marked approved.

### Latest validation-findings recovery revision

The owner authorizes independent reproduction and durable fixes for the three
Medium findings forwarded by the existing validation chat, after the copy work.
Keep the approved landing copy and unrelated provider/film work unchanged.

1. Reproduce Clear/restart and cancellation across repeated active stages; trace
   reducer, provider persistence, stage effects and owned aborts. Initial current-
   browser Clear -> prepared input and upload-cancel -> prepared input both work
   without reload. Do not invent a fix for the older non-reproduced report; add
   focused cancellation/restart regression coverage and record further evidence.
2. Reproduced interrupted-upload refresh -> intake -> different synthetic WebM
   metadata -> `STALE_REVISION`. Browser restore loses runtime source metadata
   while the server correctly retains the original authorization. Reconcile
   unresumable pre-media upload projections to the existing clearing state,
   not directly to intake. Await confirmed cleanup before accepting new input;
   failures use existing cleanup-partial/retry. Preserve backend same-input
   idempotency and strict upload/session/revision guards. Test pre-authorization/
   upload restoration, replacements, same-input retries and stale completions.
3. Reproduced 320x568 delivery overlap: Download y=483.39..527.39 and social
   heading y=484.39..508.39. The social auto row shrinks to 17px while its centered
   contents overflow upward. Use intrinsic social height/max-content phone rows
   with bounded keyboard-accessible scrolling. Separate the height-query video
   slot from its parent download row, removing the guessed 4rem player deduction.
   Keep all disabled actions, 44px targets and the existing responsive split/
   stack design. Verify phone/short-height/breakpoint content bounds.
4. Run focused tests, synthetic-only browser checks and the five root gates;
   record cause/fix/reproduction for each finding and notify the same side chat.
   No credentials/provider/cloud/paid/Git action or broader completion claim.

#### Recovery reproduction and manual evidence

- **Clear/restart:** the historical failure did not reproduce in the current
  worktree. Before the recovery changes, completed-delivery Clear -> prepared
  input and active-upload cancellation -> prepared input both started normally.
  After the changes, cancellation during upload, inspection, analysis, build and
  render each allowed immediate prepared-input restart without reload. A selected
  synthetic WebM input also reached Moments. No speculative provider/effect/key
  workaround was added for this older finding; it is not claimed fixed. New
  runner/registry/reducer regressions cover three cycles in each of five active
  stages (15 total), ignored late completions, fresh metadata/session/upload
  authorization and zero unowned effects or unexpected transport calls. These
  are domain-effect tests plus browser checks, not a mounted React unit test.
- **Upload refresh:** reproduced refresh during prepared upload -> intake ->
  replacement WebM metadata -> `STALE_REVISION`. Restoring source-free state to
  intake reused the old server authorization. Reconciliation now enters existing
  clearing before input is available; upload-authorizing requires only proven
  intake because authorization is still pending. Existing identity/revision/
  operation checks run first; completed uploads still resume. Cleanup-partial/
  retry stays intact. The changed upload-rollback test failed before the fix,
  then passed. New restore cases cover pending/confirmed authorization and
  upload, blocked selection while clearing, failed cleanup and retry. Backend
  model/API tests preserve same-input idempotency and reject old tokens/upload
  IDs after same-size, changed-size and changed-type replacement. Backend
  production code and schemas are unchanged. The reproduced browser path now
  reaches Uploading and Moments without a stale-revision error.
- **Delivery:** the 17px social row centered 169px of contents upward into
  Download. Intrinsic minimum row sizing, a max-content stacked social row and
  bounded scrolling keep the complete section in its own track. A separate
  size-query portrait slot removes the guessed 4rem deduction; Download retains
  its actual auto-sized row. The delivery region is keyboard focusable. At all
  15 sizes, portrait stays 9:16/in its slot, Download stays in its column, no
  portrait/Download/social/heading overlap, social children/text fit, no horizontal
  page overflow, and Download/social targets remain 44px/52px, all disabled.
  Sizes: the seven baseline dimensions plus 479/480x568, 599/600x568,
  799/800x618, 320x480 and 600x400. At 320x568 Home -> PageDown scrolls 0 -> 238
  and exposes every action. Extra-short sizes use the existing natural page
  fallback; keyboard footer focus makes Start over visible (page scroll 72/112px).
  Viewport reset and paused delivery retained. Phone/default proof saved/inspected
  as `cl004-delivery-layout-recovery-phone.png` and
  `cl004-delivery-layout-recovery.png` outside Git. Disposable metadata-only
  WebM stub removed; no media bytes, real content, credentials or providers used.
- Focused frontend recovery/progress/review suite passes 61 tests; focused backend
  development suite passes 8. After final CSS/semantic edits, all five root gates
  pass: `corepack pnpm format:check`, `corepack pnpm lint`,
  `corepack pnpm typecheck`, `corepack pnpm test:unit`, `corepack pnpm build`.
  **241 tests pass** (root 11, contracts 38, backend 66, frontend 126). No captured
  browser warnings/errors. Inspected dependency direction, stale requests,
  projection privacy, effect/timer cancellation and content boundaries. No new
  dependency/schema/provider/job/media capability or production timer/listener.
- Changed `session.reconciliation.ts`, `clip.review.tsx`, `sample.module.css`,
  `session.persistence.test.ts`, `review-revision.test.ts`, backend
  `developmentPreview.test.ts`; added `lifecycle-recovery.test.ts`. Updated
  frontend README, parent development-preview clarification and this packet.
  Approved landing copy and unrelated changes are preserved. No scope deviation
  or external/Git action; final diff check passes and staged diff is empty.
  Revalidation requested in the same authorized side chat; no verdict inferred.
  Independent/local/native AT/zoom and prior real-media/rights/
  privacy/credentials/paid/spend/cloud/release gates remain open. The two newly
  reproduced issues are locally fixed; the older Clear/restart report is not
  claimed fixed or definitively disproven by this evidence.

### Latest landing process-copy revision

The owner approves the single-sentence heading "Turn long-form video into a
clip worth sharing." and supporting copy "AI finds the standout moments in
interviews, podcasts, speeches, and more. You choose one. We finish it with
captions and visuals." Change only the existing How it works intro and matching
server-markup regression; preserve its semantic heading, layout, animation and
three-step illustration. Record the broader intended spoken-content positioning
in parent section 1.1 without claiming per-format real-media validation. Check
responsive wrapping/overlap, run focused and required root gates, record actual
evidence and ask the same authorized side chat to revalidate. No provider/media/
Git action, workflow change or unrelated visual fix.

#### Landing process-copy evidence

- Changed only the intro copy in `process-narrative.tsx`, its existing
  `page.test.tsx` assertion, parent section 1.1 and this packet. Heading ID,
  layout/styles, motion, illustration, workflow and fake/live gates are unchanged.
- Running landing displays both approved strings. At 320x568, 390x844,
  768x1024, 1024x768, 1440x900, 1280x650 and 619x618, heading/body wrap inside
  their container without horizontal page/text overflow or heading/body/next-
  layout overlap. Default-viewport screenshot inspected and saved outside Git
  as `cl004-landing-process-copy.png`; no browser warnings/errors captured.
  Viewport reset; updated landing and existing paused workspace retained.
- Focused page run passes 10 tests; five root gates pass:
  `corepack pnpm format:check`, `corepack pnpm lint`, `corepack pnpm typecheck`,
  `corepack pnpm test:unit`, `corepack pnpm build`; **229 tests pass**. No new
  dependency/schema/state/timer/listener/request, media or provider exposure.
  Unrelated work preserved; nothing staged or committed. No scope deviation.
- Independent revalidation/owner visual acceptance, native AT/zoom
  checks, per-format real-media validation and all prior rights/privacy/provider/
  credentials/paid/spend/cloud/release gates remain pending. Prior reset/smallest
  delivery findings are unchanged. Revalidation requested in the same side chat.

### Latest glass-player-controls revision

The owner asks whether these controls will carry into real playback and requests
the landing navbar's glass background for both Back and the lower player. The
shared shell is intended to carry forward when later gated media adapters are
connected; current PortraitPlayer is still placeholder/simulated playback, not
a working real-media player. Do not wire media or claim those gates passed.
Extract the navbar's existing surface/border/blur/inset-edge/sheen into shared
tokens without changing its appearance. Use the same recipe on both player
overlays, with a stronger 72% media tint for readable white controls over bright
footage and an opaque unsupported/reduced-transparency fallback. Native forced
colors stay supported. Preserve all visibility/focus/idle timers, 44px buttons,
bounded seeking, disabled behavior and existing animations. Verify responsive
overlay bounds, control behavior and unchanged navbar, run focused/five-root
checks, record evidence and ask the same authorized side chat to revalidate.
No provider/media/Git action or unrelated reset/result-layout fix.

#### Glass-player-controls evidence

- Updated shared `tokens.css`, landing `page.module.css`, feature
  `sample.module.css`, frontend README and this packet. Extracted the existing
  navbar glass surface/border/backdrop/inset-edge/sheen into used shared tokens.
  Navbar still measures 50% navy, 18px blur/175% saturation/108% contrast and
  its original border, highlights and shadows. Both player overlays measure
  the same 72% navy surface, blur, border and edge treatment, with white
  controls, translucent hover and distinct disabled styling. No player JS or
  media adapter changed. Opaque no-blur/reduced-transparency and native forced-
  color fallback rules preserve motion and existing reveal/idle behavior.
- Moments, final review and delivery checked at 320x568, 390x844, 768x1024,
  1024x768, 1440x900, 1280x650 and 619x618 (**21 player states**). All retain
  9:16 (within CSS pixel rounding), 44px action targets, fitting time text,
  overlays fully inside the portrait and zero horizontal page overflow. Back
  and playback glass match in Moments; review/delivery reuse the same shell.
  This is player/header evidence, not acceptance of unrelated result panes.
- Mouse playback reaches opacity 0 while still playing at 00:32; full-frame
  reveal restores controls, keyboard Pause keeps them visible, Back returns
  to the gallery/focus and reselection resets playback. Keyboard Home seeks
  to exact source start 60000ms. Fake build/confirmation/export reach delivery
  with disabled download/social actions unchanged. A conservative sRGB check
  for 72% tint plus 10% white sheen over white gives white-text contrast 5.60:1;
  it is not real-footage or accessibility acceptance.
- Saved/inspected synthetic-only `cl004-glass-player-controls.png` and
  `cl004-glass-delivery-controls.png` outside Git. Navbar screenshot inspected;
  temporary landing tab closed, viewport reset and paused delivery retained.
  No browser warnings/errors captured. Focused player/landing run passes
  29 tests. All five root gates pass: `corepack pnpm format:check`,
  `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`,
  `corepack pnpm build`; **229 tests pass**. No new dependency/schema/state/
  timer/listener/request/provider exposure. `git diff --check` passes, staged
  diff empty and unrelated work preserved; nothing staged or committed.
- Shared controls remain intended for later real playback, not currently
  wired to video. Owner/independent visual acceptance, native AT/zoom/forced-
  colors/reduced-transparency checks and previous
  real-media/rights/privacy/credentials/paid/spend/cloud/release gates remain
  pending. Prior reset/smallest delivery findings are unchanged. Revalidation
  requested in the same authorized side chat.

### Latest privacy typography and merged-panel revision

The owner requests a more balanced type hierarchy and one lower card instead
of three, preserving number/title/notes layout. Reuse shared type/spacing/radius
tokens: 28px title, 14px intro/headings/notes, 12px numbering; phone title is
22px at a fixed breakpoint, never viewport-scaled. Move the existing glass
surface/border/blur from individual rows to their single parent, with thin
row dividers. Preserve three columns above 599px and numbered title/notes
stacking on phones. Use an 18px Lucide close glyph with the existing 44px
button. Update reduced-transparency/no-blur/forced-colors fallbacks to target
the merged parent, without adding any motion suppression. Keep all copy,
secondary/default triggers and the removed bottom paragraph unchanged.
Verify responsive typography/panel bounds, visible layout, scrolling and
keyboard close/focus return; run five root gates, record evidence and request
revalidation in the same authorized side chat. No workflow/provider/Git action
or unrelated reset/result-layout fix.

#### Privacy typography and merged-panel evidence

- Updated `page.module.css`, `privacy-dialog.tsx`, frontend README and this
  packet. One glass panel owns the three transparent rows; only rows two/three
  have thin top dividers. Parent blur/border/shadow and 8px shared radius replace
  individual row cards. No-blur/reduced-transparency/forced-color rules target
  the parent, with native-color separators. No motion gate added or restored.
- Shared type sizes measure 28px heading (22px below 600px), 14px intro/title/
  notes and 12px numbers; spacing is not viewport-scaled and has no negative
  tracking. Explicit margins prevent landing/workspace typography inheritance
  from collapsing the 12px intro gap. Number/title/notes columns stay aligned
  on wider screens; phone notes occupy the title column on a second row.
  Lucide close glyph is 18px inside the unchanged 44px button.
- Browser matrix covers 320x568, 390x844, 768x1024, 1024x768, 1440x900,
  1280x650 and 619x618 plus 599/600px widths at 800px height. All nine states
  fit modal bounds, have zero horizontal/text overflow and no title/close
  collision. Measured one 1px parent border, 8px radius, transparent/no-shadow
  rows and exactly two separators. At 320x568 keyboard PageDown moves the
  bounded dialog from scrollTop 0 to 237; Escape closes and restores visible
  focus. Landing/default trigger separately renders the same sizes/panel and
  also passes Enter/Escape/focus return. Copy and removed footer stay unchanged.
- Saved/inspected synthetic-only `cl004-privacy-merged-panel.png` outside Git.
  Temporary landing tab closed, viewport override reset and workspace dialog
  retained. No browser warnings/errors captured. Focused page run passes
  10 tests. Five root gates pass: `corepack pnpm format:check`,
  `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`,
  `corepack pnpm build`; **229 tests pass**. No new dependency/schema/state/
  timer/listener/request/provider action. `git diff --check` passes and staged
  diff is empty; unrelated work preserved, nothing staged or committed.
- Independent/local/native AT/zoom/forced-colors/reduced-transparency
  and all prior real-media/rights/privacy/credentials/paid/
  spend/cloud/release gates remain pending. CSS fallbacks are implemented,
  not manually accepted. Prior reset-path/smallest delivery findings remain
  unchanged. Revalidation requested in the same authorized side chat.

### Latest privacy-summary removal

The owner requests removal of the highlighted bottom development-summary
paragraph in Privacy & limits. Remove that paragraph and unused `dialogNote`
styles, including its forced-colors selector. Keep the dialog intro, all three
rights/scope/size rows, no-file-read/upload statement, secondary workspace CTA
and default landing trigger. Update the existing native/secondary trigger
regressions and owning README/parent clarification. Verify the running dialog,
phone bounds and Escape/focus return; run the five root gates and request
revalidation in the same authorized side chat. No capability or safety gate
changes, Git/provider/cloud action, or unrelated reset/result-layout fix.

#### Privacy-summary removal evidence

- Removed the bottom paragraph from shared `privacy-dialog.tsx` and unused
  `dialogNote` styling/forced-colors selector in `page.module.css`. Updated
  the two existing native/secondary trigger cases in `page.test.tsx`, frontend
  README and parent sections 0.6/1. Rights/scope/limits rows, intro, no-file-
  read/upload statement, both trigger styles and dialog semantics remain.
- Running dialog has three sections and no removed summary at 320x568,
  390x844 and 1440x900. Dialog bounds fit each viewport; no dialog/page
  horizontal overflow. Enter opens, Escape closes and returns focus-visible
  to Privacy & limits. Viewport override reset; dialog reopened for the owner.
  Saved/inspected synthetic-only `cl004-privacy-summary-removed.png` outside
  Git. No provider or user media was used.
- Focused page test passes 10 tests. All five root gates pass:
  `corepack pnpm format:check`, `corepack pnpm lint`, `corepack pnpm typecheck`,
  `corepack pnpm test:unit`, `corepack pnpm build`; **229 tests pass**.
  `git diff --check` passes and staged diff is empty. No new dependency,
  schema, state, timer, listener, request or configuration/capability change.
- Independent/local/native AT/zoom/forced-colors
  approval and all prior real-media/rights/privacy/credentials/paid/spend/
  cloud/release gates remain pending. Previously recorded reset-path and
  smallest delivery-layout findings are unchanged, not claimed resolved.
  Unrelated work preserved; nothing staged or committed. Revalidation is
  requested in the same authorized side chat.

### Latest secondary-header-actions revision

The owner requests secondary-designed Privacy and Clear CTAs, replacing the
trash-only control with a two-word command. Use the existing shared secondary
Button for Privacy & limits and Clear media. Add an opt-in secondary trigger
to the existing PrivacyDialog without restyling landing navigation. Remove the
obsolete quiet header styles and trash import, preserving dialog behavior,
conditional Clear availability and the existing clear use case. Below 480px,
place equal-width actions below the brand and adjust the workspace height so
the taller header does not consume the footer. Verify responsive bounds,
keyboard/dialog focus return and clear behavior, add a focused trigger
regression, run the five root gates and request revalidation in the same
authorized side chat. Keep all provider/rights/paid/cloud/release gates open;
no new workflow, disclosure, capability or Git action.

#### Secondary-header-actions evidence

- Updated `sample.experience.tsx`, `sample.module.css`, `privacy-dialog.tsx`,
  `page.test.tsx`, frontend README and this packet. Both workspace actions use
  the shared secondary Button, retaining its surface/border/hover/press style.
  Clear media is visible two-word text, with no trash icon. PrivacyDialog's
  opt-in variant preserves the landing's existing native navigation trigger.
  Removed unused header text-button rules and icon imports.
- Header checked at 320x568, 390x844, 768x1024, 1024x768, 1440x900,
  1280x650 and 619x618, plus the 479/480px layout boundary at 800px height.
  Final nine-state matrix has no brand/button collisions, horizontal overflow
  or button-text overflow;
  visible actions have 44px height and shared 1px borders. Below 480px the
  final corrected grid spans the full row: at 320px both buttons are 140px
  wide, and Privacy alone is 288px when Clear is unavailable. Main bottom is
  560px at 320x568, retaining the 8px outer margin. Header geometry and
  conditional action availability are verified, not unrelated result panes.
- Enter opens Privacy & limits; Escape closes it and returns focus-visible
  to the secondary trigger. Keyboard activation of Clear media enters
  clearing, then returns to the intake with Clear unavailable. Disclosure,
  source/player/download semantics and existing reducer/use-case remain
  unchanged. Saved/inspected synthetic-only `cl004-secondary-header.png` and
  `cl004-secondary-header-phone.png` outside Git. Viewport override reset.
- Two focused regressions preserve one named non-submit dialog trigger and
  unchanged disclosure for native/default and secondary variants. Focused
  page run passes 10 tests. All five final root gates pass:
  `corepack pnpm format:check`, `corepack pnpm lint`, `corepack pnpm typecheck`,
  `corepack pnpm test:unit`, `corepack pnpm build`; **229 tests pass**
  (root 11, contracts 38, backend 62, frontend 118). No captured browser
  warnings/errors. No new dependency/schema/timer/listener/request/state.
- Separate existing reset-path finding: after Clear completes, Use prepared
  input had no effect until a page reload; the fresh intake then starts upload
  normally, reaching the three-choice Moments gallery. Record for independent
  revalidation rather than altering session
  behavior in this presentation-only request. The previously recorded smallest
  delivery overlap also remains unresolved; this revision claims only header
  bounds. Independent/local/native AT/zoom/forced-colors
  and all prior real-media/rights/privacy/credentials/paid/spend/cloud/
  release gates remain pending. No Git/provider/cloud action; unrelated work
  preserved and staged diff empty.

### Latest header-label revision

The owner requests removal of the header's Local preview badge. Remove the
badge, its now-unused Workspace mode prop and wrapper/styles, including the
mobile override. Keep the brand, Privacy & limits and Clear action; preserve
configuration gating, unavailable real processing, explicit portrait
placeholders and disabled download/social actions. Privacy & limits retains
the existing development disclosure. This supersedes the earlier persistent
header badge decision, not any media/provider/rights/spend/release gate.
Update the owning frontend README and parent clarification, verify desktop
and phone headers plus the privacy dialog, run the five root gates, and ask
the same authorized side chat to revalidate. No Git or external action.

#### Header-label evidence

- Removed the header badge, unused mode prop/call-site values, brand wrapper
  and desktop/mobile badge styles in `sample.experience.tsx` and
  `sample.module.css`. Updated the frontend README and parent sections 0.6/1
  to record the owner decision; no configuration, provider, workflow, player
  or download behavior changed. No badge/wrapper references remain in code.
- Running browser confirms no Local preview badge. Brand, Privacy & limits
  and Clear remain at 1440x900 and 320x568, without header overlap or horizontal
  overflow. Privacy dialog retains the full no-upload/no-provider/no-output
  disclosure and opens/closes normally. Viewport override reset and existing
  delivery tab retained. Saved/inspected synthetic-only
  `cl004-header-label-removed.png` outside Git.
- All five required root gates pass: `corepack pnpm format:check`,
  `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`,
  `corepack pnpm build`; **227 tests pass**. `git diff --check` passes, staged
  diff is empty, unrelated changes preserved. No new dependency, schema,
  state, timer, listener, request, media exposure or external action.
- Separate residual finding: at 320x568 delivery, the social heading overlaps
  the disabled Download action (heading y=444.39..468.39; download
  y=443.39..487.39). Reproduced after the viewport settled. This badge-only
  revision does not modify result layout; the finding is recorded for the same
  authorized validation chat. It supersedes the prior blanket small-screen
  delivery no-overlap claim, not the verified header result.
- Independent revalidation and owner approval remain pending, along with
  native AT/zoom/forced colors and all previous
  real-media/rights/privacy/credentials/paid/spend/cloud/release gates. Nothing
  staged or committed.

### Latest floating-player-controls revision

Owner approves implementing the previously discussed player behavior: replace
the always-visible white strip with floating playback controls inside the full
portrait. Reuse `PortraitPlayer` for Moments, final review and delivery. Show
controls while paused/busy, on pointer entry/movement or tap, and throughout
keyboard focus or seek interaction; fade after 2.2 seconds of playback
inactivity and on mouse exit. A named full-frame reveal button supports
tap/keyboard reveal without toggling playback accidentally. Keep faded controls
keyboard reachable, preserve 44px targets and source-range authority, and
cancel the owned idle timer on state changes/unmount. Keep the back action on
the same visibility lifecycle. Use shared motion/color tokens, no motion gate,
new provider or workflow state. Verify idle/reveal/focus/pause/seek/switch/close,
all three player surfaces and seven-size bounds/caption separation, then run
the five root gates and ask the same authorized side chat to revalidate.

#### Floating-player-controls evidence

- Updated shared feature `portrait-player.tsx`, `sample.module.css`, shared
  `tokens.css`, `review-revision.test.tsx`, frontend README and this packet.
  The white playback strip is replaced by a translucent dark inset overlay
  inside the full 9:16 portrait. Back/play/pause/time/seek fade using existing
  motion tokens. Full-frame reveal is a named command, not a misleading
  expand/collapse toggle. No repeated UI explanation or extra workflow step.
- Owned idle timeout runs only during playback without keyboard/seek focus or
  a busy state. Pointer activity resets it without a second playback clock;
  mouse exit fades immediately, touch exit does not prematurely dismiss it.
  Paused/ended/busy states stay visible. Keyboard focus is distinguished from
  programmatic focus after pointer selection, and faded actions remain
  keyboard reachable. Effect/state-change/unmount cleanup cancels the timeout;
  switching uses the existing keyed player lifetime and source-range clock.
- Browser verified pointer play -> idle fade, frame-click reveal, mouse-exit
  fade, keyboard play past the idle deadline with visible controls, focus/seek,
  pause/ended visibility, clip switching and return to gallery with no player
  remaining. Review reaches **opacity 0** while still playing; delivery idle
  fade also works, followed by frame-click reveal and pause. Source seeking
  and existing final
  export confirmation/result still work; download/social actions stay disabled.
- Moments, final review and delivery checked at **320x568, 390x844, 768x1024,
  1024x768, 1440x900, 1280x650 and 619x618** (**21 states**). Each preserves
  9:16, zero horizontal overflow, fitting time text, 44px player buttons and
  overlay bounds fully inside the portrait. Final-review/delivery captions and
  contextual quotes remain separate from controls. Viewport override reset;
  paused delivery preview retained. No browser warnings/errors captured.
- Saved/inspected synthetic-only captures outside Git:
  `cl004-floating-controls-moments.png`,
  `cl004-floating-controls-review-phone.png`,
  `cl004-floating-controls-review-hidden.png` and
  `cl004-floating-controls-delivery.png`. CSS fading was observed at an
  intermediate opacity and at zero; no instant hide or video-size change.
- Added two semantic regressions for named reveal/control linkage,
  source-bounded seek, keyboard reachability, paused initial visibility and
  consistent busy disabling. Focused revision run passes **19 tests**. Five
  required root gates pass: `corepack pnpm format:check`, `corepack pnpm lint`,
  `corepack pnpm typecheck`, `corepack pnpm test:unit`, `corepack pnpm build`.
  **227 tests pass** (root 11, contracts 38, backend 62, frontend 116).
- Inspected cleanup, control layering, source-range authority and dependency
  boundaries. No new schema/dependency/provider/job/request/listener/object
  URL, secret or real-media exposure. App motion gates remain removed, native
  scrollbar correction unchanged and unrelated work preserved. Independent
  revalidation/owner visual approval, native AT/zoom/forced-color checks
  and all previous external gates
  remain pending. `git diff --check` passes and the staged diff is empty.
  Revalidation request delivered to the same authorized side chat; verdict
  remains pending. No provider/paid/cloud or Git mutation.

### Latest scrollbar and thumbnail-control revision

Owner screenshot follow-up: the blue-gray color applied, but Chromium's native
`scrollbar-width: thin` took precedence over the custom WebKit rules. The prior
computed 6px pseudo-element value did not prove actual custom rendering. Fix
this by explicitly selecting the WebKit styling path when supported, resetting
standard width/color to auto in that path, using a 4px rounded thumb and hiding
only increment/decrement buttons. Keep standard thin styling as the fallback
for other engines and native scrollbars in forced colors. Verify actual gutter
geometry and rendered screenshots as well as computed styles. This correction
supersedes the 6px treatment below; no motion gate or workflow change.

Correction evidence: shared `tokens.css` and frontend README now describe the
engine-specific styling path and native forced-color fallback. Actual gutters
measured **4px** (`offsetWidth - clientWidth - borders`) across all seven
recorded preview sizes, in the rail, transcript, notes and dark privacy dialog;
increment/decrement buttons compute to none and are absent in the inspected
`cl004-scrollbar-rendering-fix.png` capture outside Git. Keyboard PageDown
advances the transcript. Zero horizontal overflow and no browser warnings/
errors captured; viewport override reset and paused preview retained. All five
root gates pass again with **225 tests**. Prior computed-style checks were
insufficient to prove custom rendering and are explicitly superseded here.
Native forced colors/AT and owner approval
remain unchecked; external gates, motion and workflow behavior are unchanged.

The owner requests thin, repo-consistent scrollbars throughout the webapp and
much smaller play circles on the candidate thumbnails. Apply one global,
token-backed scrollbar treatment to every route and nested scroll pane, with
transparent tracks, neutral thumbs, a WebKit fallback and native forced-color
semantics. The dark privacy dialog overrides only shared thumb tokens. Remove
duplicated pane/dialog scrollbar rules. Reduce decorative thumbnail circles
from 44px to 28px and their icons from 20px to 14px; the whole candidate remains
the accessible click target. Re-center them on phones. Keep inline player
controls, animations, behavior and all external gates unchanged. Verify the
gallery, rail, notes/transcript, small-screen content and privacy dialog in the
browser, run the five root gates and ask the same side chat to revalidate.

#### Scrollbar and thumbnail-control evidence

- Updated shared `tokens.css`, landing `page.module.css`,
  `candidate.review.tsx`, `sample.module.css`, frontend README and this packet.
  One global scrollbar rule now owns standard thin width/color and the 6px
  WebKit fallback. Neutral blue-gray thumbs use transparent tracks; the dark
  privacy dialog changes only thumb color tokens. Removed its 10.4px fallback
  and duplicate pane rules. Forced colors keep native scrollbar-color semantics.
- Gallery and selected preview checked at **320x568, 390x844, 768x1024,
  1024x768, 1440x900, 1280x650 and 619x618**. All thumbnail circles compute to
  **28x28px**, with **14px** glyphs; hover retains its existing small emphasis.
  Phone circles stay centered. Full-card choice targets remain well above
  44px, actual player buttons remain 44px and selection/pause still work.
  No horizontal overflow at any tested size.
- Computed thin width, transparent track and 6px fallback verified on the
  landing document, gallery, nested small-screen content, clip rail,
  transcript, candidate notes, final review/edit notes and dark privacy dialog.
  Notes keyboard PageDown reached its final scroll position. No browser
  warnings/errors captured. Existing viewport override reset, paused Moments
  preview retained and temporary landing test tab closed.
- Saved/inspected synthetic-only `cl004-small-play-thin-scrollbars.png` and
  `cl004-thin-scrollbars-dialog.png` in the existing Codex visualization
  workspace outside Git. All five root gates pass: `corepack pnpm format:check`,
  `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`,
  `corepack pnpm build`; **225 tests pass**. No new dependency, schema, state,
  timer, listener, request, provider/paid/cloud action or behavior change.
- Owner visual approval, independent revalidation, native AT/zoom/forced-color
  checks and all previous real-media/rights/privacy/credentials/spend/cloud/
  release gates remain pending. App motion gates were not restored. Unrelated
  work remains intact; `git diff --check` passes and staged diff is empty.
  Revalidation request delivered to the same authorized side chat; its verdict
  remains pending. Nothing staged or committed.

### Latest video-first review, motion and delivery revision

The owner requests this revision now, before later visual polish. It supersedes
the previous transcript-heavy preview/review/result layout and the app-level
motion suppression recorded below. Keep the shared Step N of 3 heading.

Execution plan:

1. Remove application reduced-motion gates/zero-duration token overrides
   permanently at the owner's explicit direction; never mutate OS/browser
   accessibility settings. Use native shared-element View Transitions with
   synchronous React commits and the existing cancelable FLIP fallback. Cover
   gallery -> preview, preview -> gallery and rapid candidate switching;
   cancel active animations on unmount and avoid stale transition callbacks.
   Add an explicit reducer-owned preview-close event, not a second stage model.
2. Build a reusable feature-local portrait player with inline play/pause,
   seek/time and back-to-gallery controls. Remove selected labels, title and
   source-time prose surrounding the central frame. Keep an accessible name,
   immutable source range, 44px actions and an honest resolution placeholder
   until gated real footage is available. Prioritize portrait height and clip
   rail over a narrower bounded detail pane. Stack the same panes on phones.
3. Add accessible Transcript / Agentic Notes tabs to the candidate detail pane.
   Notes reuse validated rationale, exact evidence word IDs/times and caveats;
   timestamp buttons seek/pause/highlight the matching player. No fresh AI call,
   chat surface, live-trend assertion or predicted views. Initial gallery still
   mounts neither detail pane nor Proceed. Switching/closing resets playback.
4. Final review uses grounded edit notes left, dominant portrait center and
   read-only transcript right. Explain manifest-bound range, fixed captions,
   speaker framing, audio treatment and every visual cue with clickable clip
   times. State that there are no internal speech cuts in the current contiguous
   contract; do not invent edits. Move metadata into notes, not above/below video.
5. Reuse fake stage percentages and animated shared fill. Add elapsed time from
   operation timestamps with owned timer cleanup, not an ETA. A real-mode
   presentation may ease an explicitly indeterminate activity fill toward an
   asymptote; never publish its cosmetic fraction as measured completeness.
   Hold proven success briefly for the fill to finish before the existing
   reducer success event, with cancellation/clear/unmount abort cleanup.
   Real adapters stay unavailable until their owning gates pass.
6. Replace empty result with selected portrait/download left, separator and
   "OR Share on social media" right. Facebook, Instagram, TikTok and X are
   disabled buttons with Soon tags, a display-only owner-requested exception
   to the roadmap-navigation prohibition, not a promise or publishing feature.
   Download remains disabled without actual validated output. Restore result
   preview via immutable analysis/assembly references; reject mismatched bundles.
   Remove repeated demo/result prose; retain one concise global local-mode
   disclosure and necessary placeholder/disabled-action semantics.
7. Update owning README/parent decisions and focused tests for close/select,
   timestamps/notes/manifest/restore, controls, progress semantics/completion
   cancellation and disabled social actions. Browser-check full flow, rapid
   switches/return, live animation evidence, keyboard/seek/restore/clear and the
   seven-size gallery/preview/review/result matrix. Inspect cleanup/boundaries,
   run five root gates, record only actual evidence and ask the same side chat
   to revalidate. Preserve CL-004A/provider documentation and CL-013 film work.

These UI decisions authorize no credentials, providers, spend, media rights,
cloud, real download/publishing, Git action or public release. Native AT/zoom,
motion accessibility/owner approval and external gates remain explicitly open.

#### Video-first revision evidence

- Delivered `portrait-player.tsx`, `agentic-notes.tsx`,
  `review-transcript.tsx`, `processing-status.tsx` and `result-preview.tsx` in
  the owning frontend feature. Updated candidate/clip review, layout motion,
  development progress, screen composition, session close event, shared
  Progress/WorkflowFrame and design tokens/styles. Deleted the unused
  `source.preview.tsx` and obsolete styles. Frontend README and parent section
  0.6 record the latest owner decisions. The only backend change in this
  revision is synthetic contextual-quote rationale copy; no contract change.
- Native shared-element View Transitions cover entrance, return to gallery
  and candidate switching; cancelable FLIP remains the fallback. Removed every
  application reduced-motion gate/zero-duration override at the owner's
  explicit direction. Duration parsing accepts normalized seconds and
  milliseconds. Rapid choices use the latest intent and cannot commit stale
  callbacks. No OS/browser accessibility preference was changed. The preview
  starts without detail/Proceed; return clears selection and restores choice
  focus. The Notes tab survives candidate switching; keyboard Home selects
  and focuses Transcript.
- Grounded notes reuse candidate evidence and immutable assembly decisions,
  including contiguous source cut, captions, framing, audio and each visual
  cue. No invented internal speech cuts, live trends, predicted traction or
  new provider call. Candidate 2 payoff seeks to **114836 ms**, pauses and
  highlights six exact evidence words. Its final visual note seeks to
  **113781 ms**, displays the quote and highlights all eight cue words
  `w_000206` through `w_000213`. Transcript auto-scroll stays inside its pane.
- Build visibly advanced **41 -> 58 -> 75 -> 83 -> 100%**, with elapsed time
  advancing from **00:00 to 00:04**. Export advanced **58 -> 75 -> 83 -> 100%**.
  Observed fill transforms interpolate between stage values, including final
  completion. Proven success waits an abortable 500 ms before the existing
  next-screen event. Real-mode activity is bounded/slowing and semantically
  indeterminate, with elapsed time but no fabricated percentage/ETA; its live
  adapters remain unavailable and were not exercised.
- Result preview restores only matching analysis/assembly revisions,
  manifest ID/hash, candidate and immutable range. Refresh restored the same
  portrait successfully. Download remains disabled without validated output;
  Facebook, Instagram, TikTok and X are disabled native buttons with Soon tags,
  no links, handlers, OAuth or publishing. Repeated demo/footer/result prose
  was removed; one compact Local preview badge and honest placeholder remain.
- Browser checked gallery, selected preview, final review and delivery at
  **320x568, 390x844, 768x1024, 1024x768, 1440x900, 1280x650 and 619x618**
  (28 states). All have zero horizontal/player overflow, exact 9:16 portrait
  bounds and fitting text/actions. Inline play/pause actions are 44px; captions
  and contextual quote remain separate from controls. Bounded notes/transcript
  panes and clip rail scroll independently; portrait/footer do not collide.
  Gallery has no empty footer; action footers remain visible. Rapid 3 -> 1 -> 2
  switching resolves to moment 2 without stale content. Fresh backend flow
  confirms updated quote rationale and complete cue highlights.
- Saved/inspected synthetic-only captures outside Git in the existing Codex
  visualization workspace: `cl004-moment-enter-motion.png`,
  `cl004-moment-exit-motion.png`, `cl004-moment-switch-motion.png`,
  `cl004-video-first-moments-desktop.png`,
  `cl004-video-first-moments-phone.png`,
  `cl004-video-first-review-desktop.png`,
  `cl004-video-first-review-phone.png`, `cl004-build-progress-complete.png`,
  `cl004-export-progress-complete.png`, `cl004-delivery-desktop.png` and
  `cl004-delivery-phone.png`. Mid-transition captures prove visible movement;
  animation-registry introspection is not claimed. No browser warnings/errors
  captured. Screenshots contain no real media or user content.
- Five required root gates pass: `corepack pnpm format:check`,
  `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`,
  `corepack pnpm build`. **225 tests pass** (root 11, contracts 38, backend 62,
  frontend 114). Focused revision/progress/full-flow run passes **41 tests**.
  Added close/select, notes/timestamps/full cue range, duration units,
  disabled delivery actions, nine restore-mismatch cases, indeterminate real
  activity semantics and cancellation during completion settling regressions.
  Existing fake job/provider call counts remain unchanged.
- Inspected dependency direction, duplicate state/schema authority, stale
  source-player imports, unused styles, debug/unsafe code and cleanup. Range
  playback/progress clocks, aborted fetches, completion timers and native/FLIP
  animation lifetimes remain owned and canceled; no new object URL, listener,
  provider job or render action. Unrelated CL-004A/provider/CL-013 changes are
  preserved. `git diff --check` passes and the staged diff is empty. Nothing
  staged or committed; no paid/cloud action or real upload.
- Local preview remains at `http://localhost:3000/start`; frontend PID **2680**
  was reused. Refreshed the sole loopback backend listener to PID **19476** so
  compiled fixture copy is current. Ignored content-safe logs remain
  `cl004-frontend.out.log` / `cl004-frontend.err.log` and
  `cl004-backend.out.log` / `cl004-backend.err.log` in the repository root.
  Viewport override reset; the paused final review remains open for the owner.
- Revalidation request delivered to the same authorized side chat after the
  final gate run. Its verdict is not inferred or marked passed.
- Independent side-chat revalidation and owner visual/motion approval remain
  pending, as do native AT/200% zoom/forced-colors and prior credential,
  real-media, media-rights, privacy/retention, paid/spend, cloud and release
  gates. The removal of motion suppression is an explicit owner exception,
  not a claim of accessibility acceptance. This remains the current baseline
  for later visual feedback; no external gate or full ticket approval inferred.

### Latest heading revision

The owner replaces the separate Video / Moments / Build tracker with one
stage heading: `Step 2 of 3: Pick one moment`, using the same format throughout
the workflow. Reuse the shared WorkflowFrame and its existing step/title props;
remove the unused tracker component/styles and its heading gap. Keep the single
focusable h1, subtitles, responsive content/footer bounds and reducer behavior.
Update the primitive regression for all three steps and the frontend README;
verify headings and responsive bounds in the browser, run the five required
root gates, and ask the same authorized side chat to revalidate. This does not
change the landing narrative or any real-media/provider/approval gate.

#### Heading revision evidence

- Changed shared `workflow-frame.tsx`, `workflow.module.css` and
  `workflow.test.tsx`, plus the frontend README and this packet. One focusable
  h1 now combines the existing step number and stage title; the separate
  StepIndicator, its icon import, desktop/mobile/forced-colors rules and extra
  heading margin were removed. Stage props, reducer, actions and landing
  narrative remain unchanged. No new dependency, timer, listener or boundary.
- The focused shared-primitive run passed **5 tests**, including all three
  step numbers and absence of the old tracker. All five required root gates
  passed after code edits: `corepack pnpm format:check`, `corepack pnpm lint`,
  `corepack pnpm typecheck`, `corepack pnpm test:unit`, `corepack pnpm build`.
  **207 tests pass** (root 11, contracts 38, backend 62, frontend 96).
- Browser verified Step 1 intake/upload/inspection, Step 2 gallery/focused
  preview, and Step 3 build/review/export confirmation. Stage focus still
  reaches the combined h1; clearing the synthetic session returns to the
  Step 1 heading. Selection/Proceed and existing simulated progress still work.
- Moments checked at **320x568, 390x844, 768x1024, 1024x768, 1440x900,
  1280x650 and 619x618**: one h1, zero trackers, zero horizontal overflow,
  fitting heading, separate header/content/footer and visible footer at every
  size. Intake and export confirmation also fit at 320x568. At 320px the
  Moments title wraps naturally; no font scaling or truncated wording.
- Saved and inspected synthetic-only captures `cl004-heading-moments-desktop.png`
  and `cl004-heading-moments-phone.png` in the existing Codex visualization
  workspace outside Git. No browser warnings/errors captured. Viewport override
  reset; preview left at intake. No real media/credentials/provider/paid/cloud
  or Git mutation. Existing unrelated changes remain intact.
- `git diff --check` passes and the staged diff is empty. The revalidation
  request was delivered to the same authorized side chat; its verdict is not
  inferred. Concurrent CL-004A/provider-readiness documentation was preserved.
- Owner visual approval, independent revalidation, native AT/200% zoom/forced
  colors and previously recorded real-media/rights/privacy/spend/cloud/release
  gates remain pending; this label revision does not claim them passed.

### Latest processing-progress revision

The owner requests a visible percentage and advancing bar during fake analysis
as well as upload, to preview the intended processing presentation. Apply this
to the fake inspection/analysis/assembly/render screens using the existing
canonical operation-stage order. These are explicitly simulated stage
fractions, not provider completeness, elapsed-time predictions, or ETAs.

Plan: derive a bounded fraction from the reported stage (100% only for proven
success), reuse the shared Progress primitive with an animated, accessible
fill, and retain stage labels, cancel/retry, reduced-motion and forced-colors
behavior. Unknown progress stays indeterminate; stalled/error states must not
advance via a cosmetic timer. Keep reducer events, operation polling, backend
fixtures, job/provider counts and the real-mode no-fallback gate unchanged.
Add focused fraction/semantic regressions, browser-check advancing analysis
and build/export progress plus cancellation and responsive bounds, then run
the five required root gates and ask the same side chat to revalidate.

This narrowly supersedes the old no-fake-percentage restriction for the
explicitly labelled local development preview only. Real processing still
requires measurable progress before displaying a percentage.

#### Processing-progress revision evidence

- Updated `development.progress.ts` and `sample.experience.tsx` to derive fake
  operation fractions from the existing contracts stage order. No duplicate
  schema/stage list, elapsed-time estimator, backend change, reducer event or
  new polling/timer was added. Unknown/stopped progress stays unclaimed;
  repeated stage evidence holds its fraction, and only success yields 100%.
- Shared `progress.tsx` / `workflow.module.css` now use an accessible progressbar
  with a transform-driven fill instead of browser-specific native-progress
  animation. Visible and accessible percentages agree; tabular digits reserve
  a stable slot. Stage status remains separate from percentage announcements.
  Indeterminate, paused, reduced-motion and forced-colors behavior remains.
  Frontend README and parent development-preview clarification record the
  fake-only exception, without changing live-provider claims or readiness.
- Five new tests in `development.progress.test.tsx` cover analysis/assembly/
  render progression, single-stage inspection, stalled stages, no cosmetic
  timer, incomplete success and unknown/stopped states. Updated primitive
  tests check bounded visible/accessible values and matching fill transforms.
  The focused two-file run passed 12 tests.
- All five required root gates passed after code edits:
  `corepack pnpm format:check`, `corepack pnpm lint`,
  `corepack pnpm typecheck`, `corepack pnpm test:unit`, `corepack pnpm build`.
  **205 tests pass** (root 11, contracts 38, backend 62, frontend 94).
  Existing complete-flow fake job/provider-count tests still pass unchanged.
- Browser analysis advanced **33 -> 44 -> 66%**. Build advanced
  **41 -> 58 -> 75 -> 83%**, with a 480 px track's actual fill growing
  **200 -> 280 -> 360 -> 400 px**. Export advanced **16 -> 58 -> 75 -> 83%**
  and reached the existing honest result with Download MP4 disabled.
  These percentages represent simulated stage position, not real work/ETA.
- Processing/cancel checked at **320x568, 390x844, 768x1024, 1024x768,
  1440x900, 1280x650 and 619x618**. Every run preserved separate label/percent
  bounds, contained the bar/footer, and reported zero horizontal overflow.
  Cancel returned each active analysis to intake with no stale completion.
  No browser warning or error was captured. The review browser requests
  reduced motion: functional fill updates were verified, while smooth
  normal-motion interpolation and native forced-colors/AT remain unchecked.
- Saved and inspected synthetic-only captures outside Git:
  `cl004-analysis-percentage-desktop.png`, `cl004-analysis-percentage-phone.png`
  and `cl004-build-percentage-desktop.png` in the existing Codex visualization
  workspace. No real file/media, credentials, provider/spend/cloud, valid
  output/download or Git mutation was introduced. Previous CL-002 figure and
  owner-authored CL-013 planning changes remain untouched.
- Owner visual approval, independent revalidation and the previously recorded
  real-media, rights, privacy/retention/spend/cloud, release and native manual
  gates remain pending. No broader ticket completion is inferred.

### Latest Moments revision: gallery to focused preview

The owner replaces the transcript-first candidate screen with a vertical-video
gallery. This supersedes previous tab/always-visible transcript layouts, not
the canonical selection/range or media/privacy/rights gates.

1. Initially show every returned candidate (one to four, normally three) as a
   9:16 playable choice with title, duration and exact source start/end. Mount
   neither transcript nor Proceed until the visitor deliberately plays a choice.
2. Playing selects exactly one through `CANDIDATE_SELECTED`. Transition its
   portrait into the center, keep other portraits stacked in a bounded,
   scrollable left rail, and reveal the matching read-only transcript/evidence
   on the right. Proceed dispatches the existing build action once; no editor,
   range changes, extra render, provider request or second workflow authority.
3. Fake mode uses an explicitly labeled resolution placeholder and simulated
   bounded playback, never transcript animation presented as video. Exact word
   start/end bounds drive seek/end behavior. Real source-capability playback
   belongs to the existing gated media adapter, without pre-rendered variants
   or arbitrary URLs. Real mode remains unavailable until those gates pass.
4. Reuse design tokens and buttons. Animate measured portrait relocation with
   cancelable FLIP transforms plus panel entrances, and skip motion when the
   OS requests reduction. Switching choices resets playback/highlights; restored
   selection opens paused. Own every timer/animation/listener through cleanup.
5. Desktop/laptop use rail/portrait/transcript columns. Tablet preserves the
   rail and portrait with transcript below; phone uses compact alternatives
   and a centered portrait with transcript below. Bound the workspace and pane
   scrolling rather than elongating the card; preserve all choices and CTA.
6. Verify initial transcript/CTA absence, one-to-four/restored choices, exact
   range playback and end/pause/seek, keyboard selection, evidence seeking,
   switching/restore/clear, responsive gallery/preview and animation cleanup.
   Run the required five root gates and ask the same side chat to revalidate.

The local implementation and checks below are complete; owner visual approval
and real-media gates remain pending. Earlier 195-test/full-flow evidence remains
valid history, not proof of this new layout.

#### Moments revision evidence

- Changed `candidate.review.tsx`, `sample.module.css`, `sample.experience.tsx`
  and `sample.test.tsx`; added `use-moment-layout.ts` and
  `use-range-playback.ts`. `SourcePreview` reuses the same owned range clock,
  removing duplicated timer logic. Shared WorkflowFrame adds bounded-content
  composition for this screen. Frontend README, parent section 6.5 and index
  record the new gallery/preview behavior. No new dependency, contract schema,
  reducer stage, provider/media route or configuration variable was introduced.
- Initial gallery has all three 58-second 9:16 resolution placeholders and
  exact source times, with no transcript/evidence/player timer or Proceed.
  Playing selects one canonical candidate; the matching portrait, transcript
  and Proceed appear. Other choices stack in a scrollable rail. No fake
  footage or transcript painted inside these video placeholders.
- The five required root gates passed after final code edits:
  `corepack pnpm format:check`, `corepack pnpm lint`,
  `corepack pnpm typecheck`, `corepack pnpm test:unit`, `corepack pnpm build`.
  **200 tests pass** (root 11, contracts 38, backend 62, frontend 89). Five new
  tests plus updated selected-layout assertions cover initial one-to-four
  choices without transcript/player, restored paused selection with exact
  source bounds, no candidate padding, busy controls and no editing surface.
  A zero-result test initially used an invalid empty-transcript fixture; it was
  corrected to the existing validated `noCandidateAnalysis` before final gates.
- Browser: pointer Play selects and focuses the chosen player; keyboard
  End switches to moment 3 and focuses its player. Pause holds position,
  replay resets at the end, and playing stops at the immutable end. Moment 2
  slider is exactly **60000..118000 ms**. Clear-payoff evidence seeks to
  **114836 ms**, pauses, and highlights exactly **w_000208..w_000213** (six
  words). Switching replaces transcript/highlights and starts the new range.
  Refresh restores the selected preview paused at its start. Proceed builds
  that same moment through the existing automatic flow; downstream review
  play/pause and clear work with the shared clock. No extra provider work.
- Gallery and focused preview checked at **320x568, 390x844, 768x1024,
  1024x768, 1440x900, 1280x650 and 619x618**. Document width equals viewport
  width; every placeholder has no internal overflow; action footer stays
  inside the viewport; active playback button is **44x44**. Gallery has zero
  transcripts/Proceed at every size. Phone and short-tablet preview use bounded
  internal scrolling instead of extending the card. A cramped short-tablet
  portrait was found and fixed before the final seven-size check.
- FLIP uses shared duration/easing tokens and measured portrait rectangles;
  controls/text keep their own scale. Animations are canceled on selection
  changes, unmount and preference changes; the media-query listener is removed.
  The shared clock clears its interval on pause/stage change/unmount. The
  current browser reports zero-duration/disabled panel motion, so full-motion
  visual verification remains unchecked. No OS preference was changed. The
  owner was asked whether to honor reduced motion or override it only in the
  local preview; until answered, the default continues to honor it.
- Saved and inspected synthetic-only screenshots outside Git:
  `cl004-moments-gallery-desktop.jpg`, `cl004-moments-preview-desktop.jpg`,
  `cl004-moments-preview-phone.jpg`, under the same visualization directory
  recorded below. No captured browser warnings/errors. Temporary viewport
  overrides were reset; the browser is left on paused moment 2 preview.
- `git diff --check` passes; the staged diff is empty. Old tab/navigation CSS
  was removed; dependency/cast/debug/TODO/content checks found no new issues.
  Prior unrelated/owner-authored changes were preserved. No Git, credential,
  paid/provider/cloud action, real file read/upload, or valid video output.

Real source-capability/range playback, approved footage/rights, full-motion
visual approval, native AT, 200% zoom, forced colors, privacy/retention/spend/
cloud and release remain unchecked. The completion/revalidation request was
successfully delivered to the same authorized side chat; its independent
verdict remains pending and is not inferred.

### Latest clarification: full development preview

The owner explicitly expands CL-004 beyond the previously verified queued
handoff. Fake mode is development-only and previews the complete intended
product, not a separate public sample feature. This section supersedes the
sample-only scope/progress restrictions and earlier completion evidence below.
Real adapters remain owned by their later gated tickets.

Execution plan:

1. Record this scope and adapter/UI responsibility split in parent/index and
   CL-005/007/009/010/011 before implementation.
2. Add authoritative `FAKE_MODE` (default true), derive provider composition,
   reject conflicting legacy mode assertions, retain all paid/live safeguards.
   Load ignored root local configuration only at explicit non-test startup.
   Existing local files must never be inspected/overwritten; create a blank
   safe local copy only when absent. No public secret/environment exposure.
3. Extend the existing bounded local fixture adapter with upload/analysis/build/
   render operation scripts and validated immutable assembly evidence. Reuse
   existing fake clock/operation store; starts are idempotent, exact counts are
   testable and result IDs remain scoped to the temporary fixture session.
4. Drive the existing frontend reducer through FILE_SELECTED, upload progress,
   media acceptance, analysis, one choice, build, review, render confirmation,
   render and result. No second stage machine. Fake file intake reads only type/
   size, discards the file, uses synthetic duration and never uploads bytes or
   stores/displays names. A prepared-input action enables deterministic checks.
5. Reuse frame/footer/buttons/progress and read-only transcript preview. Clearly
   label the local development preview and simulated transfer/processing. No
   fake recorded footage, signed capability, downloadable pretend MP4, editing
   controls or invented successful real work. Real mode shows unavailable state
   and never invokes the fake adapter.
6. Own polling/abort/timers and restore hydration for analysis/assembly. Test
   complete reducer progression, exact fake job/provider counts, forged/stale
   requests, duplicate starts, clear/unmount/expiry and mode/config boundaries.
7. Browser-check complete journey, cancel/clear/restore and representative phone/
   tablet/desktop/short-height states. Run all five required gates, record actual
   evidence, notify the authorized communicating side chat to revalidate.

Acceptance additions (not inferred from the prior 186-test run):

- [x] Complete development-only frontend journey reaches export state.
- [x] Single authoritative mode; real-mode unavailable/no-fallback tested.
- [x] Ignored local config prepared with blank secrets or existing file untouched.
- [x] Synthetic upload/progress/output cannot masquerade as real processing/media.
- [x] Read-only review, manifest-bound one-render confirmation and exact counts.
- [x] Restore/cancel/cleanup/error paths and final gates have new evidence.

The prior local evidence below remains historical proof of the smaller slice,
not completion of this expanded scope. Licensed recorded footage, actual local
media inspection/upload, provider analysis, speaker/visual/caption generation,
preview/export parity, valid output download, privacy/retention/spend/cloud and
public release remain unchecked in their owning tickets.

### Expanded execution evidence

This is the current implementation record; the 186-test slice and its process
IDs below are historical. The latest clarification was documented before its
implementation. Further visual feedback and substantial polish remain later
work; this baseline is not final visual approval.

Changed ownership areas:

- Existing shared tokens/frame/buttons/progress now support the complete flow.
  `src/features/sample/` adds metadata-only intake validation, abortable stage
  effects, read-only vertical transcript composition, render confirmation and
  result. The existing session reducer remains the sole stage authority; one
  validated review-hydration event restores analysis/assembly references.
- Backend local fixtures add bounded upload/inspection/analysis/assembly/render
  scripts and immutable synthetic assembly evidence, using the existing fake
  operation store. Named HTTP routes and contracts validate requests; the
  same-origin allowlist proxy still accepts JSON only, never media bytes.
- `.env.example`, backend config/composition/startup, deterministic test setup,
  package READMEs, parent/index and later adapter packets document one mode.
  `FAKE_MODE=true` derives fake composition; false selects real/unavailable.
  A legacy `PROVIDER_MODE` value may only assert the matching derived mode.
  It cannot override the boolean or bypass paid/live/readiness checks.
- The ignored root `.env.local` did not exist (existence check only), so a safe
  copy of the public example was created with `FAKE_MODE=true` and every
  credential/user-owned identifier blank. No existing secret file was read or
  overwritten, and the created local file was not read back or staged. Only
  explicit local executable startup loads it; imports/tests do not.

All five root gates passed after expanded code edits settled:

```text
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
```

**195 tests pass:** root 11, contracts 38, backend 62, frontend 84. Nine added
tests exercise all three end-to-end selections, metadata-only file access,
canonical progression through result, review restoration/foreign bundle
rejection, abortable timer cleanup, safe availability, and no real-mode fake
fallback or legacy override. Existing boundary/network guards remain active.
Each complete fake path asserts provider **0** and inspection/analysis/assembly/
render **1 each**, including idempotent replays. The export state has no
download capability/file/endpoint: Download MP4 is disabled with an explicit
no-generated-video notice. Synthetic `outputAvailable` evidence only drives
this development result state and does not prove a valid MP4.

Browser evidence on local fake mode:

- Prepared input runs intake -> simulated upload -> analysis -> exactly one
  choice -> build -> read-only review -> confirmation -> simulated render ->
  export state. Initial Build is disabled. Each of three fixture candidates
  lasts 58 seconds; no nonlinear internal cuts were added.
- File chooser rejects a text stub; a synthetic MP4-named text stub reaches
  the metadata-only path. This proves neither video decoding nor duration
  inspection. Names never appear in the UI and bytes are not uploaded/read by
  application code. Disposable stubs were removed after checking.
- Cancel during upload, assembly and render returns to intake. Refresh during
  assembly resumes progress and reaches review; refresh at review preserves
  the selected moment and playback position. Start over/clear returns to intake.
  Unit tests cover owned abort/timer cleanup and stale/foreign evidence;
  two-hour browser expiry timing is not claimed.
- Temporarily selecting real mode with every paid/live gate disabled shows
  unavailable processing, a disabled picker, no prepared-input action and no
  fallback. Safe fake composition was restored afterward.
- Expanded review checked at 320x568, 390x844, 768x1024, 1024x768, 1440x900,
  1280x650 and 619x618: document width equals viewport width, footer remains
  inside the viewport, the 9:16 text canvas has no internal overflow, and the
  playback icon is 44x44. Short screens use the workspace's vertical scroll.
  Confirmation actions fit at 320px. No captured console warnings/errors.
- Screenshots outside Git: `cl004-development-intake.jpg`,
  `cl004-development-review-desktop.jpg`, and
  `cl004-development-review-phone.jpg`, under
  `C:/Users/minat/.codex/visualizations/2026/10/01/01a0f682-0209-7970-93df-8efe4b376d26/`.
  Temporary viewport overrides were reset; the browser is left at intake.

Current local preview: `http://localhost:3000/start`. Listener PIDs: frontend
**2680** (3000), backend **17164** (4000). Content-safe ignored logs:
`cl004-frontend.out.log`, `cl004-frontend.err.log`, `cl004-backend.out.log`,
`cl004-backend.err.log`. An ignored empty `cl004-process-input.log` supplies
background-process stdin. Old backend verification listeners were stopped;
only the requested preview servers remain.

The completion/revalidation request was successfully delivered to the same
authorized communicating side chat. Its independent verdict remains pending;
the thread-status tool cannot retrieve this ephemeral chat's turns, so no pass
is inferred. Final `git diff --check` passes; the staged diff is empty. The
dependency/debug/cast/content review found no new cross-app imports, Node-only
browser dependencies, unsafe casts, media URLs, provider logging or byte/name
access in the development implementation. Owner approval of this revised core UI,
actual 200% zoom, OS reduced-motion/forced-colors, native screen-reader checks,
licensed recorded footage, real uploads/inspection, provider work, preview/
export parity, real MP4/download, privacy/retention/spend/cloud/rights and public
release remain unchecked. No paid/provider/cloud/deploy or Git mutation was
performed. Concurrent owner-authored CL-013 landing-film planning was preserved
and not implemented as part of CL-004.

### Historical first revision plan

The owner rejected the in-progress multi-panel UI, repeated synthetic messaging
and equation-themed preview. This plan supersedes older layout/checklist text
below. CL-002 colors/type remain an interim foundation; earlier approval does
not approve the rejected core UI. This redesign happens now, not in CL-013.

### Reference evidence

The sibling ScreenPilot repository was inspected read-only:
`apps/frontend/src/features/entry/demo-experience.tsx`,
`src/shared/ui/app-shell.tsx`, `src/styles/tokens.css`, and the
`sp-demo-workspace` / `sp-demo-stage--with-footer` rules in `globals.css`.
Reuse the pattern: one reducer-backed changing workspace, stable heading/action
footer, `100dvh` sizing, shrinkable grid tracks, height-aware spacing and a scroll
fallback for dense review/short screens. Do not copy its palette/code/content.

### Target journey and ownership

1. **Video intake:** one drop/choose surface, MP4/WebM, recommended under
   10 minutes/250 MiB; hard maximum 20 minutes AND 500 MiB; source duration at
   least 15 seconds; owned/licensed media only. The live picker cannot be
   enabled while upload availability is false. Keep a secondary sample action.
   CL-005 owns real local inspection/upload.
2. **Upload:** shared progress with actual byte fraction, animated fill,
   cancel/error/retry and coarse screen-reader announcements. No simulated
   transfer or application-server buffering. CL-005 owns transport/cleanup.
3. **Analysis:** same workspace, one current message (reading video, extracting
   speech, finding complete moments, checking boundaries) and indeterminate
   progress bound to actual operation stage. CL-007 owns live analysis.
   CL-004 sample loading truthfully says it is opening prepared data.
4. **Choose exactly one:** compact semantic choice controls and one active
   preview, deliberate selection motion and no sound autoplay. Prefer three
   to four useful alternatives near 60 seconds, but support zero to four
   without padding. Evidence/transcript/caveats are expandable. Remove inspector
   columns and the range rail; no manual trim/editor. Selection is provider-free;
   only the explicit Build action dispatches one assembly handoff.
5. **Automatic build:** same progress primitive and factual current stage, such
   as following the speaker / adding visuals / adding captions. CL-009/CL-010 own
   real assembly/output. CL-004 stops honestly at queued handoff: no cycling
   fictional labels, timer-based percentages or fabricated result.
6. **Review/export:** reuse frame/footer in CL-010/CL-011. No caption, visual,
   range or styling controls; one confirmed render/download remain the contract.

### Design system first

- Extract existing cobalt/white/ink/neutral foundations into global semantic
  tokens for colors, type, spacing, 44px targets, radii at most 8px, focus,
  motion and safe-area gutters. Keep offline-safe system fonts, fixed/rem type
  sizes and zero letter spacing.
- Build only shared components used now: Button (primary/secondary/quiet/icon),
  WorkflowFrame (stable heading/content/footer), StepIndicator and Progress.
  Feature components own intake/evidence; do not build a generic UI framework.
- Use one icon family, names/tooltips, disabled/busy/error/selected states,
  visible focus, forced colors and reduced-motion alternatives.
- One large tool surface, no nested decorative cards. Neutral canvas, white
  workspace, cobalt actions, ink text, restrained green success/selection.

### Execution sequence

1. Record revision in source of truth, index and CL-002/CL-013 notes.
2. Establish/adopt shared tokens/primitives; preserve the landing identity and
   make its existing foundation values reference the shared source.
3. Replace intake/review/handoff using the existing provider/reducer/selectors
   and validated sample API, without a second workflow machine.
4. Remove the equation canvas/repeated disclosures. Use an honest transcript
   preview until rights-approved footage exists; no faux recorded video.
   Revise only the local sample fixture to an original general conversation
   with three distinct roughly minute-long ideas and exact word references.
   Keep immutable CL-003 test fixtures and live contracts intact.
5. Fix restore-range, safe errors, abort/focus/cleanup issues found in integration.
   Add focused primitives/API/selection/range/fixture regression tests.
6. Browser-check the available sample path/responsive matrix, then run required
   format/lint/typecheck/unit/build plus diff/status/boundary review.
7. Record actual evidence and remaining gates; notify the existing validation
   side chat under the owner's prior authorization. No staging/commit.

### Responsive contract

- Desktop/laptop/tablet: small header plus one nearly viewport-filling workspace,
  shrinkable content, stable footer, bounded reading width and preview sized by
  both width/height. Three/four choices fit or wrap without page overflow.
- Phone: compact choices/previous-next and active preview, safe-area footer.
  Short-height, zoom and expanded evidence use natural vertical scrolling;
  never clip controls or trap focus to force everything into one viewport.
- Check 320x568, 390x844, 768x1024, 1024x768, 1440x900, 1280x650 and intermediate
  resize; overflow/control bounds, keyboard/stage focus, privacy focus return,
  exact evidence seeking, restore/clear, 200% zoom, reduced motion/forced colors.

### Gates and deferred internal cuts

No external upload/provider/cloud/paid action is authorized by a layout request.
Default/test live flags stay false. The owner was asked whether to retain this
locally implementable slice or expand/reorder live work; until answered, keep
existing gated ticket ownership.

The request to remove useless internal conversation bits is a **deferred
contract revision** in source-of-truth section 0.6. Current candidates stay
contiguous word ranges. A future ticket must define immutable ordered segments,
output-duration accounting, caption/evidence mapping, audio transitions,
speaker/visual tracks, preview/export parity and tests. Never silently implement
nonlinear cuts in UI or pad a shorter strong idea to reach 60 seconds.

### Revised acceptance

- [x] One dynamic responsive workspace replaces the rejected multi-panel UI.
- [x] Shared tokens/primitives are implemented and used, not just documented.
- [x] Intake displays formats/limits/rights and honest upload availability.
- [x] Prepared sample reaches choices with no fictional processing progress.
- [x] Exactly one selection, restrained motion and accessible controls.
- [x] On-demand evidence resolves exact word IDs/times.
- [x] Build sends one explicit handoff and reports its actual queued state.
- [x] Zero providers through review/selection; bounded exact fake job counts.
- [x] Restore/clear/error/expiry boundaries and request/timer cleanup are tested
  or inspected locally; browser expiry timing is not claimed.
- [ ] Required local automated/manual checks have recorded evidence.
- [ ] Approved footage, real upload/analysis/assembly/export and final visual
  approval remain explicitly unchecked until their owning gates pass.

## Local execution evidence (2026-10-01)

### Delivered files/behavior

- `apps/frontend/src/styles/tokens.css` and `src/shared/ui/`: shared semantic
  foundations, Button/IconButton, WorkflowFrame/StepIndicator, measurable or
  indeterminate Progress, focused primitive tests. Root layout imports tokens;
  landing palette/motion aliases reuse them. Lucide React 1.49.0 is the single
  new pinned UI dependency; lockfile changes are limited to that package.
- `src/features/sample/`, `/start`, `/api/sample/[...path]`: reducer-backed
  one-card intake, three compact choices, timed transcript preview, expandable
  exact evidence, one explicit build handoff, restore/clear/expiry/safe errors.
  The proxy allows only named local routes, caps JSON at 8 KiB while streaming,
  forwards only the fixture cookie, owns a 5-second timeout/abort listener and
  removes it. It never accepts media bytes/arbitrary upstream targets.
- Backend `src/demo/conversationSample.ts`, `sampleSession.ts` and
  `src/http/routes/sample.route.ts`: three original precomputed 58-second
  conversations, bounded 16-session ephemeral local fixture control, 2-hour
  expiry, origin checks, and idempotent queued handoff. Registered only for
  `APP_ENV=local` plus fake provider mode. Production returns 404. Existing
  CL-003 fixture versions remain unchanged. Safe JSON-parser failures/statuses
  are mapped in `http/errorMapper.ts`.
- Contracts add only the inferred `AssemblyRequest` type, not another schema.
  Landing Get Started enters `/start`; privacy copy describes current behavior.
- Frontend/backend READMEs, this packet, index, parent decisions and queued
  UI-owning packets record the new direction and unchanged external gates.

### Automated verification

All five required root commands passed after code edits settled:

```text
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
```

Unit total: **186 passing** (root 11, contracts 38, backend 57, frontend 80).
Focused new slice: 24 passing tests across API/proxy/primitives/sample files.
Coverage includes schema-validated 1/2/3/4 choice rendering, correct restored
range start, exact word times, safe transport/JSON failures, pre-abort, rejected
IDs/origins/paths/oversized bodies, proxy timeout/listener/timer cleanup,
missing/expired/capacity sessions, production route exclusion, and exact
provider/analysis/assembly counts. No real provider/network/spend coverage is
claimed. Temporary first-check type/test failures were repaired before the
passing final gate. Formatting the pnpm-generated lockfile removed unrelated
serialization churn.

### Browser/manual evidence

- Local prepared sample click-to-choices: **336 ms**, measured on localhost,
  not a production-like connection or licensed-media performance proof.
- Initial Build disabled; one choice enables it. Pointer selection starts
  bounded transcript playback. Phone End-key selects/focuses moment 3; exactly
  one tab is active. Pause works. This is not actual recorded-video playback.
- Moment 2 payoff seeks to **114836 ms** and highlights exactly word IDs
  `w_000208` through `w_000213` (six words). Evidence remains collapsed until
  requested; activation requires no hover or provider call.
- Refresh restores moment 2 selected at **60000 ms**, with Build available and
  no new analysis. Explicit Build enters actual queued handoff; refresh restores
  queued state, not another job. Start over clears back to intake/focus.
- Privacy opens with close-button focus; Escape returns to its trigger.
  Full screen-reader/native-chrome focus-cycle behavior remains a manual check.
- The skip link focuses the main landmark; the final browser error/warning log
  is empty. These checks do not replace an assistive-technology run.
- Candidate layout measured at 320x568, 390x844, 768x1024, 1024x768, 1440x900,
  1280x650 and intermediate 900x650: no horizontal page overflow; footer/action
  rectangles stay inside the viewport. One visible phone choice, three at larger
  widths. Desktop/phone/short-height screenshots were inspected. After the
  short-height correction, 900x650 playback ends at y=449.8 and evidence summary
  at y=526.8, both above footer y=564. Expanded evidence scrolls within the frame.
- Reduced-motion/forced-color CSS exists, but this browser exposes only viewport
  overrides, not preference/zoom emulation. **Actual 200% zoom, reduced-motion,
  forced-colors and assistive-technology manual runs are unchecked.**

### Deviations / outstanding gates

- Approved sample media is absent. The local UI deliberately previews the
  original synthetic transcript, not invented video/audio. Real source preview,
  source media/poster rights, sound/mute controls and actual video animation need
  approved recorded media/capabilities; they are not marked complete.
- Upload picker/drop are visibly disabled, not fake functional upload. CL-005
  owns selection/inspection/transfer. Actual upload, live analysis, active-speaker
  inference, visuals/captions, review/render/download remain gated in their
  existing packets. No timed labels pretend those jobs ran.
- The local fixture cookie/ephemeral map are intentionally not the production
  authenticated-encrypted grant/storage/retention boundary. No live flag,
  credential, provider, cloud resource, deployment or public claim was enabled.
- Internal filler/pause cuts are deferred pending the explicit segmented-source
  contract work recorded in parent section 0.6; near-minute preference does not
  override editorial validity or quota rules.
- Owner review of this revised UI, independent side-chat validation, licensed
  media, production-like performance, provider/retention/spend/cloud/release
  evidence and the remaining manual checks are still unchecked.
- Notification to the original validation side chat was attempted under the
  owner's authorization, but that chat is no longer available. The message was
  not delivered; independent revalidation remains pending. No replacement chat
  was created or unrelated chat contacted.
- Local servers left available: frontend node PID 2680, backend node PID 18088,
  with ignored `cl004-frontend.out.log` / `.err.log` and
  `cl004-backend.out.log` / `.err.log`. Use `http://localhost:3000/start` to match
  committed `FRONTEND_ORIGIN`; no environment values or credentials were read.
- No files were staged or committed. `git diff --check` passed and the staged
  diff is empty. Dependency direction, duplicate schemas, debug code, unsafe
  casts, stale flags and content leakage were inspected. Next rewrote the
  generated `next-env.d.ts` metadata; its final content matches HEAD exactly.

## Original contract (layout superseded above)

## Objective

Build the complete no-cost visitor path from landing through sample session,
candidate preview, transcript evidence, selection, and the handoff that starts
first-cut assembly. Include the live-upload card as an honest availability and
limits surface, but do not implement upload in this ticket.

## Portfolio value

Produce the first coherent, polished product slice: a visitor understands the
input, AI role, human choice, grounded evidence, speaker/visual promise, and
real export destination within seconds—without credentials or a paid call.

## Standalone implementation context

- The landing promise is one conversation → zero to four grounded moments
  (target three strong choices) → exactly one visitor-selected,
  speaker-aware, automatically captioned/visualized vertical MP4.
- Sample is the first primary action and should reach candidate review in under
  15 seconds on a production-like connection.
- Candidate rank is editorial ordering, never a virality score. Evidence links
  resolve to exact transcript word IDs/time and seek/highlight the source.
- The product uses one reducer-owned staged experience. Screen components
  dispatch events and render selectors; they do not invent local workflow.
- The live-upload card always shows recommended and hard bounds plus rights and
  temporary-storage copy. If live upload is disabled, it stays honest and does
  not block sample mode.
- Use the approved CL-002 tokens/composition. Do not reinterpret the visual
  gate or create a second mobile implementation.

## Dependency evidence required

2026-10-01 execution evidence: the owner explicitly approved CL-002's current
desktop/phone implementation as the interim visual baseline, deferring further
visual feedback/refinement until after functional implementation (CL-013).
CL-003 is committed at `0e14f23`; the starting worktree is clean and its
162-test fake/network-guarded verification is recorded in the packet. Real
sample-media rights/playback and public-release approval remain unchecked.

- CL-002 must record explicit owner approval or named approved revisions for
  the visual tokens and desktop/phone concepts.
- CL-003 must expose passing reducer/persistence/fixture tests, a deterministic
  three-candidate sample, zero-to-four general candidate bounds, a no-candidate
  fixture, and zero-network deterministic fakes.

If either proof is missing, stop at the boundary instead of recreating its work
inside this UI ticket.

## Files and areas owned

- Frontend global shell and stable primitives first used here.
- Landing/intake and sample-session action.
- Candidate list/cards, source preview/range playback, evidence inspector,
  transcript highlight, source-range rail, and honest no-candidate state.
- Shared API client/error/polling and media object-URL/playback/timecode modules
  only where the sample slice truly uses them.
- Component/flow tests and lightweight fake-mode sample E2E.

## Scope boundaries

### In scope

- Product wordmark, descriptor, stage title, privacy/limits, fake/sample/live
  environment indicator where appropriate, content-safe error region, skip
  link, and Clear when a session exists.
- Responsive landing with sample/upload cards, exact upload-limit copy, rights
  disclosure, and safe claims.
- Immediate sample session creation and runtime-validated fixture fetch/use.
- Candidate review at desktop/laptop/tablet/phone compositions, including
  accessible selection, evidence seek/highlight, caveats, and source ranges.
- Honest no-strong-candidate state without a manual-range fallback.
- Loading/failure/expired/clear behavior reachable in this slice.

### Out of scope

- Selecting/uploading a real file, resumable upload, media inspection, live
  analysis, active-speaker inference, visual asset creation, automatic clip
  review, render confirmation,
  render, download, or cloud deployment.
- Pre-rendering candidate videos, numeric performance scores, trend data,
  arbitrary media URLs, fake processing percentages, or decorative autoplay.
- A broad generic design-system abstraction not justified by components used
  in this ticket.

## Implementation checklist

- [ ] Compose the global shell and landing from approved tokens, semantic
  landmarks, one `h1`, visible focus, and natural short-height scrolling.
- [ ] State the safe public promise and explain “high-potential” as editorial
  reasoning rather than a predicted result.
- [ ] Display exact upload copy: recommended under 10 minutes/250 MiB; maximum
  20 minutes AND 500 MiB; final clip 10–60 seconds.
- [ ] Start the sample deterministically, set/reconcile session evidence, and
  reach candidates without paid/provider work.
- [ ] Render the deterministic sample's three distinct candidates while the
  reusable UI safely supports one to four; include title, hook, rationale,
  signal evidence, caveats, derived range/duration, and accessible rank.
- [ ] Seek to the first referenced word and visibly highlight the exact excerpt
  when evidence is activated; hover is never required.
- [ ] Keep candidate selection provider-free; allow exactly one selected
  candidate and dispatch assembly start only on explicit `Build this clip`.
- [ ] Provide the no-candidate state with rubric reasons, clear, and only the
  bounded retry permitted by evidence; expose no manual-range control.
- [ ] Clean up object URLs, media listeners/timers, and pending requests on
  source change, stage change, clear, and unmount.

## Responsive and accessibility contract

- ≥1440 px: candidate list, large preview, evidence inspector, range rail.
- 1024–1439 px: candidate/preview two columns; evidence panel or drawer.
- 600–1023 px: preview first, semantic candidate tabs, then evidence.
- 320–599 px: one candidate, previous/next controls, vertical preview,
  expandable evidence, safe-area-aware primary action.
- No horizontal page scroll; all pointer actions have keyboard equivalents;
  focus follows deliberate stage changes and returns correctly from drawers.
- Video never autoplays with sound and has accessible playback/time controls.

## Privacy, provider, and cost constraints

- Sample analysis and preview use only approved fixtures/private sample
  capability; no provider call, signed URL persistence, or app-service media
  body.
- Local filenames or private object names never appear in this slice.
- Do not claim the sample analysis ran live for the visitor.
- Do not enable live upload or ask the owner for credentials.

## Acceptance criteria

- [ ] A new visitor can explain the input, AI analysis role, one human choice,
  speaker/visual behavior, and output from the landing/sample story.
- [ ] Sample reaches candidate review in under 15 seconds without network
  provider work or credentials.
- [ ] The sample's three materially different candidate cards map every signal
  to existing transcript word IDs and derived time ranges; one-to-four layouts
  preserve the same semantics.
- [ ] Evidence activation seeks/highlights the correct words; selection itself
  makes no provider call.
- [ ] No-candidate behavior is honest, offers no manual editing fallback, and
  cannot dispatch assembly without a valid candidate ID.
- [ ] Phone, tablet, laptop, desktop, short-height, keyboard, 200% zoom, and
  reduced-motion checks preserve the same capability.
- [ ] Clear/expiry and all local media/request effects clean up correctly.

## Focused verification

- [ ] Run affected component, reducer-integration, media cleanup, and sample
  flow tests.
- [ ] Assert fake/provider/job call counts stay at zero through candidate review
  and selection.
- [ ] Manually verify 320×568, 390×844, 768×1024, 1024×768, 1440×900, and one
  600–700 px short-height viewport plus an intermediate drag resize.
- [ ] Check keyboard, focus, evidence seeking, playback controls, 200% zoom,
  reduced motion, forced colors, and no horizontal overflow.
- [ ] Run affected lint/typecheck/build, `git diff --check`, and inspect status.

## Documentation updates

- Update frontend README for sample flow, commands, and manual checks.
- Update public root README only if implemented behavior changes the portfolio
  story or local-start instructions.
- Record visual approval dependency and sample-rights status honestly in this
  packet/index.

## Owner gates and external blockers

CL-002 visual approval is required before broad styling is complete. Actual
purpose-recorded playback is additionally blocked until the sample rights gate
is satisfied; deterministic/synthetic fixtures may be used meanwhile without
claiming final media approval.

## Commit boundary

Keep the complete landing-to-candidate-review slice in one commit represented
by `CL-004: deliver the sample candidate experience`. Do not split cards,
evidence, responsive behavior, or sample startup into separate tickets. Do not
absorb live upload/analysis or automatic review/render work, and do not perform Git actions
without explicit authorization.

## Precision references

- [Product contract and safe claims](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#1-locked-product-contract)
- [Signature journey through candidate review](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#4-end-to-end-signature-journey)
- [Landing and candidate screen behavior](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#6-screen-by-screen-experience)
- [Candidate contract and rubric](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#106-candidate-contract)
- [Frontend component and flow tests](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2012-frontend-component-and-flow-tests)

## Completion handoff

Report the implemented screens/components, candidate/evidence behavior, state
events, responsive/accessibility results, performance timing, zero-call proof,
cleanup checks, changed files, documentation updates, and any blocked visual or
rights evidence.
