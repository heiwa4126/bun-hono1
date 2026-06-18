#!/usr/bin/env bash
set -euo pipefail

# アプリと Bun 本体を配置
sudo mkdir -p /opt/bun-hono1/app
sudo mkdir -p /opt/bun-hono1/runtime

# Bun は最初から /opt/bun-hono1/runtime にインストールする
# 公式ドキュメントの BUN_INSTALL を使って配置先を固定
sudo env BUN_INSTALL=/opt/bun-hono1/runtime bash -lc 'curl -fsSL https://bun.com/install | bash -s "bun-v1.3.14"'

# 実行ユーザから参照できる権限にする
sudo chown -R root:root /opt/bun-hono1/runtime
sudo find /opt/bun-hono1/runtime -type d -exec chmod 755 {} \;
sudo find /opt/bun-hono1/runtime -type f -exec chmod 644 {} \;
sudo chmod 755 /opt/bun-hono1/runtime/bin/bun

# app は root:www-data で read-only 運用
sudo chown -R root:www-data /opt/bun-hono1/app
sudo find /opt/bun-hono1/app -type d -exec chmod 750 {} \;
sudo find /opt/bun-hono1/app -type f -exec chmod 640 {} \;

# 書き込みが必要な場所だけ分離
sudo mkdir -p /var/lib/bun-hono1
sudo chown hono1:hono1 /var/lib/bun-hono1
sudo chmod 750 /var/lib/bun-hono1
