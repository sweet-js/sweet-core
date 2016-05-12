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
      return new _terms2.default("FormalParameters", { items: term_5.items.map(function (it_7) {
          return _this.transform(it_7);
        }), rest: rest_6 });
    }
  }, {
    key: "transformBindingWithDefault",
    value: function transformBindingWithDefault(term_8) {
      return new _terms2.default("BindingWithDefault", { binding: this.transform(term_8.binding), init: term_8.init });
    }
  }, {
    key: "transformObjectBinding",
    value: function transformObjectBinding(term_9) {
      return term_9;
    }
  }, {
    key: "transformBindingPropertyIdentifier",
    value: function transformBindingPropertyIdentifier(term_10) {
      return new _terms2.default("BindingPropertyIdentifier", { binding: this.transform(term_10.binding), init: term_10.init });
    }
  }, {
    key: "transformBindingPropertyProperty",
    value: function transformBindingPropertyProperty(term_11) {
      return new _terms2.default("BindingPropertyProperty", { name: term_11.name, binding: this.transform(term_11.binding) });
    }
  }, {
    key: "transformArrayBinding",
    value: function transformArrayBinding(term_12) {
      var _this2 = this;

      return new _terms2.default("ArrayBinding", { elements: term_12.elements.map(function (el_13) {
          return _this2.transform(el_13);
        }), restElement: term_12.restElement == null ? null : this.transform(term_12.restElement) });
    }
  }, {
    key: "transformBindingIdentifier",
    value: function transformBindingIdentifier(term_14) {
      var name_15 = term_14.name.addScope(this.scope, this.context.bindings);
      var newBinding_16 = (0, _symbol.gensym)(name_15.val());
      this.context.env.set(newBinding_16.toString(), new _transforms.VarBindingTransform(name_15));
      this.context.bindings.add(name_15, { binding: newBinding_16, phase: this.phase, skipDup: true });
      return new _terms2.default("BindingIdentifier", { name: name_15 });
    }
  }]);

  return ScopeApplyingReducer;
}();

