import { expect, it, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runOwnedProcess } from "../src/media/process-runner.ts";
const roots: string[] = [];
afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});
const run = (
  code: string,
  progress: { idleMs: number; watchFiles?: readonly string[] },
) =>
  runOwnedProcess(
    process.execPath,
    ["-e", code],
    new AbortController().signal,
    { env: {}, progress },
  );
it("streams more than the old stdout budget without retaining progress output", async () => {
  expect(
    await run(
      "for(let n=1;n<40000;n++)process.stdout.write('frame='+n+'\\nprogress=continue\\n');",
      { idleMs: 2000 },
    ),
  ).toBe("");
});
it("keeps genuinely advancing work alive across repeated idle periods", async () => {
  expect(
    await run(
      "let n=0;const t=setInterval(()=>{process.stdout.write('out_time_us='+(++n*100000)+'\\n');if(n===25)clearInterval(t);},60);",
      { idleMs: 600 },
    ),
  ).toBe("");
});
it.each(["", "process.stdout.write('frame=1\\nprogress=continue\\n');"])(
  "reaps a silent or frozen process despite heartbeat spam (%s)",
  async (spam) => {
    await expect(
      run(`setInterval(()=>{${spam}},50);`, { idleMs: 600 }),
    ).rejects.toMatchObject({ cause: { message: "native_progress_stalled" } });
  },
);
it("accepts real output rewrites during a faststart-like phase with stationary media counters", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-native-activity-"));
  roots.push(root);
  const file = join(root, "synthetic.tmp");
  // Allow Windows child startup; steady rewrites still outlast the idle grace.
  const code = `const fs=require('node:fs');let n=0;const t=setInterval(()=>{fs.writeFileSync(process.argv[1],String(++n%10));if(n===50)clearInterval(t);},60);`;
  expect(
    await runOwnedProcess(
      process.execPath,
      ["-e", code, file],
      new AbortController().signal,
      { env: {}, progress: { idleMs: 2000, watchFiles: [file] } },
    ),
  ).toBe("");
});
it("keeps progress record bounds and independent metadata deadlines", async () => {
  await expect(
    run("process.stdout.write('x'.repeat(9000));setInterval(()=>{},1000);", {
      idleMs: 600,
    }),
  ).rejects.toMatchObject({ cause: { message: "native_stdout_limit" } });
  await expect(
    runOwnedProcess(
      process.execPath,
      ["-e", "setInterval(()=>{},1000)"],
      new AbortController().signal,
      { env: {}, timeoutMs: 150 },
    ),
  ).rejects.toMatchObject({ cause: { message: "native_timeout" } });
});
it("cancels active progress promptly rather than waiting for an idle timeout", async () => {
  const controller = new AbortController();
  const work = runOwnedProcess(
    process.execPath,
    [
      "-e",
      "let n=0;setInterval(()=>process.stdout.write('frame='+(++n)+'\\n'),50)",
    ],
    controller.signal,
    { env: {}, progress: { idleMs: 5000 } },
  );
  const check = expect(work).rejects.toMatchObject({
    code: "canceled",
    cause: { message: "canceled" },
  });
  setTimeout(() => controller.abort(), 300);
  await check;
});
