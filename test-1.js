macro aif {
    case {
        $aif_name  
        ($cond ...) {$tru ...} else { $els ... }

    } => {
        var it = makeIdent("it", #{$aif_name});
    letstx $it = [it];
        return #
	  {
            (function ($it) {
                if ($cond ...) {
                    $tru ...
                } else {
                    $els ...
                }
            })($cond ...)
	
        }
    }
}

aif (long.obj.path) {
  console.log(it);
} else {}