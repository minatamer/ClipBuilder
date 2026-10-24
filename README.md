<h1 align="center">ClipBuilder</h1>

<p align="center">
  <strong>Turn long-form video into a clip worth sharing.</strong>
</p>

<p align="center">
  <a href="docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md">Product architecture</a>
  ·
  <a href="docs/tickets/README.md">Implementation tickets</a>
  ·
  <a href="docs/README.md">Documentation</a>
</p>

<p align="center">
  <img
    src="docs/assets/clipbuilder-overview.png"
    alt="ClipBuilder concept overview: long-form video, selected moments, and a captioned vertical clip"
    width="900"
  />
</p>

ClipBuilder turns uploaded conversations into captioned vertical clips. Choose
manual ranges or AI-suggested moments, then adjust captions, pictures, motion and
filters in one focused editor before downloading an MP4.

The same upload and editor flow serves local and hosted composition. YouTube URL
downloading is available only locally; the hosted product accepts uploads only.
The shared hosted adapter is implemented in source and awaits the owner's release
checks and deployment. See [release preparation](docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md).

## Why ClipBuilder

| Choose moments | Shape the captions | Build the visual story |
| --- | --- | --- |
| Combine manual ranges with AI suggestions from the conversation. | Adjust readable styles, animation and placement in the preview. | Place contextual pictures and tune their timing, position and motion. |

## From upload to finished clip

1. **Upload a conversation** — choose an owned or licensed MP4.
2. **Choose moments** — add manual ranges or request AI suggestions, then select
   the clips to prepare.
3. **Prepare clips** — create vertical video with readable captions and contextual
   illustrative pictures.
4. **Review and edit** — adjust caption style and position, pictures and motion,
   or filters. Apply or discard changes; explicitly retry failed clips.
5. **Export and download** — render the current edit as a 1080 × 1920 MP4.

Contextual pictures illustrate the selected conversation. Local quality checks
record critiques while keeping usable Gemini results available.

## Built around the core edit

- **Grounded selection:** candidate moments and visual cues reference real transcript words and timestamps.
- **Vertical composition:** a consistent portrait layout shares preview and export behavior.
- **Purposeful visuals:** illustrative pictures support the spoken idea alongside the original footage.
- **Deterministic output:** validated edit data drives a shared fixed preview composition and private Node renderer; the model never generates executable media commands.
- **Bounded processing:** temporary sessions, fixed limits and explicit actions keep work contained.
- **Focused editing:** one active clip and settings panel, with Apply/Discard and
  exports in a persistent footer. Completed preparation is reused on retry.

## Implemented architecture

Gemini handles transcription and planning; a fixed native worker handles media.
The [release preparation](docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md)
distinguishes implemented shared editing from unperformed Linux/cloud acceptance.

| Layer | Technology |
| --- | --- |
| Experience | Next.js, React, TypeScript |
| API and contracts | Node.js, Express, shared Zod schemas |
| Transcript and planning | Google Gemini through a server-only adapter |
| Contextual visuals | Generated pictures from bounded scene descriptions |
| Composition and export | Shared React overlay, Chromium and fixed FFmpeg worker |
| Temporary media | Isolated ephemeral server workspaces with expiry cleanup; owner-managed local storage |
| Hosting | One frontend/backend application with an internal media worker; no database/queue |
| Abuse protection | Cloudflare Turnstile and bounded admission controls |

```text
Browser
  +-- Next.js upload + moment selection + shared editor + download
  +-- browser-safe contracts + validated fixed composition preview
  +-- same-origin protected upload/analysis/render requests
       +-- private Express API -> server-only Google Gemini adapter
       +-- isolated temporary session + internal fixed native worker; expiry cleanup
```

The model proposes bounded editorial data. Deterministic application code validates that data, resolves it against the source transcript, and owns every media operation.

