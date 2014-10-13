
defineSyntaxParameter it { rule {} => { console.log(" to be used in aif") } }

macro aif {
    case {
        $aif_name  
        ($cond ...) {$tru ...} else { $els ... }

    } => {
     SyntaxParameter(it, $cond ... , aif ,
        return #
	  {
            (function () {
                 if ($cond ...) {
                    $tru ...
                } else {
                    $els ...
                }
            })
	
        })
    }
}



macro unless {
    case { 
	  $unless_name 
	  ($cond ...) { $body ...} } => {
 return #{
        while (true) {
            aif ($cond ...) {
                // `it` is correctly bound by `aif`
                console.log("loop finished at: " + it);
                            } else {
                $body ...
            }
        }}
    }
}

x=2
unless (x) {
    // `it` is not bound!
    console.log(it)
}

it

var it = 3;