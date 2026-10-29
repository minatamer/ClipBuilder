# ClipBuilder Demo — Product and Architecture Source of Truth

## Clean Hook cut and Sator removal — CL-145, 2026-10-29

Remove Sator suspense from new sound selection, retaining saved cue decoding.
Hook-to-body playback is a hard cut: prepare the next video before its first
frame without showing/playing it early, and derive Capture readiness from active
source media. Native Hook video/audio share the same rounded source-frame start
and duration, preventing inserted silence when native cadence differs from the
editor's logical clock. Keep the intact body, copied edits, pitch, quality and
limits. No crossfade, added transition or new provider request.

## Passive provider copy removal — CL-144, 2026-10-29

Do not add passive fake/real-mode or selected-provider banners and implementation
explanations to intake or AI moments. Remove the unsolicited status under the
intake heading and the matching Codex explanation in selection. Keep normal
action labels and actionable errors. Configuration, provider isolation and
fake/live gates are unchanged; operational details belong in service guides.

## Discord notification follow-up — CL-143, 2026-10-29

Add the classic Discord message notification recording as a manual Media / Audio
choice with independent volume, timing, layering and the shared preview/export
path. Keep recorded Pop as the automatic visual-start accent. No API key is
needed for sound playback in fake mode. The owner rejected Sator as the intended
suspense music; identifying its replacement is deferred, with existing saved
cues preserved. This does not authorize provider calls, cloud or deployment.

## Recorded sound revision — CL-141–142, 2026-10-29

The owner rejects the generic synthesized Snap/Whoosh/Ding and inaccurate Pop.
Replace new picker choices with actual community-researched public recordings:
Pop SFX, Bamboo Hit, Vine Boom and Sator suspense. The explicit request authorizes
bounded anonymous curation downloads, superseding the original-synthesis-only
catalogue decision. Retired IDs remain playable in saved clips but are absent
from new selection. Pop/Sator now resolve to the real recordings. New planned
visuals receive the recorded Pop once at their start; no end cue or extra AI call.
Preserve layering, independent volume, quality, limits and private owner assets.

Selected audio has Preview in clip at its actual presentation window. Adding a
cue pauses and seeks there without auto-playing; Hook-only preview starts at
zero and stops its sound at the prefix boundary. Recordings are fixed, compact
frame-padded lossless bytes shared by browser/native composition, with content
hashes to prevent stale preview cache reuse. No runtime download, AI sound
generation or external playback request. Manual/fake use needs no API keys.
Tests use fake/injected AI and synthetic source media. Existing real provider
setup/live gates remain; no agent AI, cloud, deployment or Git action is enabled.
Personal exact-version/listening/device and release acceptance remain owner-only.

## Provider choice and audio follow-up — CL-137–139, 2026-10-29

The owner chooses `AI_PROVIDER=gemini` by default, with `codex` as an explicit
local-only backend setting. This supersedes automatic local Codex selection.
Codex selection prevents every Gemini dispatch, including the older explicit
local caption exception; fake mode still uses fictional providers. Hosted stays
Gemini and excludes Codex. Only the provider key in the owner's private local
configuration may be updated under this request; preserve other settings.

Automatically planned visuals receive one short original Snap at their start,
with no sound at their end and no additional AI call. Audio layers may overlap;
original speech and every sound/music cue keep independent editable volume.
Anchored accents follow visual timing/removal and can be detached for manual
timing. Media → Audio additionally admits local-only YouTube sound URLs using
the existing two-minute/12-MiB import bounds. Hosted remains upload-only for
remote sound acquisition and rejects these routes. Preserve source-quality
exports, existing bounds, privacy, explicit actions and normal cleanup.
CL-137, CL-138 and CL-139 own sequential execute/validate evidence. Tests use
synthetic media/fake transports only; no paid/live/provider/download/cloud or
deployment verification is authorized. Owner listening/editorial/rights/device
and release acceptance remain open.

## Optional AI Hook suggestion — CL-136, 2026-10-29

The existing selected-clip planning response may recommend one source-relative
Hook range, at most ten seconds and contained in the clip. Gemini/Codex use
their existing call; no extra generation or automatic retry. Retain this as
optional metadata, never an automatically enabled Hook. Hook displays the range
with an AI sparkles badge and an explicit Use suggestion action. Choosing it
updates the draft; normal Apply/Discard and all timestamped edit-copying behavior
remain. Manual Hook controls work with or without a suggestion. Fake mode
supplies a varied stable simulated range, labelled simulated, without keys or
inference. Missing/bad optional data cannot veto usable paid plans or old drafts.
[CL-136](tickets/CL-136-optional-ai-hook-suggestion.md) owns implementation and
verification. Real editorial/AI quality and device/release acceptance remain
owner-only; no paid agent tests or deployment.

## Local Codex subscription provider — CL-135, 2026-10-29

The owner requests Codex for personal local real-mode clipping and Gemini for
the deployed app. Keep one fake/real mode and normal 3000/4000 UI; add a local
provider bridge using saved ChatGPT Codex login, local CPU transcription and
sampled selected-clip frames. No copied tokens, OpenAI API-key billing, hidden
Gemini fallback, second app or chatbot. Fake mode remains synthetic/key-free and
agent verification uses injected inference only. Real local Codex consumes plan
allowance and requires installed tools, login and explicit processing actions.
The existing paid-master off switch disables this provider too; never enable
or migrate owner configuration automatically.
Raw audio/video and generated pictures are not supported by the subscription
route; local speech supplies timestamps, unproven speakers stay neutral, sampled
focus is conservative and pictures remain manual. Hosted Gemini is unchanged.
The [design](architecture/LOCAL_CODEX_AI.md) and [CL-135](tickets/CL-135-local-codex-provider.md)
own bounds, setup, exact implementation allocation and evidence. This supersedes
earlier local Gemini-only composition, not hosted/live/spend/release controls.
No deployment or agent real-AI inference is authorized; owner acceptance stays open.

## One speaker per caption — CL-134, 2026-10-29

The owner simplifies Captions → Speakers to one selector for each full caption,
showing its complete text. Select the most frequent known anonymous speaker;
ties use the first known speaker in caption word order and entirely unknown
captions stay neutral. A manual change assigns every word in that caption.
Keep the full caption and speaker color stable throughout, preserving original
word IDs/timing, corrections, saved edits, colors and Hook repetitions. This
supersedes CL-128's per-word controls and mixed-speaker caption splitting.
No additional AI call. Fake captions/manual controls work without keys; actual
diarization quality remains owner-tested with provider keys/live approvals.

## Media and manual audio — CL-133, 2026-10-29

The owner expands Pictures into Media, retaining images and adding manually
placed sound effects/music. Pictures / Audio replace the active settings slot.
Use a small original previewable sound catalogue and bounded owner uploads.
Timed clip sounds inherit the Hook's repeated source range; Hook-only music
ends with the introduction and whole-video music continues over Hook/body.
Original speech is retained by default. Apply/Discard, saved drafts, shared
preview/export clocks and existing video/clip/revision limits remain. No
automatic sound insertion, AI music, remote sound URLs or general timeline.
The [design/research](architecture/MEDIA_AUDIO.md) and [CL-133](tickets/CL-133-media-audio.md)
own implementation, finite audio bounds and actual fake/API-free evidence.
Real AI remains separately key/live/approval gated. Owner listening/visual,
physical-device/rights/hosted/release acceptance remains open; no deployment.

## Responsive editing — CL-131, 2026-10-29

On phones and tablets, clip navigation is a horizontal touch-scrollable strip
immediately below the Review and edit clips title, with no visible scrollbar.
Use Left/Right/Home/End keyboard navigation and keep the selected clip visible.
Desktop retains the vertical left rail with Up/Down/Home/End. Both preserve
dirty-edit and readiness guards. Phones show a full-width, naturally tall
portrait preview, then controls in normal content scrolling. Keep the phone
footer compact, with an accessible reset icon beside the contextual actions.
Use concise visible phone labels while retaining full accessible names. Reset
failure recovery belongs in a dismissible popover anchored to that reset control.
Tablets use the freed width for a larger preview beside one coherent settings
panel. Preserve portrait aspect ratio, preview gestures and existing exports.
This supersedes the universal left-rail geometry below, not its state gates.
Local synthetic/fake checks need no keys; real AI still needs keys/live flags,
approvals and owner action. Owner visual/device/release acceptance is separate.

## Hosted eight-GiB scratch target — CL-130, 2026-10-29

The owner selects 2 CPUs / 8 GiB for the next hosted processing target and
authorizes local execute/validate with fake AI, synthetic media and zero paid
calls; no deployment or cloud change. Existing public 500 MiB / 20-minute
source bounds already constrain the long upload. Preserve three demo clips,
manual/AI duration bounds, native source height/cadence, CRF/preset/audio, twenty
export revisions, completed output/history and local owner limits.

Replace the historical 12 GiB scratch allowance with a 5 GiB admitted media
budget on a dedicated 5376 MiB temporary RAM volume (including the existing
256 MiB free-space reserve). At 8 GiB this leaves 2.75 GiB outside the volume
for processes/shared memory. Count actual retained preview/export/asset bytes,
reserve pending work and a single 2 GiB overlay workspace, and check additional
filesystem/cgroup demand without double-counting retained files. Fail before
dispatch when capacity is unavailable; do not delete old exports, reduce quality,
silently change clip limits or retry providers. Hosted startup must verify the
bounded mount and memory contract before any native/provider composition.

[CL-130](tickets/CL-130-hosted-eight-gib-scratch-budget.md) owns implementation
and produced evidence. Current Linux max-combination, actual hosted mount/CPU
lifecycle and owner real-AI/rights/visual/release acceptance remain separate.
The capacity ceiling is finite, as before; keeping twenty revision IDs does not
promise every combination of maximum-size retained files fits simultaneously.

## Speaker captions and manual hooks — CL-128/129, 2026-10-28

The owner requests caption colors keyed to existing anonymous transcript speaker
IDs, with manual word-to-speaker correction and text/background/highlight color
control under Captions → Speakers. Enable automatically for multiple known
speakers, fall back neutrally for unknown labels, and share preview/export logic.
Preserve word IDs/timing, preset behavior, saved edits and explicit fake-caption
generation (two simulated speakers); new fake clips still omit captions.

Then add a manual Hook tab: choose/capture a bounded segment inside the clip
(up to 10 seconds), duplicate it at the front and retain the whole normal body.
Both occurrences carry the same edits, audio and properly clipped captions.
Source-relative capture and presentation playback clocks must agree; preserve
original source quality/cadence and one final encode. No AI hook request is made.
These local/hosted editor features change no provider approval, trial quota,
native time/spend or cloud release gate. CL-128 then CL-129 own execution and
synthetic fake/no-key UI/native verification. Actual diarization/visual/live-AI/
release acceptance remains owner-only.

## Local capacity measurement — CL-125, 2026-10-28

The owner authorizes local Linux benchmarks starting at 2 CPUs/8 GiB and then
smaller allocations, using synthetic media, fake mode and no paid/provider
calls. Preserve production quality settings and the healthy normal app. Record
latency, memory/scratch and output equivalence before recommending capacity.
This authorizes no deployed resource change, cloud benchmark or release.
[CL-125](tickets/CL-125-native-resource-benchmark.md) owns the evidence and limits.

CL-125 exposed a Linux FFmpeg stall at camera zoom changes. Necessary prerequisite
[CL-126](tickets/CL-126-linux-focus-aspect-normalization.md) normalizes crop pixel
aspect before the fixed scale, preserving pixels, geometry and encoding quality.
Verify the rebuilt worker before resuming capacity comparisons; no cloud change.

CL-127 then corrects the observed five-minute implicit fetch headers cutoff in
the loopback worker caller, preserving its existing explicit 11-minute deadline
and the native worker's 10-minute budget. Use bounded loopback HTTP and retain
cancel/reap, fake/provider and resource gates; no budget or quality expansion.

Measured outcome: target 2 CPU/4 GiB for native processing. HD latency is similar
to 8 GiB, one CPU is 84% slower, and four CPUs speed heavy 4K with more allocated
CPU time. Direct HD and short-4K quality comparisons pass; sampled native RAM
peaks at 1.48 GiB. This does not approve a deployment reduction: first reconcile
the unchanged 12 GiB scratch envelope, slot/history/overlay reservations and
RAM-backed storage without reducing hosted/local behavior or output quality.
Full accepted maxima and owner/provider/release acceptance remain separate.
The [benchmark report](operations/HOSTED_NATIVE_BENCHMARK.md) owns actual evidence.

## Hosted free-demo limits — CL-114, 2026-10-28

Owner AFK authorization adopts the recommendation in
[CL-114](tickets/CL-114-hosted-three-clip-demo-and-durable-usage.md): hosted
visitors share three manual/AI clip slots, one source and one successful demo
per network address per rolling 24 hours. Reserve before work and consume on
first successful export generation, independently of downloads. Keep the active
session's editing/retry/export access and existing local owner limits. An empty
private backend environment IP allowlist permits owner quota bypass without
bypassing security or global processing caps. UI correction/toast and the exhausted entry view
supplement server enforcement.

A bounded private usage ledger (keyed address digests, no media or raw addresses)
is now required for cross-instance/restart accounting. This narrowly supersedes
historical process-local-only/no-durable-quota decisions. It is not a project
database. Global UTC-day ceilings are 20 admitted sessions, 100 provider calls
and 200 native jobs, including allowlisted use; charge before work, fail closed
without durable atomic storage or verified ingress. IP restrictions are abuse
friction, not guaranteed per-person identity or a monetary hard cap. The later
CL-122 authorization below permits only the named storage/IAM setup. Actual
ingress verification, provider acceptance and deployment remain separate gates.

Owner privacy correction [CL-115](tickets/CL-115-private-environment-owner-allowlist.md):
configure `HOSTED_DEMO_OWNER_IPS` only in the backend's ignored `.env.local` or
private deployment environment. Source examples stay blank; no owner address is
hardcoded or exposed in browser configuration. Missing/blank means no exemptions.

Owner follow-up [CL-122](tickets/CL-122-provision-private-demo-usage-ledger.md),
2026-10-28: retain the existing Cloud Storage design for the low-traffic demo;
do not migrate to Redis or Firestore. Authorize CLI discovery, one private
regional ledger bucket/object, exact backend storage permissions and bounded
storage verification. Preserve existing usage and private configuration. No
application revision/environment change, provider call, cloud compute build,
API enablement, push or deployment is included. Single-object rapid-write
constraints remain a known operational limitation, not a completed load proof.

CL-122 storage evidence: the dedicated private regional bucket and fixed ledger
now exist, with uniform access/public prevention and an exact-object backend
read/create/delete role. Actual source-adapter backend read/conditional update,
stale-write rejection, unchanged ledger content, anonymous denial and backend
list denial were verified. Private resource/configuration metadata stays outside
Git. Application environment/revisions and secret payloads were untouched;
hosted setting injection, ingress/AI/capacity and release acceptance remain open.

Owner deployment-preparation follow-up [CL-123](tickets/CL-123-hosted-deployment-preflight.md),
2026-10-28: inspect relevant live ingress/resource metadata, prepare current
secret-free production/Linux artifacts and offline synthetic proofs, document
actual gaps and stage/commit the scoped remaining work. No app deployment,
provider processing, cloud build/benchmark, API enablement or release acceptance
is inferred. Verified-IP flags require actual ingress evidence; owner real-AI
upload/export and maximum-capacity acceptance remain separate gates.

CL-123 current preflight evidence: both latest production/Linux images and
offline runtime probes pass. The stale Linux hosted fixture was corrected to
inject the existing synthetic usage port and identity, preserving native/editor
checks and adding export-consumes-trial denial; the proof passes with fake AI
and no external network. Fresh hosting metadata still shows one CPU/512 MiB and
throttled CPU. Actual received IP headers, maximum native workload capacity and
owner real-AI/visual/rights/release acceptance remain unverified; flags remain
disabled and no application deployment/configuration change has occurred.

Owner follow-up [CL-124](tickets/CL-124-verify-hosted-client-ip-and-enable-settings.md),
2026-10-28: authorize a short-lived authenticated diagnostic on the unchanged
frontend image, bounded probes through actual managed/custom-domain ingress,
forged-header checks, diagnostic cleanup and enabling the verified-IP settings
only after success. The prepared backend ledger setting may be injected then.
This narrowly permits the necessary diagnostic/config revisions, not a product
source release, resource/CPU change, cloud build, paid AI or public acceptance.
Stage/commit the scoped source fix if needed and truthful verification records.

CL-124 actual evidence supersedes the earlier unverified two-hop assumption:
native managed/custom-domain ingress appends one final observed client address.
The old helper rejected ordinary one-address requests and selected a supplied
prefix when present; real probes and focused tests reproduced it. The source
helper now selects the final address behind the verification gate. Corrected
real spoofing probes pass on both entries with the same coded identity;
direct unauthenticated private-backend identity spoofing is denied. Diagnostic
startup/routing/revisions are removed. Both verified-IP settings and the backend
ledger setting are enabled, with existing images/resources/identities preserved.
The fixed source is prepared for the next application release, not yet rolled
out as new app images; capacity/cost and owner paid-AI/release acceptance remain
open. Reverify the trust rule after any ingress/proxy/topology change.

## Upload-only intake spacing — CL-094, 2026-10-27

When YouTube intake is excluded, the single upload card uses the available
content width and remaining vertical space responsively instead of a narrow,
vertically centered 42rem column. Preserve readable minimum height, scrolling
on short screens, anchored card actions, and local paired-card geometry.
CL-094 owns the CSS and synthetic responsive captures; no mode/configuration,
provider, cloud or release permission changes.

## Manual text only and TikTok outline — CL-093, 2026-10-27

The owner reverses automatic top titles: new clips start with no independent
Text in fake, real local or hosted mode. Do not request/generate a title or
insert one from a moment/transcript fallback or saved preparation metadata.
Text is added explicitly through Add text. Preserve existing saved bases and
manual edits, captions, focus, pictures/fades and all retry/spend rules. This
supersedes only CL-087's title behavior; truthful stages and other defaults stay.
TikTok style defaults to outline width 12 for Text/captions; controls and preview/
export share that fallback and preserve explicit owner-saved widths. CL-093 owns
implementation and synthetic fake/paid-off evidence. No provider/cloud or Git
action, configuration edit or saved-media migration is authorized.

## Solid text panel and sliding captions — CL-092, 2026-10-26

Add an explicit Solid block typography preset: one continuous rounded panel
behind all text lines, with existing shared color/opacity/font controls and
caption parity. Preserve earlier line/highlight presets and saved appearances.
Add Sliding highlight caption motion that moves its background between spoken
words on the same line, using the same deterministic clock and actual logical
word geometry in preview/native export. Reset across lines/long gaps and hide
in silence. Keep word data, default TikTok style, existing animation modes,
resource/quality/retry rules and motion preferences intact. No new AI request,
font download, provider/cloud permission or deployment; CL-092 owns synthetic
UI/native verification and normal worker refresh. The linked TikTok video was
not accessible; the owner's screenshot and motion description define this task.

## Retired demo-sample entry — CL-091, 2026-10-26

The owner removes Use demo sample and the obsolete screen it opened. The current
upload/YouTube/editor workflow owns /start; source=sample no longer selects the
legacy screen. Remove the exclusively used wrapper/imports/styles while keeping
shared helpers, protected APIs and all retained/saved media. This supersedes
CL-028's demo-sample CTA requirement, without changing fake/real modes or any
provider/cloud/spend/rights/release permissions. CL-091 owns implementation and
synthetic verification; no paid call, environment edit or deployment is implied.

## Owner FFmpeg risk deferral — CL-090, 2026-10-26

After reviewing the SEC90-01 explanation, the owner directed that the issue be
documented and deferred for the current demo, with no additional remediation
work now and no interruption of fake-mode testing with paid mode off. The owner
cited the project's spend limit as context for this priority decision. A spend
limit is not a parser fix and does not prevent a processing crash; SEC90-01
remains unresolved, not remediated. No cloud/budget configuration was inspected
or changed to record this decision.

This is an explicit owner deferral, superseding any recommendation to hold up
current demo testing over this issue. Keep existing upload/resource/time limits
and the finding documented. Revisit remediation when requested or if exposure
materially changes. Other owner acceptance and release checks remain separate;
this does not authorize deployment, push, paid/provider testing or cloud work.
CL-090 and its current security report own the detailed follow-up.

## AI titles and preparation defaults — CL-087, 2026-10-26

Owner requests a short editable top title from the existing selected-clip AI
planning request, using CL-086 timed text with TikTok styling. New captions and
manual text default to TikTok style; new pictures default to fade entrance/exit.
Preserve accepted/saved bases and owner edits. Store completed title work for
explicit retries; a missing/malformed optional title cannot veto usable provider
results or cause another AI call. Preparation labels follow actual planning,
picture, caption and preview work, with no invented timed progress. Fake titles
are fictional, fake captions remain default-off and no Earth picture returns.
CL-087 depends on CL-086 and owns implementation/verification; no provider spend,
cloud access, configuration edit, deployment or Git action is authorized.

## Timed text and shared typography — CL-086, 2026-10-26

Owner adds independent clip-relative timed text in a Text editor tab. Bounded
plain-text layers (ten per clip, 500 characters/ten explicit lines each) support
content, start/end, positioning/resize and shared
typography with captions: font/size/weight/color/alignment, outline and background
color/opacity. Include TikTok style (white with black outline), Solid background
and Translucent background presets. Reuse existing local fonts; no font download.
Preserve caption words/timestamps and legacy styles. Text appears above pictures
and below spoken captions, using the same frame-driven preview/export tree.
Shared Apply/Discard, saved edits and explicit original-quality export apply;
no new AI/provider call, automatic export, cloud or deployment. CL-086 owns the
bounded contracts, controls, native parity and synthetic evidence. Owner requires
normal restart and verified fake mode before agent tests on this revision.

## Moment review cards — CL-085, 2026-10-26

Manual/AI results in Your clips form a retained processing list. Every card shows
its title, source range and frame-derived duration, with Jump to source playback
and Remove. Remove replaces Select/Deselect; it removes the card from the
current list without changing raw analysis or calling AI. Tabs preserve the list;
new/restored analysis starts with all unique results, manual-first. Keep usable
extra results visible and disable Process clips until at most ten remain; do
not silently truncate AI results or increase the processing limit. Empty lists
keep a disabled Process clips in the footer. Jump seeks/plays the existing source
preview at the cut start, with loaded/busy/error guards and no processing call.
Reuse shared cards/buttons/tokens and inspect long titles/responsive/keyboard
states. CL-085 supersedes CL-048's selection-toggle/default-truncation behavior;
its mutually exclusive views, retained inputs and explicit submission remain.

## Preview-first export decision — CL-084, 2026-10-26

The owner approved reducing production render work without changing AI or final
video quality: selected clips retain normal transcription/selection, AI framing,
picture planning/generation and shared editing, but first prepare only a
validated playback preview. Editing may open in review-ready with a measured
preview receipt and no final output. Initial playback still gates controls;
queued/preparing/exporting/canceling/failed/canceled clips stay non-editable.
An explicit Export creates the first finished MP4 using the unchanged renderer,
original source and source-quality profile; matching Download reuses it. Apply,
caption generation, navigation, restore and preparation retry do not auto-export.
Retain completed AI work across explicit retry. Legacy saved output-backed clips
remain compatible. CL-084 owns implementation/evidence; owner real-mode testing
is manual. Agent checks use synthetic media/injected AI only. No cloud access,
allocation/configuration change, paid request, Git mutation or deployment is
authorized. Cloud cost/allocation recommendations require separate approval.

## Manual clip duration — CL-081, 2026-10-26

New manual clips last 1–60 seconds, matching the AI duration setting's maximum,
in fake, real local and hosted modes. Reject longer submissions before provider
work and show an actionable limit error. Preserve saved analyses and existing
clips/exports; the broader physical media-resource allowance stays unchanged.
AI duration preferences remain advisory for returned usable provider results
under CL-060; this input limit adds no quality rejection or automatic retry.

## Fake-mode manual clip default — CL-080, 2026-10-26

Fresh fake-mode selection starts with Suggest clips unchecked; owners may enable
simulated suggestions manually. Real/hosted provider mode keeps Suggest clips
checked by default. Saved analysis restores its own preference, and navigation
preserves current inputs. This changes no capability, provider gate or paid path.

## Uploaded picture transparency — CL-079, 2026-10-25

Preserve transparent and partially transparent pixels in uploaded PNG/WebP
pictures. Normalize alpha-bearing uploads to bounded static PNG; opaque uploads
and legacy/generated JPEG assets retain JPEG compatibility. Trusted optional
format metadata flows through delivery, saved drafts and native export. Missing
format means legacy JPEG; editing cannot set it. The underlying video must show
through transparent regions, with no added matte or checkerboard. Existing
flattened copies require re-uploading the original transparent image; never
rewrite owner media or infer a cutout from the flattened pixels.

## Clip caption generation and text correction — CL-078, 2026-10-25

New fake-mode clips omit captions by a hardcoded default-off backend boolean;
fake analysis can still supply fictional moment/focus inputs. The fake adapter
permanently stops planning/generating the Earth picture. Preserve existing saved
content and manual/real pictures.

Locally, Generate fake captions sits beside Generate captions and restores the
fictional dialogue on demand with no key, provider call or paid-attempt charge.
Do not expose that action in hosted UI/routes. Its existence does not change the
default-off automatic caption policy.

Empty Captions offers Generate captions with an explicit audio-transfer/credit
confirmation. For this owner-authorized local action only, a configured Gemini
key may transcribe this clip's audio despite fake mode or paid master off. Never
change global settings or enable moment search, images, cloud or automatic paid
retries. Hosted generation retains normal provider gates and session budgets;
tests use injected fake ports and cannot construct real transports. Preserve
completed transcription, revisions and existing edits/exports.

Style/Position/Text share one caption inspector. Text edits individual words
with stable IDs and immutable timestamps, using Apply/Discard and the shared
preview/export compiler. No timestamp editing, word insertion/deletion or new
timeline. Keep playback updates in child controls and primary actions in the
persistent footer. Owner live API and personal visual acceptance remain manual.

## Confirm the person for a new position — 2026-10-25 owner revision

CL-076 supersedes CL-072's immediate/last-use insertion. Add position first opens
a person selector, defaulted to the highlighted camera row's person. The owner
may select another existing person or custom framing, then explicitly Add or
Cancel. Opening/choosing/canceling does not change the edit. Confirm inserts
directly below the highlighted row and selects its new editable time range;
per-person numbering remains chronological and updates dynamically.

Retain contiguous coverage by using the selected row's later interval, initialized
at a settled preview frame inside it or its midpoint. Same-person insertion copies
that row's camera; another person uses existing framing within that source shot
or their observation-based camera. Keep independent positions, original AI data,
CL-071 playback, Apply/Discard and native export parity. No extra AI/provider
request, schema, worker or approval change. CL-076 owns synthetic checks and
owner-manual visual acceptance.

## Large local upload transport — CL-075, 2026-10-25

The picked-video API `/api/local/open/video` streams directly through its owning
route/bridge; it is excluded from document nonce/header Proxy matching because
Next clones/truncates Proxy bodies at a default 10 MB limit. Do not solve large
local video intake by buffering full uploads or raising a global clone limit.
The existing route's same-origin/site/path checks, private caller verification,
hosted session/CSRF and backend byte/resource/media validation remain authoritative.
Document and adjacent-route Proxy coverage remain; hosted 8 MB chunks and upload
limits are unchanged. This is local transport correctness, not provider spend or
deployment authorization. CL-075 owns synthetic verification and owner retry.

## No footer mode/status badge — 2026-10-25 permanent owner decision

CL-074 removes the footer mode identity and disk icon in every mode: Fake AI,
Gemini, Temporary session, Connecting and AI unavailable. Do not restore those
badges or substitute another environment/provider status label in the footer.
This supersedes the older compact mode-identity design. Keep Start over and the
contextual workflow actions; actual mode, provider approvals and processing
gates remain unchanged. This is a display decision, not provider authorization.

## Visible footer reset — 2026-10-25 owner revision

CL-073 puts Start over directly in the shared workspace footer, including dirty
editing. It returns to fresh upload/YouTube intake locally and upload-only intake
when hosted, discarding current browser edits and clearing the session after the
existing protected cleanup acknowledges success. Processing/acquisition/pending
guards remain. A failed reset preserves the workspace and its retry/discard path.
Saved drafts/exports, downloaded sources and retained masters keep their existing
retention; reset does not purge the owner's saved library or alter configuration.
This supersedes the older compact-Session-menu rule for Start over. Keep the
other workflow actions contextual with one primary, shared controls and a
reachable responsive footer. No new dialog, provider call or backend policy.

## Independent camera positions — 2026-10-25 owner revision

CL-072 supersedes CL-069's linked/repeated-position editing and sibling Advanced
tab. Focus has Camera / People; Camera contains Timing / Advanced for the
selected person and position. Each timestamped camera row is an independent
position with its own framing and range, including rows with identical crops.
Drag and numeric corrections affect that position only. Keep every original
automatic row and all raw observations/decisions; this changes editor semantics,
not Gemini prompts or automatic switch/hold policy.

Add position appends the next chronological position for that person, selecting
its editable range. Delete/reassignment renumbers positions per person without
gaps. Initialize a new range from the last position's later interval and camera
settings, using a settled preview time inside it or its midpoint; never create
overlap, gaps or a zero-length interval. Existing Capture, complete coverage,
source-shot fences and bounded counts remain. Position selectors navigate to
that position's settings/time instead of copying another position's settings.

