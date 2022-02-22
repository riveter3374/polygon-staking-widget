# build env
FROM node:14-alpine as build

WORKDIR /app

RUN apk add --no-cache git
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --non-interactive && yarn cache clean
COPY . .
RUN yarn typechain && yarn build

ARG BASE_PATH=""
ARG INFURA_API_KEY=""
ARG ALCHEMY_API_KEY=""
ARG SUPPORTED_CHAINS=""
ARG DEFAULT_CHAIN=""

WORKDIR /app

COPY --from=build /app /app

USER node
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s \
  CMD node healthcheck.js

USER node
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["yarn", "start"]
