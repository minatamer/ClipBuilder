import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { composeBackend } from "../../composition.js";
import {
  AnalysisDiagnostics,
  parseAnalysisDiagnosticLine,
} from "../../analysis/analysis.diagnostics.js";
import { createSafeTestEnvironment } from "../../../test/environment.fixture.js";

describe("browser diagnostics in private backend logs", () => {
  it.each([
    { kind: "view-failed", digest: "123456" },
    {
      kind: "browser-console",
      level: "error",
      source: "worker-error",
      argumentCount: 0,
    },
  ])(
    "prints accepted records through the existing private sink and returns no log data",
    async (record) => {
      const lines: string[] = [];
      const diagnostics = new AnalysisDiagnostics((line) => lines.push(line));
      const { application } = composeBackend(
        createSafeTestEnvironment(),
        diagnostics,
      );
      const result = await request(application)
        .post("/v1/diagnostics")
        .set("Origin", "http://localhost:3000")
        .set("Sec-Fetch-Site", "same-origin")
        .send(record);
      expect(result.status).toBe(204);
      expect(result.text).toBe("");
      expect(
        lines.every((line) => parseAnalysisDiagnosticLine(line) !== null),
      ).toBe(true);
      expect(lines.map((line) => JSON.parse(line))).toContainEqual(
        expect.objectContaining({ action: "diagnostics", browser: record }),
      );
    },
  );
  it("rejects content and compressed/foreign reports without reflecting them", async () => {
    const lines: string[] = [];
    const { application } = composeBackend(
      createSafeTestEnvironment(),
      new AnalysisDiagnostics((line) => lines.push(line)),
    );
    const result = await request(application)
      .post("/v1/diagnostics")
      .set("Origin", "http://localhost:3000")
      .set("Sec-Fetch-Site", "same-origin")
      .send({ kind: "view-failed", message: "synthetic-private-sentinel" });
    expect(result.status).toBe(400);
    expect(result.text + lines.join("")).not.toContain(
      "synthetic-private-sentinel",
    );
    expect(lines.some((line) => line.includes('"browser":'))).toBe(false);
    expect(
      (
        await request(application)
          .post("/v1/diagnostics")
          .set("Origin", "https://foreign.example")
          .send({ kind: "view-failed" })
      ).status,
    ).toBe(400);
    expect(
      (
        await request(application)
          .post("/v1/diagnostics")
          .set("Origin", "http://localhost:3000")
          .set("Sec-Fetch-Site", "same-origin")
          .set("Content-Encoding", "gzip")
          .send({ kind: "view-failed" })
      ).status,
    ).toBe(400);
    expect(
      (
        await request(application)
          .post("/v1/diagnostics")
          .set("Origin", "http://localhost:3000")
          .set("Sec-Fetch-Site", "same-origin")
          .send({ kind: "view-failed", message: "x".repeat(8192) })
      ).status,
    ).toBe(413);
  });
  it("bounds diagnostic admission and opens the next minute without provider work", async () => {
    let time = 1000;
    const clock = vi.spyOn(Date, "now").mockImplementation(() => time);
    try {
      const lines: string[] = [];
      const { application } = composeBackend(
        createSafeTestEnvironment(),
        new AnalysisDiagnostics((line) => lines.push(line)),
      );
      const send = () =>
        request(application)
          .post("/v1/diagnostics")
          .set("Origin", "http://localhost:3000")
          .set("Sec-Fetch-Site", "same-origin")
          .send({ kind: "view-failed" });
      for (let count = 0; count < 512; count++)
        expect((await send()).status).toBe(204);
      expect((await send()).status).toBe(429);
      expect(lines.filter((line) => line.includes('"browser":'))).toHaveLength(
        512,
      );
      time += 60000;
      expect((await send()).status).toBe(204);
      expect(lines.every((line) => parseAnalysisDiagnosticLine(line))).toBe(
        true,
      );
    } finally {
      clock.mockRestore();
    }
  }, 20000);
});
