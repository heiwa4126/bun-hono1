#!/usr/bin/env bash
# shellcheck disable=SC2034
username="my-app"
project_name=$(bun -e "console.log((await Bun.file('package.json').json()).name)")
user_dir="/opt/$username"
server_dir="$user_dir/$project_name"
