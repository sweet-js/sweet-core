"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CollectBindingSyntax = undefined;
exports.collectBindings = collectBindings;

var _symbol = require("./symbol");

var _transforms = require("./transforms");

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

var _errors = require("./errors");

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _immutable = require("immutable");

var _astDispatcher = require("./ast-dispatcher");

var _astDispatcher2 = _interopRequireDefault(_astDispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class CollectBindingSyntax extends _astDispatcher2.default {
  constructor() {
    super("collect", true);
    this.names = (0, _immutable.List)();
  }
  collect(term_322) {
    return this.dispatch(term_322);
  }
  collectBindingIdentifier(term_323) {
    return this.names.concat(term_323.name);
  }
  collectBindingPropertyIdentifier(term_324) {
    return this.collect(term_324.binding);
  }
  collectBindingPropertyProperty(term_325) {
    return this.collect(term_325.binding);
  }
  collectArrayBinding(term_326) {
    let restElement_327 = null;
    if (term_326.restElement != null) {
      restElement_327 = this.collect(term_326.restElement);
    }
    return this.names.concat(restElement_327).concat(term_326.elements.filter(el_328 => el_328 != null).flatMap(el_329 => this.collect(el_329)));
  }
  collectObjectBinding(term_330) {
    return (0, _immutable.List)();
  }
}
exports.CollectBindingSyntax = CollectBindingSyntax;
function collectBindings(term_331) {
  return new CollectBindingSyntax().collect(term_331);
}