import { Buffer } from "node:buffer";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { openBrowser } from "@remotion/renderer";

const origin = "http://localhost:3000";
const output = fileURLToPath(
  new URL("../public/generated/product-film/", import.meta.url),
);
const viewport = { width: 1440, height: 1000, deviceScaleFactor: 1 };
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  const executable = process.argv.slice(2).find((arg) => arg !== "--");
  if (!executable || !(await stat(executable)).isFile())
    throw new Error("browser_required");
  const response = await fetch(`${origin}/api/sample/config`);
  if (!response.ok) throw new Error("frontend_unavailable");
  const config = await response.json();
  if (
    config.mode !== "fake" ||
    config.sampleEnabled !== true ||
    config.localMediaEnabled !== false ||
    config.liveAnalysisEnabled ||
    config.liveAssemblyEnabled ||
    config.liveRenderEnabled
  )
    throw new Error("fake_mode_required");
  const browser = await openBrowser("chrome", {
    browserExecutable: executable,
    logLevel: "error",
  });
  let page;
  try {
    page = await browser.newPage({
      context: () => null,
      logLevel: "error",
      indent: false,
      pageIndex: 0,
      onBrowserLog: null,
      onLog: () => {},
    });
    await page.setViewport(viewport);
    await page.goto({ url: `${origin}/start`, timeout: 60000 });
    const shots = [];
    await mkdir(output, { recursive: true });
    const snapshot = async (state) => {
      const result = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png" });
      await writeFile(
        new URL(
          `${state}.png`,
          new URL(`file:///${output.replaceAll("\\", "/")}`),
        ),
        Buffer.from(result.value.data, "base64"),
      );
      const targets = await page.evaluate(() =>
        Array.from(document.querySelectorAll("button"))
          .filter((b) => b.offsetWidth > 0)
          .map((b) => {
            const box = b.getBoundingClientRect();
            return {
              label: b.textContent.trim(),
              id: b.id,
              disabled: b.disabled,
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
            };
          }),
      );
      shots.push({ state, file: `${state}.png`, targets });
    };
    const click = async (label) =>
      page.evaluate((text) => {
        const target = Array.from(document.querySelectorAll("button")).find(
          (b) => b.textContent.trim() === text,
        );
        if (!target || target.disabled)
          throw new Error("capture_action_unavailable");
        target.click();
      }, label);
    const waitFor = async (selector, label) => {
      for (let attempt = 0; attempt < 90; attempt++) {
        if (
          await page.evaluate(
            (query, text) =>
              query
                ? Boolean(document.querySelector(query))
                : Array.from(document.querySelectorAll("button")).some(
                    (b) => b.textContent.trim() === text && !b.disabled,
                  ),
            selector,
            label,
          )
        )
          return;
        await pause(500);
      }
      throw new Error("capture_state_timeout");
    };
    await waitFor(null, "Use sample");
    await pause(600);
    await snapshot("intake");
    await click("Use sample");
    await pause(900);
    await snapshot("preparation");
    await waitFor(null, "Find moments");
    await pause(700);
    await snapshot("source");
    await click("Find moments");
    await pause(900);
    await snapshot("analysis");
    await waitFor("#moment-choice-1", null);
    await pause(250);
    await snapshot("candidates");
    await page.evaluate(() =>
      document.querySelector("#moment-choice-1").click(),
    );
    await pause(500);
    await snapshot("selected");
    await click("Proceed");
    await pause(500);
    await snapshot("build");
    await waitFor(null, "Confirm export");
    await pause(600);
    await snapshot("review");
    await click("Confirm export");
    await pause(500);
    await snapshot("render");
    await waitFor('[aria-label="Clip delivery"]', null);
    await pause(600);
    const disabledDownload = await page.evaluate(() =>
      Array.from(document.querySelectorAll("button")).some(
        (b) => b.textContent.trim() === "Download MP4" && b.disabled,
      ),
    );
    if (!disabledDownload) throw new Error("fake_download_expected");
    await snapshot("result");
    await writeFile(
      new URL(
        "capture-index.json",
        new URL(`file:///${output.replaceAll("\\", "/")}`),
      ),
      JSON.stringify(
        {
          version: 1,
          mode: "fake",
          viewport,
          selectedMoment: 1,
          downloadClicked: false,
          shots,
        },
        null,
        2,
      ),
    );
    process.stdout.write(
      "Captured ten synthetic UI states. Disabled download preserved.\n",
    );
  } finally {
    if (page)
      await page
        .evaluate(() =>
          Array.from(document.querySelectorAll("button"))
            .find((b) => b.textContent.trim() === "Exit")
            ?.click(),
        )
        .catch(() => {});
    await browser.close({ silent: true });
  }
}
capture().catch(() => {
  process.stderr.write(
    "film_capture_unavailable: use the documented fake-mode app and an existing Chromium executable. No live fallback is allowed.\n",
  );
  process.exitCode = 1;
});
