macro aif {
    case {
        $aif_name  
        ($cond ...) {$tru ...} else { $els ... }

    } => {
       SyntaxParameter(it, $cond ... , aif ,
        return #{
             (function () {
          
                if ($cond ...) {
                    $tru ...
                } else {
                    $els ...
                }
            });
            
	
        } )
    }
}


long = [1, 2, 3];
aif (long) {
  console.log(it);
} else { 
    console.log(" in else");
    }