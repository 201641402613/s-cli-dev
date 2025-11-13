# 项目创建流程

## 1. 创建发布项目

- mkdir s-cli-dev
- cd s-cli-dev
- npm init -y
- npm install lerna
- lerna init
- 在根目录的 package.json 中添加：

  "workspaces": [
  "packages/*"
  ]

- 创建 packages:
  (1) lerna create core
  (2) lerna create utils
- 软链接：
  在 core 中的 package.json 添加：
  "dependencies": {
  "@s-cli-dev/utils": "^1.0.5"
  },
  然后 npm install
  即可在 core 中软链接到 utils

- lerna version 可以修改版本
- lerna publish 发布 package
  注意1：发布之前需要先登录 npm login，同时因为包名为@开头，属于私有包，所以需要在每个 package 中的 package.json 添加：
  "publishConfig": {
  "access": "public"
  },
  另外，需要去npmjs.com 上创建一个Organizations，然后发布上去

  注意：发布的话没有LICENSE.md会报错，需要手动添加
