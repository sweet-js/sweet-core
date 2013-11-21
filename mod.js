macro _destructure {
    case { $ctx $x } => { return #{ $x } }
}
export _destructure;

let var = macro {
    case { $ctx $l = $r } => { 
        return #{
            _destructure $l
        };
    }
}
export var