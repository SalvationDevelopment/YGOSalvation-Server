/**
 * Sanitizes HTML facing strings.
 * @module
 * @param {String} html unsanitized user input.
 * @returns {String} sanitized user input.
 */
function removeTags(html) {

    var oldHtml,
        tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*',
        tagOrComment = new RegExp(
            '<(?:' + '!--(?:(?:-*[^->])*--+|-?)|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*' + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*' + '|/?[a-z]' + tagBody + ')>',
            'gi'
        );
    do {
        oldHtml = html;
        html = html.replace(tagOrComment, '');
    } while (html !== oldHtml);
    return html.replace(/</g, '&lt;');
}

module.exports = removeTags;