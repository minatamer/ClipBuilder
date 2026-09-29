import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

function readCatalog(relativePath: string): unknown {
  return JSON.parse(
    readFileSync(new URL(relativePath, import.meta.url), "utf8"),
  ) as unknown;
}

describe("shared synthetic fixture catalog", () => {
  it("keeps adversarial candidate, provider, and injection cases explicit", () => {
    const candidates = readCatalog(
      "../tests/fixtures/candidates/adversarial.json",
    );
    const providerErrors = readCatalog(
      "../tests/fixtures/provider-errors/cases.json",
    );
    const injection = readCatalog(
      "../tests/fixtures/prompt-injection/cases.json",
    );

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "invalid-reference-v1" }),
        expect.objectContaining({ key: "duplicate-range-v1" }),
        expect.objectContaining({ key: "invented-quote-v1" }),
        expect.objectContaining({ key: "invented-claim-v1" }),
        expect.objectContaining({ key: "virality-promise-v1" }),
        expect.objectContaining({ key: "no-strong-candidates-v1" }),
      ]),
    );
    expect(providerErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "REQUEST_TIMEOUT" }),
        expect.objectContaining({ code: "TRANSCRIPTION_FAILED" }),
        expect.objectContaining({ code: "MODEL_OUTPUT_REJECTED" }),
      ]),
    );
    expect(injection).toEqual([
      expect.objectContaining({
        key: "ignore-previous-v1",
        expectedRuleId: "candidate.instruction-content",
      }),
    ]);
  });

  it("contains no capability URLs, credentials, or media filenames", () => {
    const catalogs = [
      readCatalog("../tests/fixtures/candidates/adversarial.json"),
      readCatalog("../tests/fixtures/provider-errors/cases.json"),
      readCatalog("../tests/fixtures/prompt-injection/cases.json"),
    ];
    const serialized = JSON.stringify(catalogs);
    expect(serialized).not.toMatch(/https?:\/\/|bearer\s|api[_-]?key/iu);
    expect(serialized).not.toMatch(/\.(?:mp4|webm|mov|png|webp)/iu);
  });
});
