# CL-289 — Emotive visual selection and optional visual admission

Status: implemented; focused synthetic validation complete, 2026-11-12. Fresh
real-media aesthetic acceptance belongs to the owner. The subsequent CL-290 and
CL-286 bright reflective Glass reference revisions are also implemented.
Dependencies: existing provider planning, generated/fetched visual acquisition
and optional local illustration fallback. Preserve CL-283 editorial work.

## Approved current-clip visual refresh — 2026-11-12

Completed within the approved cap. After being told that all seven current clips are ready and that a
real refresh uses new Codex planning/search allowance, the owner explicitly
approved one visual refresh per clip. This is a narrow exception to the earlier
no-more-paid-runs instruction: use ClipBuilder's existing Find visuals action
once for each current clip, with the selected local Codex provider. Reuse the
existing transcripts; do not reprocess clips, generate captions, export, retry
providers or switch to Gemini. Preserve source/base, captions/text, camera and
framing edits, audio, manual pictures/videos, old assets, drafts and exports.
If a search yields no replacements, retain existing pictures and report the
miss. Capture a private baseline outside Git and verify acknowledged results
against it. All seven start with zero visual refresh attempts and no processing
active. Do not stage/commit/push or touch Voyagenda. Real output remains subject
to owner aesthetic review; synthetic checks establish mechanics only.

Actual normal-app result: one acknowledged Find visuals action on each of seven
clips, all using exposed Codex capability. Seven additional planning boundaries
and eleven picture-acquisition boundaries; these acquisition counts are attempts,
not eleven delivered/generated pictures. One new picture was admitted on clip 1.
Clips 2–7 returned misses and retain their previous picture placements. There
were zero additional render calls, no clip/caption reprocessing, no second
refresh action on any clip and no provider retry/fallback. Real retrieval coverage
is therefore limited in this run; it does not establish consistently strong
visual results across the batch.

The new admitted picture was hash-verified and privately inspected: an expressive
frustrated person at a computer, matching the intended emotion/action rather than
an explanatory card. Exact before/after comparisons on all seven clips confirm
unchanged source/base hashes, every nonvisual edit field, manual visual cues,
existing picture assets, video/audio assets and exports. Private baseline,
acknowledged snapshots and a structured receipt remain outside Git. No real media,
transcript, provider payload or source identity is recorded here.

During Codex navigation, clips 4 and 6 initially showed playback failure and
inert editor settings. One ordinary Retry preview reload on each restored the
controls before its first Find visuals action; neither reload dispatched AI or
render work. This records an observed transient recovery, not a diagnosed generic
playback fix. Playback remained paused/muted. The current clip-1 visual review
is left in the normal Codex browser. No configuration change, Git mutation,
Voyagenda operation, deployment or extra allowance request. Further real refreshes
need a new owner request; this seven-action approval is fully consumed.

## Owner request

Current automatic pictures are bland text cards or spreadsheet-like graphics.
Matching the topic alone is insufficient: visuals should make the spoken moment
more vivid, showing real-life actions, emotions and concrete situations. For a
speaker describing repeated anger, prefer an expressive frustrated person over
a diagram explaining a loss. The screenshots are appearance references only.

The owner explicitly permits rejecting/omitting a plain, bland optional visual.
An empty B-roll moment is preferable to irrelevant or unengaging filler. Audit
which generation, fetching and fallback methods are actually producing the
current results, research suitable primary sources, improve the method and let
the owner run the later real quality test.

## Acceptance and boundaries

- Trace the actual local Codex and hosted Gemini paths, planner instructions,
  searches, image acquisition, fallback and existing quality/admission logic.
  Document confirmed causes; do not assume every image came from generation.
- Plan visual beats from the speech's observable action/emotion and editorial
  purpose. Favor expressive people, lived situations and clear visual subjects;
  avoid charts, worksheets, text-only explanations and UI cards as generic filler.
  Preserve literal diagrams only when explicitly requested by a manual user.
- Apply a bounded optional-visual admission rule to automatically added media.
  This is the owner's narrow exception to the historical accept-returned-visual
  quality rule: omit unsuitable optional visuals, never reject the usable clip,
  hide captions, erase manual media, discard source work or demand a paid retry.
  Do not turn it into an ASR/selection/whole-plan quality rejection.
- Keep existing provider isolation, scene evidence, source binding, safety,
  rights/provenance, request/resource budgets, no automatic provider retries and
  explicit real-processing approvals. No automatic sound accent is reintroduced.
- Prefer legitimate official/public media and original generation methods;
  never arbitrary executable downloads, unsafe SVG/HTML or unbounded URL fetches.
  Do not add another paid judge/generation pass without explicit authorization.
