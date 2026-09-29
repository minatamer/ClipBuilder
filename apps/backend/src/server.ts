import { composeBackend } from "./composition.js";

const { application, config } = composeBackend(process.env);

const server = application.listen(config.port, "127.0.0.1", () => {
  console.warn(`ClipBuilder backend listening on 127.0.0.1:${config.port}`);
});

function stopServer(signal: NodeJS.Signals): void {
  console.warn(`ClipBuilder backend received ${signal}; shutting down`);
  server.close((error) => {
    if (error) {
      console.error("ClipBuilder backend failed to close cleanly");
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", stopServer);
process.once("SIGTERM", stopServer);
