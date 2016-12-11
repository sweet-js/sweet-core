import TermSpec from './term-spec';
import Term from './terms';
import { List } from 'immutable';

function transform(reducer, term) {
  if (term == null) {
    return term;
  } else if (List.isList(term)) {
    return term.map(t => transform(reducer, t));
  } else if (term instanceof Term) {
    let state = new Term(term.type, {});
    TermSpec.spec[term.type].fields.forEach(field => {
      let v = transform(reducer, term[field]);
      state[field] = v == null ? null : v;
    });
    if (typeof reducer[`reduce${term.type}`] !== 'function') {
      throw new Error('Reducer failed to implemented handler for ${term.type}');
    }
    return reducer[`reduce${term.type}`](term, state);
  } else {
    return term;
  }
}

export default function reduce(reducer, term) {
  return transform(reducer, term);
}
