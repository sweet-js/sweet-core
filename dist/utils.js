"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixin = mixin;
function mixin(target_1141, source_1142) {
  class F_1143 extends target_1141 {}
  Object.getOwnPropertyNames(source_1142.prototype).forEach(name_1144 => {
    if (name_1144 !== "constructor") {
      let newProp = Object.getOwnPropertyDescriptor(source_1142.prototype, name_1144);
      Object.defineProperty(F_1143.prototype, name_1144, newProp);
    }
  });
  return F_1143;
}