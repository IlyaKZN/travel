#!/usr/bin/env bash
# Incremental deploy after files are synced to /opt/travels
set -euo pipefail

APP_DIR=/opt/travels
DEPLOY_DIR="$APP_DIR/deploy"
SERVER_ENV="$APP_DIR/server/.env"

cd "$APP_DIR"

if [[ ! -f "$SERVER_ENV" ]]; then
  echo "server/.env not found — run deploy/install.sh first"
  exit 1
fi

POSTGRES_PASSWORD="$(grep '^DATABASE_URL=' "$SERVER_ENV" | sed 's/.*:\/\/travels:\([^@]*\)@.*/\1/')"
export POSTGRES_PASSWORD

echo "==> Ensuring PostgreSQL is running..."
cd "$DEPLOY_DIR"
docker-compose -f docker-compose.prod.yml -p travels up -d

for i in $(seq 1 30); do
  if docker-compose -f docker-compose.prod.yml -p travels exec -T postgres pg_isready -U travels -d travels >/dev/null 2>&1; then
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    echo "PostgreSQL is not ready"
    exit 1
  fi
  sleep 2
done

echo "==> Building frontend..."
cd "$APP_DIR"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=768}"
npm ci
npm run build

echo "==> Building API..."
cd "$APP_DIR/server"
npm ci
npx prisma generate
npm run build
npx prisma migrate deploy

echo "==> Reloading services..."
nginx -t
systemctl reload nginx
systemctl restart travels-api

echo "==> Deploy complete"
curl -sf "http://127.0.0.1/api/health" | head -c 200 || true
echo
