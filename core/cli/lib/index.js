"use strict";

module.exports = core;

const path = require("path");
const fs = require("fs");
const commander = require("commander");
const userHome = require("user-home");
const log = require("@s-cli-dev/log");
const init = require("@s-cli-dev/init");

// require支持加载的资源：.js/.json/.node 文件
// .js: 要求：必须通过module.exports或者export.方式导出模块
// .json: 通过JSON.parse()解析json文件，导出对象
// .node: 通过process.dlopen()加载并执行二进制文件，导出模块(我们不咋用)
// any: 其他文件类型，都当成.js文件处理
const pkg = require("../package.json");

let args, config;
const program = new commander.Command();

async function core() {
  console.log("core start");
  checkPkgVersion();
  // checkNodeVersion()
  await checkRoot();
  checkUserHome();
  // checkInputArgs();
  checkEnv();
  await checkGlobalUpdate();
  log.verbose("core", "core end");
  registerCommands();
}

// 命令注册
function registerCommands() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false);

  // 注册命令
  program
    .command("init [projectName]")
    .description("初始化项目")
    .option("-f, --force", "是否强制初始化项目", false)
    .action(init);

  // 监听debug
  program.on("option:debug", function () {
    const opts = program.opts();
    if (opts.debug) {
      process.env.LOG_LEVEL = "verbose";
    } else {
      process.env.LOG_LEVEL = "info";
    }
    log.level = process.env.LOG_LEVEL;
  });

  // 监听未知命令
  program.on("command:*", function (obj) {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    log.error(`未知命令: ${obj[0]}`);
    if (availableCommands.length) {
      log.info(`可用命令: ${availableCommands.join(", ")}`);
    }
  });

  // 对参数进行解析
  program.parse(process.argv);

  // 当没有输入command时，输出帮助信息
  if (!program.args || program.args.length < 1) {
    program.outputHelp();
    console.log(); // 空行
  }
}

async function checkGlobalUpdate() {
  // 1. 获取当前版本和模块名
  // 2. 调用npm api ，获取所有版本号
  // 3. 提起所有版本号，比对哪些版本号是大于当前版本号
  // 4. 获取最新版本号，提示用户升级
  const currentVersion = pkg.version;
  const moduleName = pkg.name;

  const {
    getNpmSemverVersion,
    compareVersion,
  } = require("@s-cli-dev/get-npm-info");
  const lastVersion = await getNpmSemverVersion(currentVersion, moduleName);
  if (compareVersion(lastVersion, currentVersion)) {
    log.warn(
      "更新提示",
      `请尽快更新${moduleName}版本， 当前版本是${currentVersion}， 最新版本是${lastVersion}
更新命令：npm i -g ${moduleName}`
    );
  }
}
function checkEnv() {
  const dotenv = require("dotenv");
  const envPath = path.resolve(userHome, ".env");
  if (!fs.existsSync(envPath)) {
    log.verbose("env", `skip, file not found: ${envPath}`);
    return;
  }
  config = dotenv.config({ path: envPath, quiet: true });
  if (config.error) throw config.error;
  log.verbose("env", process.env.DB_USER);
}

function checkInputArgs() {
  const minimist = require("minimist");
  args = minimist(process.argv.slice(2));
  checkArgs();
}

function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = "verbose";
  } else {
    process.env.LOG_LEVEL = "info";
  }
  log.level = process.env.LOG_LEVEL;
}

function checkUserHome() {
  if (!userHome || !fs.existsSync(userHome)) {
    throw new Error(`当前登录用户主目录不存在: ${userHome}`);
  }
}

async function checkRoot() {
  const rootCheck = await import("root-check");
  rootCheck.default();
}

function checkNodeVersion() {
  const currentVersion = process.versions.node;
  const lowestVersion = pkg.engines.node;
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(`s-cli 需要安装 v${lowestVersion} 以上版本的 Node.js`);
  }
}

function checkPkgVersion() {
  log.notice("cli", pkg.version);
}
