import { lstat, open } from "node:fs/promises";
import { spawn } from "node:child_process";
import { MediaFailure } from "./media.failure.js";
export async function runOwnedProcess(
  executable: string,
  args: string[],
  signal: AbortSignal,
  options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    maxStdout?: number;
    stdout?: "ignore";
    stderrFile?: { path: string; maxBytes: number };
    timeoutMs?: number | undefined;
    progress?: { idleMs: number; watchFiles?: readonly string[] };
  } = {},
): Promise<string> {
  signal.throwIfAborted();
  if (
    options.stderrFile &&
    (!Number.isSafeInteger(options.stderrFile.maxBytes) ||
      options.stderrFile.maxBytes < 1 ||
      options.stderrFile.maxBytes > 4 * 1024 ** 2)
  )
    throw new Error("native_stderr_limit_invalid");
  const sink = options.stderrFile
    ? await open(options.stderrFile.path, "wx", 0o600).catch(
        (error: unknown) => {
          const code =
            error instanceof Error && "code" in error ? error.code : undefined;
          throw new MediaFailure(
            "media_failed",
            undefined,
            undefined,
            Object.assign(
              new Error(
                code === "EACCES" || code === "EPERM"
                  ? "native_permission_denied"
                  : "media_failed",
              ),
              { code },
            ),
          );
        },
      )
    : undefined;
  let writes = Promise.resolve(),
    written = 0;
  try {
    signal.throwIfAborted();
    return await new Promise((resolve, reject) => {
      const child = spawn(executable, args, {
        cwd: options.cwd,
        env: options.env,
        windowsHide: true,
        detached: process.platform !== "win32",
        stdio: [
          "ignore",
          options.stdout === "ignore" ? "ignore" : "pipe",
          "pipe",
        ],
      });
      let stdout = "",
        stderr = Buffer.alloc(0),
        overflow = false,
        failure = false,
        idleFailure = false,
        timedOut = false,
        progressBuffer = "",
        lastAdvance = Date.now(),
        probe = Promise.resolve(),
        probing = false,
        forceTimer: ReturnType<typeof setTimeout> | undefined,
        termination: Promise<void> | undefined;
      const counters = new Map<string, number>();
      const files = new Map<string, { size: number; mtime: number }>();
      const stop = () => {
        if (failure) return;
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
      const deadline =
        options.timeoutMs === undefined
          ? undefined
          : setTimeout(() => {
              timedOut = true;
              stop();
            }, options.timeoutMs);
      const idle = options.progress
        ? setInterval(
            () => {
              if (probing) return;
              probing = true;
              probe = (async () => {
                for (const path of options.progress?.watchFiles ?? []) {
                  const info = await lstat(path).catch(() => null);
                  if (!info?.isFile() || info.isSymbolicLink()) continue;
                  const prior = files.get(path);
                  if (
                    !prior ||
                    info.size > prior.size ||
                    info.mtimeMs > prior.mtime
                  ) {
                    lastAdvance = Date.now();
                    files.set(path, { size: info.size, mtime: info.mtimeMs });
                  }
                }
                if (Date.now() - lastAdvance > options.progress!.idleMs) {
                  idleFailure = true;
                  stop();
                }
              })().finally(() => {
                probing = false;
              });
            },
            Math.max(20, Math.min(1000, options.progress.idleMs / 4)),
          )
        : undefined;
      const cleanup = () => {
        if (deadline) clearTimeout(deadline);
        if (idle) clearInterval(idle);
        signal.removeEventListener("abort", stop);
        if (forceTimer) clearTimeout(forceTimer);
      };
      signal.addEventListener("abort", stop, { once: true });
      if (signal.aborted) stop();
      child.stdout?.on("data", (chunk: Buffer) => {
        if (failure) return;
        if (options.progress) {
          progressBuffer += chunk.toString("utf8");
          for (;;) {
            const end = progressBuffer.indexOf("\n");
            if (end < 0) break;
            const line = progressBuffer.slice(0, end).trim();
            progressBuffer = progressBuffer.slice(end + 1);
            if (line.length > 8192) {
              progressBuffer = "";
              overflow = true;
              stop();
              return;
            }
            const value = line.match(/^(frame|out_time_us|total_size)=(\d+)$/);
            if (value) {
              const count = Number(value[2]);
              if (
                Number.isSafeInteger(count) &&
                count > (counters.get(value[1]!) ?? 0)
              ) {
                counters.set(value[1]!, count);
                lastAdvance = Date.now();
              }
            }
          }
          if (Buffer.byteLength(progressBuffer) > 8192) {
            progressBuffer = "";
            overflow = true;
            stop();
          }
          return;
        }
        stdout += chunk.toString("utf8");
        if (Buffer.byteLength(stdout) > (options.maxStdout ?? 65_536)) {
          stdout = "";
          overflow = true;
          stop();
        }
      });
      // A bounded in-memory tail is classified, never returned, logged or saved.
      child.stderr?.on("data", (chunk: Buffer) => {
        stderr = Buffer.concat([stderr, chunk]).subarray(-32768);
        if (!sink || failure) return;
        written += chunk.length;
        if (written > options.stderrFile!.maxBytes) {
          overflow = true;
          stop();
          return;
        }
        writes = writes
          .then(async () => {
            let offset = 0;
            while (offset < chunk.length) {
              const result = await sink.write(
                chunk,
                offset,
                chunk.length - offset,
              );
              if (!result.bytesWritten)
                throw new Error("native_stderr_write_failed");
              offset += result.bytesWritten;
            }
          })
          .catch(() => {
            stop();
          });
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
        await probe;
        await writes;
        const text = stderr.toString("utf8");
        const reason = overflow
          ? "native_stdout_limit"
          : signal.aborted
            ? signal.reason instanceof Error &&
              signal.reason.name === "TimeoutError"
              ? "native_timeout"
              : "canceled"
            : idleFailure
              ? "native_progress_stalled"
              : timedOut
                ? "native_timeout"
                : /no space left on device/i.test(text)
                  ? "native_disk_full"
                  : /permission denied|access is denied/i.test(text)
                    ? "native_permission_denied"
                    : /matches no streams|does not contain any stream/i.test(
                          text,
                        )
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
                              : /cannot allocate memory|out of memory/i.test(
                                    text,
                                  )
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
  } finally {
    await writes;
    await sink?.close();
  }
}
