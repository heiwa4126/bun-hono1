#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/params.sh"

bun ci
bun run compile

# このプロジェクト用dirを作る
mkdir -p "$server_dir"
sudo chown "$username":"$gid" "$server_dir"
sudo chmod 770 "$server_dir"

# バイナリをコピー
cp "dist/$project_name" "$server_dir"

# systemd サービススクリプト作成
SERVICE_SCRIPT="$server_dir/$project_name.service"
cat >"$SERVICE_SCRIPT" <<"EOF"
[Unit]
Description=$project_name
After=network.target

[Service]
Type=notify
User="$username"
Group="$username"
SupplementaryGroups=www-data
WorkingDirectory="$server_dir"
ExecStart="$server_dir/$project_name"
Restart=on-failure
RestartSec=5
StartLimitInterval=60
StartLimitBurst=3
MemoryMax=64M
Environment=NODE_ENV=production
ReadWritePaths="$server_dir"
NoNewPrivileges=true
PrivateTmp=true
WatchdogSec=30

[Install]
WantedBy=multi-user.target
EOF
