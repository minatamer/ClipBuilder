# CL-238 — Apply contextual error placement throughout the app

Status: Implemented locally and validated, 2026-11-06. Personal physical-device,
assistive-technology and real-provider acceptance remain owner-only.

The owner explicitly extends CL-237 to the whole app: audit every error surface,
remove errors displayed at the top, and put each beside the field, failed media,
section or action that caused it. Preserve concise, accessible feedback and the
permanent AGENTS/source-of-truth rule. Dependencies CL-237 and earlier local
workflow/editor packets are implemented. Preserve all unrelated CL-225–237 work.

## Scope, acceptance and allocation

- Inventory all frontend routes/components that display errors, including local
  and hosted intake, moments/import/export, session/clip actions, every editor
  tab, preview/dialogs and full-view/legacy recovery. Record retained placements
  as well as changes; an unavailable whole view belongs in that failed view.
- Replace shared page/section-top message buckets with explicit owners. Upload,
  URL/resolution, analysis range, manual row/import, AI options, audio audition/
  upload, Motion and retry/export/reset feedback stays with its relevant UI.
  Do not move everything into a different generic footer bucket.
- Reuse shared concise inline feedback, accessible field descriptions and the
  existing tab issue indication. Hidden-owner errors must remain discoverable
  and must not show under a different clip, field, view or occurrence.
- Preserve input/caret, bounds, consent, Apply/processing guards, footer actions,
  provider isolation and retries. No workflow append, duplicated CTA or new
  processing. Errors must still be visible/announced and clear appropriately.
- Verify representative real component failures through injected fake/loopback
  transports, desktop/phone layout, focused tests, types/lint/format and a final
  execute/validate pass. Record any unverified physical-device/AT acceptance.

Allocate shared inline feedback, identified owning frontend components/styles,
focused regression fixtures/tests, frontend guide, authority clarification and
this ticket/index. No contracts, backend/native changes, owner media edits,
ignored configuration reads/changes, AI/provider calls, actual remote downloads,
Git mutation or deployment. Normal app remains running. Generated/fake/no-key
checks establish UI mechanics; live AI quality needs its separate owner setup
and approvals and is unrelated to this request.

## Audit inventory and delivered placement

| Surface | Delivered / retained owner |
| --- | --- |
| Main experience | Removed global notice. Upload failure is in Upload card footer, playback/jump failure by source preview, reset/save conflict by Start over / Reset options. A successful metadata load clears prior preview feedback. |
| YouTube acquisition | URL feedback is described by the URL input; resolution feedback by its selector; transfer/status/action feedback stays in its progress/card action area. Background progress polling has separate state and cannot overwrite URL errors. |
| Moments | Removed notice above tabs. Analysis validation/capture is by its range, bad manual ranges by their row, import by Import JSON, AI validation in AI options, request failures by Find moments / Use clips, timestamp export by Export Timestamps. Result counts remain ordinary results status. |
| Clip batch | Removed notice above rail. Retry/export/cancel/process failures appear at the corresponding action and are bound to the failed clip; export feedback hides while editing replaces export with Apply. |
| Main editor | Operation feedback routes to owning Hook, Text, caption generation, picture upload, audio upload or Filter controls. Only Apply/Reload failures use their action area. Hidden issues identify relevant main/sub-tabs and occurrence. |
| Audio | Failed audition message is on the failed sound card with an associated preview button. Upload feedback stays by Upload audio; validation stays in Your audio. Attempt/owner guards keep stale preview rejection from moving to a later sound. |
| Motion/Focus/Zoom | Shared compact feedback replaces local banner styling. Motion tracking failures stay with Track controls or the selected Motion controls. Camera capture feedback stays in Camera; parent Camera/People/Zoom/Motion validation identifies and appears only in its own Focus tab. |
| Text/caption/timing/filter fields | CL-237 content behavior retained. Caption words and numeric typography have brief inline descriptions; stable Font size / Outline width names allow correction. Caption Style errors do not appear in Position. Picture errors identify Image/Timing/Motion/Position and the affected occurrence/item; shared timing feedback describes range inputs and Capture. |
| Rename / image dialog | Retained errors beside the name field and inside the failed image preview. CL-233 dialog validation/focus behavior unchanged; no page-top error. |
| Media playback / delivery | Retained errors in failed editor/output/source media slots and their recovery actions. Sample portrait/result/cloud review fallbacks remain with unavailable media/output. |
| Demo limit notices | Removed document-body portal/fixed top toast. Existing dismiss/entrance/six-second lifetime retained in the manual/AI/results/process control that hit the bound. Component export name remains compatible. |
| Framework and legacy recovery | Framework error/global-error/not-found use a shared centered failed-view layout and existing recovery action/shared Button. Safe diagnostics unchanged. Legacy WorkflowRecovery/ConnectionFailureNotice already replace a failed stage or sit beside connection recovery; product-film fallback stays in its media. These retained paths need no generic top banner. |

