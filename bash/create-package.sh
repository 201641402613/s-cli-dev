#!/bin/bash
PACKAGE_NAME=$1
shift 1
DEPENDENCIES="$@"

# 创建包
npx lerna create $PACKAGE_NAME

# 刷新 workspace
npm install

# 安装依赖
if [ ! -z "$DEPENDENCIES" ]; then
  npm install $DEPENDENCIES -w $PACKAGE_NAME
fi
