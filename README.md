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

ポートは環境変数 PORT で変更できる (デフォルト:63211)

### バンドル関係

```sh
# ソースレベルでバンドルして実行
bun run build
bun run preview

# 実行ファイル化して実行
bun run compile
bun run exec
```

## 配置

`bun build --compile` で実行ファイル化して systemd で動かす。

実行するホスト上に bun と git は必要。

レポジトリをクローンしたら、

```sh
# 最初の1回
bun run create-user
bun run install-app

# 更新
git pull
bun run update-app

# 削除
bun run delete
```

## systemdスクリプトのセキュリティ

実機で create-user & install-app したら

```sh
bun run security
```

を実行し、その出力を AI と相談すると、よりセキュアになって良い。
