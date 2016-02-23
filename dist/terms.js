"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isExport = exports.isImport = exports.isBindingPropertyProperty = exports.isBindingPropertyIdentifier = exports.isObjectBinding = exports.isArrayBinding = exports.isBindingIdentifier = exports.isFunctionWithName = exports.isFunctionTerm = exports.isFunctionExpression = exports.isFunctionDeclaration = exports.isSyntaxrecDeclaration = exports.isSyntaxDeclaration = exports.isVariableDeclarationStatement = exports.isVariableDeclaration = exports.isEOF = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require("immutable");

var _errors = require("./errors");

var _utils = require("./utils");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _ramda = require("ramda");

var R = _interopRequireWildcard(_ramda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(type, props) {
    _classCallCheck(this, _class);

    this.type = type;
    this.loc = null;
    // this._fields = Object.keys(props);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(props)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var prop = _step.value;

        this[prop] = props[prop];
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  _createClass(_class, [{
    key: "addScope",
    value: function addScope(scope, bindings, options) {
      // todo: deal with hygiene here
      return this;
    }
  }]);

  return _class;
}();

exports.default = _class;
var isEOF = exports.isEOF = R.whereEq({ type: 'EOF' });
var isVariableDeclaration = exports.isVariableDeclaration = R.whereEq({ type: 'VariableDeclaration' });
var isVariableDeclarationStatement = exports.isVariableDeclarationStatement = R.whereEq({ type: 'VariableDeclarationStatement' });
var isSyntaxDeclaration = exports.isSyntaxDeclaration = R.both(isVariableDeclaration, R.whereEq({ kind: 'syntax' }));
var isSyntaxrecDeclaration = exports.isSyntaxrecDeclaration = R.both(isVariableDeclaration, R.whereEq({ kind: 'syntaxrec' }));
var isFunctionDeclaration = exports.isFunctionDeclaration = R.whereEq({ type: 'FunctionDeclaration' });
var isFunctionExpression = exports.isFunctionExpression = R.whereEq({ type: 'FunctionExpression' });
var isFunctionTerm = exports.isFunctionTerm = R.either(isFunctionDeclaration, isFunctionExpression);
var isFunctionWithName = exports.isFunctionWithName = R.and(isFunctionTerm, R.complement(R.where({ name: R.isNil })));
var isBindingIdentifier = exports.isBindingIdentifier = R.where({ name: R.is(_syntax2.default) });
var isArrayBinding = exports.isArrayBinding = R.whereEq({ type: 'ArrayBinding' });
var isObjectBinding = exports.isObjectBinding = R.whereEq({ type: 'ObjectBinding' });
var isBindingPropertyIdentifier = exports.isBindingPropertyIdentifier = R.whereEq({ type: 'BindingPropertyIdentifier' });
var isBindingPropertyProperty = exports.isBindingPropertyProperty = R.whereEq({ type: 'BindingPropertyProperty' });
var isImport = exports.isImport = R.whereEq({ type: 'Import' });
var isExport = exports.isExport = R.whereEq({ type: 'Export' });
//# sourceMappingURL=terms.js.map
