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

open <http://localhost:63211>

## systemd のテンプレート

```conf
# /etc/systemd/system/bun-hono1.service
[Unit]
Description=Bun Hono1
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/bun-hono1
ExecStart=/usr/local/bin/bun run src/index.ts
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
