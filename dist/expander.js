"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var Expander = function () {
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
}();

exports.default = Expander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2V4cGFuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztJQUFhOzs7Ozs7OztJQUNRO0FBQ25CLFdBRG1CLFFBQ25CLENBQVksV0FBWixFQUF5QjswQkFETixVQUNNOztBQUN2QixTQUFLLE9BQUwsR0FBZSxXQUFmLENBRHVCO0dBQXpCOztlQURtQjs7MkJBSVosVUFBVTtBQUNmLFVBQUksb0JBQW9CLDRCQUFrQixLQUFLLE9BQUwsQ0FBdEMsQ0FEVztBQUVmLFVBQUksbUJBQW1CLDJCQUFpQixLQUFLLE9BQUwsQ0FBcEMsQ0FGVztBQUdmLGFBQU8sRUFBRSxJQUFGLENBQU8sRUFBRSxJQUFGLENBQU8sa0JBQWtCLE1BQWxCLEVBQTBCLGlCQUFqQyxDQUFQLEVBQTRELEVBQUUsR0FBRixDQUFNO2VBQVMsaUJBQWlCLE1BQWpCLENBQXdCLEtBQXhCO09BQVQsQ0FBbEUsRUFBNEcsUUFBNUcsQ0FBUCxDQUhlOzs7O1NBSkUiLCJmaWxlIjoiZXhwYW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCBUZXJtRXhwYW5kZXIgZnJvbSBcIi4vdGVybS1leHBhbmRlci5qc1wiO1xuaW1wb3J0IFRva2VuRXhwYW5kZXIgZnJvbSBcIi4vdG9rZW4tZXhwYW5kZXJcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4cGFuZGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dF8zMDIpIHtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzMwMjtcbiAgfVxuICBleHBhbmQoc3R4bF8zMDMpIHtcbiAgICBsZXQgdG9rZW5FeHBhbmRlcl8zMDQgPSBuZXcgVG9rZW5FeHBhbmRlcih0aGlzLmNvbnRleHQpO1xuICAgIGxldCB0ZXJtRXhwYW5kZXJfMzA1ID0gbmV3IFRlcm1FeHBhbmRlcih0aGlzLmNvbnRleHQpO1xuICAgIHJldHVybiBfLnBpcGUoXy5iaW5kKHRva2VuRXhwYW5kZXJfMzA0LmV4cGFuZCwgdG9rZW5FeHBhbmRlcl8zMDQpLCBfLm1hcCh0XzMwNiA9PiB0ZXJtRXhwYW5kZXJfMzA1LmV4cGFuZCh0XzMwNikpKShzdHhsXzMwMyk7XG4gIH1cbn1cbiJdfQ==