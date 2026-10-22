# Local owner composition

Status: owner-adopted implementation direction, 2026-10-22. Public architecture
and media lifecycle remain unchanged. Implementation evidence belongs to tickets.

Use `apps/frontend/owner`, `apps/backend/owner`, `apps/renderer/owner`,
`packages/contracts/owner` and (when needed) `packages/composition/owner` outside
deployed `src` trees. Local-only schemas live once in contracts and compile with
no Node ambient types. Apps never import one another. A root build/launcher may
assemble their separately owned artifacts and pass paths/typed descriptors.
The owner build uses pinned esbuild already present in the dependency graph.
Public app/package outputs and Docker contexts exclude owner code. No hidden
Next route, browser switch or cookie activates it in the public app.

Serve the independently built local frontend from the owner backend at
http://localhost:4100. A private loopback renderer listens on 127.0.0.1:4200.
Ports are fixed; collisions fail rather than choose alternatives. Tests inject
ephemeral ports. Exact Host/Origin checks and per-run capabilities protect the
local services; browser capability is HttpOnly/SameSite and CLI credentials stay
in private runtime state, never URLs, logs or process arguments. No LAN/tunnel.

Only explicit entrypoints listen, read operating configuration or choose local
storage. Owner composition currently permits fake AI and paid-off only; tests
force the shared pre-import environment/network guard. No ADC, cloud media
client, provider SDK composition or env-file loader enters owner runtime.
Missing native tools fail closed. Fixed native commands/bundles, admitted local
media and bounded descriptors are the renderer input boundary.

The complete adopted numerical targets and persistence policy are in the
source-of-truth authorization. Source masters and saved drafts/exports use
separate OS Downloads/ClipBuilder subdirectories. Windows Downloads resolves via
the known-folder configuration without reading credentials. Processing uses an
owned OS-temp workspace; closing drains work and removes scratch only. File and
junction/symlink checks keep mutations within the admitted roots. No retained
master, diagnostic capture/private log or saved source is cleanup scratch.

Future genuine provider/download validation remains owner-gated. Fake AI data is
synthetic; native synthetic MP4 checks are real local encoding with no AI keys.
There is no offline transcription/AI model. CL-025 owns human acceptance.
