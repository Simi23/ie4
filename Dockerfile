FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY patches /temp/dev/patches
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
COPY patches /temp/prod/patches
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://localhost/test"
COPY --from=install /temp/dev/node_modules node_modules
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN bun --bun run prisma generate
COPY . .
RUN bun run build

FROM base AS release
RUN apt update -y && apt install -y openssl
COPY --from=prerelease /usr/src/app/.output ./
COPY --from=prerelease /usr/src/app/package.json ./
# COPY --from=prerelease /usr/src/app/generated generated
COPY --from=prerelease /usr/src/app/prisma prisma
COPY --from=prerelease /usr/src/app/prisma.config.ts ./
RUN bun add prisma@7.5.0
RUN mkdir -p /usr/src/app/public/images
RUN mkdir -p /usr/src/app/uploads
RUN chown -R bun:bun /usr/src/app

USER bun
EXPOSE 3000
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
CMD ["bun", "run", "start:migrate:prod"]
