import { spawn } from "node:child_process";
import {
  mkdtemp,
  lstat,
  readdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { join, resolve, dirname, relative, isAbsolute } from "node:path";
import { LOCAL_CODEX_POLICY } from "../../../packages/contracts/local/codex.ts";
import { nativeEnvironment } from "./local-mode.ts";
import { codexOutputSchema } from "./codex-schema.ts";
import { randomUUID, createHash } from "node:crypto";
import {
  classifyExecutionFailure,
  ExecutionError,
} from "../src/diagnostics/execution-failure.ts";
import type {
  ExecutionTrace,
  ExecutionFailure,
} from "../../../packages/contracts/local/execution-diagnostics.ts";
import { executionTraceSchema } from "../../../packages/contracts/local/execution-diagnostics.ts";

export type CodexProcessRequest = {
  executable: string;
  args: string[];
  input: string;
  cwd: string;
  env: NodeJS.ProcessEnv;
  stdoutBytes: number;
  statusOnly?: boolean;
  observe?: ((detail: ExecutionTrace) => void) | undefined;
  callId?: string;
  searchEnabled?: boolean;
};
export type CodexProcess = (
  request: CodexProcessRequest,
  signal: AbortSignal,
) => Promise<string>;
/** Stdin-only content, bounded output, no shell/logs and owned-tree cancellation. */
export const runCodexProcess: CodexProcess = async (request, signal) => {
  signal.throwIfAborted();
  const started = performance.now();
  const report = (
    detail: Omit<ExecutionTrace, "boundary" | "phase" | "elapsedMs">,
  ) => {
    try {
      request.observe?.({
        boundary: "codex",
        phase: request.statusOnly ? "preflight" : "process",
        callId: request.callId,
        searchEnabled: request.searchEnabled,
        elapsedMs: Math.round(performance.now() - started),
        ...detail,
      });
    } catch {
      /* Nonfatal sink. */
    }
  };
  report({
    outcome: "started",
    inputBytes: Buffer.byteLength(request.input),
    limitBytes: request.stdoutBytes,
    stderrLimitBytes: request.statusOnly ? 8192 : 1024 ** 2,
  });
  return new Promise((done, fail) => {
    const child = spawn(request.executable, request.args, {
      cwd: request.cwd,
      env: request.env,
      windowsHide: true,
      detached: process.platform !== "win32",
      stdio: ["pipe", "pipe", "pipe"],
    });
    let total = 0,
      stderr = 0,
      overflow = false,
      output: Buffer[] = [],
      errorSample = Buffer.alloc(0),
      processFault: ExecutionFailure | undefined,
      termination: Promise<void> | undefined;
    const stop = () => {
      if (
        termination ||
        !child.pid ||
        child.exitCode !== null ||
        child.signalCode !== null
      )
        return;
      if (process.platform === "win32") {
        const killer = spawn(
          "taskkill.exe",
          ["/PID", String(child.pid), "/T", "/F"],
          { windowsHide: true, stdio: "ignore" },
        );
        termination = new Promise((resolve) => {
          killer.once("close", (code) => {
            if (code !== 0) child.kill("SIGKILL");
            resolve();
          });
          killer.once("error", () => {
            child.kill("SIGKILL");
            resolve();
          });
        });
      } else {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
          /* Already reaped. */
        }
        termination = Promise.resolve();
      }
    };
    signal.addEventListener("abort", stop, { once: true });
    if (signal.aborted) stop();
    child.stdout.on("data", (bytes: Buffer) => {
      total += bytes.length;
      if (total > request.stdoutBytes) {
        overflow = true;
        processFault = { category: "stdout_limit" };
        output = [];
        stop();
      } else if (!overflow) output.push(bytes);
    });
    child.stderr.on("data", (bytes: Buffer) => {
      stderr += bytes.length;
      errorSample = Buffer.concat([errorSample, bytes]).subarray(-65_536);
      if (stderr > (request.statusOnly ? 8192 : 1024 ** 2)) {
        overflow = true;
        processFault = { category: "stderr_limit" };
        stop();
      } else if (request.statusOnly) output.push(bytes);
    });
    child.stdin.on("error", (error) => {
      processFault = classifyExecutionFailure(error, "stdin");
      stop();
    });
    child.once("error", (error) => {
      signal.removeEventListener("abort", stop);
      processFault = classifyExecutionFailure(error, "spawn");
      report({
        outcome: "failed",
        error: processFault,
        stdoutBytes: total,
        stderrBytes: stderr,
      });
      fail(new ExecutionError("codex_unavailable", processFault));
    });
    child.once("close", async (code, terminatedBy) => {
      signal.removeEventListener("abort", stop);
      await termination;
      const text = Buffer.concat(output).toString("utf8");
      const classified: ExecutionFailure =
        code !== 0 || overflow || processFault
          ? classifyExecutionFailure(
              errorSample.toString("utf8") + "\n" + codexErrorText(text),
              "process_exit",
            )
          : { category: "process_exit" };
      const diagnostic = signal.aborted
        ? ({
            category:
              signal.reason?.name === "TimeoutError" ? "timeout" : "canceled",
          } as const)
        : processFault &&
            ["stdout_limit", "stderr_limit", "spawn"].includes(
              processFault.category,
            )
          ? processFault
          : classified.category !== "process_exit"
            ? classified
            : (processFault ?? classified);
      const failed =
        (code !== 0 && !request.statusOnly) || overflow || signal.aborted;
      const terminationSignal =
        executionTraceSchema.shape.signal.safeParse(terminatedBy);
      report({
        outcome: signal.aborted
          ? "canceled"
          : failed || code !== 0
            ? "failed"
            : "succeeded",
        exitCode: code,
        ...(terminatedBy
          ? {
              signal: terminationSignal.success
                ? terminationSignal.data
                : "other",
            }
          : {}),
        stdoutBytes: total,
        stderrBytes: stderr,
        ...(failed || code !== 0 ? { error: diagnostic } : {}),
      });
      errorSample = Buffer.alloc(0);
      if (failed)
        fail(
          new ExecutionError(
            signal.aborted
              ? "canceled"
              : diagnostic.category === "rate_limit"
                ? "codex_limit"
                : "codex_process_failed",
            diagnostic,
          ),
        );
      else done(text);
    });
    child.stdin.end(request.input, "utf8");
  });
};
function codexErrorText(events: string) {
  const errors: string[] = [];
  for (const line of events.split(/\r?\n/u)) {
    try {
      const event = JSON.parse(line);
      const value =
        event.type === "error"
          ? JSON.stringify({ message: event.message, error: event.error })
          : event.type === "turn.failed"
            ? JSON.stringify(event.error)
            : event.type === "item.completed" && event.item?.type === "error"
              ? JSON.stringify(event.item)
              : undefined;
      if (typeof value === "string") errors.push(value.slice(0, 8192));
    } catch {
      /* Only structured error fields are classified. */
    }
    if (errors.length >= 8) break;
  }
  return errors.join("\n");
}

