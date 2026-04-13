/**
 * Removes tags used by the lib html sanitizer module.
 * @param {string} html The html value provides an input used by the lib html sanitizer module.
 * @module
 * @returns {string} Returns the value produced by the lib html sanitizer module.
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