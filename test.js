import { id } from "./macros/id_mod.js";
import { * } from "./macros/stxcase.js";
import { map } from "./macros/helper.js" for macros;

macro m {
    case {_ } => {
        map([1, 2, 3], function(x) { return x; });
        return #{42};
    }
}
m

var x = id 24;
