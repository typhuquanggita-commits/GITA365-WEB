FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg chromium ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production \
    RENDER_INPUT_ROOT=/jobs \
    RENDER_OUTPUT_ROOT=/output \
    REMOTION_CHROME_EXECUTABLE=/usr/bin/chromium \
    HOME=/tmp \
    XDG_CACHE_HOME=/tmp \
    XDG_CONFIG_HOME=/tmp
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
RUN useradd --create-home --uid 10001 renderer \
    && mkdir -p /jobs /output \
    && chown -R renderer:renderer /app /jobs /output
USER renderer
ENTRYPOINT ["node", "src/render.mjs"]
