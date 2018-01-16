const Parser = require('../Parser');

test('Parses directive', () => {
    const { ast } = new Parser('@RootComponent').parse();
    const [node] = ast.body;

    expect(node.type).toEqual('annotation');
    expect(node.value).toEqual('RootComponent');
});

test('Parses assignment with list as rhs', () => {
    const { ast } = new Parser('foo = bizz, bazz, buzz').parse();
    const [node] = ast.body;

    expect(node.type).toEqual('assignment');

    const list = node.rhs;
    expect(list.type).toEqual('list');
    ['bizz', 'bazz', 'buzz'].forEach((ident, i) => {
        expect(list.items[i].value).toEqual(ident);
    });
});

test('Parses assignment with identifier as rhs', () => {
    const { ast } = new Parser('foo = bizz').parse();
    const [node] = ast.body;

    expect(node.type).toEqual('assignment');
    expect(node.rhs.type).toEqual('identifier');
    expect(node.rhs.value).toEqual('bizz');
});

test('Parses assignment with string as rhs', () => {
    const str = 'str!ng with rand0m chars 😎';
    const { ast } = new Parser(`foo = "${str}"`).parse();
    const [node] = ast.body;

    expect(node.type).toEqual('assignment');
    expect(node.rhs.type).toEqual('string');
    expect(node.rhs.value).toEqual(str);
});

test('Parses comments with leading asterisks', () => {
    const { ast } = new Parser(`
        /**
         * @RootComponent
         */
    `).parse();
    const [node] = ast.body;

    expect(node.type).toEqual('annotation');
    expect(node.value).toEqual('RootComponent');
});

test('Parses the kitchen sink', () => {
    const { ast } = new Parser(`
        /**
         * @RootComponent
         * foo = bizz, bazz, buzz
         * bar = car
         * jar = "test"
         */
    `).parse();
    expect(ast).toMatchSnapshot();
});

test('Fails when directive is unrecognized type', () => {
    const { error } = new Parser('@Unknown').parse();
    expect(error.message).toEqual('Unrecognized Directive: Unknown');
});

test('Fails when string is not terminated', () => {
    const { error } = new Parser('foo = "bar').parse();
    expect(error.message).toBe('Unterminated string encountered');
});

test('Fails when list has dangling comma that creates ambiguity with ident on next line', () => {
    const { error } = new Parser(`
        @RootComponent
        pageTypes = foo, bizz,
        description = "hey"
    `).parse();
    expect(error.message).toEqual(
        'Encountered illegal assignment in an unterminated list'
    );
});

test('Parses when dangling comma in list does not create ambiguity because EOF', () => {
    const { ast } = new Parser(`
        @RootComponent
        pageTypes = foo, bizz,
    `).parse();
    const [, node] = ast.body;
    expect(node.type).toEqual('assignment');
    expect(node.rhs.items.length).toEqual(2);
});

test('Parses multiple pieces of metadata on a single line', () => {
    const { ast: { body }, error } = new Parser(`
        @RootComponent pageTypes = foo, bizz description = "test"
    `).parse();

    const [first, second, third] = body;
    expect(first.type).toEqual('annotation');
    expect(first.value).toEqual('RootComponent');

    expect(second.type).toEqual('assignment');
    expect(second.rhs.items.length).toEqual(2);

    expect(third.type).toEqual('assignment');
    expect(third.rhs.value).toEqual('test');
});
