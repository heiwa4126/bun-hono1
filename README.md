# bun-hono1

`bun create hono@latest my-app` で作った
てきとうなウエブアプリ。

簡単なリバースプロキシのテスト用。

のはずだったんだけど、systemd の watchdog の heartbeat に bun:ffi で対応しました。

## 開発と実行

```sh
# To install dependencies:
bun ci

# To run:
bun run dev
```

open <http://localhost:63211>

### バンドル関係

[更新案](#更新案) のところ参照

```sh
# ソースレベルでバンドルして実行
bun run build
bun run preview

# 実行ファイル化して実行
bun run compile
bun run exec
```

## 配置

これを実際のホストに展開する案。方針は以下の通り

- bun の更新の影響を避けるため、特定ユーザを作る
- バンドルはしない。TypeScript のまま bun で動かす
- git clone と git pull で配置/更新する

### スクリプトで実行

**この項古い。実行しないこと**

ユーザ名は `hono1` とする

まず、普通のユーザでこのレポジトリを clone して、

```sh
# 最初1回ユーザー作成
sudo script/create-user.sh
# つづいて 専用のbunをインストールする
sudo script/install-bun.sh

# 初回デプロイ
sudo ./script/deploy.sh

# service ファイルを ./var/bun-hono1.service として合成し、
# /etc/systemd/system/bun-hono1.service へ symlink して反映
sudo -i
cd /opt/bun-hono1/app
bash ./script/install-systemd-service.sh
```

```sh
# 更新
sudo -i
cd /opt/bun-hono1/app
bash ./script/update.sh
```

## 更新案

どうも systemd 化する部分がいやなので少し考える。

- やっぱり生 TS よりはバンドルの方がいいような気がするがそれだと実行するホスト上に開発環境が要るよなあ
- [bun bundler](https://bun.com/docs/bundler) はどうだろうか
- `bun build --compile` でコンパイルしてしまうのがよさそう
