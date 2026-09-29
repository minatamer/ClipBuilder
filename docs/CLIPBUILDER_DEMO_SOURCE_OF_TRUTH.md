# ClipBuilder Demo — Product and Architecture Source of Truth

- Status: Implementation-ready specification; revised 2026-09-30 around the locked automatic one-choice demo flow
- Document authority: Product, behavior, architecture, data, cost, design, verification, and release decisions for the portfolio demo
- Created: 2026-09-29
- Research baseline: 2026-09-29; provider names, prices, limits, and policies must be re-checked before live-provider work or launch
- Inputs: `research/AI_CLIPPING_DEMO_BRIEF.md`, `reference/PORTFOLIO_DEMO_BUILD_PLAYBOOK.md`, and `prompts/AI_CLIPPING_SOURCE_OF_TRUTH_PROMPT.txt`
- Supersedes: The brief as an implementation authority; the brief remains supporting research and decision-history context
- Does not authorize: Implementation, paid provider calls, cloud changes, deployment, credential creation, media licensing, or public launch

## Contents

1. [Purpose, authority, and decision language](#0-purpose-authority-and-decision-language)
2. [Locked product contract](#1-locked-product-contract)
3. [Scope boundaries](#2-scope-boundaries)
4. [Success criteria and non-goals](#3-success-criteria-and-non-goals)
5. [End-to-end signature journey](#4-end-to-end-signature-journey)
6. [Canonical workflow and state transitions](#5-canonical-workflow-and-state-transitions)
7. [Screen-by-screen experience](#6-screen-by-screen-experience)
8. [Automatic composition and preview parity](#7-automatic-composition-and-preview-parity)
9. [System architecture](#8-system-architecture)
10. [Repository and decision ownership](#9-repository-and-decision-ownership)
11. [Shared contract vocabulary and exact limits](#10-shared-contract-vocabulary-and-exact-limits)
12. [HTTP API](#11-http-api)
13. [Provider ports, prompts, and deterministic fakes](#12-provider-ports-prompts-and-deterministic-fakes)
14. [Media analysis, assembly, and render pipeline](#13-media-analysis-assembly-and-render-pipeline)
15. [Temporary storage and job lifecycle](#14-temporary-storage-and-job-lifecycle)
16. [Privacy, rights, safety, and security](#15-privacy-rights-safety-and-security)
17. [Configuration and environment schema](#16-configuration-and-environment-schema)
18. [Paid operations and spend](#17-paid-operations-timeouts-retries-concurrency-and-spend)
19. [Visual design system](#18-visual-design-system)
20. [Accessibility](#19-accessibility)
21. [Verification strategy](#20-verification-strategy)
22. [Deployment and operations](#21-deployment-and-operations)
23. [Implementation sequence](#22-implementation-sequence)
24. [Release acceptance checklist](#23-release-acceptance-checklist)
25. [Owner decisions still required](#24-owner-decisions-still-required)
26. [Implementation-agent handoff](#25-implementation-agent-handoff)
27. [Appendices](#appendix-a--recovery-matrix)

## 0. Purpose, authority, and decision language

This document turns the research brief into a buildable portfolio-demo contract.
It defines what the product is, what it is not, how every stage behaves, which
layer owns each decision, and what evidence is required before release. An
implementation agent should not need to invent a material product or
architecture behavior.

This is a portfolio demo, not a disguised production SaaS. It is intentionally
small, disposable, cheap to operate, and deep in the places that demonstrate
engineering judgment: grounded AI output, automatic media composition,
deterministic rendering, temporary-data handling, failure recovery, and spend
control.

### 0.1 Authority order

When sources disagree, use this order:

1. the latest explicit owner decision;
2. this source of truth;
3. an approved architecture decision record, if one is later created;
4. the active implementation ticket for its bounded scope;
5. the AI clipping brief and portfolio-demo playbook;
6. historical research, mockups, and experiments.

A ticket may narrow work but may not silently change this document. A visual
concept may propose composition but may not invent behavior, remove a state, or
override accessibility. Provider documentation governs the provider's actual
API, but changing provider-facing behavior still requires an update here.

### 0.2 Decision labels

Every material choice uses one of these labels:

- **Locked** — implementation may rely on it.
- **Proposed - owner approval required** — the recommended default is fully
  specified, but it must not be represented as an approved owner decision.
  Deterministic foundations and fake-mode work may proceed; the named approval
  gate blocks the live, public, privacy-sensitive, or cost-bearing portion.
- **Deferred** — roadmap context only. Do not build it.
- **Rejected for demo** — deliberately excluded. Do not reintroduce it through
  a ticket or convenience abstraction.

Small implementation details not named here may be chosen reversibly inside a
ticket. Any choice that changes scope, architecture, privacy, rights, cost,
public claims, or the portfolio story must be promoted into this document.

### 0.3 Material decision register

| Area | Decision | Status | Consequence / gate |
| --- | --- | --- | --- |
| Product type | Public portfolio demo with one disposable clipping session | **Locked** | Optimize one coherent journey; do not add accounts, CRUD, or durable projects. |
| Product identity | **ClipBuilder** is the product name; `tryclipbuilder.com` is the preferred public domain. **ClipAssistant** is the backup name if the primary identity or domain becomes unusable. | **Locked** | Display the product as “ClipBuilder”; `try` belongs only to the domain and is not part of the product name or wordmark. The backup name does not authorize a chat or assistant interface. This decision records the preferred domain but does not authorize registration or purchase. |
| Product promise | One long owned/licensed conversation becomes up to four grounded candidate moments; the visitor chooses exactly one and receives one automatically composed vertical clip with speaker-aware framing, fixed captions, and contextual visuals | **Locked** | The finished clip—not editing controls—is the center of the demo. |
| Interaction model | Selection and confirmation only; no editor, chatbot, assistant prompt, manual trim, caption styling, visual controls, undo, or redo | **Locked** | After choosing one candidate, the visitor watches automatic preparation, reviews the completed preview, confirms one render, and downloads it. |
| AI claim | Editorial shareability judgment, never virality prediction or private algorithm knowledge | **Locked** | Copy, schemas, prompts, and evaluations must reject unsupported performance claims. |
| State | No application database; use browser state plus narrow private temporary objects and content-free coordination markers | **Locked** | Object storage is not a general record system; all objects expire and are clearable. |
| Public live upload | Include one bounded anonymous live upload in addition to the sample | **Locked** | Upload is part of the product flow. It remains disabled in committed/default/test configuration and cannot be enabled in a deployment until the security, privacy, spend, provider, and launch gates pass. |
| Languages | English transcription and Latin-script caption QA for v1 | **Proposed - owner approval required** | Arabic/English code-switching is not claimed until bidi, font, punctuation, and provider tests pass. |
| Speaker framing | Detect camera cuts, visible faces, and the active speaker, then keep the speaking person centered in the vertical frame | **Locked** | Active-speaker reframing is a core proof, not an optional feature or manual crop preset. |
| Active-speaker tool | Spike Light-ASD first; compare TalkNet only if the spike fails the sample/CPU target | **Proposed - owner approval required** | The chosen model must run on the purpose-recorded sample inside the bounded media job before architecture is locked. |
| Contextual visuals | AI plans and inserts 1–3 grounded visual beats using generated stills or deterministic graphic/equation cards | **Locked** | Visual storytelling is a core automatic-composition layer, not a vague decorative accent. |
| Visual asset tool | OpenAI Image API with a fast current GPT Image model for generated stills/cutouts; MathJax SVG for exact equations/cards | **Proposed - owner approval required** | Re-check model access, cost, latency, data policy, and visual quality before live enablement. |
| Public source bound | 20 minutes **and** 500 MiB; owner validation ceiling 60 minutes and 1.5 GiB | **Locked** | A public upload must satisfy both independent ceilings. Raising them requires a future spec/code revision plus measured latency and cost evidence; runtime configuration may only lower them. |
| Render count | One final render per public session | **Locked** | Browser previews zero to four candidates; only the one selected automatic manifest renders. |
| Trend context | Omit trend-signal input from the first public demo | **Locked** | The demo avoids stale or user-injected platform claims. Candidate reasoning uses the source transcript and the source-controlled editorial rubric only. |
| Sample rights | Use purpose-recorded media and signed contributor permission | **Proposed - owner approval required** | No sample media enters Git or deployment until provenance is recorded. |
| Publishing | Download only; no direct social publishing | **Locked** | No platform OAuth, app review, scheduling, or posting liability. |
| Upload mechanism | Server-created resumable Cloud Storage upload session | **Proposed - owner approval required** | A time-boxed browser spike must prove CORS, size enforcement, abort, and cleanup before live upload implementation. |
| Refresh recovery | Store a normalized transcript/candidate bundle in the private temporary bucket under the source TTL | **Proposed - owner approval required** | This is the minimum privacy tradeoff that enables truthful refresh recovery without a database. |
| Cloud region | `us-central1` for the first cost-validated deployment | **Proposed - owner approval required** | If residency or audience latency matters more, choose one compatible region before provisioning. |
| Text model | OpenAI Responses API with `gpt-6-sol`, Structured Outputs, and `store: false` | **Proposed - owner approval required** | Re-check availability, pricing, retention, and project access before enabling live calls. |
| Transcription | Deepgram Nova-3 pre-recorded with word timestamps and diarization | **Proposed - owner approval required** | Re-check language, retention, opt-out, limits, and project settings before live use. |
| Visual direction | A modern, minimal, product-first system with spacious neutral surfaces, deep ink, and a restrained cobalt signal | **Proposed - owner approval required** | Broad screen styling waits for approval of the real responsive Next.js/React landing prototype. |
| Retention | Session access expires after 2 hours; objects are explicitly deleted on clear and lifecycle-eligible after 1 day | **Proposed - owner approval required** | UI must describe asynchronous deletion honestly; do not promise an exact deletion second. |
| Monthly spend | Start with the lowest provider hard caps that permit two owner-controlled full live validations | **Proposed - owner approval required** | Live flags stay off until numerical caps and alerts are recorded in release evidence. |

### 0.4 Approval gates

These gates are deliberate stop points, not missing implementation detail:

1. **Product gate:** approve the v1 language claim. The flow, public source
   limits, public-upload inclusion, one-render limit, and absence of trend input
   are already locked.
2. **Rights gate:** approve the sample, proof of permission, attribution, and
   redistribution terms.
3. **Visual gate:** approve the real responsive Next.js/React landing prototype
   at desktop and phone widths before broad application styling.
4. **Provider/privacy gate:** approve provider projects, data settings, region,
   temporary transcript storage, and public privacy copy.
5. **Spend gate:** record hard limits, alerts, kill switches, and the maximum
   authorized number of live checks.
6. **Launch gate:** audit the exact commit, deploy immutable images, run unpaid
   probes, then run only the approved live flows.

### 0.5 Demo-first implementation principle

The owner has explicitly prioritized the signature flow over product
completeness. Therefore:

- build the curated path that demonstrates excellent automatic framing and
  visual storytelling;
- choose purpose-recorded fixtures that make those capabilities demonstrable;
- do not build manual trim, caption correction/style controls, speaker crop
  controls, visual pickers, a timeline, an editor, or a chatbot/assistant;
- when a core AI stage cannot produce a valid result, preserve a clear failure
  and restart/try-sample path, but do not build a second product around repairing
  it;
- keep only safety-critical validation, cleanup, spend controls, honest errors,
  candidate selection, final confirmation, and download. They protect or
  complete the demo; they are not a hidden editing surface.

This principle supersedes any later passage or historical input that could be
read as requiring an editor, assistant, manual repair surface, or configurable
caption/visual treatment.

## 1. Locked product contract

### 1.1 Product sentence

> ClipBuilder helps a solo podcaster, editor, or social-content manager
> turn one owned or licensed long-form conversation into one polished vertical
> clip: it finds the moment, follows whoever is speaking, adds well-timed
> contextual visuals and captions, and produces one downloadable result after
> the visitor chooses a single candidate.

The primary product identity is **ClipBuilder**. Its preferred public domain is
`tryclipbuilder.com`; the word `try` is a domain device and must not appear as
part of the displayed product name or wordmark. **ClipAssistant** is the named
backup if the primary identity or domain becomes unavailable or develops a
material conflict before launch. Domain registration, trademark clearance, and
public launch remain separate actions and are not authorized by this decision.

### 1.2 Portfolio story

The strongest five-minute demonstration is:

> Open a purpose-recorded conversation, inspect up to four distinct grounded
> moments, choose exactly one, and watch the app build a short: the vertical
> frame follows the active speaker, captions appear throughout, and a few
> transcript-grounded visual beats illustrate what is being discussed. Review
> the automatic result, confirm one 1080 × 1920 render, and download it.

That flow must visibly demonstrate:

- direct media handling without sending large files through the web app server;
- word- and timestamp-grounded AI reasoning;
- clear candidate evidence and an understandable automatic build, not a chat
  wrapper, editor, or static mockup;
- camera-cut-aware active-speaker reframing;
- semantic visual-beat planning and generated/procedural visual inserts;
- deterministic caption, overlay, transition, and export rendering;
- asynchronous work with truthful named stages and recovery;
- temporary storage, explicit clearing, privacy boundaries, and cost limits;
- a playable, downloadable, content-safe MP4.

### 1.3 Primary visitor

The primary visitor is one individual creator or editor who already has a
conversation recording and wants a plausible short-form cut. They understand
basic terms such as clip, caption, trim, and vertical video, but they should not
need to understand model prompts, codecs, FFmpeg, cloud jobs, or schemas.

The visitor is not acting as an organization administrator, publisher,
copyright lawyer, media buyer, team reviewer, or data scientist.

### 1.4 Job to be done

When the visitor has a longer spoken conversation, help them identify a moment
that stands on its own and turn it into a legible vertical draft without making
them scrub the whole source, rebuild captions, or trust an unexplained score.

### 1.5 Ten-second comprehension requirements

Without reading documentation, the landing page and sample path must make seven
facts clear:

1. one long source produces up to four strong candidate moments without padding
   weak results;
2. each moment maps to exact source words and time;
3. the system proposes and explains; the visitor chooses exactly one;
4. the vertical edit automatically follows the current speaker and illustrates
   selected concepts without drowning out the podcast footage;
5. captions and visual treatment are automatic and not configurable;
6. the result is a real vertical, captioned MP4;
7. “high-potential” is editorial reasoning, not a promised view count.

### 1.6 Product personality

The product feels like a focused automatic clipping studio. It is decisive but
not magical, technical but not intimidating, and calm under failure. It does
not resemble a generic purple AI dashboard, social analytics suite, chatbot,
or nonlinear editor. Candidate explanations use grounded language such as
“This starts on the claim,” never “I optimized virality.”

### 1.7 Safe public claims

Allowed:

- “Find up to four self-contained moments in a long conversation.”
- “See the exact words and time range behind every suggestion.”
- “Choose one moment and receive an automatically composed vertical clip.”
- “Automatically follow the active speaker in a vertical frame.”
- “Add transcript-grounded visual cutaways and graphic explanations.”
- “Add readable captions automatically and export a vertical clip.”
- “Your media is temporary and can be cleared explicitly.”

The CL-002 landing prototype may also state that at least six researched
platforms publicly host paid clipping campaigns, provided that the claim is
re-checked against current first-party sources before release. The presentation
must say that brands or creators fund the campaigns, identify the platforms as
unaffiliated market examples rather than partners or integrations, provide no
earnings guarantee, and disclose that availability, eligibility, rates, and
rules vary.

Forbidden:

- “Predicts virality, views, engagement, or revenue.”
- “Knows what is trending now” unless a dated, authorized source is actually
  integrated and named.
- “Understands or beats the TikTok, Instagram, or YouTube algorithm.”
- “Publishes optimally without human review.”
- “Clears copyright, likeness, trademark, music, or speaker rights.”
- “Stores nothing” or “is zero retention” when infrastructure or providers
  process or temporarily retain data.
- “Deletes at exactly [time]” when lifecycle deletion is asynchronous.

## 2. Scope boundaries

### 2.1 Portfolio demo — implement and verify

- one anonymous disposable session;
- one purpose-recorded sample source with deterministic precomputed analysis
  and first-cut assembly;
- optionally one bounded public upload after the product/provider gates;
- MP4 or WebM spoken-video intake within explicit limits;
- local advisory validation and server-authoritative media inspection;
- private direct resumable upload to temporary Cloud Storage;
- speech transcription with word timestamps and speaker labels when available;
- zero to four grounded candidate moments, targeting three strong options and
  never padding weak output; zero enters the honest no-candidate state;
- a transparent source-controlled shareability rubric with evidence and
  caveats, never a mysterious 0–100 score;
- candidate preview from the original source without pre-rendering variants;
- exactly one candidate selection per assembly attempt; no manual-range path;
- immutable provider transcript and AI-selected word-boundary range;
- shot-boundary detection for already-edited multicamera podcasts;
- face detection/tracking and audio-visual active-speaker detection over the
  selected clip;
- a smoothed vertical focus track that centers the visible speaking person and
  resets cleanly at source camera cuts;
- one fixed source-controlled `clean-emphasis` caption profile with no visitor
  style, density, wording, or emphasis controls;
- a transcript-grounded visual-beat plan with 1–3 timed inserts per clip;
- generated full-frame or transparent still images for concrete visual concepts;
- deterministic equation/statistic/quote cards when exact text or math matters;
- one automatic, validated composition manifest produced from the selected
  candidate, focus track, fixed captions, and contextual visuals;
- a read-only final preview with only render confirmation, clear, and bounded
  failure recovery actions;
- one 1080 × 1920 H.264/AAC render from the selected manifest;
- result review, download authorization, and explicit clear;
- named loading/progress stages, bounded retry, cancellation, refresh recovery,
  expiry, and cleanup behavior;
- deterministic fake providers and synthetic/adversarial fixtures;
- paid-disabled committed defaults, abuse gates, cost controls, and
  content-safe telemetry;
- responsive phone/tablet/laptop/desktop selection, progress, preview, result,
  and download paths;
- public deployment only after the full release gate.

### 2.2 Explicitly out of scope for the demo

- user accounts, authentication profiles, organizations, teams, or roles;
- durable projects, history, asset library, search, comments, or collaboration;
- a database, ORM, general queue, durable job catalogue, or event bus;
- multiple source videos, batch clipping, raw multicamera-feed synchronization,
  or clip playlists; detecting cuts in one already-edited podcast file is in
  scope;
- multitrack/nonlinear editing, freeform layers, keyframes, transitions, color
  grading, LUTs, plugins, or audio mixing;
- any editor, chatbot, assistant prompt, manual trim/range selection, caption
  correction or style choice, headline control, visual retiming/layout control,
  proposal/diff/apply workflow, undo, redo, or editable timeline;
- arbitrary fonts, uploaded graphics, remote assets, shell fragments, filter
  graphs, or URLs supplied to the renderer;
- generative video, scraped/stock B-roll, arbitrary web-image search, or a stock
  marketplace; generated still images for the selected clip are explicitly in
  scope;
- music discovery, licensing, soundtrack mixing, or automatic rights clearance;
- remote platform URLs or downloading from YouTube, TikTok, Instagram, or any
  arbitrary URL;
- current trend scraping, platform research APIs, private recommendation data,
  or a learned virality predictor;
- direct publishing, scheduling, social OAuth, analytics, or feedback loops;
- automatic model retries or paid “repair” calls for invalid structured output;
- unlimited media, multiple public renders, or concurrent public jobs;
- inference of identity, protected traits, personality, mental state, or
  sensitive attributes from voice, face, text, or behavior;
- legal, brand-safety, copyright, or content-performance guarantees.

### 2.3 Commercial MVP roadmap — record, do not build

- accounts, durable projects, customer retention choices, and deletion audit;
- multiple sources, clip batches, brand kits, reusable templates, and review;
- durable queues, billing, quotas, support tooling, and operational dashboards;
- customer-selected storage region and enterprise data controls;
- approved direct publishing and scheduling integrations;
- performance feedback from the customer's own published content;
- licensed stock/B-roll integration and user asset libraries;
- raw multicamera-feed selection and split-screen template systems;
- reusable style systems and multiple export variants.

Nothing in the repository should pretend these features exist. Roadmap types,
empty folders, speculative database models, and disabled navigation are not
portfolio value.

### 2.4 Long-term product vision — context only

A mature product could become an editorial operating system that learns from a
customer's own approved publishing outcomes, suggests batches across a media
library, coordinates team review, and publishes through authorized platform
APIs. That vision does not change the demo's data model, architecture, or done
criteria.

## 3. Success criteria and non-goals

### 3.1 Observable demo success

The demo is complete only when all applicable statements are evidenced:

1. A new visitor can state the input, AI role, human role, and output after ten
   seconds on the landing screen.
2. The purpose-recorded sample reaches candidate review in under 15 seconds on
   a production-like connection without paid provider work.
3. The curated sample exposes three materially different candidate cards; the
   general analyzer may return zero to four and never pads weak output.
4. Every candidate signal links to valid transcript word IDs and displays the
   corresponding text and time range.
5. The top recommendation is understandable without a numeric viral score.
6. On the selected clip, camera cuts are detected and the 9:16 framing track
   visibly follows the speaking face through representative one-face, wide
   two-person, and edited-camera moments in the purpose-recorded sample.
7. The AI creates a sparse visual-beat plan grounded to exact transcript word
   ranges. The sample proves at least one full-frame contextual image and one
   smaller deterministic explanatory graphic or equation card.
8. Captions stay present and legible over speaker footage and visual inserts;
   visual coverage supports the spoken story without replacing most of it.
9. The assembled preview is read-only, uses the fixed caption profile, and
   exposes no edit, assistant, trim, style, headline, or visual controls.
10. The visitor explicitly confirms the automatic clip before the one permitted
    render starts.
11. One final MP4 renders, plays, remains in sync, downloads, and has content-safe
   metadata and filename.
12. A failure after transcription preserves completed work and does not repeat
    transcription unless the user explicitly starts a permitted retry.
13. Refresh at each declared safe stage restores the session without creating
    a duplicate paid operation.
14. Clear removes browser state, revokes access, requests remote deletion, and
    reports partial cleanup honestly.
15. The core journey is usable with keyboard, visible focus, 200% zoom, reduced
    motion, and named phone/tablet/laptop/desktop viewport checks.
16. Committed defaults, tests, and ordinary local development cannot make a
    paid provider call.
17. Exactly bounded owner-authorized live flows have recorded usage, cost,
    cleanup, and provider-setting evidence before public live mode is enabled.

### 3.2 Engineering success

- Frontend and backend never import each other.
- Browser-safe contracts contain no React, Express, Node-only, or provider SDK
  types.
- Every external boundary is runtime validated.
- Every paid action has one documented provider-call budget and an idempotency
  boundary.
- The model never emits executable code, FFmpeg arguments, file paths, URLs, or
  arbitrary style values.
- Active-speaker output and visual cue plans are typed time tracks grounded to
  face-track IDs and transcript word IDs; model prose never drives rendering.
- Media bytes do not transit the Next.js or Express request body.
- Logs and error envelopes contain no media, transcript, prompt, caption,
  filename, signed URL, raw IP address, or provider payload.
- Importing a module never starts a server, reads user content, or calls a
  provider.
- Failure, abort, timeout, and clear paths clean up all listeners, object URLs,
  subprocesses, temp files, leases, and provider requests they own.

### 3.3 Non-goals

The demo is not optimized for daily professional production, team throughput,
arbitrary codec support, frame-perfect nonlinear editing, or global public
scale. It demonstrates a credible vertical slice and the discipline required to
expand it safely.

## 4. End-to-end signature journey

Every stage defines entry conditions, user goal, visible behavior, data
effects, paid work, success, recovery, refresh, and cancellation.

### 4.0 The core demo story

This narrative is the product. The implementation exists to make this exact
experience convincing.

#### The visitor arrives

The visitor lands on a page that says, in substance: **give us a podcast and we
will find the short, follow the speaker, illustrate the ideas, caption it, and
render it.** They do not begin in a project dashboard and they do not configure
an editing system. They click the purpose-recorded sample or upload one owned
conversation.

The sample is deliberately chosen to prove the central intelligence. It is an
already-edited podcast file containing a mixture of:

- a close-up camera on speaker A;
- a close-up camera on speaker B;
- at least one wide two-person shot;
- a clean discussion containing concrete visual concepts and one simple
  relationship/equation;
- a 10–60 second candidate in which speaker turns and visual opportunities are
  obvious to a human reviewer.

The demo does not need to solve every possible podcast. It must solve this
representative, rights-cleared source extremely well and use an architecture
that is credible for similar inputs.

#### The app understands the long conversation

After upload/selection, the media job inspects the file and extracts audio.
Deepgram produces word timestamps and anonymous speaker turns. The text model
reads the bounded transcript and shareability rubric and returns zero to four
exact candidate ranges, targeting three strong alternatives without padding.
The curated sample deterministically exposes three. The visitor sees each
moment, why it works, and the words it came from. No candidate MP4 has been
rendered yet.

At this point diarization answers **when speaker 0 or speaker 1 is talking**, but
it does not know which on-screen face belongs to that voice. That association
is deferred until the visitor chooses a candidate so we only perform expensive
audio-visual analysis on 10–60 seconds, not the whole podcast.

#### The visitor chooses a moment and ClipBuilder builds the clip

For this one purpose-recorded walkthrough, the visitor selects a candidate about
Earth, the Moon, and the relationship between them. A new core stage appears:
**Building your cut**.

> **Earth, Moon, and the equation are examples—not fixed product content.**
> They exist only to make this demo story concrete and test three visual
> treatments. For every real selected clip, the visual planner must derive its
> subjects from that clip's own transcript. A clip about architecture might
> illustrate a building; one about a financial comparison might show an exact
> chart or number card; one without a useful visual cue may stay on the
> speakers. The implementation must never hardcode Earth, Moon, space, or any
> other recurring subject into the general flow.

The job extracts the selected range with a few seconds of analysis padding and
does four things in parallel where resources allow:

1. **Understand the existing edit.** PySceneDetect marks hard camera cuts. A
   face detector/tracker creates stable face tracks inside each shot. Track IDs
   reset at camera cuts so a crop never glides nonsensically from a face in one
   camera angle into a different shot.
2. **Find the speaking face.** Light-ASD receives each candidate face track plus
   the aligned audio and returns a speaking probability over time. The app
   converts those probabilities into a smoothed `SpeakerFocusTrack`. When the
   source is already on a speaker close-up, the vertical crop stays on that
   face. In a wide two-person shot, the crop moves or cuts to the face whose lip
   motion and audio are synchronized. This is audio-visual active-speaker
   detection—not a guess based only on the transcript.
3. **Plan visual beats.** The text model receives only the chosen transcript,
   word IDs, duration, speaker-turn timing, and a small vocabulary of visual
   layouts. It decides where imagery genuinely helps and returns a typed
   `VisualPlan`. It is told to preserve the human hook, leave breathing room
   between visuals, and use no more than the duration-based visual budget.
4. **Create the assets.** Concrete subjects mentioned in the selected clip
   become generated stills—Earth and the Moon only in this example. Full-frame
   cutaways use opaque portrait imagery; smaller picture/diagram overlays may
   use a transparent PNG/WebP. Exact equations, statistics, or labeled
   relationships are rendered deterministically with MathJax SVG and the
   product's card tokens rather than asking an image model to spell or typeset
   them correctly.

The recommended active-speaker spike is
[Light-ASD](https://github.com/Junhua-Liao/Light-ASD): its official
MIT-licensed repository includes pretrained weights and a raw-video demo that
marks active and inactive faces. Its paper describes an audio-visual model that
scores whether a candidate face is speaking. [TalkNet](https://github.com/TaoRuijie/TalkNet-ASD)
is the comparison baseline, also with an end-to-end raw-video demo, but is not a
second production path. [PySceneDetect](https://www.scenedetect.com/docs/api/detectors.html)
provides content/adaptive cut detection so face/crop smoothing can restart at
real edits.

This is technically credible but not assumed proven: CL-006 must benchmark the
exact purpose-recorded sample, model weights/licenses, CPU memory, processing
time, and crop quality inside the proposed Cloud Run Job image. A benchmark
failure changes the tool or job resources; it does not demote automatic speaker
framing from the product promise.

#### What the assembled 32-second clip looks like

An illustrative timeline—not fixed output—could be:

```text
00.0–02.2  Speaker footage: open on the strongest line, active face centered.
            Captions are present.

02.2–05.5  Full-frame generated Earth image with a restrained slow push-in.
            Podcast audio continues; captions remain above the visual.

05.5–08.4  Return to the podcast. The source camera cuts to the other speaker;
            the vertical crop resets and centers that face.

08.4–11.6  Full-frame Moon image, visually related to the Earth treatment.
            Captions remain present.

11.6–16.0  Podcast footage. A wide two-person shot appears; active-speaker
            detection centers the person currently speaking.

16.0–20.2  The podcast remains visible while a compact equation/relationship
            card appears in free lower-middle space. It does not cover the face
            or caption safe zone.

20.2–32.0  Return to uninterrupted speaker footage for the explanation and
            payoff, changing focus when the speaking person changes.
```

This establishes the desired balance. The visuals are not wallpaper and they
do not replace the human conversation. They arrive on semantically meaningful
words, remain long enough to read, and return to faces so the clip still feels
like a podcast.

#### The balancing rules

The AI chooses exact cues within deterministic limits:

| Final clip length | Maximum planned visual beats | Target total visual coverage |
| ---: | ---: | ---: |
| 10–19.9 s | 1 | 15–35% |
| 20–39.9 s | 2 | 20–40% |
| 40–60 s | 3 | 25–45% |

Additional invariants:

- keep the opening human hook visible for at least 1.25 seconds unless a visual
  cold-open is explicitly justified by the transcript;
- no full-frame visual lasts less than 1.5 or more than 4.5 seconds;
- leave at least 1.25 seconds of podcast footage between full-frame visuals;
- do not place two visuals merely because two nouns occur close together;
- visual timing references exact word IDs and derived timestamps;
- captions remain above every layout;
- preserve at least the final 2 seconds of human footage for the payoff unless
  the final concept itself is the payoff;
- an equation/card must be readable and grounded in words actually spoken;
- no invented statistic, label, causal relationship, or scientific claim;
- the complete plan contains 0–3 assets and never searches arbitrary websites.

The planner may legitimately return zero visuals when the clip has no concrete
visual opportunity, but the curated sample and demo acceptance require at least
two different visual types to prove the capability.

#### The visitor reviews the automatic clip

When preparation finishes, a read-only composed vertical preview opens.
Playback already includes:

- active-speaker framing;
- always-on captions;
- full-frame visual cutaways;
- smaller overlay/equation cards;
- the original podcast audio continuing through every visual;
- transitions and durations from the typed composition manifest.

The preview is intentionally not an editor. The visitor cannot trim the range,
change caption wording or style, add a headline, alter speaker framing, retime
or remove visuals, enter an instruction, or undo/redo. The only forward action
is `Render this clip`; `Clear media` and evidence-based retry/recovery remain
available where their owning stage permits them.

#### The app renders the same plan

The browser preview and FFmpeg renderer consume the same `SpeakerFocusTrack`,
caption groups, `VisualPlan`, assets, and layer safe zones. FFmpeg crops/scales
the podcast footage, overlays transparent cards, substitutes full-frame stills
while preserving podcast audio, applies restrained image motion/transitions,
burns captions last so they remain visible, validates the MP4, and provides the
download.

The technical stack for the core story is therefore:

| Capability | Recommended first implementation | Why it matches the proof |
| --- | --- | --- |
| Word timing + audio speaker turns | Deepgram Nova-3 pre-recorded | Supplies words, timestamps, and diarized turns for candidate and visual grounding. |
| Candidate + visual planning | OpenAI Responses with strict structured output | Produces bounded word-ID plans, not executable media commands. |
| Existing camera-cut detection | PySceneDetect `ContentDetector`/`AdaptiveDetector` | Detects hard edits and mitigates false cuts during motion. |
| Face tracks + speaking probability | Light-ASD end-to-end pipeline, spiked against TalkNet | Audio-visual detection answers which visible face is speaking. |
| Contextual stills/cutouts | OpenAI Image API, proposed `gpt-image-2.5-flare` | Official API supports text-to-image, portrait sizes, and transparent PNG/WebP outputs. |
| Exact equations/cards | MathJax 4 server-side TeX-to-SVG plus a source-controlled card renderer | Keeps math/text exact, deterministic, and stylistically consistent without a browser screenshot dependency. |
| Composition/export | FFmpeg crop/scale/overlay/enable/xfade/zoompan/subtitle filters | One deterministic timeline preserves audio and renders all layers. |

The OpenAI image model name is a dated proposal. Official OpenAI documentation
currently describes `gpt-image-2.5-flare` as the faster everyday generation
option and supports transparent backgrounds in PNG/WebP; model access, latency,
cost, and output quality must still be measured on the two or three sample
assets before live enablement.

#### Who is responsible at each step, and what actually costs money

Use these cost labels consistently throughout implementation and portfolio
explanations:

- **Vendor API charge** — the provider bills usage separately from Google
  Cloud. Cloud Run orchestration is also present but is usually the smaller
  component.
- **Cloud Run compute only** — the tool has no hosted per-call fee in this
  architecture. We run its open-source code/model inside our job, so cost comes
  from job CPU, memory, execution time, container/image storage, and ordinary
  cloud storage/network operations.
- **No per-visitor production call** — used only during a benchmark or replaced
  by a precomputed fixture in sample mode.

“Cloud Run compute only” does **not** mean zero cost. Cloud Run Jobs are billed
for the lifetime of each started instance, with a one-minute minimum, so local
steps should remain grouped into the bounded `assemble` or `render` execution
rather than becoming many tiny jobs. See the current
[Cloud Run pricing rules](https://cloud.google.com/run/pricing).

| What the visitor experiences | Responsible system/tool | What it produces | Cost owner in the live-upload flow |
| --- | --- | --- | --- |
| The source is inspected after upload | `ffprobe`/FFmpeg in the `analyze` job | Trusted duration, codecs, dimensions, rotation, and extracted speech audio | **Cloud Run compute only** for FFmpeg/ffprobe; temporary Cloud Storage is separately billed. |
| The words and speaker turns appear | Deepgram pre-recorded transcription | Word timestamps, punctuation, and anonymous diarization labels | **Vendor API charge** based on transcription usage, plus analysis-job compute. This is separate from the five visual/media tools listed above. |
| Up to four candidate moments appear | OpenAI Responses candidate planner | Zero to four typed candidate word ranges and evidence, targeting three strong choices | **Vendor API charge** for text-model tokens, plus minor orchestration compute. |
| The visitor chooses **Build this clip** | PySceneDetect inside the one `assemble` job | Existing camera-cut boundaries | **Cloud Run compute only.** PySceneDetect is BSD-licensed software with no hosted per-cut fee. |
| The app finds visible faces and the speaking face | Face detector/tracker plus Light-ASD inside the same `assemble` job | Shot-local face tracks, speaking probabilities, and the smoothed speaker-focus track | **Cloud Run compute only.** Light-ASD is MIT-licensed; CPU/memory/runtime are the cost. A GPU would also be cloud compute if the benchmark required one. |
| The app decides which concepts deserve visuals | OpenAI Responses visual planner | A 0–3 cue plan grounded to transcript word IDs | **Vendor API charge** for text-model tokens. It creates instructions, not pixels. |
| A cue needs an illustrative still or transparent cutout | OpenAI Image API | One generated image asset for that validated cue | **Vendor API charge** for image/text tokens **plus** minor Cloud Run validation/storage work. This is the only one of the five named tools with its own hosted usage bill. Zero accepted image cues means zero image-generation calls; the demo permits at most three. |
| A cue needs an exact equation, number, or concise information card | MathJax in the same `assemble` job, followed by local SVG sanitization/rasterization | Exact deterministic SVG/PNG/WebP card | **Cloud Run compute only.** MathJax is Apache-2.0 open source and makes no API call. |
| The automatic first cut opens in read-only review | Browser preview using the stored focus track, fixed caption profile, cue plan, and assets | Non-editable approximation of the final render | Mostly the visitor's device; private asset delivery/storage may incur small cloud network/storage cost. No new Light-ASD, image, MathJax, or text-model call occurs because playback repeats. |
| The visitor exports | FFmpeg in the `render` job | Final 1080 × 1920 MP4 with speaker crops, visual timing, continuing podcast audio, overlays, and captions | **Cloud Run compute only** for FFmpeg, plus output storage/network. FFmpeg has no usage API fee, although its LGPL/GPL build and codec obligations must be reviewed. |

TalkNet is **not** another tool executed for each visitor. It is an MIT-licensed
comparison model for the one-time active-speaker feasibility spike only. If
Light-ASD passes, TalkNet disappears from the production request path. The
spike therefore costs developer time and temporary Cloud Run/local benchmark
compute, not a recurring TalkNet API fee.

The five named tools reduce to this simple classification:

| Tool | Direct tool/API bill? | Cloud Run work? | Exact responsibility |
| --- | --- | --- | --- |
| Light-ASD | No per-call vendor bill; MIT open source | Yes, potentially the heaviest assembly CPU step | Decide which tracked visible face is speaking. |
| TalkNet | No per-call vendor bill; MIT open source | Benchmark only, unless it replaces Light-ASD after the spike | Comparison baseline, not a second production pass. |
| PySceneDetect | No per-call vendor bill; BSD-3-Clause open source | Yes, usually modest CPU compared with ASD/encoding | Detect existing camera cuts and reset face/focus tracking correctly. |
| OpenAI Image API | **Yes—usage-priced vendor API** | Small orchestration/validation work also runs on Cloud Run | Generate transcript-grounded stills/cutouts; Earth/Moon only in the example fixture. |
| MathJax | No per-call vendor bill; Apache-2.0 open source | Yes, small local Node/SVG/rasterization work | Render exact equations and information cards without image-model text errors. |
| FFmpeg | No per-call vendor bill; LGPL/GPL open source build | Yes, often substantial during final video encoding | Crop, scale, time, composite, caption, encode, and validate the MP4. |

The OpenAI Image API is token-priced rather than a flat software license. At
this document's research date, official pricing for GPT Image 2.5 lists
`$5.00 / 1M` text-input tokens and `$30.00 / 1M` image-output tokens; image
inputs, if ever added, have their own rate. Actual per-image cost varies with
model, dimensions, quality, and output tokens, so implementation must record
the API `usage` for the exact demo settings rather than hardcode a guessed
per-image number. See the official
[GPT Image 2.5 Flare model page](https://developers.openai.com/api/docs/models/gpt-image-2.5-flare)
and [image-generation cost guidance](https://developers.openai.com/api/docs/guides/image-generation#cost-and-latency).

The deterministic sample path is cheaper by design: its transcript, candidate
plan, speaker-focus track, visual plan, and visual assets are precomputed. A
visitor exploring that sample triggers no Deepgram, text-model, active-speaker,
MathJax, or image-generation work. If the visitor requests a real export, the
FFmpeg render still consumes Cloud Run compute and the output still incurs
temporary storage/network cost.

### 4.1 Stage 0 — bootstrap and session restore

**Entry:** The app loads or reloads.

**Goal:** Reach a trustworthy starting point without flashing stale or invalid
work.

**Behavior:**

1. Render the public shell and an accessible “Restoring your session” status.
2. Load the versioned browser projection.
3. Call `GET /v1/session` through the same-origin proxy. The API validates the
   encrypted HttpOnly grant, expiry, and any referenced temporary objects.
4. Reconcile browser projection with server evidence. Server evidence wins for
   operation status, automatic-manifest identity, and object existence.
5. Route to intake, progress, candidates, clip review, result, or expired
   recovery.

**Data:** No media or provider call. Invalid or expired local state is cleared.

**Failure:** If the server is unavailable, show a retryable offline state. Do
not discard a valid local projection until the grant is proven invalid or
the user chooses Clear local session.

**Refresh:** This is the refresh path.

### 4.2 Stage 1 — choose source

**Entry:** No active unexpired source.

**Goal:** Understand the product and choose the immediate sample or bounded
upload path.

**Actions:**

- `Try the sample conversation` starts a deterministic sample session.
- `Upload your video` opens the rights disclosure and file picker only when the
  public configuration says live upload is available.
- `How temporary media works` opens concise retention/provider detail.

**Visible copy:** The user must own or have permission for the video, voices,
music, and resulting export. Remote URLs are not accepted. The app is not a
rights-clearance service. The upload card states: “For the fastest demo, use an
MP4 under 10 minutes and 250 MiB. Maximum: 20 minutes and 500 MiB. Your final
clip will be 10–60 seconds.”

**Data:** Sample starts with server-owned fixture IDs. Upload selection remains
browser-local until the user accepts the disclosure and requests authorization.

**Paid work:** None.

**Success:** Sample goes to candidate preparation; upload goes to local
inspection.

**Recovery:** Unsupported browser features keep the sample usable and explain
why live upload is unavailable.

### 4.3 Stage 2 — inspect and authorize upload

**Entry:** A user has selected one local file and accepted the rights notice.

**Goal:** Catch obvious problems before network or paid work and disclose the
temporary-storage contract.

**Local advisory checks:**

- exactly one file;
- non-empty filename for local display only;
- declared type `video/mp4` or `video/webm`;
- declared bytes no greater than 500 MiB;
- browser-readable duration from 15 seconds through 20 minutes;
- at least one browser-readable audio track when the browser exposes it;
- no remote URL, directory, or drag payload other than one file.

Local checks are advisory. The server and `ffprobe` remain authoritative.

**Authorization:** After an action-specific Turnstile token, the browser calls
`POST /v1/uploads/authorize`. The API creates an opaque object identity and a
short-lived resumable upload session bound to declared type and size. The raw
filename is not sent to the API or used in the object name.

**Data:** A private empty/resumable object and content-free authorization marker
may be created. No provider receives data.

**Paid work:** Cloud Storage operations only; no transcription or model call.

**Cancel:** Before upload, return to intake. After authorization, cancel the
resumable request and call clear for the reserved object. If cleanup cannot be
confirmed, report that it is scheduled for lifecycle deletion.

**Refresh:** Before bytes upload, authorization may be reissued once if the old
session expired. Never start analysis automatically.

### 4.4 Stage 3 — upload and authoritative media inspection

**Entry:** Valid resumable upload authorization.

**Goal:** Transfer the source directly to private storage and prove it is safe
to process.

**Behavior:**

- Upload directly from browser to Cloud Storage; neither Next.js nor Express
  buffers the media.
- Display bytes transferred and a plain-language stage. Upload percentage is
  allowed because transferred bytes are measurable.
- On completion, call `POST /v1/uploads/complete` with the opaque upload ID and
  no filename.
- The API verifies object generation, actual size, declared content type, and
  ownership by the current grant.
- A media-inspection job runs `ffprobe` against the private object and validates
  container, codecs, duration, dimensions, frame rate, audio presence, and
  stream counts before any provider call.

**Paid work:** Storage and bounded job compute only.

**Success:** A normalized `MediaDescriptor` is recorded in the temporary result
bundle; user sees duration, orientation, and accepted bounds.

**Failure:** Delete invalid or oversized objects immediately. Show one specific
safe error and accepted constraints. The source is rejected if it exceeds
**either** 20 minutes **or** 500 MiB. Do not call transcription or OpenAI.

**Interrupted upload:** Resume only if the selected resumable protocol proves
the committed offset. Otherwise clear the partial object and request a new
authorization. Never concatenate client guesses.

### 4.5 Stage 4 — confirm and analyze

**Entry:** Authoritative media inspection succeeded.

**Goal:** Let the visitor control the first provider-bearing action.

**Behavior:** Show a compact confirmation containing source duration, the
published deletion/access window, the operations to run, and the maximum public
candidate/render limits. The visitor selects `Find moments`.

The action performs, at most:

1. one bounded audio extraction in the media job;
2. one transcription provider operation;
3. one OpenAI candidate-selection response;
4. deterministic reconciliation and temporary result write.

Visible stages are named, not fabricated percentages:

```text
Reading media
Extracting speech
Transcribing speech
Finding complete moments
Checking evidence and boundaries
Preparing previews
```

The operation status may show elapsed time and known stage; it may not infer a
percentage from elapsed time.

**Cancel:** Cancellation is best effort. Stop local polling immediately, send
the cancel request, and mark the session `cancel-requested`. If a provider or
Cloud Run execution cannot be interrupted safely, say “Stopping after the
current operation.” Never claim stopped until execution evidence confirms it.

**Failure:** Preserve the source, inspection result, and any completed
transcript until expiry. A transcription failure permits one manual analysis
retry. A candidate-selection failure reuses the completed normalized
transcript and must not transcribe again.

**Refresh:** Restore the processing grant, query actual execution state, and
resume polling. An idempotency marker prevents duplicate execution.

### 4.6 Stage 5 — review candidates

**Entry:** A valid normalized transcript and reconciled candidate set exist.

**Goal:** Understand the grounded candidate clips and choose exactly one.

Each candidate card contains:

- rank label, never an implied performance probability;
- start, end, and duration derived from word IDs;
- title suggestion and exact opening/closing transcript text;
- signal badges and evidence excerpts;
- one short editorial rationale;
- explicit caveats such as dependent context, overlap, or weak ending;
- a short “what the first cut will build” summary;
- `Preview source range` and `Build this clip` actions.

Selecting a card seeks the original source to its start and plays only the range
from the source. This is a source-range preview, not the assembled vertical edit,
and it does not render an MP4.

The analyzer returns zero to four candidates, targets three strong alternatives,
and never pads weak output to hit a count. The curated sample exposes exactly
three deterministic candidates.

**No strong candidates:** State that no range met the rubric. Do not provide a
manual range editor and do not fabricate weak candidates. Allow clear or an
evidence-based bounded analysis retry only when the recovery policy permits it.

**Data:** No new provider call. Candidate selection and preview are local.

**Refresh:** Restore candidates from the temporary normalized analysis bundle.

### 4.7 Stage 6 — build the AI first cut

**Entry:** Exactly one candidate is selected.

**Goal:** Turn the selected transcript range into a complete automatic clip before
asking the visitor to configure anything.

The action starts one bounded `assemble` job. Its named stages are:

```text
Reading the selected moment
Finding camera cuts and faces
Following the active speaker
Planning visual beats
Creating visual assets
Building the preview
```

The job produces:

- a shot list;
- face tracks and an active-speaker focus track;
- always-on caption groups;
- a word-ID-grounded visual plan;
- 0–3 generated/procedural visual assets;
- an immutable automatic composition manifest referencing those assets and tracks;
- a lightweight preview proxy or browser-readable composition bundle.

The selected clip—not the whole source—is analyzed for active speaker and
visuals. One assembly action may make at most one visual-planning model call and
the duration-based maximum number of image-generation calls. Equation/cards are
deterministic and do not use image generation.

**Success:** Open the read-only final preview on the playing, composed first cut.

**Failure:** Show which core stage failed and offer `Try building again` only
within the bounded allowance or `Choose another moment`. Do not open a complex
manual crop or asset repair workflow. The sample must pass this stage before
release.

**Refresh:** Poll the same assembly execution and never duplicate image calls or
active-speaker analysis.

### 4.8 Stage 7 — review the automatic clip

**Entry:** A valid assembled manifest, focus track, visual plan, and assets exist.

**Goal:** Inspect the complete automatic result and intentionally decide whether
to spend the one render.

The screen leads with a playable 9:16 preview and a compact factual summary:
selected candidate title/range, duration, fixed captions, active-speaker
framing, visual count/layout summary, output format, temporary-data deadline,
and one-render limit.

There are no edit controls. The visitor cannot change the range, captions,
caption style, headline, framing, visual timing/layout/assets, or audio; there
is no instruction field, proposal, diff, apply/dismiss, history, undo, or redo.
Owner/debug evaluation tooling may inspect tracks separately but is never part
of the public visitor flow.

The browser preview and renderer consume the same `CompositionManifest`.
Preview may
be approximate for font rasterization and codec behavior, but layout rules,
safe zones, word groups, speaker-focus track, visual cue plan, and timing are
shared.

**Forward action:** `Render this clip` moves to confirmation and makes no model
call. Playback repetition also makes no model or media-analysis call.

**Failure:** Preserve the validated automatic manifest and show a content-safe
preview/playback failure with the bounded recovery allowed by server evidence.

**Refresh:** Restore the allow-listed manifest reference only when the analysis
and assembly revisions still match. Expired signed URLs are reauthorized;
never persist them.

### 4.9 Stage 8 — confirm and render

**Entry:** The server-produced automatic manifest is valid.

**Goal:** Understand the exact output and intentionally spend the one render.

The confirmation shows:

- final start/end and duration;
- 1080 × 1920, H.264/AAC MP4 output;
- active-speaker framing and the fixed `clean-emphasis` caption profile;
- visual count, visual coverage, and layout summary;
- one-render session limit;
- deletion/access deadline;
- a final rights reminder.

`Render clip` requires a fresh action-specific abuse token and consumes the
session render allowance atomically. The API validates the immutable automatic
manifest again before starting the job.

Visible stages:

```text
Validating composition
Preparing captions
Preparing visual layers
Rendering video
Checking output
Securing download
```

**Cancel:** Best-effort job cancellation. A cancelled or failed job does not
silently restore the render allowance; the API decides from evidence whether
compute began. One manual retry is allowed only when no successful output
exists and the retry budget remains.

**Refresh:** Poll the same execution. Never start another render from mount or
route navigation.

### 4.10 Stage 9 — review, download, and clear

**Entry:** Render validation succeeded and the private output object exists.

**Goal:** Review the artifact, download it, and understand cleanup.

Show:

- the rendered video with native controls and no forced autoplay with sound;
- duration, dimensions, codec summary, and bytes;
- selected candidate and automatic composition summary;
- `Download MP4`, `Clear media`, and `Start another`;
- access expiry and asynchronous deletion language.

Download authorization is short-lived and generated only on user action. It is
never persisted, logged, placed in analytics, or rendered into server HTML.

After the browser acknowledges a completed download, the UI may recommend
clearing but must not assume a download completed merely because a URL was
issued.

`Start another` first runs clear. It does not retain a transcript, style,
history, or output as a hidden project.

### 4.11 Stage 10 — clear, expire, or recover cleanup

**Clear:**

1. Disable new actions and abort browser requests/media playback.
2. Revoke object URLs and stop polling/timers.
3. Call `DELETE /v1/session`.
4. API invalidates the grant, cancels active work where supported, and deletes
   source, descriptors, transcript bundle, focus tracks, visual assets,
   caption/render descriptors, output,
   progress, idempotency, and lease objects by known opaque identity.
5. Clear the HttpOnly grant cookie and browser projection.
6. Report `cleared`, `partially-cleared`, or `scheduled-for-deletion` honestly.

**Expiry:** Access ends even if object deletion has not completed. The user sees
an expired state with local-clear and new-session actions. The app must not
renew an expired grant merely because local state exists.

**Partial cleanup:** Never strand the user on a spinner. Name the class of
artifact that could not be confirmed deleted without revealing identifiers,
state that the lifecycle backstop applies, and expose a bounded retry while the
grant is still valid.

## 5. Canonical workflow and state transitions

### 5.1 State authority

The frontend owns one canonical `ClippingSessionState` reducer for user-visible
workflow. Cloud Run execution state and private object metadata are external
evidence, not a second UI state machine. The reducer accepts reconciled events
from the API and rejects illegal transitions.

Do not mirror `stage` in route state, component booleans, query parameters,
storage, and request hooks. Routes render the canonical stage. Buttons,
progress labels, available actions, and navigation blockers are derived.

### 5.2 Top-level discriminated states

```ts
type ClippingSessionState =
  | { stage: "bootstrapping" }
  | { stage: "intake"; availability: PublicAvailability }
  | { stage: "local-inspection"; localSource: LocalSourceSummary }
  | { stage: "upload-authorizing"; localSource: LocalSourceSummary }
  | { stage: "uploading"; upload: UploadProgress }
  | { stage: "media-inspecting"; operation: OperationRef }
  | { stage: "analysis-confirmation"; media: MediaDescriptor }
  | { stage: "analyzing"; operation: OperationRef; lastKnown: AnalysisStage }
  | { stage: "analysis-failed"; failure: SafeFailure; recovery: RecoveryPolicy }
  | { stage: "no-candidates"; analysis: AnalysisSummary }
  | { stage: "candidates"; analysis: AnalysisBundle; selectedId?: CandidateId }
  | { stage: "assembling"; operation: OperationRef; lastKnown: AssemblyStage }
  | { stage: "assembly-failed"; analysis: AnalysisSummary; failure: SafeFailure }
  | { stage: "clip-review"; review: ClipReviewSession }
  | { stage: "render-confirmation"; review: ClipReviewSession }
  | { stage: "rendering"; operation: OperationRef; lastKnown: RenderStage }
  | { stage: "render-failed"; review: ClipReviewSession; failure: SafeFailure }
  | { stage: "result"; result: RenderResult; clipSummary: ClipSummary }
  | { stage: "clearing"; previousStage: ClearableStage }
  | { stage: "cleanup-partial"; failure: SafeFailure }
  | { stage: "expired"; localStatePresent: boolean }
  | { stage: "fatal"; failure: SafeFailure };
```

`File`, `Blob`, media elements, signed URLs, `AbortController`, timers, provider
payloads, and SDK objects never enter reducer state or persistence.

### 5.3 Legal event table

| Current state | Event | Next state | Guard / side effect |
| --- | --- | --- | --- |
| `bootstrapping` | `RESTORE_EMPTY` | `intake` | Clear invalid local projection. |
| `bootstrapping` | `RESTORE_VALID(stage)` | reconciled stage | Server evidence and schema version valid. |
| `bootstrapping` | `RESTORE_EXPIRED` | `expired` | Do not renew grant. |
| `bootstrapping` | `RESTORE_FATAL` | `fatal` | Preserve a valid projection when the server failure is retryable. |
| `fatal` | `RETRY_RESTORE` | `bootstrapping` | Retry server reconciliation without discarding the local projection. |
| `intake` | `SAMPLE_SELECTED` | `candidates` or sample preparation | Deterministic fixture only. |
| `intake` | `FILE_SELECTED` | `local-inspection` | One local file; no network. |
| `local-inspection` | `LOCAL_REJECTED` | `local-inspection` | Show bounded validation error. |
| `local-inspection` | `UPLOAD_CONFIRMED` | `upload-authorizing` | Rights accepted; start one authorization. |
| `upload-authorizing` | `AUTHORIZED` | `uploading` | Store capability in memory only. |
| `upload-authorizing` | `FAILED` | `local-inspection` | Authorization is retryable if token/grant valid. |
| `uploading` | `UPLOAD_PROGRESS` | `uploading` | Monotonic committed bytes only. |
| `uploading` | `UPLOAD_COMPLETE` | `media-inspecting` | Start completion/inspection once. |
| `uploading` | `CANCEL` | `clearing` | Abort upload and delete partial object. |
| `media-inspecting` | `MEDIA_ACCEPTED` | `analysis-confirmation` | Store normalized descriptor. |
| `media-inspecting` | `MEDIA_REJECTED` | `analysis-failed` | Object deletion requested; no provider call. |
| `analysis-confirmation` | `ANALYZE_CONFIRMED` | `analyzing` | Consume analysis nonce atomically. |
| `analyzing` | `STAGE_UPDATED` | `analyzing` | Stage may advance, never regress except reconciliation after stale cache. |
| `analyzing` | `ANALYSIS_SUCCEEDED` | `candidates` or `no-candidates` | Active operation and media evidence match; normalized result is runtime-validated. |
| `analyzing` | `ANALYSIS_FAILED` | `analysis-failed` | Recovery encodes which completed artifact may be reused. |
| `analyzing` | `CANCEL_REQUESTED` | `analyzing` | Mark cancel requested until server confirms. |
| `analysis-failed` | `RETRY_ANALYSIS` | `analyzing` | Retry allowance and reusable inputs determine operation plan. |
| `analysis-failed` | `CLEAR` | `clearing` | Always available. |
| `candidates` | `CANDIDATE_SELECTED` | `candidates` | Preview selection; no mutation/provider call. |
| `candidates` | `BUILD_SELECTED` | `assembling` | Consume assembly nonce and start one selected-range job. |
| `assembling` | `STAGE_UPDATED` | `assembling` | Shot/face/speaker/visual/asset stage advances monotonically. |
| `assembling` | `ASSEMBLY_SUCCEEDED` | `clip-review` | Active operation, analysis revision, and selected range match; open the read-only composed preview. |
| `assembling` | `ASSEMBLY_FAILED` | `assembly-failed` | Do not open a manual fallback or repair surface. |
| `assembly-failed` | `RETRY_ASSEMBLY` | `assembling` | Bounded allowance and idempotency evidence permit it. |
| `assembly-failed` | `CHOOSE_ANOTHER` | `candidates` | Keep analysis; discard partial selected-range assets. |
| `clip-review` | `RENDER_REVIEW` | `render-confirmation` | Immutable automatic manifest is valid. |
| `render-confirmation` | `BACK_TO_REVIEW` | `clip-review` | No allowance consumed. |
| `render-confirmation` | `RENDER_CONFIRMED` | `rendering` | Atomically consume render nonce after validation. |
| `rendering` | `RENDER_SUCCEEDED` | `result` | Active operation and immutable manifest hash match; output passed validation. |
| `rendering` | `RENDER_FAILED` | `render-failed` | Preserve source and manifest. |
| `render-failed` | `RETRY_RENDER` | `rendering` | Retry budget remains and no valid output exists. |
| any clearable | `CLEAR` | `clearing` | Abort owned local work, then call API. |
| `clearing` | `CLEAR_SUCCEEDED` | `intake` | Drop all local/session state. |
| `clearing` | `CLEAR_PARTIAL` | `cleanup-partial` | Lifecycle backstop; bounded retry. |
| any non-clearing | `SESSION_EXPIRED` | `expired` | Stop new work and clear capabilities. |

### 5.4 Invalid transitions

An invalid event is ignored in production, recorded only as a content-free
diagnostic code, and fails a reducer test. It must not coerce the session
forward. Examples: render from candidates without a validated automatic
manifest, mutate a manifest from the browser, analyze before authoritative
media inspection, or restore result when the output object is gone.

### 5.5 Nested operation states

Playback, upload transfer, and cleanup retry are nested discriminated states
rather than new top-level routes. A nested async state is
one of `idle`, `requesting`, `succeeded`, `failed`, or `cancel-requested` and
contains only serializable IDs, timestamps, and safe failures.

### 5.6 Persistence projection

Persist only `ClippingSessionProjectionV1` in `sessionStorage`; it expires with
the tab and has a hard serialized size limit of 256 KiB.

Allowed:

- schema version and saved-at time;
- content-free session ID and grant expiry display value;
- top-level stage hint and current operation ID;
- analysis/assembly/result revision IDs;
- selected candidate ID;
- automatic manifest ID/hash plus analysis and assembly revisions;
- playback time for the read-only preview.

Forbidden:

- media bytes, `File`/`Blob`, object URLs, signed URLs, cookies, grants, secrets;
- full transcript, candidate rationale copy, provider payloads, raw filename;
- server errors/stacks, Turnstile tokens, IP data, or SDK state;
- active timers, abort controllers, event listeners, or media handles.

On restore, the projection is untrusted input. Parse it with a frontend-owned
Zod schema, reject unknown versions, enforce size before parse, and reconcile
against `GET /v1/session`.

## 6. Screen-by-screen experience

The application uses one semantic component tree per screen. Responsive modes
change layout, density, and interaction affordances; they do not fork product
logic or remove the user's ability to understand, choose, confirm, download,
and clear.

### 6.1 Global shell

**Always present:**

- product wordmark and short “AI-assisted clipping” descriptor;
- current source/session status, never the raw uploaded filename on the server;
- `Privacy & limits` disclosure;
- `Clear media` when an active source exists;
- visible fake/sample/live indicator in non-production and owner validation;
- an accessible route/stage title;
- global content-safe error region;
- skip link to main content.

**Never present:** fake notifications, fake collaborators, account avatar,
billing navigation, dashboard metrics, platform logos implying integration, or
disabled roadmap navigation. CL-002's final landing section may use
source-verified, text-based platform wordmarks only as explicitly labeled
market examples with no-affiliation and no-earnings-guarantee disclosure; this
does not authorize integration logos in the product shell.

On short-height screens, the shell scrolls with natural page flow rather than
trapping essential actions below a fixed workspace.

### 6.2 Landing and source intake

**Desktop/laptop:** A split editorial composition. The left side states the
promise and shows the three-step evidence chain: source → grounded moments →
vertical export. The right side contains two equal source cards, with the sample
first and live upload availability clearly labeled.

**Tablet:** Stacked promise, sample card, and upload card. Rights and retention
copy remains adjacent to upload.

**Phone:** One column; sample is the first primary action. Upload does not hide
limits behind a tooltip. No decorative video autoplay.

The upload card always displays both the recommended and hard bounds:

> For the fastest demo, use an MP4 under 10 minutes and 250 MiB. Maximum:
> 20 minutes and 500 MiB. Your final clip will be 10–60 seconds.

**Empty state:** This page is the valid empty state; it should feel intentional,
not like a missing project dashboard.

**Errors:** Browser capability or live-mode availability errors appear inside
the upload card and do not disable the sample.

### 6.3 Local inspection and upload

Display the local filename only in the browser for recognition, truncate it
visually without modifying the underlying local value, and never put it into a
URL, log, request, or object name.

Show:

- type, declared bytes, browser-readable duration, and orientation when known;
- recommended 10-minute/250 MiB target, hard 20-minute/500 MiB limits, and
  rights acknowledgement;
- precise validation errors;
- upload byte progress, pause/resume capability only if actually supported;
- cancel and clear actions;
- retention/access explanation before authorization.

**Phone:** Use a full-width progress block and keep Cancel reachable without
horizontal layout. The native file picker remains the source of file access.

**Error state:** Preserve the local selection only in memory. “Choose another”
resets local validation and revokes any object URL.

### 6.4 Analysis progress

The analysis screen is an editorial activity log, not an indeterminate AI orb.
It shows the ordered named stages, current stage, elapsed time, source duration,
and a plain-language explanation of what is happening.

Completed stages use a check icon plus text. The active stage uses a restrained
motion cue that becomes static under reduced motion. Future stages remain
visible but unclaimed. No animated fake percentages.

Actions:

- `Stop processing` when cancellation is supported or best-effort;
- `Clear media` always;
- `Retry` only after failure and only when the recovery policy allows it.

Refresh messaging says “Reconnecting to the same analysis,” never “Starting
over.” If the operation cannot be found, reconcile to the safest proven stage
and show recovery choices.

### 6.5 Candidate review

**Desktop ≥ 1440 px:**

- left: ranked candidate list, 360–440 px;
- center: large source preview constrained to a legible vertical/landscape
  stage;
- right: evidence inspector with transcript, rubric signals, and caveats;
- bottom: compact source-range rail showing all candidate ranges.

**Laptop 1024–1439 px:** Candidate list and preview share two columns. Evidence
opens as a persistent side panel or drawer; the range rail remains below.

**Tablet 600–1023 px:** Preview first, horizontally scrollable candidate tabs
with proper tab semantics, then evidence. Avoid nested horizontal page scroll.

**Phone 320–599 px:** One candidate at a time with previous/next buttons,
vertical preview, signal summary, expandable evidence, and a sticky `Build this
clip` action that respects safe-area insets.

Candidate rank is editorial ordering only. Signal badges include accessible
text. Hover is never required. Clicking evidence seeks to the first referenced
word and visibly highlights the exact excerpt.

**Loading:** Skeleton geometry may reserve layout for the deterministic sample;
live analysis uses the progress screen instead of cards with fake text.

**No candidate:** Show the honest no-strong-moment state with rubric reasons,
clear, and only an evidence-based bounded retry when allowed. Do not expose a
manual range path.

### 6.6 AI first-cut preparation

This screen turns the hidden technical work into an understandable editorial
sequence. It shows the selected title/range and the stages `Reading moment`,
`Following speakers`, `Planning visuals`, `Creating visuals`, and `Building
preview`. As each stage completes, one small piece of evidence may appear—for
example “3 camera cuts,” “2 speaking faces,” or “2 visual beats”—without showing
raw face boxes, confidence noise, prompts, or provider payloads.

The hero area may progressively reveal a storyboard strip containing speaker
frames and generated asset thumbnails only after those artifacts truly exist.
It does not show fake thumbnails or percentages. On phone the same stages and
storyboard stack vertically.

If the build fails, the screen offers only the bounded retry or choose-another
moment action defined by the operation evidence. It does not open a manual crop
repair or asset browser.

### 6.7 Automatic clip review

This is a read-only review screen, not an editor.

**Desktop/laptop:** Place the 9:16 preview as the visual hero beside a compact
facts panel containing the chosen candidate, exact range/duration, automatic
caption status, active-speaker framing status, visual count/layout summary,
output format, one-render limit, and temporary-data deadline. `Render this
clip` is the primary action.

**Tablet/phone:** Video first, followed by the same facts, rights reminder, and
full-width render action. Preserve natural page scroll and safe-area insets.

No viewport exposes trim handles, a transcript editor, caption choices,
headline/style controls, focus or visual tracks, an instruction field, a
timeline, proposal/diff actions, or undo/redo. The automatic preview is either
confirmed for render or cleared; failure recovery remains bounded by evidence.

#### Short-height behavior

At viewport heights below 700 px, remove fixed vertical centering, reduce
nonessential chrome, keep the preview sticky only when it does not cover
controls, and allow the document to scroll. Modals use internal scroll and keep
title, close, and primary action visible.

### 6.8 Render confirmation and progress

Confirmation is a real review step, not a generic modal. It lists the output
facts, one-render limit, temporary-data deadline, and rights reminder. The
primary button says `Render 43-second clip` or equivalent, never merely `Go`.

Render progress uses named stages and elapsed time. The automatic composition
summary remains read-only. `Back` is disabled only while a confirmed job is
actively starting; leaving the page does not cancel the job.

### 6.9 Result

**Desktop/laptop:** Rendered vertical video beside artifact facts and edit
summary. **Tablet/phone:** Video first, then Download, facts, summary, and clear.

Download is a primary action. Clear is visually distinct and requires a concise
confirmation only when it would remove an undownloaded output. Do not use dark
patterns: default focus stays on `Keep media`, and the confirmation states that
cleared media cannot be recovered through the app.

Expired download authorization is silently reissued only after a fresh user
click and valid session; an expired session cannot be renewed.

### 6.10 Error presentation

Errors have three layers:

1. a short user message describing what failed;
2. what was preserved and what the user can do next;
3. an expandable content-free reference containing request ID and rule code.

Never expose provider names unless that helps an owner-validation environment;
public copy uses `transcription service`, `clip analysis`, or `rendering`.
Never display a stack, raw provider message, object name, signed URL, prompt,
transcript excerpt, or filename inside diagnostics.

## 7. Automatic composition and preview parity

### 7.1 Immutable automatic manifest

Assembly creates one server-validated manifest for the selected candidate. The
browser may read it for preview and confirmation but cannot mutate it.

```ts
type VisualCueV1 = {
  id: string;
  startWordId: string;
  endWordId: string;
  kind:
    | "generated-concept-image"
    | "equation-card"
    | "stat-card"
    | "quote-card";
  assetId: string;
  layout: "full-frame" | "picture-in-picture" | "lower-card";
  motion: "none" | "slow-push-in";
  transition: "cut" | "short-dissolve";
  rationale: string;
};

type CompositionManifestV1 = {
  version: 1;
  baseCandidateId: string;
  analysisRevision: string;
  assemblyRevision: string;
  range: {
    startWordId: string;
    endWordId: string;
  };
  speakerFraming: {
    mode: "active-speaker";
    focusTrackId: string;
    shotTrackId: string;
    smoothingProfile: "editorial";
  };
  captions: {
    profile: "clean-emphasis";
  };
  visuals: {
    planRevision: string;
    cues: VisualCueV1[];
  };
  audio: {
    normalization: "speech-safe";
  };
};
```

`CompositionManifestV1` is the internal composition/render artifact. The
browser derives duration, timestamps, caption groups, visual coverage, and the
confirmation summary from the manifest plus normalized analysis/assembly. It
does not persist derived values or author a replacement manifest.

### 7.2 Locked selected range

- The selected candidate supplies the exact start and end word IDs.
- The range is 10–60 seconds, starts before it ends, and contains audible words.
- There is no manual-range fallback and no trim UI.
- Rejected or unresolved candidate IDs cannot enter assembly or rendering.

### 7.3 AI speaker framing

Speaker framing is an automatic assembly result, never a user-selected crop.
The focus track contains time-bounded segments tied to detected shots and face
tracks. It resets at camera cuts, uses audio-visual speaking evidence in wide
shots, applies hysteresis to prevent jitter, preserves headroom and safe zones,
and never infers or displays identity. Owner evaluation tooling may visualize
boxes and scores separately; the public flow cannot alter them.

### 7.4 Fixed captions

Preview and render use one source-controlled `clean-emphasis` profile:

- warm-white semibold sans text with a subtle dark backing and at most one
  signal-accent word from deterministic grouping;
- 2–7 display words per group, normally 0.8–3.5 seconds;
- no more than 32 characters per line and two lines where feasible;
- breaks at strong punctuation, speaker changes, or meaningful pauses;
- captions remain inside safe zones and above every visual layout;
- provider words and timings remain immutable;
- no caption text correction, theme, density, font, color, placement, or
  emphasis control exists in the visitor experience.

### 7.5 Contextual visual beats

- Each cue references exact word IDs and one validated asset.
- `full-frame` temporarily replaces footage but never podcast audio or captions.
- `picture-in-picture` and `lower-card` keep footage visible and cannot cover the
  active face or caption group.
- Generated images depict grounded concrete concepts; exact equations, numbers,
  and quotes use deterministic cards.
- Assets share one approved art direction and are generated only for the chosen
  clip. There is no asset browser, upload, selection, rejection, retiming, or
  layout control.
- Maximum cues and total coverage follow the core-story duration table.

### 7.6 No public mutation surface

The demo contains no editor, assistant/chatbot, instruction field, manual trim,
caption correction or styling, headline control, focus/visual track control,
timeline, proposal/diff/apply flow, undo, or redo. The browser can select one
candidate, play the read-only automatic preview, confirm rendering, download,
and clear. Any future editing product is deferred and requires a new owner
decision, source-of-truth revision, schemas, tickets, and release evidence.

### 7.7 Preview/render parity

Preview and export share the normalized manifest, word-to-time resolution,
caption grouping/profile, shot/focus track, safe-zone constants, crop math,
visual cue timing/assets/layouts/motion/transitions, card tokens, and fallback
decisions. Known acceptable differences are font antialiasing, decoded frame
selection, browser video color, and exact FFmpeg text rasterization. Golden
fixtures set tolerances; any semantic difference is a bug.

## 8. System architecture

### 8.1 Deployment shape

```text
Browser
  -> public Next.js frontend (Cloud Run)
       -> same-origin /v1 proxy with service identity
            -> private Express control API (Cloud Run)
                 -> private temporary Cloud Storage bucket
                 -> Deepgram pre-recorded transcription adapter
                 -> OpenAI Responses adapters
                 -> OpenAI Image adapter
                 -> Cloud Run media-job execution

media-job (one job definition, three allow-listed modes)
  analyze:
    inspect/extract -> transcribe -> select/reconcile -> result object
  assemble:
    extract selected range -> detect shots/faces/active speaker
    -> plan visual beats -> generate/render assets -> assembly object
  render:
    validate manifest/tracks/assets -> build ASS/filter graph
    -> FFmpeg -> validate output

apps/frontend -> packages/contracts <- apps/backend
```

One Cloud Run Job definition and one backend image family are used. The job
entry point accepts only `analyze`, `assemble`, or `render` as a
source-controlled argument.
It reads a private job descriptor by opaque ID. No prompt, transcript, path,
URL, or secret is passed in command arguments or environment overrides.

The purpose-recorded sample video is one versioned, rights-cleared private media
object under a reserved `samples/` prefix in the same bucket. It is not a
temporary user object, is excluded from session lifecycle rules, and is never
replaced in place. The backend fixture pins its object generation and SHA-256.
The browser receives only a short-lived playback capability; the job reads it
through its service identity. This avoids committing a 12–20 minute video to
Git or bloating the frontend image while keeping the bucket private. Local
development uses a small synthetic fixture and the same precomputed analysis
and assembly shapes.

### 8.2 Why these boundaries exist

| Boundary | Owned decision |
| --- | --- |
| Browser/frontend | Accessible staged experience, local file handling, preview, reducer, allow-listed persistence. |
| Private control API | Validation, authorization, spend gates, orchestration, error mapping, signed grants, result delivery. |
| Contracts package | Browser-safe HTTP and domain schemas that cross the frontend/backend boundary. |
| Media job | Long-running media/process work, analysis orchestration, Python/PyTorch active-speaker subprocess, visual asset creation, deterministic render, temp-file cleanup. |
| Temporary bucket | Large media, narrow execution descriptors/results, refresh recovery, output delivery, atomic markers. |
| Provider adapters | SDK translation, timeouts, response normalization, and fake/live parity. |

No additional service is justified for the demo. In particular, there is no
database, Redis, Pub/Sub, separate worker fleet, event bus, CMS, analytics
pipeline, or authentication service.

### 8.3 Request and media paths

- Browser JSON calls use same-origin `/v1`.
- Next.js proxy authenticates to the private API with its service identity and
  forwards only allow-listed headers.
- Large media uploads and downloads use short-lived object-specific Cloud
  Storage capabilities and bypass both application services.
- API and job access private objects using least-privilege service accounts.
- Provider credentials exist only in Secret Manager and are mounted or fetched
  only by the backend/job identities that need them.

### 8.4 Control objects, not a database

The private bucket may contain only these temporary object classes:

```text
sessions/<opaque-session-id>/source/source.bin
sessions/<opaque-session-id>/analysis/media.json
sessions/<opaque-session-id>/analysis/transcript.json
sessions/<opaque-session-id>/analysis/candidates.json
sessions/<opaque-session-id>/assembly/shots.json
sessions/<opaque-session-id>/assembly/speaker-focus.json
sessions/<opaque-session-id>/assembly/visual-plan.json
sessions/<opaque-session-id>/assembly/assets/<opaque-asset-id>.png
sessions/<opaque-session-id>/composition/render-manifest.json
sessions/<opaque-session-id>/output/clip.mp4
operations/<opaque-operation-id>/descriptor.json
operations/<opaque-operation-id>/progress.json
operations/<opaque-operation-id>/result.json
markers/<opaque-session-id>/<action>/<nonce>.json
leases/<lease-name>/<opaque-operation-id>.json
samples/<version>/conversation.mp4
```

Actual prefixes may be hashed or otherwise obscured. They never contain the
user's filename, title, transcript, speaker, account, or IP-derived identity.

Session, operation, marker, and lease storage is not queryable product history.
Those objects are addressed only from encrypted grant/operation evidence, have
a common short lifecycle, and are deleted together. There is no list/browse
product feature, secondary index, or cross-session relationship. The sole
permanent exception is the versioned rights-cleared sample object; it is a
release asset, not visitor data, and is managed through the rights/release
record rather than the session product.

### 8.5 Encrypted processing grant

The API sets a `__Host-clipping_session` cookie:

- HttpOnly, Secure, SameSite=Strict, Path=/;
- authenticated encryption using an active server-managed key;
- maximum encoded size below 3,500 bytes;
- contains opaque session ID, allowed mode, source/object IDs, current operation
  IDs, result revisions, action counters/nonces, expiry, and key version;
- contains no transcript, filename, prompt, caption, rationale, signed URL, or
  provider token;
- active access lifetime: proposed 2 hours;
- rotated whenever an action counter or owned object set changes;
- invalid after expiry, authentication failure, unsupported version, or clear.

The browser may know the content-free session ID returned in the response, but
JavaScript cannot read the cookie. CSRF/source protections are still required
for mutations because cookies are ambient authority.

### 8.6 Idempotency and leases

Mutations accept a client-generated UUID idempotency key validated by schema.
Before a paid or long-running action, the API atomically creates a content-free
marker object with `ifGenerationMatch=0`. Replays return the existing operation
summary; they do not start another provider call/job.

One source-scoped analysis lease and one global render lease use short-lived
atomic objects plus Cloud Run max-instance/task limits. Expired leases may be
recovered only after checking actual execution state. A process-local mutex is
an optimization, never the sole control.

This provides bounded duplicate prevention without a database. It does not
provide durable per-person quotas for anonymous visitors. Public copy and
operations documentation must not claim otherwise.

### 8.7 Job descriptor

The control API writes a runtime-validated descriptor containing:

- schema version and job mode;
- opaque session and operation IDs;
- exact allowed source/result object references;
- source object generation precondition;
- normalized public/owner limit profile;
- selected provider/model configuration IDs, not credentials;
- timeout/deadline and cancellation marker location;
- for assemble, selected word range, analysis revision, visual/ASD profiles, and
  expected assembly/asset prefixes;
- for render, canonical manifest, analysis/assembly revisions, focus/shot track,
  and validated asset references;
- expected output object and generation precondition.

The job reads only its descriptor, rejects unknown keys/version/mode, and never
lists the bucket to discover work.

### 8.8 Dependency rules

- `apps/frontend` imports `packages/contracts`, never backend source.
- `apps/backend` imports `packages/contracts`; provider SDK payloads stay behind
  backend adapters.
- `packages/contracts` uses browser-safe TypeScript/Zod only.
- Use cases know ports and domain values, not Express request/response objects.
- Routes validate, invoke one use case, and map one result.
- Provider adapters do not decide product policy, limits, or UI messages.
- Rendering accepts normalized domain input; it cannot call the text model.
- Fake providers implement the same ports and validation as live adapters.
- Configuration is parsed once during explicit composition, not at module
  import.
- `app.ts` constructs Express without listening; `server.ts` owns the port.
- `media-job.ts` owns process exit and signal handling; rendering modules do not.

## 9. Repository and decision ownership

Create a directory only when its first real module arrives. The following is the
proposed final shape, not permission to pre-create placeholders.

```text
ClipBuilder/
├─ AGENTS.md
├─ README.md
├─ package.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
├─ eslint.config.mjs
├─ prettier.config.mjs
├─ .editorconfig
├─ .gitignore
├─ .env.example
├─ apps/
│  ├─ frontend/
│  │  ├─ README.md
│  │  ├─ package.json
│  │  ├─ next.config.ts
│  │  ├─ tsconfig.json
│  │  ├─ vitest.config.ts
│  │  ├─ public/
│  │  │  └─ sample/
│  │  │     ├─ README.md
│  │  │     └─ sample-poster.webp
│  │  └─ src/
│  │     ├─ app/
│  │     │  ├─ layout.tsx
│  │     │  ├─ page.tsx
│  │     │  ├─ error.tsx
│  │     │  ├─ not-found.tsx
│  │     │  ├─ robots.ts
│  │     │  └─ v1/[...path]/route.ts
│  │     ├─ features/
│  │     │  ├─ session/
│  │     │  │  ├─ ClippingSessionProvider.tsx
│  │     │  │  ├─ reducer.ts
│  │     │  │  ├─ events.ts
│  │     │  │  ├─ selectors.ts
│  │     │  │  ├─ persistence.ts
│  │     │  │  ├─ persistence.schema.ts
│  │     │  │  ├─ reconcile.ts
│  │     │  │  └─ __tests__/
│  │     │  ├─ intake/
│  │     │  │  ├─ SourceIntake.tsx
│  │     │  │  ├─ RightsDisclosure.tsx
│  │     │  │  ├─ localMediaInspection.ts
│  │     │  │  └─ __tests__/
│  │     │  ├─ upload/
│  │     │  │  ├─ UploadProgress.tsx
│  │     │  │  ├─ resumableUpload.ts
│  │     │  │  ├─ uploadLifecycle.ts
│  │     │  │  └─ __tests__/
│  │     │  ├─ analysis/
│  │     │  │  ├─ AnalysisProgress.tsx
│  │     │  │  ├─ analysisPolling.ts
│  │     │  │  └─ __tests__/
│  │     │  ├─ candidates/
│  │     │  │  ├─ CandidateReview.tsx
│  │     │  │  ├─ CandidateCard.tsx
│  │     │  │  ├─ EvidenceInspector.tsx
│  │     │  │  ├─ SourceRangeRail.tsx
│  │     │  │  └─ __tests__/
│  │     │  ├─ assembly/
│  │     │  │  ├─ AssemblyProgress.tsx
│  │     │  │  ├─ AssemblyStoryboard.tsx
│  │     │  │  └─ __tests__/
│  │     │  ├─ review/
│  │     │  │  ├─ AutomaticClipReview.tsx
│  │     │  │  ├─ VerticalPreview.tsx
│  │     │  │  ├─ ClipFacts.tsx
│  │     │  │  ├─ previewLayout.ts
│  │     │  │  └─ __tests__/
│  │     │  ├─ render/
│  │     │  │  ├─ RenderConfirmation.tsx
│  │     │  │  ├─ RenderProgress.tsx
│  │     │  │  ├─ RenderResult.tsx
│  │     │  │  └─ __tests__/
│  │     │  └─ cleanup/
│  │     │     ├─ ClearSessionDialog.tsx
│  │     │     ├─ CleanupStatus.tsx
│  │     │     └─ __tests__/
│  │     ├─ shared/
│  │     │  ├─ api/
│  │     │  │  ├─ client.ts
│  │     │  │  ├─ errors.ts
│  │     │  │  └─ polling.ts
│  │     │  ├─ media/
│  │     │  │  ├─ objectUrl.ts
│  │     │  │  ├─ playbackRange.ts
│  │     │  │  └─ timecode.ts
│  │     │  └─ ui/
│  │     │     ├─ Button.tsx
│  │     │     ├─ Dialog.tsx
│  │     │     ├─ Drawer.tsx
│  │     │     ├─ ErrorNotice.tsx
│  │     │     ├─ Icon.tsx
│  │     │     ├─ ProgressStages.tsx
│  │     │     ├─ SegmentedControl.tsx
│  │     │     ├─ Tabs.tsx
│  │     │     └─ VisuallyHidden.tsx
│  │     └─ styles/
│  │        ├─ tokens.css
│  │        ├─ globals.css
│  │        └─ motion.css
│  └─ backend/
│     ├─ README.md
│     ├─ package.json
│     ├─ tsconfig.json
│     ├─ vitest.config.ts
│     ├─ Dockerfile
│     └─ src/
│        ├─ config/
│        │  ├─ env.schema.ts
│        │  ├─ loadConfig.ts
│        │  └─ profiles.ts
│        ├─ domain/
│        │  ├─ analysis.ts
│        │  ├─ candidates.ts
│        │  ├─ captions.ts
│        │  ├─ composition.ts
│        │  ├─ assembly.ts
│        │  ├─ visualPlan.ts
│        │  ├─ media.ts
│        │  ├─ operations.ts
│        │  └─ result.ts
│        ├─ http/
│        │  ├─ routes/
│        │  │  ├─ config.route.ts
│        │  │  ├─ session.route.ts
│        │  │  ├─ upload.route.ts
│        │  │  ├─ analysis.route.ts
│        │  │  ├─ assembly.route.ts
│        │  │  ├─ render.route.ts
│        │  │  └─ operation.route.ts
│        │  ├─ middleware/
│        │  │  ├─ requestContext.ts
│        │  │  ├─ requireJson.ts
│        │  │  ├─ requireSession.ts
│        │  │  ├─ requireTrustedSource.ts
│        │  │  ├─ rateLimit.ts
│        │  │  └─ errorBoundary.ts
│        │  ├─ errorMapper.ts
│        │  └─ response.ts
│        ├─ use-cases/
│        │  ├─ createSession.ts
│        │  ├─ restoreSession.ts
│        │  ├─ authorizeUpload.ts
│        │  ├─ completeUpload.ts
│        │  ├─ startAnalysis.ts
│        │  ├─ getOperation.ts
│        │  ├─ getAnalysisResult.ts
│        │  ├─ startAssembly.ts
│        │  ├─ getAssemblyResult.ts
│        │  ├─ startRender.ts
│        │  ├─ authorizeDownload.ts
│        │  ├─ cancelOperation.ts
│        │  └─ clearSession.ts
│        ├─ providers/
│        │  ├─ transcription/
│        │  │  ├─ port.ts
│        │  │  ├─ deepgram.adapter.ts
│        │  │  ├─ fake.adapter.ts
│        │  │  └─ normalize.ts
│        │  ├─ openai/
│        │  │  ├─ candidate.port.ts
│        │  │  ├─ candidate.adapter.ts
│        │  │  ├─ fake.adapter.ts
│        │  │  ├─ prompts.ts
│        │  │  └─ schemas.ts
│        │  ├─ image-generation/
│        │  │  ├─ port.ts
│        │  │  ├─ openai.adapter.ts
│        │  │  └─ fake.adapter.ts
│        │  ├─ storage/
│        │  │  ├─ port.ts
│        │  │  ├─ gcs.adapter.ts
│        │  │  ├─ fake.adapter.ts
│        │  │  └─ objectNames.ts
│        │  ├─ jobs/
│        │  │  ├─ port.ts
│        │  │  ├─ cloudRun.adapter.ts
│        │  │  └─ fake.adapter.ts
│        │  └─ abuse/
│        │     ├─ port.ts
│        │     ├─ turnstile.adapter.ts
│        │     └─ fake.adapter.ts
│        ├─ media/
│        │  ├─ ffprobe.ts
│        │  ├─ processRunner.ts
│        │  ├─ audioExtraction.ts
│        │  ├─ captionGrouping.ts
│        │  ├─ assCompiler.ts
│        │  ├─ cropCompiler.ts
│        │  ├─ shotDetection.ts
│        │  ├─ activeSpeakerRunner.ts
│        │  ├─ focusTrackCompiler.ts
│        │  ├─ visualPlanReconciler.ts
│        │  ├─ visualAssetValidator.ts
│        │  ├─ equationCardCompiler.ts
│        │  ├─ visualTimelineCompiler.ts
│        │  ├─ filterGraphCompiler.ts
│        │  ├─ renderCompiler.ts
│        │  ├─ outputValidator.ts
│        │  └─ tempWorkspace.ts
│        ├─ jobs/
│        │  ├─ descriptor.schema.ts
│        │  ├─ analyzeJob.ts
│        │  ├─ assembleJob.ts
│        │  ├─ renderJob.ts
│        │  ├─ progressWriter.ts
│        │  ├─ cancellation.ts
│        │  └─ cleanup.ts
│        ├─ security/
│        │  ├─ processingGrant.ts
│        │  ├─ csrf.ts
│        │  ├─ idempotency.ts
│        │  ├─ leases.ts
│        │  ├─ admission.ts
│        │  ├─ safeLogging.ts
│        │  └─ signedCapability.ts
│        ├─ demo/
│        │  ├─ sampleManifest.ts
│        │  ├─ sampleAnalysis.ts
│        │  └─ fakeClock.ts
│        ├─ observability/
│        │  ├─ logger.ts
│        │  ├─ metrics.ts
│        │  └─ requestId.ts
│        ├─ composition.ts
│        ├─ app.ts
│        ├─ server.ts
│        ├─ media-job.ts
│        └─ vision/
│           ├─ requirements.lock
│           ├─ active_speaker.py
│           ├─ schemas.py
│           └─ model-notices/
├─ packages/
│  └─ contracts/
│     ├─ README.md
│     ├─ package.json
│     ├─ tsconfig.json
│     └─ src/
│        ├─ constants.ts
│        ├─ ids.schema.ts
│        ├─ errors.schema.ts
│        ├─ media.schema.ts
│        ├─ transcript.schema.ts
│        ├─ candidate.schema.ts
│        ├─ composition.schema.ts
│        ├─ assembly.schema.ts
│        ├─ visual-plan.schema.ts
│        ├─ api.schema.ts
│        └─ index.ts
├─ tests/
│  ├─ fixtures/
│  │  ├─ media/README.md
│  │  ├─ transcripts/
│  │  ├─ candidates/
│  │  ├─ assemblies/
│  │  ├─ visual-plans/
│  │  ├─ active-speaker/
│  │  ├─ provider-errors/
│  │  └─ prompt-injection/
│  ├─ golden/
│  │  ├─ manifests/
│  │  ├─ ffmpeg-args/
│  │  ├─ ass/
│  │  └─ rendered-frames/
│  └─ e2e/
│     ├─ sample-flow.spec.ts
│     ├─ failure-recovery.spec.ts
│     ├─ responsive.spec.ts
│     └─ accessibility.spec.ts
├─ docs/
│  ├─ AI_CLIPPING_DEMO_SOURCE_OF_TRUTH.md
│  ├─ AI_CLIPPING_DEMO_BRIEF.md
│  ├─ design-research/
│  ├─ decisions/
│  ├─ tickets/
│  └─ operations/
│     ├─ LOCAL_DEVELOPMENT.md
│     ├─ PROVIDER_SETUP.md
│     ├─ MEDIA_RIGHTS_RECORD.md
│     ├─ COST_MODEL.md
│     ├─ DEPLOYMENT.md
│     ├─ ROLLBACK.md
│     ├─ DATA_RETENTION.md
│     └─ RELEASE_EVIDENCE_TEMPLATE.md
└─ .github/
   └─ workflows/
      └─ quality.yml
```

### 9.1 Document ownership

| Artifact | Owns | Must not own |
| --- | --- | --- |
| Root `README.md` | Concise portfolio story, architecture snapshot, safe local start, live link | Provider secrets, full operations manual, stale roadmap promises |
| `AGENTS.md` | Repository operating rules, paid-call prohibition, privacy, test isolation, Git/process constraints | Product decisions duplicated from this document |
| This file | Current product, architecture, state, data, cost, design, release authority | Ticket progress or secret values |
| Brief | Research, alternatives, cost assumptions, decision history | Current behavior after this file exists |
| Design HTML | Approved colors, typography, spacing, representative states/components | Workflow or hidden interactions |
| Ticket | One bounded implementation scope, dependencies, files, acceptance, evidence | Cross-project scope changes |
| Operations docs | Setup, deployment, rollback, retention, cost/release evidence | Public marketing claims |

### 9.2 Code ownership rules

- Feature folders own stage-specific UI and browser behavior.
- `shared/ui` contains only stable visual primitives used by multiple features.
- Cross-boundary schemas live once in contracts; frontend persistence and
  backend job descriptors stay with their owners.
- Provider raw types never escape adapters.
- Test fixtures are data, not application modules, and never contain real user
  media or credentials.
- Avoid root barrels and catch-all `utils`, `common`, `helpers`, or `services`.
- Do not create both `domain` and `use-cases` versions of the same policy.

## 10. Shared contract vocabulary and exact limits

All external input is untrusted. Zod schemas use `.strict()`, bounded arrays,
bounded normalized strings, explicit enums, and refinements for cross-field
rules. Unknown keys fail. JSON Schema sent to a model uses
`additionalProperties: false`; provider conformance never replaces local Zod
validation.

### 10.1 Global limits

| Constant | Public default | Owner-validation ceiling | Notes |
| --- | ---: | ---: | --- |
| `MAX_JSON_REQUEST_BYTES` | 64 KiB | 128 KiB | Route-specific limits may be lower. |
| `MAX_JSON_RESPONSE_BYTES` | 2 MiB | 4 MiB | Analysis result is compact normalized JSON. |
| `MAX_SOURCE_BYTES` | 524,288,000 | 1,610,612,736 | Locked public/owner profiles: 500 MiB / 1.5 GiB. |
| `MIN_SOURCE_SECONDS` | 15 | 15 | Locked; reject trivial/empty media. |
| `MAX_SOURCE_SECONDS` | 1,200 | 3,600 | Locked public/owner profiles: 20 / 60 minutes. |
| `MAX_VIDEO_WIDTH` | 3,840 | 3,840 | Width and height each bounded. |
| `MAX_VIDEO_HEIGHT` | 3,840 | 3,840 | Total decoded pixels also bounded. |
| `MAX_FRAME_PIXELS` | 8,294,400 | 8,294,400 | Up to 4K-class frames. |
| `MIN_FRAME_RATE` | 12 fps | 12 fps | Measured average/rational value. |
| `MAX_FRAME_RATE` | 60 fps | 60 fps | Higher rates are rejected for demo cost. |
| `MAX_VIDEO_STREAMS` | 1 | 1 | No multicamera selection. |
| `MAX_AUDIO_STREAMS` | 1 | 1 | One speech track only. |
| `MAX_TRANSCRIPT_WORDS` | 12,000 | 30,000 | Hard stop before model input. |
| `MAX_TRANSCRIPT_CHARS` | 200,000 | 500,000 | Normalized display text. |
| `CANDIDATE_TARGET` | 3 | 3 | Desired number of strong alternatives; never pad weak output. |
| `MAX_CANDIDATE_COUNT` | 4 | 4 | Public and owner flows return zero to four. |
| `MIN_CLIP_SECONDS` | 10 | 10 | Derived from word timestamps. |
| `MAX_CLIP_SECONDS` | 60 | 60 | Locked demo range. |
| `MAX_FACE_TRACKS_PER_SHOT` | 4 | 4 | Bounds active-speaker work. |
| `MAX_VISUAL_CUES` | 3 | 3 | Duration table may lower this. |
| `MIN_VISUAL_CUE_MS` | 1,500 | 1,500 | Full-frame/overlay readability. |
| `MAX_VISUAL_CUE_MS` | 4,500 | 4,500 | Keeps podcast footage primary. |
| `MAX_VISUAL_COVERAGE_PERCENT` | 45 | 45 | Across the final clip. |
| `MAX_GENERATED_IMAGE_CALLS` | 3 | 3 | One asset per planned generated cue. |
| `MAX_GENERATED_ASSET_BYTES` | 15 MiB | 15 MiB | Decoded/validated per asset. |
| `MAX_FINAL_RENDERS` | 1 | 3 | Proposed public limit. |
| `MAX_OUTPUT_BYTES` | 209,715,200 | 314,572,800 | 200 / 300 MiB hard validation. |

#### Public upload limit policy

The public live-upload profile accepts a source only when **both** independent
limits pass:

```text
15_000 <= authoritativeDurationMs <= 1_200_000
AND
authoritativeSourceBytes <= 524_288_000
```

`524,288,000` bytes means exactly 500 MiB using binary mebibytes
(`1 MiB = 1,048,576 bytes`). The duration range is inclusive: exactly 15
seconds and exactly 20 minutes are valid. The byte ceiling is also inclusive:
exactly 500 MiB is valid. Passing one limit never compensates for failing the
other.

Both limits are required for different reasons:

- The **20-minute duration ceiling** bounds transcription spend, transcript and
  model-context size, analysis latency, active-speaker processing, and abuse. A
  low-bitrate 500 MiB file could otherwise contain hours of media.
- The **500 MiB size ceiling** bounds browser upload time, network traffic,
  temporary object storage, local media-job workspace, and abuse. A 20-minute
  high-bitrate recording could otherwise be several gigabytes.

This is deliberately a demo-sized envelope. Twenty minutes supplies enough
real conversation to find several distinct candidate moments while keeping the
maximum Nova-3 monolingual transcription charge near **$0.086 per accepted
source at the 2026-09-29 price checked for this plan**. Five hundred MiB is
large enough for sensibly compressed 1080p podcast footage without turning an
anonymous portfolio interaction into a large-file ingest product. These are
product limits, not claims that every accepted file will finish at the same
speed.

The visible upload copy is:

> For the fastest demo, use an MP4 under 10 minutes and 250 MiB. Maximum: 20
> minutes and 500 MiB. Your final clip will be 10–60 seconds.

The first sentence is a performance recommendation, not another rejection
rule. The 10–60-second final clip bound is separate from the 15-second to
20-minute source-video bound.

| Source | Decision | Reason/code |
| --- | --- | --- |
| 9 minutes, 220 MiB | Accept | Recommended fast-path envelope and hard limits pass. |
| 15 minutes, 350 MiB | Accept | Both hard limits pass. |
| 19 minutes, 600 MiB | Reject | Size fails even though duration passes: `SOURCE_TOO_LARGE`. |
| 25 minutes, 200 MiB | Reject | Duration fails even though size passes: `DURATION_OUT_OF_RANGE`. |
| Exactly 20 minutes, exactly 500 MiB | Accept | Both inclusive boundaries pass if all other media checks pass. |

Enforcement happens before any paid transcription or model call:

1. The browser performs an advisory preflight using `File.size` and locally
   available media metadata. An obvious failure never requests upload
   authorization. Browser metadata is helpful UX, never security evidence.
2. `POST /v1/uploads/authorize` rejects a declared size above 500 MiB before
   Turnstile or object creation. The completed upload is checked again against
   authoritative object metadata; a spoofed or mismatched declared size cannot
   bypass the limit.
3. The inspection job runs bounded `ffprobe` and treats its finite stream
   duration as authoritative. Only a source whose real bytes and real duration
   pass may receive a `mediaId` eligible for analysis.

On failure, the API returns the specific non-content-reflecting error, makes no
Deepgram or OpenAI call, and best-effort deletes the rejected remote object and
inspection workspace immediately. The interface keeps the rights disclosure
and offers **Choose another video** and **Use the sample**. It does not silently
compress, transcode, trim, or charge for rejected media; source preparation is
outside this demo's core flow.

Runtime configuration may lower public limits for an incident or launch, but
it cannot raise them above these compiled public ceilings. The separate
owner-validation profile allows at most **60 minutes AND 1.5 GiB**, is protected
by owner-only authorization and configuration, and exists solely for measured
validation. It must never be exposed as the anonymous public limit.

### 10.2 Supported input media

Authoritative `ffprobe` validation accepts:

- container: ISO BMFF MP4/MOV-compatible input reported as allow-listed MP4
  family, or WebM/Matroska reported as allow-listed WebM family;
- video codec: H.264/AVC, VP8, or VP9;
- audio codec: AAC, Opus, or Vorbis;
- one video stream and exactly one usable audio stream;
- pixel format decodable by the pinned FFmpeg build;
- finite positive duration within profile bounds;
- width/height/frame rate/pixel count within profile bounds;
- no attached pictures counted as the video stream;
- no encrypted/DRM media;
- no external data references or playlists.

HEVC/H.265, AV1 input, ProRes, multiple tracks, image sequences, animated GIF,
audio-only files, and arbitrary Matroska are not promised in v1. Add support
only with fixtures, browser preview behavior, render evidence, and cost review.

### 10.3 Identifier schemas

IDs are content-free UUID v4 strings or 128-bit URL-safe random values with a
fixed prefix, maximum 64 characters:

- `ses_…`, `upl_…`, `op_…`, `ana_…`, `cand_…`, `prop_…`, `rnd_…`;
- word IDs are deterministic local ordinals `w_000001` through the transcript
  bound;
- speaker IDs are normalized `spk_0` through `spk_15` and are not identities;
- request IDs are server-generated and safe to display;
- no ID embeds timestamp, filename, email, IP, title, provider ID, or object key.

### 10.4 Media descriptor

```ts
type MediaDescriptor = {
  mediaId: string;
  objectGeneration: string;
  container: "mp4" | "webm";
  videoCodec: "h264" | "vp8" | "vp9";
  audioCodec: "aac" | "opus" | "vorbis";
  durationMs: number;
  width: number;
  height: number;
  averageFrameRate: number;
  rotationDegrees: 0 | 90 | 180 | 270;
  hasAudio: true;
  bytes: number;
  orientation: "landscape" | "portrait" | "square";
};
```

All numbers are finite integers except `averageFrameRate`, which is finite and
bounded. Rotation is normalized before orientation/crop decisions.

### 10.5 Transcript bundle

```ts
type TranscriptWord = {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  punctuatedText: string;
  speakerId: string | null;
  confidence: number | null;
};

type TranscriptUtterance = {
  id: string;
  startWordId: string;
  endWordId: string;
  speakerId: string | null;
};

type TranscriptBundleV1 = {
  version: 1;
  revision: string;
  language: string;
  durationMs: number;
  words: TranscriptWord[];
  utterances: TranscriptUtterance[];
  providerMetadata: {
    provider: "fake" | "deepgram";
    modelConfigId: string;
    diarizationAvailable: boolean;
  };
};
```

Word rules:

- 1–80 characters for `text` and `punctuatedText` after Unicode NFC;
- no control characters or bidi overrides;
- `0 <= startMs < endMs <= media.durationMs + 250`;
- start times are nondecreasing; CL-001 accepts structural overlap because no
  numeric provider-normalization tolerance is yet approved; CL-007 must define,
  record, and test the source-controlled speaker-overlap tolerance before any
  live transcript can pass normalization;
- confidence is `null` or `[0,1]` and is not shown as editorial certainty;
- speaker IDs are opaque turn labels, not inferred names;
- provider raw alternatives, tokens, request IDs, and callbacks are discarded.

### 10.6 Candidate contract

```ts
type ShareabilitySignal =
  | "immediate-hook"
  | "self-contained"
  | "clear-payoff"
  | "specific"
  | "human-energy"
  | "clean-boundaries"
  | "appropriate-length"
  | "visual-feasibility";

type CandidateEvidence = {
  signal: ShareabilitySignal;
  wordIds: string[];
  note: string;
};

type CandidateCaveat = {
  code:
    | "needs-earlier-context"
    | "speaker-overlap"
    | "weak-ending"
    | "speaker-framing-risk"
    | "low-transcript-confidence"
    | "similar-to-another-candidate";
  note: string;
};

type ClipCandidateV1 = {
  version: 1;
  id: string;
  rank: number;
  startWordId: string;
  endWordId: string;
  title: string;
  hook: string;
  rationale: string;
  evidence: CandidateEvidence[];
  caveats: CandidateCaveat[];
};
```

Limits:

- title 1–80, hook 1–140, rationale 1–320 characters;
- 2–8 distinct evidence signals; each has 1–8 unique existing word IDs and a
  1–160 character note;
- 0–3 caveats; each note 1–160 characters;
- duration and all word references are derived and validated server-side;
- rank is assigned after reconciliation, contiguous from 1;
- candidate ranges may not overlap more than 35% of the shorter candidate;
- candidates should be distributed across the source when valid alternatives
  exist;
- `human-energy` must be evidenced by words/turn structure, not sensitive
  emotion, health, or personality inference;
- title/hook may summarize but cannot invent a factual claim or quote.

### 10.7 Shareability rubric

| Signal | Positive evidence | Reject/flag when |
| --- | --- | --- |
| Immediate hook | Claim, tension, question, surprise, or concrete promise in opening seconds | Greeting, biography, filler, or dependent pronoun dominates opening |
| Self-contained | People, subject, and stakes can be understood inside range | Depends on unnamed prior story or off-clip definition |
| Clear payoff | Resolves question, lands example/punchline, or states takeaway | Ends during setup or before supporting explanation |
| Specific | Concrete example, number, image, or memorable phrase | Generic agreement or broad slogan only |
| Human energy | Audible disagreement, conviction, surprise, or humor evidenced by text/turns | Trait/emotion inference unsupported by words |
| Clean boundaries | Starts and ends at complete thought boundaries | Mid-sentence, clipped breath, or unresolved referent |
| Appropriate length | Idea earns its 10–60 second range | Padding or compression harms comprehension |
| Visual feasibility | Visible speakers and mentioned concepts can support vertical framing/visual storytelling | Essential action/text is unreadable or no visible speaker can ground the moment |

No aggregate public score is computed. Rank is a qualitative recommendation
after deterministic validity checks.

### 10.8 Speaker-focus and visual-plan contracts

```ts
type ShotSegmentV1 = {
  id: string;
  startMs: number;
  endMs: number;
  cutIn: "source-start" | "hard-cut" | "adaptive-cut";
};

type FaceTrackV1 = {
  id: string;
  shotId: string;
  startMs: number;
  endMs: number;
  samples: Array<{
    atMs: number;
    x: number;
    y: number;
    width: number;
    height: number;
    speakingProbability: number;
  }>;
};

type SpeakerFocusSegmentV1 = {
  id: string;
  shotId: string;
  startWordId: string;
  endWordId: string;
  faceTrackId: string;
  cropCenterX: number;
  cropCenterY: number;
  transition: "cut" | "ease" | "hold";
};

type SpeakerFocusTrackV1 = {
  version: 1;
  revision: string;
  shots: ShotSegmentV1[];
  faceTracks: FaceTrackV1[];
  focus: SpeakerFocusSegmentV1[];
  detectorConfigId: string;
};
```

Coordinates/probabilities are finite `[0,1]`; timestamps lie inside the padded
selected range; face tracks cannot cross a shot boundary; focus segments are
ordered, non-overlapping, reference existing tracks, and cover every podcast-
footage interval in the final manifest. Raw face embeddings and identity labels
are forbidden.

```ts
type VisualAssetRequestV1 = {
  id: string;
  kind:
    | "generated-concept-image"
    | "equation-card"
    | "stat-card"
    | "quote-card";
  subjectWordIds: string[];
  factualBrief: string;
  imagePrompt: string | null;
  equationTex: string | null;
  exactText: string | null;
  background: "opaque" | "transparent";
  artDirection: "precision-cut-v1";
};

type VisualCuePlanV1 = {
  id: string;
  startWordId: string;
  endWordId: string;
  assetRequestId: string;
  layout: "full-frame" | "picture-in-picture" | "lower-card";
  motion: "none" | "slow-push-in";
  transition: "cut" | "short-dissolve";
  rationale: string;
};

type VisualPlanV1 = {
  version: 1;
  revision: string;
  artDirection: "precision-cut-v1";
  requests: VisualAssetRequestV1[];
  cues: VisualCuePlanV1[];
  totalCoverageMs: number;
};
```

Visual-plan rules:

- 0–3 requests/cues and no unused request;
- all subject/start/end word IDs exist inside the selected range;
- cue timing derives from IDs and respects duration/coverage/breathing limits;
- `factualBrief`, prompt, exact text, and rationale are bounded plain text;
- equation/card exact content must be directly supported by transcript words;
- image prompt describes only the grounded subject plus approved art direction;
- no real-person likeness, logo, copyrighted character/style imitation, brand,
  URL, artist name, camera metadata, or unsupported factual detail;
- generated image requests use `imagePrompt`; deterministic cards use
  `equationTex`/`exactText`; never both routes for one asset;
- asset IDs and object paths are assigned by the server, not the model.

```ts
type VisualAssetV1 = {
  id: string;
  requestId: string;
  source: "openai-image" | "deterministic-card" | "fake-fixture";
  contentType: "image/png" | "image/webp";
  width: number;
  height: number;
  bytes: number;
  sha256: string;
  hasAlpha: boolean;
};

type AssemblyBundleV1 = {
  version: 1;
  assemblyId: string;
  revision: string;
  analysisRevision: string;
  selectedStartWordId: string;
  selectedEndWordId: string;
  speakerFocus: SpeakerFocusTrackV1;
  visualPlan: VisualPlanV1;
  assets: VisualAssetV1[];
  compositionManifest: CompositionManifestV1;
};
```

Every asset is decoded and validated; declared format/dimensions/alpha must
match bytes, and opaque/transparent requirements must match the layout. The API
never returns private object names; browser preview receives short-lived
capabilities keyed to asset IDs.

### 10.9 Operation status

```ts
type OperationStatusV1 = {
  operationId: string;
  kind: "media-inspection" | "analysis" | "assembly" | "render" | "cleanup";
  state:
    | "queued"
    | "running"
    | "cancel-requested"
    | "succeeded"
    | "failed"
    | "cancelled"
    | "expired";
  stageCode: string;
  startedAt: string | null;
  updatedAt: string;
  completedAt: string | null;
  pollAfterMs: number;
  resultRevision: string | null;
  error: SafeError | null;
};
```

Dates are UTC RFC 3339 strings. `pollAfterMs` is 1,000–10,000. Operation status
contains no transcript, filename, title, object key, provider response, or
signed capability.

### 10.10 Error envelope

```ts
type SafeError = {
  code: ErrorCode;
  message: string;
  retryable: boolean;
  requestId: string;
  ruleId?: string;
  retryAfterSeconds?: number;
};

type ErrorEnvelope = {
  error: SafeError;
};
```

`message` comes from a source-controlled public allow-list. Provider messages,
schema payloads, exceptions, file/object names, request bodies, and validation
values never populate it. Development logs still obey the content ban.

## 11. HTTP API

### 11.1 API conventions

- Base path: same-origin `/v1`.
- JSON requests require `application/json`; other bodies get `415`.
- Unknown fields fail `400` with `INVALID_REQUEST`.
- Mutations require trusted `Origin`/`Sec-Fetch-Site`, valid HttpOnly session
  when applicable, and a UUID `Idempotency-Key` header.
- Paid/compute-bearing mutations also require an action-specific Turnstile token
  in the body or approved header; tokens are never logged or persisted.
- Responses set `Cache-Control: no-store`; signed capability responses also set
  `Referrer-Policy: no-referrer` and are never included in server-rendered HTML.
- Request IDs are returned in `X-Request-Id` and safe envelopes.
- All route timeouts abort downstream work; a client disconnect is propagated
  when doing so cannot corrupt an already-issued job.
- The API does not accept media multipart bodies.

### 11.2 Route inventory

| Method and route | Purpose | Provider/job cost |
| --- | --- | --- |
| `GET /v1/health` | Content-free liveness/readiness | None |
| `GET /v1/config` | Public flags and bounds | None |
| `POST /v1/session` | Start sample or upload session | None |
| `GET /v1/session` | Reconcile current grant/session | Storage metadata only |
| `DELETE /v1/session` | Clear all known artifacts | Storage delete / best-effort cancel |
| `POST /v1/uploads/authorize` | Create one resumable direct upload | Storage operation |
| `POST /v1/uploads/complete` | Verify object and start inspection | One bounded media job |
| `POST /v1/analyses` | Start/reuse analysis | At most one transcription + one OpenAI call |
| `GET /v1/operations/:operationId` | Poll content-free status | Cloud Run/storage metadata |
| `POST /v1/operations/:operationId/cancel` | Request cancellation | No new provider call |
| `GET /v1/analyses/:analysisId` | Fetch normalized result | Private storage read |
| `POST /v1/assemblies` | Build selected speaker/visual first cut | One ASD pass + one visual-plan call + 0–3 image calls |
| `GET /v1/assemblies/:assemblyId` | Fetch tracks, plan, assets, and initial manifest | Private storage read/signing |
| `POST /v1/renders` | Start/reuse render | One media job, no AI provider |
| `POST /v1/downloads/authorize` | Create one short-lived output URL | Storage signing only |

### 11.3 `GET /v1/health`

Response `200`:

```json
{
  "status": "ok",
  "service": "clipping-api",
  "version": "<git-sha>"
}
```

Readiness checks configuration shape and local dependencies only. It must not
call OpenAI, Deepgram, Cloud Run Jobs, or read user objects. Public health does
not reveal project, region, secret, bucket, or provider account details.

### 11.4 `GET /v1/config`

Response contains only browser-safe values:

```ts
type PublicConfigResponse = {
  mode: "fake" | "live";
  sampleEnabled: boolean;
  liveUploadEnabled: boolean;
  liveAnalysisEnabled: boolean;
  liveAssemblyEnabled: boolean;
  liveRenderEnabled: boolean;
  limits: {
    sourceBytes: number;
    sourceSeconds: number;
    clipSecondsMin: number;
    clipSecondsMax: number;
    candidateTarget: 3;
    candidateMax: 4;
    renders: number;
  };
  features: {
    activeSpeakerFraming: true;
    contextualVisuals: boolean;
    trendSignals: boolean;
    languages: string[];
  };
  accessTtlSeconds: number;
  deletionCopyVersion: string;
};
```

No secret, provider key/model pricing, private service URL, bucket name, or
internal feature flag is exposed.

### 11.5 `POST /v1/session`

Request:

```ts
{ mode: "sample" | "upload" }
```

Response `201` sets the encrypted cookie and returns:

```ts
{
  sessionId: string;
  mode: "sample" | "upload";
  expiresAt: string;
  stage: "intake" | "candidates";
  sampleAnalysisId?: string;
}
```

Rules:

- Starting a new session while another is active returns `409
  ACTIVE_SESSION_EXISTS`; the user must clear first.
- Sample returns a fixture analysis revision with no paid call.
- Upload mode is rejected with `403 FEATURE_DISABLED` when any required live
  gate is off.
- Session creation is rate limited but does not consume a paid-operation nonce.

### 11.6 `GET /v1/session`

Returns the server-proven summary necessary for reconciliation:

```ts
type SessionResponse = {
  sessionId: string;
  mode: "sample" | "upload";
  expiresAt: string;
  accessState: "active" | "expired";
  provenStage:
    | "intake"
    | "upload-authorized"
    | "uploaded"
    | "media-inspected"
    | "analyzing"
    | "candidates"
    | "assembling"
    | "clip-review"
    | "rendering"
    | "result";
  media: MediaDescriptor | null;
  activeOperation: OperationStatusV1 | null;
  analysisId: string | null;
  analysisRevision: string | null;
  assemblyId: string | null;
  assemblyRevision: string | null;
  renderId: string | null;
  outputAvailable: boolean;
  remaining: {
    analysisRetries: number;
    renderAttempts: number;
  };
};
```

`assemblyId` and `assemblyRevision` are both required once `provenStage` is
`clip-review`, `rendering`, or `result`; they remain nullable while assembly is
in progress. The browser cannot restore or author an alternate manifest; the
server-proven assembly revision identifies the automatic composition.

It does not return signed URLs or full content. Expired/invalid cookie returns
`401 SESSION_EXPIRED` and clears it.

### 11.7 `POST /v1/uploads/authorize`

Request:

```ts
{
  declaredBytes: number;
  declaredContentType: "video/mp4" | "video/webm";
  turnstileToken: string;
}
```

Response `201`:

```ts
{
  uploadId: string;
  protocol: "gcs-resumable";
  uploadUrl: string;
  expiresAt: string;
  requiredHeaders: Record<string, string>;
  maxBytes: number;
}
```

Validation/order:

1. request/content type/body limit;
2. active upload session and feature flags;
3. CSRF/source and route/global admission;
4. declared byte/type bounds, including `declaredBytes <= 524_288_000` in the
   public profile;
5. Turnstile verification;
6. idempotency marker;
7. create one opaque object/resumable capability;
8. rotate grant and return capability.

`uploadUrl` is a secret bearer capability in memory. It is never logged,
persisted, cached, or sent to error reporting. Expiry target: 15 minutes to
start; an active resumable transfer has the provider's bounded protocol
behavior documented in the upload spike.

### 11.8 `POST /v1/uploads/complete`

Request:

```ts
{
  uploadId: string;
  observedBytes: number;
}
```

Response `202` returns `OperationStatusV1` for `media-inspection`.

Server reads authoritative object metadata and generation. Client-observed
bytes are informational and must match. Missing, wrong-generation, wrong-size,
or wrong-content-type objects are rejected and deleted. One job inspects media;
no provider call is made. The inspection proof exists only after authoritative
bytes and `ffprobe` duration satisfy the active profile, including the public
500 MiB AND 20-minute ceilings. Replays return the same operation.

### 11.9 `POST /v1/analyses`

Request:

```ts
{
  mediaId: string;
  context: {
    contentCategory?: string;
    audience?: string;
    targetPlatform: "generic-vertical" | "tiktok" | "instagram-reels" | "youtube-shorts";
    trendSignals?: string[];
  };
  turnstileToken: string;
}
```

Field bounds:

- category and audience: 0–120 characters each;
- trend signals: feature-flagged, 0–5 strings, 1–160 characters each, with a
  user-visible `as of` date outside model output;
- all strings normalized, control-free, and treated as quoted untrusted data.

Response `202` returns the analysis operation. Validation/order:

1. session/source/revision and inspection proof;
2. feature/paid kill switches;
3. bounds and trusted-source checks;
4. per-session allowance and global/provider admission;
5. Turnstile;
6. atomic idempotency marker and analysis lease;
7. write descriptor and start job;
8. rotate grant.

No automatic retry. If a previous attempt produced a valid transcript, a manual
candidate-selection retry descriptor references that transcript and skips the
transcription adapter.

### 11.10 `GET /v1/operations/:operationId`

The path ID is opaque and content-free. The cookie must own it. Response is
`OperationStatusV1`, `Cache-Control: no-store`. Poll at the server-provided
interval with exponential backoff capped at 10 seconds, pause when the page is
hidden after 30 seconds, and reconcile immediately on visibility regain.

Operation `succeeded` is not enough for UI success; the client then fetches the
runtime-validated result. Missing result moves to a recoverable failure.

### 11.11 `POST /v1/operations/:operationId/cancel`

Request: `{ reason: "user-request" }`.

Response `202` reports `cancel-requested` or terminal status. Cancellation is
idempotent. It sets a private marker and requests Cloud Run execution
cancellation when supported. It does not delete the source; Clear is separate.

### 11.12 `GET /v1/analyses/:analysisId`

Returns:

```ts
type AnalysisBundleV1 = {
  version: 1;
  analysisId: string;
  revision: string;
  media: MediaDescriptor;
  transcript: TranscriptBundleV1;
  candidates: ClipCandidateV1[];
  outcome: "candidates" | "no-strong-candidates";
  warnings: Array<{ code: string; message: string }>;
};
```

The API streams/reads the normalized private result, validates again, limits
response bytes, and returns no provider raw payload. It is available only to
the owning active grant.

### 11.13 `POST /v1/assemblies`

Request:

```ts
{
  analysisId: string;
  selection: {
    candidateId: string | "manual";
    startWordId: string;
    endWordId: string;
  };
  turnstileToken: string;
}
```

Response `202` returns the assembly operation and `assemblyId`.

The server verifies the selected legal 10–60 second range, assembly/image
feature gates, allowance, capacity, and idempotency before writing one
`assemble` descriptor. The job performs shot/face/active-speaker analysis,
visual planning, bounded asset creation, and initial-manifest compilation. It
does not re-transcribe or re-rank candidates.

One assembly may make:

- one visual-planning Responses call;
- zero or one active-speaker inference pass over the selected padded range;
- zero to the duration-based maximum Image API calls;
- deterministic card renders at no AI provider call cost.

The image call allowance is reserved from the validated visual plan before any
asset request starts. No failed image is silently replaced by arbitrary web or
stock content.

### 11.14 `GET /v1/assemblies/:assemblyId`

Returns `AssemblyBundleV1` plus short-lived preview capabilities mapped to the
source and asset IDs. It validates the bundle and every referenced object
generation/hash before response. It never returns raw face crops, model
probabilities beyond owner/debug environments, image prompts in public UI,
private paths, or provider payloads.

### 11.15 `POST /v1/renders`

Request:

```ts
{
  analysisId: string;
  assemblyId: string;
  manifestHash: string;
  turnstileToken: string;
}
```

Response `202` returns a render operation and `renderId`.

The server loads the immutable manifest from the proven assembly, rejects a
hash mismatch, revalidates every word/cue/track/asset reference, resolves a
canonical manifest, hashes it with analysis and assembly revisions plus renderer
version, and atomically
consumes the render attempt. Replays with the same idempotency key/hash return
the same operation. A different or stale hash after a successful output returns
`409 RENDER_LIMIT_REACHED` in public mode.

### 11.16 `POST /v1/downloads/authorize`

Request: `{ renderId: string }`.

Response `200`:

```ts
{
  downloadUrl: string;
  expiresAt: string;
  suggestedFilename: "clipping-demo-export.mp4";
  bytes: number;
}
```

The output must already pass validation. Capability lifetime target: 5 minutes.
Content-Disposition uses the source-controlled filename; no source identity is
included. This route does not mark the file downloaded or delete it.

### 11.17 `DELETE /v1/session`

No request body. Requires trusted source and valid/expired-but-authentic grant.
Returns:

```ts
{
  status: "cleared" | "partially-cleared" | "scheduled-for-deletion";
  deletedClasses: Array<"source" | "analysis" | "manifest" | "output" | "control">;
  pendingClasses: Array<"source" | "analysis" | "manifest" | "output" | "control">;
  message: string;
}
```

It clears the cookie in all outcomes. The server must retain enough in the
in-flight request to attempt all known deletes even if one fails. It does not
return object names.

### 11.18 HTTP status and error codes

| Status | Codes | Meaning |
| ---: | --- | --- |
| 400 | `INVALID_REQUEST`, `INVALID_IDEMPOTENCY_KEY`, `INVALID_MANIFEST` | Client input/schema/domain failure before paid work |
| 401 | `SESSION_MISSING`, `SESSION_EXPIRED`, `SESSION_INVALID` | Grant absent/expired/invalid |
| 403 | `FEATURE_DISABLED`, `PAID_DEMO_DISABLED`, `ABUSE_CHECK_FAILED`, `RIGHTS_ACK_REQUIRED` | Gate denied |
| 404 | `OPERATION_NOT_FOUND`, `RESULT_NOT_FOUND` | Owned opaque resource absent/expired |
| 409 | `ACTIVE_SESSION_EXISTS`, `INVALID_STAGE`, `STALE_REVISION`, `ACTION_IN_PROGRESS`, `LIMIT_REACHED`, `OUTPUT_ALREADY_EXISTS` | State or allowance conflict |
| 413 | `REQUEST_TOO_LARGE`, `SOURCE_TOO_LARGE`, `RESULT_TOO_LARGE` | Bounded payload failure |
| 415 | `UNSUPPORTED_CONTENT_TYPE`, `UNSUPPORTED_MEDIA` | JSON or media type/codec failure |
| 422 | `MISSING_AUDIO`, `DURATION_OUT_OF_RANGE`, `NO_VALID_CANDIDATES`, `MODEL_OUTPUT_REJECTED`, `ASSEMBLY_OUTPUT_REJECTED`, `RENDER_OUTPUT_INVALID` | Valid syntax, unusable domain result |
| 429 | `RATE_LIMITED`, `CAPACITY_FULL`, `PROVIDER_BUDGET_EXHAUSTED` | Admission/spend controls |
| 499/408 mapping | `CLIENT_ABORTED`, `REQUEST_TIMEOUT` | Abort/timeout; use platform-compatible external status |
| 502 | `TRANSCRIPTION_FAILED`, `ACTIVE_SPEAKER_FAILED`, `VISUAL_GENERATION_FAILED`, `STORAGE_FAILED`, `JOB_START_FAILED` | Safe upstream failure |
| 504 | `OPERATION_TIMEOUT` | Deadline exceeded |
| 500 | `INTERNAL_ERROR` | Unexpected content-safe failure |

Whether a code is retryable is route- and evidence-specific, not inferred from
status alone.

## 12. Provider ports, prompts, and deterministic fakes

### 12.1 Provider policy

Each external capability has a product-facing port, one deterministic fake, and
at most one live adapter in the demo. Configuration chooses fake or live during
explicit composition. A fallback provider is not selected automatically.

Provider SDK objects, error types, model response IDs, raw payloads, and retry
behavior do not escape the adapter. Every adapter accepts an `AbortSignal`, has
an explicit deadline, disables SDK retries unless this document permits them,
and maps failures to a small internal taxonomy.

### 12.2 Transcription port

```ts
interface TranscriptionProvider {
  transcribe(
    input: {
      audioPath: string;
      durationMs: number;
      language: "en";
      diarize: boolean;
    },
    context: {
      requestId: string;
      deadline: Date;
      signal: AbortSignal;
    }
  ): Promise<TranscriptBundleV1>;
}
```

Responsibilities:

- accept only a job-local audio path created by the extraction module;
- configure the approved pre-recorded model and required word timing;
- request diarization but tolerate provider-declared unavailability;
- normalize provider words, punctuation, timestamps, and speaker labels;
- generate stable ordinal word/utterance IDs;
- enforce transcript limits before returning;
- discard raw response after normalization;
- report audio minutes and safe provider/model config ID for cost evidence;
- never infer speaker names or protected attributes.

The live adapter must not accept a remote URL supplied by the user. If the
provider upload API is used, the job streams the bounded extracted audio. If a
short-lived signed object URL is ever used, it is created server-side for the
single provider action, never logged, and the provider URL-fetch policy is
reviewed first.

### 12.3 Transcription fake

The fake maps a source-controlled fixture key and media fingerprint to a fixed
valid transcript. It must:

- run without network or credentials;
- honor abort and optional deterministic latency via an injected fake clock;
- expose fixtures for clean speech, two speakers, overlap, silence, unsupported
  language, timeout, provider rejection, and malformed raw data;
- emit the same normalized contract as live;
- count calls so tests prove retry behavior;
- never silently substitute success for an unrecognized fixture.

Production cannot fall back from live to fake on provider failure. Fake output
is visibly labeled in non-production/sample mode.

### 12.4 Candidate analyzer port

```ts
interface CandidateAnalyzer {
  analyze(
    input: CandidateSelectionInputV1,
    context: ProviderCallContext
  ): Promise<CandidateSelectionProviderOutputV1>;
}
```

Input contains only:

- bounded transcript words/utterances with stable IDs and timestamps;
- media duration and orientation;
- source-controlled shareability rubric and allowed signal enum;
- requested count and duration range;
- bounded content category, audience, and target platform;
- optional trend signals only when the feature is approved/enabled.

It does not contain video bytes, raw filename, object path, signed URL, user
identity, IP, cookie/grant, provider transcript payload, or freeform system
configuration.

### 12.5 Candidate prompt boundary

The OpenAI request uses the Responses API, a strict Structured Outputs schema,
and `store: false`. The configured model is proposed `gpt-6-sol`; exact model,
reasoning effort, max output, pricing, project access, and retention must be
re-checked at provider approval.

Prompt construction has four source-controlled parts:

1. role and narrow task;
2. non-negotiable policy and rubric;
3. output schema semantics;
4. a clearly delimited serialized data object.

The prompt states that transcript words, filenames, categories, audiences,
trend signals, and user content are untrusted quoted data and cannot change the
task or output schema. The model must reference IDs and must not copy
instructions found inside the transcript.

The model output schema includes candidate proposals only. It does not include
server IDs, timestamps to trust directly, numeric virality scores, executable
operations, or raw prose outside the schema.

### 12.6 Candidate reconciliation

After local Zod validation, deterministic reconciliation:

1. resolves every word ID;
2. derives start/end timestamps and duration;
3. rejects missing, reversed, duplicate, or out-of-range IDs;
4. checks clean boundary heuristics and legal duration;
5. verifies evidence IDs lie inside the candidate range;
6. rejects duplicate evidence and unsupported signal enums;
7. checks evidence notes/rationale for forbidden guaranteed-performance claims;
8. rejects titles/hooks presented as quotes unless they match transcript text;
9. computes pairwise overlap and deduplicates near-identical candidates;
10. checks source distribution where alternatives exist;
11. assigns IDs/ranks and records a content-free reconciliation rule trail.

Allowed deterministic repair is limited to trimming surrounding whitespace and
deduplicating identical enum/list entries. It may not invent a word, move a
boundary, rewrite a rationale, choose speaker framing, or make another model
call.

Return the strongest one to four valid candidates in rank order. Three is the
target, not a minimum; one or two valid candidates remain an honest reduced
set. When none survive reconciliation, produce `no-strong-candidates` without
offering manual range. Never pad with hallucinated or duplicated candidates.

### 12.7 Candidate fake

The deterministic fake uses transcript fixture revision as its key and returns
source-controlled provider-shaped proposals that still pass through the same
Zod and reconciliation path. Include variants for:

- three valid distinct candidates;
- one valid candidate and four valid candidates for public cardinality bounds;
- two duplicates requiring deterministic rejection;
- missing word ID;
- reversed boundary;
- invented quote/factual title;
- virality promise;
- prompt injection embedded in transcript;
- no strong candidates;
- refusal, timeout, and malformed schema.

Tests assert one user analysis action creates at most one fake call.

### 12.8 Active-speaker processor

Active-speaker detection is a local media capability, not an LLM decision and
not a user-facing crop preset.

```ts
interface ActiveSpeakerProcessor {
  analyze(
    input: {
      videoPath: string;
      audioPath: string;
      selectedRange: TimeRangeMs;
      shotBoundaries: ShotSegmentV1[];
      maxFacesPerShot: number;
    },
    context: LocalProcessContext
  ): Promise<SpeakerFocusTrackV1>;
}
```

The first implementation spike uses Light-ASD with pinned pretrained weights.
TalkNet is a comparison baseline only if Light-ASD misses the acceptance target
on the purpose-recorded sample or cannot meet the measured CPU deadline. The
processor:

- runs as a pinned Python/PyTorch subprocess with JSON over stdin/stdout and no
  shell;
- detects/tracks at most four visible faces per shot and resets tracking at
  PySceneDetect boundaries;
- combines visible mouth motion with the synchronized audio instead of trying
  to map diarization labels to faces;
- returns time ranges, face-track IDs, normalized face boxes, speaking
  probabilities, and the selected focal point—not names or identities;
- applies deterministic hysteresis, minimum-hold, and maximum crop-velocity
  rules after inference so normal listener motion does not steal focus;
- pins and verifies the weights hash and records the model/code license notice;
- stores no face embeddings and deletes frame crops with the job workspace.

The spike must benchmark one-face, wide two-person, and already-edited
multi-shot sequences from the exact demo sample on the intended Cloud Run CPU.
Published benchmark claims are evidence that the tool is plausible, not proof
that this deployment meets the demo target.

The deterministic fake returns source-controlled shot, face, score, and focus
tracks. It powers sample mode and tests without pretending to have analyzed an
arbitrary uploaded video.

### 12.9 Visual planner port

```ts
interface VisualPlanner {
  plan(
    input: {
      transcriptWindow: TranscriptBundleV1;
      selectedRange: TimeRangeMs;
      speakerTurns: SpeakerTurnV1[];
      durationMs: number;
      maxCues: 3;
      artDirection: "precision-cut-v1";
    },
    context: ProviderCallContext
  ): Promise<VisualPlanProviderOutputV1>;
}
```

The request uses the Responses API, strict Structured Outputs, `store: false`,
and the same configured text model as candidate selection unless an owner
decision changes it. It receives transcript words with stable IDs—not the video
file—and may return only:

- zero to three cues grounded to an exact mentioned phrase and word IDs;
- an allow-listed cue type: `full-frame-image`, `transparent-overlay`, or
  `equation-card`;
- a short factual asset brief, cue purpose, layout enum, and requested duration;
- literal equation/card content copied from or safely derived from the bounded
  transcript context.

It cannot return URLs, HTML, CSS, FFmpeg expressions, a person's identity,
artist/style imitation, a brand/logo request, a new factual claim, or arbitrary
text to show as though the speaker said it.

The planner is subject-agnostic. Earth/Moon/equation cues belong only to the
purpose-recorded fixture; production plans derive concepts from the current
selected transcript and must not inject those fixture subjects into unrelated
clips.

Deterministic reconciliation resolves word IDs, derives cue times, enforces the
visual-density rules, prevents overlap, keeps the opening human beat, checks
caption/face safe zones, and rejects ungrounded or unsafe briefs. It never adds
a replacement cue or makes a repair call. Zero valid cues is a valid result.

The visual-planner fake maps transcript fixture revision to an exact visual
plan, including the Earth, Moon, and equation beats in the sample story.

### 12.10 Context image generator

```ts
interface ContextImageGenerator {
  generate(
    input: {
      assetId: string;
      factualBrief: string;
      layout: "full-frame" | "transparent-overlay";
      artDirection: "precision-cut-v1";
      background: "opaque" | "transparent";
    },
    context: ProviderCallContext
  ): Promise<GeneratedVisualAssetV1>;
}
```

The proposed live adapter uses the OpenAI Image API and
`gpt-image-2.5-flare`, subject to access, latency, quality, price, and policy
verification in the implementation ticket. The adapter generates only from a
server-compiled prompt that combines the validated factual brief with the
source-controlled art direction. It does not accept arbitrary user prompts,
URLs, uploaded reference images, or web-search results.

Full-frame assets use an approved portrait size supported by the current API;
transparent overlays use PNG or WebP with alpha. The adapter validates decoded
format, dimensions, byte size, alpha where required, and image count before
storage. A model response never enters an FFmpeg argument directly.

The deterministic fake returns purpose-created, source-controlled images keyed
by fixture asset ID. It does not silently stand in for live generation after a
provider error. Generated stills are the core visual proof; generative video,
stock search, and web scraping remain out of scope.

### 12.11 Deterministic equation and information-card renderer

`equation-card` cues bypass the image model. A server-side MathJax 4 component
converts a validated, length-bounded TeX subset to SVG. The renderer then:

- rejects external URLs, links, unsupported macros, scripts, and embedded
  foreign objects;
- sanitizes and validates the SVG;
- places it in a source-controlled card template with exact type, spacing,
  contrast, and safe-zone tokens;
- rasterizes to a pinned PNG/WebP asset with a local library such as `sharp`
  or `resvg` when the FFmpeg build does not provide stable SVG decoding;
- records the source expression and renderer revision in the assembly bundle.

This path exists because equations and concise labels must be exact. The demo
does not rely on an image model to spell mathematics correctly.

### 12.12 Storage, job, and abuse ports

`TemporaryStorage` owns object read/write/delete, generation preconditions,
resumable authorization, signed download, metadata, and atomic marker create.
Its fake stores bounded buffers/metadata in test memory and simulates generation
conflicts and partial deletion.

`MediaJobRunner` owns start/status/cancel for the single job definition. Its
fake advances through source-controlled stage sequences via fake clock and
never spawns a process.

`AbuseVerifier` validates one action-bound token with expected hostname/action.
Its fake succeeds/fails deterministically. Tests never contact Turnstile.

## 13. Media analysis, assembly, and render pipeline

### 13.1 Process execution safety

Call `ffprobe`, FFmpeg, and the pinned active-speaker Python entry point with an
executable path plus an argument array using a direct child process API. Never
construct or invoke a shell string. Exchange active-speaker input/output as
bounded, schema-validated JSON over pipes or job-local files. All paths are
generated inside a job-owned temporary directory; no user/model text enters a
path or argument except through source-controlled enum compilation.

For every subprocess:

- pin binary/version in the container image and record it in release evidence;
- set explicit deadline and kill escalation;
- capture bounded stderr bytes for classification, then discard/redact;
- do not log the full command when it contains private paths;
- handle abort, exit code, signal, timeout, and output-size breach;
- close streams and delete the temporary workspace in `finally`;
- prevent network access from FFmpeg protocols not required by local files;
- never enable arbitrary concat lists, external subtitles, or remote protocols.

### 13.2 Media inspection

`ffprobe` returns JSON for format and streams. Parse it as untrusted data with a
backend-owned schema. Reject unexpected structure, NaN/infinite durations,
unbounded stream arrays, missing duration, and unsupported codec combinations.

Normalize rotation metadata, rational frame rate, duration, width/height,
stream counts, and codecs into `MediaDescriptor`. Do not pass raw probe output
to the browser or store it beyond job diagnostics.

### 13.3 Analysis audio extraction

Extract one job-local mono speech file:

- PCM or provider-recommended lossless/efficient format chosen in the provider
  ticket after measuring payload and compatibility;
- 16 kHz or approved provider-native speech sample rate;
- one mono channel;
- source duration only, no silence padding beyond deterministic seek tolerance;
- bounded file size checked after extraction;
- no normalization that materially alters speech recognition unless measured;
- removed before job exit in success, failure, timeout, and cancellation.

If extraction finds no usable audio, return `MISSING_AUDIO` and do not call the
transcription provider.

### 13.4 Analysis job stages

The analysis job progresses monotonically:

1. `analysis.reading-descriptor`;
2. `analysis.inspecting-media` when no valid descriptor exists;
3. `analysis.extracting-audio`;
4. `analysis.transcribing` or `analysis.reusing-transcript`;
5. `analysis.normalizing-transcript`;
6. `analysis.selecting-candidates`;
7. `analysis.reconciling-candidates`;
8. `analysis.writing-result`;
9. `analysis.complete`.

Progress writes are content-free and generation-guarded. Failure records stage,
safe category, retry evidence, and usage counts—not content.

### 13.5 Assembly job stages

The core first-cut assembly is a separate bounded operation over the chosen
10–60 second range:

1. `assembly.reading-selected-range`;
2. `assembly.downloading-source-window`;
3. `assembly.detecting-shots`;
4. `assembly.tracking-faces`;
5. `assembly.detecting-active-speaker`;
6. `assembly.smoothing-speaker-focus`;
7. `assembly.planning-visuals`;
8. `assembly.reconciling-visual-plan`;
9. `assembly.creating-visual-assets`;
10. `assembly.compiling-preview-bundle`;
11. `assembly.writing-result`;
12. `assembly.complete`.

The visual-planning call happens only after one candidate is chosen.
Only reconciled cues reserve an image call, and equation/card cues stay local.
Independent image assets may be generated concurrently within the per-session
and global image-call caps. The job writes the assembly bundle only after every
referenced track and asset passes validation; partial results are not exposed as
a valid clip-review state.

### 13.6 Browser preview

Preview uses the original source object through a short-lived, session-owned
playback authorization or approved same-origin range proxy that does not buffer
the whole media in the application service. The implementation spike chooses
the approach that preserves private range requests and browser seeking.

The preview composes:

- the time-varying speaker-focus crop inside a 9:16 viewport;
- full-frame visual cutaways or bounded visual overlays from assembly assets;
- HTML/canvas caption layer from deterministic caption groups, always above
  podcast footage and visual assets;
- playback-range controller that pauses at the manifest end;

Preview authorization is memory-only, short-lived, referrer-protected, and
renewed on explicit playback/restoration. If CORS/range behavior makes a direct
GCS URL unsuitable, use a dedicated authenticated media delivery route or
Cloud CDN design only after an architecture update; do not make the bucket
public.

### 13.7 AI-directed speaker framing pipeline

The selected clip—not the whole upload—passes through this bounded pipeline:

1. PySceneDetect marks hard/fast shot changes so tracks do not leak across an
   existing podcast camera cut.
2. A pinned face detector finds at most four faces per shot; a lightweight
   tracker creates stable shot-local face tracks.
3. Light-ASD scores which visible face is producing the synchronized audio.
4. Deterministic post-processing turns noisy frame scores into a
   `SpeakerFocusTrackV1`: enter/exit thresholds, minimum confidence duration,
   minimum focus hold, and cut-aware resets are all source-controlled.
5. The crop compiler converts each focus segment into a smooth 9:16 camera
   path, respecting face headroom and caption/visual safe zones.

This directly handles both common source shapes:

- if the podcast already cuts to a speaker close-up, the shot boundary resets
  tracking and the visible speaking face remains naturally centered;
- if one wide camera shows both people, audio-visual detection chooses the face
  actually speaking and the vertical crop follows that person.

No public left/right/center choice exists. The purpose-recorded demo source is
constructed so the core model succeeds. Low-confidence internal behavior is a
deterministic held crop for temporal stability, not a product workflow or a
manual fallback UI.

### 13.8 Speaker-focus crop compiler

Input is normalized source dimensions/rotation plus the validated shot and
speaker-focus tracks. Output is a deterministic FFmpeg crop/scale/pad plan
assembled from numeric values, never model strings.

Target canvas: 1080 × 1920, square pixels.

Rules:

1. Apply source rotation before interpreting normalized boxes.
2. Compute a 9:16 crop around the chosen face center with source-controlled
   headroom and clamp it to the source bounds.
3. Interpolate within a stable face track but reset immediately at hard cuts.
4. Bound pan speed and acceleration; do not oscillate on frame-level score
   changes.
5. Hold framing through very short pauses so conversational breaths do not look
   like camera cuts.
6. Scale with a pinned high-quality algorithm and pad exactly to 1080 × 1920
   only when the source geometry cannot fill the target safely.
7. Enforce even dimensions and `setsar=1`.

The compiler is deterministic given the same focus track. It does not run face
detection, infer identity, inspect diarization labels, or choose a speaker.

### 13.9 ASS caption compiler

Generate the ASS file inside the job workspace from immutable normalized words
and the single source-controlled `clean-emphasis` profile.

- Escape ASS control characters and braces.
- Strip/replace forbidden newlines and override sequences.
- Use bundled, licensed fonts only; no system/font path from input.
- Resolve caption group start/end from word timings.
- Keep line breaks deterministic and safe-zone bounded.
- Avoid karaoke/flashing effects; active-word emphasis may use a restrained
  source-controlled color/weight change.
- If Arabic/multilingual support is later approved, shaping and bidi rendering
  must be validated with the exact FFmpeg/libass/font stack.

### 13.10 Contextual visual asset and timeline compiler

Every visual cue references one validated assembly asset and one closed layout
enum. The compiler creates a layer plan:

- `full-frame-image`: the still temporarily becomes the full 1080 × 1920 video
  layer while the original podcast audio continues; an optional fixed slow-push
  motion preset may be used;
- `transparent-overlay`: the podcast remains visible and the alpha image is
  placed in a fixed face- and caption-safe region;
- `equation-card`: the exact locally rendered card is placed below or beside
  the face according to the shot geometry, never on top of the captions.

FFmpeg may use pinned `overlay`, timeline `enable`, `zoompan`, and transition
filters compiled from numeric cue times. Captions are composited last so they
remain legible over podcast footage, Earth/Moon imagery, and equation cards.
The compiler rejects missing assets, overlapping cues,
unsafe placement, cue times outside the clip, and coverage above the duration
band's maximum.

No arbitrary drawtext expression, model-produced SVG, remote image, URL, user
stylesheet, or provider prompt enters FFmpeg. All stills are decoded and
validated before compilation.

### 13.11 Audio policy

`speech-safe` normalization uses a pinned, conservative loudness filter preset
recorded in renderer tests. It must:

- avoid clipping;
- preserve intelligibility;
- not promise mastering compliance;
- apply one fixed target/tolerance after measured fixture QA;
- use a simple fallback when loudness analysis is invalid;
- never mix external music or generated audio.

Exact LUFS/true-peak values are an implementation-ticket measurement decision
because the source fixtures and FFmpeg build determine acceptable results. The
chosen values must be promoted into `docs/operations/RENDER_PROFILE.md` and
golden tests before release.

### 13.12 Deterministic render profile

Required output:

- container: MP4;
- video: H.264, `yuv420p`, 1080 × 1920, square pixels, constant 30 fps unless a
  tested source-preserving policy is explicitly approved;
- quality: pinned encoder preset and CRF selected by measured quality/latency;
- audio: AAC-LC, 48 kHz, mono or stereo according to the pinned profile;
- fast-start metadata for web playback;
- no source filename/title/comment/author metadata;
- duration within ±100 ms or one output frame plus encoder tolerance of the
  resolved manifest range, whichever is greater;
- maximum public output bytes 200 MiB;
- sanitized constant output filename.

Proposed initial profile for measurement: `libx264`, preset `medium`, CRF 20,
30 fps, AAC 160 kbps, `-movflags +faststart`. This is a provisional technical
recommendation, not a quality claim; the render ticket must benchmark it before
locking operations documentation.

### 13.13 Render compiler

The compiler receives only:

- local input/output paths created by `TempWorkspace`;
- validated media descriptor;
- validated transcript and caption groups;
- validated shot and speaker-focus tracks;
- validated visual plan and job-local visual assets;
- canonical manifest;
- source-controlled render profile/tokens.

It returns an argument array plus a content-free render-plan summary. Unit tests
golden-file the logical plan and normalized args with temporary path placeholders.

The compiler does not read environment variables, storage, HTTP requests, or
provider SDKs. It cannot execute FFmpeg itself.

### 13.14 Render output validation

After FFmpeg succeeds, `ffprobe` and bounded frame/audio checks prove:

- one H.264 video and one AAC audio stream;
- 1080 × 1920 display, square pixels, expected frame rate;
- finite expected duration and nonzero bytes under limit;
- decodable first, middle, and final sample frames;
- audio packets present across the clip where source speech exists;
- captions visible in sampled podcast, full-frame visual, and overlay frames;
- visual cues present only inside their validated intervals;
- no forbidden metadata or unexpected attachments;
- output object generation is new and bound to the render operation.

Only then is the file uploaded and the operation marked succeeded. Failed
validation deletes the output and returns `RENDER_OUTPUT_INVALID`.

### 13.15 Render job stages

1. `render.reading-descriptor`;
2. `render.validating-manifest`;
3. `render.downloading-source`;
4. `render.downloading-assembly-assets`;
5. `render.compiling-speaker-framing`;
6. `render.compiling-visual-layers`;
7. `render.compiling-captions`;
8. `render.compiling-plan`;
9. `render.encoding`;
10. `render.validating-output`;
11. `render.uploading-output`;
12. `render.complete`.

The job checks cancellation before/after every stage and terminates FFmpeg on
confirmed cancellation. Partial output never becomes downloadable.

## 14. Temporary storage and job lifecycle

### 14.1 Bucket configuration

One dedicated private bucket:

- uniform bucket-level access;
- public access prevention enforced;
- one approved region matching Cloud Run where possible;
- Standard storage class;
- no Object Versioning;
- no retention lock;
- soft delete disabled only after confirming organization policy and documenting
  the privacy/recovery tradeoff;
- lifecycle deletion for all session/operation prefixes at the earliest reliable
  one-day age/custom-time rule;
- an explicit lifecycle exclusion for the versioned `samples/` prefix;
- CORS limited to the exact production origin and required resumable/range
  methods/headers;
- no browser list permission;
- server/job service accounts receive only the narrow object permissions needed;
- access logs/telemetry configured without storing signed query strings.

Lifecycle actions are asynchronous. Public copy says access expires at the
session deadline, Clear attempts immediate deletion, and remaining temporary
objects are scheduled for deletion by the lifecycle backstop. It does not
promise deletion at a precise second.

### 14.2 Object metadata

Custom metadata is content-free and allow-listed:

- schema/object-class version;
- opaque session/operation ID or its keyed hash;
- created/expiry timestamps;
- generation/hash needed for integrity;
- content type and byte count;
- renderer/fixture revision where applicable.

Never store filename, title, transcript excerpt, speaker, IP, user
agent, provider request ID, or signed URL in metadata.

### 14.3 Versioned sample asset

The sample object is uploaded only by the owner/deployer after the rights gate.
Its release record includes source/provenance, license/consent reference,
duration, codec, bytes, SHA-256, object generation, poster, transcript fixture
revision, candidate fixture revision, speaker-focus fixture revision, visual
plan revision, and the rights/provenance of every precomputed visual asset. It
has no public ACL and no user metadata. A new sample uses a new versioned path;
rollback re-points config to a previous recorded generation. Deleting or
replacing a sample is an explicit release operation, never session cleanup.

Sample playback and render may incur storage/network/job cost but make no
transcription, active-speaker, text-model, or image-model call. Precomputed
analysis and assembly remain visibly the sample path; they must not be
represented as live AI work performed for that visitor.

### 14.4 Analysis result retention tradeoff

Refresh-safe selection, preview, and rendering require the normalized transcript
and candidates after the analysis job finishes. The recommended demo stores:

- normalized transcript only, not raw provider response;
- reconciled candidates and content-safe warnings;
- shot boundaries, short-lived face geometry, the derived speaker-focus track,
  and reconciled visual plan for the selected clip;
- validated generated/local visual assets referenced by that assembly only;
- immutable analysis and assembly revisions/hashes.

These private JSON objects share the source TTL and clear path. This is
**Proposed - owner approval required** because it is a material privacy choice.
If rejected, the alternative is browser-only analysis content with no truthful
cross-refresh recovery after browser loss; that limitation must replace the
current refresh requirements and public copy.

### 14.5 Access and deletion timeline

Proposed defaults:

```text
T+0          session created
T+0..2h      encrypted grant may access owned objects
on Clear     immediate best-effort cancel and explicit delete of all known objects
after 2h     access denied; signed capabilities cannot be renewed
at >=1 day   bucket lifecycle marks remaining temporary objects eligible
later        Cloud Storage completes asynchronous lifecycle deletion
```

The application should also delete superseded descriptors, partial outputs, and
invalid uploads immediately rather than waiting for lifecycle.

### 14.6 Cloud Run Job configuration

One job definition:

- task count: 1;
- parallelism: 1;
- max retries: 0 initially;
- execution timeout: 15 minutes public analysis/assembly/render profile, separately
  increased for owner 60-minute validation only after measurement;
- proposed resources: 2 vCPU, 4 GiB memory, 10 GiB ephemeral storage;
- dedicated least-privilege job service account;
- no public endpoint;
- one pinned immutable image digest/commit SHA;
- source-controlled `analyze`, `assemble`, and `render` entry arguments only;
- secrets limited by mode where platform configuration permits;
- outbound network only as required for selected providers/storage.

The API sets per-operation deadlines shorter than platform maximums and exposes
timeout as a safe failure. Platform retries remain zero so a paid operation
cannot repeat invisibly.

### 14.7 Progress and terminal writes

Progress object updates use generation preconditions and include monotonically
increasing revision and stage ordinal. Terminal result/failure is written once
with create-only or expected-generation semantics. A later writer cannot
replace success with failure or revive a cancelled operation.

The API reconciles Cloud Run execution status with the terminal object:

- terminal object with valid result wins;
- completed execution without terminal result becomes `RESULT_NOT_FOUND`;
- failed execution with a safe failure object uses that category;
- vanished execution/objects after expiry becomes `expired`;
- conflicting evidence is `INTERNAL_ERROR` and blocks paid retry until audited.

### 14.8 Cleanup ownership

| Artifact/effect | Owner | Cleanup triggers |
| --- | --- | --- |
| Browser object URL | Feature that created it | File replace, stage exit, clear, unmount |
| Media event listeners/range timer | Preview controller | Source change, stage exit, clear, unmount |
| Fetch/poll controller | Request/poll hook | Superseding request, stage exit, clear, unmount |
| Resumable upload | Upload lifecycle | Success, cancel, clear, expiry |
| Job temp directory | `TempWorkspace` | Success, failure, abort, timeout, signal |
| Extracted audio/ASS/output partial | Media job | Before process exit in all paths |
| Frame crops/face-track intermediates | Media job | Before process exit in all paths |
| Assembly tracks/plan/generated assets | Clear use case + lifecycle | Invalid assembly, clear, expiry, supersession |
| Child process | Process runner | Abort, timeout, signal, job completion |
| Source/result/output objects | Clear use case + lifecycle | Invalid input, clear, expiry, supersession |
| Marker/lease objects | Security/job layer | Terminal action, clear, lease expiry, lifecycle |
| Signed capabilities | Issuer/browser memory | Expiry, action completion, clear, navigation |

## 15. Privacy, rights, safety, and security

### 15.1 Data inventory

| Data | Browser | API | Job/provider | Temporary storage | Logs |
| --- | --- | --- | --- | --- | --- |
| Local filename | Display memory only | Never sent | Never | Never | Never |
| Purpose-recorded sample | Short-lived playback capability | Version/generation only | Job reads for sample render; no AI provider | Private versioned release asset until owner removes | Version/hash/config ID only |
| Original video | Local file, then private playback capability | Metadata only; never buffered | Job-local copy; provider never receives video | Private source object until clear/lifecycle | Bytes/duration only |
| Extracted audio | Never | Never | Job temp; streamed to transcription provider | Not persisted by default | Minutes/bytes only |
| Raw transcription response | Never | Never | Adapter memory only | Never | Never |
| Normalized transcript | Active UI | Bounded response memory | Candidate model receives minimum compact form | Private result JSON if approved | Counts/language only |
| Candidate model prompt/output | Never raw | Adapter/use-case memory | OpenAI under approved settings | Never raw; reconciled candidates only | Token counts/config ID/outcome only |
| Shot/face analysis | Preview geometry only | Metadata only | Local job process only; no identity matching | Private bounded assembly JSON until clear/lifecycle | Track/segment counts only |
| Speaker-focus track | Active preview | Bounded response memory | Local job/render | Private assembly JSON until clear/lifecycle | Segment/confidence-bucket counts only |
| Visual-plan prompt/output | Never raw | Adapter/use-case memory | OpenAI receives selected transcript window | Reconciled cue plan only | Token/cue counts/config ID/outcome only |
| Generated visual prompt/asset | Active preview asset | Validated brief/metadata | OpenAI Image API receives server-compiled brief | Private asset until clear/lifecycle | Call count/bytes/config ID/outcome only |
| Equation/card expression/asset | Active preview asset | Validated bounded expression | Local renderer/job only | Private asset until clear/lifecycle | Type/bytes/renderer revision only |
| Automatic composition manifest | Read-only preview reference | Validation/confirmation memory | Render job only | Private assembly/render descriptor until clear/expiry | Counts/hash only |
| Rendered clip | Playback/download capability | Metadata only | Job local then upload | Private output until clear/lifecycle | Bytes/duration only |
| Grants/tokens/URLs | Cookie or memory as appropriate | Server memory/crypto | Minimum required capability | Secrets only in Secret Manager; no signed URLs | Redacted |
| Operational evidence | Safe request/status values | Safe structured metrics | Safe usage result | Content-free release record | Allow-list only |

### 15.2 Accurate privacy language

Approved style:

> This demo uses temporary private storage to process your video. The app has no
> user account or project database. Your video, normalized transcript,
> automatic composition manifest, assembly tracks, generated visual assets, and export remain
> available only for the disclosed temporary window or until you clear them.
> Transcription, text, and image providers process the minimum data needed under
> their own configured data policies.

Do not say “nothing is stored,” “no third party sees your data,” “zero
retention,” or “deleted instantly” unless every infrastructure/provider fact
actually supports it at release time.

OpenAI-specific live configuration must use the Responses API with
`store: false` and no conversation/previous-response state. Official OpenAI
documentation and the actual project data-control settings must be captured in
provider approval because API processing and abuse-monitoring/application-state
policies can change. Structured output remains untrusted and is locally
validated.

### 15.3 Rights and content rules

- Sample media must be synthetic, purpose-recorded, public-domain, or explicitly
  licensed for repository/deployment/portfolio redistribution.
- `MEDIA_RIGHTS_RECORD.md` records source, contributors, permission scope,
  attribution, music/visual assets, license copy/location, and approval date.
- Upload disclosure requires rights/permission for video, voices, music,
  graphics, and export.
- Do not accept remote platform URLs or help bypass access controls.
- Do not claim export grants publication or commercial rights.
- Do not include copyrighted music in fixtures without redistribution rights.
- Generated visuals may not request a living artist's style, copyrighted
  character, real-person likeness, trademark/logo, or misleading documentary
  evidence. Use neutral source-controlled editorial art direction.
- Do not scrape/search the web for images. Every non-generated visual must have
  a recorded source and redistribution license; the first demo uses only
  generated stills and locally rendered cards.
- The demo is not intended for private, confidential, medical, legal, financial,
  child, biometric, or highly sensitive recordings. Public copy should advise
  against uploading sensitive content.
- If illegal or abusive content handling becomes a launch requirement, define a
  separate moderation/legal policy; do not invent silent scanning claims.

### 15.4 Sensitive inference prohibitions

The system must not infer or label:

- real identity from face/voice;
- race, ethnicity, nationality, religion, sex life, sexual orientation, gender
  identity, disability, health, political belief, or other protected/sensitive
  traits;
- personality, trustworthiness, criminality, mental state, or emotion from face
  or voice;
- age beyond what the speaker explicitly says and the task genuinely needs;
- audience value or performance based on a person's appearance or voice.

Face detection and active-speaker processing return geometry, time ranges, and
speech probabilities only for shot-local crop placement. They do not identify
people, retain embeddings, compare a person across uploads, or label protected
traits. Frame crops are job-local; bounded geometry/focus tracks expire with the
temporary assembly lifecycle.

### 15.5 Web/API controls

- strict request, response, provider-output, job, object, and persistence
  schemas;
- request/body/field/array/decompression/output/time bounds;
- same-origin browser calls and private service-to-service authentication;
- `Origin` and Fetch Metadata checks on mutations;
- HttpOnly encrypted session cookie with host prefix and key rotation;
- explicit CSP without unsafe script/eval in production;
- HSTS, `nosniff`, restrictive referrer and permissions policies;
- no user HTML; text rendered as text, not provider markup;
- object-specific signed/resumable capabilities, never bucket credentials;
- generation preconditions for writes/deletes and atomic action markers;
- least-privilege service accounts and Secret Manager access;
- dependency audit, secret scan, container scan, and pinned major dependencies;
- explicit abort/deadline and no hidden provider retries;
- no analytics/session replay script that could capture transcript or video;
- no content in URLs, query strings, exception reporting, or metric labels.

### 15.6 Content Security Policy direction

The production CSP should start from:

- `default-src 'self'`;
- scripts from self with framework-compatible nonce/hash strategy;
- styles from self, with any framework exception explicitly reviewed;
- media from self plus the exact approved signed-object origin;
- connect to self plus the exact approved resumable/object origin and Turnstile
  endpoints where required;
- images/fonts from self/data only as needed;
- `frame-src` only for Turnstile;
- `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, and restricted
  form actions.

Final directives depend on the chosen upload/preview mechanism and must be
tested in report-only mode before enforcement. Do not broadly allow `*` to make
signed media work.

### 15.7 Logging allow-list

Allowed structured fields:

- UTC timestamp, service, environment, level;
- request ID, route template, method, status, duration;
- source-controlled operation kind/stage and safe error/rule code;
- feature/config revision and fake/live mode;
- provider/model config ID, never provider request payload/ID if it could aid
  cross-system correlation;
- aggregate bytes, duration, word/token counts, job seconds;
- rate/capacity/budget decision category;
- content-free deployment revision.

Forbidden:

- request/response bodies or framework request objects;
- authorization/cookie/Turnstile/provider tokens;
- raw IP, user agent, fingerprint, or stable person identifier;
- filename, object key, signed/resumable URL;
- transcript, caption, title, instruction, prompt, rationale;
- provider raw response/error;
- local/temp paths or full FFmpeg command;
- video/audio/image frames;
- secrets or environment dump.

Logging helpers accept a typed allow-listed event; they do not accept arbitrary
objects. Tests scan serialized logs for sentinel secrets/content.

### 15.8 Rate, abuse, and capacity limitations

Anonymous rate controls are best-effort. Without durable identity/database,
the demo cannot enforce a reliable per-person monthly quota. Controls include:

- Turnstile on upload authorization, analysis, first-cut assembly, and render;
- action-bound tokens and short validity;
- session action counters and atomic markers;
- privacy-preserving short-window source/IP-derived keyed hash only if legally
  and operationally approved, never logged raw;
- route-global and per-instance admission;
- one active analysis/assembly per source and one active render globally;
- Cloud Run max instances and job tasks capped;
- provider project rate/spend limits;
- paid kill switches and cloud budgets/alerts.

Do not overclaim bot prevention or durable quotas. If abuse exceeds these
controls, disable public live upload/render and keep the sample path available.

## 16. Configuration and environment schema

### 16.1 Configuration rules

- Parse configuration once with a strict server-owned schema before the process
  accepts traffic or starts a job.
- Unknown production variables with the project prefix may warn/fail according
  to documented policy; required variables fail closed.
- Committed defaults are `fake` and paid-disabled.
- Tests set all relevant variables explicitly before importing composition and
  never load `.env`, `.env.local`, shell profiles, or Secret Manager.
- Browser code receives only `GET /v1/config` values. Provider/cloud secrets and
  private URLs never use `NEXT_PUBLIC_*`.
- Credentials stay blank in `.env.example`; comments describe where the owner
  obtains and stores them.
- A live mode variable alone cannot enable spend; all required kill switches,
  valid credentials, admission settings, and owner configuration must agree.

### 16.2 Root/frontend variables

| Variable | Example/default | Required | Secret | Rule |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | `development` | Yes | No | `development`, `test`, `production` |
| `APP_ENV` | `local` | Yes | No | `local`, `preview`, `production` |
| `APP_REVISION` | blank locally | Production | No | Exact Git SHA/image label |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | Yes | No | Exact origin, no path/wildcard |
| `BACKEND_ORIGIN` | `http://localhost:4000` | Frontend server | No/private | Server-only private API origin |
| `BACKEND_AUDIENCE` | blank | Cloud Run | No/private | Service auth audience |
| `PORT` | platform/local value | Runtime | No | 1–65535 |

Frontend runtime must not expose backend origin to browser JavaScript. The
same-origin proxy forwards method/body and only allow-listed headers, attaches
service identity, preserves safe response headers, and never logs bodies.

### 16.3 Feature and paid-operation variables

| Variable | Committed default | Rule |
| --- | --- | --- |
| `PROVIDER_MODE` | `fake` | `fake` or `live` |
| `PAID_DEMO_ENABLED` | `false` | Master fail-closed switch |
| `LIVE_UPLOAD_ENABLED` | `false` | Requires storage/abuse config and product approval |
| `LIVE_ANALYSIS_ENABLED` | `false` | Requires paid master, providers, and spend gate |
| `LIVE_ASSEMBLY_ENABLED` | `false` | Requires active-speaker benchmark, visual providers, and spend gate |
| `LIVE_IMAGE_GENERATION_ENABLED` | `false` | Requires live assembly plus image policy/cost approval |
| `LIVE_RENDER_ENABLED` | `false` | Requires paid master/job/capacity config |
| `ACTIVE_SPEAKER_ENABLED` | `true` | Core assembly behavior; live assembly still fails closed behind its own gate |
| `TREND_SIGNALS_ENABLED` | `false` | Requires product approval |
| `PUBLIC_LANGUAGE_PROFILE` | `en` | Only declared tested profile |
| `LIMIT_PROFILE` | `public` | `public` or owner-only `validation` |

Production startup fails if `PROVIDER_MODE=live` and paid operations appear
enabled without explicit `PAID_DEMO_ENABLED=true`. `test` rejects live mode.

### 16.4 Session/security variables

| Variable | Default/example | Required | Secret | Rule |
| --- | --- | --- | --- | --- |
| `SESSION_COOKIE_NAME` | `__Host-clipping_session` | Yes | No | Fixed in production |
| `SESSION_ACCESS_TTL_SECONDS` | `7200` | Yes | No | 900–7200 public |
| `PROCESSING_GRANT_ACTIVE_KEY_ID` | blank | Live | No | Version label only |
| `PROCESSING_GRANT_KEYS_JSON` | blank | Live | Yes | Key-id to base64 256-bit keys; Secret Manager |
| `CSRF_ALLOWED_ORIGINS` | local origin | Yes | No | Exact comma-separated origins, no wildcard |
| `IDEMPOTENCY_TTL_SECONDS` | `86400` | Yes | No | At least session/object window |
| `TURNSTILE_SITE_KEY` | blank | Live browser config | No | Public site key only |
| `TURNSTILE_SECRET_KEY` | blank | Live | Yes | Secret Manager |
| `TURNSTILE_EXPECTED_HOSTNAME` | blank | Production | No | Exact host |
| `TURNSTILE_TIMEOUT_MS` | `5000` | Yes | No | 1,000–10,000 |

Do not use one symmetric key forever. Rotation supports active plus previous
decrypt-only key during a bounded window shorter than maximum session life.

### 16.5 Storage/job variables

| Variable | Default/example | Required | Secret | Rule |
| --- | --- | --- | --- | --- |
| `GCP_PROJECT_ID` | blank | Live | No/private | Exact project |
| `GCP_REGION` | blank | Live | No/private | Approved single region |
| `TEMP_MEDIA_BUCKET` | blank | Live | No/private | Dedicated private bucket |
| `SAMPLE_MEDIA_OBJECT` | blank | Deployed sample | No/private | Versioned `samples/` object path from release record |
| `SAMPLE_MEDIA_GENERATION` | blank | Deployed sample | No/private | Exact immutable object generation |
| `SAMPLE_MEDIA_SHA256` | blank | Deployed sample | No/private | Integrity value from rights/release record |
| `MEDIA_JOB_NAME` | blank | Live | No/private | One job definition |
| `MEDIA_JOB_SERVICE_ACCOUNT` | blank | Deploy ops | No/private | Least privilege |
| `UPLOAD_AUTH_TTL_SECONDS` | `900` | Yes | No | 300–900 |
| `DOWNLOAD_AUTH_TTL_SECONDS` | `300` | Yes | No | 60–300 |
| `OBJECT_LIFECYCLE_DAYS` | `1` | Yes | No | Must match bucket policy evidence |
| `JOB_ANALYSIS_TIMEOUT_SECONDS` | `900` | Yes | No | Profile bounded |
| `JOB_ASSEMBLY_TIMEOUT_SECONDS` | `900` | Yes | No | Includes ASD and bounded visual generation |
| `JOB_RENDER_TIMEOUT_SECONDS` | `900` | Yes | No | Profile bounded |
| `JOB_CPU` | `2` | Deploy ops | No | Evidence-recorded |
| `JOB_MEMORY_MIB` | `4096` | Deploy ops | No | Evidence-recorded |
| `JOB_EPHEMERAL_STORAGE_MIB` | `10240` | Deploy ops | No | Evidence-recorded |
| `FFMPEG_PATH` | `/usr/local/bin/ffmpeg` | Job | No | Absolute source-controlled container path |
| `FFPROBE_PATH` | `/usr/local/bin/ffprobe` | Job | No | Same |
| `FONT_DIR` | `/app/fonts` | Job | No | Bundled licensed fonts only |
| `PYTHON_PATH` | `/opt/venv/bin/python` | Job | No | Absolute pinned environment path |
| `ACTIVE_SPEAKER_ENTRYPOINT` | `/app/vision/active_speaker.py` | Job | No | Source-controlled file only |
| `ACTIVE_SPEAKER_MODEL` | `light-asd` | Job | No | Closed enum; TalkNet comparison is spike-only |
| `ACTIVE_SPEAKER_WEIGHTS_PATH` | `/app/models/light-asd/model.pth` | Live assembly | No | Image-bundled/read-only path |
| `ACTIVE_SPEAKER_WEIGHTS_SHA256` | blank | Live assembly | No | Required exact release hash |
| `ACTIVE_SPEAKER_TIMEOUT_MS` | `240000` | Yes | No | Measured public ceiling |
| `SCENE_DETECT_PROFILE` | `podcast-cuts-v1` | Yes | No | Source-controlled threshold set |

Application Default Credentials/service identity provide cloud access; no GCP
service-account JSON key belongs in env or Git.

### 16.6 OpenAI variables

| Variable | Committed example | Required | Secret | Rule |
| --- | --- | --- | --- | --- |
| `OPENAI_API_KEY` | blank | Live candidate/visual planning | Yes | Secret Manager; tests must reject presence/use |
| `OPENAI_CLIP_MODEL` | `gpt-6-sol` | Live | No | Approved exact model ID |
| `OPENAI_VISUAL_MODEL` | `gpt-6-sol` | Live assembly | No | Structured visual-plan output |
| `OPENAI_IMAGE_MODEL` | `gpt-image-2.5-flare` | Live image generation | No | Proposed; re-check exact ID/access |
| `OPENAI_IMAGE_QUALITY` | `medium` | Live image generation | No | Closed tested enum |
| `OPENAI_REASONING_EFFORT` | `low` | Live | No | Allowed model value; measure quality/cost |
| `OPENAI_TIMEOUT_MS` | `60000` | Yes | No | 5,000–120,000 |
| `OPENAI_MAX_OUTPUT_TOKENS_CLIP` | `3000` | Yes | No | Schema-sized bound |
| `OPENAI_MAX_OUTPUT_TOKENS_VISUAL` | `1800` | Yes | No | Schema-sized bound |
| `OPENAI_IMAGE_TIMEOUT_MS` | `120000` | Yes | No | One generated still; no retry |
| `OPENAI_IMAGE_MAX_CALLS` | `3` | Yes | No | Hard per-assembly ceiling |
| `OPENAI_STORE` | `false` | Yes | No | Must parse only literal false in production |
| `OPENAI_SDK_MAX_RETRIES` | `0` | Yes | No | Must be zero for demo |

As of the research baseline, official OpenAI documentation lists `gpt-6-sol`
for the Responses API with Structured Outputs support, and documents
`store: false` to disable response storage. Re-check the exact model page,
Structured Outputs schema rules, API data controls, and project settings before
live enablement. Do not infer zero retention from `store: false`.

### 16.7 Deepgram variables

| Variable | Committed example | Required | Secret | Rule |
| --- | --- | --- | --- | --- |
| `DEEPGRAM_API_KEY` | blank | Live analysis | Yes | Secret Manager |
| `DEEPGRAM_MODEL` | `nova-3` | Live | No | Approved exact model/config |
| `DEEPGRAM_LANGUAGE` | `en` | Live | No | Matches public promise |
| `DEEPGRAM_DIARIZE` | `true` | Live | No | Boolean |
| `DEEPGRAM_TIMEOUT_MS` | `360000` | Yes | No | Profile/SDK bounded |
| `DEEPGRAM_SDK_MAX_RETRIES` | `0` | Yes | No | Must be zero |

Provider retention/model-improvement settings cannot be proven by environment
variables alone. The owner records dashboard/project configuration evidence in
`PROVIDER_SETUP.md` without account IDs, tokens, or content.

### 16.8 Limits/admission variables

| Variable | Public default | Rule |
| --- | ---: | --- |
| `MAX_SOURCE_BYTES` | `524288000` | Cannot exceed compiled ceiling |
| `MAX_SOURCE_SECONDS` | `1200` | Cannot exceed compiled ceiling |
| `MAX_CLIP_SECONDS` | `60` | Locked 10–60 second demo range |
| `MAX_FACE_TRACKS_PER_SHOT` | `4` | Bounds local ASD work |
| `MAX_VISUAL_CUES_PER_CLIP` | `3` | Includes generated and deterministic cues |
| `MAX_IMAGE_CALLS_PER_ASSEMBLY` | `3` | Cannot exceed visual cue cap |
| `MAX_VISUAL_COVERAGE_PERCENT` | `45` | Lower duration bands use stricter compiled rules |
| `MAX_RENDER_ATTEMPTS_PER_SESSION` | `1` | 0–1 public |
| `MAX_CONCURRENT_ANALYSES` | `1` | 0–1 public instance |
| `MAX_CONCURRENT_ASSEMBLIES` | `1` | 0–1 public instance |
| `MAX_CONCURRENT_RENDERS` | `1` | Exactly 1 when enabled |
| `API_MAX_INSTANCES` | `1` | Deployment-enforced too |
| `FRONTEND_MAX_INSTANCES` | `2` | Small public cap |
| `RATE_WINDOW_SECONDS` | `300` | Documented short-window only |
| `RATE_UPLOAD_AUTH_MAX` | `3` | Per approved source/session key |
| `RATE_ANALYSIS_MAX` | `1` | Before manual retry allowance |
| `RATE_ASSEMBLY_MAX` | `1` | One first-cut build per selected range |
| `RATE_RENDER_MAX` | `1` | Mirrors public allowance |

Runtime config may lower limits without code change. It may not raise them above
compiled/tested ceilings.

### 16.9 `.env.example` shape

The eventual file lists every variable with credentials blank:

```dotenv
NODE_ENV=development
APP_ENV=local
APP_REVISION=
FRONTEND_ORIGIN=http://localhost:3000
BACKEND_ORIGIN=http://localhost:4000

PROVIDER_MODE=fake
PAID_DEMO_ENABLED=false
LIVE_UPLOAD_ENABLED=false
LIVE_ANALYSIS_ENABLED=false
LIVE_ASSEMBLY_ENABLED=false
LIVE_IMAGE_GENERATION_ENABLED=false
LIVE_RENDER_ENABLED=false
ACTIVE_SPEAKER_ENABLED=true
TREND_SIGNALS_ENABLED=false
PUBLIC_LANGUAGE_PROFILE=en
LIMIT_PROFILE=public

PROCESSING_GRANT_ACTIVE_KEY_ID=
PROCESSING_GRANT_KEYS_JSON=
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
TURNSTILE_EXPECTED_HOSTNAME=

GCP_PROJECT_ID=
GCP_REGION=
TEMP_MEDIA_BUCKET=
MEDIA_JOB_NAME=

OPENAI_API_KEY=
OPENAI_CLIP_MODEL=gpt-6-sol
OPENAI_VISUAL_MODEL=gpt-6-sol
OPENAI_IMAGE_MODEL=gpt-image-2.5-flare
OPENAI_IMAGE_QUALITY=medium
OPENAI_STORE=false
OPENAI_SDK_MAX_RETRIES=0

DEEPGRAM_API_KEY=
DEEPGRAM_MODEL=nova-3
DEEPGRAM_LANGUAGE=en
DEEPGRAM_DIARIZE=true
DEEPGRAM_SDK_MAX_RETRIES=0
```

The real file must also include documented nonsecret timeout/limit defaults.
Never paste working credential examples into documentation.

## 17. Paid operations, timeouts, retries, concurrency, and spend

### 17.1 Operation budget per user action

| User action | Maximum external operations | Automatic retries |
| --- | --- | --- |
| Start sample | Fixture/storage read only | Safe metadata read retry only |
| Authorize upload | One Turnstile verify + one resumable authorization | None after capability issuance |
| Complete upload | Metadata checks + one inspection job | None; idempotent replay returns same job |
| Find moments | One Turnstile + one transcription + one OpenAI candidate call | Zero provider/job retries |
| Retry after candidate failure with valid transcript | One Turnstile + one OpenAI candidate call | Zero |
| Build selected clip | One Turnstile + one local active-speaker pass + one OpenAI visual-plan call + zero to three OpenAI image calls + local equation/card renders | Zero provider/job retries |
| Render | One Turnstile + one render job | Cloud Run task retries zero |
| Retry render | One new render job only when allowance/evidence permits | Zero |
| Download | One signed capability | Safe metadata/signing retry only |
| Clear | Known object deletes + best-effort cancel | Bounded per-object infrastructure retry |

Infrastructure SDK retries are allowed only for idempotent metadata reads and
generation-preconditioned deletes/writes, with a low documented cap and within
the route/job deadline. They are forbidden for transcription, OpenAI, job start
after uncertain acknowledgement, and any operation that could duplicate spend.

### 17.2 Time budgets

| Operation | Public deadline | Owner-validation ceiling | Behavior |
| --- | ---: | ---: | --- |
| API JSON route | 10 s | 15 s | Excludes async job runtime |
| Turnstile | 5 s | 5 s | Fail closed |
| Upload authorization | 10 s | 10 s | Capability not persisted |
| Browser upload | 20 min | 60 min | Progress/resume; no provider work |
| Media inspection job | 2 min | 5 min | Reject before providers |
| Audio extraction | 3 min | 10 min | Within analysis job |
| Transcription provider | 6 min | 15 min | No SDK retry |
| Candidate model | 60 s | 90 s | One response |
| Active-speaker processing | 4 min | 10 min | One selected clip; local process |
| Visual-plan model | 45 s | 90 s | One response |
| Each generated still | 2 min | 4 min | Up to three, no retry |
| Analysis job total | 15 min | 30 min | Proposed ceiling |
| Assembly job total | 15 min | 30 min | Proposed ceiling |
| Render job total | 15 min | 45 min | Proposed ceiling |
| Download URL | 5 min validity | 5 min | Reissue on click only |
| Session access | 2 h | 2 h | No renewal after expiry |

Timeout aborts the owned downstream request/process and produces explicit
evidence. It does not automatically retry or discard reusable completed work.

### 17.3 Admission order

Reject the cheapest condition first:

1. method/content type/body size;
2. session/grant/CSRF/source;
3. feature and paid kill switches;
4. schema and domain bounds;
5. session allowance/idempotency replay;
6. short-window rate and global capacity;
7. provider/cloud budget circuit;
8. Turnstile;
9. atomic marker/lease;
10. provider call or job start.

No rejected earlier condition may cause a provider or compute-bearing job.

### 17.4 Layered spend controls

1. fake and paid-disabled committed defaults;
2. sample path that proves product without transcription/model cost;
3. separate switches for upload, analysis, assembly, image generation, and
   render;
4. explicit confirmation before analysis, assembly, and render;
5. Turnstile at every paid/compute boundary;
6. action counters and atomic single-use markers;
7. exact media/context/output/time bounds;
8. no automatic paid repair or provider retry;
9. active-speaker and visual generation run only for the one selected clip, not
   every candidate;
10. reserve image-call allowance only after the visual plan passes local
   reconciliation; equation cards never consume an image call;
11. one selected render rather than three candidate renders;
12. one analysis, one assembly, and one render capacity lease;
13. Cloud Run scale-to-zero, max instances/tasks, and execution timeouts;
14. provider project hard limits/rate limits and alerts;
15. Google Cloud budget alerts and manual paid kill switch;
16. content-free measurement and reconciliation after controlled flows.

A budget alert is not a hard cap. The operational record must distinguish hard
provider limits, app kill switches, concurrency caps, and advisory cloud
budgets.

### 17.5 Planning cost model

For each controlled flow record:

```text
flow cost = transcription input minutes
          + text-model input/output/cached tokens
          + generated image count by model/quality/size
          + job vCPU-seconds and GiB-seconds
          + temporary storage GiB-hours and operations
          + output network transfer
          + only the explicitly authorized retry reserve
```

The earlier research brief estimated roughly $0.40–$0.60 for a successful
one-hour source flow, or $0.50–$0.80 with occasional failure/retry reserve,
under its 2026-09-29 provider/rate assumptions. That estimate predates the
locked contextual-image work and therefore must not be used as the new total.
Recalculate with current official text/image pricing, selected image quality
and dimensions, region/tier, taxes, currency, free-tier sharing, and measured
token/job/output use before live work.

Public 20-minute flow should be measured separately; do not divide the one-hour
estimate blindly because fixed operations and output transfer do not scale
linearly.

### 17.6 Usage evidence

Record content-free:

- flow/fixture ID from an approved synthetic set;
- exact app revision, environment, region, provider/model config revisions;
- source minutes/bytes and output seconds/bytes;
- provider call counts, token/minute usage, job resource seconds;
- success/failure stage and whether any retry occurred;
- storage cleanup result;
- calculated and billed/observed cost when available;
- variance from plan and explanation.

Never record transcript, prompt, output video, account/project ID, object name,
signed URL, or secret in the cost ledger.

## 18. Visual design system

### 18.1 Design thesis — Precision in the cut

The interface should feel exceptionally modern, minimal, premium, confident,
spacious, precise, and restrained. The product itself is the visual proof:
source evidence becomes an inspectable automatic vertical clip in one clear
sequence. AI is present through useful judgment, provenance, and a transparent
build process—not editing controls, glowing orbs, robot illustrations, trend
scores, or chat bubbles.

Tone:

- a light neutral foundation interrupted by a coherent deep navy-to-cobalt
  luminous field that carries the hero, section transitions, and the existing
  “first cut” proof into one visual story;
- generous whitespace and a disciplined grid, with dark atmosphere used as a
  deliberate product narrative rather than a dense control room;
- one confident sans family carrying display and body roles through optical
  scale, weight, and spacing, plus mono only for timecode and provenance;
- product-media framing, transcript cues, and range/evidence marks as the hero;
- premium material depth from a real glass system: translucent navy/white
  surfaces, backdrop blur where supported, subtle specular edges, and readable
  opaque fallbacks. Glass is selective hierarchy, never decoration on every
  container.

Anti-goals:

- the rejected acid-lime, near-black editorial workstation direction;
- generic purple AI gradients, indiscriminate blur, neon, or particle noise;
- copying Apple, OpusClip, or another product's assets, copy, or signature
  composition;
- social-platform cosplay, viral-score claims, or logo-heavy dashboards;
- dense nonlinear-editor chrome, unlabeled icons, fake waveform activity, or
  motion that does not explain the product.

### 18.2 Provisional color tokens

These are **Proposed - owner approval required** and must be tested in the real
responsive Next.js/React landing prototype.

| Token | Value | Role |
| --- | --- | --- |
| `--color-canvas` | `#F6F7FB` | Cool neutral page background |
| `--color-surface` | `#FFFFFF` | Primary content surface |
| `--color-surface-muted` | `#EDF0F6` | Product-stage and grouped-control layer |
| `--color-ink` | `#0B1020` | Primary text and deep product frame |
| `--color-ink-soft` | `#596174` | Secondary body text |
| `--color-border` | `#DCE1EA` | Neutral separators and control boundaries |
| `--color-brand` | `#3157D5` | Primary action and selected evidence |
| `--color-brand-strong` | `#2144B9` | Hover/pressed action |
| `--color-brand-soft` | `#E7ECFF` | Quiet selection and proof background |
| `--color-focus` | `#006BFF` | Focus ring independent from fill state |
| `--color-danger` | `#B9384A` | Destructive/error emphasis |
| `--color-warning` | `#995400` | Caveat/warning |
| `--color-success` | `#117A50` | Confirmed success |

Never use brand, danger, warning, or success color as the only carrier of
meaning. All text/background pairs must pass WCAG 2.2 AA contrast; body text
targets 4.5:1 and large text/UI boundaries at least 3:1.

### 18.3 Typography

The prototype uses a fast local system stack so review and CI require no remote
font request. The production candidate is a source-controlled licensed variable
sans such as Geist Sans, with Geist Mono or an approved equivalent for timecode
and provenance. Approval of family and license precedes adding binaries and
license notices.

- display: the same sans at 560–680 weight, slightly negative tracking, and
  responsive `clamp()` sizing;
- the landing hero may give its single rotating noun restrained typographic
  contrast—solid, italic, outline, local serif, or condensed—while the stable
  sentence remains the primary voice and no remote font is introduced;
- body: 400–500 weight, relaxed leading, and a 64–72 character measure;
- UI: 560–650 weight with explicit labels and no all-caps paragraph copy;
- mono: compact metadata only, never long-form explanation;
- robust `system-ui`, `-apple-system`, `BlinkMacSystemFont`, and `Segoe UI`
  fallbacks remain declared.

Type scale (rem): `0.75`, `0.875`, `1`, `1.125`, `1.375`, `1.75`, `2.5`,
`3.5`, `5.5`. Body line-height 1.5–1.65; display line-height 0.94–1.05.
Browser zoom and user font settings must remain functional.

### 18.4 Spacing, size, shape, and elevation

- base spacing unit: 4 px;
- scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px;
- content max width on the landing page: 1280 px with generous gutters;
- workflow max width: 1920 px with a flexible preview center;
- minimum interactive target: 44 × 44 CSS px;
- radii: 10 px controls, 16 px compact cards, 24 px product surfaces, and
  32 px hero framing; pill only for compact status and segmented metadata;
- glass surfaces use a shared material recipe: translucent fill, 1 px
  high-contrast/specular edge, restrained inner highlight, and one soft shadow;
- `backdrop-filter` is progressive enhancement. Unsupported or
  reduced-transparency contexts receive an opaque, contrast-safe surface with
  the same hierarchy; forced colors receives explicit borders and system colors;
- the landing page uses one continuous, full-width navy-to-cobalt-to-deep-navy
  structural field across the hero, How it works, market context, side gutters,
  and footer; section-specific light is transparent and feathered rather than
  restarting an opaque gradient at each boundary. It stays blue-led and
  product-specific, not purple, rainbow, noisy, or decorative.

### 18.5 Icon rules

Use one source-controlled SVG icon family. Icons are 16/20/24 px with consistent
stroke. Every standalone icon button has an accessible name and tooltip on
hover/focus. Do not use emoji as controls. Destructive, download, play,
evidence, warning, and status icons have consistent semantics.

### 18.6 Component inventory

CL-002 builds only the primitives needed by the landing prototype: header,
primary/secondary text actions, trust/status strip, evidence steps, and a
synthetic product-media frame. Its final market-context section may add one
responsive wordmark wall of researched paid clipping campaign platforms. Those
wordmarks are original text/CSS treatments with an explicit no-affiliation and
no-earnings-guarantee disclosure; they are not customer, partner, or integration
logos. Later tickets build the functional controls when their behavior exists.
Do not build a generalized dashboard/card system or pretend that the prototype
actions already upload, analyze, or render media.

### 18.7 Product-media art direction

The landing hero uses original HTML/CSS and synthetic text to frame the future
product. A vertical clip preview, transcript evidence, candidate range, and
named workflow cues make the product legible without copied screenshots,
remote media, or fake provider output.

Layout rules:

- the visual-reference hero fills at least the current viewport without using
  a fixed height that clips short screens; its headline is a deliberate
  two-line lockup around one rotating noun;
- laptop and desktop widths use a two-column composition with the headline and
  a concise two-sentence functional promise left and the product-motion frame
  right; tablet and phone widths stack the same semantic content with
  mode-specific spacing;
- the product frame is large enough to read and never treated as decoration;
- synthetic preview content contains no generated faces, logos, UI, watermarks,
  or real user material;
- captions are the top content layer and remain legible over the preview;
- proof text names grounded ranges and automatic composition decisions, not
  virality or trend performance;
- contextual visuals and renderer-specific art remain later-ticket concerns.

### 18.8 Motion

Motion explains product sequence and interaction:

- `120ms` press/focus feedback;
- `180ms` hover and selected-state feedback;
- `320ms` panel and product-media continuity;
- `560ms` hero/product entrance using approved settle easing;
- the hero uses a layered entrance plus restrained ambient light movement so
  the first viewport feels alive without reducing legibility or becoming a
  perpetual particle effect;
- the hero noun uses a clipped rise/fall rotation with one stable accessible
  heading and a static first word only when JavaScript is unavailable; the
  owner-directed visual prototype does not expose a pause/play control;
- transcript evidence, range, and preview cues sequence subtly inside the
  synthetic product frame to explain source → grounded moment → vertical cut;
- “How it works” becomes a smooth scroll-driven narrative with sticky spatial
  continuity and a clearly active step on capable browsers. Semantic source
  order and fully visible static content remain the baseline;
- section transitions use progressive enhancement and do not hide content when
  JavaScript, scroll timelines, or optional motion APIs are unsupported;
- animation uses opacity and transform, avoids layout thrash, and does not run
  a distracting perpetual decorative loop. Client motion, if justified, stays
  in the smallest isolated component boundary rather than converting the page
  into a large client bundle.

For the CL-002 visual-approval prototype, the latest explicit owner direction
requires all hero and synchronized How it works motion to run at full timing in
every local motion-preference state. Repository CSS and JavaScript must not
suppress or shorten that motion based on `prefers-reduced-motion`. The latest
owner revision removes the hero's manual pause/play control. The conversion story begins only when its
graphic enters view and uses exactly three holds:

1. **Upload:** for 5.6 seconds, a synthetic long-form video tile drops into a
   left upload card and a progress track fills while the right transcript
   console remains visibly disabled.
2. **Read:** for 5.2 seconds, the completed upload remains left while transcript
   bars resolve line by line on the active right console. A 1.2-second handoff
   then fades the upload, slides the console from right to left, and reveals a
   muted Cut preview on the right. There is no separate Transfer step, connector
   rail, or energy pulse.
3. **Cut:** the right preview wakes into color and continues playing as two
   synthetic speakers with microphone cues alternate visual emphasis and
   caption lines.

All three steps and their copy remain in server-rendered semantic markup; the
upload/progress treatment is explicitly illustrative and does not make file
intake operational in CL-002. How it works and Back to top navigation also
retain their brief deterministic smooth transition without writing section
fragments into the visible URL or browser history. Real fragment destinations
remain in server-rendered markup as the semantic and JavaScript-free fallback.
This owner-directed always-on-motion choice is a CL-002 accessibility exception,
not a general production policy; reopen reduced-motion behavior before public
release and during CL-013.

Under reduced-transparency preferences or without `backdrop-filter`, replace
translucent surfaces with opaque navy/white material tokens while preserving
contrast, borders, and hierarchy.

### 18.9 Responsive rules

Breakpoints are layout anchors, not device identity:

| Range | Product mode |
| --- | --- |
| 320–599 px | Single-column landing and guided phone selection/review |
| 600–1023 px | Stacked landing proof and tablet selection/review |
| 1024–1439 px | Split landing and compact-laptop review layout |
| 1440–1919 px | Spacious landing and desktop review layout |
| 1920–2560+ px | Bounded large-monitor review layout |

Rules:

- one semantic tree and one state authority;
- no horizontal page scroll from 320 px through 2560 px;
- preserve privacy, rights/limits, fake/sample status, and primary action at
  every width where those actions exist;
- account for height, orientation, virtual keyboard, safe-area insets, and 200%
  zoom—not width alone;
- desktop spacing compresses before composition collapses;
- avoid fixed full-viewport layouts that clip at short heights.

### 18.10 React prototype and concept authority

Before broad application styling:

1. research current official OpusClip, Apple, and a small set of relevant
   AI-video landing experiences at desktop and phone widths;
2. record multiple credible palette/type directions and select one with a
   written rationale;
3. implement the real responsive landing-page visual prototype in the existing
   Next.js/React frontend using the intended production framework;
4. research current motion/scroll/glass implementation candidates and record
   maintenance, React 19/Next 16 fit, license, bundle/client cost, SSR,
   accessibility, and reduced-motion tradeoffs before choosing the smallest
   justified dependency set;
5. verify typography, spacing, color, glass fallbacks, focus, motion, reduced
   motion, 200% zoom, forced colors, short-height behavior, and no horizontal
   overflow in the running app;
6. record explicit owner approval or requested changes before broad styling.

The React page is the canonical visual review artifact. A standalone HTML file
must not remain as a competing full-page concept; at most it may be a narrow
token/type specimen. The prototype may not implement uploads, providers,
session workflow, or later-ticket behavior, and it cannot imply that inactive
visual controls already work.

## 19. Accessibility

Target WCAG 2.2 AA for the complete public flow.

### 19.1 Structure and focus

- semantic landmarks, headings, lists, forms, buttons, and links;
- one descriptive `h1` per screen and logical hierarchy;
- skip link;
- focus visible on every interactive element with the focus token;
- route/stage changes move focus to the new heading or error summary only when
  user context requires it;
- dialogs trap focus, restore it to opener, support Escape when safe, and name
  the destructive consequence;
- drawers use dialog semantics only when modal; persistent sidebars do not;
- disabled controls explain prerequisite through adjacent text, not tooltip only.

### 19.2 Keyboard

- every pointer interaction has keyboard controls;
- Space toggles playback only when focus is not inside another control;
- candidate tabs/cards use correct selection semantics;
- candidate preview, `Build this clip`, render confirmation, download, and clear
  are reachable with ordinary labeled controls;
- no keyboard trap in preview, tabs, dialogs, or drawers.

### 19.3 Status and errors

- polite live region for stage changes, not every polling tick;
- assertive alert for blocking failure after focus-safe rendering;
- upload byte percentage announced at coarse intervals;
- elapsed time is visible but not repeatedly announced;
- color/status icons always have text;
- request/rule reference is copyable without copying user content.

### 19.4 Media and text

- video never autoplays with sound;
- native or equivalently accessible play/pause, mute, seek, and time display;
- transcript is a full text alternative for spoken content;
- burned-in export captions do not replace accessible transcript in app;
- zoom to 200% and text spacing overrides do not lose content/actions;
- minimum body size 16 px on phone forms; no input zoom trap;
- writing direction uses `dir=auto` for untrusted text where safe, while bidi
  override controls are stripped.

### 19.5 Accessibility verification

Automated checks are necessary but insufficient. Manually test Chrome/Edge
keyboard, Windows screen reader coverage for the signature flow, focus after
async transitions, candidate selection, read-only preview, render confirmation,
errors, dialog/drawer, reduced motion, 200% zoom, and
high-contrast/forced-colors behavior.

## 20. Verification strategy

Verification is proportional to risk. Ordinary tickets run the smallest tests
and manual checks that cover their change. Milestones and release run broader
gates. Live-provider calls are rare evidence, never a substitute for fixtures.

### 20.1 Test isolation rules

- Tests force `NODE_ENV=test`, `PROVIDER_MODE=fake`, and all live/paid flags
  false before application modules load.
- Tests do not load local env files, Secret Manager, cloud credentials, or shell
  profile secrets.
- Network is denied by default; an unexpected socket is a failure.
- Tests never target an already-running app or shared cloud bucket.
- Media fixtures are synthetic/purpose-recorded and rights-recorded.
- Time, random IDs, and provider latency are injectable/deterministic.
- Temporary files use isolated test directories and are asserted deleted.
- Provider fake call counts are asserted for paid-operation invariants.

### 20.2 Contract tests

Cover:

- every request/response/error schema success and boundary failure;
- independent and combined source-limit predicates at 14.999/15 seconds,
  20 minutes/20 minutes plus 1 millisecond, and 500 MiB/500 MiB plus 1 byte;
- a source fails when either duration or bytes fail, including 19 minutes/600
  MiB and 25 minutes/200 MiB; exact 20 minutes/500 MiB passes those two checks;
- strict rejection of unknown keys, oversized strings/arrays, NaN/infinity,
  invalid Unicode controls, bidi override, URLs where forbidden, and malformed
  IDs/dates;
- transcript timestamp ordering, speaker IDs, and word caps in CL-001; CL-007
  defines and tests the numeric provider word-overlap tolerance before live
  normalization;
- candidate evidence resolution, overlap, duration, distinctness, rank, and
  forbidden claims;
- shot/face/focus track ordering, bounds, shot-local identity, and confidence;
- visual cue word-ID grounding, duration-band coverage, layouts, asset
  references, exact equation content, and non-overlap;
- immutable-manifest feature gates, selected range, fixed caption profile, and
  render hash;
- operation progress monotonicity and terminal-state immutability;
- frontend/backend fixtures parse through the same published contract version;
- error envelope never reflects validation input.

### 20.3 Reducer and persistence tests

- all legal transitions in the event table;
- representative illegal transitions are ignored and safely diagnosed;
- restore empty, valid, stale, corrupt, oversized, unknown-version, expired, and
  server-conflicting projections;
- no runtime/nonserializable/signed values enter persistence;
- clear removes projection and owned effects;
- browser attempts to mutate or substitute the automatic manifest are rejected;
- refresh during upload, analysis, assembly, clip review, render, result, and
  cleanup;
- route/UI selectors derive readiness from canonical state.

### 20.4 Security/admission tests

- trusted/untrusted/missing Origin and Fetch Metadata;
- missing/invalid/expired/tampered grant and key rotation;
- feature/paid switches reject before Turnstile/provider/job;
- request bounds reject before provider calls;
- completed-object bytes and authoritative `ffprobe` duration cannot be
  bypassed by spoofed browser or request metadata; rejection keeps Deepgram and
  OpenAI fake call counts at zero and deletes the rejected object;
- Turnstile action/hostname mismatch;
- idempotency replay returns existing operation;
- conflicting idempotency payload fails;
- atomic marker/lease contention starts one operation;
- rate/capacity/budget rejection order;
- signed capabilities and cookies are absent from logs/cacheable HTML;
- log sentinel tests for tokens, filenames, transcript, prompt, paths, URLs, and
  raw IP;
- object names remain content-free and generation preconditions are enforced.

### 20.5 Provider adapter contract tests

Run fake and live-shape fixture responses through the same normalization:

- success;
- refusal/no result;
- malformed/extra fields;
- timeout/abort;
- provider 4xx/5xx/rate/budget error mapping;
- call count and SDK retry zero;
- structured output with missing/invalid references;
- image decode/dimensions/alpha/byte validation and zero automatic retry;
- prompt injection inside transcript does not alter policy/schema;
- raw provider values do not cross the adapter boundary.

Optional live contract tests are excluded from default CI and require explicit
owner authorization plus a measured synthetic input plan.

### 20.6 Synthetic/licensed media fixture matrix

At minimum:

| Fixture | Purpose |
| --- | --- |
| 20–30 s clean H.264/AAC monologue | Fast inspection/render smoke |
| 2–3 min two-speaker landscape conversation | Candidate, diarization, active-speaker framing |
| Wide two-person shot with alternating speech | Visible-face active-speaker selection |
| Edited close-ups plus wide shot | Scene-cut resets and focus continuity |
| Listening nods/mouth motion without speech | Prevent false focus switches |
| Brief overlap and off-screen speech | Deterministic temporal stability boundaries |
| Earth, Moon, and simple equation language | Grounded full-frame and card visual cues |
| Vertical source | Pad/crop parity |
| Square source | Crop math |
| Clear overlap/crosstalk | Speaker/caveat behavior |
| Long setup then payoff | Boundary/rubric evaluation |
| Three distinct strong moments | Happy candidate result |
| No self-contained moment | Honest no-candidate state without manual editing |
| Silent video and video without audio stream | Pre-provider rejection |
| Variable frame rate within support | Sync/render validation |
| Unsupported codec/container | Inspection rejection |
| 61 fps / oversized dimensions metadata | Bounds rejection |
| Very light and very dark footage | Caption contrast |
| Long names, numbers, punctuation | Fixed caption grouping |
| Spoken prompt-injection phrases | AI policy/eval |
| Arabic/English code-switch | Stored only for future language gate, not public claim |
| Corrupt/truncated media | Safe process/error cleanup |

Large fixtures should be generated deterministically in test setup or stored in
an approved artifact location; do not bloat Git without a documented reason.

### 20.7 Candidate-selection evaluations

Deterministic graders:

- every reference resolves to an existing word ID;
- boundaries/duration are legal;
- evidence lies within the range;
- opening is not an obvious fragment/dependent pronoun without caveat;
- ending contains the claimed payoff;
- rationale cites transcript-grounded evidence rather than platform folklore;
- no view/virality guarantee or private algorithm claim;
- title/hook contain no invented quote/fact;
- candidates are materially distinct and reasonably distributed;
- prompt-injection transcript does not alter role/schema/policy;
- sensitive inference is absent;
- one request produces at most one model call;
- failure/refusal produces an honest recoverable state.

Human rubric review on a small approved set checks whether ranking is plausible,
not “objectively viral.” Record disagreements and rubric revisions rather than
tuning to one preferred clip.

### 20.8 Active-speaker and contextual-visual evaluations

Active-speaker fixture checks:

- the one-face shot selects that visible face during speech;
- the wide two-person shot follows the actual speaker across alternating turns;
- hard camera cuts reset shot-local tracks without an animated pan across the
  cut;
- listener nods and incidental mouth motion do not steal focus;
- minimum-hold/hysteresis suppresses flicker during breaths and short overlap;
- every normalized box stays in bounds and produces a valid 9:16 crop;
- no face embedding, name, or identity artifact is created or retained;
- the purpose-recorded demo sequence meets the ticket's measured focus accuracy
  and runtime target on the deployment CPU.

Visual-plan checks:

- every cue resolves to spoken word IDs and lies inside the selected clip;
- Earth/Moon full-frame cues and the equation card match their evidence in the
  purpose-recorded example;
- unrelated transcript fixtures never receive Earth, Moon, space, or equation
  cues unless those concepts are actually grounded in their own words;
- cue count, duration, separation, opening human beat, and coverage follow the
  10–60 second density table;
- equations/precise text route to the deterministic card renderer;
- prompt injection, unsupported facts, sensitive inference, URLs, logos,
  likenesses, copyrighted characters, and artist-style requests are rejected;
- image generation occurs only for a reconciled image cue and never exceeds
  three calls;
- generated files pass format, size, alpha, and dimension validation;
- captions remain the top legible layer in full-frame, overlay, and card frames.

Human review of the purpose-recorded sample judges the rhythm: contextual
visuals should clarify the spoken idea while leaving enough podcast footage to
feel connected to the people speaking. This is an editorial demo acceptance
check, not a general quality claim over arbitrary videos.

### 20.9 Automatic-composition evaluations

- assembly produces one valid immutable manifest for the selected candidate;
- range IDs exactly match that candidate and remain within 10–60 seconds;
- captions always use `clean-emphasis` and provider words/times remain unchanged;
- no browser request can submit a replacement range, caption profile, visual
  layout, headline, instruction, or operation list;
- preview repetition produces zero provider calls;
- render accepts only the server-proven assembly manifest/hash;
- preview and render share semantic inputs and golden parity evidence.

### 20.10 Media unit and integration tests

- ffprobe parser with supported/unsupported/corrupt fixture outputs;
- safe process runner abort/timeout/signal/stderr cap;
- audio extraction bounds and cleanup;
- PySceneDetect boundary normalization and shot-local face-track resets;
- Light-ASD subprocess schema, timeout, abort, weights-hash, and cleanup;
- focus smoothing and crop math for one-face/wide/cut/rotation sequences;
- MathJax TeX-subset validation, SVG sanitization, and deterministic card image;
- visual timeline coverage/overlap/safe-zone compilation;
- caption grouping around punctuation, pauses, overlap, and long words;
- ASS escaping and forbidden override prevention;
- manifest-to-plan and argument golden files with path placeholders;
- output metadata/duration/stream validation;
- first/middle/final rendered frame snapshots within visual tolerance;
- start/middle/end audio-video-caption sync;
- no black/transparent frames unless approved padding requires them;
- caption safe zones over light/dark footage;
- full-frame visual preserves podcast audio and captions;
- transparent overlay/equation card does not cover the chosen face or captions;
- exact file cleanup after success, failure, abort, and timeout;
- no shell invocation or remote FFmpeg protocol.

### 20.11 API integration tests

Using the constructed Express app, fake ports, and no listening socket:

- complete sample session to result authorization;
- upload authorization/complete with fake storage/job;
- analysis success, no candidates, provider failure, retry reusing transcript;
- assembly success, invalid visual plan, active-speaker timeout, image failure,
  idempotent replay, and bounded asset cleanup;
- render rejects substituted or stale manifest hashes;
- render success/failure/retry/idempotency;
- operation polling/cancel/expiry;
- clear success and partial deletion;
- every error status/code and no content reflection;
- proxy header/cookie/cache behavior in frontend route tests.

### 20.12 Frontend component and flow tests

- rights disclosure and local validation, including the exact recommendation
  and hard-limit copy;
- browser preflight accepts 9 minutes/220 MiB and 15 minutes/350 MiB, rejects
  19 minutes/600 MiB by size, rejects 25 minutes/200 MiB by duration, and
  treats exact 20 minutes/500 MiB as inclusive;
- an obvious local-limit failure prevents upload authorization and offers
  choose-another/sample recovery;
- upload progress/cancel/resume states;
- named analysis/assembly/render progress and coarse live announcements;
- candidate evidence seek/highlight;
- no-candidate state without a manual range path;
- read-only first-cut preview and automatic facts summary;
- absence of trim, caption style/correction, headline, visual/focus controls,
  instruction fields, proposal actions, timeline, and undo/redo;
- render confirmation facts and one-render limit;
- result download authorization and clear warning;
- expired/cleanup-partial/offline recovery;
- object URL/listener/timer/fetch cleanup.

### 20.13 End-to-end fake-mode scenarios

1. New visitor → sample → three candidates → choose exactly one → build and
   inspect the automatic speaker-following Earth/Moon/equation clip → confirm →
   render fake job → result → download fixture → clear.
2. Live-upload-shaped fake: valid local fixture → resumable fake → inspection →
   analysis → refresh → candidates.
3. Invalid/unsupported media, over-duration but under-size media, and
   under-duration but over-size media fail before every provider call and are
   cleaned up.
4. Analysis timeout preserves source and supports bounded retry.
5. Candidate failure reuses transcript and does not increment transcription
   call count.
6. No candidate → honest terminal choice to retry when allowed or clear.
7. Manifest-substitution attempt fails before render work.
8. Render failure preserves manifest and source; one permitted retry.
9. Refresh at each safe stage creates no duplicate calls/jobs.
10. Clear during upload, analysis, assembly, clip review, render, and result.
11. Expired grant denies access and clears local capability state.

### 20.14 Manual responsive/accessibility matrix

Verify at least:

- 320 × 568 and 390 × 844 phone;
- 768 × 1024 tablet portrait and landscape;
- 1024 × 768 compact laptop;
- 1280 × 800 laptop;
- 1440 × 900 desktop;
- 1920 × 1080 desktop;
- 2560 × 1440 large monitor;
- heights 600–700 px;
- intermediate drag resize at representative transitions;
- 200% browser zoom and text spacing overrides;
- keyboard-only, visible focus, reduced motion, forced colors/high contrast;
- slow network/offline transition and page visibility changes.

Check no horizontal page scrolling, hidden primary/clear actions, focus loss,
overlapping safe-area controls, inaccessible playback, or misleading layout
change.

### 20.15 Owner-controlled live validation

After provider/privacy/spend gates and never in ordinary CI:

1. verify provider/cloud dashboards, caps, project settings, and kill switches;
2. use one previously unused short purpose-recorded fixture;
3. run exactly one upload/analysis/assembly/render flow;
4. verify active-speaker focus, visual grounding/rhythm, call counts, usage,
   sync, output, and deletion;
5. reconcile cost and logs;
6. stop and investigate any duplicate, unexpected retention, content log, or
   material cost variance;
7. only then run one owner-authorized 60-minute ceiling validation if still
   required;
8. disable live flags or preserve approved launch state according to the release
   plan.

### 20.16 Completion audit

Before a ticket/milestone is complete:

1. search for duplicate schemas, constants, components, styles, provider calls,
   and rendering policies;
2. confirm dependency direction and decision ownership;
3. remove dead code, debug output, unsafe casts, stale flags, and placeholder
   success paths;
4. inspect cleanup for every side effect touched;
5. confirm no secret or real user content entered Git, fixtures, logs, snapshots,
   screenshots, or docs;
6. run the smallest relevant automated/manual matrix;
7. update the owning source/ticket/operations document;
8. list credential, paid, visual, cloud, and user-only checks separately as
   complete or unchecked;
9. do not mark unchecked external evidence as passed.

## 21. Deployment and operations

### 21.1 Target architecture

- one public Next.js Cloud Run service;
- one private Express Cloud Run service invoked only by the frontend identity;
- one private Cloud Run Job definition for `analyze`/`assemble`/`render`;
- one private temporary Cloud Storage bucket;
- Artifact Registry immutable images tagged with exact Git SHA and deployed by
  digest;
- Secret Manager for provider keys and grant key material;
- managed `run.app` HTTPS URL first; custom domain only after the demo is stable;
- one approved region for services/job/bucket where platform support permits;
- minimum instances `0`, bounded max instances, explicit concurrency;
- GitHub Actions runs unpaid quality checks only;
- deployment remains an owner-controlled command from an authenticated machine
  unless a later approved decision adds workload identity CI/CD.

Do not add Kubernetes, Terraform, a load balancer, external queue, deployment
OIDC, multi-region failover, or custom controller for appearance. Add only when
an owned requirement justifies it.

### 21.2 Service identities

| Identity | Minimum responsibility |
| --- | --- |
| Frontend service | Invoke private API only |
| API service | Verify abuse, read/write known control/result objects, sign object-specific capabilities, start/status/cancel named media job, and decrypt grants; it performs no visitor-directed AI editing call |
| Media job | Read exact descriptors/source/assembly assets, write progress/result/output, run pinned ASD, call approved transcription/text/image providers, read only required secrets |
| Deployer | Build/push/deploy/IAM under owner control; not used at runtime |

Candidate and visual-planning calls run only in the bounded media job. Scope the
OpenAI secret to that identity deliberately with provider hard limits
appropriate to the demo; never pass it through job descriptors.

### 21.3 Deployment sequence

1. Confirm clean audited commit and all release-gate evidence.
2. Re-check official provider model/pricing/data documentation and dashboard
   configuration; update dated operations docs.
3. Run secret scan, production dependency audit, container scan, typecheck,
   tests, production builds, and fake-mode E2E.
4. Build one immutable backend/job image and one frontend image labeled with
   exact SHA.
5. Push to Artifact Registry and record digests.
6. Verify bucket/IAM/lifecycle/public-access-prevention/soft-delete/CORS against
   operations doc.
7. Deploy private API and media job with fake/paid-disabled settings.
8. Deploy public frontend pointing server-side to private API.
9. Run unpaid health/config/sample/clear probes.
10. Inspect logs for content/secret leakage and confirm min/max/concurrency.
11. Enable only the specifically approved live flags and hard provider caps.
12. Run the bounded live validation plan.
13. Record usage, cost, cleanup, revision, settings, and unresolved issues.
14. Disable live flags immediately if evidence diverges from this document.

### 21.4 Rollback

Rollback uses recorded prior image digests/revisions and IAM/config snapshot.
Do not rebuild an old branch. Sequence:

1. disable paid/live flags;
2. stop starting new jobs;
3. let safe existing jobs finish or cancel according to incident class;
4. deploy prior known-good frontend/API/job image revisions;
5. verify health/sample and session-cookie compatibility;
6. clear or lifecycle-expire affected temporary objects;
7. record incident and evidence before re-enabling live work.

Cookie/grant key rotation must retain the previous decrypt-only key long enough
for a rollback inside the two-hour session window, or intentionally invalidate
all sessions with clear public messaging.

### 21.5 Production observability

Use bounded logs and platform metrics for:

- request count/latency/status by route template;
- admission/rate/capacity decisions;
- job count/duration/terminal category by mode/stage;
- provider call count and safe text/image usage totals;
- upload/source/output byte and duration histograms;
- cleanup outcome and lifecycle-policy drift checks;
- Cloud Run instance/task counts and error rates;
- provider/cloud spend alerts.

No user-content analytics, heatmaps, session replay, transcript search, or media
inspection dashboard is allowed. Metrics labels must be low-cardinality and
content-free.

### 21.6 Release evidence record

For each release, record:

- Git SHA, image digests, Cloud Run revisions, job revision, region;
- public URL and deployment timestamp;
- exact nonsecret feature/limit/model config revisions;
- provider project setting review dates and hard-limit/alert confirmation;
- bucket public access, lifecycle, soft-delete, versioning, CORS, and IAM check;
- automated test/build/audit results;
- manual responsive/accessibility matrix results;
- unpaid deployed probe results;
- authorized live-flow count, usage, cost, output validation, and cleanup;
- known issues, unchecked items, owner approvals, and rollback target.

The record contains no account/project IDs, source media, transcript, prompt,
output, object name, signed URL, token, or secret-bearing screenshot.

### 21.7 Incident priorities

Immediately disable live/paid actions for:

- secret or signed-capability exposure;
- public bucket/object access;
- transcript/media/content in logs or analytics;
- duplicate provider calls/jobs beyond contract;
- runaway spend or provider hard-limit anomaly;
- failure to delete/revoke access beyond documented behavior;
- cross-session object/result access;
- render command/path injection or unexpected network access;
- material false public privacy/AI/rights claim.

Keep the sample available only if it is isolated from the incident.

## 22. Implementation sequence

The standalone execution packets live in [`tickets/`](tickets/README.md). This
is their canonical dependency summary; the packets do not authorize
implementation, Git actions, paid calls, provider/cloud changes, or deployment.

The earlier 22-slice draft was consolidated into 15 cohesive tickets on
2026-09-29. A single user-visible feature remains one vertical slice when its
frontend, backend, contracts, recovery, and focused verification form one
reviewable outcome. A split remains only for a genuine approval gate, distinct
risk domain, or independently reviewable artifact. Closely related work is
adjacent, and a later packet may not silently repair a missing dependency.

### M0 — authority, repository, and visual approval

#### CL-001 — workspace and shared contracts

**Objective:** Create the strict pnpm/TypeScript workspace, safe configuration,
minimal real applications, browser-safe shared contracts/errors, deterministic
quality commands, CI, secret rules, and agent guidance.

**Why combined:** A workspace without real boundary contracts is a placeholder;
contracts without targetable applications/tests cannot prove browser safety or
dependency direction.

**Acceptance:** Fresh checkout installs reproducibly; all three packages build
and verify; fake health starts; production config fails closed; contract and
dependency tests prove live providers cannot compose.

#### CL-002 — React visual prototype and approval

**Objective:** Research current premium product and AI-video landing patterns,
then build the canonical responsive landing-page visual prototype in the real
Next.js/React frontend. Verify its typography, spacing, product-media framing,
motion, accessibility, and desktop/phone behavior before recording explicit
owner approval or requested changes. The rejected standalone HTML concept is
not an authority and must not remain as a competing full-page direction.

**Depends:** CL-001.

**Gate:** Owner visual approval. Broad production styling cannot finish before
it; nonvisual state/fixture work may proceed.

### M1 — deterministic sample and canonical state

#### CL-003 — canonical session and sample foundation

**Objective:** Implement the complete canonical reducer/events/selectors,
allow-listed V1 persistence/reconciliation, rights-recorded sample manifest,
production-shaped transcript/candidate/assembly fixtures, and deterministic
fake clock/provider/job foundations.

**Depends:** CL-001; rights gate before actual sample media/assets enter Git or
deployment.

**Why combined:** The first real workflow state machine needs valid
production-shaped data, while fixtures without legal transitions and recovery
are not an executable foundation.

**Acceptance:** Legal/illegal/restore/adversarial state matrix passes; three
grounded candidates and no-candidate/invalid fixtures validate; no forbidden
content or runtime value persists.

#### CL-004 — sample-to-candidate-review experience

**Objective:** Deliver the responsive landing, disclosures, immediate no-cost
sample path, candidate preview/evidence/selection, and honest no-candidate/manual
range path.

**Depends:** CL-002 owner-approved direction and CL-003.

**Acceptance:** Sample candidate review <15 seconds on a production-like path;
evidence seek/highlight, zero provider calls, and phone/tablet/laptop/desktop/
keyboard checks pass.

### M2 — private media intake and job foundation

#### CL-005 — secure upload and temporary storage

**Objective:** Implement the encrypted grant, content-free object model,
temporary-storage port/fake, idempotency/leases/clear, browser local inspection,
server-created resumable upload, completion checks, cancel, and partial cleanup.

**Depends:** CL-001 and CL-003; product/provider privacy and cloud authorization
before the live GCS adapter/spike.

**Why combined:** Upload is not safe or useful without the grant, object,
metadata, idempotency, and cleanup lifecycle that owns its bearer capability.

**Acceptance:** Tamper/expiry/key-rotation/atomic marker/deletion-partial tests;
no app-service media body; wrong/oversized/partial objects delete; the resumable
capability never persists/logs; authorized live spike proves exact CORS/resume/
generation/abort behavior.

#### CL-006 — media job and active-speaker feasibility

**Objective:** Build the one-job entry, descriptor/progress/result lifecycle,
safe process runner/temp workspace, authoritative ffprobe inspection/audio
extraction boundary, fake job runner, and exact-sample Light-ASD feasibility
benchmark on the intended CPU/container.

**Depends:** CL-003 and CL-005; rights/model/network/cloud gates for the
purpose-recorded benchmark.

**Why combined:** The risky spike depends directly on the same pinned process,
container, fixture, cleanup, and resource foundation; it is the job ticket's
real go/no-go result, not a standalone product feature.

**Acceptance:** Media/abort/timeout/cleanup/progress matrix passes; exact model,
weights hash, licenses, runtime/memory/container inputs are recorded; one-face,
wide two-person, listener-motion, overlap, and camera-cut sample sections yield
an explicit go/no-go without identity/embedding retention.

### M3 — live analysis

#### CL-007 — live-analysis vertical slice

**Objective:** Deliver extraction integration, transcription and candidate
ports/fakes/live adapters, prompt/reconciliation/evaluations, analyze job/API,
poll/cancel/refresh/retry, and progress/candidate/no-candidate UI as one
upload-to-grounded-candidates feature.

**Depends:** CL-004 and CL-006; provider/privacy/spend approval for live checks.

**Why combined:** Transcription, selection, orchestration, recovery, and UI share
one idempotency/privacy/call-count contract and do not form useful intermediate
user outcomes.

**Acceptance:** Zero-to-four grounded distinct candidates and the no-candidate
state pass without padding or a manual-range fallback;
injection/virality/invented quote/refusal/timeout cases fail safely; one action
makes at most one transcription and one model call; candidate retry reuses a
valid transcript; refresh creates no duplicate work.

### M4 — automatic AI first cut and review

#### CL-008 — active-speaker assembly

**Objective:** Productionize scene cuts, face tracks, Light-ASD inference,
deterministic smoothing, and `SpeakerFocusTrackV1` for the selected clip.

**Depends:** CL-006 explicit go decision and CL-007 selected-range orchestration.

**Acceptance:** The purpose-recorded one-face/wide/edited-camera story follows
the audible speaker with no distracting flicker; bounds, runtime, weights hash,
abort, cleanup, and no-identity rules pass. This is required for release.

#### CL-009 — contextual visual assembly

**Objective:** Visual-planner port/fake/live adapter, strict reconciliation,
OpenAI Image adapter, MathJax equation/card renderer, asset validation, and
`AssemblyBundleV1` orchestration/UI stages.

**Depends:** CL-007 transcript-grounded model boundary, CL-008 focus track,
provider/privacy/spend approval for live checks.

**Acceptance:** The sample builds the Earth full-frame beat, returns to podcast
footage, builds the Moon beat, and shows a smaller exact equation card; captions
remain readable; the visual density table, 0–3 image-call cap, failure cleanup,
and preview bundle all pass. This is required for release.

#### CL-010 — automatic clip review and render confirmation

**Objective:** Deliver the responsive read-only 9:16 preview, automatic clip
facts, fixed-caption disclosure, one-render confirmation, refresh recovery, and
preview/render parity boundary without any editing surface.

**Depends:** CL-002 owner-approved direction, CL-004, and CL-009.

**Acceptance:** Desktop/phone users can play and understand the complete
automatic first cut, confirm the one render, and recover safely; the browser
cannot alter the selected range, captions, speaker framing, visuals, headline,
or manifest, and no editor/chatbot/assistant/timeline/history UI or provider
call exists.

### M5 — deterministic render and result

#### CL-011 — render and final delivery

**Objective:** Compile speaker crop, visual timeline, fixed ASS captions,
audio, and FFmpeg arguments; orchestrate the one render; validate output; and
deliver result playback, short-lived download, retry evidence, and clear.

**Depends:** CL-005 and CL-010.

**Why combined:** The compiler and orchestration are one frozen-manifest-to-
validated-artifact lifecycle; neither is independently user-complete.

**Acceptance:** No shell/model strings; full-frame/overlay/card layouts with
captions last; measured profile/sync/safe zones/golden frames pass; one
idempotent selected render produces a valid content-safe MP4; invalid output is
never downloadable; clear removes assembly/output/control artifacts.

### M6 — hardening and release

#### CL-012 — security, privacy, abuse, and spend hardening

**Objective:** CSRF/source/CSP/headers, Turnstile, rate/capacity/budget gates,
logging allow-list, data/rights/retention docs, and active-speaker/image-specific
privacy and call-count checks.

**Depends:** CL-007, CL-009, CL-010, and CL-011.

**Acceptance:** Rejection order/call-count/security tests; model weights/license,
provider/bucket/image-spend settings ready for owner review.

#### CL-013 — accessibility, responsive, and performance pass

**Objective:** Named viewport/zoom/keyboard/screen-reader/reduced-motion matrix,
assembly/review responsiveness, bundle/media performance, and short-height
behavior.

**Depends:** CL-012 and visual approval.

**Acceptance:** Recorded manual matrix; no critical/serious automated a11y
issues; sample first-cut performance goal met.

#### CL-014 — release-candidate audit

**Objective:** Reconcile all prior tickets/evidence, perform one behavior-
preserving whole-codebase quality/efficiency pass, align documentation, run
rights/secret/dependency/container/model-license scans, and execute the complete
deterministic release gate on the exact candidate.

**Depends:** CL-013.

**Acceptance:** Exact candidate commit declared auditable; all owner/external
checks explicitly complete or unchecked; every material finding fixed or an
explicit deployment blocker.

### M7 — deployment and controlled live evidence

#### CL-015 — deploy, validate, measure, and roll back

**Objective:** Deploy the exact audited revision as immutable images, prove
private services/storage/IAM, run unpaid probes, execute only the approved
bounded live analysis/assembly/render flow, reconcile cost/cleanup and
public claims, and prove kill switch plus digest rollback.

**Depends:** CL-014 and every required owner gate.

**Acceptance:** SHA/digests/revisions/config and release evidence are complete;
unpaid probes precede live flags; exact call/usage/cost/output/cleanup results
match the plan; public speaker-framing/visual/privacy claims match measured
state; kill switches and rollback are proven.

### 22.1 Ticket packet requirements

Every future ticket must include:

- objective and portfolio value;
- dependencies with evidence;
- files/areas owned;
- in-scope and out-of-scope behavior;
- relevant locked/proposed decisions copied accurately;
- privacy/provider/cost constraints;
- contracts/state transitions;
- acceptance criteria;
- smallest automated and manual verification;
- documentation updates;
- explicit credential, paid, visual, cloud, owner, or rights blockers;
- no authorization to stage, commit, push, deploy, or mutate providers unless
  separately granted.

The complete packets and their current status are indexed in
[`tickets/README.md`](tickets/README.md). The filename-level blueprint remains
an eventual shape; each packet creates only the real modules it owns.

## 23. Release acceptance checklist

### Product and claims

- [ ] Product sentence, audience, and five-minute story approved.
- [ ] Demo/MVP/vision boundaries match UI, README, and source.
- [ ] No virality, trend-awareness, rights, privacy, or deletion overclaim.
- [ ] Sample provenance and redistribution permission recorded.
- [ ] The locked public-upload, source-limit, speaker-framing, visual,
      one-render, and no-trend-input contract is unchanged; the v1 language
      claim is approved.

### Workflow and automatic clip review

- [ ] Every canonical state, error, retry, cancel, refresh, expiry, and clear
      path is implemented and tested.
- [ ] Candidate evidence resolves to exact transcript words/time.
- [ ] Selected clip builds a valid shot-local active-speaker focus track and
      follows the audible speaker in the purpose-recorded wide shot.
- [ ] Visual cues resolve to transcript words; the sample proves full-frame
      Earth/Moon imagery and a smaller exact equation card.
- [ ] Visitor selects exactly one of zero-to-four grounded candidates; no weak
      padding or manual-range fallback exists.
- [ ] Automatic preview exposes no editor, assistant, trim, caption, headline,
      focus/visual, timeline, proposal, or undo/redo controls.
- [ ] Fixed captions preserve the immutable provider transcript.
- [ ] Preview/export use the same manifest, caption groups, speaker-focus track,
      visual cues/assets, and safe zones.

### Data and security

- [ ] Data inventory matches actual code/providers/infrastructure.
- [ ] Bucket is private with documented CORS/lifecycle/soft-delete/versioning/IAM.
- [ ] Grant, CSRF/source, idempotency, markers, leases, and capabilities audited.
- [ ] Logs/metrics/errors contain no prohibited data.
- [ ] Clear/expiry/partial cleanup behavior is evidenced.
- [ ] Provider data/project settings reviewed and dated.
- [ ] Face intermediates/embeddings and generated assets follow the documented
      geometry-only, no-identity, temporary-lifecycle rules.

### Spend and reliability

- [ ] Committed/test/local defaults cannot spend.
- [ ] Paid boundaries reject in documented cheapest-first order.
- [ ] Provider SDK/job retries are zero where required.
- [ ] Hard limits, alerts, instance/task caps, timeouts, and kill switches set.
- [ ] Planned versus observed controlled-flow cost reconciled.
- [ ] Duplicate-call/job tests and refresh/retry evidence pass.
- [ ] Active-speaker CPU/runtime and 0–3 image-call budgets pass on the exact
      deployment profile.

### Media output

- [ ] Input rejection happens before provider use.
- [ ] FFmpeg uses argument arrays, fixed protocols, bundled fonts, and temp paths.
- [ ] Output is valid 1080 × 1920 H.264/AAC MP4 with safe metadata/name.
- [ ] Sync, duration, frames, captions, AI framing, contextual visuals, audio,
      and output bounds pass.
- [ ] Partial/invalid outputs are deleted and never downloadable.

### Design and accessibility

- [ ] Visual reference/concepts approved; implementation uses approved tokens.
- [ ] Named responsive/short-height/intermediate resize matrix passes.
- [ ] Keyboard, focus, dialogs, live regions, media controls, transcript, 200%
      zoom, forced colors, and reduced motion pass.
- [ ] No horizontal page scroll or essential action loss.

### Delivery

- [ ] Exact commit, images, digests, revisions, IAM/config, and rollback recorded.
- [ ] Secret/dependency/container scans and production builds pass.
- [ ] Unpaid deployed probes pass before live checks.
- [ ] Only authorized live flows ran; their usage/cost/cleanup is recorded.
- [ ] Remaining blockers are explicitly unchecked, not reported as complete.

## 24. Owner decisions still required

These are not questions an implementation agent should answer silently. The
recommendation and consequence are already specified so the owner can approve
or change them efficiently.

1. **Language** — Recommend English first. Adding Arabic/English at release
   materially expands transcription, bidi/font, caption, and QA scope.
2. **Active-speaker implementation** — Active-speaker framing is required.
   Recommend Light-ASD after the exact sample/Cloud Run CPU spike; compare
   TalkNet only if it misses the focus/runtime target. Do not replace this with
   center/left/right controls for the demo.
3. **Sample rights** — Recommend a purpose-recorded conversation with written
   contributor permission and no unlicensed music/assets.
4. **Upload mechanism** — Recommend server-created resumable Cloud Storage
   upload after the bounded spike.
5. **Refresh recovery privacy** — Recommend private normalized transcript and
   candidate JSON under the same temporary TTL; rejecting it removes reliable
   refresh recovery.
6. **Provider/model** — Recommend Deepgram Nova-3 plus OpenAI Responses with
    `gpt-6-sol`, strict Structured Outputs, `store: false`, and no SDK retry;
    propose the OpenAI Image API with `gpt-image-2.5-flare` for at most three
    contextual stills, subject to current account/policy/latency/quality/cost
    review.
7. **Region** — Recommend `us-central1` for the first cost baseline unless
    residency or audience latency requires a different single region.
8. **Retention** — Recommend 2-hour access, explicit clear, one-day lifecycle
    eligibility, and honest asynchronous-deletion copy.
9. **Visual identity** — The product name is already locked as **ClipBuilder**,
    with **ClipAssistant** as the backup. Approve or change the “Editorial Signal
    **Precision in the cut** direction, font licenses, wordmark treatment, and
    restrained light-neutral/cobalt system; do not reopen the name as part of
    routine visual exploration.
10. **Visual system** — Approve the provisional `precision-cut-v1` direction,
    generated stills for grounded concepts, MathJax 4 SVG cards for exact
    equations/text, and no arbitrary stock/web-image search.
11. **Spend** — Set numerical text/image provider hard limits and Google Cloud
    alert budget before any live call or job.

Public upload, one final render, and the absence of a trend-input field are
locked product behavior, not open owner decisions. Launch may still keep every
live flag off until the named rights, security, privacy, provider, spend, and
deployment gates are evidenced.

Until approved, fake/sample foundations may proceed; public/live/provider or
privacy-sensitive tickets stop at their named gate.

## 25. Implementation-agent handoff

Give a fresh implementation agent this document, the active ticket, and only
the references that ticket requires. The non-negotiable bootstrap is:

> Build a database-free, temporary-storage AI clipping portfolio demo. One
> owned/licensed conversation produces grounded candidate moments; the user
> selects one, then the first-cut assembly follows the visible active speaker,
> adds always-on captions, and balances podcast footage with transcript-grounded
> contextual stills or exact equation cards before exporting one vertical MP4.
> The browser exposes only selection, read-only review, render confirmation,
> download, and clear—never an editor, chatbot, trim, caption/style control,
> visual control, timeline, proposal, or undo/redo. The AI may emit only strict
> candidate and visual data that references real
> word IDs. Deterministic code validates and compiles it. Never claim virality
> or current platform knowledge, download remote platform media, generate
> video, scrape/search B-roll, publish to social accounts, infer sensitive traits,
> or add accounts/projects/history. Keep fake and paid-disabled defaults. Never
> read ignored secret files or use real user content in tests. Protect each
> paid/compute boundary, bound every resource, store media/content only in the
> private short-lived object set, log no content, render only the selected
> manifest, and report every live, paid, rights, visual, cleanup, and deployment
> check explicitly. Do not stage, commit, push, deploy, or mutate cloud/provider
> configuration without separate authorization.

An agent may implement exactly one dependency-ready ticket. If a material
decision is unresolved, it follows the specified fake/deterministic work and stops
at the owner gate rather than inventing approval.

## Appendix A — Recovery matrix

| Failure | Preserve | Do not repeat automatically | User actions |
| --- | --- | --- | --- |
| Local invalid file | Nothing remote; local selection | Upload/provider work | Choose another, sample |
| Upload authorization | Local file | Turnstile/capability loop | Retry authorization, cancel |
| Upload interrupted | Confirmed uploaded chunks/object | Analysis | Resume if proven, restart, clear |
| Media unsupported/missing audio | Safe descriptor/error only | Providers | Choose another, sample, clear |
| Transcription failure | Source + descriptor | Transcription | One permitted manual retry, clear |
| Candidate model failure | Source + normalized transcript | Transcription; no model repair | Retry candidate selection if allowed, clear |
| Invalid candidate schema | Source + transcript | Paid repair | Retry if allowance approved, clear |
| No strong candidate | Source + transcript | Model call | Retry if evidence/allowance permits, clear |
| Active-speaker assembly failure | Source + transcript + selected range | ASD/job retry | Retry one bounded first-cut build if allowed, choose sample, clear |
| Visual-plan/image failure | Source + focus track + selected range | Paid repair or substitute image | Retry one bounded assembly if allowed, choose sample, clear |
| Automatic preview failure | Source + analysis + immutable manifest | Analysis/model | Retry preview access/status, clear |
| Render failure | Source + analysis + manifest | Analysis/model | One permitted render retry, clear |
| Output validation failure | Source + manifest; delete output | Download | Retry if permitted, clear |
| Browser refresh | Server-proven artifacts + allowed projection | Paid action/job | Resume polling/review/result |
| Offline | Local projection; server artifacts untouched | Mutations | Reconnect/retry status, clear local only with warning |
| Session expiry | Local indication only; no access | Grant renewal | Clear local, start new session |
| Partial clear | No new access; lifecycle backstop | New work | Retry cleanup while possible, start fresh after local clear |

## Appendix B — Canonical stage codes

Stage codes are stable machine values; UI copy may improve without changing
them.

```text
session.restoring
upload.authorizing
upload.transferring
upload.verifying
media.inspecting
analysis.queued
analysis.reading-descriptor
analysis.extracting-audio
analysis.transcribing
analysis.reusing-transcript
analysis.normalizing-transcript
analysis.selecting-candidates
analysis.reconciling-candidates
analysis.writing-result
analysis.complete
assembly.queued
assembly.reading-selected-range
assembly.downloading-source-window
assembly.detecting-shots
assembly.tracking-faces
assembly.detecting-active-speaker
assembly.smoothing-speaker-focus
assembly.planning-visuals
assembly.reconciling-visual-plan
assembly.creating-visual-assets
assembly.compiling-preview-bundle
assembly.writing-result
assembly.complete
review.ready
render.queued
render.reading-descriptor
render.validating-manifest
render.downloading-source
render.downloading-assembly-assets
render.compiling-speaker-framing
render.compiling-visual-layers
render.compiling-captions
render.compiling-plan
render.encoding
render.validating-output
render.uploading-output
render.complete
cleanup.cancelling
cleanup.deleting
cleanup.complete
cleanup.partial
```

## Appendix C — Source-controlled public error messages

Representative messages; exact wording may be usability-edited without
revealing content:

| Code | Public message |
| --- | --- |
| `SOURCE_TOO_LARGE` | “This video is larger than the current demo limit.” |
| `DURATION_OUT_OF_RANGE` | “Choose a video within the current duration limit.” |
| `UNSUPPORTED_MEDIA` | “This video’s container or codec is not supported by the demo.” |
| `MISSING_AUDIO` | “This video does not contain a usable speech track.” |
| `PAID_DEMO_DISABLED` | “Live processing is temporarily unavailable. The sample is still ready to try.” |
| `CAPACITY_FULL` | “The demo is processing another clip. Try again shortly or use the sample.” |
| `TRANSCRIPTION_FAILED` | “Speech transcription did not finish. Your source is still available for a bounded retry.” |
| `MODEL_OUTPUT_REJECTED` | “The suggestion could not be safely matched to the transcript. Your completed work was preserved.” |
| `NO_VALID_CANDIDATES` | “No strong self-contained moment met the current rubric. You can clear this source or retry when available.” |
| `ACTIVE_SPEAKER_FAILED` | “The AI first cut could not follow the visible speaker. Your selected moment was preserved.” |
| `VISUAL_GENERATION_FAILED` | “The contextual visuals could not be completed. Your selected moment was preserved.” |
| `ASSEMBLY_OUTPUT_REJECTED` | “The AI first cut did not pass validation. Your selected moment was preserved.” |
| `RENDER_OUTPUT_INVALID` | “The exported file did not pass validation. The draft and source were preserved.” |
| `SESSION_EXPIRED` | “This temporary session has expired and can no longer access its media.” |
| `INTERNAL_ERROR` | “Something unexpected happened. Your reference code is available below.” |

## Appendix D — Official references and re-check list

These links support the research baseline; they do not freeze future provider
behavior or pricing.

### OpenAI

- [Models](https://developers.openai.com/api/docs/models)
- [GPT-6 Sol model](https://developers.openai.com/api/docs/models/gpt-6-sol)
- [Responses API migration and state](https://developers.openai.com/api/docs/guides/migrate-to-responses)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [API data controls](https://developers.openai.com/api/docs/guides/your-data)
- [API pricing](https://developers.openai.com/api/docs/pricing)
- [Image generation](https://developers.openai.com/api/docs/guides/image-generation)
- [Image prompting](https://developers.openai.com/api/docs/guides/image-prompting)

Re-check: exact model ID/access/features, Structured Outputs schema support,
`store: false`, application/abuse-monitoring retention, regional eligibility,
rate limits, current text/image model IDs, transparent output/dimension support,
image quality/latency, organization verification, and current pricing.

### Transcription

- [Deepgram pricing](https://deepgram.com/pricing)
- [Deepgram pre-recorded transcription](https://developers.deepgram.com/docs/pre-recorded-audio)
- [Deepgram diarization](https://developers.deepgram.com/docs/diarization)

Re-check: exact model/language support, word timing/diarization shape, file/audio
limits, request/timeout behavior, data retention/model-improvement settings,
rate limits, and pricing.

### Media and Google Cloud

- [FFmpeg filters](https://ffmpeg.org/ffmpeg-filters.html)
- [FFmpeg command-line and seeking](https://ffmpeg.org/ffmpeg.html)
- [Cloud Run jobs](https://cloud.google.com/run/docs/create-jobs)
- [Cloud Run quotas](https://cloud.google.com/run/quotas)
- [Cloud Run pricing](https://cloud.google.com/run/pricing)
- [Google FFmpeg video-encoding job tutorial](https://cloud.google.com/run/docs/tutorials/video-encoding)
- [Cloud Storage signed URLs](https://cloud.google.com/storage/docs/access-control/signed-urls)
- [Cloud Storage resumable uploads](https://cloud.google.com/storage/docs/resumable-uploads)
- [Cloud Storage lifecycle](https://cloud.google.com/storage/docs/lifecycle)
- [Cloud Storage soft delete](https://cloud.google.com/storage/docs/soft-delete)
- [Cloud Storage pricing](https://cloud.google.com/storage/pricing)
- [PySceneDetect detectors](https://www.scenedetect.com/docs/api/detectors.html)
- [Light-ASD paper](https://arxiv.org/abs/2303.04439)
- [Light-ASD official repository](https://github.com/Junhua-Liao/Light-ASD)
- [TalkNet paper](https://arxiv.org/abs/2107.06592)
- [TalkNet official repository](https://github.com/TaoRuijie/TalkNet-ASD)
- [MathJax SVG output](https://docs.mathjax.org/en/v4.0/output/svg.html)
- [MathJax server components](https://docs.mathjax.org/en/v4.0/server/components.html)

Re-check: request/job/time/resource limits, region prices/free tier, CORS and
resumable session behavior, lifecycle timing, soft-delete organization policy,
signed capability behavior, scene/ASD model licenses and weights, container CPU
performance, and MathJax/renderer compatibility.

### Platform positioning

- [TikTok Creative Center trends](https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en)
- [TikTok Research API eligibility](https://developers.tiktok.com/products/research-api/)
- [TikTok Content Posting API](https://developers.tiktok.com/products/content-posting-api/)

These references justify avoiding claims of current proprietary trend/algorithm
knowledge and keeping direct publishing out of the demo. Do not integrate them
without a separate approved scope and current platform review.

## Appendix E — Definition of done

The portfolio demo is done when the approved signature journey is coherent,
the purpose-recorded clip visibly follows the active speaker, grounded visuals
clarify the spoken concepts without replacing most podcast footage, and the
flow is understandable, recoverable, private within its stated limits,
cost-bounded, accessible, responsive, deployed from an audited immutable
artifact, and supported by recorded evidence. It is not done when every roadmap
idea exists, when a single happy-path fake looks polished, or when unperformed
live/provider/rights/cleanup checks are described as complete.





