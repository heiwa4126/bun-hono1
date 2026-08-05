#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=script/params.sh
. "$(dirname "$0")/params.sh"

sudo systemctl disable "$project_name.service" --now || true
sudo rm -f "/etc/systemd/system/$project_name.service"
sudo systemctl daemon-reload
sudo rm -rf "$server_dir"
