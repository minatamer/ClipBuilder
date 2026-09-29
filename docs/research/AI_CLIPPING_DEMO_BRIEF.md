# AI-Assisted Clipping Demo — Product, Architecture, and Cost Brief

- Status: Research-backed proposal, not yet an implementation source of truth
- Research date: 2026-09-29
- Companion method: [`PORTFOLIO_DEMO_BUILD_PLAYBOOK.md`](PORTFOLIO_DEMO_BUILD_PLAYBOOK.md)

## Recommendation

Build a focused, laptop-first clipping workspace—not a general video editor and
not a “viral video oracle.”

The strongest portfolio story is:

> Drop in a long conversation. The assistant finds three self-contained moments,
> explains why each could work as a short, and lets you steer one polished
> vertical cut with plain-language, reversible edits before export.

This demonstrates the private-project capabilities that matter without
reproducing private work:

- media upload and processing;
- transcript- and timestamp-aware AI reasoning;
- a real editor workspace rather than a chat wrapper;
- AI-generated edits represented as inspectable operations;
- vertical reframing and burned-in captions;
- asynchronous rendering and progress;
- privacy, cleanup, and spend controls;
- a finished MP4 a visitor can preview and download.

The AI should claim **shareability judgment**, not knowledge that a clip will go
viral. Actual current trend awareness needs a maintained platform-data source.
TikTok exposes trends in Creative Center, but its general Research API is for
qualified non-commercial researchers, not an ordinary commercial portfolio
app. A credible demo can accept user-supplied audience/topic/trend context and
explain its reasoning without claiming private recommendation-system insight.

## 1. Product thesis

### Problem

A creator can often recognize a strong moment after watching a long podcast,
but finding boundaries, turning landscape video into a legible vertical frame,
writing captions, and exporting variants is repetitive. Existing tools automate
parts of that process, yet a portfolio demo can still be compelling if it makes
the assistant's decisions visible and editable.

### User

The primary visitor is a solo podcaster, editor, or social-content manager
turning one conversation into one short-form clip. The visitor is not managing a
team, content calendar, client workspace, or publishing pipeline.

### Ten-second comprehension goal

The landing and sample path should make these facts obvious:

- a long source becomes several candidate moments;
- each candidate is grounded in exact transcript/time ranges;
- the visitor, not the model, chooses and adjusts the final cut;
- the product produces a real 9:16 video with captions;
- “likely to hold attention” is a rationale, not a promised view count.

### Product personality

The app should feel like an editorial cut room with an intelligent collaborator,
not a generic purple AI dashboard. The assistant behaves like an opinionated
junior editor: it proposes, explains, accepts direction, and never applies an
irreversible change without review.

## 2. Honest positioning

### Safe claims

- “Finds self-contained, high-potential moments in a long conversation.”
- “Ranks clips using a transparent editorial rubric.”
- “Creates a vertical, captioned draft you can adjust.”
- “Every suggestion links back to the exact words and time range.”
- “Plain-language requests become previewable edit operations.”

### Claims to avoid

- “Knows what is viral on TikTok right now.”
- “Predicts views, engagement, or virality.”
- “Understands the TikTok/Instagram algorithm.”
- “Publishes optimally without human review.”
- “Automatically clears copyright for clips, music, images, or speakers.”

