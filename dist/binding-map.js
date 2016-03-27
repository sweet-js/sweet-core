"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require("immutable");

var _errors = require("./errors");

var _ramdaFantasy = require("ramda-fantasy");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BindingMap = function () {
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
}();

exports.default = BindingMap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2JpbmRpbmctbWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7SUFDcUI7QUFDbkIsV0FEbUIsVUFDbkIsR0FBYzswQkFESyxZQUNMOztBQUNaLFNBQUssSUFBTCxHQUFZLElBQUksR0FBSixFQUFaLENBRFk7R0FBZDs7ZUFEbUI7O3dCQUlmLGNBQTJDO1VBQWxDLHVCQUFrQztVQUF6QixtQkFBeUI7OEJBQWxCLFFBQWtCO1VBQWxCLHVDQUFVLHFCQUFROztBQUM3QyxVQUFJLGFBQWEsT0FBTyxHQUFQLEVBQWIsQ0FEeUM7QUFFN0MsVUFBSSxLQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsVUFBZCxDQUFKLEVBQStCO0FBQzdCLFlBQUksc0JBQXNCLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxVQUFkLENBQXRCLENBRHlCO0FBRTdCLFlBQUksV0FBVyxvQkFBb0IsSUFBcEIsQ0FBeUI7aUJBQVEsS0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixPQUFPLE9BQVAsQ0FBZSxRQUFmO1NBQTNCLENBQXBDLEVBQTBGO0FBQzVGLGlCQUQ0RjtTQUE5RjtBQUdBLGFBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxVQUFkLEVBQTBCLG9CQUFvQixJQUFwQixDQUF5QixFQUFDLFFBQVEsT0FBTyxPQUFQLENBQWUsUUFBZixFQUF5QixTQUFTLE9BQVQsRUFBa0IsT0FBTyxvQkFBTSxPQUFOLEVBQVAsRUFBN0UsQ0FBMUIsRUFMNkI7T0FBL0IsTUFNTztBQUNMLGFBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxVQUFkLEVBQTBCLGdCQUFLLEVBQUwsQ0FBUSxFQUFDLFFBQVEsT0FBTyxPQUFQLENBQWUsUUFBZixFQUF5QixTQUFTLE9BQVQsRUFBa0IsT0FBTyxvQkFBTSxPQUFOLEVBQVAsRUFBNUQsQ0FBMUIsRUFESztPQU5QOzs7OytCQVVTLFFBQVEsZUFBZSxZQUEwQjtVQUFkLGlFQUFXLGlCQUFHOztBQUMxRCxVQUFJLGFBQWEsT0FBTyxLQUFQLENBQWEsS0FBYixDQUR5QztBQUUxRCxVQUFJLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxVQUFkLENBQUosRUFBK0I7QUFDN0IsWUFBSSxzQkFBc0IsS0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLFVBQWQsQ0FBdEIsQ0FEeUI7QUFFN0IsYUFBSyxJQUFMLENBQVUsR0FBVixDQUFjLFVBQWQsRUFBMEIsb0JBQW9CLElBQXBCLENBQXlCLEVBQUMsUUFBUSxPQUFPLE9BQVAsQ0FBZSxRQUFmLEVBQXlCLFNBQVMsVUFBVCxFQUFxQixPQUFPLG9CQUFNLEVBQU4sQ0FBUyxhQUFULENBQVAsRUFBaEYsQ0FBMUIsRUFGNkI7T0FBL0IsTUFHTztBQUNMLGFBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxVQUFkLEVBQTBCLGdCQUFLLEVBQUwsQ0FBUSxFQUFDLFFBQVEsT0FBTyxPQUFQLENBQWUsUUFBZixFQUF5QixTQUFTLFVBQVQsRUFBcUIsT0FBTyxvQkFBTSxFQUFOLENBQVMsYUFBVCxDQUFQLEVBQS9ELENBQTFCLEVBREs7T0FIUDs7Ozt3QkFPRSxRQUFRO0FBQ1YsYUFBTyxLQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsT0FBTyxLQUFQLENBQWEsS0FBYixDQUFyQixDQURVOzs7O1NBekJPIiwiZmlsZSI6ImJpbmRpbmctbWFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2V4cGVjdCwgYXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCaW5kaW5nTWFwIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fbWFwID0gbmV3IE1hcDtcbiAgfVxuICBhZGQoc3R4XzE3LCB7YmluZGluZywgcGhhc2UsIHNraXBEdXAgPSBmYWxzZX0pIHtcbiAgICBsZXQgc3R4TmFtZV8xOCA9IHN0eF8xNy52YWwoKTtcbiAgICBpZiAodGhpcy5fbWFwLmhhcyhzdHhOYW1lXzE4KSkge1xuICAgICAgbGV0IHNjb3Blc2V0QmluZGluZ0xpc3QgPSB0aGlzLl9tYXAuZ2V0KHN0eE5hbWVfMTgpO1xuICAgICAgaWYgKHNraXBEdXAgJiYgc2NvcGVzZXRCaW5kaW5nTGlzdC5zb21lKHNfMTkgPT4gc18xOS5zY29wZXMuZXF1YWxzKHN0eF8xNy5jb250ZXh0LnNjb3Blc2V0KSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fbWFwLnNldChzdHhOYW1lXzE4LCBzY29wZXNldEJpbmRpbmdMaXN0LnB1c2goe3Njb3Blczogc3R4XzE3LmNvbnRleHQuc2NvcGVzZXQsIGJpbmRpbmc6IGJpbmRpbmcsIGFsaWFzOiBNYXliZS5Ob3RoaW5nKCl9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21hcC5zZXQoc3R4TmFtZV8xOCwgTGlzdC5vZih7c2NvcGVzOiBzdHhfMTcuY29udGV4dC5zY29wZXNldCwgYmluZGluZzogYmluZGluZywgYWxpYXM6IE1heWJlLk5vdGhpbmcoKX0pKTtcbiAgICB9XG4gIH1cbiAgYWRkRm9yd2FyZChzdHhfMjAsIGZvcndhcmRTdHhfMjEsIGJpbmRpbmdfMjIsIHBoYXNlXzIzID0gMCkge1xuICAgIGxldCBzdHhOYW1lXzI0ID0gc3R4XzIwLnRva2VuLnZhbHVlO1xuICAgIGlmICh0aGlzLl9tYXAuaGFzKHN0eE5hbWVfMjQpKSB7XG4gICAgICBsZXQgc2NvcGVzZXRCaW5kaW5nTGlzdCA9IHRoaXMuX21hcC5nZXQoc3R4TmFtZV8yNCk7XG4gICAgICB0aGlzLl9tYXAuc2V0KHN0eE5hbWVfMjQsIHNjb3Blc2V0QmluZGluZ0xpc3QucHVzaCh7c2NvcGVzOiBzdHhfMjAuY29udGV4dC5zY29wZXNldCwgYmluZGluZzogYmluZGluZ18yMiwgYWxpYXM6IE1heWJlLm9mKGZvcndhcmRTdHhfMjEpfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tYXAuc2V0KHN0eE5hbWVfMjQsIExpc3Qub2Yoe3Njb3Blczogc3R4XzIwLmNvbnRleHQuc2NvcGVzZXQsIGJpbmRpbmc6IGJpbmRpbmdfMjIsIGFsaWFzOiBNYXliZS5vZihmb3J3YXJkU3R4XzIxKX0pKTtcbiAgICB9XG4gIH1cbiAgZ2V0KHN0eF8yNSkge1xuICAgIHJldHVybiB0aGlzLl9tYXAuZ2V0KHN0eF8yNS50b2tlbi52YWx1ZSk7XG4gIH1cbn1cbiJdfQ==