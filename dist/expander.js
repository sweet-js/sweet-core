"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _immutable = require("immutable");

var _termExpander = require("./term-expander.js");

var _termExpander2 = _interopRequireDefault(_termExpander);

var _tokenExpander = require("./token-expander");

var _tokenExpander2 = _interopRequireDefault(_tokenExpander);

var _scope = require("./scope");

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Expander = (function () {
  function Expander(context_302) {
    _classCallCheck(this, Expander);

    this.context = context_302;
  }

  _createClass(Expander, [{
    key: "expand",
    value: function expand(stxl_303) {
      var tokenExpander_304 = new _tokenExpander2.default(this.context);
      var termExpander_305 = new _termExpander2.default(this.context);
      return _.pipe(_.bind(tokenExpander_304.expand, tokenExpander_304), _.map(function (t_306) {
        return termExpander_305.expand(t_306);
      }))(stxl_303);
    }
  }]);

  return Expander;
})();

exports.default = Expander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2V4cGFuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFJYSxDQUFDOzs7Ozs7OztJQUNPLFFBQVE7QUFDM0IsV0FEbUIsUUFBUSxDQUNmLFdBQVcsRUFBRTswQkFETixRQUFROztBQUV6QixRQUFJLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQztHQUM1Qjs7ZUFIa0IsUUFBUTs7MkJBSXBCLFFBQVEsRUFBRTtBQUNmLFVBQUksaUJBQWlCLEdBQUcsNEJBQWtCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN4RCxVQUFJLGdCQUFnQixHQUFHLDJCQUFpQixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEQsYUFBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7ZUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO09BQUEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDOUg7OztTQVJrQixRQUFROzs7a0JBQVIsUUFBUSIsImZpbGUiOiJleHBhbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFRlcm1FeHBhbmRlciBmcm9tIFwiLi90ZXJtLWV4cGFuZGVyLmpzXCI7XG5pbXBvcnQgVG9rZW5FeHBhbmRlciBmcm9tIFwiLi90b2tlbi1leHBhbmRlclwiO1xuaW1wb3J0IHtTY29wZSwgZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCAgKiBhcyBfIGZyb20gXCJyYW1kYVwiO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhwYW5kZXIge1xuICBjb25zdHJ1Y3Rvcihjb250ZXh0XzMwMikge1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfMzAyO1xuICB9XG4gIGV4cGFuZChzdHhsXzMwMykge1xuICAgIGxldCB0b2tlbkV4cGFuZGVyXzMwNCA9IG5ldyBUb2tlbkV4cGFuZGVyKHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHRlcm1FeHBhbmRlcl8zMDUgPSBuZXcgVGVybUV4cGFuZGVyKHRoaXMuY29udGV4dCk7XG4gICAgcmV0dXJuIF8ucGlwZShfLmJpbmQodG9rZW5FeHBhbmRlcl8zMDQuZXhwYW5kLCB0b2tlbkV4cGFuZGVyXzMwNCksIF8ubWFwKHRfMzA2ID0+IHRlcm1FeHBhbmRlcl8zMDUuZXhwYW5kKHRfMzA2KSkpKHN0eGxfMzAzKTtcbiAgfVxufVxuIl19