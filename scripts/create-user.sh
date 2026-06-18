#!/usr/bin/env bash
set -euo pipefail

# 実行専用ユーザを作る(ログイン不可)
sudo useradd --system --create-home --home-dir /home/hono1 --shell /usr/sbin/nologin hono1

# hono1 を www-data グループに追加(app を group read-only で読めるようにする)
sudo usermod -aG www-data hono1
