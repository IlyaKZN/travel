#!/usr/bin/env bash
# Ensure Web Push (VAPID) keys exist in server/.env — safe to run on existing installs.
set -euo pipefail

APP_DIR=/opt/travels
SERVER_ENV="$APP_DIR/server/.env"
PUBLIC_URL="${PUBLIC_URL:-https://trip-vmeste.ru}"

if [[ ! -f "$SERVER_ENV" ]]; then
  echo "server/.env not found — run deploy/install.sh first"
  exit 1
fi

changed=0

if ! grep -q '^APP_PUBLIC_URL=' "$SERVER_ENV"; then
  echo "APP_PUBLIC_URL=${PUBLIC_URL}" >>"$SERVER_ENV"
  changed=1
fi

if ! grep -q '^VAPID_SUBJECT=' "$SERVER_ENV"; then
  echo "VAPID_SUBJECT=${PUBLIC_URL}" >>"$SERVER_ENV"
  changed=1
fi

if ! grep -q '^VAPID_PUBLIC_KEY=' "$SERVER_ENV"; then
  cd "$APP_DIR/server"
  KEYS="$(npx --yes web-push generate-vapid-keys)"
  PUBLIC_KEY="$(echo "$KEYS" | awk '/Public Key:/{getline; print $1}')"
  PRIVATE_KEY="$(echo "$KEYS" | awk '/Private Key:/{getline; print $1}')"
  {
    echo "VAPID_PUBLIC_KEY=${PUBLIC_KEY}"
    echo "VAPID_PRIVATE_KEY=${PRIVATE_KEY}"
  } >>"$SERVER_ENV"
  changed=1
  echo "Generated VAPID keys"
fi

chmod 600 "$SERVER_ENV"

if [[ "$changed" -eq 1 ]]; then
  echo "Updated $SERVER_ENV"
  systemctl restart travels-api
  echo "API restarted"
fi

curl -sf "https://trip-vmeste.ru/api/push/vapid-key" || curl -sf "http://127.0.0.1:3001/api/push/vapid-key"
echo
