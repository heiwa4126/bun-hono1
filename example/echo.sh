#!/usr/bin/env bash
set -euo pipefail
API=http://127.0.0.1:63211/echo

curl -X POST \
	-H "Content-Type: application/json" \
	-d '{"name":"太郎", "age":"30"}' "$API"
