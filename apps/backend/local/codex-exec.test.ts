import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mkdtemp, readdir, rm, writeFile, link } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createLocalCodexInference,
  codexEnvironment,
  runCodexProcess,
  type CodexProcess,
} from "./codex-exec.ts";

let root: string;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "clipbuilder-codex-exec-test-"));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});
const request = {
  prompt: "Synthetic transcript only",
  schema: {
    type: "object",
    properties: { value: { type: "string" } },
    required: ["value"],
    additionalProperties: false,
  },
};
it("uses ChatGPT-only preflight, stdin and isolated no-tool flags without copying keys, and removes results", async () => {
  const execute = vi.fn<CodexProcess>(async (call) => {
    if (call.statusOnly) return "Logged in using ChatGPT\n";
    expect(call.input).toBe(request.prompt);
    expect(call.args).toContain('model_provider="clipbuilder_subscription"');
    expect(call.args).toContain(
      "model_providers.clipbuilder_subscription.requires_openai_auth=true",
    );
    expect(call.args).toContain(
      "model_providers.clipbuilder_subscription.request_max_retries=0",
    );
    expect(call.args).toContain(
      "model_providers.clipbuilder_subscription.stream_max_retries=0",
    );
    expect(
      call.args.some((arg) => arg.startsWith("model_providers.openai.")),
    ).toBe(false);
    expect(call.args).toEqual(
      expect.arrayContaining([
        "--ignore-user-config",
        "--ephemeral",
        "--skip-git-repo-check",
        "read-only",
        "shell_tool",
        "hooks",
        "apps",
        "multi_agent",
        'web_search="disabled"',
      ]),
    );
    for (const key of [
      "OPENAI_API_KEY",
      "CODEX_API_KEY",
      "GEMINI_API_KEY",
      "GOOGLE_APPLICATION_CREDENTIALS",
      "CODEX_HOME",
      "OPENAI_BASE_URL",
    ])
      expect(call.env[key]).toBeUndefined();
    expect(call.env.FAKE_MODE).toBe("true");
    expect(call.env.PAID_DEMO_ENABLED).toBe("false");
    await writeFile(
      call.args[call.args.indexOf("--output-last-message") + 1]!,
      JSON.stringify({ value: "synthetic" }),
    );
    return '{"type":"thread.started"}\n{"type":"item.completed","item":{"type":"agent_message"}}\n{"type":"turn.completed"}\n';
  });
  const infer = createLocalCodexInference({
    root,
    executable: "synthetic-codex",
    process: execute,
  });
  expect(await infer(request, AbortSignal.timeout(1000))).toEqual({
    value: "synthetic",
  });
  expect(execute).toHaveBeenCalledTimes(2);
  expect(await readdir(root)).toEqual([]);
  const env = codexEnvironment(root, {
    OPENAI_API_KEY: "synthetic-secret",
    CODEX_API_KEY: "synthetic-secret",
    CODEX_HOME: "synthetic-override",
    GEMINI_API_KEY: "synthetic-secret",
    USERPROFILE: "synthetic-profile",
  });
  expect(env).not.toHaveProperty("OPENAI_API_KEY");
  expect(env).not.toHaveProperty("CODEX_HOME");
  expect(env.USERPROFILE).toBe("synthetic-profile");
});
it.each(["Not logged in", "Logged in using an API key"])(
  "refuses %s before inference with no fallback",
  async (status) => {
    const execute = vi.fn<CodexProcess>(async () => status),
      infer = createLocalCodexInference({
        root,
        executable: "synthetic-codex",
        process: execute,
      });
    await expect(infer(request, AbortSignal.timeout(1000))).rejects.toThrow(
      status.includes("API key")
        ? "codex_subscription_required"
        : "codex_login_required",
    );
    expect(execute).toHaveBeenCalledTimes(1);
    expect(await readdir(root)).toEqual([]);
  },
);
it("accepts non-fatal completed warning items with a completed turn and safe result", async () => {
  const execute = vi.fn<CodexProcess>(async (call) => {
    if (call.statusOnly) return "Logged in using ChatGPT";
    await writeFile(
      call.args[call.args.indexOf("--output-last-message") + 1]!,
      JSON.stringify({ value: "synthetic" }),
    );
    return [
      { type: "thread.started" },
      {
        type: "item.completed",
        item: { type: "error", message: "Synthetic configuration warning" },
      },
      { type: "turn.started" },
      { type: "item.completed", item: { type: "agent_message" } },
      { type: "turn.completed" },
    ]
      .map((event) => JSON.stringify(event))
      .join("\n");
  });
  await expect(
    createLocalCodexInference({
      root,
      executable: "synthetic-codex",
      process: execute,
    })(request, AbortSignal.timeout(2000)),
  ).resolves.toEqual({ value: "synthetic" });
  expect(execute).toHaveBeenCalledTimes(2);
  expect(await readdir(root)).toEqual([]);
});
it.each([
  [{ type: "error", message: "Synthetic fatal failure" }],
  [{ type: "turn.failed", error: { message: "Synthetic failed turn" } }],
  [{ type: "item.started", item: { type: "command_execution" } }],
  [{ type: "item.updated", item: { type: "command_execution" } }],
  [{ type: "item.completed", item: { type: "mcp_tool_call" } }],
  [{ type: "item.completed", item: null }],
  [{ type: "item.updated", item: {} }],
])(
  "refuses fatal, unsafe or malformed events even with a safe final result: %j",
  async (event) => {
    const execute = vi.fn<CodexProcess>(async (call) => {
      if (call.statusOnly) return "Logged in using ChatGPT";
      await writeFile(
        call.args[call.args.indexOf("--output-last-message") + 1]!,
        JSON.stringify({ value: "synthetic" }),
      );
      return `${JSON.stringify(event)}\n{"type":"turn.completed"}`;
    });
    await expect(
      createLocalCodexInference({
        root,
        executable: "synthetic-codex",
        process: execute,
      })(request, AbortSignal.timeout(2000)),
    ).rejects.toThrow("codex_response_invalid");
    expect(execute).toHaveBeenCalledTimes(2);
    expect(await readdir(root)).toEqual([]);
  },
);
it("does not accept a warning as turn completion", async () => {
  const execute = vi.fn<CodexProcess>(async (call) => {
    if (call.statusOnly) return "Logged in using ChatGPT";
    return '{"type":"item.completed","item":{"type":"error","message":"Synthetic warning"}}';
  });
  await expect(
    createLocalCodexInference({
      root,
      executable: "synthetic-codex",
      process: execute,
    })(request, AbortSignal.timeout(2000)),
  ).rejects.toThrow("codex_response_invalid");
  expect(execute).toHaveBeenCalledTimes(2);
  expect(await readdir(root)).toEqual([]);
});
it("rejects tool execution events and linked result files while preserving the outside target", async () => {
  const outside = join(root, "outside.json");
  await writeFile(outside, '{"value":"outside"}');
  for (const linked of [false, true]) {
    const execute = vi.fn<CodexProcess>(async (call) => {
      if (call.statusOnly) return "Logged in using ChatGPT";
      if (linked)
        await link(
          outside,
          call.args[call.args.indexOf("--output-last-message") + 1]!,
        );
      return linked
        ? '{"type":"turn.completed"}'
        : '{"type":"item.completed","item":{"type":"command_execution"}}\n{"type":"turn.completed"}';
    });
    await expect(
      createLocalCodexInference({
        root,
        executable: "synthetic-codex",
        process: execute,
      })(request, AbortSignal.timeout(2000)),
    ).rejects.toThrow("codex_response_invalid");
  }
  expect(await readdir(root)).toEqual(["outside.json"]);
});
it("bounds an actual injected native child's output and reaps it on cancellation", async () => {
  const common = {
    executable: process.execPath,
    cwd: root,
    env: codexEnvironment(root),
    input: "",
    stdoutBytes: 32,
  };
  await expect(
    runCodexProcess(
      {
        ...common,
        args: [
          "-e",
          "process.stdout.write('x'.repeat(128));setInterval(()=>{},1000)",
        ],
      },
      AbortSignal.timeout(3000),
    ),
  ).rejects.toThrow("codex_process_failed");
  await expect(
    runCodexProcess(
      { ...common, args: ["-e", "setInterval(()=>{},1000)"] },
      AbortSignal.timeout(150),
    ),
  ).rejects.toThrow("canceled");
});
