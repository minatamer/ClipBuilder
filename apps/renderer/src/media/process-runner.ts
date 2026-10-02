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
      stdio: ["ignore", "pipe", "ignore"],
    });
    let stdout = "",
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
        stop();
      }
    });
    child.on("error", () => {
      cleanup();
      reject(new MediaFailure("media_failed"));
    });
    child.on("close", async (code) => {
      if (failure && process.platform !== "win32" && child.pid) {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
          /* no owned group remains */
        }
      }
      cleanup();
      await termination;
      if (failure || signal.aborted) reject(new MediaFailure("canceled"));
      else if (code !== 0) reject(new MediaFailure("media_failed"));
      else resolve(stdout);
    });
  });
}
