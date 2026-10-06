import { createHash } from "node:crypto";
import { z } from "zod";
import {
  selectedAssemblyPlanSchema,
  contextualCardPlanSchema,
  ASSEMBLY_LIMITS,
  compositionManifestV3Schema,
  FIXED_COMPOSITION_POLICY,
  type CompositionManifestV3,
  type GroundedAnalysisResult,
  type SelectedAssemblyResult,
} from "@clipbuilder/contracts";
import {
  compileSpeakerFocus,
  provisionalOpeningFocus,
  type SpeakerPlanContext,
} from "./speaker-focus.js";
import { compileFixedCaptions } from "./fixed-captions.js";
import type {
  AnalysisDiagnostics,
  AnalysisPhase,
} from "../analysis/analysis.diagnostics.js";

const unsafeCardText =
  /https?:|www\.|javascript:|[<>`\\{}]|\b(?:ignore (?:all |previous )?instructions|system prompt|execute code|in the style of|logo|likeness|diagnose)\b/iu;
export function manifestDigest(manifest: CompositionManifestV3) {
  // Parse before hashing: the shared schema fixes field order and rejects unknown keys.
  return createHash("sha256")
    .update(JSON.stringify(compositionManifestV3Schema.parse(manifest)))
    .digest("hex");
}
export function compileFixedAssembly(
  raw: unknown,
  source: GroundedAnalysisResult,
  context: SpeakerPlanContext,
  captions?: CompositionManifestV3["captions"],
  diagnostics?: AnalysisDiagnostics,
) {
  const check = <T>(phase: AnalysisPhase, work: () => T): T =>
    diagnostics ? diagnostics.check(phase, work) : work();
  captions ??= compileFixedCaptions(context, (reason) =>
    diagnostics?.critique("assembly_captions", new Error(reason)),
  );
  const parsedPlan = check("assembly_plan_parse", () =>
    selectedAssemblyPlanSchema.safeParse(raw),
  );
  if (!parsedPlan.success)
    diagnostics?.critique("assembly_plan_parse", parsedPlan.error);
  const record = z.record(z.string(), z.unknown()).safeParse(raw);
  const plan = parsedPlan.success
    ? parsedPlan.data
    : {
        speaker: record.success ? record.data.speaker : undefined,
        cards:
          record.success && Array.isArray(record.data.cards)
            ? record.data.cards.slice(0, ASSEMBLY_LIMITS.maxVisualCues)
            : [],
      };
  diagnostics?.privateStageOutput("assembly_plan_parsed", plan);
  const media = source.analysis.media;
  const focusContext = {
    ...context,
    source: {
      width: media.rotationDegrees % 180 ? media.height : media.width,
      height: media.rotationDegrees % 180 ? media.width : media.height,
    },
  };
  let focus: CompositionManifestV3["focus"];
  try {
    focus = check("assembly_focus", () =>
      compileSpeakerFocus(plan.speaker, focusContext, (reason) =>
        diagnostics?.critique("assembly_focus", new Error(reason)),
      ),
    );
  } catch (error) {
    diagnostics?.critique("assembly_focus", error);
    focus = [provisionalOpeningFocus(focusContext)];
  }
  const base = {
    version: 3 as const,
    source: {
      fingerprint: source.binding.fingerprint,
      durationMs: media.durationMs,
      width: media.rotationDegrees % 180 ? media.height : media.width,
      height: media.rotationDegrees % 180 ? media.width : media.height,
    },
    range: context.range,
    output: { width: 1080 as const, height: 1920 as const, fps: 30 as const },
    focus,
    captions,
  };
  const indexes = new Map(context.words.map((w, i) => [w.id, i]));
  function span(
    value: { startWordId: string; endWordId: string },
    maxWords: number,
  ) {
    const first = indexes.get(value.startWordId),
      last = indexes.get(value.endWordId);
    if (
      first === undefined ||
      last === undefined ||
      last < first ||
      last - first + 1 > maxWords
    )
      throw new Error("invalid-card-evidence");
    return context.words.slice(first, last + 1);
  }
  const cardEvidence: SelectedAssemblyResult["cardEvidence"] = [];
  const cards: CompositionManifestV3["cards"] = [];
  function acceptCard(
    rawCard: unknown,
    origin: "planner" | "transcript-fallback",
  ) {
    try {
      const compiled = check("assembly_cards", () => {
        const card = contextualCardPlanSchema.parse(rawCard);
        const anchor = context.words[indexes.get(card.anchorWordId) ?? -1];
        if (!anchor) throw new Error("invalid-card-evidence");
        const title = span(card.title, 7),
          lines = card.lines.map((line) => span(line, 14));
        const text = [title, ...lines].map((words) =>
          words.map((w) => w.punctuatedText).join(" "),
        );
        if (text.some((value) => unsafeCardText.test(value)))
          throw new Error("unsafe-card-evidence");
        const startMs = anchor.startMs - context.range.startMs;
        const endMs = startMs + card.durationMs;
        let previous = -1;
        for (const words of [title, ...lines]) {
          const first = indexes.get(words[0]!.id)!;
          if (
            first <= previous ||
            words.some(
              (word) =>
                word.startMs - context.range.startMs < startMs ||
                word.endMs - context.range.startMs > endMs,
            )
          )
            throw new Error("invalid-card-evidence");
          previous = first + words.length - 1;
        }
        const evidence = {
          origin,
          anchorWordId: anchor.id,
          titleWordIds: title.map((w) => w.id),
          lineWordIds: lines.map((words) => words.map((w) => w.id)),
        };
        const compiledCard = {
          origin,
          startMs,
          endMs,
          kind: card.kind,
          title: text[0]!,
          lines: text.slice(1),
        };
        compositionManifestV3Schema.parse({
          ...base,
          cards: [...cards, compiledCard],
        });
        return { card: compiledCard, evidence };
      });
      cards.push(compiled.card);
      cardEvidence.push(compiled.evidence);
    } catch (error) {
      diagnostics?.critique("assembly_cards", error);
    }
  }
  for (const card of plan.cards) acceptCard(card, "planner");
  diagnostics?.assembly("assembly_cards", {
    cards: cards.length,
    plannedCards: plan.cards.length,
    fallbackCards: 0,
  });
  diagnostics?.privateStageOutput("assembly_cards_compiled", {
    cards,
    cardEvidence,
  });
  diagnostics?.assembly("assembly_focus", {
    focusSegments: focus.length,
    geometryTransitions: focus.filter((item, index) => {
      const previous = focus[index - 1];
      return (
        previous &&
        JSON.stringify("box" in previous ? previous.box : null) !==
          JSON.stringify("box" in item ? item.box : null)
      );
    }).length,
    provisionalSegments: focus.filter(
      (item) =>
        item.mode === "held" &&
        ["visible-face", "opening-default"].includes(item.reason),
    ).length,
    matchedSegments: focus.filter((item) => item.mode === "speaker").length,
    heldSegments: focus.filter((item) => item.mode === "held").length,
    wideSegments: focus.filter((item) => item.mode === "wide").length,
    holdExpiredSegments: focus.filter(
      (item) => item.mode === "wide" && item.reason === "hold-expired",
    ).length,
    shotResetSegments: focus.filter(
      (item) => item.mode === "wide" && item.reason === "shot-reset",
    ).length,
  });
  diagnostics?.privateStageOutput("assembly_focus_compiled", focus);
  const { manifest, manifestHash } = check("assembly_manifest", () => {
    const manifest = compositionManifestV3Schema.parse({
      ...base,
      cards,
    });
    return { manifest, manifestHash: manifestDigest(manifest) };
  });
  return {
    policy: FIXED_COMPOSITION_POLICY.version,
    words: context.words,
    cardEvidence,
    manifest,
    manifestHash,
  };
}
