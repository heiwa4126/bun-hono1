#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=script/params.sh
. "$(dirname "$0")/params.sh"

unit_name="${1:-$project_name}"

if [[ "$unit_name" != *.* ]]; then
	unit_name="${unit_name}.service"
fi

if ! command -v systemd-analyze >/dev/null 2>&1; then
	echo "systemd-analyze command not found" >&2
	exit 1
fi

echo "== unit status (${unit_name}) =="
systemctl status --no-pager "$unit_name" || true

echo
echo "== systemd security report (${unit_name}) =="
systemd-analyze security --no-pager "$unit_name"
