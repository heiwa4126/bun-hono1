#!/usr/bin/env bash
username="my-app"
gid=$(id -g) # カレントユーザのグループIDを取得
project_name=$(bun -e "console.log((await Bun.file('package.json').json()).name)")
user_dir="/opt/$username"
server_dir="$user_dir/$project_name"
