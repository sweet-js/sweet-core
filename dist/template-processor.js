'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processTemplate = processTemplate;
exports.replaceTemplate = replaceTemplate;

var _immutable = require('immutable');

var _ramdaFantasy = require('ramda-fantasy');

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _syntax = require('./syntax');

var _syntax2 = _interopRequireDefault(_syntax);

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
Given a syntax list like:

  [foo, bar, $, { 42, +, 24 }, baz]

convert it to:

  [foo, bar, $, { 0 }, baz]

and return another list with the interpolated values at the corresponding
positions.

Requires either lookahead/lookbehind of one (to see the $).
*/

var isDolar = function isDolar(s) {
  return s && s instanceof _syntax2.default && s.isIdentifier() && s.val() === '$';
};
var isDelimiter = function isDelimiter(s) {
  return s && typeof s.isDelimiter === 'function' && s.isDelimiter();
};
var isBraces = function isBraces(s) {
  return s && typeof s.isBraces === 'function' && s.isBraces();
};
var isParens = function isParens(s) {
  return s && typeof s.isParens === 'function' && s.isParens();
};
var isBrackets = function isBrackets(s) {
  return s && typeof s.isBrackets === 'function' && s.isBrackets();
};

var insertIntoDelimiter = _ramda2.default.cond([[isBraces, function (s, r) {
  return _syntax2.default.fromBraces(r, s);
}], [isParens, function (s, r) {
  return _syntax2.default.fromParens(r, s);
}], [isBrackets, function (s, r) {
  return _syntax2.default.fromBrackets(r, s);
}]]);

var process = function process(acc, s) {
  if (isBraces(s) && isDolar(acc.template.last())) {
    return {
      template: acc.template.push(_syntax2.default.fromBraces(_immutable.List.of(_syntax2.default.fromNumber(acc.interp.size)), s)),
      interp: acc.interp.push(s.inner())
    };
  } else if (isDelimiter(s)) {
    var innerResult = processTemplate(s.inner(), acc.interp);
    return {
      template: acc.template.push(insertIntoDelimiter(s, innerResult.template)),
      interp: innerResult.interp
    };
  } else {
    return {
      template: acc.template.push(s),
      interp: acc.interp
    };
  }
};

var replace = function replace(acc, s) {
  if (isBraces(s) && isDolar(acc.template.last())) {
    var index = s.inner().first().val();
    (0, _errors.assert)(acc.rep.size > index, "unknown replacement value");
    return {
      template: acc.template.pop().concat(acc.rep.get(index)),
      rep: acc.rep
    };
  } else if (isDelimiter(s)) {
    var innerResult = replaceTemplate(s.inner(), acc.rep);
    return {
      template: acc.template.push(insertIntoDelimiter(s, innerResult)),
      rep: acc.rep
    };
  } else {
    return {
      template: acc.template.push(s),
      rep: acc.rep
    };
  }
};

function processTemplate(temp) {
  var interp = arguments.length <= 1 || arguments[1] === undefined ? (0, _immutable.List)() : arguments[1];

  return temp.reduce(process, { template: (0, _immutable.List)(), interp: interp });
}

function replaceTemplate(temp, rep) {
  return temp.reduce(replace, { template: (0, _immutable.List)(), rep: rep }).template;
}
//# sourceMappingURL=template-processor.js.map
