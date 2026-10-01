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

ClipBuilder is an automatic AI-assisted clipping demo that finds strong moments
inside long-form conversations and turns one visitor-selected moment into a
polished vertical clip with active-speaker framing, one fixed caption style,
and well-timed contextual visuals.

The product is designed around one complete result—not a pile of disconnected
AI tools or editing controls. It understands the conversation, proposes up to
four moments grounded in the transcript, lets the visitor choose exactly one,
automatically composes it, and renders a real downloadable MP4.

## Why ClipBuilder

| Find the moment | Follow the speaker | Build the visual story |
| --- | --- | --- |
| Identify up to four self-contained candidate moments and explain why each one works without padding weak results. | Detect who is actively speaking and keep that person centered as cameras and speakers change. | Balance the original footage with transcript-grounded stills, cutaways, information cards, and exact equations. |

## From upload to finished clip

1. **Add the conversation** — upload an owned or licensed recording, or open the purpose-built sample.
2. **Choose one moment** — preview up to four transcript-grounded candidates
   with exact source ranges and clear editorial reasoning, then select exactly
   one.
3. **Build automatically** — ClipBuilder reframes the active speaker, applies
   its fixed readable captions, and places a few contextual visual beats where
   they genuinely help.
4. **Review and confirm** — play the completed read-only preview and confirm the
   single render; there is no editor, chatbot, trim, caption-style, or visual
   control surface.
5. **Download the result** — receive one validated 1080 × 1920 H.264/AAC MP4.

Contextual visuals come from what is actually being discussed, not a fixed
example or recurring template.

## Built around the core edit

- **Grounded selection:** candidate moments and visual cues reference real transcript words and timestamps.
- **AI-directed framing:** active-speaker detection drives the vertical crop instead of asking the user to choose generic left, center, or right presets.
- **Purposeful visuals:** generated imagery and deterministic graphic cards support the spoken idea while preserving a healthy balance with the original footage.
- **Deterministic output:** validated edit data drives one shared browser compositor and local export; the model never generates executable media commands.
- **Demo-sized scope:** one temporary session, one selected clip, and one final export keep the experience focused and affordable.
- **No editing surface:** candidate selection and render confirmation are the
  only creative decisions exposed to the visitor.

## Planned architecture

| Layer | Technology |
| --- | --- |
| Experience | Next.js, React, TypeScript |
| API and contracts | Node.js, Express, shared Zod schemas |
| Transcript and planning | Deepgram Nova-3, OpenAI Responses API |
| Speaker and scene analysis | Browser audiovisual-model feasibility gate; no assumed Python server path |
| Contextual visuals | OpenAI Image API, MathJax SVG cards |
| Composition and export | Proposed WebCodecs/Mediabunny worker pipeline and shared browser compositor |
| Local media storage | Proposed OPFS binaries, IndexedDB journal/results; bounded File/Blob fallback |
| Hosting | Frontend and protected request-scoped AI API; no content bucket/database/media job |
| Abuse protection | Cloudflare Turnstile and bounded admission controls |

```text
Browser
  +-- Next.js experience + local source/results/assets/output
  +-- browser-safe contracts + workers + local compositor/encode
  +-- same-origin protected bounded audio/text requests
       +-- private Express API -> Deepgram/OpenAI adapters
       +-- bounded results/assets returned to browser; no durable content store
```

The model proposes bounded editorial data. Deterministic application code validates that data, resolves it against the source transcript, and owns every media operation.

The original video and final MP4 stay on-device. AI audio/text transfer and
provider retention remain explicit privacy gates. Browser codecs, active-speaker
quality, full-bound device performance and no-shared-store paid safeguards are
not yet proved; see the [current architecture plan](docs/architecture/BROWSER_OWNED_MEDIA.md).

## Repository status

CL-001 and CL-003 are implemented and locally verified. CL-002's colors/type
are an interim foundation. CL-004 previews the whole single-card journey at
`/start` in development-only fake mode: intake and simulated progress, three
prepared 58-second choices, one selection, read-only review and export states.
It does not read/upload files, edit recorded footage or produce a downloadable
video. Recorded media and owner approval of the revised UI remain pending.
Real local media, protected analysis, automatic assembly, local export/download, and
deployment remain owned by their dependency-ordered tickets. Technical choices
marked as proposed remain subject to the documented validation gates.

## Local foundation

Use Node.js `^22.13.0` or `^24.0.0` and the pinned pnpm `11.19.0`:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm dev:frontend
corepack pnpm dev:backend
```

Run the two development commands in separate terminals. Open the workflow at
`http://localhost:3000/start` (matching the committed origin policy).
The backend defaults to
`http://127.0.0.1:4000`; `GET /v1/health` is content-free and cannot select a
provider or paid operation. Committed configuration is documented in
`.env.example` and defaults to fake, paid-disabled behavior with credentials
blank. An ignored root `.env.local` is loaded only by explicit backend startup;
`FAKE_MODE=true` selects the development preview. False does not enable the
unimplemented real pipeline or bypass readiness/paid gates.

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
- [Product research summary](docs/research/AI_CLIPPING_DEMO_BRIEF.md)
- [Portfolio demo build playbook](docs/reference/PORTFOLIO_DEMO_BUILD_PLAYBOOK.md)
- [Source-of-truth maintenance prompt](docs/prompts/AI_CLIPPING_SOURCE_OF_TRUTH_PROMPT.txt)

ClipBuilder is a focused portfolio demonstration, not a production video-editing service. Source recordings must be owned or licensed, temporary media must remain private and short-lived, and real user media, transcripts, credentials, generated assets, and rendered outputs must never enter version control.

<p align="center">
  Built and maintained by <a href="https://github.com/minatamer">Mina Tamer</a>.
</p>
