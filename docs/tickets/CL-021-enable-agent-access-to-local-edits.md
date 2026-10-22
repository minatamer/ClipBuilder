# CL-021 — Let the existing chat agent make validated local edits

Status: queued; owner authorized fake/synthetic implementation, validation loops
and ticket commits on 2026-10-22. No paid/provider/cloud/real YouTube calls.
Dependencies: CL-017 protected local composition/lifecycle; CL-019 stable clip
identities; CL-020 shared edit use case and revision-bound export.

## Objective and value

Let the owner say, for example, "move this clip's captions higher and use my
second picture," and let the existing agent apply it without clicking the UI.
The local preview reflects the same edit and can export the chosen revision. No
new chatbot, model-powered editor service or custom hosted MCP server.

## Interface and ownership

Prefer a thin local CLI in backend ownership calling the same protected local
use cases as the UI. The fixed renderer remains in renderer ownership; never
import another app's source. Research and architecture context are in the
[research note](../research/LOCAL_OWNER_WORKFLOW_2026-10-22.md).

The browser UI need not be open. The CLI can use the protected local owner core
in a headless session and perform the same bounded edit/export operations; it
must not depend on a hosted page, computer-use clicking or an extra model
service. The local host still follows CL-017's explicit lifecycle and
authorization rules. Opening the UI later reads the authoritative live revision
within that session.

Specify commands to inspect safe workspace/clip status, list asset IDs, import
an explicitly supplied local picture, validate/apply bounded edits, inspect the
resulting revision, request a deterministic local render, poll status and
cancel. This is a proposed command surface, not an installed command today. A
structured patch file contains allowed caption/visual operations and an expected
revision. Unknown commands/properties, arbitrary shell commands, compositions,
paths, provider prompts and remote URLs are rejected before side effects.

Keep one authoritative writer/operation coordinator. A CLI must not edit live
JSON files behind the UI's back. Command IDs and expected revisions give
idempotence and stale-write detection; UI/CLI conflicts return safe errors. Use
a private per-run transport capability resolved internally without printing or
placing it on process command lines. Do not turn loopback into anonymous
authority, allow LAN binding or weaken Host/Origin protection for browser
clients.

## Agent workflow, data and authorization

For a later authorized edit: resolve the clip/source revision; read current safe
layout/asset metadata; construct and validate the patch; apply atomically;
inspect the new revision; render only when the owner's requested outcome calls
for it; report revision/output status. Do not require a redundant confirmation
for reversible edits already requested by the owner. Ambiguous target/asset
references require clarification instead of changing the wrong clip.

Default stdout/stderr contains opaque IDs, safe codes, counts, style/geometry
and progress only. Keep private paths, media, transcript/caption text, provider
payloads and capabilities out of logs, URLs, tracked examples and process args.
Use private result files/authorized local media delivery for artifacts, never
dump an edit document or raw provider response into console output. Synthetic
examples only. No reading legacy Gemini captures or the retired sample replay.

Agent access to layout controls does not require exposing dialogue. If visual
inspection of real private frames is later requested, record a scoped local
media-review decision before adding capture/read behavior that conflicts with
the existing screenshot/content rule. Until then, real visual review stays in
the owner's local player; agent frame checks use synthetic media. Do not claim
human visual approval from geometry validation.

The command surface makes no AI/provider call for manual edits or local export.
Future paid discovery/regeneration stays owner-triggered and separately gated;
an agent edit instruction is not permission to run the paid flow. Imported files
are explicit owner inputs under the workspace policy, not a general file
browser. No automation, Git write, cloud update, resource purchase or deployment
command.

## Acceptance and verification

- [ ] A synthetic owner instruction can move captions, change a preset and
      replace/reposition a picture using only the CLI; the open UI shows the
      same new revision and export uses it.
- [ ] Repeat the edit/export with the browser UI closed and provider/paid/cloud
      features disabled. The local command succeeds, then opening the UI shows
      the same revision. No hosted service or UI automation is required.
- [ ] UI and CLI reject the same invalid operations and produce the same edit
      snapshot/hash. Repeated command IDs do not repeat writes or rendering.
- [ ] Concurrent UI/CLI changes, stale clip IDs, source replacement and canceled
      renders have deterministic conflict/lifecycle outcomes without data loss.
- [ ] Malformed patch/filename, escaped path, unauthorized client and expired
      capability fail before file access, native work or any provider call.
- [ ] Tests prove safe output and exact zero AI/cloud calls. Synthetic native
      smoke verifies edited export and cancel/close cleanup; ordinary tests use
      pre-import fake/paid-off setup and external network interception.
- [ ] Run focused checks, root five gates and public artifact exclusion check
      after implementation. A CLI file in a public image is a failed boundary.

## Documentation and gates

Write a concise local agent-command guide with synthetic examples and limits;
update app guides, source of truth and index. Current `FAKE_MODE=true` is
key-free with synthetic results; agent editing is planned. Future deterministic
local edits can be API-free with existing media/timed captions and ready native
tools. Actual AI analysis/automatic assembly needs real keys, enabled flags and
rights/transfer/ spend approvals; no local AI model/weights are provided and
paid tests remain owner-only. Real frame inspection scope, native/visual
acceptance and rights remain open. This packet authorizes no execution today.
