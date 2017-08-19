const unaryOperators = {
  '+': true,
  '-': true,
  '!': true,
  '~': true,
  '++': true,
  '--': true,
  typeof: true,
  void: true,
  delete: true,
  await: true,
};
const binaryOperatorPrecedence = {
  '*': 14,
  '/': 14,
  '%': 14,
  '+': 13,
  '-': 13,
  '>>': 12,
  '<<': 12,
  '>>>': 12,
  '<': 11,
  '<=': 11,
  '>': 11,
  '>=': 11,
  in: 11,
  instanceof: 11,
  '==': 10,
  '!=': 10,
  '===': 10,
  '!==': 10,
  '&': 9,
  '^': 8,
  '|': 7,
  '&&': 6,
  '||': 5,
};

var operatorAssoc = {
  '*': 'left',
  '/': 'left',
  '%': 'left',
  '+': 'left',
  '-': 'left',
  '>>': 'left',
  '<<': 'left',
  '>>>': 'left',
  '<': 'left',
  '<=': 'left',
  '>': 'left',
  '>=': 'left',
  in: 'left',
  instanceof: 'left',
  '==': 'left',
  '!=': 'left',
  '===': 'left',
  '!==': 'left',
  '&': 'left',
  '^': 'left',
  '|': 'left',
  '&&': 'left',
  '||': 'left',
};

export function operatorLt(left, right, assoc) {
  if (assoc === 'left') {
    return left < right;
  } else {
    return left <= right;
  }
}

export function getOperatorPrec(op) {
  return binaryOperatorPrecedence[op];
}
export function getOperatorAssoc(op) {
  return operatorAssoc[op];
}

export function isUnaryOperator(op) {
  return (
    (op.match('punctuator') || op.match('identifier') || op.match('keyword')) &&
    unaryOperators.hasOwnProperty(op.val())
  );
}

export function isOperator(op) {
  if (op.match('punctuator') || op.match('identifier') || op.match('keyword')) {
    return (
      binaryOperatorPrecedence.hasOwnProperty(op) ||
      unaryOperators.hasOwnProperty(op.val())
    );
  }
  return false;
}
