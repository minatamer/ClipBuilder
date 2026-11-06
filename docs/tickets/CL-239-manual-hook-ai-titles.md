# CL-239 — Match AI titles and emphasis to every chosen Hook

Status: Complete locally, 2026-11-06. Normal runtime rebuilt/reloaded with
sequential CL-240; real title relevance remains owner/provider acceptance.
Dependencies CL-226/CL-220/CL-238 implemented.

Owner request: use the established title policy for AI and manually chosen Hooks,
automatically suggest a fresh title for the actual selected Hook and emphasize
its important words with a bright accent such as #FF3B30. Existing manual Hook
changes only copy/re-time the previous opening title and make no title request.

## Acceptance and allocation

- Add one bounded title-only planning port using existing timed clip words,
  selected Hook and the shared title policy. Local uses the configured Codex
  transport; hosted/provider composition uses its configured Gemini transport.
  No audio re-transcription, image request, full re-planning or provider fallback.
- Trigger only from a deliberate valid Hook selection/change after it settles,
  including manual Start/End/Capture and Use suggestion. Incomplete/invalid ranges,
  mount/restore, ordinary text/style changes and no-op selections make zero calls.
  Deduplicate settled ranges, cancel superseded work, bound requests and retain
  failures for explicit retry rather than automatically retrying providers.
- Automatically preview the new styled opening title in the Hook draft. Preserve
  unrelated edits and user typing during a request; stale clip/revision/range or
  title responses cannot overwrite newer work. Global Apply/Discard still owns
  persistence; discarded/superseded suggestions never modify saved clips.
- The policy chooses one strong accurate title from the selected excerpt's idea
  and the clip's payoff, including manual Hooks, with meaningful exact-phrase
  emphasis. Keep established title limits, safe spans, occurrence clock and no
  invented claims. Never reject usable AI output for editorial taste or add retries.
- Shared response/request schema and transport gates, bounded/idempotent server
  operation, private content-free diagnostics, cancellation/cleanup and provider
  isolation. Contextual status/failure belongs to Hook controls and footer retry.
- Verify fake/no-key HTTP/provider boundaries, call counts, races, persistence,
  highlighting and desktop/phone UX; run focused tests/types/lint/format and
  validate/fix. Rebuild/reload current-source native worker if contracts change.

Allocation: narrow contracts/title planner/provider composition, batch/host/bridge,
Hook editor integration/state, generated integration/browser proof, owning guides,
source of truth and ticket/index. Preserve all CL-225–238 changes. No ignored
configuration, owner clip/source/edit/export modification, real AI/provider call,
real download, Git mutation, cloud action or deployment during agent verification.
Fake transports need no keys; real automatic suggestions require the configured
provider/runtime, enabled live flags and applicable approvals. This request
authorizes the product behavior, not an agent-run live acceptance call.

## Verification

- Shared title-only planner uses the established nine-angle policy, actual
  selected Hook words and full admitted clip payoff; it skips Hook selection.
  Both Codex and Gemini compose this port without another media/planning pass.
  Fresh title policy now requests one or two meaningful exact-phrase accents,
  preferring #FF3B30, while legacy/no-emphasis output remains usable.
- Manual Hook/Add/Capture/Use suggestion events debounce for 900ms; no inference
  on mount/restore, invalid/incomplete/no-op ranges or typography edits. Cache is
  scoped by workspace/clip/revision/range. Superseded/unmounted work aborts; failures
  require explicit Retry title. Twelve attempts per clip persist across recovery.
- Title edits preview only in the Hook draft; independent body/other layers stay
  intact. Range/clip/revision and title fingerprints prevent late overwrites.
  Concurrent title typing retains its content and offers Use AI title in the
  footer. Apply waits for a pending title; Discard cancels and restores the draft.
- Actual host HTTP test covers source/analysis/fresh preparation, selected range,
  title, idempotent replay, stale revision rejection and Apply/compiled red spans.
  Additional title calls make zero plan/image/media calls. Codex and Gemini each
  have an injected one-call title proof; no API keys/provider access is used.
- Six-provider/title-file gate initially passed 89 cases after correcting the
  already documented CL-218 low-confidence Focus assertion (neutral null, not
  invented first-person attribution; compiler unchanged). Added default-browser
  fetch and Gemini call-count coverage; the affected two-file gate passes 53
  cases. Root local/frontend types and scoped ESLint pass. Final shared checks
  and current-source native proof/reload are recorded after CL-240.
- Codex browser found an illegal native-fetch binding missed by injected Node
  fetch; wrapped the native transport and added a regression. The initial failure
  remained in Hook controls with footer Retry. The final generated desktop/phone
  check changes manual End, automatically previews the new title, verifies the
  phrase color rgb(255,59,48), Apply readiness and Discard restoration without
  horizontal overflow. Final fixture: title requests 1, edits 0, unexpected 0.
  Temporary listeners/scratch/tab/viewport closed/reset; screenshot outside Git.
- Read-only validate/fix covered transport allowlists/capabilities, clock bounds,
  idempotency, race protection, provider isolation, resource limits, diagnostics
  and cleanup. No actionable title findings remain in the settled source. No
  owner clip was edited and no real inference, configuration or Git action ran.

Real title relevance is owner/provider acceptance; fake titles prove mechanics,
not editorial taste. Prepared timed words and configured ready provider/runtime,
live flags and approvals are required for real automatic title suggestions.

Final shared evidence in CL-240: 104 focused cases; local/frontend types, scoped
lint, contracts build and selected formatting; current-source native styled-title
and speaker/Hook proofs plus the full injected Codex HTTP/browser/export/reload
proof. The normal backend/worker was rebuilt and reloaded, preserving source and
clip hashes with only the expected transient recovery workspace ID rebound.
Hidden Hook title failures also mark the Hook tab contextually. Nothing staged
or committed; no real title request or owner clip edit was made by the agent.
