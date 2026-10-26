import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";
import ts from "typescript";
import { beforeAll, describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const eslint = new ESLint({ cwd: repositoryRoot });
beforeAll(async () => {
  await eslint.calculateConfigForFile(
    fileURLToPath(
      new URL("../apps/frontend/src/__boundary__.ts", import.meta.url),
    ),
  );
}, 60_000);

async function lintFixture(relativePath: string, source: string) {
  const [result] = await eslint.lintText(source, {
    filePath: fileURLToPath(new URL(relativePath, import.meta.url)),
    warnIgnored: false,
  });
  return result?.messages ?? [];
}

describe("repository dependency boundaries", () => {
  it.each([
    "apps/frontend/src",
    "apps/backend/src",
    "apps/renderer/src",
    "packages/contracts/src",
    "packages/composition/src",
  ])("rejects owner imports from public %s", async (path) => {
    expect(
      await lintFixture(
        `../${path}/__owner-negative__.ts`,
        'import "../owner/index.ts";',
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "local-owner/public-import" }),
      ]),
    );
  });
  it("keeps owner contracts browser-safe and permits owner app contract imports", async () => {
    expect(
      await lintFixture(
        "../packages/contracts/local/__negative__.ts",
        'import "node:fs"; void process;',
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "no-restricted-imports" }),
        expect.objectContaining({ ruleId: "no-restricted-globals" }),
      ]),
    );
    const messages = await lintFixture(
      "../apps/frontend/src/features/local-editing/__valid__.ts",
      'import { OWNER_LIMITS } from "../../../../../packages/contracts/local/index.ts"; void OWNER_LIMITS;',
    );
    expect(messages.filter((message) => message.severity === 2)).toEqual([]);
  });
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
  }, 10_000);

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

  it("rejects browser console output, including warnings and errors", async () => {
    const messages = await lintFixture(
      "../apps/frontend/src/__console-negative__.ts",
      'console.warn("synthetic detail");\nconsole.error("synthetic detail");',
    );
    expect(
      messages.filter((message) => message.ruleId === "no-console"),
    ).toHaveLength(2);
  });

  it.each([
    {
      path: "../apps/frontend/src/__boundary-negative__.ts",
      source: 'import "../../renderer/src/server.js";',
    },
    {
      path: "../apps/renderer/src/__boundary-negative__.ts",
      source: 'import "../../backend/src/app.js";',
    },
    {
      path: "../apps/renderer/src/__boundary-negative__.tsx",
      source: 'import "../../backend/src/app.js";',
    },
    {
      path: "../apps/renderer/src/__boundary-negative__.tsx",
      source: 'import "@clipbuilder/frontend";',
    },
    {
      path: "../packages/contracts/src/__boundary-negative__.ts",
      source: 'import "../../../apps/renderer/src/server.js";',
    },
    {
      path: "../packages/contracts/src/__boundary-negative__.ts",
      source: 'import "@clipbuilder/composition";',
    },
    {
      path: "../packages/composition/src/__boundary-negative__.tsx",
      source: 'import "node:fs";\nvoid process;\nvoid Buffer;',
    },
    {
      path: "../packages/composition/src/__boundary-negative__.tsx",
      source: 'import "@remotion/renderer";',
    },
    {
      path: "../apps/backend/src/__boundary-negative__.ts",
      source: 'import "@clipbuilder/composition";',
    },
  ])(
    "enforces the reviewed renderer/composition extension from $path",
    async ({ path, source }) => {
      expect(await lintFixture(path, source)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ ruleId: "no-restricted-imports" }),
        ]),
      );
    },
  );

  it.each([
    "../apps/frontend/src/__boundary-valid__.ts",
    "../apps/backend/src/__boundary-valid__.ts",
    "../apps/renderer/src/__boundary-valid__.ts",
    "../apps/renderer/src/__boundary-valid__.tsx",
    "../packages/composition/src/__boundary-valid__.tsx",
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

  it("allows the renderer TSX entry to use the shared composition", async () => {
    const messages = await lintFixture(
      "../apps/renderer/src/__composition-valid__.tsx",
      'import { ClipComposition } from "@clipbuilder/composition";\nvoid ClipComposition;',
    );
    expect(messages.filter((message) => message.severity === 2)).toEqual([]);
  });
});
