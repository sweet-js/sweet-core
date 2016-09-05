'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resolveModule;

var _resolve = require('resolve');

var _resolve2 = _interopRequireDefault(_resolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resolveModule(path, cwd) {
  return _resolve2.default.sync(path, { basedir: cwd });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlLW1vZHVsZS1yZXNvbHZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztrQkFFd0IsYTs7QUFGeEI7Ozs7OztBQUVlLFNBQVMsYUFBVCxDQUF1QixJQUF2QixFQUE2QixHQUE3QixFQUFrQztBQUMvQyxTQUFPLGtCQUFRLElBQVIsQ0FBYSxJQUFiLEVBQW1CLEVBQUUsU0FBUyxHQUFYLEVBQW5CLENBQVA7QUFDRCIsImZpbGUiOiJub2RlLW1vZHVsZS1yZXNvbHZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByZXNvbHZlIGZyb20gJ3Jlc29sdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXNvbHZlTW9kdWxlKHBhdGgsIGN3ZCkge1xuICByZXR1cm4gcmVzb2x2ZS5zeW5jKHBhdGgsIHsgYmFzZWRpcjogY3dkIH0pO1xufVxuIl19