/**
 * MIRC compliant colour and style parser
 * Unfortuanately this is a non trivial operation
 * See https://github.com/megawac/irc-style-parser
 */
var styleCheck_Re = /[\x00-\x1F]/,
    back_re = /^(\d{1,2})(,(\d{1,2}))?/,
    colourKey = "\x03", colour_re = /\x03/g,
    // breaks all open styles ^O (\x0F)
    styleBreak = "\x0F";

var ircStylize = function stylize(line) { // more like stylize
    // http://www.mirc.com/colors.html
    // http://www.aviran.org/stripremove-irc-client-control-characters/
    // https://github.com/perl6/mu/blob/master/examples/rules/Grammar-IRC.pm
    // regexs are cruel to parse this thing

    // already done?
    if (!styleCheck_Re.test(line)) return line;

    // split up by the irc style break character ^O
    if (line.indexOf(styleBreak) >= 0) {
        return line.split(styleBreak).map(stylize).join("");
    }

    var result = line;
    var parseArr = result.split(colourKey);
    var text, match, colour, background = "";
    for (var i = 0; i < parseArr.length; i++) {
        text = parseArr[i];
        match = text.match(back_re);
        colour = match && irc.colours[+match[1]];
        if (!match || !colour) {
            // ^C (no colour) ending. Escape current colour and carry on
            background = "";
            continue;
        }
        // set the background colour
        // we don't overide the background local var to support nesting
        if (irc.colours[+match[3]]) {
            background = " " + irc.colours[+match[3]].back;
        }
        // update the parsed text result
        result = result.replace(colourKey + text, irc.template({
            style: colour.fore + background,
            text: text.slice(match[0].length)
        }));
    }

    // Matching styles (italics/bold/underline)
    // if only colours were this easy...
    irc.styles.forEach(function(style) {
        if (result.indexOf(style.key) < 0) return;
        result = result.replace(style.keyregex, function(match, text) {
            return irc.template({
                "style": style.style,
                "text": text
            });
        });
    });

    //replace the reminent colour terminations and be done with it
    return result.replace(colour_re, "");
};

irc.template = function(settings) {
    return "<span class='" + settings.style + "'>" + settings.text + "</span>";
};

irc.styles = [
    ["normal", "\x00", ""], ["underline", "\x1F"],
    ["bold", "\x02"], ["italic", "\x1D"]
].map(function(style) {
    var escaped = encodeURI(style[1]).replace("%", "\\x");
    return {
        name: style[0],
        style: style[2] != null ? style[2] : "irc-" + style[0],
        key: style[1],
        keyregex: new RegExp(escaped + "(.*?)(" + escaped + "|$)")
    };
});

//http://www.mirc.com/colors.html
irc.colours = [
    "white", "black", "navy", "green", "red", "brown",
    "purple", "olive", "yellow", "lightgreen", "teal",
    "cyan", "blue", "pink", "gray", "lightgrey"
].reduce(function(memo, name, index) {
    memo[index] = {
        name: name,
        fore: "irc-fg" + index,
        back: "irc-bg" + index,
        key: index
    };
    return memo;
}, {});
