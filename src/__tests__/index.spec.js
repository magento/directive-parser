const parseDirectives = require('..');

test('Can parse a single directive in a file with no errors', () => {
    const { errors, directives } = parseDirectives(`
        /**
         * @RootComponent
         * pageTypes = foo, bizz
         */
    `);
    expect(errors.length).toBe(0);
    expect(directives.length).toBe(1);
});

test('Can parse a single directive in a file, and report error below it', () => {
    const { errors, directives } = parseDirectives(`
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
    const { errors, directives } = parseDirectives(`
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