Retain CL-071's isolated playback clock and still source overview, shared
Apply/Discard, saved revisions and original-quality vertical export. Fake mode
can edit/export without keys; owner real-provider and visual acceptance remain
separate. CL-072 owns implementation and local evidence. No paid/cloud/deploy
or Git action is authorized by this revision.

## Export source-quality decision — 2026-10-25

The owner requires exports to always stay vertical while preserving available
source resolution/detail.
CL-070 corrects the use of a reduced portrait preview as final-render input:
final edited exports must crop from the original source and encode once.
Keep preview/AI proxies separate, original media and accepted edits intact.
Use a source-height portrait canvas with even-pixel codec rounding; native 9:16
portrait dimensions stay unchanged, and final output retains source frame rate
while existing edit/overlay timestamps remain on their 30 fps logical clock.
Reframing/zoom still crops or enlarges source content; never promise extra detail
or mathematically lossless edited MP4. Do not silently downgrade resolution to
fit capacity limits. Existing exports remain immutable; new explicit exports
use the corrected path. CL-070 owns verification and any remaining legacy-path
limitations. This authorizes local code/fake verification, not paid/cloud/deploy.

## Focus editor position UX decision — 2026-10-25

CL-069 implements the owner-approved direction with synthetic local verification: use
**position** for each distinct person framing, with every existing camera change
remaining visible in chronological order. Preserve multiple positions and
source-shot scopes; do not modify automatic observations, switch/hold behavior,
prompts or provider calls as part of this editor revision. Do not claim anonymous
person identity continuity across source shots.

Focus uses Camera / People / Advanced views in the existing settings slot.
People has Add/Remove, person/position selection and direct numbered-handle
positioning with one selected blue portrait outline, without detection boxes or
appearance timestamp controls. Camera owns chronological person/position rows,
start/end with left-preview Capture, split/remove and timing. Precise zoom and
horizontal/vertical percentages belong in Advanced. Distinguish edits to one
camera change from repeated uses of the same position; never apply a person's
correction indiscriminately across different positions/source shots.

Retain original AI data, validated frame clocks, existing saved-edit/export
parity and the shared Apply/Discard footer. Fake/no-key tests use synthetic
people; actual detection quality still requires owner-manual approved Gemini
processing. The ticket owns actual execution/verification evidence; this does
not authorize paid/cloud/deployment actions. It supersedes CL-068's visible
appearance-editing UX. CL-070 separately owns the export-detail correction.

## Automatic and manual person focus — 2026-10-25

CL-068: restore automatic portrait-fill framing to the shared normal editor and
native export. Start on a visible anonymous person or a provisional side crop;
hold the latest same-shot framing through uncertainty until another visible
speaker is supported. Real shot changes reset geometry; ambiguity alone never
widens to a letterboxed view. Extend the existing selected-clip video-planning
request, with no additional provider call or automatic retry. Keep usable AI
results despite quality critiques. Detection remains fallible and owner-manual
live acceptance is required.

Add Focus alongside the existing editor settings: anonymous observed presence
lanes, bounded editable camera shots, person selection/addition and an explicit
Remove action beside each person, center and zoom,
split/remove, reset and shared footer Apply/Discard. Preview, saved edits and MP4
use the same validated frame clocks and fill geometry. Preserve original AI
observations separately from manual overrides and existing paid work/drafts.
Safe aggregate diagnostics explain fallback, holds and switches without exposing
media or raw provider content. Fake/no-key synthetic checks cover controls and
native exports; no paid testing, cloud changes or deployment is authorized.

## Saved intake thumbnail sampling — 2026-10-25

CL-067: sample saved-video thumbnails at ten seconds, capped at the first quarter
of short videos, to avoid showing opening logos/blank intro frames. This is a
read-only local preview using the existing protected ranges; preserve the master,
offline behavior, silent playback and explicit Use video action. No remote
thumbnail lookup, native preview job or durable poster cache is introduced.

## Source transcription reuse — 2026-10-25

CL-066: completed, structurally decoded transcription is reusable within its
workspace, bound to source fingerprint, revision and AI mode. Changes to manual
ranges, AI count/duration or manual-only selection do not transcribe again.
Retain words before moment selection so explicit retries after selection failure
or cancellation reuse completed work. Selection still runs for each requested
AI discovery; never add an automatic provider retry or change model settings.
Existing saved analyses seed reuse after normal draft/source verification.
New checkpoints are session-local and cleared with workspace expiry, clear or
shutdown; no new durable cache, cross-session lookup or hosted retention.
Fake/no-key verification proves reuse and dispatch counts, not live AI quality.
Real processing still requires configured keys/live approvals and owner action.

## Loading-state presentation — 2026-10-24

CL-062: full-content waits use a centered branded animated treatment with a
readable stage title. Preserve the active content slot, responsive clip navigation,
readiness gate and persistent footer actions. Show determinate progress only
from measured work (for example acknowledged upload bytes). Queueing, Gemini,
native export and preview readiness stay indeterminate until a genuine metric
exists; never invent percentages, completion timing or phase weights. Motion
retains normal timing under all OS/browser motion preferences.

## Shared upload/editor release decision — 2026-10-24

CL-061 supersedes the earlier hosted read-only/no-editor product boundary. There
is one Next.js frontend, one Express backend and an internal native media worker,
with the same upload → moments → clips/editor flow. Caption styles/position,
picture controls/motion, filters, Apply/Discard, explicit retry and export are
part of the hosted product as well as local use. Only YouTube URL downloading
remains restricted to local use: do not render its intake or admit hosted lookup,
metadata, import, saved-link or acquisition endpoints. Upload remains independent
of downloader tooling and preserves access to the editor.

Hosted processing requires session-isolated temporary media, authenticated
frontend calls, browser origin/CSRF protection, abuse verification, fixed spend
and resource limits, cancellation and expiry cleanup. Do not expose the local
owner capability, filesystem library or agent controls to visitors. The editor
is shared, not a separate app or a second AI mode. Historical local-only gates
are implementation history, not the new release scope. This decision authorizes
code/document preparation, never deployment. Agents must never deploy for the
owner, and must obtain new explicit approval before any credit-consuming test.
Fake/no-key synthetic verification does not prove hosted Linux/live quality.

## Permanent Gemini acceptance decision — 2026-10-24

CL-060: local Gemini validation is critique-only. Never reject, suppress or hide
usable returned work for grounding/evidence, timing/order, duration/count/overlap,
or editorial/visual quality; emit safe critiques and continue. This applies to
all provider paths and their downstream duplicate quality gates, superseding
older semantic rejection requirements. Basic decoding, authentication/source
binding, bounded resources and media/executable safety remain. Physical render
clocks may be safely converted to the admitted source/clip without rejecting the
usable paid result. Preserve completed plans/assets/preparation across explicit
failed-clip retries; no automatic provider retry or unrequested paid regeneration.
Failed clips expose Retry clip in the persistent footer, including failure before
prepared data exists, with normal revision/idempotency/cancellation guards.

## Local workflow diagnostic coverage — 2026-10-24

CL-059 originally admitted usable transcript intervals individually. CL-060's
later permanent decision supersedes that filtering and sorting: retain all
decoded words and original order/times, with aggregate critique counts. Structural
decoding, identity uniqueness and bounded clip execution remain enforced. Timing
diagnostics contain no word text or exact intervals. The one-transcription/
one-selection limit remains; empty output skips selection. No automatic provider
retry is introduced.

CL-058: the normal local backend and its worker must retain content-safe failure
evidence across analysis, provider/native preparation, clip processing/editing,
export, persistence, streaming, cleanup and startup. Correlate operations with
generated request/job IDs, bounded stage timings and allowlisted error/rule/
system/schema classifications. Successful polling stays quiet; logging failure
never changes processing, dispatch counts, retries or cleanup. Generic browser
errors and all existing privacy/spend gates remain. Never log raw exception
messages/stacks, provider payloads, prompts, real media, filenames, paths or
credentials; local diagnostics must not activate private response capture.
Synthetic fake/paid-off tests establish logging behavior only. Real Gemini
acceptance remains an owner-triggered manual test with keys and approvals.

## Permanent application motion decision — 2026-10-23

The owner requires normal motion everywhere, including loading spinners, field
transitions and carousel navigation, under every OS/browser motion preference.
Remove all application reduced-motion CSS/JavaScript overrides and never
reintroduce them. Preserve normal inactive/completed-state behavior and leave
OS/browser settings unchanged. This permanent decision supersedes historical
fallbacks and instructions to reconsider suppression before release; it does
not claim accessibility compliance. CL-039 owns removal and verification.

## Focused local clip editing — 2026-10-23

CL-056: the collapsed editor should fit the available workspace on ordinary
laptop/desktop windows. Use that space to scale the portrait preview, remove
empty heading gaps and reduce excess control spacing while preserving readable
text, touch targets and the anchored footer. Resizing must not reload playback.
Expanded or intrinsically long/narrow layouts retain normal accessible scrolling;
never hide overflowing controls to make a fit claim. Navbar, intake and hosted
demo geometry remain unchanged.

CL-055: preview selection borders, drag targets and resize handles follow the
active setting: captions only in Captions, pictures only in Pictures, neither
in Filters. Actual caption/image layers and edits persist while switching;
inactive guides cannot capture input. Tab switching never reloads the video
or starts processing, AI or export work.

CL-054: desktop clip switching uses a vertical left rail, with Up/Down/Home/End
keyboard navigation (CL-131 owns phone/tablet geometry), and the existing
dirty-edit guard. Editing is visible only after a
clip reaches ready/validated-revision with prepared data and a completed output,
or CL-084 review-ready/validated-revision with a validated preview receipt;
queued, preparing, exporting, canceling, failed or canceled clips never expose
settings, even when retaining an earlier base/output and even with fake AI.
Initial preview loading shows a spinner before settings/handles are exposed;
initial failure offers retry. Later playback failures preserve dirty settings.
Keep state changes in the same content slot and relevant actions in the footer.

Latest owner audit (CL-050–053): selection and editing are separate exclusive
screens in the same app. Editor shows one clip via clip tabs, one settings panel
and a contextual footer with one primary plus Add more clips (dirty edits use
Apply / Discard instead). CL-073 moves Start over directly into the footer;
other session actions retain their compact placement. No appended
selection disclosure, success narration or permanent export-history section.
Captions support direct manipulation and exact quarter/center positions, local
social typography and frame-driven word animation. Pictures support multiple
manual uploads, clip-relative timing, entry/exit motion and direct placement.
Fake AI uses a fictional conversation and a credited bundled sample photograph,
never source transcription or provider-generated imagery. Shared composition
preserves preview/export parity, optional schema compatibility and fixed provider
budgets. Full audit/ordered acceptance is in CL-050; execute then validate each
packet sequentially. This authorizes local code/tests only, no paid/cloud/Git or
deployment action; real provider checks remain owner-only.

CL-049 contains local native-video failures inside the existing portrait preview
with a concise explicit retry. Preserve dirty settings and the paused playhead;
retry remounts playback only, without AI, processing, export or clip reload.
Handle expected media events before dependency logs can activate the developer
overlay, and provide a render-error fallback. Existing invalid-overlay recovery
and provider/runtime gates remain unchanged. CL-049 owns diagnostic/proof evidence.

Permanent owner view rule (CL-048): successive form/result stages replace their
content slot using mutually exclusive views or tabs; never append a complete
second workflow below the form. Local selection uses Add clips / Your clips.
CL-085 updates successful/restored analysis to retain all unique results,
manual-first, with Jump to, duration and Remove on each card. Remove extras to
meet the existing ten-clip processing cap. Tab changes retain inputs and the
current list without processing; edits invalidate stale results. Add clips owns
Find moments / Use clips in the footer, Your clips owns Process clips (disabled
for an empty or over-limit list). Processing still requires an explicit click.
Reuse the settings-tab materials and keep one panel visible with keyboard navigation.
AGENTS.md records the durable rule; CL-048 owns verification.

CL-047 extends the whole-second manual clocks from CL-046: carry overflowing
seconds/minutes on blur and submission (00:00:90 → 00:01:30;
00:90:00 → 01:30:00). Preserve partial typing and existing precise restored
endpoints until individually edited. Typed times retain source/range validation.
Each Start/End has a concise inline Capture action that reads the actual
source preview playhead, floors to whole seconds and stays within loaded source
bounds. Loading, seeking, failed and busy previews cannot overwrite fields.
Capture changes only that endpoint and invalidates stale selections; it never
seeks the video, submits processing or needs AI/API keys. CL-047 owns evidence.

CL-045 removes the Save draft option/status polling and unnecessary explanation,
provenance/call counters and success narration throughout selection and editing.
Keep concise labels, relevant errors and a compact fake/live identity. Existing
saved drafts/reopening/autosave and retained sources/exports remain intact; do
not silently create new durable projects. Picture timing is presented in seconds
while preserving internal frame alignment and validation. CL-077 adds Capture
beside each picture endpoint, reading and pausing the settled clip preview without
seeking. Start uses that frame; exclusive End includes it. Invalid ordering leaves
the endpoint unchanged; loading/seeking/failed/busy previews cannot capture.
Only the selected picture changes, through the existing Apply/Discard/export
path. Capture needs no AI/provider call and preserves CL-071 playback isolation.

Permanent owner rule: proceed and submit actions belong in the relevant footer.
Use the persistent workspace footer for Find moments/Use clips, Process clips, Apply
changes and Export/download, showing context-relevant actions and preserving
busy/dirty/stale/cancel guards. Intake retains anchored card footers. Selection
and field-specific tools remain with their controls. Closed selection panels and
inactive editors must not expose submit actions. AGENTS.md records this rule;
CL-045 owns desktop/phone, interaction and cleanup evidence.

The owner requires a compact clip picker and one selected clip's editor. Display
one settings category at a time using Captions, Filters and Pictures tabs. Keep
the preview beside the inspector on desktop and stack them on phones. CL-050
replaces the former source/moment disclosure with a separate selection view,
retaining state without appending another workflow above the editor.
Preserve unapplied edits across tabs and protect them when switching clips.
CL-034 owns this presentation revision; processing, storage and fake/live gates
remain unchanged.

## Two-state YouTube intake — 2026-10-23

CL-044 keeps a rotating “Opening…” indicator in the Use video button while a
saved source opens. Keep controls disabled until the next step mounts, restore
the action on failure and require explicit retry. Preserve the card/footer and
preview; no fabricated progress or extra status section.

CL-043 shows a still-frame preview for saved choices using the selected local
master and the existing preview-row design. A protected same-origin range route
validates the exact saved destination/variant and master integrity, returns at
most 512 KiB per request with no-store, and creates no workspace or media copy.
The browser seeks a paused/muted frame and releases its request on change or
unmount. No YouTube, image metadata, native-worker or AI call is needed. Existing
records remain compatible: use “Saved video” without an ephemeral title; do not
persist new content. Read/decode failure retains a stable icon and explicit Use
video. Stable card bounds, bottom action alignment and normal motion still apply.

CL-042 admits nominal 24/30/60 fps metadata for the matching measured NTSC rate
and less than one second of quantization in whole-second duration hints. Retain
tight fractional-hint and audio/video clock checks, exact format/codec/dimension
binding, bounded processing and lossless remux. Save the measured clocks and use
the same frame-rate comparison for offline source admission. Only finite fixed
diagnostic codes may cross the local worker/coordinator boundary; provider stderr
and raw errors remain private. Real transfer verification with fake AI does not
prove Gemini processing or change the owner-only paid gates.

CL-041 requires shared header/body/footer geometry for both intake cards. Anchor
paired actions on one bottom row, align sibling footers, and scroll only the body
when space is constrained. Present the selected video as one coherent landscape
media row with readable title and quality. Active transfer/preparation replaces
the resolution controls in their existing slot; it must not append a new section.
Use the shared blue, rounded Progress primitive, measured byte fractions only
when the transfer total is known, and indeterminate activity during unknown or
preparation stages. Keep cancel in the footer; terminal failure/cancellation
restores quality selection with concise feedback. Inspect every state on desktop,
tablet and phones. AGENTS.md records this durable design guard.

CL-040 narrows the local picker to one supported English-audio choice per
resolution from 480p through 1440p (2K), including regional English tags. Apply
the same filter to saved copies, reuse an available saved tier, remove Best and
require an explicit offered choice for new downloads. Unknown language is not
assumed English; never substitute a hidden quality or track. Preserve server
format ranking/admission and exact import identities. Use the shared glass
tokens, inset chevron and native select semantics. Reserve responsive card height
across URL/loading/resolution/error/progress states; keep overflow actions reachable.

The owner explicitly authorizes a small selected-video thumbnail/title in this
local card. Bounded projected title/identity stay in ephemeral offers/UI; a
protected same-origin endpoint returns memory-only JPEG bytes from the fixed
`i.ytimg.com/vi/<admitted-video-id>/mqdefault.jpg` path (five seconds, 256 KiB,
no redirects, no credentials/cache). This is a narrow display exception to the
earlier title-free projection, not permission for content logs, durable metadata,
arbitrary URLs or renderer assets. Saved/offline reuse starts no preview request.
Missing images degrade to an icon. Only overflowing titles scroll; the full text
remains accessible. No motion-preference suppression is allowed.

The owner requires a compact URL-entry → resolution-selection card. Continue may
perform local saved-source lookup followed by offered-quality retrieval without
an intermediate metadata button. The explicit Download action remains separate.
Ready saved sources use the same picker offline; More resolutions is an explicit
online request when needed. Remove source-management/save-location controls and
save new sources under Downloads/ClipBuilder automatically. Preserve variant
validation, retention, cancellation, fake/live separation and the existing design.
CL-032 owns this revision and supersedes the extra quality-request UI step below.
CL-038 keeps the full URL card mounted through initial connection, with a compact
spinner and disabled input until capability/workspace restoration finishes.
Readiness changes control availability without swapping card layouts.
CL-039 runs capability/workspace restoration concurrently while preserving that
complete readiness gate and fresh local runtime ownership verification.
CL-037 corrects the local metadata boundary: up to 1,000 raw formats can expand
into at most 10,000 exact video/audio choices. These are separate bounded limits;
unsupported choices and original quality/track selection remain explicit. This
changes no source duration/size, dispatch budget or public workflow.

## Picker-based saved-material reuse — 2026-10-23

The owner removes the permanent saved-draft and saved-video sections. Keep the
same upload-or-YouTube intake. Choosing a registered draft JSON or a video whose
bytes match saved draft material should reopen the saved work and existing
exports without AI/acquisition/rendering. Choose the latest saved matching draft
for video matches, preserving the matched clip when identifiable. Unknown video
bytes use normal intake; unknown/damaged draft references fail without hidden
reprocessing. Keep compact saving/status controls in the editing flow. CL-029
owns this revision; saved media retention and configuration/spend gates remain.

## Local workflow design correction — 2026-10-23

The owner requires the existing demo's design quality and interaction hierarchy
for the local extension. Intake offers upload or YouTube link in two columns on
desktop, stacked on phones. CL-028 originally added a local-only **Use demo
sample** CTA; CL-091 retires that CTA and its obsolete screen entry. Saved
sources/drafts stay secondary.
Apply the existing navy glass surfaces, shared controls, typography and responsive
spacing through selection and editing. Local functionality is part of the normal
demo flow and is not an exception to its design principles. CL-028 owns this
presentation correction without changing processing/configuration or permissions.

## Same application, local editing extension — 2026-10-23

The owner explicitly rejects a separate owner application. Move the implemented
local controls into the existing `/start` flow, normal Next frontend on 3000 and
normal Express backend on 4000. Normal backend startup loads its existing
`apps/backend/.env.local`; Next retains its normal frontend env loading. No
second UI, separate configuration source, owner launcher or owner provider mode
remains. The backend starts/drains the private local media worker internally;
that implementation detail creates no additional user setup or UI. The ordinary
FAKE_MODE/PAID_DEMO_ENABLED/Gemini settings govern the same application. Keep AI
fake/paid-off for the requested local walkthrough and enable actual YouTube
acquisition independently. Local extensions are active only for APP_ENV=local
and loopback callers; hosted execution retains the existing demo. No deployment,
paid processing, cloud change or Git action is authorized. Preserve all saved
media/drafts/exports/captures/logs and keep imports inert. This supersedes the
standalone-app, 4100, owner-command and process-env-only decisions below. Execute
CL-027, then perform the explicitly requested validate pass and fix findings.

## Historical standalone downloader activation — 2026-10-23

The same-application decision above supersedes the launcher/command details in this historical evidence. Downloader behavior and independent fake AI remain.

Default-startup follow-up: the owner explicitly requests downloading as a normal
local capability, without a separate YouTube startup command. `owner:start`
and `owner:start:provider` now select the existing real acquisition option;
`owner:start:youtube` remains a compatibility alias. The separately named
`owner:start:synthetic` preserves synthetic acquisition for isolated tests.
This supersedes the opt-in command/default-synthetic decision below. Starting
still makes no source/metadata request: the owner enters a link and explicitly
requests offered qualities/Import. AI keys, mode and paid approvals remain
independent; normal fake AI stays fake/paid-off with no API key or gcloud.

The owner explicitly requests real local YouTube acquisition while AI remains
fake/paid-off, and removes per-source permits for this private feature: accept
any supported video link the owner enters. This supersedes the earlier CL-022/
CL-023 composition-owned source-permit gate. The owner also explicitly confirms
removing the UI rights/method checkbox after the automatic review rejection.
The protected, deliberate metadata/Import actions remain; no source registry,
per-source permit or acknowledgement is required.
Implement a deliberate `--youtube` launcher option, separately prepared pinned
tools and the existing protected metadata/Import actions. No allowlist of source
IDs, provider key, paid/API approval or gcloud service is required for downloads.
The test-specific synthetic launcher keeps synthetic acquisition. No account/cookie/DRM
bypass, automatic retry, public route/build exposure, paid AI or cloud work is
authorized. Agent verification stays synthetic/offline; real download acceptance
waits for an owner-chosen link. Tool preparation is authorized by this request.

