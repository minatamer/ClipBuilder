import { Buffer } from "node:buffer";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import process from "node:process";
import { openBrowser } from "@remotion/renderer";

// Isolated authoring: no owner's app, media, environment files or provider calls.
const require = createRequire(import.meta.url);
const remotionRequire = createRequire(
  require.resolve("@remotion/cli/package.json"),
);
const { register } = await import(
  pathToFileURL(remotionRequire.resolve("tsx/esm/api")).href
);
register();
await import("../../../test/deterministic.environment.ts");
const { startHookEditorFixture } =
  await import("../../../test/owner-hook-browser-fixture.ts");
const sharp = (await import("../../backend/node_modules/sharp/dist/index.mjs"))
  .default;
const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(
  new URL("../public/generated/product-film/", import.meta.url),
);
const viewport = { width: 1440, height: 1000, deviceScaleFactor: 1 };
const pause = (ms) => new Promise((done) => setTimeout(done, ms));

async function capture() {
  const executable = process.argv.slice(2).find((arg) => arg !== "--");
  if (!executable || !(await stat(executable)).isFile())
    throw Error("browser_required");
  process.chdir(root);
  // Original fictional vector artwork, independent of any real conversation or AI result.
  const sourceArtwork = await sharp(
    Buffer.from(
      `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="wall" x2="0" y2="1"><stop stop-color="#172f56"/><stop offset="1" stop-color="#07142f"/></linearGradient></defs><rect width="1280" height="720" fill="url(#wall)"/><g stroke="#2b4770" stroke-width="8"><path d="M80 0v520M160 0v520M240 0v520M1040 0v520M1120 0v520M1200 0v520"/></g><circle cx="400" cy="267" r="90" fill="#dca58a"/><path d="M306 256q-12-123 93-113 115-14 98 126l-34-58q-69 36-143 4" fill="#142137"/><path d="M255 565q-3-188 93-213h108q100 33 100 213" fill="#416bb2"/><circle cx="881" cy="264" r="89" fill="#b17a60"/><path d="M790 265q-15-139 108-121 91 7 76 133l-34-68q-70 35-141 8" fill="#252635"/><path d="M736 565q0-185 94-213h108q101 31 102 213" fill="#b9c9e3"/><path d="M356 274h28m39 0h27m385 0h27m40 0h27" stroke="#182335" stroke-width="7" stroke-linecap="round"/><path d="M380 315q20 18 41 0m440 0q20 18 41 0" stroke="#754a41" stroke-width="5" fill="none"/><rect x="68" y="555" width="1144" height="110" rx="32" fill="#17213b"/><g fill="#071021" stroke="#4d668c" stroke-width="6"><rect x="527" y="359" width="45" height="122" rx="22"/><path d="m550 480-40 76h90" fill="none"/><rect x="670" y="359" width="45" height="122" rx="22"/><path d="m692 480-40 76h90" fill="none"/></g><text x="640" y="70" text-anchor="middle" fill="#94b6e5" font-family="sans-serif" font-size="22" letter-spacing="5">THE CREATIVE CONVERSATION</text></svg>`,
    ),
  )
    .png()
    .toBuffer();
  const pictureArtwork = await sharp(
    Buffer.from(
      `<svg width="480" height="480" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="480" rx="28" fill="#214d98"/><circle cx="240" cy="180" r="100" fill="#70a6ff"/><path d="m196 181 32 33 62-67" fill="none" stroke="white" stroke-width="20" stroke-linecap="round"/><text x="240" y="348" text-anchor="middle" fill="white" font-family="sans-serif" font-size="30" font-weight="700">A clear idea.</text></svg>`,
    ),
  )
    .png()
    .toBuffer();
  const configure = (clip) => {
    const words = ["Every", "idea", "deserves", "context."];
    const content = (value) => {
      value.words.forEach((word) => {
        const i = Number(word.id.slice(2)) - 1;
        word.text = words[i];
        word.punctuatedText = words[i];
      });
      value.captions.forEach((caption) => {
        caption.wordCues.forEach((word) => {
          const i = Number(word.wordId.slice(2)) - 1;
          word.text = words[i];
        });
        caption.text = caption.wordCues.map((word) => word.text).join(" ");
        caption.lines = [caption.text];
      });
    };
    content({ words: clip.base.words, captions: clip.base.overlay.captions });
    content(clip.edit.hookContent);
    for (const edit of [clip.edit, clip.edit.hookContent.edits]) {
      edit.texts[0].text = "Every idea deserves context";
      edit.texts = edit.texts.slice(0, 1);
      edit.visuals = edit.visuals.slice(0, 1);
    }
  };
  let editor, moments, browser;
  try {
    editor = await startHookEditorFixture(undefined, {
      workflowScreens: true,
      sourceArtwork,
      pictureArtwork,
      configure,
    });
    moments = await startHookEditorFixture(undefined, {
      workflowScreens: true,
      momentsLayout: true,
      manyMomentCount: 3,
      durationFrames: 1800,
      sourceArtwork,
      pictureArtwork,
    });
    browser = await openBrowser("chrome", {
      browserExecutable: executable,
      chromiumOptions: { headless: true },
      logLevel: "error",
    });
    const page = await browser.newPage({
      context: () => null,
      logLevel: "error",
      indent: false,
      pageIndex: 0,
      onBrowserLog: null,
      onLog: () => {},
    });
    let external = 0;
    const client = page._client();
    client.on("Fetch.requestPaused", (event) => {
      const url = new URL(event.request.url);
      const allowed =
        ["localhost", "127.0.0.1"].includes(url.hostname) ||
        ["data:", "blob:"].includes(url.protocol);
      if (!allowed) external++;
      void client.send(
        allowed ? "Fetch.continueRequest" : "Fetch.failRequest",
        {
          requestId: event.requestId,
          ...(!allowed ? { errorReason: "BlockedByClient" } : {}),
        },
      );
    });
    await client.send("Fetch.enable", {
      patterns: [{ urlPattern: "*", requestStage: "Request" }],
    });
    await page.setViewport(viewport);
    await mkdir(output, { recursive: true });
    const shots = [];
    const wait = async (selector) => {
      for (let i = 0; i < 200; i++) {
        if (
          await page.evaluate(
            (query) => Boolean(document.querySelector(query)),
            selector,
          )
        )
          return;
        await pause(25);
      }
      throw Error("capture_state_timeout");
    };
    const snapshot = async (state) => {
      if (state !== "analysis")
        await page.evaluate(async () => {
          const video = document.querySelector(".source-preview video");
          if (!video || !video.getClientRects().length) return;
          video.muted = true;
          await video.play();
          await new Promise((done) => video.requestVideoFrameCallback(done));
          video.pause();
        });
      await pause(250);
      const result = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png" });
      await writeFile(
        `${output}/${state}.png`,
        Buffer.from(result.value.data, "base64"),
      );
      const targets = await page.evaluate(() =>
        Array.from(document.querySelectorAll("button,a[href],video"))
          .filter((n) => n.getClientRects().length && !n.closest("[hidden]"))
          .map((n) => ({
            label: n.getAttribute("aria-label") ?? n.textContent.trim(),
            rect: n.getBoundingClientRect().toJSON(),
          })),
      );
      const regions = await page.evaluate(() =>
        Array.from(document.querySelectorAll(".editor-preview,.moment-card"))
          .filter((n) => n.getClientRects().length && !n.closest("[hidden]"))
          .map((n) => ({
            kind: n.matches(".moment-card") ? "card" : "editor",
            rect: n.getBoundingClientRect().toJSON(),
          })),
      );
      shots.push({ state, targets, regions });
    };
    await page.goto({
      url: new URL("intake.html", moments.url).href,
      timeout: 15000,
    });
    await wait(".upload-card input");
    await snapshot("intake");
    await page.goto({
      url: new URL("moments.html", moments.url).href,
      timeout: 15000,
    });
    await wait(".source-preview video");
    await snapshot("preparation");
    await page.evaluate(() =>
      [...document.querySelectorAll("label")]
        .find((n) => n.textContent.trim() === "Suggest clips")
        .querySelector("input")
        .click(),
    );
    await snapshot("source");
    await page.evaluate(() =>
      [...document.querySelectorAll("button")]
        .find((n) => n.textContent.trim() === "Find moments")
        .click(),
    );
    await wait(".moments-processing");
    await snapshot("analysis");
    await page.goto({
      url: new URL("moments-many.html", moments.url).href,
      timeout: 15000,
    });
    await wait(".moment-card");
    await snapshot("candidates");
    await page.evaluate(() =>
      document.querySelector('[aria-label="Jump to clip 1"]').click(),
    );
    await snapshot("selected");
    editor.clip.state = "queued";
    await page.goto({ url: editor.url, timeout: 15000 });
    await wait(".clip-preparing");
    await snapshot("build");
    editor.clip.state = "ready";
    await wait(".editor-panels:not([hidden])");
    await snapshot("review");
    editor.clip.state = "rendering";
    await wait(".clip-preparing");
    await snapshot("render");
    editor.clip.state = "ready";
    await wait(".editor-panels:not([hidden])");
    await snapshot("result");
    if (
      external ||
      editor.counts().unexpected ||
      moments.counts().unexpected ||
      editor.counts().edits
    )
      throw Error("capture_unexpected_work");
    await writeFile(
      `${output}/capture-index.json`,
      JSON.stringify(
        {
          version: 2,
          mode: "fake",
          viewport,
          providerCalls: 0,
          downloadClicked: false,
          shots,
        },
        null,
        2,
      ),
    );
    process.stdout.write(
      "Captured ten current-workspace illustration states; no providers or owner session used.\n",
    );
  } finally {
    await browser?.close({ silent: true });
    await moments?.close();
    await editor?.close();
  }
}
capture().catch(async (error) => {
  await writeFile(
    new URL(
      "../../../.local-build/film-capture-diagnostic.txt",
      import.meta.url,
    ),
    String(error?.stack ?? error),
  );
  process.stderr.write(
    "film_capture_unavailable: private local diagnostic saved; no live fallback.\n",
  );
  process.exitCode = 1;
});
