# CL-091–094 — approved whole-file commit plan

Owner approval: 2026-10-27, “make a file level commit plan … stage and commit.”
Baseline: `30880fc`. The 35 pending files all belong to these four completed
follow-ups. This plan is file 36. Stage complete files/deletions in one cohesive
commit because typography, intake CSS, proof files and owning documentation
carry related changes across packets; no partial staging or source rewriting.

Commit subject: `CL-091-094: refine text defaults and hosted intake`

## Exact file allocation

| File | Whole-file change |
| --- | --- |
| `apps/backend/local/clip-batch.ts` | New clips start without independent Text in every mode; retain captions/focus/pictures and preview/retry behavior. |
| `apps/backend/local/clip-batch.test.ts` | No default Text in fake/provider-shaped preparation and legacy-title retry; caption outline/fade/stage/call-count coverage. |
| `apps/backend/local/clip-title.ts` | Delete retired automatic-title fallback/normalizer. |
| `apps/backend/local/clip-title.test.ts` | Delete retired title-only tests; replacement behavior covered in batch/provider cases. |
| `apps/backend/local/fake-clips.ts` | Remove fake automatic-title accessor. |
| `apps/backend/local/provider-ai.ts` | Remove automatic-title prompt/schema/accessor/cache; retain usable focus/pictures and one planning request. |
| `apps/backend/local/provider-ai.test.ts` | Ignore unsolicited/malformed titles without rejecting usable results or adding requests. |
| `apps/backend/local/server.ts` | Remove retired title port from local/hosted adapter types. |
| `apps/frontend/src/app/start/page.tsx` | Retire old sample query switch; shared local/hosted workflow owns /start. |
| `apps/frontend/src/app/start/page.test.tsx` | Existing local/hosted start-page boundary coverage. |
| `apps/frontend/src/features/local-editing/experience.tsx` | Remove obsolete Use demo sample CTA/imports. |
| `apps/frontend/src/features/local-editing/style.css` | Remove dead CTA-only CSS; fluid upload-only width/height while retaining local paired cards. |
| `apps/frontend/src/features/sample/sample.experience.tsx` | Delete obsolete screen wrapper with no remaining production consumer. |
| `apps/frontend/src/features/local-editing/clip-editor.tsx` | Expose Sliding highlight caption animation label. |
| `apps/frontend/src/features/local-editing/typography-fields.tsx` | Share effective TikTok outline fallback with renderer. |
| `apps/frontend/src/features/local-editing/text-layers.test.tsx` | Shared Solid block preset and TikTok outline 12/custom-width compatibility. |
| `packages/contracts/local/text-style.ts` | Solid block preset; TikTok outline 12; one effective-outline helper. |
| `packages/contracts/local/editor.ts` | Caption Solid block/Sliding highlight contract options. |
| `packages/contracts/local/clips.ts` | Explain retained optional title field as legacy partial-draft decoding only. |
| `packages/composition/local/text-paint.ts` | Shared effective outline and new panel shadow behavior. |
| `packages/composition/local/text-layer.tsx` | One continuous multiline panel, fitted to the positioned Text box. |
| `packages/composition/local/styled-caption.tsx` | Shared solid panel and measured sliding-line integration; preserve other modes. |
| `packages/composition/local/sliding-caption-line.tsx` | New bounded logical DOM measurement and media-clock highlight rectangle. |
| `packages/composition/local/sliding-highlight.ts` | New pure timing/position/width interpolation. |
| `packages/composition/local/sliding-highlight.test.ts` | Timing, silence, line/reset/overlap/short-cue and raster-cache regressions. |
| `test/local-design.proof.ts` | Remove obsolete sample-CTA expectation, retaining local responsive/lifecycle coverage. |
| `test/local-text.proof.ts` | Manual Text default, save/reopen, solid/alpha panels and actual native sliding-motion pixels. |
| `test/owner-hosted-editor.proof.ts` | No default title and six responsive hosted-intake captures; preserve complete synthetic flow. |
| `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` | Current owner decisions for all four packets and CL-087 title reversal. |
| `docs/tickets/README.md` | Ticket status/evidence and link to this approved local commit plan. |
| `docs/tickets/CL-087-ai-titles-defaults-and-preparation-stages.md` | Mark automatic-title behavior superseded; retain history. |
| `docs/tickets/CL-091-retire-demo-sample-entry.md` | Removal scope/evidence and subsequent commit approval. |
| `docs/tickets/CL-092-solid-text-block-and-sliding-captions.md` | Typography/motion plan/evidence and subsequent commit approval. |
| `docs/tickets/CL-093-manual-text-only-and-tiktok-outline.md` | Manual-only Text/outline default plan/evidence and subsequent commit approval. |
| `docs/tickets/CL-094-fill-hosted-upload-space.md` | Fluid intake/capture plan/evidence and subsequent commit approval. |
| `docs/operations/CL091_094_COMMIT_PLAN.md` | This approval, complete allocation, verification and exclusions. |

## Verification already completed

- CL-091: two start-page cases, existing local designed-intake proof, affected
  lint/format/frontend/test types and current/legacy-query GETs.
- CL-092/093: latest local suite 63 files / 614 cases; current-source Text
  browser/native and hosted-shaped proof files passed (four cases). Synthetic
  preparation covers both AI modes, legacy retries and exact injected calls.
  Types, lint/format and read-only execute/validate passes are recorded in tickets.
- CL-094: existing complete hosted-shaped browser/native proof passed in 37.21s
  with six inspected desktop/laptop/tablet/phone captures. Proof lint, format,
  test types (after the type-only tuple annotation) and read-only review passed.
- Contracts and normal native worker were rebuilt/refreshed after CL-093.
  Last verified app: fake / synthetic-ai, cloud false, all live features false;
  3000/4000/4200 healthy. CL-094 is frontend-only CSS and preserved these processes.

Before commit, reconcile the staged file list to this allocation, review the
staged diff/whitespace and confirm no excluded content. Do not rerun unrelated
suites or infer personal visual/live/hosted release acceptance from fixtures.

## Exclusions and authorization boundary

No ignored `.env*`, credentials, owner media, captions/transcripts/provider
payloads, diagnostics/logs, runtime ownership records, build caches or evidence
PNGs are staged. Screenshots remain ignored local artifacts. All processing
evidence is synthetic/fake/no-key/paid-off; real Gemini quality still requires
configured keys/live approvals and owner testing. No provider/cloud work,
deployment, push or retained/saved-media deletion is authorized.

Earlier ticket statements about unstaged work/no commit describe their original
implementation handoffs. This explicit later approval permits only the local
staging/commit listed here. Preserve the healthy app. Report the resulting hash
and final Git status in chat; do not add the commit's own hash to itself.
