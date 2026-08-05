#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/params.sh"

sudo systemctl disable "$project_name.service" --now || true
sudo rm -rf "$server_dir"
