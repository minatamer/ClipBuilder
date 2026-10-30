# CL-165 — creative source-grounded opening title hooks

Status: implemented and locally validated after CL-164. Plan filed before code.
Owner requests
at least five new short-form title-hook styles, selecting the strongest fit
for the clip rather than copying a dull transcript excerpt.

## Diagnosis, research and choice

Current `PLANNED_TEXT_POLICY` permits only source word references and forbids a
separate title field. The decoder concatenates those words, so it cannot write
POV or a creative curiosity headline unless the exact wording was spoken.
Allow a bounded newly authored title with source-word evidence in the same
planning response. Preserve legacy reference-only decoding and one opening
layer at zero, wording-based 2–8-second reading time, manual text freedom.

Use nine candidate approaches internally: POV/relatable scenario, curiosity
gap, surprising reveal, contrarian myth-bust, pointed question, challenge,
pain-to-payoff, before/after transformation, and specific useful promise/list.
Choose one strongest accurate fit; do not rotate randomly, manufacture quotes,
numbers, outcomes or shock, add unrelated hype, promise virality or output all
variants. Energetic direct address is allowed when its payoff fits the source.
No extra inference/call or visible “viral score”.

Primary research consulted 2026-10-30:

- [TikTok Creative Codes](https://ads.tiktok.com/business/en-US/creative-codes)
  recommends suspense, surprise/emotion and coherent hook/body structure.
- [TikTok hook-pattern guidance](https://ads.tiktok.com/business/creativecenter/quicktok/online/creative_tips_travel/pc/en)
  discusses questions, captivating statements, numbered useful ideas, benefits
  and POV examples. Our nine-style taxonomy is an implementation synthesis,
  not a platform endorsement or guarantee of performance.
- [TikTok engagement guide](https://ads.tiktok.com/business/en/blog/tiktok-short-video-best-practice)
  includes relatable statements, questions and bold curiosity openings.

## Whole-file allocation and validation

Contracts `text-layers.ts` and schema tests; backend `planned-text.ts` and tests,
provider/Codex prompt-schema tests; existing synthetic native/browser proof for
authored text, proper reading time and legacy/save/restore; this ticket, index,
source of truth and local Codex docs. Add plain bounded title/style fields with
source evidence; tolerate old optional/reference-only results. No image/text
model call, invented source quotation, private transcript fixture or key read.
Validate native text/clock parity and malformed/legacy payloads in fake/no-key/
paid-off/network-blocked tests, then scoped static/read-only review. Final normal
backend/worker refresh through verified ownership. No paid call, real AI/search
test, configuration, cloud, deployment or Git mutation. Live editorial taste
and performance remain owner review.

## Evidence

- Shared authored-title wire schema supports the nine approaches, one title up
  to 80 characters with evidence/style in the existing planning response. Gemini
  and Codex use the same policy; no extra inference/image calls. Source language,
  accurate payoff and no fabricated quotes/numbers/outcomes are prompt rules;
  the system makes no empirical virality claim.
- Decoder uses authored text instead of concatenating transcript words, still
  accepts old reference-only plans and first usable legacy candidate, anchors
  at zero and computes 2–8s reading time from actual copy. Unknown/missing
  evidence records advisory critique without hiding usable authored output.
  Malformed/overlong optional copy can fall back to a usable old word excerpt.
  Manual/saved text stays unrestricted and editable.
- Five focused fake suites total 92 cases pass: planned text, Gemini/Codex
  adapter/schema and clip batch. Updated one obsolete prompt-phrase assertion;
  all new authored/legacy copy, nine styles, evidence critique and exact call
  counts pass. Contract/local/root-test/frontend TypeScript and scoped ESLint
  pass. Read-only validation: meets local ticket, no actionable findings;
  earlier pending work excluded.
- Isolated CLI fake-schema proof (two cases) and current-source synthetic
  browser/native/export/save/restart recovery proof pass together (88.89s).
  Authored synthetic POV text displays at frame 0–83 and survives native export/
  restored edits; alternate image search still recovers its first miss. Exact
  fake counts remain four inference calls/eight media jobs/two image-port mocks.
  Inspected ignored `cl165-editor-1440.png` and `-320.png`; proof also checks
  820/390, keyboard section navigation and footer/reconnection states.
- No real AI/image search/media, ignored configuration, provider spend, cloud,
  deployment or Git mutation. Public title-pattern research is separate from
  fake app validation. Actual generated copy/visual taste, devices and hosted
  release remain owner review. Nothing staged or committed.

## Final normal app refresh for CL-163–165

Verified old supervisor/tree identities and inactive processing, stopped the
nine owned backend processes, and confirmed no survivors/orphans/listeners on
4000/4200 before replacement. Frontend PID 13720 on 3000 preserved. Rebuilt
contracts and current worker/overlay through normal hidden `dev:backend`.
New supervisor 6960, API 24552 on 4000, worker 21600 on 4200. Health, `/start`
and `/api/sample/config` GETs return 200; selected Codex setup reports ready.
No processing/credential/config/provider call. App left running for fresh owner
review. Recovery/saved/source media and all earlier pending work preserved.

Runtime record and separate content-safe logs outside Git:

- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl165-app-77b36feb098c41f4be525129a7b1855b\backend.runtime.json`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl165-app-77b36feb098c41f4be525129a7b1855b\backend.stdout.log`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl165-app-77b36feb098c41f4be525129a7b1855b\backend.stderr.log`

Deviation: none. No staging, commit, push, deployment or paid testing.