Implementation evidence: explicit local startup reports real acquisition with
synthetic AI and cloud false; pinned tools, offline versions/generated-options
parser, Downloads resolution and clean shutdown pass. All 1,630 unit tests,
nine native synthetic proofs, the five repository gates and public artifact
exclusion pass. Actual YouTube transfer/challenge compatibility, real provider
quality and owner visual/manual acceptance remain unperformed. See the
[CL-023 follow-up ledger](tickets/CL-023-import-approved-high-quality-linked-source.md#follow-up-changes-and-verification--2026-10-23).

## Additional owner controls — 2026-10-22

Owner correction — 2026-10-23: manual cuts reserve their canonical frame intervals
before discovery. AI suggestions must share zero frames with them, including
duration padding, and cannot bridge a reserved interval. Adjacent cuts are valid.
Keep the full transcript for context, send structured exclusions to discovery and
enforce them on returned results in both fake and provider modes. The requested
count means additional eligible AI moments from the remaining video. Preserve
manual cuts, return an honest shortfall and skip selection when no remaining
contiguous window fits the minimum. No automatic retries or added provider calls.
See [CL-057](tickets/CL-057-reserve-manual-clips-before-ai-discovery.md).

The owner requests an independent count of 1–10 additional AI suggestions
(default four), keeping manual ranges and AI min/max duration separate. This
supersedes the owner-only four-suggestion ceiling; ten selected clips and the
one-transcription/one-selection budget remain. Report a shortfall if fewer
grounded moments qualify, with no automatic retry or invented content.
Caption customization adds fixed local fonts, independent animation and
24–120px size alongside existing colors/geometry. Small adjustable source-video
looks are local deterministic edits. See
[CL-026](tickets/CL-026-expand-local-discovery-and-presentation-controls.md).
These changes use the same real/provider-neutral workflow and fake simulations,
with zero-spend agent validation. Public behavior and live/paid approvals stay
unchanged; actual YouTube composition remains the separate CL-023 gap.

## Owner AFK implementation authorization — 2026-10-22

The owner adopts the complete recommended local limits, Save draft once followed
by local autosave, and yt-dlp/FFmpeg design in the
[decision set](research/LOCAL_OWNER_WORKFLOW_2026-10-22.md#proposed-decisions-for-owner-adoption--2026-10-22).
Execute CL-017–CL-024 one dependency-ready packet at a time, implement/validate/
fix/revalidate until no actionable findings remain, then stage and commit the
ticket before continuing. Do not ask routine questions while the owner is AFK;
choose the documented recommendation and record decisions/evidence. No push.

All agent verification is fake/paid-off, synthetic and zero-spend. Do not read
credentials, run provider/cloud/real YouTube processing, deploy or incur charges.
Real/live activation and owner media/visual testing wait for the owner. Add
CL-025 for that manual walkthrough and trial/fix/retest feedback. The local
retained master exists and is readable without ADC; that readability check did
not authorize using it as an automated fixture or changing it.

Adopt one source up to 60 minutes/10 GiB, supported SDR up to 4K/60fps, ten manual
1–300-second ranges, up to four independent AI suggestions, ten selected clips,
one heavy media worker by default, one downloader/provider request, portrait
1080×1920/30fps outputs up to 1 GiB, 20 GiB scratch and a 10 GiB free-disk reserve.
Two native workers require a later resource proof. Saved-source storage warns at
50 GiB and never automatically deletes completed sources. Native limits remain
targets to verify, not evidence of achieved capacity or approved higher AI spend.

Persistent local drafts may retain validated transcript/candidates, composition,
edits and normalized pictures after the owner explicitly saves that draft; no raw
provider responses, credentials or old capabilities. Source/draft/export areas
are separate under OS Downloads/ClipBuilder, outside Git; scratch stays OS-temp.
No automatic expiry of saved inputs/drafts/exports and no app cloud sync. This
local exception does not widen public contracts, restore diagnostic replay,
create accounts/database/history or authorize cloud media storage.

Physical isolation uses separate `owner/` trees within the existing apps and
packages, independent local build outputs, and a local frontend artifact served
by the local backend on 4100; the private local media worker uses 4200. No cross-
app imports. Public source/build/container graphs exclude these trees. See
[local architecture ADR](architecture/LOCAL_WORKFLOW.md).

This authorization supersedes planning-only language in the records below solely
for this local fake-tested implementation track. Current fake mode needs no
keys/ADC and uses synthetic AI results; API-free local native encoding is a
separate capability to verify. No offline AI model/weights are added.

CL-018 local evidence: multiple manual 1–300-second ranges coexist with
independent fake discovery under 10–60-second AI bounds, including exact 30/60
seconds. Revisions freeze each request; invalid input dispatches no work.
Frame-normalized physical cuts preserve manual requests and source clock;
synthetic native proofs cover VFR/offsets, silence, fractional endpoints and
900/1,800-frame outputs. At that initial checkpoint the owner composition had no live AI adapter;
provider keys/flags/approvals and owner-only real timing/editorial acceptance
remain necessary. Saved drafts and presentation editing follow in later packets.

CL-019 local evidence: one action prepares up to ten independent clip bundles
and runs a serial native work list. Three synthetic clips (two manual, one AI)
produce distinct 30/60/300-frame MP4s, with immutable prior exports, per-clip
cancel/re-export and review while siblings progress. One heavy worker is the
adopted fallback; two-worker capacity is unverified. Shared owner React overlays
run in both preview and a fixed transparent raster page using installed Chrome,
then pinned native FFmpeg encodes the result. The raster listener binds only
loopback, serves no source video, and drains with its browser and scratch.
CL-020 supplies the caption/picture controls and saved drafts below. These checks
use fake AI and no keys/ADC; they establish native mechanics, not real AI/editorial quality.

Owner real-mode compatibility clarification (2026-10-22): fake execution must
exercise provider-neutral domain/media paths. The owner requested a revisit of
CL-017–019 after CL-019 and before continuing. Domain results carry explicit
synthetic/provider provenance and generic attempt counts; unknown/mismatched
execution modes fail closed. Planning receives stable source/clip identity and
timed words; picture generation receives a validated grounded contextual brief.
Provider-shaped test doubles preserve their supplied words, timing and
generated-image provenance through the same pipeline. Image bytes are
independently normalized before admission. These metadata values cannot enable
providers: the default owner entrypoint remains strictly fake/paid-off. Real
adapter composition and local preparation for provider inputs must be reconciled
before claiming real-mode readiness; flags/keys alone do not implement it.
No live call is authorized.

CL-020 local evidence: immutable automatic bases now accept version-1,
revision-checked presentation edit documents. Caption presets, bounded geometry,
colors/alignment and up to three picture cues compile through one shared pure
contract function for browser preview and native export. Personal JPEG/PNG bytes
are inspected and normalized locally with owner-supplied provenance. An active
render keeps its admitted snapshot; edits create a later revision and older MP4s
remain immutable. Reading, applying edits and resetting dispatch no AI work.
Explicit Save opts into a version-1 local draft, then acknowledged changes
autosave. Downloads/ClipBuilder keeps separate Sources, Drafts and Exports;
source masters and exports survive draft deletion. Atomic documents retain one
validated last-good backup; damaged bytes prevent restoration. Restored valid
bundles can be edited and re-exported with every AI adapter absent. This adds no
offline speech model. The later provider handoff below supplies actual local
input preparation/composition; owner real-media acceptance remains separate.

CL-021 local evidence: a separately bundled stdin-only agent CLI uses the same
protected host and edit/export coordinator with the browser closed. Safe
projections expose IDs, revisions, style/geometry, assets and status without
dialogue, media paths, full edit documents or transport capabilities. Validation
is a dry run of the same edit compiler; repeated operation IDs remain
idempotent and concurrent revisions conflict. Explicit local pictures are
authorized against a clip before bounded file access. The fixed private
OS-temp discovery record is published only after both services are ready;
path, age and current process identities are checked before resolving its
capability. Shutdown withdraws discovery before draining/removing scratch.
An open browser observes CLI changes, preserving dirty controls until explicit
reload. Synthetic headless native export/cancellation and UI synchronization
are verified with fake AI and no keys/ADC. Real frame inspection/quality and
automatic real provider readiness remain owner-gated.

CL-022 decision: proceed with CL-023's fake/synthetic importer implementation
using exact yt-dlp format identities, a constrained HTTPS broker, lossless
supported-stream MP4 remux and durable local source sidecars. Real retrieval
has no source-specific permission/access/tooling evidence and remains
unavailable until the owner's later explicit cleared-source action. Best
available ranks before compatibility filtering; unsupported higher quality
stops instead of silently falling back. Offline saved-source validation/reuse
precedes downloader readiness and every metadata/network/provider check.
The [acquisition ADR](architecture/LOCAL_SOURCE_ACQUISITION.md) pins yt-dlp
2026.10.21 and revises the earlier Node challenge-runtime recommendation to
Deno v2.9.8: the reviewed Node 22/24 child lacks network denial, while the
reviewed Deno child runs without network/filesystem grants. Application Node
is unchanged. Published hashes are recorded, but no tools were downloaded,
installed or executed. Broker/tool/runtime compliance, source/method rights,
maximum capacity and actual quality/latency remain owner-only unverified gates.

CL-023 implementation: the isolated fake entry now supports link lookup,
explicit offered-quality inspection, exact selection and a host-owned background
import into the ordinary range/discovery/multi-clip/editor flow. Fake offers
generate a complete 16-second source at actual 720p/1080p/2160p dimensions; they
never download the linked video. Native proofs also cover portrait and lossless
VP9/Opus remux/browser decode. Saved masters/strict private sidecars live under
the OS-resolved Downloads library or an explicitly chosen Desktop library,
outside Git. Alias lookup and a URL-free chooser validate/reopen intact saved
bytes before any acquisition/provider gate, including with those ports absent
after restart. No refresh/clear/render automatically reacquires a source.
Source deletion requires an empty workspace and protects shared/draft-backed
masters. The separate yt-dlp/Deno adapter and public-IP-pinning CONNECT broker
are implemented/tested with synthetic process/network ports but remain
uncomposed; no actual binaries, source clearance or retrieval were tested.
All five root gates, five native proofs and public artifact exclusion pass.
Real source quality/access/capacity, actual tool/runtime/proxy compliance and
owner live AI activation/acceptance remain separate CL-024/CL-025 checkpoints.
See the [local source guide](../apps/backend/local/SOURCE_ACQUISITION.md).

Owner provider handoff follow-up: the local owner host now has a separate,
explicit provider launcher and composed adapters using the existing Gemini
Files, transcription, selection, contextual planning and image-generation
primitives. Full-source audio is mono 16kHz AAC at 32kbps; a selected clip is
physically trimmed and normalized into an upright 12fps/640-pixel H.264 proxy.
Each proxy has a hard 16MiB cap and a receipt-checked digest/duration before
transfer. Native synthetic proofs cover 60-minute audio, 300-second video,
rotation, fractional/source clocks and cancellation. Owner transcription admits
up to 30,000 words without truncating at the public 12,000-word default; owner
selection considers up to fourteen proposals before independent domain fitting.
Public defaults and request contracts remain unchanged.

The provider launcher requires explicit local/development mode, paid-on and
`OWNER_PROVIDER_APPROVED=true` plus the key and individual transfer/image/project/
spend approvals. Missing optional prerequisites expose unavailable AI rather
than synthetic results. Nothing here authorizes activating it during agent work.
The normal fake launcher stays API-free and paid-off; the native worker receives
no provider credentials in either mode. No public/cloud media composition,
ADC, remote renderer, sample reader or downloader is introduced into this entry.
Protected runtime capabilities drive current UI labels while saved bundles keep
their original provenance. Manual CLI editing/export requires no AI configuration
and cannot invoke analysis or planning. Remote Files cleanup is scoped to the
workspace and must drain before its local inputs are removed. Real provider
behavior, cleanup confirmation, latency and visual acceptance remain owner-only
CL-025 checks; no offline AI weights or real provider tests are supplied.

CL-024 combined evidence now extends one synthetic source through exact 30/60
and variable discovery policies, three independent native clip exports,
caption/personal-picture revision changes, headless CLI edits and draft reopen.
A separate native handoff proof uses actual local provider-input preparation
and receipt-checked reads with injected Gemini-shaped transports, then native
edit/re-export. Public request/route negatives and strengthened artifact markers
protect the deployed boundary. Resource observations include real process/disk
samples and in-flight native cancellation; they do not establish worst-case
capacity, two-worker responsiveness or real-provider quality. The
[operator workflow](operations/LOCAL_WORKFLOW.md) and
[CL-024 ledger](tickets/CL-024-verify-local-owner-workflow-and-build-exclusion.md)
keep file-based evidence, synthetic linked-source reuse and still-unperformed
real YouTube/provider/owner acceptance distinct.

## Owner local workflow planning instruction — 2026-10-22

The owner requests research and fresh tickets for personal local-only controls:
multiple exact timestamp ranges in addition to independent AI discoveries;
minimum/maximum AI clip duration, including exact-length requests, without
overriding manual ranges; processing several selected clips from one source;
post-edit caption style/position and picture replacement/placement controls;
owner-supplied pictures; and agent access through the existing chat. The owner
also requests research into using a YouTube link at the best available quality
without manually downloading it. The owner's later clarification explicitly
requests a background download inside the local app, defaulting to the highest
accessible source resolution with a choice of offered resolutions. The normal
flow requires no external downloader UI, manual merge or re-upload. Resolution
choices must not silently downgrade. Existing applications and upstream adapter
source establish a technical precedent; ClipBuilder compatibility and per-source
availability remain untested. **This instruction authorizes planning only.
Do not implement, launch, install tools or process media from these packets until
the owner explicitly requests implementation.** Earlier execution authorizations
do not authorize this new local extension.

The [CL-017–CL-024 local track](tickets/README.md#local-owner-workflow-execution--2026-10-22)
and [dated research](research/LOCAL_OWNER_WORKFLOW_2026-10-22.md) capture the plan.
These owner requirements are a scoped local extension; the deployed visitor
product retains one selected 10–60-second clip, fixed automatic presentation and
one final download. Existing no-editor/no-batch/no-platform-download rules remain
the public contract. No hidden public route, client flag or widening of public
schemas may expose the proposed local controls.

The owner further requests successful downloads be saved outside Git, preferably
in Downloads, and reused rather than repeatedly downloaded. Plan the OS-resolved
Downloads folder with a private ClipBuilder source subfolder as the default;
Desktop is an optional explicitly chosen destination. Do not create either now.
Saved source masters and minimal reuse metadata survive workspace close, app
restart, expiry and repository cleanup until explicitly deleted by the owner.
Processing scratch remains disposable. A repeated link/resolution uses a validated
saved file first; missing/damaged files or an explicitly requested new quality
have a separate acquisition action. Durable source retention does not authorize
retaining transcripts/editor drafts, a database or hosted source storage.

Planning review clarification: this owner track requires local native media
processing/storage with no public-hosted API, Cloud Run renderer or cloud-storage
fallback. Provider AI remains separately disclosed and gated; local-only does not
claim an offline AI model. Saved-source lookup must precede online format checks
and work without keys/paid/cloud readiness. A simple saved-source chooser and
repeated links both reuse the validated local file; later AI/export failures do
not force a download. The agent command path must also work with the browser UI
closed. File-based acceptance alone cannot close the gated YouTube requirements.

Local build isolation, editor-draft retention, native compute readiness, resource
ceilings and the acquisition implementation remain proposed designs with explicit
gates in CL-017/CL-022. A local UI currently still uses cloud media compute; genuine
local encoding needs its own runtime proof. URL analysis does not supply a
renderable master, and automated ingestion would still transfer media internally.
No guaranteed original-quality/instant/transfer-free YouTube workflow is claimed.
Do not restore retired sample replay or read diagnostic captures as input. Actual
downloads, saved files and new runtime data wait for implementation authorization;
today's change only records the owner's intended local retention behavior.

Current fake mode needs no keys and uses synthetic results; it does not establish
the new features or real MP4/AI quality. Real AI needs provider keys, enabled flags
and rights/transfer/spend approvals, with paid testing owner-only. No local AI
weights/runtime, paid test, cloud action, deployment or Git mutation is added.

## Owner Cloud Run deployment instruction — 2026-10-07

The owner reports hosted preview/export missing contextual pictures and requires
the complete existing upload-to-export functionality in deployment. The approved
Gemini image fallback must compose in protected, explicitly approved production,
as it does locally; preview/test/fake/paid-off composition remains closed. Safe
feature metadata must report available real assembly/framing/visual capabilities.
Preserve the fixed call bounds, private logs, real challenge/caller/origin checks
and normal local operation. This enables existing product behavior, not new
features. Real paid testing remains owner-only. See the
[CL-015 correction](tickets/CL-015-deploy-validate-measure-and-rollback.md#owner-full-hosted-functionality-correction--2026-10-07).

The owner separately requests hosted paid-mode activation for one manual
walkthrough using the managed frontend URL while custom TLS is pending. Preserve
local functionality by admitting the exact local origin plus one configured
hosted origin at the private renderer, with matching disposable-bucket CORS and
per-upload origin binding. Verify the matching images/configuration before
activation; no agent processing is authorized. This does not mark the paused
general public traffic/direct-origin review or owner paid acceptance complete.

Domain attachment correction: the owner confirms the purchased and sole public
hostname is `tryclipbuilder.com`. This supersedes the earlier `tryclipbuilding.com`
spelling. Keep exact origin checks; the old spelling is not an alternate origin.

The owner reports the complete local paid flow working, authorizes file-level
CL-015-prefixed staging/commits and frontend/backend Cloud Run deployment, and
requests an owner guide for the Cloudflare-owned `tryclipbuilder.com` domain,
Turnstile and post-deployment tasks. This supersedes the preparation-only hosting
exclusion below. Start hosted verification paid-off; preserve private API/renderer,
canonical local setup, all content-safe backend diagnostics and the existing
functional flow. Public paid enablement still requires closure of the recorded
native FFmpeg and hosted abuse/secret/origin gates. Agents never run a paid flow
or read ignored local secrets. The owner's local walkthrough does not prove
deployed challenge, cleanup, cost or rollback. Fake/no-key checks are synthetic;
real operation needs provider/cloud configuration and applicable approvals.

The initial paid-off hosting checkpoint, subsequent owner-authorized managed-URL
paid activation and owner-managed domain/Turnstile
cutover are recorded in the [deployment guide](operations/CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07.md).
Keep the public hostname exact. Next standalone resolves API origin from the
configured public Host and HTTPS proxy marker, retaining browser Origin/CSRF
checks. Maintained system tools enforce the existing source codec/container
boundary before decoder opening; the compositor receives only the normalized
selected copy. This is an exposure mitigation, not a claim that every vendor
library is patched. The verified renderer now admits the exact local origin and
one configured managed frontend origin with matching bucket CORS. Non-processing
checks confirm capability availability; real hosted media acceptance is owner-only.


## Owner final local paid-test preparation — 2026-10-07

The latest owner instruction authorizes completing CL-015 preparation and
building/updating only the existing private renderer. Frontend/backend deployment,
public paid launch and agent-run paid processing remain excluded. Preserve the
owner's existing `.env.local` files and normal local defaults/startup. Prepare
server-only hosted identity transport and strict Linux release images without
changing local origins or exposing private configuration to the browser. Hosted
paid processing remains closed until explicit public launch approval and exact
production origin/caller/challenge configuration; process-local limits do not
establish global atomicity across revisions. Remove the temporary saved-analysis
replay at this release checkpoint, preserving both retained masters and original
captures/private diagnostics. The accepted landing film keeps its existing motion
and appearance using reviewed synthetic delivery images. See the
[active preparation record](operations/FINAL_LOCAL_PAID_TEST_PREPARATION_2026-10-07.md).

Fake/no-key checks remain synthetic/injected, with paid/approval flags disabled.
The owner performs the final real paid walkthrough using their configured
provider/live/rights/spend setup and the updated private renderer. No local AI
weights/runtime or agent-paid flow are added.

## Owner security decisions — 2026-10-07

The owner approves local CL-012 security remediation while preserving the entire
working flow, code structure and every private content-safe diagnostic. Visitor
errors and browser-console output remain generic. Add verified session starts and
a generous shared media-delivery allowance; prepare compatible fixed browser and
framework patches. Cloud builds/updates, credentials, deployment, Git actions and
agent-run paid tests are not authorized by this instruction.

For hard backend loss, accept Google's up-to-48-hour Files expiry fallback;
normal explicit deletion and deletion-before-next-phase fences stay enforced.
No recovery database or orphan sweep is requested. Reconcile the existing
owner-reported USD 5 Gemini monthly cap and Cloud Run decisions rather than
choosing new budgets. Actual current account enforcement needs external evidence.
Public traffic protection is explicitly paused until the owner checks the
dashboard. The documented four-operation allowance means media operations per
session, not four processes. See the [approved plan](operations/STRIDE_SECURITY_PLAN_2026-10-07.md)
and [execution evidence](operations/STRIDE_SECURITY_REMEDIATION_2026-10-07.md).

Later owner instructions authorize read-only authenticated gcloud inspection
after local validation, and the [file-level staging/commit plan](tickets/CL-015-SECURITY-COMMIT_PLAN.md)
after a clean review, with `CL-015:` on every subject. The inspection verifies
the app's Cloud Run USD 5 monthly spend cap in configured state and selected
private IAM/expiry/bucket settings; current Gemini key/project correspondence
and complete release acceptance remain open. No cloud mutation, build, deploy,
push or agent-paid testing is authorized by these follow-ups. Traffic stays paused.

## Current owner revision — Gemini and private Cloud Run rendering (2026-10-02)

Status: **Local code through CL-014 and CL-015 release preparation is audited and validated with no actionable local findings. All five settled root gates and 721 synthetic tests in 70 files pass, including the CL-016 MP4-only and sample-streaming follow-ups. The local frontend artifact inventory passes, but strict release verification rejects this Windows build's 26 external package links; an acceptable target-platform immutable build remains unverified. The release ledger keeps manual/media/device/film/provider/cloud/rights/spend and complete CL-015 deployment acceptance unchecked. No deployment or public paid enablement is authorized. The owner authorized sequential execute/validate/fix/document loops and ticket-prefixed commits through CL-014 and locally buildable CL-015. Missing keys/live/cloud evidence does not block this local sequence. Provider/paid/cloud/deployment, native full-fixture, pixel/audio/human quality, font/license/rights and real device/public-release gates remain deferred.**

### Owner minimal final result — 2026-10-07

Show only the finished portrait clip and the existing social-sharing Soon panel
in the result body, with Download MP4 and Start over in the footer. Remove the
final transcript, expiry/storage explanation, media specifications and visible
playback-success copy. The preceding review retains its transcript and notes;
download verification, expiry, cleanup and actionable failure/retry messages
remain enforced. Use the existing desktop columns and phone stack. This replaces
earlier final-result transcript/disclosure presentation requirements without
adding direct publishing or changing retention. See the [CL-011 follow-up](tickets/CL-011-render-and-deliver-final-clip.md#owner-minimal-final-result--2026-10-07).

### Owner environment-only configuration — 2026-10-06

The latest owner decision removes backend runtime JSON and all application usage.
Tracked backend code owns schema/defaults; ignored `.env.local` supplies local
credentials and private connection/sample references. Deployment uses the same
environment keys. Normal defaults are `FAKE_MODE=false`, `PAID_DEMO_ENABLED=true`
and cloud spend, Gemini transfer, image generation and paid-project approval true.
`PAID_DEMO_ENABLED=false` has precedence and forces all four approvals false,
disabling cloud/sample reads, live routes, grants and dispatch allowance.
The owner's later export instruction enables analysis, assembly and final
rendering directly in real paid mode. `PAID_VALIDATION_STAGE` is obsolete and
ignored, so existing assembly entries do not disable Confirm export. The
deployed renderer still needs the matching composition/image contract for a
successful real MP4; no rollout or live export is proved by enabling the control.
Missing optional local prerequisites leave paid
routes unavailable without preventing health/local intake. This supersedes all
earlier runtime-JSON/default-fake or default-off-image configuration decisions
below. Tests/CI/synthetic harnesses remain explicitly fake, paid-off and
credential-free with pre-import network interception. No agent paid flow, public
paid deployment or cloud change is authorized. See the [CL-015 packet](tickets/CL-015-deploy-validate-measure-and-rollback.md#owner-environment-only-configuration--2026-10-06).

### Owner chunked upload acceptance — 2026-10-06

Prioritize [CL-005 chunked upload and confirmed cloud progress](tickets/CL-005-implement-secure-upload-and-storage.md#investigation-and-execution-plan--2026-10-06).
Cloud upload percentages come from persisted chunk acknowledgements, with final
generation validation before 100%; local copy and unknown AI work are separate.
The owner permits a bounded sample upload/cancel/Exit cleanup check; normal live
AI processing tests remain owner-run with their existing keys/flags/approvals.
The [CL-005 execution record](tickets/CL-005-implement-secure-upload-and-storage.md#actual-browserstorage-acceptance--2026-10-06)
covers implemented chunk progress, synthetic verification and two protected
actual browser/GCS upload/Exit checks with validated cleanup results. Normal
paid continuation remains owner-only.

### Owner landing refinement decision — 2026-10-28

Phone hero revision [CL-120](tickets/CL-120-full-screen-phone-hero.md): keep the
initial phone viewport on the hero, with How it works below the fold. Restore
the existing ClipBuilder hero wordmark. Use a full small-viewport minimum and
balanced stacked layout, compact short-phone spacing and natural scroll/wrapping
for very short screens or enlarged hero copy. Preserve the film's 4:3 aspect and
tablet/laptop layout; do not hide lower sections or force clipped content.

Saved-minutes motion revision [CL-113](tickets/CL-113-synchronized-saved-minutes-headline.md):
count the headline and card saved-minute readouts together from 00 to 50 using
the same progress as the visual comparison. Reserve tabular two-digit slots so
neighboring words do not shift. Use a smooth slow–fast–slow curve while keeping
CL-110's visible-only, once-only entrance and existing example/accessibility
qualifications. This changes presentation, not performance evidence.

Market motion/disclosure revision [CL-112](tickets/CL-112-once-only-market-shine.md):
give mostly visible platform cards one sequential, roughly one-second hover-like
shine per visit, without pointer events or replay. Offscreen phone rows wait for
their own entry. Retain real hover and informational behavior, remove side dots
at every size, and explicitly state that ClipBuilder is not affiliated with or
partnered with the platforms. Earnings/campaign caveats remain.

Time-card revision [CL-110](tickets/CL-110-visible-time-animation-and-larger-clock.md):
start its one-shot animation only when the number/clock area is meaningfully in
view, rather than on the first sliver of the card. Enlarge the clock and remove
the Illustrative goal badge; retain the what-if/Example/Target framing and the
existing accessible qualification. Preserve the 60-to-10 example and removed
visible footnote. Pending enhanced visuals hold their starting pose offscreen;
no-JS/accessibility retains complete final values.

Responsive market revision [CL-109](tickets/CL-109-roomier-responsive-market-cards.md):
avoid squeezing three platform cards into narrow tablet/phone columns. Use wider
tablet cards and full-width phone rows with readable labels and generous logo
space. Preserve the desktop treatment, official vector proportions, decorative
hover and informational/non-navigating behavior.

Initial-load correction [CL-108](tickets/CL-108-correct-film-first-paint.md):
the approved hero aspect applies from the first paint, before hydration or size
observers. Use CSS-responsive shared poster primitives and mount the live player
only with a measured composition size. No fixed 16:9 initial poster, distorted
artwork or headline crop; preserve CL-107's composition and outer geometry.

Latest composition revision [CL-107](tickets/CL-107-integrated-full-canvas-film.md):
the owner prefers an integrated full-canvas film over a repeated headline band
above a framed screenshot. Place animated copy in scene-specific negative space,
use purposeful camera framing to create room, and let action-only passages play
without headlines. Copy and important actions stay clear of each other. This
supersedes the fixed-header layout, preserving the approved outer aspect,
CL-106's shared-object transitions and stable-art text-only loop, smooth cursor
following, normal motion policy and concise duration. The poster shares the
integrated opening composition. Local checks do not grant owner visual/release
acceptance or prove real AI performance.

Transition revision [CL-106](tickets/CL-106-content-led-film-transitions.md):
the owner rejects the center-opening full-scene reveal. Replace it with explicit
content connections: conversation into upload preview, media into analysis,
analysis into moment cards, selection into source/portrait, portrait into editor,
then out to result and back to conversation. Carry shared objects and their
geometry through the cut; never slice, wipe or slide the entire scene. Closing
and opening retain the identical conversation artwork/pose and stable brand;
only their text transitions with restrained kinetic typography. Keep CL-102's
smooth cursor following, readable copy, no added frame progress track, large
responsive canvas and the 24-second story. Research informs the choreography;
it is not evidence of conversion or real processing performance.

Earlier playback revision [CL-102](tickets/CL-102-smooth-purposeful-film-tracking.md):
replace CL-099's busy multi-zoom camera with a continuous, eased mouse-follow,
centering the pointer as far as source bounds allow and retaining active labels.
Use a modest one-way zoom, steady noninteractive holds, longer cursor journeys
and gentle connected scene handoffs. Remove the film-added bottom progress
track, bright wipes, title masks and gratuitous rotations. Narrative copy stays
in a safe region outside the camera, with separate outgoing/incoming timing.
Keep the large frames, responsive outer aspect, 24-second story and shared poster.
Local synthetic/no-key evidence does not replace owner visual/release acceptance.

Earlier follow-up [CL-099](tickets/CL-099-fill-landing-film-and-track-actions.md):
the owner approves the outer film aspect and requests a much fuller interior.
CL-100 also swaps the shared Privacy dialog surfaces: brighter blue outside
and the darker previous outer material on the inner cards, preserving copy and
interaction. Enlarge demo frames and text, use the actual canvas height, vary text placement
and transitions, and zoom/pan with meaningful cursor actions. The implemented
film uses nearly full-width screens, large headlines, bounded cursor-led pans,
light wipes and enlarged illustrations; its responsive static loading poster
shares the same opening scene. CL-099/100 record local checks and clean read-only
reviews without claiming owner personal acceptance. This supersedes
the restrained camera direction below while retaining readable context and
the concise 24-second story. Preserve hero dimensions, navbar and process work.

The owner is satisfied with the actual demo and requests landing-only changes.
[CL-095](tickets/CL-095-concise-contextual-landing-film.md) replaces the long film
with a concise 24-second story, clear context throughout and restrained camera
movement. [CL-096](tickets/CL-096-taller-hero-without-redundant-flow.md) removes
the redundant hero flow strip and uses its space for a taller responsive film,
retaining laptop columns and natural phone height. [CL-097](tickets/CL-097-animated-compact-landing-navbar.md)
smoothly compacts laptop/desktop navigation after the hero to logo, Privacy and
Get Started, reversing on return. [CL-098](tickets/CL-098-faster-process-visual-and-text-entry.md)
speeds up the existing How it works illustration and brings adjacent text in
from left to right. These decisions supersede the earlier 50-second duration,
hero flow strip, fixed film aspect and full navigation below the hero.
Silent autoplay, offscreen/hidden pause, shared design tokens, normal motion
under every motion preference, Privacy and application behavior remain.
Execute and read-only validate each packet sequentially. API-free synthetic
visuals need no keys; real processing still requires providers/live flags,
approvals and owner action. No staging/commit/deployment/paid/cloud action.
Owner personal visual, rights and release acceptance remain separate.
Local implementation/verification is recorded in CL-095-098: concise context-
retaining film, responsive canvas with an uncropped short-screen minimum,
650ms reversible compact navigation, and a complete 12-second process cycle
with left-to-right copy. Final read-only reviews report no actionable local
findings; synthetic browser/type/lint evidence does not claim owner acceptance.

### Owner landing motion decision — 2026-10-06

The owner explicitly replaces the landing hero placeholder with the locally
authored 50-second cinematic walkthrough and removes the temporary
`/motion-preview` route. The video itself has rounded corners matching the site,
with no outer frame or draft-information strip. Its analysis shot lasts four
seconds with a continuous push at one angle.
The latest owner decision restores the original laptop two-column layout:
ClipBuilder, headline and description on the left, video on the right. Original
responsive sizing, spacing and smaller-screen breakpoints apply. The centered
layout trial and hero-brand removal were reversed; the film's rounded edges and
pacing remain. Phones retain their compact, naturally scrolling layout.
The latest phone correction removes viewport-filling hero minimum heights and
the expanding player row. Copy and video flow at natural height with responsive
gaps; tighter process-section padding avoids surplus space after the video.
At 1536px and wider, laptops grow the split hero and its column gap; text scales within the
available copy column and the video grows with its own column. Compact laptop
and phone breakpoints retain their existing layouts.
The owner corrected the initial threshold because it expanded a 1366px laptop;
the larger-column rule now applies only to the wider-screen tier. The next
local layout trial moves the main hero closer to the navbar and adds a compact
animated flow below: upload a video, find complete moments, choose one, automatic
captions/visuals, and a vertical cut ready to share externally. Phones use natural
height with a compact vertical flow. This is presentation, with no new workflow
controls, editing capability or direct publishing.
The owner also requests seamless entry playback. The loading poster matches the
opening film frame; dynamic player loading runs alongside asset verification,
and muted autoplay does not move keyboard focus to the pause button. Refresh and
restored back/forward visits start the film again. The owner's latest revision
removes all player controls and click-to-pause interaction; the film plays as a
silent hero animation. Offscreen/hidden playback pauses and resumes on return.
The owner accepted this design and requested code cleanup. A compact flow row
at laptop heights of 640px or less keeps the bottom sequence visible without
altering the accepted regular-height layout. No accessible-motion acceptance
is claimed from this owner-directed controls exception.
The [CL-013 authoring record](tickets/CL-013-complete-accessibility-responsive-and-performance-pass.md#local-motion-authoring-and-owner-iteration--2026-10-06)
owns implementation and verification evidence. Synthetic UI captures and original
vector artwork need no provider keys; actual processing, delivery exports,
rights and public-release acceptance keep their separate existing gates.

### Owner editing quality decision — 2026-10-06

Latest [meaningful edit notes](tickets/CL-010-deliver-automatic-clip-review.md#owner-meaningful-edit-notes--2026-10-06):
the final review explains the actual conversation cut, captions/audio treatment,
camera cuts and held framing in a concise account. Do not list every tracking
state. Describe only retained visuals, using their existing bounded scene briefs,
asset source, hold and grounded phrase. Count camera cuts from rendered crop
geometry. Highlight notes explain the selected evidence's editorial role rather
than duplicating its quotation. Retained scene metadata belongs in the signed
control result, outside the renderer manifest; old results remain readable and
there is no extra model call. Existing read-only, privacy, spend and owner-manual
live acceptance gates remain.

Latest [Commons-first generated fallback](tickets/CL-009-build-contextual-visual-assembly.md#owner-commons-first-generated-fallback--2026-10-06):
retain Commons, search essential concepts and rank with the complete contextual
brief. When no usable image remains, permit one ungrounded Gemini Flash Image
generation attempt per validated visual, at most three per protected assembly.
Use generic illustrative scenes, fixed art direction, normalized signed JPEG
overlays and explicit generated provenance. No search grounding, retries, new
planning call or source likeness. Reserve image spend before dispatch and retain
nonfatal image failures plus cancellation/cleanup. This replaces the earlier
zero-image-call constraint. Fake/test/public generation stays off; normal
image approval follows the later environment-only decision above. Live
activation requires existing key/transfer/paid-project and assembly gates. Paid
tests remain owner-manual and matching private renderer rollout is separate.

Latest [bounded visual window](tickets/CL-009-build-contextual-visual-assembly.md#owner-bounded-visual-window--2026-10-06):
recover timing from exact supplied word clocks instead of discarding usable
picture plans. Supporting phrases may contain up to 24 words; move a later
anchor to the phrase's first word and fit the display within the 2–4.5-second
and clip limits. The full phrase supplies context, while only a contiguous
prefix of complete words inside the display is signed as evidence. A following
readable visual beat may shorten the hold. Tell Gemini that only one picture appears at a time for at
least two seconds, so it should space anchors by their full hold and choose
naturally separated ideas. Preserve opening, overlap, count, coverage, rights
and signing limits; impossible windows remain nonfatal with no paid retry.
Safe diagnostics include retimed-plan counts. Fake/no-key checks prove local
timing behavior; actual creative/retrieved picture quality remains owner-manual
with existing keys, enabled live flags and approvals. The full supporting phrase
does not need to remain entirely onscreen; signed manifests keep the in-window
supporting excerpt within the existing seven-word evidence bound for renderer compatibility.

Latest [general creative visual rules](tickets/CL-009-build-contextual-visual-assembly.md#owner-general-creative-visual-rules--2026-10-06):
remove topic/age examples and visual recipes from the Gemini instruction. Let it
interpret the whole conversation and choose varied, broadly searchable generic
scenes that convey the meaning. Specific depicted entities/ages are unnecessary;
generic people may illustrate supported activities/relationships without source
identity or sensitive inference. Plan at least two distinct useful pictures,
with the existing maximum of three. Each holds for 2–4.5 seconds according to
the relevant thought; keep the opening beat and 45-percent coverage cap. Adjacent
pictures require no group IDs or artificial gap, and duplicates cannot satisfy
the two-picture target. Unavailable images/quality critiques remain nonfatal;
record proposed/validated/retained counts and shortfalls. Existing one-call,
rights/privacy/resource and cloud gates remain. This supersedes the earlier
one-picture target, age-specific planning/evidence and short grouped holds.

Earlier [contextual relevance/hard-cut revision](tickets/CL-009-build-contextual-visual-assembly.md#owner-contextual-relevance-and-hard-cut-revision--2026-10-06):
accepted improved tracking/cuts must remain. All camera transitions are immediate
cuts, with provisional portrait framing from the opening rather than waiting in
an all-wide view. Hold the latest same-shot crop during uncertainty. Gemini must
plan contextually useful scene briefs, and bounded image retrieval must rank and
reject irrelevant results rather than accepting the first licensed noun match.
Permit adjacent grouped visuals and generic illustrations of explicitly spoken
ages, without inferring a participant's age/identity or reproducing their likeness.
At least one relevant visual remains the goal; unavailable/poor assets warn and
preserve the usable edit. Existing one-call, rights/privacy/resource and cloud
gates remain, with no extra paid AI call.

Earlier [tracking/picture revision](tickets/CL-009-build-contextual-visual-assembly.md#owner-visual-and-tracking-revision--2026-10-06):
retain accepted captions and stutter-free playback. Preserve valid individual
speaker observations and hold the last confirmed same-shot face crop through
uncertainty until a new confirmed crop; no time-based widening. Replace automatic
text-excerpt graphics with grounded contextual picture overlays behind captions,
without a full-frame background. The owner requests fetched generic images;
implement bounded public-domain/CC0 Commons retrieval with normalized, signed
inline raster bytes and no renderer external URL input or additional paid AI call.
Missing images/quality critiques remain nonfatal. Shared workflow player controls
hide off-hover on desktop, reveal on keyboard focus, and reveal/idle on touch.
Rights, source/session integrity, cancellation and cloud rollout gates remain.

Later owner correction on 2026-10-06: AI-output quality critiques are nonfatal
backend diagnostics. Preserve usable captions/framing/cards and use bounded local
fallbacks without another paid call. At least one grounded visual remains the
goal; when none can safely fit, warn and continue rather than aborting the edit.
Preserve returned words/clocks, including instantaneous words with no invented
highlight duration. Authentication, source/hash/receipt integrity, media resource
bounds, cancellation and cleanup remain enforced. This supersedes the older
quality-rejection and mandatory-visual acceptance statements below. See the
[CL-009 correction](tickets/CL-009-build-contextual-visual-assembly.md#owner-correction--nonfatal-ai-output-critiques-2026-10-06).

After upload, implement [CL-009 editing quality](tickets/CL-009-build-contextual-visual-assembly.md#investigation-and-execution-plan--2026-10-06).

Successful edits must play the selected contiguous conversation once without
unintended rewinds, repeated spans or gratuitous framing switches. Use one fixed
large white caption preset, no whole-caption background panel, and a contrasting
animated background on the spoken word using grounded word clocks. Require at
least one grounded contextual graphic actually included in a successful edit;
this supersedes the older zero-card allowance. Keep existing audio, safe areas,
cue count/duration/coverage and no-editor controls. Plan stable same-shot framing
through pauses and uncertainty by holding previously validated geometry without
claiming a confident speaker match; reset at real shot cuts or invalid geometry.
The ticket owns proposed bounded hold/switch details and their acceptance.

The local CL-009 implementation uses manifest v3, grounded per-word captions,
same-shot held framing and grounded contextual picture overlays. Synthetic
native Chrome reproduces/corrects buffering-driven preview stutter; local
production Remotion export contains the new captions and graphic. This is no-key,
API-free/AI-free evidence, with no real AI model. Owner real-media/AI quality and
the matching private renderer rollout remain unchecked. See the ticket's local
execution record; do not enable final render against an older manifest image.

Preserve existing stage diagnostics and private owner-local returned/normalized
output capture; extend them to distinguish planner, compiler, prepared media and
player timing. Private output capture retains its separate six-hour activation
and privacy/composition restrictions; replay follows the cleanup decision below.
The owner permits exploring rights-cleared fetched visuals as an alternative to
new image generation; that requires a bounded backend asset/search policy and
validated private artifacts, never arbitrary renderer URLs. It does not select
a paid search/image model, authorize extra paid calls, expand renderer inputs or
waive rights/privacy/spend/cloud gates. The later picture revision implements
this bounded Commons path with no paid image generation. No local AI model/weights
are required. These are owner behavior decisions. New real tracking/picture-quality
acceptance remains owner-tested under CL-009.

### Owner audio transcription and text-only selection decision — 2026-10-05

Owner selected assembly request/diagnostics follow-up (2026-10-05): use JSON-only
Flash transport for the selected video plan as already used for candidate
selection; provide the canonical plan schema as text guidance and retain local
compilation. The owner-triggered request reached successful video upload, then
HTTP 400 with no field details. This change is an evidence-supported transport
correction; live acceptance remains an owner manual gate. Preserve all private
provider captures and add explicit bounded stage messages, timings, structural
facts and safe schema failure locations across assembly and cleanup. Canonical
remote UI errors must retain their original category. See the
[CL-009 follow-up](tickets/CL-009-assembly-request-and-diagnostics.md). This changes
no model, sampling, retry/spend policy, cloud resources or public controls.

Candidate decoding correction (2026-10-05): a successful live Flash response
returned three candidate objects as a JSON array; object-only decoding incorrectly
published an empty result. The approved CL-007 fix accepts both the array and
`{ candidates: [...] }`, states the envelope in the JSON-only prompt and retains
safe decoding counts/reasons plus full private capture. Empty UI copy is neutral;
it cannot claim an editorial judgment when decoding was the cause. Existing
quality tolerance, bounds, provider-call count and cleanup controls remain.

Owner renderer allowance decision (2026-10-05): replace the process-lifetime
media-operation cap with a fixed four-operation allowance for each disposable
demo session (prepare, selected proxy, preview, final render). Consumption is
stored and atomically claimed in the existing expiring media intent, survives
renderer restart and cannot be reset by replay. New sessions receive a fresh
allowance; failures retain consumed work. Existing backend spend/admission,
private authentication, bounded capacity/media/runtime and cleanup controls
remain. Retire the old operation environment setting. Backend renderer logs
must retain safe status/reason/stage/timing/structural details; UI messages remain
generic. The owner approved implementation and the matching private renderer
deployment after verification under the current CL-007 packet. This authorizes
no public release or agent-run paid-media/AI test.

Implementation and the matching private rollout are verified: 959 fake/no-key
tests, all five local gates, Linux synthetic audio/render/runtime proof, unchanged
other settings/private IAM and non-metered private health checks pass. Local
hot reload/readiness and armed private capture pass. Real provider acceptance
and paid quality still require the owner's manual UI test. See the current
CL-007 allowance handoff; earlier deployment statements below retain their date.

Latest owner override (2026-10-05): **Find moments does not reject model output
for transcript or candidate quality rules.** Timing/order/overlap/media-tail,
turn consistency, quotation/claim/evidence, candidate duration/overlap and
duplicate checks are removed from source analysis and its shared browser
contracts. Preserve returned timings and all diagnostics. Decode usable items
independently without inventing timings; unusable items or empty output produce
a reduced/no-candidate result instead of rejecting the request. Basic decoding,
bounded data, authentication/source binding, admission/spend, media inspection
and cleanup controls remain. Duration/grounding/editorial goals remain prompt
guidance, not output acceptance gates. This supersedes the rejection policy in
this section and historical section 12.6. Selected assembly/rendering retain
their separate execution and resource boundaries. See the current CL-007 packet.

Replace the combined full-video transcription/selection call with renderer-owned,
source-aligned audio extraction, one `gemini-3.5-transcribe` verbatim/word-timestamp/
diarization call and one `gemini-3.8-flash` text-only candidate selection call.
The backend derives stable word IDs, complete turns, cut times and public
quotations. The separately admitted short selected-video Flash planning call
remains for visual speaker association and contextual cards. No old processing
fallback, automatic paid retry or editor is introduced. The source action budget
is now two sequential AI calls, with zero selection calls after transcript failure.
Use Interactions with storage/background/streaming explicitly disabled.

The owner also authorizes practical reconciliation tolerance: at most 250 ms end
overshoot can be clamped to decoded duration with positive word length; larger
drift and invalid references remain rejected. Missing sentence punctuation alone
does not reject an otherwise grounded candidate. Distinct known speakers may
overlap; same-speaker or uncertain-attribution overlap retains its 250 ms bound.
Capture raw and normalized
values plus adjustments privately before guards. Preserve every existing safe
diagnostic and extend complete bounded private capture to Transcribe, Flash
selection, selected-video planning and derived results. The current execution
plan and exact test/rollout gates are in the
[CL-007 migration packet](tickets/CL-007-deliver-live-analysis-vertical-slice.md#owner-transcribe-and-text-only-selection-migration--2026-10-05).
This approves local implementation; renderer cloud updates and owner-run paid
quality tests remain separate. Fake/no-key checks prove only synthetic behavior.

### Owner local Gemini diagnostic capture decision — 2026-10-05

For the current owner-local investigation, the owner explicitly authorized
complete Gemini response bodies/headers, normalized output and actual transcript
timestamps with decoded media duration and overrun comparisons. Store these in
private OS-temporary files outside Git, scoped by opaque request IDs and an
explicit workspace permit with a six-hour activation window. Normal application
logs/public responses stay content-free; test, fake, preview and production
composition cannot activate this capture. Never serialize request authentication,
environment values or credential files. Existing validation, provider settings,
call counts and disposable-media cleanup remain unchanged. This is a local
diagnostic retention exception, not a public/cloud logging feature. Captures
remain owner-local for diagnosis until removed; activation expiry stops new
captures but does not delete evidence. See the
[CL-007 packet](tickets/CL-007-deliver-live-analysis-vertical-slice.md#owner-local-full-gemini-capture--2026-10-05).
Fake/no-key tests use synthetic responses and isolated temporary directories;
real output requires the owner's manual UI test with existing credentials/live
flags/approvals. No new agent-run paid test, cloud action or local AI weights
are authorized or required.

### Owner Exit and background cleanup decision — 2026-10-04

Rename **Clear media** to **Exit**. Its primary result is returning to the landing
page, forgetting the browser workflow and expiring app session cookies for a fresh
start. Cleanup runs quietly; deletion failure never asks the visitor to retry or
blocks navigation. Exit acknowledges the session reset, not physical deletion.
It is available independently of paid-feature readiness. An unusable pre-restart
cookie is also expired; it cannot prove deletion of old processing copies.

The frontend returns the cookie-expiry response independently of backend cleanup
and schedules one bounded cleanup handoff after the response. A reachable control
session cancels work and revokes its grant before private deletion settles.
Backend/provider restart or failed deletion relies on independent private expiry;
Google Files expiry is separate. Uploaded local files are deleted best-effort,
with a clearing tombstone retried on the next entry; new intake never restores an
abandoned source. The exclusive workspace lease drains before another upload
can start. Sample selection never invokes uploaded-file deletion, and both
retained masters remain excluded. There is no durable queue or deletion guarantee.
This supersedes the older cleanup-only screen, intake fence and visitor retry
requirements. Existing media/access/spend/rights bounds remain.

Fake/no-key checks cover failed and pending deletion, cookie expiry, stale sessions,
unmount, sample preservation and fresh intake with injected transports. They do
not prove actual cloud/provider deletion or live AI quality. Paid manual tests
remain owner-only and still require keys, live capabilities and recorded approvals;
no local AI runtime or weights are used.

### Owner analysis action decision — 2026-10-04

Remove the technical transfer notice and separate rights/paid-analysis checkbox
from the Step 1 preview. **Find moments** is the explicit action that initiates
analysis; it no longer requires a second checkbox. The existing privacy panel,
source-rights requirement, operator approvals, live eligibility, Turnstile and
bounded admission remain. Preview alone never dispatches analysis. This decision
supersedes earlier requirements for a separate browser consent control.
Fake mode remains synthetic and needs no keys; real analysis still needs the
configured credentials, live capabilities and operator approvals. Paid tests
remain owner-only.

### Owner sample streaming decision — 2026-10-04

**Use sample** opens protected same-origin, generation-pinned Step 1 playback.
Selecting or restoring it journals only the selection; it does not download,
hash or persist the full sample in the browser. Native video requests the ranges
needed for playback and seeking. Normal file intake still uses its local file.
Only explicit **Find moments** and existing live admission gates prepare
a separate disposable processing copy on the server. The fixed read-only master
is fingerprinted and transferred in bounded chunks through the renderer's
existing temporary upload capability; the renderer then validates the copy and
prepares the analysis proxy. No cloud-to-browser-to-cloud transfer is required.
Retained masters stay outside visitor cleanup. This supersedes the earlier
sample-download/OPFS preparation path, not retention, rights or spend gates.
Fake mode remains the labelled keys-free fixture journey. Real streaming needs
ADC/storage access but no Gemini key; real analysis retains keys/live flags and
rights/provider/cloud/spend approval. No local AI weights/runtime are used.

### Owner analysis wait and local sample decision — 2026-10-04

While finding moments, rotate brief messages every five seconds and loop them
until the request ends. Owner clarification: start with the accepted **Find
moments** action and include verification, sample-copy/upload and proxy preparation;
do not wait for the AI request or select rotation by a technical phase label.
Keep one elapsed-time and message-loop lifetime across those phases. The
late-start defect and related local analysis/console fixes are implemented in
[CL-007](tickets/CL-007-deliver-live-analysis-vertical-slice.md#owner-requested-analysis-failure-and-console-fix-plan--2026-10-04)
the 2026-10-05 follow-up; the historical provider cause remains unconfirmed.
These describe the analysis task; they do not claim
measured stage completion or a percentage. Keep elapsed time and cancellation.
**Use sample** appears only when the local backend enables that capability;
preview and production expose neither the CTA nor retained/fixture sample routes.
Clearing a streamed sample releases its selection and session journal without
running uploaded-file OPFS deletion. Both retained masters remain excluded from
cleanup. Separate disposable processing/proxy/provider copies still follow their
existing deletion rules. Uploads retain verified physical local deletion.
Fake checks need no keys and prove these boundaries through synthetic transports;
genuine analysis quality and real upload cleanup remain owner-run checks.

### Owner MP4-only intake decision — 2026-10-04

Accept one owned/licensed MP4 source. WebM video intake is removed from the
picker, fake metadata validation, shared upload/source contracts, browser demuxing
and authoritative media inspection. Actual container, track, codec and limit
checks still apply; a filename or declared MIME type cannot authorize a source.
This supersedes earlier MP4/WebM intake decisions. Internal Opus/WebM audio
transport remains available, and legacy temporary WebM records remain readable
for cleanup only. The retained MP4 master and preview flow are preserved.
Fake mode remains synthetic and keys-free. Real Step 1 preview needs storage
access but no Gemini key; full processing retains its separate keys, live
capabilities and rights/provider/cloud/spend approval gates.

### Owner app-local configuration decision — 2026-10-04

Local environment files and their committed examples belong inside the frontend
and backend apps, with no root environment file. They contain credentials and
at most the backend `FAKE_MODE` and `PAID_DEMO_ENABLED` operating switches.
The frontend currently needs no entries and derives mode from the backend.
Numerical limits, rate/capacity bounds, timeouts, model and retry policy are fixed
in code. The processing-grant active key label is likewise fixed to `v1` in
backend code; only the plain secret belongs in `PROCESSING_GRANT_KEY`.
No JSON or key label is required. The old JSON entry is readable during migration
when the new entry is absent; an explicit new entry takes precedence.
The obsolete active-label environment selector is ignored. This supersedes the
older runtime-limit/environment and grant-map inventory below.
Private connections, retained-sample metadata and independent recorded approvals
belong in ignored backend runtime configuration. An approved validation stage
derives the live capabilities and bounded dispatch allowance; paid-off disables
them all. Configuration never substitutes for rights/spend/provider authorization.
The owner's local restart follow-up separates app availability from optional
paid-feature readiness. Incomplete local Gemini, grant/Turnstile, renderer or
validation-stage setup leaves paid routes unmounted and dispatches at zero,
while health and real local intake remain available. Approved retained playback
remains available independently of AI. The selected real/fake mode and paid
switch are preserved; there is no fixture fallback or automatic approval.
Malformed structural configuration, conflicting modes and public/test paid
composition still reject. Startup diagnostics contain fixed requirement codes
only. Real processing still requires the complete keys, stage and approvals.
No hosted routing, service authentication, public paid processing or deployment
is completed by this local layout change.

The owner authorized secret-free local setup and separately approved one private
retained cloud sample and read-only ADC playback preparation on 2026-10-04.
Storage/upload/access verification and real Step 1 playback/seeking are recorded
in CL-016; the owner reported it working. The later streaming follow-up verifies
preview Clear/reselect/reload. Detailed perceptual audio sync and the real
processing-copy/AI flow remain unverified. Preserve both the local master
and its retained cloud counterpart; processing copies keep normal cleanup rules.
This supersedes the earlier statement that no retained cloud object was selected.
Default fake mode and ordinary tests need no keys and prove synthetic behavior;
real preview needs ADC/storage access, while Gemini quality and the paid flow
retain their separate approval and evidence gates.

The owner selected Google Gemini for understanding/transcription/candidates/
speaking-face association and our private Google Cloud Run Remotion Node/Docker
media service for proxy preparation, physical cutting and final editing/encoding.
Private temporary Google Cloud Storage is explicitly approved for artifacts needed
by the active demo flow; this does not authorize provisioning or paid tests.
The [current migration contract](architecture/GEMINI_REMOTION_MIGRATION.md),
[full file-level inventory](architecture/MIGRATION_FILE_INVENTORY.md) and
[later Cloud Run setup guide](operations/CLOUD_RUN_RENDERER_SETUP.md) own exact
responsibilities, dependencies, privacy/retention, limits, service identities,
AI/cloud spend gates, licensing and evidence. They supersede conflicting
Deepgram/OpenAI/local-LR-ASD and browser-only/export/no-GCS rules below.
No AWS, alpha Remotion cloudrun package, general queue, durable raw archive or
arbitrary renderer API is selected. Mediabunny remains only where useful for intake.

The product remains one owned/licensed source, zero-to-four grounded candidates,
exactly one selected 10–60-second clip, automatic fixed captions/contextual
visuals, read-only preview, Confirm export and one validated portrait MP4 download.
Gemini chooses the grounded range; the media service physically cuts/renders it.
Flash produces structured text; fixed templates initially need zero image calls.

Owner clarification (2026-10-03): preparing a shorter demonstration source is
input preparation only. Live analysis must derive grounded candidate ranges,
transcript/caption content, speaking-face associations and contextual content
from the supplied source. Do not add sample-specific timestamps, speaker/crop
coordinates, canned transcript/cards or a preset extraction path. The visitor
chooses one system-generated candidate through the normal flow. Shared fixed
layout templates and generic framing rules remain approved; synthetic fake-mode
fixtures remain isolated verification data and do not prove live analysis quality.

Fake/live selects AI behavior; local/cloud selects compute independently.
Ordinary fake tests use synthetic plans and injected cloud/renderer transports,
no credentials/network/spend. An authorized local app may use a remote private
renderer with fake AI and still incur cloud cost. Browser does not hold Google
keys or cloud credentials and need not encode the final clip. Live Google
understanding needs keys/flags and rights/data-transfer/paid-call approval.
Windows/Linux synthetic Node compatibility and the rights-confirmed 2:45
private cloud upload/proxy/render/audio/cancellation/deletion checkpoint are proved
in CL-006. Those small-source timings are not throughput evidence or an SLA.
Live grounding/speaking-face quality and full maximum-envelope stress remain unproved.

Cleanup has priority over retention: private GCS objects only, raw/proxies/
intermediates/assets removed when no longer needed and immediately when a
validated final MP4 is published; output kept only for the earlier of ten minutes
or session expiry. Download initiation does not prove a saved file. Cancellation,
failure, clear/reset, expiry, abandonment/disconnect and service crash/restart
are covered by terminal deletion and an independent authenticated 15-minute
expiry sweeper, bounded retries and content-free not-found verification. Proposed
bucket settings disable soft delete/versioning/holds/retention preservation.
Logical source expiry is two hours; proposed healthy cleanup bounds are 2h33m
raw and 43m output, including scheduled retry and sweep execution. Outages can extend physical retention and trigger intake
shutdown/incident cleanup; no unconditional permanent-deletion SLA is claimed.
Lifecycle alone is an eventual backstop. Google provider retention is separate.

Owner cleanup correction (2026-10-05): new upload admission attempts one bounded
existing sweep when expired/pending sessions or a process cleanup block are
found, then verifies the journal again before allocation. Scheduled expiry
remains independent; actual deletion failures/backoff still block intake. This
closes the between-sweeps admission gap without weakening generation fences,
retention, privacy or spend controls. Content-free renderer diagnostics identify
the cleanup stages and reason counts. See the
[CL-006 cleanup follow-up](tickets/CL-006-cleanup-aware-upload-admission.md).

The owner separately authorized retention of one prepared local demonstration
master on 2026-10-03. It stays ignored in `private/retained-demo-source/`, outside
application session storage, scratch, build/public assets and automated cleanup.
This is an owner-managed input for repeatable manual testing, not an application
archive or a precomputed extraction. Preserve it until the owner explicitly asks
to replace/delete that asset. Any copy admitted to a processing session and all
derived artifacts still follow the temporary-media deletion policy above.
No retained cloud object or cloud retention-policy change is selected.
The [local preparation record](operations/LOCAL_RELEASE_PREPARATION.md#retained-owner-demonstration-source)
owns use, preservation and verification evidence.

The owner explicitly approved this documentation and necessary local corrections
on 2026-10-02. The owner subsequently approved the verified existing cloud
project/region/private resources, ADC, Remotion license coverage, a USD 1 media
test allowance, the private source rights and necessary image retries until
the functional test passed. CL-006 is complete; its ticket owns exact evidence.
Project/account identifiers remain private. [CL-007](tickets/CL-007-deliver-live-analysis-vertical-slice.md) records its local implementation and controlled-check gate. New live AI, public
rights/release and Git actions retain separate authorization.
Earlier related source/audio changes were continued; later product integration remains incomplete.
Usage polling and independent code review remain stopped. Deployed images must
exclude every feasibility/debug page and obsolete model/runtime tool.

### Owner mobile landing branding — 2026-10-03

On the landing's existing mobile layout (up to 47.5rem), omit the separate
hero logo/name row and show **ClipBuilder** beside its mark in the navbar. The
headline begins the hero copy, giving more room to the introduction and motion
preview. Desktop keeps its hero identity. Primary navigation and 44px targets
remain available; no workflow entry or processing behavior changes.

### Owner workflow visual direction — 2026-10-03

The owner requested a plan to carry the landing's navy/blue background, glass
surfaces, CTA materials, palette and typography through the complete `/start`
workflow. This supersedes the older light-canvas workflow presentation direction
in section 18. Shared tokens and actual workflow primitives own the treatment,
including intake, status, selection, read-only review, delivery and recovery.
The existing single changing workspace, accessible step heading, exactly one
candidate, fixed composition, action/gate semantics and owner motion decision
remain. The [CL-013 workflow design plan](tickets/CL-013-WORKFLOW-DESIGN-PLAN.md)
owns the file-level sequence, fallbacks and verification. This is a documented
visual direction, implemented locally on the owner's subsequent instruction to
do the redesign first. Local fake-mode checks do not imply final
UI/film/provider/cloud/release approval or a Git action.

Later owner feedback requests a lighter workflow background closer to the landing
hero. The workflow uses static blue glow layers over a gradient scaled to its
single-screen height, with a brighter blue lower edge. This refines the original
shared-background direction for the workflow; the landing keeps its longer
gradient. Glass opacity, reading surfaces, actions and processing gates stay as
implemented. No additional blur layer or ambient animation is introduced.

Later mobile workflow feedback replaces the stacked header with a single row:
a logo, Privacy and (when available) Clear media. Below 600px the workflow
wordmark is visually hidden; its home link keeps an accessible product name.
Later sizing feedback makes the visible mark and action pills scale together
from 32px to 38px with phone width, centered within their 44px tap areas. Header
labels scale from 12px to 14px. Intake details, input guidance,
mode notices and source-preview explanations scale from 14px to 16px with phone
width instead of remaining at metadata size. Content may scroll inside the
workflow on short screens; actions and disclosures remain reachable. This is
specific to the workflow; the landing's mobile branding direction above remains.

Later width feedback aligns both navbars and the main workflow card to the same
responsive container: an 80rem maximum with 1.5rem gutters, 1rem through 58rem,
and 0.75rem through 47.5rem. Shared tokens own these values. Reserve the root
scrollbar gutter so switching between the long landing and bounded workflow does
not change their available width. This replaces the older 1920px workflow maximum
in section 18.4; content and controls remain responsive within the shared shell.

The workflow footer appears only when it contains a CTA, including disabled
actions with visible prerequisites. Screens without footer actions have no
footer strip or divider; availability-only notices stay in the card content.

Owner candidate preview correction (2026-10-05): before editing, candidate
frames use the inspected source's displayed aspect ratio, including rotation;
horizontal sources are shown horizontally. Horizontal galleries use a scrolling
row, snapping to one full card on phones/tablets. Their selected review uses the
existing Video / Agentic Notes / Transcript swipeable slide pattern with dots
and one mounted player on all screen sizes. Horizontal source playback controls
sit below the picture, within the available slide. Other choices remain reachable in
a side rail on wide screens and a compact horizontal rail on smaller screens.
Candidate thumbnails decode the source at each moment's start; loading and
decode failure are explicit. These source previews do not change the final
vertical composition. This supersedes the earlier universal portrait candidate
gallery and left-rail/detail-card direction for horizontal sources only.

Owner temporary local sample replay decision (updated 2026-10-06): save the latest
successful retained-sample transcript and three choices privately outside Git,
then expose **Simulate find moments for sample** beside Use sample only in the
explicit local development composition with no time-based activation expiry.
Keep the button until explicit cleanup before deployment; remove the replay CTA,
transport, cache loading and private saved copy at that checkpoint. Show the
saved real choices immediately and label their replay status. The independent
private output-capture permit retains its existing lifetime.
On Proceed, establish a fresh protected session/disposable copy and inspect the
sample before signing the saved analysis and running ordinary assembly. This
skips Transcribe and selection calls; it does not bypass source identity,
admission, rights/transfer, cloud/provider spend, receipt or cleanup boundaries.
No arbitrary replay upload, automatic paid test, durable project or hosted/debug
feature is added. Synthetic fake tests use no keys; real assembly is owner-run.
Thumbnail frame decoding is serialized and retained only in browser memory for
this review; release source decoders and frames on replacement/exit. The owning
[temporary packet](tickets/CL-007-local-sample-replay-and-thumbnails.md) defines
normal session expiry, pre-deployment cleanup and verification.

Candidate cards and detail panels stay inside the workflow content during
selection, switching and closing. They cannot draw over the heading/action
footer or outside the rounded main frame.

On phones, the left list of other moments scrolls independently of the selected
preview/details pane. Its full final choice, including title and time range,
must be reachable without scrolling the main pane. List-edge scrolling does not
move the main pane.

When the selected candidate's detail area has enough room for two readable
cards, show Transcript and Agentic Notes beside each other. Use the actual
available space rather than a laptop/device label; retain the tabbed presentation
when the area is narrow. Reduce surplus space around the preview to make room
for the evidence, with playback, note seeking and keyboard access preserved.

On phones, Step 3 read-only review shows the vertical video, Agentic Notes and
Transcript as three full-width swipeable slides in that order, with dots below
them and no navigation arrows. Native horizontal scrolling follows the finger
during the drag and snaps to a card on release. Preserve one mounted player,
note seeking, keyboard access, the visible export action and card containment.
Tablet and desktop retain their existing review card arrangement.

### Owner source-preview and retained-sample direction — 2026-10-03

After the workflow redesign, intake places **Use sample** beside **Choose a
video** and removes **Use prepared input**. Preparation remains in Step 1 for
full-source playback before explicit **Find moments**. Existing rights/transfer
consent and live gates still apply. This supersedes automatic analysis immediately
after intake in the fixture journey, and the earlier absence of a curated app
sample path. The retained continuous 7:41 source is ordinary pipeline input;
selection, captions, visuals and framing must be discovered by the system.

Both the ignored local master and its separately configured private cloud master
are owner-retained assets. The cloud master must be isolated from disposable
visitor storage/lifecycle/sweepers; only disposable workspace/processing copies
are cleared. Fixed generation-pinned reads pass through the same-origin API using
server ADC; no cloud resource identifier or signed URL is browser configuration.
The app reader has no deletion capability. Defaults/tests disable these reads.
The [CL-016 packet](tickets/CL-016-source-preview-and-retained-sample.md) owns the
local implementation and the actual ADC/cloud upload checkpoint. Cloud readiness,
source/media-rights evidence and live AI quality are not established by this
owner UI direction or fake tests.

Later owner feedback explicitly keeps **Use sample** functional in fake mode:
it starts the existing synthetic input/preview/candidate/review/export journey
without a selected file, cloud read or provider call. Step 1 still waits for
**Find moments**; sample previews/results are labelled simulated and Download
remains disabled. In real-media
mode only the configured retained source is available; no fixture fallback or
source-specific podcast extraction is introduced. Real sample/cloud/AI gates above
remain unchanged.

Later navigation feedback removes **Try sample video** from the landing.
**Get Started** opens the standard intake, where **Use sample** remains beside
**Choose a video**. No automatic sample selection is linked from the landing;
existing sample preview, explicit analysis and real-mode prerequisites remain.

Later intake copy feedback replaces the redundant rights/temporary-media sentence
with a recommendation: choose a clear conversation with focused topics, complete
ideas and minimal background noise. Real-mode device storage/transfer disclosure,
processing consent, rights requirements and upload bounds remain enforced. This
guidance recommends suitable input; it does not promise live AI quality.

### Owner privacy-panel revision — 2026-10-03

The owner renamed the shared landing/workspace disclosure to **Privacy** and
removed the repeated source-size/duration and product-scope rows. Existing rights
requirements, processing consent and upload limits remain enforced.
The privacy panel instead explains media use, temporary storage, Gemini transfer
and clearing. Visitor source videos and final edits are used only for the requested
clip: ClipBuilder does not publish them, reuse them in marketing or retain them
as demo content. The separately owned, rights-approved demonstration master above
does not authorize reuse or retention of visitor media.

Latest owner design revision (2026-10-28, [CL-111](tickets/CL-111-matte-two-point-privacy-dialog.md))
uses a solid navy dialog, restrained blue accents and two concise groups: Your
files combines use with storage/Exit cleanup, and AI processing covers provider
transfer/retention and mode-specific picture descriptions. Remove nested glass,
numbered rows and redundant wording. Keep all material mode distinctions,
readable semantics, title focus, native modal keyboard behavior and a reachable
close control. This supersedes CL-100's palette/material choice, not privacy policy.

Owner copy follow-up [CL-117](tickets/CL-117-remove-privacy-preview-note.md)
removes the preview-mode no-file-read/upload note from this dialog. Other
disclosures and actual fake/real processing behavior remain unchanged.

Owner wording follow-up [CL-119](tickets/CL-119-provider-neutral-privacy-copy.md)
uses generic AI-provider language in this dialog in place of Google/Gemini names.
Keep short audio/video transfer, separate provider retention and relevant picture
descriptions explicit. Actual provider/configuration/privacy rules are unchanged.

Earlier owner feedback limited this panel to three short points: no reuse/publishing,
temporary storage combined with Clear, and Gemini transfer/retention. The intro
was brief and identified the fake preview's no-file-read/upload behavior until
the CL-117 copy revision above.
The compact panel does not repeat retention timings; the exact policy below and
the processing confirmation remain unchanged. No instant-deletion promise is added.

Copy must match the current mode: fake development preview reads/uploads no
selected file and creates no downloadable video; real processing uses temporary
device/private cloud copies and transfers a bounded audio/video proxy to Gemini.
Describe the existing two-hour workspace/source access, ten-minute-or-session
output access and explicit Clear behavior without promising no storage, instant
physical deletion, deletion of downloaded copies or control over Google's
separate retention rules. This copy change does not verify vendor settings or
alter retention, processing, storage, spend or release gates. Earlier
`Privacy & limits` wording is superseded for current UI.

### Owner-confirmed public release choices — 2026-10-03

The owner confirmed the ScreenPilot-informed release choices: host the public
Next.js frontend and private Express control API on Cloud Run in the existing
ClipBuilder project/europe-west1 region alongside the private renderer. Browser
API calls remain same-origin; limited runtime identities authenticate the
frontend-to-control and control-to-renderer hops, with a separate expiry caller.
Initial releases use the managed frontend run.app URL and manually deployed
exact audited images; a custom domain is a later decision and CI stays quality-only.

The hosted verification checkpoint starts fake/paid-disabled/live-off. Anonymous
public live processing is the accepted eventual operating model, protected by
Turnstile and the existing limits, after controlled live verification, enforceable
spend safeguards and explicit enablement. The owner accepts the paid-project
Gemini data-policy approach, disclosed proxy transfer, no optional data sharing,
limited provider safety retention and an adult audience in supported regions.
Actual provider/project settings, public privacy copy and release evidence remain
unverified; hosting in europe-west1 does not promise provider processing there.

The USD 10 project and USD 5 Cloud Run alert targets are confirmed; the USD 10
project alert has earlier private-check evidence, while the USD 5 Cloud Run alert
still needs verification. Gemini's numerical monthly limit and a fresh paid-test
allowance are deferred to the paid-testing checkpoint. Prepare an estimate and
agree the bounded allowance before dispatch, then measure actual per-flow cost.
The first full-flow plan is one flow, at most two AI calls and four media
operations, without automatic paid retries. No paid test is authorized by this
decision. Public sample/download-example/product-film rights remain unresolved;
the previous source permission covered only the private test.

The [CL-015 decision record](tickets/CL-015-deploy-validate-measure-and-rollback.md#owner-release-decisions--2026-10-03)
owns the confirmation and remaining evidence. This is documentation of choices;
public transport/identity/container implementation, credential use, cloud
changes, deployment and paid/public enablement remain separate work/checkpoints.
Fake/no-key fixtures still work with disabled Download; no local AI model is
implemented or verified. Real Gemini needs keys/live/rights and a budgeted call
approval; real cloud rendering has its independent IAM/compute/spend gate.

Unchanged product/grounding/security requirements in the earlier specification
remain applicable where consistent with this current revision. The collapsed
body retains historical decisions/evidence; its conflicting mechanisms and
old gates are not current implementation instructions.

<details>
<summary>Earlier source-of-truth revisions and evidence — conflicting mechanisms superseded</summary>

- Status: Browser-owned-media architecture revision planned on 2026-10-01; CL-005 feasibility and privacy/spend decisions remain gated
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
| State | Browser owns original video, normalized results, assembly assets and final output; no application database or cloud object-storage service | **Owner-directed revision - 2026-10-01** | OPFS/IndexedDB are browser-local, not backend storage. See section 0.9; server GCS objects, markers and leases are withdrawn. |
| Public real source flow | Include one bounded local source flow in addition to the sample | **Owner-directed architecture revision - 2026-10-01** | Original video stays on-device. Protected audio/text AI remains disabled in committed/default/test configuration and cannot be enabled until security, privacy, spend, provider and launch gates pass. |
| Languages | English transcription and Latin-script caption QA for v1 | **Proposed - owner approval required** | Arabic/English code-switching is not claimed until bidi, font, punctuation, and provider tests pass. |
| Speaker framing | Detect camera cuts, visible faces, and the active speaker, then keep the speaking person centered in the vertical frame | **Locked** | Active-speaker reframing is a core proof, not an optional feature or manual crop preset. |
| Active-speaker tool | Provisionally use browser LR-ASD default AVA plus YuNet, preserving the complete audiovisual score path | **Owner-directed candidate - 2026-10-02; feasibility gated** | Local assets/export/native/WASM inference are authorized and measured in CL-006. Full browser preprocessing/tracking, labelled quality and resource acceptance remain required; landmarks or a native run alone do not satisfy this gate. |
| Contextual visuals | AI plans and inserts 1–3 grounded visual beats using generated stills or deterministic graphic/equation cards | **Locked** | Visual storytelling is a core automatic-composition layer, not a vague decorative accent. |
| Visual asset tool | OpenAI Image API with a fast current GPT Image model for generated stills/cutouts; MathJax SVG for exact equations/cards | **Proposed - owner approval required** | Re-check model access, cost, latency, data policy, and visual quality before live enablement. |
| Public source bound | 20 minutes **and** 500 MiB; owner validation ceiling 60 minutes and 1.5 GiB | **Locked** | A public upload must satisfy both independent ceilings. Raising them requires a future spec/code revision plus measured latency and cost evidence; runtime configuration may only lower them. |
| Render count | One confirmed immutable manifest and final local artifact per workspace | **Locked product intent; local semantics revised** | Browser previews zero to four candidates. Failed local encode recovery needs an explicit same-manifest policy; local UI counters are not hostile-client enforcement or a paid-operation ledger. |
| Trend context | Omit trend-signal input from the first public demo | **Locked** | The demo avoids stale or user-injected platform claims. Candidate reasoning uses the source transcript and the source-controlled editorial rubric only. |
| Sample rights | Use purpose-recorded media and signed contributor permission | **Proposed - owner approval required** | No sample media enters Git or deployment until provenance is recorded. |
| Publishing | Download only; no direct social publishing | **Locked** | No platform OAuth, app review, scheduling, or posting liability. |
| Source intake | Local File preview and bounded browser-managed import | **Owner-directed revision - 2026-10-01** | Original video is not uploaded. Measured local-copy progress must not claim network upload. Only separately disclosed, bounded audio/text may reach protected AI routes. |
| Refresh recovery | One disposable browser workspace: OPFS binaries and IndexedDB metadata/results, with memory-only fallback | **Proposed - approval and spike required** | Recovery depends on origin storage surviving; interrupted remote work is not automatically retried. Physical cleanup while the browser is closed cannot be promised. |
| Cloud region | `us-central1` for the first cost-validated deployment | **Proposed - owner approval required** | If residency or audience latency matters more, choose one compatible region before provisioning. |
| Text model | OpenAI Responses API with `gpt-6-sol`, Structured Outputs, and `store: false` | **Proposed - owner approval required** | Re-check availability, pricing, retention, and project access before enabling live calls. |
| Transcription | Deepgram Nova-3 pre-recorded with word timestamps and diarization | **Proposed - owner approval required** | Re-check language, retention, opt-out, limits, and project settings before live use. |
| Visual direction | CL-002 brand colors/type remain the interim foundation; the core flow uses one responsive dynamic workspace inspired by ScreenPilot | **Owner-directed revision - 2026-10-01** | Replace the rejected CL-004 multi-panel/equation UI now. Establish shared tokens and used primitives; later visual refinement remains required. |
| Candidate duration preference | Prefer a complete interesting conversation near 60 seconds when the source earns it, within the locked 10-60 second bounds | **Owner-directed - 2026-10-01** | Target three to four strong choices, never pad weak candidates or stretch an incomplete idea to hit a duration/count. |
| Automatic pause/filler removal | Owner requests natural context-preserving internal cuts as a later pipeline enhancement | **Deferred contract revision - 2026-10-01** | Current candidates remain contiguous word ranges. A future ticket must define immutable ordered segments, output-duration accounting, evidence, audio continuity, preview/render parity and regression tests before internal cuts ship. |
| Landing product film | CL-013 owns an original motion-graphics walkthrough authored from finalized UI captures by the owner-designated `gpt-6.1-sol` agent | **Owner-directed - 2026-10-01** | Not CL-004. Final UI/capture, storyboard, rights and film approvals precede production/integration; external sharing is illustrative manual posting after download, not direct publishing. |
| Third-party setup order | CL-004A owns thorough non-GCloud owner setup guides; GCloud setup and external cloud evidence stay in final CL-015 | **Owner-directed - 2026-10-01** | Earlier tickets use local/fake verification; CL-012 audits provider readiness, CL-014 carries explicit cloud deferrals, and no setup/live/spend approval is inferred from documentation. |
| Retention | One disposable workspace with fixed non-renewing 2-hour logical expiry from source admission, explicit clear and active/next-open orphan/expiry sweep | **Owner-approved - 2026-10-01** | Best-effort browser storage; no history or persistent-storage permission. Closing a tab cannot guarantee immediate deletion. Partial cleanup intent survives; provider transfer/retention approval remains separate. |
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
   browser-local disk retention/recovery, admitted audio/text transfer, and
   public privacy copy. No cloud transcript/object store is planned.
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

### 0.6 Owner-directed core-flow revision (2026-10-01)

The owner rejected the first CL-004 multi-panel synthetic/equation treatment.
This supersedes the earlier interim approval for that core-flow composition,
not the CL-002 brand foundation or any rights/privacy/spend gate.

- One viewport-aware workspace changes content through intake, upload,
  analysis, single-candidate choice, automatic assembly and final review.
- Intake foregrounds drop/choose video, formats and exact limits. Until live
  upload is implemented and enabled, show its unavailable state honestly and
  keep the no-cost sample usable. Original video stays local; section 0.9
  separately permits disclosed bounded audio/text at protected AI routes.
- Shared reusable tokens, buttons, stage framing, action footer and progress
  primitives own consistency. Use ClipBuilder's approved palette/type, not
  ScreenPilot's colors or its product-specific components.
- Keep mode details in Privacy & limits, not a header badge or repeated
  synthetic explanations, per the latest explicit owner direction.
  Evidence/rationale/caveats remain available on demand rather than dominating
  the first view. Remove the equation illustration from this UI; this does not
  remove grounded equation rendering from the later composition pipeline.
- Animate deliberate selection/actual playback and genuine progress at normal
  timing under every motion preference. Upload percentage is measurable; analysis and
  assembly use known stage labels and indeterminate progress, never timer-based
  percentages, fictional work, or invented completion.
- Prefer fuller moments near one minute when editorially sound. Three to four
  is a target, not a quota; zero-to-four and the honest no-candidate state stay.
- Live upload, analysis, speaker/visual/caption assembly, render/download and
  media rights remain in their existing gated tickets. CL-004 establishes the
  reusable flow and implements only locally possible sample behavior.

The detailed implementation plan and ScreenPilot reference evidence are owned
by `tickets/CL-004-deliver-sample-candidate-review.md`. This revision takes
precedence over older screen-layout instructions in sections 6 and 18.

**Latest video-first review clarification:** CL-004 prioritizes a large portrait
with inline playback controls, a compact candidate rail and Transcript / Agentic
Notes tabs. Notes explain existing timestamp-grounded selection evidence; final
review places manifest-bound edit notes left and transcript right. They do not
invent trends, views, internal cuts or successful real processing. Result uses
preview/download left and display-only Facebook, Instagram, TikTok and X buttons
right, disabled with owner-requested Soon labels. These inert action teasers are
the sole exception to the disabled-roadmap-navigation rule; direct publishing
remains excluded. Repeated demo prose and the header mode badge are removed at
the owner's direction. The owner also removes the privacy dialog's bottom
development-summary paragraph; its rights/scope/size rows and no-file-read/
upload statement remain. Explicit video placeholders and disabled unavailable
actions are unchanged. Actual download still requires validated output.

**Latest result-layout decision (2026-10-03):** Download MP4 shares the workflow
footer with Start over, keeping the portrait preview free to scale with the
available card space. Remove the repeated visible simulated-preview sentence;
the fake download remains disabled with an accessible mode description, and
intake still identifies simulated results. This owner decision supersedes the
older adjacent visible fake-download notice requirement only on this result
screen. Real playback verification, access/expiry/error status and transcript
remain available. Facebook, Instagram, TikTok and X use platform marks with
names inside glass buttons, blurred beneath a bold centered Soon overlay. They
remain disabled display-only teasers; no social connection, upload or publishing
is added.

**Latest export confirmation decision:** Final review exposes Confirm export
directly. There is no Continue to export hop, separate confirmation screen or
Back action for that hop. This explicit click starts the manifest-bound render;
entering or restoring review never starts a job. The one-render allowance,
validated evidence, duplicate-start safeguards and existing progress remain.
Old persisted confirmation hints restore to review, not automatic export.

The owner explicitly removes app-level motion suppression permanently; this
supersedes reduced-motion alternatives for this application without authorizing
changes to OS/browser settings. Motion accessibility and final visual approval
remain open gates, not inferred compliance. Fake progress keeps its simulated
stage percentages; real presentation may show elapsed time and an asymptotic
indeterminate activity fill, never its cosmetic value as measured percent/ETA.
Proven completion finishes the fill before the next screen. Detailed execution
and verification remain in the active CL-004 packet.

### 0.7 Landing product-film ownership (2026-10-01)

The owner assigns the original landing motion-graphics film to CL-013, after
the actual UI has been finalized and visually approved. CL-002 reserves the
hero/placeholder; CL-004 implements the functional frontend, not this film.
CL-013 owns sanitized final-UI screenshots, the `gpt-6.1-sol` authoring handoff,
storyboard/animatic, cinematic cursor-led screen transitions and titles, approved
result reveal, editable composition, web/master/poster delivery and landing QA.
Its detailed readiness/production/approval contract is in
`tickets/CL-013-complete-accessibility-responsive-and-performance-pass.md`.

The story can end with the downloaded clip being uploaded manually to approved
representative social destinations in a clearly separate external vignette.
This does not add direct publishing, account/OAuth integrations, actual posts,
or an "all platforms" compatibility promise. Capture/media/privacy/rights,
external-action, spend and public-claim gates still apply; no unapproved real
content or generated media enters Git. Final UI, film and landing placement
approval are separate from automated engineering checks.

### 0.8 Provider readiness and final-ticket cloud setup (2026-10-01)

**Resource inventory superseded by section 0.9:** final-ticket ordering remains,
but bucket/storage/native-media jobs and cloud render proofs are withdrawn,
not deferred. CL-015 owns hosting/transport/admission release proof only.

The owner requests complete non-GCloud dashboard/software setup documentation
before real integrations, and all GCloud setup at the very end. Add the
owner-requested CL-004A readiness packet after CL-004 without renumbering existing
IDs. Its canonical guides are `operations/PROVIDER_SETUP.md`,
`operations/COST_MODEL.md` and `operations/THIRD_PARTY_SOFTWARE.md`.

These cover OpenAI, Deepgram and Cloudflare Turnstile accounts/projects, model
access, billing, scoped keys, ignored local env mapping, privacy/retention,
numeric budget decisions, hard-limit versus alert behavior, verification,
troubleshooting, rotation/revocation, and local media/vision/card dependencies.
The documentation is prepared; owner account/settings/budget evidence remains
unchecked. No provider account mutation, purchase, key use or paid check is
authorized by this planning decision.

CL-015 remains the final packet and exclusively owns GCloud account/billing,
project/API enablement, IAM, bucket/CORS/lifecycle, registry, Secret Manager,
service/job provisioning, cloud benchmarks, deployment and external cloud
verification. CL-005's GCS mechanism spike, CL-006/008's actual Cloud Run
performance proof, and CL-011's cloud render/storage proof transfer there.
Earlier packets still implement source-controlled adapters/configuration and
prove them with local/fake contract tests; no live-cloud dependency is required.
CL-006 must produce a rights-approved local speaker go/no-go before CL-008;
local measurements are not deployed performance evidence.

CL-012 audits provider documentation and implemented controls, not cloud setup.
CL-014 may declare repository readiness with these explicitly named CL-015
external deferrals, never public/live readiness. CL-015 enters with the audited
candidate and owner authorization, then satisfies its cloud gates in order
before enablement. Any failed mechanism/runtime gate blocks release; a material
fix returns to its owner and receives the smallest relevant CL-014 re-audit.
Do not create a circular requirement for deployed evidence before deployment.

This ordering supersedes older passages that allow early cloud execution or
require cloud proof to finish local implementation. Rights, privacy, numerical
spend, paid-call, visual and launch approval gates remain intact.

### 0.9 Browser-owned-media architecture revision (2026-10-01)

**Latest owner decision:** the original video and final output belong in the
browser. "No database" does not mean a database-free backend that still keeps
source media, transcripts, jobs, results, coordination markers and leases in
GCS. No application database or cloud object-storage service is part of this
revision. Hosting and protected AI requests remain possible; neither is
permission to store visitor content remotely.

The detailed current architecture, evidence, alternatives, recovery matrix and
feasibility gates are in
[Browser-owned media](architecture/BROWSER_OWNED_MEDIA.md). This section
incorporates that document as the current technical planning contract;
implementation ownership and file-level migration belong to
[CL-005](tickets/CL-005-implement-secure-upload-and-storage.md).
Browser ownership is decided; the library/runtime, privacy details and paid
deployment guarantees below are recommendations awaiting proof, not completed
implementation or approval to contact providers.

#### Current pipeline and boundaries

1. Choose an owned/licensed MP4. Retain the `File` in a runtime owner
   for immediate local playback, inspect locally, and perform capability/quota
   preflight before paid work. Preserve the 15-second minimum, independent
   20-minute/500-MiB public ceilings and 10-60-second selected-clip bound.
2. When available, stream one source copy into OPFS. IndexedDB owns a bounded,
   versioned workspace record and normalized transcript/candidate/manifest
   JSON; OPFS owns large binaries/assets/output. No video/base64 belongs in
   sessionStorage/localStorage. No durable projects/history are introduced.
3. Extract only audio locally with a worker and a proven media library. Send
   bounded audio to a protected transcription request; send bounded normalized
   text to protected candidate/visual-planning requests. Provider keys remain
   backend-only. Original video and final MP4 do not cross those routes.
4. Return bounded results/assets to the browser. Validate them, resolve exact
   word ranges, and preview the chosen source using immutable start/end times.
   Notes remain read-only and timestamp grounded, never a chatbot/trend claim.
5. Analyze only the selected range for speaker/scene framing locally, assemble
   fixed captions/contextual visuals, and use one shared deterministic browser
   compositor for preview and the one confirmed export.
6. Encode/mux the final clip locally, validate it locally, and download the
   browser-owned file. A remote backend cannot open OPFS/IndexedDB. No server
   FFmpeg/ffprobe/Python job can be retained by pretending it has those bytes.

WebCodecs plus Mediabunny demux/mux, workers and a bounded Canvas2D/WebGL
compositor are the recommended starting point, subject to CL-005 probes and
CL-006/008/011 proofs. Broad ffmpeg.wasm is not the default. AAC-only WASM is a
possible codec fallback after exact dependency/build licensing and performance
review. Neither container support nor a successful API-presence check proves
1080x1920 H.264/AAC output on a particular phone/laptop.

The owner's verification decision on 2026-10-01 limits the demo gate to
automated checks, measured desktop-browser media/storage behavior and responsive
viewport checks. Hardware certification and a cross-engine test matrix are not
required. Keep runtime capability probes and explicit unsupported states;
successful measurements do not authorize universal compatibility claims.

Active-speaker framing remains required. Face landmarks or mouth-motion
heuristics alone are not equivalent to synchronized audio/visual active-speaker
inference. CL-006 must prove a browser-executable model and CL-008 must preserve
its quality; a no-go blocks that release claim. A remote selected-video/frame
analysis fallback needs a new explicit owner privacy/architecture decision and
is not approved by this plan. No internal filler cuts are introduced until the
existing deferred ordered-segment contract revision is approved.

**Active-speaker owner decision (2026-10-02):** provisionally select the released
LR-ASD default AVA model and small MIT YuNet detector for the local browser path.
This supersedes the older Light-ASD-first/control choice below. The owner
authorized pinned local assets, complete score-head conversion, independent
upstream numerical references, private local media tests, browser inference
checks and scoped removal of superseded Light-ASD artifacts after verification.
The [CL-006 evidence](tickets/CL-006-build-media-job-and-speaker-feasibility.md#lr-asd-local-export-and-inference-evidence-2026-10-02)
records actual results and deviations. Scores are raw class-1 logits, not
calibrated speaking probabilities. Preserve all six distinct 1-6-second
durations and the four simultaneous face-track bound. Complete browser
video/crop/track parity, labelled focus quality and agreed resource thresholds
remain gated; this is no shipping-quality winner or public release approval.
Deepgram/OpenAI composition and the prohibition on remote original/video/frame
analysis remain unchanged. Native Python/FFmpeg are offline comparison tools
only. The owner manually changed host policy; no agent security change is
authorized. Independent review was explicitly stopped by the owner.

#### Local storage and retention

Use a single workspace, opaque local artifact names, bounded incremental I/O,
and no full-source `ArrayBuffer`/base64 or duplicate IndexedDB video copy.
Quota estimates are advisory: quota failure/eviction/private browsing must
leave a truthful recoverable or unsupported state. Default to best-effort
storage, not a request for durable persistence. When OPFS is unavailable,
memory-only mode may proceed only if the complete bounded output path passes
preflight; refresh then needs re-selection and validated source identity.
If that cannot be proved, stop before paid work rather than silently upload.

The owner explicitly approved a fixed, non-renewing two-hour local access
expiry measured from source admission on 2026-10-01. It is a recovery/retention
policy, not a two-hour processing-time limit. Clear/replacement/cancel first fence
late worker results and record cleanup intent, then stop workers, close handles,
revoke Blob URLs and delete owned artifacts. IndexedDB and OPFS are not one
atomic transaction: publish references only after complete writes and reconcile
incomplete/orphaned records on open. Use an exclusive cross-tab workspace owner;
if no reliable lock exists, disable persisted multi-tab mutation. Never clear
another application's origin storage.

Refresh can recover committed local artifacts. Closing the tab does not
guarantee physical deletion; expiry cleanup runs while active or on next open.
Same-origin scripts, eviction and user-cleared site data remain relevant. No
privacy copy may claim that all processing is offline, no bytes leave the
device, or provider retention is zero merely because `store: false` is used.
The owner approved this disk-retention/recovery tradeoff, including possible
disk survival until the next opening and best-effort eviction. Public provider
transfer/retention copy and other privacy/release gates remain separate.

#### Protected AI and honest coordination guarantees

The backend receives only explicitly admitted bounded audio/text and returns
bounded normalized results/assets within request scope. No content is saved to
a bucket, database, durable job or application log. Any bounded request buffer
is released on terminal paths; application buffer disposal is not a promise of
cryptographic RAM erasure or control over provider/platform retention.
Admission validates actual received bytes/format and bounded audio duration;
browser metadata cannot establish a server-trusted original-video descriptor.

Authentication/CSRF checks, short-lived HttpOnly grants, Turnstile, input/token/
image limits, timeout/cancel and zero automatic paid retries remain. A cookie
counter is not a replay lock: previously valid cookies can be replayed.
Recommended initial admission is bounded process-local atomic reservation plus
content-free idempotency/tombstones, with a boot-epoch-bound grant that fails
closed after restart. A lost/uncertain paid response does not permit resubmission.
Completed browser-cached evidence can be reused without new calls; an in-flight
request cannot be recovered by reading browser storage from the server.

These controls provide at-most-one dispatch only within the issuing process's
lifetime and retained action record. They do not provide distributed exactly-once
execution, a durable global monthly counter, per-person quota, cross-replica
recovery or provider-result retrieval after restart. One configured instance
does not prove global atomicity across deployments/restarts. Public anonymous
paid enablement remains gated on explicit owner acceptance of a controlled
deployment's limitations and independently verified provider hard caps, or a
new approved coordination design. Do not silently introduce Redis/GCS/SQL or
claim that encryption solves this gap.

Local rendering has zero AI calls and no backend render job. One confirmed
manifest produces one final artifact; retrying a failed local encode is not a
paid retry, but requires an explicit immutable-manifest local recovery policy.
Do not claim a hostile browser is prevented from copying/downloading its own
bytes or from bypassing local UI counters.

#### Migration and ticket readiness

CL-005 owns local intake/storage/recovery, actual range playback, capability
spikes, shared-contract/state/config migration and protected-admission foundations.
CL-006 owns production audio extraction and browser speaker feasibility;
CL-007 protected transcription/selection; CL-008 selected-range speaker tracks;
CL-009 browser-owned assembly/assets; CL-010 compositor review parity;
CL-011 local validated MP4 export; CL-012 control/privacy audit;
CL-013 responsive/visual/accessibility/film quality; CL-014 repository audit;
CL-015 hosting, actual transport/deployment controls and authorized release proof.
CL-004A retains non-cloud provider readiness. No cloud bucket, native media job
or cloud rendering proof is deferred to CL-015: those mechanisms are withdrawn.

Existing application code and `.env.example` still implement the CL-004 fake
baseline and legacy future schemas. This documentation pass does not change
them. CL-005 must migrate `objectGeneration`, cloud-dependent config, backend-
authoritative artifact reconciliation and upload/render capabilities together,
without breaking fake/off defaults or re-creating the single-card UI.
Implementation evidence and outstanding feasibility/license/rights/paid/cloud
results are recorded in the owning tickets, not inferred from this plan.

#### Superseded technical text and reading boundary

Older detailed passages below remain decision history where they prescribe
GCS objects/capabilities/generations, object-backed leases, server media jobs,
native/Python runtime paths, FFmpeg final rendering, bucket TTL or cloud-media
benchmarks. They are **not active requirements or executable setup instructions**.
This applies to the old media mechanics in sections 4-7, the future tree in 9,
object/operation fields in 10, routes in 11, storage/job ports in 12, the native
pipeline in 13, storage lifecycle in 14, retention inventory in 15, configuration
tables/example in 16, coordination/cost details in 17, deployment in 21,
ticket summaries in 22, media-specific release/owner items in 23-25 and
Appendices A-D. Use this section, its linked architecture contract and revised
ticket checklists instead. Product constraints, exact source/clip bounds,
grounding/caption/visual quality, shared boundary direction, fake test isolation,
rights, secret handling, safety, single-card UI and permanent motion decision
remain in force. Historical checkboxes cannot be relabeled as passing the new
browser pipeline. Only the owning ticket's actual code/proof can replace them.

## 1. Locked product contract

### Owner clarification: development preview (2026-10-01)

This clarification supersedes the sample-only implementation restriction in
section 0.6 and older CL-004/queued UI ownership descriptions. Fake mode is a
development-only preview of the same product workflow, not a second public
sample product. CL-004 owns the complete frontend journey: intake, simulated
upload, analysis stages, exactly one choice, automatic build, read-only review,
render confirmation, render and export states. All stages reuse the existing
session reducer, contracts and shared design system. Later packets replace fake
adapters and prove real behavior; they must not recreate the UI or mark their
provider/media/privacy/rights gates passed by this preview.

Synthetic stage labels, byte progress, tracks and completion are permitted only
in the local development preview disclosed in Privacy & limits. Selected files
are never read, played or transmitted by this preview, and names are not
displayed or persisted. Prepared original transcript animation is not recorded
footage.
The export state has no media download capability and must not produce a file
presented as a valid edited video. The latest owner direction removes the
header mode badge, repeated notices and the privacy dialog's bottom development
summary. Its rights/scope/size rows and no-file-read/upload statement remain,
alongside explicit video placeholders and disabled unavailable actions. This
presentation change does not enable real upload, processing or download.

Interrupted pre-media upload restoration in this development flow must confirm
cleanup through the existing clearing state before returning to intake. Pending
cleanup intent survives failure or refresh as a separate content-free marker,
even after the ordinary projection is removed. Bootstrap retries the existing
idempotent cookie-scoped cleanup before enabling input, removing the marker
only on confirmed success. No identity, media or capability is retained in it.
Runtime input metadata is deliberately not persisted and cannot safely reuse a retained
authorization for a replacement source. A cleanup failure keeps the existing
retry boundary; completed upload and later operation restoration still use
validated server evidence. Same-input retries remain idempotent and stale session/
upload IDs remain rejected. This is not proof of real resumable transport; CL-005
still owns that gated adapter and any verified source-reselection/resume path.

Latest owner progress revision: fake inspection, analysis, assembly and render
also show an advancing percentage/fill derived from the canonical reported
stage order. This is simulated presentation progress, not measured provider
completeness or an ETA; it stops when stage evidence stops and reaches 100%
only on proven success. This exception supersedes older no-fake-percentage
wording only inside this local development preview. Real processing
retains named stages/indeterminate progress until measurable totals exist.

`FAKE_MODE` is the one authoritative server mode selection, defaulting to
false under the 2026-10-06 owner decision. Internal `providerMode` is derived; legacy `PROVIDER_MODE` may only assert
the same value, never override it. `.env.local` is ignored and owner-managed,
with matching example entries and blank credentials/identifiers. Only explicit
server startup loads that file; tests/CI never load it. The browser receives
only safe mode/availability data, not server settings or secrets. False selects
real mode without fallback, but existing paid/live/readiness/rights/cloud gates
still apply; unimplemented real adapters remain unavailable. No external
processing or spend is authorized by this clarification.

### 1.1 Product sentence

Owner-approved landing process copy (2026-10-01): **Turn long-form video into a
clip worth sharing.** Supporting copy: "AI finds the standout moments in
interviews, podcasts, speeches, and more. You choose one. We finish it with
captions and visuals." This positions the intended product around spoken-content
video rather than podcasts/conversations alone, including talk shows and
monologues. It does not claim validated support for every content type or
arbitrary/silent video. The conversation remains the canonical demo fixture;
per-format real-media validation and all rights/privacy/provider/spend/release
gates remain open. One source, one selected 10-60 second clip and automatic
captions/contextual visuals are unchanged.

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

Owner landing revision (2026-10-28, CL-101): replace the old nine-platform wall
with a compact introduction and three researched campaign examples: Whop,
Clipster and Picsart. Use their official locally served vector logos. Owner follow-up CL-104 removes
Explore/actions and external navigation; retain decorative card hover with no
interactive role or tab stops.
Brands/creators fund paid clipping campaigns; these are unaffiliated market
examples, with no earnings guarantee. Availability, eligibility, rates and rules
vary. This shortlist is not a definitive popularity ranking: published audience
and payout measures are not comparable.

Owner correction (2026-10-28, CL-103): the separate animated example uses a
five-clip batch, 60 manual minutes versus a 10-minute ClipBuilder target. That is
about 17% **of** the original time, 50 minutes back (roughly 83% saved), replacing
CL-101's mistaken 25%-less interpretation. Use clock/timeline/countdown motion
and distinctive brand-colored platform cards while keeping the market compact.
Owner follow-up CL-105 removes the visible explanatory footnote, retaining
the then-current Illustrative goal / Target labels. CL-110 removes the goal
badge, retaining what-if/Example/Target framing and the accessible qualification.
Historical suggestion-discovery
timings do not establish a finished-clip production or manual-time benchmark.
Do not represent it as a benchmark, guarantee, fixed clip yield or support for
hours-long uploads.
Scroll-triggered numeric animations retain accessible and no-JS final values.

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
- MP4 spoken-video intake within explicit limits;
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

**Browser-owned revision (2026-10-01):** Current media/recovery mechanics are section 0.9 and Browser-owned media. Older upload/job/capability steps here are historical; local preparation and bounded protected audio/text replace them.

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
- declared type `video/mp4`;
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

**Browser-owned revision (2026-10-01):** The existing reducer is migrated in CL-005, not replaced by a parallel machine. Server-authoritative artifact restoration and cloud upload/job hints below are legacy; section 0.9 and the current recovery matrix govern real mode.

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

**Browser-owned revision (2026-10-01):** Retain the latest CL-004 single-card presentation. References below to direct original-video upload, remote playback/render and separate confirmation are superseded by sections 0.6/0.9; do not build those surfaces.

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
motion cue that remains animated under every motion preference. Future stages remain
visible but unclaimed. No animated fake percentages.

Actions:

- `Stop processing` when cancellation is supported or best-effort;
- `Clear media` always;
- `Retry` only after failure and only when the recovery policy allows it.

Refresh messaging says “Reconnecting to the same analysis,” never “Starting
over.” If the operation cannot be found, reconcile to the safest proven stage
and show recovery choices.

### 6.5 Candidate review

**Latest owner revision (2026-10-01), superseding the layouts below:** Start
with one to four 9:16 candidate previews and no transcript. Playing a choice
selects it, smoothly relocates its player to the center, keeps other vertical
choices in a scrollable left rail, reveals transcript/evidence on the right,
and shows Proceed for that one selection. Tablet/phone rearrange the same
content into bounded panes without growing the workspace. Source preview uses
the immutable word-derived start/end range, not separately rendered variants.
Development mode shows explicit resolution placeholders and simulated playback;
actual footage/capabilities remain gated in the real-media adapters. Detailed
implementation and verification are owned by CL-004.

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
output format, one-render limit, and temporary-data deadline. `Confirm export`
is the primary action, integrated into this same review screen under the latest
owner decision.

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

Confirmation is the explicit `Confirm export` action on automatic clip review,
not another screen or generic modal. Keep the output facts, one-render limit,
temporary-data deadline and rights reminder in the read-only review context.
The click starts the manifest-bound job; mounting or restoring review does not.

Render progress uses named stages and elapsed time. The automatic composition
summary remains read-only. Disable confirmation while its request is starting
and when evidence or allowance is unavailable; there is no intermediate Back
action. Leaving the page does not cancel the server job.

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

**Browser-owned revision (2026-10-01):** Immutable ranges, caption/visual rules and shared preview/output semantics remain. Server asset capabilities and FFmpeg compilation are withdrawn; the browser compositor and local encode pipeline in section 0.9 replace those mechanics.

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

**Browser-owned revision (2026-10-01):** Superseded architecture history: sections 8.1-8.7's GCS/media-job/grant-counter/lease architecture is not an execution contract. Use section 0.9 and architecture/BROWSER_OWNED_MEDIA.md; section 8.8's dependency direction remains valid.

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

**Browser-owned revision (2026-10-01):** The eventual server-storage/job/vision/render tree below is historical and must not be scaffolded. CL-005's inspected file-level migration owns current changes; later browser modules arrive only in their named packets. Document ownership and dependency constraints remain.

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
│     ├─ THIRD_PARTY_SOFTWARE.md
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

**Browser-owned revision (2026-10-01):** Keep the exact source/clip bounds and grounded domain schemas. Cloud generation/capability/job fields below are legacy designs, migrated with fixtures in CL-005. No browser artifact metadata becomes server-trusted proof of unseen original bytes.

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

- `ses_…`, `upl_…`, `op_…`, `ana_…`, `cand_…`, `asm_…`, `man_…`, `rnd_…`;
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
  container: "mp4";
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
  manifestId: string;
  manifestHash: string;
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

**Browser-owned revision (2026-10-01):** Historical route design, not permission to expose original-video uploads or server render/download capabilities. The current contract is bounded request-scoped AI plus protected admission, with browser-owned artifacts. CL-005/007/009 define only the routes their actual modules implement.

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
| `GET /v1/assemblies/:assemblyId` | Fetch tracks, plan, assets, and immutable automatic manifest | Private storage read/signing |
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
  manifestId: string | null;
  manifestHash: string | null;
  renderId: string | null;
  outputAvailable: boolean;
  remaining: {
    analysisRetries: number;
    renderAttempts: number;
  };
};
```

`assemblyId`, `assemblyRevision`, `manifestId`, and `manifestHash` are all
required once `provenStage` is `clip-review`, `rendering`, or `result`; they
remain nullable while assembly is in progress. Manifest identity and hash must
appear together and belong to the server-proven assembly. The browser cannot
restore or author an alternate manifest.

It does not return signed URLs or full content. Expired/invalid cookie returns
`401 SESSION_EXPIRED` and clears it.

### 11.7 `POST /v1/uploads/authorize`

Request:

```ts
{
  declaredBytes: number;
  declaredContentType: "video/mp4";
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
    candidateId: string;
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
visual planning, bounded asset creation, and immutable automatic-manifest
compilation. It does not re-transcribe or re-rank candidates.

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

**Browser-owned revision (2026-10-01):** Grounding, bounded structured output and deterministic fake isolation remain. Storage/job ports and content-retaining orchestration below are withdrawn; section 0.9 governs request-scoped provider transport, receipts and browser result ownership.

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

**Browser-owned revision (2026-10-01):** Superseded native/server execution design. Do not implement Python/ffprobe/FFmpeg jobs from these steps. Preserve quality/timing/grounding requirements through the browser worker/compositor pipeline and CL-006's explicit browser active-speaker go/no-go.

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

**Browser-owned revision (2026-10-01):** Historical GCS/bucket/sample/job lifecycle, withdrawn rather than deferred to CL-015. No bucket, object metadata/generations or server job is required. Current OPFS/IndexedDB publication, expiry, clear and recovery are in Browser-owned media.

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

**Browser-owned revision (2026-10-01):** The old server-object data inventory and bucket-retention copy below are superseded. Section 0.9 separates local disk lifecycle from admitted audio/text/provider retention. Rights, sensitive-inference prohibitions, secret/content-safe logging and browser/API controls remain.

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

**Browser-owned revision (2026-10-01):** Legacy planned schema/example: current code still has these future server-media fields, but CL-005 must remove their live-feature dependency as one schema/example/test migration. Do not populate bucket/job/native-media variables from this historical table. Hosting config remains private and separately gated.

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
| `FAKE_MODE` | `true` | Authoritative boolean: true derives fake provider mode; false derives live with no fallback |
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

Production startup fails if derived provider mode is live and paid operations appear
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

FAKE_MODE=true
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

**Browser-owned revision (2026-10-01):** Object-backed coordination and cloud-media cost entries below are withdrawn. Current admission is process-local, boot-epoch-bound and fail-closed, not cookie-only/distributed exactly-once. Browser encode has no AI call or remote job. Use current COST_MODEL and section 0.9; public paid enablement stays gated.

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
- workflow and landing navbar max width: 80rem (1280px at the default font size),
  with shared responsive gutters and a flexible preview center;
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
compact row of three researched paid clipping campaign platforms. CL-101
replaces the original text/CSS imitations with official local vector logos and
an explicit no-affiliation/no-earnings-guarantee disclosure; these identify
market examples, not customers, partners or integrations. A separate labelled
illustrative time-saving goal uses scroll-triggered count-up numbers. Later tickets build the functional controls when their behavior exists.
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
The permanent application motion decision above extends this owner-directed
always-on-motion choice across the app. Do not restore preference-based motion
suppression during release preparation or CL-013; accessibility review remains
required without implying compliance from that choice.

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

**Browser-owned revision (2026-10-01):** Fake test isolation, grounding/quality, rights and cleanup checks remain. Replace historical GCS/native-job tests with the revised packet's browser storage/codec/worker/provenance/admission tests. A tiny synthetic clip alone is not full-bound performance proof; responsive viewport checks follow the demo verification policy in section 0.9.

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

**Browser-owned revision (2026-10-01):** Superseded media hosting inventory: no GCS bucket, Cloud Run media job or server renderer. CL-015 now proves frontend/protected-API hosting, same-origin bounded audio transport, process restart/rollout guarantees, secrets, costs and authorized live evidence. The region/topology is still proposed, not provisioned.

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

**Browser-owned revision (2026-10-01):** The detailed older server-media milestone summaries below are historical. Use section 0.9 and the revised ticket index/packets for execution: CL-005 browser foundation, CL-006 audio/model feasibility, downstream browser composition/export, CL-015 hosting only.

The standalone execution packets live in [`tickets/`](tickets/README.md). This
is their canonical dependency summary; the packets do not authorize
implementation, Git actions, paid calls, provider/cloud changes, or deployment.

The earlier 22-slice draft was consolidated into 15 cohesive tickets on
2026-09-29; owner-requested CL-004A adds a provider-readiness gate on 2026-10-01.
CL-015 remains last. A single user-visible feature remains one vertical slice when its
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

#### CL-004A - non-GCloud provider readiness

**Objective:** Deliver and maintain the complete owner-facing provider,
budget and local-software setup guides before real integrations.

**Depends:** CL-001 config/secret boundaries and CL-004 development preview.

**Acceptance:** Current official dashboard paths, model/access/data/key setup,
env mapping, budget worksheet, enforcement classification, troubleshooting,
rotation and owner evidence are documented. Documentation readiness is separate
from external account/live approval. All GCloud work stays in final CL-015.

### M2 — private media intake and job foundation

#### CL-005 — secure upload and temporary storage

**Objective:** Implement the encrypted grant, content-free object model,
temporary-storage port/fake, idempotency/leases/clear, browser local inspection,
server-created resumable upload, completion checks, cancel, and partial cleanup.

**Depends:** CL-001, CL-003 and CL-004A's documented Turnstile/config handoff;
product/provider privacy approval before real provider use. GCloud setup and
the live GCS mechanism spike occur only in final CL-015.

**Why combined:** Upload is not safe or useful without the grant, object,
metadata, idempotency, and cleanup lifecycle that owns its bearer capability.

**Acceptance:** Tamper/expiry/key-rotation/atomic marker/deletion-partial tests;
no app-service media body; wrong/oversized/partial objects delete; the resumable
capability never persists/logs; adapter requests pass fake contract tests.
Actual CORS/resume/generation/abort proof is an unchecked CL-015 enablement gate.

#### CL-006 — media job and active-speaker feasibility

**Objective:** Build the one-job entry, descriptor/progress/result lifecycle,
safe process runner/temp workspace, authoritative ffprobe inspection/audio
extraction boundary, fake job runner, and exact-sample Light-ASD feasibility
benchmark on the intended CPU/container.

**Depends:** CL-003 and CL-005; rights/model/download approval for the
purpose-recorded local benchmark. Actual Cloud Run benchmark stays in CL-015.

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

**Depends:** CL-004, CL-004A and CL-006; provider/privacy/spend approval for any
separately authorized local provider check. Cloud end-to-end proof stays CL-015.

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

**Depends:** CL-004A readiness, CL-007 transcript-grounded model boundary,
CL-008 local-go focus track, and provider/privacy/spend approval for any local
provider check. Cloud end-to-end proof stays CL-015.

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

**Acceptance:** Rejection order/call-count/security tests; model weights/license
and provider/image-spend readiness audited. Cloud checklist prepared for final
CL-015, not recorded as applied or verified.

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

**Objective:** As the final ticket, guide and perform only authorized GCloud
setup, then deploy the exact audited revision as immutable images, prove
private services/storage/IAM, run unpaid probes, execute only the approved
bounded live analysis/assembly/render flow, reconcile cost/cleanup and
public claims, and prove kill switch plus digest rollback.

**Depends:** CL-014 repository audit, provider readiness and owner authorization.
Cloud evidence is produced inside this final packet, not required before entry.

**Acceptance:** SHA/digests/revisions/config and release evidence are complete;
transferred GCS mechanism, target-runtime speaker and cloud render checks pass;
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

**Browser-owned revision (2026-10-01):** Apply unchanged product/quality/security/rights requirements, but withdraw cloud-object/native-job acceptance items. Current release additionally requires local persistence/privacy approval, full-bound desktop-browser codec/performance proof, browser speaker go and justified no-shared-store paid guarantees. Historical boxes are not evidence.

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

**Browser-owned revision (2026-10-01):** Older GCS upload/retention and Cloud Run media-model decisions below are withdrawn. The current open decisions are in section 0.9 and Browser-owned media: browser model/codec feasibility, audio profile, provider data/cost approvals and paid deployment guarantees. The local retention baseline is owner-approved.

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

**Browser-owned revision (2026-10-01):** Use section 0.9 and the current active packet, not the historical private-object/server-media implementation text below. No original video/output leaves the browser; no DB/object store exception is inferred. Paid/external/Git actions still require explicit authorization.

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

**Browser-owned revision (2026-10-01):** Historical server-object recovery matrix. Browser-owned media's current recovery matrix supersedes it, including eviction, local re-selection, partial writes, boot-epoch invalidation and uncertain paid-result failure.

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

**Browser-owned revision (2026-10-01):** Existing fake stage codes remain historical compatibility inputs until CL-005 migration. They are not evidence of real upload, media jobs or remote rendering; current local/remote work semantics must be mapped explicitly.

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

**Browser-owned revision (2026-10-01):** Historical server-upload/object messages must not ship unchanged for local import. CL-005 maps storage/capability failures and uncertain paid work truthfully; raw filenames, content, credentials and provider details remain forbidden.

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

**Browser-owned revision (2026-10-01):** The native/cloud-media links below are historical alternatives, not a current resource list. Current primary-source browser research is in Browser-owned media; recheck exact runtime/provider versions and policies before execution.

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



</details>

<!-- build-progress:start -->
## Build command progress

Current phase: **local workflow finished**
Next action: Commit the exact final two-document handoff allocation and verify clean Git, then hand back the healthy fake/paid-off app. Next work requires owner review of provisional decisions and SEC90-01/release gates; never deploy or initiate paid/cloud work automatically.
Active ticket: CL-090
Phase prompts: delegated during AFK
Local commits approved: yes

AFK mode: AFK-SESSION-001
Provisional owner reviews: 04-decisions, 09-visual-review, 10b-security-review

### AFK decisions

- **AFK-0001** (AFK-SESSION-001, 2026-10-24T13:12:41+00:00, 06-plan-commit): Finish already-started CL-063 local verification before the baseline commits; preserve the running owner app.
  Reason: The owner requires all existing work validated and committed before audits.
  Consequence / reversibility: Only local synthetic checks; hosted identity/maximum resources/paid quality remain external. Reversible local source and Git commits.
  Owner review requested on return: yes. Evidence: docs/tickets/CL-063-local-hosted-release-verification.md, docs/operations/CL058_063_COMMIT_PLAN.md
- **AFK-0002** (AFK-SESSION-001, 2026-10-24T13:12:44+00:00, 04-decisions): Retain existing product decisions and proceed only with existing-work handoff and audits.
  Reason: The owner requested audits, not a new product/design round.
  Consequence / reversibility: No extra features; provisional checkpoint owner review remains outstanding.
  Owner review requested on return: yes. Evidence: docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md, docs/tickets/README.md
- **AFK-0003** (AFK-SESSION-001, 2026-10-24T13:34:26+00:00, 09-visual-review): Retain current visuals and proceed with requested audits while owner review remains outstanding.
  Reason: Desktop/phone states and native UI flow passed; no new visual feedback is assigned.
  Consequence / reversibility: No unsolicited design edits; personal visual/paid/release acceptance is not claimed.
  Owner review requested on return: yes. Evidence: docs/tickets/CL-062-designed-loading-states.md, docs/tickets/CL-063-local-hosted-release-verification.md
- **AFK-0004** (AFK-SESSION-001, 2026-10-24T13:34:26+00:00, 10a-quality): Use an isolated Git checkout for audit implementation and fake-only checks; keep the owner manual-review app on committed baseline 440c6a8.
  Reason: Editing watched backend/frontend source could restart or interrupt a paid owner request.
  Consequence / reversibility: Audit commits are reviewable separately. Applying them to the running checkout is deferred until owner manual review finishes; no second app is launched, and no credentials/media are copied.
  Owner review requested on return: yes. Evidence: docs/operations/CL058_063_COMMIT_PLAN.md, human:2026-10-24-current-build-audit-message
- **AFK-0005** (AFK-SESSION-001, 2026-10-24T13:48:22+00:00, 10a-quality): Execute CL-064 Q-01 obsolete image verifier, Q-02 explicit/resilient cleanup and Q-03 bounded read-only polling; retain speculative optimizations and supported legacy flows.
  Reason: The first two defects are reproduced; status read ownership has no deadline. Fixes preserve provider policy, calls, UI semantics and private diagnostics.
  Consequence / reversibility: Small local corrections and regressions are committed in the isolated checkout. Running-app source and paid manual review remain unchanged; owner review is still outstanding.
  Owner review requested on return: yes. Evidence: audit-worktree:docs/tickets/CL-064-post-deployment-pre-sharing-quality.md, audit-worktree:docs/operations/CODE_QUALITY_AUDIT_2026-10-24.md, audit-worktree:docs/operations/CODE_QUALITY_AUDIT_2026-10-24_INPUTS.json
- **AFK-0006** (AFK-SESSION-001, 2026-10-24T14:05:17+00:00, 10a-quality): Add documented CL-064 Q-04: cache dependency installation independently from source-only Docker edits.
  Reason: Both Dockerfiles copy all source before frozen install; source edits invalidate unchanged dependencies. Actual local installation was slow enough to justify the small standard layering correction.
  Consequence / reversibility: No dependency/runtime behavior changes; actual images and offline cache reuse must pass before committing. Reversible Dockerfile-only change in isolated checkout.
  Owner review requested on return: yes. Evidence: audit-worktree:docs/operations/CODE_QUALITY_AUDIT_2026-10-24.md#q-04, audit-worktree:docs/tickets/CL-064-post-deployment-pre-sharing-quality.md, commit:c476d8d, commit:311ee7d, commit:b8fefca
- **AFK-0007** (AFK-SESSION-001, 2026-10-24T14:21:48+00:00, 10b-security-review): Compare pinned dependencies locally with public OSV ecosystem advisory downloads and official maintainer notices; do not run remote repository scanners or upload an npm audit payload.
  Reason: Current known vulnerabilities require fresh advisory data. A public static feed sends no repository, source, dependency inventory, credentials or private configuration. Scanner metadata export is not authorized.
  Consequence / reversibility: Local version/reachability analysis is possible; no scanner account, cloud mutation or paid call. Feed coverage/date and container-native limitations will remain explicit.
  Owner review requested on return: yes. Evidence: https://google.github.io/osv.dev/data/, docs/operations/CODE_QUALITY_AUDIT_2026-10-24_INPUTS.json
- **AFK-0008** (AFK-SESSION-001, 2026-10-24T14:32:28+00:00, 10b-security-review): Select CL-065 SEC-01 Zod validation patch, SEC-02 official Node image security patch and SEC-03 Next security release; retain SEC-04 as an unresolved vendor/native public-release gate.
  Reason: Reports exist and desktop/phone HTML rendering was inspected. The bounded Zod reproduction confirms avoidable work; official patches exist for the runtime/framework. FFmpeg MOV metadata advisories remain unfixed on the current supported vendor branch, and a custom parser or broad distribution migration would not safely establish remediation.
  Consequence / reversibility: Reversible scoped local dependency/image changes proceed through validation. No critical app exploit or owner acceptance is claimed. SEC-04 is unremediated; vendor resolution or explicit owner risk review is needed before public release. No paid/cloud action, scanner upload, push or deployment.
  Owner review requested on return: yes. Evidence: audit-worktree:docs/operations/STRIDE_SECURITY_AUDIT_2026-10-24.md, audit-worktree:docs/operations/STRIDE_SECURITY_REVIEW_2026-10-24.html, audit-worktree:docs/tickets/CL-065-post-deployment-pre-sharing-security.md, local HTML 1440/390 px, no horizontal overflow, four cards; bounded Zod input visits4096elements despite maximum10
- **AFK-0009** (AFK-SESSION-001, 2026-10-26T12:18:22+00:00, 07-build): CL-088: use the current primary checkout for renewed verification/commits, then audit the resulting current snapshot. Owner explicitly renewed AFK and Git authorization on 2026-10-26.
  Reason: Normal app is now verified synthetic-ai/cloud=false; previous paid-review isolation rationale no longer applies. Preserve prior isolated audit evidence without applying unrelated commits.
  Consequence / reversibility: Only reversible local changes and authorized commits; no paid calls/cloud/metadata export/push/deployment. Personal acceptance remains open.
  Owner review requested on return: yes. Evidence: docs/tickets/CL-088-fake-mode-verification-and-commit.md, human:2026-10-26-current-request
- **AFK-0010** (AFK-SESSION-001, 2026-10-26T12:34:22+00:00, 07-build): CL-088: briefly stop verified normal frontend/backend/worker, run the canonical-port app proof against the clean source-only scratch production build, then restore normal owner-configured services.
  Reason: The proof correctly refuses occupied canonical ports; changing ports or using the owner app as a test fixture would weaken its isolation. Current normal mode is confirmed fake/cloud-off.
  Consequence / reversibility: Short local downtime only; preserve all config/media and perform tree-aware shutdown/startup with new identities and safe GETs. No paid action.
  Owner review requested on return: yes. Evidence: test/local-application.proof.ts, docs/tickets/CL-088-fake-mode-verification-and-commit.md, human:2026-10-26-current-request
- **AFK-0011** (AFK-SESSION-001, 2026-10-26T13:02:30+00:00, 09-visual-review): Retain current verified CL-084–088 design after the documented compact-inspector fix and proceed to the requested audits after the baseline commit.
  Reason: Actual generated 1280x600 and390px screenshots inspected; current-source browser assertions cover desktop/laptop/phone, exact actions/keyboard/gestures, visible footer and reachable final controls. Owner requested AFK audit work, not a new design round.
  Consequence / reversibility: Provisional agent review only; personal visual, real-AI/media and release acceptance remain owner-only. Reversible local source/commits only.
  Owner review requested on return: yes. Evidence: docs/tickets/CL-088-fake-mode-verification-and-commit.md, .local-build/evidence/cl086-text-1280.png (ignored synthetic capture), .local-build/evidence/cl086-text-390.png (ignored synthetic capture)
- **AFK-0012** (AFK-SESSION-001, 2026-10-26T13:09:26+00:00, 10a-quality): CL-089: execute Q-01 retryable independent hosted cleanup and Q-02 lockfile-first Docker dependency caching; preserve supported flows and defer speculative refactors.
  Reason: Current code confirms resource ownership is forgotten before failed removal and host-close can skip independent upload cleanup. All Dockerfiles invalidate dependency installation on source-only edits.
  Consequence / reversibility: Small reversible local fixes/tests/build-layer edits. No dependency/runtime version, provider budget, AI acceptance or product functionality change. Owner review remains provisional.
  Owner review requested on return: yes. Evidence: docs/tickets/CL-089-current-code-quality-audit.md, docs/operations/CODE_QUALITY_AUDIT_2026-10-26.md
- **AFK-0013** (AFK-SESSION-001, 2026-10-26T13:42:56+00:00, 10b-security-review): Select exact Node22.23.4 image, Zod4.6.6 and aligned Next/eslint16.4.1 local security updates. Defer SEC90-01 vendor MP4 parser issue and owner/cloud/global tooling actions.
  Reason: Current source/public vendor evidence and actual bounded-schema reproduction support maintained compatible updates. No verified drop-in native fix is available; redesign/format removal would threaten functionality. Reports were produced first and inspected at1440/390 with four readable cards and no horizontal overflow.
  Consequence / reversibility: Local reversible patches and fake/network-blocked validation proceed under current Git authorization. Owner personal security/visual/paid acceptance and native vendor/hosted release gates remain open; no deployment or system update.
  Owner review requested on return: yes. Evidence: docs/operations/STRIDE_SECURITY_AUDIT_2026-10-26.md, docs/operations/STRIDE_SECURITY_REVIEW_2026-10-26.html, docs/tickets/CL-090-current-security-audit.md, ignored evidence: cl090-security-1440.png and cl090-security-390.png inspected
- **AFK-0014** (AFK-SESSION-001, 2026-10-26T13:58:07+00:00, 11-security-fixes): Repair stale image verification by executing the actual packaged backend bundle; retain source unit coverage for provider-factory approvals. Include Next16.4.1's automatically regenerated frontend AGENTS guidance in the owned file plan if changed.
  Reason: The actual local image proof reproduced missing unpackaged module imports; the backend intentionally ships only dist/server.js. A corrected network-disabled entrypoint probe passes unchanged route/paid-off checks. Factory assertions already pass in source units. Normal Next startup regenerates its version-owned instruction block.
  Consequence / reversibility: Verification/helper and generated guidance changes are reversible and do not alter product or expand security fixes. Owner review remains outstanding. The explicit host Node executable was checked22.23.4; no system update was made and the earlier global-version inference is retracted.
  Owner review requested on return: yes. Evidence: docs/tickets/CL-090-current-security-audit.md, scripts/verify-image-runtime.mjs, apps/frontend/AGENTS.md, OS-temp cl090-backend-runtime.log
- **AFK-0015** (AFK-SESSION-001, 2026-10-26T14:02:01+00:00, 11-security-fixes): Update the Linux synthetic walkthrough to explicitly create fictional captions and a canvas PNG, test timed Text and derive final geometry/output revision from accepted source-quality behavior.
  Reason: Current fake preparation intentionally starts without captions/pictures and final exports preserve source height. The older walkthrough assumes automatic content and1080x1920 output, while its first invocation also omitted hosted=true. Reconcile fixture actions, not product defaults or assertions of actual cleanup/binding.
  Consequence / reversibility: Only opt-in verification changes; no provider credentials, paid action or product gate is added. All fake ports remain injected and container network is disabled. Exact zero image-generation calls, one fake caption request and native/cancel/retry/cleanup counts will be asserted. Owner/native release gates remain.
  Owner review requested on return: yes. Evidence: docs/tickets/CL-090-current-security-audit.md, scripts/verify-hosted-editing-linux.mjs, apps/backend/local/fake-content.ts, apps/renderer/local/export-profile.ts

- [x] 01-docs — Documentation (complete)
- [x] 02-flow — Core flow (complete)
- [x] 03-product — Product and design (complete)
- [x] 04-decisions — Product decisions (provisional)
- [x] 05-tickets — Ticket plan (complete)
- [x] 06-plan-commit — Planning commit (complete)
- [x] 07-build — Execute and validate tickets (complete_local)
- [x] 08-performance — Performance investigation (complete_local)
- [x] 09-visual-review — Frontend visual approval checkpoint (provisional)
- [x] 10a-quality — Quality audit and fixes (complete_local)
- [x] 10b-security-review — Security audit and manual review (provisional)
- [x] 11-security-fixes — Approved security fixes (complete_local)
- [x] 12-handoff — Final local handoff (complete_local)

This checklist records local work. Human approvals and unresolved external checks are preserved below; it does not authorize paid calls or deployment.

```json
{
  "schema_version": 3,
  "repo_root": "C:\\Users\\minat\\Work\\ClipBuilder",
  "main_document": "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
  "updated_at": "2026-10-26T14:21:44+00:00",
  "context": {
    "PROJECT_NAME": {
      "value": "ClipBuilder",
      "source": "README.md",
      "confidence": "confirmed"
    },
    "DEMO_PURPOSE": {
      "value": "Uploaded owned conversation to bounded moments, shared caption/picture/filter editor and vertical MP4 exports",
      "source": "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
      "confidence": "confirmed"
    },
    "TICKET_PREFIX": {
      "value": "CL",
      "source": "docs/tickets/README.md",
      "confidence": "confirmed"
    },
    "DEPLOYMENT_PLATFORM": {
      "value": "Cloud Run frontend/backend and internal Linux native worker; local Docker verification only",
      "source": "docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md",
      "confidence": "confirmed"
    },
    "MAIN_INPUT": {
      "value": "Owned/licensed uploaded video; YouTube intake local-only",
      "source": "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
      "confidence": "confirmed"
    },
    "MAIN_OUTPUT": {
      "value": "Edited vertical MP4 download",
      "source": "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
      "confidence": "confirmed"
    },
    "AUDIT_SCOPE": {
      "value": "Commit existing work first, then quality/efficiency and STRIDE/dependency audit/fix loops in AFK mode",
      "source": "human:2026-10-24-current-build-audit-message",
      "confidence": "confirmed"
    },
    "AUDIT_WORKTREE": {
      "value": "C:/Users/minat/.codex/worktrees/quality-security-audit/ClipBuilder",
      "source": "managed worktree operation dd43d772-2eb5-4d0f-b93d-3ea1b8b03849 at baseline 68d5b96",
      "confidence": "confirmed"
    },
    "CURRENT_AUDIT_AUTHORIZATION": {
      "value": "Fully test fake/paid-off, document fixes, file-level plan and local stage/commit, then quality/security audits with execute/validate loops in AFK mode.",
      "source": "human:2026-10-26-current-request",
      "confidence": "confirmed"
    }
  },
  "afk": {
    "active_session": "AFK-SESSION-001",
    "sessions": [
      {
        "id": "AFK-SESSION-001",
        "started_at": "2026-10-24T13:12:40+00:00",
        "ended_at": null,
        "authorization": {
          "quote": "I'm in AFK mode ... any security audits you find that are meaningful, you can execute them right away in an execute valid loop ... you are allowed to stage and commit.",
          "source": "human:2026-10-24-current-build-audit-message",
          "scope": "Existing-work local commit handoff then quality/efficiency/security auditing and justified local fixes. No paid calls, cloud actions, metadata export, deployment or push."
        }
      }
    ],
    "decisions": [
      {
        "id": "AFK-0001",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-24T13:12:41+00:00",
        "phase": "06-plan-commit",
        "choice": "Finish already-started CL-063 local verification before the baseline commits; preserve the running owner app.",
        "rationale": "The owner requires all existing work validated and committed before audits.",
        "consequence": "Only local synthetic checks; hosted identity/maximum resources/paid quality remain external. Reversible local source and Git commits.",
        "review_needed": true,
        "evidence": [
          "docs/tickets/CL-063-local-hosted-release-verification.md",
          "docs/operations/CL058_063_COMMIT_PLAN.md"
        ]
      },
      {
        "id": "AFK-0002",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-24T13:12:44+00:00",
        "phase": "04-decisions",
        "choice": "Retain existing product decisions and proceed only with existing-work handoff and audits.",
        "rationale": "The owner requested audits, not a new product/design round.",
        "consequence": "No extra features; provisional checkpoint owner review remains outstanding.",
        "review_needed": true,
        "evidence": [
          "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
          "docs/tickets/README.md"
        ]
      },
      {
        "id": "AFK-0003",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-24T13:34:26+00:00",
        "phase": "09-visual-review",
        "choice": "Retain current visuals and proceed with requested audits while owner review remains outstanding.",
        "rationale": "Desktop/phone states and native UI flow passed; no new visual feedback is assigned.",
        "consequence": "No unsolicited design edits; personal visual/paid/release acceptance is not claimed.",
        "review_needed": true,
        "evidence": [
          "docs/tickets/CL-062-designed-loading-states.md",
          "docs/tickets/CL-063-local-hosted-release-verification.md"
        ]
      },
      {
        "id": "AFK-0004",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-24T13:34:26+00:00",
        "phase": "10a-quality",
        "choice": "Use an isolated Git checkout for audit implementation and fake-only checks; keep the owner manual-review app on committed baseline 440c6a8.",
        "rationale": "Editing watched backend/frontend source could restart or interrupt a paid owner request.",
        "consequence": "Audit commits are reviewable separately. Applying them to the running checkout is deferred until owner manual review finishes; no second app is launched, and no credentials/media are copied.",
        "review_needed": true,
        "evidence": [
          "docs/operations/CL058_063_COMMIT_PLAN.md",
          "human:2026-10-24-current-build-audit-message"
        ]
      },
      {
        "id": "AFK-0005",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-24T13:48:22+00:00",
        "phase": "10a-quality",
        "choice": "Execute CL-064 Q-01 obsolete image verifier, Q-02 explicit/resilient cleanup and Q-03 bounded read-only polling; retain speculative optimizations and supported legacy flows.",
        "rationale": "The first two defects are reproduced; status read ownership has no deadline. Fixes preserve provider policy, calls, UI semantics and private diagnostics.",
        "consequence": "Small local corrections and regressions are committed in the isolated checkout. Running-app source and paid manual review remain unchanged; owner review is still outstanding.",
        "review_needed": true,
        "evidence": [
          "audit-worktree:docs/tickets/CL-064-post-deployment-pre-sharing-quality.md",
          "audit-worktree:docs/operations/CODE_QUALITY_AUDIT_2026-10-24.md",
          "audit-worktree:docs/operations/CODE_QUALITY_AUDIT_2026-10-24_INPUTS.json"
        ]
      },
      {
        "id": "AFK-0006",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-24T14:05:17+00:00",
        "phase": "10a-quality",
        "choice": "Add documented CL-064 Q-04: cache dependency installation independently from source-only Docker edits.",
        "rationale": "Both Dockerfiles copy all source before frozen install; source edits invalidate unchanged dependencies. Actual local installation was slow enough to justify the small standard layering correction.",
        "consequence": "No dependency/runtime behavior changes; actual images and offline cache reuse must pass before committing. Reversible Dockerfile-only change in isolated checkout.",
        "review_needed": true,
        "evidence": [
          "audit-worktree:docs/operations/CODE_QUALITY_AUDIT_2026-10-24.md#q-04",
          "audit-worktree:docs/tickets/CL-064-post-deployment-pre-sharing-quality.md",
          "commit:c476d8d",
          "commit:311ee7d",
          "commit:b8fefca"
        ]
      },
      {
        "id": "AFK-0007",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-24T14:21:48+00:00",
        "phase": "10b-security-review",
        "choice": "Compare pinned dependencies locally with public OSV ecosystem advisory downloads and official maintainer notices; do not run remote repository scanners or upload an npm audit payload.",
        "rationale": "Current known vulnerabilities require fresh advisory data. A public static feed sends no repository, source, dependency inventory, credentials or private configuration. Scanner metadata export is not authorized.",
        "consequence": "Local version/reachability analysis is possible; no scanner account, cloud mutation or paid call. Feed coverage/date and container-native limitations will remain explicit.",
        "review_needed": true,
        "evidence": [
          "https://google.github.io/osv.dev/data/",
          "docs/operations/CODE_QUALITY_AUDIT_2026-10-24_INPUTS.json"
        ]
      },
      {
        "id": "AFK-0008",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-24T14:32:28+00:00",
        "phase": "10b-security-review",
        "choice": "Select CL-065 SEC-01 Zod validation patch, SEC-02 official Node image security patch and SEC-03 Next security release; retain SEC-04 as an unresolved vendor/native public-release gate.",
        "rationale": "Reports exist and desktop/phone HTML rendering was inspected. The bounded Zod reproduction confirms avoidable work; official patches exist for the runtime/framework. FFmpeg MOV metadata advisories remain unfixed on the current supported vendor branch, and a custom parser or broad distribution migration would not safely establish remediation.",
        "consequence": "Reversible scoped local dependency/image changes proceed through validation. No critical app exploit or owner acceptance is claimed. SEC-04 is unremediated; vendor resolution or explicit owner risk review is needed before public release. No paid/cloud action, scanner upload, push or deployment.",
        "review_needed": true,
        "evidence": [
          "audit-worktree:docs/operations/STRIDE_SECURITY_AUDIT_2026-10-24.md",
          "audit-worktree:docs/operations/STRIDE_SECURITY_REVIEW_2026-10-24.html",
          "audit-worktree:docs/tickets/CL-065-post-deployment-pre-sharing-security.md",
          "local HTML 1440/390 px, no horizontal overflow, four cards; bounded Zod input visits4096elements despite maximum10"
        ]
      },
      {
        "id": "AFK-0009",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-26T12:18:22+00:00",
        "phase": "07-build",
        "choice": "CL-088: use the current primary checkout for renewed verification/commits, then audit the resulting current snapshot. Owner explicitly renewed AFK and Git authorization on 2026-10-26.",
        "rationale": "Normal app is now verified synthetic-ai/cloud=false; previous paid-review isolation rationale no longer applies. Preserve prior isolated audit evidence without applying unrelated commits.",
        "consequence": "Only reversible local changes and authorized commits; no paid calls/cloud/metadata export/push/deployment. Personal acceptance remains open.",
        "review_needed": true,
        "evidence": [
          "docs/tickets/CL-088-fake-mode-verification-and-commit.md",
          "human:2026-10-26-current-request"
        ]
      },
      {
        "id": "AFK-0010",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-26T12:34:22+00:00",
        "phase": "07-build",
        "choice": "CL-088: briefly stop verified normal frontend/backend/worker, run the canonical-port app proof against the clean source-only scratch production build, then restore normal owner-configured services.",
        "rationale": "The proof correctly refuses occupied canonical ports; changing ports or using the owner app as a test fixture would weaken its isolation. Current normal mode is confirmed fake/cloud-off.",
        "consequence": "Short local downtime only; preserve all config/media and perform tree-aware shutdown/startup with new identities and safe GETs. No paid action.",
        "review_needed": true,
        "evidence": [
          "test/local-application.proof.ts",
          "docs/tickets/CL-088-fake-mode-verification-and-commit.md",
          "human:2026-10-26-current-request"
        ]
      },
      {
        "id": "AFK-0011",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-26T13:02:30+00:00",
        "phase": "09-visual-review",
        "choice": "Retain current verified CL-084–088 design after the documented compact-inspector fix and proceed to the requested audits after the baseline commit.",
        "rationale": "Actual generated 1280x600 and390px screenshots inspected; current-source browser assertions cover desktop/laptop/phone, exact actions/keyboard/gestures, visible footer and reachable final controls. Owner requested AFK audit work, not a new design round.",
        "consequence": "Provisional agent review only; personal visual, real-AI/media and release acceptance remain owner-only. Reversible local source/commits only.",
        "review_needed": true,
        "evidence": [
          "docs/tickets/CL-088-fake-mode-verification-and-commit.md",
          ".local-build/evidence/cl086-text-1280.png (ignored synthetic capture)",
          ".local-build/evidence/cl086-text-390.png (ignored synthetic capture)"
        ]
      },
      {
        "id": "AFK-0012",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-26T13:09:26+00:00",
        "phase": "10a-quality",
        "choice": "CL-089: execute Q-01 retryable independent hosted cleanup and Q-02 lockfile-first Docker dependency caching; preserve supported flows and defer speculative refactors.",
        "rationale": "Current code confirms resource ownership is forgotten before failed removal and host-close can skip independent upload cleanup. All Dockerfiles invalidate dependency installation on source-only edits.",
        "consequence": "Small reversible local fixes/tests/build-layer edits. No dependency/runtime version, provider budget, AI acceptance or product functionality change. Owner review remains provisional.",
        "review_needed": true,
        "evidence": [
          "docs/tickets/CL-089-current-code-quality-audit.md",
          "docs/operations/CODE_QUALITY_AUDIT_2026-10-26.md"
        ]
      },
      {
        "id": "AFK-0013",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-26T13:42:56+00:00",
        "phase": "10b-security-review",
        "choice": "Select exact Node22.23.4 image, Zod4.6.6 and aligned Next/eslint16.4.1 local security updates. Defer SEC90-01 vendor MP4 parser issue and owner/cloud/global tooling actions.",
        "rationale": "Current source/public vendor evidence and actual bounded-schema reproduction support maintained compatible updates. No verified drop-in native fix is available; redesign/format removal would threaten functionality. Reports were produced first and inspected at1440/390 with four readable cards and no horizontal overflow.",
        "consequence": "Local reversible patches and fake/network-blocked validation proceed under current Git authorization. Owner personal security/visual/paid acceptance and native vendor/hosted release gates remain open; no deployment or system update.",
        "review_needed": true,
        "evidence": [
          "docs/operations/STRIDE_SECURITY_AUDIT_2026-10-26.md",
          "docs/operations/STRIDE_SECURITY_REVIEW_2026-10-26.html",
          "docs/tickets/CL-090-current-security-audit.md",
          "ignored evidence: cl090-security-1440.png and cl090-security-390.png inspected"
        ]
      },
      {
        "id": "AFK-0014",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-26T13:58:07+00:00",
        "phase": "11-security-fixes",
        "choice": "Repair stale image verification by executing the actual packaged backend bundle; retain source unit coverage for provider-factory approvals. Include Next16.4.1's automatically regenerated frontend AGENTS guidance in the owned file plan if changed.",
        "rationale": "The actual local image proof reproduced missing unpackaged module imports; the backend intentionally ships only dist/server.js. A corrected network-disabled entrypoint probe passes unchanged route/paid-off checks. Factory assertions already pass in source units. Normal Next startup regenerates its version-owned instruction block.",
        "consequence": "Verification/helper and generated guidance changes are reversible and do not alter product or expand security fixes. Owner review remains outstanding. The explicit host Node executable was checked22.23.4; no system update was made and the earlier global-version inference is retracted.",
        "review_needed": true,
        "evidence": [
          "docs/tickets/CL-090-current-security-audit.md",
          "scripts/verify-image-runtime.mjs",
          "apps/frontend/AGENTS.md",
          "OS-temp cl090-backend-runtime.log"
        ]
      },
      {
        "id": "AFK-0015",
        "session_id": "AFK-SESSION-001",
        "recorded_at": "2026-10-26T14:02:01+00:00",
        "phase": "11-security-fixes",
        "choice": "Update the Linux synthetic walkthrough to explicitly create fictional captions and a canvas PNG, test timed Text and derive final geometry/output revision from accepted source-quality behavior.",
        "rationale": "Current fake preparation intentionally starts without captions/pictures and final exports preserve source height. The older walkthrough assumes automatic content and1080x1920 output, while its first invocation also omitted hosted=true. Reconcile fixture actions, not product defaults or assertions of actual cleanup/binding.",
        "consequence": "Only opt-in verification changes; no provider credentials, paid action or product gate is added. All fake ports remain injected and container network is disabled. Exact zero image-generation calls, one fake caption request and native/cancel/retry/cleanup counts will be asserted. Owner/native release gates remain.",
        "review_needed": true,
        "evidence": [
          "docs/tickets/CL-090-current-security-audit.md",
          "scripts/verify-hosted-editing-linux.mjs",
          "apps/backend/local/fake-content.ts",
          "apps/renderer/local/export-profile.ts"
        ]
      }
    ]
  },
  "prompt_preapproval": null,
  "prompt_mode_history": [],
  "git": {
    "local_commits_approved": true,
    "approval_source": "human:2026-10-24-current-build-audit-message"
  },
  "active_ticket": "CL-090",
  "next_action": "Commit the exact final two-document handoff allocation and verify clean Git, then hand back the healthy fake/paid-off app. Next work requires owner review of provisional decisions and SEC90-01/release gates; never deploy or initiate paid/cloud work automatically.",
  "phases": [
    {
      "id": "01-docs",
      "name": "Documentation",
      "gate": null,
      "status": "complete",
      "prompt": {
        "text": "Reconcile the established ClipBuilder main specification, public README and architecture/service guides against the implemented one-app upload/editor scope. Preserve owner decisions and historical evidence. Adopt existing documentation for this established project; the current assignment is existing-work commits followed by audits, not a new product build or sibling-repo research. No cloud or paid work.",
        "sha256": "85b6cd918c0f33bea88d907a4350f7b4e12d86dfe4357733ea979fccc9c0cd81",
        "context_sources": [
          "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
          "docs/README.md",
          "README.md"
        ],
        "status": "afk",
        "approval": null,
        "afk_session": "AFK-SESSION-001"
      },
      "evidence": [
        "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
        "docs/README.md",
        "README.md"
      ],
      "blockers": [],
      "approval": null,
      "decision": null,
      "reviews": []
    },
    {
      "id": "02-flow",
      "name": "Core flow",
      "gate": null,
      "status": "complete",
      "prompt": {
        "text": "Adopt the existing shared flow: upload owned video, manual/AI moments, bounded preparation, captions/pictures/filters, Apply/Discard and MP4 export. YouTube acquisition is local-only. Confirm documented current routing and synthetic editor proof; do not expand the product.",
        "sha256": "177eda34b96a5089e034ce37e08f358f64a319cfdb4800590c199266cb99fb6d",
        "context_sources": [
          "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
          "docs/tickets/CL-061-shared-hosted-upload-editor.md"
        ],
        "status": "afk",
        "approval": null,
        "afk_session": "AFK-SESSION-001"
      },
      "evidence": [
        "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
        "docs/tickets/CL-061-shared-hosted-upload-editor.md"
      ],
      "blockers": [],
      "approval": null,
      "decision": null,
      "reviews": []
    },
    {
      "id": "03-product",
      "name": "Product and design",
      "gate": null,
      "status": "complete",
      "prompt": {
        "text": "Retain settled owner decisions: shared hosted editor, upload-only hosted intake, advisory Gemini critiques, explicit retry, footer actions, normal motion and CL-062 centered loading. No new product or visual work is assigned in this audit invocation. Adopt the actual implementation/evidence.",
        "sha256": "e94e080951d1594fffd1d01d53a77a261f062264a2181b21839a58afa1343c29",
        "context_sources": [
          "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
          "docs/tickets/CL-060-advisory-gemini-validation-and-clip-retry.md",
          "docs/tickets/CL-062-designed-loading-states.md"
        ],
        "status": "afk",
        "approval": null,
        "afk_session": "AFK-SESSION-001"
      },
      "evidence": [
        "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
        "docs/tickets/CL-060-advisory-gemini-validation-and-clip-retry.md",
        "docs/tickets/CL-062-designed-loading-states.md"
      ],
      "blockers": [],
      "approval": null,
      "decision": null,
      "reviews": []
    },
    {
      "id": "04-decisions",
      "name": "Product decisions",
      "gate": "product",
      "status": "provisional",
      "prompt": {
        "text": "Reconcile current ClipBuilder product decisions with the latest human instructions and CL-060/061/062. Recommend retaining scope, no-spend/no-deploy bounds and owner-only paid manual review. Record provisional AFK reconciliation without inventing personal product acceptance.",
        "sha256": "58b167373633785fa6eda437d0b833d245f4c490d76df2fe579cdc258266f9d1",
        "context_sources": [
          "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
          "human:2026-10-24-current-build-audit-message"
        ],
        "status": "afk",
        "approval": null,
        "afk_session": "AFK-SESSION-001"
      },
      "evidence": [
        "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
        "docs/tickets/README.md"
      ],
      "blockers": [],
      "approval": null,
      "decision": "recommended",
      "reviews": [
        {
          "afk_review": {
            "session_id": "AFK-SESSION-001",
            "decision_id": "AFK-0002",
            "recorded_at": "2026-10-24T13:12:44+00:00"
          },
          "decision": "recommended"
        }
      ],
      "afk_review": {
        "session_id": "AFK-SESSION-001",
        "decision_id": "AFK-0002",
        "recorded_at": "2026-10-24T13:12:44+00:00"
      }
    },
    {
      "id": "05-tickets",
      "name": "Ticket plan",
      "gate": "tickets",
      "status": "complete",
      "prompt": {
        "text": "Adopt dependency-ordered CL-058 through CL-063 and the explicit whole-file plan for all existing pending changes. Keep intertwined diagnostics, advisory Gemini, shared editor and loading code atomic; separate the Linux probe and documentation handoff. The current human message delegates this plan and local staging/committing. Future quality/security work gets separate scoped tickets. No push, spend or deployment.",
        "sha256": "b7100aa3a7b9198a2f1b7347b009b35b8e0a123d36850137b13a00c581e11c7d",
        "context_sources": [
          "docs/operations/CL058_063_COMMIT_PLAN.md",
          "docs/tickets/README.md",
          "human:2026-10-24-current-build-audit-message"
        ],
        "status": "afk",
        "approval": null,
        "afk_session": "AFK-SESSION-001"
      },
      "evidence": [
        "docs/operations/CL058_063_COMMIT_PLAN.md"
      ],
      "blockers": [],
      "approval": {
        "quote": "If you already have any kind of unstaged work right now, make another file-level commit plan for it first, and then stage and commit it.",
        "source": "human:2026-10-24-current-build-audit-message",
        "scope": "Delegated whole-file allocation and local commits for existing CL-058-063 changes. Subsequent scoped audit commits explicitly permitted by the same human message; no personal visual/security acceptance inferred.",
        "recorded_at": "2026-10-24T13:12:45+00:00"
      },
      "decision": "approved",
      "reviews": [
        {
          "decision": "approved",
          "approval": {
            "quote": "If you already have any kind of unstaged work right now, make another file-level commit plan for it first, and then stage and commit it.",
            "source": "human:2026-10-24-current-build-audit-message",
            "scope": "Delegated whole-file allocation and local commits for existing CL-058-063 changes. Subsequent scoped audit commits explicitly permitted by the same human message; no personal visual/security acceptance inferred.",
            "recorded_at": "2026-10-24T13:12:45+00:00"
          }
        }
      ]
    },
    {
      "id": "06-plan-commit",
      "name": "Planning commit",
      "gate": null,
      "status": "complete",
      "prompt": {
        "text": "Finish already-started CL-063 local Linux verification as the precondition for committing existing work. Inspect the CL-058-063 whole-file plan; stage explicit owned paths only after clean relevant validation and staged secret/generated-content review. Commit cohesive ticket-prefixed groups and confirm the working tree is clean before audits. Preserve normal owner apps/media and configuration. No push, deployment, paid call, cloud mutation or scanner metadata export.",
        "sha256": "721009fe6fc4a955eb1a87c2018ba12f2172693f93fee33f2c9c1e8d53ddb5e4",
        "context_sources": [
          "docs/operations/CL058_063_COMMIT_PLAN.md",
          "docs/tickets/CL-063-local-hosted-release-verification.md",
          "human:2026-10-24-current-build-audit-message"
        ],
        "status": "afk",
        "approval": null,
        "afk_session": "AFK-SESSION-001"
      },
      "evidence": [
        "docs/operations/CL058_063_COMMIT_PLAN.md",
        "commit:31683fc",
        "commit:a5bc071",
        "commit:440c6a8"
      ],
      "blockers": [],
      "approval": null,
      "decision": null,
      "reviews": []
    },
    {
      "id": "07-build",
      "name": "Execute and validate tickets",
      "gate": null,
      "status": "complete_local",
      "prompt": {
        "text": "Finish ClipBuilder CL-088 after implemented CL-084 preview-first/export-on-demand, CL-085 review cards, CL-086 timed text/shared typography and CL-087 AI title/defaults/stages. Confirm synthetic-ai/cloud=false via safe GET before tests. Run full deterministic unit/local, boundary, type/lint/format, synthetic browser/native and source-only scratch production build checks without ignored env, real media or paid/provider/cloud calls. Investigate and fix confirmed failures, retain useful assertions, record every fix and run settled checks. Read-only validate complete current work against its packets and preserve all behavior/bounds/diagnostics/retained media. After clean validation write an exhaustive whole-file dependency-complete plan; stage explicit listed paths, inspect staged diff for secrets/generated media and make authorized ticket-prefixed local commits. Verify clean Git and healthy fake-mode app before starting renewed quality then security audits. No push/deploy/cloud access/spend/scanner metadata export. Owner visual, paid AI and actual hosted/release acceptance remain unchecked.",
        "sha256": "97d3002b076c8df136dc3c57fb31747850e63556087cded9f6104bef498fc5aa",
        "context_sources": [
          "docs/tickets/CL-088-fake-mode-verification-and-commit.md",
          "docs/tickets/CL-084-preview-first-export-on-demand.md",
          "docs/tickets/CL-085-review-moment-cards.md",
          "docs/tickets/CL-086-timed-text-and-shared-typography.md",
          "docs/tickets/CL-087-ai-titles-defaults-and-preparation-stages.md",
          "human:2026-10-26-current-request"
        ],
        "status": "afk",
        "approval": null,
        "afk_session": "AFK-SESSION-001"
      },
      "evidence": [
        "docs/tickets/CL-088-fake-mode-verification-and-commit.md",
        "docs/operations/CL084_088_COMMIT_PLAN.md",
        "599 local; exact full unit144root+1725package; all25syntheticproof cases reconciled; final Focus/Text browser; scratch build/artifact; lint/types/format",
        "normal app synthetic-ai/cloud=false health/start/config200; current worker rebuilt; proof resource survivors0"
      ],
      "blockers": [
        {
          "kind": "external",
          "reason": "Owner real AI/editorial/media/rights and personal visual acceptance, actual hosted identity/resources/Linux native-vendor/release checks remain unverified. No paid/cloud/deploy/push/scanner-export permission.",
          "reference": "docs/tickets/CL-088-fake-mode-verification-and-commit.md"
        }
      ],
      "approval": null,
      "decision": null,
      "reviews": [
        {
          "reopened_at": "2026-10-26T12:18:19+00:00",
          "reason": "New CL-084–087 implementation and explicit 2026-10-26 owner verification/commit/AFK audit request supersede the earlier audit snapshot; retain all earlier evidence and owner-only gates.",
          "prior_status": "complete_local",
          "prior_prompt": {
            "text": "Reconcile completed CL-058-063 against actual source, ticket records and local commits 31683fc/a5bc071/440c6a8. Adopt the settled 1,770 synthetic tests, full types/lint/format and local Linux image/editor/native/cancel/retry proof. Do not repeat completed product work. Record actual hosted identity/routing, maximum allocation and live Gemini/owner acceptance as external, with no paid/cloud execution or deployment.",
            "sha256": "850c94702c324cae79c5a9ee01dd5c2ae52455df85a1fc395db15cb6ec758e9c",
            "context_sources": [
              "docs/tickets/README.md",
              "docs/tickets/CL-063-local-hosted-release-verification.md"
            ],
            "status": "afk",
            "approval": null,
            "afk_session": "AFK-SESSION-001"
          },
          "prior_approval": null,
          "prior_decision": null
        }
      ]
    },
    {
      "id": "08-performance",
      "name": "Performance investigation",
      "gate": null,
      "status": "complete_local",
      "prompt": {
        "text": "Adopt the measured ClipBuilder native/resource evidence from CL-063: one worker, bounded chunks/calls, completed preparation reused on retry, cancel/expiry/exit cleanup, about 930 MiB sample peak memory and 25 MiB scratch. Preserve ceilings rather than add parallel native work. Maximum hosted allocation remains external. The assigned efficiency review will investigate actual current code in phase 10a without unrelated product changes.",
        "sha256": "4f629e46e55b41e824cc3ea0a80b721c07c824a448b860af0c8022cf750d9905",
        "context_sources": [
          "docs/tickets/CL-063-local-hosted-release-verification.md",
          "packages/contracts/local/hosted-editing.ts"
        ],
        "status": "afk",
        "approval": null,
        "afk_session": "AFK-SESSION-001"
      },
      "evidence": [
        "docs/tickets/CL-063-local-hosted-release-verification.md"
      ],
      "blockers": [
        {
          "kind": "external",
          "reason": "Actual hosted identity/TLS/Turnstile/routing and maximum hosting allocation, plus live Gemini/owner acceptance, require separate configuration/authorization or owner review. No deployment or paid call is authorized.",
          "reference": "docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md"
        }
      ],
      "approval": null,
      "decision": null,
      "reviews": []
    },
    {
      "id": "09-visual-review",
      "name": "Frontend visual approval checkpoint",
      "gate": "visual",
      "status": "provisional",
      "prompt": {
        "text": "Review actual ClipBuilder CL-084–088 synthetic desktop/phone/browser/native evidence without changing the product or claiming personal owner approval. The owner explicitly requests AFK audits after verified current-work commits. Inspect actual 1280x600 timed-text and 390px captures plus current-source browser assertions at1440,1366x682,1280x600,390,320 for footer visibility, selected settings, text/caption parity and real focus/scroll/pointer mechanics. Retain all25 reconciled native/browser cases and focused Text/Focus passes. Record a provisional AFK self-review solely to permit the assigned quality then security audit. Owner real AI/media/visual/rights/hosted/release acceptance remains outstanding. No new design round, paid action, cloud access, push/deployment or scanner metadata export.",
        "sha256": "d212e02d10e192004c918a782ad94a449d089866ab2f3acc9d7330dcabe386cc",
        "context_sources": [
          "docs/tickets/CL-088-fake-mode-verification-and-commit.md",
          "human:2026-10-26-current-request"
        ],
        "status": "afk",
        "approval": null,
        "afk_session": "AFK-SESSION-001"
      },
      "evidence": [
        "docs/tickets/CL-088-fake-mode-verification-and-commit.md",
        ".local-build/evidence/cl086-text-1280.png (ignored synthetic capture)",
        ".local-build/evidence/cl086-text-390.png (ignored synthetic capture)"
      ],
      "blockers": [],
      "approval": null,
      "decision": "self-reviewed",
      "reviews": [
        {
          "afk_review": {
            "session_id": "AFK-SESSION-001",
            "decision_id": "AFK-0003",
            "recorded_at": "2026-10-24T13:34:26+00:00"
          },
          "decision": "self-reviewed"
        },
        {
          "reopened_at": "2026-10-26T12:18:20+00:00",
          "reason": "New CL-084–087 implementation and explicit 2026-10-26 owner verification/commit/AFK audit request supersede the earlier audit snapshot; retain all earlier evidence and owner-only gates.",
          "prior_status": "provisional",
          "prior_prompt": {
            "text": "Preserve completed CL-062 design and its actual desktop/phone screenshot/keyboard/readiness evidence, plus the shared Linux editor proof. The owner is performing manual paid-flow/visual review while asking for audits now. Record only a provisional AFK self-review to permit the explicitly assigned audits. Do not invent personal visual acceptance or make extra design changes.",
            "sha256": "dccce60476c5c3032651b13f3dbc9b929890c92c5c0c891827c321b50300aeb9",
            "context_sources": [
              "docs/tickets/CL-062-designed-loading-states.md",
              "docs/tickets/CL-063-local-hosted-release-verification.md",
              "human:2026-10-24-current-build-audit-message"
            ],
            "status": "afk",
            "approval": null,
            "afk_session": "AFK-SESSION-001"
          },
          "prior_approval": null,
          "prior_decision": "self-reviewed"
        },
        {
          "afk_review": {
            "session_id": "AFK-SESSION-001",
            "decision_id": "AFK-0011",
            "recorded_at": "2026-10-26T13:02:30+00:00"
          },
          "decision": "self-reviewed"
        }
      ],
      "afk_review": {
        "session_id": "AFK-SESSION-001",
        "decision_id": "AFK-0011",
        "recorded_at": "2026-10-26T13:02:30+00:00"
      }
    },
    {
      "id": "10a-quality",
      "name": "Quality audit and fixes",
      "gate": null,
      "status": "complete_local",
      "prompt": {
        "text": "Audit the current whole ClipBuilder repository after ca10def committed CL-084–088. Preserve upload/manual-AI moments, preview-first explicit export, caption/picture/filter/focus/Text controls, TikTok/title/fade defaults, original-source output, source/revision binding, usable Gemini critique-only acceptance, explicit retry reuse, bounds/cancellation and private diagnostics. First document the actual quality/efficiency/structure findings and careful functionality-preserving plan in CL-089 and the dated quality report. Current justified findings: Q-01 independently settle hosted host/upload cleanup and retain staged directory identity after a filesystem failure; Q-02 cache pinned Docker dependency fetch before source COPY, keeping frozen offline installation and original build/runtime behavior. No arbitrary monolith rewrite, speculative optimization, dependency upgrade or new feature. Reproduce Q-01 using injected failures and generated files with zero native/provider work, fix narrowly, run focused and settled fake/no-key/paid-off/network-blocked checks and meaningful pinned offline-fetch/closed-context verification. Read-only validate, independently confirm/fix findings and revalidate until no actionable local issue remains. Write a separate exhaustive whole-file plan, inspect staged content and make authorized CL-089 local commits. The prior current-work commit must remain intact. Keep owner env/media/diagnostics and the running fake app; verify lifecycle ownership if backend reload is required. No G Cloud access/change, provider call/spend, scanner metadata export, deployment or push. Real AI, personal visual/media/rights, actual hosted resources/identity and current Linux/native vendor acceptance remain open. Complete quality before CL-090 security audit.",
        "sha256": "a72a2e8a868a28d4fdd0aae42889574658f785f810591b2e868041bfef83c553",
        "context_sources": [
          "docs/tickets/CL-089-current-code-quality-audit.md",
          "docs/operations/CODE_QUALITY_AUDIT_2026-10-26.md",
          "commit:ca10def",
          "human:2026-10-26-current-request"
        ],
        "status": "afk",
        "approval": null,
        "afk_session": "AFK-SESSION-001"
      },
      "evidence": [
        "docs/tickets/CL-089-current-code-quality-audit.md",
        "docs/operations/CODE_QUALITY_AUDIT_2026-10-26.md",
        "three unchanged-code cleanup failures reproduced; diagnostic preservation rechecked;8focused,602local,144root+1728package cases pass; affectedtypes/lint/format",
        "guarded pnpm11.19 fetch/offline install zero external attempts/downloads and unchanged lock; earlier public npm attempt invalidated/documented"
      ],
      "blockers": [
        {
          "kind": "external",
          "reason": "Actual current Linux image/hosted resources/identity/native-vendor and owner real AI/media/rights/personal visual/release gates remain open. No cloud/provider/deploy/push/scanner-export approval.",
          "reference": "docs/tickets/CL-089-current-code-quality-audit.md"
        }
      ],
      "approval": null,
      "decision": null,
      "reviews": [
        {
          "reopened_at": "2026-10-26T12:18:20+00:00",
          "reason": "New CL-084–087 implementation and explicit 2026-10-26 owner verification/commit/AFK audit request supersede the earlier audit snapshot; retain all earlier evidence and owner-only gates.",
          "prior_status": "complete_local",
          "prior_prompt": {
            "text": "Run a thorough code quality, efficiency and structure audit of ClipBuilder, an existing Next.js frontend/Express backend/shared contracts and React composition with internal Linux native worker, prepared for Cloud Run. Current flow is uploaded owned video to bounded manual/AI moments, caption/picture/filter editor and MP4 export; YouTube acquisition is local-only. First fully document a detailed functionality-preserving plan in CL-064 post-deployment/pre-sharing quality and the owning audit report. Inspect browser workflow/state, server/proxy/provider adapters, native worker/process/media ownership, contracts, persistence, scripts/build/test boundaries and CI/release files. Identify concrete redundancy, dead code, duplicate logic, avoidable work and cleanup/structural defects; avoid cosmetic churn or broad rewrites. Preserve all private diagnostics, generic user/browser errors, paid-output advisory critique policy, explicit retries/reuse, fixed bytes/calls/queues/deadlines/cancellation, shared design and normal motion. Preserve the running owner manual-review app using a separate source checkout and fake/no-key/paid-off/network-blocked tests; never read/copy ignored env or retained media. Execute justified quality fixes one dependency-ready packet at a time through execute/read-only validate/fix/revalidate until no actionable local findings remain. Prepare a whole-file commit plan, inspect staged diffs and make cohesive CL-prefixed local commits under the current explicit Git authorization. Do not start STRIDE/dependency security auditing until this quality phase is complete. Do not deploy, push, spend credits, call providers/cloud, export scanner metadata or claim owner acceptance. Save follow-up preservation guidelines for later manual-feedback edits.",
            "sha256": "79e66c5b23765ee7510f6e7a622cff1dd7b0899957b9c06ccd86f6241d50cf40",
            "context_sources": [
              "AGENTS.md",
              "docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md",
              "docs/tickets/CL-061-shared-hosted-upload-editor.md",
              "docs/tickets/CL-062-designed-loading-states.md",
              "docs/tickets/CL-063-local-hosted-release-verification.md",
              "human:2026-10-24-current-build-audit-message"
            ],
            "status": "afk",
            "approval": null,
            "afk_session": "AFK-SESSION-001"
          },
          "prior_approval": null,
          "prior_decision": null
        }
      ]
    },
    {
      "id": "10b-security-review",
      "name": "Security audit and manual review",
      "gate": "security",
      "status": "provisional",
      "prompt": {
        "text": "Audit the current ClipBuilder primary checkout after ca10def (CL-084–088) and cc4c7dc (CL-089). The owner's 2026-10-26 request delegates security/quality audits and ordinary local fixes in AFK execute/validate loops, with separate file-level plans and authorized local commits. Keep one dependency-ready packet CL-090. First audit only: review the complete current local/hosted upload-to-moments/shared-editor-to-explicit-MP4 workflow, new deferred rendering and timed Text/AI defaults, authentication/session/cookie/CSRF/source/revision binding, acquisition and hosted exclusions, upload/media/range/file handling, metered AI and native resource/cancellation/cleanup bounds, Gemini critique-only acceptance, diagnostic privacy, fixed React composition, subprocess/protocol safety, build contexts and dependency/runtime advisories. Use STRIDE plus substantial generally applicable threats; do not list minor speculative hardening or call intentional finite single-instance demo scope a defect. Distinguish current source evidence from historical isolated audit claims and actual deployed configuration that is unverified. Consult only public primary advisory metadata without sending repository/source/dependency inventories; no scanner export, G Cloud, credentials or paid requests. Produce detailed Markdown and concise severity-ranked PM HTML with actual finding IDs, reachability/preconditions, evidence, functionality-preserving fix plans, non-findings and honest external limits. Inspect the HTML at desktop and phone sizes. Before implementation record provisional AFK selection of justified actual findings, defer unsafe/vendor/cloud/owner-only work, then prepare phase11 for scoped fixes. Tests use synthetic source-controlled/generated media, hardcoded fake/no-key/paid-off/live-false before imports and network/env-file guards; never trigger owner's paid caption exception or retained-media use. Preserve private backend diagnostics, generic UI errors, current functionality, design/motion, exact metered counts, no automatic provider retries, retained sources and the running fake/cloud-off normal stack. Never read ignored env/secret files. Keep all progress in the existing source-of-truth ledger. No push/deploy/cloud changes or system runtime update. Finish reports before implementation; execute/read-only validate/fix loops and cohesive commits follow recorded finding selection under the current Git grant.",
        "sha256": "8fb0152404d5bead885725438aeaee85ed0901d497356f6a8ceeb3be56a5e301",
        "context_sources": [
          "AGENTS.md",
          "docs/tickets/CL-088-fake-mode-verification-and-commit.md",
          "docs/tickets/CL-089-current-code-quality-audit.md",
          "human:2026-10-26-current-request"
        ],
        "status": "afk",
        "approval": null,
        "afk_session": "AFK-SESSION-001"
      },
      "evidence": [
        "docs/operations/STRIDE_SECURITY_AUDIT_2026-10-26.md",
        "docs/operations/STRIDE_SECURITY_REVIEW_2026-10-26.html",
        "docs/tickets/CL-090-current-security-audit.md",
        "ignored evidence: cl090-security-1440.png and cl090-security-390.png inspected"
      ],
      "blockers": [],
      "approval": null,
      "decision": "selected-fixes",
      "reviews": [
        {
          "afk_review": {
            "session_id": "AFK-SESSION-001",
            "decision_id": "AFK-0008",
            "recorded_at": "2026-10-24T14:32:28+00:00"
          },
          "decision": "selected-fixes"
        },
        {
          "reopened_at": "2026-10-26T12:18:20+00:00",
          "reason": "New CL-084–087 implementation and explicit 2026-10-26 owner verification/commit/AFK audit request supersede the earlier audit snapshot; retain all earlier evidence and owner-only gates.",
          "prior_status": "provisional",
          "prior_prompt": {
            "text": "Perform a thorough proportionate security audit of the whole ClipBuilder repository after committed CL-064 quality fixes (isolated checkout HEAD a28a668). Use STRIDE and general known threats across the Next frontend/bridge, Express backend, hosted session/admission/identity/cookies/CSRF/rate limits, upload and file delivery, provider use and paid ceilings, local-only YouTube boundary, native worker/subprocesses/FFmpeg/Chromium, contracts/shared composition, build/deployment scripts and pinned dependencies. The demo is one disposable Cloud Run application with upload to bounded manual/AI moments, caption/picture/filter editor and native MP4 download; only local composition permits YouTube acquisition. Identify only substantial realistically applicable threats. Verify exploit preconditions and distinguish source defects from unverified hosted settings and intentional bounded-demo constraints. Preserve private diagnostics and generic UI errors, semantic Gemini critique-only acceptance and explicit retry reuse, source/revision binding, fixed bytes/work/deadlines/cancellation and design/motion. First audit only: produce detailed Markdown with source identity, trust boundaries, STRIDE coverage, dependency/advisory methodology, ranked confirmed findings, evidence, careful functionality-preserving fix plans, scope/non-findings and real limitations; produce a concise severity-ranked PM HTML report and inspect its rendering. Use hardcoded fake/no-key/paid-off, generated synthetic data and network-blocked checks; do not read/copy ignored env, credentials, retained media or private captures. Never deploy/push/spend/call providers/cloud or export scanner metadata. Public read-only advisory information may be consulted without transmitting project/source/dependency inventory. Do not implement security changes before the actual reports exist and an explicit provisional AFK review records selected actual finding IDs under the owner current delegated authorization. After that selection, prepare phase 11 and execute only justified scoped local fixes through execute/read-only validate/fix loops and authorized cohesive commits. Preserve the owner running primary app and maintain the canonical progress ledger only in primary docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md.",
            "sha256": "731a6a6fe03d075988e56ea7c8de666cf4ee619091979603f7771885edebf921",
            "context_sources": [
              "AGENTS.md",
              "docs/operations/CODE_QUALITY_AUDIT_2026-10-24.md",
              "docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md",
              "human:2026-10-24-current-build-audit-message"
            ],
            "status": "afk",
            "approval": null,
            "afk_session": "AFK-SESSION-001"
          },
          "prior_approval": null,
          "prior_decision": "selected-fixes"
        },
        {
          "afk_review": {
            "session_id": "AFK-SESSION-001",
            "decision_id": "AFK-0013",
            "recorded_at": "2026-10-26T13:42:56+00:00"
          },
          "decision": "selected-fixes"
        }
      ],
      "selected_findings": [
        "SEC90-02",
        "SEC90-03",
        "SEC90-04"
      ],
      "afk_review": {
        "session_id": "AFK-SESSION-001",
        "decision_id": "AFK-0013",
        "recorded_at": "2026-10-26T13:42:56+00:00"
      }
    },
    {
      "id": "11-security-fixes",
      "name": "Approved security fixes",
      "gate": null,
      "status": "complete_local",
      "prompt": {
        "text": "Execute CL-090 findings SEC90-02, SEC90-03 and SEC90-04 only in the current primary ClipBuilder checkout after cc4c7dc. The detailed security audit and PM HTML exist, desktop/phone rendering was inspected and provisional AFK selection records these actual IDs. Owner personal review remains outstanding. Use exact compatible Zod4.6.6 in all four owning packages and lockfile, exact Next/eslint-config-next16.4.1 together with React unchanged, and verified official node:22.23.4-bookworm-slim Linux/amd64 digest ea11b74b986d520137cdef9a5346e447a00f275ecc4abc0055b7151226231e09 in all three app Dockerfiles. Verify cache/registry identities and binary versions rather than trusting historical isolated artifacts. Before substantial edits allocate every file in CL-090. First add and run a meaningful actual Text/operation bounded-collection regression against unchanged Zod to prove excessive traversal; update the dependency and require early rejection with zero element reads and valid document compatibility. Preserve one canonical schema, provider semantic critique-only acceptance, no automatic retries, paid-work reuse, upload/editor/preview/native export behavior, all diagnostics and generic UI errors, exact session/origin/revision/source binding, fixed resource limits, cancellation and cleanup. Keep quality dependency-cache layers, fixed tools, Bookworm/ABI, non-root identity and release artifact boundaries. Read pinned Next guides before frontend edits. Fetch only public required packages/images, preferring cached/offline resolution, never audit/scanner uploads or credentials. All actual application checks must install fake/no-key/paid-off/live-false and env-file/external-network guards before imports with generated media. Build source-only current artifacts without ignored env or retained owner media. Run focused regressions, required lint/type/format/unit/local checks, then actual local image/runtime and current synthetic browser/native proofs appropriate to framework/schema/runtime updates; inspect bounds/cleanup/owned processes and keep inherited Linux/vendor limits honest. Perform a separate read-only validate pass of the settled complete diff, independently confirm and fix actual findings and repeat to no actionable local findings. Do not implement SEC90-01 vendor parser work, add speculative hardening, update the global Windows Node runtime, change G Cloud resources, deploy, push, trigger any provider/paid/real YouTube call, or read/alter ignored env. Use verified lifecycle ownership to rebuild/reload current normal worker after contracts/runtime changes and leave the app reachable at localhost3000/start with synthetic-ai/cloud=false. After clean validation write the exhaustive CL-090 whole-file commit plan, inspect exact staged files/content and make the authorized cohesive local commit. Finish canonical handoff showing actual evidence and unresolved native/hosted/owner/paid/rights/provisional reviews; never call local completion a public release clearance.",
        "sha256": "8ae84ec56abb78fd201e1e0de0caeb6b33ccd7abc3a97f79ca6fb564dfccb045",
        "context_sources": [
          "AGENTS.md",
          "docs/tickets/CL-090-current-security-audit.md",
          "docs/operations/STRIDE_SECURITY_AUDIT_2026-10-26.md",
          "docs/operations/STRIDE_SECURITY_REVIEW_2026-10-26.html",
          "human:2026-10-26-current-request"
        ],
        "status": "afk",
        "approval": null,
        "afk_session": "AFK-SESSION-001"
      },
      "evidence": [
        "commit:6234d98",
        "docs/operations/CL090_COMMIT_PLAN.md",
        "docs/operations/STRIDE_SECURITY_AUDIT_2026-10-26.md",
        "21exact whole files staged/content-checked and committed; clean Git afterward; settled read-only validate no actionable findings; full1874unit+604local,types/lint/format,4focused and current Windows/Linux/image proofs pass"
      ],
      "blockers": [
        {
          "kind": "external",
          "reason": "SEC90-01 MP4 parser vendor risk remains unresolved. Verify maintained fixes/backports for actual native artifacts or obtain explicit owner risk review before public release; Node/Zod/Next patches do not close it.",
          "reference": "docs/operations/STRIDE_SECURITY_AUDIT_2026-10-26.md"
        },
        {
          "kind": "external",
          "reason": "Owner personal paid AI/media/rights/visual/security AFK acceptance and actual hosted identity/TLS/Turnstile/single-instance/CPU/resource/capacity remain unchecked. G Cloud, provider tests, deployment and push are not authorized.",
          "reference": "docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md"
        }
      ],
      "approval": null,
      "decision": null,
      "reviews": [
        {
          "reopened_at": "2026-10-26T12:18:21+00:00",
          "reason": "New CL-084–087 implementation and explicit 2026-10-26 owner verification/commit/AFK audit request supersede the earlier audit snapshot; retain all earlier evidence and owner-only gates.",
          "prior_status": "complete_local",
          "prior_prompt": {
            "text": "Execute CL-065 selected findings SEC-01, SEC-02 and SEC-03 only in the isolated quality-security-audit worktree. The complete audit and PM HTML have been produced and inspected, and provisional AFK selection records the actual IDs; owner personal review remains outstanding. Follow the ticket whole-file allocation: exact compatible Zod4.6.6 and Next/eslint-config-next16.4.1 dependencies/lock plus meaningful early rejection regression, then verified immutable official Node22.23.4 Bookworm image digest in all three app Dockerfiles and narrowly owning checks/docs. Confirm package/image metadata before depending on it. Preserve valid input/editor/preview/native export, paid output critique-only semantics, explicit retry and preparation reuse, all diagnostics and generic user errors, fixed bounds, cancellation and cleanup. No unrelated feature rewrite, bulk dev-tool updates or invented native patch. Independently confirm each finding, implement, run focused fake/no-key/paid-off/network-blocked checks, perform a read-only validate pass without edits, confirm/fix actual findings and repeat until no actionable local issue remains. Finish settled lint/types/format/unit, Linux actual image startup/CSP and current-source browser/native parity/cancel proofs appropriate to the updated runtime/framework; isolate generated fixtures and owned processes/scratch. Keep SEC-04 explicitly unresolved awaiting vendor/native release review, not remediated by documentation. Keep the running primary app unchanged and defer application of audit commits during owner manual paid review. Stage explicit cohesive file groups and local CL-prefixed commits under existing human authorization, inspect staged diffs for secrets/generated artifacts, and update the canonical primary build/AFK ledger. No ignored env/credential/private-media reads, paid or provider/cloud requests, scanner metadata export, deployment or push. Prepare honest final handoff with remaining external and provisional reviews.",
            "sha256": "55adc3e0eda9600f9b56266fb1c5e2ab6dc5a1506a4a53d6defb328c07dcb250",
            "context_sources": [
              "docs/tickets/CL-065-post-deployment-pre-sharing-security.md",
              "docs/operations/STRIDE_SECURITY_AUDIT_2026-10-24.md",
              "docs/operations/STRIDE_SECURITY_REVIEW_2026-10-24.html",
              "human:2026-10-24-current-build-audit-message"
            ],
            "status": "afk",
            "approval": null,
            "afk_session": "AFK-SESSION-001"
          },
          "prior_approval": null,
          "prior_decision": null
        }
      ]
    },
    {
      "id": "12-handoff",
      "name": "Final local handoff",
      "gate": null,
      "status": "complete_local",
      "prompt": {
        "text": "Finish the current ClipBuilder AFK audit run from actual primary-checkout evidence. Current owner authorization on2026-10-26 requested full fake/paid-off verification, documented fixes, separate file-level plans and local commits, then quality/security audits in execute/validate loops. Three actual local commits now exist: ca10def for84feature/verification files CL-084–088, cc4c7dc for12quality files CL-089, and6234d98 for21security files CL-090. Reconcile their exact plans, source/report identities and current clean Git state. Preserve the permanent Gemini critique-only/no-automatic-retry decision, all diagnostic privacy/bounds/cleanup and current functionality. Verify only non-metered normal application GET health/start/config/capabilities, process/listener ownership and absence of owned CL090 proof containers; leave the normal freshly rebuilt fake/cloud-off app running. No configuration/ignored env/key/retained-media reads or mutations, providers, G Cloud, deployment/push or scanner export. Record final current evidence: full146root+1728package unit cases and604local cases, format/lint/types,4focused packaging/schema checks after proof corrections, current Windows Text2browser/native cases, all3actual patched Linux image builds/runtime probes and current network-disabled Linux shared-editor/legacy-native proofs. Distinguish public build-software downloads from zero external application/provider processing. Record exactly the stale proof helpers and invocation errors that were corrected rather than calling initial failed runs passing. Explain that actual small-fixture Linux output is52x90 at source height for1second, with0generated-image calls/1explicit fake caption request, native cancellation/retry reuse and clean expiry/exit; no maximum capacity/cost or real AI quality is certified. Summarize material provisional AFK choices, current hosted/local boundaries, and remaining SEC90-01 vendor MP4 issue plus owner paid/media/rights/visual/security and actual hosted identity/TLS/Turnstile/single-instance/CPU/resources/capacity gates. Global host executable was verified22.23.4 without a system update. Preserve historical ledger evidence without treating the old isolated audit as current. Write one concise but reviewable AFK_HANDOFF_2026-10-26.md with links to all3file-level plans, actual commit IDs, safe runtime/log references, exact checks, unresolved next steps and its own exhaustive two-document commit allocation. Update only that handoff and the canonical source-of-truth build progress for final documentation. Stage/inspect/commit that exact documentation pair under the standing Git grant, verify clean Git and report local completion honestly. Keep final release status complete_local with explicit external/provisional gates; never fabricate personal acceptance or release approval.",
        "sha256": "92d1d60dd8f83538dc9bc310fd700d3e6b686f91f0bcd336929f576c096b0e86",
        "context_sources": [
          "AGENTS.md",
          "docs/operations/CL084_088_COMMIT_PLAN.md",
          "docs/operations/CL089_COMMIT_PLAN.md",
          "docs/operations/CL090_COMMIT_PLAN.md",
          "docs/tickets/CL-090-current-security-audit.md",
          "human:2026-10-26-current-request"
        ],
        "status": "afk",
        "approval": null,
        "afk_session": "AFK-SESSION-001"
      },
      "evidence": [
        "commit:ca10def",
        "commit:cc4c7dc",
        "commit:6234d98",
        "docs/operations/AFK_HANDOFF_2026-10-26.md",
        "docs/operations/CL084_088_COMMIT_PLAN.md",
        "docs/operations/CL089_COMMIT_PLAN.md",
        "docs/operations/CL090_COMMIT_PLAN.md",
        "final non-metered health/start/config200; synthetic-ai/cloud=false; live analysis/assembly/render false; owned127.0.0.1 listeners3000pid28448,4000pid27736,4200pid22952 with supervisors22772/14684 creation-time verified; zero CL090 proof containers",
        "full1874unit+604local,format/lint/types,4focused final regressions, WindowsText2cases, all3actual patched images/runtime and network-disabled Linux shared/legacy native proofs pass; whole-file plans and safe staged inspections for each committed scope"
      ],
      "blockers": [
        {
          "kind": "external",
          "reason": "SEC90-01 native MP4 vendor issue remains unresolved. Public release needs maintained fixed artifacts verified for actual inputs/components, or explicit owner risk review; passing local checks and Node patch do not close it.",
          "reference": "docs/operations/STRIDE_SECURITY_AUDIT_2026-10-26.md"
        },
        {
          "kind": "external",
          "reason": "Owner personal real-AI/media/rights/visual and provisional AFK product/security acceptance remain, plus actual hosted identity/TLS/Turnstile/single-instance/CPU/resource/capacity checks. No G Cloud/provider test/deploy/push authorization; current host executable verified22.23.4, no system update.",
          "reference": "docs/operations/AFK_HANDOFF_2026-10-26.md"
        }
      ],
      "approval": null,
      "decision": null,
      "reviews": [
        {
          "reopened_at": "2026-10-26T12:18:22+00:00",
          "reason": "New CL-084–087 implementation and explicit 2026-10-26 owner verification/commit/AFK audit request supersede the earlier audit snapshot; retain all earlier evidence and owner-only gates.",
          "prior_status": "complete_local",
          "prior_prompt": {
            "text": "Finish the current ClipBuilder AFK audit run from actual evidence. Reconcile primary canonical build progress, isolated managed audit checkout commits/status and owner permission: existing pending CL-058–063 work was planned/validated/committed before audits; CL-064 quality has four local fixes; CL-065 audit and PM HTML exist, selected SEC-01–03 dependency/image fixes are validated/committed after provisional AFK selection. Read back all actual gates and pending owner reviews. Report source identity, cohesive commit allocation, passing1785tests/169files/lint/types/format, actual patched Node22.23.4 frontend/backend/renderer image probes and current Windows/Linux synthetic upload/editor/native export/cancel/retry/cleanup evidence, plus meaningful limits. Preserve private diagnostics, no Gemini semantic rejection, shared editor and local-only YouTube, all bounds and retained assets. Confirm no owned proof container/listener/process remains; preserve owner normal running app and all diagnostic files. Keep the attached audit checkout recoverable with clean committed changes; do not archive or apply audit source while owner paid manual review continues. Canonical progress updates are progress-only local commits on primary main with a one-file plan; no source merge/push. Summarize material AFK decisions and outstanding provisional product/visual/security review, SEC-04 unresolved vendor MOV risk, owner global Windows Node update, real hosted identity/TLS/Turnstile/single-instance/CPU/maxcapacity and real paid quality checks. State fake/no-key versus real-provider requirements honestly; no local AI weights or implementation is introduced. Link the concise PM HTML and detailed reports. Mark handoff complete_local while these real external/provisional gates remain; do not claim all security risks fixed, user acceptance, production readiness or deployment. No paid/provider/cloud call, ignored env read, metadata export, push or deployment. End without an ordinary approval question while AFK.",
            "sha256": "648815042c9e69ed914f9cb9533ec80cc313db181eb23a7d778b11f98ab6c79a",
            "context_sources": [
              "audit-worktree:docs/tickets/CL-064-post-deployment-pre-sharing-quality.md",
              "audit-worktree:docs/tickets/CL-065-post-deployment-pre-sharing-security.md",
              "audit-worktree:docs/operations/STRIDE_SECURITY_REVIEW_2026-10-24.html",
              "human:2026-10-24-current-build-audit-message"
            ],
            "status": "afk",
            "approval": null,
            "afk_session": "AFK-SESSION-001"
          },
          "prior_approval": null,
          "prior_decision": null
        }
      ]
    }
  ]
}
```
<!-- build-progress:end -->