The shared hosted adapter keeps the uploaded original in an isolated temporary
server workspace and sends bounded proxies to Gemini. Exit, expiry cleanup and
separate provider retention remain explicit privacy requirements. Linux image,
resource limits, cloud behavior and real Gemini acceptance remain owner release
checks. Earlier GCS/private-renderer architecture is recorded as history in the
[migration plan](docs/architecture/GEMINI_REMOTION_MIGRATION.md).

## Repository status

CL-061 prepares the shared hosted editor and upload-only intake. Local fake AI
needs no keys and can produce real native exports with fictional analysis and
sample art. Hosted-shaped synthetic browser/native checks exercise upload,
editing and export without provider calls. These checks do not prove live AI or
Linux/cloud readiness; the deployed revision remains unchanged. Real Gemini
requires the owner's API key, live settings and approvals. No local AI model or
weights are used. Credit-consuming tests require new explicit approval, and
agents must never deploy. Current release requirements are in the
[hosted editor preparation guide](docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md).

Historical hosted pipeline (through CL-015):

Local code through CL-014 connects intake and temporary storage, protected
analysis, immutable selected assembly, read-only preview, one confirmed private
render, validated output access/download and cleanup. Deterministic checks use
`FAKE_MODE=true`, no API keys and injected synthetic results. The fixture UI at
`/start` shows the journey with video placeholders and disabled download; it
does not edit real footage or prove AI quality.

Real analysis needs provider API keys, enabled live flags and rights/data/paid
approvals; private media compute/storage needs separate cloud approval. No local
AI model or weights are used. Actual native media quality/performance, device
and accessibility observations, final UI/film, public sample rights/licenses,
provider settings, spend controls and public deployment remain open. See the
[release candidate audit](docs/operations/RELEASE_CANDIDATE_AUDIT.md) and
[quality matrix](docs/operations/EXPERIENCE_QUALITY_MATRIX.md). CL-015 adds
[local release preparation](docs/operations/LOCAL_RELEASE_PREPARATION.md);
public deployment and an acceptable immutable build remain pending.

## Explore the repository

| Area | Responsibility | Guide |
| --- | --- | --- |
| `apps/frontend` | Shared upload, moment selection, editor and download | [Frontend guide](apps/frontend/README.md) |
| `apps/backend` | Private Express API, configuration, and protected AI request boundaries | [Backend guide](apps/backend/README.md) |
| `apps/renderer` | Private fixed media pipeline and verified temporary cleanup | [Renderer guide](apps/renderer/README.md) |
| `packages/composition` | Shared fixed React preview/render layout | [Composition guide](packages/composition/README.md) |
| `packages/contracts` | Browser-safe schemas and compiled limits shared across the API boundary | [Contracts guide](packages/contracts/README.md) |
| `docs` | Product decisions, design research, and implementation tickets | [Documentation](docs/README.md) |
| `test` | Shared deterministic test isolation | [Agent instructions](AGENTS.md#deterministic-verification) |

For local setup and verification, start with the [backend guide](apps/backend/README.md#run-locally),
then the [frontend guide](apps/frontend/README.md#run-locally). Automated coding
agents follow the process and safety rules in [AGENTS.md](AGENTS.md#canonical-local-app-startup).

## Project documentation

- [ClipBuilder demo source of truth](docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)
- [Standalone implementation ticket index](docs/tickets/README.md)
- [Documentation map](docs/README.md)
- [Product research summary](docs/research/AI_CLIPPING_DEMO_BRIEF.md)
- [Portfolio demo build playbook](docs/reference/PORTFOLIO_DEMO_BUILD_PLAYBOOK.md)
- [Source-of-truth maintenance prompt](docs/prompts/AI_CLIPPING_SOURCE_OF_TRUTH_PROMPT.txt)

ClipBuilder is a focused portfolio demonstration, not a production video-editing service. Source recordings must be owned or licensed, temporary media must remain private and short-lived, and real user media, transcripts, credentials, generated assets, and rendered outputs must never enter version control.

<p align="center">
  Built and maintained by <a href="https://github.com/minatamer">Mina Tamer</a>.
</p>
