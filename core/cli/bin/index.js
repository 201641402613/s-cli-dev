#! /usr/bin/env node
const importLocal = require("import-local");

// console.log("__filename:", __filename);
// console.log("process.argv.slice(2):", process.argv.slice(2));

if (importLocal(__filename)) {
  require("npmlog").info("cli", "正在使用本地版本");
} else {
  (async () => {
    await require("../lib")(process.argv.slice(2));
  })();
}
