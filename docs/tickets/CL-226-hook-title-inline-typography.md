# CL-226 — Hook-relevant titles and selectable word typography

Status: Complete locally with manual acceptance remaining, 2026-11-06. Owner explicitly requests
implementation of selected-word color/font styling and AI access. This supersedes
the earlier planning-only hold. Generated/fake/no-key verification and the
necessary current-source worker rebuild/reload are in scope; real inference,
owner saved-clip edits, configuration/cloud/deployment and Git mutation are not.
Dependencies: CL-165/184 title planning/presentation, CL-220 independent Hook
content and CL-224 unified editing are implemented. Preserve the separate,
unstaged CL-225 caption-list work.

## Owner feedback and desired outcome

When an owner uses the AI-suggested Hook, its opening title must accompany that
Hook and communicate its central idea, supported by the clip's actual payoff.
Moving an unrelated headline to an earlier timestamp does not satisfy this.
The owner also wants more visual title treatments and direct word/phrase
selection inside the preview title box, with normal Text controls styling just
that selection. A word can be bright red while the surrounding headline keeps
its existing appearance. AI must be able to author these treatments too.

Use synthetic copy in documentation/tests; do not copy the supplied screenshot,
its title, real media or private source context into the repository.

Standing owner instruction in this follow-up: always record requested edits,
fixes and feedback in an owning ticket. Root AGENTS.md now owns that ongoing
rule; this packet records both the product request and that operating feedback.

## Current implementation evidence

- `apps/backend/local/planned-text.ts` already asks both provider paths to pick
  the optional Hook first, then author one relevant title in the same response.
  CL-184 gives generated titles the `opening-title` role: frame zero of the
  presentation, including a prepended Hook, with no restart at body start.
  This is implemented intent, not proof that every real title is well chosen.
- `apps/frontend/src/features/local-editing/hook-edit.ts` accepts a suggestion
  as a local draft edit, with no AI dispatch. Audit its integration with
  independent Hook content and shared title clocks before claiming a defect.
- `packages/contracts/local/text-layers.ts` currently stores plain text plus
  one layer-wide style. Its `hookStyle` enum describes nine editorial headline
  approaches; it is not a visual typography selector. Text is normalized to NFC
  and trimmed. Generated titles have an 80-character bound; manual layers keep
  their existing 500-character/ten-line bounds.
- The title decoder applies the same fixed TikTok typography to every generated
  title. `text-inspector.tsx` edits a textarea and layer-wide typography. No
  persisted range styles or preview word-selection formatting exist.
- Both `codex-ai.ts` and `provider-ai.ts` use the shared title policy/decoder.
  Inline formatting must survive that entire route, not just appear in prompts.

## Research and interpretation — checked 2026-11-06

