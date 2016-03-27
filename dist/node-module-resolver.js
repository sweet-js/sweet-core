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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L25vZGUtbW9kdWxlLXJlc29sdmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O2tCQUN3Qjs7QUFEeEI7Ozs7OztBQUNlLFNBQVMsYUFBVCxDQUF1QixRQUF2QixFQUFpQyxPQUFqQyxFQUEwQztBQUN2RCxTQUFPLGtCQUFRLElBQVIsQ0FBYSxRQUFiLEVBQXVCLEVBQUMsU0FBUyxPQUFULEVBQXhCLENBQVAsQ0FEdUQ7Q0FBMUMiLCJmaWxlIjoibm9kZS1tb2R1bGUtcmVzb2x2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcmVzb2x2ZSBmcm9tIFwicmVzb2x2ZVwiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVzb2x2ZU1vZHVsZShwYXRoXzM3MCwgY3dkXzM3MSkge1xuICByZXR1cm4gcmVzb2x2ZS5zeW5jKHBhdGhfMzcwLCB7YmFzZWRpcjogY3dkXzM3MX0pO1xufVxuIl19