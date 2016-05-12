"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = moduleLoader;

var _fs = require("fs");

function moduleLoader(path_402) {
  try {
    return (0, _fs.readFileSync)(path_402, "utf8");
  } catch (e) {
    return "";
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L25vZGUtbW9kdWxlLWxvYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztrQkFDd0IsWTs7QUFEeEI7O0FBQ2UsU0FBUyxZQUFULENBQXNCLFFBQXRCLEVBQWdDO0FBQzdDLE1BQUk7QUFDRixXQUFPLHNCQUFhLFFBQWIsRUFBdUIsTUFBdkIsQ0FBUDtBQUNELEdBRkQsQ0FFRSxPQUFPLENBQVAsRUFBVTtBQUNWLFdBQU8sRUFBUDtBQUNEO0FBQ0YiLCJmaWxlIjoibm9kZS1tb2R1bGUtbG9hZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtyZWFkRmlsZVN5bmMsIHN0YXRTeW5jfSBmcm9tIFwiZnNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1vZHVsZUxvYWRlcihwYXRoXzQwMikge1xuICB0cnkge1xuICAgIHJldHVybiByZWFkRmlsZVN5bmMocGF0aF80MDIsIFwidXRmOFwiKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBcIlwiO1xuICB9XG59XG4iXX0=