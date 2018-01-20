const parseDirective = require('..');

test('Can parse a single directive in a file with no errors', () => {
    const { errors, directives } = parseDirective(`
        /**
         * @RootComponent
         * pageTypes = foo, bizz
         */
    `);
    expect(errors.length).toBe(0);
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
