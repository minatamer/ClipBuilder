import { z } from "zod";
import { ownerTypographySchema } from "./text-style.ts";

export const OWNER_TEXT_SPAN_LIMIT = 32;
export const ownerCharacterStyleSchema = ownerTypographySchema
  .pick({
    font: true,
    fontSize: true,
    fontWeight: true,
    color: true,
    outlineColor: true,
    outlineWidth: true,
  })
  .partial()
  .extend({ highlightColor: ownerTypographySchema.shape.color.optional() })
  .strict();
export type OwnerCharacterStyle = z.infer<typeof ownerCharacterStyleSchema>;
export const ownerTextSpanSchema = z
  .object({
    start: z.number().int().nonnegative().max(500),
    end: z.number().int().positive().max(500),
    style: ownerCharacterStyleSchema,
  })
  .strict();
export const ownerTextSpansSchema = z
  .array(ownerTextSpanSchema)
  .max(OWNER_TEXT_SPAN_LIMIT);
export type OwnerTextSpan = z.infer<typeof ownerTextSpanSchema>;

/** Offsets are UTF-16; selections cannot divide a user-perceived character. */
export function ownerTextBoundaries(text: string): Set<number> {
  return new Set([
    0,
    ...Array.from(
      new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text),
      (part) => part.index + part.segment.length,
    ),
  ]);
}
export function validOwnerTextSpans(
  text: string,
  spans: readonly OwnerTextSpan[],
) {
  const boundaries = ownerTextBoundaries(text);
  return spans.every(
    (span, index) =>
      span.start < span.end &&
      boundaries.has(span.start) &&
      boundaries.has(span.end) &&
      (index === 0 || span.start >= spans[index - 1]!.end),
  );
}
export function ownerCharacterStyleAt(
  spans: readonly OwnerTextSpan[],
  at: number,
): OwnerCharacterStyle {
  return spans.find((span) => span.start <= at && at < span.end)?.style ?? {};
}
function styleKey(style: OwnerCharacterStyle) {
  return JSON.stringify(
    Object.entries(style)
      .filter(([, value]) => value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}
function compactStyles(
  styles: readonly OwnerCharacterStyle[],
): OwnerTextSpan[] {
  const spans: OwnerTextSpan[] = [];
  for (let at = 0; at < styles.length; at++) {
    const style = styles[at]!;
    if (styleKey(style) === "[]") continue;
    const previous = spans.at(-1);
    if (previous?.end === at && styleKey(previous.style) === styleKey(style))
      previous.end++;
    else spans.push({ start: at, end: at + 1, style: { ...style } });
  }
  if (spans.length > OWNER_TEXT_SPAN_LIMIT)
    throw new Error(
      "Use up to 32 separate word styles. Clear some styling first.",
    );
  return spans;
}
export function styleOwnerTextRange(
  text: string,
  spans: readonly OwnerTextSpan[],
  start: number,
  end: number,
  patch: OwnerCharacterStyle | null,
) {
  if (!validOwnerTextSpans(text, [{ start, end, style: {} }]))
    throw new Error("Select complete characters to style.");
  if (patch) ownerCharacterStyleSchema.parse(patch);
  return compactStyles(
    Array.from({ length: text.length }, (_, at) =>
      at >= start && at < end
        ? patch === null
          ? {}
          : { ...ownerCharacterStyleAt(spans, at), ...patch }
        : ownerCharacterStyleAt(spans, at),
    ),
  );
}

/** Normalize text and offsets together; never move an accent to its neighbor. */
export function normalizeOwnerStyledText(
  text: string,
  spans: readonly OwnerTextSpan[],
) {
  if (text.length > 500 || !validOwnerTextSpans(text, spans))
    throw new Error("Invalid text selection.");
  let normalized = "";
  const styles: OwnerCharacterStyle[] = [];
  for (const part of new Intl.Segmenter(undefined, {
    granularity: "grapheme",
  }).segment(text)) {
    const value = part.segment.replace(/\r\n?/gu, "\n").normalize("NFC");
    normalized += value;
    styles.push(
      ...Array.from({ length: value.length }, () =>
        ownerCharacterStyleAt(spans, part.index),
      ),
    );
  }
  const leading = normalized.length - normalized.trimStart().length;
  const result = normalized.trim();
  return {
    text: result,
    spans: compactStyles(styles.slice(leading, leading + result.length)),
  };
}

/** Plain-text editing preserves surviving ranges and inherits the caret style. */
export function editOwnerStyledText(
  previous: string,
  spans: readonly OwnerTextSpan[],
  next: string,
  typingStyle?: OwnerCharacterStyle,
  replacement?: { start: number; end: number } | undefined,
) {
  if (next.length > 500) throw new Error("Use up to 500 text characters.");
  const before = ownerTextBoundaries(previous),
    after = ownerTextBoundaries(next);
  let start = 0;
  while (
    start < previous.length &&
    start < next.length &&
    previous[start] === next[start]
  )
    start++;
  while (start > 0 && (!before.has(start) || !after.has(start))) start--;
  let suffix = 0;
  while (
    suffix < previous.length - start &&
    suffix < next.length - start &&
    previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]
  )
    suffix++;
  while (
    suffix > 0 &&
    (!before.has(previous.length - suffix) || !after.has(next.length - suffix))
  )
    suffix--;
  if (
    replacement &&
    replacement.end > replacement.start &&
    before.has(replacement.start) &&
    before.has(replacement.end)
  ) {
    start = replacement.start;
    suffix = previous.length - replacement.end;
  }
  const inherited =
    typingStyle ??
    ownerCharacterStyleAt(
      spans,
      Math.max(0, start - (start === previous.length ? 1 : 0)),
    );
  const styles = Array.from({ length: next.length }, (_, at) =>
    at < start
      ? ownerCharacterStyleAt(spans, at)
      : at >= next.length - suffix
        ? ownerCharacterStyleAt(spans, previous.length - (next.length - at))
        : inherited,
  );
  return { text: next, spans: compactStyles(styles) };
}

export const OWNER_TITLE_TREATMENTS = [
  "bold-hook",
  "impact",
  "editorial",
  "highlight-panel",
] as const;
export const ownerTitleEmphasisSchema = z
  .object({
    text: z.string().min(1).max(80),
    occurrence: z.number().int().min(0).max(79),
    style: ownerCharacterStyleSchema,
  })
  .strict();
export function resolveOwnerTitleEmphasis(
  text: string,
  value: unknown,
): OwnerTextSpan[] {
  if (!Array.isArray(value)) return [];
  let spans: OwnerTextSpan[] = [];
  for (const item of value.slice(0, 2)) {
    const parsed = ownerTitleEmphasisSchema.safeParse(item);
    if (!parsed.success) continue;
    const phrase = parsed.data.text.normalize("NFC");
    let start = -1,
      cursor = 0;
    for (let index = 0; index <= parsed.data.occurrence; index++) {
      start = text.indexOf(phrase, cursor);
      if (start < 0) break;
      cursor = start + phrase.length;
    }
    if (start < 0) continue;
    try {
      spans = styleOwnerTextRange(
        text,
        spans,
        start,
        start + phrase.length,
        parsed.data.style,
      );
    } catch {
      /* Optional styling cannot veto usable copy. */
    }
  }
  return spans;
}
