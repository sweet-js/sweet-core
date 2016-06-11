"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expect = expect;
exports.assert = assert;
function expect(cond_315, message_316, offendingSyntax_317, rest_318) {
  if (!cond_315) {
    let ctx = "";
    if (rest_318) {
      let ctx = rest_318.slice(0, 20).map(s_319 => {
        if (s_319 === offendingSyntax_317) {
          return "__" + s_319.val() + "__";
        }
        return s_319.val();
      }).join(" ");
    }
    throw new Error("[error]: " + message_316 + "\n" + ctx);
  }
}
function assert(cond_320, message_321) {
  if (!cond_320) {
    throw new Error("[assertion error]: " + message_321);
  }
}