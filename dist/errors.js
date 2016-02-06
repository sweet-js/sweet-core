"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expect = expect;
exports.assert = assert;
function expect(cond, message, offendingSyntax, rest) {
  if (!cond) {
    var ctx = "";
    if (rest) {
      var _ctx = rest.slice(0, 20).map(function (s) {
        if (s === offendingSyntax) {
          return "__" + s.val() + "__";
        }
        return s.val();
      }).join(" ");
    }
    throw new Error("[error]: " + message + "\n" + ctx);
  }
}

function assert(cond, message) {
  if (!cond) {
    throw new Error("[assertion error]: " + message);
  }
}
//# sourceMappingURL=errors.js.map
