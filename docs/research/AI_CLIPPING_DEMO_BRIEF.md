# ClipBuilder automatic clipping demo — research brief

Status: **Current research summary; subordinate to the source of truth**

Revised: 2026-09-29

Authority: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)

This document records the product and technical conclusions supported by the
original research. It is not a second specification. When it differs from the
source of truth or an explicit owner decision, the source of truth and owner
decision win.

## Recommendation

Build a focused automatic clipping experience, not a video editor and not a
“viral video oracle.”

> Give ClipBuilder one owned or licensed conversation. It finds as many as four
> strong, self-contained moments, lets the visitor choose exactly one, then
> automatically creates one polished vertical clip for confirmation and
> download.

The demo should make these capabilities legible:

- media intake and bounded processing;
- transcript- and timestamp-grounded candidate reasoning;
- active-speaker vertical framing;
- a single fixed, readable burned-in caption treatment;
- sparse contextual visuals grounded in the transcript;
- honest progress through automatic composition and rendering;
- a read-only final preview and one downloadable MP4;
- privacy, rights, cleanup, and spend controls.

## Locked interaction contract

The public journey is:

1. Start from the curated sample or upload one supported owned/licensed video.
2. Watch honest analysis stages while the source is inspected and transcribed.
3. Receive zero to four grounded candidates, targeting three strong choices.
4. If no strong candidate exists, show an honest no-candidate state. Never pad
   weak results and never offer a manual-range fallback.
5. Preview the candidates and select exactly one.
6. Let ClipBuilder automatically create the selected 10–60 second vertical
   clip using active-speaker framing, the fixed `clean-emphasis` caption
   profile, and sparse contextual visuals where evidence supports them.
7. Review the completed result in a read-only preview.
8. Confirm one render, then preview and download the final MP4.

The curated sample always presents exactly three materially distinct candidates
so its visual and acceptance evidence stays deterministic. Live analysis may
return any count from zero through four.

There is no public editing surface. In particular, do not add:

- manual trim, range, transcript, or caption editing;
- caption style, density, color, or placement controls;
- headline controls;
- crop, speaker-focus, visual, layout, or timing controls;
- an editable timeline;
- a prompt box, chat interface, or change-request workflow;
- operation proposals, diffs, apply/dismiss actions, history, undo, or redo.

The visitor makes two creative decisions only: which source to use and which
candidate to continue with. The final confirmation authorizes rendering the
already prepared automatic composition; it does not open another authoring
stage.

## Honest positioning

Safe claims:

- “Finds self-contained, high-potential moments in a long conversation.”
- “Ranks candidates using a transparent editorial rubric.”
- “Every suggestion links back to exact words and a source time range.”
- “Automatically creates one vertical clip with captions and contextual
  visuals after you choose a moment.”
- “Lets you review the finished composition before rendering.”

Claims to avoid:

- knowledge of what is currently viral;
- predictions of views, engagement, or virality;
- privileged knowledge of recommendation algorithms;
- automatic copyright clearance;
- direct social publishing;
- suggestions that the visitor can customize the composition.

Shareability is an editorial judgment backed by transcript evidence, not a
performance guarantee. Current trend awareness would require a separately
maintained and approved data source and is outside this demo.

## Candidate research conclusions

Each candidate should contain:

- an exact start and end time within the 10–60 second limit;
- opening and closing transcript anchors;
- a short title or hook used as candidate metadata, not an editable overlay;
- a concise rationale tied to transcript evidence;
- legible rubric signals rather than a mysterious score;
- a source preview and transcript excerpt;
- warnings for missing context, overlap, or weak closure.

Candidate outputs must reference existing transcript word IDs. Deterministic
code validates bounds, duration, evidence, distinctness, and allowed fields.
Provider output never becomes an executable media command.

## Automatic composition conclusions

The selected candidate becomes one immutable, server-owned composition
manifest. The manifest records:

- the selected candidate and validated word/time range;
- active-speaker focus segments with deterministic fallback behavior;
- the fixed `clean-emphasis` caption profile and compiled caption cues;
- zero or more transcript-grounded visual beats;
- audio and output presets;
- version and integrity/hash information used to prove preview/render parity.

