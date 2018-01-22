const parseDirective = require('./Parser');
const parseESComments = require('es-comments');

module.exports = function parseDirectives(inputJS) {
    const comments = parseESComments(inputJS);

    const results = {
        directives: [],
        errors: []
    };
    const directiveComments = comments.reduce((acc, comment) => {
        const { error, directive } = parseDirective(
            // Give the parser the whole string, rather than just the comment,
            // so it can calculate proper location info
            inputJS,
            {
                // Start/end parse at comment's offsets
                start: comment.start,
                end: comment.end - 1 // TODO: Figure out this off by 1 err
            }
        );

        if (error) {
            results.errors.push(error);
        }

        if (directive) {
            results.directives.push(directive);
        }

        return results;
    }, results);

    return results;
};
