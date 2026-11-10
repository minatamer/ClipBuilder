import { build, stop } from "esbuild";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { listenOwner } from "./owner-http.ts";

/** Real shared loading visuals, generated in memory without media or providers. */
export async function startBrandSpinnerFixture() {
  const bundle = await build({
    stdin: {
      contents: `
        import React from 'react';
        import {createRoot} from 'react-dom/client';
        import {ProcessingState} from './apps/frontend/src/shared/ui/processing-state';
        import {BrandedSpinner} from './apps/frontend/src/shared/ui/branded-spinner';
        import workspaceStyles from './apps/frontend/src/shared/ui/workspace.module.css';
        import './apps/frontend/src/styles/tokens.css';
        import './apps/frontend/src/features/local-editing/style.css';
        document.body.style.margin='0';
        createRoot(document.getElementById('root')).render(<div className={workspaceStyles.workspace}><main className="local-editing local-moments" style={{padding:16,display:'grid',gap:24}}>
          <ProcessingState className="workspace-opening" label="Opening workspace" indicatorSize="compact"/>
          <ProcessingState className="moments-processing" label="Loading moments"/>
          <ProcessingState label="Preparing clip"/>
          <ProcessingState label="Adding captions"/>
          <ProcessingState label="Importing audio"/>
          <ProcessingState label="Uploading video" progress={{fraction:0.42,valueText:'42%'}}/>
          <section style={{display:'flex',gap:24,flexWrap:'wrap',alignItems:'center'}}>
            {[48,64,80,104,128,160].map(width=><div key={width} style={{width}}><BrandedSpinner/></div>)}
          </section>
        </main></div>);
      `,
      resolveDir: resolve("."),
      loader: "tsx",
    },
    nodePaths: [resolve("apps/frontend/node_modules")],
    bundle: true,
    platform: "browser",
    format: "esm",
    jsx: "automatic",
    outfile: "app.js",
    write: false,
    logLevel: "silent",
  });
  const script = bundle.outputFiles.find((file) => file.path.endsWith(".js"))!;
  const style = bundle.outputFiles.find((file) => file.path.endsWith(".css"))!;
  const server = createServer((req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (req.url === "/app.js" || req.url === "/app.css") {
      const css = req.url.endsWith(".css");
      res.setHeader("Content-Type", css ? "text/css" : "text/javascript");
      res.end(css ? style.contents : script.contents);
    } else if (req.url === "/") {
      res.setHeader("Content-Type", "text/html");
      res.end(
        '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shared loading review</title><link rel="stylesheet" href="/app.css"><div id="root"></div><script type="module" src="/app.js"></script>',
      );
    } else {
      res.writeHead(404).end();
    }
  });
  try {
    const port = await listenOwner(server);
    return {
      url: `http://127.0.0.1:${port}/`,
      async close() {
        await new Promise<void>((done, fail) => {
          server.close((error) => (error ? fail(error) : done()));
          server.closeAllConnections();
        });
        stop();
      },
    };
  } catch (error) {
    server.close();
    stop();
    throw error;
  }
}