Automatic composition may use visuals inside the portrait frame, as a
full-frame moment, or as an information/equation card. Every beat must be
grounded, rights-safe, bounded, and validated. Sparse or zero visuals are valid
when no trustworthy visual improves the clip.

The browser receives a renderable, read-only projection. The server owns the
canonical manifest and accepts a render confirmation referencing its identity
or hash; the browser does not submit arbitrary media instructions.

## Technical conclusions

- Keep the application database-free and session-scoped.
- Keep committed/default/test composition fake and paid-disabled.
- Upload directly to private temporary object storage through a narrow,
  short-lived capability rather than proxying large files through Next.js.
- Use one bounded media job for probing, transcription, candidate analysis,
  focus detection, visual planning, composition, and final rendering, with
  checkpoints that avoid repeating completed paid work.
- Keep provider adapters behind typed ports and reconcile all provider output
  into browser-safe contracts.
- Compile only the validated server-owned manifest to fixed FFmpeg operations.
- Render one H.264/AAC 1080 × 1920 MP4 and expose a short-lived download.
- Delete source, intermediate, and output artifacts on clear, expiry, and the
  documented lifecycle schedule.
- Log rule IDs, timings, counts, and opaque correlation data only—never media,
  filenames, transcripts, captions, prompts, generated assets, or signed URLs.

## Reliability expectations

| Condition | Required behavior |
| --- | --- |
| Invalid or unsupported source | Reject before paid analysis where possible and explain the supported bounds. |
| Analysis failure | Preserve only the bounded resumable state and offer a safe retry or clear action. |
| Zero strong candidates | Explain the result, allow a bounded re-analysis when eligible, or clear/start again; do not expose manual range selection. |
| Active-speaker uncertainty | Use the deterministic safe framing fallback and disclose reduced confidence internally through content-safe state. |
| Visual planning/generation failure | Continue with the source-only composition when valid; do not invent or silently substitute unrelated visuals. |
| Automatic composition failure | Preserve the selected candidate and completed checkpoints for one bounded retry. |
| Render failure | Keep the validated composition until TTL and retry render without repeating analysis. |
| Refresh | Restore only the documented session projection and poll real state; never duplicate paid work. |
| Clear or expiry | Remove browser state and request deletion of temporary remote artifacts, reporting cleanup failure honestly. |

## Evaluation focus

Synthetic and approved fixtures should cover clean monologue, two-speaker
conversation, overlap, long setup, several plausible moments, no strong moment,
vertical and landscape sources, missing audio, awkward supported codecs,
prompt-injection-like speech, and punctuation/numeric edge cases.

Candidate checks should prove:

- every reference resolves to a real word or time span;
- boundaries and durations are legal;
- candidates are materially distinct;
- opening and closing claims match the transcript;
- no quote, fact, or performance claim is invented;
- adversarial speech cannot alter system policy;
- the reconciled count is zero through four without duplicate padding.

Composition and render checks should prove:

- the curated sample offers exactly three candidates and requires one choice;
- the chosen candidate alone enters automatic composition;
- captions use only the fixed profile;
- the read-only preview and final render use the same manifest identity/hash;
- audio, picture, captions, and visuals remain synchronized;
- output is a valid 1080 × 1920 H.264/AAC MP4;
- no rejected editing or customization control is reachable;
- output naming and telemetry reveal no source identity;
- temporary resources close and delete on success, failure, abort, and timeout.

## Scope decision history

Early research explored a small editable workspace with transcript trimming,
caption choices, crop controls, and model-proposed changes. The owner rejected
that direction for the disposable portfolio demo on 2026-09-29. The retained
research conclusion is that structured, validated manifests and deterministic
rendering are valuable internally. They are implementation boundaries, not a
visitor-facing editing model.

The current implementation sequence lives only in
[`../tickets/README.md`](../tickets/README.md). Do not derive ticket order or
product scope from earlier research drafts.

## Official research references

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
