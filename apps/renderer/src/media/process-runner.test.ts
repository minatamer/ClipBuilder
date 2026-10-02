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
});
