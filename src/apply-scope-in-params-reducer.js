import Term from "./terms";
import { CloneReducer } from "shift-reducer";
import { gensym } from "./symbol";
import { FunctionArgumentTransform } from "./transforms";

export default class ScopeApplyingReducer extends CloneReducer {
  constructor(scope, context, phase = 0) {
    super();
    this.context = context;
    this.scope = scope;
    this.phase = phase;
  }

  reduceBindingIdentifier(node, state) {
    let name = node.name.addScope(this.scope, this.context.bindings);
    let newBinding = gensym(name.val());

    this.context.env.set(newBinding.toString(), new FunctionArgumentTransform(name));
    this.context.bindings.add(name, newBinding, this.phase);

    return new Term("BindingIdentifier", {
      name: name
    });
  }
}