| Primary source | Observed pattern | Decision for ClipBuilder |
| --- | --- | --- |
| [Orshot: inline text styles](https://orshot.com/docs/orshot-studio/inline-text-styles) | Double-click a text layer, select words and change their color/font/size/weight in the sidebar. One layer holds mixed styles. | Adopt direct preview selection and existing inspector controls; keep one title layer. Its HTML API representation is not adopted. |
| [Zubtitle: individual-word styling](https://help.zubtitle.com/article/101-how-do-i-change-the-color-for-individual-words-in-the-captions) | Selected phrases can receive color, weight and size changes that appear in the video preview. | Make selection scope clear and preserve it when moving focus to formatting controls. This is an interaction precedent, not evidence that static titles and spoken captions are interchangeable. |
| [TikTok: creative best practices](https://ads.tiktok.com/resources/help/article/creative-best-practices?redirected=2) | Guidance emphasizes an early hook, text for context and keeping content within interface safe areas. | Make the title explain the actual opening idea, keep it readable and allow restrained emphasis on meaningful words. |
| [MDN: Selection](https://developer.mozilla.org/en-US/docs/Web/API/Selection) | Browser selections identify a range/caret with anchor and focus endpoints. | Treat the selected range as explicit editor state bound to its layer, occurrence and text revision; do not depend on a transient browser highlight after sidebar focus changes. |

The proposed treatments below are product recommendations informed by these
patterns. These sources do not prove that a red word improves retention, that
one title style is universally best, or that competitor behavior was personally
tested. TikTok's guidance concerns ads; apply its relevance/readability principles
without importing performance promises or replacing the existing reading clock.
Static title emphasis is distinct from spoken-word caption animation.

## Recommended UX

### Title meaning and placement

1. In the existing fresh planning response, choose the optional suggested Hook,
   author the title around its idea and the actual clip payoff, then choose a
   visual treatment and at most two meaningful emphasis phrases. Without a useful
   Hook, use the clip's opening concept/payoff. Keep zero/one active AI title.
2. `Use suggestion` applies the already planned Hook/title relationship as a
   local draft edit. The opening title is visible on the first Hook frame,
   instead of waiting for the body. Preserve once-only presentation timing;
   a short Hook may end before the existing readable title duration finishes.
   Do not compress the title into an unreadably short Hook or duplicate it.
3. Verify fresh planning, preparation, suggestion acceptance and native output.
   Repair a confirmed routing/copy/clock defect if found; do not claim a new
   title relocation feature solely because its existing policy was restated.
4. Saved/manual copy and styling remain authoritative. Changing/removing a Hook
   adjusts valid timing as before and never silently rewrites a title or calls
   AI. A different manually chosen Hook may need an owner copy edit; no hidden
   regeneration. Preserve independent Hook/main edits and legacy source clocks.

### Select words, use the normal inspector

| State/action | Result |
| --- | --- |
| Single-click a title | Select its layer with the existing move/resize behavior. |
| Double-click the selected title, or choose `Edit text` | Pause the preview and enter text editing inside that same scaled title box. On keyboard use Enter on the focused title; touch has the explicit Edit text action. |
| Drag-select a word or phrase | Highlight actual characters. Open Text → Style and bind its character controls to that selection. The current occurrence remains pinned. |
| Open a color picker or change another character control | Keep the saved range while the sidebar takes focus; update only those characters in the live preview. A concise `Selected text` scope chip identifies the selection. |
| Choose `Whole text`, or leave editing with no active range | Return to layer-wide typography. A collapsed caret never silently formats the whole title while range mode is active. |
| Use the Text → Content editor | Offer the same rich-text selection and formatting model as direct preview editing, with one canonical draft. Preserve selection when switching Content/Style. |
| Exit direct editing with Escape/Done | Return to layer movement; keep edits in the normal dirty draft. Workspace footer Apply/Discard remains the only save/discard path. |
| Switch layer, clip or Hook/main occurrence | Clear the range so stale selection cannot style a different copy. Preserve the existing dirty/navigation rules. |

During direct text editing, text selection must not start box dragging, resize,
seeking, playback shortcuts or a provider request. Resize handles and background
drag remain available after leaving text-edit mode. Use actual scaled text and
native selection handles on touch; do not fake selection with word buttons or
force owners to split a headline into multiple timed layers.

Character formatting: text color (including bright red), supported font, font
size, font weight and outline color/width, plus an optional text highlight fill.
Mixed selections display a mixed state until an explicit property is changed;
changing one property preserves every other property. Clear selection styling
removes only its overrides. Layer alignment, box background, position, timing
and entrance/exit behavior stay layer-wide and visibly separate from range scope.
Typography uses existing installed fonts and limits, without font downloads.

### More title treatments

Add a small Text → Style treatment gallery, with synthetic samples and editable
values, reusing current typography/background primitives:

- **Bold hook:** retain the current white, bold, outlined treatment as the
  compatible default for existing titles.
- **Impact:** heavier sans-serif headline with a strong readable outline.
- **Editorial:** contrasting supported serif typography with a quieter backdrop.
- **Highlight panel:** dark headline on a light continuous panel.

These are visual treatments, separate from the existing editorial `hookStyle`.
Applying a whole-layer treatment keeps authored text, box/timing and explicit
word overrides. A separate Reset word styles action is required to remove them.
For selected words, offer existing color controls plus quick red/yellow/cyan
accents; a highlight fill also remains available. Do not force an accent on
every title or promise viral performance. Verify all treatments at the maximum
supported text size/line count, with shared wrapping and safe-area behavior.

## Canonical data and AI access

- Keep plain `text` authoritative, with optional bounded, sorted non-overlapping
  spans containing start/end and allowlisted character-style overrides. Use one
  browser-safe contracts schema for editing, persistence and rendering. Old
  documents without spans retain their exact appearance; no saved migration.
- Recommended cap: 32 normalized spans per layer under existing text/line/layer
  limits. Merge adjacent identical styles and omit empty/redundant spans. Bound
  bytes and work before traversal. Never silently drop existing owner styling
  when a new edit would exceed the cap; give actionable local feedback.
- Canonical offsets are zero-based UTF-16, end exclusive, into the final
  normalized text. Reject split surrogate/grapheme boundaries. Map selection
  forward/backward and across wrapped lines; normalize/remap text and spans
  together, including NFC/line endings and existing trim rules.
- Inserting text inherits the caret's explicit typing style. Replacing a range
  removes overrides only from replaced characters and rebases surviving spans;
  deleting an emphasized word must not transfer its accent to a neighbor.
  Preserve meaningful local undo/redo and IME composition. Paste plain text,
  inheriting current typing style; do not store/render arbitrary pasted markup.
- Extend both provider output schemas and their shared policy/decoder with the
  visual treatment and optional emphasis proposals. Models should identify an
  exact substring plus a zero-based occurrence index in their final authored
  title, with the same allowed style properties. Resolve anchors deterministically
  into canonical spans after normalization. Do not use transcript word IDs as
  title offsets: authored headline words may differ from source wording.
- Give AI concise descriptions of every supported treatment, field, safe color
  palette and bounds. Choose zero to two meaningful phrases rather than random
  words; relevance follows the Hook and source-supported payoff. Manual owners
  retain broader selection freedom within the canonical bounds.
- Synthetic example: `Why buyers wait` with an emphasis proposal for `buyers`,
  occurrence 0, color `#FF3B30`, weight 900, resolves to [4, 10). Repeated words
  need explicit occurrence identity; no fuzzy match or styling every occurrence.
- Malformed optional emphasis is removed/normalized independently while retaining
  usable title copy and other paid work. Evidence/taste/readability critiques
  stay advisory. No automatic AI retry, extra call on Hook acceptance, HTML,
  executable CSS, arbitrary font/asset URL, or provider fallback.
- Carry the canonical result through fresh preparation, real HTTP transports,
  compiled overlays, independent Hook copies, Apply/Discard, save/recovery,
  preview and native export. Updating only the prompt or inspector is incomplete.

## Implementation allocation and acceptance gates

Execute this one packet in dependency order after implementation is requested:

1. **Contracts and persistence:** owning text/style/planning schemas, canonical
   normalization/edit operations, independent Hook propagation and focused
   backwards-compatibility/range tests. Avoid duplicate contract definitions.
2. **Shared rendering:** `packages/composition/local/text-layer.tsx`, text paint
   and overlay evaluation as required; fixed native overlay/export must consume
   the same styled runs, wrapping, line metrics and presentation clock.
3. **Editor:** TextInspector, typography controls, title selection/interaction
   boxes and owning CSS/state; reuse Button/tokens, one inspector and footer.
4. **AI integration:** shared planned-text policy/decoder, Codex and Gemini
   schemas/adapters plus fake fixtures; retain the current planning call budget.
5. **Evidence/docs:** focused generated unit/API/browser/native proofs, owning
   service/composition guides, source of truth, this ticket/index. Read applicable
   AGENTS files and pinned framework guides before code changes.

Required checks:

- Fresh fake planning → real transport → preparation → Use suggestion → preview
  and decoded native frames: relevant title appears at first Hook frame, continues
  readably across a short Hook if needed, and never restarts at body start.
  Include no Hook, changed/removed Hook, independent Hook/main and legacy layers.
- Exact fake AI call counts remain unchanged. Preview/suggestion/style/Apply/
  reopen/export do not start inference; bad optional styling retains usable text.
  Test both provider output shapes and absence of new style fields.
- Actual pointer selection of a word in the scaled preview, then sidebar red:
  only that word changes, including after focus changes. Check keyboard selection,
  mixed styles, touch entry/handles, editing versus dragging, multiline/long
  titles, repeated words, replacement/deletion/paste, Unicode and IME/undo.
- Apply/save/reopen/recovery/export preserve spans and independent occurrences;
  Discard restores prior styles. Test whole presets preserving local accents,
  explicit Reset, bounds and malformed inputs without HTML execution.
- Generated native pixels prove the accent color, different sizes/weights/font,
  outline/highlight, stable line wrapping and safe area agree with preview,
  including 24/25/29.97/30/60fps Hook clocks where those clocks are touched.
- Inspect empty/selected/editing/mixed/dirty/busy/failure at desktop, short laptop,
  390px and 320px. Confirm compact collections, scroll, footer, focus return and
  cleanup. Use the Codex browser; preserve the normal app and saved owner media.
- Run focused units/types/lint/format and justified browser/native gates; perform
  read-only validate/fix loops until no actionable findings. Rebuild/reload the
  normal internal worker with verified ownership after shared/native changes.

## Capability, approval and completion status

Research, implementation and generated local verification are complete. Fake/no-key
prepared media supports selectable word styling and all four title treatments;
fake provider transports support treatment/emphasis output. Actual native frames
verify paint through the fresh preparation pipeline and worker HTTP. These checks
do not establish real AI taste or owner/device acceptance.

Real local AI still requires the configured Codex sign-in/allowance, prepared
speech tooling/models and enabled local gates. These were exposed as ready
during the earlier normal startup, not re-run for this planning request. Codex
planning is subscription-backed, not an offline local model; local speech models
need no provider API key. Real Gemini requires its API key, enabled live flags
and applicable approvals. New real-provider/creative, physical-device and hosted
release acceptance remain owner-only. Do not regenerate or edit the current clip
as evidence of a generic fix. The required backend/internal-worker rebuild/reload
was performed for implementation; provider/configuration/install/cloud/deployment
and Git mutations remain outside scope.

## Implementation and verification — 2026-11-06

- `text-ranges.ts` owns allowlisted character styles, 32 sorted/merged spans,
  grapheme-safe UTF-16 selections, exact AI occurrence anchors, normalization
  and range editing. Text and offsets normalize together; edits preserve surviving
  spans. Explicit replacement boundaries prevent a matching suffix of a replaced
  word from accidentally retaining its old style. Overflow reports locally and
  retains prior styling. Old documents need no migration.
- The Text inspector retains selection while focus moves to formatting controls,
  shows scope/mixed values, and changes only the explicit property. Color/font,
  size/weight, outline and optional word highlight are supported. Preview uses
  a real plaintext-only editable surface, without movement/resize interception;
  Enter/double-click and a touch-accessible action enter it. Content selection
  shares the same range model. Typing undo/redo is bounded to 100 entries; IME
  composition defers model updates until completion. Whole text/presets preserve
  accents, and clearing/reset is explicit. Apply/Discard retains footer ownership.
- Both provider schemas reuse the shared optional treatment/emphasis contract;
  the shared planning policy explains every field, four treatments, palette and
  Hook relevance. Bad optional style never vetoes usable title copy. Codex and
  Gemini injected transport tests retain their exact existing inference counts.
- Generated Codex-browser actual pointer double-click selects “buyers” in a
  scaled synthetic title. Red then Georgia affects only that selected phrase;
  moving inspector focus retains it. Apply makes exactly one real generated edit
  POST, then browser reload retains the saved red/Georgia span. Hook styling is
  independent from the unchanged main copy and base; fake plan/image/render all
  remain zero, unexpected requests zero. Mixed whole-title selection changed
  only font while preserving red; typing, undo/redo, Discard, treatment retention
  and keyboard Content→Style selection passed. 390×844 and 320×568 have no
  horizontal overflow and all typography fields fit; footer remains reachable.
  Browser error log empty; screenshot saved outside Git. Fixture/tabs/scratch
  closed, its two owned processes gone and port 52874 released.
- 51 focused text/range/planning/Codex/rendering/clock units and two Gemini title
  cases pass, along with local/frontend/test types and scoped ESLint/Prettier. A wider
  exploratory provider suite exposed the existing unrelated low-confidence Focus
  test expecting first-person fallback (`provider-ai.test.ts`, confidence 0.6);
  current CL-218 behavior returns null. Its source/compiler is unchanged here;
  do not interpret the focused pass as a clean full provider suite.
- `local-title-styling.proof.ts` passes: fresh fake planning/preparation, saved
  edit round-trip, Hook creation and current-source worker HTTP produce real MP4
  pixels with red accent, white surrounding text, yellow highlight and dark
  outline on the first and last short-Hook frames and body start, then no title
  at the later sampled frame. Font/weight/size/outline markup is shared and
  independently asserted. Exactly one fake plan/image/transcribe, two native
  preview/export requests, zero unexpected provider calls. Scratch is removed.
- Clarification against the earlier planning prose: CL-220's newer independent
  Hook/main content decision preserves each occurrence's opening-title clock.
  This ticket does not silently change that behavior. Linked legacy titles keep
  CL-184's once-only clock across a short Hook, with existing 24/25/29.97/30/60fps
  clock tests passing. No clock implementation changed and no saved clip was
  patched/regenerated. The initial failing Hook test used inconsistent synthetic
  caption references; correcting the fixture resolved it without a product fix.
- Read-only validate/fix review checked integration, stale selection/occurrence
  clearing, bounds, normalization, mixed-property isolation, literal markup,
  lifecycle, dependency direction and pending-work separation. No actionable
  findings remain locally. Real touch selection handles, physical IME sessions,
  assistive technology, installed-font differences and real AI taste remain
  manual/unverified. No claim of full device/hosted/release acceptance.
- Required contracts build and normal backend-only restart rebuilt the native
  worker/overlay. Old ten-process tree absent and ports released through a
  stabilization check. New supervisor 16992, API 1140 on 4000 and worker 21588 on
  4200 verified; frontend 3496 preserved. Health, `/start`, `/api/sample/config`
  return 200. Content-safe runtime/log record remains in the existing private
  temporary run directory; no ignored config read/change or owner-media write.
  Nothing staged or committed.
