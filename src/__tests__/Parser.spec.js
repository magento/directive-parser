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
    ['bizz', 'bazz', 'buzz'].forEach((word, i) => {
        expect(list.items[i].value).toEqual(word);
    });
});

test('Parses assignment with word as rhs', () => {
    const { ast } = new Parser('foo = bizz').parse();
    const [node] = ast.body;

    expect(node.type).toEqual('assignment');
    expect(node.rhs.type).toEqual('word');
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
