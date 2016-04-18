import Term from "./terms";
import { gensym } from "./symbol";
import { VarBindingTransform } from "./transforms";
import {assert} from './errors';
import { ALL_PHASES } from './syntax';

export default class ScopeApplyingReducer {
  constructor(scope, context) {
    this.context = context;
    this.scope = scope;
  }

  transform(term) {
    let field = "transform" + term.type;
    if (typeof this[field] === 'function') {
      return this[field](term);
    }
    assert(false, "transform not implemented yet for: " + term.type);
  }

  transformFormalParameters(term) {
    let rest = term.rest == null ? null : this.transform(term.rest);
    return new Term('FormalParameters', {
      items: term.items.map(it => this.transform(it)),
      rest
    });
  }


  transformBindingWithDefault(term) {
    return new Term('BindingWithDefault', {
      binding: this.transform(term.binding),
      init: term.init
    });
  }

  transformObjectBinding(term) {
    // TODO: much more complicated logic here
    return term;
    // return new Term('ObjectBinding', {
    //   properties: term.properties.map(prop => this.transform(prop))
    // });
  }

  transformBindingPropertyIdentifier(term) {
    return new Term('BindingPropertyIdentifier', {
      binding: this.transform(term.binding),
      init: term.init
    });
  }

  transformBindingPropertyProperty(term) {
    return new Term('BindingPropertyProperty', {
      name: term.name,
      binding: this.transform(term.binding)
    });
  }

  transformArrayBinding(term) {
    return new Term('ArrayBinding', {
      elements: term.elements.map(el => this.transform(el)),
      restElement: term.restElement == null ? null : this.transform(term.restElement)
    });
  }

  transformBindingIdentifier(term) {
    let name = term.name.addScope(this.scope, this.context.bindings, ALL_PHASES);
    let newBinding = gensym(name.val());

    this.context.env.set(newBinding.toString(), new VarBindingTransform(name));
    this.context.bindings.add(name, {
      binding: newBinding,
      phase: this.context.phase,
      skipDup: true
    });

    return new Term("BindingIdentifier", { name });
  }
}
