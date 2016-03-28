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

var VarBindingTransform = exports.VarBindingTransform = function VarBindingTransform(id_939) {
  _classCallCheck(this, VarBindingTransform);

  this.id = id_939;
};

var CompiletimeTransform = exports.CompiletimeTransform = function CompiletimeTransform(value_940) {
  _classCallCheck(this, CompiletimeTransform);

  this.value = value_940;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3RyYW5zZm9ybXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFBYSxxQkFBcUIsV0FBckIscUJBQXFCLFlBQXJCLHFCQUFxQjt3QkFBckIscUJBQXFCOzs7SUFDckIscUJBQXFCLFdBQXJCLHFCQUFxQixZQUFyQixxQkFBcUI7d0JBQXJCLHFCQUFxQjs7O0lBQ3JCLFlBQVksV0FBWixZQUFZLFlBQVosWUFBWTt3QkFBWixZQUFZOzs7SUFDWixjQUFjLFdBQWQsY0FBYyxZQUFkLGNBQWM7d0JBQWQsY0FBYzs7O0lBQ2QsZ0JBQWdCLFdBQWhCLGdCQUFnQixZQUFoQixnQkFBZ0I7d0JBQWhCLGdCQUFnQjs7O0lBQ2hCLGtCQUFrQixXQUFsQixrQkFBa0IsWUFBbEIsa0JBQWtCO3dCQUFsQixrQkFBa0I7OztJQUNsQixZQUFZLFdBQVosWUFBWSxZQUFaLFlBQVk7d0JBQVosWUFBWTs7O0lBQ1osY0FBYyxXQUFkLGNBQWMsWUFBZCxjQUFjO3dCQUFkLGNBQWM7OztJQUNkLFdBQVcsV0FBWCxXQUFXLFlBQVgsV0FBVzt3QkFBWCxXQUFXOzs7SUFDWCxZQUFZLFdBQVosWUFBWSxZQUFaLFlBQVk7d0JBQVosWUFBWTs7O0lBQ1osZUFBZSxXQUFmLGVBQWUsWUFBZixlQUFlO3dCQUFmLGVBQWU7OztJQUNmLGNBQWMsV0FBZCxjQUFjLFlBQWQsY0FBYzt3QkFBZCxjQUFjOzs7SUFDZCxpQkFBaUIsV0FBakIsaUJBQWlCLFlBQWpCLGlCQUFpQjt3QkFBakIsaUJBQWlCOzs7SUFDakIsV0FBVyxXQUFYLFdBQVcsWUFBWCxXQUFXO3dCQUFYLFdBQVc7OztJQUNYLGFBQWEsV0FBYixhQUFhLFlBQWIsYUFBYTt3QkFBYixhQUFhOzs7SUFDYixpQkFBaUIsV0FBakIsaUJBQWlCLFlBQWpCLGlCQUFpQjt3QkFBakIsaUJBQWlCOzs7SUFDakIsc0JBQXNCLFdBQXRCLHNCQUFzQixZQUF0QixzQkFBc0I7d0JBQXRCLHNCQUFzQjs7O0lBQ3RCLG1CQUFtQixXQUFuQixtQkFBbUIsWUFBbkIsbUJBQW1CO3dCQUFuQixtQkFBbUI7OztJQUNuQixvQkFBb0IsV0FBcEIsb0JBQW9CLFlBQXBCLG9CQUFvQjt3QkFBcEIsb0JBQW9COzs7SUFDcEIsd0JBQXdCLFdBQXhCLHdCQUF3QixZQUF4Qix3QkFBd0I7d0JBQXhCLHdCQUF3Qjs7O0lBQ3hCLG1CQUFtQixXQUFuQixtQkFBbUIsR0FDOUIsU0FEVyxtQkFBbUIsQ0FDbEIsTUFBTSxFQUFFO3dCQURULG1CQUFtQjs7QUFFNUIsTUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUM7Q0FDbEI7O0lBRVUsb0JBQW9CLFdBQXBCLG9CQUFvQixHQUMvQixTQURXLG9CQUFvQixDQUNuQixTQUFTLEVBQUU7d0JBRFosb0JBQW9COztBQUU3QixNQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztDQUN4QiIsImZpbGUiOiJ0cmFuc2Zvcm1zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEZ1bmN0aW9uRGVjbFRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlRGVjbFRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIE5ld1RyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIFRocm93VHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgTGV0RGVjbFRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIENvbnN0RGVjbFRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIFRyeVRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIFdoaWxlVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgSWZUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBGb3JUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBTd2l0Y2hUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBCcmVha1RyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIENvbnRpbnVlVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgRG9UcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBXaXRoVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgRGVidWdnZXJUcmFuc2Zvcm0ge31cbmV4cG9ydCBjbGFzcyBTeW50YXhyZWNEZWNsVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgU3ludGF4RGVjbFRyYW5zZm9ybSB7fVxuZXhwb3J0IGNsYXNzIFN5bnRheFF1b3RlVHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgUmV0dXJuU3RhdGVtZW50VHJhbnNmb3JtIHt9XG5leHBvcnQgY2xhc3MgVmFyQmluZGluZ1RyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKGlkXzkzOSkge1xuICAgIHRoaXMuaWQgPSBpZF85Mzk7XG4gIH1cbn1cbmV4cG9ydCBjbGFzcyBDb21waWxldGltZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKHZhbHVlXzk0MCkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZV85NDA7XG4gIH1cbn1cbiJdfQ==