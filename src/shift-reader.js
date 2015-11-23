import Tokenizer, { TokenClass, TokenType } from "shift-parser/dist/tokenizer";
import { List } from "immutable";

export default class Reader extends Tokenizer.default {
    constructor(source) {
        super(source);
    }

    read() {
        let arr = [];
        while (true) {
            let tok = this.advance();

            if (tok.type === TokenType.EOS) {
                break;
            }

            arr.push(tok);
        }
        return List(arr);
    }
}
