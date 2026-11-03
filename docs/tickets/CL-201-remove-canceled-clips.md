# CL-201 — Remove canceled clips beside Retry clip

Status: Locally implemented and verified, 2026-11-03. Final validate: no
actionable findings. Owner personal visual/real-media acceptance remains open.

## Owner request and dependencies

The owner requests Remove clip in the persistent editor footer beside Retry clip
for the selected canceled clip. CL-198–200 are locally implemented; preserve
their unstaged work and CL-197. No Git, configuration or real processing action
is authorized. Confirm the normal batch is idle before backend edits/reload.

Authority: the source of truth's permanent footer/readiness/recovery rules and
the latest owner request. Existing ready clips, saved sources/projects/exports
and private diagnostics must survive.

## Acceptance and allocation

- Show a secondary Remove clip action immediately beside Retry clip only for
  canceled clips. Reuse the existing footer portal/shared Button and pending,
  dirty and connection guards. Preserve the primary retry action and compact
  desktop/phone footer geometry.
- Remove only the selected canceled clip through the authenticated existing clip
  boundary. Validate clip identity/revision/state on the server, serialize with
  retry and other clip mutations, and make repeated requests idempotent. Reject
  stale/non-canceled/working targets without changing clips or the queue. Never
  trigger inference, native/render work, retry, global cancellation or
  source/output deletion merely by removing a clip.
- Update the canonical clip list and existing recovery callback so removed clips
  do not return on poll/refresh/recovery. Keep other clip identities, states,
  prepared edits/assets/output records and work order unchanged. Choose the next
  remaining clip (previous if removing the last), retaining keyboard focus; if
  none remain, use the existing empty-session/Add clips flow.
- Use the existing strict operation/revision request contract, protected routes
  and bounded receipts. Do not widen the private agent action allowlist. Keep
  hosted authenticated workflow parity; this action is not a local-only media
  acquisition feature.
- Verify canceled removal, repeat/stale/non-canceled guards, other active work
  unaffected, exact provider/native call counts, recovery persistence and UI
  success/failure/last-clip focus plus desktop/phone footer placement using
  fake/no-key/paid-off synthetic checks. Owner real-media/personal visual review
  remains unchecked. No owner clip is removed by verification.

Owners: clip batch mutation, protected routing/hosted path contract, batch-panel
footer/selection, focused batch/API/browser checks and narrow documentation. No
new dependencies, processing or media cleanup mechanism.

Removal works in fake mode without API keys and in normal local use without
calling AI. A subsequent explicit Retry clip retains normal prepared local
speech/Codex sign-in/allowance and live gates; no real retry is tested here.

## Implementation and execute/validate evidence

The persistent footer offers a secondary Remove clip immediately before Retry
clip only for a canceled selection. Desktop shows its label and trash icon;
phones retain a labeled 44px trash button and compact Retry/Cancel text using
the existing responsive detail primitive. Pending/dirty/connection guards are
preserved. Successful removal selects/focuses the next remaining tab (previous
for the last tab); removing the final clip returns to moments with heading
focus. Failures preserve the list and leave the action available for explicit
retry.

The protected remove endpoint reuses the strict operation/revision request and
serialized bounded receipt mechanism. Canceled state, revision and absence from
current/queued work are checked before deleting only canonical clip metadata.
The normal change callback updates saved-draft/recovery state. Existing source,
asset and output files are not deleted; normal session expiry/cleanup retains
ownership. Other clip metadata, work order and calls remain unchanged. Hosted
authenticated routing admits removal; the private agent allowlist does not.

Checks completed with synthetic/fake/no-key/paid-off composition:

- Both batch/API files pass: 63 cases. New regressions cover canceled-only,
  stale/missing/repeated/conflicting operations, an unaffected active sibling
  queue, exact unchanged dispatch counts, authentication, hosted routing,
  preserved output bytes and restart recovery with zero native calls. The final
  focused API/recovery/hosted-route follow-up also passes.
- The generated responsive editor browser proof passes at all existing phone,
  tablet, laptop and desktop sizes. New 320/390/1440 states verify footer
  adjacency/fit, including another clip still processing; error preservation,
  selected-only removal/focus and last-clip return are exercised. Synthetic
  phone/desktop footer screenshots were inspected. The timestamp browser proof
  also passes after its proof-only DOM reference was moved to the existing
  browser evaluation boundary; this is the only small adjacent correction.
- Contracts/local/tests/frontend strict no-emit type checks, scoped ESLint,
  Prettier and whitespace checks pass. The final frontend/proof checks were
  repeated after shortening mobile Cancel text. Final read-only validation found
  no actionable findings; no new dependency or schema duplication.

The idle normal backend was stopped with verified tree/creation-time ownership,
all owned descendants absent and ports 4000/4200 free. Contracts and the current
internal worker/overlay were rebuilt by the normal startup, leaving the frontend
running. Health/start/configuration/capabilities return 200 with Codex ready.
Content-free before/after metadata digests match for all nine owner clips: five
review-ready and four canceled, with identical
IDs/states/assets/revisions/output records. No owner clip was removed or
retried. Runtime ownership/log evidence remains outside Git in the existing
application runtime directory.

Changed files: `apps/backend/local/clip-batch.ts` and its test; protected
`apps/backend/local/server.ts`; the existing hosted path contract; frontend
`clip-batch-panel.tsx`, `experience.tsx` and `style.css`;
`owner-editor.test.ts`, `local-responsive-editor.proof.ts`, the adjacent
timestamp proof typing fix and owning documentation. Earlier CL-197–200 work
remains unstaged and preserved. No ignored configuration, real
AI/acquisition/render, Git, cloud or deployment action was performed. Personal
visual/real-media acceptance remains owner-only.
