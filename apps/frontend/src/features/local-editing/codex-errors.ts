import { localCodexFailureSchema } from "../../../../../packages/contracts/local/codex.ts";
export class LocalCodexError extends Error {}
export async function localCodexError(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  const parsed = localCodexFailureSchema.safeParse(
    typeof body === "object" && body !== null && "reason" in body
      ? body.reason
      : null,
  );
  if (!parsed.success)
    return new LocalCodexError(
      "Check Codex sign-in and local speech setup, then retry.",
    );
  const messages = {
    codex_unavailable: "Open Codex and check its CLI installation, then retry.",
    codex_login_required: "Sign in to Codex CLI with ChatGPT, then retry.",
    codex_subscription_required:
      "Use ChatGPT sign-in in Codex CLI, then retry.",
    codex_limit:
      "Your Codex allowance is unavailable. Check its limit and retry later.",
    codex_response_invalid:
      "Codex did not return a usable result. Retry when ready.",
    codex_process_failed: "Codex couldn’t complete this request. Try again.",
    local_speech_unavailable:
      "Finish local speech setup and restart the backend, then retry.",
  };
  return new LocalCodexError(messages[parsed.data]);
}
