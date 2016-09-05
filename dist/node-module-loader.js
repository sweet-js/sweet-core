'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = moduleLoader;

var _fs = require('fs');

function moduleLoader(path) {
  try {
    return (0, _fs.readFileSync)(path, 'utf8');
  } catch (e) {
    return "";
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlLW1vZHVsZS1sb2FkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7a0JBRXdCLFk7O0FBRnhCOztBQUVlLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0QjtBQUN6QyxNQUFJO0FBQ0YsV0FBTyxzQkFBYSxJQUFiLEVBQW1CLE1BQW5CLENBQVA7QUFDRCxHQUZELENBRUUsT0FBTyxDQUFQLEVBQVU7QUFDVixXQUFPLEVBQVA7QUFDRDtBQUNGIiwiZmlsZSI6Im5vZGUtbW9kdWxlLWxvYWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbW9kdWxlTG9hZGVyKHBhdGgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gcmVhZEZpbGVTeW5jKHBhdGgsICd1dGY4Jyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfVxufVxuIl19