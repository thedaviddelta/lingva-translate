#!/usr/bin/env bash
set -e

LT_URL="http://127.0.0.1:5000"
APP_PORT="${PORT:-3001}"

echo "Starting LibreTranslate..."
cd /app
./scripts/entrypoint.sh &
LT_PID=$!

NEXT_PID=""

terminate() {
    trap - TERM INT EXIT
    kill "$NEXT_PID" "$LT_PID" 2>/dev/null || true
    wait "$NEXT_PID" "$LT_PID" 2>/dev/null || true
}
trap terminate TERM INT EXIT

echo "Waiting for LibreTranslate to be ready (downloading models on the first run)..."
LT_READY=""
for _ in $(seq 1 300); do
    if /app/venv/bin/python -c "import urllib.request; urllib.request.urlopen('${LT_URL}/languages', timeout=2)" >/dev/null 2>&1; then
        LT_READY="yes"
        break
    fi
    if ! kill -0 "$LT_PID" 2>/dev/null; then
        echo "LibreTranslate exited unexpectedly" >&2
        exit 1
    fi
    sleep 2
done

if [ -z "$LT_READY" ]; then
    echo "WARNING: LibreTranslate did not become ready in 10 minutes, starting the app anyway" >&2
else
    echo "LibreTranslate is ready"
fi

cd /lingva

export NEXT_PUBLIC_SITE_DOMAIN="${site_domain:-${NEXT_PUBLIC_SITE_DOMAIN:-localhost:3000}}"
export NEXT_PUBLIC_FORCE_DEFAULT_THEME="${force_default_theme:-${NEXT_PUBLIC_FORCE_DEFAULT_THEME:-}}"
export NEXT_PUBLIC_DEFAULT_SOURCE_LANG="${default_source_lang:-${NEXT_PUBLIC_DEFAULT_SOURCE_LANG:-auto}}"
export NEXT_PUBLIC_DEFAULT_TARGET_LANG="${default_target_lang:-${NEXT_PUBLIC_DEFAULT_TARGET_LANG:-en}}"

echo "Building the app..."
yarn build

echo "Starting the app on port ${APP_PORT}..."
node_modules/.bin/next start --port "${APP_PORT}" &
NEXT_PID=$!

wait -n "$LT_PID" "$NEXT_PID" || true
