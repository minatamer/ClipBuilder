import { expect, it, vi } from "vitest";
import { createServer, type ServerResponse } from "node:http";
import { mkdtemp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { codexImageDiscovery } from "../apps/backend/local/codex-composition.ts";
import {
  codexEnvironment,
  createLocalCodexInference,
  findLocalCodex,
  runCodexProcess,
  type CodexProcess,
} from "../apps/backend/local/codex-exec.ts";
import { WebPictureSource } from "../apps/backend/src/assembly/web-pictures.ts";
import type { ExecutionTrace } from "../packages/contracts/local/execution-diagnostics.ts";

function streamItem(response: ServerResponse, item: object) {
  response.writeHead(200, { "Content-Type": "text/event-stream" });
  for (const event of [
    {
      type: "response.created",
      response: { id: "resp_synthetic", status: "in_progress", output: [] },
    },
    { type: "response.output_item.added", output_index: 0, item },
    { type: "response.output_item.done", output_index: 0, item },
    {
      type: "response.completed",
      response: {
        id: "resp_synthetic",
        status: "completed",
        output: [item],
        usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
      },
    },
  ])
    response.write(`data: ${JSON.stringify(event)}\n\n`);
  response.end();
}

it.each([
  { mode: "working", query: "synthetic coral reef" },
  { mode: "working", query: "synthetic satellite launch" },
  { mode: "disabled-host", query: "synthetic coral reef" },
  { mode: "missing-tool", query: "synthetic coral reef" },
  { mode: "failed-search", query: "synthetic coral reef" },
  { mode: "canceled-search", query: "synthetic coral reef" },
])(
  "installed CLI executes the advertised image search (%j)",
  async ({ mode, query }) => {
    const executable = await findLocalCodex();
    if (!executable) throw new Error("local_cli_proof_prerequisite_missing");
    const root = await mkdtemp(join(tmpdir(), "clipbuilder-search-proof-"));
    const profile = join(root, "profile");
    await mkdir(profile);
    // Synthetic local auth exercises the same tool-host branch as ChatGPT auth.
    // All service destinations below point to our loopback server; the proxy
    // rejects any unexpected external connection. No owner profile is read.
    const token =
      Buffer.from('{"alg":"none"}').toString("base64url") +
      "." +
      Buffer.from(
        JSON.stringify({
          exp: 4102444800,
          email: "synthetic@example.test",
          "https://api.openai.com/auth": {
            chatgpt_account_id: "synthetic-account",
            chatgpt_plan_type: "pro",
          },
        }),
      ).toString("base64url") +
      ".synthetic";
    await writeFile(
      join(profile, "auth.json"),
      JSON.stringify({
        auth_mode: "chatgpt",
        OPENAI_API_KEY: null,
        tokens: {
          id_token: token,
          access_token: token,
          refresh_token: "synthetic-unused",
          account_id: "synthetic-account",
        },
        last_refresh: new Date().toISOString(),
      }),
    );
    const environment = {
      ...codexEnvironment(root),
      CODEX_HOME: profile,
      USERPROFILE: profile,
      HOME: profile,
    };
    const catalog = join(root, "models.json");
    const failures: unknown[] = [];
    let modelRequests = 0,
      searchRequests = 0,
      proxyRequests = 0;
    const traces: ExecutionTrace[] = [];
    const resultUrl = "https://images.example.test/arbitrary.png";
    const alternate = `${query} closeup`;
    const returned: string[] = [];
    const server = createServer(async (request, response) => {
      try {
        // Every unexpected destination is refused, including HTTP proxy traffic.
        if (!request.url?.startsWith("/")) {
          proxyRequests++;
          response.writeHead(502).end();
          return;
        }
        const chunks: Buffer[] = [];
        for await (const chunk of request) chunks.push(Buffer.from(chunk));
        if (request.url === "/alpha/search") {
          searchRequests++;
          expect(request.method).toBe("POST");
          const input = JSON.parse(Buffer.concat(chunks).toString());
          expect(input.commands).toEqual({
            image_query: [{ q: query }, { q: alternate }],
            response_length: "short",
          });
          expect(input.settings.external_web_access).toBe(true);
          if (mode === "canceled-search") return;
          if (mode === "failed-search") {
            response.writeHead(503, { "Content-Type": "application/json" });
            response.end('{"error":"Synthetic search unavailable"}');
            return;
          }
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(
            JSON.stringify({ output: `Synthetic image: ${resultUrl}` }),
          );
          return;
        }
        if (request.url !== "/responses") {
          expect(request.method).toBe("GET");
          expect([
            "/api/codex/accounts/check",
            "/api/codex/settings/user",
          ]).toContain(request.url);
          response
            .writeHead(404, { "Content-Type": "application/json" })
            .end("{}");
          return;
        }
        modelRequests++;
        expect(request.headers.authorization).toBe(`Bearer ${token}`);
        const input = JSON.parse(Buffer.concat(chunks).toString());
        const definitions = JSON.stringify(
          input.input.filter(
            (item: { type: string }) => item.type === "additional_tools",
          ),
        );
        expect(definitions.includes("declare const tools: { web__run")).toBe(
          mode !== "missing-tool",
        );
        // Enabling the host must not re-enable shell/files, generation, apps,
        // browser or subagents. Inspect actual executable tool definitions.
        const nestedTools = Array.from(
          definitions.matchAll(/declare const tools: \{ ([a-z_\d]+)/g),
          (match) => match[1],
        );
        expect(nestedTools).toEqual(
          mode === "missing-tool" ? [] : ["web__run"],
        );
        expect(input.text.format.schema.additionalProperties).toBe(false);
        expect(
          input.text.format.schema.properties.candidates.items
            .additionalProperties,
        ).toBe(false);
        if (modelRequests === 1) {
          streamItem(response, {
            id: "code_synthetic",
            type: "custom_tool_call",
            namespace: "functions",
            name: "exec",
            call_id: "call_synthetic",
            input: `if ([tools.exec_command, tools.apply_patch, tools.image_gen__imagegen, tools.clock__sleep].some(tool => typeof tool !== "undefined")) throw new Error("non_search_tool_exposed"); text(await tools.web__run(${JSON.stringify({ image_query: [{ q: query }, { q: alternate }], response_length: "short" })}));`,
          });
        } else {
          expect(modelRequests).toBe(2);
          const output = input.input.find(
            (item: { type: string }) => item.type === "custom_tool_call_output",
          );
          expect(output).toBeDefined();
          returned.push(JSON.stringify(output.output));
          if (mode === "working") expect(returned[0]).toContain(resultUrl);
          streamItem(response, {
            id: "msg_synthetic",
            type: "message",
            role: "assistant",
            status: "completed",
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  candidates: [{ url: resultUrl, kind: "image" }],
                }),
                annotations: [],
              },
            ],
          });
        }
      } catch (error) {
        failures.push(error);
        response.writeHead(500).end();
      }
    });
    server.on("connect", (_request, socket) => {
      proxyRequests++;
      socket.end("HTTP/1.1 502 Bad Gateway\r\n\r\n");
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("fake_listener_missing");
    const origin = `http://127.0.0.1:${address.port}`;
    const execute = vi.fn<CodexProcess>(async (call, signal) => {
      if (call.statusOnly) return "Logged in using ChatGPT";
      const args = [...call.args];
      args.push(
        "-c",
        `model_providers.clipbuilder_subscription.base_url="${origin}"`,
        "-c",
        `chatgpt_base_url="${origin}"`,
        "-c",
        `openai_base_url="${origin}"`,
        "-c",
        "features.enable_request_compression=false",
        "-c",
        'cli_auth_credentials_store="file"',
        "-c",
        `model_catalog_json=${JSON.stringify(catalog)}`,
      );
      if (mode === "disabled-host")
        args.push("-c", "features.code_mode_host=false");
      if (mode === "missing-tool")
        args.push(
          "-c",
          'features.code_mode.excluded_tool_namespaces=["functions","image_gen","clock","collaboration","web"]',
        );
      return runCodexProcess(
        {
          ...call,
          args,
          env: {
            ...environment,
            HTTP_PROXY: origin,
            HTTPS_PROXY: origin,
            ALL_PROXY: origin,
            NO_PROXY: "127.0.0.1,localhost",
          },
        },
        signal,
      );
    });
    try {
      // Public bundled metadata only; no catalog refresh or provider request.
      await writeFile(
        catalog,
        await runCodexProcess(
          {
            executable,
            args: ["debug", "models", "--bundled"],
            cwd: root,
            env: environment,
            input: "",
            stdoutBytes: 4 * 1024 ** 2,
          },
          AbortSignal.timeout(5000),
        ),
      );
      const image = await sharp({
        create: {
          width: 16,
          height: 16,
          channels: 3,
          background: "white",
        },
      })
        .jpeg()
        .toBuffer();
      const retrieve = vi.fn(async (url: URL) => {
        expect(url.href).toBe(resultUrl);
        return { bytes: image, contentType: "image/jpeg", url };
      });
      const infer = createLocalCodexInference({
        root,
        executable,
        process: execute,
        observe: (entry) => traces.push(entry),
      });
      const source = new WebPictureSource(
        codexImageDiscovery(infer),
        undefined,
        retrieve,
      );
      const result = source.find(
        {
          kind: "object",
          brief: {
            scene: query,
            searchQuery: query,
            requiredTerms: [],
            avoidTerms: [],
          },
        },
        AbortSignal.timeout(mode === "canceled-search" ? 3000 : 10000),
      );
      if (mode === "working")
        await expect(result).resolves.toMatchObject({
          repository: "web",
          width: 16,
          height: 16,
        });
      else await expect(result).rejects.toThrow();
      expect(failures).toEqual([]);
      expect(proxyRequests).toBe(0);
      expect(execute).toHaveBeenCalledTimes(2); // status + one discovery agent turn
      expect(modelRequests).toBe(mode === "canceled-search" ? 1 : 2);
      expect(searchRequests).toBe(
        ["disabled-host", "missing-tool"].includes(mode) ? 0 : 1,
      );
      expect(retrieve).toHaveBeenCalledTimes(mode === "working" ? 1 : 0);
      if (mode === "working")
        expect(traces).toContainEqual(
          expect.objectContaining({
            phase: "events",
            outcome: "succeeded",
            events: expect.objectContaining({
              searchesStarted: 1,
              searchesCompleted: 1,
            }),
          }),
        );
      if (mode === "disabled-host") {
        expect(returned[0]).toContain("code-mode host is disabled");
        expect(traces).toContainEqual(
          expect.objectContaining({
            outcome: "warning",
            error: expect.objectContaining({
              category: "cli_configuration",
              cliOption: "code_mode_host",
            }),
          }),
        );
      }
      if (mode === "failed-search")
        expect(traces).toContainEqual(
          expect.objectContaining({
            phase: "events",
            outcome: "failed",
            error: expect.objectContaining({ category: "search_incomplete" }),
          }),
        );
      if (mode === "canceled-search")
        expect(traces).toContainEqual(
          expect.objectContaining({
            phase: "process",
            outcome: "canceled",
            error: expect.objectContaining({ category: "timeout" }),
          }),
        );
      expect((await readdir(root)).sort()).toEqual(["models.json", "profile"]);
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await rm(root, { recursive: true, force: true });
    }
  },
  20000,
);
