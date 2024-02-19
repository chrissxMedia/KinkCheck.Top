FROM node:lts-alpine
ENV NODE_ENV=production
ENV SUPABASE_URL=
ENV SUPABASE_ANON_KEY=
ENV HCAPTCHA_SITEKEY=
WORKDIR /usr/src/app

# requires buildx/buildkit, which not everything has *yet*
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
#COPY package.json .
#COPY package-lock.json .
#RUN npm ci --omit=dev
#RUN rm package.json package-lock.json

USER node
COPY dist .
EXPOSE 4321
CMD ["node", "server/entry.mjs"]
