import * as _ from 'ramda';
import { List } from 'immutable';
import ParseReducer from './parse-reducer.js';
import reducer from "shift-reducer";
import { makeDeserializer } from './serializer';
import Syntax from "./syntax";
import codegen, { FormattedCodeGen } from 'shift-codegen';
import Term, { isVariableDeclaration, isImport, isExport } from "./terms";
import read from './reader/token-reader';

import { unwrap } from './macro-context';

import { replaceTemplate } from './template-processor';

import vm from "vm";

export function sanitizeReplacementValues(values) {
  if (Array.isArray(values)) {
    return sanitizeReplacementValues(List(values));
  } else if (List.isList(values)) {
    return values.map(sanitizeReplacementValues);
  } else if (values == null) {
    throw new Error("replacement values for syntax template must not be null or undefined");
  } else if (typeof values.next === 'function') {
    return sanitizeReplacementValues(List(values));
  }
  return unwrap(values);
}

export function evalRuntimeValues(terms, context) {
  let prepped = terms.reduce((acc, term) => {
    if (isExport(term)) {
      if (isVariableDeclaration(term.declaration)) {
        return acc.concat(new Term('VariableDeclarationStatement', {
          declaration: term.declaration
        })).concat(term.declaration.declarators.map(decl => {
          return new Term('ExpressionStatement', {
            expression: new Term('AssignmentExpression', {
              binding: new Term('StaticMemberExpression', {
                object: new Term('IdentifierExpression', {
                  name: Syntax.fromIdentifier('exports')
                }),
                property: decl.binding.name
              }),
              expression: new Term('IdentifierExpression', {
                name: decl.binding.name
              })
            })
          });
        }));
      }
    } else if (isImport(term)) {
      return acc;
    }
    return acc.concat(term);
  }, List());
  let parsed = reducer(new ParseReducer(context, false), new Term('Module', {
    directives: List(),
    items: prepped
  }).gen(false));

  let gen = codegen(parsed, new FormattedCodeGen);
  let result = context.transform(gen, {
    babelrc: true,
    filename: context.filename
  });

  let exportsObj = {};
  context.store.set('exports', exportsObj);

  vm.runInContext(result.code, context.store.getNodeContext());
  return exportsObj;
}

// (Expression, Context) -> [function]
export function evalCompiletimeValue(expr, context) {
  let deserializer = makeDeserializer(context.bindings);
  let sandbox = {
    syntaxQuote: function (strings, ...values) {
      let ctx = deserializer.read(_.last(values));
      return read(strings.join(''), ctx);
    },
    syntaxTemplate: function(str, ...values) {
      return replaceTemplate(deserializer.read(str), sanitizeReplacementValues(values));
    }
  };

  let sandboxKeys = List(Object.keys(sandbox));
  let sandboxVals = sandboxKeys.map(k => sandbox[k]).toArray();

  let parsed = reducer(new ParseReducer(context), new Term("Module", {
    directives: List(),
    items: List.of(new Term("ExpressionStatement", {
      expression: new Term("FunctionExpression", {
        isGenerator: false,
        name: null,
        params: new Term("FormalParameters", {
          items: sandboxKeys.map(param => {
            return new Term("BindingIdentifier", {
              name: Syntax.from("identifier", param)
            });
          }),
          rest: null
        }),
        body: new Term("FunctionBody", {
          directives: List.of(new Term('Directive', {
            rawValue: 'use strict'
          })),
          statements: List.of(new Term("ReturnStatement", {
            expression: expr
          }))
        })
      })
    }))
  }));

  let gen = codegen(parsed, new FormattedCodeGen);
  let result = context.transform(gen, {
    babelrc: true,
    filename: context.filename
  });

  let val = vm.runInContext(result.code, context.store.getNodeContext());
  return val.apply(undefined, sandboxVals);
}
