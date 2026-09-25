# Single-container image bundling the Next.js app and a self-hosted LibreTranslate
FROM libretranslate/libretranslate:v1.9.6

USER root

# Node.js runtime from the official Node image (both images are Debian bookworm)
COPY --from=node:lts-bookworm-slim /usr/local /usr/local
# Yarn is installed outside /usr/local in the Node image
COPY --from=node:lts-bookworm-slim /opt /opt

ENV NEXT_TELEMETRY_DISABLED=1

# Install and run as the image user so no recursive chown is needed later
RUN mkdir -p /lingva && chown libretranslate:libretranslate /lingva

USER libretranslate

WORKDIR /lingva

COPY --chown=libretranslate:libretranslate package.json yarn.lock ./
RUN CYPRESS_INSTALL_BINARY=0 yarn install --frozen-lockfile --cache-folder /tmp/yarn-cache \
    && rm -rf /tmp/yarn-cache

COPY --chown=libretranslate:libretranslate . .

# Languages whose LibreTranslate models are downloaded at build time.
# Override with `--build-arg LT_LOAD_ONLY=en,ru,...` to bake another set.
ARG LT_LOAD_ONLY=en,ru,de,fr,es,zh,ja,tr,ar

ENV NODE_ENV=production \
    PORT=3001 \
    LIBRE_TRANSLATE_URL=http://127.0.0.1:5000 \
    LT_LOAD_ONLY=${LT_LOAD_ONLY}

# Download the models so the container is ready to translate right away
RUN chmod +x docker-entrypoint.sh \
    && LT_POWERCYCLE=1 /app/venv/bin/libretranslate

EXPOSE 3001

ENTRYPOINT ["/lingva/docker-entrypoint.sh"]

# docker build -t lingva .
# docker run -p 3001:3001 lingva
# see also https://hub.docker.com/r/libretranslate/libretranslate