The inventory covers frontend app routes and error/status renderers, including
components retained for older sample workflows. Existing non-error loading,
connection, setup and empty-state status remains in its own content/action slot.
No active `.flow-notice` renderer or styling remains. Shared `InlineFeedback`
escapes content and uses alert/status semantics without banner padding/background.

## Verification and review

- Thirty-nine focused cases pass across contextual feedback (13), Text validation
  (11), Text layer/render behavior (11), framework error privacy and workflow
  recovery (4). New cases cover safe announcements, reset association, caption
  word bounds/IDs/clocks, empty/invalid typography with stable labels, audio
  upload placement and demo notice ownership. A new test initially matched the
  hidden tab description instead of the visible audio error; corrected the
  assertion and reran the complete focused gate.
- Ticket-scoped ESLint, frontend `tsc --noEmit`, root `tsc --noEmit -p
  tsconfig.local.json`, scoped Prettier and `git diff --check` pass. The initial
  selection routing draft exposed React immutability/TypeScript narrowing issues;
  handler-local typed ownership fixed both before the final gate.
- Codex browser used actual app components in a separate generated fixture with
  deterministic fake/paid-off setup, generated MP4/PNG and injected loopback HTTP
  503 responses. Verified URL lookup and upload, manual/analysis/AI inputs,
  analysis action, reset, retry/export, caption word/font, picture upload, sound
  audition, filters and Focus error placement. No owner saved clip was edited.
- URL polling failure was observed overwriting the input error and fixed using
  independent progress feedback. Export initially used the generic process copy;
  bound it to the actual `/render` export action. Confirmed stale export feedback
  disappears while Apply owns the footer, correction keeps the accessible numeric
  field name, and Style/Camera errors do not leak into Position/People. The
  relevant hidden tab still identifies the issue, and Apply remains disabled.
- Generated layouts at desktop 1280px, tablet 768x1024 and phone 390x844 keep
  feedback beside its field without horizontal overflow. Intake was separately
  inspected at desktop/phone with upload and URL failures in their own cards.
  Screenshots are generated-only artifacts outside Git (`cl238-intake-errors`,
  `cl238-caption-field-error`, `cl238-phone-field-error`). Browser viewport reset
  and generated tabs closed after checks.
- The final transport action fixture recorded two injected 503 failures
  (export/retry), zero edits and zero unexpected requests. The final settled
  tab/responsive fixture recorded zero mutations/unexpected requests. Earlier
  generated upload/audition checks also stayed in their isolated fixture.
  All fixture listeners and scratch were closed/removed. Normal app ownership
  and read-only health/start/config readiness were rechecked; no restart needed.
- Final validate pass covers CL-238's current unstaged/untracked frontend,
  fixtures/tests, documentation and shared UI. Pre-existing CL-225–237 changes
  remain excluded from this ticket's claim. No actionable findings remain after
  the ownership/race/label/sub-tab corrections. No contract, backend, composition
  or native-worker behavior changed; dependency directions are preserved.

Generated fake/no-key tests prove UI placement and error-path mechanics, not
live AI quality or physical screen-reader/touch behavior. Hosted-specific demo
limit placement has code/SSR coverage; no real hosted/provider action was run.
Real processing still requires its configured provider/runtime, enabled live
flags and applicable approvals. No ignored configuration, owner source/edits/
exports, provider spending/retries, actual remote downloads, cloud/deployment,
staging or commits were touched. No scope deviation.
