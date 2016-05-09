"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _symbol = require("./symbol");

var _transforms = require("./transforms");

var _errors = require("./errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScopeApplyingReducer = (function () {
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
})();

exports.default = ScopeApplyingReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2FwcGx5LXNjb3BlLWluLXBhcmFtcy1yZWR1Y2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFJcUIsb0JBQW9CO0FBQ3ZDLFdBRG1CLG9CQUFvQixDQUMzQixPQUFPLEVBQUUsU0FBUyxFQUFlO1FBQWIsT0FBTyx5REFBRyxDQUFDOzswQkFEeEIsb0JBQW9COztBQUVyQyxRQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUN6QixRQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztBQUNyQixRQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztHQUN0Qjs7ZUFMa0Isb0JBQW9COzs4QkFNN0IsTUFBTSxFQUFFO0FBQ2hCLFVBQUksT0FBTyxHQUFHLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3hDLFVBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssVUFBVSxFQUFFO0FBQ3ZDLGVBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQzlCO0FBQ0QsMEJBQU8sS0FBSyxFQUFFLHFDQUFxQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNwRTs7OzhDQUN5QixNQUFNLEVBQUU7OztBQUNoQyxVQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEUsYUFBTyxvQkFBUyxrQkFBa0IsRUFBRSxFQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7aUJBQUksTUFBSyxTQUFTLENBQUMsSUFBSSxDQUFDO1NBQUEsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO0tBQzVHOzs7Z0RBQzJCLE1BQU0sRUFBRTtBQUNsQyxhQUFPLG9CQUFTLG9CQUFvQixFQUFFLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztLQUNyRzs7OzJDQUNzQixNQUFNLEVBQUU7QUFDN0IsYUFBTyxNQUFNLENBQUM7S0FDZjs7O3VEQUNrQyxPQUFPLEVBQUU7QUFDMUMsYUFBTyxvQkFBUywyQkFBMkIsRUFBRSxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7S0FDOUc7OztxREFDZ0MsT0FBTyxFQUFFO0FBQ3hDLGFBQU8sb0JBQVMseUJBQXlCLEVBQUUsRUFBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQzVHOzs7MENBQ3FCLE9BQU8sRUFBRTs7O0FBQzdCLGFBQU8sb0JBQVMsY0FBYyxFQUFFLEVBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztpQkFBSSxPQUFLLFNBQVMsQ0FBQyxLQUFLLENBQUM7U0FBQSxDQUFDLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDMUw7OzsrQ0FDMEIsT0FBTyxFQUFFO0FBQ2xDLFVBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2RSxVQUFJLGFBQWEsR0FBRyxvQkFBTyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLG9DQUF3QixPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLFVBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBQy9GLGFBQU8sb0JBQVMsbUJBQW1CLEVBQUUsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztLQUN2RDs7O1NBdENrQixvQkFBb0I7OztrQkFBcEIsb0JBQW9CIiwiZmlsZSI6ImFwcGx5LXNjb3BlLWluLXBhcmFtcy1yZWR1Y2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlcm0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7Z2Vuc3ltfSBmcm9tIFwiLi9zeW1ib2xcIjtcbmltcG9ydCB7VmFyQmluZGluZ1RyYW5zZm9ybX0gZnJvbSBcIi4vdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IHthc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NvcGVBcHBseWluZ1JlZHVjZXIge1xuICBjb25zdHJ1Y3RvcihzY29wZV8wLCBjb250ZXh0XzEsIHBoYXNlXzIgPSAwKSB7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF8xO1xuICAgIHRoaXMuc2NvcGUgPSBzY29wZV8wO1xuICAgIHRoaXMucGhhc2UgPSBwaGFzZV8yO1xuICB9XG4gIHRyYW5zZm9ybSh0ZXJtXzMpIHtcbiAgICBsZXQgZmllbGRfNCA9IFwidHJhbnNmb3JtXCIgKyB0ZXJtXzMudHlwZTtcbiAgICBpZiAodHlwZW9mIHRoaXNbZmllbGRfNF0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIHRoaXNbZmllbGRfNF0odGVybV8zKTtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcInRyYW5zZm9ybSBub3QgaW1wbGVtZW50ZWQgeWV0IGZvcjogXCIgKyB0ZXJtXzMudHlwZSk7XG4gIH1cbiAgdHJhbnNmb3JtRm9ybWFsUGFyYW1ldGVycyh0ZXJtXzUpIHtcbiAgICBsZXQgcmVzdF82ID0gdGVybV81LnJlc3QgPT0gbnVsbCA/IG51bGwgOiB0aGlzLnRyYW5zZm9ybSh0ZXJtXzUucmVzdCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9ybWFsUGFyYW1ldGVyc1wiLCB7aXRlbXM6IHRlcm1fNS5pdGVtcy5tYXAoaXRfNyA9PiB0aGlzLnRyYW5zZm9ybShpdF83KSksIHJlc3Q6IHJlc3RfNn0pO1xuICB9XG4gIHRyYW5zZm9ybUJpbmRpbmdXaXRoRGVmYXVsdCh0ZXJtXzgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IHRoaXMudHJhbnNmb3JtKHRlcm1fOC5iaW5kaW5nKSwgaW5pdDogdGVybV84LmluaXR9KTtcbiAgfVxuICB0cmFuc2Zvcm1PYmplY3RCaW5kaW5nKHRlcm1fOSkge1xuICAgIHJldHVybiB0ZXJtXzk7XG4gIH1cbiAgdHJhbnNmb3JtQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllcih0ZXJtXzEwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiLCB7YmluZGluZzogdGhpcy50cmFuc2Zvcm0odGVybV8xMC5iaW5kaW5nKSwgaW5pdDogdGVybV8xMC5pbml0fSk7XG4gIH1cbiAgdHJhbnNmb3JtQmluZGluZ1Byb3BlcnR5UHJvcGVydHkodGVybV8xMSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtuYW1lOiB0ZXJtXzExLm5hbWUsIGJpbmRpbmc6IHRoaXMudHJhbnNmb3JtKHRlcm1fMTEuYmluZGluZyl9KTtcbiAgfVxuICB0cmFuc2Zvcm1BcnJheUJpbmRpbmcodGVybV8xMikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IHRlcm1fMTIuZWxlbWVudHMubWFwKGVsXzEzID0+IHRoaXMudHJhbnNmb3JtKGVsXzEzKSksIHJlc3RFbGVtZW50OiB0ZXJtXzEyLnJlc3RFbGVtZW50ID09IG51bGwgPyBudWxsIDogdGhpcy50cmFuc2Zvcm0odGVybV8xMi5yZXN0RWxlbWVudCl9KTtcbiAgfVxuICB0cmFuc2Zvcm1CaW5kaW5nSWRlbnRpZmllcih0ZXJtXzE0KSB7XG4gICAgbGV0IG5hbWVfMTUgPSB0ZXJtXzE0Lm5hbWUuYWRkU2NvcGUodGhpcy5zY29wZSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzKTtcbiAgICBsZXQgbmV3QmluZGluZ18xNiA9IGdlbnN5bShuYW1lXzE1LnZhbCgpKTtcbiAgICB0aGlzLmNvbnRleHQuZW52LnNldChuZXdCaW5kaW5nXzE2LnRvU3RyaW5nKCksIG5ldyBWYXJCaW5kaW5nVHJhbnNmb3JtKG5hbWVfMTUpKTtcbiAgICB0aGlzLmNvbnRleHQuYmluZGluZ3MuYWRkKG5hbWVfMTUsIHtiaW5kaW5nOiBuZXdCaW5kaW5nXzE2LCBwaGFzZTogdGhpcy5waGFzZSwgc2tpcER1cDogdHJ1ZX0pO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lXzE1fSk7XG4gIH1cbn1cbiJdfQ==