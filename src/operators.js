var operatorPrecedence = {
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
  "||": 4,
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
  "||": "left",
};

export function operatorLt(left, right, assoc) {
  if (assoc === "left") {
    return left < right;
  } else {
    return left <= right;
  }
}

export function getOperatorPrec(op) {
  return operatorPrecedence[op];
}
export function getOperatorAssoc(op) {
  return operatorAssoc[op];
}

export function isOperator(op) {
  if (op.isPunctuator() || op.isIdentifier() || op.isKeyword()) {
    return operatorPrecedence.hasOwnProperty(op);
  }
  return false;
}
