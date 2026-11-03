# CL-199 — Rename clips and use their names for downloads

Status: Locally implemented and verified, 2026-11-03. Final validate: no
actionable findings. Owner visual/real acceptance remains open.

## Owner request

Allow the owner to replace Clip N with a meaningful name, show that name on the
clip and use it in the downloaded video's filename. Preserve the default for
unnamed clips. This is clip metadata, not an on-video title or an AI prompt.

Dependencies: existing CL-190 collection persistence and CL-158 rolling
recovery. CL-198 should consume the same display-name resolution when ready;
neither ticket may introduce a separate naming field/schema.

Authority:
[current owner planning request](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#planned-clip-navigation-and-naming--2026-11-03),
the shared contracts/persistence/privacy boundaries and local lifecycle rules in
AGENTS.md. The owner explicitly requests a named download rather than the
historical constant Clip N filename; internal storage identities remain opaque.

## Safety and execution gate

The earlier documentation-only hold is lifted after confirmed cancellation. Do
not change app code, schemas or normal services while a real batch runs.
Backend/shared-contract changes can reload the watcher and interrupt
active/queued work. Recovery retains acknowledged completed data but does not
automatically resume interrupted AI jobs. Preserve CL-197 work, configuration,
saved sources/projects/exports and private logs. No real inference, download,
deployment or Git mutation.

After the owner requests implementation, first ensure the real batch is idle.
Use isolated synthetic/fake/paid-off/no-key checks before loading the change
into the normal app. Never restart an active paid batch to make a UI change.

## Acceptance

1. Add one optional clip display name through the owning shared contract and
   canonical server clip metadata. Recommended bound: 80 Unicode characters,
   trimmed, single line, with control characters rejected. Unnamed/legacy clips
   remain readable as Clip N without a migration or forced rename.
2. Provide a compact Rename action associated with the clip/card or existing
   contextual menu. Support Enter/save, Escape/cancel, accessible labels/focus
   and a useful failure state that preserves the previous name. Avoid extra
   permanent footer actions or inline implementation prose.
3. Use the same resolved name in clip navigation, the editor heading and the
   downloaded MP4 filename. Preserve export revision disambiguation. Renaming an
   existing prepared/exported clip must not transcribe, replan, render or
   discard its completed output; future downloads use its current display name.
   Already downloaded files and immutable stored media are not renamed.
4. Derive a safe filename separately from the display name. Handle Unicode,
   blank/duplicate names, separators, reserved Windows filenames, trailing dots/
   spaces, excessive byte lengths and header/control injection. Reconcile the
   browser download attribute and response naming where applicable. Never use a
   name as a path, clip ID, processing identity, object key or URL parameter.
5. Persist names across refresh, local recovery and explicit saved-draft reopen.
   Old snapshots still load. Naming must not alter source/base/edit identities,
   invalidate prepared edits, change queue order or reset processing progress. A
   completed clip can eventually be renamed while other clips run through a
   metadata-only operation that preserves the existing queue and call counts.
6. Keep names in private clip/project state and intended UI/download metadata;
   never emit them in ordinary diagnostics/errors, provider requests, fixtures
   copied from owner data or committed evidence. Use synthetic names in tests.
7. Verify default/custom/long/Unicode names, rename failures/cancel, duplicate
   names, existing outputs, legacy restore and restart recovery. Assert exact
   unchanged AI/native/render call counts and unchanged exported bytes when
   merely renaming or downloading an existing output. Check desktop/phone
   geometry and keyboard use with the shared primitives/tokens.

## Initial allocation and verification

Likely owners: `packages/contracts/local/clips.ts`, canonical clip metadata and
draft/recovery schemas, backend clip action/routing, frontend rail/editor/menu
and download handling, plus focused synthetic/no-key regressions and generated
download proof. Keep names separate from overlay/title content.

The rename/download behavior needs no API keys or AI calls in either fake mode
or real local use; actual new clip preparation still needs the chosen provider's
existing prerequisites and live gates. Real Codex uses prepared local speech and
sign-in/allowance; Gemini requires its API key and applicable approvals. Owner
visual and real-session acceptance remain unchecked.

## Implementation and execute/validate evidence

One optional displayName is persisted by the canonical clip schema, so existing
draft/recovery paths retain it without a migration. The compact Rename action
supports Save/Cancel, Enter/Escape and focus return. A serialized, idempotent
metadata operation uses expected-name concurrency rather than edit revisions;
queue order/state, identities, prepared work and outputs are unchanged. Both
browser download names and the protected output response use the same safe
filename, including clip index/revision disambiguation. Hosted naming uses its
existing authenticated route; the private agent allowlist is unchanged.

Sixty-three fake contract/batch/editor API cases pass, including active queue
rename, stale/idempotent updates, exact output-byte preservation and recovery
with zero native calls. Focused final Unicode/header/path/reserved-name/filename
byte-bound checks and the HTTP recovery regression pass. The generated browser
proof verifies Rename/Save/Escape/focus, matching download attribute, portrait
entry motion and desktop/phone layout, including 1366x768 and 1440x650 laptops.
Types and scoped lint pass. Final read-only review corrected malformed Unicode
filename handling and header-height accounting; no actionable findings remain.

Changed owners: clip-name contract/tests, clip schema, hosted action allowlist,
batch metadata action, server rename/download handling, rename UI, rail/header/
download labels and local CSS, API/batch/browser proofs and owning docs. No real
inference, renders, downloads or owner-name changes were triggered by tests. All
real source/clip data remains private; no configuration or Git mutation.
