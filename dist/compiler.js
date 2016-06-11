"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require("immutable");

var _termExpander = require("./term-expander.js");

var _termExpander2 = _interopRequireDefault(_termExpander);

var _tokenExpander = require("./token-expander");

var _tokenExpander2 = _interopRequireDefault(_tokenExpander);

var _scope = require("./scope");

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Compiler {
  constructor(phase_33, env_34, store_35, context_36) {
    this.phase = phase_33;
    this.env = env_34;
    this.store = store_35;
    this.context = context_36;
  }
  compile(stxl_37) {
    let tokenExpander_38 = new _tokenExpander2.default(_.merge(this.context, { phase: this.phase, env: this.env, store: this.store }));
    let termExpander_39 = new _termExpander2.default(_.merge(this.context, { phase: this.phase, env: this.env, store: this.store }));
    return _.pipe(_.bind(tokenExpander_38.expand, tokenExpander_38), _.map(t_40 => termExpander_39.expand(t_40)))(stxl_37);
  }
}
exports.default = Compiler;