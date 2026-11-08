import { expect, it } from "vitest";
import { ownerSourceForCapacity, ownerSourceSchema } from "./index.ts";
import {
  resolveOwnerCapacity,
  ownerCapacitySchema,
  ownerSourceFitsCapacity,
  ownerDiskFitsCapacity,
  OWNER_SAFE_SOURCE_MS,
} from "./capacity.ts";
import { OWNER_LIMITS } from "./policy.ts";

const ready = { longSources: true, manyClips: true };
const source = {
  fingerprint: "a".repeat(64),
  bytes: 12 * 1024 ** 3,
  durationMs: 2 * 60 * 60 * 1000,
  width: 1920,
  height: 1080,
  fps: 30,
};

it("admits large/long measured metadata only for the completed local Codex profile", () => {
  const codex = resolveOwnerCapacity({ aiProvider: "codex" }, ready);
  expect(ownerSourceForCapacity(codex).parse(source)).toEqual(source);
  expect(ownerSourceSchema.safeParse(source).success).toBe(true);
  for (const composition of [
    {},
    { hosted: true, aiProvider: "gemini" as const },
    { hosted: true, aiProvider: "codex" as const },
  ]) {
    const policy = resolveOwnerCapacity(composition, ready);
    expect(policy.profile).toBe("bounded");
    expect(ownerSourceForCapacity(policy).safeParse(source).success).toBe(
      false,
    );
  }
  const pending = resolveOwnerCapacity(
    { aiProvider: "codex" },
    { longSources: false, manyClips: false },
  );
  expect(pending.profile).toBe("local-codex");
  expect(pending.longSources).toBe(false);
  expect(pending.manyClips).toBe(false);
  expect(ownerSourceForCapacity(pending).safeParse(source).success).toBe(false);
});

it("admits two-hour local Gemini clocks without lifting byte, disk, collection or hosted bounds", () => {
  const gemini = resolveOwnerCapacity({ aiProvider: "gemini" });
  const long = { ...source, bytes: 1024 * 1024 };
  expect(gemini).toEqual({
    profile: "local-gemini",
    longSources: false,
    manyClips: false,
    sourceBytes: OWNER_LIMITS.sourceBytes,
    sourceMs: null,
    scratchBytes: OWNER_LIMITS.scratchBytes,
    clips: OWNER_LIMITS.clips,
    moments: 360,
  });
  expect(ownerSourceForCapacity(gemini).parse(long)).toEqual(long);
  expect(ownerSourceForCapacity(gemini).safeParse(source).success).toBe(false);
  for (const composition of [
    {},
    { hosted: true, aiProvider: "gemini" as const },
    {
      hosted: true,
      aiProvider: "gemini" as const,
      sourceLimits: { bytes: 500 * 1024 ** 2, durationMs: 20 * 60_000 },
    },
  ])
    expect(
      ownerSourceForCapacity(resolveOwnerCapacity(composition)).safeParse(long)
        .success,
    ).toBe(false);
  for (const patch of [
    { sourceBytes: null },
    { scratchBytes: null },
    { clips: null },
    { moments: null },
    { longSources: true },
    { manyClips: true },
  ])
    expect(ownerCapacitySchema.safeParse({ ...gemini, ...patch }).success).toBe(
      false,
    );
});

it("keeps hosted and Gemini budgets independent, including hosted owner exemptions", () => {
  const limits = { bytes: 500 * 1024 ** 2, durationMs: 120_000 };
  const hosted = resolveOwnerCapacity(
    { hosted: true, aiProvider: "codex", sourceLimits: limits },
    ready,
  );
  expect(hosted).toMatchObject({
    profile: "bounded",
    sourceBytes: limits.bytes,
    sourceMs: limits.durationMs,
    clips: 10,
    moments: 360,
  });
  expect(
    ownerSourceFitsCapacity(
      { ...source, bytes: limits.bytes, durationMs: limits.durationMs },
      hosted,
    ),
  ).toBe(true);
  expect(
    ownerSourceFitsCapacity(
      { ...source, bytes: limits.bytes + 1, durationMs: limits.durationMs },
      hosted,
    ),
  ).toBe(false);
  expect(
    resolveOwnerCapacity({ aiProvider: "gemini" }, ready).scratchBytes,
  ).toBe(OWNER_LIMITS.scratchBytes);
  expect(
    ownerCapacitySchema.safeParse({ ...hosted, sourceBytes: null }).success,
  ).toBe(false);
});

it("rejects unsafe source arithmetic and nonfinite/overflowing measurements", () => {
  const policy = resolveOwnerCapacity({ aiProvider: "codex" }, ready);
  for (const patch of [
    { bytes: Infinity },
    { bytes: NaN },
    { bytes: 0 },
    { bytes: 1.5 },
    { bytes: Number.MAX_SAFE_INTEGER + 1 },
    { durationMs: Infinity },
    { durationMs: 0 },
    { durationMs: OWNER_SAFE_SOURCE_MS + 1 },
  ])
    expect(
      ownerSourceForCapacity(policy).safeParse({ ...source, ...patch }).success,
    ).toBe(false);
});

it("replaces the Codex scratch quota with actual disk headroom, retaining reserve and safe bounds", () => {
  const codex = resolveOwnerCapacity({ aiProvider: "codex" });
  const bounded = resolveOwnerCapacity({ aiProvider: "gemini" });
  const peak = 40 * 1024 ** 3;
  expect(
    ownerDiskFitsCapacity(peak, peak + OWNER_LIMITS.reserveBytes, codex),
  ).toBe(true);
  expect(
    ownerDiskFitsCapacity(peak, peak + OWNER_LIMITS.reserveBytes, bounded),
  ).toBe(false);
  expect(
    ownerDiskFitsCapacity(peak, peak + OWNER_LIMITS.reserveBytes - 1, codex),
  ).toBe(false);
  for (const amount of [-1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
    expect(ownerDiskFitsCapacity(amount, 100 * 1024 ** 3, codex)).toBe(false);
});
