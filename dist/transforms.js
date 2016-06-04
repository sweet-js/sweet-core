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

var VarBindingTransform = exports.VarBindingTransform = function VarBindingTransform(id_948) {
  _classCallCheck(this, VarBindingTransform);

  this.id = id_948;
};

var CompiletimeTransform = exports.CompiletimeTransform = function CompiletimeTransform(value_949) {
  _classCallCheck(this, CompiletimeTransform);

  this.value = value_949;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3RyYW5zZm9ybXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFBYSxxQixXQUFBLHFCOzs7O0lBQ0EscUIsV0FBQSxxQjs7OztJQUNBLFksV0FBQSxZOzs7O0lBQ0EsYyxXQUFBLGM7Ozs7SUFDQSxnQixXQUFBLGdCOzs7O0lBQ0Esa0IsV0FBQSxrQjs7OztJQUNBLFksV0FBQSxZOzs7O0lBQ0EsYyxXQUFBLGM7Ozs7SUFDQSxXLFdBQUEsVzs7OztJQUNBLFksV0FBQSxZOzs7O0lBQ0EsZSxXQUFBLGU7Ozs7SUFDQSxjLFdBQUEsYzs7OztJQUNBLGlCLFdBQUEsaUI7Ozs7SUFDQSxXLFdBQUEsVzs7OztJQUNBLGEsV0FBQSxhOzs7O0lBQ0EsaUIsV0FBQSxpQjs7OztJQUNBLHNCLFdBQUEsc0I7Ozs7SUFDQSxtQixXQUFBLG1COzs7O0lBQ0Esb0IsV0FBQSxvQjs7OztJQUNBLHdCLFdBQUEsd0I7Ozs7SUFDQSxtQixXQUFBLG1CLEdBQ1gsNkJBQVksTUFBWixFQUFvQjtBQUFBOztBQUNsQixPQUFLLEVBQUwsR0FBVSxNQUFWO0FBQ0QsQzs7SUFFVSxvQixXQUFBLG9CLEdBQ1gsOEJBQVksU0FBWixFQUF1QjtBQUFBOztBQUNyQixPQUFLLEtBQUwsR0FBYSxTQUFiO0FBQ0QsQyIsImZpbGUiOiJ0cmFuc2Zvcm1zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEZ1bmN0aW9uRGVjbFRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlRGVjbFRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIE5ld1RyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIFRocm93VHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgTGV0RGVjbFRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIENvbnN0RGVjbFRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIFRyeVRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIFdoaWxlVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgSWZUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBGb3JUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBTd2l0Y2hUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBCcmVha1RyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIENvbnRpbnVlVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgRG9UcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBXaXRoVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgRGVidWdnZXJUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBTeW50YXhyZWNEZWNsVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgU3ludGF4RGVjbFRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIFN5bnRheFF1b3RlVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgUmV0dXJuU3RhdGVtZW50VHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgVmFyQmluZGluZ1RyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKGlkXzk0OCkge1xuICAgIHRoaXMuaWQgPSBpZF85NDg7XG4gIH1cbn1cbmV4cG9ydCBjbGFzcyBDb21waWxldGltZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKHZhbHVlXzk0OSkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZV85NDk7XG4gIH1cbn1cbiJdfQ==