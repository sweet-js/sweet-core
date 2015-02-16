"use strict";
var _ = require("underscore"),
    syn = require("../syntax"),
    assert = require("assert");
var syntaxFromToken = syn.syntaxFromToken,
    adjustLineContext = syn.adjustLineContext,
    fresh = syn.fresh;
var push = Array.prototype.push;
function inherit(parent, child, methods) {
  var P = function () {};
  P.prototype = parent.prototype;
  child.prototype = new P();
  child.prototype.constructor = child;
  _.extend(child.prototype, methods);
}
function TermTree() {}
TermTree.properties = [];
TermTree.create = function () {
  return new TermTree();
};
TermTree.prototype = {
  isTermTree: true,
  destruct: function (context, options) {
    assert(context, "must pass in the context to destruct");
    options = options || {};
    var self = this;
    if (options.stripCompileTerm && this.isCompileTimeTerm) {
      return [];
    }
    if (options.stripModuleTerm && this.isModuleTimeTerm) {
      return [];
    }
    return _.reduce(this.constructor.properties, function (acc, prop) {
      if (self[prop] && self[prop].isTermTree) {
        push.apply(acc, self[prop].destruct(context, options));
        return acc;
      } else if (self[prop] && self[prop].token && self[prop].token.inner) {
        var src = self[prop].token;
        var keys = Object.keys(src);
        var newtok = {};
        for (var i = 0, len = keys.length, key; i < len; i++) {
          key = keys[i];
          newtok[key] = src[key];
        }
        var clone = syntaxFromToken(newtok, self[prop]);
        clone.token.inner = _.reduce(clone.token.inner, function (acc$2, t) {
          if (t && t.isTermTree) {
            push.apply(acc$2, t.destruct(context, options));
            return acc$2;
          }
          acc$2.push(t);
          return acc$2;
        }, []);
        acc.push(clone);
        return acc;
      } else if (Array.isArray(self[prop])) {
        var destArr = _.reduce(self[prop], function (acc$2, t) {
          if (t && t.isTermTree) {
            push.apply(acc$2, t.destruct(context, options));
            return acc$2;
          }
          acc$2.push(t);
          return acc$2;
        }, []);
        push.apply(acc, destArr);
        return acc;
      } else if (self[prop]) {
        acc.push(self[prop]);
        return acc;
      } else {
        return acc;
      }
    }, []);
  },
  addDefCtx: function (def) {
    var self = this;
    _.each(this.constructor.properties, function (prop) {
      if (Array.isArray(self[prop])) {
        self[prop] = _.map(self[prop], function (item) {
          return item.addDefCtx(def);
        });
      } else if (self[prop]) {
        self[prop] = self[prop].addDefCtx(def);
      }
    });
    return this;
  },
  rename: function (id, name, phase) {
    var self = this;
    _.each(this.constructor.properties, function (prop) {
      if (Array.isArray(self[prop])) {
        self[prop] = _.map(self[prop], function (item) {
          return item.rename(id, name, phase);
        });
      } else if (self[prop]) {
        self[prop] = self[prop].rename(id, name, phase);
      }
    });
    return this;
  },
  imported: function (id, name, phase, mod) {
    var self = this;
    _.each(this.constructor.properties, function (prop) {
      if (Array.isArray(self[prop])) {
        self[prop] = _.map(self[prop], function (item) {
          return item.imported(id, name, phase, mod);
        });
      } else if (self[prop]) {
        self[prop] = self[prop].imported(id, name, phase, mod);
      }
    });
    return this;
  }
};
function EOFTerm(eof) {
  this.eof = eof;
}
EOFTerm.properties = ["eof"];
EOFTerm.create = function (eof) {
  return new EOFTerm(eof);
};
inherit(TermTree, EOFTerm, { isEOFTerm: true });
function KeywordTerm(keyword) {
  this.keyword = keyword;
}
KeywordTerm.properties = ["keyword"];
KeywordTerm.create = function (keyword) {
  return new KeywordTerm(keyword);
};
inherit(TermTree, KeywordTerm, { isKeywordTerm: true });
function PuncTerm(punc) {
  this.punc = punc;
}
PuncTerm.properties = ["punc"];
PuncTerm.create = function (punc) {
  return new PuncTerm(punc);
};
inherit(TermTree, PuncTerm, { isPuncTerm: true });
function DelimiterTerm(delim) {
  this.delim = delim;
}
DelimiterTerm.properties = ["delim"];
DelimiterTerm.create = function (delim) {
  return new DelimiterTerm(delim);
};
inherit(TermTree, DelimiterTerm, { isDelimiterTerm: true });
function ModuleTimeTerm() {}
ModuleTimeTerm.properties = [];
ModuleTimeTerm.create = function () {
  return new ModuleTimeTerm();
};
inherit(TermTree, ModuleTimeTerm, { isModuleTimeTerm: true });
function ModuleTerm(body) {
  this.body = body;
}
ModuleTerm.properties = ["body"];
ModuleTerm.create = function (body) {
  return new ModuleTerm(body);
};
inherit(ModuleTimeTerm, ModuleTerm, { isModuleTerm: true });
function ImportTerm(kw, clause, fromkw, from) {
  this.kw = kw;
  this.clause = clause;
  this.fromkw = fromkw;
  this.from = from;
}
ImportTerm.properties = ["kw", "clause", "fromkw", "from"];
ImportTerm.create = function (kw, clause, fromkw, from) {
  return new ImportTerm(kw, clause, fromkw, from);
};
inherit(ModuleTimeTerm, ImportTerm, { isImportTerm: true });
function ImportForMacrosTerm(kw, clause, fromkw, from, forkw, macroskw) {
  this.kw = kw;
  this.clause = clause;
  this.fromkw = fromkw;
  this.from = from;
  this.forkw = forkw;
  this.macroskw = macroskw;
}
ImportForMacrosTerm.properties = ["kw", "clause", "fromkw", "from", "forkw", "macroskw"];
ImportForMacrosTerm.create = function (kw, clause, fromkw, from, forkw, macroskw) {
  return new ImportForMacrosTerm(kw, clause, fromkw, from, forkw, macroskw);
};
inherit(ModuleTimeTerm, ImportForMacrosTerm, { isImportForMacrosTerm: true });
function NamedImportTerm(names) {
  this.names = names;
}
NamedImportTerm.properties = ["names"];
NamedImportTerm.create = function (names) {
  return new NamedImportTerm(names);
};
inherit(ModuleTimeTerm, NamedImportTerm, { isNamedImportTerm: true });
function DefaultImportTerm(name) {
  this.name = name;
}
DefaultImportTerm.properties = ["name"];
DefaultImportTerm.create = function (name) {
  return new DefaultImportTerm(name);
};
inherit(ModuleTimeTerm, DefaultImportTerm, { isDefaultImportTerm: true });
function NamespaceImportTerm(star, askw, name) {
  this.star = star;
  this.askw = askw;
  this.name = name;
}
NamespaceImportTerm.properties = ["star", "askw", "name"];
NamespaceImportTerm.create = function (star, askw, name) {
  return new NamespaceImportTerm(star, askw, name);
};
inherit(ModuleTimeTerm, NamespaceImportTerm, { isNamespaceImportTerm: true });
function BindingTerm(importName) {
  this.importName = importName;
}
BindingTerm.properties = ["importName"];
BindingTerm.create = function (importName) {
  return new BindingTerm(importName);
};
inherit(ModuleTimeTerm, BindingTerm, { isBindingTerm: true });
function QualifiedBindingTerm(importName, askw, localName) {
  this.importName = importName;
  this.askw = askw;
  this.localName = localName;
}
QualifiedBindingTerm.properties = ["importName", "askw", "localName"];
QualifiedBindingTerm.create = function (importName, askw, localName) {
  return new QualifiedBindingTerm(importName, askw, localName);
};
inherit(ModuleTimeTerm, QualifiedBindingTerm, { isQualifiedBindingTerm: true });
function ExportNameTerm(kw, name) {
  this.kw = kw;
  this.name = name;
}
ExportNameTerm.properties = ["kw", "name"];
ExportNameTerm.create = function (kw, name) {
  return new ExportNameTerm(kw, name);
};
inherit(ModuleTimeTerm, ExportNameTerm, { isExportNameTerm: true });
function ExportDefaultTerm(kw, defaultkw, decl) {
  this.kw = kw;
  this.defaultkw = defaultkw;
  this.decl = decl;
}
ExportDefaultTerm.properties = ["kw", "defaultkw", "decl"];
ExportDefaultTerm.create = function (kw, defaultkw, decl) {
  return new ExportDefaultTerm(kw, defaultkw, decl);
};
inherit(ModuleTimeTerm, ExportDefaultTerm, { isExportDefaultTerm: true });
function ExportDeclTerm(kw, decl) {
  this.kw = kw;
  this.decl = decl;
}
ExportDeclTerm.properties = ["kw", "decl"];
ExportDeclTerm.create = function (kw, decl) {
  return new ExportDeclTerm(kw, decl);
};
inherit(ModuleTimeTerm, ExportDeclTerm, { isExportDeclTerm: true });
function CompileTimeTerm() {}
CompileTimeTerm.properties = [];
CompileTimeTerm.create = function () {
  return new CompileTimeTerm();
};
inherit(TermTree, CompileTimeTerm, { isCompileTimeTerm: true });
function LetMacroTerm(name, body) {
  this.name = name;
  this.body = body;
}
LetMacroTerm.properties = ["name", "body"];
LetMacroTerm.create = function (name, body) {
  return new LetMacroTerm(name, body);
};
inherit(CompileTimeTerm, LetMacroTerm, { isLetMacroTerm: true });
function MacroTerm(name, body) {
  this.name = name;
  this.body = body;
}
MacroTerm.properties = ["name", "body"];
MacroTerm.create = function (name, body) {
  return new MacroTerm(name, body);
};
inherit(CompileTimeTerm, MacroTerm, { isMacroTerm: true });
function AnonMacroTerm(body) {
  this.body = body;
}
AnonMacroTerm.properties = ["body"];
AnonMacroTerm.create = function (body) {
  return new AnonMacroTerm(body);
};
inherit(CompileTimeTerm, AnonMacroTerm, { isAnonMacroTerm: true });
function OperatorDefinitionTerm(type, name, prec, assoc, body) {
  this.type = type;
  this.name = name;
  this.prec = prec;
  this.assoc = assoc;
  this.body = body;
}
OperatorDefinitionTerm.properties = ["type", "name", "prec", "assoc", "body"];
OperatorDefinitionTerm.create = function (type, name, prec, assoc, body) {
  return new OperatorDefinitionTerm(type, name, prec, assoc, body);
};
inherit(CompileTimeTerm, OperatorDefinitionTerm, { isOperatorDefinitionTerm: true });
function VariableDeclarationTerm(ident, eq, init, comma) {
  this.ident = ident;
  this.eq = eq;
  this.init = init;
  this.comma = comma;
}
VariableDeclarationTerm.properties = ["ident", "eq", "init", "comma"];
VariableDeclarationTerm.create = function (ident, eq, init, comma) {
  return new VariableDeclarationTerm(ident, eq, init, comma);
};
inherit(TermTree, VariableDeclarationTerm, { isVariableDeclarationTerm: true });
function StatementTerm() {}
StatementTerm.properties = [];
StatementTerm.create = function () {
  return new StatementTerm();
};
inherit(TermTree, StatementTerm, { isStatementTerm: true });
function EmptyTerm() {}
EmptyTerm.properties = [];
EmptyTerm.create = function () {
  return new EmptyTerm();
};
inherit(StatementTerm, EmptyTerm, { isEmptyTerm: true });
function CatchClauseTerm(keyword, params, body) {
  this.keyword = keyword;
  this.params = params;
  this.body = body;
}
CatchClauseTerm.properties = ["keyword", "params", "body"];
CatchClauseTerm.create = function (keyword, params, body) {
  return new CatchClauseTerm(keyword, params, body);
};
inherit(StatementTerm, CatchClauseTerm, { isCatchClauseTerm: true });
function ForStatementTerm(keyword, cond) {
  this.keyword = keyword;
  this.cond = cond;
}
ForStatementTerm.properties = ["keyword", "cond"];
ForStatementTerm.create = function (keyword, cond) {
  return new ForStatementTerm(keyword, cond);
};
inherit(StatementTerm, ForStatementTerm, { isForStatementTerm: true });
function ReturnStatementTerm(keyword, expr) {
  this.keyword = keyword;
  this.expr = expr;
}
ReturnStatementTerm.properties = ["keyword", "expr"];
ReturnStatementTerm.create = function (keyword, expr) {
  return new ReturnStatementTerm(keyword, expr);
};
inherit(StatementTerm, ReturnStatementTerm, {
  isReturnStatementTerm: true,
  destruct: function (context, options) {
    var expr = this.expr.destruct(context, options);
    // need to adjust the line numbers to make sure that the expr
    // starts on the same line as the return keyword. This might
    // not be the case if an operator or infix macro perturbed the
    // line numbers during expansion.
    expr = adjustLineContext(expr, this.keyword.keyword);
    return this.keyword.destruct(context, options).concat(expr);
  }
});
function ExprTerm() {}
ExprTerm.properties = [];
ExprTerm.create = function () {
  return new ExprTerm();
};
inherit(StatementTerm, ExprTerm, { isExprTerm: true });
function UnaryOpTerm(op, expr) {
  this.op = op;
  this.expr = expr;
}
UnaryOpTerm.properties = ["op", "expr"];
UnaryOpTerm.create = function (op, expr) {
  return new UnaryOpTerm(op, expr);
};
inherit(ExprTerm, UnaryOpTerm, { isUnaryOpTerm: true });
function PostfixOpTerm(expr, op) {
  this.expr = expr;
  this.op = op;
}
PostfixOpTerm.properties = ["expr", "op"];
PostfixOpTerm.create = function (expr, op) {
  return new PostfixOpTerm(expr, op);
};
inherit(ExprTerm, PostfixOpTerm, { isPostfixOpTerm: true });
function BinOpTerm(left, op, right) {
  this.left = left;
  this.op = op;
  this.right = right;
}
BinOpTerm.properties = ["left", "op", "right"];
BinOpTerm.create = function (left, op, right) {
  return new BinOpTerm(left, op, right);
};
inherit(ExprTerm, BinOpTerm, { isBinOpTerm: true });
function AssignmentExpressionTerm(left, op, right) {
  this.left = left;
  this.op = op;
  this.right = right;
}
AssignmentExpressionTerm.properties = ["left", "op", "right"];
AssignmentExpressionTerm.create = function (left, op, right) {
  return new AssignmentExpressionTerm(left, op, right);
};
inherit(ExprTerm, AssignmentExpressionTerm, { isAssignmentExpressionTerm: true });
function ConditionalExpressionTerm(cond, question, tru, colon, fls) {
  this.cond = cond;
  this.question = question;
  this.tru = tru;
  this.colon = colon;
  this.fls = fls;
}
ConditionalExpressionTerm.properties = ["cond", "question", "tru", "colon", "fls"];
ConditionalExpressionTerm.create = function (cond, question, tru, colon, fls) {
  return new ConditionalExpressionTerm(cond, question, tru, colon, fls);
};
inherit(ExprTerm, ConditionalExpressionTerm, { isConditionalExpressionTerm: true });
function NamedFunTerm(keyword, star, name, params, body) {
  this.keyword = keyword;
  this.star = star;
  this.name = name;
  this.params = params;
  this.body = body;
}
NamedFunTerm.properties = ["keyword", "star", "name", "params", "body"];
NamedFunTerm.create = function (keyword, star, name, params, body) {
  return new NamedFunTerm(keyword, star, name, params, body);
};
inherit(ExprTerm, NamedFunTerm, { isNamedFunTerm: true });
function AnonFunTerm(keyword, star, params, body) {
  this.keyword = keyword;
  this.star = star;
  this.params = params;
  this.body = body;
}
AnonFunTerm.properties = ["keyword", "star", "params", "body"];
AnonFunTerm.create = function (keyword, star, params, body) {
  return new AnonFunTerm(keyword, star, params, body);
};
inherit(ExprTerm, AnonFunTerm, { isAnonFunTerm: true });
function ArrowFunTerm(params, arrow, body) {
  this.params = params;
  this.arrow = arrow;
  this.body = body;
}
ArrowFunTerm.properties = ["params", "arrow", "body"];
ArrowFunTerm.create = function (params, arrow, body) {
  return new ArrowFunTerm(params, arrow, body);
};
inherit(ExprTerm, ArrowFunTerm, { isArrowFunTerm: true });
function ObjDotGetTerm(left, dot, right) {
  this.left = left;
  this.dot = dot;
  this.right = right;
}
ObjDotGetTerm.properties = ["left", "dot", "right"];
ObjDotGetTerm.create = function (left, dot, right) {
  return new ObjDotGetTerm(left, dot, right);
};
inherit(ExprTerm, ObjDotGetTerm, { isObjDotGetTerm: true });
function ObjGetTerm(left, right) {
  this.left = left;
  this.right = right;
}
ObjGetTerm.properties = ["left", "right"];
ObjGetTerm.create = function (left, right) {
  return new ObjGetTerm(left, right);
};
inherit(ExprTerm, ObjGetTerm, { isObjGetTerm: true });
function TemplateTerm(template) {
  this.template = template;
}
TemplateTerm.properties = ["template"];
TemplateTerm.create = function (template) {
  return new TemplateTerm(template);
};
inherit(ExprTerm, TemplateTerm, { isTemplateTerm: true });
function CallTerm(fun, args) {
  this.fun = fun;
  this.args = args;
}
CallTerm.properties = ["fun", "args"];
CallTerm.create = function (fun, args) {
  return new CallTerm(fun, args);
};
inherit(ExprTerm, CallTerm, { isCallTerm: true });
function QuoteSyntaxTerm(stx) {
  this.stx = stx;
}
QuoteSyntaxTerm.properties = ["stx"];
QuoteSyntaxTerm.create = function (stx) {
  return new QuoteSyntaxTerm(stx);
};
inherit(ExprTerm, QuoteSyntaxTerm, {
  isQuoteSyntaxTerm: true,
  destruct: function (context, options) {
    var tempId = fresh();
    context.templateMap.set(tempId, this.stx.token.inner);
    return [syn.makeIdent("getTemplate", this.stx), syn.makeDelim("()", [syn.makeValue(tempId, this.stx)], this.stx)];
  }
});
function PrimaryExpressionTerm() {}
PrimaryExpressionTerm.properties = [];
PrimaryExpressionTerm.create = function () {
  return new PrimaryExpressionTerm();
};
inherit(ExprTerm, PrimaryExpressionTerm, { isPrimaryExpressionTerm: true });
function ThisExpressionTerm(keyword) {
  this.keyword = keyword;
}
ThisExpressionTerm.properties = ["keyword"];
ThisExpressionTerm.create = function (keyword) {
  return new ThisExpressionTerm(keyword);
};
inherit(PrimaryExpressionTerm, ThisExpressionTerm, { isThisExpressionTerm: true });
function LitTerm(lit) {
  this.lit = lit;
}
LitTerm.properties = ["lit"];
LitTerm.create = function (lit) {
  return new LitTerm(lit);
};
inherit(PrimaryExpressionTerm, LitTerm, { isLitTerm: true });
function BlockTerm(body) {
  this.body = body;
}
BlockTerm.properties = ["body"];
BlockTerm.create = function (body) {
  return new BlockTerm(body);
};
inherit(PrimaryExpressionTerm, BlockTerm, { isBlockTerm: true });
function ArrayLiteralTerm(array) {
  this.array = array;
}
ArrayLiteralTerm.properties = ["array"];
ArrayLiteralTerm.create = function (array) {
  return new ArrayLiteralTerm(array);
};
inherit(PrimaryExpressionTerm, ArrayLiteralTerm, { isArrayLiteralTerm: true });
function IdTerm(id) {
  this.id = id;
}
IdTerm.properties = ["id"];
IdTerm.create = function (id) {
  return new IdTerm(id);
};
inherit(PrimaryExpressionTerm, IdTerm, { isIdTerm: true });
function PartialTerm() {}
PartialTerm.properties = [];
PartialTerm.create = function () {
  return new PartialTerm();
};
inherit(TermTree, PartialTerm, { isPartialTerm: true });
function PartialOperationTerm(stx, left) {
  this.stx = stx;
  this.left = left;
}
PartialOperationTerm.properties = ["stx", "left"];
PartialOperationTerm.create = function (stx, left) {
  return new PartialOperationTerm(stx, left);
};
inherit(PartialTerm, PartialOperationTerm, { isPartialOperationTerm: true });
function PartialExpressionTerm(stx, left, combine) {
  this.stx = stx;
  this.left = left;
  this.combine = combine;
}
PartialExpressionTerm.properties = ["stx", "left", "combine"];
PartialExpressionTerm.create = function (stx, left, combine) {
  return new PartialExpressionTerm(stx, left, combine);
};
inherit(PartialTerm, PartialExpressionTerm, { isPartialExpressionTerm: true });
function BindingStatementTerm(keyword, decls) {
  this.keyword = keyword;
  this.decls = decls;
}
BindingStatementTerm.properties = ["keyword", "decls"];
BindingStatementTerm.create = function (keyword, decls) {
  return new BindingStatementTerm(keyword, decls);
};
inherit(StatementTerm, BindingStatementTerm, {
  isBindingStatementTerm: true,
  destruct: function (context, options) {
    return this.keyword.destruct(context, options).concat(_.reduce(this.decls, function (acc, decl) {
      push.apply(acc, decl.destruct(context, options));
      return acc;
    }, []));
  }
});
function VariableStatementTerm(keyword, decls) {
  this.keyword = keyword;
  this.decls = decls;
}
VariableStatementTerm.properties = ["keyword", "decls"];
VariableStatementTerm.create = function (keyword, decls) {
  return new VariableStatementTerm(keyword, decls);
};
inherit(BindingStatementTerm, VariableStatementTerm, { isVariableStatementTerm: true });
function LetStatementTerm(keyword, decls) {
  this.keyword = keyword;
  this.decls = decls;
}
LetStatementTerm.properties = ["keyword", "decls"];
LetStatementTerm.create = function (keyword, decls) {
  return new LetStatementTerm(keyword, decls);
};
inherit(BindingStatementTerm, LetStatementTerm, { isLetStatementTerm: true });
function ConstStatementTerm(keyword, decls) {
  this.keyword = keyword;
  this.decls = decls;
}
ConstStatementTerm.properties = ["keyword", "decls"];
ConstStatementTerm.create = function (keyword, decls) {
  return new ConstStatementTerm(keyword, decls);
};
inherit(BindingStatementTerm, ConstStatementTerm, { isConstStatementTerm: true });
function ParenExpressionTerm(args, delim, commas) {
  this.args = args;
  this.delim = delim;
  this.commas = commas;
}
ParenExpressionTerm.properties = ["args", "delim", "commas"];
ParenExpressionTerm.create = function (args, delim, commas) {
  return new ParenExpressionTerm(args, delim, commas);
};
inherit(PrimaryExpressionTerm, ParenExpressionTerm, {
  isParenExpressionTerm: true,
  destruct: function (context, options) {
    var commas = this.commas.slice();
    var src = this.delim.token;
    var keys = Object.keys(src);
    var newtok = {};
    for (var i = 0, len = keys.length, key; i < len; i++) {
      key = keys[i];
      newtok[key] = src[key];
    }
    var delim = syntaxFromToken(newtok, this.delim);
    delim.token.inner = _.reduce(this.args, function (acc, term) {
      assert(term && term.isTermTree, "expecting term trees in destruct of ParenExpression");
      push.apply(acc, term.destruct(context, options));
      if ( // add all commas except for the last one
      commas.length > 0) {
        acc.push(commas.shift());
      }
      return acc;
    }, []);
    return DelimiterTerm.create(delim).destruct(context, options);
  }
});
module.exports = {
  TermTree: TermTree,
  EOFTerm: EOFTerm,
  KeywordTerm: KeywordTerm,
  PuncTerm: PuncTerm,
  DelimiterTerm: DelimiterTerm,
  ModuleTimeTerm: ModuleTimeTerm,
  ModuleTerm: ModuleTerm,
  ImportTerm: ImportTerm,
  ImportForMacrosTerm: ImportForMacrosTerm,
  NamedImportTerm: NamedImportTerm,
  NamespaceImportTerm: NamespaceImportTerm,
  DefaultImportTerm: DefaultImportTerm,
  BindingTerm: BindingTerm,
  QualifiedBindingTerm: QualifiedBindingTerm,
  ExportNameTerm: ExportNameTerm,
  ExportDefaultTerm: ExportDefaultTerm,
  ExportDeclTerm: ExportDeclTerm,
  CompileTimeTerm: CompileTimeTerm,
  LetMacroTerm: LetMacroTerm,
  MacroTerm: MacroTerm,
  AnonMacroTerm: AnonMacroTerm,
  OperatorDefinitionTerm: OperatorDefinitionTerm,
  VariableDeclarationTerm: VariableDeclarationTerm,
  StatementTerm: StatementTerm,
  EmptyTerm: EmptyTerm,
  CatchClauseTerm: CatchClauseTerm,
  ForStatementTerm: ForStatementTerm,
  ReturnStatementTerm: ReturnStatementTerm,
  ExprTerm: ExprTerm,
  UnaryOpTerm: UnaryOpTerm,
  PostfixOpTerm: PostfixOpTerm,
  BinOpTerm: BinOpTerm,
  AssignmentExpressionTerm: AssignmentExpressionTerm,
  ConditionalExpressionTerm: ConditionalExpressionTerm,
  NamedFunTerm: NamedFunTerm,
  AnonFunTerm: AnonFunTerm,
  ArrowFunTerm: ArrowFunTerm,
  ObjDotGetTerm: ObjDotGetTerm,
  ObjGetTerm: ObjGetTerm,
  TemplateTerm: TemplateTerm,
  CallTerm: CallTerm,
  QuoteSyntaxTerm: QuoteSyntaxTerm,
  PrimaryExpressionTerm: PrimaryExpressionTerm,
  ThisExpressionTerm: ThisExpressionTerm,
  LitTerm: LitTerm,
  BlockTerm: BlockTerm,
  ArrayLiteralTerm: ArrayLiteralTerm,
  IdTerm: IdTerm,
  PartialTerm: PartialTerm,
  PartialOperationTerm: PartialOperationTerm,
  PartialExpressionTerm: PartialExpressionTerm,
  BindingStatementTerm: BindingStatementTerm,
  VariableStatementTerm: VariableStatementTerm,
  LetStatementTerm: LetStatementTerm,
  ConstStatementTerm: ConstStatementTerm,
  ParenExpressionTerm: ParenExpressionTerm
};
//# sourceMappingURL=termTree.js.map