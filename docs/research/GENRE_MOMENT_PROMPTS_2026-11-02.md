# Genre cues for ClipBuilder moment discovery — CL-193

Research date: 2026-11-02. Baseline: `ddc644b`. Research only; no application,
prompt, model, inference, download, configuration or selector change.

## Recommendation

Keep General and the production prompt unchanged. Public tools document useful
ways to describe a desired moment, but the reviewed sources do not establish
that a genre block beats ClipBuilder's current policy. Most advice duplicates
our context, opening, payoff and evidence rules. Two small candidates deserve a
future controlled comparison: a complete question/answer or example for
podcasts, and premise-before-punchline timing for comedy. Gaming needs a
separate capability decision before promising visual highlight discovery.

The three categories below are a practical research sample with visible demand,
not a measured global top three. “Podcast” is a format, “comedy” an editorial
style and “gaming” a subject. They overlap: a gaming interview can be both a
podcast and entertainment. A future option should indicate the owner's desired
moment type, rather than classify people or force every clip into one genre.

## Demand evidence and its limits

| Category                       | Dated primary evidence                                                                                                                                                                                       | What this supports                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Podcasts/interviews            | YouTube reported more than one billion monthly viewers of podcast content on 2025-02-26. The public Content Rewards catalog on 2026-11-02 listed Double Coverage Podcast and The Iced Coffee Hour campaigns. | Broad audience scale plus observed campaign demand. Monthly viewers are not clip purchases or a campaign-market share.    |
| Entertainment/comedy/reactions | The same 2026-11-02 catalog showed an Entertainment label for the Jason Pool campaign and a Streamer feature for LACY.                                                                                       | Relevant entertainment/streamer demand. The listing does not measure comedy separately or establish a rank.               |
| Gaming commentary              | The publisher's 2025 YouTube Gaming report reports 8.8 billion hours watched. The public Huss Valley Fortnite campaign requested short videos demonstrating map mechanics.                                   | Gaming audience scale and a concrete campaign use case; gameplay promotion differs from selecting a conversation excerpt. |

