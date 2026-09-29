# CL-002 visual reference research

Accessed: 2026-09-29

Purpose: content-safe comparative research for the ClipBuilder standalone HTML
visual reference.

The screenshots in `screenshots/` are attributed captures of public official
product pages. They are retained only as design-research evidence. They are not
ClipBuilder runtime assets, are not redistributed inside the product, and must
not be treated as permission to copy another product's artwork, copy, UI, or
brand language.

The three `clipbuilder-*.png` files are original, content-safe review captures
from the local standalone reference:

- `clipbuilder-reference-overview.png` — opening art-direction concept at
  1440 × 1000;
- `clipbuilder-editor-desktop.png` — signature three-pane editor at
  1440 × 1000;
- `clipbuilder-editor-phone.png` — guided phone editor at 390 × 844.

## Sources and captures

| Product | Official source | Local capture | What was reviewed |
| --- | --- | --- | --- |
| Descript | <https://www.descript.com/tour> | `screenshots/descript-product-tour.png` | Script-first editing, product UI as the hero, familiar document/slide mental model |
| OpusClip | <https://www.opus.pro/ai-video-editor> | `screenshots/opusclip-ai-video-editor.png` | Long-video-to-short flow, autonomy/control framing, dark editorial product presentation |
| Riverside Magic Clips | <https://riverside.fm/magic-clips> | `screenshots/riverside-magic-clips.png` | Single-purpose clipping entry, simple upload/link prompt, edit-on-your-own-terms message |
| Captions | <https://captions.ai/> | `screenshots/captions-home.png` | Strong display typography, immediate footage action, tactile editorial surface treatment |
| VEED | <https://www.veed.io/tools/video-editor> | `screenshots/veed-video-editor.png` | Direct utility promise, bright action hierarchy, broad editor capability presentation |
| Adobe Premiere | <https://helpx.adobe.com/premiere/desktop/edit-projects/edit-with-generative-ai/generative-media-tool-overview.html> | Not retained—HelpX returned an automated-access denial instead of product content | Generated media stays in the timeline as an editable, reviewable object |

Supporting official product text was also reviewed at:

- <https://www.opus.pro/>
- <https://riverside.fm/video-editor/video-editing-glossary/magic-clips>
- <https://help.captions.ai/docs/project/ai-edit>
- <https://support.veed.io/en/articles/11652474-how-to-use-our-clips-feature>
- <https://helpx.adobe.com/premiere/desktop/edit-projects/edit-with-generative-ai/generative-extend-overview.html>

The failed Adobe capture was discarded rather than preserved as misleading
evidence. The five retained PNGs below were visually checked and contain only
public product-page content.

## Patterns worth carrying forward

- Put the product itself in the visual story. Descript's editor presentation is
  more convincing than abstract AI decoration because the workflow is visible.
- Pair automation with retained agency. OpusClip's strongest product idea is
  the combination of a first pass and precise last-mile controls; ClipBuilder
  should make the proposal, diff, Apply action, undo, and word boundaries even
  more explicit.
- Keep entry comprehension fast. Riverside and VEED explain the input and
  outcome quickly. ClipBuilder should preserve that directness while showing
  rights, limits, and temporary handling beside the action.
- Use typography as product character. Captions demonstrates that a distinctive
  editorial headline can carry personality without a mascot or AI orb.
- Keep generated or automated work editable and attributable. Adobe's
  timeline-integrated, labeled generated media is the closest analogue to
  ClipBuilder's inspectable speaker-focus and visual-beat tracks.
- Show real editor structures—transcript, preview, evidence, timeline, and
  proposal state—instead of a feature-logo collage.

## Patterns ClipBuilder should deliberately avoid

- “Viral,” guaranteed-growth, view-count, or performance-score framing. The
  candidate order is editorial judgment grounded in transcript evidence.
- One-click magic that hides what changed. ClipBuilder names stages and exposes
  the validated range, evidence, tracks, and diff.
- Chat as the primary editor. The assistant is one bounded proposal rail, not a
  conversation history or the source of state.
- Every-tool marketing sprawl, template marketplaces, stock libraries, social
  schedulers, or publishing dashboards. They weaken the single-edit story.
- Generic black-and-neon AI styling, purple gradients, glassmorphism, floating
  particles, and decorative waveform activity.
- Product screenshots or competitor illustrations copied into ClipBuilder. The
  reference uses original HTML, CSS, inline SVG, and synthetic text only.

## Structural reference: ScreenPilot

Inspected locally:

- `C:\Users\minat\Work\screen-pilot\docs\SCREENPILOT_DESIGN_SYSTEM.html`
- `C:\Users\minat\Work\screen-pilot\docs\tickets\SP-004-create-and-approve-visual-design-references.md`

ClipBuilder follows ScreenPilot's useful document architecture: one
self-contained editable HTML file, a compact sticky guide, an opening product
concept, token/type/layout specimens, component/state specimens, responsive
product concepts, motion notes, and a final review checklist. It deliberately
does not reuse ScreenPilot's Deep Ink/Warm Coral palette, friendly recruiting
tone, rounded-card composition, handwriting motif, copy, or interview layout.

## ClipBuilder synthesis

The proposed direction is **Night Edit / Signal Amber**: charcoal-black edit
surfaces, cool slate structure, a pale transcript sheet, and a concentrated
amber signal accent. A high-contrast editorial serif is reserved for a few
display moments; a practical humanist sans carries UI and reading; a compact
mono family carries timecode and provenance. All are expressed with local
system fallbacks in the reference—no font is downloaded.

Motion is divided into two contracts:

1. **Production UI motion** explains selection, panel continuity, progress,
   proposal application, and focus. It uses 90/140/220/320 ms tokens and never
   claims processing progress through decorative activity.
2. **Rendered-video motion** describes output behavior: immediate editorial
   cuts, short deterministic card transitions, a single slow push for approved
   full-frame stills, and smoothed speaker framing. It is labeled separately so
   UI motion can never be mistaken for an export promise.

The reference remains provisional until the owner explicitly approves or asks
for revisions in CL-002.
