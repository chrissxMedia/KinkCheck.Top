FROM node:lts-alpine
WORKDIR /app

COPY . .

ARG GIT_SHA GIT_REF
ENV GIT_SHA=$GIT_SHA GIT_REF=$GIT_REF

ENV KCT_DATABASE_FILE=/data/kct_v1.db
ENV NODE_ENV=production
ENV ASTRO_TELEMETRY_DISABLED=1
RUN npm ci
RUN --mount=type=tmpfs,target=/data npm run build

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
VOLUME /data
CMD ["node", "dist/server/entry.mjs"]
