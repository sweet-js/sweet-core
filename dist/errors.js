"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expect = expect;
exports.assert = assert;
function expect(cond_281, message_282, offendingSyntax_283, rest_284) {
  if (!cond_281) {
    var ctx = "";if (rest_284) {
      var _ctx = rest_284.slice(0, 20).map(function (s) {
        if (s === offendingSyntax_283) {
          return "__" + s.val() + "__";
        }return s.val();
      }).join(" ");
    }throw new Error("[error]: " + message_282 + "\n" + ctx);
  }
}function assert(cond_285, message_286) {
  if (!cond_285) {
    throw new Error("[assertion error]: " + message_286);
  }
}
//# sourceMappingURL=errors.js.map
