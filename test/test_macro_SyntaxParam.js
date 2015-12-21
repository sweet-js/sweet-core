var expect = require("expect.js")
var sweet = require("../build/lib/sweet.js");

describe('Syntax Parameter', function(){
 
    it('should transform the it variable in the defiend scope', function(){
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
                    })();
            
	
                } )
            }
        }

        

        long = [1, 2, 3];
       var x= aif (long) {
         return it;
        } else { 
            return 0;
        }
        expect(x).to.be([1,2,3]);
    })
              
})