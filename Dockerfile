FROM node:18-slim as base

FROM base as bun

RUN npm i -g bun
RUN apt-get update -y && apt-get install -y openssl

FROM bun as dependencies

WORKDIR /app

COPY . .
RUN npm install

FROM bun as build

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN bun run build
RUN chmod +x migrate-and-start.sh

CMD ["./migrate-and-start.sh"]

