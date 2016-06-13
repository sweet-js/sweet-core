"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

class Compiler {
  constructor(phase_33, env_34, store_35, context_36) {
    this.phase = phase_33;
    this.env = env_34;
    this.store = store_35;
    this.context = context_36;
  }
  compile(stxl_37) {
    let tokenExpander_38 = new _tokenExpander2.default(_.merge(this.context, { phase: this.phase, env: this.env, store: this.store }));
    let termExpander_39 = new _termExpander2.default(_.merge(this.context, { phase: this.phase, env: this.env, store: this.store }));
    return _.pipe(_.bind(tokenExpander_38.expand, tokenExpander_38), _.map(t_40 => termExpander_39.expand(t_40)))(stxl_37);
  }
}
exports.default = Compiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2NvbXBpbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7SUFBYSxDOzs7Ozs7QUFDRSxNQUFNLFFBQU4sQ0FBZTtBQUM1QixjQUFZLFFBQVosRUFBc0IsTUFBdEIsRUFBOEIsUUFBOUIsRUFBd0MsVUFBeEMsRUFBb0Q7QUFDbEQsU0FBSyxLQUFMLEdBQWEsUUFBYjtBQUNBLFNBQUssR0FBTCxHQUFXLE1BQVg7QUFDQSxTQUFLLEtBQUwsR0FBYSxRQUFiO0FBQ0EsU0FBSyxPQUFMLEdBQWUsVUFBZjtBQUNEO0FBQ0QsVUFBUSxPQUFSLEVBQWlCO0FBQ2YsUUFBSSxtQkFBbUIsNEJBQWtCLEVBQUUsS0FBRixDQUFRLEtBQUssT0FBYixFQUFzQixFQUFDLE9BQU8sS0FBSyxLQUFiLEVBQW9CLEtBQUssS0FBSyxHQUE5QixFQUFtQyxPQUFPLEtBQUssS0FBL0MsRUFBdEIsQ0FBbEIsQ0FBdkI7QUFDQSxRQUFJLGtCQUFrQiwyQkFBaUIsRUFBRSxLQUFGLENBQVEsS0FBSyxPQUFiLEVBQXNCLEVBQUMsT0FBTyxLQUFLLEtBQWIsRUFBb0IsS0FBSyxLQUFLLEdBQTlCLEVBQW1DLE9BQU8sS0FBSyxLQUEvQyxFQUF0QixDQUFqQixDQUF0QjtBQUNBLFdBQU8sRUFBRSxJQUFGLENBQU8sRUFBRSxJQUFGLENBQU8saUJBQWlCLE1BQXhCLEVBQWdDLGdCQUFoQyxDQUFQLEVBQTBELEVBQUUsR0FBRixDQUFNLFFBQVEsZ0JBQWdCLE1BQWhCLENBQXVCLElBQXZCLENBQWQsQ0FBMUQsRUFBdUcsT0FBdkcsQ0FBUDtBQUNEO0FBWDJCO2tCQUFULFEiLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCBUZXJtRXhwYW5kZXIgZnJvbSBcIi4vdGVybS1leHBhbmRlci5qc1wiO1xuaW1wb3J0IFRva2VuRXhwYW5kZXIgZnJvbSBcIi4vdG9rZW4tZXhwYW5kZXJcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXBpbGVyIHtcbiAgY29uc3RydWN0b3IocGhhc2VfMzMsIGVudl8zNCwgc3RvcmVfMzUsIGNvbnRleHRfMzYpIHtcbiAgICB0aGlzLnBoYXNlID0gcGhhc2VfMzM7XG4gICAgdGhpcy5lbnYgPSBlbnZfMzQ7XG4gICAgdGhpcy5zdG9yZSA9IHN0b3JlXzM1O1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfMzY7XG4gIH1cbiAgY29tcGlsZShzdHhsXzM3KSB7XG4gICAgbGV0IHRva2VuRXhwYW5kZXJfMzggPSBuZXcgVG9rZW5FeHBhbmRlcihfLm1lcmdlKHRoaXMuY29udGV4dCwge3BoYXNlOiB0aGlzLnBoYXNlLCBlbnY6IHRoaXMuZW52LCBzdG9yZTogdGhpcy5zdG9yZX0pKTtcbiAgICBsZXQgdGVybUV4cGFuZGVyXzM5ID0gbmV3IFRlcm1FeHBhbmRlcihfLm1lcmdlKHRoaXMuY29udGV4dCwge3BoYXNlOiB0aGlzLnBoYXNlLCBlbnY6IHRoaXMuZW52LCBzdG9yZTogdGhpcy5zdG9yZX0pKTtcbiAgICByZXR1cm4gXy5waXBlKF8uYmluZCh0b2tlbkV4cGFuZGVyXzM4LmV4cGFuZCwgdG9rZW5FeHBhbmRlcl8zOCksIF8ubWFwKHRfNDAgPT4gdGVybUV4cGFuZGVyXzM5LmV4cGFuZCh0XzQwKSkpKHN0eGxfMzcpO1xuICB9XG59XG4iXX0=