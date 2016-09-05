'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CollectBindingSyntax = undefined;
exports.collectBindings = collectBindings;

var _immutable = require('immutable');

var _astDispatcher = require('./ast-dispatcher');

var _astDispatcher2 = _interopRequireDefault(_astDispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CollectBindingSyntax extends _astDispatcher2.default {
  constructor() {
    super('collect', true);
    this.names = (0, _immutable.List)();
  }

  // registerSyntax(stx) {
  //   let newBinding = gensym(stx.val());
  //   this.context.bindings.add(stx, {
  //     binding: newBinding,
  //     phase: this.context.phase,
  //     // skip dup because js allows variable redeclarations
  //     // (technically only for `var` but we can let later stages of the pipeline
  //     // handle incorrect redeclarations of `const` and `let`)
  //     skipDup: true
  //   });
  //   return stx;
  // }

  collect(term) {
    return this.dispatch(term);
  }

  collectBindingIdentifier(term) {
    return this.names.concat(term.name);
  }

  collectBindingPropertyIdentifier(term) {
    return this.collect(term.binding);
  }

  collectBindingPropertyProperty(term) {
    return this.collect(term.binding);
  }

  collectArrayBinding(term) {
    let restElement = null;
    if (term.restElement != null) {
      restElement = this.collect(term.restElement);
    }
    return this.names.concat(restElement).concat(term.elements.filter(el => el != null).flatMap(el => this.collect(el)));
  }

  collectObjectBinding() {
    // return term.properties.flatMap(prop => this.collect(prop));
    return (0, _immutable.List)();
  }

  // registerVariableDeclaration(term) {
  //   let declarators = term.declarators.map(decl => {
  //     return decl.extend({
  //       binding: this.register(decl.binding)
  //     });
  //   });
  //   return term.extend({ declarators });
  // }
  //
  // registerFunctionDeclaration(term) {
  //   return term.extend({
  //     name: this.register(term.name)
  //   });
  // }
  //
  // registerExport(term) {
  //   return term.extend({
  //     declaration: this.register(term.declaration)
  //   });
  // }
}

exports.CollectBindingSyntax = CollectBindingSyntax;
function collectBindings(term) {
  return new CollectBindingSyntax().collect(term);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oeWdpZW5lLXV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztRQTZFZ0IsZSxHQUFBLGU7O0FBN0VoQjs7QUFFQTs7Ozs7O0FBRU8sTUFBTSxvQkFBTixpQ0FBaUQ7QUFDdEQsZ0JBQWM7QUFDWixVQUFNLFNBQU4sRUFBaUIsSUFBakI7QUFDQSxTQUFLLEtBQUwsR0FBYSxzQkFBYjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxVQUFRLElBQVIsRUFBYztBQUNaLFdBQU8sS0FBSyxRQUFMLENBQWMsSUFBZCxDQUFQO0FBQ0Q7O0FBRUQsMkJBQXlCLElBQXpCLEVBQStCO0FBQzdCLFdBQU8sS0FBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixLQUFLLElBQXZCLENBQVA7QUFDRDs7QUFFRCxtQ0FBaUMsSUFBakMsRUFBdUM7QUFDckMsV0FBTyxLQUFLLE9BQUwsQ0FBYSxLQUFLLE9BQWxCLENBQVA7QUFDRDs7QUFFRCxpQ0FBZ0MsSUFBaEMsRUFBc0M7QUFDcEMsV0FBTyxLQUFLLE9BQUwsQ0FBYSxLQUFLLE9BQWxCLENBQVA7QUFDRDs7QUFFRCxzQkFBcUIsSUFBckIsRUFBMkI7QUFDekIsUUFBSSxjQUFjLElBQWxCO0FBQ0EsUUFBSSxLQUFLLFdBQUwsSUFBb0IsSUFBeEIsRUFBOEI7QUFDNUIsb0JBQWMsS0FBSyxPQUFMLENBQWEsS0FBSyxXQUFsQixDQUFkO0FBQ0Q7QUFDRCxXQUFPLEtBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0IsV0FBbEIsRUFBK0IsTUFBL0IsQ0FDTCxLQUFLLFFBQUwsQ0FBYyxNQUFkLENBQXFCLE1BQU0sTUFBTSxJQUFqQyxFQUNjLE9BRGQsQ0FDc0IsTUFBTSxLQUFLLE9BQUwsQ0FBYSxFQUFiLENBRDVCLENBREssQ0FBUDtBQUlEOztBQUVELHlCQUF3QjtBQUN0QjtBQUNBLFdBQU8sc0JBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBdEVzRDs7UUFBM0Msb0IsR0FBQSxvQjtBQXlFTixTQUFTLGVBQVQsQ0FBeUIsSUFBekIsRUFBK0I7QUFDcEMsU0FBTyxJQUFJLG9CQUFKLEdBQTJCLE9BQTNCLENBQW1DLElBQW5DLENBQVA7QUFDRCIsImZpbGUiOiJoeWdpZW5lLXV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTGlzdCB9IGZyb20gJ2ltbXV0YWJsZSc7XG5cbmltcG9ydCBBU1REaXNwYXRjaGVyIGZyb20gJy4vYXN0LWRpc3BhdGNoZXInO1xuXG5leHBvcnQgY2xhc3MgQ29sbGVjdEJpbmRpbmdTeW50YXggZXh0ZW5kcyBBU1REaXNwYXRjaGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoJ2NvbGxlY3QnLCB0cnVlKTtcbiAgICB0aGlzLm5hbWVzID0gTGlzdCgpO1xuICB9XG5cbiAgLy8gcmVnaXN0ZXJTeW50YXgoc3R4KSB7XG4gIC8vICAgbGV0IG5ld0JpbmRpbmcgPSBnZW5zeW0oc3R4LnZhbCgpKTtcbiAgLy8gICB0aGlzLmNvbnRleHQuYmluZGluZ3MuYWRkKHN0eCwge1xuICAvLyAgICAgYmluZGluZzogbmV3QmluZGluZyxcbiAgLy8gICAgIHBoYXNlOiB0aGlzLmNvbnRleHQucGhhc2UsXG4gIC8vICAgICAvLyBza2lwIGR1cCBiZWNhdXNlIGpzIGFsbG93cyB2YXJpYWJsZSByZWRlY2xhcmF0aW9uc1xuICAvLyAgICAgLy8gKHRlY2huaWNhbGx5IG9ubHkgZm9yIGB2YXJgIGJ1dCB3ZSBjYW4gbGV0IGxhdGVyIHN0YWdlcyBvZiB0aGUgcGlwZWxpbmVcbiAgLy8gICAgIC8vIGhhbmRsZSBpbmNvcnJlY3QgcmVkZWNsYXJhdGlvbnMgb2YgYGNvbnN0YCBhbmQgYGxldGApXG4gIC8vICAgICBza2lwRHVwOiB0cnVlXG4gIC8vICAgfSk7XG4gIC8vICAgcmV0dXJuIHN0eDtcbiAgLy8gfVxuXG4gIGNvbGxlY3QodGVybSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKHRlcm0pO1xuICB9XG5cbiAgY29sbGVjdEJpbmRpbmdJZGVudGlmaWVyKHRlcm0pIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lcy5jb25jYXQodGVybS5uYW1lKTtcbiAgfVxuXG4gIGNvbGxlY3RCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyKHRlcm0pIHtcbiAgICByZXR1cm4gdGhpcy5jb2xsZWN0KHRlcm0uYmluZGluZyk7XG4gIH1cblxuICBjb2xsZWN0QmluZGluZ1Byb3BlcnR5UHJvcGVydHkgKHRlcm0pIHtcbiAgICByZXR1cm4gdGhpcy5jb2xsZWN0KHRlcm0uYmluZGluZyk7XG4gIH1cblxuICBjb2xsZWN0QXJyYXlCaW5kaW5nICh0ZXJtKSB7XG4gICAgbGV0IHJlc3RFbGVtZW50ID0gbnVsbDtcbiAgICBpZiAodGVybS5yZXN0RWxlbWVudCAhPSBudWxsKSB7XG4gICAgICByZXN0RWxlbWVudCA9IHRoaXMuY29sbGVjdCh0ZXJtLnJlc3RFbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubmFtZXMuY29uY2F0KHJlc3RFbGVtZW50KS5jb25jYXQoXG4gICAgICB0ZXJtLmVsZW1lbnRzLmZpbHRlcihlbCA9PiBlbCAhPSBudWxsKVxuICAgICAgICAgICAgICAgICAgIC5mbGF0TWFwKGVsID0+IHRoaXMuY29sbGVjdChlbCkpXG4gICAgKTtcbiAgfVxuXG4gIGNvbGxlY3RPYmplY3RCaW5kaW5nICgpIHtcbiAgICAvLyByZXR1cm4gdGVybS5wcm9wZXJ0aWVzLmZsYXRNYXAocHJvcCA9PiB0aGlzLmNvbGxlY3QocHJvcCkpO1xuICAgIHJldHVybiBMaXN0KCk7XG4gIH1cblxuICAvLyByZWdpc3RlclZhcmlhYmxlRGVjbGFyYXRpb24odGVybSkge1xuICAvLyAgIGxldCBkZWNsYXJhdG9ycyA9IHRlcm0uZGVjbGFyYXRvcnMubWFwKGRlY2wgPT4ge1xuICAvLyAgICAgcmV0dXJuIGRlY2wuZXh0ZW5kKHtcbiAgLy8gICAgICAgYmluZGluZzogdGhpcy5yZWdpc3RlcihkZWNsLmJpbmRpbmcpXG4gIC8vICAgICB9KTtcbiAgLy8gICB9KTtcbiAgLy8gICByZXR1cm4gdGVybS5leHRlbmQoeyBkZWNsYXJhdG9ycyB9KTtcbiAgLy8gfVxuICAvL1xuICAvLyByZWdpc3RlckZ1bmN0aW9uRGVjbGFyYXRpb24odGVybSkge1xuICAvLyAgIHJldHVybiB0ZXJtLmV4dGVuZCh7XG4gIC8vICAgICBuYW1lOiB0aGlzLnJlZ2lzdGVyKHRlcm0ubmFtZSlcbiAgLy8gICB9KTtcbiAgLy8gfVxuICAvL1xuICAvLyByZWdpc3RlckV4cG9ydCh0ZXJtKSB7XG4gIC8vICAgcmV0dXJuIHRlcm0uZXh0ZW5kKHtcbiAgLy8gICAgIGRlY2xhcmF0aW9uOiB0aGlzLnJlZ2lzdGVyKHRlcm0uZGVjbGFyYXRpb24pXG4gIC8vICAgfSk7XG4gIC8vIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RCaW5kaW5ncyh0ZXJtKSB7XG4gIHJldHVybiBuZXcgQ29sbGVjdEJpbmRpbmdTeW50YXgoKS5jb2xsZWN0KHRlcm0pO1xufVxuIl19