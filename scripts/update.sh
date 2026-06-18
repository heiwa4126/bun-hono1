#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/bun-hono1/app"
BUN_BIN="/opt/bun-hono1/runtime/bin/bun"
SERVICE_NAME="bun-hono1.service"

sudo git -C "$APP_DIR" fetch --prune origin
sudo git -C "$APP_DIR" pull --ff-only origin main
sudo "$BUN_BIN" install --cwd "$APP_DIR" --frozen-lockfile

# app は root:www-data の read-only 方針を再適用。
sudo chown -R root:www-data "$APP_DIR"
sudo find "$APP_DIR" -type d -exec chmod 750 {} \;
sudo find "$APP_DIR" -type f -exec chmod 640 {} \;

sudo systemctl restart "$SERVICE_NAME"
sudo systemctl status "$SERVICE_NAME" --no-pager
