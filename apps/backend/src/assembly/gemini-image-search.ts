import { boundedPictureBody } from "./picture-raster.js";
import { PictureHttpFailure } from "./public-picture-request.js";
import {
  classifyExecutionFailure,
  ExecutionError,
} from "../diagnostics/execution-failure.js";
import {
  WEB_PICTURE_INSTRUCTIONS,
  decodeSearchJson,
  searchBrief,
  type PictureDiscovery,
} from "./web-pictures.js";

/** Search grounding is separate from image generation; no source media is sent. */
export function geminiImageDiscovery(
  apiKey: string,
  model: string,
  read: typeof fetch = fetch,
): PictureDiscovery {
  return async (request, signal) => {
    const response = await read(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        signal,
        redirect: "error",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `${WEB_PICTURE_INSTRUCTIONS}\nGemini: You MUST call the google_search grounding tool for this task before answering. Return only URLs from its real results; your own prior knowledge is not a substitute.`,
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Use google_search now to find images for this brief, including a distinct alternate query. Complete the searches before returning candidate JSON.\n${searchBrief(request)}`,
                },
              ],
            },
          ],
          tools: [{ google_search: {} }],
          generationConfig: { candidateCount: 1, maxOutputTokens: 4096 },
        }),
      },
    );
    try {
      let text: string;
      try {
        text = (await boundedPictureBody(response, 512 * 1024)).toString(
          "utf8",
        );
      } catch (error) {
        if (!response.ok)
          throw new PictureHttpFailure(
            response.status,
            classifyExecutionFailure(error),
          );
        throw new ExecutionError("image_search_failed", {
          ...classifyExecutionFailure(error),
          httpStatus: response.status,
        });
      }
      if (!response.ok)
        throw new PictureHttpFailure(
          response.status,
          classifyExecutionFailure(text, "http"),
        );
      let decoded: unknown;
      try {
        decoded = JSON.parse(text);
      } catch (error) {
        throw new ExecutionError(
          "image_search_failed",
          classifyExecutionFailure(error, "output_json"),
        );
      }
      const parsed = responseShape.safeParse(decoded);
      if (!parsed.success)
        throw new ExecutionError(
          "image_search_failed",
          classifyExecutionFailure(parsed.error, "output_shape"),
        );
      const candidate = parsed.data.candidates[0];
      // Missing search metadata is not evidence that discovery actually searched.
      if (!candidate?.groundingMetadata?.webSearchQueries?.length)
        throw new Error("image_search_not_attempted");
      const json = decodeSearchJson(
        candidate.content?.parts?.map((part) => part.text ?? "").join("") ?? "",
      );
      const result = z
        .object({ candidates: z.array(z.unknown()) })
        .safeParse(json);
      if (result.success && result.data.candidates.length) return result.data;
      return {
        candidates: (candidate.groundingMetadata.groundingChunks ?? [])
          .flatMap((chunk) =>
            chunk.web?.uri ? [{ url: chunk.web.uri, kind: "page" }] : [],
          )
          .slice(0, 12),
      };
    } finally {
      if (response.body && !response.body.locked)
        await response.body.cancel().catch(() => undefined);
    }
  };
}
import { z } from "zod";
const responseShape = z.object({
  candidates: z
    .array(
      z.object({
        content: z
          .object({ parts: z.array(z.object({ text: z.string().optional() })) })
          .optional(),
        groundingMetadata: z
          .object({
            webSearchQueries: z.array(z.string()).optional(),
            groundingChunks: z
              .array(
                z.object({ web: z.object({ uri: z.string() }).optional() }),
              )
              .optional(),
          })
          .optional(),
      }),
    )
    .max(8),
});
