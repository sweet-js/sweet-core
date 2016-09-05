'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _termExpander = require('./term-expander.js');

var _termExpander2 = _interopRequireDefault(_termExpander);

var _tokenExpander = require('./token-expander');

var _tokenExpander2 = _interopRequireDefault(_tokenExpander);

var _ramda = require('ramda');

var _ = _interopRequireWildcard(_ramda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Compiler {
  constructor(phase, env, store, context) {
    this.phase = phase;
    this.env = env;
    this.store = store;
    this.context = context;
  }

  compile(stxl) {
    let tokenExpander = new _tokenExpander2.default(_.merge(this.context, {
      phase: this.phase,
      env: this.env,
      store: this.store
    }));
    let termExpander = new _termExpander2.default(_.merge(this.context, {
      phase: this.phase,
      env: this.env,
      store: this.store
    }));

    return _.pipe(_.bind(tokenExpander.expand, tokenExpander), _.map(t => termExpander.expand(t)))(stxl);
  }
}
exports.default = Compiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21waWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVksQzs7Ozs7O0FBR0csTUFBTSxRQUFOLENBQWU7QUFDNUIsY0FBWSxLQUFaLEVBQW1CLEdBQW5CLEVBQXdCLEtBQXhCLEVBQStCLE9BQS9CLEVBQXdDO0FBQ3RDLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsU0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLFNBQUssT0FBTCxHQUFlLE9BQWY7QUFDRDs7QUFFRCxVQUFRLElBQVIsRUFBYztBQUNaLFFBQUksZ0JBQWdCLDRCQUFrQixFQUFFLEtBQUYsQ0FBUSxLQUFLLE9BQWIsRUFBc0I7QUFDMUQsYUFBTyxLQUFLLEtBRDhDO0FBRTFELFdBQUssS0FBSyxHQUZnRDtBQUcxRCxhQUFPLEtBQUs7QUFIOEMsS0FBdEIsQ0FBbEIsQ0FBcEI7QUFLQSxRQUFJLGVBQWUsMkJBQWlCLEVBQUUsS0FBRixDQUFRLEtBQUssT0FBYixFQUFzQjtBQUN4RCxhQUFPLEtBQUssS0FENEM7QUFFeEQsV0FBSyxLQUFLLEdBRjhDO0FBR3hELGFBQU8sS0FBSztBQUg0QyxLQUF0QixDQUFqQixDQUFuQjs7QUFNQSxXQUFPLEVBQUUsSUFBRixDQUNMLEVBQUUsSUFBRixDQUFPLGNBQWMsTUFBckIsRUFBNkIsYUFBN0IsQ0FESyxFQUVMLEVBQUUsR0FBRixDQUFNLEtBQUssYUFBYSxNQUFiLENBQW9CLENBQXBCLENBQVgsQ0FGSyxFQUdMLElBSEssQ0FBUDtBQUlEO0FBeEIyQjtrQkFBVCxRIiwiZmlsZSI6ImNvbXBpbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlcm1FeHBhbmRlciBmcm9tIFwiLi90ZXJtLWV4cGFuZGVyLmpzXCI7XG5pbXBvcnQgVG9rZW5FeHBhbmRlciBmcm9tICcuL3Rva2VuLWV4cGFuZGVyJztcbmltcG9ydCAqIGFzIF8gZnJvbSAncmFtZGEnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXBpbGVyIHtcbiAgY29uc3RydWN0b3IocGhhc2UsIGVudiwgc3RvcmUsIGNvbnRleHQpIHtcbiAgICB0aGlzLnBoYXNlID0gcGhhc2U7XG4gICAgdGhpcy5lbnYgPSBlbnY7XG4gICAgdGhpcy5zdG9yZSA9IHN0b3JlO1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gIH1cblxuICBjb21waWxlKHN0eGwpIHtcbiAgICBsZXQgdG9rZW5FeHBhbmRlciA9IG5ldyBUb2tlbkV4cGFuZGVyKF8ubWVyZ2UodGhpcy5jb250ZXh0LCB7XG4gICAgICBwaGFzZTogdGhpcy5waGFzZSxcbiAgICAgIGVudjogdGhpcy5lbnYsXG4gICAgICBzdG9yZTogdGhpcy5zdG9yZVxuICAgIH0pKTtcbiAgICBsZXQgdGVybUV4cGFuZGVyID0gbmV3IFRlcm1FeHBhbmRlcihfLm1lcmdlKHRoaXMuY29udGV4dCwge1xuICAgICAgcGhhc2U6IHRoaXMucGhhc2UsXG4gICAgICBlbnY6IHRoaXMuZW52LFxuICAgICAgc3RvcmU6IHRoaXMuc3RvcmVcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gXy5waXBlKFxuICAgICAgXy5iaW5kKHRva2VuRXhwYW5kZXIuZXhwYW5kLCB0b2tlbkV4cGFuZGVyKSxcbiAgICAgIF8ubWFwKHQgPT4gdGVybUV4cGFuZGVyLmV4cGFuZCh0KSlcbiAgICApKHN0eGwpO1xuICB9XG59XG4iXX0=