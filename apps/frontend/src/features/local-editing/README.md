# Local editing controls

CL-114 hosted limits: manual rows and AI count share three slots; manual rows take priority, and excess input is corrected with a body-portal status toast. Server admission and cumulative batch limits remain authoritative. Hosted Start over clears the session and rechecks its network allowance; exhausted intake replaces upload. Localhost retains its current ten-clip safety limits. Quota UI checks use fake ports/no keys; real AI and durable hosted setup remain separately gated.

This client feature is rendered inside the existing application shell at
`/start` when normal server configuration is local. It uses `/api/local` and
has no separate bundle, server, startup command or AI configuration.

Both intake cards share header/body/footer structure. The body can scroll;
the footer keeps paired actions on one row and aligns with its sibling. A
landscape thumbnail/title row replaces the old floating preview. Transfer status
replaces the picker and reuses shared Progress, with real byte fractions only
for known transfer totals and indeterminate motion during preparation. Cancel
stays in the footer. Failure/cancellation restores the picker and a short status.
Follow the permanent CL-041 design guard in repository AGENTS.md.

Intake presents upload and YouTube as two desktop columns, stacked on phones.
The YouTube card replaces link entry with resolution selection after Continue;
new qualities load in that action, then Download remains explicit.
The native picker uses an inset chevron and one English choice per resolution
from 480p through 1440p. Regional English tags are accepted; unknown languages,
other audio and out-of-range variants are hidden, including saved copies. Saved
tiers replace duplicate downloadable tiers; new downloads require an explicit
choice, with no Best fallback. Both cards reserve responsive height across all
states, with internal overflow for larger errors/progress or text sizing.
A bounded selected-video title and landscape thumbnail form the preview row.
Only overflowing titles scroll; full text remains available to assistive tools
and through the title tooltip. Images use the protected same-origin JPEG route
and degrade to a stable icon. Saved copies show a paused, muted frame from the
local master through the protected range endpoint, with no online metadata/image
request, AI, native processing or workspace creation. The media request is
released on selection change or unmount. Older saves use “Saved video” when no
ephemeral title exists; decode/read failure keeps the icon and Use video action.
Use video shows a rotating “Opening…” busy button until the saved workspace
opens the next step. Controls remain disabled during that request; failure
restores the action for explicit retry without changing the card or footer.
The full URL form is present during startup, with an inline spinner and disabled
input until concurrent capability/workspace restoration completes. Initialization
never swaps a placeholder card into the form; a failed connection keeps it disabled.
Resolution lookup shows an indeterminate spinner, since it has no measured
completion or ETA. Spinners continuously rotate under every motion preference;
app-level motion suppression must never be reintroduced per the owner's CL-039
decision. Download progress continues to use reported bytes and a known total
when available.
Ready saved copies use the same picker offline. New downloads save to Downloads/ClipBuilder
without a destination control; technical/source-management prose stays out of intake.
The local-only demo-sample CTA sits beside upload. The same picker accepts saved
draft JSON and recognizes videos belonging to a saved draft by their bytes;
saved edits and exports reopen without AI or rendering. There are no permanent
library sections or Save draft action/status polling. Existing saved drafts keep
their backend autosave; removing the control does not create new saved projects
or delete existing files.
Selection and editing reuse the demo's glass materials, shared
buttons and responsive layout. Position/size fields remain under their disclosure.
Processing opens a separate editor view, replacing selection entirely. Clip tabs
open one preview and inspector; Captions, Filters and Pictures show one group at
a time. Caption Style/Position/Text and picture Image/Timing/Motion/Position sub-tabs
keep controls compact. Empty Captions offers Generate captions with an explicit
Gemini/audio-transfer credit confirmation in the footer. The local-only Generate
fake captions action beside it needs no key or credits; hosted excludes it.
New fake clips start empty. The hardcoded backend fake-caption switch defaults
off and the automatic Earth picture is retired; manual pictures still work.
Text groups existing caption words into editable fields with read-only preview
seek buttons. IDs/times stay fixed, Reset text restores original words, and
Apply/Discard/reopen/native export share the same text-only overrides. Local paid
caption transcription alone may bypass fake/paid-master switches by explicit
owner decision; other providers/cloud keep their gates. No env change is needed.
Apply/discard before changing clips or leaving editor.
CL-086 adds a Text setting with up to ten independent 500-character text layers
(up to ten explicit lines each),
clip-relative Start/End and Capture, drag/resize, position presets and shared
typography controls. Text and captions share TikTok style (white/black outline),
Solid background and Translucent background presets, font/size/weight/color,
alignment, outline and background color/opacity. Text supports line breaks and
wrapping; captions retain word timing and their existing animation controls.
All text changes follow Apply/Discard, saved drafts and explicit export. No key
is needed for manual text in either mode; fake captions remain fictional and real
AI generation retains its separate keys/consent/approval requirements.
CL-087 new automatic clips add a short editable top title in TikTok style for up
to four seconds. New automatic/generated captions use TikTok style; reset shows
the actual base default, while legacy/explicit styles remain compatible. New
pictures fade in/out. The rail and loading panel follow actual preparation work
(Planning edits / Adding pictures / Adding captions / Preparing preview), without
invented percentages or timed message cycling. Fake titles are fictional and
fake captions remain default-off; real titles share the existing approved AI
planning request, adding no separate provider call.
CL-084 opens the editor after validated preview preparation, before any finished
MP4 exists. AI captions/pictures/framing and all edits remain live in the Player.
The footer shows Export clip until the first explicit export finishes, then
Download clip for the matching revision. Applying edits does not auto-export;
saved preview-only clips reopen without AI or rendering. The final renderer and
quality profile are unchanged. Real AI remains owner-tested with keys/approvals;
fake/no-key tests exercise the native workflow with injected content.
The footer has one primary plus Add more clips; dirty mode shows Apply/Discard.
Back to editor retains inputs without submitting. Start over is directly in the
footer and also discards unapplied browser edits. Existing acknowledged session
cleanup returns to fresh intake; pending work disables reset and failures retain
retry/discard. Saved library files and retained masters remain preserved.
No permanent export history or restored-session success notice is shown.

