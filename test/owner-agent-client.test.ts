import { afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import {
  mkdir,
  link as linkFile,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import {
  executeOwnerAgentCommand,
  OWNER_AGENT_INPUT_BYTES,
  ownerAgentFailureCode,
  type OwnerAgentPorts,
} from "../apps/backend/owner/agent-client.ts";
import {
  ownerAgentPicturePath,
  readOwnerAgentCommand,
  readOwnerAgentPicture,
} from "../apps/backend/owner/agent-cli.ts";
import { ownerAgentClipSchema } from "../packages/contracts/owner/agent.ts";
import { OWNER_CAPTION_PRESETS } from "../packages/contracts/owner/editor.ts";
import { OWNER_PICTURE_LIMITS } from "../packages/contracts/owner/assets.ts";

const workspaceId = randomUUID(),
  clipId = randomUUID(),
  draftId = randomUUID(),
  token = "a".repeat(64),
  clip = ownerAgentClipSchema.parse({
    id: clipId,
    momentId: randomUUID(),
    analysisId: randomUUID(),
    mode: "synthetic-ai",
    sourceRevision: 0,
    revision: 0,
    baseHash: "b".repeat(64),
    state: "ready",
    assets: [],
    outputs: [],
    calls: { plan: 1, image: 0, render: 1 },
    error: null,
    captions: null,
    visuals: [],
    overlayHash: "c".repeat(64),
  }),
  patch = {
    operationId: randomUUID(),
    expectedRevision: 0,
    baseHash: clip.baseHash!,
    operations: [
      { kind: "caption" as const, style: OWNER_CAPTION_PRESETS.classic },
    ],
  },
  renderRequest = { operationId: randomUUID(), expectedRevision: 0 },
  prefix = `/api/agent/workspace/${workspaceId}/clips/${clipId}`,
  workspace = {
    id: workspaceId,
    mode: "unavailable",
    revision: 0,
    source: {
      fingerprint: "d".repeat(64),
      bytes: 100,
      durationMs: 16000,
      width: 320,
      height: 180,
      fps: 30,
    },
  },
  status = { workspace, active: false, clips: [clip] },
  list = { clips: [clip], active: false, workers: 1 },
  draft = { id: draftId, state: "saved", savedAt: "2026-10-22T00:00:00.000Z" },
  drafts = [{ id: draftId, savedAt: draft.savedAt, clips: 1 }],
  validation = {
    clipId,
    sourceRevision: 0,
    expectedRevision: 0,
    nextRevision: 1,
    baseHash: clip.baseHash,
    overlayHash: "e".repeat(64),
    captions: OWNER_CAPTION_PRESETS.classic,
    visuals: [],
  };
const ports = () => ({
  discover: vi.fn<OwnerAgentPorts["discover"]>(async () => ({ token })),
  picture: vi.fn<OwnerAgentPorts["picture"]>(async () =>
    Buffer.from("synthetic-image-bytes"),
  ),
  transport: vi.fn<OwnerAgentPorts["transport"]>(async () => ({
    status: 200,
    value: list,
  })),
});

it.each([
  [{ command: "status" }, "/api/agent/status", "GET", status, "status"],
  [{ command: "inspect", workspaceId, clipId }, prefix, "GET", clip, "clip"],
  [
    { command: "validate", workspaceId, clipId, request: patch },
    `${prefix}/validate`,
    "POST",
    validation,
    "validation",
  ],
  [
    { command: "apply", workspaceId, clipId, request: patch },
    `${prefix}/edit`,
    "POST",
    list,
    "clip",
  ],
  [
    { command: "render", workspaceId, clipId, request: renderRequest },
    `${prefix}/render`,
    "POST",
    list,
    "clip",
  ],
  [
    { command: "cancel", workspaceId, clipId },
    `${prefix}/cancel`,
    "POST",
    list,
    "clip",
  ],
  [{ command: "drafts" }, "/api/drafts", "GET", drafts, "drafts"],
  [
    { command: "open-draft", draftId },
    `/api/drafts/${draftId}/open`,
    "POST",
    workspace,
    "opened",
  ],
  [
    { command: "save", workspaceId },
    `/api/workspace/${workspaceId}/draft`,
    "POST",
    draft,
    "draft",
  ],
] as const)(
  "routes the bounded %j command through its fixed protected endpoint",
  async (command, path, method, value, kind) => {
    const io = ports();
    io.transport.mockResolvedValue({ status: 200, value });
    const result = await executeOwnerAgentCommand(command, io);
    expect(result.kind).toBe(kind);
    expect(io.discover).toHaveBeenCalledTimes(1);
    expect(io.transport).toHaveBeenCalledTimes(1);
    expect(io.transport.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ path, method, token }),
    );
    expect(io.picture).toHaveBeenCalledTimes(0);
    expect(JSON.stringify(result)).not.toContain(token);
    if ("request" in command)
      expect(io.transport.mock.calls[0]?.[0].body).toEqual(command.request);
  },
);

