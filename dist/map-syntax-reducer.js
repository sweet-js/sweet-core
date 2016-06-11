"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _shiftReducer = require("shift-reducer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MapSyntaxReducer extends _shiftReducer.CloneReducer {
  constructor(fn_406) {
    super();
    this.fn = fn_406;
  }
  reduceBindingIdentifier(node_407, state_408) {
    let name_409 = this.fn(node_407.name);
    return new _terms2.default("BindingIdentifier", { name: name_409 });
  }
  reduceIdentifierExpression(node_410, state_411) {
    let name_412 = this.fn(node_410.name);
    return new _terms2.default("IdentifierExpression", { name: name_412 });
  }
}
exports.default = MapSyntaxReducer;