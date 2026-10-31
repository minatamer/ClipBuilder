import { expect, it } from "vitest";
import { LocalCodexProgress } from "./codex-progress.ts";
import { LocalDiagnostics } from "./diagnostics.ts";

it("isolates snapshots, records actual outcomes and discards expired workspace progress", async () => {
  const lines: string[] = [];
  const progress = new LocalCodexProgress(
    new LocalDiagnostics((line) => lines.push(line)),
  );
  const workspaceId = crypto.randomUUID();
  const run = progress.begin(workspaceId, ["planning"]);
  expect(progress.snapshot(crypto.randomUUID())).toBeNull();
  await progress.measure(
    run,
    "planning",
    new AbortController().signal,
    async () => "synthetic",
  );
  expect(progress.snapshot(workspaceId)?.steps[0]?.state).toBe("done");
  await expect(
    progress.measure(
      run,
      "pictures",
      new AbortController().signal,
      async () => {
        throw Error("synthetic-private-content");
      },
    ),
  ).rejects.toThrow();
  expect(progress.snapshot(workspaceId)?.steps[1]?.state).toBe("failed");
  expect(lines.join("")).not.toContain("synthetic-private-content");
  progress.clear(workspaceId);
  expect(progress.snapshot(workspaceId)).toBeNull();
});
