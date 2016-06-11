"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _symbol = require("./symbol");

var _transforms = require("./transforms");

var _errors = require("./errors");

var _syntax = require("./syntax");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ScopeApplyingReducer {
  constructor(scope_0, context_1) {
    this.context = context_1;
    this.scope = scope_0;
  }
  transform(term_2) {
    let field_3 = "transform" + term_2.type;
    if (typeof this[field_3] === "function") {
      return this[field_3](term_2);
    }
    (0, _errors.assert)(false, "transform not implemented yet for: " + term_2.type);
  }
  transformFormalParameters(term_4) {
    let rest_5 = term_4.rest == null ? null : this.transform(term_4.rest);
    return new _terms2.default("FormalParameters", { items: term_4.items.map(it_6 => this.transform(it_6)), rest: rest_5 });
  }
  transformBindingWithDefault(term_7) {
    return new _terms2.default("BindingWithDefault", { binding: this.transform(term_7.binding), init: term_7.init });
  }
  transformObjectBinding(term_8) {
    return term_8;
  }
  transformBindingPropertyIdentifier(term_9) {
    return new _terms2.default("BindingPropertyIdentifier", { binding: this.transform(term_9.binding), init: term_9.init });
  }
  transformBindingPropertyProperty(term_10) {
    return new _terms2.default("BindingPropertyProperty", { name: term_10.name, binding: this.transform(term_10.binding) });
  }
  transformArrayBinding(term_11) {
    return new _terms2.default("ArrayBinding", { elements: term_11.elements.map(el_12 => this.transform(el_12)), restElement: term_11.restElement == null ? null : this.transform(term_11.restElement) });
  }
  transformBindingIdentifier(term_13) {
    let name_14 = term_13.name.addScope(this.scope, this.context.bindings, _syntax.ALL_PHASES);
    let newBinding_15 = (0, _symbol.gensym)(name_14.val());
    this.context.env.set(newBinding_15.toString(), new _transforms.VarBindingTransform(name_14));
    this.context.bindings.add(name_14, { binding: newBinding_15, phase: this.context.phase, skipDup: true });
    return new _terms2.default("BindingIdentifier", { name: name_14 });
  }
}
exports.default = ScopeApplyingReducer;