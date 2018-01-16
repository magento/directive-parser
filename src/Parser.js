const Lexer = require('./Lexer');

const ANNOTATIONS = new Set(['RootComponent']);

class Parser {
    constructor(input) {
        this.lexer = new Lexer(input);
        this.tokens = null;
        this.position = 0;
        this.ast = null;
        this.error = null;
    }

    parse() {
        const { tokens, error } = this.lexer.execute();
        if (error) {
            this.error = error;
            return this;
        }

        this.tokens = tokens.slice();
        const node = {
            type: 'MagentoDirective',
            body: []
        };

        this.ast = node;
        this.parseDirectiveBody(node);
        return this;
    }

    get currentToken() {
        const { tokens, position } = this;
        return tokens[position];
    }

    get isDone() {
        return this.position === this.tokens.length;
    }

    parseDirectiveBody(node) {
        while (!this.isDone) {
            const newNode = {};
            switch (true) {
                case this.match('at'):
                    node.body.push(this.parseAnnotation(newNode));
                    break;
                case this.match('identifier'):
                    node.body.push(this.parseLine(newNode));
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

    parseAnnotation(node) {
        this.eat('at');
        node.type = 'annotation';
        node.value = this.eat('identifier').value;
        if (!ANNOTATIONS.has(node.value)) {
            this.reportError(`Unrecognized Directive: ${node.value}`);
        }
        return node;
    }

    parseLine(node) {
        const next = this.peek();
        if ((this.match('assign'), next)) {
            return this.parseAssignment(node);
        }
        this.reportError(`Unexpected identifier "${this.currentToken.value}"`);
    }

    parseAssignment(node) {
        node.lhs = this.eat('identifier');
        this.eat('assign');
        node.type = 'assignment';
        node.rhs = {};

        if (this.match('string')) {
            node.rhs = this.eat();
            return node;
        }

        if (this.match('identifier')) {
            if (this.match('comma', this.peek())) {
                this.parseList(node.rhs);
                return node;
            }

            node.rhs = this.eat();
            return node;
        }

        this.reportError(
            `Unrecognized right-hand side value in assignment of "${
                node.lhs.value
            }". Found: "${this.peek().type}"`
        );
    }

    parseList(node) {
        node.type = 'list';
        const items = (node.items = []);

        while (!this.isDone && this.match('identifier')) {
            items.push(this.eat());
            if (this.isDone) break; // Last item in the list, and last line of directive

            let hasComma = this.eat('comma');
            if (!hasComma && this.match('identifier')) {
                // Last item in a list (no comma), so seeing a new identifier means we're
                // on a new line
                break;
            }

            if (this.isDone) return node;

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

        return node;
    }

    reportError(message) {
        // TODO: Location information
        this.error = { message };
        // Stop processing new tokens
        this.position = this.tokens.length;
    }
}

module.exports = Parser;