- Cover fresh preparation and later Find visuals, hosted/local behavior and
  saved/manual preservation. Meaningful fake/no-network tests must prove exact
  provider counts, omission without rejecting a clip, and acquisition fallback.
- Verify generated/fake cases in Codex, preserve the owner's active processing,
  source, drafts and exports. No real AI/source-download test, ignored-config
  access/change, deployment, Git mutation or Voyagenda operation.

Research and implemented manual controls use no provider keys. Fake verification
proves mechanics only; real visual quality requires the configured provider,
live flags/approvals and the owner's later fresh processing test. Update the
source of truth only for the narrowly adopted optional-visual rule and verified
final behavior.

## Confirmed audit and chosen method

Local Codex does not generate a photographic B-roll image. It searches the web,
then `renderCodexIllustration` always constructs a rounded white card with an
icon, heading and labels. This explains the text-card design in the owner's
example; it is deliberate code, not an image model failing to follow direction.
The old planning policy also mandates one image per 30 seconds and explicitly
welcomes explanatory diagrams. Broad web retrieval accepts the first decodable
image, including a page's first OpenGraph/image tag, without checking that tag's
depiction. These mechanisms explain the tendency toward filler; the particular
spreadsheet's historical retrieval was not traced to a private log.

Hosted Gemini already searches first, then can generate one original image with
its existing image provider. Preserve that bounded method. Local Codex should
use searched photographic/cinematic B-roll or omit it; retire the automatic icon
card fallback instead of claiming it produces cinematic images. Both planners
use emotion/action/subject/composition briefs, without forced image counts.

Primary research: [Google's image prompting guide](https://ai.google.dev/gemini-api/docs/image-generation)
and [DeepMind's prompt guide](https://deepmind.google/models/gemini-image/prompt-guide/)
support describing subject, visible action, setting, composition and lighting.
[Pexels' official API](https://www.pexels.com/api/documentation/) supports stock
photo/video search but requires a separate API key and attribution integration;
do not add an unconfigured credential dependency or silently scrape its API.
Use the existing bounded search and generator with improved direction. No new
paid judge or retry pass. Metadata-based admission can reject known unsuitable
formats but cannot prove aesthetic quality of every decoded raster; report that
limit and retain the owner's fresh real-media review.

## Implementation and actual evidence

Both fresh planners and later Find visuals now request observable action/emotion,
subject, setting and composition/light. The shared secondary Gemini assembly
path also permits zero pictures. Removed quota schema minimums and shortfall
warnings; retain bounded timing/gaps and three-image ceilings. Fresh planning
schemas no longer request an illustration recipe. Legacy saved plans still
decode it, but the dead automatic icon-card renderer/test are removed.

New automatic B-roll requests carry an internal purpose. The shared admission
module omits known document/diagram/UI/card briefs and metadata. Search JSON
includes bounded depiction and visible-subject descriptions, with matching
essential terms; bare citations do not certify a depiction. Duplicate citations
no longer overwrite stronger JSON evidence. Page images need their own matching
alt descriptions rather than inheriting the page's relevance. Existing URL/DNS,
redirect, raster/digest/byte/pixel/deadline restrictions remain. A bounded 128px
grayscale entropy check rejects near-flat raster filler in web/Commons/generated
paths. This is neither OCR nor a semantic/aesthetic judge; it may omit minimalist
usable imagery and cannot detect every bland image. No extra model call occurs.

Hosted generation uses its existing one-image request with cinematic expression/
action direction. Codex returns a miss when search fails, without an automatic
card substitute or hidden Gemini call. Manual uploads and saved images bypass
the new gate. Actual Find visuals preservation tests found two related defects:
uploaded videos were not classified as manual media and could donate their ID
to replacement art. One shared local predicate now protects them in both paths.

Checks: 120 backend acquisition/compiler cases passed; 145 local planner/provider/
batch cases passed, followed by 82 focused fresh-schema/legacy-decoder cases after
removing the final required illustration field. Two additional targeted batch
checks covered fresh schematic omission without acquisition and manual-video
survival across miss/success/JSON restore, with exact plan/image/native counts.
Generated raster tests cover structured candidate admission, page-card skipping,
blank omission and one Gemini HTTP request without retry. Browser-safe contract
checks (39 cases), TypeScript and scoped ESLint passed. All transports are
synthetic/fake/no-network, with no ignored env reads or real provider requests.

Read-only validation found no actionable issue in the settled packet. Rendering,
captions, source/camera preparation, manual media/audio and existing security
gates remain intact. CL-283 editorial notes, CL-287 framing and CL-286 material
are separate changes. The normal app still exposes seven existing clips and
is idle; no owner clip was patched as proof. No paid run, new stock API key,
configuration change, Git mutation, push, deployment or Voyagenda operation.
