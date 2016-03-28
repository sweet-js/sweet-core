"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = moduleLoader;

var _fs = require("fs");

function moduleLoader(path_405) {
  try {
    return (0, _fs.readFileSync)(path_405, "utf8");
  } catch (e) {
    return "";
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L25vZGUtbW9kdWxlLWxvYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztrQkFDd0IsWUFBWTs7OztBQUFyQixTQUFTLFlBQVksQ0FBQyxRQUFRLEVBQUU7QUFDN0MsTUFBSTtBQUNGLFdBQU8sc0JBQWEsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0dBQ3ZDLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixXQUFPLEVBQUUsQ0FBQztHQUNYO0NBQ0YiLCJmaWxlIjoibm9kZS1tb2R1bGUtbG9hZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtyZWFkRmlsZVN5bmMsIHN0YXRTeW5jfSBmcm9tIFwiZnNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1vZHVsZUxvYWRlcihwYXRoXzQwNSkge1xuICB0cnkge1xuICAgIHJldHVybiByZWFkRmlsZVN5bmMocGF0aF80MDUsIFwidXRmOFwiKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBcIlwiO1xuICB9XG59XG4iXX0=