Caption presets center text at 25%, 50% or 75% of the portrait, fitting oversized
boxes inside the selected half to keep those centers exact. Direct mouse/touch
drag and keyboard movement pause playback and respect the safe area. Editable
canvas disables Player click-to-play/fullscreen and space-focus interception;
ordinary playback controls remain. Rounded highlight and Typewriter typography
join Clean/Classic/Bold; motion offers highlight/pop/bounce/reveal/word-by-word/
fade/static. Local fonts require no download. Old caption documents remain valid.

Upload PNG/JPEG/WebP inserts and selects a cue immediately, including a reused
deduplicated asset. Up to twenty manual cues share at most twenty admitted assets;
automatic generation keeps its existing three-image ceiling. Selected pictures
have start/end seconds, entrance/exit and duration, quarter/center presets and
direct manipulation. Animation is frame-driven in shared preview/native output;
the raster cache includes motion state. Upload limits remain 4 MB/16M pixels,
static rasters only. The same opaque asset receipt handles fresh/repeated uploads.
Transparent PNG/WebP uploads preserve alpha through protected delivery, saved
drafts, preview and MP4 composition; the video shows through, without a matte.
Previously flattened uploads require re-uploading the original once. CL-079 owns
verification; no AI keys or paid calls are needed.

Controls use short labels and actionable errors. CL-074 permanently removes the
footer mode/status badge and icon in every mode. Provider/native call counts,
provenance/tutorial text and success narration stay out of the product. Picture timing uses seconds
and keeps exact frame-aligned values internally. Each endpoint has Capture from
the settled preview: Start uses the displayed frame; End includes that frame.
Capture pauses without seeking, changes only the selected picture's endpoint,
and preserves the previous time for invalid order. Loading/seeking/failed/busy
previews cannot capture. Apply/Discard and native exports use the same timing;
this works in fake mode without API keys. CL-077 owns verification.
Caption-layer selection follows
the active settings tab; advanced position/size stays under its disclosure.

Focus uses Camera / People; Camera contains Timing / Advanced for the selected
person and position. Each timestamped row owns independent camera settings.
Add position opens a person selector defaulted to the highlighted row. Add
confirms insertion directly below it; Cancel leaves the draft untouched.
Remove position renumbers remaining entries. Position selectors navigate rather
than copying framing. People retains per-person removal and numbered-handle
positioning without appearance times. CL-071 keeps playback ticks out of the
parent Player inputs and holds the overview still during playback. See
[CL-076](../../../../../docs/tickets/CL-076-confirm-position-person.md).

Add clips / Your clips tabs replace the form with its results in the same slot;
never append a full result workflow below the inputs. New/restored results open
Your clips with all unique results, manual-first. CL-085 cards show source range,
frame-derived duration, Jump to source playback and Remove. Remove unwanted
cards; keep extra returned results visible until explicitly removed.
Tabs preserve inputs and choices without any request; changed inputs invalidate
stale results. Add clips owns Find moments / Use clips; Your clips owns Process
clips, disabled when none or more than ten remain. Processing always needs an
explicit click. Use the existing settings-tab materials, keyboard navigation and targets.
This permanent owner view rule is in AGENTS.md (CL-048/085).

Editor playback errors stay in the portrait preview with Retry. Native
error capture handles them before Remotion's error log can activate Next's
developer overlay; the ordinary video error callback and Player render fallback
also remain handled. The old player is paused/unmounted, and explicit retry
remounts only playback at its previous supported frame, paused. Dirty edits,
selected settings and clip state stay intact; retry makes no processing, export,
AI or clip-reload request. No automatic retry or raw browser error is shown.
Invalid saved overlay data retains its existing Reload clip path. Fake AI and
local playback need no provider keys; these checks establish no live AI quality.

The persistent workspace footer owns Find moments/Use clips, Process clips, Apply changes
and Export/download. A small portal keeps handlers/state with the owning form
while mounting its context-relevant actions in that footer. Selection and field
tools stay in the content; hidden selection/editor panels cannot leak actions
into the footer. Preserve dirty/stale guards, busy state and explicit retries.
Turning off AI suggestions hides their fields, retains manual clips and requires
at least one manual clip before Use clips becomes available.
Manual Start/End fields display and accept HH:MM:SS, without milliseconds.
Complete clocks normalize on blur and submission: 00:00:60 → 00:01:00,
00:60:00 → 01:00:00, 00:00:90 → 00:01:30 and 00:90:00 → 01:30:00.
Partial/invalid text remains editable; existing source and range limits still
apply (normalization does not extend the maximum source duration).
Existing precise timestamps remain unchanged until their field is edited.
Each endpoint has Capture, reading the paused/playing source preview
at click time after using its native seek slider. It floors to whole seconds
within loaded source bounds and changes only that field. Capture is unavailable
while loading, seeking, failed or busy and never starts analysis/processing.
Both features work with fake AI and no API keys.
The permanent rule is documented in repository AGENTS.md (CL-045).

See the [local workflow guide](../../../../../docs/operations/LOCAL_WORKFLOW.md).
The editor view uses its actual workflow content container height to size the
portrait preview and compact spacing. Collapsed laptop controls fit above the
footer; long/expanded controls still scroll. Other flow/navbar geometry is
preserved. CL-056 owns measured fit, resize and overflow evidence.
Preview selection outlines/drag/resize targets follow the active setting:
Captions for captions, Pictures for images, none in Filters. Tab switches retain
edits and preview media/playhead; CL-055 owns this verification.
Clip switching uses a left-hand vertical rail (Up/Down/Home/End). Queued and
exporting clips show a spinner instead of editing controls, regardless of a
retained base/output. CL-084 also admits review-ready/edited clips with a measured
preview receipt and no final export; legacy completed output-backed clips remain
compatible. Other active/failed/canceled states cannot open the editor;
settings and layer handles wait for initial preview decoding. Initial failure
keeps retry available; later playback failure preserves dirty edits. CL-054
owns the original readiness regression; CL-084 owns preview-first evidence.
This also applies to fake AI.
Fake AI is fictional and key-free while downloads and native processing are
real. Hosted `/start` uses the shared upload-only editor and authenticated bridge.

## Compact editor settings

Captions → Speakers uses anonymous transcript labels to color speaker turns.
Text, background and highlight colors are editable per speaker; each caption
word can be reassigned or left unassigned. Apply/Discard and saved edits use
the same colors in preview and native exports. Reset speakers restores automatic
labels/colors. Generate fake captions supplies fictional speaker labels without
keys; real transcription quality requires configured provider keys, live flags
and owner approvals. New fake clips still start without captions.

Hook adds one manual prefix of up to ten seconds from inside this clip.
Start/End seconds accept frame precision; Capture uses the decoded preview
frame (End includes that frame). Preview hook plays the prefix then the intact
body. Captions, speaker colors, text, pictures, focus, filters and audio follow
the repeated segment in preview and MP4. Apply/Discard and saved drafts retain
the hook; Remove hook restores the ordinary clip. Other inspectors keep times
relative to the original clip and seek into its complete body. Hooks need no AI
request or API key; native media rendering still requires the installed tooling.

Desktop inspectors scroll within the available workspace height, keeping the
preview and persistent actions above the footer as typography controls grow.
Phone layouts retain their vertical content scroll. Text and caption controls,
keyboard focus and 44px targets remain available. CL-088 covers the compact
laptop regression; fake/no-key fixtures prove mechanics, not owner visual or
real-provider acceptance.