exports.default = ScopeApplyingReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2FwcGx5LXNjb3BlLWluLXBhcmFtcy1yZWR1Y2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0lBQ3FCLG9CO0FBQ25CLGdDQUFZLE9BQVosRUFBcUIsU0FBckIsRUFBNkM7QUFBQSxRQUFiLE9BQWEseURBQUgsQ0FBRzs7QUFBQTs7QUFDM0MsU0FBSyxPQUFMLEdBQWUsU0FBZjtBQUNBLFNBQUssS0FBTCxHQUFhLE9BQWI7QUFDQSxTQUFLLEtBQUwsR0FBYSxPQUFiO0FBQ0Q7Ozs7OEJBQ1MsTSxFQUFRO0FBQ2hCLFVBQUksVUFBVSxjQUFjLE9BQU8sSUFBbkM7QUFDQSxVQUFJLE9BQU8sS0FBSyxPQUFMLENBQVAsS0FBeUIsVUFBN0IsRUFBeUM7QUFDdkMsZUFBTyxLQUFLLE9BQUwsRUFBYyxNQUFkLENBQVA7QUFDRDtBQUNELDBCQUFPLEtBQVAsRUFBYyx3Q0FBd0MsT0FBTyxJQUE3RDtBQUNEOzs7OENBQ3lCLE0sRUFBUTtBQUFBOztBQUNoQyxVQUFJLFNBQVMsT0FBTyxJQUFQLElBQWUsSUFBZixHQUFzQixJQUF0QixHQUE2QixLQUFLLFNBQUwsQ0FBZSxPQUFPLElBQXRCLENBQTFDO0FBQ0EsYUFBTyxvQkFBUyxrQkFBVCxFQUE2QixFQUFDLE9BQU8sT0FBTyxLQUFQLENBQWEsR0FBYixDQUFpQjtBQUFBLGlCQUFRLE1BQUssU0FBTCxDQUFlLElBQWYsQ0FBUjtBQUFBLFNBQWpCLENBQVIsRUFBd0QsTUFBTSxNQUE5RCxFQUE3QixDQUFQO0FBQ0Q7OztnREFDMkIsTSxFQUFRO0FBQ2xDLGFBQU8sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxTQUFTLEtBQUssU0FBTCxDQUFlLE9BQU8sT0FBdEIsQ0FBVixFQUEwQyxNQUFNLE9BQU8sSUFBdkQsRUFBL0IsQ0FBUDtBQUNEOzs7MkNBQ3NCLE0sRUFBUTtBQUM3QixhQUFPLE1BQVA7QUFDRDs7O3VEQUNrQyxPLEVBQVM7QUFDMUMsYUFBTyxvQkFBUywyQkFBVCxFQUFzQyxFQUFDLFNBQVMsS0FBSyxTQUFMLENBQWUsUUFBUSxPQUF2QixDQUFWLEVBQTJDLE1BQU0sUUFBUSxJQUF6RCxFQUF0QyxDQUFQO0FBQ0Q7OztxREFDZ0MsTyxFQUFTO0FBQ3hDLGFBQU8sb0JBQVMseUJBQVQsRUFBb0MsRUFBQyxNQUFNLFFBQVEsSUFBZixFQUFxQixTQUFTLEtBQUssU0FBTCxDQUFlLFFBQVEsT0FBdkIsQ0FBOUIsRUFBcEMsQ0FBUDtBQUNEOzs7MENBQ3FCLE8sRUFBUztBQUFBOztBQUM3QixhQUFPLG9CQUFTLGNBQVQsRUFBeUIsRUFBQyxVQUFVLFFBQVEsUUFBUixDQUFpQixHQUFqQixDQUFxQjtBQUFBLGlCQUFTLE9BQUssU0FBTCxDQUFlLEtBQWYsQ0FBVDtBQUFBLFNBQXJCLENBQVgsRUFBaUUsYUFBYSxRQUFRLFdBQVIsSUFBdUIsSUFBdkIsR0FBOEIsSUFBOUIsR0FBcUMsS0FBSyxTQUFMLENBQWUsUUFBUSxXQUF2QixDQUFuSCxFQUF6QixDQUFQO0FBQ0Q7OzsrQ0FDMEIsTyxFQUFTO0FBQ2xDLFVBQUksVUFBVSxRQUFRLElBQVIsQ0FBYSxRQUFiLENBQXNCLEtBQUssS0FBM0IsRUFBa0MsS0FBSyxPQUFMLENBQWEsUUFBL0MsQ0FBZDtBQUNBLFVBQUksZ0JBQWdCLG9CQUFPLFFBQVEsR0FBUixFQUFQLENBQXBCO0FBQ0EsV0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixjQUFjLFFBQWQsRUFBckIsRUFBK0Msb0NBQXdCLE9BQXhCLENBQS9DO0FBQ0EsV0FBSyxPQUFMLENBQWEsUUFBYixDQUFzQixHQUF0QixDQUEwQixPQUExQixFQUFtQyxFQUFDLFNBQVMsYUFBVixFQUF5QixPQUFPLEtBQUssS0FBckMsRUFBNEMsU0FBUyxJQUFyRCxFQUFuQztBQUNBLGFBQU8sb0JBQVMsbUJBQVQsRUFBOEIsRUFBQyxNQUFNLE9BQVAsRUFBOUIsQ0FBUDtBQUNEOzs7Ozs7a0JBdENrQixvQiIsImZpbGUiOiJhcHBseS1zY29wZS1pbi1wYXJhbXMtcmVkdWNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXJtIGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge2dlbnN5bX0gZnJvbSBcIi4vc3ltYm9sXCI7XG5pbXBvcnQge1ZhckJpbmRpbmdUcmFuc2Zvcm19IGZyb20gXCIuL3RyYW5zZm9ybXNcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3BlQXBwbHlpbmdSZWR1Y2VyIHtcbiAgY29uc3RydWN0b3Ioc2NvcGVfMCwgY29udGV4dF8xLCBwaGFzZV8yID0gMCkge1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfMTtcbiAgICB0aGlzLnNjb3BlID0gc2NvcGVfMDtcbiAgICB0aGlzLnBoYXNlID0gcGhhc2VfMjtcbiAgfVxuICB0cmFuc2Zvcm0odGVybV8zKSB7XG4gICAgbGV0IGZpZWxkXzQgPSBcInRyYW5zZm9ybVwiICsgdGVybV8zLnR5cGU7XG4gICAgaWYgKHR5cGVvZiB0aGlzW2ZpZWxkXzRdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiB0aGlzW2ZpZWxkXzRdKHRlcm1fMyk7XG4gICAgfVxuICAgIGFzc2VydChmYWxzZSwgXCJ0cmFuc2Zvcm0gbm90IGltcGxlbWVudGVkIHlldCBmb3I6IFwiICsgdGVybV8zLnR5cGUpO1xuICB9XG4gIHRyYW5zZm9ybUZvcm1hbFBhcmFtZXRlcnModGVybV81KSB7XG4gICAgbGV0IHJlc3RfNiA9IHRlcm1fNS5yZXN0ID09IG51bGwgPyBudWxsIDogdGhpcy50cmFuc2Zvcm0odGVybV81LnJlc3QpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiB0ZXJtXzUuaXRlbXMubWFwKGl0XzcgPT4gdGhpcy50cmFuc2Zvcm0oaXRfNykpLCByZXN0OiByZXN0XzZ9KTtcbiAgfVxuICB0cmFuc2Zvcm1CaW5kaW5nV2l0aERlZmF1bHQodGVybV84KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybSh0ZXJtXzguYmluZGluZyksIGluaXQ6IHRlcm1fOC5pbml0fSk7XG4gIH1cbiAgdHJhbnNmb3JtT2JqZWN0QmluZGluZyh0ZXJtXzkpIHtcbiAgICByZXR1cm4gdGVybV85O1xuICB9XG4gIHRyYW5zZm9ybUJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIodGVybV8xMCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2JpbmRpbmc6IHRoaXMudHJhbnNmb3JtKHRlcm1fMTAuYmluZGluZyksIGluaXQ6IHRlcm1fMTAuaW5pdH0pO1xuICB9XG4gIHRyYW5zZm9ybUJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5KHRlcm1fMTEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGVybV8xMS5uYW1lLCBiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybSh0ZXJtXzExLmJpbmRpbmcpfSk7XG4gIH1cbiAgdHJhbnNmb3JtQXJyYXlCaW5kaW5nKHRlcm1fMTIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiB0ZXJtXzEyLmVsZW1lbnRzLm1hcChlbF8xMyA9PiB0aGlzLnRyYW5zZm9ybShlbF8xMykpLCByZXN0RWxlbWVudDogdGVybV8xMi5yZXN0RWxlbWVudCA9PSBudWxsID8gbnVsbCA6IHRoaXMudHJhbnNmb3JtKHRlcm1fMTIucmVzdEVsZW1lbnQpfSk7XG4gIH1cbiAgdHJhbnNmb3JtQmluZGluZ0lkZW50aWZpZXIodGVybV8xNCkge1xuICAgIGxldCBuYW1lXzE1ID0gdGVybV8xNC5uYW1lLmFkZFNjb3BlKHRoaXMuc2NvcGUsIHRoaXMuY29udGV4dC5iaW5kaW5ncyk7XG4gICAgbGV0IG5ld0JpbmRpbmdfMTYgPSBnZW5zeW0obmFtZV8xNS52YWwoKSk7XG4gICAgdGhpcy5jb250ZXh0LmVudi5zZXQobmV3QmluZGluZ18xNi50b1N0cmluZygpLCBuZXcgVmFyQmluZGluZ1RyYW5zZm9ybShuYW1lXzE1KSk7XG4gICAgdGhpcy5jb250ZXh0LmJpbmRpbmdzLmFkZChuYW1lXzE1LCB7YmluZGluZzogbmV3QmluZGluZ18xNiwgcGhhc2U6IHRoaXMucGhhc2UsIHNraXBEdXA6IHRydWV9KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogbmFtZV8xNX0pO1xuICB9XG59XG4iXX0=