import { expect, it, vi } from "vitest";
import { uploadHostedVideo, type HostedUploadProgress } from "./hosted-upload";
import { HOSTED_EDITING_POLICY } from "../../../../../packages/contracts/local/hosted-editing.ts";

const uploadId = "00000000-0000-4000-8000-000000000001";
it("advances upload progress only after successful chunk acknowledgement, then leaves transfer for inspection", async () => {
  const size = HOSTED_EDITING_POLICY.chunkBytes + 17;
  const file = new File([new Uint8Array(size)], "synthetic.mp4");
  const events: HostedUploadProgress[] = [];
  let acknowledge: (() => void) | undefined;
  const transport = vi.fn<typeof fetch>(async (_input, init) => {
    if (init?.method === "POST" && events.length === 0)
      return Response.json({
        uploadId,
        chunkBytes: HOSTED_EDITING_POLICY.chunkBytes,
      });
    if (init?.method === "PUT") {
      await new Promise<void>((resolve) => {
        acknowledge = resolve;
      });
      return new Response(null, { status: 204 });
    }
    return new Response(null, { status: 503 });
  });
  const result = uploadHostedVideo(
    file,
    new AbortController().signal,
    transport,
    (event) => events.push(event),
  );
  const failed = expect(result).rejects.toThrow("upload_unavailable");
  await vi.waitFor(() => expect(acknowledge).toBeTypeOf("function"));
  expect(events).toEqual([{ phase: "uploading", received: 0, total: size }]);
  const first = acknowledge;
  first!();
  await vi.waitFor(() => expect(acknowledge).not.toBe(first));
  expect(events.at(-1)).toEqual({
    phase: "uploading",
    received: HOSTED_EDITING_POLICY.chunkBytes,
    total: size,
  });
  acknowledge!();
  await failed;
  expect(events.slice(-2)).toEqual([
    { phase: "uploading", received: size, total: size },
    { phase: "inspecting", received: size, total: size },
  ]);
  expect(transport).toHaveBeenCalledTimes(4);
});

it("does not count a rejected chunk or start inspection after failed transfer", async () => {
  const progress = vi.fn();
  const transport = vi.fn<typeof fetch>(async (_input, init) =>
    init?.method === "PUT"
      ? new Response(null, { status: 503 })
      : Response.json({
          uploadId,
          chunkBytes: HOSTED_EDITING_POLICY.chunkBytes,
        }),
  );
  await expect(
    uploadHostedVideo(
      new File([new Uint8Array(32)], "synthetic.mp4"),
      new AbortController().signal,
      transport,
      progress,
    ),
  ).rejects.toThrow("upload_unavailable");
  expect(progress.mock.calls).toEqual([
    [{ phase: "uploading", received: 0, total: 32 }],
  ]);
  expect(transport).toHaveBeenCalledTimes(2);
});
