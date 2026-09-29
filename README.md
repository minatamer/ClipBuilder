<h1 align="center">ClipBuilder</h1>

<p align="center">
  <strong>Turn long conversations into finished vertical clips.</strong>
</p>

<p align="center">
  <a href="docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md">Product architecture</a>
  ·
  <a href="docs/tickets/README.md">Implementation tickets</a>
  ·
  <a href="docs/README.md">Documentation</a>
</p>

ClipBuilder is an AI-assisted video editor that finds strong moments inside long-form conversations and turns the selected moment into a polished vertical clip with active-speaker framing, always-on captions, and well-timed contextual visuals.

The product is designed around one complete edit—not a pile of disconnected AI tools. It understands the conversation, chooses moments grounded in the transcript, follows whoever is speaking, illustrates useful concepts without overwhelming the footage, and renders a real downloadable MP4.

## Why ClipBuilder

| Find the moment | Follow the speaker | Build the visual story |
| --- | --- | --- |
| Identify three self-contained candidate moments and explain why each one works. | Detect who is actively speaking and keep that person centered as cameras and speakers change. | Balance the original footage with transcript-grounded stills, cutaways, information cards, and exact equations. |

## From upload to finished clip

1. **Add the conversation** — upload an owned or licensed recording, or open the purpose-built sample.
2. **Choose the moment** — review three transcript-grounded candidates with exact source ranges and clear editorial reasoning.
3. **Build the first cut** — ClipBuilder reframes the active speaker, adds captions, and places a few contextual visual beats where they genuinely help.
4. **Guide the edit** — tighten the range, correct caption text, or give one plain-language revision request.
5. **Export the result** — render and download one 1080 × 1920 H.264/AAC MP4.

Contextual visuals are chosen from what is actually being discussed. Earth, the Moon, or an equation may appear in one demonstration fixture; they are examples of the system's visual reasoning, not hard-coded assets or a recurring template.

## Built around the core edit

- **Grounded selection:** candidate moments and visual cues reference real transcript words and timestamps.
- **AI-directed framing:** active-speaker detection drives the vertical crop instead of asking the user to choose generic left, center, or right presets.
- **Purposeful visuals:** generated imagery and deterministic graphic cards support the spoken idea while preserving a healthy balance with the original footage.
- **Deterministic output:** validated edit data is compiled into an FFmpeg render rather than allowing a model to generate executable media commands.
- **Demo-sized scope:** one temporary session, one selected clip, and one final export keep the experience focused and affordable.

## Planned architecture

| Layer | Technology |
| --- | --- |
| Experience | Next.js, React, TypeScript |
| API and contracts | Node.js, Express, shared Zod schemas |
| Transcript and planning | Deepgram Nova-3, OpenAI Responses API |
| Speaker and scene analysis | Light-ASD, face tracking, PySceneDetect |
| Contextual visuals | OpenAI Image API, MathJax SVG cards |
| Composition and export | FFmpeg and ffprobe |
| Storage and execution | Google Cloud Storage, Cloud Run services and jobs |
| Abuse protection | Cloudflare Turnstile and bounded admission controls |

```text
Browser
  └─ Next.js experience + same-origin /v1 proxy
       ├─ browser-safe contracts
       └─ private Express API
            ├─ Deepgram + OpenAI adapters
            └─ bounded media jobs
                 ├─ scene + active-speaker analysis
                 ├─ visual asset assembly
                 └─ FFmpeg render + validation
```

The model proposes bounded editorial data. Deterministic application code validates that data, resolves it against the source transcript, and owns every media operation.

## Repository status

CL-001 is implemented and locally verified: the repository contains a strict
pnpm/TypeScript workspace, browser-safe shared contracts, a minimal Next.js
shell, and a private Express API with a content-free health route. Product
sessions, upload, analysis, assembly, editing, rendering, and deployment remain
owned by their dependency-ordered tickets. Technical choices marked as
proposed remain subject to the validation gates documented in the specification.

## Local foundation

Use Node.js `^22.13.0` or `^24.0.0` and the pinned pnpm `11.19.0`:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm dev:frontend
corepack pnpm dev:backend
```

The frontend is available at `http://127.0.0.1:3000`. The backend defaults to
`http://127.0.0.1:4000`; `GET /v1/health` is content-free and cannot select a
provider or paid operation. Committed configuration is documented in
`.env.example` and defaults to fake, paid-disabled behavior with credentials
blank.

Run the deterministic quality baseline from the repository root:

```powershell
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm build
```

Repository map:

```text
apps/frontend       public Next.js application shell
apps/backend        private Express API and configuration boundary
packages/contracts  browser-safe Zod contracts and compiled limits
docs                 product authority, research, and implementation tickets
test                 shared deterministic test isolation
```

## Project documentation

- [ClipBuilder demo source of truth](docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)
- [Standalone implementation ticket index](docs/tickets/README.md)
- [Documentation map](docs/README.md)
- [Original product research brief](docs/research/AI_CLIPPING_DEMO_BRIEF.md)
- [Portfolio demo build playbook](docs/reference/PORTFOLIO_DEMO_BUILD_PLAYBOOK.md)
- [Source-of-truth generation prompt](docs/prompts/AI_CLIPPING_SOURCE_OF_TRUTH_PROMPT.txt)

ClipBuilder is a focused portfolio demonstration, not a production video-editing service. Source recordings must be owned or licensed, temporary media must remain private and short-lived, and real user media, transcripts, credentials, generated assets, and rendered outputs must never enter version control.

<p align="center">
  Built and maintained by <a href="https://github.com/minatamer">Mina Tamer</a>.
</p>
