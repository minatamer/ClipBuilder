import {
  hasSameRenderedAssembly,
  TEMPORARY_MEDIA_LIMITS,
} from "@clipbuilder/contracts";
import type { BrowserWorkspace } from "../media/browser.workspace";
import type { SourceAnalysisApi } from "../source-analysis/source-analysis.api";

export async function runFinalRender(input: {
  workspace: Pick<
    BrowserWorkspace,
    "snapshot" | "markCloudRender" | "storeFinalRender"
  >;
  api: Pick<SourceAnalysisApi, "session" | "render">;
  challenge(
    sessionId: string,
    action: "render",
    signal: AbortSignal,
  ): Promise<string>;
  signal: AbortSignal;
  label(value: string): void;
}) {
  const assembly = input.workspace.snapshot?.cloudAssembly?.result;
  if (!assembly || input.workspace.snapshot?.cloudRender)
    throw new Error("render-unavailable");
  const controller = new AbortController(),
    abort = () => controller.abort();
  input.signal.addEventListener("abort", abort, { once: true });
  if (input.signal.aborted) abort();
  const timer = setTimeout(abort, TEMPORARY_MEDIA_LIMITS.workDeadlineMs);
  let reserved = false;
  try {
    controller.signal.throwIfAborted();
    await input.workspace.markCloudRender("pending");
    reserved = true;
    input.label("Verifying export access");
    const session = await input.api.session(controller.signal);
    if (session.sessionId !== assembly.binding.sessionId)
      throw new Error("render-source-mismatch");
    const turnstileToken = await input.challenge(
      session.sessionId,
      "render",
      controller.signal,
    );
    input.label("Rendering and validating your final MP4");
    const result = await input.api.render(
      { assembly, turnstileToken },
      controller.signal,
    );
    controller.signal.throwIfAborted();
    if (!hasSameRenderedAssembly(result, assembly))
      throw new Error("render-source-mismatch");
    await input.workspace.storeFinalRender(result, controller.signal);
    controller.signal.throwIfAborted();
    return result;
  } catch (error) {
    if (reserved)
      await input.workspace.markCloudRender("uncertain").catch(() => undefined);
    throw error;
  } finally {
    clearTimeout(timer);
    input.signal.removeEventListener("abort", abort);
  }
}
