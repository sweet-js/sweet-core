"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.operatorLt = operatorLt;
exports.getOperatorPrec = getOperatorPrec;
exports.getOperatorAssoc = getOperatorAssoc;
exports.isUnaryOperator = isUnaryOperator;
exports.isOperator = isOperator;
var unaryOperators_372 = { "+": true, "-": true, "!": true, "~": true, "++": true, "--": true, typeof: true, void: true, delete: true };var binaryOperatorPrecedence_373 = { "*": 13, "/": 13, "%": 13, "+": 12, "-": 12, ">>": 11, "<<": 11, ">>>": 11, "<": 10, "<=": 10, ">": 10, ">=": 10, in: 10, instanceof: 10, "==": 9, "!=": 9, "===": 9, "!==": 9, "&": 8, "^": 7, "|": 6, "&&": 5, "||": 4 };var operatorAssoc_374 = { "*": "left", "/": "left", "%": "left", "+": "left", "-": "left", ">>": "left", "<<": "left", ">>>": "left", "<": "left", "<=": "left", ">": "left", ">=": "left", in: "left", instanceof: "left", "==": "left", "!=": "left", "===": "left", "!==": "left", "&": "left", "^": "left", "|": "left", "&&": "left", "||": "left" };function operatorLt(left_375, right_376, assoc_377) {
  if (assoc_377 === "left") {
    return left_375 < right_376;
  } else {
    return left_375 <= right_376;
  }
}function getOperatorPrec(op_378) {
  return binaryOperatorPrecedence_373[op_378];
}function getOperatorAssoc(op_379) {
  return operatorAssoc_374[op_379];
}function isUnaryOperator(op_380) {
  return (op_380.isPunctuator() || op_380.isIdentifier() || op_380.isKeyword()) && unaryOperators_372.hasOwnProperty(op_380.val());
}function isOperator(op_381) {
  if (op_381.isPunctuator() || op_381.isIdentifier() || op_381.isKeyword()) {
    return binaryOperatorPrecedence_373.hasOwnProperty(op_381) || unaryOperators_372.hasOwnProperty(op_381.val());
  }return false;
}
//# sourceMappingURL=operators.js.map
