var lexing_1 = require('lexing');
var states_1 = require('./states');
function parseBibTeXEntry(string) {
    var string_iterable = new lexing_1.StringIterator(string);
    return new states_1.BIBFILE_FIRST(string_iterable, 1024).read();
}
exports.parseBibTeXEntry = parseBibTeXEntry;
function parseBibTeXEntries(string) {
    var string_iterable = new lexing_1.StringIterator(string);
    return new states_1.BIBFILE(string_iterable, 1024).read();
}
exports.parseBibTeXEntries = parseBibTeXEntries;
function parseNode(tex) {
    var string_iterable = new lexing_1.StringIterator(tex);
    // skip over the initial {
    string_iterable.skip(1);
    return new states_1.TEX(string_iterable).read();
}
exports.parseNode = parseNode;
function extractCitekeys(tex) {
    var citekeys = [];
    // super-simple regular expression solution (doesn't detect commented-out citations)
    var cite_regexp = /\\\w*cite\w*\{([^}]+)\}/g;
    var match;
    while ((match = cite_regexp.exec(tex)) !== null) {
        var match_citekeys = match[1].split(',');
        Array.prototype.push.apply(citekeys, match_citekeys);
    }
    return citekeys;
}
exports.extractCitekeys = extractCitekeys;
