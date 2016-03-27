"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _symbol = require("./symbol");

var _transforms = require("./transforms");

var _errors = require("./errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScopeApplyingReducer = function () {
  function ScopeApplyingReducer(scope_0, context_1) {
    var phase_2 = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    _classCallCheck(this, ScopeApplyingReducer);

    this.context = context_1;
    this.scope = scope_0;
    this.phase = phase_2;
  }

  _createClass(ScopeApplyingReducer, [{
    key: "transform",
    value: function transform(term_3) {
      var field_4 = "transform" + term_3.type;
      if (typeof this[field_4] === "function") {
        return this[field_4](term_3);
      }
      (0, _errors.assert)(false, "transform not implemented yet for: " + term_3.type);
    }
  }, {
    key: "transformFormalParameters",
    value: function transformFormalParameters(term_5) {
      var _this = this;

      var rest_6 = term_5.rest == null ? null : this.transform(term_5.rest);
      return new _terms2.default("FormalParameters", { items: term_5.items.map(function (it) {
          return _this.transform(it);
        }), rest: rest_6 });
    }
  }, {
    key: "transformBindingWithDefault",
    value: function transformBindingWithDefault(term_7) {
      return new _terms2.default("BindingWithDefault", { binding: this.transform(term_7.binding), init: term_7.init });
    }
  }, {
    key: "transformObjectBinding",
    value: function transformObjectBinding(term_8) {
      return term_8;
    }
  }, {
    key: "transformBindingPropertyIdentifier",
    value: function transformBindingPropertyIdentifier(term_9) {
      return new _terms2.default("BindingPropertyIdentifier", { binding: this.transform(term_9.binding), init: term_9.init });
    }
  }, {
    key: "transformBindingPropertyProperty",
    value: function transformBindingPropertyProperty(term_10) {
      return new _terms2.default("BindingPropertyProperty", { name: term_10.name, binding: this.transform(term_10.binding) });
    }
  }, {
    key: "transformArrayBinding",
    value: function transformArrayBinding(term_11) {
      var _this2 = this;

      return new _terms2.default("ArrayBinding", { elements: term_11.elements.map(function (el) {
          return _this2.transform(el);
        }), restElement: term_11.restElement == null ? null : this.transform(term_11.restElement) });
    }
  }, {
    key: "transformBindingIdentifier",
    value: function transformBindingIdentifier(term_12) {
      var name_13 = term_12.name.addScope(this.scope, this.context.bindings);
      var newBinding_14 = (0, _symbol.gensym)(name_13.val());
      this.context.env.set(newBinding_14.toString(), new _transforms.VarBindingTransform(name_13));
      this.context.bindings.add(name_13, { binding: newBinding_14, phase: this.phase, skipDup: true });
      return new _terms2.default("BindingIdentifier", { name: name_13 });
    }
  }]);

  return ScopeApplyingReducer;
}();

