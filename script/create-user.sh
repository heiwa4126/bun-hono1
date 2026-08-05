#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/params.sh"

# 実行専用ユーザを作る(ログイン不可)
sudo useradd --system --home-dir /dev/null --shell /usr/sbin/nologin "$username"

# バイナリ置き場を作る
sudo mkdir -p "$server_dir"
sudo chown -R "$username":"$gid" "$user_dir"
sudo chmod -R 750 "$user_dir"
