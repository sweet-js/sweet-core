"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processTemplate = processTemplate;
exports.replaceTemplate = replaceTemplate;

var _immutable = require("immutable");

var _ramdaFantasy = require("ramda-fantasy");

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _errors = require("./errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isDolar_591 = function isDolar_591(s) {
  return s && s instanceof _syntax2.default && s.isIdentifier() && s.val() === "$";
};var isDelimiter_592 = function isDelimiter_592(s) {
  return s && typeof s.isDelimiter === "function" && s.isDelimiter();
};var isBraces_593 = function isBraces_593(s) {
  return s && typeof s.isBraces === "function" && s.isBraces();
};var isParens_594 = function isParens_594(s) {
  return s && typeof s.isParens === "function" && s.isParens();
};var isBrackets_595 = function isBrackets_595(s) {
  return s && typeof s.isBrackets === "function" && s.isBrackets();
};var insertIntoDelimiter_596 = _ramda2.default.cond([[isBraces_593, function (s, r) {
  return _syntax2.default.fromBraces(r, s);
}], [isParens_594, function (s, r) {
  return _syntax2.default.fromParens(r, s);
}], [isBrackets_595, function (s, r) {
  return _syntax2.default.fromBrackets(r, s);
}]]);var process_597 = function process_597(acc, s) {
  if (isBraces_593(s) && isDolar_591(acc.template.last())) {
    return { template: acc.template.push(_syntax2.default.fromBraces(_immutable.List.of(_syntax2.default.fromNumber(acc.interp.size)), s)), interp: acc.interp.push(s.inner()) };
  } else if (isDelimiter_592(s)) {
    var innerResult = processTemplate(s.inner(), acc.interp);return { template: acc.template.push(insertIntoDelimiter_596(s, innerResult.template)), interp: innerResult.interp };
  } else {
    return { template: acc.template.push(s), interp: acc.interp };
  }
};var replace_598 = function replace_598(acc, s) {
  if (isBraces_593(s) && isDolar_591(acc.template.last())) {
    var index = s.inner().first().val();(0, _errors.assert)(acc.rep.size > index, "unknown replacement value");return { template: acc.template.pop().concat(acc.rep.get(index)), rep: acc.rep };
  } else if (isDelimiter_592(s)) {
    var innerResult = replaceTemplate(s.inner(), acc.rep);return { template: acc.template.push(insertIntoDelimiter_596(s, innerResult)), rep: acc.rep };
  } else {
    return { template: acc.template.push(s), rep: acc.rep };
  }
};function processTemplate(temp_599) {
  var interp_600 = arguments.length <= 1 || arguments[1] === undefined ? (0, _immutable.List)() : arguments[1];
  return temp_599.reduce(process_597, { template: (0, _immutable.List)(), interp: interp_600 });
}function replaceTemplate(temp_601, rep_602) {
  return temp_601.reduce(replace_598, { template: (0, _immutable.List)(), rep: rep_602 }).template;
}
//# sourceMappingURL=template-processor.js.map
