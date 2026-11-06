# CL-225 — Keep caption controls discoverable below the list

Status: Complete locally, 2026-11-06. Dependency: CL-224 complete in local commits
through 7fa4915; initial worktree/index clean.

## Owner request and scope

Keep the new caption-row design, but limit the caption list height so owners can
see that the editing controls continue below it. Use a compact, independently
scrollable caption collection without removing rows, changing selection or
altering independent Hook/main content. Other collections retain their layout.

The source of truth's unified collections, shared design, responsive layout and
persistent footer rules apply. Allocate only the owning frontend timeline markup
and CSS, the narrow source-of-truth addition, this ticket and the ticket index.
No contracts, composition, worker, provider or saved clip changes are needed.

## Acceptance and verification

- Caption rows retain their design and complete chronological contents, with a
  compact height bounded by the viewport and an internal vertical scrollbar.
  Short collections shrink naturally; the controls below remain discoverable.
- Check the actual editor with generated media at desktop, 390px and 320px:
  long/short lists, scroll to and select later captions, keyboard reachability,
  visible following controls, footer visibility and no horizontal overflow.
- Run scoped formatting/lint and review the settled diff against this packet.
  Use browser evidence for this reversible layout change; no new static-style
  unit test, native render or backend rebuild is required.

All verification uses synthetic/fake/no-key/paid-off fixtures. Prepared clips
need no keys or regeneration for this layout. Real AI retains the configured
provider/runtime/live/approval prerequisites; no real AI quality claim is made.
Preserve the running app, saved media/edits/exports and ignored configuration.
No Git mutation, provider call, source acquisition, cloud action or deployment.

## Evidence

The timeline exposes its existing item kind as a data attribute. Only caption
collections use `max-height: min(9rem, 24svh)` and a stable scrollbar gutter;
existing internal scrolling and row/selection behavior stay shared. At the
default font size this shows roughly two to three rows, with a partially visible
next row and the caption controls immediately below. No rows are truncated from
the collection and no new event, timer, dependency or saved field is introduced.

- Codex in-app browser, generated actual editor: six chronological Hook/main
  caption rows remain selectable. The list measures 144px at 1440x900 and
  390x844, and 136.31px at 320x568. Its content is taller than its viewport,
  confirming internal scrolling. Selecting the last caption scrolls it fully
  into view; Shift+Tab and Enter select the preceding caption correctly.
- The caption controls below are visible alongside the list, and the persistent
  footer stays visible after scrolling to the editor at both phone sizes. No
  horizontal overflow. Desktop and 320px screenshots inspected and retained
  outside Git as cl225-caption-list-desktop.jpg and cl225-caption-list-phone.jpg.
- A separate one-caption actual ClipEditor component shrinks below the cap at
  320px and 1440px, with equal scroll/client heights and no list overflow. This
  component check is distinct from the full-shell long-list checks. Initial
  disposable short-fixture setup errors were corrected; no production change
  was needed for them and no owner media was used.
- Scoped Prettier passes for all five changed files; ESLint passes for the
  changed timeline component; `git diff --check` passes. No new unit/static
  style test or repeated native/backend build for this presentation-only change.
- Fixture servers/owned descendants and all three temporary ports are absent.
  The abandoned first generated bundle was removed only after exact clip-ID,
  file inventory and absolute-path checks; later fixture bundles used their
  existing cleanup. Final fixture counters are zero edits and zero unexpected
  requests. The browser viewport override is reset and the active fixture tab
  closed; the first browser error tab could not be explicitly closed because
  its data-URL error page is blocked by browser policy, and is left unmarked
  for normal end-of-turn temporary-tab cleanup.
- Normal backend health and /start remain 200. Owner source, saved clips,
  exports, configuration and provider gates were not accessed or changed.

## Settled validation

Read-only review of the complete unstaged diff against this packet: **Meets
ticket; no actionable findings.** Covered: caption-only bounded height,
complete/independent rows, scrolling/keyboard selection, short-list shrinkage,
responsive discovery/footer/overflow, narrow documentation and cleanup. Shared
contracts, composition, worker, clock mapping and AI boundaries are unchanged.
No secrets, media content, new unsafe casts, debug code or cleanup resources
enter the source changes. No implementation deviation; the one-row fixture
uses the component directly rather than the unrelated restore flow.

Physical-device and owner personal review remain unperformed; real-provider and
hosted/release acceptance are outside this UI-only packet. Changes remain
unstaged/uncommitted, with no provider call, cloud action or deployment.
