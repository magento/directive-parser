const parseDirective = require('../Parser');

test('Parses a full RootComponent directive', () => {
    const { directive } = parseDirective(`
        @RootComponent
        pageTypes = product_page, product_page_special
        description = 'Basic Product Page'
    `);

    expect(directive.type).toBe('RootComponent');
    expect(directive.pageTypes).toEqual([
        'product_page',
        'product_page_special'
    ]);
    expect(directive.description).toBe('Basic Product Page');
});

test('Parses comments with leading asterisks', () => {
    const { directive } = parseDirective(`
        /**
         * @RootComponent
         */
    `);

    expect(directive.type).toEqual('RootComponent');
});

test('Fails when directive is unrecognized type', () => {
    const { error } = parseDirective('@Unknown');
    expect(error.message).toEqual('Unrecognized Directive: Unknown');
});

test('Fails when string is not terminated', () => {
    const { error } = parseDirective(`
        @RootComponent
        description = "not closed
    `);
    expect(error.message).toBe('Unterminated string encountered');
});

test('Fails when list has dangling comma that creates ambiguity with ident on next line', () => {
    const { error } = parseDirective(`
        @RootComponent
        pageTypes = foo, bizz,
        description = "hey"
    `);
    expect(error.message).toEqual(
        'Encountered illegal assignment in an unterminated list'
    );
});

test('Parses when dangling comma in list does not create ambiguity because EOF', () => {
    const { directive, error } = parseDirective(`
        @RootComponent
        pageTypes = foo, bizz,
    `);
    expect(error).toBeFalsy();
    expect(directive.pageTypes).toEqual(['foo', 'bizz']);
});

test('Parses multiple pieces of metadata on a single line', () => {
    const { directive, error } = parseDirective(`
        @RootComponent pageTypes = foo, bizz description = "some descrip"
    `);

    expect(directive.type).toBe('RootComponent');
    expect(directive.pageTypes).toEqual(['foo', 'bizz']);
    expect(directive.description).toBe('some descrip');
});
