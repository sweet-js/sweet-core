import { List } from 'immutable';

let EMPTY;
export default class ListCollector {
  constructor(x) { this.value = x; }
  static empty() { return EMPTY; }
  concat(a) { return new ListCollector(this.value.concat(a.value)); }
  extract() { return this.value; }
}
EMPTY = new ListCollector(List());
