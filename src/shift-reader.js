import Tokenizer from "shift-parser/dist/tokenizer";
import { TokenClass, TokenType } from "shift-parser/dist/tokenizer";
import { List } from "immutable";
import Syntax from "./syntax";

export default class Reader extends Tokenizer.default {
    constructor(source) {
        super(source);
        this.delimStack = new Map();
    }

    // (?[Syntax]) -> List<Syntax>
    read(stack = []) {
        while (true) {
            let tok = this.advance();

            if (tok.type === TokenType.EOS) {
                break;
            }

            if (tok.type === TokenType.LPAREN ||
                tok.type === TokenType.LBRACK ||
                tok.type === TokenType.LBRACE) {
                let inner = this.read([new Syntax(tok)]);
                stack.push(new Syntax(inner));
            } else if (tok.type === TokenType.RPAREN ||
                       tok.type === TokenType.RBRACK ||
                       tok.type === TokenType.RBRACE) {
                stack.push(new Syntax(tok));
                break;
            } else {
                stack.push(new Syntax(tok));
            }
        }
        return List(stack);
    }
}
