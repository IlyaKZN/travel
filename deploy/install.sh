#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/travels
DEPLOY_DIR="$APP_DIR/deploy"
SERVER_ENV="$APP_DIR/server/.env"
PUBLIC_URL="${PUBLIC_URL:-http://2.26.65.212}"

echo "==> Installing system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates nginx rsync

NODE_MAJOR=0
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR="$(node -v | sed 's/^v//' | cut -d. -f1)"
fi

if [[ "$NODE_MAJOR" -lt 20 ]]; then
  echo "==> Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

echo "==> Node $(node -v), npm $(npm -v)"

if [[ ! -f "$SERVER_ENV" ]] || grep -q 'travels-dev-secret' "$SERVER_ENV" 2>/dev/null; then
  echo "==> Creating server/.env..."
  POSTGRES_PASSWORD="$(openssl rand -hex 16)"
  JWT_SECRET="$(openssl rand -hex 32)"
  cat >"$SERVER_ENV" <<EOF
HOST=127.0.0.1
PORT=3001
DATABASE_URL=postgresql://travels:${POSTGRES_PASSWORD}@127.0.0.1:5432/travels
JWT_SECRET=${JWT_SECRET}
CORS_ORIGIN=${PUBLIC_URL}
EOF
  chmod 600 "$SERVER_ENV"
  export POSTGRES_PASSWORD
else
  echo "==> Using existing server/.env"
  POSTGRES_PASSWORD="$(grep '^DATABASE_URL=' "$SERVER_ENV" | sed 's/.*:\/\/travels:\([^@]*\)@.*/\1/')"
  export POSTGRES_PASSWORD
fi

echo "==> Starting PostgreSQL..."
cd "$DEPLOY_DIR"
export POSTGRES_PASSWORD
docker-compose -f docker-compose.prod.yml -p travels up -d

echo "==> Waiting for PostgreSQL..."
for i in $(seq 1 30); do
  if docker-compose -f docker-compose.prod.yml -p travels exec -T postgres pg_isready -U travels -d travels >/dev/null 2>&1; then
    echo "PostgreSQL is ready"
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    echo "PostgreSQL failed to start"
    exit 1
  fi
  sleep 2
done

echo "==> Installing dependencies and building..."
cd "$APP_DIR"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=768}"
npm ci
npm run build

cd "$APP_DIR/server"
npm ci
npx prisma generate
npm run build
npx prisma migrate deploy

echo "==> Configuring nginx..."
cp "$DEPLOY_DIR/nginx-travels.conf" /etc/nginx/sites-available/travels
ln -sf /etc/nginx/sites-available/travels /etc/nginx/sites-enabled/travels
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

echo "==> Configuring API service..."
cp "$DEPLOY_DIR/travels-api.service" /etc/systemd/system/travels-api.service
systemctl daemon-reload
systemctl enable travels-api
systemctl restart travels-api

echo "==> Done!"
echo "App URL: ${PUBLIC_URL}"
echo "API health: curl -s ${PUBLIC_URL}/api/... (login etc.)"
systemctl --no-pager status travels-api --lines=5
