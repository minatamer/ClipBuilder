import { expect, it } from "vitest";
import { localCodexError, LocalCodexError } from "./codex-errors.ts";
it("maps only closed reasons and never echoes upstream details", async () => {
  const login = await localCodexError(
    Response.json({
      reason: "codex_login_required",
      detail: "synthetic-private",
    }),
  );
  expect(login).toBeInstanceOf(LocalCodexError);
  expect(login.message).toBe("Sign in to Codex CLI with ChatGPT, then retry.");
  const unknown = await localCodexError(
    Response.json({ reason: "synthetic-private" }),
  );
  expect(unknown.message).not.toContain("synthetic-private");
  const invalid = await localCodexError(new Response("synthetic-private"));
  expect(invalid.message).toBe(unknown.message);
  const launch = await localCodexError(
    Response.json({
      reason: "codex_process_failed",
      detail: "synthetic-private",
    }),
  );
  expect(launch.message).toBe(
    "Codex couldn’t complete this request. Try again.",
  );
});
