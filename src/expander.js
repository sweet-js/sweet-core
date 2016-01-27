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
    let tokenExpander = new TokenExpander(this.context);
    let termExpander = new TermExpander(this.context);

    return _.pipe(
      _.bind(tokenExpander.expand, tokenExpander),
      _.map(t => termExpander.expand(t))
    )(stxl);
  }
}
