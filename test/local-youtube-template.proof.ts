import { expect, it } from "vitest";
import { createServer } from "node:http";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { ownerAcquisitionTools } from "../apps/backend/local/acquisition-tools.ts";
import { ytDlpAcquisitionInput } from "../apps/backend/local/yt-dlp-acquisition.ts";
import { runAcquisitionProcess } from "../apps/backend/local/acquisition-process.ts";
import { listenOwner } from "./owner-http.ts";

it("expands the generated completion marker with pinned yt-dlp and no network/media", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-youtube-template-"));
  let requests = 0;
  const proxy = createServer((_req, res) => {
    requests++;
    res.writeHead(403).end();
  });
  proxy.on("connect", (_req, socket) => {
    requests++;
    socket.destroy();
  });
  try {
    const port = await listenOwner(proxy);
    const tools = await ownerAcquisitionTools(
      resolve("."),
      process.env.SystemRoot,
      AbortSignal.timeout(30000),
    );
    const input = ytDlpAcquisitionInput({
      canonicalUrl: "https://www.youtube.com/watch?v=SYNTHETIC01",
      proxy: "http://owner:" + "a".repeat(64) + "@127.0.0.1:" + port,
      challenge: tools.challenge,
      action: "video",
      formatId: "synthetic",
      output: join(root, "acquisition.video"),
    });
    const template = /'after_move:([^']+)'/.exec(input)?.[1];
    if (!template) throw new Error("completion_template_missing");
    const file = join(root, "synthetic-info.json");
    await writeFile(
      file,
      JSON.stringify({
        id: "SYNTHETIC01",
        title: "Synthetic",
        url: "https://synthetic.invalid/video.mp4",
        ext: "mp4",
        webpage_url: "https://synthetic.invalid/video",
        extractor: "generic",
        extractor_key: "Generic",
      }),
    );
    const lines: string[] = [];
    await runAcquisitionProcess(
      {
        executable: tools.downloader,
        args: [
          "--ignore-config",
          "--no-plugin-dirs",
          "--no-remote-components",
          "--no-js-runtimes",
          "--simulate",
          "--no-check-formats",
          "--proxy",
          "http://127.0.0.1:" + port,
          "--load-info-json",
          file,
          "--print",
          "CB_DONE",
          "--print",
          template,
        ],
        input: "",
        cwd: root,
        env: {
          SystemRoot: tools.systemRoot,
          WINDIR: tools.systemRoot,
          TEMP: root,
          TMP: root,
        },
        timeoutMs: 30000,
      },
      (line) => lines.push(line),
      AbortSignal.timeout(35000),
    );
    expect(lines).toEqual(["NA", "CB_DONE"]);
    expect(requests).toBe(0);
  } finally {
    proxy.closeAllConnections();
    await new Promise<void>((done) => proxy.close(() => done()));
    expect(resolve(root, "..")).toBe(resolve(tmpdir()));
    await rm(root, { recursive: true, force: true });
  }
}, 45000);
