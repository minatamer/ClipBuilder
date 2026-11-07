# CL-249 — Explain and cancel pending Hook titles

Status: Complete locally, 2026-11-07. Depends on CL-239 title requests and CL-247 stable
footer feedback; preserve all pending CL-247/248 changes.

The owner finds the plain “Writing a title…” line poorly designed and asks for
a clear explanation of why Apply is disabled, plus a cancel action. Present
pending title work using the shared design and concise contextual copy. Cancel
the title request independently of the user's Hook/content edits so they can
apply those edits with their existing title, subject to other validation.

## Acceptance and allocation

- A readable, accessible progress state near Hook actions explains that title
  generation blocks Apply. Expose Cancel title and make the footer's blocker
  understandable if the owner changes tabs. Keep normal footer/control geometry.
- Cancel debounced or in-flight work, release this Apply blocker and preserve
  current title/Hook/body edits. Ignore late results and avoid automatic retry
  or reapplication of canceled work. Existing explicit retry, range/revision
  binding, attempt bounds, typing protection and discard/unmount guards remain.
- Verify fake/no-key request counts, cancellation before/after dispatch, late
  replies, Apply readiness and unchanged edits. Inspect actual generated editor
  pending/canceled/failure/ready states and laptop/tablet/phone geometry. Use
  focused tests/types/lint/format and read-only validate; no new live acceptance.

Scope: frontend title-request lifecycle, Hook progress UI/Apply association,
generated fixture controls/tests and owning documentation. No owner source/clip
edit, ignored configuration, real provider/model request, app restart, Git action,
cloud or deployment. Fake checks establish mechanics, not title quality; real
titles still use the configured provider/runtime, live flags and approvals.

## Implementation and observed behavior

Hook title work now has a shared progress panel with the normal spinner, clear
“Apply is paused” copy and a Cancel action. Apply references that explanation
accessibly and exposes its busy state. If the owner switches tabs, the same
progress/cancel control anchors beside Apply outside footer sizing flow. It is
outside the Hook fieldset's disabled boundary so unrelated invalid fields cannot
trap a pending title. Main field/Apply validation and timestamp Capture guards
are retained.

User cancellation clears the debounce, aborts the transport, publishes a canceled
state and remembers it for that clip/revision/range. It releases only the title
blocker, keeps current title/Hook/body drafts, ignores late replies and cannot
automatically restart the same canceled range. Lifecycle/supersession cancel
remains silent; explicit failure retry, request bounds and binding are unchanged.

The generated 320px failure check exposed overlapping action groups when Retry
appeared. Empty action groups now leave no flex gaps and the shared footer uses
its normal spacing token for narrower button padding below 360px. There is no
state-specific height/negative spacing fix; targets remain 44px high and the
footer stays content-sized. Pending CL-247/248 work is preserved.

## Verification

- Twenty-two cases pass across title requests/host integration and contextual
  feedback. New cases cancel before dispatch (zero requests) and after dispatch
  (one aborted request), reject a late successful reply, retain cancellation on
  range reuse and permit one explicit forced retry. Existing typing, stale
  range/revision and real fake-provider HTTP Apply coverage pass.
- Initial sandbox attempts were inconclusive because temporary transform files
  and loopback sockets were unavailable. The same isolated fake/no-key/paid-off
  checks pass outside that restriction. That run also exposed an old caption
  assertion expecting full-text speaker colors from before CL-245; it now checks
  the already-restored distinct highlights and normal foreground. No runtime
  caption code or speaker policy changed.
- Frontend and root test typechecks, scoped TSX/fixture/test ESLint, CSS/TSX/test formatting and
  final diff whitespace pass. No dependency, contract or native-worker change.
- The actual generated full editor uses held fake HTTP title responses, rather
  than an injected visual-only loading flag. At 1280×720, 1024×768, 768×1024,
  390×844 and 320×700, Cancel remains enabled in Hook and beside Apply from Text;
  Apply remains disabled until completion/cancellation. Both placements retain
  identical footer and preview bounds, with no horizontal page overflow.
- Final pending/failure footers measure 77px on laptop/tablet and 69px on phones.
  Failure keeps Apply available with the existing title, Retry remains explicit,
  and all action targets stay 44px high, contained and separated at all five
  verified viewport sizes. Discard/reset behavior and footer ownership remain.
- A controlled reply updates the draft with the simulated title and enables
  Apply. While another request is held, typing a custom Hook title and removing
  an unrelated synthetic layer remain local draft edits. Cancel in Hook and from
  the footer each closes its real fake HTTP request, preserves current text and
  Hook timestamps, and enables Apply without changing button, footer or preview
  geometry. The generated owner-like source/base/edit records are never saved.
- Early stale-tab/viewport observations were discarded; settled final checks
  use the current tab explicitly and record actual viewport dimensions. The
  final read-only validate pass reviewed lifecycle/cache/abort races, unique
  explanation IDs across tabs, disabled/validation guards, responsive popup/
  footer bounds, privacy/dependency direction and cleanup. No actionable finding
  remains in CL-249 scope.

## Cleanup and remaining acceptance

Two generated fixtures recorded six fake title requests in total: two canceled,
three controlled failures and one successful reply. Final fixture: four requests,
one canceled, two failed, pending zero, edits zero and unexpected requests zero.
No real provider/model call, title retry on owner media, configuration change,
app restart, Git action, cloud or deployment occurred. Both fixture servers and
their four ports/helper trees are closed; generated tabs closed and viewport
reset. Temporary helper removed; screenshots and aggregate geometry stay outside
Git. Normal app listeners remain frontend/backend/worker 18068/6556/3916; health
returns 200.

This UI and its fake-regression checks work with FAKE_MODE=true and no API keys
or AI model. Actual title writing still needs prepared words and the configured
local Codex runtime/account or real provider key, live flags and approvals.
Fake titles establish mechanics, not editorial quality; actual provider-side
cancellation timing, physical devices, screen readers and hosted release remain
separate. Nothing staged or committed. Scope deviation: the narrow stale Word
pop assertion correction above; no caption implementation change.
