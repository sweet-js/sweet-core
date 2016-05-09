"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gensym = gensym;
var internedMap_636 = new Map();
var counter_637 = 0;
function gensym(name_640) {
  var prefix_641 = name_640 == null ? "s_" : name_640 + "_";
  var sym_642 = new Symbol_638(prefix_641 + counter_637);
  counter_637++;
  return sym_642;
}
function Symbol_638(name_643) {
  this.name = name_643;
}
Symbol_638.prototype.toString = function () {
  return this.name;
};
function makeSymbol_639(name_644) {
  if (internedMap_636.has(name_644)) {
    return internedMap_636.get(name_644);
  } else {
    var sym = new Symbol_638(name_644);
    internedMap_636.set(name_644, sym);
    return sym;
  }
}
exports.Symbol = makeSymbol_639;
exports.SymbolClass = Symbol_638;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3N5bWJvbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQUVnQixNQUFNLEdBQU4sTUFBTTtBQUZ0QixJQUFJLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBQSxDQUFDO0FBQzlCLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNiLFNBQVMsTUFBTSxDQUFDLFFBQVEsRUFBRTtBQUMvQixNQUFJLFVBQVUsR0FBRyxRQUFRLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFDO0FBQzFELE1BQUksT0FBTyxHQUFHLElBQUksVUFBVSxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsQ0FBQztBQUN2RCxhQUFXLEVBQUUsQ0FBQztBQUNkLFNBQU8sT0FBTyxDQUFDO0NBQ2hCO0FBQ0QsU0FBUyxVQUFVLENBQUMsUUFBUSxFQUFFO0FBQzVCLE1BQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO0NBQ3RCO0FBQ0QsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsWUFBWTtBQUMxQyxTQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7Q0FDbEIsQ0FBQztBQUNGLFNBQVMsY0FBYyxDQUFDLFFBQVEsRUFBRTtBQUNoQyxNQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDakMsV0FBTyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQ3RDLE1BQU07QUFDTCxRQUFJLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNuQyxtQkFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDbkMsV0FBTyxHQUFHLENBQUM7R0FDWjtDQUNGO1FBQ3lCLE1BQU0sR0FBeEIsY0FBYztRQUEwQixXQUFXLEdBQXpCLFVBQVUiLCJmaWxlIjoic3ltYm9sLmpzIiwic291cmNlc0NvbnRlbnQiOlsibGV0IGludGVybmVkTWFwXzYzNiA9IG5ldyBNYXA7XG5sZXQgY291bnRlcl82MzcgPSAwO1xuZXhwb3J0IGZ1bmN0aW9uIGdlbnN5bShuYW1lXzY0MCkge1xuICBsZXQgcHJlZml4XzY0MSA9IG5hbWVfNjQwID09IG51bGwgPyBcInNfXCIgOiBuYW1lXzY0MCArIFwiX1wiO1xuICBsZXQgc3ltXzY0MiA9IG5ldyBTeW1ib2xfNjM4KHByZWZpeF82NDEgKyBjb3VudGVyXzYzNyk7XG4gIGNvdW50ZXJfNjM3Kys7XG4gIHJldHVybiBzeW1fNjQyO1xufVxuZnVuY3Rpb24gU3ltYm9sXzYzOChuYW1lXzY0Mykge1xuICB0aGlzLm5hbWUgPSBuYW1lXzY0Mztcbn1cblN5bWJvbF82MzgucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5uYW1lO1xufTtcbmZ1bmN0aW9uIG1ha2VTeW1ib2xfNjM5KG5hbWVfNjQ0KSB7XG4gIGlmIChpbnRlcm5lZE1hcF82MzYuaGFzKG5hbWVfNjQ0KSkge1xuICAgIHJldHVybiBpbnRlcm5lZE1hcF82MzYuZ2V0KG5hbWVfNjQ0KTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgc3ltID0gbmV3IFN5bWJvbF82MzgobmFtZV82NDQpO1xuICAgIGludGVybmVkTWFwXzYzNi5zZXQobmFtZV82NDQsIHN5bSk7XG4gICAgcmV0dXJuIHN5bTtcbiAgfVxufVxuZXhwb3J0IHttYWtlU3ltYm9sXzYzOSBhcyBTeW1ib2wsIFN5bWJvbF82MzggYXMgU3ltYm9sQ2xhc3N9O1xuIl19