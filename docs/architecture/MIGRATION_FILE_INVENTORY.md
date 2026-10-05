# Full repository migration file inventory

CL-007 owner amendment (2026-10-05): the source path now owns
`apps/backend/src/analysis/transcribe.normalization.ts` and
`transcribed-analysis.provider.ts`, a rewritten candidate-only prompt/schema,
renderer `NodeMediaPipeline.audio`, the audio artifact/profile contract and the
synthetic `apps/renderer/feasibility/audio-transcription.ts` harness. Remove the
combined source wire/prompt/default generation branch and old isolation CLI.
Preserve Files cleanup, safe diagnostic parsing and the owner-private complete
capture modules; add source/selection/selected-assembly capture coverage. The
selected-video path and old intent deletion compatibility remain. See the
[current packet](../tickets/CL-007-deliver-live-analysis-vertical-slice.md#owner-transcribe-and-text-only-selection-migration--2026-10-05).


Status: Local code through CL-014 and CL-015 release preparation is audited and validated with no actionable local findings. All five settled root gates and 665 synthetic tests in 66 files pass. The local frontend artifact inventory passes, but strict release verification rejects this Windows build's 26 external package links; an acceptable target-platform immutable build remains unverified. The release ledger keeps manual/media/device/film/provider/cloud/rights/spend and complete CL-015 deployment acceptance unchecked. No deployment or public paid enablement is authorized. The owner authorized sequential execute/validate/fix/document loops and ticket-prefixed commits through CL-014 and locally buildable CL-015. Missing keys/live/cloud evidence does not block this local sequence. Provider/paid/cloud/deployment, native full-fixture, pixel/audio/human quality, font/license/rights and real device/public-release gates remain deferred.

Read-only Git state, repository file inventory, provider/model/cloud/privacy references, package/config/composition/admission/contracts/worker/workflow/test ownership were inspected. This is a structural correction map, not an independent code audit. No secret/private media files were opened. Owner AGENTS.md and pre-existing CL-015 changes are preserved.

Current authority: [Gemini/Cloud Run plan](GEMINI_REMOTION_MIGRATION.md). Exactly one canonical [CL-007 packet](../tickets/CL-007-deliver-live-analysis-vertical-slice.md) exists; keep its path, supersede old mechanisms rather than create a duplicate.

## Approved module responsibility map (planned names; see CL-006/CL-007 for actual modules)

| Proposed path | Responsibility | Dependency |
| --- | --- | --- |
| apps/renderer/package.json, Dockerfile, src/server.ts, src/app.ts | Isolated authenticated Node/Remotion/Chromium/FFmpeg service, PORT/health/cancel/one-slot composition | CL-006, contracts |
| apps/renderer/src/media/{inspection,proxy,range,render,output-validation,process-cleanup}.ts | Exact media bounds/clocks/physical cuts/fixed encode/scratch and process-tree cleanup | CL-006/008/011 |
| apps/renderer/src/expiry/{cleanup-intent,sweep,deletion-verification}.ts | Bounded independent GCS expiry/retries/unfinished-upload cancellation; no general job queue | CL-005/012 |
| packages/composition/src/{clip.composition,caption,contextual-card,focus-layout}.tsx | Fixed shared React layout, no provider/Node/env dependency; browser preview and Node render | CL-006/009/010 |
| apps/backend/src/media/{temporary-storage,upload-admission,renderer.port,renderer.cloudrun,artifact-stream}.ts | Private GCS generation-bound ports, authenticated remote invocation and bounded range delivery | CL-005/006/011 |
| apps/backend/src/analysis/{analysis.port,analysis.usecase,gemini.adapter,analysis.receipt}.ts | Google files/generate/delete, strict words/candidates/turns/provenance and exact budget | CL-007 |
| apps/backend/src/assembly/{focus-policy,manifest-validation,assembly.usecase}.ts | Selected-range Google plan validation, anonymous association, deterministic wide/smoothing, freeze | CL-008/009 |
| apps/frontend/src/features/{source-transfer,cloud-workflow,clip-preview,clip-download}/... | Owning modules only as first real implementation arrives; reuse existing feature state/UI, no duplicate journey | CL-005/007/010/011 |

Names are module responsibilities to refine in the owning packet, not permission to scaffold empty feature trees. Keep app boundaries; shared composition requires the explicit reviewed extension described in the plan.

## Existing text/config/source inventory

Excluded from this text map: ignored dependencies/builds/private media/secrets, binary design references/fonts/icons. Preserve those assets and their rights; no new generated/private content belongs in Git.

| Exact repository path | Planned treatment | Owner packet |
| --- | --- | --- |
| `.env.example` | Frozen partial Google example; after approval add blank server-only storage/renderer identities, separate enablement/gates; never fill secrets/IDs. | CL-006/012 |
| `AGENTS.md` | Preserve owner edits; after approval amend only explicit renderer/composition directions and cloud lifecycle operating rules. | CL-006/012 |
| `README.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `apps/backend/README.md` | Current cloud plan and approval gates added; preserve local control API commands and distinguish interrupted code from future renderer integration. | Documentation now |
| `apps/backend/package.json` | Reconcile pinned Node renderer/shared composition workspaces and remove web-renderer-only deps after approval; preserve package/security policy. | CL-006 |
| `apps/backend/src/admission/admission.composition.ts` | Retain admission/origin/error protections; add scoped upload/Google/render/stream/cancel orchestration, no heavy renderer in API. | CL-005/007/011/012 |
| `apps/backend/src/admission/processing.admission.test.ts` | Retain admission/origin/error protections; add scoped upload/Google/render/stream/cancel orchestration, no heavy renderer in API. | CL-005/007/011/012 |
| `apps/backend/src/admission/processing.admission.ts` | Retain admission/origin/error protections; add scoped upload/Google/render/stream/cancel orchestration, no heavy renderer in API. | CL-005/007/011/012 |
| `apps/backend/src/admission/processing.grant.ts` | Retain admission/origin/error protections; add scoped upload/Google/render/stream/cancel orchestration, no heavy renderer in API. | CL-005/007/011/012 |
| `apps/backend/src/app.test.ts` | Freeze partial Google changes; later explicit control/storage/renderer composition, independent AI/compute gates and bounded local/cloud settings. | CL-006/007/011 |
| `apps/backend/src/app.ts` | Freeze partial Google changes; later explicit control/storage/renderer composition, independent AI/compute gates and bounded local/cloud settings. | CL-006/007/011 |
| `apps/backend/src/composition.ts` | Freeze partial Google changes; later explicit control/storage/renderer composition, independent AI/compute gates and bounded local/cloud settings. | CL-006/007/011 |
| `apps/backend/src/config/env.schema.ts` | Freeze partial Google changes; later explicit control/storage/renderer composition, independent AI/compute gates and bounded local/cloud settings. | CL-006/007/011 |
| `apps/backend/src/config/loadConfig.test.ts` | Freeze partial Google changes; later explicit control/storage/renderer composition, independent AI/compute gates and bounded local/cloud settings. | CL-006/007/011 |
| `apps/backend/src/config/loadConfig.ts` | Freeze partial Google changes; later explicit control/storage/renderer composition, independent AI/compute gates and bounded local/cloud settings. | CL-006/007/011 |
| `apps/backend/src/demo/README.md` | Synthetic fixture-only AI/cloud ports and exact counts; no durable real media/provider content. | CL-007–012 |
| `apps/backend/src/demo/conversationAssembly.ts` | Synthetic fixture-only AI/cloud ports and exact counts; no durable real media/provider content. | CL-007–012 |
| `apps/backend/src/demo/conversationSample.ts` | Synthetic fixture-only AI/cloud ports and exact counts; no durable real media/provider content. | CL-007–012 |
| `apps/backend/src/demo/developmentPreview.test.ts` | Synthetic fixture-only AI/cloud ports and exact counts; no durable real media/provider content. | CL-007–012 |
| `apps/backend/src/demo/fakeClock.ts` | Synthetic fixture-only AI/cloud ports and exact counts; no durable real media/provider content. | CL-007–012 |
| `apps/backend/src/demo/fakeFixtures.test.ts` | Synthetic fixture-only AI/cloud ports and exact counts; no durable real media/provider content. | CL-007–012 |
| `apps/backend/src/demo/fakeFixtures.ts` | Synthetic fixture-only AI/cloud ports and exact counts; no durable real media/provider content. | CL-007–012 |
| `apps/backend/src/demo/sampleAnalysis.test.ts` | Synthetic fixture-only AI/cloud ports and exact counts; no durable real media/provider content. | CL-007–012 |
| `apps/backend/src/demo/sampleAnalysis.ts` | Synthetic fixture-only AI/cloud ports and exact counts; no durable real media/provider content. | CL-007–012 |
| `apps/backend/src/demo/sampleFakes.ts` | Synthetic fixture-only AI/cloud ports and exact counts; no durable real media/provider content. | CL-007–012 |
| `apps/backend/src/demo/sampleManifest.ts` | Synthetic fixture-only AI/cloud ports and exact counts; no durable real media/provider content. | CL-007–012 |
| `apps/backend/src/demo/sampleSession.test.ts` | Synthetic fixture-only AI/cloud ports and exact counts; no durable real media/provider content. | CL-007–012 |
| `apps/backend/src/demo/sampleSession.ts` | Synthetic fixture-only AI/cloud ports and exact counts; no durable real media/provider content. | CL-007–012 |
| `apps/backend/src/http/errorMapper.ts` | Retain admission/origin/error protections; add scoped upload/Google/render/stream/cancel orchestration, no heavy renderer in API. | CL-005/007/011/012 |
| `apps/backend/src/http/response.ts` | Retain admission/origin/error protections; add scoped upload/Google/render/stream/cancel orchestration, no heavy renderer in API. | CL-005/007/011/012 |
| `apps/backend/src/http/routes/admission.route.ts` | Retain admission/origin/error protections; add scoped upload/Google/render/stream/cancel orchestration, no heavy renderer in API. | CL-005/007/011/012 |
| `apps/backend/src/http/routes/health.route.ts` | Retain admission/origin/error protections; add scoped upload/Google/render/stream/cancel orchestration, no heavy renderer in API. | CL-005/007/011/012 |
| `apps/backend/src/http/routes/sample.route.ts` | Retain admission/origin/error protections; add scoped upload/Google/render/stream/cancel orchestration, no heavy renderer in API. | CL-005/007/011/012 |
| `apps/backend/src/server.ts` | Freeze partial Google changes; later explicit control/storage/renderer composition, independent AI/compute gates and bounded local/cloud settings. | CL-006/007/011 |
| `apps/backend/test/environment.fixture.ts` | Retain unless owning packet reference audit shows a required cloud migration change. | Owning packet |
| `apps/backend/tsconfig.json` | Reconcile pinned Node renderer/shared composition workspaces and remove web-renderer-only deps after approval; preserve package/security policy. | CL-006 |
| `apps/backend/vitest.config.ts` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `apps/frontend/AGENTS.md` | Retain applicable framework/operating instructions. | All |
| `apps/frontend/CLAUDE.md` | Retain applicable framework/operating instructions. | All |
| `apps/frontend/README.md` | Current cloud preview/upload/download responsibilities added; retire final browser export claims while preserving local commands and measured foundations. | Documentation now |
| `apps/frontend/feasibility/browser-composition/index.html` | Freeze abandoned browser-render spike; remove after approval; never deploy. | CL-006/015 |
| `apps/frontend/feasibility/browser-composition/main.tsx` | Freeze abandoned browser-render spike; remove after approval; never deploy. | CL-006/015 |
| `apps/frontend/feasibility/browser-composition/server.mjs` | Freeze abandoned browser-render spike; remove after approval; never deploy. | CL-006/015 |
| `apps/frontend/feasibility/browser-media/README.md` | Retain useful synthetic clock/offset/cleanup proof; remove obsolete final-browser-export assumptions; exclude from deployment. | CL-005/006/015 |
| `apps/frontend/feasibility/browser-media/index.html` | Retain useful synthetic clock/offset/cleanup proof; remove obsolete final-browser-export assumptions; exclude from deployment. | CL-005/006/015 |
| `apps/frontend/feasibility/browser-media/main.mjs` | Retain useful synthetic clock/offset/cleanup proof; remove obsolete final-browser-export assumptions; exclude from deployment. | CL-005/006/015 |
| `apps/frontend/feasibility/browser-media/server.mjs` | Retain useful synthetic clock/offset/cleanup proof; remove obsolete final-browser-export assumptions; exclude from deployment. | CL-005/006/015 |
| `apps/frontend/feasibility/browser-media/server.test.mjs` | Retain useful synthetic clock/offset/cleanup proof; remove obsolete final-browser-export assumptions; exclude from deployment. | CL-005/006/015 |
| `apps/frontend/feasibility/browser-media/sync-access.mjs` | Retain useful synthetic clock/offset/cleanup proof; remove obsolete final-browser-export assumptions; exclude from deployment. | CL-005/006/015 |
| `apps/frontend/feasibility/browser-media/sync-access.test.mjs` | Retain useful synthetic clock/offset/cleanup proof; remove obsolete final-browser-export assumptions; exclude from deployment. | CL-005/006/015 |
| `apps/frontend/feasibility/browser-media/worker.mjs` | Retain useful synthetic clock/offset/cleanup proof; remove obsolete final-browser-export assumptions; exclude from deployment. | CL-005/006/015 |
| `apps/frontend/next-env.d.ts` | Retain unless owning packet reference audit shows a required cloud migration change. | Owning packet |
| `apps/frontend/next.config.ts` | Retain unless owning packet reference audit shows a required cloud migration change. | Owning packet |
| `apps/frontend/package.json` | Reconcile pinned Node renderer/shared composition workspaces and remove web-renderer-only deps after approval; preserve package/security policy. | CL-006 |
| `apps/frontend/src/app/anchor-scroll.test.ts` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/anchor-scroll.ts` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/api/sample/[...path]/route.test.ts` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/api/sample/[...path]/route.ts` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/error.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/hero-headline.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/layout.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/not-found.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/page.module.css` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/page.test.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/page.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/privacy-dialog.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/process-narrative-timing.ts` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/process-narrative.test.ts` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/process-narrative.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/robots.ts` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/smooth-scroll-link.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/app/start/page.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/features/media/audio.extraction.test.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/audio.extraction.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/audio.profile.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/audio.protocol.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/audio.samples.test.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/audio.samples.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/browser.workspace.test.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/browser.workspace.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/media.errors.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/opfs.access.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/opfs.copy.test.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/opfs.copy.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/source.client.test.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/source.client.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/source.protocol.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/source.worker.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/workspace.journal.test.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/workspace.journal.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/workspace.lock.test.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/workspace.lock.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/workspace.quota.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/workspace.restore.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/media/workspace.schema.ts` | Retain bounds/clocks/cleanup and useful intake tests; adapt cloud upload and remote preview/output ownership; remove unneeded browser encode requirement. | CL-005/006/011 |
| `apps/frontend/src/features/render/clip.composition.tsx` | Freeze interrupted experiment; extract fixed React layout into shared composition; replace web export with private Node renderer port after approval. | CL-006/009/011 |
| `apps/frontend/src/features/render/clip.export.test.ts` | Freeze interrupted experiment; extract fixed React layout into shared composition; replace web export with private Node renderer port after approval. | CL-006/009/011 |
| `apps/frontend/src/features/render/clip.export.ts` | Freeze interrupted experiment; extract fixed React layout into shared composition; replace web export with private Node renderer port after approval. | CL-006/009/011 |
| `apps/frontend/src/features/sample/agentic-notes.tsx` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/candidate.evidence.ts` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/candidate.review.tsx` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/clip.review.tsx` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/development.input.ts` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/development.progress.test.tsx` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/development.progress.ts` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/lifecycle-recovery.test.ts` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/native-range-playback.test.ts` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/native-range-playback.ts` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/portrait-player.tsx` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/processing-status.tsx` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/result-preview.tsx` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/review-revision.test.tsx` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/review-transcript.tsx` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/sample.api.ts` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/sample.experience.tsx` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/sample.module.css` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/sample.test.tsx` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/source-preview.tsx` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/use-moment-layout.ts` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/sample/use-range-playback.ts` | Retain established one-candidate read-only flow; adapt Google result/proxy/preview/Confirm/download and honest cloud privacy states. | CL-007–011/013 |
| `apps/frontend/src/features/session/session.effects.ts` | Adapt source object generation, operation/manifest fencing, expiry/receipt and uncertain cloud recovery; preserve exact call allowances. | CL-005/007–012 |
| `apps/frontend/src/features/session/session.persistence.test.ts` | Adapt source object generation, operation/manifest fencing, expiry/receipt and uncertain cloud recovery; preserve exact call allowances. | CL-005/007–012 |
| `apps/frontend/src/features/session/session.persistence.ts` | Adapt source object generation, operation/manifest fencing, expiry/receipt and uncertain cloud recovery; preserve exact call allowances. | CL-005/007–012 |
| `apps/frontend/src/features/session/session.provider.tsx` | Adapt source object generation, operation/manifest fencing, expiry/receipt and uncertain cloud recovery; preserve exact call allowances. | CL-005/007–012 |
| `apps/frontend/src/features/session/session.reconciliation.ts` | Adapt source object generation, operation/manifest fencing, expiry/receipt and uncertain cloud recovery; preserve exact call allowances. | CL-005/007–012 |
| `apps/frontend/src/features/session/session.reducer.test.ts` | Adapt source object generation, operation/manifest fencing, expiry/receipt and uncertain cloud recovery; preserve exact call allowances. | CL-005/007–012 |
| `apps/frontend/src/features/session/session.reducer.ts` | Adapt source object generation, operation/manifest fencing, expiry/receipt and uncertain cloud recovery; preserve exact call allowances. | CL-005/007–012 |
| `apps/frontend/src/features/session/session.regressions.test.ts` | Adapt source object generation, operation/manifest fencing, expiry/receipt and uncertain cloud recovery; preserve exact call allowances. | CL-005/007–012 |
| `apps/frontend/src/features/session/session.selectors.ts` | Adapt source object generation, operation/manifest fencing, expiry/receipt and uncertain cloud recovery; preserve exact call allowances. | CL-005/007–012 |
| `apps/frontend/src/features/session/session.test-fixtures.ts` | Adapt source object generation, operation/manifest fencing, expiry/receipt and uncertain cloud recovery; preserve exact call allowances. | CL-005/007–012 |
| `apps/frontend/src/features/session/session.types.ts` | Adapt source object generation, operation/manifest fencing, expiry/receipt and uncertain cloud recovery; preserve exact call allowances. | CL-005/007–012 |
| `apps/frontend/src/shared/ui/button.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/shared/ui/progress.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/shared/ui/workflow-frame.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/shared/ui/workflow.module.css` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/shared/ui/workflow.test.tsx` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/src/styles/tokens.css` | Retain product shell/design/accessibility; update privacy/cloud claims where needed and test supported playback/upload/download. | CL-010/013 |
| `apps/frontend/tsconfig.json` | Reconcile pinned Node renderer/shared composition workspaces and remove web-renderer-only deps after approval; preserve package/security policy. | CL-006 |
| `apps/frontend/vitest.config.ts` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/README.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/architecture/BROWSER_OWNED_MEDIA.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/architecture/DOCUMENTATION_REVIEW.md` | Exact documentation handoff paths, checks and unresolved approval decisions. | Documentation now |
| `docs/architecture/GEMINI_REMOTION_MIGRATION.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/architecture/MIGRATION_FILE_INVENTORY.md` | Keep the complete text/config/source correction map and proposed modules consistent with the approved packet scope. | Documentation now |
| `docs/assets/clipbuilder-overview.png` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/operations/CLOUD_RUN_RENDERER_SETUP.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/operations/COST_MODEL.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/operations/MEDIA_RIGHTS_RECORD.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/operations/PROVIDER_SETUP.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/operations/THIRD_PARTY_SOFTWARE.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/prompts/AI_CLIPPING_SOURCE_OF_TRUTH_PROMPT.txt` | Historical/research context; banner current cloud authority where contradicted. | Documentation now |
| `docs/reference/PORTFOLIO_DEMO_BUILD_PLAYBOOK.md` | Historical/research context; banner current cloud authority where contradicted. | Documentation now |
| `docs/research/ACTIVE_SPEAKER_OPTIONS.md` | Historical/research context; banner current cloud authority where contradicted. | Documentation now |
| `docs/research/AI_CLIPPING_DEMO_BRIEF.md` | Historical/research context; banner current cloud authority where contradicted. | Documentation now |
| `docs/research/ARCHIVED_GEMINI_BROWSER_PLAN.md` | Historical/research context; banner current cloud authority where contradicted. | Documentation now |
| `docs/tickets/CL-001-initialize-workspace-and-contracts.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-002-create-and-approve-visual-reference.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-003-build-canonical-session-and-sample-foundation.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-004-deliver-sample-candidate-review.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-004A-prepare-third-party-provider-readiness.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-005-implement-secure-upload-and-storage.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-006-build-media-job-and-speaker-feasibility.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-008-productionize-active-speaker-assembly.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-009-build-contextual-visual-assembly.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-010-deliver-automatic-clip-review.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-011-render-and-deliver-final-clip.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-012-harden-security-privacy-abuse-and-spend.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-013-complete-accessibility-responsive-and-performance-pass.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-014-audit-release-candidate.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/CL-015-deploy-validate-measure-and-rollback.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `docs/tickets/README.md` | Reconcile current cloud/Google/privacy/approval requirements; preserve historical evidence. | Documentation now |
| `eslint.config.mjs` | Reconcile pinned Node renderer/shared composition workspaces and remove web-renderer-only deps after approval; preserve package/security policy. | CL-006 |
| `package.json` | Reconcile pinned Node renderer/shared composition workspaces and remove web-renderer-only deps after approval; preserve package/security policy. | CL-006 |
| `packages/contracts/README.md` | Retain unless owning packet reference audit shows a required cloud migration change. | Owning packet |
| `packages/contracts/package.json` | Reconcile pinned Node renderer/shared composition workspaces and remove web-renderer-only deps after approval; preserve package/security policy. | CL-006 |
| `packages/contracts/src/admission.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/api.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/assembly.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/boundary-primitives.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/candidate.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/composition-manifest.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/constants.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/contract-boundaries.test.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/contracts.test.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/edit-plan.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/edit-plan.test.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/errors.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/ids.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/index.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/media.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/operation.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/text.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/transcript.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/src/visual-plan.schema.ts` | Retain browser-neutral schemas; reconcile Google provenance/versioned manifest/source-generation/output/cleanup descriptors and strict rejection tests. | CL-005–012 |
| `packages/contracts/tsconfig.json` | Reconcile pinned Node renderer/shared composition workspaces and remove web-renderer-only deps after approval; preserve package/security policy. | CL-006 |
| `packages/contracts/vitest.config.ts` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `pnpm-lock.yaml` | Reconcile pinned Node renderer/shared composition workspaces and remove web-renderer-only deps after approval; preserve package/security policy. | CL-006 |
| `pnpm-workspace.yaml` | Reconcile pinned Node renderer/shared composition workspaces and remove web-renderer-only deps after approval; preserve package/security policy. | CL-006 |
| `prettier.config.mjs` | Retain unless owning packet reference audit shows a required cloud migration change. | Owning packet |
| `test/boundaries.test.ts` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `test/fixture-catalog.test.ts` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `test/fixtures/contracts-node-globals.negative.ts` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `test/no-network.setup.ts` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `test/pre-import-guard.fixture.ts` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `test/pre-import-guard.test.ts` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `tests/fixtures/README.md` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `tests/fixtures/active-speaker/README.md` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `tests/fixtures/assemblies/README.md` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `tests/fixtures/candidates/adversarial.json` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `tests/fixtures/media/README.md` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `tests/fixtures/prompt-injection/cases.json` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `tests/fixtures/provider-errors/cases.json` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `tests/fixtures/visual-plans/README.md` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |
| `tsconfig.base.json` | Reconcile pinned Node renderer/shared composition workspaces and remove web-renderer-only deps after approval; preserve package/security policy. | CL-006 |
| `tsconfig.tests.json` | Reconcile pinned Node renderer/shared composition workspaces and remove web-renderer-only deps after approval; preserve package/security policy. | CL-006 |
| `vitest.config.ts` | Keep import-time fake/off network guards; injected cloud/telemetry/lifecycle tests, no ADC/env/paid requests. | Each packet |

## Tracked hidden/CI configuration supplement

| Exact repository path | Planned treatment | Owner packet |
| --- | --- | --- |
| `.editorconfig` | Retain operating/CI/package policy; reconcile only in its approved migration packet; no secret reads. | Owning packet |
| `.gitattributes` | Retain operating/CI/package policy; reconcile only in its approved migration packet; no secret reads. | Owning packet |
| `.github/workflows/quality.yml` | Retain operating/CI/package policy; reconcile only in its approved migration packet; no secret reads. | Owning packet |
| `.gitignore` | Retain operating/CI/package policy; reconcile only in its approved migration packet; no secret reads. | Owning packet |
| `.prettierignore` | Retain operating/CI/package policy; reconcile only in its approved migration packet; no secret reads. | Owning packet |

## Historical interrupted implementation snapshot

At the original scout, Google/Remotion browser packages and partial config/schema
work were frozen pending documentation approval. The owner then explicitly
approved local corrections. The actual [CL-006 checkpoint](../tickets/CL-006-build-media-job-and-speaker-feasibility.md)
records the implemented renderer/shared composition, typed private client,
generation-bound storage/expiry foundation, retired browser exporter, exact
five root gates and synthetic Node proof. The tables above are the original
responsibility/treatment map, not a current pause instruction or a claim that
every later proposed module exists. Source/audio work and historical numeric
evidence are preserved. Linux/cloud/live Gemini/product integration remains
pending; nothing is staged or committed.
