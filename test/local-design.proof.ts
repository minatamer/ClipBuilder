import { expect, it, vi } from "vitest";
import { createServer } from "node:http";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { prepareLocalControlsFixture } from "./owner-controls-browser.ts";
import { listenOwner } from "./owner-http.ts";
import { sampleOwnerResources } from "./owner-resource-sampler.ts";
import { fakeOwnerAcquisition } from "../apps/backend/local/fake-acquisition.ts";
import { canonicalOwnerYoutubeSource } from "../apps/backend/local/youtube-url.ts";
import {
  ownerSavedSourceVariantSchema,
  ownerYoutubeOfferSchema,
} from "../packages/contracts/local/acquisition.ts";
import { ownerSourceImportSchema } from "../packages/contracts/local/acquisition-flow.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import {
  ownerAnalysisInputsSchema,
  ownerAnalysisSchema,
  ownerCut,
} from "../packages/contracts/local/selection.ts";

type IntakeLayout = {
  width: number;
  sideBySide: boolean;
  stacked: boolean;
  equalColumns: boolean;
  rootOverflow: boolean;
  contentOverflow: boolean;
  smallestTarget: number;
  sampleEntryAbsent: boolean;
  uploadActions: number;
  nativePickerHidden: boolean;
  continueDisabled: boolean;
  focusWidth: number;
  modeLabelAbsent: boolean;
  librariesAbsent: boolean;
  navbarPadding: number;
  navbarClearance: number;
  frameBottom: number;
  viewportHeight: number;
};
type StartupLayout = {
  inputsAbsent: boolean;
  visible: boolean;
  overflow: boolean;
  spinner: boolean;
};
declare global {
  function clipbuilderIntakeReady(): Promise<boolean>;
  function clipbuilderIntakeLayout(): IntakeLayout;
  function clipbuilderResolveLink(): Promise<boolean>;
  function clipbuilderDownloadAndCancel(): Promise<boolean>;
  function clipbuilderFinishDownload(): Promise<boolean>;
  function clipbuilderWaitDownloadFailure(): Promise<boolean>;
  function clipbuilderCtaLayout(): {
    sameRow: boolean;
    aligned: boolean;
    inside: boolean;
    minimum: number;
    footer: number;
  };
  function clipbuilderTransferState(): {
    value: string | null;
    label: string;
    replaced: boolean;
    nativeAbsent: boolean;
    rounded: boolean;
    blue: boolean;
    animated: boolean;
    bodyFits: boolean;
  };
  function clipbuilderResolutionFits(): boolean;
  function clipbuilderOpenOffline(): Promise<boolean>;
  function clipbuilderOpeningState(): boolean;
  function clipbuilderOpenFailed(): Promise<boolean>;
  function clipbuilderOpenedOffline(): Promise<boolean>;
  function clipbuilderMomentFooterReady(): Promise<boolean>;
  function clipbuilderMomentFooterFits(): boolean;
  function clipbuilderManualControls(): Promise<boolean>;
  function clipbuilderCaptureTimes(): Promise<boolean>;
  function clipbuilderManualTimesFit(): boolean;
  function clipbuilderSubmitManualTimes(): Promise<boolean>;
  function clipbuilderCaptureBusy(): boolean;
  function clipbuilderRetryMoments(): Promise<boolean>;
  function clipbuilderMomentResults(): Promise<boolean>;
  function clipbuilderMomentTabs(): Promise<boolean>;
  function clipbuilderMomentResultsFit(): boolean;
  function clipbuilderEmptyMoments(): Promise<boolean>;
  function clipbuilderPrepareOffline(): Promise<boolean>;
  function clipbuilderSavedFallback(): Promise<boolean>;
  function clipbuilderBeginResolve(): Promise<boolean>;
  function clipbuilderWaitResolutionLoading(): Promise<boolean>;
  function clipbuilderIntakeMounted(): Promise<boolean>;
  function clipbuilderStartupLayout(): StartupLayout;
  function clipbuilderStartupFailed(): Promise<boolean>;
  function clipbuilderSpinnerAdvances(): Promise<boolean>;
  function clipbuilderCardBounds(): { youtube: number[]; upload: number[] };
  function clipbuilderRevealYoutube(): void;
  function clipbuilderEmptyResolution(): Promise<boolean>;
  function clipbuilderShortPreview(): Promise<boolean>;
  function clipbuilderVideoPreview(): Promise<{
    loaded: boolean;
    overflow: boolean;
    animated: boolean;
    fullTitle: boolean;
    arrow: boolean;
    options: string[];
  }>;
  function clipbuilderLoadingState(): {
    spinner: boolean;
    animated: boolean;
    noProgress: boolean;
    disabled: boolean;
    fits: boolean;
  };
}

async function clearDesignScratch(directory: string) {
  if (resolve(directory, "..") !== resolve(tmpdir()))
    throw new Error("design_scratch_path_invalid");
  await rm(directory, { recursive: true, force: true });
}

