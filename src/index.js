const DirectiveParser = require('./Parser');
const parseESComments = require('es-comments');

module.exports = function parseDirectives(inputJS) {
    const comments = parseESComments(inputJS);

    const results = {
        directives: [],
        errors: []
    };
    const directiveComments = comments.reduce((acc, comment) => {
        const { error, ast } = new DirectiveParser({
            // Give the parser the whole string, rather than just the comment,
            // so it can calculate proper location info
            input: inputJS,
            // Start/end parse at comment's offsets
            start: comment.start,
            end: comment.end - 1 // TODO: Figure out this off by 1 err
        }).parse();

        if (error) {
            results.errors.push(error);
        } else {
            results.directives.push(ast);
        }

        return results;
    }, results);

    return results;
};
