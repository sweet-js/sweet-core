"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _symbol = require("./symbol");

var _transforms = require("./transforms");

var _errors = require("./errors");

var _syntax = require("./syntax");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ScopeApplyingReducer {
  constructor(scope, context) {
    this.context = context;
    this.scope = scope;
  }

  transform(term) {
    let field = "transform" + term.type;
    if (typeof this[field] === 'function') {
      return this[field](term);
    }
    (0, _errors.assert)(false, "transform not implemented yet for: " + term.type);
  }

  transformFormalParameters(term) {
    let rest = term.rest == null ? null : this.transform(term.rest);
    return new _terms2.default('FormalParameters', {
      items: term.items.map(it => this.transform(it)),
      rest: rest
    });
  }

  transformBindingWithDefault(term) {
    return new _terms2.default('BindingWithDefault', {
      binding: this.transform(term.binding),
      init: term.init
    });
  }

  transformObjectBinding(term) {
    // TODO: much more complicated logic here
    return term;
    // return new Term('ObjectBinding', {
    //   properties: term.properties.map(prop => this.transform(prop))
    // });
  }

  transformBindingPropertyIdentifier(term) {
    return new _terms2.default('BindingPropertyIdentifier', {
      binding: this.transform(term.binding),
      init: term.init
    });
  }

  transformBindingPropertyProperty(term) {
    return new _terms2.default('BindingPropertyProperty', {
      name: term.name,
      binding: this.transform(term.binding)
    });
  }

  transformArrayBinding(term) {
    return new _terms2.default('ArrayBinding', {
      elements: term.elements.map(el => this.transform(el)),
      restElement: term.restElement == null ? null : this.transform(term.restElement)
    });
  }

  transformBindingIdentifier(term) {
    let name = term.name.addScope(this.scope, this.context.bindings, _syntax.ALL_PHASES);
    let newBinding = (0, _symbol.gensym)(name.val());

    this.context.env.set(newBinding.toString(), new _transforms.VarBindingTransform(name));
    this.context.bindings.add(name, {
      binding: newBinding,
      phase: this.context.phase,
      skipDup: true
    });

    return new _terms2.default("BindingIdentifier", { name: name });
  }
}
exports.default = ScopeApplyingReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcHBseS1zY29wZS1pbi1wYXJhbXMtcmVkdWNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRWUsTUFBTSxvQkFBTixDQUEyQjtBQUN4QyxjQUFZLEtBQVosRUFBbUIsT0FBbkIsRUFBNEI7QUFDMUIsU0FBSyxPQUFMLEdBQWUsT0FBZjtBQUNBLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDRDs7QUFFRCxZQUFVLElBQVYsRUFBZ0I7QUFDZCxRQUFJLFFBQVEsY0FBYyxLQUFLLElBQS9CO0FBQ0EsUUFBSSxPQUFPLEtBQUssS0FBTCxDQUFQLEtBQXVCLFVBQTNCLEVBQXVDO0FBQ3JDLGFBQU8sS0FBSyxLQUFMLEVBQVksSUFBWixDQUFQO0FBQ0Q7QUFDRCx3QkFBTyxLQUFQLEVBQWMsd0NBQXdDLEtBQUssSUFBM0Q7QUFDRDs7QUFFRCw0QkFBMEIsSUFBMUIsRUFBZ0M7QUFDOUIsUUFBSSxPQUFPLEtBQUssSUFBTCxJQUFhLElBQWIsR0FBb0IsSUFBcEIsR0FBMkIsS0FBSyxTQUFMLENBQWUsS0FBSyxJQUFwQixDQUF0QztBQUNBLFdBQU8sb0JBQVMsa0JBQVQsRUFBNkI7QUFDbEMsYUFBTyxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsTUFBTSxLQUFLLFNBQUwsQ0FBZSxFQUFmLENBQXJCLENBRDJCO0FBRWxDO0FBRmtDLEtBQTdCLENBQVA7QUFJRDs7QUFHRCw4QkFBNEIsSUFBNUIsRUFBa0M7QUFDaEMsV0FBTyxvQkFBUyxvQkFBVCxFQUErQjtBQUNwQyxlQUFTLEtBQUssU0FBTCxDQUFlLEtBQUssT0FBcEIsQ0FEMkI7QUFFcEMsWUFBTSxLQUFLO0FBRnlCLEtBQS9CLENBQVA7QUFJRDs7QUFFRCx5QkFBdUIsSUFBdkIsRUFBNkI7QUFDM0I7QUFDQSxXQUFPLElBQVA7QUFDQTtBQUNBO0FBQ0E7QUFDRDs7QUFFRCxxQ0FBbUMsSUFBbkMsRUFBeUM7QUFDdkMsV0FBTyxvQkFBUywyQkFBVCxFQUFzQztBQUMzQyxlQUFTLEtBQUssU0FBTCxDQUFlLEtBQUssT0FBcEIsQ0FEa0M7QUFFM0MsWUFBTSxLQUFLO0FBRmdDLEtBQXRDLENBQVA7QUFJRDs7QUFFRCxtQ0FBaUMsSUFBakMsRUFBdUM7QUFDckMsV0FBTyxvQkFBUyx5QkFBVCxFQUFvQztBQUN6QyxZQUFNLEtBQUssSUFEOEI7QUFFekMsZUFBUyxLQUFLLFNBQUwsQ0FBZSxLQUFLLE9BQXBCO0FBRmdDLEtBQXBDLENBQVA7QUFJRDs7QUFFRCx3QkFBc0IsSUFBdEIsRUFBNEI7QUFDMUIsV0FBTyxvQkFBUyxjQUFULEVBQXlCO0FBQzlCLGdCQUFVLEtBQUssUUFBTCxDQUFjLEdBQWQsQ0FBa0IsTUFBTSxLQUFLLFNBQUwsQ0FBZSxFQUFmLENBQXhCLENBRG9CO0FBRTlCLG1CQUFhLEtBQUssV0FBTCxJQUFvQixJQUFwQixHQUEyQixJQUEzQixHQUFrQyxLQUFLLFNBQUwsQ0FBZSxLQUFLLFdBQXBCO0FBRmpCLEtBQXpCLENBQVA7QUFJRDs7QUFFRCw2QkFBMkIsSUFBM0IsRUFBaUM7QUFDL0IsUUFBSSxPQUFPLEtBQUssSUFBTCxDQUFVLFFBQVYsQ0FBbUIsS0FBSyxLQUF4QixFQUErQixLQUFLLE9BQUwsQ0FBYSxRQUE1QyxxQkFBWDtBQUNBLFFBQUksYUFBYSxvQkFBTyxLQUFLLEdBQUwsRUFBUCxDQUFqQjs7QUFFQSxTQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLEdBQWpCLENBQXFCLFdBQVcsUUFBWCxFQUFyQixFQUE0QyxvQ0FBd0IsSUFBeEIsQ0FBNUM7QUFDQSxTQUFLLE9BQUwsQ0FBYSxRQUFiLENBQXNCLEdBQXRCLENBQTBCLElBQTFCLEVBQWdDO0FBQzlCLGVBQVMsVUFEcUI7QUFFOUIsYUFBTyxLQUFLLE9BQUwsQ0FBYSxLQUZVO0FBRzlCLGVBQVM7QUFIcUIsS0FBaEM7O0FBTUEsV0FBTyxvQkFBUyxtQkFBVCxFQUE4QixFQUFFLFVBQUYsRUFBOUIsQ0FBUDtBQUNEO0FBdkV1QztrQkFBckIsb0IiLCJmaWxlIjoiYXBwbHktc2NvcGUtaW4tcGFyYW1zLXJlZHVjZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGVybSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHsgZ2Vuc3ltIH0gZnJvbSBcIi4vc3ltYm9sXCI7XG5pbXBvcnQgeyBWYXJCaW5kaW5nVHJhbnNmb3JtIH0gZnJvbSBcIi4vdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IHthc3NlcnR9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IEFMTF9QSEFTRVMgfSBmcm9tICcuL3N5bnRheCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3BlQXBwbHlpbmdSZWR1Y2VyIHtcbiAgY29uc3RydWN0b3Ioc2NvcGUsIGNvbnRleHQpIHtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgIHRoaXMuc2NvcGUgPSBzY29wZTtcbiAgfVxuXG4gIHRyYW5zZm9ybSh0ZXJtKSB7XG4gICAgbGV0IGZpZWxkID0gXCJ0cmFuc2Zvcm1cIiArIHRlcm0udHlwZTtcbiAgICBpZiAodHlwZW9mIHRoaXNbZmllbGRdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpc1tmaWVsZF0odGVybSk7XG4gICAgfVxuICAgIGFzc2VydChmYWxzZSwgXCJ0cmFuc2Zvcm0gbm90IGltcGxlbWVudGVkIHlldCBmb3I6IFwiICsgdGVybS50eXBlKTtcbiAgfVxuXG4gIHRyYW5zZm9ybUZvcm1hbFBhcmFtZXRlcnModGVybSkge1xuICAgIGxldCByZXN0ID0gdGVybS5yZXN0ID09IG51bGwgPyBudWxsIDogdGhpcy50cmFuc2Zvcm0odGVybS5yZXN0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ0Zvcm1hbFBhcmFtZXRlcnMnLCB7XG4gICAgICBpdGVtczogdGVybS5pdGVtcy5tYXAoaXQgPT4gdGhpcy50cmFuc2Zvcm0oaXQpKSxcbiAgICAgIHJlc3RcbiAgICB9KTtcbiAgfVxuXG5cbiAgdHJhbnNmb3JtQmluZGluZ1dpdGhEZWZhdWx0KHRlcm0pIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ0JpbmRpbmdXaXRoRGVmYXVsdCcsIHtcbiAgICAgIGJpbmRpbmc6IHRoaXMudHJhbnNmb3JtKHRlcm0uYmluZGluZyksXG4gICAgICBpbml0OiB0ZXJtLmluaXRcbiAgICB9KTtcbiAgfVxuXG4gIHRyYW5zZm9ybU9iamVjdEJpbmRpbmcodGVybSkge1xuICAgIC8vIFRPRE86IG11Y2ggbW9yZSBjb21wbGljYXRlZCBsb2dpYyBoZXJlXG4gICAgcmV0dXJuIHRlcm07XG4gICAgLy8gcmV0dXJuIG5ldyBUZXJtKCdPYmplY3RCaW5kaW5nJywge1xuICAgIC8vICAgcHJvcGVydGllczogdGVybS5wcm9wZXJ0aWVzLm1hcChwcm9wID0+IHRoaXMudHJhbnNmb3JtKHByb3ApKVxuICAgIC8vIH0pO1xuICB9XG5cbiAgdHJhbnNmb3JtQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllcih0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyJywge1xuICAgICAgYmluZGluZzogdGhpcy50cmFuc2Zvcm0odGVybS5iaW5kaW5nKSxcbiAgICAgIGluaXQ6IHRlcm0uaW5pdFxuICAgIH0pO1xuICB9XG5cbiAgdHJhbnNmb3JtQmluZGluZ1Byb3BlcnR5UHJvcGVydHkodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnQmluZGluZ1Byb3BlcnR5UHJvcGVydHknLCB7XG4gICAgICBuYW1lOiB0ZXJtLm5hbWUsXG4gICAgICBiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybSh0ZXJtLmJpbmRpbmcpXG4gICAgfSk7XG4gIH1cblxuICB0cmFuc2Zvcm1BcnJheUJpbmRpbmcodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnQXJyYXlCaW5kaW5nJywge1xuICAgICAgZWxlbWVudHM6IHRlcm0uZWxlbWVudHMubWFwKGVsID0+IHRoaXMudHJhbnNmb3JtKGVsKSksXG4gICAgICByZXN0RWxlbWVudDogdGVybS5yZXN0RWxlbWVudCA9PSBudWxsID8gbnVsbCA6IHRoaXMudHJhbnNmb3JtKHRlcm0ucmVzdEVsZW1lbnQpXG4gICAgfSk7XG4gIH1cblxuICB0cmFuc2Zvcm1CaW5kaW5nSWRlbnRpZmllcih0ZXJtKSB7XG4gICAgbGV0IG5hbWUgPSB0ZXJtLm5hbWUuYWRkU2NvcGUodGhpcy5zY29wZSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTKTtcbiAgICBsZXQgbmV3QmluZGluZyA9IGdlbnN5bShuYW1lLnZhbCgpKTtcblxuICAgIHRoaXMuY29udGV4dC5lbnYuc2V0KG5ld0JpbmRpbmcudG9TdHJpbmcoKSwgbmV3IFZhckJpbmRpbmdUcmFuc2Zvcm0obmFtZSkpO1xuICAgIHRoaXMuY29udGV4dC5iaW5kaW5ncy5hZGQobmFtZSwge1xuICAgICAgYmluZGluZzogbmV3QmluZGluZyxcbiAgICAgIHBoYXNlOiB0aGlzLmNvbnRleHQucGhhc2UsXG4gICAgICBza2lwRHVwOiB0cnVlXG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7IG5hbWUgfSk7XG4gIH1cbn1cbiJdfQ==