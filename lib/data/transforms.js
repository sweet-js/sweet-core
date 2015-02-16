"use strict";
function SyntaxTransform(trans, isOp, builtin, fullName) {
  this.fn = trans;
  this.isOp = isOp;
  this.builtin = builtin;
  this.fullName = fullName;
}
function VarTransform(id) {
  this.id = id;
}
exports.SyntaxTransform = SyntaxTransform;
exports.VarTransform = VarTransform;
//# sourceMappingURL=transforms.js.map