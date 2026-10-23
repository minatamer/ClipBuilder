import { spawn } from "node:child_process";
import { StringDecoder } from "node:string_decoder";
import { OWNER_ACQUISITION_LIMITS } from "../../../packages/contracts/local/acquisition-profile.ts";

export type AcquisitionProcessRequest = {
  executable: string;
  args: readonly string[];
  input: string;
  cwd: string;
  env: NodeJS.ProcessEnv;
  timeoutMs: number;
};
export type AcquisitionProcess = (
  request: AcquisitionProcessRequest,
  line: (value: string) => void,
  signal: AbortSignal,
) => Promise<void>;

/** No shell, raw output logging, inherited environment or detached daemon. */
export const runAcquisitionProcess: AcquisitionProcess = async (
  request,
  line,
  signal,
) => {
  signal.throwIfAborted();
  return new Promise<void>((resolve, reject) => {
    const child = spawn(request.executable, [...request.args], {
      cwd: request.cwd,
      env: request.env,
      windowsHide: true,
      detached: process.platform !== "win32",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const decoder = new StringDecoder("utf8");
    let buffer = "";
    let output = 0;
    let stderr = 0;
    let failed = false;
    let termination: Promise<void> | undefined;
    let force: ReturnType<typeof setTimeout> | undefined;
    const stop = () => {
      failed = true;
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
        termination = new Promise<void>((done) => {
          killer.once("error", () => {
            child.kill("SIGKILL");
            done();
          });
          killer.once("close", () => {
            if (child.exitCode === null) child.kill("SIGKILL");
            done();
          });
        });
      } else {
        try {
          process.kill(-child.pid, "SIGTERM");
        } catch {
          /* already reaped */
        }
        force = setTimeout(() => {
          if (child.pid) {
            try {
              process.kill(-child.pid, "SIGKILL");
            } catch {
              /* already reaped */
            }
          }
        }, 1000);
        termination = Promise.resolve();
      }
    };
    const timeout = setTimeout(stop, request.timeoutMs);
    const idle = setInterval(() => {
      if (Date.now() - lastOutput > OWNER_ACQUISITION_LIMITS.idleMs) stop();
    }, 1000);
    let lastOutput = Date.now();
    signal.addEventListener("abort", stop, { once: true });
    if (signal.aborted) stop();
    child.stdout.on("data", (chunk: Buffer) => {
      if (failed) return;
      lastOutput = Date.now();
      output += chunk.length;
      if (output > OWNER_ACQUISITION_LIMITS.metadataBytes) {
        stop();
        return;
      }
      buffer += decoder.write(chunk);
      for (;;) {
        const newline = buffer.indexOf("\n");
        if (newline < 0) break;
        const value = buffer.slice(0, newline).replace(/\r$/, "");
        buffer = buffer.slice(newline + 1);
        if (Buffer.byteLength(value) > OWNER_ACQUISITION_LIMITS.lineBytes) {
          stop();
          return;
        }
        if (value) {
          try {
            line(value);
          } catch {
            stop();
            return;
          }
        }
      }
      if (Buffer.byteLength(buffer) > OWNER_ACQUISITION_LIMITS.lineBytes)
        stop();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      // Never store a raw extractor exception, URL, filename or title.
      stderr += chunk.length;
      if (stderr > 256 * 1024) stop();
    });
    child.stdin.on("error", stop);
    child.stdin.end(request.input, "utf8");
    child.once("error", stop);
    child.once("close", async (code) => {
      clearTimeout(timeout);
      clearInterval(idle);
      if (force) clearTimeout(force);
      signal.removeEventListener("abort", stop);
      if (failed && process.platform !== "win32" && child.pid) {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
          /* no owned group */
        }
      }
      await termination;
      if (!failed && !signal.aborted && code === 0) {
        try {
          buffer += decoder.end();
          if (buffer.trim()) line(buffer.replace(/\r$/, ""));
          resolve();
        } catch {
          reject(new Error("acquisition_process_failed"));
        }
      } else
        reject(
          new Error(
            signal.aborted
              ? "acquisition_canceled"
              : "acquisition_process_failed",
          ),
        );
    });
  });
};
