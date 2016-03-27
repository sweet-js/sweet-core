"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = moduleLoader;

var _fs = require("fs");

function moduleLoader(path_399) {
  try {
    return (0, _fs.readFileSync)(path_399, "utf8");
  } catch (e) {
    return "";
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L25vZGUtbW9kdWxlLWxvYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztrQkFDd0I7O0FBRHhCOztBQUNlLFNBQVMsWUFBVCxDQUFzQixRQUF0QixFQUFnQztBQUM3QyxNQUFJO0FBQ0YsV0FBTyxzQkFBYSxRQUFiLEVBQXVCLE1BQXZCLENBQVAsQ0FERTtHQUFKLENBRUUsT0FBTyxDQUFQLEVBQVU7QUFDVixXQUFPLEVBQVAsQ0FEVTtHQUFWO0NBSFciLCJmaWxlIjoibm9kZS1tb2R1bGUtbG9hZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtyZWFkRmlsZVN5bmMsIHN0YXRTeW5jfSBmcm9tIFwiZnNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1vZHVsZUxvYWRlcihwYXRoXzM5OSkge1xuICB0cnkge1xuICAgIHJldHVybiByZWFkRmlsZVN5bmMocGF0aF8zOTksIFwidXRmOFwiKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBcIlwiO1xuICB9XG59XG4iXX0=