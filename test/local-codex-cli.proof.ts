import { expect, it, vi } from "vitest";
import { createServer } from "node:http";
import { mkdtemp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { z } from "../apps/backend/node_modules/zod/index.js";
import { localCodexFocusSchema } from "../packages/contracts/local/codex.ts";
import {
  createLocalCodexInference,
  findLocalCodex,
  runCodexProcess,
  type CodexProcess,
} from "../apps/backend/local/codex-exec.ts";

it.each([true, false])(
  "installed CLI image/schema regression (original unsupported regex: %s)",
  async (simulateOld) => {
    const executable = await findLocalCodex();
    if (!executable) throw new Error("local_cli_proof_prerequisite_missing");
    const root = await mkdtemp(join(tmpdir(), "clipbuilder-cli-proof-")),
      profile = join(root, "profile");
    await mkdir(profile);
    let requests = 0,
      rejections = 0;
    const server = createServer(async (request, response) => {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      const input = JSON.parse(Buffer.concat(chunks).toString());
      expect(request.url).toBe("/responses");
      expect(request.headers.authorization).toBeUndefined();
      // Simulate the real provider's schema rejection, not just a mock result.
      const schema = JSON.stringify(input.text?.format?.schema);
      if (!schema || /\\\\[pP]\{/u.test(schema)) {
        rejections++;
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            error: {
              type: "invalid_request_error",
              code: "invalid_json_schema",
              message: "Synthetic unsupported Unicode regex",
            },
          }),
        );
        return;
      }
      const parts = input.input.flatMap(
        (item: { content?: { type: string }[] }) => item.content ?? [],
      );
      expect(
        parts.filter((part: { type: string }) => part.type === "input_image"),
      ).toHaveLength(2);
      requests++;
      const text =
          '{"people":[],"decisions":[],"hookSuggestion":null,"pictures":[],"texts":[]}',
        item = {
          id: "msg_synthetic",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text, annotations: [] }],
        };
      response.writeHead(200, { "Content-Type": "text/event-stream" });
      for (const event of [
        {
          type: "response.created",
          response: {
            id: "resp_synthetic",
            object: "response",
            status: "in_progress",
            output: [],
          },
        },
        {
          type: "response.output_item.added",
          output_index: 0,
          item: { ...item, status: "in_progress", content: [] },
        },
        {
          type: "response.content_part.added",
          item_id: item.id,
          output_index: 0,
          content_index: 0,
          part: { type: "output_text", text: "", annotations: [] },
        },
        {
          type: "response.output_text.delta",
          item_id: item.id,
          output_index: 0,
          content_index: 0,
          delta: text,
        },
        {
          type: "response.output_text.done",
          item_id: item.id,
          output_index: 0,
          content_index: 0,
          text,
        },
        { type: "response.output_item.done", output_index: 0, item },
        {
          type: "response.completed",
          response: {
            id: "resp_synthetic",
            object: "response",
            status: "completed",
            output: [item],
            usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
          },
        },
      ])
        response.write(`data: ${JSON.stringify(event)}\n\n`);
      response.end();
    });
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("synthetic_listener_missing");
    const process = vi.fn<CodexProcess>(async (call, signal) => {
      if (call.statusOnly) return "Logged in using ChatGPT";
      const args = [...call.args];
      args.splice(
        1,
        0,
        "-c",
        `model_providers.clipbuilder_subscription.base_url="http://127.0.0.1:${address.port}"`,
      );
      const index = args.indexOf(
        "model_providers.clipbuilder_subscription.requires_openai_auth=true",
      );
      if (index < 0) throw new Error("synthetic_auth_override_missing");
      args[index] =
        "model_providers.clipbuilder_subscription.requires_openai_auth=false";
      if (simulateOld)
        await writeFile(
          call.args[call.args.indexOf("--output-schema") + 1]!,
          JSON.stringify(
            z.toJSONSchema(localCodexFocusSchema, {
              io: "input",
              unrepresentable: "any",
            }),
          ),
        );
      return runCodexProcess(
        {
          ...call,
          args,
          env: {
            ...call.env,
            CODEX_HOME: profile,
            USERPROFILE: profile,
            HOME: profile,
          },
        },
        signal,
      );
    });
    try {
      const image = await sharp({
        create: { width: 16, height: 16, channels: 3, background: "white" },
      })
        .jpeg()
        .toBuffer();
      const infer = createLocalCodexInference({ root, executable, process });
      const result = infer(
        {
          prompt: "Return the synthetic value only.",
          images: [image.toString("base64"), image.toString("base64")],
          schema: z.toJSONSchema(localCodexFocusSchema, {
            io: "input",
            unrepresentable: "any",
          }),
        },
        AbortSignal.timeout(30000),
      );
      if (simulateOld)
        await expect(result).rejects.toThrow("codex_process_failed");
      else
        await expect(result).resolves.toEqual({
          people: [],
          decisions: [],
          hookSuggestion: null,
          pictures: [],
          texts: [],
        });
      expect(process).toHaveBeenCalledTimes(2);
      expect(requests).toBe(simulateOld ? 0 : 1);
      expect(rejections).toBe(simulateOld ? 1 : 0);
      expect(await readdir(root)).toEqual(["profile"]);
    } finally {
      await new Promise<void>((done, fail) =>
        server.close((error) => (error ? fail(error) : done())),
      );
      await rm(root, { recursive: true, force: true });
    }
  },
  45000,
);