it("authorizes the exact target before reading an explicit picture and excludes its path/bytes/capability from results", async () => {
  const io = ports(),
    sequence: string[] = [],
    path = "C:\\Pictures\\personal.png";
  io.transport.mockImplementation(async (request) => {
    sequence.push(request.method === "GET" ? "authorize" : "upload");
    return { status: 200, value: request.method === "GET" ? clip : list };
  });
  io.picture.mockImplementation(async (requested) => {
    sequence.push("file");
    expect(requested).toBe(path);
    return Buffer.from("synthetic private file bytes");
  });
  const result = await executeOwnerAgentCommand(
    { command: "picture", workspaceId, clipId, path },
    io,
  );
  expect(sequence).toEqual(["authorize", "file", "upload"]);
  expect(io.transport.mock.calls[1]?.[0]).toEqual({
    method: "POST",
    path: `${prefix}/picture`,
    token,
    contentType: "image/png",
    body: Buffer.from("synthetic private file bytes"),
  });
  const output = JSON.stringify(result);
  expect(output).not.toContain("Pictures");
  expect(output).not.toContain("private file");
  expect(output).not.toContain(token);
});

it.each([403, 404, 409])(
  "denies picture reads after a %i target response",
  async (code) => {
    const io = ports();
    io.transport.mockResolvedValue({
      status: code,
      value: { transcript: "not public" },
    });
    await expect(
      executeOwnerAgentCommand(
        {
          command: "picture",
          workspaceId,
          clipId,
          path: "C:\\Pictures\\personal.jpg",
        },
        io,
      ),
    ).rejects.toThrow(/^owner_agent_/u);
    expect(io.picture).toHaveBeenCalledTimes(0);
    expect(io.transport).toHaveBeenCalledTimes(1);
  },
);

it("rejects a mismatched safe target before reading its picture", async () => {
  const io = ports();
  io.transport.mockResolvedValue({
    status: 200,
    value: { ...clip, id: randomUUID() },
  });
  await expect(
    executeOwnerAgentCommand(
      {
        command: "picture",
        workspaceId,
        clipId,
        path: "C:\\Pictures\\personal.jpg",
      },
      io,
    ),
  ).rejects.toThrow("owner_agent_target_unavailable");
  expect(io.picture).toHaveBeenCalledTimes(0);
});

it.each([
  { command: "analyze", workspaceId },
  { command: "status", url: "https://invalid.example" },
  { command: "inspect", workspaceId: "../private", clipId },
  {
    command: "apply",
    workspaceId,
    clipId,
    request: { ...patch, operations: [{ kind: "shell", command: "anything" }] },
  },
  {
    command: "picture",
    workspaceId,
    clipId,
    path: "x".repeat(OWNER_AGENT_INPUT_BYTES),
  },
])(
  "rejects an unsupported command before discovery or other side effects",
  async (value) => {
    const io = ports();
    await expect(executeOwnerAgentCommand(value, io)).rejects.toThrow(
      "owner_agent_invalid_command",
    );
    expect(io.discover).toHaveBeenCalledTimes(0);
    expect(io.transport).toHaveBeenCalledTimes(0);
    expect(io.picture).toHaveBeenCalledTimes(0);
  },
);

it("keeps command IDs unchanged and makes no fallback call when a mutation conflicts", async () => {
  const io = ports();
  io.transport.mockResolvedValue({
    status: 409,
    value: { detail: "synthetic private response" },
  });
  await expect(
    executeOwnerAgentCommand(
      { command: "apply", workspaceId, clipId, request: patch },
      io,
    ),
  ).rejects.toThrow("owner_agent_conflict");
  expect(io.transport).toHaveBeenCalledTimes(1);
  expect(io.transport.mock.calls[0]?.[0].body).toEqual(patch);
  expect(io.picture).toHaveBeenCalledTimes(0);
});

it("emits only fixed safe failure codes for raw failures or extra response content", async () => {
  const io = ports();
  io.transport.mockRejectedValueOnce(
    new Error("private filename and provider secret"),
  );
  await expect(
    executeOwnerAgentCommand({ command: "status" }, io),
  ).rejects.toThrow("owner_agent_operation_failed");
  io.transport.mockResolvedValueOnce({
    status: 200,
    value: { ...status, dialogue: "private words" },
  });
  await expect(
    executeOwnerAgentCommand({ command: "status" }, io),
  ).rejects.toThrow("owner_agent_operation_failed");
  expect(ownerAgentFailureCode(new Error("private capability"))).toBe(
    "owner_agent_operation_failed",
  );
  io.discover.mockRejectedValueOnce(new Error("private runtime location"));
  await expect(
    executeOwnerAgentCommand({ command: "status" }, io),
  ).rejects.toThrow("owner_agent_unavailable");
});

