const reWhitespace = /\s/;
const reIdentifierChar = /[\w-]/;
const reNewLine = /\n/;

class Lexer {
    constructor({ input, start, end }) {
        this.input = input;
        this.position = start;
        this.end = end;
        this.tokens = [];
        this.error = null;
    }

    execute() {
        this.readToken();
        return {
            tokens: this.tokens,
            error: this.error
        };
    }

    get isDone() {
        return this.position >= this.end;
    }

    get currentChar() {
        return this.input.charAt(this.position);
    }

    finishToken({ type, value, range: [start, end] }) {
        const { input } = this;
        this.tokens.push({
            type,
            value,
            // Lazily calculate just when needed
            get location() {
                return {
                    start: positionFromIndex(start, input),
                    end: positionFromIndex(end, input)
                };
            }
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

        if (reIdentifierChar.test(this.currentChar)) this.readIdentifier();
        else this.readNextToken();
    }

    readNextToken() {
        const { position } = this;
        switch (this.currentChar) {
            case "'":
            case '"':
                this.parseString();
                return;
            case '@':
                this.eat();
                this.finishToken({
                    type: 'at',
                    range: [position - 1, position]
                });
                return;
            case '=':
                this.eat();
                this.finishToken({
                    type: 'assign',
                    range: [position - 1, position]
                });
                return;
            case ',':
                this.eat();
                this.finishToken({
                    type: 'comma',
                    range: [position - 1, position]
                });
                return;
            case '*':
            case '/':
                this.eat();
                return this.readToken();
            default:
                this.reportError(`Unknown token "${this.currentChar}"`);
        }
    }

    parseString() {
        const start = this.position;
        const openQuoteChar = this.eat();
        const buf = [];

        while (!this.match(openQuoteChar)) {
            if (this.match(reNewLine) || this.isDone) {
                return this.reportError(`Unterminated string encountered`);
            }

            buf.push(this.eat());
        }

        this.eat(openQuoteChar);
        this.finishToken({
            type: 'string',
            value: buf.join(''),
            range: [start, this.position]
        });
    }

    readIdentifier() {
        const start = this.position;
        const buf = [];

        while (this.match(reIdentifierChar)) buf.push(this.eat());

        this.finishToken({
            type: 'identifier',
            value: buf.join(''),
            range: [start, this.position]
        });
    }

    reportError(msg) {
        const { position, input } = this;
        const location = positionFromIndex(position, input);
        const error = (this.error = new Error(msg));
        error.location = { start: location };
        // End lexing
        this.position = this.end;
    }
}

function positionFromIndex(index, str) {
    const beforeStartStr = str.substring(0, index);
    const lines = beforeStartStr.split('\n');
    const column = lines[lines.length - 1].length;

    return { line: lines.length, column };
}

module.exports = Lexer;
