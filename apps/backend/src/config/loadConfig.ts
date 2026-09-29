import {
  ENVIRONMENT_KEYS,
  environmentSchema,
  type BackendConfig,
} from "./env.schema.js";

export function loadConfig(environment: NodeJS.ProcessEnv): BackendConfig {
  if (
    environment.APP_ENV === "production" &&
    Object.keys(environment).some((key) => key.startsWith("CLIPBUILDER_"))
  ) {
    throw new Error("Unknown ClipBuilder-prefixed production configuration.");
  }

  const selected = Object.fromEntries(
    ENVIRONMENT_KEYS.flatMap((key) => {
      const value = environment[key];
      return value === undefined ? [] : [[key, value]];
    }),
  );

  return environmentSchema.parse(selected);
}
