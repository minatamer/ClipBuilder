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

export type CodexProcessRequest = {
  executable: string;
  args: string[];
  input: string;
  cwd: string;
  env: NodeJS.ProcessEnv;
  stdoutBytes: number;
  statusOnly?: boolean;
};
export type CodexProcess = (
  request: CodexProcessRequest,
  signal: AbortSignal,
) => Promise<string>;
/** Stdin-only content, bounded output, no shell/logs and owned-tree cancellation. */
export const runCodexProcess: CodexProcess = async (request, signal) => {
  signal.throwIfAborted();
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
        output = [];
        stop();
      } else if (!overflow) output.push(bytes);
    });
    child.stderr.on("data", (bytes: Buffer) => {
      stderr += bytes.length;
      if (stderr > (request.statusOnly ? 8192 : 1024 ** 2)) {
        overflow = true;
        stop();
      } else if (request.statusOnly) output.push(bytes);
    });
    child.stdin.on("error", () => stop());
    child.once("error", () => {
      signal.removeEventListener("abort", stop);
      fail(new Error("codex_unavailable"));
    });
    child.once("close", async (code) => {
      signal.removeEventListener("abort", stop);
      await termination;
      if ((code !== 0 && !request.statusOnly) || overflow || signal.aborted)
        fail(
          new Error(
            signal.aborted
              ? "canceled"
              : /usage.limit|rate.limit|quota|out.of.credits/iu.test(
                    Buffer.concat(output).toString("utf8"),
                  )
                ? "codex_limit"
                : "codex_process_failed",
          ),
        );
      else done(Buffer.concat(output).toString("utf8"));
    });
    child.stdin.end(request.input, "utf8");
  });
};

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
  "code_mode",
  "code_mode_host",
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
}): CodexInference {
  const execute = options.process ?? runCodexProcess;
  return async (request, caller) => {
    const signal = AbortSignal.any([
      caller,
      AbortSignal.timeout(LOCAL_CODEX_POLICY.inferenceTimeoutMs),
    ]);
    if (
      Buffer.byteLength(request.prompt) > LOCAL_CODEX_POLICY.inputBytes ||
      (request.images?.length ?? 0) > LOCAL_CODEX_POLICY.frames
    )
      throw new Error("codex_input_invalid");
    const directory = await mkdtemp(join(options.root, "codex-call-"));
    try {
      const env = codexEnvironment(directory, options.environment),
        common = { executable: options.executable, cwd: directory, env };
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
      if (!/^Logged in using ChatGPT\s*$/im.test(status))
        throw new Error(
          /API.key/iu.test(status)
            ? "codex_subscription_required"
            : "codex_login_required",
        );
      const schema = join(directory, "schema.json"),
        output = join(directory, "result.json");
      await writeFile(schema, JSON.stringify(request.schema), {
        flag: "wx",
        mode: 0o600,
      });
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
        'web_search="disabled"',
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
      const events = await execute(
        {
          ...common,
          args,
          input: request.prompt,
          stdoutBytes: LOCAL_CODEX_POLICY.responseBytes,
        },
        signal,
      );
      let completed = false;
      for (const line of events.split(/\r?\n/u).filter(Boolean)) {
        const event: unknown = JSON.parse(line);
        if (
          typeof event !== "object" ||
          event === null ||
          !("type" in event) ||
          typeof event.type !== "string"
        )
          throw new Error("codex_response_invalid");
        if (event.type === "turn.completed") completed = true;
        if (event.type === "turn.failed" || event.type === "error")
          throw new Error("codex_response_invalid");
        if (
          event.type === "item.started" ||
          event.type === "item.updated" ||
          event.type === "item.completed"
        ) {
          const item = "item" in event ? event.item : null;
          // The CLI emits non-fatal configuration warnings as completed error
          // items. Fatal errors are top-level error/turn.failed events above.
          if (
            typeof item !== "object" ||
            item === null ||
            !("type" in item) ||
            typeof item.type !== "string" ||
            (!(event.type === "item.completed" && item.type === "error") &&
              !["agent_message", "reasoning"].includes(item.type))
          )
            throw new Error("codex_response_invalid");
        }
      }
      if (!completed) throw new Error("codex_response_invalid");
      signal.throwIfAborted();
      const info = await lstat(output);
      if (
        !info.isFile() ||
        info.isSymbolicLink() ||
        info.nlink !== 1 ||
        info.size > LOCAL_CODEX_POLICY.responseBytes
      )
        throw new Error("codex_response_invalid");
      return JSON.parse(await readFile(output, "utf8"));
    } finally {
      await removeCodexCall(options.root, directory);
    }
  };
}
