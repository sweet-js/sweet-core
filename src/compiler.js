import { List } from "immutable";
import TermExpander from "./term-expander.js";
import TokenExpander from './token-expander';
import { Scope, freshScope } from "./scope";
import * as _ from 'ramda';


export default class Compiler {
  constructor(phase, env, store, context) {
    this.phase = phase;
    this.env = env;
    this.store = store;
    this.context = context;
  }

  compile(stxl) {
    let tokenExpander = new TokenExpander(_.merge(this.context, {
      phase: this.phase,
      env: this.env,
      store: this.store
    }));
    let termExpander = new TermExpander(_.merge(this.context, {
      phase: this.phase,
      env: this.env,
      store: this.store
    }));

    return _.pipe(
      _.bind(tokenExpander.expand, tokenExpander),
      _.map(t => termExpander.expand(t))
    )(stxl);
  }
}
