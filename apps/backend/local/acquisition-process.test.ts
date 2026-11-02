import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { runAcquisitionProcess } from "./acquisition-process.ts";

const roots: string[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});
async function request(script: string, input = "") {
  const cwd = await mkdtemp(join(tmpdir(), "clipbuilder-acquisition-process-"));
  roots.push(cwd);
  return {
    executable: process.execPath,
    args: ["-e", script],
    input,
    cwd,
    env: {},
    timeoutMs: 5000,
  };
}
it("passes private stdin, decodes split UTF8, and exposes only the line callback", async () => {
  const lines: string[] = [];
  const execution = await request(
    "let input='';process.stdin.on('data',c=>input+=c);process.stdin.on('end',()=>{if(input!=='synthetic-private-input')process.exit(2); const bytes=Buffer.from('CB:✓\\n');process.stdout.write(bytes.subarray(0,4));setTimeout(()=>process.stdout.write(bytes.subarray(4)),10);});",
    "synthetic-private-input",
  );
  await runAcquisitionProcess(
    execution,
    (line) => lines.push(line),
    new AbortController().signal,
  );
  expect(lines).toEqual(["CB:✓"]);
});
it("turns raw stderr and nonzero exits into a content-free failure", async () => {
  const execution = await request(
    "process.stderr.write('synthetic-sensitive-stderr');process.exitCode=4;",
  );
  await expect(
    runAcquisitionProcess(
      execution,
      () => undefined,
      new AbortController().signal,
    ),
  ).rejects.toThrow(/^acquisition_process_failed$/);
});
it.each([
  ["acquisition_progress_invalid", "acquisition_progress_invalid"],
  ["synthetic-private-provider-detail", "acquisition_process_failed"],
])(
  "preserves only whitelisted parser failure codes (%s)",
  async (message, expected) => {
    const execution = await request(
      "process.stdout.write('CB_RECORD\\n');setInterval(()=>{},1000);",
    );
    await expect(
      runAcquisitionProcess(
        execution,
        () => {
          throw new Error(message);
        },
        new AbortController().signal,
      ),
    ).rejects.toThrow(new RegExp(`^${expected}$`));
  },
);
it("bounds an unterminated stdout record and drains the child", async () => {
  const execution = await request(
    "process.stdout.write('x'.repeat(2*1024*1024));setInterval(()=>{},1000);",
  );
  await expect(
    runAcquisitionProcess(
      execution,
      () => undefined,
      new AbortController().signal,
    ),
  ).rejects.toThrow(/^acquisition_process_failed$/);
});
it("cancels the owned child and its running descendant before returning", async () => {
  const controller = new AbortController();
  const ids: number[] = [];
  const execution = await request(
    "const{spawn}=require('node:child_process');const child=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore',windowsHide:true});child.once('spawn',()=>process.stdout.write('READY:'+process.pid+':'+child.pid+'\\n'));setInterval(()=>{},1000);",
  );
  await expect(
    runAcquisitionProcess(
      execution,
      (line) => {
        ids.push(...line.split(":").slice(1).map(Number));
        controller.abort();
      },
      controller.signal,
    ),
  ).rejects.toThrow(/^acquisition_canceled$/);
  expect(ids).toHaveLength(2);
  for (const pid of ids) expect(() => process.kill(pid, 0)).toThrow();
});
it("enforces the operation deadline even when the child never emits progress", async () => {
  const execution = await request("setInterval(()=>{},1000);");
  await expect(
    runAcquisitionProcess(
      { ...execution, timeoutMs: 100 },
      () => undefined,
      new AbortController().signal,
    ),
  ).rejects.toThrow(/^acquisition_timed_out$/);
});

it("does not treat repeated validated byte counters or arbitrary stderr as download progress", async () => {
  const execution = await request(
    "process.stdout.write('5\\n');setInterval(()=>{process.stdout.write('5\\n');process.stderr.write('still alive');},50);",
  );
  const start = Date.now(),
    clock = vi.spyOn(Date, "now").mockReturnValue(start);
  let shifted = false;
  await expect(
    runAcquisitionProcess(
      { ...execution, timeoutMs: null, streaming: true },
      (line) => {
        if (!shifted) {
          shifted = true;
          setTimeout(() => clock.mockReturnValue(start + 31_000), 20);
        }
        return Number(line);
      },
      new AbortController().signal,
    ),
  ).rejects.toThrow(/^acquisition_stalled$/);
});
it("counts advancing external-FFmpeg media time as section progress without retaining stderr", async () => {
  const execution = await request(
    "let n=0;const t=setInterval(()=>{process.stderr.write('time=00:00:'+String(++n).padStart(2,'0')+'.00\\r');if(n===20)clearInterval(t);},100);",
  );
  const start = Date.now(),
    monotonicStart = performance.now();
  // Simulate more than a minute of active work without clock-step races.
  vi.spyOn(Date, "now").mockImplementation(
    () => start + (performance.now() - monotonicStart) * 40,
  );
  await runAcquisitionProcess(
    { ...execution, timeoutMs: null, streaming: true },
    () => {},
    new AbortController().signal,
  );
});
