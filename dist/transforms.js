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

var VarBindingTransform = exports.VarBindingTransform = function VarBindingTransform(id_933) {
  _classCallCheck(this, VarBindingTransform);

  this.id = id_933;
};

var CompiletimeTransform = exports.CompiletimeTransform = function CompiletimeTransform(value_934) {
  _classCallCheck(this, CompiletimeTransform);

  this.value = value_934;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3RyYW5zZm9ybXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFBYTs7OztJQUNBOzs7O0lBQ0E7Ozs7SUFDQTs7OztJQUNBOzs7O0lBQ0E7Ozs7SUFDQTs7OztJQUNBOzs7O0lBQ0E7Ozs7SUFDQTs7OztJQUNBOzs7O0lBQ0E7Ozs7SUFDQTs7OztJQUNBOzs7O0lBQ0E7Ozs7SUFDQTs7OztJQUNBOzs7O0lBQ0E7Ozs7SUFDQTs7OztJQUNBOzs7O0lBQ0Esb0RBQ1gsU0FEVyxtQkFDWCxDQUFZLE1BQVosRUFBb0I7d0JBRFQscUJBQ1M7O0FBQ2xCLE9BQUssRUFBTCxHQUFVLE1BQVYsQ0FEa0I7Q0FBcEI7O0lBSVcsc0RBQ1gsU0FEVyxvQkFDWCxDQUFZLFNBQVosRUFBdUI7d0JBRFosc0JBQ1k7O0FBQ3JCLE9BQUssS0FBTCxHQUFhLFNBQWIsQ0FEcUI7Q0FBdkIiLCJmaWxlIjoidHJhbnNmb3Jtcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBGdW5jdGlvbkRlY2xUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBWYXJpYWJsZURlY2xUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBOZXdUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBUaHJvd1RyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIExldERlY2xUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBDb25zdERlY2xUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBUcnlUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBXaGlsZVRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIElmVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgRm9yVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgU3dpdGNoVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgQnJlYWtUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBDb250aW51ZVRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIERvVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgV2l0aFRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIERlYnVnZ2VyVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgU3ludGF4cmVjRGVjbFRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIFN5bnRheERlY2xUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBTeW50YXhRdW90ZVRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIFJldHVyblN0YXRlbWVudFRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIFZhckJpbmRpbmdUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3RvcihpZF85MzMpIHtcbiAgICB0aGlzLmlkID0gaWRfOTMzO1xuICB9XG59XG5leHBvcnQgY2xhc3MgQ29tcGlsZXRpbWVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZV85MzQpIHtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWVfOTM0O1xuICB9XG59XG4iXX0=