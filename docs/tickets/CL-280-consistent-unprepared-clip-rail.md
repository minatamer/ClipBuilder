# CL-280 — Consistent unprepared clip cards

Status: implemented and locally verified, 2026-11-11. Owner visual review pending.
Dependencies: existing portrait clip rail, shared BrandMark and readiness gate.
Preserve pending CL-276/278/279 changes in shared files; no Git mutation.

## Owner request and scope

The planning screenshot shows a collapsed clip card in the left rail because
there is no preview placeholder. Keep the ready-card silhouette while a clip is
not ready, with a softly faded ClipBuilder mark matching the current theme.
The attached image is a visual reference, not embedded document instructions.

- Reserve the exact existing portrait thumbnail slot for noneditable clips,
  including selected/queued/preparing/canceling/canceled/failed/exporting work.
  Reuse shared BrandMark and the same sizing rules as ready previews. Scale the
  decorative mark for the compact rail without clipping or overflow.
- Preserve clip names, real stage/error labels, selection, keyboard navigation,
  focus and ready-preview hover behavior. A placeholder is decorative, contains
  no duplicate loading label/spinner and never implies that failed work is busy.
- Preserve readiness guards: no video player, media fetch, source rendering or
  editable controls are introduced for unprepared work, including retained bases.
  Keep the actual processing screen/progress and explicit retry/cancel unchanged.
- Verify fake queued/preparing/failed and ready surfaces, unchanged slot geometry,
  compact layout, no unexpected/metered work, existing readiness/stage tests,
  frontend types, scoped lint/format and read-only validation. Capture laptop
  proof only; no phone/tablet screenshot, fullscreen or external browser.
- No real/provider/paid processing, owner-session/media/configuration changes,
  Voyagenda work, deployment or Git mutation. Reuse the running normal app.

The placeholder and synthetic checks work with FAKE_MODE=true and no API keys.
Real AI preparation still requires its configured provider/runtime, enabled live
flags and applicable approvals; those boundaries remain unchanged and untested.

## Implementation and evidence

- `clip-batch-panel.tsx` keeps its existing isLocalClipEditable gate and renders
  either the real ClipRailPreview or a decorative portrait slot with shared
  BrandMark. It adds no state, listener, player, request or processing action.
- `style.css` reuses the ready preview's aspect ratio, width, corners and compact
  sizing. A restrained navy surface and 28%-opacity mark supply the placeholder;
  a container query scales only the decorative mark in narrow slots. Real clip
  status, names, navigation, focus, retry/cancel and processing UI are unchanged.
- Six existing readiness/stage tests pass, including all lifecycle states in
  synthetic/provider modes with retained media. Frontend typecheck, scoped ESLint,
  final Prettier and whitespace checks pass. No implementation-mirroring test was
  added for decorative markup.
- Codex fake HTTP checks: preparing (with retained base/output), queued and failed
  all show the placeholder with zero videos, editing controls or source/clip-source
  reads. Failed still exposes its real failure message and Retry action. Ready
  removes the placeholder, mounts the normal paused preview/editor and retains
  keyboard rail selection. No processing/retry/export was triggered.
- Desktop placeholder and ready slots both measure 76.21875×135.5 CSS pixels.
  Compact geometry at 768 and 390 widths keeps the existing 32×56 slot and a
  14.953125px mark centered exactly, with no horizontal page overflow. These were
  DOM geometry checks only: no tablet/phone screenshots were taken.
- Laptop proof is outside Git. Refreshed only the already-authorized generated
  `04-ai-clip-preparation.jpg` in the existing Desktop portfolio folder and its
  index entry; the previous indexed hash was checked before replacement and all
  ten capture hashes verified afterwards. Other images remained intact.
- Final fake counts: zero edits/unexpected requests/plan/image/render calls.
  Source reads stay zero throughout nonready states; one clip-source read occurs
  after readiness. The owned fixture closes successfully; helper/cache, tabs and
  viewport overrides are cleaned up. Normal app/session and Voyagenda preserved.
- Read-only validate of CL-280 markup/styles/owning docs: **meets ticket, no
  actionable findings**. The pending CL-276/278/279 work in shared files was
  preserved and excluded from this scoped verdict. No dependency, security,
  provider/spend or readiness boundary changed.

Deviations: none. Live AI, hosted deployment and personal visual acceptance are
not proved by these fake checks. No paid run, configuration change, deployment,
staging, commit or push occurred.

## Owner local commit authorization — 2026-11-11

The owner now authorizes the file-level plan, staging and local ticket-prefixed
commits for the pending work. This supersedes earlier no-Git limits for this
batch only. Whole-file allocation, final checks and receipts are recorded in the
[commit plan](../operations/CL-278-283-FILE-COMMIT-PLAN.md). Final validation is
clean: 184 focused fake/paid-off cases, applicable types, scoped lint/format,
CLI syntax, dependency guards and whitespace checks. Prior visual evidence and
owner-only aesthetic/editorial/real-provider acceptance remain distinct. No
push, provider action, configuration change, Voyagenda work or deployment.
