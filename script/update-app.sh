#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=script/params.sh
. "$(dirname "$0")/params.sh"

sudo systemctl stop "$project_name.service" || true

"$(dirname "$0")/install-app.sh"
