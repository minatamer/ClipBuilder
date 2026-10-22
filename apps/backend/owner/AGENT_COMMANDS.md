# Local agent commands

The owner CLI uses the running private local host on 4100 and worker on 4200.
It needs no browser tab or hosted service. Build and start that stack using the
[owner guide](README.md), then run `corepack pnpm owner:agent` from the repository
root with one JSON command (at most 32 KiB) on standard input. End standard input after that
document. There are no command-line flags or capability/path arguments.

Current execution requires `FAKE_MODE=true` and `PAID_DEMO_ENABLED=false`, with
no API keys or ADC. AI preparation remains synthetic. Manual editing and native
export use the same validated domain/media paths as the browser; an already
prepared real bundle can be edited without the AI that made it. Automatic real
analysis still requires the missing owner provider/input preparation, keys,
live flags and approvals. No offline AI model is supplied. These commands never
start discovery, transcription, picture generation or a cloud render.

## Inspect and edit

The following commands contain synthetic examples only. In PowerShell:

```powershell
'{"command":"status"}' | corepack pnpm owner:agent
```

Status returns the current workspace, opaque clip IDs, revisions, layout, asset
metadata, counts and output status. It does not return source paths, filenames,
dialogue, timed caption words, provider payloads or capabilities. Use an exact
workspace/clip pair from status; do not guess an ambiguous target.

```json
{
  "command": "inspect",
  "workspaceId": "11111111-1111-4111-8111-111111111111",
  "clipId": "22222222-2222-4222-8222-222222222222"
}
```

`validate` and `apply` accept the same target plus `request`, containing a fresh
`operationId`, current `expectedRevision`, the inspected `baseHash`, and the
browser's existing allowlisted `operations`. For example, to reset captions:

```json
{
  "command": "validate",
  "workspaceId": "11111111-1111-4111-8111-111111111111",
  "clipId": "22222222-2222-4222-8222-222222222222",
  "request": {
    "operationId": "33333333-3333-4333-8333-333333333333",
    "expectedRevision": 2,
    "baseHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "operations": [{ "kind": "reset", "panel": "captions" }]
  }
}
```

Validation is a dry run: it returns the proposed revision, safe layout metadata
and compiled overlay hash without writing, saving or rendering. Change only
`command` to `apply` to submit the same request. A concurrent newer revision
still rejects it. Inspect after applying and report the acknowledged revision.
Never replay an unacknowledged write with a new ID automatically. Repeating an
acknowledged operation ID with identical input does not repeat its side effect;
changing input under that ID rejects. IDs are scoped to the running session.

Caption operations accept the bundled presets, bounded font size, six-digit
colors, alignment and normalized safe-area box. Visual upsert/remove/reset
operations use admitted asset IDs and clip-relative frame times. There is no
caption rewriting, provider prompt, arbitrary CSS/JSX, shell command, file
browser or remote asset URL. Inspect supplies safe current style/visual fields;
the [editor guide](../../frontend/owner/README.md) describes the bounds.

## Pictures and explicit exports

`picture` takes the exact workspace/clip target and one explicitly chosen
absolute local JPEG/PNG `path` inside the stdin document. The path is never a
process argument or stdout field. Authentication and clip lookup happen before
the file is opened. Relative, escaping, UNC/device and linked paths are refused;
the file and actual decoded bytes retain the editor's limits. Import only
pictures the owner has authorized and has rights to use. The result lists a new
owner-supplied asset, or the existing matching asset; it does not replace a cue
automatically. Apply a visual operation referencing that asset explicitly.

`render` takes the same target and `request` with `operationId` and
`expectedRevision`. It queues one immutable native export of that revision,
without a provider call. `inspect`/`status` poll progress; neither starts work.
`cancel` takes the target and cancels its queued/active native work. Earlier
exports, sibling clips and the source remain available. New edits during a
render are a later draft; the active export retains its admitted snapshot.

The CLI returns output IDs/status, without dumping private media, file paths or
edit documents to the console. Use the owner's player/download controls for
actual delivery. Real private frame inspection is not authorized by CLI access;
only synthetic frame checks are part of agent verification.

## Saved drafts and lifecycle

`drafts` lists opaque saved-draft IDs/counts/dates. `open-draft` takes `draftId`
and opens an existing validated draft only when the current workspace is empty;
it does not replay AI or a native job. `save` takes `workspaceId` and explicitly
opts into saving once, after which acknowledged changes autosave. Unapplied
browser controls remain unsaved form state. A failed save is reported as
unsaved, with the session and last good copy preserved. Sources/Drafts/Exports
remain separate as documented in the owner guide.

The host is the authoritative writer for browser and CLI. An open browser polls
the authoritative layout; dirty local controls remain visible and require an
explicit reload after another client changes the revision. The CLI discovers
the current per-run capability from private OS-temp records after checking
paths, age and supervisor/child process identities. It never accepts an
arbitrary host, capability, runtime path or environment-file override. Missing,
expired, replaced or closed runtime records fail before picture access or work.
Normal launcher shutdown withdraws discovery and removes capability/scratch,
while preserving content-safe logs and explicitly saved private assets.
