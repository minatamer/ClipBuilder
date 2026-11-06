import { build, stop } from "esbuild";
import { createServer } from "node:http";
import { mkdtemp, readFile, writeFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { listenOwner } from "./owner-http.ts";

/** Actual frontend forms, generated state and closed fake HTTP; no owner session. */
export async function startFeedbackBrowserFixture() {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-feedback-layout-"));
  let requests = 0;
  const source = `import React,{useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {WorkflowFrame} from './apps/frontend/src/shared/ui/workflow-frame.tsx';
import {Workspace} from './apps/frontend/src/shared/ui/workspace.tsx';
import {Button} from './apps/frontend/src/shared/ui/button.tsx';
import {InlineFeedback} from './apps/frontend/src/shared/ui/inline-feedback.tsx';
import {OwnerSelectionPanel} from './apps/frontend/src/features/local-editing/selection-panel.tsx';
import {TypographyFields} from './apps/frontend/src/features/local-editing/typography-fields.tsx';
import {CaptionTextEditor} from './apps/frontend/src/features/local-editing/caption-text-editor.tsx';
import {TextInspector} from './apps/frontend/src/features/local-editing/text-inspector.tsx';
import {SessionControls} from './apps/frontend/src/features/local-editing/session-controls.tsx';
import {WorkflowActions} from './apps/frontend/src/features/local-editing/workflow-actions.tsx';
import {ClipNameControls} from './apps/frontend/src/features/local-editing/clip-name-controls.tsx';
import {syntheticTextClip,syntheticTextLayer} from './test/owner-text-fixture.ts';
import {OWNER_CAPTION_PRESETS} from './packages/contracts/local/editor.ts';
import './apps/frontend/src/styles/tokens.css';
import './apps/frontend/src/features/local-editing/style.css';
const noop=()=>{};const clip=syntheticTextClip(),workspace={id:'11111111-1111-4111-8111-111111111111',revision:0,mode:'synthetic-ai',source:{fingerprint:'a'.repeat(64),bytes:10000,durationMs:180000,width:640,height:360,fps:30}},capabilities={localMedia:true,cloud:false,aiMode:'synthetic-ai',sourceMode:null,planningAvailable:true};
function App(){const[view,setView]=useState('Manual'),[footer,setFooter]=useState(null),[busy,setBusy]=useState(false),[style,setStyle]=useState(OWNER_CAPTION_PRESETS.tiktok),[layers,setLayers]=useState([syntheticTextLayer()]),[selected,setSelected]=useState(null),[tab,setTab]=useState('content'),[words,setWords]=useState([]),[message,setMessage]=useState('');const player=useRef(null);
return <Workspace localMode><WorkflowFrame title='Feedback layout check' step={1} footer={<><SessionControls recovery={false} disabled={false} onClear={()=>setMessage('Couldn’t reset. Try again.')} message={view==='Actions'&&message.startsWith('Couldn’t reset')?message:undefined}/><div className='local-footer-actions'><div className='workflow-footer-slot' ref={setFooter}/></div></>}>
<div className='local-editing'><nav aria-label='Fixture views' style={{display:'flex',gap:8,flexWrap:'wrap'}}>{['Manual','Typography','Text','Caption','Rename','Actions','Long message'].map(v=><Button key={v} onClick={()=>{setView(v);setMessage('')}}>{v}</Button>)}</nav>
{view==='Manual'&&<OwnerSelectionPanel workspace={workspace} capabilities={capabilities} busy={busy} onBusy={setBusy} onChoose={noop} previewReady onCaptureTime={()=>'00:01:04'} onJumpTo={()=>{}} onResultsViewChange={noop} footerTarget={footer}/>}
{view==='Typography'&&<div className='editor-panels'><TypographyFields value={style} onChange={setStyle} onPreset={()=>{}}/></div>}
{view==='Text'&&<div className='editor-panels'><TextInspector id='fixture-text' layers={layers} selected={selected??layers[0].id} onSelect={setSelected} onChange={setLayers} onAdd={()=>{}} frames={120} player={player} available attempt={0} tab={tab} onTab={setTab}/></div>}
{view==='Caption'&&<div className='editor-panels'><CaptionTextEditor captions={clip.base.overlay.captions} edits={words} player={player} available frames={120} onChange={setWords}/></div>}
{view==='Rename'&&<ClipNameControls clip={clip} index={1} workspaceId={workspace.id} onAccepted={()=>{}} disabled={false}/>}
{view==='Actions'&&<><Button onClick={()=>setMessage('Couldn’t export. Try again.')}>Show action error</Button><Button onClick={()=>setMessage('')}>Clear error</Button><WorkflowActions target={footer} label='Fixture actions'><InlineFeedback message={message.startsWith('Couldn’t export')?message:undefined}/><Button onClick={()=>setMessage('Couldn’t export. Try again.')}>Export clip</Button><Button>Add more clips</Button></WorkflowActions></>}
{view==='Long message'&&<><Button onClick={()=>setMessage('Check the selected start and end timestamps. '+ 'A very long explanation stays readable inside its own feedback row. '.repeat(4))}>Show long error</Button><div className='range-row'><label>Start<input aria-label='Long message start' defaultValue='00:01:04'/></label><label>End<input aria-label='Long message end' defaultValue='00:01:45'/></label><Button>Remove</Button><InlineFeedback message={message}/></div><Button>Following control</Button></>}
</div></WorkflowFrame></Workspace>};createRoot(document.getElementById('root')).render(<App/>);`;
  const server = createServer((req, res) => {
    void (async () => {
      if (req.url?.endsWith("/analysis")) {
        requests++;
        res.setHeader("Content-Type", "application/json");
        return res
          .writeHead(req.method === "GET" ? 200 : 503)
          .end(req.method === "GET" ? "null" : "{}");
      }
      const file =
        req.url === "/app.js"
          ? "app.js"
          : req.url === "/app.css"
            ? "app.css"
            : req.url === "/"
              ? "index.html"
              : null;
      if (!file) return res.writeHead(404).end();
      res.setHeader(
        "Content-Type",
        file.endsWith("js")
          ? "text/javascript"
          : file.endsWith("css")
            ? "text/css"
            : "text/html",
      );
      res.end(await readFile(join(root, file)));
    })().catch(() => res.writeHead(500).end());
  });
  const cleanup = async () => {
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((done) => server.close(() => done()));
    if (dirname(await realpath(root)) !== (await realpath(tmpdir())))
      throw Error("fixture_cleanup_invalid");
    await rm(root, { recursive: true, force: true });
  };
  try {
    await build({
      stdin: { contents: source, resolveDir: resolve("."), loader: "tsx" },
      nodePaths: [resolve("apps/frontend/node_modules")],
      bundle: true,
      platform: "browser",
      format: "esm",
      jsx: "automatic",
      outfile: join(root, "app.js"),
    });
    await writeFile(
      join(root, "index.html"),
      '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
    );
    const port = await listenOwner(server);
    return {
      url: `http://localhost:${port}/`,
      close: cleanup,
      counts: () => ({ analysisRequests: requests }),
    };
  } catch (error) {
    await cleanup();
    throw error;
  } finally {
    await stop();
  }
}
