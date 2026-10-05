import { createHash } from "node:crypto";
import {
  selectedAssemblyPlanSchema,
  compositionManifestV2Schema,
  FIXED_COMPOSITION_POLICY,
  type CompositionManifestV2,
  type GroundedAnalysisResult,
  type SelectedAssemblyResult,
} from "@clipbuilder/contracts";
import {
  compileSpeakerFocus,
  type SpeakerPlanContext,
} from "./speaker-focus.js";
import { compileFixedCaptions } from "./fixed-captions.js";
import type {
  AnalysisDiagnostics,
  AnalysisPhase,
} from "../analysis/analysis.diagnostics.js";

const unsafeCardText =
  /https?:|www\.|javascript:|[<>`\\{}]|\b(?:ignore (?:all |previous )?instructions|system prompt|execute code|in the style of|logo|likeness|diagnose)\b/iu;
export function manifestDigest(manifest: CompositionManifestV2) {
  // Parse before hashing: the shared schema fixes field order and rejects unknown keys.
  return createHash("sha256")
    .update(JSON.stringify(compositionManifestV2Schema.parse(manifest)))
    .digest("hex");
}
export function compileFixedAssembly(
  raw: unknown,
  source: GroundedAnalysisResult,
  context: SpeakerPlanContext,
  captions = compileFixedCaptions(context),
  diagnostics?: AnalysisDiagnostics,
) {
  const check = <T>(phase: AnalysisPhase, work: () => T): T =>
    diagnostics ? diagnostics.check(phase, work) : work();
  const plan = check("assembly_plan_parse", () =>
    selectedAssemblyPlanSchema.parse(raw),
  );
  diagnostics?.privateStageOutput("assembly_plan_parsed", plan);
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
  const cards = check("assembly_cards", () =>
    plan.cards.map((card) => {
      const anchor = context.words[indexes.get(card.anchorWordId) ?? -1];
      if (!anchor) throw new Error("invalid-card-evidence");
      const title = span(card.title, 7),
        lines = card.lines.map((line) => span(line, 14));
      const text = [title, ...lines].map((words) =>
        words.map((w) => w.punctuatedText).join(" "),
      );
      if (text.some((value) => unsafeCardText.test(value)))
        throw new Error("unsafe-card-evidence");
      cardEvidence.push({
        anchorWordId: anchor.id,
        titleWordIds: title.map((w) => w.id),
        lineWordIds: lines.map((words) => words.map((w) => w.id)),
      });
      return {
        startMs: anchor.startMs - context.range.startMs,
        endMs: anchor.startMs - context.range.startMs + card.durationMs,
        kind: card.kind,
        title: text[0]!,
        lines: text.slice(1),
      };
    }),
  );
  diagnostics?.assembly("assembly_cards", { cards: cards.length });
  diagnostics?.privateStageOutput("assembly_cards_compiled", {
    cards,
    cardEvidence,
  });
  const focus = check("assembly_focus", () =>
    compileSpeakerFocus(plan.speaker, context),
  );
  diagnostics?.assembly("assembly_focus", { focusSegments: focus.length });
  diagnostics?.privateStageOutput("assembly_focus_compiled", focus);
  const media = source.analysis.media;
  const { manifest, manifestHash } = check("assembly_manifest", () => {
    const manifest = compositionManifestV2Schema.parse({
      version: 2,
      source: {
        fingerprint: source.binding.fingerprint,
        durationMs: media.durationMs,
        width: media.rotationDegrees % 180 ? media.height : media.width,
        height: media.rotationDegrees % 180 ? media.width : media.height,
      },
      range: context.range,
      output: { width: 1080, height: 1920, fps: 30 },
      focus,
      captions,
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
