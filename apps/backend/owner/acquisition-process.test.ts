import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { runAcquisitionProcess } from "./acquisition-process.ts";

const roots: string[] = [];
afterEach(async () => {
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
  ).rejects.toThrow(/^acquisition_process_failed$/);
});
