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

const isDolar_877 = s_886 => s_886 && s_886 instanceof _syntax2.default && s_886.match("identifier") && s_886.val() === "$";
const isDelimiter_878 = s_887 => s_887 && typeof s_887.match === "function" && s_887.match("delimiter");
const isBraces_879 = s_888 => s_888 && typeof s_888.match === "function" && s_888.match("braces");
const isParens_880 = s_889 => s_889 && typeof s_889.match === "function" && s_889.match("parens");
const isBrackets_881 = s_890 => s_890 && typeof s_890.match === "function" && s_890.match("brackets");
const insertIntoDelimiter_882 = _ramda2.default.cond([[isBraces_879, (s_891, r_892) => _syntax2.default.from("braces", r_892, s_891)], [isParens_880, (s_893, r_894) => _syntax2.default.from("parens", r_894, s_893)], [isBrackets_881, (s_895, r_896) => _syntax2.default.from("brackets", r_896, s_895)]]);
const process_883 = (acc_897, s_898) => {
  if (isBraces_879(s_898) && isDolar_877(acc_897.template.last())) {
    return { template: acc_897.template.push(_syntax2.default.from("braces", _immutable.List.of(_syntax2.default.from("number", acc_897.interp.size)), s_898)), interp: acc_897.interp.push(s_898.inner()) };
  } else if (isDelimiter_878(s_898)) {
    let innerResult = processTemplate(s_898.inner(), acc_897.interp);
    return { template: acc_897.template.push(insertIntoDelimiter_882(s_898, innerResult.template)), interp: innerResult.interp };
  } else {
    return { template: acc_897.template.push(s_898), interp: acc_897.interp };
  }
};
function cloneLineNumber_884(to_899, from_900) {
  if (from_900 && to_899 && typeof to_899.setLineNumber === "function") {
    return to_899.setLineNumber(from_900.lineNumber());
  }
  return to_899;
}
const replace_885 = (acc_901, s_902) => {
  let last_903 = acc_901.template.get(-1);
  let beforeLast_904 = acc_901.template.get(-2);
  if (isBraces_879(s_902) && isDolar_877(last_903)) {
    let index = s_902.inner().first().val();
    (0, _errors.assert)(acc_901.rep.size > index, "unknown replacement value");
    let replacement = cloneLineNumber_884(acc_901.rep.get(index), beforeLast_904);
    return { template: acc_901.template.pop().concat(replacement), rep: acc_901.rep };
  } else if (isDelimiter_878(s_902)) {
    let innerResult = replaceTemplate(s_902.inner(), acc_901.rep);
    return { template: acc_901.template.push(insertIntoDelimiter_882(s_902, innerResult)), rep: acc_901.rep };
  } else {
    return { template: acc_901.template.push(s_902), rep: acc_901.rep };
  }
};
function processTemplate(temp_905) {
  let interp_906 = arguments.length <= 1 || arguments[1] === undefined ? (0, _immutable.List)() : arguments[1];

  return temp_905.reduce(process_883, { template: (0, _immutable.List)(), interp: interp_906 });
}
function replaceTemplate(temp_907, rep_908) {
  return temp_907.reduce(replace_885, { template: (0, _immutable.List)(), rep: rep_908 }).template;
}