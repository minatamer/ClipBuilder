FROM --platform=linux/amd64 node:22.23.4-bookworm-slim@sha256:ea11b74b986d520137cdef9a5346e447a00f275ecc4abc0055b7151226231e09 AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack pnpm fetch --ignore-scripts
COPY . .
RUN corepack pnpm install --offline --frozen-lockfile
RUN corepack pnpm --filter @clipbuilder/contracts build && corepack pnpm --filter @clipbuilder/backend build
RUN corepack pnpm --filter @clipbuilder/composition build && node scripts/editing-worker-build.mjs
RUN corepack pnpm --filter @clipbuilder/backend deploy --prod /runtime
RUN corepack pnpm --filter @clipbuilder/renderer deploy --prod /media-runtime

FROM --platform=linux/amd64 node:22.23.4-bookworm-slim@sha256:ea11b74b986d520137cdef9a5346e447a00f275ecc4abc0055b7151226231e09 AS runtime
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends ffmpeg=7:5.1.9-0+deb12u1 chromium fonts-liberation ca-certificates && rm -rf /var/lib/apt/lists/* /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/pnpm /usr/local/bin/pnpx /usr/local/bin/yarn /usr/local/bin/yarnpkg
WORKDIR /app
COPY --from=build --chown=node:node /runtime ./
COPY --from=build --chown=node:node /media-runtime ./media
# Initial hosted startup is deliberately fake/paid-off until explicit launch approval.
ENV NODE_ENV=production PORT=8080 APP_ENV=preview FAKE_MODE=true PAID_DEMO_ENABLED=false
USER node
EXPOSE 8080
CMD ["node", "dist/server.js"]
