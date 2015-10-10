export default class MacroContext {
    constructor(enf, name) {
        // todo: perhaps replace with a symbol to keep mostly private?
        this._enf = enf;
        this.name = name;
    }

    next() {
        return this._enf.advance();
    }
    nextExpression() {
        return this._enf.enforest("expression");
    }
}
