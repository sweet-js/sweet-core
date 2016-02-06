"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FunctionDeclTransform = exports.FunctionDeclTransform = function FunctionDeclTransform() {
  _classCallCheck(this, FunctionDeclTransform);
};

var VariableDeclTransform = exports.VariableDeclTransform = function VariableDeclTransform() {
  _classCallCheck(this, VariableDeclTransform);
};

var NewTransform = exports.NewTransform = function NewTransform() {
  _classCallCheck(this, NewTransform);
};

var ThrowTransform = exports.ThrowTransform = function ThrowTransform() {
  _classCallCheck(this, ThrowTransform);
};

var LetDeclTransform = exports.LetDeclTransform = function LetDeclTransform() {
  _classCallCheck(this, LetDeclTransform);
};

var ConstDeclTransform = exports.ConstDeclTransform = function ConstDeclTransform() {
  _classCallCheck(this, ConstDeclTransform);
};

var TryTransform = exports.TryTransform = function TryTransform() {
  _classCallCheck(this, TryTransform);
};

var WhileTransform = exports.WhileTransform = function WhileTransform() {
  _classCallCheck(this, WhileTransform);
};

var IfTransform = exports.IfTransform = function IfTransform() {
  _classCallCheck(this, IfTransform);
};

var ForTransform = exports.ForTransform = function ForTransform() {
  _classCallCheck(this, ForTransform);
};

var SwitchTransform = exports.SwitchTransform = function SwitchTransform() {
  _classCallCheck(this, SwitchTransform);
};

var BreakTransform = exports.BreakTransform = function BreakTransform() {
  _classCallCheck(this, BreakTransform);
};

var ContinueTransform = exports.ContinueTransform = function ContinueTransform() {
  _classCallCheck(this, ContinueTransform);
};

var DoTransform = exports.DoTransform = function DoTransform() {
  _classCallCheck(this, DoTransform);
};

var WithTransform = exports.WithTransform = function WithTransform() {
  _classCallCheck(this, WithTransform);
};

var DebuggerTransform = exports.DebuggerTransform = function DebuggerTransform() {
  _classCallCheck(this, DebuggerTransform);
};

var SyntaxrecDeclTransform = exports.SyntaxrecDeclTransform = function SyntaxrecDeclTransform() {
  _classCallCheck(this, SyntaxrecDeclTransform);
};

var SyntaxDeclTransform = exports.SyntaxDeclTransform = function SyntaxDeclTransform() {
  _classCallCheck(this, SyntaxDeclTransform);
};

var SyntaxQuoteTransform = exports.SyntaxQuoteTransform = function SyntaxQuoteTransform() {
  _classCallCheck(this, SyntaxQuoteTransform);
};

var ReturnStatementTransform = exports.ReturnStatementTransform = function ReturnStatementTransform() {
  _classCallCheck(this, ReturnStatementTransform);
};

var VarBindingTransform = exports.VarBindingTransform = function VarBindingTransform(id) {
  _classCallCheck(this, VarBindingTransform);

  this.id = id;
};

var CompiletimeTransform = exports.CompiletimeTransform = function CompiletimeTransform(value) {
  _classCallCheck(this, CompiletimeTransform);

  this.value = value;
};
//# sourceMappingURL=transforms.js.map
