"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resolveModule;

var _resolve = require("resolve");

var _resolve2 = _interopRequireDefault(_resolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resolveModule(path_497, cwd_498) {
  return _resolve2.default.sync(path_497, { basedir: cwd_498 });
}