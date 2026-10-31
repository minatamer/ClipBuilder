import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mkdtemp, readdir, rm, writeFile, link } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LocalDiagnostics } from "./diagnostics.ts";
import { WebPictureSource } from "../src/assembly/web-pictures.ts";
import { createLocalCodexAi } from "./codex-ai.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import {
  executionTraceSchema,
  type ExecutionTrace,
} from "../../../packages/contracts/local/execution-diagnostics.ts";
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
it.each([
  ["unknown feature flag: standalone_web_search", "cli_argument"],
  ["HTTP 400 invalid_json_schema additionalProperties", "schema_rejected"],
  ["HTTP 429 rate_limit_exceeded", "rate_limit"],
  ["connect ECONNRESET", "connection"],
  [
    "Code Mode is unavailable because code-mode host is disabled. Enable features.code_mode_host",
    "cli_configuration",
  ],
])(
  "captures a real child stderr/exit failure (%s), not its private text",
  async (message, category) => {
    const records: ExecutionTrace[] = [];
    const operation = runCodexProcess(
      {
        executable: process.execPath,
        args: [
          "-e",
          `process.stderr.write(${JSON.stringify(message + " synthetic-secret /private/clip.mp4")});process.exitCode=2;`,
        ],
        input: "",
        cwd: root,
        env: codexEnvironment(root),
        stdoutBytes: 1024,
        observe: (entry) => records.push(entry),
      },
      AbortSignal.timeout(5000),
    );
    await expect(operation).rejects.toThrow(
      category === "rate_limit" ? "codex_limit" : "codex_process_failed",
    );
    expect(records.at(-1)).toMatchObject({
      phase: "process",
      outcome: "failed",
      exitCode: 2,
      stderrBytes: expect.any(Number),
      error: { category },
    });
    expect(
      records.every((record) => executionTraceSchema.safeParse(record).success),
    ).toBe(true);
    expect(JSON.stringify(records)).not.toMatch(
      /synthetic-secret|private\/clip/u,
    );
  },
);
it("keeps the actual process cause through composed search and successful generated fallback with one request", async () => {
  const lines: string[] = [],
    diagnostics = new LocalDiagnostics((line) => lines.push(line));
  const execute = vi.fn<CodexProcess>(async (call, signal) =>
    call.statusOnly
      ? "Logged in using ChatGPT"
      : runCodexProcess(
          {
            ...call,
            executable: process.execPath,
            args: [
              "-e",
              "process.stderr.write('error: unknown feature flag: standalone_web_search synthetic-secret');process.exitCode=2;",
            ],
          },
          signal,
        ),
  );
  const infer = createLocalCodexInference({
    root,
    executable: "synthetic",
    process: execute,
    observe: (detail) => diagnostics.trace(detail),
  });
  const pictures = new WebPictureSource(
    (_request, signal) => infer({ ...request, webSearch: true }, signal),
    (facts) => diagnostics.visual({ stage: "search", ...facts }),
    undefined,
    undefined,
    (detail) => diagnostics.trace(detail),
  );
  const ai = createLocalCodexAi({
    files: new WorkspaceFiles(root),
    media: vi.fn(),
    infer,
    pictures,
    diagnostics,
  });
  try {
    const result = await diagnostics.run("codex_pictures", () =>
      ai.clipPreparation!.image(
        {
          clipId: crypto.randomUUID(),
          words: [],
          cue: {
            startFrame: 0,
            endFrame: 90,
            evidenceWordIds: [],
            brief: {
              scene: "Synthetic",
              searchQuery: "synthetic",
              requiredTerms: [],
              avoidTerms: [],
            },
            illustration: {
              layout: "concept",
              heading: "Synthetic",
              items: [{ label: "Example", icon: "idea" }],
            },
          },
        },
        AbortSignal.timeout(5000),
      ),
    );
    expect(result?.origin).toBe("generated");
    expect(execute).toHaveBeenCalledTimes(2);
    const records = lines.map((line) => JSON.parse(line));
    expect(new Set(records.map((entry) => entry.requestId)).size).toBe(1);
    expect(records).toContainEqual(
      expect.objectContaining({
        event: "execution_trace",
        phase: "process",
        exitCode: 2,
        error: expect.objectContaining({
          category: "cli_argument",
          cliOption: "standalone_web_search",
        }),
      }),
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        event: "execution_trace",
        boundary: "search",
        phase: "discovery",
        outcome: "failed",
        error: expect.objectContaining({ category: "cli_argument" }),
      }),
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        event: "execution_trace",
        phase: "fallback",
        outcome: "succeeded",
        origin: "generated",
      }),
    );
    expect(
      records
        .filter((entry) => entry.visual?.stage === "search")
        .every((entry) => entry.visual.outcome !== "miss"),
    ).toBe(true);
    expect(lines.join()).not.toContain("synthetic-secret");
  } finally {
    await ai.close!(AbortSignal.timeout(1000));
  }
});
it.each([
  ["not-json", "event_json"],
  ["{}", "event_shape"],
  [
    '{"type":"turn.failed","error":{"message":"HTTP 400 invalid_json_schema pattern private-secret"}}',
    "schema_rejected",
  ],
  [
    '{"type":"item.completed","item":{"type":"command_execution"}}',
    "item_type",
  ],
  ['{"type":"thread.started"}', "turn_missing"],
])("preserves the event failure family (%s)", async (events, category) => {
  const records: ExecutionTrace[] = [];
  const infer = createLocalCodexInference({
    root,
    executable: "synthetic",
    observe: (detail) => records.push(detail),
    process: async (call) =>
      call.statusOnly ? "Logged in using ChatGPT" : events,
  });
  await expect(infer(request, AbortSignal.timeout(1000))).rejects.toThrow(
    "codex_response_invalid",
  );
  expect(records).toContainEqual(
    expect.objectContaining({
      phase: "events",
      outcome: "failed",
      error: expect.objectContaining({ category }),
    }),
  );
  expect(records.at(-1)).toMatchObject({
    phase: "cleanup",
    outcome: "succeeded",
  });
  expect(JSON.stringify(records)).not.toContain("private-secret");
});
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
        "features.code_mode.enabled=false",
        "features.code_mode_host=false",
        "agents.enabled=false",
        "plugins",
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
it("permits only web search events in explicit search calls and diagnoses a model that never searched", async () => {
  let searches = true;
  const execute = vi.fn<CodexProcess>(async (call) => {
    if (call.statusOnly) return "Logged in using ChatGPT";
    expect(call.args).toContain('web_search="live"');
    expect(call.args).toContain("features.code_mode.enabled=true");
    expect(call.args).toContain("features.code_mode_host=true");
    expect(call.args).toContain(
      'features.code_mode.excluded_tool_namespaces=["functions","image_gen","clock","collaboration"]',
    );
    expect(call.args).toContain(
      "model_providers.clipbuilder_subscription.supports_standalone_web_search=true",
    );
    expect(call.args).toContain("shell_tool");
    await writeFile(
      call.args[call.args.indexOf("--output-last-message") + 1]!,
      JSON.stringify({ value: "synthetic" }),
    );
    return [
      ...(searches
        ? [{ type: "item.completed", item: { type: "web_search" } }]
        : []),
      { type: "turn.completed" },
    ]
      .map((value) => JSON.stringify(value))
      .join("\n");
  });
  const infer = createLocalCodexInference({
    root,
    executable: "synthetic",
    process: execute,
  });
  expect(
    await infer({ ...request, webSearch: true }, AbortSignal.timeout(2000)),
  ).toEqual({ value: "synthetic" });
  searches = false;
  await expect(
    infer({ ...request, webSearch: true }, AbortSignal.timeout(2000)),
  ).rejects.toThrow("image_search_not_attempted");
  expect(execute).toHaveBeenCalledTimes(4);
  expect(await readdir(root)).toEqual([]);
});
it("diagnoses a started search that never completed without accepting candidate output", async () => {
  const traces: ExecutionTrace[] = [];
  const execute = vi.fn<CodexProcess>(async (call) =>
    call.statusOnly
      ? "Logged in using ChatGPT"
      : '{"type":"item.started","item":{"type":"web_search"}}\n{"type":"turn.completed"}',
  );
  await expect(
    createLocalCodexInference({
      root,
      executable: "synthetic",
      process: execute,
      observe: (entry) => traces.push(entry),
    })({ ...request, webSearch: true }, AbortSignal.timeout(2000)),
  ).rejects.toThrow("image_search_incomplete");
  expect(execute).toHaveBeenCalledTimes(2);
  expect(traces).toContainEqual(
    expect.objectContaining({
      phase: "events",
      outcome: "failed",
      error: expect.objectContaining({ category: "search_incomplete" }),
      events: expect.objectContaining({
        searchesStarted: 1,
        searchesCompleted: 0,
      }),
    }),
  );
  expect(await readdir(root)).toEqual([]);
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
  const traces: ExecutionTrace[] = [];
  const common = {
    executable: process.execPath,
    cwd: root,
    env: codexEnvironment(root),
    input: "",
    stdoutBytes: 32,
    observe: (entry: ExecutionTrace) => traces.push(entry),
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
  expect(traces.at(-1)).toMatchObject({
    outcome: "failed",
    error: { category: "stdout_limit" },
    stdoutBytes: 128,
  });
  await expect(
    runCodexProcess(
      { ...common, args: ["-e", "setInterval(()=>{},1000)"] },
      AbortSignal.timeout(150),
    ),
  ).rejects.toThrow("canceled");
  expect(traces.at(-1)).toMatchObject({
    outcome: "canceled",
    error: { category: "timeout" },
  });
});
it.each(["missing", "invalid-json", "linked"])(
  "diagnoses final output %s without leaking its content or path",
  async (kind) => {
    const traces: ExecutionTrace[] = [];
    const execute = vi.fn<CodexProcess>(async (call) => {
      if (call.statusOnly) return "Logged in using ChatGPT";
      const output = call.args[call.args.indexOf("--output-last-message") + 1]!;
      if (kind === "invalid-json")
        await writeFile(output, "synthetic-secret-not-json");
      if (kind === "linked") {
        const outside = join(root, "private-source.json");
        await writeFile(outside, "{}");
        await link(outside, output);
      }
      return '{"type":"turn.completed"}';
    });
    const infer = createLocalCodexInference({
      root,
      executable: "synthetic",
      process: execute,
      observe: (entry) => traces.push(entry),
    });
    await expect(infer(request, AbortSignal.timeout(1000))).rejects.toThrow();
    expect(traces).toContainEqual(
      expect.objectContaining({
        phase: "output",
        outcome: "failed",
        error: expect.objectContaining({
          category:
            kind === "missing"
              ? "output_missing"
              : kind === "linked"
                ? "output_shape"
                : "output_json",
        }),
      }),
    );
    expect(execute).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(traces)).not.toMatch(
      /synthetic-secret|private-source/u,
    );
  },
);
