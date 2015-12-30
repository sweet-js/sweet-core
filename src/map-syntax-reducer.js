import Term from "./terms";
import { CloneReducer } from "shift-reducer";

export default class MapSyntaxReducer extends CloneReducer {
  constructor(fn) {
    super();
    this.fn = fn;
  }

  reduceBindingIdentifier(node, state) {
    let name = this.fn(node.name);

    return new Term("BindingIdentifier", {
      name: name
    });
  }

  reduceIdentifierExpression(node, state) {
    let name = this.fn(node.name);

    return new Term("IdentifierExpression", {
      name: name
    });
  }
}