export async function findLocalCodex(
  environment: NodeJS.ProcessEnv = process.env,
) {
  const bases: string[] = (environment.PATH ?? "")
    .split(process.platform === "win32" ? ";" : ":")
    .filter(Boolean);
  if (environment.LOCALAPPDATA) {
    const root = join(environment.LOCALAPPDATA, "OpenAI/Codex/bin");
    try {
      for (const name of (await readdir(root)).sort().reverse().slice(0, 32))
        if (/^[a-f0-9]+$/i.test(name)) bases.push(join(root, name));
    } catch {
      /* Try explicit PATH entries. */
    }
  }
  for (const base of bases) {
    const executable = resolve(
      base,
      process.platform === "win32" ? "codex.exe" : "codex",
    );
    try {
      const info = await lstat(executable);
      if (
        info.isFile() &&
        !info.isSymbolicLink() &&
        (await realpath(executable)) === executable
      )
        return executable;
    } catch {
      /* Not installed here. */
    }
  }
  return null;
}
export function codexEnvironment(
  directory: string,
  environment: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  // Native flags remain fake/paid-off. Authentication is solely the CLI's own
  // cached ChatGPT login; no API keys, provider overrides or credentials copied.
  return {
    ...nativeEnvironment(directory),
    USERPROFILE: environment.USERPROFILE,
    HOME: environment.HOME,
    APPDATA: environment.APPDATA,
    LOCALAPPDATA: environment.LOCALAPPDATA,
    PATH: environment.SystemRoot
      ? join(environment.SystemRoot, "System32")
      : "",
  };
}
export type CodexRequest = {
  prompt: string;
  schema: Record<string, unknown>;
  images?: readonly string[];
  webSearch?: boolean;
};
export type CodexInference = (
  request: CodexRequest,
  signal: AbortSignal,
) => Promise<unknown>;
const disabled = [
  "shell_tool",
  "unified_exec",
  "apps",
  "hooks",
  "multi_agent",
  "multi_agent_v2",
  "browser_use",
  "view_image",
  "plugins",
  "image_generation",
  "skill_search",
  "skill_mcp_dependency_install",
  "memories",
  "goals",
];
async function removeCodexCall(root: string, directory: string) {
  const actual = await realpath(directory),
    base = await realpath(root),
    rel = relative(base, actual);
  if (
    !rel.startsWith("codex-call-") ||
    rel.includes("..") ||
    isAbsolute(rel) ||
    dirname(actual) !== base
  )
    throw new Error("codex_input_invalid");
  await rm(actual, { recursive: true, force: true });
}
export function createLocalCodexInference(options: {
  executable: string;
  root: string;
  environment?: NodeJS.ProcessEnv;
  process?: CodexProcess;
  observe?: (detail: ExecutionTrace) => void;
}): CodexInference {
  const execute = options.process ?? runCodexProcess;
  let version: Promise<string | undefined> | undefined;
  return async (request, caller) => {
    const callId = randomUUID(),
      started = performance.now();
    let phase: ExecutionTrace["phase"] = "input";
    const counts = {
      total: 0,
      searchesStarted: 0,
      searchesCompleted: 0,
      warnings: 0,
      completed: false,
    };
    const report = (
      outcome: ExecutionTrace["outcome"],
      extra: Partial<ExecutionTrace> = {},
    ) => {
      try {
        options.observe?.({
          boundary: "codex",
          phase,
          outcome,
          callId,
          elapsedMs: Math.round(performance.now() - started),
          searchEnabled: !!request.webSearch,
          timeoutMs: LOCAL_CODEX_POLICY.inferenceTimeoutMs,
          ...extra,
        });
      } catch {
        /* Nonfatal sink. */
      }
    };
    function reject(
      category: ExecutionFailure["category"],
      message = "codex_response_invalid",
      error?: unknown,
    ): never {
      throw new ExecutionError(message, {
        ...classifyExecutionFailure(error, category),
        category,
      });
    }
    const timeout = AbortSignal.timeout(LOCAL_CODEX_POLICY.inferenceTimeoutMs);
    const signal = AbortSignal.any([caller, timeout]);
    let directory: string | undefined;
    async function cleanup() {
      phase = "cleanup";
      try {
        if (directory) {
          await removeCodexCall(options.root, directory);
          report("succeeded");
        } else report("omitted");
      } catch (error) {
        report("failed", {
          error: classifyExecutionFailure(error, "filesystem"),
        });
        throw error;
      }
    }
    try {
      if (
        Buffer.byteLength(request.prompt) > LOCAL_CODEX_POLICY.inputBytes ||
        (request.images?.length ?? 0) > LOCAL_CODEX_POLICY.frames
      )
        reject("input_limit", "codex_input_invalid");
      directory = await mkdtemp(join(options.root, "codex-call-"));
      const env = codexEnvironment(directory, options.environment),
        common = {
          executable: options.executable,
          cwd: directory,
          env,
          callId,
          searchEnabled: !!request.webSearch,
          observe: options.observe,
        };
      phase = "preflight";
      if (!options.process) {
        version ??= execute(
          {
            ...common,
            args: ["--version"],
            input: "",
            stdoutBytes: 256,
            statusOnly: true,
          },
          signal,
        )
          .then((text) => /codex-cli\s+(\d+\.\d+\.\d+)/u.exec(text)?.[1])
          .catch((error: unknown) => {
            report("failed", {
              cliCheck: "version",
              error: classifyExecutionFailure(error),
            });
            return undefined;
          });
        const cliVersion = await version;
        report(cliVersion ? "succeeded" : "warning", {
          cliCheck: "version",
          ...(cliVersion ? { cliVersion } : {}),
        });
      }
      const status = await execute(
        {
          ...common,
          args: ["-c", 'model_provider="openai"', "login", "status"],
          input: "",
          stdoutBytes: 8192,
          statusOnly: true,
        },
        signal,
      );
      const authKind = /^Logged in using ChatGPT\s*$/im.test(status)
        ? "chatgpt"
        : /API.key/iu.test(status)
          ? "api-key"
          : "missing";
      report(authKind === "chatgpt" ? "succeeded" : "failed", {
        authKind,
        cliCheck: "login",
      });
      if (authKind !== "chatgpt")
        reject(
          authKind === "api-key" ? "subscription" : "authentication",
          authKind === "api-key"
            ? "codex_subscription_required"
            : "codex_login_required",
        );
      phase = "input";
      const schema = join(directory, "schema.json"),
        output = join(directory, "result.json");
      await writeFile(
        schema,
        JSON.stringify(codexOutputSchema(request.schema)),
        {
          flag: "wx",
          mode: 0o600,
        },
      );
      // Built-in IDs are reserved; a private ID keeps ChatGPT auth and fixed
      // retry policy without redefining the CLI's built-in OpenAI provider.
      const args = [
        "exec",
        "--ignore-user-config",
        "--ephemeral",
        "--skip-git-repo-check",
        "--sandbox",
        "read-only",
        "--color",
        "never",
        "--json",
        "--output-schema",
        schema,
        "--output-last-message",
        output,
        "-c",
        'model_provider="clipbuilder_subscription"',
        "-c",
        'model_providers.clipbuilder_subscription.name="OpenAI"',
        "-c",
        "model_providers.clipbuilder_subscription.requires_openai_auth=true",
        "-c",
        'model_providers.clipbuilder_subscription.wire_api="responses"',
        "-c",
        request.webSearch ? 'web_search="live"' : 'web_search="disabled"',
        "-c",
        `features.code_mode.enabled=${!!request.webSearch}`,
        "-c",
        `features.code_mode_host=${!!request.webSearch}`,
        "-c",
        'features.code_mode.excluded_tool_namespaces=["functions","image_gen","clock","collaboration"]',
        "-c",
        "agents.enabled=false",
        "-c",
        "mcp_servers={}",
        "-c",
        "analytics.enabled=false",
        "-c",
        "feedback.enabled=false",
        "-c",
        'model_reasoning_effort="medium"',
        "-c",
        "model_providers.clipbuilder_subscription.request_max_retries=0",
        "-c",
        "model_providers.clipbuilder_subscription.stream_max_retries=0",
        "--disable",
        "unbounded_connection_retries",
      ];
      if (request.webSearch)
        args.push(
          "-c",
          "model_providers.clipbuilder_subscription.supports_standalone_web_search=true",
          "--disable",
          "standalone_web_search",
        );
      for (const feature of disabled) args.push("--disable", feature);
      for (const [index, encoded] of (request.images ?? []).entries()) {
        const bytes = Buffer.from(encoded, "base64");
        if (
          bytes.length > LOCAL_CODEX_POLICY.imageBytes ||
          bytes[0] !== 0xff ||
          bytes[1] !== 0xd8 ||
          bytes[2] !== 0xff
        )
          throw new Error("codex_input_invalid");
        const image = join(directory, `frame-${index}.jpg`);
        await writeFile(image, bytes, { flag: "wx", mode: 0o600 });
        args.push("--image", image);
      }
      args.push("-");
      phase = "process";
      const events = await execute(
        {
          ...common,
          args,
          input: request.prompt,
          stdoutBytes: LOCAL_CODEX_POLICY.responseBytes,
        },
        signal,
      );
      phase = "events";
      let completed = false;
      for (const line of events.split(/\r?\n/u).filter(Boolean)) {
        counts.total++;
        let event: unknown;
        try {
          event = JSON.parse(line);
        } catch (error) {
          reject("event_json", "codex_response_invalid", error);
        }
        if (
          typeof event !== "object" ||
          event === null ||
          !("type" in event) ||
          typeof event.type !== "string"
        )
          reject("event_shape");
        if (event.type === "turn.completed") {
          completed = true;
          counts.completed = true;
        }
        if (
          ![
            "thread.started",
            "turn.started",
            "turn.completed",
            "turn.failed",
            "error",
            "item.started",
            "item.updated",
            "item.completed",
          ].includes(event.type)
        )
          report("warning", {
            error: {
              category: "event_type",
              identifierFingerprint: createHash("sha256")
                .update(event.type)
                .digest("hex"),
              eventType: "other",
            },
          });
        if (event.type === "turn.failed" || event.type === "error") {
          const detail = classifyExecutionFailure(
            codexErrorText(line),
            event.type === "turn.failed" ? "turn_failed" : "error_event",
          );
          throw new ExecutionError("codex_response_invalid", {
            ...detail,
            eventType: event.type,
          });
        }
        if (
          event.type === "item.started" ||
          event.type === "item.updated" ||
          event.type === "item.completed"
        ) {
          const item = "item" in event ? event.item : null;
          if (
            request.webSearch &&
            item &&
            typeof item === "object" &&
            "type" in item &&
            item.type === "web_search"
          ) {
            if (event.type === "item.completed") counts.searchesCompleted++;
            else if (event.type === "item.started") counts.searchesStarted++;
          }
          if (
            item &&
            typeof item === "object" &&
            "type" in item &&
            item.type === "error"
          ) {
            counts.warnings++;
            report("warning", {
              error: {
                ...classifyExecutionFailure(codexErrorText(line)),
                eventType: "item.error",
              },
            });
          }
          // The CLI emits non-fatal configuration warnings as completed error
          // items. Fatal errors are top-level error/turn.failed events above.
          if (
            typeof item !== "object" ||
            item === null ||
            !("type" in item) ||
            typeof item.type !== "string" ||
            (!(event.type === "item.completed" && item.type === "error") &&
              ![
                "agent_message",
                "reasoning",
                ...(request.webSearch ? ["web_search"] : []),
              ].includes(item.type))
          )
            reject(
              "item_type",
              "codex_response_invalid",
              new Error(
                item && typeof item === "object" && "type" in item
                  ? String(item.type)
                  : "missing",
              ),
            );
        }
      }
      report("succeeded", { events: counts });
      if (!completed) reject("turn_missing");
      if (request.webSearch && counts.searchesCompleted === 0)
        reject(
          counts.searchesStarted ? "search_incomplete" : "search_missing",
          counts.searchesStarted
            ? "image_search_incomplete"
            : "image_search_not_attempted",
        );
      signal.throwIfAborted();
      phase = "output";
      const info = await lstat(output);
      if (
        !info.isFile() ||
        info.isSymbolicLink() ||
        info.nlink !== 1 ||
        info.size > LOCAL_CODEX_POLICY.responseBytes
      )
        reject(
          info.size > LOCAL_CODEX_POLICY.responseBytes
            ? "output_limit"
            : "output_shape",
        );
      let result: unknown;
      try {
        result = JSON.parse(await readFile(output, "utf8"));
      } catch (error) {
        reject("output_json", "codex_response_invalid", error);
      }
      report("succeeded", { outputBytes: info.size, events: counts });
      return result;
    } catch (error) {
      const detail = classifyExecutionFailure(
        error,
        phase === "output"
          ? "output_missing"
          : phase === "input"
            ? "filesystem"
            : "unknown",
      );
      report(signal.aborted ? "canceled" : "failed", {
        error: detail,
        events: counts,
        ...(signal.aborted
          ? { deadlineSource: caller.aborted ? "caller" : "inference" }
          : {}),
      });
      throw error;
    } finally {
      await cleanup();
    }
  };
}
