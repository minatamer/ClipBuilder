import { analysisBundleSchema } from "@clipbuilder/contracts";

import { SAMPLE_ANALYSIS } from "./sampleAnalysis.js";

// Original precomputed text and uniform fixture timings, not recorded media.
const moments = [
  {
    title: "Start before you feel ready",
    rationale:
      "A practical question becomes a small, concrete first step with a complete takeaway.",
    turns: [
      "Why do we wait until we feel ready to make something? I used to think confidence came first. Then I watched a friend release a rough first episode with one microphone and a borrowed room. The recording was not perfect, but the question was good, and people stayed for the answer.",
      "The surprising part is that making it gave her the confidence she had been waiting for. She listened back, noticed one thing to improve, and recorded again. You do not need to believe you can make the whole series today. Make one useful conversation, learn from it, and let the next step become smaller.",
    ],
  },
  {
    title: "Make room for the work",
    rationale:
      "A familiar distraction problem resolves into a specific routine rather than a vague productivity promise.",
    turns: [
      "What if the problem is not a lack of ideas, but a lack of room for them? I would sit down to write, open my messages, check a headline, and return to the page twenty minutes later. Every tiny interruption seemed harmless. Together they used the time I had promised to the work.",
      "I stopped asking myself to become more disciplined and changed the room instead. The phone stayed outside, the document was already open, and I chose one question before I sat down. Nothing magical happened. I simply had fewer decisions to make. Protect a small block of attention before you ask it to produce something worthwhile.",
    ],
  },
  {
    title: "Finish something small",
    rationale:
      "The discussion gives a concrete example and ends on a self-contained distinction between finishing and perfection.",
    turns: [
      "How do you know when a project is finished? I kept adding one more section because stopping felt like admitting it could be better. A collaborator asked what the first version needed to do for one person. That question changed the size of the job. We cut the extras and kept the part that answered a real need.",
      "Finishing is not a claim that nothing can improve. It is a decision that this version can now be useful. Once someone tried it, their feedback was more valuable than another week of guessing alone. Choose a small promise, meet it clearly, and release that version. You can make the next one better with evidence instead of worry.",
    ],
  },
] as const;

let ordinal = 0;
const utterances: Array<{
  id: string;
  startWordId: string;
  endWordId: string;
  speakerId: string;
}> = [];
const groups = moments.map((moment, momentIndex) => {
  return moment.turns.flatMap((text, turnIndex) => {
    const tokens = text.split(/\s+/u);
    const start = momentIndex * 60_000 + turnIndex * 29_000;
    const words = tokens.map((token, index) => ({
      id: `w_${(++ordinal).toString().padStart(6, "0")}`,
      startMs: start + Math.floor((index * 29_000) / tokens.length),
      endMs: start + Math.floor(((index + 1) * 29_000) / tokens.length),
      text: token.replace(/[.,;?!]+$/u, ""),
      punctuatedText: token,
      speakerId: `spk_${turnIndex}`,
      confidence: null,
    }));
    const first = words[0];
    const last = words.at(-1);
    if (first === undefined || last === undefined)
      throw new Error("Empty sample turn.");
    utterances.push({
      id: `utt_${(utterances.length + 1).toString().padStart(6, "0")}`,
      startWordId: first.id,
      endWordId: last.id,
      speakerId: first.speakerId,
    });
    return words;
  });
});

export const CONVERSATION_SAMPLE = analysisBundleSchema.parse({
  ...SAMPLE_ANALYSIS,
  analysisId: `ana_${"c".repeat(22)}`,
  revision: `rev_${"c".repeat(22)}`,
  media: {
    ...SAMPLE_ANALYSIS.media,
    mediaId: `med_${"c".repeat(22)}`,
    durationMs: 180_000,
  },
  transcript: {
    ...SAMPLE_ANALYSIS.transcript,
    revision: `rev_${"c".repeat(22)}`,
    durationMs: 180_000,
    words: groups.flat(),
    utterances,
    providerMetadata: {
      provider: "fake",
      modelConfigId: "conversation-sample-v1",
      diarizationAvailable: true,
    },
  },
  candidates: groups.map((words, index) => {
    const moment = moments[index];
    const first = words[0];
    const last = words.at(-1);
    if (moment === undefined || first === undefined || last === undefined)
      throw new Error("Missing sample moment.");
    return {
      version: 1,
      id: `cand_${String(index + 4).repeat(22)}`,
      rank: index + 1,
      startWordId: first.id,
      endWordId: last.id,
      title: moment.title,
      hook: words
        .slice(0, 12)
        .map((word) => word.punctuatedText)
        .join(" "),
      rationale: moment.rationale,
      evidence: [
        {
          signal: "immediate-hook",
          wordIds: words.slice(0, 5).map((word) => word.id),
          note: "The opening asks a direct, self-contained question.",
        },
        {
          signal: "clear-payoff",
          wordIds: words.slice(-6).map((word) => word.id),
          note: "The closing completes the idea with a practical takeaway.",
        },
      ],
      caveats: [],
    };
  }),
});
