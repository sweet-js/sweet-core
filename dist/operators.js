"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.operatorLt = operatorLt;
exports.getOperatorPrec = getOperatorPrec;
exports.getOperatorAssoc = getOperatorAssoc;
exports.isUnaryOperator = isUnaryOperator;
exports.isOperator = isOperator;
const unaryOperators_499 = { "+": true, "-": true, "!": true, "~": true, "++": true, "--": true, typeof: true, void: true, delete: true };
const binaryOperatorPrecedence_500 = { "*": 13, "/": 13, "%": 13, "+": 12, "-": 12, ">>": 11, "<<": 11, ">>>": 11, "<": 10, "<=": 10, ">": 10, ">=": 10, in: 10, instanceof: 10, "==": 9, "!=": 9, "===": 9, "!==": 9, "&": 8, "^": 7, "|": 6, "&&": 5, "||": 4 };
var operatorAssoc_501 = { "*": "left", "/": "left", "%": "left", "+": "left", "-": "left", ">>": "left", "<<": "left", ">>>": "left", "<": "left", "<=": "left", ">": "left", ">=": "left", in: "left", instanceof: "left", "==": "left", "!=": "left", "===": "left", "!==": "left", "&": "left", "^": "left", "|": "left", "&&": "left", "||": "left" };
function operatorLt(left_502, right_503, assoc_504) {
  if (assoc_504 === "left") {
    return left_502 < right_503;
  } else {
    return left_502 <= right_503;
  }
}
function getOperatorPrec(op_505) {
  return binaryOperatorPrecedence_500[op_505];
}
function getOperatorAssoc(op_506) {
  return operatorAssoc_501[op_506];
}
function isUnaryOperator(op_507) {
  return (op_507.match("punctuator") || op_507.match("identifier") || op_507.match("keyword")) && unaryOperators_499.hasOwnProperty(op_507.val());
}
function isOperator(op_508) {
  if (op_508.match("punctuator") || op_508.match("identifier") || op_508.match("keyword")) {
    return binaryOperatorPrecedence_500.hasOwnProperty(op_508) || unaryOperators_499.hasOwnProperty(op_508.val());
  }
  return false;
}