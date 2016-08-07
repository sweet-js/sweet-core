"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resolveModule;

var _resolve = require("resolve");

var _resolve2 = _interopRequireDefault(_resolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resolveModule(path_550, cwd_551) {
  return _resolve2.default.sync(path_550, { basedir: cwd_551 });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L25vZGUtbW9kdWxlLXJlc29sdmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O2tCQUN3QixhOztBQUR4Qjs7Ozs7O0FBQ2UsU0FBUyxhQUFULENBQXVCLFFBQXZCLEVBQWlDLE9BQWpDLEVBQTBDO0FBQ3ZELFNBQU8sa0JBQVEsSUFBUixDQUFhLFFBQWIsRUFBdUIsRUFBQyxTQUFTLE9BQVYsRUFBdkIsQ0FBUDtBQUNEIiwiZmlsZSI6Im5vZGUtbW9kdWxlLXJlc29sdmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlc29sdmUgZnJvbSBcInJlc29sdmVcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlc29sdmVNb2R1bGUocGF0aF81NTAsIGN3ZF81NTEpIHtcbiAgcmV0dXJuIHJlc29sdmUuc3luYyhwYXRoXzU1MCwge2Jhc2VkaXI6IGN3ZF81NTF9KTtcbn1cbiJdfQ==