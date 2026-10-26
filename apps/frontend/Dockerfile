FROM --platform=linux/amd64 node:22.23.4-bookworm-slim@sha256:ea11b74b986d520137cdef9a5346e447a00f275ecc4abc0055b7151226231e09 AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack pnpm fetch --ignore-scripts
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack pnpm install --offline --frozen-lockfile
RUN corepack pnpm --filter @clipbuilder/contracts build && corepack pnpm --filter @clipbuilder/composition build && corepack pnpm --filter @clipbuilder/frontend exec next build
# Linux acceptance: no links to the source store, authoring captures, secrets or test UI.
RUN node --experimental-strip-types apps/frontend/scripts/verify-release-artifact.ts
RUN test -f apps/frontend/public/favicon.png && test -f apps/frontend/public/product-film/opening.jpg

FROM --platform=linux/amd64 node:22.23.4-bookworm-slim@sha256:ea11b74b986d520137cdef9a5346e447a00f275ecc4abc0055b7151226231e09 AS runtime
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/* /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/pnpm /usr/local/bin/pnpx /usr/local/bin/yarn /usr/local/bin/yarnpkg
WORKDIR /app
COPY --from=build --chown=node:node /workspace/apps/frontend/.next/standalone ./
COPY --from=build --chown=node:node /workspace/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build --chown=node:node /workspace/apps/frontend/public ./apps/frontend/public
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=8080 APP_ENV=local
USER node
EXPOSE 8080
CMD ["node", "apps/frontend/server.js"]
