# CL-193 — Research genre-specific moment prompts without changing behavior

Status: Research authorized and queued, 2026-11-02. The owner requests AFK
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
