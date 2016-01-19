import Term from "./terms";
import { CloneReducer } from "shift-reducer";
import { gensym } from "./symbol";
import { VarBindingTransform } from "./transforms";

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

    this.context.env.set(newBinding.toString(), new VarBindingTransform(name));
    this.context.bindings.add(name, {
      binding: newBinding,
      phase: this.phase,
      skipDup: true
    });

    return new Term("BindingIdentifier", {
      name: name
    });
  }
}
