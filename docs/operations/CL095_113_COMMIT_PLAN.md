# CL-095–113 — approved whole-file visual commit plan

Owner authorization: 2026-10-28, explicitly prepare a file plan, stage and
commit all visual progress, with manual owner review later. Baseline: `b945401`.
One cohesive commit preserves overlapping film/layout/test/documentation edits;
no partial staging or source rewriting. No push, deployment, paid/provider/cloud
request, ignored configuration or retained-media change is authorized.

Subject: `CL-095-113: refine landing visuals and motion`

## Exact file allocation

| File | Whole-file change |
| --- | --- |
| `apps/frontend/README.md` | Current landing/Privacy implementation and focused verification guide. |
| `apps/frontend/public/platforms/clipster.svg` | Official platform SVG logo used by the three-platform market section. |
| `apps/frontend/public/platforms/picsart.svg` | Official platform SVG logo used by the three-platform market section. |
| `apps/frontend/public/platforms/whop.svg` | Official platform SVG logo used by the three-platform market section. |
| `apps/frontend/scripts/delivery-assets.json` | Integrity hashes for the three platform SVG assets. |
| `apps/frontend/src/app/campaign-wall.tsx` | Landing layout, compact navbar, market sheen, saved-time counters and matte Privacy behavior/styles. |
| `apps/frontend/src/app/hero-flow.module.css` | Delete redundant hero flow strip as requested. |
| `apps/frontend/src/app/hero-flow.tsx` | Delete redundant hero flow strip as requested. |
| `apps/frontend/src/app/landing-header.tsx` | Landing layout, compact navbar, market sheen, saved-time counters and matte Privacy behavior/styles. |
| `apps/frontend/src/app/page.module.css` | Landing layout, compact navbar, market sheen, saved-time counters and matte Privacy behavior/styles. |
| `apps/frontend/src/app/page.test.tsx` | Focused regression coverage for the implemented landing behavior. |
| `apps/frontend/src/app/page.tsx` | Landing layout, compact navbar, market sheen, saved-time counters and matte Privacy behavior/styles. |
| `apps/frontend/src/app/privacy-dialog.tsx` | Landing layout, compact navbar, market sheen, saved-time counters and matte Privacy behavior/styles. |
| `apps/frontend/src/app/process-narrative-timing.ts` | Landing layout, compact navbar, market sheen, saved-time counters and matte Privacy behavior/styles. |
| `apps/frontend/src/app/process-narrative.test.ts` | Focused regression coverage for the implemented landing behavior. |
| `apps/frontend/src/app/process-narrative.tsx` | Landing layout, compact navbar, market sheen, saved-time counters and matte Privacy behavior/styles. |
| `apps/frontend/src/app/time-savings.module.css` | Landing layout, compact navbar, market sheen, saved-time counters and matte Privacy behavior/styles. |
| `apps/frontend/src/app/time-savings.tsx` | Landing layout, compact navbar, market sheen, saved-time counters and matte Privacy behavior/styles. |
| `apps/frontend/src/features/product-film/film-camera.test.ts` | Focused regression coverage for the implemented landing behavior. |
| `apps/frontend/src/features/product-film/film-camera.ts` | Concise full-canvas film, shared-object transitions, cursor camera and correct first paint. |
| `apps/frontend/src/features/product-film/film-choreography.test.ts` | Focused regression coverage for the implemented landing behavior. |
| `apps/frontend/src/features/product-film/film-choreography.ts` | Concise full-canvas film, shared-object transitions, cursor camera and correct first paint. |
| `apps/frontend/src/features/product-film/film-identity.tsx` | Concise full-canvas film, shared-object transitions, cursor camera and correct first paint. |
| `apps/frontend/src/features/product-film/film-timeline.ts` | Concise full-canvas film, shared-object transitions, cursor camera and correct first paint. |
| `apps/frontend/src/features/product-film/illustrated-conversation.tsx` | Concise full-canvas film, shared-object transitions, cursor camera and correct first paint. |
| `apps/frontend/src/features/product-film/product-film-hero.module.css` | Concise full-canvas film, shared-object transitions, cursor camera and correct first paint. |
| `apps/frontend/src/features/product-film/product-film-hero.tsx` | Concise full-canvas film, shared-object transitions, cursor camera and correct first paint. |
| `apps/frontend/src/features/product-film/product-film-player.tsx` | Concise full-canvas film, shared-object transitions, cursor camera and correct first paint. |
| `apps/frontend/src/features/product-film/product-film-poster.tsx` | Concise full-canvas film, shared-object transitions, cursor camera and correct first paint. |
| `apps/frontend/src/features/product-film/product-film.tsx` | Concise full-canvas film, shared-object transitions, cursor camera and correct first paint. |
| `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` | Owning landing decisions, file allocation and completed verification index. |
| `docs/operations/CL095_113_COMMIT_PLAN.md` | Exact whole-file allocation and owner Git authorization. |
| `docs/tickets/CL-095-concise-contextual-landing-film.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-096-taller-hero-without-redundant-flow.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-097-animated-compact-landing-navbar.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-098-faster-process-visual-and-text-entry.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-099-fill-landing-film-and-track-actions.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-100-swap-privacy-dialog-surfaces.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-101-compact-market-and-animated-time-example.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-102-smooth-purposeful-film-tracking.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-103-correct-time-example-and-enrich-market.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-104-non-navigating-market-cards.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-105-remove-time-card-footnote.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-106-content-led-film-transitions.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-107-integrated-full-canvas-film.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-108-correct-film-first-paint.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-109-roomier-responsive-market-cards.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-110-visible-time-animation-and-larger-clock.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-111-matte-two-point-privacy-dialog.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-112-once-only-market-shine.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/CL-113-synchronized-saved-minutes-headline.md` | Ticket scope, implementation and local execute/validate evidence; owner acceptance remains open. |
| `docs/tickets/README.md` | Owning landing decisions, file allocation and completed verification index. |
| `test/local-film-initial.proof.ts` | Guarded fake/no-key browser regression and responsive visual verification. |
| `test/local-film.proof.ts` | Guarded fake/no-key browser regression and responsive visual verification. |
| `test/local-landing.proof.ts` | Guarded fake/no-key browser regression and responsive visual verification. |
| `test/local-market.proof.ts` | Guarded fake/no-key browser regression and responsive visual verification. |
| `test/local-privacy.proof.ts` | Guarded fake/no-key browser regression and responsive visual verification. |

## Verification and handoff

Ticket packets record the actual focused unit, type, lint, format and guarded
browser checks, including their limitations. Refresh the combined affected
landing unit checks and staged whitespace/allocation checks before committing.
Only source-controlled synthetic illustrations/captures and public logo assets
belong here; local screenshots, traces, runtime logs and configuration stay out
of Git. Personal visual, rights, physical-device, real-AI, hosted and release
acceptance remain owner-only and unverified. Fake/no-key checks prove the local
presentation, not provider quality. Preserve the healthy running app.

Fresh combined affected landing unit pass: 4 files, 23 tests passed (1.52s).

Earlier packet statements that nothing was committed describe their original
handoffs. This later owner authorization supersedes those statements only for
this exact local Git action. Report the resulting hash and status in chat.
