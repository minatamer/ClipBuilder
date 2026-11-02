# CL-193 — Research genre-specific moment prompts without changing behavior

Status: Research completed and validated, 2026-11-02. The owner requests AFK
execute/validate loops and local ticket-prefixed commits. Research only: no
production prompt, preset UI or model change is authorized.

## Owner question

Do established AI-clipping prompts or editorial rules for popular genres offer
useful improvements over our successful general moment-selection prompt?
Investigate three high-demand clipping genres and recommend whether any small
optional additions are worthwhile. Keeping the present prompt is a valid result.

Entertainment/comedy, podcasts/interviews and gaming are the owner's candidate
examples, not an established top-three ranking. Format and subject categories
overlap; the research must explain its taxonomy and selection evidence.

## Proposed research, when requested

1. Identify three useful high-demand clipping categories using dated evidence
   from clipping/creator-reward campaigns, published platform data and credible
   practitioner sources. Separate popularity on a platform from demand in
   clipping/reward campaigns. Do not invent a precise global top three when
   public data cannot establish one; label the evidence and uncertainty.
2. Find actual publicly documented prompts or concrete moment-selection rules
   from practitioners/tools. Capture source links, date, genre, short compliant
   excerpts or paraphrases, and the evidence behind claimed improvements.
   Marketing claims, anecdotal success and measured comparisons are distinct. Do
   not treat scraped private communities or paid courses as required access.
3. Compare each useful rule with our actual baseline in
   `apps/backend/src/analysis/analysis.prompt.ts` and the local Codex/provider
   selection policy. Existing strengths include source-word references,
   self-contained openings/payoffs, context/negation, duration preferences,
   exclusions, evidence and transcript instruction isolation. Report overlap
   rather than presenting existing behavior as a new discovery.
4. For genuinely missing genre cues, propose a small optional additive block,
   not a replacement system prompt. Describe exactly what it changes and why,
   with no production edit. Preserve output contracts, stable word IDs,
   source-grounded selection, advisory quality handling, long-source coverage,
   provider isolation and manual exclusions. Transcript-only discovery cannot
   infer an unseen gaming win or sarcastic facial expression from video.
5. Assess a possible future genre selector only as a recommendation. General
   remains the default; do not build the selector or change current results.
   Genres need not map to rigid stereotypes or a universal viral template.
6. Design a small follow-up comparison using synthetic/source-controlled samples
   and a clear rubric for context, hook, payoff, variety and missed moments.
   Replaying mocked output tests plumbing, not prompt quality. Real inference
   comparison is separate and must not be run as part of this research ticket.

## Deliverable and completion criteria

If research is authorized, write a cited report in `docs/research/` when its
first real report exists. Include the three selected categories, strength of
demand evidence, actual prompt/rule sources, baseline comparison, candidate
additive blocks and a keep/change recommendation. A concise comparison table
should distinguish useful new rules from duplicates, unsupported claims and
mismatches. Do not promise better results without an authorized comparative
evaluation.

The report may recommend no implementation. Any approved prompt or genre UI
change requires its own dependency-ready implementation packet. Until then, the
current system prompt and model settings remain untouched.

## Capability and authorization boundary

No research browsing or paid model evaluation was performed when this packet was
created. Future public-source reading needs no provider key. Fake/no-key checks
can test hypothetical preset routing but cannot establish better moment quality,
so do not add such tests without an implemented feature. Real Codex evaluation
consumes ChatGPT allowance and requires local speech assets/login/ gates; Gemini
requires its key/live approvals and is excluded from the current owner test
preference. No scraping tools/weights/media downloads, configuration, app
launch, cloud, deployment or Git mutation is authorized by this proposal.

## Research result and validation — 2026-11-02

[Report](../research/GENRE_MOMENT_PROMPTS_2026-11-02.md) compares podcasts,
entertainment/comedy and gaming using public campaign examples, dated audience
figures, official tool prompts and editorial rules. They are a supported sample,
not an asserted global top-three ranking. Categories overlap and audience scale
is not campaign-market share. Public locked campaign requirements were not read.

Recommendation: keep General and current production behavior. Optional future
podcast/comedy cue comparisons are plausible; gaming cannot gain unseen visual
signals from a transcript prompt. Vendor walkthroughs/claims and editorial
advice are separated from measured comparative evidence. No reviewed source
proves an improvement over our actual baseline. Three short additive proposals
and a bounded 24-request synthetic-transcript comparison are documented only; no
inference, selector, production prompt or model setting changed.

Read-only validate compared the report against this whole ticket and baseline
`ddc644b`: no actionable findings after tightening the ranking, source-strength,
multimodal and contiguous-cut limitations. Replaced an unverified canonical
campaign route with the exact public URL retrieved; clarified that the
evaluation uses one bounded input per fixture and includes its held-out cases in
the 24-request ceiling. Checked citation destinations, source dates, short-quote
limits, unsupported gain claims, baseline coverage, future receipt compatibility
and evaluation/spend boundaries. All links are public primary
tool/platform/publisher pages. Publication dates are explicit where supplied;
undated guides are labeled with the access date. Final local Markdown
formatting/link-target checks and whitespace check pass. No code tests are
needed for a documentation-only research result.

Fake/no-key mode remains the verified application mechanics from preceding
packets; mocked output cannot establish better prompt quality. Real inference
comparison remains unrun and would require owner authorization and Codex
allowance/login/live gates (no Gemini fallback). Fixed transcript fixtures do
not require ASR; real-video evaluation additionally needs local speech assets.
No media/model downloads, API/provider calls, app startup, configuration,
cloud/deployment or push occurred.

Whole-file commit allocation:

- `docs/research/GENRE_MOMENT_PROMPTS_2026-11-02.md`
- `docs/tickets/CL-193-genre-moment-prompt-research.md`
- `docs/tickets/README.md`
- `docs/operations/CL184_193_EXECUTION.md`
