function ConfigParser(content, options) {
    "use strict";
    if (!(this instanceof ConfigParser)) {
        return new ConfigParser(content, options);
    }
    var commentDelims = [
            "#",
            ";",
            "@",
            "//"
        ],
        blockRegexp = /^\s?\[\s?(.*?)\s?\]\s?$/,
        keyValueDelim = "=",
        newLineDelim = "\r\n",
        configObject = {},
        currentBlock,
        currentLine;
    if (typeof options === "object") {
        commentDelims = options.commentDelims || commentDelims;
        blockRegexp = options.blockRegexp || blockRegexp;
        keyValueDelim = options.keyValueDelim || keyValueDelim;
        newLineDelim = options.newLineDelim || newLineDelim;
    }
    content = content.split(newLineDelim);
    content.forEach(function(line) {
        var isComment = false;
        commentDelims.forEach(function(delim) {
            if (line.indexOf(delim) === 0) {
                isComment = true;
            } else {
                return;
            }
        });
        if (isComment) {
            return;
        }
        if (blockRegexp.test(line)) {
            currentBlock = line.replace(blockRegexp, '$1');
            configObject[currentBlock] = {};
            return;
        }
        currentLine = line.split(keyValueDelim);
        if (currentBlock === undefined) {
            configObject[currentLine[0]] = currentLine[1];
        } else {
            configObject[currentBlock][currentLine[0]] = currentLine[1];
        }
    });
    return configObject;
}