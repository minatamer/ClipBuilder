import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import globals from "globals";
import { builtinModules } from "node:module";

const disabledNodeGlobals = Object.fromEntries(
  Object.keys(globals.node).map((name) => [name, "off"]),
);
const disabledBrowserGlobals = Object.fromEntries(
  Object.keys(globals.browser).map((name) => [name, "off"]),
);
const nodeBuiltinImportPatterns = [
  ...new Set(
    builtinModules.flatMap((moduleName) => {
      const bareName = moduleName.replace(/^node:/u, "");
      return [
        bareName,
        `${bareName}/*`,
        `node:${bareName}`,
        `node:${bareName}/*`,
      ];
    }),
  ),
];

const applicationBoundaryRules = {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: [
            "@clipbuilder/backend",
            "@clipbuilder/backend/*",
            "**/apps/backend/**",
            "**/backend/**",
            "@clipbuilder/renderer",
            "@clipbuilder/renderer/*",
            "**/renderer/**",
          ],
          message: "Frontend code cannot import backend implementation.",
        },
      ],
    },
  ],
};

export default defineConfig([
  eslint.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    settings: {
      react: {
        version: "19.3",
      },
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "no-console": ["error", { allow: ["error", "warn"] }],
    },
  },
  {
    files: [
      "*.{js,mjs,ts}",
      "**/*.config.{js,mjs,ts}",
      "test/**/*.ts",
      "apps/backend/**/*.ts",
      "apps/renderer/**/*.ts",
      "apps/frontend/feasibility/browser-media/server.mjs",
      "apps/frontend/feasibility/browser-media/server.test.mjs",
    ],
    languageOptions: {
      globals: {
        ...disabledBrowserGlobals,
        ...globals.node,
      },
    },
  },
  {
    files: [
      "apps/frontend/feasibility/browser-media/{main,worker,sync-access,sync-access.test}.mjs",
    ],
    languageOptions: {
      globals: {
        ...disabledNodeGlobals,
        ...globals.browser,
        ...globals.worker,
      },
    },
    rules: applicationBoundaryRules,
  },
  {
    files: ["apps/frontend/src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...disabledNodeGlobals,
        ...globals.browser,
      },
    },
    rules: {
      "no-restricted-globals": ["error", "process", "Buffer"],
    },
  },
  {
    files: ["apps/frontend/**/*.{ts,tsx}"],
    rules: applicationBoundaryRules,
  },
  {
    files: ["apps/backend/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@clipbuilder/frontend",
                "@clipbuilder/frontend/*",
                "**/apps/frontend/**",
                "**/frontend/**",
                "@clipbuilder/renderer",
                "@clipbuilder/renderer/*",
                "**/renderer/**",
                "@clipbuilder/composition",
                "@clipbuilder/composition/*",
                "**/composition/**",
              ],
              message: "Backend code cannot import frontend implementation.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/contracts/src/**/*.ts"],
    languageOptions: {
      globals: {
        ...disabledNodeGlobals,
        ...disabledBrowserGlobals,
      },
    },
    rules: {
      "no-restricted-globals": ["error", "process", "Buffer"],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                ...nodeBuiltinImportPatterns,
                "react",
                "react/*",
                "next",
                "next/*",
                "express",
                "@clipbuilder/frontend",
                "@clipbuilder/frontend/*",
                "@clipbuilder/backend",
                "@clipbuilder/backend/*",
                "@clipbuilder/renderer",
                "@clipbuilder/renderer/*",
                "@clipbuilder/composition",
                "@clipbuilder/composition/*",
                "**/apps/**",
                "**/composition/**",
                "@google/*",
                "@google-cloud/*",
                "google-auth-library",
                "@aws-sdk/*",
              ],
              message:
                "Shared contracts must remain browser-safe and application-neutral.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/renderer/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@clipbuilder/frontend",
                "@clipbuilder/frontend/*",
                "@clipbuilder/backend",
                "@clipbuilder/backend/*",
                "**/frontend/**",
                "**/backend/**",
              ],
              message: "Renderer cannot import another application.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/composition/src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...disabledNodeGlobals, ...globals.browser },
    },
    rules: {
      "no-restricted-globals": ["error", "process", "Buffer"],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                ...nodeBuiltinImportPatterns,
                "next",
                "next/*",
                "express",
                "@clipbuilder/frontend",
                "@clipbuilder/frontend/*",
                "@clipbuilder/backend",
                "@clipbuilder/backend/*",
                "@clipbuilder/renderer",
                "@clipbuilder/renderer/*",
                "**/apps/**",
                "@google/*",
                "@google-cloud/*",
                "google-auth-library",
                "@remotion/renderer",
                "@remotion/bundler",
              ],
              message:
                "Composition must remain browser-safe and application-neutral.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    "**/.next/**",
    "**/dist/**",
    "**/coverage/**",
    "**/node_modules/**",
    "apps/renderer/bundle/**",
    "**/*.d.ts",
  ]),
]);
