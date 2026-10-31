import { z } from "zod";
import {
  ownerClipPlanSchema,
  OWNER_BATCH_POLICY,
} from "../../../packages/contracts/local/clips.ts";
import { ownerIllustrationSchema } from "../../../packages/contracts/local/illustration.ts";
import {
  visualDiagnosticFieldSchema,
  type VisualDiagnostic,
} from "../../../packages/contracts/local/visual-diagnostics.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";

type Plan = z.infer<typeof ownerClipPlanSchema>;
const record = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
const unsafeSearch = /(?:https?:|www\.|data:|javascript:)/iu;
function text(value: unknown, maximum: number) {
  if (typeof value !== "string") return undefined;
  const clean = value
    .normalize("NFC")
    .replace(/[\p{Cc}\u202a-\u202e\u2066-\u2069]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
  let bounded = "";
  for (const character of clean) {
    if (bounded.length + character.length > maximum) break;
    bounded += character;
  }
  return bounded.trim() || undefined;
}
function terms(value: unknown, maximum: number) {
  if (typeof value !== "string" || unsafeSearch.test(value)) return undefined;
  const clean = text(value.replace(/[^\p{L}\p{N} -]/gu, " "), maximum);
  const bounded = clean?.replace(/^[ -]+|[ -]+$/gu, "");
  return bounded && bounded.length >= 2 && /[\p{L}\p{N}]/u.test(bounded)
    ? bounded
    : undefined;
}
function termList(value: unknown, maximum: number) {
  return [
    ...new Set(
      (Array.isArray(value) ? value.slice(0, 24) : []).flatMap((item) => {
        const clean = terms(item, 32);
        return clean ? [clean] : [];
      }),
    ),
  ].slice(0, maximum);
}
function illustration(value: unknown) {
  const raw = record(value);
  if (!raw) return undefined;
  const items = (Array.isArray(raw.items) ? raw.items : [])
    .slice(0, 4)
    .flatMap((value) => {
      const item = record(value),
        label = text(item?.label, 40);
      if (!label) return [];
      const icon =
        ownerIllustrationSchema.shape.items.element.shape.icon.safeParse(
          item?.icon,
        );
      return [{ label, icon: icon.success ? icon.data : ("idea" as const) }];
    });
  const layout = ownerIllustrationSchema.shape.layout.safeParse(raw.layout);
  const result = ownerIllustrationSchema.safeParse({
    layout: layout.success ? layout.data : "concept",
    heading:
      text(raw.heading, 60) ??
      text(items.map((item) => item.label).join(" / "), 60),
    items,
  });
  return result.success ? result.data : undefined;
}
function issues(error: z.ZodError): NonNullable<VisualDiagnostic["issues"]> {
  return error.issues.slice(0, 12).map((issue) => {
    const parts = issue.path.filter(
      (part): part is string => typeof part === "string",
    );
    const path = parts.slice(0, parts[0] === "illustration" ? 3 : 2).join(".");
    const field = visualDiagnosticFieldSchema.safeParse(path);
    const item = issue.path.find((part) => typeof part === "number");
    const rule =
      issue.code === "too_big"
        ? "maximum"
        : issue.code === "too_small"
          ? "minimum"
          : issue.code === "invalid_type"
            ? "type"
            : issue.code === "invalid_format"
              ? "format"
              : issue.code === "unrecognized_keys"
                ? "shape"
                : "value";
    const limit =
      issue.code === "too_big"
        ? issue.maximum
        : issue.code === "too_small"
          ? issue.minimum
          : undefined;
    return {
      field: field.success ? field.data : "unknown",
      rule,
      ...(typeof item === "number" ? { item: Math.min(1000, item) } : {}),
      ...(typeof limit === "number" && limit >= 0 && limit <= 1000000
        ? { limit }
        : {}),
    };
  });
}

/** Repair editorial data locally; diagnostics contain schema facts, never values. */
export function decodeVisualPlan(
  value: unknown,
  frames: number,
  writeDiagnostic: (detail: VisualDiagnostic) => void,
): Plan {
  const report = (detail: VisualDiagnostic) => {
    try {
      writeDiagnostic(detail);
    } catch {
      /* Diagnostics cannot reject a usable plan. */
    }
  };
  const returned = Array.isArray(value) ? value : record(value)?.pictures;
  if (!Array.isArray(returned)) {
    report({
      stage: "decode",
      outcome: "dropped",
      received: 0,
      retained: 0,
      issues: [{ field: "pictures", rule: "type" }],
    });
    return [];
  }
  const retained: Plan = [];
  for (const [index, entry] of returned
    .slice(0, OWNER_BATCH_POLICY.imageAttemptsPerClip)
    .entries()) {
    const original = ownerClipPlanSchema.element.safeParse(entry);
    const raw = record(entry),
      rawBrief = record(raw?.brief),
      fallback = illustration(raw?.illustration);
    const required = termList(rawBrief?.requiredTerms, 4);
    // Fallback labels are also authored as generic public depictions, not source
    // quotes. Never derive an outbound query from the private transcript.
    const query =
      terms(rawBrief?.searchQuery, 100) ??
      terms(required.join(" "), 100) ??
      terms(rawBrief?.scene, 100) ??
      terms(fallback?.heading, 100);
    const scene =
      text(rawBrief?.scene, 180) ?? text(fallback?.heading, 180) ?? query;
    const requiredTerms = required.length
      ? required
      : query
        ? [terms(query, 32)!].filter(Boolean)
        : [];
    const startValue =
      typeof raw?.startFrame === "number"
        ? raw.startFrame
        : typeof raw?.startFrame === "string" && raw.startFrame.trim()
          ? Number(raw.startFrame)
          : NaN;
    const endValue =
      typeof raw?.endFrame === "number"
        ? raw.endFrame
        : typeof raw?.endFrame === "string" && raw.endFrame.trim()
          ? Number(raw.endFrame)
          : NaN;
    const startFrame = Math.max(
      0,
      Math.min(
        frames - 1,
        Number.isFinite(startValue)
          ? Math.round(startValue)
          : Math.min(
              index * 30 * OWNER_FPS,
              Math.max(0, frames - 5 * OWNER_FPS),
            ),
      ),
    );
    const endFrame = Math.max(
      startFrame + 1,
      Math.min(
        frames,
        Number.isFinite(endValue) && endValue > startFrame
          ? Math.round(endValue)
          : startFrame + 5 * OWNER_FPS,
      ),
    );
    const cue = ownerClipPlanSchema.element.safeParse({
      startFrame,
      endFrame,
      brief: {
        scene,
        searchQuery: query,
        requiredTerms,
        avoidTerms: termList(rawBrief?.avoidTerms, 6),
      },
      ...(fallback ? { illustration: fallback } : {}),
      alternateBriefs: (Array.isArray(raw?.alternateBriefs)
        ? raw.alternateBriefs
        : []
      )
        .slice(0, OWNER_BATCH_POLICY.imageSearchAlternatives)
        .flatMap((value) => {
          const brief = record(value),
            searchQuery = terms(brief?.searchQuery, 100);
          return searchQuery && scene && requiredTerms.length
            ? [
                {
                  scene,
                  searchQuery,
                  requiredTerms,
                  avoidTerms: termList(brief?.avoidTerms, 6),
                },
              ]
            : [];
        }),
      evidenceWordIds: (Array.isArray(raw?.evidenceWordIds)
        ? raw.evidenceWordIds
        : []
      )
        .filter(
          (id): id is string =>
            typeof id === "string" && /^w_[A-Za-z0-9_-]{1,60}$/u.test(id),
        )
        .slice(0, 24),
    });
    const faults = original.success ? [] : issues(original.error);
    if (
      typeof rawBrief?.searchQuery === "string" &&
      unsafeSearch.test(rawBrief.searchQuery)
    )
      faults.unshift({ field: "brief.searchQuery", rule: "unsafe_search" });
    if (cue.success) {
      if (!cue.data.alternateBriefs?.length) delete cue.data.alternateBriefs;
      retained.push(cue.data);
      const repaired =
        !original.success ||
        JSON.stringify(original.data) !== JSON.stringify(cue.data);
      if (
        original.success &&
        (original.data.startFrame !== startFrame ||
          original.data.endFrame !== endFrame)
      )
        faults.push({ field: "startFrame", rule: "clock" });
      if (
        original.success &&
        JSON.stringify(original.data.evidenceWordIds) !==
          JSON.stringify(cue.data.evidenceWordIds)
      )
        faults.push({ field: "evidenceWordIds", rule: "repair" });
      report({
        stage: "decode",
        index,
        outcome: repaired ? "repaired" : "accepted",
        issues: faults.slice(0, 12),
      });
    } else
      report({
        stage: "decode",
        index,
        outcome: "dropped",
        issues: [...faults, ...issues(cue.error)].slice(0, 12),
      });
  }
  report({
    stage: "decode",
    outcome: retained.length ? "accepted" : "dropped",
    received: Math.min(1000, returned.length),
    retained: retained.length,
    dropped: Math.min(1000, returned.length - retained.length),
  });
  return retained;
}
