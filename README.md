# bun-hono1

`bun create hono@latest my-app` で作った
てきとうなウエブアプリ。

簡単なリバースプロキシのテスト用。

## 開発と実行

```sh
# To install dependencies:
bun install

# To run:
bun run dev
```

open http://localhost:3000

## systemd のテンプレート

```conf
# /etc/systemd/system/hono-api.service
[Unit]
Description=Hono API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/hono-api
ExecStart=/usr/local/bin/bun run index.ts
Restart=on-failure
RestartSec=5
StartLimitInterval=60
StartLimitBurst=3          # 60秒以内に3回落ちたら諦める
WatchdogSec=30             # systemd watchdog（heartbeat必要）
MemoryMax=512M
Environment=NODE_ENV=production
```

## TODO

↑を追加するスクリプトを書く
