import { spawn } from "node:child_process";
import { MediaFailure } from "./media.failure.js";
export async function runOwnedProcess(
  executable: string,
  args: string[],
  signal: AbortSignal,
  options: { cwd?: string; env?: NodeJS.ProcessEnv; maxStdout?: number } = {},
): Promise<string> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      ...options,
      windowsHide: true,
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "",
      stderr = Buffer.alloc(0),
      overflow = false,
      failure = false,
      forceTimer: ReturnType<typeof setTimeout> | undefined,
      termination: Promise<void> | undefined;
    const stop = () => {
      failure = true;
      if (!child.pid || child.exitCode !== null || child.signalCode !== null)
        return;
      if (process.platform === "win32") {
        const killer = spawn(
          "taskkill.exe",
          ["/PID", String(child.pid), "/T", "/F"],
          { windowsHide: true, stdio: "ignore" },
        );
        termination = new Promise((done) => {
          killer.once("close", (code) => {
            if (code !== 0) child.kill("SIGKILL");
            done();
          });
          killer.once("error", () => {
            child.kill("SIGKILL");
            done();
          });
        });
      } else {
        try {
          process.kill(-child.pid, "SIGTERM");
        } catch {
          /* already gone */
        }
        forceTimer = setTimeout(() => {
          if (
            child.pid &&
            child.exitCode === null &&
            child.signalCode === null
          ) {
            try {
              process.kill(-child.pid, "SIGKILL");
            } catch {
              /* already gone */
            }
          }
        }, 2000);
      }
    };
    const cleanup = () => {
      signal.removeEventListener("abort", stop);
      if (forceTimer) clearTimeout(forceTimer);
    };
    signal.addEventListener("abort", stop, { once: true });
    if (signal.aborted) stop();
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
      if (Buffer.byteLength(stdout) > (options.maxStdout ?? 65_536)) {
        stdout = "";
        overflow = true;
        stop();
      }
    });
    // A bounded in-memory tail is classified, never returned, logged or saved.
    child.stderr.on("data", (chunk: Buffer) => {
      stderr = Buffer.concat([stderr, chunk]).subarray(-32768);
    });
    child.on("error", (error) => {
      cleanup();
      reject(
        new MediaFailure(
          "media_failed",
          undefined,
          undefined,
          Object.assign(new Error("native_spawn_failed"), {
            code: "code" in error ? error.code : undefined,
          }),
        ),
      );
    });
    child.on("close", async (code, childSignal) => {
      if (failure && process.platform !== "win32" && child.pid) {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
          /* no owned group remains */
        }
      }
      cleanup();
      await termination;
      const text = stderr.toString("utf8");
      const reason = overflow
        ? "native_stdout_limit"
        : signal.aborted
          ? "canceled"
          : /no space left on device/i.test(text)
            ? "native_disk_full"
            : /permission denied|access is denied/i.test(text)
              ? "native_permission_denied"
              : /matches no streams|does not contain any stream/i.test(text)
                ? "native_stream_missing"
                : /unknown encoder|encoder .* not found/i.test(text)
                  ? "native_encoder_unavailable"
                  : /unknown decoder|decoder .* not found/i.test(text)
                    ? "native_decoder_unavailable"
                    : /no such filter|filter not found/i.test(text)
                      ? "native_filter_unavailable"
                      : /invalid data found|error opening input|moov atom not found/i.test(
                            text,
                          )
                        ? "native_input_invalid"
                        : /cannot allocate memory|out of memory/i.test(text)
                          ? "native_memory_exhausted"
                          : "media_failed";
      const cause = Object.assign(new Error(reason), {
        code,
        signal: childSignal,
      });
      if (failure || signal.aborted)
        reject(new MediaFailure("canceled", undefined, undefined, cause));
      else if (code !== 0)
        reject(new MediaFailure("media_failed", undefined, undefined, cause));
      else resolve(stdout);
    });
  });
}
