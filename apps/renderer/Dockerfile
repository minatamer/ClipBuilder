# Standard Remotion Node SSR. Linux image proof remains a separately gated step.
FROM --platform=linux/amd64 node:22-bookworm-slim@sha256:43ac6c60b8f89723f746e8a92ce91abd5017e627ce1ddfe4238355d3a30b772c AS base
RUN apt-get update && apt-get install -y --no-install-recommends libnss3 libdbus-1-3 libatk1.0-0 libgbm1 libasound2 libxrandr2 libxkbcommon0 libxfixes3 libxcomposite1 libxdamage1 libatk-bridge2.0-0 libpango-1.0-0 libcairo2 libcups2 fonts-liberation ca-certificates && rm -rf /var/lib/apt/lists/*

FROM base AS build
WORKDIR /workspace
RUN corepack enable
COPY . .
RUN corepack pnpm install --frozen-lockfile
RUN corepack pnpm --filter @clipbuilder/contracts build && corepack pnpm --filter @clipbuilder/composition build && corepack pnpm --filter @clipbuilder/renderer build && corepack pnpm --filter @clipbuilder/renderer bundle
RUN corepack pnpm --filter @clipbuilder/renderer exec tsx scripts/stage-tools.ts /opt/clipbuilder
RUN dpkg-query -W > /opt/clipbuilder/debian-packages.txt
USER node
RUN node apps/renderer/scripts/verify-linux-media.mjs
USER root
RUN corepack pnpm --filter @clipbuilder/renderer deploy --prod /runtime

FROM base AS runtime
WORKDIR /app
COPY --from=build --chown=node:node /runtime /app
COPY --from=build /opt/clipbuilder /opt/clipbuilder
COPY --from=build /tmp/clipbuilder-linux-media-proof.json /opt/clipbuilder/linux-media-proof.json
ENV NODE_ENV=production PORT=8080 CHROMIUM_PATH=/opt/clipbuilder/chromium/chrome-headless-shell FFMPEG_PATH=/opt/clipbuilder/compositor/ffmpeg FFPROBE_PATH=/opt/clipbuilder/compositor/ffprobe REMOTION_BUNDLE_PATH=/app/bundle
USER node
RUN node --input-type=module -e 'import {readFileSync, existsSync} from "node:fs"; import {createHash} from "node:crypto"; import {execFileSync} from "node:child_process"; import assert from "node:assert/strict"; assert.equal(process.platform,"linux"); assert.equal(process.arch,"x64"); for (const name of ["./dist/app.js","@clipbuilder/contracts","@clipbuilder/composition","@remotion/renderer"]) await import(name); assert(existsSync("/app/bundle/index.html")); const tools=JSON.parse(readFileSync("/opt/clipbuilder/runtime-tools.json","utf8")); for (const name of ["/compositor/ffmpeg","/compositor/ffprobe","/chromium/chrome-headless-shell"]) { const path="/opt/clipbuilder"+name; assert.equal(createHash("sha256").update(readFileSync(path)).digest("hex"),tools[name]); const version=execFileSync(path,[name.includes("chromium")?"--version":"-version"],{timeout:10000,encoding:"utf8"}); if (name.includes("chromium")) assert(version.includes(tools.chromium)); } console.log("Linux image imports, bundle, binary hashes and versions verified.");'
EXPOSE 8080
CMD ["node", "dist/server.js"]
