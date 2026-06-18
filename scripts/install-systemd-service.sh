#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_SRC="$REPO_ROOT/var/bun-hono1.service"
SERVICE_LINK="/etc/systemd/system/bun-hono1.service"

mkdir -p "$REPO_ROOT/var"

# ./var/bun-hono1.service をこのスクリプトで合成する。
cat > "$SERVICE_SRC" <<'EOF'
[Unit]
Description=Bun Hono1
After=network.target

[Service]
Type=notify
User=hono1
Group=hono1
SupplementaryGroups=www-data
WorkingDirectory=/opt/bun-hono1/app
ExecStart=/opt/bun-hono1/runtime/bin/bun run src/index.ts
Restart=on-failure
RestartSec=5
StartLimitInterval=60
StartLimitBurst=3
MemoryMax=128M
Environment=NODE_ENV=production
ReadWritePaths=/var/lib/bun-hono1
NoNewPrivileges=true
PrivateTmp=true
WatchdogSec=30

[Install]
WantedBy=multi-user.target
EOF

sudo ln -sfn "$SERVICE_SRC" "$SERVICE_LINK"
sudo systemctl daemon-reload
sudo systemctl enable --now bun-hono1.service
sudo systemctl status bun-hono1.service --no-pager
