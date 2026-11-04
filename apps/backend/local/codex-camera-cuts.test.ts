import { expect, it, vi } from "vitest";
import { createLocalCodexAi } from "./codex-ai.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import type { OwnerWorkspace } from "../../../packages/contracts/local/index.ts";
import type { OwnerMoment } from "../../../packages/contracts/local/selection.ts";
import { ownerFocusAt } from "../../../packages/contracts/local/focus.ts";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

it.each(["measured", "legacy", "outside"])(
  "bounds measured cut guidance before inference and preserves legacy artifacts (%s)",
  async (mode) => {
    const legacy = mode === "legacy";
    const root = await mkdtemp(join(tmpdir(), "clipbuilder-camera-cut-input-"));
    const files = new WorkspaceFiles(root);
    vi.spyOn(files, "codexInput").mockResolvedValue(
      join(root, "artifact.json"),
    );
    vi.spyOn(files, "readCodexInput").mockResolvedValue({
      kind: "frames",
      frames: [{ frame: 0, jpeg: "/9j/", sampleFrames: [0, 6, 12] }],
      ...(legacy ? {} : { sceneCuts: [mode === "outside" ? 240 : 60] }),
    });
    const workspace: OwnerWorkspace = {
      id: crypto.randomUUID(),
      revision: 0,
      mode: "provider-ai",
      source: {
        width: 640,
        height: 360,
        fps: 30,
        durationMs: 8000,
        bytes: 100,
        fingerprint: "a".repeat(64),
      },
    };
    const moment: OwnerMoment = {
      id: crypto.randomUUID(),
      processingIdentity: "b".repeat(64),
      cut: { startFrame: 0, endFrame: 240 },
      rangeIds: [],
      evidence: null,
      cues: [],
    };
    const clipId = crypto.randomUUID();
    const media = vi.fn<Parameters<typeof createLocalCodexAi>[0]["media"]>(
      async (job) => {
        if (job.operation !== "codex-input")
          throw Error("unexpected_synthetic_job");
        return {
          operation: "codex-input",
          jobId: job.jobId,
          kind: "frames",
          bytes: 100,
          digest: "a".repeat(64),
        };
      },
    );
    const infer = vi.fn(
      async (request: { prompt: string; images?: readonly string[] }) => {
        expect(request.prompt).toContain(
          legacy ? "SOURCE CUTS: []" : "SOURCE CUTS: [60]",
        );
        expect(request.prompt).toContain(
          "Never hold the previous shot's geometry",
        );
        expect(request.images).toHaveLength(1);
        return {
          people: [
            {
              id: "person_1",
              observations: [
                {
                  startFrame: 0,
                  endFrame: 74,
                  box: { x: 0.1, y: 0.1, width: 0.2, height: 0.3 },
                },
                {
                  startFrame: 74,
                  endFrame: 240,
                  box: { x: 0.6, y: 0.1, width: 0.2, height: 0.3 },
                },
              ],
            },
          ],
          decisions: [
            {
              startFrame: 74,
              endFrame: 240,
              personId: "person_1",
              speakerId: null,
              evidenceWordIds: [],
              confidence: 0.95,
              shotStart: true,
            },
          ],
          pictures: [],
          texts: [],
          hookSuggestion: null,
        };
      },
    );
    const ai = createLocalCodexAi({ files, media, infer });
    try {
      if (mode === "outside") {
        await expect(
          ai.clipPreparation!.plan(
            { workspace, moment, clipId },
            AbortSignal.timeout(3000),
          ),
        ).rejects.toThrow("codex_input_invalid");
        expect(infer).not.toHaveBeenCalled();
        expect(media).toHaveBeenCalledTimes(1);
        return;
      }
      await ai.clipPreparation!.plan(
        { workspace, moment, clipId },
        AbortSignal.timeout(3000),
      );
      const focus = await ai.clipPreparation!.focus!({
        workspace,
        moment,
        clipId,
      });
      expect(ownerFocusAt(focus!, legacy ? 74 : 60).centerX).toBeCloseTo(0.7);
      expect(ownerFocusAt(focus!, legacy ? 73 : 59).centerX).toBeCloseTo(0.2);
      expect(infer).toHaveBeenCalledTimes(1);
      expect(media).toHaveBeenCalledTimes(1);
    } finally {
      try {
        await ai.close!(AbortSignal.timeout(3000));
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    }
  },
);
