# CL-041 — Align intake actions and transfer design

Status: implemented and verified. Dependency: implemented CL-040.

Owner request 2026-10-23: keep the YouTube CTAs together on one bottom row like
upload, improve the selected-video presentation, replace the resolution picker
with transfer status instead of appending a new section, and reuse the demo's
progress design. Document durable design rules in AGENTS.md.

Give both intake cards the same header/body/footer structure. Keep footer
actions anchored while only the body can overflow. Align the desktop CTA rows,
keep paired YouTube actions on one row on narrow phones, preserve 44px targets
and stable card bounds. The selected-video preview should be a coherent media
row with a landscape thumbnail and readable title, not a tiny floating square.
Preserve full title/overflow motion, image fallback, exact quality choice,
offline reuse, errors and cancellation.

Active queued/video/audio/merge/inspection/publication status replaces quality
controls in the same content slot. Use the existing shared Progress component:
measured byte fractions only for transfers with known totals, indeterminate
activity otherwise. No native green/gray progress widget, fabricated percent,
ETA, duplicated form or extra growing download section. Keep cancel in the
bottom action row; restore the picker with concise terminal feedback on failure
or cancellation. Provider/download/native dispatch behavior remains unchanged.

Extend the existing synthetic browser proof for action-row alignment, bottom
anchoring, replaced controls, known/unknown progress, all processing stages,
terminal recovery and responsive preview layout. Inspect desktop/phone captures;
run focused unit/types/lint/format and read-only validate. Keep AI fake/key-free,
all saved media and normal/unrelated services intact. No real media/provider/
cloud call, environment-file read, Git mutation or deployment in this packet.

The owner's follow-up request to investigate the actual download failure is
the next dependency-ready packet after this design correction, using the same
previously supplied link and fake AI. Do not treat design proof as download proof.

## Implementation and evidence

Both cards now share header/body/footer structure and a reserved footer-note
slot. Paired actions remain on one bottom row; compact tablet/phone treatment
preserves 44px targets. Only the body scrolls. Preview becomes a full-width
landscape media row with readable full/scrolling title and quality metadata.
Shared Progress replaces the picker during transfer and preparation. Known
video/audio byte totals yield measured fractions; queued and processing stages
remain indeterminate. Cancel stays in the footer. A terminal outcome restores
the picker, allows explicit retry and clears on Change link. Restored active
downloads also enter this state instead of leaving a disabled URL form.

- Final synthetic browser proof: **27.12 seconds, passed**. Initial/ready layouts
  at six sizes, actual motion, preview/arrow, complete readiness and all earlier
  failure/offline checks pass. Footer positions are identical at 1440×900,
  390×844 and 320×568 across queued/video/audio/merge/inspect/publish states;
  desktop sibling CTA baselines align and paired actions stay on one row.
- Known 3/8 and 6/8 byte counts produce 37% and 75%; unknown/preparation states
  have no aria-valuenow and animate the existing blue rounded track. No native
  progress or quality fieldset remains during active work. Synthetic failure,
  explicit retry, cancellation and restored quality controls pass. Two explicit
  imports, one cancel, one saved open, four lookups/metadata and three thumbnail
  requests; zero premature mutations, external calls or owned process survivors.
- **11 focused frontend unit tests passed**, frontend/root-test types, focused
  ESLint, Prettier and diff checks pass. Synthetic desktop resolution and visible
  transfer captures were inspected under ignored `.local-build/evidence`.
  An initial tablet footer wrapping regression was fixed and reverified.
- A final visual recheck found the desktop byte label partially clipped. Compact
  transfer spacing and shared track-width alignment fix it without moving card
  bounds or footers. The repeated proof now also requires the complete transfer
  body to fit without scrolling on desktop and the regular phone; the smallest
  phone retains reachable body overflow. Updated captures were inspected.
- AGENTS.md, source of truth and feature guide record the permanent design
  guard. No backend dispatch/provider/configuration behavior changed.

## Validate — read-only final pass

TL;DR: the ticket aimed for coherent preview/progress and anchored paired actions;
all are implemented with shared primitives and synthetic state/geometry evidence.
**Meets ticket; no actionable findings.** Coverage: shared structure, compact
native actions, fixed footer, landscape preview/overflow, replacement transfer,
truthful progress, failure/retry/cancel/restore, offline reuse and cleanup are
covered. Reviewed the CL-041 unstaged scope and new packet; preserved CL-028–040
work is excluded, index empty. No cross-app dependency, duplicated progress
implementation, unsafe cast, provider call or retained-media change introduced.
Owner aesthetic/physical-device/zoom acceptance remains unchecked. The actual
download failure remains the following packet; fake design evidence does not
prove a real transfer. No Git action, real AI, cloud or deployment occurred.

Final revalidation after the byte-label correction resolves that visual finding:
the synthetic all-stage proof and root-test types/lint/format pass again; desktop
and regular-phone transfer labels fit in full, with unchanged footer/card bounds.
No actionable findings remain in the settled CL-041 scope.
