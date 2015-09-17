export default class MacroContext {
    constructor(enf) {
        // todo: perhaps replace with a symbol to keep mostly private?
        this._enf = enf;
    }

    next() {
        return this._enf.advance();
    }
    nextExpression() {
        return this._enf.enforest("expression");
    }
}
