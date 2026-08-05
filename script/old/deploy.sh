#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/bun-hono1/app"
BUN_BIN="/opt/bun-hono1/runtime/bin/bun"
SERVICE_NAME="bun-hono1.service"

# 要件どおり、この clone コマンドから始める。
sudo git clone https://github.com/heiwa4126/bun-hono1.git "$APP_DIR"
cd "$APP_DIR"
sudo git config core.fileMode false

sudo "$BUN_BIN" install --cwd "$APP_DIR" --frozen-lockfile

# app は root:www-data の read-only 方針を適用。
sudo chown -R root:www-data "$APP_DIR"
sudo find "$APP_DIR" -type d -exec chmod 750 {} \;
sudo find "$APP_DIR" -type f -exec chmod 640 {} \;

# サービスが有効化済みなら再起動する。
if sudo systemctl list-unit-files --type=service | grep -q "^${SERVICE_NAME}"; then
  sudo systemctl restart "$SERVICE_NAME"
  sudo systemctl status "$SERVICE_NAME" --no-pager
fi
