import { List } from "immutable";
import TermExpander from "./term-expander.js";
import TokenExpander from './token-expander';
import { Scope, freshScope } from "./scope";
import * as _ from 'ramda';


export default class Expander {
  constructor(context) {
    this.context = context;
  }

  expand(stxl) {
    let scope = freshScope("top");
    this.context.currentScope = scope;

    let tokenExpander = new TokenExpander(this.context);
    let termExpander = new TermExpander(this.context);

    return _.pipe(
      _.map(s => s.addScope(scope, this.context.bindings)),
      _.bind(tokenExpander.expand, tokenExpander),
      _.map(t => termExpander.expand(t))
    )(stxl);
  }
}
