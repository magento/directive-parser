const Lexer = require('./Lexer');

const ANNOTATIONS = new Set(['RootComponent']);

class Parser {
    constructor(input) {
        this.lexer = new Lexer(input);
        this.tokens = null;
        this.position = 0;
        this.ast = null;
    }

    parse() {
        const tokens = this.lexer.execute();
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
                case this.match('word'):
                    node.body.push(this.parseLine(newNode));
                    break;
                default:
                    this.throwParseError(
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
        node.value = this.eat('word').value;
        if (!ANNOTATIONS.has(node.value)) {
            this.throwParseError(`Unrecognized Directive: ${node.value}`);
        }
        return node;
    }

    parseLine(node) {
        const next = this.peek();
        if ((this.match('assign'), next)) {
            return this.parseAssignment(node);
        }
        this.throwParseError(`Unexpected word "${this.currentToken.value}"`);
    }

    parseAssignment(node) {
        node.lhs = this.eat('word');
        this.eat('assign');
        node.type = 'assignment';
        node.rhs = {};

        if (this.match('string')) {
            node.rhs = this.eat();
            return node;
        }

        if (this.match('word')) {
            if (this.match('comma', this.peek())) {
                this.parseList(node.rhs);
                return node;
            }

            node.rhs = this.eat();
            return node;
        }

        this.throwParseError(
            `Unrecognized right-hand side value in assignment of "${
                node.lhs.value
            }". Found: "${this.peek().type}"`
        );
    }

    parseList(node) {
        node.type = 'list';
        const items = (node.items = []);

        while (!this.isDone && this.match('word')) {
            items.push(this.eat());
            if (this.isDone) break;
            const hasComma = this.eat('comma');
            if (!hasComma && this.match('word')) {
                break;
            }

            if (!this.isDone) this.eat('comma');
        }

        if (!this.isDone && this.match('comma')) {
            this.throwParseError('Unterminated list encountered');
        }

        return node;
    }

    throwParseError(msg) {
        throw new Error(msg);
    }
}

module.exports = Parser;
