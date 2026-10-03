# CL-013 — Accessible responsive workflow and measured quality

## Current cloud-render packet — approved local execution, 2026-10-02

Status: local experience corrections and owner-directed workflow redesign implemented; runtime quality matrix and film approval remain open.

Latest owner checkpoint — 2026-10-03: this UI/UX feedback round is finished for
now. The owner authorized all pending whole files to be staged and committed
sequentially using the [combined file-level plan](CL-013-016-UI-COMMIT_PLAN.md).
The [next-session checklist](../operations/LOCAL_RELEASE_PREPARATION.md#owner-next-session-checklist--planned-2026-10-04)
records real 7:41 sample playback, Gemini setup and a bounded actual-flow test
planned for 2026-10-04. This later Git authorization supersedes older no-Git
scope notes below; external/media/device/film and public release gates remain
unchecked. Fake mode remains keys-free and synthetic, with no actual MP4; real
sample reads need ADC/cloud setup and real AI needs its keys/live/approval gates.

Authority: [Google/Cloud Run migration plan](../architecture/GEMINI_REMOTION_MIGRATION.md); [file inventory](../architecture/MIGRATION_FILE_INVENTORY.md); [later setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md).

Verify phone/desktop source upload, preview/download/error/cancel accessibility and actual final MP4 layout/caption/A/V correctness. Browser final encoding/model hardware tests are retired. Record real phases and speaker evidence, never an assumed cloud SLA.

Dependencies follow the numbered migration sequence. After documentation approval, implement one dependency-ready packet at a time and run focused checks plus the required settled five root gates. Fake/live AI and local/cloud compute are independent; cloud render can incur cost with fake AI. Ordinary tests remain synthetic, credential-free, fake/off and zero-network through injected cloud/provider ports. No cloud provisioning, login, credential use, private upload, paid call, Git action, usage polling or new independent review is authorized now.

- [x] Owner explicitly approved documentation and local corrections on 2026-10-02.
- [x] Implement and verify dependency-ready local corrections after approval; runtime/film gates remain unchecked.
- [x] Record synthetic checks and the explicitly unverified manual/film/media/rights gates.

## Local execution — 2026-10-03

Dependency CL-012 is committed as `3127c77`; worktree was clean. Owner authorized
local execute/validate loops and ticket-prefixed commits through CL-015, with
no new cloud/provider/deployment and actual media/device tests deferred.

[Quality matrix](../operations/EXPERIENCE_QUALITY_MATRIX.md) records source,
synthetic, build-inventory and unverified runtime evidence. Delivered shared
ordinary mute/seek semantics, final transcript, bounded first-frame verification,
honest expiry/failure status, nonfinite seek protection, natural result rows,
stage-only Remotion loading and immutable transcript-filter reuse. Focus/status/
keyboard/dialog/forced-color source paths were checked. No product/editor or
motion decision changed. No service/browser/screen reader or actual media ran.

`FAKE_MODE=true` / no keys supports labelled fixtures and synthetic regressions;
actual MP4/AI quality is not proved. Real AI needs provider keys/live/data/rights/
paid approval; cloud compute/storage/IAM is separately gated. No local AI weights.
Full responsive/zoom/contrast/screen-reader/motion/browser performance, actual
MP4/caption/A/V/parity/max-envelope/device observations, CSP/Turnstile compatibility,
rights/licenses and owner film/UI approval remain unchecked. Film work is not
pre-created before the required final-UI/capture/editorial approval sequence.

Validation pass 1 (read-only current tracked + two new files): **Meets ticket
with concerns** for the authorized local scope; **no actionable findings**.
Covered: ordinary controls/transcript, bounds/decode/error/expiry cleanup,
read-only integration, responsive source correction, staged loading and accurate
evidence. Partial: semantic/focus/performance source checks. Unverified: the
manual/media/device/film/provider/cloud/rights gates listed above. Inspected the
complete ticket and changed code/docs plus nearby native Player, session reducer
and installed Next guides. No edits, full suite, external calls or delegation
occurred during validation. No earlier finding was dismissed. Focused execution
checks passed 28 tests in 4 files plus the existing review regression checks.

Settled gates: `corepack pnpm format:check`, `lint`, `typecheck`, `test:unit`,
and `build` pass; `git diff --check` passes. Unit total: **623 tests in 64 files**
(root 20/3, contracts 58/5, composition 3/1, backend 195/14, renderer 56/11,
frontend 291/30). The first concurrent root run timed out in an unchanged
boundary-lint test; rerunning units alone passed it in the original timeout and
passed the complete gate. No threshold was widened. See the matrix for exact
before/after production chunk inventories; no SLA or runtime metric is inferred.

Commit: [file-level plan](CL-013-COMMIT_PLAN.md), authorized through CL-015.

## Authorized browser follow-up — 2026-10-03

The owner requested thorough local fake-mode QA after CL-015 and explicitly
required reproducing actual bugs before changing functionality. Baseline was
clean `632eb7689ba53d1f23e3b0b50f7cd192f72de2cb`. This pass stays in CL-013's
experience scope; no new film, paid, cloud, credential or deployment approval is
inferred. See the [updated quality matrix](../operations/EXPERIENCE_QUALITY_MATRIX.md#authorized-browser-follow-up--2026-10-03).

Reproduced three target-size defects against the existing 44px requirement:
note timestamp width about 41px; workflow home-link height 24–27px; narrow
landing logo-link width about 27px. Corrected only minimum dimensions in the
two owning CSS modules using `--cb-target`. Processing, selection, playback,
session/persistence, API/provider/render and cleanup logic remain unchanged.
After production rebuild, timestamps measure 44×44px across every anchor,
workflow home height is 44px, and both narrow landing logos are 44×44px with
navigation still inside the header. Existing seek/home actions still work.

The first follow-up validation found one additional Low accessibility issue:
fake Download's disabled prerequisite existed only in its tooltip, contrary to
source-of-truth section 19.1. Browser output and the owning component confirmed
the defect. Added one visible “Simulated preview. No downloadable video was
created.” notice with a unique `aria-describedby` association, and extended the
existing delivery regression to verify its visible text/association and the
still-disabled button. Download behavior and all four inert destinations stay
unchanged. This finding was independently checked against the requirement before
correction; the earlier target findings were also reproduced before edits.

Browser fixture observations cover landing/intake, three candidates, each
selection, transcript/notes, pause/seek, read-only review, explicit simulated
export, disabled Download and reset. Normal keyboard Tab entry/focus and action
activation, privacy modal isolation/Escape return, refresh at review/result and
acknowledged assembly, cancellation during upload/analysis/assembly/export,
invalid/empty intake, repeated clear/new-input cycles, a second fixture-tab
conflict, and owned-backend outage/cleanup/reconnect were checked. Intentional
disabled download and uncertainty were retained. There was no actionable error
in the post-build browser's captured warning/error log.

All eleven dimension anchors were inspected for fixture geometry:
320×568, 390×844, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080,
2560×1440, 900×600, 1100×700 and 640×640. No horizontal page overflow was
observed in the checked stages; bounded notes/transcript/privacy panes scroll.
This is partial emulated browser coverage, not the complete acceptance matrix.
One instrumented fixture journey reached candidates in 8,444ms including tool
overhead and deliberate delays. Real processing and native performance are not
proved. The focused existing behavior regression suite passed **54 tests in 5
files**; browser geometry supplies the direct CSS regression evidence.

With `FAKE_MODE=true` and no keys, only synthetic processing works and Download
is intentionally unavailable. No local AI runtime/weights were used. Real AI
still needs keys/live/rights/data/paid approval; actual MP4/private storage/render
needs independent cloud/compute/IAM approval. Physical devices, Windows screen
reader, 200% zoom/text-spacing/virtual keyboard, forced colors/full contrast,
full keyboard scroll audit, suspension/eviction/real Web Locks, zero/four
candidate browser fixtures, real Turnstile/upload, actual media/caption/A/V/parity,
maximum-envelope performance, automated serious/critical accessibility audit,
motion disposition, final UI/film/rights approvals and public release remain
unchecked. Earlier audit evidence remains revision-specific and must be refreshed
before releasing this later revision.

Commit follows the [whole-file browser QA plan](CL-013-BROWSER-QA-COMMIT_PLAN.md).

Follow-up validation pass 2: **Meets ticket with concerns** for the authorized
local follow-up; **no actionable findings** on the combined eight-file worktree
change from `632eb7689ba53d1f23e3b0b50f7cd192f72de2cb`. Pass 1's Low
tooltip-only Download issue is resolved by visible associated text, the existing
delivery regression and final production browser observation. All three target
issues are resolved by geometry and preserved seek/navigation behavior. Reviewed
the full packet, source-of-truth requirements, applicable instructions, combined
diff, the plan and nearby rendering/styles/fixture boundaries. No requirement or
unchecked approval box was weakened. Covered: narrow fixes, disabled behavior,
regression and honest evidence. Partial: emulated responsive/keyboard/recovery
matrix. Unverified: the manual/native/film/external items listed above. Validation
was read-only, with no delegation or full-suite execution during that phase.

Execution's settled gates after the final correction all passed:
`corepack pnpm format:check`, `lint`, `typecheck`, `test:unit`, `build`, and
`git diff --check`. Total **632 tests in 65 files**; no timeout was widened.
The final production browser journey and result refresh retain disabled Download,
visible notice/association, no root horizontal overflow at all anchors, and zero
captured warning/error logs. At 320×568, keyboard End scrolls delivery to its
bottom while the Start over footer remains available. All temporary browser tabs
and viewport overrides were cleaned up. Both owned QA process trees and ports
3000/4000 were verified stopped. Logs/records/crops stay ignored under
`artifacts/qa/cl013-followup-20261003/`. Deviation: none; this later owner-approved
fake browser pass does not complete previously deferred real-media/device gates.

## Owner illustration feedback — 2026-10-03

The owner requested a more natural torso, head and arms in the landing's
illustrative conversation, especially its shoulders. This is an original SVG
redraw in `apps/frontend/src/app/process-narrative.tsx` and
`apps/frontend/src/app/page.module.css`, within the existing CL-013 UI follow-up.

An [interview pose photograph](https://www.thobelafm.co.za/thobelafm/articles/taba-yaka-le-mankoko-baby-hlabirwa/)
was inspected for shoulder slopes, sleeve fit and arm proportions. The photograph
is reference only; no photograph or third-party media asset was added to the app.

The redraw joins sloping sleeve tops to the shoulder/chest silhouette, mirrors
their shape on the right side, tapers upper arms and forearms, rounds elbow
contours and refines wrists/palms. Neck, jaw, face/hair planes and torso/cloth folds
use the existing two speakers' palettes and bounded inline SVG gradients.
Question/answer switching, microphone, captions, timeline, phase timing,
animation ownership and cleanup retain their existing behavior. No workflow,
API, provider, schema, dependency or application configuration was changed.

Verification on the settled redraw passed: `corepack pnpm format:check`,
`corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test:unit`
(665 tests in 66 files), `corepack pnpm build` and `git diff --check`.
The local build retains the previously documented Windows external-package-link
release limitation; this illustration does not change that release gate.

Browser review checked the synthetic preview at 390 × 844 and 1440 × 900, with
no horizontal page overflow. The phone capture shows the first speaker; the
settled desktop capture shows the second speaker's conversational arm pose.
Ignored preview evidence is under
`artifacts/qa/cl013-speaker-redraw-20261003/` (`phone-portrait.jpg` and
`desktop-portrait.jpg`). Backend health, `/start` and `/api/sample/config`
returned 200; the config reported fake mode, local media disabled and all three
live capabilities disabled. The requested local apps remain running.

Read-only validation of the final diff found no actionable issue in this visual
correction: changes are limited to SVG geometry/paint and proportional CSS;
existing speaker markers, accessibility semantics, unique gradient IDs,
animation timings and effect cleanup remain intact. No new listener, timer,
request or dependency was introduced. The redraw is uncommitted for owner review.

This is synthetic landing artwork available with `FAKE_MODE=true` and no keys,
not AI-processed source footage or the final product film. Real Gemini processing
still requires keys, enabled live flags and rights/data/spend approval; cloud
compute is separately gated. No local AI runtime/weights or paid/provider/cloud
action was used. Final owner visual approval and the broader physical-device,
accessibility, real-media/quality, film and release gates remain unchecked.

## Owner privacy-copy feedback — 2026-10-03

The owner requested a Privacy-only panel, replacing duplicated product/upload
limits with actual media-use and handling information. Continued the existing
CL-013 owner-feedback worktree without changing the earlier speaker redraw.
The shared `privacy-dialog.tsx` now labels both landing/workspace triggers
Privacy and explains no publishing/marketing/demo reuse, temporary storage,
Gemini transfer and Clear. Existing intake rights/limits remain enforced.

The [current source-of-truth owner revision](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#owner-privacy-panel-revision--2026-10-03)
records this policy/presentation decision. Copy follows the existing
[migration retention contract](../architecture/GEMINI_REMOTION_MIGRATION.md#retention-cancellation-privacy-and-spend)
and implemented local/cloud boundaries: two-hour local/source access,
ten-minute-or-session output availability, independent expiry sweep, best-effort
device clearing, asynchronous cloud deletion, separate Google retention and no
control over downloaded copies. No unconditional no-storage/deletion or
provider-training promise was added. No storage, API, provider, gate or
interaction behavior changed; native modal semantics/close handling are retained.

The existing page regression covers cloud, local-only and preview disclosures,
the renamed trigger/close label and removal of duplicate upload limits.
Focused `corepack pnpm --filter @clipbuilder/frontend test:unit src/app/page.test.tsx`
passed 11 tests. Settled root `corepack pnpm format:check`, `lint`, `typecheck`,
`test:unit` (665 tests in 66 files), `build` and `git diff --check` passed.
The build retains the documented Windows external-package-link release gate.

Browser review verified the shared Privacy trigger/content on landing and
`/start`, initial Close focus, button closing and Escape focus return. The final
copy fits at 1280 × 800; at 390 × 844 the native dialog scrolls to the complete
last row without horizontal page overflow. Temporary viewport overrides and the
workspace test tab were cleaned up; the owner's existing workspace was preserved.
Final synthetic screenshots stay ignored in
`artifacts/qa/cl013-privacy-copy-20261003/` (`privacy-desktop.jpg`,
`privacy-phone.jpg`, `privacy-phone-bottom.jpg`). No selected file or processing
request was used; the requested app stack remains running.

Read-only validation: **Meets ticket** for this owner-copy correction;
**no actionable findings**. Reviewed the final privacy component/page regression,
source-of-truth and guide updates against the current migration contract and
renderer publication/cleanup boundaries. Existing intake rights/size/duration
controls remain visible and unchanged. The earlier illustration changes are
preserved and covered by their separate evidence above. No effect, timer,
request, listener, dependency or storage behavior was introduced or changed.
No provider-training, zero-storage or instant-deletion claim is made; vendor
configuration and physical/live retention are not proved by these synthetic checks.
All seven changed tracked files remain unstaged and uncommitted for owner review.

Fake/no-key preview
reads/uploads no selected files, sends no selected media to AI and creates no
downloadable video. Real AI remains gated on keys/live/rights/data/spend approval;
cloud processing has its independent IAM/compute/storage gate. No local AI
runtime/weights, credentials, provider calls or cloud changes were used. Owner
copy approval and wider live/privacy/device/film/release evidence remain open.

## Owner workspace-logo feedback — 2026-10-03

The owner identified the generic clapperboard in the `/start` header as the wrong
logo. Reused the landing's original blue two-bar ClipBuilder mark through
`shared/ui/brand-mark.tsx` and its owning CSS module. Landing wordmarks and the
workspace now share that same artwork. Hero-specific scale rules stay in the
landing stylesheet; the text, home target, 44px link target, focus behavior and
workspace header layout remain intact. Removed the unused clapperboard import
and its dead header SVG-color rule. No workflow, provider, configuration or
processing logic changed, and earlier illustration/privacy edits are preserved.

Focused existing page/workflow checks passed 16 tests in 2 files. Root
`corepack pnpm format:check`, `lint`, `typecheck`, `test:unit` (665 tests in
66 files), `build` and `git diff --check` passed. Typecheck first identified
the CSS-module lookup's possible undefined value; the shared component's optional
class prop now explicitly permits it, consistent with the repository's strict
optional-property handling. No cast or assertion was added. Local build inventory
passes with the previously documented Windows external-link release limitation.

Synthetic browser review verified the corrected `/start` logo at 1280 × 800,
390 × 844 and 320 × 568, with no horizontal overflow. The mark measures about
27.2 × 27.2px and the home link remains 44px high. Clicking that link returned
to the landing; its header still uses the same 27.2px mark and its hero retains
the larger 44.8px mark at 1280px. Both contain the same two-bar shared artwork.
Ignored screenshots are under `artifacts/qa/cl013-workspace-logo-20261003/`
(`workspace-desktop.jpg`, `workspace-phone.jpg`, `landing-desktop.jpg`).
The temporary review tab and viewport overrides were cleaned up, the owner's
workspace was preserved, and the requested local apps remain running.

Read-only validation: **Meets ticket** for the owner logo correction;
**no actionable findings**. Reviewed the extracted original mark geometry,
landing sizing/forced-color selectors, workspace imports/home-link semantics,
new shared files and guide update. Shared UI imports no application code and adds
no effect, timer, listener, request, runtime dependency or processing behavior.
Earlier illustration/privacy edits remain intact. Ten tracked modifications and
the two new shared files remain unstaged and uncommitted for owner review.

This UI correction works
with `FAKE_MODE=true` and no keys. Real AI still requires keys/live/rights/data/
spend approval; cloud compute/storage/IAM approval is separate. No local AI
runtime/weights, selected media, credential, provider/cloud or Git mutation was
used. Final owner logo/UI approval and broader release gates remain open.

## Owner full-workflow design planning — 2026-10-03

The owner requested a redesign plan for the full step-by-step flow, carrying the
landing background, blue palette, glass cards/CTAs and typography into the
workspace. The [workflow design plan](CL-013-WORKFLOW-DESIGN-PLAN.md) records
the inspected mismatch (shared primitives currently inherit light defaults),
visual direction, every state family, sequential file-level implementation,
responsive/contrast/fallback checks and fake/live boundaries. The source of truth
records this latest direction over the older light-workflow presentation.

Planning only: no application source or running configuration changed this turn.
Earlier speaker/Privacy/logo corrections stay uncommitted. Implementation,
owner visual sign-off and wider device/live/media/film/release evidence are not
marked complete. Existing fake/no-key fixtures can support the proposed UI work;
real AI still needs keys/live/rights/data/spend approval and real cloud media
has its independent IAM/compute/storage gate. No local AI weights/runtime,
provider/cloud action, deployment or Git mutation was used.

## Owner workflow redesign implementation — 2026-10-03

The owner authorized implementing the documented design before the separate
sample/upload preview flow. Implemented the shared background and CTA recipes,
scoped dark palette, glass header/frame, rounded blue actions, blue-tinted intake
and candidate cards, opaque reading panes, status/error and delivery treatments.
Changed theme files: `styles/tokens.css`, `app/page.module.css`,
`shared/ui/workflow.module.css` and `features/sample/sample.module.css`.
No reducer, handler, schema, provider, playback or fixed-composition changes.
Earlier speaker/Privacy/logo corrections are preserved and remain uncommitted.

The [design plan](CL-013-WORKFLOW-DESIGN-PLAN.md#implementation-evidence--2026-10-03)
and [quality matrix](../operations/EXPERIENCE_QUALITY_MATRIX.md#owner-workflow-redesign--2026-10-03)
record geometry, contrast, screenshots, behavior checks and limitations. No real
media, local AI weights/runtime, keys, live flags, paid calls, cloud resources,
deployment or Git mutation were used. Owner visual approval and physical-device/
screen-reader/live/film/release acceptance remain unchecked.

Settled root format/lint/typecheck/unit/build and `git diff --check` passed;
665 synthetic tests in 66 files. The final post-build browser journey reached
disabled fake Download and Start over; delivery also fit all eleven anchors.
The development rebuild invalidated an earlier volatile session; clearing and
the repeated settled journey succeeded without a source change. Screenshots
cover desktop/phone intake, candidate detail, review and delivery.

Read-only validation pass: **Meets ticket** for this owner redesign follow-up;
**no actionable findings**. Reviewed the combined uncommitted CL-013 changes
over `5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1`, separating the already-verified
speaker/Privacy/logo corrections from the new theme. Confirmed shared-token
integration, full state CSS coverage, opaque/system fallbacks, responsive
geometry, preserved actions/side effects and documentation. Existing behavioral
tests, the complete settled fixture journey and five root gates provide local
evidence. Alternate OS/browser preferences, real footage, native quality,
physical devices, screen readers, film and deployment remain unverified. Git
index is empty; no stage/commit/push was authorized for this UI pass.

<details>
<summary>Earlier packet and evidence, retained as history where superseded</summary>


Status: Planned<br>
Milestone: M6 — public-demo hardening and audit<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-012<br>
Blocks: CL-014<br>
Suggested commit: `CL-013: complete the experience quality pass`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

**Current media architecture (2026-10-01):** use section 0.9 and
[Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md), not historical
server job/capability assumptions. Preserve this packet's finalized-UI film
ownership, shared single-card design and permanent app-motion decision.
Measure full-bound import/audio and 60s 1080x1920 H.264/AAC local export in the
available desktop-browser runtime, plus responsive viewport checks and
quota/private browsing/two tabs/background suspension/restore/clear.
Agree measurable thresholds before a go verdict; no silent quality/limit change.
Review local-disk/provider-transfer/uncertain-paid-result copy and unsupported
states. No video/output is uploaded to make film or performance tests pass.

Audit and correct the complete implemented flow for responsive composition,
short-height behavior, keyboard and screen-reader access, focus, status/errors,
200% zoom, forced colors, reduced motion, media/review usability, and measured
frontend/media performance. Record one release-quality manual matrix rather
than leaving these concerns fragmented across feature tickets.

After the actual UI is finalized and owner-approved, produce and integrate the
original landing motion-graphics product film described below. This film is
owned here, not in CL-004. Its approval is separate from the quality matrix.

## Portfolio value

Make the full demo feel intentionally built at every practical viewport and
interaction mode. The result should demonstrate the same choose/build/review/
download capability on
phone, tablet, laptop, desktop, and large monitor without inaccessible or
performance-heavy fallbacks.

The landing film should make the finished journey tangible: a deliberate
cursor-led walkthrough of the real UI, cinematic screen angles, readable titles,
and a convincing reveal of the selected vertical result. It is an authored
promotional asset, not a second interactive product or a new publishing feature.

## Owner addition: finalized-UI motion-graphics film (2026-10-01)

The owner explicitly assigns the landing product film to CL-013 and excludes
it from CL-004. Production must wait for the final UI so approved screenshots
can be handed to a `gpt-6.1-sol` authoring agent. That agent is expected to create
an editable motion-graphics composition from those references, not invent a
different interface or assume access to a native video-generation service.
This packet records a future handoff; it does not dispatch another agent now.

### Sequence and readiness gate

1. Complete the whole-flow responsive/accessibility/performance corrections.
   Finish the owner's visual-feedback round on the actual implemented screens.
2. Obtain owner approval of the UI capture baseline at desktop and phone sizes.
   Record its content-safe version/revision and the screens being approved.
   Do not produce the film from CL-004's interim UI, old mockups, or placeholders.
3. Prepare the sanitized capture package and a shot-by-shot production brief.
   Approve the storyboard, title copy, target duration, social-platform ending,
   format/weight budget, and optional audio before final composition/export.
4. Hand the approved package to the owner-designated `gpt-6.1-sol` agent for
   local authoring. Create a separate authoring chat only when the owner
   explicitly requests it; do not replace the requested model silently.
5. Review an animatic, then a polished preview. After owner approval, render the
   delivery variants, integrate the landing film, and rerun affected quality
   checks. If the UI materially changes, recapture affected shots and reapprove.

The existing CL-012 dependency still applies. Final UI approval, reusable media
rights, and a truthful result asset are additional film readiness evidence, not
facts inferred from passing code checks. No fresh paid clipping/provider run
is required or authorized solely to collect film footage. Reuse approved
existing results or clearly identified illustrative material.

### Screenshot and authoring handoff

- Capture the actual finalized UI: intake/drop target, local preparation progress, analysis
  stages, candidate choices, exactly-one selection, automatic build, read-only
  review, render confirmation/progress, result and download. Include desktop
  framing and phone reference where composition changes.
- Use deterministic synthetic data or explicitly rights-approved assets. Never
  include real private media/transcripts, filenames, account names, credentials,
  browser profile chrome, local paths, provider settings, signed URLs or tokens.
  Do not hide development disclosures or present fake export states as real
  edited-video output. Illustrative footage remains labelled until its claims
  and actual result are proven and approved.
- Supply stable capture dimensions, screen/state labels, intended cursor target
  coordinates, interaction order, selected-candidate continuity, and a reference
  index so the agent does not guess controls, labels, content or screen geometry.
- Include approved design tokens, typography, palette, wordmark treatment,
  spacing, cursor/click treatment, title copy and motion references. Preserve
  ClipBuilder's identity rather than applying a generic video-template style.
- Provide the selected clip's approved preview/result and permission record
  separately from UI screenshots. If it is unavailable, storyboard the reveal
  but leave final production gated; never generate a fictitious result as proof.
- Require an editable, deterministic scene/timeline project with documented
  local preview/render commands and replaceable screenshot references. Choose
  a proven composition/rendering workflow at execution time; assess its license,
  dependencies and local runtime before introducing it. Use Three.js if actual
  3D screen/camera work is needed. Do not build a bespoke video engine.
- Keep capture files, filled production prompts, generated media and final
  exports outside Git in ignored/local artifact storage. Commit only safe
  project code and content-free production/verification metadata. Create no
  speculative film directories until their first real module is needed.

### Storyboard and claim boundaries

The proposed pacing is a concise approximately 40-60 second master, adjusted
after animatic review. This is the promotional film's duration, not a change
to the product's 10-60 second selected-clip bounds. The journey must remain
legible without sound; do not compress every action into a rapid montage.

| Beat | Visual treatment and action | Truthfulness boundary |
| --- | --- | --- |
| 1. Identity | Open with ClipBuilder, a restrained title and a clean front-facing view of the finalized workspace. | Use approved product copy, not virality, speed, or integration claims. |
| 2. Bring a recording | An animated cursor drags a synthetic/approved video tile into the real drop target; briefly show formats/limits and local preparation progress. | No private file-picker/account details. Progress is illustrative film editing, not measured product latency or a remote original-video upload. |
| 3. Find moments | Push into the same workspace as analysis moves through actual stage labels; use restrained title transitions and useful close-ups. | No invented controls, fabricated percentage promises, or suggestion of a chatbot/editor. |
| 4. Choose one | Reveal the grounded choices, move the cursor deliberately, select exactly one and show the real selected-state response. | Never suggest batch rendering, manual trimming, or multiple selected clips. |
| 5. Automatic build | Transition through speaker-aware framing, fixed captions and contextual visuals, then reveal the completed vertical composition. | Use approved output that actually demonstrates those layers; no editable timeline or styling controls. |
| 6. Review and render | Hold on the read-only preview; the cursor confirms one render and moves through the real progress/result states. | Preserve the actual confirmation sequence and one-final-render contract. |
| 7. Final product | Give the finished vertical clip a clear, readable hero reveal, then show the real Download action. | Preview and result must represent the same selected clip; no fake download success. |
| 8. Share externally | Move the downloaded clip into a distinct external-sharing vignette, with owner-approved social destinations and schematic manual upload actions. | Sharing happens outside ClipBuilder after download. No in-app Publish button, OAuth, automatic posting or claim of universal platform support. |
| 9. Close | Return to the product identity and an approved invitation to try the experience. | Preserve landing navigation and safe product claims; do not add unsupported offers. |

The owner's multi-platform ending can show destinations such as TikTok,
Instagram Reels and YouTube Shorts, subject to storyboard and brand-asset
approval. Treat them as representative manual publishing destinations, not
"all platforms" compatibility certification. Do not post anything, connect
accounts, capture real social profiles or display publishing credentials.
Choose generic/clearly illustrative external upload visuals if approved platform
assets or clean capture rights are unavailable. A direct-publishing product
change would need a separate explicit source-of-truth decision and ticket.

### Art direction and motion

- Combine front-facing reading holds with deliberate angled screen planes,
  perspective camera moves, close-ups, depth/parallax, and cohesive transitions.
  Perspective must never make the essential UI or result unreadable.
- The cursor must follow plausible paths, land on the actual target, and click
  or drop in the correct sequence. Avoid random pointer travel, impossible
  drags, invented hover states and clicks that do not match the displayed UI.
- Use titles and kinetic typography to name the current story beat. Keep words
  concise, aligned to approved brand typography, high-contrast, within safe
  margins, and visible long enough to read on a phone.
- Animate selection and the final clip reveal with more emphasis than passive
  status updates. Keep the same selected moment and result continuous between
  shots; no unexplained jump to a different conversation or output.
- Optional music/sound effects require recorded usage rights. Audio is an
  enhancement only; titles/captions must carry the story without sound. Never
  autoplay sound or use unapproved voices, music, platform logos or footage.
- Avoid flashing, illegible whip transitions, excessive camera spin and purely
  decorative effects that obscure the workflow. Match motion to each action
  rather than using a collection of unrelated presets.

### Deliverables and landing integration

- Approved storyboard and animatic; editable source project and reference index;
  one polished landscape master suitable for the reserved landing hero area;
  browser-compatible web rendition and an approved static poster/fallback.
- Record dimensions, duration, frame rate, codecs, file sizes and the measured
  landing download/decode/render impact. Agree the numerical delivery budget
  before final export; do not ship an unbounded high-resolution master to phones.
- Portrait/square promotional cutdowns are optional, require owner approval,
  and must be reframed rather than cropping away essential UI/title information.
- Replace the CL-002 placeholder only after asset/editorial approval. Keep the
  existing landing layout, primary action and product identity coherent; do
  not make CL-004 own film production or redesign the functional application.
- Provide usable playback/pause/replay behavior and a poster/error fallback.
  No autoplay with sound. Resolve the CL-002 prototype's always-on-motion
  exception for public release; offer an appropriate reduced-motion/static
  experience, while deliberate Play may show the film at normal timing.
- Lazy-load appropriately, avoid layout shift, stop/pause unnecessary playback
  when hidden/offscreen, and clean up media listeners, observers, animation
  frames and local URLs. Verify stable framing and no title/control overlap
  across desktop, phone and short-height landing layouts.
- Supply a meaningful text description and captions if narration is used;
  keyboard controls and focus must remain usable. Failed/blocked media must not
  hide the page's actual product offer, privacy link or navigation.

### Film acceptance and evidence

- [ ] Owner approves the finalized UI capture baseline before screenshots/handoff.
- [ ] Sanitized screenshots and approved media are complete, indexed and kept
  outside Git; the designated `gpt-6.1-sol` brief/model choice is recorded.
- [ ] Storyboard/animatic and title/social/audio/format decisions receive owner
  approval before final production; required rights are recorded without PII.
- [ ] The film demonstrates the actual drop -> analysis -> choose one -> build
  -> review -> render -> download sequence and a clearly external sharing ending.
- [ ] Screen angles, cursor actions, selected-clip continuity, titles and result
  are polished, readable and consistent with the approved UI/design system.
- [ ] No invented feature, universal platform claim, false real-processing
  proof, private content, credential or publishing action enters the film.
- [ ] Editable source, approved master/web rendition and static fallback exist;
  measured file/decode/landing performance stays within the agreed budget.
- [ ] Desktop/phone/short-height, keyboard, reduced-motion, mute/audio, autoplay
  restrictions, media-error and cleanup checks have actual recorded evidence.
- [ ] Owner signs off the final film and landing placement; every unfinished
  capture, rights, render, accessibility or integration gate remains unchecked.

## Standalone implementation context

- The later 2026-10-01 owner revision requires CL-004's single dynamic
  workspace/design-system correction now, not here. Validate/refine that
  implemented flow in this whole-product pass; do not restore the rejected
  multi-panel/equation UI.

- Owner decision on 2026-10-01: CL-002 is approved only as an interim baseline
  so functional work can proceed. Include the owner's later visual-feedback
  round and substantial refinements here once the complete flow exists. This
  deferral does not waive baseline accessibility/responsiveness in feature
  tickets or public-release checks.

- Feature tickets own baseline accessibility/responsiveness. CL-013 is the
  consolidated whole-flow pass after every screen exists; it fixes cross-screen
  inconsistencies, interaction gaps, focus loss, layout collisions, and
  measured performance issues.
- One semantic component tree and one reducer/state authority remain. Responsive
  modes change composition/density/affordances, not product capability or logic.
- Target WCAG 2.2 AA. Automated checks are necessary but cannot replace manual
  keyboard, screen-reader, zoom, forced-colors, motion, media, and automatic-review behavior.
- The required anchors include 320×568, 390×844, 768×1024 portrait/landscape,
  1024×768, 1280×800, 1440×900, 1920×1080, 2560×1440, heights 600–700,
  intermediate drag resizes, and 200% zoom/text spacing.
- Performance work must be evidence-driven. Do not add speculative memoization,
  caching, persistence, duplicate device implementations, or new dependencies
  simply to reduce a metric.

## Dependency evidence required

CL-012 must show that every public route/feature is present behind the final
security/availability controls and that repository-owned security/privacy
findings are resolved. Use the approved CL-002 design direction and the actual
complete CL-004–CL-011 flow; do not audit placeholder or alternate mock screens.
Complete quality corrections and obtain final visual approval before the film
capture gate above; CL-002's interim approval is not that final capture approval.

## Files and areas owned

- Cross-flow frontend styles/tokens/motion and targeted component/hook fixes.
- Accessibility/responsive/fake-flow E2E checks and the manual evidence record.
- Measured bundle, loading, media preview, transcript, clip review, polling, and
  interaction performance corrections.
- Minimal backend/media corrections only when a measured user-facing timing or
  cancellation problem is traced there.
- Landing product-film capture/brief, editable composition project, sanitized
  local artifacts, player/poster integration and film verification evidence.

## Scope boundaries

### In scope

- Landing, local intake/preparation, analysis, candidate review, assembly, automatic clip review, local export,
  result, errors, expiry, and clear at every named layout anchor.
- Semantic landmarks/headings/forms/lists/tabs/dialogs/drawers/media;
  accessible names/descriptions; focus entry/return/order; live regions; error
  summaries; candidate/evidence and playback keyboard patterns.
- Safe-area insets, virtual keyboard, orientation, text-spacing overrides,
  short height, intermediate widths, no horizontal page scroll, and no hidden
  primary/Clear/privacy action.
- Reduced motion, high contrast/forced colors, color-independent state,
  non-autoplay media, accessible transcript alternative, and safe announcements.
- Lazy loading and render/update discipline for heavy PDF-none/media/vision-
  unrelated browser code, transcript lists, preview overlays, polls, timers, and
  asset URLs based on measured/structural evidence.
- The explicitly owner-requested landing product film after UI finalization,
  under the production, privacy, rights and playback gates above.

### Out of scope

- Product redesign, new features, new provider calls, desktop-only or mobile-
  only workflow, native mobile app, automated WCAG certification, deployment,
  or rewriting correct modules for stylistic preference.
- Re-running external live/provider/cloud checks unless a specific correction
  requires the smallest relevant owner-authorized observation.
- Social account connections, direct publishing, real social uploads, or paid
  video-generation/media services. External-sharing visuals add no app feature.

## Implementation checklist

### 1. Responsive and short-height audit

- [ ] Execute every signature/failure/recovery screen across named viewport,
  orientation, height, zoom, and intermediate resize anchors.
- [ ] Preserve preview, evidence, automatic composition summary, render,
  download, clear, privacy, and errors at every width.
- [ ] Fix overflow, clipped sticky/fixed panels, nested scroll traps, layout
  shifts, safe-area collisions, drawer/tab state resets, and virtual-keyboard
  obstruction using shared composition—not separate product trees.

### 2. Keyboard, focus, semantics, and assistive technology

- [ ] Verify one logical `h1`, landmarks, skip link, field labels/instructions,
  button/link semantics, tabs, dialogs/drawers, notices, and media controls.
- [ ] Test candidate/evidence navigation, playback, automatic clip facts, render
  confirmation, download, and clear without pointer; verify excluded editor and
  assistant controls are absent.
- [ ] Move focus deliberately after stage/error transitions, restore it from
  dialogs/drawers, avoid traps, and keep disabled prerequisites explained in
  visible adjacent text.
- [ ] Use polite coarse stage/progress announcements, assertive blocking errors,
  and copyable content-free request/rule references without chatty polling.

### 3. Visual/motion/media accessibility

- [ ] Prove WCAG AA contrast, visible independent focus ring, ≥44×44 targets,
  color-independent meaning, 16 px phone form text, and forced-color resilience.
- [ ] Remove translation/inertia/animated crop/repeated activity under reduced
  motion; keep state understandable with static or sub-100 ms opacity feedback.
- [ ] Ensure video never autoplays with sound, controls remain accessible, and
  transcript provides the text alternative even though export has burned-in
  captions.
- [ ] Verify captions, faces, visual cards, controls, and focus do not
  overlap at zoom/text-spacing/light/dark fixture extremes.

### 4. Measured performance and lifecycle

- [ ] Measure production bundle/routes, initial sample-to-candidate timing,
  automatic-review playback, transcript rendering, asset/media loading, polling, and
  preview behavior with a documented environment.
- [ ] Lazy-load heavy feature code only at its stage; avoid repeated full-array
  scans/serialization on high-frequency playback/poll events where structurally
  evident.
- [ ] Verify object URLs, media/listeners/timers/animation frames, observers,
  fetch/poll controllers, drawers, and playback state clean up on every stage/
  clear/unmount path.
- [ ] Add focused regressions for every material issue corrected.

## Acceptance criteria

- [ ] The complete signature and recovery flow works at every named viewport,
  short height, intermediate resize, 200% zoom, and text-spacing override with
  no horizontal page scroll or lost action/content.
- [ ] Keyboard-only and Windows screen-reader coverage completes the signature
  flow, including candidate/transcript evidence, dialogs, media review,
  render, result, and clear with correct focus/announcements.
- [ ] Automated accessibility checks report no critical/serious issue; every
  remaining lower-severity finding has a disposition.
- [ ] Reduced motion and forced colors preserve meaning and usability; no flash,
  autoplay-with-sound, or color-only status remains.
- [ ] Sample reaches candidates within the product goal in the recorded
  production-like test, and bundle/review/media performance has no unresolved
  measured release blocker.
- [ ] Every correction has focused regression coverage and no duplicate device
  implementation/state authority is introduced.
- [ ] The landing film passes every film acceptance item above after final UI
  approval; a placeholder, storyboard or model handoff alone is not completion.

## Focused verification

- [ ] Run automated accessibility/component/flow/fake E2E checks in a production
  build with network/providers disabled.
- [ ] Complete and record the full responsive/accessibility matrix, including
  intermediate resize, 200% zoom, text spacing, keyboard, screen reader,
  reduced motion, forced colors, slow network/offline, and visibility changes.
- [ ] Record sample timing, bundle/route output, automatic-review interaction evidence,
  and any before/after material performance correction.
- [ ] Re-run only live/manual states strictly needed by a fix and only with
  explicit authorization.
- [ ] Review exported film frames at each storyboard beat, cursor/click timing,
  title readability and selected-output continuity; record owner disposition.
- [ ] Check the integrated film's responsive framing, keyboard/media controls,
  poster/failure/reduced-motion fallback, silent loading and measured performance.
- [ ] Run repository format/lint/typecheck/unit/build/fake E2E,
  `git diff --check`, and final status review.

## Documentation updates

- Add one sanitized manual quality matrix with viewport/state/finding/fix/
  verification/remaining-blocker rows.
- Update approved design tokens/components only when corrections reveal an
  actual system-level issue; synchronize CL-002/parent if material.
- Record performance environment/metrics and keep user/provider content out of
  screenshots and traces.
- Record capture baseline, approved storyboard/title copy, composition/render
  workflow, asset rights, deliverable metadata and owner film/integration review.

## Owner gates and external blockers

Final visual/editorial feel and screen-reader/browser/media
observations may require owner review. Record engineering evidence separately
and never convert missing human/runtime evidence into a pass. This ticket does
not authorize a live provider call.
UI capture approval, screenshot/media/music/brand rights, authoring handoff,
animatic approval and final film sign-off are separate gates. Local code/media
production may proceed only within its approved rights/budget; external services,
uploads, account access, publication and deployment require separate approval.

## Privacy, provider, and cost constraints

Use fake mode and synthetic/rights-approved assets. Performance/a11y tools,
screenshots, traces, and browser logs must contain no private media, transcript,
credential, signed URL, object name, provider content, or account identifier.

## Commit boundary

Keep the consolidated experience-quality audit and its direct corrections in
`CL-013: complete the experience quality pass`, including the explicitly scoped
landing product film. Do not introduce unrelated
redesign/features or absorb the release audit/deployment. No Git or external
action is authorized by this packet alone.

## Precision references

- [Responsive screen behavior](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#6-screen-by-screen-experience)
- [Visual responsive and motion rules](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#188-motion)
- [Accessibility requirements](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#19-accessibility)
- [Frontend and E2E verification](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2012-frontend-component-and-flow-tests)
- [Manual matrix](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2014-manual-responsiveaccessibility-matrix)

## Later owner Privacy brevity follow-up — 2026-10-03

Subsequent narrow label feedback removes only `· sample only` from the landing
animation header, leaving `Illustrative flow` in `process-narrative.tsx`. No
animation, sample-input path or processing behavior changes. Fake mode remains
API-free illustrative/fixture output; real Gemini requires the existing keys,
live flags and approvals. Focused page regression and formatting/diff checks
passed; the rendered label was verified in the local browser. No new test,
provider/cloud call or Git action was needed.

The owner requested at most three points with short descriptions. Updated the
shared `apps/frontend/src/app/privacy-dialog.tsx`, its existing
`apps/frontend/src/app/page.test.tsx` regression, and the source-of-truth owner
privacy revision. The panel now combines temporary storage and Clear in one row;
the other rows cover no reuse/publishing and Gemini transfer/separate retention.
The intro is shorter. Exact retention timings stay in the owning policy and
processing disclosure; no storage, consent, cleanup, live gate or modal behavior
changed. Copy still distinguishes fake, local-only and cloud-enabled modes and
avoids promises to delete downloaded copies or delete cloud files immediately.

Existing frontend tests passed (314 tests in 33 files), followed by the settled
focused page regression (11 tests). Frontend lint, root formatting and diff
checks passed. This copy-only follow-up did not repeat root typecheck/build or
paid/cloud tests; earlier results remain tied to their recorded revisions.
Read-only review found no actionable issue in this narrow change.

Browser checked landing and workspace, three rows, initial Close focus, button
close and Escape focus return. At 1280×800 and 390×844 the complete shortened
panel fits; phone dialog client/scroll height is 656px, width/scroll width 354px.
Synthetic screenshots are ignored in
`artifacts/qa/cl013-privacy-brief-20261003/`. Viewport override was reset and the
updated panel left open in the owned review tab; the owner's other tab and app
processes were preserved. No real media, credential, provider/cloud call or Git
mutation occurred. Fake mode needs no keys; actual Gemini still requires keys,
live flags and the existing approvals. Cloud sample setup, real media/device,
owner visual, film and release evidence remain unchecked.

## Later owner lighter-workflow background — 2026-10-03

The owner requested a brighter workflow background matching the landing's blue
atmosphere. Changed only the `.workspace` background in `sample.module.css`:
two static radial glows and a gradient fitted to the single-screen workflow keep
the lower edge blue instead of nearly black. The source of truth and workflow
design plan record this refinement. Glass opacity, opaque reading surfaces,
layout, controls, handlers and provider/media gates are unchanged.

Settled root format/lint/typecheck/unit/build checks passed: **680 tests in
69 files**. Production inventory: 1,277 files, 26 external package links,
21,954,748 bytes, SHA-256
`a1ee22553d21bf360089d43ae588cb0d7c5d975e184c7233804f395d976bf2af`.
The existing Windows self-contained release gap and renderer warning remain.
No test or dependency was added for this background-only revision.

Browser checked intake, waiting source preview, explicit fixture analysis,
candidate selection and fixed clip review. Intake, selected candidate and clip
review each fit all eleven planned viewport anchors without horizontal or root
height overflow. Desktop/phone captures show the lighter shell and unchanged
navy reading panes. A simultaneous full-strength glow calculation with backdrop
saturation/contrast and white sheen estimated secondary-copy contrast at 5.90:1
on the frame, 4.50:1 on the intake surface and 4.65:1 on the header. This synthetic
CSS calculation is not actual-media, physical-display or complete accessibility
certification. Forced-color and reduced-transparency overrides remain in place.

Read-only validation reviewed this narrow background/docs follow-up and nearby
shared frame/header/fallback rules at HEAD
`5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1`; index empty. Earlier CL-013 visual
corrections and CL-016 source/sample work remain preserved and are excluded from
this revision's claim. Verdict: **Meets ticket with concerns**, with **no
actionable local findings**; human visual acceptance and the existing runtime/
media/cloud/film/release gates remain open. No new listeners, timers, requests,
media URLs, models, weights or cleanup responsibilities were introduced by CSS.

Synthetic evidence is ignored under
`artifacts/qa/cl013-lighter-workflow-20261003/`. Fake mode works without API keys
and uses simulated previews/results with Download disabled. Real sample reads
still need ADC/cloud setup; Gemini needs keys, enabled live flags and existing
rights/data/spend approval. No actual media, credential, paid/cloud call, film,
deployment or Git mutation occurred during this revision.

## Later owner mobile landing branding — 2026-10-03

`page.module.css` hides the separate hero brand row at the existing mobile
47.5rem breakpoint and shows the navbar wordmark with compact, nonwrapping
spacing. The scoped header rule also wins over the later narrow-screen text
hiding rule; desktop hero identity and the footer remain unchanged. Removed
unused mobile sizing for the now-hidden hero mark. The source of truth records
the owner's presentation decision. No JSX, handler, route or provider change.

Browser checked widths 320, 360, 368, 390, 599, 760, 761, 768 and 1280px. Mobile
hero branding is hidden through 760px, the navbar name stays visible, and the
desktop hero brand returns at 761px. No horizontal or navbar overflow occurred.
The first measurement found the existing mobile Privacy target only 36–40px
wide; a 44px minimum fixes that confirmed issue without hiding an action. All
visible header targets now measure at least 44px in both dimensions. Privacy
open/Close/focus return was verified. Viewport override was reset and the owned
landing tab left open; the owner's other tab and running services were preserved.

Verification: 11 existing page tests, settled frontend production build, root
formatting and diff checks passed. Build inventory: 1,277 files, 26 links,
21,954,772 bytes, SHA-256
`f56dac2bfa21afbd7a825eaa0bfda098ba33423ea0b4a526632ff236441ba312`;
the existing Windows self-contained release limitation remains. No new test was
added for CSS-only presentation, and root unit/lint/typecheck were not repeated
for this revision. Earlier 680-test evidence belongs to the background revision.
Synthetic screenshot and geometry: `artifacts/qa/cl013-mobile-branding-20261003/`.

Read-only review of this CSS/authority follow-up and neighboring narrow-screen
rules at HEAD `5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1` found no actionable
local finding; index remains empty. Fake mode needs no keys and still shows
simulated results. Real Gemini needs keys, enabled live flags and existing
approvals; ADC/cloud sample, actual media/device, owner visual, film and release
gates remain unchecked. No Git, real media, paid/cloud action or local AI model/
weights/runtime was involved.

## Later owner mobile workflow readability — 2026-10-03

The owner identified the stacked/cramped `/start` navbar and undersized intake
details. `sample.experience.tsx` wraps the wordmark and gives the home link an
explicit accessible name. `sample.module.css` hides that wordmark below 600px,
scales the mark to 44px with proportional strokes, and keeps Privacy/Clear media
alongside it with 44px targets. Removed the old sub-480px stacked-header and
matching frame-height override. The normal mobile frame calculation now applies.

Input format, simulated-input note, recommended/maximum/final-clip details,
input guidance, mode notice and source-preview explanation share a mobile
`clamp(0.875rem, 3.9vw, 1rem)` size and 1.6 line height. This measures 14px at
320px, 15.327px at 393px and 16px at 430px. Source captions/composition, controls,
processing, consent, expiry and cleanup handlers are unchanged. The source of
truth records this workflow-specific direction; landing mobile branding remains.

Verification: settled root format/lint/typecheck/unit/build and diff checks
passed, **680 tests in 69 files**. Production inventory: 1,277 files, 26 external
package links, 21,954,805 bytes, SHA-256
`9857372aec61a84e30911aa4c3abb9cf68e6159789470b35ebbd02ece6abdcd3`.
Existing Windows self-contained release limitation and renderer warning remain.
No new dependency, test, font, animation, blur layer or provider call boundary.

Browser checked intake, source preview with Clear media, selected candidate and
clip review at 17 anchors: all eleven prior sizes plus 360×640, 393×852, 430×932,
479×800, 599×844 and 600×800. Header actions fit on one row with targets at least
44px; no root horizontal/height overflow. The source explanation fits its media
surface. On short phones, the existing content pane scrolls; keyboard End brought
the complete input guidance into view at 320×568. The full fake journey reached
simulated delivery with Download disabled and Start over returned to intake.
A subsequent preview verified Privacy/Close/focus return and Clear media returning
to intake. Viewport override was reset; owned intake and healthy services remain.

Read-only validation of this narrow markup/CSS/authority change and neighboring
header/frame/source rules at HEAD `5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1`
found **no actionable local findings**. Verdict: **Meets ticket with concerns**;
owner visual, physical devices, screen readers, full zoom/text-spacing/media,
cloud/film/release gates remain unverified. Earlier CL-013 and CL-016 work is
preserved outside this follow-up's claim. Index remains empty; no Git mutation.

Ignored synthetic captures and geometry:
`artifacts/qa/cl013-mobile-workflow-readability-20261003/`. Fake mode works with
no API keys and uses fixtures; real sample reads need ADC/cloud setup and Gemini
needs keys, enabled live flags and existing rights/data/spend approvals. No
real media, credential, paid/cloud call or local AI model/weights/runtime was used.

## Later owner shared navbar and workflow width — 2026-10-03

The owner requested that the workflow navbar and main card match the landing
navbar's dynamic width. The landing was already responsive, capped at 80rem;
the workflow used 74rem and different phone gutters. Four owning stylesheets
now consume `--cb-content-max` and `--cb-page-gutter` from `styles/tokens.css`:
`app/page.module.css`, `features/sample/sample.module.css` and
`shared/ui/workflow.module.css`. Shared gutters preserve the landing's 1.5rem,
1rem through 58rem and 0.75rem through 47.5rem rules. A stable root scrollbar
gutter removes the reproduced 4px difference between long-page navigation and
the bounded workflow. The source of truth and design plan record this direction.
No markup, handler, state, media-composition, provider or cleanup logic changed.

Geometry checks cover 22 anchors: the previous 17 plus 760×844, 761×844,
928×800, 929×800 and 1366×768. Both navbars and the workflow frame match in
left/right edges and width. At 1366px they are 1280px wide, starting at 41px;
at 1280px they are 1228px wide, starting at 24px; at 393px they are 365px
wide, starting at 12px. Intake, source preview, selected candidate and clip
review retain fitting header actions of at least 44px and no root overflow.
The complete fixture journey reaches simulated delivery with Download disabled;
Start over returns to intake. Short-phone guidance, Privacy focus return and
Clear media were checked against the shared shell. Synthetic evidence stays
ignored in `artifacts/qa/cl013-shared-width-20261003/`.

Settled root `corepack pnpm format:check`, `lint`, `typecheck`, `test:unit`
and `build` passed, with **680 tests in 69 files**; `git diff --check` passed.
Production inventory: 1,277 files, 26 external package links, 21,955,009 bytes,
SHA-256 `83a8788a18a8d3a9dc9ff8867dcd40fb817883bd69faaa74a1d1f681748a26c2`.
The existing Windows self-contained release limitation and renderer warning
remain. No new test, dependency, font, animation or blur layer was added for
this reversible shared-layout change.

Read-only validation of this width/token/documentation follow-up and neighboring
responsive rules at HEAD `5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1` found
**no actionable local findings**. Coverage includes dynamic sizing, identical
shell geometry, breakpoint edges and preserved fixture controls. Verdict:
**Meets ticket with concerns**, because owner visual acceptance, physical devices,
screen readers, full zoom/text spacing, actual media, cloud/film/release evidence
remain unverified. Earlier CL-013 and CL-016 work remains outside this revision's
claim. Index stays empty; changes remain unstaged and uncommitted for review.

Fake mode works without API keys and uses simulated previews/results. Real
retained sample reads still require ADC/cloud setup, and Gemini needs keys,
enabled live flags and rights/data/spend approvals. No local AI model, weights
or runtime was used. No real media, credential, paid/cloud, deployment or Git
mutation occurred. Viewport override was reset; owned intake and healthy local
services remain available for owner review.

## Later owner conditional workflow footer — 2026-10-03

The owner requested no footer strip without a CTA. Intake reproduced a 25px
empty footer at the normal review size. `shared/ui/workflow.module.css` now
hides a footer without a button or actionable link; disabled CTAs still count.
This follows the rendered actions without duplicating stage conditions.
`features/sample/sample.experience.tsx` moves availability-only notices into the
card content, supplies null footers there, and retains Retry connection in the
failure footer. All notices, handlers, gates and existing CTA behavior remain.
The source of truth records the presentation decision.

Browser intake and source preview were checked at all 22 shared-width anchors:
intake footer height is zero; preview retains both CTA buttons and its footer.
No root overflow was observed. The fake journey verified Cancel during processing,
no footer for unselected choices, Proceed after selection, Confirm export in
review, Start over in simulated delivery, disabled Download, and no footer while
clearing. Start over returned to intake. Ignored synthetic captures/geometry:
`artifacts/qa/cl013-conditional-footer-20261003/`. Viewport override was reset;
the owned intake and healthy local services remain running for review.

Settled root format/lint/typecheck/unit/build and diff checks passed:
**680 tests in 69 files**. Production inventory: 1,277 files, 26 external links,
21,955,173 bytes, SHA-256
`6dd1647d5cef9163d5f3f2b065fd1d3503eaed4dd185e73baf09adcfaa8b4701`.
Existing Windows self-contained release limitation and renderer warning remain.
No new test, dependency, listener, timer, request or media URL was introduced.

Read-only validation of this narrow CSS/notice-placement follow-up and neighboring
footer rules at HEAD `5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1` found
**no actionable local findings**. Footer visibility, preserved notices, active
and disabled actions, responsive geometry and fixture reset are covered.
Verdict: **Meets ticket with concerns** for broader owner visual, physical-device,
screen-reader, full zoom/text-spacing, actual-media, film/cloud/release evidence
still unverified. Earlier CL-013/CL-016 work is preserved outside this revision's
claim; index is empty and no Git mutation occurred.

Fake mode works without API keys and uses simulated previews/results. Real
sample reads require ADC/cloud setup; Gemini needs keys, enabled live flags and
existing rights/data/spend approvals. No local AI model/weights/runtime, real
media, credentials, paid/cloud calls or deployment was used.

## Later owner compact mobile navbar — 2026-10-03

The owner requested a smaller, dynamically sized logo and CTAs in the mobile
workflow navbar. `features/sample/sample.module.css` now uses a shared mobile
`clamp(2rem, 8.2vw, 2.375rem)` size for the visible mark and button pills,
with labels at `clamp(0.75rem, 3.3vw, 0.875rem)`. The mark is centered in its
existing 44px home target; each button paints its smaller pill through a
noninteractive pseudo-element while retaining its 44px target and focus ring.
Shared colors, edges and hover treatments remain. Desktop sizing, navbar/card
widths, mobile detail typography, footer visibility and handlers are unchanged.
The source of truth records this refinement of the earlier 44px visible mark.

Intake and source preview with both Privacy/Clear media were checked at all
22 shared-width anchors. Headers remain on one row with 44px targets, fitting
actions and no root overflow. Visible logo/pill heights match within rounding;
the mark measures 32px at 320px, about 32.22px at 393px, 35.25px at 430px and
38px from 479px through 599px. Labels measure 12px at 320px and about 12.97px
at 393px, capped at 14px. The existing desktop treatment returns at 600px.
Privacy open/Close/focus return retained its 3px focus ring; Clear media returned
the fixture preview to intake. Captures and geometry stay ignored under
`artifacts/qa/cl013-compact-mobile-nav-20261003/`. Viewport override was reset
and the owned intake and healthy local services remain available for review.

Settled root format/lint/typecheck/unit/build and diff checks passed:
**680 tests in 69 files**. Production inventory: 1,277 files, 26 external links,
21,955,968 bytes, SHA-256
`93c08528f00bbd60d263c680046dd2aa6e12bdd174080c1ca6436020aaf73fd0`.
The existing Windows self-contained release limitation and renderer warning
remain. No new test, font, dependency, blur layer, animation, listener or timer
was introduced for this CSS-only refinement.

Read-only validation of this narrow CSS/authority follow-up and adjacent shared
button, mark and fallback rules at HEAD
`5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1` found **no actionable local
findings**. Covered: fluid paint/label sizes, aligned marks/actions, retained tap
targets/focus/click behavior, breakpoint edges and unchanged desktop treatment.
Verdict: **Meets ticket with concerns** for owner visual approval, physical
devices, screen readers, complete zoom/text-spacing/preferences, actual-media,
cloud/film/release evidence still unverified. Earlier CL-013/CL-016 changes are
preserved outside this revision's claim. Index stays empty; no Git mutation.

Fake mode works without keys and uses simulated previews/results. Real sample
reads still require ADC/cloud setup; Gemini requires keys, enabled live flags
and existing rights/data/spend approvals. No local AI weights/runtime, actual
media, credentials, provider/paid/cloud calls or deployment were used.

## Later owner mobile candidate-panel border and spacing — 2026-10-03

Reproduced the owner's screenshot in the selected candidate's mobile Transcript /
Agentic Notes panel. The below-600px rule removed the left border and all side /
bottom padding: at 393×852 the tabs started flush at the panel's left edge.
`features/sample/sample.module.css` now inherits the continuous shared 1px border,
uses 8px padding on all sides and an 8px tab/body gap. Restoring the inset exposed
tab wrapping at 320px; mobile-only tab gap/padding were reduced so both labels
remain on one row with their existing 44px targets. No component, selection,
playback, provider or session logic changed.

Both tabs were measured at 320×568, 360×640, 393×852, 430×932, 599×844,
600×800, 768×1024 and 1366×768. Mobile panels retain all four borders and equal
insets; labels fit, and neither pane nor root has horizontal overflow. Existing
desktop/tablet padding and wrapped tabs remain. At 320×568, keyboard Home /
ArrowRight changed tabs and End reached the bottom of both internal scrollers.
Note seeking reached 00:54, switching selected moment 2 and pausing worked,
and Proceed reached read-only clip review. Confirm export reached simulated
delivery with Download still disabled, and Start over returned to intake.
Synthetic screenshots and geometry
stay ignored under `artifacts/qa/cl013-mobile-candidate-panel-20261003/`.

Settled `corepack pnpm format:check`, `lint`, `typecheck`, `test:unit` and
`build` passed, with **680 tests in 69 files**; `git diff --check` passed.
Production inventory: 1,277 files, 26 external links, 21,956,110 bytes, SHA-256
`c7b1ea1d26792d97e3c015dd692392f3e081be221cf925bda03aa0b65c152a28`.
The existing Windows self-contained release limitation and renderer warning
remain. Post-build health, `/start` and `/api/sample/config` return 200.
No new test, dependency, listener, timer or media URL was introduced.

Read-only validation of these mobile candidate rules and neighboring panel,
tab, focus, scrolling and breakpoint rules at HEAD
`5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1` found **no actionable local
findings**. Verdict: **Meets ticket with concerns** for the wider pending gates.
Broader owner visual, physical-device, screen-reader, full zoom/text-spacing,
actual-media, cloud/film/release evidence stays open. Fake mode works without
keys through simulated previews/results; real sample reads require ADC/cloud
setup and Gemini needs keys, live flags and rights/data/spend approvals. No
local AI weights/runtime, real media, credentials, paid/cloud calls or Git action.
Earlier CL-013/CL-016 edits remain outside this narrow correction's claim;
index is empty and changes remain unstaged. The viewport override was reset and
healthy local services remain running for owner review.

## Later owner mobile footer CTA sizing — 2026-10-03

Reproduced stacked source-preview actions at 320×600: desktop-sized button
labels/padding plus the gap needed about 324px inside a 258px action row. The
last-button auto margin aligned Find moments on a second row. In the owning
`features/sample/sample.module.css`, mobile footer labels now scale from 12px
to 14px, horizontal padding from 8px to 14px and gaps from 8px to 12px.
Both full labels fit on one row at the checked phone widths, with unchanged
44px minimum targets. Natural wrapping remains available for expanded text;
single CTAs remain right aligned and desktop styles remain unchanged.

Source preview passed 320×568, 320×600, 330×600, 360×640, 393×852,
430×932, 599×844, 600×800, 768×1024 and 1366×768: one row, full labels,
44px targets and no root overflow. At 320×600, footer height fell from 125px
to 69px. Both CTAs retain 3px keyboard focus rings; Enter on Choose another
video returns to intake with no empty footer, and Enter on Find moments starts
the fixture journey. At 320×568, Proceed, Confirm export and Start over fit
with 44px targets. The journey reached simulated delivery with disabled Download,
then reset to intake. Ignored synthetic evidence:
`artifacts/qa/cl013-mobile-footer-ctas-20261003/`.

Settled root format/lint/typecheck/unit/build gates passed: **680 tests in 69
files**. Production inventory: 1,277 files, 26 external links, 21,956,263 bytes,
SHA-256 `b391ac17118083d5eadb182e7de1b7a9bc9bbd48717d993bfec1602c6687bdd5`.
Existing Windows self-contained release limitation and renderer warning remain.
No handler, gate, schema, dependency, timer, listener or media URL was changed.

Read-only validation of this narrow mobile CSS correction and neighboring
button/footer, focus, disabled and breakpoint rules at HEAD
`5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1` found **no actionable local
findings**. Verdict: **Meets ticket with concerns** for broader owner visual,
physical-device, screen-reader, full zoom/text-spacing, actual-media and
cloud/film/release evidence still open. Earlier CL-013/CL-016 edits are excluded
from this correction's claim; nothing was staged or committed.

Fake mode requires no keys and uses simulated previews/results. Real sample
reads need ADC/cloud setup; Gemini needs keys, enabled live flags and existing
rights/data/spend approvals. No real media, local AI weights/runtime,
credentials, paid/provider/cloud calls or deployment was used. Temporary viewport
overrides were reset; healthy local services remain running for owner review.

## Later owner contained candidate-selection motion — 2026-10-03

Reproduced the owner's escaping cards on 375×667 and 1366×768: native
document-wide view-transition snapshots bypassed the main/content/rail clips,
ghosting old/new portraits and painting the transcript or offscreen rail cards
over the footer. The owning `features/sample/use-moment-layout.ts` now uses its
existing local FLIP animation for all browsers. `candidate.review.tsx` and
`portrait-player.tsx` remove snapshot names, and `styles/tokens.css` removes the
unused global transition pseudo rules. The existing 640ms timing/easing, portrait
mapping, keyboard/focus, playback and domain actions remain. Selection changes
and unmount cancel local animations; no deferred snapshot callback remains.
The source of truth records the owner's containment rule.

Gallery, first pick and switching passed at 320×568, 375×667, 393×852,
599×844, 600×800, 768×1024, 900×600, 1024×768 and 1366×768: 27 measured
states, no root horizontal overflow, no named snapshots and painted card
intersections inside their ancestor clips. Eight in-flight captures each on phone
and laptop show local transforms still running without ghosting or footer overlap.
Closing to the gallery also works. Playback/pause, matching Agentic Notes and
rank-3 note seeking to clip 00:55 / source 02:55 passed. Rapid keyboard switching
wraps 3→1→2 correctly. Proceed during movement removes candidate surfaces cleanly;
read-only review, Confirm export, simulated delivery with disabled Download and
Start over still work. Synthetic captures/geometry stay ignored under
`artifacts/qa/cl013-contained-selection-20261003/`.

Settled root `corepack pnpm format:check`, `lint`, `typecheck`, `test:unit` and
`build` passed: **680 tests in 69 files**. Production inventory: 1,277 files,
26 external package links, 21,954,005 bytes, SHA-256
`3b3600d0d1a3403989517328586ea612a70e7a3aeeebbd401d5d79ab4f0bd7c7`.
The existing Windows `selfContained: false` release limitation and renderer
deprecation warning remain. Post-build health, `/start` and `/api/sample/config`
return 200. No new test, dependency, listener, timer, media URL, schema or
configuration/provider gate was introduced.

Read-only validation of this narrow motion correction, clipping ancestors and
selection lifecycle at HEAD `5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1`
found **no actionable local findings**. Verdict: **Meets ticket with concerns**
for broader owner visual approval, physical-device/screen-reader/full zoom and
text-spacing, actual-media, cloud/film/release evidence still open. The existing
owner motion-preference exception still needs public-release reconsideration.
Earlier CL-013/CL-016 edits remain outside this correction's claim. Index stays
empty; nothing was staged or committed. Temporary viewport overrides were reset,
and healthy local services remain running for owner review.

Fake mode works without API keys through simulated previews/results. Real sample
reads require ADC/cloud setup; Gemini requires keys, enabled live flags and
existing rights/data/spend approvals. No local AI weights/runtime, actual media,
credentials, provider/paid/cloud calls or deployment were used.

## Later owner adaptive candidate-detail cards — 2026-10-03

The owner marked surplus space around the laptop candidate preview and requested
simultaneous Transcript / Agentic Notes cards whenever they fit. Continued this
CL-013 visual follow-up at HEAD `5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1`;
earlier CL-013/CL-016 edits remain outside this correction's claim.

`features/sample/sample.module.css` narrows the surplus preview track and gives
the remaining width to the detail area. In `candidate.review.tsx`, a ResizeObserver
measures that area and disconnects on unmount, rather than detecting a device or viewport
category. At 35rem it fits two 17rem cards and a 1rem gap; narrower space retains
tabs. The threshold follows the root font size. Initial/server rendering and
unsupported ResizeObserver retain tabs. Both cards use shared reading surfaces,
headings and independent scrollers. Narrow mode renders only the active pane,
with unique tab/panel associations; wide mode uses labelled regions. Expanding
from a focused tab transfers focus to its pane; shrinking preserves a focused
pane or note action by selecting its tab. Playback, selected candidate, note
seeking/highlights and contained local motion keep their existing ownership.
No second video/player, observer polling, new dependency or provider gate was added.
The source of truth records this owner visual direction.

Measured 320×568, 375×667, 393×852, 599×844, 600×800, 768×1024,
799×700, 800×700, 900×600, 1024×768, 1099×768, 1100×700,
1280×720, 1366×768, 1440×900 and 1920×1080, plus eleven 768px-high
threshold observations at widths 1038–1045 and 1099–1101. No root or active-pane
horizontal overflow; phone content remains internally scrollable inside the frame.
At 1366×768 the detail area is about 743px, giving two equal 364px cards;
1024×768 uses tabs in about 548px. Actual border-box geometry makes the measured
35rem threshold switch around 1043px in this particular shell, without repeated
switching at the checked edges; it is not a hardcoded screen breakpoint.

Wide note seeking reached clip 00:54 / source 00:54 for rank 1 and source 01:54
for rank 2, highlighting the six matching transcript words. Shrinking while a
note button was focused retained that action and the Notes tab. Expanding from
the focused Notes tab moved focus to the notes scroller without losing the
playback position/highlights. At 320×568 Home switched back to Transcript;
both tab labels fit with 44px targets. First pick, candidate switching, pause
and Back to moments worked. In-flight portrait transforms still obey content/
rail/main clips, with no document-wide snapshots or footer overlap.
The fresh post-build fixture journey reached read-only review for rank 3, then
simulated delivery with the visible notice and disabled Download; Start over
reset the session. No candidate detail surfaces remain after leaving selection.
Ignored synthetic captures/geometry:
`artifacts/qa/cl013-adaptive-moment-details-20261003/`.

Focused existing sample/review regressions passed **34 tests in 2 files**.
Root format/lint/typecheck/unit/build passed: **680 tests in 69 files**.
Production inventory: 1,277 files, 26 external package links, 21,957,629 bytes,
SHA-256 `923ac61e2a8d1bf786fa65be96cf85fa67ca21c1eec504757d9d0178ef315805`.
The existing Windows `selfContained: false` release limitation and renderer
deprecation warning remain. Post-build health, `/start` and `/api/sample/config`
return 200. No actual-media, credential or paid/cloud action occurred.

Read-only validation of these two source files, their owning authority/evidence,
tab/panel semantics, focus/seek/playback paths and observer/animation cleanup
found **no actionable local findings**. Verdict: **Meets ticket with concerns**
for the broader unchecked owner/manual/live/release gates below. No earlier
requirement or gate was weakened. No delegation or Git mutation occurred.

Fake mode works without keys through labelled synthetic previews/results; no
actual MP4 or live AI quality is proved. Real sample preview still needs the
separate ADC/cloud setup, and Gemini needs keys, enabled live flags and existing
rights/data/spend approvals. No local AI weights/runtime were used. Broader
owner visual approval, physical devices, screen readers, full zoom/text-spacing,
actual-media/cloud, film and release gates remain open. Nothing was staged or
committed; services remain available for owner review.

## Later owner phone clip-review carousel — 2026-10-03

The owner requested full-width phone slides in the order Video, Agentic Notes,
Transcript, dots below, no carousel arrows, and continuous finger-following
movement. Continued this CL-013 follow-up at HEAD
`5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1`; earlier CL-013/CL-016 changes
remain outside this correction's claim.

`features/sample/clip-review-layout.tsx` owns one shared layout for
`clip.review.tsx` and `cloud-clip.review.tsx`. `sample.module.css` uses native
horizontal overflow and mandatory scroll snapping below 600px. The browser owns
drag tracking, momentum and release snapping; no touch handler, pointer capture,
gesture threshold, transform animation or scroll-preventing listener was added.
Player pointer handlers reveal controls without preventing native pan. The seek
slider retains its ordinary scrubbing behavior. Notes/transcript retain their
independent vertical scrollers. Dots are named buttons with 44px targets, current
state and keyboard navigation; offscreen slides are inert. All slides stay mounted,
preserving the single player, playback position, pause and note highlights.
Tablet/desktop retain their existing review arrangement and delivery layout.

Browser checks reproduced focus loss when phone dots became hidden on expansion.
The correction transfers focus to the matching card after inactive restrictions
are removed. Shrinking from a focused note action selects its slide and preserves
that action. ResizeObserver disconnects on unmount; the fallback resize listener
is also removed. No new timer, media URL, request, dependency or provider boundary
was introduced.

Measured 320×568, 375×667, 393×852, 430×932, 599×844, 600×800,
699×800, 700×800, 768×1024, 900×600, 1024×768 and 1366×768.
Phone slides match the track width; dots/export remain visible, with no root or
text-pane horizontal overflow. Native horizontal input moved Video→Notes→Transcript
and back, settling at the measured offsets and updating dots. Native vertical
input scrolled Notes independently, with computed `touch-action: auto`.
Dot clicks and keyboard ArrowRight/Home/End, Tab access to export, resize focus,
continuous fake playback across slide changes, pause and note seeking to 00:54
passed. A fresh post-build rank-3 fixture journey verified assembly/review/export,
the simulated-delivery notice, disabled Download and reset; carousel surfaces
are removed on leaving review.
Synthetic captures and geometry stay ignored under
`artifacts/qa/cl013-phone-review-carousel-20261003/`.

Focused existing review regressions passed **24 tests in 2 files**. Settled root
format/lint/typecheck/unit/build passed: **680 tests in 69 files**. Production
inventory: 1,277 files, 26 external package links, 21,965,157 bytes, SHA-256
`c13dfef65351099c7cbd17db98afd1bd501bce9bb0530a229ac2c9d0dae596f6`.
The existing Windows `selfContained: false` release limitation and renderer
deprecation warning remain.

Read-only validation of the narrow layout, unchanged player/seek/access paths,
responsive semantics, focus handoff and cleanup found **no actionable local
findings** after correction. Verdict: **Meets ticket with concerns** for physical
finger drag/momentum, iOS/Android behavior, screen readers, full zoom/text spacing,
forced colors, actual media/cloud and broader owner/film/release evidence.
Browser native-scroll checks do not certify a physical phone gesture.

Fake mode works without keys through labelled synthetic previews/results; no
actual MP4 or live AI quality is proved. Real sample access still requires the
separate ADC/cloud setup; Gemini requires keys, enabled live flags and existing
rights/data/spend approvals. No local AI weights/runtime, actual media,
credentials, provider/paid/cloud action, deployment or Git mutation occurred.
Post-build health, `/start` and `/api/sample/config` return 200. The index remains
empty, temporary viewport overrides were reset, and healthy local services
remain running for owner review.

## Later owner independent phone moment-list scroll — 2026-10-03

Reproduced the reported clipping at 375×667 with rank 3 selected. At the left
list's actual scroll end, its 427px viewport exceeded the visible selected-moment
area (404.609px). The last time range extended 18.063px below the clip. Scrolling
the main pane from 0 to 55px exposed it, confirming that the two scroll areas were
incorrectly coupled. This was a measured defect, not a change to a working flow.

In `features/sample/sample.module.css`, phone `.previewMode` now establishes size
containment and caps its sticky moment list at `100cqh`, the actual visible
container height, replacing the screen-height estimate. Vertical overscroll
containment prevents reaching either list edge from scrolling the main pane.
Three CSS declarations change; no new component, state, observer, listener,
timer, request, dependency or provider boundary is introduced. The source of
truth records independent phone list scrolling and full final-choice details.
Earlier CL-013/CL-016 changes remain outside this correction's claim at HEAD
`5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1`.

Checked 320×568, 375×667, 393×852, 430×932, 599×844, 600×800,
768×1024, 900×600, 1024×768 and 1366×768. At the list end, the full final
choice/title/time range fits with the main pane at both its top and bottom;
measured bottom clipping is zero. Native extra list scrolling at its bottom
leaves the main pane at zero; extra upward scrolling at the list top preserves
the main pane's 55px position. No root horizontal overflow was observed.
Rank-2 switching also exposes the complete final rank-3 choice. Play/pause,
keyboard End selection, Notes, seeking to clip 00:55 / source 02:55, and Back to
moments passed. Gallery return removes selected-layout size containment.
Ignored synthetic before/after captures and geometry:
`artifacts/qa/cl013-independent-moment-list-20261003/`.

Focused existing candidate regressions passed **15 tests in 1 file**. Settled
`corepack pnpm format:check`, `lint`, `typecheck`, `test:unit` and `build`
passed: **680 tests in 69 files**. Production inventory: 1,277 files, 26
external package links, 21,965,193 bytes, SHA-256
`6611078da9dfdde78f91ca27578252cbf889d861fcbdf3bf12e3edb52b571591`.
The existing Windows `selfContained: false` release limitation and renderer
deprecation warning remain.

Read-only validation of the three declarations, sizing/clipping ancestors,
mobile media boundary, candidate lifecycle and authority/evidence found **no
actionable local findings** after correction. Verdict: **Meets ticket with
concerns** for broader owner visual approval, physical phones/touch, screen
readers, full zoom/text spacing, forced colors, actual media/cloud, film and
release evidence still open. No previous requirement or gate was weakened.

Fake mode works without keys using labelled synthetic previews/results; it does
not prove actual MP4 or AI quality. Real sample reads require separate ADC/cloud
setup; Gemini requires keys, enabled live flags and existing rights/data/spend
approvals. No local AI weights/runtime, real media, credentials, provider/paid/
cloud action, deployment, delegation or Git mutation occurred.
Post-build health, `/start` and `/api/sample/config` return 200. The index remains
empty, viewport overrides were reset, and healthy local services remain running.

## Later owner delivery layout follow-up — 2026-10-03

Owner requests Download MP4 beside Start over, a larger responsive result video,
removal of the repeated visible fake-download sentence, and platform marks/names
inside glass social buttons. The owner's later refinement places a bold centered
Soon overlay on each button, with the platform mark/name blurred behind it.
This local CL-013 follow-up
changes no social publishing capability or provider/storage gate. The source of
truth records the result-only exception to the older adjacent visible
fake-download explanation; a short screen-reader description stays associated
with the disabled action, and intake still labels simulated results.

`features/sample/clip-delivery.tsx` shares the inert social destinations and moves
the owning result component's download action into the existing footer using a
React portal. `sample.experience.tsx` supplies that footer node through
`result-preview.tsx` to `clip.review.tsx`, and directly to `cloud-result.tsx`.
The cloud component retains its existing access/decode/expiry checks, retry,
request status, temporary link cleanup and final transcript. No readiness state
or download handler is duplicated in the workflow. Standalone rendering retains
an inline action when no footer node is supplied. React owns portal removal;
reset was observed to remove the download and hide the empty footer.

`sample.module.css` gives the result portrait the freed card height, bounds it to
the real container dimensions, and gives its column more room. The social grid
adapts to its actual width, using four local inline SVG marks and existing button
and glass tokens; no remote logo requests or dependency were added. Phone action
sizes retain 44px targets and one row. The existing delivery regression in
`review-revision.test.tsx` checks the disabled action's new description, absence
of the old sentence and four unavailable destinations.

Focused existing review/output/candidate regressions passed **39 tests in 3
files**. Browser fixture delivery was checked across phone, tablet and laptop
sizes, with one footer download, disabled social buttons, no horizontal page
overflow, play/pause, End seeking, native phone scroll, refresh restoration and
keyboard Start over. Ignored screenshots and geometry are under
`artifacts/qa/cl013-delivery-layout-20261003/`.

Before the later overlay refinement, `corepack pnpm format:check`, `lint`,
`typecheck`, `test:unit` and `build` passed: **680 tests in 69 files**.
Production inventory: 1,277 files,
26 external package links, 21,965,631 bytes, SHA-256
`167bb64b11dd8909d9f8cc77d2a3169f55be0eb2b3d7f83f9817fc473d6b1692`.
The existing Windows `selfContained: false` release limitation and renderer
deprecation warning remain. Canonical health, `/start` and sample config GET
checks returned 200; healthy services were reused.

Read-only local validation compared the result-only owner decision, new shared
module, footer integration, fake accessible description and output guards with
the current source, focused regressions and browser states. **No actionable
local findings**; verdict **Meets ticket with concerns** for wider runtime/device/
media/assistive-technology/film/release evidence still open. Covered: shared fake
and real result wiring, one owned download action, output safety/status/transcript,
disabled destinations, responsive containment and reset cleanup. Unverified:
actual cloud MP4 playback/download and physical phones; no external or full-suite
work occurred during the read-only review itself. No domain guard or previous
finding was dismissed to satisfy the layout change.

The final overlay refinement retains each disabled button's platform-specific
accessible name; its blurred logo/name and bold Soon layer are decorative.
Browser observations confirm all four Soon layers are centered on their button,
weight 750, over `blur(2px)` content. Final responsive anchors: 320×568,
375×667, 393×852, 430×932, 599×844, 600×800, 768×1024, 900×600,
1024×768 and 1366×768. All have one download, four inactive destinations, one-row
44px footer actions, no root horizontal overflow and no button-content overflow.
The portrait grows with available space (252.891×449.578px at 393×852;
269.203×478.578px at 1366×768). Smaller phones scroll inside the bounded result
area; footer actions remain outside that scroller. Final synthetic screenshots
are `phone.jpg` and `laptop.jpg` beside the final `layouts.json`. The owned fixture
session was cleared, viewport override reset, and the QA tab retained at intake.
No new listeners, timers, requests, observer or provider state accompany the blur.

After this final refinement, all five settled root gates passed again, including
**680 tests in 69 files**. Final production inventory: 1,277 files, 26 links,
21,966,116 bytes, SHA-256
`af6950588ca34a509225f697f1342de8ad1f66878782bd035496d21bd5ec57c9`, eight app routes;
the existing non-self-contained Windows artifact limitation remains. Final local
read-only revalidation retained **no actionable findings** for this result/overlay
scope; broader unverified gates above remain. No files were staged or committed.

Fake mode uses synthetic previews/results without API keys and produces no MP4.
Real sample reads still need separate ADC/cloud setup; real AI needs Gemini keys,
enabled live flags and applicable rights/data/spend approvals. No real media,
credentials, paid/provider/cloud action, deployment or Git mutation occurred.
Actual media/device/assistive-technology, wider quality-matrix, owner visual/film
and release gates remain open. Earlier CL-013/CL-016 changes stay outside this
follow-up's claim at HEAD `5a3e4cc18b367a9ce2c8e7c0f05c2eedff0eb1d1`.

## Completion handoff

Report the matrix/evidence path, each material finding and fix, exact automated
and manual results, focus/screen-reader/motion/forced-color status, measured
performance and environment, changed files, checks, and every owner/runtime/live
observation still unchecked.
Also report capture baseline, authoring/model handoff, storyboard/animatic/final
film approval, local artifact locations, web/master/poster metadata, measured
landing impact, and every rights/editorial/audio/platform/integration item still
unchecked. No film or public-release approval is inferred from code checks.

</details>