TikTok's official [Creative Center](https://ads.tiktok.com/creative/creativeCenter/trends)
shows trending hashtags and videos, while [Research API access](https://developers.tiktok.com/products/research-api)
is restricted to qualified researchers and non-commercial research. For the
demo, current trend context should therefore be one optional bounded field such
as audience, target platform, topic, and user-pasted trend signals. Treat those
signals as untrusted data and date-label them in the UI.

## 3. Signature demo journey

### Stage 1 — choose a source

Offer two equal ways to see the product:

1. **Try the sample conversation** — a licensed or purpose-recorded 12–20 minute
   source with precomputed fake-mode analysis, available immediately.
2. **Upload your own synthetic/licensed video** — the bounded live path,
   protected before any metered operation.

Public copy must tell visitors to use content they own or have permission to
process. Do not accept a YouTube, TikTok, Instagram, or arbitrary remote URL in
the demo; downloading third-party content creates avoidable rights, SSRF,
format, and abuse problems.

### Stage 2 — inspect and prepare

Validate locally where possible:

- MP4/WebM container and allowed codecs;
- declared size and duration;
- presence of an audio track;
- frame size/orientation;
- whether the file fits the public or owner-only limit.

Show the exact temporary-storage promise before upload. Upload media directly to
private temporary object storage using a time-limited, object-specific
authorization; do not proxy a large video through the Next.js application.

### Stage 3 — analyze visibly

Use honest named stages rather than a fake percent:

```text
Securing upload
-> Reading media
-> Transcribing speech
-> Finding complete moments
-> Preparing previews
```

If a stage fails, preserve the original upload only for the disclosed TTL and
offer a bounded retry or clear action. Do not restart transcription because a
later ranking call failed.

### Stage 4 — choose among grounded candidates

Return three ranked candidate cards, each containing:

- start/end time and duration;
- exact opening line and closing line;
- short title/hook suggestion;
- one-sentence rationale;
- rubric signals, not a mysterious score;
- transcript excerpt with speaker labels;
- warnings such as “needs earlier context,” “speaker overlap,” or “weak ending.”

Preview candidates from the original source using time ranges and CSS/canvas
overlays. Do not render three complete MP4s before the visitor chooses one.

### Stage 5 — AI-assisted edit workspace

The editor is intentionally smaller than Premiere, Descript, or CapCut. It has:

- a large 9:16 preview;
- transcript-aligned in/out handles;
- a compact waveform or speech-density strip;
- word-level captions with direct text correction;
- crop focus choice: automatic, speaker left, speaker right, or center;
- two or three caption themes;
- optional headline text and one branded visual-accent preset;
- a plain-language assistant box;
- edit history with preview, apply, and undo.

Example instructions:

- “Make the opening tighter.”
- “Keep this under 45 seconds.”
- “Start on the surprising claim.”
- “Use calmer captions and remove the headline.”
- “Keep both speakers visible.”

The model never writes or executes FFmpeg commands. It emits a validated edit
manifest such as:

```json
{
  "baseCandidateId": "candidate-2",
  "operations": [
    { "type": "set-in", "wordId": "w-01842" },
    { "type": "set-out", "wordId": "w-02091" },
    { "type": "set-caption-theme", "theme": "clean-emphasis" },
    { "type": "set-crop-strategy", "strategy": "active-speaker" }
  ],
  "explanation": "Starts on the claim and removes 7 seconds of setup."
}
```

The application checks that every word ID exists, duration remains within
limits, operations are allow-listed, and the result can be undone. A
deterministic compiler turns the manifest into FFmpeg arguments.

### Stage 6 — render one selected clip

The final action displays the expected duration/output and triggers exactly one
render. Render a 1080 × 1920 MP4 with:

- source-accurate trim;
- deterministic crop/scale/pad rules;
- optional face-aware crop path;
- normalized audio within a conservative preset;
- burned-in ASS captions;
- optional source-controlled title/accent overlay;
- content-safe output filename.

### Stage 7 — review, download, clear

Show:

- the rendered clip;
- final duration, resolution, and file size;
- selected rationale and applied edit operations;
- download action;
- “start another” and explicit “clear media” actions;
- the automatic deletion deadline.

Do not add direct social publishing in the portfolio demo. Export proves the
workflow without OAuth scopes, platform app review, account persistence, or
publication liability.

## 4. Shareability rubric

Use a source-controlled rubric and let the model provide evidence for each
signal. Do not show a 0–100 “viral score.”

| Signal | Good evidence | Failure mode |
| --- | --- | --- |
| Immediate hook | A claim, tension, question, surprise, or concrete promise appears in the first few seconds. | Long greeting, biography, or setup. |
| Self-contained context | A new viewer can understand people, subject, and stakes from the clip itself. | Depends on an earlier story or unnamed reference. |
| Payoff | The clip resolves a question, lands a punchline, or delivers a useful takeaway. | Interesting setup with no ending. |
| Specificity | Concrete detail, example, number, or phrasing is memorable. | Generic agreement or filler. |
| Human energy | Clear disagreement, surprise, emotion, humor, or conviction is audible in the words/turn structure. | Emotion inferred from protected traits or unsupported sentiment. |
| Clean boundaries | The start is not mid-sentence and the end does not cut the thought. | Arbitrary timestamp window. |
| Appropriate length | Normally 25–75 seconds; allow 15–90 seconds when the idea requires it. | Padding solely to hit a target. |
| Visual feasibility | The relevant speaker(s) can be framed vertically and captions have safe space. | Critical content lies outside the crop. |

Candidate output should name strengths and caveats, for example:

```text
Strong hook · complete payoff · one speaker · 47 s
Caveat: the first pronoun needs 2 s of earlier context
```

## 5. Scope

### Portfolio demo — build this

- Sample and bounded upload entry paths.
- One source video per disposable session.
- Speech transcription with word timestamps and speaker labels when available.
- Three grounded candidate clips.
- Transparent shareability rationale and caveats.
- One compact transcript-based editor.
- Plain-language edits compiled to an allow-listed manifest.
- 9:16 preview, trim, crop strategy, captions, headline, and one accent preset.
- One rendered 1080 × 1920 MP4 per session by default.
- Download and explicit clear/delete.
- Temporary object storage with automatic lifecycle cleanup.
- Fake mode, synthetic fixtures, spend controls, responsive design, and public
  deployment.

### Explicitly out of scope

- Full nonlinear/multitrack editing.
- Arbitrary transitions, keyframes, color grading, audio mixing, or plugins.
- Generative video or generative B-roll.
- Scraping social platforms or downloading remote videos.
- Music licensing or a stock-media marketplace.
- Automatic publishing, scheduling, analytics, or engagement feedback.
- Accounts, teams, projects, asset library, history, collaboration, or comments.
- A database, search index, durable job catalogue, or permanent media storage.
- Model training, fine-tuning, or a learned virality predictor.
- Unlimited source duration/file size or batch processing.
- More than one simultaneous public render per instance.
- Copyright, brand-safety, or legal-clearance guarantees.

### Commercial MVP roadmap only

- Accounts and durable projects.
- Multiple sources and clip batches.
- Team review and reusable brand kits.
- Direct TikTok/YouTube/Instagram publishing after platform review.
- Customer-controlled retention and storage regions.
- Render queue, durable job state, billing, and quotas.
- Performance feedback connected to the customer's own posted clips.
- Licensed stock/B-roll search.
- More advanced active-speaker layout and multi-camera support.

## 6. Recommended architecture

Video changes one ScreenPilot assumption: a practical long source and rendered
MP4 should not live only in a request body or browser storage. The recommended
demo remains database-free but is not “storage-free” or strictly stateless.

```text
Browser
  -> Next.js frontend + same-origin /v1 proxy
       -> Express control API
            -> private temporary Cloud Storage bucket
            -> Deepgram transcription adapter
            -> OpenAI clip/editor adapter
            -> Cloud Run render job (same backend repository/image family)
                  -> ffprobe + FFmpeg + optional MediaPipe/OpenCV
                  -> private temporary output object

frontend -> contracts <- backend
```

### Why one job is justified

Cloud Run services allow requests up to 60 minutes, but long uploads and CPU
rendering are poor request/response work. Cloud Run also limits HTTP/1 requests
to 32 MiB, while ordinary video files are much larger. Google's own video
encoding tutorial uses Cloud Storage plus a Cloud Run job and FFmpeg. The job is
the one deliberate expansion beyond ScreenPilot's two-service design.

Use one codebase, not a new microservice ecosystem:

```text
apps/backend/src/server.ts       HTTP control plane
apps/backend/src/render-job.ts   bounded batch entry point
apps/backend/src/rendering/      manifest compiler and FFmpeg adapter
```

The API remains stateless. A signed `processingGrant` in the browser contains
opaque object IDs, expiry, and job execution identity. The API queries Cloud Run
execution state and private object metadata when the browser polls. No in-memory
job registry is treated as durable state.

### Temporary storage contract

- Private, single-region Standard Cloud Storage bucket.
- Random opaque object names; never include title, speaker, filename, or user
  identity.
- Direct authorized upload; the media bytes do not traverse Next.js.
- Validate actual object size/type after upload and before provider/job work.
- Explicit deletion on clear and after successful download acknowledgement when
  practical.
- Lifecycle deletion at the earliest reliable bucket rule as a backstop.
- Disable Cloud Storage soft delete for this temporary bucket; it defaults to a
  seven-day retention otherwise and would undermine the short-lived promise.
- No Object Versioning, retention lock, public ACL, or list permission for the
  browser.
- Time-limited signed download for the one output.
- Output and selected-caption manifest share the same deletion deadline.

Cloud Storage lifecycle actions are asynchronous, so the UI must say “scheduled
for deletion by …” rather than promising deletion at an exact second. The clear
action should issue direct object deletes and then report success/failure.

### Upload authorization spike

The implementation ticket should choose between a signed policy upload and a
server-initiated resumable session after testing browsers and size enforcement.
The invariant is more important than the mechanism:

- action-specific Turnstile verification before authorization;
- one opaque object and one declared content type/length;
- short expiry;
- actual metadata validation before analysis;
- invalid/oversized objects deleted without provider calls.

Google documents signed URLs/policies as time-limited object access and
recommends resumable sessions for large uploads. Do not expose bucket-wide
credentials.

### Data flow

1. Browser validates file metadata and requests an upload authorization.
2. API verifies Turnstile/rate/capacity and returns an opaque object grant.
3. Browser uploads directly to the private bucket.
4. API validates stored object metadata and starts the analysis execution.
5. Job uses FFmpeg to extract bounded mono audio and sampled frames.
6. Transcription provider returns words, timestamps, and speaker labels.
7. OpenAI returns schema-constrained candidate ranges referencing word IDs.
8. Deterministic validation clamps, rejects, or marks weak candidates; it never
   invents transcript text.
9. Browser previews candidates against the source and edits one manifest.
10. Final render request validates the manifest and starts one FFmpeg render.
11. Browser polls content-free states, then receives a short-lived output URL.
12. Clear or TTL deletion removes input, intermediate excerpt, and output.

## 7. Tool choices

### Recommended stack

| Need | Recommended tool | Reason |
| --- | --- | --- |
| Frontend/editor | Next.js, React, TypeScript | Reuses proven ScreenPilot delivery skills while the UI remains custom and portfolio-visible. |
| API/control plane | Express 5, Zod | Thin routes, explicit errors, shared runtime contracts, easy fake-provider tests. |
| Temporary media | Google Cloud Storage | Direct bounded upload/download, private objects, lifecycle cleanup, same cloud as deployment. |
| Long processing | Cloud Run Job | Batch process exits when done; no always-on worker or database required. |
| Media inspection/render | `ffprobe` and FFmpeg | Deterministic trim, crop, scale, overlay, audio, and subtitle pipeline. |
| Transcription | Deepgram Nova-3 pre-recorded | Current API provides word timestamps and diarization needed for editor-grade captions. |
| Clip selection/edit intent | OpenAI Responses + Structured Outputs | Produces a typed candidate/edit manifest; `store: false` keeps application state off. |
| Optional face tracking | MediaPipe Face Detector sampled at low FPS | Local/open model path; returns frame bounding boxes without a second paid vision API. |
| Abuse gate | Cloudflare Turnstile Free | Protect upload authorization, analysis, and render issuance. |
| Hosting | Cloud Run frontend, API, and one job | Scale-to-zero, existing operational familiarity, and bounded resource settings. |

FFmpeg officially supports crop, scale, overlay, subtitles/drawtext, and accurate
seek/transcode behavior. Avoid a deprecated wrapper; build a small typed command
compiler and call the binary with an argument array, never a shell string.

### Transcription choice

Deepgram is the pragmatic default because clipping needs word-level timestamps,
not just accurate prose. Its current pre-recorded Nova-3 response includes word
start/end times and optional speaker numbers; diarization is included in the
current rate.

OpenAI's current guide recommends `gpt-transcribe` for ordinary file
transcription, but it directs timestamp/subtitle use cases to `whisper-1`.
OpenAI has announced the older Whisper/GPT-4o transcription family for removal
on 2027-02-26. Building a new caption editor around that timestamp dependency
would create an avoidable near-term migration. Re-check this decision at
implementation time because model capabilities change quickly.

### Rendering alternatives

| Option | Advantages | Tradeoff | Recommendation |
| --- | --- | --- | --- |
| Self-hosted FFmpeg on Cloud Run Job | Cheapest unit cost, full control, strongest engineering story. | More implementation and codec/timeout testing. | **Recommended.** |
| Shotstack | Fast integration; white-label editor SDK; current PAYG render rate is $0.30/output minute. | External editor/render dependency, $75 PAYG credit purchase, less custom engineering. | Good fallback if render reliability delays the demo. |
| Creatomate | Templates, preview SDK, API, subtitles. | Starts at a monthly plan; 720p rendering uses about 14 credits/minute. | Useful for template-heavy content, not the leanest clipper. |
| Cloudinary | Upload, transformation, storage, and delivery in one service; free plan available. | Credit accounting combines transform/storage/bandwidth and can obscure per-flow cost. | Consider if media delivery matters more than the editor pipeline. |
| Mux | Excellent video ingest/player; free basic input; Robots offers key moments at $0.004/input minute + $0.02/job. | Still needs custom vertical editor/render output; can hide the core AI-selection story. | Useful accelerator or later hosting layer, not required for v1. |

Do not integrate several alternatives simultaneously. Keep one provider port so
a future spike can replace the adapter without spreading payloads through the
product.

## 8. AI contracts

### Candidate-selection input

Send only:

- bounded transcript words with stable IDs, timestamps, and speaker labels;
- source duration and orientation;
- optional content category, audience, target platform, and user-supplied trend
  signals;
- source-controlled shareability rubric;
- requested count and length range.

Do not send the full video to a text model. Optionally sample a small bounded set
of frames around transcript candidates for deterministic face-layout analysis,
not for judging people.

### Candidate-selection output

```ts
type ClipCandidate = {
  id: string;
  startWordId: string;
  endWordId: string;
  title: string;
  hook: string;
  rationale: string;
  signals: Array<
    | "immediate-hook"
    | "self-contained"
    | "clear-payoff"
    | "specific"
    | "human-energy"
    | "clean-boundaries"
  >;
  caveats: string[];
  suggestedCrop: "center" | "speaker-left" | "speaker-right" | "active-speaker";
};
```

Server reconciliation must:

- resolve word IDs to actual timestamps;
- reject missing, reversed, overlapping, or out-of-range references;
- enforce min/max duration;
- preserve exact transcript words;
- deduplicate near-identical candidates;
- prevent all candidates from coming from one narrow region unless the source
  genuinely contains no alternatives;
- attach a rule ID to every rejection/repair;
- avoid an automatic paid repair call.

### Edit-intent output

Only allow operations the deterministic editor already supports. No arbitrary
filter graph, shell fragment, URL, asset fetch, font path, or filesystem path may
come from the model.

Every proposal shows a diff:

```text
Start: 12:41.2 -> 12:47.8
Length: 58 s -> 43 s
Captions: Bold pop -> Clean emphasis
Crop: Center -> Active speaker
```

The user explicitly applies it and can undo it.

## 9. Rendering plan

### Preview versus export

The browser preview composes the original video, crop transform, caption layer,
and title layer without creating a new file. It is allowed to be approximate but
must use the same edit manifest as export.

The renderer compiles that manifest to a deterministic FFmpeg graph. Keep a
golden set of expected commands and rendered-frame snapshots for representative
inputs.

### Crop strategies

1. **Center** — deterministic crop/pad; always available.
2. **Speaker left/right** — user-selected fixed focus.
3. **Active speaker** — optional sampled face detection plus diarized speaker
   turns; smooth crop centers with bounded movement.

If face tracking is uncertain, fall back visibly to center or a user-selected
focus. Do not oscillate or jump. A split-screen multi-speaker layout is roadmap,
not required for the first demo.

### Captions

- Use word timestamps to form readable 2–7 word caption groups.
- Keep line length and safe zones bounded.
- Preserve user corrections separately from the provider transcript.
- Generate an ASS file for styling and render it through FFmpeg.
- Support ordinary Latin text first; if Arabic is in scope, test bidi shaping,
  font coverage, punctuation, and line breaking as a named acceptance gate.
- Never silently rewrite the spoken meaning to make a caption punchier.

### Visual accents

Keep v1 deterministic and copyright-safe:

- headline card;
- source-controlled shape/icon accents;
- subtle punch-in at one chosen emphasis point;
- highlighted caption keywords selected from transcript words;
- optional progress bar.

Do not add generative imagery or scraped B-roll merely to make the clip busier.
Those features increase rights, latency, cost, and visual inconsistency while
weakening the core clipping story.

## 10. Cost estimate

All prices below were checked on 2026-09-29 and must be re-checked before
implementation or public launch. Taxes, currency conversion, region, free-tier
sharing, provider promotions, retries, failed jobs, and network destination can
change the result.

### Planning scenario

One completed live flow:

- 60-minute monolingual source;
- roughly 20,000 text-model input tokens and 2,000 output tokens after adding
  IDs/timestamps/instructions;
- three browser-preview candidates;
- one 60-second rendered 1080 × 1920 clip;
- 15-minute Cloud Run Job using 2 vCPU and 4 GiB memory;
- about 1.1 GiB combined input/output/intermediate storage for 24 hours;
- no automatic retry.

| Component | Current rate/assumption | Estimated flow cost |
| --- | ---: | ---: |
| Deepgram Nova-3 monolingual pre-recorded | $0.0043/input minute | **$0.258** |
| OpenAI clip selection/edit plan | GPT-6 Sol Standard short-context planning rate; 20k input + 2k output | **about $0.03** |
| Cloud Run render job | 2 vCPU + 4 GiB for 900 s at current us-central1 job list rates | **about $0.040** before free tier |
| Cloud Storage at rest | 1.1 GiB × 24 h × $0.000027397/GiB-hour | **under $0.001** |
| Storage operations and same-region transfer | Small request count; same-region Google transfer is free | **well under $0.01** in normal use |
| Output internet transfer | Destination/allowance dependent | **budget $0.00–$0.10** |

Calculated base before output transfer: about **$0.33**. A responsible planning
allowance is **$0.40–$0.60 per successful one-hour-source flow**, or
**$0.50–$0.80** after reserving for occasional failed/retried processing.

If the source needs multilingual Deepgram at $0.0052/minute, transcription is
about **$0.312/hour**, adding roughly five cents. If a stronger/faster OpenAI
service tier or multiple edit calls are used, measure them separately rather
than hiding them in the render total.

### Managed-render comparison

Shotstack currently charges $0.30 per output minute on PAYG and $0.20/minute on
its subscription. One rendered minute would therefore move the same flow to
roughly **$0.65–$0.95** before retry reserve; rendering three one-minute variants
would add $0.90 PAYG and push the flow toward **$1.25–$1.60**. This is why the
recommended UX previews three candidates but renders one selection.

### Low-traffic monthly cost

| Item | Planning expectation |
| --- | --- |
| Cloud Run frontend/API/job | Often $0 at portfolio traffic inside the account-level free tier; not guaranteed. |
| Cloud Storage | Often $0 in eligible U.S. regions under the 5 GiB-month free allowance; otherwise only cents with prompt cleanup. |
| Artifact Registry / logging / secrets | Usually $0 or a small standing charge if artifacts/logs are kept bounded. |
| Domain | Optional; use `run.app` first, then target no more than about $15/year renewal before tax. |
| Providers | Usage based; the main recurring variable cost. |

Cloud Run's current free tier for jobs is 240,000 vCPU-seconds and 450,000
GiB-seconds per billing account/month. At the planning resource shape, compute
may remain free for dozens of demos, but provider transcription still costs per
minute after promotional credits. Free allowance is not the same as zero unit
cost.

### Development cash budget

A self-built prototype can plausibly stay in **$0–$50 of provider/cloud spend**
while using synthetic fixtures and current trial/free credits. Keep a separate
budget for a domain if desired. The meaningful cost is engineering and QA:

- **Narrative prototype:** precomputed sample, candidates, editor UI, fake render;
  roughly 30–50 focused hours.
- **Working portfolio demo:** bounded uploads, real transcription, grounded AI,
  FFmpeg job, cleanup, safeguards, deployment; roughly 80–140 focused hours.
- **Commercial MVP:** durable projects, queue, accounts, billing, publishing,
  storage controls, support; several times the portfolio-demo effort.

These are scope estimates, not contractor quotes. The ticket breakdown and
quality bar matter more than calendar time.

## 11. Public-demo limits and spend controls

Recommended initial values:

| Control | Public sample/live default | Owner-controlled validation ceiling |
| --- | ---: | ---: |
| Source duration | sample 12–20 min; upload max 20 min | 60 min |
| Source bytes | 500 MiB | 1.5 GiB |
| Candidate count | 3 | 5 |
| Candidate duration | 15–90 s | 15–120 s |
| Final renders/session | 1 | 3 |
| Render output | 1080 × 1920, H.264/AAC | same |
| Concurrent render jobs | 1 | 1 |
| Worker maximum instances | 1 | 1 |
| Temporary retention | explicit delete + lifecycle backstop | same |

The public upload duration can be raised only after measured cost and render
latency. The sample proves long-form selection without letting every anonymous
visitor submit an hour of media.

Layer controls as follows:

- fake default and `PAID_DEMO_ENABLED=false`;
- separate `LIVE_UPLOAD_ENABLED` and `LIVE_RENDER_ENABLED` switches;
- Turnstile before upload authorization, transcription/analysis, and render;
- one content-free signed session cookie/grant;
- per-source and route-global rate limits;
- one in-flight analysis and one render lease;
- exact byte/duration/candidate/output bounds;
- no automatic paid repair/retry;
- Cloud Run max instances `1`, render job tasks `1`, retries `0` initially;
- provider project hard spend limit and alerts;
- Google Cloud budgets/alerts;
- delete input on validation failure;
- content-free cost ledger for controlled synthetic flows.

## 12. Privacy, rights, and safety

### Data inventory

| Artifact | Lifetime |
| --- | --- |
| Original video | Private temporary bucket until clear/expiry; never committed or logged. |
| Extracted audio | Job-local temporary file; remove before exit. Persist only if a measured provider workflow requires it, under the same TTL. |
| Full transcript | Return to active browser session; avoid durable server storage. |
| Selected caption excerpt/edit manifest | Browser session plus temporary render input object until render/expiry. |
| Candidate rationales | Active browser session only. |
| Rendered clip | Private temporary object until download/clear/expiry. |
| Operational record | Content-free IDs, stages, durations, byte/minute/token counts, and failure categories only. |

OpenAI states that API data is not used for model training by default unless the
customer opts in. Its current data-controls table lists `/v1/audio/transcriptions`
with no abuse-monitoring or application-state retention and says Responses can
avoid application-state storage with `store: false`; ordinary API abuse
monitoring rules still need review for the selected text endpoint/project.
Deepgram's current settings and model-improvement opt-in/out state must likewise
be checked in the actual project before any non-synthetic use.

### Rights rules

- Use only synthetic, purpose-recorded, public-domain, or explicitly licensed
  sample media.
- Tell uploaders they must have rights/permission for the video, voices, music,
  and export.
- Do not download from platform URLs.
- Do not include copyrighted music in the checked-in sample unless licensed for
  redistribution.
- Do not claim the tool grants publication rights.
- Do not infer sensitive traits, speaker identity, or emotion/personality from
  faces or voices.
- Face detection is used only to place a crop and its coordinates are
  request-scoped.

## 13. Design direction

Create a new visual language rather than reskinning ScreenPilot.

### Working thesis — “Editorial Signal Room”

- Near-black editing canvas with warm off-white document/transcript surfaces.
- One electric editorial accent such as acid lime or signal yellow, plus a
  restrained red for destructive trim/delete states.
- Timecode and technical metadata in a mono face; headlines/transcript in a
  confident grotesk or editorial sans.
- The vertical video is the visual hero, not a decorative AI orb.
- Candidate moments appear as cut marks/ranges across one continuous source,
  reinforcing that the AI found evidence rather than invented content.
- The assistant rail shows proposed operations and before/after diffs, not a
  stream of chat bubbles.
- Motion resembles scrubbing, snapping, and assembling; no floating gradients
  or endless shimmer.

### Signature desktop composition

```text
┌ source / project bar ───────────────────────────────────────────┐
│ transcript + candidates │ 9:16 preview │ assistant / edit diff │
│                         │              │                       │
├─────────────────────────┴──────────────┴───────────────────────┤
│ waveform · in/out · speaker turns · caption groups             │
└─────────────────────────────────────────────────────────────────┘
```

Desktop/laptop is the primary authoring surface. Tablet stacks the assistant as
a drawer. Phone preserves candidate choice, vertical preview, transcript/caption
correction, assistant edits, and export; the dense timeline becomes large
stepper/trim controls instead of a squeezed desktop strip.

Create one HTML design reference and one generated desktop/mobile editor
concept before broad React styling, following the companion playbook.

## 14. Reliability behavior

| Failure | Required behavior |
| --- | --- |
| Unsupported/oversized video | Fail before upload/provider use; explain accepted limits. |
| Upload interrupted | Resume only when the chosen mechanism supports it; otherwise restart the one object without starting analysis. |
| Missing audio | Offer local visual-only rejection; do not hallucinate clips. |
| Transcription failure | Preserve upload until TTL; allow one manual retry or clear. |
| Invalid candidate schema | Fail the paid operation with a content-safe rule ID; no automatic repair call. |
| Weak/no candidate | Say no strong self-contained moment met the rubric; allow transcript browsing/manual range. |
| Face detection failure | Use center/user focus; never block transcript clipping. |
| Assistant edit invalid | Show why it cannot apply and preserve current edit. |
| Render failure | Keep manifest and source until TTL; offer one manual retry without repeating transcription/ranking. |
| Browser refresh during analysis | Restore signed processing grant and poll actual execution state; never start a duplicate job. |
| Refresh during edit | Restore only the allow-listed edit session, never signed URLs beyond their expiry. |
| Clear | Delete input/intermediate/output, revoke local state, and report any cleanup failure honestly. |

## 15. Evaluation plan

### Synthetic/licensed fixture set

Include at least:

- single-speaker clean monologue;
- two-speaker podcast with clear turns;
- overlap/crosstalk;
- long intro before the payoff;
- several plausible moments;
- no strong self-contained moment;
- vertical source and landscape source;
- silent/missing-audio input;
- variable frame rate and awkward codec within supported bounds;
- prompt-injection-like spoken content;
- long names, numbers, and punctuation;
- Arabic/English code-switching only if multilingual support is promised.

### Candidate-selection graders

- references resolve to existing word IDs;
- duration/boundaries are legal;
- opening is not an obvious dependent fragment;
- ending contains the claimed payoff;
- rationale cites transcript evidence rather than platform folklore;
- no promised views/virality;
- no invented quote/title fact;
- candidates are materially distinct;
- adversarial transcript instructions do not change system policy;
- one request produces one model operation.

### Render checks

- audio/video/caption sync at start, middle, and end;
- exact duration tolerance;
- valid H.264/AAC MP4 metadata;
- correct 1080 × 1920 display and square pixels;
- no black/transparent frame unless selected strategy requires padding;
- captions remain inside safe zones and readable over light/dark footage;
- crop does not jump beyond the smoothing limit;
- output filename and metadata contain no source identity;
- temporary files close and delete on success, failure, abort, and timeout.

### Manual portfolio acceptance

1. Sample reaches candidate selection in fewer than 15 seconds.
2. Three candidates visibly map to different exact source ranges.
3. Visitor understands why candidate one was preferred without seeing a fake
   score.
4. Plain-language edit produces a previewable operation diff and undo.
5. Manual transcript/caption correction changes the export, not the canonical
   provider transcript.
6. One final MP4 renders, plays, downloads, and stays in sync.
7. Provider/render failure preserves completed work.
8. Clear deletes browser state and requests remote artifact deletion.
9. Core journey works on phone/tablet and authoring workspace is excellent at
   1024 × 768, 1280 × 800, 1440 × 900, 1920 × 1080, and an intermediate resize.
10. One owner-controlled 60-minute synthetic flow is measured before raising
    the public limit.

## 16. Suggested ticket sequence

| Ticket | Scope | Dependency |
| --- | --- | --- |
| CL-001 | Initialize workspace, commands, fake/paid-disabled config, secret rules. | — |
| CL-002 | Write source of truth, contracts skeleton, error envelope, synthetic media policy. | CL-001 |
| CL-003 | Create and approve Editorial Signal Room HTML reference and one editor concept. | CL-001 |
| CL-004 | Define canonical session reducer, persisted projection, clear/expiry behavior. | CL-002 |
| CL-005 | Add sample media, ffprobe metadata schema, local validation, and fake analysis fixture. | CL-002 |
| CL-006 | Build landing/source intake and immediate sample journey. | CL-003, CL-004, CL-005 |
| CL-007 | Implement private temporary upload authorization, object validation, and cleanup. | CL-002, CL-005 |
| CL-008 | Add render-job foundation, FFmpeg extraction, progress states, and fake job adapter. | CL-007 |
| CL-009 | Add Deepgram transcription adapter, word/speaker contract, and transcript fixtures. | CL-008 |
| CL-010 | Add OpenAI candidate selection, grounded reconciliation, and eval fixtures. | CL-009 |
| CL-011 | Build candidate browser previews and transparent rationale UI. | CL-006, CL-010 |
| CL-012 | Build editor manifest, transcript trim/captions/crop controls, preview, undo. | CL-003, CL-011 |
| CL-013 | Add plain-language edit adapter and allow-listed operation reconciliation. | CL-012 |
| CL-014 | Compile manifest to FFmpeg and render/download one selected clip. | CL-008, CL-012 |
| CL-015 | Add Turnstile, admission/rate/capacity controls, kill switches, and content-safe logs. | CL-007, CL-009, CL-014 |
| CL-016 | Harden privacy, cleanup, accessibility, responsiveness, and performance. | CL-015 |
| CL-017 | Run manual release QA and whole-codebase/ticket audit. | CL-016 |
| CL-018 | Deploy exact audited revision and measure one sample plus one bounded live flow. | CL-017 |

Keep CL-003 behind an owner visual approval gate. Keep live provider calls out of
CL-009/CL-010 until fake fixtures and cost controls pass.

## 17. Decisions the owner should make before implementation

1. Is public arbitrary upload enabled, or is live upload owner-only while the
   public uses the sample?
2. Is English-only acceptable for v1, or must Arabic/English captioning be a
   release requirement?
3. Is active-speaker crop essential, or can center/user-selected focus ship
   first?
4. What is the maximum public source: 20 minutes/500 MiB, or another measured
   bound?
5. Is one final render per session enough for the portfolio story?
6. Should users paste optional current trend signals, or should the first demo
   avoid trend context entirely?
7. Is the checked-in sample purpose-recorded, commissioned, public-domain, or
   licensed for redistribution?
8. Does the portfolio need only download, or is direct publishing strategically
   important enough for a later audited integration?
9. What is the working name and visual accent after a basic name/domain check?
10. What monthly provider hard limit and Google Cloud alert budget are
    acceptable?

Recommended defaults are: public sample plus bounded live upload, English first,
center/user crop before active-speaker tracking, one final render, no current
trend feed, purpose-recorded sample, download only, and the lowest provider
hard limit that still permits controlled testing.

## 18. Agent handoff summary

An implementation agent should receive this brief plus a promoted source of
truth and exactly one active ticket. The non-negotiable summary is:

> Build a database-free, temporary-storage AI clipping portfolio demo. The user
> uploads one owned/licensed conversation or opens the sample, receives three
> transcript-grounded candidate moments, chooses one, directs reversible edits,
> and exports one vertical captioned MP4. The AI emits only structured candidate
> and edit manifests referencing real word IDs. Deterministic code validates and
> compiles those manifests to FFmpeg. Do not claim virality or current platform
> knowledge, scrape/download platform media, generate B-roll, publish to social
> accounts, or add accounts/projects/history. Default to fake and paid-disabled;
> protect live upload, analysis, and render separately; store media only in a
> private short-TTL bucket; log no content; render only the selected clip; and
> report every live, paid, visual, cleanup, and deletion check explicitly.

## 19. Official research references

### OpenAI

- [API pricing](https://developers.openai.com/api/docs/pricing)
- [File transcription guide](https://developers.openai.com/api/docs/guides/speech-to-text)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Data controls](https://developers.openai.com/api/docs/guides/your-data)
- [Model deprecations](https://developers.openai.com/api/docs/deprecations)

### Transcription

- [Deepgram pricing](https://deepgram.com/pricing)
- [Deepgram pre-recorded transcription](https://developers.deepgram.com/docs/pre-recorded-audio)
- [Deepgram speaker diarization](https://developers.deepgram.com/docs/diarization)
- [AssemblyAI speaker diarization](https://www.assemblyai.com/docs/pre-recorded-audio/label-speakers)

### Media processing and hosting

- [FFmpeg filters](https://ffmpeg.org/ffmpeg-filters.html)
- [FFmpeg seeking and trimming](https://ffmpeg.org/ffmpeg.html)
- [Cloud Run pricing](https://cloud.google.com/run/pricing)
- [Cloud Run quotas and request limits](https://docs.cloud.google.com/run/quotas)
- [Cloud Run jobs](https://cloud.google.com/run/docs/create-jobs)
- [Google's FFmpeg video-encoding job tutorial](https://docs.cloud.google.com/run/docs/tutorials/video-encoding)
- [Cloud Storage pricing](https://cloud.google.com/storage/pricing)
- [Cloud Storage signed URLs](https://docs.cloud.google.com/storage/docs/access-control/signed-urls)
- [Cloud Storage lifecycle management](https://docs.cloud.google.com/storage/docs/lifecycle)
- [Cloud Storage soft delete](https://docs.cloud.google.com/storage/docs/soft-delete)
- [MediaPipe face detector](https://ai.google.dev/edge/api/mediapipe/python/mp/tasks/vision/FaceDetector)

### Platform and managed-video alternatives

- [TikTok Creative Center trends](https://ads.tiktok.com/creative/creativeCenter/trends)
- [TikTok Research API eligibility](https://developers.tiktok.com/products/research-api)
- [TikTok Content Posting API](https://developers.tiktok.com/products/content-posting-api)
- [Shotstack pricing](https://shotstack.io/pricing/)
- [Creatomate pricing](https://creatomate.com/pricing)
- [Cloudinary pricing and plans](https://cloudinary.com/pricing)
- [Mux pricing](https://www.mux.com/pricing)

