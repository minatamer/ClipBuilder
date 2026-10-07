import { TranscribedAnalysisProvider } from "./transcribed-analysis.provider.js";
import type { BackendConfig } from "../config/env.schema.js";
import type { ProcessingAdmission } from "../admission/processing.admission.js";
import {
  CloudRendererClient,
  rendererIdentity,
} from "../media/renderer.cloudrun.js";
import { SourceAnalysis } from "./analysis.usecase.js";
import {
  GeminiAnalysisProvider,
  composeGeminiTransport,
} from "./gemini.adapter.js";
import { composeSelectedPlanProvider } from "../assembly/gemini-selected-plan.js";
import { SelectedAssembly } from "../assembly/selected-assembly.usecase.js";
import { CommonsPictureSource } from "../assembly/commons-pictures.js";
import { composeGeminiPictureGenerator } from "../assembly/gemini-pictures.js";
import { PreviewPlayback } from "../media/preview-playback.js";
import { FinalRender } from "../render/final-render.usecase.js";
import { OutputDelivery } from "../media/output-delivery.js";
import { composeRetainedSampleReader } from "../media/retained-sample.gcs.js";
import { RetainedSampleProcessing } from "../media/retained-sample.processing.js";
import { AnalysisDiagnostics } from "./analysis.diagnostics.js";
import { composeLocalSampleReplay } from "./sample-replay.js";
import { MediaDeliveryAllowance } from "../media/delivery-allowance.js";
export function composeAnalysis(
  config: BackendConfig,
  admission: ProcessingAdmission | null,
  diagnostics = new AnalysisDiagnostics(),
) {
  if (
    !admission ||
    config.nodeEnv === "test" ||
    !config.features.liveAnalysis ||
    !config.paidDemoEnabled ||
    config.providerMode !== "live" ||
    config.renderer.environment !== "cloud" ||
    !config.renderer.origin
  )
    return null;
  const media = new CloudRendererClient(
    config,
    rendererIdentity(config.renderer.origin),
    undefined,
    diagnostics,
  );
  const files = new GeminiAnalysisProvider(
    composeGeminiTransport(config, undefined, diagnostics),
    config.gemini.timeoutMs,
    undefined,
    diagnostics,
  );
  const sampleReader = composeRetainedSampleReader(config);
  const analysis = new SourceAnalysis(
    admission,
    media,
    new TranscribedAnalysisProvider(files, diagnostics),
    "google-gemini",
    Date.now,
    sampleReader ? new RetainedSampleProcessing(sampleReader) : null,
    diagnostics,
    composeLocalSampleReplay(config),
  );
  const planner = composeSelectedPlanProvider(config, files);
  const assembly = planner
    ? new SelectedAssembly(
        admission,
        analysis,
        media,
        planner,
        "google-gemini",
        diagnostics,
        new CommonsPictureSource(
          undefined,
          undefined,
          (error) => diagnostics.critique("assembly_pictures", error),
          (facts) => diagnostics.assembly("assembly_pictures", facts),
        ),
        composeGeminiPictureGenerator(config, diagnostics),
      )
    : null;
  // Clear and either AI phase share exactly the same provider-file and media ownership.
  const deliveryAllowance = new MediaDeliveryAllowance();
  const render =
    assembly && config.features.liveRender
      ? new FinalRender(
          admission,
          assembly,
          media,
          Date.now,
          diagnostics,
          deliveryAllowance,
        )
      : null;
  return {
    analysis,
    assembly,
    preview: assembly
      ? new PreviewPlayback(
          admission,
          assembly,
          media,
          Date.now,
          deliveryAllowance,
        )
      : null,
    render,
    output: render
      ? new OutputDelivery(
          admission,
          render,
          media,
          Date.now,
          deliveryAllowance,
        )
      : null,
  };
}
