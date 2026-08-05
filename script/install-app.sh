#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=script/params.sh
. "$(dirname "$0")/params.sh"

bun ci
bun run compile

# このプロジェクト用dirを作る
sudo mkdir -p "$server_dir"
sudo chown root:root "$server_dir"
sudo chmod 755 "$server_dir"

# バイナリをコピー
sudo install -o root -g root -m 755 "dist/$project_name" "$server_dir/$project_name"

# systemd サービススクリプト作成
SERVICE_SCRIPT="/etc/systemd/system/$project_name.service"

tmp_service="$(mktemp)"
cat >"$tmp_service" <<EOF
[Unit]
Description=$project_name
After=network.target

[Service]
Type=notify
User=$username
Group=$username
WorkingDirectory=$server_dir
ExecStart=$server_dir/$project_name
Restart=on-failure
RestartSec=5
StartLimitInterval=60
StartLimitBurst=3
MemoryMax=64M
Environment="LANG=C"
Environment="PORT=63212"
Environment="NODE_ENV=production"
UMask=0077
RemoveIPC=true
NoNewPrivileges=true
PrivateTmp=true
ProtectClock=true
ProtectKernelLogs=true
ProtectHostname=true
ProtectProc=invisible
ProcSubset=pid
ProtectSystem=strict
ProtectHome=true
PrivateDevices=true
LockPersonality=true
RestrictRealtime=true
RestrictNamespaces=true
SystemCallArchitectures=native
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
RestrictSUIDSGID=true
RestrictAddressFamilies=AF_UNIX AF_INET
IPAddressDeny=any
IPAddressAllow=127.0.0.1
CapabilityBoundingSet=
AmbientCapabilities=
WatchdogSec=30

[Install]
WantedBy=multi-user.target
EOF

sudo install -o root -g root -m 644 "$tmp_service" "$SERVICE_SCRIPT"
rm -f "$tmp_service"

sudo systemctl daemon-reload
sudo systemctl enable --now "$project_name.service"
sudo systemctl status "$project_name.service" --no-pager
