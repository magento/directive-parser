const Lexer = require('./Lexer');

const ANNOTATIONS = new Set(['RootComponent']);

/**
 * Parses a Magento PWA Studio Directive, and generates an descriptor.
 */
class Parser {
    constructor(input, opts = {}) {
        const { start = 0, end = input.length } = opts;

        this.lexer = new Lexer({ input, start, end });
        this.tokens = null;
        this.position = 0;
        this.directive = null;
        this.error = null;
    }

    parse() {
        const { tokens, error } = this.lexer.execute();
        if (error) {
            this.error = error;
            return this;
        }

        this.tokens = tokens.slice();

        this.directive = {};
        this.parseDirective();
        return this;
    }

    get currentToken() {
        const { tokens, position } = this;
        return tokens[position];
    }

    get isDone() {
        return this.position === this.tokens.length;
    }

    parseDirective() {
        if (!this.match('at')) {
            this.directive = null;
            return;
        }

        while (!this.isDone) {
            switch (true) {
                case this.match('at'):
                    this.parseAnnotation();
                    break;
                case this.match('identifier'):
                    this.parseLine();
                    break;
                default:
                    this.reportError(
                        `Unknown top-level token of type "${
                            this.currentToken.type
                        }" encounted`
                    );
            }
        }
    }

    match(type, token = this.currentToken) {
        return token.type === type;
    }

    eat(type) {
        if (!type || this.currentToken.type === type) {
            const token = this.currentToken;
            ++this.position;
            return token;
        }
    }

    peek() {
        const { tokens, position } = this;
        return tokens[position + 1];
    }

    parseAnnotation() {
        this.eat('at');
        const directiveType = (this.directive.type = this.eat(
            'identifier'
        ).value);
        if (!ANNOTATIONS.has(directiveType)) {
            this.reportError(`Unrecognized Directive: ${directiveType}`);
        }
    }

    parseLine() {
        const next = this.peek();
        if (this.match('assign', next)) {
            return this.parseAssignment();
        }
        this.reportError(`Unexpected identifier "${this.currentToken.value}"`);
    }

    parseAssignment() {
        const lhsIdentifier = this.eat('identifier').value;
        this.eat('assign');

        if (this.match('string')) {
            this.directive[lhsIdentifier] = this.eat().value;
            return;
        }

        if (this.match('identifier')) {
            this.parseList(lhsIdentifier);
            return;
        }

        this.reportError(
            `Unrecognized right-hand side value in assignment of "${lhsIdentifier}". Found: "${
                this.peek().type
            }"`
        );
    }

    parseList(lhsIdentifier) {
        const items = (this.directive[lhsIdentifier] = []);

        while (!this.isDone && this.match('identifier')) {
            items.push(this.eat().value);
            if (this.isDone) break; // Last item in the list, and last line of directive

            let hasComma = this.eat('comma');
            if (!hasComma && this.match('identifier')) {
                // Last item in a list (no comma), so seeing a new identifier means we're
                // on a new line
                break;
            }

            if (this.isDone) return;

            // Dangling comma not allowed when it would create ambiguity with next
            // token
            if (hasComma && this.match('assign', this.peek())) {
                this.reportError(
                    'Encountered illegal assignment in an unterminated list'
                );
            }
        }

        if (!this.isDone && this.match('comma')) {
            this.reportError('Unterminated list encountered');
        }
    }

    reportError(message) {
        // TODO: Location information
        const error = (this.error = new Error(message));
        this.directive = null;
        // Stop processing new tokens
        this.position = this.tokens.length;
    }
}

/**
 * @param {string} input
 * @param {object} opts
 * @param {number?} opts.start - Starting location. If parsing a specific comment, pass in start index
 * @param {number?} opts.end - Ending location. If parsing a speific comment, pass in end index
 */
module.exports = (input, opts = {}) => {
    const { directive, error } = new Parser(input, opts).parse();
    return { directive, error };
};
