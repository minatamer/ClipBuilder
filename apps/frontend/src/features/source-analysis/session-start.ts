import type { SessionStartProof } from "@clipbuilder/contracts";
import type { SourceAnalysisApi } from "./source-analysis.api";

// Normal analysis obtains verified session-start evidence before a grant.
export async function startProcessingSession(input: {
  api: Pick<SourceAnalysisApi, "grant">;
  challenge(
    binding: string,
    action: "session-start",
    signal: AbortSignal,
  ): Promise<string>;
  signal: AbortSignal;
}) {
  input.signal.throwIfAborted();
  const startNonce = crypto.randomUUID();
  const turnstileToken = await input.challenge(
    startNonce,
    "session-start",
    input.signal,
  );
  input.signal.throwIfAborted();
  const proof: SessionStartProof = { startNonce, turnstileToken };
  return input.api.grant(proof, input.signal);
}