it("honors cancellation before discovery and between authorized picture reading and upload", async () => {
  const io = ports(),
    controller = new AbortController();
  controller.abort();
  await expect(
    executeOwnerAgentCommand({ command: "status" }, io, controller.signal),
  ).rejects.toThrow("owner_agent_canceled");
  expect(io.discover).toHaveBeenCalledTimes(0);
  const during = new AbortController();
  io.transport.mockResolvedValue({ status: 200, value: clip });
  io.picture.mockImplementation(async () => {
    during.abort();
    return Buffer.from("synthetic");
  });
  await expect(
    executeOwnerAgentCommand(
      {
        command: "picture",
        workspaceId,
        clipId,
        path: "C:\\Pictures\\personal.jpg",
      },
      io,
      during.signal,
    ),
  ).rejects.toThrow("owner_agent_canceled");
  expect(io.transport).toHaveBeenCalledTimes(1);
});

it("accepts one bounded stdin JSON value and rejects oversized or trailing input", async () => {
  expect(
    await readOwnerAgentCommand(Readable.from(['{"command":', '"status"}'])),
  ).toEqual({ command: "status" });
  for (const input of [
    Buffer.alloc(OWNER_AGENT_INPUT_BYTES + 1),
    Buffer.from('{"command":"status"} {"command":"status"}'),
  ])
    await expect(readOwnerAgentCommand(Readable.from([input]))).rejects.toThrow(
      "owner_agent_invalid_command",
    );
});

it.each([
  "personal.jpg",
  "..\\personal.png",
  "C:\\Pictures\\..\\private.jpg",
  "\\\\server\\share\\picture.png",
  "\\\\?\\C:\\Pictures\\picture.png",
  "file:///C:/Pictures/picture.png",
  "C:\\Pictures\\NUL.jpg",
  "C:\\Pictures\\COM1.png",
  "C:\\Pictures\\picture.jpg:private",
  "C:\\Pictures\\picture.svg",
  "C:\\Pictures\\picture.png.",
  "C:\\Pictures\\picture\u0000.png",
  "C:\\Repository\\private\\picture.png",
])("rejects unsafe local picture syntax without filesystem access", (path) => {
  expect(() => ownerAgentPicturePath(path, "C:\\Repository")).toThrow(
    "owner_agent_picture_unavailable",
  );
});

it("rejects an escaped picture command before discovery, authorization or file access", async () => {
  const io = ports();
  await expect(
    executeOwnerAgentCommand(
      {
        command: "picture",
        workspaceId,
        clipId,
        path: "C:\\Pictures\\..\\private.png",
      },
      io,
    ),
  ).rejects.toThrow("owner_agent_picture_unavailable");
  expect(io.discover).toHaveBeenCalledTimes(0);
  expect(io.transport).toHaveBeenCalledTimes(0);
  expect(io.picture).toHaveBeenCalledTimes(0);
});

it("normalizes a permitted drive-local JPEG/PNG filename without accepting an input repository file", () => {
  expect(
    ownerAgentPicturePath("C:/Pictures/personal.PNG", "C:\\Repository"),
  ).toBe("C:\\Pictures\\personal.PNG");
  expect(() =>
    ownerAgentPicturePath("c:\\repository\\personal.JPG", "C:\\Repository"),
  ).toThrow("owner_agent_picture_unavailable");
});

const temporary: string[] = [];
afterEach(async () => {
  for (const directory of temporary.splice(0))
    await rm(directory, { recursive: true, force: true });
});
it("reads only a bounded regular explicit file and rejects junction ancestors/directories/oversize", async () => {
  const directory = await mkdtemp(
    join(tmpdir(), "clipbuilder-agent-picture-test-"),
  );
  temporary.push(directory);
  const image = join(directory, "personal.jpg"),
    bytes = Buffer.from([255, 216, 255, 0, 0]);
  await writeFile(image, bytes);
  expect(
    await readOwnerAgentPicture(image, new AbortController().signal),
  ).toEqual(bytes);
  const folder = join(directory, "folder.png"),
    outside = join(directory, "pictures"),
    link = join(directory, "linked");
  await mkdir(folder);
  await mkdir(outside);
  await writeFile(join(outside, "personal.jpg"), bytes);
  await symlink(
    outside,
    link,
    process.platform === "win32" ? "junction" : "dir",
  );
  for (const invalid of [folder, join(link, "personal.jpg")])
    await expect(
      readOwnerAgentPicture(invalid, new AbortController().signal),
    ).rejects.toThrow("owner_agent_picture_unavailable");
  const large = join(directory, "large.png");
  await writeFile(large, Buffer.alloc(OWNER_PICTURE_LIMITS.inputBytes + 1));
  await expect(
    readOwnerAgentPicture(large, new AbortController().signal),
  ).rejects.toThrow("owner_agent_picture_unavailable");
  expect(await readFile(join(outside, "personal.jpg"))).toEqual(bytes);
  const linkedFile = join(directory, "hardlink.jpg");
  await linkFile(image, linkedFile);
  await expect(
    readOwnerAgentPicture(linkedFile, new AbortController().signal),
  ).rejects.toThrow("owner_agent_picture_unavailable");
  await rm(linkedFile);
  const controller = new AbortController(),
    pending = readOwnerAgentPicture(image, controller.signal);
  queueMicrotask(() => controller.abort());
  await expect(pending).rejects.toThrow("owner_agent_canceled");
  expect(
    await readOwnerAgentPicture(image, new AbortController().signal),
  ).toEqual(bytes);
});
