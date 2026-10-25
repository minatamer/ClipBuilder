import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  createOwnerHost,
  type OwnerHostOptions,
} from "../apps/backend/local/server.ts";
import { fakeOwnerAnalysis } from "../apps/backend/local/fake-analysis.ts";
import { editorContentFixture as fakeOwnerClipPreparation } from "./owner-content-fixture.ts";
import { ownerWorkspaceSchema } from "../packages/contracts/local/index.ts";
import { ownerAnalysisSchema } from "../packages/contracts/local/selection.ts";
import {
  ownerClipListSchema,
  type OwnerClip,
} from "../packages/contracts/local/clips.ts";
import {
  OWNER_CAPTION_PRESETS,
  type OwnerEditRequest,
} from "../packages/contracts/local/editor.ts";
import {
  ownerAgentClipSchema,
  ownerAgentClipListSchema,
  ownerAgentStatusSchema,
  ownerAgentValidationSchema,
} from "../packages/contracts/local/agent.ts";
import { compileOwnerOverlay } from "../packages/contracts/local/edit-overlay.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";

// Only the protected HTTP coordinator runs here. AI and native media ports are
// counted doubles; output bytes deliberately are not an encoded video.
const source = Buffer.from("synthetic agent source, never returned by status"),
  auth = { Authorization: "Bearer agent-api-test" },
  json = { ...auth, "Content-Type": "application/json" },
  prefix = join(tmpdir(), "clipbuilder-owner-agent-api-");
const analysis = {
  mode: "synthetic-ai" as const,
  transcribe: vi.fn(fakeOwnerAnalysis.transcribe),
  select: vi.fn(fakeOwnerAnalysis.select),
};
const preparation = {
  mode: "synthetic-ai" as const,
  plan: vi.fn(fakeOwnerClipPreparation.plan),
  image: vi.fn(fakeOwnerClipPreparation.image),
};
type Context = {
  host: ReturnType<typeof createOwnerHost>;
  media: ReturnType<typeof vi.fn<OwnerHostOptions["media"]>>;
  port: number;
  root: string;
};
let directory: string, context: Context | undefined;
let releases: Array<() => void>;
const hash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const ui = (workspaceId: string, clipId?: string) =>
  `/api/workspace/${workspaceId}/clips${clipId ? `/${clipId}` : ""}`;
const agent = (workspaceId: string, clipId: string) =>
  `/api/agent/workspace/${workspaceId}/clips/${clipId}`;

