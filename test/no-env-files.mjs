import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { fileURLToPath } from "node:url";
import "./deterministic.environment.ts";

const read = fs.readFileSync;
fs.readFileSync = function (path, ...options) {
  const name = path instanceof URL ? fileURLToPath(path) : String(path);
  if (/(?:^|[/\\])\.env(?:$|\.)/.test(name) && !name.endsWith(".env.example")) {
    const error = new Error("test_environment_file_blocked");
    error.code = "ENOENT";
    throw error;
  }
  return read.call(this, path, ...options);
};
process.loadEnvFile = () => {
  throw new Error("test_environment_file_blocked");
};
syncBuiltinESMExports();
