#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=script/params.sh
. "$(dirname "$0")/params.sh"

# 実行専用ユーザを作る(ログイン不可)
if ! id -u "$username" >/dev/null 2>&1; then
	sudo useradd --system --home-dir /dev/null --shell /usr/sbin/nologin "$username"
fi

# my-app 用バイナリ置き場を作る
sudo mkdir -p "$user_dir"
sudo chown root:root "$user_dir"
sudo chmod 755 "$user_dir"
