const reWhitespace = /\s/;
const reWordChar = /[\w-]/;
const reNewLine = /\n/;

class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.tokens = [];
    }

    execute() {
        this.readToken();
        return this.tokens;
    }

    get isDone() {
        return this.position >= this.input.length;
    }

    get currentChar() {
        return this.input.charAt(this.position);
    }

    get location() {
        const beforePos = this.input.substring(0, this.position);
        const rows = beforePos.split('\n');
        const column = rows[rows.length - 1].length;

        return { line: rows.length, column };
    }

    finishToken({ type, value }) {
        this.tokens.push({
            type,
            value,
            location: this.location
        });
        this.readToken();
    }

    eat(matcher) {
        const char = this.currentChar;

        if (matcher === undefined) {
            ++this.position;
            return char;
        }

        const matched = this.match(matcher);
        if (matched) ++this.position;

        return char;
    }

    match(matcher) {
        const char = this.currentChar;
        const found =
            typeof matcher === 'string'
                ? matcher === char
                : matcher.test && matcher.test(char);

        return !!found;
    }

    eatWhitespace() {
        const { input, position: start } = this;
        while (reWhitespace.test(this.currentChar)) this.position++;
        return this.position - start;
    }

    readToken() {
        this.eatWhitespace();
        if (this.isDone) return;

        if (reWordChar.test(this.currentChar)) this.readWord();
        else this.readNextToken();
    }

    readNextToken() {
        switch (this.currentChar) {
            case "'":
            case '"':
                this.parseString();
                return;
            case '@':
                this.eat();
                this.finishToken({ type: 'at' });
                return;
            case '=':
                this.eat();
                this.finishToken({ type: 'assign' });
                return;
            case ',':
                this.eat();
                this.finishToken({ type: 'comma' });
            case '*':
            case '/':
                this.eat();
                return this.readToken();
            default:
                this.throwLexError(`Unknown token "${this.currentChar}"`);
        }
    }

    parseString() {
        const openQuoteChar = this.eat();
        const buf = [];

        while (!this.match(openQuoteChar)) {
            if (this.match(reNewLine)) {
                return this.throwLexError(
                    `Expected string to terminate, but instead found newline`
                );
            }

            buf.push(this.eat());
        }

        this.eat(openQuoteChar);
        this.finishToken({
            type: 'string',
            value: buf.join('')
        });
    }

    readWord() {
        const buf = [];

        while (this.match(reWordChar)) buf.push(this.eat());

        this.finishToken({
            type: 'word',
            value: buf.join('')
        });
    }

    throwLexError(msg) {
        const { location } = this;
        throw new Error(
            `Parse error at ${location.line}:${location.column} - ${msg}`
        );
    }
}

module.exports = Lexer;
