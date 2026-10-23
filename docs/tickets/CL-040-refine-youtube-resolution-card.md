# CL-040 — Refine the YouTube resolution card

Status: implemented and verified. Dependency: implemented CL-039.

Owner request 2026-10-23: show only English audio at 480p through 2K (1440p),
reduce duplicate options, align the native picker/arrow with the design system,
keep both responsive intake cards stable through state changes, and show a
small square thumbnail/title with scrolling overflow text for the selected video.

Keep one supported exact server choice per resolution, preserving video ranking
and preferring original/default English audio. Accept English regional tags;
exclude unknown/non-English audio and out-of-range saved/new variants. Remove
the unfiltered Best action and require an explicit eligible resolution. Do not
alter server quality admission, choose a hidden fallback or automatically download.

Reserve responsive card height across startup, URL, loading, resolution, errors
and download progress. Keep content/actions reachable at narrow widths/zoom.
Use the existing glass/control tokens and native select semantics with an inset
chevron. Show one selected-video preview in the available header space. Scroll
only overflowing titles, with normal motion under every preference (CL-039).

The owner's preview request authorizes a bounded title and thumbnail in the
ephemeral local UI only. Extend the existing projected metadata/contract with
optional display identity; no raw provider object, arbitrary URL, persistent
preview, logging or real-content fixture. Thumbnail bytes pass through the
protected same-origin local API from one fixed YouTube image host/path, with
deadline/byte/type bounds and cancellation. Missing previews degrade gracefully;
saved/offline reuse must not start metadata/image requests. Hosted/CSP gates stay.

Use synthetic unit/browser checks for filtering, exact import binding, stable
desktop/phone geometry, arrow, preview/overflow, failure/cancellation and offline
reuse. Run relevant types/lint/format, contracts build and final validate. Keep
normal services/unrelated apps and all saved media intact. Fake AI needs no keys;
real AI still needs normal Gemini keys/live flags/owner approvals. No real YouTube,
provider/cloud/paid call, ignored configuration read, Git mutation or deployment.

## Implementation and evidence

Frontend resolution projection now filters by admitted support, short-side tier
480–1440 and explicit English language tags (`en` and regional tags). It keeps
one ranked video choice per tier, preferring original/default English audio and
then admitted/better bitrate within that video. Saved entries use the same
eligibility rule, deduplicate by tier and replace duplicate downloadable tiers.
The picker labels are just resolution; it has an inert inset Lucide chevron,
shared glass/control styling and native focus/keyboard semantics. There is no
Best option; can-use/import resolve only a displayed eligible exact choice.

The grid reserves a viewport-responsive row height (desktop and phone rules)
across all states. Each card owns vertical overflow for longer progress/errors
or enlarged text, with a stable scrollbar gutter. Initializing no longer changes
the card/input mount, and resolution/download state cannot resize the sibling.

An optional strict preview contract carries bounded normalized title/canonical
identity from the existing yt-dlp metadata projection. It is held only in the
existing bounded in-memory offers/UI; saved master/draft formats are unchanged.
The acquisition port's thumbnail method reads one fixed JPEG path, limits bytes
and time, rejects redirects/non-JPEG content, cancels bodies, and drains scoped
requests on disconnect/shutdown. The authenticated local route requires a known
offer, returns no-store/nosniff image bytes and leaves browser CSP/egress policy
unchanged. No arbitrary URL or credential reaches the browser.

The card header shows a small square preview and full title text. A ResizeObserver
measures actual overflow and animates only overflowing text with an edge fade;
short titles stay static. The title remains available to assistive technology and
via tooltip. Image failure leaves a stable icon, with no automatic retry. Saved
offline opening does not request title/thumbnail metadata. Normal motion remains
active under both preference settings, as required by CL-039.

Checks actually produced:

- **86 focused unit tests passed** in seven files: eligibility, duplicate/rank/
  English-original selection, metadata/adapter, bounded image transfer, source
  lifecycle, capabilities and protected HTTP route. The route asserts zero
  acquisition/native/transcription/selection/plan/image dispatches for preview.
- Final synthetic intake proof passed in **29.79 seconds** (earlier settled
  layout/fallback pass: 20.18 seconds):
  pending/ready identity and geometry, concurrent full readiness, actual spinner
  motion, stable URL/loading/resolution/download/cancel/error bounds, exact
  resolution/import identity and Downloads destination, styled arrow, one image,
  overflowing title animation, missing-image fallback, no-English empty state,
  fitting static title and offline reuse without preview/metadata requests.
  Exact aggregate mock counts: four lookups, four metadata, three thumbnail
  requests (one deliberately fails), one import, one cancel and one saved open.
  An offered 2160p Best is deliberately outside the visible range and cannot
  enable Download. No automatic download; zero owned browser/process survivors.
  No external network.
- Synthetic captures at desktop/phone sizes under ignored `.local-build/evidence`
  were inspected; final 1440/390/320 resolution captures show the preview, styled
  select and stable cards. These contain synthetic content only.
- Frontend, root-test, local implementation and local contracts types passed.
  Focused ESLint passed after replacing control-character regexes with explicit
  bounded normalization/validation. Contracts build passed. Final frontend/local
  types, lint/format and the 12 source-lifecycle/API tests passed after the last
  cleanup change, including a synchronously failing preview port.
- Existing app `/start`, backend `/v1/health` and local capabilities all returned
  200 after hot reload. Capabilities remain `synthetic-ai`, cloud false. No app
  restart, config/environment-file read, retained-media operation or other-app
  operation occurred. Real YouTube/title/thumbnail acceptance and real AI quality
  remain owner-only and unverified; no paid/provider/cloud call was made.

Changed ownership: frontend acquisition panel, resolution projection/tests,
`youtube-preview.tsx` and local CSS; contracts acquisition preview; backend
metadata/adapter, acquisition port/coordinator/route, bounded thumbnail module
and focused unit/API tests; existing synthetic intake proof; frontend/backend
feature guides, source of truth, ticket/index. All changes remain unstaged.

## Validate — final read-only pass

TL;DR:

- Goal: a smaller English-only quality list, stable responsive cards, and an
  identifiable selected video in the existing design.
- Achieved: eligible exact qualities and saved reuse, inset native arrow,
  stable geometry, bounded preview and overflow-only title motion all verified.
- Unverified: owner aesthetic/physical-device/200% browser-zoom acceptance,
  actual YouTube preview retrieval and real AI quality. No live result is claimed.

**Verdict: Meets ticket. No actionable findings.** Scope: the CL-040 portions
of the current unstaged frontend/contract/backend/proof/doc changes and new
preview modules/tests. Read the complete packet and reviewed selected diffs plus
the owning route/coordinator/projection/lifecycle code. Preserved CL-028–CL-039
work is excluded; the index is empty and no commit range is selected.

Coverage: **Covered** — English regional tags, 480–1440 bounds and deduplication;
supported exact choice binding with no hidden Best fallback; saved/offline reuse;
native select/arrow design; responsive stable card geometry and reachable
overflow; bounded ephemeral preview identity and protected no-store image;
deadline/type/size/error/cancellation/shutdown cleanup; long/short title behavior;
permanent normal motion; fake/cloud separation and saved-media preservation.

Inspected evidence: 86 focused unit results plus final 12-test lifecycle/API
repeat, final browser proof and synthetic captures, four relevant type checks,
contracts build, focused lint/format and `git diff --check`. No full suite/build
or external/paid/media test ran. No duplicate cross-boundary schema, unsafe cast,
cross-app dependency, arbitrary URL, production debug path or retained scratch
was introduced. Owning docs explicitly record the requested display exception.
