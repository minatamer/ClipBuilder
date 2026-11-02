import { describe, expect, it } from "vitest";
import { runOwnedProcess } from "./process-runner.js";
describe("owned native process", () => {
  it("bounds stdout and strips child errors", async () => {
    await expect(
      runOwnedProcess(
        process.execPath,
        ["-e", "process.stdout.write('x'.repeat(10000))"],
        new AbortController().signal,
        { maxStdout: 10, env: {} },
      ),
    ).rejects.toMatchObject({ code: "canceled" });
    await expect(
      runOwnedProcess(
        process.execPath,
        ["-e", "throw Error('synthetic-private-payload')"],
        new AbortController().signal,
        { env: {} },
      ),
    ).rejects.toMatchObject({ code: "media_failed" });
  });
  it("drains an owned process after cancellation", async () => {
    const controller = new AbortController();
    const job = runOwnedProcess(
      process.execPath,
      ["-e", "setInterval(()=>{},1000)"],
      controller.signal,
      { env: {} },
    );
    const check = expect(job).rejects.toMatchObject({ code: "canceled" });
    controller.abort();
    await check;
  });
  it("retains only a classified native reason and exit status through the safe failure cause", async () => {
    await expect(
      runOwnedProcess(
        process.execPath,
        [
          "-e",
          "process.stderr.write('No such filter: synthetic-private-filter-and-path'); process.exitCode=9",
        ],
        new AbortController().signal,
        { env: {} },
      ),
    ).rejects.toMatchObject({
      code: "media_failed",
      cause: { message: "native_filter_unavailable", code: 9 },
    });
  });
});

it("discards noisy stdout only for explicit file-backed jobs and still reports native failures", async () => {
  const result = await runOwnedProcess(
    process.execPath,
    ["-e", "process.stdout.write('synthetic word '.repeat(200000));"],
    new AbortController().signal,
    { env: {}, stdout: "ignore" },
  );
  expect(result).toBe("");
  await expect(
    runOwnedProcess(
      process.execPath,
      [
        "-e",
        "process.stdout.write('synthetic word '.repeat(200000));process.exitCode=7;",
      ],
      new AbortController().signal,
      { env: {}, stdout: "ignore" },
    ),
  ).rejects.toMatchObject({ code: "media_failed", cause: { code: 7 } });
});
it("retains cancellation/reaping when stdout is ignored", async () => {
  const controller = new AbortController();
  const job = runOwnedProcess(
    process.execPath,
    ["-e", "setInterval(()=>process.stdout.write('synthetic'),20)"],
    controller.signal,
    { env: {}, stdout: "ignore" },
  );
  const result = expect(job).rejects.toMatchObject({
    code: "canceled",
    cause: { message: "canceled" },
  });
  controller.abort();
  await result;
});
