'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.operatorLt = operatorLt;
exports.getOperatorPrec = getOperatorPrec;
exports.getOperatorAssoc = getOperatorAssoc;
exports.isUnaryOperator = isUnaryOperator;
exports.isOperator = isOperator;
const unaryOperators = {
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
const binaryOperatorPrecedence = {
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
  return (op.match("punctuator") || op.match("identifier") || op.match("keyword")) && unaryOperators.hasOwnProperty(op.val());
}

function isOperator(op) {
  if (op.match("punctuator") || op.match("identifier") || op.match("keyword")) {
    return binaryOperatorPrecedence.hasOwnProperty(op) || unaryOperators.hasOwnProperty(op.val());
  }
  return false;
}
//# sourceMappingURL=data:application/json;base64,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eEMsS0FBK0MsZUFBZSxjQUFmLENBQThCLEdBQUcsR0FBSCxFQUE5QixDQUF0RDtBQUNEO0FBQ0QsU0FBTyxLQUFQO0FBQ0QiLCJmaWxlIjoib3BlcmF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdW5hcnlPcGVyYXRvcnMgPSB7XG4gICcrJzogdHJ1ZSxcbiAgJy0nOiB0cnVlLFxuICAnISc6IHRydWUsXG4gICd+JzogdHJ1ZSxcbiAgJysrJzogdHJ1ZSxcbiAgJy0tJzogdHJ1ZSxcbiAgJ3R5cGVvZic6IHRydWUsXG4gICd2b2lkJzogdHJ1ZSxcbiAgJ2RlbGV0ZSc6IHRydWUsXG59O1xuY29uc3QgYmluYXJ5T3BlcmF0b3JQcmVjZWRlbmNlID0ge1xuICBcIipcIjogMTMsXG4gIFwiL1wiOiAxMyxcbiAgXCIlXCI6IDEzLFxuICBcIitcIjogMTIsXG4gIFwiLVwiOiAxMixcbiAgXCI+PlwiOiAxMSxcbiAgXCI8PFwiOiAxMSxcbiAgXCI+Pj5cIjogMTEsXG4gIFwiPFwiOiAxMCxcbiAgXCI8PVwiOiAxMCxcbiAgXCI+XCI6IDEwLFxuICBcIj49XCI6IDEwLFxuICBcImluXCI6IDEwLFxuICBcImluc3RhbmNlb2ZcIjogMTAsXG4gIFwiPT1cIjogOSxcbiAgXCIhPVwiOiA5LFxuICBcIj09PVwiOiA5LFxuICBcIiE9PVwiOiA5LFxuICBcIiZcIjogOCxcbiAgXCJeXCI6IDcsXG4gIFwifFwiOiA2LFxuICBcIiYmXCI6IDUsXG4gIFwifHxcIjogNCxcbn07XG5cbnZhciBvcGVyYXRvckFzc29jID0ge1xuICBcIipcIjogXCJsZWZ0XCIsXG4gIFwiL1wiOiBcImxlZnRcIixcbiAgXCIlXCI6IFwibGVmdFwiLFxuICBcIitcIjogXCJsZWZ0XCIsXG4gIFwiLVwiOiBcImxlZnRcIixcbiAgXCI+PlwiOiBcImxlZnRcIixcbiAgXCI8PFwiOiBcImxlZnRcIixcbiAgXCI+Pj5cIjogXCJsZWZ0XCIsXG4gIFwiPFwiOiBcImxlZnRcIixcbiAgXCI8PVwiOiBcImxlZnRcIixcbiAgXCI+XCI6IFwibGVmdFwiLFxuICBcIj49XCI6IFwibGVmdFwiLFxuICBcImluXCI6IFwibGVmdFwiLFxuICBcImluc3RhbmNlb2ZcIjogXCJsZWZ0XCIsXG4gIFwiPT1cIjogXCJsZWZ0XCIsXG4gIFwiIT1cIjogXCJsZWZ0XCIsXG4gIFwiPT09XCI6IFwibGVmdFwiLFxuICBcIiE9PVwiOiBcImxlZnRcIixcbiAgXCImXCI6IFwibGVmdFwiLFxuICBcIl5cIjogXCJsZWZ0XCIsXG4gIFwifFwiOiBcImxlZnRcIixcbiAgXCImJlwiOiBcImxlZnRcIixcbiAgXCJ8fFwiOiBcImxlZnRcIixcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBvcGVyYXRvckx0KGxlZnQsIHJpZ2h0LCBhc3NvYykge1xuICBpZiAoYXNzb2MgPT09IFwibGVmdFwiKSB7XG4gICAgcmV0dXJuIGxlZnQgPCByaWdodDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGVmdCA8PSByaWdodDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3BlcmF0b3JQcmVjKG9wKSB7XG4gIHJldHVybiBiaW5hcnlPcGVyYXRvclByZWNlZGVuY2Vbb3BdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldE9wZXJhdG9yQXNzb2Mob3ApIHtcbiAgcmV0dXJuIG9wZXJhdG9yQXNzb2Nbb3BdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNVbmFyeU9wZXJhdG9yKG9wKSB7XG4gIHJldHVybiAob3AubWF0Y2goXCJwdW5jdHVhdG9yXCIpIHx8IG9wLm1hdGNoKFwiaWRlbnRpZmllclwiKSB8fCBvcC5tYXRjaChcImtleXdvcmRcIikpICYmXG4gICAgICAgIHVuYXJ5T3BlcmF0b3JzLmhhc093blByb3BlcnR5KG9wLnZhbCgpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzT3BlcmF0b3Iob3ApIHtcbiAgaWYgKG9wLm1hdGNoKFwicHVuY3R1YXRvclwiKSB8fCBvcC5tYXRjaChcImlkZW50aWZpZXJcIikgfHwgb3AubWF0Y2goXCJrZXl3b3JkXCIpKSB7XG4gICAgcmV0dXJuIGJpbmFyeU9wZXJhdG9yUHJlY2VkZW5jZS5oYXNPd25Qcm9wZXJ0eShvcCkgfHwgdW5hcnlPcGVyYXRvcnMuaGFzT3duUHJvcGVydHkob3AudmFsKCkpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbiJdfQ==