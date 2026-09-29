import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

async function lintFixture(relativePath: string, source: string) {
  const eslint = new ESLint({ cwd: repositoryRoot });
  const [result] = await eslint.lintText(source, {
    filePath: fileURLToPath(new URL(relativePath, import.meta.url)),
    warnIgnored: false,
  });
  return result?.messages ?? [];
}

describe("repository dependency boundaries", () => {
  it("rejects Node globals and bare Node imports from contracts", async () => {
    const messages = await lintFixture(
      "../packages/contracts/src/__boundary-negative__.ts",
      'import fs from "fs";\nvoid fs;\nvoid process;\nvoid Buffer;',
    );

    expect(messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "no-restricted-imports" }),
        expect.objectContaining({ ruleId: "no-restricted-globals" }),
      ]),
    );
  });

  it("keeps Node ambient types out of the contracts compiler", () => {
    const fileName = fileURLToPath(
      new URL("./fixtures/contracts-node-globals.negative.ts", import.meta.url),
    );
    const configPath = fileURLToPath(
      new URL("../packages/contracts/tsconfig.json", import.meta.url),
    );
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    if (configFile.error !== undefined) {
      throw new Error(
        ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"),
      );
    }
    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      dirname(configPath),
      { noEmit: true },
      configPath,
    );

    expect(parsedConfig.errors).toEqual([]);
    expect(parsedConfig.options.types).toEqual([]);

    const program = ts.createProgram({
      rootNames: [fileName],
      options: parsedConfig.options,
    });
    const messages = ts
      .getPreEmitDiagnostics(program)
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      );

    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Cannot find name 'process'"),
        expect.stringContaining("Cannot find name 'Buffer'"),
      ]),
    );
  });

  it.each([
    {
      path: "../apps/frontend/src/__boundary-negative__.ts",
      source: 'import "../../backend/src/app.js";',
    },
    {
      path: "../apps/backend/src/__boundary-negative__.ts",
      source: 'import "../../frontend/src/app/page.js";',
    },
  ])(
    "rejects relative cross-application imports from $path",
    async ({ path, source }) => {
      const messages = await lintFixture(path, source);
      expect(messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ ruleId: "no-restricted-imports" }),
        ]),
      );
    },
  );

  it("rejects Node globals from frontend browser source", async () => {
    const messages = await lintFixture(
      "../apps/frontend/src/__browser-negative__.ts",
      "void process;\nvoid Buffer;",
    );
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "no-restricted-globals" }),
      ]),
    );
  });

  it.each([
    "../apps/frontend/src/__boundary-valid__.ts",
    "../apps/backend/src/__boundary-valid__.ts",
  ])(
    "allows applications to import published contracts from %s",
    async (path) => {
      const messages = await lintFixture(
        path,
        'import { PUBLIC_LIMITS } from "@clipbuilder/contracts";\nvoid PUBLIC_LIMITS;',
      );
      expect(messages.filter((message) => message.severity === 2)).toEqual([]);
    },
  );
});