// The normal app stays running. This fixture owns an ephemeral loopback listener
// and a synthetic, empty library; it cannot reach YouTube or the owner's files.
it("presents two designed intake choices across desktop and phone layouts", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-design-proof-"));
  let ui = "";
  let resources: Awaited<ReturnType<typeof sampleOwnerResources>> | undefined;
  let mutations = 0;
  let lookups = 0,
    metadata = 0,
    imports = 0,
    cancellations = 0,
    opens = 0;
  let offline = false;
  let downloadState: unknown = null;
  let submittedImport: unknown;
  let submittedOpen: unknown;
  let releaseOpen: ((status: number) => void) | undefined;
  let releaseLookup: (() => void) | undefined;
  let releaseMetadata: (() => void) | undefined;
  let closing = false;
  let lookupArrived!: () => void;
  let metadataArrived!: () => void;
  const lookupPending = new Promise<void>((done) => {
    lookupArrived = done;
  });
  const metadataPending = new Promise<void>((done) => {
    metadataArrived = done;
  });
  let releaseCapabilities!: () => void;
  let releaseWorkspace!: () => void;
  let capabilitiesReady = new Promise<void>((done) => {
    releaseCapabilities = done;
  });
  let workspaceReady = new Promise<void>((done) => {
    releaseWorkspace = done;
  });
  let startupUnavailable = false;
  let startupReads = { capabilities: 0, workspace: 0 };
  let startupAborts = 0;
  let thumbnails = 0;
  let savedPreviewRequests = 0;
  let savedFrame = Buffer.alloc(0);
  let savedPreviewUnavailable = false;
  let noEnglish = false,
    thumbnailUnavailable = false,
    shortTitle = false;
  let statusReads = 0;
  const identity = canonicalOwnerYoutubeSource("https://youtu.be/synthetic01");
  const offer = ownerYoutubeOfferSchema.parse({
    ...(await fakeOwnerAcquisition.metadata(
      identity,
      AbortSignal.timeout(5000),
    )),
    mode: "provider-source",
    preview: {
      videoId: identity.videoId,
      title:
        "Synthetic video — A deliberately long selected-video title that scrolls through the available header space while keeping both intake cards completely stable",
    },
  });
  const selected = offer.choices.find((item) => item.tier === 720)!;
  const saved = ownerSavedSourceVariantSchema.parse({
    id: crypto.randomUUID(),
    sourceId: offer.sourceId,
    mode: "provider-source",
    acquiredAt: "2026-10-23T10:00:00Z",
    selection: { kind: "variant" },
    video: selected.video,
    audio: selected.audio,
    actual: {
      fingerprint: "a".repeat(64),
      bytes: 8,
      durationMs: 16000,
      width: 1280,
      height: 720,
      fps: 30,
    },
    offsetMs: 0,
    state: "ready",
  });
  const fixtureWorkspace = {
    id: crypto.randomUUID(),
    mode: "synthetic-ai",
    revision: 0,
    source: saved.actual,
  };
  const downloadId = crypto.randomUUID();
  let analysisPosts = 0;
  let submittedAnalysis: unknown;
  let releaseAnalysis: (() => void) | undefined;
  const server = createServer((request, response) => {
    response.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; media-src 'self' blob:; object-src 'none'",
    );
    if (request.method !== "GET") {
      mutations++;
      void (async () => {
        const chunks = [];
        for await (const chunk of request) chunks.push(Buffer.from(chunk));
        const text = Buffer.concat(chunks).toString();
        const body: unknown = text ? JSON.parse(text) : undefined;
        const reply = (status: number, value: unknown) =>
          response
            .writeHead(status, { "Content-Type": "application/json" })
            .end(JSON.stringify(value));
        if (request.url === "/api/local/sources/lookup") {
          lookups++;
          if (!closing && lookups === 1)
            await new Promise<void>((done) => {
              releaseLookup = done;
              lookupArrived();
            });
          reply(200, {
            sourceId: offer.sourceId,
            mode: offline ? null : "provider-source",
            metadataAvailable: !offline,
            saved: offline
              ? [{ destination: "downloads", variant: saved }]
              : [],
          });
        } else if (request.url === "/api/local/sources/metadata") {
          metadata++;
          if (!closing && metadata === 1)
            await new Promise<void>((done) => {
              releaseMetadata = done;
              metadataArrived();
            });
          reply(
            metadata === 1 ? 400 : 200,
            metadata === 1
              ? { error: "fixture_unavailable" }
              : {
                  ...offer,
                  preview: {
                    ...offer.preview,
                    title: shortTitle ? "Short video" : offer.preview?.title,
                  },
                  choices: noEnglish
                    ? offer.choices.map((item) => ({
                        ...item,
                        audio: item.audio
                          ? { ...item.audio, language: "fr" }
                          : null,
                      }))
                    : offer.choices,
                },
          );
        } else if (request.url === "/api/local/sources/import") {
          imports++;
          submittedImport = ownerSourceImportSchema.parse(body);
          downloadState = {
            id: downloadId,
            mode: "provider-source",
            stage: "queued",
            downloadedBytes: 0,
            totalBytes: null,
            variantId: null,
            error: null,
          };
          reply(200, downloadState);
        } else if (request.url === "/api/local/sources/cancel") {
          cancellations++;
          downloadState = {
            id: downloadId,
            mode: "provider-source",
            stage: "canceled",
            downloadedBytes: 0,
            totalBytes: 8,
            variantId: null,
            error: null,
          };
          reply(200, downloadState);
        } else if (request.url === "/api/local/sources/open") {
          opens++;
          submittedOpen = body;
          await new Promise<void>((done) => {
            releaseOpen = (status) => {
              releaseOpen = undefined;
              if (!response.destroyed)
                reply(status, status === 200 ? fixtureWorkspace : {});
              done();
            };
          });
        } else if (
          request.url === `/api/local/workspace/${fixtureWorkspace.id}/analysis`
        ) {
          analysisPosts++;
          submittedAnalysis = body;
          if (!closing)
            await new Promise<void>((done) => {
              releaseAnalysis = done;
            });
          if (analysisPosts === 1) {
            reply(503, { error: "fixture_unavailable" });
          } else {
            const inputs = ownerAnalysisInputsSchema.parse(body);
            const moment = (
              cut: { startFrame: number; endFrame: number },
              rangeIds: string[],
            ) => ({
              id: crypto.randomUUID(),
              processingIdentity: "a".repeat(64),
              cut,
              rangeIds,
              evidence: null,
              cues: [],
            });
            reply(
              200,
              ownerAnalysisSchema.parse({
                id: crypto.randomUUID(),
                mode: "synthetic-ai",
                inputs,
                manual: inputs.ranges.map((range) =>
                  moment(ownerCut(range, fixtureWorkspace.source.durationMs), [
                    range.id,
                  ]),
                ),
                suggestions: inputs.ranges.length
                  ? [moment({ startFrame: 60, endFrame: 360 }, [])]
                  : [],
                words: [],
                calls: { transcription: 0, selection: 0 },
              }),
            );
          }
        } else reply(405, {});
      })().catch(() => response.writeHead(500).end());
      return;
    }
    const replies: Record<string, unknown> = {
      "/api/local/capabilities": {
        aiMode: "synthetic-ai",
        sourceMode: offline ? null : "provider-source",
        planningAvailable: true,
        localMedia: true,
        cloud: false,
      },
      "/api/local/workspace": null,
      [`/api/local/workspace/${fixtureWorkspace.id}/analysis`]: null,
      [`/api/local/workspace/${fixtureWorkspace.id}/clips`]: {
        clips: [],
        active: false,
        workers: 1,
      },
      "/api/local/drafts": [],
      "/api/local/sources/state": downloadState,
      "/api/local/sources": {
        entries: [],
        bytes: 0,
        warning: false,
        destinations: ["downloads"],
      },
    };
    const path = request.url ?? "";
    if (
      path === `/api/local/sources/downloads/${saved.id}/preview` ||
      path === `/api/local/workspace/${fixtureWorkspace.id}/source`
    ) {
      if (path.includes("/sources/")) savedPreviewRequests++;
      if (savedPreviewUnavailable) {
        response.writeHead(404).end();
        return;
      }
      const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      const start = range ? Number(range[1]) : 0;
      const end = Math.min(
        range?.[2] ? Number(range[2]) : savedFrame.length - 1,
        savedFrame.length - 1,
        start + 512 * 1024 - 1,
      );
      if (!range || start > end) {
        response.writeHead(416).end();
        return;
      }
      response
        .writeHead(206, {
          "Content-Type": "video/mp4",
          "Content-Length": end - start + 1,
          "Content-Range": `bytes ${start}-${end}/${savedFrame.length}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "no-store",
        })
        .end(savedFrame.subarray(start, end + 1));
      return;
    }
    if (path === `/api/local/sources/thumbnail/${offer.sourceId}`) {
      thumbnails++;
      if (thumbnailUnavailable) {
        response.writeHead(404, { "Cache-Control": "no-store" }).end();
        return;
      }
      response
        .writeHead(200, {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-store",
        })
        .end(
          '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#3157d5"/><rect x="12" y="30" width="96" height="60" rx="10" fill="#07142f"/><path d="M52 44L78 60L52 76Z" fill="#b8d6ff"/></svg>',
        );
      return;
    }
    if (Object.hasOwn(replies, path)) {
      const send = () => {
        if (response.destroyed) return;
        response
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(replies[path]));
      };
      if (path === "/api/local/capabilities") {
        startupReads.capabilities++;
        void capabilitiesReady.then(() =>
          startupUnavailable
            ? response
                .writeHead(503, { "Content-Type": "application/json" })
                .end('{"error":"fixture_unavailable"}')
            : send(),
        );
      } else if (path === "/api/local/workspace") {
        startupReads.workspace++;
        response.on("close", () => {
          if (!response.writableFinished) startupAborts++;
        });
        void workspaceReady.then(send);
      } else {
        if (path === "/api/local/sources/state") statusReads++;
        send();
      }
      return;
    }
    const file =
      path === "/"
        ? "index.html"
        : path === "/app.js"
          ? "app.js"
          : path === "/app.css"
            ? "app.css"
            : null;
    if (!file) {
      response.writeHead(404).end();
      return;
    }
    void readFile(join(ui, file)).then(
      (bytes) => {
        response
          .writeHead(200, {
            "Content-Type": file.endsWith("js")
              ? "text/javascript"
              : file.endsWith("css")
                ? "text/css"
                : "text/html",
          })
          .end(bytes);
      },
      () => response.writeHead(500).end(),
    );
  });
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  try {
    ui = await prepareLocalControlsFixture(directory);
    resources = await sampleOwnerResources(directory);
    const tools = await ownerNativeTools(resolve("."));
    const frameFile = join(directory, "synthetic-preview.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "testsrc2=size=320x180:rate=30",
        "-t",
        "2",
        "-an",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        "-movflags",
        "+faststart",
        frameFile,
      ],
      AbortSignal.timeout(15000),
    );
    savedFrame = await readFile(frameFile);
    const port = await listenOwner(server);
    browser = await openBrowser("chrome", {
      browserExecutable:
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
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
    const setMotion = async (value: "reduce" | "no-preference") => {
      const parameters = {
        media: "screen",
        features: [{ name: "prefers-reduced-motion", value }],
      };
      // @ts-expect-error Pinned Remotion types only model dark color-scheme; CDP also supports motion preferences.
      await page._client().send("Emulation.setEmulatedMedia", parameters);
    };
    await setMotion("no-preference");
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15_000 });
    const intakeDriver = `"use strict";
globalThis.clipbuilderIntakeMounted = async () => {
  for (let attempt=0; attempt<200; attempt++) {
    if ([...document.querySelectorAll('[role="status"]')].some(node=>node.textContent.trim()==='Connecting')) return true;
    await new Promise(done => setTimeout(done,50));
  }
  return false;
};
globalThis.clipbuilderStartupLayout = () => {
  const status=[...document.querySelectorAll('[role="status"]')].find(node=>node.textContent.trim()==='Connecting');
  const rect=status?.getBoundingClientRect();
  return {inputsAbsent:!document.querySelector('.source-options'),visible:!!rect && rect.width>0 && rect.top>=0 && rect.bottom<=innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,spinner:!!status?.parentElement.querySelector('.lucide-loader-circle')};
};
globalThis.clipbuilderCardBounds = () => {
  const bounds = node => [node.offsetTop,node.offsetWidth,node.offsetHeight];
  return {youtube:bounds(document.querySelector('.youtube-card')),upload:bounds(document.querySelector('.upload-card'))};
};
globalThis.clipbuilderRevealYoutube = () => document.querySelector('.youtube-card').scrollIntoView({block:'end'});
globalThis.clipbuilderCtaLayout = () => {
  const card=document.querySelector('.youtube-card'), footer=card.querySelector('.source-card-footer');
  const actions=[...card.querySelectorAll('.source-actions button')].map(node=>node.getBoundingClientRect());
  const upload=document.querySelector('.upload-card .source-actions').getBoundingClientRect();
  const bounds=card.getBoundingClientRect();
  return {sameRow:actions.every(rect=>Math.abs(rect.y-actions[0].y)<1),aligned:innerWidth<768 || Math.abs(actions[0].y-upload.y)<1,inside:actions.every(rect=>rect.left>=bounds.left && rect.right<=bounds.right && rect.bottom<=bounds.bottom),minimum:Math.min(...actions.map(rect=>rect.height)),footer:footer.offsetTop};
};
globalThis.clipbuilderSpinnerAdvances = async () => {
  const spinner = document.querySelector('.local-editing .lucide-loader-circle');
  const animation = spinner?.getAnimations()[0];
  if (!animation || typeof animation.currentTime !== 'number') return false;
  const start = animation.currentTime;
  let previous = start;
  for (let frame=0; frame<4; frame++) {
    await new Promise(done => setTimeout(done,300));
    const current = animation.currentTime;
    if (animation.playState !== 'running' || typeof current !== 'number' || current <= previous) return false;
    previous = current;
  }
  return previous-start >= 900 && animation.effect.getComputedTiming().iterations === Infinity;
};
globalThis.clipbuilderStartupFailed = async () => {
  for(let attempt=0;attempt<200;attempt++) {
    const input=document.querySelector('.youtube-card input');
    if(input?.matches(':disabled') && !document.querySelector('.youtube-startup-indicator') && document.querySelector('.flow-notice').textContent.includes('couldn’t connect')) return true;
    await new Promise(done=>setTimeout(done,50));
  }
  return false;
};
globalThis.clipbuilderIntakeReady = async () => {
    for (let attempt = 0; attempt < 200; attempt++) {
        if (document.querySelector(".youtube-card") &&
            document.querySelector(".upload-card button:enabled"))
            return true;
        await new Promise((done) => setTimeout(done, 50));
    }
    return false;
};
globalThis.clipbuilderIntakeLayout = () => {
    const upload = document
        .querySelector(".upload-card")
        .getBoundingClientRect();
    const youtube = document
        .querySelector(".youtube-card")
        .getBoundingClientRect();
    const sample = document.querySelector('.upload-card a[href="/start?source=sample"]');
    const actions = [
        ...document.querySelectorAll(".source-actions button, .source-actions a, .link-fields button"),
    ];
    const choose = document.querySelector(".upload-card button");
    choose.focus();
    const scroll = document.querySelector(".local-editing").parentElement;
    const brand = document.querySelector('a[aria-label="ClipBuilder home"]');
    const navbar = brand.closest("header");
    const navBox = navbar.getBoundingClientRect();
    const navItems = [brand, ...navbar.querySelectorAll("button")].filter(node => {
        const box = node.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
    });
    return {
        width: innerWidth,
        sideBySide: Math.abs(upload.top - youtube.top) < 2 &&
            youtube.left > upload.right,
        stacked: youtube.top >= upload.bottom,
        equalColumns: Math.abs(upload.width - youtube.width) < 2,
        rootOverflow: document.documentElement.scrollWidth > innerWidth,
        contentOverflow: scroll.scrollWidth > scroll.clientWidth,
        smallestTarget: Math.min(...actions.map((node) => node.getBoundingClientRect().height)),
        sampleEntryAbsent: sample === null && !document.body.textContent.includes('Use demo sample'),
        uploadActions: document.querySelectorAll('.upload-card .source-actions button, .upload-card .source-actions a').length,
        nativePickerHidden: document
            .querySelector('input[type="file"]')
            .getBoundingClientRect().width <= 1,
        continueDisabled: document.querySelector(".youtube-actions button").disabled,
        focusWidth: parseFloat(getComputedStyle(choose).outlineWidth),
        modeLabelAbsent: document.querySelector(".local-mode-note") === null,
          librariesAbsent: document.querySelectorAll(".saved-sources, .draft-library").length === 0,
        navbarPadding: parseFloat(getComputedStyle(navbar).paddingTop),
        navbarClearance: Math.min(...navItems.flatMap(node => {
            const box = node.getBoundingClientRect();
            return [box.top - navBox.top, navBox.bottom - box.bottom];
        })),
        frameBottom: document.querySelector("#sample-main").getBoundingClientRect().bottom,
        viewportHeight: innerHeight,
    };
};
`;
    await page._client().send("Runtime.evaluate", { expression: intakeDriver });
    const evidence = resolve(".local-build/evidence");
    await mkdir(evidence, { recursive: true });
    expect(
      await page.evaluate(() => globalThis.clipbuilderIntakeMounted()),
    ).toBe(true);
    const startupMetrics = [];
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      const layout = await page.evaluate(() =>
        globalThis.clipbuilderStartupLayout(),
      );
      expect(layout).toMatchObject({
        inputsAbsent: true,
        visible: true,
        overflow: false,
        spinner: true,
      });
      startupMetrics.push({ width, height, layout });
      const capture = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        join(evidence, `cl038-startup-${width}.png`),
        Buffer.from(capture.value.data, "base64"),
      );
    }
    expect(statusReads).toBe(0);
    expect(mutations).toBe(0);
    await vi.waitFor(() =>
      expect(startupReads).toEqual({ capabilities: 1, workspace: 1 }),
    );
    expect(
      await page.evaluate(() => globalThis.clipbuilderSpinnerAdvances()),
    ).toBe(true);
    await setMotion("reduce");
    expect(
      await page.evaluate(() => globalThis.clipbuilderSpinnerAdvances()),
    ).toBe(true);
    await setMotion("no-preference");
    releaseCapabilities();
    expect(
      await page.evaluate(() => globalThis.clipbuilderStartupLayout()),
    ).toMatchObject({
      inputsAbsent: true,
      visible: true,
      overflow: false,
      spinner: true,
    });
    expect(statusReads).toBe(0);
    releaseWorkspace();
    expect(await page.evaluate(() => globalThis.clipbuilderIntakeReady())).toBe(
      true,
    );
    for (const { width, height } of startupMetrics) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      const after = await page.evaluate(() =>
        globalThis.clipbuilderStartupLayout(),
      );
      expect(after).toMatchObject({
        inputsAbsent: false,
        visible: false,
        overflow: false,
        spinner: false,
      });
    }
    const metrics = [];
    const footerPositions = new Map<string, number>();
    const cardBounds = new Map<
      string,
      { youtube: number[]; upload: number[] }
    >();
    for (const [width, height] of [
      [1440, 900],
      [1024, 768],
      [768, 1024],
      [390, 844],
      [320, 568],
      [1440, 600],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      const layout = await page.evaluate(() =>
        globalThis.clipbuilderIntakeLayout(),
      );
      expect(layout.rootOverflow).toBe(false);
      expect(layout.contentOverflow).toBe(false);
      expect(layout.smallestTarget).toBeGreaterThanOrEqual(44);
      expect(layout.sampleEntryAbsent).toBe(true);
      expect(layout.uploadActions).toBe(1);
      expect(layout.nativePickerHidden).toBe(true);
      expect(layout.continueDisabled).toBe(true);
      expect(layout.focusWidth).toBeGreaterThanOrEqual(2);
      expect(layout.modeLabelAbsent).toBe(true);
      expect(layout.librariesAbsent).toBe(true);
      expect(layout.navbarClearance).toBeGreaterThanOrEqual(8);
      expect(layout.frameBottom).toBeLessThanOrEqual(height);
      const ctaLayout = await page.evaluate(() =>
        globalThis.clipbuilderCtaLayout(),
      );
      expect(ctaLayout, `${width}: ${JSON.stringify(ctaLayout)}`).toMatchObject(
        {
          sameRow: true,
          aligned: true,
          inside: true,
          minimum: 44,
        },
      );
      expect(
        width >= 768
          ? layout.sideBySide && layout.equalColumns
          : layout.stacked,
      ).toBe(true);
      footerPositions.set(`${width}x${height}`, ctaLayout.footer);
      metrics.push(layout);
      cardBounds.set(
        `${width}x${height}`,
        await page.evaluate(() => globalThis.clipbuilderCardBounds()),
      );
      const capture = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        join(evidence, `cl032-intake-${width}-${height}.png`),
        Buffer.from(capture.value.data, "base64"),
      );
    }
    expect(mutations).toBe(0);
    const driver = `"use strict";
const wait = async (read) => {
  for (let attempt = 0; attempt < 200; attempt++) {
    const result = read(); if (result) return result;
    await new Promise(done => setTimeout(done, 50));
  }
  throw new Error('youtube_ui_timeout');
};
const button = (label) => [...document.querySelectorAll('.youtube-card button')].find(node => node.textContent.trim() === label && !node.matches(':disabled'));
const fillLink = async () => {
  const input = await wait(() => document.querySelector('.youtube-card input:enabled'));
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'https://youtu.be/synthetic01');
  input.dispatchEvent(new Event('input',{bubbles:true}));
  const next = await wait(() => button('Continue')); next.click();
};
globalThis.clipbuilderBeginResolve = async () => {
  await fillLink();
  await wait(() => document.querySelector('.youtube-card .acquisition-spinner'));
  return true;
};
globalThis.clipbuilderLoadingState = () => {
  const card = document.querySelector('.youtube-card');
  card.scrollIntoView({block:'center'});
  const spinner = card.querySelector('.acquisition-spinner');
  return {
    spinner: !!spinner && spinner.getAttribute('aria-hidden') === 'true',
    animated: !!spinner && getComputedStyle(spinner).animationName !== 'none',
    noProgress: !card.querySelector('progress') && !card.textContent.includes('%'),
    disabled: card.querySelector('fieldset').disabled,
    fits: card.scrollWidth <= card.clientWidth && document.documentElement.scrollWidth <= innerWidth,
  };
};
globalThis.clipbuilderWaitResolutionLoading = async () => {
  await wait(() => document.querySelector('.acquisition-loading[role="status"]'));
  return true;
};
globalThis.clipbuilderResolveLink = async () => {
  const retry = await wait(() => button('Try again'));
  if (!document.querySelector('.youtube-card').textContent.includes('Couldn’t load resolutions')) throw new Error('missing_short_error');
  retry.click();
  const select = await wait(() => document.querySelector('.youtube-card select:enabled'));
  if (document.querySelector('.youtube-card .acquisition-spinner')) throw new Error('stale_lookup_spinner');
  if (button('Download video')) throw new Error('hidden_best_implicitly_selected');
  const card = document.querySelector('.youtube-card');
  if (card.querySelector('input') || card.querySelectorAll('select').length !== 1 || card.textContent.includes('Save completed source') || button('Get video qualities')) throw new Error('growing_form_returned');
  const option = [...select.options].find(node => node.textContent.includes('720p') && !node.disabled);
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,option.value);
  select.dispatchEvent(new Event('change',{bubbles:true}));
  await wait(() => button('Download video'));
  return true;
};
globalThis.clipbuilderResolutionFits = () => {
  const card = document.querySelector('.youtube-card');
  card.scrollIntoView({block:'start'});
  return document.documentElement.scrollWidth <= innerWidth && card.scrollWidth <= card.clientWidth && card.querySelector('select').getBoundingClientRect().height >= 44;
};
globalThis.clipbuilderVideoPreview = async () => {
  const image=await wait(()=>{const image=document.querySelector('.youtube-preview img'); return image?.complete && image.naturalWidth ? image : null;});
  const title=document.querySelector('.youtube-video-title');
  await wait(()=>title.classList.contains('is-overflowing'));
  const text=title.querySelector('span');
  const animation=text.getAnimations()[0];
  const before=animation?.currentTime;
  await new Promise(done=>setTimeout(done,150));
  const select=document.querySelector('.youtube-card select');
  const selectStyle=getComputedStyle(select);
  return {loaded:image.naturalWidth>0,overflow:text.scrollWidth>title.clientWidth,animated:typeof before==='number' && animation.currentTime>before,fullTitle:title.title===text.textContent,arrow:select.classList.contains('select-control') && selectStyle.appearance==='none' && selectStyle.backgroundImage!=='none' && parseFloat(selectStyle.paddingRight)>=40,options:[...select.options].map(option=>option.textContent)};
};
globalThis.clipbuilderDownloadAndCancel = async () => {
  const download = await wait(() => button('Download video')); download.click();
  await wait(() => button('Cancel download'));
  return true;
};
globalThis.clipbuilderTransferState = () => {
  const card=document.querySelector('.youtube-card'),bar=card.querySelector('[role="progressbar"]');
  const fill=bar?.firstElementChild,body=card.querySelector('.source-card-body');
  return {value:bar?.getAttribute('aria-valuenow') ?? null,label:bar?.getAttribute('aria-label') ?? '',replaced:!card.querySelector('select, fieldset') && !!card.querySelector('.download-progress'),nativeAbsent:!card.querySelector('progress'),rounded:!!bar && parseFloat(getComputedStyle(bar).borderRadius)>5,blue:!!fill && getComputedStyle(fill).backgroundImage.includes('linear-gradient'),animated:!!fill && getComputedStyle(fill).animationName!=='none',bodyFits:body.scrollHeight<=body.clientHeight+1};
};
globalThis.clipbuilderWaitDownloadFailure = async () => {
  await wait(()=>document.querySelector('.download-outcome')?.textContent==='Download failed');
  await wait(()=>document.querySelector('.youtube-card select:enabled') && button('Download video'));
  if(document.querySelector('.download-progress')) throw new Error('terminal_progress_not_replaced');
  return true;
};
globalThis.clipbuilderFinishDownload = async () => {
  const before=globalThis.clipbuilderCardBounds();
  const stable=()=>{if(JSON.stringify(globalThis.clipbuilderCardBounds())!==JSON.stringify(before)) throw new Error('download_card_height_changed');};
  const cancel = await wait(() => button('Cancel download')); cancel.click();
  await wait(() => document.querySelector('.download-outcome')?.textContent.includes('Download canceled'));
  stable();
  const back = await wait(() => button('Change link')); back.click();
  await wait(() => document.querySelector('.youtube-card input:enabled'));
  stable();
  if (document.querySelector('.youtube-card select')) throw new Error('resolution_not_replaced');
  if (document.querySelector('.download-progress')) throw new Error('old_download_message_retained');
  return true;
};
globalThis.clipbuilderPrepareOffline = async () => {
  await fillLink();
  const video=await wait(()=>{const node=document.querySelector('.youtube-preview video');return node?.dataset.loaded==='true' && node;});
  const thumbnailTime=Math.min(10,video.duration/4);
  await wait(()=>video.readyState>=2 && Math.abs(video.currentTime-thumbnailTime)<0.05);
  if(video.videoWidth!==320 || video.videoHeight!==180 || !video.paused || !video.muted || video.autoplay || !video.playsInline || video.controls) throw new Error('saved_preview_not_silent_still');
  if(document.querySelector('.youtube-preview img') || document.querySelector('.youtube-preview .acquisition-spinner') || document.querySelector('.youtube-video-title').textContent!=='Saved video') throw new Error('saved_preview_not_local');
  if (button('More resolutions') || button('Download video') || document.querySelector('.youtube-card input')) throw new Error('offline_picker_unavailable');
  return true;
};
globalThis.clipbuilderOpenOffline = async () => {
  const use = await wait(() => button('Use video'));
  use.click();
  await wait(()=>document.querySelector('.youtube-actions button[aria-busy="true"]'));
  return true;
};
globalThis.clipbuilderOpeningState = () => {
  const opening=document.querySelector('.youtube-actions button[aria-busy="true"]'),spinner=opening?.querySelector('.acquisition-spinner');
  return !!opening && opening.disabled && opening.textContent.trim()==='Opening…' && opening.getAttribute('aria-label')==='Opening video' && !!spinner && getComputedStyle(spinner).animationName!=='none' && opening.scrollWidth<=opening.clientWidth+1 && !!document.querySelector('.youtube-card select:disabled') && document.querySelector('.youtube-actions button:last-child').disabled && !document.querySelector('.download-progress');
};
globalThis.clipbuilderOpenFailed = async () => {
  await wait(()=>button('Use video') && !button('Use video').disabled);
  if(document.querySelector('.youtube-actions .acquisition-spinner') || document.querySelector('.youtube-card .flow-notice').textContent!=='Couldn’t open this video. Try again.') throw new Error('open_failure_not_restored');
  return true;
};
globalThis.clipbuilderOpenedOffline = async () => {
  await wait(() => document.querySelector('h1')?.textContent.includes('Choose your moments'));
  await wait(()=>!document.querySelector('.youtube-preview video'));
  if(document.querySelector('.youtube-actions .acquisition-spinner')) throw new Error('open_spinner_survived_handoff');
  return true;
};
globalThis.clipbuilderMomentFooterReady = async () => {
  const suggest=await wait(()=>document.querySelector('.selection input[type="checkbox"]:enabled'));
  if(!suggest.checked)suggest.click();
  await wait(()=>[...document.querySelectorAll('#sample-main > footer button')].some(node=>node.textContent.trim()==='Find moments' && !node.disabled));
  const copy=document.body.textContent;
  if(document.querySelector('.draft-controls') || /Save draft|Fictional transcript|Times round|provider calls|Number of additional/.test(copy)) throw new Error('verbose_moment_ui_retained');
  return true;
};
globalThis.clipbuilderMomentFooterFits = () => {
  const footer=document.querySelector('#sample-main > footer');
  const find=[...document.querySelectorAll('button')].find(node=>node.textContent.trim()==='Find moments');
  const bounds=footer.getBoundingClientRect();
  return !!find && footer.contains(find) && bounds.bottom<=innerHeight+1 && footer.scrollWidth<=footer.clientWidth && !document.querySelector('.selection > nav') && !document.querySelector('.batch-section > nav');
};
globalThis.clipbuilderManualControls = async () => {
  const action = label => [...document.querySelectorAll('button')].find(node=>node.textContent.trim()===label);
  const toggle=document.querySelector('.selection input[type="checkbox"]');toggle.click();
  await wait(()=>action('Use clips')?.disabled);
  if([...document.querySelectorAll('.selection label')].some(node=>node.firstChild?.textContent.trim()==='Clips')) throw new Error('hidden_ai_controls_retained');
  action('Add clip').click();
  await wait(()=>action('Use clips') && !action('Use clips').disabled);
  if(document.querySelectorAll('.range-row').length!==1 || !document.querySelector('#sample-main > footer').contains(action('Use clips'))) throw new Error('manual_continue_not_ready');
  toggle.click();
  await wait(()=>action('Find moments') && !action('Find moments').disabled);
  if(document.querySelectorAll('.range-row').length!==1) throw new Error('ai_toggle_lost_manual_clip');
  return true;
};
globalThis.clipbuilderCaptureTimes = async () => {
  const action=label=>[...document.querySelectorAll('button')].find(node=>node.textContent.trim()===label);
  const input=(row,field)=>document.querySelector('input[aria-label="Clip '+row+' '+field+'"]');
  const capture=(row,field)=>document.querySelector('button[aria-label="Set clip '+row+' '+field+' to current time"]');
  const enter=async(row,field,text,blur=true)=>{
    const node=input(row,field); node.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(node,text);
    node.dispatchEvent(new Event('input',{bubbles:true}));
    await wait(()=>input(row,field).value===text);
    if(blur) { node.blur(); await new Promise(done=>setTimeout(done,20)); }
  };
  await enter(1,'start','00:00:60');
  await wait(()=>input(1,'start').value==='00:01:00');
  await enter(1,'start','00:60:00');
  await wait(()=>input(1,'start').value==='01:00:00');
  await enter(1,'end','00:00:90');
  await wait(()=>input(1,'end').value==='00:01:30');
  await enter(1,'end','00:90:00');
  await wait(()=>input(1,'end').value==='01:30:00');
  await enter(1,'start','00:00:',false);
  if(input(1,'start').value!=='00:00:') throw new Error('partial_clock_rewritten');
  input(1,'start').blur();
  const video=await wait(()=>{const node=document.querySelector('.source-preview video');return node?.readyState>=1 && node;});
  video.pause();
  const seek=async(time)=>{
    video.currentTime=time;
    await wait(()=>!video.seeking && Math.abs(video.currentTime-time)<0.05 && !capture(1,'start').matches(':disabled'));
  };
  await seek(0.8);
  capture(1,'start').click();
  await wait(()=>input(1,'start').value==='00:00:00');
  if(input(1,'end').value!=='01:30:00') throw new Error('start_capture_changed_end');
  await seek(1.7);
  capture(1,'end').click();
  await wait(()=>input(1,'end').value==='00:00:01');
  action('Add clip').click();
  await wait(()=>input(2,'start'));
  await seek(1.2);
  capture(2,'start').click();
  await wait(()=>input(2,'start').value==='00:00:01');
  await seek(2);
  capture(2,'end').click();
  await wait(()=>input(2,'end').value==='00:00:02');
  if(input(1,'start').value!=='00:00:00' || input(1,'end').value!=='00:00:01') throw new Error('capture_changed_another_clip');
  for(const event of ['seeking','emptied','error']) {
    video.dispatchEvent(new Event(event));
    await wait(()=>capture(1,'start').matches(':disabled'));
    capture(1,'start').click();
    if(input(1,'start').value!=='00:00:00') throw new Error('unready_capture_overwrote_field');
    video.dispatchEvent(new Event('loadedmetadata'));
    await wait(()=>!capture(1,'start').matches(':disabled'));
  }
  if(!video.paused || video.currentTime!==2) throw new Error('capture_moved_playhead');
  return true;
};
globalThis.clipbuilderManualTimesFit = () => {
  const rows=[...document.querySelectorAll('.range-row')];
  const controls=[...document.querySelectorAll('.range-time input,.range-time button')];
  rows[0].scrollIntoView({block:'center'});
  return rows.length===2 && controls.length===8 && controls.every(node=>{
    const box=node.getBoundingClientRect(), parent=node.closest('.range-row').getBoundingClientRect();
    return box.width>0 && box.height>=44 && box.left>=parent.left && box.right<=parent.right+1;
  }) && document.documentElement.scrollWidth<=innerWidth && globalThis.clipbuilderMomentFooterFits();
};
globalThis.clipbuilderSubmitManualTimes = async () => {
  const node=document.querySelector('input[aria-label="Clip 2 end"]');
  node.focus();
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(node,'00:01:02');
  node.dispatchEvent(new Event('input',{bubbles:true}));
  await wait(()=>node.value==='00:01:02');
  [...document.querySelectorAll('button')].find(node=>node.textContent.trim()==='Find moments').click();
  await wait(()=>document.querySelector('.selection .flow-notice').textContent.includes('Check clip times'));
  if(document.querySelector('button[aria-busy="true"]')) throw new Error('out_of_source_time_submitted');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(node,'0:0:2');
  node.dispatchEvent(new Event('input',{bubbles:true}));
  await wait(()=>node.value==='0:0:2');
  // Keep the input focused: submission must normalize without relying on blur.
  [...document.querySelectorAll('button')].find(node=>node.textContent.trim()==='Find moments').click();
  await wait(()=>[...document.querySelectorAll('.selection [role="status"]')].some(node=>node.textContent.trim()==='Finding moments'));
  await wait(()=>node.value==='00:00:02');
  return true;
};
globalThis.clipbuilderCaptureBusy = () => {
  const buttons=[...document.querySelectorAll('.range-time button')];
  const start=document.querySelector('input[aria-label="Clip 1 start"]');
  buttons[0].click();
  return buttons.length===4 && buttons.every(node=>node.matches(':disabled')) && start.value==='00:00:00';
};
globalThis.clipbuilderRetryMoments = async () => {
  const find=await wait(()=>[...document.querySelectorAll('#sample-main > footer button')].find(node=>node.textContent.trim()==='Find moments' && !node.disabled));
  find.click();
  await wait(()=>[...document.querySelectorAll('.selection [role="status"]')].some(node=>node.textContent.trim()==='Finding moments'));
  return true;
};
globalThis.clipbuilderMomentResults = async () => {
  const tab=label=>[...document.querySelectorAll('.moment-tabs button')].find(node=>node.textContent===label);
  await wait(()=>tab('Your clips')?.getAttribute('aria-selected')==='true');
  const buttons=await wait(()=>{const nodes=[...document.querySelectorAll('.moment-remove')]; return nodes.length===3 && nodes;});
  const process=await wait(()=>[...document.querySelectorAll('#sample-main > footer button')].find(node=>node.textContent.trim()==='Process clips' && !node.disabled));
  if(!process || document.querySelectorAll('.selection > [role="tabpanel"]:not([hidden])').length!==1 || document.querySelector('.range-row').getClientRects().length || [...document.querySelectorAll('button')].some(node=>node.textContent.trim()==='Find moments')) throw new Error('results_were_appended_or_not_selected');
  if(!buttons.every(node=>node.textContent.trim()==='Remove') || !document.querySelector('.selection-count').textContent.includes('3 clips')) throw new Error('selection_not_intuitive');
  await wait(()=>{const bounds=document.querySelector('.moment-tabs').getBoundingClientRect(); return bounds.top>=document.querySelector('#sample-main > header').getBoundingClientRect().bottom-1 && bounds.bottom<=innerHeight;});
  return true;
};
globalThis.clipbuilderMomentResultsFit = () => {
  const selection=document.querySelector('.selection'),tabs=document.querySelector('.moment-tabs');
  const footer=document.querySelector('#sample-main > footer');
  const process=[...footer.querySelectorAll('button')].find(node=>node.textContent.trim()==='Process clips');
  selection.scrollIntoView({block:'start'});
  return !!process && !process.disabled && footer.getBoundingClientRect().bottom<=innerHeight+1 && footer.scrollWidth<=footer.clientWidth && tabs.scrollWidth<=tabs.clientWidth && selection.scrollWidth<=selection.clientWidth && document.documentElement.scrollWidth<=innerWidth && [...tabs.querySelectorAll('button')].every(node=>node.getBoundingClientRect().height>=44) && document.querySelectorAll('.selection > [role="tabpanel"]:not([hidden])').length===1;
};
globalThis.clipbuilderMomentTabs = async () => {
  const tab=label=>[...document.querySelectorAll('.moment-tabs button')].find(node=>node.textContent===label);
  const action=label=>[...document.querySelectorAll('#sample-main > footer button')].find(node=>node.textContent.trim()===label);
  const resultButtons=[...document.querySelectorAll('.moment-remove')];
  resultButtons[0].click();
  await wait(()=>!resultButtons[0].isConnected);
  tab('Add clips').click();
  await wait(()=>action('Find moments') && !action('Process clips'));
  if(document.querySelector('input[aria-label="Clip 2 end"]').value!=='00:00:02' || document.querySelector('.choices').getClientRects().length) throw new Error('tab_lost_input_or_showed_both_views');
  tab('Your clips').click();
  await wait(()=>action('Process clips'));
  if(resultButtons[0].isConnected || !document.querySelector('.selection-count').textContent.includes('2 clips')) throw new Error('tab_lost_selection');
  for(const node of resultButtons.slice(1)) {node.click();await wait(()=>!node.isConnected);}
  await wait(()=>action('Process clips').disabled);
  if(action('Find moments')) throw new Error('deselected_results_changed_to_form_action');
  tab('Your clips').focus();
  for(const [key,label] of [['ArrowLeft','Add clips'],['ArrowRight','Your clips'],['Home','Add clips'],['End','Your clips']]) {
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));
    await wait(()=>document.activeElement===tab(label) && tab(label).getAttribute('aria-selected')==='true');
    if(document.querySelectorAll('.selection > [role="tabpanel"]:not([hidden])').length!==1 || [...document.querySelectorAll('.moment-tabs button')].filter(node=>node.tabIndex===0).length!==1) throw new Error('selection_tab_keyboard_failed');
  }
  tab('Add clips').click();
  await wait(()=>action('Find moments'));
  const remove=()=>document.querySelector('.range-row > button');
  remove().click(); await wait(()=>document.querySelectorAll('.range-row').length===1);
  if(!tab('Your clips').disabled || action('Process clips')) throw new Error('edited_inputs_kept_stale_results');
  remove().click(); await wait(()=>!document.querySelector('.range-row'));
  action('Find moments').click();
  await wait(()=>[...document.querySelectorAll('.selection [role="status"]')].some(node=>node.textContent.trim()==='Finding moments'));
  return true;
};
globalThis.clipbuilderEmptyMoments = async () => {
  const tab=[...document.querySelectorAll('.moment-tabs button')].find(node=>node.textContent==='Your clips');
  await wait(()=>tab.getAttribute('aria-selected')==='true' && !tab.disabled);
  const panel=document.querySelector('.selection > [role="tabpanel"]:not([hidden])');
  const process=await wait(()=>[...document.querySelectorAll('#sample-main > footer button')].find(node=>node.textContent.trim()==='Process clips' && node.disabled));
  return panel.textContent.includes('No clips yet.') && !document.querySelector('.moments') && !!process && process.disabled;
};
globalThis.clipbuilderSavedFallback = async () => {
  await fillLink();
  await wait(()=>document.querySelector('.youtube-thumbnail svg:not(.acquisition-spinner)') && !document.querySelector('.youtube-thumbnail video'));
  if(document.querySelector('.youtube-thumbnail .acquisition-spinner') || !button('Use video') || button('Use video').disabled) throw new Error('saved_preview_fallback_blocked_use');
  return true;
};
globalThis.clipbuilderEmptyResolution = async () => {
  const before=globalThis.clipbuilderCardBounds();
  await fillLink();
  await wait(()=>document.querySelector('.youtube-card').textContent.includes('No English video available at 480p–1440p.'));
  await wait(()=>!document.querySelector('.youtube-preview img') && document.querySelector('.youtube-thumbnail svg'));
  if(document.querySelector('.youtube-card select') || button('Download video') || JSON.stringify(before)!==JSON.stringify(globalThis.clipbuilderCardBounds())) throw new Error('empty_resolution_unsafe_or_unstable');
  return true;
};
globalThis.clipbuilderShortPreview = async () => {
  await fillLink();
  await wait(()=>{const image=document.querySelector('.youtube-preview img');return image?.complete && image.naturalWidth;});
  const title=await wait(()=>document.querySelector('.youtube-video-title'));
  if(title.textContent!=='Short video' || title.classList.contains('is-overflowing') || getComputedStyle(title.querySelector('span')).animationName!=='none') throw new Error('fitting_title_should_not_scroll');
  return true;
};`;
    await page._client().send("Runtime.evaluate", { expression: driver });
    expect(
      await page.evaluate(() => globalThis.clipbuilderBeginResolve()),
    ).toBe(true);
    await lookupPending;
    expect(
      await page.evaluate(() => globalThis.clipbuilderLoadingState()),
    ).toMatchObject({
      spinner: true,
      animated: true,
      noProgress: true,
      disabled: true,
    });
    releaseLookup?.();
    await metadataPending;
    expect(
      await page.evaluate(() => globalThis.clipbuilderWaitResolutionLoading()),
    ).toBe(true);
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      expect(
        await page.evaluate(() => globalThis.clipbuilderLoadingState()),
      ).toEqual({
        spinner: true,
        animated: true,
        noProgress: true,
        disabled: true,
        fits: true,
      });
      // Height responds to viewport size, never to lookup state.
      expect(
        await page.evaluate(() => globalThis.clipbuilderCardBounds()),
      ).toEqual(cardBounds.get(`${width}x${height}`));
      const capture = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        join(evidence, `cl036-loading-${width}.png`),
        Buffer.from(capture.value.data, "base64"),
      );
    }
    await setMotion("reduce");
    expect(
      await page.evaluate(() => globalThis.clipbuilderLoadingState()),
    ).toMatchObject({ spinner: true, animated: true, noProgress: true });
    expect(
      await page.evaluate(() => globalThis.clipbuilderSpinnerAdvances()),
    ).toBe(true);
    await setMotion("no-preference");
    expect(
      await page.evaluate(() => globalThis.clipbuilderSpinnerAdvances()),
    ).toBe(true);
    releaseMetadata?.();
    expect(await page.evaluate(() => globalThis.clipbuilderResolveLink())).toBe(
      true,
    );
    expect({ lookups, metadata, imports, cancellations, opens }).toEqual({
      lookups: 1,
      metadata: 2,
      imports: 0,
      cancellations: 0,
      opens: 0,
    });
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      expect(
        await page.evaluate(() => globalThis.clipbuilderResolutionFits()),
      ).toBe(true);
      const preview = await page.evaluate(() =>
        globalThis.clipbuilderVideoPreview(),
      );
      expect(preview).toEqual({
        loaded: true,
        overflow: true,
        animated: true,
        fullTitle: true,
        arrow: true,
        options: ["Select resolution", "1080p", "720p"],
      });
      expect(
        await page.evaluate(() => globalThis.clipbuilderCardBounds()),
      ).toEqual(cardBounds.get(`${width}x${height}`));
      const capture = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        join(evidence, "cl032-resolution-" + width + ".png"),
        Buffer.from(capture.value.data, "base64"),
      );
    }
    expect(
      await page.evaluate(() => globalThis.clipbuilderDownloadAndCancel()),
    ).toBe(true);
    const progressMetrics = [];
    for (const [stage, downloadedBytes, totalBytes, label, value] of [
      ["queued", 0, null, "Starting download…", null],
      ["video", 3, 8, "Downloading video…", "37"],
      ["audio", 6, 8, "Downloading audio…", "75"],
      ["merging", 8, 8, "Preparing video…", null],
      ["inspecting", 8, 8, "Checking video…", null],
      ["publishing", 8, 8, "Saving video…", null],
    ] as const) {
      downloadState = {
        id: downloadId,
        mode: "provider-source",
        stage,
        downloadedBytes,
        totalBytes,
        variantId: null,
        error: null,
      };
      await vi.waitFor(
        async () =>
          expect(
            await page.evaluate(() => globalThis.clipbuilderTransferState()),
          ).toMatchObject({ label, value }),
        { timeout: 5000 },
      );
      for (const [width, height] of [
        [1440, 900],
        [390, 844],
        [320, 568],
      ] as const) {
        await page.setViewport({ width, height, deviceScaleFactor: 1 });
        const ctas = await page.evaluate(() =>
          globalThis.clipbuilderCtaLayout(),
        );
        const transfer = await page.evaluate(() =>
          globalThis.clipbuilderTransferState(),
        );
        expect(ctas.footer).toBe(footerPositions.get(`${width}x${height}`));
        expect(ctas).toMatchObject({
          sameRow: true,
          aligned: true,
          inside: true,
          minimum: 44,
        });
        expect(transfer).toMatchObject({
          replaced: true,
          nativeAbsent: true,
          rounded: true,
          blue: true,
          value,
          label,
          animated: value === null,
        });
        if (width !== 320) expect(transfer.bodyFits).toBe(true);
        expect(
          await page.evaluate(() => globalThis.clipbuilderCardBounds()),
        ).toEqual(cardBounds.get(`${width}x${height}`));
        progressMetrics.push({ stage, width, ctas, transfer });
        if (stage === "video") {
          await page.evaluate(() => globalThis.clipbuilderRevealYoutube());
          const capture = await page._client().send("Page.captureScreenshot", {
            format: "png",
            fromSurface: true,
          });
          await writeFile(
            join(evidence, `cl041-transfer-${width}.png`),
            Buffer.from(capture.value.data, "base64"),
          );
        }
      }
    }
    downloadState = {
      id: downloadId,
      mode: "provider-source",
      stage: "failed",
      downloadedBytes: 8,
      totalBytes: 8,
      variantId: null,
      error: "failed",
    };
    expect(
      await page.evaluate(() => globalThis.clipbuilderWaitDownloadFailure()),
    ).toBe(true);
    expect(
      await page.evaluate(() => globalThis.clipbuilderDownloadAndCancel()),
    ).toBe(true);
    expect(
      await page.evaluate(() => globalThis.clipbuilderFinishDownload()),
    ).toBe(true);
    expect(submittedImport).toEqual({
      destination: "downloads",
      request: {
        sourceId: offer.sourceId,
        revision: offer.revision,
        choiceId: selected.id,
        selection: { kind: "variant" },
      },
    });
    expect({ imports, cancellations }).toEqual({
      imports: 2,
      cancellations: 1,
    });
    startupUnavailable = true;
    startupReads = { capabilities: 0, workspace: 0 };
    capabilitiesReady = new Promise<void>((done) => {
      releaseCapabilities = done;
    });
    workspaceReady = new Promise<void>((done) => {
      releaseWorkspace = done;
    });
    await page.goto({ url: "http://localhost:" + port + "/", timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: intakeDriver });
    await vi.waitFor(() =>
      expect(startupReads).toEqual({ capabilities: 1, workspace: 1 }),
    );
    const previousStatusReads = statusReads;
    releaseCapabilities();
    expect(
      await page.evaluate(() => globalThis.clipbuilderStartupFailed()),
    ).toBe(true);
    await vi.waitFor(() => expect(startupAborts).toBe(1));
    expect(statusReads).toBe(previousStatusReads);
    releaseWorkspace();
    startupUnavailable = false;
    offline = true;
    downloadState = null;
    await page.goto({ url: "http://localhost:" + port + "/", timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    await page._client().send("Runtime.evaluate", { expression: intakeDriver });
    expect(
      await page.evaluate(() => globalThis.clipbuilderPrepareOffline()),
    ).toBe(true);
    expect({ metadata, imports, opens, thumbnails }).toEqual({
      metadata: 2,
      imports: 2,
      opens: 0,
      thumbnails: 1,
    });
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      expect(
        await page.evaluate(() => globalThis.clipbuilderCardBounds()),
      ).toEqual(cardBounds.get(`${width}x${height}`));
      expect(
        await page.evaluate(() => globalThis.clipbuilderResolutionFits()),
      ).toBe(true);
      expect(
        await page.evaluate(() => globalThis.clipbuilderCtaLayout()),
      ).toMatchObject({
        sameRow: true,
        aligned: true,
        inside: true,
        minimum: 44,
      });
      await page.evaluate(() => globalThis.clipbuilderRevealYoutube());
      const capture = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        join(evidence, `cl043-saved-preview-${width}.png`),
        Buffer.from(capture.value.data, "base64"),
      );
    }
    expect(savedPreviewRequests).toBeGreaterThan(0);
    expect(await page.evaluate(() => globalThis.clipbuilderOpenOffline())).toBe(
      true,
    );
    await vi.waitFor(() => expect(releaseOpen).toBeTypeOf("function"));
    expect(
      await page.evaluate(() => globalThis.clipbuilderSpinnerAdvances()),
    ).toBe(true);
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      expect(
        await page.evaluate(() => globalThis.clipbuilderOpeningState()),
      ).toBe(true);
      expect(
        await page.evaluate(() => globalThis.clipbuilderCardBounds()),
      ).toEqual(cardBounds.get(`${width}x${height}`));
      expect(
        await page.evaluate(() => globalThis.clipbuilderCtaLayout()),
      ).toMatchObject({
        sameRow: true,
        aligned: true,
        inside: true,
        minimum: 44,
      });
      await page.evaluate(() => globalThis.clipbuilderRevealYoutube());
      const capture = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        join(evidence, `cl044-opening-${width}.png`),
        Buffer.from(capture.value.data, "base64"),
      );
    }
    releaseOpen?.(503);
    expect(await page.evaluate(() => globalThis.clipbuilderOpenFailed())).toBe(
      true,
    );
    expect(await page.evaluate(() => globalThis.clipbuilderOpenOffline())).toBe(
      true,
    );
    await vi.waitFor(() => expect(releaseOpen).toBeTypeOf("function"));
    expect(
      await page.evaluate(() => globalThis.clipbuilderOpeningState()),
    ).toBe(true);
    releaseOpen?.(200);
    expect(
      await page.evaluate(() => globalThis.clipbuilderOpenedOffline()),
    ).toBe(true);
    expect(
      await page.evaluate(() => globalThis.clipbuilderMomentFooterReady()),
    ).toBe(true);
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      expect(
        await page.evaluate(() => globalThis.clipbuilderMomentFooterFits()),
      ).toBe(true);
      const capture = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        join(evidence, `cl045-moments-${width}.png`),
        Buffer.from(capture.value.data, "base64"),
      );
    }
    expect(
      await page.evaluate(() => globalThis.clipbuilderManualControls()),
    ).toBe(true);
    const beforeCapture = mutations;
    expect(
      await page.evaluate(() => globalThis.clipbuilderCaptureTimes()),
    ).toBe(true);
    expect(mutations).toBe(beforeCapture);
    expect(analysisPosts).toBe(0);
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      expect(
        await page.evaluate(() => globalThis.clipbuilderManualTimesFit()),
      ).toBe(true);
      const capture = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        join(evidence, `cl047-manual-times-${width}.png`),
        Buffer.from(capture.value.data, "base64"),
      );
    }
    expect(
      await page.evaluate(() => globalThis.clipbuilderSubmitManualTimes()),
    ).toBe(true);
    await vi.waitFor(() => expect(analysisPosts).toBe(1));
    expect(submittedAnalysis).toMatchObject({
      ranges: [
        { startMs: 0, endMs: 1000 },
        { startMs: 1000, endMs: 2000 },
      ],
    });
    expect(await page.evaluate(() => globalThis.clipbuilderCaptureBusy())).toBe(
      true,
    );
    releaseAnalysis?.();
    expect(
      await page.evaluate(() => globalThis.clipbuilderMomentFooterReady()),
    ).toBe(true);
    expect(
      await page.evaluate(() => globalThis.clipbuilderRetryMoments()),
    ).toBe(true);
    await vi.waitFor(() => expect(analysisPosts).toBe(2));
    releaseAnalysis?.();
    expect(
      await page.evaluate(() => globalThis.clipbuilderMomentResults()),
    ).toBe(true);
    const beforeTabs = mutations;
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      expect(
        await page.evaluate(() => globalThis.clipbuilderMomentResultsFit()),
      ).toBe(true);
      const capture = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        join(evidence, `cl048-clip-tabs-${width}.png`),
        Buffer.from(capture.value.data, "base64"),
      );
    }
    expect(await page.evaluate(() => globalThis.clipbuilderMomentTabs())).toBe(
      true,
    );
    await vi.waitFor(() => expect(analysisPosts).toBe(3));
    expect(mutations).toBe(beforeTabs + 1);
    releaseAnalysis?.();
    expect(
      await page.evaluate(() => globalThis.clipbuilderEmptyMoments()),
    ).toBe(true);
    expect({ lookups, metadata, imports, cancellations, opens }).toEqual({
      lookups: 2,
      metadata: 2,
      imports: 2,
      cancellations: 1,
      opens: 2,
    });
    expect(submittedOpen).toEqual({
      destination: "downloads",
      variantId: saved.id,
    });
    expect(thumbnails).toBe(1);
    savedPreviewUnavailable = true;
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    expect(
      await page.evaluate(() => globalThis.clipbuilderSavedFallback()),
    ).toBe(true);
    expect({ metadata, imports, opens, thumbnails }).toEqual({
      metadata: 2,
      imports: 2,
      opens: 2,
      thumbnails: 1,
    });
    savedPreviewUnavailable = false;
    offline = false;
    noEnglish = true;
    thumbnailUnavailable = true;
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: intakeDriver });
    await page._client().send("Runtime.evaluate", { expression: driver });
    expect(await page.evaluate(() => globalThis.clipbuilderIntakeReady())).toBe(
      true,
    );
    expect(
      await page.evaluate(() => globalThis.clipbuilderEmptyResolution()),
    ).toBe(true);
    noEnglish = false;
    thumbnailUnavailable = false;
    shortTitle = true;
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    expect(
      await page.evaluate(() => globalThis.clipbuilderShortPreview()),
    ).toBe(true);
    expect({
      lookups,
      metadata,
      imports,
      cancellations,
      opens,
      thumbnails,
    }).toEqual({
      lookups: 5,
      metadata: 4,
      imports: 2,
      cancellations: 1,
      opens: 2,
      thumbnails: 3,
    });
    await writeFile(
      join(evidence, "cl032-layout.json"),
      JSON.stringify({
        metrics,
        startupMetrics,
        progressMetrics,
        thumbnails,
        mutations,
        lookups,
        metadata,
        imports,
        cancellations,
        opens,
      }),
    );
  } finally {
    closing = true;
    releaseOpen?.(503);
    releaseCapabilities();
    releaseWorkspace();
    releaseLookup?.();
    releaseMetadata?.();
    releaseAnalysis?.();
    await browser?.close({ silent: true });
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
    try {
      expect(server.listening).toBe(false);
      if (resources) expect((await resources.finish()).survivors).toBe(0);
    } finally {
      await clearDesignScratch(directory);
    }
  }
}, 60_000);
