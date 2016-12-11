import Term, * as S from 'sweet-spec';
import * as T from './terms';
import * as _ from 'ramda';


const isNotCompiletimeStatement = _.complement(T.isCompiletimeStatement);

export default class RuntimeReducer extends Term.CloneReducer {
  reduceModule(term, state) {
    let items = state.items.filter(isNotCompiletimeStatement);
    return new S.Module({
      items,
      directives: term.directives
    });
  }

  reduceFunctionBody(term, state) {
    let statements = state.statements.filter(isNotCompiletimeStatement);
    return new S.FunctionBody({
      statements, directives: state.directives
    });
  }

  reduceBlock(term, state) {
    let statements = state.statements.filter(isNotCompiletimeStatement);
    return new S.Block({
      statements
    });
  }
}
