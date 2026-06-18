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


## 配置

これを実際のホストに展開する案。方針は以下の通り

- bun の更新の影響を避けるため、特定ユーザを作る
- バンドルはしない。TypeScript のまま bun で動かす
- git clone と git pull で配置/更新する

### スクリプトで実行



ユーザ名は `hono1` とする

まず、普通のユーザでこのレポジトリをcloneして、

```sh
# 最初1回ユーザー作成し、専用のbunをインストールする
sudo scripts/create-user.sh
```


```sh
# 初回デプロイ(先頭で clone を実行)
./scripts/deploy.sh

# service ファイルを ./var/bun-hono1.service として合成し、
# /etc/systemd/system/bun-hono1.service へ symlink して反映
./scripts/install-systemd-service.sh

# 更新
./scripts/update.sh
```
