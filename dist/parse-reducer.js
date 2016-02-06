"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _shiftReducer = require("shift-reducer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ParseReducer = function (_CloneReducer) {
  _inherits(ParseReducer, _CloneReducer);

  function ParseReducer() {
    _classCallCheck(this, ParseReducer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ParseReducer).apply(this, arguments));
  }

  _createClass(ParseReducer, [{
    key: "reduceModule",
    value: function reduceModule(node, state) {
      return new _terms2.default("Module", {
        directives: state.directives.toArray(),
        items: state.items.toArray()
      });
    }
  }, {
    key: "reduceImport",
    value: function reduceImport(node, state) {
      return new _terms2.default('Import', {
        defaultBinding: state.defaultBinding,
        namedImports: state.namedImports.toArray(),
        moduleSpecifier: state.moduleSpecifier
      });
    }
  }, {
    key: "reduceExport",
    value: function reduceExport(node, state) {
      return new _terms2.default('Export', {
        declaration: state.declaration
      });
    }
  }, {
    key: "reduceImportSpecifier",
    value: function reduceImportSpecifier(node, state) {
      return new _terms2.default('ImportSpecifier', {
        name: state.name,
        binding: state.binding
      });
    }
  }, {
    key: "reduceIdentifierExpression",
    value: function reduceIdentifierExpression(node, state) {
      return new _terms2.default("IdentifierExpression", {
        name: node.name.resolve()
      });
    }
  }, {
    key: "reduceLiteralNumericExpression",
    value: function reduceLiteralNumericExpression(node, state) {
      return new _terms2.default("LiteralNumericExpression", {
        value: node.value.val()
      });
    }
  }, {
    key: "reduceLiteralBooleanExpression",
    value: function reduceLiteralBooleanExpression(node, state) {
      return new _terms2.default("LiteralBooleanExpression", {
        value: node.value.val() === 'true'
      });
    }
  }, {
    key: "reduceLiteralStringExpression",
    value: function reduceLiteralStringExpression(node, state) {
      return new _terms2.default("LiteralStringExpression", {
        value: node.value.token.str
      });
    }
  }, {
    key: "reduceCallExpression",
    value: function reduceCallExpression(node, state) {
      return new _terms2.default("CallExpression", {
        callee: state.callee,
        arguments: state.arguments.toArray()
      });
    }
  }, {
    key: "reduceFunctionBody",
    value: function reduceFunctionBody(node, state) {
      return new _terms2.default("FunctionBody", {
        directives: state.directives.toArray(),
        statements: state.statements.toArray()
      });
    }
  }, {
    key: "reduceFormalParameters",
    value: function reduceFormalParameters(node, state) {
      return new _terms2.default("FormalParameters", {
        items: state.items.toArray(),
        rest: state.rest
      });
    }
  }, {
    key: "reduceBindingIdentifier",
    value: function reduceBindingIdentifier(node, state) {
      return new _terms2.default("BindingIdentifier", {
        name: node.name.resolve()
      });
    }
  }, {
    key: "reduceBinaryExpression",
    value: function reduceBinaryExpression(node, state) {
      return new _terms2.default("BinaryExpression", {
        left: state.left,
        operator: node.operator.val(),
        right: state.right
      });
    }
  }, {
    key: "reduceObjectExpression",
    value: function reduceObjectExpression(node, state) {
      return new _terms2.default("ObjectExpression", {
        properties: state.properties.toArray()
      });
    }
  }, {
    key: "reduceVariableDeclaration",
    value: function reduceVariableDeclaration(node, state) {
      return new _terms2.default("VariableDeclaration", {
        kind: state.kind,
        declarators: state.declarators.toArray()
      });
    }
  }, {
    key: "reduceStaticPropertyName",
    value: function reduceStaticPropertyName(node, state) {
      return new _terms2.default("StaticPropertyName", {
        value: node.value.val()
      });
    }
  }, {
    key: "reduceArrayExpression",
    value: function reduceArrayExpression(node, state) {
      return new _terms2.default("ArrayExpression", {
        elements: state.elements.toArray()
      });
    }
  }, {
    key: "reduceStaticMemberExpression",
    value: function reduceStaticMemberExpression(node, state) {
      return new _terms2.default("StaticMemberExpression", {
        object: state.object,
        property: state.property.val()
      });
    }
  }, {
    key: "reduceClassDeclaration",
    value: function reduceClassDeclaration(node, state) {
      return new _terms2.default("ClassDeclaration", {
        name: state.name,
        super: state.super,
        elements: state.elements.toArray(),
        loc: null
      });
    }
  }]);

  return ParseReducer;
}(_shiftReducer.CloneReducer);

exports.default = ParseReducer;
//# sourceMappingURL=parse-reducer.js.map
