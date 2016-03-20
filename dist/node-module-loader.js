"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = moduleLoader;

var _fs = require("fs");

function moduleLoader(path_369) {
  try {
    return (0, _fs.readFileSync)(path_369, "utf8");
  } catch (e) {
    return "";
  }
}
//# sourceMappingURL=node-module-loader.js.map
