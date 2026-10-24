# CL-061 — Shared upload/editor with local-only YouTube acquisition

Status: implemented and locally validated; Linux/cloud release acceptance remains
unchecked. Dependency: implemented CL-027–060 editor/native workflow.

Owner decision — 2026-10-24: prepare the new editor for the deployed application,
not only local use. One normal frontend/backend workflow. Upload is the only
hosted intake; YouTube URL acquisition alone remains local-only. Implement the
hosted processing adapter now. Never deploy. Earlier paid-test authorization is
revoked: no credit-consuming test without new explicit owner approval.

Acceptance:

- Update current authority and owning guides, superseding public no-editor
  restrictions without claiming existing deployed revisions already changed.
- Share upload/moments/editor components and preparation/edit/render logic across
  local and hosted composition. Preserve local upload and YouTube functionality.
  Hosted intake contains no YouTube action or sample bypass. Native editing is
  an internal service implementation, with no second UI or owner launcher.
- Hosted routes independently reject acquisition, local filesystem-library,
  owner capability and agent paths. Protect admitted routes with frontend
  identity, origin, CSRF, abuse-checked sessions, isolation, bounded work/spend,
  streaming budgets, cancellation and expiry/exit cleanup. Keep quality critique
  advisory and reuse paid preparation on explicit retry.
- Package current fixed Linux worker/overlay and native dependencies at build
  time; no runtime tool downloads. Keep source/dependency boundaries and closed
  secret-free build inputs. Document resource and single-instance constraints.
- Prove upload reaches actual shared editor controls and native export with
  synthetic media; prove hosted acquisition and cross-session requests produce
  zero provider/native dispatches. Cover fake/live composition gates, types,
  lint/format and read-only validation. Inspect desktop/phone intake/editor.
- No deployment, cloud build/resource mutation, credentials/env reads, real
  downloads, paid processing or Git mutation. Preserve running local apps and
  retained/saved media. Report unperformed Linux/cloud/real-AI acceptance honestly.

## Implementation and verification — 2026-10-24

- `/start` renders the same editor experience in local and hosted composition.
  Hosted props provide one upload card and no YouTube/sample bypass. The editor,
  moment selection, Apply/Discard, captions, pictures/motion, filters, retry and
  download share existing components and domain logic. There is no second UI,
  owner launcher, AI setting or hidden hosted editor gate.
- `hosted-workflow.ts` supplies isolated temporary sessions behind the existing
  frontend-identity middleware. Shared `hosted-editing.ts` owns the closed route
  allowlist and fixed ceilings. Backend and frontend independently exclude
  acquisition, libraries and agent paths; owner loopback capability APIs remain
  local. The compatibility `/api/local` prefix now bridges admitted editor paths
  to `/v1/editing` when hosted. Old hosted analysis/admission routes are retired.
- `hosted-upload.ts` implements ordered 8 MiB chunks and fixed temporary paths;
  declared size, order, source validation and exact byte/hash binding precede AI.
  HttpOnly/Secure/SameSite cookies, origin/CSRF, bounded proof verification,
  provider/native/read/disk budgets, expiry, transfer cancellation and cleanup
  apply. Failed cleanup retains recovery ownership and blocks new sessions.
  Existing parsed provider allowance further limits the absolute ceiling; it was
  not increased or reset by the adapter. Completed preparation remains reusable.
- `hosted-runtime.ts` starts the renderer-owned fixed worker internally only for
  approved real production composition. Fake/test/preview/paid-off/missing flags
  fail closed. Docker/build-context recipes package current worker/overlay and
  image-owned Linux tools; no local downloader/Python distribution or runtime download.
  Native children receive only the isolated credential-free fake/paid-off media
  environment. Normal local startup/configuration remains unchanged.
- Authority, public README, service guides, migration history and the new
  `HOSTED_EDITOR_RELEASE_PREPARATION.md` distinguish current shared scope from
  historical read-only scope and the unchanged deployed revision. Privacy copy
  identifies generated pictures correctly. Local saved-media APIs stay private.

Actual checks:

- Settled full synthetic run: **1,767 tests in 164 files passed**, fake/paid-off,
  network-blocked and without ignored env reads. Root artifact/boundary checks,
  source-byte replay and existing local acquisition tests are included. Earlier
  runs exposed slow recursive Buffer assertions; exact native byte equality
  preserves coverage and resolves the harness cost. A cold ESLint hook timeout
  passed on the settled run; no product timeout was relaxed.
- Full repository type check and final local/backend/frontend checks pass.
  Changed-source ESLint passes after three lint fixes; Prettier/whitespace checks
  pass (Markdown follows the repository's formatter exclusion). Worker/browser
  overlay compiled locally; secret-free frontend/backend contexts pass.
- Current-source hosted-shaped browser/native proof passes (**34.70 seconds**):
  generated MP4 → bounded upload → shared editor → caption edit → Apply → export
  and actual MP4 download. Exactly one fake transcription, one plan/image and
  inspect plus two native renders. Fake Turnstile and fake AI, zero real API/cloud
  calls. Session exit removes temporary media and owned resources. Intake and
  editor visually inspected at 1440/390 pixels; ignored screenshots are
  `.local-build/evidence/cl061-upload-*.png` and `cl061-editor-*.png`.
- Read-only validate compared current code/doc changes with all acceptance
  criteria, actual default routing, independent acquisition denial, auth/CSRF,
  session/source/asset binding, admission ceilings, explicit retry reuse,
  dependency direction, logging/privacy and resource cleanup. **No actionable
  implementation findings**; Linux/resource/cloud acceptance is explicitly
  unverified. Related CL-058–060 changes remain in the worktree; nothing staged,
  committed, pushed or deployed.
- Normal backend/worker refreshed after verified shutdown: nine owned processes
  stopped, zero survivors, ports 4000/4200 released; frontend PID 6684 preserved.
  Replacement supervisor PID 420, backend PID 25520/4000 and worker PID 14380/4200
  passed readiness. `/start` and local capabilities return 200, real/provider AI
  and local source capability remain. Saved session restored with failed/ready
  clips, one retained export and unchanged plan/image/render counters. Separate
  content-safe logs/runtime ownership stay outside Git.

Release items still unchecked: actual Linux image construction/native parity,
hosted scratch/CPU/memory ceilings and lifecycle behavior, authentic remote
frontend/Turnstile/session routing, real Gemini quality and owner acceptance.
Local Docker engine is available, but no cached ClipBuilder native image was
available for offline Linux verification; no image pull/build or cloud request
was performed. The backend's old lightweight allocation is insufficient; the
owner release guide records the minimum resource and single-instance requirements.

Deviations: none in requested product/code scope. This is implemented source and
synthetic verification, not a claim that the existing deployment changed or that
Linux/cloud release gates passed. No credit-consuming test, secret/configuration
read, cloud build/resource mutation, deployment, or Git mutation occurred.

Follow-up evidence: CL-063 now builds both images locally and verifies the actual
Linux worker/upload/editor/native export, saved picture/filter state,
cancellation/retry and expiry/exit under fake/offline composition. The earlier
Linux-unchecked statement above records the original CL-061 handoff. Maximum
remote resource capacity, authentic hosted identity/routing/Turnstile and real
Gemini/owner acceptance remain unchecked. The owner's later AFK handoff also
authorizes cohesive local commits; no push or deployment.
