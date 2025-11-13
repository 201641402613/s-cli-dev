"use strict";

module.exports = core;

function core() {
  return "Hello from core";
}

const utils = require("@s-cli-dev/utils");

console.log(utils.fn());
