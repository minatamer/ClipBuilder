import { existsSync, readFileSync } from "node:fs";
import {
  runtimeSettingsSchema,
  type RuntimeSettings,
} from "./runtime.schema.js";

// Called only by the executable entry point; imports never read local files.
export function readLocalRuntimeSettings(path: URL): RuntimeSettings {
  if (!existsSync(path)) return {};
  try {
    return runtimeSettingsSchema.parse(JSON.parse(readFileSync(path, "utf8")));
  } catch {
    // Schema/parser errors may contain private identifiers or values.
    throw new Error("Invalid backend runtime.local.json configuration.");
  }
}
