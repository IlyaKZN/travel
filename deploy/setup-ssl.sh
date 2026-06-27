#!/usr/bin/env bash
# Install GlobalSign SSL certificate for trip-vmeste.ru
set -euo pipefail

SSL_DIR=/etc/ssl/trip-vmeste.ru
CERT_SRC="${1:-/tmp/trip-vmeste-certs}"

if [[ ! -f "$CERT_SRC/certificate.crt" ]] || [[ ! -f "$CERT_SRC/certificate.key" ]]; then
  echo "Usage: setup-ssl.sh [cert-directory]"
  echo "Expected files: certificate.crt, certificate.key, certificate_ca.crt"
  exit 1
fi

echo "==> Installing SSL certificates to $SSL_DIR..."
install -d -m 755 "$SSL_DIR"

cp "$CERT_SRC/certificate.crt" "$SSL_DIR/cert.pem"
cp "$CERT_SRC/certificate.key" "$SSL_DIR/privkey.pem"
chmod 644 "$SSL_DIR/cert.pem"
chmod 600 "$SSL_DIR/privkey.pem"

if [[ -f "$CERT_SRC/certificate_ca.crt" ]]; then
  cat "$CERT_SRC/certificate.crt" "$CERT_SRC/certificate_ca.crt" >"$SSL_DIR/fullchain.pem"
else
  cp "$CERT_SRC/certificate.crt" "$SSL_DIR/fullchain.pem"
fi
chmod 644 "$SSL_DIR/fullchain.pem"

echo "==> Updating nginx configuration..."
cp /opt/travels/deploy/nginx-travels.conf /etc/nginx/sites-available/travels
ln -sf /etc/nginx/sites-available/travels /etc/nginx/sites-enabled/travels
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

echo "==> SSL setup complete"
echo "Verify: curl -sI https://trip-vmeste.ru/ | head -5"
