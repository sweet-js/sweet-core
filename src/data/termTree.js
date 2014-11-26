#lang "../../macros/stxcase.js";

"use strict";

var _ = require("underscore"),
    syn = require("../syntax"),
    assert = require("assert");


var syntaxFromToken = syn.syntaxFromToken,
    adjustLineContext = syn.adjustLineContext,
    fresh = syn.fresh;

var push = Array.prototype.push;

function inherit(parent, child, methods) {
    var P = function(){};
    P.prototype = parent.prototype;
    child.prototype = new P();
    child.prototype.constructor = child;
    _.extend(child.prototype, methods);
}

macro cloned {
    rule { $dest:ident <- $source:expr ;... } => {
        var src = $source;
        var keys = Object.keys(src);
        var $dest = {};
        for (var i = 0, len = keys.length, key; i < len; i++) {
            key = keys[i];
            $dest[key] = src[key];
        }
    }
}

macro to_str {
    case { _ ($toks (,) ...) } => {
        var toks = #{ $toks ... };
        // We aren't using unwrapSyntax because it breaks since its defined
        // within the outer scope! We need phases.
        var str = toks.map(function(x) { return x.token.value }).join('');
        return [makeValue(str, #{ here })];
    }
}

macro class_method {
    rule { $name:ident $args $body } => {
        to_str($name): function $args $body
    }
}

macro class_extend {
    rule { $name $parent $methods } => {
        inherit($parent, $name, $methods);
    }
}

macro class_ctr {
    rule { $name ($field ...) } => {
        function $name($field (,) ...) {
            $(this.$field = $field;) ...
        }
    }
}

macro class_create {
    rule { $name ($arg (,) ...) } => {
        $name.properties = [$(to_str($arg)) (,) ...];
        $name.create = function($arg (,) ...) {
            return new $name($arg (,) ...);
        }
    }
}

macro dataclass {
    rule {
        $name:ident ($field:ident (,) ...) extends $parent:ident {
            $methods:class_method ...
        } ;...
    } => {
        class_ctr $name ($field ...)
        class_create $name ($field (,) ...)
        class_extend $name $parent {
            to_str('is', $name): true,
            $methods (,) ...
        }
    }

    rule {
        $name:ident ($field:ident (,) ...) {
            $methods:class_method ...
        } ;...
    } => {
        class_ctr $name ($field ...)
        class_create $name ($field (,) ...)
        $name.prototype = {
            to_str('is', $name): true,
            $methods (,) ...
        };
    }

    rule { $name:ident ($field (,) ...) extends $parent:ident ;... } => {
        class_ctr $name ($field ...)
        class_create $name ($field (,) ...)
        class_extend $name $parent {
            to_str('is', $name): true
        }
    }

    rule { $name:ident ($field (,) ...) ;... } => {
        class_ctr $name ($field ...)
        class_create $name ($field (,) ...)
        $name.prototype = {
            to_str('is', $name): true
        };
    }
}

// @ let TemplateMap = {}
// @ let PatternMap = {}
// @ let TokenObject = {}
// @ let ContextObject = {}

// @ let SyntaxObject = {
//     token: TokenObject,
//     context: Null or ContextObject
// }
// @ let TermTreeObject = {}

// @ let ExpanderContext = {}
// {
//     filename: Str,
//     env: {},
//     defscope: {},
//     paramscope: {},
//     templateMap: {},
//     patternMap: {},
//     mark: Num
// }

// @ let ExportTerm = {
//     name: SyntaxObject
// }
// @ let ImportTerm = {
//     names: SyntaxObject,
//     from: SyntaxObject
// }
// @ let ModuleTerm = {
//     name: SyntaxObject,
//     lang: SyntaxObject,
//     body: [...SyntaxObject] or [...TermTreeObject],
//     imports: [...ImportTerm],
//     exports: [...ExportTerm]
// }

// A TermTree is the core data structure for the macro expansion process.
// It acts as a semi-structured representation of the syntax.
dataclass TermTree() {

    // Go back to the syntax object representation. Uses the
    // ordered list of properties that each subclass sets to
    // determine the order in which multiple children are
    // destructed.
    // ({stripCompileTerm: ?Boolean}) -> [...Syntax]
    destruct(context, options) {
        assert(context, "must pass in the context to destruct");
        options = options || {};
        var self = this;
        if (options.stripCompileTerm && this.isCompileTimeTerm)  {
            return [];
        }
        if (options.stripModuleTerm && this.isModuleTimeTerm)  {
            return [];
        }
        return _.reduce(this.constructor.properties, function(acc, prop) {
            if (self[prop] && self[prop].isTermTree) {
                push.apply(acc, self[prop].destruct(context, options));
                return acc;
            } else if (self[prop] && self[prop].token && self[prop].token.inner) {
                cloned newtok <- self[prop].token;
                var clone = syntaxFromToken(newtok, self[prop]);
                clone.token.inner = _.reduce(clone.token.inner, function(acc, t) {
                    if (t && t.isTermTree) {
                        push.apply(acc, t.destruct(context, options));
                        return acc;
                    }
                    acc.push(t);
                    return acc;
                }, []);
                acc.push(clone);
                return acc;
            } else if (Array.isArray(self[prop])) {
                var destArr = _.reduce(self[prop], function(acc, t) {
                    if (t && t.isTermTree) {
                        push.apply(acc, t.destruct(context, options));
                        return acc;
                    }
                    acc.push(t);
                    return acc;
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
    }

    addDefCtx(def) {
        var self = this;
        _.each(this.constructor.properties, function(prop) {
            if (Array.isArray(self[prop])) {
                self[prop] = _.map(self[prop], function (item) {
                    return item.addDefCtx(def);
                });
            } else if (self[prop]) {
                self[prop] = self[prop].addDefCtx(def);
            }
        });
        return this;
    }

    rename(id, name, phase) {
        var self = this;
        _.each(this.constructor.properties, function(prop) {
            if (Array.isArray(self[prop])) {
                self[prop] = _.map(self[prop], function (item) {
                    return item.rename(id, name, phase);
                });
            } else if (self[prop]) {
                self[prop] = self[prop].rename(id, name, phase);
            }
        });
        return this;
    }

    imported(id, name, phase) {
        var self = this;
        _.each(this.constructor.properties, function(prop) {
            if (Array.isArray(self[prop])) {
                self[prop] = _.map(self[prop], function (item) {
                    return item.imported(id, name, phase);
                });
            } else if (self[prop]) {
                self[prop] = self[prop].imported(id, name, phase);
            }
        });
        return this;
    }
}

dataclass EOFTerm                   (eof)                               extends TermTree;
dataclass KeywordTerm               (keyword)                           extends TermTree;
dataclass PuncTerm                  (punc)                              extends TermTree;
dataclass DelimiterTerm             (delim)                             extends TermTree;

dataclass ModuleTimeTerm            ()                                  extends TermTree;

dataclass ModuleTerm                (body)                              extends ModuleTimeTerm;
dataclass ImportTerm                (kw, clause, fromkw, from)          extends ModuleTimeTerm;
dataclass ImportForMacrosTerm       (kw, clause, fromkw, from,
                                     forkw, macroskw)                   extends ModuleTimeTerm;
dataclass NamedImportTerm           (names)                             extends ModuleTimeTerm;
dataclass DefaultImportTerm         (name)                              extends ModuleTimeTerm;
dataclass NamespaceImportTerm       (star, askw, name)                  extends ModuleTimeTerm;
dataclass BindingTerm               (importName)                        extends ModuleTimeTerm;
dataclass QualifiedBindingTerm      (importName, askw, localName)       extends ModuleTimeTerm;
dataclass ExportNameTerm            (kw, name)                          extends ModuleTimeTerm;
dataclass ExportDefaultTerm         (kw, defaultkw, decl)               extends ModuleTimeTerm;
dataclass ExportDeclTerm            (kw, decl)                          extends ModuleTimeTerm;

dataclass CompileTimeTerm           ()                                  extends TermTree;

dataclass LetMacroTerm              (name, body)                        extends CompileTimeTerm;
dataclass MacroTerm                 (name, body)                        extends CompileTimeTerm;
dataclass AnonMacroTerm             (body)                              extends CompileTimeTerm;
dataclass OperatorDefinitionTerm    (type, name, prec, assoc, body)     extends CompileTimeTerm;

dataclass VariableDeclarationTerm   (ident, eq, init, comma)            extends TermTree;

dataclass StatementTerm             ()                                  extends TermTree;

dataclass EmptyTerm                 ()                                  extends StatementTerm;
dataclass CatchClauseTerm           (keyword, params, body)             extends StatementTerm;
dataclass ForStatementTerm          (keyword, cond)                     extends StatementTerm;
dataclass ReturnStatementTerm       (keyword, expr)                     extends StatementTerm {
    destruct(context, options) {
        var expr = this.expr.destruct(context, options);
        // need to adjust the line numbers to make sure that the expr
        // starts on the same line as the return keyword. This might
        // not be the case if an operator or infix macro perturbed the
        // line numbers during expansion.
        expr = adjustLineContext(expr, this.keyword.keyword);
        return this.keyword.destruct(context, options).concat(expr);
    }
}

dataclass ExprTerm                  ()                                  extends StatementTerm;
dataclass UnaryOpTerm               (op, expr)                          extends ExprTerm;
dataclass PostfixOpTerm             (expr, op)                          extends ExprTerm;
dataclass BinOpTerm                 (left, op, right)                   extends ExprTerm;
dataclass AssignmentExpressionTerm  (left, op, right)                   extends ExprTerm;
dataclass ConditionalExpressionTerm (cond, question, tru, colon, fls)   extends ExprTerm;
dataclass NamedFunTerm              (keyword, star, name, params, body) extends ExprTerm;
dataclass AnonFunTerm               (keyword, star, params, body)       extends ExprTerm;
dataclass ArrowFunTerm              (params, arrow, body)               extends ExprTerm;
dataclass ObjDotGetTerm             (left, dot, right)                  extends ExprTerm;
dataclass ObjGetTerm                (left, right)                       extends ExprTerm;
dataclass TemplateTerm              (template)                          extends ExprTerm;
dataclass CallTerm                  (fun, args)                         extends ExprTerm;

dataclass QuoteSyntaxTerm           (stx)                               extends ExprTerm {
    destruct(context, options) {
        var tempId = fresh();
        context.templateMap.set(tempId, this.stx.token.inner);
        return [syn.makeIdent("getTemplate", this.stx),
                syn.makeDelim("()", [
                    syn.makeValue(tempId, this.stx)
                ], this.stx)];

    }
}


dataclass PrimaryExpressionTerm     ()                                  extends ExprTerm;
dataclass ThisExpressionTerm        (keyword)                           extends PrimaryExpressionTerm;
dataclass LitTerm                   (lit)                               extends PrimaryExpressionTerm;
dataclass BlockTerm                 (body)                              extends PrimaryExpressionTerm;
dataclass ArrayLiteralTerm          (array)                             extends PrimaryExpressionTerm;
dataclass IdTerm                    (id)                                extends PrimaryExpressionTerm;

dataclass PartialTerm               ()                                  extends TermTree;
dataclass PartialOperationTerm      (stx, left)                         extends PartialTerm;
dataclass PartialExpressionTerm     (stx, left, combine)                extends PartialTerm;

dataclass BindingStatementTerm(keyword, decls) extends StatementTerm {
    destruct(context, options) {
        return this.keyword
            .destruct(context, options)
            .concat(_.reduce(this.decls, function(acc, decl) {
                push.apply(acc, decl.destruct(context, options));
                return acc;
            }, []));
    }
}

dataclass VariableStatementTerm (keyword, decls) extends BindingStatementTerm;
dataclass LetStatementTerm      (keyword, decls) extends BindingStatementTerm;
dataclass ConstStatementTerm    (keyword, decls) extends BindingStatementTerm;

dataclass ParenExpressionTerm(args, delim, commas) extends PrimaryExpressionTerm {
    destruct(context, options) {
        var commas = this.commas.slice();
        cloned newtok <- this.delim.token;
        var delim = syntaxFromToken(newtok, this.delim);
        delim.token.inner = _.reduce(this.args, function(acc, term) {
            assert(term && term.isTermTree,
                   "expecting term trees in destruct of ParenExpression");
            push.apply(acc, term.destruct(context, options));
            // add all commas except for the last one
            if (commas.length > 0) {
                acc.push(commas.shift());
            }
            return acc;
        }, []);
        return DelimiterTerm.create(delim).destruct(context, options);
    }
}


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
    ThisExpressionTerm:ThisExpressionTerm,
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
