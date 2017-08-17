import * as S from 'sweet-spec';
import * as _ from 'ramda';
import { List } from 'immutable';
import Syntax from './syntax';
import codegen, { FormattedCodeGen } from 'shift-codegen';
import SweetToShiftReducer from './sweet-to-shift-reducer';
import TermExpander from './term-expander';
import Env from './env';

import { replaceTemplate } from './template-processor';

export function expandCompiletime(term, context) {
  // each compiletime value needs to be expanded with a fresh
  // environment and in the next higher phase
  let syntaxExpander = new TermExpander(
    _.merge(context, {
      phase: context.phase + 1,
      env: new Env(),
      store: context.store,
    }),
  );

  return syntaxExpander.expand(term);
}

export function sanitizeReplacementValues(values) {
  if (Array.isArray(values)) {
    return sanitizeReplacementValues(List(values));
  } else if (List.isList(values)) {
    return values.map(sanitizeReplacementValues);
  } else if (values == null) {
    throw new Error(
      'replacement values for syntax template must not be null or undefined',
    );
  } else if (typeof values.next === 'function') {
    return sanitizeReplacementValues(List(values));
  }
  return values;
}

// (Expression, Context) -> [function]
export function evalCompiletimeValue(expr: S.Expression, context: any) {
  let sandbox = {
    syntaxTemplate: function(ident, ...values) {
      return replaceTemplate(
        context.templateMap.get(ident),
        sanitizeReplacementValues(values),
      );
    },
  };

  let sandboxKeys = List(Object.keys(sandbox));
  let sandboxVals = sandboxKeys.map(k => sandbox[k]).toArray();

  let parsed = new S.Module({
    directives: List(),
    items: List.of(
      new S.ExpressionStatement({
        expression: new S.FunctionExpression({
          isAsync: false,
          isGenerator: false,
          name: null,
          params: new S.FormalParameters({
            items: sandboxKeys.map(param => {
              return new S.BindingIdentifier({
                name: Syntax.from('identifier', param),
              });
            }),
            rest: null,
          }),
          body: new S.FunctionBody({
            directives: List.of(
              new S.Directive({
                rawValue: 'use strict',
              }),
            ),
            statements: List.of(
              new S.ReturnStatement({
                expression: expr,
              }),
            ),
          }),
        }),
      }),
    ),
  }).reduce(new SweetToShiftReducer(context.phase));

  let gen = codegen(parsed, new FormattedCodeGen());
  let result = context.transform(gen);

  let val = context.loader.eval(result.code, context.store);
  return val.apply(undefined, sandboxVals);
}
