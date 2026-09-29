import { z } from "zod";

const URL_LIKE_TEXT = /(?:https?:\/\/|www\.)/iu;

function containsForbiddenPlainTextCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0);
    return (
      codePoint !== undefined &&
      (codePoint <= 0x1f ||
        (codePoint >= 0x7f && codePoint <= 0x9f) ||
        (codePoint >= 0x202a && codePoint <= 0x202e) ||
        (codePoint >= 0x2066 && codePoint <= 0x2069))
    );
  });
}

export function boundedPlainTextSchema(
  maximumCharacters: number,
  minimumCharacters = 1,
) {
  return z
    .string()
    .transform((value) => value.normalize("NFC").trim())
    .pipe(
      z
        .string()
        .min(minimumCharacters)
        .max(maximumCharacters)
        .refine((value) => !containsForbiddenPlainTextCharacter(value), {
          message: "Text contains a forbidden control character.",
        }),
    );
}

export function boundedTextWithoutUrlSchema(
  maximumCharacters: number,
  minimumCharacters = 1,
) {
  return boundedPlainTextSchema(maximumCharacters, minimumCharacters).refine(
    (value) => !URL_LIKE_TEXT.test(value),
    { message: "URLs are not allowed in this field." },
  );
}
