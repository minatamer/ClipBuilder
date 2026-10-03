import {
  ENVIRONMENT_KEYS,
  environmentSchema,
  type BackendConfig,
} from "./env.schema.js";
import { readGrantKeys } from "../admission/processing.grant.js";

export function loadConfig(environment: NodeJS.ProcessEnv): BackendConfig {
  if (
    ["LIVE_UPLOAD_ENABLED"].some(
      (key) =>
        environment[key] !== undefined &&
        environment[key] !== "" &&
        environment[key] !== "false",
    )
  )
    throw new Error(
      "Retired server-media feature configuration is not supported.",
    );
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

  const config = environmentSchema.parse(selected);
  if (config.session.processingGrantKeysJson !== null)
    readGrantKeys(
      config.session.processingGrantKeysJson,
      config.session.processingGrantActiveKeyId ?? "",
    );
  if (
    environment.PROVIDER_MODE !== undefined &&
    environment.PROVIDER_MODE !== config.providerMode
  ) {
    throw new Error("Legacy provider mode conflicts with FAKE_MODE.");
  }
  return config;
}