exports.default = ScopeApplyingReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2FwcGx5LXNjb3BlLWluLXBhcmFtcy1yZWR1Y2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0lBQ3FCO0FBQ25CLFdBRG1CLG9CQUNuQixDQUFZLE9BQVosRUFBcUIsU0FBckIsRUFBNkM7UUFBYixnRUFBVSxpQkFBRzs7MEJBRDFCLHNCQUMwQjs7QUFDM0MsU0FBSyxPQUFMLEdBQWUsU0FBZixDQUQyQztBQUUzQyxTQUFLLEtBQUwsR0FBYSxPQUFiLENBRjJDO0FBRzNDLFNBQUssS0FBTCxHQUFhLE9BQWIsQ0FIMkM7R0FBN0M7O2VBRG1COzs4QkFNVCxRQUFRO0FBQ2hCLFVBQUksVUFBVSxjQUFjLE9BQU8sSUFBUCxDQURaO0FBRWhCLFVBQUksT0FBTyxLQUFLLE9BQUwsQ0FBUCxLQUF5QixVQUF6QixFQUFxQztBQUN2QyxlQUFPLEtBQUssT0FBTCxFQUFjLE1BQWQsQ0FBUCxDQUR1QztPQUF6QztBQUdBLDBCQUFPLEtBQVAsRUFBYyx3Q0FBd0MsT0FBTyxJQUFQLENBQXRELENBTGdCOzs7OzhDQU9RLFFBQVE7OztBQUNoQyxVQUFJLFNBQVMsT0FBTyxJQUFQLElBQWUsSUFBZixHQUFzQixJQUF0QixHQUE2QixLQUFLLFNBQUwsQ0FBZSxPQUFPLElBQVAsQ0FBNUMsQ0FEbUI7QUFFaEMsYUFBTyxvQkFBUyxrQkFBVCxFQUE2QixFQUFDLE9BQU8sT0FBTyxLQUFQLENBQWEsR0FBYixDQUFpQjtpQkFBTSxNQUFLLFNBQUwsQ0FBZSxFQUFmO1NBQU4sQ0FBeEIsRUFBbUQsTUFBTSxNQUFOLEVBQWpGLENBQVAsQ0FGZ0M7Ozs7Z0RBSU4sUUFBUTtBQUNsQyxhQUFPLG9CQUFTLG9CQUFULEVBQStCLEVBQUMsU0FBUyxLQUFLLFNBQUwsQ0FBZSxPQUFPLE9BQVAsQ0FBeEIsRUFBeUMsTUFBTSxPQUFPLElBQVAsRUFBL0UsQ0FBUCxDQURrQzs7OzsyQ0FHYixRQUFRO0FBQzdCLGFBQU8sTUFBUCxDQUQ2Qjs7Ozt1REFHSSxRQUFRO0FBQ3pDLGFBQU8sb0JBQVMsMkJBQVQsRUFBc0MsRUFBQyxTQUFTLEtBQUssU0FBTCxDQUFlLE9BQU8sT0FBUCxDQUF4QixFQUF5QyxNQUFNLE9BQU8sSUFBUCxFQUF0RixDQUFQLENBRHlDOzs7O3FEQUdWLFNBQVM7QUFDeEMsYUFBTyxvQkFBUyx5QkFBVCxFQUFvQyxFQUFDLE1BQU0sUUFBUSxJQUFSLEVBQWMsU0FBUyxLQUFLLFNBQUwsQ0FBZSxRQUFRLE9BQVIsQ0FBeEIsRUFBekQsQ0FBUCxDQUR3Qzs7OzswQ0FHcEIsU0FBUzs7O0FBQzdCLGFBQU8sb0JBQVMsY0FBVCxFQUF5QixFQUFDLFVBQVUsUUFBUSxRQUFSLENBQWlCLEdBQWpCLENBQXFCO2lCQUFNLE9BQUssU0FBTCxDQUFlLEVBQWY7U0FBTixDQUEvQixFQUEwRCxhQUFhLFFBQVEsV0FBUixJQUF1QixJQUF2QixHQUE4QixJQUE5QixHQUFxQyxLQUFLLFNBQUwsQ0FBZSxRQUFRLFdBQVIsQ0FBcEQsRUFBakcsQ0FBUCxDQUQ2Qjs7OzsrQ0FHSixTQUFTO0FBQ2xDLFVBQUksVUFBVSxRQUFRLElBQVIsQ0FBYSxRQUFiLENBQXNCLEtBQUssS0FBTCxFQUFZLEtBQUssT0FBTCxDQUFhLFFBQWIsQ0FBNUMsQ0FEOEI7QUFFbEMsVUFBSSxnQkFBZ0Isb0JBQU8sUUFBUSxHQUFSLEVBQVAsQ0FBaEIsQ0FGOEI7QUFHbEMsV0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixjQUFjLFFBQWQsRUFBckIsRUFBK0Msb0NBQXdCLE9BQXhCLENBQS9DLEVBSGtDO0FBSWxDLFdBQUssT0FBTCxDQUFhLFFBQWIsQ0FBc0IsR0FBdEIsQ0FBMEIsT0FBMUIsRUFBbUMsRUFBQyxTQUFTLGFBQVQsRUFBd0IsT0FBTyxLQUFLLEtBQUwsRUFBWSxTQUFTLElBQVQsRUFBL0UsRUFKa0M7QUFLbEMsYUFBTyxvQkFBUyxtQkFBVCxFQUE4QixFQUFDLE1BQU0sT0FBTixFQUEvQixDQUFQLENBTGtDOzs7O1NBaENqQiIsImZpbGUiOiJhcHBseS1zY29wZS1pbi1wYXJhbXMtcmVkdWNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXJtIGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge2dlbnN5bX0gZnJvbSBcIi4vc3ltYm9sXCI7XG5pbXBvcnQge1ZhckJpbmRpbmdUcmFuc2Zvcm19IGZyb20gXCIuL3RyYW5zZm9ybXNcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3BlQXBwbHlpbmdSZWR1Y2VyIHtcbiAgY29uc3RydWN0b3Ioc2NvcGVfMCwgY29udGV4dF8xLCBwaGFzZV8yID0gMCkge1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfMTtcbiAgICB0aGlzLnNjb3BlID0gc2NvcGVfMDtcbiAgICB0aGlzLnBoYXNlID0gcGhhc2VfMjtcbiAgfVxuICB0cmFuc2Zvcm0odGVybV8zKSB7XG4gICAgbGV0IGZpZWxkXzQgPSBcInRyYW5zZm9ybVwiICsgdGVybV8zLnR5cGU7XG4gICAgaWYgKHR5cGVvZiB0aGlzW2ZpZWxkXzRdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiB0aGlzW2ZpZWxkXzRdKHRlcm1fMyk7XG4gICAgfVxuICAgIGFzc2VydChmYWxzZSwgXCJ0cmFuc2Zvcm0gbm90IGltcGxlbWVudGVkIHlldCBmb3I6IFwiICsgdGVybV8zLnR5cGUpO1xuICB9XG4gIHRyYW5zZm9ybUZvcm1hbFBhcmFtZXRlcnModGVybV81KSB7XG4gICAgbGV0IHJlc3RfNiA9IHRlcm1fNS5yZXN0ID09IG51bGwgPyBudWxsIDogdGhpcy50cmFuc2Zvcm0odGVybV81LnJlc3QpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiB0ZXJtXzUuaXRlbXMubWFwKGl0ID0+IHRoaXMudHJhbnNmb3JtKGl0KSksIHJlc3Q6IHJlc3RfNn0pO1xuICB9XG4gIHRyYW5zZm9ybUJpbmRpbmdXaXRoRGVmYXVsdCh0ZXJtXzcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IHRoaXMudHJhbnNmb3JtKHRlcm1fNy5iaW5kaW5nKSwgaW5pdDogdGVybV83LmluaXR9KTtcbiAgfVxuICB0cmFuc2Zvcm1PYmplY3RCaW5kaW5nKHRlcm1fOCkge1xuICAgIHJldHVybiB0ZXJtXzg7XG4gIH1cbiAgdHJhbnNmb3JtQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllcih0ZXJtXzkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIsIHtiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybSh0ZXJtXzkuYmluZGluZyksIGluaXQ6IHRlcm1fOS5pbml0fSk7XG4gIH1cbiAgdHJhbnNmb3JtQmluZGluZ1Byb3BlcnR5UHJvcGVydHkodGVybV8xMCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtuYW1lOiB0ZXJtXzEwLm5hbWUsIGJpbmRpbmc6IHRoaXMudHJhbnNmb3JtKHRlcm1fMTAuYmluZGluZyl9KTtcbiAgfVxuICB0cmFuc2Zvcm1BcnJheUJpbmRpbmcodGVybV8xMSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IHRlcm1fMTEuZWxlbWVudHMubWFwKGVsID0+IHRoaXMudHJhbnNmb3JtKGVsKSksIHJlc3RFbGVtZW50OiB0ZXJtXzExLnJlc3RFbGVtZW50ID09IG51bGwgPyBudWxsIDogdGhpcy50cmFuc2Zvcm0odGVybV8xMS5yZXN0RWxlbWVudCl9KTtcbiAgfVxuICB0cmFuc2Zvcm1CaW5kaW5nSWRlbnRpZmllcih0ZXJtXzEyKSB7XG4gICAgbGV0IG5hbWVfMTMgPSB0ZXJtXzEyLm5hbWUuYWRkU2NvcGUodGhpcy5zY29wZSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzKTtcbiAgICBsZXQgbmV3QmluZGluZ18xNCA9IGdlbnN5bShuYW1lXzEzLnZhbCgpKTtcbiAgICB0aGlzLmNvbnRleHQuZW52LnNldChuZXdCaW5kaW5nXzE0LnRvU3RyaW5nKCksIG5ldyBWYXJCaW5kaW5nVHJhbnNmb3JtKG5hbWVfMTMpKTtcbiAgICB0aGlzLmNvbnRleHQuYmluZGluZ3MuYWRkKG5hbWVfMTMsIHtiaW5kaW5nOiBuZXdCaW5kaW5nXzE0LCBwaGFzZTogdGhpcy5waGFzZSwgc2tpcER1cDogdHJ1ZX0pO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lXzEzfSk7XG4gIH1cbn1cbiJdfQ==