beforeEach(async () => {
  vi.clearAllMocks();
  directory = await mkdtemp(prefix);
  context = undefined;
  releases = [];
});
afterEach(async () => {
  for (const release of releases) release();
  if (!directory.startsWith(prefix)) throw new Error("unowned_test_scratch");
  try {
    if (context) {
      await context.host.close();
      expect(context.host.server.listening).toBe(false);
      expect(await readdir(context.root)).toEqual([]);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
async function start() {
  const root = join(directory, "scratch");
  await mkdir(root);
  const media = vi.fn<OwnerHostOptions["media"]>(async (job, signal) => {
    signal.throwIfAborted();
    if (job.operation === "inspect")
      return {
        operation: "inspect",
        source: {
          fingerprint: createHash("sha256").update(source).digest("hex"),
          bytes: source.length,
          durationMs: 16000,
          width: 320,
          height: 180,
          fps: 30,
        },
      };
    if (job.operation !== "clip") throw new Error("unexpected_media_job");
    const bytes = Buffer.from(
      `synthetic output:${job.clipId}:${job.renderRevision}`,
    );
    await writeFile(
      join(root, job.workspaceId, `${job.clipId}.r${job.renderRevision}.mp4`),
      bytes,
    );
    return {
      operation: "clip",
      frames: job.overlay.frames,
      bytes: bytes.length,
      durationMs: Math.round((job.overlay.frames * 1000) / 30),
    };
  });
  const host = createOwnerHost({
    root,
    ui: directory,
    token: "agent-api-test",
    port: 0,
    analysis,
    clipPreparation: preparation,
    media,
  });
  context = { host, root, media, port: await listenOwner(host.server) };
  return context;
}
const post = (value: Context, path: string, body?: unknown) =>
  ownerRequest(value.port, path, {
    method: "POST",
    headers: body === undefined ? auth : json,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
async function clips(value: Context, workspaceId: string) {
  const response = await ownerRequest(value.port, ui(workspaceId), {
    headers: auth,
  });
  expect(response.status).toBe(200);
  return ownerClipListSchema.parse(JSON.parse(response.body.toString()));
}
async function drain(value: Context, workspaceId: string) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const list = await clips(value, workspaceId);
    if (!list.active) return list;
    await new Promise((done) => setTimeout(done, 5));
  }
  throw new Error("synthetic_agent_work_did_not_drain");
}
async function prepare(value: Context) {
  const uploaded = await ownerRequest(value.port, "/api/source", {
    method: "POST",
    headers: { ...auth, "Content-Type": "video/mp4" },
    body: source,
  });
  expect(uploaded.status).toBe(200);
  const workspace = ownerWorkspaceSchema.parse(
    JSON.parse(uploaded.body.toString()),
  );
  const response = await post(
    value,
    `/api/workspace/${workspace.id}/analysis`,
    {
      sourceRevision: 0,
      policyRevision: 1,
      ranges: [
        { id: randomUUID(), startMs: 200, endMs: 1200 },
        { id: randomUUID(), startMs: 2000, endMs: 4000 },
      ],
      aiDuration: { minMs: 10000, maxMs: 10000 },
      manualOnly: false,
    },
  );
  expect(response.status).toBe(200);
  const analyzed = ownerAnalysisSchema.parse(
    JSON.parse(response.body.toString()),
  );
  expect(
    (
      await post(value, ui(workspace.id), {
        operationId: randomUUID(),
        analysisId: analyzed.id,
        sourceRevision: 0,
        policyRevision: 1,
        momentIds: [...analyzed.manual, analyzed.suggestions[0]!].map(
          (moment) => moment.id,
        ),
      })
    ).status,
  ).toBe(202);
  const list = await drain(value, workspace.id);
  expect(list.clips.map((clip) => clip.state)).toEqual([
    "ready",
    "ready",
    "ready",
  ]);
  counts(value, 3);
  return { workspace, list };
}
function edit(
  clip: OwnerClip,
  operations: OwnerEditRequest["operations"],
): OwnerEditRequest {
  return {
    operationId: randomUUID(),
    expectedRevision: clip.revision,
    baseHash: clip.baseHash!,
    operations,
  };
}
function counts(value: Context, nativeAttempts: number) {
  expect(analysis.transcribe).toHaveBeenCalledTimes(1);
  expect(analysis.select).toHaveBeenCalledTimes(1);
  expect(preparation.plan).toHaveBeenCalledTimes(3);
  expect(preparation.image).toHaveBeenCalledTimes(3);
  expect(value.media).toHaveBeenCalledTimes(nativeAttempts + 1);
}
function safeProjection(value: unknown) {
  const forbidden = new Set([
    "base",
    "edit",
    "words",
    "wordCues",
    "text",
    "lines",
    "prompt",
    "payload",
    "provider",
    "path",
    "filename",
    "token",
    "capability",
    "authorization",
    "sourceUrl",
    "transcript",
  ]);
  const inspect = (item: unknown) => {
    if (typeof item === "string") {
      expect(item).not.toContain(directory);
      expect(item).not.toContain(source.toString());
      expect(item).not.toContain("agent-api-test");
    } else if (Array.isArray(item)) item.forEach(inspect);
    else if (item && typeof item === "object")
      for (const [key, child] of Object.entries(item)) {
        expect(forbidden.has(key)).toBe(false);
        inspect(child);
      }
  };
  inspect(value);
}

it("projects only safe metadata and validates without writes, then shares one edit and overlay hash across agent and UI routes", async () => {
  const value = await start(),
    { workspace, list } = await prepare(value),
    first = list.clips[0]!;
  const statusResponse = await ownerRequest(value.port, "/api/agent/status", {
    headers: auth,
  });
  expect(statusResponse.status).toBe(200);
  const status = ownerAgentStatusSchema.parse(
    JSON.parse(statusResponse.body.toString()),
  );
  expect(status.workspace?.id).toBe(workspace.id);
  expect(status.clips).toHaveLength(3);
  safeProjection(status);
  for (const clip of list.clips) {
    const response = await ownerRequest(
      value.port,
      agent(workspace.id, clip.id),
      { headers: auth },
    );
    expect(response.status).toBe(200);
    const inspected = ownerAgentClipSchema.parse(
      JSON.parse(response.body.toString()),
    );
    expect(inspected.overlayHash).toBe(
      hash(compileOwnerOverlay(clip.base!, clip.edit, clip.assets)),
    );
    safeProjection(inspected);
    for (const caption of clip.base!.overlay.captions)
      expect(response.body.toString()).not.toContain(caption.text);
  }
  const cue = first.base!.overlay.visuals[0]!;
  const request = edit(first, [
    {
      kind: "caption",
      style: {
        ...OWNER_CAPTION_PRESETS.classic,
        box: { ...OWNER_CAPTION_PRESETS.classic.box, y: 0.6 },
      },
    },
    {
      kind: "visual-upsert",
      cue: {
        id: cue.id,
        assetId: cue.assetId,
        startFrame: cue.startFrame,
        endFrame: cue.endFrame,
        box: { x: 0.2, y: 0.15, width: 0.6, height: 0.3 },
        fit: "cover",
      },
    },
  ]);
  const before = await clips(value, workspace.id);
  const validateResponse = await post(
    value,
    `${agent(workspace.id, first.id)}/validate`,
    request,
  );
  expect(validateResponse.status).toBe(200);
  const validation = ownerAgentValidationSchema.parse(
    JSON.parse(validateResponse.body.toString()),
  );
  expect(validation.nextRevision).toBe(1);
  expect(validation.captions?.preset).toBe("classic");
  expect(validation.visuals[0]!.box).toEqual({
    x: 0.2,
    y: 0.15,
    width: 0.6,
    height: 0.3,
  });
  safeProjection(validation);
  expect(await clips(value, workspace.id)).toEqual(before);
  counts(value, 3);
  const uiValidation = await post(
    value,
    `${ui(workspace.id, first.id)}/validate`,
    request,
  );
  expect(uiValidation.status).toBe(200);
  expect(
    ownerAgentValidationSchema.parse(JSON.parse(uiValidation.body.toString())),
  ).toEqual(validation);
  const applied = await post(
    value,
    `${agent(workspace.id, first.id)}/edit`,
    request,
  );
  expect(applied.status).toBe(200);
  const safeList = ownerAgentClipListSchema.parse(
    JSON.parse(applied.body.toString()),
  );
  expect(safeList.clips[0]!.revision).toBe(1);
  expect(safeList.clips[0]!.overlayHash).toBe(validation.overlayHash);
  safeProjection(safeList);
  expect(
    (await post(value, `${agent(workspace.id, first.id)}/edit`, request))
      .status,
  ).toBe(200);
  const uiReply = await post(
    value,
    `${ui(workspace.id, first.id)}/edit`,
    request,
  );
  expect(uiReply.status).toBe(200);
  const updated = ownerClipListSchema.parse(
    JSON.parse(uiReply.body.toString()),
  );
  expect(updated.clips[0]!.edit?.revision).toBe(validation.nextRevision);
  expect(updated.clips[0]!.edit?.captions).toEqual(validation.captions);
  expect(
    hash(
      compileOwnerOverlay(
        updated.clips[0]!.base!,
        updated.clips[0]!.edit,
        updated.clips[0]!.assets,
      ),
    ),
  ).toBe(validation.overlayHash);
  expect(updated.clips.slice(1)).toEqual(list.clips.slice(1));
  counts(value, 3);
});

it("gives concurrent UI and agent edits one winning revision and rejects stale or invalid writes without repeating work", async () => {
  const value = await start(),
    { workspace, list } = await prepare(value),
    first = list.clips[0]!;
  const uiEdit = edit(first, [
    { kind: "caption", style: OWNER_CAPTION_PRESETS.bold },
  ]);
  const agentEdit = edit(first, [
    { kind: "caption", style: OWNER_CAPTION_PRESETS.classic },
  ]);
  const replies = await Promise.all([
    post(value, `${ui(workspace.id, first.id)}/edit`, uiEdit),
    post(value, `${agent(workspace.id, first.id)}/edit`, agentEdit),
  ]);
  expect(replies.map((reply) => reply.status).sort()).toEqual([200, 409]);
  const updated = await clips(value, workspace.id);
  expect(updated.clips[0]!.revision).toBe(1);
  expect(updated.clips.slice(1)).toEqual(list.clips.slice(1));
  const loser = replies[0]!.status === 409 ? uiEdit : agentEdit;
  expect(
    (await post(value, `${agent(workspace.id, first.id)}/edit`, loser)).status,
  ).toBe(409);
  const invalid = edit(updated.clips[0]!, [
    {
      kind: "caption",
      style: { ...OWNER_CAPTION_PRESETS.clean, fontSize: 1000 },
    },
  ]);
  expect(
    (await post(value, `${ui(workspace.id, first.id)}/edit`, invalid)).status,
  ).toBe(400);
  expect(
    (await post(value, `${agent(workspace.id, first.id)}/edit`, invalid))
      .status,
  ).toBe(400);
  const unknownProperty = {
    ...edit(updated.clips[0]!, [{ kind: "reset", panel: "captions" }]),
    remoteUrl: "https://untrusted.invalid/picture",
  };
  expect(
    (
      await post(
        value,
        `${agent(workspace.id, first.id)}/validate`,
        unknownProperty,
      )
    ).status,
  ).toBe(400);
  expect(await clips(value, workspace.id)).toEqual(updated);
  counts(value, 3);
});

it("deduplicates a held agent render and cancels it only after drain while preserving newer edits, old outputs and source", async () => {
  const value = await start(),
    { workspace, list } = await prepare(value),
    first = list.clips[0]!;
  const oldOutput = await ownerRequest(
    value.port,
    `${ui(workspace.id, first.id)}/output/0`,
    { headers: auth },
  );
  expect(oldOutput.status).toBe(200);
  let enter!: () => void, release!: () => void;
  const entered = new Promise<void>((done) => {
    enter = done;
  });
  const held = new Promise<void>((done) => {
    release = done;
  });
  releases.push(release);
  value.media.mockImplementationOnce(async (_job, signal) => {
    enter();
    await held;
    signal.throwIfAborted();
    throw new Error("synthetic_cancel_was_not_delivered");
  });
  const request = {
    operationId: randomUUID(),
    expectedRevision: first.revision,
  };
  expect(
    (await post(value, `${agent(workspace.id, first.id)}/render`, request))
      .status,
  ).toBe(202);
  await entered;
  expect(
    (await post(value, `${agent(workspace.id, first.id)}/render`, request))
      .status,
  ).toBe(202);
  const changed = await post(
    value,
    `${agent(workspace.id, first.id)}/edit`,
    edit(first, [{ kind: "caption", style: OWNER_CAPTION_PRESETS.classic }]),
  );
  expect(changed.status).toBe(200);
  const changing = ownerAgentClipListSchema.parse(
    JSON.parse(changed.body.toString()),
  );
  expect(changing.clips[0]).toMatchObject({ revision: 1, state: "rendering" });
  const canceled = await post(value, `${agent(workspace.id, first.id)}/cancel`);
  expect(canceled.status).toBe(200);
  const canceling = ownerAgentClipListSchema.parse(
    JSON.parse(canceled.body.toString()),
  );
  expect(canceling.active).toBe(true);
  expect(canceling.clips[0]!.state).toBe("canceling");
  safeProjection(canceling);
  counts(value, 4);
  release();
  const completed = await drain(value, workspace.id);
  expect(completed.clips[0]).toMatchObject({
    revision: 1,
    state: "canceled",
    error: "canceled",
  });
  expect(completed.clips[0]!.outputs).toEqual(first.outputs);
  expect(completed.clips[0]!.edit?.captions?.preset).toBe("classic");
  expect(completed.clips.slice(1)).toEqual(list.clips.slice(1));
  const retained = await ownerRequest(
    value.port,
    `${ui(workspace.id, first.id)}/output/0`,
    { headers: auth },
  );
  expect(retained.status).toBe(200);
  expect(retained.body).toEqual(oldOutput.body);
  const sourceReply = await ownerRequest(
    value.port,
    `/api/workspace/${workspace.id}/source`,
    { headers: auth },
  );
  expect(sourceReply.status).toBe(200);
  expect(sourceReply.body).toEqual(source);
  expect(
    (await post(value, `${agent(workspace.id, first.id)}/render`, request))
      .status,
  ).toBe(202);
  expect((await clips(value, workspace.id)).active).toBe(false);
  counts(value, 4);
});

it("rejects unknown clips, capabilities, origins, hosts and forbidden agent route expansions before any new work", async () => {
  const value = await start(),
    { workspace, list } = await prepare(value),
    first = list.clips[0]!;
  for (const headers of [
    {},
    { Authorization: "Bearer expired-synthetic-capability" },
    { ...auth, Host: `untrusted.invalid:${value.port}` },
    { ...auth, Origin: "https://untrusted.invalid" },
    { ...auth, "Sec-Fetch-Site": "cross-site" },
  ])
    expect(
      (await ownerRequest(value.port, "/api/agent/status", { headers })).status,
    ).toBe(403);
  expect(
    (
      await ownerRequest(value.port, agent(workspace.id, randomUUID()), {
        headers: auth,
      })
    ).status,
  ).toBe(404);
  expect(
    (
      await post(
        value,
        `${agent(workspace.id, randomUUID())}/edit`,
        edit(first, [{ kind: "reset", panel: "captions" }]),
      )
    ).status,
  ).toBe(404);
  const forbidden = [
    `/api/agent/workspace/${workspace.id}/analysis`,
    `/api/agent/workspace/${workspace.id}/source`,
    `/api/agent/workspace/${workspace.id}/assets/${first.assets[0]!.id}`,
    `${agent(workspace.id, first.id)}/source`,
    `${agent(workspace.id, first.id)}/output/0`,
    `${agent(workspace.id, first.id)}/analysis`,
    `/api/agent/workspace/${workspace.id}/clips`,
  ];
  for (const path of forbidden) {
    expect(
      (await ownerRequest(value.port, path, { headers: auth })).status,
    ).toBe(404);
    expect(
      (await post(value, path, { operationId: randomUUID() })).status,
    ).toBe(404);
  }
  const unauthorized = await ownerRequest(
    value.port,
    `${agent(workspace.id, first.id)}/edit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit(first, [{ kind: "reset", panel: "captions" }])),
    },
  );
  expect(unauthorized.status).toBe(403);
  expect(await clips(value, workspace.id)).toEqual(list);
  counts(value, 3);
});
