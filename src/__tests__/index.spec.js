const parseDirective = require('..');

test('Can parse a single directive in a file with no errors', () => {
    const { errors, directives } = parseDirective(`
        /**
         * @RootComponent
         * pageTypes = foo, bizz
         */
    `);
    expect(errors[0]).toBeFalsy();
    expect(directives.length).toBe(1);
});

test('Can parse a single directive in a file with single-line comments', () => {
    const { errors, directives } = parseDirective(`
        /**
         * @RootComponent
         * pageTypes = foo, bizz
         */
        module.exports = () => {};
        // a single line comment
    `);
    expect(errors[0]).toBeFalsy();
    expect(directives.length).toBe(1);
});

test('Can parse a single directive in a file with source map annotations', () => {
    const { errors, directives } = parseDirective(`
        /**
         * @RootComponent
         * pageTypes = foo, bizz
         */
        module.exports = () => {};
        //# sourceMappingURL=index.js.map
    `);
    expect(errors[0]).toBeFalsy();
    expect(directives.length).toBe(1);
});

test('Can parse a single directive in a file, and report error below it', () => {
    const { errors, directives } = parseDirective(`
        /**
         * @RootComponent
         * pageTypes = foo, bizz
         */

         /**
          * @NonExistentDirective
          */
    `);
    expect(directives.length).toBe(1);
    expect(errors.length).toBe(1);
});

test('Can find directives below a directive error', () => {
    const { errors, directives } = parseDirective(`
        /**
        * @NonExistentDirective
        */

        /**
         * @RootComponent
         * pageTypes = foo, bizz
         */
    `);
    expect(directives.length).toBe(1);
    expect(errors.length).toBe(1);
});
