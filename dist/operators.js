'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.operatorLt = operatorLt;
exports.getOperatorPrec = getOperatorPrec;
exports.getOperatorAssoc = getOperatorAssoc;
exports.isUnaryOperator = isUnaryOperator;
exports.isOperator = isOperator;
var unaryOperators = {
  '+': true,
  '-': true,
  '!': true,
  '~': true,
  '++': true,
  '--': true,
  'typeof': true,
  'void': true,
  'delete': true
};
var binaryOperatorPrecedence = {
  "*": 13,
  "/": 13,
  "%": 13,
  "+": 12,
  "-": 12,
  ">>": 11,
  "<<": 11,
  ">>>": 11,
  "<": 10,
  "<=": 10,
  ">": 10,
  ">=": 10,
  "in": 10,
  "instanceof": 10,
  "==": 9,
  "!=": 9,
  "===": 9,
  "!==": 9,
  "&": 8,
  "^": 7,
  "|": 6,
  "&&": 5,
  "||": 4
};

var operatorAssoc = {
  "*": "left",
  "/": "left",
  "%": "left",
  "+": "left",
  "-": "left",
  ">>": "left",
  "<<": "left",
  ">>>": "left",
  "<": "left",
  "<=": "left",
  ">": "left",
  ">=": "left",
  "in": "left",
  "instanceof": "left",
  "==": "left",
  "!=": "left",
  "===": "left",
  "!==": "left",
  "&": "left",
  "^": "left",
  "|": "left",
  "&&": "left",
  "||": "left"
};

function operatorLt(left, right, assoc) {
  if (assoc === "left") {
    return left < right;
  } else {
    return left <= right;
  }
}

function getOperatorPrec(op) {
  return binaryOperatorPrecedence[op];
}
function getOperatorAssoc(op) {
  return operatorAssoc[op];
}

function isUnaryOperator(op) {
  return (op.isPunctuator() || op.isIdentifier() || op.isKeyword()) && unaryOperators.hasOwnProperty(op.val());
}

function isOperator(op) {
  if (op.isPunctuator() || op.isIdentifier() || op.isKeyword()) {
    return binaryOperatorPrecedence.hasOwnProperty(op) || unaryOperators.hasOwnProperty(op.val());
  }
  return false;
}
//# sourceMappingURL=operators.js.map
