function enforest {
	case (literal ...rest, comb, prec, stack) => {
		enforest(<lit: literal> ...rest, comb, prec, stack)
	}

	case (ident ...rest, comb, prec, stack) 
			if lookup(ident) = <var: varident> => {
		enforest(<id: varident> ...rest, comb, prec, stack)
	}

	case (ident ...rest, comb, prec, [(comb_stack, prec_stack) stack])
			if lookup(ident) = <macro: transformer> => {
		// note that comb and prec are dropped and the comb/prec from the stack
		// are used instead
		enforest(transformer(...rest), comb_stack, prec_stack, stack)
	}

    case (<term_tree_first> ident ...rest, comb, prec, stack) 
		    if lookup(ident) = <binop: prec_op, assoc>
		    and	prec_op >_assoc prec => {
		    	
    	enforest(...rest, (t) => <bin: ident, <term_tree_first>, t>, prec_op, [(comb, prec) stack])
    }

    case (<term_tree_first> ident ...rest, comb, prec, [(comb_stack, prec_stack) stack]) 
		    if lookup(ident) = <binop: prec_op, assoc>
		    and	prec_op <_assoc prec => {

    	enforest(comb(<term_tree_first>) ident ...rest, comb_stack, prec_stack, stack)
    }

    case (ident ...rest, comb, prec, stack)
    		if lookup(ident) = <unop: prec_op> => {

    	enforest(...rest, (t) => comb(<un: ident, t>), prec_op, stack)			
	}

    // done with the stack
    case (<term_tree> ...rest, comb, prec, []) => {
    	comb(<term_tree>) ...rest
    }

    // still working on the stack
    case (<term_tree> ...rest, comb, prec, [(comb_stack, prec_stack) stack]) => {
    	enforest(comb(<term_tree>) ...rest, comb_stack, prec_stack, stack)
    }
}


