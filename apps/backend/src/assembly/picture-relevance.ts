import type { ContextualPictureRequest } from "@clipbuilder/contracts";

const aliases: Record<string, string[]> = {
  screenshot: ["screenshot", "gameplay", "ingame"],
  game: ["game", "videogame", "gameplay"],
  child: ["child", "children", "boy", "girl"],
  computer: ["computer", "pc", "laptop"],
  teenager: ["teenager", "teen", "adolescent"],
};
function tokens(value: string) {
  return (
    value
      .replace(/<[^>]*>/gu, " ")
      .normalize("NFKC")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? []
  ).map((word) =>
    word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word,
  );
}
function includes(haystack: string[], term: string) {
  return tokens(term).every((word) =>
    (aliases[word] ?? [word]).some((alias) => haystack.includes(alias)),
  );
}
export function pictureRelevance(
  request: ContextualPictureRequest,
  candidate: {
    title: string;
    description: string;
    categories: string;
    width: number;
    height: number;
  },
) {
  const title = tokens(candidate.title),
    body = tokens(`${candidate.description} ${candidate.categories}`),
    all = [...title, ...body],
    query = tokens(request.brief.searchQuery);
  if (
    !request.brief.requiredTerms.every(
      (term) => includes(query, term) && includes(all, term),
    ) ||
    request.brief.avoidTerms.some((term) => includes(all, term)) ||
    [
      "logo",
      "logotype",
      "icon",
      "advertisement",
      "title screen",
      "main menu",
      "box art",
      "cover art",
    ].some((term) => includes(all, term)) ||
    (request.kind === "game" &&
      (!includes(all, "screenshot") || candidate.width < candidate.height)) ||
    (request.kind === "person" &&
      ![
        "person",
        "people",
        "portrait",
        "man",
        "woman",
        "boy",
        "girl",
        "child",
        "adult",
        "teenager",
      ].some((term) => includes(all, term)))
  )
    return 0;
  return (
    query.reduce(
      (score, term) =>
        score + (includes(title, term) ? 8 : includes(body, term) ? 3 : 0),
      0,
    ) +
    tokens(request.brief.scene).reduce(
      (score, term) => score + (includes(all, term) ? 1 : 0),
      0,
    )
  );
}
