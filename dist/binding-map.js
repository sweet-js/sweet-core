"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _immutable = require("immutable");

var _errors = require("./errors");

var _ramdaFantasy = require("ramda-fantasy");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BindingMap = (function () {
  function BindingMap() {
    _classCallCheck(this, BindingMap);

    this._map = new Map();
  }

  _createClass(BindingMap, [{
    key: "add",
    value: function add(stx_17, _ref) {
      var binding = _ref.binding;
      var phase = _ref.phase;
      var _ref$skipDup = _ref.skipDup;
      var skipDup = _ref$skipDup === undefined ? false : _ref$skipDup;

      var stxName_18 = stx_17.val();
      if (this._map.has(stxName_18)) {
        var scopesetBindingList = this._map.get(stxName_18);
        if (skipDup && scopesetBindingList.some(function (s_19) {
          return s_19.scopes.equals(stx_17.context.scopeset);
        })) {
          return;
        }
        this._map.set(stxName_18, scopesetBindingList.push({ scopes: stx_17.context.scopeset, binding: binding, alias: _ramdaFantasy.Maybe.Nothing() }));
      } else {
        this._map.set(stxName_18, _immutable.List.of({ scopes: stx_17.context.scopeset, binding: binding, alias: _ramdaFantasy.Maybe.Nothing() }));
      }
    }
  }, {
    key: "addForward",
    value: function addForward(stx_20, forwardStx_21, binding_22) {
      var phase_23 = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

      var stxName_24 = stx_20.token.value;
      if (this._map.has(stxName_24)) {
        var scopesetBindingList = this._map.get(stxName_24);
        this._map.set(stxName_24, scopesetBindingList.push({ scopes: stx_20.context.scopeset, binding: binding_22, alias: _ramdaFantasy.Maybe.of(forwardStx_21) }));
      } else {
        this._map.set(stxName_24, _immutable.List.of({ scopes: stx_20.context.scopeset, binding: binding_22, alias: _ramdaFantasy.Maybe.of(forwardStx_21) }));
      }
    }
  }, {
    key: "get",
    value: function get(stx_25) {
      return this._map.get(stx_25.token.value);
    }
  }]);

  return BindingMap;
})();

exports.default = BindingMap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2JpbmRpbmctbWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7SUFHcUIsVUFBVTtBQUM3QixXQURtQixVQUFVLEdBQ2Y7MEJBREssVUFBVTs7QUFFM0IsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBQSxDQUFDO0dBQ3JCOztlQUhrQixVQUFVOzt3QkFJekIsTUFBTSxRQUFxQztVQUFsQyxPQUFPLFFBQVAsT0FBTztVQUFFLEtBQUssUUFBTCxLQUFLOzhCQUFFLE9BQU87VUFBUCxPQUFPLGdDQUFHLEtBQUs7O0FBQzFDLFVBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUM5QixVQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQzdCLFlBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDcEQsWUFBSSxPQUFPLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtpQkFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztTQUFBLENBQUMsRUFBRTtBQUM1RixpQkFBTztTQUNSO0FBQ0QsWUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxvQkFBTSxPQUFPLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQztPQUNsSSxNQUFNO0FBQ0wsWUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGdCQUFLLEVBQUUsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxvQkFBTSxPQUFPLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQztPQUNqSDtLQUNGOzs7K0JBQ1UsTUFBTSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQWdCO1VBQWQsUUFBUSx5REFBRyxDQUFDOztBQUN4RCxVQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUNwQyxVQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQzdCLFlBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDcEQsWUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxvQkFBTSxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7T0FDN0ksTUFBTTtBQUNMLFlBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxnQkFBSyxFQUFFLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsb0JBQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO09BQzVIO0tBQ0Y7Ozt3QkFDRyxNQUFNLEVBQUU7QUFDVixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDMUM7OztTQTNCa0IsVUFBVTs7O2tCQUFWLFVBQVUiLCJmaWxlIjoiYmluZGluZy1tYXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJpbmRpbmdNYXAge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9tYXAgPSBuZXcgTWFwO1xuICB9XG4gIGFkZChzdHhfMTcsIHtiaW5kaW5nLCBwaGFzZSwgc2tpcER1cCA9IGZhbHNlfSkge1xuICAgIGxldCBzdHhOYW1lXzE4ID0gc3R4XzE3LnZhbCgpO1xuICAgIGlmICh0aGlzLl9tYXAuaGFzKHN0eE5hbWVfMTgpKSB7XG4gICAgICBsZXQgc2NvcGVzZXRCaW5kaW5nTGlzdCA9IHRoaXMuX21hcC5nZXQoc3R4TmFtZV8xOCk7XG4gICAgICBpZiAoc2tpcER1cCAmJiBzY29wZXNldEJpbmRpbmdMaXN0LnNvbWUoc18xOSA9PiBzXzE5LnNjb3Blcy5lcXVhbHMoc3R4XzE3LmNvbnRleHQuc2NvcGVzZXQpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9tYXAuc2V0KHN0eE5hbWVfMTgsIHNjb3Blc2V0QmluZGluZ0xpc3QucHVzaCh7c2NvcGVzOiBzdHhfMTcuY29udGV4dC5zY29wZXNldCwgYmluZGluZzogYmluZGluZywgYWxpYXM6IE1heWJlLk5vdGhpbmcoKX0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbWFwLnNldChzdHhOYW1lXzE4LCBMaXN0Lm9mKHtzY29wZXM6IHN0eF8xNy5jb250ZXh0LnNjb3Blc2V0LCBiaW5kaW5nOiBiaW5kaW5nLCBhbGlhczogTWF5YmUuTm90aGluZygpfSkpO1xuICAgIH1cbiAgfVxuICBhZGRGb3J3YXJkKHN0eF8yMCwgZm9yd2FyZFN0eF8yMSwgYmluZGluZ18yMiwgcGhhc2VfMjMgPSAwKSB7XG4gICAgbGV0IHN0eE5hbWVfMjQgPSBzdHhfMjAudG9rZW4udmFsdWU7XG4gICAgaWYgKHRoaXMuX21hcC5oYXMoc3R4TmFtZV8yNCkpIHtcbiAgICAgIGxldCBzY29wZXNldEJpbmRpbmdMaXN0ID0gdGhpcy5fbWFwLmdldChzdHhOYW1lXzI0KTtcbiAgICAgIHRoaXMuX21hcC5zZXQoc3R4TmFtZV8yNCwgc2NvcGVzZXRCaW5kaW5nTGlzdC5wdXNoKHtzY29wZXM6IHN0eF8yMC5jb250ZXh0LnNjb3Blc2V0LCBiaW5kaW5nOiBiaW5kaW5nXzIyLCBhbGlhczogTWF5YmUub2YoZm9yd2FyZFN0eF8yMSl9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21hcC5zZXQoc3R4TmFtZV8yNCwgTGlzdC5vZih7c2NvcGVzOiBzdHhfMjAuY29udGV4dC5zY29wZXNldCwgYmluZGluZzogYmluZGluZ18yMiwgYWxpYXM6IE1heWJlLm9mKGZvcndhcmRTdHhfMjEpfSkpO1xuICAgIH1cbiAgfVxuICBnZXQoc3R4XzI1KSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5nZXQoc3R4XzI1LnRva2VuLnZhbHVlKTtcbiAgfVxufVxuIl19