Sources:
[YouTube, dated announcement](https://blog.youtube/news-and-events/1-billion-monthly-podcast-users/),
[Content Rewards public catalog, snapshot accessed 2026-11-02](https://contentrewards.com/c/discover),
[Hatchet's public 2025 report summary](https://hatchet.gg/resources/guides/2025-youtube-gaming-live-streaming-trends/),
[Fortnite campaign's public brief](https://b4e0vdqv6zgqeqj4pfgm.apps.whop.com/c/campaigns/1eb7b942-eeaf-4c83-b238-c9d6bd02829f).

The catalog is a changing, selected storefront with overlapping labels, not a
complete dataset of funded campaigns, approvals, views or earnings by genre. No
census, normalized counts or payout ranking was available from these pages. No
campaign was joined, and locked requirements/reference media were not read.
Audience metrics measure different periods and units; comparing their raw
numbers would not rank these categories. Public campaign presence is evidence of
demand, not a recommendation to spend money or a prediction of returns.

## Actual public prompts and selection rules

**OpusClip's prompt manual** is an official, undated usage guide, accessed
2026-11-02. Actual examples include “Show me moments with strong opinions or
words” and “Find all the laughing scenes.” It recommends clear subjects, actions
and intent; it separates moment requests from editing, effects and clip-length
controls. These are public user prompts, not the vendor's hidden system prompt
or a comparative evaluation.
[OpusClip manual](https://help.opus.pro/docs/article/clip-anything-prompt-manual).

**Podcasts:** Vizard's article, updated 2026-10-10, supplies a prompt beginning
“Create ONE [LinkedIn] video clip from this podcast interview.” Its editorial
request is a single complete teaching idea with a named topic and duration.
However, its demonstrated workflow joins separated passages, re-transcribes the
rough cut and uses camera-cut evidence. Those steps conflict with ClipBuilder's
contiguous, word-referenced discovery and no-extra-call scope. Its worked output
also falls below its requested sixty-second floor. Treat the article as a vendor
walkthrough, not proof that its prompt improves our task.
[Vizard walkthrough](https://agent.vizard.ai/how-to/pull-one-complete-teaching-moment-out-of-a-podcast.html).

**Comedy:** Clippers' editorial guide, dated 2026-06-23, describes preserving
the necessary setup, the pause before the punchline and its immediate reaction.
It also warns that a caption can spoil the reveal. This is specific editorial
advice from a clipping product's own site, which identifies itself as coming
soon; its practitioner authority and performance claims are unverified. It is a
useful hypothesis, not established empirical evidence.
[Clippers guide](https://clipperslab.com/blog/clipping-comedy).

**Gaming:** Eklipse's official explanation, modified 2026-05-26, describes
candidate scoring using game events, sound, action density and continuity,
followed by screen context and game-genre routing. Its important editorial idea
is to preserve the engagement's setup and outcome rather than cut a fixed window
around a trigger. It does not publish a portable system prompt. Claimed quality
improvements are vendor claims without a controlled comparison against
ClipBuilder. Its visual/game/audio signals are absent from transcript-only
moment selection.
[Eklipse engine explanation](https://blog.eklipse.gg/streaming-tips/how-gameplay-intelligence-works-2.html).

I did not find a publicly evidenced universal genre system prompt that can be
copied in with a demonstrated quality gain. This conclusion describes the
reviewed sources; it does not assert that no such prompt exists elsewhere.
Generic virality promises, SEO advice and isolated success stories were not
accepted as measurements. Private communities and paid courses were unnecessary.

## Comparison with the actual baseline

Inspected at `ddc644b`:
[general selection policy](../../apps/backend/src/analysis/analysis.prompt.ts),
[local count/exclusion policy](../../apps/backend/local/selection-policy.ts),
[Codex selection adapter](../../apps/backend/local/codex-ai.ts),
[local analysis](../../apps/backend/local/analysis.ts), and
[long-source analysis](../../apps/backend/local/long-analysis.ts).

General already asks for an understandable opening, complete payoff, concrete
claims/questions/examples/disagreements/jokes, necessary qualifications and
negation, and natural speech boundaries. Candidates use supplied stable word
IDs, contiguous ranges and evidence references; no new words or inferred visual
observations are allowed. Local policy preserves manual exclusions, requested
duration/count and Find all coverage. Codex discovery receives words and
reserved cuts; visual camera planning happens later for selected clips. Source
text is untrusted data, not instructions. Current acceptance remains advisory
for editorial quality; genre preferences must not become a rejection/retry gate.

| Public rule/cue                                                      | Baseline comparison                                                                                       | Disposition                                                                                            |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Strong opinion, interesting question, memorable opening              | Already explicit in General.                                                                              | Duplicate; no extra block needed.                                                                      |
| One coherent answer or teaching idea with its example                | Context/payoff already required; question-to-answer pairing and example completion are less explicit.     | Small optional podcast hypothesis. Do not force question openings on every clip.                       |
| Retain the joke's premise and timing; avoid an early spoiler         | Jokes/context/natural boundaries exist; protection of a reveal and an intentional pause is less explicit. | Most specific comedy hypothesis. No invented laughter, reaction or new title-generation behavior.      |
| Preserve the full engagement around a game trigger                   | General already requires context/payoff; gameplay semantics need evidence discovery does not receive.     | Spoken stakes/decision/outcome can be tested; unseen kills, wins or facial sarcasm cannot be inferred. |
| Stitch distant teaching beats or compile highlights                  | Contradicts contiguous cuts and changes meaning/timing risks.                                             | Do not adopt.                                                                                          |
| Find laughter, facial reactions, kill-feed events or audience spikes | These are multimodal signals, not reliable transcript facts.                                              | Capability mismatch; a prompt cannot supply missing observations.                                      |
| Vendor virality/engagement or tone-frequency claims                  | No authorized controlled result for our pipeline. Frequency does not establish causation.                 | Unsupported improvement claim; no automatic score threshold or retries.                                |

## Candidate additive blocks — proposals only

These are new research hypotheses written for this repository, not copied vendor
system prompts. They would be appended after the fixed policy as owner-selected
preferences. They must not override any binding source, safety, duration, count,
exclusion or output rule. General stays the default. No selector or block was
installed.

**Podcast/interview:**

> When available in one contiguous passage, favor a question or concrete claim
> followed by its substantive answer and a completed supporting example. Keep
> referents understandable. A strong statement-led story remains eligible;
> question/answer form is a preference, not a requirement.

**Entertainment/comedy:**

> Favor a source-supported premise, escalation and payoff in their original
> order. Preserve pauses needed for the joke rather than treating every gap as
> filler. Prefer a hook excerpt that creates curiosity without revealing the
> punchline. Do not infer facial expressions, laughter or irony absent from the
> supplied evidence.

**Gaming commentary:**

> For spoken gameplay narratives, favor clear stakes, a decision and the
> speaker's stated outcome within one passage. Treat a spoken claim as a claim,
> not visual verification. Do not infer an unseen play, kill, win, failure or
> reaction. Quiet gameplay may yield no transcript-supported moment.

The gaming block is primarily an evidence guard and ranking preference. It does
not make ClipBuilder a game-event detector. A future multimodal discovery design
would be a separate implementation decision with its own acquisition, spend,
context and verification work. No automatic zoom/effect generation follows from
any genre: CL-192 remains manual.

A future genre choice should apply only on an explicit Find moments action,
preserve the existing settings/footer slot, and include the chosen policy digest
in selection-receipt compatibility. Reuse the same ASR receipts; never silently
reinterpret a completed analysis, bypass a manual exclusion or restart
inference. This is design advice, not implementation authorization.

## Proposed follow-up comparison — not run

Start with twelve source-controlled fictional word/timestamp fixtures: four each
for podcasts, comedy and spoken gaming. For each category include one complete
moment, one context-dependent example/callback, one deceptive or no-qualifying
case, and one late-source/chunk-seam case. Include negation, off-topic speech,
manual exclusions and an instruction-like quotation. Keep silent visual action
out of the transcript; it is a deliberate negative case, not a hidden gold win.
Human-label acceptable contiguous ranges and necessary context before inference.
Each fixture supplies one bounded, already-transcribed discovery input;
late/seam cases include their clock/context data rather than initiating
multiwindow work.

Use paired baseline/one-genre-block requests with the same existing model,
reasoning, input words, windows, exclusions, duration, numeric count and
response budget. Do not change provider settings, re-transcribe or retry a poor
answer. One pair per fixture gives a maximum of 24 inference requests, with zero
calls in this ticket. Stop on a failed prerequisite/allowance rather than refill
or fallback. A future owner-authorized Codex experiment could use supplied
transcript fixtures without ASR; real-video evaluation additionally needs the
installed local speech assets and normal preparation gates.

Blindly rate context accuracy, opening clarity, payoff completion and variety
from 0–2 each, separately record missed labeled moments and spurious candidates,
and inspect range/exclusion/word-reference violations. Report the paired scores
and examples rather than an invented virality score. Diversity/quality critique
remains advisory and must not hide usable model output or trigger another call.
Reserve one of the four fixtures per category as held-out before considering
adoption; its results must not be used to revise the block. Twelve samples
cannot establish general live engagement gains.

Mocked responses can check future routing/receipt plumbing without keys but
cannot compare prompt quality. No mock preset tests were added because there is
no implemented preset feature. Real Codex inference would consume ChatGPT
allowance and require its existing login/live prerequisites. Gemini would need
its key/live approvals and is excluded from this series. Public-source reading
is complete without either provider; no model or speech runtime was invoked.
