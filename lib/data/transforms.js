"use strict";

function SyntaxTransform4558(trans4560, isOp4561, builtin4562, fullName4563) {
    this.fn = trans4560;
    this.isOp = isOp4561;
    this.builtin = builtin4562;
    this.fullName = fullName4563;
}
function VarTransform4559(id4564) {
    this.id = id4564;
}
exports.SyntaxTransform = SyntaxTransform4558;
exports.VarTransform = VarTransform4559;
//# sourceMappingURL=transforms.js.map