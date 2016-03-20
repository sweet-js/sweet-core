"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resolveModule;

var _resolve = require("resolve");

var _resolve2 = _interopRequireDefault(_resolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resolveModule(path_370, cwd_371) {
  return _resolve2.default.sync(path_370, { basedir: cwd_371 });
}
//# sourceMappingURL=node-module-resolver.js.map
