import type { BrowserWorkspace } from "../media/browser.workspace";
import type { SourceAnalysisApi } from "./source-analysis.api";

export async function openSampleReplay(input: {
  workspace: Pick<
    BrowserWorkspace,
    "prepareRetainedSample" | "cacheSampleReplay"
  >;
  api: Pick<SourceAnalysisApi, "sampleReplayOptions">;
  signal: AbortSignal;
}) {
  // No grant/upload/analysis dispatch. The owner can inspect these choices first.
  const analysis = await input.api.sampleReplayOptions(input.signal);
  input.signal.throwIfAborted();
  await input.workspace.prepareRetainedSample(input.signal);
  input.signal.throwIfAborted();
  return input.workspace.cacheSampleReplay(analysis);
}

export async function prepareSampleReplay(input: {
  workspace: Pick<
    BrowserWorkspace,
    "snapshot" | "markCloudAnalysis" | "storeGroundedAnalysis"
  >;
  api: Pick<SourceAnalysisApi, "grant" | "sample" | "sampleReplay">;
  challenge(
    sessionId: string,
    action: "transcription" | "candidate-analysis",
    signal: AbortSignal,
  ): Promise<string>;
  signal: AbortSignal;
  label(value: string): void;
}) {
  const revision = input.workspace.snapshot?.sampleReplayRevision;
  if (
    !revision ||
    !input.workspace.snapshot?.retainedSample ||
    input.workspace.snapshot.cloudAnalysis
  )
    throw new Error("sample-replay-unavailable");
  let cleanupRequired = false;
  try {
    input.signal.throwIfAborted();
    await input.workspace.markCloudAnalysis("pending", false);
    input.label("Preparing a fresh private sample copy for assembly");
    const grant = await input.api.grant(input.signal);
    cleanupRequired = true;
    input.signal.throwIfAborted();
    await input.workspace.markCloudAnalysis("pending", true);
    const uploadToken = await input.challenge(
      grant.sessionId,
      "transcription",
      input.signal,
    );
    const { generation } = await input.api.sample(
      {
        rightsAcknowledged: true,
        dataTransferAcknowledged: true,
        turnstileToken: uploadToken,
      },
      input.signal,
    );
    const token = await input.challenge(
      grant.sessionId,
      "candidate-analysis",
      input.signal,
    );
    input.label("Binding saved moments to the sample — no new analysis calls");
    const result = await input.api.sampleReplay(
      generation,
      revision,
      token,
      input.signal,
    );
    input.signal.throwIfAborted();
    if (
      result.binding.sessionId !== grant.sessionId ||
      result.analysis.revision !== revision
    )
      throw new Error("sample-replay-source-mismatch");
    await input.workspace.storeGroundedAnalysis(result);
    input.signal.throwIfAborted();
  } catch (error) {
    await input.workspace
      .markCloudAnalysis("uncertain", cleanupRequired)
      .catch(() => undefined);
    throw error;
  }
}
