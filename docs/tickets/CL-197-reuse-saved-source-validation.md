# CL-197 — Reuse validation when opening an unchanged saved video

Status: Complete for local implementation and synthetic verification,
2026-11-03. Owner real-source timing and Find all retry remain unchecked.

## Owner request and authority

The owner canceled saved 1080p source opening after learning it repeated a full
decode of the two-hour master. Reuse completed validation if the saved bytes
have not changed; execute/validate/fix until no actionable findings remain. No
real AI calls, downloads, configuration changes, Git mutations or cloud work.
Preserve all owner sources, projects, exports and private logs.

Dependencies: CL-194–196 are implemented and locally committed. The starting
worktree is clean. This packet supersedes CL-194's full-decode-on-reopen rule
only for already validated, unchanged local saved sources.

Authority:
[saved validation reuse](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#saved-video-validation-reuse--cl-197-2026-11-03)
and the existing [local workflow](../operations/LOCAL_WORKFLOW.md).

## Scope and acceptance

- Treat the existing supported, ready source record as the completed validation
  receipt: it binds the retained byte count/digest, measured source metadata and
  pinned tool compatibility. Preserve existing records without a migration or
  one-time full decode.
- Opening an unchanged saved source after restart verifies its bytes afresh and
  copies them into the isolated workspace with checksum verification, then
  reuses the recorded source metadata. Dispatch zero native inspection/decode,
  acquisition, transcription or AI jobs for this reopen.
- Keep source/window/quality identity, measured clocks, capacity checks,
  filesystem confinement and single-link rules. Reject changed/missing/invalid
  sources; cancellation and failed copies remove owned temporary work while
  preserving the saved master and other files.
- New acquisitions and explicit replacement/locate paths retain full native
  media validation. Hosted intake, provider gates, timeouts, UI geometry and
  explicit processing actions are unchanged. No automatic retry or inference.
- Verify unchanged reopen/restart and no native dispatch; tampering, mutation
  during copy, missing/unsupported records, cancellation and cleanup; partial
  source clocks/windows and independent qualities. Use the existing fake/no-key/
  paid-off test configuration and one generated native-media proof. No owner
  media is a test fixture.
- Update the narrow owning documents and verify the normal Codex app reloads
  current backend code with content-free readiness checks only. Do not open the
  owner's saved source or trigger analysis for acceptance.

## File allocation

- `apps/backend/local/source-library.ts` and its focused tests.
- `apps/backend/local/source-acquisition.ts` and its focused tests.
- `test/owner-acquisition.proof.ts` for generated native-media reopen evidence.
- `test/owner-acquisition-api.test.ts` for zero native dispatch after HTTP
  restart.
- Source of truth, local workflow, this packet and ticket index.

## Verification and validation

Implemented in `OwnerSourceLibrary.open` and the actual
`OwnerSourceAcquisition.openFrom` path. The native inspector argument and its
dispatch are removed from reopening. Existing ready records remain the receipt;
fresh retained-file verification and copy-stream checksum verification precede
reuse of an independent clone of the recorded source metadata. No new stored
schema, migration, browser flag, cache or provider path is introduced. Explicit
locate retains native inspection and exact measured-source comparison.

### Final checks

- `vitest run --config scripts/local-test.config.ts apps/backend/local/source-library.test.ts apps/backend/local/source-acquisition.test.ts apps/backend/local/section-clock.test.ts test/owner-acquisition-api.test.ts`:
  **34 tests / four files pass**. Covers restart/HTTP reuse with no additional
  media/metadata/download/AI calls, provider-shaped records, NTSC clocks,
  partial source ranges, independent qualities,
  changed/missing/linked/unsupported masters, malformed records, mid-copy
  mutation, failed copy, blocked-copy cancellation, serialization and
  replacement-native failure/metadata mismatch.
- `vitest run --config scripts/local-proof.config.ts test/owner-acquisition.proof.ts -t 'reopens a fully validated generated master'`:
  **one generated native proof passes**; three unrelated proof cases are
  skipped. The supported 16-second 320x180 H264/AAC fixture is generated and
  fully validated, saved, then reopened through a separate acquisition service
  with no native/provider dispatch. Workspace and retained bytes match exactly.
  Owned proof media/scratch are removed. No saved owner media is used.
- `tsc --noEmit -p tsconfig.local.json` and
  `tsc --noEmit -p tsconfig.tests.json` pass. Scoped ESLint and code Prettier
  checks pass for all six changed TypeScript files; `git diff --check` passes.
- The normal backend watcher reloaded the edited backend modules. Existing
  launcher identities and listener ownership remain verified on 3000/4000/4200;
  the previous API/worker processes are absent. Health, `/start`, config bridge
  and capabilities GETs return 200, exposing Codex/setup ready. Runtime records
  were refreshed outside Git. Native worker/contracts/composition code is
  unchanged, so no native rebuild is needed. No processing request is made.

The first sandboxed Vitest invocation failed before collecting tests because its
temporary transform files were inaccessible; the same deterministic
configuration passes outside the sandbox. The native generator requires its
existing 16-second profile; the proof uses that profile rather than changing the
generator. The HTTP regression's previous expected inspection job was updated to
assert its absence. These are verification corrections, not production scope
changes.

### Execute/validate outcome

Read-only review covered the combined unstaged implementation, focused tests,
native/HTTP integration and owning documentation against every criterion above.
An initial review caught unrelated Markdown wrapping from formatting the whole
workflow guide; it was removed. The final settled review reports **Meets ticket;
no actionable findings**. Fresh checksum/copy binding, restart compatibility,
measured clocks/ranges, unchanged new-download/replacement validation, path and
capacity checks, cancellation/cleanup, dependency directions and zero inference
dispatch are covered. No browser UI/action or cross-boundary schema changed.

Fake/no-key checks establish reuse/integrity mechanics, not real
speech/editorial quality or the owner's actual reopen time. Local speech
requires prepared CPU assets; real Codex analysis requires sign-in/allowance and
normal live gates. Neither is invoked here. Owner real reopen/Find all retry,
personal acceptance and hosted/Linux release checks remain unverified. No
configuration, saved media, provider/cloud resource or Git index/history
mutation. All ten changed/new files remain available unstaged for review; no
functional deviation from the packet.
