import {
  TEMPORARY_MEDIA_LIMITS,
  hasSameAssemblySource,
} from "@clipbuilder/contracts";
import type { BrowserWorkspace } from "../media/browser.workspace";
import type { SourceAnalysisApi } from "../source-analysis/source-analysis.api";

// One explicit assembly dispatch; refresh only restores its frozen result.
export async function runSelectedAssembly(input: {
  workspace: Pick<
    BrowserWorkspace,
    "snapshot" | "markCloudAssembly" | "storeSelectedAssembly"
  >;
  api: Pick<SourceAnalysisApi, "session" | "assemble">;
  challenge(
    sessionId: string,
    action: "visual-plan",
    signal: AbortSignal,
  ): Promise<string>;
  signal: AbortSignal;
  label(value: string): void;
}) {
  const analysis = input.workspace.snapshot?.cloudAnalysis?.result;
  const candidateId = input.workspace.snapshot?.selectedId;
  if (!analysis || !candidateId || input.workspace.snapshot?.cloudAssembly)
    throw new Error("assembly-unavailable");
  const controller = new AbortController(),
    abort = () => controller.abort();
  input.signal.addEventListener("abort", abort, { once: true });
  if (input.signal.aborted) abort();
  const timer = setTimeout(abort, TEMPORARY_MEDIA_LIMITS.workDeadlineMs);
  let reserved = false;
  try {
    controller.signal.throwIfAborted();
    await input.workspace.markCloudAssembly("pending");
    reserved = true;
    input.label("Verifying processing access");
    const session = await input.api.session(controller.signal);
    if (session.sessionId !== analysis.binding.sessionId)
      throw new Error("assembly-source-mismatch");
    const turnstileToken = await input.challenge(
      session.sessionId,
      "visual-plan",
      controller.signal,
    );
    input.label("Preparing the selected clip, framing and contextual plan");
    const result = await input.api.assemble(
      { analysis, candidateId, turnstileToken },
      controller.signal,
    );
    controller.signal.throwIfAborted();
    if (
      !hasSameAssemblySource(result, analysis) ||
      result.candidateId !== candidateId
    )
      throw new Error("assembly-source-mismatch");
    input.label("Validating fixed captions and composition");
    await input.workspace.storeSelectedAssembly(result, controller.signal);
    controller.signal.throwIfAborted();
    return result;
  } catch (error) {
    if (reserved)
      await input.workspace
        .markCloudAssembly("uncertain")
        .catch(() => undefined);
    throw error;
  } finally {
    clearTimeout(timer);
    input.signal.removeEventListener("abort", abort);
  }
}
